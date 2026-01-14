-- ============================================
-- transition_bp_comment.sql
-- Purpose: Store BP comments inline in bp payload (no separate note event),
--          plus CKD stage whitelist validation for lab_event.
-- Safe: No table drops. Updates validation trigger + bp view only.
-- ============================================

begin;

-- (1) Update validation function to allow optional bp.payload.comment
create or replace function public.trg_events_validate()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  keys text[];
  has_kg boolean;
  has_cm boolean;
begin
  if new.ts is null then
    raise exception 'ts darf nicht NULL sein' using errcode = '23514';
  end if;

  if new.type = 'bp' then
    keys := array['sys','dia','pulse','ctx','comment'];
    if exists (select 1 from jsonb_object_keys(new.payload) as t(k) where k <> all(keys)) then
      raise exception 'bp: payload enthaelt unbekannte Keys' using errcode = '22023';
    end if;

    if not (new.payload ? 'sys') then
      raise exception 'bp: payload.sys (Pflicht) fehlt' using errcode = '23502';
    end if;
    if not (new.payload ? 'dia') then
      raise exception 'bp: payload.dia (Pflicht) fehlt' using errcode = '23502';
    end if;
    if not (new.payload ? 'ctx') then
      raise exception 'bp: payload.ctx (Pflicht) fehlt' using errcode = '23502';
    end if;

    if (new.payload->>'sys') !~ '^\d+$' or (new.payload->>'sys')::int < 70 or (new.payload->>'sys')::int > 260 then
      raise exception 'bp.sys ausserhalb Range 70-260' using errcode = '22003';
    end if;
    if (new.payload->>'dia') !~ '^\d+$' or (new.payload->>'dia')::int < 40 or (new.payload->>'dia')::int > 160 then
      raise exception 'bp.dia ausserhalb Range 40-160' using errcode = '22003';
    end if;
    if (new.payload ? 'pulse') then
      if (new.payload->>'pulse') !~ '^\d+$' or (new.payload->>'pulse')::int < 35 or (new.payload->>'pulse')::int > 200 then
        raise exception 'bp.pulse ausserhalb Range 35-200' using errcode = '22003';
      end if;
    end if;

    if (new.payload ? 'comment') then
      if length(btrim(new.payload->>'comment')) < 1 or length(new.payload->>'comment') > 500 then
        raise exception 'bp.comment Laenge 1-500 Zeichen' using errcode = '22023';
      end if;
    end if;
    
    if (new.payload->>'ctx') not in ('Morgen','Abend') then
      raise exception 'bp.ctx muss "Morgen" or "Abend" sein' using errcode = '22023';
    end if;
    new.ctx := new.payload->>'ctx';

  elsif new.type = 'body' then
    keys := array['kg','cm','fat_pct','muscle_pct'];
    if exists (select 1 from jsonb_object_keys(new.payload) as t(k) where k <> all(keys)) then
      raise exception 'body: payload enthaelt unbekannte Keys' using errcode = '22023';
    end if;

    has_kg := new.payload ? 'kg';
    has_cm := new.payload ? 'cm';
    if not (has_kg or has_cm) then
      raise exception 'body: mind. einer von kg or cm ist Pflicht' using errcode = '23502';
    end if;

    if has_kg then
      if (new.payload->>'kg') !~ '^\d+(\.\d+)?$' or (new.payload->>'kg')::numeric < 40 or (new.payload->>'kg')::numeric > 250 then
        raise exception 'body.kg ausserhalb Range 40-250' using errcode = '22003';
      end if;
    end if;

    if has_cm then
      if (new.payload->>'cm') !~ '^\d+(\.\d+)?$' or (new.payload->>'cm')::numeric < 50 or (new.payload->>'cm')::numeric > 200 then
        raise exception 'body.cm ausserhalb Range 50-200' using errcode = '22003';
      end if;
    end if;

    if (new.payload ? 'fat_pct') then
      if (new.payload->>'fat_pct') !~ '^\d+(\.\d+)?$' or (new.payload->>'fat_pct')::numeric < 0 or (new.payload->>'fat_pct')::numeric > 100 then
        raise exception 'body.fat_pct ausserhalb Range 0-100' using errcode = '22003';
      end if;
    end if;

    if (new.payload ? 'muscle_pct') then
      if (new.payload->>'muscle_pct') !~ '^\d+(\.\d+)?$' or (new.payload->>'muscle_pct')::numeric < 0 or (new.payload->>'muscle_pct')::numeric > 100 then
        raise exception 'body.muscle_pct ausserhalb Range 0-100' using errcode = '22003';
      end if;
    end if;

  elsif new.type = 'note' then
    keys := array['text'];
    if exists (select 1 from jsonb_object_keys(new.payload) as t(k) where k <> all(keys)) then
      raise exception 'note: payload enthaelt unbekannte Keys' using errcode = '22023';
    end if;

    if not (new.payload ? 'text') then
      raise exception 'note: payload.text fehlt' using errcode = '23502';
    end if;
    if length(new.payload->>'text') < 1 or length(new.payload->>'text') > 2000 then
      raise exception 'note.text Laenge 1-2000 Zeichen' using errcode = '22023';
    end if;

  elsif new.type = 'intake' then
    keys := array['water_ml','salt_g','protein_g'];
    if exists (select 1 from jsonb_object_keys(new.payload) as t(k) where k <> all(keys)) then
      raise exception 'intake: payload enthaelt unbekannte Keys' using errcode = '22023';
    end if;

    if jsonb_typeof(new.payload) <> 'object' then
      raise exception 'intake: payload muss Objekt sein' using errcode = '23502';
    end if;
    if not ((new.payload ? 'water_ml') or (new.payload ? 'salt_g') or (new.payload ? 'protein_g')) then
      raise exception 'intake: mindestens ein Wert erforderlich' using errcode = '23502';
    end if;

    if (new.payload ? 'water_ml') then
      if (new.payload->>'water_ml') !~ '^\d+(\.\d+)?$' then
        raise exception 'intake.water_ml muss Zahl sein' using errcode = '22023';
      end if;
      if (new.payload->>'water_ml')::numeric < 0 or (new.payload->>'water_ml')::numeric > 6000 then
        raise exception 'intake.water_ml ausserhalb Range 0-6000' using errcode = '22003';
      end if;
    end if;

    if (new.payload ? 'salt_g') then
      if (new.payload->>'salt_g') !~ '^\d+(\.\d+)?$' then
        raise exception 'intake.salt_g muss Zahl sein' using errcode = '22023';
      end if;
      if (new.payload->>'salt_g')::numeric < 0 or (new.payload->>'salt_g')::numeric > 30 then
        raise exception 'intake.salt_g ausserhalb Range 0-30' using errcode = '22003';
      end if;
    end if;

    if (new.payload ? 'protein_g') then
      if (new.payload->>'protein_g') !~ '^\d+(\.\d+)?$' then
        raise exception 'intake.protein_g muss Zahl sein' using errcode = '22023';
      end if;
      if (new.payload->>'protein_g')::numeric < 0 or (new.payload->>'protein_g')::numeric > 99999999999 then
        raise exception 'intake.protein_g ausserhalb Range 0-99999999999' using errcode = '22003';
      end if;
    end if;

  elsif new.type = 'lab_event' then
    keys := array['egfr','creatinine','hba1c','ldl','comment','potassium','ckd_stage'];
    if exists (select 1 from jsonb_object_keys(new.payload) as t(k) where k <> all(keys)) then
      raise exception 'lab_event: payload enthaelt unbekannte Keys' using errcode = '22023';
    end if;

    if nullif(btrim(new.payload->>'egfr'), '') is not null then
      if (new.payload->>'egfr') !~ '^\d+(\.\d+)?$' then
        raise exception 'lab_event: egfr muss numerisch sein' using errcode = '22023';
      end if;
      if (new.payload->>'egfr')::numeric < 0 or (new.payload->>'egfr')::numeric > 200 then
        raise exception 'lab_event: egfr ausserhalb Range 0-200' using errcode = '22003';
      end if;
    end if;

    if nullif(btrim(new.payload->>'creatinine'), '') is not null then
      if (new.payload->>'creatinine') !~ '^\d+(\.\d+)?$' then
        raise exception 'lab_event: creatinine muss numerisch sein' using errcode = '22023';
      end if;
      if (new.payload->>'creatinine')::numeric < 0.1 or (new.payload->>'creatinine')::numeric > 20 then
        raise exception 'lab_event: creatinine ausserhalb Range 0.1-20' using errcode = '22003';
      end if;
    end if;

    if nullif(btrim(new.payload->>'hba1c'), '') is not null then
      if (new.payload->>'hba1c') !~ '^\d+(\.\d+)?$' then
        raise exception 'lab_event: hba1c muss numerisch sein' using errcode = '22023';
      end if;
      if (new.payload->>'hba1c')::numeric < 3 or (new.payload->>'hba1c')::numeric > 99 then
        raise exception 'lab_event: hba1c ausserhalb Range 3-99' using errcode = '22003';
      end if;
    end if;

    if nullif(btrim(new.payload->>'ldl'), '') is not null then
      if (new.payload->>'ldl') !~ '^\d+(\.\d+)?$' then
        raise exception 'lab_event: ldl muss numerisch sein' using errcode = '22023';
      end if;
      if (new.payload->>'ldl')::numeric < 0 or (new.payload->>'ldl')::numeric > 600 then
        raise exception 'lab_event: ldl ausserhalb Range 0-600' using errcode = '22003';
      end if;
    end if;

    if nullif(btrim(new.payload->>'comment'), '') is not null then
      if length(new.payload->>'comment') > 500 then
        raise exception 'lab_event: comment Laenge 1-500 Zeichen' using errcode = '22023';
      end if;
    end if;
    if nullif(btrim(new.payload->>'potassium'), '') is not null then
      if (new.payload->>'potassium') !~ '^\d+(\.\d+)?$' then
        raise exception 'lab_event: potassium muss numerisch sein' using errcode = '22023';
      end if;
      if (new.payload->>'potassium')::numeric < 2 or (new.payload->>'potassium')::numeric > 7 then
        raise exception 'lab_event: potassium ausserhalb Range 2-7' using errcode = '22003';
      end if;
    end if;
    if nullif(btrim(new.payload->>'ckd_stage'), '') is not null then
      if length(new.payload->>'ckd_stage') > 20 then
        raise exception 'lab_event: ckd_stage zu lang (max 20 Zeichen)' using errcode = '22023';
      end if;
      if (new.payload->>'ckd_stage') not in (
        'G1', 'G2', 'G3a', 'G3b', 'G4', 'G5',
        'G1 A1', 'G1 A2', 'G1 A3',
        'G2 A1', 'G2 A2', 'G2 A3',
        'G3a A1', 'G3a A2', 'G3a A3',
        'G3b A1', 'G3b A2', 'G3b A3',
        'G4 A1', 'G4 A2', 'G4 A3',
        'G5 A1', 'G5 A2', 'G5 A3'
      ) then
        raise exception 'lab_event: ckd_stage Format erwartet z.B. "G3a A2"' using errcode = '22023';
      end if;
    end if;

  elsif new.type = 'activity_event' then
    keys := array['activity','duration_min','note'];
    if exists (select 1 from jsonb_object_keys(new.payload) as t(k) where k <> all(keys)) then
      raise exception 'activity_event: payload enthaelt unbekannte Keys' using errcode = '22023';
    end if;

    if not (new.payload ? 'activity') then
      raise exception 'activity_event: payload.activity (Pflicht) fehlt' using errcode = '23502';
    end if;
    if length(btrim(new.payload->>'activity')) < 1 or length(new.payload->>'activity') > 200 then
      raise exception 'activity_event: activity Laenge 1-200 Zeichen' using errcode = '22023';
    end if;

    if not (new.payload ? 'duration_min') then
      raise exception 'activity_event: payload.duration_min (Pflicht) fehlt' using errcode = '23502';
    end if;
    if (new.payload->>'duration_min') !~ '^\d+$' then
      raise exception 'activity_event: duration_min muss int sein' using errcode = '22023';
    end if;
    if (new.payload->>'duration_min')::int < 1 then
      raise exception 'activity_event: duration_min muss >= 1 sein' using errcode = '22023';
    end if;

    if (new.payload ? 'note') then
      if length(new.payload->>'note') < 1 or length(new.payload->>'note') > 500 then
        raise exception 'activity_event: note Laenge 1-500 Zeichen' using errcode = '22023';
      end if;
    end if;

  elsif new.type = 'system_comment' then
    if jsonb_typeof(new.payload) <> 'object' then
      raise exception 'system_comment: payload muss Objekt sein' using errcode = '23502';
    end if;

  else
    raise exception 'unbekannter type: %', new.type using errcode = '22023';
  end if;

  return new;
end;
$$;

-- (2) Ensure trigger uses latest validation function
drop trigger if exists trg_events_validate_biu on public.health_events;
create trigger trg_events_validate_biu
  before insert or update on public.health_events
  for each row execute function public.trg_events_validate();

-- (3) Expose comment in bp view
create or replace view public.v_events_bp
  with (security_invoker = on)
as
select
  e.id,
  e.user_id,
  e.ts,
  e.day,
  e.ctx,
  (e.payload->>'sys')::int   as sys,
  (e.payload->>'dia')::int   as dia,
  (e.payload->>'pulse')::int as pulse,
  e.payload->>'comment'       as comment
from public.health_events e
where e.type = 'bp';

commit;

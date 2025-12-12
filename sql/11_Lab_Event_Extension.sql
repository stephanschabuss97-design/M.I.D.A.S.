-- ============================================
-- 11_Lab_Event_Extension.sql
-- Adds lab_event type support to health_events (constraint + trigger validation).
-- ============================================

begin;

-- (A) Extend type constraint to allow lab_event
alter table public.health_events
  drop constraint if exists health_events_type_check;

alter table public.health_events
  add constraint health_events_type_check
    check (type in ('bp','body','note','intake','lab_event','system_comment'));

-- (B) Ensure lab_event rows remain unique per user/day
create unique index if not exists uq_events_lab_per_day
  on public.health_events (user_id, day, type)
  where type = 'lab_event';

-- (C) Update table comment to include lab events
comment on table public.health_events is
  'Event-Log (bp/body/note/intake/lab_event/system_comment) mit RLS, Unique je Tag/Type(+ctx), Validierungs-Trigger und Europe/Vienna-Tageslogik.';

-- (D) Update validation trigger (adds lab_event payload rules)
create or replace function public.trg_events_validate()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  keys text[];
  has_kg boolean;
  has_cm boolean;
  g_stage text;
  a_stage text;
  derived_ckd text;
begin
  if new.ts is null then
    raise exception 'ts darf nicht NULL sein' using errcode = '23514';
  end if;

  if new.type = 'bp' then
    keys := array['sys','dia','pulse','ctx'];
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

    if (new.payload->>'ctx') not in ('Morgen','Abend') then
      raise exception 'bp.ctx muss "Morgen" oder "Abend" sein' using errcode = '22023';
    end if;
    new.ctx := new.payload->>'ctx';

  elsif new.type = 'body' then
    keys := array['kg','cm'];
    if exists (select 1 from jsonb_object_keys(new.payload) as t(k) where k <> all(keys)) then
      raise exception 'body: payload enthaelt unbekannte Keys' using errcode = '22023';
    end if;

    has_kg := new.payload ? 'kg';
    has_cm := new.payload ? 'cm';
    if not (has_kg or has_cm) then
      raise exception 'body: mind. einer von kg oder cm ist Pflicht' using errcode = '23502';
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
      if (new.payload->>'protein_g')::numeric < 0 or (new.payload->>'protein_g')::numeric > 300 then
        raise exception 'intake.protein_g ausserhalb Range 0-300' using errcode = '22003';
      end if;
    end if;

  elsif new.type = 'lab_event' then
    keys := array['egfr','creatinine','albuminuria_stage','hba1c','ldl','comment','ckd_stage','potassium'];
    if exists (select 1 from jsonb_object_keys(new.payload) as t(k) where k <> all(keys)) then
      raise exception 'lab_event: payload enthaelt unbekannte Keys' using errcode = '22023';
    end if;

    if not (new.payload ? 'egfr') then
      raise exception 'lab_event: payload.egfr (Pflicht) fehlt' using errcode = '23502';
    end if;
    if not (new.payload ? 'creatinine') then
      raise exception 'lab_event: payload.creatinine (Pflicht) fehlt' using errcode = '23502';
    end if;

    if (new.payload->>'egfr') !~ '^\d+(\.\d+)?$' then
      raise exception 'lab_event: egfr muss numerisch sein' using errcode = '22023';
    end if;
    if (new.payload->>'egfr')::numeric < 0 or (new.payload->>'egfr')::numeric > 200 then
      raise exception 'lab_event: egfr ausserhalb Range 0-200' using errcode = '22003';
    end if;

    if (new.payload->>'creatinine') !~ '^\d+(\.\d+)?$' then
      raise exception 'lab_event: creatinine muss numerisch sein' using errcode = '22023';
    end if;
    if (new.payload->>'creatinine')::numeric < 0.1 or (new.payload->>'creatinine')::numeric > 20 then
      raise exception 'lab_event: creatinine ausserhalb Range 0.1-20' using errcode = '22003';
    end if;

    if (new.payload ? 'albuminuria_stage') then
      if (new.payload->>'albuminuria_stage') not in ('A1','A2','A3') then
        raise exception 'lab_event: albuminuria_stage muss A1/A2/A3 sein' using errcode = '22023';
      end if;
    end if;

    if (new.payload ? 'hba1c') then
      if (new.payload->>'hba1c') !~ '^\d+(\.\d+)?$' then
        raise exception 'lab_event: hba1c muss numerisch sein' using errcode = '22023';
      end if;
      if (new.payload->>'hba1c')::numeric < 3 or (new.payload->>'hba1c')::numeric > 99 then
        raise exception 'lab_event: hba1c ausserhalb Range 3-99' using errcode = '22003';
      end if;
    end if;

    if (new.payload ? 'ldl') then
      if (new.payload->>'ldl') !~ '^\d+(\.\d+)?$' then
        raise exception 'lab_event: ldl muss numerisch sein' using errcode = '22023';
      end if;
      if (new.payload->>'ldl')::numeric < 0 or (new.payload->>'ldl')::numeric > 600 then
        raise exception 'lab_event: ldl ausserhalb Range 0-600' using errcode = '22003';
      end if;
    end if;

    if (new.payload ? 'comment') then
      if length(new.payload->>'comment') < 1 or length(new.payload->>'comment') > 500 then
        raise exception 'lab_event: comment Laenge 1-500 Zeichen' using errcode = '22023';
      end if;
    end if;
    if (new.payload ? 'potassium') then
      if (new.payload->>'potassium') !~ '^\d+(\.\d+)?$' then
        raise exception 'lab_event: potassium muss numerisch sein' using errcode = '22023';
      end if;
      if (new.payload->>'potassium')::numeric < 2 or (new.payload->>'potassium')::numeric > 7 then
        raise exception 'lab_event: potassium ausserhalb Range 2-7' using errcode = '22003';
      end if;
    end if;
    -- CKD-Stufe serverseitig ableiten
    g_stage := null;
    a_stage := null;
    derived_ckd := null;
    if (new.payload ? 'egfr') then
      g_stage := case
        when (new.payload->>'egfr')::numeric >= 90 then 'G1'
        when (new.payload->>'egfr')::numeric >= 60 then 'G2'
        when (new.payload->>'egfr')::numeric >= 45 then 'G3a'
        when (new.payload->>'egfr')::numeric >= 30 then 'G3b'
        when (new.payload->>'egfr')::numeric >= 15 then 'G4'
        else 'G5'
      end;
    end if;
    if (new.payload ? 'albuminuria_stage') then
      a_stage := new.payload->>'albuminuria_stage';
    end if;
    if g_stage is not null or a_stage is not null then
      derived_ckd := trim(both ' ' from coalesce(g_stage, '') || case when a_stage is not null then ' ' || a_stage else '' end);
    end if;
    if derived_ckd is not null then
      if length(derived_ckd) > 20 then
        raise exception 'lab_event: ckd_stage zu lang (max 20 Zeichen)' using errcode = '22023';
      end if;
      if derived_ckd !~ '^G(1|2|3a|3b|4|5)(?:\\s+A[123])?$' then
        raise exception 'lab_event: ckd_stage Format erwartet z.B. "G3a A2"' using errcode = '22023';
      end if;
      new.payload := jsonb_set(new.payload, '{ckd_stage}', to_jsonb(derived_ckd), true);
    else
      new.payload := new.payload - 'ckd_stage';
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

-- (E) Create lab view mirroring existing security_invoker views
drop view if exists public.v_events_lab;
create or replace view public.v_events_lab
  with (security_invoker = on)
as
select
  e.id,
  e.user_id,
  e.ts,
  e.day,
  (e.payload->>'egfr')::numeric            as egfr,
  (e.payload->>'creatinine')::numeric      as creatinine,
  (e.payload->>'albuminuria_stage')        as albuminuria_stage,
  (e.payload->>'hba1c')::numeric           as hba1c,
  (e.payload->>'ldl')::numeric             as ldl,
  (e.payload->>'potassium')::numeric       as potassium,
  e.payload->>'ckd_stage'                  as ckd_stage,
  e.payload->>'comment'                    as doctor_comment
from public.health_events e
where e.type = 'lab_event';

comment on view public.v_events_lab is
  'Laborwerte (eGFR, Kreatinin, Albuminurie-Stufe, Kalium, HbA1c, LDL, CKD-Stufe, Kommentar) pro Tag.';

commit;

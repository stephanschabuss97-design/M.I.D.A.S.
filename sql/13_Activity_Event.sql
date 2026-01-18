-- ============================================
-- 13_Activity_Event.sql
-- Adds activity_event support to health_events (constraint + validation + view + RPCs).
-- ============================================

begin;

-- (A) Extend type constraint to allow activity_event
alter table public.health_events
  drop constraint if exists health_events_type_check;

alter table public.health_events
  add constraint health_events_type_check
    check (type in ('bp','body','note','intake','lab_event','activity_event','system_comment'));

-- (B) Update table comment to include activity_event
comment on table public.health_events is
  'Event-Log (bp/body/note/intake/lab_event/activity_event/system_comment) mit RLS, Unique je Tag/Type(+ctx), Validierungs-Trigger und Europe/Vienna-Tageslogik.';

-- (C) Ensure activity_event rows remain unique per user/day
create unique index if not exists uq_events_activity_per_day
  on public.health_events (user_id, day, type)
  where type = 'activity_event';

-- (D) Update validation trigger (adds activity_event payload rules)
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
      if length(new.payload->>'comment') < 1 or length(new.payload->>'comment') > 2000 then
        raise exception 'lab_event: comment Laenge 1-2000 Zeichen' using errcode = '22023';
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
    if (new.payload ? 'ckd_stage') then
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

-- ensure trigger exists with latest validation logic
drop trigger if exists trg_events_validate_biu on public.health_events;
create trigger trg_events_validate_biu
  before insert or update on public.health_events
  for each row execute function public.trg_events_validate();

-- (E) Create activity view mirroring existing security_invoker views
drop view if exists public.v_events_activity;
create or replace view public.v_events_activity
  with (security_invoker = on)
as
select
  e.id,
  e.user_id,
  e.ts,
  e.day,
  e.payload->>'activity'               as activity,
  (e.payload->>'duration_min')::int    as duration_min,
  e.payload->>'note'                   as note
from public.health_events e
where e.type = 'activity_event';

comment on view public.v_events_activity is
  'Activity events (activity, duration_min, note) per day.';

-- (F) RPCs
create or replace function public.activity_add(
  p_day date default null,
  p_payload jsonb default null
)
returns public.health_events
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_ts timestamptz;
  v_row public.health_events;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'payload must be object' using errcode = '23502';
  end if;

  if p_day is not null then
    v_ts := (p_day + time '12:00')::timestamp at time zone 'Europe/Vienna';
  else
    v_ts := (now() at time zone 'Europe/Vienna')::date + time '12:00';
    v_ts := v_ts::timestamp at time zone 'Europe/Vienna';
  end if;

  insert into public.health_events (user_id, ts, type, payload)
  values (v_user, v_ts, 'activity_event', p_payload)
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.activity_add(date, jsonb) to authenticated, service_role;

create or replace function public.activity_list(p_from date, p_to date)
returns table (
  id uuid,
  user_id uuid,
  ts timestamptz,
  day date,
  activity text,
  duration_min int,
  note text
)
language plpgsql
security invoker
set search_path = public, pg_catalog
stable
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  return query
    select
      e.id,
      e.user_id,
      e.ts,
      e.day,
      e.activity,
      e.duration_min,
      e.note
    from public.v_events_activity e
    where e.day between p_from and p_to
    order by e.day desc, e.ts desc;
end;
$$;

grant execute on function public.activity_list(date, date) to authenticated, service_role;

create or replace function public.activity_delete(p_event_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_deleted boolean := false;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  delete from public.health_events
   where id = p_event_id
     and user_id = v_user
     and type = 'activity_event'
   returning true into v_deleted;

  return coalesce(v_deleted, false);
end;
$$;

grant execute on function public.activity_delete(uuid) to authenticated, service_role;

commit;

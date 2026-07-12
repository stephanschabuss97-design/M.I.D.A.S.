-- MIDAS Medication retention and Supabase Cron prerequisites.
--
-- USER-GATED: Running this file enables pg_cron, provisions the internal
-- cleanup function and schedules its daily execution. For an existing MIDAS
-- project, apply it only after the reviewed Medication clean-start transition.
-- For a fresh or disposable bootstrap, apply it after the canonical Medication
-- schema and grants. Never run it during automatic app bootstrap. Repeated runs
-- update the same owner-scoped job.

begin;

create extension if not exists pg_cron;

create index if not exists idx_medication_slot_events_day
  on public.health_medication_slot_events (day);

create or replace function public.med_retention_cleanup_internal()
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_cutoff date := (
    (statement_timestamp() at time zone 'Europe/Vienna')::date
    - interval '1 year'
  )::date;
  v_cron_run_cutoff timestamptz := statement_timestamp() - interval '90 days';
  v_job_id bigint;
  v_job_matches int := 0;
  v_deleted_events int := 0;
  v_deleted_slots int := 0;
  v_deleted_cron_runs int := 0;
begin
  select count(*)::int, min(j.jobid)
    into v_job_matches, v_job_id
    from cron.job j
   where j.jobname = 'midas-medication-retention-daily';

  delete from public.health_medication_slot_events e
   where e.day < v_cutoff;
  get diagnostics v_deleted_events = row_count;

  delete from public.health_medication_schedule_slots s
   where s.end_date < v_cutoff
     and not exists (
       select 1
         from public.health_medication_slot_events e
        where e.slot_id = s.id
     );
  get diagnostics v_deleted_slots = row_count;

  if v_job_matches = 1 then
    delete from cron.job_run_details d
     where d.jobid = v_job_id
       and d.end_time is not null
       and d.end_time < v_cron_run_cutoff;
    get diagnostics v_deleted_cron_runs = row_count;
  end if;

  return jsonb_build_object(
    'cutoff', v_cutoff,
    'deleted_slot_events', v_deleted_events,
    'deleted_schedule_slots', v_deleted_slots,
    'cron_job_matches', v_job_matches,
    'deleted_cron_runs', v_deleted_cron_runs
  );
end;
$$;

comment on function public.med_retention_cleanup_internal() is
  'Interne MIDAS-Retention fuer Medication-Events, beendete Slots und eigene Cron-Laufdetails.';

revoke execute on function public.med_retention_cleanup_internal()
  from public, anon, authenticated, service_role;

do $$
declare
  v_job_name constant text := 'midas-medication-retention-daily';
  v_schedule constant text := '15 3 * * *';
  v_command constant text := 'select public.med_retention_cleanup_internal();';
  v_job_count int := 0;
  v_job_owner text;
  v_job_id bigint;
begin
  if not coalesce((
    select r.rolsuper or r.rolbypassrls
      from pg_catalog.pg_roles r
     where r.rolname = current_user
  ), false) then
    raise exception 'Medication retention provisioning requires an RLS-bypass database role'
      using detail = format('Current role %s cannot verify global cron-job uniqueness.', current_user);
  end if;

  if not pg_catalog.has_function_privilege(
    current_user,
    'public.med_retention_cleanup_internal()',
    'EXECUTE'
  ) then
    raise exception 'Medication retention job owner cannot execute its cleanup function'
      using detail = format('Role %s needs owner-level EXECUTE before provisioning.', current_user);
  end if;

  select count(*)::int, min(j.username)
    into v_job_count, v_job_owner
    from cron.job j
   where j.jobname = v_job_name;

  if v_job_count > 1 then
    raise exception 'multiple cron jobs named % exist', v_job_name
      using detail = format('Found %s jobs; resolve duplicates before rerunning this file.', v_job_count);
  end if;

  if v_job_count = 1 and v_job_owner is distinct from current_user then
    raise exception 'cron job % belongs to another database role', v_job_name
      using detail = format('Expected owner %s, found %s.', current_user, v_job_owner);
  end if;

  select cron.schedule(v_job_name, v_schedule, v_command)
    into v_job_id;

  perform cron.alter_job(
    job_id := v_job_id,
    schedule := v_schedule,
    command := v_command,
    active := true
  );

  select count(*)::int
    into v_job_count
    from cron.job j
   where j.jobname = v_job_name
     and j.jobid = v_job_id
     and j.username = current_user
     and j.database = current_database()
     and j.schedule = v_schedule
     and j.command = v_command
     and j.active;

  if v_job_count <> 1 then
    raise exception 'cron job % failed post-provision verification', v_job_name
      using detail = format('Expected one active job with id %s and the reviewed contract.', v_job_id);
  end if;

  select count(*)::int
    into v_job_count
    from cron.job j
   where j.jobname = v_job_name;

  if v_job_count <> 1 then
    raise exception 'cron job % is not globally unique', v_job_name
      using detail = format('Found %s jobs after provisioning.', v_job_count);
  end if;

  raise notice 'MIDAS Medication retention job % is active as job id % at 03:15 UTC',
    v_job_name,
    v_job_id;
end;
$$;

commit;

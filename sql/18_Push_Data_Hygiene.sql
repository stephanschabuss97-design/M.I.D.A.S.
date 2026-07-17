-- MIDAS Push delivery and subscription data hygiene.
--
-- USER-GATED: Running this file enables pg_cron, provisions the internal
-- cleanup function and schedules its weekly execution. Apply it only after the
-- reviewed incident-push time guard is deployed and verified. Never run it
-- during automatic app bootstrap. Repeated runs update the same owner-scoped
-- job and preserve the separate Medication retention contract.

begin;

create extension if not exists pg_cron;

create index if not exists idx_push_subscriptions_disabled_updated_at
  on public.push_subscriptions (updated_at)
  where disabled = true;

create or replace function public.push_data_hygiene_cleanup_internal()
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_job_name constant text := 'midas-push-hygiene-weekly';
  v_schedule constant text := '45 3 * * 0';
  v_command constant text :=
    'select public.push_data_hygiene_cleanup_internal();';
  v_expected_owner constant text := 'postgres';
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_today date := (v_now at time zone 'Europe/Vienna')::date;
  v_delivery_cutoff date := v_today - 90;
  v_subscription_cutoff timestamptz := v_now - interval '90 days';
  v_cron_run_cutoff timestamptz := v_now - interval '90 days';
  v_job_id bigint;
  v_job_matches int := 0;
  v_job_contract_matches int := 0;
  v_function_owner text;
  v_future_deliveries int := 0;
  v_deleted_deliveries int := 0;
  v_deleted_subscriptions int := 0;
  v_deleted_cron_runs int := 0;
begin
  -- Permanent MIDAS Push lock pair. It serializes Cron and manual cleanup runs.
  if not pg_catalog.pg_try_advisory_xact_lock(1296647233, 1347769160) then
    raise exception 'MIDAS Push data hygiene cleanup is already running'
      using errcode = '55P03';
  end if;

  if current_user <> v_expected_owner then
    raise exception 'MIDAS Push data hygiene cleanup requires role %',
      v_expected_owner
      using errcode = '42501';
  end if;

  select r.rolname
    into v_function_owner
    from pg_catalog.pg_proc p
    join pg_catalog.pg_roles r on r.oid = p.proowner
   where p.oid = pg_catalog.to_regprocedure(
     'public.push_data_hygiene_cleanup_internal()'
   );

  if v_function_owner is distinct from v_expected_owner then
    raise exception 'MIDAS Push cleanup function has unexpected owner'
      using detail = pg_catalog.format(
        'Expected owner %s, found %s.',
        v_expected_owner,
        coalesce(v_function_owner, '<missing>')
      );
  end if;

  select pg_catalog.count(*)::int, pg_catalog.min(j.jobid)
    into v_job_matches, v_job_id
    from cron.job j
   where j.jobname = v_job_name;

  if v_job_matches <> 1 then
    raise exception 'MIDAS Push cleanup requires exactly one named cron job'
      using detail = pg_catalog.format(
        'Expected one job named %s, found %s.',
        v_job_name,
        v_job_matches
      );
  end if;

  select pg_catalog.count(*)::int
    into v_job_contract_matches
    from cron.job j
   where j.jobid = v_job_id
     and j.jobname = v_job_name
     and j.username = v_expected_owner
     and j.database = pg_catalog.current_database()
     and j.schedule = v_schedule
     and j.command = v_command
     and j.active;

  if v_job_contract_matches <> 1 then
    raise exception 'MIDAS Push cleanup cron job contract does not match'
      using detail = pg_catalog.format(
        'Job %s must be active as %s in database %s with schedule %s.',
        v_job_name,
        v_expected_owner,
        pg_catalog.current_database(),
        v_schedule
      );
  end if;

  select pg_catalog.count(*)::int
    into v_future_deliveries
    from public.push_notification_deliveries d
   where d.day > v_today;

  delete from public.push_notification_deliveries d
   where d.day < v_delivery_cutoff;
  get diagnostics v_deleted_deliveries = row_count;

  delete from public.push_subscriptions s
   where s.disabled = true
     and s.updated_at < v_subscription_cutoff;
  get diagnostics v_deleted_subscriptions = row_count;

  delete from cron.job_run_details d
   where d.jobid = v_job_id
     and d.end_time is not null
     and d.end_time < v_cron_run_cutoff;
  get diagnostics v_deleted_cron_runs = row_count;

  return pg_catalog.jsonb_build_object(
    'evaluated_at', v_now,
    'today_vienna', v_today,
    'delivery_cutoff', v_delivery_cutoff,
    'subscription_cutoff', v_subscription_cutoff,
    'cron_run_cutoff', v_cron_run_cutoff,
    'future_deliveries', v_future_deliveries,
    'deleted_deliveries', v_deleted_deliveries,
    'deleted_subscriptions', v_deleted_subscriptions,
    'deleted_cron_runs', v_deleted_cron_runs,
    'cron_job_id', v_job_id
  );
end;
$$;

alter function public.push_data_hygiene_cleanup_internal() owner to postgres;

comment on function public.push_data_hygiene_cleanup_internal() is
  'Internal MIDAS cleanup for old Push deliveries, disabled subscriptions and own Cron run details.';

revoke execute on function public.push_data_hygiene_cleanup_internal()
  from public, anon, authenticated, service_role;

do $$
declare
  v_job_name constant text := 'midas-push-hygiene-weekly';
  v_schedule constant text := '45 3 * * 0';
  v_command constant text :=
    'select public.push_data_hygiene_cleanup_internal();';
  v_expected_owner constant text := 'postgres';
  v_job_count int := 0;
  v_job_contract_count int := 0;
  v_job_id bigint;
  v_job_owner text;
  v_function_owner text;
begin
  if current_user <> v_expected_owner then
    raise exception 'MIDAS Push hygiene provisioning requires role %',
      v_expected_owner
      using errcode = '42501';
  end if;

  select r.rolname
    into v_function_owner
    from pg_catalog.pg_proc p
    join pg_catalog.pg_roles r on r.oid = p.proowner
   where p.oid = pg_catalog.to_regprocedure(
     'public.push_data_hygiene_cleanup_internal()'
   );

  if v_function_owner is distinct from v_expected_owner then
    raise exception 'MIDAS Push cleanup function owner verification failed'
      using detail = pg_catalog.format(
        'Expected owner %s, found %s.',
        v_expected_owner,
        coalesce(v_function_owner, '<missing>')
      );
  end if;

  if not pg_catalog.has_function_privilege(
    current_user,
    'public.push_data_hygiene_cleanup_internal()',
    'EXECUTE'
  ) then
    raise exception 'MIDAS Push hygiene job owner cannot execute cleanup'
      using detail = pg_catalog.format(
        'Role %s needs owner-level EXECUTE before provisioning.',
        current_user
      );
  end if;

  select pg_catalog.count(*)::int,
         pg_catalog.min(j.jobid),
         pg_catalog.min(j.username)
    into v_job_count, v_job_id, v_job_owner
    from cron.job j
   where j.jobname = v_job_name;

  if v_job_count > 1 then
    raise exception 'Multiple Cron jobs named % exist', v_job_name
      using detail = pg_catalog.format(
        'Found %s jobs; resolve duplicates before rerunning this file.',
        v_job_count
      );
  end if;

  if v_job_count = 1 and v_job_owner is distinct from v_expected_owner then
    raise exception 'Cron job % belongs to another database role', v_job_name
      using detail = pg_catalog.format(
        'Expected owner %s, found %s.',
        v_expected_owner,
        v_job_owner
      );
  end if;

  if v_job_count = 0 then
    select cron.schedule(v_job_name, v_schedule, v_command)
      into v_job_id;
  end if;

  perform cron.alter_job(
    job_id := v_job_id,
    schedule := v_schedule,
    command := v_command,
    database := pg_catalog.current_database(),
    active := true
  );

  select pg_catalog.count(*)::int
    into v_job_count
    from cron.job j
   where j.jobname = v_job_name;

  select pg_catalog.count(*)::int
    into v_job_contract_count
    from cron.job j
   where j.jobname = v_job_name
     and j.jobid = v_job_id
     and j.username = v_expected_owner
     and j.database = pg_catalog.current_database()
     and j.schedule = v_schedule
     and j.command = v_command
     and j.active;

  if v_job_count <> 1 or v_job_contract_count <> 1 then
    raise exception 'MIDAS Push hygiene Cron post-provision verification failed'
      using detail = pg_catalog.format(
        'Expected exactly one active %s job with id %s and the reviewed contract.',
        v_job_name,
        v_job_id
      );
  end if;

  select r.rolname
    into v_function_owner
    from pg_catalog.pg_proc p
    join pg_catalog.pg_roles r on r.oid = p.proowner
   where p.oid = pg_catalog.to_regprocedure(
     'public.push_data_hygiene_cleanup_internal()'
   );

  if v_function_owner is distinct from v_expected_owner then
    raise exception 'MIDAS Push cleanup function owner changed during provisioning';
  end if;

  raise notice 'MIDAS Push hygiene job % is active as job id % at 03:45 UTC',
    v_job_name,
    v_job_id;
end;
$$;

commit;

-- Disposable PostgreSQL 17 fixture for MIDAS Activity V2 R2.
--
-- NEVER run against a real MIDAS database. The fixture is guarded to the
-- database name midas_activity_v2_s45 and rebuilds public/auth/extension
-- objects there. The database must be owned by postgres and the fixture must
-- run as postgres with psql and ON_ERROR_STOP=1.

\set ON_ERROR_STOP on
\set VERBOSITY terse

do $$
begin
  if pg_catalog.current_database() <> 'midas_activity_v2_s45' then
    raise exception 'Activity V2 fixture requires database midas_activity_v2_s45';
  end if;
  if pg_catalog.current_setting('server_version_num')::integer < 170000 then
    raise exception 'Activity V2 fixture requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' then
    raise exception 'Activity V2 fixture requires session_user postgres';
  end if;
  if not exists (
    select 1
      from pg_catalog.pg_database d
      join pg_catalog.pg_roles r
        on r.oid = d.datdba
     where d.datname = pg_catalog.current_database()
       and r.rolname = 'postgres'
  ) then
    raise exception 'Activity V2 fixture requires database owner postgres';
  end if;
end;
$$;

\echo 'S4.5 fixture: reset guarded disposable database'

drop schema if exists midas_fixture cascade;
drop schema if exists public cascade;
drop schema if exists auth cascade;
drop schema if exists extensions cascade;

create schema public authorization postgres;
create schema auth authorization postgres;
create schema extensions authorization postgres;
create schema midas_fixture authorization postgres;

grant usage on schema public, auth, extensions to anon, authenticated, service_role;
grant usage on schema midas_fixture to authenticated;

create extension pgcrypto with schema extensions;
create extension dblink with schema extensions;

create table auth.users (
  id uuid primary key
);

create or replace function auth.uid()
returns uuid
language sql
stable
set search_path = ''
as $function$
  select nullif(
    pg_catalog.current_setting('request.jwt.claim.sub', true),
    ''
  )::uuid
$function$;

create or replace function auth.jwt()
returns jsonb
language sql
stable
set search_path = ''
as $function$
  select coalesce(
    nullif(
      pg_catalog.current_setting('request.jwt.claims', true),
      ''
    )::jsonb,
    '{}'::jsonb
  )
$function$;

create or replace function midas_fixture.assert_true(
  p_condition boolean,
  p_message text
)
returns void
language plpgsql
set search_path = ''
as $procedure$
begin
  if not coalesce(p_condition, false) then
    raise exception 'Activity V2 fixture assertion failed: %', p_message;
  end if;
  return;
end;
$procedure$;

create or replace function midas_fixture.strength_payload(
  p_replay_variant boolean default false,
  p_started_at text default '2026-07-01T10:00:00+02:00',
  p_weight_delta numeric default 0
)
returns jsonb
language sql
immutable
set search_path = ''
as $function$
  select case when p_replay_variant then
    pg_catalog.jsonb_build_object(
      'schema_version', 'midas.activity-session.v1',
      'catalog_version', 1,
      'started_at', '2026-07-01T08:00:00.000000Z',
      'ended_at', '2026-07-01T08:30:00.000000Z',
      'duration_min', 30,
      'title', 'Strength',
      'note', null,
      'items', pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'item_key', 'bench_press',
          'item_order', 1,
          'sets', pg_catalog.jsonb_build_array(
            pg_catalog.jsonb_build_object(
              'set_order', 1, 'reps', 10,
              'weight_kg', 80 + p_weight_delta
            ),
            pg_catalog.jsonb_build_object(
              'set_order', 2, 'reps', 8,
              'weight_kg', 82.5 + p_weight_delta
            )
          )
        )
      )
    )
  else
    pg_catalog.jsonb_build_object(
      'schema_version', 'midas.activity-session.v1',
      'catalog_version', 1,
      'started_at', p_started_at,
      'ended_at', pg_catalog.to_char(
        pg_catalog.timezone(
          'UTC', p_started_at::timestamptz + interval '30 minutes'
        ),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'duration_min', 30,
      'title', '  Strength  ',
      'note', '   ',
      'items', pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'item_key', 'bench_press',
          'item_order', 1,
          'sets', pg_catalog.jsonb_build_array(
            pg_catalog.jsonb_build_object(
              'set_order', 2, 'reps', 8,
              'weight_kg', 82.5 + p_weight_delta
            ),
            pg_catalog.jsonb_build_object(
              'set_order', 1, 'reps', 10,
              'weight_kg', 80 + p_weight_delta
            )
          )
        )
      )
    )
  end
$function$;

create or replace function midas_fixture.duration_payload(
  p_started_at text default '2026-07-02T18:00:00+02:00',
  p_duration integer default 45
)
returns jsonb
language sql
immutable
set search_path = ''
as $function$
  select pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session.v1',
    'catalog_version', 1,
    'started_at', p_started_at,
    'ended_at', pg_catalog.to_char(
      pg_catalog.timezone(
        'UTC', p_started_at::timestamptz + (p_duration || ' minutes')::interval
      ),
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
    ),
    'duration_min', p_duration,
    'items', pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'item_key', 'football',
        'item_order', 1,
        'duration_min', p_duration,
        'sets', pg_catalog.jsonb_build_array()
      )
    )
  )
$function$;

create or replace function midas_fixture.distance_payload(
  p_started_at text default '2026-07-03T07:00:00+02:00',
  p_distance numeric default 5.25
)
returns jsonb
language sql
immutable
set search_path = ''
as $function$
  select pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session.v1',
    'catalog_version', 1,
    'started_at', p_started_at,
    'ended_at', pg_catalog.to_char(
      pg_catalog.timezone(
        'UTC', p_started_at::timestamptz + interval '30 minutes'
      ),
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
    ),
    'duration_min', 30,
    'items', pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'item_key', 'running',
        'item_order', 1,
        'duration_min', 30,
        'distance_km', p_distance,
        'note', '  steady  ',
        'sets', pg_catalog.jsonb_build_array()
      )
    )
  )
$function$;

create or replace procedure midas_fixture.set_claims(
  p_user uuid,
  p_anonymous jsonb
)
language plpgsql
set search_path = ''
as $procedure$
begin
  perform pg_catalog.set_config('request.jwt.claim.sub', p_user::text, false);
  perform pg_catalog.set_config(
    'request.jwt.claims',
    pg_catalog.jsonb_build_object(
      'sub', p_user,
      'is_anonymous', p_anonymous
    )::text,
    false
  );
end;
$procedure$;

-- Minimal, structurally valid prerequisites for the complete grant source.
-- The fixture verifies only their ACL application; product behavior remains
-- owned by their respective SQL files and test suites.
create table public.user_profile (id uuid primary key);
create table public.health_events (id uuid primary key);
create table public.appointments_v2 (id uuid primary key);
create table public.health_medications (id uuid primary key);
create table public.health_medication_schedule_slots (id uuid primary key);
create table public.health_medication_slot_events (id uuid primary key);
create table public.trendpilot_events (id uuid primary key);
create table public.trendpilot_events_range (id uuid primary key);
create table public.trendpilot_state (id uuid primary key);
create table public.push_subscriptions (id uuid primary key);
create table public.push_notification_deliveries (id uuid primary key);

alter table public.user_profile enable row level security;
alter table public.health_events enable row level security;
alter table public.appointments_v2 enable row level security;
alter table public.health_medications enable row level security;
alter table public.health_medication_schedule_slots enable row level security;
alter table public.health_medication_slot_events enable row level security;
alter table public.trendpilot_events enable row level security;
alter table public.trendpilot_events_range enable row level security;
alter table public.trendpilot_state enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.push_notification_deliveries enable row level security;

create view public.v_events_bp with (security_invoker = true)
  as select id from public.health_events;
create view public.v_events_body with (security_invoker = true)
  as select id from public.health_events;
create view public.v_events_lab with (security_invoker = true)
  as select id from public.health_events;
create view public.v_events_activity with (security_invoker = true)
  as select id from public.health_events;
create view public.v_appointments_v2_upcoming with (security_invoker = true)
  as select id from public.appointments_v2;

create function public.med_reset_all_data_v2() returns void
  language sql set search_path = '' as 'select';
create function public.med_list_v2(date) returns jsonb
  language sql stable set search_path = '' as 'select ''[]''::jsonb';
create function public.med_upsert_v2(uuid, text, text, text, text, int, int, boolean, boolean)
  returns void language sql set search_path = '' as 'select';
create function public.med_upsert_schedule_v2(uuid, date, jsonb) returns void
  language sql set search_path = '' as 'select';
create function public.med_confirm_slot_v2(uuid, date) returns void
  language sql set search_path = '' as 'select';
create function public.med_undo_slot_v2(uuid, date) returns void
  language sql set search_path = '' as 'select';
create function public.med_adjust_stock_v2(uuid, int, text) returns void
  language sql set search_path = '' as 'select';
create function public.med_set_stock_v2(uuid, int, text) returns void
  language sql set search_path = '' as 'select';
create function public.med_ack_low_stock_v2(uuid, date, int) returns void
  language sql set search_path = '' as 'select';
create function public.med_set_active_v2(uuid, boolean) returns void
  language sql set search_path = '' as 'select';
create function public.med_delete_v2(uuid) returns void
  language sql set search_path = '' as 'select';
create function public.upsert_intake(date, numeric, numeric, numeric) returns void
  language sql set search_path = '' as 'select';
create function public.activity_add(date, jsonb) returns void
  language sql set search_path = '' as 'select';
create function public.activity_list(date, date) returns jsonb
  language sql stable set search_path = '' as 'select ''[]''::jsonb';
create function public.activity_delete(uuid) returns void
  language sql set search_path = '' as 'select';

\echo 'S4.5 fixture: fail-closed target-state probes'

create table public.health_activity_sessions (id integer);
\set ON_ERROR_STOP off
\ir ../20_Activity_V2.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regclass('public.health_activity_sessions') is not null
  and pg_catalog.to_regclass('public.health_activity_catalog_entries') is null,
  'partial 1/6 state was not rejected atomically'
);
drop table public.health_activity_sessions;

create view public.health_activity_catalog_entries as select 1 as id;
\set ON_ERROR_STOP off
\ir ../20_Activity_V2.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  (select c.relkind = 'v'
     from pg_catalog.pg_class c
     join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'health_activity_catalog_entries'),
  'wrong relation kind was not rejected atomically'
);
drop view public.health_activity_catalog_entries;

\echo 'S4.5 fixture: fresh setup, structural drift, overload and rerun'

\ir ../20_Activity_V2.sql

alter table public.health_activity_sessions
  drop constraint health_activity_sessions_duration_check;
alter table public.health_activity_sessions
  add constraint health_activity_sessions_duration_check
  check (duration_min between 1 and 100);

\set ON_ERROR_STOP off
\ir ../20_Activity_V2.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.pg_get_constraintdef(
    (select oid from pg_catalog.pg_constraint
      where conrelid = 'public.health_activity_sessions'::regclass
        and conname = 'health_activity_sessions_duration_check'),
    false
  ) like '%100%',
  'wrong constraint drift was not rejected atomically'
);

drop function public.activity_v2_commit_session(uuid, jsonb);
drop function public.activity_v2_last_performance(text);
drop table public.health_activity_item_sets;
drop table public.health_activity_session_items;
drop table public.health_activity_sessions;
drop table public.health_activity_catalog_entries;

\ir ../20_Activity_V2.sql

create function public.activity_v2_commit_session(text)
returns jsonb language sql set search_path = '' as 'select null::jsonb';
\set ON_ERROR_STOP off
\ir ../20_Activity_V2.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_v2_commit_session(text)') is not null
  and (select pg_catalog.count(*) from public.health_activity_catalog_entries) = 78,
  'RPC overload was not rejected without mutation'
);
drop function public.activity_v2_commit_session(text);

\ir ../20_Activity_V2.sql
\ir ../16_Explicit_Grants.sql

\echo 'S4.5 fixture: schema, catalog, RLS, ACL and function hardening'

do $$
declare
  v_table text;
begin
  perform midas_fixture.assert_true(
    (select pg_catalog.count(*) from public.health_activity_catalog_entries) = 78,
    'catalog row count is not 78'
  );
  perform midas_fixture.assert_true(
    not exists (
      select 1 from public.health_activity_catalog_entries
       where catalog_version <> 1 or status <> 'active'
    ),
    'catalog version/status drift'
  );

  foreach v_table in array array[
    'health_activity_catalog_entries',
    'health_activity_sessions',
    'health_activity_session_items',
    'health_activity_item_sets'
  ]::text[] loop
    perform midas_fixture.assert_true(
      pg_catalog.has_table_privilege('authenticated', 'public.' || v_table, 'SELECT')
      and pg_catalog.has_table_privilege('service_role', 'public.' || v_table, 'SELECT')
      and not pg_catalog.has_table_privilege('anon', 'public.' || v_table, 'SELECT')
      and not pg_catalog.has_table_privilege('authenticated', 'public.' || v_table, 'INSERT,UPDATE,DELETE')
      and not pg_catalog.has_table_privilege('service_role', 'public.' || v_table, 'INSERT,UPDATE,DELETE'),
      'R2 table ACL drift on ' || v_table
    );
  end loop;

  perform midas_fixture.assert_true(
    pg_catalog.has_table_privilege(
      'authenticated', 'public.trendpilot_state', 'SELECT'
    )
    and pg_catalog.has_table_privilege(
      'service_role', 'public.trendpilot_state', 'SELECT'
    )
    and not pg_catalog.has_table_privilege(
      'anon', 'public.trendpilot_state', 'SELECT'
    )
    and not pg_catalog.has_table_privilege(
      'authenticated', 'public.trendpilot_state', 'INSERT,UPDATE,DELETE'
    )
    and pg_catalog.has_table_privilege(
      'service_role', 'public.trendpilot_state', 'INSERT,UPDATE,DELETE'
    ),
    'Trendpilot state read/DML ACL drift'
  );

  perform midas_fixture.assert_true(
    pg_catalog.has_function_privilege(
      'authenticated', 'public.activity_v2_commit_session(uuid,jsonb)', 'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'anon', 'public.activity_v2_commit_session(uuid,jsonb)', 'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'service_role', 'public.activity_v2_commit_session(uuid,jsonb)', 'EXECUTE'
    )
    and pg_catalog.has_function_privilege(
      'authenticated', 'public.activity_v2_last_performance(text)', 'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'anon', 'public.activity_v2_last_performance(text)', 'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'service_role', 'public.activity_v2_last_performance(text)', 'EXECUTE'
    ),
    'R2 function ACL drift'
  );

  perform midas_fixture.assert_true(
    exists (
      select 1
        from pg_catalog.pg_proc p
        join pg_catalog.pg_roles r on r.oid = p.proowner
       where p.oid = 'public.activity_v2_commit_session(uuid,jsonb)'::regprocedure
         and r.rolname = 'postgres'
         and p.prosecdef
         and p.proconfig @> array['search_path=""']::text[]
    )
    and exists (
      select 1
        from pg_catalog.pg_proc p
        join pg_catalog.pg_roles r on r.oid = p.proowner
       where p.oid = 'public.activity_v2_last_performance(text)'::regprocedure
         and r.rolname = 'postgres'
         and not p.prosecdef
         and p.proconfig @> array['search_path=""']::text[]
    ),
    'RPC owner/security/search_path drift'
  );
end;
$$;

insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');

\echo 'S4.5 fixture: three modes, canonical replay and conflict'

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);

set role authenticated;
select public.activity_v2_commit_session(
  '10000000-0000-4000-8000-000000000001',
  midas_fixture.strength_payload()
) as strength_result \gset
reset role;

select midas_fixture.assert_true(
  :'strength_result'::jsonb ->> 'outcome' = 'created',
  'strength commit did not create'
);

select public.activity_v2_commit_session(
  '10000000-0000-4000-8000-000000000002',
  midas_fixture.duration_payload()
) as duration_result \gset
select public.activity_v2_commit_session(
  '10000000-0000-4000-8000-000000000003',
  midas_fixture.distance_payload()
) as distance_result \gset

select midas_fixture.assert_true(
  :'duration_result'::jsonb ->> 'outcome' = 'created'
  and :'distance_result'::jsonb ->> 'outcome' = 'created'
  and (select pg_catalog.count(*) from public.health_activity_sessions) = 3
  and (select pg_catalog.count(*) from public.health_activity_session_items) = 3
  and (select pg_catalog.count(*) from public.health_activity_item_sets) = 2,
  'three tracking modes did not persist exact row counts'
);

select public.activity_v2_commit_session(
  '10000000-0000-4000-8000-000000000001',
  midas_fixture.strength_payload(true)
) as replay_result \gset
select midas_fixture.assert_true(
  :'replay_result'::jsonb ->> 'outcome' = 'replayed'
  and :'replay_result'::jsonb #>> '{session,id}' =
      :'strength_result'::jsonb #>> '{session,id}'
  and (select pg_catalog.count(*) from public.health_activity_sessions) = 3,
  'canonical equivalent replay changed identity or row count'
);

create or replace procedure midas_fixture.expect_commit_error(
  p_request_id uuid,
  p_payload jsonb,
  p_token text
)
language plpgsql
set search_path = ''
as $procedure$
declare
  v_failed boolean := false;
  v_message text;
begin
  begin
    perform public.activity_v2_commit_session(p_request_id, p_payload);
  exception when others then
    v_failed := true;
    get stacked diagnostics v_message = message_text;
    if pg_catalog.strpos(v_message, p_token) = 0 then
      raise exception 'unexpected commit error: %', v_message;
    end if;
  end;
  if not v_failed then
    raise exception 'expected commit error token %', p_token;
  end if;
end;
$procedure$;

call midas_fixture.expect_commit_error(
  '10000000-0000-4000-8000-000000000001',
  midas_fixture.strength_payload(
    true, '2026-07-01T10:00:00+02:00', 1
  ),
  'MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT'
);

do $$
declare
  v_sessions bigint := (select pg_catalog.count(*) from public.health_activity_sessions);
  v_items bigint := (select pg_catalog.count(*) from public.health_activity_session_items);
  v_sets bigint := (select pg_catalog.count(*) from public.health_activity_item_sets);
  v_invalid jsonb;
begin
  v_invalid := pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session.v1',
    'catalog_version', 1,
    'started_at', '2026-07-04T10:00:00Z',
    'ended_at', '2026-07-04T11:00:00Z',
    'duration_min', 60,
    'items', pg_catalog.jsonb_build_array(
      midas_fixture.duration_payload() #> '{items,0}',
      pg_catalog.jsonb_build_object(
        'item_key', 'unknown_item', 'item_order', 2,
        'duration_min', 15, 'sets', pg_catalog.jsonb_build_array()
      )
    )
  );
  call midas_fixture.expect_commit_error(
    '10000000-0000-4000-8000-000000000004',
    v_invalid,
    'MIDAS_ACTIVITY_INVALID_SESSION'
  );
  perform midas_fixture.assert_true(
    (select pg_catalog.count(*) from public.health_activity_sessions) = v_sessions
    and (select pg_catalog.count(*) from public.health_activity_session_items) = v_items
    and (select pg_catalog.count(*) from public.health_activity_item_sets) = v_sets,
    'invalid final item left partial rows'
  );
end;
$$;

\echo 'S4.5 fixture: permanent-user claims, RLS and owner isolation'

call midas_fixture.set_claims(
  '22222222-2222-4222-8222-222222222222', 'false'::jsonb
);
select public.activity_v2_commit_session(
  '20000000-0000-4000-8000-000000000001',
  midas_fixture.duration_payload('2026-07-05T12:00:00Z', 20)
);

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'true'::jsonb
);
call midas_fixture.expect_commit_error(
  '10000000-0000-4000-8000-000000000010',
  midas_fixture.duration_payload(),
  'MIDAS_ACTIVITY_AUTH_REQUIRED'
);

select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111"}',
  false
);
call midas_fixture.expect_commit_error(
  '10000000-0000-4000-8000-000000000011',
  midas_fixture.duration_payload(),
  'MIDAS_ACTIVITY_AUTH_REQUIRED'
);

select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":null}',
  false
);
call midas_fixture.expect_commit_error(
  '10000000-0000-4000-8000-000000000012',
  midas_fixture.duration_payload(),
  'MIDAS_ACTIVITY_AUTH_REQUIRED'
);

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;
select pg_catalog.count(*) as user_a_sessions
  from public.health_activity_sessions \gset
reset role;
select midas_fixture.assert_true(
  :user_a_sessions = 3,
  'user A RLS count is not isolated'
);

call midas_fixture.set_claims(
  '22222222-2222-4222-8222-222222222222', 'false'::jsonb
);
set role authenticated;
select pg_catalog.count(*) as user_b_sessions
  from public.health_activity_sessions \gset
reset role;
select midas_fixture.assert_true(
  :user_b_sessions = 1,
  'user B RLS count is not isolated'
);

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'true'::jsonb
);
set role authenticated;
select pg_catalog.count(*) as anonymous_visible_sessions
  from public.health_activity_sessions \gset
reset role;
select midas_fixture.assert_true(
  :anonymous_visible_sessions = 0,
  'anonymous JWT could read history'
);

select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111"}',
  false
);
set role authenticated;
select pg_catalog.count(*) as missing_claim_visible_sessions
  from public.health_activity_sessions \gset
reset role;
select midas_fixture.assert_true(
  :missing_claim_visible_sessions = 0,
  'missing anonymous claim could read history'
);

select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":null}',
  false
);
set role authenticated;
select pg_catalog.count(*) as null_claim_visible_sessions
  from public.health_activity_sessions \gset
reset role;
select midas_fixture.assert_true(
  :null_claim_visible_sessions = 0,
  'null anonymous claim could read history'
);

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;
\set ON_ERROR_STOP off
insert into public.health_activity_sessions (
  user_id, request_id, request_fingerprint, started_at, ended_at, duration_min
) values (
  '11111111-1111-4111-8111-111111111111',
  '10000000-0000-4000-8000-000000000098',
  pg_catalog.repeat('a', 64),
  '2026-07-06T10:00:00Z', '2026-07-06T10:10:00Z', 10
);
\set ON_ERROR_STOP on
reset role;

set role service_role;
\set ON_ERROR_STOP off
insert into public.health_activity_sessions (
  user_id, request_id, request_fingerprint, started_at, ended_at, duration_min
) values (
  '11111111-1111-4111-8111-111111111111',
  '10000000-0000-4000-8000-000000000099',
  pg_catalog.repeat('b', 64),
  '2026-07-06T10:00:00Z', '2026-07-06T10:10:00Z', 10
);
\set ON_ERROR_STOP on
reset role;

set role anon;
\set ON_ERROR_STOP off
select public.activity_v2_last_performance('running');
\set ON_ERROR_STOP on
reset role;

select midas_fixture.assert_true(
  not exists (
    select 1 from public.health_activity_sessions
     where request_id in (
       '10000000-0000-4000-8000-000000000098',
       '10000000-0000-4000-8000-000000000099'
     )
  ),
  'direct authenticated/service_role write was not denied'
);

\echo 'S4.5 fixture: Vienna boundaries and future tolerance'

do $$
begin
  perform midas_fixture.assert_true(
    pg_catalog.timezone('Europe/Vienna', '2026-01-15T22:59:59Z'::timestamptz)::date
      = '2026-01-15'::date
    and pg_catalog.timezone('Europe/Vienna', '2026-01-15T23:00:00Z'::timestamptz)::date
      = '2026-01-16'::date
    and pg_catalog.timezone('Europe/Vienna', '2026-07-15T21:59:59Z'::timestamptz)::date
      = '2026-07-15'::date
    and pg_catalog.timezone('Europe/Vienna', '2026-07-15T22:00:00Z'::timestamptz)::date
      = '2026-07-16'::date,
    'Vienna midnight boundaries drifted'
  );
  perform midas_fixture.assert_true(
    pg_catalog.timezone('Europe/Vienna', '2026-03-29T00:30:00Z'::timestamptz)
      = '2026-03-29 01:30:00'::timestamp
    and pg_catalog.timezone('Europe/Vienna', '2026-03-29T01:30:00Z'::timestamptz)
      = '2026-03-29 03:30:00'::timestamp
    and pg_catalog.timezone('Europe/Vienna', '2026-10-25T00:30:00Z'::timestamptz)
      = '2026-10-25 02:30:00'::timestamp
    and pg_catalog.timezone('Europe/Vienna', '2026-10-25T01:30:00Z'::timestamptz)
      = '2026-10-25 02:30:00'::timestamp,
    'Vienna DST boundaries drifted'
  );
end;
$$;

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
select public.activity_v2_commit_session(
  '10000000-0000-4000-8000-000000000020',
  pg_catalog.jsonb_set(
    pg_catalog.jsonb_set(
      midas_fixture.duration_payload(),
      '{started_at}',
      pg_catalog.to_jsonb(pg_catalog.clock_timestamp())
    ),
    '{ended_at}',
    pg_catalog.to_jsonb(pg_catalog.clock_timestamp() + interval '4 minutes')
  )
);
call midas_fixture.expect_commit_error(
  '10000000-0000-4000-8000-000000000021',
  pg_catalog.jsonb_set(
    pg_catalog.jsonb_set(
      midas_fixture.duration_payload(),
      '{started_at}',
      pg_catalog.to_jsonb(pg_catalog.clock_timestamp())
    ),
    '{ended_at}',
    pg_catalog.to_jsonb(pg_catalog.clock_timestamp() + interval '10 minutes')
  ),
  'MIDAS_ACTIVITY_INVALID_SESSION'
);

\echo 'S4.5 fixture: lookup, tie-break and full ordered block'

select public.activity_v2_commit_session(
  '10000000-0000-4000-8000-000000000030',
  midas_fixture.strength_payload(false, '2026-07-10T10:00:00Z', 5)
);
select public.activity_v2_commit_session(
  '10000000-0000-4000-8000-000000000031',
  midas_fixture.strength_payload(false, '2026-07-10T10:00:00Z', 10)
);

do $$
declare
  v_lookup jsonb;
  v_expected_session uuid;
  v_expected_item uuid;
begin
  select s.id, i.id
    into strict v_expected_session, v_expected_item
    from public.health_activity_sessions s
    join public.health_activity_session_items i on i.session_id = s.id
   where s.user_id = '11111111-1111-4111-8111-111111111111'
     and s.started_at = '2026-07-10T10:00:00Z'::timestamptz
     and i.item_key = 'bench_press'
   order by s.id desc
   limit 1;

  v_lookup := public.activity_v2_last_performance('  bench_press  ');
  perform midas_fixture.assert_true(
    v_lookup #>> '{session,id}' = v_expected_session::text
    and v_lookup #>> '{item,id}' = v_expected_item::text
    and (select pg_catalog.array_agg((x.value ->> 'set_order')::integer)
           from pg_catalog.jsonb_array_elements(v_lookup #> '{item,sets}') x(value))
        = array[1, 2]
    and pg_catalog.jsonb_array_length(v_lookup #> '{item,sets}') = 2,
    'lookup tie-break or full ordered item block drifted'
  );
  perform midas_fixture.assert_true(
    public.activity_v2_last_performance('cycling') is null,
    'no-history lookup did not return null'
  );
end;
$$;

create or replace procedure midas_fixture.expect_lookup_error(
  p_item_key text,
  p_token text
)
language plpgsql
set search_path = ''
as $procedure$
declare
  v_failed boolean := false;
  v_message text;
begin
  begin
    perform public.activity_v2_last_performance(p_item_key);
  exception when others then
    v_failed := true;
    get stacked diagnostics v_message = message_text;
    if pg_catalog.strpos(v_message, p_token) = 0 then
      raise exception 'unexpected lookup error: %', v_message;
    end if;
  end;
  if not v_failed then
    raise exception 'expected lookup error token %', p_token;
  end if;
end;
$procedure$;

call midas_fixture.expect_lookup_error(
  'Running', 'MIDAS_ACTIVITY_INVALID_ITEM_KEY'
);

\echo 'S4.5 fixture: deterministic two-connection commit/rollback races'

-- Supabase's postgres role is intentionally not a superuser. dblink rejects
-- trust-authenticated connections for non-superusers because no password was
-- actually consumed, even when one is present in the conninfo. The guarded
-- disposable race section therefore reconnects as the local stack's
-- supabase_admin and returns to postgres immediately afterwards.
\connect "host=127.0.0.1 port=5432 dbname=midas_activity_v2_s45 user=supabase_admin password=postgres"

do $$
declare
  v_conn text := 'host=127.0.0.1 port=5432 dbname=midas_activity_v2_s45 user=postgres password=postgres';
  v_winner jsonb;
  v_contender jsonb;
begin
  perform extensions.dblink_connect('race_commit_winner', v_conn);
  perform extensions.dblink_connect('race_commit_contender', v_conn);
  perform * from extensions.dblink(
    'race_commit_winner',
    $remote$select
      set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false),
      set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":false}', false)$remote$
  ) as t(a text, b text);
  perform * from extensions.dblink(
    'race_commit_contender',
    $remote$select
      set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false),
      set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":false}', false)$remote$
  ) as t(a text, b text);
  perform extensions.dblink_exec('race_commit_winner', 'set role authenticated');
  perform extensions.dblink_exec('race_commit_contender', 'set role authenticated');
  perform extensions.dblink_exec('race_commit_winner', 'begin');

  select result into strict v_winner
    from extensions.dblink(
      'race_commit_winner',
      $remote$select public.activity_v2_commit_session(
        '10000000-0000-4000-8000-000000000040',
        midas_fixture.duration_payload('2026-07-20T10:00:00Z', 25)
      )$remote$
    ) as t(result jsonb);
  perform extensions.dblink_send_query(
    'race_commit_contender',
    $remote$select public.activity_v2_commit_session(
      '10000000-0000-4000-8000-000000000040',
      midas_fixture.duration_payload('2026-07-20T10:00:00Z', 25)
    )$remote$
  );
  perform pg_catalog.pg_sleep(0.2);
  perform midas_fixture.assert_true(
    extensions.dblink_is_busy('race_commit_contender') = 1,
    'commit contender did not block on uncommitted winner'
  );
  perform extensions.dblink_exec('race_commit_winner', 'commit');
  select result into strict v_contender
    from extensions.dblink_get_result('race_commit_contender') as t(result jsonb);
  perform midas_fixture.assert_true(
    v_winner ->> 'outcome' = 'created'
    and v_contender ->> 'outcome' = 'replayed'
    and v_winner #>> '{session,id}' = v_contender #>> '{session,id}',
    'winner-commit race outcome drifted'
  );
  perform extensions.dblink_disconnect('race_commit_winner');
  perform extensions.dblink_disconnect('race_commit_contender');
end;
$$;

do $$
declare
  v_conn text := 'host=127.0.0.1 port=5432 dbname=midas_activity_v2_s45 user=postgres password=postgres';
  v_winner jsonb;
  v_contender jsonb;
begin
  perform extensions.dblink_connect('race_rollback_winner', v_conn);
  perform extensions.dblink_connect('race_rollback_contender', v_conn);
  perform * from extensions.dblink(
    'race_rollback_winner',
    $remote$select
      set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false),
      set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":false}', false)$remote$
  ) as t(a text, b text);
  perform * from extensions.dblink(
    'race_rollback_contender',
    $remote$select
      set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false),
      set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":false}', false)$remote$
  ) as t(a text, b text);
  perform extensions.dblink_exec('race_rollback_winner', 'set role authenticated');
  perform extensions.dblink_exec('race_rollback_contender', 'set role authenticated');
  perform extensions.dblink_exec('race_rollback_winner', 'begin');

  select result into strict v_winner
    from extensions.dblink(
      'race_rollback_winner',
      $remote$select public.activity_v2_commit_session(
        '10000000-0000-4000-8000-000000000041',
        midas_fixture.duration_payload('2026-07-21T10:00:00Z', 25)
      )$remote$
    ) as t(result jsonb);
  perform extensions.dblink_send_query(
    'race_rollback_contender',
    $remote$select public.activity_v2_commit_session(
      '10000000-0000-4000-8000-000000000041',
      midas_fixture.duration_payload('2026-07-21T10:00:00Z', 25)
    )$remote$
  );
  perform pg_catalog.pg_sleep(0.2);
  perform midas_fixture.assert_true(
    extensions.dblink_is_busy('race_rollback_contender') = 1,
    'rollback contender did not block on uncommitted winner'
  );
  perform extensions.dblink_exec('race_rollback_winner', 'rollback');
  select result into strict v_contender
    from extensions.dblink_get_result('race_rollback_contender') as t(result jsonb);
  perform midas_fixture.assert_true(
    v_winner ->> 'outcome' = 'created'
    and v_contender ->> 'outcome' = 'created'
    and v_winner #>> '{session,id}' <> v_contender #>> '{session,id}'
    and (select pg_catalog.count(*)
           from public.health_activity_sessions
          where user_id = '11111111-1111-4111-8111-111111111111'
            and request_id = '10000000-0000-4000-8000-000000000041') = 1,
    'winner-rollback race outcome drifted'
  );
  perform extensions.dblink_disconnect('race_rollback_winner');
  perform extensions.dblink_disconnect('race_rollback_contender');
end;
$$;

\connect "host=127.0.0.1 port=5432 dbname=midas_activity_v2_s45 user=postgres password=postgres"

\echo 'S4.5 fixture: cleanup R2 data'

truncate table
  public.health_activity_item_sets,
  public.health_activity_session_items,
  public.health_activity_sessions;

select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_sessions) = 0
  and (select pg_catalog.count(*) from public.health_activity_session_items) = 0
  and (select pg_catalog.count(*) from public.health_activity_item_sets) = 0
  and (select pg_catalog.count(*) from public.health_activity_catalog_entries) = 78,
  'fixture cleanup did not leave only immutable catalog rows'
);

\echo 'S4.5 fixture PASS'

-- Guarded, DML-free PostgreSQL-17 fixture for MIDAS R11 SQL 25.
-- It may run only in the dedicated disposable database below. The fixture
-- uses an empty Activity preimage; non-empty semantics are owned by S4.1.

\set ON_ERROR_STOP on

do $guard$
begin
  if pg_catalog.current_database() <> 'midas_activity_v2_r11_s42' then
    raise exception 'Activity consumer SQL 25 fixture requires database midas_activity_v2_r11_s42';
  end if;
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity consumer SQL 25 fixture requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity consumer SQL 25 fixture requires postgres';
  end if;
  if (select r.rolname from pg_catalog.pg_roles r
       where r.oid = (select d.datdba from pg_catalog.pg_database d
                       where d.datname = pg_catalog.current_database())) <> 'postgres' then
    raise exception 'Activity consumer SQL 25 fixture requires postgres database owner';
  end if;
end;
$guard$;

drop schema if exists midas_fixture cascade;
drop schema if exists auth cascade;
drop schema public cascade;
create schema public authorization postgres;
create schema auth authorization postgres;
create schema midas_fixture authorization postgres;

do $roles$
begin
  if pg_catalog.to_regrole('anon') is null then
    create role anon nologin;
  end if;
  if pg_catalog.to_regrole('authenticated') is null then
    create role authenticated nologin;
  end if;
  if pg_catalog.to_regrole('service_role') is null then
    create role service_role nologin bypassrls;
  end if;
end;
$roles$;

revoke all on schema public from public, anon, authenticated, service_role;
grant usage on schema public to authenticated, service_role;
revoke all on schema auth from public, anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
revoke all on schema midas_fixture from public, anon, authenticated, service_role;
grant usage on schema midas_fixture to authenticated;

create function auth.uid()
returns uuid
language sql
stable
set search_path = ''
as $function$
  select nullif(pg_catalog.current_setting('request.jwt.claim.sub', true), '')::uuid
$function$;

create function auth.jwt()
returns jsonb
language sql
stable
set search_path = ''
as $function$
  select coalesce(
    nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  )
$function$;

revoke all on function auth.uid(), auth.jwt()
  from public, anon, authenticated, service_role;
grant execute on function auth.uid(), auth.jwt()
  to anon, authenticated, service_role;

create function midas_fixture.assert_true(p_condition boolean, p_message text)
returns void
language plpgsql
set search_path = ''
as $function$
begin
  if p_condition is distinct from true then
    raise exception 'fixture assertion failed: %', p_message;
  end if;
end;
$function$;

create procedure midas_fixture.set_claims(p_user uuid, p_is_anonymous boolean)
language plpgsql
set search_path = ''
as $procedure$
begin
  perform pg_catalog.set_config(
    'request.jwt.claim.sub', coalesce(p_user::text, ''), false
  );
  perform pg_catalog.set_config(
    'request.jwt.claims',
    pg_catalog.jsonb_build_object('is_anonymous', p_is_anonymous)::text,
    false
  );
end;
$procedure$;

create procedure midas_fixture.expect_consumer_error(
  p_from date,
  p_to date,
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
    perform public.activity_consumer_snapshot(p_from, p_to);
  exception when others then
    v_failed := true;
    get stacked diagnostics v_message = message_text;
    if v_message <> p_token then
      raise exception 'unexpected consumer error: %', v_message;
    end if;
  end;
  if not v_failed then
    raise exception 'expected consumer error token %', p_token;
  end if;
end;
$procedure$;

grant execute on function midas_fixture.assert_true(boolean, text)
  to authenticated;
grant execute on procedure midas_fixture.expect_consumer_error(date, date, text)
  to authenticated;

create table public.health_events (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null,
  ts timestamptz not null default pg_catalog.now(),
  day date generated always as (
    (ts at time zone 'Europe/Vienna')::date
  ) stored,
  type text not null,
  ctx text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default pg_catalog.now()
);

create table public.health_activity_sessions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null,
  request_id uuid not null,
  request_fingerprint text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_min integer not null,
  day date generated always as (
    pg_catalog.timezone('Europe/Vienna', started_at)::date
  ) stored,
  title text,
  note text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  revision bigint not null default 1
);

create table public.health_activity_session_items (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null,
  session_id uuid not null,
  catalog_version integer not null,
  item_key text not null,
  item_order smallint not null,
  item_label_snapshot text not null,
  tracking_mode_snapshot text not null,
  equipment_snapshot text not null,
  load_comparability_snapshot text not null,
  field_policy_snapshot jsonb not null,
  duration_min integer,
  distance_km numeric(6,2),
  note text,
  created_at timestamptz not null default pg_catalog.now()
);

alter table public.health_events enable row level security;
alter table public.health_activity_sessions enable row level security;
alter table public.health_activity_session_items enable row level security;

create policy events_select_own on public.health_events
  for select using ((select auth.uid()) = user_id);
create policy events_insert_own on public.health_events
  for insert with check ((select auth.uid()) = user_id);
create policy events_update_own on public.health_events
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy events_delete_own on public.health_events
  for delete using ((select auth.uid()) = user_id);

create policy health_activity_sessions_select_own
  on public.health_activity_sessions
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and (((select auth.jwt()) ->> 'is_anonymous')::boolean is false)
  );
create policy health_activity_session_items_select_own
  on public.health_activity_session_items
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and (((select auth.jwt()) ->> 'is_anonymous')::boolean is false)
  );

revoke all on table public.health_events,
  public.health_activity_sessions,
  public.health_activity_session_items
  from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.health_events
  to authenticated, service_role;
grant select on table public.health_activity_sessions,
  public.health_activity_session_items
  to authenticated, service_role;

create view public.v_events_activity
  with (security_invoker = on)
as
select
  e.id,
  e.user_id,
  e.ts,
  e.day,
  e.payload ->> 'activity'::text as activity,
  (e.payload ->> 'duration_min'::text)::integer as duration_min,
  e.payload ->> 'note'::text as note
from public.health_events e
where e.type = 'activity_event'::text;

revoke all on table public.v_events_activity
  from public, anon, authenticated, service_role;
grant select on table public.v_events_activity to authenticated, service_role;

\echo 'R11 S4.2 T-ACT-R11-03: fresh and exact rerun'
\ir ../25_Activity_Consumer_Compatibility.sql
\ir ../25_Activity_Consumer_Compatibility.sql

select midas_fixture.assert_true(
  pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot(date,date)'
  ) is not null
  and (select pg_catalog.count(*) from pg_catalog.pg_proc p
       join pg_catalog.pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname='activity_consumer_snapshot') = 1,
  'SQL 25 exact function signature drifted'
);

select midas_fixture.assert_true(
  (select r.rolname='postgres' and p.provolatile='s' and not p.prosecdef
          and p.prorettype='jsonb'::pg_catalog.regtype
          and p.proconfig=array['search_path=""']::text[]
   from pg_catalog.pg_proc p join pg_catalog.pg_roles r on r.oid=p.proowner
   where p.oid='public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure),
  'SQL 25 owner/mode/search_path drifted'
);

select midas_fixture.assert_true(
  (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
    case when acl.grantee=0 then 'PUBLIC' else grantee.rolname end,
    grantor.rolname,acl.privilege_type,acl.is_grantable)
    order by case when acl.grantee=0 then 'PUBLIC' else grantee.rolname end,
      grantor.rolname,acl.privilege_type)
   from pg_catalog.pg_proc p
   cross join lateral pg_catalog.aclexplode(
     coalesce(p.proacl,pg_catalog.acldefault('f',p.proowner))) acl
   left join pg_catalog.pg_roles grantee on grantee.oid=acl.grantee
   join pg_catalog.pg_roles grantor on grantor.oid=acl.grantor
   where p.oid='public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure) =
  '[["authenticated","postgres","EXECUTE",false],["postgres","postgres","EXECUTE",false]]'::jsonb,
  'SQL 25 exact function ACL drifted'
);

select midas_fixture.assert_true(
  pg_catalog.has_function_privilege(
    'authenticated','public.activity_consumer_snapshot(date,date)','EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'anon','public.activity_consumer_snapshot(date,date)','EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'service_role','public.activity_consumer_snapshot(date,date)','EXECUTE'
  ),
  'SQL 25 effective function privileges drifted'
);

\echo 'R11 S4.2 T-ACT-R11-04: auth, RLS/BOLA, range and exact empty payload'
select pg_catalog.set_config('request.jwt.claim.sub','',false);
select pg_catalog.set_config('request.jwt.claims','{}',false);
set role authenticated;
call midas_fixture.expect_consumer_error(
  current_date-1,current_date-1,'MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED'
);
reset role;

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111','true'
);
set role authenticated;
call midas_fixture.expect_consumer_error(
  current_date-1,current_date-1,'MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED'
);
reset role;

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111','false'
);
set role authenticated;
call midas_fixture.expect_consumer_error(
  null,current_date-1,'MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE'
);
call midas_fixture.expect_consumer_error(
  current_date,current_date-1,'MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE'
);
call midas_fixture.expect_consumer_error(
  current_date+1,current_date+1,'MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE'
);
call midas_fixture.expect_consumer_error(
  current_date-400,current_date,'MIDAS_ACTIVITY_CONSUMER_RANGE_TOO_LARGE'
);
select midas_fixture.assert_true(
  public.activity_consumer_snapshot(current_date-399,current_date)
    #>> '{range,inclusive_days}' = '400',
  'SQL 25 rejected the inclusive 400-day boundary'
);
select midas_fixture.assert_true(
  public.activity_consumer_snapshot('2026-08-01','2026-08-01') =
  '{"schema_version":"midas.activity-consumer.v1","timezone":"Europe/Vienna","range":{"from":"2026-08-01","to":"2026-08-01","inclusive_days":1},"summary":{"unit_count":0,"active_day_count":0,"active_days_per_week":0,"total_duration_min":0,"average_duration_min":null,"last_day":null},"quality":{"mixed_source_day_count":0,"mixed_source_days":[]},"units":[]}'::jsonb,
  'SQL 25 exact empty payload drifted'
);
select midas_fixture.assert_true(
  (select pg_catalog.count(*)=0 from public.v_events_activity)
  and (select pg_catalog.count(*)=0 from public.health_activity_sessions)
  and (select pg_catalog.count(*)=0 from public.health_activity_session_items),
  'SQL 25 owner-A empty/RLS check drifted'
);
explain (format json)
  select public.activity_consumer_snapshot(current_date-1,current_date);
reset role;

\echo 'R11 S5 V1 source-domain fail-closed without Activity DML'
create or replace view public.v_events_activity
  with (security_invoker = on)
as
select
  e.id,
  e.user_id,
  e.ts,
  e.day,
  e.payload ->> 'activity'::text as activity,
  (e.payload ->> 'duration_min'::text)::integer as duration_min,
  e.payload ->> 'note'::text as note
from public.health_events e
where e.type = 'activity_event'::text
union all
select
  '33333333-3333-4333-8333-333333333333'::uuid,
  '11111111-1111-4111-8111-111111111111'::uuid,
  pg_catalog.timezone(
    'Europe/Vienna',
    (current_date - 1)::timestamp without time zone + time '12:00'
  ),
  current_date - 1,
  null::text,
  null::integer,
  ''::text;
call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111','false'
);
set role authenticated;
call midas_fixture.expect_consumer_error(
  current_date-1,current_date-1,'MIDAS_ACTIVITY_CONSUMER_SOURCE_INVALID'
);
reset role;
create or replace view public.v_events_activity
  with (security_invoker = on)
as
select
  e.id,
  e.user_id,
  e.ts,
  e.day,
  e.payload ->> 'activity'::text as activity,
  (e.payload ->> 'duration_min'::text)::integer as duration_min,
  e.payload ->> 'note'::text as note
from public.health_events e
where e.type = 'activity_event'::text;

call midas_fixture.set_claims(
  '22222222-2222-4222-8222-222222222222','false'
);
set role authenticated;
select midas_fixture.assert_true(
  public.activity_consumer_snapshot('2026-08-01','2026-08-01')
    #>> '{summary,unit_count}' = '0'
  and (select pg_catalog.count(*)=0 from public.v_events_activity)
  and (select pg_catalog.count(*)=0 from public.health_activity_sessions)
  and (select pg_catalog.count(*)=0 from public.health_activity_session_items),
  'SQL 25 owner-B empty/BOLA check drifted'
);
reset role;

select midas_fixture.assert_true(
  not exists (
    select 1 from pg_catalog.pg_proc p
    cross join lateral pg_catalog.aclexplode(
      coalesce(p.proacl,pg_catalog.acldefault('f',p.proowner))) acl
    where p.oid='public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
      and (acl.grantee=0 or acl.grantee in (
        pg_catalog.to_regrole('anon'),pg_catalog.to_regrole('service_role')))
  ),
  'SQL 25 leaked EXECUTE to PUBLIC, anon or service_role'
);

select midas_fixture.assert_true(
  pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) like '%public.v_events_activity%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) like '%public.health_activity_sessions%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) like '%public.health_activity_session_items%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) like '%v_v2_count > 1000%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) like '%count(*) > 50%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) like '%MIDAS_ACTIVITY_CONSUMER_LIMIT_EXCEEDED%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) like '%MIDAS_ACTIVITY_CONSUMER_SOURCE_INVALID%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) not like '%health_activity_item_sets%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) not like '%activity_v2_coaching_export%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) not like '%i.duration_min%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) not like '%weight_kg%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) not like '%recommendation%',
  'SQL 25 source allowlist or privacy/limit oracle drifted'
);

\echo 'R11 S4.2 drift matrix: overload, source, hardening, ACL and dependencies'
drop function public.activity_consumer_snapshot(date,date);
create function public.activity_consumer_snapshot(integer,integer)
returns jsonb language sql stable set search_path=''
as $function$ select '{}'::jsonb $function$;
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_consumer_snapshot(date,date)') is null
  and pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot(integer,integer)'
  ) is not null,
  'SQL 25 did not reject overload drift'
);
drop function public.activity_consumer_snapshot(integer,integer);
\ir ../25_Activity_Consumer_Compatibility.sql

grant execute on function public.activity_consumer_snapshot(date,date) to service_role;
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.has_function_privilege(
    'service_role','public.activity_consumer_snapshot(date,date)','EXECUTE'),
  'SQL 25 did not reject function ACL drift'
);
revoke execute on function public.activity_consumer_snapshot(date,date) from service_role;
\ir ../25_Activity_Consumer_Compatibility.sql

alter function public.activity_consumer_snapshot(date,date) security definer;
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  (select p.prosecdef from pg_catalog.pg_proc p
   where p.oid='public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure),
  'SQL 25 did not reject security mode drift'
);
alter function public.activity_consumer_snapshot(date,date) security invoker;
\ir ../25_Activity_Consumer_Compatibility.sql

alter function public.activity_consumer_snapshot(date,date) owner to authenticated;
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  (select r.rolname='authenticated' from pg_catalog.pg_proc p
   join pg_catalog.pg_roles r on r.oid=p.proowner
   where p.oid='public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure),
  'SQL 25 did not reject owner drift'
);
alter function public.activity_consumer_snapshot(date,date) owner to postgres;
revoke all on function public.activity_consumer_snapshot(date,date)
  from public,anon,authenticated,service_role;
grant execute on function public.activity_consumer_snapshot(date,date) to authenticated;
\ir ../25_Activity_Consumer_Compatibility.sql

create or replace function public.activity_consumer_snapshot(p_from date,p_to date)
returns jsonb language sql stable security invoker set search_path=''
as $function$ select '{"drift":true}'::jsonb $function$;
alter function public.activity_consumer_snapshot(date,date) owner to postgres;
revoke all on function public.activity_consumer_snapshot(date,date)
  from public,anon,authenticated,service_role;
grant execute on function public.activity_consumer_snapshot(date,date) to authenticated;
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  public.activity_consumer_snapshot('2026-08-01','2026-08-01')='{"drift":true}'::jsonb,
  'SQL 25 did not reject source drift'
);
drop function public.activity_consumer_snapshot(date,date);
\ir ../25_Activity_Consumer_Compatibility.sql

drop function public.activity_consumer_snapshot(date,date);
alter view public.v_events_activity set (security_invoker=off);
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_consumer_snapshot(date,date)') is null
  and (select c.reloptions=array['security_invoker=off']::text[]
   from pg_catalog.pg_class c
   where c.oid='public.v_events_activity'::pg_catalog.regclass),
  'SQL 25 did not reject view security drift'
);
alter view public.v_events_activity set (security_invoker=on);
\ir ../25_Activity_Consumer_Compatibility.sql

drop function public.activity_consumer_snapshot(date,date);
grant insert on table public.health_activity_sessions to authenticated;
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_consumer_snapshot(date,date)') is null
  and pg_catalog.has_table_privilege(
    'authenticated','public.health_activity_sessions','INSERT'),
  'SQL 25 did not reject table ACL drift'
);
revoke insert on table public.health_activity_sessions from authenticated;
\ir ../25_Activity_Consumer_Compatibility.sql

drop function public.activity_consumer_snapshot(date,date);
alter policy health_activity_sessions_select_own
  on public.health_activity_sessions using (true);
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_consumer_snapshot(date,date)') is null
  and (select pg_catalog.pg_get_expr(p.polqual,p.polrelid)='true'
   from pg_catalog.pg_policy p
   where p.polrelid='public.health_activity_sessions'::pg_catalog.regclass
     and p.polname='health_activity_sessions_select_own'),
  'SQL 25 did not reject policy drift'
);
alter policy health_activity_sessions_select_own
  on public.health_activity_sessions
  using (
    (select auth.uid()) = user_id
    and (((select auth.jwt()) ->> 'is_anonymous')::boolean is false)
  );
\ir ../25_Activity_Consumer_Compatibility.sql

\echo 'R11 S4.2 guarded rollback matrix'
\ir ../25_Activity_Consumer_Compatibility_Rollback.sql
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_consumer_snapshot(date,date)') is null
  and (select pg_catalog.count(*)=0 from public.health_events where type='activity_event')
  and (select pg_catalog.count(*)=0 from public.health_activity_sessions)
  and (select pg_catalog.count(*)=0 from public.health_activity_session_items),
  'SQL 25 canonical rollback postcondition drifted'
);

\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_consumer_snapshot(date,date)') is null,
  'SQL 25 second rollback changed the fresh preimage'
);
\ir ../25_Activity_Consumer_Compatibility.sql

grant execute on function public.activity_consumer_snapshot(date,date) to service_role;
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_consumer_snapshot(date,date)') is not null
  and pg_catalog.has_function_privilege(
    'service_role','public.activity_consumer_snapshot(date,date)','EXECUTE'),
  'SQL 25 rollback did not reject ACL drift'
);
revoke execute on function public.activity_consumer_snapshot(date,date) from service_role;

alter view public.v_events_activity set (security_invoker=off);
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_consumer_snapshot(date,date)') is not null,
  'SQL 25 rollback did not reject dependency drift'
);
alter view public.v_events_activity set (security_invoker=on);

create function public.activity_consumer_snapshot(integer,integer)
returns jsonb language sql stable set search_path=''
as $function$ select '{}'::jsonb $function$;
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_consumer_snapshot(date,date)') is not null
  and pg_catalog.to_regprocedure('public.activity_consumer_snapshot(integer,integer)') is not null,
  'SQL 25 rollback did not reject overload drift'
);
drop function public.activity_consumer_snapshot(integer,integer);

create or replace function public.activity_consumer_snapshot(p_from date,p_to date)
returns jsonb language sql stable security invoker set search_path=''
as $function$ select '{"rollback_drift":true}'::jsonb $function$;
alter function public.activity_consumer_snapshot(date,date) owner to postgres;
revoke all on function public.activity_consumer_snapshot(date,date)
  from public,anon,authenticated,service_role;
grant execute on function public.activity_consumer_snapshot(date,date) to authenticated;
\set ON_ERROR_STOP off
\ir ../25_Activity_Consumer_Compatibility_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  public.activity_consumer_snapshot('2026-08-01','2026-08-01') =
    '{"rollback_drift":true}'::jsonb,
  'SQL 25 rollback did not reject source drift'
);
drop function public.activity_consumer_snapshot(date,date);
\ir ../25_Activity_Consumer_Compatibility.sql

select midas_fixture.assert_true(
  (select pg_catalog.count(*)=0 from public.health_events where type='activity_event')
  and (select pg_catalog.count(*)=0 from public.health_activity_sessions)
  and (select pg_catalog.count(*)=0 from public.health_activity_session_items),
  'SQL 25 fixture performed Activity DML'
);

\echo 'R11 S4.2 SQL 25 fixture PASS'

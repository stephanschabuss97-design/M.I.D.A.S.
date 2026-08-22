-- Guarded disposable PostgreSQL-17 fixture for Activity V2 SQL 24.
-- It rebuilds R9, tests R10, and may run only in the dedicated local database
-- midas_activity_v2_s45, owned by and connected as postgres.

do $guard$
begin
  if pg_catalog.current_database() <> 'midas_activity_v2_s45' then
    raise exception 'Activity V2 SQL 24 fixture requires database midas_activity_v2_s45';
  end if;
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity V2 SQL 24 fixture requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity V2 SQL 24 fixture requires postgres';
  end if;
  if (select r.rolname from pg_catalog.pg_roles r
       where r.oid = (select d.datdba from pg_catalog.pg_database d
                       where d.datname = pg_catalog.current_database())) <> 'postgres' then
    raise exception 'Activity V2 SQL 24 fixture requires postgres database owner';
  end if;
end;
$guard$;

\echo 'R10 fixture: rebuild canonical R9 disposable postimage'
\ir 23_Activity_V2_History_Lifecycle_fixture.sql

\echo 'R10 T-ACT-R10-06: fresh, rerun, overload, source and ACL drift'
\ir ../24_Activity_V2_Coaching_Export.sql
\ir ../24_Activity_V2_Coaching_Export.sql

select midas_fixture.assert_true(
  pg_catalog.to_regprocedure(
    'public.activity_v2_coaching_export(date,date)'
  ) is not null
  and (select pg_catalog.count(*)
         from pg_catalog.pg_proc p
         join pg_catalog.pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
          and p.proname = 'activity_v2_coaching_export') = 1,
  'SQL 24 exact function signature drifted'
);

create function public.activity_v2_coaching_export(integer, integer)
returns jsonb language sql stable set search_path = ''
as $function$ select '{}'::jsonb $function$;
\set ON_ERROR_STOP off
\ir ../24_Activity_V2_Coaching_Export.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure(
    'public.activity_v2_coaching_export(integer,integer)'
  ) is not null,
  'SQL 24 did not reject a foreign overload'
);
drop function public.activity_v2_coaching_export(integer, integer);
\ir ../24_Activity_V2_Coaching_Export.sql

grant execute on function public.activity_v2_coaching_export(date, date)
  to service_role;
\set ON_ERROR_STOP off
\ir ../24_Activity_V2_Coaching_Export.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.has_function_privilege(
    'service_role', 'public.activity_v2_coaching_export(date,date)', 'EXECUTE'
  ),
  'SQL 24 did not reject ACL drift'
);
revoke execute on function public.activity_v2_coaching_export(date, date)
  from service_role;
\ir ../24_Activity_V2_Coaching_Export.sql

grant insert on table public.health_activity_sessions to authenticated;
\set ON_ERROR_STOP off
\ir ../24_Activity_V2_Coaching_Export.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.has_table_privilege(
    'authenticated', 'public.health_activity_sessions', 'INSERT'
  ),
  'SQL 24 did not reject table ACL drift'
);
revoke insert on table public.health_activity_sessions from authenticated;
\ir ../24_Activity_V2_Coaching_Export.sql

create or replace function public.activity_v2_coaching_export(p_from date, p_to date)
returns jsonb language sql stable security invoker set search_path = ''
as $function$ select '{"drift":true}'::jsonb $function$;
alter function public.activity_v2_coaching_export(date, date) owner to postgres;
revoke all on function public.activity_v2_coaching_export(date, date)
  from public, anon, authenticated, service_role;
grant execute on function public.activity_v2_coaching_export(date, date)
  to authenticated;
\set ON_ERROR_STOP off
\ir ../24_Activity_V2_Coaching_Export.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  public.activity_v2_coaching_export('2026-08-01', '2026-08-01') =
    '{"drift":true}'::jsonb,
  'SQL 24 did not reject source drift'
);
drop function public.activity_v2_coaching_export(date, date);
\ir ../24_Activity_V2_Coaching_Export.sql

\echo 'R10 T-ACT-R10-08: exact ACL, auth, range and empty export'
select midas_fixture.assert_true(
  pg_catalog.has_function_privilege(
    'authenticated', 'public.activity_v2_coaching_export(date,date)', 'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'anon', 'public.activity_v2_coaching_export(date,date)', 'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'service_role', 'public.activity_v2_coaching_export(date,date)', 'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'public', 'public.activity_v2_coaching_export(date,date)', 'EXECUTE'
  ),
  'SQL 24 API execute ACL drifted'
);

create or replace procedure midas_fixture.r10_expect_export_error(
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
    perform public.activity_v2_coaching_export(p_from, p_to);
  exception when others then
    v_failed := true;
    get stacked diagnostics v_message = message_text;
    if v_message <> p_token then
      raise exception 'unexpected export error: %', v_message;
    end if;
  end;
  if not v_failed then
    raise exception 'expected export error token %', p_token;
  end if;
end;
$procedure$;

select pg_catalog.set_config('request.jwt.claim.sub', '', false);
select pg_catalog.set_config('request.jwt.claims', '{}', false);
set role authenticated;
call midas_fixture.r10_expect_export_error(
  '2026-08-01', '2026-08-01', 'MIDAS_ACTIVITY_AUTH_REQUIRED'
);
reset role;

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'true'::jsonb
);
set role authenticated;
call midas_fixture.r10_expect_export_error(
  '2026-08-01', '2026-08-01', 'MIDAS_ACTIVITY_AUTH_REQUIRED'
);
reset role;

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;
call midas_fixture.r10_expect_export_error(
  null, '2026-08-01', 'MIDAS_ACTIVITY_INVALID_EXPORT_REQUEST'
);
call midas_fixture.r10_expect_export_error(
  '2026-08-02', '2026-08-01', 'MIDAS_ACTIVITY_INVALID_EXPORT_REQUEST'
);
call midas_fixture.r10_expect_export_error(
  '2025-07-31', '2026-08-01', 'MIDAS_ACTIVITY_INVALID_EXPORT_REQUEST'
);
call midas_fixture.r10_expect_export_error(
  '2099-01-01', '2099-01-01', 'MIDAS_ACTIVITY_INVALID_EXPORT_REQUEST'
);
select midas_fixture.assert_true(
  public.activity_v2_coaching_export('2026-08-01', '2026-08-01') @>
    '{"schema_version":"midas.activity-coaching-export.v1","quality":{"status":"no_data","cautions":["no_sessions_in_range"]},"completeness":{"status":"complete","truncated":false,"session_count":0,"item_count":0,"set_count":0},"sessions":[]}'::jsonb,
  'empty export contract drifted'
);
reset role;

\echo 'R10 T-ACT-R10-07/-09: v1/v2 modes, correction, deletion, sorting and BOLA'
insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222')
on conflict (id) do nothing;

insert into public.health_activity_sessions (
  id, user_id, request_id, request_fingerprint, started_at, ended_at,
  duration_min, title, note, revision
) values
  ('21000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111',
   '21000000-0000-4000-8000-000000000101', pg_catalog.repeat('1', 64),
   '2026-07-01T08:00:00Z', '2026-07-01T08:30:00Z', 30, 'Corrected strength', null, 2),
  ('21000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111',
   '21000000-0000-4000-8000-000000000102', pg_catalog.repeat('2', 64),
   '2026-07-02T08:00:00Z', '2026-07-02T08:45:00Z', 45, null, 'Team practice', 1),
  ('21000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111',
   '21000000-0000-4000-8000-000000000103', pg_catalog.repeat('3', 64),
   '2026-07-03T08:00:00Z', '2026-07-03T08:40:00Z', 40, 'Run', null, 1),
  ('21000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111',
   '21000000-0000-4000-8000-000000000104', pg_catalog.repeat('4', 64),
   '2026-07-04T08:00:00Z', '2026-07-04T09:00:00Z', 60, 'Mixed', null, 1),
  ('21000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111',
   '21000000-0000-4000-8000-000000000105', pg_catalog.repeat('5', 64),
   '2026-07-05T08:00:00Z', '2026-07-05T08:20:00Z', 20, 'Deleted', null, 1),
  ('22000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222',
   '22000000-0000-4000-8000-000000000101', pg_catalog.repeat('6', 64),
   '2026-07-02T09:00:00Z', '2026-07-02T09:30:00Z', 30, 'Foreign', null, 1);

insert into public.health_activity_session_items (
  id, user_id, session_id, catalog_version, item_key, item_order,
  item_label_snapshot, tracking_mode_snapshot, equipment_snapshot,
  load_comparability_snapshot, field_policy_snapshot,
  duration_min, distance_km, note
)
select x.id::uuid, x.user_id::uuid, x.session_id::uuid, x.catalog_version,
       c.item_key, x.item_order, c.label, c.tracking_mode, c.equipment,
       c.load_comparability, c.field_policy, x.duration_min, x.distance_km,
       x.note
  from (values
    ('31000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','21000000-0000-4000-8000-000000000001',1,'bench_press',1,null::integer,null::numeric,null::text),
    ('31000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','21000000-0000-4000-8000-000000000002',1,'football',1,45,null,null),
    ('31000000-0000-4000-8000-000000000003','11111111-1111-4111-8111-111111111111','21000000-0000-4000-8000-000000000003',2,'running',1,40,8.25,null),
    ('31000000-0000-4000-8000-000000000004','11111111-1111-4111-8111-111111111111','21000000-0000-4000-8000-000000000004',2,'assisted_pull_up',1,null,null,'Machine assistance'),
    ('31000000-0000-4000-8000-000000000005','11111111-1111-4111-8111-111111111111','21000000-0000-4000-8000-000000000004',2,'swimming',2,30,1.50,null),
    ('31000000-0000-4000-8000-000000000006','11111111-1111-4111-8111-111111111111','21000000-0000-4000-8000-000000000005',2,'football',1,20,null,null),
    ('32000000-0000-4000-8000-000000000001','22222222-2222-4222-8222-222222222222','22000000-0000-4000-8000-000000000001',2,'football',1,30,null,null)
  ) x(id,user_id,session_id,catalog_version,item_key,item_order,duration_min,distance_km,note)
  join public.health_activity_catalog_entries c
    on c.catalog_version = x.catalog_version and c.item_key = x.item_key;

insert into public.health_activity_item_sets (
  id, user_id, session_item_id, set_order, tracking_mode,
  reps, duration_sec, distance_m, weight_kg, assistance_kg
) values
  ('41000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','31000000-0000-4000-8000-000000000001',1,'strength_sets',10,null,null,80.00,null),
  ('41000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','31000000-0000-4000-8000-000000000001',2,'strength_sets',8,null,null,82.50,null),
  ('41000000-0000-4000-8000-000000000003','11111111-1111-4111-8111-111111111111','31000000-0000-4000-8000-000000000004',1,'strength_sets',8,null,null,null,30.00);

delete from public.health_activity_sessions
 where id = '21000000-0000-4000-8000-000000000005'
   and user_id = '11111111-1111-4111-8111-111111111111';

drop table if exists midas_fixture.r10_exports;
create table midas_fixture.r10_exports (
  actor text primary key,
  value jsonb not null
);
grant select, insert, update, delete on midas_fixture.r10_exports to authenticated;

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;
insert into midas_fixture.r10_exports(actor, value)
values ('owner', public.activity_v2_coaching_export('2026-07-01', '2026-07-31'));
reset role;

call midas_fixture.set_claims(
  '22222222-2222-4222-8222-222222222222', 'false'::jsonb
);
set role authenticated;
insert into midas_fixture.r10_exports(actor, value)
values ('foreign', public.activity_v2_coaching_export('2026-07-01', '2026-07-31'));
reset role;

select midas_fixture.assert_true(
  (select value #>> '{completeness,session_count}' from midas_fixture.r10_exports where actor='owner') = '4'
  and (select value #>> '{completeness,item_count}' from midas_fixture.r10_exports where actor='owner') = '5'
  and (select value #>> '{completeness,set_count}' from midas_fixture.r10_exports where actor='owner') = '3'
  and (select value #>> '{completeness,session_count}' from midas_fixture.r10_exports where actor='foreign') = '1',
  'export counts or owner isolation drifted'
);
select midas_fixture.assert_true(
  (select value #> '{quality,cautions}' from midas_fixture.r10_exports where actor='owner') =
    '["assistance_loads_present","device_relative_loads_present","multiple_catalog_versions_present"]'::jsonb
  and (select value #>> '{sessions,0,revision}' from midas_fixture.r10_exports where actor='owner') = '2'
  and (select value #>> '{sessions,0,session_id}' from midas_fixture.r10_exports where actor='owner') =
    '21000000-0000-4000-8000-000000000001'
  and (select value #>> '{sessions,3,session_id}' from midas_fixture.r10_exports where actor='owner') =
    '21000000-0000-4000-8000-000000000004'
  and (select value #>> '{sessions,3,items,0,item_order}' from midas_fixture.r10_exports where actor='owner') = '1'
  and (select value #>> '{sessions,3,items,1,item_order}' from midas_fixture.r10_exports where actor='owner') = '2',
  'quality, revision or deterministic ordering drifted'
);
select midas_fixture.assert_true(
  (select value::text from midas_fixture.r10_exports where actor='owner') not like '%user_id%'
  and (select value::text from midas_fixture.r10_exports where actor='owner') not like '%request_id%'
  and (select value::text from midas_fixture.r10_exports where actor='owner') not like '%fingerprint%'
  and (select value::text from midas_fixture.r10_exports where actor='owner') not like '%21000000-0000-4000-8000-000000000005%'
  and (select value::text from midas_fixture.r10_exports where actor='owner') not like '%22000000-0000-4000-8000-000000000001%',
  'privacy, deleted-session or BOLA boundary drifted'
);
select midas_fixture.assert_true(
  (select pg_catalog.array_agg(k order by k collate "C")
     from midas_fixture.r10_exports e
     cross join lateral pg_catalog.jsonb_object_keys(e.value) k
    where e.actor='owner') = array[
      'completeness','generated_at','quality','range','schema_version',
      'sessions','timezone','units'
    ]::text[]
  and (select value ->> 'generated_at' from midas_fixture.r10_exports where actor='owner') ~
    '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$',
  'top-level keyset or UTC timestamp format drifted'
);

\echo 'R10 T-ACT-R10-07: mixed version, order, catalog, snapshot and mode drift'
begin;
update public.health_activity_session_items
   set catalog_version = 1
 where id = '31000000-0000-4000-8000-000000000004';
call midas_fixture.set_claims('11111111-1111-4111-8111-111111111111','false'::jsonb);
set role authenticated;
call midas_fixture.r10_expect_export_error(
  '2026-07-01','2026-07-31','MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT'
);
reset role;
rollback;

begin;
update public.health_activity_session_items set item_order = 3
 where id = '31000000-0000-4000-8000-000000000005';
call midas_fixture.set_claims('11111111-1111-4111-8111-111111111111','false'::jsonb);
set role authenticated;
call midas_fixture.r10_expect_export_error(
  '2026-07-01','2026-07-31','MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT'
);
reset role;
rollback;

begin;
set local session_replication_role = replica;
update public.health_activity_session_items set catalog_version = 999
 where id = '31000000-0000-4000-8000-000000000003';
set local session_replication_role = origin;
call midas_fixture.set_claims('11111111-1111-4111-8111-111111111111','false'::jsonb);
set role authenticated;
call midas_fixture.r10_expect_export_error(
  '2026-07-01','2026-07-31','MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT'
);
reset role;
rollback;

begin;
update public.health_activity_session_items set equipment_snapshot = 'none'
 where id = '31000000-0000-4000-8000-000000000001';
call midas_fixture.set_claims('11111111-1111-4111-8111-111111111111','false'::jsonb);
set role authenticated;
call midas_fixture.r10_expect_export_error(
  '2026-07-01','2026-07-31','MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT'
);
reset role;
rollback;

begin;
set local session_replication_role = replica;
insert into public.health_activity_item_sets (
  id,user_id,session_item_id,set_order,tracking_mode,reps
) values (
  '41000000-0000-4000-8000-000000000099',
  '11111111-1111-4111-8111-111111111111',
  '31000000-0000-4000-8000-000000000003',1,'strength_sets',1
);
set local session_replication_role = origin;
call midas_fixture.set_claims('11111111-1111-4111-8111-111111111111','false'::jsonb);
set role authenticated;
call midas_fixture.r10_expect_export_error(
  '2026-07-01','2026-07-31','MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT'
);
reset role;
rollback;

\echo 'R10 T-ACT-R10-11: exact rollback, drift rejection, second rejection and forward'
grant execute on function public.activity_v2_coaching_export(date, date)
  to service_role;
\set ON_ERROR_STOP off
\ir ../24_Activity_V2_Coaching_Export_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_v2_coaching_export(date,date)') is not null,
  'SQL 24 rollback did not reject ACL drift'
);
revoke execute on function public.activity_v2_coaching_export(date, date)
  from service_role;
\ir ../24_Activity_V2_Coaching_Export_Rollback.sql
\set ON_ERROR_STOP off
\ir ../24_Activity_V2_Coaching_Export_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_v2_coaching_export(date,date)') is null,
  'SQL 24 second rollback was not rejected safely'
);
\ir ../24_Activity_V2_Coaching_Export.sql
\ir ../16_Explicit_Grants.sql

\echo 'R10 T-ACT-R10-11: SQL 16 rejects export source drift before grants'
create or replace function public.activity_v2_coaching_export(p_from date, p_to date)
returns jsonb language sql stable security invoker set search_path = ''
as $function$ select '{"drift":true}'::jsonb $function$;
grant execute on function public.activity_v2_coaching_export(date, date)
  to service_role;
\set ON_ERROR_STOP off
\ir ../16_Explicit_Grants.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.has_function_privilege(
    'service_role', 'public.activity_v2_coaching_export(date,date)', 'EXECUTE'
  ),
  'SQL 16 did not reject export source drift before changing grants'
);
revoke execute on function public.activity_v2_coaching_export(date, date)
  from service_role;
drop function public.activity_v2_coaching_export(date, date);
\ir ../24_Activity_V2_Coaching_Export.sql
\ir ../16_Explicit_Grants.sql

\echo 'R10 T-ACT-R10-09/-10: exact caps, over-caps and snapshot races under 8s'
truncate table public.health_activity_sessions cascade;
insert into auth.users(id) values ('33333333-3333-4333-8333-333333333333')
on conflict (id) do nothing;

insert into public.health_activity_sessions (
  id,user_id,request_id,request_fingerprint,started_at,ended_at,
  duration_min,title,note,revision
)
select
  (pg_catalog.substr(pg_catalog.md5('r10-session-'||g),1,8)||'-'||
   pg_catalog.substr(pg_catalog.md5('r10-session-'||g),9,4)||'-4'||
   pg_catalog.substr(pg_catalog.md5('r10-session-'||g),14,3)||'-8'||
   pg_catalog.substr(pg_catalog.md5('r10-session-'||g),18,3)||'-'||
   pg_catalog.substr(pg_catalog.md5('r10-session-'||g),21,12))::uuid,
  '33333333-3333-4333-8333-333333333333'::uuid,
  (pg_catalog.substr(pg_catalog.md5('r10-request-'||g),1,8)||'-'||
   pg_catalog.substr(pg_catalog.md5('r10-request-'||g),9,4)||'-4'||
   pg_catalog.substr(pg_catalog.md5('r10-request-'||g),14,3)||'-8'||
   pg_catalog.substr(pg_catalog.md5('r10-request-'||g),18,3)||'-'||
   pg_catalog.substr(pg_catalog.md5('r10-request-'||g),21,12))::uuid,
  pg_catalog.md5('r10-fingerprint-a-'||g)||pg_catalog.md5('r10-fingerprint-b-'||g),
  '2026-06-01T08:00:00Z'::timestamptz + pg_catalog.make_interval(secs => g),
  '2026-06-01T08:30:00Z'::timestamptz + pg_catalog.make_interval(secs => g),
  30, case when g=1 then 'Race preimage' else null end, null, 1
from pg_catalog.generate_series(1,1000) g;

with catalog as (
  select c.*, pg_catalog.row_number() over (order by c.item_key) as item_order
    from public.health_activity_catalog_entries c
   where c.catalog_version = 2
     and c.tracking_mode = 'strength_sets'
     and c.field_policy ->> 'reps' = 'required'
     and c.field_policy ->> 'weight_kg' = 'required'
     and c.field_policy ->> 'assistance_kg' = 'forbidden'
   order by c.item_key
   limit 10
), sessions as (
  select s.id, pg_catalog.row_number() over (order by s.id) as session_number
    from public.health_activity_sessions s
   where s.user_id = '33333333-3333-4333-8333-333333333333'
)
insert into public.health_activity_session_items (
  id,user_id,session_id,catalog_version,item_key,item_order,
  item_label_snapshot,tracking_mode_snapshot,equipment_snapshot,
  load_comparability_snapshot,field_policy_snapshot,duration_min,distance_km,note
)
select
  (pg_catalog.substr(pg_catalog.md5('r10-item-'||s.session_number||'-'||c.item_order),1,8)||'-'||
   pg_catalog.substr(pg_catalog.md5('r10-item-'||s.session_number||'-'||c.item_order),9,4)||'-4'||
   pg_catalog.substr(pg_catalog.md5('r10-item-'||s.session_number||'-'||c.item_order),14,3)||'-8'||
   pg_catalog.substr(pg_catalog.md5('r10-item-'||s.session_number||'-'||c.item_order),18,3)||'-'||
   pg_catalog.substr(pg_catalog.md5('r10-item-'||s.session_number||'-'||c.item_order),21,12))::uuid,
  '33333333-3333-4333-8333-333333333333'::uuid,s.id,c.catalog_version,c.item_key,
  c.item_order,c.label,c.tracking_mode,c.equipment,c.load_comparability,
  c.field_policy,null,null,null
from sessions s cross join catalog c;

with items as (
  select i.id, pg_catalog.row_number() over (order by i.id) as item_number
    from public.health_activity_session_items i
   where i.user_id = '33333333-3333-4333-8333-333333333333'
)
insert into public.health_activity_item_sets (
  id,user_id,session_item_id,set_order,tracking_mode,reps,weight_kg
)
select
  (pg_catalog.substr(pg_catalog.md5('r10-set-'||i.item_number||'-'||g),1,8)||'-'||
   pg_catalog.substr(pg_catalog.md5('r10-set-'||i.item_number||'-'||g),9,4)||'-4'||
   pg_catalog.substr(pg_catalog.md5('r10-set-'||i.item_number||'-'||g),14,3)||'-8'||
   pg_catalog.substr(pg_catalog.md5('r10-set-'||i.item_number||'-'||g),18,3)||'-'||
   pg_catalog.substr(pg_catalog.md5('r10-set-'||i.item_number||'-'||g),21,12))::uuid,
  '33333333-3333-4333-8333-333333333333'::uuid,i.id,g,'strength_sets',10,50.00
from items i cross join pg_catalog.generate_series(1,5) g;

select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_sessions where user_id='33333333-3333-4333-8333-333333333333')=1000
  and (select pg_catalog.count(*) from public.health_activity_session_items where user_id='33333333-3333-4333-8333-333333333333')=10000
  and (select pg_catalog.count(*) from public.health_activity_item_sets where user_id='33333333-3333-4333-8333-333333333333')=50000,
  'exact cap fixture cardinality drifted'
);

call midas_fixture.set_claims('33333333-3333-4333-8333-333333333333','false'::jsonb);
set role authenticated;
set statement_timeout = '8s';
do $exact_cap$
declare
  v_started timestamptz := pg_catalog.clock_timestamp();
  v_export jsonb;
  v_elapsed interval;
begin
  v_export := public.activity_v2_coaching_export('2026-06-01','2026-06-01');
  v_elapsed := pg_catalog.clock_timestamp() - v_started;
  perform midas_fixture.assert_true(
    v_export #>> '{completeness,session_count}' = '1000'
    and v_export #>> '{completeness,item_count}' = '10000'
    and v_export #>> '{completeness,set_count}' = '50000'
    and v_elapsed < interval '8 seconds',
    'exact-cap export exceeded counts or 8s budget: '||v_elapsed::text
  );
  raise notice 'R10 exact-cap elapsed: %, payload bytes: %',
    v_elapsed, pg_catalog.octet_length(v_export::text);
end;
$exact_cap$;
reset role;
reset statement_timeout;

insert into public.health_activity_sessions (
  id,user_id,request_id,request_fingerprint,started_at,ended_at,duration_min
) values (
  '50000000-0000-4000-8000-000000000001','33333333-3333-4333-8333-333333333333',
  '50000000-0000-4000-8000-000000000101',pg_catalog.repeat('7',64),
  '2026-06-01T12:00:00Z','2026-06-01T12:30:00Z',30
);
call midas_fixture.set_claims('33333333-3333-4333-8333-333333333333','false'::jsonb);
set role authenticated;
set statement_timeout='8s';
call midas_fixture.r10_expect_export_error(
  '2026-06-01','2026-06-01','MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED'
);
reset role;
reset statement_timeout;
delete from public.health_activity_sessions where id='50000000-0000-4000-8000-000000000001';

with target as (
  select s.id from public.health_activity_sessions s
   where s.user_id='33333333-3333-4333-8333-333333333333' order by s.id limit 1
), catalog as (
  select c.* from public.health_activity_catalog_entries c
   where c.catalog_version=2 and c.tracking_mode='strength_sets'
     and c.field_policy->>'reps'='required'
     and c.field_policy->>'weight_kg'='required'
     and c.field_policy->>'assistance_kg'='forbidden'
     and not exists (
       select 1 from public.health_activity_session_items i
        where i.session_id=(select id from target) and i.item_key=c.item_key
     )
   order by c.item_key limit 1
)
insert into public.health_activity_session_items (
  id,user_id,session_id,catalog_version,item_key,item_order,item_label_snapshot,
  tracking_mode_snapshot,equipment_snapshot,load_comparability_snapshot,
  field_policy_snapshot
)
select '50000000-0000-4000-8000-000000000002','33333333-3333-4333-8333-333333333333',
       t.id,c.catalog_version,c.item_key,11,c.label,c.tracking_mode,c.equipment,
       c.load_comparability,c.field_policy
from target t cross join catalog c;
call midas_fixture.set_claims('33333333-3333-4333-8333-333333333333','false'::jsonb);
set role authenticated;
set statement_timeout='8s';
call midas_fixture.r10_expect_export_error(
  '2026-06-01','2026-06-01','MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED'
);
reset role;
reset statement_timeout;
delete from public.health_activity_session_items where id='50000000-0000-4000-8000-000000000002';

insert into public.health_activity_item_sets (
  id,user_id,session_item_id,set_order,tracking_mode,reps,weight_kg
)
select '50000000-0000-4000-8000-000000000003',i.user_id,i.id,6,
       'strength_sets',10,50.00
  from public.health_activity_session_items i
 where i.user_id='33333333-3333-4333-8333-333333333333'
 order by i.id limit 1;
call midas_fixture.set_claims('33333333-3333-4333-8333-333333333333','false'::jsonb);
set role authenticated;
set statement_timeout='8s';
call midas_fixture.r10_expect_export_error(
  '2026-06-01','2026-06-01','MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED'
);
reset role;
reset statement_timeout;
delete from public.health_activity_item_sets where id='50000000-0000-4000-8000-000000000003';

do $snapshot_races$
declare
  v_conn text := 'host=127.0.0.1 port=5432 dbname=midas_activity_v2_s45 user=postgres password=postgres';
  v_pre text;
  v_post text;
  v_race text;
  v_target uuid;
begin
  perform extensions.dblink_connect('r10_export', v_conn);
  perform extensions.dblink_connect('r10_writer', v_conn);
  perform * from extensions.dblink(
    'r10_export',
    $remote$select
      set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false),
      set_config('request.jwt.claims','{"sub":"33333333-3333-4333-8333-333333333333","is_anonymous":false}',false)$remote$
  ) as t(a text,b text);
  perform extensions.dblink_exec('r10_export','set role authenticated');
  perform extensions.dblink_exec('r10_export','set statement_timeout=''8s''');
  perform * from extensions.dblink(
    'r10_writer',
    $remote$select
      set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false),
      set_config('request.jwt.claims','{"sub":"33333333-3333-4333-8333-333333333333","is_anonymous":false}',false)$remote$
  ) as t(a text,b text);
  perform extensions.dblink_exec('r10_writer','set role authenticated');
  select result into strict v_pre from extensions.dblink(
    'r10_writer',
    $remote$select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      (public.activity_v2_coaching_export('2026-06-01','2026-06-01') - 'generated_at')::text,'UTF8')),'hex')$remote$
  ) as t(result text);

  perform extensions.dblink_send_query(
    'r10_export',
    $remote$select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      (public.activity_v2_coaching_export('2026-06-01','2026-06-01') - 'generated_at')::text,'UTF8')),'hex')$remote$
  );
  perform pg_catalog.pg_sleep(0.02);
  perform extensions.dblink_exec('r10_writer','reset role');
  perform extensions.dblink_exec(
    'r10_writer',
    $remote$update public.health_activity_sessions
      set title='Race postimage', revision=revision+1, updated_at=pg_catalog.clock_timestamp()
      where id=(select id from public.health_activity_sessions
                 where user_id='33333333-3333-4333-8333-333333333333'
                 order by id limit 1)$remote$
  );
  perform extensions.dblink_exec('r10_writer','set role authenticated');
  select result into strict v_post from extensions.dblink(
    'r10_writer',
    $remote$select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      (public.activity_v2_coaching_export('2026-06-01','2026-06-01') - 'generated_at')::text,'UTF8')),'hex')$remote$
  ) as t(result text);
  select result into strict v_race from extensions.dblink_get_result('r10_export') as t(result text);
  perform * from extensions.dblink_get_result('r10_export') as t(result text);
  perform midas_fixture.assert_true(
    v_race = v_pre or v_race = v_post,
    'correction race mixed database snapshots'
  );

  v_pre := v_post;
  perform extensions.dblink_send_query(
    'r10_export',
    $remote$select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      (public.activity_v2_coaching_export('2026-06-01','2026-06-01') - 'generated_at')::text,'UTF8')),'hex')$remote$
  );
  perform pg_catalog.pg_sleep(0.02);
  perform extensions.dblink_exec('r10_writer','reset role');
  select id into strict v_target from public.health_activity_sessions
   where user_id='33333333-3333-4333-8333-333333333333'
   order by id desc limit 1;
  perform extensions.dblink_exec(
    'r10_writer',
    pg_catalog.format(
      'delete from public.health_activity_sessions where id=%L::uuid',v_target
    )
  );
  perform extensions.dblink_exec('r10_writer','set role authenticated');
  select result into strict v_post from extensions.dblink(
    'r10_writer',
    $remote$select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      (public.activity_v2_coaching_export('2026-06-01','2026-06-01') - 'generated_at')::text,'UTF8')),'hex')$remote$
  ) as t(result text);
  select result into strict v_race from extensions.dblink_get_result('r10_export') as t(result text);
  perform * from extensions.dblink_get_result('r10_export') as t(result text);
  perform midas_fixture.assert_true(
    v_race = v_pre or v_race = v_post,
    'delete race mixed database snapshots'
  );
  perform extensions.dblink_disconnect('r10_export');
  perform extensions.dblink_disconnect('r10_writer');
end;
$snapshot_races$;

truncate table public.health_activity_sessions cascade;
drop table midas_fixture.r10_exports;
drop procedure midas_fixture.r10_expect_export_error(date,date,text);
select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_sessions)=0
  and (select pg_catalog.count(*) from public.health_activity_session_items)=0
  and (select pg_catalog.count(*) from public.health_activity_item_sets)=0,
  'SQL 24 fixture final data cleanup failed'
);

\echo 'R10 Activity V2 SQL 24 full fixture PASS'

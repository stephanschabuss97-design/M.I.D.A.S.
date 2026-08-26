-- Guarded PostgreSQL-17 fixture for MIDAS R13 SQL 26.
-- It reuses the proven SQL 25 disposable preimage and may never target MIDAS.

\set ON_ERROR_STOP on
\ir 25_Activity_Consumer_Compatibility_fixture.sql

do $guard$
begin
  if pg_catalog.current_database() <> 'midas_activity_v2_r11_s42'
     or session_user <> 'postgres'
     or current_user <> 'postgres'
     or pg_catalog.current_setting('server_version_num')::integer
          not between 170000 and 179999 then
    raise exception 'Activity consumer SQL 26 fixture requires the dedicated PostgreSQL 17 database';
  end if;
end;
$guard$;

drop schema if exists midas_private cascade;
create schema midas_private authorization postgres;
revoke all on schema midas_private
  from public, anon, authenticated, service_role;
grant usage on schema midas_private to authenticated;

create function midas_private.activity_v2_canonical_content(
  p_catalog_version integer,
  p_duration_min integer,
  p_note text,
  p_items jsonb
)
returns jsonb
language sql
immutable
security invoker
set search_path = ''
as $function$
  select pg_catalog.jsonb_build_object(
    'catalog_version', p_catalog_version,
    'duration_min', p_duration_min,
    'note', p_note,
    'items', p_items
  )
$function$;
alter function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  owner to postgres;
revoke all on function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  to authenticated;

create table public.user_profile (id uuid primary key, payload jsonb not null);
create table public.trendpilot_state (id uuid primary key, payload jsonb not null);
create table public.trendpilot_events (id uuid primary key, payload jsonb not null);

insert into public.user_profile values
  ('11111111-1111-4111-8111-111111111111', '{"control":"profile"}');
insert into public.trendpilot_state values
  ('11111111-1111-4111-8111-111111111111', '{"control":"state"}');
insert into public.trendpilot_events values
  ('44444444-4444-4444-8444-444444444444', '{"control":"event"}');
insert into public.health_events (id, user_id, ts, type, payload) values
  (
    '55555555-5555-4555-8555-555555555555',
    '11111111-1111-4111-8111-111111111111',
    '2026-03-29 00:30:00+00',
    'activity_event',
    '{"activity":"Gehen","duration_min":30}'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    '22222222-2222-4222-8222-222222222222',
    '2026-03-29 02:30:00+00',
    'activity_event',
    '{"activity":"Fremd","duration_min":99}'
  );
insert into public.health_activity_sessions (
  id, user_id, request_id, request_fingerprint, started_at, ended_at,
  duration_min, title, note
) values (
  '77777777-7777-4777-8777-777777777777',
  '11111111-1111-4111-8111-111111111111',
  '88888888-8888-4888-8888-888888888888',
  'fixture-r13',
  '2026-03-29 01:30:00+00',
  '2026-03-29 02:15:00+00',
  45,
  'Krafttraining',
  null
);
insert into public.health_activity_session_items (
  id, user_id, session_id, catalog_version, item_key, item_order,
  item_label_snapshot, tracking_mode_snapshot, equipment_snapshot,
  load_comparability_snapshot, field_policy_snapshot, duration_min
) values (
  '99999999-9999-4999-8999-999999999999',
  '11111111-1111-4111-8111-111111111111',
  '77777777-7777-4777-8777-777777777777',
  1,
  'fixture',
  1,
  'Fixture',
  'duration',
  'none',
  'none',
  '{}'::jsonb,
  45
);

create temporary table midas_activity_consumer_r13_protected
on commit preserve rows
as
select pg_catalog.jsonb_build_object(
  'events', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id)
               from public.health_events e),
  'sessions', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id)
                 from public.health_activity_sessions s),
  'items', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id)
              from public.health_activity_session_items i),
  'profile', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(p) order by p.id)
                from public.user_profile p),
  'trend_state', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id)
                    from public.trendpilot_state s),
  'trend_events', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id)
                     from public.trendpilot_events e)
) as inventory;

\echo 'R13 S4.2 T-ACT-R13-L02: fresh, rerun, parity, ACL and BOLA'
\ir ../26_Activity_Consumer_Runtime_Activation.sql
\ir ../26_Activity_Consumer_Runtime_Activation.sql

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', false
);
select midas_fixture.assert_true(
  public.activity_consumer_snapshot('2026-03-29', '2026-03-29') =
  public.activity_consumer_snapshot_for_owner(
    '11111111-1111-4111-8111-111111111111', '2026-03-29', '2026-03-29'
  ),
  'SQL 26 user/service wrapper parity drifted'
);
set role authenticated;
select midas_fixture.assert_true(
  public.activity_consumer_snapshot('2026-03-29', '2026-03-29')
    #>> '{summary,unit_count}' = '2'
  and public.activity_consumer_snapshot('2026-03-29', '2026-03-29')
    #>> '{summary,active_day_count}' = '1'
  and public.activity_consumer_snapshot('2026-03-29', '2026-03-29')
    #>> '{quality,mixed_source_day_count}' = '1',
  'SQL 26 same-day V1/V2/mixed or Vienna projection drifted'
);
call midas_fixture.expect_consumer_error(
  current_date - 400, current_date,
  'MIDAS_ACTIVITY_CONSUMER_RANGE_TOO_LARGE'
);
select midas_fixture.assert_true(
  public.activity_consumer_snapshot(current_date - 399, current_date)
    #>> '{range,inclusive_days}' = '400',
  'SQL 26 rejected the inclusive 400-day boundary'
);
reset role;
call midas_fixture.set_claims(
  '22222222-2222-4222-8222-222222222222', false
);
set role authenticated;
select midas_fixture.assert_true(
  public.activity_consumer_snapshot('2026-03-29', '2026-03-29')
    #>> '{summary,unit_count}' = '1',
  'SQL 26 RLS/BOLA isolation drifted'
);
reset role;
call midas_fixture.set_claims(
  '33333333-3333-4333-8333-333333333333', false
);
set role authenticated;
select midas_fixture.assert_true(
  public.activity_consumer_snapshot('2026-03-29', '2026-03-29')
    #>> '{summary,unit_count}' = '0',
  'SQL 26 empty owner projection drifted'
);
reset role;

do $service_auth$
declare
  v_failed boolean := false;
  v_message text;
begin
  begin
    perform public.activity_consumer_snapshot_for_owner(
      null, current_date, current_date
    );
  exception when others then
    v_failed := true;
    get stacked diagnostics v_message = message_text;
    if v_message <> 'MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED' then
      raise exception 'unexpected service-wrapper error: %', v_message;
    end if;
  end;
  if not v_failed then
    raise exception 'SQL 26 service wrapper accepted a null owner';
  end if;
end;
$service_auth$;

set role service_role;
select (
  public.activity_consumer_snapshot_for_owner(
    '11111111-1111-4111-8111-111111111111', '2026-03-29', '2026-03-29'
  ) #>> '{summary,unit_count}' = '2'
) as midas_service_wrapper_ok \gset
reset role;
select midas_fixture.assert_true(
  :'midas_service_wrapper_ok'::boolean,
  'SQL 26 service wrapper returned the wrong owner snapshot'
);

select midas_fixture.assert_true(
  pg_catalog.has_function_privilege(
    'authenticated', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'service_role', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE'
  )
  and pg_catalog.has_function_privilege(
    'service_role',
    'public.activity_consumer_snapshot_for_owner(uuid,date,date)', 'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'authenticated',
    'public.activity_consumer_snapshot_for_owner(uuid,date,date)', 'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'service_role',
    'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)',
    'EXECUTE'
  ),
  'SQL 26 wrapper or protected R9 helper ACL drifted'
);
select midas_fixture.assert_true(
  pg_catalog.pg_get_functiondef(
    'midas_private.activity_consumer_snapshot_core(uuid,date,date)'::pg_catalog.regprocedure
  ) like '%v_v2_count > 1000%'
  and pg_catalog.pg_get_functiondef(
    'midas_private.activity_consumer_snapshot_core(uuid,date,date)'::pg_catalog.regprocedure
  ) like '%count(*) > 50%'
  and pg_catalog.pg_get_functiondef(
    'midas_private.activity_consumer_snapshot_core(uuid,date,date)'::pg_catalog.regprocedure
  ) like '%MIDAS_ACTIVITY_CONSUMER_LIMIT_EXCEEDED%'
  and pg_catalog.pg_get_functiondef(
    'midas_private.activity_consumer_snapshot_core(uuid,date,date)'::pg_catalog.regprocedure
  ) not like '%health_activity_item_sets%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
  ) not like '%union all%'
  and pg_catalog.pg_get_functiondef(
    'public.activity_consumer_snapshot_for_owner(uuid,date,date)'::pg_catalog.regprocedure
  ) not like '%union all%',
  'SQL 26 caps, source allowlist or single-union contract drifted'
);
select midas_fixture.assert_true(
  (select inventory from midas_activity_consumer_r13_protected) =
  pg_catalog.jsonb_build_object(
    'events', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id)
                 from public.health_events e),
    'sessions', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id)
                   from public.health_activity_sessions s),
    'items', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id)
                from public.health_activity_session_items i),
    'profile', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(p) order by p.id)
                  from public.user_profile p),
    'trend_state', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id)
                      from public.trendpilot_state s),
    'trend_events', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id)
                       from public.trendpilot_events e)
  ),
  'SQL 26 changed protected Activity/report/profile/trend rows'
);

select
  pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.pg_get_functiondef(
      'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
    ), 'UTF8')), 'hex') as user_sha256,
  pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.pg_get_functiondef(
      'public.activity_consumer_snapshot_for_owner(uuid,date,date)'::pg_catalog.regprocedure
    ), 'UTF8')), 'hex') as service_sha256,
  pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.pg_get_functiondef(
      'midas_private.activity_consumer_snapshot_core(uuid,date,date)'::pg_catalog.regprocedure
    ), 'UTF8')), 'hex') as core_sha256;

\echo 'R13 S4.2 T-ACT-R13-L02: guarded drift and rollback-forward matrix'
alter function public.activity_consumer_snapshot_for_owner(uuid, date, date)
  security definer;
\set ON_ERROR_STOP off
\ir ../26_Activity_Consumer_Runtime_Activation_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  (select p.prosecdef
     from pg_catalog.pg_proc p
    where p.oid =
      'public.activity_consumer_snapshot_for_owner(uuid,date,date)'::pg_catalog.regprocedure),
  'SQL 26 rollback did not reject hardening drift'
);
alter function public.activity_consumer_snapshot_for_owner(uuid, date, date)
  security invoker;

grant execute on function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  to service_role;
\set ON_ERROR_STOP off
\ir ../26_Activity_Consumer_Runtime_Activation.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.has_function_privilege(
    'service_role',
    'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)',
    'EXECUTE'
  ),
  'SQL 26 rerun did not reject protected R9 ACL drift'
);
revoke execute on function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  from service_role;

create function public.activity_consumer_snapshot_for_owner(integer, date, date)
returns jsonb language sql stable security invoker set search_path = ''
as $function$ select '{}'::jsonb $function$;
\set ON_ERROR_STOP off
\ir ../26_Activity_Consumer_Runtime_Activation.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot_for_owner(integer,date,date)'
  ) is not null,
  'SQL 26 rerun did not reject overload drift'
);
drop function public.activity_consumer_snapshot_for_owner(integer, date, date);

\ir ../26_Activity_Consumer_Runtime_Activation_Rollback.sql
select midas_fixture.assert_true(
  pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.pg_get_functiondef(
      'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
    ), 'UTF8')), 'hex') =
    'f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d'
  and pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot_for_owner(uuid,date,date)'
  ) is null
  and pg_catalog.to_regprocedure(
    'midas_private.activity_consumer_snapshot_core(uuid,date,date)'
  ) is null
  and not pg_catalog.has_schema_privilege(
    'service_role', 'midas_private', 'USAGE'
  ),
  'SQL 26 rollback did not restore the exact SQL 25/R9 postimage'
);
select midas_fixture.assert_true(
  (select inventory from midas_activity_consumer_r13_protected) =
  pg_catalog.jsonb_build_object(
    'events', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id)
                 from public.health_events e),
    'sessions', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id)
                   from public.health_activity_sessions s),
    'items', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id)
                from public.health_activity_session_items i),
    'profile', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(p) order by p.id)
                  from public.user_profile p),
    'trend_state', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id)
                      from public.trendpilot_state s),
    'trend_events', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id)
                       from public.trendpilot_events e)
  ),
  'SQL 26 rollback changed protected Activity/report/profile/trend rows'
);
\ir ../26_Activity_Consumer_Runtime_Activation.sql

select midas_fixture.assert_true(
  pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.pg_get_functiondef(
      'public.activity_consumer_snapshot(date,date)'::pg_catalog.regprocedure
    ), 'UTF8')), 'hex') =
    'cffcd679d91b86c621388e790752e3100be140dd582f1e1fe18cf2d5cff79f2b'
  and pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.pg_get_functiondef(
      'public.activity_consumer_snapshot_for_owner(uuid,date,date)'::pg_catalog.regprocedure
    ), 'UTF8')), 'hex') =
    'eb27ec4435af922a16a7758be7f22a5f0aa384b60d1c048ee237cd26b2df6f54'
  and pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.pg_get_functiondef(
      'midas_private.activity_consumer_snapshot_core(uuid,date,date)'::pg_catalog.regprocedure
    ), 'UTF8')), 'hex') =
    'abb596278b61d563e7e8e1277206e3b381c3331bd41375c66ed0c24e8933f79f',
  'SQL 26 forward-after-rollback hash drifted'
);

\echo 'R13 S4.2 SQL 26 fixture PASS'

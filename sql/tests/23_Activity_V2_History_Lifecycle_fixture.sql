-- Guarded disposable PostgreSQL 17 fixture for MIDAS Activity V2 R9 Block B.
--
-- NEVER run against a real MIDAS database. The fixture requires the exact
-- database midas_activity_v2_s45, owner postgres, and session_user postgres.
-- It rebuilds the R8 postimage, uses only synthetic rows, and ends with zero
-- Activity V2 session/item/set rows.

\set ON_ERROR_STOP on
\set VERBOSITY terse

do $guard$
begin
  if pg_catalog.current_database() <> 'midas_activity_v2_s45' then
    raise exception 'Activity V2 SQL 23 fixture requires database midas_activity_v2_s45';
  end if;
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity V2 SQL 23 fixture requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity V2 SQL 23 fixture requires postgres';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_database d join pg_catalog.pg_roles r on r.oid = d.datdba
     where d.datname = pg_catalog.current_database() and r.rolname = 'postgres'
  ) then
    raise exception 'Activity V2 SQL 23 fixture requires postgres-owned database';
  end if;
end;
$guard$;

drop schema if exists midas_private cascade;

\echo 'R9 Block B: rebuild exact R8 disposable postimage'
\ir 22_Activity_V2_Commit_Compatibility_fixture.sql

create or replace function midas_fixture.r9_football_replacement(
  p_duration integer,
  p_note text default null
)
returns jsonb
language sql
immutable
set search_path = ''
as $function$
  select pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-replacement.v1',
    'duration_min', p_duration,
    'note', p_note,
    'items', pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
      'item_key', 'football',
      'item_order', 1,
      'duration_min', p_duration,
      'distance_km', null,
      'note', null,
      'sets', '[]'::jsonb
    ))
  )
$function$;

create or replace function midas_fixture.r9_football_cycling_replacement(
  p_duration integer,
  p_note text default null
)
returns jsonb
language sql
immutable
set search_path = ''
as $function$
  select pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-replacement.v1',
    'duration_min', p_duration,
    'note', p_note,
    'items', pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'item_key', 'football',
        'item_order', 1,
        'duration_min', p_duration,
        'distance_km', null,
        'note', null,
        'sets', '[]'::jsonb
      ),
      pg_catalog.jsonb_build_object(
        'item_key', 'cycling',
        'item_order', 2,
        'duration_min', p_duration,
        'distance_km', 5.25,
        'note', 'Easy',
        'sets', '[]'::jsonb
      )
    )
  )
$function$;

create or replace function midas_fixture.r9_capture_replace(
  p_session_id uuid,
  p_revision bigint,
  p_fingerprint text,
  p_replacement jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  return public.activity_v2_replace_session(
    p_session_id, p_revision, p_fingerprint, p_replacement
  );
exception when others then
  return pg_catalog.jsonb_build_object('error', sqlerrm, 'sqlstate', sqlstate);
end;
$function$;

create or replace function midas_fixture.r9_capture_delete(
  p_session_id uuid,
  p_revision bigint,
  p_fingerprint text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  return public.activity_v2_delete_session(
    p_session_id, p_revision, p_fingerprint
  );
exception when others then
  return pg_catalog.jsonb_build_object('error', sqlerrm, 'sqlstate', sqlstate);
end;
$function$;

\echo 'R9 T-ACT-R9-10: fresh, exact rerun, fail-closed drift, rollback, forward'
\ir ../23_Activity_V2_History_Lifecycle.sql
\ir ../23_Activity_V2_History_Lifecycle.sql

select midas_fixture.assert_true(
  exists (
    select 1 from pg_catalog.pg_attribute a join pg_catalog.pg_attrdef d
      on d.adrelid = a.attrelid and d.adnum = a.attnum
     where a.attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and a.attname = 'revision' and a.atttypid = 'bigint'::pg_catalog.regtype
       and a.attnotnull and pg_catalog.pg_get_expr(d.adbin, d.adrelid) = '1'
  )
  and (select pg_catalog.count(*) from pg_catalog.pg_proc p
       join pg_catalog.pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = any (array[
         'activity_v2_list_sessions', 'activity_v2_session_detail',
         'activity_v2_replace_session', 'activity_v2_delete_session'
       ]::text[])) = 4,
  'fresh install or exact rerun failed'
);

create function public.activity_v2_list_sessions(text)
returns jsonb language sql set search_path = '' as 'select null::jsonb';
\set ON_ERROR_STOP off
\ir ../23_Activity_V2_History_Lifecycle.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure('public.activity_v2_list_sessions(text)') is not null
  and exists (
    select 1 from pg_catalog.pg_attribute a join pg_catalog.pg_attrdef d
      on d.adrelid = a.attrelid and d.adnum = a.attnum
     where a.attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and a.attname = 'revision' and a.atttypid = 'bigint'::pg_catalog.regtype
       and a.attnotnull and pg_catalog.pg_get_expr(d.adbin, d.adrelid) = '1'
  )
  and exists (
    select 1 from pg_catalog.pg_constraint c
     where c.conrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and c.conname = 'health_activity_sessions_revision_check'
       and pg_catalog.pg_get_constraintdef(c.oid) =
         'CHECK (((revision >= 1) AND (revision <= ''9223372036854775807''::bigint)))'
  ),
  'overload drift was overwritten'
);
drop function public.activity_v2_list_sessions(text);

alter function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  security definer;
\set ON_ERROR_STOP off
\ir ../23_Activity_V2_History_Lifecycle.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  exists (
    select 1 from pg_catalog.pg_proc p
     where p.oid = 'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)'::pg_catalog.regprocedure
       and p.prosecdef
  ),
  'helper hardening drift was overwritten'
);
alter function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  security invoker;

grant usage on schema midas_private to supabase_admin;
grant execute on function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  to supabase_admin;
\set ON_ERROR_STOP off
\ir ../23_Activity_V2_History_Lifecycle.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.has_schema_privilege('supabase_admin', 'midas_private', 'USAGE')
  and pg_catalog.has_function_privilege(
    'supabase_admin',
    'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)',
    'EXECUTE'
  ),
  'private ACL drift was silently canonicalized'
);
revoke usage on schema midas_private from supabase_admin;
revoke execute on function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  from supabase_admin;

alter table public.health_activity_sessions alter column revision set default 2;
\set ON_ERROR_STOP off
\ir ../23_Activity_V2_History_Lifecycle.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  (
    select pg_catalog.pg_get_expr(d.adbin, d.adrelid)
      from pg_catalog.pg_attribute a join pg_catalog.pg_attrdef d
        on d.adrelid = a.attrelid and d.adnum = a.attnum
     where a.attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and a.attname = 'revision'
  ) = '2',
  'revision default drift was overwritten'
);
alter table public.health_activity_sessions alter column revision set default 1;

\set ON_ERROR_STOP off
\ir ../23_Activity_V2_History_Lifecycle_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  exists (
    select 1 from pg_catalog.pg_attribute
     where attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and attname = 'revision' and attnum > 0 and not attisdropped
  ),
  'rollback ran without operative non-use confirmation'
);

select pg_catalog.set_config(
  'midas.activity_v2_r9_operational_nonuse_confirmed', 'true', false
);
\ir ../23_Activity_V2_History_Lifecycle_Rollback.sql
select pg_catalog.set_config(
  'midas.activity_v2_r9_operational_nonuse_confirmed', 'false', false
);
\set ON_ERROR_STOP off
\ir ../23_Activity_V2_History_Lifecycle_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  not exists (
    select 1 from pg_catalog.pg_attribute
     where attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and attname = 'revision' and attnum > 0 and not attisdropped
  ),
  'rollback rerun guard changed the R8 postimage'
);
\ir ../23_Activity_V2_History_Lifecycle.sql
\ir ../23_Activity_V2_History_Lifecycle.sql
\ir ../16_Explicit_Grants.sql

\echo 'R9 T-ACT-R9-11/-12: revision, bounded reads, canonical fingerprint, correction'

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;

select public.activity_v2_commit_session(
  '53000000-0000-4000-8000-000000000001',
  midas_fixture.duration_payload_version(2, '2026-08-10T10:00:00.000000Z', 30)
);
select public.activity_v2_commit_session(
  '53000000-0000-4000-8000-000000000002',
  midas_fixture.duration_payload_version(2, '2026-08-11T10:00:00.000000Z', 31)
);
select public.activity_v2_commit_session(
  '53000000-0000-4000-8000-000000000003',
  pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session.v1',
    'catalog_version', 2,
    'started_at', '2026-08-12T10:00:00.000000Z',
    'ended_at', '2026-08-12T10:32:00.000000Z',
    'duration_min', 32,
    'items', pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
      'item_key', 'bench_press',
      'item_order', 1,
      'sets', pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
        'set_order', 1,
        'reps', 8,
        'weight_kg', 80.00
      ))
    ))
  )
);

do $reads$
declare
  v_page jsonb;
  v_next jsonb;
  v_detail jsonb;
  v_session_id uuid;
begin
  v_page := public.activity_v2_list_sessions(2, null, null);
  perform midas_fixture.assert_true(
    v_page ->> 'schema_version' = 'midas.activity-session-history-page.v1'
    and pg_catalog.jsonb_array_length(v_page -> 'items') = 2
    and (v_page ->> 'has_more')::boolean
    and v_page -> 'next_cursor' is not null
    and v_page #>> '{items,0,revision}' = '1'
    and not (v_page #> '{items,0}' ? 'sets'),
    'bounded first history page drifted'
  );
  v_next := public.activity_v2_list_sessions(
    2,
    (v_page #>> '{next_cursor,started_at}')::timestamptz,
    (v_page #>> '{next_cursor,id}')::uuid
  );
  perform midas_fixture.assert_true(
    pg_catalog.jsonb_array_length(v_next -> 'items') = 1
    and not (v_next ->> 'has_more')::boolean
    and v_next -> 'next_cursor' = 'null'::jsonb,
    'bounded keyset continuation drifted'
  );

  select s.id into strict v_session_id
    from public.health_activity_sessions s
   where s.request_id = '53000000-0000-4000-8000-000000000001';
  v_detail := public.activity_v2_session_detail(v_session_id);
  perform midas_fixture.assert_true(
    v_detail ->> 'catalog_version' = '2'
    and v_detail ->> 'revision' = '1'
    and v_detail ->> 'content_fingerprint' ~ '^[0-9a-f]{64}$'
    and not (v_detail ? 'request_id')
    and not (v_detail #> '{items,0}' ? 'id')
    and not (v_detail #> '{items,0}' ? 'created_at')
    and (select pg_catalog.count(*) from pg_catalog.pg_attribute a
         where a.attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
           and a.attname in ('revision', 'content_fingerprint', 'catalog_version')
           and a.attnum > 0 and not a.attisdropped) = 1,
    'snapshot detail, revision, or derived fingerprint drifted'
  );
end;
$reads$;

do $correction$
declare
  v_session_id uuid;
  v_before public.health_activity_sessions%rowtype;
  v_before_snapshot jsonb;
  v_detail jsonb;
  v_result jsonb;
  v_after jsonb;
  v_children_before text;
  v_children_after text;
begin
  select s.* into strict v_before
    from public.health_activity_sessions s
   where s.request_id = '53000000-0000-4000-8000-000000000001';
  v_session_id := v_before.id;
  select pg_catalog.jsonb_build_object(
           'label', i.item_label_snapshot,
           'mode', i.tracking_mode_snapshot,
           'equipment', i.equipment_snapshot,
           'load', i.load_comparability_snapshot,
           'policy', i.field_policy_snapshot
         )
    into strict v_before_snapshot
    from public.health_activity_session_items i
   where i.session_id = v_session_id and i.item_key = 'football';
  v_detail := public.activity_v2_session_detail(v_session_id);

  v_result := public.activity_v2_replace_session(
    v_session_id, 999, pg_catalog.repeat('0', 64),
    midas_fixture.r9_football_replacement(30, null)
  );
  perform midas_fixture.assert_true(
    v_result ->> 'outcome' = 'replayed'
    and v_result ->> 'revision' = '1'
    and v_result ->> 'content_fingerprint' = v_detail ->> 'content_fingerprint',
    'exact replay did not precede stale CAS'
  );

  v_result := public.activity_v2_replace_session(
    v_session_id, 1, v_detail ->> 'content_fingerprint',
    midas_fixture.r9_football_cycling_replacement(35, 'Corrected')
  );
  v_after := public.activity_v2_session_detail(v_session_id);
  perform midas_fixture.assert_true(
    v_result ->> 'outcome' = 'updated'
    and v_result ->> 'revision' = '2'
    and v_after ->> 'revision' = '2'
    and v_after ->> 'content_fingerprint' = v_result ->> 'content_fingerprint'
    and v_after ->> 'duration_min' = '35'
    and v_after ->> 'ended_at' = '2026-08-10T10:35:00.000Z'
    and v_after ->> 'catalog_version' = '2'
    and v_after #>> '{items,1,item_key}' = 'cycling'
    and v_after #>> '{items,1,item_label_snapshot}' = (
      select c.label from public.health_activity_catalog_entries c
       where c.catalog_version = 2 and c.item_key = 'cycling'
    )
    and v_before.id = (select s.id from public.health_activity_sessions s where s.id = v_session_id)
    and v_before.user_id = (select s.user_id from public.health_activity_sessions s where s.id = v_session_id)
    and v_before.request_id = (select s.request_id from public.health_activity_sessions s where s.id = v_session_id)
    and v_before.request_fingerprint = (select s.request_fingerprint from public.health_activity_sessions s where s.id = v_session_id)
    and v_before.started_at = (select s.started_at from public.health_activity_sessions s where s.id = v_session_id)
    and v_before.title is not distinct from (select s.title from public.health_activity_sessions s where s.id = v_session_id)
    and v_before.created_at = (select s.created_at from public.health_activity_sessions s where s.id = v_session_id)
    and v_before_snapshot = (
      select pg_catalog.jsonb_build_object(
        'label', i.item_label_snapshot, 'mode', i.tracking_mode_snapshot,
        'equipment', i.equipment_snapshot, 'load', i.load_comparability_snapshot,
        'policy', i.field_policy_snapshot)
      from public.health_activity_session_items i
      where i.session_id = v_session_id and i.item_key = 'football'
    ),
    'correction, immutable identity, snapshot preservation, or original-version add drifted'
  );

  select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.jsonb_build_object(
      'session', (select pg_catalog.to_jsonb(s) from public.health_activity_sessions s where s.id = v_session_id),
      'items', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id)
                  from public.health_activity_session_items i where i.session_id = v_session_id),
      'sets', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id)
                 from public.health_activity_item_sets st
                 join public.health_activity_session_items i on i.id = st.session_item_id
                where i.session_id = v_session_id)
    )::text, 'UTF8')), 'hex') into v_children_before;
  v_result := midas_fixture.r9_capture_replace(
    v_session_id, 1, v_detail ->> 'content_fingerprint',
    midas_fixture.r9_football_replacement(40, 'Stale')
  );
  select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.jsonb_build_object(
      'session', (select pg_catalog.to_jsonb(s) from public.health_activity_sessions s where s.id = v_session_id),
      'items', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id)
                  from public.health_activity_session_items i where i.session_id = v_session_id),
      'sets', (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id)
                 from public.health_activity_item_sets st
                 join public.health_activity_session_items i on i.id = st.session_item_id
                where i.session_id = v_session_id)
    )::text, 'UTF8')), 'hex') into v_children_after;
  perform midas_fixture.assert_true(
    v_result ->> 'error' = 'MIDAS_ACTIVITY_SESSION_CONFLICT'
    and v_children_before = v_children_after,
    'stale CAS did not fail atomically'
  );
end;
$correction$;

reset role;

\echo 'R9 T-ACT-R9-12: exhausted revision and snapshot-drift fail-closed paths'

-- Revision exhaustion is synthetic and local; no product path can write it.
update public.health_activity_sessions
   set revision = 9223372036854775807
 where request_id = '53000000-0000-4000-8000-000000000002';
call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;
do $exhausted$
declare
  v_session_id uuid;
  v_detail jsonb;
  v_result jsonb;
begin
  select id into strict v_session_id from public.health_activity_sessions
   where request_id = '53000000-0000-4000-8000-000000000002';
  v_detail := public.activity_v2_session_detail(v_session_id);
  v_result := midas_fixture.r9_capture_replace(
    v_session_id,
    9223372036854775807,
    v_detail ->> 'content_fingerprint',
    midas_fixture.r9_football_replacement(40, 'Exhausted')
  );
  perform midas_fixture.assert_true(
    v_result ->> 'error' = 'MIDAS_ACTIVITY_REVISION_EXHAUSTED'
    and (select revision from public.health_activity_sessions where id = v_session_id) =
      9223372036854775807
    and public.activity_v2_session_detail(v_session_id) = v_detail,
    'revision exhaustion changed persisted content'
  );
end;
$exhausted$;
reset role;
update public.health_activity_sessions
   set revision = 1
 where request_id = '53000000-0000-4000-8000-000000000002';

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;
select public.activity_v2_commit_session(
  '53000000-0000-4000-8000-000000000004',
  midas_fixture.duration_payload_version(2, '2026-08-09T10:00:00.000000Z', 30)
);
reset role;

insert into public.health_activity_session_items (
  user_id, session_id, catalog_version, item_key, item_order,
  item_label_snapshot, tracking_mode_snapshot, equipment_snapshot,
  load_comparability_snapshot, field_policy_snapshot,
  duration_min, distance_km, note
)
select
  s.user_id, s.id, 1, c.item_key, 2,
  c.label, c.tracking_mode, c.equipment, c.load_comparability, c.field_policy,
  30, 5.25, null
from public.health_activity_sessions s
join public.health_activity_catalog_entries c
  on c.catalog_version = 1 and c.item_key = 'cycling'
where s.request_id = '53000000-0000-4000-8000-000000000004';

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;
do $mixed_drift$
declare
  v_session_id uuid;
  v_detail_failed boolean := false;
  v_replace jsonb;
  v_delete jsonb;
begin
  select id into strict v_session_id from public.health_activity_sessions
   where request_id = '53000000-0000-4000-8000-000000000004';
  begin
    perform public.activity_v2_session_detail(v_session_id);
  exception when others then
    v_detail_failed := sqlerrm = 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT';
  end;
  v_replace := midas_fixture.r9_capture_replace(
    v_session_id, 1, pg_catalog.repeat('0', 64),
    midas_fixture.r9_football_replacement(31, null)
  );
  v_delete := midas_fixture.r9_capture_delete(
    v_session_id, 1, pg_catalog.repeat('0', 64)
  );
  perform midas_fixture.assert_true(
    v_detail_failed
    and v_replace ->> 'error' = 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT'
    and v_delete ->> 'error' = 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT'
    and (select pg_catalog.count(*) from public.health_activity_session_items
          where session_id = v_session_id) = 2,
    'mixed original catalog version did not fail closed'
  );
end;
$mixed_drift$;
reset role;
delete from public.health_activity_sessions
 where request_id = '53000000-0000-4000-8000-000000000004';

\echo 'R9 T-ACT-R9-14/-15: delete cascade, repeat, ownership, auth, and ACL'

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;
do $delete$
declare
  v_session_id uuid;
  v_item_id uuid;
  v_set_id uuid;
  v_detail jsonb;
  v_result jsonb;
begin
  select id into strict v_session_id from public.health_activity_sessions
   where request_id = '53000000-0000-4000-8000-000000000003';
  select i.id, st.id into strict v_item_id, v_set_id
    from public.health_activity_session_items i
    join public.health_activity_item_sets st on st.session_item_id = i.id
   where i.session_id = v_session_id and st.set_order = 1;
  v_detail := public.activity_v2_session_detail(v_session_id);
  v_result := public.activity_v2_delete_session(
    v_session_id,
    (v_detail ->> 'revision')::bigint,
    v_detail ->> 'content_fingerprint'
  );
  perform midas_fixture.assert_true(
    v_result ->> 'outcome' = 'deleted'
    and public.activity_v2_session_detail(v_session_id) is null
    and not exists (
      select 1 from public.health_activity_session_items where id = v_item_id
    )
    and not exists (
      select 1 from public.health_activity_item_sets where id = v_set_id
    ),
    'hard delete did not remove detail'
  );
  v_result := public.activity_v2_delete_session(
    v_session_id,
    (v_detail ->> 'revision')::bigint,
    v_detail ->> 'content_fingerprint'
  );
  perform midas_fixture.assert_true(
    v_result ->> 'outcome' = 'already_absent',
    'repeated hard delete was not idempotent'
  );
end;
$delete$;
reset role;
select midas_fixture.assert_true(
  not exists (
    select 1 from public.health_activity_sessions s
     where s.request_id = '53000000-0000-4000-8000-000000000003'
  )
  and not exists (
    select 1 from public.health_activity_session_items i
     join public.health_activity_sessions s on s.id = i.session_id
     where s.request_id = '53000000-0000-4000-8000-000000000003'
  ),
  'session/item/set cascade left a row'
);

-- A foreign owner receives the same non-enumerating outer contracts.
select pg_catalog.set_config(
  'midas.fixture.foreign_session_id',
  (select id::text from public.health_activity_sessions
    where request_id = '53000000-0000-4000-8000-000000000001'),
  false
);
call midas_fixture.set_claims(
  '22222222-2222-4222-8222-222222222222', 'false'::jsonb
);
set role authenticated;
do $foreign$
declare
  v_session_id uuid :=
    pg_catalog.current_setting('midas.fixture.foreign_session_id')::uuid;
  v_replace jsonb;
  v_delete jsonb;
begin
  v_replace := midas_fixture.r9_capture_replace(
    v_session_id, 2, pg_catalog.repeat('0', 64),
    midas_fixture.r9_football_replacement(35, 'Foreign')
  );
  v_delete := midas_fixture.r9_capture_delete(
    v_session_id, 2, pg_catalog.repeat('0', 64)
  );
  perform midas_fixture.assert_true(
    public.activity_v2_session_detail(v_session_id) is null
    and v_replace ->> 'error' = 'MIDAS_ACTIVITY_SESSION_NOT_FOUND'
    and v_delete ->> 'outcome' = 'already_absent',
    'foreign owner contract leaked session existence'
  );
end;
$foreign$;
reset role;

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'true'::jsonb
);
set role authenticated;
do $anonymous$
declare
  v_session_id uuid :=
    pg_catalog.current_setting('midas.fixture.foreign_session_id')::uuid;
  v_list_failed boolean := false;
  v_detail_failed boolean := false;
  v_replace jsonb;
  v_delete jsonb;
begin
  begin perform public.activity_v2_list_sessions(20, null, null);
  exception when others then v_list_failed := sqlerrm = 'MIDAS_ACTIVITY_AUTH_REQUIRED'; end;
  begin perform public.activity_v2_session_detail(v_session_id);
  exception when others then v_detail_failed := sqlerrm = 'MIDAS_ACTIVITY_AUTH_REQUIRED'; end;
  v_replace := midas_fixture.r9_capture_replace(
    v_session_id, 2, pg_catalog.repeat('0', 64),
    midas_fixture.r9_football_replacement(35, null)
  );
  v_delete := midas_fixture.r9_capture_delete(
    v_session_id, 2, pg_catalog.repeat('0', 64)
  );
  perform midas_fixture.assert_true(
    v_list_failed and v_detail_failed
    and v_replace ->> 'error' = 'MIDAS_ACTIVITY_AUTH_REQUIRED'
    and v_delete ->> 'error' = 'MIDAS_ACTIVITY_AUTH_REQUIRED',
    'anonymous authenticated-role calls crossed permanent-user boundary'
  );
end;
$anonymous$;
reset role;

do $security$
declare
  v_name text;
  v_oid oid;
  v_security boolean;
  v_volatility "char";
  v_direct_auth_failed boolean := false;
  v_direct_service_failed boolean := false;
begin
  for v_name, v_oid, v_security, v_volatility in
    select * from (values
      ('list', 'public.activity_v2_list_sessions(integer,timestamp with time zone,uuid)'::regprocedure::oid, false, 's'::"char"),
      ('detail', 'public.activity_v2_session_detail(uuid)'::regprocedure::oid, false, 's'::"char"),
      ('replace', 'public.activity_v2_replace_session(uuid,bigint,text,jsonb)'::regprocedure::oid, true, 'v'::"char"),
      ('delete', 'public.activity_v2_delete_session(uuid,bigint,text)'::regprocedure::oid, true, 'v'::"char")
    ) x(name, oid, security, volatility)
  loop
    perform midas_fixture.assert_true(
      exists (
        select 1 from pg_catalog.pg_proc p join pg_catalog.pg_roles r on r.oid = p.proowner
         where p.oid = v_oid and r.rolname = 'postgres'
           and p.prosecdef = v_security and p.provolatile = v_volatility
           and p.proconfig = array['search_path=""']::text[]
      )
      and pg_catalog.has_function_privilege('authenticated', v_oid, 'EXECUTE')
      and not pg_catalog.has_function_privilege('anon', v_oid, 'EXECUTE')
      and not pg_catalog.has_function_privilege('service_role', v_oid, 'EXECUTE'),
      v_name || ' hardening/ACL drifted'
    );
  end loop;

  begin
    execute 'set local role authenticated';
    insert into public.health_activity_sessions (
      user_id, request_id, request_fingerprint, started_at, ended_at, duration_min
    ) values (
      '11111111-1111-4111-8111-111111111111',
      '53000000-0000-4000-8000-000000000099',
      pg_catalog.repeat('0', 64), pg_catalog.now(), pg_catalog.now(), 1
    );
  exception when insufficient_privilege then
    v_direct_auth_failed := true;
  end;
  reset role;
  begin
    execute 'set local role service_role';
    delete from public.health_activity_sessions where false;
  exception when insufficient_privilege then
    v_direct_service_failed := true;
  end;
  reset role;

  perform midas_fixture.assert_true(
    v_direct_auth_failed and v_direct_service_failed
    and (select pg_catalog.count(*) from pg_catalog.pg_proc p
         join pg_catalog.pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = any (array[
           'activity_v2_list_sessions', 'activity_v2_session_detail',
           'activity_v2_replace_session', 'activity_v2_delete_session'
         ]::text[])) = 4
    and (select pg_catalog.count(*) from pg_catalog.pg_proc p
         join pg_catalog.pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'midas_private') = 1
    and not pg_catalog.has_schema_privilege('anon', 'midas_private', 'USAGE')
    and not pg_catalog.has_schema_privilege('service_role', 'midas_private', 'USAGE')
    and pg_catalog.has_schema_privilege('authenticated', 'midas_private', 'USAGE')
    and not pg_catalog.has_function_privilege(
      'anon',
      'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'service_role',
      'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)',
      'EXECUTE'
    )
    and pg_catalog.has_function_privilege(
      'authenticated',
      'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)',
      'EXECUTE'
    ),
    'direct DML, overload, or private-helper ACL boundary drifted'
  );
end;
$security$;

\echo 'R9 T-ACT-R9-13/-14: deterministic Edit/Edit, Edit/Delete, Delete/Delete races'

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;
select public.activity_v2_commit_session(
  '54000000-0000-4000-8000-000000000001',
  midas_fixture.duration_payload_version(2, '2026-08-01T10:00:00.000000Z', 30)
);
select public.activity_v2_commit_session(
  '54000000-0000-4000-8000-000000000002',
  midas_fixture.duration_payload_version(2, '2026-08-02T10:00:00.000000Z', 30)
);
select public.activity_v2_commit_session(
  '54000000-0000-4000-8000-000000000003',
  midas_fixture.duration_payload_version(2, '2026-08-03T10:00:00.000000Z', 30)
);
select public.activity_v2_commit_session(
  '54000000-0000-4000-8000-000000000004',
  midas_fixture.duration_payload_version(2, '2026-08-04T10:00:00.000000Z', 30)
);
select public.activity_v2_commit_session(
  '54000000-0000-4000-8000-000000000005',
  midas_fixture.duration_payload_version(2, '2026-08-05T10:00:00.000000Z', 30)
);
reset role;

create table midas_fixture.r9_race_cases as
select
  s.request_id::text as case_id,
  s.id as session_id,
  (d.detail ->> 'revision')::bigint as revision,
  d.detail ->> 'content_fingerprint' as fingerprint
from public.health_activity_sessions s
cross join lateral (
  select public.activity_v2_session_detail(s.id) as detail
) d
where false;

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
insert into midas_fixture.r9_race_cases
select
  s.request_id::text,
  s.id,
  (d.detail ->> 'revision')::bigint,
  d.detail ->> 'content_fingerprint'
from public.health_activity_sessions s
cross join lateral (
  select public.activity_v2_session_detail(s.id) as detail
) d
where s.request_id::text like '54000000-%';

\connect "dbname=midas_activity_v2_s45 user=supabase_admin"

do $races$
declare
  v_conn text := 'host=127.0.0.1 port=5432 dbname=midas_activity_v2_s45 user=postgres password=postgres';
  v_case record;
  v_winner jsonb;
  v_contender jsonb;
  v_winner_sql text;
  v_contender_sql text;
begin
  perform extensions.dblink_connect('r9_winner', v_conn);
  perform extensions.dblink_connect('r9_contender', v_conn);
  perform * from extensions.dblink(
    'r9_winner',
    $remote$select
      set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false),
      set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":false}', false)$remote$
  ) as t(a text, b text);
  perform * from extensions.dblink(
    'r9_contender',
    $remote$select
      set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false),
      set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":false}', false)$remote$
  ) as t(a text, b text);
  perform extensions.dblink_exec('r9_winner', 'set role authenticated');
  perform extensions.dblink_exec('r9_contender', 'set role authenticated');

  -- Different Edit/Edit: only the lock winner updates.
  select * into strict v_case from midas_fixture.r9_race_cases
   where case_id = '54000000-0000-4000-8000-000000000001';
  v_winner_sql := pg_catalog.format(
    'select midas_fixture.r9_capture_replace(%L::uuid,%s,%L,midas_fixture.r9_football_replacement(41,%L))',
    v_case.session_id, v_case.revision, v_case.fingerprint, 'Winner'
  );
  v_contender_sql := pg_catalog.format(
    'select midas_fixture.r9_capture_replace(%L::uuid,%s,%L,midas_fixture.r9_football_replacement(42,%L))',
    v_case.session_id, v_case.revision, v_case.fingerprint, 'Contender'
  );
  perform extensions.dblink_exec('r9_winner', 'begin');
  select result into strict v_winner from extensions.dblink('r9_winner', v_winner_sql) t(result jsonb);
  perform extensions.dblink_send_query('r9_contender', v_contender_sql);
  perform pg_catalog.pg_sleep(0.2);
  perform midas_fixture.assert_true(extensions.dblink_is_busy('r9_contender') = 1, 'different Edit/Edit contender did not wait');
  perform extensions.dblink_exec('r9_winner', 'commit');
  select result into strict v_contender from extensions.dblink_get_result('r9_contender') t(result jsonb);
  perform * from extensions.dblink_get_result('r9_contender') t(result jsonb);
  perform midas_fixture.assert_true(
    v_winner ->> 'outcome' = 'updated'
    and v_contender ->> 'error' = 'MIDAS_ACTIVITY_SESSION_CONFLICT',
    'different Edit/Edit race drifted'
  );

  -- Identical Edit/Edit: the waiter observes exact replay before stale CAS.
  select * into strict v_case from midas_fixture.r9_race_cases
   where case_id = '54000000-0000-4000-8000-000000000002';
  v_winner_sql := pg_catalog.format(
    'select midas_fixture.r9_capture_replace(%L::uuid,%s,%L,midas_fixture.r9_football_replacement(43,%L))',
    v_case.session_id, v_case.revision, v_case.fingerprint, 'Same'
  );
  perform extensions.dblink_exec('r9_winner', 'begin');
  select result into strict v_winner from extensions.dblink('r9_winner', v_winner_sql) t(result jsonb);
  perform extensions.dblink_send_query('r9_contender', v_winner_sql);
  perform pg_catalog.pg_sleep(0.2);
  perform midas_fixture.assert_true(extensions.dblink_is_busy('r9_contender') = 1, 'identical Edit/Edit contender did not wait');
  perform extensions.dblink_exec('r9_winner', 'commit');
  select result into strict v_contender from extensions.dblink_get_result('r9_contender') t(result jsonb);
  perform * from extensions.dblink_get_result('r9_contender') t(result jsonb);
  perform midas_fixture.assert_true(
    v_winner ->> 'outcome' = 'updated'
    and v_contender ->> 'outcome' = 'replayed'
    and v_winner ->> 'revision' = v_contender ->> 'revision',
    'identical Edit/Edit race drifted'
  );

  -- Edit wins, stale Delete conflicts.
  select * into strict v_case from midas_fixture.r9_race_cases
   where case_id = '54000000-0000-4000-8000-000000000003';
  v_winner_sql := pg_catalog.format(
    'select midas_fixture.r9_capture_replace(%L::uuid,%s,%L,midas_fixture.r9_football_replacement(44,%L))',
    v_case.session_id, v_case.revision, v_case.fingerprint, 'Edit wins'
  );
  v_contender_sql := pg_catalog.format(
    'select midas_fixture.r9_capture_delete(%L::uuid,%s,%L)',
    v_case.session_id, v_case.revision, v_case.fingerprint
  );
  perform extensions.dblink_exec('r9_winner', 'begin');
  select result into strict v_winner from extensions.dblink('r9_winner', v_winner_sql) t(result jsonb);
  perform extensions.dblink_send_query('r9_contender', v_contender_sql);
  perform pg_catalog.pg_sleep(0.2);
  perform midas_fixture.assert_true(extensions.dblink_is_busy('r9_contender') = 1, 'Edit/Delete contender did not wait');
  perform extensions.dblink_exec('r9_winner', 'commit');
  select result into strict v_contender from extensions.dblink_get_result('r9_contender') t(result jsonb);
  perform * from extensions.dblink_get_result('r9_contender') t(result jsonb);
  perform midas_fixture.assert_true(
    v_winner ->> 'outcome' = 'updated'
    and v_contender ->> 'error' = 'MIDAS_ACTIVITY_SESSION_CONFLICT',
    'Edit-wins/Delete-loses race drifted'
  );

  -- Delete wins, stale Edit sees the non-leaking not-found contract.
  select * into strict v_case from midas_fixture.r9_race_cases
   where case_id = '54000000-0000-4000-8000-000000000004';
  v_winner_sql := pg_catalog.format(
    'select midas_fixture.r9_capture_delete(%L::uuid,%s,%L)',
    v_case.session_id, v_case.revision, v_case.fingerprint
  );
  v_contender_sql := pg_catalog.format(
    'select midas_fixture.r9_capture_replace(%L::uuid,%s,%L,midas_fixture.r9_football_replacement(45,%L))',
    v_case.session_id, v_case.revision, v_case.fingerprint, 'Delete wins'
  );
  perform extensions.dblink_exec('r9_winner', 'begin');
  select result into strict v_winner from extensions.dblink('r9_winner', v_winner_sql) t(result jsonb);
  perform extensions.dblink_send_query('r9_contender', v_contender_sql);
  perform pg_catalog.pg_sleep(0.2);
  perform midas_fixture.assert_true(extensions.dblink_is_busy('r9_contender') = 1, 'Delete/Edit contender did not wait');
  perform extensions.dblink_exec('r9_winner', 'commit');
  select result into strict v_contender from extensions.dblink_get_result('r9_contender') t(result jsonb);
  perform * from extensions.dblink_get_result('r9_contender') t(result jsonb);
  perform midas_fixture.assert_true(
    v_winner ->> 'outcome' = 'deleted'
    and v_contender ->> 'error' = 'MIDAS_ACTIVITY_SESSION_NOT_FOUND',
    'Delete-wins/Edit-loses race drifted'
  );

  -- Delete/Delete: the waiter confirms already_absent.
  select * into strict v_case from midas_fixture.r9_race_cases
   where case_id = '54000000-0000-4000-8000-000000000005';
  v_winner_sql := pg_catalog.format(
    'select midas_fixture.r9_capture_delete(%L::uuid,%s,%L)',
    v_case.session_id, v_case.revision, v_case.fingerprint
  );
  perform extensions.dblink_exec('r9_winner', 'begin');
  select result into strict v_winner from extensions.dblink('r9_winner', v_winner_sql) t(result jsonb);
  perform extensions.dblink_send_query('r9_contender', v_winner_sql);
  perform pg_catalog.pg_sleep(0.2);
  perform midas_fixture.assert_true(extensions.dblink_is_busy('r9_contender') = 1, 'Delete/Delete contender did not wait');
  perform extensions.dblink_exec('r9_winner', 'commit');
  select result into strict v_contender from extensions.dblink_get_result('r9_contender') t(result jsonb);
  perform * from extensions.dblink_get_result('r9_contender') t(result jsonb);
  perform midas_fixture.assert_true(
    v_winner ->> 'outcome' = 'deleted'
    and v_contender ->> 'outcome' = 'already_absent',
    'Delete/Delete race drifted'
  );

  perform extensions.dblink_disconnect('r9_winner');
  perform extensions.dblink_disconnect('r9_contender');
end;
$races$;

\connect "dbname=midas_activity_v2_s45 user=postgres"

\echo 'R9 T-ACT-R9-10: technical lifecycle rollback rejection and cleanup'

select pg_catalog.set_config(
  'midas.activity_v2_r9_operational_nonuse_confirmed', 'true', false
);
\set ON_ERROR_STOP off
\ir ../23_Activity_V2_History_Lifecycle_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  exists (
    select 1 from public.health_activity_sessions where revision <> 1
  )
  and pg_catalog.to_regprocedure(
    'public.activity_v2_replace_session(uuid,bigint,text,jsonb)'
  ) is not null,
  'rollback did not reject technical lifecycle-use evidence'
);
select pg_catalog.set_config(
  'midas.activity_v2_r9_operational_nonuse_confirmed', 'false', false
);

truncate table
  public.health_activity_item_sets,
  public.health_activity_session_items,
  public.health_activity_sessions;

select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_sessions) = 0
  and (select pg_catalog.count(*) from public.health_activity_session_items) = 0
  and (select pg_catalog.count(*) from public.health_activity_item_sets) = 0
  and (select pg_catalog.count(*) from public.health_activity_catalog_entries where catalog_version = 1) = 78
  and (select pg_catalog.count(*) from public.health_activity_catalog_entries where catalog_version = 2) = 80
  and midas_fixture.commit_source_sha256() =
    '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e',
  'R9 fixture cleanup or R8 invariant failed'
);

drop table midas_fixture.r9_race_cases;

\echo 'R9 Block B SQL 23 full fixture PASS'

-- Guarded disposable PostgreSQL 17 fixture for MIDAS Activity V2 R8 S4.8.
--
-- NEVER run against a real MIDAS database. The fixture requires the exact
-- database midas_activity_v2_s45, owner postgres, and session_user postgres.
-- It reuses the R2/C2 fixture scaffold, creates only local synthetic data,
-- and finishes with zero Activity V2 session rows.

\set ON_ERROR_STOP on
\set VERBOSITY terse

do $guard$
begin
  if pg_catalog.current_database() <> 'midas_activity_v2_s45' then
    raise exception 'Activity V2 SQL 22 fixture requires database midas_activity_v2_s45';
  end if;
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity V2 SQL 22 fixture requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity V2 SQL 22 fixture requires postgres';
  end if;
  if not exists (
    select 1
      from pg_catalog.pg_database d
      join pg_catalog.pg_roles r on r.oid = d.datdba
     where d.datname = pg_catalog.current_database()
       and r.rolname = 'postgres'
  ) then
    raise exception 'Activity V2 SQL 22 fixture requires postgres-owned database';
  end if;
end;
$guard$;

\echo 'R8 S4.8: rebuild canonical R2+C2 disposable preimage'
\ir 21_Activity_V2_Catalog_V2_fixture.sql

create or replace function midas_fixture.commit_source_sha256()
returns text
language sql
stable
set search_path = ''
as $function$
  select pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(
        pg_catalog.pg_get_functiondef(
          'public.activity_v2_commit_session(uuid,jsonb)'::pg_catalog.regprocedure
        ),
        'UTF8'
      )
    ),
    'hex'
  )
$function$;

create or replace function midas_fixture.duration_payload_version(
  p_catalog_version integer,
  p_started_at text,
  p_duration integer default 30
)
returns jsonb
language sql
stable
set search_path = ''
as $function$
  select pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session.v1',
    'catalog_version', p_catalog_version,
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

create table midas_fixture.r8_catalog_before
as
select *
  from public.health_activity_catalog_entries
 where catalog_version in (1, 2);

\echo 'R8 S4.8: exact R2 forward install and exact R8 rerun'
select midas_fixture.assert_true(
  midas_fixture.commit_source_sha256() =
    '2241cea9a5453a38d074abc88aebe8edb6f7e5c0226d063423daef0b1411418e',
  'canonical R2 source fingerprint mismatch'
);
\ir ../22_Activity_V2_Commit_Compatibility.sql
\ir ../22_Activity_V2_Commit_Compatibility.sql
select midas_fixture.assert_true(
  midas_fixture.commit_source_sha256() =
    '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e',
  'R8 source fingerprint or rerun mismatch'
);

\echo 'R8 S4.8: overload, hardening, ACL, RLS, catalog and source drift fail closed'

create function public.activity_v2_commit_session(text)
returns jsonb
language sql
set search_path = ''
as 'select null::jsonb';
\set ON_ERROR_STOP off
\ir ../22_Activity_V2_Commit_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.to_regprocedure(
    'public.activity_v2_commit_session(text)'
  ) is not null
  and midas_fixture.commit_source_sha256() =
    '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e',
  'overload guard mutated the target'
);
drop function public.activity_v2_commit_session(text);

alter function public.activity_v2_commit_session(uuid, jsonb)
  security invoker;
\set ON_ERROR_STOP off
\ir ../22_Activity_V2_Commit_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  exists (
    select 1
      from pg_catalog.pg_proc p
     where p.oid =
       'public.activity_v2_commit_session(uuid,jsonb)'::pg_catalog.regprocedure
       and not p.prosecdef
  ),
  'hardening guard overwrote a security-invoker drift'
);
alter function public.activity_v2_commit_session(uuid, jsonb)
  security definer;

grant execute on function public.activity_v2_commit_session(uuid, jsonb)
  to service_role;
\set ON_ERROR_STOP off
\ir ../22_Activity_V2_Commit_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  pg_catalog.has_function_privilege(
    'service_role',
    'public.activity_v2_commit_session(uuid,jsonb)',
    'EXECUTE'
  ),
  'ACL guard overwrote unexpected service-role execute'
);
revoke execute on function public.activity_v2_commit_session(uuid, jsonb)
  from service_role;

alter table public.health_activity_sessions disable row level security;
\set ON_ERROR_STOP off
\ir ../22_Activity_V2_Commit_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  exists (
    select 1
      from pg_catalog.pg_class c
     where c.oid = 'public.health_activity_sessions'::pg_catalog.regclass
       and not c.relrowsecurity
  ),
  'RLS guard overwrote target drift'
);
alter table public.health_activity_sessions enable row level security;

update public.health_activity_catalog_entries
   set label = 'Football fixture drift'
 where catalog_version = 2 and item_key = 'football';
\set ON_ERROR_STOP off
\ir ../22_Activity_V2_Commit_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  (select label
     from public.health_activity_catalog_entries
    where catalog_version = 2 and item_key = 'football') =
    'Football fixture drift',
  'catalog guard overwrote v2 drift'
);
update public.health_activity_catalog_entries
   set label = (
     select before_row.label
       from midas_fixture.r8_catalog_before before_row
      where before_row.catalog_version = 2
        and before_row.item_key = 'football'
   )
 where catalog_version = 2 and item_key = 'football';

create or replace function public.activity_v2_commit_session(
  p_request_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $drift$
begin
  raise exception 'fixture source drift';
end;
$drift$;
alter function public.activity_v2_commit_session(uuid, jsonb)
  owner to postgres;
revoke all on function public.activity_v2_commit_session(uuid, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.activity_v2_commit_session(uuid, jsonb)
  to authenticated;

\set ON_ERROR_STOP off
\ir ../22_Activity_V2_Commit_Compatibility.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  midas_fixture.commit_source_sha256() not in (
    '2241cea9a5453a38d074abc88aebe8edb6f7e5c0226d063423daef0b1411418e',
    '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e'
  ),
  'source drift guard overwrote unknown function source'
);

\echo 'R8 S4.8: restore canonical source after isolated drift probe'
\ir ../20_Activity_V2.sql
\ir ../16_Explicit_Grants.sql
\ir ../22_Activity_V2_Commit_Compatibility.sql

\echo 'R8 S4.8: v1/v2 remain committable with a higher catalog version'

insert into public.health_activity_catalog_entries (
  catalog_version,
  item_key,
  label,
  aliases,
  status,
  category,
  equipment,
  muscle_groups,
  sport_tags,
  tracking_mode,
  load_comparability,
  field_policy
)
select
  3,
  c.item_key,
  c.label,
  c.aliases,
  c.status,
  c.category,
  c.equipment,
  c.muscle_groups,
  c.sport_tags,
  c.tracking_mode,
  c.load_comparability,
  c.field_policy
from public.health_activity_catalog_entries c
where c.catalog_version = 2 and c.item_key = 'football';

-- Rerun must accept an unrelated higher catalog version and existing history.
\ir ../22_Activity_V2_Commit_Compatibility.sql

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);
set role authenticated;
select public.activity_v2_commit_session(
  '48000000-0000-4000-8000-000000000001',
  midas_fixture.duration_payload_version(
    1, '2026-08-02T08:00:00.000000Z', 31
  )
) as r8_v1_created \gset
select public.activity_v2_commit_session(
  '48000000-0000-4000-8000-000000000002',
  midas_fixture.duration_payload_version(
    2, '2026-08-02T09:00:00.000000Z', 32
  )
) as r8_v2_created \gset
select public.activity_v2_commit_session(
  '48000000-0000-4000-8000-000000000003',
  midas_fixture.duration_payload_version(
    3, '2026-08-02T10:00:00.000000Z', 33
  )
) as r8_v3_created \gset
reset role;

select midas_fixture.assert_true(
  :'r8_v1_created'::jsonb ->> 'outcome' = 'created'
  and :'r8_v2_created'::jsonb ->> 'outcome' = 'created'
  and :'r8_v3_created'::jsonb ->> 'outcome' = 'created'
  and (select pg_catalog.array_agg(
         distinct i.catalog_version order by i.catalog_version
       )
         from public.health_activity_session_items i
        where i.user_id = '11111111-1111-4111-8111-111111111111') =
      array[1, 2, 3],
  'v1/v2/new-highest commit compatibility failed'
);

\echo 'R8 S4.8: missing item and exact policy mismatch reject before persistence'

call midas_fixture.expect_commit_error(
  '48000000-0000-4000-8000-000000000004',
  pg_catalog.jsonb_set(
    midas_fixture.strength_payload(
      false, '2026-08-03T08:00:00.000000Z', 0
    ),
    '{catalog_version}',
    '3'::jsonb
  ),
  'MIDAS_ACTIVITY_INVALID_SESSION'
);

update public.health_activity_catalog_entries
   set field_policy = pg_catalog.jsonb_set(
     field_policy, '{duration_min}', '"forbidden"'::jsonb
   )
 where catalog_version = 3 and item_key = 'football';
call midas_fixture.expect_commit_error(
  '48000000-0000-4000-8000-000000000005',
  midas_fixture.duration_payload_version(
    3, '2026-08-03T09:00:00.000000Z', 34
  ),
  'MIDAS_ACTIVITY_INVALID_SESSION'
);
update public.health_activity_catalog_entries v3
   set field_policy = v2.field_policy
  from public.health_activity_catalog_entries v2
 where v3.catalog_version = 3
   and v3.item_key = 'football'
   and v2.catalog_version = 2
   and v2.item_key = v3.item_key;

select midas_fixture.assert_true(
  not exists (
    select 1
      from public.health_activity_sessions s
     where s.request_id in (
       '48000000-0000-4000-8000-000000000004',
       '48000000-0000-4000-8000-000000000005'
     )
  ),
  'missing-item or policy mismatch persisted a session'
);

\echo 'R8 S4.8: replay precedes catalog active check and models response loss'

set role authenticated;
select public.activity_v2_commit_session(
  '48000000-0000-4000-8000-000000000006',
  midas_fixture.duration_payload_version(
    2, '2026-08-04T08:00:00.000000Z', 35
  )
);
select public.activity_v2_commit_session(
  '48000000-0000-4000-8000-000000000006',
  midas_fixture.duration_payload_version(
    2, '2026-08-04T08:00:00.000000Z', 35
  )
) as r8_response_loss_replay \gset
reset role;

update public.health_activity_catalog_entries
   set status = 'deprecated'
 where catalog_version = 3 and item_key = 'football';
set role authenticated;
select public.activity_v2_commit_session(
  '48000000-0000-4000-8000-000000000003',
  midas_fixture.duration_payload_version(
    3, '2026-08-02T10:00:00.000000Z', 33
  )
) as r8_inactive_catalog_replay \gset
reset role;
update public.health_activity_catalog_entries
   set status = 'active'
 where catalog_version = 3 and item_key = 'football';

select midas_fixture.assert_true(
  :'r8_response_loss_replay'::jsonb ->> 'outcome' = 'replayed'
  and :'r8_inactive_catalog_replay'::jsonb ->> 'outcome' = 'replayed'
  and (select pg_catalog.count(*)
         from public.health_activity_sessions
        where request_id = '48000000-0000-4000-8000-000000000006') = 1,
  'response-loss or replay-before-catalog contract failed'
);

\echo 'R8 S4.8: auth, RLS, direct-DML and exact ACL boundary'

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'true'::jsonb
);
call midas_fixture.expect_commit_error(
  '48000000-0000-4000-8000-000000000007',
  midas_fixture.duration_payload_version(
    1, '2026-08-04T09:00:00.000000Z', 30
  ),
  'MIDAS_ACTIVITY_AUTH_REQUIRED'
);

call midas_fixture.set_claims(
  '22222222-2222-4222-8222-222222222222', 'false'::jsonb
);
set role authenticated;
select pg_catalog.count(*) as r8_foreign_visible
  from public.health_activity_sessions
 where user_id = '11111111-1111-4111-8111-111111111111'
\gset
reset role;

select pg_catalog.count(*) as r8_before_direct_dml
  from public.health_activity_sessions
\gset
\set ON_ERROR_STOP off
set role authenticated;
insert into public.health_activity_sessions (
  user_id, request_id, request_fingerprint,
  started_at, ended_at, duration_min
) values (
  '22222222-2222-4222-8222-222222222222',
  '48000000-0000-4000-8000-000000000008',
  pg_catalog.repeat('a', 64),
  '2026-08-04T10:00:00Z',
  '2026-08-04T10:30:00Z',
  30
);
reset role;
\set ON_ERROR_STOP on

select midas_fixture.assert_true(
  :'r8_foreign_visible'::bigint = 0
  and (select pg_catalog.count(*) from public.health_activity_sessions) =
      :'r8_before_direct_dml'::bigint
  and not pg_catalog.has_function_privilege(
    'anon', 'public.activity_v2_commit_session(uuid,jsonb)', 'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'service_role', 'public.activity_v2_commit_session(uuid,jsonb)', 'EXECUTE'
  )
  and pg_catalog.has_function_privilege(
    'authenticated', 'public.activity_v2_commit_session(uuid,jsonb)', 'EXECUTE'
  )
  and (select pg_catalog.count(*)
         from pg_catalog.pg_policy p
         join pg_catalog.pg_class c on c.oid = p.polrelid
         join pg_catalog.pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = any (array[
            'health_activity_catalog_entries',
            'health_activity_sessions',
            'health_activity_session_items',
            'health_activity_item_sets'
          ]::text[])) = 4,
  'auth/RLS/direct-DML/ACL boundary failed'
);

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);

\echo 'R8 S4.8: deterministic committed-winner and rolled-back-winner races'

\connect "dbname=midas_activity_v2_s45 user=supabase_admin"

do $race$
declare
  v_conn text :=
    'dbname=midas_activity_v2_s45 user=postgres';
  v_winner jsonb;
  v_contender jsonb;
begin
  perform extensions.dblink_connect('r8_commit_winner', v_conn);
  perform extensions.dblink_connect('r8_commit_contender', v_conn);
  perform * from extensions.dblink(
    'r8_commit_winner',
    $remote$select
      set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false),
      set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":false}', false)$remote$
  ) as t(a text, b text);
  perform * from extensions.dblink(
    'r8_commit_contender',
    $remote$select
      set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false),
      set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":false}', false)$remote$
  ) as t(a text, b text);
  perform extensions.dblink_exec('r8_commit_winner', 'set role authenticated');
  perform extensions.dblink_exec('r8_commit_contender', 'set role authenticated');
  perform extensions.dblink_exec('r8_commit_winner', 'begin');

  select result into strict v_winner
    from extensions.dblink(
      'r8_commit_winner',
      $remote$select public.activity_v2_commit_session(
        '48000000-0000-4000-8000-000000000040',
        midas_fixture.duration_payload_version(
          1, '2026-08-08T08:00:00.000000Z', 36
        )
      )$remote$
    ) as t(result jsonb);
  perform extensions.dblink_send_query(
    'r8_commit_contender',
    $remote$select public.activity_v2_commit_session(
      '48000000-0000-4000-8000-000000000040',
      midas_fixture.duration_payload_version(
        1, '2026-08-08T08:00:00.000000Z', 36
      )
    )$remote$
  );
  perform pg_catalog.pg_sleep(0.2);
  perform midas_fixture.assert_true(
    extensions.dblink_is_busy('r8_commit_contender') = 1,
    'R8 committed-winner contender did not block'
  );
  perform extensions.dblink_exec('r8_commit_winner', 'commit');
  select result into strict v_contender
    from extensions.dblink_get_result('r8_commit_contender') as t(result jsonb);
  perform midas_fixture.assert_true(
    v_winner ->> 'outcome' = 'created'
    and v_contender ->> 'outcome' = 'replayed'
    and v_winner #>> '{session,id}' = v_contender #>> '{session,id}',
    'R8 committed-winner race drifted'
  );
  perform extensions.dblink_disconnect('r8_commit_winner');
  perform extensions.dblink_disconnect('r8_commit_contender');
end;
$race$;

do $race$
declare
  v_conn text :=
    'dbname=midas_activity_v2_s45 user=postgres';
  v_winner jsonb;
  v_contender jsonb;
begin
  perform extensions.dblink_connect('r8_rollback_winner', v_conn);
  perform extensions.dblink_connect('r8_rollback_contender', v_conn);
  perform * from extensions.dblink(
    'r8_rollback_winner',
    $remote$select
      set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false),
      set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":false}', false)$remote$
  ) as t(a text, b text);
  perform * from extensions.dblink(
    'r8_rollback_contender',
    $remote$select
      set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false),
      set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","is_anonymous":false}', false)$remote$
  ) as t(a text, b text);
  perform extensions.dblink_exec('r8_rollback_winner', 'set role authenticated');
  perform extensions.dblink_exec('r8_rollback_contender', 'set role authenticated');
  perform extensions.dblink_exec('r8_rollback_winner', 'begin');

  select result into strict v_winner
    from extensions.dblink(
      'r8_rollback_winner',
      $remote$select public.activity_v2_commit_session(
        '48000000-0000-4000-8000-000000000041',
        midas_fixture.duration_payload_version(
          2, '2026-08-08T09:00:00.000000Z', 37
        )
      )$remote$
    ) as t(result jsonb);
  perform extensions.dblink_send_query(
    'r8_rollback_contender',
    $remote$select public.activity_v2_commit_session(
      '48000000-0000-4000-8000-000000000041',
      midas_fixture.duration_payload_version(
        2, '2026-08-08T09:00:00.000000Z', 37
      )
    )$remote$
  );
  perform pg_catalog.pg_sleep(0.2);
  perform midas_fixture.assert_true(
    extensions.dblink_is_busy('r8_rollback_contender') = 1,
    'R8 rolled-back-winner contender did not block'
  );
  perform extensions.dblink_exec('r8_rollback_winner', 'rollback');
  select result into strict v_contender
    from extensions.dblink_get_result('r8_rollback_contender') as t(result jsonb);
  perform midas_fixture.assert_true(
    v_winner ->> 'outcome' = 'created'
    and v_contender ->> 'outcome' = 'created'
    and v_winner #>> '{session,id}' <> v_contender #>> '{session,id}'
    and (select pg_catalog.count(*)
           from public.health_activity_sessions
          where request_id = '48000000-0000-4000-8000-000000000041') = 1,
    'R8 rolled-back-winner race drifted'
  );
  perform extensions.dblink_disconnect('r8_rollback_winner');
  perform extensions.dblink_disconnect('r8_rollback_contender');
end;
$race$;

\connect "dbname=midas_activity_v2_s45 user=postgres"

\echo 'R8 S4.8: exact rollback, rollback guard, and forward restoration'

\ir ../22_Activity_V2_Commit_Compatibility_Rollback.sql
select midas_fixture.assert_true(
  midas_fixture.commit_source_sha256() =
    '2241cea9a5453a38d074abc88aebe8edb6f7e5c0226d063423daef0b1411418e',
  'exact rollback did not restore R2'
);

\set ON_ERROR_STOP off
\ir ../22_Activity_V2_Commit_Compatibility_Rollback.sql
\set ON_ERROR_STOP on
select midas_fixture.assert_true(
  midas_fixture.commit_source_sha256() =
    '2241cea9a5453a38d074abc88aebe8edb6f7e5c0226d063423daef0b1411418e',
  'rollback rerun guard did not preserve R2'
);

\ir ../22_Activity_V2_Commit_Compatibility.sql
\ir ../22_Activity_V2_Commit_Compatibility.sql
select midas_fixture.assert_true(
  midas_fixture.commit_source_sha256() =
    '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e',
  'forward restoration or R8 rerun failed'
);

\echo 'R8 S4.8: cleanup and immutable v1/v2 postcondition'

truncate table
  public.health_activity_item_sets,
  public.health_activity_session_items,
  public.health_activity_sessions;
delete from public.health_activity_catalog_entries
 where catalog_version = 3;

select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_sessions) = 0
  and (select pg_catalog.count(*) from public.health_activity_session_items) = 0
  and (select pg_catalog.count(*) from public.health_activity_item_sets) = 0
  and (select pg_catalog.count(*) from public.health_activity_catalog_entries
        where catalog_version = 1) = 78
  and (select pg_catalog.count(*) from public.health_activity_catalog_entries
        where catalog_version = 2) = 80
  and not exists (
    (select * from midas_fixture.r8_catalog_before
     except
     select * from public.health_activity_catalog_entries
      where catalog_version in (1, 2))
    union all
    (select * from public.health_activity_catalog_entries
      where catalog_version in (1, 2)
     except
     select * from midas_fixture.r8_catalog_before)
  ),
  'cleanup or immutable v1/v2 postcondition failed'
);

drop table midas_fixture.r8_catalog_before;

\echo 'R8 S4.8 SQL 22 full fixture PASS'

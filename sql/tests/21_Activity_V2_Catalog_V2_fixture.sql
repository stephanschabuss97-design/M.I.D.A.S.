-- Guarded disposable PostgreSQL 17 fixture for MIDAS Activity V2 C2.
--
-- NEVER run against a real MIDAS database. Every mode requires the exact
-- database midas_activity_v2_s45, owner postgres and session_user postgres.
-- Invoke with psql and ON_ERROR_STOP=1. The default full mode rebuilds the
-- guarded fixture database by reusing the approved R2 fixture scaffold.

\set ON_ERROR_STOP on
\set VERBOSITY terse

do $$
begin
  if pg_catalog.current_database() <> 'midas_activity_v2_s45' then
    raise exception 'Activity V2 C2 fixture requires database midas_activity_v2_s45';
  end if;
  if pg_catalog.current_setting('server_version_num')::integer < 170000 then
    raise exception 'Activity V2 C2 fixture requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' then
    raise exception 'Activity V2 C2 fixture requires session_user postgres';
  end if;
  if not exists (
    select 1
      from pg_catalog.pg_database d
      join pg_catalog.pg_roles r on r.oid = d.datdba
     where d.datname = pg_catalog.current_database()
       and r.rolname = 'postgres'
  ) then
    raise exception 'Activity V2 C2 fixture requires database owner postgres';
  end if;
end;
$$;

\if :{?c2_fixture_mode}
\else
  \set c2_fixture_mode full
\endif

select
  :'c2_fixture_mode' = 'full' as c2_mode_full,
  :'c2_fixture_mode' = 'partial_setup' as c2_mode_partial_setup,
  :'c2_fixture_mode' = 'partial_assert_restore' as c2_mode_partial_assert,
  :'c2_fixture_mode' = 'content_setup' as c2_mode_content_setup,
  :'c2_fixture_mode' = 'content_assert_restore' as c2_mode_content_assert
\gset

\if :c2_mode_full

\echo 'C2 S4.5: approved R2 scaffold in guarded disposable database'
\ir 20_Activity_V2_fixture.sql

\echo 'C2 S4.5: remove only Activity V2 targets before fresh 20 -> 21 -> 16'

drop function public.activity_v2_commit_session(uuid, jsonb);
drop function public.activity_v2_last_performance(text);
drop table public.health_activity_item_sets;
drop table public.health_activity_session_items;
drop table public.health_activity_sessions;
drop table public.health_activity_catalog_entries;

select midas_fixture.assert_true(
  pg_catalog.to_regclass('public.health_activity_catalog_entries') is null
  and pg_catalog.to_regclass('public.health_activity_sessions') is null
  and pg_catalog.to_regclass('public.health_activity_session_items') is null
  and pg_catalog.to_regclass('public.health_activity_item_sets') is null
  and pg_catalog.to_regprocedure(
    'public.activity_v2_commit_session(uuid,jsonb)'
  ) is null
  and pg_catalog.to_regprocedure(
    'public.activity_v2_last_performance(text)'
  ) is null,
  'Activity V2 target reset was incomplete'
);

\ir ../20_Activity_V2.sql
\ir ../21_Activity_V2_Catalog_V2.sql
\ir ../16_Explicit_Grants.sql

\echo 'C2 S4.5: EV-ACT-C2-L01 fresh exact 78/80 and unchanged R2 security'

do $$
declare
  v_table text;
begin
  perform midas_fixture.assert_true(
    (select pg_catalog.count(*)
       from public.health_activity_catalog_entries
      where catalog_version = 1) = 78
    and (select pg_catalog.count(*)
           from public.health_activity_catalog_entries
          where catalog_version = 2) = 80,
    'fresh catalog counts are not v1=78 and v2=80'
  );
  perform midas_fixture.assert_true(
    not exists (
      select 1
        from public.health_activity_catalog_entries
       where catalog_version in (1, 2)
         and status <> 'active'
    ),
    'catalog status drift detected'
  );

  foreach v_table in array array[
    'health_activity_catalog_entries',
    'health_activity_sessions',
    'health_activity_session_items',
    'health_activity_item_sets'
  ]::text[] loop
    perform midas_fixture.assert_true(
      (select c.relrowsecurity
         from pg_catalog.pg_class c
         join pg_catalog.pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = v_table)
      and pg_catalog.has_table_privilege(
        'authenticated', 'public.' || v_table, 'SELECT'
      )
      and pg_catalog.has_table_privilege(
        'service_role', 'public.' || v_table, 'SELECT'
      )
      and not pg_catalog.has_table_privilege(
        'anon', 'public.' || v_table, 'SELECT'
      )
      and not pg_catalog.has_table_privilege(
        'authenticated', 'public.' || v_table, 'INSERT,UPDATE,DELETE'
      )
      and not pg_catalog.has_table_privilege(
        'service_role', 'public.' || v_table, 'INSERT,UPDATE,DELETE'
      ),
      'R2 RLS/ACL drift on ' || v_table
    );
  end loop;

  perform midas_fixture.assert_true(
    pg_catalog.has_function_privilege(
      'authenticated',
      'public.activity_v2_commit_session(uuid,jsonb)',
      'EXECUTE'
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
    'R2 RPC ACL drift'
  );
end;
$$;

\echo 'C2 S4.5: EV-ACT-C2-L02 exact SQL 21 re-run is a no-op'

create temporary table midas_c2_v2_before
on commit preserve rows
as
select *
  from public.health_activity_catalog_entries
 where catalog_version = 2;

\ir ../21_Activity_V2_Catalog_V2.sql

select midas_fixture.assert_true(
  not exists (
    (select * from midas_c2_v2_before
     except
     select * from public.health_activity_catalog_entries where catalog_version = 2)
    union all
    (select * from public.health_activity_catalog_entries where catalog_version = 2
     except
     select * from midas_c2_v2_before)
  ),
  'exact SQL 21 re-run changed catalog v2'
);

\echo 'C2 S4.5: EV-ACT-C2-L04 v2 commit and cross-version lookup'

insert into public.health_activity_sessions (
  id, user_id, request_id, request_fingerprint,
  started_at, ended_at, duration_min
) values (
  '30000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  '31000000-0000-4000-8000-000000000001',
  pg_catalog.repeat('c', 64),
  '2026-07-01T10:00:00Z', '2026-07-01T10:30:00Z', 30
);

insert into public.health_activity_session_items (
  id, user_id, session_id, catalog_version, item_key, item_order,
  item_label_snapshot, tracking_mode_snapshot, equipment_snapshot,
  load_comparability_snapshot, field_policy_snapshot
)
select
  '32000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  '30000000-0000-4000-8000-000000000001',
  c.catalog_version,
  c.item_key,
  1,
  c.label,
  c.tracking_mode,
  c.equipment,
  c.load_comparability,
  c.field_policy
from public.health_activity_catalog_entries c
where c.catalog_version = 1 and c.item_key = 'bench_press';

insert into public.health_activity_item_sets (
  id, user_id, session_item_id, set_order, reps, weight_kg
) values (
  '33000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  '32000000-0000-4000-8000-000000000001',
  1, 8, 70
);

call midas_fixture.set_claims(
  '11111111-1111-4111-8111-111111111111', 'false'::jsonb
);

set role authenticated;
select public.activity_v2_last_performance('high_row') is null
  as c2_new_key_has_no_history \gset
select public.activity_v2_last_performance('bench_press')
  #>> '{item,catalog_version}' as c2_existing_before_version \gset
select public.activity_v2_commit_session(
  '31000000-0000-4000-8000-000000000002',
  pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session.v1',
    'catalog_version', 2,
    'started_at', '2026-08-01T10:00:00.000000Z',
    'ended_at', '2026-08-01T10:30:00.000000Z',
    'duration_min', 30,
    'items', pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'item_key', 'high_row',
        'item_order', 1,
        'sets', pg_catalog.jsonb_build_array(
          pg_catalog.jsonb_build_object(
            'set_order', 1, 'reps', 10, 'weight_kg', 60
          )
        )
      ),
      pg_catalog.jsonb_build_object(
        'item_key', 'bench_press',
        'item_order', 2,
        'sets', pg_catalog.jsonb_build_array(
          pg_catalog.jsonb_build_object(
            'set_order', 1, 'reps', 8, 'weight_kg', 75
          )
        )
      )
    )
  )
) as c2_v2_commit \gset
select public.activity_v2_last_performance('high_row')
  #>> '{item,catalog_version}' as c2_new_after_version \gset
select public.activity_v2_last_performance('bench_press')
  #>> '{item,catalog_version}' as c2_existing_after_version \gset
reset role;

select midas_fixture.assert_true(
  :'c2_new_key_has_no_history'::boolean
  and :'c2_existing_before_version' = '1'
  and :'c2_v2_commit'::jsonb ->> 'outcome' = 'created'
  and :'c2_new_after_version' = '2'
  and :'c2_existing_after_version' = '2'
  and (select pg_catalog.array_agg(distinct catalog_version order by catalog_version)
         from public.health_activity_session_items
        where item_key = 'bench_press') = array[1, 2],
  'v2 commit or cross-version lookup contract failed'
);

truncate table
  public.health_activity_item_sets,
  public.health_activity_session_items,
  public.health_activity_sessions;

select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_catalog_entries
    where catalog_version = 1) = 78
  and (select pg_catalog.count(*) from public.health_activity_catalog_entries
    where catalog_version = 2) = 80,
  'full fixture cleanup changed catalog rows'
);

\echo 'C2 S4.5 full fixture PASS'

\elif :c2_mode_partial_setup

delete from public.health_activity_catalog_entries
 where catalog_version = 2 and item_key = 'wall_sit';
select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_catalog_entries
    where catalog_version = 2) = 79
  and not exists (
    select 1 from public.health_activity_catalog_entries
     where catalog_version = 2 and item_key = 'wall_sit'
  ),
  'partial-state setup failed'
);
\echo 'C2 S4.5 partial-state setup PASS'

\elif :c2_mode_partial_assert

select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_catalog_entries
    where catalog_version = 2) = 79
  and not exists (
    select 1 from public.health_activity_catalog_entries
     where catalog_version = 2 and item_key = 'wall_sit'
  ),
  'SQL 21 changed partial v2 state before failing'
);
insert into public.health_activity_catalog_entries
select
  2, item_key, label, aliases, status, category, equipment,
  muscle_groups, sport_tags, tracking_mode, load_comparability, field_policy
from public.health_activity_catalog_entries
where catalog_version = 1 and item_key = 'wall_sit';
\echo 'C2 S4.5 partial-state unchanged and restored PASS'

\elif :c2_mode_content_setup

update public.health_activity_catalog_entries
   set label = 'Wall Sit Drift'
 where catalog_version = 2 and item_key = 'wall_sit';
select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_catalog_entries
    where catalog_version = 2) = 80
  and (select label from public.health_activity_catalog_entries
       where catalog_version = 2 and item_key = 'wall_sit') = 'Wall Sit Drift',
  'content-drift setup failed'
);
\echo 'C2 S4.5 content-drift setup PASS'

\elif :c2_mode_content_assert

select midas_fixture.assert_true(
  (select pg_catalog.count(*) from public.health_activity_catalog_entries
    where catalog_version = 2) = 80
  and (select label from public.health_activity_catalog_entries
       where catalog_version = 2 and item_key = 'wall_sit') = 'Wall Sit Drift',
  'SQL 21 changed content drift before failing'
);
update public.health_activity_catalog_entries
   set label = 'Wall Sit'
 where catalog_version = 2 and item_key = 'wall_sit';
\echo 'C2 S4.5 content drift unchanged and restored PASS'

\else

\echo 'Unknown c2_fixture_mode'
\quit 3

\endif

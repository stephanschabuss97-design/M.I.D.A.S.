-- Disposable PostgreSQL 17 fixture for MIDAS report lifecycle SQL.
--
-- NEVER run against a real MIDAS database. This file drops and recreates
-- public.health_events and creates disposable roles.
--
-- Run with psql and ON_ERROR_STOP=1 against an isolated database/container.

\set ON_ERROR_STOP on
\set VERBOSITY terse
set timezone = 'UTC';

\echo 'S4.3 fixture: reset disposable schema'

drop table if exists public.health_events cascade;

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_roles where rolname = 'anon'
  ) then
    create role anon nologin;
  end if;
  if not exists (
    select 1 from pg_catalog.pg_roles where rolname = 'authenticated'
  ) then
    create role authenticated nologin;
  end if;
  if not exists (
    select 1 from pg_catalog.pg_roles where rolname = 'service_role'
  ) then
    create role service_role nologin bypassrls;
  end if;
end;
$$;

create extension if not exists pgcrypto;

create table public.health_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ts timestamptz not null default now(),
  day date generated always as (
    (ts at time zone 'Europe/Vienna')::date
  ) stored,
  type text not null,
  ctx text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.health_events enable row level security;

create policy events_select_own
  on public.health_events
  for select
  to authenticated
  using (true);

create policy events_insert_own
  on public.health_events
  for insert
  to authenticated
  with check (true);

create policy events_update_own
  on public.health_events
  for update
  to authenticated
  using (true)
  with check (true);

create policy events_delete_own
  on public.health_events
  for delete
  to authenticated
  using (true);

revoke all on table public.health_events
  from public, anon, authenticated, service_role;
grant select, insert, update, delete
  on table public.health_events
  to authenticated, service_role;

create index idx_fixture_health_events_type
  on public.health_events (type);

\echo 'S4.3 fixture: canonical fresh setup and idempotent rerun'

\ir ../19_Report_Lifecycle.sql
\ir ../19_Report_Lifecycle.sql

do $$
begin
  if pg_catalog.to_regclass(
    'public.uq_events_range_report_per_user'
  ) is null then
    raise exception 'fresh setup did not create the report singleton index';
  end if;
end;
$$;

\echo 'S4.3 fixture: wrong same-name index must fail closed'

drop index public.uq_events_range_report_per_user;
create unique index uq_events_range_report_per_user
  on public.health_events (user_id, type)
  where type = 'system_comment'
    and payload->>'subtype' = 'range_report';

\set ON_ERROR_STOP off
\ir ../19_Report_Lifecycle.sql
\set ON_ERROR_STOP on

do $$
declare
  v_key_count int;
begin
  select i.indnkeyatts
    into strict v_key_count
    from pg_catalog.pg_index i
   where i.indexrelid =
         'public.uq_events_range_report_per_user'::regclass;

  if v_key_count <> 2 then
    raise exception 'fresh setup did not reject the wrong same-name index';
  end if;
end;
$$;

drop index public.uq_events_range_report_per_user;

\echo 'S4.3 fixture: seed reports, invalid rows and non-report control'

insert into public.health_events (
  id,
  user_id,
  ts,
  type,
  payload,
  created_at
)
values
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '2024-01-10T12:00:00Z',
    'bp',
    '{"sys":110,"dia":70}',
    '2024-01-10T12:00:00Z'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '2024-01-11T12:00:00Z',
    'system_comment',
    '{"text":"non-report without subtype"}',
    '2024-01-11T12:00:00Z'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '11111111-1111-4111-8111-111111111111',
    '2024-01-31T12:00:00Z',
    'system_comment',
    '{"subtype":"monthly_report","month":"2024-01","text":"monthly"}',
    '2024-01-31T12:00:00Z'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    '22222222-2222-4222-8222-222222222222',
    '2024-01-01T12:00:00Z',
    'system_comment',
    '{"subtype":"range_report","period":{"from":"2023-12-01","to":"2024-01-01"},"generated_at":"2024-01-01T12:00:00Z","text":"older valid"}',
    '2024-01-01T12:00:00Z'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    '22222222-2222-4222-8222-222222222222',
    '2024-02-01T12:00:00Z',
    'system_comment',
    '{"subtype":"range_report","period":{"from":"2024-01-01","to":"2024-02-01"},"generated_at":"2024-02-01T12:00:00Z","text":"newer valid"}',
    '2024-02-01T12:00:00Z'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    '22222222-2222-4222-8222-222222222222',
    '2024-02-28T12:00:00Z',
    'system_comment',
    '{"subtype":"range_report","period":{"from":"2024-02-01","to":"2024-02-30"},"generated_at":"not-a-time","text":"invalid date"}',
    '2024-02-28T12:00:00Z'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '33333333-3333-4333-8333-333333333333',
    '2024-03-01T12:00:00Z',
    'system_comment',
    '{"subtype":"range_report","period":{"from":"2024-02-01","to":"2024-03-01"},"generated_at":"2024-03-02T10:00:00Z","text":"tie lower id"}',
    '2024-03-02T10:00:00Z'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    '33333333-3333-4333-8333-333333333333',
    '2024-03-01T12:00:00Z',
    'system_comment',
    '{"subtype":"range_report","period":{"from":"2024-02-01","to":"2024-03-01"},"generated_at":"2024-03-02T10:00:00Z","text":"tie higher id"}',
    '2024-03-02T10:00:00Z'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
    '44444444-4444-4444-8444-444444444444',
    '2024-04-01T12:00:00Z',
    'system_comment',
    '{"subtype":"range_report","period":{"from":"2024-04-02","to":"2999-04-01"},"created_at":"broken","text":"future invalid"}',
    '2024-04-01T12:00:00Z'
  );

\echo 'S4.3 fixture: fresh setup must reject existing duplicates'

\set ON_ERROR_STOP off
\ir ../19_Report_Lifecycle.sql
\set ON_ERROR_STOP on

do $$
begin
  if pg_catalog.to_regclass(
    'public.uq_events_range_report_per_user'
  ) is not null then
    raise exception 'fresh setup created the index despite report duplicates';
  end if;

  if (
    select pg_catalog.count(*)
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' in ('monthly_report', 'range_report')
  ) <> 7 then
    raise exception 'fresh setup duplicate rejection changed report rows';
  end if;
end;
$$;

create or replace function pg_temp.midas_fixture_report_inventory()
returns table (
  row_count bigint,
  sha256 text
)
language sql
stable
set search_path = pg_catalog, public, extensions
as $function$
  select pg_catalog.count(*)::bigint,
         pg_catalog.encode(
           digest(
             pg_catalog.convert_to(
               coalesce(
                 pg_catalog.string_agg(
                   e.id::text || ':' ||
                   pg_catalog.encode(
                     digest(
                       pg_catalog.convert_to(
                         pg_catalog.jsonb_build_object(
                           'id', e.id,
                           'user_id', e.user_id,
                           'ts', e.ts,
                           'day', e.day,
                           'type', e.type,
                           'ctx', e.ctx,
                           'payload', e.payload,
                           'created_at', e.created_at
                         )::text,
                         'UTF8'
                       ),
                       'sha256'
                     ),
                     'hex'
                   ),
                   E'\n' order by e.id::text
                 ),
                 ''
               ),
               'UTF8'
             ),
             'sha256'
           ),
           'hex'
         )
    from public.health_events e
   where e.type = 'system_comment'
     and e.payload->>'subtype' in ('monthly_report', 'range_report');
$function$;

create temporary table midas_fixture_baseline
on commit preserve rows
as
select c.relrowsecurity,
       c.relforcerowsecurity,
       coalesce(c.relacl::text, '') as relacl,
       (
         select pg_catalog.md5(
           coalesce(
             pg_catalog.string_agg(
               pg_catalog.concat_ws(
                 ':',
                 p.polname,
                 p.polcmd,
                 p.polpermissive,
                 p.polroles::text,
                 pg_catalog.pg_get_expr(p.polqual, p.polrelid, false),
                 pg_catalog.pg_get_expr(
                   p.polwithcheck,
                   p.polrelid,
                   false
                 )
               ),
               '|' order by p.polname
             ),
             ''
           )
         )
           from pg_catalog.pg_policy p
          where p.polrelid = c.oid
       ) as policy_sha256,
       (
         select pg_catalog.md5(
           coalesce(
             pg_catalog.string_agg(
               pg_catalog.pg_get_indexdef(i.indexrelid),
               '|' order by i.indexrelid::regclass::text
             ),
             ''
           )
         )
           from pg_catalog.pg_index i
           join pg_catalog.pg_class idx on idx.oid = i.indexrelid
          where i.indrelid = c.oid
            and idx.relname <> 'uq_events_range_report_per_user'
       ) as other_index_sha256,
       (
         select pg_catalog.md5(
           coalesce(
             pg_catalog.string_agg(
               pg_catalog.row_to_json(e)::text,
               '|' order by e.id
             ),
             ''
           )
         )
           from public.health_events e
          where not coalesce(
            (
              e.type = 'system_comment'
              and e.payload->>'subtype' in (
                'monthly_report',
                'range_report'
              )
            ),
            false
          )
       ) as non_report_sha256
  from pg_catalog.pg_class c
 where c.oid = 'public.health_events'::regclass;

\set midas_expected_report_user_ids '11111111-1111-4111-8111-111111111111,22222222-2222-4222-8222-222222222222,33333333-3333-4333-8333-333333333333,44444444-4444-4444-8444-444444444444'
\set midas_expected_canonical_ids 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2,cccccccc-cccc-4ccc-8ccc-ccccccccccc2'
\set midas_expected_monthly_delete_count '1'
\set midas_expected_range_delete_count '4'

select i.row_count as midas_expected_report_count,
       i.sha256 as midas_expected_report_sha256
  from pg_temp.midas_fixture_report_inventory() i
\gset

\echo 'S4.3 fixture: inventory drift must abort before cleanup'

insert into public.health_events (
  id,
  user_id,
  ts,
  type,
  payload,
  created_at
)
values (
  'ffffffff-ffff-4fff-8fff-fffffffffff1',
  '55555555-5555-4555-8555-555555555555',
  '2024-05-01T12:00:00Z',
  'system_comment',
  '{"subtype":"monthly_report","month":"2024-05","text":"drift"}',
  '2024-05-01T12:00:00Z'
);

\set ON_ERROR_STOP off
\ir ../transition_report_lifecycle_singleton.sql
\set ON_ERROR_STOP on

do $$
begin
  if (
    select pg_catalog.count(*)
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' in ('monthly_report', 'range_report')
  ) <> 8 then
    raise exception 'inventory drift failure did not preserve all report rows';
  end if;

  if pg_catalog.to_regclass(
    'public.uq_events_range_report_per_user'
  ) is not null then
    raise exception 'inventory drift failure unexpectedly created the index';
  end if;
end;
$$;

delete from public.health_events
 where id = 'ffffffff-ffff-4fff-8fff-fffffffffff1';

\echo 'S4.3 fixture: forced failure after first cleanup must roll back all work'

create or replace function public.midas_fixture_reject_report_delete()
returns trigger
language plpgsql
as $$
begin
  if old.id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3'::uuid then
    raise exception 'fixture forced cleanup failure';
  end if;
  return old;
end;
$$;

create trigger midas_fixture_reject_report_delete
  before delete on public.health_events
  for each row execute function public.midas_fixture_reject_report_delete();

\set ON_ERROR_STOP off
\ir ../transition_report_lifecycle_singleton.sql
\set ON_ERROR_STOP on

do $$
begin
  if (
    select pg_catalog.count(*)
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' in ('monthly_report', 'range_report')
  ) <> 7 then
    raise exception 'forced cleanup failure did not roll back report deletes';
  end if;

  if (
    select pg_catalog.count(*)
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' = 'monthly_report'
  ) <> 1 then
    raise exception 'forced cleanup failure did not restore monthly rows';
  end if;

  if pg_catalog.to_regclass(
    'public.uq_events_range_report_per_user'
  ) is not null then
    raise exception 'forced cleanup failure unexpectedly created the index';
  end if;
end;
$$;

drop trigger midas_fixture_reject_report_delete
  on public.health_events;
drop function public.midas_fixture_reject_report_delete();

\echo 'S4.3 fixture: successful transition'

\ir ../transition_report_lifecycle_singleton.sql

do $$
declare
  v_baseline pg_temp.midas_fixture_baseline%rowtype;
  v_current record;
begin
  select *
    into strict v_baseline
    from pg_temp.midas_fixture_baseline;

  select c.relrowsecurity,
         c.relforcerowsecurity,
         coalesce(c.relacl::text, '') as relacl,
         (
           select pg_catalog.md5(
             coalesce(
               pg_catalog.string_agg(
                 pg_catalog.concat_ws(
                   ':',
                   p.polname,
                   p.polcmd,
                   p.polpermissive,
                   p.polroles::text,
                   pg_catalog.pg_get_expr(p.polqual, p.polrelid, false),
                   pg_catalog.pg_get_expr(
                     p.polwithcheck,
                     p.polrelid,
                     false
                   )
                 ),
                 '|' order by p.polname
               ),
               ''
             )
           )
             from pg_catalog.pg_policy p
            where p.polrelid = c.oid
         ) as policy_sha256,
         (
           select pg_catalog.md5(
             coalesce(
               pg_catalog.string_agg(
                 pg_catalog.pg_get_indexdef(i.indexrelid),
                 '|' order by i.indexrelid::regclass::text
               ),
               ''
             )
           )
             from pg_catalog.pg_index i
             join pg_catalog.pg_class idx on idx.oid = i.indexrelid
            where i.indrelid = c.oid
              and idx.relname <> 'uq_events_range_report_per_user'
         ) as other_index_sha256,
         (
           select pg_catalog.md5(
             coalesce(
               pg_catalog.string_agg(
                 pg_catalog.row_to_json(e)::text,
                 '|' order by e.id
               ),
               ''
             )
           )
             from public.health_events e
            where not coalesce(
              (
                e.type = 'system_comment'
                and e.payload->>'subtype' in (
                  'monthly_report',
                  'range_report'
                )
              ),
              false
            )
         ) as non_report_sha256
    into strict v_current
    from pg_catalog.pg_class c
   where c.oid = 'public.health_events'::regclass;

  if v_current.relrowsecurity is distinct from v_baseline.relrowsecurity
     or v_current.relforcerowsecurity is distinct from
        v_baseline.relforcerowsecurity
     or v_current.relacl is distinct from v_baseline.relacl
     or v_current.policy_sha256 is distinct from v_baseline.policy_sha256
     or v_current.other_index_sha256 is distinct from
        v_baseline.other_index_sha256
     or v_current.non_report_sha256 is distinct from
        v_baseline.non_report_sha256 then
    raise exception 'transition changed RLS, ACL, policies, other indexes or non-report rows';
  end if;

  if exists (
    select 1
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' = 'monthly_report'
  ) then
    raise exception 'monthly rows remain after successful transition';
  end if;

  if (
    select coalesce(
             pg_catalog.array_agg(e.id order by e.id),
             '{}'::uuid[]
           )
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' = 'range_report'
  ) is distinct from array[
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'::uuid,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2'::uuid
  ] then
    raise exception 'successful transition kept the wrong canonical rows';
  end if;
end;
$$;

\echo 'S4.3 fixture: partial unique-index scope'

do $$
begin
  begin
    insert into public.health_events (
      user_id,
      ts,
      type,
      payload
    )
    values (
      '22222222-2222-4222-8222-222222222222',
      '2024-06-01T12:00:00Z',
      'system_comment',
      '{"subtype":"range_report","period":{"from":"2024-05-01","to":"2024-06-01"},"text":"must fail"}'
    );
    raise exception 'singleton index accepted a duplicate range report';
  exception
    when unique_violation then
      null;
  end;

  insert into public.health_events (
    id,
    user_id,
    ts,
    type,
    payload
  )
  values
    (
      'ffffffff-ffff-4fff-8fff-fffffffffff2',
      '22222222-2222-4222-8222-222222222222',
      '2024-06-01T12:00:00Z',
      'system_comment',
      '{"subtype":"monthly_report","month":"2024-06","text":"allowed by index"}'
    ),
    (
      'ffffffff-ffff-4fff-8fff-fffffffffff3',
      '22222222-2222-4222-8222-222222222222',
      '2024-06-01T12:00:00Z',
      'system_comment',
      '{"subtype":"trendpilot","text":"allowed by index"}'
    ),
    (
      'ffffffff-ffff-4fff-8fff-fffffffffff4',
      '55555555-5555-4555-8555-555555555555',
      '2024-06-01T12:00:00Z',
      'system_comment',
      '{"subtype":"range_report","period":{"from":"2024-05-01","to":"2024-06-01"},"text":"other user allowed"}'
    );

  delete from public.health_events
   where id in (
     'ffffffff-ffff-4fff-8fff-fffffffffff2',
     'ffffffff-ffff-4fff-8fff-fffffffffff3',
     'ffffffff-ffff-4fff-8fff-fffffffffff4'
   );
end;
$$;

\echo 'S4.3 fixture: idempotent transition rerun'

\set midas_expected_report_user_ids '22222222-2222-4222-8222-222222222222,33333333-3333-4333-8333-333333333333'
\set midas_expected_canonical_ids 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2,cccccccc-cccc-4ccc-8ccc-ccccccccccc2'
\set midas_expected_monthly_delete_count '0'
\set midas_expected_range_delete_count '0'

select i.row_count as midas_expected_report_count,
       i.sha256 as midas_expected_report_sha256
  from pg_temp.midas_health_event_inventory(true) i
\gset

\ir ../transition_report_lifecycle_singleton.sql

do $$
begin
  if (
    select pg_catalog.count(*)
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' = 'range_report'
  ) <> 2 then
    raise exception 'idempotent rerun changed the canonical range rows';
  end if;
end;
$$;

\echo 'S4.3 fixture: zero-state transition'

delete from public.health_events
 where type = 'system_comment'
   and payload->>'subtype' = 'range_report';

\set midas_expected_report_user_ids ''
\set midas_expected_canonical_ids ''
\set midas_expected_monthly_delete_count '0'
\set midas_expected_range_delete_count '0'

select i.row_count as midas_expected_report_count,
       i.sha256 as midas_expected_report_sha256
  from pg_temp.midas_health_event_inventory(true) i
\gset

\ir ../transition_report_lifecycle_singleton.sql

do $$
begin
  if exists (
    select 1
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' in ('monthly_report', 'range_report')
  ) then
    raise exception 'zero-state transition created or retained report rows';
  end if;

  perform pg_temp.midas_assert_report_index(true);
end;
$$;

\echo 'S4.3 fixture: monthly-only transition'

insert into public.health_events (
  id,
  user_id,
  ts,
  type,
  payload,
  created_at
)
values (
  'ffffffff-ffff-4fff-8fff-fffffffffff5',
  '66666666-6666-4666-8666-666666666666',
  '2024-06-30T12:00:00Z',
  'system_comment',
  '{"subtype":"monthly_report","month":"2024-06","text":"monthly only"}',
  '2024-06-30T12:00:00Z'
);

\set midas_expected_report_user_ids '66666666-6666-4666-8666-666666666666'
\set midas_expected_canonical_ids ''
\set midas_expected_monthly_delete_count '1'
\set midas_expected_range_delete_count '0'

select i.row_count as midas_expected_report_count,
       i.sha256 as midas_expected_report_sha256
  from pg_temp.midas_health_event_inventory(true) i
\gset

\ir ../transition_report_lifecycle_singleton.sql

do $$
begin
  if exists (
    select 1
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' in ('monthly_report', 'range_report')
  ) then
    raise exception 'monthly-only transition retained report rows';
  end if;

  perform pg_temp.midas_assert_report_index(true);
end;
$$;

\echo 'S4.3 fixture PASS'

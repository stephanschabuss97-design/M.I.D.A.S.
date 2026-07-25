-- ==========================================================================
-- DANGER: OWNER-GATED MIDAS REPORT LIFECYCLE TRANSITION
-- ==========================================================================
-- PSQL-ONLY. DO NOT run this file in the Supabase SQL editor, during S4,
-- automatic bootstrap or an ordinary deployment.
--
-- This transition deletes every monthly_report and every non-canonical
-- range_report. It then creates or verifies the reviewed singleton index.
-- All work runs in one short transaction under a write-conflicting lock.
--
-- Required psql variables are supplied at runtime from the owner-approved
-- recovery snapshot. Never commit productive IDs, counts or hashes here:
--
--   midas_expected_report_count
--   midas_expected_report_sha256
--   midas_expected_report_user_ids
--   midas_expected_canonical_ids
--   midas_expected_monthly_delete_count
--   midas_expected_range_delete_count
--
-- CSV variables use sorted UUIDs without spaces. Empty canonical/user sets use
-- an empty string. Invoke psql with ON_ERROR_STOP=1.
-- ==========================================================================

\if :{?midas_expected_report_count}
\else
  \echo 'Missing psql variable: midas_expected_report_count'
  \quit 3
\endif
\if :{?midas_expected_report_sha256}
\else
  \echo 'Missing psql variable: midas_expected_report_sha256'
  \quit 3
\endif
\if :{?midas_expected_report_user_ids}
\else
  \echo 'Missing psql variable: midas_expected_report_user_ids'
  \quit 3
\endif
\if :{?midas_expected_canonical_ids}
\else
  \echo 'Missing psql variable: midas_expected_canonical_ids'
  \quit 3
\endif
\if :{?midas_expected_monthly_delete_count}
\else
  \echo 'Missing psql variable: midas_expected_monthly_delete_count'
  \quit 3
\endif
\if :{?midas_expected_range_delete_count}
\else
  \echo 'Missing psql variable: midas_expected_range_delete_count'
  \quit 3
\endif

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';
set local timezone = 'UTC';
set local search_path = pg_catalog, public, extensions;

create temporary table midas_report_transition_context (
  expected_report_count bigint not null,
  expected_report_sha256 text not null,
  expected_report_user_ids uuid[] not null,
  expected_canonical_ids uuid[] not null,
  expected_monthly_delete_count bigint not null,
  expected_range_delete_count bigint not null,
  today_vienna date not null,
  non_report_count_before bigint,
  non_report_sha256_before text,
  deleted_monthly_count bigint not null default 0,
  deleted_range_count bigint not null default 0
) on commit drop;

insert into pg_temp.midas_report_transition_context (
  expected_report_count,
  expected_report_sha256,
  expected_report_user_ids,
  expected_canonical_ids,
  expected_monthly_delete_count,
  expected_range_delete_count,
  today_vienna
)
values (
  :'midas_expected_report_count'::bigint,
  pg_catalog.lower(:'midas_expected_report_sha256'),
  case
    when pg_catalog.btrim(:'midas_expected_report_user_ids') = ''
      then '{}'::uuid[]
    else pg_catalog.string_to_array(
      :'midas_expected_report_user_ids',
      ','
    )::uuid[]
  end,
  case
    when pg_catalog.btrim(:'midas_expected_canonical_ids') = ''
      then '{}'::uuid[]
    else pg_catalog.string_to_array(
      :'midas_expected_canonical_ids',
      ','
    )::uuid[]
  end,
  :'midas_expected_monthly_delete_count'::bigint,
  :'midas_expected_range_delete_count'::bigint,
  (pg_catalog.statement_timestamp() at time zone 'Europe/Vienna')::date
);

create or replace function pg_temp.midas_health_event_inventory(
  p_reports boolean
)
returns table (
  row_count bigint,
  sha256 text,
  user_ids uuid[]
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
         ),
         coalesce(
           pg_catalog.array_agg(
             distinct e.user_id order by e.user_id
           ),
           '{}'::uuid[]
         )
    from public.health_events e
   where coalesce(
     (
       e.type = 'system_comment'
       and e.payload->>'subtype' in ('monthly_report', 'range_report')
     ),
     false
   ) = p_reports;
$function$;

create or replace function pg_temp.midas_assert_report_index(
  p_required boolean
)
returns void
language plpgsql
set search_path = pg_catalog, public
as $function$
declare
  v_index_oid regclass := pg_catalog.to_regclass(
    'public.uq_events_range_report_per_user'
  );
  v_predicate text;
  v_key_name text;
  v_is_unique boolean;
  v_is_valid boolean;
  v_is_ready boolean;
  v_key_count int;
  v_attribute_count int;
  v_expected_predicate constant text :=
    '((type = ''system_comment''::text) AND ((payload ->> ''subtype''::text) = ''range_report''::text))';
begin
  if v_index_oid is null then
    if p_required then
      raise exception 'uq_events_range_report_per_user is missing';
    end if;
    return;
  end if;

  select i.indisunique,
         i.indisvalid,
         i.indisready,
         i.indnkeyatts,
         i.indnatts,
         a.attname,
         pg_catalog.pg_get_expr(i.indpred, i.indrelid, false)
    into v_is_unique,
         v_is_valid,
         v_is_ready,
         v_key_count,
         v_attribute_count,
         v_key_name,
         v_predicate
    from pg_catalog.pg_index i
    join pg_catalog.pg_class idx on idx.oid = i.indexrelid
    join pg_catalog.pg_namespace n on n.oid = idx.relnamespace
    left join pg_catalog.pg_attribute a
      on a.attrelid = i.indrelid
     and a.attnum = i.indkey[0]
   where i.indexrelid = v_index_oid
     and i.indrelid = 'public.health_events'::regclass
     and idx.relname = 'uq_events_range_report_per_user'
     and n.nspname = 'public';

  if not found
     or not coalesce(v_is_unique, false)
     or not coalesce(v_is_valid, false)
     or not coalesce(v_is_ready, false)
     or v_key_count <> 1
     or v_attribute_count <> 1
     or v_key_name is distinct from 'user_id'
     or v_predicate is distinct from v_expected_predicate then
    raise exception 'uq_events_range_report_per_user has an unexpected definition'
      using detail = pg_catalog.format(
        'unique=%s valid=%s ready=%s keys=%s attrs=%s key=%s predicate=%s',
        v_is_unique,
        v_is_valid,
        v_is_ready,
        v_key_count,
        v_attribute_count,
        coalesce(v_key_name, '<missing>'),
        coalesce(v_predicate, '<missing>')
      );
  end if;
end;
$function$;

do $$
declare
  v_context pg_temp.midas_report_transition_context%rowtype;
  v_sorted_user_ids uuid[];
  v_sorted_canonical_ids uuid[];
begin
  select *
    into strict v_context
    from pg_temp.midas_report_transition_context;

  if not coalesce((
    select r.rolsuper or r.rolbypassrls
      from pg_catalog.pg_roles r
     where r.rolname = current_user
  ), false) then
    raise exception 'MIDAS report transition requires an RLS-bypass role'
      using errcode = '42501';
  end if;

  if pg_catalog.to_regclass('public.health_events') is null then
    raise exception 'MIDAS report transition requires public.health_events';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_class c
     where c.oid = 'public.health_events'::regclass
       and c.relkind in ('r', 'p')
       and c.relrowsecurity
  ) then
    raise exception 'public.health_events must be an RLS-enabled table';
  end if;

  if exists (
    select 1
      from (
        values
          ('id', 'uuid', true, ''),
          ('user_id', 'uuid', true, ''),
          ('ts', 'timestamp with time zone', true, ''),
          ('day', 'date', false, 's'),
          ('type', 'text', true, ''),
          ('ctx', 'text', false, ''),
          ('payload', 'jsonb', true, ''),
          ('created_at', 'timestamp with time zone', true, '')
      ) as expected(
        column_name,
        type_name,
        must_be_not_null,
        generated_kind
      )
      left join pg_catalog.pg_attribute a
        on a.attrelid = 'public.health_events'::regclass
       and a.attname = expected.column_name
       and not a.attisdropped
     where a.attname is null
        or pg_catalog.format_type(a.atttypid, a.atttypmod) <>
           expected.type_name
        or (
          expected.must_be_not_null
          and not a.attnotnull
        )
        or a.attgenerated::text <> expected.generated_kind
  ) then
    raise exception 'public.health_events does not match the required report transition schema';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_extension e
     where e.extname = 'pgcrypto'
  ) then
    raise exception 'MIDAS report transition requires pgcrypto';
  end if;

  if v_context.expected_report_count < 0
     or v_context.expected_monthly_delete_count < 0
     or v_context.expected_range_delete_count < 0
     or v_context.expected_report_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'MIDAS report transition received invalid runtime parameters';
  end if;

  select coalesce(
           pg_catalog.array_agg(u.id order by u.id),
           '{}'::uuid[]
         )
    into v_sorted_user_ids
    from (
      select distinct pg_catalog.unnest(
        v_context.expected_report_user_ids
      ) as id
    ) u;

  select coalesce(
           pg_catalog.array_agg(c.id order by c.id),
           '{}'::uuid[]
         )
    into v_sorted_canonical_ids
    from (
      select distinct pg_catalog.unnest(
        v_context.expected_canonical_ids
      ) as id
    ) c;

  if v_sorted_user_ids is distinct from v_context.expected_report_user_ids
     or v_sorted_canonical_ids is distinct from
        v_context.expected_canonical_ids then
    raise exception 'MIDAS report transition UUID lists must be sorted and unique';
  end if;

  perform pg_temp.midas_assert_report_index(false);
end;
$$;

-- A timeout aborts the complete transaction without cleanup or index effects.
lock table public.health_events in share row exclusive mode;

do $$
declare
  v_context pg_temp.midas_report_transition_context%rowtype;
  v_report_count bigint;
  v_report_sha256 text;
  v_report_user_ids uuid[];
  v_non_report_count bigint;
  v_non_report_sha256 text;
begin
  select *
    into strict v_context
    from pg_temp.midas_report_transition_context;

  select i.row_count, i.sha256, i.user_ids
    into strict v_report_count, v_report_sha256, v_report_user_ids
    from pg_temp.midas_health_event_inventory(true) i;

  if v_report_count <> v_context.expected_report_count
     or v_report_sha256 is distinct from
        v_context.expected_report_sha256
     or v_report_user_ids is distinct from
        v_context.expected_report_user_ids then
    raise exception 'MIDAS report inventory drifted under lock'
      using detail = pg_catalog.format(
        'Expected count/hash/users %s/%s/%s, found %s/%s/%s.',
        v_context.expected_report_count,
        v_context.expected_report_sha256,
        v_context.expected_report_user_ids,
        v_report_count,
        v_report_sha256,
        v_report_user_ids
      );
  end if;

  select i.row_count, i.sha256
    into strict v_non_report_count, v_non_report_sha256
    from pg_temp.midas_health_event_inventory(false) i;

  update pg_temp.midas_report_transition_context
     set non_report_count_before = v_non_report_count,
         non_report_sha256_before = v_non_report_sha256;
end;
$$;

create temporary table midas_range_candidates
on commit drop
as
with raw as (
  select e.id,
         e.user_id,
         e.day,
         e.ts,
         e.payload #>> '{period,from}' as from_text,
         e.payload #>> '{period,to}' as to_text,
         e.payload->>'generated_at' as generated_text,
         e.payload->>'created_at' as created_text,
         e.payload->>'text' as report_text
    from public.health_events e
   where e.type = 'system_comment'
     and e.payload->>'subtype' = 'range_report'
),
typed as (
  select r.*,
         case
           when r.from_text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
            and pg_catalog.pg_input_is_valid(r.from_text, 'date')
             then r.from_text::date
           else null
         end as from_day,
         case
           when r.to_text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
            and pg_catalog.pg_input_is_valid(r.to_text, 'date')
             then r.to_text::date
           else null
         end as to_day,
         case
           when pg_catalog.pg_input_is_valid(
             r.generated_text,
             'timestamp with time zone'
           ) then r.generated_text::timestamptz
           when pg_catalog.pg_input_is_valid(
             r.created_text,
             'timestamp with time zone'
           ) then r.created_text::timestamptz
           else r.ts
         end as effective_generated_at
    from raw r
)
select t.id,
       t.user_id,
       t.from_day,
       t.to_day,
       t.effective_generated_at,
       (
         t.from_day is not null
         and t.to_day is not null
         and pg_catalog.to_char(t.from_day, 'YYYY-MM-DD') = t.from_text
         and pg_catalog.to_char(t.to_day, 'YYYY-MM-DD') = t.to_text
         and t.from_day <= t.to_day
         and t.to_day <= (
           select c.today_vienna
             from pg_temp.midas_report_transition_context c
         )
         and t.day = t.to_day
         and pg_catalog.btrim(coalesce(t.report_text, '')) <> ''
       ) as is_valid
  from typed t;

create temporary table midas_range_canonical
on commit drop
as
select ranked.id,
       ranked.user_id
  from (
    select c.id,
           c.user_id,
           pg_catalog.row_number() over (
             partition by c.user_id
             order by c.to_day desc,
                      c.effective_generated_at desc,
                      c.id::text desc
           ) as position
      from pg_temp.midas_range_candidates c
     where c.is_valid
  ) ranked
 where ranked.position = 1;

do $$
declare
  v_context pg_temp.midas_report_transition_context%rowtype;
  v_canonical_ids uuid[];
  v_monthly_count bigint;
  v_range_delete_count bigint;
begin
  select *
    into strict v_context
    from pg_temp.midas_report_transition_context;

  select coalesce(
           pg_catalog.array_agg(c.id order by c.id),
           '{}'::uuid[]
         )
    into v_canonical_ids
    from pg_temp.midas_range_canonical c;

  select pg_catalog.count(*)::bigint
    into v_monthly_count
    from public.health_events e
   where e.type = 'system_comment'
     and e.payload->>'subtype' = 'monthly_report';

  select pg_catalog.count(*)::bigint
    into v_range_delete_count
    from pg_temp.midas_range_candidates c
   where not exists (
     select 1
       from pg_temp.midas_range_canonical k
      where k.id = c.id
   );

  if v_canonical_ids is distinct from v_context.expected_canonical_ids then
    raise exception 'MIDAS canonical range-report selection does not match the approved snapshot'
      using detail = pg_catalog.format(
        'Expected %s, found %s.',
        v_context.expected_canonical_ids,
        v_canonical_ids
      );
  end if;

  if v_monthly_count <> v_context.expected_monthly_delete_count
     or v_range_delete_count <> v_context.expected_range_delete_count then
    raise exception 'MIDAS report transition delete effect does not match the approved snapshot'
      using detail = pg_catalog.format(
        'Expected monthly/range deletes %s/%s, found %s/%s.',
        v_context.expected_monthly_delete_count,
        v_context.expected_range_delete_count,
        v_monthly_count,
        v_range_delete_count
      );
  end if;
end;
$$;

with deleted as (
  delete from public.health_events e
   where e.type = 'system_comment'
     and e.payload->>'subtype' = 'monthly_report'
  returning 1
)
update pg_temp.midas_report_transition_context
   set deleted_monthly_count = (
     select pg_catalog.count(*)::bigint from deleted
   );

with deleted as (
  delete from public.health_events e
   where e.type = 'system_comment'
     and e.payload->>'subtype' = 'range_report'
     and not exists (
       select 1
         from pg_temp.midas_range_canonical c
        where c.id = e.id
     )
  returning 1
)
update pg_temp.midas_report_transition_context
   set deleted_range_count = (
     select pg_catalog.count(*)::bigint from deleted
   );

create unique index if not exists uq_events_range_report_per_user
  on public.health_events (user_id)
  where type = 'system_comment'
    and payload->>'subtype' = 'range_report';

comment on index public.uq_events_range_report_per_user is
  'MIDAS single-user invariant: at most one range_report for the authenticated owner.';

do $$
declare
  v_context pg_temp.midas_report_transition_context%rowtype;
  v_canonical_ids uuid[];
  v_non_report_count bigint;
  v_non_report_sha256 text;
  v_remaining_range_count bigint;
begin
  select *
    into strict v_context
    from pg_temp.midas_report_transition_context;

  perform pg_temp.midas_assert_report_index(true);

  if v_context.deleted_monthly_count <>
       v_context.expected_monthly_delete_count
     or v_context.deleted_range_count <>
       v_context.expected_range_delete_count then
    raise exception 'MIDAS report transition actual delete counts drifted';
  end if;

  if exists (
    select 1
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' = 'monthly_report'
  ) then
    raise exception 'monthly_report rows remain after transition';
  end if;

  select pg_catalog.count(*)::bigint,
         coalesce(
           pg_catalog.array_agg(e.id order by e.id),
           '{}'::uuid[]
         )
    into v_remaining_range_count, v_canonical_ids
    from public.health_events e
   where e.type = 'system_comment'
     and e.payload->>'subtype' = 'range_report';

  if v_remaining_range_count <>
       pg_catalog.cardinality(v_context.expected_canonical_ids)
     or v_canonical_ids is distinct from v_context.expected_canonical_ids then
    raise exception 'range_report postcondition does not match the approved canonical IDs';
  end if;

  if exists (
    select 1
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' = 'range_report'
     group by e.user_id
    having pg_catalog.count(*) > 1
  ) then
    raise exception 'range_report singleton postcondition failed';
  end if;

  select i.row_count, i.sha256
    into strict v_non_report_count, v_non_report_sha256
    from pg_temp.midas_health_event_inventory(false) i;

  if v_non_report_count <> v_context.non_report_count_before
     or v_non_report_sha256 is distinct from
        v_context.non_report_sha256_before then
    raise exception 'non-report health_events changed during report transition';
  end if;

  raise notice
    'MIDAS report transition verified: monthly deleted %, range deleted %, canonical %',
    v_context.deleted_monthly_count,
    v_context.deleted_range_count,
    v_remaining_range_count;
end;
$$;

commit;

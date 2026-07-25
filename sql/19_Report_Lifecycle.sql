-- MIDAS report lifecycle singleton contract.
--
-- NON-DESTRUCTIVE FRESH-SETUP SOURCE:
-- This file never deletes or rewrites health_events. It creates exactly one
-- partial unique index that permits at most one range_report for the
-- authenticated MIDAS owner. MIDAS remains a single-user product; user_id is
-- retained only as the existing Auth/RLS ownership boundary.
--
-- Existing databases with duplicate range_report rows must use the separately
-- reviewed, owner-gated transition_report_lifecycle_singleton.sql instead.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
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
  if not coalesce((
    select r.rolsuper or r.rolbypassrls
      from pg_catalog.pg_roles r
     where r.rolname = current_user
  ), false) then
    raise exception 'MIDAS report lifecycle provisioning requires an RLS-bypass role'
      using errcode = '42501';
  end if;

  if pg_catalog.to_regclass('public.health_events') is null then
    raise exception 'MIDAS report lifecycle requires public.health_events';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_class c
     where c.oid = 'public.health_events'::regclass
       and c.relrowsecurity
  ) then
    raise exception 'public.health_events must have RLS enabled before report provisioning';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_attribute a
     where a.attrelid = 'public.health_events'::regclass
       and a.attname = 'user_id'
       and not a.attisdropped
       and pg_catalog.format_type(a.atttypid, a.atttypmod) = 'uuid'
  ) or not exists (
    select 1
      from pg_catalog.pg_attribute a
     where a.attrelid = 'public.health_events'::regclass
       and a.attname = 'type'
       and not a.attisdropped
       and pg_catalog.format_type(a.atttypid, a.atttypmod) = 'text'
  ) or not exists (
    select 1
      from pg_catalog.pg_attribute a
     where a.attrelid = 'public.health_events'::regclass
       and a.attname = 'payload'
       and not a.attisdropped
       and pg_catalog.format_type(a.atttypid, a.atttypmod) = 'jsonb'
  ) then
    raise exception 'public.health_events does not match the required report index schema';
  end if;

  if v_index_oid is not null then
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
      join pg_catalog.pg_class tbl on tbl.oid = i.indrelid
      join pg_catalog.pg_namespace n on n.oid = idx.relnamespace
      left join pg_catalog.pg_attribute a
        on a.attrelid = i.indrelid
       and a.attnum = i.indkey[0]
     where i.indexrelid = v_index_oid
       and i.indrelid = 'public.health_events'::regclass
       and idx.relname = 'uq_events_range_report_per_user'
       and n.nspname = 'public'
       and tbl.relname = 'health_events';

    if not found
       or not coalesce(v_is_unique, false)
       or not coalesce(v_is_valid, false)
       or not coalesce(v_is_ready, false)
       or v_key_count <> 1
       or v_attribute_count <> 1
       or v_key_name is distinct from 'user_id'
       or v_predicate is distinct from v_expected_predicate then
      raise exception 'uq_events_range_report_per_user exists with an unexpected definition'
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
  end if;

  if exists (
    select 1
      from public.health_events e
     where e.type = 'system_comment'
       and e.payload->>'subtype' = 'range_report'
     group by e.user_id
    having pg_catalog.count(*) > 1
  ) then
    raise exception 'duplicate range reports exist; use the reviewed transition script';
  end if;
end;
$$;

create unique index if not exists uq_events_range_report_per_user
  on public.health_events (user_id)
  where type = 'system_comment'
    and payload->>'subtype' = 'range_report';

comment on index public.uq_events_range_report_per_user is
  'MIDAS single-user invariant: at most one range_report for the authenticated owner.';

do $$
declare
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
   where i.indexrelid =
         'public.uq_events_range_report_per_user'::regclass
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
    raise exception 'MIDAS report lifecycle index failed exact verification';
  end if;
end;
$$;

commit;

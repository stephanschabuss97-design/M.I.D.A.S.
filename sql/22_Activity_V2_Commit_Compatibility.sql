-- MIDAS Activity V2 R8: catalog-compatible commit RPC.
--
-- Persistent scope: only public.activity_v2_commit_session(uuid,jsonb).
-- PostgreSQL 17 pg_get_functiondef SHA-256:
--   R2 canonical: 2241cea9a5453a38d074abc88aebe8edb6f7e5c0226d063423daef0b1411418e
--   R8 canonical: 7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e
-- The transaction fails closed on source, overload, owner, search-path,
-- volatility, security, ACL, table/RLS/policy, or catalog-v1/v2 drift.
-- No catalog/table/index/policy/table-ACL mutation and no session call occurs.
-- Exact R2 and exact R8 are the only accepted forward preimages.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';
set local search_path = '';

do $guard$
declare
  v_commit_oid oid;
  v_lookup_oid oid;
  v_source_sha256 text;
  v_acl jsonb;
begin
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity V2 SQL 22 requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity V2 SQL 22 requires postgres session and current user';
  end if;
  if pg_catalog.to_regprocedure('extensions.digest(bytea,text)') is null then
    raise exception 'Activity V2 SQL 22 requires extensions.digest(bytea,text)';
  end if;
  if (select pg_catalog.count(*)
        from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and c.relname = any (array[
           'health_activity_catalog_entries',
           'health_activity_sessions',
           'health_activity_session_items',
           'health_activity_item_sets'
         ]::text[])
         and c.relkind = 'r') <> 4 then
    raise exception 'Activity V2 SQL 22 relation preimage drift detected';
  end if;
  if (select pg_catalog.count(*)
        from pg_catalog.pg_proc p
        join pg_catalog.pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
         and p.proname = any (array[
           'activity_v2_commit_session',
           'activity_v2_last_performance'
         ]::text[])) <> 2
     or (select pg_catalog.count(*)
           from pg_catalog.pg_proc p
           join pg_catalog.pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public'
            and p.proname = 'activity_v2_commit_session') <> 1 then
    raise exception 'Activity V2 SQL 22 RPC overload drift detected';
  end if;

  v_commit_oid := pg_catalog.to_regprocedure(
    'public.activity_v2_commit_session(uuid,jsonb)'
  );
  v_lookup_oid := pg_catalog.to_regprocedure(
    'public.activity_v2_last_performance(text)'
  );
  if v_commit_oid is null or v_lookup_oid is null then
    raise exception 'Activity V2 SQL 22 RPC signature drift detected';
  end if;

  select pg_catalog.encode(
           pg_catalog.sha256(
             pg_catalog.convert_to(pg_catalog.pg_get_functiondef(v_commit_oid), 'UTF8')
           ),
           'hex'
         )
    into strict v_source_sha256;
  if v_source_sha256 not in ('2241cea9a5453a38d074abc88aebe8edb6f7e5c0226d063423daef0b1411418e', '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e') then
    raise exception 'Activity V2 SQL 22 forward source preimage drift: %',
      v_source_sha256;
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_proc p
      join pg_catalog.pg_roles r on r.oid = p.proowner
     where p.oid = v_commit_oid
       and r.rolname = 'postgres'
       and p.prokind = 'f'
       and p.prorettype = 'jsonb'::pg_catalog.regtype
       and p.prosecdef
       and p.provolatile = 'v'
       and p.proconfig = array['search_path=""']::text[]
  ) then
    raise exception 'Activity V2 SQL 22 commit hardening preimage drift';
  end if;

  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_array(
             case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
             grantor.rolname,
             acl.privilege_type,
             acl.is_grantable
           )
           order by
             case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
             grantor.rolname,
             acl.privilege_type
         )
    into v_acl
    from pg_catalog.pg_proc p
    cross join lateral pg_catalog.aclexplode(
      coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
    ) acl
    left join pg_catalog.pg_roles grantee on grantee.oid = acl.grantee
    join pg_catalog.pg_roles grantor on grantor.oid = acl.grantor
   where p.oid = v_commit_oid;
  if v_acl <> '[["authenticated","postgres","EXECUTE",false],["postgres","postgres","EXECUTE",false]]'::jsonb then
    raise exception 'Activity V2 SQL 22 commit ACL preimage drift';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_proc p
      join pg_catalog.pg_roles r on r.oid = p.proowner
     where p.oid = v_lookup_oid
       and r.rolname = 'postgres'
       and p.prokind = 'f'
       and p.prorettype = 'jsonb'::pg_catalog.regtype
       and not p.prosecdef
       and p.provolatile = 's'
       and p.proconfig = array['search_path=""']::text[]
  ) then
    raise exception 'Activity V2 SQL 22 lookup hardening preimage drift';
  end if;

  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_array(
             case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
             grantor.rolname,
             acl.privilege_type,
             acl.is_grantable
           )
           order by
             case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
             grantor.rolname,
             acl.privilege_type
         )
    into v_acl
    from pg_catalog.pg_proc p
    cross join lateral pg_catalog.aclexplode(
      coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
    ) acl
    left join pg_catalog.pg_roles grantee on grantee.oid = acl.grantee
    join pg_catalog.pg_roles grantor on grantor.oid = acl.grantor
   where p.oid = v_lookup_oid;
  if v_acl <> '[["authenticated","postgres","EXECUTE",false],["postgres","postgres","EXECUTE",false]]'::jsonb then
    raise exception 'Activity V2 SQL 22 lookup ACL preimage drift';
  end if;
end;
$guard$;

create temporary table midas_activity_v2_sql22_preimage
on commit drop
as
with target_tables as (
  select c.oid, c.relname
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname = any (array[
       'health_activity_catalog_entries',
       'health_activity_sessions',
       'health_activity_session_items',
       'health_activity_item_sets'
     ]::text[])
), contract as (
  select pg_catalog.jsonb_build_object(
    'tables', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity
        ) order by t.relname
      )
        from target_tables t
        join pg_catalog.pg_class c on c.oid = t.oid
    ),
    'columns', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname,
          a.attname,
          pg_catalog.format_type(a.atttypid, a.atttypmod),
          a.attnotnull,
          a.attidentity,
          a.attgenerated,
          pg_catalog.pg_get_expr(d.adbin, d.adrelid)
        ) order by t.relname, a.attnum
      )
        from target_tables t
        join pg_catalog.pg_attribute a on a.attrelid = t.oid
        left join pg_catalog.pg_attrdef d
          on d.adrelid = a.attrelid and d.adnum = a.attnum
       where a.attnum > 0 and not a.attisdropped
    ),
    'constraints', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname,
          con.conname,
          con.contype,
          con.condeferrable,
          con.condeferred,
          con.convalidated,
          pg_catalog.pg_get_constraintdef(con.oid, false)
        ) order by t.relname, con.conname
      )
        from target_tables t
        join pg_catalog.pg_constraint con on con.conrelid = t.oid
    ),
    'indexes', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname,
          ic.relname,
          i.indisprimary,
          i.indisunique,
          i.indisvalid,
          pg_catalog.pg_get_indexdef(i.indexrelid)
        ) order by t.relname, ic.relname
      )
        from target_tables t
        join pg_catalog.pg_index i on i.indrelid = t.oid
        join pg_catalog.pg_class ic on ic.oid = i.indexrelid
    ),
    'policies', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname,
          p.polname,
          p.polpermissive,
          p.polcmd,
          (
            select pg_catalog.jsonb_agg(r.rolname order by r.rolname)
              from pg_catalog.unnest(p.polroles) policy_role(role_oid)
              join pg_catalog.pg_roles r on r.oid = policy_role.role_oid
          ),
          pg_catalog.pg_get_expr(p.polqual, p.polrelid),
          pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid)
        ) order by t.relname, p.polname
      )
        from target_tables t
        join pg_catalog.pg_policy p on p.polrelid = t.oid
    )
  ) as value
)
select
  pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(contract.value::text, 'UTF8')),
    'hex'
  ) as structure_sha256,
  (
    select pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) order by c.item_key)::text,
          'UTF8'
        )
      ),
      'hex'
    )
      from public.health_activity_catalog_entries c
     where c.catalog_version = 1
  ) as catalog_v1_sha256,
  (
    select pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) order by c.item_key)::text,
          'UTF8'
        )
      ),
      'hex'
    )
      from public.health_activity_catalog_entries c
     where c.catalog_version = 2
  ) as catalog_v2_sha256,
  (
    select pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.jsonb_agg(
            pg_catalog.to_jsonb(c)
            order by c.catalog_version, c.item_key
          )::text,
          'UTF8'
        )
      ),
      'hex'
    )
      from public.health_activity_catalog_entries c
  ) as catalog_all_sha256,
  (
    select pg_catalog.jsonb_object_agg(
      c.relname, coalesce(c.relacl::text, '')
      order by c.relname
    )
      from target_tables t
      join pg_catalog.pg_class c on c.oid = t.oid
  ) as table_acls,
  (
    select pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(
            'public.activity_v2_last_performance(text)'::pg_catalog.regprocedure
          ),
          'UTF8'
        )
      ),
      'hex'
    )
  ) as lookup_source_sha256,
  (select pg_catalog.count(*) from public.health_activity_sessions) as session_count,
  (select pg_catalog.count(*) from public.health_activity_session_items) as item_count,
  (select pg_catalog.count(*) from public.health_activity_item_sets) as set_count
from contract;

do $contract$
declare
  v_table text;
  v_owner oid := pg_catalog.to_regrole('postgres');
  v_authenticated oid := pg_catalog.to_regrole('authenticated');
  v_service_role oid := pg_catalog.to_regrole('service_role');
begin
  if (select structure_sha256 from midas_activity_v2_sql22_preimage) <>
     '657f31c14b1a17e17241b1cd9aaa4c69a0622321c1f5e6e13927df4ebb23ee14' then
    raise exception 'Activity V2 SQL 22 table/RLS/policy preimage drift';
  end if;
  if (select catalog_v1_sha256 from midas_activity_v2_sql22_preimage) <>
     '1bc0853352280268497dc9b48f73d31722eb3cb7e505762c966554c38bca2147'
     or (select catalog_v2_sha256 from midas_activity_v2_sql22_preimage) <>
     'ca18cdefa6017c94d9f070911acdce872e34631dd5396df0e9063bb7776395d4'
     or (select pg_catalog.count(*)
           from public.health_activity_catalog_entries
          where catalog_version = 1) <> 78
     or (select pg_catalog.count(*)
           from public.health_activity_catalog_entries
          where catalog_version = 2) <> 80 then
    raise exception 'Activity V2 SQL 22 catalog v1/v2 preimage drift';
  end if;

  foreach v_table in array array[
    'health_activity_catalog_entries',
    'health_activity_sessions',
    'health_activity_session_items',
    'health_activity_item_sets'
  ]::text[] loop
    if not exists (
      select 1
        from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and c.relname = v_table
         and c.relowner = v_owner
         and c.relrowsecurity
         and not c.relforcerowsecurity
    )
       or not pg_catalog.has_table_privilege(
         'authenticated', 'public.' || v_table, 'SELECT'
       )
       or not pg_catalog.has_table_privilege(
         'service_role', 'public.' || v_table, 'SELECT'
       )
       or pg_catalog.has_table_privilege(
         'anon', 'public.' || v_table,
         'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'
       )
       or pg_catalog.has_table_privilege(
         'authenticated', 'public.' || v_table,
         'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'
       )
       or pg_catalog.has_table_privilege(
         'service_role', 'public.' || v_table,
         'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'
       )
       or exists (
         select 1
           from pg_catalog.pg_class c
           join pg_catalog.pg_namespace n on n.oid = c.relnamespace
           cross join lateral pg_catalog.aclexplode(
             coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
           ) acl
          where n.nspname = 'public'
            and c.relname = v_table
            and (
              acl.grantor <> v_owner
              or acl.grantee not in (v_owner, v_authenticated, v_service_role)
              or (
                acl.grantee in (v_authenticated, v_service_role)
                and acl.privilege_type <> 'SELECT'
              )
              or (acl.grantee <> v_owner and acl.is_grantable)
            )
       ) then
      raise exception 'Activity V2 SQL 22 table ACL preimage drift: %', v_table;
    end if;
  end loop;
end;
$contract$;

create or replace function public.activity_v2_commit_session(
  p_request_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_started_at timestamptz;
  v_ended_at timestamptz;
  v_duration_min integer;
  v_title text;
  v_note text;
  v_client_catalog_version integer;
  v_canonical_payload jsonb;
  v_canonical_items jsonb := '[]'::jsonb;
  v_canonical_sets jsonb;
  v_canonical_set jsonb;
  v_item jsonb;
  v_set jsonb;
  v_item_count integer;
  v_set_count integer;
  v_item_order integer;
  v_set_order integer;
  v_item_orders integer[] := array[]::integer[];
  v_set_orders integer[];
  v_item_keys text[] := array[]::text[];
  v_item_key text;
  v_number numeric;
  v_item_duration integer;
  v_distance_km numeric(6,2);
  v_item_note text;
  v_reps integer;
  v_duration_sec integer;
  v_distance_m numeric(7,2);
  v_weight_kg numeric(6,2);
  v_assistance_kg numeric(6,2);
  v_fingerprint text;
  v_existing_fingerprint text;
  v_session_id uuid;
  v_session_item_id uuid;
  v_outcome text;
  v_tracking_mode text;
  v_label text;
  v_equipment text;
  v_load_comparability text;
  v_field_policy jsonb;
  v_field text;
  v_rule text;
  v_value_text text;
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_request_id is null then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload) <> 'object' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  if not (p_payload ?& array[
    'schema_version', 'catalog_version', 'started_at', 'ended_at',
    'duration_min', 'items'
  ]::text[])
  or p_payload - array[
    'schema_version', 'catalog_version', 'started_at', 'ended_at',
    'duration_min', 'title', 'note', 'items'
  ]::text[] <> '{}'::jsonb then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'schema_version') <> 'string'
     or p_payload ->> 'schema_version' <> 'midas.activity-session.v1' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'catalog_version') <> 'number' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_number := (p_payload ->> 'catalog_version')::numeric;
  if v_number <> pg_catalog.trunc(v_number)
     or v_number < 1 or v_number > 2147483647 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_client_catalog_version := v_number::integer;

  if pg_catalog.jsonb_typeof(p_payload -> 'started_at') <> 'string'
     or pg_catalog.jsonb_typeof(p_payload -> 'ended_at') <> 'string'
     or (p_payload ->> 'started_at') !~
       '^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt ][0-9]{2}:[0-9]{2}(:[0-9]{2}(\.[0-9]+)?)?([Zz]|[+-][0-9]{2}:[0-9]{2})$'
     or (p_payload ->> 'ended_at') !~
       '^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt ][0-9]{2}:[0-9]{2}(:[0-9]{2}(\.[0-9]+)?)?([Zz]|[+-][0-9]{2}:[0-9]{2})$' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  begin
    v_started_at := (p_payload ->> 'started_at')::timestamptz;
    v_ended_at := (p_payload ->> 'ended_at')::timestamptz;
  exception when others then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end;
  if v_ended_at < v_started_at then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'duration_min') <> 'number' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_number := (p_payload ->> 'duration_min')::numeric;
  if v_number <> pg_catalog.trunc(v_number)
     or v_number < 1 or v_number > 1440 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_duration_min := v_number::integer;

  if not (p_payload ? 'title') or p_payload -> 'title' = 'null'::jsonb then
    v_title := null;
  elsif pg_catalog.jsonb_typeof(p_payload -> 'title') = 'string' then
    v_title := pg_catalog.btrim(p_payload ->> 'title');
    if v_title = '' then v_title := null; end if;
    if v_title is not null and pg_catalog.char_length(v_title) > 120 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  else
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if not (p_payload ? 'note') or p_payload -> 'note' = 'null'::jsonb then
    v_note := null;
  elsif pg_catalog.jsonb_typeof(p_payload -> 'note') = 'string' then
    v_note := pg_catalog.btrim(p_payload ->> 'note');
    if v_note = '' then v_note := null; end if;
    if v_note is not null and pg_catalog.char_length(v_note) > 500 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  else
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'items') <> 'array' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_item_count := pg_catalog.jsonb_array_length(p_payload -> 'items');
  if v_item_count < 1 or v_item_count > 50 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  for v_item in
    select e.value from pg_catalog.jsonb_array_elements(p_payload -> 'items') e(value)
  loop
    if pg_catalog.jsonb_typeof(v_item) <> 'object'
       or not (v_item ?& array['item_key', 'item_order', 'sets']::text[])
       or v_item - array[
         'item_key', 'item_order', 'duration_min', 'distance_km', 'note', 'sets'
       ]::text[] <> '{}'::jsonb then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    if pg_catalog.jsonb_typeof(v_item -> 'item_key') <> 'string' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_key := v_item ->> 'item_key';
    if pg_catalog.char_length(v_item_key) not between 1 and 64
       or v_item_key !~ '^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$'
       or v_item_key = any (v_item_keys) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_keys := pg_catalog.array_append(v_item_keys, v_item_key);

    if pg_catalog.jsonb_typeof(v_item -> 'item_order') <> 'number' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_number := (v_item ->> 'item_order')::numeric;
    if v_number <> pg_catalog.trunc(v_number)
       or v_number < 1 or v_number > 50 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_order := v_number::integer;
    if v_item_order = any (v_item_orders) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_orders := pg_catalog.array_append(v_item_orders, v_item_order);

    v_item_duration := null;
    if v_item ? 'duration_min' and v_item -> 'duration_min' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'duration_min') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_item ->> 'duration_min')::numeric;
      if v_number <> pg_catalog.trunc(v_number)
         or v_number < 1 or v_number > 1440 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_item_duration := v_number::integer;
    end if;

    v_distance_km := null;
    if v_item ? 'distance_km' and v_item -> 'distance_km' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'distance_km') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_item ->> 'distance_km')::numeric;
      if v_number <> pg_catalog.round(v_number, 2)
         or v_number < 0.01 or v_number > 1000.00 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_distance_km := v_number::numeric(6,2);
    end if;

    v_item_note := null;
    if v_item ? 'note' and v_item -> 'note' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'note') <> 'string' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_item_note := pg_catalog.btrim(v_item ->> 'note');
      if v_item_note = '' then v_item_note := null; end if;
      if v_item_note is not null and pg_catalog.char_length(v_item_note) > 500 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
    end if;

    if pg_catalog.jsonb_typeof(v_item -> 'sets') <> 'array' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_set_count := pg_catalog.jsonb_array_length(v_item -> 'sets');
    if v_set_count > 50 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_set_orders := array[]::integer[];
    v_canonical_sets := '[]'::jsonb;

    for v_set in
      select e.value from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
    loop
      if pg_catalog.jsonb_typeof(v_set) <> 'object'
         or not (v_set ? 'set_order')
         or v_set - array[
           'set_order', 'reps', 'duration_sec', 'distance_m',
           'weight_kg', 'assistance_kg'
         ]::text[] <> '{}'::jsonb then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      if pg_catalog.jsonb_typeof(v_set -> 'set_order') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_set ->> 'set_order')::numeric;
      if v_number <> pg_catalog.trunc(v_number)
         or v_number < 1 or v_number > 50 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_set_order := v_number::integer;
      if v_set_order = any (v_set_orders) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_set_orders := pg_catalog.array_append(v_set_orders, v_set_order);

      v_reps := null;
      if v_set ? 'reps' and v_set -> 'reps' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'reps') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'reps')::numeric;
        if v_number <> pg_catalog.trunc(v_number)
           or v_number < 1 or v_number > 1000 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_reps := v_number::integer;
      end if;

      v_duration_sec := null;
      if v_set ? 'duration_sec' and v_set -> 'duration_sec' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'duration_sec') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'duration_sec')::numeric;
        if v_number <> pg_catalog.trunc(v_number)
           or v_number < 1 or v_number > 3600 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_duration_sec := v_number::integer;
      end if;

      v_distance_m := null;
      if v_set ? 'distance_m' and v_set -> 'distance_m' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'distance_m') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'distance_m')::numeric;
        if v_number <> pg_catalog.round(v_number, 2)
           or v_number < 0.10 or v_number > 10000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_distance_m := v_number::numeric(7,2);
      end if;

      v_weight_kg := null;
      if v_set ? 'weight_kg' and v_set -> 'weight_kg' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'weight_kg') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'weight_kg')::numeric;
        if v_number <> pg_catalog.round(v_number, 2)
           or v_number < 0.01 or v_number > 1000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_weight_kg := v_number::numeric(6,2);
      end if;

      v_assistance_kg := null;
      if v_set ? 'assistance_kg'
         and v_set -> 'assistance_kg' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'assistance_kg') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'assistance_kg')::numeric;
        if v_number <> pg_catalog.round(v_number, 2)
           or v_number < 0.01 or v_number > 1000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_assistance_kg := v_number::numeric(6,2);
      end if;

      if (case when v_reps is null then 0 else 1 end)
         + (case when v_duration_sec is null then 0 else 1 end)
         + (case when v_distance_m is null then 0 else 1 end) <> 1
         or (v_weight_kg is not null and v_assistance_kg is not null) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      v_canonical_set := pg_catalog.jsonb_build_object(
        'set_order', v_set_order,
        'reps', v_reps,
        'duration_sec', v_duration_sec,
        'distance_m', v_distance_m,
        'weight_kg', v_weight_kg,
        'assistance_kg', v_assistance_kg
      );
      v_canonical_sets := v_canonical_sets
        || pg_catalog.jsonb_build_array(v_canonical_set);
    end loop;

    if v_set_count > 0 then
      for v_index in 1..v_set_count loop
        if not (v_index = any (v_set_orders)) then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
      end loop;
      select pg_catalog.jsonb_agg(e.value order by (e.value ->> 'set_order')::integer)
        into v_canonical_sets
        from pg_catalog.jsonb_array_elements(v_canonical_sets) e(value);
    end if;

    v_canonical_items := v_canonical_items || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'item_key', v_item_key,
        'item_order', v_item_order,
        'duration_min', v_item_duration,
        'distance_km', v_distance_km,
        'note', v_item_note,
        'sets', v_canonical_sets
      )
    );
  end loop;

  for v_index in 1..v_item_count loop
    if not (v_index = any (v_item_orders)) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  end loop;
  select pg_catalog.jsonb_agg(e.value order by (e.value ->> 'item_order')::integer)
    into v_canonical_items
    from pg_catalog.jsonb_array_elements(v_canonical_items) e(value);

  v_canonical_payload := pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session.v1',
    'catalog_version', v_client_catalog_version,
    'started_at', pg_catalog.to_char(
      pg_catalog.timezone('UTC', v_started_at),
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
    ),
    'ended_at', pg_catalog.to_char(
      pg_catalog.timezone('UTC', v_ended_at),
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
    ),
    'duration_min', v_duration_min,
    'title', v_title,
    'note', v_note,
    'items', v_canonical_items
  );
  v_fingerprint := pg_catalog.encode(
    extensions.digest(
      pg_catalog.convert_to(v_canonical_payload::text, 'UTF8'),
      'sha256'
    ),
    'hex'
  );

  select s.id, s.request_fingerprint
    into v_session_id, v_existing_fingerprint
    from public.health_activity_sessions s
   where s.user_id = v_user and s.request_id = p_request_id;

  if found then
    if v_existing_fingerprint <> v_fingerprint then
      raise exception 'MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT'
        using errcode = '22023';
    end if;
    v_outcome := 'replayed';
  else
    if v_ended_at > v_now + interval '5 minutes' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    if not exists (
      select 1
        from public.health_activity_catalog_entries c
       where c.catalog_version = v_client_catalog_version
    ) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    for v_item in
      select e.value
        from pg_catalog.jsonb_array_elements(v_canonical_items) e(value)
       order by (e.value ->> 'item_order')::integer
    loop
      v_item_key := v_item ->> 'item_key';
      select
        c.label,
        c.tracking_mode,
        c.equipment,
        c.load_comparability,
        c.field_policy
        into
          v_label,
          v_tracking_mode,
          v_equipment,
          v_load_comparability,
          v_field_policy
        from public.health_activity_catalog_entries c
       where c.catalog_version = v_client_catalog_version
         and c.item_key = v_item_key
         and c.status = 'active';
      if not found then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      v_set_count := pg_catalog.jsonb_array_length(v_item -> 'sets');
      if (v_tracking_mode = 'strength_sets' and v_set_count < 1)
         or (v_tracking_mode <> 'strength_sets' and v_set_count <> 0) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      foreach v_field in array array['duration_min', 'distance_km', 'note']::text[]
      loop
        v_rule := v_field_policy ->> v_field;
        v_value_text := v_item ->> v_field;
        if (v_rule = 'required' and v_value_text is null)
           or (v_rule = 'forbidden' and v_value_text is not null) then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
      end loop;

      for v_set in
        select e.value from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
      loop
        foreach v_field in array array[
          'reps', 'duration_sec', 'distance_m', 'weight_kg', 'assistance_kg'
        ]::text[]
        loop
          v_rule := v_field_policy ->> v_field;
          v_value_text := v_set ->> v_field;
          if (v_rule = 'required' and v_value_text is null)
             or (v_rule = 'forbidden' and v_value_text is not null) then
            raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
          end if;
        end loop;
      end loop;
    end loop;

    v_session_id := null;
    insert into public.health_activity_sessions (
      user_id,
      request_id,
      request_fingerprint,
      started_at,
      ended_at,
      duration_min,
      title,
      note
    ) values (
      v_user,
      p_request_id,
      v_fingerprint,
      v_started_at,
      v_ended_at,
      v_duration_min,
      v_title,
      v_note
    )
    on conflict (user_id, request_id) do nothing
    returning id into v_session_id;

    if v_session_id is null then
      select s.id, s.request_fingerprint
        into strict v_session_id, v_existing_fingerprint
        from public.health_activity_sessions s
       where s.user_id = v_user and s.request_id = p_request_id;
      if v_existing_fingerprint <> v_fingerprint then
        raise exception 'MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT'
          using errcode = '22023';
      end if;
      v_outcome := 'replayed';
    else
      v_outcome := 'created';
      for v_item in
        select e.value
          from pg_catalog.jsonb_array_elements(v_canonical_items) e(value)
         order by (e.value ->> 'item_order')::integer
      loop
        v_item_key := v_item ->> 'item_key';
        select
          c.label,
          c.tracking_mode,
          c.equipment,
          c.load_comparability,
          c.field_policy
          into strict
            v_label,
            v_tracking_mode,
            v_equipment,
            v_load_comparability,
            v_field_policy
          from public.health_activity_catalog_entries c
         where c.catalog_version = v_client_catalog_version
           and c.item_key = v_item_key
           and c.status = 'active';

        insert into public.health_activity_session_items (
          user_id,
          session_id,
          catalog_version,
          item_key,
          item_order,
          item_label_snapshot,
          tracking_mode_snapshot,
          equipment_snapshot,
          load_comparability_snapshot,
          field_policy_snapshot,
          duration_min,
          distance_km,
          note
        ) values (
          v_user,
          v_session_id,
          v_client_catalog_version,
          v_item_key,
          (v_item ->> 'item_order')::smallint,
          v_label,
          v_tracking_mode,
          v_equipment,
          v_load_comparability,
          v_field_policy,
          (v_item ->> 'duration_min')::integer,
          (v_item ->> 'distance_km')::numeric(6,2),
          v_item ->> 'note'
        )
        returning id into v_session_item_id;

        for v_set in
          select e.value
            from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
           order by (e.value ->> 'set_order')::integer
        loop
          insert into public.health_activity_item_sets (
            user_id,
            session_item_id,
            set_order,
            tracking_mode,
            reps,
            duration_sec,
            distance_m,
            weight_kg,
            assistance_kg
          ) values (
            v_user,
            v_session_item_id,
            (v_set ->> 'set_order')::smallint,
            'strength_sets',
            (v_set ->> 'reps')::integer,
            (v_set ->> 'duration_sec')::integer,
            (v_set ->> 'distance_m')::numeric(7,2),
            (v_set ->> 'weight_kg')::numeric(6,2),
            (v_set ->> 'assistance_kg')::numeric(6,2)
          );
        end loop;
      end loop;
    end if;
  end if;

  select pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-result.v1',
    'outcome', v_outcome,
    'session', pg_catalog.jsonb_build_object(
      'id', s.id,
      'request_id', s.request_id,
      'started_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.started_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'ended_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.ended_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'day', s.day,
      'duration_min', s.duration_min,
      'title', s.title,
      'note', s.note,
      'created_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.created_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'updated_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.updated_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'items', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'id', i.id,
            'catalog_version', i.catalog_version,
            'item_key', i.item_key,
            'item_order', i.item_order,
            'item_label_snapshot', i.item_label_snapshot,
            'tracking_mode_snapshot', i.tracking_mode_snapshot,
            'equipment_snapshot', i.equipment_snapshot,
            'load_comparability_snapshot', i.load_comparability_snapshot,
            'field_policy_snapshot', i.field_policy_snapshot,
            'duration_min', i.duration_min,
            'distance_km', i.distance_km,
            'note', i.note,
            'created_at', pg_catalog.to_char(
              pg_catalog.timezone('UTC', i.created_at),
              'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
            ),
            'sets', coalesce((
              select pg_catalog.jsonb_agg(
                pg_catalog.jsonb_build_object(
                  'id', st.id,
                  'set_order', st.set_order,
                  'tracking_mode', st.tracking_mode,
                  'reps', st.reps,
                  'duration_sec', st.duration_sec,
                  'distance_m', st.distance_m,
                  'weight_kg', st.weight_kg,
                  'assistance_kg', st.assistance_kg,
                  'created_at', pg_catalog.to_char(
                    pg_catalog.timezone('UTC', st.created_at),
                    'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
                  )
                ) order by st.set_order
              )
              from public.health_activity_item_sets st
              where st.session_item_id = i.id and st.user_id = v_user
            ), '[]'::jsonb)
          ) order by i.item_order
        )
        from public.health_activity_session_items i
        where i.session_id = s.id and i.user_id = v_user
      ), '[]'::jsonb)
    )
  )
    into strict v_result
    from public.health_activity_sessions s
   where s.id = v_session_id and s.user_id = v_user;

  return v_result;
end;
$$;

alter function public.activity_v2_commit_session(uuid, jsonb)
  owner to postgres;
alter function public.activity_v2_commit_session(uuid, jsonb)
  volatile;
alter function public.activity_v2_commit_session(uuid, jsonb)
  security definer;
alter function public.activity_v2_commit_session(uuid, jsonb)
  set search_path = '';

revoke all on function public.activity_v2_commit_session(uuid, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.activity_v2_commit_session(uuid, jsonb)
  to authenticated;

do $post$
declare
  v_commit_oid oid := 'public.activity_v2_commit_session(uuid,jsonb)'::pg_catalog.regprocedure;
  v_source_sha256 text;
  v_acl jsonb;
begin
  select pg_catalog.encode(
           pg_catalog.sha256(
             pg_catalog.convert_to(pg_catalog.pg_get_functiondef(v_commit_oid), 'UTF8')
           ),
           'hex'
         )
    into strict v_source_sha256;
  if v_source_sha256 <> '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e' then
    raise exception 'Activity V2 SQL 22 forward source postcondition failed: %',
      v_source_sha256;
  end if;
  if not exists (
    select 1
      from pg_catalog.pg_proc p
      join pg_catalog.pg_roles r on r.oid = p.proowner
     where p.oid = v_commit_oid
       and r.rolname = 'postgres'
       and p.prokind = 'f'
       and p.prorettype = 'jsonb'::pg_catalog.regtype
       and p.prosecdef
       and p.provolatile = 'v'
       and p.proconfig = array['search_path=""']::text[]
  ) then
    raise exception 'Activity V2 SQL 22 forward hardening postcondition failed';
  end if;
  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_array(
             case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
             grantor.rolname,
             acl.privilege_type,
             acl.is_grantable
           )
           order by
             case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
             grantor.rolname,
             acl.privilege_type
         )
    into v_acl
    from pg_catalog.pg_proc p
    cross join lateral pg_catalog.aclexplode(
      coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
    ) acl
    left join pg_catalog.pg_roles grantee on grantee.oid = acl.grantee
    join pg_catalog.pg_roles grantor on grantor.oid = acl.grantor
   where p.oid = v_commit_oid;
  if v_acl <> '[["authenticated","postgres","EXECUTE",false],["postgres","postgres","EXECUTE",false]]'::jsonb then
    raise exception 'Activity V2 SQL 22 forward ACL postcondition failed';
  end if;
end;
$post$;

create temporary table midas_activity_v2_sql22_postimage
on commit drop
as
with target_tables as (
  select c.oid, c.relname
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname = any (array[
       'health_activity_catalog_entries',
       'health_activity_sessions',
       'health_activity_session_items',
       'health_activity_item_sets'
     ]::text[])
), contract as (
  select pg_catalog.jsonb_build_object(
    'tables', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity
        ) order by t.relname
      )
        from target_tables t
        join pg_catalog.pg_class c on c.oid = t.oid
    ),
    'columns', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname,
          a.attname,
          pg_catalog.format_type(a.atttypid, a.atttypmod),
          a.attnotnull,
          a.attidentity,
          a.attgenerated,
          pg_catalog.pg_get_expr(d.adbin, d.adrelid)
        ) order by t.relname, a.attnum
      )
        from target_tables t
        join pg_catalog.pg_attribute a on a.attrelid = t.oid
        left join pg_catalog.pg_attrdef d
          on d.adrelid = a.attrelid and d.adnum = a.attnum
       where a.attnum > 0 and not a.attisdropped
    ),
    'constraints', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname,
          con.conname,
          con.contype,
          con.condeferrable,
          con.condeferred,
          con.convalidated,
          pg_catalog.pg_get_constraintdef(con.oid, false)
        ) order by t.relname, con.conname
      )
        from target_tables t
        join pg_catalog.pg_constraint con on con.conrelid = t.oid
    ),
    'indexes', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname,
          ic.relname,
          i.indisprimary,
          i.indisunique,
          i.indisvalid,
          pg_catalog.pg_get_indexdef(i.indexrelid)
        ) order by t.relname, ic.relname
      )
        from target_tables t
        join pg_catalog.pg_index i on i.indrelid = t.oid
        join pg_catalog.pg_class ic on ic.oid = i.indexrelid
    ),
    'policies', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname,
          p.polname,
          p.polpermissive,
          p.polcmd,
          (
            select pg_catalog.jsonb_agg(r.rolname order by r.rolname)
              from pg_catalog.unnest(p.polroles) policy_role(role_oid)
              join pg_catalog.pg_roles r on r.oid = policy_role.role_oid
          ),
          pg_catalog.pg_get_expr(p.polqual, p.polrelid),
          pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid)
        ) order by t.relname, p.polname
      )
        from target_tables t
        join pg_catalog.pg_policy p on p.polrelid = t.oid
    )
  ) as value
)
select
  pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(contract.value::text, 'UTF8')),
    'hex'
  ) as structure_sha256,
  (
    select pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) order by c.item_key)::text,
          'UTF8'
        )
      ),
      'hex'
    )
      from public.health_activity_catalog_entries c
     where c.catalog_version = 1
  ) as catalog_v1_sha256,
  (
    select pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) order by c.item_key)::text,
          'UTF8'
        )
      ),
      'hex'
    )
      from public.health_activity_catalog_entries c
     where c.catalog_version = 2
  ) as catalog_v2_sha256,
  (
    select pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.jsonb_agg(
            pg_catalog.to_jsonb(c)
            order by c.catalog_version, c.item_key
          )::text,
          'UTF8'
        )
      ),
      'hex'
    )
      from public.health_activity_catalog_entries c
  ) as catalog_all_sha256,
  (
    select pg_catalog.jsonb_object_agg(
      c.relname, coalesce(c.relacl::text, '')
      order by c.relname
    )
      from target_tables t
      join pg_catalog.pg_class c on c.oid = t.oid
  ) as table_acls,
  (
    select pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(
            'public.activity_v2_last_performance(text)'::pg_catalog.regprocedure
          ),
          'UTF8'
        )
      ),
      'hex'
    )
  ) as lookup_source_sha256,
  (select pg_catalog.count(*) from public.health_activity_sessions) as session_count,
  (select pg_catalog.count(*) from public.health_activity_session_items) as item_count,
  (select pg_catalog.count(*) from public.health_activity_item_sets) as set_count
from contract;


do $unchanged$
begin
  if not exists (
    select 1
      from midas_activity_v2_sql22_preimage before_state
      cross join midas_activity_v2_sql22_postimage after_state
     where after_state.structure_sha256 = before_state.structure_sha256
       and after_state.catalog_v1_sha256 = before_state.catalog_v1_sha256
       and after_state.catalog_v2_sha256 = before_state.catalog_v2_sha256
       and after_state.catalog_all_sha256 = before_state.catalog_all_sha256
       and after_state.table_acls = before_state.table_acls
       and after_state.lookup_source_sha256 = before_state.lookup_source_sha256
       and after_state.session_count = before_state.session_count
       and after_state.item_count = before_state.item_count
       and after_state.set_count = before_state.set_count
  ) then
    raise exception 'Activity V2 SQL 22 forward changed protected state';
  end if;
end;
$unchanged$;

commit;

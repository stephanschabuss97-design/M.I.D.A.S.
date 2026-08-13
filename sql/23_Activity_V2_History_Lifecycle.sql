-- MIDAS Activity V2 R9: session history, correction, and hard-delete lifecycle.
--
-- Persistent scope:
--   - additive public.health_activity_sessions.revision bigint;
--   - one private canonical-content helper;
--   - four bounded/owner-scoped public lifecycle RPCs.
--
-- This source is intentionally fail-closed. It accepts only the exact R8
-- postimage or its own exact R9 postimage. It never calls a session RPC and
-- never changes the proven R8 commit function, request identity, catalog, RLS,
-- policies, indexes, or existing Activity V2 data.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';
set local search_path = '';

do $guard$
declare
  v_commit_oid oid;
  v_lookup_oid oid;
  v_revision_exists boolean;
  v_public_r9_count integer;
  v_helper_oid oid;
  v_source_sha256 text;
  v_acl jsonb;
begin
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity V2 SQL 23 requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity V2 SQL 23 requires postgres session and current user';
  end if;
  if pg_catalog.to_regprocedure('extensions.digest(bytea,text)') is null then
    raise exception 'Activity V2 SQL 23 requires extensions.digest(bytea,text)';
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
    raise exception 'Activity V2 SQL 23 relation preimage drift detected';
  end if;

  v_commit_oid := pg_catalog.to_regprocedure(
    'public.activity_v2_commit_session(uuid,jsonb)'
  );
  v_lookup_oid := pg_catalog.to_regprocedure(
    'public.activity_v2_last_performance(text)'
  );
  if v_commit_oid is null or v_lookup_oid is null
     or (select pg_catalog.count(*)
           from pg_catalog.pg_proc p
           join pg_catalog.pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public'
            and p.proname = any (array[
              'activity_v2_commit_session',
              'activity_v2_last_performance'
            ]::text[])) <> 2 then
    raise exception 'Activity V2 SQL 23 R8 RPC signature/overload drift detected';
  end if;

  select pg_catalog.encode(
           pg_catalog.sha256(
             pg_catalog.convert_to(pg_catalog.pg_get_functiondef(v_commit_oid), 'UTF8')
           ),
           'hex'
         )
    into strict v_source_sha256;
  if v_source_sha256 <> '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e' then
    raise exception 'Activity V2 SQL 23 R8 commit source drift: %', v_source_sha256;
  end if;
  select pg_catalog.encode(
           pg_catalog.sha256(
             pg_catalog.convert_to(pg_catalog.pg_get_functiondef(v_lookup_oid), 'UTF8')
           ),
           'hex'
         )
    into strict v_source_sha256;
  if v_source_sha256 <> '36958865e48db7f6ca13a7ad36d0d8751f53729c5d40c762654ab2baa73d296e' then
    raise exception 'Activity V2 SQL 23 R8 lookup source drift: %', v_source_sha256;
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
  ) or not exists (
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
    raise exception 'Activity V2 SQL 23 R8 hardening preimage drift';
  end if;

  foreach v_commit_oid in array array[v_commit_oid, v_lookup_oid]::oid[] loop
    select pg_catalog.jsonb_agg(
             pg_catalog.jsonb_build_array(
               case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
               grantor.rolname,
               acl.privilege_type,
               acl.is_grantable
             ) order by
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
      raise exception 'Activity V2 SQL 23 R8 RPC ACL preimage drift';
    end if;
  end loop;

  select exists (
    select 1
      from pg_catalog.pg_attribute a
     where a.attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and a.attname = 'revision'
       and a.attnum > 0
       and not a.attisdropped
  ) into v_revision_exists;

  select pg_catalog.count(*)
    into v_public_r9_count
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = any (array[
       'activity_v2_list_sessions',
       'activity_v2_session_detail',
       'activity_v2_replace_session',
       'activity_v2_delete_session'
     ]::text[]);
  v_helper_oid := pg_catalog.to_regprocedure(
    'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)'
  );

  if not v_revision_exists then
    if v_public_r9_count <> 0
       or v_helper_oid is not null
       or pg_catalog.to_regnamespace('midas_private') is not null then
      raise exception 'Activity V2 SQL 23 partial fresh preimage detected';
    end if;
  else
    if v_public_r9_count <> 4
       or v_helper_oid is null
       or pg_catalog.to_regnamespace('midas_private') is null
       or pg_catalog.to_regprocedure(
            'public.activity_v2_list_sessions(integer,timestamp with time zone,uuid)'
          ) is null
       or pg_catalog.to_regprocedure('public.activity_v2_session_detail(uuid)') is null
       or pg_catalog.to_regprocedure(
            'public.activity_v2_replace_session(uuid,bigint,text,jsonb)'
          ) is null
       or pg_catalog.to_regprocedure(
            'public.activity_v2_delete_session(uuid,bigint,text)'
          ) is null then
      raise exception 'Activity V2 SQL 23 partial rerun preimage detected';
    end if;

    -- Exact pg_get_functiondef fingerprints are filled by the canonical
    -- PostgreSQL-17 fixture and make a rerun fail closed on body drift.
    if (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(v_helper_oid), 'UTF8')), 'hex')) <>
         '7fe25b2b010faf95615907d700091579565b39088adcd44d0bd0484333f30f5e'
       or (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(
            'public.activity_v2_list_sessions(integer,timestamp with time zone,uuid)'::pg_catalog.regprocedure
          ), 'UTF8')), 'hex')) <> 'aeca949ea42b53ec3b7ead67668be4b3c6b70553d538068c01f93157ad0de8ed'
       or (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(
            'public.activity_v2_session_detail(uuid)'::pg_catalog.regprocedure
          ), 'UTF8')), 'hex')) <> '53938011daac6fe80e68a9c3464604b69f396a4d5f5ff4d274cfbcca925cbb11'
       or (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(
            'public.activity_v2_replace_session(uuid,bigint,text,jsonb)'::pg_catalog.regprocedure
          ), 'UTF8')), 'hex')) <> 'feb73a16ccc2680f8ddb368ffbabd1c4cb41320838af9d6040b6c6d2a7cf1f7f'
       or (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(
            'public.activity_v2_delete_session(uuid,bigint,text)'::pg_catalog.regprocedure
          ), 'UTF8')), 'hex')) <> '97474cc440ca538abd0fa6f444bb2bb69fd801f2080c28e5d81599484477f54b' then
      raise exception 'Activity V2 SQL 23 rerun source drift detected';
    end if;
  end if;
end;
$guard$;

lock table public.health_activity_catalog_entries,
  public.health_activity_sessions,
  public.health_activity_session_items,
  public.health_activity_item_sets in share mode;

create temporary table midas_activity_v2_sql23_preimage
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
        ) order by t.relname)
        from target_tables t join pg_catalog.pg_class c on c.oid = t.oid
    ),
    'columns', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname, a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod),
          a.attnotnull, a.attidentity, a.attgenerated,
          pg_catalog.pg_get_expr(d.adbin, d.adrelid)
        ) order by t.relname, a.attnum)
        from target_tables t
        join pg_catalog.pg_attribute a on a.attrelid = t.oid
        left join pg_catalog.pg_attrdef d
          on d.adrelid = a.attrelid and d.adnum = a.attnum
       where a.attnum > 0 and not a.attisdropped and a.attname <> 'revision'
    ),
    'constraints', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname, con.conname, con.contype, con.condeferrable,
          con.condeferred, con.convalidated,
          pg_catalog.pg_get_constraintdef(con.oid, false)
        ) order by t.relname, con.conname)
        from target_tables t
        join pg_catalog.pg_constraint con on con.conrelid = t.oid
       where con.conname <> 'health_activity_sessions_revision_check'
    ),
    'indexes', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname, ic.relname, i.indisprimary, i.indisunique, i.indisvalid,
          pg_catalog.pg_get_indexdef(i.indexrelid)
        ) order by t.relname, ic.relname)
        from target_tables t
        join pg_catalog.pg_index i on i.indrelid = t.oid
        join pg_catalog.pg_class ic on ic.oid = i.indexrelid
    ),
    'policies', (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_array(
          t.relname, p.polname, p.polpermissive, p.polcmd,
          (select pg_catalog.jsonb_agg(r.rolname order by r.rolname)
             from pg_catalog.unnest(p.polroles) role_oid
             join pg_catalog.pg_roles r on r.oid = role_oid),
          pg_catalog.pg_get_expr(p.polqual, p.polrelid),
          pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid)
        ) order by t.relname, p.polname)
        from target_tables t
        join pg_catalog.pg_policy p on p.polrelid = t.oid
    )
  ) as value
)
select
  pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(contract.value::text, 'UTF8')), 'hex')
    as r8_structure_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) - 'revision' order by s.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_sessions s) as sessions_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_session_items i) as items_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_item_sets st) as sets_sha256,
  (select pg_catalog.count(*) from public.health_activity_sessions) as session_count
from contract;

do $preimage$
declare
  v_table text;
  v_owner oid := pg_catalog.to_regrole('postgres');
  v_authenticated oid := pg_catalog.to_regrole('authenticated');
  v_service_role oid := pg_catalog.to_regrole('service_role');
begin
  if (select r8_structure_sha256 from midas_activity_v2_sql23_preimage) <>
     '657f31c14b1a17e17241b1cd9aaa4c69a0622321c1f5e6e13927df4ebb23ee14' then
    raise exception 'Activity V2 SQL 23 table/RLS/policy preimage drift';
  end if;
  if (select pg_catalog.count(*) from public.health_activity_catalog_entries where catalog_version = 1) <> 78
     or (select pg_catalog.count(*) from public.health_activity_catalog_entries where catalog_version = 2) <> 80
     or (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) order by c.item_key)::text,
          'UTF8')), 'hex')
           from public.health_activity_catalog_entries c
          where c.catalog_version = 1) <>
        '1bc0853352280268497dc9b48f73d31722eb3cb7e505762c966554c38bca2147'
     or (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) order by c.item_key)::text,
          'UTF8')), 'hex')
           from public.health_activity_catalog_entries c
          where c.catalog_version = 2) <>
        'ca18cdefa6017c94d9f070911acdce872e34631dd5396df0e9063bb7776395d4' then
    raise exception 'Activity V2 SQL 23 catalog v1/v2 preimage drift';
  end if;

  foreach v_table in array array[
    'health_activity_catalog_entries', 'health_activity_sessions',
    'health_activity_session_items', 'health_activity_item_sets'
  ]::text[] loop
    if not exists (
      select 1 from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = v_table
        and c.relowner = v_owner and c.relrowsecurity and not c.relforcerowsecurity
    )
       or not pg_catalog.has_table_privilege('authenticated', 'public.' || v_table, 'SELECT')
       or not pg_catalog.has_table_privilege('service_role', 'public.' || v_table, 'SELECT')
       or pg_catalog.has_table_privilege('anon', 'public.' || v_table,
          'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
       or pg_catalog.has_table_privilege('authenticated', 'public.' || v_table,
          'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
       or pg_catalog.has_table_privilege('service_role', 'public.' || v_table,
          'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
       or exists (
         select 1 from pg_catalog.pg_class c
         join pg_catalog.pg_namespace n on n.oid = c.relnamespace
         cross join lateral pg_catalog.aclexplode(
           coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))) acl
         where n.nspname = 'public' and c.relname = v_table
           and (acl.grantor <> v_owner
             or acl.grantee not in (v_owner, v_authenticated, v_service_role)
             or (acl.grantee in (v_authenticated, v_service_role)
                 and acl.privilege_type <> 'SELECT')
             or (acl.grantee <> v_owner and acl.is_grantable))
       ) then
      raise exception 'Activity V2 SQL 23 table ACL preimage drift: %', v_table;
    end if;
  end loop;
end;
$preimage$;

do $revision$
begin
  if not exists (
    select 1 from pg_catalog.pg_attribute a
     where a.attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and a.attname = 'revision' and a.attnum > 0 and not a.attisdropped
  ) then
    alter table public.health_activity_sessions
      add column revision bigint not null default 1;
    alter table public.health_activity_sessions
      add constraint health_activity_sessions_revision_check
      check (revision between 1 and 9223372036854775807);
  end if;
end;
$revision$;

do $revision_contract$
begin
  if not exists (
    select 1
      from pg_catalog.pg_attribute a
      join pg_catalog.pg_attrdef d
        on d.adrelid = a.attrelid and d.adnum = a.attnum
     where a.attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and a.attname = 'revision'
       and a.atttypid = 'bigint'::pg_catalog.regtype
       and a.attnotnull
       and pg_catalog.pg_get_expr(d.adbin, d.adrelid) = '1'
  ) or not exists (
    select 1 from pg_catalog.pg_constraint c
     where c.conrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and c.conname = 'health_activity_sessions_revision_check'
       and c.contype = 'c' and c.convalidated
       and pg_catalog.pg_get_constraintdef(c.oid, false) =
         'CHECK (((revision >= 1) AND (revision <= ''9223372036854775807''::bigint)))'
  ) or exists (
    select 1 from public.health_activity_sessions where revision <> 1
  ) and not exists (
    select 1 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'activity_v2_replace_session'
  ) then
    raise exception 'Activity V2 SQL 23 revision contract failed';
  end if;
end;
$revision_contract$;

create schema if not exists midas_private authorization postgres;
alter schema midas_private owner to postgres;
revoke all on schema midas_private from public, anon, authenticated, service_role;

create or replace function midas_private.activity_v2_canonical_content(
  p_catalog_version integer,
  p_duration_min integer,
  p_note text,
  p_items jsonb
)
returns jsonb
language plpgsql
security invoker
immutable
set search_path = ''
as $function$
declare
  v_item jsonb;
  v_set jsonb;
  v_items jsonb := '[]'::jsonb;
  v_sets jsonb;
  v_canonical_set jsonb;
  v_item_count integer;
  v_set_count integer;
  v_item_key text;
  v_item_order integer;
  v_set_order integer;
  v_item_orders integer[] := array[]::integer[];
  v_set_orders integer[];
  v_item_keys text[] := array[]::text[];
  v_number numeric;
  v_item_duration integer;
  v_distance_km numeric(6,2);
  v_item_note text;
  v_reps integer;
  v_duration_sec integer;
  v_distance_m numeric(7,2);
  v_weight_kg numeric(6,2);
  v_assistance_kg numeric(6,2);
  v_label text;
  v_tracking_mode text;
  v_equipment text;
  v_load_comparability text;
  v_field_policy jsonb;
  v_field text;
  v_rule text;
  v_value_text text;
  v_note text;
begin
  if p_catalog_version is null or p_catalog_version < 1
     or p_duration_min is null or p_duration_min not between 1 and 1440
     or p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if p_note is null then
    v_note := null;
  else
    v_note := pg_catalog.btrim(p_note);
    if v_note = '' then v_note := null; end if;
    if v_note is not null and pg_catalog.char_length(v_note) > 500 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  end if;

  v_item_count := pg_catalog.jsonb_array_length(p_items);
  if v_item_count not between 1 and 50 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  for v_item in
    select e.value from pg_catalog.jsonb_array_elements(p_items) e(value)
  loop
    if pg_catalog.jsonb_typeof(v_item) <> 'object'
       or not (v_item ?& array[
         'item_key', 'item_order', 'item_label_snapshot',
         'tracking_mode_snapshot', 'equipment_snapshot',
         'load_comparability_snapshot', 'field_policy_snapshot',
         'duration_min', 'distance_km', 'note', 'sets'
       ]::text[])
       or v_item - array[
         'item_key', 'item_order', 'item_label_snapshot',
         'tracking_mode_snapshot', 'equipment_snapshot',
         'load_comparability_snapshot', 'field_policy_snapshot',
         'duration_min', 'distance_km', 'note', 'sets'
       ]::text[] <> '{}'::jsonb
       or pg_catalog.jsonb_typeof(v_item -> 'item_key') <> 'string'
       or pg_catalog.jsonb_typeof(v_item -> 'item_order') <> 'number'
       or pg_catalog.jsonb_typeof(v_item -> 'item_label_snapshot') <> 'string'
       or pg_catalog.jsonb_typeof(v_item -> 'tracking_mode_snapshot') <> 'string'
       or pg_catalog.jsonb_typeof(v_item -> 'equipment_snapshot') <> 'string'
       or pg_catalog.jsonb_typeof(v_item -> 'load_comparability_snapshot') <> 'string'
       or pg_catalog.jsonb_typeof(v_item -> 'field_policy_snapshot') <> 'object'
       or pg_catalog.jsonb_typeof(v_item -> 'sets') <> 'array' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    v_item_key := v_item ->> 'item_key';
    if pg_catalog.char_length(v_item_key) not between 1 and 64
       or v_item_key !~ '^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$'
       or v_item_key = any (v_item_keys) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_keys := pg_catalog.array_append(v_item_keys, v_item_key);

    v_number := (v_item ->> 'item_order')::numeric;
    if v_number <> pg_catalog.trunc(v_number) or v_number not between 1 and 50 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_order := v_number::integer;
    if v_item_order = any (v_item_orders) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_orders := pg_catalog.array_append(v_item_orders, v_item_order);

    v_label := v_item ->> 'item_label_snapshot';
    v_tracking_mode := v_item ->> 'tracking_mode_snapshot';
    v_equipment := v_item ->> 'equipment_snapshot';
    v_load_comparability := v_item ->> 'load_comparability_snapshot';
    v_field_policy := v_item -> 'field_policy_snapshot';
    if v_label <> pg_catalog.btrim(v_label)
       or pg_catalog.char_length(v_label) not between 1 and 80
       or v_tracking_mode not in ('duration', 'duration_distance', 'strength_sets')
       or v_equipment not in (
         'barbell', 'bodyweight', 'cable', 'cardio_machine', 'dumbbell',
         'kettlebell', 'machine', 'none', 'variable'
       )
       or v_load_comparability not in (
         'device_relative', 'not_applicable', 'standardized'
       )
       or not (v_field_policy ?& array[
         'assistance_kg', 'distance_km', 'distance_m', 'duration_min',
         'duration_sec', 'note', 'reps', 'weight_kg'
       ]::text[])
       or v_field_policy - array[
         'assistance_kg', 'distance_km', 'distance_m', 'duration_min',
         'duration_sec', 'note', 'reps', 'weight_kg'
       ]::text[] <> '{}'::jsonb
       or exists (
         select 1 from pg_catalog.jsonb_each_text(v_field_policy) f
          where f.value not in ('forbidden', 'optional', 'required')
       ) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    v_item_duration := null;
    if v_item -> 'duration_min' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'duration_min') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_item ->> 'duration_min')::numeric;
      if v_number <> pg_catalog.trunc(v_number) or v_number not between 1 and 1440 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_item_duration := v_number::integer;
    end if;

    v_distance_km := null;
    if v_item -> 'distance_km' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'distance_km') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_item ->> 'distance_km')::numeric;
      if v_number <> pg_catalog.round(v_number, 2) or v_number not between 0.01 and 1000.00 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_distance_km := v_number::numeric(6,2);
    end if;

    v_item_note := null;
    if v_item -> 'note' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'note') <> 'string' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_item_note := pg_catalog.btrim(v_item ->> 'note');
      if v_item_note = '' then v_item_note := null; end if;
      if v_item_note is not null and pg_catalog.char_length(v_item_note) > 500 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
    end if;

    v_set_count := pg_catalog.jsonb_array_length(v_item -> 'sets');
    if v_set_count > 50
       or (v_tracking_mode = 'strength_sets' and v_set_count < 1)
       or (v_tracking_mode <> 'strength_sets' and v_set_count <> 0) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_sets := '[]'::jsonb;
    v_set_orders := array[]::integer[];

    for v_set in
      select e.value from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
    loop
      if pg_catalog.jsonb_typeof(v_set) <> 'object'
         or not (v_set ?& array[
           'set_order', 'tracking_mode', 'reps', 'duration_sec',
           'distance_m', 'weight_kg', 'assistance_kg'
         ]::text[])
         or v_set - array[
           'set_order', 'tracking_mode', 'reps', 'duration_sec',
           'distance_m', 'weight_kg', 'assistance_kg'
         ]::text[] <> '{}'::jsonb
         or pg_catalog.jsonb_typeof(v_set -> 'set_order') <> 'number'
         or pg_catalog.jsonb_typeof(v_set -> 'tracking_mode') <> 'string'
         or v_set ->> 'tracking_mode' <> 'strength_sets' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      v_number := (v_set ->> 'set_order')::numeric;
      if v_number <> pg_catalog.trunc(v_number) or v_number not between 1 and 50 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_set_order := v_number::integer;
      if v_set_order = any (v_set_orders) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_set_orders := pg_catalog.array_append(v_set_orders, v_set_order);

      v_reps := null;
      if v_set -> 'reps' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'reps') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'reps')::numeric;
        if v_number <> pg_catalog.trunc(v_number) or v_number not between 1 and 1000 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_reps := v_number::integer;
      end if;

      v_duration_sec := null;
      if v_set -> 'duration_sec' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'duration_sec') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'duration_sec')::numeric;
        if v_number <> pg_catalog.trunc(v_number) or v_number not between 1 and 3600 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_duration_sec := v_number::integer;
      end if;

      v_distance_m := null;
      if v_set -> 'distance_m' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'distance_m') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'distance_m')::numeric;
        if v_number <> pg_catalog.round(v_number, 2) or v_number not between 0.10 and 10000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_distance_m := v_number::numeric(7,2);
      end if;

      v_weight_kg := null;
      if v_set -> 'weight_kg' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'weight_kg') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'weight_kg')::numeric;
        if v_number <> pg_catalog.round(v_number, 2) or v_number not between 0.01 and 1000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_weight_kg := v_number::numeric(6,2);
      end if;

      v_assistance_kg := null;
      if v_set -> 'assistance_kg' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'assistance_kg') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'assistance_kg')::numeric;
        if v_number <> pg_catalog.round(v_number, 2) or v_number not between 0.01 and 1000.00 then
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

      foreach v_field in array array[
        'reps', 'duration_sec', 'distance_m', 'weight_kg', 'assistance_kg'
      ]::text[] loop
        v_rule := v_field_policy ->> v_field;
        v_value_text := v_set ->> v_field;
        if (v_rule = 'required' and v_value_text is null)
           or (v_rule = 'forbidden' and v_value_text is not null) then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
      end loop;

      v_canonical_set := pg_catalog.jsonb_build_object(
        'set_order', v_set_order,
        'tracking_mode', 'strength_sets',
        'reps', v_reps,
        'duration_sec', v_duration_sec,
        'distance_m', v_distance_m,
        'weight_kg', v_weight_kg,
        'assistance_kg', v_assistance_kg
      );
      v_sets := v_sets || pg_catalog.jsonb_build_array(v_canonical_set);
    end loop;

    if v_set_count > 0 then
      for v_index in 1..v_set_count loop
        if not (v_index = any (v_set_orders)) then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
      end loop;
      select pg_catalog.jsonb_agg(e.value order by (e.value ->> 'set_order')::integer)
        into v_sets from pg_catalog.jsonb_array_elements(v_sets) e(value);
    end if;

    foreach v_field in array array['duration_min', 'distance_km', 'note']::text[] loop
      v_rule := v_field_policy ->> v_field;
      v_value_text := case v_field
        when 'duration_min' then v_item_duration::text
        when 'distance_km' then v_distance_km::text
        else v_item_note
      end;
      if (v_rule = 'required' and v_value_text is null)
         or (v_rule = 'forbidden' and v_value_text is not null) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
    end loop;

    v_items := v_items || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'item_key', v_item_key,
        'item_order', v_item_order,
        'item_label_snapshot', v_label,
        'tracking_mode_snapshot', v_tracking_mode,
        'equipment_snapshot', v_equipment,
        'load_comparability_snapshot', v_load_comparability,
        'field_policy_snapshot', v_field_policy,
        'duration_min', v_item_duration,
        'distance_km', v_distance_km,
        'note', v_item_note,
        'sets', v_sets
      )
    );
  end loop;

  for v_index in 1..v_item_count loop
    if not (v_index = any (v_item_orders)) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  end loop;
  select pg_catalog.jsonb_agg(e.value order by (e.value ->> 'item_order')::integer)
    into v_items from pg_catalog.jsonb_array_elements(v_items) e(value);

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-content.v1',
    'catalog_version', p_catalog_version,
    'duration_min', p_duration_min,
    'note', v_note,
    'items', v_items
  );
end;
$function$;

create or replace function public.activity_v2_replace_session(
  p_session_id uuid,
  p_expected_revision bigint,
  p_expected_content_fingerprint text,
  p_replacement jsonb
)
returns jsonb
language plpgsql
security definer
volatile
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_session public.health_activity_sessions%rowtype;
  v_catalog_version integer;
  v_catalog_count integer;
  v_item_count integer;
  v_current_items jsonb;
  v_current_content jsonb;
  v_current_fingerprint text;
  v_desired_items jsonb := '[]'::jsonb;
  v_desired_sets jsonb;
  v_desired_content jsonb;
  v_desired_fingerprint text;
  v_item jsonb;
  v_set jsonb;
  v_item_key text;
  v_item_id uuid;
  v_duration_min integer;
  v_number numeric;
  v_label text;
  v_tracking_mode text;
  v_equipment text;
  v_load_comparability text;
  v_field_policy jsonb;
begin
  if v_user is null or not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_session_id is null
     or p_expected_revision is null or p_expected_revision < 1
     or p_expected_content_fingerprint is null
     or p_expected_content_fingerprint !~ '^[0-9a-f]{64}$'
     or p_replacement is null
     or pg_catalog.jsonb_typeof(p_replacement) <> 'object'
     or not (p_replacement ?& array[
       'schema_version', 'duration_min', 'note', 'items'
     ]::text[])
     or p_replacement - array[
       'schema_version', 'duration_min', 'note', 'items'
     ]::text[] <> '{}'::jsonb
     or pg_catalog.jsonb_typeof(p_replacement -> 'schema_version') <> 'string'
     or p_replacement ->> 'schema_version' <> 'midas.activity-session-replacement.v1'
     or pg_catalog.jsonb_typeof(p_replacement -> 'duration_min') <> 'number'
     or not (pg_catalog.jsonb_typeof(p_replacement -> 'note') in ('string', 'null'))
     or pg_catalog.jsonb_typeof(p_replacement -> 'items') <> 'array' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  v_number := (p_replacement ->> 'duration_min')::numeric;
  if v_number <> pg_catalog.trunc(v_number) or v_number not between 1 and 1440 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_duration_min := v_number::integer;

  select s.* into v_session
    from public.health_activity_sessions s
   where s.id = p_session_id and s.user_id = v_user
   for update;
  if not found then
    raise exception 'MIDAS_ACTIVITY_SESSION_NOT_FOUND' using errcode = 'P0002';
  end if;

  select pg_catalog.count(*)::integer,
         pg_catalog.count(distinct i.catalog_version)::integer,
         pg_catalog.min(i.catalog_version)
    into v_item_count, v_catalog_count, v_catalog_version
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;
  if v_item_count < 1 or v_catalog_count <> 1 or v_catalog_version is null or v_catalog_version < 1 then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end if;

  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
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
             'sets', coalesce((
               select pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object(
                   'set_order', st.set_order,
                   'tracking_mode', st.tracking_mode,
                   'reps', st.reps,
                   'duration_sec', st.duration_sec,
                   'distance_m', st.distance_m,
                   'weight_kg', st.weight_kg,
                   'assistance_kg', st.assistance_kg
                 ) order by st.set_order)
               from public.health_activity_item_sets st
               where st.session_item_id = i.id and st.user_id = v_user
             ), '[]'::jsonb)
           ) order by i.item_order)
    into v_current_items
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;

  begin
    v_current_content := midas_private.activity_v2_canonical_content(
      v_catalog_version, v_session.duration_min, v_session.note, v_current_items
    );
  exception when others then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end;
  v_current_fingerprint := pg_catalog.encode(extensions.digest(
    pg_catalog.convert_to(v_current_content::text, 'UTF8'), 'sha256'), 'hex');

  if pg_catalog.jsonb_array_length(p_replacement -> 'items') not between 1 and 50 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  for v_item in
    select e.value from pg_catalog.jsonb_array_elements(p_replacement -> 'items') e(value)
  loop
    if pg_catalog.jsonb_typeof(v_item) <> 'object'
       or not (v_item ?& array[
         'item_key', 'item_order', 'duration_min', 'distance_km', 'note', 'sets'
       ]::text[])
       or v_item - array[
         'item_key', 'item_order', 'duration_min', 'distance_km', 'note', 'sets'
       ]::text[] <> '{}'::jsonb
       or pg_catalog.jsonb_typeof(v_item -> 'item_key') <> 'string'
       or pg_catalog.jsonb_typeof(v_item -> 'sets') <> 'array' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_key := v_item ->> 'item_key';
    if pg_catalog.char_length(v_item_key) not between 1 and 64
       or v_item_key !~ '^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    select i.item_label_snapshot, i.tracking_mode_snapshot,
           i.equipment_snapshot, i.load_comparability_snapshot,
           i.field_policy_snapshot
      into v_label, v_tracking_mode, v_equipment,
           v_load_comparability, v_field_policy
      from public.health_activity_session_items i
     where i.session_id = v_session.id
       and i.user_id = v_user
       and i.item_key = v_item_key;
    if not found then
      select c.label, c.tracking_mode, c.equipment,
             c.load_comparability, c.field_policy
        into v_label, v_tracking_mode, v_equipment,
             v_load_comparability, v_field_policy
        from public.health_activity_catalog_entries c
       where c.catalog_version = v_catalog_version
         and c.item_key = v_item_key
         and c.status = 'active';
      if not found then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
    end if;

    v_desired_sets := '[]'::jsonb;
    for v_set in
      select e.value from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
    loop
      if pg_catalog.jsonb_typeof(v_set) <> 'object'
         or not (v_set ?& array[
           'set_order', 'reps', 'duration_sec', 'distance_m',
           'weight_kg', 'assistance_kg'
         ]::text[])
         or v_set - array[
           'set_order', 'reps', 'duration_sec', 'distance_m',
           'weight_kg', 'assistance_kg'
         ]::text[] <> '{}'::jsonb then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_desired_sets := v_desired_sets || pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'set_order', v_set -> 'set_order',
          'tracking_mode', 'strength_sets',
          'reps', v_set -> 'reps',
          'duration_sec', v_set -> 'duration_sec',
          'distance_m', v_set -> 'distance_m',
          'weight_kg', v_set -> 'weight_kg',
          'assistance_kg', v_set -> 'assistance_kg'
        )
      );
    end loop;

    v_desired_items := v_desired_items || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'item_key', v_item -> 'item_key',
        'item_order', v_item -> 'item_order',
        'item_label_snapshot', v_label,
        'tracking_mode_snapshot', v_tracking_mode,
        'equipment_snapshot', v_equipment,
        'load_comparability_snapshot', v_load_comparability,
        'field_policy_snapshot', v_field_policy,
        'duration_min', v_item -> 'duration_min',
        'distance_km', v_item -> 'distance_km',
        'note', v_item -> 'note',
        'sets', v_desired_sets
      )
    );
  end loop;

  v_desired_content := midas_private.activity_v2_canonical_content(
    v_catalog_version,
    v_duration_min,
    p_replacement ->> 'note',
    v_desired_items
  );
  v_desired_fingerprint := pg_catalog.encode(extensions.digest(
    pg_catalog.convert_to(v_desired_content::text, 'UTF8'), 'sha256'), 'hex');

  if v_desired_content = v_current_content then
    return pg_catalog.jsonb_build_object(
      'schema_version', 'midas.activity-session-mutation-result.v1',
      'operation', 'replace',
      'outcome', 'replayed',
      'session_id', v_session.id,
      'revision', v_session.revision::text,
      'content_fingerprint', v_current_fingerprint
    );
  end if;

  if p_expected_revision <> v_session.revision
     or p_expected_content_fingerprint <> v_current_fingerprint then
    raise exception 'MIDAS_ACTIVITY_SESSION_CONFLICT' using errcode = '40001';
  end if;
  if v_session.revision = 9223372036854775807 then
    raise exception 'MIDAS_ACTIVITY_REVISION_EXHAUSTED' using errcode = '22023';
  end if;

  delete from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;

  for v_item in
    select e.value
      from pg_catalog.jsonb_array_elements(v_desired_content -> 'items') e(value)
     order by (e.value ->> 'item_order')::integer
  loop
    insert into public.health_activity_session_items (
      user_id, session_id, catalog_version, item_key, item_order,
      item_label_snapshot, tracking_mode_snapshot, equipment_snapshot,
      load_comparability_snapshot, field_policy_snapshot,
      duration_min, distance_km, note
    ) values (
      v_user, v_session.id, v_catalog_version,
      v_item ->> 'item_key', (v_item ->> 'item_order')::smallint,
      v_item ->> 'item_label_snapshot', v_item ->> 'tracking_mode_snapshot',
      v_item ->> 'equipment_snapshot', v_item ->> 'load_comparability_snapshot',
      v_item -> 'field_policy_snapshot',
      (v_item ->> 'duration_min')::integer,
      (v_item ->> 'distance_km')::numeric(6,2),
      v_item ->> 'note'
    ) returning id into v_item_id;

    for v_set in
      select e.value
        from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
       order by (e.value ->> 'set_order')::integer
    loop
      insert into public.health_activity_item_sets (
        user_id, session_item_id, set_order, tracking_mode,
        reps, duration_sec, distance_m, weight_kg, assistance_kg
      ) values (
        v_user, v_item_id, (v_set ->> 'set_order')::smallint,
        v_set ->> 'tracking_mode',
        (v_set ->> 'reps')::integer,
        (v_set ->> 'duration_sec')::integer,
        (v_set ->> 'distance_m')::numeric(7,2),
        (v_set ->> 'weight_kg')::numeric(6,2),
        (v_set ->> 'assistance_kg')::numeric(6,2)
      );
    end loop;
  end loop;

  update public.health_activity_sessions s
     set duration_min = v_duration_min,
         ended_at = s.started_at + pg_catalog.make_interval(mins => v_duration_min),
         note = v_desired_content ->> 'note',
         revision = s.revision + 1,
         updated_at = pg_catalog.clock_timestamp()
   where s.id = v_session.id and s.user_id = v_user;

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-mutation-result.v1',
    'operation', 'replace',
    'outcome', 'updated',
    'session_id', v_session.id,
    'revision', (v_session.revision + 1)::text,
    'content_fingerprint', v_desired_fingerprint
  );
end;
$function$;

create or replace function public.activity_v2_delete_session(
  p_session_id uuid,
  p_expected_revision bigint,
  p_expected_content_fingerprint text
)
returns jsonb
language plpgsql
security definer
volatile
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_session public.health_activity_sessions%rowtype;
  v_catalog_version integer;
  v_catalog_count integer;
  v_item_count integer;
  v_items jsonb;
  v_content jsonb;
  v_fingerprint text;
begin
  if v_user is null or not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_session_id is null
     or p_expected_revision is null or p_expected_revision < 1
     or p_expected_content_fingerprint is null
     or p_expected_content_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  select s.* into v_session
    from public.health_activity_sessions s
   where s.id = p_session_id and s.user_id = v_user
   for update;
  if not found then
    return pg_catalog.jsonb_build_object(
      'schema_version', 'midas.activity-session-mutation-result.v1',
      'operation', 'delete',
      'outcome', 'already_absent',
      'session_id', p_session_id
    );
  end if;

  select pg_catalog.count(*)::integer,
         pg_catalog.count(distinct i.catalog_version)::integer,
         pg_catalog.min(i.catalog_version)
    into v_item_count, v_catalog_count, v_catalog_version
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;
  if v_item_count < 1 or v_catalog_count <> 1 or v_catalog_version is null or v_catalog_version < 1 then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end if;

  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
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
             'sets', coalesce((
               select pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object(
                   'set_order', st.set_order,
                   'tracking_mode', st.tracking_mode,
                   'reps', st.reps,
                   'duration_sec', st.duration_sec,
                   'distance_m', st.distance_m,
                   'weight_kg', st.weight_kg,
                   'assistance_kg', st.assistance_kg
                 ) order by st.set_order)
               from public.health_activity_item_sets st
               where st.session_item_id = i.id and st.user_id = v_user
             ), '[]'::jsonb)
           ) order by i.item_order)
    into v_items
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;

  begin
    v_content := midas_private.activity_v2_canonical_content(
      v_catalog_version, v_session.duration_min, v_session.note, v_items
    );
  exception when others then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end;
  v_fingerprint := pg_catalog.encode(extensions.digest(
    pg_catalog.convert_to(v_content::text, 'UTF8'), 'sha256'), 'hex');

  if p_expected_revision <> v_session.revision
     or p_expected_content_fingerprint <> v_fingerprint then
    raise exception 'MIDAS_ACTIVITY_SESSION_CONFLICT' using errcode = '40001';
  end if;

  delete from public.health_activity_sessions s
   where s.id = v_session.id and s.user_id = v_user;

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-mutation-result.v1',
    'operation', 'delete',
    'outcome', 'deleted',
    'session_id', v_session.id
  );
end;
$function$;


alter function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  owner to postgres;
alter function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  security invoker;
alter function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  immutable;
alter function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  set search_path = '';

create or replace function public.activity_v2_list_sessions(
  p_limit integer,
  p_cursor_started_at timestamptz,
  p_cursor_id uuid
)
returns jsonb
language plpgsql
security invoker
stable
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_rows jsonb;
  v_items jsonb;
  v_has_more boolean;
  v_next_cursor jsonb;
begin
  if v_user is null or not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_limit is null or p_limit not between 1 and 50
     or ((p_cursor_started_at is null) <> (p_cursor_id is null)) then
    raise exception 'MIDAS_ACTIVITY_INVALID_HISTORY_REQUEST' using errcode = '22023';
  end if;

  select coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(q) order by q.started_at desc, q.session_id desc), '[]'::jsonb)
    into v_rows
    from (
      select
        s.id as session_id,
        s.started_at,
        pg_catalog.to_char(pg_catalog.timezone('UTC', s.started_at), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as started_at_text,
        pg_catalog.to_char(s.day, 'YYYY-MM-DD') as day_text,
        s.title,
        s.duration_min,
        (select pg_catalog.count(*)::integer
           from public.health_activity_session_items i
          where i.session_id = s.id and i.user_id = v_user) as item_count,
        s.revision::text as revision
      from public.health_activity_sessions s
      where s.user_id = v_user
        and (p_cursor_started_at is null
          or (s.started_at, s.id) < (p_cursor_started_at, p_cursor_id))
      order by s.started_at desc, s.id desc
      limit p_limit + 1
    ) q;

  v_has_more := pg_catalog.jsonb_array_length(v_rows) > p_limit;
  select coalesce(pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
             'session_id', e.value -> 'session_id',
             'started_at', e.value -> 'started_at_text',
             'day', e.value -> 'day_text',
             'title', e.value -> 'title',
             'duration_min', e.value -> 'duration_min',
             'item_count', e.value -> 'item_count',
             'revision', e.value -> 'revision'
           ) order by e.ordinality
         ), '[]'::jsonb)
    into v_items
    from pg_catalog.jsonb_array_elements(v_rows) with ordinality e(value, ordinality)
   where e.ordinality <= p_limit;

  if v_has_more then
    select pg_catalog.jsonb_build_object(
      'started_at', e.value -> 'started_at_text',
      'id', e.value -> 'session_id'
    ) into v_next_cursor
    from pg_catalog.jsonb_array_elements(v_rows) with ordinality e(value, ordinality)
    where e.ordinality = p_limit;
  else
    v_next_cursor := null;
  end if;

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-history-page.v1',
    'items', v_items,
    'has_more', v_has_more,
    'next_cursor', v_next_cursor
  );
end;
$function$;

create or replace function public.activity_v2_session_detail(p_session_id uuid)
returns jsonb
language plpgsql
security invoker
stable
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_session public.health_activity_sessions%rowtype;
  v_catalog_version integer;
  v_catalog_count integer;
  v_item_count integer;
  v_items jsonb;
  v_content jsonb;
  v_fingerprint text;
begin
  if v_user is null or not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_session_id is null then
    raise exception 'MIDAS_ACTIVITY_INVALID_HISTORY_REQUEST' using errcode = '22023';
  end if;

  select s.* into v_session
    from public.health_activity_sessions s
   where s.id = p_session_id and s.user_id = v_user;
  if not found then return null; end if;

  select pg_catalog.count(*)::integer,
         pg_catalog.count(distinct i.catalog_version)::integer,
         pg_catalog.min(i.catalog_version)
    into v_item_count, v_catalog_count, v_catalog_version
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;
  if v_item_count < 1 or v_catalog_count <> 1 or v_catalog_version is null or v_catalog_version < 1 then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end if;

  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
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
             'sets', coalesce((
               select pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object(
                   'set_order', st.set_order,
                   'tracking_mode', st.tracking_mode,
                   'reps', st.reps,
                   'duration_sec', st.duration_sec,
                   'distance_m', st.distance_m,
                   'weight_kg', st.weight_kg,
                   'assistance_kg', st.assistance_kg
                 ) order by st.set_order)
               from public.health_activity_item_sets st
               where st.session_item_id = i.id and st.user_id = v_user
             ), '[]'::jsonb)
           ) order by i.item_order)
    into v_items
    from public.health_activity_session_items i
   where i.session_id = v_session.id and i.user_id = v_user;

  begin
    v_content := midas_private.activity_v2_canonical_content(
      v_catalog_version, v_session.duration_min, v_session.note, v_items
    );
  exception when others then
    raise exception 'MIDAS_ACTIVITY_SNAPSHOT_DRIFT' using errcode = '22023';
  end;
  v_fingerprint := pg_catalog.encode(extensions.digest(
    pg_catalog.convert_to(v_content::text, 'UTF8'), 'sha256'), 'hex');

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-detail.v1',
    'session_id', v_session.id,
    'catalog_version', v_catalog_version,
    'revision', v_session.revision::text,
    'content_fingerprint', v_fingerprint,
    'started_at', pg_catalog.to_char(pg_catalog.timezone('UTC', v_session.started_at), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'ended_at', pg_catalog.to_char(pg_catalog.timezone('UTC', v_session.ended_at), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'day', pg_catalog.to_char(v_session.day, 'YYYY-MM-DD'),
    'title', v_session.title,
    'duration_min', v_session.duration_min,
    'note', v_content -> 'note',
    'items', v_content -> 'items'
  );
end;
$function$;

-- Canonical hardening. SQL 23 is self-contained; SQL 16 mirrors this state
-- for fresh provisioning after all object-definition files have run.
alter function public.activity_v2_list_sessions(integer, timestamptz, uuid)
  owner to postgres;
alter function public.activity_v2_list_sessions(integer, timestamptz, uuid)
  security invoker;
alter function public.activity_v2_list_sessions(integer, timestamptz, uuid)
  stable;
alter function public.activity_v2_list_sessions(integer, timestamptz, uuid)
  set search_path = '';

alter function public.activity_v2_session_detail(uuid) owner to postgres;
alter function public.activity_v2_session_detail(uuid) security invoker;
alter function public.activity_v2_session_detail(uuid) stable;
alter function public.activity_v2_session_detail(uuid) set search_path = '';

alter function public.activity_v2_replace_session(uuid, bigint, text, jsonb)
  owner to postgres;
alter function public.activity_v2_replace_session(uuid, bigint, text, jsonb)
  security definer;
alter function public.activity_v2_replace_session(uuid, bigint, text, jsonb)
  volatile;
alter function public.activity_v2_replace_session(uuid, bigint, text, jsonb)
  set search_path = '';

alter function public.activity_v2_delete_session(uuid, bigint, text)
  owner to postgres;
alter function public.activity_v2_delete_session(uuid, bigint, text)
  security definer;
alter function public.activity_v2_delete_session(uuid, bigint, text)
  volatile;
alter function public.activity_v2_delete_session(uuid, bigint, text)
  set search_path = '';

revoke all on table public.health_activity_catalog_entries
  from anon, public, authenticated, service_role;
revoke all on table public.health_activity_sessions
  from anon, public, authenticated, service_role;
revoke all on table public.health_activity_session_items
  from anon, public, authenticated, service_role;
revoke all on table public.health_activity_item_sets
  from anon, public, authenticated, service_role;
grant select on table public.health_activity_catalog_entries
  to authenticated, service_role;
grant select on table public.health_activity_sessions
  to authenticated, service_role;
grant select on table public.health_activity_session_items
  to authenticated, service_role;
grant select on table public.health_activity_item_sets
  to authenticated, service_role;

revoke all on schema midas_private from public, anon, authenticated, service_role;
grant usage on schema midas_private to authenticated;
revoke all on function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
  to authenticated;

revoke all on function public.activity_v2_list_sessions(integer, timestamptz, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.activity_v2_session_detail(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.activity_v2_replace_session(uuid, bigint, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.activity_v2_delete_session(uuid, bigint, text)
  from public, anon, authenticated, service_role;
grant execute on function public.activity_v2_list_sessions(integer, timestamptz, uuid)
  to authenticated;
grant execute on function public.activity_v2_session_detail(uuid)
  to authenticated;
grant execute on function public.activity_v2_replace_session(uuid, bigint, text, jsonb)
  to authenticated;
grant execute on function public.activity_v2_delete_session(uuid, bigint, text)
  to authenticated;

do $post$
declare
  v_name text;
  v_oid oid;
  v_expected_security boolean;
  v_expected_volatility "char";
  v_acl jsonb;
  v_hash text;
begin
  if (select r8_structure_sha256 from midas_activity_v2_sql23_preimage) <>
       '657f31c14b1a17e17241b1cd9aaa4c69a0622321c1f5e6e13927df4ebb23ee14'
     or (select sessions_sha256 from midas_activity_v2_sql23_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) - 'revision' order by s.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_sessions s)
     or (select items_sha256 from midas_activity_v2_sql23_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_session_items i)
     or (select sets_sha256 from midas_activity_v2_sql23_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_item_sets st) then
    raise exception 'Activity V2 SQL 23 changed an R8 structure or data row';
  end if;

  if exists (
    select 1 from public.health_activity_sessions where revision is null or revision < 1
  )
     or exists (
       select 1 from pg_catalog.pg_attribute a
        where a.attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
          and a.attname in ('content_fingerprint', 'catalog_version')
          and a.attnum > 0 and not a.attisdropped
     )
     or exists (
       select 1 from pg_catalog.pg_trigger t
        where t.tgrelid = 'public.health_activity_sessions'::pg_catalog.regclass
          and not t.tgisinternal
     ) then
    raise exception 'Activity V2 SQL 23 additive schema postcondition failed';
  end if;

  for v_name, v_oid, v_expected_security, v_expected_volatility in
    select * from (values
      ('list', 'public.activity_v2_list_sessions(integer,timestamp with time zone,uuid)'::pg_catalog.regprocedure::oid, false, 's'::"char"),
      ('detail', 'public.activity_v2_session_detail(uuid)'::pg_catalog.regprocedure::oid, false, 's'::"char"),
      ('replace', 'public.activity_v2_replace_session(uuid,bigint,text,jsonb)'::pg_catalog.regprocedure::oid, true, 'v'::"char"),
      ('delete', 'public.activity_v2_delete_session(uuid,bigint,text)'::pg_catalog.regprocedure::oid, true, 'v'::"char")
    ) x(name, oid, security, volatility)
  loop
    if not exists (
      select 1 from pg_catalog.pg_proc p join pg_catalog.pg_roles r on r.oid = p.proowner
       where p.oid = v_oid and r.rolname = 'postgres'
         and p.prokind = 'f' and p.prorettype = 'jsonb'::pg_catalog.regtype
         and p.prosecdef = v_expected_security
         and p.provolatile = v_expected_volatility
         and p.proconfig = array['search_path=""']::text[]
    ) then
      raise exception 'Activity V2 SQL 23 % hardening postcondition failed', v_name;
    end if;
    select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
             case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
             grantor.rolname, acl.privilege_type, acl.is_grantable)
             order by case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
                      grantor.rolname, acl.privilege_type)
      into v_acl
      from pg_catalog.pg_proc p
      cross join lateral pg_catalog.aclexplode(coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))) acl
      left join pg_catalog.pg_roles grantee on grantee.oid = acl.grantee
      join pg_catalog.pg_roles grantor on grantor.oid = acl.grantor
     where p.oid = v_oid;
    if v_acl <> '[["authenticated","postgres","EXECUTE",false],["postgres","postgres","EXECUTE",false]]'::jsonb then
      raise exception 'Activity V2 SQL 23 % ACL postcondition failed', v_name;
    end if;
    select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      pg_catalog.pg_get_functiondef(v_oid), 'UTF8')), 'hex') into v_hash;
    raise notice 'Activity V2 SQL 23 % source SHA-256: %', v_name, v_hash;
  end loop;

  v_oid := 'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)'::pg_catalog.regprocedure;
  if not exists (
    select 1 from pg_catalog.pg_proc p join pg_catalog.pg_roles r on r.oid = p.proowner
     where p.oid = v_oid and r.rolname = 'postgres'
       and p.prokind = 'f' and p.prorettype = 'jsonb'::pg_catalog.regtype
       and not p.prosecdef and p.provolatile = 'i'
       and p.proconfig = array['search_path=""']::text[]
  )
     or exists (
       select 1
         from pg_catalog.pg_namespace n
         cross join lateral pg_catalog.aclexplode(
           coalesce(n.nspacl, pg_catalog.acldefault('n', n.nspowner))
         ) acl
        where n.oid = 'midas_private'::pg_catalog.regnamespace
          and acl.grantee = 0
          and acl.privilege_type = 'USAGE'
     )
     or pg_catalog.has_schema_privilege('anon', 'midas_private', 'USAGE')
     or pg_catalog.has_schema_privilege('service_role', 'midas_private', 'USAGE')
     or not pg_catalog.has_schema_privilege('authenticated', 'midas_private', 'USAGE')
     or exists (
       select 1
         from pg_catalog.pg_proc p
         cross join lateral pg_catalog.aclexplode(
           coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
         ) acl
        where p.oid = v_oid
          and acl.grantee = 0
          and acl.privilege_type = 'EXECUTE'
     )
     or pg_catalog.has_function_privilege('anon', v_oid, 'EXECUTE')
     or pg_catalog.has_function_privilege('service_role', v_oid, 'EXECUTE')
     or not pg_catalog.has_function_privilege('authenticated', v_oid, 'EXECUTE') then
    raise exception 'Activity V2 SQL 23 private helper hardening postcondition failed';
  end if;
  select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
           case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
           grantor.rolname, acl.privilege_type, acl.is_grantable)
           order by case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
                    grantor.rolname, acl.privilege_type)
    into v_acl
    from pg_catalog.pg_proc p
    cross join lateral pg_catalog.aclexplode(
      coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))) acl
    left join pg_catalog.pg_roles grantee on grantee.oid = acl.grantee
    join pg_catalog.pg_roles grantor on grantor.oid = acl.grantor
   where p.oid = v_oid;
  if v_acl <> '[["authenticated","postgres","EXECUTE",false],["postgres","postgres","EXECUTE",false]]'::jsonb then
    raise exception 'Activity V2 SQL 23 private helper ACL postcondition failed';
  end if;
  select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
           case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
           grantor.rolname, acl.privilege_type, acl.is_grantable)
           order by case when acl.grantee = 0 then 'PUBLIC' else grantee.rolname end,
                    grantor.rolname, acl.privilege_type)
    into v_acl
    from pg_catalog.pg_namespace n
    cross join lateral pg_catalog.aclexplode(
      coalesce(n.nspacl, pg_catalog.acldefault('n', n.nspowner))) acl
    left join pg_catalog.pg_roles grantee on grantee.oid = acl.grantee
    join pg_catalog.pg_roles grantor on grantor.oid = acl.grantor
   where n.oid = 'midas_private'::pg_catalog.regnamespace;
  if v_acl <> '[["authenticated","postgres","USAGE",false],["postgres","postgres","CREATE",false],["postgres","postgres","USAGE",false]]'::jsonb then
    raise exception 'Activity V2 SQL 23 private schema ACL postcondition failed';
  end if;
  select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.pg_get_functiondef(v_oid), 'UTF8')), 'hex') into v_hash;
  raise notice 'Activity V2 SQL 23 helper source SHA-256: %', v_hash;

  if (select pg_catalog.count(*) from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = any (array[
        'activity_v2_list_sessions', 'activity_v2_session_detail',
        'activity_v2_replace_session', 'activity_v2_delete_session'
      ]::text[])) <> 4 then
    raise exception 'Activity V2 SQL 23 public RPC overload postcondition failed';
  end if;

  if (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
        pg_catalog.pg_get_functiondef(
          'public.activity_v2_commit_session(uuid,jsonb)'::pg_catalog.regprocedure
        ), 'UTF8')), 'hex')) <>
       '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e' then
    raise exception 'Activity V2 SQL 23 changed the R8 commit source';
  end if;
end;
$post$;

commit;

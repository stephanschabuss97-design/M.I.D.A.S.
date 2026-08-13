-- MIDAS Activity V2 R9 deployment rollback.
--
-- This rollback is permitted only before any real R9 correction or deletion.
-- It cannot restore a hard-deleted session. The caller must provide a positive
-- operative non-use confirmation in this same database session:
--
--   select set_config(
--     'midas.activity_v2_r9_operational_nonuse_confirmed', 'true', false
--   );
--
-- revision=1 is only a technical preflight and is never sufficient evidence:
-- a replay leaves revision unchanged and a hard delete leaves no audit row.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';
set local search_path = '';

do $guard$
declare
  v_oid oid;
  v_name text;
  v_hash text;
  v_expected_hash text;
  v_expected_security boolean;
  v_expected_volatility "char";
  v_acl jsonb;
begin
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity V2 SQL 23 rollback requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity V2 SQL 23 rollback requires postgres session and current user';
  end if;
  if coalesce(
       pg_catalog.current_setting(
         'midas.activity_v2_r9_operational_nonuse_confirmed', true
       ),
       ''
     ) <> 'true' then
    raise exception 'Activity V2 SQL 23 rollback requires positive operative non-use confirmation';
  end if;
  if pg_catalog.to_regprocedure('extensions.digest(bytea,text)') is null
     or (select pg_catalog.count(*)
           from pg_catalog.pg_class c
           join pg_catalog.pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public'
            and c.relname = any (array[
              'health_activity_catalog_entries', 'health_activity_sessions',
              'health_activity_session_items', 'health_activity_item_sets'
            ]::text[])
            and c.relkind = 'r') <> 4 then
    raise exception 'Activity V2 SQL 23 rollback relation/extension drift';
  end if;
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
  ) then
    raise exception 'Activity V2 SQL 23 rollback revision preimage drift';
  end if;

  if (select pg_catalog.count(*)
        from pg_catalog.pg_proc p
        join pg_catalog.pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
         and p.proname = any (array[
           'activity_v2_list_sessions', 'activity_v2_session_detail',
           'activity_v2_replace_session', 'activity_v2_delete_session'
         ]::text[])) <> 4
     or pg_catalog.to_regprocedure(
          'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)'
        ) is null then
    raise exception 'Activity V2 SQL 23 rollback function/overload preimage drift';
  end if;

  for v_name, v_oid, v_expected_hash, v_expected_security, v_expected_volatility in
    select * from (values
      ('helper', 'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)'::pg_catalog.regprocedure::oid,
       '7fe25b2b010faf95615907d700091579565b39088adcd44d0bd0484333f30f5e', false, 'i'::"char"),
      ('list', 'public.activity_v2_list_sessions(integer,timestamp with time zone,uuid)'::pg_catalog.regprocedure::oid,
       'aeca949ea42b53ec3b7ead67668be4b3c6b70553d538068c01f93157ad0de8ed', false, 's'::"char"),
      ('detail', 'public.activity_v2_session_detail(uuid)'::pg_catalog.regprocedure::oid,
       '53938011daac6fe80e68a9c3464604b69f396a4d5f5ff4d274cfbcca925cbb11', false, 's'::"char"),
      ('replace', 'public.activity_v2_replace_session(uuid,bigint,text,jsonb)'::pg_catalog.regprocedure::oid,
       'feb73a16ccc2680f8ddb368ffbabd1c4cb41320838af9d6040b6c6d2a7cf1f7f', true, 'v'::"char"),
      ('delete', 'public.activity_v2_delete_session(uuid,bigint,text)'::pg_catalog.regprocedure::oid,
       '97474cc440ca538abd0fa6f444bb2bb69fd801f2080c28e5d81599484477f54b', true, 'v'::"char")
    ) x(name, oid, expected_hash, security, volatility)
  loop
    select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      pg_catalog.pg_get_functiondef(v_oid), 'UTF8')), 'hex') into v_hash;
    if v_hash <> v_expected_hash or not exists (
      select 1 from pg_catalog.pg_proc p join pg_catalog.pg_roles r on r.oid = p.proowner
       where p.oid = v_oid and r.rolname = 'postgres'
         and p.prokind = 'f' and p.prorettype = 'jsonb'::pg_catalog.regtype
         and p.prosecdef = v_expected_security
         and p.provolatile = v_expected_volatility
         and p.proconfig = array['search_path=""']::text[]
    ) then
      raise exception 'Activity V2 SQL 23 rollback % source/hardening drift', v_name;
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
      raise exception 'Activity V2 SQL 23 rollback % ACL drift', v_name;
    end if;
  end loop;

  if (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
        pg_catalog.pg_get_functiondef(
          'public.activity_v2_commit_session(uuid,jsonb)'::pg_catalog.regprocedure
        ), 'UTF8')), 'hex')) <>
       '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e' then
    raise exception 'Activity V2 SQL 23 rollback R8 commit source drift';
  end if;
  if (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
        pg_catalog.pg_get_functiondef(
          'public.activity_v2_last_performance(text)'::pg_catalog.regprocedure
        ), 'UTF8')), 'hex')) <>
       '36958865e48db7f6ca13a7ad36d0d8751f53729c5d40c762654ab2baa73d296e'
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
    raise exception 'Activity V2 SQL 23 rollback R8 lookup/catalog drift';
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
    raise exception 'Activity V2 SQL 23 rollback private-schema ACL drift';
  end if;
  if exists (
    select 1 from public.health_activity_sessions
     where revision <> 1 or updated_at <> created_at
  ) then
    raise exception 'Activity V2 SQL 23 rollback technical lifecycle-use evidence detected';
  end if;
  if exists (
    select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'midas_private'
  ) or (select pg_catalog.count(*)
          from pg_catalog.pg_proc p
          join pg_catalog.pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'midas_private') <> 1 then
    raise exception 'Activity V2 SQL 23 rollback private-schema drift';
  end if;
end;
$guard$;

lock table public.health_activity_catalog_entries,
  public.health_activity_sessions,
  public.health_activity_session_items,
  public.health_activity_item_sets in share mode;

create temporary table midas_activity_v2_sql23_rollback_preimage
on commit drop
as
select
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) - 'revision' order by s.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_sessions s) as sessions_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_session_items i) as items_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_item_sets st) as sets_sha256;

drop function public.activity_v2_delete_session(uuid, bigint, text);
drop function public.activity_v2_replace_session(uuid, bigint, text, jsonb);
drop function public.activity_v2_session_detail(uuid);
drop function public.activity_v2_list_sessions(integer, timestamptz, uuid);
drop function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb);
drop schema midas_private;

alter table public.health_activity_sessions
  drop constraint health_activity_sessions_revision_check;
alter table public.health_activity_sessions
  drop column revision;

do $post$
begin
  if pg_catalog.to_regnamespace('midas_private') is not null
     or exists (
       select 1 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = any (array[
          'activity_v2_list_sessions', 'activity_v2_session_detail',
          'activity_v2_replace_session', 'activity_v2_delete_session'
        ]::text[])
     )
     or exists (
       select 1 from pg_catalog.pg_attribute a
        where a.attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
          and a.attname = 'revision' and a.attnum > 0 and not a.attisdropped
     )
     or (select sessions_sha256 from midas_activity_v2_sql23_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_sessions s)
     or (select items_sha256 from midas_activity_v2_sql23_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_session_items i)
     or (select sets_sha256 from midas_activity_v2_sql23_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_item_sets st) then
    raise exception 'Activity V2 SQL 23 rollback postcondition failed';
  end if;
  if (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
        pg_catalog.pg_get_functiondef(
          'public.activity_v2_commit_session(uuid,jsonb)'::pg_catalog.regprocedure
        ), 'UTF8')), 'hex')) <>
       '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e' then
    raise exception 'Activity V2 SQL 23 rollback changed the R8 commit source';
  end if;
end;
$post$;

commit;

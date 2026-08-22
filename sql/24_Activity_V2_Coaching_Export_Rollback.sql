-- MIDAS Activity V2 R10 deployment rollback.
--
-- This rollback removes only the exactly recognized coaching-export function.
-- It never changes Activity V2 tables or data and rejects a second rollback,
-- overloads, source drift, hardening drift, and ACL drift.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';
set local search_path = '';

do $guard$
declare
  v_oid oid := pg_catalog.to_regprocedure(
    'public.activity_v2_coaching_export(date,date)'
  );
  v_acl jsonb;
  v_source_sha256 text;
begin
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity V2 SQL 24 rollback requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity V2 SQL 24 rollback requires postgres session and current user';
  end if;
  if v_oid is null
     or (select pg_catalog.count(*)
           from pg_catalog.pg_proc p
           join pg_catalog.pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public'
            and p.proname = 'activity_v2_coaching_export') <> 1 then
    raise exception 'Activity V2 SQL 24 rollback function/overload preimage drift';
  end if;
  select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
           pg_catalog.pg_get_functiondef(v_oid), 'UTF8')), 'hex')
    into strict v_source_sha256;
  if v_source_sha256 <> 'ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376'
     or not exists (
       select 1
         from pg_catalog.pg_proc p
         join pg_catalog.pg_roles r on r.oid = p.proowner
        where p.oid = v_oid
          and r.rolname = 'postgres'
          and p.prokind = 'f'
          and p.prorettype = 'jsonb'::pg_catalog.regtype
          and not p.prosecdef
          and p.provolatile = 's'
          and p.proconfig = array['search_path=""']::text[]
     ) then
    raise exception 'Activity V2 SQL 24 rollback source/hardening drift';
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
    raise exception 'Activity V2 SQL 24 rollback ACL drift';
  end if;
end;
$guard$;

lock table public.health_activity_sessions,
  public.health_activity_session_items,
  public.health_activity_item_sets in share mode;

create temporary table midas_activity_v2_sql24_rollback_preimage
on commit drop
as
select
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_sessions s) as sessions_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_session_items i) as items_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_item_sets st) as sets_sha256;

drop function public.activity_v2_coaching_export(date, date);

do $post$
begin
  if pg_catalog.to_regprocedure(
       'public.activity_v2_coaching_export(date,date)'
     ) is not null
     or exists (
       select 1
         from pg_catalog.pg_proc p
         join pg_catalog.pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
          and p.proname = 'activity_v2_coaching_export'
     )
     or (select sessions_sha256 from midas_activity_v2_sql24_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_sessions s)
     or (select items_sha256 from midas_activity_v2_sql24_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_session_items i)
     or (select sets_sha256 from midas_activity_v2_sql24_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_item_sets st) then
    raise exception 'Activity V2 SQL 24 rollback postcondition failed';
  end if;
end;
$post$;

commit;

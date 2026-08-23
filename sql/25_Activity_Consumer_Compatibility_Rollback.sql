-- MIDAS Activity V2 R11 SQL 25 rollback.
--
-- This rollback removes only the exactly recognized consumer function. It
-- rejects source, overload, hardening, ACL and dependency drift and never
-- changes Activity or report data.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';
set local search_path = '';

lock table public.health_events,
  public.health_activity_sessions,
  public.health_activity_session_items,
  public.v_events_activity in share mode;

do $guard$
declare
  v_oid oid := pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot(date,date)'
  );
  v_acl jsonb;
  v_owner oid := pg_catalog.to_regrole('postgres');
  v_authenticated oid := pg_catalog.to_regrole('authenticated');
  v_service_role oid := pg_catalog.to_regrole('service_role');
begin
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity consumer SQL 25 rollback requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity consumer SQL 25 rollback requires postgres session and current user';
  end if;
  if v_owner is null or v_authenticated is null or v_service_role is null
     or pg_catalog.to_regrole('anon') is null then
    raise exception 'Activity consumer SQL 25 rollback role preimage drift';
  end if;
  if v_oid is null
     or (select pg_catalog.count(*)
           from pg_catalog.pg_proc p
           join pg_catalog.pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public'
            and p.proname = 'activity_consumer_snapshot') <> 1 then
    raise exception 'Activity consumer SQL 25 rollback function/overload preimage drift';
  end if;
  if pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
       pg_catalog.pg_get_functiondef(v_oid), 'UTF8')), 'hex') <>
       'f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d'
     or not exists (
       select 1
         from pg_catalog.pg_proc p
         join pg_catalog.pg_roles r on r.oid = p.proowner
        where p.oid = v_oid
          and r.rolname = 'postgres'
          and p.prokind = 'f'
          and p.prorettype = 'jsonb'::pg_catalog.regtype
          and p.provolatile = 's'
          and not p.prosecdef
          and p.proconfig = array['search_path=""']::text[]
     ) then
    raise exception 'Activity consumer SQL 25 rollback source/hardening drift';
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
  if v_acl <> '[["authenticated","postgres","EXECUTE",false],["postgres","postgres","EXECUTE",false]]'::jsonb
     or pg_catalog.has_function_privilege(
       'anon', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE'
     ) then
    raise exception 'Activity consumer SQL 25 rollback ACL drift';
  end if;

  if (select pg_catalog.count(*)
        from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and ((c.relname in (
                'health_events', 'health_activity_sessions',
                'health_activity_session_items'
              ) and c.relkind = 'r')
           or (c.relname = 'v_events_activity' and c.relkind = 'v'))) <> 4
     or exists (
       select 1 from (values
         ('health_events'),('health_activity_sessions'),
         ('health_activity_session_items')
       ) expected(relname)
       where not exists (
         select 1 from pg_catalog.pg_class c
         join pg_catalog.pg_namespace n on n.oid=c.relnamespace
         where n.nspname='public' and c.relname=expected.relname
           and c.relowner=v_owner and c.relrowsecurity and not c.relforcerowsecurity
       )
     ) then
    raise exception 'Activity consumer SQL 25 rollback relation/RLS drift';
  end if;

  if (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
           a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod),
           a.attnotnull, a.attgenerated) order by a.attnum)
        from pg_catalog.pg_attribute a
       where a.attrelid = 'public.health_events'::pg_catalog.regclass
         and a.attnum > 0 and not a.attisdropped) <>
       '[["id","uuid",true,""],["user_id","uuid",true,""],["ts","timestamp with time zone",true,""],["day","date",false,"s"],["type","text",true,""],["ctx","text",false,""],["payload","jsonb",true,""],["created_at","timestamp with time zone",true,""]]'::jsonb
     or (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
           a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod),
           a.attnotnull, a.attgenerated) order by a.attnum)
          from pg_catalog.pg_attribute a
         where a.attrelid = 'public.health_activity_sessions'::pg_catalog.regclass
           and a.attnum > 0 and not a.attisdropped) <>
       '[["id","uuid",true,""],["user_id","uuid",true,""],["request_id","uuid",true,""],["request_fingerprint","text",true,""],["started_at","timestamp with time zone",true,""],["ended_at","timestamp with time zone",true,""],["duration_min","integer",true,""],["day","date",false,"s"],["title","text",false,""],["note","text",false,""],["created_at","timestamp with time zone",true,""],["updated_at","timestamp with time zone",true,""],["revision","bigint",true,""]]'::jsonb
     or (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
           a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod),
           a.attnotnull, a.attgenerated) order by a.attnum)
          from pg_catalog.pg_attribute a
         where a.attrelid = 'public.health_activity_session_items'::pg_catalog.regclass
           and a.attnum > 0 and not a.attisdropped) <>
       '[["id","uuid",true,""],["user_id","uuid",true,""],["session_id","uuid",true,""],["catalog_version","integer",true,""],["item_key","text",true,""],["item_order","smallint",true,""],["item_label_snapshot","text",true,""],["tracking_mode_snapshot","text",true,""],["equipment_snapshot","text",true,""],["load_comparability_snapshot","text",true,""],["field_policy_snapshot","jsonb",true,""],["duration_min","integer",false,""],["distance_km","numeric(6,2)",false,""],["note","text",false,""],["created_at","timestamp with time zone",true,""]]'::jsonb
     or (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
           a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod),
           a.attnotnull, a.attgenerated) order by a.attnum)
          from pg_catalog.pg_attribute a
         where a.attrelid = 'public.v_events_activity'::pg_catalog.regclass
           and a.attnum > 0 and not a.attisdropped) <>
       '[["id","uuid",false,""],["user_id","uuid",false,""],["ts","timestamp with time zone",false,""],["day","date",false,""],["activity","text",false,""],["duration_min","integer",false,""],["note","text",false,""]]'::jsonb then
    raise exception 'Activity consumer SQL 25 rollback column drift';
  end if;

  if pg_catalog.pg_get_expr(
       (select d.adbin from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a
         on a.attrelid=d.adrelid and a.attnum=d.adnum
        where d.adrelid='public.health_events'::pg_catalog.regclass and a.attname='day'),
       'public.health_events'::pg_catalog.regclass) <>
       '((ts AT TIME ZONE ''Europe/Vienna''::text))::date'
     or pg_catalog.pg_get_expr(
       (select d.adbin from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a
         on a.attrelid=d.adrelid and a.attnum=d.adnum
        where d.adrelid='public.health_activity_sessions'::pg_catalog.regclass and a.attname='day'),
       'public.health_activity_sessions'::pg_catalog.regclass) <>
       '(timezone(''Europe/Vienna''::text, started_at))::date'
     or not exists (
       select 1 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
       where n.nspname='public' and c.relname='v_events_activity'
         and c.relowner=v_owner and c.reloptions=array['security_invoker=on']::text[])
     or pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
       pg_catalog.pg_get_viewdef('public.v_events_activity'::pg_catalog.regclass,true),
       'UTF8')), 'hex') <>
       'ad86c792117188c630eb162366f3447c3a895a1e8725809215454c20938889df' then
    raise exception 'Activity consumer SQL 25 rollback dependency source drift';
  end if;

  if not exists (
       select 1 from pg_catalog.pg_policy p
       where p.polrelid='public.health_events'::pg_catalog.regclass
         and p.polname='events_select_own' and p.polpermissive and p.polcmd='r'
         and p.polroles=array[0::oid]
         and pg_catalog.pg_get_expr(p.polqual,p.polrelid)=
           '(( SELECT auth.uid() AS uid) = user_id)')
     or not exists (
       select 1 from pg_catalog.pg_policy p
       where p.polrelid='public.health_activity_sessions'::pg_catalog.regclass
         and p.polname='health_activity_sessions_select_own'
         and p.polpermissive and p.polcmd='r' and p.polroles=array[v_authenticated]
         and pg_catalog.pg_get_expr(p.polqual,p.polrelid)=
           '((( SELECT auth.uid() AS uid) = user_id) AND (((( SELECT auth.jwt() AS jwt) ->> ''is_anonymous''::text))::boolean IS FALSE))')
     or not exists (
       select 1 from pg_catalog.pg_policy p
       where p.polrelid='public.health_activity_session_items'::pg_catalog.regclass
         and p.polname='health_activity_session_items_select_own'
         and p.polpermissive and p.polcmd='r' and p.polroles=array[v_authenticated]
         and pg_catalog.pg_get_expr(p.polqual,p.polrelid)=
           '((( SELECT auth.uid() AS uid) = user_id) AND (((( SELECT auth.jwt() AS jwt) ->> ''is_anonymous''::text))::boolean IS FALSE))')
     or (select pg_catalog.count(*) from pg_catalog.pg_policy p
         where p.polrelid in (
           'public.health_events'::pg_catalog.regclass,
           'public.health_activity_sessions'::pg_catalog.regclass,
           'public.health_activity_session_items'::pg_catalog.regclass)
           and p.polcmd in ('r','*')) <> 3 then
    raise exception 'Activity consumer SQL 25 rollback policy drift';
  end if;

  if not pg_catalog.has_table_privilege('authenticated','public.health_events','SELECT')
     or not pg_catalog.has_table_privilege('service_role','public.health_events','SELECT')
     or not pg_catalog.has_table_privilege('authenticated','public.health_activity_sessions','SELECT')
     or not pg_catalog.has_table_privilege('service_role','public.health_activity_sessions','SELECT')
     or not pg_catalog.has_table_privilege('authenticated','public.health_activity_session_items','SELECT')
     or not pg_catalog.has_table_privilege('service_role','public.health_activity_session_items','SELECT')
     or not pg_catalog.has_table_privilege('authenticated','public.v_events_activity','SELECT')
     or not pg_catalog.has_table_privilege('service_role','public.v_events_activity','SELECT')
     or pg_catalog.has_table_privilege('anon','public.health_events','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('anon','public.health_activity_sessions','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('anon','public.health_activity_session_items','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('anon','public.v_events_activity','SELECT')
     or pg_catalog.has_table_privilege('authenticated','public.health_activity_sessions','INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('service_role','public.health_activity_sessions','INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('authenticated','public.health_activity_session_items','INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('service_role','public.health_activity_session_items','INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or exists (
       select 1 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
       cross join lateral pg_catalog.aclexplode(coalesce(c.relacl,
         pg_catalog.acldefault(case when c.relkind='v' then 'r'::"char" else c.relkind end,c.relowner))) acl
       where n.nspname='public' and c.relname in (
         'health_events','health_activity_sessions',
         'health_activity_session_items','v_events_activity')
         and (acl.grantor<>v_owner
           or acl.grantee not in (v_owner,v_authenticated,v_service_role)
           or (acl.grantee<>v_owner and acl.is_grantable)
           or (acl.grantee in (v_authenticated,v_service_role) and (
             (c.relname='health_events' and acl.privilege_type not in ('SELECT','INSERT','UPDATE','DELETE'))
             or (c.relname<>'health_events' and acl.privilege_type<>'SELECT'))))
     ) then
    raise exception 'Activity consumer SQL 25 rollback relation ACL drift';
  end if;
end;
$guard$;

create temporary table midas_activity_consumer_sql25_rollback_preimage
on commit drop
as
select
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id),'[]'::jsonb)::text,
      'UTF8')),'hex') from public.health_events e where e.type='activity_event') as v1_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id),'[]'::jsonb)::text,
      'UTF8')),'hex') from public.health_activity_sessions s) as sessions_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id),'[]'::jsonb)::text,
      'UTF8')),'hex') from public.health_activity_session_items i) as items_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.jsonb_build_object(
      'relations',(select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,c.relkind,c.relowner,c.relrowsecurity,c.relforcerowsecurity,c.reloptions)
        order by c.relname) from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions','health_activity_session_items','v_events_activity')),
      'columns',(select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,a.attnum,a.attname,a.atttypid,a.atttypmod,a.attnotnull,a.attgenerated,
        pg_catalog.pg_get_expr(d.adbin,d.adrelid)) order by c.relname,a.attnum)
        from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        join pg_catalog.pg_attribute a on a.attrelid=c.oid
        left join pg_catalog.pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions','health_activity_session_items','v_events_activity')
          and a.attnum>0 and not a.attisdropped),
      'policies',(select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,p.polname,p.polcmd,p.polpermissive,p.polroles,
        pg_catalog.pg_get_expr(p.polqual,p.polrelid),pg_catalog.pg_get_expr(p.polwithcheck,p.polrelid))
        order by c.relname,p.polname) from pg_catalog.pg_policy p
        join pg_catalog.pg_class c on c.oid=p.polrelid join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions','health_activity_session_items')),
      'acls',(select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,acl.grantor,acl.grantee,acl.privilege_type,acl.is_grantable)
        order by c.relname,acl.grantee,acl.privilege_type) from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        cross join lateral pg_catalog.aclexplode(coalesce(c.relacl,
          pg_catalog.acldefault(case when c.relkind='v' then 'r'::"char" else c.relkind end,c.relowner))) acl
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions','health_activity_session_items','v_events_activity')),
      'viewdef',pg_catalog.pg_get_viewdef('public.v_events_activity'::pg_catalog.regclass,true)
    )::text,'UTF8')),'hex')) as dependency_sha256;

drop function public.activity_consumer_snapshot(date, date);

do $post$
declare
  v_dependency_sha256 text;
begin
  if pg_catalog.to_regprocedure('public.activity_consumer_snapshot(date,date)') is not null
     or exists (
       select 1 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname='activity_consumer_snapshot') then
    raise exception 'Activity consumer SQL 25 rollback function postcondition failed';
  end if;

  select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.jsonb_build_object(
      'relations',(select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,c.relkind,c.relowner,c.relrowsecurity,c.relforcerowsecurity,c.reloptions)
        order by c.relname) from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions','health_activity_session_items','v_events_activity')),
      'columns',(select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,a.attnum,a.attname,a.atttypid,a.atttypmod,a.attnotnull,a.attgenerated,
        pg_catalog.pg_get_expr(d.adbin,d.adrelid)) order by c.relname,a.attnum)
        from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        join pg_catalog.pg_attribute a on a.attrelid=c.oid
        left join pg_catalog.pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions','health_activity_session_items','v_events_activity')
          and a.attnum>0 and not a.attisdropped),
      'policies',(select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,p.polname,p.polcmd,p.polpermissive,p.polroles,
        pg_catalog.pg_get_expr(p.polqual,p.polrelid),pg_catalog.pg_get_expr(p.polwithcheck,p.polrelid))
        order by c.relname,p.polname) from pg_catalog.pg_policy p
        join pg_catalog.pg_class c on c.oid=p.polrelid join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions','health_activity_session_items')),
      'acls',(select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,acl.grantor,acl.grantee,acl.privilege_type,acl.is_grantable)
        order by c.relname,acl.grantee,acl.privilege_type) from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        cross join lateral pg_catalog.aclexplode(coalesce(c.relacl,
          pg_catalog.acldefault(case when c.relkind='v' then 'r'::"char" else c.relkind end,c.relowner))) acl
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions','health_activity_session_items','v_events_activity')),
      'viewdef',pg_catalog.pg_get_viewdef('public.v_events_activity'::pg_catalog.regclass,true)
    )::text,'UTF8')),'hex') into strict v_dependency_sha256;

  if (select v1_sha256 from midas_activity_consumer_sql25_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id),'[]'::jsonb)::text,
          'UTF8')),'hex') from public.health_events e where e.type='activity_event')
     or (select sessions_sha256 from midas_activity_consumer_sql25_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id),'[]'::jsonb)::text,
          'UTF8')),'hex') from public.health_activity_sessions s)
     or (select items_sha256 from midas_activity_consumer_sql25_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id),'[]'::jsonb)::text,
          'UTF8')),'hex') from public.health_activity_session_items i)
     or (select dependency_sha256 from midas_activity_consumer_sql25_rollback_preimage) <>
        v_dependency_sha256 then
    raise exception 'Activity consumer SQL 25 rollback changed protected data or dependencies';
  end if;
end;
$post$;

commit;

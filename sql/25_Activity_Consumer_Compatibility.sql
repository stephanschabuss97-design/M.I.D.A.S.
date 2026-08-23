-- MIDAS Activity V2 R11: shared V1/V2 activity consumer snapshot.
--
-- This additive source creates exactly one read-only, owner-scoped function.
-- It accepts only the verified Activity V1/V2 dependency contract or its own
-- exact rerun postimage and never changes Activity or report data.

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
  v_oid oid;
  v_count integer;
  v_acl jsonb;
  v_owner oid := pg_catalog.to_regrole('postgres');
  v_authenticated oid := pg_catalog.to_regrole('authenticated');
  v_service_role oid := pg_catalog.to_regrole('service_role');
begin
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity consumer SQL 25 requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity consumer SQL 25 requires postgres session and current user';
  end if;
  if v_owner is null
     or v_authenticated is null
     or pg_catalog.to_regrole('anon') is null
     or v_service_role is null then
    raise exception 'Activity consumer SQL 25 API role preimage drift detected';
  end if;

  if (select pg_catalog.count(*)
        from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and ((c.relname in (
                'health_events', 'health_activity_sessions',
                'health_activity_session_items'
              ) and c.relkind = 'r')
           or (c.relname = 'v_events_activity' and c.relkind = 'v'))) <> 4 then
    raise exception 'Activity consumer SQL 25 relation preimage drift detected';
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
    raise exception 'Activity consumer SQL 25 column preimage drift detected';
  end if;

  if pg_catalog.pg_get_expr(
       (select d.adbin from pg_catalog.pg_attrdef d
         join pg_catalog.pg_attribute a
           on a.attrelid = d.adrelid and a.attnum = d.adnum
        where d.adrelid = 'public.health_events'::pg_catalog.regclass
          and a.attname = 'day'),
       'public.health_events'::pg_catalog.regclass
     ) <> '((ts AT TIME ZONE ''Europe/Vienna''::text))::date'
     or pg_catalog.pg_get_expr(
       (select d.adbin from pg_catalog.pg_attrdef d
         join pg_catalog.pg_attribute a
           on a.attrelid = d.adrelid and a.attnum = d.adnum
        where d.adrelid = 'public.health_activity_sessions'::pg_catalog.regclass
          and a.attname = 'day'),
       'public.health_activity_sessions'::pg_catalog.regclass
     ) <> '(timezone(''Europe/Vienna''::text, started_at))::date' then
    raise exception 'Activity consumer SQL 25 Vienna-day preimage drift detected';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'v_events_activity'
       and c.relowner = v_owner
       and c.reloptions = array['security_invoker=on']::text[]
  ) or pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
         pg_catalog.pg_get_viewdef('public.v_events_activity'::pg_catalog.regclass, true),
         'UTF8')), 'hex') <>
       'ad86c792117188c630eb162366f3447c3a895a1e8725809215454c20938889df' then
    raise exception 'Activity consumer SQL 25 V1 view preimage drift detected';
  end if;

  if exists (
    select 1
      from (values
        ('health_events'),
        ('health_activity_sessions'),
        ('health_activity_session_items')
      ) expected(relname)
     where not exists (
       select 1
         from pg_catalog.pg_class c
         join pg_catalog.pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = expected.relname
          and c.relowner = v_owner
          and c.relrowsecurity
          and not c.relforcerowsecurity
     )
  ) then
    raise exception 'Activity consumer SQL 25 table owner/RLS preimage drift detected';
  end if;

  if not exists (
       select 1 from pg_catalog.pg_policy p
        where p.polrelid = 'public.health_events'::pg_catalog.regclass
          and p.polname = 'events_select_own'
          and p.polpermissive and p.polcmd = 'r' and p.polroles = array[0::oid]
          and pg_catalog.pg_get_expr(p.polqual, p.polrelid) =
            '(( SELECT auth.uid() AS uid) = user_id)'
     )
     or not exists (
       select 1 from pg_catalog.pg_policy p
        where p.polrelid = 'public.health_activity_sessions'::pg_catalog.regclass
          and p.polname = 'health_activity_sessions_select_own'
          and p.polpermissive and p.polcmd = 'r'
          and p.polroles = array[v_authenticated]
          and pg_catalog.pg_get_expr(p.polqual, p.polrelid) =
            '((( SELECT auth.uid() AS uid) = user_id) AND (((( SELECT auth.jwt() AS jwt) ->> ''is_anonymous''::text))::boolean IS FALSE))'
     )
     or not exists (
       select 1 from pg_catalog.pg_policy p
        where p.polrelid = 'public.health_activity_session_items'::pg_catalog.regclass
          and p.polname = 'health_activity_session_items_select_own'
          and p.polpermissive and p.polcmd = 'r'
          and p.polroles = array[v_authenticated]
          and pg_catalog.pg_get_expr(p.polqual, p.polrelid) =
            '((( SELECT auth.uid() AS uid) = user_id) AND (((( SELECT auth.jwt() AS jwt) ->> ''is_anonymous''::text))::boolean IS FALSE))'
     )
     or (select pg_catalog.count(*) from pg_catalog.pg_policy p
          where p.polrelid in (
            'public.health_events'::pg_catalog.regclass,
            'public.health_activity_sessions'::pg_catalog.regclass,
            'public.health_activity_session_items'::pg_catalog.regclass
          ) and p.polcmd in ('r', '*')) <> 3 then
    raise exception 'Activity consumer SQL 25 read-policy preimage drift detected';
  end if;

  if not pg_catalog.has_table_privilege('authenticated', 'public.health_events', 'SELECT')
     or not pg_catalog.has_table_privilege('service_role', 'public.health_events', 'SELECT')
     or not pg_catalog.has_table_privilege('authenticated', 'public.health_activity_sessions', 'SELECT')
     or not pg_catalog.has_table_privilege('service_role', 'public.health_activity_sessions', 'SELECT')
     or not pg_catalog.has_table_privilege('authenticated', 'public.health_activity_session_items', 'SELECT')
     or not pg_catalog.has_table_privilege('service_role', 'public.health_activity_session_items', 'SELECT')
     or not pg_catalog.has_table_privilege('authenticated', 'public.v_events_activity', 'SELECT')
     or not pg_catalog.has_table_privilege('service_role', 'public.v_events_activity', 'SELECT')
     or pg_catalog.has_table_privilege('anon', 'public.health_events', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('anon', 'public.health_activity_sessions', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('anon', 'public.health_activity_session_items', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('anon', 'public.v_events_activity', 'SELECT')
     or pg_catalog.has_table_privilege('authenticated', 'public.health_activity_sessions', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('service_role', 'public.health_activity_sessions', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('authenticated', 'public.health_activity_session_items', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or pg_catalog.has_table_privilege('service_role', 'public.health_activity_session_items', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     or exists (
       select 1
         from pg_catalog.pg_class c
         join pg_catalog.pg_namespace n on n.oid = c.relnamespace
         cross join lateral pg_catalog.aclexplode(
           coalesce(c.relacl, pg_catalog.acldefault(
             case when c.relkind = 'v' then 'r'::"char" else c.relkind end,
             c.relowner
           ))
         ) acl
        where n.nspname = 'public'
          and c.relname in (
            'health_events', 'health_activity_sessions',
            'health_activity_session_items', 'v_events_activity'
          )
          and (
            acl.grantor <> v_owner
            or acl.grantee not in (v_owner, v_authenticated, v_service_role)
            or (acl.grantee <> v_owner and acl.is_grantable)
            or (acl.grantee in (v_authenticated, v_service_role) and (
              (c.relname = 'health_events' and acl.privilege_type not in (
                'SELECT', 'INSERT', 'UPDATE', 'DELETE'
              ))
              or (c.relname <> 'health_events' and acl.privilege_type <> 'SELECT')
            ))
          )
     ) then
    raise exception 'Activity consumer SQL 25 relation ACL preimage drift detected';
  end if;

  select pg_catalog.count(*) into v_count
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'activity_consumer_snapshot';
  v_oid := pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot(date,date)'
  );
  if v_count = 0 then
    if v_oid is not null then
      raise exception 'Activity consumer SQL 25 fresh preimage drift detected';
    end if;
  elsif v_count = 1 and v_oid is not null then
    if pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
         pg_catalog.pg_get_functiondef(v_oid), 'UTF8')), 'hex') <>
       'f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d' then
      raise exception 'Activity consumer SQL 25 rerun source drift detected';
    end if;
    if not exists (
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
      raise exception 'Activity consumer SQL 25 rerun hardening drift detected';
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
      raise exception 'Activity consumer SQL 25 rerun ACL drift detected';
    end if;
  else
    raise exception 'Activity consumer SQL 25 overload/partial preimage drift detected';
  end if;
end;
$guard$;

create temporary table midas_activity_consumer_sql25_preimage
on commit drop
as
select
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_events e
       where e.type = 'activity_event') as v1_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_sessions s) as sessions_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_session_items i) as items_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      pg_catalog.jsonb_build_object(
        'relations', (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
          c.relname, c.relkind, c.relowner, c.relrowsecurity,
          c.relforcerowsecurity, c.reloptions) order by c.relname)
          from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
          where n.nspname='public' and c.relname in (
            'health_events','health_activity_sessions',
            'health_activity_session_items','v_events_activity')),
        'columns', (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
          c.relname, a.attnum, a.attname, a.atttypid, a.atttypmod,
          a.attnotnull, a.attgenerated,
          pg_catalog.pg_get_expr(d.adbin, d.adrelid))
          order by c.relname, a.attnum)
          from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
          join pg_catalog.pg_attribute a on a.attrelid=c.oid
          left join pg_catalog.pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
          where n.nspname='public' and c.relname in (
            'health_events','health_activity_sessions',
            'health_activity_session_items','v_events_activity')
            and a.attnum > 0 and not a.attisdropped),
        'policies', (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
          c.relname, p.polname, p.polcmd, p.polpermissive, p.polroles,
          pg_catalog.pg_get_expr(p.polqual,p.polrelid),
          pg_catalog.pg_get_expr(p.polwithcheck,p.polrelid))
          order by c.relname,p.polname)
          from pg_catalog.pg_policy p join pg_catalog.pg_class c on c.oid=p.polrelid
          join pg_catalog.pg_namespace n on n.oid=c.relnamespace
          where n.nspname='public' and c.relname in (
            'health_events','health_activity_sessions','health_activity_session_items')),
        'acls', (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
          c.relname, acl.grantor, acl.grantee, acl.privilege_type, acl.is_grantable)
          order by c.relname,acl.grantee,acl.privilege_type)
          from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
          cross join lateral pg_catalog.aclexplode(
            coalesce(c.relacl,pg_catalog.acldefault(
              case when c.relkind='v' then 'r'::"char" else c.relkind end,c.relowner))) acl
          where n.nspname='public' and c.relname in (
            'health_events','health_activity_sessions',
            'health_activity_session_items','v_events_activity')),
        'viewdef', pg_catalog.pg_get_viewdef(
          'public.v_events_activity'::pg_catalog.regclass,true)
      )::text, 'UTF8')), 'hex')) as dependency_sha256;

create or replace function public.activity_consumer_snapshot(
  p_from date,
  p_to date
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $function$
declare
  v_user uuid;
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_today date;
  v_from_at timestamptz;
  v_until_at timestamptz;
  v_v2_count bigint;
  v_result jsonb;
begin
  v_user := auth.uid();
  if v_user is null
     or coalesce(auth.jwt() ->> 'is_anonymous', '') <> 'false' then
    raise exception using
      errcode = '42501',
      message = 'MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED';
  end if;

  v_today := pg_catalog.timezone('Europe/Vienna', v_now)::date;
  if p_from is null or p_to is null or p_from > p_to or p_to > v_today then
    raise exception using
      errcode = '22023',
      message = 'MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE';
  end if;
  if (p_to - p_from) > 399 then
    raise exception using
      errcode = '22023',
      message = 'MIDAS_ACTIVITY_CONSUMER_RANGE_TOO_LARGE';
  end if;

  v_from_at := pg_catalog.timezone(
    'Europe/Vienna', p_from::timestamp without time zone
  );
  v_until_at := pg_catalog.timezone(
    'Europe/Vienna', (p_to + 1)::timestamp without time zone
  );

  if exists (
    select 1
      from public.v_events_activity v
     where v.user_id = v_user
       and v.day between p_from and p_to
       and v.ts >= v_from_at
       and v.ts < v_until_at
       and (
         v.activity is null
         or pg_catalog.length(pg_catalog.btrim(v.activity)) < 1
         or pg_catalog.length(v.activity) > 200
         or v.duration_min is null
         or v.duration_min < 1
         or (v.note is not null and (
           pg_catalog.length(v.note) < 1
           or pg_catalog.length(v.note) > 500
         ))
       )
  ) then
    raise exception using
      errcode = '22023',
      message = 'MIDAS_ACTIVITY_CONSUMER_SOURCE_INVALID';
  end if;

  select pg_catalog.count(*)
    into strict v_v2_count
    from public.health_activity_sessions s
   where s.user_id = v_user
     and s.day between p_from and p_to
     and s.started_at >= v_from_at
     and s.started_at < v_until_at;
  if v_v2_count > 1000 then
    raise exception using
      errcode = '54000',
      message = 'MIDAS_ACTIVITY_CONSUMER_LIMIT_EXCEEDED';
  end if;

  if exists (
    select 1
      from public.health_activity_sessions s
      join public.health_activity_session_items i
        on i.session_id = s.id and i.user_id = v_user
     where s.user_id = v_user
       and s.day between p_from and p_to
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
     group by s.id
    having pg_catalog.count(*) > 50
  ) then
    raise exception using
      errcode = '54000',
      message = 'MIDAS_ACTIVITY_CONSUMER_LIMIT_EXCEEDED';
  end if;

  with
  v2_item_counts as (
    select i.session_id, pg_catalog.count(*)::integer as item_count
      from public.health_activity_session_items i
      join public.health_activity_sessions s
        on s.id = i.session_id and s.user_id = v_user
     where i.user_id = v_user
       and s.day between p_from and p_to
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
     group by i.session_id
  ),
  activity_units as (
    select
      'activity_v1'::text as source,
      v.id::text as id,
      v.day,
      v.ts as occurred_at,
      v.activity as label,
      v.duration_min,
      v.note,
      null::integer as item_count
      from public.v_events_activity v
     where v.user_id = v_user
       and v.day between p_from and p_to
       and v.ts >= v_from_at
       and v.ts < v_until_at
    union all
    select
      'activity_v2'::text,
      s.id::text,
      s.day,
      s.started_at,
      coalesce(s.title, 'Training'),
      s.duration_min,
      s.note,
      coalesce(ic.item_count, 0)
      from public.health_activity_sessions s
      left join v2_item_counts ic on ic.session_id = s.id
     where s.user_id = v_user
       and s.day between p_from and p_to
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
  ),
  mixed_days as (
    select u.day
      from activity_units u
     group by u.day
    having pg_catalog.count(distinct u.source) > 1
  ),
  metrics as (
    select
      pg_catalog.count(*)::integer as unit_count,
      pg_catalog.count(distinct u.day)::integer as active_day_count,
      coalesce(pg_catalog.sum(u.duration_min), 0)::integer as total_duration_min,
      case when pg_catalog.count(*) = 0 then null
           else pg_catalog.round(
             pg_catalog.sum(u.duration_min)::numeric / pg_catalog.count(*), 0
           )::integer end as average_duration_min,
      pg_catalog.max(u.day) as last_day
      from activity_units u
  )
  select pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-consumer.v1',
    'timezone', 'Europe/Vienna',
    'range', pg_catalog.jsonb_build_object(
      'from', p_from,
      'to', p_to,
      'inclusive_days', (p_to - p_from) + 1
    ),
    'summary', pg_catalog.jsonb_build_object(
      'unit_count', m.unit_count,
      'active_day_count', m.active_day_count,
      'active_days_per_week', case when m.active_day_count = 0 then 0
        else pg_catalog.round(
          m.active_day_count::numeric * 7 / ((p_to - p_from) + 1), 1
        ) end,
      'total_duration_min', m.total_duration_min,
      'average_duration_min', m.average_duration_min,
      'last_day', m.last_day
    ),
    'quality', pg_catalog.jsonb_build_object(
      'mixed_source_day_count', (select pg_catalog.count(*) from mixed_days),
      'mixed_source_days', coalesce((select pg_catalog.jsonb_agg(md.day order by md.day)
        from mixed_days md), '[]'::jsonb)
    ),
    'units', coalesce((select pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'source', u.source,
        'id', u.id,
        'day', u.day,
        'occurred_at', pg_catalog.to_char(
          pg_catalog.timezone('UTC', u.occurred_at),
          'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ),
        'label', u.label,
        'duration_min', u.duration_min,
        'note', u.note,
        'item_count', u.item_count
      ) order by u.day,
        pg_catalog.to_char(
          pg_catalog.timezone('UTC', u.occurred_at),
          'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ),
        u.source, u.id
    ) from activity_units u), '[]'::jsonb)
  ) into strict v_result
  from metrics m;

  return v_result;
end;
$function$;

alter function public.activity_consumer_snapshot(date, date) owner to postgres;
revoke all on function public.activity_consumer_snapshot(date, date)
  from public, anon, authenticated, service_role;
grant execute on function public.activity_consumer_snapshot(date, date)
  to authenticated;

do $post$
declare
  v_oid oid := pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot(date,date)'
  );
  v_acl jsonb;
  v_dependency_sha256 text;
begin
  if v_oid is null
     or (select pg_catalog.count(*)
           from pg_catalog.pg_proc p
           join pg_catalog.pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public'
            and p.proname = 'activity_consumer_snapshot') <> 1
     or pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(v_oid), 'UTF8')), 'hex') <>
        'f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d'
     or not exists (
       select 1 from pg_catalog.pg_proc p
       join pg_catalog.pg_roles r on r.oid = p.proowner
       where p.oid = v_oid and r.rolname = 'postgres'
         and p.prokind = 'f' and p.prorettype = 'jsonb'::pg_catalog.regtype
         and p.provolatile = 's' and not p.prosecdef
         and p.proconfig = array['search_path=""']::text[]
     ) then
    raise exception 'Activity consumer SQL 25 function postcondition failed';
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
    raise exception 'Activity consumer SQL 25 ACL postcondition failed';
  end if;

  select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.jsonb_build_object(
      'relations', (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,c.relkind,c.relowner,c.relrowsecurity,c.relforcerowsecurity,c.reloptions)
        order by c.relname) from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions',
          'health_activity_session_items','v_events_activity')),
      'columns', (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,a.attnum,a.attname,a.atttypid,a.atttypmod,a.attnotnull,
        a.attgenerated,pg_catalog.pg_get_expr(d.adbin,d.adrelid))
        order by c.relname,a.attnum) from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        join pg_catalog.pg_attribute a on a.attrelid=c.oid
        left join pg_catalog.pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions',
          'health_activity_session_items','v_events_activity')
          and a.attnum>0 and not a.attisdropped),
      'policies', (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,p.polname,p.polcmd,p.polpermissive,p.polroles,
        pg_catalog.pg_get_expr(p.polqual,p.polrelid),
        pg_catalog.pg_get_expr(p.polwithcheck,p.polrelid)) order by c.relname,p.polname)
        from pg_catalog.pg_policy p join pg_catalog.pg_class c on c.oid=p.polrelid
        join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions','health_activity_session_items')),
      'acls', (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_array(
        c.relname,acl.grantor,acl.grantee,acl.privilege_type,acl.is_grantable)
        order by c.relname,acl.grantee,acl.privilege_type)
        from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        cross join lateral pg_catalog.aclexplode(coalesce(c.relacl,
          pg_catalog.acldefault(case when c.relkind='v' then 'r'::"char" else c.relkind end,c.relowner))) acl
        where n.nspname='public' and c.relname in (
          'health_events','health_activity_sessions',
          'health_activity_session_items','v_events_activity')),
      'viewdef', pg_catalog.pg_get_viewdef(
        'public.v_events_activity'::pg_catalog.regclass,true)
    )::text,'UTF8')), 'hex') into strict v_dependency_sha256;

  if (select v1_sha256 from midas_activity_consumer_sql25_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_events e where e.type='activity_event')
     or (select sessions_sha256 from midas_activity_consumer_sql25_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_sessions s)
     or (select items_sha256 from midas_activity_consumer_sql25_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_session_items i)
     or (select dependency_sha256 from midas_activity_consumer_sql25_preimage) <>
        v_dependency_sha256 then
    raise exception 'Activity consumer SQL 25 changed protected data or dependencies';
  end if;
end;
$post$;

commit;

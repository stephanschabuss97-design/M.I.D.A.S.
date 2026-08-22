-- MIDAS Activity V2 R10: completed-activity coaching export V1.
--
-- This additive source creates one read-only, owner-scoped export function.
-- It accepts only the canonical R9 postimage or its own exact R10 postimage,
-- never calls a write RPC, and never changes Activity V2 data.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';
set local search_path = '';

lock table public.health_activity_catalog_entries,
  public.health_activity_sessions,
  public.health_activity_session_items,
  public.health_activity_item_sets in share mode;

do $guard$
declare
  v_oid oid;
  v_count integer;
  v_acl jsonb;
  v_table text;
  v_owner oid := pg_catalog.to_regrole('postgres');
  v_authenticated oid := pg_catalog.to_regrole('authenticated');
  v_service_role oid := pg_catalog.to_regrole('service_role');
begin
  if pg_catalog.current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'Activity V2 SQL 24 requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity V2 SQL 24 requires postgres session and current user';
  end if;
  if pg_catalog.to_regrole('authenticated') is null
     or pg_catalog.to_regrole('anon') is null
     or pg_catalog.to_regrole('service_role') is null then
    raise exception 'Activity V2 SQL 24 API role preimage drift detected';
  end if;
  if (select pg_catalog.count(*)
        from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and c.relname = any (array[
           'health_activity_catalog_entries', 'health_activity_sessions',
           'health_activity_session_items', 'health_activity_item_sets'
         ]::text[])
         and c.relkind = 'r') <> 4 then
    raise exception 'Activity V2 SQL 24 relation preimage drift detected';
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
    select 1
      from pg_catalog.pg_constraint c
     where c.conrelid = 'public.health_activity_sessions'::pg_catalog.regclass
       and c.conname = 'health_activity_sessions_revision_check'
       and c.contype = 'c'
       and c.convalidated
       and pg_catalog.pg_get_constraintdef(c.oid, false) =
         'CHECK (((revision >= 1) AND (revision <= ''9223372036854775807''::bigint)))'
  ) then
    raise exception 'Activity V2 SQL 24 R9 revision preimage drift detected';
  end if;
  if pg_catalog.to_regprocedure(
       'public.activity_v2_list_sessions(integer,timestamp with time zone,uuid)'
     ) is null
     or pg_catalog.to_regprocedure('public.activity_v2_session_detail(uuid)') is null
     or pg_catalog.to_regprocedure(
          'public.activity_v2_replace_session(uuid,bigint,text,jsonb)'
        ) is null
     or pg_catalog.to_regprocedure(
          'public.activity_v2_delete_session(uuid,bigint,text)'
        ) is null
     or (select pg_catalog.count(*)
           from pg_catalog.pg_proc p
           join pg_catalog.pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public'
            and p.proname = any (array[
              'activity_v2_list_sessions', 'activity_v2_session_detail',
              'activity_v2_replace_session', 'activity_v2_delete_session'
            ]::text[])) <> 4 then
    raise exception 'Activity V2 SQL 24 R9 RPC signature/overload drift detected';
  end if;
  if (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
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
    raise exception 'Activity V2 SQL 24 R9 RPC source drift detected';
  end if;
  if pg_catalog.to_regprocedure(
       'public.activity_v2_commit_session(uuid,jsonb)'
     ) is null
     or pg_catalog.to_regprocedure(
          'public.activity_v2_last_performance(text)'
        ) is null
     or pg_catalog.to_regprocedure(
          'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)'
        ) is null
     or (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(
            'public.activity_v2_commit_session(uuid,jsonb)'::pg_catalog.regprocedure
          ), 'UTF8')), 'hex')) <>
        '7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e'
     or (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(
            'public.activity_v2_last_performance(text)'::pg_catalog.regprocedure
          ), 'UTF8')), 'hex')) <>
        '36958865e48db7f6ca13a7ad36d0d8751f53729c5d40c762654ab2baa73d296e'
     or (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(
            'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)'::pg_catalog.regprocedure
          ), 'UTF8')), 'hex')) <>
        '7fe25b2b010faf95615907d700091579565b39088adcd44d0bd0484333f30f5e' then
    raise exception 'Activity V2 SQL 24 R8/R9 dependency source drift detected';
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
    raise exception 'Activity V2 SQL 24 catalog preimage drift detected';
  end if;
  foreach v_table in array array[
    'health_activity_catalog_entries', 'health_activity_sessions',
    'health_activity_session_items', 'health_activity_item_sets'
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
      raise exception 'Activity V2 SQL 24 table ACL/RLS preimage drift: %',
        v_table;
    end if;
  end loop;

  select pg_catalog.count(*)
    into v_count
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = 'activity_v2_coaching_export';
  v_oid := pg_catalog.to_regprocedure(
    'public.activity_v2_coaching_export(date,date)'
  );
  if v_count = 0 then
    if v_oid is not null then
      raise exception 'Activity V2 SQL 24 fresh preimage drift detected';
    end if;
  elsif v_count = 1 and v_oid is not null then
    if (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(v_oid), 'UTF8')), 'hex')) <>
         'ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376' then
      raise exception 'Activity V2 SQL 24 rerun source drift detected';
    end if;
    if not exists (
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
      raise exception 'Activity V2 SQL 24 rerun hardening drift detected';
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
      raise exception 'Activity V2 SQL 24 rerun ACL drift detected';
    end if;
  else
    raise exception 'Activity V2 SQL 24 overload/partial preimage drift detected';
  end if;
end;
$guard$;

create temporary table midas_activity_v2_sql24_preimage
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

create or replace function public.activity_v2_coaching_export(
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
  v_generated_at timestamptz := pg_catalog.statement_timestamp();
  v_vienna_today date;
  v_from_at timestamptz;
  v_until_at timestamptz;
  v_session_count bigint;
  v_item_count bigint;
  v_set_count bigint;
  v_sessions jsonb;
  v_cautions jsonb;
begin
  v_user := auth.uid();
  if v_user is null
     or coalesce(auth.jwt() ->> 'is_anonymous', '') <> 'false' then
    raise exception using
      errcode = '42501',
      message = 'MIDAS_ACTIVITY_AUTH_REQUIRED';
  end if;

  v_vienna_today := pg_catalog.timezone('Europe/Vienna', v_generated_at)::date;
  if p_from is null
     or p_to is null
     or p_from > p_to
     or (p_to - p_from) not between 0 and 365
     or p_to > v_vienna_today then
    raise exception using
      errcode = '22023',
      message = 'MIDAS_ACTIVITY_INVALID_EXPORT_REQUEST';
  end if;

  v_from_at := pg_catalog.timezone(
    'Europe/Vienna', p_from::timestamp without time zone
  );
  v_until_at := pg_catalog.timezone(
    'Europe/Vienna', (p_to + 1)::timestamp without time zone
  );

  select pg_catalog.count(*)
    into strict v_session_count
    from public.health_activity_sessions s
   where s.user_id = v_user
     and s.started_at >= v_from_at
     and s.started_at < v_until_at
     and s.day between p_from and p_to;
  if v_session_count > 1000 then
    raise exception using
      errcode = '54000',
      message = 'MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED';
  end if;

  select pg_catalog.count(*)
    into strict v_item_count
    from public.health_activity_session_items i
    join public.health_activity_sessions s
      on s.id = i.session_id
     and s.user_id = v_user
   where i.user_id = v_user
     and s.started_at >= v_from_at
     and s.started_at < v_until_at
     and s.day between p_from and p_to;
  if v_item_count > 10000 then
    raise exception using
      errcode = '54000',
      message = 'MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED';
  end if;

  select pg_catalog.count(*)
    into strict v_set_count
    from public.health_activity_item_sets st
    join public.health_activity_session_items i
      on i.id = st.session_item_id
     and i.user_id = v_user
    join public.health_activity_sessions s
      on s.id = i.session_id
     and s.user_id = v_user
   where st.user_id = v_user
     and s.started_at >= v_from_at
     and s.started_at < v_until_at
     and s.day between p_from and p_to;
  if v_set_count > 50000 then
    raise exception using
      errcode = '54000',
      message = 'MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED';
  end if;

  -- A session must have one catalog version, unique keys and dense 1..n order.
  if exists (
    select 1
      from public.health_activity_sessions s
      cross join lateral (
        select
          pg_catalog.count(*) as item_count,
          pg_catalog.count(distinct i.item_key) as key_count,
          pg_catalog.count(distinct i.catalog_version) as version_count,
          pg_catalog.count(distinct i.item_order) as order_count,
          pg_catalog.min(i.item_order) as min_order,
          pg_catalog.max(i.item_order) as max_order
        from public.health_activity_session_items i
       where i.session_id = s.id
         and i.user_id = v_user
      ) x
     where s.user_id = v_user
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
       and s.day between p_from and p_to
       and (
         x.item_count not between 1 and 50
         or x.key_count <> x.item_count
         or x.version_count <> 1
         or x.order_count <> x.item_count
         or x.min_order <> 1
         or x.max_order <> x.item_count
       )
  ) then
    raise exception using
      errcode = '22000',
      message = 'MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT';
  end if;

  -- Historical snapshot fields and item values must match the original row.
  if exists (
    select 1
      from public.health_activity_session_items i
      join public.health_activity_sessions s
        on s.id = i.session_id
       and s.user_id = v_user
      left join public.health_activity_catalog_entries c
        on c.catalog_version = i.catalog_version
       and c.item_key = i.item_key
       and c.tracking_mode = i.tracking_mode_snapshot
     where i.user_id = v_user
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
       and s.day between p_from and p_to
       and (
         c.item_key is null
         or i.item_label_snapshot <> c.label
         or i.equipment_snapshot <> c.equipment
         or i.load_comparability_snapshot <> c.load_comparability
         or i.field_policy_snapshot <> c.field_policy
         or case i.field_policy_snapshot ->> 'duration_min'
              when 'required' then i.duration_min is null
              when 'forbidden' then i.duration_min is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'distance_km'
              when 'required' then i.distance_km is null
              when 'forbidden' then i.distance_km is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'note'
              when 'required' then i.note is null
              when 'forbidden' then i.note is not null
              else false
            end
       )
  ) then
    raise exception using
      errcode = '22000',
      message = 'MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT';
  end if;

  -- Strength items have dense 1..n sets; all other modes have no sets.
  if exists (
    select 1
      from public.health_activity_session_items i
      join public.health_activity_sessions s
        on s.id = i.session_id
       and s.user_id = v_user
      cross join lateral (
        select
          pg_catalog.count(*) as set_count,
          pg_catalog.count(distinct st.set_order) as order_count,
          pg_catalog.min(st.set_order) as min_order,
          pg_catalog.max(st.set_order) as max_order
        from public.health_activity_item_sets st
       where st.session_item_id = i.id
         and st.user_id = v_user
      ) x
     where i.user_id = v_user
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
       and s.day between p_from and p_to
       and (
         (i.tracking_mode_snapshot = 'strength_sets' and (
           x.set_count not between 1 and 50
           or x.order_count <> x.set_count
           or x.min_order <> 1
           or x.max_order <> x.set_count
         ))
         or (i.tracking_mode_snapshot <> 'strength_sets' and x.set_count <> 0)
       )
  ) then
    raise exception using
      errcode = '22000',
      message = 'MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT';
  end if;

  -- Set modes and every field-policy obligation are checked fail-closed.
  if exists (
    select 1
      from public.health_activity_item_sets st
      join public.health_activity_session_items i
        on i.id = st.session_item_id
       and i.user_id = v_user
      join public.health_activity_sessions s
        on s.id = i.session_id
       and s.user_id = v_user
     where st.user_id = v_user
       and s.started_at >= v_from_at
       and s.started_at < v_until_at
       and s.day between p_from and p_to
       and (
         i.tracking_mode_snapshot <> 'strength_sets'
         or st.tracking_mode <> i.tracking_mode_snapshot
         or case i.field_policy_snapshot ->> 'reps'
              when 'required' then st.reps is null
              when 'forbidden' then st.reps is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'duration_sec'
              when 'required' then st.duration_sec is null
              when 'forbidden' then st.duration_sec is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'distance_m'
              when 'required' then st.distance_m is null
              when 'forbidden' then st.distance_m is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'weight_kg'
              when 'required' then st.weight_kg is null
              when 'forbidden' then st.weight_kg is not null
              else false
            end
         or case i.field_policy_snapshot ->> 'assistance_kg'
              when 'required' then st.assistance_kg is null
              when 'forbidden' then st.assistance_kg is not null
              else false
            end
       )
  ) then
    raise exception using
      errcode = '22000',
      message = 'MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT';
  end if;

  select coalesce(
           pg_catalog.jsonb_agg(q.caution order by q.caution collate "C"),
           '[]'::jsonb
         )
    into strict v_cautions
    from (
      select 'no_sessions_in_range'::text as caution
       where v_session_count = 0
      union
      select 'device_relative_loads_present'::text
       where exists (
         select 1
           from public.health_activity_session_items i
           join public.health_activity_sessions s
             on s.id = i.session_id and s.user_id = v_user
          where i.user_id = v_user
            and s.started_at >= v_from_at and s.started_at < v_until_at
            and s.day between p_from and p_to
            and i.load_comparability_snapshot = 'device_relative'
       )
      union
      select 'assistance_loads_present'::text
       where exists (
         select 1
           from public.health_activity_item_sets st
           join public.health_activity_session_items i
             on i.id = st.session_item_id and i.user_id = v_user
           join public.health_activity_sessions s
             on s.id = i.session_id and s.user_id = v_user
          where st.user_id = v_user
            and s.started_at >= v_from_at and s.started_at < v_until_at
            and s.day between p_from and p_to
            and st.assistance_kg is not null
       )
      union
      select 'multiple_catalog_versions_present'::text
       where 1 < (
         select pg_catalog.count(distinct i.catalog_version)
           from public.health_activity_session_items i
           join public.health_activity_sessions s
             on s.id = i.session_id and s.user_id = v_user
          where i.user_id = v_user
            and s.started_at >= v_from_at and s.started_at < v_until_at
            and s.day between p_from and p_to
       )
    ) q;

  select coalesce(
           pg_catalog.jsonb_agg(
             session_row.value
             order by session_row.day, session_row.started_at, session_row.id
           ),
           '[]'::jsonb
         )
    into strict v_sessions
    from (
      select
        s.day,
        s.started_at,
        s.id,
        pg_catalog.jsonb_build_object(
          'session_id', s.id::text,
          'catalog_version', (
            select pg_catalog.min(i.catalog_version)
              from public.health_activity_session_items i
             where i.session_id = s.id and i.user_id = v_user
          ),
          'revision', s.revision::text,
          'day', s.day::text,
          'started_at', pg_catalog.to_char(
            pg_catalog.timezone('UTC', s.started_at),
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
          ),
          'ended_at', pg_catalog.to_char(
            pg_catalog.timezone('UTC', s.ended_at),
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
          ),
          'duration_min', s.duration_min,
          'title', s.title,
          'note', s.note,
          'items', (
            select coalesce(
                     pg_catalog.jsonb_agg(item_row.value order by item_row.item_order),
                     '[]'::jsonb
                   )
              from (
                select
                  i.item_order,
                  pg_catalog.jsonb_build_object(
                    'item_key', i.item_key,
                    'item_order', i.item_order,
                    'item_label_snapshot', i.item_label_snapshot,
                    'tracking_mode_snapshot', i.tracking_mode_snapshot,
                    'equipment_snapshot', i.equipment_snapshot,
                    'load_comparability_snapshot', i.load_comparability_snapshot,
                    'field_policy_snapshot', i.field_policy_snapshot,
                    'category', c.category,
                    'muscle_groups', pg_catalog.to_jsonb(c.muscle_groups),
                    'sport_tags', pg_catalog.to_jsonb(c.sport_tags),
                    'duration_min', i.duration_min,
                    'distance_km', i.distance_km,
                    'note', i.note,
                    'sets', (
                      select coalesce(
                               pg_catalog.jsonb_agg(
                                 pg_catalog.jsonb_build_object(
                                   'set_order', st.set_order,
                                   'tracking_mode', st.tracking_mode,
                                   'reps', st.reps,
                                   'duration_sec', st.duration_sec,
                                   'distance_m', st.distance_m,
                                   'weight_kg', st.weight_kg,
                                   'assistance_kg', st.assistance_kg
                                 ) order by st.set_order
                               ),
                               '[]'::jsonb
                             )
                        from public.health_activity_item_sets st
                       where st.session_item_id = i.id
                         and st.user_id = v_user
                    )
                  ) as value
                  from public.health_activity_session_items i
                  join public.health_activity_catalog_entries c
                    on c.catalog_version = i.catalog_version
                   and c.item_key = i.item_key
                   and c.tracking_mode = i.tracking_mode_snapshot
                 where i.session_id = s.id
                   and i.user_id = v_user
              ) item_row
          )
        ) as value
        from public.health_activity_sessions s
       where s.user_id = v_user
         and s.started_at >= v_from_at
         and s.started_at < v_until_at
         and s.day between p_from and p_to
    ) session_row;

  return pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-coaching-export.v1',
    'generated_at', pg_catalog.to_char(
      pg_catalog.timezone('UTC', v_generated_at),
      'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
    ),
    'timezone', 'Europe/Vienna',
    'range', pg_catalog.jsonb_build_object(
      'from', p_from::text,
      'to', p_to::text,
      'inclusive', true
    ),
    'units', pg_catalog.jsonb_build_object(
      'session_duration', 'min',
      'item_duration', 'min',
      'item_distance', 'km',
      'set_duration', 's',
      'set_distance', 'm',
      'weight', 'kg',
      'assistance', 'kg',
      'repetitions', 'count'
    ),
    'completeness', pg_catalog.jsonb_build_object(
      'status', 'complete',
      'truncated', false,
      'session_count', v_session_count,
      'item_count', v_item_count,
      'set_count', v_set_count
    ),
    'quality', pg_catalog.jsonb_build_object(
      'status', case when v_session_count = 0 then 'no_data' else 'ok' end,
      'cautions', v_cautions
    ),
    'sessions', v_sessions
  );
end;
$function$;

alter function public.activity_v2_coaching_export(date, date) owner to postgres;
revoke all on function public.activity_v2_coaching_export(date, date)
  from public, anon, authenticated, service_role;
grant execute on function public.activity_v2_coaching_export(date, date)
  to authenticated;

do $post$
declare
  v_oid oid := pg_catalog.to_regprocedure(
    'public.activity_v2_coaching_export(date,date)'
  );
  v_acl jsonb;
  v_source_sha256 text;
begin
  if v_oid is null
     or (select pg_catalog.count(*)
           from pg_catalog.pg_proc p
           join pg_catalog.pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public'
            and p.proname = 'activity_v2_coaching_export') <> 1
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
    raise exception 'Activity V2 SQL 24 function postcondition failed';
  end if;
  select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
           pg_catalog.pg_get_functiondef(v_oid), 'UTF8')), 'hex')
    into strict v_source_sha256;
  if v_source_sha256 <> 'ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376' then
    raise exception 'Activity V2 SQL 24 source postcondition failed: %',
      v_source_sha256;
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
    raise exception 'Activity V2 SQL 24 ACL postcondition failed';
  end if;
  if (select sessions_sha256 from midas_activity_v2_sql24_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_sessions s)
     or (select items_sha256 from midas_activity_v2_sql24_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_session_items i)
     or (select sets_sha256 from midas_activity_v2_sql24_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(st) order by st.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_item_sets st) then
    raise exception 'Activity V2 SQL 24 changed Activity V2 data';
  end if;
end;
$post$;

commit;

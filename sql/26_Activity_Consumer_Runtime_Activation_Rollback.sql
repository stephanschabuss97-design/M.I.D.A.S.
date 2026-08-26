-- MIDAS Activity V2 R13 SQL 26 rollback.
--
-- Restores the exact SQL 25 user-only snapshot postimage. It recognizes only
-- the exact SQL 26 functions/ACLs and never changes Activity or report data.

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
  v_user_oid oid := pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot(date,date)'
  );
  v_service_oid oid := pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot_for_owner(uuid,date,date)'
  );
  v_core_oid oid := pg_catalog.to_regprocedure(
    'midas_private.activity_consumer_snapshot_core(uuid,date,date)'
  );
  v_owner oid := pg_catalog.to_regrole('postgres');
begin
  if pg_catalog.current_setting('server_version_num')::integer
       not between 170000 and 179999 then
    raise exception 'Activity consumer SQL 26 rollback requires PostgreSQL 17';
  end if;
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'Activity consumer SQL 26 rollback requires postgres session and current user';
  end if;
  if v_owner is null or pg_catalog.to_regrole('authenticated') is null
     or pg_catalog.to_regrole('service_role') is null
     or pg_catalog.to_regrole('anon') is null
     or v_user_oid is null or v_service_oid is null or v_core_oid is null then
    raise exception 'Activity consumer SQL 26 rollback object preimage drift detected';
  end if;
  if (select pg_catalog.count(*)
        from pg_catalog.pg_proc p
        join pg_catalog.pg_namespace n on n.oid = p.pronamespace
       where (n.nspname = 'public' and p.proname in (
                'activity_consumer_snapshot',
                'activity_consumer_snapshot_for_owner'
              ))
          or (n.nspname = 'midas_private'
              and p.proname = 'activity_consumer_snapshot_core')) <> 3
     or pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(v_user_oid), 'UTF8')), 'hex') <>
        'cffcd679d91b86c621388e790752e3100be140dd582f1e1fe18cf2d5cff79f2b'
     or pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(v_service_oid), 'UTF8')), 'hex') <>
        'eb27ec4435af922a16a7758be7f22a5f0aa384b60d1c048ee237cd26b2df6f54'
     or pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(v_core_oid), 'UTF8')), 'hex') <>
        'abb596278b61d563e7e8e1277206e3b381c3331bd41375c66ed0c24e8933f79f'
     or exists (
       select 1
         from (values (v_user_oid), (v_service_oid), (v_core_oid)) expected(oid)
        where not exists (
          select 1
            from pg_catalog.pg_proc p
            join pg_catalog.pg_roles r on r.oid = p.proowner
           where p.oid = expected.oid
             and r.rolname = 'postgres'
             and p.prokind = 'f'
             and p.prorettype = 'jsonb'::pg_catalog.regtype
             and p.provolatile = 's'
             and not p.prosecdef
             and p.proconfig = array['search_path=""']::text[]
        )
     ) then
    raise exception 'Activity consumer SQL 26 rollback source/hardening drift detected';
  end if;
  if not pg_catalog.has_schema_privilege('authenticated', 'midas_private', 'USAGE')
     or not pg_catalog.has_schema_privilege('service_role', 'midas_private', 'USAGE')
     or pg_catalog.has_schema_privilege('anon', 'midas_private', 'USAGE')
     or not pg_catalog.has_function_privilege(
       'authenticated', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE'
     )
     or not pg_catalog.has_function_privilege(
       'service_role',
       'public.activity_consumer_snapshot_for_owner(uuid,date,date)', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'authenticated',
       'public.activity_consumer_snapshot_for_owner(uuid,date,date)', 'EXECUTE'
     )
     or not pg_catalog.has_function_privilege(
       'authenticated',
       'midas_private.activity_consumer_snapshot_core(uuid,date,date)', 'EXECUTE'
     )
     or not pg_catalog.has_function_privilege(
       'service_role',
       'midas_private.activity_consumer_snapshot_core(uuid,date,date)', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role',
       'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)',
       'EXECUTE'
     ) then
    raise exception 'Activity consumer SQL 26 rollback ACL drift detected';
  end if;
end;
$guard$;

create temporary table midas_activity_consumer_sql26_rollback_preimage
on commit drop
as
select
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_events e) as events_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_sessions s) as sessions_sha256,
  (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
      'UTF8')), 'hex') from public.health_activity_session_items i) as items_sha256;

drop function public.activity_consumer_snapshot(date, date);
drop function public.activity_consumer_snapshot_for_owner(uuid, date, date);
drop function midas_private.activity_consumer_snapshot_core(uuid, date, date);

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

revoke all on schema midas_private
  from public, anon, authenticated, service_role;
grant usage on schema midas_private to authenticated;

do $post$
declare
  v_user_oid oid := pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot(date,date)'
  );
begin
  if v_user_oid is null
     or pg_catalog.to_regprocedure(
       'public.activity_consumer_snapshot_for_owner(uuid,date,date)'
     ) is not null
     or pg_catalog.to_regprocedure(
       'midas_private.activity_consumer_snapshot_core(uuid,date,date)'
     ) is not null
     or pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(v_user_oid), 'UTF8')), 'hex') <>
        'f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d'
     or not pg_catalog.has_schema_privilege('authenticated', 'midas_private', 'USAGE')
     or pg_catalog.has_schema_privilege('service_role', 'midas_private', 'USAGE')
     or pg_catalog.has_schema_privilege('anon', 'midas_private', 'USAGE')
     or not pg_catalog.has_function_privilege(
       'authenticated', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role',
       'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)',
       'EXECUTE'
     ) then
    raise exception 'Activity consumer SQL 26 rollback postcondition failed';
  end if;
  if (select events_sha256 from midas_activity_consumer_sql26_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_events e)
     or (select sessions_sha256 from midas_activity_consumer_sql26_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_sessions s)
     or (select items_sha256 from midas_activity_consumer_sql26_rollback_preimage) <>
       (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
          coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) order by i.id), '[]'::jsonb)::text,
          'UTF8')), 'hex') from public.health_activity_session_items i) then
    raise exception 'Activity consumer SQL 26 rollback changed protected Activity data';
  end if;
end;
$post$;

commit;

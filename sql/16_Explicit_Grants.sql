-- 16_Explicit_Grants.sql
-- Purpose:
--   Explicit Data API grants for MIDAS public-schema objects.
--
-- Why this file exists:
--   Supabase changes the default exposure of new public-schema tables to the
--   Data API. MIDAS therefore keeps an explicit, reviewable grant contract in
--   the repository instead of relying on platform defaults.
--
-- Execution order:
--   Run this file after the object-definition SQL files have created the
--   referenced tables, views, and RPC functions. This is a grant catch-up /
--   provisioning script, not a standalone schema bootstrap.
--
-- Safety contract:
--   - No data migration.
--   - No drop, truncate, or delete.
--   - No RLS policy changes.
--   - No broad schema-level grants.
--   - No anon table or view grants.
--   - Only object-specific grant/revoke statements.
--   - Productive execution is user-gated.
--
-- Related roadmap:
--   docs/MIDAS Supabase Explicit Grants Roadmap.md

begin;

-- ---------------------------------------------------------------------------
-- S4.2 Core Health and health views
-- ---------------------------------------------------------------------------

revoke all on table public.user_profile from anon, public, authenticated, service_role;
revoke all on table public.health_events from anon, public, authenticated, service_role;
revoke all on table public.v_events_bp from anon, public, authenticated, service_role;
revoke all on table public.v_events_body from anon, public, authenticated, service_role;
revoke all on table public.v_events_lab from anon, public, authenticated, service_role;
revoke all on table public.v_events_activity from anon, public, authenticated, service_role;

grant select, insert, update, delete
  on table public.user_profile
  to authenticated, service_role;

grant select, insert, update, delete
  on table public.health_events
  to authenticated, service_role;

grant select
  on table public.v_events_bp
  to authenticated, service_role;

grant select
  on table public.v_events_body
  to authenticated, service_role;

grant select
  on table public.v_events_lab
  to authenticated, service_role;

grant select
  on table public.v_events_activity
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- S4.3 Appointments
-- ---------------------------------------------------------------------------

revoke all on table public.appointments_v2 from anon, public, authenticated, service_role;
revoke all on table public.v_appointments_v2_upcoming from anon, public, authenticated, service_role;

grant select, insert, update, delete
  on table public.appointments_v2
  to authenticated, service_role;

grant select
  on table public.v_appointments_v2_upcoming
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- S4.4 Medication
-- ---------------------------------------------------------------------------

revoke all on table public.health_medications from anon, public, authenticated, service_role;
revoke all on table public.health_medication_schedule_slots from anon, public, authenticated, service_role;
revoke all on table public.health_medication_slot_events from anon, public, authenticated, service_role;

grant select, insert, update, delete
  on table public.health_medications
  to authenticated, service_role;

grant select, insert, update, delete
  on table public.health_medication_schedule_slots
  to authenticated, service_role;

grant select, insert, update, delete
  on table public.health_medication_slot_events
  to authenticated, service_role;

revoke all on function public.med_reset_all_data_v2() from anon, public, authenticated, service_role;
revoke all on function public.med_list_v2(date) from anon, public, authenticated, service_role;
revoke all on function public.med_upsert_v2(uuid, text, text, text, text, int, int, boolean, boolean) from anon, public, authenticated, service_role;
revoke all on function public.med_upsert_schedule_v2(uuid, date, jsonb) from anon, public, authenticated, service_role;
revoke all on function public.med_confirm_slot_v2(uuid, date) from anon, public, authenticated, service_role;
revoke all on function public.med_undo_slot_v2(uuid, date) from anon, public, authenticated, service_role;
revoke all on function public.med_adjust_stock_v2(uuid, int, text) from anon, public, authenticated, service_role;
revoke all on function public.med_set_stock_v2(uuid, int, text) from anon, public, authenticated, service_role;
revoke all on function public.med_ack_low_stock_v2(uuid, date, int) from anon, public, authenticated, service_role;
revoke all on function public.med_set_active_v2(uuid, boolean) from anon, public, authenticated, service_role;
revoke all on function public.med_delete_v2(uuid) from anon, public, authenticated, service_role;

grant execute on function public.med_reset_all_data_v2()
  to authenticated, service_role;

grant execute on function public.med_list_v2(date)
  to authenticated, service_role;

grant execute on function public.med_upsert_v2(uuid, text, text, text, text, int, int, boolean, boolean)
  to authenticated, service_role;

grant execute on function public.med_upsert_schedule_v2(uuid, date, jsonb)
  to authenticated, service_role;

grant execute on function public.med_confirm_slot_v2(uuid, date)
  to authenticated, service_role;

grant execute on function public.med_undo_slot_v2(uuid, date)
  to authenticated, service_role;

grant execute on function public.med_adjust_stock_v2(uuid, int, text)
  to authenticated, service_role;

grant execute on function public.med_set_stock_v2(uuid, int, text)
  to authenticated, service_role;

grant execute on function public.med_ack_low_stock_v2(uuid, date, int)
  to authenticated, service_role;

grant execute on function public.med_set_active_v2(uuid, boolean)
  to authenticated, service_role;

grant execute on function public.med_delete_v2(uuid)
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- S4.5 Trendpilot
-- ---------------------------------------------------------------------------

revoke all on table public.trendpilot_events from anon, public, authenticated, service_role;
revoke all on table public.trendpilot_events_range from anon, public, authenticated, service_role;
revoke all on table public.trendpilot_state from anon, public, authenticated, service_role;

grant select, update, delete
  on table public.trendpilot_events
  to authenticated;

grant select, insert, update, delete
  on table public.trendpilot_events
  to service_role;

grant select
  on table public.trendpilot_events_range
  to authenticated, service_role;

grant select
  on table public.trendpilot_state
  to authenticated, service_role;

grant insert, update, delete
  on table public.trendpilot_state
  to service_role;

-- ---------------------------------------------------------------------------
-- S4.6 Push
-- ---------------------------------------------------------------------------

revoke all on table public.push_subscriptions from anon, public, authenticated, service_role;
revoke all on table public.push_notification_deliveries from anon, public, authenticated, service_role;

grant select, insert, update, delete
  on table public.push_subscriptions
  to authenticated, service_role;

grant select
  on table public.push_notification_deliveries
  to authenticated;

grant select, insert, update, delete
  on table public.push_notification_deliveries
  to service_role;

-- ---------------------------------------------------------------------------
-- S4.7 Intake, Activity, and remaining Data API RPCs
-- ---------------------------------------------------------------------------

revoke all on function public.upsert_intake(date, numeric, numeric, numeric) from anon, public, authenticated, service_role;
revoke all on function public.activity_add(date, jsonb) from anon, public, authenticated, service_role;
revoke all on function public.activity_list(date, date) from anon, public, authenticated, service_role;
revoke all on function public.activity_delete(uuid) from anon, public, authenticated, service_role;

grant execute on function public.upsert_intake(date, numeric, numeric, numeric)
  to authenticated, service_role;

grant execute on function public.activity_add(date, jsonb)
  to authenticated, service_role;

grant execute on function public.activity_list(date, date)
  to authenticated, service_role;

grant execute on function public.activity_delete(uuid)
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- S4.8 Activity V2 R9 catalog, history, commit, and lifecycle API
-- ---------------------------------------------------------------------------

revoke all on table public.health_activity_catalog_entries
  from anon, public, authenticated, service_role;
revoke all on table public.health_activity_sessions
  from anon, public, authenticated, service_role;
revoke all on table public.health_activity_session_items
  from anon, public, authenticated, service_role;
revoke all on table public.health_activity_item_sets
  from anon, public, authenticated, service_role;

grant select
  on table public.health_activity_catalog_entries
  to authenticated, service_role;
grant select
  on table public.health_activity_sessions
  to authenticated, service_role;
grant select
  on table public.health_activity_session_items
  to authenticated, service_role;
grant select
  on table public.health_activity_item_sets
  to authenticated, service_role;

revoke all on function public.activity_v2_commit_session(uuid, jsonb)
  from anon, public, authenticated, service_role;
revoke all on function public.activity_v2_last_performance(text)
  from anon, public, authenticated, service_role;

grant execute on function public.activity_v2_commit_session(uuid, jsonb)
  to authenticated;
grant execute on function public.activity_v2_last_performance(text)
  to authenticated;
do $activity_v2_r9_grants$
declare
  v_public_count integer;
  v_helper_exists boolean;
  v_schema_exists boolean;
begin
  select pg_catalog.count(*)
    into v_public_count
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = any (array[
       'activity_v2_list_sessions',
       'activity_v2_session_detail',
       'activity_v2_replace_session',
       'activity_v2_delete_session'
     ]::text[]);
  v_helper_exists := pg_catalog.to_regprocedure(
    'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)'
  ) is not null;
  v_schema_exists := pg_catalog.to_regnamespace('midas_private') is not null;

  -- SQL 16 remains usable for the proven R8-only setup. The R9 fresh target
  -- order is 20 -> 21 -> 22 -> 23 -> 16; any partial R9 state fails closed.
  if v_public_count = 0 and not v_helper_exists and not v_schema_exists then
    return;
  end if;
  if v_public_count <> 4 or not v_helper_exists or not v_schema_exists then
    raise exception 'Activity V2 R9 explicit-grant target is partial';
  end if;

  revoke all on function public.activity_v2_list_sessions(integer, timestamptz, uuid)
    from anon, public, authenticated, service_role;
  revoke all on function public.activity_v2_session_detail(uuid)
    from anon, public, authenticated, service_role;
  revoke all on function public.activity_v2_replace_session(uuid, bigint, text, jsonb)
    from anon, public, authenticated, service_role;
  revoke all on function public.activity_v2_delete_session(uuid, bigint, text)
    from anon, public, authenticated, service_role;
  revoke all on schema midas_private
    from anon, public, authenticated, service_role;
  revoke all on function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
    from anon, public, authenticated, service_role;

  grant execute on function public.activity_v2_list_sessions(integer, timestamptz, uuid)
    to authenticated;
  grant execute on function public.activity_v2_session_detail(uuid)
    to authenticated;
  grant execute on function public.activity_v2_replace_session(uuid, bigint, text, jsonb)
    to authenticated;
  grant execute on function public.activity_v2_delete_session(uuid, bigint, text)
    to authenticated;
  grant usage on schema midas_private
    to authenticated;
  grant execute on function midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)
    to authenticated;
end;
$activity_v2_r9_grants$;

-- ---------------------------------------------------------------------------
-- S4.9 Activity V2 R10 completed-activity coaching export API
-- ---------------------------------------------------------------------------

do $activity_v2_r10_grants$
declare
  v_public_count integer;
  v_export_exists boolean;
  v_export_oid oid;
begin
  select pg_catalog.count(*)
    into v_public_count
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = 'activity_v2_coaching_export';
  v_export_oid := pg_catalog.to_regprocedure(
    'public.activity_v2_coaching_export(date,date)'
  );
  v_export_exists := v_export_oid is not null;

  -- SQL 16 remains usable before SQL 24. Once any R10 export overload is
  -- present, only the one canonical date/date signature is accepted.
  if v_public_count = 0 and not v_export_exists then
    return;
  end if;
  if v_public_count <> 1 or not v_export_exists then
    raise exception 'Activity V2 R10 explicit-grant target is partial or overloaded';
  end if;
  if (select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
        pg_catalog.pg_get_functiondef(v_export_oid), 'UTF8')), 'hex')) <>
       'ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376'
     or not exists (
       select 1
         from pg_catalog.pg_proc p
         join pg_catalog.pg_roles r on r.oid = p.proowner
        where p.oid = v_export_oid
          and r.rolname = 'postgres'
          and p.prokind = 'f'
          and p.prorettype = 'jsonb'::pg_catalog.regtype
          and not p.prosecdef
          and p.provolatile = 's'
          and p.proconfig = array['search_path=""']::text[]
     ) then
    raise exception 'Activity V2 R10 explicit-grant target source or hardening drift';
  end if;

  revoke all on function public.activity_v2_coaching_export(date, date)
    from anon, public, authenticated, service_role;
  grant execute on function public.activity_v2_coaching_export(date, date)
    to authenticated;
end;
$activity_v2_r10_grants$;

-- ---------------------------------------------------------------------------
-- Activity V2 R11 read-only Doctor/report consumer snapshot
-- ---------------------------------------------------------------------------

do $activity_v2_r11_grants$
declare
  v_public_count integer;
  v_snapshot_oid oid;
  v_acl jsonb;
begin
  select pg_catalog.count(*)
    into v_public_count
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = 'activity_consumer_snapshot';
  v_snapshot_oid := pg_catalog.to_regprocedure(
    'public.activity_consumer_snapshot(date,date)'
  );

  -- SQL 16 remains usable before SQL 25. Once any R11 overload exists, only
  -- the canonical date/date function and either the exact SQL 25 postimage or
  -- the exact SQL 26 delegating user wrapper are valid.
  if v_public_count = 0 and v_snapshot_oid is null then
    return;
  end if;
  if v_public_count <> 1 or v_snapshot_oid is null then
    raise exception 'Activity V2 R11 explicit-grant target is partial or overloaded';
  end if;
  if pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
       pg_catalog.pg_get_functiondef(v_snapshot_oid), 'UTF8')), 'hex') not in (
       'f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d',
       'cffcd679d91b86c621388e790752e3100be140dd582f1e1fe18cf2d5cff79f2b'
     )
     or not exists (
       select 1
         from pg_catalog.pg_proc p
         join pg_catalog.pg_roles r on r.oid = p.proowner
        where p.oid = v_snapshot_oid
          and r.rolname = 'postgres'
          and p.prokind = 'f'
          and p.prorettype = 'jsonb'::pg_catalog.regtype
          and not p.prosecdef
          and p.provolatile = 's'
          and p.proconfig = array['search_path=""']::text[]
     ) then
    raise exception 'Activity V2 R11 explicit-grant target source or hardening drift';
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
   where p.oid = v_snapshot_oid;
  if v_acl <>
       '[["authenticated","postgres","EXECUTE",false],["postgres","postgres","EXECUTE",false]]'::jsonb
     or pg_catalog.has_function_privilege(
       'anon', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role', 'public.activity_consumer_snapshot(date,date)', 'EXECUTE'
     ) then
    raise exception 'Activity V2 R11 explicit-grant target ACL drift';
  end if;

  revoke all on function public.activity_consumer_snapshot(date, date)
    from anon, public, authenticated, service_role;
  grant execute on function public.activity_consumer_snapshot(date, date)
    to authenticated;
end;
$activity_v2_r11_grants$;

-- ---------------------------------------------------------------------------
-- Activity V2 R13 private snapshot core and service-only owner wrapper
-- ---------------------------------------------------------------------------

do $activity_v2_r13_grants$
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
  v_helper_oid oid := pg_catalog.to_regprocedure(
    'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)'
  );
begin
  if v_service_oid is null and v_core_oid is null then
    return;
  end if;
  if v_user_oid is null or v_service_oid is null or v_core_oid is null
     or v_helper_oid is null
     or (select pg_catalog.count(*)
           from pg_catalog.pg_proc p
           join pg_catalog.pg_namespace n on n.oid = p.pronamespace
          where (n.nspname = 'public' and p.proname in (
                   'activity_consumer_snapshot',
                   'activity_consumer_snapshot_for_owner'
                 ))
             or (n.nspname = 'midas_private'
                 and p.proname = 'activity_consumer_snapshot_core')) <> 3 then
    raise exception 'Activity V2 R13 explicit-grant target is partial or overloaded';
  end if;
  if pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
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
    raise exception 'Activity V2 R13 explicit-grant source or hardening drift';
  end if;
  if pg_catalog.has_function_privilege(
       'service_role',
       'midas_private.activity_v2_canonical_content(integer,integer,text,jsonb)',
       'EXECUTE'
     ) then
    raise exception 'Activity V2 R13 protected R9 helper ACL drift';
  end if;

  revoke all on schema midas_private
    from anon, public, authenticated, service_role;
  grant usage on schema midas_private to authenticated, service_role;
  revoke all on function midas_private.activity_consumer_snapshot_core(uuid, date, date)
    from anon, public, authenticated, service_role;
  grant execute on function midas_private.activity_consumer_snapshot_core(uuid, date, date)
    to authenticated, service_role;
  revoke all on function public.activity_consumer_snapshot_for_owner(uuid, date, date)
    from anon, public, authenticated, service_role;
  grant execute on function public.activity_consumer_snapshot_for_owner(uuid, date, date)
    to service_role;
end;
$activity_v2_r13_grants$;

commit;

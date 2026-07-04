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
revoke all on table public.health_medication_stock_log from anon, public, authenticated, service_role;

grant select, insert, update, delete
  on table public.health_medications
  to authenticated, service_role;

grant select, insert, update, delete
  on table public.health_medication_schedule_slots
  to authenticated, service_role;

grant select, insert, update, delete
  on table public.health_medication_slot_events
  to authenticated, service_role;

grant select, insert, delete
  on table public.health_medication_stock_log
  to authenticated;

grant select, insert, update, delete
  on table public.health_medication_stock_log
  to service_role;

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

grant select, insert, update, delete
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

commit;

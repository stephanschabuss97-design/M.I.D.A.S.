---
title: DB Transition Plan (Sanity-Checked)
status: draft
---

# Sanity Check (Summary)

- `sql/01_Health Schema.sql` is a bootstrap script. Running it on an existing DB will fail at `create table public.health_events` (no `if not exists`). It will not delete data, but it will also not apply the intended view/trigger changes.
- To add BP comments safely, we must use a small migration SQL that only updates the validation function, trigger, and `v_events_bp` view.
- Renaming tables/views (e.g., `health_events -> vitals`, `appointments_v2 -> appointments`) is a broad refactor and should only be done after transitional SQLs are applied and verified.
- Intake should move to its own table (recommended), not merged into medication storage.

# Goal

Reach a DB state where:
- BP comments are part of BP events (no separate `note` for BP comments).
- Intake has its own table with a single row per day (same logic as today).
- Appointments use stable names (`appointments`, `v_appointments`), with old `v2` objects removed.
- No data loss during the transition steps (except Appointments which are explicitly dropped/rebuilt).

# Deterministic Steps

## Step 0: Backup and Baseline

- Ensure a recent DB backup exists.
- Confirm the active schema objects: `health_events`, `v_events_bp`, `appointments_v2`, `v_appointments_v2_upcoming`.
- Record row counts for `health_events` and any related views as a baseline.
- Verify app can read current BP/Body/Lab/Activity data before changes.

## Step 1: Transition SQL for BP comments (no data loss)

Create and run a **small migration SQL** that only:
- `create or replace function public.trg_events_validate()` with `comment` allowed for `bp`.
- `drop trigger if exists trg_events_validate_biu on public.health_events;`
- `create trigger trg_events_validate_biu ...`
- `create or replace view public.v_events_bp` with `comment` column.

Do **not** drop any tables here.

Verification after Step 1:
- Existing `health_events` row count unchanged.
- `v_events_bp` returns a `comment` column (null for existing rows).
- New BP saves with comment succeed without creating a separate `note`.
- Update module overviews to reflect BP comment storage in BP payload (no separate note).

JS updates to verify/apply after Step 1:
- `assets/js/format.js` (BP comment in payload)
- `app/modules/vitals-stack/vitals/bp.js` (save BP comment inline, no appendNote)
- `app/supabase/api/vitals.js` (load `comment` from `v_events_bp`)
- `app/modules/doctor-stack/doctor/index.js` (render BP comments via daily notes)

## Step 2: Appointments reset (explicitly destructive, but accepted)

Since you have only one appointment and are OK rebuilding:
- Create a transition SQL that **drops** `v_appointments_v2_upcoming` and `appointments_v2`.
- Create `appointments` and `v_appointments` with the new final names.
- Apply RLS/policies/indices as before.
- Update all JS/SQL references to the new table/view names (queries, RPCs, filters, and UI labels).

Verification after Step 2:
- Appointments UI can create and list entries against `appointments`.
- No other tables/views are touched.
- Update module overviews with new appointment table/view names.

JS updates to verify/apply after Step 2:
- `app/modules/appointments/index.js` (table/view names)
- Any Supabase API wrappers for appointments (if present)

## Step 3: Intake table separation

Create a dedicated `intakes` table (or `intake_events`) with:
- One row per user per day.
- The same fields as current intake payload (`water_ml`, `salt_g`, `protein_g`).
- Matching RLS policies.
- Any helper RPCs if needed.

Keep medication logic unchanged.

Verification after Step 3:
- Intake writes/read operations point to the new table.
- No changes to medication tables or data.
- Update module overviews to document the new intake table.

JS updates to verify/apply after Step 3:
- `app/supabase/api/intake.js` (table/RPC targets)
- `app/modules/intake-stack/*` (any direct table/view references)
- `assets/js/main.js` (intake refresh if it points to old table)

## Step 4: Optional renames (later)

Only after all transitions are stable:
- Consider renaming `health_events` to `vitals`.
- This requires updating every view, RPC, client call, and policy.
- Recommended to do in a dedicated refactor window.

## Step 5: Consolidate into master SQL scripts (final packaging)

Goal: Replace the current patchwork of SQL files with a small, clean set of master scripts.

Target structure (6–7 scripts total):
- Core schema (events/vitals + base policies + base views)
- Vitals module (bp/body/lab/activity + views + RPCs)
- Intake module (intake table/view + RPCs)
- Appointments module (appointments table/view + policies)
- Profile module (user_profile table + policies)
- Optional: Delete/cleanup scripts (module-level teardown)
- Optional: Helper scripts (diagnostics/custom queries)

Guidelines:
- Master scripts are for clean rebuilds; transitional scripts remain separate.
- Each master script must be idempotent (or explicitly marked as bootstrap-only).
- Align naming and module ownership in the module overviews.

Note on Intakes:
- If you prefer a module view/table approach, define a dedicated `intakes` table plus a `v_intakes` view (or similar) in the Intake module script.

# Notes

- All transition SQLs should be idempotent where possible, except the explicit appointments drop/recreate step.
- Avoid running bootstrap scripts on a live DB; use targeted migrations instead.
- JS changes should be deployed only after the corresponding SQL step is applied, to avoid runtime mismatches.

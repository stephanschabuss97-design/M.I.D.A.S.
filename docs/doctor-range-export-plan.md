---
title: Doctor Range + Export Alignment Plan
status: draft
---

# Goal

Make Supabase the single source of truth for Doctor view, Chart, and JSON export. All outputs must be strictly limited to the selected `from/to` range. IndexedDB is used only as an offline fallback.

# Scope

- Doctor view (BP, Body, Lab, Activity)
- Chart (SVG)
- JSON export
- Docs updates (Module Overview, QA checks)

# Deterministic Steps

## 1) Doctor View: enforce range in the client (done)

### Files
- `app/modules/doctor-stack/doctor/index.js`

### Current behavior
- Reads `from/to` and requests Supabase data.
- Renders whatever Supabase returns without a second range guard.

### Changes
1. Add a small, shared helper that checks `from/to` and filters rows by day.
2. Apply the filter to all datasets before rendering:
   - `daysArr` (BP/Body/Notes)
   - `labRows`
   - `activityRows`
3. Ensure no rendering happens for rows outside `from/to`.
4. When range is missing or invalid, show placeholder and skip data calls.

### Notes
- `daysArr` uses `date` keys.
- `labRows` uses `day`.
- `activityRows` uses `day`.
- Apply filter *after* the Supabase fetch and *before* rendering.

## 2) Export JSON: Supabase range only (done)

### Files
- `app/modules/doctor-stack/doctor/index.js`

### Current behavior
- Export uses IndexedDB (`getAllEntries`) first.
- Supabase is only used as a fallback when local data is empty.

### Changes
1. Read `from/to` from `#from/#to`.
2. Fetch all four domains via Supabase:
   - BP + Body + Notes: `fetchDailyOverview(from, to)`
   - Lab: `loadLabEventsRange({ user_id, from, to })`
   - Activity: `loadActivities(from, to, { reason: 'doctor:export' })`
3. Build export JSON exclusively from those datasets.
4. Filter by range before export.
5. IndexedDB is only used when:
   - No network, or
   - Supabase session not available

### Output format
- Only include the four domains (BP, Body, Lab, Activity).
- Ensure entries are stamped with the correct `day` within range.

## 3) Chart (SVG): range-only and Supabase-first (done)

### Files
- `app/modules/doctor-stack/charts/index.js`

### Current behavior
- Uses `fetchDailyOverview(from, to)` when logged in.
- Falls back to `getAllEntries` if not logged in.

### Changes
1. Ensure `from/to` are validated and always applied.
2. Use Supabase data whenever session is active.
3. Fallback to IndexedDB only when offline/no session.
4. Apply range filtering to the fallback dataset.

## 4) Offline fallback definition (done)

### Files
- `app/modules/doctor-stack/doctor/index.js`
- `app/modules/doctor-stack/charts/index.js`

### Deterministic behavior
- Offline or missing Supabase session -> allow IndexedDB.
- Online + session -> do not use IndexedDB.
- Fallback must still obey `from/to`.

## 5) Docs updates (Spec alignment) (done)

### Files
- `Docs/modules/Doctor View Module Overview.md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/QA_CHECKS.md` (if present for export/range checks)

### Changes
1. Source of Truth -> Supabase only.
2. Export -> Supabase range only, four domains.
3. Chart -> Supabase range only, fallback only if offline.
4. Explicitly state client-side range guard exists.

# Verification Checklist

- Doctor view shows no days outside `from/to` in any tab.
- Chart shows no values outside `from/to`.
- JSON export contains only BP/Body/Lab/Activity for `from/to`.
- Offline mode still works with IndexedDB (range-filtered).

# Bootflow Overview

Purpose: single source of truth for how MIDAS boots, in which order modules are initialized, and what a new module must do to integrate safely.

## 1. Why this document exists
- Prevent hidden boot order dependencies.
- Make auth, storage, and module initialization deterministic.
- Provide a checklist for adding new modules without breaking login or refresh.

---

## 2. Boot sequence (happy path)
1) `index.html` loads core scripts in order (config, diagnostics, supabase, auth boot, main router).
2) `app/core/boot-flow.js` starts boot tracking and error overlay hooks.
3) `app/supabase/index.js` exposes `window.AppModules.supabase` and emits `supabase:ready`.
4) `assets/js/boot-auth.js` sets initial auth state and UI overlay.
5) `assets/js/main.js` waits for Supabase API readiness, then binds auth watchers and module init.
6) Each module `init()` runs: cache DOM refs, bind events, and set safe defaults.
7) Auth state resolves; `afterLoginBoot` triggers the first refresh cycle.
8) The UI refresh pipeline runs (capture, doctor, charts, trendpilot) in a controlled order.

Notes:
- The boot order is about readiness, not speed. Modules may render placeholders until data is ready.
- Auth and storage readiness are prerequisites for any data sync.

---

## 3. Boot invariants (must always hold)
- Single Supabase client per tab.
- Auth state is authoritative and resolved before protected actions.
- IndexedDB is initialized before any `dataLocal` read or write.
- Modules do not force login; they request auth only when needed.

---

## 4. Module integration checklist (for new modules)
1) Add an `init()` entry point that is safe to call once on page load.
2) Cache DOM references inside `init()`; avoid DOM queries at module import time.
3) If the module uses Supabase data, wait for `supabase:ready` or `ensureModulesReady()`.
4) If the module uses local storage, call `initDB()` or `ensureLocalDb()` before access.
5) Use `requireSession()` only for user-triggered operations; do not hard-redirect at boot.
6) Emit a lightweight refresh hook (for example via `requestUiRefresh`) instead of manual cascades.
7) Add `diag.add` entries for critical boot or sync failures.

---

## 5. Common failure modes and fixes
- "IndexedDB not initialized": module accesses local storage before `initDB()`.
- Auth overlay flicker: auth state not known before UI initializes.
- Duplicate Supabase clients: multiple `createClient` calls without a shared inflight lock.
- Random refresh order: manual module refresh instead of `requestUiRefresh` pipeline.

---

## 6. Key files and ownership
- `assets/js/main.js`: main boot sequence, UI refresh orchestrator.
- `assets/js/boot-auth.js`: initial auth status and login overlay.
- `app/supabase/index.js`: Supabase API export and readiness signal.
- `app/supabase/core/client.js`: client creation and session persistence.
- `app/core/boot-flow.js`: boot diagnostics and error overlay.
- `app/core/diag.js`: boot logging and diagnostics.
- `index.html`: script order is part of the boot contract.

---

## 7. Related docs
- [Auth Module Overview](Auth Module Overview.md)
- [Supabase Core Overview](Supabase Core Overview.md)
- [Main Router Flow Overview](Main Router Flow Overview.md)
- [Diagnostics Module Overview](Diagnostics Module Overview.md)
- [Unlock Flow Overview](Unlock Flow Overview.md)
- [State Layer Overview](State Layer Overview.md)
- [Capture Module Overview](Capture Module Overview.md)
- [Hub Module Overview](Hub Module Overview.md)

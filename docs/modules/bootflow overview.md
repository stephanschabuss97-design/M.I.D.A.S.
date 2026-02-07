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
5) `assets/js/main.js` starts the deterministic stage pipeline (`BOOT -> AUTH_CHECK -> INIT_CORE -> INIT_MODULES -> INIT_UI -> IDLE`) and ensures diagnostics are ready early.
6) `AUTH_CHECK` resolves session + realtime readiness; module init remains deterministic and idempotent.
7) `IDLE` is reached before heavy non-critical warmups; first interaction is released as early as safely possible.
8) The initial heavy UI refresh (doctor/chart) runs post-`IDLE` in a guarded path so boot errors and lock state remain authoritative.

Notes:
- The boot order is about readiness, not speed. Modules may render placeholders until data is ready.
- Auth and storage readiness are prerequisites for any data sync.

---

## 3. Boot invariants (must always hold)
- Single Supabase client per tab.
- Auth state is authoritative and resolved before protected actions.
- IndexedDB is initialized before any `dataLocal` read or write.
- Modules do not force login; they request auth only when needed.
- Boot errors are reported through one central path (`bootFlow.reportError`) with normalized payload fields.
- Boot error diagnostics remain visible even if the diagnostics panel cannot be opened (fallback log in boot error panel).
- Boot error history keeps the last 3 normalized entries in `localStorage` for post-crash inspection (`bootFlow.getErrorHistory()`).
- Very-early boot errors before panel readiness are surfaced via a minimal plaintext fallback overlay (`#earlyBootErrorFallback`).
- Post-`IDLE` warmups are non-fatal by design: refresh failures are logged but do not re-enter boot failure state.
- PWA controller updates do not hard-interrupt early boot anymore; reload is deferred to `IDLE` with timeout fallback.

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
- "Touch-Log oeffnen does nothing": fixed by early diagnostics init + fallback renderer in boot error panel.
- "Diag hidden under milkglass": fixed by boot-error-specific z-index rule (`#diag` above `#bootScreen`).
- "IndexedDB not initialized" during early boot: mitigated by early `getUserId` guards and deterministic null-return on init-pending paths.
- "PWA reload interrupts boot": mitigated by boot-aware `controllerchange` handling (wait for `IDLE` first).

---

## 6. Key files and ownership
- `assets/js/main.js`: main boot sequence, UI refresh orchestrator.
- `assets/js/boot-auth.js`: initial auth status and login overlay.
- `app/supabase/index.js`: Supabase API export and readiness signal.
- `app/supabase/core/client.js`: client creation and session persistence.
- `app/core/boot-flow.js`: boot stage machine, central boot error reporting, fallback log rendering.
- `app/core/diag.js`: boot logging and diagnostics.
- `app/core/pwa.js`: update/install banner flow and boot-aware `controllerchange` reload strategy.
- `app/styles/base.css`: boot overlay and boot error fallback log styling.
- `app/styles/auth.css`: diagnostics panel layering/scroll behavior in boot error mode.
- `service-worker.js`: active PWA SW (cache versioning, app-shell-first navigate fallback, `SKIP_WAITING` flow).
- `index.html`: script order and boot error panel markup are part of the boot contract.

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

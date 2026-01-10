# Lazy Loading Roadmap (Module)

Goal: reduce boot work without changing app behavior by loading non-critical modules on demand.

## Scope
Lazy-load candidates and trigger rules:
- Doctor View: load when doctor panel opens.
- Charts: load on chart shortcut or when doctor panel opens and chart tab is active.
- Trendpilot: load when vitals window opens.
- Protein: load when vitals window opens; recalc after profile save.
- Activity: load when training tab opens.
- Assistant (Voice/VAD/Intent): load when assistant panel opens.
- Appointments: load when appointments panel opens.
- Diagnostics: load on debug flag in dev; avoid in prod unless explicitly enabled.

Out of scope (stay eager):
- Supabase Core, Auth, Main Router, State Layer, Hub, Capture, Intake, Medication.

## Phase 1: Inventory and triggers
- Map each module to its current boot entry point and stack owner.
- Define a single trigger per module (panel open, tab open, shortcut).
- Agree on default placeholders for first-load (simple "Lade..." states).

## Phase 2: Lazy-init contracts
- Each lazy module exposes a safe `init()` that can run once.
- Guard with an "initialized" flag and idempotent event binding.
- Ensure auth and storage readiness are prerequisites for any data sync.
- Keep module imports side-effect free (no DOM access or DB reads at import time).
- Add a shared lazy-loader contract with `status: idle/loading/ready/failed` and inflight dedupe.

## Phase 3: Integration
- Hub: gate panel opens to call the lazy loader if not initialized.
- Doctor stack: loads Doctor View; Charts optional based on tab.
- Vitals stack: loads Trendpilot/Protein on open; Activity on training tab.
- Assistant stack: loads Assistant/Voice/VAD/Intent on open.
- Appointments: load on panel open.

## Phase 4: Diagnostics and QA
- Touch-log entries for "lazy-init start/end".
- Basic QA checklist: first open, re-open, deep link open.
- Confirm no auth redirects or IndexedDB errors on first lazy init.
- Include "first panel ready" timing (not just boot timing).
- Define a retry path and user message for lazy-load failures.

## Acceptance criteria
- Boot time remains <= current baseline.
- All panels still open with correct data after first lazy load.
- No duplicate Supabase client warnings.
- No "IndexedDB not initialized" logs during lazy module init.
- No double event bindings on re-opened panels.
- Lazy-loaded modules degrade gracefully when offline (placeholder + retry).

## Notes
- This plan assumes existing stacks remain the organizing unit.
- Keep lazy loading minimal and driven by real bottlenecks.
- Be mindful of cache/versioning so lazy-loaded assets do not go stale after deploys.

# Deep Clean + Repo Audit Roadmap (Phase 6 + 6.5)

Goal:
- Clean up dead/legacy code without changing behavior.
- Consolidate logging to a predictable surface (diag/touch-log).
- Produce a deterministic audit so new chats can continue safely.

Scope:
- Frontend repo only (this repo).
- Remove only clearly dead code or legacy scaffolding that is no longer referenced.
- No feature work, no UX changes, no new flows.

Status (as of 2025-12-27):
- Module consolidation done; stacks are in place.
- Phase 6 and 6.5 from `docs/Voice Assistant roadmap.md` not executed yet.
- Some obvious dead code already removed (example: legacy assistant suggest card cleanup).

References (source of truth):
- `docs/Voice Assistant roadmap.md` (Phase 6 + 6.5 definitions)
- `docs/module-consolidation-roadmap.md`
- `docs/QA_CHECKS.md`
- `docs/modules/* Module Overview.md`

Current state (verified in code):
- Legacy fallbacks still exist:
  - Supabase globals (`app/supabase/index.js`) and some `global.SupabaseAPI` fallbacks.
  - Intake RPC legacy fallback logs in `app/supabase/api/intake.js`.
  - Legacy PIN hash path in `app/supabase/auth/guard.js`.
- TODOs remain in assistant UI modules (non-functional placeholders).
- UI umlaut fixes were applied for user-facing strings; remaining mojibake is in comments only.

Expected behavior:
1) No runtime behavior changes.
2) Only dead code is removed, after double-checking references.
3) Each step leaves clear notes so a new chat can continue safely.

-------------------------------------------------------------------------------
Phase 6 - Deep Cleanup & Refactor (safe, no behavior changes)

6.1 Logging pass (no logic changes)
- Collect all `console.*` in `app/` and classify:
  - A: user-impacting errors (keep via diag).
  - B: debug noise (move behind debug flag or remove).
  - C: legacy logs (remove).
- Replace only category B/C with `diag.add` or guard behind config flags.
- Do not remove logs needed for QA.

6.2 State/Guard hygiene (safe edits only)
- Identify redundant flags and guards.
- If a guard is duplicated, keep the safest one and remove the redundant check.
- Document each change with a short comment if needed.

6.3 Public API surface cleanup (no behavior change)
- List `window.*` / `AppModules.*` exports per module.
- Remove only exports that are not referenced anywhere in the repo.
- Keep legacy exports that are still used by `index.html` or hub hooks.

6.4 Dead helper sweep (safe removals only)
- Remove clearly unused helpers that are not referenced.
- Leave any helper with uncertain usage for Phase 6.5 classification.

Acceptance:
- No runtime errors after reload.
- No UX change from user perspective.
- All removals are backed by a reference check (`rg`).

-------------------------------------------------------------------------------
Phase 6.5 - Repo Audit & Dead Code Removal (deterministic)

6.5.1 Full repo scan (no edits)
- Walk folders: `/app`, `/assets`, `/docs`, `/sql`.
- For each file, mark:
  - A: active (referenced/imported).
  - B: questionable (unclear usage).
  - C: dead (no references, safe to delete).

6.5.2 Audit report
- Create `docs/REPO_AUDIT.md` with:
  - A/B/C list by folder.
  - "Safe to delete" list (C only).
  - "Needs decision" list (B).

6.5.3 Safe deletions (C only, explicit)
- Remove only C items after approval.
- Re-run `rg` to confirm no missing references.

6.5.4 Post-audit verification
- Smoke check: boot, login, doctor view, intake save.
- Confirm no new errors in console.

Acceptance:
- `docs/REPO_AUDIT.md` exists and is accurate.
- All C deletions are safe and documented.
- Behavior unchanged.

Notes for new chats:
- This roadmap is strict: no feature work, only cleanup.
- If unsure about a file, mark it as B and do not delete.
- Always confirm with `rg` before removing anything.

# PWA Implementation Roadmap

Goal:
- Deliver an installable PWA with stable login, predictable updates, and a minimal offline shell.
- Keep behavior identical to the current web app; only add PWA plumbing.

Scope:
- Manifest, icons, service worker, cache strategy, update flow, install UX.
- No business logic changes; no new features.

Status (as of 2025-12-28):
- Readiness checklist exists in `docs/PWA-TWA Readiness.md`.
- No PWA implementation yet.

References (source of truth):
- `docs/PWA-TWA Readiness.md`
- `docs/modules/bootflow overview.md`
- `docs/lazy-load-roadmap.md` (optional, if performance becomes an issue)
- `public/sw/README.md`
- `public/manifest-placeholder.json`

Current state (verified in repo):
- Placeholder manifest and SW folder exist.
- Boot flow is deterministic and persistent login is working in normal browser context.

Expected behavior:
1) App is installable and launches in standalone mode.
2) Session persists across app restarts (same as browser behavior).
3) Offline shows a cached shell with a clear message.
4) Updates are detected and can be applied without confusion.

-------------------------------------------------------------------------------
Phase 0 - Baseline decisions (done 2025-12-28)

0.1 Manifest decisions
- Confirm `start_url`, `scope`, display mode, colors, language.
- Decide on app name and short name.
Decisions:
- name: "Medical Incident and Data Analysis Software"
- short_name: "MIDAS"
- start_url: "/M.I.D.A.S./?source=pwa"
- scope: "/M.I.D.A.S./"
- display: "standalone"
- theme_color + background_color: "#121417"
- lang: "de"
- description: "Personal medical software for structured capture, analysis and review of medical incidents, daily health data and long-term trends."

0.2 Caching strategy
- Decide cache boundaries (app shell vs data).
- Decide offline fallback behavior.
Decisions:
- Precache app shell assets (HTML, CSS, core/module JS, manifest, icons).
- Runtime: network-first for Supabase/API; stale-while-revalidate for static assets.
- Offline: cached shell + explicit offline hint (no data caching).
- SW location: `/service-worker.js` (root) for GitHub Pages project site scope.

0.3 CSP alignment
- Confirm a CSP plan that does not block SW or manifest usage.
Decisions:
- Add `manifest-src 'self'` and `worker-src 'self'` to CSP.
- Keep `script-src 'self' https://cdn.jsdelivr.net` (no inline scripts in production).

0.4 Update flow decisions
- Update hint: non-blocking banner when a new SW is waiting.
- Apply update only after explicit user action (no auto-reload mid-session).

Acceptance:
- Documented decisions for manifest, caching, CSP, and update flow.

-------------------------------------------------------------------------------
Phase 1 - Manifest and icons (in progress)

1.1 Final manifest
- Replace placeholder with `public/manifest.json`.
- Include icons, display, scope, start_url, theme/background.
Status:
- `public/manifest.json` added with Phase 0 values (pending Lighthouse validation).
- `index.html` links the manifest and sets theme color.

1.2 Icons
- Add standard sizes and maskable icons.
- Validate icon rendering on Android.
Status:
- Initial icons generated from `assets/img/midas_symbol.png` (192/512 + maskable).

Acceptance:
- Manifest passes Lighthouse PWA checks.

-------------------------------------------------------------------------------
Phase 2 - Service worker core (in progress)

2.1 Registration
- Add SW registration (single entry point).
Status:
- `app/core/pwa.js` registers `/M.I.D.A.S./service-worker.js` on window load.

2.2 Cache shell
- Cache core assets (HTML, CSS, JS, fonts, icons).
- Provide offline fallback HTML.
Status:
- Not implemented yet (SW stub only).

2.3 Versioning
- Define cache naming and cleanup rules.

Acceptance:
- Offline loads a stable shell without errors.

-------------------------------------------------------------------------------
Phase 3 - Update flow ? (pending)

3.1 Update detection
- Detect new SW and surface a UI hint.

3.2 Apply update
- Decide between auto-reload or user-triggered refresh.

Acceptance:
- Update flow is predictable and does not cause data loss.

-------------------------------------------------------------------------------
Phase 4 - Install UX ? (pending)

4.1 Install prompt
- Optional: handle `beforeinstallprompt` to show a clean install CTA.

4.2 Install verification
- Ensure installed app uses standalone display and correct icon.

Acceptance:
- Install flow works on desktop and Android.

-------------------------------------------------------------------------------
Phase 5 - QA and release gate ? (pending)

5.1 QA checklist
- Install, launch, offline, update, re-open.
- Confirm session persistence across app restarts.

5.2 Rollout
- Define release notes and fallback plan.

Acceptance:
- PWA behaves stable in all primary scenarios.

-------------------------------------------------------------------------------
Follow-up:
- [TWA Implementation Roadmap](twa-implementation-roadmap.md)

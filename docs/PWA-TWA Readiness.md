# PWA / TWA Readiness

Purpose: define the exact prep work required so PWA/TWA can be implemented without surprises. When this checklist is complete, the PWA/TWA build can start immediately.

---

## 1. Scope and goals
- PWA: enable installable app behavior, offline strategy, and predictable updates.
- TWA: define Android wrapper structure and signing requirements.
- No feature changes: this is purely readiness and structure.

---

## 2. Preconditions (must already be stable)
- Persistent login works in normal browser context (session survives refresh/reopen).
- Boot flow is deterministic and documented.
- App works without inline scripts (CSP compatible), or a CSP plan exists.
- Critical modules do not rely on network at first paint (placeholders ok).

### Preconditions check (2025-12-28)
- [x] Persistent login stable (per current status).
- [x] Boot flow deterministic + documented (`docs/modules/bootflow overview.md`).
- [x] CSP plan exists; no inline scripts required (CSP updated for manifest/worker).
- [ ] First-paint network independence needs QA confirmation.

---

## 3. Required structure (repo)

| Path | Purpose | Status |
|------|---------|--------|
| `public/` | PWA assets root | ready |
| `public/sw/README.md` | service worker placeholder | ready |
| `public/manifest-placeholder.json` | temporary manifest | ready |
| `public/twa/Android/README.md` | TWA placeholder | ready |

TODO (must exist before implementation):
- [x] `public/manifest.json` (final manifest)
- [x] `public/img/icons/` (PWA icons: 192, 512, maskable)
- [ ] `public/img/splash/` (optional splash assets)
- [x] `public/sw/service-worker.js` (SW stub; cache logic pending)
- [x] `/service-worker.js` (root SW for GitHub Pages scope)

---

## 4. PWA readiness checklist (pre-implementation)
- [ ] Manifest finalized (name, short_name, start_url, scope, display, theme/background colors).
- [ ] Icons prepared (standard + maskable).
- [ ] Start URL and scope verified (no cross-origin redirects).
- [ ] CSP policy defined (no inline script blocks in production).
- [x] Offline strategy decided (network-first for navigation, cache-first for static assets).
- [ ] Update flow defined (how to handle SW update + user prompt).
- [ ] Storage behavior verified on mobile (login survives normal reopen).
- [ ] Deep link behavior confirmed (open specific panel from URL).

---

## 5. TWA readiness checklist (pre-implementation)
- [ ] Android package name chosen.
- [ ] Signing key strategy documented.
- [ ] Asset Links JSON planned (domain <-> package).
- [ ] TWA project skeleton defined (Bubblewrap/Gradle).
- [ ] Intent filters and launch URL confirmed.
- [ ] Play Store metadata checklist drafted.

---

## 6. QA readiness checklist (before release)
- [ ] PWA install + launch on desktop Chrome.
- [ ] PWA install + launch on Android Chrome.
- [ ] Session persistence across app restarts.
- [ ] Offline load behavior (at least cached shell).
- [ ] SW update flow (old version -> new version).
- [ ] TWA launch from app icon, no auth loop.
- [ ] Deep link opens correct panel.

---

## 7. Owner notes
- Keep the app lean: no lazy loading unless a real bottleneck appears.
- Prefer stability over micro-optimizations until after PWA/TWA is stable.
- Update this doc with concrete file paths once implementation starts.

---

## 8. Follow-up roadmap
- [PWA Implementation Roadmap](pwa-implementation-roadmap.md)

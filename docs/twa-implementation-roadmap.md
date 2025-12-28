# TWA Implementation Roadmap

Goal:
- Package the existing PWA as a Trusted Web Activity for Android.
- Keep the web app as the single source of truth.

Scope:
- Android wrapper, asset links, signing, Play Store readiness.
- No app logic changes; relies on the PWA build.

Status (as of 2025-12-28):
- PWA readiness checklist exists.
- No TWA implementation yet.

References (source of truth):
- `docs/PWA-TWA Readiness.md`
- `docs/pwa-implementation-roadmap.md`
- `public/twa/Android/README.md`

Current state (verified in repo):
- TWA placeholder folder exists; no Android project yet.

Expected behavior:
1) App launches full-screen without browser UI.
2) Same login/session behavior as the PWA.
3) Deep links open the correct panel.

-------------------------------------------------------------------------------
Phase 0 - Prerequisites ? (pending)

0.1 Domain and HTTPS
- Confirm production domain is stable and served over HTTPS.

0.2 Package identity
- Decide package name and application ID.
- Decide signing key ownership and storage.

Acceptance:
- Domain and package identity are locked.

-------------------------------------------------------------------------------
Phase 1 - Project skeleton ? (pending)

1.1 TWA project
- Generate skeleton (Bubblewrap or Gradle).
- Configure start URL and fallback URL.

1.2 Build pipeline
- Define build scripts and local run instructions.

Acceptance:
- TWA launches locally and loads the PWA.

-------------------------------------------------------------------------------
Phase 2 - Digital Asset Links ? (pending)

2.1 Asset links
- Create `/.well-known/assetlinks.json` for domain verification.

2.2 Verification
- Confirm asset links pass validation.

Acceptance:
- Domain is verified for the TWA package.

-------------------------------------------------------------------------------
Phase 3 - Signing and release ? (pending)

3.1 Release signing
- Create or import keystore.
- Set up versioning and signing config.

3.2 Release build
- Produce a signed release bundle.

Acceptance:
- Release build installs on test device.

-------------------------------------------------------------------------------
Phase 4 - Play Store readiness ? (pending)

4.1 Store assets
- Prepare screenshots, description, privacy policy.

4.2 Testing tracks
- Internal test and closed test setup.

Acceptance:
- TWA is ready for store submission.

-------------------------------------------------------------------------------
Phase 5 - QA and release gate ? (pending)

5.1 QA checklist
- Install, launch, login persistence, deep links.
- Update behavior aligns with PWA updates.

5.2 Rollout
- Define rollback strategy.

Acceptance:
- TWA meets stability requirements for release.

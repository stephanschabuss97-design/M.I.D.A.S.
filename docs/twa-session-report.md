# TWA Session Report (2025-12-28)

This document summarizes the TWA work done today, including the exact commands used, fixes for encountered errors, and how to update later. It is meant as a handover for a future session or another chat.

## Summary
- TWA project created with Bubblewrap in `twa/`.
- Package name set to `de.schabuss.midas`.
- Start URL set to `https://stephanschabuss97-design.github.io/M.I.D.A.S./`.
- Keystore generated and signing wired via `twa/keystore.properties`.
- Gradle build works with Java 17 + Android SDK from Bubblewrap.
- AAB built and uploaded to Play Console Internal Test (waiting on Google identity verification).

## Key decisions
- Project location: `twa/` (top-level).
- Signing: Play App Signing (Upload Key local, Release Key by Google).
- Bubblewrap CLI (not manual Gradle).
- Internal test only (not public release).

## Commands and steps (chronological)
1) Bubblewrap init (must run in CMD, not PowerShell):
```
cmd /c npx @bubblewrap/cli init --directory twa --manifest https://stephanschabuss97-design.github.io/M.I.D.A.S./public/manifest.json
```

2) Bubblewrap wizard inputs:
- Domain: `stephanschabuss97-design.github.io`
- URL path: `/M.I.D.A.S./`
- App name: `Medical Incident and Data Analysis Software`
- Short name: `MIDAS`
- Application ID: `de.schabuss.midas`
- Display mode: `standalone`
- Status bar color: `#121417`
- Splash color: `#121417`
- Icon URL: `https://stephanschabuss97-design.github.io/M.I.D.A.S./public/img/icons/icon-512.png`
- Maskable icon URL: `https://stephanschabuss97-design.github.io/M.I.D.A.S./public/img/icons/icon-512-maskable.png`
- Play Billing: `No`
- Geolocation: `No`
- Keystore: create new, alias `midas_upload`

3) Java 17 (Bubblewrap JDK) for Gradle:
```
set JAVA_HOME=C:\Users\steph\.bubblewrap\jdk\jdk-17.0.11+9
set PATH=%JAVA_HOME%\bin;%PATH%
```

4) Android SDK location (Bubblewrap SDK):
```
echo sdk.dir=C:\\Users\\steph\\.bubblewrap\\android_sdk> local.properties
```

5) Accept SDK licenses (needed once):
```
set ANDROID_SDK_ROOT=C:\Users\steph\.bubblewrap\android_sdk
set ANDROID_HOME=%ANDROID_SDK_ROOT%
%ANDROID_SDK_ROOT%\tools\bin\sdkmanager.bat --sdk_root=%ANDROID_SDK_ROOT% --licenses
```

6) Build APK/AAB (no daemon):
```
gradlew.bat --no-daemon assembleRelease
gradlew.bat --no-daemon bundleRelease
```
Output AAB:
`twa/app/build/outputs/bundle/release/app-release.aab`

## Code/config changes made
- `twa/app/build.gradle`
  - Added signing config loading from `twa/keystore.properties`.
  - Fixed `storeFile` path to resolve from project root.
- `twa/gradle.properties`
  - Added `org.gradle.vfs.watch=false` to avoid file watcher crashes.
- `.gitignore`
  - Added `*.keystore` and `twa/keystore.properties`.
- `twa/keystore.properties.example`
  - Example file for signing config (no real secrets).

## Common errors and fixes
- PowerShell blocked `npx`:
  - Use CMD: `cmd /c npx ...`
- Manifest URL returned HTML:
  - Use `/public/manifest.json` (not `/manifest.json`).
- Java 8 used by Gradle:
  - Set `JAVA_HOME` to Bubblewrap JDK 17.
- SDK not found:
  - Add `twa/local.properties` with `sdk.dir=...`.
- Licenses not accepted:
  - Run `sdkmanager --licenses`.
- Gradle daemon crashed (bad allocation):
  - Set `org.gradle.vfs.watch=false`.
- "App Bundles must be signed":
  - Ensure `twa/keystore.properties` exists (not just example).
  - Use `storeFile=android.keystore` (relative to `twa/`).

## Play Console steps (internal test only)
1) Create app in Play Console (App, Free, accept all declarations).
2) Use Internal Test track (do not request production).
3) Upload the AAB from `twa/app/build/outputs/bundle/release/`.
4) Add your own Google account as tester.
5) Roll out to Internal Testing and install via the test link.

## Play Console screens (quick map)
- App creation: name, language, app/free, accept declarations.
- Internal test release: upload AAB, add short release notes, save + review + roll out.
- Testers: add your own Google account, open the test link on Android.

## App Signing fingerprint (for assetlinks.json)
To create `public/.well-known/assetlinks.json`, you need the **App Signing SHA256**:
1) In Play Console: App > **Release** > **Setup** > **App integrity**.
2) Under **App signing key certificate**, copy **SHA-256**.
3) Use this SHA-256 in the asset links JSON.
4) After upload, verify: `https://stephanschabuss97-design.github.io/M.I.D.A.S./.well-known/assetlinks.json`

## Pending / next steps
- Asset Links JSON (requires App Signing SHA256 from Play Console):
  - Create `public/.well-known/assetlinks.json`.
  - Deploy to GitHub Pages.
  - Verify in Play Console.

## How to update the app later
1) Update the web app as usual (PWA side).
2) If manifest/icons changed, update Bubblewrap project as needed (or re-run update/init).
3) Increment versionCode/versionName in `twa/app/build.gradle`.
4) Build a new AAB:
```
cd C:\Users\steph\Projekte\M.I.D.A.S\twa
set JAVA_HOME=C:\Users\steph\.bubblewrap\jdk\jdk-17.0.11+9
set PATH=%JAVA_HOME%\bin;%PATH%
gradlew.bat --no-daemon bundleRelease
```
5) Upload the new AAB to the Internal Test release, add short release notes, roll out.

Note: Before each build, make sure `twa/keystore.properties` exists and contains the real passwords (it is ignored by git). The example file does not contain secrets.

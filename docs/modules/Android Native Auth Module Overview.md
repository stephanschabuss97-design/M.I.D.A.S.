# Android Native Auth Module - Functional Overview

Kurze Einordnung:
- Zweck: policy-konformer nativer Google-/Supabase-OAuth fuer den Android-Node inkl. Deep Link, Session-Owner, WebView-Handoff und Diagnosepfad.
- Rolle innerhalb von MIDAS: Android-spezifischer Auth-/Shell-Layer zwischen sicherem Browser-Login, nativer Session und MIDAS-WebView.
- Abgrenzung: kein Ersatz fuer den browser-first PWA-Login, keine eigene Fachlogik, kein zweites MIDAS-System.

Related docs:
- [Android Widget Module Overview](Android Widget Module Overview.md)
- [Auth Module Overview](Auth Module Overview.md)
- [Supabase Core Overview](Supabase Core Overview.md)
- [bootflow overview](bootflow overview.md)
- [Diagnostics Module Overview](Diagnostics Module Overview.md)

---

## 1. Zielsetzung

- Google-Login darf im Android-Node nicht mehr in einer eingebetteten `WebView` laufen.
- Android braucht deshalb einen eigenen nativen Login-Start ueber sicheren Browser-Kontext.
- Nach erfolgreichem Login soll Android:
  - die Session nativ halten
  - das Widget aktivieren koennen
  - die MIDAS-WebView kontrolliert in denselben fachlichen Auth-Zustand bringen
- Der bestehende Browser-/PWA-Login bleibt funktional unveraendert.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `android/app/src/main/java/de/schabuss/midas/MainActivity.kt` | nativer Launcher, Android-Bootstrap-UI, OAuth-Callback, Reentry-Owner |
| `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt` | MIDAS-WebView als Surface, nicht als Login-Surface |
| `android/app/src/main/java/de/schabuss/midas/web/NativeWebViewAuthBridge.kt` | Android -> WebView Bridge fuer Bootstrap-State und nativen Login-Request |
| `android/app/src/main/java/de/schabuss/midas/auth/AndroidAuthContract.kt` | Deep-Link-, Entry- und Callback-Vertrag |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeOAuthStarter.kt` | nativer OAuth-Start via `Custom Tabs` / externer Browser |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeAuthStore.kt` | finaler nativer Session-Source-of-Truth |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeAuthConfigStore.kt` | abgesicherter Bootstrap-Store fuer REST-/Supabase-/ANON-Konfiguration |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeSessionController.kt` | gemeinsamer Clear-Pfad fuer Android, Widget und WebView |
| `android/app/src/main/java/de/schabuss/midas/auth/SecurePreferencesFactory.kt` | `EncryptedSharedPreferences` + `MasterKey` |
| `android/app/src/main/java/de/schabuss/midas/MidasAndroidApp.kt` | globaler Android-App-Start + Crash-Hook |
| `android/app/src/main/java/de/schabuss/midas/diag/AndroidBootTrace.kt` | persistenter On-Device-Trace fuer Boot-/OAuth-/Crash-Diagnose |
| `app/core/android-webview-auth-bridge.js` | WebView-seitiger Android-Bootstrap-Layer |
| `app/supabase/auth/core.js` | offizieller Web-Auth-Core mit Android-Bootstrap-/Import-/Clear-Pfaden |
| `app/supabase/core/client.js` | kontextsensitiver Supabase-Client fuer Browser/PWA vs. Android-WebView |

---

## 3. Datenmodell / Storage

### 3.1 Native Session

`NativeAuthState` enthaelt unter anderem:
- `restUrl`
- `anonKey`
- `accessToken`
- `refreshToken`
- `userId`
- `sessionGeneration`
- `updatedAt`

### 3.2 Native Konfiguration

`NativeAuthConfigStore` haelt abgesichert:
- `restUrl`
- `supabaseUrl`
- `anonKey`

### 3.3 Source of Truth

- Android-seitig ist `NativeAuthStore` der Auth-Source-of-Truth.
- Die WebView ist im Android-Kontext kein gleichrangiger Auth-Owner.
- Der WebView-Client ist nur ein kontrollierter Mirror-/Arbeitskontext fuer MIDAS.

---

## 4. Ablauf / Logikfluss

### 4.1 Native Erstkonfiguration

- Frische Android-Installationen hinterlegen einmal:
  - REST-Endpoint
  - ANON-Key
- Diese Daten landen in `NativeAuthConfigStore`.
- Fehlende oder ungueltige Konfiguration blockiert nativen OAuth sauber mit explizitem Hinweis.

### 4.2 Login-Start

- `MainActivity` startet Google-/Supabase-OAuth nativ.
- Der sichere Browser-Kontext ist:
  - primaer `Custom Tabs`
  - fallback externer Standardbrowser
- Der Android-Node startet keinen Google-Login mehr in der eingebetteten WebView.

### 4.3 Callback / Session-Aufbau

- Android empfaengt den OAuth-Rueckweg ueber Deep Link.
- `MainActivity` verarbeitet den Callback und importiert die Session nativ.
- Die Session wird in `NativeAuthStore` geschrieben.
- Danach werden:
  - Widget-Sync
  - Widget-Refresh
  - Rueckweg in die MIDAS-WebView
  angestossen.

### 4.4 WebView-Handoff

- Die MIDAS-WebView bekommt Android-Bootstrap-State ueber `MidasAndroidAuth`.
- `app/core/android-webview-auth-bridge.js` staged:
  - Konfiguration
  - nativen Session-Zustand
  - Bootstrap-Metadaten
- Der eigentliche Web-Session-Import passiert kontrolliert im Web-Auth-Core.
- Die WebView startet dadurch naeher an einem kontrollierten Mirror-Kontext und nicht als eigenstaendiger Login-Owner.

### 4.5 Logout / Session-Clear

- `NativeSessionController` raeumt deterministisch:
  - native Session
  - Widget-Auth-Adapter
  - Widget-Snapshot
  - nativen Client-Cache
- Der Scheduler wird gestoppt.
- Eine offene MIDAS-WebView wird zum Web-Signout und Reload angestossen.
- `sessionGeneration` verhindert spaete Worker-Writes nach Logout.

---

## 5. Browser-/PWA-Abgrenzung

- MIDAS bleibt browser-first.
- Der stabile PWA-Google-Login ueber `signInWithOAuth(...)` bleibt fuer den echten Browser/PWA-Kontext unveraendert.
- Android besitzt einen separaten nativen Login-Start.
- Beide Pfade muessen in denselben fachlichen MIDAS-Session-Zustand muenden.

Wichtiger Guardrail:
- Android repariert keinen kaputten Browser-Login.
- Android loest nur das native `WebView`-/Secure-Browser-Problem.

---

## 6. WebView-Rolle

- `MidasWebActivity` ist MIDAS-Surface.
- Die WebView ist:
  - Anzeige- und Interaktionsflaeche
  - Android-gatet
  - Session-Mirror
- Die WebView ist nicht:
  - OAuth-Owner
  - policy-konformer Login-Container fuer Google

Der gemeinsame Login-Button wird deshalb im Android-WebView umgelenkt:
- Browser/PWA: normaler Web-Login
- Android-WebView: nativer Login-Request ueber Bridge

---

## 7. State- und Boot-Vertrag

- Android-Bootstrap-Status werden nicht nur geloggt, sondern im Web-Auth-Core als offizieller Auth-/Boot-Entscheid verwertet.
- Wichtige Status:
  - `empty`
  - `invalid-config`
  - `session-absent`
  - `session-staged`
  - `session-imported`
  - `session-import-error`
- `authDecisionMeta` im Supabase-State traegt diese Android-Boot-Entscheide sichtbar in den Web-Boot hinein.

Konsequenz:
- Android-Bootprobleme sollen nicht wie diffuse Loops wirken.
- Sie sollen als frueher, lesbarer Auth-/Boot-Zustand enden.

---

## 8. Sicherheits- und Persistenzvertrag

- Native Auth-/Bootstrap-Daten liegen ueber `EncryptedSharedPreferences` + `MasterKey` abgesichert.
- Fruehere Klartext-Eintraege werden bei Zugriff migriert und danach entfernt.
- `WidgetAuthStore` bleibt nur Adapter und ist kein zweiter finaler Auth-Speicher.

---

## 9. Diagnoseverhalten

- Android besitzt einen nativen Trace-/Crash-Pfad ueber `AndroidBootTrace`.
- Spuren werden im Download-Ordner des Geraets abgelegt:
  - `midas-android-latest-trace.json`
  - `midas-android-crash-YYYYMMDD-HHMMSS.json`
- `MainActivity` zeigt zusaetzlich:
  - den Speicherort der Trace-Datei
  - die letzte bekannte Trace-Summary

Damit hat der Android-Node einen sichtbareren On-Device-Diagnosepfad als frueher.

---

## 10. Events & Integration Points

- Android -> Browser/Custom Tab:
  - nativer OAuth-Start
- Browser/Custom Tab -> Android:
  - Deep-Link-Callback
- Android -> WebView:
  - Bootstrap-State
  - nativer Login-Request
  - Session-Clear
- Android -> Widget:
  - Scheduler
  - Snapshot-Refresh
  - Placeholder-Reset bei Logout

---

## 11. Erweiterungspunkte / Zukunft

- weniger manuelle Android-Erstkonfiguration fuer REST-/ANON-Daten
- spaeterer Komfortpfad fuer config import aus bestehendem MIDAS-Kontext
- weitere Huerdenreduktion im nativen Login-/Logout-UX
- moeglicher Split in noch kleinere Android-Overviews, falls Shell und Widget kuenftig weiter auseinanderlaufen

---

## 12. Status / Dependencies / Risks

- Status: umgesetzt und funktional bis zum erfolgreichen nativen Login-/Rueckweg gebracht; echter Geraete-Smoke bleibt weiterhin der relevante End-to-End-Test.
- Dependencies (hard):
  - Android Deep Link
  - `Custom Tabs` / externer Browser
  - Supabase Redirect-Konfiguration
  - `NativeAuthStore` / `NativeAuthConfigStore`
  - MIDAS-WebView-Bootstrap
- Dependencies (soft):
  - One UI / Task-Stack-Verhalten
  - Browser-/Account-Auswahlverhalten auf dem Geraet

Known risks:
- externer OAuth-Provider-/Redirect-Drift
- Android-Task-/Intent-Reentry bleibt komplexer als die PWA
- Android-WebView bleibt ein Mirror-Kontext und darf nicht wieder still zum zweiten Auth-Owner werden

---

## 13. Definition of Done

- Der native Android-Login ist sauber vom Browser-/PWA-Login getrennt dokumentiert.
- Deep Link, Session-Owner, WebView-Handoff, Clear-Pfad und Diagnosepfad sind ohne Reverse Engineering nachvollziehbar.
- Spaetere Chats koennen den Android-Auth-Layer getrennt vom Widget-Layer sicher uebernehmen.

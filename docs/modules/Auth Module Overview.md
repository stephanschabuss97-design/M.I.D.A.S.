# Auth Module - Functional Overview

Kurze Einordnung:
- Zweck: Authentifizierung, Session-Handling und Unlock-Guard fuer sensible Bereiche.
- Rolle innerhalb von MIDAS: steuert Login/Logout, Auth-State, Doctor-Unlock.
- Abgrenzung: keine Fachlogik; Auth liefert nur Status/Guard/Headers.

Related docs:
- [Bootflow Overview](bootflow overview.md)

---

## 1. Zielsetzung

- Problem: sichere Session-Verwaltung und geschuetzte Doctor-Ansicht.
- Nutzer: Patient (Login/Unlock) und System (Auth-Status).
- Nicht Ziel: Benutzerverwaltung ausserhalb Supabase.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `assets/js/boot-auth.js` | Boot-Entry fuer Auth-Status + Login-Overlay |
| `app/supabase/auth/core.js` | Auth-State, requireSession, watchAuthState, afterLoginBoot |
| `app/supabase/auth/ui.js` | Login-Overlay, Buttons, UI Hooks |
| `app/supabase/auth/guard.js` | Unlock-Flow (Passkey/PIN), `lockUi`, `requireDoctorUnlock` |
| `app/supabase/index.js` | Aggregiert Auth-Exports in SupabaseAPI |
| `app/supabase/core/http.js` | fetchWithAuth + Header-Cache + Refresh |
| `assets/js/main.js` | Binding/Guards im UI-Flow (requireSession, requireDoctorUnlock) |
| `index.html` | Login/Unlock Overlays + Buttons |
| `app/styles/auth.css` | Auth-Overlay Styles |

---

## 3. Datenmodell / Storage

- `supabaseState` (Runtime): `authState`, `lastLoggedIn`, `sbClient`, Header-Cache.
- `authGuardState` (Runtime): `doctorUnlocked`, `pendingAfterUnlock`.
- Supabase Auth speichert Session persistent im Browser (localStorage); Runtime-Status liegt in `supabaseState`.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- `boot-auth.js` setzt initialen Auth-Status und UI-Overlay.
- `watchAuthState()` registriert Supabase Auth Events.

### 4.2 User-Trigger
- Login ueber Supabase UI (Google/Mail).
- Doctor-Panel oeffnen -> `requireDoctorUnlock()`.

### 4.3 Verarbeitung
- `requireSession()` prueft Session und aktualisiert `authState`.
- `fetchWithAuth()` cached Auth-Header, refresh bei 401.
- `requireDoctorUnlock()` startet Passkey/PIN Flow.

### 4.4 Persistenz
- Session liegt im Supabase Client und wird persistent im Browser gehalten; im Frontend zusaetzlich Runtime-Status.

### 4.5 Browser- vs. Android-Kontext
- Der hier dokumentierte Standardpfad ist der browser-first MIDAS-Auth-Flow.
- Google-OAuth ueber `signInWithOAuth(...)` ist im echten Browser/PWA stabil und soll fuer den Web-Kontext nicht leichtfertig umgebaut werden.
- Ein nativer Android-Node kann einen separaten Login-Entry brauchen, wenn Provider-Richtlinien eingebettete `WebView`-Logins blockieren.
- Wichtig:
  - getrennte Login-Starts sind zulaessig
  - der fachliche Zielzustand bleibt gleich:
    - gueltige Supabase-Session
    - korrekter `authState`
    - normaler MIDAS-Boot nach erfolgreicher Anmeldung
- Finaler Android-Vertrag:
  - nativer OAuth-Start ueber sicheren Browser-Kontext
  - Deep-Link-Callback zur App
  - native Session als Android-Owner
  - Android-gateter Session-Import in die `WebView`
  - `WebView` ist MIDAS-Surface, nicht Login-Surface

---

## 5. UI-Integration

- Login-Overlay + Unlock-Overlay in `index.html`.
- `lockUi(true/false)` dimmt UI bei gesperrtem Bereich.

---

## 6. Arzt-Ansicht / Read-Only Views

- Doctor-Panel nur nach Unlock.
- Hub wartet auf `authGuardState` fuer Auto-Open nach Unlock.

---

## 7. Fehler- & Diagnoseverhalten

- Auth-Fehler via `diag.add` + Konsole (`[auth] ...`).
- Fehlende Session -> Login-Overlay.
- Unlock-Fehler -> UI bleibt gesperrt.

---

## 8. Events & Integration Points

- Public API / Entry Points: `requireSession`, `watchAuthState`, `afterLoginBoot`, `requireDoctorUnlock`.
- Source of Truth: `supabaseState` + `authGuardState`.
- Side Effects: Login-Overlay/UI-Flags, Doctor-Unlock Pending Actions.
- Constraints: Supabase Config erforderlich, authState `unknown` blockt bestimmte Flows.
- `watchAuthState` triggert `afterLoginBoot` + Module-Refresh.
- `authGuardState` wird von Hub/Doctor gelesen.
- `requestUiRefresh` wird nach Unlock genutzt (Chart/Doctor).
- Ein nativer Android-Node darf an diesem Vertrag auf Session-/State-Ebene andocken, nicht dadurch, dass der Browser-Login blind in einer `WebView` wiederverwendet wird.
- Android-Logout/Clear muss denselben Grundsatz wahren:
  - Auth-Zustand darf nicht nur optisch, sondern deterministisch ueber Session-, Widget- und WebView-Pfad geloescht werden.

---

## 9. Erweiterungspunkte / Zukunft

- MFA/Passkey Setup UI.
- Session-Timeout Hinweise.
- Offline/Read-Only Mode.

---

## 10. Feature-Flags / Konfiguration

- `DEV_ALLOW_DEFAULTS` fuer Demo/Dev.
- Supabase Config via `getConf`.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): Supabase Auth + `supabaseState`, Auth UI/Guard, Login/Unlock Overlays.
- Dependencies (soft): Passkey/MFA Ausbau.
- Known issues / risks: fehlende Supabase Config; `authState=unknown` blockt; Unlock-Flow kann haengen; Browser-OAuth darf nicht still in unzulaessige native `WebView`-Container gespiegelt werden.
- Backend / SQL / Edge: Supabase Auth.

---

## 12. QA-Checkliste

- Login/Logout funktioniert, Auth-State wechselt.
- Doctor-Unlock blockt/erlaubt korrekt.
- `fetchWithAuth` refresh bei 401.
- Login-Overlay erscheint bei unauth.

---

## 13. Definition of Done

- Auth-Flow stabil ohne Fehler.
- Unlock-Flow verifiziert.
- Dokumentation aktuell.


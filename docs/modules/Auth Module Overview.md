# Auth Module - Functional Overview

## Lokaler Supabase-Modernisierungsvertrag — produktive Gates offen

Der folgende Vertrag beschreibt den lokal implementierten Repositorystand.
Die produktive Backend-/Pages-Übernahme benötigt G3/G4; lokale Prüfungen
ersetzen keine Live-Acceptance. Android/APK, aktive Signingrotation und
Legacyabschaltung benötigen ihre eigenen Gates. Keine zusätzliche Modulrolle.

- Gemeinsamer Public-Keyleser akzeptiert `sb_publishable_` oder Legacy-JWT mit
  role=anon, niemals Secret-/Service-/Usertoken oder Whitespace. Ein altes
  Bearerpräfix wird ausschließlich beim Lesen normalisiert, beim UIwrite abgelehnt.
- Header benötigen aktuelle gültige nicht-anonyme Session; weder Header-/User-ID-
  Cache noch Fehler-/Timeoutfallback autorisieren. Refresh und alte Listener/
  Antworten bleiben an Client-/Headergeneration gebunden; Doctorunlock bleibt.
- UI-Konfigspeicherung hält eine frühe Writerfence, sichert das alte Paar,
  invalidiert den gespeicherten Key vor URLwrite und schreibt den neuen Key
  zuletzt. Fehler stellt das alte Paar in derselben sicheren Reihenfolge her;
  scheitert auch der Rückweg, gibt es kein gemischtes gültiges Konfigurationspaar. Generischer
  Fehlertext, keine Secret-/Token-/Rohfehlerwerte. Kein atomarer DB-Transaktions-
  oder Undo-Beweis für bereits abgesandte produktive Requests behauptet.
- F22: eine abgewiesene alte Antwort ist kein Logoutnachweis. Der HTTP-Recheck
  öffnet Login dafür nur bei frischer aktueller erfolgreicher Prüfung mit
  unbrauchbarer Session. Fehler/Timeout/weitere Kontextänderung bleiben unklar,
  ohne Cacheautorisierung, ohne alte Antwort und ohne Writewiederholung. Notes
  fordert bei unklarer Writeantwort eine Prüfung des Speicherstands. Echte
  Sessionverluste und definitive Authfehler bleiben gesperrt. Owner-Retest offen.



Kurze Einordnung:
- Zweck: Authentifizierung, Session-Handling und Unlock-Guard fuer sensible Bereiche.
- Rolle innerhalb von MIDAS: steuert Login/Logout, Auth-State, Doctor-Unlock.
- Abgrenzung: keine Fachlogik; Auth liefert nur Status/Guard/Headers.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Android Native Auth Module Overview](Android Native Auth Module Overview.md)

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
- `fetchWithAuth()` prüft aktuelle Session-/Konfigheader je Versuch; einmaliger Auth-Refresh bei 401/403, Cache allein berechtigt nicht.
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
  - Android-Bootstrap-Status werden im Auth-Core als offizieller Auth-/Boot-Entscheid verwertet
  - Android-Logout im Web-Kontext laeuft ueber denselben Auth-Core-Grundsatz statt ueber verteilte Blind-Clears
- Detailtiefe:
  - die Android-seitige Umsetzung von nativer Session, Deep Link, WebView-Handoff und Diagnosepfad ist separat dokumentiert in `Android Native Auth Module Overview`

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
- Der Auth-Core besitzt dafuer heute Android-spezifische Einstiege:
  - `prepareAndroidBootstrapAuthCheck()`
  - `applyAndroidBootstrapSession()`
  - `handleAndroidNativeSessionCleared()`

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
- Known issues / risks: fehlende Supabase Config; `authState=unknown` blockt; Unlock-Flow kann haengen; Browser-OAuth darf nicht still in unzulaessige native `WebView`-Container gespiegelt werden; Android darf im WebView nicht wieder zu einem zweiten gleichrangigen Auth-Owner driften.
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


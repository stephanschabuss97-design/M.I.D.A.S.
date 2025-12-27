# State Layer - Functional Overview

Kurze Einordnung:
- Zweck: zentrale In-Memory-States, Timer und Caches, die moduluebergreifend genutzt werden.
- Rolle innerhalb von MIDAS: stellt gemeinsame Flags/Status bereit (Capture, Doctor, Trendpilot, Charts, Supabase).
- Abgrenzung: keine Persistenz, keine Business-Logik, kein UI-Rendering.

---

## 1. Zielsetzung

- Problem: konsistente globale Zustandswerte fuer mehrere Module bereitstellen.
- Nutzer: System/Module (keine direkte Nutzerinteraktion).
- Nicht Ziel: Datenbank-Speicherung oder historisierte Logs.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/core/capture-globals.js` | Capture/Lifestyle Defaults, Timer, Helper, Intake-State |
| `assets/js/main.js` | UI-Refresh-State (Batching), Datums- und Reset-Flow |
| `app/modules/doctor-stack/doctor/index.js` | Scroll-Snapshot fuer Doctor-Ansicht |
| `app/modules/vitals-stack/trendpilot/index.js` | Trendpilot-Flags + latestSystemComment Cache |
| `app/modules/doctor-stack/charts/index.js` | Chart-Panel State (Meta, Tooltip, Trendpilot-Bands) |
| `app/supabase/core/state.js` | Supabase Runtime-State (Auth, Client, Header Cache) |
| `app/supabase/auth/guard.js` | authGuardState (Unlock/Doctor Gate) |

---

## 3. Datenmodell / Storage

- Kein persistenter Speicher, nur Runtime-Objekte.
- Zentrale Objekte:
  - `window.AppModules.captureGlobals` (Capture/Intake)
  - `supabaseState` (Auth/Client/Headers)
  - `uiRefreshState` (Refresh-Batching)
  - Modulinterne Caches (z. B. `chartPanel.currentMeta`, `latestSystemComment`).

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- `capture-globals` initialisiert Default-Werte und Timer-Refs.
- `supabase/core/state.js` initialisiert Auth/Client Status.
- Module laden ihre internen Caches lazy (z. B. Charts, Trendpilot).

### 4.2 User-Trigger
- Datumswechsel im Capture-Panel setzt `__lastKnownToday`, `__dateUserSelected`.
- Doctor-Overlay speichert Scroll-Position fuer Restore.
- `requestUiRefresh` in `assets/js/main.js` setzt Flags in `uiRefreshState`.

### 4.3 Verarbeitung
- Getter/Setter in `captureGlobals` sichern konsistente Werte.
- `uiRefreshState` bündelt Refresh-Gründe und resolvers.
- Trendpilot aktualisiert `latestSystemComment` und emittiert Events.

### 4.4 Persistenz
- Keine Persistenz (nur Memory).
- Persistenz findet in separaten Modulen (Supabase/RPC) statt.

---

## 5. UI-Integration

- Busy-Overlay via `captureGlobals.setBusy`.
- Pills/Status-Anzeigen lesen aus `captureIntakeState`.
- Chart-Panel liest aus `chartPanel.currentMeta` und related caches.

---

## 6. Arzt-Ansicht / Read-Only Views

- `__doctorScrollSnapshot` sichert die Position im Doctor-Panel.
- Report-Inbox nutzt lokalen Zustand (Filter/Range) in `doctor/index.js`.

---

## 7. Fehler- & Diagnoseverhalten

- Fehler werden in `diag.add` protokolliert.
- Policy: keine direkten Mutationen ohne Getter/Setter (Capture Globals).
- Guard: Auth/Unlock State kontrolliert Zugriff auf Doctor-Ansicht.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.captureGlobals`, `supabaseState`, `diag`/`perfStats`.
- Source of Truth: in-memory globals + module caches.
- Side Effects: steuert Refresh, Busy-States, Doctor scroll restore.
- Constraints: keine Persistenz, Zugriff nur ueber Helper/Getter.
- `requestUiRefresh` orchestriert Refresh von Doctor/Charts/Hub.
- `trendpilot:latest` Event signalisiert neue System-Kommentare.
- Supabase Auth State wird von mehreren Modulen gelesen.

---

## 9. Erweiterungspunkte / Zukunft

- Zentraler State-Store (typisiert) fuer weniger globale Variablen.
- Konsolidierte Timer-Verwaltung (ein Scheduler).
- State-Snapshots fuer Debugging.

---

## 10. Feature-Flags / Konfiguration

- `DEV_ALLOW_DEFAULTS` (Debug/Defaults).
- `chartPanel.SHOW_CHART_ANIMATIONS`, `chartPanel.SHOW_BODY_COMP_BARS`.
- Intake-Defaults: `LS_WATER_GOAL`, `LS_SALT_MAX`, `LS_PROTEIN_GOAL`.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): `captureGlobals`, `supabaseState`, `uiRefreshState`, Modul-Caches.
- Dependencies (soft): n/a.
- Known issues / risks: globale Mutable-States; stale Caches zwischen Modulen.
- Backend / SQL / Edge: n/a.

---

## 12. QA-Checkliste

- Datumswechsel -> Capture State aktualisiert.
- `requestUiRefresh` bündelt korrekt (keine Double-Calls).
- Doctor-Scroll-Position bleibt nach Refresh.
- Auth-Status in `supabaseState` wechselt korrekt (Login/Logout).

---

## 13. Definition of Done

- Zentrale States eindeutig dokumentiert.
- Keine direkten Mutationen ausserhalb definierter Helpers.
- Keine offenen Logs/Errors durch State-Handling.


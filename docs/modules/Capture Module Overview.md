# Capture Module - Functional Overview

Kurze Einordnung:
- Zweck: zentrale Eingabeoberflaeche fuer Tagesdaten (Intake, BP, Body, Lab, Training).
- Rolle innerhalb von MIDAS: Primaries Capture Panel, Quelle fuer Arzt-Ansicht und Reports.
- Abgrenzung: keine Analyse/Reports, kein Export, keine Charts.

---

## 1. Zielsetzung

- Problem: schnelle und konsistente Erfassung der taeglichen Werte.
- Nutzer: Patient (Eingabe) und System (persistente Datenbasis).
- Nicht Ziel: Visualisierung (Charts) oder Arzt-Ansicht (Read-Only).

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/vitals-stack/vitals/index.js` | Orchestrierung, Reset/Prefill, Panel-Logik |
| `app/modules/vitals-stack/vitals/bp.js` | BP-Validierung, Save-Flow, Kommentarpflicht |
| `app/modules/vitals-stack/vitals/body.js` | Body-Panel (Gewicht, Bauchumfang, Fett/Muskel) |
| `app/modules/vitals-stack/vitals/lab.js` | Lab-Panel (eGFR, Kreatinin, HbA1c, LDL, Kalium, CKD, Kommentar) |
| `app/modules/vitals-stack/vitals/entry.js` | Shared Entry-Helper (Base Entry) |
| `assets/js/main.js` | UI-Handler, Datum, Panel-Buttons, requestUiRefresh |
| `index.html` | Hub Vitals-Panel + Tabs (BP/Body/Lab/Training) |
| `app/styles/hub.css` | Hub/Capture Layout inkl. BP-Kontext Dropdown |
| `sql/11_Lab_Event_Extension.sql` | Lab-Event-Validierung + Trigger |
| `docs/modules/Intake Module Overview.md` | Intake-spezifische Details |

---

## 3. Datenmodell / Storage

- Tabelle: `health_events`
- Genutzte Types:
  - `bp_event` (BP + Kontext)
  - `body_event` (Gewicht, Bauchumfang, Fett/Muskel)
  - `lab_event` (Laborwerte + Kommentar)
  - `activity_event` (Trainingseintrag)
- Intake-Daten: siehe Intake-Modul.
- Zentrale Felder: `user_id`, `day`, `payload`.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Capture wird ueber Hub-Overlay geladen.
- Aktiv, sobald Boot-Flow `INIT_MODULES` erreicht.
- Auth-Guard blockt Saves ohne Login.

### 4.2 User-Trigger
- Auswahl des Datums im Vitals-Panel.
- Saves pro Tab (BP/Body/Lab/Training).
- Reset-Buttons leeren Panels.

### 4.3 Verarbeitung
- Validierungen pro Domain (BP Pflichtfelder, Lab Pflichtfelder, Activity Dauer > 0).
- Kontext-Handling fuer BP (Morgen/Abend).
- Prefill fuer Body-Letzwerte.

### 4.4 Persistenz
- BP/Body/Lab via Supabase API (REST/RPC, je Modul).
- Training via RPC `activity_add`.
- Nach Save: Reset, UI-Refresh, Diagnose-Logs.

---

## 5. UI-Integration

- Hub Vitals-Panel mit Tabs: BP, Body, Lab, Training.
- Datumsfeld oben als Single Source of Truth fuer Tagesdaten.
- Buttons und Pills im Capture-Panel (inkl. Trendpilot/Statusindikatoren).

---

## 6. Arzt-Ansicht / Read-Only Views

- Capture liefert nur Daten; Darstellung erfolgt in der Arzt-Ansicht.
- Range aus Arzt-Ansicht bestimmt, welche Capture-Daten gelesen werden.

---

## 7. Fehler- & Diagnoseverhalten

- Fehlerpfade loggen via `diag.add` + `uiError`.
- `setBusy` verhindert Doppelsaves.
- Auto-Refresh/Reset beim Datumswechsel (Mitternacht/Noon-Switch fuer BP-Kontext).

---

## 8. Events & Integration Points

- Public API / Entry Points: Hub-Vitals-Panel Buttons, `AppModules.capture` save helpers.
- Source of Truth: Datum `#date` + `captureGlobals` (dayIso, totals).
- Side Effects: `requestUiRefresh`, Trendpilot Hook, `activity:changed` Events.
- Constraints: Pflichtfelder pro Panel (BP/Lab/Activity), Auth-Guard fuer Saves.
- `requestUiRefresh` fuer Charts/Doctor/Hub-UI.
- `activity:changed` fuer Training.
- Trendpilot-Integration aus BP-Save.

---

## 9. Erweiterungspunkte / Zukunft

- Quick-Actions (z. B. +250 ml Intake).
- Weitere Lab-Werte oder Symptome.
- Zus. Vitals-Tabs (z. B. Medikamente).

---

## 10. Feature-Flags / Konfiguration

- `DEV_ALLOW_DEFAULTS` (Dev/Preview-Verhalten).
- Weitere Flags ueber `app/core/config.js`.

---

## 11. Status / Dependencies / Risks

- Status: aktiv (taegliche Erfassung).
- Dependencies (hard): BP/Body/Lab/Activity Module, `health_events`, Supabase APIs/RPCs, Lab-Validation SQL.
- Dependencies (soft): Trendpilot, Charts, Reports.
- Known issues / risks: falsches Datum; Teil-Saves pro Tab; Zeitzonen-Shift moeglich.
- Backend / SQL / Edge: `health_events`, `sql/11_Lab_Event_Extension.sql`, `sql/13_Activity_Event.sql`.

---

## 12. QA-Checkliste

- Datum wechseln -> Panels aktualisieren.
- BP/Body/Lab/Training speichern -> Daten erscheinen in Arzt-Ansicht.
- Pflichtfelder greifen (BP/Lab/Activity).
- Reset-Buttons leeren Felder.

---

## 13. Definition of Done

- Alle Capture-Tabs speichern ohne Errors.
- UI reagiert konsistent auf Datumsaenderung.
- Doku aktuell.


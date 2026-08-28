# Capture Module - Functional Overview

Kurze Einordnung:
- Zweck: zentrale Vitals-Eingabeoberflaeche für BP, Body und Lab.
- Rolle innerhalb von MIDAS: primäres Vitals-Capture-Panel, Quelle für Arzt-Ansicht und Reports; der bestehende Activity-V1-Writer bleibt Teil der Capture-Grenze, wird aber über die eigenständige Training-Produktfläche bedient.
- Abgrenzung: keine Analyse/Reports, kein Export, keine Charts.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Activity Module Overview](Activity Module Overview.md)

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
| `index.html` | getrennte Hub-Panels für Vitals (BP/Body/Lab) und Training |
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
- Intake-Daten: siehe Intake-Modul.
- Zentrale Felder: `user_id`, `day`, `payload`.
- Activity-V1-Daten und ihr RPC-Vertrag sind im Activity Module Overview
  dokumentiert; sie sind kein Vitals-Tab mehr.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Capture wird ueber Hub-Overlay geladen.
- Aktiv, sobald Boot-Flow `INIT_MODULES` erreicht.
- Auth-Guard blockt Saves ohne Login.

### 4.2 User-Trigger
- Auswahl des Datums im Vitals-Panel.
- Saves pro Vitals-Tab (BP/Body/Lab).
- Reset-Buttons leeren Panels.
- Training besitzt im eigenen Panel ein unabhaengiges Datum und ruft weiterhin
  den bestehenden Activity-V1-Writer auf.

### 4.3 Verarbeitung
- Validierungen pro Vitals-Domain (BP- und Lab-Pflichtfelder).
- Kontext-Handling fuer BP (Morgen/Abend).
- Prefill fuer Body-Letzwerte.

### 4.4 Persistenz
- BP/Body/Lab via Supabase API (REST/RPC, je Modul).
- Nach Save: Reset, UI-Refresh, Diagnose-Logs.
- Die eigenständige Training-Produktfläche schreibt in C3 weiterhin über
  den unveränderten Capture-/Activity-V1-RPC `activity_add`; es gibt kein
  Dual Write und keinen produktiven Activity-V2-Capture.

---

## 5. UI-Integration

- Hub Vitals-Panel mit Tabs: BP, Body, Lab.
- Das Vitals-Datumsfeld ist die Source of Truth nur für BP, Body und Lab.
- Das separate Training-Panel folgt direkt nach Vitals und besitzt sein eigenes
  Datumsfeld; Vitals-Datumswechsel beeinflussen Training nicht.
- Buttons und Pills im Capture-Panel (inkl. Trendpilot/Statusindikatoren).
- BP-Bereich enthaelt zusaetzlich einen Breath-Timer-Startpunkt (Vorbereitung vor Messung) mit Fullscreen-Overlay.

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
- Side Effects: `requestUiRefresh`, Trendpilot Hook.
- Constraints: Pflichtfelder pro Vitals-Panel (BP/Lab), Auth-Guard für Saves.
- `requestUiRefresh` fuer Charts/Doctor/Hub-UI.
- Activity-V1-Entry-Points und `activity:changed` gehoeren zum Activity-Modul;
  Capture behält dort nur seine Writer-Rolle.
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
- Dependencies (hard): BP/Body/Lab Module, `health_events`, Supabase APIs/RPCs, Lab-Validation SQL.
- Dependencies (soft): Trendpilot, Charts, Reports.
- Known issues / risks: falsches Datum; Teil-Saves pro Tab; Zeitzonen-Shift moeglich.
- Backend / SQL / Edge: `health_events`, `sql/11_Lab_Event_Extension.sql`.

---

## 12. QA-Checkliste

- Datum wechseln -> Panels aktualisieren.
- BP/Body/Lab speichern -> Daten erscheinen in Arzt-Ansicht.
- Pflichtfelder greifen (BP/Lab).
- Reset-Buttons leeren Felder.
- Vitals enthält keinen Training-Tab; Training-Datum und Vitals-Datum bleiben
  voneinander unabhaengig.

---

## 13. Definition of Done

- Alle Vitals-Capture-Tabs speichern ohne Errors.
- UI reagiert konsistent auf Datumsaenderung.
- Die Activity-V1-Persistenz bleibt unverändert und Activity V2 produktiv verborgen.
- Doku aktuell.


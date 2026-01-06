# Doctor View Module - Functional Overview

Kurze Einordnung:
- Zweck: Read-Only Uebersicht fuer Arzt/Patient im Arztmodus.
- Rolle innerhalb von MIDAS: Konsolidiert Tagesdaten, Trendpilot, Reports.
- Abgrenzung: keine Dateneingabe (ausser Delete/Report-Trigger), keine Charts-Logik.

Related docs:
- [Bootflow Overview](bootflow overview.md)

---

## 1. Zielsetzung

- Problem: medizinisch relevante Uebersicht fuer einen Zeitraum.
- Nutzer: Arzt oder Patient im Arztmodus.
- Nicht Ziel: Capture/Editing der Tageswerte.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/doctor-stack/doctor/index.js` | Render-Flow, Tabs, Trendpilot, Reports Inbox |
| `app/styles/doctor.css` | Layout/Stil der Arzt-Ansicht |
| `app/modules/hub/index.js` | Orbit/Panel-Open + Unlock-Flow |
| `app/supabase/api/vitals.js` | Tagesdaten (BP/Body) |
| `app/supabase/api/system-comments.js` | Trendpilot + Reports CRUD |
| `app/supabase/api/reports.js` | Edge Function Wrapper fuer Reports |
| `C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-monthly-report\index.ts` | Report-Aggregation (monthly/range) |

---

## 3. Datenmodell / Storage

- Tabelle: `health_events`
- Source of Truth: Supabase (IndexedDB nur Offline-Fallback).
- Reads:
  - Views: `v_events_bp`, `v_events_body`, `v_events_lab`, `v_events_activity`
  - `health_events` (Notes + system_comment fuer Trendpilot/Reports)
- Report-Subtypes:
  - `monthly_report`
  - `range_report` (Arzt-Bericht)
- Wichtige Payload-Felder:
  - `payload.subtype`, `payload.period`, `payload.summary`, `payload.text`, `payload.meta`

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Arzt-Panel wird ueber Hub-Overlay geoeffnet.
- Unlock-Guard (PIN/Fingerprint) blockt Zugriff.

### 4.2 User-Trigger
- Zeitraum waehlen (Von/Bis) + `Anwenden`.
- Tabs: BP, Body, Lab, Training, Inbox.
- Buttons: `Werte anzeigen` (Charts), JSON-Export, Report-Buttons.

### 4.3 Verarbeitung
- `renderDoctor` laedt Tagesdaten, Lab, Activity und Trendpilot aus Supabase.
- Range-Guard im Client: nur `#from/#to` wird gerendert.
- Offline: fallback auf lokale Daten (BP/Body/Notes/Lab), Training leer.
- Sortierung absteigend, Render in Domain-Karten.
- Scroll-Position wird gesichert und nach Refresh restored.

### 4.4 Persistenz
- Loeschen einzelner Domains ueber `deleteRemoteByType`.
- Reports via Edge Function, gespeichert als `system_comment`.
- Inbox-Loeschung entfernt alle Reports der Subtypes.

---

## 5. UI-Integration

- Arzt-Ansicht als Hub-Panel.
- Tabs: BP, Body, Lab, Training, Inbox (Overlay).
- Report-Inbox Overlay mit Filtern (Alle, Monatsberichte, Arzt-Berichte).
- Buttons: Neuer Monatsbericht, Neuer Arzt-Bericht, Inbox loeschen.

---

## 6. Arzt-Ansicht / Read-Only Views

- BP: Tageskarten mit Messreihen (morgens/abends) + Delete.
- Body: Tageskarten mit Gewicht/Bauchumfang/Fett/Muskel.
- Lab: Tageskarten mit Nieren- und Stoffwechselwerten + Kommentar.
- Training: Tageskarten mit Aktivitaet/Dauer/Notiz.
- Reports: Monatsbericht (Vormonat) und Arzt-Bericht (expliziter Zeitraum).

---

## 7. Fehler- & Diagnoseverhalten

- `logDoctorError` schreibt in `diag` + Konsole.
- UI-Fehler via `uiError`/Toast.
- Fallbacks: Placeholder bei fehlenden Daten/Range, Offline-Fallback ueber IndexedDB.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.doctor.renderDoctor`, `exportDoctorJson`, Inbox Buttons.
- Source of Truth: Range `#from/#to`, Daten via Supabase APIs (IndexedDB nur Offline).
- Side Effects: `requestUiRefresh`, delete actions, report generation.
- Constraints: Doctor Unlock required, Range muss gesetzt sein.
- `requestUiRefresh({ doctor: true })` nach Saves/Deletes.
- Trendpilot-Aktionen via `setSystemCommentDoctorStatus`.
- Report-Edge-Function ueber `generateMonthlyReportRemote`.
- JSON-Export: Supabase-Range-only (BP/Body/Lab/Training).

---

## 9. Erweiterungspunkte / Zukunft

- Patientenschreiben/PDF-Ausgabe.
- Zusaetzliche Filter (z. B. nur Tage mit Kommentaren).
- Report-Templates je Arztbedarf.

---

## 10. Feature-Flags / Konfiguration

- Unlock-Flow via Auth-Guard.
- Dev-Flags ueber `DEV_ALLOW_DEFAULTS` (Debug/Defaults).

---

## 11. Status / Dependencies / Risks

- Status: aktiv (Read-Only + Reports).
- Dependencies (hard): Supabase APIs (vitals/system-comments/reports), `midas-monthly-report` Edge, Unlock-Flow.
- Dependencies (soft): Charts, Trendpilot.
- Known issues / risks: grosse Ranges; Edge downtime; Deletes entfernen Daten; Report-Typ muss korrekt sein; Offline-Fallback nur Teilmenge.
- Backend / SQL / Edge: `health_events` (bp/body/lab/activity/system_comment), Edge `midas-monthly-report`.

---

## 12. QA-Checkliste

- Unlock-Flow funktioniert.
- BP/Body/Lab/Training laden fuer gewaehlten Zeitraum.
- Reports: monthly + range erzeugen, filtern, loeschen.
- Inbox loeschen entfernt alle Reports.

---

## 13. Definition of Done

- Arzt-Ansicht laedt fehlerfrei.
- Reports korrekt typisiert und sichtbar.
- Keine offenen Logs/Errors.
- Doku aktuell.


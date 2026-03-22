# Intake Module - Functional Overview

Kurze Einordnung:
- Zweck: taegliche Erfassung von Wasser/Salz/Protein samt Medication-Status im Hub.
- Rolle: Liefert Live-Tageswerte, Status-Pills, Medication-Progress und Low-Stock-Hinweise.
- Abgrenzung: Kein Langzeit-Reporting; Medikations-Stammdaten und Planlogik liegen im Medication Modul.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Push Module Overview](Push Module Overview.md)

---

## 1. Zielsetzung

- Patienten erfassen Fluessigkeit und Makros per Schnellbuttons und sehen sofortige Tagesfortschritte.
- Gleiche Oberflaeche zeigt Medication-Progress, Slot-Confirm/Undo und Low-Stock-Hinweise.
- Nichtziel: Historische Auswertungen oder automatisierte Benachrichtigungen; Fokus bleibt auf der aktuellen Tagesansicht.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/intake-stack/intake/index.js` | Fachlogik fuer Intake, Medication-Integration, Batch-/Slot-Aktionen, Timer, Warnungen |
| `app/core/capture-globals.js` | Shared State, Helper (`softWarnRange`, `setBusy`, Date Guards) |
| `app/supabase/api/intake.js` | RPC Wrapper (`loadIntakeToday`, `saveIntakeTotalsRpc`, `cleanupOldIntake`) |
| `app/modules/hub/index.js` | oeffnet Intake Panel, verschiebt Status-Pills in den Hub-Header |
| `app/modules/intake-stack/medication/index.js` | Medication-Datenquelle fuer Daily Flow und Low-Stock |
| `app/styles/hub.css` | Intake Cards, Grid, Pills, Medication- und Low-Stock-Styles |
| `docs/QA_CHECKS.md` | Testfaelle fuer Capture/Intake |

---

## 3. Datenmodell / Storage

- Tageswerte werden per Supabase RPC (`health_intake_today` View/Function) geladen und gespeichert.
- Felder: `water_ml`, `salt_g`, `protein_g`, `logged`.
- Weitere State-Infos (Trendpilot, Timer) leben clientseitig in `captureIntakeState`.
- Medikamentendaten stammen operativ aus `med_list_v2` und dem Cache des Medication Moduls.
- Relevante Medication-Felder im IN-Flow: `state`, `taken_count`, `total_count`, `slots[]`, `low_stock`, `days_left`, `with_meal`.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Orbit-Button `data-hub-module="intake"` triggert `openIntakeOverlay()`.
- `prepareIntakeStatusHeader()` verschiebt Pills in den Hub-Header.
- Beim Oeffnen ruft `refreshCaptureIntake()` sowohl `loadIntakeToday` als auch `refreshMedicationDaily()` auf.

### 4.2 User-Trigger
- Buttons `cap-*-add-btn` fuer Wasser/Salz/Protein inklusive Kombobutton Salz+Protein.
- `1x taeglich`-Medikation nutzt einen kompakten Status-Button im Kartenkopf.
- `>1x taeglich` zeigt direkte Slot-Buttons pro offenem oder bestaetigtem Slot.
- Batch-Footer arbeitet jetzt abschnittsbezogen:
  - `Alle Morgen-Medikamente genommen`
  - `Alle Mittag-Medikamente genommen`
  - `Alle Abend-Medikamente genommen`
  - `Alle Nacht-Medikamente genommen`
- Batch bestaetigt nur offene Slots des jeweiligen `slot_type`, nie mehr den ganzen Tag auf einmal.
- Low-Stock Box: `data-med-ack` plus globaler Mailto-Button.

### 4.3 Verarbeitung
- Numerische Werte werden validiert (`softWarnRange`, `toNumDE`).
- `captureIntakeState` haelt Tageswerte, `logged`-Flag und Trendpilot-Status.
- Medication-Listener reagiert auf `medication:changed` und `profile:changed`.
- Timer (`scheduleMidnightRefresh`, `scheduleNoonSwitch`) setzen Daily State zurueck.

### 4.4 Persistenz
- Intake Save: `saveIntakeTotalsRpc({ dayIso, totals })`, danach UI Refresh und `requestUiRefresh()`.
- Medication Read kommt ueber `loadMedicationForDay()` aus dem Medication Modul (`med_list_v2`).
- Slot-Aktionen laufen ueber `confirmMedicationSlot(...)` und `undoMedicationSlot(...)`.
- Abschnitts-Batch im IN-Tab dispatcht nur offene `slot_id`s je `slot_type`; die Tages-Sammelbestaetigung existiert produktiv nicht mehr.

---

## 5. UI-Integration

- Panel `#hubIntakePanel` mit Tabs **IN** (taeglicher Flow) und **TAB** (Medikationsverwaltung).
- IN-Tab: `.intake-card-grid` enthaelt Intake-Karten und Medication-Karten im identischen Stil.
- Unter dem Grid: Batch-Footer fuer offene Einnahmen, Status-Pills, Low-Stock Box.
- TAB-Tab wird vom Medication Modul gerendert und bleibt im selben Panel.

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine eigene Arztoberflaeche im Intake Panel.
- Doctor Panel konsumiert Intake Totals separat und ist nicht Teil dieses Moduls.
- Low-Stock Box zeigt Hausarztkontakt aus dem Profil als manuellen Mail-Shortcut.

---

## 7. Fehler- & Diagnoseverhalten

- `diag.add` Logs: `[capture] refresh`, `[capture] save error`, `[capture:med] ...`.
- UI-Feedback via `uiInfo`/`uiError` und Busy-States (`withBusy`).
- Offline-/RPC-Fehler lassen bestehende Werte unveraendert; Toast weist auf das Problem hin.
- Ohne Login werden Inputs disabled; die Low-Stock-Box zeigt einen klaren Login-Hinweis.

---

## 8. Events & Integration Points

- Public Entry Points: Intake-Panel Buttons, `refreshCaptureIntake`, Medication-Slot- und Batch-Buttons.
- Source of Truth: `captureIntakeState` plus Supabase Intake RPCs und Medication-Modul-Cache.
- Side Effects: `requestUiRefresh`, Intake- und Medication-Refresh.
- Hoert auf `medication:changed`, `profile:changed`, `supabase:ready`.
- Dispatcht Warnungen und Refreshes fuer angrenzende Module.

---

## 9. Erweiterungspunkte / Zukunft

- Zusaetzliche Makros im selben Grid.
- Historische Intake-Charts direkt im Hub.
- Reminder/Push-Integration, sobald der Kanal produktiv gebraucht wird.
- Custom-Ziele pro Nutzer statt fixer Grenzwerte.

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Flags; Intake Panel ist Teil des Hub.
- Timer und Warnschwellen sind aktuell hardcodiert.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): Intake RPCs (`health_intake_today`, `saveIntakeTotalsRpc`), `captureIntakeState`, Medication-Modul.
- Dependencies (soft): Profil-Hausarztkontakt (Mailto), Trendpilot.
- Known issues / risks: Timer-Resets, Offline-/RPC-Fehler, Medication-Snapshot Drift, Remote-Push-/Scheduler-Drift solange der externe Incident-Backend-Vertrag noch nicht im selben Repo mitgezogen ist.
- Backend / SQL / Edge: Intake RPCs/Views, Medication RPCs (`sql/12_Medication.sql`).

---

## 12. QA-Checkliste

- Save/Load Wasser/Salz/Protein inklusive Kombobutton fuer heute/gestern.
- Midnight-/Noon-Timer testen (State Reset, Pills aktualisieren).
- Medication `1x`-Fast-Path, `>1x`-Slot-Confirm/Undo und Low-Stock inklusive Profil-Aenderung des Hausarztkontakts.
- Offline-/RPC-Error Pfad (Toast, unveraenderte UI).
- Tab-Wechsel IN/TAB bewahrt Fokus und ARIA-States.

---

## 13. Definition of Done

- Panel oeffnet und schliesst ohne Fehler, Grid reagiert responsiv.
- Intake Saves persistieren serverseitig, Pills spiegeln Status.
- Medication-Progress und Low-Stock-Hinweise verhalten sich konsistent mit dem Medication-Modul.
- Dokumentation und QA sind aktualisiert, keine offenen `diag` Errors.

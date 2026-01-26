# Intake Module - Functional Overview

Kurze Einordnung:
- Zweck: taegliche Erfassung von Wasser/Salz/Protein samt Medikamentenstatus im Hub.
- Rolle: Liefert Live-Tageswerte, Status-Pills und Low-Stock-Hinweise.
- Abgrenzung: Kein Langzeit-Reporting (Charts uebernehmen), Medikamentenstammdaten liegen im Medication Modul.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Push Module Overview](Push Module Overview.md)

---

## 1. Zielsetzung

- Patienten erfassen Fluessigkeit & Makros per Schnellbuttons und sehen sofortige Tagesfortschritte.
- Gleiche Oberflaeche zeigt Medikamenten-Toggles (Confirm/Undo) samt Low-Stock-Hinweisen.
- Nichtziel: Historische Auswertungen oder automatisierte Benachrichtigungen - Fokus liegt auf der aktuellen Tagesansicht.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/intake-stack/intake/index.js` | Fachlogik fuer Intake, Medication-Integration (Batch/Selection), Timer, Warnungen |
| `app/core/capture-globals.js` | Shared State, Helper (`softWarnRange`, `setBusy`, Date Guards) |
| `app/supabase/api/intake.js` | RPC Wrapper (`loadIntakeToday`, `saveIntakeTotalsRpc`, `cleanupOldIntake`) |
| `app/modules/hub/index.js` | oeffnet Intake Panel, verschiebt Status-Pills in den Hub-Header |
| `app/modules/intake-stack/medication/index.js` | Datenquelle fuer IN-Batch, Low-Stock Box |
| `app/styles/hub.css` | Intake Cards, Grid, Pills, Low-Stock Styles |
| `docs/Medication Management Module Spec.md` | Kontext fuer Tablettenmanager |
| `docs/QA_CHECKS.md` | Testfoelle fuer Capture/Intake |

---

## 3. Datenmodell / Storage

- Tageswerte werden per Supabase RPC (`health_intake_today` View/Function) geladen und gespeichert.
- Felder: `water_ml`, `salt_g`, `protein_g`, `logged` Flag.
- Weitere State-Infos (Trendpilot, Timers) leben clientseitig in `captureIntakeState`.
- Medikamentendaten stammen aus `health_medications` (`med_list` RPC) - Intake konsumiert nur den Cache des Medication Moduls.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Orbit-Button `data-hub-module="intake"` triggert `openIntakeOverlay()`.
- `prepareIntakeStatusHeader()` verschiebt Pills in den Hub-Header.
- Beim oeffnen ruft `refreshCaptureIntake()` `loadIntakeToday` und `refreshMedicationDaily()` auf.

### 4.2 User-Trigger
- Buttons `cap-*-add-btn` fuer Wasser/Salz/Protein (+ Kombobutton Salz+Protein).
- Medikamenten-Checkboxen im IN-Tab setzen die Auswahl fuer Batch-Saves.
- Footer-Buttons: "Auswahl bestaetigen" (nur Auswahl) und "Alle genommen" (alle offenen).
- Status-Row nach Save zeigt Ergebnis und bietet "Rueckgaengig" fuer den letzten Batch (Timeout).
- Low-Stock Box: `data-med-ack` (Erledigt) + globaler Mailto-Button.

### 4.3 Verarbeitung
- Numerische Werte werden validiert (`softWarnRange`, `toNumDE`).
- `captureIntakeState` haelt Tageswerte, logged-Flag, Trendpilotstatus.
- Medication-Listener reagiert auf `medication:changed` und `profile:changed` (fuer Arztkontakt).
- Timer (`scheduleMidnightRefresh`, `scheduleNoonSwitch`) resetten State automatisch.

### 4.4 Persistenz
- Intake Save: `saveIntakeTotalsRpc({ dayIso, totals })`, danach UI Refresh + `requestUiRefresh()`.
- Medication Batch Save: fuer jedes ausgewaehlte Med `med_confirm_dose` via `AppModules.medication`, danach Refresh.
- Undo nutzt `med_undo_dose` fuer den letzten Batch.

---

## 5. UI-Integration

- Panel `#hubIntakePanel` mit Tabs **IN** (taeglicher Flow) und **TAB** (Medikationsverwaltung).
- IN-Tab: `.intake-card-grid` (1 Spalte Mobile, 2 Spalten Desktop) enthaelt Intake-Karten und Medikamentenkarten im identischen Stil.
- Unter dem Grid: Batch-Footer (Actions + Status), Status-Pills, Low-Stock Box (Hausarzt + Mailto + Items).
- TAB-Tab wird vom Medication Modul gerendert (Form + CRUD-Karten), bleibt im selben Panel.

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine eigene Arztoberfloeche im Intake Panel.
- Doctor Panel konsumiert Intake Totals separat (ueber `refreshCaptureIntake()`), nicht Teil dieses Moduls.
- Low-Stock Box zeigt Hausarztkontakt (aus Profil) und dient als manueller Mail-Shortcut.

---

## 7. Fehler- & Diagnoseverhalten

- `diag.add` Logs: `[capture] refresh`, `[capture] save error`, `[capture:med] ...`.
- UI-Feedback via `uiInfo`/`uiError` und Busy-States (`withBusy`).
- Offline/RPC-Fehler lassen bestehende Werte unveroendert; Toast weist auf Problem hin.
- Ohne Login werden Inputs disabled, Low-Stock Box blendet Hinweis oeBitte anmeldenoe ein.

---

## 8. Events & Integration Points

- Public API / Entry Points: Intake-Panel Buttons, `refreshCaptureIntake`, Medication Selection/Batch Buttons.
- Source of Truth: `captureIntakeState` + Supabase intake RPC.
- Side Effects: `requestUiRefresh`, Intake/Medication UI refresh.
- Constraints: Auth erforderlich fuer Save, Tages-Reset per Timer.
- Hoert auf `medication:changed`, `profile:changed`, `supabase:ready`.
- Dispatcht Trendpilot/Warnungen via `diag` + `requestUiRefresh` (fuer Lifestyle & andere Module).
- `document.dispatchEvent(new CustomEvent('medication:changed', ...))` stammt aus dem Medication Modul; Intake invalidiert Cache wenn noetig.

---

## 9. Erweiterungspunkte / Zukunft

- Zusoetzliche Makros (Kalorien, Kohlenhydrate) im selben Grid.
- Historische Intake-Charts direkt im Hub.
- Reminder/Push-Integration, sobald Benachrichtigungskanal vorhanden.
- Custom-Ziele pro Nutzer statt fixer Grenzwerte.

---

## 10. Feature-Flags / Konfiguration

- Keine Flags - Intake Panel ist immer Teil des Hub.
- Timer/Warnschwellen (z.oeB. Salzrange) aktuell hardcodiert.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): Intake RPCs (`health_intake_today`, `saveIntakeTotalsRpc`), `captureIntakeState`, Medication-Modul.
- Dependencies (soft): Profil-Hausarztkontakt (Mailto), Trendpilot.
- Known issues / risks: Timer-Resets; Offline/RPC-Fehler; Medication-Snapshot Drift.
- Backend / SQL / Edge: Intake RPCs/Views, Medication RPCs (`sql/12_Medication.sql`).

---

## 12. QA-Checkliste

- Save/Load Wasser/Salz/Protein (inkl. Kombobutton) fuer heute/gestern.
- Midnight/Noon Timer testen (State Reset, Pills aktualisieren).
- Medication Toggle + Low-Stock (inkl. Profiloenderung des Hausarztkontakts).
- Offline/RPC-Error Pfad (Toast + unveroenderte UI).
- Tab-Wechsel IN/TAB bewahrt Fokus und ARIA-States.

---

## 13. Definition of Done

- Panel oeffnet/ schlieoet ohne Fehler, Grid reagiert responsiv.
- Intake Saves persistieren serverseitig, Pills spiegeln Status.
- Low-Stock-Hinweise verhalten sich konsistent mit Medication Profilen.
- Dokumentation & QA aktualisiert, keine offenen `diag` Errors.


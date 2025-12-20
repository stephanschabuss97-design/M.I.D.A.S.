# Intake Module ? Functional Overview

Kurze Einordnung:
- Zweck: t?gliche Erfassung von Wasser/Salz/Protein samt Medikamentenstatus im Hub.
- Rolle: Liefert Live-Tageswerte, Status-Pills und Low-Stock/Sicherheits-Hinweise.
- Abgrenzung: Kein Langzeit-Reporting (Charts ?bernehmen), Medikamentenstammdaten liegen im Medication Modul.

---

## 1. Zielsetzung

- Patienten erfassen Fl?ssigkeit & Makros per Schnellbuttons und sehen sofortige Tagesfortschritte.
- Gleiche Oberfl?che zeigt Medikamenten-Toggles (Confirm/Undo) samt Low-Stock/Safety-Hinweisen.
- Nichtziel: Historische Auswertungen oder automatisierte Benachrichtigungen ? Fokus liegt auf der aktuellen Tagesansicht.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/capture/index.js` | Fachlogik f?r Intake, Medication-Integration, Timer, Warnungen |
| `app/core/capture-globals.js` | Shared State, Helper (`softWarnRange`, `setBusy`, Date Guards) |
| `app/supabase/api/intake.js` | RPC Wrapper (`loadIntakeToday`, `saveIntakeTotalsRpc`, `cleanupOldIntake`) |
| `app/modules/hub/index.js` | ?ffnet Intake Panel, verschiebt Status-Pills in den Hub-Header |
| `app/modules/medication/index.js` | Datenquelle f?r IN-Toggles, Low-Stock Box |
| `app/styles/hub.css` | Intake Cards, Grid, Pills, Low-Stock/Safety Styles |
| `docs/Medication Management Module Spec.md` | Kontext f?r Tablettenmanager |
| `docs/QA_CHECKS.md` | Testf?lle f?r Capture/Intake |

---

## 3. Datenmodell / Storage

- Tageswerte werden per Supabase RPC (`health_intake_today` View/Function) geladen und gespeichert.
- Felder: `water_ml`, `salt_g`, `protein_g`, `logged` Flag.
- Weitere State-Infos (Trendpilot, Timers) leben clientseitig in `captureIntakeState`.
- Medikamentendaten stammen aus `health_medications` (`med_list` RPC) ? Intake konsumiert nur den Cache des Medication Moduls.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Orbit-Button `data-hub-module="intake"` triggert `openIntakeOverlay()`.
- `prepareIntakeStatusHeader()` verschiebt Pills in den Hub-Header.
- Beim ?ffnen ruft `refreshCaptureIntake()` `loadIntakeToday` und `refreshMedicationDaily()` auf.

### 4.2 User-Trigger
- Buttons `cap-*-add-btn` f?r Wasser/Salz/Protein (+ Kombobutton Salz+Protein).
- Medikamenten-Toggles (`data-med-toggle`) best?tigen/undo Tagesdosen.
- Low-Stock Box: `data-med-ack` (Erledigt) + globaler ?Mail vorbereiten?-Button.
- Safety-Hinweis: `data-med-safety-goto` wechselt Datum zu gestern.

### 4.3 Verarbeitung
- Numerische Werte werden validiert (`softWarnRange`, `toNumDE`).
- `captureIntakeState` h?lt Tageswerte, logged-Flag, Trendpilotstatus.
- Medication-Listener reagiert auf `medication:changed` und `profile:changed` (f?r Arztkontakt).
- Timer (`scheduleMidnightRefresh`, `scheduleNoonSwitch`) resetten State automatisch.

### 4.4 Persistenz
- Intake Save: `saveIntakeTotalsRpc({ dayIso, totals })`, danach UI Refresh + `requestUiRefresh()`.
- Medication Confirm/Undo/Ack rufen die jeweiligen RPCs aus `AppModules.medication` auf; Intake wartet auf Promise und refresht Liste.

---

## 5. UI-Integration

- Panel `#hubIntakePanel` mit Tabs **IN** (t?glicher Flow) und **TAB** (Medikationsverwaltung).
- IN-Tab: `.intake-card-grid` (1 Spalte Mobile, 2 Spalten Desktop) enth?lt Intake-Karten und Medikamentenkarten im identischen Stil.
- Unter dem Grid: Status-Pills, Low-Stock Box (Hausarzt + Mailto + Items), Safety-Hinweis.
- TAB-Tab wird vom Medication Modul gerendert (Form + CRUD-Karten), bleibt im selben Panel.

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine eigene Arztoberfl?che im Intake Panel.
- Doctor Panel konsumiert Intake Totals separat (?ber `refreshCaptureIntake()`), nicht Teil dieses Moduls.
- Low-Stock Box zeigt Hausarztkontakt (aus Profil) und dient als manueller Mail-Shortcut.

---

## 7. Fehler- & Diagnoseverhalten

- `diag.add` Logs: `[capture] refresh`, `[capture] save error`, `[capture:med] ...`.
- UI-Feedback via `uiInfo`/`uiError` und Busy-States (`withBusy`).
- Offline/RPC-Fehler lassen bestehende Werte unver?ndert; Toast weist auf Problem hin.
- Ohne Login werden Inputs disabled, Low-Stock Box blendet Hinweis ?Bitte anmelden? ein.

---

## 8. Events & Integration Points

- Public API / Entry Points: Intake-Panel Buttons, `refreshCaptureIntake`, Medication Toggles.
- Source of Truth: `captureIntakeState` + Supabase intake RPC.
- Side Effects: `requestUiRefresh`, Intake/Medication UI refresh.
- Constraints: Auth erforderlich fuer Save, Tages-Reset per Timer.
- H?rt auf `medication:changed`, `profile:changed`, `supabase:ready`.
- Dispatcht Trendpilot/Warnungen via `diag` + `requestUiRefresh` (f?r Lifestyle & andere Module).
- `document.dispatchEvent(new CustomEvent('medication:changed', ...))` stammt aus dem Medication Modul; Intake invalidiert Cache wenn n?tig.

---

## 9. Erweiterungspunkte / Zukunft

- Zus?tzliche Makros (Kalorien, Kohlenhydrate) im selben Grid.
- Historische Intake-Charts direkt im Hub.
- Reminder/Push-Integration, sobald Benachrichtigungskanal vorhanden.
- Custom-Ziele pro Nutzer statt fixer Grenzwerte.

---

## 10. Feature-Flags / Konfiguration

- Keine Flags ? Intake Panel ist immer Teil des Hub.
- Timer/Warnschwellen (z.?B. Salzrange) aktuell hardcodiert.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): Intake RPCs (`health_intake_today`, `saveIntakeTotalsRpc`), `captureIntakeState`, Medication-Modul.
- Dependencies (soft): Profil-Hausarztkontakt (Mailto), Trendpilot.
- Known issues / risks: Timer-Resets; Offline/RPC-Fehler; Medication-Snapshot Drift.
- Backend / SQL / Edge: Intake RPCs/Views, Medication RPCs (`sql/12_Medication.sql`).

---

## 12. QA-Checkliste

- Save/Load Wasser/Salz/Protein (inkl. Kombobutton) f?r heute/gestern.
- Midnight/Noon Timer testen (State Reset, Pills aktualisieren).
- Medication Toggle + Low-Stock + Safety-Hinweis (inkl. Profil?nderung des Hausarztkontakts).
- Offline/RPC-Error Pfad (Toast + unver?nderte UI).
- Tab-Wechsel IN/TAB bewahrt Fokus und ARIA-States.

---

## 13. Definition of Done

- Panel ?ffnet/ schlie?t ohne Fehler, Grid reagiert responsiv.
- Intake Saves persistieren serverseitig, Pills spiegeln Status.
- Low-Stock/Sicherheits-Hinweise verhalten sich konsistent mit Medication Profilen.
- Dokumentation & QA aktualisiert, keine offenen `diag` Errors.


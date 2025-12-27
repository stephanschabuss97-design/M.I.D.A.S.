# Activity Module - Functional Overview

Kurze Einordnung:
- Zweck: manuelle Erfassung einer Trainingseinheit pro Tag (Aktivitaet + Dauer + Notiz).
- Rolle innerhalb von MIDAS: liefert Activity-Daten fuer Arzt-Ansicht und Berichte.
- Abgrenzung: kein Tracking, keine automatische Erkennung, keine Gamification.

---

## 1. Zielsetzung

- Problem: Aktivitaet soll bewusst und schnell als Tagesereignis erfasst werden.
- Nutzer: Patient (Eingabe) und Arzt (Read-Only-Auswertung).
- Nicht Ziel: Workout-Tracking, Schrittzaehler, Kalorien, Trainingsplaene.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/vitals-stack/activity/index.js` | Public API (load/add/delete) + RPC-Bridge |
| `assets/js/main.js` | UI-Handler, Validierung, Save/Reset-Flow |
| `index.html` | Training-Tab + Form im Vitals-Panel |
| `app/styles/hub.css` | Training-Panel Layout |
| `app/modules/doctor-stack/doctor/index.js` | Arztansicht: Training-Tab + Reports Inbox |
| `app/styles/doctor.css` | Training-Tab Layout in Arztansicht |
| `sql/13_Activity_Event.sql` | Typ-Constraint, View, RPCs |
| `docs/Training module spec.md` | Spezifikation & Roadmap |

---

## 3. Datenmodell / Storage

- Tabelle: `health_events`
- Type: `activity_event`
- Pflichtfelder: `user_id`, `day`, `payload`
- Payload:
  - `activity` (text, Pflicht)
  - `duration_min` (int, Pflicht, >= 1)
  - `note` (text, optional)
- Constraint: `unique (user_id, day, type)` -> genau ein Eintrag pro Tag
- View: `v_events_activity`
- RPCs: `activity_add`, `activity_list`, `activity_delete`

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul wird in `index.html` geladen.
- Kein Feature-Flag, immer aktiv.
- Auth-Guard via Supabase API (RPCs nur bei Login).

### 4.2 User-Trigger
- Training-Tab im Vitals-Panel.
- Button `Speichern` triggert `activity_add`.
- `Zuruecksetzen` leert die Felder.

### 4.3 Verarbeitung
- Client-Validierung: Aktivitaet Pflicht, Dauer >= 1.
- Event `activity:changed` bei add/delete/load.
- Fehler: diag + UI-Fehleranzeige.

### 4.4 Persistenz
- Speicherung per RPC `activity_add(day, payload)`.
- Datum kommt aus dem Haupt-Datum im Vitals-Panel.

---

## 5. UI-Integration

- Training-Tab im Vitals-Panel (Hub Overlay).
- Inline-Form: Aktivitaet, Dauer, Notiz.
- Kein separates Modal.

---

## 6. Arzt-Ansicht / Read-Only Views

- Training-Tab in der Arztansicht neben BP/Body/Lab.
- Spaltenlayout analog Body (Datum + Delete links, Werte rechts).
- Anzeige: Aktivitaet, Dauer (Min), Notiz.
- Berichte: Activity-Aggregation in Monatsbericht und Arzt-Bericht.

---

## 7. Fehler- & Diagnoseverhalten

- RPC-Fehler -> `diag.add` + UI-Error.
- Unvollstaendige Eingaben blockieren Save.
- Fehlende Daten -> Placeholder in der Arztansicht.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.activity.addActivity`, `loadActivities`, `deleteActivity`, Training-Tab Save.
- Source of Truth: `health_events` type `activity_event`, `day` aus Vitals-Datum.
- Side Effects: feuert `activity:changed`, resettet Felder nach Save.
- Constraints: genau ein Eintrag pro Tag, `duration_min >= 1`.
- Custom Event: `activity:changed`.
- Datumsaenderung im Vitals-Panel beeinflusst `day` beim Speichern.
- Report-Edge-Function nutzt Activity-Aggregation.

---

## 9. Erweiterungspunkte / Zukunft

- Aktivitaetskategorien, Intensitaet, Marker.
- Dynamischer Proteinrechner (Hook auf Activity-Count).
- Trend/Chart-Ansichten fuer Activity.

---

## 10. Feature-Flags / Konfiguration

- Keine spezifischen Flags.
- Nutzt bestehende Supabase-Konfiguration.

---

## 11. Status / Dependencies / Risks

- Status: aktiv (implementiert, im Capture/Doctor/Reports genutzt).
- Dependencies (hard): `health_events` + RPCs `activity_add/list/delete`, Vitals-Datum im Capture-Panel, Doctor-Training-Tab.
- Dependencies (soft): Report-Inbox/Edge-Function fuer Aggregation.
- Known issues / risks: nur 1 Eintrag pro Tag; falsches Vitals-Datum => falscher Tag; keine Uhrzeit.
- Backend / SQL / Edge: `sql/13_Activity_Event.sql`, Edge `midas-monthly-report` (Aggregation).

---

## 12. QA-Checkliste

- Aktivitaet speichern -> erscheint sofort.
- Dauer <= 0 blockiert.
- Ein Eintrag pro Tag enforced.
- Arztansicht listet Trainingseintraege korrekt.
- Berichte enthalten Activity-Aggregation.

---

## 13. Definition of Done

- Training-Tab speichert und rendert korrekt.
- Keine offenen Logs/Errors im Flow.
- Doku aktuell (Spec + Overview).


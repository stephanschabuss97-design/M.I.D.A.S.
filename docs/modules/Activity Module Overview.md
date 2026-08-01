# Activity Module - Functional Overview

Kurze Einordnung:
- Produktiver Stand: Activity V1 erfasst eine Trainingseinheit pro Tag
  (Aktivitaet + Dauer + Notiz).
- Activity-V2-Grundlage: R1-Semantik, R2-Datenbankvertrag und die isolierte
  R3-Draft-/Shell-Grundlage sind bereitgestellt; die sichtbare App und alle
  Consumer verwenden weiterhin V1.
- Rolle innerhalb von MIDAS: liefert Activity-Daten fuer Arzt-Ansicht und Berichte.
- Abgrenzung: kein Tracking, keine automatische Erkennung, keine Gamification.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Activity V2 Masterplan](../Future%20trainingsmodule%20update%20thoughts.md)
- [Activity V2 R1 Catalog Baseline](../MIDAS%20Activity%20V2%20R1%20Catalog%20Baseline%20Contract.md)
- [Activity V2 R1 Roadmap](<../archive/MIDAS Activity V2 R1 Semantics and Product Contract Roadmap (DONE).md>)
- [Activity V2 R2 Roadmap](<../archive/MIDAS Activity V2 R2 Unified Database and Commit API Roadmap (DONE).md>)
- [Activity V2 R2 Evidence](<../archive/MIDAS Activity V2 R2 Unified Database and Commit API Evidence (DONE).md>)
- [Activity V2 R3 Roadmap](<../archive/MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap (DONE).md>)

---

## 1. Zielsetzung des produktiven Activity V1

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
| `app/modules/doctor-stack/doctor/index.js` | Arztansicht: Training-Tab als sekundärer Drilldown |
| `app/styles/doctor.css` | Training-Tab Layout in Arztansicht |
| `sql/13_Activity_Event.sql` | Typ-Constraint, View, RPCs |
| `docs/archive/Training module spec.md` | Historische Spezifikation und Roadmap |
| `app/modules/vitals-stack/activity/v2/semantics.js` | Isolierter V2-Katalog, Validator, Normalisierung und lokale Suche |
| `app/modules/vitals-stack/activity/v2/semantics.contract.test.js` | Lokale R1-Contract-Tests |
| `app/modules/vitals-stack/activity/v2/semantics-harness.html` | Isolierter klassischer Browser-Ladenachweis |
| `app/modules/vitals-stack/activity/v2/data-access.js` | Isolierte R2-Commit- und Historienzugriffsschicht |
| `app/modules/vitals-stack/activity/v2/data-access.contract.test.js` | Lokale R2-Request-, Response-, Retry- und Fehler-Contract-Tests |
| `sql/20_Activity_V2.sql` | Additives R2-Schema, Katalogprojektion, RLS und RPCs |
| `sql/tests/20_Activity_V2_fixture.sql` | Guarded disposable PostgreSQL-17-Contract-Fixture |
| `app/modules/vitals-stack/activity/v2/session-draft.js` | Isolierte R3-In-Memory-Draft-Factory |
| `app/modules/vitals-stack/activity/v2/session-draft.contract.test.js` | Lokale R3-Draft-, Timer- und Mutations-Contract-Tests |
| `app/modules/vitals-stack/activity/v2/session-shell.js` | Isolierte R3-Vollflaechen-Shell und kontrollierte Iteminteraktionen |
| `app/modules/vitals-stack/activity/v2/session-shell.css` | Responsive R3-Shell- und Fokusdarstellung |
| `app/modules/vitals-stack/activity/v2/session-shell.contract.test.js` | Lokale R3-Shell-, Guard-, Fokus- und Lifecycle-Contract-Tests |
| `app/modules/vitals-stack/activity/v2/session-shell-harness.html` | Isolierter visueller R3-Browser-Harness |

---

## 2.1 Activity V2 R1 - isolierte Semantikgrundlage

Status: implementiert und getestet, aber nicht in die produktive
`index.html`-Script-Reihenfolge eingebunden.

- Source of Truth ist `midas.activity-catalog.v1` mit `catalog_version: 1`.
- Die freigegebene Baseline besitzt 78 aktive, planunabhaengige Eintraege.
- Historie orientiert sich spaeter am klassischen generischen `key`. Label und
  Aliase sind Anzeige beziehungsweise lokale Suchwege, keine zweite Identitaet.
- Studio, Hersteller, Geraetemodell sowie Geraete-, Hantel- und Griffvarianten
  erzeugen keine eigenen R1-Keys. `device_relative` verhindert falsche
  Lastvergleiche zwischen Maschinen, Studios oder Kabelzuegen.
- `strength_sets`, `duration` und `duration_distance` bestimmen gemeinsam mit
  den vollstaendigen Feldpolicies, welche Messwerte spaeter erfasst werden.
- `AppModules.activityV2.semantics` bietet tief eingefrorenen Katalogzugriff,
  exakten Key-Lookup, Normalisierung, Validierung und deterministische Suche.
- Suche bleibt lokal. Erst die spaetere bewusste Auswahl eines kanonischen Keys
  darf einen Historien-Lookup ausloesen.
- Activity V1, Supabase, DOM, Storage und produktive Events werden von R1
  weder gelesen noch veraendert.

R2 verwendet diese stabilen Keys und Messpolicies ohne eine zweite
Katalogsemantik zu erfinden.

## 2.2 Activity V2 R2 - produktive, noch unsichtbare Datenbasis

Status: produktiv bereitgestellt und lokal/disposable sowie durch produktive
Read-only-Postchecks bewiesen; nicht in die `index.html`-Script-Reihenfolge
oder einen sichtbaren Consumer eingebunden.

- `health_activity_catalog_entries` projiziert die 78 aktiven R1-Eintraege als
  unveraenderliche Katalogversion 1.
- `health_activity_sessions`, `health_activity_session_items` und
  `health_activity_item_sets` speichern abgeschlossene Historie normalisiert.
- `activity_v2_commit_session(uuid, jsonb)` validiert und schreibt eine
  vollstaendige Session atomar. Gleiche Request-ID und gleicher Inhalt liefern
  denselben Stand; ein anderer Inhalt unter derselben ID scheitert.
- `activity_v2_last_performance(text)` liefert ownergebunden den letzten
  vollstaendigen Item-Block oder `null`.
- Historische Tabellen sind fuer permanente authentifizierte User read-only;
  direkte Client-DML ist entzogen. Der Commit ist der einzige Schreibpfad.
- Anonymous-User werden trotz Supabase-Rolle `authenticated` durch den
  signierten Claim fail-closed abgewiesen.
- Die JS-Schicht registriert isoliert `AppModules.activityV2.dataAccess`, wird
  produktiv aber noch nicht geladen.
- Direkt nach dem Cutover stehen 78 Katalogzeilen und keine produktiven
  V2-Sessions, Items oder Saetze in der Datenbank.

## 2.3 Activity V2 R3 - isolierter Session-Draft und UI-Shell

Status: implementiert und lokal sowie im Browser-Harness getestet; weder durch
`index.html` geladen noch mit einem produktiven Consumer verbunden.

- `AppModules.activityV2.sessionDraft.create(...)` erzeugt einen lokalen Draft
  mit `draft_schema_version`, stabiler R2-`request_id`, aktueller
  `catalog_version`, `revision`, `started_at`, `note` und geordneten Items.
- Die Draft-Instanz stellt `getSnapshot`, `getTimerSnapshot`, `addItem`,
  `removeItem`, `moveItem`, `setNote` und `discard` bereit. Oeffentliche
  Snapshots sind gegen Aussenmutation geschuetzt.
- `AppModules.activityV2.sessionShell.mount(...)` liefert `open`, `render`,
  `requestClose`, `isOpen` und `destroy` fuer eine transaktional bereinigte,
  responsive Vollflaechen-Shell.
- Der kontrollierte Picker bezieht den aktuellen Katalog aus R1. Er erlaubt
  Hinzufuegen, Sortieren und Entfernen, aber keine R4-Suche oder freien Keys.
- Die Uhr startet beim ersten erfolgreich hinzugefuegten Item und wird aus
  `started_at` berechnet. Normaler App-/Tab-Wechsel erhaelt Draft und Laufzeit.
- Geaenderte Drafts besitzen einen gemeinsamen Close-/Escape-Verwerfungs-Guard;
  Fokus, Scroll-Lock und Listener werden beim Schliessen oder Fehler bereinigt.
- R3 verwendet weder Netzwerk noch Storage oder R2-RPCs und fuehrt keinen Save,
  Commit, Historien-Lookup oder Activity-V1-Cutover aus.

---

## 3. Datenmodell / Storage

### Activity V1 - sichtbarer Produktvertrag

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

### Activity V2 R2 - bereitgestellter Speichervertrag

- Katalogprojektion: `health_activity_catalog_entries`
- Historie: `health_activity_sessions` ->
  `health_activity_session_items` -> `health_activity_item_sets`
- Ownergrenze: `user_id`, zusammengesetzte Relationen, RLS und explizite ACLs
- Commit-RPC: `activity_v2_commit_session(uuid, jsonb)`
- Lookup-RPC: `activity_v2_last_performance(text)`
- Mehrere abgeschlossene Sessions pro Kalendertag sind erlaubt.
- R2 fuehrt keine Korrektur, Loeschung, Retention, UI oder Consumer-Migration ein.

### Activity V2 R3 - fluechtiger Draftvertrag

- Der Draft existiert ausschliesslich im Arbeitsspeicher und ist kein
  abgeschlossener R2-Datensatz.
- `request_id` und `catalog_version` sind bereits R2-kompatibel; Items besitzen
  eindeutige `item_key` und lueckenlose, einsbasierte `item_order`.
- Reload oder Browser-Prozessverlust darf R3 noch verlieren. R7 implementiert
  Recovery isoliert; R8 beweist sie intern auf Android-PWA vor realer Nutzung.

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

### 4.5 Isolierter R3-Harness

- Der Harness laedt R1-Semantik, R3-Draft und R3-Shell ausserhalb der App.
- Oeffnen, Picker, Itemreihenfolge, Notiz, Timer, Discard und Cleanup bleiben
  lokal; die produktive `index.html` und Activity V1 werden nicht beruehrt.

---

## 5. UI-Integration

- Training-Tab im Vitals-Panel (Hub Overlay).
- Inline-Form: Aktivitaet, Dauer, Notiz.
- Kein separates Modal.
- Die R3-Vollflaechen-Shell ist nur im isolierten Harness sichtbar und noch kein
  Bestandteil des Vitals-Moduls oder Training-Tabs.

---

## 6. Arzt-Ansicht / Read-Only Views

- Training-Tab in der Arztansicht neben BP/Body/Lab.
- Spaltenlayout analog Body (Datum + Delete links, Werte rechts).
- Anzeige: Aktivitaet, Dauer (Min), Notiz.
- Berichte: Activity-Aggregation im aktuellen Range-Arztbericht.

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

## Intent / Voice Integration

- Status:
  - Noch kein produktiver Intent-/Voice-Fast-Path.
  - Das Modul hat einen deterministischen UI-Save-Pfad, aber noch keinen freigegebenen Intent-Contract.
- Unterstuetzte Intents:
  - keine
- Voice Entry Points:
  - Derzeit keine produktiven Voice Entry Points.
- Allowed Actions:
  - keine
- Vorbefuellbare Parameter:
  - Derzeit keine produktiven Prefills oder Startparameter.
- Nicht erlaubte Operationen:
  - Keine freie Trainingssprache per Voice.
  - Kein Tracker-Start oder Save per Intent-/Voice-Fast-Path ohne separaten Contract.
  - Kein Umgehen der Tagesbindung oder des `unique (user_id, day, type)`-Vertrags ueber Schnellpfade.
- Hinweise / offene Punkte:
  - Produktiv existiert nur der UI-gebundene Save-Pfad ueber `addActivity(...)` im Vitals-Kontext.
  - Future Hook: vorbereiteter Tracker-Start oder kleine Vorbelegung erst nach separater Priorisierung und Guard-Klaerung.

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
- Activity V2 R1/R2/R3: Semantik, additive produktive Datenbasis sowie lokaler
  Draft und Vollflaechen-Shell sind implementiert. R3 bleibt isoliert; es gibt
  noch keinen produktiven UI-, Consumer- oder V1-Cutover.
- Dependencies (hard): `health_events` + RPCs `activity_add/list/delete`, Vitals-Datum im Capture-Panel, Doctor-Training-Tab.
- Dependencies (soft): Range-Arztbericht/Edge-Function fuer Aggregation.
- Known issues / risks: nur 1 Eintrag pro Tag; falsches Vitals-Datum => falscher Tag; keine Uhrzeit.
- Activity-V2-Risiko: normaler Tabwechsel ist fuer R3 bewiesen, Reload- und
  Prozess-Recovery bleiben bis R7/R8 bewusst gesperrt.
- Backend / SQL / Edge: `sql/13_Activity_Event.sql`, Edge `midas-monthly-report` (Aggregation).

---

## 12. QA-Checkliste

- Aktivitaet speichern -> erscheint sofort.
- Dauer <= 0 blockiert.
- Ein Eintrag pro Tag enforced.
- Arztansicht listet Trainingseintraege korrekt.
- Berichte enthalten Activity-Aggregation.
- Activity V2 R1 Contract-Suite validiert Katalog, Suche, Namespace und
  produktive Isolation.
- Isoliertes V2-Harness laedt `semantics.js` klassisch ohne Konsolenfehler.
- Kombinierte R1/R2/R3-Node-Suite validiert 50 Contract-Faelle.
- Disposable PostgreSQL-17-Fixture validiert Schema/Rerun, Katalog 78/78,
  atomaren Rollback, Retry-Races, Two-User-RLS/ACL und Historien-Lookup.
- Produktive Read-only-Postchecks validieren vier Tabellen, zwei RPCs,
  RLS/ACL/Owner/Search Path, 78 Katalogzeilen und leere V2-Historie.
- R3-Harness validiert Vollflaeche, Picker, Items, Notiz, Timer, Discard,
  Fokus und Overflow bei 1440x900, 390x844 und 320x800.
- Ein owner-freigegebener Edge-Smoke validiert nach 32 Sekunden im Fremdtab
  unveraenderte Items/Notiz und eine fortgeschrittene Zeitstempeluhr.

---

## 13. Definition of Done

- Training-Tab speichert und rendert korrekt.
- Keine offenen Logs/Errors im Flow.
- Activity V2 R1/R2/R3 bleiben bis zu den zustaendigen Folgeroadmaps fuer
  Consumer unverdrahtet. C2 ist der naechste Rolling-Wave-Schritt; R4 bleibt bis
  zu dessen Katalog-v2-Gate blockiert.
- Doku aktuell (Spec + Overview).


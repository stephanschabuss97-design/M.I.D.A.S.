# Activity Module - Functional Overview

Kurze Einordnung:
- Produktiver Stand: Activity V1 erfasst eine Trainingseinheit pro Tag
  (Aktivitaet + Dauer + Notiz).
- Activity-V2-Grundlage: R1-Semantik, R2-Datenbankvertrag, die isolierte
  R3-Draft-/Shell-Grundlage, C2-Katalogversion 2, R4-Suche/Last-Performance und
  der isolierte R5-Strength-Set-Editor sind bereitgestellt; die sichtbare App
  und alle produktiven Consumer verwenden weiterhin V1.
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
- [Activity V2 C2 Catalog Contract](<../MIDAS Activity V2 C2 Catalog Version 2 Contract.md>)
- [Activity V2 C2 Roadmap](<../archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap (DONE).md>)
- [Activity V2 C2 Evidence](<../archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Evidence (DONE).md>)
- [Activity V2 R4 Roadmap](<../archive/MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap (DONE).md>)
- [Activity V2 R5 Roadmap](<../archive/MIDAS Activity V2 R5 Strength Set Editor Roadmap (DONE).md>)
- [Activity V2 Catalog Maintenance Runbook](<../reference/activity-v2/Catalog Maintenance Runbook.md>)

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
| `app/modules/vitals-stack/activity/v2/data-access.js` | Isolierte R2-Commit- und Historienzugriffsschicht mit additiver R4-Semantikinjektion nur für Lookup |
| `app/modules/vitals-stack/activity/v2/data-access.contract.test.js` | Lokale R2-Request-, Response-, Retry- und Fehler-Contract-Tests |
| `sql/20_Activity_V2.sql` | Additives R2-Schema, Katalogprojektion, RLS und RPCs |
| `sql/tests/20_Activity_V2_fixture.sql` | Guarded disposable PostgreSQL-17-Contract-Fixture |
| `app/modules/vitals-stack/activity/v2/session-draft.js` | Isolierte R3/R5-In-Memory-Draft-Factory mit policy-gesteuerten Strength-Sets |
| `app/modules/vitals-stack/activity/v2/session-draft.contract.test.js` | Lokale R3/R5-Draft-, Timer-, Set- und Mutations-Contract-Tests |
| `app/modules/vitals-stack/activity/v2/session-shell.js` | Isolierte R3-R5-Vollflaechen-Shell mit Suche, read-only Historie, Strength-Editor und Raceguards |
| `app/modules/vitals-stack/activity/v2/session-shell.css` | Responsive R3-R5-Shell-, Such-, Historien-, Editor- und Fokusdarstellung |
| `app/modules/vitals-stack/activity/v2/session-shell.contract.test.js` | Lokale R3-R5-Shell-, Search-, Lookup-, Editor-, Guard-, Fokus- und Lifecycle-Contract-Tests |
| `app/modules/vitals-stack/activity/v2/session-shell-harness.html` | Isolierter visueller R5-Browser-Harness mit Policy-/Historien-Fixtures |
| `app/modules/vitals-stack/activity/v2/semantics-v2.js` | Additive C2-Semantik mit vollständigem Katalog v2 und Studio-/Freihantelsuche |
| `app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js` | C2-Katalog-, Search-, R1- sowie R3/R5-Kompatibilitätsnachweise |
| `sql/21_Activity_V2_Catalog_V2.sql` | Insert-only Projektion des unveränderlichen 80er-Katalog-v2-Snapshots |
| `sql/tests/21_Activity_V2_Catalog_V2_fixture.sql` | Guarded C2-Fixture für Re-Run, Drift-Fail und R2-Kompatibilität |
| `tools/activity-catalog.mjs` | Read-only Inspector für Katalogparität, Suche und spätere Pflege |

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
  mit Schema `midas.activity-session-draft.v2`, stabiler R2-`request_id`,
  aktueller `catalog_version`, `revision`, `started_at`, `note` und geordneten
  Items samt vollständigen Setrecords.
- Die Draft-Instanz stellt `getSnapshot`, `getTimerSnapshot`, `addItem`,
  `removeItem`, `moveItem`, `setNote`, `discard`, `addSet`, `removeSet` und
  `setSetField` bereit. Oeffentliche Snapshots sind gegen Aussenmutation
  geschuetzt.
- `AppModules.activityV2.sessionShell.mount(...)` liefert `open`, `render`,
  `requestClose`, `isOpen` und `destroy` fuer eine transaktional bereinigte,
  responsive Vollflaechen-Shell.
- Der kontrollierte Picker bezieht den injizierten aktuellen Katalog. Die
  additiv durch R4 ergänzte lokale Suche erlaubt ausschließlich kanonisches
  Hinzufuegen, Sortieren und Entfernen; freie Keys bleiben verboten.
- Die Uhr startet beim ersten erfolgreich hinzugefuegten Item und wird aus
  `started_at` berechnet. Normaler App-/Tab-Wechsel erhaelt Draft und Laufzeit.
- Geaenderte Drafts besitzen einen gemeinsamen Close-/Escape-Verwerfungs-Guard;
  Fokus, Scroll-Lock und Listener werden beim Schliessen oder Fehler bereinigt.
- R3 verwendet weder Netzwerk noch Storage oder R2-RPCs und fuehrt keinen Save,
  Commit, Historien-Lookup oder Activity-V1-Cutover aus.

## 2.4 Activity V2 C2 - vollständiger Studiokatalog v2

Status: implementiert, produktiv als unveränderlicher Katalogsnapshot
bereitgestellt und lokal, disposable sowie produktiv read-only bewiesen; noch
nicht durch `index.html` oder einen sichtbaren Consumer geladen.

- `catalog_version: 1` bleibt mit 78 Einträgen vollständig unverändert.
- `catalog_version: 2` enthält einen vollständigen Snapshot mit 80 aktiven
  Einträgen: alle 78 Baseline-Keys plus `high_row` und `total_abdominal`.
- 47 Aliasergänzungen an 24 bestehenden Keys bilden reale Studio-, Kurzhantel-,
  Langhantel- und Kettlebellbegriffe auf stabile Bewegungsidentitäten ab.
- Aliase ändern keine Historienidentität. Geräte- oder Hantelvarianten teilen
  weiterhin den klassischen Key; die konkrete Ausrüstung ist dadurch noch kein
  eigenes gespeichertes Satzmerkmal.
- 53 Studio-/Normalisierungsfälle und fünf Kompatibilitäts-/Limitfälle frieren
  Suche und Ranking ein. Alle Aliasergänzungen werden zusätzlich generisch auf
  eindeutige Normalisierung und Rang 1 geprüft.
- Der read-only Inspector erkennt vorhandene Übungen vor Planvorschlägen und
  meldet echte Lücken eindeutig. Spätere produktive Katalogsnapshots werden nie
  mutiert, sondern als neue vollständige `catalog_version` angelegt; das bleibt
  Activity V2 und erzeugt keine „Activity V3“.
- Produktiv stehen exakt 78 v1- und 80 v2-Zeilen; andere Versionen und
  v2-Sessionreferenzen sind 0. RLS, Policies, ACLs und R2-RPCs blieben
  unverändert.

## 2.5 Activity V2 R4 - lokale Suche und read-only letzte Ausführung

Status: implementiert und lokal sowie im isolierten Browser-Harness bewiesen;
weder durch `index.html` geladen noch mit einem produktiven Consumer verbunden.

- `loadLastPerformance(itemKey)` bleibt als v1-kompatibler Aufruf erhalten.
  Additiv akzeptiert ausschließlich der Lookup
  `loadLastPerformance(itemKey, { semantics })`; `commitSession` und seine
  Validierung blieben unverändert.
- Der angefragte Key wird gegen die ausgewählte aktuelle Semantik geprüft. Eine
  historische Antwort wird streng anhand ihrer gespeicherten Label-,
  Equipment-, Tracking-, Field-Policy- und Werte-Snapshots validiert und nicht
  gegen den heutigen Katalog umgeschrieben.
- Die Shell sucht synchron und requestfrei über
  `semantics.search(query, { limit: 8 })`. Nur ein kanonischer Katalogtreffer
  darf als `item_key` in den Draft gelangen; leere Suche, kein Treffer und
  Suchfehler bleiben getrennte lokale Zustände.
- Der optionale Mount-Callback `loadLastPerformance` startet erst bei einer
  sichtbaren offenen Shell. Ohne Callback funktioniert der bisherige R3-
  Consumer ohne Historienbereich weiter.
- Loading, keine Historie, Error und Success sind getrennt. Eine erfolgreiche
  Kraft-Historie zeigt den vollständigen, geordneten historischen Satzblock;
  Dauer, Distanz, Unterstützung und Notiz folgen ausschließlich den
  historischen Snapshots.
- Historie bleibt eine read-only Gedächtnisstütze. Sie erzeugt keine aktuellen
  Eingaben, keinen Erledigtzustand und keine Draftmutation.
- Lookupzustand und Cache sind flüchtig und außerhalb des Draftschemas. Pro Key
  gibt es höchstens einen automatischen Lookup je Shell-Mount; Fehler werden
  nur durch explizites Retry erneut geladen. Remove, Re-Add, Close, Guard und
  Destroy sind gegen verspätete Promise-Antworten abgesichert.
- R4 änderte weder SQL/RPC/RLS/ACL/Grants noch Storage, Save, Activity V1 oder
  den produktiven Scriptload.

## 2.6 Activity V2 R5 - policy-gesteuerter Strength-Set-Editor

Status: implementiert, lokal und im isolierten Browser-Harness bewiesen; weder
durch `index.html` geladen noch mit einem produktiven Consumer verbunden.

- Strength-Items erhalten genau drei leere Draftzeilen. Diese sind nur
  Eingabehilfen und behaupten keine ausgeführte Leistung; Non-Strength-Items
  behalten `sets: []` und einen neutralen Handoff.
- Jedes Set besitzt `set_order` sowie exakt `reps`, `duration_sec`, `distance_m`,
  `weight_kg` und `assistance_kg` als `null` oder auf 32 Codepoints begrenzten
  Rohtext. Sichtbar und mutierbar sind ausschließlich die von R1 erlaubten
  Felder der acht realen Strength-Policykombinationen.
- Der kontrollierte Parser akzeptiert ASCII-Ziffern sowie für Dezimalfelder
  Komma oder Punkt. Vorzeichen, Exponenten, Gruppierung, Whitespace, Rundung und
  Überschreitung der R1-Min/Max-/Dezimalgrenzen bleiben sichtbar ungültig.
- `empty`, `partial`, `complete` und `invalid` werden ausschließlich aus
  Feldpolicy und Eingaben abgeleitet. Vollständig leere Tails sind erlaubt;
  Teilzeilen oder Lücken müssen vor einem späteren Save korrigiert oder entfernt
  werden. Es gibt keine Checkbox, kein `completed_at` und keine Sonderrolle für
  Satz drei.
- Sets können innerhalb der unveränderten Grenze `1..50` hinzugefügt oder
  entfernt werden; `set_order`, Draftrevision, Rohwerte und Fokus bleiben
  deterministisch. Mutationsfehler rollen auf den stabilen Draft zurück;
  nachgelagerte Contractbrüche werden nicht als erfolgreiche UI-Korrektur
  kaschiert.
- Historische Sätze bleiben räumlich und technisch getrennte read-only
  Gedächtnisstützen. Success, Empty, Error/Retry oder verspätete Lookup-, Timer-
  und Backgroundsettlements befüllen aktuelle Inputs nie vor und überschreiben
  weder Rohwerte noch Fokus.
- Der Harness bietet `empty`, `policies`, `history` und `all`; Desktop,
  `390x844` und `320x800` sind ohne horizontalen Overflow oder Setüberlappung
  bewiesen, Touchziele bleiben mindestens 44 Pixel hoch.
- R5 ergänzt weder Save noch `commitSession`, SQL/RPC/RLS/Grants, Supabase-
  Write, Storage/IndexedDB, Activity V1, Produktnavigation oder Scriptload.

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
- C2 nutzt dieselbe Tabelle additiv: v1 bleibt 78, v2 ist ein vollständiger
  80er-Snapshot. Der Commit akzeptiert damit jetzt Katalogversion 2 als höchste
  Version; echte Sessionnutzung bleibt bis zu den späteren Gates gesperrt.

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

### 4.5 Isolierter R4-Harness

- Der Harness laedt C2-Semantik, R3-Draft und die R4-erweiterte Shell ausserhalb
  der App. Historie kommt aus lokalen deterministischen Success-, Empty-,
  Error- und Slow-Fakes; der reale RPC wird nicht aufgerufen.
- Oeffnen, lokale Suche, kanonische Auswahl, Historienanzeige, Itemreihenfolge,
  Notiz, Timer, Discard und Cleanup bleiben isoliert; die produktive
  `index.html` und Activity V1 werden nicht beruehrt.

---

## 5. UI-Integration

- Training-Tab im Vitals-Panel (Hub Overlay).
- Inline-Form: Aktivitaet, Dauer, Notiz.
- Kein separates Modal.
- Die R4-erweiterte Vollflaechen-Shell ist nur im isolierten Harness sichtbar und noch kein
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
- Activity V2 R1-R5/C2: Semantik, additive produktive Datenbasis, lokaler
  Draft/Vollflaechen-Shell, vollständiger Katalog v2, lokale Suche/read-only
  Historie und Strength-Set-Editor sind implementiert. Die V2-Runtime bleibt
  isoliert; es gibt keinen produktiven UI-, Consumer- oder V1-Cutover.
- Dependencies (hard): `health_events` + RPCs `activity_add/list/delete`, Vitals-Datum im Capture-Panel, Doctor-Training-Tab.
- Dependencies (soft): Range-Arztbericht/Edge-Function fuer Aggregation.
- Known issues / risks: nur 1 Eintrag pro Tag; falsches Vitals-Datum => falscher Tag; keine Uhrzeit.
- Activity-V2-Risiko: normaler Tabwechsel ist fuer R3-R5 bewiesen, Reload- und
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
- Kombinierte R1-R5/C2-Node-Suite validiert 81 Contract-Faelle.
- Disposable PostgreSQL-17-Fixture validiert Schema/Rerun, Katalog 78/78,
  atomaren Rollback, Retry-Races, Two-User-RLS/ACL und Historien-Lookup.
- C2-Checks validieren 80 aktive v2-Entries, 47 Aliasergänzungen, 58 Suchfälle,
  R1-/R3-Kompatibilität und vollständige Contract-/Runtime-/SQL-Parität.
- Produktive Read-only-Postchecks validieren vier Tabellen, zwei RPCs,
  RLS/ACL/Owner/Search Path, exakt 78 v1- und 80 v2-Katalogzeilen sowie leere
  V2-Historie.
- R4-Harness validiert Vollflaeche, lokale 8er-Suche, kanonische Auswahl, vier
  Historienzustaende, vollständige read-only Satzblöcke, Items, Notiz, Timer,
  Discard, Fokus und Overflow bei 1440x900, 390x844 und 320x800.
- Ein lokaler Browser-Smoke validiert nach 32 Sekunden im Fremdtab
  unveraenderte Items, Notiz und Historie, genau einen Lookup je Key und eine
  fortgeschrittene Zeitstempeluhr.
- R5-Checks validieren Draftschema v2, zehn Draftmethoden, acht reale
  Strength-Policies, drei leere Standardzeilen, Grenzen `1..50`, Rohtextparser,
  abgeleitete Zeilen-/Itemstates, Fokus-/Close-/Raceguards sowie vier lokale
  Harness-Fixtures. Zwei 31-Sekunden-Fremdtab-Smokes bewahren valide und
  intermediate Rohwerte, Zeilen, Fokus und Timer.

---

## 13. Definition of Done

- Training-Tab speichert und rendert korrekt.
- Keine offenen Logs/Errors im Flow.
- Activity V2 R1-R5/C2 bleiben bis zu den zustaendigen Folgeroadmaps fuer
  produktive Consumer unverdrahtet. R5 ist DONE; R6 ist der nächste
  Rolling-Wave-Schritt und darf weiterhin keinen produktiven V2-Cutover
  vorwegnehmen.
- Doku aktuell (Spec + Overview).


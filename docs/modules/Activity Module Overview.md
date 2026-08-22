# Activity Module - Functional Overview

Kurze Einordnung:
- Produktiver Stand: Activity V1 erfasst eine Trainingseinheit pro Tag
  (Aktivitaet + Dauer + Notiz).
- Activity-V2-Grundlage: R1-Semantik, R2-Datenbankvertrag, die isolierte
  R3-Draft-/Shell-Grundlage, C2-Katalogversion 2, R4-Suche/Last-Performance,
  R5-Strength-Set-Editor, R6-Duration-/Distance-Editor, R7-IndexedDB-Draft-
  Recovery, der isolierte R8-Commit-Core, der isolierte R9-History-/
  Lifecycle-Consumer und der produktiv installierte, aber nicht sichtbar
  verdrahtete R10-Coaching-Export sind bereitgestellt; die sichtbare
  App und alle produktiven Consumer verwenden weiterhin V1.
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
- [Activity V2 R6 Roadmap](<../archive/MIDAS Activity V2 R6 Duration and Distance Editor Roadmap (DONE).md>)
- [Activity V2 R7 Roadmap](<../archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Roadmap (DONE).md>)
- [Activity V2 R7 Evidence](<../archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Evidence (DONE).md>)
- [Activity V2 R8 Roadmap](<../archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Roadmap (DONE).md>)
- [Activity V2 R8 Evidence](<../archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Evidence (DONE).md>)
- [Activity V2 R9 Roadmap](<../archive/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Roadmap (DONE).md>)
- [Activity V2 R9 Evidence](<../archive/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Evidence (DONE).md>)
- [Activity V2 R10 Roadmap](<../archive/MIDAS Activity V2 R10 Completed Activity Coaching Export V1 Roadmap (DONE).md>)
- [Activity V2 R10 Evidence](<../archive/MIDAS Activity V2 R10 Completed Activity Coaching Export V1 Evidence (DONE).md>)
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
| `app/modules/vitals-stack/activity/v2/data-access.js` | Isolierte R2-Commit- und Historienzugriffsschicht mit additiver R4-Lookup- sowie expliziter R8-Commit-Semantikinjektion bei unverändertem v1-Default |
| `app/modules/vitals-stack/activity/v2/data-access.contract.test.js` | Lokale R2-Request-, Response-, Retry- und Fehler-Contract-Tests |
| `sql/20_Activity_V2.sql` | Additives R2-Schema, Katalogprojektion, RLS und RPCs |
| `sql/tests/20_Activity_V2_fixture.sql` | Guarded disposable PostgreSQL-17-Contract-Fixture |
| `app/modules/vitals-stack/activity/v2/session-draft.js` | Isolierte R3-R7-In-Memory-Draft-Factory mit strikter Draft-v3-Rehydration, policy-gesteuerten Strength-Sets und Itemwerten |
| `app/modules/vitals-stack/activity/v2/session-draft.contract.test.js` | Lokale R3-R7-Draft-, Restore-, Timer-, Set-, Item- und Mutations-Contract-Tests |
| `app/modules/vitals-stack/activity/v2/session-recovery.js` | Isolierte R7/R8-Recovery-Fassade mit Envelope-v1/v2-Lesen, Intent-/Attempt-CAS, Autosave, Quarantäne und Generationstombstone |
| `app/modules/vitals-stack/activity/v2/session-recovery.contract.test.js` | Disposable R7-IDB-, Envelope-, CAS-, Autosave-, Retry-, Conflict-, Lifecycle- und Discard-Contract-Tests |
| `app/modules/vitals-stack/activity/v2/session-recovery-harness.html` | Separater R7-Browser-Harness für bewusstes Recovery-Gate und reale IndexedDB-Fixtures |
| `app/modules/vitals-stack/activity/v2/session-shell.js` | Isolierte R3-R8-Vollflächen-Shell mit Suche, read-only Historie, Editoren, Recovery sowie Finish-/identischer Retry-Integration |
| `app/modules/vitals-stack/activity/v2/session-shell.css` | Responsive R3-R7-Shell-, Such-, Historien-, Editor-, Recovery-, Dialog- und Fokusdarstellung |
| `app/modules/vitals-stack/activity/v2/session-shell.contract.test.js` | Lokale R3-R7-Shell-, Search-, Lookup-, Editor-, Recovery-, Guard-, Fokus- und Lifecycle-Contract-Tests |
| `app/modules/vitals-stack/activity/v2/session-shell-harness.html` | Isolierter visueller R6-Browser-Harness mit Strength-, Duration-, Distance- und Historien-Fixtures |
| `app/modules/vitals-stack/activity/v2/semantics-v2.js` | Additive C2-Semantik mit vollständigem Katalog v2 und Studio-/Freihantelsuche |
| `app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js` | C2-Katalog-, Search-, R1- sowie R3-R6-Kompatibilitätsnachweise |
| `sql/21_Activity_V2_Catalog_V2.sql` | Insert-only Projektion des unveränderlichen 80er-Katalog-v2-Snapshots |
| `sql/tests/21_Activity_V2_Catalog_V2_fixture.sql` | Guarded C2-Fixture für Re-Run, Drift-Fail und R2-Kompatibilität |
| `tools/activity-catalog.mjs` | Read-only Inspector für Katalogparität, Suche und spätere Pflege |
| `app/modules/vitals-stack/activity/v2/session-commit.js` | Privater R8-Mapper und Commit-Coordinator mit tiefgefrorenem Intent, One-Promise-State-Machine und Known-/Unknown-/Replay-/Cleanup-Pfaden |
| `app/modules/vitals-stack/activity/v2/session-commit-harness.js` | Isolierter deterministischer R8-Browserharness mit echten Draft-/Recovery-/Commit-/Shellmodulen und Fault-/Race-Fixtures |
| `app/modules/vitals-stack/activity/v2/test-pwa/` | Nur lokal gebundene installierbare Test-PWA mit eigenem Worker-Scope; kein Produkt-Service-Worker |
| `sql/22_Activity_V2_Commit_Compatibility.sql` | Guarded R8-Replace des bestehenden Commit-RPC für vorhandene unveränderliche Katalogversionen |
| `sql/22_Activity_V2_Commit_Compatibility_Rollback.sql` | Separater owner-gateter exakter R8-zu-R2-Rollback nur für den Commit-RPC |
| `tools/activity-v2-r8-isolation.mjs` | Aggregierter Produkt-/V1-/Netzwerk-/Secret-/Recovery-Delete-Isolationsguard |
| `app/modules/vitals-stack/activity/v2/session-canonicalization.js` | Reine R9-Canonicalization des veränderlichen Sessioninhalts ohne Erstellungsidentität oder technische Child-UUIDs |
| `app/modules/vitals-stack/activity/v2/session-correction.js` | Isoliertes memory-only R9-Correction-Modell mit Snapshot-, Dirty-, Policy- und Dual-CAS-Vertrag |
| `app/modules/vitals-stack/activity/v2/session-history.js` | R9-History-/Detail-/Correction-/Delete-Controller mit Keyset-Pagination, Reconciliation und getrenntem Mutation-State |
| `app/modules/vitals-stack/activity/v2/session-history-shell.js` | Isolierter R9-Consumer für History, Snapshotdetail, Korrektur und Delete |
| `app/modules/vitals-stack/activity/v2/session-history-shell.css` | Responsive R9-History-/Dialog-/Statusdarstellung |
| `app/modules/vitals-stack/activity/v2/session-history-harness.html` | Lokaler deterministischer R9-Browserharness; kein Produktload |
| `sql/23_Activity_V2_History_Lifecycle.sql` | Additive R9-Revision sowie gehärtete List-/Detail-/Replace-/Delete-RPCs und privater Canonicalization-Helper |
| `sql/23_Activity_V2_History_Lifecycle_Rollback.sql` | Separater owner-gateter Deployment-Rollback nur vor sicher ausgeschlossener Lifecycle-Nutzung |
| `sql/tests/23_Activity_V2_History_Lifecycle_fixture.sql` | Guarded PostgreSQL-17-Fresh-/Rerun-/Drift-/Rollback-/Race-/Security-Fixture |
| `app/modules/vitals-stack/activity/v2/activity-coaching-export.js` | Reiner, tief eingefrorener R10-V1-/Range-/Preset-/Filename- und Responsevertrag |
| `app/modules/vitals-stack/activity/v2/activity-coaching-export-controller.js` | Isolierter R10-State-, Retry- und JSON-Download-Controller |
| `app/modules/vitals-stack/activity/v2/activity-coaching-export-shell.js` | Isolierte R10-Shell für Presets, Custom Range, Empty/Error/Retry und Download |
| `app/modules/vitals-stack/activity/v2/activity-coaching-export-harness.html` | Lokaler R10-Browserharness mit Fakeadapter und committed Fixture; kein Produktload |
| `sql/24_Activity_V2_Coaching_Export.sql` | Produktiv installierte additive read-only R10-Snapshotfunction mit exakten Guards und ACLs |
| `sql/24_Activity_V2_Coaching_Export_Rollback.sql` | Separater owner-gateter exakter Rollback nur für die R10-Exportfunction |
| `sql/tests/24_Activity_V2_Coaching_Export_fixture.sql` | Guarded PostgreSQL-17-Fixture für Exportvertrag, Security, Caps, Snapshotraces und Rollback |

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

- `AppModules.activityV2.sessionDraft.create(...)` erzeugt heute einen lokalen
  Draft mit Schema `midas.activity-session-draft.v3`, stabiler R2-`request_id`,
  aktueller `catalog_version`, `revision`, `started_at`, `note` und geordneten
  vollständigen Item- und Setrecords. R3 begründete diese flüchtige Form; R5 und
  R6 erweiterten sie kontrolliert.
- Die Draft-Instanz stellt `getSnapshot`, `getTimerSnapshot`, `addItem`,
  `removeItem`, `moveItem`, `setNote`, `discard`, `addSet`, `removeSet`,
  `setSetField` und `setItemField` bereit. Oeffentliche Snapshots sind gegen
  Aussenmutation geschuetzt.
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

## 2.7 Activity V2 R6 - policy-gesteuerter Duration-/Distance-Editor

Status: implementiert, lokal und im isolierten Browser-Harness bewiesen; weder
durch `index.html` geladen noch mit einem produktiven Consumer verbunden.

- Draftschema `midas.activity-session-draft.v3` führt pro Item exakt
  `item_key`, `item_order`, `duration_min`, `distance_km`, `note` und `sets`.
  `setItemField` ist die elfte Draftmethode; Move-, Note- und Set-Rebuilds
  erhalten den vollständigen Record.
- Die vier realen `duration`-Einträge `cross_trainer`, `football`, `jump_rope`
  und `stair_climber` verlangen `duration_min` und verbieten `distance_km`. Die
  sieben realen `duration_distance`-Einträge `cycling`, `hiking`, `rowing`,
  `running`, `ski_erg`, `swimming` und `walking` verlangen `duration_min` und
  erlauben `distance_km` optional. Beide Modi behalten exakt `sets: []`.
- `duration_min` akzeptiert kontrollierten Integer-Rohtext für `1..1440`;
  `distance_km` akzeptiert kontrollierten Dezimalrohtext für `0.01..1000` mit
  höchstens zwei Dezimalstellen. Komma und Punkt sind Eingabeformen; Rohtext
  bleibt bis zur späteren Commitintegration erhalten.
- Die gemeinsame optionale Itemnotiz führt `''` als `null`, ansonsten bis zu
  500 Codepoints exakten Rohtext. `empty`, `partial`, `complete` und `invalid`
  sind abgeleitete ungespeicherte Itemzustände; weder Intensitäts- noch RPE-,
  Progressions- oder Trainingsplanlogik wurde ergänzt.
- Die Sessionuhr misst weiterhin die gesamte Session. Manuelle Itemdauer ist
  eine unabhängige Eingabe und wird in keiner Richtung aus der Uhr abgeleitet.
- R4-Historie bleibt räumlich und technisch read-only und befüllt Dauer,
  Distanz oder Notiz niemals vor. R5-Strength-Sätze einschließlich
  `duration_sec` und `distance_m` bleiben unverändert.
- Draft-first Mutation, Reorder, Remove/Re-Add, Fokus, pending Closeguard,
  Background, Lookup-, Timer-, forged-target- und stale-settlement-Guards sind
  für gemischte Sessions bewiesen. Der Harness deckt vier Fixtures in drei
  Viewports ohne horizontalen Overflow ab; 320px-Touchziele sind mindestens
  44 Pixel hoch.
- R6 ergänzt weder Save noch `commitSession`, SQL/RPC/RLS/Grants, Supabase-
  Write, Netzwerk, Storage/IndexedDB, Activity V1, Produktnavigation oder
  Scriptload.

## 2.8 Activity V2 R7 - isolierte IndexedDB-Draft-Recovery

Status: implementiert, lokal und im separaten Browser-Harness mit realer
IndexedDB bewiesen; weder durch `index.html` geladen noch mit einem produktiven
Consumer verbunden.

- `sessionDraft.restore(snapshot, options?)` rehydriert ausschließlich den
  unveränderten Draft `midas.activity-session-draft.v3`. Identität, Revision,
  Startzeit, Reihenfolge und Rohwerte bleiben exakt; die Semantik wird über die
  gespeicherte `catalog_version` aufgelöst, nie still migriert.
- R7 verwendet ausschließlich `midas_activity_v2_recovery` Version 1 mit Store
  `session_recovery` und Slot `active_session`. `healthlog_db` Version 5 sowie
  deren Stores `entries` und `config` bleiben unverändert.
- Der Envelope `midas.activity-session-recovery.v1` hält Slotgeneration,
  Schreibsequenz, UUID-Lease-Token, Request-ID, persistierte Revision,
  Speicherzeit und Draft oder `null`. Diese Metadaten ändern Draft v3 nicht.
- Save und Discard vergleichen die vollständige geschützte Observation und
  gelten erst nach Transaktionscommit als bestätigt. Eine höhere Revision
  allein ist kein Schreibrecht.
- Autosave hält höchstens einen aktiven Write und nur den neuesten Pending-
  Snapshot. Echte Mutationen und expliziter Flush können nach Storagefehlern
  erneut sichern; `visibilitychange: hidden` und `pagehide` bleiben best effort.
- Bewusstes Verwerfen rotiert Token und Generation und schreibt einen leeren
  Tombstone. Alte Tabs können den Draft danach nicht wiederbeleben. Scheitert
  der persistente Discard, bleiben RAM-Draft, Shell und Eingaben offen.
- Das Recovery-Gate startet nie still. Gültige Drafts bieten Fortsetzen oder
  Verwerfen; unbekannte, beschädigte oder nicht auflösbare Zustände bleiben
  fail-closed und können nur bewusst observation-geschützt verworfen werden.
- Die bestehende Shell akzeptiert den Recoverycontroller nur optional. Status
  erscheint in einer eigenen polite Live-Region; Legacy-Mounts und der
  storagefreie R6-Harness bleiben unverändert.
- Der separate R7-Harness beweist Save/Reload/Continue, Tombstone/Reload,
  stale Writer, Konflikt, Lifecycle, Degradation, Alertdialog, Fokus,
  Desktop/Mobile, Touchziele, Overflow und saubere Browserkonsole.
- R7 ergänzt weder Supabase-Commit noch SQL/RPC/RLS/Grants, Netzwerk, Service
  Worker, Android-Prozess-Reclaim, Produktnavigation, Activity V1 oder
  produktiven Scriptload. R8 hat die Commitintegration geliefert; der reale
  Android-PWA-Device-Nachweis blieb dort bewusst unausgeführt.

## 2.9 Activity V2 R8 - isolierter Commit-Core und Katalogkompatibilität

Status: implementiert und lokal/disposable/im Browser bewiesen; SQL 22 ist
produktiv ausgeführt. Activity V2 bleibt ohne Produkt-Scriptload oder Consumer.
Der echte Android-Device-Prozess-Reclaim wurde auf Owner-Entscheidung nicht
ausgeführt und ist keine PASS-Evidence.

- `session-commit.js` projiziert den unveränderten Draft v3 exakt auf
  `midas.activity-session.v1`. Die Abschlussuhr wird einmal ausgewertet;
  `ended_at`, `duration_min`, Katalogversion, Reihenfolge und normalisierte
  Zahlen werden im tiefgefrorenen Commit-Intent nicht neu erzeugt.
- Recovery-Envelope v2 liest weiterhin v1. Der persistierte Intent und ein
  monotoner Attempt werden mit demselben Observation-CAS wie der Draft
  geschützt. Unbekannte oder beschädigte mögliche Commitzustände bleiben in
  Quarantäne und dürfen nicht verworfen werden.
- Der Coordinator hält genau eine lokale Finish-/Retry-Promise. Erst nach
  bestätigter Intent-Persistenz darf der Remoteversuch starten. Unknown sperrt
  Bearbeitung und erlaubt ausschließlich denselben Intent mit derselben
  `request_id` und Payload; bestätigter Commit oder Replay schreibt den
  Generationstombstone.
- Die Shell injiziert den Coordinator nur in der isolierten Activity-V2-
  Laufzeit. Activity V1 bleibt der einzige produktive Consumer; es gibt weder
  Dual-Write noch Produktnavigation oder Produkt-Service-Worker-Load.
- SQL 22 ersetzt ausschließlich den vorhandenen Commit-RPC. Ein neuer Commit
  darf jede vorhandene unveränderliche Katalogversion verwenden; identischer
  Replay bleibt idempotent. Tabellen, Katalogzeilen, RLS, Policies, Owner und
  ACLs bleiben unverändert.
- Die lokale Test-PWA hat einen eigenen Worker-Scope. Android Debug verwendet
  `de.schabuss.midas.activityv2test`, localhost und Cleartext nur im Debug-
  Merge; Release bleibt `de.schabuss.midas` mit Produkt-URL und ohne
  Cleartextfreigabe.
- Bewiesen sind 179/179 Contracts, 21/21 Syntaxchecks, Katalog
  `2/80/47/58`, der aggregierte Isolationsguard, PostgreSQL-17-Full-Fixture,
  Browser-Unknown/Retry/Reload/Offline/Races und produktive SQL-22-
  Postconditions mit leerer V2-Historie. Nicht bewiesen sind der reale
  Android-Prozess-Reclaim und ein abschließender CodeRabbit-Null-Lauf.

## 2.10 Activity V2 R9 - isolierte Sessionhistorie und Lifecycle

Status: implementiert und lokal, im Browser sowie disposable bewiesen; SQL 23
ist produktiv ausgeführt und read-only nachgeprüft. Der R9-Client bleibt ohne
Produkt-Scriptload oder sichtbaren Consumer.

- Die Historie verwendet begrenzte Keyset-Pagination über `(started_at, id)`
  statt Offset oder unbegrenzter Reads. Details werden ausschließlich aus den
  gespeicherten Session-, Item- und Set-Snapshots aufgebaut.
- Korrektur ersetzt den vollständigen veränderlichen Inhalt atomar. `id`,
  `user_id`, `request_id`, `request_fingerprint`, `started_at`, `day`, `title`,
  `created_at` und die ursprüngliche Katalogversion bleiben unverändert.
- `revision` wird als Dezimalstring transportiert. Revision und ein aus dem
  kanonischen veränderlichen Inhalt abgeleiteter Fingerprint bilden gemeinsam
  den CAS gegen Lost Updates und uneindeutige Replays.
- Neue Items einer Korrektur dürfen nur aus der ursprünglichen Katalogversion
  stammen; vorhandene Snapshots bleiben historisch erhalten. Technische Item-
  und Set-UUIDs sind keine stabile fachliche Identität.
- Delete ist ein bewusst bestätigter, ownergebundener und wiederholsicherer
  Hard Delete mit FK-Cascade. Ein DDL-Rollback stellt gelöschte Sessions nicht
  wieder her und ist nach realer Lifecycle-Nutzung unzulässig.
- List/Detail bleiben invoker-/RLS-gebunden. Replace/Delete sind eng
  ownergebundene gehärtete RPCs; der interne Helper liegt im nicht exponierten
  Schema `midas_private`. Direkte Client-DML bleibt entzogen.
- Korrektur und Delete besitzen einen eigenen `mutationState`, verwenden weder
  R7-Recovery noch R8-Commit-Intent und versöhnen Unknown Outcomes durch einen
  neuen Read. History- und Last-Performance-Caches werden generation-gefenced.
- Bewiesen sind 208/208 lokale Contracts, die Browsermatrix 1440/390/320,
  PostgreSQL-17-Fresh/Rerun/Drift/Rollback/Races/Security, der R8-
  Isolationsguard und das produktive SQL-23-Postimage mit 0/0/0 Sessions/
  Items/Sets. Vier CodeRabbit-Reviews schlossen alle berechtigten Findings;
  der finale Null-Lauf blieb rate-limitiert und ist als owner-akzeptiertes,
  nicht blockierendes Restrisiko dokumentiert, nicht als PASS.

## 2.11 Activity V2 R10 - Completed Activity Coaching Export V1

Status: implementiert und lokal, im Browser sowie auf disposable PostgreSQL
17.6 vollständig bewiesen. SQL 24 ist produktiv installiert und read-only
postgeprüft; Client, Controller und Harness bleiben ohne Produkt-Scriptload,
Navigation oder sichtbaren Downloadconsumer.

- `public.activity_v2_coaching_export(date,date) returns jsonb` liefert alle
  und nur abgeschlossenen Activity-V2-Ist-Sessions des angemeldeten Owners aus
  genau einem `STABLE SECURITY INVOKER`-Snapshot. Die Function ruft keine
  R9-History-RPCs auf und schreibt keine Activity-Daten.
- Das Schema `midas.activity-coaching-export.v1` enthält inklusive Vienna-
  Range, `generated_at`, exakten Einheiten, Counts, Completeness, Quality,
  Sessions, Items, Sets und Cautions. Historische Semantik wird ausschließlich
  über die gespeicherte Kombination aus `catalog_version` und `item_key`
  aufgelöst.
- Drei und sechs Kalendermonate sowie eine freie inklusive Range bis maximal
  366 Tage sind im reinen Clientvertrag abgebildet. Zukunft, inverse oder zu
  große Ranges werden vor I/O abgelehnt.
- Die harten Caps sind 1000 Sessions, 10000 Items und 50000 Sets. Alle Counts
  entstehen vor dem Payloadbau; Überschreitung oder Snapshot-/Order-/Mode-
  Drift schlägt explizit fehl. Es gibt keine stille Kürzung oder Teilantwort.
- `dataAccess.loadCoachingExport({ from, to })` verwendet genau einen logischen
  RPC-Aufruf mit identischem Auth-Retry-Body, validiert die Antwort streng und
  gibt nur einen tief eingefrorenen vollständigen V1-Export zurück.
- Der isolierte Harness beweist Presets, Custom Range, Loading, Empty, Error,
  Retry, stale responses sowie einen parsebaren und revoketen JSON-Blob bei
  Desktop, 390x844 und 320x800. Er nutzt nur Fakeadapter und Fixture.
- Produktiv besitzt ausschließlich `authenticated` Execute; `PUBLIC`, `anon`
  und `service_role` besitzen kein Execute, `postgres` bleibt Owner. Die
  Function ist `STABLE`, `SECURITY INVOKER`, hat `search_path=''` und den
  geprüften Functiondef-Hash
  `ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376`.
- Der produktive Postcheck blieb bei Sessions/Items/Sets `0/0/0`. Ein real
  angemeldeter User erhielt ein vollständiges clientvalidiertes Empty-V1;
  Anon und fehlender Auth wurden abgelehnt. Es gab keine Produkt-DML und
  keinen Web-, Edge-, APK- oder Device-Deploy.
- Activity V1, Doctor View, Health Export, Protein Target, Trendpilot, MCP,
  Import und der R12-Cutover bleiben unverändert außerhalb von R10.

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
  80er-Snapshot. Seit R8 akzeptiert der Commit jede vorhandene
  unveränderliche Payload-Katalogversion statt nur der höchsten; echte
  Sessionnutzung bleibt bis zum R12-Cutover gesperrt.

### Activity V2 R3-R8 - Draft-, Recovery- und Commitvertrag

- Der fachliche Draft existiert im Arbeitsspeicher und ist kein abgeschlossener
  R2-Datensatz; R7 speichert nur seinen vollständigen unveränderten v3-Snapshot
  in einem getrennten lokalen Recovery-Envelope.
- `request_id` und `catalog_version` sind bereits R2-kompatibel; Items besitzen
  eindeutige `item_key` und lueckenlose, einsbasierte `item_order`.
- Reload-Recovery ist im isolierten R7-Harness bewiesen. Site-Datenlöschung,
  anderes Browserprofil oder anderes Gerät besitzen keinen gemeinsamen Slot.
- R8 verbindet dieselbe Recovery intern mit dem Commit-Core. Die lokale
  Browser-PWA ist bewiesen; der echte Android-Prozess-Reclaim blieb mangels
  ADB-Gerät unausgeführt. Beides bleibt außerhalb des Produkts.

### Activity V2 R9 - History- und Lifecyclevertrag

- `health_activity_sessions.revision` beginnt bei 1 und steigt nur nach einer
  erfolgreichen inhaltlichen Korrektur. List-/Detailantworten transportieren
  PostgreSQL-`bigint` verlustfrei als Dezimalstring.
- Die vier öffentlichen RPCs sind `activity_v2_list_sessions`,
  `activity_v2_session_detail`, `activity_v2_replace_session` und
  `activity_v2_delete_session`; der reine Canonicalization-Helper bleibt in
  `midas_private` außerhalb der Data API.
- Die produktive Installation enthält nur die additive SQL-23-Struktur. Es
  wurde keine Session angelegt, korrigiert oder gelöscht; der Postcheck blieb
  bei 0/0/0.

### Activity V2 R10 - read-only Coaching-Exportvertrag

- Der einzige Datenbankentrypoint ist
  `activity_v2_coaching_export(date,date)`. Er liest Sessions, Items, Sets und
  den exakten historischen Katalog in einem Calling-Query-Snapshot und liefert
  genau ein vollständiges JSONB-Dokument.
- Der Export ist ownergebunden, authenticated-only, read-only und unabhängig
  von den bounded R9-UI-RPCs. Er besitzt weder Cursor noch Offset, Pagination,
  Import-, Mutation- oder Coachingempfehlungssemantik.
- SQL 24 änderte keine Tabelle, Spalte, Policy oder fachliche Zeile. Das
  produktive Postimage enthält nur die neue Function/ACL; V2-Historie blieb
  0/0/0.

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
- Die R10-Exportshell ist ebenfalls nur im isolierten Harness sichtbar. SQL 24
  installiert keinen Button und autorisiert keine produktive Verdrahtung.

---

## 6. Arzt-Ansicht / Read-Only Views

- Training-Tab in der Arztansicht neben BP/Body/Lab.
- Spaltenlayout analog Body (Datum + Delete links, Werte rechts).
- Anzeige: Aktivitaet, Dauer (Min), Notiz.
- Berichte: Activity-Aggregation im aktuellen Range-Arztbericht.
- R10 verändert weder Doctor View noch Arztbericht oder Health Export. R11
  darf später ausschließlich eine ruhige Aktivitätszusammenfassung integrieren;
  das vollständige Satzschema bleibt im separaten Coaching-Export.

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
- R11: Doctor-/Report-Zusammenfassung auf Basis eines eigenen bewiesenen
  V1-/V2-Kompatibilitätsvertrags, ohne den R10-Vollpayload zu kopieren.
- R12: kontrollierter Productload, V1-/V2-Consumerparität und Cutover. Erst
  dort darf die isolierte Activity-V2-Runtime sichtbar aktiviert werden.

---

## 10. Feature-Flags / Konfiguration

- Keine spezifischen Flags.
- Nutzt bestehende Supabase-Konfiguration.

---

## 11. Status / Dependencies / Risks

- Status: aktiv (implementiert, im Capture/Doctor/Reports genutzt).
- Activity V2 R1-R10/C2: Semantik, additive produktive Datenbasis, lokaler
  Draft/Vollflaechen-Shell, vollständiger Katalog v2, lokale Suche/read-only
  Historie, Strength-/Duration-/Distance-Editor, lokale Draft-Recovery und der
  Commit-Core, History/Detail/Correction/Delete und der vollständige read-only
  Coaching-Export sind implementiert. SQL 22, SQL 23 und SQL 24 sind produktiv
  bestätigt; die V2-
  Runtime bleibt isoliert und es gibt keinen produktiven UI-, Consumer- oder
  V1-Cutover.
- Dependencies (hard): `health_events` + RPCs `activity_add/list/delete`, Vitals-Datum im Capture-Panel, Doctor-Training-Tab.
- Dependencies (soft): Range-Arztbericht/Edge-Function fuer Aggregation.
- Known issues / risks: nur 1 Eintrag pro Tag; falsches Vitals-Datum => falscher Tag; keine Uhrzeit.
- Activity-V2-Risiko: Commit/Recovery sind lokal, disposable und im Browser
  bewiesen. Der reale Android-PWA-Prozess-Reclaim wurde in R8 nicht ausgeführt;
  Gerätewechsel liegt außerhalb des lokalen Recoveryvertrags. Produktive
  Consumerintegration und finaler Android-Smoke bleiben R12.
- R9-Review-Risiko: Alle berechtigten Findings aus vier erfolgreichen
  CodeRabbit-Läufen sind korrigiert und invalidierte Checks grün. Ein weiterer
  finaler Null-Lauf wurde rate-limitiert und daher nicht als PASS gewertet;
  der Owner akzeptierte diese klar abgegrenzte Restunsicherheit für R9.
- R10-Watchlists: Der produktive Advisor enthält nur die bekannten
  R8/R9-fremden Warnungen; SQL 24 erzeugte keine neue R10-Warnung. Der In-App-
  Browser-Service war nicht verfügbar, die dokumentierte lokale Edge-/
  Playwright-Matrix bestand jedoch erneut 3/3. Beides blockiert R11 nicht.
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
- Kombinierte R1-R7/C2-Node-Suite validiert 119 Contract-Faelle.
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
- R6-Checks validieren Draftschema v3, elf Draftmethoden, sechs Itemkeys, vier
  reale `duration`- und sieben `duration_distance`-Policies, exakte Parser- und
  Notizgrenzen, gemischte Sessions sowie History-/Timertrennung. Die integrierte
  Harness-Matrix deckt vier Fixtures in drei Viewports ab; ein 41-Sekunden-
  Fremdtab-Smoke bewahrt Itemrohwert, Notiz, Fokus, Status und Uhr.
- R7-Checks validieren Draft-v3-Restore, festen separaten IDB-Slot, Envelope,
  vollständigen Token-/Lease-CAS, One-Write-/Latest-Pending-Autosave,
  Retry/Conflict/Lifecycle, Generationstombstone, stale-Writer-Sperre,
  persistent-first Shell-Discard und alle fail-closed Fehlerzustände. Draft
  `24/24`, Recovery `28/28`, Shell `38/38`, vollständig `119/119`, Katalog
  `v2 / 80 / 47 / 58`, Syntax `12/12`, statische Isolation, realer Edge-
  Harness und finaler CodeRabbit-Re-Review mit `0 Findings` sind grün.
- R8-Checks validieren Mapper, Zeitvertrag, tiefgefrorenen Commit-Intent,
  Envelope-v1/v2, Intent-/Attempt-CAS, Quarantäne, One-Promise-Coordinator,
  Known/Unknown/Replay/Cleanup, Data-Access-v1/v2, Shell und Fault-/Race-
  Harness. Die finale technische Matrix ist 179/179, Syntax 21/21, Katalog
  `v2 / 80 / 47 / 58` und Isolation `7/0/0/0/0/0/1`. PostgreSQL 17.6 und
  produktives SQL 22 enden bei Katalog 78/80/0 und V2-Historie 0/0/0. Browser-
  All/Unknown/Retry/Reload/Offline/Races sowie 1440/390/320 sind PASS. Android
  Debug/Release bauen isoliert; der Device-Reclaim und der finale CodeRabbit-
  Null-Lauf wurden per Owner-Entscheidung nicht als Pflichtabschluss verfolgt
  und dürfen nicht als PASS zitiert werden.
- R9-Checks validieren bounded Keyset-History, Snapshotdetail, unveränderliche
  Erstellungsidentität, ursprüngliche Katalogversion, Canonicalization,
  Revision/Content-Dual-CAS, Edit/Edit-, Edit/Delete- und Delete/Delete-Races,
  Unknown-Outcome-Reconciliation, Hard Delete, RLS/ACL/Auth/Owner/Search Path,
  private Helpergrenze, Cache-Fencing und Productload-Isolation. Die finale
  lokale Matrix ist 208/208; Browser 1440/390/320, PostgreSQL-17-Fixture und
  produktiver read-only SQL-23-Postcheck sind grün. Produktive V2-Daten bleiben
  0/0/0; ein rate-limitierter finaler CodeRabbit-Null-Lauf ist ausdrücklich
  nur owner-akzeptiertes Restrisiko.
- R10-Checks validieren exakte V1-Keysets/Typen/Units/Counts, Vienna-Ranges,
  deterministische Sortierung, einen Snapshot, vollständige historische
  Katalogsemantik, All-or-Error, Caps, Auth/RLS/BOLA/ACL, Correction/Delete-
  Races, Rollback/Forward, Single-RPC-Data-Access, isolierten Download und
  Productload-/Doctor-/Health-Negativgrenzen. Finale Activity-V2-Matrix
  `237/237`, fokussiert R10 `29/29`, Isolation mit sechs R10-Negativorakeln,
  Browser Desktop/390/320 `3/3` und das PostgreSQL-17.6-Vollfixture sind PASS.
  Produktiv sind Function/ACL/Empty-V1 bestätigt und V2-Daten unverändert
  0/0/0.

---

## 13. Definition of Done

- Training-Tab speichert und rendert korrekt.
- Keine offenen Logs/Errors im Flow.
- Activity V2 R1-R10/C2 bleiben bis zu den zuständigen Folgeroadmaps für
  produktive Consumer unverdrahtet. R8 und R9 sind mit ihren ausdrücklich
  dokumentierten, owner-akzeptierten Evidence-/Review-Grenzen DONE; R10 ist
  vollständig DONE und R11 das nächste Rolling-Wave-Gate. Ausschließlich R12
  darf den produktiven V2-Cutover und den
  finalen Android-PWA-Smoke ausführen.
- Doku aktuell (Spec + Overview).


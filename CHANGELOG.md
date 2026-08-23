# MIDAS Changelog

Dieses Dokument erfasst bemerkenswerte Änderungen an Nutzung, Betrieb und
Sicherheitsverträgen von MIDAS. Es ist keine Commitliste, Testsuite oder
Ausführungsevidence.

MIDAS besitzt derzeit keine autoritative Gesamtversionsnummer. Bis zum ersten
bewussten Release-Cut gilt `Unreleased` zusammen mit dem exakten Git-Commit.
Die frühere Versions- und Unreleased-Historie bleibt im
[Legacy-Changelog](docs/archive/history/MIDAS%20Legacy%20Changelog%20v0.1-v1.8%20and%20Unreleased.md)
erhalten.

## Unreleased

### Added

- Produktive, additive Activity-V2-Datenbasis mit versioniertem 78er-Katalog,
  atomarem retry-idempotentem Session-Commit und ownergebundenem
  Last-Performance-Lookup; Activity V1 und die sichtbare UI bleiben
  unverändert.
- Additive Activity-V2-History-/Lifecycle-Grundlage mit begrenzter
  Keyset-Historie, gespeicherten Snapshotdetails, revisions- und
  fingerprintgeschützter atomarer Korrektur sowie wiederholsicherem Hard
  Delete. Die neuen RPCs sind produktiv installiert, aber bis zu den
  zuständigen R13-/R14-Gates ohne sichtbaren Consumer.
- Versionierter Activity-V2-Coaching-Export für abgeschlossene Ist-Sessions:
  ein ownergebundener read-only Snapshot-RPC liefert vollständige,
  deterministisch sortierte Session-, Item- und Satzdaten mit historischer
  Katalogsemantik, exakten Einheiten, Counts und All-or-Error-Caps. Die
  Function ist produktiv installiert; Download-UI, Doctor View, Health Export
  und Activity-V2-Cutover bleiben bis zu ihren Folgeroadmaps unverändert.
- Gemeinsamer Activity-V1-/V2-Read-Unterbau für Doctor View, Range-
  Arztbericht und Health Export V3: ein ownergebundener Snapshot-RPC ist
  produktiv installiert, während Doctor-/Report-/Exportconsumer bis R13
  isoliert bleiben. Arztberichte enthalten weiterhin keine Übungs-, Satz-,
  Rep-, Gewichts-, Volumen- oder Empfehlungsebene; Health Export V2 und der
  getrennte R10-Coaching-Export bleiben unverändert.

- Kanonischer QA-Einstieg mit fachlichen Suites, operativen Runbooks und
  eigenem Release-Readiness-Vertrag.
- Minimaler manueller Recovery-Vertrag mit verschlüsseltem Supabase-Dump,
  Android-Keystore, redigiertem Konfigurationsinventar und halbjährlicher
  Pflege auf der zweiten internen SSD.
- Versionierter, atomarer Health Export V2 für ChatGPT, Codex und künftige
  read-only MCP-Consumer.

### Changed

- Der produktive Activity-V2-Commit-RPC akzeptiert nach dem kontrollierten
  SQL-22-Update jede vorhandene unveränderliche Katalogversion statt nur der
  höchsten. Idempotenz, RLS/ACL-Hardening, Activity V1 und die weiterhin
  verborgene Activity-V2-Produktgrenze bleiben unverändert.
- Aktuelle QA-Verträge, historische QA-Nachweise und Release-Historie sind
  getrennte, gezielt lesbare Dokumentationsflächen.
- Der Roadmap-Readiness-Review empfiehlt sichere S4-Ausführungsblöcke, ohne
  Substep-Abnahmen oder Owner-Gates zusammenzulegen.
- Die Doctor View öffnet report-first mit genau einem aktuellen Arztbericht;
  Einzelwerte und Verlauf bleiben sekundäre, explizit geladene Werkzeuge.
- Arztberichte verwenden einen expliziten Zeitraum bis maximal 400 inklusive
  Tage und ersetzen den bestehenden Bericht atomar in-place.

### Removed

- Monatsberichte, Report-Inbox, Report-Archiv und der zugehörige
  GitHub-Scheduler samt exklusiver Konfiguration.

### Security

- Activity-V2-Tabellen sind RLS-geschützt und clientseitig read-only; Writes
  laufen ausschließlich über den gehärteten authentifizierten
  `SECURITY DEFINER`-Commit. `anon`, `service_role` und `PUBLIC` erhalten kein
  RPC-Execute, und direkte Tabellen-DML ist entzogen.
- Activity-V2-Korrektur und -Löschung laufen ausschließlich über eng
  ownergebundene, gehärtete RPCs mit Revision/Content-CAS. Der interne
  Canonicalization-Helper liegt im nicht exponierten Schema `midas_private`;
  direkte Tabellen-DML sowie `anon`-/`PUBLIC`-Zugriff bleiben entzogen.
- Der gemeinsame Activity-Consumer ist `SECURITY INVOKER`, besitzt keinen
  Ownerparameter und erlaubt Execute nur für nicht anonyme
  `authenticated`-Aufrufe. SQL 25 verändert keine Activity- oder Reportdaten.

- Report-Requests lehnen interne Service-Role-Aufrufe ab, geben bei internen
  Fehlern keine Datenbankdetails aus und begrenzen Zeitraum sowie Pagination.

## Pflegevertrag

Erlaubte Kategorien sind `Added`, `Changed`, `Fixed`, `Removed` und
`Security`. Nicht benötigte Kategorien werden weggelassen.

Bei einem bewussten MIDAS-Release werden die betroffenen
`Unreleased`-Einträge unter `## [X.Y.Z] - YYYY-MM-DD` verschoben. Version,
Datum, Scope, QA-Nachweise, Owner-Go und Git-Tag müssen zuvor die
[Release-Readiness](docs/qa/release-readiness.md) erfüllen. Historische
Versionsangaben werden nicht rückwirkend umgedeutet.

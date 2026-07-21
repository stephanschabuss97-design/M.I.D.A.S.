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

- Kanonischer QA-Einstieg mit fachlichen Suites, operativen Runbooks und
  eigenem Release-Readiness-Vertrag.

### Changed

- Aktuelle QA-Verträge, historische QA-Nachweise und Release-Historie sind
  getrennte, gezielt lesbare Dokumentationsflächen.
- Der Roadmap-Readiness-Review empfiehlt sichere S4-Ausführungsblöcke, ohne
  Substep-Abnahmen oder Owner-Gates zusammenzulegen.

## Pflegevertrag

Erlaubte Kategorien sind `Added`, `Changed`, `Fixed`, `Removed` und
`Security`. Nicht benötigte Kategorien werden weggelassen.

Bei einem bewussten MIDAS-Release werden die betroffenen
`Unreleased`-Einträge unter `## [X.Y.Z] - YYYY-MM-DD` verschoben. Version,
Datum, Scope, QA-Nachweise, Owner-Go und Git-Tag müssen zuvor die
[Release-Readiness](docs/qa/release-readiness.md) erfüllen. Historische
Versionsangaben werden nicht rückwirkend umgedeutet.

# MIDAS Release Readiness

Dieses Dokument definiert stabile Gates für einen bewussten MIDAS-Release.
Es ist keine Testsuite und kein Ausführungsprotokoll. Fachliche Prüfungen
werden ausschließlich über bestehende Suite- und Runbook-IDs ausgewählt;
konkrete Ergebnisse stehen in der aktiven Roadmap oder Evidence.

Der aktuelle Änderungsstand steht im [Root-Changelog](../../CHANGELOG.md).
Die frühere Versionshistorie bleibt im
[Legacy-Changelog](../archive/history/MIDAS%20Legacy%20Changelog%20v0.1-v1.8%20and%20Unreleased.md)
erhalten.

## Geltung

- Ein einzelner Web-Commit, Android-Build, Edge-Deploy oder SQL-Cutover ist
  zunächst eine Komponentenänderung.
- Erst ein ausdrücklicher Owner-Cut mit vollständigem Scope und Nachweisen ist
  ein geregelter MIDAS-Release.
- Nicht betroffene Flächen werden `not affected`; sie benötigen keinen
  künstlichen Deploy.
- Bis zum ersten geregelten Release gilt `Unreleased` plus exakter Git-Commit.
- Dieses Dokument speichert keine dauerhaften PASS-/FAIL-Ergebnisse.
- Ein Release verschiebt nur belegte, tatsächlich betroffene
  `Unreleased`-Einträge in einen datierten Versionsabschnitt.

## Release-Schema

Die aktive Roadmap oder Evidence hält für einen geplanten Release fest:

<!-- markdownlint-disable MD013 -->

| Feld | Erforderliche Aussage |
| --- | --- |
| Version | bewusst gewähltes `X.Y.Z`; nicht aus Legacy-Markern geraten |
| Datum | ISO-Datum `YYYY-MM-DD` des tatsächlichen Owner-Cuts |
| Commit | exakter freigegebener Git-Commit |
| Scope | jede Fläche als `affected` oder `not affected` |
| QA-Auswahl | betroffene stabile Suite- und Runbook-IDs |
| Evidence | eindeutiges Ziel für konkrete Ergebnisse |
| Owner-Go | ausdrückliche Freigabe nach grünen Gates |
| Tag | `vX.Y.Z` auf dem freigegebenen Commit nach Owner-Go |
| Changelog | betroffene `Unreleased`-Einträge unter derselben Version und demselben ISO-Datum |

<!-- markdownlint-enable MD013 -->

## Ausrollflächen

<!-- markdownlint-disable MD013 -->

| Fläche | Erforderlicher Nachweis, wenn betroffen |
| --- | --- |
| Web/PWA | veröffentlichter Commit und produktiver Smoke |
| Android | Build-Artefakt und Geräte-Smoke |
| Edge Functions | Deploy-Ziel und Remote-Smoke |
| SQL/Supabase | produktiver Cutover und geprüfte Postconditions |
| Dokumentation | veröffentlichter Commit sowie Link- und Dokuprüfung |

<!-- markdownlint-enable MD013 -->

## Stabile Release-Gates

### REL-001 - Versions- und Datumsentscheidung

- Vertrag: Eine Version wird erst beim bewussten Release-Cut gewählt.
- Erwartung: `X.Y.Z` und ISO-Datum sind belegt; Legacy-, Android- oder
  Cachemarker werden nicht still zur Produktversion erklärt.

### REL-002 - Scope vollständig deklarieren

- Vertrag: Alle fünf Ausrollflächen werden bewertet.
- Erwartung: Jede Fläche ist `affected` oder `not affected`; die Begründung
  stimmt mit dem realen Diff überein.

### REL-003 - QA- und Runbook-Auswahl

- Vertrag: Release Readiness orchestriert vorhandene IDs.
- Erwartung: Alle vom Scope betroffenen Suite- und Runbook-IDs sind genannt;
  Testtexte werden hier nicht kopiert.

### REL-004 - Evidence-Ziel festlegen

- Vertrag: Konkrete Ergebnisse gehören nicht in dieses Dokument.
- Erwartung: Aktive Roadmap oder Evidence-Datei ist als eindeutiges
  Nachweisziel benannt.

### REL-005 - Dokumentation und Changelog abgleichen

- Vertrag: Produktvertrag, QA, Changelog und aktive Links dürfen nicht driften.
- Erwartung: Betroffene Sources of Truth sind synchron; Changelog-Relevanz ist
  entschieden, Kategorien sind zulässig und aktive Links sind gültig.

### REL-006 - Ausrollnachweis je betroffener Fläche

- Vertrag: Eine Teilfläche wird nur durch ihren eigenen Nachweis produktiv.
- Erwartung: Jede als `affected` markierte Fläche besitzt den in der
  Ausrollmatrix geforderten Nachweis.

### REL-007 - Owner-Go

- Vertrag: Ein Release-Cut ist eine bewusste Owner-Entscheidung.
- Erwartung: Alle erforderlichen Gates sind grün und das Owner-Go ist in der
  aktiven Roadmap oder Evidence datiert dokumentiert.

### REL-008 - Git-Tag als Versionsanker

- Vertrag: Der Tag wird erst nach Owner-Go auf dem freigegebenen Commit
  erzeugt.
- Erwartung: `vX.Y.Z` zeigt exakt auf den geprüften Release-Commit. Ein GitHub
  Release ist optional.

## Changelog-Cut

Beim Owner-Go werden ausschließlich die für den Release belegten
`Unreleased`-Einträge verschoben:

1. Versionsabschnitt `## [X.Y.Z] - YYYY-MM-DD` anlegen.
2. Betroffene Kategorien und Einträge unverändert darunter übernehmen.
3. `Unreleased` für folgende Änderungen bestehen lassen.
4. Git-Tag erst nach dem dokumentierten Owner-Go erzeugen.

Einzelne Deploys, SQL-Cutover oder Android-Builds erzeugen ohne vollständigen
Release-Scope weder eine neue Gesamtversion noch automatisch einen Tag.

## Abbruchregeln

Kein geregelter Release-Cut erfolgt, wenn:

- Version, Datum, Commit oder Scope unklar sind,
- eine betroffene Fläche keinen eigenen Ausrollnachweis besitzt,
- erforderliche Suite- oder Runbook-IDs fehlen,
- Dokumentation, Changelog oder aktive Links widersprüchlich sind,
- produktive Wirkung nicht freigegeben oder nicht nachgewiesen ist,
- oder das ausdrückliche Owner-Go fehlt.

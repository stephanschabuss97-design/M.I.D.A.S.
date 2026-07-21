# MIDAS QA Documentation Architecture Roadmap

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | QA-Dokumentation, Change-/Release-Vertrag und historische Nachweise |
| Owner / Kontext | Stephan; wartbare und selektiv lesbare MIDAS-QA für Mensch und Coding-Agent |
| Erstellt am | `2026-07-20` |
| Letzter Stand | `2026-07-21, S6 abgeschlossen; Roadmap archivbereit` |
| Aktueller Schritt | `abgeschlossen` |
| Risikoklasse | `R2` |
| Standard-Reviewtiefe | `Consumer` |
| Owner-Erklärmodus | `none` |
| Betroffene Hauptdateien | `docs/QA_CHECKS.md`, `CHANGELOG.md`, `docs/qa/**`, `docs/archive/qa/**`, `docs/archive/history/**`, aktive QA-/Changelog-Referenzen in `README.md`, `docs/DEV_ENVIRONMENT.md`, `docs/templates/**` und `docs/modules/**` |
| Deploy relevant | `nein` |
| Produktive Schreibwirkung | `nein` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `nicht erforderlich` |
| Archivziel | `docs/archive/MIDAS QA Documentation Architecture Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Session Resume Card

- Ziel:
  - QA-Monolith und Changelog verlustfrei in aktuelle Suites, Runbooks,
    historische Nachweise und einen gepflegten Release-Vertrag aufteilen.
- Unveränderliche Verträge:
  - Kein Test, Nachweis oder historischer Status darf still verloren gehen.
  - Aktuelle QA definiert Tests ohne vergangenen Ausführungsstatus.
  - Changelog, QA, Evidence und Produktvertrag behalten getrennte Rollen.
  - Module Overviews bleiben Source of Truth für Produkt- und State-Verträge.
- Erledigter Stand:
  - S1 inventarisierte 100 QA-H2-, 15 QA-H3- und 69 Changelog-Blöcke.
  - S2 definierte Rollen, Ownership, Testschema und Release-Vertrag.
  - S3 und Readiness schlossen Risiken, Gates und den S4.1-S4.11-Schnitt.
  - S4.1 legte QA-Einstieg, sieben Suite-Skelette und acht Release-Gates an.
  - S4.2 migrierte 38 aktuelle Core-, Health-, Intake- und Medication-Tests.
  - S4.3 migrierte 28 aktuelle Assistant-, Voice-, Push- und Trendpilot-Tests.
  - S4.4 migrierte 26 aktuelle Android-, Backend- und Supabase-Tests.
  - S4.5 legte fünf operative Runbooks mit Owner-Gates und Cleanup an.
  - S4.6 archivierte 40 historische Arbeitsphasen mit unverändertem Status.
  - S4.7 archivierte beide Legacy-QA-Quellen als getrennte Vollsnapshots.
  - S4.8 archivierte den Root-Changelog und die abweichende Backup-Evidence.
  - S4.9-S4.11 bauten Changelog, Kompatibilitätsindex, Referenzen und formale
    QA-Konsistenz auf.
  - S5 schloss `T-QA-01` bis `T-QA-20` grün ab.
  - S6 synchronisierte alle Sources of Truth und schloss den Full Review.
- Aktueller Schritt:
  - `abgeschlossen`.
- Nächster erlaubter Schritt:
  - `none`; Roadmap archivieren und committen.
- Offene Findings:
  - `F-QA-57`: Android protokolliert OAuth-Callback-URIs vor der Bereinigung;
    separater Codefix und Device-Nachweis vor dem nächsten Android-Release.
  - `F-QA-66`: bestehende Markdownlint-Altlasten in 14 Legacy-Dokumenten
    separat bereinigen; neue und migrierte QA-Zeilen sind sauber.
- Geänderte Dateien:
  - diese Roadmap, Root-README/Changelog, QA-Kompatibilitätsindex,
    `docs/qa/**`, drei historische Archive, Templates und aktive
    QA-Referenzen in Module Overviews
- Gültige Nachweise:
  - S1-S3, S4 Readiness sowie S4.1-S4.11 Reviews vom `2026-07-20` bis
    `2026-07-21`
  - S5 mit `T-QA-01` bis `T-QA-20` vom `2026-07-21`
  - S6 Full Contract Review und Changelog-Entscheidung vom `2026-07-21`
- Runtime-/Deploy-Stand:
  - nicht relevant; reine Dokumentationsarchitektur
- Offene Owner-Freigaben:
  - `none`
- Stop-Bedingungen:
  - `none`; F-QA-57 und F-QA-66 bleiben als explizite Watchlists erhalten.

## Zielvertrag

Prüfbares Endergebnis:

- `docs/qa/README.md` ist der kanonische Einstieg und erklärt QA-Rollen,
  Statussemantik, Test-ID-Konvention und selektive Leseroute.
- Aktuelle, wiederverwendbare Tests liegen in kleinen, fachlich eindeutigen
  Dateien unter `docs/qa/`; operative Abläufe liegen unter
  `docs/qa/runbooks/`.
- Historische Phasen- und Release-Nachweise liegen unter `docs/archive/qa/`
  und sind sichtbar als Historie, nicht als aktueller Produktvertrag markiert.
- `docs/QA_CHECKS.md` bleibt als kurzer Kompatibilitätszeiger erhalten, damit
  alte und externe Verweise nicht hart brechen.
- `CHANGELOG.md` bleibt als lebender Root-Changelog erhalten und verwendet
  einen knappen, menschenlesbaren Release-Vertrag nach dem Muster von
  Keep a Changelog: `Unreleased`, reverse Chronologie, ISO-Daten sowie nur
  tatsächlich benötigte Kategorien wie `Added`, `Changed`, `Fixed`,
  `Removed` und `Security`.
- `docs/qa/release-readiness.md` definiert den schlanken Release-Gate-Vertrag
  und verweist auf betroffene Test-IDs, ohne Suite-Inhalte zu duplizieren.
- Der bisherige Changelog wird als Legacy-Chronik archiviert; QA-relevante
  Aussagen werden nach heutiger Gültigkeitsprüfung in aktuelle Suites oder
  historische QA-Nachweise überführt.
- Aktive README-, Template-, Dev-Environment- und Module-Overview-Referenzen
  zeigen auf den neuen kanonischen QA-Einstieg oder die zuständige Suite.
- Jeder relevante Abschnitt der bisherigen `docs/QA_CHECKS.md` ist genau
  einem aktuellen oder historischen Ziel zugeordnet.
- Weiterhin gültige Regressionen aus abgeschlossenen Phasen werden zusätzlich
  als statuslose aktuelle Testdefinition übernommen, ohne den historischen
  PASS-Zustand zu kopieren.
- Aktive QA-Dateien sind frei von bekannten Encoding-Schäden und bestehen
  Markdown-, Link-, ID- und Diff-Prüfungen.
- Der neue Changelog besitzt genau eine H1, eindeutige Versionsabschnitte,
  keine endlose ungeprüfte `Unreleased`-Sammelliste und keine QA-Evidence.

Bewusst unverändert:

- Produktcode, SQL, Supabase, Edge Functions, Android und Runtime-Verhalten.
- Fachliche Produkt- und State-Verträge der Module.
- Historische Aussagen und damalige PASS-/TODO-Zustände, soweit sie als
  historische Nachweise übernommen werden.
- Archivierte Roadmaps und deren historische Verweise auf
  `docs/QA_CHECKS.md`.
- Bestehende Git-Tags und GitHub Releases; ihre Einführung oder nachträgliche
  Rekonstruktion ist nicht Teil dieser Dokumentationsmigration.
- Legacy-Monolithen unter `C:\Users\steph\Projekte\Backup\Old`; sie dienen
  nur bei einer belegten historischen Lücke als gezielte Referenz.

## Problem und Ist-Zustand

- Beobachtung:
  - `docs/QA_CHECKS.md` umfasst rund 2.881 Zeilen und vermischt aktuelle
    Regressionstests, ausgeführte Roadmap-Evidence, alte Testpläne,
    Release-Chronik, Runbooks sowie Produkt-/State-Aussagen.
  - Die Reihenfolge ist nicht konsistent chronologisch oder fachlich.
  - Ein erheblicher Teil der historischen Abschnitte enthält Mojibake und
    andere Encoding-Schäden.
  - Viele aktive und historische Dokumente referenzieren den bisherigen Pfad.
  - `CHANGELOG.md` umfasst rund 822 Zeilen und 69 Versionsabschnitte, besitzt
    keinen H1-Titel, enthält doppelte bzw. falsch einsortierte Versionen,
    Encoding-Schäden und einen seit März 2026 nicht mehr zuverlässig
    gepflegten `Unreleased`-Block.
  - Changelog-Einträge mischen Release-Fakten, QA-Hinweise,
    Architekturentscheidungen und inzwischen veraltete Pfade.
- Risiko oder Reibung:
  - Neue Chats müssen unnötig viel Kontext laden und können historische
    Checkboxen mit aktuellen Testverträgen verwechseln.
  - Wirkliche QA-Findings gehen zwischen alten Phasen, Statuswerten und
    wiederverwendbaren Checks unter.
  - Ein pauschales Umschreiben könnte historische Evidenz, Testfälle oder
    Referenzen verlieren.
  - Ein unvollständig gepflegter Changelog kann fälschlich als vollständige
    Änderungshistorie gelesen werden und damit ebenso irreführen wie alte
    QA-Haken.
- Offene Hypothese:
  - Die unteren aktuellen Regression-Blöcke sind nicht automatisch noch
    vollständig gültig; sie müssen beim Umzug gegen aktuelle Module Overviews
    und Code-Consumer geprüft werden.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-QA-01 | `2026-07-20` | Eine gemeinsame Roadmap, keine Teil-Roadmaps | Die Arbeit besitzt einen gemeinsamen Inhalts- und Referenzvertrag; mehrere Roadmaps würden Zuordnung und Abnahme duplizieren. | gesamter Scope |
| D-QA-02 | `2026-07-20` | `docs/qa/README.md` wird kanonischer QA-Einstieg | Ein stabiler Router erlaubt selektives Lesen und vermeidet, dass eine neue Monolith-Datei entsteht. | Zielarchitektur |
| D-QA-03 | `2026-07-20` | `docs/QA_CHECKS.md` bleibt als schlanker Kompatibilitätszeiger | Bestehende Archiv- und externe Links bleiben verständlich, ohne weiterhin den Monolithen zu laden. | Referenzmigration |
| D-QA-04 | `2026-07-20` | Aktuelle QA definiert Testfälle ohne dauerhafte PASS-Checkboxen | Ausführungsergebnisse gehören in Roadmap/Evidence; sonst wird ein alter Haken als aktueller Nachweis missverstanden. | QA-Suites |
| D-QA-05 | `2026-07-20` | Historische Phasen und Legacy-Releases werden getrennt archiviert | Ausführungsphasen und Versionschronik haben unterschiedliche Leserfragen und Geltung. | `docs/archive/qa/**` |
| D-QA-06 | `2026-07-20` | Kein vollständiger Diff aller Legacy-Monolithen | Bestehende QA-/Changelog-Quellen reichen als Grundlage; HTML-Diffs werden nur für konkrete Lücken verwendet. | Legacy-Rekonstruktion |
| D-QA-07 | `2026-07-20` | Encoding wird zielgerichtet pro Zielartefakt korrigiert | Mehrfach beschädigte Zeichenketten machen eine globale Ersetzung unzuverlässig. | Qualitätsprüfung |
| D-QA-08 | `2026-07-20` | Historische Phasen dürfen aktuelle Regressionen speisen | Der damalige Ausführungsnachweis bleibt im Archiv; sein weiterhin gültiger Testvertrag wird separat und ohne PASS-Status in die zuständige Suite übernommen. | Inhaltsmigration |
| D-QA-09 | `2026-07-20` | Aktive Verweise werden nach ihrer Aussageabsicht migriert | Ein Verweis auf einen aktuellen Test führt zur Suite; ein Verweis auf eine konkrete damalige Phase führt zum historischen Archiv. | Referenzmigration |
| D-QA-10 | `2026-07-21` | QA und Changelog bleiben getrennte lebende Verträge | QA beantwortet „Wie prüfen wir?“, der Changelog „Was änderte sich für Nutzer oder Betrieb?“. Ausführung und technische Details bleiben in Roadmap/Evidence und Git. | Zielarchitektur |
| D-QA-11 | `2026-07-21` | Root-`CHANGELOG.md` folgt einer MIDAS-adaptierten Keep-a-Changelog-Konvention | Reverse Chronologie, `Unreleased`, ISO-Daten und feste Kategorien sind verständlich und breit etabliert, ohne MIDAS in einen fremden Releaseprozess zu zwingen. | Changelog-Vertrag |
| D-QA-12 | `2026-07-21` | Versionsnummern dürfen `MAJOR.MINOR.PATCH` erst nach einem MIDAS-spezifischen Kompatibilitätsvertrag verwenden | Striktes SemVer setzt eine definierte öffentliche API voraus. S1/S2 klären daher zuerst Versionsanker und Releasepraxis; bis dahin wird weder striktes SemVer noch eine erfundene Versionshistorie behauptet. | Versionierung |
| D-QA-13 | `2026-07-21` | Release-Readiness orchestriert bestehende Test-IDs statt Tests zu kopieren | Ein schlankes Gate schafft professionellen Releasefluss ohne achte fachliche Testsuite oder neue Ergebnisduplikate. | `docs/qa/release-readiness.md` |
| D-QA-14 | `2026-07-21` | Artefakte bilden eine nachvollziehbare Kette von Produktvertrag bis exaktem Codezustand | Module Overview, QA-Suite, Runbook, Release-Readiness, Roadmap/Evidence, Changelog und Git besitzen getrennte Aufgaben; dadurch bleibt das Setup prüfbar, ohne Informationen mehrfach zu pflegen. | Traceability |
| D-QA-15 | `2026-07-21` | S1/S2 definieren die MIDAS-Release-Einheit und den Umgang mit getrennten Deploy-Oberflächen | Web/PWA, Android, Edge Functions, SQL und reine Doku können unabhängig geändert werden. Ein Release darf nur behauptet werden, wenn sein betroffener Scope und dessen realer Ausrollstand eindeutig sind. | Release-Scope |
| D-QA-16 | `2026-07-21` | Ein konkreter Testfall besitzt genau eine aktuelle Eigentümer-Suite | Querschnittsmodule dürfen mehrere Suites speisen, aber dieselbe beobachtbare Aussage wird nicht kopiert; andere Suites verlinken nur die Test-ID. | Suite-Ownership |
| D-QA-17 | `2026-07-21` | Testumgebung, Ausführungsart und Datenwirkung sind getrennte Felder | Ein manueller Device-Smoke kann read-only oder produktiv sein; ein einzelnes Feld `Ebene` könnte Gate und Risiko deshalb nicht eindeutig abbilden. | Testfallschema |
| D-QA-18 | `2026-07-21` | Produktive Smokes bleiben Owner-gated und erzeugen Evidence außerhalb der Suite | Dauerhafte Testdefinition und konkrete produktive Ausführung benötigen unterschiedliche Geltung, Datum und Freigabe. | Smoke-Vertrag |
| D-QA-19 | `2026-07-21` | Historische Evidence und heutige Regression werden nur über stabile ID und Archivanker verbunden | Der alte Status bleibt unverändert im Archiv; die aktuelle Suite enthält optional den Herkunftslink, aber keinen kopierten PASS-Zustand. | Historien-Link |
| D-QA-20 | `2026-07-21` | Source of Truth wird nach Leserfrage bestimmt, nicht als pauschale Rangliste | Produktvertrag, Ist-Implementierung, Testdefinition, Ausführungsergebnis und Release-Zusammenfassung beantworten unterschiedliche Fragen; ein Widerspruch wird als Finding behandelt. | Source-of-Truth-Vertrag |
| D-QA-21 | `2026-07-21` | Fachliches Edge-/SQL-Verhalten bleibt in der Domänensuite; `backend-supabase` besitzt nur Plattformverträge | Dadurch werden Trendpilot-, Push- oder Medikationsregeln nicht doppelt unter Backend und Fachdomäne gepflegt. | Backend-Ownership |
| D-QA-22 | `2026-07-21` | MIDAS verwendet künftig ein SemVer-inspiriertes `MAJOR.MINOR.PATCH`, behauptet aber kein striktes SemVer | Die interne Kompatibilitätsfläche ist definierbar, MIDAS besitzt jedoch keine formal veröffentlichte Public API. Historische Versionen werden nicht rückwirkend umgedeutet. | Versionierung |
| D-QA-23 | `2026-07-21` | Der aktuelle Produktstand besitzt noch keine autoritative Versionsnummer | `v1.8.2`, Android `0.1.0` und Cachemarker bezeichnen keine einheitliche heutige Runtime. Bis zum ersten bewussten Release-Cut gilt `Unreleased` plus exakter Git-Commit. | Versionsquelle |
| D-QA-24 | `2026-07-21` | Ein MIDAS-Release ist ein bewusster Owner-Cut mit deklarierter Scope-Liste und grünem Ausrollnachweis aller betroffenen Flächen | Einzelne Deploys oder SQL-Cutover bleiben Komponentenänderungen unter `Unreleased`, bis der gemeinsame Release-Cut freigegeben wird. | Release-Einheit |
| D-QA-25 | `2026-07-21` | Jede abgeschlossene Roadmap prüft in S6 ihre Changelog-Relevanz; ein Release-Cut bleibt eine separate Owner-Entscheidung | Der Changelog wird laufend gepflegt, ohne nach jeder kleinen Änderung künstlich eine neue Version zu veröffentlichen. | Changelog-Pflege |
| D-QA-26 | `2026-07-21` | Git-Tag `vX.Y.Z` wird ab dem ersten geregelten Release der exakte Versionsanker; GitHub Release bleibt optional | Changelog erklärt die Änderung, Tag fixiert den Commit, GitHub Release kann ihn präsentieren. Bestehende Historie erhält keine erfundenen Tags. | Release-Nachweis |
| D-QA-27 | `2026-07-21` | Reconciliation erhält Quellprovenienz und verschmilzt unterschiedliche historische Aussagen nicht | Aktuelles QA, Backup-QA und Changelog können denselben Text oder dieselbe Version mit anderem Kontext enthalten; nur exakt identische Strukturduplikate dürfen begründet zusammengeführt werden. | Verlustfreiheit |
| D-QA-28 | `2026-07-21` | Aktive Links müssen auf heutige Ziele zeigen; historische Links werden nur bei eindeutig gleichem Ziel relativ neu berechnet | Ein Archivumzug darf weder neue Broken Links erzeugen noch einen damals genannten, heute fehlenden Pfad als aktuelle Wahrheit tarnen. | Linkstrategie |
| D-QA-29 | `2026-07-21` | Encoding-Reparatur besitzt drei Belegstufen | Aktive Ziele werden aus sauberer Quelle bzw. aktuellem Vertrag neu formuliert; historische Texte werden nur mit besserer Quelle repariert, sonst originalgetreu mit Schadenshinweis bewahrt. | Encoding |
| D-QA-30 | `2026-07-21` | S4.11 darf nur mechanische Qualitätskorrekturen vornehmen | Eine späte semantische Änderung würde Consumer-Review und Reconciliation ungültig machen; sie muss in den zuständigen S4-Substep zurückgeführt und erneut geprüft werden. | Invalidation |
| D-QA-31 | `2026-07-21` | Monolith und Root-Changelog werden jeweils erst nach grünem Vorab-Abgleich ersetzt | S4.9 darf den Root-Changelog erst nach grünem S4.8-Archivabgleich ersetzen; S4.10 darf den QA-Monolithen erst nach grünem S4.6-S4.9-Abgleich ablösen. | Stop-/Rollback-Gate |
| D-QA-32 | `2026-07-21` | Vier bestätigte aktive Broken Links werden im Zuge der Referenzmigration repariert | Die betroffenen Module Overviews liegen im QA-Migrationsscope und ihre Archivziele sind eindeutig vorhanden; der Intent-Link war nur ein Scanner-Fehlalarm. | Referenzmigration |
| D-QA-33 | `2026-07-21` | Historische Phasen, Legacy-Release-QA und Legacy-Changelog erhalten getrennte S4-Substeps | Die Quellen, Provenienzregeln und Reviewfragen unterscheiden sich; ein gemeinsamer Archivschritt wäre zu groß für einen belastbaren Full Review. | S4-Schnitt |
| D-QA-34 | `2026-07-21` | Edge-Function-Deploy und produktiver Supabase-SQL-Cutover erhalten eigene generische Runbooks | Beide Abläufe wiederholen sich modulübergreifend und benötigen vor Ausführung klare Voraussetzungen, Owner-Gate, Postconditions und Abbruchregeln. | Runbook-Schnitt |
| D-QA-35 | `2026-07-21` | Der Readiness Review empfiehlt künftig sichere S4-Ausführungsblöcke | Kompatible Substeps dürfen gemeinsam laufen, solange Ergebnisse, Findings und Abnahmen ihren ursprünglichen Substep-IDs zugeordnet bleiben; produktive oder irreversible Gates bleiben getrennt. | Workflow-Effizienz |
| D-QA-36 | `2026-07-21` | QA-Quellen werden als getrennte Vollsnapshots archiviert; beim Changelog werden nur belegte Abweichungen doppelt erhalten | Die QA-Versionstitel und Inhalte weichen breit voneinander ab. Beim Changelog sind dagegen 62 Blöcke exakt identisch; nur `v1.5.4` unterscheidet sich und sechs neuere Blöcke existieren ausschließlich im Root. | Archiv-Reconciliation |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `none`
- Neue oder entscheidungsrelevante Konzepte:
  - Keine neuen Werkzeuge und keine produktive Wirkung.
- Geplante Briefing-Gates:
  - `none`
- Nicht erneut zu erklären:
  - normale Markdown-Verschiebungen, relative Links und Lint-Korrekturen.

## Scope und Grenzen

In Scope:

- Vollständige semantische Inventarisierung von `docs/QA_CHECKS.md`.
- Ableitung weiterhin gültiger Regressionen aus allen Inhaltsbereichen, nicht
  nur aus den am Dateiende stehenden QA-Packs.
- Vollständige Klassifizierung des bisherigen `CHANGELOG.md` in Release-Fakt,
  aktuellen QA-Kandidaten, historischen QA-Nachweis,
  Architektur-/Modulvertrag oder reine Legacy-Historie.
- Aufbau einer aktuellen, domänenbasierten QA-Struktur unter `docs/qa/`.
- Aufbau eines schlanken Release-Readiness-Vertrags, der betroffene Suites und
  Nachweise auswählt, aber keine Tests dupliziert.
- Auslagerung operativer Smoke-Anleitungen nach `docs/qa/runbooks/`.
- Archivierung historischer Phasen- und Release-Inhalte unter
  `docs/archive/qa/`.
- Archivierung der vollständigen bisherigen Change-Historie unter
  `docs/archive/history/` und Neuaufbau des Root-Changelogs als lebender,
  gepflegter Release-Vertrag.
- Selektiver Abgleich aktueller Testverträge gegen betroffene Module
  Overviews und direkte Code-Consumer.
- Zielgerichtete Encoding-, Markdownlint-, Link- und Referenzkorrekturen.
- Aktualisierung aktiver QA-Verweise in README, Dev Environment, Templates
  und Module Overviews.

Nicht in Scope:

- Produktcode-, SQL-, Backend-, Android- oder Runtime-Änderungen.
- Ausführung aller fachlichen Regressionstests; diese Roadmap strukturiert
  deren Definitionen.
- Nachträgliche Behauptung, dass historische offene Checks bestanden hätten.
- Vollständige Rekonstruktion jeder MIDAS-Version aus allen Legacy-Monolithen.
- Rückwirkende Erzeugung von Git-Tags, GitHub Releases oder künstlichen
  Versionsdaten, die historisch nicht belegt sind.
- Automatische Release-Note-Generierung oder eine neue CI/CD-Releasepipeline.
- Umschreiben archivierter Roadmaps nur wegen ihrer historischen
  `docs/QA_CHECKS.md`-Verweise.
- Aufbau eines automatisierten Testframeworks.

Roadmap-spezifische Guardrails:

- Vor dem Ersetzen des Monolithen muss jeder H2-/H3-Block einem Zielartefakt
  oder einer begründeten Nichtübernahme zugeordnet sein.
- Semantischer QA-Inhalt darf nicht entfallen. Eine Nichtübernahme ist nur für
  reine Strukturduplikate oder nachweislich identischen Inhalt erlaubt und
  wird in der Reconciliation begründet.
- Historische Checkboxzustände bleiben historische Aussagen; offene Punkte
  werden weder still als bestanden noch als aktueller Pflichtcheck umgedeutet.
- Ein weiterhin relevanter Test aus einer historischen Phase wird in der
  aktuellen Suite neu als statuslose Testdefinition erfasst; seine damalige
  Ausführung bleibt ausschließlich im Archiv.
- Eine aktuelle Suite darf keine Produktarchitektur besitzen, sondern nur auf
  deren Source of Truth verweisen und beobachtbares Verhalten prüfen.
- Derselbe ausführliche Testfall besitzt genau eine aktuelle Source of Truth.
- Aktive QA-Dateien verwenden stabile Test-IDs und keine pro Lauf
  veränderlichen Checkboxzustände.
- Der Changelog enthält nur bemerkenswerte, reale Änderungen. Ausführliche
  technische Nachweise verlinken auf DONE-Roadmap, Git-Tag oder Commit, werden
  aber nicht in den Changelog kopiert.
- `Unreleased` wird bei einem bewussten MIDAS-Release in einen datierten
  Versionsabschnitt überführt und darf nicht erneut zu einem mehrjährigen
  Sammelbecken werden.
- Release-Readiness referenziert Suite-IDs und hält nur Gate-Regeln; konkrete
  PASS-/FAIL-Ergebnisse bleiben in der jeweiligen Roadmap oder Evidence.
- Historische Encoding-Reparaturen müssen durch eine bessere Quelle oder eine
  eindeutig reversible Korrektur belegbar sein.

## Zielstruktur

```text
CHANGELOG.md
docs/
  QA_CHECKS.md
  qa/
    README.md
    release-readiness.md
    core-runtime.md
    health-capture-reports.md
    intake-medication.md
    assistant-voice-intent.md
    push-trendpilot.md
    android-widget.md
    backend-supabase.md
    runbooks/
      boot-error-smoke.md
      push-runtime-smoke.md
      edge-function-deploy-smoke.md
      supabase-sql-cutover.md
      android-device-smoke.md
  archive/
    history/
      MIDAS Legacy Changelog v0.1-v1.8 and Unreleased.md
    qa/
      MIDAS Historical QA Phases 2025-2026.md
      MIDAS Legacy Release QA v0.1-v1.8.md
```

Zuständigkeit der aktuellen Suites:

<!-- markdownlint-disable MD013 -->

| Suite | Test-ID-Präfix | Inhalt |
| --- | --- | --- |
| `core-runtime.md` | `CORE-` | Boot, Auth, State, Realtime, Diagnostics, Main Router, Unlock, globale CSS-/Feedback-Verträge, allgemeine Hub-Navigation und lokale Touchlog-Diagnose |
| `health-capture-reports.md` | `HCR-` | Activity, Appointments, Breath Timer, Capture, Charts, Doctor View, Profile, Reports, Ticker Bar und gesundheitsbezogene Lesepfade |
| `intake-medication.md` | `IM-` | Wasser, Salz, Protein, Medication, Tagesabschnitte, Bestand und Retention |
| `assistant-voice-intent.md` | `AVI-` | Assistant-Surface, Intent Engine, Confirm-Flows, Voice, VAD, Voice-Semantik sowie Assistant-/Voice-Anteile des Hubs |
| `push-trendpilot.md` | `PT-` | Incidents, Push-Transport, Scheduler-Verhalten, Trendpilot und Push-Anteile des Touchlogs |
| `android-widget.md` | `AW-` | Android Shell, Native Auth/OAuth, Widget-Sync, Snapshot und Device-Verhalten |
| `backend-supabase.md` | `BS-` | Domänenneutrale Edge-Runtime-, Grants-, RLS-, Cron-, RPC- und Supabase-Plattformverträge; fachliches Verhalten bleibt in der Domänensuite |
| `runbooks/*.md` | `RB-` | wiederholbare operative Ausführung mit Voraussetzung, Schritten, Erwartung und Abbruchbedingung |
| `release-readiness.md` | `REL-` | stabile Gate-IDs, Auswahl betroffener Suite-IDs, Doku-/Changelog-Prüfung, Ausrollflächen und Nachweisziel; keine fachlichen Testfälle |

<!-- markdownlint-enable MD013 -->

Rollen- und Nachweiskette:

<!-- markdownlint-disable MD013 -->

| Artefakt | Beantwortet | Enthält nicht |
| --- | --- | --- |
| Module Overview | Was soll MIDAS fachlich tun? | Testausführung und Release-Chronik |
| Producer / Consumer / Schema | Was tut der aktuelle Stand tatsächlich? | stillschweigende Änderung des Produktvertrags |
| QA-Suite | Wie wird beobachtbares Verhalten geprüft? | dauerhafte PASS-/FAIL-Ergebnisse |
| Runbook | Wie wird ein technischer oder produktiver Check sicher ausgeführt? | fachliche Produktverträge |
| Release-Readiness | Welche bestehenden Checks und Doku-Gates gelten für diesen Release? | kopierte Testfälle und deren Detailergebnisse |
| Roadmap / Evidence | Was wurde in dieser Änderung tatsächlich geprüft und entschieden? | dauerhafte allgemeine Testdefinitionen |
| `CHANGELOG.md` | Was änderte sich bemerkenswert für Nutzung oder Betrieb? | Commitliste, Syntaxprotokoll und QA-Evidence |
| Git-Commit / Tag | Welcher exakte Dateistand gehört zur Änderung oder zum Release? | menschenlesbare Produktzusammenfassung |
| Historisches Archiv | Was wurde früher behauptet, geprüft oder veröffentlicht? | aktueller Produkt- oder QA-Vertrag |

<!-- markdownlint-enable MD013 -->

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/README.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/QA_CHECKS.md`
- `CHANGELOG.md`
- [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [GitHub Docs: About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- aktive QA-Referenzen in `docs/modules/*.md`
- `C:\Users\steph\Projekte\Backup\Old\QA_CHECKS.md`, falls vorhanden
- Dateiinventar von `C:\Users\steph\Projekte\Backup\Old`

Nur bei konkreter Vertragsfrage:

- zuständiges `docs/modules/* Module Overview.md`
- zugehörige DONE-Roadmap unter `docs/archive/`
- konkrete Legacy-Monolith-Version unter
  `C:\Users\steph\Projekte\Backup\Old`
- aktueller Producer oder Consumer im Produktcode

## Tool Permissions und Gates

Allowed:

- Repo- und Legacy-Dokumente read-only inventarisieren.
- Changelog und vorhandene Versions-/Tag-Referenzen read-only inventarisieren.
- Dateien unter `docs/qa/` und `docs/archive/qa/` anlegen und bearbeiten.
- Dateien unter `docs/archive/history/` anlegen und `CHANGELOG.md` innerhalb
  des beschriebenen Release-Vertrags bearbeiten.
- `docs/QA_CHECKS.md`, aktive Dokumentverweise und betroffene Module
  Overviews im beschriebenen Scope ändern.
- `rg`, Git-Diff, Markdownlint und kleine read-only Prüfscripte verwenden.

User-gated:

- `none`

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- Scope, Datenwirkung oder Architektur still erweitern.
- Produktcode, SQL, Supabase, Android oder Runtime verändern.
- Git-Tags oder GitHub Releases erstellen, ändern oder löschen.
- Legacy-Monolithen massenhaft lesen oder diffen, solange keine konkrete
  historische Lücke dies erfordert.
- Unleserliche historische Aussagen frei rekonstruieren oder erfinden.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `High` | DONE | QA, Changelog, Referenzen, Legacy-Quellen und fünf Ausrollflächen vollständig klassifiziert; Zwei-Quellen-Abgleich ergänzt. |
| S2 | QA-Rollen, Taxonomie und Zielvertrag | `High` | DONE | Ein Eigentümer je Testaussage, mehrdimensionales Testschema, SemVer-inspirierter Zukunftsvertrag und Owner-gated Release-Cut festgelegt. |
| S3 | Verlust-, Geltungs- und Referenzrisiken | `High` | DONE | Verlust-, Status-, Duplikat-, Link-, Encoding- und Teil-Deploy-Risiken kontrolliert; Cutover-Vertrag vorbereitet. |
| S4R | S4 Readiness Review | `High` | DONE | Archivarbeit in drei prüfbare Substeps geteilt, Edge-/SQL-Runbooks ergänzt, S4.10 als Cutover festgelegt und S4.1-S4.11 freigegeben. |
| S4 | Dokumentationsmigration | `je Substep` | DONE | Aktuelle Suites, Runbooks, historische Archive, Changelog, Kompatibilitätsindex und aktive Referenzen umgesetzt; Full Review grün. |
| S5 | Inhalts-, Link-, Lint- und Abschlussreview | `High` | DONE | T-QA-01 bis T-QA-20 grün; fehlende 14 historische Phasen als F-QA-67 ergänzt und exakt reconciliiert. |
| S6 | Source-of-Truth-Sync, Commit und Archiv | `Medium` | DONE | Sources of Truth synchron, Full Review grün, Changelog unter `Unreleased` aktuell und Archivierung freigegeben. |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-QA-01 | `P1` | `Contract` | `fixed` | Kanonischen Einstieg und Kompatibilitätsdatei in D-QA-02/D-QA-03 eindeutig getrennt. |
| F-QA-02 | `P1` | `Doku` | `fixed` | Historische Phasen und Releases müssen vor Monolith-Ersatz vollständig archiviert und abgeglichen sein. |
| F-QA-03 | `P1` | `QA` | `fixed` | Testdefinition und Ausführungsevidence durch D-QA-04 sowie das neue Suite-Schema getrennt. |
| F-QA-04 | `P1` | `Contract` | `fixed` | Aktive Referenzen werden migriert; archivierte Roadmaps bleiben historische Aussagen. |
| F-QA-05 | `P2` | `Doku` | `fixed` | Encoding-Reparatur ist zielgerichtet und quellengebunden statt global-mechanisch. |
| F-QA-06 | `P2` | `Scope` | `fixed` | Vollständige Monolith-Archäologie ausgeschlossen; nur gezielte Lückenprüfung erlaubt. |
| F-QA-07 | `P1` | `QA` | `fixed` | Vollständige Block-Zuordnung und eindeutige Test-IDs sind verpflichtende S5-Gates. |
| F-QA-08 | `P1` | `QA` | `fixed` | D-QA-08 verhindert, dass weiterhin wertvolle Regressionen zusammen mit ihrer abgeschlossenen Phase nur historisch abgelegt werden. |
| F-QA-09 | `P1` | `Contract` | `fixed` | D-QA-09 trennt aktive Links auf heutige Tests von aktiven Belegverweisen auf konkrete historische Phasen. |
| F-QA-10 | `P1` | `Contract` | `fixed` | `CHANGELOG.md` ist nicht mehr nur S1-Quelle, sondern besitzt mit D-QA-10 bis D-QA-12 einen eigenen Ziel- und Geltungsvertrag. |
| F-QA-11 | `P1` | `QA` | `fixed` | Changelog-Einträge werden klassifiziert statt vollständig nach QA kopiert; dadurch entsteht kein neuer QA-/Release-Monolith. |
| F-QA-12 | `P2` | `Doku` | `fixed` | Legacy-Changelog erhält ein eigenes History-Archiv; der Root-Changelog bleibt klein und zukunftsfähig. |
| F-QA-13 | `P2` | `QA` | `fixed` | `release-readiness.md` orchestriert den professionellen Release-Gate-Vertrag, ohne Testfälle oder Evidence zu duplizieren. |
| F-QA-14 | `P1` | `Contract` | `fixed` | S4 besaß noch keinen ausführbaren Changelog-Substep; der heutige S4.9 wurde ergänzt und die Folgeschritte wurden konsistent neu nummeriert. |
| F-QA-15 | `P1` | `QA` | `fixed` | S5 prüfte weder Legacy-Changelog-Reconciliation noch Release-Struktur und Traceability; `T-QA-10` bis `T-QA-15` schließen diese Lücke. |
| F-QA-16 | `P2` | `Contract` | `fixed` | Striktes SemVer wäre ohne definierte öffentliche API eine unbelegte Behauptung; D-QA-12 verlangt zuerst einen MIDAS-Kompatibilitätsvertrag. |
| F-QA-17 | `P2` | `Doku` | `fixed` | Der ursprünglich datierte Legacy-Archivname suggerierte eine nicht belegte Releasegrenze; der neue Name beschreibt nur nachweisbare Versionsinhalte. |
| F-QA-18 | `P1` | `Contract` | `fixed` | Der Release-Begriff berücksichtigte getrennte MIDAS-Ausrollflächen nicht; D-QA-15 sowie S1/S2/S5 verlangen nun Scope- und Deployment-Klarheit. |
| F-QA-19 | `P1` | `Doku` | `fixed` | Das aktuelle `docs/QA_CHECKS.md` enthält sechs Legacy-Versionsblöcke nicht mehr; S4.7 und S5 müssen deshalb aktuellen Monolithen und Backup-QA gemeinsam reconciliieren. |
| F-QA-20 | `P1` | `Contract` | `fixed` | Es existiert keine einheitliche MIDAS-Produktversion: Git-Tags und GitHub Releases fehlen, Android `0.1.0` und Service-Worker-Cachemarker sind nur Teilflächenmarker. S2 definiert daher zuerst die Release-Einheit. |
| F-QA-21 | `P1` | `QA` | `fixed` | Wiederverwendbare Tests, vergangene PASS-Haken und offene Owner-/Runtime-Smokes sind vermischt; S4 trennt statuslose Testdefinition, historische Evidence und offene Beobachtung explizit. |
| F-QA-22 | `P1` | `QA` | `fixed` | Mehrere historische oder aktive Checks nennen veraltete Pfade wie `assets/js/main.js`; jede aktuelle Übernahme wird gegen Module Overview und direkten Consumer validiert. |
| F-QA-23 | `P2` | `Doku` | `fixed` | Module Overviews duplizieren teilweise QA-Inhalte und vereinzelt Statuswerte wie `(done)`; nach S4 bleiben dort nur Produktvertrag und Link zur zuständigen Suite. |
| F-QA-24 | `P2` | `Doku` | `fixed` | 291 QA- und 12 Changelog-Zeilen zeigen bekannte Mojibake-Muster; Reparatur bleibt quellengebunden und aktive Zieldokumente müssen frei davon sein. |
| F-QA-25 | `P1` | `Contract` | `fixed` | Der Changelog besitzt doppelte, undatierte und falsch einsortierte Versionsblöcke sowie vermischte QA-/Architekturinhalte; Legacy wird vollständig archiviert, der Root-Changelog nur aus belegten Release-Fakten neu aufgebaut. |
| F-QA-26 | `P2` | `Scope` | `fixed` | Aktive Referenzen und 42 Archivverweise wurden getrennt; nur aktive Consumer werden migriert, historische Dokumente bleiben unverändert. |
| F-QA-27 | `P1` | `QA` | `fixed` | Offene Checkboxen werden weder als bestanden noch als automatisch weiterhin gültig behandelt; sie bleiben historische TODO-Evidence oder werden nach Consumer-Prüfung als statuslose aktuelle Tests übernommen. |
| F-QA-28 | `P1` | `QA` | `fixed` | Das geplante Einzelfeld `Ebene` vermischte Umgebung, Automatisierung und Datenwirkung; D-QA-17 trennt `Ebene`, `Ausführung` und `Wirkung`. |
| F-QA-29 | `P1` | `Contract` | `fixed` | Domänen-Edge- und SQL-Tests konnten gleichzeitig Fachsuite und `backend-supabase` gehören; D-QA-21 trennt fachliches Verhalten von Plattformvertrag. |
| F-QA-30 | `P1` | `Contract` | `fixed` | Breath Timer, Hub, Profile, Touchlog, Ticker und globale UI-Verträge besaßen mehrdeutige Suite-Ziele; die S2-Ownership-Matrix ordnet jede konkrete Aussage eindeutig zu. |
| F-QA-31 | `P1` | `Release` | `fixed` | Keine bestehende Versionsmarke beschreibt den heutigen Gesamtstand; D-QA-23 verbietet deshalb eine erfundene aktuelle Version und verwendet bis zum ersten geregelten Cut `Unreleased` plus Commit. |
| F-QA-32 | `P1` | `Release` | `fixed` | Ein erfolgreicher Edge-Deploy oder SQL-Cutover ist noch kein vollständiger MIDAS-Release; D-QA-24 verlangt Scope-Liste und Ausrollnachweis jeder betroffenen Fläche. |
| F-QA-33 | `P2` | `Doku` | `fixed` | Das ursprünglich geplante strikte SemVer wäre für MIDAS nicht belastbar; D-QA-22 definiert eine SemVer-inspirierte interne Kompatibilitätsregel ohne rückwirkende Umdeutung. |
| F-QA-34 | `P1` | `QA` | `fixed` | Historischer PASS und heutiger Regressionstest hatten noch keinen duplikationsfreien Linkvertrag; D-QA-19 verbindet beide ausschließlich über ID und Archivanker. |
| F-QA-35 | `P2` | `Contract` | `fixed` | `REL-` konnte als achtes Testpräfix missverstanden werden; es bezeichnet ausschließlich Release-Gates, die fachliche Suite-IDs orchestrieren. |
| F-QA-36 | `P1` | `Doku` | `fixed` | Ohne verbindlichen S6-Check könnte der Changelog erneut veralten; D-QA-25 macht die Relevanzprüfung pro Roadmap verpflichtend, ohne automatisch einen Release zu schneiden. |
| F-QA-37 | `P1` | `Doku` | `fixed` | Historische Quellen enthalten gleiche Überschriften und Texte in unterschiedlichen Läufen; D-QA-27 verbietet kontextlosen Merge und verlangt Provenienz je Archivblock. |
| F-QA-38 | `P1` | `QA` | `fixed` | 29 Gruppen mit insgesamt 69 exakt wiederholten QA-Checks könnten als aktuelle Duplikate migriert werden; S5 prüft semantische Ownership und genau eine aktuelle ID. |
| F-QA-39 | `P1` | `Contract` | `fixed` | Relative Links können beim Verschieben nach `docs/archive/qa/` brechen; D-QA-28 trennt neu berechenbare Ziele von nur historisch lesbaren Pfadangaben. |
| F-QA-40 | `P2` | `Doku` | `fixed` | Vier aktive Module Overviews verweisen auf vorhandene Roadmaps ohne das notwendige `archive/`-Segment; S4.10 und ein aktiver Linkscan wurden ergänzt. |
| F-QA-41 | `P1` | `Doku` | `fixed` | Mehrfaches Mojibake kann durch globale Ersetzungen weiter beschädigt werden; D-QA-29 definiert belegabhängige Reparatur und Originalerhalt bei Unsicherheit. |
| F-QA-42 | `P1` | `QA` | `fixed` | Eine späte semantische Bereinigung in S4.11 könnte bereits geprüfte Tests verändern; D-QA-30 beschränkt den Schritt auf Mechanik und erzwingt bei Semantik die Rückkehr zum Owner-Substep. |
| F-QA-43 | `P1` | `Contract` | `fixed` | Der bisherige Stop-Vertrag nannte keine präzise Cutover-Grenze; D-QA-31 blockiert S4.10, bis Suites, Runbooks, Archive und Changelog vollständig vorab reconciliiert sind. |
| F-QA-44 | `P1` | `Release` | `fixed` | Teil-Deploys können trotz Changelog-Eintrag fälschlich als produktiver Gesamtstand erscheinen; Release-Readiness und `T-QA-15` verlangen eine flächenspezifische Ausrollmatrix. |
| F-QA-45 | `P2` | `Doku` | `fixed` | Ohne Template-Sync würde der neue Changelog-Vertrag nach dieser Roadmap erneut vergessen; S4.10 und S6 synchronisieren die verpflichtende Changelog-Relevanzprüfung. |
| F-QA-46 | `P1` | `Scope` | `fixed` | S4.6 vereinte zwei QA-Archive und die gesamte Changelog-Historie in einem Review; D-QA-33 teilt den Schritt in S4.6 bis S4.8 mit separaten Gates. |
| F-QA-47 | `P1` | `QA` | `fixed` | Wiederkehrende Edge-Deploy-/Remote-Smokes und produktive SQL-Cutover waren nicht durch ein generisches Runbook abgedeckt; D-QA-34 ergänzt beide Abläufe in S4.5. |
| F-QA-48 | `P1` | `QA` | `fixed` | S4.5 war trotz produktiv wirksamer Deploy-/SQL-Anleitungen nur als `Consumer`/`Medium` geplant; der Substep verwendet nun `Full` Review und `High` Reasoning. |
| F-QA-49 | `P2` | `QA` | `fixed` | Das Testfallschema im neuen QA-Einstieg verwendete zunächst `CORE-001` und konnte dadurch als echter Test erkannt werden; das Beispiel verwendet nun den nicht ausführbaren Platzhalter `PREFIX-NNN`. |
| F-QA-50 | `P2` | `Doku` | `fixed` | Die Resume Card war auf mehr als 50 Zeilen angewachsen und verletzte den kompakten Handoff-Vertrag; sie enthält nun nur den gültigen Arbeitsstand für S4.2. |
| F-QA-51 | `P1` | `QA` | `fixed` | Der erste HCR-Entwurf behauptete Pause/Resume und Reduced Motion für den Atemtimer, obwohl der aktuelle Consumer stattdessen Presets, zweistufigen Abbruch und Abschluss-Cleanup besitzt; HCR-014 folgt nun der realen State Machine. |
| F-QA-52 | `P2` | `QA` | `fixed` | CORE-009 war trotz visueller Viewport-Prüfung als automatisiert markiert; die Ausführungsart ist nun korrekt `manual`. |
| F-QA-53 | `P1` | `QA` | `fixed` | Wegwerfbare S4.2-Testdaten hatten zunächst keinen expliziten Cleanup; jeder `disposable`-Test nennt nun Wiederherstellung, Undo, Delete oder Fixture-Verwurf. |
| F-QA-54 | `P1` | `QA` | `fixed` | AW-009 beschrieb den Legacy-/V2.1-Merge zunächst umgekehrt; ein abweichender eingehender Legacy-Status ersetzt tatsächlich veraltete Detaildaten, statusgleiche Details bleiben erhalten. |
| F-QA-55 | `P2` | `Doku` | `fixed` | BS-009 enthielt einen fehlerhaften Abschlusswinkel im Link auf `sql/HOW_TO.md`; der relative Link ist korrigiert und geprüft. |
| F-QA-56 | `P1` | `QA` | `fixed` | BS-010 klassifizierte Start und Stop des lokalen Supabase-Stacks als `read-only`; der Test ist nun `disposable` und besitzt einen expliziten Stop-/Cleanup-Vertrag. |
| F-QA-57 | `P1` | `Security` | `watchlist` | Out-of-Scope-Produktfinding: `MainActivity` schreibt die vollständige OAuth-Callback-URI vor `markOAuthCallbackHandled` in `AndroidBootTrace`, dessen generischer Logger nicht redigiert. Owner ist der nächste Android-Codefix; AW-014 und RB-005 blockieren bis zu Fix und Device-Nachweis jeden Android-Release. |
| F-QA-58 | `P1` | `Doku` | `fixed` | `backend/README.md` nannte noch den veralteten Deploy-Workdir `backend/supabase`; der Deploy-Vertrag verwendet nun wie `DEV_ENVIRONMENT.md` den Repo-Root mit `--workdir backend --use-api`. |
| F-QA-59 | `P2` | `Doku` | `fixed` | Der QA-Einstieg bezeichnete die in S4.5 angelegten Runbooks weiterhin als zukünftige Zielpfade; er verlinkt nun alle fünf realen Runbooks. |
| F-QA-60 | `P2` | `Doku` | `fixed` | Unterbrochene nummerierte Listen und lange Vertragszeilen erzeugten Markdownlint-Befunde; Listenverschachtelung und Zeilenumbrüche wurden ohne Semantikänderung korrigiert. |
| F-QA-61 | `P1` | `QA` | `fixed` | Shell-Platzhalter wie `<function>` und `<all\|med\|bp>` waren nicht direkt ausführbar; Runbooks verwenden nun explizite Variablen und benennen für lokales SQL den Supabase-Studio-/`psql`-Pfad. |
| F-QA-62 | `P2` | `Workflow` | `fixed` | Der bisherige Readiness-Vertrag definierte Reviewtiefe und Gates, aber keine Empfehlung für sichere S4-Batches; Template, Workflow Contract und Template-README verlangen nun eine begründete Blockempfehlung. |
| F-QA-63 | `P2` | `Doku` | `fixed` | Der erste S4.6-Archivkopf verlinkte auf die nicht vorhandene Datei `docs/qa/runbooks/README.md`; der Link zeigt nun auf die kanonische Runbook-Leseroute in `docs/qa/README.md`. |
| F-QA-64 | `P1` | `Contract` | `fixed` | S4.10 zeigte, dass die neuen Templates die verpflichtende S6-Changelog-Relevanzentscheidung noch nicht enthielten; Template, Workflow Contract und Template-README sind synchronisiert. |
| F-QA-65 | `P2` | `Doku` | `fixed` | Sieben neu geänderte Zeilen in README und Module Overviews erzeugten MD013-Befunde; nur diese neuen Zeilen wurden ohne Semantikänderung gekürzt oder umgebrochen. |
| F-QA-66 | `P2` | `Doku` | `watchlist` | Der breite Lint-Lauf zeigt 484 bereits bestehende Befunde in 14 Legacy-Dokumenten. Der kanonische QA-Scope und sämtliche neu geänderten Zeilen sind sauber; eine globale Reformatierung bleibt wegen D-QA-30 ein eigener Wartungsschritt. |
| F-QA-67 | `P1` | `QA` | `fixed` | Der S4.6-Schnitt archivierte zunächst nur 26 Phasen vor `v0.1.0`; 14 Phasen ab `Diagnostics Layer Forwarding` bis zum damaligen Dateiende fehlten. Ein getrenntes, quellentreues Supplement schließt die Lücke; beide Bereiche plus Legacy-Release-QA rekonstruieren alle 100 H2-Blöcke exakt. |
| F-QA-68 | `P1` | `Contract` | `fixed` | Der S6-Vertrag verlangte pauschal die Schließung aller P0/P1 und widersprach damit zulässigen externen Watchlists wie F-QA-57. Roadmap, Template und Workflow Contract verlangen nun die Schließung aller In-Scope-P0/P1 sowie Owner, Folgeartefakt und Gate für externe P0/P1. |
| F-QA-69 | `P2` | `Doku` | `fixed` | Der redaktionelle Kopf des Legacy-Changelog-Archivs kündigte den in S4.9 bereits aufgebauten Release-Vertrag noch im Futur an. Nur der nicht historische Archivhinweis verlinkt nun Root-Changelog und Release-Readiness; der Primärsnapshot blieb unverändert. |

<!-- markdownlint-enable MD013 -->

## Initialer Contract Review

- Ziel gegen den besprochenen Umbau geprüft:
  - aktuelle QA, Runbooks und Historie sind klar getrennt.
- Verlustfreiheit geprüft:
  - historische Inhalte werden vor dem Ersetzen der Ausgangsdatei gesichert
    und blockweise abgeglichen.
  - weiterhin gültige Regressionen aus abgeschlossenen Phasen werden als
    neue statuslose Testdefinitionen übernommen.
- Source-of-Truth geprüft:
  - Module Overviews besitzen Produktverträge; QA besitzt beobachtbare
    Testdefinitionen; Roadmap/Evidence besitzt Ausführungsergebnisse.
  - `CHANGELOG.md` besitzt nur bemerkenswerte Änderungen pro Release;
    Git bewahrt den vollständigen technischen Diff.
- Referenzvertrag geprüft:
  - aktive Consumer werden migriert, historische Referenzen bleiben lesbar,
    `docs/QA_CHECKS.md` bleibt als Kompatibilitätsanker.
  - aktive Links auf heutige Tests und aktive Beleglinks auf historische
    Phasen erhalten unterschiedliche Zielpfade.
- Token- und Wartungsvertrag geprüft:
  - neue Chats lesen zuerst nur `docs/qa/README.md` und danach die betroffene
    Suite oder das konkrete Runbook.
  - Release-Arbeit liest zusätzlich `docs/qa/release-readiness.md` und den
    kompakten Root-Changelog, nicht die vollständige Legacy-Chronik.
- Legacy-Strategie geprüft:
  - vorhandene QA-/Changelog-Quellen werden genutzt; Monolithen nur gezielt.
- Branchennahe Konvention geprüft:
  - Keep-a-Changelog-Struktur, ISO-Daten und reverse Chronologie werden
    übernommen; SemVer wird wegen MIDAS' privatem Produktcharakter nicht blind
    behauptet, sondern als dokumentiertes MIDAS-Versionsschema adaptiert.
- Ergebnis:
  - `PASS`; alle initialen Findings `F-QA-01` bis `F-QA-18` sind im Vertrag
    korrigiert, S1 darf beginnen.

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Pflichtreferenzen vollständig lesen.
2. Alle H2-/H3-Blöcke von `docs/QA_CHECKS.md` mit Typ, Zeitraum, Status,
   Fachbereich und Zielkandidat inventarisieren.
3. In historischen Phasen weiterhin gültige Regressionen markieren, die
   zusätzlich ohne Ausführungsstatus in eine aktuelle Suite gehören.
4. Aktive und historische Referenzen auf `docs/QA_CHECKS.md` getrennt
   erfassen.
5. Aktuelle Suites gegen ihre Module Overviews und direkte Consumer
   stichprobenartig auf Gültigkeit prüfen.
6. Altes `QA_CHECKS.md`, Changelog und Legacy-Dateiinventar als historische
   Quellen erfassen, ohne Monolithen breit zu öffnen.
7. Jeden bisherigen Changelog-Versionsblock und `Unreleased`-Eintrag als
   Release-Fakt, aktuellen QA-Kandidaten, historischen QA-Nachweis,
   Architekturvertrag oder reine Legacy-Historie klassifizieren.
8. Aktuelle Versionsquelle, vorhandene Git-Tags und reale MIDAS-Releasepraxis
   read-only feststellen; fehlende Historie nicht erfinden.
9. Web/PWA, Android, Edge Functions, SQL und Doku als mögliche getrennte
   Release-/Deploy-Oberflächen inventarisieren und heutige Versions- oder
   Ausrollmarker feststellen.
10. Encoding-Schäden, doppeldeutige Phasennamen, eingebettete Runbooks und
   vermischte State-Verträge markieren.
11. Annahmen von belegten Fakten trennen.
12. Contract Review, Korrektur und Abnahme durchführen.

Ergebnis:

### Systemkarte / Quellenumfang

<!-- markdownlint-disable MD013 -->

| Quelle | Belegter Iststand | Klassifizierung / Ziel |
| --- | --- | --- |
| `docs/QA_CHECKS.md` | 2.882 Zeilen; 100 H2, 15 H3; 440 erledigte und 322 offene Checkboxen; 291 Zeilen mit Mojibake-Muster | Jeder Block fällt in aktuelle statuslose Suite, Runbook, historische QA oder eine Kombination aus aktueller Regression und historischer Evidence. |
| `CHANGELOG.md` | 823 Zeilen; 69 H2, 68 Versionsüberschriften, 66 eindeutige Versionsnamen; `1.8.2` und `1.7.5` doppelt; keine datierten Release-Überschriften; 12 Mojibake-Zeilen | Vollständige Legacy-Chronik archivieren; nur belegte bemerkenswerte Release-Fakten in den neuen Root-Changelog übernehmen. |
| Backup-`QA_CHECKS.md` | 971 Zeilen; 61 H2; sechs Versionsblöcke nur dort vorhanden: `0.7.0`, `1.2.0`, `1.4.0`, `1.4.1`, `1.4.5`, `1.5.4` | Verpflichtende zweite Quelle für `MIDAS Legacy Release QA v0.1-v1.8.md`; kein Ersatz durch den aktuellen Monolithen allein. |
| Backup-`CHANGELOG.md` | 666 Zeilen; 63 H2; inhaltlich nicht identisch zum Root-Changelog | Historische Vergleichsquelle; Root-Changelog bleibt primäre zu archivierende Fassung. |
| `C:\Users\steph\Projekte\Backup\Old` | Monolith-Builds von `v0.1.0` bis `v1.7.5.7` sowie alte QA-/Changelog-Quellen | Nur gezielte Lückenreferenz; kein breit angelegter Monolith-Diff. |

<!-- markdownlint-enable MD013 -->

### QA-Zielkarte

<!-- markdownlint-disable MD013 -->

| Quellbereich | Inhaltstyp | Zielkandidat |
| --- | --- | --- |
| Zeilen 1-751 | Neuere abgeschlossene Roadmap-Phasen mit wiederverwendbaren Regressionen, produktiven Nachweisen und einzelnen offenen Smokes | Fachsuite plus historische Phase; produktive Abläufe zusätzlich als Runbook, falls wiederholbar. |
| Zeilen 752-1121 | Boot-/Fehler-Runbooks, Assistant-, Doctor-, Trendpilot-, Auth- und Asset-Prüfungen | `core-runtime`, `assistant-voice-intent`, `health-capture-reports`, `push-trendpilot` sowie `docs/qa/runbooks/`. |
| Zeilen 1122-2314 | Legacy-Versionen und damalige Release-Checklisten von `v0.1` bis `v1.8.2` einschließlich `Unreleased` | `docs/archive/qa/MIDAS Legacy Release QA v0.1-v1.8.md`; weiterhin gültige generische Regressionen zusätzlich statuslos in die zuständige Suite. |
| Zeilen 2315-2882 | Heutige fachliche Regression-Packs für Trendpilot, Diagnostik, Medikation, Push, Voice, Hydration, Android, Protein und weitere Module | Zuständige aktuelle Suite; vorhandene PASS-/DONE-Zustände nicht übernehmen. |

<!-- markdownlint-enable MD013 -->

- Absichtliche Negativdaten wie `2026-02-31` sind belegte Invalid-Date-Tests
  und keine zu reparierende Datums- oder Encoding-Korruption.

### Changelog-Zielkarte

- `Unreleased` ist ein gemischter Arbeitsblock aus Release-Fakten,
  QA-Hinweisen, Pfaden und Architekturtext; er wird vollständig archiviert
  und eintragsweise gegen den neuen Geltungsvertrag geprüft.
- Alle 68 bisherigen Versionsblöcke sind zunächst Legacy-Historie. Doppelte
  und falsch einsortierte Blöcke bleiben im Archiv sichtbar; sie werden nicht
  still zu einer erfundenen Releasefolge verschmolzen.
- QA- und Architekturhinweise werden nur bei heutiger Gültigkeit in die
  zuständige Suite bzw. Source of Truth überführt, nicht in den neuen
  Root-Changelog kopiert.

### Betroffene Schichten

- Aktive QA-Consumer mit direktem `QA_CHECKS.md`-Verweis:
  `README.md`, `docs/DEV_ENVIRONMENT.md`, `docs/templates/README.md`,
  `docs/templates/MIDAS Roadmap Workflow Contract.md` sowie die Module
  Overviews für Breath Timer, Hydration, Intake, Medication, Profile und
  Touchlog.
- 42 zusätzliche Verweise liegen ausschließlich im Archiv und bleiben
  historische Aussagen.
- `README.md` ist der einzige aktive Consumer des Root-Changelogs.

### Belegte Verträge / Release-Flächen

<!-- markdownlint-disable MD013 -->

| Ausrollfläche | Heutiger Mechanismus | Versions-/Nachweislage |
| --- | --- | --- |
| Web/PWA und aktive Dokumentation | GitHub Pages aus `main` und Repository-Root | Der aktuelle `main`-Commit ist der reale Stand; keine eigene Produktversion. |
| Android/TWA/Widget | lokaler Gradle-APK-Build und Geräteinstallation | `versionCode=1`, `versionName=0.1.0`; nur Android-Shell-Version. |
| Edge Functions | separate Supabase-CLI-Deploys je Funktion | Acht Funktionen; Deploy-Stand ist nicht durch den Root-Changelog garantiert. |
| SQL/Supabase | nummerierte SQL-Dateien plus bewusster produktiver Cutover | Schemaänderung und Dateiversion sind eigenständige Nachweise. |
| GitHub Actions | vier Scheduler-Workflows für Incident Push, Monthly Report, Protein Targets und Trendpilot | Workflow-Run belegt Ausführung, aber keinen vollständigen MIDAS-Release. |

<!-- markdownlint-enable MD013 -->

- Git besitzt derzeit keine Tags; GitHub besitzt keine Releases.
- Service-Worker-Marker `v6` und `v2` sind Cache-Invalidierung, keine
  MIDAS-Produktversion.
- Der aktuelle Root-Changelog kann deshalb keinen einheitlich produktiven
  Stand aller Ausrollflächen belegen.

### Offene Fragen

- `none` für S1. Die verbindliche Definition von Release-Einheit,
  Suite-Ownership und Referenzrollen ist planmäßig Gegenstand von S2.

### Doku-Sync

- Erfolgt; ausschließlich Roadmap-Analyse und Findings wurden geändert.

### S1 Contract Review und Findings-Korrektur

- Vollständigkeit:
  - Alle 100 H2- und 15 H3-Blöcke des aktuellen QA-Monolithen sind über
    lückenlose Quellbereiche klassifiziert.
  - Alle 69 H2-Blöcke des Changelogs sind über `Unreleased`, 68
    Versionsblöcke und die Legacy-Archivregel erfasst.
- Verlustfreiheit:
  - Der aktuelle QA-Monolith allein ist kein vollständiger historischer
    Ausgangsbestand. S4.7 und `T-QA-05` wurden auf den gemeinsamen Abgleich
    mit dem Backup-QA-Verzeichnis verschärft.
  - Offene Checkboxen, abgeschlossene Evidence und aktuelle Testdefinitionen
    behalten unterschiedliche Bedeutungen.
- Consumer- und Pfadprüfung:
  - Aktive und historische Referenzen sind getrennt.
  - Veraltete Pfade werden nicht mechanisch übernommen, sondern vor der
    Migration gegen Module Overview und direkten Consumer geprüft.
- Release-Vertrag:
  - Android-, Cache-, SQL-, Edge- und GitHub-Marker werden nicht als
    gemeinsame MIDAS-Version missverstanden.
  - S2 muss die Release-Einheit definieren, bevor S4.9 einen neuen lebenden
    Changelog erzeugt.
- Scope:
  - Keine Produkt-, Runtime-, Datenbank-, Tag- oder Release-Änderung erfolgt.
- Ergebnis:
  - `PASS`; `F-QA-19` bis `F-QA-27` wurden im Vertrag korrigiert.

Exit: Jeder bestehende QA- und Changelog-Block ist klassifiziert; keine
unbekannte Inhaltsklasse oder aktive Referenz bleibt offen.

## S2 - QA-Rollen, Taxonomie und Zielvertrag

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Rollen von QA-Index, Suite, Runbook, Release-Readiness, Roadmap-Evidence,
   Module Overview, Changelog, Git und historischem Archiv verbindlich
   abgrenzen.
2. Zielstruktur und Suite-Zuständigkeiten gegen das S1-Inventar prüfen.
3. Test-ID-Präfixe und ein kompaktes Testfallschema festlegen:
   Vertrag, Ebene, Ausführungsart, Datenwirkung, Voraussetzung, Aktion,
   Erwartung, Invalidation sowie optionale Runbook- und Historienlinks.
4. Regeln für manuelle, statische, disposable und produktive Smokes
   definieren, ohne Ausführungsstatus dauerhaft in Suites zu speichern.
5. Source-of-Truth-Priorität und Linkstrategie festlegen.
6. Kriterien für aktuelle Übernahme, historische Archivierung, Runbook-
   Auslagerung und begründete Nichtübernahme finalisieren.
7. Festlegen, wie ein historischer Nachweis und sein weiterhin gültiger
   aktueller Regressionstest ohne Status- oder Textduplikation verbunden
   werden.
8. Changelog-Vertrag festlegen:
   - `Unreleased` und reverse chronologische Releases
   - ISO-Datum `YYYY-MM-DD`
   - nur benötigte Kategorien `Added`, `Changed`, `Fixed`, `Removed`,
     `Security`
   - bemerkenswerte Änderungen statt Commit-/Syntaxprotokoll
9. Entscheiden, ob ein klarer MIDAS-Kompatibilitätsvertrag
   `MAJOR.MINOR.PATCH` trägt. Release-Cut, Versionsquelle,
   Tag-/Roadmap-Link und erlaubte historische Unschärfe definieren; ohne
   belastbaren Vertrag nur eine SemVer-inspirierte, nicht strikte Benennung
   dokumentieren.
10. Release-Einheit und Scope-Kennzeichnung festlegen: bestimmen, wann ein
    repoübergreifender MIDAS-Release vorliegt, wie Teiländerungen an Web/PWA,
    Android, Edge Functions, SQL oder Doku bezeichnet werden und wann ihr
    Ausrollstatus als produktiv gelten darf.
11. Release-Readiness-Vertrag mit Auswahl betroffener Suite-IDs,
    Nachweisziel, Doku-/Changelog-Gate, betroffenen Ausrollflächen und
    bewusster Owner-Entscheidung festlegen.
12. Contract Review, Korrektur und Abnahme durchführen.

Ergebnis:

### S2 Artefakt- und Source-of-Truth-Vertrag

<!-- markdownlint-disable MD013 -->

| Leserfrage | Kanonisches Artefakt |
| --- | --- |
| Was soll MIDAS fachlich tun? | zuständiges Module Overview |
| Was tut der aktuelle Stand tatsächlich? | Producer, Consumer, Schema oder Konfiguration |
| Wie wird das Verhalten wiederholbar geprüft? | genau eine aktuelle QA-Suite |
| Wie wird ein technischer oder produktiver Ablauf sicher ausgeführt? | Runbook |
| Was wurde in dieser Änderung tatsächlich ausgeführt und entschieden? | aktive Roadmap oder separate Evidence |
| Was änderte sich bemerkenswert? | Root-`CHANGELOG.md` |
| Welcher exakte Dateistand gehört dazu? | Git-Commit und ab geregeltem Release Git-Tag |
| Was galt oder geschah früher? | historisches QA-/Changelog-Archiv |

<!-- markdownlint-enable MD013 -->

- Diese Zuordnung ist keine pauschale Rangliste. Wenn Produktvertrag und
  Ist-Implementierung voneinander abweichen, entsteht ein Finding; keine
  Quelle überschreibt die andere still.
- Module Overviews behalten kurze fachliche Akzeptanzanker, verlinken für
  ausführliche Regressionen aber die Eigentümer-Suite. Ausführungsstatus und
  lange Testschritte werden dort nach S4 nicht mehr dupliziert.

### S2 Suite-Ownership

<!-- markdownlint-disable MD013 -->

| Eigentümer | Primäre Module / Aussagen | Zulässige Querschnittsregel |
| --- | --- | --- |
| `CORE-` | Auth, Bootflow, CSS-Grundverträge, Diagnostics, Main Router, State, Unlock, globale Feedback-Regeln, allgemeine Hub-Navigation und lokale Touchlog-Diagnose | Fachliche Hub-, Touchlog- oder UI-Flows verlinken ihre jeweilige Domänensuite. |
| `HCR-` | Activity, Appointments, Breath Timer, Capture, Charts, Doctor View, Profile, Reports, Ticker Bar | Datenbankzugriff wird nur dann `BS-`, wenn die Aussage rein Plattform/RLS/RPC betrifft. |
| `IM-` | Hydration, Intake, Medication, Protein, Tagesabschnitte, Bestand und Retention | Medication-Push-Fälligkeit gehört `PT-`; Medikamenten-Slot-/Bestandssemantik bleibt `IM-`. |
| `AVI-` | Assistant, Intent Engine, VAD, Voice Command Semantics sowie Assistant-/Voice-/Pending-Context-Anteile des Hubs | Fachnavigation wird nicht dupliziert; AVI prüft nur Assistant-/Voice-Verhalten. |
| `PT-` | Incident Push, Push-Transport, Scheduler, Trendpilot und Push-Anteile des Touchlogs | Generische Edge-Runtime-/Grant-Verträge gehören `BS-`; fachliche Pushentscheidung bleibt `PT-`. |
| `AW-` | Android Native Auth, TWA/Shell, Widget-Sync, Snapshot und Device-Verhalten | Web-Fachlogik bleibt in ihrer Domänensuite; AW prüft Bridge und Gerätedarstellung. |
| `BS-` | Supabase Core, domänenneutrale Edge-Runtime, Grants, RLS, Cron, RPC und Plattformkonfiguration | Keine Kopie fachlicher Trendpilot-, Push-, Report- oder Medication-Erwartungen. |

<!-- markdownlint-enable MD013 -->

- Ownership gilt pro beobachtbarer Aussage, nicht pauschal pro Datei oder
  Modul. Ein Querschnittsmodul darf deshalb Testfälle in mehreren Suites
  besitzen, derselbe ausführliche Testfall jedoch nur in einer.
- Andere Suites und Release-Readiness referenzieren ausschließlich die stabile
  Eigentümer-ID.

### S2 Testfall- und ID-Vertrag

Aktuelle Testfälle verwenden `PREFIX-NNN` und folgendes Pflichtschema:

```text
### CORE-001 - Kurzer beobachtbarer Titel

- Vertrag: Module Overview oder anderer fachlicher Source-of-Truth-Link
- Ebene: static | local-runtime | browser | device | remote
- Ausführung: automated | manual | owner-observation
- Wirkung: read-only | disposable | productive
- Voraussetzung: benötigter Zustand
- Aktion: reproduzierbarer Prüfschritt
- Erwartung: beobachtbares Ergebnis
- Invalidiert durch: Änderungen, nach denen der Test erneut zu prüfen ist
- Runbook: optionaler RB-Link
- Historie: optionaler Archivanker
```

- Aktuelle Suites enthalten keine Ergebnischeckbox, kein PASS-/FAIL und kein
  Ausführungsdatum.
- IDs werden nicht umnummeriert oder für eine andere Aussage wiederverwendet.
  Bei materiell neuer Semantik entsteht eine neue ID; reine Präzisierung
  behält die ID.
- `RB-` bezeichnet operative Runbooks. `REL-` bezeichnet Release-Gates und
  ist ausdrücklich kein fachlicher Testfall.
- Ein historischer Archivblock darf auf eine heutige ID verweisen. Die heutige
  Suite darf optional auf den Archivanker verweisen. Der historische Status
  wird in keine Richtung kopiert.

### S2 Smoke- und Evidence-Vertrag

<!-- markdownlint-disable MD013 -->

| Dimension | Werte | Vertragswirkung |
| --- | --- | --- |
| Ebene | `static`, `local-runtime`, `browser`, `device`, `remote` | Beschreibt, wo die Beobachtung stattfindet. |
| Ausführung | `automated`, `manual`, `owner-observation` | Beschreibt, wer oder was den Check ausführt. |
| Wirkung | `read-only`, `disposable`, `productive` | Bestimmt Gate, Cleanup und Nachweisbedarf. |

<!-- markdownlint-enable MD013 -->

- `static` und lokale read-only Checks dürfen ohne Owner-Gate laufen.
- `manual` bedeutet nur manuelle Ausführung und sagt nichts über Risiko oder
  Schreibwirkung aus.
- `disposable` benötigt isolierte Testdaten, vorab definiertes Cleanup und
  einen Nachweis, dass kein produktiver Restzustand bleibt.
- `productive` benötigt ein sichtbares Owner-Gate in der aktiven Roadmap,
  bevorzugt einen Preview-/Dry-Run und anschließend datierte Evidence mit
  Umgebung, Ergebnis und betroffenen Test-IDs.
- Remote-read-only-Prüfungen dürfen produktive Daten lesen, aber weder
  Zustände, Scheduler noch Nutzerkommunikation verändern.
- Suite und Runbook bleiben nach einem Lauf unverändert; nur Roadmap/Evidence
  dokumentiert das konkrete Ergebnis.

### S2 Migrationskriterien

<!-- markdownlint-disable MD013 -->

| Quellinhalt | Ziel | Regel |
| --- | --- | --- |
| heute gültige, beobachtbare Regression | aktuelle Eigentümer-Suite | statuslos neu formulieren und gegen Consumer prüfen |
| vergangener Lauf, PASS/TODO, Phase oder Release-Abnahme | historisches QA-Archiv | damaligen Status und damalige Formulierung erhalten |
| wiederholbare technische Schrittfolge mit Gate, Wirkung oder Cleanup | Runbook | Suite referenziert nur Runbook und Erwartung |
| fachliche Architektur-, State- oder Datenbedeutung | Module Overview bzw. bestehende Source of Truth | nicht als QA-Vertrag duplizieren |
| bemerkenswerte Nutzer- oder Betriebsänderung | `CHANGELOG.md` | knapp und ohne Testprotokoll |
| exaktes Strukturduplikat ohne zusätzliche Semantik | begründete Nichtübernahme | Zuordnung in Reconciliation dokumentieren |

<!-- markdownlint-enable MD013 -->

- Veraltete Pfade werden nicht allein wegen historischer Plausibilität in eine
  aktuelle Suite übernommen.
- Offene historische Checks werden nur dann aktuelle Tests, wenn Verhalten,
  Consumer und Eigentümer heute noch bestehen. Sie gelten dabei nicht als
  ausgeführt.

### S2 Changelog- und Versionsvertrag

- Der lebende Changelog beginnt mit genau einem `Unreleased`-Abschnitt und
  verwendet nur tatsächlich benötigte Kategorien: `Added`, `Changed`,
  `Fixed`, `Removed`, `Security`.
- Einträge beschreiben bemerkenswerte Wirkung für Nutzung, Betrieb,
  Kompatibilität oder Sicherheit. Commitlisten, Syntaxänderungen,
  Testprotokolle und Roadmap-Schritte bleiben außerhalb.
- Jede abgeschlossene Roadmap entscheidet in S6 ausdrücklich:
  `Changelog-Eintrag erforderlich` oder `nicht bemerkenswert`. Ein Eintrag
  landet zunächst unter `Unreleased`; dadurch entsteht nicht automatisch eine
  neue Version.
- Historische und undatierte Versionen bleiben im Legacy-Archiv. Der neue
  Root-Changelog erklärt `v1.8.2` nicht zur aktuellen Produktversion.
- MIDAS verwendet künftig SemVer-inspiriert:
  - `MAJOR`: bewusster Bruch der MIDAS-Kompatibilitätsfläche, der Migration
    oder abgestimmte Umstellung verlangt.
  - `MINOR`: rückwärtskompatible neue Nutzer- oder Betriebsfähigkeit.
  - `PATCH`: rückwärtskompatibler Fix, Sicherheits-, Qualitäts- oder
    Wartungsstand ohne neue Fähigkeit.
- Die Kompatibilitätsfläche umfasst persistierte Datenbedeutung und
  erforderliche Migrationen, Export-/Importformate, stabile Deep Links,
  Widget-/TWA-Bridges, Edge-Function-Request-/Response-Verträge sowie künftig
  veröffentlichte MCP-Tools. Reines internes Refactoring ist kein MAJOR-Grund.
- Diese Regel wird nicht als striktes SemVer bezeichnet, weil MIDAS keine
  formal veröffentlichte Public API besitzt.
- Bis zum ersten bewussten geregelten Release besitzt MIDAS keine neue
  autoritative Versionsnummer. `Unreleased` plus exakter Git-Commit bezeichnet
  den Stand. Die erste geregelte Versionsnummer wird beim tatsächlichen
  Release-Cut bewusst gewählt und nicht aus Legacy-Nummern geraten.

### S2 Release-Einheit und Release-Readiness

Ein geregelter MIDAS-Release benötigt gemeinsam:

1. eine bewusst gewählte Version `X.Y.Z` und ein ISO-Datum,
2. eine Scope-Liste aus `Web/PWA`, `Android`, `Edge Functions`, `SQL/Supabase`
   und `Dokumentation`,
3. die betroffenen aktuellen Suite- und Runbook-IDs,
4. ein Evidence-Ziel für die konkrete Ausführung,
5. grüne Doku-, Changelog-, Link- und relevante Runtime-Gates,
6. einen belegten Ausrollstatus für jede betroffene Fläche,
7. eine ausdrückliche Owner-Go-Entscheidung,
8. einen Git-Tag `vX.Y.Z` auf dem freigegebenen Commit.

- Ein Edge-Deploy, SQL-Cutover, Android-APK-Smoke oder GitHub-Pages-Update ist
  zunächst eine Komponentenänderung. Erst der gemeinsame Owner-Cut macht aus
  den deklarierten Änderungen einen MIDAS-Release.
- Nicht betroffene Flächen werden als `not affected` markiert und benötigen
  keinen künstlichen Deploy.
- Eine Fläche gilt nur mit ihrem eigenen Nachweis als ausgerollt: Web/PWA über
  den produktiven Commit/Smoke, Android über Build und Geräte-Smoke, Edge
  Functions über Deploy und Remote-Smoke, SQL über Cutover und
  Postconditions, Dokumentation über den veröffentlichten Commit.
- Git-Tag ist ab dem ersten geregelten Release der exakte Versionsanker;
  GitHub Release ist optional. Historische Tags oder Daten werden nicht
  rückwirkend erfunden.
- `release-readiness.md` enthält stabile `REL-`-Gates und ein ausfüllbares
  Scope-/Nachweisschema, aber weder dauerhafte Ergebnisse noch kopierte
  fachliche Tests.

### S2 Contract Review und Findings-Korrektur

- Rollen:
  - Jede Leserfrage besitzt genau ein kanonisches Artefakt; Widersprüche
    werden Findings statt stiller Überschreibungen.
- Ownership:
  - Alle Module aus S1 besitzen einen primären Testzielkandidaten;
    Querschnittsmodule sind über die Aussage-Regel eindeutig teilbar.
  - Fachliches Backend-Verhalten und generische Plattformverträge sind
    getrennt.
- Status und Risiko:
  - Testdefinition, Ausführungsstatus und Datenwirkung sind getrennt.
  - Disposable und produktive Smokes besitzen eindeutige Gates.
- Historie:
  - Archivstatus und heutige Regression sind ohne Text- oder Statusduplikation
    über ID und Anker verbindbar.
- Release:
  - Keine bestehende Teilflächennummer wird zur aktuellen MIDAS-Version
    erklärt.
  - SemVer-inspirierte Zukunft, Release-Scope, Ausrollnachweis, Owner-Go und
    Tag-Anker sind vollständig definiert.
- Scope:
  - Keine Runtime-Ausführung, Produktänderung, Tag- oder Release-Erzeugung.
- Ergebnis:
  - `PASS`; `F-QA-28` bis `F-QA-36` wurden im Vertrag korrigiert.

### S2 Abschluss

- Finaler Zielvertrag:
  - eine kanonische QA-Leseroute, genau ein aktueller Eigentümer je
    Testaussage und ein getrennter Release-/Changelog-Vertrag.
- Gewählte Lösung:
  - domänenbasierte Suites, Release-Readiness, separate Runbooks, lebender
    Root-Changelog und historische Archive.
- Abgrenzung:
  - keine Runtime-Tests, Produktänderungen oder vollständige
    Legacy-Rekonstruktion.
- S4-Pflichtpunkte:
  - `S4.1` bis `S4.11` bleiben vollständig erforderlich.
- Doku-Sync:
  - erfolgt; Entscheidungslog, Zielstruktur, Suite-Zuständigkeiten und spätere
    S4-Verträge wurden gegen S2 präzisiert.

Exit: Keine Grundsatzfrage zu Geltung, Status oder Eigentum bleibt offen.

## S3 - Verlust-, Geltungs- und Referenzrisiken

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Risiko still verlorener Testfälle und historischer Statusaussagen prüfen.
2. Risiko falscher Aktualität durch alte Haken, Daten, Pfade oder Copy prüfen.
3. Doppelte Testfälle, doppelte IDs und konkurrierende Sources of Truth
   prüfen.
4. Broken Links, veraltete aktive Referenzen und Archiv-Referenzen getrennt
   behandeln.
5. Changelog-Risiken prüfen: falsche Vollständigkeit, doppelte oder falsch
   sortierte Versionen, unsicherer Versionsanker, unbelegte Release-Daten,
   Tag-/Versionsabweichungen, überfülltes `Unreleased` und Vermischung mit QA.
6. Risiko von Teil-Deploys prüfen: Changelog- oder Release-Aussage darf nicht
   Web/PWA, Android, Edge Functions oder SQL als produktiv darstellen, wenn
   nur ein anderer Teil ausgerollt wurde.
7. Encoding-Reparaturstrategie je Inhaltsklasse und Quellenlage festlegen.
8. Rollback-, Stop- und Reconciliation-Vertrag definieren.
9. S4-Reihenfolge, Reviewtiefe und S5-Checks final ableiten.
10. Contract Review, Korrektur und Abnahme durchführen.

Ergebnis:

### S3 Risikoregister

<!-- markdownlint-disable MD013 -->

| Risiko | Beleg | Kontrolle | Zielschritt / Gate |
| --- | --- | --- | --- |
| Historischer Inhaltsverlust | Sechs Versionsblöcke existieren nur im Backup-QA. | Zwei-Quellen-Reconciliation mit sichtbarer Provenienz. | S4.7, `T-QA-05` |
| Status wird zur falschen Aktualitätsaussage | 440 erledigte und 322 offene Checkboxen stehen im heutigen Monolithen. | Aktuelle Suites bleiben statuslos; damaliger Zustand ausschließlich im Archiv. | S4.2-S4.7, `T-QA-16` |
| Veraltete Tests werden als aktuell übernommen | Historische Checks nennen alte Pfade und teilweise frühere Modulgrenzen. | Jeder aktuelle Test benötigt heutigen Vertrag und Consumer. | S4.2-S4.4, `T-QA-06` |
| Doppelte aktuelle Testverträge | 29 Gruppen bzw. 69 Vorkommen exakt wiederholter Checklistentexte. | Ein Eigentümer und eine stabile ID je Aussage; historische Wiederholungen bleiben Evidence. | S4.2-S4.4, `T-QA-17` |
| Broken Links durch Migration | Vier aktive Overview-Links sind bereits falsch; Archivumzug ändert relative Tiefe. | Aktive Links reparieren; Archivlinks nur mit eindeutigem Ziel neu berechnen. | S4.6-S4.8/S4.10, `T-QA-03`, `T-QA-19` |
| Changelog behauptet falsche Release-Historie | Doppelte/undatierte Versionen, unsortierte Blöcke und keine Tags. | Legacy vollständig archivieren; neuer Root startet bei `Unreleased` ohne erfundene aktuelle Version. | S4.8/S4.9, `T-QA-10..12` |
| Teil-Deploy wird Gesamt-Release | Web, Android, Edge, SQL und Doku besitzen getrennte Ausrollwege. | Release-Scope-Matrix und Nachweis je betroffener Fläche. | S4.9, `T-QA-15` |
| Encoding-Reparatur zerstört Historie | 291 QA- und 12 Changelog-Zeilen enthalten teils mehrfaches Mojibake. | Dreistufige belegabhängige Reparatur; unsicheren Originaltext erhalten und markieren. | S4.6-S4.8/S4.11, `T-QA-07` |
| Späte Bereinigung invalidiert Reviews | S4.11 folgt nach allen fachlichen Migrationsschritten. | S4.11 nur mechanisch; semantische Änderung zurück zum Owner-Substep. | S4.11, erneuter Consumer-/Full-Review |
| Neuer Prozess driftet erneut | Templates verlangen bisher keine Changelog-Relevanzentscheidung. | Workflow-/Template-Sync und S6-Pflichtentscheidung. | S4.10/S6, `T-QA-20` |

<!-- markdownlint-enable MD013 -->

### S3 Geltungs- und Duplikatregeln

- Wiederholte historische Checks bleiben an jedem damaligen Lauf sichtbar.
  Ihre Wiederholung ist historische Evidence und kein zu löschendes Duplikat.
- In aktuellen Suites wird dieselbe beobachtbare Aussage genau einmal unter
  ihrer Eigentümer-ID geführt. Abweichende Voraussetzung, Wirkung oder
  Erwartung bedeutet dagegen einen eigenständigen Testfall.
- Ein PASS-, DONE-, Datums- oder Checkboxstatus wird nie aus der Quelle in
  eine aktuelle Suite übernommen.
- Ein offener historischer Check bleibt offen im Archiv. Seine heutige
  Übernahme erzeugt lediglich einen statuslosen Test, keinen rückwirkenden
  Ausführungsnachweis.
- Module Overview und Consumer müssen beide zur aktuellen Aussage passen.
  Bei Widerspruch wird nicht migriert, sondern ein Finding eröffnet.

### S3 Link- und Referenzstrategie

- Aktive Leserouten müssen nach S4 vollständig auf existierende aktuelle
  Suites, Runbooks, Changelog- oder Archivziele zeigen.
- Bestätigte aktive Altschulden im Scope:
  - Charts Overview zu `docs/archive/BodyChart-Roadmap.md`
  - Reports Overview zu `docs/archive/Reports-Roadmap.md`
  - Sensory Feedback Overview zu
    `docs/archive/MIDAS Sensory Feedback Roadmap.md`
  - Ticker Bar Overview zu `docs/archive/MIDAS Ticker Bar Roadmap.md`
- Der kodierte Intent-Engine-Link zeigt auf eine existierende Datei und war
  lediglich ein Fehlalarm des einfachen Regex-Linkscans.
- Beim Archivumzug wird ein relativer Link nur angepasst, wenn dasselbe Ziel
  eindeutig existiert. Ein historisch genannter, heute fehlender Pfad bleibt
  als Code/Text erhalten und erhält bei Bedarf einen Historienhinweis statt
  eines scheinbar aktiven Links.
- Archivierte Roadmaps außerhalb des migrierten QA-/Changelog-Inhalts werden
  nicht massenhaft umgeschrieben.

### S3 Changelog- und Teil-Deploy-Risiko

- Der vollständige alte Root-Changelog wird vor seiner Neufassung archiviert.
  Doppelte, falsch sortierte und undatierte Blöcke bleiben dort als belegte
  Legacy-Historie sichtbar.
- Der neue Root-Changelog startet mit `Unreleased` und einem Link zur
  Legacy-Chronik. Eine neue Version, ein Datum oder Tag entsteht erst durch
  einen späteren bewussten Release-Cut.
- Ein Changelog-Eintrag unter `Unreleased` belegt eine bemerkenswerte
  Änderung, aber weder Deployment noch produktiven Gesamtstand.
- Release-Readiness muss für jede betroffene Fläche `not affected`,
  `pending` oder mit konkretem Ausrollnachweis `verified` erfassen. Solange
  eine betroffene Fläche `pending` ist, darf kein Gesamt-Release als produktiv
  bezeichnet werden.

### S3 Encoding-Strategie

1. Aktuelle Suites, Runbooks und Indizes werden in UTF-8 aus sauberem
   Module-Overview-/Consumer-Vertrag neu formuliert und müssen frei von
   bekannten Mojibake-Mustern sein.
2. Historischer Text wird repariert, wenn dieselbe Aussage in einer besseren
   QA-/Changelog- oder Legacy-Quelle eindeutig lesbar vorhanden ist. Quelle
   und Zuordnung bleiben nachvollziehbar.
3. Ohne eindeutige bessere Quelle bleibt der historische Originaltext
   unverändert und erhält einen kurzen Hinweis auf den bekannten
   Encoding-Schaden. Inhalt wird nicht geraten.

- Korrekte deutsche Zeichen wie `ä`, `ö`, `ü` und `ß` sind ausdrücklich kein
  Encoding-Fehler.
- Globale Such-und-Ersetzungsdurchläufe über Quellen oder Archive bleiben
  verboten.

### S3 Reconciliation-, Stop- und Rollback-Vertrag

Reconciliation-Schlüssel:

- `QA-CURRENT` plus H2/H3-Anker für den heutigen Monolithen,
- `QA-BACKUP` plus H1/H2-Anker für die gesicherte alte QA,
- `CHANGELOG-ROOT` plus Blockanker für den heutigen Root-Changelog,
- Zielpfad und Ziel-ID oder eine begründete Nichtübernahme,
- Provenienz, historischer Status und Encoding-Entscheidung.

Stop-Bedingungen vor S4.10:

- ein Quellblock oder semantischer Check besitzt kein Ziel,
- unterschiedliche historische Aussagen würden ohne Provenienz verschmolzen,
- PASS/TODO-Status oder bemerkenswerter Changelog-Inhalt würde verloren gehen,
- ein aktueller Test besitzt keinen heutigen Consumer oder Eigentümer,
- ein Runbook besitzt keine Wirkung, Abbruchbedingung oder Cleanup-Regel,
- Legacy-Changelog oder beide QA-Quellen sind noch nicht vollständig
  archiviert und abgeglichen.

Rollback:

- Bis einschließlich S4.8 bleiben `docs/QA_CHECKS.md` und der bisherige
  Root-Changelog als Arbeitsquellen erhalten; neue Ziele entstehen daneben.
- S4.9 ersetzt den Root-Changelog erst nach grünem Changelog-Archivabgleich;
  `docs/QA_CHECKS.md` bleibt bis zum Cutover weiterhin aktiver Einstieg.
- Bei Stop bleiben die alten Einstiege unverändert aktiv. Nur die von dieser
  Roadmap neu erzeugten, noch nicht freigegebenen Zielartefakte werden erneut
  geprüft oder gezielt zurückgenommen; fremde Worktree-Änderungen bleiben
  unangetastet.
- S4.10 ist der dokumentarische Cutover. Er erfolgt erst nach grünem
  Vorab-Abgleich und lässt `docs/QA_CHECKS.md` als Kompatibilitätszeiger sowie
  die vollständigen Archive zurück.
- Nach S4.10 führt jede semantische Korrektur zum zuständigen S4-Substep zurück
  und invalidiert dessen Review sowie alle abhängigen S5-Prüfungen.

### S3 S4-/S5-Vertrag

- S4-Reihenfolge bleibt fachlich korrekt:
  1. Zielstruktur und Rollen anlegen.
  2. Aktuelle Suites nach Ownership migrieren.
  3. Runbooks auslagern.
  4. beide QA-Quellen und den Legacy-Changelog archivieren/reconciliieren.
  5. lebenden Changelog und Release-Readiness aufbauen.
  6. erst danach Kompatibilitätsindex und aktive Referenzen umstellen.
  7. ausschließlich mechanische Qualitätsbereinigung durchführen.
- Reviewtiefe:
  - `Consumer` für fachliche Suite- und Runbook-Migration,
  - `Full` für Archive, Changelog, Cutover und Abschlussbereinigung.
- S5-Pflichtchecks:
  - `T-QA-01` bis `T-QA-20`.

### S3 Contract Review und Findings-Korrektur

- Verlustfreiheit:
  - beide QA-Quellen, vollständiger Changelog, Status und Provenienz besitzen
    ein verbindliches Ziel und Stop-Gate.
- Geltung:
  - Historie, aktuelle Testdefinition und konkrete Evidence können nicht mehr
    still ineinander übergehen.
- Referenzen:
  - aktive, migrierte historische und unangetastete Archivlinks haben getrennte
    Regeln; vier reale aktive Broken Links sind S4.10 zugeordnet.
- Encoding:
  - aktive Qualität und historische Treue sind ohne globale Reparatur
    gleichzeitig geschützt.
- Release:
  - Changelog-Eintrag, Komponenten-Deploy und produktiver MIDAS-Release sind
    klar getrennt.
- Reihenfolge und Rollback:
  - S4.10 ist als eindeutiger Cutover definiert; davor bleiben die bisherigen
    Einstiege intakt.
- Blockierende Risiken:
  - `none`; alle erkannten Risiken besitzen Kontrolle, Zielschritt und
    prüfbares S5-Gate.
- Ergebnis:
  - `PASS`; `F-QA-37` bis `F-QA-45` wurden im Vertrag korrigiert und im
    nachfolgenden Readiness Review auf den finalen S4-Schnitt synchronisiert.

### S3 Abschluss

- S4-Schnitt:
  - Struktur, aktuelle Suites, Runbooks, Historie, Changelog,
    Release-Readiness, Kompatibilitätsindex, Referenzen und mechanische
    Qualitätsbereinigung.
- Doku-Sync:
  - erfolgt; Entscheidungslog, S4-Verträge, S5-Gates und S6-Prozess wurden
    gegen die S3-Risiken präzisiert.

Exit: Verlust-, Geltungs-, Encoding- und Referenzrisiken sind geschlossen,
einem Substep zugeordnet oder sichtbar deferred.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | QA-Einstieg, Rollenvertrag, Release-Readiness und Suite-Skelette anlegen | `S1/S2/S3` | `docs/qa/README.md`, `docs/qa/*.md` | `Full` | Struktur- und Linkcheck | `none` |
| S4.2 | Core-, Health- und Intake-Testverträge migrieren | `S1/S2/S3` | drei aktuelle Suites | `Consumer` | Block-/Consumer-/Ownership-Abgleich | `none` |
| S4.3 | Assistant-/Voice- sowie Push-/Trendpilot-Verträge migrieren | `S1/S2/S3` | zwei aktuelle Suites | `Consumer` | Block-/Consumer-/Ownership-Abgleich | `none` |
| S4.4 | Android- sowie Backend-/Supabase-Verträge migrieren | `S1/S2/S3` | zwei aktuelle Suites | `Consumer` | Block-/Consumer-/Ownership-Abgleich | `none` |
| S4.5 | Fünf operative Abläufe als Runbooks auslagern | `D-QA-34/F-QA-47/F-QA-48` | `docs/qa/runbooks/*.md` | `Full` | Voraussetzungen/Wirkung/Abbruch/Cleanup | `none` |
| S4.6 | Historische Roadmap-/Arbeitsphasen archivieren | `F-QA-37/F-QA-39/F-QA-41` | `docs/archive/qa/MIDAS Historical QA Phases 2025-2026.md` | `Full` | Block-/Status-/Provenienzabgleich | `Stop bei Lücke` |
| S4.7 | Legacy-Release-QA aus beiden QA-Quellen archivieren | `F-QA-19/F-QA-37/F-QA-43/F-QA-46` | `docs/archive/qa/MIDAS Legacy Release QA v0.1-v1.8.md` | `Full` | Zwei-Quellen-/Versions-/Statusabgleich | `Stop bei Lücke` |
| S4.8 | Legacy-Changelog vollständig archivieren | `F-QA-25/F-QA-37/F-QA-41/F-QA-46` | `docs/archive/history/MIDAS Legacy Changelog v0.1-v1.8 and Unreleased.md` | `Full` | Root-/Backup-/Provenienzabgleich | `Stop bei Lücke` |
| S4.9 | Lebenden Root-Changelog und Release-Vertrag aufbauen | `D-QA-22..26/F-QA-44` | `CHANGELOG.md`, `docs/qa/release-readiness.md` | `Full` | Versions-/Scope-/Kategorie-/Traceability-Check | `Stop vor S4.10 bei Lücke` |
| S4.10 | Kompatibilitätsindex herstellen und aktive Referenzen migrieren | `F-QA-01/F-QA-04/F-QA-10/F-QA-40/F-QA-45` | `docs/QA_CHECKS.md`, aktive Doku-Consumer | `Full` | vollständiger aktiver Referenz-/Linkscan | `Cutover nach grünem Vorab-Abgleich` |
| S4.11 | Encoding, IDs, Markdown und Inhaltsduplikate mechanisch bereinigen | `F-QA-05/F-QA-07/F-QA-12/F-QA-41/F-QA-42` | gesamter geänderter Doku-Scope | `Full` | `T-QA-01..20` Vorabzug | `Semantik zurück zum Owner-Substep` |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - Aktuelle und historische Ziele werden vor dem Ersetzen von QA-Monolith
    oder altem Changelog erstellt; Referenzen werden erst nach Inhaltsabgleich
    umgestellt.
- Fehlende Zuordnung:
  - `none`; alle S1-S3-Inhalte besitzen Ziel, Owner, Review und Gate.
- Evidence:
  - nicht erforderlich
- Owner-Gates:
  - keine produktiven Gates; Owner-Sichtprüfung erfolgt in S5.
- Empfohlene S4-Ausführungsblöcke:
  - `S4.1` separat als Zielstruktur-Gate.
  - `S4.2-S4.5` gemeinsam; gleiche Dokumentationswirkung, keine produktive
    Ausführung und kompatible Consumer-/Full-Reviews.
  - `S4.6-S4.8` gemeinsam; rein historische Archive mit getrennten
    Reconciliation-Abnahmen je Quelle.
  - `S4.9`, `S4.10` und `S4.11` jeweils separat, weil Changelog-Cutover,
    QA-Monolith-Cutover und mechanische Schlussbereinigung eigene
    Invalidation-Grenzen besitzen.
- Review je Ausführungsblock:
  - der höchste enthaltene Reviewgrad gilt für den gesamten Block;
    Ergebnisse und Findings bleiben dennoch dem jeweiligen S4-Substep
    zugeordnet.
- Readiness-Findings/Korrekturen:
  - `F-QA-46`: Archivschritt in drei getrennte Full-Review-Substeps geteilt.
  - `F-QA-47`: generische Edge-Deploy- und SQL-Cutover-Runbooks ergänzt.
  - `F-QA-48`: produktiv wirksame Runbooks auf `High`/`Full` angehoben.
  - `F-QA-62`: sichere Ausführungsblöcke in Readiness und Templates ergänzt.
  - Cutover von S4.8 auf S4.10 verschoben; alle Stop-/Invalidation-Verweise
    entsprechend synchronisiert.

### S4 Readiness Contract Review

- Vollständigkeit:
  - Alle 45 bisherigen Findings sowie `F-QA-46` bis `F-QA-48` besitzen einen
    konkreten S4-Substep oder S5-Gate.
- Arbeitsgröße:
  - Suite-Migration bleibt nach drei, zwei und zwei Zieldateien gruppiert.
  - Jeder historische Großbestand besitzt nun einen eigenen Full Review.
- Abhängigkeiten:
  - Zielstruktur vor Inhalt, aktuelle Tests vor Runbooks, Archive vor neuem
    Changelog und alle Vorab-Gates vor dem Cutover.
- Gates:
  - S4.6 bis S4.9 stoppen bei Reconciliation-Lücken.
  - S4.10 ist der einzige Cutover; S4.11 bleibt rein mechanisch.
- Owner-/Runtime-Wirkung:
  - keine; S4 erstellt und migriert ausschließlich Dokumentation.
- Ergebnis:
  - `PASS`; S4.1 bis S4.11 sind ohne neue Grundsatzentscheidung ausführbar.

Exit: S4 kann ohne neue Taxonomie-, Verlust- oder Source-of-Truth-Entscheidung
beginnen.

## S4 - Dokumentationsmigration

### S4.1 - QA-Einstieg, Release-Readiness und Suite-Skelette

Reasoning: `GPT-5.6 Sol / Medium`.

- Vertrag:
  - `D-QA-02`, `D-QA-04`, `D-QA-05`, `D-QA-13`, `D-QA-16` bis
    `D-QA-32`
- Dateien:
  - `docs/qa/README.md`, sieben Suite-Dateien und
    `docs/qa/release-readiness.md` sowie `docs/qa/runbooks/`
- Umsetzung:
  - Leseroute, Artefaktrollen, Geltung, mehrdimensionales Test-ID-Schema,
    Suite-Ownership, Smoke-Gates, Release-Scope-Schema und leere Zielstruktur
    exakt nach S2 herstellen; noch keine Quellblöcke löschen.
- Review:
  - `Full`
- Invalidation:
  - Zielstruktur und S4.2-S4.11-Zuordnungen erneut prüfen.
- Gate:
  - `none`

Ergebnis und Full Contract Review:

- Struktur:
  - kanonischer QA-Einstieg, sieben Suite-Skelette,
    `release-readiness.md` und das leere Runbook-Zielverzeichnis angelegt.
- Rollen und Ownership:
  - Suite-Präfixe, fachliche Grenzen und Source-of-Truth-Rollen entsprechen S2;
    es wurde noch kein Quellblock oder Testfall migriert.
- Status und Evidence:
  - keine Testcheckboxen, Laufdaten oder dauerhaften PASS-/FAIL-Ergebnisse in
    den Suite-Skeletten; konkrete Ergebnisse bleiben Roadmap/Evidence.
- Release-Vertrag:
  - `REL-001` bis `REL-008` bilden Version, Scope, QA-Auswahl, Evidence,
    Doku, Ausrollnachweise, Owner-Go und Tag ab, ohne Testfälle zu kopieren.
- Findings-Korrektur:
  - `F-QA-49` und `F-QA-50` geschlossen; weder Schema-Beispiel noch Resume
    Card erzeugen unnötigen Folgekontext.
- Ergebnis:
  - `PASS`; alle neun Zieldateien und das Runbook-Verzeichnis existieren,
    interne Links sind gültig und S4.2 kann ohne neue Strukturentscheidung
    beginnen.

Exit: Jeder Zieltyp besitzt einen eindeutigen Vertrag und Pfad.

### S4.2 - Core-, Health- und Intake-Suites

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-QA-04`, `D-QA-16`, `D-QA-17`, `D-QA-19`, `D-QA-21`,
    S1-Blockinventar
- Dateien:
  - `docs/qa/core-runtime.md`
  - `docs/qa/health-capture-reports.md`
  - `docs/qa/intake-medication.md`
- Umsetzung:
  - aktuelle wiederverwendbare Tests aus allen bisherigen Inhaltsbereichen
    fachlich zuordnen, gegen direkte Module-Consumer prüfen und ohne alten
    Ausführungsstatus in das neue Testfallschema übertragen.
- Review:
  - `Consumer`
- Invalidation:
  - Blockreconciliation und Module-Referenzen.
- Gate:
  - `none`

Exit: Core-, Gesundheits-, Intake- und Medication-Tests besitzen je genau
eine aktuelle Source of Truth.

#### S4.2 Ergebnis

- `core-runtime.md` besitzt `CORE-001` bis `CORE-011`.
- `health-capture-reports.md` besitzt `HCR-001` bis `HCR-014`.
- `intake-medication.md` besitzt `IM-001` bis `IM-013`.
- Aktuelle Aussagen aus Module Overviews und weiterhin gültigen QA-Blöcken
  wurden nach heutigem Consumer-Ownership gebündelt; alte PASS-, TODO- und
  Datumszustände wurden nicht übernommen.

#### S4.2 Consumer Review

- Direkte Auth-, Router-, State-, Diagnostics-, Appointments-, Report-,
  Medication-, Retention-, Protein- und Atemtimer-Consumer gegengeprüft.
- Testfallschema vollständig: Vertrag, Ebene, Ausführung, Wirkung,
  Voraussetzung, Aktion, Erwartung und Invalidation sind je ID vorhanden.
- `disposable`-Fälle besitzen einen expliziten Cleanup.
- Findings `F-QA-51` bis `F-QA-53` korrigiert.
- Ergebnis: `PASS`; S4.3 kann ohne offene Ownership- oder Contract-Frage starten.

### S4.3 - Assistant-, Voice-, Push- und Trendpilot-Suites

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-QA-04`, `D-QA-16`, `D-QA-17`, `D-QA-19`, `D-QA-21`,
    S1-Blockinventar
- Dateien:
  - `docs/qa/assistant-voice-intent.md`
  - `docs/qa/push-trendpilot.md`
- Umsetzung:
  - aktuelle Assistant-, Intent-, Voice-, VAD-, Incident-, Push- und
    Trendpilot-Tests aus allen bisherigen Inhaltsbereichen konsolidieren und
    gegen heutige Guardrails prüfen.
- Review:
  - `Consumer`
- Invalidation:
  - Blockreconciliation, Push-/Assistant-Module-Referenzen und Runbook-Schnitt.
- Gate:
  - `none`

Exit: Interaktions- und Schutznetz-Tests sind aktuell, eindeutig und ohne
historische Ausführungsbehauptung beschrieben.

#### S4.3 Ergebnis

- `assistant-voice-intent.md` besitzt `AVI-001` bis `AVI-012`.
- `push-trendpilot.md` besitzt `PT-001` bis `PT-016`.
- Assistant-, Intent-, Voice-, VAD-, Incident-, Push-, Scheduler- und
  Trendpilot-Verträge wurden ohne historische Done-Zustände konsolidiert.

#### S4.3 Consumer Review

- Voice-Semantik, Intent-Parser, VAD, Hub-Kontext, Incident-Request-Guard,
  Push-Schwellen, Workflow-Kadenz, Delivery-Response und Trendpilot-Merge gegen
  die heutigen Consumer geprüft.
- Der Best-Effort-Vertrag bleibt sichtbar: Dedupe gilt im sequenziellen Pfad,
  nicht als exakt-einmalige Zustellgarantie.
- Diagnoseerfolg bleibt strikt von fachlichem Remote-Erfolg und lokaler
  Suppression getrennt.
- Testfallschema und Cleanup-Prüfung: `PASS`; keine neuen Findings offen.

### S4.4 - Android- und Backend-Suites

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-QA-04`, `D-QA-16`, `D-QA-17`, `D-QA-19`, `D-QA-21`,
    S1-Blockinventar
- Dateien:
  - `docs/qa/android-widget.md`
  - `docs/qa/backend-supabase.md`
- Umsetzung:
  - Android-/Widget-/OAuth- sowie domänenneutrale
    Edge-/Grant-/RLS-/Cron-/RPC-Tests aus allen bisherigen Inhaltsbereichen in
    getrennte aktuelle Verträge übertragen. Fachliche Edge- und SQL-Aussagen
    verbleiben gemäß D-QA-21 in ihrer Domänensuite.
- Review:
  - `Consumer`
- Invalidation:
  - Android-, Backend-, Supabase- und Dev-Environment-Referenzen.
- Gate:
  - `none`

Exit: Plattform- und Backend-Tests sind von Produkt- und Historienblöcken
getrennt.

#### S4.4 Ergebnis und Consumer Review

- `AW-001` bis `AW-014` decken Shell, Native Auth, WebView, Widget-Snapshot,
  Syncpfade, Darstellung und Trace ab.
- `BS-001` bis `BS-012` decken Supabase-Aggregation, Edge-Grundvertrag,
  Grants, RLS, RPC, Cron, Local Stack, Deploy und Secrets ab.
- Domänenfachliche Medication-, Push- und Trendpilot-Aussagen bleiben in `IM-`
  beziehungsweise `PT-`; die Plattform-Suites duplizieren sie nicht.
- Consumer-Abgleich gegen Android-Code, SQL, Backend-Source und
  `DEV_ENVIRONMENT.md` korrigierte `F-QA-54` bis `F-QA-56` sowie `F-QA-58`.
- `F-QA-57` ist ein realer offener Produktfund: Die QA-Dokumentation ist
  korrekt, ein Android-Release bleibt bis Codefix und Device-Nachweis blockiert.
- Ergebnis: `PASS` für S4.4-Dokumentationsscope; S4.5 darf ohne verdeckte
  Contract-Annahme folgen.

### S4.5 - Operative Runbooks

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-QA-02`, `D-QA-17`, `D-QA-18`, `D-QA-34`, Rollenvertrag aus S2
- Dateien:
  - `docs/qa/runbooks/boot-error-smoke.md`
  - `docs/qa/runbooks/push-runtime-smoke.md`
  - `docs/qa/runbooks/edge-function-deploy-smoke.md`
  - `docs/qa/runbooks/supabase-sql-cutover.md`
  - `docs/qa/runbooks/android-device-smoke.md`
- Umsetzung:
  - die fünf wiederholbaren technischen Abläufe mit Voraussetzung, Wirkung,
    Owner-Gate, Schrittfolge, Erwartung, Abbruchbedingung, Cleanup bzw.
    Postconditions und zuständiger Suite auslagern. GitHub-Workflow-Smokes
    werden als optionaler Scheduler-Nachzug im Edge-/Push-Runbook abgedeckt,
    nicht als sechstes nahezu identisches Runbook.
- Review:
  - `Full`
- Invalidation:
  - betroffene Suite-Links und Dev-Environment-Befehle.
- Gate:
  - `none`; Runbooks werden dokumentiert, nicht produktiv ausgeführt.

Exit: Operative Anleitungen sind ausführbar beschrieben, ohne Testvertrag
oder vergangene Evidence zu duplizieren.

#### S4.5 Ergebnis und Full Review

- `RB-001` bis `RB-005` beschreiben Boot Error, Push Runtime, Edge Deploy,
  Supabase SQL Cutover und Android Device Smoke.
- Jedes Runbook besitzt Zweck, Voraussetzungen, Wirkung, Owner-Gate, Ablauf,
  Erwartung, Abbruchbedingungen, Cleanup/Postconditions und Evidence-Vertrag.
- Produktive Schritte bleiben hinter expliziten Owner-Gates; in S4.5 wurde
  keiner der dokumentierten Deploy-, SQL-, Workflow- oder Device-Befehle
  produktiv ausgeführt.
- Full Review korrigierte `F-QA-59` bis `F-QA-61`.
- 92 Suite-Tests, fünf Runbooks und acht Release-Gates ergeben 105 eindeutige
  IDs; Schema-, Cleanup-, Link-, Mojibake- und Duplikatprüfung sind grün.
- Markdownlint: 15 Dateien im S4.2-S4.5-/Roadmap-Scope, null Befunde.
- Ergebnis: `PASS`; S4.6 kann mit dem offenen, separat zu behandelnden
  Produktfund `F-QA-57` beginnen.

### S4.6 - Historische Roadmap- und Arbeitsphasen

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-QA-05`, `D-QA-07`, `D-QA-08`, `D-QA-19`, `D-QA-27` bis
    `D-QA-30`
- Dateien:
  - `docs/archive/qa/MIDAS Historical QA Phases 2025-2026.md`
- Umsetzung:
  - abgeschlossene Roadmap-, Follow-up- und Arbeitsphasen aus dem aktuellen
    QA-Monolithen vollständig, statusgetreu und mit Quellanker archivieren.
    Bereits in S4.2 bis S4.5 übernommene aktuelle Test- oder Runbook-IDs nur
    verlinken; PASS/TODO und damaligen Kontext nicht umformulieren.
- Review:
  - `Full`
- Invalidation:
  - Phasenblock-, Status-, Link-, Encoding- und aktuelle-ID-Reconciliation.
- Gate:
  - Stop bei ungeklärtem Phasenblock, Status oder Provenienz.

Exit: Historische Arbeitsnachweise bleiben vollständig auffindbar und sind von
aktuellen Tests getrennt.

#### S4.6 Ergebnis und Full Review

- `40` H2- und `14` H3-Phasenblöcke wurden aus zwei getrennten Quellbereichen
  quellentreu archiviert: 26 H2 vor `v0.1.0` sowie 14 H2 ab
  `Diagnostics Layer Forwarding` bis zum damaligen Dateiende.
- Historische PASS-/TODO-Zustände, Reihenfolge, Pfade und Encoding-Befunde
  blieben unverändert; aktuelle Suite- und Runbook-Owner werden nur im
  Archivkopf verlinkt.
- Beide eingebetteten Snapshots stimmen nach normalisierter Zeilenendung
  vollständig mit ihren definierten Quellbereichen überein.
- S5 korrigierte `F-QA-67`: Beide S4.6-Bereiche und der S4.7-Release-Bereich
  rekonstruieren das frühere `docs/QA_CHECKS.md` mit allen `100` H2-Blöcken
  exakt.
- Full Review korrigierte `F-QA-63` und `F-QA-67`; Phasen-, Status- und
  Provenienz-Gate: `PASS`.

### S4.7 - Legacy-Release-QA aus beiden QA-Quellen

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-QA-05`, `D-QA-06`, `D-QA-07`, `D-QA-19`, `D-QA-27` bis
    `D-QA-31`, `F-QA-19`
- Dateien:
  - `docs/archive/qa/MIDAS Legacy Release QA v0.1-v1.8.md`
- Umsetzung:
  - Legacy-Versions- und Release-QA aus `docs/QA_CHECKS.md` sowie
    `C:\Users\steph\Projekte\Backup\Old\QA_CHECKS.md` mit sichtbarer
    Quellenprovenienz archivieren. Die sechs nur im Backup vorhandenen
    Versionsblöcke ausdrücklich einschließen; unterschiedliche Aussagen nicht
    kontextlos verschmelzen und exakte Strukturduplikate begründen.
- Review:
  - `Full`
- Invalidation:
  - Zwei-Quellen-, Versions-, Status-, Provenienz- und Encoding-Abgleich.
- Gate:
  - Stop bei fehlendem Versionsblock, Statusverlust oder ungeklärtem Konflikt.

Exit: Die belegbare Legacy-Release-QA beider Quellen ist vollständig und
statusgetreu archiviert.

#### S4.7 Ergebnis und Full Review

- Quelle A bewahrt `60` H2-Blöcke aus dem aktuellen QA-Monolithen zwischen
  `v0.1.0` und dem Beginn der heutigen Regression-Packs.
- Quelle B bewahrt den vollständigen Backup-Stand mit `61` H2-Blöcken.
- Die sechs nur im Backup belegten Versionen `v0.7.0`, `v1.2.0`, `v1.4.0`,
  `v1.4.1`, `v1.4.5` und `v1.5.4` sind ausdrücklich inventarisiert.
- Beide Vollsnapshots stimmen nach normalisierter Zeilenendung mit ihren
  Quellen überein; unterschiedliche Aussagen wurden nicht verschmolzen.
- Zwei-Quellen-, Versions-, Status- und Provenienz-Gate: `PASS`.

### S4.8 - Legacy-Changelog-Archiv

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-QA-07`, `D-QA-10` bis `D-QA-12`, `D-QA-27` bis `D-QA-31`
- Dateien:
  - `docs/archive/history/MIDAS Legacy Changelog v0.1-v1.8 and Unreleased.md`
- Umsetzung:
  - den bisherigen Root-Changelog vor jeder Neufassung vollständig und in
    belegter Reihenfolge archivieren. Backup-Changelog blockweise auf
    zusätzliche historische Details prüfen und nur mit sichtbarer Provenienz
    ergänzen; doppelte, undatierte oder falsch sortierte Blöcke nicht still
    korrigieren oder zu einer erfundenen Releasefolge verschmelzen.
- Review:
  - `Full`
- Invalidation:
  - Root-/Backup-Blockabgleich, Reihenfolge, Provenienz, Links und Encoding.
- Gate:
  - Stop bei ungesichertem Root-Block oder ungeklärter Backup-Abweichung.

Exit: Der bisherige Changelog bleibt als vollständige historische Quelle
auffindbar, ohne als aktuelle Release-Wahrheit zu gelten.

#### S4.8 Ergebnis und Full Review

- Der bisherige Root-Changelog wurde mit allen `69` H2-Blöcken in seiner
  vorhandenen Reihenfolge vollständig gesichert.
- Blockvergleich gegen das Backup: `62` exakt identische Blöcke, sechs
  Root-only-Blöcke und genau eine Abweichung bei `v1.5.4`.
- Der abweichende Backup-Block `v1.5.4` ist separat mit Zeilenprovenienz
  eingebettet; identische Blöcke wurden begründet nicht dupliziert.
- Root-Snapshot und Backup-Supplement stimmen nach normalisierter Zeilenendung
  vollständig mit ihren Quellen überein.
- Root-/Backup-, Reihenfolge-, Encoding- und Provenienz-Gate: `PASS`;
  S4.9 ist freigegeben.

### S4.9 - Lebender Changelog und Release-Vertrag

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-QA-10` bis `D-QA-15`, `D-QA-22` bis `D-QA-26`,
    S1-Changelog-Inventar
- Dateien:
  - `CHANGELOG.md`
  - `docs/qa/release-readiness.md`
- Umsetzung:
  - Root-Changelog mit H1, kurzer Geltungserklärung, schlankem `Unreleased`,
    erlaubten Kategorien und Link zur Legacy-Chronik neu aufsetzen. Nur
    belegte bemerkenswerte Änderungen übernehmen; Versionen, Daten, Tags und
    Releases nicht nacherfinden. Release-Readiness mit Versionierungs-, QA-,
    Doku-, Ausrollflächen- und Nachweisgate synchronisieren. Den aktuellen
    Zustand als `Unreleased` ohne autoritative Produktversion kennzeichnen und
    den ersten geregelten Release-Cut nur als Zukunftsvertrag beschreiben.
- Review:
  - `Full`
- Invalidation:
  - Versionsanker, Release-Scope, Changelog-Klassifizierung,
    Release-Readiness und Traceability-Prüfungen.
- Gate:
  - Stop vor S4.10 bei ungeklärter Version, Kategorie oder Release-Fläche;
    keine Git-Tags oder GitHub Releases erzeugen.

Exit: MIDAS besitzt einen kleinen, dauerhaft pflegbaren Changelog und einen
eindeutigen Release-Gate-Vertrag ohne erfundene Historie.

#### S4.9 Ergebnis und Full Review

- `CHANGELOG.md` besitzt genau eine H1, einen schlanken `Unreleased`-Abschnitt,
  ausschließlich erlaubte Kategorien und einen Link zur Legacy-Chronik.
- Es wurde keine Produktversion, kein Releasedatum und kein Git-Tag erfunden.
- `release-readiness.md` trennt Komponentenänderung und geregelten Release,
  bewertet fünf Ausrollflächen und definiert acht stabile Release-Gates.
- Changelog-, Kategorie-, Versions-, Scope- und Traceability-Gate: `PASS`.

### S4.10 - Kompatibilitätsindex und Referenzmigration

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-QA-02`, `D-QA-03`, `D-QA-09`, `D-QA-25`, `D-QA-28`,
    `D-QA-31`, `D-QA-32`, `F-QA-04`, `F-QA-10`
- Dateien:
  - `docs/QA_CHECKS.md`
  - `README.md`
  - `docs/DEV_ENVIRONMENT.md`
  - `docs/templates/*.md`
  - aktive `docs/modules/*.md` mit QA-Verweisen
  - aktive Verweise auf `CHANGELOG.md` und Change-Historie
- Umsetzung:
  - bisherigen Monolithen erst nach grünem S4.6-S4.9-Abgleich durch einen
    kurzen Kompatibilitätszeiger ersetzen; aktive Consumer auf den
    kanonischen Einstieg, die zuständige Suite oder bei einem konkreten
    historischen Beleg auf das passende QA-Archiv umstellen. Workflow und
    Template um die S6-Changelog-Relevanzentscheidung ergänzen. Die vier in S3
    bestätigten falschen Overview-Archivpfade gezielt auf ihre vorhandenen
    Ziele unter `docs/archive/` korrigieren.
- Review:
  - `Full`
- Invalidation:
  - alle aktiven Link- und Referenzchecks.
- Gate:
  - Cutover nur nach grünem S4.6-S4.9-Vorab-Abgleich.

Exit: Aktive Dokumentation erreicht aktuelle QA ohne Monolith-Lesepflicht;
historische QA- und Change-History-Links bleiben verständlich.

#### S4.10 Ergebnis und Full Review

- `docs/QA_CHECKS.md` ist ein kurzer Kompatibilitätsindex statt einer zweiten
  aktuellen QA-Source-of-Truth.
- README, Dev Environment, Templates und betroffene Module Overviews führen
  direkt zu QA-Einstieg, zuständiger Suite, Runbook oder historischem Beleg.
- Die vier bekannten Overview-Pfade zeigen auf ihre vorhandenen Archivziele.
- Finding `F-QA-64` ergänzte den zunächst fehlenden dauerhaften
  S6-Changelog-Vertrag in allen drei Template-Dokumenten.
- Aktiver Linkscan über `57` Dateien und `291` relative Ziele: `PASS`.

### S4.11 - Encoding-, ID-, Markdown- und Duplikatbereinigung

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-QA-04`, `D-QA-07`, `D-QA-11`, `D-QA-29`, `D-QA-30`,
    `F-QA-05`, `F-QA-07`, `F-QA-12`
- Dateien:
  - gesamter in S4 geänderter Dokumentationsscope
- Umsetzung:
  - aktive Encoding-Schäden, doppelte IDs, unklare Geltung, Markdownlint-
    Fehler, kaputte Links, doppelte Changelog-Versionen und konkurrierende
    Test-/Release-Beschreibungen ausschließlich mechanisch bereinigen. Jede
    notwendige semantische Änderung zum zuständigen S4-Substep zurückgeben und
    dort erneut reviewen.
- Review:
  - `Full`
- Invalidation:
  - `T-QA-01` bis `T-QA-20`; bei Semantik zusätzlich der zuständige
    Consumer-/Full-Review.
- Gate:
  - `none`

Exit: Der migrierte Scope ist formal sauber und inhaltlich eindeutig.

#### S4.11 Ergebnis und Full Review

- `git diff --check`, aktiver Encoding-Scan und Changelog-Struktur: `PASS`.
- `105` aktuelle IDs sind eindeutig: `92` Suite-Tests, fünf Runbooks und acht
  Release-Gates.
- Alle `92` Suite-Tests besitzen das vollständige S2-Schema, keine aktuellen
  Status-/Datumsmarker und keine exakt duplizierten Testkörper.
- Alle fünf Runbooks besitzen Voraussetzungen, Wirkung, Gate, Ablauf,
  Erwartung, Abbruch, Cleanup und Evidence-Vertrag.
- Markdownlint über `21` kanonische QA-, Template-, Changelog- und
  Roadmap-Dateien: `0` Befunde; neu geänderte Zeilen in Legacy-Dokumenten:
  ebenfalls `0` Befunde nach Korrektur von `F-QA-65`.
- `F-QA-66` grenzt bestehende, nicht durch diese Migration erzeugte
  Legacy-Lint-Schulden sichtbar als separaten Wartungsschritt ab.
- S4.9-S4.11 Contract- und Code-/Doku-Review: `PASS`; S5 ist freigegeben.

## S5 - Inhalts-, Link-, Lint- und Abschlussreview

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-QA-01 | lokal | `git diff --check` | DONE | keine Whitespace-/Patchfehler | jede Dokuänderung |
| T-QA-02 | lokal | Markdownlint über alle neuen und geänderten QA-Dateien | DONE | 21 kanonische Dateien, 0 Befunde | Markdownänderung |
| T-QA-03 | lokal | Relative Links und referenzierte Dateien prüfen | DONE | 57 aktive Dateien, 291 gültige relative Ziele | Pfad-/Linkänderung |
| T-QA-04 | lokal | Test-ID-Format und Eindeutigkeit prüfen | DONE | 105 IDs, 105 eindeutig | Suite-Änderung |
| T-QA-05 | Contract | Jeden H2-/H3-Block und semantischen Testinhalt aus aktuellem sowie gesichertem Backup-QA einem Ziel oder einer zulässigen Nichtübernahme zuordnen | DONE | 100 alte H2 exakt aus drei Archivbereichen rekonstruiert; sechs Backup-only-Versionen belegt | Quell-/Zieländerung |
| T-QA-06 | Contract | Aktive Suites gegen zuständige Module Overviews prüfen | DONE | 92 Vertragslinks; keine bekannten Legacy-Claims | Suite-/Overview-Änderung |
| T-QA-07 | lokal | Encoding-Scan auf bekannte Mojibake-Muster in aktiven QA-Dateien | DONE | keine aktiven Treffer | Textänderung |
| T-QA-08 | lokal | Aktive Referenzen auf `docs/QA_CHECKS.md` und neue QA-Pfade semantisch prüfen | DONE | Module zeigen direkt zur Suite; Kompatibilitätsverweise sind gekennzeichnet | Referenzänderung |
| T-QA-09 | Owner | Navigation vom Root-README über QA-Einstieg zu mindestens drei Suites und einem Runbook lesen | DONE | Leseroute ohne Suche nachvollzogen | Indexänderung |
| T-QA-10 | Contract | Jeden bisherigen Changelog-Abschnitt und semantischen Eintrag einem aktuellen oder historischen Ziel zuordnen | DONE | Root-Primärsnapshot und Backup-Supplement stimmen exakt mit Quellen überein | Changelog-Quell-/Zieländerung |
| T-QA-11 | lokal | Root-Changelog auf H1, `Unreleased`, eindeutige reverse chronologische Versionen, ISO-Daten und erlaubte Kategorien prüfen | DONE | eine H1, ein `Unreleased`, erlaubte Kategorien, keine erfundene Version | Changelog-Änderung |
| T-QA-12 | Contract | Versionsanker, Kompatibilitätsvertrag, Tags, Releases und dokumentierte Historie gegeneinander prüfen | DONE | Commit-Anker; keine Tags/Releases; Komponentenmarker nicht als Produktversion gedeutet | Versionsvertrag oder Release-Metadaten |
| T-QA-13 | lokal | Release-Readiness auf existierende eindeutige Suite-IDs und zulässige Nachweisziele prüfen | DONE | acht Gates; Auswahl je Scope; keine dauerhaften Laufresultate | Suite- oder Gate-Änderung |
| T-QA-14 | Owner | Navigation vom Root-README zu QA, Release-Readiness, Root-Changelog und Legacy-Chronik lesen | DONE | aktuelle Prüfung, Änderung und Historie klar getrennt erreichbar | Index-, Changelog- oder Archivänderung |
| T-QA-15 | Contract | Release-Einheit, betroffene Ausrollflächen und tatsächlichen Deployment-Stand gegeneinander prüfen | DONE | reine Dokuänderung; fünf Ausrollflächen explizit; kein Release behauptet | Release-Scope, Deploy oder Versionsvertrag |
| T-QA-16 | Contract | Jede aktuelle Suite auf vollständiges S2-Testfallschema und verbotene Statusmarker prüfen | DONE | 92 vollständige statuslose Testfälle | Suite-Schema oder Statusregel |
| T-QA-17 | Contract | Suite-Ownership und semantische Duplikate domänenübergreifend prüfen | DONE | eindeutige Ownership; keine exakt duplizierten Testkörper | Suite- oder Ownership-Änderung |
| T-QA-18 | Contract | Alle fünf Runbooks auf Voraussetzung, Wirkung, Gate, Schritte, Erwartung, Abbruchbedingung und Cleanup prüfen | DONE | fünf vollständige Runbooks mit gültigen Suite-IDs | Runbook- oder Smoke-Vertrag |
| T-QA-19 | Contract | Historische Archive auf Quellenprovenienz, Statusintegrität, Linkstrategie und belegte Encoding-Behandlung prüfen | DONE | getrennte Vollsnapshots, exakte Quellenrekonstruktion, vier gültige normative Links | Archiv-, Quellen- oder Encoding-Änderung |
| T-QA-20 | lokal/Contract | Aktive Module-/Template-Links sowie verpflichtende S6-Changelog-Relevanzentscheidung prüfen | DONE | vier Pfade korrigiert; drei Templates verlangen Changelog-Relevanz | Modul-, Template- oder Workflow-Änderung |

<!-- markdownlint-enable MD013 -->

Ergebnis:

- Grüne Nachweise:
  - `T-QA-01` bis `T-QA-20`
- Nicht ausgeführte Smokes:
  - keine Runtime-Smokes vorgesehen
- Produktiver Iststand:
  - unverändert
- Externer Review:
  - optional; Findings werden bewertet, nicht blind übernommen
- Offene Findings:
  - `F-QA-57` als externer Android-Release-Blocker
  - `F-QA-66` als abgegrenzte Legacy-Lint-Watchlist
- Korrigierte S5-Findings:
  - `F-QA-67`: 14 fehlende historische Phasen quellentreu ergänzt
  - `F-QA-68`: Abschlussvertrag für externe P0/P1-Watchlists präzisiert
- Commit-Entscheidung:
  - `commitbereit`

Exit: Inhalt, Geltung, QA, Release-Historie, Links, IDs, Encoding und Markdown
sind grün; der Owner kann QA- und Änderungsleseroute nachvollziehen.

## S6 - Source-of-Truth-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / Medium`.

Deterministisch:

1. Root-README, Dev Environment, Templates und betroffene Module Overviews
   gegen die tatsächlich entstandene QA- und Release-Struktur final
   synchronisieren.
2. `docs/qa/README.md`, `docs/qa/release-readiness.md`,
   Kompatibilitätsindex, Suites, Runbooks, Root-Changelog und historische
   Archive gegeneinander auf Rollen-, Versions- und Linkkonsistenz prüfen.
3. Sicherstellen, dass keine temporäre Zuordnungsliste, zweite aktuelle
   QA-Source-of-Truth oder konkurrierende Change-History zurückbleibt.
4. Finalen Full Contract Review des geänderten Dokumentationsscopes
   durchführen.
5. Findings korrigieren; In-Scope-P0/P1 müssen geschlossen sein.
   Out-of-Scope-P0/P1 dürfen nur mit explizitem Owner, Folgeartefakt und Gate
   als Watchlist bestehen bleiben.
6. Changelog-Relevanz dieser Roadmap nach D-QA-25 entscheiden und eine
   bemerkenswerte Änderung unter `Unreleased` erfassen; keinen Release-Cut
   und keinen Git-Tag erzeugen.
7. Resume Card und Statusmatrix auf Abschluss setzen.
8. Commit-Empfehlung aus dem realen Diff ableiten.
9. Roadmap mit `(DONE)` nach `docs/archive/` verschieben.

Ergebnis:

- Source-of-Truth-Sync:
  - Root-README, Dev Environment, QA-Kompatibilitätsindex, `docs/qa/**`,
    Templates, betroffene Module Overviews, Root-Changelog und historische
    QA-/Changelog-Archive
- Finaler Review:
  - `PASS`; F-QA-69 korrigiert, keine In-Scope-P0/P1 offen
- Restrisiken:
  - F-QA-57: Android-OAuth-Callback-Logging blockiert bis zum separaten Fix
    und Device-Nachweis den nächsten Android-Release
  - F-QA-66: bestehende Legacy-Lint-Schulden bleiben ein eigener
    Wartungsschritt
- Changelog-Relevanz:
  - `Unreleased` enthält den kanonischen QA-Einstieg und die Trennung von
    aktueller QA, historischen Nachweisen und Release-Historie; kein
    Release-Cut und kein Git-Tag erzeugt
- Owner Recap:
  - nicht erforderlich; die neue QA-Leseroute wird im Abschluss kurz benannt
- Archiv:
  - `docs/archive/MIDAS QA Documentation Architecture Roadmap (DONE).md`
- Commit-Empfehlung:

```text
docs(qa): separate current QA, release notes and historical evidence
```

Exit: Aktuelle QA und Change-History sind selektiv lesbar, historische
Nachweise bleiben nachvollziehbar, alle aktiven Referenzen sind synchron und
die alten Monolith-Rollen sind beendet.

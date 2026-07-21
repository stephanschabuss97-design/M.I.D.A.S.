# MIDAS Roadmap Templates

Dieser Ordner enthält die stabilen, wiederverwendbaren Prozessartefakte für
MIDAS-Roadmaps. Er ist kein Ablageort für aktive Roadmaps, Arbeitsnachweise
oder Produktdokumentation.

## Dateien und Rollen

<!-- markdownlint-disable MD013 -->

| Datei | Rolle | Verwendung |
| --- | --- | --- |
| [MIDAS Roadmap Workflow Contract.md](MIDAS%20Roadmap%20Workflow%20Contract.md) | Stabiler Arbeitsvertrag | Bei Roadmap-Erstellung vollständig lesen; in Resume-Sessions nur nach Änderung oder Prozess-Finding erneut lesen. |
| [MIDAS Roadmap Template.md](MIDAS%20Roadmap%20Template.md) | Kopiervorlage | Für jede neue Roadmap an den konkreten Scope anpassen und direkt unter `docs/` ablegen. |
| [MIDAS Roadmap Evidence Template.md](MIDAS%20Roadmap%20Evidence%20Template.md) | Bedingte Kopiervorlage | Nur bei den im Workflow-Vertrag genannten Risiko- und Nachweisfällen als aktive Evidence-Datei unter `docs/` anlegen. |

<!-- markdownlint-enable MD013 -->

`docs/DEV_ENVIRONMENT.md`, `docs/qa/README.md` und die fachlichen QA-Suites
bleiben bewusst außerhalb dieses Ordners. Sie sind lebende MIDAS-Quellen,
keine Roadmap-Vorlagen. `docs/QA_CHECKS.md` ist nur ein
Kompatibilitätsindex für ältere Links.

## Neue Roadmap erstellen

1. `README.md` und `docs/DEV_ENVIRONMENT.md` lesen.
2. Dieses Dokument und den Workflow-Vertrag vollständig lesen.
3. Relevante Module Overviews, den QA-Einstieg und nur die für den Scope
   zuständigen Suites beziehungsweise Runbooks lesen.
4. Die Roadmap-Vorlage an Ziel, Risiko, Scope, Gates und Referenzen anpassen.
5. Die aktive Roadmap als `docs/[Titel] Roadmap.md` ablegen.
6. Nur falls der Evidence-Vertrag greift, eine aktive Datei
   `docs/[Titel] Evidence.md` aus der Evidence-Vorlage anlegen.
7. Roadmap-Erstellung und initialen Contract Review mit
   `GPT-5.6 Sol / Extra High` durchführen.
8. Findings korrigieren, bevor S1 begonnen wird.

Im S4 Readiness Review zusätzlich sichere Ausführungsblöcke empfehlen.
Benachbarte Substeps dürfen gemeinsam laufen, wenn Wirkung, Reihenfolge,
Reviewtiefe und Gates kompatibel sind. Ihre einzelnen Ergebnisse und Findings
bleiben dennoch getrennt nachvollziehbar.

Archivierte Roadmaps werden nur gezielt als historische Referenz gelesen. Ein
vollständiger Read aller DONE-Roadmaps oder der gesamten QA-Dokumentation ist
nicht automatisch erforderlich.

## Roadmap fortsetzen

In einer neuen Session zuerst lesen:

1. Roadmap-Metadaten und Session Resume Card.
2. Entscheidungslog und offene Findings.
3. Den aktuellen Schritt und sein Exit-Kriterium.
4. Den relevanten Git-Diff.
5. Nur die Referenzen, die der aktuelle Schritt tatsächlich benötigt.

Der Workflow-Vertrag wird dabei nur erneut vollständig gelesen, wenn er seit
der letzten Aufnahme geändert wurde oder ein Prozess-Finding besteht.

## Lebenszyklus

- Vorlagen und Workflow-Vertrag verbleiben dauerhaft unter `docs/templates/`.
- Aktive Roadmaps und Evidence-Dateien liegen direkt unter `docs/`.
- Nach grünem S6 werden Roadmap und optionale Evidence mit `(DONE)` nach
  `docs/archive/` verschoben.
- S6 entscheidet außerdem die Changelog-Relevanz; ein Eintrag unter
  `Unreleased` erzeugt noch keinen Release-Cut.
- Produktverträge bleiben in den jeweiligen Module Overviews, QA-/HOW-TO- oder
  Architekturdateien. Roadmaps ersetzen diese Sources of Truth nicht.

## Kurzauftrag für einen neuen Chat

```text
Erstelle eine MIDAS-Roadmap samt erforderlicher Begleitdateien analog zu
docs/templates/. Lege aktive Arbeitsdateien unter docs/ ab. Verwende für
Erstellung und initialen Contract Review GPT-5.6 Sol / Extra High, korrigiere
die Findings und beginne noch nicht mit der Umsetzung.
```

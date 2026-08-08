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
4. Den Scope-Freeze für Features, Datenmodell, Lifecycle, Retention und
   Automationen vorbereiten; final bestätigt wird er nach S1-S3 in S4R.
5. Die Roadmap-Vorlage an Ziel, Risiko, Scope, Gates und Referenzen anpassen.
6. Die aktive Roadmap als `docs/[Titel] Roadmap.md` ablegen.
7. Nur falls der Evidence-Vertrag greift, eine aktive Datei
   `docs/[Titel] Evidence.md` aus der Evidence-Vorlage anlegen.
8. Roadmap-Erstellung und initialen Contract Review mit
   `GPT-5.6 Sol / Extra High` durchführen.
9. Die Ausführungs-Chat-Startkarte mit Referenzen, Reasoning-Vertrag,
   Startschritt und Stop-Bedingungen fertigstellen.
10. Im Fresh-Chat-Test prüfen, dass keine notwendige Entscheidung nur im
    Denkraum steht und die Roadmap mit ihren Referenzen ohne Nacherzählung
    ausführbar ist.
11. Findings korrigieren, bevor S1 in einem eigenen Ausführungs-Chat begonnen
    wird.

Im S4 Readiness Review zusätzlich sichere Ausführungsblöcke empfehlen.
Benachbarte Substeps dürfen gemeinsam laufen, wenn Wirkung, Reihenfolge,
Reviewtiefe und Gates kompatibel sind. Ihre einzelnen Ergebnisse und Findings
bleiben dennoch getrennt nachvollziehbar.

## Phasenvertrag für Umsetzung und Review

- S4 ist der Umsetzungsblock. Jeder Substep erhält nur den unmittelbar nötigen
  Delta- oder Consumer-Review und die durch seine Änderung erforderlichen
  Checks. Es gibt keinen separaten S4.5-Abschlussreview und keine
  CodeRabbit-Prüfung innerhalb von S4.
- S5 ist das integrierte Qualitätsgate für den finalen Gesamtdiff vor jeder
  produktiven Wirkung. Zuerst läuft die vollständige relevante lokale,
  statische und gegebenenfalls Browser-/Device-Testmatrix, danach der native
  Code- und Contract Review.
- Bei Codeänderungen folgt CodeRabbit in S5 als zusätzliche unabhängige
  Kontrolle. Findings werden gegen Roadmap, Produktvertrag und reale
  Implementierung bewertet und niemals blind korrigiert.
- Nach berechtigten Korrekturen werden alle invalidierten Checks wiederholt.
  CodeRabbit wird erneut ausgeführt, sobald die Korrektur Code im geprüften
  Diff ändert; reine Dokumentationskorrekturen invalidieren den Lauf nicht.
- Ein technisch oder fachlich mehrdeutiges Finding bleibt ein Owner-Gate. Ein
  nicht verfügbarer externer Review wird mit Grund dokumentiert und nicht
  durch ein behauptetes Ergebnis ersetzt.

Kurzform: S4 baut; S5 prüft, bewertet und härtet das vollständige Ergebnis,
bevor irgendeine produktive Wirkung erlaubt ist.

Der Roadmap-Richtwert von ungefähr 80 KB oder 1.200 Zeilen ist kein hartes
Limit. Überschreitungen sind zulässig, wenn eine sinnvolle Kompaktierung
Entscheidungen, Gates oder Fresh-Chat-Kontext verlieren würde. Gekürzt wird nur
bei echtem Duplikat- oder Auslagerungspotenzial ohne Vertragsverlust.

Entsteht während der Umsetzung eine neue Grundsatzentscheidung, wird nicht
einfach weitergebaut. Kleine Scope-Korrekturen aktualisieren gezielt S2, S3 und
S4R; ein eigenständiger oder supersedierender R3-Scope erhält eine
Follow-up-Roadmap. Eng gekoppelte Roadmaps verwenden nach Möglichkeit dieselbe
Evidence-Datei statt doppelter Runtime- und Cutover-Nachweise.

Archivierte Roadmaps werden nur gezielt als historische Referenz gelesen. Ein
vollständiger Read aller DONE-Roadmaps oder der gesamten QA-Dokumentation ist
nicht automatisch erforderlich.

## Chat-Lebenszyklus

MIDAS trennt Produktdenken und Umsetzung:

- Ein langfristiger Denkraum darf für Vision, Brainstorming und
  Grundsatzentscheidungen weiterverwendet werden.
- Jede neue Roadmap erhält grundsätzlich einen eigenen Ausführungs-Chat.
- Der Denkraum ist keine Source of Truth. Alle für die Umsetzung relevanten
  Entscheidungen müssen in Roadmap, Decision Log oder Produktdokumentation
  stehen.
- Der Ausführungs-Chat folgt der Startkarte und liest die dort genannten
  Quellen selbst. Der Owner muss den MIDAS-Kontext nicht erneut erzählen oder
  Dokumente vollständig in den Prompt kopieren.
- Eine Follow-up-Roadmap ist ein neuer kohärenter Arbeitsauftrag und erhält
  ebenfalls einen neuen Ausführungs-Chat.
- Innerhalb derselben Roadmap bleibt der Ausführungs-Chat bestehen, solange
  Scope und Zielvertrag unverändert sind. Lange Verläufe werden über Resume
  Card und bei Bedarf Kompaktierung fortgesetzt.

Cache-Verhalten ist keine verlässliche Prozessvoraussetzung. Modell und
Reasoning werden bewusst gewählt, um Qualität und Verbrauch zu steuern; weder
Korrektheit noch Freigaben dürfen von einem vermuteten Cache Hit abhängen.

## Roadmap fortsetzen

In einer neuen Session zuerst lesen:

1. Ausführungs-Chat-Startkarte, Roadmap-Metadaten und Session Resume Card.
2. Entscheidungslog und offene Findings.
3. Den aktuellen Schritt und sein Exit-Kriterium.
4. Den relevanten Git-Diff.
5. Nur die Referenzen, die der aktuelle Schritt tatsächlich benötigt.

Bereits gültige Entscheidungen und Nachweise werden über ihre IDs referenziert,
nicht erneut ausformuliert oder ohne Invalidation wiederholt.

Der Workflow-Vertrag wird dabei nur erneut vollständig gelesen, wenn er seit
der letzten Aufnahme geändert wurde oder ein Prozess-Finding besteht.

Der in der Roadmap festgelegte Reasoning-Standard gilt für einen ganzen
Ausführungsblock. Er wird nicht für jeden kleinen Substep umgestellt. Eine
Abweichung ist zulässig, wenn Risiko oder Komplexität sie begründen; sie wird
in Statusmatrix oder Readiness Review festgehalten.

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

Roadmap-Erstellung im Denkraum:

```text
Erstelle eine MIDAS-Roadmap samt erforderlicher Begleitdateien analog zu
docs/templates/. Lege aktive Arbeitsdateien unter docs/ ab. Verwende für
Erstellung und initialen Contract Review GPT-5.6 Sol / Extra High, korrigiere
die Findings, vervollständige die Ausführungs-Chat-Startkarte und beginne noch
nicht mit der Umsetzung.
```

Roadmap-Ausführung in einem frischen Chat:

```text
Arbeite die in [ROADMAP-PFAD] definierte MIDAS-Roadmap gemäß ihrer
Ausführungs-Chat-Startkarte ab. Lies die dort festgelegten Quellen in der
angegebenen Reihenfolge, prüfe den realen Git- und Systemstand und beginne mit
dem eingetragenen Startschritt. Erfinde keine fehlenden Verträge; dokumentiere
Widersprüche als Finding und beachte alle Owner-Gates.
```

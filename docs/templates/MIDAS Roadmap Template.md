# MIDAS Roadmap Template

Kompakter projektspezifischer Vertrag. Die allgemeine Arbeitsweise steht in
`docs/templates/MIDAS Roadmap Workflow Contract.md` und wird nicht in jede
Roadmap kopiert. Erstellung und initialer Contract Review dieser Roadmap
erfolgen mit `GPT-5.6 Sol / Extra High`; die Ausführung routet ihre
Reasoning-Stufen anschließend risikobasiert je Schritt.

---

## [Titel der Roadmap]

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DRAFT` / `ACTIVE` / `DONE` |
| Modul / Bereich | `[Bereich]` |
| Owner / Kontext | `[Kontext]` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `[YYYY-MM-DD]` |
| Letzter Stand | `[YYYY-MM-DD, kurzer Zustand]` |
| Aktueller Schritt | `[S1/S2/S3/S4R/S4.x/S5/S6]` |
| Risikoklasse | `R1` / `R2` / `R3` |
| Standard-Reviewtiefe | `Delta` / `Consumer` / `Full` |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `Medium / High / Extra High` |
| Reasoning-Ausnahmen | `[Schritt: Stufe + Begründung / keine]` |
| Owner-Erklärmodus | `none` / `Briefing` / `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `[Pfade]` |
| Deploy relevant | `ja` / `nein` |
| Produktive Schreibwirkung | `ja` / `nein` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `nicht erforderlich` / `docs/[Titel] Evidence.md` |
| Gekoppelte Roadmaps | `keine` / `[Pfad und Abhängigkeit]` |
| Evidence-Owner | `diese Roadmap` / `[gekoppelte Roadmap]` |
| Archivziel | `docs/archive/[Titel] (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

Diese Karte macht die Roadmap in einem frischen Chat ohne erneutes Erzählen
der MIDAS-Projektgeschichte ausführbar. Sie verweist auf Sources of Truth und
dupliziert sie nicht.

- Auftrag:
  - `Diese Roadmap deterministisch bis zum freigegebenen Gate abarbeiten.`
- Modell und Reasoning:
  - `laut Roadmap-Metadaten`
- Begründete Reasoning-Ausnahmen:
  - `laut Roadmap-Metadaten und Statusmatrix`
- Kontextübergabe aus dem Denkraum:
  - `PASS: alle verbindlichen Entscheidungen stehen im Decision Log oder in
    referenzierten Sources of Truth`
  - oder `BLOCKED: [fehlende Entscheidung]`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  5. `Pflichtreferenzen aus dem Abschnitt Referenzen`
  6. `git status --short und nur der relevante Diff`
- Startschritt:
  - `[S1 oder aktueller Resume-Schritt]`
- Erlaubte Autonomie:
  - `[lokale Reads/Edits/Tests gemäß Tool Permissions]`
- Owner-Gates:
  - `[Deploy / produktives SQL / Device / Workflow / none]`
- Stop-Bedingungen:
  - `Quellenwiderspruch, fehlender Produktvertrag, Scope-Ausweitung oder
    nicht erteilte produktive Freigabe`
- Halluzinationsschutz:
  - `Fehlende Fakten nicht ergänzen. Reale Implementierung und Sources of
    Truth prüfen; Widersprüche als Finding behandeln.`
- Startprompt:

```text
Arbeite diese MIDAS-Roadmap gemäß ihrer Ausführungs-Chat-Startkarte ab.
Lies die festgelegten Quellen in der angegebenen Reihenfolge, prüfe den realen
Git- und Systemstand und beginne mit dem eingetragenen Startschritt. Erfinde
keine fehlenden Verträge; dokumentiere Widersprüche als Finding und beachte
alle Owner-Gates.
```

## Session Resume Card

Beim Fortsetzen zuerst lesen. Unter ungefähr 35 Zeilen halten und nach jedem
Hauptschritt, S4-Ausführungsblock sowie vor Pausen ersetzen.

- Ziel:
  - `[ein Satz]`
- Unveränderliche Verträge:
  - `[Invarianten / Guardrails]`
- Erledigter Stand:
  - `[maximal fünf Punkte]`
- Aktueller Schritt:
  - `[Sx.y und Aufgabe]`
- Nächster erlaubter Schritt:
  - `[genau eine Aktion oder Gate]`
- Offene Findings:
  - `[IDs oder none]`
- Geänderte Dateien:
  - `[Pfade oder Diff-Verweis]`
- Gültige Nachweise:
  - `[T-/EV-/QA-IDs]`
- Runtime-/Deploy-Stand:
  - `[Version / SQL-Stand / nicht relevant]`
- Offene Owner-Freigaben:
  - `[Deploy / SQL / Device / Workflow / none]`
- Stop-Bedingungen:
  - `[was nicht übersprungen werden darf]`

## Zielvertrag

Prüfbares Endergebnis:

- `[beobachtbarer Zielzustand]`
- `[beobachtbarer Zielzustand]`
- `[beobachtbarer Zielzustand]`

Bewusst unverändert:

- `[nicht betroffener Vertrag]`
- `[nicht betroffener Vertrag]`

## Problem und Ist-Zustand

- Beobachtung:
  - `[Ist-Zustand]`
- Risiko oder Reibung:
  - `[Relevanz]`
- Offene Hypothese:
  - `[Annahme oder none]`

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-1 | `[YYYY-MM-DD]` | `[Entscheidung]` | `[Begründung]` | `[Sx / Vertrag]` |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `none / Briefing / Briefing + S6-Recap`
- Neue oder entscheidungsrelevante Konzepte:
  - `[Werkzeug / Architektur / produktive Wirkung / none]`
- Geplante Briefing-Gates:
  - `[Sx.y / none]`
- Nicht erneut zu erklären:
  - `[bekannte Standardarbeit wie normaler JS-/CSS-Fix / none]`

## Scope und Grenzen

In Scope:

- `[Code / SQL / Doku / Runtime]`

Nicht in Scope:

- `[abgegrenzter Bereich]`

Roadmap-spezifische Guardrails:

- `[Guardrail]`
- `[Guardrail]`

## Scope-Freeze vor S4

- Bestehende Features:
  - `[erhalten / entfernen / verändern]`
- Datenmodell, Lifecycle und Retention:
  - `[unverändert / exakte Änderung]`
- Cleanup, Scheduler, Secrets und externe Automationen:
  - `[nicht betroffen / exakte Änderung]`
- Kompatible Producer und Consumer:
  - `[Pfade / Verträge]`
- Offene Grundsatzfragen:
  - `none / [blockiert S4]`
- Umgang mit späterem Scope-Wechsel:
  - `gezielte S2/S3/S4R-Korrektur / Follow-up-Roadmap`

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/modules/[Modul] Module Overview.md`
- `[weitere zwingende Quelle]`

Nur bei konkreter Vertragsfrage:

- `docs/archive/[relevante DONE Roadmap].md`
- `[historische oder technische Quelle]`

## Tool Permissions und Gates

Allowed:

- `[Dateien / Checks / read-only Abfragen]`

User-gated:

- `[Deploy / produktives SQL / Workflow / Device / none]`

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- Scope, Datenwirkung oder Architektur still erweitern.
- `[roadmap-spezifisches Verbot]`

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `[Stufe]` | TODO | |
| S2 | Fachlicher/technischer Zielvertrag | `[Stufe]` | TODO | |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | `[Stufe]` | TODO | |
| S4R | S4 Readiness Review | `[Stufe]` | TODO | |
| S4 | Umsetzung | `je Substep` | TODO | |
| S5 | Tests, Runtime-Gates und Abschlussreview | `[Stufe]` | TODO | |
| S6 | Doku-Sync, Commit und Archiv | `[Stufe]` | TODO | |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-1 | `P0/P1/P2/Watchlist` | `Contract/Code/SQL/Doku/QA/Copy` | `open/fixed/deferred` | `[Sx.y / Begründung]` |

<!-- markdownlint-enable MD013 -->

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / [Stufe]`.

Deterministisch:

1. Pflichtreferenzen lesen.
2. Producer, Consumer und Sources of Truth kartieren.
3. Tests, Runtime, Datenbestand und Entscheidungen gezielt erfassen.
4. Annahmen von Fakten trennen.
5. Findings und Fragen dokumentieren.
6. Contract Review, Korrektur und Abnahme.

Ergebnis:

- Systemkarte:
  - `[kurz]`
- Betroffene Schichten:
  - `[kurz]`
- Belegte Verträge:
  - `[kurz]`
- Offene Fragen:
  - `[IDs oder none]`
- Doku-Sync:
  - `S6 / jetzt nur bei blockierender Source-of-Truth-Korrektur / nicht erforderlich`

Exit: Betroffene und nicht betroffene Schichten sind eindeutig.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / [Stufe]`.

Deterministisch:

1. Ziel gegen Produkt- und Modul-Guardrails prüfen.
2. Optionen nur bei echter Mehrdeutigkeit vergleichen.
3. Daten-, Fehler-, Zeit-, Security- und Copy-Vertrag festlegen.
4. Scope und Nicht-Scope finalisieren.
5. Findings S4 oder Watchlist zuordnen.
6. Contract Review, Korrektur und Abnahme.

Ergebnis:

- Finaler Zielvertrag:
  - `[kurz]`
- Gewählte Lösung:
  - `[kurz]`
- Abgrenzung:
  - `[kurz]`
- S4-Pflichtpunkte:
  - `[IDs]`
- Doku-Sync:
  - `S6 / jetzt nur bei blockierender Source-of-Truth-Korrektur / nicht erforderlich`

Exit: Keine Grundsatzfrage bleibt offen.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / [Stufe]`.

Deterministisch:

1. stille Ausfälle, falsche Sicherheit, Alarm und Datenverlust prüfen.
2. Auth, RLS, Race, Dedupe, Zeit und Cache prüfen, soweit relevant.
3. User-Facing Copy prüfen, soweit relevant.
4. Rollback, Stop-Bedingungen und Tests festlegen.
5. S4-Substeps, Reihenfolge und Reviewtiefe ableiten.
6. Contract Review, Korrektur und Abnahme.

Ergebnis:

- Blockierende Risiken:
  - `[IDs oder none]`
- Rollback-/Stop-Vertrag:
  - `[kurz]`
- S4-Schnitt:
  - `[Substeps]`
- S5-Pflichtchecks:
  - `[T-/EV-IDs]`
- Doku-Sync:
  - `S6 / jetzt nur bei blockierender Source-of-Truth-Korrektur / nicht erforderlich`

Exit: Risiken sind geschlossen, zugeordnet oder deferred.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / [Stufe]`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks / Evidence | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | `[Änderung]` | `[IDs]` | `[Pfade]` | `Delta/Consumer` | `[T-/EV-IDs]` | `none/User` |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - `[bestätigt oder korrigiert]`
- Fehlende Zuordnung:
  - `[Finding oder none]`
- Evidence:
  - `[angelegt / nicht erforderlich]`
- Scope-Freeze:
  - `PASS / BLOCKED: [Grund]`
- Gültig übernommene Nachweise:
  - `[T-/EV-/QA-IDs; nicht erneut ausführen]`
- Invalidation Map:
  - `[Änderung -> erneut nötige Checks]`
- Owner-Gates:
  - `[Positionen]`
- Empfohlene S4-Ausführungsblöcke:
  - `[z. B. S4.1-S4.3 gemeinsam; S4.4 separat]`
- Begründung der Zusammenlegung/Trennung:
  - `[gleicher Scope, gleiche Wirkung, kompatible Reviewtiefe, keine Gates dazwischen]`
- Review je Ausführungsblock:
  - `[gemeinsamer Review plus weiterhin nachvollziehbare Substep-Ergebnisse]`
- Readiness-Findings/Korrekturen:
  - `[kurz oder none]`

Exit: S4 kann ohne neue Grundsatzentscheidung beginnen; sichere
Ausführungsblöcke und notwendige Einzelgates sind festgelegt.

## S4 - Umsetzung

S4 ist ausschließlich der Implementierungsblock. Substeps erhalten den für
ihr Delta erforderlichen Review und invalidierte Checks. Ein separater
S4.5-Abschlussreview oder CodeRabbit-Lauf gehört nicht in S4.

### S4.x - [Name]

Reasoning: `GPT-5.6 Sol / [Stufe]`.

- Vertrag:
  - `[Finding / Decision-ID]`
- Dateien:
  - `[Pfade]`
- Umsetzung:
  - `[Änderung]`
- Review:
  - `Delta / Consumer`
- Invalidation:
  - `[erneut nötige T-/EV-IDs]`
- Gate:
  - `[Owner Briefing / none]`

#### Ergebnis S4.x

- Änderung:
  - `[nur Delta, kurz]`
- Prüfung:
  - `[T-/EV-ID]`
- Finding/Korrektur:
  - `[ID oder none]`
- Restrisiko:
  - `[kurz oder none]`
- Doku-Sync:
  - `S6 / jetzt nur bei blockierender Source-of-Truth-Korrektur / nicht erforderlich`
- Status:
  - `DONE / BLOCKED`

Exit: Alle In-Scope-Findings sind umgesetzt oder abgegrenzt.

## S5 - Tests, Runtime-Gates und Abschlussreview

Reasoning: `GPT-5.6 Sol / [Stufe]`.

Deterministische Reihenfolge:

1. Vollständige relevante lokale, statische und gegebenenfalls
   Browser-/Device-Testmatrix ausführen.
2. Nativen Full Code und Contract Review des finalen Gesamtdiffs durchführen.
3. Bei Codeänderungen CodeRabbit gegen denselben finalen Diff ausführen.
4. Jedes externe Finding gegen Roadmap, Produktvertrag und reale
   Implementierung bewerten; nichts blind korrigieren.
5. Nur berechtigte Findings minimal korrigieren und alle dadurch invalidierten
   Checks wiederholen.
6. CodeRabbit erneut ausführen, sobald eine berechtigte Korrektur Code im
   geprüften Diff ändert. Reine Dokumentationskorrekturen invalidieren den
   CodeRabbit-Lauf nicht.
7. Mehrdeutige Produktentscheidungen als Owner-Gate behandeln. Einen nicht
   verfügbaren externen Review mit Grund dokumentieren und nicht ersetzen.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-1 | lokal | `[Check]` | TODO | `[kurz / EV-ID]` | `[Dateien]` |
| T-2 | disposable | `[Fixture]` | TODO | `[EV-ID]` | `[SQL/Schema]` |
| T-3 | produktiv read-only | `[Abfrage]` | TODO | `[EV-ID]` | `[Runtime]` |
| T-4 | produktiv write | `[Aktion]` | USER-GATED | `[EV-ID]` | `[Deploy/SQL]` |
| T-5 | Browser/Device | `[Smoke]` | TODO | `[Owner]` | `[UI/Runtime]` |

<!-- markdownlint-enable MD013 -->

Ergebnis:

- Grüne Nachweise:
  - `[T-/EV-IDs]`
- Wiederverwendete, nicht invalidierte Nachweise:
  - `[T-/EV-/QA-IDs]`
- Nicht ausgeführte Smokes:
  - `[mit Grund]`
- Produktiver Iststand:
  - `[Version / Zähler / none]`
- Externer Review:
  - `[CodeRabbit / anderer / nicht erfolgt]`
- Offene Findings:
  - `[IDs oder none]`
- Commit-Entscheidung:
  - `commitbereit / S6 offen / blockiert`

Exit: Relevante Checks sind grün oder sichtbar abgegrenzt.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / [Stufe]`.

Deterministisch:

1. Module Overviews synchronisieren.
2. QA und HOW-TO nur mit bewiesenen Ergebnissen aktualisieren.
3. optionalen Owner Recap in Alltagssprache schreiben, wenn neue Werkzeuge,
   Architekturentscheidungen oder produktive Wirkung erklärt werden müssen.
4. finalen Contract Review in erforderlicher Tiefe durchführen.
5. Findings korrigieren; In-Scope-P0/P1 müssen geschlossen sein.
   Out-of-Scope-P0/P1 dürfen nur mit explizitem Owner, Folgeartefakt und Gate
   als Watchlist bestehen bleiben.
6. Changelog-Relevanz entscheiden: bemerkenswerte Änderungen unter
   `Unreleased` in `CHANGELOG.md` erfassen oder `nicht bemerkenswert`
   begründen; dadurch keinen Release-Cut oder Git-Tag erzeugen.
7. Resume Card auf Abschluss setzen.
8. Commit-Empfehlung aus realem Diff ableiten.
9. Roadmap und Evidence mit `(DONE)` archivieren.

Ergebnis:

- Source-of-Truth-Sync:
  - `[Dateien]`
- Finaler Review:
  - `PASS / Findings`
- Restrisiken:
  - `[Watchlists oder none]`
- Changelog-Relevanz:
  - `Unreleased aktualisiert / nicht bemerkenswert: [Begründung]`
- Owner Recap:
  - `nicht erforderlich`
  - oder maximal 10 bis 15 Punkte zu `Was / Warum / Verhalten / Merksatz`
- Archiv:
  - `[Pfad]`
- Commit-Empfehlung:

```text
[type(scope): kurze Beschreibung]
```

Exit: Code, Runtime, Roadmap, QA und Doku beschreiben denselben finalen
Vertrag; erforderliche Owner-Briefings und der optionale Recap sind erledigt.

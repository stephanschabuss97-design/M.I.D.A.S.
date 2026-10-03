# MIDAS Roadmap — lokale Ergänzungen

Revision des gemeinsamen Kerns: [BLUEPRINT-1 / 2026-09-27](../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md).
Dies ist ein MIDAS-Adapter, keine dritte vollständige Dokumentform.
Zuerst [Rolling Wave](../../../codex-tools/docs/blueprint/ROLLING_WAVE_ROADMAP_TEMPLATE.md)
oder [Execution](../../../codex-tools/docs/blueprint/EXECUTION_ROADMAP_TEMPLATE.md)
nach Arbeitsform wählen; bei Bedarf gezieltes Child. Danach nur die benötigten
lokalen Felder und S1–S6-Schritte unten in die neue Roadmap übernehmen.
Vorlagenlinks an den Ablageort unter docs/ anpassen.

## Verbindliche lokale Felder vor READY

- [MIDAS-Workflowvertrag](MIDAS%20Roadmap%20Workflow%20Contract.md) vollständig lesen.
- Erstellung/Initialreview: GPT-5.6 Sol / Extra High gemäß lokalem Vertrag;
  Ausführung nach begründeter Reasoning-Welle, beobachtbare Einstellung oder
  NOT_OBSERVABLE, keine stille Erhöhung.
- Metadaten: medizinischer/Produktkontext, R1/R2/R3, Reviewtiefe, Autonomieprofil
  local-full/gated/manual (Standard gated), maximaler Endpunkt, Modell/Reasoning,
  Discovery-Freigabe, Arbeitsgröße, externe Reviewgrenze, Evidence-Owner/Datei,
  gekoppelte Roadmaps, produktive Wirkung, Deploy-/Devicegates und Archivziel.
- Startkarte: eigener Ausführungs-Chat, lokale Pflichtreferenzen, konkrete
  Freigabe/Operatoraktionen und Usage-Checkpoints nach lokalem Workflow.
- Capability-Receipt aus BLUEPRINT mit konkretem MIDAS-Bedarf ausfüllen;
  MISSING/INCOMPATIBLE blockiert READY. Kein implizites Setup.
- Scope-Freeze: Features, Datenmodell, Lifecycle/Retention, Cleanup, Scheduler,
  Secrets, externe Automationen und kompatible Producer/Consumer entscheiden.
- KASRKIN-Checkpoint-Felder nach gepinntem Vertrag: Zeit, validierte Fenster,
  Resetidentitäten, Blockklasse, Reserve/Entscheidung und erlaubte Folge;
  keine zweite Policy oder erfundene Deltas.
- Context-Reuse/Live-Read-Grenzen und Evidence-Pflichten des MIDAS-Vertrags
  ergänzen; keine sensiblen Rohdaten oder Secretwerte in Evidence.
- Findings: lokale P0/P1/Risiko-Definitionen und wirksame Ownergates anwenden.

Die folgenden Phasen sind die lokale MIDAS-Ausprägung, nicht der gemeinsame
BLUEPRINT-Kern. R1 darf S1–S3 kompakt zusammenfassen; medizinische/Daten-/Security-
und produktive Gates werden dadurch nicht abgeschwächt.

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / [Stufe]`.

Deterministisch:

1. Pflichtreferenzen lesen.
2. Producer, Consumer und Sources of Truth kartieren.
3. Tests, Runtime, Datenbestand und Entscheidungen gezielt erfassen.
4. Annahmen von Fakten trennen.
5. Findings und Fragen dokumentieren.
6. Context Receipt mit Baseline, relevanten Quellen, Evidence und
   Invalidation anlegen.
7. Contract Review, Korrektur und Abnahme.

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
| S4.1 | `[Änderung]` | `[IDs]` | `[Pfade]` | `nativer Delta/Consumer` | `[T-/EV-IDs]` | `none/User` |

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
- Kohärenz-/Atomaritätsgrenze je Ausführungsblock:
  - `[welcher Zustand innerhalb des Blocks nicht sicher teilbar ist und welche
    Postcondition eine saubere Resume-Grenze herstellt]`
- Diagnosewellen:
  - `[Reproduktion / minimaler Fix / Last-Mile-Harness / invalidierte
    Fullmatrix und Review getrennt; Zusammenlegung nur bei unsicherem
    Zwischenzustand]`
- Last-Mile-Orakel bei produktivem UI-Write:
  - `[DOM-Geste -> aktiver Listener -> Shell/Lifecycle -> Commit/Recovery ->
    Data Access -> Transport; Test-/Evidence-ID / nicht relevant]`
- Zielpostimage-Precheck:
  - `[aktuelles, Forward- und Rollbackpostimage samt günstigem Orakel / nicht
    relevant]`
- Produktiver Fehlerpfad:
  - `[Rollback + Daten-/Runtimepostcheck atomar; Diagnose erst nach neuem Gate
    / nicht relevant]`
- Usage-Gates zwischen Ausführungsblöcken:
  - `[Ux vor Block A; Ux nach Block A/vor Block B; Ux vor S5; Ux nach S5/vor
    S6; bei separater S5-Korrektur-/Retest-Welle zusätzlich davor]`
- Begründung der Zusammenlegung/Trennung:
  - `[gleicher Scope, gleiche Wirkung, kompatible Reviewtiefe, keine Gates dazwischen]`
- Review je Ausführungsblock:
  - `[gemeinsamer Review plus weiterhin nachvollziehbare Substep-Ergebnisse]`
- Reviewbudget:
  - `[S4 grundsätzlich Delta/Consumer; begründete Full-Review-Grenzen mit
    Evidence-ID, Invalidation und in S5 wiederverwendetem Prüfanteil / keine]`
- Aufwandsprognose:
  - `Größenklasse: [small/medium/large]`
  - `Umsetzungspakete und erwartete Dateigruppen: [kurz]`
  - `Runtimeflächen / SQL / Backend: [kurz oder none]`
  - `Browser / Device / produktive Gates: [kurz oder none]`
  - `Teure Testpässe und externes Review: [Anzahl und Position]`
  - `Context-Rehydration / Toolinteraktionen / Fehlersuche: [kurz]`
  - `Doku / Evidence / Postconditions: [kurz]`
  - `Empfohlene autonome Wellen samt Reasoning: [Schrittbereich: Stufe]`
  - `Usage-Reserve: [reale vergleichbare Checkpoints; Operational Safety Floor
    = vollständiger Block bis zur sicheren Produkt-/Rollbackpostcondition + 1
    Punkt Sensorauflösung; Autonomous Full-Closure Floor = Operational Safety
    Floor + noch nicht enthaltene echte CLOSURE_ONLY-Kosten; effektive Grenzen
    jeweils mit erforderlichem Usage-Band; Preferred = höherer Wert aus × 1,5
    und Full-Closure Floor; 25/10 nie als Kosten addieren; Machbarkeit und
    Boundary verfügbar ja/nein; fehlende Daten nie schätzen]`
  - `Blockklasse: [BOUNDED_DOCUMENTATION / BOUNDED_LOCAL /
    DISCOVERY_BOUNDED / DIAGNOSTIC_UNBOUNDED / INTEGRATED_REVIEW /
    PRODUCTIVE_CUTOVER / CLOSURE_ONLY]`
  - `Fallbackvertrag: [keiner / genau ein vorab bounded Kandidat;
    Anti-Splitting, Primary-Invalidation und Boundedness-Breach geprüft]`
  - `Owner-Briefing bei large: [PASS / nicht relevant]`
- Readiness-Findings/Korrekturen:
  - `[kurz oder none]`

Exit: S4 kann ohne neue Grundsatzentscheidung beginnen; sichere
Ausführungsblöcke, Arbeitsgröße und notwendige Einzelgates sind festgelegt.
Ein reiner Discovery-Auftrag endet hier; nur eine in der Startkarte vorab
freigegebene Implementierungswelle darf gemäß Autonomieprofil fortfahren.

## S4 - Umsetzung

S4 ist ausschließlich der Implementierungsblock. Substeps erhalten den für
ihr Delta erforderlichen nativen Review und invalidierte Checks. `Nativer
Review` bedeutet hier lokale Code-/Contract-/Consumer-Prüfung und keinen
externen CodeRabbit-Aufruf. Ein separater
S4.5-Abschlussreview oder CodeRabbit-Lauf gehört nicht in S4. Ein Full Review
ist nur an einer in S4R ausdrücklich begründeten Risiko- oder Produktivgrenze
zulässig und muss seine wiederverwendbare Evidence sowie Invalidation nennen.

### S4.x - [Name]

Reasoning: `GPT-5.6 Sol / [Stufe]`.

- Vertrag:
  - `[Finding / Decision-ID]`
- Dateien:
  - `[Pfade]`
- Umsetzung:
  - `[Änderung]`
- Review:
  - `nativer Delta / nativer Consumer / in S4R begründetes natives Full`
- S5-Evidence-Übernahme:
  - `[keine / Evidence-ID + unverändert gültiger Prüfanteil]`
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

Vor S5 ein frisches Usage-Gate ausführen. Entsteht nach einem vollständig
abgeschlossenen Prüfblock eine getrennte Korrektur-/Retest-Welle, vor deren
Beginn erneut messen. Wenige Dateien oder LOC genügen nicht zur Einstufung als
kurzer Block; Context-, Tool-, Browser-, Review- und Dokumentationsarbeit
gehören zur realen Blockgröße.

Deterministische Reihenfolge:

1. Mit einem günstigen Precheck bestätigen, dass Productload, Cacheversion,
   Runtime- und Zielpostimage zum vorgesehenen Testmodus passen.
2. Vollständige relevante lokale, statische und gegebenenfalls
   Browser-/Device-Testmatrix ausführen.
3. Bei produktiven UI-Schreibpfaden das vollständige Last-Mile-Orakel
   ausführen; getrennte Komponententests allein genügen nicht.
4. Nativen Full Code und Contract Review des finalen Gesamtdiffs durchführen.
5. Bei Codeänderungen genau einen geplanten initialen CodeRabbit-Lauf über den
   kanonischen `coderabbit`-Aufruf gegen denselben finalen Diff ausführen.
6. Jedes externe Finding gesammelt gegen Roadmap, Produktvertrag und reale
   Implementierung bewerten; nichts blind korrigieren.
7. Berechtigte Findings gebündelt und minimal korrigieren und alle dadurch
   invalidierten Checks wiederholen.
8. Genau einen geplanten CodeRabbit-Verifikationslauf auf dem korrigierten Diff
   ausführen. Weitere Läufe nur bei neuem P0/P1-, Security-, Datenintegritäts-
   oder Vertragsrisiko oder auf ausdrücklichen Owner-Auftrag; gewöhnliche
   Nitpicks eröffnen keine unbeschränkte Reviewspirale.
9. Mehrdeutige Produktentscheidungen als Owner-Gate behandeln. Einen nicht
   verfügbaren externen Review mit Grund dokumentieren und nicht ersetzen.

Ein ausgeschöpftes CodeRabbit-Budget sperrt keinen nativen Review. Beide
Prüfpfade bleiben getrennt und unterliegen ihren eigenen Usage- und
Scope-Gates.

Externes Reviewbudget:

- S1-S4: `0` CodeRabbit-Läufe.
- S5 Initial: bei Codeänderungen maximal `1` Lauf; bei Doku-only `0`.
- S5 Verifikation: maximal `1` Lauf nach berechtigten Korrekturen.
- Zusätzlicher Lauf: nur bei neuem P0/P1-, Security-, Datenintegritäts- oder
  Vertragsrisiko oder ausdrücklichem Owner-Auftrag; als Ausnahme begründen.

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
  - `[Tool/Version; Initial n; Verifikation n; Ausnahme n + Grund / nicht erfolgt]`
- Offene Findings:
  - `[IDs oder none]`
- Commit-Entscheidung:
  - `commitbereit / S6 offen / blockiert`

Exit: Relevante Checks sind grün oder sichtbar abgegrenzt.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / [Stufe]`.

S6 beginnt erst nach vollständig abgeschlossenem S5 und einem frischen
Usage-Gate. `SAFE_CLOSURE` bewahrt den grünen S5-Stand und verschiebt nur S6.

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
9. Bei geplanter Folgeroadmap einen kompakten Follow-up Postimage Receipt an
   genau einem Ort ergänzen: ohne Evidence in der Roadmap, mit Evidence
   vorzugsweise dort; keine zusätzliche Datei und keine doppelte Pflege
   erzeugen.
10. Roadmap und Evidence mit `(DONE)` archivieren.

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
- Follow-up Postimage Receipt, falls relevant und nicht in Evidence geführt:
  - `Finaler Writer: [Vertrag]`
  - `Aktive Consumer / Runtimepfade: [Verträge]`
  - `API-/RPC-Grenzen: [Verträge]`
  - `Source-Fingerprints / Evidence-IDs: [IDs]`
  - `Invalidation Trigger: [Liste]`
  - `Original zwingend erforderlich bei: [Exact-Source-Fragen]`
- Archiv:
  - `[Pfad]`
- Commit-Empfehlung:

```text
[type(scope): kurze Beschreibung]
```

Exit: Code, Runtime, Roadmap, QA und Doku beschreiben denselben finalen
Vertrag; erforderliche Owner-Briefings und der optionale Recap sind erledigt.

# MIDAS Roadmap Template

Zweck dieses Templates:

- Ein LLM oder ein neuer Chat soll mit einem Blick verstehen, wie MIDAS-Roadmaps aufgebaut und abgearbeitet werden.
- Die Struktur bleibt der bisherigen MIDAS-Arbeitsweise treu.
- Roadmaps sind nicht nur To-do-Listen, sondern Arbeits-, Review-, QA- und Doku-Vertraege.
- Neue Features oder Fixes werden erst verstanden, dann umgesetzt, dann geprueft, dann dokumentiert.

Wichtige Regel:

- Dieses Template nicht blind ausfuellen.
- Unpassende Punkte bewusst streichen oder als `nicht relevant` markieren.
- Keine neuen Architekturkonzepte erfinden, wenn die betroffene Roadmap nur einen engen Fix braucht.

---

# [Titel der Roadmap]

## Ziel (klar und pruefbar)

Beschreibe konkret, was am Ende besser, stabiler, leiser, sichtbarer oder wartbarer sein soll.

Pruefbare Zieldefinition:

- [konkreter pruefbarer Zielpunkt]
- [konkreter pruefbarer Zielpunkt]
- [konkreter pruefbarer Zielpunkt]

Gute Ziele:

- sind beobachtbar
- sind testbar oder reviewbar
- beschreiben den erwarteten Systemzustand
- vermeiden vage Formulierungen wie `verbessern`, ohne zu sagen woran man es erkennt

## Problemzusammenfassung

Kurz erklaeren, warum diese Roadmap existiert.

- Was ist der beobachtete Ist-Zustand?
- Was ist daran riskant, unklar, laut, schwer wartbar oder alltagsuntauglich?
- Welche Hypothesen muessen geprueft werden?
- Was ist bereits bekannt?

Wenn das Problem noch unklar ist, hier keine Loesung behaupten. Dann ist die erste Aufgabe Detektivarbeit.

## Scope

Was darf diese Roadmap anfassen?

- [Codebereich]
- [Doku]
- [Workflow]
- [UI]
- [Backend/Edge Function]
- [QA]

Scope soll eng genug sein, damit keine Nebenbaustellen entstehen.

## Not in Scope

Was wird bewusst nicht angefasst?

- [ausgeschlossener Bereich]
- [ausgeschlossener Bereich]
- [ausgeschlossener Bereich]

Dieser Abschnitt ist in MIDAS wichtig. Er verhindert, dass aus einem kleinen Fix ein Architekturumbau wird.

## Relevante Referenzen (Code)

- `[Pfad]`
- `[Pfad]`
- `[Pfad]`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/modules/[Modul] Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/[relevante DONE Roadmap].md`

Regel:

- Erst README lesen.
- Dann betroffene Module Overviews lesen.
- Dann historische Roadmaps lesen, falls sie denselben Vertrag betreffen.
- Erst danach Code lesen oder aendern.

## Guardrails

Welche MIDAS-Prinzipien duerfen nicht verletzt werden?

- MIDAS bleibt single-user und alltagstauglich.
- Kein Push-Spam.
- Keine Reminder-Ketten ohne explizite Entscheidung.
- Keine freie medizinische Diagnose oder neue medizinische Bewertung ohne Scope.
- Keine native Android-/TWA-/Service-Worker-Ausweitung ohne konkreten Befund.
- Keine versteckten Writes oder Hintergrundautomation ohne klaren Nutzerkontext.
- Modulgrenzen bleiben ernst gemeint.
- Source-of-Truth-Dokus muessen am Ende synchron sein.

Ergaenze hier projektspezifische Guardrails.

## Architektur-Constraints

Welche technischen Grenzen gelten?

- [z. B. GitHub Cron ist UTC]
- [z. B. Edge Function ist fachliche Source of Truth]
- [z. B. lokale Suppression nur bei Remote-Health]
- [z. B. keine Build-Pipeline]

Constraints sind keine Wuensche, sondern Grenzen, gegen die spaeter reviewed wird.

## Tool Permissions

Allowed:

- [welche Dateien/Module duerfen geaendert werden]
- [welche Checks duerfen ausgefuehrt werden]
- [welche Deploys duerfen ausgefuehrt werden, falls relevant]

Forbidden:

- [welche Dateien/Module duerfen nicht angefasst werden]
- [welche Architekturpfade sind verboten]
- [welche Produktgrenzen duerfen nicht verschoben werden]

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S6`.
- `S1` bis `S3` sind Doku-Detektivarbeit, Systemverstaendnis, Risikoanalyse und Contract Reviews.
- `S4` ist der Umsetzungsblock mit Code-, Workflow-, UI-, Backend- oder Doku-Aenderungen.
- `S5` ist der Pruefblock mit lokalen Checks, Smokes, Code Reviews und Contract Reviews.
- `S6` ist Doku-Sync, QA-Update, finaler Contract Review, Commit-Empfehlung und Archiv-Entscheidung.
- Nach jedem Hauptschritt Statusmatrix aktualisieren.
- Nach jedem Hauptschritt mindestens ein Check oder Review dokumentieren.
- Jeder Hauptschritt endet mit:
  - Schritt-Abnahme
  - Doku-Sync-Entscheidung
  - Commit-Empfehlung

## Skalierung der Roadmap

Dieses Template ist ein Standardgeruest, kein Zwang zu sechs grossen Phasen.

Die Reihenfolge bleibt gleich, aber die Tiefe darf variieren.

- Kleine Fixes:
  - S1 bis S3 duerfen kompakt zusammengefasst werden, wenn Systemvertrag und Risiko klar sind.
  - Beispiel: `S1-S3 Kurzreview: README/Overview geprueft, keine Guardrail-Beruehrung, Umsetzung unkritisch.`
  - S4 bleibt der Umsetzungsblock, sobald Code geaendert wird.
  - S5 bleibt der Pruefblock, sobald Code geaendert wird.
  - S6 ist nur klein, wenn keine Source-of-Truth-Doku betroffen ist.
- Mittlere Features:
  - S1 bis S6 normal verwenden.
  - Substeps duerfen schlank bleiben.
  - Reviews muessen trotzdem dokumentieren, was geprueft wurde.
- Grosse oder riskante Aenderungen:
  - S1 bis S3 ausfuehrlich machen.
  - S4 substepweise umsetzen.
  - S5 strikt trennen in lokal, GitHub/Backend, Device und nur definierbare Smokes.
  - S6 vollstaendig mit Module Overview, QA, Roadmap und finalem Contract Review abschliessen.

Bereiche, bei denen S1 bis S6 immer voll angewendet werden sollen:

- Push / Notifications
- Auth
- Android / TWA / WebView
- Service Worker / PWA Lifecycle
- SQL / RLS / Datenmodell
- Edge Functions / Backend Contracts
- medizinische Fachlogik
- Assistant-/Voice-Allowed-Actions
- Guardrail- oder Source-of-Truth-Aenderungen

Minimalregel:

- Wenn Code geaendert wird, gibt es mindestens:
  - kurzen Contract Review vor der Umsetzung
  - S4 Umsetzung
  - S5 lokale Checks oder begruendete Nicht-Verfuegbarkeit
  - kurze Abschlussnotiz
- Wenn Source-of-Truth-Doku betroffen ist, muss S6 die Doku synchronisieren.
- Wenn User-facing Texte betroffen sind, muss ein User-Facing Copy Review stattfinden.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | System- und Vertragsdetektivarbeit | TODO | Relevante Doku, Codepfade und bestehende Vertraege lesen. |
| S2 | Fachlicher/technischer Contract Review | TODO | Zielvertrag, Scope und Risiken gegen MIDAS-Guardrails pruefen. |
| S3 | Bruchrisiko-, UI-/Copy- und Umsetzungsreview | TODO | Bruchrisiken, User-Facing-Texte und konkrete S4-Pflichtpunkte klaeren. |
| S4 | Umsetzung | TODO | Gefundene Punkte sequenziell umsetzen, je Substep mit Review. |
| S5 | Tests, Code Review und Contract Review | TODO | Lokal moegliche Checks ausfuehren, externe Smokes definieren oder ausfuehren. |
| S6 | Doku-Sync, QA-Update und finaler Abschlussreview | TODO | Source-of-Truth-Dokus, QA und Roadmap final synchronisieren. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

---

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- Bestehendes System verstehen.
- Betroffene Source-of-Truth-Dokus lesen.
- Codepfade identifizieren.
- Noch keinen Code aendern, ausser die Roadmap selbst wird aktualisiert.

Typische Substeps:

- S1.1 README und relevante Guardrails lesen.
- S1.2 betroffene Module Overviews lesen.
- S1.3 relevante historische Roadmaps aus `docs/archive/` lesen.
- S1.4 betroffene Codepfade identifizieren.
- S1.5 aktuelle Datenfluesse und Source-of-Truth-Vertraege dokumentieren.
- S1.6 erste Findings und offene Fragen dokumentieren.
- S1.7 Contract Review S1.
- S1.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Systemkarte.
- Relevante Dateien.
- Bestehender Vertrag.
- Offene Fragen.

Exit-Kriterium:

- Es ist klar, welche Schichten betroffen sind und welche nicht.

## S2 - Fachlicher/technischer Contract Review

Ziel:

- Zielidee gegen bestehende MIDAS-Vertraege pruefen.
- Klaeren, ob die Roadmap in Scope bleibt.
- Technische und fachliche Zielrichtung festlegen.

Typische Substeps:

- S2.1 Ziel gegen README-Guardrails pruefen.
- S2.2 Ziel gegen Module Overviews pruefen.
- S2.3 technische Constraints pruefen.
- S2.4 moegliche Loesungsoptionen vergleichen, falls noetig.
- S2.5 finalen Zielvertrag dokumentieren.
- S2.6 Findings und Pflichtkorrekturen fuer S4 definieren.
- S2.7 Contract Review S2.
- S2.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Belastbarer Zielvertrag.
- Explizite Abgrenzung.
- Erste S4-Pflichtpunkte.

Exit-Kriterium:

- Umsetzung kann starten, ohne dass Grundsatzfragen offen sind.

## S3 - Bruchrisiko-, UI-/Copy- und Umsetzungsreview

Ziel:

- Risiken finden, bevor Code geaendert wird.
- User-Facing-Texte und Statusmeldungen gegen Produktrealitaet pruefen.
- Konkrete S4-Substeps ableiten.

Typische Substeps:

- S3.1 Bruchrisiken identifizieren:
  - stille Ausfaelle
  - falsche Sicherheit
  - falscher Alarm
  - Dedupe-/Race-Probleme
  - mobile Layout-Probleme
  - Doku-/Code-Drift
- S3.2 User-Facing Copy Review:
  - Statusmeldungen duerfen keinen falschen Alarm erzeugen.
  - Statusmeldungen duerfen keine falsche Sicherheit geben.
  - Normale Zwischenzustaende muessen als normal erkennbar sein.
  - Echte Fehler muessen klarer sein als neutrale Wartestatus.
  - Profil/Hub zeigen eher ruhige Kurzstatus.
  - Touchlog/Maintenance zeigt eher technische Diagnose.
- S3.3 Tooling und lokal moegliche Checks klaeren.
- S3.4 S4-Substeps konkretisieren.
- S3.5 Contract Review S3.
- S3.6 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Bruchrisiko-Liste.
- Copy-/Status-Vertrag.
- Konkreter Umsetzungsplan fuer S4.

Exit-Kriterium:

- S4 hat klare Substeps und bekannte Review-Kriterien.

## S4 - Umsetzung

Ziel:

- Gefundene Punkte sequenziell umsetzen.
- Nicht alles auf einmal aendern.
- Nach jedem Substep direkt pruefen und dokumentieren.

Typische Substeps:

- S4.1 [erster konkreter Code-/Workflow-/Doku-Schritt]
- S4.2 [zweiter konkreter Schritt]
- S4.3 [weiterer konkreter Schritt]
- S4.x User-Facing Copy bei betroffenen UI-/Status-Texten umsetzen.
- S4.y Code Review waehrend der Umsetzung.
- S4.z Schritt-Abnahme.

Jeder S4-Substep sollte dokumentieren:

- Umsetzung
- betroffene Dateien
- lokaler Check
- Contract Review
- Findings
- Korrekturen
- Restrisiken

Output:

- Implementierter Follow-up-Stand.

Exit-Kriterium:

- Alle priorisierten Findings aus S1-S3 sind umgesetzt oder bewusst abgegrenzt.

## S5 - Tests, Code Review und Contract Review

Ziel:

- Alles pruefen, was lokal sinnvoll pruefbar ist.
- Externe oder manuelle Smokes sauber definieren, falls sie nicht lokal ausfuehrbar sind.
- Code und Roadmap gegen Guardrails reviewen.

Wichtig:

- S5 explizit trennen in:
  - lokal ausfuehrbar
  - GitHub/Backend-Smoke
  - Device-Smoke
  - nur definierbar

Typische Substeps:

- S5.1 Syntax-/Lint-/YAML-/Workflow-Checks, soweit verfuegbar.
- S5.2 betroffene JS-Dateien mit `node --check` pruefen.
- S5.3 Backend-/Edge-/SQL-Checks, falls betroffen.
- S5.4 manuelle GitHub-/Backend-Smokes definieren oder ausfuehren.
- S5.5 Device-/Browser-Smokes definieren oder ausfuehren.
- S5.6 Dedupe-/Race-/Regression-Smokes definieren oder ausfuehren.
- S5.7 User-Facing Copy Review nach realem Smoke.
- S5.8 Code Review gegen Bruchrisiken.
- S5.9 Contract Review gegen MIDAS-Guardrails.
- S5.10 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Gepruefter Umsetzungsstand.
- Klare Liste ausgefuehrter Checks.
- Klare Liste nicht lokal ausfuehrbarer Smokes.
- Bekannte Restrisiken.

Exit-Kriterium:

- Alle lokal moeglichen Checks sind erledigt oder bewusst als nicht verfuegbar markiert.

## S6 - Doku-Sync, QA-Update und finaler Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren.
- QA aktualisieren.
- Roadmap final abschliessen.
- Commit- und Archiventscheidung dokumentieren.

Typische Substeps:

- S6.1 betroffene Module Overviews aktualisieren.
- S6.2 `docs/QA_CHECKS.md` aktualisieren.
- S6.3 Roadmap mit Ergebnisprotokollen aktualisieren.
- S6.4 finaler Contract Review:
  - Roadmap vs. Code
  - Roadmap vs. Module Overviews
  - Roadmap vs. README-Guardrails
  - Roadmap vs. QA
- S6.5 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken
  - bekannte Restrisiken explizit dokumentiert
  - nicht betroffene Schichten bleiben unberuehrt
- S6.6 Commit-Empfehlung:
  - sinnvoller Commit-Scope
  - was gehoert zusammen
  - was liegt ggf. ausserhalb des aktuellen Git-Repos
- S6.7 Archiv-Entscheidung:
  - aktive Roadmap bleibt in `docs/`
  - abgeschlossene Roadmap wird nach `docs/archive/` verschoben und mit `(DONE)` markiert

Output:

- Doku, QA, Code und Roadmap sprechen denselben finalen Vertrag.

Exit-Kriterium:

- Roadmap ist commit- oder archivbereit.

---

## Ergebnisprotokoll-Format

Jeder Hauptschritt sollte ein Ergebnisprotokoll enthalten.

Beispiel:

```md
#### S4 Ergebnisprotokoll

##### S4.1 [Name]
- Umsetzung:
  - [...]
- Contract Review:
  - [...]
- Checks:
  - [...]
- Findings:
  - [...]
- Korrekturen:
  - [...]
- Restrisiko:
  - [...]
```

Regel:

- Kein Substep gilt als abgeschlossen, wenn nicht dokumentiert ist, was geprueft wurde.

## Check- und Review-Katalog

Moegliche Checks:

- `node --check [datei]`
- `git diff --check -- [dateien]`
- gezielter `rg`-/`Select-String`-Scan
- YAML-/Workflow-Strukturcheck
- SQL-/Edge-Function-Strukturcheck
- Browser-Smoke
- GitHub-Actions-Smoke
- Device-Smoke
- Contract Review gegen README
- Contract Review gegen Module Overview
- User-Facing Copy Review

Nicht verfuegbare Checks:

- Nicht still uebergehen.
- Dokumentieren:
  - warum nicht verfuegbar
  - was stattdessen geprueft wurde
  - welcher manuelle Smoke offen bleibt

## User-Facing Copy Review

Dieser Review ist Pflicht, wenn UI-Status, Warnungen, Fehlermeldungen, Buttons, Toggles oder Diagnosezeilen geaendert werden.

Prueffragen:

- Klingt ein normaler Zustand faelschlich wie ein Fehler?
- Klingt ein unsicherer Zustand faelschlich wie bestaetigt gesund?
- Ist klar, was der Nutzer tun kann oder nicht tun muss?
- Werden technische Details am richtigen Ort gezeigt?
- Ist die Meldung fuer MIDAS als Lebensapp ruhig genug?
- Ist die Meldung im Touchlog/Maintenance-Kontext technisch genug?
- Gibt es Unterschiede zwischen Profil-Kurzstatus und Diagnose-Detailstatus?

Beispiele fuer gute Trennung:

- Profil/Hub:
  - kurzer, ruhiger Status
  - keine technischen Wandtexte
- Touchlog/Maintenance:
  - technische Details
  - letzte Fehler
  - Health-Checks
  - aktive Diagnosemodi

## Abschlussregeln

- Roadmap erst nach S6 als abgeschlossen betrachten.
- Module Overviews sind Source of Truth und muessen final stimmen.
- QA muss die neuen Vertraege abbilden.
- Archiv erst nach abgeschlossener Roadmap.
- Commit erst, wenn Scope klar ist.
- Wenn Backend ausserhalb des Repos geaendert wurde, im Roadmap-Protokoll und finalen Commit-Hinweis explizit benennen.

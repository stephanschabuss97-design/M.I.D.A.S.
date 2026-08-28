# MIDAS Validated Context Reuse Future Notes

Stand: 2026-08-27
Status: `FUTURE_PROCESS_WORK`
Geplanter Wiedereinstieg: `nach C3 DONE, vor Erstellung von R14`

## Zweck dieser Datei

Diese Datei bewahrt die Lessons Learned aus:

- dem realen C3-Ausführungs-Chat,
- den Usage-Checkpoints der aktiven C3-Roadmap,
- dem anschließenden Process Improvement Pitch mit ChatGPT 5.6 Sol High,
- dem Architektur- und Contract Review im MIDAS-Denkraum.

Sie ist noch keine Roadmap und kein Implementierungsauftrag. Nach Abschluss von
C3 wird sie gemeinsam mit dem finalen C3-Postimage erneut geprüft. Erst danach
werden die tatsächlich gerechtfertigten kleinen Prozessänderungen umgesetzt,
bevor R14 geschrieben wird.

Der Chat ist keine Source of Truth. Deshalb stehen die entscheidenden
Erkenntnisse, Unsicherheiten und geplanten Prüfschritte vollständig in dieser
Datei.

## Problemstellung

MIDAS verwendet bewusst einen tiefen, contract-basierten Roadmap-Workflow.
Frische Ausführungs-Chats müssen genügend reale Quellen kennen, um Produkt-,
Modul-, Daten-, Security-, Medical-, Writer-, Consumer- und
Integrationsverträge korrekt zu behandeln.

Das Ziel lautet ausdrücklich nicht, weniger notwendigen Kontext zu lesen.

Das Ziel lautet:

> Bereits gegen einen konkreten Source-Stand validierte und weiterhin gültige
> Context-Arbeit soll nicht ohne Invalidation erneut vollständig aus großen
> Rohquellen rekonstruiert werden.

Die echten Sources of Truth bleiben immer autoritativ. Wiederverwendeter
Kontext ist ausschließlich ein fingerprintgebundener Cache bereits geleisteter
Validierungsarbeit.

## Abgrenzung zum Usage Guard

Usage Guard und Validated Context Reuse lösen unterschiedliche Probleme:

- **Usage Guard:** Reicht die gemessene Reserve, um den nächsten kohärenten
  Block sicher zu beginnen?
- **Validated Context Reuse:** Muss unveränderter, bereits validierter
  Source-Kontext erneut vollständig rekonstruiert werden?

Context Reuse darf niemals ein Usage-Gate umgehen. Der Usage Guard darf niemals
entscheiden, welche fachlichen Quellen ausgelassen werden.

Die geplante VS-Code-Extension ist in
`docs/Codex Usage Guard VS Code Extension Future Notes.md` beschrieben. Beide
Ideen dürfen technisch zusammenarbeiten, bleiben aber getrennte Verträge.

## Empirische C3-Basis

### Ursprüngliche autonome Welle U0-U7

<!-- markdownlint-disable MD013 -->

| Gate | Nach Block / vor Block | 5h-Rest | Wochenrest | Vertragliche Beobachtung |
| --- | --- | ---: | ---: | --- |
| U0 | vor G0 | 95 % | 25 % | Startbaseline |
| U1 | nach G0 / vor S1 | 90 % | 25 % | G0: 5/0 Prozentpunkte |
| U2 | nach S1 / vor S2 | 75 % | 22 % | S1: 15/3 Prozentpunkte |
| U3 | nach S2 / vor S3 | 71 % | 22 % | S2: 4/0 Prozentpunkte |
| U4 | nach S3 / vor S4R | 64 % | 21 % | S3: 7/1 Prozentpunkte |
| U5 | nach S4R / vor Block A | 62 % | 20 % | `CONTINUE_WITH_CAUTION`; genau Block A |
| U6 | nach Block A / vor Block B | 53 % | 19 % | 5h `RESET_CROSSED`; genau Block B unter Caution |
| U7 | nach Block B / vor S5/S6 | 34 % | 16 % | erneut 5h `RESET_CROSSED`; `SAFE_CLOSURE` vor Abschlussblock |

<!-- markdownlint-enable MD013 -->

Die Prozentwerte sind verbleibende Usage-Werte. Sie sind keine bekannten
Tokenzahlen und dürfen nicht in eine erfundene OpenAI-Abrechnungsformel
übersetzt werden.

Für U5 nach U6 und U6 nach U7 existiert wegen wechselnder 5h-Resetidentität
kein vertraglich gültiges 5h-Delta. Der Wochenbucket blieb als unabhängiges
Pflichtsignal verwertbar.

### Spätere C3-Fortsetzung

Die aktive C3-Roadmap enthält zusätzlich:

<!-- markdownlint-disable MD013 -->

| Gate | Grenze | 5h-Rest | Wochenrest | Vertragliche Beobachtung |
| --- | --- | ---: | ---: | --- |
| UR1 | Resume vor S5 | 99 % | 15 % | `SAFE_CLOSURE`; S5 ist kein kurzer Caution-Block |
| UF1 | vor ownergerichtetem UI-Korrekturblock | 81 % | 12 % | `CONTINUE_WITH_CAUTION`; genau ein kurzer lokaler Block |
| UF2 | nach UI-Korrekturblock | 43 % | 6 % | 38/6 Prozentpunkte innerhalb gleicher Resetidentitäten; `SAFE_CLOSURE` |

<!-- markdownlint-enable MD013 -->

UF1 nach UF2 ist ein wichtiges Zusatzsignal. Ein fachlich kurzer, lokaler und
reversibler Block kann trotzdem hohe Usage benötigen. Wenige Dateien oder
wenig produktiver Code sind keine ausreichende Kostenklassifikation. Auch
Context-Rehydration, Browserarbeit, Reviewtiefe, Dokumentation und
Toolinteraktionen gehören zur realen Blockgröße.

Der Messwert beweist nicht, welcher Anteil auf welche Aktivität entfiel. Er
beweist aber, dass eine rein LOC- oder Dateianzahl-basierte Prognose zu schwach
ist.

## Was C3 bereits bewiesen hat

### PROVEN

- Usage-aware Continuation funktioniert operativ.
- U7 verhinderte den Start des teuren S5-/S6-Abschlussblocks.
- Der abgeschlossene S4-Zustand blieb ohne Rollback an einer eindeutigen
  Resume-Grenze erhalten.
- S1 war im ursprünglichen C3-Lauf der teuerste Discovery-Hauptschritt.
- Die exakte Resetidentität schwankte einmal um eine Sekunde und anschließend
  zurück.
- Ein als kurz eingestufter lokaler UI-Block kann trotzdem materiellen Usage-
  Verbrauch verursachen.
- Der vorhandene Context Receipt enthält bereits Baselines, Fingerprints,
  Evidence-IDs und Invalidation-Bedingungen.

### STRONGLY INDICATED

- Große Suchausgaben und wiederholte Quellenausschnitte erzeugen vermeidbare
  Context-Last.
- Weiterhin gültige Vorgänger-Postimages könnten kompakter übernommen werden.
- Der bestehende Context Receipt ist die natürlichste Stelle für kleine
  Validated-Reuse-Erweiterungen.
- S4R sollte Blockkosten nicht nur aus Codeumfang, sondern auch aus
  Context-, Tool-, Browser-, Review- und Dokumentationsarbeit ableiten.

### HYPOTHESIS

- S1 ist auch in anderen Roadmaps regelmäßig der größte Usage-Hotspot.
- Die Ein-Sekunden-Abweichung der Resetidentität ist harmloses Rundungs- oder
  Sensorrauschen.
- Ein Context Cache würde einen großen Teil des gemessenen S1-Verbrauchs
  einsparen.
- Eine bestimmte Anzahl gelesener Markdownzeilen lässt sich direkt in
  Usage-Prozentpunkte übersetzen.

Diese Hypothesen dürfen vor weiteren Messungen nicht als Vertrag behandelt
werden.

## Unvermeidbare S1-Arbeit

Folgende Informationen müssen weiterhin gegen reale aktuelle Quellen geprüft
werden:

- aktive Roadmap, Startkarte, Resume Card, Findings und aktueller Schritt,
- aktueller Git-Stand und relevante Dirty Boundary,
- aktueller relevanter Diff,
- tatsächlich betroffene Code-, Producer- und Consumerflächen,
- neue oder geänderte Product-, Security-, Medical- und Datenverträge,
- eingetretene Invalidation-Bedingungen,
- produktive SQL-, Deploy-, Secret-, Workflow- und Device-Gates,
- Widersprüche zwischen Implementierung und Dokumentation.

## Wahrscheinlich redundante Context Acquisition

- vollständiges Wiederlesen großer unveränderter DONE-Roadmaps,
- Rekonstruktion eines bekannten Postimages aus vielen historischen Schritten,
- wiederholtes Öffnen identischer Module-Overview-Abschnitte,
- pauschale große `rg`- oder Dateiausgaben ohne konkrete Fragestellung,
- mehrfaches Lesen derselben gültigen Codeausschnitte,
- erneute Ausformulierung weiterhin gültiger Evidence statt Referenz über ID,
- vollständige Wiederholung unveränderter Testmatrizen ohne Invalidation.

Diese Klassifikation ist ein Arbeitsauftrag für den späteren Review. Sie ist
keine pauschale Erlaubnis, Quellen wegzulassen.

## Vorläufiges Maßnahmenpaket

### P0 - Search-/Read-Disziplin konkretisieren

Entscheidung: `GO_AFTER_C3_REVIEW`

Kleinster sinnvoller Schnitt:

- zuerst nach Symbol, Überschrift, Producer oder Consumer suchen,
- danach nur relevante Trefferbereiche öffnen,
- große Dateien nur bei echtem Exact-Source-Bedarf vollständig lesen,
- identische bereits validierte Ausschnitte nicht ohne Invalidation erneut
  laden,
- große Toolausgaben begrenzen und ihre Frage vor dem Aufruf festlegen.

Voraussichtlich betroffene Verträge:

- `AGENTS.md`
- `docs/templates/README.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- gegebenenfalls `docs/DEV_ENVIRONMENT.md`, falls ein lokales Hilfswerkzeug
  entsteht

Risiko: Zu aggressive Begrenzung könnte relevanten Kontext verbergen. Deshalb
gilt bei Unsicherheit weiterhin Original lesen.

### P1 - Context Receipt um Validated Reuse ergänzen

Entscheidung: `GO_AFTER_C3_REVIEW`

Kein neues Context-Pack. Der bestehende Context Receipt könnte pro großer,
stabiler und tatsächlich wiederverwendeter Source ergänzen:

```text
Source:
Fingerprint:
Validiert durch:
Wiederverwendbare Aussagen:
Invalidation Trigger:
Original zwingend erforderlich bei:
```

Der Eintrag ist ein abgeleiteter Cache, keine Source of Truth. Er wird nur
verwendet, wenn:

1. Source vorhanden ist,
2. Fingerprint exakt stimmt,
3. die aktuelle Frage vollständig von den Aussagen abgedeckt ist,
4. kein Finding und keine Invalidation vorliegt,
5. keine Exact-Source-Pflicht greift.

Voraussichtlich betroffene Verträge:

- `docs/templates/MIDAS Roadmap Template.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/templates/README.md`
- Ausführungs-Startprompt nur als kurzer Verweis auf die zentrale Regel

### P1 - Follow-up Postimage Receipt

Entscheidung: `GO_AFTER_C3_REVIEW`

Bei einer großen Roadmap mit geplanter Folgeroadmap ergänzt S6 innerhalb der
bereits vorhandenen Roadmap oder Evidence einen kurzen Abschnitt:

- finaler Writer,
- aktive Consumer,
- produktive Runtimepfade,
- relevante API-/RPC-Grenzen,
- Source-Fingerprints,
- gültige Evidence-IDs,
- bekannte Follow-up-Invalidation-Trigger,
- Exact-Source-Fragen, für die das Receipt nicht genügt.

Es entsteht keine zusätzliche Datei. Das Receipt ist Teil bestehender Evidence
und darf das zugrunde liegende Postimage nicht ersetzen.

Voraussichtlich betroffene Verträge:

- `docs/templates/MIDAS Roadmap Template.md`
- `docs/templates/MIDAS Roadmap Evidence Template.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/templates/README.md`

### P2 - Reuse-Metriken sammeln

Entscheidung: `DEFER_UNTIL_MORE_DATA`

Nach zwei oder drei weiteren Roadmaps könnte pro Ausführungswelle kompakt
erfasst werden:

- Zahl vollständig gelesener Sources,
- Zahl wiederverwendeter validierter Sources,
- Zahl invalidierter Sources,
- Zahl notwendiger Original-Fallbacks,
- Context-bedingte Findings,
- Fehler durch fehlenden Kontext mit Zielwert `0`.

Keine detaillierte Lesebuchhaltung und keine internen Tokenzahlen erfinden.

### P2 - Resetidentitäts-Jitter untersuchen

Entscheidung: `DEFER_UNTIL_PROVEN`

Vor jeder Normalisierung muss über mehrere reale Messungen geklärt werden:

- tritt die Abweichung wiederholt auf,
- beträgt sie ausschließlich eine Sekunde,
- bleibt das fachliche Usage-Fenster identisch,
- stammt die Abweichung bereits aus der App-Server-Antwort,
- könnte eine Toleranz einen echten Resetwechsel verschleiern.

Bis dahin bleibt der exakte Fail-closed-Vertrag bestehen. Falls später eine
Normalisierung gerechtfertigt ist, gehört sie ausschließlich in den
kanonischen Validator. Der Ausführungsagent erhält keine Heuristik.

### NO-GO - Eigenständiges Execution Context Pack

Entscheidung: `NO_GO_FOR_NOW`

Ein separates generiertes Pack würde nach nur einem Messlauf:

- eine neue Dateiart und Pflegepflicht erzeugen,
- Invalidation neben dem Context Receipt duplizieren,
- eine konkurrierende Vertragsdarstellung begünstigen,
- Fresh-Chat-Fehler bei veraltetem Pack wahrscheinlicher machen.

Diese Option wird nur erneut geprüft, wenn mehrere Roadmaps belegen, dass die
kleineren Erweiterungen nicht ausreichen.

## Deterministische Reuse-Entscheidung

Ein Fresh Chat soll später nicht selbst schätzen, ob Wiederverwendung erlaubt
ist:

1. Aktive Roadmap, Resume Card, Findings und relevanten Git-Diff live lesen.
2. Für eine markierte stabile Source den aktuellen Fingerprint bestimmen.
3. Fingerprint exakt mit dem validierten Receipt vergleichen.
4. Prüfen, ob die aktuelle Vertragsfrage vollständig vom Receipt abgedeckt ist.
5. Nur dann `REUSE_VALIDATED_CONTEXT`.
6. Bei Mismatch, Lücke, Finding, Invalidation oder Exact-Source-Pflicht
   `READ_ORIGINAL`.
7. Nach Original-Read Receipt und Invalidation gezielt aktualisieren.

Fail-closed hat immer Vorrang.

## Quellenklassen

### Tier A - Always Live

- `AGENTS.md`
- aktive Roadmap und Startkarte
- Session Resume Card
- aktuelle Findings und Decision Logs
- aktueller Usage-Checkpoint
- aktueller Git-Diff und Dirty Boundary
- aktuell bearbeitete Codeflächen
- neu geänderte oder invalidierte Sources
- produktive Owner-Gates

### Tier B - Validated Reuse möglich

- unveränderte relevante Module-Overview-Abschnitte,
- stabile Masterplansektionen,
- relevante Postimages abgeschlossener Roadmaps,
- unveränderte Architekturverträge,
- bestimmte historische Evidence-Aussagen.

Voraussetzung sind Fingerprintbindung, abgedeckte Frage und fehlende
Invalidation.

### Tier C - Original On Demand

Originalquelle erneut lesen bei:

- Sourceänderung oder Fingerprint-Mismatch,
- neuem Finding oder unerwartetem Verhalten,
- fehlender Aussage im Receipt,
- neuer Producer-/Consumerfläche,
- Security-, Auth-, Medical-, Daten- oder Produktfrage mit Exact-Source-Bedarf,
- produktiver Migration, SQL-, Secret-, Deploy- oder Rollbackentscheidung.

## Resume nach Usage Safe Closure

Validated Context Reuse soll besonders beim Wiedereinstieg helfen:

1. Resume Card und letzten Usage-Checkpoint live lesen.
2. Aktuellen Git- und Dirty-Stand gegen die Resume-Grenze prüfen.
3. Fingerprints der für den nächsten Block benötigten validierten Sources
   prüfen.
4. Unveränderte gültige Context- und Evidence-IDs übernehmen.
5. Nur invalidierte oder für den nächsten Block neue Quellen erneut lesen.
6. Vor Beginn des nächsten Blocks frisches Usage-Gate ausführen.

Bereits abgeschlossene Hauptschritte und Blöcke werden nicht ohne Invalidation
rekonstruiert oder erneut getestet.

## Ergänzende Lesson aus UF1/UF2

S4R darf `kurz` künftig nicht allein über Dateianzahl, LOC oder fehlende
Backendwirkung definieren. Zur Aufwandsprognose gehören mindestens:

- notwendige Context-Rehydration,
- Anzahl und Art der Toolinteraktionen,
- Browser- oder Deviceprüfung,
- Reviewtiefe,
- Dokumentations- und Evidence-Sync,
- erwartbare Fehlersuche,
- Resumierbarkeit und Postconditions.

Empirische Vergleichswerte bleiben stärker als qualitative Schätzungen. Ein
vergleichbarer realer Höchstverbrauch wird weiterhin gemäß Workflow-Vertrag
mit Reserve behandelt.

## Messstrategie

Vor einer größeren Prozessarchitektur werden mindestens zwei oder drei weitere
Roadmaps beobachtet.

Sinnvolle Signale:

- 5h- und Wochenrest vor und nach S1,
- valide Deltas nur innerhalb gleicher Resetidentität,
- vollständige Reads gegenüber Reuse,
- Invalidierungen und Original-Fallbacks,
- Finding-Rate,
- Context-bedingte Fehler,
- tatsächliche Safe-Closure-Grenzen.

Nicht zulässig:

- Tokenzahlen aus Prozentwerten errechnen,
- Prompt-Caching voraussetzen,
- Mittelwerte aus nicht vergleichbaren Blöcken bilden,
- Resetgrenzen überbrücken,
- Einsparungen behaupten, bevor sie gemessen wurden.

## Geplanter Arbeitsauftrag nach C3

Nach C3 DONE und vor R14:

1. Finale C3-Roadmap und alle Usage-Checkpoints einschließlich U8 lesen.
2. Diese Future Notes gegen das reale C3-Postimage aktualisieren.
3. Prüfen, welche Findings weiterhin `PROVEN`, `STRONGLY INDICATED` oder nur
   `HYPOTHESIS` sind.
4. Kleinsten gezielten Änderungsschnitt für Search-/Read-Disziplin bestimmen.
5. Context-Receipt-Erweiterung und Follow-up Postimage Receipt gegen bestehende
   Templates prüfen.
6. Nur notwendige Prozessdateien gezielt ändern; kein Vollumbau.
7. Contract Review gegen MIDAS-Produkt-, Fresh-Chat-, Resume-, Evidence- und
   Usage-Vertrag durchführen.
8. Findings korrigieren.
9. Erst danach R14 aus dem finalen C3-Postimage schreiben.

Mögliche betroffene Dateien:

- `AGENTS.md`
- `docs/DEV_ENVIRONMENT.md`, nur wenn Tooling oder technische Bedienung
  betroffen ist
- `docs/templates/README.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/templates/MIDAS Roadmap Template.md`
- `docs/templates/MIDAS Roadmap Evidence Template.md`

## Contract-Review-Fragen für den Wiedereinstieg

- Bleiben echte Sources of Truth eindeutig autoritativ?
- Kann ein Digest niemals ohne passenden Fingerprint verwendet werden?
- Sind Invalidation und Exact-Source-Fallback vollständig definiert?
- Entsteht keine parallele Evidence- oder Roadmapstruktur?
- Bleibt der Owner ohne zusätzliche laufende Pflegearbeit?
- Funktioniert der Vertrag in einem Fresh Chat ohne Denkraumwissen?
- Hilft er auch bei Resume nach Safe Closure?
- Werden Security-, Medical- und Datenfragen weiterhin ausreichend streng
  behandelt?
- Wird Usage weiter gemessen, statt eine Einsparung zu unterstellen?
- Bleiben Usage Guard und Context Reuse getrennte Verantwortungen?

## Aktuelle Empfehlung

Bis C3 abgeschlossen ist:

- nichts implementieren,
- exakten Usage- und Fingerprintvertrag unverändert lassen,
- keine Resetjitter-Toleranz ergänzen,
- kein Execution Context Pack erzeugen.

Nach C3:

1. Search-/Read-Disziplin gezielt schärfen.
2. Bestehenden Context Receipt minimal für Validated Reuse erweitern.
3. Follow-up Postimage Receipt innerhalb vorhandener Roadmap/Evidence
   etablieren.
4. Contract Review durchführen.
5. R14 erst danach schreiben.

Leitgedanke:

> Cache validated immutable context. Invalidate on source change. Fall back to
> the authoritative source whenever certainty is lost. Measure before
> optimizing.

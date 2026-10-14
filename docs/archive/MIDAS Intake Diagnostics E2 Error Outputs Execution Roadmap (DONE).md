# MIDAS Intake Diagnostics E2 Error Outputs — Execution Roadmap

## Identität und Startkarte

- ID `MID-F35-EX-02`; Typ `EXECUTION`; Owner Stephan; Lieferung W2.
- Parent: [Gesamtplan](MIDAS%20Intake%20Diagnostics%20Rolling%20Wave%20Roadmap%20%28DONE%29.md).
- Vorgänger: [E1](MIDAS%20Intake%20Diagnostics%20E1%20Value%20Logs%20Execution%20Roadmap%20%28DONE%29.md),
  S6 DONE und gültiger POST-E1 erforderlich; technische Vorarbeit aus E1 nutzen.
- Autorenbasis BLUEPRINT / 2026-10-13 / Harmonized, ausdrücklich vom
  Planungsauftrag am 14.10.2026 übernommen; alle drei Pläne jetzt gewünscht.
- Status DONE; Ausführung S6 DONE; Auftrag abgeschlossen am 14.10.2026.
- Ergebnis: begrenzte, verständliche Fehlerausgaben entlang der tatsächlichen
  Intake-/Medikations-/Resetpfade; fachliche Fehlerverträge bleiben erhalten.
- R2 für Ausgabeänderungen, Arbeitsgröße medium erwartet. Resetguards,
  Retries, Auth und medizinische Logik sind geschützt, keine Scheduleränderung.
- Lesepfad: AGENTS → Parent-Receipt/Registry/Resume → POST-E1 und dieser
  Plan → aktueller Diff → nur konkrete Drifffragen. Kein erneutes Vollinventar.
- G-PLAN und G-EXEC-E2 erteilt. Autonom in der
  Reihenfolge S1 → S2 → S3 → S4R → S4 → S5 → S6 fortfahren.
- Extra high laut Owner; tatsächliche UI-Einstellung NOT_OBSERVABLE.

## Scope und eindeutiges Assignment

Dieser Auftrag besitzt ausschließlich die elf Kandidaten
`F35-C02`, `F35-C06`, `F35-C07`, `F35-C09`, `F35-C18`, `F35-C25`,
`F35-C26`, `F35-C29`, `F35-C31`, `F35-C38`, `F35-C42` sowie die vier
Zusatzziele `F35-X01` bis `F35-X04`. Individuelle Ist-/Zielzuordnung und
Ergebnisverweise bleiben in der
[zentralen Matrix](MIDAS%20Intake%20Diagnostics%20Rolling%20Wave%20Roadmap%20%28DONE%29.md#verbindliche-kandidatenmatrix).
C26/C29 sind die zwei hier bewusst mitgenommenen optionalen Modulgegenstücke.
C07/C09 werden vollständig einschließlich unnötiger IDs hier bereinigt,
kein zweiter Auftrag in E3.

<!-- markdownlint-disable MD013 -->
| Lieferdatei | Exaktes geplantes Delta / Consumer |
| --- | --- |
| `app/modules/intake-stack/intake/index.js` | Elf Diagnoseargumente und zugehörige technische UI-Fehlerausgaben an den ausgewählten Callern begrenzen; bei Bedarf kleine lokale feste Fehlerklassenzuordnung. Keine Änderung der 13 erhaltenen Kandidaten oder E1-Erfolgspayloads. |
| `app/supabase/api/select.js` | X01: nur vorgelagerten Diagnoseinhalt begrenzen. Fehlerobjekt und ursprüngliches Throw-/Return-/Query-/Transportverhalten erhalten. |
| `app/modules/intake-stack/medication/index.js` | X02: nur Diagnoseinhalt der RPC-Fehlerausgabe begrenzen. `.message`, `.code`, `.status`, Payloads und RPC-Verhalten erhalten. |
| `assets/js/main.js` | X03/X04: nur beide Fehlerlogargumente der aktiven Resetimplementierung. Guard, drei Retryversuche, Delay, UI-Konstante, Re-Throw und Timer unverändert. |
| Drei in E1 angelegte `diagnostics.*`-Testdateien im Intakeverzeichnis | E2-READ/E2-MED/E2-RESET/E2-SAVE/E2-SINK/E2-CONSUMERS und gezielte Browserfälle ergänzen; E1-Testbasis wiederverwenden. |
| Dieser Plan, Parent, Findings, betroffene Intake-/Medication-/Diagnostics-Overviews, `docs/qa/intake-medication.md`, `CHANGELOG.md` | S6-Ergebnis-/Vertragssync nur für E2; vorhandene Gesamt-Changelogmeldung ergänzen. |
<!-- markdownlint-enable MD013 -->

Keine Mutation von `app/supabase/api/intake.js`,
`app/supabase/api/intake-privacy.contract.test.js`, `app/core/diag.js`,
`app/diagnostics/logger.js`, `assets/js/ui.js`, `index.html`, Service Worker,
SQL/Backend/Auth oder Geräten. Die Senken lesen und im Test beobachten;
Ausgaben an den konkreten Callern begrenzen. Kein neuer globaler Sanitizer,
kein automatisches Filtern aller Module und keine neue Runtime-Datei.

Der gemeinsame Selectlog bedient auch andere Consumer. Daher seinen lokalen
Diff und direkten Query-/Fehlervertrag ausdrücklich mitprüfen; unveränderte
Fehlerobjekte können bei anderen Callern weiterhin rohe Inhalte tragen.
Dieser Auftrag behauptet keinen allgemeinen MIDAS-Privacy-PASS.

## Zielvertrag, Acceptance und Evidence

- A1: Backend-`message/details`, frei gelieferte Exceptiontexte und Objektdumps
  erscheinen in den ausgewählten Zielausgaben nicht mehr. Feste Operation,
  feste Fehlerklasse und validierter numerischer Status dürfen bleiben.
  Ungeprüftes `err.code` ist kein sicherer Ersatz; nur eigene feste oder
  explizit begrenzte Codes übernehmen, keinen Backendfreitext umetikettieren.
- A2: Gleicher Fehler bleibt erkennbar und führt zu demselben fachlichen
  Fehlschlag. Sichtbares technisches Feedback bleibt verständliches Deutsch;
  kein Silent Failure, kein falscher Erfolgsstatus.
- A3: Rohes Fehlerobjekt, `.details`, `.message`, Return/Re-Throw, Requests,
  Retryzahl/Delay, Busy-/Auth-/Tag-/Resetguards, Cache-/Medikationsresultate
  und Payloads bleiben erhalten. Nur Ausgabedarstellung ändern.
- A4: Beide Resetimplementierungen abgedeckt: echte Boot-/Timerimplementierung
  in main.js und separat exportierte Modul-API. API-Probe ist kein Beweis
  eines normalen Produktaufrufs. Keine Zusammenlegung der Implementierungen.
- A5: UI-Fehler-DOM und fehlender Fehler-DOM/Konsolenfallback gleichermaßen
  geprüft. Fehlerrückgabe und negative Diagnoseprobe sind getrennte Orakel.
- A6: elf Kandidaten und vier Zusatzziele geprüft, gültiges E1-Verhalten
  erhalten, S5-Pflichtreview/S6-Sync erfüllt und POST-E2 für E3 vorhanden.

Evidence in diesem Plan: B-E2 tatsächliche Vorgängerbaseline; Testmatrix als
Ergebnis-SoT; CR-E2 externer Review; POST-E2 einmaliger Übergabebeleg.
Keine separate Evidence-Datei für unveränderte Guards oder reinen Logpatch;
kein neuer produktiver Concurrency-/Scheduler-/Migrationsbeweis in diesem Scope.

## Baseline, Capabilities und Autorität

Initiale Quellidentitäten und Toolreceipt stehen im
[Parent](MIDAS%20Intake%20Diagnostics%20Rolling%20Wave%20Roadmap%20%28DONE%29.md#baseline-context-receipt-und-capability-preflight).
Für den Start ist jedoch POST-E1 maßgeblich: E1 ändert Intake/Testbasis/Doku
planmäßig. Nicht den ursprünglichen Intakehash als weiterhin gültig ausgeben
oder erwartete E1-Änderungen als fremde Drift behandeln. Neue relevante
Änderungen gegen POST-E1 gezielt prüfen; fremde kollidierende Arbeit schützen.

Node-/Markdownlint-/Browserbelege aus POST-E1 wiederverwenden; Browsermodul
und Payload nur bei konkreter Drift neu prüfen. CodeRabbit-CLI und damalige
Auth sind durch B-E1/POST-E1 belegt. Keine vorsorglichen Installations-,
Versions-, PATH- oder Authchecks. Die zwei E1-CLI-Startfehler sind kein Beleg
für fehlende Installation/Auth; E1 wurde über den dokumentierten manuellen
VS-Code-CodeRabbit-Review abgeschlossen. Für E2 gilt ausschließlich
[D-CR-E23](MIDAS%20Intake%20Diagnostics%20Rolling%20Wave%20Roadmap%20%28DONE%29.md#coderabbit-regel-f%C3%BCr-e2-und-e3).
Ein Reviewstartfehler ist ein Toolfehler; sichere lokale Arbeit darf
weitergehen, während der externe Pflichtnachweis korrekt offen bleibt.

G-EXEC-E2 ist ERTEILT am 14.10.2026 durch Stephan, aktuelle Chatnachricht
„Bro, führe MID-F35-EX-02 / E2 vollständig bis zum tatsächlich geprüften
S6-Abschluss aus.“ / AUFTRAG UND FREIGABE; fortgeltend im selben Auftrag.
G-GIT und G-EXTERNAL bleiben offen. Review ausschließlich in S5 nach D-CR-E23.
Kein CodeRabbit vor S5, keine produktive Session, keine Secrets für synthetische
Tests erforderlich. Reine Code-Rückwege schützen fremde/eigene E1-Arbeit.

## Risiken und korrigierte Planfindings

<!-- markdownlint-disable MD013 -->
| ID | Risiko / bewusste Korrektur | Nachweis / Gegenmaßnahme |
| --- | --- | --- |
| R2-01 | Nur Intakecatch zu ändern lässt sbSelect-/Medikations-RPC-Log offen | READ und MED prüfen Produzent bis Senke in derselben Fehlerkette; X01/X02 gehören E2. |
| R2-02 | Nur Modulreset zu ändern verfehlt normalen Boot-/Timerpfad | X03/X04 und C26/C29 getrennt testen; beide Implementierungen, keine doppelte Kandidatenzählung. |
| R2-03 | Entfernen von `.details` oder Ersetzen von Errors würde Consumervertrag brechen | Diagnoseausgabe begrenzen, Originalfehler weitergeben; bestehende F34-Assertions erhalten. |
| R2-04 | UI-Feedback könnte weiterhin raw details an console.error schicken | E2-SINK mit und ohne Fehler-DOM; konkrete Caller statt globale UI-Funktion ändern. |
| R2-05 | „Fehlercode“ könnte selbst unkontrollierter Backendtext sein | Eigene feste Codes/Validierung, synthetische Kanarie auch in message/details/code/status prüfen. |
| R2-06 | Scheduler-/Medikationsrefactor schleicht sich in Wartung ein | Nur Log-/technische Fehlerausgabe, expliziter Semantikdiff und Guardregression; sonst Scopegrenze. |
<!-- markdownlint-enable MD013 -->

## Phasenstatus

<!-- markdownlint-disable MD013 -->
| Phase | Status | Exit / folgende Aktion |
| --- | --- | --- |
| S1 | PASS | POST-E1 und elf Fehlerstellen/vier Zusatzstellen samt Senken bestätigt → S2. |
| S2 | PASS | Feste Ausgabe-/UI-Klassen und unveränderte Fehlerverträge definiert → S3. |
| S3 | PASS | Read-/Med-/Reset-/Saveketten und Rückwege mit passenden Orakeln abgedeckt → S4R. |
| S4R | PASS | Tatsächliche Quellen, Blöcke, Preimages, G-EXEC und Pflichttoolreadiness eingefroren → S4.1. |
| S4 | PASS | Alle fünf Blöcke mit vollständiger eigener Fehlerkette geprüft → S5. |
| S5 | PASS | Matrix einschließlich Consumer/F34, nativer Full Review und CodeRabbit erfüllt → S6. |
| S6 | DONE | Synchrone Doku, POST-E2 und finale Archiv-/Hygieneprüfung erfüllt; E2 DONE, E3 NOT_STARTED. |
<!-- markdownlint-enable MD013 -->

### S1 — Gezielte Fehlerkettenanalyse

- POST-E1/Gitdiff lesen; nur relevante Caller oder Produzenten bei Drift
  nachverfolgen. Keine neuen Kandidaten aus dem ganzen Repository sammeln.
- B-E2 enthält Read- und Savefehlerherkunft, Med-RPC-Catcher, beide Resets,
  UI-/Konsolenfallback und unberührte Fehlerrückgaben. Nachweisgrenzen nennen.
- Direkte Consumer des geänderten sbSelect-/Med-RPC-Logtexts und vorhandene
  Schutztests gezielt bestimmen. Historische Toolartefakte nicht pauschal
  reaktivieren; `.details`-F34-Test ist aktueller Schutz.
- Nativer Full Contract Review, Findings/Resume. Exit: alle vier Ketten und
  Preflightfragen ausreichend gedeckt → S2.

### S2 — Ausgabe- und Fehlervertrag

- Je technischer Operation festen Log-/UI-Fehlertext oder begrenzten Code
  wählen; Versuchszahl und technisch validierter Status bleiben nützlich.
- Raw Error weiterhin an den erwarteten fachlichen Consumer geben. Kein
  Entfernen von `.details`, kein success trotz Fehler, kein zusätzlicher Retry.
- Senkenorakel pro Kandidat und X-Ziel definieren: nicht nur Zeichenketten im
  Quelltext, sondern reale synthetische Fehlerereignisse plus Transportresultat.
- Nativer Full Contract Review, Findings/Resume. Exit: A1–A6 prüfbar → S3.

### S3 — Risiko-/Consumerreview und Blockschnitt

- E2-READ, E2-MED, E2-RESET und E2-SAVE je als vollständige Fehlerkette
  schneiden. Fehlendes Fehler-DOM und Rohtext im `.details`-Vorrang einschließen.
- Erfolgspfade gegenprüfen, bei Batch/Slot/Ack keine Bestands-/Writeänderung;
  bei Reset unveränderte Retryanzahl, Tagesguard und Kein-Write-bei-Bestand.
- Rückweg je Block als eigener Patch gegen POST-E1 planen. Die gemeinsame
  Testbasis und E1-Fixes niemals pauschal gegen HEAD zurücksetzen.
- Nativer Full Contract Review. Exit: Risiken R2-01 bis R2-06 gedeckt,
  alle Schutzbindungen/Scopegrenzen ausreichend bekannt → S4R.

### S4R — Finaler Freeze

- S1–S3 und aktuelle Sourcepositionen bestätigen. Vier Runtime-Dateien und
  selektive Caller-/Logargumente einfrieren; globale Senken sind nur Testinputs.
- G-EXEC-E2, Pflichtcapabilities, eigene Preimages und konkrete Testinputs
  belegen. Schutzassertionen/Hashes nur mit fachlichem Erhaltungsnachweis
  behandeln, niemals für ein grünes Ergebnis abschwächen/neu hashen.
- Arbeitsgröße medium erwartet; bei echter großer Erweiterung vor S4 kurz
  briefen und unabhängige Owner-/Scopefrage an der betroffenen Grenze stoppen.
- Nativer Full Contract Review, Datum/Freeze/Resume. Exit → S4.1.

### S4 — Zusammenhängende Fehlerketten korrigieren

<!-- markdownlint-disable MD013 -->
| Block / Status | Input / Änderung / genaue Owner | Output / direkte Consumer | Check / Review | Rückweg / sichere Postcondition |
| --- | --- | --- | --- | --- |
| S4.1 / PASS | E1-Testbasis um E2-READ/MED/RESET/SAVE/SINK/CONSUMERS ergänzen; Rohfehlerkanarien mit kontrollierten Antworten statt echten Requests | Vorbefund pro tatsächlicher Kette und erwartete Zielassertionen; keine Runtimekorrektur | Erklärte RED-Fälle aufzeichnen, keine anderen Testfehler; Consumerreview des Fixtures | Eigene Testergänzung; E1 unverändert grün, E2-Vorbefunde offen markiert. |
| S4.2 / PASS | C02/C31 + X01 in Intake/select; konkrete UI-Ausgabe des Capture-Ladefehlers ebenfalls begrenzen | Readfehler vom sbSelect-Log bis Captureende/Fehler-DOM oder Konsole bereinigt; Error unverändert | E2-READ, zugehöriges E2-SINK und Selectconsumer-/Erfolgspfad; Delta-/Consumerreview | Eigenen Readpatch zurücknehmen; diese ganze Kette ist grün, andere E2-Fälle weiterhin offen. |
| S4.3 / PASS | C06/C07/C09/C18/C25 + X02; jeweilige Intake-UI-Ausgabe begrenzen, C07/C09-IDs im selben Patch entfernen | Medikationsfehler durchgängig begrenzt; Slot-/Batch-/Ack-/Refreshverhalten erhalten | E2-MED und SINK, RPC-Consumervertrag, erlaubte Funktionsresultate; Delta-/Consumerreview | Eigener Medpatch gegen Vorgängerstand; kein Teilfix nur am letzten Catch. |
| S4.4 / PASS | C26/C29 im Modul + X03/X04 in main.js; nur jeweilige Fehlerlogargumente | Aktiver und exportierter Resetfehler begrenzt, ursprüngliche Guards/Retry/Throw unverändert | E2-RESET, beide Quellen getrennt; Delta-/Consumerreview, keine Timer-/Authänderung | Eigener Resetlogpatch; kein neuer Schedulervertrag und keine Reset-Deduplizierung. |
| S4.5 / PASS | C38/C42 und jeweilige Savefeedback-Ausgabe; `.details` unverändert am Error belassen | Wasser-/Kombifehlerlog und sichtbare Fehlermeldung begrenzt, Savefehler weiter fachlich Fehler | E2-SAVE/SINK plus F34-Erhaltungsbeleg und betroffene E1-Regressionsfälle; Delta-/Consumerreview | Eigener Saveerrorpatch; alle elf Kandidaten und vier Zusatzziele lokal geprüft. |
<!-- markdownlint-enable MD013 -->

Kein Runtime-/Fehler-Scopewechsel allein aus einem Testfinding. Erklärte
RED-Restfälle zwischen Blöcken sind kein PASS; neue unerklärte Fehler vor
Continuation prüfen. Bei Bucketende nächsten geprüften Kettenabschluss als
Resumegrenze verwenden. Nach allen Blöcken S5; noch kein S6/DONE.

### S5 — Tests und Abschlussreview

Ausgeführte Pflichtcommands; Ergebnisse N-E2. CR-E2 noch offen.
E1 legt die drei Testdateien zuvor an:

```powershell
node --check app/modules/intake-stack/intake/index.js
node --check app/modules/intake-stack/medication/index.js
node --check app/supabase/api/select.js
node --check assets/js/main.js
node --test app/modules/intake-stack/intake/diagnostics.contract.test.js
node --test app/supabase/api/intake-privacy.contract.test.js
node app/modules/intake-stack/intake/diagnostics.browser.smoke.cjs --suite e2
```

<!-- markdownlint-disable MD013 -->
| Nachweis | Konkretes Orakel / Kandidaten | Ergebnis | Invalidation |
| --- | --- | --- | --- |
| E2-READ | Kontrollierter Selectfehler mit Backendmessage/details → reale X01-Logstelle → C31 und C02 → UI. Rohkanarie fehlt, feste Marker vorhanden; Query und ursprünglicher Throw-/Returnvertrag sowie Erfolg erhalten | PASS: N-E2 | Select-/Capture-/Refreshende-/UI-Callerquelle. |
| E2-MED | Reales callMedicationRpc mit synthetischer Fehlerantwort; Slot, Batch, Ack, Follow-up-Load und Refresh je auslösen: C06/C07/C09/C18/C25 und X02 einzeln prüfen. Errorproperties und funktionale Aufrufzahl erhalten; IDs an C07/C09 entfernt | PASS: N-E2 | RPC-/Handler-/Providerverträge. |
| E2-RESET | Original main-Reset über tatsächliche lokale Tageswechselroute plus exportierte Modul-API separat mit Fakeuhr/-Providern. C26/C29/X03/X04 beobachtet; drei Lookupversuche, Delays/Guard/Throw gleich; vorhandene Totals verhindern unverändert Write | PASS: N-E2 | main-/Modulreset oder Testprovider; API-Aufrufgrenze bleibt sichtbar. |
| E2-SAVE | Wasser-/Kombihandler mit Error.message, vorrangigem .details, code/status und synthetischer Kanarie; C38/C42 sowie sichtbare Fehlerausgaben begrenzt, Error/Payload/Writeanzahl unverändert | PASS: N-E2 | Savecatch oder Formatierung/Fehlerproducer. |
| E2-SINK | Alle ausgewählten Read-/Med-/Savefehler jeweils mit vorhandenem und fehlendem Fehler-DOM; diag, Loggerhistory, console.debug/error beobachten. Feste Fehlermeldung vorhanden, keine Kanarie oder Objektdumps | PASS: N-E2 | Caller-Ausgabe, DOM oder Senkenprovider. |
| E2-CONSUMERS | Bestehender F34-Privacytest unverändert, `.details`/Payloads/Requests/Methoden/Auth unverändert; Erfolgs-/Fehlervertrag direkter Select-/Med-RPC-Consumer; E1-Fälle wegen gemeinsam verändertem Intake erneut prüfen | PASS: N-E2 | Jede relevante Code-/Fixtureänderung. |
| E2-BROWSER | Originales DOM/Module und echte Read-/Save-/Medikamentenlistener im isolierten Browser; kontrollierte Fehlerantworten, Fehlerfeedback/Busyzustand und senkenübergreifende Redaktion prüfen | PASS: N-E2 | Geänderte aktive Caller-/Senkenbytes; kein normaler UI-Beweis für die exportierte Reset-API. |
| E2-SCOPE | Nur vier Runtime-Dateien, gezielte Ausgabeänderungen; keine globalen UI-/Logger-/API-/Scheduler-/Medizinänderungen, 13 erhaltene IDs unverändert | PASS: N-E2 | Jeder neue Patch. |
| CR-E2 | Relevante Matrix → nativer Full Review → CodeRabbit nach D-CR-E23: begrenzter technischer Retry, sonst manueller VS-Code-CodeRabbit-Weg; Kontingentcheckpoint beachten | PASS: CR-E2 | Relevanter Fix → betroffene Retests; Retry-/Verifikationsbudget und Herkunft tatsächlich führen. |
<!-- markdownlint-enable MD013 -->

Bisherige unveränderte Fälle wiederverwenden; nur gemeinsame Source-/Consumer-
änderungen oder Findings invalidieren Nachweise. Keine alte v24-Releaseprüfung
oder gesamte Activity-/Backend-/Androidsuite. Der kleine F34-Erhaltungscheck
ist wegen des Fehlervertrags ausdrücklich eingeplant, kein Blindupdate.

CodeRabbit kann ohne Zwischencommit E1/E2 und Planungsdoku kumulativ sehen.
Scope nennen, Findings deduplizieren, E1 nicht erneut reparieren. Reviewweg,
Retrybudget und Kontingent-Checkpoint stehen einmal in
[D-CR-E23](MIDAS%20Intake%20Diagnostics%20Rolling%20Wave%20Roadmap%20%28DONE%29.md#coderabbit-regel-f%C3%BCr-e2-und-e3).
Ein erster technischer Fehler verlangt keinen Runabbruch und keine neue
Bestätigung; nach erneutem CLI-Fehler kann Stephan den tatsächlichen
CodeRabbit-Review in VS Code übernehmen. Bis zum Reviewbeleg sichere
unabhängige Arbeit fortsetzen, CR-E2 offen halten. Ein nativer Review allein
schließt ihn nicht. S5 Exit erst mit tatsächlichem Reviewabschluss samt
Findingkorrektur und Pflichtmatrix; bestätigter Kontingentmangel führt zum
sicheren Checkpoint bis erneuter Verfügbarkeit, nicht zu einem falschen PASS.

### S6 — Synchronisieren, archivieren und E3 übergeben

- Elf Kandidaten und vier Zusatzziele mit Ergebnis-IDs im Parent nachführen;
  aktuelle Findings-Reparaturstände synchronisieren, E3 weiter offen lassen.
- Tatsächlich geänderten Fehlerausgabevertrag in Intake/Medication/Diagnostics,
  QA IM-001/IM-002/IM-009 und vorhandener Unreleased-Meldung ergänzen. Keine
  neue medizinische Aussage; Techfehlerfeedback darf konservativ bleiben.
- README/AGENTS/Touchlog/Overlay/HOW-TO auf Betroffenheit prüfen; keine
  globalen Senken-/Clear-Änderungen dokumentieren, die nicht passiert sind.
- POST-E2 einmal hier erfassen: tatsächlicher POST-E1-basierter Diff,
  Source-/Testidentitäten aller vier Runtimequellen, gültige E1/E2-Belege,
  erhaltene Schnittstellen und verbleibende Grenzen. Erstellt unter POST-E2.
- Archivziel nach bestandenen Checks:
  `docs/archive/MIDAS Intake Diagnostics E2 Error Outputs Execution Roadmap (DONE).md`.
  Parent und E3-Verweise synchronisieren, relative Links nach dem Verschieben
  anpassen, keine fremden Ziele überschreiben.
- Markdownlint auf neue/geänderte Teile, Link-/Anker-/Encoding-/Whitespace-
  und Scopeprüfung, `git diff --check`, finaler SoT-Review/Postchecks. Erst
  danach S6/DONE/W2-Roll-up; letzte Statusänderungen nochmals prüfen.
- E3 startet mit gültigem POST-E2 und eigener Autorität. Kein Commit/Push,
  keine Aufhebung des Backend-/Deployment-/Devicegates.

## Ausführungsevidence 14.10.2026

### B-E2 / S1

- POST-E1 bytegenau bestätigt: Intake und drei Testidentitäten stimmen;
  übrige drei Runtimequellen entsprechen dem Parentreceipt. HEAD unverändert,
  Index leer; angekündigte E1-/Findings-/Roadmapvorarbeit geschützt.
- Read: loadIntakeToday → sbSelect → C31/C02 → uiError. Med: reales
  callMedicationRpc → Batch/Slot/Ack/Follow-up/Refresh → jeweilige Senke.
  Save: Original-API liefert weiterhin .details; Caller/Feedback redigieren.
- Beide Resetquellen getrennt; main-Tageswechselroute tatsächlich aktiv,
  exportierte Modul-API nur API-Probe. Diag/Logger/Konsole und UI gelesen.
- Direkte Selectconsumer erhalten Query/Throw/JSON; Medicationconsumer
  erhalten RPC-Resultat/Cache/Events/lastError. Globale Senken PROTECTED.
- Nativer Full Contract Review PASS: Scope, Quellen, Daten-/Ownergrenzen,
  Vorgänger/Consumer/Fehlerwege geprüft; keine offenen Findings.

### Z-E2 / S2

- Feste operationbezogene Klassen: read_failed, medication_rpc_failed,
  medication_action_failed, medication_load_failed, reset_lookup_failed,
  reset_failed, intake_save_failed. Kein ungeprüfter err.code/status/Text.
- UI: feste verständliche Lade-/Speicher-/Aktionsmeldungen; Authfeedback
  bleibt erhalten. Rohfehlerobjekte/Return/Re-Throw unverändert.
- Je ID positive Marker in allen drei Diagnosesenken, negative Kanarien
  in message/details/code/status und IDs C07/C09; DOM und Fallback separat.
- Nativer Full Contract Review PASS: A1–A6 als unabhängige Ausgabe- und
  Funktionsorakel definiert; keine offenen Findings → S3.

### R-E2 / S3

- READ/MED/RESET/SAVE als vollständige Ketten; reale Listener/Originalmodule
  mit kontrollierten Auth-/HTTP-/Clockprovidern, keine produktive Session.
- Guards, Retry 3, Delays 250/500, vorhandene Totals ohne Resetwrite,
  Payloads/Writeanzahl/Busy/Auth und originale Errorproperties prüfen.
- Rückwege sind blockeigene Argumentpatches gegen E2-Preimage/POST-E1,
  niemals Restore gegen HEAD. R2-01 bis R2-06 durch Matrix abgedeckt.
- Nativer Full Contract Review PASS: direkte Consumer, Security, Testgrenzen,
  Erfolg/Fehler, Erhaltungsbindungen und Rückwege geprüft; keine Findings.

### F-E2 / S4R

- Freeze: vier Runtimequellen, drei vorhandene diagnostics.*-Dateien;
  nur ausgewählte Log-/UI-Argumente. Kein globaler Sanitizer/Runtimezuwachs.
- G-EXEC-E2 wie oben; G-GIT/G-EXTERNAL nicht erteilt. KASRKIN entbunden,
  ARGUS stillgelegt. Receipts aus POST-E1 gültig; keine Toolinventarisierung.
- Sicheres aufgelöstes Preimageziel:
  `C:/Users/steph/Projekte/M.I.D.A.S/.tmp/intake-diagnostics/MID-F35-EX-02/20261014-e2/`.
  17 vorhandene Dateien kopiert, SHA256 rückgelesen; preimages.json und
  git-entry.txt enthalten Identität/Dirty Boundary. Ziel neu, innerhalb Repo.
- Arbeitsgröße medium; Reihenfolge S4.1–S4.5 eingefroren. Native Full
  Contract Review PASS: S1–S3/Readiness/Gates/Rückwege konsistent, kein Blocker.

### T-E2-RED / S4.1

- Bestehende diagnostics.*-Basis erweitert, Originalmodule/Listener beibehalten.
  Contract-Vorprobe: E1 23/23 und Consumervertrag PASS, 24 E2-Zieltests RED;
  Browser-READ RED am festen positiven Marker. Rohkanarien synthetisch.
- Fixturefindings behoben: originales ui-errors.js für withBusy geladen;
  Refresh über exportierten Capturepfad statt nicht exportierter Funktion.
  Severitypräfix des Touchlogs explizit normalisiert, keine Senkenredaktion.
- Erwartete RED-Ausgaben in red-contract.txt; fehlende feste Marker bzw.
  bisher roher Medication-Placeholder. Kein Runtimefix in S4.1.
- Nativer Delta-/Consumerreview PASS: kontrollierte Provider, reale Error-
  und Transportverträge; E1-Schutzassertionen unverändert, keine zweite Plattform.

### T-E2-READ / S4.2

- C02/C31/X01: sbSelect-Log und Capture-Log/Enddetail/UI an Callern begrenzt.
  Originales sbSelect-Throw enthält weiterhin Backendmessage; Query unverändert.
- Fokussierte Contractmatrix READ/CONSUMERS 3/3 PASS, DOM/Fallback,
  drei Senken, Query/Return/Transporterror-Identität/Authoptions geprüft.
- Nativer Delta-/Consumerreview PASS: nur Ausgabe verändert; Fehlerstate/
  Busy/Auth/Throw/Readquery erhalten. MED/RESET/SAVE noch erwartbar offen.
- Rückweg: eigener Readargumentpatch aus F-E2, E1 bleibt erhalten → S4.3.

### T-E2-MED / S4.3

- C06/C07/C09/C18/C25/X02: vorgelagerter RPC-Log, jeweilige Callerlogs
  und technische UI-Ausgaben begrenzt; IDs an C07/C09 vollständig entfernt.
- MED/CONSUMERS 13/13 PASS: Batch, Slot, Undo, Ack, Follow-up/Refresh;
  mit/ohne Fehler-DOM, drei Senken, Payloads/Callzahl/Busy/Errorproperties.
- Nativer Delta-/Consumerreview PASS: originale RPCs, Cache/Events,
  Authguard/Returns/Re-Throws unverändert; keine Bestands-/Mailtoänderung.
- Rückweg: eigener Medargumentpatch aus F-E2; RESET/SAVE offen → S4.4.

### T-E2-RESET / S4.4

- C26/C29 im Modul und X03/X04 in main getrennt begrenzt; nur Fehlerlogs.
- RESET/READ/CONSUMERS 5/5 PASS: drei Lookupversuche, 250/500-ms-Delays,
  identischer Re-Throw, Tagesguard, vorhandene Totals ohne Write; echte
  main-Tageswechselroute zusätzlich ausgeführt, kein normales Modul-UI-PASS.
- Nativer Delta-/Consumerreview PASS: Guard/Timer/UI-Konstante/Throws
  bytegleich; keine Zusammenlegung/Scheduleränderung → S4.5.

### T-E2-SAVE / S4.5

- C38/C42 und Savefeedback begrenzt. Original-API/.details unverändert;
  rohe Exceptions in message/details/code/status verbleiben am Error.
- Contractmatrix 48/48 PASS (E1 23 + E2 25), F34 2/2 PASS.
  Save mit roher Providerexception sowie echter API-Fehlerantwort, beide
  DOMvarianten; Payload/Writezahl/Busy/State/Auth erhalten.
- Nativer Delta-/Consumerreview PASS: nur Caller-/Logargumente verändert,
  keine medizinische/Write-/APIänderung. Alle 15 Ziel-IDs lokal geprüft.
- S4-Codeblöcke abgeschlossen; Browser-/Scope-/Fullreview noch S5.

### N-E2 / S5 lokale Pflichtmatrix und nativer Full Review

- Aktuelle finale Contractmatrix 58/58 PASS: E1 23/23, E2 33/33, F34 2/2.
  Syntax aller vier Runtime- und drei Testdateien PASS; git diff --check PASS.
- Chromium 149.0.7827.55: E1 10/10 und E2 18/18 PASS; 0 externe Requests,
  frische Kontexte, echte Save-/Medikamentenlistener und Originalmarkup.
  Read/Follow-up als Original-API-Ketten, keine vollständige Hub-Bootprobe.
- E2-SCOPE PASS: vier Runtimequellen bytegenau ausschließlich eingefrorene
  Argumentpatches gegen POST-E1; neun Schutzquellen/POST-E1/HEAD/Index erhalten.
  Damit sind auch die 13 BEIBEHALTEN-Kandidaten und E3-Logs unverändert.
- Zusätzliche S5-Erhaltung: Slot/Undo/Batch haben original zwei Load-RPCs nach
  einer Mutation, Ack einen. Das ursprüngliche Orakel mit einem Load wurde
  ursachenbezogen korrigiert; Runtime unverändert, kein neuer Refreshrefactor.
- RED-Replay mit korrigiertem Fixture gegen vier gesicherte E2-Preimages:
  E1 23 und direkter Consumervertrag PASS, 32 E2-Zieltests erwartbar RED.
  Keine ReferenceError/TypeError/Unhandled-Rejection; Nachweis red-replay.txt.
  Der frühere MED-Refresh-RED enthielt eine ungültige Cacheannahme; ersetzt
  durch echte medication:changed-Route, anschließend gegen Preimage RED.
- Nativer Full Review PASS: vier Ketten, alle IDs/Senken, Security/Daten-
  und Fehlerverträge, Consumer/Guards/Retry/Scope/Rückwege vollständig geprüft.
  Keine offenen In-Scope-P0/P1. CR-E2 wird erst nach diesem Abschluss gestartet.

### Individuelle Ergebnisverweise

Ergebnisse PASS, CR-E2 abgeschlossen und disponiert; S6-Postchecks offen.

<!-- markdownlint-disable MD013 MD033 -->
| Ergebnis-ID | Kandidat | Tatsächlicher Zweig / Beleg | Erhaltung / Grenze |
| --- | --- | --- | --- |
| <a id="r-e2-c02"></a>R-E2-C02 | F35-C02 | E2-READ PASS: Readfehler-Enddetail | DOM/Fallback; positive read_failed-Klasse; drei Diagnosesenken geprüft. |
| <a id="r-e2-c06"></a>R-E2-C06 | F35-C06 | E2-MED PASS: Batchlistener | ein fehlgeschlagener Slot-RPC, Busy/Feedback erhalten; drei Diagnosesenken geprüft. |
| <a id="r-e2-c07"></a>R-E2-C07 | F35-C07 | E2-MED PASS: Slot-/Undo-Listener | ID entfernt, Payload/Undo/Busy erhalten; drei Diagnosesenken geprüft. |
| <a id="r-e2-c09"></a>R-E2-C09 | F35-C09 | E2-MED PASS: Acklistener | ID entfernt, Stocksnapshot/Payload erhalten; drei Diagnosesenken geprüft. |
| <a id="r-e2-c18"></a>R-E2-C18 | F35-C18 | E2-MED PASS: Follow-up-API | Loadfail, originales ok=false/replyText; kein Mailto; drei Diagnosesenken geprüft. |
| <a id="r-e2-c25"></a>R-E2-C25 | F35-C25 | E2-MED PASS: Medication-Eventlistener | fester Fehler-DOM, originales Refresh-/Cacheverhalten; drei Diagnosesenken geprüft. |
| <a id="r-e2-c26"></a>R-E2-C26 | F35-C26 | E2-RESET PASS: exportierte Modul-API Retry | 3 Lookups, 250/500 ms, Erroridentität; drei Diagnosesenken geprüft. |
| <a id="r-e2-c29"></a>R-E2-C29 | F35-C29 | E2-RESET PASS: exportierte Modul-API Endcatch | Lookup-/Savefehler, Re-Throw, keine falsche Guardsetzung; drei Diagnosesenken geprüft. |
| <a id="r-e2-c31"></a>R-E2-C31 | F35-C31 | E2-READ PASS: Capture-Readcatch | Select bis UI/Touchlog/Logger/Konsole; drei Diagnosesenken geprüft. |
| <a id="r-e2-c38"></a>R-E2-C38 | F35-C38 | E2-SAVE PASS: Wasserlistener | API-details/raw Exception begrenzt; Payload/State/Busy erhalten; drei Diagnosesenken geprüft. |
| <a id="r-e2-c42"></a>R-E2-C42 | F35-C42 | E2-SAVE PASS: Kombilistener | API-details/raw Exception begrenzt; Payload/State/Busy erhalten; drei Diagnosesenken geprüft. |
| <a id="r-e2-x01"></a>R-E2-X01 | F35-X01 | E2-READ PASS: originales sbSelect | Log begrenzt, Query/JSON/Throw unverändert; drei Diagnosesenken geprüft. |
| <a id="r-e2-x02"></a>R-E2-X02 | F35-X02 | E2-MED PASS: originales callMedicationRpc | Log begrenzt, Error.message/code/status und Auth erhalten; drei Diagnosesenken geprüft. |
| <a id="r-e2-x03"></a>R-E2-X03 | F35-X03 | E2-RESET PASS: main-Tageswechselroute Retry | tatsächlich aktive Route, 3 Lookups, 250/500 ms; drei Diagnosesenken geprüft. |
| <a id="r-e2-x04"></a>R-E2-X04 | F35-X04 | E2-RESET PASS: main-Tageswechselroute Endcatch | Endfehler/Re-Throw und Guards/Timer erhalten; drei Diagnosesenken geprüft. |
<!-- markdownlint-enable MD013 MD033 -->

### CR-E2 / Initialreview und Findingdisposition

- Kanonischer Aufruf 1: `coderabbit review --agent --uncommitted`;
  Exit 0, strukturiertes complete/review_completed, 1 minor finding.
  CLI nennt 0.7.6; keine automatische oder manuelle Aktualisierung ausgeführt.
- Tatsächlich geprüft: neun tracked Dateien, darunter alle vier Runtimequellen.
  Untracked Test-/Roadmapdateien fehlten in reviewedFiles; native Prüfung
  deckt sie ab, für Verifikation zusätzlich explizit sichtbar machen.
- CR-E2-01 / P2: aktueller Findings-Status und Diagnostics-Overview veraltet.
  Berechtigt, beide aktuellen Abschnitte korrigiert; historische E1-/R14-
  Evidence bewahrt. Nur Dokuchecks invalidiert, keine Runtimeänderung.
- Begründete einzige Verifikation: CR-E2-01-Fix und vollständiger kumulativer
  Test-/Roadmapscope. Temporäre eigene Intent-to-add-Einträge für sieben
  vorher untracked Dateien; nach Review gezielt entfernen, Worktree bewahren.
- Budget: Initial abgeschlossen 1/1; Verifikation 1/1 STARTED, CLI 2/3;
  technischer Retry 0/1. Keine Run-ID vom Dienst geliefert.

### CR-E2 / Verifikation und finale Disposition

- Kanonischer Aufruf 2 identisch: Exit 0, complete/review_completed,
  2 minor findings. reviewedFiles enthält alle 16 kumulativen Dateien,
  einschließlich drei diagnostics.*-Tests und vier Roadmaps. CR-E2-01
  wurde nicht erneut gemeldet; dessen Dokumentationskorrektur bestätigt.
- CR-E2-02 / P2: Parent-Resume zeigte noch Initialreview statt laufender
  Verifikation. Berechtigt; aktuelle nächste Aktion auf S6-Postchecks gesetzt.
- CR-E2-03 / P2: E2-Startkarte blieb durch einen zu engen Dokureplacer auf
  S4.2, S5-Phasenstatus NOT_STARTED. Berechtigt; Ursache korrigiert,
  Startkarte/Phasen/Resume auf tatsächlichen S5-PASS/S6-Stand synchronisiert.
- Alle drei Minor Issues disponiert und korrigiert. Nur Dokuchecks invalidiert;
  Runtime/Testidentität seit N-E2 unverändert. Keine Runtimeissues gemeldet.
  Kein zusätzlicher Review allein wegen dieser Nitpicks nach D-CR-E23.
- Tatsächlich zwei CLI-Aufrufe, beide PASS; Verifikation 1/1, Retry 0/1.
  Sieben eigene Intent-to-add-Einträge gezielt entfernt; Index wieder leer.
  Rohoutput lokal ignoriert als coderabbit-initial/verification.ndjson in F-E2.
  Kein manueller Review, keine Run-ID/Auth-/Accountdaten oder Toolupdates.

## POST-E2

Postimage Receipt vom 14.10.2026, lokale Lieferung ohne Commit/Release.

- Basis POST-E1 bytegenau übernommen; HEAD
  `75efd8e88827217c9b7400e063233229302282e3`, Index nach temporären eigenen
  Reviewmarkern wieder leer. Eintrittsvorarbeit in F-E2/preimages.json geschützt.
- E2-Diff: ausschließlich vier Runtimequellen, ausgewählte Log-/UI-Argumente;
  Testergänzungen in drei vorhandenen diagnostics.*-Dateien. Keine globale
  Senkenredaktion, kein API-/SQL-/Backend-/Auth-/Scheduler-/Medizinumbau.
- Writer unverändert: originale Wasser-/Kombihandler und Intake-API;
  Tagesbezug, ml/g, Berechnung/Payloads/Writezahl/Busy/Auth erhalten.
  Medication-RPCs/Cache/Events/Stocksnapshot und Error.message/details/code/status
  bleiben erhalten. Beide Resets getrennt, 3 Versuche, 250/500 ms, Guards/Throws.
- Gültig: E1 23/23 erneut geprüft; E2 33/33 und F34 2/2; Syntax aller sieben
  Dateien; E1-BROWSER 10/10 und E2-BROWSER 18/18 Chromium, 0 externe Requests;
  E2-SCOPE und native Full-/Delta-/Consumerreviews. RED-Replay ist Vorbefund.
- CodeRabbit-Herkunft/Disposition: CR-E2, kanonischer CLI-Initialreview und
  eine begründete Verifikation, complete plus Exit 0. CR-E2-01-Dokufix;
  keine Auth-/Accountdaten. Vollständiger Scope und weitere Findings dort.
- Mockgrenzen: kontrollierte Auth-/HTTP-/Clock-/DOMprovider, Originalmarkup
  und Originalmodule/Listener. Read/Follow-up API-seitig, main-Tageswechselroute
  lokal; Modulreset nur API-Probe. Kein Live-/PWA-/Backend-/Device-/Linux-PASS.

<!-- markdownlint-disable MD013 -->
| Source/Test | Tatsächlicher SHA256 |
| --- | --- |
| `app/modules/intake-stack/intake/index.js` | `b007ed1af5b745bab3c89ac3034961a4a1ccab15d4868648022729a23905d83f` |
| `app/modules/intake-stack/medication/index.js` | `00781687e394f3a8837b216837d164a626285d0299f20a12bb8d0eef11a9c114` |
| `app/supabase/api/select.js` | `434f38aa7218a11e3d72954033094693e81a7965b0e277fbba178f12a6b305ba` |
| `assets/js/main.js` | `85646508fcc70f5f49d7281a91036ec013c1127f481277fcfdd6e48f608e02ec` |
| `app/modules/intake-stack/intake/diagnostics.test-support.cjs` | `95e1a625ed34af1b5c3f96189220ad1d4e0862007be49e3cfe0d7250f3b09596` |
| `app/modules/intake-stack/intake/diagnostics.contract.test.js` | `d6b4a7e66774fc48403548456fdac105b745cd145f5009001fe704378820b87d` |
| `app/modules/intake-stack/intake/diagnostics.browser.smoke.cjs` | `fa1f4e4793a9007c91c1329f34e88f7c6acf648217e793edb23766fa95274526` |
<!-- markdownlint-enable MD013 -->

- E3 bleibt NOT_STARTED, braucht eigene Autorität; Assignment unverändert.
  C07/C09 samt IDs und X01–X04 sind vollständig E2, kein zweiter E3-Fix.
  13 BEIBEHALTEN-Kandidaten/E3-Logs, globale Senken und F34-API unverändert.
- Invalidation: relevante Runtime-/Test-/Provider-/Markup-/Consumerbytes ändern
  → nur betroffene Orakel/Reviews neu prüfen. Historische E1-Identitäten bleiben
  deren ursprünglicher Beleg; aktuelle E3-Baseline ist dieses POST-E2.
- S6-Hygiene-/Archivpostchecks unten entscheiden über DONE, kein Dateinamen-PASS.

## S6-E2 / Sync und Abschlussprüfung

- Sync: aktuelle elf Findingszeilen, Registry mit 15 Einzelverweisen,
  Intake/Medication/Diagnostics, QA IM-001/IM-002/IM-009 und vorhandene
  Securitymeldung unter Unreleased. Historische R14-/E1-Evidence geschützt.
- Unbetroffen: AGENTS/README/Architektur (Fachlichkeit/Rollen/Ownergates),
  Overlay/ATLAS/BLUEPRINT (keine Tool-/Installationsänderung), QA-Index/HOW-TO/
  Setup (kein neuer Produktablauf), Touchlog (Senken/Clear/Retention gleich),
  SW/Intake-API/F34/Backend/SQL/Auth/Geräte. Keine unnötigen SoT-Edits.
- S6-PRE PASS: neun betroffene Markdowndokumente, 105 lokale Links/Anker,
  UTF-8/BOM/Whitespace, Scope, 15 IDs und POST-E2-Identitäten geprüft.
  Drei aktive Roadmaps lintfrei; 186 gemappte Altbefunde in sechs Bestandsdocs
  unverändert, 0 neue Befunde. R14-Historie/POST-E1 erhalten, E3 unberührt.
- Lokales S6-Finding korrigiert: ein zu breiter Zeilenmatcher annotierte auch
  historische Inventarzeilen. Ausschließlich eigene Annotationen aus F-E2
  entfernt; historischer Abschnitt erneut unverändert geprüft, kein HEAD-Restore.
- Nativer S6-SoT-/Scope-/Acceptance-Review: A1–A5 und Reviewdisposition erfüllt,
  A6 durch S6-ARCHIVE/Postchecks erfüllt; E2-Acceptance vollständig.
- S6-ARCHIVE PASS: sicherer neuer Archivpfad, interne/Parent-/Findings-/E3-
  Links angepasst; 105 lokale Links/Anker, Encoding/BOM/Whitespace, Lint-
  Altbefundmapping, Scope/Identitäten/E1/R14/E3 und git diff --check bestanden.
- S6-FINAL PASS: A1–A6 erfüllt, finale Status-/Resumeänderungen erneut auf
  Hygiene, Konsistenz, Scope, Postimage, HEAD und leeren Index geprüft.
  106 lokale Links/Anker gültig; 186 Altbefunde unverändert, 0 neue Lintbefunde.
  Keine offene E2-Restarbeit; Gesamtplan ACTIVE, E3 NOT_STARTED.

## Planreview und Resume Card

- E2 S1/S2/S3/S4R/S4.1–S4.5/S5 erfüllt; S6 DONE am 14.10.2026.
  A1–A6, 15 individuelle Ergebnisse, N-E2/CR-E2/POST-E2/S6-Nachweise gültig.
- G-EXEC-E2 aus aktueller Nachricht fortgeltend bis zu diesem Endpunkt;
  Auftrag erfüllt. G-GIT/G-EXTERNAL nicht erteilt; keine weiteren Aktionen.
- Zwei CodeRabbit-CLI-Abschlüsse, drei Minor Issues korrigiert;
  Verifikation 1/1, technischer Retry 0/1. Kein weiterer Reviewlauf erforderlich.
- HEAD 75efd8e88827217c9b7400e063233229302282e3, Index leer; eigene E2-
  Änderungen uncommitted, Eintrittsvorarbeit/Preimages und E1 geschützt.
- Nächste erlaubte Arbeit: gesonderte Ownerbewertung von E3 mit POST-E2;
  E3 bleibt NOT_STARTED. Kein Commit/Tag/Push/Deploy/Installationsauftrag.

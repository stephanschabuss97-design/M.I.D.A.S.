# MIDAS Activity V2 R14 Repair Findings

## Zweck und Grenze

Dieses Dokument ist der Bug- und Repair-Backlog der R14-Ausführung. Es trennt
Activity-V2-Blocker von allgemeinen MIDAS-Funden, Testproblemen und
Prozesskorrekturen. Die aktive Roadmap und ihre Evidence bleiben für die
Ausführung autoritativ.

MIDAS ist eine persönliche Single-User-Anwendung. Ein während R14 gefundener
Bestandsfehler wird deshalb nicht automatisch Teil des Activity-V2-Cutovers.
R14 repariert nur Befunde, die mindestens einen dieser Verträge berühren:

- genau einen produktiven Activity-V2-Writer und keinen Dual Write;
- Recovery-, Request-ID- und Exactly-once-Verhalten;
- V2-History, Detail und Export sowie unveränderte R13-Reader;
- sichere Productload-, Cache- und Rollbackkohärenz;
- einen durch Activity V2 neu eingeführten Security- oder Privacyfehler.

Andere Funde bleiben sichtbar, werden aber in einer eigenen späteren
Repairwelle behandelt. Sie werden weder stillschweigend als behoben noch als
Activity-V2-PASS ausgegeben.

## Kurzstatus

| Bereich | Stand |
| --- | --- |
| Produktion | Activity V1 einziger Writer, R13 unverändert, Root-SW v21 |
| V2-Daten | Sessions/Items/Sets 0/0/0; kein Dual Write |
| Lokaler V2-Code | bekannte Funktionsfehler F25/F26 und F34-spezifische Privacygrenze geschlossen und lokal revalidiert |
| Lokaler Releasegraph | bekannte Releasefehler F29/F31/F32 geschlossen; v22/v23 lokal vollständig revalidiert |
| Aktueller V2-Blocker | F36 owner-resolved: bestätigter UI-Discard im nächsten separat freigegebenen Cutoverfenster; produktive Ausführung ausstehend |
| Allgemeiner MIDAS-Backlog | F35: bestehende Intake-Diagnostik; nicht durch Activity V2 eingeführt |

## Findings F01 bis F35

| IDs | Klasse | Status | Bedeutung für R14 |
| --- | --- | --- | --- |
| F01-F11 | Planungs-, Cutover-, Recovery- und Scopeverträge | geschlossen | Anforderungen vor Implementierung präzisiert; keine offenen Produktfehler |
| F12 | produktives Baseline-Postimage | geschlossen | tatsächlichen Pages-/Writer-/Reader-/SW-Stand korrigiert |
| F13-F19 | Reader-, Writer-, Lifecycle-, Rollback-, Event- und Cacheverträge | geschlossen | R14-Implementierungsgrenzen festgelegt und umgesetzt |
| F20-F21 | historische Testorakel und CodeRabbit-Schutz | geschlossen | Test-/Reviewartefakte korrigiert; kein Runtimefehler |
| F22-F23 | V1-Datenbaseline und Androidscope | akzeptiert | Baseline revalidiert; Android bleibt `DEFERRED / NOT PASS` |
| F24 | Rollback-Validator | geschlossen | PowerShell-Tokenzählung korrigiert; kein Produktdatenfehler |
| F25 | V2-Semantikbindung | geschlossen, produktiver Reproof ausstehend | echter V2-Fehler: Data Access erhielt zuvor implizit v1 statt der Draftsemantik |
| F26 | V2-UI-/Auth-Lifecycle | geschlossen, produktiver Reproof ausstehend | echter V2-Fehler: redundantes Auth-Event konnte die aktive Sessionfläche zurücksetzen |
| F27 | Recovery-Harness | geschlossen | ausschließlich Test-UUID-Kollision, kein Produktfehler |
| F28 | gealterter Recovery-Draft / Preflight | technisch geschlossen | Ursache 1440-Minuten-Grenze bewiesen; write-freier Preflight vorhanden, Draft absichtlich unverändert |
| F29a | V2-Viewport/Scroll | geschlossen | Abschlussaktion an relevanten Viewports erreichbar |
| F29b, F31-F32 | Release-, SW-, ESM- und Offlinekohärenz | geschlossen, produktiver Reproof ausstehend | für sicheren Cutover/Rollback relevant, aber keine medizinische oder Writersemantik |
| F30 | bestehende Vitals-Diagnostik | geschlossen | allgemeine Privacyhärtung; nicht durch Activity V2 eingeführt |
| F33 | Usage-Guard-Reserve | geschlossen | Prozessfehler, kein MIDAS-Produktfehler |
| F34 | bestehende Intake-API-Diagnostik | lokal vollständig geschlossen, produktiver Reproof ausstehend | nicht durch Activity V2 eingeführt; F34-eigene Browserdiagnostik 0 sensitive Treffer, gemeinsamer F35-Zähler separat |
| F35 | gemeinsamer Intake-Stack | offen / separater Repair-Backlog | 36 Laufzeittreffer und 42 statische Prüfkandidaten; keine 42 bewiesenen Bugs und kein bewiesener V2-Funktionsfehler |

Die vollständigen Einzelbeschreibungen und Nachweise bleiben in der aktiven
Roadmap und Evidence. Diese Tabelle ersetzt sie nicht.

## F36 – gealterter Recovery-Draft blockiert den produktiven V2-Smoke

### Einordnung

- Schwere: P1 für den R14-Cutover, kein neuer Produktcodefehler;
  ownerseitig durch D-ACT-R14-28 entschieden.
- Bereich: Activity V2 Recovery und Cutover-Operatorvertrag.
- Produktwirkung: keine; Produktion bleibt V1-only/v21.

### Bewiesene Ursache

Der erhaltene produktive Recovery-Draft stammt aus einem früheren
Cutoverversuch. F28 bewies, dass der reale Commitvalidator bei mehr als 1440
Minuten zwischen `started_at` und Abschlusszeit mit
`INVALID_TIME/duration_min` vor Recovery-Persistenz und Transport stoppt.

Der aktuelle Code verhält sich dabei vertragsgemäß:

1. `preflightSessionCommit()` verwendet denselben Intentvalidator wie der
   echte Abschluss und verändert Draft oder Request-ID nicht.
2. `startSession()` ist nur bei leerem Recoverystate zulässig.
3. Ein recoverable Draft bietet Fortsetzen oder den vorhandenen,
   bestätigungspflichtigen UI-Pfad `discardRecoveredSession()`.
4. Ohne bewusstes Verwerfen bleibt der alte Draft erhalten, aber es kann kein
   neuer, commitfähiger Smoke-Draft begonnen werden.

Damit ist der nächste produktive V2-Schreibnachweis nicht durch einen aktuell
bewiesenen Fehler in Listener, Semantikbindung, Data Access oder RPC gesperrt,
sondern durch eine noch nicht entschiedene Behandlung dieses alten Drafts.

### Nicht zulässige Scheinlösungen

- `started_at`, Dauer, Request-ID oder Payload still verändern;
- den Draft oder Browserstorage automatisch löschen;
- die 1440-Minuten-Grenze nur für den Cutover umgehen;
- parallel einen zweiten Recovery-Draft einführen;
- einen produktiven PASS ohne echten Write behaupten.

Diese Varianten würden den bestehenden Recovery-, Daten- oder
Semantikvertrag ändern und gehören nicht in einen kleinen R14-Fix.

### Kleinste zulässige Lösung

D-ACT-R14-28 entscheidet ausdrücklich die Variante **Draft bewusst
verwerfen**: Nach dem v22-Boot wird ausschließlich der vorhandene
bestätigungspflichtige UI-Pfad „Entwurf verwerfen“ verwendet. Danach wird ein
frischer Katalog-v2-Smoke-Draft mit neuer Request-ID erstellt. Das ist eine
Owneraktion und keine automatische Datenkorrektur.

Die konkrete Draft-Verwerfung muss Bestandteil des nächsten separat
freigegebenen P1/P2-Fensters sein. Der Datenbank-Smoke-Delete bleibt davon
getrennt und erfolgt weiterhin nur über den normalen R9-UI-Flow. Bestehende
V1-/V2-Datenbankdaten werden durch den Draft-Discard nicht verändert.

### Nächster technischer Block

Kein weiterer V2-Codefix ist angezeigt. Der nächste Bucket kann nach neuem
P1/P2 direkt diese Reihenfolge verwenden:

1. aktuellen Worktree, Manifest und v21-Produktpostimage bestätigen;
2. die bereits invalidierten lokalen Abschlussprüfungen fertigstellen;
3. neues v22/v23-Manifest und exakten P1-Scope einfrieren;
4. produktiven read-only Preflight ausführen;
5. bei ausreichendem Usage v22 deployen;
6. Recovery-Draft sichtbar bestätigen und über den normalen UI-Pfad
   verwerfen;
7. einen frischen V2-Smoke-Draft erstellen und vor dem Write preflighten;
8. genau einen Write, fehlenden Dual Write, History, Detail, Export und R13
   beweisen;
9. nur den erzeugten Datenbank-Smoke über R9 löschen;
10. bei jedem Pflichtfehler vollständig auf v23 zurückrollen.

## Separater allgemeiner MIDAS-Repairbacklog

### F35 – gemeinsame Intake-Diagnostik

F35 bleibt offen und darf später gezielt analysiert werden. Der bisherige
Zähler beweist sensible Muster im gemeinsamen Intake-Stack, aber nicht, dass
alle 42 statisch markierten Call-Sites fehlerhaft sind. Eine spätere Repairwelle
soll nur tatsächlich sensible Laufzeitausgaben abstrahieren und Verhalten,
REST-Bodies und medizinische Semantik unverändert lassen.

### F35-Einzelinventar der 42 Prüfkandidaten

Das Inventar ist an den SHA-256-Fingerprint
`1cabc4b192df06c36580b29a7346b2412ff85b86c590c3d51b219c2e6f1cfb3c`
von `app/modules/intake-stack/intake/index.js` gebunden. Die Zeilenangaben
beziehen sich auf genau diesen Worktree-Stand. `OPEN_TRIAGE` bedeutet nur,
dass die Call-Site in einer späteren Repairwelle einzeln gegen reale
Laufzeitausgaben geprüft werden muss. Es ist kein Nachweis für 42 getrennte
Produktfehler.

| Kandidat | Zeile | Diagnosefläche | Prüfgrund | Status |
| --- | ---: | --- | --- | --- |
| F35-C01 | 102 | Capture-Refresh gestartet | Tageskontext | `OPEN_TRIAGE` |
| F35-C02 | 113 | Capture-Refresh beendet | Tageskontext und dynamisches Detail | `OPEN_TRIAGE` |
| F35-C03 | 411 | Medikations-Platzhalter | Tageskontext und dynamische Meldung | `OPEN_TRIAGE` |
| F35-C04 | 427 | Niedriger Bestand beendet | Tageskontext | `OPEN_TRIAGE` |
| F35-C05 | 438 | Niedriger Bestand erkannt | Bestandsanzahl und Tageskontext | `OPEN_TRIAGE` |
| F35-C06 | 663 | Medikations-Batchfehler | Abschnitt und rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C07 | 704 | Medikationsstatus-Fehler | Slot-Identität und rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C08 | 730 | Bestandswarnung bestätigt | Medikationsidentität, Bestand und Tag | `OPEN_TRIAGE` |
| F35-C09 | 734 | Bestandsbestätigung fehlgeschlagen | Medikationsidentität und rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C10 | 766 | Rezeptkontakt-Start blockiert | Medikationsidentität und dynamischer Grund | `OPEN_TRIAGE` |
| F35-C11 | 774 | Rezeptkontakt-Start gesperrt | Medikationsidentität | `OPEN_TRIAGE` |
| F35-C12 | 780 | Rezeptkontakt-Cooldown | Medikationsidentität | `OPEN_TRIAGE` |
| F35-C13 | 786 | Rezeptkontakt-Bestätigung vorbereitet | Medikationsidentität und Tag | `OPEN_TRIAGE` |
| F35-C14 | 817 | Rezeptkontakt-Bestätigung blockiert | Medikationsidentität und dynamischer Grund | `OPEN_TRIAGE` |
| F35-C15 | 826 | Rezeptkontakt-Bestätigung gesperrt | Medikationsidentität | `OPEN_TRIAGE` |
| F35-C16 | 833 | Rezeptkontakt ausgelöst | Medikationsidentität und Tag | `OPEN_TRIAGE` |
| F35-C17 | 848 | Rezeptkontakt abgebrochen | Medikationsidentität | `OPEN_TRIAGE` |
| F35-C18 | 879 | Rezeptkontakt-Datenladen fehlgeschlagen | Tageskontext und rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C19 | 905 | Rezeptkontakt-Follow-up blockiert | Medikationsidentität und dynamischer Grund | `OPEN_TRIAGE` |
| F35-C20 | 915 | Rezeptkontakt-Follow-up gesperrt | Medikationsidentität | `OPEN_TRIAGE` |
| F35-C21 | 923 | Rezeptkontakt-Follow-up-Cooldown | Medikationsidentität | `OPEN_TRIAGE` |
| F35-C22 | 936 | Rezeptkontakt-Follow-up ausgelöst | Medikationsidentität, Tag und Quelle | `OPEN_TRIAGE` |
| F35-C23 | 974 | Medikations-Refresh gestartet | Tageskontext und dynamischer Grund | `OPEN_TRIAGE` |
| F35-C24 | 987 | Medikations-Refresh erfolgreich | Tageskontext und Anzahl | `OPEN_TRIAGE` |
| F35-C25 | 995 | Medikations-Refresh fehlgeschlagen | rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C26 | 1195 | Intake-Reset-Lookup fehlgeschlagen | Versuchszähler und rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C27 | 1220 | Intake-Reset übersprungen | Tageskontext und vorhandene Intake-Summe | `OPEN_TRIAGE` |
| F35-C28 | 1223 | Intake-Reset gestartet | Tageskontext | `OPEN_TRIAGE` |
| F35-C29 | 1231 | Intake-Reset fehlgeschlagen | rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C30 | 1314 | Intake-Tagessummen-Laden fehlgeschlagen | rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C31 | 1384 | Intake-Laden fehlgeschlagen | rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C32 | 1418 | ungültige Wassereingabe | vollständiger Eingabewert | `OPEN_TRIAGE` |
| F35-C33 | 1431 | ungültige Salz-/Proteineingabe | Intake-Art und vollständiger Eingabewert | `OPEN_TRIAGE` |
| F35-C34 | 1436 | Intakewert geparst | Intake-Art und Wert | `OPEN_TRIAGE` |
| F35-C35 | 1450 | Intake-Summen berechnet | vollständige Intake-Summen | `OPEN_TRIAGE` |
| F35-C36 | 1454 | Intake-Speicherung gestartet | Intake-Art und vollständige Summen | `OPEN_TRIAGE` |
| F35-C37 | 1484 | UI-Refresh nach Intake fehlgeschlagen | rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C38 | 1497 | Intake-Speicherung fehlgeschlagen | Intake-Art und rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C39 | 1541 | kombinierte Intake-Summen berechnet | vollständige Intake-Summen | `OPEN_TRIAGE` |
| F35-C40 | 1545 | kombinierte Intake-Speicherung gestartet | vollständige Intake-Summen | `OPEN_TRIAGE` |
| F35-C41 | 1576 | UI-Refresh nach Kombispeicherung fehlgeschlagen | rohe Fehlerdetails | `OPEN_TRIAGE` |
| F35-C42 | 1595 | kombinierte Intake-Speicherung fehlgeschlagen | rohe Fehlerdetails | `OPEN_TRIAGE` |

Die Quelldatei enthält insgesamt 55 `diag.add`-Call-Sites. Die übrigen 13
gehörten nicht zur ursprünglichen F35-Klassifikation, weil sie keine der dort
verwendeten Kategorien Tageskontext, Intakewert/-summe, Medikationsidentität
oder rohe Intake-/Medikationsfehler erfüllten beziehungsweise außerhalb der
F35-Intake-/Medikationsfläche lagen. Diese Abgrenzung ist kein pauschaler
Privacy-PASS für jene 13 Call-Sites.

F35 ist nicht durch Activity V2 eingeführt und verhindert für sich allein
nicht dessen Capture-, Commit-, Reader- oder Rollbackfunktion. Bis zur
separaten Reparatur darf dafür jedoch kein allgemeiner MIDAS-Privacy-PASS
behauptet werden.

Das R14-Productbrowser-Orakel grenzt diese Aussage ausdrücklich ab: Es verlangt
für die durch F34 geänderte Intake-API 0 sensitive Treffer und berichtet den
bekannten gemeinsamen F35-Stand nur als inhaltsfreie Anzahl. Der letzte lokale
Nachweis ergab F34 0 und F35 36. Damit ist F34 geschlossen, ohne F35 fälschlich
als repariert oder als allgemeinen Privacy-PASS auszugeben.

## Abschlussurteil

Es ist derzeit kein weiterer ungefixter Activity-V2-Codefehler bewiesen. Für
den Cutover fehlen:

- die produktive Ausführung der durch D-ACT-R14-28 entschiedenen
  Recovery-Draft-Verwerfung;
- der produktive Reproof der lokal geschlossenen F25/F26- und Releasepfade;
- das reguläre S5.6-/S6-Postimage nach einem erfolgreichen Write-/Reader-/Delete-
  Smoke.

Die lokale Cutoverbasis ist eingefroren: 50 Code-/Testdateien mit Manifest
`179c9df627d846a2f0b0937ccb9f47314529ca8edc7f9aeaca0899499ba929e1`.
Der aktuelle zu stagende Git-Deltascope umfasst 35 Code-/Testdateien plus
Roadmap, Evidence und diesen Repair-Bugreport, insgesamt 38 Dateien. PRE09 ist
PASS. D-ACT-R14-29 erteilt das neue gemeinsame P1/P2; der nächste Schritt ist
beim frischen gültigen Gate ab 72/21 ausschließlich das atomare v22/v23-
Cutoverfenster ohne erneute Freigaberückfrage.

Allgemeine MIDAS-Funde bleiben in diesem Dokument sichtbar, werden aber nicht
ohne Activity-V2-Bezug im R14-Cutover weiterbearbeitet.

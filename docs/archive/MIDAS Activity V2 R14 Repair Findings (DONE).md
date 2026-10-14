# MIDAS Activity V2 R14 Repair Findings (DONE)

> Aktuelle Einordnung: Die [Einzeltriage vom 14.10.2026](#aktuelle-f35-einzeltriage-2026-10-14)
> bewertet alle 42 F35-Kandidaten: **14 reparieren, 15 optional, 13 beibehalten**.
> Die folgenden ursprünglichen R14-Status-, Release- und Datenangaben sind
> historische Abschlussnachweise, keine heute erneut geprüfte Produktionslage.
> Abschluss am 14.10.2026: Alle 29 ausgewählten F35-Kandidaten und vier
> E2-Zusatzziele sind repariert und geprüft; 13 Kandidaten bleiben bewusst erhalten.
> E1–E3 und die Rolling Wave sind DONE. Frühere Offenstände unten bleiben
> historische Triage-/Ausführungsnachweise; maßgeblich ist der Abschlussnachtrag.

## Zweck und Grenze

Dieses Dokument ist der Bug- und Repair-Backlog der R14-Ausführung. Es trennt
Activity-V2-Blocker von allgemeinen MIDAS-Funden, Testproblemen und
Prozesskorrekturen. Die aktive Roadmap und ihre Evidence bleiben für die
Ausführung bis zum Abschluss autoritativ; danach sind die gemeinsam
archivierten `(DONE)`-Roadmap und Evidence das R14-Postimage.

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
| Produktion | Activity V2 einziger Writer, R13 unverändert, Root-SW v24; HEAD/origin `4ef1153812f067a61f13d08a0889bff1319bbcf7` |
| V2-Daten | Produktiver Smoke 1/1/1 vollständig bewiesen und ausschließlich über R9 gelöscht; aktuell 0/0/0, V1 unverändert 69, kein Dual Write |
| Lokaler V2-Code | bekannte Funktionsfehler F25/F26/F37 und F34-spezifische Privacygrenze geschlossen und lokal revalidiert |
| Lokaler Releasegraph | bekannte Releasefehler F29/F31/F32 geschlossen; v24/v25 lokal vollständig revalidiert |
| Aktueller V2-Blocker | keiner; R14 ist DONE, v24 produktiv und S5.6/S6 PASS |
| Allgemeiner MIDAS-Backlog | F35: bestehende Intake-Diagnostik; nicht durch Activity V2 eingeführt |

## Findings F01 bis F37

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
| F36 | gealterter Recovery-Draft | owner-resolved / ausgeführt | alter Draft wurde im v22-Fenster nach sichtbarer Wiederherstellung und Bestätigung über den normalen UI-Pfad verworfen; keine Datenbankwirkung |
| F37 | produktiver V2-Abschluss / Recovery-Intentprojektion | lokal geschlossen, produktiver Reproof ausstehend | Recovery verglich den kompakten Commitpayload fälschlich mit allen drei Draftzeilen. Gemeinsame Projektion nichtleerer zusammenhängender Sets sowie exakter Produktionsdraft-Replay, Last-Mile-, Release- und Fullreviews PASS |

Die vollständigen Einzelbeschreibungen und Nachweise bleiben in der aktiven
Roadmap und Evidence. Diese Tabelle ersetzt sie nicht.

## F36 – gealterter Recovery-Draft blockiert den produktiven V2-Smoke

### Einordnung

- Schwere: P1 für den R14-Cutover, kein neuer Produktcodefehler;
  ownerseitig durch D-ACT-R14-28 entschieden.
- Bereich: Activity V2 Recovery und Cutover-Operatorvertrag.
- Produktwirkung: alter Draft lokal verworfen; keine Datenbankwirkung.
  Produktion steht nach Pflichtrollback sicher auf V1-only/v23.

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

F36 war damit kein Produktcodefehler. Die Behandlung wurde durch
D-ACT-R14-28 entschieden und im v22-Fenster über den normalen bestätigten
UI-Pfad ausgeführt. Der danach sichtbar gewordene frische Abschlussfehler ist
als separates F37 erfasst.

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

### Ausgeführter Operatorpfad

Der D-ACT-R14-28-Pfad wurde im freigegebenen v22/v23-Fenster ausgeführt:

1. v22 wurde über `42a0858` / Pages 34245115560 ausgeliefert;
2. der alte Draft wurde sichtbar bestätigt und verworfen;
3. ein frischer Katalog-v2-Draft mit einem minimal gültigen Set entstand;
4. genau ein Abschlussklick scheiterte fail-closed;
5. es gab keinen Retry, Write oder Delete;
6. v23 wurde über `6c9e722` / Pages 34247698890 vollständig und
   datenverlustfrei zurückgerollt.

## F37 – frischer V2-Draft wird beim produktiven Abschluss unavailable

### Beobachtung und sichere Grenze

- Schwere: P1 für den R14-Cutover.
- Ein frischer Katalog-v2-Draft mit einem minimal gültigen Set war lokal
  gesichert und die Abschlussaktion aktiviert.
- Genau ein produktiver Abschlussklick führte unmittelbar zu
  „Activity V2 ist derzeit nicht verfügbar“ und blockiertem Abschluss.
- Es wurde kein identischer Retry ausgeführt. V1 blieb 69, V2 blieb 0/0/0;
  der frische Recovery-Draft und seine Eingaben blieben erhalten.
- Der v23-Rollback ist vollständig PASS. Produktion ist V1-only/v23.

Die bewiesene Fehlergrenze liegt vor einer erfolgreichen Persistenz. Aus dem
aktuellen Produktpostimage lässt sich noch nicht seriös ableiten, ob der
Auslöser in Runtimeverfügbarkeit, Shell-/Controllerzustand, Dependency-
Composition oder Commitdispatch liegt. Supabase, RPC und Data Access werden
ohne Transportnachweis nicht als Ursache behauptet.

### Nächster technischer Block

Nach einem frischen kanonischen Usage-Gate ausschließlich lokal:

1. F37 mit einem frischen v2-Draft und kontrolliertem Transportstub
   reproduzieren;
2. die Zustandsfolge von aktivem Productcontroller über Shell, Listener,
   Commitcontroller und Dependencyverfügbarkeit bis zum ersten fail-closed
   Übergang instrumentierungsarm beweisen;
3. produktive Boot-/Auth-/SW-/Recovery-Preconditions mit dem lokal grünen
   Last-Mile-Orakel vergleichen;
4. erst nach bewiesener Ursache den kleinsten Fix bestimmen;
5. nur invalidierte Contracts und anschließend die erforderliche integrierte
   S5-Matrix revalidieren;
6. vor einem weiteren produktiven Versuch neues Manifest, Preflight und neue
   ausdrückliche P1/P2-Freigabe herstellen.

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

## F37 – Recovery verglich Payload mit leeren Draft-Schlusszeilen

### Ursache und Korrektur

- `session-draft` erzeugt für eine Strength-Aktivität drei Setzeilen.
- Der bestehende Commitvertrag serialisiert korrekt nur zusammenhängende
  nichtleere Sets und lässt leere Schlusszeilen aus.
- `session-recovery` verlangte dagegen, dass die Payload-Setanzahl allen drei
  Draftzeilen entspricht. Ein minimal gültiger Draft mit nur der ersten
  ausgefüllten Zeile scheiterte dadurch vor dem Transport als
  `INVALID_COMMIT_INTENT` mit dem einzigen falschen Prädikat `item.set_count`.
- Der Minimalfix projiziert in Recovery dieselben nichtleeren
  zusammenhängenden Sets. Nur leere Schlusszeilen sind zulässig; eine Lücke
  oder ein vollständig leerer Strength-Draft bleibt fail-closed.
- Payload-, RPC-, Backend-, SQL-, Auth-, Medizin-, Request-ID- und
  Exactly-once-Verträge wurden nicht verändert.

### Nachweis

- Der isolierte exakte Produktionsdraft-Replay hatte vor dem Fix Transport 0
  und erreicht danach genau einen kontrollierten Transport sowie `committed`.
- Der Last-Mile-Harness belegt zusätzlich Discard→frischer Draft→nur erste von
  drei Setzeilen ausgefüllt→realer Commitpfad.
- 317/317 Node, Last-Mile-Browser 4/4+1/1, C3/R8/R13, reale
  v23→v24-/v24→v25- und Fresh-v24→Offline-Pfade, lokaler v24-Productbrowser,
  39 Syntax-, zwei Parserchecks, `git diff --check` und native Fullreviews sind
  PASS. Backend/SQL unverändert; 84/84 Deno-Evidence bleibt gültig.
- Status: `closed / productive reproof PASS`. Der v24-Produktpfad erzeugte
  genau 1/1/1, bestand History, Detail, Export und R13 ohne V1-/Dual-Write und
  löschte anschließend ausschließlich den Smoke-Datensatz über R9.

## Abschlussurteil

Es ist kein offenes lokales R14-P0/P1-Finding bewiesen. Der v24-Cutover und
das S5.6-Produktpostimage sind vollständig PASS:

- Activity V2 ist der einzige produktive Writer; V1 bleibt unveränderte
  historische Readerquelle und Rollbackreserve.
- Genau ein V2-Smoke-Write erzeugte 1/1/1 ohne Retry oder Dual Write.
- History, Detail, Coaching-Export und R13 bestanden.
- Ausschließlich der Smoke-Datensatz wurde bestätigt über R9 gelöscht;
  aktuell V2 0/0/0 und V1 unverändert 69.
- Root-SW v24 ist aktiv; der v25-Rollback war nicht erforderlich.
- Android bleibt transparent `DEFERRED / NOT PASS`.

Die administrative Abschlussphase U12/S6 ist ebenfalls PASS: Sources of Truth
sind synchronisiert, Roadmap und Evidence gemeinsam als `(DONE)` archiviert
und der Abschlusscommit/-push durch D-ACT-R14-30 freigegeben. R14 ist DONE.

Das aktuelle 57-Dateien-Release-Manifest lautet
`e97f887b7c6da0b96447e46c30eda0c3db6c71e7857579d4bd168b99d233b963`.
Der nächste Git-P1-Scope umfasst 43 Code-/Test-/Produktdateien plus Roadmap,
Evidence und dieses Repair-Dokument, insgesamt 46 Dateien. PRE10 ist PASS;
lokale Versionen sind v24 für Cutover und v25 für die V1-Inverse.
D-ACT-R14-29 ist verbraucht und darf nicht wiederverwendet werden.
D-ACT-R14-30 wurde für das erfolgreiche v24-Fenster vollständig ausgeübt; die
darin separat erteilte Freigabe für Abschlusscommit und Push nach grünem S6
bleibt gültig.

Allgemeine MIDAS-Funde bleiben in diesem Dokument sichtbar, werden aber nicht
ohne Activity-V2-Bezug im R14-Cutover weiterbearbeitet.

## Aktuelle F35-Einzeltriage 2026-10-14

### E1-Ausführungsstand 14.10.2026

Die ursprüngliche Einzeltriage bleibt als Analysebasis erhalten. E1 hat
F35-C34/C35/C36/C39/C40 tatsächlich lokal repariert; Ergebnis- und Reviewbelege
stehen in der [E1-Roadmap](MIDAS%20Intake%20Diagnostics%20E1%20Value%20Logs%20Execution%20Roadmap%20%28DONE%29.md#cr-e1-m--manueller-review-und-findingkorrektur).
Die zentrale Assignmentmatrix bleibt im Gesamtplan; dieser Bericht ist keine
zweite Assignment-SoT. Historische R14-Evidence und Inventarstatus bleiben bestehen.

- Je Kandidat: wertfreier Marker in Touchlog, Loggerhistory und Konsole;
  E1-WATER/E1-COMBO und E1-BROWSER-M. Originalhandler/Listener/API mit
  synthetischen Providern; Payload/Einheiten/Tag/Writeanzahl/Refresh erhalten.
- Guards/Fehler: E1-GUARDS, vorherige Summen und Inputs erhalten, Fehler sichtbar.
- Review: native Full Reviews; manueller CodeRabbit-Ownerbericht mit einem
  berechtigten Browser-Channelbefund, korrigiert und gezielt erneut geprüft.
  CLI-Reviewversuche waren fehlgeschlagen und sind kein CLI-PASS.
- E2 S6 ist geprüft abgeschlossen am 14.10.2026. Ausgewählte Fehlerausgaben
  verwenden feste
  Diagnoseklassen und technische UI-Texte; elf Kandidaten plus vier Zusatzziele
  sind lokal repariert. E3 S6 ist ebenfalls geprüft; die 13 eigenen
  Medikationslogargumente sind minimiert. Die 13 BEIBEHALTEN-Stellen bleiben
  unverändert; der begrenzte Gesamtabschluss ist DONE, kein globaler Privacy-PASS.
- E2-Nachweis: [N-E2](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#n-e2--s5-lokale-pflichtmatrix-und-nativer-full-review).
  CR-E2 abgeschlossen/disponiert; S6-Sync/Archiv/Postchecks erfüllt.
- Keine Live-/PWA-/Backend-/Device-/Linux-CI-Zusage aus diesen lokalen Belegen.

### E3-Ausführungsstand 14.10.2026

E3 hat C08/C10–C17/C19–C22 lokal repariert; ursprüngliche OPTIONAL/P3-
Einordnung bleibt Analysehistorie. Alle 13 sind verbindlich geliefert.
E3-TH-01 im Browserharness ist behoben; Logger-/Clearvertrag unverändert.

- Ack ohne ID/stock/Tag, Reorder ohne ID/Tag, Follow-up mit festem source-
  Marker. Begrenzte Guardgründe und fachliche IDs/Bestände/Tag/Kontakt bleiben.
- Pflichtmatrix: 79/79 gemeinsame Contracts einschließlich F34; Browser
  E3 19/19, E2 nach TH-01 18/18. Originalmodule/Listener, synthetische Provider;
  0 externe Requests/echte Protokollübergaben, keine Mail-App/Mail.
- Nativer Full Review und CR-E3 CLI PASS, 0 Issues, alle 17 Dateien geprüft.
  E1/E2 gültig oder gezielt revalidiert; genau 29 Kandidaten plus vier X-Ziele,
  13 unveränderte BEIBEHALTEN-Dispositionen. E3 und Gesamtplan S6 DONE;
  Archive/Postchecks erfüllt.
- Technische Ergebnis-SoT: [E3-INTEGRATION](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#e3-integration).
  Keine medizinische/API-/Backend-/Produktivänderung; kein globaler Privacy-PASS.

### Auftrag, Baseline und Ergebnis

Ownerauftrag vom 14.10.2026: jeden vorhandenen Triagekandidaten verfolgen und
verhältnismässig bewerten. Freigegeben ist diese Analyse samt Bericht, keine
Runtimekorrektur, kein Backendzugriff und kein Commit oder Push.

- Gitbaseline: `75efd8e88827217c9b7400e063233229302282e3`; Worktree zu Beginn sauber.
- Unveränderte Intakequelle: `app/modules/intake-stack/intake/index.js`;
  SHA256 `1cabc4b192df06c36580b29a7346b2412ff85b86c590c3d51b219c2e6f1cfb3c`.
- Alle **42 Inventarstellen** wurden einzeln gelesen und bis zu aktuellem
  Aufrufer, Datenherkunft und Diagnosesenke verfolgt. Die 13 übrigen
  `diag.add`-Stellen derselben Datei wurden zur Abgrenzung mitgeprüft.
- Ergebnis: **14 REPARIEREN**, **15 OPTIONAL**, **13 BEIBEHALTEN**.
  Das sind Empfehlungen, keine bereits ausgeführten Fixes oder Owner-Waiver.

Der tatsächliche Handlungsbedarf ist überschaubar: fünf normale Logs mit
Intakewerten/Tagessummen und neun Stellen mit ungefilterten Fehlerdetails.
Hinzu kommen direkt verbundene Fehlerausgaben vor beziehungsweise neben
Intake, damit eine spätere Korrektur den tatsächlichen Ausgabepfad abdeckt.
Kein bewiesener akuter Funktionsausfall oder fremder Datenzugriff ergibt sich
aus dieser Prüfung. Als neuer Reparaturauftrag ist das nach aktueller
Evidenz ein begrenztes **P2-Wartungspaket**; die optionalen Kürzungen sind P3.

F35 wurde in der historischen R14-Evidence als P1 geführt. Diese neue
Empfehlung überschreibt weder diesen damaligen Befund noch dessen Evidence
und ist kein rückwirkender PASS. Vor einer Ausführung ist die abweichende
heutige Priorisierung ausdrücklich in deren Scope zu übernehmen. F35 bleibt
als allgemeine Privacy-Arbeit offen; Activity V2 wird dadurch nicht neu geöffnet.

### Welche Daten tatsächlich wohin gelangen

Die [Diagnosekonfiguration](../../app/core/config.js) ist ohne Override standardmässig
aktiv (Zeilen 37–48). Ein eventuell gesetzter Override auf Stephans Gerät wurde
nicht ausgelesen. [diag.add](../../app/core/diag.js) übernimmt Meldungen ohne
inhaltliche Redaktion, hält bis zu 80 Zeilen im Speicher und reicht sie an den
[Diagnoselogger](../../app/diagnostics/logger.js) weiter. Dieser hält bis zu 100
Einträge im RAM und gibt bei aktiver Diagnose vollständige Meldungen an
`console.debug` aus. Die Darstellung erfolgt mit `textContent`; diese Prüfung
belegt damit keinen HTML-Injection-Fehler.

Die untersuchten Senken laden Logs nicht automatisch hoch und schreiben sie
nicht selbst auf die Platte. Das ist eine lokale Datenminimierungsfrage in einer
persönlichen App, kein nachgewiesenes Mehrnutzerleck. Dennoch gehören komplette
Gesundheitssummen nicht zusätzlich in laufende Diagnoseausgaben. Rohe
Backendfehler sind unkontrollierte Inhalte; die Probe beweist die unveränderte
Weitergabe, aber keine tatsächlich erfolgte Ausgabe von Secrets oder
medizinischen Daten in einer realen Fehlermeldung.

`diag.clear()` leert nur die Touchlog-Struktur, nicht die separate Loggerhistory
oder bereits geschriebene Konsolenausgaben. Das Schliessen des Panels beendet
die Aufzeichnung ebenfalls nicht. Eine umfassende Löschfunktion wäre ein
separater optionaler P3-Auftrag, keine Voraussetzung für den hier empfohlenen
Minimalfix und kein bewiesenes funktionales Löschversprechen des aktuellen UI.

### Disposition aller 42 Kandidaten

Zeilennummern beziehen sich auf die oben gehashte
[Intakequelle](../../app/modules/intake-stack/intake/index.js). `BEIBEHALTEN`
bedeutet: unter den heutigen Aufrufern keine eigene Reparatur nötig. Es
bedeutet weder Unerreichbarkeit unter beliebigen künftigen Providern noch einen
allgemeinen Privacy-PASS. `OPTIONAL` darf für diesen Single-User-Betrieb liegen
bleiben; bei angrenzender Arbeit kann es günstig mitbereinigt werden.

<!-- markdownlint-disable MD013 -->
| ID | Zeile | Tatsächlicher Pfad / Inhalt | Empfehlung | Begründung |
| --- | --- | --- | --- | --- |
| F35-C01 | 102 | Refreshstart; heutiger Tag und technischer Aufrufgrund | **BEIBEHALTEN** | Kein Messwert. Aktuelle Boot-/Tab-/Auth-/Voice-Aufrufer liefern technische Labels. |
| F35-C02 | 113 | Refreshende; Status, Tag, Grund und detail | **REPARIERT E2** | detail übernimmt bei Ladefehlern die rohe Fehlermeldung; feste Status-/Fehlerklasse genügt. Tag/Grund allein sind kein Reparaturgrund. E2: [R-E2-C02](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c02) lokal PASS, CR-E2 abgeschlossen. |
| F35-C03 | 411 | Medikationsplatzhalter; Tag und message | **BEIBEHALTEN** | Aktuelle Aufrufer verwenden feste Login-/Modulhinweise, keinen Backendfreitext. |
| F35-C04 | 427 | Low-stock geleert; Tag | **BEIBEHALTEN** | Technischer Zustandswechsel ohne Medikament oder Messwert. |
| F35-C05 | 438 | Low-stock aktualisiert; Anzahl und Tag | **BEIBEHALTEN** | count zählt betroffene Medikamente; es ist keine Tablettenmenge oder Dosis. |
| F35-C06 | 663 | Batch-Klickhandler; Abschnitt und Fehler | **REPARIERT E2** | Abschnitt ist ein begrenztes UI-Label; Fehler stammt aus dem Medikations-RPC und kann Backendtext enthalten. E2: [R-E2-C06](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c06) lokal PASS, CR-E2 abgeschlossen. |
| F35-C07 | 704 | Slot-Klickhandler; slotId und Fehler | **REPARIERT E2** | Rohe RPC-Fehler ersetzen; Weglassen der Slot-ID wäre zusätzlich optional. E2: [R-E2-C07](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c07) lokal PASS, CR-E2 abgeschlossen. |
| F35-C08 | 730 | Bestand bestätigt; medId, stock und Tag | **REPARIERT E3** | Reale lokale Bestandsinformation, aber keine Dosis oder Medikationsbezeichnung. Ohne aktuellen Export-/Mehrnutzerpfad vertretbar; bei Gelegenheit reduzieren. Ursprünglich OPTIONAL/P3; E3: [E3-ACK](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-ack--s41) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C09 | 734 | Bestandsbestätigung fehlgeschlagen; medId und Fehler | **REPARIERT E2** | Rohe RPC-Fehler ersetzen; medId ist davon getrennt optional. E2: [R-E2-C09](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c09) lokal PASS, CR-E2 abgeschlossen. |
| F35-C10 | 766 | Reorder-Start blockiert; medId und reason | **REPARIERT E3** | Aktueller Contract liefert begrenzte Guard-Gründe, keine Adresse oder Mailinhalte. Ursprünglich OPTIONAL/P3; E3: [E3-START](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-reorder--s42) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C11 | 774 | Reorder-Start gesperrt; medId und fester Grund | **REPARIERT E3** | Technischer Launch-Lock; ID für den Produktbetrieb nicht zwingend nötig. Ursprünglich OPTIONAL/P3; E3: [E3-START](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-reorder--s42) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C12 | 780 | Reorder-Start im Cooldown; medId und fester Grund | **REPARIERT E3** | Technischer Cooldown ohne Mailinhalt; kosmetische Datenminimierung. Ursprünglich OPTIONAL/P3; E3: [E3-START](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-reorder--s42) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C13 | 786 | Reorder-Bestätigung vorbereitet; medId und Tag | **REPARIERT E3** | Lokaler Medikationsbezug ohne Name, Stärke oder E-Mail-Adresse. Ursprünglich OPTIONAL/P3; E3: [E3-CONFIRM](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-reorder--s42) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C14 | 817 | Reorder-Bestätigung blockiert; medId und reason | **REPARIERT E3** | Begrenzte Contract-Gründe; kein ungefilterter Backendfehler. Ursprünglich OPTIONAL/P3; E3: [E3-CONFIRM](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-reorder--s42) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C15 | 826 | Reorder-Bestätigung gesperrt; medId und fester Grund | **REPARIERT E3** | Technischer Launch-Lock; keine zusätzliche funktionale Reparatur nötig. Ursprünglich OPTIONAL/P3; E3: [E3-CONFIRM](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-reorder--s42) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C16 | 833 | Reorder gestartet; medId und Tag | **REPARIERT E3** | Ereignisbezug zur Medikation; Mailadresse, Name und Body werden hier nicht geloggt. Ursprünglich OPTIONAL/P3; E3: [E3-CONFIRM](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-reorder--s42) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C17 | 848 | Reorder abgebrochen; medId | **REPARIERT E3** | Lokaler Abbruchmarker; ID kann später entfallen. Ursprünglich OPTIONAL/P3; E3: [E3-CONFIRM](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-reorder--s42) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C18 | 879 | Reorder-Follow-up laden fehlgeschlagen; Tag und Fehler | **REPARIERT E2** | Roher Fehler aus loadMedicationForDay; dessen RPC-Herkunft ist nachvollzogen. E2: [R-E2-C18](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c18) lokal PASS, CR-E2 abgeschlossen. |
| F35-C19 | 905 | Follow-up blockiert; medId und reason | **REPARIERT E3** | Begrenzte Contract-Gründe wie C10/C14. Ursprünglich OPTIONAL/P3; E3: [E3-FOLLOWUP](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-followup--s43) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C20 | 915 | Follow-up gesperrt; medId | **REPARIERT E3** | Technischer Launch-Lock, kein medizinischer Inhalt. Ursprünglich OPTIONAL/P3; E3: [E3-FOLLOWUP](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-followup--s43) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C21 | 923 | Follow-up im Cooldown; medId | **REPARIERT E3** | Technischer Cooldown; Datenminimierung bei Gelegenheit. Ursprünglich OPTIONAL/P3; E3: [E3-FOLLOWUP](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-followup--s43) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C22 | 936 | Follow-up gestartet; medId, Tag und source | **REPARIERT E3** | Aktueller Voice-Aufrufer liefert ein festes technisches source-Label, keinen gesprochenen Text. Öffentliche API bei neuen Aufrufern neu prüfen. Ursprünglich OPTIONAL/P3; E3: [E3-FOLLOWUP](MIDAS%20Intake%20Diagnostics%20E3%20Medication%20Logs%20Execution%20Roadmap%20%28DONE%29.md#t-e3-followup--s43) lokal PASS, N-E3/CR-E3 erfüllt. |
| F35-C23 | 974 | Medikationsrefresh startet; Tag, Grund und force | **BEIBEHALTEN** | Operativer Refreshkontext ohne konkrete Medikamente oder Werte. |
| F35-C24 | 987 | Medikationsrefresh fertig; Tag und Anzahl | **BEIBEHALTEN** | Anzahl der geladenen Medikamente; keine Namen, Dosen oder vollständigen Datensätze. |
| F35-C25 | 995 | Medikationsrefresh fehlgeschlagen; Fehler | **REPARIERT E2** | Rohe Fehlermeldung aus dem realen RPC-Pfad; abstrakten Fehlercode loggen. E2: [R-E2-C25](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c25) lokal PASS, CR-E2 abgeschlossen. |
| F35-C26 | 1195 | Reset-Lookup-Retry; Versuch und Fehler | **REPARIERT E2** | Exportierte Modul-Reset-API; kein aktueller externer Produktaufrufer gefunden. Normaler Boot-/Timerpfad nutzt main.js:1269. Modul bei dessen Reparatur mitbereinigen, kein eigenes dringliches Paket. E2: [R-E2-C26](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c26) lokal PASS, CR-E2 abgeschlossen. |
| F35-C27 | 1220 | Reset übersprungen; Tag und existing totals | **BEIBEHALTEN** | Nur fester Hinweis auf vorhandene Summen, keine Summe im Log. Derselbe API-Zweig wie C26. |
| F35-C28 | 1223 | Reset beginnt; Tag | **BEIBEHALTEN** | Tag und technischer Startmarker; derselbe API-Zweig wie C26. |
| F35-C29 | 1231 | Reset fehlgeschlagen; Fehler | **REPARIERT E2** | Modul-API ohne gefundenen normalen Produktaufrufer. Tatsächlich verwendetes Gegenstück main.js:1305 in das Fehlerpaket aufnehmen. E2: [R-E2-C29](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c29) lokal PASS, CR-E2 abgeschlossen. |
| F35-C30 | 1314 | Äusserer fetchTodayIntakeTotals-Catch; Fehler | **BEIBEHALTEN** | Normale Ladefehler werden bereits im inneren Refresh behandelt; reales getUserId fängt Authfehler ab. Äusseren Catch nur mit künstlich werfendem Provider erreicht; bei Provideränderung neu prüfen. |
| F35-C31 | 1384 | Capture laden fehlgeschlagen; Fehler | **REPARIERT E2** | loadIntakeToday → sbSelect kann Backend-message/details liefern; Fehler wird zusätzlich über C02 und uiError ausgegeben. E2: [R-E2-C31](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c31) lokal PASS, CR-E2 abgeschlossen. |
| F35-C32 | 1418 | Wasser ungültig; raw | **BEIBEHALTEN** | Reales Feld ist type=number. Beliebigen Freitext nur im Fake-DOM nachgewiesen; keine echten erfolgreich geparsten Intakewerte in diesem Zweig. Kein neuer Browsernachweis und keine Behauptung absoluter Unerreichbarkeit. |
| F35-C33 | 1431 | Salz/Protein einzeln ungültig; kind und raw | **BEIBEHALTEN** | Keine separaten Salz-/Proteinbuttons im aktuellen UI; nur Wasser und Kombispeicherung gebunden. Exportierte API mit künstlich ergänztem Button erreichbar, kein normaler aktueller UI-Pfad. |
| F35-C34 | 1436 | Einzel-Intake geparst; kind und val | **REPARIERT E1** | Wertfreier Parse-Marker mit Intakeart; E1-WATER / E1-BROWSER-M. |
| F35-C35 | 1450 | Einzel-Intake; JSON der neuen Tagessummen | **REPARIERT E1** | Berechnungsmarker ohne Summendump; E1-WATER / E1-BROWSER-M. |
| F35-C36 | 1454 | Einzelspeicherung startet; kind und Summen | **REPARIERT E1** | Save-Start mit Intakeart ohne Summen; E1-WATER / E1-BROWSER-M. |
| F35-C37 | 1484 | Promise-Catch nach UI-Refresh; Fehler | **BEIBEHALTEN** | Aktuelles requestUiRefresh hat nur resolve, keinen Rejectpfad. Synchroner Throw landet im äusseren Save-Catch C38. Bei Promisevertragsänderung neu prüfen. |
| F35-C38 | 1497 | Einzelspeicherung fehlgeschlagen; kind und Fehlerdetails | **REPARIERT E2** | Bevorzugt e.details; API kann hier Backend-message/details trotz abstraktem e.message weiterreichen. UI-Fehlerausgabe ebenfalls berücksichtigen. E2: [R-E2-C38](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c38) lokal PASS, CR-E2 abgeschlossen. |
| F35-C39 | 1541 | Kombispeicherung; JSON der neuen Tagessummen | **REPARIERT E1** | Wertfreier Kombiberechnungsmarker; E1-COMBO / E1-BROWSER-M. |
| F35-C40 | 1545 | Kombispeicherung startet; Summen | **REPARIERT E1** | Wertfreier Kombi-Save-Startmarker; E1-COMBO / E1-BROWSER-M. |
| F35-C41 | 1576 | Promise-Catch nach Kombi-UI-Refresh; Fehler | **BEIBEHALTEN** | Wie C37 kein aktueller Rejectproduzent; synchroner Fehler würde C42 erreichen. |
| F35-C42 | 1595 | Kombispeicherung fehlgeschlagen; Fehlerdetails | **REPARIERT E2** | Wie C38 bevorzugte rohe e.details; Diagnose- und UI-Ausgabepfad gemeinsam begrenzen. E2: [R-E2-C42](MIDAS%20Intake%20Diagnostics%20E2%20Error%20Outputs%20Execution%20Roadmap%20%28DONE%29.md#r-e2-c42) lokal PASS, CR-E2 abgeschlossen. |
<!-- markdownlint-enable MD013 -->

### Korrekturen gegenüber der ursprünglichen Inventarlesart

- C27 enthält keine numerischen Summen: `existing totals` ist ein fester Text.
- C05 und C24 zählen Medikamente; nur C08 enthält einen konkreten Bestand.
- Der Reordervertrag liefert begrenzte Gründe. Medikationsname, Stärke,
  Arztadresse und Mailbody werden zwar für den fachlichen Mailto-Aufruf
  verarbeitet, aber nicht in den hier geprüften Reorderlogs ausgegeben.
- C22 erhält beim aktuellen Voice-Aufrufer eine feste Herkunftskennung,
  keinen gesprochenen Freitext. Neue API-Aufrufer könnten das ändern.
- C26–C29 liegen in einer exportierten Modul-Reset-API. Die Quellensuche fand
  keinen externen Produktaufrufer dieser vier Modulstellen. Boot und Timer
  verwenden eigene Resetfunktionen in `main.js`; das ist kein Beweis, dass
  die exportierte API unter allen denkbaren Bedingungen unerreichbar wäre.
- C30/C32/C33 wurden nur mit den unten genannten künstlichen Voraussetzungen
  erreicht; sie sind kein Beweis für einen aktuellen normalen UI-Fehler.
- C37/C41 haben im heutigen Promisevertrag keinen Rejectproduzenten. Einen
  Catchtext allein als aktuell ausgelösten Datenabfluss zu zählen wäre falsch.
- Die historischen 36 F35-Orakeltreffer sind Musterfunde, keine 36 bewiesenen
  Reparaturen. Darunter waren 24 Tageskontexttreffer; Tageslabels allein
  begründen in diesem persönlichen lokalen Betrieb keinen akuten Fix.

### Direkt verbundene Stellen ausserhalb des 42er-Inventars

Diese Quellen wurden gezielt wegen der F35-Aufrufketten geprüft. Sie sind keine
behauptete Vollprüfung sämtlicher MIDAS-Module.

1. [sbSelect](../../app/supabase/api/select.js), Zeilen 77–86: Backend-
   `message/details` gehen direkt in einen Diagnoselog und den geworfenen
   Fehler. `loadIntakeToday` verwendet diesen Reader. Eine Redaktion nur bei
   C31/C02 würde die vorgelagerte Ausgabe in Zeile 85 übrig lassen.
2. [Medikations-RPC](../../app/modules/intake-stack/medication/index.js),
   Zeilen 245–297: `callMedicationRpc` loggt rohe Fehlerdetails in Zeile 293
   und wirft sie erneut. Laden, Slot-/Batchänderungen und Bestandsbestätigung
   führen dadurch zu C06/C07/C09/C18/C25. Den vorgelagerten Log mit abdecken.
3. [Tageswechsel in main.js](../../assets/js/main.js), Zeilen 1254–1315:
   Der normale Boot-/Timerpfad erreicht seine eigene Resetimplementierung
   über `maybeRefreshForTodayChange` (Zeile 1411). Deren Retrylog in Zeile
   1269 und Endfehlerlog in Zeile 1305 übernehmen ebenfalls rohe Fehler.
   Diese beiden tatsächlich verwendeten Gegenstücke gehören ins Fehlerpaket;
   nur C26/C29 im Modul zu ändern wäre unvollständig. Keine Zusammenlegung
   der Resetimplementierungen oder Änderung ihrer fachlichen Guards nötig.
4. [Intake-API](../../app/supabase/api/intake.js): Die abstrakten
   `intake-rpc-failed`-/`intake-patch-failed`-Fehler können rohe Backendtexte
   in `.details` transportieren. C38/C42 bevorzugen genau diese Eigenschaft.
   Die historische F34-Redaktion ihrer eigenen Logs schützt andere Consumer
   nicht automatisch; Fehlerobjekt und Transport müssen dafür nicht geändert
   werden, eine begrenzte Ausgabedarstellung genügt.
5. [uiError](../../app/core/diag.js), Zeilen 303–317, und
   [saveFeedback.error](../../assets/js/ui.js), Zeilen 414–425: Ohne Fehler-DOM
   beziehungsweise ohne `statusEl` kann dieselbe rohe Meldung in
   `console.error` landen. Im aktuellen `index.html` ist kein statisches
   `errBox`/`err` vorhanden. C31 sowie die Medikations-/Savefehler dürfen bei
   einer Reparatur deshalb nicht nur bei `diag.add` redigiert werden.

Die übrigen 13 Intake-Logs stehen in Zeilen
445, 448, 991, 1226, 1280, 1407, 1456, 1488, 1509, 1547, 1586, 1648 und 1654.
Zwölf davon enthalten feste Zustände, technische Quellen oder Intakearten;
die E-Mail-Hinweise 445/448 loggen keine Adresse. Zeile 1654 ist ein defensiver
Catch mit rohem Fehlertext um `openDoctorPanel`. Der reale
[Hubprovider](../../app/modules/hub/index.js) ist jedoch `async` (Zeile 1671)
und wird dort nicht awaited: sein normaler Reject wird von diesem synchronen
Catch nicht erfasst. Unter diesem aktuellen Provider kein weiteres dringliches
Privacy-Fixziel; bei Austausch des Providers neu prüfen. Eine allfällige
allgemeine Promisebehandlung wäre separat funktional zu untersuchen.

### Was wir tatsächlich reparieren sollten

**Paket A: Gesundheitswerte aus erfolgreichen Diagnoselogs entfernen.**
C34/C35/C36/C39/C40 behalten einen wertfreien Erfolgs-/Startmarker. Intakeart,
fachliche Summenberechnung, Schreibreihenfolge, Statusfeedback und Fehlerpfade
bleiben erhalten. Keine Deaktivierung der gesamten Diagnostik nötig.

**Paket B: Fehlerausgaben auf feste, nützliche Klassen begrenzen.**
C02/C06/C07/C09/C18/C25/C31/C38/C42 sowie die oben belegten vorgelagerten
Select-/Medikationslogs, die beiden aktiven main-Resetlogs und die zugehörigen
UI-Fehlerausgaben gemeinsam behandeln. Code/Status und technische Operation
können erhalten bleiben, Backendfreitext und Objektdumps entfallen aus der
Ausgabe. Die Modulgegenstücke C26/C29 optional im selben kleinen Delta
mitbereinigen. Keine fachliche Fehlerunterdrückung, keine neuen Retries und
keine Änderung von Auth, medizinischen Daten, Payloads oder Backendverträgen.

Die 15 OPTIONAL-Stellen brauchen keinen eigenen Grossumbau. Die 13
BEIBEHALTEN-Stellen können unverändert bleiben. Bei späteren Arbeiten an
Callern, Fehlerproduzenten oder Diagnoseexporten gilt diese Entscheidung neu
zu prüfen; besonders ein künftiger Logexport würde die heutige lokale
Risikobewertung verändern.

Vor einer Reparatur vorhandene Contract-/Quellbindungen gezielt bestimmen.
Schutzassertionen nicht entfernen und Hashes nicht lediglich auf den geänderten
Text nachziehen. Sinnvoller Nachweis: synthetische Werte und Fehlerkanarien
bleiben aus allen betroffenen Ausgabesenken, während Erfolg, Fehlerstatus,
Guardverhalten und fachlicher Datenfluss erhalten bleiben. Das ist eine
Reparaturempfehlung, noch keine freigegebene Ausführungsroadmap.

### Tatsächlich ausgeführte Nachweise und Grenzen

- Statische Einzelprüfung aller 42 Stellen, der 13 übrigen Intake-Logs,
  aktueller UI-Bindings und direkter Aufruf-/Fehler-/Senkenketten.
- Lokale Node-VM-Probe mit unverändertem originalem Intakecode und originaler
  Diagnosekonfiguration, `diag` und Logger: **24 Szenarien PASS**, davon eine
  zusätzliche Probe der realen main-Resetfunktion. DOM, Auth, Uhr und
  fachliche Datenprovider waren kontrollierte Stubs mit synthetischen Daten.
- **40/42 Inventarstellen beobachtet**; C37/C41 fehlen absichtlich mangels
  Rejectpfad des aktuellen `requestUiRefresh`. Dessen Originalfunktion wurde
  separat mit kontrolliertem Scheduler ausgeführt und normal aufgelöst.
- API-/Mockgrenzen: C26–C29 wurden direkt über die exportierte Reset-API
  aufgerufen; C30 mit künstlich werfendem `getUserId`, C32 mit Fake-Number-DOM,
  C33 mit einem im echten UI fehlenden Einzelbutton. Diese Beobachtungen
  beweisen die jeweilige Verzweigung, nicht normale Produktaufrufe.
- Erfolgreiche Summen erreichten nachweislich Touchlog, Loggerhistory und
  Konsole. Nach `diag.clear()` blieben sie in der Loggerhistory erhalten.
- Der originale Medikations-RPC übernahm eine synthetische Fehlerkanarie aus
  einer im Speicher erzeugten Fehlerantwort unverändert. Die originale
  main-Resetfunktion gab eine solche Kanarie in drei Retrylogs und einem
  Endfehlerlog aus. Das sind Error-Handling-Proben, keine Backendaufrufe.
- Der originale `uiError`-Fallback gab die synthetische Kanarie ohne Fehler-DOM
  zusätzlich an die Konsole weiter. Der originale Zahlenparser wurde genutzt.
- **0 reale Netzwerkrequests, 0 Geräteaktionen, 0 echte Gesundheitsdaten**;
  kein Browser-/Androidlauf und kein Live-Daten-/Produktionsnachweis.
  Allgemeine Runtime-/SQL-/Backendtests sind für diese reine Berichtänderung
  nicht ausgeführt und werden nicht als PASS behauptet.

Nativer Abschlussreview: Inventarvollständigkeit, aktuelle Aufrufer,
Fehlerherkunft, Ausgabesenken, Single-User-Verhältnismässigkeit und Trennung
zwischen Empfehlung und ausgeführtem Fix geprüft. Die dabei gefundenen
Überbewertungen C27/C30/C37/C41 sowie die Reset-Routing-Lücke sind in diesem
Abschnitt korrigiert. Kein externer Reviewlauf. Markdown-, Link-, Encoding-,
Whitespace- und Scopeprüfung beziehen sich ausschliesslich auf diesen Bericht;
vorhandene historische Markdownlint-Befunde werden nicht als neu behoben erklärt.

Prüfbeleg: Node `v24.18.0`; Markdownlint-Engine `0.41.1` mit Standardregeln:
61 Altbefunde vor und nach der Ergänzung, **0 neue Befunde** anhand gemappter
Bestandszeilen. Alle 12 relativen Dateilinks/Selbstverweise sind aufgelöst;
der neue Sprunganker passt zur Überschrift. UTF-8 ohne BOM/Ersatzzeichen,
keine neuen Steuerzeichen, keine nachlaufenden Leerzeichen und
`git diff --check` PASS. Das historische R14-Dokument ist unterhalb des neuen
Hinweises bis auf die ergänzte Einzeltriage inhaltlich unverändert. Nur diese
Markdown-Datei ist geändert; Index und HEAD bleiben unverändert.

Gültigkeit: Diese Bewertung gilt für die genannte Gitbaseline und Intakehash
sowie die dortigen Caller-/Provider-/Senkenverträge. Bei Änderungen an diesen
Quellen gezielt revalidieren. Kein repositoryweiter Triage- oder Privacy-PASS;
weitere Module können separate Kandidaten enthalten. **F35 ist triagiert,
aber das empfohlene Reparaturpaket ist noch nicht umgesetzt.**

## Archivierungsabschluss 14.10.2026

Stephan hat nach geprüftem E3-/Rolling-Wave-Abschluss ausdrücklich die
Archivierung dieses Berichts als `(DONE)` sowie Commit und Push der gesamten
abgeschlossenen Lieferung beauftragt. Der Bericht liegt jetzt unter
`docs/archive/MIDAS Activity V2 R14 Repair Findings (DONE).md`.

Aktueller F35-Abschluss: **29 ausgewählte Kandidaten repariert**, vier weitere
E2-Logziele erledigt, **13 Kandidaten bewusst beibehalten**. Keine offenen
Reparaturen innerhalb dieser freigegebenen Dispositionen; die historische
Einordnung als OPTIONAL ist weiterhin nachvollziehbar. Der
[Gesamtabschluss](<MIDAS Intake Diagnostics Rolling Wave Roadmap (DONE).md#gesamtabschlussbelege-14102026>)
und
[E3-INTEGRATION](<MIDAS Intake Diagnostics E3 Medication Logs Execution Roadmap (DONE).md#e3-integration>)
sind die zugehörigen Ergebnisnachweise. Frühere Aussagen zu offenem F35/E2/E3
beschreiben den damaligen Triage-/Ausführungsstand; dieser Nachtrag ist aktuell.
Historische Produktionsangaben werden dadurch nicht neu bestätigt.

Relative Quellen-/Nachweislinks, beide eingehenden Dokumentlinks und der
README-Einstieg sind nachgeführt. Der direkte Contracttest liest den Archivpfad;
seine Assertions bleiben unverändert. Dieser Consumer ist mit
**E3-INTEGRATION 1/1 PASS** erneut geprüft. Die übrigen Runtime-/Browsernachweise
werden durch die reine Archivierung und den Testpfadwechsel nicht invalidiert.
ATLAS-CR-01 bleibt ein eigener offener Folgeauftrag.

Abschlussprüfungen: 193 lokale Links/Anker in zwölf Markdowndokumenten gültig;
Markdownlint mit 324 gemappten Altbefunden und **0 neuen Befunden** (einschliesslich
README und historischer Post-R14-Merkliste). UTF-8/BOM, Whitespace, exakter
Dateiumfang und Secret-Muster geprüft. Runtimequellen und übrige Testdateien
gegen den Eintritt unverändert; der Contracttest unterscheidet sich nur im
Archivpfad. Nativer Delta-/Consumer-/Abschlussreview ohne offene Findings.

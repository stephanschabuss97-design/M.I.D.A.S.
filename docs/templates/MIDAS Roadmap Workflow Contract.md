# MIDAS Roadmap Workflow Contract

Dieser stabile Vertrag definiert, wie MIDAS-Roadmaps erstellt, fortgesetzt,
reviewt und abgeschlossen werden. Aktive Roadmaps referenzieren ihn, kopieren
ihn aber nicht vollständig.

## Geltung

- Beim Erstellen einer neuen Roadmap vollständig lesen.
- Roadmap-Erstellung und initialer Contract Review erfolgen mit
  `GPT-5.6 Sol / Extra High`. Erst die spätere Ausführung verwendet die je
  Schritt festgelegte, risikobasierte Reasoning-Stufe.
- Bei einer späteren Session nur erneut lesen, wenn diese Datei seit der
  letzten Roadmap-Aufnahme geändert wurde oder ein Prozess-Finding besteht.
- Roadmap-spezifische Entscheidungen stehen ausschließlich in der jeweiligen
  Roadmap.
- Technische Nachweise stehen bei Bedarf in einer Evidence-Datei.
- Wiederverwendbare Prozessartefakte verbleiben unter `docs/templates/`.
  Aktive Roadmaps und ihre optionale Evidence liegen direkt unter `docs/` und
  werden nach erfolgreichem Abschluss mit `(DONE)` nach `docs/archive/`
  verschoben.

## Ausführungsmodus

Jede Roadmap wählt genau ein Autonomieprofil:

- `local-full`: Alle freigegebenen nichtproduktiven und reversiblen Wellen
  einschließlich geplanter read-only Reviews dürfen bis S6 ohne zusätzliche
  Gesprächspause laufen. Produktive, manuelle oder irreversible Owner-Gates
  bleiben Stopps.
- `gated`: Autonom bis zum nächsten eingetragenen Owner-Gate; danach erst nach
  Freigabe fortsetzen. Dies ist der Standard für MIDAS-Roadmaps.
- `manual`: Nur ausdrücklich freigegebene Einzelblöcke ausführen und danach
  stoppen.

Das Profil steht in Metadaten, Startkarte und Resume Card. Es ändert weder
Scope noch Reviewtiefe und hebt kein Owner-Gate auf. Eine autonome Welle besitzt
eine gemeinsame Reasoning-Stufe. Ein notwendiger Reasoning-Wechsel wird als
Wellengrenze vorab benannt; er wird nicht während eines laufenden Auftrags
vorausgesetzt.

Die eingetragene Reasoning-Stufe wird nicht still erhöht. Ist die tatsächlich
in der Oberfläche konfigurierte Stufe für den Agenten nicht maschinenlesbar,
lautet der Nachweis `NOT_OBSERVABLE`; eine behauptete Verifikation oder
automatische Korrektur ist unzulässig.

- S1, S2 und S3 werden jeweils als deterministischer Gesamtblock mit Contract
  Review und Findings-Korrektur abgeschlossen.
- Eine Roadmap darf S1 bis S3 und optional S4R als eine autonome
  `Discovery Wave` freigeben. Die Hauptschritte bleiben getrennte,
  nachvollziehbare Prüfpunkte; ihre Übergänge benötigen bei grünem internen
  Continuation Gate jedoch keine erneute Owner-Bestätigung.
- Nach jedem Hauptschritt der Discovery Wave werden Full Review,
  Findings-Korrektur, Statusmatrix und Session Resume Card abgeschlossen,
  bevor automatisch zum nächsten freigegebenen Hauptschritt übergegangen wird.
- Die Discovery Wave stoppt bei einem Owner-Gate, einem Quellenwiderspruch,
  einer fehlenden Produktentscheidung, notwendiger Scope-Ausweitung, einem
  blockierenden Finding oder wenn ein erforderlicher Nachweis nicht sicher
  erbracht werden kann.
- Bis zum grünen S4 Readiness Review wird kein Produktcode geändert; erlaubt
  sind Roadmap-, Analyse- und notwendige Vertragsdokumente.
- Ein auf Discovery begrenzter Auftrag endet mit dem Readiness-Urteil. S4
  beginnt standardmäßig erst mit dem nächsten ausdrücklich freigegebenen
  Ausführungsauftrag. Eine Startkarte darf die anschließende
  Implementierungswelle vorab freigeben; Autonomieprofil und S4R-Gates gelten
  dabei unverändert.
- S4 bleibt fachlich substepweise nachvollziehbar. Der Readiness Review gibt
  zusätzlich eine begründete Empfehlung ab, welche benachbarten Substeps als
  gemeinsamer Ausführungsblock laufen dürfen.
- Ein S4-Batch ist nur zulässig, wenn Scope und Datenwirkung kompatibel sind,
  kein Owner-Gate dazwischenliegt, die Reihenfolge eindeutig bleibt und der
  gemeinsame Review jeden enthaltenen Substep weiterhin einzeln abdeckt.
- Produktives SQL, Deploys, Workflow-Runs, Device-Installationen und andere
  irreversible oder extern sichtbare Aktionen bleiben standardmäßig getrennt,
  sofern der Readiness Review keine gleichwertig sichere Begründung liefert.
- S5 und S6 sind getrennte kohärente Abschlussblöcke. Nach vollständig
  abgeschlossenem S5 wird vor S6 erneut gemessen; ein grünes Autonomieprofil
  ersetzt dieses Usage-Gate nicht. Innerhalb von S5 erhält eine eigenständige
  Korrektur-/Retest-Welle ebenfalls ein Gate, wenn der vorherige Prüfblock
  bereits eine sichere Resume-Grenze hergestellt hat.
- Commit-Empfehlungen entstehen frühestens nach grünem S5, final nach S6.
- Statusmatrix und Session Resume Card werden nach jedem abgeschlossenen
  Haupt- oder S4-Ausführungsblock aktualisiert.

### Gate-Typen

- `Internal Continuation Gate`: Das Exit-Kriterium des Hauptschritts ist
  erfüllt, Findings sind geschlossen oder regelkonform zugeordnet und keine
  Owner-Entscheidung ist offen. Innerhalb einer freigegebenen Discovery Wave
  wird ohne Rückfrage fortgesetzt.
- `Owner Gate`: Eine fachliche Entscheidung, produktive Wirkung, externe oder
  irreversible Aktion, Scope-Ausweitung oder ausdrücklich reservierte
  Freigabe ist erforderlich. Der Agent stoppt mit einem kompakten Briefing.
- Eine erteilte Owner-Freigabe bleibt gültig, solange ihr fingerprintgebundener
  Scope, Preflight und Runtimepostimage unverändert sind. Sie wird nicht erneut
  erfragt. Eine technisch notwendige Handlung des Owners ist separat als
  `OPERATOR_ACTION_REQUIRED` mit einer exakten Anweisung zu formulieren und ist
  kein neues Approval-Gate.
- Ein Abschnittsende allein ist kein Owner-Gate. Fortschrittsmeldungen bleiben
  informativ und verlangen keine Antwort, solange kein Stop-Grund eintritt.

## Usage-aware Continuation Gates

Aktiver Governance-Vertrag seit `2026-09-13`: `guard-vnext/1`. Die durch
`.kasrkin/binding.json` exakt gebundene KASRKIN-Releaseimplementierung ist die
einzige ausführbare Detailquelle für Usage-Bands, Arbeitszulassung, Floors,
Owner Boundary, Restricted-Work-Episode, Safe Closure, LIMIT und Evidence
Reuse. Diese MIDAS-Datei besitzt den projektspezifischen Vertrag dafür, wann
KASRKIN konsultiert wird und wie zugelassene Arbeit atomar ausgeführt,
beweisbar geschlossen oder zurückgerollt wird. Die nachstehenden Regeln sind
die menschenlesbare MIDAS-Konsultationsprojektion, keine zweite unabhängige
Policy. Bei einem Widerspruch zu Binding, Release, Config, Schemas oder
Policyausgabe gilt `CONTRACT_DRIFT`: keine neue Arbeit beginnen.

`AGENTS.md` erzwingt den Einstieg; `docs/DEV_ENVIRONMENT.md` besitzt Sensor-,
Validator- und Bedienverträge. `.kasrkin/activation.json` bindet Release und
Consumerprojektion per Fingerprint. W7 hat die frühere lokale Implementierung
nach bewiesenem Cutover retiret; Recovery verwendet die gebundene Installation,
die bewiesene `codex-tools`-Source und versionierte Receipts. Keine dieser
Quellen führt selbst Tools, Dateiänderungen oder Produktaktionen aus.

Die lokale Codex-Usage-Telemetrie begrenzt, ob ein neuer Arbeitsblock sicher
begonnen werden darf. Sie garantiert nicht, dass ein laufender Block ohne
Quota-Ende fertig wird. Diese Sicherheit entsteht weiterhin durch kleine,
kohärente Blöcke, klare Postconditions, gezielte Checks und einen aktuellen
Resume-Stand. Sensor, State-Pfad und Freshness-Vertrag stehen in
`docs/DEV_ENVIRONMENT.md`.

### Position und Reihenfolge

Ein Usage-Gate ist verpflichtend:

- vor dem ersten Hauptblock einer neuen oder fortgesetzten Roadmap-Session,
- nach jedem abgeschlossenen Discovery-Hauptschritt vor dem nächsten,
- nach S4R vor dem ersten S4-Ausführungsblock,
- nach jedem kohärenten S4-Ausführungsblock vor dem nächsten,
- vor S5,
- nach vollständig abgeschlossenem S5 vor S6,
- innerhalb von S5 vor einer getrennten Korrektur-/Retest-Welle, sofern der
  vorherige Prüfblock bereits abgeschlossen und sicher resumierbar ist.

Vor dem Gate wird der aktuelle Block regulär abgeschlossen: Postconditions und
invalidierte Checks ausführen, Findings zuordnen sowie Statusmatrix und Resume
Card synchronisieren. Danach wird genau einmal frisch gemessen und erst dann
über den nächsten Block entschieden. Während eines laufenden atomaren Blocks
wird nicht gepollt und nicht allein wegen eines sinkenden Usage-Werts
abgebrochen.

Die Entscheidungsfolge ist deterministisch:

1. Sensor unmittelbar vor der Entscheidung refreshen.
2. State mit dem kanonischen Validator aus `docs/DEV_ENVIRONMENT.md` prüfen;
   keine ad-hoc Neuinterpretation des rohen JSON.
3. Beide Fenster mit dem letzten realen Checkpoint der aktiven Roadmap
   vergleichen, sofern die jeweilige Resetidentität gleich ist.
4. Resetwechsel oder Messanpassungen behandeln und erst danach den Verbrauch
   bestimmen.
5. Statische Schwellen und vorhandene empirische Blockreserve anwenden.
6. Entscheidung kompakt in aktiver Roadmap und Resume Card festhalten.
7. Nur bei zulässiger Entscheidung den nächsten Block beginnen.

Wird nach einem Usage-Gate auf eine Owner-Freigabe gewartet und ist die Messung
bei Erteilung älter als zwei Minuten, muss sie unmittelbar vor der produktiven
oder extern sichtbaren Fortsetzung wiederholt werden. Usage ersetzt dabei nie
das Owner-Gate, Preimage, Reverse, Postcheck oder andere Sicherheitsverträge.

### Fenster, Deltas und Resets

5h- und Wochenfenster sind gleichwertige Pflichtsignale. Der Verbrauch eines
Blocks wird je Fenster als `remaining_vorher - remaining_nachher` erfasst, aber
nur wenn beide Messungen dieselbe `resetAtEpoch` besitzen.

- Ändert sich `resetAtEpoch`, lautet das Ereignis `RESET_CROSSED`. Es wird kein
  Delta über die Resetgrenze berechnet; die neue Messung ist die Baseline für
  den nächsten Block.
- Steigt `remaining` trotz identischer `resetAtEpoch`, wird dies als
  `ADJUSTMENT` protokolliert, nicht als negativer Verbrauch. Die aktuelle
  Messung ersetzt die Baseline.
- Resetzeit oder Reset-Credits sind Kontext, aber kein zusätzliches Budget.
- Prozentwerte und Deltas werden nicht aus Chatmeldungen, Rainmeter-Anzeige
  oder früheren Erinnerungswerten rekonstruiert.

### Usage-Entscheidungsklassen

`SAFE_CLOSURE` hat Vorrang vor `CONTINUE_WITH_CAUTION`; diese wiederum vor
`CONTINUE`. Diese drei Klassen beschreiben ausschließlich den Budgetzustand.
Empirische Reserve und Owner Boundary entscheiden anschließend separat über
die Zulassung des konkreten Primärblocks.

<!-- markdownlint-disable MD013 -->

| Entscheidung | Messlage | Erlaubte Folge |
| --- | --- | --- |
| `CONTINUE` | 5h `> 40 %` und Woche `> 20 %` | Primärblockzulassung anhand Klasse, Reserve und Gates bestimmen |
| `CONTINUE_WITH_CAUTION` | 5h `25-40 %` oder Woche `10-20 %`, ohne Safe-Closure-Grund | höchstens einen kurzen, lokalen, reversiblen und ausdrücklich resumierbaren bounded Arbeitsblock dieser Restricted-Work-Episode zulassen; danach erneut messen |
| `SAFE_CLOSURE` | 5h `< 25 %` oder Woche `< 10 %`; State fehlt oder ist partial/failed/stale | keinen neuen Haupt- oder Ausführungsblock beginnen; sicheren Handoff herstellen |

<!-- markdownlint-enable MD013 -->

Die Grenzen sind inklusiv: exakt `25 %` im 5h-Fenster oder `10 %` im
Wochenfenster ist Caution, exakt `40 %` beziehungsweise `20 %` noch nicht
Continue. Der technische Sensorstatus `OK` ist keine dieser Entscheidungen.
Der kanonische Validator prüft und verdichtet den Telemetriestate.
`PRIMARY_OWNER_BOUNDARY_ALLOWED` ist keine Validatorausgabe, sondern eine in
der Roadmap protokollierte Arbeitszulassung auf Basis der validierten Messung,
der Reserveformel, der Fingerprints und der Owner-Annahme.

### Empirische Blockreserve

Sobald reale Vergleichswerte derselben Roadmap vorliegen, verwendet S4R für
jeden Bucket den höchsten beobachteten Verbrauch eines fachlich und operativ
vergleichbaren vollständigen Blocks, multipliziert mit `1,5`, als bevorzugte
Startreserve. Mittelwerte und erfundene Schätzwerte sind verboten. Der
Vergleich muss Resetgrenzen respektieren; ein abgeschlossener Block darf als
historischer Kostenwert über Resetzyklen hinweg verwendet werden, sein Delta
darf aber nicht über eine Resetgrenze rekonstruiert werden.

Die Reserve beschreibt ausschließlich den noch ausstehenden Arbeitsblock samt
seinen noch offenen Postconditions. Bereits abgeschlossene Session-
Rehydration ist `SUNK_USAGE`: Sie ist im aktuellen Restwert enthalten und darf
nicht nochmals als zukünftiger Bedarf auf Blockverbrauch oder Closure-Reserve
aufgeschlagen werden. Müssen nach dem Gate wegen Invalidation weitere Quellen
gelesen oder Preflights erneuert werden, zählen nur diese noch offenen Arbeiten
zum Primärblock.

Die empirische Reserve besitzt zwei getrennte Mindestgrenzen. Der
`OPERATIONAL_SAFETY_FLOOR` ist je Bucket:

`höchster beobachteter vergleichbarer vollständiger Blockverbrauch bis zur`
`bewiesenen sicheren Produkt- oder Rollbackpostcondition`
`+ ein Prozentpunkt Sensorauflösung`

Der `AUTONOMOUS_FULL_CLOSURE_FLOOR` ist je Bucket:

`OPERATIONAL_SAFETY_FLOOR`
`+ höchste vergleichbare echte CLOSURE_ONLY-Kosten, soweit diese nicht bereits`
`im vollständigen Blockreceipt enthalten sind`

Die `25 %`-/`10 %`-Safe-Closure-Schwellen sind Zustandsgrenzen und keine
Kostenwerte. Sie werden niemals als pauschale Closure-Kosten addiert. Als
`CLOSURE_ONLY` zählen ausschließlich notwendige Postchecks, Roadmap-/Evidence-
und Resume-Sync sowie der sichere Handoff nach dem Primärblock. Eine spätere
Ursachenanalyse, Reparatur, erneute Fullmatrix oder ein neuer Review sind neue
Blöcke und dürfen keinen Floor des vorherigen Blocks erhöhen. Enthält ein
vollständiger Cost Receipt die Closure bereits nachweislich, wird sie nicht ein
zweites Mal addiert. Ein für den Operational Safety Floor verwendetes Receipt
muss mindestens die sichere Runtime-, Daten- und Rollbackpostcondition sowie
einen minimalen operationalen Postimage-/Resume-Fakt enthalten. Fehlt dies,
ist es kein zulässiges Operational-Receipt.

Der zusätzliche Prozentpunkt je Bucket schützt gegen die ganzzahlige
Sensorauflösung. Er ist kein allgemeiner Sicherheitsmultiplikator. Fehlt eine
vergleichbare Closure-Messung und enthält auch der vollständige
Vergleichsblock keine Closure, ist nur der Autonomous Full-Closure Floor nicht
vollständig empirisch belegt. Die Roadmap muss dies als Forecast ausweisen;
eine Owner Boundary bleibt nur bei belastbarem Operational Safety Floor
verfügbar.

Keiner der Floors ersetzt das für die Arbeitsklasse vorgeschriebene
Usage-Band. Die effektive Operational- beziehungsweise Full-Closure-Grenze ist
je Bucket der strengere Wert aus dem jeweiligen empirischen Floor und dem
kleinsten ganzzahligen Sensorwert, der das erforderliche Band erfüllt. Für
einen Boundary-Pfad im Band `CONTINUE` sind das bei den aktuellen Schwellen
mindestens `41 %` im 5h- und `21 %` im Wochenfenster. Roadmap und Briefing
weisen beide empirischen und effektiven Floors getrennt aus.

Liegt die Messung unter dem belastbar ermittelten effektiven Operational Safety
Floor, gilt für den geplanten Primärblock `PRIMARY_REJECTED_FOR_RESERVE`; eine
Owner Boundary kann das nicht überstimmen. Das Usage-Band bleibt davon
getrennt und kann höchstens eine unabhängige sichere Restarbeit zulassen.
Liegt die Messung mindestens auf dem effektiven Operational Safety Floor, aber
unter dem effektiven Autonomous Full-Closure Floor, kann der Owner den
unmittelbaren Start über `PRIMARY_OWNER_BOUNDARY_ALLOWED` akzeptieren. Damit
übernimmt er ausschließlich das Risiko, dass die umfassende administrative
Closure in einen späteren Block fällt; die sichere operative Postcondition
bleibt zwingend Teil des gestarteten Blocks.

Die bevorzugte Reserve bleibt der höhere Wert aus `1,5 x` vollständigem
Vergleichsblock und Autonomous Full-Closure Floor. Bruchteile werden erst nach
der Berechnung je Bucket auf den nächsten ganzen Prozentpunkt aufgerundet.
Überschreitet der rohe Preferred-Wert die physische Bucketkapazität, wird er als
`PREFERRED_UNATTAINABLE` dokumentiert.
Er bleibt ein konservatives Signal, wird nicht still auf `100 %` umgedeutet
und darf keinen erreichbaren Floor ersetzen oder einen Start sperren, der den
Full-Closure- beziehungsweise Owner-Boundary-Vertrag erfüllt.

### Machbarkeitsinvariante

Der Operational Safety Floor muss mit dem verfügbaren Bucket und dem
vorgeschriebenen Post-Rehydration-Gate grundsätzlich erreichbar sein. Ist er
rechnerisch größer als die Bucketkapazität oder durch seinen eigenen
Pflichtprozess nachweislich nicht erreichbar, lautet das Vertragsfinding
`POLICY_INFEASIBLE`. Der Agent
wartet dann nicht auf eine identische unmögliche Messlage und fordert nicht
wiederholt dasselbe Gate an. Vor weiterer Primärarbeit müssen Kostenklassen,
Closure-Zuordnung oder Blockschnitt korrigiert und erneut reviewed werden.

Liegt eine frische Messung im Band `CONTINUE` mindestens auf dem effektiven
Operational Safety Floor, aber unter dem effektiven Autonomous Full-Closure
Floor, darf der Primärblock einmalig als
`PRIMARY_OWNER_BOUNDARY_ALLOWED` zugelassen werden. Diese
Arbeitszulassung entspricht dem historischen Namen
`CONTINUE_OWNER_BOUNDARY`. Dafür müssen alle folgenden Bedingungen erfüllt
sein:

1. Der nächste Block ist exakt benannt, atomar, bounded und mit einem realen
   vollständigen Vergleichsblock belastbar vergleichbar.
2. Scope, Releasequellen, Preflight und Rollback sind fingerprintgebunden und
   seit dem Vergleich beziehungsweise letzten Nachweis unverändert oder
   gezielt neu validiert.
3. Es handelt sich nicht um Discovery, ungebundene Diagnose, integriertes
   Review oder einen erstmalig ausgeführten Block unbekannter Größe.
4. Alle Produkt-, Security-, Daten-, Deploy-, SQL-, Device- und sonstigen
   Owner-Gates sind unabhängig davon erfüllt.
5. Der Agent nennt Preferred-Wert samt Erreichbarkeit, Operational Safety
   Floor, Autonomous Full-Closure Floor, beide effektiven Grenzen, aktuelle
   Messung und das konkrete reine Closure-Risiko genau einmal. Der Owner
   akzeptiert danach den unmittelbaren Start ausdrücklich.

Die Annahme wird als fingerprintgebundene Einmalentscheidung protokolliert.
Eine direkte Owner-Antwort wird nicht durch eine zweite identische
Usage-Abfrage oder wiederholte Ablehnungsdiskussion entwertet. Erst eine
nicht unmittelbare Wiederaufnahme, Scope-/Fingerprint-/Runtimeänderung oder
ein neues Finding invalidiert sie und verlangt ein neues Gate. Der Boundary-
Pfad schwächt niemals die operative Mindestreserve oder andere
Sicherheitsgates. Er darf nur die umfassende administrative Closure vertagen.

Liegt die Messung mindestens auf dem effektiven Autonomous Full-Closure Floor
und sind alle übrigen Gates erfüllt, ist `PRIMARY_ALLOWED` verfügbar. Der
höhere Preferred-Wert bleibt auch dann rein advisory und verlangt weder eine
Owner Boundary noch weiteres Warten.

Fehlen vergleichbare Messungen, wird keine numerische Reserve erfunden und
`PRIMARY_OWNER_BOUNDARY_ALLOWED` ist nicht verfügbar. Dann
entscheiden statische Schwellen zusammen mit S4R-Größenklasse,
Reversibilität, Resumierbarkeit und realer Blockform. Ein großer oder nicht
sicher resumierbarer Block darf unter Caution nicht begonnen werden.

### Arbeitszulassung und sichere Restarbeit

Die Usage-Entscheidung beschreibt den Budgetzustand. Sie ist nicht identisch
mit der Zulassung eines konkreten Arbeitsblocks. Jede Roadmap hält deshalb
zusätzlich fest:

- `PRIMARY_ALLOWED`: Der geplante Primärblock passt zum Usage-, Reserve- und
  Sicherheitsvertrag.
- `PRIMARY_OWNER_BOUNDARY_ALLOWED`: Der unveränderte Primärblock ist über den
  engen `CONTINUE_OWNER_BOUNDARY`-Vertrag zugelassen.
- `PRIMARY_REJECTED_FOR_RESERVE`: Der Primärblock bleibt vollständig gesperrt;
  höchstens sichere unabhängige Restarbeit darf geprüft werden.
- `PRIMARY_REJECTED_FOR_CONTRACT`: Ein fachlicher, Security-, Daten-, Owner-
  oder sonstiger Stop-Vertrag sperrt Primärblock und Restarbeit, soweit der
  konkrete Stop nicht ausschließlich `CLOSURE_ONLY` erlaubt.

Ein abgelehnter Primärblock darf niemals künstlich in kleinere Teile zerlegt
werden. Insbesondere bleiben `DIAGNOSTIC_UNBOUNDED`, `INTEGRATED_REVIEW` und
`PRODUCTIVE_CUTOVER` als Ganzes gesperrt, wenn ihre Zulassung fehlt.

Aktive Blockklassen:

- `BOUNDED_DOCUMENTATION`: bekannte Dokumente, enger Delta-Scope, bekannte
  günstige Checks und klare Postcondition,
- `BOUNDED_LOCAL`: bekannte Dateien, Änderung, Toolklassen, Checks,
  Reversibilität, Stop-Grenze und Postcondition,
- `DISCOVERY_BOUNDED`: bekannte konkrete Frage und begrenzte Quellen; derzeit
  keine automatisch zulässige Restarbeitsklasse,
- `DIAGNOSTIC_UNBOUNDED`: Ursache, Lösung oder Toolbreite unbekannt,
- `INTEGRATED_REVIEW`: vollständige Test-/Browser-/Reviewwelle,
- `PRODUCTIVE_CUTOVER`: externe Wirkung samt Postchecks und möglichem Rollback,
- `CLOSURE_ONLY`: ausschließlich Evidence, Status, Context Receipt, Resume
  Card und Handoff ohne neue Produktarbeit.

Eine Diagnose darf nur als `BOUNDED_LOCAL` gelten, wenn Frage, erwarteter
Codepfad, erlaubte Dateien und Tools, datenschutzsichere Marker, Abschlusschecks
und Stopbedingung vor Beginn vollständig bekannt sind. „Ursache finden“ bleibt
`DIAGNOSTIC_UNBOUNDED`. Reproduktion, Fix, Last-Mile-Harness, Fullmatrix und
Abschlussreview sind bei lokal sicherem Zwischenstand getrennte kohärente
Blöcke; gemeinsame Evidence allein macht sie nicht atomar.

Bei `PRIMARY_REJECTED_FOR_RESERVE` ist höchstens ein bereits dokumentierter
Fallback der Klassen `BOUNDED_DOCUMENTATION` oder `BOUNDED_LOCAL` zulässig.
Der Kandidat muss vor Beginn einen eigenen Zweck, erlaubte Dateien und Tools,
verbotene Primary-Flächen, Abschlusschecks und eine sichere Postcondition
besitzen. Er darf den Primärblock weder teilweise ausführen noch seine gültigen
Fingerprints, Preflights, Test-/Review-Evidence oder Rollbackbereitschaft
invalidieren. Wäre eine Invalidation unvermeidbar, muss ihre vollständige
Revalidierung selbst im bounded Fallback enthalten und reserveseitig gedeckt
sein; andernfalls gilt `CLOSURE_ONLY`.

Die Suche nach Restarbeit ist selbst bounded. Sie darf ausschließlich Resume
Card, Statusmatrix, bereits offene bounded Findings, dokumentierte Follow-ups,
Evidence-/Doku-Lücken und die bestehende Invalidation Map prüfen. Sie startet
keine breite Repo-Suche, neue Architekturplanung oder offene Diagnose. Ist dort
kein eindeutiger Kandidat vorhanden, gilt `CLOSURE_ONLY`.

Existieren mehrere gültige Kandidaten, hat notwendige Closure immer Vorrang.
Danach werden ausschließlich solche Fallbacks bevorzugt, die den nächsten
Einstieg nachweisbar günstiger oder sicherer machen: zuerst Context-/Postimage-
Pflege, dann bereits identifiziertes bounded Hardening, erforderlicher Doku-
Sync und zuletzt sonstige vorbereitende Arbeit. Usage nur zu verbrauchen ist
kein fachlicher Nutzen; die Closure Reserve bleibt unberührt.

Eine `RESTRICTED_WORK_EPISODE` gilt, sobald das Usage-Band
`CONTINUE_WITH_CAUTION` lautet oder der Primärblock als
`PRIMARY_REJECTED_FOR_RESERVE` abgelehnt wird. Pro Episode darf höchstens ein
neuer bounded Arbeitsblock beginnen, unabhängig davon, ob er der geplante
Primärblock oder ein Fallback ist. Die aktive Roadmap speichert dafür Grund,
beide Resetidentitäten und `AVAILABLE` oder `CONSUMED`.

Nach Verbrauch der Episode ist bis zu einer neuen Episode nur `CLOSURE_ONLY`
zulässig. Eine neue Episode beginnt erst nach `RESET_CROSSED`, validiertem
`ADJUSTMENT` oder `CONTINUE` zusammen mit `PRIMARY_ALLOWED`. Der Zustand wird
nicht aus dem Chatverlauf geschätzt.

Verliert ein Fallback während der Ausführung seine Boundedness, gilt
`BOUNDEDNESS_BREACH`: Scope und Toolbreite nicht erweitern, sicheren lokalen
Stand herstellen, Finding und Invalidation dokumentieren, soweit sicher
synchronisieren und stoppen. „Bereits begonnen“ ist keine Erlaubnis zur
Fortsetzung.

Ein Gate reserviert keine Quota. Große, integrierte oder produktive Blöcke
setzen voraus, dass während ihrer Ausführung kein weiterer materieller
Codex-Workload desselben Kontingents parallel gestartet wird. Eine spätere
Extension darf dazu höchstens advisory warnen.

Meldet der kanonische Validator `LIMIT` oder `0 %`, gilt nach Erhalt dieses
Ergebnisses `FINAL_RESPONSE_ONLY`: keine neue Arbeit, kein neuer Toolaufruf und
keine Restarbeit. Eine möglicherweise noch zustellbare Abschlussantwort ist
keine planbare Closure Reserve.

### Safe Closure und Dokumentation

Safe Closure ist kein Rollback und kein Fehlerstatus für bereits korrekt
abgeschlossene Arbeit. Sie bewahrt den letzten kohärenten lokalen Stand und
macht die Fortsetzung eindeutig:

1. keinen neuen Haupt- oder Ausführungsblock beginnen,
2. da reguläre Usage-Gates an sicheren Blockgrenzen liegen, ist der vorherige
   Block bereits abgeschlossen; ausnahmsweise noch offene notwendige
   Postconditions eines begonnenen atomaren Blocks werden ausschließlich
   fertiggestellt,
3. Statusmatrix, Findings, relevante Checks und geänderte Dateien
   synchronisieren,
4. Resume Card mit letzter Usage-Entscheidung und genau einem nächsten Gate
   ersetzen,
5. Roadmap als `PAUSED_USAGE_SAFE_CLOSURE` kennzeichnen; weder `DONE` noch
   unbewiesene PASS-Ergebnisse setzen und nicht archivieren.

Die aktive Roadmap führt eine kompakte Checkpoint-Tabelle mit real gemessenen
5h-/Wochenwerten, Resetidentitäten, gültigen Deltas und der Entscheidung. Sie
enthält keine vollständigen JSON-Snapshots. Die Resume Card enthält nur den
letzten Checkpoint und die aktuelle Entscheidung; sie ist kein chronologisches
Usage-Protokoll.

### Finale Abschlussmessung

Eine optionale Messung nach vollständig erfüllten S6-Postconditions und
unmittelbar vor dem rein deterministischen Verschieben in `docs/archive/` ist
kein Continuation Gate, weil sie keinen neuen Arbeitsblock freigibt. Sie wird
als `FINAL_OBSERVATION` protokolliert und darf einen durch das letzte reguläre
Gate vollständig bewiesenen `DONE`-Stand nicht nachträglich in Safe Closure
zurückstufen. Ist der Sensor dabei nicht valide, lautet das Ereignis
`FINAL_OBSERVATION_UNAVAILABLE`; die bereits bewiesene Archivierung bleibt
zulässig.

Diese Ausnahme gilt ausschließlich, wenn keine Code-, Test-, Review-, Doku-,
Runtime- oder Owner-Aktion mehr offen ist. Bleibt irgendeine inhaltliche
Arbeit übrig, ist die Messung ein normales Continuation Gate und die
Safe-Closure-Regel gilt unverändert. Eine Final Observation darf niemals neue
Arbeit autorisieren oder fehlende Nachweise ersetzen.

## Chat- und Kontextvertrag

- Ein langfristiger MIDAS-Denkraum darf für Vision, Brainstorming,
  Trade-offs und Roadmap-Erstellung bestehen bleiben.
- Jede Roadmap wird grundsätzlich in einem eigenen Ausführungs-Chat
  umgesetzt. Damit bleibt der aktive Kontext auf einen kohärenten Auftrag
  begrenzt.
- Der Denkraum ist kein Ausführungsnachweis und keine Source of Truth.
  Verbindliche Entscheidungen müssen vor Beginn der Umsetzung in Roadmap,
  Decision Log oder Produktdokumentation stehen.
- Jede Roadmap enthält eine kompakte Ausführungs-Chat-Startkarte. Sie benennt
  Referenzreihenfolge, Startschritt, Modell, Reasoning-Standard,
  Abweichungsknoten, Owner-Gates und Stop-Bedingungen.
- Der initiale Contract Review enthält einen Fresh-Chat-Test: Ziel,
  Entscheidungen, Referenzen, Autonomie, Gates und nächster Schritt müssen
  allein aus Roadmap und verlinkten Sources of Truth eindeutig hervorgehen.
  Eine notwendige Information, die nur im Denkraum steht, ist ein
  Contract-Finding.
- Ein frischer Ausführungs-Chat liest die angegebenen Quellen selbst. Der
  Owner muss weder die Projektgeschichte neu erzählen noch lange Dokumente in
  den Startprompt kopieren.
- Fehlt ein notwendiger Vertrag oder widersprechen sich Quellen, wird nicht
  geraten. Der Widerspruch wird als Finding dokumentiert und bei
  sicherheits-, daten- oder produktrelevanter Wirkung blockiert.
- Eine neue Follow-up-Roadmap erhält einen neuen Ausführungs-Chat. Kleine,
  vertragstreue Korrekturen innerhalb derselben Roadmap bleiben im bestehenden
  Ausführungs-Chat.
- Lange Chatverläufe, vollständige Logs und unnötige Toolausgaben werden
  vermieden. Entscheidungen, relevante Fehler und Postconditions bleiben
  erhalten; Rauschen wird lokal abgelegt oder kompakt zusammengefasst.
- Nur für den aktuellen Schritt benötigte MCP-Server, Plugins und externe
  Quellen werden aktiv verwendet.

Prompt Caching kann den Verbrauch beeinflussen, ist aber kein garantierter
MIDAS-Vertrag. Weder die Korrektheit der Umsetzung noch die Wahl notwendiger
Reasoning-Stufen darf von vermuteten Cache-Laufzeiten oder Cache Hits abhängen.

## Scope-Freeze und spätere Grundsatzänderungen

Vor dem grünen S4 Readiness Review sind ausdrücklich festzulegen:

- welche bestehenden Features erhalten oder entfernt werden,
- ob Datenmodell, Lifecycle oder Retention verändert werden,
- ob Cleanup, Scheduler, Secrets oder externe Automationen betroffen sind,
- welche Producer und Consumer kompatibel bleiben müssen.

Sind Secrets, Scheduler, Workflows, Edge Functions oder produktive Auth-Pfade
betroffen, erstellt S4R vor der Blockfreigabe eine Secret-Readiness-Matrix nach
`docs/DEV_ENVIRONMENT.md`. Sie dokumentiert ausschließlich Namen, Consumer,
kanonischen Speicherort, lokale Erforderlichkeit und Owner-Gate. Secret-Werte
bleiben außerhalb von Roadmap, Evidence, Logs und Antworten. Jeder freigegebene
Cutoverblock muss seine benötigten Secrets bereits an den vorgesehenen
Speicherorten vorfinden; eine pauschale lokale Spiegelung aller Remote-Secrets
ist kein zulässiger Ersatz für Readiness.

Eine offene Grundsatzfrage blockiert S4. Ändert sich der Produktvertrag nach
S4R dennoch:

1. Umsetzung an der betroffenen Grenze pausieren.
2. Änderung als kleine Scope-Korrektur oder eigenständigen,
   supersedierenden Scope klassifizieren.
3. Bei kleiner Korrektur nur betroffene Teile von S2, S3 und S4R aktualisieren.
4. Bei eigenständigem R3-Scope eine Follow-up-Roadmap erstellen und die
   Abhängigkeit zur pausierten Roadmap festhalten.
5. Gekoppelte Roadmaps verwenden eine gemeinsame Evidence, sofern dieselben
   produktiven Gates, Runtime-Versionen oder Postconditions belegt werden.

Keine Roadmap dupliziert Nachweise nur, weil sich der Produktentscheid auf zwei
Arbeitsverträge verteilt. Die Metadaten benennen genau eine Roadmap als
Evidence-Owner; gekoppelte Roadmaps referenzieren ihre IDs und ändern die
Evidence nicht parallel.

## Session-Rehydration

Bei Fortsetzung in einem neuen Chat wird in dieser Reihenfolge gelesen:

1. Ausführungs-Chat-Startkarte, Roadmap-Metadaten und Session Resume Card.
2. Context Receipt.
3. Entscheidungslog und Findings.
4. Nur der aktuelle Schritt samt Exit-Kriterium.
5. `git status --short` und der relevante Diff.
6. Nur Referenzen, die der aktuelle Schritt oder ein Finding benötigt.

Das erste kanonische Usage-Gate nach dieser Lesewelle wird als
`POST_REHYDRATION_BASELINE` behandelt. Sein Restwert ist die reale verfügbare
Nettokapazität für den nächsten Block. Rehydrationsverbrauch wird nur dann als
exaktes Delta ausgewiesen, wenn unmittelbar davor ein kanonischer Checkpoint
mit identischen Reset-IDs existiert. Ohne diese Vorhermessung wird weder ein
Stand von `100 %` angenommen noch ein Delta erfunden.

Die Rehydration bleibt bei der Planung eines noch nicht begonnenen neuen Chats
Teil des Gesamtforecasts. Sobald sie beim Wiedereinstieg abgeschlossen ist,
wechselt sie jedoch von prognostizierter Arbeit zu `SUNK_USAGE` und darf die
Zulassung des folgenden Blocks nicht ein zweites Mal belasten. Der aktuelle
Restwert sowie der für den verbleibenden Block geltende Operational Safety
Floor und Autonomous Full-Closure Floor entscheiden weiterhin unverändert.

Bei großen Quellen wird zuerst nach dem relevanten Symbol, Abschnitt,
Producer oder Consumer gesucht und anschließend nur der zur aktuellen
Vertragsfrage nötige Bereich gelesen. Pauschale Vollreads, wiederholte große
Suchausgaben und identische Quellenausschnitte ohne Invalidation sind zu
vermeiden. Bei Unsicherheit, fehlendem Treffer oder einer Exact-Source-Pflicht
wird die autoritative Quelle ausreichend breit gelesen.

Der Context Receipt wird in S1 angelegt und enthält kompakt:

- Baseline-Commit und relevante Dirty Files,
- die für den Scope gelesenen Sources of Truth samt Stand oder Fingerprint,
- gültige Evidence-/Test-IDs und ihre Invalidation-Bedingungen,
- relevante Tool-, Runtime- und Auth-Verfügbarkeit ohne Secretmaterial.

Für eine große, stabile und tatsächlich wiederverwendete Source darf der
Context Receipt zusätzlich enthalten:

- Source und exakten Fingerprint,
- validierenden Schritt beziehungsweise Evidence-ID,
- wiederverwendbare Aussagen,
- Invalidation Trigger,
- Fragen, für die das Original zwingend gelesen werden muss.

Dieser Eintrag ist nur ein abgeleiteter Cache. `REUSE_VALIDATED_CONTEXT` ist
zulässig, wenn Source und Fingerprint exakt stimmen, die aktuelle Frage
vollständig abgedeckt ist und weder Finding, Invalidation noch
Exact-Source-Pflicht vorliegt. In allen anderen Fällen gilt `READ_ORIGINAL`.
`AGENTS.md`, Root-`README.md`, aktive Roadmap, Resume Card, Findings, aktueller
Diff, Dirty Boundary, geänderte Codeflächen und produktive Owner-Gates werden
immer live gelesen.

Nach einem Ausführungsblock wird nur ein tatsächlich geänderter Receipt-Eintrag
ersetzt. Stimmt die Baseline nicht mehr, wurde eine relevante Datei geändert,
ist ein Quellen-Fingerprint veraltet oder trat eine Invalidation-Bedingung ein,
wird der betroffene Kontext gezielt rehydriert. Der Receipt ist weder
chronologisches Protokoll noch Ersatz für Roadmap, Evidence oder Git.

Ein breiter Re-Read der jeweils relevanten Quellen ist nur erforderlich:

- beim initialen S1, soweit kein gültiger fingerprintgebundener Receipt die
  konkrete Frage vollständig abdeckt,
- im S4 Readiness Review, soweit S1-S3 betroffen sind,
- bei einem Contract-Finding mit unklarer Herkunft.

Vollständige Toolausgaben werden bei Bedarf in temporäre lokale Logs
geschrieben. In Roadmap, Evidence und Chat gehören nur entscheidungsrelevante
Fehler, Zähler, Versionen, Hashes und Postconditions. Ein Terminaltranskript ist
kein zusätzlicher Nachweis.

S6 liest die vertragsrelevanten Roadmap-Abschnitte, Findings, Evidence,
geänderten Dateien und betroffenen Source-of-Truth-Dokus erneut. Historische
Ergebnisprotokolle werden nur bei einem Widerspruch vollständig gelesen.

Der Session-Handoff:

- bleibt unter ungefähr 35 Zeilen,
- wird nach jedem Hauptschritt, jedem S4-Ausführungsblock und vor Pausen
  ersetzt,
- enthält nur gültigen Iststand, nächste Aktion, Findings, Nachweise und Gates,
- wird nicht als chronologisches Arbeitsprotokoll verwendet.

## Evidence-Vertrag

Eine separate Datei nach
`docs/templates/MIDAS Roadmap Evidence Template.md` ist verpflichtend bei:

- produktivem SQL mit Schreib- oder Löschwirkung,
- Migration, RLS-, ACL-, Rollen- oder Cron-Änderung,
- mehreren Deploys oder Remote-Runtime-Gates,
- Concurrency-, Lock- oder Rollback-Nachweisen,
- umfangreichen Vorher-/Nachher-Zählern.

Für ein eng gekoppeltes Änderungsprogramm gilt grundsätzlich eine
Evidence-Datei. Weitere Roadmaps referenzieren deren IDs und ergänzen nur neue,
nicht bereits belegte Gates.

Die Roadmap enthält dann nur:

- Evidence-ID,
- Ergebnis,
- Restrisiko,
- Verweis auf das betreffende Gate.

Query-Ausgaben, Logs und große Testmatrizen werden nicht in Roadmap, Handoff,
QA und Evidence gleichzeitig dupliziert.

Evidence wird nur gelesen:

- am betroffenen Gate,
- wenn ein Finding den Nachweis berührt,
- im S5-/S6-Abschlussreview.

## Größen- und Duplikationsgrenzen

- Roadmap-Handoff: ungefähr 35 Zeilen.
- Ergebnis je Substep: höchstens sechs Kernpunkte.
- Dieselbe Tatsache besitzt genau einen ausführlichen Ort.
- Unpassende Template-Abschnitte werden gestrichen oder knapp als
  `nicht relevant` markiert.
- Ungefähr 80 KB oder 1.200 Zeilen sind ein Prüfpunkt, kein hartes Limit. Ab
  dort wird kontrolliert, ob echte Duplikate, abgeschlossene Protokolle oder
  technische Evidence verlustfrei ausgelagert beziehungsweise verdichtet
  werden können.
- Eine Roadmap darf den Richtwert überschreiten, wenn eine Kürzung
  Entscheidungen, Gates, Findings, Invalidation oder den Fresh-Chat-Kontext
  schwächen würde. Es wird nur gekürzt, wenn die kompaktere Fassung denselben
  ausführbaren Vertrag vollständig bewahrt.

S4R erstellt vor jeder Umsetzung eine Aufwandsprognose:

- Größenklasse `small`, `medium` oder `large`,
- kohärente Umsetzungspakete und erwartete Dateigruppen,
- betroffene Runtimeflächen sowie SQL-/Backend-/Browser-/Devicewirkung,
- produktive oder manuelle Owner-Gates,
- erwartete teure Testpässe und externe Reviewläufe,
- notwendige Context-Rehydration, Toolinteraktionen, Fehlersuche sowie
  Dokumentations-, Evidence- und Postcondition-Arbeit,
- empfohlene autonome Wellen samt Reasoning-Stufe und Stopppunkten,
- bei produktiven UI-Schreibpfaden das Last-Mile-Orakel vom echten
  Benutzerereignis bis Data Access/Transport,
- bei vorbereitetem Cutover das erwartete aktuelle, Forward- und
  Rollbackpostimage sowie einen günstigen Zielpostimage-Precheck,
- bei produktivem Pflichtfehler die Grenze zwischen atomarem Rollback/
  Postcheck und einer erst danach beginnenden Diagnosewelle.

Die Prognose ist eine Steuerungshilfe, keine Zeilen- oder Dateiquote. Wenige
Dateien oder geänderte Zeilen beweisen keinen kurzen Block. Bei
`large` erfolgt vor S4 ein kompaktes Owner-Briefing mit Kohärenzcheck:
Die Roadmap bleibt zusammen, wenn die Pakete denselben Produktvertrag und
dieselbe Evidence teilen; sie wird nur geteilt, wenn eigenständige Gates oder
getrennte Produktentscheidungen einen klareren Vertrag ergeben.

## Risikoklassen

<!-- markdownlint-disable MD013 -->

| Klasse | Typischer Scope | Arbeitsform |
| --- | --- | --- |
| `R1` | Copy, Doku, enger mechanischer Fix | S1-S3-Kurzreview, Delta-Review |
| `R2` | mehrere Consumer, UI-Flow, normale Edge-/Codeänderung | normale S1-S6-Struktur, Consumer-Review |
| `R3` | Auth, SQL, RLS, Migration, Löschung, Cron, medizinischer Vertrag | volle Gates, Full-Review, Owner Briefing, meist Evidence |

<!-- markdownlint-enable MD013 -->

- `R1`: S1 bis S3 dürfen kompakt zusammengefasst werden. S4, S5 und S6
  bleiben erkennbare Umsetzung, Prüfung und Abschluss.
- `R2`: normale S1-bis-S6-Struktur mit schlanken Ergebnissen.
- `R3`: S1 bis S3, Readiness, produktive Gates und S6 vollständig.

## Phasentrennung S4 und S5

- S4 ist der Umsetzungsblock. Seine Substeps erhalten nur den unmittelbar
  nötigen Delta- oder Consumer-Review sowie invalidierte Checks. Es gibt keinen
  separaten S4.5-Abschlussreview und keinen CodeRabbit-Lauf in S4.
- S5 prüft den finalen Gesamtdiff. Die Reihenfolge lautet: vollständige
  relevante Testmatrix, nativer Code- und Contract Review, bei Codeänderungen
  CodeRabbit, fachliche Bewertung der Findings, minimale Korrektur berechtigter
  Findings und Wiederholung aller dadurch invalidierten Prüfungen.
- CodeRabbit ist eine zusätzliche unabhängige Kontrolle und keine Source of
  Truth. Mehrdeutige Produkt- oder Vertragsfindings bleiben Owner-Gates;
  Ausfall oder Nichtverfügbarkeit werden sichtbar dokumentiert.
- Vor einer teuren Fullmatrix prüft ein günstiges Precheck-Orakel, ob lokaler
  Productload, Cacheversion und erwartetes Zielpostimage zum Testmodus passen.
  Eine bekannt falsche Forward-/Rollbackkonfiguration wird nicht erst durch
  eine vollständige erwartbar rote Matrix erkannt.
- Ein ausgeschöpftes externes Reviewbudget verhindert keinen gezielten nativen
  Review. Umgekehrt wird ein nativer Review nicht als weiterer CodeRabbit-Lauf
  oder Ersatz für fehlende externe Evidence bezeichnet.
- Der externe Review verwendet ausschließlich den in
  `docs/DEV_ENVIRONMENT.md` verifizierten Aufruf `coderabbit`. Schlägt Shim,
  WSL-CLI oder Authentifizierung fehl, endet der externe Reviewpfad mit einem
  sichtbaren Evidence-Gap. Innerhalb der Roadmap wird keine alternative CLI
  installiert und kein nativer Review als CodeRabbit-Ergebnis bezeichnet.

## Produktiver Fehler- und Diagnosevertrag

Ein produktiver Cutoverblock umfasst bei einem Pflichtfehler ausschließlich
den vorbereiteten Rollback, Datenintegritätschecks, Runtimepostcheck und den
sicheren Evidence-/Resume-Abschluss. Offene Ursachenforschung wird nicht an
diesen atomaren Block angehängt.

Nach dem Rollback beginnt Diagnose nur nach einem neuen Usage-Gate. Sie wird in
Reproduktion, minimalen Fix, gezieltes Last-Mile-Orakel und erst danach
invalidierte Fullmatrix/Reviews getrennt, sofern jeder Zwischenstand lokal
sicher und resumierbar ist. Ein Dirty Stop macht unfertige Patches und nicht
abgeschlossene Browserergebnisse unverwendbar; bereits bewiesene Rollback- und
Datenpostconditions bleiben gültig.

## Reviewtiefen

`Delta`:

- geänderte Datei,
- direkt betroffene Vertragsklausel,
- kleinster belastbarer Check.

`Consumer`:

- Delta-Review,
- direkte Producer und Consumer,
- Datenform, Fehlerzustand und sichtbares Verhalten.

`Full`:

- gesamter betroffener Vertrag,
- Security, Datenwirkung, Rollback, Runtime und Doku,
- alle relevanten Consumer und Gates.

Full-Reviews sind verpflichtend:

- nach jedem S1-, S2- und S3-Hauptschritt in dessen Scope,
- im S4 Readiness Review,
- in S5 nach der relevanten Testmatrix und vor produktiver Wirkung,
- in S6 als finaler Source-of-Truth-Review.

Ein Full-Review bedeutet vollständige Vertragsabdeckung im betroffenen Scope,
nicht erneutes Lesen des gesamten Repos und nicht die Wiederholung jedes
weiterhin gültigen Tests. Frühere Nachweise werden über IDs übernommen, solange
ihre Invalidation-Bedingung nicht eingetreten ist.

Ein kleiner S4-Substep benötigt keinen Full-Review, wenn er keinen neuen
Vertrag oder Risikopfad eröffnet.

Ein Full-Review innerhalb von S4 ist nur zulässig, wenn S4R ihn für eine echte
Risiko- oder Produktivgrenze ausdrücklich begründet. S4R nennt dafür Scope,
Evidence-IDs, Invalidation-Bedingungen und den korrespondierenden Prüfanteil,
der in S5 bei unverändertem Stand nur referenziert statt erneut ausgeführt
wird. S5 behält dennoch den finalen Full Review des tatsächlichen Gesamtdiffs.

Bei einem S4-Ausführungsblock gilt die höchste Reviewtiefe seiner enthaltenen
Substeps. Findings und Ergebnisse bleiben den ursprünglichen Substep-IDs
zugeordnet; die Zusammenlegung spart Handoffs, nicht Nachvollziehbarkeit.

## Reasoning-Routing

- Standardmodell: `GPT-5.6 Sol`.
- Roadmap-Erstellung und initialer Contract Review: immer `Extra High`.
- Bei der Roadmap-Erstellung werden ein Reasoning-Standard für den
  Ausführungs-Chat und begründete Abweichungsknoten festgelegt.
- Der Standard bleibt innerhalb eines zusammenhängenden Ausführungsblocks
  stabil. Kleine Substeps lösen keinen automatischen Reasoning-Wechsel aus.
- Eine autonome Discovery Wave verwendet grundsätzlich eine gemeinsame
  Reasoning-Stufe. Ist ein einzelner Knoten deutlich riskanter, wird die Welle
  vor diesem Knoten geteilt oder die höhere Stufe für die gesamte Welle
  begründet; zwischen S1, S2 und S3 wird nicht routinemäßig umgeschaltet.
- Die nachfolgenden Ausführungsschritte verwenden die niedrigste noch
  belastbare Stufe passend zu Risiko und Arbeitsaufwand.
- `Low`: rein mechanische, eindeutige Einzeloperation.
- `Medium`: gezielter Scan, Doku-Sync, Statuspflege oder deterministische
  Transformation.
- `High`: Implementierung, Consumer-Review, SQL, Backend, Security oder
  medizinisch sichtbare Logik.
- `Extra High`: destruktiver Knoten, Migration, Concurrency, Rollback,
  produktiver Cutover oder mehrere gekoppelte Preconditions.
- `Ultra`: nur begründeter Ausnahme- oder Red-Team-Fall.
- Es gilt die niedrigste noch belastbare Stufe; Reasoning ersetzt kein Gate.
- `Extra High` und `Ultra` werden für einen konkreten Entscheidungsknoten
  begründet und nicht vorsorglich auf lange mechanische Arbeitsblöcke gelegt.
- Ein begründeter Wechsel bleibt erlaubt, wenn ein Finding, ein produktives
  Gate oder neue Komplexität ihn erfordert. Cache-Spekulation ist weder Grund,
  eine notwendige Stufe zu vermeiden, noch eine unnötig hohe Stufe
  beizubehalten.

## Test-Invaliderung

Ein grüner Check wird erneut ausgeführt, wenn:

- seine Datei geändert wurde,
- ein direkter Producer oder Consumer geändert wurde,
- ein Finding seinen Vertrag betrifft,
- ein externer Review eine relevante Korrektur auslöste,
- oder der finale Gesamtcheck seine unveränderte Gültigkeit nicht anderweitig
  belegen kann.

Unveränderte, weiterhin gültige Nachweise werden über Test- oder Evidence-ID
referenziert und nicht aus Gewohnheit wiederholt.

Der finale Gesamtcheck wiederholt immer nur universelle günstige Hygienechecks
wie Syntax, Lint und Diff sowie tatsächlich invalidierte fachliche,
disposable oder produktive Checks.

## Owner Briefing und Freigaben

Owner Briefing ist verpflichtend vor:

- neuem Werkzeug mit Systemwirkung,
- wichtiger Architekturentscheidung,
- produktivem Deploy,
- produktivem SQL oder Datenwrite,
- Lösch- oder irreversibler Wirkung,
- echtem Push oder Workflow mit Runtime-Wirkung.

```md
#### Owner Briefing [Gate]

- Zweck:
- Wirkung:
- Risiko:
- Rückfall:
- Erfolgsnachweis:
- Benötigte Freigabe:
```

Ohne ausdrückliche Freigabe keine produktive Wirkung.

## Lern- und Erklärvertrag

- Es gibt kein verpflichtendes allgemeines Lessons-Learned-Dokument pro
  Roadmap.
- Archivierte `(DONE)`-Roadmaps, `docs/qa/` und die historischen QA-Archive
  erklären, was, warum und mit welchen Nachweisen geändert wurde.
  `docs/QA_CHECKS.md` bleibt nur als Kompatibilitätsindex; der Git-Commit
  bewahrt die exakte Codeänderung.
- Normale Syntax-, CSS- und JavaScript-Detailarbeit benötigt keine
  wiederholte Lernerklärung.
- Neue Werkzeuge, Architekturentscheidungen, produktive Writes und
  irreversible Wirkungen werden im Owner Briefing vorab erklärt.
- S6 enthält optional einen kurzen Owner Recap in Alltagssprache:
  - was geändert wurde,
  - warum dieser Weg gewählt wurde,
  - wie sich das System künftig verhält,
  - was der Owner für ähnliche Aufgaben mitnehmen sollte.
- Der Recap bleibt bei maximal ungefähr 10 bis 15 Punkten.
- Bestehende ausführliche Lessons-Learned-Dokumente werden nur bei einer
  konkreten Verständnisfrage gezielt gelesen.

## Findings-Vertrag

- `P0`: produktive Fehlwirkung, Datenverlust, Auth-/Security-Bruch oder
  medizinisch riskanter Fehler; blockiert.
- `P1`: echter Contract-, Runtime- oder Nutzerfehler; in Scope beheben oder
  ausdrücklich abgrenzen.
- `P2`: Robustheit, Hygiene oder Copy ohne akuten Blocker.
- `Watchlist`: erkannt, aber bewusst außerhalb der Roadmap.

Findings werden einmal in der Finding-Tabelle geführt. Ergebnisprotokolle
referenzieren nur ihre IDs.

## S5-Reihenfolge

1. lokale statische Checks.
2. disposable Tests und Fixtures.
3. Code-/SQL-/Security-Review.
4. genau ein geplanter initialer externer Review nach vollständiger lokaler
   Umsetzung; Findings gesammelt bewerten, nicht blind übernehmen.
5. berechtigte Findings gebündelt korrigieren und nur invalidierte Checks
   wiederholen.
6. genau einen geplanten externen Verifikationslauf auf dem korrigierten Diff
   ausführen.
7. produktiver read-only Preflight.
8. Owner Briefing und Freigabe je produktivem Gate.
9. Deploy, SQL und Runtime-Smoke in freigegebener Reihenfolge.
10. exakte Postconditions.
11. finaler Review des tatsächlich geänderten Scopes.

Über den initialen Review und den geplanten Verifikationslauf hinaus ist ein
weiterer externer Review nur nötig, wenn der Verifikationslauf ein neues
P0/P1-, Security-, Datenintegritäts- oder Vertragsrisiko eröffnet oder der
Owner ihn ausdrücklich beauftragt. Gewöhnliche Nitpicks erzeugen keine
unbeschränkte Reviewspirale. Ist der Verifikationslauf nicht verfügbar oder
rate-limitiert, wird diese Evidence-Lücke ehrlich dokumentiert und nicht als
PASS behauptet.

## Abschlussvertrag

- S6 synchronisiert Module Overviews, QA und HOW-TO nur mit tatsächlich
  bewiesenen Ergebnissen.
- Doku-Sync erfolgt gebündelt in S6, außer eine Source-of-Truth-Korrektur ist
  vor der Umsetzung zwingend nötig. Zwischenstände werden nicht mehrfach in
  dieselben Dokus übertragen.
- Ein erforderlicher Owner Recap erklärt das reale Ergebnis ohne
  Syntax-Nacherzählung.
- Nicht ausgeführte Smokes werden nicht als bestanden markiert.
- Watchlists werden nicht still geschlossen.
- In-Scope-P0/P1 müssen vor `DONE` geschlossen sein. Out-of-Scope-P0/P1
  dürfen nur mit explizitem Owner, Folgeartefakt und wirksamem Gate als
  Watchlist bestehen bleiben.
- Jede Roadmap entscheidet in S6 ihre Changelog-Relevanz. Bemerkenswerte
  Änderungen werden unter `Unreleased` in `CHANGELOG.md` erfasst;
  nicht bemerkenswerte Änderungen werden kurz begründet.
- Ein Changelog-Eintrag ist weder ein Release-Cut noch ein Git-Tag.
- `DONE` erfordert ein erfülltes S6-Exit-Kriterium.
- Hat eine abgeschlossene Roadmap eine geplante Folgeroadmap, ergänzt S6 in
  Roadmap oder vorhandener Evidence einen kompakten Follow-up Postimage
  Receipt: finaler Writer, aktive Consumer, produktive Runtimepfade, relevante
  API-/RPC-Grenzen, Source-Fingerprints, gültige Evidence-IDs,
  Invalidation Trigger und Exact-Source-Fragen. Es entsteht keine zusätzliche
  Datei; das Receipt ersetzt weder das reale Postimage noch Sources of Truth.
- Roadmap und optionale Evidence werden mit `(DONE)` archiviert.
- Commit und Push bleiben Owner-Aktionen.
- Temporäre Arbeitsnotizen bleiben keine zweite Source of Truth.


## Aktive Endphase-Konsultation (2026-10-03)

Die Endphase-Regeln im Root-AGENTS und .kasrkin/integration.md gelten für
den jetzt gebundenen Release. Fachliche Wahrheit, Roadmap-Scope, S5-Review,
produktive Writes und Ownergates bleiben MIDAS-eigen. Der Cutover
startet keine Produktroadmap. Reguläre Entscheidung und effektive Endphase-
Zulassung bleiben getrennt; alte SMALL-/Ein-Block-Cautionprojektionen gelten
nur für die unveränderte Legacyentscheidung, nicht als zusätzliche Sperre
eines gültig persistierten Endphasepermits. Fehlende History braucht den
exakten einmaligen Ownerbudgetvertrag. Kein pauschaler Reviewdefault.

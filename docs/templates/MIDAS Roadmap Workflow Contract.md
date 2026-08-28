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
- Ein Abschnittsende allein ist kein Owner-Gate. Fortschrittsmeldungen bleiben
  informativ und verlangen keine Antwort, solange kein Stop-Grund eintritt.

## Usage-aware Continuation Gates

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

### Entscheidungsklassen

`SAFE_CLOSURE` hat Vorrang vor `CONTINUE_WITH_CAUTION`; diese wiederum vor
`CONTINUE`.

<!-- markdownlint-disable MD013 -->

| Entscheidung | Messlage | Erlaubte Folge |
| --- | --- | --- |
| `CONTINUE` | 5h `> 40 %` und Woche `> 20 %`; vorhandene empirische Reserve reicht | nächsten geplanten kohärenten Block ausführen |
| `CONTINUE_WITH_CAUTION` | 5h `25-40 %` oder Woche `10-20 %`, ohne Safe-Closure-Grund | höchstens einen kurzen, lokalen, reversiblen und ausdrücklich resumierbaren Block ausführen; danach erneut messen |
| `SAFE_CLOSURE` | 5h `< 25 %` oder Woche `< 10 %`; State fehlt, ist partial/failed/stale; oder vorhandene empirische Reserve reicht nicht | keinen neuen Haupt- oder Ausführungsblock beginnen; sicheren Handoff herstellen |

<!-- markdownlint-enable MD013 -->

Die Grenzen sind inklusiv: exakt `25 %` im 5h-Fenster oder `10 %` im
Wochenfenster ist Caution, exakt `40 %` beziehungsweise `20 %` noch nicht
Continue. Der technische Sensorstatus `OK` ist keine dieser Entscheidungen.

### Empirische Blockreserve

Sobald reale Vergleichswerte derselben Roadmap und desselben Resetzyklus
vorliegen, verwendet S4R für jeden Bucket den höchsten beobachteten Verbrauch
eines vergleichbaren Blocks, multipliziert mit `1,5`. Mittelwerte und
erfundene Schätzwerte sind verboten.
Die Reserve reicht nur, wenn der projizierte Rest nach dem nächsten Block im
5h-Fenster mindestens `25 %` und im Wochenfenster mindestens `10 %` beträgt.
Andernfalls gilt `SAFE_CLOSURE`.

Fehlen vergleichbare Messungen, wird keine numerische Reserve erfunden. Dann
entscheiden statische Schwellen zusammen mit S4R-Größenklasse,
Reversibilität, Resumierbarkeit und realer Blockform. Ein großer oder nicht
sicher resumierbarer Block darf unter Caution nicht begonnen werden.

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
- empfohlene autonome Wellen samt Reasoning-Stufe und Stopppunkten.

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
- Der externe Review verwendet ausschließlich den in
  `docs/DEV_ENVIRONMENT.md` verifizierten Aufruf `coderabbit`. Schlägt Shim,
  WSL-CLI oder Authentifizierung fehl, endet der externe Reviewpfad mit einem
  sichtbaren Evidence-Gap. Innerhalb der Roadmap wird keine alternative CLI
  installiert und kein nativer Review als CodeRabbit-Ergebnis bezeichnet.

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

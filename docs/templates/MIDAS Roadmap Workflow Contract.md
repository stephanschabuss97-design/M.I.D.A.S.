# MIDAS Roadmap Workflow Contract

KASRKIN ist seit 2026-10-12 durch ausdrückliche Ownerentscheidung entbunden.
Neue und laufende Roadmaps arbeiten ohne KASRKIN-Aufrufe, Usage-Gates, Permits
oder KASRKIN-Checkpointfelder. Fachliche Readiness, Scope, Review, sichere
Postconditions und produktive Ownergates bleiben verbindlich. Diese Entscheidung
überstimmt ältere KASRKIN-Klauseln, auch in unveränderten aktiven Roadmaps.

Dieser Vertrag ergänzt [BLUEPRINT-1 / 2026-09-27](../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md)
um MIDAS-spezifische medizinische, Daten-, Security-, Evidence-, S1–S6- und
Abschlussregeln. Neue Roadmaps verwenden die zentrale Dokumentform
plus diese lokalen Regeln; laufende und historische Roadmaps bleiben eingefroren.

## Environment Capability Preflight

Vor READY einer neuen toolabhängigen Roadmap den BLUEPRINT-Preflight über das
[lokale Overlay](../DEV_ENVIRONMENT.md) und nur benötigte
[ATLAS-Abschnitte](../../../codex-tools/environment/DEV_ENVIRONMENT.md) ausführen.
Benötigte Capabilities bestimmen, Wesentliches read-only verifizieren und in
Startkarte/Context Receipt festhalten:

| Capability | Zweck/Anforderung | ATLAS-Abschnitt | Status | Prüfcommand/-datum |
| --- | --- | --- | --- | --- |
| konkrete Fähigkeit | konkreter MIDAS-Bedarf | gezielter Verweis | AVAILABLE_VERIFIED / AVAILABLE_UNVERIFIED_OR_STALE / MISSING / INCOMPATIBLE / NOT_REQUIRED | Nachweis |

MISSING/INCOMPATIBLE blockiert READY mit OWNER_TOOLING_DECISION_REQUIRED.
Stephan entscheidet Setup, vorhandene Alternative oder Scopeänderung. Erst ein
separat freigegebener Setupblock darf installieren/aktualisieren; dessen
Postcondition enthält Verifikation und Aktualisierung des ATLAS-Abschnitts.
Capability-Readiness ersetzt keine medizinische, Daten-, Secret-, Device- oder
produktive Freigabe. Resume-Chats verwenden den Receipt bis zur Invalidation.

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
- S5 und S6 bleiben fachlich getrennte Abschlussphasen. Eine separate
  Korrektur-/Retest-Welle folgt ihrer betroffenen Readiness und Reviewgrenze;
  es besteht keine technische Usage-Gate- oder Messpflicht.
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

## Arbeitsfortsetzung ohne KASRKIN

KASRKIN ist seit 2026-10-12 durch ausdrückliche Ownerentscheidung entbunden.
Neue und laufende Roadmaps arbeiten ohne KASRKIN-Aufrufe, Usage-Gates, Permits
oder KASRKIN-Checkpointfelder. Fachliche Readiness, Scope, Review, sichere
Postconditions und produktive Ownergates bleiben verbindlich. Diese Entscheidung
überstimmt ältere KASRKIN-Klauseln, auch in unveränderten aktiven Roadmaps.

Vor der nächsten freigegebenen Arbeit bisherigen Schritt, Findings und sichere
Postconditions prüfen; Resume Card und relevante Evidence aktuell halten.
Eine Quota-Messung oder technische KASRKIN-Zulassung ist keine Voraussetzung.

## Chat- und Kontextvertrag

Startkarte, Fresh-Chat-Test und Context Receipt folgen BLUEPRINT. MIDAS trennt
weiterhin Denkraum und eigenen Ausführungs-Chat je Roadmap; kleine vertragstreue
Korrekturen bleiben im bestehenden Chat. Cache-Verhalten begründet weder
Freigaben noch Modell-/Reasoningwechsel.

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

Lesepfad und Invalidation folgen BLUEPRINT. Zusätzlich bleiben in MIDAS
AGENTS, Root-README, aktive Roadmap, Resume Card, Findings, Dirty Boundary,
aktueller Diff, geänderte Codeflächen und produktive Owner-Gates Live-Kontext.
Fingerprintgebundener Reuse verlangt exakte Sourceidentität, vollständige
Frageabdeckung und keine Invalidation/Exact-Source-Pflicht; sonst READ_ORIGINAL.
Read Completeness sowie SUFFICIENT/INSUFFICIENT/NOT_REQUIRED werden ausdrücklich
unterschieden. Abgeschnittene Ausgabe gilt nicht als vollständiger Read.

Das erste Gate nach Rehydration ist POST_REHYDRATION_BASELINE. Ein Delta setzt
einen echten vorherigen Checkpoint mit identischen Reset-IDs voraus; niemals
100 Prozent oder Verbrauch erfinden. Bereits verbrauchte Rehydration ist
bereits geleistete Arbeit und wird nicht nochmals prognostiziert; keine KASRKIN-Reservepflicht.
S1 und S4R lesen relevante Quellen ausreichend, bei Contract-Finding auch breiter.
S6 prüft relevante Roadmapteile, Findings, Evidence und geänderte SoT erneut.
Der Handoff bleibt ungefähr unter 35 Zeilen und ersetzt seinen Vorgänger.

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

Nach dem Rollback beginnt Diagnose erst bei sicherer fachlicher Readiness und
gültiger Scope-/Ownerfreigabe. Sie wird in
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

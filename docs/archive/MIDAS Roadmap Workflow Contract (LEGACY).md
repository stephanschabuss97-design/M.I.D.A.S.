> LEGACY — archiviert am 2026-10-13 auf direkten Ownerauftrag.
> Historischer Nachweis des früheren lokalen Prozessstands; keine aktuelle
> Autoren-/Template-SoT und keine Pflichtlektüre für neue Roadmaps.
> Aktuell: [BLUEPRINT](../../../codex-tools/docs/blueprint/README.md) und
> [Projekt-AGENTS](../../AGENTS.md). Alte Aufträge behalten ihre eingefrorene Gitbasis.

# MIDAS Roadmap Workflow Contract

KASRKIN ist seit 2026-10-12 durch ausdrückliche Ownerentscheidung entbunden.
Neue und laufende Roadmaps arbeiten ohne KASRKIN-Aufrufe, Usage-Gates, Permits
oder KASRKIN-Checkpointfelder. Fachliche Readiness, Scope, Review, sichere
Postconditions und produktive Ownergates bleiben verbindlich. Diese Entscheidung
überstimmt ältere KASRKIN-Klauseln, auch in unveränderten aktiven Roadmaps.

Dieser Vertrag ergänzt [BLUEPRINT / 2026-10-13](../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md)
um MIDAS-spezifische medizinische, Daten-, Security-, Evidence-, S1–S6- und
Abschlussregeln.
Zielrevision: RELEASED / S6-Postchecks BP-EX-01 am 2026-10-13 grün; für neue ausdrücklich übernehmende Aufträge.
Gemeinsame Phasen, Routing, Autonomie, Kontext, Invalidation und Closure stehen
im BLUEPRINT-Kern; hier bleiben die erforderlichen lokalen Ergänzungen.
Alte aktive Aufträge behalten ihre eingefrorene Prozessbasis und ihren Scope
ohne neue Pflichtfelder. Historische Regeln aus Roadmap/Gitbaseline lesen;
aktuelle echte Produkt-/Security-/Ownergrenzen und Entbindung gelten weiter.
Neue Roadmaps verwenden die zentrale Dokumentform
plus diese lokalen Regeln; laufende und historische Roadmaps bleiben eingefroren.

## Environment Capability Preflight

Den [BLUEPRINT-Preflight](../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md#readiness-und-capability-preflight)
mit [lokalem Overlay](../DEV_ENVIRONMENT.md) und nur benötigten ATLAS-Abschnitten
anwenden; konkrete lokale Anforderungen/Nachweise in Startkarte/Receipt führen.
Fehlende/inkompatible Tools verlangen OWNER_TOOLING_DECISION_REQUIRED, keine
implizite Installation. Toolreadiness ersetzt keine lokalen Fach-/Secret-/
Device-/Produktivgates. Gültigen Receipt bis zur Invalidation übernehmen.

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

Lokale Profile ergänzen den freigegebenen Scope/Endpunkt des BLUEPRINT-Kerns:
`local-full` erlaubt freigegebene nichtproduktive reversible Arbeit bis S6;
`gated` ist Standard und endet am nächsten Owner-Gate; `manual` erlaubt nur
benannte Einzelblöcke. Profil in Metadaten/Startkarte/Resume, keine Gateaufhebung.

Ausführbare Aufträge verwenden die zentrale Execution oder angemessenen Quick
Change; Rolling Wave ordnet Lieferungen/Aufträge zu. Execution trennt S3
Bruchrisikoreview von S4R: finale S1–S3-Durchsicht und ausführbarer Scope-Freeze
vor S4. S1–S3/optional S4R dürfen im Discovery-Auftrag gemeinsam autorisiert
sein, ihre Full Reviews/Findings/Status/Resume bleiben getrennt nachvollziehbar.
Eine Discovery-Freigabe allein erlaubt keine Umsetzung. Vorab vollständige
Implementierungsfreigabe gilt ohne Routinefrage nach grünem internem Exit.
Kein Produktcode vor grünem S4R; S4 nur native Delta-/Consumerreviews,
S5 integrierte Tests/Review, S6 lokaler SoT-Sync/Abschluss gemäß Fachregeln unten.

S4R empfiehlt kohärente benachbarte S4-Blöcke: kompatible Datenwirkung,
klare Reihenfolge, keine Owner-Gates dazwischen und Review jedes Substeps.
Produktives SQL, Deploys, Workflows, Geräte und andere externe/irreversible
Aktionen bleiben getrennt, außer gleichwertig sichere explizite Begründung.
Reasoning pro kohärenter Welle stabil; notwendige Wechsel vorher begründen,
beobachtbare Einstellung oder NOT_OBSERVABLE, keine stille Erhöhung.
Status/Resume nach Haupt- und Umsetzungsblöcken aktualisieren; technische
Operatoraktion separat genau anweisen, keine erneute identische Freigabe.
S5 und S6 bleiben getrennt; Korrektur-/Retestarbeit unter betroffenen Gates.
Commit-Empfehlung frühestens nach S5, final nach S6, kein automatischer Commit.

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

Keine POST_REHYDRATION_BASELINE-/Reset-/Usagepflicht. Vorhandene
Kapazitätsinformationen sind nach BLUEPRINT rein optional; stale oder fehlend
ist UNKNOWN und kein Fortsetzungsblocker. Keine Abfrage oder Refresh aus
diesem Adapter ableiten.
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
| `R1` | Copy, Doku, enger mechanischer Fix | Quick Change mit kurzem Contract Review, Delta; bei Unsicherheit Execution |
| `R2` | mehrere Consumer, UI-Flow, normale Edge-/Codeänderung | normale S1-S6-Struktur, Consumer-Review |
| `R3` | Auth, SQL, RLS, Migration, Löschung, Cron, medizinischer Vertrag | volle Gates, Full-Review, Owner Briefing, meist Evidence |

<!-- markdownlint-enable MD013 -->

- `R1`: Quick Change darf inline bleiben; Umsetzung, passende Prüfung und
  lokaler Abschluss bleiben nötig, ohne sechs künstliche Phasen.
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
6. nach berechtigten Korrekturen höchstens einen externen Verifikationslauf
   auf dem korrigierten Diff ausführen; bei Doku-only kein externer Lauf.
7. produktiver read-only Preflight.
8. Owner Briefing und Freigabe je produktivem Gate.
9. Deploy, SQL und Runtime-Smoke in freigegebener Reihenfolge.
10. exakte Postconditions.
11. finaler Review des tatsächlich geänderten Scopes.

Weitere externe Läufe folgen ausschließlich einer neuen ausdrücklichen
Ownerentscheidung, nicht automatisch einem Finding. Gewöhnliche Nitpicks
erzeugen keine Reviewspirale. Ausfall/Rate-Limit als Evidence-Gap dokumentieren,
niemals PASS behaupten. Das Budget betrifft Codeänderungen; Doku-only bleibt
ohne externen Review. Nur für den Auftrag relevante Prüf-/Produktivschritte
der Liste anwenden; kein SQL-/Browser-/Deployzwang aus dem Ablauf.

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

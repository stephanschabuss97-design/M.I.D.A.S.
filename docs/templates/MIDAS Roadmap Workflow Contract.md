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
- Eine bis S4R freigegebene Discovery Wave endet mit dem Readiness-Urteil. S4
  beginnt standardmäßig erst mit dem nächsten ausdrücklich freigegebenen
  Ausführungsauftrag.
- S4 bleibt fachlich substepweise nachvollziehbar. Der Readiness Review gibt
  zusätzlich eine begründete Empfehlung ab, welche benachbarten Substeps als
  gemeinsamer Ausführungsblock laufen dürfen.
- Ein S4-Batch ist nur zulässig, wenn Scope und Datenwirkung kompatibel sind,
  kein Owner-Gate dazwischenliegt, die Reihenfolge eindeutig bleibt und der
  gemeinsame Review jeden enthaltenen Substep weiterhin einzeln abdeckt.
- Produktives SQL, Deploys, Workflow-Runs, Device-Installationen und andere
  irreversible oder extern sichtbare Aktionen bleiben standardmäßig getrennt,
  sofern der Readiness Review keine gleichwertig sichere Begründung liefert.
- S5 und S6 laufen grundsätzlich als Gesamtblock. Owner-Gates, externe Reviews
  und manuelle Smokes dürfen kontrollierte Pausen erzwingen.
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
2. Entscheidungslog und Findings.
3. Nur der aktuelle Schritt samt Exit-Kriterium.
4. `git status --short` und der relevante Diff.
5. Nur Referenzen, die der aktuelle Schritt oder ein Finding benötigt.

Ein breiter Re-Read ist nur erforderlich:

- beim initialen S1,
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
4. ein geplanter externer Review nach vollständiger lokaler Umsetzung;
   Findings bewerten, nicht blind übernehmen.
5. produktiver read-only Preflight.
6. Owner Briefing und Freigabe je produktivem Gate.
7. Deploy, SQL und Runtime-Smoke in freigegebener Reihenfolge.
8. exakte Postconditions.
9. finaler Review des tatsächlich geänderten Scopes.

Ein zweiter externer Vollreview ist nur nötig, wenn die Korrekturen einen neuen
Vertrag oder Risikopfad eröffnet haben. Ansonsten werden ausschließlich die
invalidierten Checks wiederholt.

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
- Roadmap und optionale Evidence werden mit `(DONE)` archiviert.
- Commit und Push bleiben Owner-Aktionen.
- Temporäre Arbeitsnotizen bleiben keine zweite Source of Truth.

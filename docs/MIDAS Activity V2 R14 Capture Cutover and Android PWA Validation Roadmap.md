# MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation Roadmap

R14 ist das finale Core-Gate von Activity V2. Die bereits isoliert bewiesene
Session-Erfassung wird in die durch C3 stabilisierte Training-Produktfläche
integriert. Activity V2 wird danach der einzige sichtbare neue Capture-Pfad;
Activity V1 bleibt ausschließlich als unveränderte Historie und als
quellseitige Rollbackreserve erhalten. Der Cutover erfindet weder neue
medizinische Logik noch ein neues Datenmodell.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `S5.4/S5.5 ATOMIC CUTOVER IN PROGRESS; G0-S5.3 PASS; P1/P2 ausgeübt; Android owner-deferred` |
| Modul / Bereich | `Activity V2 / Training / PWA / Android` |
| Owner / Kontext | `Stephan; private Single-User-PWA für den eigenen CKD- und Arztkontext` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-28` |
| Letzter Stand | `2026-08-30; U10R2 98 % / 100 % und CONTINUE; atomares P1/P2-Cutoverfenster begonnen` |
| Aktueller Schritt | `S5.4/S5.5 ohne Zwischenpoll bis vollständigem Web-/Write-/Reader-/Delete-PASS oder Rollback` |
| Risikoklasse | `R3`; produktiver Writer- und Web/PWA-Cache-Cutover bei bestehender Gesundheitsdatenbank; Android-Evidence gemäß D-ACT-R14-17 deferred |
| Standard-Reviewtiefe | `Full`; S4 gemäß Workflow nur Delta/Consumer, S5 integriert Full und externes Review |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `keine; ausdrücklicher Owner-Freeze auf maximal High für Planung und Ausführung` |
| Autonome Discovery Wave | `G0-S4R` |
| Autonomieprofil | `gated` |
| Maximal autonomer Endpunkt | `S5.3`; lokale Umsetzung und lokale Abschlussmatrix autonom, produktiver Cutover und Devicezugriff owner-gated |
| Geplante Reasoning-Wellen | `G0-S6 jeweils High; keine routinemäßigen Modell- oder Reasoningwechsel` |
| Erwartete Arbeitsgröße | `large`; S4R muss Umfang, Blockgrenzen und Reserven am realen Postimage bestätigen |
| Externes Reviewbudget | `S1-S4: 0; S5: 1 Initial + höchstens 1 Verifikation` |
| Owner-Erklärmodus | `Briefing vor produktivem Cutover + kurzer S6-Recap` |
| Betroffene Hauptdateien | `Training-Produktfläche, Activity-V2-Produktcontroller, V2-Shells/Styles, Productload, Main-Lifecycle, Service Worker, fokussierte Tests und QA-Dokumentation` |
| Deploy relevant | `ja; Web/PWA-Cutover; echter Android-Nachweis durch Ownerentscheidung D-ACT-R14-17 deferred und nicht als PASS behauptet` |
| Produktive Schreibwirkung | `ja; genau ein kontrollierter Activity-V2-Write-Smoke nach Owner-Gate, danach reguläre V2-Nutzung` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Usage-Continuation | `verpflichtend; U0-U13 an den unten definierten sicheren Grenzen` |
| Evidence-Datei | `docs/MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation Evidence.md` |
| Gekoppelte Roadmaps | `R8 Commit/Recovery; R9 History/Lifecycle; R10 Export; R13 Reader; C3 Produktfläche` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `R14 gemäß den aufgezeichneten Gates deterministisch abarbeiten. G0-S4R
    und die lokalen S4-/S5-Wellen dürfen bei grünen internen Gates autonom
    fortfahren. Vor jeder produktiven oder Devicewirkung stoppen.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High für alle Schritte.`
- Begründete Reasoning-Ausnahmen:
  - `Keine. Der Owner akzeptiert kleinere, sauber resumierbare Blöcke anstelle
    einer Reasoning-Erhöhung.`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Metadaten, Resume Card, Usage-Tabelle und Context Receipt`
  2. `AGENTS.md und README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/README.md und MIDAS Roadmap Workflow Contract.md`
  5. `docs/Future trainingsmodule update thoughts.md`, nur R14, Gates und
     direkt angrenzende R13/C3/R15-Verträge
  6. `docs/modules/Activity Module Overview.md`
  7. `docs/qa/health-capture-reports.md`, HCR-025 bis HCR-032 nur soweit
     durch die aktuelle Frage invalidiert
  8. `archivierte R13-Roadmap/Evidence und C3-Roadmap ausschließlich für deren
     Follow-up-Postimages und relevante Fingerprints`
  9. `archivierte R8-/R9-/R10-Evidence ausschließlich für Recovery-, Commit-,
     History- und Exportverträge`
  10. `docs/qa/runbooks/android-device-smoke.md und
      docs/qa/activity-v2-r8-local-android-pwa-runbook.md`
  11. `reale Productload-, Training-, Service-Worker- und Activity-V2-Quellen`
  12. `git status --short und nur der relevante Diff`
- Startschritt:
  - `U0, danach G0.`
- Freigegebener autonomer Block:
  - `G0-S4R; bei bestätigtem Scope anschließend die in S4R freigegebenen
    lokalen S4-Blöcke und S5.1-S5.3.`
- Interne Continuation Gates:
  - `Jeden Hauptschritt mit Status-, Findings-, Receipt-, Evidence- und Resume-
    Sync schließen. Bei PASS und gültigem Usage-Gate ohne Rückfrage fortfahren.`
- Owner-Gates:
  - `Gate P1: produktiver Web-/PWA-Cutover einschließlich Commit/Push oder
    anderer deployauslösender Aktion und bedingter Webrollback bei einem
    fehlgeschlagenen Cutover-Smoke.`
  - `Gate P2: produktiver Activity-V2-Schreibtest und die vorab gewählte
    normale Behandlung dieses Datensatzes. Der Android-Geräteanteil ist durch
    D-ACT-R14-17 owner-deferred und wird nicht als ausgeführte Evidence geführt.`
  - `P1 und P2 müssen vor Beginn des atomaren Cutoverfensters gemeinsam
    vorliegen. Der Owner muss verfügbar sein; ein Android-Gerät ist nach
    D-ACT-R14-17 keine Voraussetzung mehr.`
  - `Gate P3: unerwartete produktive Korrektur oder Löschung außerhalb der in
    P1/P2 vorab freigegebenen normalen Cutover-/R9-Flows.`
- Stop-Bedingungen:
  - `R13 oder C3 ist nicht DONE, sein Postimage driftet oder Activity V1 ist
    nicht mehr der alleinige produktive Writer.`
  - `Der Cutover benötigt neue SQL-, RPC-, RLS-, ACL-, Auth-, Secret- oder
    Schedulerlogik.`
  - `Ein bestehender R7-/R8-/R9-/R10-Vertrag müsste fachlich geändert statt
    nur produktiv komponiert werden.`
  - `S4R findet einen offenen P0/P1, eine unbekannte produktive Abhängigkeit
    oder klassifiziert die Arbeit anders als kontrolliert resumierbar.`
  - `Usage-Telemetrie verlangt SAFE_CLOSURE.`
- Halluzinationsschutz:
  - `Keine APIs, Scriptreihenfolgen, Cacheversionen, Geräte oder produktiven
    Datenstände annehmen. Reale Quellen beziehungsweise Postimages prüfen.`
  - `Weiterhin gültige Evidence referenzieren; nur invalidierte Checks erneut
    ausführen.`
  - `Keinen alten PWA-Client durch Datenbankänderungen aussperren. Der
    Single-User-Rollout wird über kontrolliertes Schließen/Aktualisieren der
    real verwendeten Clients abgesichert.`

## Session Resume Card

- Ziel:
  - `Activity V2 als einzigen sichtbaren neuen Training-Capture aktivieren und
    Start, Recovery, Commit, History, Coaching-Export sowie Web-/PWA-End-to-End-
    Verhalten produktiv beweisen. Android bleibt als owner-deferred Evidence-
    Gap sichtbar und wird nicht als PASS erfunden.`
- Unveränderliche Verträge:
  - `Kein Dual Write und kein produktiver V1-Save-Callsite nach dem Cutover.`
  - `Activity-V1-Daten bleiben unverändert lesbar; keine Detailmigration und
    keine Löschung.`
  - `Neue V2-Sessions verwenden den stabilen aktuellen Katalog; Recovery,
    Replay und Commit bleiben an die im Draft gespeicherte Katalogversion
    gebunden.`
  - `Der V2-Trainingstag stammt aus dem bewiesenen Session-/Timestampvertrag;
    R14 erfindet keinen zweiten manuellen Tagesvertrag.`
  - `Ein fehlgeschlagener oder unklarer Save bewahrt den Recoveryzustand und
    erlaubt nur den bestehenden identitätsgleichen Retry.`
  - `R13-Reader sowie medizinische Berechnungen bleiben unverändert.`
- Erledigter Stand:
  - `R1-R13, C2 und C3 sind DONE.`
  - `R13-Postimage: Reader produktiv aktiv, V1=66 am damaligen Abschluss,
    V2=0/0/0; keine V2-Capturewirkung.`
  - `C3-Postimage: eigenständige Training-Produktfläche, Activity V1 alleiniger
    Writer, Root-Service-Worker v13, R14 nächstes Core-Gate.`
  - `Initialer R14-Contract-Review ist PASS; F-ACT-R14-01 bis -08 wurden im
    Vertrag geschlossen.`
  - `U0 ist mit 58 % 5h und 63 % Woche gültig und ergibt CONTINUE.`
  - `G0 ist PASS: R13-Roadmap/Evidence und C3-Roadmap sind DONE archiviert;
    HEAD und origin/main stehen auf 4be058b1. GitHub Pages liefert denselben
    C3-Stand über erfolgreichen Run 33162838336 aus. Live-Productload enthält
    genau V1-Form/Writer plus die zwei R13-Readerloads, keine V2-Writerloads;
    Root-SW ist v13.`
  - `S1 ist PASS: Productload, APIs, Producer/Consumer, Lifecycle, Cache,
    Browser-/Android-Clients, Deployweg, Toolstatus, Secret Readiness und
    datenverlustfreier Webrollback sind fingerprintgebunden kartiert.`
  - `S4 Block A ist PASS: die neue, noch unreferenzierte Productbasis besitzt
    exakte Options-/Controllerflächen, fail-closed Dependency- und
    Doppelmountprüfung, sichere deutsche Entry-DOM, Fokus- und Touchbasis;
    Syntax, 4/4 direkte Contracts und nativer Delta-/Consumerreview sind grün.`
  - `S4 Block B ist PASS: Recovery wird einmal geöffnet; neue Drafts verwenden
    v2, Restore löst die gespeicherte Version auf; Commit/Unknown/Retry,
    Logout-Settlement+Flush ohne Discard, Mutation Guard, History und Export
    sind vollständig im weiterhin unreferenzierten Controller komponiert.`
  - `S4 Block C ist PASS: die lokale Quelle lädt exakt einen V2-Capturegraph
    mit 15 Scripts, vier Styles und Root-SW v14; V1-Form, Main-Writercallsite
    und V1-Script-/Cacheload sind null. R13-Readerquellen blieben unverändert,
    der Chart nutzt ihren Snapshot mit V1-Parität und Tagesaggregation, und
    das explizite 4be058b1-Productloadrollback erzeugt monoton v15.`
  - `S5.1/S5.2 ist PASS: 293/293 gebündelte Node-Verträge, 45/45 relevante
    Deno-Verträge, C3/R13/R14/R8-Gates und 31 Syntaxchecks sind grün. Eine
    Edge-Session belegte Desktop, 390x844 und 320x800, realen Hub-Touchpfad,
    read-only History/Export, 45-px-Touchziele, sichtbaren Fokus, null
    Horizontaloverflow sowie isolierte Commit-/Recovery-/Reload-/Background-
    und R9-Correction/Delete-Guards ohne produktiven Write.`
  - `Nativer Full Code-/Contract-/Security-/Privacy-/Scope-/Cache-/Rollback-
    und Consumerreview ist PASS. CodeRabbit Initial hatte ein Finding zur
    R10-Orakelausnahme; die absichtliche R14-Invalidierung ist nun zusätzlich
    SHA-256-gebunden. Der einzige Verifikationslauf meldete 0 Findings.`
  - `S5.3 ist produktiv read-only PASS: HEAD/origin/Pages bleiben 4be058b1,
    Run 33162838336 und Root-SW v13; live bleibt V1 einziger Writer bei zwei
    R13-Readerloads und null V2-Productcontroller. SQL22-26-Funktionen,
    Owner/ACL/RLS und alle eingefrorenen Functionhashes stimmen. V1 ist 67
    gültig/invalid 0; die 66er-R13-Basis ist hashgleich erhalten und genau ein
    regulärer V1-Neuzugang liegt vor G0. V2 bleibt 0/0/0 mit leeren geschützten
    Hashes und unverändertem Request-ID-Hash.`
  - `R13-Snapshot v1 liefert read-only 67 Units ohne Mixed-Source-Day; Edge-
    Versionen 61/31/32/27, Flags und relevante Workflows sind unverändert,
    0 Läufe inflight. Advisors bleiben exakt bei vier bekannten Security-WARN
    und acht unused-index INFO. Ein Owner, bestätigt und nicht anonym; das
    gitignored Operatorbundle besitzt beide erwarteten Typen, ohne Wertausgabe.`
- Aktueller Schritt:
  - `U10R2 ist mit 98 % 5h / 100 % Woche CONTINUE. Das gemeinsam freigegebene
    atomare S5.4/S5.5-Cutoverfenster ist begonnen; bis Erfolg oder Rollback
    erfolgt kein Usage-Poll und kein freiwilliger Zwischenstopp.`
- Nächster erlaubter Schritt:
  - `Commit/Push/Pages-Deploy, Web-/PWA-Fresh-/Upgrade-/stale-client-Smokes,
    genau ein V2-Write, Reader-Nachweis und normaler R9-Delete; bei Pflichtfehler
    bedingter v15-Webrollback. Danach U11.`
- Offene Findings:
  - `F-ACT-R14-13/-14 sind im S2-Vertrag geschlossen und bleiben als
    verpflichtende S4-/S5-Orakel offen, nicht als Produktentscheidung.`
  - `F-ACT-R14-15 bis -19 sind im S3-Risikovertrag geschlossen und als
    konkrete S4-/S5-Präventionen und Stop-/Rollbackorakel zugewiesen.`
  - `F-ACT-R14-23 ist durch D-ACT-R14-17 geschlossen: Android-Evidence ist
    ausdrücklich owner-deferred, nicht PASS. Layoutpolishing bleibt außerhalb
    des produktiven Web-/PWA-Cutovers.`
  - `Keine offenen lokalen S5.1/S5.2-Findings; reale Fresh-/Upgrade-/stale-
    Client- und Offline-Smokes bleiben planmäßig P1/P2 im Cutoverfenster.`
- Geänderte Dateien:
  - `Block A/B: Productcontroller, CSS und direkter Contracttest. Block C:
    index.html, app.css, main.js, Auth-Lifecyclehook, Chartadapter, Root-SW,
    acht invalidierte Product-/Isolationorakel sowie neuer R14-Cutovercontract
    und explizites v15-Rollbacktool. Roadmap/Evidence sind synchronisiert;
    vorbestehende Änderungen an DEV_ENVIRONMENT und Workflow Contract bleiben
    unangetastet.`
  - `Beim U8R-Re-entry erschien zusätzlich die fremde Dirty-Datei
    docs/Codex Usage Guard VS Code Extension Future Notes.md; sie bleibt
    ebenfalls unangetastet und außerhalb des R14-Diffs.`
  - `S5 ergänzte ausschließlich invalidierte Contractpostimages, archivierte
    Contractpfade, einen R13-aktivierten Reporttest und die fingerprintgebundene
    R10/R14-Ausnahme im bestehenden R8-Isolationsgate; keine Runtime-, SQL-
    oder medizinische Backendquelle wurde dadurch geändert.`
- Gültige Nachweise:
  - `R8 Recovery/Commit L01-L08 und D01-Evidence-Gap; R9 History/Lifecycle;
    R10 Export L01/L08/L09; R13 finales Reader-Postimage; C3 HCR-032.`
- Context Receipt:
  - `G0 und S1 fingerprintgebunden aktuell; Baseline 4be058b1, Dirty Boundary,
    R8-R10/R13/C3-Evidence, reale V1-/V2-APIs, Productload, SW, Pages-,
    PWA-/Android-Client- und Toolgrenzen sind erfasst.`
  - `S2/S3/S4R ergänzen exakten Product-/State-/Lifecycle-/Cache-/Rollback-
    Vertrag, RK01-RK17 und die sicheren lokalen Wellen A-C. Keine rohe
    Re-Discovery ist für S4 nötig.`
  - `Block-B-Fingerprints: Controller 20a91b68...e6d2, CSS
    5f2d2770...9c7f, Contract 1175e858...800; bestehender Productload und alle
    bisherigen V1-/V2-Core-/R13-/Supabase-/SQL-/Android-Quellen sind
    unverändert.`
  - `Block-C-Fingerprints: index f017b4ec...b6a0; app.css 6e02ac4e...d560;
    main 9c31759d...9663; Authcore e4619a78...b8e6; Chart
    f3020bd8...5914; Root-SW fcaa1907...225; Cutovercontract
    1ce88d5a...b1d9; Rollbacktool 23b37d83...856c.`
  - `S5-Fingerprints: R8-Isolation 46c05f78...aef5; R10-Productloadcontract
    e6d62f15...4f2a; R13-Reporttest 1ae18b13...e488. Browser- und
    Reviewevidence ist in EV-ACT-R14-L08..L10 eingefroren.`
  - `S5.3-Postimage: V1 67/b9807820...5d94, davon eingefrorene R13-Basis
    66/cfddb1fa...b6f unverändert und ein gültiger Zugang vor G0; V2
    Sessions/Items/Sets 0/0/0 und Request-IDs je 4f53cda1...b945. SQL26
    User/Service/Core cffcd679...9f2b, eb27ec44...6f54 und
    abb59627...f79f; SQL22-24/R9-Funktionen ebenfalls exakt hashgleich.`
- Autonomieprofil / aktuelle Welle:
  - `gated; G0-S5.3 lokal autonom, danach koordiniertes P1/P2; P3 nur bei
    unerwartetem Reparaturbedarf.`
- Runtime-/Deploy-Stand:
  - `GitHub Pages Legacy-Build aus main/Root ist auf 4be058b1 erfolgreich
    ausgeliefert. Activity V1 ist alleiniger produktiver Writer;
    V2-Capture-Scripts sind dort nicht im Productload; Root-SW v13. Nur die
    lokale, noch nicht committete/deployte Quelle besitzt den v14-Cutover.`
- Offene Owner-Freigaben:
  - `P1 Web/PWA-Cutover samt bedingtem Webrollback und P2 V2-Write samt
    anschließendem normalem R9-Delete sind am 2026-08-29 erteilt, aber wegen
    U10R nicht ausgeübt. P3 nur für unerwartete Reparaturen.`
- Letzter Usage-Checkpoint / Entscheidung:
  - `U10R2 2026-08-30T08:05:11+02:00: 5h 98 %, Woche 100 %; beide
    Resetgrenzen seit U10R überschritten. CONTINUE; das vollständige atomare
    S5.4/S5.5-Fenster ist erlaubt und wurde begonnen.`
- Stop-Bedingungen:
  - `jede Bedingung der Startkarte oder Evidence-Lücke an einem Pflichtgate.`

## Usage-Continuation-Checkpoints

Die zentrale Entscheidung kommt ausschließlich aus dem dokumentierten lokalen
Validator. Es wird nicht innerhalb eines atomaren Blocks gepollt.

<!-- markdownlint-disable MD013 -->

| ID | Sichere Grenze | Zweck |
| --- | --- | --- |
| U0 | vor G0 | Ausführungsbaseline |
| U1 | nach G0 / vor S1 | Postimage-Gate |
| U2 | nach S1 / vor S2 | Discovery-Receipt |
| U3 | nach S2 / vor S3 | Zielvertrag |
| U4 | nach S3 / vor S4R | Risikoabschluss |
| U5 | nach S4R / vor Block A | Implementierungsfreigabe |
| U6 | nach Block A / vor Block B | Product-Composition-Grenze |
| U7 | nach Block B / vor Block C | Writer-/Lifecycle-Grenze |
| U8 | nach Block C / vor S5.1 | vollständiger lokaler S4-Stand |
| U9 | nach S5.2 / vor S5.3 | Review- und Testpostimage |
| U10 | nach S5.3 / vor P1 | produktiver Preflight |
| U11 | nach atomarem Web-/Write-/Delete-Cutoverfenster / vor S5.6 | validiertes Produktpostimage; Android deferred |
| U12 | nach S5 / vor S6 | finaler Produkt-/Device-Stand |
| U13 | nach S6 | `FINAL_OBSERVATION`; DONE wird dadurch nicht zurückgestuft |

Vergleichbare reale Kosten aus C3 müssen in S4R berücksichtigt werden:

- C3 S1: ungefähr 15 Prozentpunkte 5h / 3 Weekly.
- C3 S5 einschließlich Browser und Review: ungefähr 96 / 15.
- C3 S6: ungefähr 21 / 3.

Diese Werte sind keine Tokenzahlen und keine Garantie. Die zentrale
1,5-Reserve gilt nur bei vergleichbaren Blöcken im selben Resetzyklus.

### Ausführungsprotokoll

| ID | Messzeit | 5h / Reset | Woche / Reset | Delta | Entscheidung | Folge |
| --- | --- | --- | --- | --- | --- | --- |
| U0 | `2026-08-28T17:19:19+02:00` | `58 % / 1787946922` | `63 % / 1788496776` | `Baseline` | `CONTINUE` | `G0 read-only erlaubt` |
| U1 | `2026-08-28T22:00:14+02:00` | `98 % / 1787965149` | `58 % / 1788496776` | `5h RESET_CROSSED; Woche 1 Prozentpunkt seit Safe Closure` | `CONTINUE` | `S1 vollständig erlaubt` |
| U2 | `2026-08-28T22:10:22+02:00` | `77 % / 1787965149` | `55 % / 1788496776` | `21 / 3 seit U1; 1,5-Reserve 31,5 / 4,5 reicht` | `CONTINUE` | `S2 vollständig erlaubt` |
| U3 | `2026-08-28T22:18:01+02:00` | `60 % / 1787965149` | `52 % / 1788496776` | `17 / 3 seit U2; höchste 1,5-Reserve 31,5 / 4,5 reicht` | `CONTINUE` | `S3 vollständig erlaubt` |
| U4 | `2026-08-28T22:21:17+02:00` | `53 % / 1787965149` | `51 % / 1788496776` | `7 / 1 seit U3; Reviewreserve 10,5 / 1,5 reicht` | `CONTINUE` | `S4R vollständig erlaubt` |
| U5 | `2026-08-28T22:25:14+02:00` | `43 % / 1787965149` | `49 % / 1788496776` | `10 / 2 seit U4; erster Implementierungsblock ohne erfundene Zahlen, lokal/unreferenziert/reversibel` | `CONTINUE` | `S4 Block A vollständig erlaubt` |
| U6 | `2026-08-28T22:33:48+02:00` | `31 % / 1787965149` | `48 % / 1788496776` | `12 / 1 seit U5; statisch Caution, Block B groß und nicht als kurzer Caution-Block freigegeben` | `CONTINUE_WITH_CAUTION` | `Block B nicht begonnen; Pause und frisches U6 nach Re-entry` |
| U6R | `2026-08-29T07:06:45+02:00` | `97 % / 1787997961` | `47 % / 1788496776` | `5h RESET_CROSSED; Woche 1 Prozentpunkt seit U6` | `CONTINUE` | `S4 Block B vollständig erlaubt` |
| U7 | `2026-08-29T07:21:08+02:00` | `73 % / 1787997961` | `43 % / 1788496776` | `24 / 4 seit U6R; 1,5-Reserve 36/6 lässt 37/37` | `CONTINUE` | `S4 Block C vollständig erlaubt` |
| U8 | `2026-08-29T07:39:03+02:00` | `38 % / 1787997961` | `38 % / 1788496776` | `35 / 5 seit U7; S5.1/S5.2 ist mit Fullmatrix, Browsersession und CodeRabbit kein kurzer Caution-Block` | `CONTINUE_WITH_CAUTION` | `S5 nicht begonnen; Pause und frisches U8 nach Re-entry` |
| U8R | `2026-08-29T12:24:40+02:00` | `95 % / 1788017018` | `33 % / 1788496776` | `5h RESET_CROSSED; Woche 5 Prozentpunkte seit U8; kein numerisch berechtigter R14-S5-Vergleich im selben Resetzyklus` | `CONTINUE` | `S5.1/S5.2 vollständig erlaubt` |
| U9 | `2026-08-29T12:52:14+02:00` | `37 % / 1788017018` | `24 % / 1788496776` | `58 / 9 seit U8R; S5.3 ist mit 45-90 Minuten kein kurzer Caution-Block; 1,5-Reserve des aktuellen S5-Vergleichs 87 / 13,5 reicht nicht` | `CONTINUE_WITH_CAUTION` | `S5.3 nicht begonnen; Pause und frisches U9 nach Re-entry` |
| U9R | `2026-08-29T17:48:24+02:00` | `97 % / 1788036427` | `23 % / 1788496776` | `5h RESET_CROSSED; Woche 1 Prozentpunkt seit U9; Reserve 87 / 13,5 passt in 97 / 23` | `CONTINUE` | `S5.3 vollständig read-only erlaubt` |
| U10 | `2026-08-29T18:00:44+02:00` | `71 % / 1788036427` | `19 % / 1788496776` | `26 / 4 seit U9R; Woche liegt im inklusiven Caution-Band 10-20 %` | `CONTINUE_WITH_CAUTION` | `P1/P2-Cutover nicht begonnen; Briefing und sichere Pause` |
| U10R | `2026-08-29T18:09:39+02:00` | `65 % / 1788036427` | `18 % / 1788496776` | `6 / 1 seit U10; Woche bleibt im Caution-Band` | `CONTINUE_WITH_CAUTION` | `Owner-P1/P2 nicht ausgeübt; Android-/Delete-Entscheidungen lokal synchronisiert` |
| U10R2 | `2026-08-30T08:05:11+02:00` | `98 % / 1788087867` | `100 % / 1788674667` | `5h- und Wochenreset seit U10R überschritten; volle atomare Abschlussreserve` | `CONTINUE` | `P1/P2-Cutoverfenster ohne Zwischenpoll begonnen` |

<!-- markdownlint-enable MD013 -->

## Context Receipt

- Planungsbaseline:
  - `4be058b1b2e59f410ea8a6e3a4e5af9fdb86b652`
- Relevante Dirty Boundary bei Erstellung:
  - `docs/DEV_ENVIRONMENT.md und docs/templates/MIDAS Roadmap Workflow
    Contract.md; beide enthalten vorbestehende Secret-Readiness-Ergänzungen
    und dürfen nicht zurückgesetzt oder R14-Produktcode zugeschrieben werden.`
- G0-Fingerprints:
  - `R13 Roadmap 3f99ef293fce005573e1c3fcc3a65f4d81f191af33a5edc851638339ceed4345;
    R13 Evidence ccdd3ec4a242c84d48488e84fccacff784931e31e8e01a73fb1344dee02438a5;
    C3 Roadmap 14c66e162a4c274dba3fb3d1afb5e7a020aca8dda64424f568cbd173b1356168.`
  - `index.html 6d932c67c127b898f17951d829132a00da07358671569444a42ab02560e00cc5;
    main.js c05b1814f3a922bdb23d07486d7f8cfc04bc4dc3292b6058b86446d83b17f10d;
    Activity V1 f3a4eff3248f2ce3778ec1b99bf902bae58c69892a64864363767d70c944d8d8;
    Root-SW 09aff49364731f85e400ae24d0be54ab4a3b2a8a8fc01b732191cbcf95167ddd.`
- Gelesene Sources of Truth:
  - `AGENTS, README, Roadmap-Templates, Workflow Contract, Masterplan R14/Gates,
    Activity Overview, HCR-025..032, R13-/C3-Postimages, R8-/R9-/R10-Evidence,
    Android-Runbooks, Root-Service-Worker und reale V2-APIs.`
- Gültige Evidence-/Test-IDs:
  - `EV-ACT-R8-L01..L08; EV-ACT-R8-D01 als bewusst nicht ausgeführter
    Device-Nachweis; relevante R9- und R10-L-IDs; EV-ACT-R13-C45/R06/R07;
    HCR-032.`
- Reale Produktfakten:
  - `Pages-Build 33162838336 liefert Commit 4be058b1 erfolgreich aus; Root-SW
    v13. Live-index enthält ein C3-Training-Panel, genau einen V1-Form-/Submit-
    Pfad, zwei R13-Readerloads und null V2-Writerloads. V2 stellt Draft, Shell,
    Recovery, Commit, Data Access, History, Correction/Delete und Coaching-
    Export im Repo als AppModules.activityV2 bereit.`
- Invalidation-Bedingungen:
  - `R13-Reader/Productload -> Reader-Parität und S5-Consumer-Smokes.`
  - `C3 Training-DOM/Hub/Main -> gesamte Product-Composition und Browsermatrix.`
  - `R7/R8 Recovery/Commit -> Draft-, Offline-, Retry- und Exactly-once-Matrix.`
  - `R9 History/Lifecycle -> History/Correction/Delete-Matrix.`
  - `R10 Export -> Coaching-Download-Matrix.`
  - `Root-SW/index.html -> Fresh-/Upgrade-/Offline-PWA-Matrix.`
- Tool-/Runtime-Status:
  - `S1 read-only: Git 2.55.0, Node 24.18.0, Deno 2.9.6, Supabase CLI
    2.109.1 samt realem Help-Aufruf, Docker CLI 29.7.2, WSL psql 16.15,
    Playwright 1.61.1, CodeRabbit 0.7.5/authenticated, JDK 17 und Gradle 8.7
    verfügbar. ADB-Binary ist vorhanden; keine Deviceabfrage ausgeführt.`
  - `Docker Desktop ist installiert; der Owner hat beim Block-C-Re-entry den
    laufenden Daemon sowie geladenen/entsperrten Live Server und bestehende
    GitHub-/Supabase-Anmeldungen bestätigt. S4 verwendete dennoch weder Docker
    noch Browser-, GitHub- oder Supabase-Remoteaktionen.`
  - `Das kuratierte Operatorbundle ist vorhanden, gitignored und enthält die
    für den späteren produktiven Read-only-Preflight erwarteten Supabase-
    Authtypen; keine Werte wurden ausgegeben.`
  - `S5.3 bestätigte Supabase CLI 2.109.1, linked PostgreSQL 17.6/UTC, ein
    gesundes Projekt, beide Operatorbundletype 2/2 und den passenden Project-
    Ref. GitHub- und Supabase-Reads waren erfolgreich; keine Secretwerte wurden
    ausgegeben oder in den R14-Diff übernommen.`
- S5.3 produktives Read-only-Postimage:
  - `Git/Pages: HEAD=origin/main=Pages 4be058b1, Legacy main/Root, Build und Run
    33162838336 grün, live index/service-worker HTTP 200, Root-SW v13. Exakte
    URL mit abschließendem Punkt wurde per curl geprüft; .NET-URI-
    Kanonisierung ohne diesen Punkt ist kein Produktpostimage.`
  - `Daten: R13-Basis 66/cfddb1fa...b6f ist unverändert; ein gültiger V1-
    Zugang entstand nach R13 und vor G0, daher neue Baseline 67/b9807820...5d94
    bei invalid 0. V2 0/0/0, alle drei Tabellen- und der Request-ID-Hash
    4f53cda1...b945; Katalog 78/80/0 und Inhaltshashes exakt.`
  - `SQL/Auth/Security: elf erwartete SQL22-26-/R9-RPCs vorhanden, postgres-
    owned, erwartete INVOKER/DEFINER-/Volatility-/leere-search_path- und
    Minimal-ACL-Verträge sowie vier RLS-Tabellen/Own-select-Policies PASS.
    Auth 1 bestätigt/0 anonym. Advisors unverändert 4 WARN/8 INFO.`
  - `R13/Edge/Workflow: Snapshot schema midas.activity-consumer.v1 mit 67
    Einheiten und 0 Mixed-Source-Days; Edge 61/31/32/27 ACTIVE mit den
    erwarteten true/false/false/true-Flags; 0 relevante Workflows inflight.`
  - `Android statisch: Releasepaket de.schabuss.midas und exakte Pages-URL,
    PWA standalone; Debugsuffix .activityv2test bleibt ausgeschlossen. Auf
    Owneranweisung keine Device-/ADB-Abfrage. Android-E2E ist durch
    D-ACT-R14-17 transparent deferred und nicht PASS.`
  - `U10R2 2026-08-30T08:05:11+02:00 ist valide: 98 % 5h / 100 % Woche,
    CONTINUE. Beide Resetgrenzen wurden seit U10R überschritten; das vollständig
    reservierte atomare S5.4/S5.5-Fenster ist begonnen.`
- Validiert durch:
  - `G0 mit realen Source-/Archiv-/Pages-Fingerprints und S1 durch gezielte
    Symbol-/Consumerreads, aktuelle Sourcehashes, lokale Toolaufrufe und
    Secret-Typ-Präsenz ohne Werte.`

## Zielvertrag

R14 ist erfolgreich, wenn:

1. die bestehende Training-Produktfläche einen ruhigen V2-Einstieg mit
   `Training starten` beziehungsweise `Training fortsetzen`, `Verlauf` und
   `Export JSON` besitzt;
2. Session-Shell, lokale Katalogsuche, letzte Leistung, Strength-/Duration-/
   Distance-Eingabe und Timer produktiv dieselben bewiesenen Module verwenden;
3. IndexedDB-Recovery Reload, Backgrounding und Offlinephasen übersteht;
4. Save genau den R8-Commitpfad verwendet, Doppelklick koalesziert und den
   Draft erst nach bestätigtem Created/Replay terminal bereinigt;
5. Fehler und unbekannte Commitwahrheit den Draft bewahren und keinen zweiten
   Payload erzeugen;
6. Verlauf, Detail, Correction und Delete den R9-Vertrag verwenden und bei
   aktivem oder ungeklärtem Draft geschützt bleiben;
7. Coaching-Export ausschließlich abgeschlossene V2-Sessions über den R10-
   Vertrag lädt und herunterlädt;
8. kein aktueller Produktcallsite mehr `activity_add` oder
   `AppModules.activity.addActivity` für neue Erfassung aufruft;
9. Activity-V1-Quellen und -Daten für Historie und rollbackfähige Quellrückkehr
   erhalten bleiben, ohne weiterhin sichtbar oder produktiv geladen zu sein;
10. eine neue Katalogversion ältere gültige Recovery-/Replay-Drafts und
    gecachte Clients nicht allein wegen `highest version` blockiert;
11. Root-Service-Worker, Productload und Cacheversion atomar zusammenpassen;
12. Fresh Client und Upgrade Client bestehen Start, Recovery, Save, History
    und die R13-Reader ohne Doppelzählung; der reale Android-Nachweis bleibt
    durch D-ACT-R14-17 ausdrücklich deferred und wird nicht als PASS gewertet;
13. der Cutover ohne Datenlöschung auf den vorherigen V1-Productload
    zurückgeführt werden kann.

## Nicht-Ziele

- Keine neue SQL-, RPC-, RLS-, ACL-, Auth-, Secret- oder Schedulerarchitektur.
- Keine V1-zu-V2-Datenmigration und keine erfundenen Übungen, Sätze oder Lasten.
- Keine Löschung historischer Activity-V1-Daten oder alter V1-Quellen.
- Kein Dual Write, kein Benutzerumschalter zwischen V1 und V2.
- Keine Änderungen an Doctor View, Health Export, Reports, Protein Target,
  Trendpilot oder medizinischen Aussagen außer deren End-to-End-Smoke.
- Kein Prepared-Session-Import; dieser gehört R15.
- Keine Retention oder Legacybereinigung; diese gehört optional R16.
- Kein MCP, KI-Coaching, Trainingsplan, RPE, 1RM oder Progressionslogik.
- Kein App-Data-Clear, Uninstall oder direktes Löschen von Recoveryrecords.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Begründung |
| --- | --- | --- | --- |
| D-ACT-R14-01 | 2026-08-28 | R14 ist der einzige Activity-V2-Writer-Cutover. | Reader und Produktfläche sind bereits separat bewiesen. |
| D-ACT-R14-02 | 2026-08-28 | Nach Cutover existiert nur ein sichtbarer V2-Capture; kein Modusumschalter. | Ein Single-User-Daily-Driver braucht keine Parallelarchitektur. |
| D-ACT-R14-03 | 2026-08-28 | V1-Produktquellen bleiben zunächst im Repo, werden aber aus aktuellem Productload und Callgraph entfernt. | Schneller quellseitiger Rollback ohne historische Datenänderung. |
| D-ACT-R14-04 | 2026-08-28 | Alte V1-Daten bleiben unverändert über R13-Reader sichtbar. | V1 besitzt keine ehrlichen V2-Satzdetails. |
| D-ACT-R14-05 | 2026-08-28 | Neue Drafts verwenden Katalog v2; bestehende Drafts/Replay verwenden ihre gespeicherte Version. | Highest-version-Drift darf keine gültige Session zerstören. |
| D-ACT-R14-06 | 2026-08-28 | R14 führt keinen manuellen Sessiontag ein. | Der bestehende R8-Zeit-/Commitvertrag ist die Source of Truth. |
| D-ACT-R14-07 | 2026-08-28 | Offline darf erfasst und recovered, aber nicht als erfolgreich gespeichert dargestellt werden. | Remotecommit benötigt Netzwerk; Draft bleibt bis bestätigtem Ergebnis erhalten. |
| D-ACT-R14-08 | 2026-08-28 | Alte offene Clients werden beim Single-User-Cutover kontrolliert geschlossen/aktualisiert statt serverseitig ausgesperrt. | Ein SQL-Kill-Switch würde Scope, Rollback und Altclient-Vertrag unnötig vergrößern. |
| D-ACT-R14-09 | 2026-08-28 | Produktiver Write-Smoke ist entweder eine echte Trainingseinheit oder ein kontrollierter, per R9-UI löschbarer Smoke. | Keine verdeckte Testdaten-DML; Owner entscheidet vor P2. |
| D-ACT-R14-10 | 2026-08-28 | Rollback stellt Web/Productload auf V1 zurück, löscht aber keine V2-Daten und rollt keine Reader/SQL zurück. | Persistierte V2-Sessions bleiben gültige Gesundheitsdaten. |
| D-ACT-R14-11 | 2026-08-28 | Roadmap und sämtliche Ausführungsschritte bleiben auf High. | Tokenökonomie wird über kleinere Blöcke und Gates statt Reasoningwechsel erreicht. |
| D-ACT-R14-12 | 2026-08-28 | P1-Deploy und P2-Android-Smoke bilden nach gemeinsamer Vorabfreigabe ein atomares Cutoverfenster. | SAFE_CLOSURE darf das Produkt nicht zwischen Deploy und Pflichtsmoke unvalidiert zurücklassen. |
| D-ACT-R14-13 | 2026-08-28 | Der neue Productowner registriert genau `AppModules.activityV2.productController.mount(options)` und gibt einen einmalig gemounteten, gefrorenen Controller zurück. | Eine einzige Compositiongrenze verhindert Doppelmount, Ambient Dependencies und Dual Write. |
| D-ACT-R14-14 | 2026-08-28 | Der Weight-Chart erhält seine Tagesmarker aus dem unveränderten R13-Snapshotadapter; Activity V1 wird dafür weder geladen noch als Runtime-Fassade nachgebaut. | V1-only bleibt darstellungsparitätisch, V2 wird sichtbar und R13-/medizinische Berechnung bleibt unverändert. |
| D-ACT-R14-15 | 2026-08-28 | Cutover-SW verwendet monoton `v14`; ein bedingter V1-Webrollback wird als eigenes `v15`-Productload-Postimage vorbereitet. | Ein Rollback darf nicht auf einen bereits aktivierten alten Cachetoken zurückfallen. |
| D-ACT-R14-16 | 2026-08-28 | Logout flusht und zerstört nur In-Memory-Composition; IndexedDB-Recovery bleibt erhalten. Login mountet erst nach bestehender Authentscheidung erneut. | Keine lokale Datenlöschung, kein neuer Authvertrag und kein fremder Remotezugriff. |
| D-ACT-R14-17 | 2026-08-29 | Der reale Android-Smoke ist auf ausdrückliche Ownerentscheidung deferred; kein PC-/ADB-Zugriff und keine erfundene PASS-Evidence. Web/PWA-Funktionsnachweise bleiben Pflicht, reine Abstandsabweichungen gehören ins spätere Polishing. | Das verfügbare Handy kann nicht vom PC getestet werden; frühere Handysmokes nutzten LiveServer. Der revidierte R14-DONE-Vertrag bleibt durch das transparente Gap ehrlich. |
| D-ACT-R14-18 | 2026-08-29 | P1 Web/PWA-Cutover einschließlich bedingtem v15-Webrollback und P2 für genau einen V2-Smoke-Write mit anschließendem normalem R9-Delete sind gemeinsam erteilt. | Owner fordert Fortsetzung nach Briefing; der Testdatensatz soll nicht bestehen bleiben. Die Freigabe wird erst bei erlaubendem Usage-Gate ausgeübt. |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

Vor P1 erklärt der Agent knapp:

- welche Produktdateien V1 deaktivieren und V2 aktivieren;
- welches Web-/PWA-Postimage erwartet wird;
- wie alte offene Clients aktualisiert werden;
- wie ohne Datenverlust auf V1 zurückgekehrt wird.

Vor P2 bestätigt Stephan:

- den tatsächlich verwendeten Web-/PWA-Client;
- dass Android gemäß D-ACT-R14-17 deferred bleibt;
- dass der erste V2-Datensatz nach bestandenem Nachweis über den normalen
  R9-Flow wieder gelöscht wird; dies ist mit D-ACT-R14-18 bestätigt.

P1 und P2 werden vor dem Cutoverfenster gemeinsam eingeholt. P1 umfasst die
bedingte Rückkehr auf das bestätigte V1-Webpreimage, falls ein Pflichtsmoke
fehlschlägt. Eine unerwartete Datenkorrektur bleibt P3.

## Scope-Freeze vor S4

S4 darf beginnen, wenn S4R bestätigt:

- keine neue Datenbank- oder Autharbeit;
- exakte Productload-Reihenfolge aller benötigten V2-Module;
- genau eine produktive Controller-/Lifecycle-Komposition;
- V1-Form, Submitlistener und Writercallsite können ohne Leserbruch entfernt
  werden;
- Root-SW und UI können gemeinsam versioniert werden;
- die folgenden Blöcke sind separat resumierbar.

Vorgeschlagene Blöcke:

- Block A `S4.1-S4.2`: Product Controller, Scriptreihenfolge und Training-
  Einstieg ohne Writerwechsel nach außen.
- Block B `S4.3-S4.5`: Recovery, Commit, History und Export atomar komponieren;
  lokale Fakes/Tests, noch kein Deploy.
- Block C `S4.6-S4.7`: V1-Callsite deaktivieren, Productload/SW/Cache und
  Rollbackartefakte finalisieren.

S4R darf diese Gruppierung verkleinern, aber keine neuen Fachziele ergänzen.

## Tool Permissions und Gates

<!-- markdownlint-disable MD013 -->

| Aktion | Erlaubnis |
| --- | --- |
| Repo lesen, lokal editieren, lokale Tests/Harnesses | autonom nach Usage-Gate |
| Docker/disposable PostgreSQL | nur wenn durch invalidierten DB-Vertrag nötig; sonst Evidence wiederverwenden |
| CodeRabbit | ausschließlich S5, genau 1 Initial + höchstens 1 Verifikation |
| Supabase produktiv read-only | S5.3 nach Roadmapvertrag |
| Web-/PWA-Deploy, Commit oder Push | P1 |
| produktiver V2-Write und normaler R9-Delete | P2 / D-ACT-R14-18 |
| Android/ADB | durch D-ACT-R14-17 deferred; keine Ausführung |
| bedingter Webrollback im Cutoverfenster | in P1 vorab enthalten |
| normale R9-Löschung des freigegebenen Smoke-Datensatzes | in P2 vorab festlegen |
| unerwartete produktive Korrektur/Löschung | P3 |

<!-- markdownlint-enable MD013 -->

## Secret Readiness Matrix

S4R ersetzt diese Planungsmatrix durch reale Namen und Status. Werte werden nie
in Roadmap oder Evidence geschrieben.

<!-- markdownlint-disable MD013 -->

| Consumer | Benötigter Secret-/Auth-Typ | Quelle | Erwartung |
| --- | --- | --- | --- |
| lokaler Browser | bestehende MIDAS-Owner-Session | Browser/Auth-Lifecycle | `READY/PASS S5.1`; Edge-Session read-only, kein neues Secret |
| produktiver Read-only-Preflight | `SUPABASE_PROJECT_REF` + `SUPABASE_SERVICE_ROLE_KEY` | gitignored `.env.supabase.local` gemäß DEV_ENVIRONMENT | `READY 2/2 Typen`; Wertnutzung erst S5.3 |
| Pages/Web-Cutover | bestehende Git-/GitHub-Authentisierung | Operatorumgebung | `READY`; P1-gated, kein neuer App-Secret |
| CodeRabbit S5 | bestehende Agent-/GitHub-Authentisierung | kanonischer `coderabbit`-Shim | `READY/authenticated`; nur genau ein Initiallauf |
| Android Daily-Driver | bestehende native/PWA-Konfiguration | reales Gerät | `DEFERRED BY OWNER / NOT PASS`; keine Deviceabfrage oder Secretkopie |

<!-- markdownlint-enable MD013 -->

Fehlt ein Consumerpfad oder müsste ein neues Secret erzeugt werden, stoppt R14
vor S4 beziehungsweise P1.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| G0 | R13-/C3-Postimage-Gate | `High` | PASS | DONE-Quellen und Fingerprints stimmen; Pages 4be058b1/Run 33162838336 liefert C3 mit V1 als einzigem Writer, R13-Readern, null V2-Writerload und SW v13. |
| S1 | System- und Vertragsdetektivarbeit | `High` | PASS | Productload/API-/Producer-/Consumer-/Lifecycle-/Cache-/Client-/Deploy-/Rollbackkarte vollständig; F-ACT-R14-13/-14 S2/S4 zugeordnet, kein neuer SQL-/Auth-/Secretbedarf. |
| S2 | Fachlicher und technischer Zielvertrag | `High` | PASS | Productcontroller, Zustände/Copy/Fokus, Katalog-, Save-/Recovery-/Auth-/Multi-Tab-, V1-Reader-, Cache-/Rollback- und P2-Testdatensatzvertrag vollständig eingefroren. |
| S3 | Bruchrisiko-, Security- und Cutoverreview | `High` | PASS | Alle P0/P1-Zeitlinien besitzen Prevention, Testorakel, Evidence-ID und Stop-/Rollbackpfad; F-ACT-R14-15..19 vertraglich geschlossen, kein unzugeordnetes P0/P1. |
| S4R | Readiness Review | `High` | PASS | Large but controlled; drei sichere lokale Wellen, vollständiger Datei-/Test-/Rollbackscope, reale Tool-/Secretbereitschaft und autonome Grenze S5.3 bestätigt. |
| S4 | Lokale Umsetzung | `High` | PASS | Block A-C PASS: vollständige Composition, atomarer lokaler V2-Productload/SW v14, null V1-Writerload, unveränderte R13-Reader, v15-Inverse und native Full-S4-Reviews grün. |
| S5 | Tests, produktiver Cutover und Android | `High` | CUTOVER IN PROGRESS | S5.1-S5.3 PASS. U10R2 98/100 ergibt CONTINUE; P1/P2-Cutoverfenster begonnen, Android owner-deferred. |
| S6 | Doku-Sync und Archiv | `High` | TODO | |

## Findings

| ID | Priorität | Kategorie | Status | Korrektur / Zuordnung |
| --- | --- | --- | --- | --- |
| F-ACT-R14-01 | P1 | Stale PWA | fixed in plan | Alter offener V1-Client wird als Single-User-Rolloutschritt geschlossen/aktualisiert; Fresh und Upgrade werden separat geprüft. |
| F-ACT-R14-02 | P1 | Rollback | fixed in plan | Rollback ist ausschließlich Productload/Web; keine V2- oder V1-Datenlöschung und kein Reader-/SQL-Rollback. |
| F-ACT-R14-03 | P1 | Katalog | fixed in plan | Neue Drafts v2, Recovery/Replay gespeicherte Version; Highest-Version ist kein Replaygate. |
| F-ACT-R14-04 | P1 | Save/Offline | fixed in plan | Kein Success vor bestätigtem Commit; Unknown/Known-Fehler bewahren Recovery und identischen Retry. |
| F-ACT-R14-05 | P1 | Android-Reihenfolge | superseded by D-ACT-R14-17 | Ursprünglicher Device-Smoke ist owner-deferred; der bedingte P1-Webrollback bleibt für Web-/PWA-/Write-/Readerfehler aktiv. |
| F-ACT-R14-06 | P1 | Datum | fixed in plan | Kein C3-V1-Datumsfeld in V2 übernehmen; bestehender Sessionzeitvertrag bleibt maßgeblich. |
| F-ACT-R14-07 | P1 | Scope | fixed in plan | Keine neue SQL-/Auth-/Secretarchitektur; Abweichung ist Stop-Gate. |
| F-ACT-R14-08 | P2 | Reasoning/Usage | fixed in plan | Alle Wellen High; Usage-Gates und kleinere Blöcke verhindern Dirty Stops. |
| F-ACT-R14-09 | P2 | Usage Contract | fixed in plan | Metadaten und Checkpointtabelle nennen konsistent U0-U13; U1 liegt explizit vor S1. |
| F-ACT-R14-10 | P1 | Consumer Side Effect | fixed in plan | Protein-/Trendpilot-Smokes verwenden nur vorhandene non-mutating Diagnose-/Dry-run-Pfade; keine Schedule- oder Fachdatenänderung. |
| F-ACT-R14-11 | P1 | Cutover Atomicity | amended by D-ACT-R14-17/-18 | P1/P2 bleiben gemeinsam; zwischen Deploy und Web-/PWA-Write-/Reader-/Delete-Abschluss liegt kein Usage-Stop. Android ist deferred, Webrollback bleibt Teil von P1. |
| F-ACT-R14-12 | P2 | Runtime Postimage | fixed in G0 | Die historische C3-Resume-Notiz endete vor Deploy; GitHub Pages hat danach b6fb619e und 4be058b1 erfolgreich ausgeliefert. R14 verwendet das reale Pages-Postimage 4be058b1 als Baseline; Writer-, Reader- und Cachevertrag sind unverändert grün. |
| F-ACT-R14-13 | P1 | V1-Reader-Consumer | fixed in contract / S4 | `doctor-stack/charts` bezieht Weight-Chart-Trainingsmarker künftig aus dem unveränderten R13-Snapshotadapter und bildet daraus deterministisch genau einen Marker pro aktivem Tag; kein V1-Source-/Writerload und keine medizinische Berechnungsänderung. |
| F-ACT-R14-14 | P1 | Writer-Cutover | fixed in contract / S4 | V1-DOM, Main-Listener und Scriptload werden atomar ersetzt. Null `addActivity`/`activity_add` im Produkt, ein fail-closed V2-Commit und ein produktiver Exactly-once-Smoke sind Pflichtorakel. |
| F-ACT-R14-15 | P0 | Commit/Lifecycle | fixed in risk contract / S4 | Logout/Destroy darf einen begonnenen `preparing`-/`committing`-Vorgang nicht lokal abbrechen. Productowner wartet dessen Settlement ab; Unknown-/Intentzustand bleibt persistent, erst danach Flush+Destroy ohne Discard. |
| F-ACT-R14-16 | P1 | Rollback/Cache | fixed in risk contract / S4 | Rollback stellt nur explizite Produktpfade aus 4be058b1 wieder her und patcht den Worker auf v15; kein pauschales Revert der R14-Evidence und kein Rückfall auf Cache v13. |
| F-ACT-R14-17 | P1 | Privacy/Event | fixed in risk contract / S4 | Das V2-`activity:changed`-Event ist payloadfrei und wird erst nach bestätigtem Commit einmal ausgelöst; keine Request-ID, Payload oder Healthdetails im Event/Log. |
| F-ACT-R14-18 | P1 | Android Target | superseded by D-ACT-R14-17 | Debug-Harness bleibt ausgeschlossen; kein reales Deviceziel wird in R14 ausgeführt oder als PASS behauptet. |
| F-ACT-R14-19 | P1 | SW Asset Identity | fixed in risk contract / S4 | `CORE_ASSETS` verwendet exakt dieselben URL-/Query-Identitäten wie der Productload und enthält für v14 alle V2-Abhängigkeiten beziehungsweise für v15 den V1-Rollbackload. Jeder 404 blockiert Activate. |
| F-ACT-R14-20 | P1 | Historische Testorakel | fixed in S5.1 | 21 R10/R11/R12-Assertions erwarteten noch produktunreferenzierte Reader/Capture-Module oder aktive statt archivierte Contractpfade. Ausschließlich diese invalidierten Testpostimages wurden auf den beschlossenen R13/R14-Productload aktualisiert; 293/293 Node und 45/45 Deno PASS. |
| F-ACT-R14-21 | P1 | CodeRabbit / R10-Orakel | fixed in S5.2 | Die einzige bewusst aus dem alten R10-Git-Diff-Orakel ausgenommene Productload-Contractdatei ist als reale R14-Invalidierung dokumentiert und zusätzlich auf SHA-256 `e6d62f15...4f2a` festgesetzt; übrige 19 R10-Orakel bleiben Git-geschützt. Verifikation 0 Findings. |
| F-ACT-R14-22 | P2 | V1-Datenbaseline | accepted / rebaselined in S5.3 | Die 66er-R13-Basis ist mit Hash `cfddb1fa...b6f` unverändert. Genau ein kanonischer, gültiger V1-Zugang entstand danach und vor G0 über den weiterhin einzigen produktiven Writer; keine V1-/V2-Daten wurden geändert oder gelöscht. Neue PRE02-Baseline 67/`b9807820...5d94`, invalid 0. |
| F-ACT-R14-23 | P1 | Android-DONE-Vertrag | accepted / scope amended by owner | D-ACT-R14-17 führt Android transparent als deferred und nicht PASS; Web/PWA-Funktionsnachweis bleibt Pflicht, Layoutpolishing später. Kein Device-/ADB-Zugriff. |

<!-- markdownlint-enable MD013 -->

## G0 - R13-/C3-Postimage-Gate

1. U0 ausführen.
2. R13 Roadmap/Evidence und C3 Roadmap als `(DONE)` im Archiv bestätigen.
3. Relevante Follow-up-Postimages mit aktuellem Git-, Productload-, SW- und
   Runtimezustand vergleichen.
4. Bestätigen, dass R13-Reader aktiv sind, C3 Training sichtbar ist, Activity
   V1 der einzige Writer und Activity V2 produktiv 0/0/0 oder nur durch
   legitime zwischenzeitliche Nutzung erklärbar ist.
5. Baseline, Dirty Boundary, Context Receipt, Invalidation Map, Evidence und
   Resume Card synchronisieren.
6. Full Contract Review; berechtigte Findings minimal korrigieren.
7. U1 ausführen und nur bei erlaubter Continuation mit S1 beginnen.

Exit: R14 beginnt auf einem belegten Reader-, Produktflächen- und Writerstand.

Ergebnis 2026-08-28: `PASS`.

- Archivierte R13-Roadmap/Evidence und C3-Roadmap sind vorhanden, `DONE` und
  fingerprintgleich zu ihren gültigen Receipts.
- HEAD und `origin/main` sind 4be058b1; nur die beiden R14-Dateien sowie die
  vorbestehende Secret-Readiness-Doku sind dirty.
- GitHub Pages ist ein Legacy-Build aus `main`/Root; Run 33162838336 auf
  4be058b1 ist erfolgreich. Der öffentlich gelieferte Stand enthält C3,
  Activity V1 als einzigen Writer, die R13-Reader und Root-SW v13.
- Der letzte geschützte V2-Datenpoststand bleibt R13 `0/0/0`; seitdem existiert
  kein produktiver V2-Writer. Der exakte aktuelle Remote-Read wird nicht vor
  dem dafür freigegebenen S5.3-PRE02 vorgezogen.
- Full Contract/Scope/Security Review: `PASS`; F-ACT-R14-12 ist geschlossen,
  kein P0/P1 und kein neuer SQL-/Auth-/Secret-/Schedulerbedarf.

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

1. Productload, Scriptreihenfolge, Training-DOM, Main-Listener, Hub-Lifecycle
   und Root-SW gezielt kartieren.
2. Öffentliche APIs von Draft, Semantik v1/v2, Shell, Recovery, Commit, Data
   Access, History, Correction/Delete und Coaching-Export erfassen.
3. Direkte V1-Consumer und alle produktiven `activity_add`-/`addActivity`-
   Callsites beweisen.
4. R8-/R9-/R10-Evidence anhand Fingerprints übernehmen; nur reale
   Invalidierungen markieren.
5. Tatsächlich verwendete Browser-/PWA-/native Android-Clients und den
   bestehenden Deployweg ohne Deviceaktion erfassen.
6. Toolstatus und Secret Readiness Matrix read-only verifizieren.
7. S1 Full Review, Findings-, Receipt-, Evidence-, Resume- und U2-Sync.

Exit: Producer-, Consumer-, UI-, Lifecycle-, Cache-, Device- und
Rollbackkarte ist vollständig.

### S1 Gate Record - 2026-08-28

Urteil: `PASS`; vollständige read-only Discovery, kein Produkt-, Remote- oder
Devicewrite. U2 ist die nächste sichere Blockgrenze.

- Productload/UI:
  - `index.html` lädt aktuell Hub v13, Activity V1 vor Supabase/Auth, danach die
    zwei R13-Readermodule plus Doctor-View und zuletzt `assets/js/main.js`.
    V2-Capture-, History- und Exportmodule sind nicht produktiv geladen.
  - `#hubTrainingPanel` enthält ausschließlich das C3-V1-Formular mit manuellem
    `trainingDate`; der Hub öffnet `training`, setzt Panel/Body/Fokuszustand
    und schließt über Closebutton/Escape. R14 übernimmt das manuelle V1-Datum
    nicht in V2.
  - Main besitzt genau einen produktiven `addActivity`-Callsite und der
    V1-Source genau einen `activity_add`-RPC-Callsite. Kein zweiter Writer ist
    im Productload vorhanden.
- V2-Producer/API:
  - Semantik v1 und v2 exponieren jeweils `getCatalog`, `getEntryByKey`,
    `normalizeSearchText`, `validateCatalog`, `search`; neue Drafts wählen v2,
    Recovery löst die gespeicherte Katalogversion über `resolveSemantics`.
  - Draft exponiert `create/restore`; Recovery
    `resolveSemantics/createIndexedDbStore/open`; Commit `create`; Shell
    `mount`. Die Controllerflächen für Draftmutation, Recovery/Intent,
    Finish/identischen Retry und Shell-Open/Close/Render sind exakt erfasst.
  - Data Access exponiert `commitSession`, `loadLastPerformance`,
    `listSessions`, `loadSessionDetail`, `loadCoachingExport`,
    `replaceSession`, `deleteSession`; History, Correction/Delete und Coaching-
    Export komponieren ausschließlich diese bestehenden APIs.
- Consumer/Lifecycle:
  - R13 Doctor/Health-Export bleiben auf
    `activityV2.consumerDataAccess.loadSnapshot`; `doctor-stack/charts` ist der
    einzige zusätzliche direkte V1-Reader-Consumer und begründet
    F-ACT-R14-13.
  - Recovery flusht an `visibilitychange/pagehide`; Shell beobachtet
    `visibilitychange`; Hub und Main besitzen eigene Resume-Lifecyclehooks.
    R14 braucht daher genau einen Productcontroller als Owner der gemeinsamen
    Instanzen und ihrer Destroy-/Resume-Reihenfolge.
- Cache/Clients/Deploy/Rollback:
  - Root-SW v13 precacht R13-Reader und Main, löscht alte MIDAS-Caches bei
    Activate, übernimmt mit `clients.claim`, verwendet Navigation Network-
    first plus Shellfallback und statische Cache-Updates. PWA-Update wird erst
    nach Benutzeraktion per `SKIP_WAITING` und `controllerchange` aktiviert.
  - Manifest-PWA startet standalone unter `/M.I.D.A.S./`. Die native Release-
    Hülle `de.schabuss.midas` lädt dieselbe Pages-URL in `MidasWebActivity`;
    der Debugclient `de.schabuss.midas.activityv2test` ist eine isolierte lokale
    Testhülle und kein Produktclient. Welcher Produktclient auf welchem echten
    Gerät Daily-Driver ist, bleibt ohne verbotene Deviceabfrage offen bis P2.
  - GitHub Pages ist Legacy-Build aus `main`/Root; der P1-Weg ist ein
    freigegebener R14-Commit und Push nach `origin/main`, gefolgt vom Pages-
    Run. Rollback nimmt nur den R14-Web-/Productload-Diff auf das eingefrorene
    4be058b1-Preimage zurück; keine SQL-, Reader- oder Dateninverse.
- Evidence/Invalidation:
  - R8 Draft/Recovery/Commit bleibt anhand aktueller Hashes
    `7ac418c5…e253`, `6d818a2a…189d`, `24fcc10b…cfd7` gültig; R9 History/Shell
    stimmen exakt mit `4a6872fb…bf5`/`588efd44…4b3` überein; R10 Export/Data-
    Access/Controller stimmen exakt mit `db5456b7…ebd`, `35f878c1…8ac` und
    `8c8d3690…1a0` überein. Keine dieser Matrizen ist vor S4 invalidiert.
  - R14 wird Productload, Main/Hub, Root-SW und neue Composition ändern; damit
    werden C3-Productload-/PWA-Orakel und die integrierten R8-R10-Browserpfade
    für S5 invalidiert, nicht deren unveränderte isolierte Kernverträge.
- Full Contract/Scope/Security Review: `PASS`; F-ACT-R14-13/-14 sind konkret
  S2/S4 zugeordnet. Kein P0, kein neuer SQL-/RPC-/RLS-/ACL-/Auth-/Secret- oder
  Schedulervertrag und keine produktive Wirkung.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / High`.

1. Exakte Product-Controller-API und einmalige Initialisierung festlegen.
2. Idle-, Recoverable-, Editing-, Saving-, Unknown-, Committed-, History- und
   Exportzustände samt Fokus und deutscher UI-Copy einfrieren.
3. Katalogselektor festlegen: neuer Draft aktuell v2; restore/replay per
   gespeicherter Version; unbekannte Version fail-closed ohne Discard.
4. Save-, Retry-, Logout-, Background-, Reload-, Offline- und Multi-Tab-
   Lebenszyklus auf bestehende R7/R8-Verträge abbilden.
5. V1-Deaktivierung und V2-Productload ohne toten Readerconsumer festlegen.
6. Fresh-/Upgrade-/stale-client-, Cache- und Rollbackvertrag exakt machen.
7. Produktiven Testdatensatz und seine normale Beibehaltung beziehungsweise
   R9-Löschung als P2-Ownerwahl vorbereiten; P3 nicht vorsorglich verbrauchen.
8. S2 Full Review, Findings-, Evidence-, Resume- und U3-Sync.

Exit: Kein Implementierungsdetail benötigt eine neue Produktentscheidung.

### S2 Gate Record - 2026-08-28

Urteil: `PASS`; der Zielvertrag ist vollständig, lokal reversibel und benötigt
keine neue Datenbank-, Auth-, Secret-, Scheduler- oder medizinische
Produktentscheidung. U3 ist die nächste sichere Blockgrenze.

#### Productcontroller und Initialisierung

- Neue gefrorene Modul-API:
  `AppModules.activityV2.productController.mount(options)`.
- `options` besitzt exakt die DOM-Hosts `host`, `sessionHost`, `historyHost`,
  `exportHost`; die APIs `semantics`, `resolveSemantics`, `sessionDraft`,
  `sessionRecovery`, `sessionCommit`, `sessionShell`, `dataAccess`,
  `sessionCorrection`, `sessionHistory`, `sessionHistoryShell`,
  `coachingExport`, `coachingExportController`, `coachingExportShell`; sowie
  die Funktionen `now`, `createRequestId`, `createLeaseToken`,
  `confirmDiscard`, `refreshActivityConsumers`. Unknown Keys, Accessoren,
  fehlende Methoden oder nicht passende Hosts führen vor Listener-/DOM-
  Mutation zu `INVALID_OPTIONS`.
- Rückgabe ist ein gefrorener Controller mit exakt `getState`, `subscribe`,
  `startSession`, `continueSession`, `discardRecoveredSession`, `openHistory`,
  `openExport`, `requestClose`, `setAuthenticated`, `destroy`.
- Pro `host` und `document` ist genau ein Mount erlaubt. Main ruft ihn einmal
  in `INIT_MODULES` nach bestehender Supabase-/Authentscheidung auf. Weder Hub-
  Open noch Resume erzeugt eine zweite Instanz. Partielle Composition wird
  vollständig zurückgebaut und bleibt ohne Writer.
- Der öffentliche State enthält nur `state`, `reason`, `busy`,
  `recovery_state`, `commit_state`, `active_surface`; niemals Request-ID,
  Payload, Healthdetail oder Secret.

#### Zustände, Fokus und Copy

<!-- markdownlint-disable MD013 -->

| State | Anzeige / Aktion | Fokus- und Mutationsvertrag |
| --- | --- | --- |
| `idle` | `Training starten`, `Verlauf`, `Export JSON` | Fokus auf `Training starten`; neuer Draft erst nach Nutzeraktion mit Katalog v2 |
| `recoverable` | `Gespeicherter Trainingsentwurf vorhanden.`, `Training fortsetzen`, `Entwurf verwerfen` | Fokus auf `Training fortsetzen`; kein implizites Start-New oder Discard |
| `editing` | bestehende Session-Shell `Training erfassen` | `sessionShell.open` fokussiert den Picker; Recovery autosaved |
| `saving` | bestehende Copy `Abschluss wird sicher vorbereitet …` / `Session wird gespeichert …` | Commitaktion disabled/busy; Close, History, Export und Draftmutation gesperrt |
| `unknown` | bestehende Copy `Speicherstatus unklar. Nur identisch erneut versuchen.` | Fokus auf `Identisch erneut versuchen`; identischer Intent/Request-ID/Payload |
| `committed` | `Session gespeichert.` | erst nach bestätigtem `created/replayed`; payloadfreies `activity:changed`, Reader-/Historyrefresh genau einmal, dann Fokus `Training starten` |
| `history` | bestehende `Trainingshistorie` | Read erlaubt; Correction/Delete folgen bestehendem Mutation Guard; Close stellt Fokus auf `Verlauf` zurück |
| `export` | `Export JSON` mit bestehender R10-Copy | rein read-only; Close/Download stellt Fokus auf `Export JSON` zurück |
| `blocked` | `Training ist sicher blockiert. Der lokale Entwurf bleibt erhalten.` | keine Mutation/kein Discard; Retry nur wenn bestehender Recovery-/Commitvertrag ihn erlaubt |
| `destroyed` | keine aktive Oberfläche | idempotent, keine Listener/Timer/Controller; Recoveryrecord unverändert |

<!-- markdownlint-enable MD013 -->

Entry-, Recovery- und Produktcopy kommt neu aus dem Productcontroller. Commit-,
History-, Correction/Delete- und Exportcopy wird unverändert aus den bewiesenen
R8-R10-Shells übernommen.

#### Katalog-, Save- und Lifecyclevertrag

- `startSession` injiziert ausschließlich `semanticsV2` (Katalog v2).
  `continueSession`, Recovery, Intentvalidierung und Replay rufen
  `resolveSemantics(snapshot.catalog_version)` auf. Unbekannte oder ungültige
  Version bleibt `blocked`; weder Highest-Version-Check noch Discard.
- Finish folgt unverändert Flush -> ein Clockread -> persistierter Intent ->
  Attempt -> `dataAccess.commitSession` -> Complete. `created` und `replayed`
  sind Success; Known/Unknown/Auth/Transport/malformed bewahren Recovery und
  erlauben ausschließlich den vorhandenen identischen Retry.
- Offline darf Draft/Recovery fortsetzen. Finish zeigt keinen Success und
  bleibt retrybar. `visibilitychange:hidden` und `pagehide` nutzen nur den
  vorhandenen Recovery-Flush; Resume/Fokus liest State, mountet aber nichts neu.
- `setAuthenticated(false)` fordert sicheren Shell-Close an, flusht, zerstört
  History/Export/Commit/Recovery-Controller und entfernt Listener, ohne
  IndexedDB-Discard. `setAuthenticated(true)` komponiert nach der vorhandenen
  Authentscheidung frisch. Authablauf während Commit bleibt Known/Unknown gemäß
  R8 und wird nicht in einen neuen Auftrag umgewandelt.
- Pro Tab existiert ein Productcontroller. Multi-Tab-Koordination bleibt beim
  bestehenden Recovery-Observation-/Lease-/CAS-Vertrag: stale Writer wird
  `conflict/blocked`, nie Last-write-wins; kein BroadcastChannel, SQL-Lock oder
  zweiter Writer wird ergänzt.

#### V1-, Reader- und Productloadvertrag

- `#activityForm`, `trainingDate`, der gesamte Main-V1-Submit-/Cancelblock,
  `AppModules.activity.addActivity`, `activity_add` und der produktive Load von
  `app/modules/vitals-stack/activity/index.js` verschwinden in derselben
  kohärenten Welle. Die V1-Datei bleibt unverändert im Repo.
- Der Weight-Chart ruft den unveränderten
  `activityV2.consumerDataAccess.loadSnapshot({from,to})` auf. Für V1-only ist
  Label/Dauer/Notiz exakt der einzelne R13-V1-Unitwert. Mehrere V2-/Mixed-
  Units ergeben genau einen Marker je Tag: Dauer als Summe, einzelnes Label/
  Note nur bei genau einer Unit, sonst `<n> Trainings` und keine zusammen-
  kopierte Note. Das beeinflusst keine Trend-/Gewichtsberechnung.
- R13 Consumer, Data Access, Doctor View und Health Export bleiben source-
  unverändert und werden exakt einmal in derselben Reihenfolge geladen.
- Geplante neue Scriptreihenfolge an der bisherigen V1-Position:
  `semantics`, `semantics-v2`, `session-draft`, `session-recovery`,
  `session-commit`, `session-canonicalization`, `activity-coaching-export`,
  `data-access`, `session-shell`, `session-correction`, `session-history`,
  `session-history-shell`, `activity-coaching-export-controller`,
  `activity-coaching-export-shell`, `activity-product-controller`. Danach
  bleiben Supabase/Auth und die R13-Readerreihenfolge bestehen. Zugehörige
  Product-/Shellstyles werden atomar ergänzt; keine Harness-/Fixtureassets.

#### Fresh-, Upgrade-, stale-client-, Cache- und Rollbackvertrag

- Cutover erhöht den realen Root-SW-Token v13 auf `v14` und precacht alle
  produktiv geladenen V2-JS-/CSS-Dateien plus unveränderte R13-Reader. Ein 404
  lässt Install failen, sodass der v13-Controller aktiv bleibt. Activate löscht
  alte MIDAS-Caches erst für den vollständigen v14-Worker.
- Fresh lädt v14 direkt. Upgrade startet kontrolliert auf v13, erhält das
  bestehende Updatebanner, sendet erst nach Nutzeraktion `SKIP_WAITING` und
  lädt nach `controllerchange` das kohärente v14-Postimage. Ein alter offener
  V1-Tab wird als stale nachgewiesen, aber vor dem P2-Write geschlossen oder
  aktualisiert; er wird nicht serverseitig ausgesperrt und darf keinen Smoke-
  Write senden.
- Der vorab materialisierte bedingte Rollback liefert V1-Form/Main-/Scriptload
  und unveränderte R13-Reader mit einem monotonen Root-SW `v15`. Er löscht
  weder V1-/V2-Healthdaten noch Recoveryrecords und rollt SQL/R13 nicht zurück.
  Er gilt identisch vor Write, nach bestätigtem Write und nach Reader-Smoke;
  eine bereits persistierte V2-Session bleibt lesbar.

#### Produktiver P2-Testdatensatz

- Genau eine ownerbestätigte Session über die reale v2-UI, mit einem im
  aktuellen Katalog aktiven Strength-Item und genau einem gültigen Set, damit
  Session/Item/Set und Exactly-once beweisbar sind. Item und Werte werden erst
  am P2-Gate aus der realen UI gewählt; R14 erfindet keine Übung oder
  Gesundheitsangabe. Request-ID und Payload werden nie dokumentiert.
- Ownerwahl vor P1/P2: eine wahrheitsgetreue reale Session bleibt normal
  erhalten; ein ausdrücklich synthetischer Smoke wird erst nach Write-,
  History-, R13-Reader- und Android-Nachweis über den normalen R9-Delete
  entfernt. Diese normale Wahl ist P2, keine P3-Reparatur.
- Bei Unknown/Responseverlust wird derselbe Auftrag erneut geprüft; kein
  zweiter Datensatz. Unerwartete Korrektur oder Löschung außerhalb dieses
  vorab gewählten R9-Flows bleibt P3.

Full Contract/Scope/Privacy Review: `PASS`; F-ACT-R14-13/-14 sind im Vertrag
geschlossen und besitzen konkrete S4-/S5-Orakel. Kein offenes P0/P1 und keine
neue Produktentscheidung.

## S3 - Bruchrisiko-, Security- und Cutoverreview

Reasoning: `GPT-5.6 Sol / High`.

Mindestens prüfen:

- V1 und V2 gleichzeitig sichtbar, geladen oder schreibend;
- doppelte Listener, doppelter Mount, doppelter Commit und Multi-Tab-Race;
- Save während Offline, Responseverlust, malformed Response und Authablauf;
- Reload/Background/Pagehide vor, während und nach Commit;
- Catalog highest-version drift bei neuem, recovertem und gecachtem Draft;
- Recoveryquarantäne und verbotener physischer Delete;
- History/Correction/Delete während aktivem oder ungeklärtem Draft;
- Export bei Empty, Error, großer Range und stale Response;
- XSS, sensible Logs, Request-ID-/Payload-/Secretleaks;
- Logout, neuer Login und fremder Ownerzustand;
- SW-Install/Activate/Claim, Cache-Mix, 404 in `CORE_ASSETS`, stale HTML/JS;
- Fresh Client, Upgrade Client, bereits offener alter V1-Tab;
- Doctor/Report/Health/Protein/Trend-Doppelzählung nach V2-Write;
- Android Prozessreclaim, Netzwerkwechsel und Fokus/Tastatur/Touch;
- Rollback nach Deploy vor Write, nach Write und nach Reader-Smoke;
- Dirty Worktree, fremde Änderungen und deployauslösender Commit.

Jedes P0/P1 erhält Prevention, Testorakel, Evidence-ID und Stop-/Rollbackpfad.
Danach Full Review, Findings-, Evidence-, Resume- und U4-Sync.

Exit: Keine unzugeordnete P0/P1-Zeitlinie.

### S3 Gate Record - 2026-08-28

Urteil: `PASS`; Full Code-/Contract-/Security-/Privacy-/Cache-/Rollback-/
Consumerreview auf dem S2-Zielvertrag. Jede P0/P1-Zeitlinie hat Prevention,
Testorakel, Evidence-ID und Stop-/Rollbackpfad. Keine Produktwirkung.

<!-- markdownlint-disable MD013 -->

| Risiko | Prio / Zeitlinie | Prevention | Pflichtorakel / Evidence | Stop / Rollback |
| --- | --- | --- | --- | --- |
| Dual Surface oder Dual Write | P0; Load bis erster Save | V1-DOM, Main-Listener und V1-Script in derselben Welle entfernen; nur Productcontroller mountet V2 | DOM-/Productloadscan: ein V2-Capture, null V1-Form/`addActivity`/`activity_add`; EV-ACT-R14-RK01 | vor Deploy stoppen; nach Deploy v15-Webrollback |
| Partielle oder doppelte Composition | P0; Boot/Resume/Hub-Reopen | exakte Optionsfläche, fail-closed vor Mutation, ein Mount je Host/Document, idempotentes Destroy | fehlende/getter/unknown Dependency, Doppelmount, Doppel-Listener, Resume-/Reopen-Orakel; EV-ACT-R14-RK02 | lokal zurückbauen; kein Deploy bei partiellem Graph |
| False Success oder Doppelcommit | P0; Finish/Retry | Success nur bei `created/replayed`; ein aktives Promise; identischer persistierter Intent/Request-ID/Payload | Known/Unknown/malformed/Responseverlust, Reentranz und Exactly-once; EV-ACT-R14-RK03 | Recovery erhalten; kein zweiter Write; bei Produktfehler v15 |
| Logout/Destroy während Commit | P0; Preparing/Committing bis Settlement | Authcleanup wartet begonnenen atomaren Commit ab; danach Flush+Destroy ohne Discard | Logout/Authablauf vor, während, nach Dispatch; Reload-Resume mit Intent; EV-ACT-R14-RK04 | keine neue Aktion bis Settlement; Unknown identisch retrybar; F-ACT-R14-15 |
| Background/Pagehide/Offline | P0; Editing bis Cleanup | vorhandener Recovery-Flush; keine zweite Lifecycleinstanz; Offline nie Success | hidden/pagehide/pageshow/focus, 30s Background, Offline Finish/Reload; EV-ACT-R14-RK05 | Draft/Intent bewahren; Produktrollback nur bei Cutoversmokefehler |
| Katalogdrift/Quarantäne | P0; New/Restore/Replay | New exakt v2; Restore/Replay gespeicherte Version; unknown fail-closed ohne physischen Delete | v1/v2 Recovery, highest-version drift, unknown/malformed Katalog; EV-ACT-R14-RK06 | `blocked`; kein Discard/Write/SQL |
| Multi-Tab-Race | P0; zweiter Tab vor/nach Intent | vorhandener Observation-/Lease-/CAS-Vertrag, kein Last-write-wins | zwei Tabs: stale Draft, Prepare, Attempt, Complete/Tombstone; EV-ACT-R14-RK07 | Konflikttab blockiert; nur bestätigter Ownerpfad fährt fort |
| Historymutation bei aktivem/unklarem Draft | P1; History/Correction/Delete | bestehender Mutation Guard mit Recovery-/Commitstate | active draft, unknown intent, correction/delete replay/conflict; EV-ACT-R14-RK08 | Mutation blockieren; kein Draftdiscard; Webrollback nicht nötig |
| Reader-/Chart-/Medizinsemantikdrift | P0; nach V2-Write | R13-Sources unverändert; Chart rein darstellend über R13-Snapshot; ein Tagesmarker | V1-only parity, V2 einmal, mixed-day, Doctor/Report/Health sowie Protein/Trend dry-run; EV-ACT-R14-RK09 | Pflichtsmoke fehlgeschlagen -> v15; keine Datenkorrektur ohne P3 |
| XSS oder sensible Leaks | P0; Render/Event/Error/Export | statische DOM-/`textContent`-Pfade, Escaping im Chart, payloadfreies Event, sichere Code/Status-Logs | malicious Notes/Labels, Eventdetail, Console/Diag/Evidence-Scan, Exportprivacy; EV-ACT-R14-RK10 | lokal fixen; bei Produktleak Cutover abbrechen/rollback, keine Evidencekopie |
| SW-404/Cache-Mix/Claim | P0; Install bis Controllerchange | exakte Productload-URL-/Queryliste; v14 `addAll`; Activate erst vollständig; Updatebanner/Skip-Waiting | absichtlicher 404, Fresh, v13->v14 Upgrade, Offline, Controllerchange, keine Harnessassets; EV-ACT-R14-RK11 | alter v13 bleibt vor Activate; nach Activate-Fehler v15; F-ACT-R14-19 |
| Alter offener V1-Client | P0; Deploy bis P2-Write | Stale-Tab nur read-only beobachten, dann schließen/aktualisieren; kein SQL-Kill-Switch | stale v13 besitzt V1, Fresh/Upgrade v14 besitzen nur V2; vor Write null alte Clients; EV-ACT-R14-RK12 | P2 nicht beginnen; falls Pflichtsmoke scheitert v15 |
| Android Reclaim/Auth/Touch | D-ACT-R14-17 | owner-deferred; kein Device-/ADB-Zugriff | transparentes `DEFERRED / NOT PASS`; EV-ACT-R14-RK13 nicht ausgeführt | kein erfundener Nachweis; freiwillige spätere Validation/Polishing |
| Git-/Pages-/Dirty-Scope-Drift | P1; P1 Commit/Push/Deploy | HEAD/origin/Pages unmittelbar prüfen; nur explizite R14-Pfade stagen; fremde Dirty-Doku unstaged | cached diff, Secret-/Harnessscan, Push-SHA=Pages-SHA, erfolgreicher Run; EV-ACT-R14-RK14 | vor Commit/Push stoppen; nach Deploy v15 bei falschem Postimage |
| Rollback vor/nach Write/Reader | P0; gesamtes Cutoverfenster | explizite Produktpfade aus 4be058b1 plus v15-SW; keine SQL-/Daten-/Evidence-Inverse | lokaler Inversediff, V1-Writer genau eins, R13/V2-Daten/Recovery erhalten, Fresh/Upgrade; EV-ACT-R14-RK15 | bedingte P1-Inverse committen/pushen; unbekannte Datenreparatur nur P3 |
| Export Empty/Error/Range/Stale | P1; Exportsurface | unveränderter R10-Controller/Validator, Generationguard und URL-Revoke | Empty, 3/6/custom, invalid/large/snapshot drift/retry/stale response; EV-ACT-R14-RK16 | Export blockieren/retry; kein Capture-/DB-Rollback |
| SQL/Auth/Secret/Scheduler-Scopebruch | P0; jede Phase | keine neue Architektur; nur bestehende Data-Access-/Authpfade; Secrettypen statt Werte | Source-/Diff-/Remote-Preflight, RLS/ACL/Owner/Advisor, keine neuen Migrations-/Workflowdateien; EV-ACT-R14-RK17 | sofort vor Änderung stoppen und Vertragsbruch melden |

<!-- markdownlint-enable MD013 -->

Zusätzliche Reviewpostconditions:

- Authfremde Owner können wegen unverändertem RLS/ACL keine Stephan-Daten
  lesen oder ändern. Das lokale Recovery bleibt gemäß Single-User-Grenze ohne
  neuen User-ID-/Secretvertrag; Logout zeigt es nicht an und löscht es nicht.
- `activity:changed` wird bei V2 nur einmal und ohne Detail erzeugt. R13-
  Snapshot, History und Chart dürfen unabhängig read-only laden, aber keine
  zweite Mutation oder doppelte Darstellung derselben Unit erzeugen.
- Der rollbackfähige P1-Weg stellt explizit Produktdateien aus dem 4be058b1-
  Preimage wieder her; Roadmap/Evidence und fremde Dirty-Dateien werden nicht
  pauschal reverted. Der Worker wird anschließend auf v15 finalisiert.
- Native Review: `PASS`; bestehende Shells besitzen keine dynamischen HTML-
  Sinks, Data Access loggt nur Operation/Code/Status. Neue Product-UI muss
  denselben sicheren DOM-Vertrag erfüllen.
- Findings F-ACT-R14-15 bis -19 sind durch Prävention und Orakel geschlossen.
  Keine unzugeordnete P0/P1-Zeitlinie, kein neuer SQL-/Auth-/Secretbedarf.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / High`.

1. Für jeden S4-Substep Inputs, Outputs, Consumer, Fehler, Tests,
   Invalidierungen und sichere Resume-Postcondition bestätigen.
2. Scope anhand Toolinteraktionen, Browser-/PWA-Arbeit, Review, Doku,
   Troubleshooting und Cutover bewerten, nicht nur anhand Dateizahl.
3. Blöcke A-C finalisieren; S5.1-S5.3, das gemeinsam vorab freizugebende
   P1/P2-Cutoverfenster und das nur unerwartete P3 getrennt lassen.
4. Secret Readiness Matrix finalisieren; keine Secretwerte lesen oder kopieren.
5. Evidence-Datei mit Baseline-/Test-/Deploy-/Device-IDs materialisieren.
6. Reale Usage-Reserve mit vergleichbaren Checkpoints und 1,5-Faktor prüfen.
7. Gemeinsames Owner-Briefing für P1/P2 samt bedingtem Webrollback
   vorbereiten.
8. Full Contract Review; Findings-, Status-, Evidence-, Resume- und U5-Sync.

Exit: Lokale S4-Wellen können ohne Grundsatzentscheidung beginnen; externe
Wirkung bleibt gesperrt.

### S4R Gate Record - 2026-08-28

Urteil: `READY_FOR_LOCAL_S4`; Scope bleibt der geplante kontrollierte
Web-/PWA-Compositioncutover. Kein neuer SQL-, RPC-, RLS-, ACL-, Auth-, Secret-
oder Schedulervertrag. Keine Ownerfreigabe ist für die folgenden lokalen,
reversiblen Wellen erforderlich; U5-U10 bleiben bindend.

#### Realer Scope und Aufwand

- Erwarteter Produktdelta: ein neuer kleiner Productcontroller samt CSS und
  Contracttest; `index.html`, `assets/js/main.js`, bestehender Authcleanup,
  Weight-Chart und Root-SW; ungefähr acht bewusst invalidierte aktive
  Productload-/Isolationcontracts sowie ein neuer R14-Cutovercontract.
  Activity-V1-Source, R8-R10-Kernmodule, R13-Reader, SQL und Android-Source
  bleiben unverändert.
- Gesamtgröße: `large but controlled`. Nicht die Zeilenzahl, sondern
  Recovery-/Commitcomposition, UI/Fokus, Cacheupgrade, Browser/PWA, Review,
  produktiver Preflight und Android-/Rollbackpostconditions bestimmen den
  Aufwand.
- Realistische Ausführungsgröße über mehrere Usageblöcke:
  - Rehydration/Driftcheck und Dokusync je Welle: 10-25 Minuten;
  - Block A: 60-100 Minuten;
  - Block B: 75-120 Minuten;
  - Block C: 90-150 Minuten;
  - S5.1/S5.2 Fullmatrix, eine Browsersession und CodeRabbit: 120-240 Minuten;
  - S5.3 produktiver Read-only-Preflight und P1/P2-Briefing: 45-90 Minuten.
  Fehlersuche kann diese Spannen vergrößern; Usage-Gates starten keinen Block
  ohne Abschlussreserve.

#### Sichere lokale Wellen

<!-- markdownlint-disable MD013 -->

| Welle | Scope / Inputs | Outputs / Consumer | Günstige Tests / Review | Sichere Resume-Postcondition |
| --- | --- | --- | --- | --- |
| A: S4.1 + isolierte S4.2-Basis | S2 C01-C03; unveränderte Draft/Recovery/Commit/Shell APIs | neuer `activity-product-controller.js`, Product-CSS und direkter Contracttest; noch kein Productload | neue API-/Options-/Doppelmount-/State-/DOM-/Fokuscontracts, Syntax, nativer Delta-/Consumerreview; EV-ACT-R14-L01/-L02 | neue Dateien sind unreferenziert; produktive V1-Baseline bleibt vollständig lauffähig; U6 |
| B: S4.3-S4.5 Composition | Block-A-API; R8 Recovery/Commit, R9 History, R10 Export | vollständige Recovery-/Commit-/Authcleanup-/History-/Exportcomposition und payloadfreies Event im unreferenzierten Controller | nur neue/invalidierte Controller-, Lifecycle-, Known/Unknown-, Mutation-Guard- und Privacycontracts; Kernmatrizen nicht voll wiederholen; EV-ACT-R14-L03..L05 | Composition ist isoliert vollständig, aber noch nicht in `index.html`/SW geladen; V1-Produkt bleibt aktiv; U7 |
| C: atomarer lokaler Productcutover S4.2/S4.4/S4.6/S4.7 | fertige Composition, G0-Preimage, RK01-RK19 | V2-Training-DOM/Main/Authhook/Chartadapter, exakter Productload, SW v14, V1-Writerload null, lokales explizites v15-Rollbackmaterial, aktualisierte Isolationcontracts | nur invalidierte Productload-/C3-/R8-/R10-/R13-/SW-/Syntaxchecks und nativer Full-S4-Review; keine Browserfullmatrix/CodeRabbit; EV-ACT-R14-L06/-L07 | lokaler Cutover vollständig und rollbackfähig, kein Commit/Push/Deploy/Remote/Device; U8 |

<!-- markdownlint-enable MD013 -->

Block A/B verändern das reale Produktverhalten weder lokal über den bestehenden
Productload noch extern. Block C ist innerhalb der lokalen Quelle atomar und
endet erst, wenn v14-Productload, Null-V1-Writer und v15-Inverse zusammen
konsistent sind.

#### S4-Substep-Postconditions

- S4.1: exakte API, Dependencies und Doppelinit fail-closed; Consumer Main.
- S4.2: V2-Entry/Recovery/History/Export mit Fokus und ohne V1-DOM; Consumer
  Hub Training.
- S4.3: Recovery einmal geöffnet, Lifecycle einmal gebunden, Logout ohne
  Discard; Consumer Session Shell.
- S4.4: Commit einmalig, identischer Retry, payloadfreies Success-Event, null
  V1-Writer; Consumer Data Access/R13 refresh.
- S4.5: History/Correction/Delete/Export mit Mutation Guard und ohne sensible
  Zusatzdaten; Consumer Owner-UI.
- S4.6: exakte Script-/Style-/Cacheidentitäten, v14 und materialisierbare
  v15-Inverse; Consumer Fresh/Upgrade/stale/Android-WebView.
- S4.7: Isolation verbietet Harness-, SQL-, Auth-, Secret-, R15-/R16- und
  Android-Sourcewirkung. Jeder Fehler stoppt vor U8.

#### Test- und Reviewrouting

- Acht bestehende Product-/Isolationorakel sind bewusst invalidiert:
  C3 Training Surface, R13 Read Consumer Isolation, R8 Isolation, V2 Isolation,
  R10 Export Final, R9 History Final, R11 Consumer Final und R13 Doctor Product
  Contract. Sie werden auf den R14-Postimagevertrag aktualisiert, nicht blind
  gelöscht.
- S4 führt nur neue beziehungsweise direkt invalidierte günstige Node-/Syntax-
  Contracts aus. Keine vollständige Browsermatrix und kein CodeRabbit.
- U8 erlaubt gemeinsam S5.1 und S5.2: komplette relevante lokale Matrix;
  genau eine Browsersession für Desktop/390/320 plus Fresh/Upgrade/Offline;
  Full Native Code/Contract/Security/Privacy/Cache/Rollback/Consumerreview;
  genau ein CodeRabbit-Initiallauf und höchstens eine Verifikation nach
  berechtigten Fixes. Danach U9.
- S5.3 bleibt eigener read-only Block nach U9: HEAD/origin/Pages/Diff,
  produktive V1-/V2-Zähler/Hashes, SQL22-26/RLS/ACL/Owner/Advisor,
  R13-/Edge-/Workflowpostimage und Androidziel ohne Devicezugriff. Danach U10
  und gemeinsames P1/P2-Briefing; harter STOP.

#### Tool-, Secret- und externe Gates

- Node/Deno/Supabase/psql/Playwright/CodeRabbit/JDK/Gradle/ADB-Binary sowie
  GitHub- und CodeRabbit-Auth sind verfügbar. Docker-Daemon ist aus und wird
  nicht gestartet, solange keine gemeinsame Daten-/Securitycontractänderung
  eine disposable DB-Matrix invalidiert.
- Operatorbundle ist gitignored und besitzt die zwei für S5.3 benötigten
  Supabase-Typen. Browserauth wird erst in S5.1 runtimegeprüft; reales Gerät,
  Client und Auth bleiben P2. Es wird kein neues Secret erzeugt oder kopiert.
- Block A-C und S5.1-S5.3: kein Commit, Push, Deploy, produktiver Write,
  Supabase-Write oder ADB. P1/P2 gemeinsam erst nach grünem U10; P3 nur für
  unerwartete produktive Korrektur/Löschung.

Full Readiness/Scope/Security Review: `PASS`; keine offene P0/P1-Zuordnung,
keine neue Produktentscheidung und keine fremde Dirty-Datei im geplanten
Staging. U5 entscheidet ausschließlich, ob Block A jetzt begonnen werden darf.

## S4 - Lokale Umsetzung

S4 enthält nur native Delta-/Consumer-Reviews und invalidierte günstige
Checks. Kein CodeRabbit und keine vollständige Browsermatrix.

### S4 Block A Gate Record - 2026-08-28

- Neue unreferenzierte Dateien:
  `activity-product-controller.js`, `activity-product-controller.css` und
  `activity-product-controller.contract.test.js`.
- Der Controller validiert die exakt eingefrorenen DOM-, API- und
  Funktionsdependencies vor DOM-/Listenerwirkung, reserviert Host und Document
  genau einmal und gibt beide nach `destroy()` wieder frei.
- Die gefrorene öffentliche API und der gefrorene Public State besitzen exakt
  die S2-Schlüssel. Bis Block B ist jede operative Composition absichtlich
  fail-closed mit `COMPOSITION_NOT_READY`; keine neue Datei ist im Productload.
- Die sichere Entry-DOM verwendet ausschließlich `createElement` und
  `textContent`, deutsche Statuscopy, `aria-live`, deterministischen
  Startfokus, 44-px-Aktionen und eine 390-px-Einspaltenregel.
- Nachweise: `node --check` PASS; direkter Node-Contract `4/4 PASS`; kein
  `activity_add`, V1-Callsite, Logging, Storagezugriff, sensitiver Eventinhalt
  oder HTML-String-Sink; bestehende Product-/Core-/R13-Pfade ohne tracked Diff.
- Nativer Delta-, Consumer-, Contract-, Privacy- und Scope-Review: `PASS`.
  Keine Findings und keine Produktwirkung. Nächste sichere Grenze: U6.

### S4 Block B Gate Record - 2026-08-29

- Der Productcontroller öffnet nach bestätigter Authentscheidung exakt einen
  IndexedDB-Recoveryowner. Neue Drafts sind an Katalog v2 gebunden;
  `continueSession()` und Commit lösen die im Draft gespeicherte Version über
  den injizierten Resolver auf.
- Pro Draft werden genau ein Commitcontroller und eine Session-Shell erzeugt.
  `preparing`/`committing` sperren Authcleanup bis Settlement; danach wird
  Recovery geflusht und technisch zerstört, niemals verworfen. Schlägt der
  Flush fehl, bleibt die gesamte In-Memory-Composition fail-closed erhalten.
- Unknown schließt nur die View und öffnet denselben Commitcontroller mit
  identischem persistentem Intent erneut. Erst bestätigtes `committed` ruft
  `refreshActivityConsumers()` genau einmal und ohne Argumente auf.
- Nur der ausdrücklich bestätigte Recovery-Entry-Flow ruft den bestehenden
  persistenten `discard()` auf. Unknown/blocked Recovery ist quarantänisiert
  und kann nicht verworfen werden.
- History nutzt den exakten vierteiligen R9-Adapter, den bestehenden Mutation
  Guard und kataloggebundene Correction; Export nutzt den bestehenden R10-
  Controller/Shellvertrag und sicher erzeugte DOM-Rollen. Partielle History-
  oder Exportcomposition wird vollständig zurückgerollt.
- Nachweise: Controller-/Testsyntax PASS; direkter Contract `13/13 PASS` für
  Dependencygraph, v2/New, v1/Restore, Commit-Success, Unknown-Retry,
  Commit-Settlement, Logout-Flush, Flushfehler, expliziten Discard,
  Quarantäne, History, Export und partielle Composition.
- Nativer Delta-, Consumer-, Contract-, Security-, Privacy-, Lifecycle- und
  Scope-Review: `PASS`; keine Findings. Productload, V1 Writer, V2-Core,
  R13-Reader, Supabase/SQL und Android bleiben source-unverändert. Kein
  Browser, CodeRabbit, Remotezugriff oder Produktwirkung. Nächste Grenze: U7.

### S4 Block C Gate Record - 2026-08-29

- `index.html` enthält exakt die 15 eingefrorenen V2-Capture-Scripts in der
  bewiesenen Reihenfolge vor Supabase/Auth; vier Shell-/Productstyles sind mit
  identischen URL-Identitäten in `app.css` und `CORE_ASSETS` enthalten.
- Die Training-Produktfläche besitzt genau vier V2-Hosts. V1-Form,
  `trainingDate`, Main-Submit-/Cancelblock, `AppModules.activity.addActivity`,
  `activity_add`, V1-Scriptload und V1-Cacheload sind im lokalen Productpostimage
  null; die unveränderte V1-Quelldatei bleibt als Rollbackreserve erhalten.
- Main mountet genau einen fail-closed Productcontroller mit Katalog v2 für
  neue Drafts und gespeichertem Katalogresolver für Recovery/Replay. Der
  bestehende Authablauf wartet den V2-Lifecyclehook vor finalem Login/Logout;
  bestätigtes Commit erzeugt genau ein payloadfreies `activity:changed`-Event.
- Der Weight-Chart lädt ausschließlich
  `activityV2.consumerDataAccess.loadSnapshot({from,to})`. Eine einzelne
  V1-/V2-Unit behält Label, Dauer und Notiz; mehrere Units desselben Tages
  ergeben genau `<n> Trainings`, die summierte Dauer und keine kombinierte
  Notiz. Trend-/Gewichtsberechnung und alle vier R13-Readerquellen blieben
  unverändert.
- Root-SW ist lokal monoton v14 und cached alle 15 V2-JS-, vier V2-CSS- sowie
  unveränderten R13-Readerassets ohne Harness-/Fixtureload. Das explizite,
  bestätigungspflichtige Rollbacktool stellt nur sechs Produktpfade aus
  4be058b1 wieder her, ergänzt den V1-Cacheload und erzeugt Root-SW v15; keine
  SQL-, Daten-, Recovery-, Evidence- oder Fremddatei wird gelöscht/reverted.
- Nachweise: Syntax PASS; direkt invalidierte Node-Verträge `38/38 PASS`;
  R14-Cutovercontract `4/4 PASS`; C3-, R13- und R8-Isolation jeweils PASS;
  `git diff --check` PASS; R13-Source-Diff leer; Secret-/Harness-/V1-
  Productedgescan PASS.
- Nativer Full-S4 Code-, Contract-, Security-, Privacy-, Cache-, Rollback-,
  Consumer- und Scopereview: `PASS`; keine offenen Findings. Kein Browser,
  CodeRabbit, Commit, Push, Deploy, Remotewrite oder Devicezugriff. Lokale
  Produktwirkung erst bei späterem P1; Produktion bleibt auf 4be058b1/v13 mit
  V1 als einzigem Writer. Nächste Grenze: U8.

### S4.1 - Product Controller und Abhängigkeitskomposition

- Einen kleinen Activity-V2-Produktcontroller nach bestehendem Modulstil
  erstellen oder den in S1 bewiesenen passenden Owner erweitern.
- Exakte Semantik-, Draft-, Recovery-, Commit-, Data-Access-, History- und
  Exportabhängigkeiten einmalig injizieren.
- Doppelinit, fehlende API und partielle Productload-Zustände fail-closed.
- Nativer Delta-/Consumer-Review; Ergebnis und EV-ACT-R14-L01 dokumentieren.

### S4.2 - Training-Produktfläche auf V2 umstellen

- V1-Form durch ruhigen V2-Einstieg, Recoveryentscheidung, Verlauf und Export
  ersetzen.
- Session-Shell vollflächig innerhalb des bestehenden Hub-/Focus-Vertrags
  öffnen; Close-/Escape-/Discard-Verhalten bewahren.
- Kein V1-Submit und kein versteckter zweiter Save-Pfad.
- Nativer UI-/Accessibility-Review; EV-ACT-R14-L02.

### S4.3 - Recovery und Session-Lifecycle produktiv komponieren

- IndexedDB-Recovery vor neuer Session öffnen und den gespeicherten
  Katalogresolver verwenden.
- `startNew`, `continueSession`, `flush`, `discard` und Lifecyclelistener genau
  einmal verbinden.
- Logout/Destroy/Panelwechsel ohne Record-Delete oder Lost Update behandeln.
- Nativer Lifecycle-Review; EV-ACT-R14-L03.

### S4.4 - Commit und Writer-Cutover lokal verbinden

- SessionCommit ausschließlich mit Recovery, Data Access und bewiesener
  Semantik instanziieren.
- Finish, Known/Unknown, identischer Retry, terminales Cleanup und
  `activity:changed` nach bestätigtem Erfolg verbinden.
- V1-Writercallsite, Formlistener und produktive V1-Produktladung entfernen,
  Quellfiles aber erhalten.
- Kein Remote-Schreibtest in S4; EV-ACT-R14-L04.

### S4.5 - History, Correction/Delete und Coaching-Export integrieren

- R9-History-Shell mit Mutation Guard und demselben Data Access mounten.
- R10-Exportcontroller/-shell mit 3-/6-Monats- und Custom-Range bereitstellen.
- Erfolgreiche Mutation/Commit aktualisiert History und relevante Reader ohne
  Doppelabfrage oder V1-Fallbackwrite.
- Nativer Consumer-/Privacy-Review; EV-ACT-R14-L05.

### S4.6 - Productload, Styles und Service Worker finalisieren

- V2-Scripts und Styles in exakt bewiesener Reihenfolge laden.
- Root-SW monoton von realem G0-Postimage erhöhen; sämtliche produktiv
  benötigten V2-Assets atomar in den Cachevertrag aufnehmen.
- Keine Harness-/Fixture-/Test-PWA-Dateien produktiv laden.
- V1-Quellen nicht löschen; lokalen Rollbackdiff materialisieren.
- Nativer Cache-/Productload-Review; EV-ACT-R14-L06.

### S4.7 - Lokale Cutover-Orakel und Isolation aktualisieren

- Orakel für genau einen V2-Capture, null V1-Callsites, keine Harnessloads,
  keine neue SQL/Auth-/Secretwirkung und erhaltene R13-Reader ergänzen.
- Fresh-/Upgrade-/Offline-/stale-client-Szenarien lokal testbar machen.
- Nur direkt invalidierte Contract-/Syntax-/Isolationstests ausführen.
- Full S4 Contract Review, Status-, Evidence-, Resume- und U8-Sync;
  EV-ACT-R14-L07.

## S5 - Tests, Web/PWA-Cutover und Android-Deferred-Nachweis

Reasoning: `GPT-5.6 Sol / High`.

### S5.1 - Integrierte lokale Abschlussmatrix

- Alle durch R14 invalidierten Activity-V2-, Productload-, Hub-, Main-, PWA-
  und Readercontracts ausführen.
- Bestehende vollständige V2-Suite nur einmal gebündelt laufen lassen.
- Browsermatrix in einer Session: Desktop, 390x844, 320x800.
- Start, Recovery, Background >=30 Sekunden, Reload, Offline/Online,
  Commitzustände, History, Correction/Delete, Export, Fokus, Touch und
  Overflow prüfen.
- Disposable PostgreSQL nur bei realer DB-Invalidierung; andernfalls R8-R10-
  Evidence fingerprintgebunden übernehmen.

### S5.2 - Full Review und CodeRabbit

- Nativer Full Code-, Contract-, Security-, Privacy-, Scope-, Cache-,
  Rollback- und Consumerreview.
- Genau ein CodeRabbit-Initiallauf; berechtigte Findings bewerten und minimal
  korrigieren; nur invalidierte Checks erneut ausführen.
- Höchstens ein Verifikationslauf. Kein Installationsfallback, kein dritter
  Lauf und kein blindes Fixen.
- U9 und Resume/Evidence synchronisieren.

### S5.3 - Produktiver Read-only Preflight

- Git/Remote/Pages/SW, R13 Reader, SQL22-26 Signaturen/ACL, V1-/V2-Zähler,
  Datenhashes, Auth-/Advisorstatus und Android-Ziel read-only erfassen.
- V1-Zwischenstände seit G0 als legitime Nutzung neu baselinen, nicht als
  Drift löschen.
- gemeinsames P1/P2-Briefing mit exaktem Deploy-, Device-, Write-, Smoke- und
  Rollbackplan geben.
- U10 ausführen und vor externer Wirkung stoppen.

#### S5.3 Gate Record - 2026-08-29

Urteil: `PASS READ-ONLY`; keine Mutation, kein Commit, Push, Deploy, Supabase-
Write, Workflowdispatch oder Devicezugriff. PRE01-PRE04 sind vollständig PASS,
PRE05 ist lokal/authseitig PASS und hält den realen Device-/Android-Nachweis
transparent als owner-deferred und nicht PASS offen. Das
bestätigungspflichtige v15-Rollbackartefakt `23b37d83...856c` deckt exakt sechs
Produktpfade aus 4be058b1 ab. P1/P2 samt bedingtem Rollback und R9-Delete sind
erteilt; nächstes Gate ist ein frisches erlaubendes U10.

U10R-Nachtrag: `65 % 5h / 18 % Woche; CONTINUE_WITH_CAUTION`. P1/P2,
bedingter Webrollback, Android-Deferred und R9-Delete sind ownerbestätigt, aber
S5.4/S5.5 darf an diesem Checkpoint nicht beginnen. Die Resume-Grenze bleibt
vollständig vor jeder externen Wirkung.

U10R2-Nachtrag: `2026-08-30T08:05:11+02:00; 98 % 5h / 100 % Woche;
CONTINUE`. Beide Resetgrenzen sind überschritten und die vollständige Reserve
für das gemeinsam freigegebene atomare S5.4/S5.5-Fenster liegt vor. Das Fenster
wurde ohne Zwischenpoll begonnen.

### S5.4 - Atomares P1/P2-Cutoverfenster beginnen

Nur wenn P1, P2 und der bedingte Webrollback gemeinsam freigegeben sind und ein
frisches U10 `CONTINUE` mit ausreichender Reserve ergibt. Android ist gemäß
D-ACT-R14-17 deferred:

- bestätigten Commit-/Push-/Deployweg exakt einmal ausführen oder den Owner-
  ausgeführten Lauf beobachten;
- Pages-/Runtimeversion und Root-SW-Postimage prüfen;
- Fresh Client und Upgrade Client testen;
- alte offene MIDAS-Clients kontrolliert schließen/aktualisieren;
- Login, Hub, Training-Start/Recovery und Reader zunächst ohne Write smoken;
- bei Abweichung den in P1 vorab freigegebenen Webrollback ausführen und das
  Cutoverfenster als FAIL schließen;
- bei PASS ohne Usage-Poll und ohne neue Freigabe unmittelbar S5.5 ausführen.

### S5.5 - P2 Web/PWA- und produktiver Write-Smoke

Nur nach ausdrücklicher Freigabe:

- produktiven Web-/PWA-Client eindeutig identifizieren; kein Storage-Clear;
- Training starten, mindestens ein reales Item erfassen, Backgrounding
  beziehungsweise realistischen Tab-/Appwechsel durchführen und Draft
  wiederherstellen;
- online genau einmal speichern und V2-History/Detail prüfen;
- bestätigen, dass kein V1-Eintrag für denselben Vorgang entstand;
- Coaching-Export laden;
- Doctor-/Report-/Health-/Protein-/Trend-Reader auf genau eine Aktivität und
  unveränderte medizinische Semantik smoken; Protein und Trendpilot dabei nur
  über bereits vorhandene non-mutating Diagnose-/Dry-run-Pfade prüfen, keine
  Schedules oder medizinischen Fachdaten verändern;
- Testdatensatz nach bestandenem Write-/Reader-Nachweis ausschließlich über
  den in D-ACT-R14-18 freigegebenen normalen R9-UI-Deletepfad entfernen;
- bei einem Pflichtfehler den in P1 freigegebenen Webrollback ausführen, ohne
  V1- oder V2-Daten zu löschen;
- erst nach abgeschlossenem Erfolg oder Rollback U11 ausführen.

### S5.6 - Finales Postimage und Rollbackentscheidung

- V1-/V2-Zähler, Hashes, Session/Items/Sets, Request-ID nur gehasht,
  Readerergebnis und SW-/Pagesversion dokumentieren; Android als deferred,
  nicht als beobachtet oder PASS führen.
- Keine Secrets, Payloads oder Gesundheitsdetails in Evidence aufnehmen.
- Bei Grün V2 als alleinigen Capture bestätigen.
- Ein bereits im Cutoverfenster notwendiger Webrollback ist als P1-Postcondition
  dokumentiert; spätere oder unerwartete produktive Reparaturen benötigen P3.
- Full Contract Review, Findings-, Evidence-, Resume- und U12-Sync.

Exit: Produktiver V2-Capture und Web/PWA sind bewiesen, Android ist transparent
owner-deferred, oder der
datenverlustfreie V1-Produktrollback ist abgeschlossen und R14 bleibt offen.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

1. Frisches Usage-Gate U12 vor S6 beachten.
2. README auf Activity V2 als produktiven Capture aktualisieren.
3. Activity-, Capture-, Hub- und relevante Android/PWA-Overviews auf das reale
   Postimage synchronisieren.
4. Masterplan: R14 DONE, R15 als nächstes optionales Post-Core-Gate, R16
   weiterhin optional.
5. HCR-033 oder nächste freie kanonische QA-ID mit V2-Capture-, Cache-,
   Android-Deferred- und Rollbackvertrag ergänzen.
6. Android-/PWA-Runbook nur bei tatsächlich geänderten dauerhaften
   Bedienverträgen aktualisieren.
7. CHANGELOG unter `Unreleased` ergänzen; R14 ist eine sichtbare und operative
   Produktänderung.
8. Finalen Source-of-Truth-, Link-, Scope-, Security-, Evidence- und
   `git diff --check`-Review durchführen und berechtigte Findings korrigieren.
9. Resume Card und Evidence auf DONE synchronisieren.
10. U13 als reine `FINAL_OBSERVATION` dokumentieren.
11. Roadmap und Evidence gemeinsam mit `(DONE)` nach `docs/archive/`
    verschieben.
12. Commit-Empfehlung erstellen; keinen Commit oder Push ohne neuen Auftrag.

Vorgesehene Commit-Empfehlung, aus realem Diff finalisieren:

```text
feat(activity-v2): activate training capture
```

## Test- und Evidence-Matrix

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Vertrag | Status |
| --- | --- | --- | --- |
| T-ACT-R14-01 | statisch | genau ein V2-Productcontroller, null V1-Save-Callsites | PASS LOCAL |
| T-ACT-R14-02 | lokal | Scriptreihenfolge und alle APIs vollständig/fail-closed | PASS |
| T-ACT-R14-03 | lokal | Katalog v2 neu; alte Version restore/replay | PASS |
| T-ACT-R14-04 | lokal | Recovery, Reload, Background, Offline, Tombstone | PASS LOCAL |
| T-ACT-R14-05 | lokal | Exactly-once, Doppelklick, Known/Unknown, Retry | PASS LOCAL |
| T-ACT-R14-06 | lokal | History/Detail/Correction/Delete + Mutation Guard | PASS LOCAL |
| T-ACT-R14-07 | lokal | Coaching-Export Empty/Success/Error/Download | PASS LOCAL |
| T-ACT-R14-08 | Browser | Desktop/390/320, Fokus, Touch, Overflow, Lifecycle | PASS LOCAL |
| T-ACT-R14-09 | PWA | Fresh/Upgrade/stale client, SW/cache/offline | PASS LOCAL / P1 PENDING |
| T-ACT-R14-10 | Security | Owner/RLS/ACL/BOLA, keine Secret-/Payloadleaks | PASS LOCAL / PRE PENDING |
| T-ACT-R14-11 | Produkt | V2-Write ohne V1-Doppelwrite | TODO |
| T-ACT-R14-12 | Consumer | R13-Reader genau einmal, medizinische Semantik gleich | PASS LOCAL / P2 PENDING |
| T-ACT-R14-13 | Android | Start, Reclaim/Resume, Save, History, Export | DEFERRED BY OWNER / NOT PASS |
| T-ACT-R14-14 | Rollback | Web/Productload zurück, Daten/Reader unverändert | PASS LOCAL / P1 PENDING |

<!-- markdownlint-enable MD013 -->

## Initialer Contract Review

Reviewdatum: `2026-08-28`.

Geprüft wurden Zielbild, Masterplan, R8-R10 Verträge, R13-/C3-Postimages,
Single-User-Grenze, Productload, Cache, Android, Owner-Gates, Usage-Wellen,
Evidence und Nicht-Ziele.

Korrigierte Findings:

- Ein veralteter PWA-Client kann nicht durch eine reine HTML-Änderung sofort
  garantiert verstummen. Der Plan verlangt deshalb einen kontrollierten
  Single-User-Clientwechsel und testet Fresh plus Upgrade, ohne SQL-Kill-Switch.
- Der Android-Smoke kann erst nach einem deployten V2-Client erfolgen. Er ist
  nun nach P1, aber zwingend vor DONE angeordnet.
- Ein Rollback nach bereits gespeichertem V2-Datensatz darf diesen nicht
  löschen. Productload und Datenrollback sind jetzt ausdrücklich getrennt.
- C3 besaß ein manuelles V1-Datum, der V2-Commit jedoch einen Sessionzeit-
  Vertrag. R14 übernimmt nicht versehentlich den V1-Tagesinput.
- Produktive Writes, Devicezugriff und Cleanup waren als drei unterschiedliche
  Wirkungen zu behandeln; P1-P3 bilden diese Grenzen nun explizit ab.
- Roadmap-Erstellung und Ausführung sind trotz Template-Default auf ausdrück-
  lichen Ownerentscheid maximal `High`; Block- und Usage-Gates kompensieren.
- R14 braucht aufgrund Deploy, Write, Android und Rollback eine eigene
  Evidence-Datei; sie wurde angelegt.
- Die neue Secret-Readiness-Regel wurde aufgenommen, ohne `.env` zur
  Vollspiegelung von Remote-Secrets zu machen.
- Metadaten nannten zunächst U0-U12, obwohl U13 die verpflichtende finale
  Beobachtung ist; Metadaten und G0 wurden auf U0-U13 samt explizitem U1
  synchronisiert.
- Der Reader-Smoke hätte Protein Target oder Trendpilot missverständlich als
  regulären schreibenden Lauf auslösen können. Er ist jetzt auf vorhandene
  non-mutating Diagnose-/Dry-run-Pfade begrenzt.
- Zwischen Webdeploy und Android-Smoke lag zunächst U11. SAFE_CLOSURE hätte
  dadurch einen live geschalteten, aber nicht vollständig validierten Writer
  zurücklassen können. P1/P2 und bedingter Webrollback werden nun gemeinsam
  vorab freigegeben; S5.4-S5.5 sind ein atomares Cutoverfenster und U11 liegt
  erst dahinter.

Ergebnis:

- `PASS - ready for execution chat.`
- Keine offene Grundsatzfrage blockiert G0-S4R.
- Externe Wirkung bleibt korrekt hinter P1-P3.

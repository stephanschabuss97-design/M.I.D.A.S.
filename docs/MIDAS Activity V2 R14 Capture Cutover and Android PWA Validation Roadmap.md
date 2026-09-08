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
| Status | `PAUSED_USAGE; P1/P2 GRANTED NOT EXERCISED; LOCAL S5 CLOSURE PASS; V21 PRODUCTION SAFE; R14 OPEN` |
| Modul / Bereich | `Activity V2 / Training / PWA / Android` |
| Owner / Kontext | `Stephan; private Single-User-PWA für den eigenen CKD- und Arztkontext` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-28` |
| Letzter Stand | `2026-09-08; F34- und Releaseinvalidierung lokal vollständig geschlossen, finales v22/v23-Manifest und PRE09 PASS. Produktion bleibt V1-only/v21; F35 bleibt separater gemeinsamer MIDAS-Backlog; F36 ist für das nächste freigegebene Fenster owner-resolved.` |
| Aktueller Schritt | `D-ACT-R14-29 ist erteilt. Beim nächsten frischen kanonischen Gate ab effektiv 72/21 und unverändertem PRE09/Manifest das v22/v23-Fenster ohne erneute P1/P2- oder Boundary-Rückfrage atomar beginnen. Kein allgemeiner F35-Repair in R14.` |
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
  - `Das zweite produktive Fenster lieferte Commit 1b6e716 und Pages-Run
    33357905534. Live waren exakt ein V2-Controller, null V1-Script, zwei
    unveränderte R13-Reader und Root-SW v16 aktiv; Fresh/Upgrade/stale-client
    sowie Recovery über einen realistischen Tabwechsel waren PASS.`
  - `Der bestätigte Write und genau ein identischer Retry erzeugten erneut
    keine Persistenz. Die Oberfläche blieb fail-closed im Editingzustand,
    Recovery-Draft und Eingaben blieben erhalten; V1 blieb 67 und V2 blieb
    0/0/0. History/Detail/Export und R9-Delete waren mangels Datensatz nicht
    ausführbar.`
  - `Der bedingte v17-Rollback ist vollständig PASS: Commit 4e87729, Pages-Run
    33358569779, Live-Index 552f3474...437d, Live-SW 1b500681...4038,
    V1-Script 1, V2-Controller 0, R13-Reader 2 und frischer V1-Boot samt
    Trainingsmaske ohne Fehler.`
  - `Dirty-Stop-Recovery 2026-09-06 war eindeutig: HEAD/origin und Produktion
    blieben 4e87729/v17. Der danach zugelassene lokale Block bewies einen
    redundanten Auth-Lifecycle-Reset von editing/session auf recoverable/entry
    und korrigierte ihn minimal, ohne Backend-, Daten- oder Außenwirkung.`
  - `Der reale lokale Last-Mile-Pfad ist nach der Korrektur für Erfolg,
    Unknown plus identischen Retry, Recovery nach Reload, Misdirect und Reauth
    vollständig grün. 303/303 Node, 84/84 Deno, 57 Syntaxchecks,
    git diff --check und native Fullreviews sind PASS.`
  - `Das v18/v19-Fenster ist beendet. Cutover 0fa44e2 / Pages 34022878621
    lieferte den V2-Productload. Der einzige Abschlussversuch blieb vor dem
    Transport fail-closed; V2 blieb 0/0/0. Rollback 3857bf4 / Pages
    34023954044 stellte V1 und Root-SW v19 wieder her. Ein isolierter frischer
    V1-Client bootet; R13 liefert 69 reine V1-Units.`
  - `Das v20/v21-Fenster ist sicher beendet. Cutover 2dbfa3c / Pages
    34160428748 lieferte V2 und Root-SW v20. Der Live-Upgradecheck fand vor
    jedem V2-Write weiterhin eine Datensatz-ID und konkrete Gesundheitswerte
    in der Browserdiagnostik. Deshalb kein Write, Retry oder Delete. Rollback
    40c4b93 / Pages 34160860095 stellte V1-only und Root-SW v21 her; frischer
    V1-Client, Datenbaseline 69/0/0/0 und unveränderte R13-Loads sind PASS.`
- Nächster erlaubter Schritt:
  - `D-ACT-R14-28 ist erteilt: Im nächsten ausdrücklich freigegebenen
    v22/v23-Fenster darf der alte Draft nach sichtbarer Wiederherstellung über
    den normalen bestätigten UI-Pfad „Entwurf verwerfen“ gelöscht werden.
    Danach frischen v2-Smoke-Draft erzeugen. Vorher frisches Usage-Gate,
    invalidierte Closure, Manifest, Preflight und neues gemeinsames P1/P2;
    kein allgemeiner F35-Repair.`
- Offene Findings:
  - `F-ACT-R14-13/-14 sind im S2-Vertrag geschlossen und bleiben als
    verpflichtende S4-/S5-Orakel offen, nicht als Produktentscheidung.`
  - `F-ACT-R14-15 bis -19 sind im S3-Risikovertrag geschlossen und als
    konkrete S4-/S5-Präventionen und Stop-/Rollbackorakel zugewiesen.`
  - `F-ACT-R14-23 ist durch D-ACT-R14-17 geschlossen: Android-Evidence ist
    ausdrücklich owner-deferred, nicht PASS. Layoutpolishing bleibt außerhalb
    des produktiven Web-/PWA-Cutovers.`
  - `F-ACT-R14-25 bleibt geschlossen. F-ACT-R14-26 ist lokal korrigiert und
    vollständig validiert; sein produktiver Reproof ist offen. Der historische
    produktive Nicht-Dispatch lässt sich nicht ehrlicherweise ausschließlich
    dem reproduzierten Lifecycle-Reset zuschreiben, weil ein früherer Harness-
    Lauf trotz Drift committen konnte. Kein weiterer CodeRabbit-Lauf; Initial
    und Verifikation sind verbraucht.`
  - `F-ACT-R14-24 ist geschlossen: Die Rollbackdateien waren korrekt
    wiederhergestellt, aber String.Split erzeugte einen falschen Negativbefund;
    die exakte Tokenzählung verwendet nun Regex.Escape/Matches und der
    Materialisierungsvertrag ist grün.`
  - `F-ACT-R14-25 ist lokal geschlossen: Der semantikgebundene Adapter reicht
    exakt Request-ID, Payload und selectedSemantics an Data Access. Eine echte
    Productcontroller→Data-Access-Regression belegt erfolgreiche v2-Responses
    `created`/`replayed`, byteidentische Retries, bodyfreie Semantikoption,
    erfolgreichen Recovery-v1-Commit und payloadfreie Diagnostik.`
  - `F-ACT-R14-26: Der reale lokale Pfad DOM-Klick -> aktiver Listener -> Shell
    -> finish -> preparing -> Recovery/Intent -> semantikgebundener Data Access
    -> kontrollierter Transport -> committed ist bewiesen. Der reproduzierte
    Lifecyclefehler setzte beim redundanten setAuthenticated(true) die offene
    Session fälschlich auf entry zurück; reconcileProductState() erhält nun die
    aktive Fläche. Der produktive Write-/Reader-/Delete-Reproof bleibt Pflicht.`
  - `F-ACT-R14-27 ist geschlossen: Der Recovery-Harness setzte nach simuliertem
    Reload seine deterministische UUID-Sequenz zurück und kollidierte dadurch
    nur testintern mit dem gespeicherten Lease-Token. Eine getrennte Resume-
    Sequenz beseitigt das falsche Orakel; der reale Browser-Recoveryfall ist
    danach PASS.`
  - `F-ACT-R14-28 ist lokal geschlossen: Ein mehrtägiger Draft überschreitet
    deterministisch die bestehende 1440-Minuten-Grenze und scheitert vor
    Persistenz oder Transport mit INVALID_TIME/duration_min. Der write-freie
    Preflight verwendet denselben Intent-/Validierungspfad und verändert Draft,
    Request-ID oder Eingaben nicht.`
  - `F-ACT-R14-29 Viewport ist lokal geschlossen: Die Overlayhosts liegen nicht
    mehr im transformierten, höhenbegrenzten Hubpanel; 1280x720, 960x640,
    390x844 und 320x800 sind per Maus, Tastatur beziehungsweise Touch grün.`
  - `F-ACT-R14-29 Cache ist gemeinsam mit F-ACT-R14-32 lokal geschlossen:
    direkte und transitive Releaseidentitäten, releaseeigene Cache-Lookups,
    v20/v21-Materialisierer und reale schnelle Wechsel sind grün.`
  - `F-ACT-R14-30 ist lokal geschlossen: calcMAP-Diagnostik enthält nur noch
    abstrakte Fehlercodes; Werte, Kontext, Fehlertexte und Gesundheitsdetails
    sind durch einen Negativvertrag ausgeschlossen.`
  - `F-ACT-R14-31 ist lokal geschlossen und final reviewed: v20 und v21
  ergänzenden in den eingefrorenen Quellpostimages
  fehlenden Chart-Workerasset deterministisch
    am eindeutigen Main-Asset-Anker und normalisieren nur bekannte EOF-
    Leerzeilen. 8/8 Contracts und beide isolierten Materialisierungen samt
    diff-check sind PASS.`
  - `F-ACT-R14-32 ist lokal geschlossen: Alle 18 Quellen des Supabase-/Boot-
    ESM-Graphs verwenden eine gemeinsame Releasequery, der Worker installiert
    den vollständigen Graph und die v20/v21-Materialisierer normalisieren ihn
    deterministisch. Ein alter v19-Worker mit v20-HTML, v20→v21-Rollback und
    Fresh-v20→Offline wurden im echten Browser mit realen Releasewurzeln
    kohärent bewiesen; doppelte Root-/Auth-Core-Identitäten bleiben aus.`
  - `F-ACT-R14-34 ist diagnostiziert und offen: app/supabase/api/intake.js
    protokolliert beim Laden einer Tagesaufnahme Benutzer-/Tageskontext,
    Datensatz-ID und den serialisierten Payload. Dieselbe Callsite ist bereits
    in 4be058b1, 0fa44e2, 2dbfa3c und dem aktuellen 40c4b93/v21 vorhanden;
    sie wurde nicht durch V2 eingeführt und bleibt nach dem daten- und
    writerseitig erfolgreichen Rollback produktiv aktiv. F30 und sein Test
    prüften ausschließlich vitals.js/calcMAP und verfehlten diese Grenze.`
  - `F-ACT-R14-34 ist im API-Modul lokal minimal korrigiert: ausschließlich
    abstrakte Start-/Ergebnis-/Fehlercodes, neuer statischer Negativvertrag
    4/4 gemeinsam mit Vitals PASS. Die vollständige Privacy-Closure bleibt
    durch F-ACT-R14-35 invalidiert.`
  - `F-ACT-R14-35 ist P1 offen: Das neue inhaltsfreie Browserorakel meldet im
    frischen lokalen v22-Produktboot 36 sensitive-pattern Treffer. Eine zweite
    inhaltsfreie Klassifikation ordnet 24 day-Label-Treffer 16 Capture-Refresh-
    und 8 Medication-Diagnosen zu. Statisch besitzt
    app/modules/intake-stack/intake/index.js 42 diagnosekritische Call-Sites
    mit Tageskontext, Intakewerten, Medikations-/Datensatzidentitäten oder
    rohen Fehlerdetails. Keine Inhalte oder Gesundheitswerte wurden ausgegeben.`
  - `D-ACT-R14-27 trennt diesen bestehenden gemeinsamen MIDAS-Fund vom
    Activity-V2-Cutover: F35 bleibt offen und darf nicht als allgemeiner
    Privacy-PASS gelten, wird aber nicht mehr automatisch in R14 repariert.
    Der echte aktuelle V2-Cutoverblocker ist F36: Der bewahrt gebliebene alte
    Recovery-Draft ist nach F28 nicht commitfähig und verhindert im
    Single-Draft-Vertrag einen frischen Smoke-Draft, solange er nicht bewusst
    über den bestehenden UI-Pfad verworfen wird.`
- Geänderte Dateien:
  - `Aktueller lokaler Stand: Intake-API-Minimalfix und Privacyvertrag;
    v22-Productload samt vollständigem Supabase-/Boot-ESM-Graph; aktualisierte
    v22/v23-Materializer, Release-/Isolation-/Consumerorakel und inhaltsfreier
    Productbrowser-Zähler; zusätzlich der neue Repair-Findings-Bugreport.
    Manifest und P1-Scope bleiben bis zur F36-Ownerentscheidung offen.`
  - `Block A/B: Productcontroller, CSS und direkter Contracttest. Block C:
    index.html, app.css, main.js, Auth-Lifecyclehook, Chartadapter, Root-SW,
    acht invalidierte Product-/Isolationorakel sowie neuer R14-Cutovercontract
    und explizites v15-Rollbacktool. Roadmap/Evidence sind synchronisiert;
    vorbestehende Änderungen an DEV_ENVIRONMENT und Workflow Contract bleiben
    unangetastet.`
  - `Beim U8R-Re-entry erschien zusätzlich eine fremde Guard-Future-Notes-
    Änderung. Sie wurde am 2026-09-07 unter
    docs/Codex Usage Guard Evolution Notes.md konsolidiert und bleibt außerhalb
    des R14-Produkt-, Test- und Cutoverscopes.`
  - `S5 ergänzte ausschließlich invalidierte Contractpostimages, archivierte
    Contractpfade, einen R13-aktivierten Reporttest und die fingerprintgebundene
    R10/R14-Ausnahme im bestehenden R8-Isolationsgate; keine Runtime-, SQL-
    oder medizinische Backendquelle wurde dadurch geändert.`
  - `Auf ce2e18d wurde lokal der bestätigte V2-Productload erneut materialisiert,
    ausschließlich um F-ACT-R14-25 und die monotone v16/v17-Reserve zu prüfen.
    Die vorbestehenden DEV_ENVIRONMENT-/Workflow-Contract-/Usage-Notes-/Training-
    Thoughts-Änderungen sowie die ungetrackte R15-Roadmap bleiben fremd und
    unangetastet.`
  - `Aktuell sind 49 R14-Code-/Testdateien für v20/v21 abgegrenzt; zusammen
    mit Roadmap und Evidence umfasst der nächste konditionale P1-Scope 51
    Dateien. Manifest`333a3469...db95`. Fremde Dirty-Dateien und die
    ungetrackte R15-Roadmap bleiben ausgeschlossen.`
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
  - `Postrollback-Fingerprint: korrigiertes v15-Rollbacktool
    34b7dff4...291bf; Produktpostimage ist Commit ce2e18d.`
  - `Korrekturpostimage: Controller d30e7b8a...c7c0; Regression
    559581bc...5598; index 340d37e7...ea0a; app.css e9df9112...5e4f;
    main 3411f13d...fd6; Authcore d0a2b041...20ca; Chart
    c743db04...2d8; Root-SW-v16 8c208012...0142; Cutovercontract
    2c751df3...ee11; v17-Rollbacktool a03f7a91...dc3.`
  - `S5.3-Postimage: V1 67/b9807820...5d94, davon eingefrorene R13-Basis
    66/cfddb1fa...b6f unverändert und ein gültiger Zugang vor G0; V2
    Sessions/Items/Sets 0/0/0 und Request-IDs je 4f53cda1...b945. SQL26
    User/Service/Core cffcd679...9f2b, eb27ec44...6f54 und
    abb59627...f79f; SQL22-24/R9-Funktionen ebenfalls exakt hashgleich.`
  - `Lokales F-ACT-R14-26-Postimage 2026-09-06: Controller
    47acec1a...e173, Controller-Test e3c4028d...b1bdb, Harness-HTML
    dd6a8048...edde, Harness-JS 077ee88f...1eea und Harness-Contract
    51c411b2...32d. 19-Dateien-Code-/Testmanifest
    75daad72...d3169; Root-SW v18, explizite V1-Inverse v19.`
  - `V18/V19-Postimage 2026-09-06: Cutover 0fa44e2/Run 34022878621;
    Rollback 3857bf4/Run 34023954044; Live v19 V1/V2/R13 1/0/2. Daten
    V1 69/459f2056...007d, V2 0/0/0/4f53cda1...b945. Gültige neue
    Evidence: v18-Productload/Fresh/Upgrade/Recovery und vollständiger
    v19-Rollback. Invalidiert als Abschlussbeweis: produktiver Write-/Reader-/
    Delete-Reproof.`
  - `Dirty-Stop-Closure und F31-Repair: F28/F30 sowie F29-Viewport lokal
    geschlossen; Materialisierer ergänzt fehlenden Chart-Token deterministisch.
    35-Dateien-Manifest 2a9bb7f9...0812c; v20/v21-Roundtrip PASS. Evidence
    EV-ACT-R14-L13; nativer Abschlussreview noch offen.`
  - `F32-Postimage 2026-09-07: vollständiger 18-Dateien-Supabase-/Boot-Graph,
    Root-SW 88232bcf...b186, Cutovertool 15dd80da...d316, Rollbacktool
    a19144c7...b2ed; reale v19→v20-/v20→v21- und Fresh→Offline-Smokes PASS.
    49-Dateien-Code-/Testmanifest 333a3469...db95; EV-ACT-R14-L15.`
- Autonomieprofil / aktuelle Welle:
  - `gated; G0-S5.3 lokal autonom, danach koordiniertes P1/P2; P3 nur bei
    unerwartetem Reparaturbedarf.`
- Runtime-/Deploy-Stand:
  - `Das v20-Postimage 2dbfa3c / Pages 34160428748 wurde wegen
    F-ACT-R14-34 vor jedem V2-Write verworfen. Commit 40c4b93 stellte über
    Pages-Run 34160860095 den vollständigen V1-Productload mit Root-SW v21
    wieder her. Live: V1-Form/Script je 1, V2-Productcontroller 0,
    R13-Readerloads 2; frischer aktualisierter V1-Client PASS. Datenstand
    V1 69 mit geschütztem Baselinehash, V2 0/0/0; keine Mutation.`
- Offene Owner-Freigaben:
  - `D-ACT-R14-19/-20 und D-ACT-R14-22 wurden in den abgeschlossenen
    v16/v17- beziehungsweise v18/v19-Fenstern ausgeübt. D-ACT-R14-23/-25
    wurden im v20/v21-Fenster ausgeübt und sind verbraucht. D-ACT-R14-29
    erteilt neues P1/P2 für genau ein unverändertes v22/v23-Fenster, ist noch
    nicht ausgeübt und darf beim nächsten frischen Gate ab 72/21 ohne erneute
    Rückfrage verwendet werden. P3 bleibt außerhalb normaler bestätigter Flows
    nötig.`
- Letzter Usage-Checkpoint / Entscheidung:
  - `U11R22 2026-09-08T08:10:42+02:00: 5h 36 %, Woche 90 %, gültig;
    CONTINUE. 8/1 seit U11R21 für F36-Erklärung, Ownerentscheidung D28 und
    vollständigen Roadmap-/Evidence-/Repairreport-Sync. Der bounded Block ist
    beendet; kein weiterer technischer Block in dieser Episode.`
- Rehydrationsstatus:
  - `U12R6 war POST_REHYDRATION_BASELINE; Rehydration wurde als SUNK_USAGE
    behandelt. Das angeforderte Profil GPT-5.6 Sol / High blieb unverändert;
    die aktive UI-/Runtime-Stufe ist technisch nicht beobachtbar und wird
    daher nicht als unabhängig verifiziert behauptet.`
- Primärblock / Zulassung:
  - `Der F34-API-Fix und die durch ihn sowie den v22/v23-Releasegraph
    invalidierte lokale Closure sind vollständig grün. Das reale
    Productbrowser-Orakel trennt F34 mit 0 eigenen sensitiven Treffern vom
    bekannten F35-Shared-Backlog. Release-Manifest 50 Dateien
    179c9df6...29e1; aktueller Git-P1-Deltascope 35 Code-/Testdateien plus die
    drei R14-Dokumente, insgesamt 38 Dateien. PRE09 ist PASS.`
- Restricted-Work-Episode:
  - `Keine Restricted-Work-Episode aktiv. U11R24 liefert CONTINUE, liegt mit
    46/77 aber unter der effektiven operativen 72/21-Grenze. D-ACT-R14-29 ist
    erteilt; der nächste produktive Block wartet nur auf ein frisches
    ausreichendes Gate und unveränderten Driftcheck.`
- Erlaubter Fallback:
  - `Keiner. Sicherer Resume-Stand vor dem atomaren v22/v23-Fenster.`
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
| U11 | `2026-08-30T08:31:43+02:00` | `34 % / 1788087867` | `90 % / 1788674667` | `64 / 10 seit U10R2; 5h liegt im inklusiven Caution-Band` | `CONTINUE_WITH_CAUTION` | `V15-Rollback ist abgeschlossen; nur Status-/Evidence-Sync, S5.6 nicht begonnen` |
| U11R | `2026-08-30T08:42:38+02:00` | `9 % / 1788087867` | `86 % / 1788674667` | `25 / 4 seit U11; 5h liegt unter 25 %` | `SAFE_CLOSURE` | `Caution-Diagnose vollständig synchronisiert; kein Fix und kein neuer Block` |
| U11R2 | `2026-08-30T15:19:50+02:00` | `98 % / 1788113976` | `84 % / 1788674667` | `5h RESET_CROSSED; Woche 2 Prozentpunkte seit U11R` | `CONTINUE` | `vollständiger lokaler F-ACT-R14-25-Korrekturblock erlaubt` |
| U10R3 | `2026-08-30T15:38:32+02:00` | `52 % / 1788113976` | `77 % / 1788674667` | `46 / 7 seit U11R2; Validator gültig und CONTINUE, aber empirische 1,5-Reserve des ersten atomaren Fensters 96 / 15 reicht nicht` | `CONTINUE` | `neues P1/P2-Briefing erlaubt; kein atomarer Cutoverstart, frisches Gate nach ausreichender Erholung erforderlich` |
| U10R4 | `2026-08-30T15:47:10+02:00` | `36 % / 1788113976` | `75 % / 1788674667` | `16 / 2 seit U10R3; lokaler Hardeningblock vollständig abgeschlossen, 5h im Caution-Band und atomare Reserve nicht vorhanden` | `CONTINUE_WITH_CAUTION` | `kein Cutover; Release-Manifest und sichere Resume-Grenze synchronisieren` |
| U10R5 | `2026-08-30T15:50:39+02:00` | `33 % / 1788113976` | `74 % / 1788674667` | `3 / 1 seit U10R4; 5h bleibt im Caution-Band` | `CONTINUE_WITH_CAUTION` | `genau ein kurzer lokaler S6-Deltamap-Block; keine Source of Truth vorzeitig umstellen` |
| U10R6 | `2026-08-30T15:52:02+02:00` | `30 % / 1788113976` | `74 % / 1788674667` | `3 / 0 seit U10R5; S6-Deltamap und Postconditions abgeschlossen, 5h bleibt im Caution-Band` | `CONTINUE_WITH_CAUTION` | `höchstens ein weiterer kurzer lokaler Operator-/Fingerprintblock; kein P1/P2-Cutover` |
| U10R7 | `2026-08-30T15:55:16+02:00` | `26 % / 1788113976` | `73 % / 1788674667` | `4 / 1 seit U10R6; 5h knapp im Caution-Band` | `CONTINUE_WITH_CAUTION` | `letzter kurzer lokaler S6-Source-Fingerprintblock; danach Abschluss-Gate` |
| U10R8 | `2026-08-30T15:56:15+02:00` | `25 % / 1788113976` | `73 % / 1788674667` | `1 / 0 seit U10R7; exakte inklusive 25-%-Grenze bleibt Caution` | `CONTINUE_WITH_CAUTION` | `ein letzter minimaler lokaler S6-Textbausteinblock; danach Abschluss-Gate und sichere Pause` |
| U10R9 | `2026-08-30T15:56:53+02:00` | `24 % / 1788113976` | `73 % / 1788674667` | `1 / 0 seit U10R8; 5h unter 25-%-Grenze` | `SAFE_CLOSURE` | `kein neuer Block; vollständig vorbereitete Resume-Grenze vor P1/P2 und frischem Gate nach Erholung` |
| U10R10 | `2026-08-30T20:24:58+02:00` | `95 % / 1788132244` | `68 % / 1788674667` | `5h RESET_CROSSED; Woche 5 Punkte seit U10R9; bevorzugte Reserve 96/15 um einen 5h-Punkt verfehlt; harte Mindestreserve 89/20 und statisches CONTINUE erfüllt` | `historisch falsch als RESERVE FAIL behandelt; nach D-ACT-R14-20 boundary-fähig` | `Block wurde nicht begonnen; nach weiterem Usage-Verbrauch genau ein frisches Gate, dann bei 5h mindestens 89 % und Woche über 20 % unmittelbarer Start ohne erneute Owner-Rückfrage` |
| U10R11 | `2026-08-31T06:37:47+02:00` | `94 % / 1788168965` | `99 % / 1788755765` | `5h und Woche RESET_CROSSED; POST_REHYDRATION_BASELINE; SUNK_USAGE nicht doppelt reserviert; 94/99 liegt über harter 89/20-Mindestreserve` | `CONTINUE / PRIMARY_OWNER_BOUNDARY_ALLOWED` | `D-ACT-R14-19/-20 ausgeübt; atomares v16/v17-Fenster ohne Zwischenpoll begonnen` |
| U11R3 | `2026-08-31T06:55:35+02:00` | `52 % / 1788168965` | `93 % / 1788755765` | `42 / 6 seit U10R11; atomares Fenster vollständig mit v17-Rollback beendet` | `CONTINUE` | `S5.6 reales Rollbackpostimage und begrenzte Ursachenabgrenzung erlaubt; kein weiterer produktiver Versuch` |
| U12 | `2026-08-31T07:02:18+02:00` | `35 % / 1788168966` | `90 % / 1788755766` | `17 / 3 seit U11R3; 5h im Caution-Band` | `CONTINUE_WITH_CAUTION` | `S5.6 synchronisiert; S6/DONE wegen F-ACT-R14-26 gesperrt, kein neuer Block` |
| U12R1 | `2026-08-31T07:04:40+02:00` | `29 % / 1788168966` | `89 % / 1788755766` | `6 / 1 seit U12; ein vorab begrenzter lokaler Diagnoseblock, kein Deploy oder Datenbankzugriff` | `CONTINUE_WITH_CAUTION` | `Fehlergrenze vor/an Shell-Dispatch in sessionCommit.finish(); Testlücke dokumentiert, kein Fix begonnen` |
| U12R2 | `2026-08-31T07:09:30+02:00` | `19 % / 1788168965` | `87 % / 1788755765` | `10 / 2 seit U12R1; 5h liegt unter der 25-%-Grenze` | `SAFE_CLOSURE` | `kein neuer Diagnoseblock; ausschließlich Checkpoint- und Resume-Sync` |
| U12R3 | `2026-09-05T20:41:30+02:00` | `95 % / nicht erneut abgeleitet` | `85 % / nicht erneut abgeleitet` | `gültiges Gate vor lokalem Diagnoseblock; späterer echter Usage-DIRTY-STOP nach unvalidiertem Testpatch` | `CONTINUE / BLOCK DIRTY_STOPPED` | `kein Produktfix oder externer Effekt; Recovery Receipt und neues Gate erforderlich` |
| U12R4 | `2026-09-06T05:44:05+02:00` | `86 % / 1788683876` | `68 % / 1788755765` | `POST_REHYDRATION_BASELINE; U12R3-Resetidentität nicht dokumentiert, daher kein Delta; Rehydration ist SUNK_USAGE` | `CONTINUE / PRIMARY_ALLOWED` | `kohärenter lokaler F-ACT-R14-26-Diagnose-/Fix-/Validierungsblock; danach zwingend erneut messen` |
| U12R5 | `2026-09-06T06:02:49+02:00` | `42 % / 1788683876` | `61 % / 1788755765` | `44 / 7 seit U12R4; großer lokaler Block vollständig abgeschlossen` | `CONTINUE / PRIMARY_REJECTED_FOR_RESERVE` | `v18/v19-Produktivfenster nicht begonnen; lokale Evidence synchronisiert, sichere Pause vor S5.4` |
| U12R6 | `2026-09-06T10:45:59+02:00` | `94 % / 1788702263` | `55 % / 1788755765` | `5h RESET_CROSSED; Woche 6 Punkte seit U12R5; POST_REHYDRATION_BASELINE` | `CONTINUE / PRIMARY_OWNER_BOUNDARY_ALLOWED` | `D-ACT-R14-22 ausüben; atomares v18/v19-Cutoverfenster ohne Zwischenpoll beginnen` |
| U11R4 | `2026-09-06T11:17:12+02:00` | `23 % / 1788702263` | `44 % / 1788755765` | `71 / 11 seit U12R6; atomares Fenster davor vollständig durch v19-Rollback beendet` | `SAFE_CLOSURE` | `nur Status-/Findings-/Evidence-/Resume-Sync; Diagnose F-ACT-R14-28..30 nicht begonnen` |
| U11R5 | `2026-09-06T21:36:13+02:00` | `96 % / 1788741277` | `24 % / 1788755765` | `POST_REHYDRATION_BASELINE nach eindeutigem Dirty-Stop-Recovery; Rehydration ist SUNK_USAGE` | `CONTINUE` | `nur fehlende/invalidierte lokale Closure-Checks; kein Fix, Cutover oder externe Wirkung` |
| U11R6 | `2026-09-06T21:40:52+02:00` | `87 % / 1788741277` | `22 % / 1788755765` | `9 / 2 seit U11R5; Closure sicher beendet und F31 vollständig dokumentiert` | `CONTINUE` | `kein automatischer Repairblock gemäß Sessionvertrag; Pause vor eigenem F31-Fix-/Retestblock` |
| U11R7 | `2026-09-06T21:44:37+02:00` | `81 % / 1788741277` | `21 % / 1788755765` | `6 / 1 seit U11R6; neuer expliziter Ownerauftrag für enges F31-Repair` | `CONTINUE` | `nur Materialisierer, direkter Contract und isolierter v20/v21-Roundtrip` |
| U11R8 | `2026-09-06T21:50:28+02:00` | `69 % / 1788741277` | `19 % / 1788755765` | `12 / 2 seit U11R7; F31-Repair und sichere Dokumentationspostconditions vollständig` | `CONTINUE_WITH_CAUTION` | `Repairblock beendet; kein Review-/Red-Team-Anschluss in derselben Restricted-Work-Episode` |
| U11R9 | `2026-09-06T22:01:28+02:00` | `55 % / 1788741277` | `17 % / 1788755765` | `14 / 2 seit U11R8; genau ein ownerbeauftragter bounded Finding-only-Review mit vollständigen Dokumentationspostconditions` | `CONTINUE_WITH_CAUTION` | `F32 P1 offen; kein zweiter Block in derselben Restricted-Work-Episode, sichere Pause vor F32-Repair` |
| U11R10 | `2026-09-07T07:04:38+02:00` | `98 % / 1788775447` | `100 % / 1789362247` | `POST_REHYDRATION_BASELINE; Resetidentitäten gewechselt; Rehydration SUNK_USAGE` | `CONTINUE` | `kohärenter lokaler F32-Diagnose-/Fix-/Retestblock zugelassen; keine Produktivwirkung` |
| U11R11 | `2026-09-07T07:34:05+02:00` | `29 % / 1788775447` | `89 % / 1789362247` | `69 / 11 seit U11R10; F32-Repair, reale Releasebrowser, Regressionen, Fullreviews und Doku vollständig` | `CONTINUE_WITH_CAUTION` | `lokaler Block geschlossen; kein neuer Block in dieser Restricted-Work-Episode; Pause vor neuem P1/P2 und frischem Cutovergate` |
| U11R12 | `2026-09-07T12:15:54+02:00` | `95 % / 1788793997` | `83 % / 1789362247` | `5h RESET_CROSSED; POST_REHYDRATION_BASELINE; Rehydration SUNK_USAGE. Vergleichsblock 71/11; echte Closure 9/2; Sensorpuffer 1/1; Hard Floor 81/14; effektive Zulassungsgrenze 81/21; raw Preferred 107/17 und 5h PREFERRED_UNATTAINABLE` | `historisch CONTINUE / PRIMARY_REJECTED_FOR_RESERVE; durch F-ACT-R14-33 als RESERVE_MISCLASSIFICATION korrigiert und boundary-fähig` | `D-ACT-R14-23 dokumentiert, aber nicht ausgeübt; kein Preflight, Commit, Push, Deploy oder produktiver Write; wegen Zeitablauf frisches Gate vor S5.4` |
| U11R13 | `2026-09-07T17:51:16+02:00` | `80 % / 1788813548` | `66 % / 1789362247` | `POST_REHYDRATION_BASELINE; Rehydration SUNK_USAGE. PRE08, 49-Dateien-Manifest, 51-Dateien-Scope und v19-Postimage PASS. Nach D-ACT-R14-25: Operational Safety Floor 72/12, effektiv 72/21; Autonomous Full-Closure Floor 81/14, effektiv 81/21` | `CONTINUE / PRIMARY_OWNER_BOUNDARY_ALLOWED` | `Die frühere Ein-Punkt-Ablehnung war eine Reservefehlklassifikation. Stephan akzeptierte das reduzierte administrative Closure-Polster ausdrücklich; kein produktiver Start erfolgte bisher.` |
| U11R14 | `2026-09-07T18:18:14+02:00` | `59 % / 1788813548` | `62 % / 1789362247` | `16/3 seit dem Guard-Hotfix-U0 75/65; Workflow-, R14- und Guard-Dokumente korrigiert und geprüft; keine Produktwirkung` | `CONTINUE / PRIMARY_REJECTED_FOR_RESERVE` | `Hotfixblock vollständig geschlossen; unter effektivem Operational Safety Floor 72/21 kein v20/v21-Start in diesem Bucket; D-ACT-R14-23/-25 bleiben für das nächste ausreichende Gate gültig` |
| U11R15 | `2026-09-07T22:40:33+02:00` | `98 % / 1788831575` | `53 % / 1789362247` | `5h RESET_CROSSED; POST_REHYDRATION_BASELINE; Rehydration SUNK_USAGE; PRE08, Manifest, Scope und v19-Postimage unverändert` | `CONTINUE / PRIMARY_ALLOWED` | `D-ACT-R14-23/-25 ausüben; atomares v20/v21-Fenster ohne Zwischenpoll begonnen` |
| U11R16 | `2026-09-07T23:02:12+02:00` | `58 % / 1788831575` | `46 % / 1789362247` | `40 / 7 seit U11R15; v20 deployt, F34 vor Write gefunden, v21-Rollback samt Live-/Fresh-/Datenpostcondition vollständig` | `CONTINUE` | `Atomfenster beendet; F34 offen, D-ACT-R14-23/-25 verbraucht; sichere Pause vor getrenntem lokalem Diagnose-/Repairblock` |
| U11R17 | `2026-09-07T23:13:05+02:00` | `43 % / 1788831575` | `44 % / 1789362247` | `15 / 2 seit U11R16; bounded read-only F34-Diagnose, Test-/Release-Scope und vollständige Dokumentationspostcondition` | `CONTINUE_WITH_CAUTION` | `F34 REPAIR READY; kein zweiter Block in derselben Restricted-Work-Episode; sichere Pause vor lokalem Fix-/Retestblock` |
| U11R18 | `2026-09-08T07:18:55+02:00` | `97 % / 1788862640` | `99 % / 1789449440` | `POST_REHYDRATION_BASELINE; Rehydration SUNK_USAGE` | `CONTINUE` | `kohärenter lokaler F34-Repair-/Retestblock zugelassen` |
| U11R19 | `2026-09-08T07:39:48+02:00` | `66 % / 1788862640` | `95 % / 1789449440` | `31 / 4 seit U11R18; F34-API-Fix, v22-Materialisierung, direkte Revalidation, Browserorakel, F35-Eingrenzung und Dokumentationspostcondition` | `CONTINUE / PRIMARY_BLOCKED_BY_FINDING` | `F35 P1 offen; kein zweiter Fixblock im selben Turn, sichere Pause vor eigenem Diagnose-/Repairblock` |
| U11R20 | `2026-09-08T07:52:14+02:00` | `57 % / 1788862640` | `93 % / 1789449440` | `POST_REHYDRATION_BASELINE für den neuen Ownerauftrag; Rehydration SUNK_USAGE` | `CONTINUE / BOUNDED_LOCAL` | `Repair-Bugreport plus fokussierte V2-Blockeranalyse; kein Fix, Test oder Cutover` |
| U11R21 | `2026-09-08T08:02:35+02:00` | `44 % / 1788862640` | `91 % / 1789449440` | `13 / 2 seit U11R20; vollständiger F01-F35-Repairreport, Scopeentscheidung D27 und F36-Ursachen-/Optionsnachweis` | `CONTINUE / BLOCK_COMPLETE` | `Kein weiterer Block in dieser Episode; sichere Pause vor ausdrücklicher F36-Ownerentscheidung und neuem P1/P2` |
| U11R22 | `2026-09-08T08:10:42+02:00` | `36 % / 1788862640` | `90 % / 1789449440` | `8 / 1 seit U11R21; F36 erklärt, D-ACT-R14-28 erteilt und alle drei R14-Dokumente synchronisiert` | `CONTINUE / RESUME_READY` | `Kein zweiter bounded oder technischer Block; Pause vor frischem Gate, lokaler Closure, Manifest/Preflight und neuem v22/v23-P1/P2` |
| U11R23 | `2026-09-08T12:24:23+02:00` | `98 % / 1788880993` | `86 % / 1789449440` | `POST_REHYDRATION_BASELINE; Rehydration SUNK_USAGE; F34-/Release-Closureblock zugelassen` | `CONTINUE` | `Nur invalidierte lokale Tests/Reviews, finales Manifest, Scope und produktiver Read-only-Preflight; keine Produktivwirkung` |
| U11R24 | `2026-09-08T12:48:39+02:00` | `46 % / 1788880993` | `77 % / 1789449440` | `52 / 9 seit U11R23; F34-/Release-Closure, drei Releasebrowserpfade, native Fullreviews, 50-Dateien-Manifest und PRE09 vollständig` | `CONTINUE / BLOCK_COMPLETE` | `Lokaler Block beendet; Produktion unverändert. Neues P1/P2-Briefing und ausdrückliches Owner-Gate vor v22/v23.` |

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
  - `Cutover-/Rollback-Receipt: V2-Commit 1edbe38d, erfolgreicher Pages-Run
    33296179701 und Root-SW v14; Web-Fresh/Upgrade/stale-client sowie realer
    Recovery-Reload PASS. Commit original plus identischer Retry ergaben
    fail-closed ohne Persistenz, Draft erhalten, V2 0/0/0. V15-Rollbackcommit
    ce2e18d und Pages-Run 33296959317 PASS; live V1-Form/Script 1/1,
    V2-Productcontroller 0, R13-Reader 2, SW v15. Live-Indexfingerprint
    f6457fe0...9523, Live-SW 95d2922f...12da.`
  - `U11 2026-08-30T08:31:43+02:00 ist valide: 34 % 5h / 90 % Woche,
    CONTINUE_WITH_CAUTION. S5.6 wurde nicht begonnen.`
  - `Kurzer U11-Caution-Diagnoseblock: F-ACT-R14-25 lokal reproduziert. V2-
    Draftsemantik erreicht sessionCommit.create, aber nicht den realen
    dataAccess.commitSession-Aufruf. Das bestehende S4.7-Negativorakel beweist,
    dass eine v2-Payload ohne explizite semantics-v2-Option vor Transport als
    INVALID_SESSION/not_committed endet. Kein Remotezugriff, Write oder Fix.`
  - `U11R 2026-08-30T08:42:38+02:00 ist valide: 9 % 5h / 86 % Woche,
    SAFE_CLOSURE. Der Diagnoseblock ist abgeschlossen und synchronisiert; die
    Korrektur wurde nicht begonnen.`
  - `U11R2 2026-08-30T15:19:50+02:00 ist valide: 98 % 5h / 84 % Woche,
    CONTINUE nach 5h-Reset. F-ACT-R14-25 wurde lokal ohne SQL-/Auth-/Secret-
    oder medizinische Änderung korrigiert. Die echte Controller→Data-Access-
    Regression, 299 Node-, 84 Deno-, 55 Syntax- und Cutover-/Rollbackcontracts
    sowie der isolierte Browser-Harness sind PASS. Backend-Runtime-Diff 0,
    Secretmuster 0; keine externe oder produktive Wirkung.`
  - `Erneuerter produktiver Read-only-Preflight: HEAD=origin/main=Pages ce2e18d,
    Run 33296959317 completed/success; live V1-Script 1, V2-Productcontroller 0,
    R13-Readerloads 2 und Root-SW v15. V1-ID-Menge bleibt 67; V2
    Sessions/Items/Sets 0/0/0 mit den drei unveränderten Leerhashes
    4f53cda1...b945; Katalog 78/80. Kein Payloadread, Write oder Delete.`
  - `U10R3 2026-08-30T15:38:32+02:00 ist valide: 52 % 5h / 77 % Woche,
    CONTINUE. Das Briefing darf erfolgen; vor dem atomaren Fenster ist wegen
    der aus dem ersten Fenster abgeleiteten 1,5-Reserve 96/15 ein weiteres
    frisches, ausreichend reserviertes Gate erforderlich.`
  - `Der daran angeschlossene lokale Hardeningblock änderte nur den direkten
    Composition-Regressionstest und die R14-Dokumentation. 61/61 invalidierte
    Verträge, abgegrenzter 16+2-Release-Scope, null V1-Writercallsite, ein
    V2-Mount, git diff --check und der lokale Edge-Boot sind PASS. Produktion
    blieb ce2e18d/V1/SW v15; keine externe oder produktive Wirkung.`
  - `Der kanonisch geordnete 16-Dateien-Code-/Test-Release-Manifesthash lautet
    2b329d5a...4926b. U10R4 2026-08-30T15:47:10+02:00 ist valide: 36 % 5h /
    75 % Woche, CONTINUE_WITH_CAUTION. Der kurze lokale Block ist beendet;
    ein produktives atomares Fenster wurde nicht begonnen.`
  - `U10R10 2026-08-30T20:24:58+02:00: 95 % 5h / 68 % Woche nach
    RESET_CROSSED; technisch CONTINUE. Die bevorzugte atomare 96/15-Reserve
    war um einen 5h-Punkt verfehlt, die später eingeführte harte 89/20-
    Mindestreserve jedoch erfüllt. Der Block wurde nicht begonnen; D-ACT-
    R14-20 verhindert künftig eine erneute Ablehnungs- und Re-Gate-Schleife.`
  - `U10R11 2026-08-31T06:37:47+02:00: 94 % 5h / 99 % Woche, CONTINUE und
    PRIMARY_OWNER_BOUNDARY_ALLOWED. Commit 1b6e716/Run 33357905534 lieferte
    v16 mit V1/V2/R13 0/1/2; Web/PWA/Recovery PASS. Original und identischer
    Retry blieben ohne Persistenz bei V1 67 und V2 0/0/0.`
  - `Die bedingte Inverse erzeugte Commit 4e87729/Run 33358569779. Live sind
    V1/V2/R13 1/0/2 und Root-SW v17; frischer V1-Boot und Trainingsmaske PASS.
    R13-Service-Snapshot bleibt bei 67 Units und 0 Mixed-Source-Days. U11R3
    2026-08-31T06:55:35+02:00 ist mit 52 % / 93 % CONTINUE; F-ACT-R14-26
    bleibt offen und S6 gesperrt.`
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
| D-ACT-R14-19 | 2026-08-30 | P1 und P2 für das vorbereitete v16/v17-Cutoverfenster sind gemeinsam und konditional erteilt: Commit, Push, Pages-Deploy, genau ein V2-Smoke-Write, Reader-Smokes, normaler R9-Delete und bei Pflichtfehler der datenverlustfreie v17-Webrollback. | Ausübung ausschließlich nach einem frischen Usage-Gate, das den vollständigen atomaren Block samt Reserve erlaubt. Bei CONTINUE_WITH_CAUTION, SAFE_CLOSURE, ungültiger Telemetrie oder unzureichender Reserve keine produktive Aktion. |
| D-ACT-R14-20 | 2026-08-30 | Der Owner akzeptiert für exakt das unveränderte, vorbereitete v16/v17-Fenster einmalig `CONTINUE_OWNER_BOUNDARY`. Bevorzugte Reserve ist 96/15; harte Mindestreserve aus beobachtetem vollständigem Block plus Closure-Rest ist 89/20. | U10R10 lag mit 95/68 über der harten Grenze und im statischen Continue-Bereich. Der frühere absolute Ein-Punkt-Stop erzeugte drei Ablehnungen und zusätzlichen Usage-Verbrauch ohne Sicherheitsgewinn. Da das Fenster nicht begann, ist einmalig frisch zu messen; bei 5h mindestens 89 %, Woche über 20 % und unverändertem Produktpostimage beginnt es ohne weitere Owner-Diskussion. Unter der harten Grenze, bei fehlendem statischem Continue, Drift oder Finding bleibt der Stop unüberstimmbar. |
| D-ACT-R14-21 | 2026-08-30 | U10R10 ist die erste kanonische Messung nach Reset und Session-Rehydration. Ihre 95 % sind die verfügbare Nettokapazität; der bereits angefallene Einstieg ist `SUNK_USAGE` und wird nicht nochmals in die Cutoverreserve eingerechnet. | Der Owner beobachtete vor dem Einstieg ein frisches Fenster, aber es existiert kein kanonischer Vorhercheckpoint mit derselben Reset-ID. Deshalb wird kein exaktes 5-%-Rehydrationsdelta behauptet. Für die Zulassung zählt der gemessene Rest gegen die harte 89/20-Mindestreserve; nur noch offene Reads oder Revalidierungen dürfen den prospektiven Bedarf erhöhen. |
| D-ACT-R14-22 | 2026-09-06 | Der Owner erteilt konditional P1/P2 für genau einen weiteren R14-Cutover nach bewiesenem F-ACT-R14-26-Fix, vollständig grüner lokaler Abschlussmatrix und frischem Usage-`CONTINUE` mit vollständiger atomarer Reserve. | Freigegeben sind der exakt abgegrenzte R14-Commit/Push, Pages-Deploy, genau ein V2-Smoke-Write, höchstens identischer Retry bei unbekannter Antwort, History/Detail/Export/R13-Smokes, normaler R9-Delete des Smoke-Datensatzes und bei Pflichtfehler der datenverlustfreie monotone v19-Webrollback. Nach grünem S6 ist auch der abschließende R14-Dokumentationscommit/Push freigegeben. Keine weitere P1/P2-Rückfrage bei erfüllten Bedingungen; P3 bleibt außerhalb dieser Flows Pflicht. |
| D-ACT-R14-23 | 2026-09-07 | Der Owner erteilt konditional neues gemeinsames P1/P2 für genau ein v20/v21-R14-Cutoverfenster einschließlich abschließendem R14-Dokumentationscommit/Push nach grünem S6. | Freigegeben sind ausschließlich der dokumentierte 51-Dateien-R14-Scope, bestehender Pages-Weg, genau ein V2-Smoke-Write, höchstens identischer Retry bei unbekannter Antwort, History/Detail/Export/R13-/Dual-Write-Nachweise, normaler R9-Delete des Smoke-Datensatzes und bei Pflichtfehler der vollständige datenverlustfreie v21-Webrollback. U11R12 begann unter der damals angewandten 96/21-Fehlklassifikation keine produktive Aktion. D-ACT-R14-24/-25 ersetzen ausschließlich diese Reservebewertung; Scope, P1/P2 und P3-Grenze bleiben unverändert. |
| D-ACT-R14-24 | 2026-09-07 | Der erste Contract Review korrigiert die durch F-ACT-R14-33 gefundene falsche Verwendung statischer Safe-Closure-Schwellen. | 71/11 vollständiger Vergleichsblock plus 9/2 echte CLOSURE_ONLY-Kosten plus 1/1 Sensorpuffer ergaben zunächst eine einheitliche 81/14-Grenze beziehungsweise effektiv 81/21. Der zweite Review in D-ACT-R14-25 trennt daraus die operative Sicherheitsgrenze von der autonomen Full-Closure-Grenze. Raw Preferred 107/17 bleibt `PREFERRED_UNATTAINABLE` und nur advisory. |
| D-ACT-R14-25 | 2026-09-07 | Der Owner verlangt nach der erneuten Ablehnung bei U11R13 ausdrücklich, den Usage Guard nicht als unüberwindbare Ein-Punkt-Sperre über seine Usage-Risikoentscheidung zu stellen. Der Workflow trennt deshalb Operational Safety Floor und Autonomous Full-Closure Floor. | Der vollständige 71/11-Block endete nachweislich `ROLLED_BACK_SAFE` und enthält die technische Produkt-/Rollbackpostcondition. Plus 1/1 Sensorpuffer ergibt Operational Safety Floor 72/12, effektiv im CONTINUE-Band 72/21. Die zusätzliche 9/2-CLOSURE_ONLY-Messung ergibt Autonomous Full-Closure Floor 81/14, effektiv 81/21. U11R13 80/66 erfüllt die operative Boundary. Stephan akzeptiert ausdrücklich, dass nur die umfassende administrative Closure gegebenenfalls in einen späteren Block fällt; minimale Postimage-/Resume-Fakten bleiben zwingend im atomaren Fenster. Bei unverändertem Scope, PRE08 und Rollback ist `PRIMARY_OWNER_BOUNDARY_ALLOWED` erteilt. Keine weitere identische Ablehnungsdiskussion; Produkt-, Security-, Daten- und Rollbackgates bleiben unberührt. |
| D-ACT-R14-26 | 2026-09-08 | Der Owner erteilt konditional P1/P2 für genau ein v22/v23-Fenster nach vollständig geschlossenem F34, grüner Revalidation, finalem Manifest/Preflight und erlaubendem Usage-Gate. | Nicht ausgeübt: Das neue Browser-Privacy-Orakel beweist F35 und invalidiert vor Scope-Freeze die Privacy-Closure. Die Entscheidung darf nicht eigenmächtig auf den zusätzlichen F35-Reparaturscope erweitert werden; kein Commit, Push, Deploy oder Write. |
| D-ACT-R14-27 | 2026-09-08 | Der Owner verlangt einen vollständigen Repair-Bugreport und begrenzt die weitere R14-Arbeit auf Fehler mit tatsächlichem Activity-V2-Bezug; MIDAS bleibt eine persönliche Single-User-App und allgemeine Bestandsfehler werden nicht übereifrig in R14 repariert. | `docs/MIDAS Activity V2 R14 Repair Findings.md` trennt V2-, Release-, Test-, Prozess- und gemeinsame MIDAS-Funde. F35 bleibt offen und transparent, ist aber als vorbestehender gemeinsamer Intake-Backlog kein bewiesener V2-Funktionsfehler. R14 darf keinen allgemeinen Privacy-PASS behaupten. F36 wird als echter V2-Cutover-Operatorblocker geöffnet; eine Draft-Verwerfung benötigt eine ausdrückliche Ownerentscheidung und neue passende P1/P2-Grenze. |
| D-ACT-R14-28 | 2026-09-08 | Der Owner bestätigt, dass der alte Activity-V2-Recovery-Draft einschließlich bisheriger Eingaben und gespeicherter Request-ID nach dem v22-Boot bewusst über den vorhandenen bestätigungspflichtigen UI-Pfad „Entwurf verwerfen“ gelöscht werden darf, damit ein frischer Smoke-Draft entstehen kann. | Gilt ausschließlich innerhalb eines danach separat freigegebenen v22/v23-Cutoverfensters. Kein automatischer Storage-Clear und keine Zeit-/Payload-/Request-ID-Umschreibung. Nach dem Discard wird ein frischer Katalog-v2-Draft mit neuer Request-ID erzeugt. Bestehende V1-/V2-Datenbankdaten bleiben unberührt; der spätere R9-Delete betrifft weiterhin nur den erzeugten Smoke-Datensatz. Diese Entscheidung allein autorisiert noch keinen Commit, Push, Deploy oder Write. |
| D-ACT-R14-29 | 2026-09-08 | Stephan erteilt nach grünem EV-ACT-R14-L18 und PRE09 konditional gemeinsames P1/P2 für genau das vorbereitete v22/v23-Cutoverfenster. | Noch nicht ausgeübt. Beim nächsten frischen gültigen `CONTINUE` ab effektiv 72 % 5h / 21 % Woche und unverändertem 50-Dateien-Manifest `179c9df6...29e1`, 38-Dateien-Git-Scope und PRE09 darf das Fenster ohne erneute P1/P2- oder Boundary-Rückfrage starten. Freigegeben sind ausschließlich der manifestierte R14-Commit/Push, bestehender Pages-Deploy, D-ACT-R14-28-Discard des alten Drafts, ein frischer v2-Draft, genau ein Smoke-Write, höchstens identischer Retry bei unbekannter Antwort, History/Detail/Export/R13-/Dual-Write-Nachweis, normaler R9-Delete des Smoke-Datensatzes und bei Pflichtfehler der vollständige datenverlustfreie v23-Rollback. P3 bleibt außerhalb dieser Flows Pflicht. |

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
| S5 | Tests, produktiver Cutover und Android | `High` | LOCAL CLOSURE PASS / P1-P2 REQUIRED / R14 OPEN | F28-F32 lokal geschlossen; v20/v21-Graph, reale Releasewechsel, Fresh-Offline, Matrix und Fullreviews grün. Produktiver Write-/Reader-/Delete-Reproof bleibt offen. |
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
| F-ACT-R14-24 | P1 | Rollback-Validator | fixed during P1 rollback | Die Baseline-Restoreoperation war korrekt, aber PowerShell `String.Split(string)` zählte den exakten SW-Token nicht zuverlässig und stoppte vor der v15-Patchung. Exakte `Regex.Matches(Regex.Escape(...))`-Zählung eingesetzt; Toolausgabe, Parser, Materialisierungscontract und v15-Postimage PASS. |
| F-ACT-R14-25 | P1 | Produktiver V2-Commit / Semantikbindung | fixed locally / productive reproof pending | `createSessionGraph` bindet `dataAccess.commitSession` minimal an `selectedSemantics` und reicht exakt Request-ID, Payload und Semantik weiter. Neue Drafts verwenden v2, Recovery-v1 bleibt v1; Semantik gelangt nicht in den RPC-Body, Request-ID/Payload und Retry bleiben identisch. Echte Controller→Data-Access-Regression, vollständige relevante Matrix und Fullreviews PASS. Produktiver Reproof benötigt neues P1/P2. |
| F-ACT-R14-26 | P1 | Produktiver Sessionabschluss / reale UI-Composition | fixed locally / productive reproof pending | Reproduziert: redundantes `setAuthenticated(true)` setzte eine offene Session durch erzwungenes Entry-Reconcile von `editing/session` auf `recoverable/entry`. Minimalfix erhält beim redundanten Auth-Lifecycle die aktive Fläche. Vollständiger realer lokaler DOM→Listener→Shell→finish→Recovery/Intent→Data-Access→Transportpfad ist für Erfolg, Unknown/Retry, Reload-Recovery, Misdirect und Reauth PASS. Der historische Produktionsfehler wird nicht monokausal überbeansprucht; Abschluss verlangt realen produktiven Reproof. |
| F-ACT-R14-27 | P2 | lokaler Recovery-Harness / Lease-Token | fixed in test harness | Die Test-UUID-Sequenz startete nach simuliertem Reload erneut bei 1 und kollidierte nur im Harness mit dem gespeicherten Lease-Token. Resume verwendet eine getrennte deterministische Sequenz; Recovery-Browserfall und vollständige Matrix PASS. Kein Produktcode- oder Datenvertrag betroffen. |
| F-ACT-R14-28 | P1 | Recovery-Draftalter / produktiver Commit-Preflight | fixed locally | Exakte Ursache ist die bestehende 1440-Minuten-Grenze: der gealterte Draft scheitert mit INVALID_TIME/duration_min vor Persistenz und Transport. Ein write-freier Preflight nutzt denselben Validatorpfad und lässt Draft, Request-ID und Eingaben unverändert. |
| F-ACT-R14-29 | P1 | Viewport/Scroll und rascher SW-Rollback | fixed locally / final review PASS | Overlayhosts und vier Viewports grün. Direkte und transitive Cacheidentitäten, v20/v21-Materialisierer sowie reale schnelle Releasewechsel und Fresh-Offline sind grün. |
| F-ACT-R14-30 | P1 | Privacy / produktive Browserdiagnostik | fixed locally | Die calcMAP-Callsites protokollieren nur abstrakte Fehlercodes. Ein Negativvertrag verbietet Messwerte, Tages-/Kontextwerte, rohe Fehler und Gesundheitsdetails. |
| F-ACT-R14-31 | P1 | Release-/Rollbackmaterialisierung | fixed locally / final review PASS | v20/v21 ergänzen den in den eingefrorenen Workerquellen fehlenden Chartasset am eindeutigen Main-Anker; bekannte EOF-Leerzeilen in index beziehungsweise V1-main werden deterministisch normalisiert. Direkte Contracts, isolierter Roundtrip und nativer Rollbackreview PASS. |
| F-ACT-R14-32 | P1 | Transitive ESM-/Offline-Cachekohärenz | fixed locally / productive reproof pending | Vollständiger 18-Dateien-Supabase-/Boot-Graph trägt je Release genau eine Queryidentität und wird vollständig installiert. Reale v19→v20- und v20→v21-stale-client-Wechsel sowie Fresh-v20→Offline bleiben kohärent; 306 Node, drei Cachebrowserorakel, 44 Syntax- und zwei Parserchecks sowie Fullreviews PASS. |
| F-ACT-R14-33 | P1 | Usage Reserve / Closure-Zuordnung | fixed in process contract | Zuerst wurden die statischen 25/10-Safe-Closure-Schwellen fälschlich als Kosten addiert. Danach wurde 71/11 + 9/2 + 1/1 = 81/14 erneut als einzige nicht überstimmbare Grenze behandelt und U11R13 bei 80/66 um einen Sensorpunkt abgelehnt. D-ACT-R14-25 trennt nun Operational Safety Floor 72/12 (effektiv 72/21) und Autonomous Full-Closure Floor 81/14 (effektiv 81/21). Zwischen beiden darf der Owner nur das administrative Closure-Risiko akzeptieren; die sichere operative Postcondition bleibt zwingend. Preferred 107/17 bleibt advisory und `PREFERRED_UNATTAINABLE`. |
| F-ACT-R14-34 | P2 | Privacy / produktive Browserdiagnostik | API fixed locally / shared privacy remains open | `app/supabase/api/intake.js` verwendet lokal nur noch abstrakte Start-, Ergebnis- und Fehlercodes; Rückgabe, Transport, Persistenz und Fehlerobjekte bleiben unverändert. Statischer Intake-/Vitals-Privacyvertrag 4/4 PASS. F35 bleibt als separater gemeinsamer MIDAS-Backlog offen; kein allgemeiner Privacy-PASS. |
| F-ACT-R14-35 | P2 | Privacy / gemeinsamer Intake-Stack | open / shared repair backlog | Der F34-Browserzähler meldet ohne Inhaltsausgabe 36 Treffer; fokussierter frischer Boot klassifiziert 24 day-Label-Treffer als 16 Capture-Refresh- und 8 Medication-Diagnosen. Statische inhaltsfreie Analyse findet 42 Prüfkandidaten, nicht 42 bewiesene Fehler. Der Fund ist vorbestehend und kein bewiesener V2-Funktionsfehler; gemäß D-ACT-R14-27 separat dokumentiert. Kein allgemeiner MIDAS-Privacy-PASS bis zur Reparatur. |
| F-ACT-R14-36 | P1 | Recovery-Draft / produktiver V2-Smoke | owner-resolved / productive execution pending | Der erhaltene Recovery-Draft überschreitet nach F28 die unveränderte 1440-Minuten-Grenze und wird korrekt vor Transport abgewiesen. D-ACT-R14-28 erlaubt im nächsten separat freigegebenen v22/v23-Fenster den sichtbaren, bestätigten normalen UI-Discard und danach einen frischen Katalog-v2-Smoke-Draft mit neuer Request-ID. Kein V2-Codefix, keine stille Mutation und keine Datenbanklöschung. |

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
frisches Usage-Gate `CONTINUE` und entweder `PRIMARY_ALLOWED` mit mindestens
81 % 5h / 21 % Woche oder `PRIMARY_OWNER_BOUNDARY_ALLOWED` mit mindestens
72 % / 21 % und unverändertem Postimage ergibt. Bei der Boundary nennt der
Agent einmal raw Preferred, Operational Safety Floor, Autonomous Full-Closure
Floor, aktuelle Messung und das reine administrative Closure-Risiko; nach der
unmittelbaren ausdrücklichen Owner-Annahme wird weder erneut diskutiert noch
identisch gemessen. Das erste Gate nach dem Wiedereinstieg ist eine
`POST_REHYDRATION_BASELINE`; bereits verbrauchte Rehydration wird gemäß
D-ACT-R14-21 nicht erneut reserviert.
Android ist gemäß D-ACT-R14-17 deferred:

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

#### S5.4/S5.5 Gate Record - 2026-08-30

- P1-Deploy: Commit `1edbe38d01708e9543c435522d47c0d387ad789e`,
  Push und Pages-Run `33296179701` PASS. Live enthielt den exakten V2-
  Productload und Root-SW v14, ohne V1-Writerload.
- Web/PWA: Fresh, Upgrade und kontrollierter stale-client-Wechsel PASS. Hub,
  V2-Training und ein realistischer Tabwechsel mit Reload stellten den
  unveränderten Recovery-Draft wieder her; kein Storage-Clear.
- P2-Write: Der kontrollierte Save und genau ein identischer Retry wurden
  beide nicht bestätigt. Die UI blieb fail-closed, Eingaben und Recovery-Draft
  blieben erhalten. Read-only Postcheck nach beiden Versuchen: V2
  Sessions/Items/Sets `0/0/0`. Es entstand kein Datensatz; der genehmigte
  normale R9-Delete war deshalb weder nötig noch zulässig.
- Pflichtfehlerfolge: Der bedingte P1-Rollback wurde ohne Usage-Poll begonnen.
  Ein falscher Negativbefund des Rollback-Skriptvalidators wurde minimal in
  F-ACT-R14-24 korrigiert; die sechs Produktpfade selbst waren bereits exakt
  auf 4be058b1 restauriert. Gezielter Rollbackvertrag PASS.
- Rollbackpostimage: Commit `ce2e18dab3704a419b6f07fab116d14132e6ffbb`,
  Pages-Run `33296959317` PASS. Live: V1-Form 1, V1-Script 1,
  V2-Productcontroller 0, R13-Readerloads 2, Root-SW v15. Nach kontrolliertem
  Schließen der alten v14-Clients bootete ein frischer Client ohne Fehler und
  zeigte die V1-Trainingsmaske. Keine Daten wurden gelöscht.
- Ergebnis: `S5.4 WEB/PWA PASS; S5.5 WRITE FAIL; V15 ROLLBACK PASS`. R14 bleibt
  offen. Android bleibt gemäß D-ACT-R14-17 deferred und nicht PASS.
- U11: `2026-08-30T08:31:43+02:00; 34 % 5h / 90 % Woche;
  CONTINUE_WITH_CAUTION`. S5.6 ist kein kurzer rein lokaler Caution-Block und
  wurde nicht begonnen.

#### F-ACT-R14-25 Korrektur-Gate Record - 2026-08-30

- U11R2: `98 % 5h / 84 % Woche; CONTINUE` nach überschrittenem 5h-Reset.
- Minimalfix: Der pro Draft bereits ausgewählte Semantikvertrag wird im
  Productcontroller an den Data-Access-Commit gebunden. Der Adapter reicht
  ausschließlich `requestId`, `payload` und `semantics` weiter; der reale RPC-
  Body enthält weiterhin ausschließlich `p_request_id` und `p_payload`.
- Regressionsnachweis: neuer v2-Draft erreicht über echten Data Access einen
  gültigen `created`-Response; der identische Replay liefert `replayed` bei
  bytegleicher Request-ID und Body. Ein gespeicherter v1-Draft erreicht einen
  gültigen v1-Response; weder Request-ID noch der sensible Testmarker erscheinen
  in Diagnostik. Das bestehende v1-Default-Negativorakel bleibt grün.
- Zusätzlicher lokaler Hardening-Nachweis an U10R3: die verstärkte reale
  Composition-Regression bleibt mit den gezielt invalidierten
  Productcontroller-/Data-Access-/Session-Commit-Verträgen `61/61` grün.
  Der abgegrenzte Release-Scope enthält exakt 16 Code-/Testdateien plus die
  beiden aktiven R14-Dokumente, null V1-Writercallsite und genau einen
  V2-Productmount; `git diff --check` bleibt PASS. Ein frischer lokaler
  Edge-Boot lädt genau ein Productcontroller-Script, keine V1-Form und meldet
  null Console-Errors; die gesperrte App exponiert erwartungsgemäß noch keinen
  V2-Host und wurde nicht umgangen.
- Cachemonotonie: lokaler nächster Cutover Root-SW v16; explizite V1-Inverse
  Root-SW v17. v14/v15 werden nicht wiederverwendet.
- Abschlussmatrix: `299/299` gebündelte Node-Verträge und `84/84` Deno-Verträge,
  55 Syntaxchecks, `git diff --check`, C3/R13/R14/R8 sowie PowerShell-Parser und
  Rollbackmaterialisierung PASS. Isolierter Browser-Harness meldet
  `all: committed · PASS`; bestehende responsive CSS-/Touchorakel bleiben grün.
- Nativer Full Code-/Contract-/Security-/Privacy-/Scope-/Cache-/Rollback- und
  Consumerreview PASS. Backend-Runtime-Diff 0, Secretmuster 0, keine SQL-, RPC-,
  RLS-, ACL-, Auth-, Secret-, Scheduler- oder medizinische Änderung. Kein
  weiterer CodeRabbit-Lauf gemäß ausgeschöpftem Reviewbudget.
- Produktwirkung: keine. HEAD/origin/main und Produktion bleiben ce2e18d mit V1
  als einzigem Writer und Root-SW v15. Das frühere P1/P2 ist verbraucht; ein
  erneutes v16/v17-Fenster benötigt neuen Preflight, neues Usage-Gate und eine
  ausdrückliche gemeinsame P1/P2-Freigabe.
- Erneuerter Preflight ist PASS. U10R3 liefert 52 % 5h / 77 % Woche und
  `CONTINUE`, deckt aber die empirische 1,5-Reserve 96/15 für das vollständige
  atomare Fenster nicht. P1/P2 kann gebrieft und erteilt, aber erst nach einem
  späteren frischen ausreichenden Usage-Gate ausgeübt werden.

#### Vorbereitetes v16/v17-Operatorpaket - ausgeführt am 2026-08-31

Dieses Paket reduziert das spätere atomare Fenster auf die bereits bewiesene
Ausführungsreihenfolge. Es enthält keine Secrets, Payloads, Request-IDs oder
Gesundheitsdetails:

1. Vor P1 den 16-Dateien-Code-/Test-Manifesthash `2b329d5a...4926b`, die zwei
   aktiven R14-Dokumente, `git diff --check`, HEAD/origin/main/Pages `ce2e18d`
   und das produktive V1/SW-v15-Preimage erneut bestätigen.
2. Ausschließlich diese 18 R14-Dateien stagen; danach staged name-only,
   staged diff-check und Secret-/Scopeprüfung wiederholen. Commitnachricht:
   `fix(activity): bind R14 capture semantics`. Keine fremde Dirty-Datei und
   keine R15-Datei aufnehmen.
3. Den Commit einmal nach `origin/main` pushen und ausschließlich den dadurch
   ausgelösten bestehenden Pages-Weg abwarten. Es gibt keinen Supabase-, SQL-,
   Edge-, Auth-, Secret- oder Schedulerdeploy.
4. Das Live-Postimage muss exakt einen V2-Productcontroller, null V1-Form-/
   Script-/Main-Writercallsite, unveränderte R13-Readerloads und Root-SW v16
   zeigen. Danach Fresh-, Upgrade- und kontrollierten stale-client-Web/PWA-
   Smoke sowie Recovery über realistischen Tab-/Appwechsel durchführen.
5. Den vorhandenen Recovery-Draft und dieselbe gespeicherte Request-ID nur
   verwenden, wenn beide weiterhin vertragsgültig vorhanden sind. Genau einen
   bestätigten V2-Write beweisen; bei unbekannter Antwort höchstens den
   identischen Retry. V1-Zähler/-ID-Hash dürfen sich nicht ändern.
6. V2-History, Detail, Coaching-Export und den unveränderten R13-Snapshot
   prüfen. Danach ausschließlich den erzeugten Smoke-Datensatz über den
   normalen bestätigten R9-UI-Delete entfernen und V2-Zähler/-Hashes erneut
   erfassen. Keine andere produktive Korrektur oder Löschung.
7. Bei irgendeinem Pflichtfehler das bereits geprüfte Tool ausschließlich mit
   `tools/activity-v2-r14-v1-productload-rollback.ps1 -ConfirmRollback`
   ausführen, dessen sechs Produktpfade/Root-SW v17 prüfen, den Rollback
   committen/pushen und Pages plus frischen V1-Client vollständig verifizieren.
8. Erst nach erfolgreichem Write-/Reader-/Delete-Smoke oder abgeschlossenem
   v17-Rollback U11 ausführen. Zwischen Deploy und diesem Endzustand kein
   Usage-Poll, kein freiwilliger Stopp und keine neue Freigaberunde.

#### S5.4/S5.5 v16/v17 Gate Record - 2026-08-31

- U10R11 war mit 94/99 `CONTINUE / PRIMARY_OWNER_BOUNDARY_ALLOWED`; die
  konditionale Freigabe D-ACT-R14-19/-20 wurde ohne erneute P1/P2-Rückfrage
  ausgeübt.
- Cutover: Commit `1b6e7164a26709246439e7609ddb3aa1a31aaf1f`, Push nach
  `origin/main`, Pages-Run `33357905534` completed/success. Live-Index
  `340d37e7...ea0a`, Live-SW `504ce2e5...f85c`; V1-Script 0,
  V2-Productcontroller 1, R13-Readerloads 2 und Root-SW v16.
- Web/PWA: Fresh-, Upgrade- und kontrollierter stale-client-Pfad sowie
  Recovery nach realistischem 30-Sekunden-Tabwechsel und Reload PASS. Der
  vorhandene Draft blieb samt Eingaben und identischem Auftrag erhalten.
- Write: Nach expliziter Aktionsbestätigung wurden Original und genau ein
  identischer Retry ausgeführt. Beide blieben fail-closed; die Session-
  Oberfläche blieb im Editing-/Readyzustand, V1 blieb 67 und V2 blieb
  Sessions/Items/Sets 0/0/0. Kein Datensatz, daher kein History-/Detail-/
  Export- oder R9-Delete-Smoke.
- Pflichtfehlerfolge: Das vorbereitete Tool wurde mit explizitem
  `-ConfirmRollback` unter der kanonischen PowerShell-ExecutionPolicy-Bypass-
  Hülle ausgeführt und meldete `R14_V1_PRODUCTLOAD_ROLLBACK_V17_READY`.
  Die fünf Baselinepfade sind exakt ce2e18d, der Worker unterscheidet sich
  ausschließlich monoton v15→v17.
- Rollback: Commit `4e87729e94131d75d870f9cfb99e8141ecd09f21`, Push nach
  `origin/main`, Pages-Run `33358569779` completed/success. Live-Index
  `552f3474...437d`, Live-SW `1b500681...4038`; V1-Script 1,
  V2-Productcontroller 0, R13-Readerloads 2 und Root-SW v17. Nach vollständigem
  Schließen alter kontrollierter Clients bootete ein frischer V1-Client ohne
  Fehler direkt in die V1-Trainingsmaske.
- Datenpostimage: V1 67; V2 0/0/0; alle leeren V2-ID-/Request-ID-Hashes
  `4f53cda1...b945`. Der read-only R13-Service-Snapshot liefert weiterhin
  Schema `midas.activity-consumer.v1`, 67 Units und 0 Mixed-Source-Days.
  Keine Gesundheitsdaten wurden gelöscht oder korrigiert.
- U11R3 danach: 52 % 5h / 93 % Woche, `CONTINUE`. F-ACT-R14-26 bleibt offen;
  die fail-closed Wirkung ist bewiesen, die genaue Ursache nicht.

#### F-ACT-R14-26 lokaler Diagnose-/Fix-/Validierungsrecord - 2026-09-06

- U12R4 war mit 86 % 5h / 68 % Woche `CONTINUE / PRIMARY_ALLOWED` und
  `POST_REHYDRATION_BASELINE`; Rehydration wurde als SUNK_USAGE behandelt.
- Der neue negative Productcontroller-Vertrag reproduzierte exakt, dass ein
  redundantes authentifiziertes Lifecycle-Event eine offene Session von
  `editing/session` auf `recoverable/entry` zurücksetzte. `setAuthenticated`
  reconciliert nach Recovery nun ohne erzwungene Entry-Fläche. Initialer Auth,
  Logout, Relogin, Destroy und Recovery behalten ihre bestehenden Verträge.
- Ein vollständiger Last-Mile-Harness verwendet die reale Productcontroller-,
  Shell-, Commit-, Recovery-, Semantik- und Data-Access-Komposition und einen
  kontrollierten Transportstub. Die Browserfälle Erfolg, Unknown plus
  identischer Retry, Reload-Recovery, Misdirect und redundanter Reauth sind
  `5/5 PASS`; keine Console-Warnung, kein Console-Error und kein Page-Error.
  Das Browser-Plugin war nicht verfügbar; der kanonische Playwright-Fallback
  lief headless in installiertem Edge. Kein produktiver Write.
- F-ACT-R14-27 war ein reines Harnessorakel: Die deterministische UUID-Sequenz
  kollidierte nach dem simulierten Reload mit dem gespeicherten Lease-Token.
  Eine getrennte Resume-Sequenz korrigiert das Orakel; kein Produktfix nötig.
- Abschlussmatrix: Node `303/303`, Deno `84/84`, Syntax `57/57`,
  `git diff --check`, C3/R13/R14/R8-R10-, Cache-, Cutover- und
  Rollbackcontracts PASS. Native Code-/Contract-/Security-/Privacy-/Cache-/
  Lifecycle-/Rollback-/Consumerreviews PASS; Backend-/Supabase-Diff 0,
  Secretkandidaten 0, neue Produktlogs 0, kein Harness im Productload.
- Die fünf v16-Produktquellen bleiben semantisch unverändert; lediglich
  bestehende EOF-Leerzeilen in index/main weichen byteweise ab. Chart und
  medizinische Readersemantik sind unverändert. Productload enthält null V1-
  Writercallsite, genau einen V2-Controller und zwei R13-Readerloads.
- Releasepostimage lokal: Root-SW v18, explizite V1-Productloadinverse v19,
  19 Code-/Testdateien, Manifest `75daad72...d3169`; mit Roadmap/Evidence
  konditionaler P1-Scope 21 Dateien. Produktion bleibt 4e87729/v17 und V1.
- F-ACT-R14-26 ist lokal korrigiert und vollständig validiert, aber erst ein
  erfolgreicher produktiver Write-/Reader-/Delete-Reproof darf es für R14
  endgültig schließen. Der historische Nicht-Dispatch wird nicht unbewiesen
  monokausal dem Lifecycle-Reset zugeschrieben.

#### Vorbereitetes v18/v19-Operatorpaket

1. Nach dem verpflichtenden Postblock-Usage-Gate nur bei `CONTINUE` und
   vollständiger Reserve D-ACT-R14-22 ausüben; andernfalls vor S5.4 stoppen.
2. Ausschließlich die 19 manifestierten Code-/Testdateien und die beiden
   aktiven R14-Dokumente stagen; staged name-only, Diff, Secrets und Scope
   prüfen. Commitnachricht: `fix(activity): preserve R14 capture lifecycle`.
3. Einmal nach origin/main pushen und nur den bestehenden Pages-Weg abwarten.
   Kein Supabase-, SQL-, Edge-, Auth-, Secret- oder Schedulerdeploy.
4. Live v18, genau einen V2-Controller, null V1-Writerload und zwei unveränderte
   R13-Reader beweisen; dann Fresh/Upgrade/stale-client und Recovery smoken.
5. Genau einen V2-Write, bei unbekannter Antwort höchstens den identischen
   Retry, danach History/Detail/Export/R13 und normalen R9-Delete beweisen.
6. Bei jedem Pflichtfehler die geprüfte V1-Inverse ausschließlich über
   `tools/activity-v2-r14-v1-productload-rollback.ps1 -ConfirmRollback`
   ausführen, als v19 committen/pushen und Pages/frischen V1-Client prüfen.
7. Zwischen Deploy und vollständigem Erfolg oder Rollback kein Usage-Poll,
   keine weitere Freigabe und kein freiwilliger Stopp; danach U11.

#### S5.4/S5.5 v18/v19 Gate Record - 2026-09-06

Urteil: `V18 WEB/PWA PASS; WRITE FAIL-CLOSED BEFORE TRANSPORT; V19 ROLLBACK PASS`.

- Cutovercommit `0fa44e29536a604256638057d4e54a9e593b8bab`, Push nach
  `origin/main`, Pages-Run `34022878621` erfolgreich. Live-Index
  `233d4429...cd1`, Live-SW `102c1fe7...8dd7`, Root-SW v18; genau ein
  V2-Productcontroller, null V1-Writerload und zwei R13-Readerloads.
- Fresh-/Upgrade-/stale-client- und Recovery-Nachweise PASS. Der vorhandene
  Recovery-Draft blieb mit gespeicherter Identität erhalten.
- Der Abschlussbereich war im realen Desktop-Viewport visuell nicht
  erreichbar; Owner führte nach sicherer Tastaturfokussierung genau einmal
  Enter aus. Ergebnis: bekannte Eingabevalidierung, kein Transportstart und
  kein Retry. F-ACT-R14-28/-29 sind offen.
- Vorher/Nachher: R13-Snapshot `midas.activity-consumer.v1` mit 69 reinen
  V1-Units, 0 Mixed-Source-Tagen und ID-Hash `459f2056...007d`. V2 blieb
  Sessions/Items/Sets `0/0/0`; alle ID- und Request-ID-Hashes bleiben
  `4f53cda1...b945`. Kein Write, Dual Write oder Delete.
- V19-Inverse wurde über das bestätigte Rollbacktool materialisiert. Direkter
  PowerShell-Start war lokal durch ExecutionPolicy blockiert und hatte keine
  Wirkung; der kanonische Bypass-Aufruf lieferte
  `R14_V1_PRODUCTLOAD_ROLLBACK_V19_READY`. Rollbackcontract und Syntax PASS.
- Rollbackcommit `3857bf4e03d2ad6e0af7c2c3c3ec6ce3d29aab58`, Push und Pages-Run
  `34023954044` erfolgreich. Live-Index `48cd9e0a...c6c`, Live-SW
  `0e35a08b...a6de`, V1-Form/Script/Mainwriter vorhanden,
  V2-Productcontroller 0, zwei R13-Readerloads und Root-SW v19.
- Ein alter v18-Client bootete nach schnellem Rollback im gemischten Cache
  fail-closed. Alle 37 v19-Coreassets lieferten 2xx; ein isolierter vollständig
  frischer Edge-Client bootete ohne Bootfehler mit genau einer V1-Form und
  ohne V2-Host/-Controller. Der rasche Upgradepfad bleibt F-ACT-R14-29.
- U11R4 danach: 23 % 5h / 44 % Woche, gültig und `SAFE_CLOSURE`. Kein neuer
  Diagnose-, Fix-, Test- oder Produktivblock; nur sichere Synchronisierung.

Für S5.6 sind bereits nur diese einzusetzenden Postimagefelder offen: exakter
Cutover-Commit und Pages-Run, Live-index-/SW-Fingerprint, V1-Zähler und ID-Hash,
V2 Session/Item/Set-Zähler und geschützte Hashes vor/nach R9-Delete,
gehashte Request-ID-Kontinuität, History-/Detail-/Exportstatus,
R13-Snapshot/Readerstatus sowie die transparente Android-Einstufung
`DEFERRED BY OWNER / NOT PASS`.

#### Dirty-Stop-Closure F-ACT-R14-28..31 - 2026-09-06

- Recovery eindeutig: HEAD/origin `3857bf4e...ab58`, live V1/v19; kein
  laufender R14-Test- oder Serverprozess und keine externe Wirkung.
- F28: bestehende 1440-Minuten-Regel als exakte INVALID_TIME-/duration_min-
  Ursache vor Persistenz/Transport bewiesen; write-freier Realpfad-Preflight.
- F29 Viewport: transformierter Hubpanel-Containing-Block als Ursache bewiesen;
  Overlayhosts liegen direkt unter BODY. Browsernachweis 1280x720 Maus,
  960x640 Tastatur, 390x844 Touch und 320x800 Touch `4/4 PASS`.
- F30: zwei calcMAP-Logcallsiteklassen auf abstrakte Codes reduziert;
  Negativvertrag `2/2 PASS`.
- Vor den letzten Cache-Nachschärfungen: Node `303/303`, Deno `84/84`,
  relevante Syntax `66/66`, Last-Mile-/Release-/lokaler Productbrowser PASS,
  R8/R13 PASS. Danach `21/21` gezielt invalidierte Node-Contracts PASS.
- Der Closure-Roundtrip fand F31: Das Cutovertool erwartet im eingefrorenen
  v18-Worker einen noch nicht vorhandenen Doctor-Chart-Token und stoppt im
  kontrollierten Temp-Worktree vor der Materialisierung. Temp-Worktrees wurden
  vollständig entfernt. Kein Fix in derselben Closure-Welle.
- Aktueller lokaler Code-/Testscope: 35 Dateien, Manifest
  `2a9bb7f9e1a3a5aa7356a8904789d9d839273facbf6278898449f81662b0812c`.
- Nach getrenntem Ownerauftrag wurde F31 minimal korrigiert. v20 und v21
  materialisieren jeweils genau einen versionsgebundenen Chartasset;
  `R14_F31_V20_V21_ROUNDTRIP_PASS` und 8/8 direkte Contracts. Nativer
  Abschlussreview und verbleibende lokale Closure-Smokes stehen noch aus.
- Roadmap/Evidence/Resume werden auf diesen Blocker synchronisiert. S5.6,
  produktiver Cutover, S6 und DONE bleiben gesperrt.

#### Bounded Red Team F-ACT-R14-32 - 2026-09-06

- Unter U11R8 wurde auf ausdrücklichen Ownerauftrag genau ein statischer,
  finding-only Delta-/Consumer-/Cache-Review ausgeführt. Kein Fix, Browserlauf,
  Test, Commit, Push, Deploy oder produktiver Zugriff war Teil des Blocks.
- Der aktive Worker behandelt Navigation network-first. Ein noch steuernder
  v19-Worker kann daher bereits v20-HTML liefern, bevor v20 die Kontrolle
  übernommen hat.
- Der v20-Einstieg versioniert `app/supabase/index.js`, `auth/index.js`,
  `auth/core.js` und `api/vitals.js` nur teilweise. Neun reale Supabase-
  Importer referenzieren `auth/core.js` weiterhin unversioniert. Damit können
  ein alter unversionierter Core und `core.js?v=20` gleichzeitig als getrennte
  ESM-Identitäten mit unterschiedlichem Lifecyclecode laufen.
- Die v19-/lokalen v20-Blobvergleiche bestätigen tatsächliche Änderungen an
  Auth-Core und Vitals; es handelt sich nicht nur um theoretisch identische
  Doppelimporte.
- `CORE_ASSETS` enthält den versionierten Einstieg, aber nicht den vollständigen
  transitiven ESM-Graph. Da `cache.addAll` Imports nicht rekursiv installiert
  und die erste Seite vor Worker-Kontrolle lädt, ist Fresh-Install mit sofortigem
  Offline-Reload nicht bewiesen.
- Bestehende Release-Smokes verwenden ein einzelnes Runtimeasset; der lokale
  Productbrowser ist fresh/online. Beide Orakel verfehlen diese Failure Class.
- Ergebnis: `F-ACT-R14-32 P1 OPEN`. F29-Cache ist wieder geöffnet. Der nächste
  getrennte Block muss zunächst den v19→v20- und v20→v21-Mischzustand sowie den
  ersten Offline-Reload reproduzieren, dann den kleinsten kohärenten Release-/
  Cachefix setzen und ausschließlich invalidierte plus gemeinsam betroffene
  S5-Verträge revalidieren.

#### F-ACT-R14-32 Repair und lokale Closure - 2026-09-07

- U11R10 war als POST_REHYDRATION_BASELINE mit 98 % 5h / 100 % Woche gültig
  und erlaubte den vollständigen lokalen Block. Keine externe oder produktive
  Aktion wurde ausgeführt.
- Reproduktion: Der bisherige Teilgraph erzeugte unter einem alten Worker
  gleichzeitig unversionierte und v20-versionierte Supabase-Root-/Auth-Core-
  Instanzen. Das Browserorakel meldete den erwarteten Mischzustand, bevor der
  Fix gesetzt wurde.
- Ursache: `boot-auth.js` importierte den Supabase-Root zusätzlich
  unversioniert; weitere transitive Importer teilten dieselben Module ebenfalls
  in mehrere URL-Identitäten. Der Worker installierte nur den Root statt des
  vollständigen 18-Dateien-ESM-Graphs. Network-first-Navigation ist nur dann
  sicher, wenn jede neue HTML-Version ausschließlich neue, vollständige und
  cacheinstallierbare Modulidentitäten referenziert.
- Minimalfix: Alle relativen Imports des Supabase-/Boot-Graphs tragen v20; der
  Root-Worker installiert jede dieser 18 URLs. Cutover- und Rollbackmaterializer
  normalisieren denselben Graph deterministisch auf v20 beziehungsweise v21,
  ohne Semantik in Requests, RPC-Bodys oder Authverträge einzuführen.
- Reale Browsernachweise: lokaler v20-Productboot und unmittelbarer Offline-
  Reload PASS; alter echter v19-Worker mit v20-HTML PASS; echter schneller
  v20→v21-Rollback PASS. Je Postimage genau eine Root-/Core-Identität, 15 V2-
  Captureloads im v20-Produkt und null V2-Captureload in v21.
- Regressionen: 306/306 relevante Node-Verträge, 44/44 geänderte JS-/MJS-
  Syntaxchecks, 2/2 PowerShell-Parser, isolierte v20- und v21-Materialisierung,
  `git diff --check`, C3/R8/R13, Last-Mile 4/4 und drei Cachebrowserorakel PASS.
  Die weiterhin gültigen 84/84 Deno-Verträge wurden nicht wiederholt, weil
  Backend, SQL und deren Orakel unverändert blieben.
- Native Delta-, Contract-, Security-, Privacy-, Cache-, Lifecycle-, Rollback-
  und Consumerreviews PASS. Backend-/SQL-/Android-Diff 0, neue Secrets 0,
  keine neue produktive Diagnose und kein offenes lokales P0/P1-Finding.
- Release-Scope: 49 Code-/Testdateien. Manifest SHA-256 über die ordinal
  sortierten Zeilen `Pfad=Datei-SHA256` ohne Schlusszeile:
  `333a34691d5082f3a69a9de1c162dacb2530362bd9bba99372332eebbfd0db95`.
  Mit Roadmap und Evidence umfasst ein künftiger P1-Scope 51 Dateien.
- F29-Cache, F31 und F32 sind lokal geschlossen. Der produktive V2-Write-,
  Reader- und Delete-Reproof bleibt offen; R14 bleibt deshalb OPEN.
- U11R11 nach vollständigen Postconditions: 29 % 5h / 89 % Woche, gültig,
  `CONTINUE_WITH_CAUTION`; 69/11 Punkte seit U11R10. Kein neuer Block in dieser
  Restricted-Work-Episode.

#### v20/v21-P1/P2-Briefing - D-ACT-R14-23 ausgeübt und verbraucht

1. Vor dem Fenster das reale V19-Produktpostimage, HEAD/origin/Pages, die
   geschützten V1-/V2-Zähler, R13, Auth und den 49-Dateien-Manifesthash erneut
   read-only bestätigen.
2. D-ACT-R14-23 erteilt das neue gemeinsame P1/P2 für genau dieses
   v20/v21-Fenster konditional. Frühere Freigaben bleiben verbraucht; keine
   erneute Rückfrage ist nötig, sobald Preflight und Usage-Reserve erfüllt sind.
3. Bei anschließendem frischem `CONTINUE` mit vollständiger atomarer Reserve
   ausschließlich die 49 manifestierten Code-/Testdateien sowie Roadmap und
   Evidence stagen. Staged name-only, Diff, Secrets und Scope prüfen.
4. Vorgesehene Commitnachricht: `fix(activity): harden R14 release coherence`.
   Genau einmal nach `origin/main` pushen und nur den bestehenden GitHub-Pages-
   Weg abwarten; kein Supabase-/SQL-/Auth-/Secret-/Schedulerdeploy.
5. Live v20, genau einen V2-Productcontroller, null V1-Writercallsite, zwei
   unveränderte R13-Readerloads, Fresh, Upgrade, stale-client und Recovery
   beweisen.
6. Genau einen V2-Smoke-Write ausführen; nur bei unbekannter Antwort denselben
   identischen Retry. Danach History, Detail, Coaching-Export, R13 und fehlenden
   Dual Write prüfen. Ausschließlich den Smoke-Datensatz über den normalen
   R9-UI-Delete entfernen.
7. Bei einem Pflichtfehler die geprüfte V1-Productloadinverse mit Root-SW v21
   ausführen, committen/pushen und Pages, V1-only, R13, Fresh-Client und
   Datenintegrität vollständig beweisen.
8. Zwischen Deploy und Erfolg oder abgeschlossenem Rollback kein Usage-Poll
   und kein freiwilliger Stopp. Android bleibt `DEFERRED / NOT PASS`.

#### S5.4/S5.5 v20/v21 Gate Record - 2026-09-07

Urteil: `V20 WEB/PWA PARTIAL PASS; PRIVACY FAIL BEFORE WRITE; V21 ROLLBACK PASS`.

- Cutovercommit `2dbfa3c809c4417e5108af335be79b60d001fdfb`, Push und
  Pages-Run `34160428748` PASS. Live: V1/V2/R13 `0/1/2`, Root-SW v20;
  bestehender Client erkannte und übernahm das Update.
- Der reale Live-Logcheck fand vor jedem V2-Write eine konkrete Datensatz-ID
  und konkrete Gesundheitswerte eines bestehenden Capturepfads. Kein
  V2-Write, Retry oder Delete; V2 blieb `0/0/0`.
- Pflichtrollback über das bestätigte Tool meldete
  `R14_V1_PRODUCTLOAD_ROLLBACK_V21_READY`. 22 tatsächlich geänderte
  Produkt-/ESM-Pfade lagen vollständig innerhalb des vorbereiteten
  Rollbackscopes; Syntax, Parser, Diff- und Secretgrenze PASS.
- Rollbackcommit `40c4b93d590806e48950a0d01b9ccea2a861dbde`, Push und
  Pages-Run `34160860095` PASS. Live-Index/SW entsprechen dem Commit;
  V1/V2/R13 `1/0/2`, Root-SW v21. Aktualisierter frischer V1-Client bootet
  ohne Fehler.
- Datenpostimage: V1 69 mit unverändertem geschütztem Hash
  `459f2056...007d`; V2 Sessions/Items/Sets `0/0/0`, Leerhash
  `4f53cda1...b945`. Keine Datenmutation oder Löschung.
- F-ACT-R14-34 ist P1 offen. S5.6, S6, DONE und Archivierung bleiben gesperrt.
  Android bleibt `DEFERRED BY OWNER / NOT PASS`.

#### F-ACT-R14-34 Diagnose- und Repair-Receipt - 2026-09-07

- Reproduktion/Quelle: Der Livemarker stammt exakt aus
  `app/supabase/api/intake.js`. `loadIntakeToday` schreibt im Startpfad
  Benutzer-/Tageskontext und im Erfolgspfad Datensatz-ID sowie den gesamten
  Intake-Payload in `diag.add`.
- Historie: Die unsichere Abschlusszeile ist in 4be058b1, 0fa44e2, 2dbfa3c
  und 40c4b93 identisch vorhanden. Der v20-Cutover hat sie sichtbar gemacht,
  aber nicht eingeführt. Der aktuelle v21-V1-Productload lädt dasselbe Modul.
- Testlücke: `app/supabase/api/vitals-privacy.contract.test.js` liest nur
  `vitals.js` und schützt ausschließlich calcMAP-Diagnostik. Kein bisheriges
  Browserorakel verwirft sensitive Capture-Konsolenmeldungen ohne deren Inhalt
  selbst auszugeben.
- Minimaler Produktscope: Intake-Start/Erfolg auf feste Ereignismarker und
  höchstens `result=found|empty` reduzieren; rohe POST-/Cleanup-Fehlerdetails
  desselben Moduls ebenfalls durch abstrakte Status-/Fehlercodes ersetzen.
  Rückgabewerte, REST-/RPC-Body, Persistenz und medizinische Semantik bleiben
  unverändert.
- Testscope: neuer statischer Intake-Privacy-Negativvertrag; vorhandener
  Vitals-Privacyvertrag; lokaler Productbrowser mit reinem Trefferzähler gegen
  IDs, Payloads, Tages-/Benutzerkontext und Gesundheitswerte, ohne Treffertext
  auszugeben; direkt betroffene Syntax-/Capture-/Supabase-Consumerchecks.
- Releasewirkung: Ein weiterer Versuch muss monoton v22/v23 verwenden. Da die
  Materialisierer derzeit einen sauberen gesamten Supabase-Graph verlangen,
  muss der Repairblock den fixierten Intake-Hash deterministisch in die
  Materialisierungs-/Stagingreihenfolge aufnehmen; kein ungeprüfter Dirty-Bypass.
- Keine Produktdatei wurde in diesem Diagnoseblock geändert und kein Test,
  Commit, Push, Deploy, Write oder Delete ausgeführt.

#### F-ACT-R14-34 Repair und F-ACT-R14-35 Finding-Receipt - 2026-09-08

- U11R18 97/99, gültig und `CONTINUE`; Rehydration ist SUNK_USAGE.
- F34-Minimalfix: `app/supabase/api/intake.js` entfernt Benutzer-, Tages-, ID-,
  Payload- und rohe Fehlerdetails aus allen eigenen Diagnosen. Rückgabe-,
  Transport-, Persistenz- und Fehlerobjektverträge bleiben unverändert. Neuer
  statischer `intake-privacy.contract.test.js` gemeinsam mit dem Vitals-
  Privacyvertrag 4/4 PASS.
- Der v22-Materializer akzeptiert den uncommitteten Intake-Repair ausschließlich
  unter exakt gebundenem SHA-256; unbekannter Dirty-Drift bleibt fail-closed.
  V22 wurde lokal materialisiert. 21/21 direkte Contracts, C3/R8/R13,
  PowerShell-Parser, Syntax und synthetischer v21→v22/v22→v23-Releasebrowser
  PASS.
- Das reale lokale Productbrowser-Orakel ist `FAIL`: 36 Treffer, ohne Ausgabe
  der Inhalte. Inhaltsfreie zweite Klassifikation: 24 day-Label-Treffer,
  davon 16 Capture-Refresh und 8 Medication. Statisch wurden 42
  diagnosekritische Call-Sites im gemeinsamen Intake-Stack klassifiziert.
- F35 ist damit ein neues P1-Finding. Kein F35-Fix, keine Fullmatrix, kein
  finales Manifest, kein Preflight und kein Cutover in diesem Block. Produktion
  bleibt HEAD/origin 40c4b93, Activity V1 und Root-SW v21; keine externe oder
  Datenwirkung.
- U11R19 66/95, gültig und `CONTINUE`; der kohärente Block verbrauchte 31/4
  seit U11R18. Wegen des neuen P1-Findings wird kein zweiter Fixblock angehängt;
  sichere Pause vor dem eigenständigen F35-Diagnose-/Repair-/Retestblock.

#### F-ACT-R14-34 finale lokale Closure und v22/v23-Preflight - 2026-09-08

- D-ACT-R14-27 trennt F35 vom Activity-V2-Cutover. Das lokale Browserorakel
  wurde deshalb ohne Abschwächung des F34-Vertrags präzisiert: eigene
  Intake-API-Diagnostik muss 0 sensitive Treffer liefern; die bekannten
  gemeinsamen Intake-Treffer werden ausschließlich als inhaltsfreie Anzahl
  ausgewiesen. Ergebnis: F34 0, F35 36, keine Treffertexte.
- Direkt invalidierte Contracts 24/24, gezielter Nachlauf 13/13, 31 relevante
  Syntaxchecks, zwei PowerShell-Parserchecks und `git diff --check` PASS.
  Isolierte v21/v22/v23-Materialisierung sowie synthetischer Mischzustand,
  realer v21→v22-, v22→v23- und Fresh-v22→Offline-Browserpfad PASS. Das lokale
  v22-Productbrowser-Orakel ist für online/offline und den vollständigen
  18-Dateien-Supabase-/Boot-Graph PASS.
- Native Delta-, Contract-, Security-, Privacy-, Cache-, Rollback- und
  Consumerreviews PASS. Backend-/SQL-/Android-Diff 0, Secretmuster 0 und keine
  neue sensitive Diagnose. F35 bleibt offen, aber außerhalb des R14-Repairs;
  ein allgemeiner MIDAS-Privacy-PASS wird nicht behauptet.
- Finales Release-Manifest: 50 Code-/Testdateien, SHA-256 über ordinal sortierte
  `Pfad=Datei-SHA256`-Zeilen ohne Schlusszeile
  `179c9df627d846a2f0b0937ccb9f47314529ca8edc7f9aeaca0899499ba929e1`.
  Der reale Git-Deltascope gegenüber HEAD umfasst 35 Code-/Testdateien; mit
  Roadmap, Evidence und Repair-Findings exakt 38 zu stagende P1-Dateien.
- PRE09 PASS: HEAD=origin=Pages `40c4b93`, Run `34160860095` erfolgreich;
  Live V1/V2/R13 `1/0/2`, Root-SW v21 und authentifizierter Appboot. V1 bleibt
  69 mit geschütztem ID-Hash `459f2056...007d`; V2 0/0/0 mit Leerhash
  `4f53cda1...b945`; Katalog v1/v2 78/80, deprecated 0; R13 liefert 69 reine
  V1-Units und 0 Mixed-Source-Tage. Kein Payloadread, Write oder Delete.
- U11R24 nach allen Postconditions: 46 % 5h / 77 % Woche, gültig und
  `CONTINUE`. Lokaler Block vollständig geschlossen; die operative 72/21-
  Grenze ist in diesem Bucket nicht mehr erfüllt.
- D-ACT-R14-29 erteilt danach das neue gemeinsame P1/P2 für genau ein
  unverändertes v22/v23-Fenster. Die Entscheidung ist noch nicht ausgeübt;
  beim nächsten frischen Gate ab 72/21 ist keine erneute Freigabe oder
  Boundary-Diskussion erforderlich.

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

#### S5.6 Gate Record - 2026-08-31

Urteil: `POSTIMAGE COMPLETE / PRODUCT FAIL / V17 ROLLBACK PASS`.

- Git/Pages live: `4e87729e94131d75d870f9cfb99e8141ecd09f21` / Run
  `33358569779`; HEAD und origin/main stimmen.
- Produkt: Activity V1 ist wieder einziger Writer, V2-Capture nicht im
  Productload, zwei unveränderte R13-Reader aktiv, Root-SW v17.
- Daten: V1 67; V2 Sessions/Items/Sets 0/0/0; kein Smoke-Datensatz vorhanden
  oder zu löschen. Recovery blieb beim Fehler erhalten; der Rollback führte
  weder Storage-Clear noch Dateninverse aus.
- Reader: `midas.activity-consumer.v1`, 67 Units, 0 Mixed-Source-Days; keine
  Reader- oder medizinische Semantikänderung.
- Android: `DEFERRED BY OWNER / NOT PASS`.
- Finding: F-ACT-R14-26 offen. S6, DONE und Archivierung bleiben gesperrt.

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

### Vorbereitete S6-Deltamap - erst nach grünem S5.6 anwenden

Die fachlichen Änderungen sind vorab auf konkrete Symbole begrenzt. Keine
dieser Sources of Truth wird vor dem produktiven v16-Write-/Reader-/Delete-
Postimage auf V2 umgestellt:

1. `README.md`: Capture-Abschnitt und Modulkarte von C3/V1 auf den bewiesenen
   V2-Session-Capture umstellen; V1 ausschließlich als unverändert lesbare
   Legacy- und Repository-Rollbackreserve beschreiben.
2. `docs/modules/Activity Module Overview.md`: Kopfstand, Kernkomponenten,
   User-Trigger/Persistenz, R14-Status, Risks und Definition of Done auf
   Productcontroller, Recovery, Katalog-v2-Neudrafts, kataloggebundenes Replay,
   History/Detail/Correction/Delete und Coaching-Export synchronisieren. R13-
   Reader und medizinische Semantik ausdrücklich unverändert lassen; Android
   als owner-deferred und nicht PASS führen; archivierte R14-Links ergänzen.
3. `docs/modules/Capture Module Overview.md`: Rolle, Training-Trigger,
   Persistenz und DoD von `activity_add`/V1 auf den einzigen V2-Sessionwriter
   umstellen; BP/Body/Lab bleiben unverändert.
4. `docs/modules/Hub Module Overview.md`: ausschließlich die veraltete
   Writer-/Hidden-Aussage in der DoD ersetzen; Hub bleibt writerfrei und
   orchestriert weiterhin dasselbe Training-Panel.
5. Doctor-, Reports-, Protein- und Trendpilot-Overviews nur an vorhandenen
   Aussagen „V1 ist einziger Capturepfad“ berichtigen. Der bereits produktive
   R13-Snapshot, Berechnungen, Flags und medizinische Aussagen bleiben
   unverändert.
6. `docs/Future trainingsmodule update thoughts.md`: wegen vorbestehender
   fremder Änderungen nur den R14-Statusblock symbolgenau patchen: R14 `DONE`,
   R15 nächstes optionales Post-Core-Gate, R16 optional. Keine fremden
   Masterplanänderungen überschreiben.
7. `docs/qa/health-capture-reports.md`: HCR-033 mit V2-only Capture, null Dual
   Write, erhaltenem V1-Read, Recovery/identischem Retry, v16-Cache,
   v17-Rollbackreserve, normalem R9-Smoke-Delete und transparentem Android-
   Deferred-Vertrag ergänzen.
8. `CHANGELOG.md`: unter `Unreleased / Added` den sichtbaren V2-Cutover,
   Recovery, History/Export, V1-Lesbarkeit, Cachemonotonie und Android-Deferred
   dokumentieren. Das Android-/PWA-Runbook nur ändern, falls das reale
   Postimage einen neuen dauerhaften Bedienvertrag beweist.
9. Erst nach Einsetzen der tatsächlichen Commit-/Pages-/SW-, V1-/V2-Zähler-,
   Hash-, Reader- und Delete-Postimages Roadmap/Evidence auf `DONE` setzen,
   Links auf die `(DONE)`-Archivnamen umstellen, U13 als
   `FINAL_OBSERVATION` erfassen und beide Dateien gemeinsam archivieren.

Damit bleiben für S6 keine erneute Discovery und kein Entwurf der Zieltexte
offen; erforderlich sind nur das Einsetzen des echten Postimages, die
abgegrenzten Patches und der vorgeschriebene finale Review.

S6-Source-Fingerprints vor dem Cutover; jede Abweichung verlangt einen neuen
symbolgenauen Diff statt blindem Anwenden der Deltamap:

- `README fc9a1a48...6f73a`; Activity Overview `f4a6b886...e93e7`;
  Capture Overview `cdb8bc6b...c9b15`; Hub Overview `92745ce4...361d`.
- Doctor `72997e0e...ff28`; Reports `b6245d9c...404c`; Protein
  `7d37c83d...84ad`; Trendpilot `74b727ad...c417`.
- Activity-Masterplan `405b63c8...3f58` mit vorbestehendem fremdem Dirty-Diff;
  HCR-Suite `8ba4b7c5...dd7d`; Android/PWA-Runbook `45ae1182...be65`;
  Changelog `92898ea7...f4d6`.

Konditionale Textbausteine; erst nach grünem produktivem S5.6 und mit den
tatsächlichen Postimagewerten anwenden:

- README/Capture: `Training verwendet produktiv ausschließlich den Activity-
  V2-Session-Capture. Neue Drafts verwenden Katalog v2; Recovery und Replay
  bleiben an die gespeicherte Katalogversion und dieselbe Request-ID gebunden.
  Activity V1 nimmt keine neuen Writes mehr an, bleibt jedoch über den
  unveränderten R13-Reader vollständig lesbar und als Repository-
  Productloadreserve erhalten.`
- Changelog/Added: `R14 aktiviert Activity V2 als einzigen produktiven
  Training-Capture mit IndexedDB-Recovery, retry-idempotentem Session-Commit,
  History/Detail/Correction/Delete und Coaching-Export. Der V1-Writer ist aus
  dem Productload entfernt, historische V1-Daten und R13-Consumer bleiben
  unverändert; Root-SW v16 und die geprüfte V1-Inverse v17 sichern den
  kontrollierten Web-/PWA-Cutover. Android bleibt owner-deferred und wird
  nicht als PASS ausgewiesen.`
- HCR-033-Kern: `Produktload besitzt genau einen V2-Writer und null V1-
  Writercallsite; ein realer kataloggebundener Write ist ohne Dual Write in
  History, Detail, Export und R13 sichtbar, der identische Retry bleibt
  idempotent, Recovery bleibt erhalten und der Smoke-Datensatz wird nur über
  den normalen R9-UI-Flow gelöscht. Fresh/Upgrade/stale-client laufen auf v16;
  die datenverlustfreie V1-Productloadinverse ist monoton v17. Android-E2E ist
  DEFERRED BY OWNER / NOT PASS.`

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

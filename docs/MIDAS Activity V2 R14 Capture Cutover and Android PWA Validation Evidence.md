# MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation - Execution Evidence

Diese Datei dokumentiert ausschließlich reale R14-Nachweise. Planwerte,
Secretwerte, vollständige Gesundheitsdaten und nicht ausgeführte Aktionen
werden nicht als PASS eingetragen.

## Metadaten

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap | `docs/MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation Roadmap.md` |
| Status | `S5.4/S5.5 V24/V25 ATOMIC WINDOW IN PROGRESS; P1/P2 EXERCISED; R14 OPEN` |
| Evidence-Owner | `R14` |
| Baseline-Commit | `4be058b1b2e59f410ea8a6e3a4e5af9fdb86b652` |
| Umgebungen | `lokal / Browser / PWA / produktiv read-only / produktiv write; Android gemäß D-ACT-R14-17 owner-deferred` |
| Produktive Wirkung | `v22 wurde ausgeliefert; genau ein Abschlussversuch eines frischen v2-Drafts scheiterte fail-closed. Kein Retry oder Write. Datenverlustfreier V1-Productloadrollback über 6c9e722/v23 vollständig PASS; V2 bleibt 0/0/0. F37 ist danach ausschließlich lokal korrigiert und als v24/v25-Paket geprüft; keine neue Außenwirkung.` |
| Archivziel | `docs/archive/MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation Evidence (DONE).md` |

## Nachweisvertrag

Die Evidence muss belegen:

- Activity V2 ist nach Cutover der einzige sichtbare neue Capture-Pfad.
- Activity V1 bleibt historische Readerquelle, erzeugt aber keinen neuen
  Datensatz aus dem aktuellen Produktclient.
- Recovery, Commit, History und Export verwenden die bereits bewiesenen
  R7-R10-Verträge.
- Fresh- und Upgrade-Client verwenden ein konsistentes Productload- und
  Service-Worker-Postimage; Android bleibt gemäß D-ACT-R14-17 transparent
  deferred und wird nicht als PASS behauptet.
- Ein produktiver V2-Write erscheint genau einmal und wird von R13-Readern
  genau einmal konsumiert.
- Rollback verändert Productload, aber löscht keine Gesundheitsdaten.

Nicht als Evidence zulässig:

- geschätzte Zähler, erinnerte Versionen oder ungeprüfte Screenshots;
- Secret-, JWT-, Request-ID-, Payload- oder vollständige Gesundheitsdaten;
- lokaler Harness als vorgetäuschter Ersatz für den deferred Android-Smoke;
- ein nicht ausgeführter Test als PASS.

## Baseline

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R14-B01 | Git/Repo | HEAD/origin `4be058b1`; R13-Roadmap `3f99ef29…4345`, R13-Evidence `ccdd3ec4…38a5`, C3-Roadmap `14c66e16…6168` DONE; dirty nur R14 plus vorbestehende Secret-Readiness-Doku | `PASS` |
| EV-ACT-R14-B02 | Produkt | Pages-Commit `4be058b1`: C3-Training 1, V1-Form/Submit/Writer 1, R13-Readerloads 2, V2-Writerloads 0, Root-SW v13. Letztes geschütztes R13-Datenpostimage V2 `0/0/0`; kein späterer produktiver V2-Writer. Exakter Livezähler bleibt PRE02 in S5.3. | `PASS / REUSED` |
| EV-ACT-R14-B03 | Runtime | GitHub Pages `legacy`, Quelle `main`/Root, Run `33162838336` auf `4be058b1` erfolgreich. Releasequelle zeigt auf die dokumentierte Produkt-URL; tatsächliches Android-Gerät/Client bleibt bewusst P2. | `PASS WEB / P2 DEVICE GATE` |
| EV-ACT-R14-B04 | Security | SQL22-26-/RLS-/ACL-/Auth-Verträge aus R8-R13 bleiben source- und postimagegebunden gültig; G0 führt gemäß Permission keinen vorgezogenen produktiven Supabase-Read aus. PRE03/Advisor folgen read-only in S5.3. | `PASS / REUSED` |
| EV-ACT-R14-B05 | S1 Systemkarte | Productload, genau ein V1-Writer, V2-APIs, R13-Reader, direkter Weight-Chart-V1-Consumer, Hub/Main-Lifecycle, SW/PWA und rollbackfähiger Pages-Weg gezielt an realen Symbolen erfasst | `PASS` |
| EV-ACT-R14-B06 | S1 Tool/Secret Readiness | Git/Node/Deno/Supabase/psql/Playwright/CodeRabbit/JDK/Gradle und lokale ADB-Binary verfügbar; GitHub/CodeRabbit auth bereit; Operatorbundle vorhanden, gitignored, erforderliche Typen 2/2. Docker-Daemon aus, ohne S1-Auswirkung. Keine Werte/Deviceabfrage. | `PASS` |

## Wiederverwendete Evidence

| Evidence-ID | Quelle | Belegte Aussage | Invalidation |
| --- | --- | --- | --- |
| EV-ACT-R14-R01 | R8 L01-L08; aktuelle Hashes Draft `7ac418c5…e253`, Recovery `6d818a2a…189d`, Commit `24fcc10b…cfd7` | Recovery, Commit, Catalog Replay, Exactly-once | Änderungen an Draft/Recovery/Commit/Data Access |
| EV-ACT-R14-R02 | R9 finale L-IDs; History `4a6872fb…bf5`, Shell `588efd44…4b3`, Correction `f9a6f099…aaf1` | History, Correction, Delete, Mutation Guard | Änderungen an R9-Modulen oder RPCs |
| EV-ACT-R14-R03 | R10 L01/L08/L09; Export `db5456b7…ebd`, Data Access `35f878c1…8ac`, Controller `8c8d3690…1a0` | Coaching-Export und Browservertrag | Änderungen an Exportcontract/Data Access/Shell |
| EV-ACT-R14-R04 | R13 C45/R06/R07 | produktive Reader und V1-Parität | Reader-, Edge-, Workflow- oder SQL26-Änderung |
| EV-ACT-R14-R05 | C3/HCR-032 | Training-Produktfläche und V1-Writerbaseline | Hub/Main/Training/Productload/SW-Änderung |

## S1 Discovery Receipt

- Productload: V1-Source vor Supabase/Auth; R13 Consumer/Adapter/View unverändert
  vor Doctor/Charts/Main; null V2-Capturemodule. Training-DOM und Main besitzen
  genau einen sichtbaren V1-Savepfad und genau einen `addActivity`-Callsite.
- Producer: Semantik v1/v2, Draft, Recovery, Commit, Shell, Data Access,
  History/Correction/Delete und Coaching-Export stellen die in R8-R10
  bewiesenen gefrorenen APIs unverändert bereit.
- Consumer: R13 Doctor/Health lesen über `consumerDataAccess.loadSnapshot`.
  Zusätzlich liest der Weight-Chart Trainingsmarker direkt aus
  `AppModules.activity.loadActivities`; Erhalt ist F-ACT-R14-13.
- Lifecycle: Recovery `visibilitychange/pagehide`, Shell `visibilitychange`,
  Hub/Main eigene Open/Close/Resume-Hooks. Gemeinsame Instanzen benötigen einen
  einzigen Productcontroller-Owner.
- Cache/Client: Root-SW v13; Manifest-Standalone-PWA und native Release-WebView
  zeigen auf dieselbe Pages-URL. Debug-App ist nur lokale Testhülle. Tatsächliches
  Gerät und Daily-Driver-Client bleiben bis zum gemeinsamen P2-Gate unbehauptet.
- Deploy/Rollback: GitHub Pages Legacy `main`/Root; P1-Commit/Push triggert den
  Run. Bedingte Inverse ist ausschließlich der R14-Web-/Productload-Diff auf
  4be058b1, ohne SQL-/Reader-/Datenlöschung.
- Tool/Secrets: lokale Werkzeuge bereit; Docker-Daemon für S1 nicht benötigt;
  Operatorbundle nur typweise geprüft, keine Secrets oder Devicewerte erfasst.
- Invalidation: R8-R10-Kernmatrizen bleiben gültig. S4 invalidiert bewusst die
  C3-Productload-/Main-/Hub-/SW-Orakel und die integrierten Browserpfade, die in
  S5 vollständig revalidiert werden.

## S2 Zielvertrags-Evidence

| Evidence-ID | Vertrag | Eingefrorenes Ergebnis | Status |
| --- | --- | --- | --- |
| EV-ACT-R14-C01 | Productowner | exakt eine gefrorene `productController.mount(options)`-Composition, exakte Dependency-/Controllerflächen, fail-closed vor Mutation | `PASS` |
| EV-ACT-R14-C02 | State/UI/Fokus | Idle/Recoverable/Editing/Saving/Unknown/Committed/History/Export/Blocked/Destroyed mit konkreter deutscher Copy und Fokusziel | `PASS` |
| EV-ACT-R14-C03 | Katalog/Recovery/Commit | neue Drafts v2; Restore/Replay gespeicherte Version; Unknown/Offline/Auth bewahrt Recovery und identischen Auftrag | `PASS` |
| EV-ACT-R14-C04 | V1/Reader | V1-DOM/Listener/Load atomar entfernt; Weight-Chart über unveränderten R13-Snapshot, R13 Productreader source-unverändert | `PASS` |
| EV-ACT-R14-C05 | Productload/Cache | exakte V2-Scriptreihenfolge; Cutover-SW v14; Fresh/Upgrade/stale-client; rollbackfähiges V1-Postimage mit monotonem SW v15 | `PASS` |
| EV-ACT-R14-C06 | Auth/Multi-Tab | Logout Flush+Destroy ohne Discard; Login Recomposition; vorhandener Recovery-CAS statt neuer Lock-/Autharchitektur | `PASS` |
| EV-ACT-R14-C07 | P2-Datensatz | genau eine ownergewählte v2-Session mit einem Strength-Item/einem Set; Keep oder vorab gewählter normaler R9-Delete; P3 nur unerwartet | `PASS / OWNER CHOICE P2` |

## S3 Risiko- und Cutover-Evidence

- `EV-ACT-R14-RK01..RK17` sind in der Roadmap als vollständige P0/P1-
  Präventions-, Oracle-, Stop- und Rollbackmatrix materialisiert.
- Abgedeckt sind Dual Write/Surface, Doppelmount/-commit, Known/Unknown/
  Offline/Auth, Lifecycle/Logout, Catalog Replay/Quarantäne, Multi-Tab,
  Historymutation, R13-/Chart-/Consumerparität, XSS/Privacy, SW/Cache,
  Fresh/Upgrade/stale V1, reales Androidziel, Git/Pages/Dirty Scope, Rollback,
  Export und Architektur-Scopebruch.
- S3 Native Full Review: `PASS`. Shellrenderer verwenden sichere DOM-Pfade;
  bestehendes Data Access loggt nur Operation/Code/Status. Das neue Event ist
  payloadfrei. Keine neue SQL-/RPC-/RLS-/ACL-/Auth-/Secret-/Schedulerwirkung.
- Offene Produktentscheidung: keine. Reale Device-/Client-Identität und
  Datensatz-Keep-versus-R9-Delete bleiben ausdrücklich das gemeinsame P2-Gate.

## S4R Readiness Receipt

| Bereich | Reales Ergebnis | Status |
| --- | --- | --- |
| Scope | neuer Productcontroller/CSS/Tests plus gezielte Productload/Main/Auth/Chart/SW-Composition; keine Core-/SQL-/Android-Änderung | `READY` |
| Wellen | A unreferenzierte Productbasis; B unreferenzierte vollständige Composition; C atomarer lokaler v14-Cutover samt v15-Inverse | `READY / U5-U8` |
| Testinvalidierung | acht aktive Product-/Isolationcontracts plus neuer R14-Cutovercontract; R8-R10-Kernmatrizen bleiben bis echte Kernänderung gültig | `READY` |
| Tooling | relevante CLIs bereit; CodeRabbit 0.7.5 authenticated; Docker-Daemon für geplanten Scope nicht erforderlich | `READY` |
| Secrets | lokales Operatorbundle 2/2 Typen; GitHub/CodeRabbit auth bereit; Browser runtime S5.1, Device/Auth P2 | `READY LOCAL / GATED EXTERNAL` |
| Rollback | explizite 4be058b1-Produktpfade plus monotoner v15-Worker; keine SQL-/Daten-/Evidence-Inverse | `READY FOR MATERIALIZATION IN C` |
| Autonomie | lokale Blöcke A-C und S5.1-S5.3 erlaubt, jeweils nur nach U5-U10; danach gemeinsames P1/P2 | `READY` |

## Lokale und Disposable Nachweise

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R14-L01 | S4.1/S5 | Productcontroller und Dependencygraph | einmalig, vollständig, fail-closed | Exakte gefrorene API/Options/State; ein Recoveryowner sowie je aktivem Draft ein Commit-/Shellgraph; Missing/Unknown/Accessor/Doppelmount und partielle Subcomposition vor Exposition geschlossen; 13/13 direkte Contracts und Syntax PASS. | PASS / S5 |
| EV-ACT-R14-L02 | S4.2/S5 | Training UI und Accessibility | V2 sichtbar, V1 nicht sichtbar | Sichere deutsche Entry-DOM ohne HTML-String-Sink; aria-live/status, deterministischer Startfokus, 44 px und 390-px-Layout direkt geprüft; vier V2-Hosts im lokalen Productpostimage, V1-Form null. | PASS / S5 |
| EV-ACT-R14-L03 | S4.3/S5 | Recovery/Lifecycle | kein Draftverlust oder physischer Delete | New=v2, Restore=gespeicherte Version; einmaliger Recoveryowner; Logout/Destroy wartet Commit-Settlement und flusht ohne Discard; Flushfehler bewahrt Composition; Unknown/blocked Quarantäne; nur explizit bestätigter normaler Recovery-Discard. | PASS / S5 |
| EV-ACT-R14-L04 | S4.4/S5 | Commit/Writer-Cutover | exactly-once, null V1-Callsite | Je Draft ein Commitowner; Unknown-Viewclose öffnet denselben Controller/Intent; bestätigtes Commit ruft Consumerrefresh einmal payloadfrei auf. Lokales Postimage: null V1-DOM/Main-/Script-/Cachecallsite und genau ein V2-Mount. | PASS / S5 |
| EV-ACT-R14-L05 | S4.5/S5 | History/Correction/Delete/Export | bestehende Verträge komponiert | Exakter R9-Adapter+Mutation Guard+kataloggebundene Correction und R10-Exportcontroller/Shell sicher komponiert; Teardown sowie Partial-Failure-Rollback ohne Recoverywirkung direkt geprüft. | PASS / S5 |
| EV-ACT-R14-L06 | S4.6/S5 | Productload/SW/Cache/Rollback | atomar, monoton, keine Harnessassets | Exakt 15 V2-Capture-Scripts und vier Styles mit identischen Product-/Cache-URLs; Root-SW v14; null V1-Writerload; bestätigungspflichtiges explizites 4be058b1-Rollback auf sechs Produktpfade mit V1-Cache und monoton v15. | PASS / S5 |
| EV-ACT-R14-L07 | S4.7/S5 | Isolation und Gesamtcontract | keine neue SQL/Auth-/Secretwirkung | 38/38 direkt invalidierte Node-Contracts, R14 4/4 sowie C3/R13/R8-Isolation PASS; R13-Quellen unverändert; Chart V1-Parität/Multiunit-Aggregation; diff/Secret/Scope/Privacy/Cache/Rollbackreview PASS. Keine externe Wirkung. | PASS / S5 |
| EV-ACT-R14-L08 | S5.1 | vollständige lokale Matrix | alle invalidierten Orakel grün | 293/293 gebündelte Node-Verträge und 45/45 relevante Deno-Verträge PASS; R14 4/4, C3, R13 und R8 PASS; 31 R14-JS/MJS-Syntaxchecks und `git diff --check` PASS. Historische R10/R11-Isolationsassertions und zwei archivierte Contractpfade wurden ausschließlich im Testpostimage an R13/R14 angeglichen; Backend-Runtime-Diff 0. | PASS |
| EV-ACT-R14-L09 | S5.1 | Browser Desktop/390/320 | Fokus, Touch, Overflow, Lifecycle | Eine Edge-Session: realer Hub-Swipe zum Training, read-only History/Export ohne App-Fehler; Desktop sowie 390x844 und 320x800, 45-px-Touchziele, sichtbarer 3-px-Fokus und 0 Horizontaloverflow. Isolierte Harnesses: `all: committed · PASS`, Reload/Resume vor/nach Reload PASS, mehr als 30 Sekunden anderer selektierter Tab, R9-Correction und singulärer Delete-Guard ohne Mutation. | PASS |
| EV-ACT-R14-L10 | S5.1 | Fresh/Upgrade/Offline-PWA | konsistentes Cachepostimage | Root-SW v14 einmalig, exakt 15 V2-Capture-/vier R13-Readerloads, null V1- oder Harnessload; lokaler Test-PWA-Worker meldet bereit und reale Reload-Fixture bleibt committed/PASS. Offline-/Unknown-/Release-/Cleanup-/Blocked-Zustände über echten isolierten Adapter/Workercontract; reale Fresh-/Upgrade-/stale-client-Smokes bleiben P1/P2. | PASS LOCAL |
| EV-ACT-R14-L11 | F-ACT-R14-25 Korrektur | Semantikbindung, Retry, Cache und Fullmatrix | minimal, datenidentisch, monoton | Controller bindet den Commit an selectedSemantics; echte Controller→Data-Access-Regression belegt erfolgreiche v2-`created`/`replayed`-Responses, erfolgreichen Recovery-v1-Commit, exakt p_request_id/p_payload, byteidentischen Retry und payloadfreie Diagnostik. Root-SW v16 / V1-Inverse v17. 299/299 Node, 84/84 Deno, 55 Syntaxchecks, Browser-Harness `all: committed · PASS`, Cutover-/Rollbackcontracts und native Fullreviews PASS; gezielter Hardening-Rerun 61/61, Release-Scope 16 Code-/Testdateien plus zwei R14-Dokus, null V1-Writercallsite, ein V2-Mount, lokaler Edge-Boot mit einem V2-Controllerscript/null V1-Form/null Console-Errors; Backend-Diff 0, Secretmuster 0. | PASS LOCAL / PRODUCTIVE REPROOF PENDING |
| EV-ACT-R14-L12 | F-ACT-R14-26 Korrektur | realer Last-Mile-, Lifecycle-, Retry-, Recovery-, Cache- und Fullmatrixpfad | minimal, datenidentisch, ohne Außenwirkung | Redundantes Auth-Event als Surface-Reset reproduziert und durch neutrales Reconcile minimal korrigiert. Reale DOM→Listener→Shell→finish→Recovery/Intent→Semantik→Data-Access→Transport-Komposition in fünf Edge/Playwright-Modi PASS; Unknown-Retry bodyidentisch, Reload-Recovery PASS. 303/303 Node, 84/84 Deno, 57/57 Syntax, diff-check und native Fullreviews PASS. v18/v19 vorbereitet; 19-Dateien-Manifest `75daad72...d3169`. | PASS LOCAL / PRODUCTIVE REPROOF PENDING |
| EV-ACT-R14-L13 | F-ACT-R14-28..31 Dirty-Stop-Closure und Repair | Draft-Preflight, Privacy, Viewport, Release-/Cachematerialisierung | nur lokal, kein Commit/Push/Deploy/Write | F28 INVALID_TIME/duration_min und write-freier Preflight; F30 abstrakte calcMAP-Codes; F29 Viewport 4/4. F31 ergänzt den fehlenden Chartasset am Main-Anker und normalisiert bekannte EOF-Leerzeilen. 8/8 direkte Contracts sowie isolierte v20/v21-Materialisierung samt diff-check PASS. | REPAIR PASS / FINAL REVIEW BY L15 PASS |
| EV-ACT-R14-L14 | F-ACT-R14-32 bounded Red Team | transitive ESM-Identität und erster Offline-Reload | Finding-only; statische Consumer-/Cacheanalyse ohne Fix oder Produktwirkung | Network-first-Navigation kann v20-HTML unter einem v19-Worker liefern. Neun Supabase-Importer laden `auth/core.js` unversioniert, während der versionierte Einstieg parallel `core.js?v=20` lädt; die v19-/v20-Corequellen unterscheiden sich. `CORE_ASSETS` enthält nicht den vollständigen versionierten ESM-Graph, daher ist Fresh-Install→sofortiger Offline-Reload nicht belegt. | P1 FINDING / OPEN |
| EV-ACT-R14-L15 | F-ACT-R14-32 Repair/Retest | vollständige transitive Releaseidentität und reale Offline-/Wechselpfade | nur lokal; kein Commit/Push/Deploy/Write | 18 Supabase-/Boot-Module je Release durchgängig v20/v21, vollständig im Shellcache und ohne doppelte Root-/Auth-Core-Identität. Isolierte Materializer; echter v19-Worker→v20-HTML, v20→v21 und Fresh-v20→Offline; lokaler Productboot; 306 Node, 44 Syntax, zwei Parser und native Fullreviews PASS. | PASS LOCAL / PRODUCTIVE REPROOF PENDING |
| EV-ACT-R14-L16 | F34 Repair / F35 Finding | API-Privacyfix und reales lokales Productbrowser-Orakel | nur lokal; keine Außen- oder Datenwirkung | Intake-API nur abstrakte Marker; statischer Privacyvertrag 4/4, 21/21 direkte Contracts plus C3/R8/R13, Parser/Syntax und synthetischer Releasebrowser PASS. Reales v22-Productbrowser-Orakel meldet 36 Treffer ohne Inhaltsausgabe; 24 day-Label-Treffer klassifiziert als 16 Capture-Refresh und 8 Medication; 42 statische diagnosekritische Intake-Stack-Call-Sites. | PARTIAL PASS / P1 FINDING |
| EV-ACT-R14-L17 | Repair-Findings und V2-Blockeranalyse | vollständige F01-F35-Klassifikation sowie F36-Recovery-/Operatorgrenze | nur Dokumentation und fokussierte Sourceanalyse; keine Tests oder Außenwirkung | Kein weiterer ungefixter V2-Codefehler bewiesen. F35 als vorbestehender gemeinsamer MIDAS-Backlog separiert. F36: erhaltener gealterter Recovery-Draft ist nicht commitfähig; `startSession()` verlangt leeren Recoveryzustand und einzig vorhandene Auflösung ist der bestätigte normale UI-Discard oder Erhalt mit weiterem Cutoverstopp. | F36 OWNER DECISION REQUIRED |
| EV-ACT-R14-L18 | F34 finale Closure / v22-v23 Release | F34-spezifische Privacy, Productload, Offline, Wechselpfade und native Fullreviews | nur lokal; kein Commit/Push/Deploy/Write/Delete | Intake-API-sensitive Browserdiagnostik 0; bekannter F35-Shared-Zähler 36 ohne Inhaltsausgabe. 24/24 direkte Contracts, 13/13 gezielter Nachlauf, 31 Syntax, zwei Parser und diff-check PASS. Isolierte v21/v22/v23-Materialisierung, synthetischer Mischzustand, reale v21→v22-/v22→v23-Transitions, Fresh-v22→Offline sowie lokaler v22-Productbrowser PASS. Native Delta-/Contract-/Security-/Privacy-/Cache-/Rollback-/Consumerreviews PASS; Backend/SQL/Android-Diff und Secretmuster 0. 50-Dateien-Release-Manifest `179c9df6...29e1`; realer P1-Deltascope 35 Code/Test plus drei R14-Dokumente = 38 Dateien. | PASS LOCAL / PRODUCTIVE REPROOF PENDING |
| EV-ACT-R14-L19 | F37 Repair / v24-v25 Closure | reale Draftprojektion, Last-Mile, Release-/Offlinepfade und native Fullreviews | nur lokal; kein Commit/Push/Deploy/Write/Delete | Exakter isolierter Produktionsdraft-Replay bewies vor Fix INVALID_COMMIT_INTENT/item.set_count und Transport 0: Recovery verglich den kompakten Commitpayload mit allen drei Draftzeilen. Minimalfix projiziert wie Commit nur zusammenhängende nichtleere Sets, erlaubt leere Schlusszeilen und lehnt Lücken/all-empty weiter ab. Danach genau ein Transport und committed. Last-Mile 4/4+1/1, 317/317 Node, C3/R8/R13, synthetische Releasekohärenz, reale v23→v24-/v24→v25-Transitions, Fresh-v24→Offline, lokaler v24-Productbrowser, 39 Syntax, zwei Parser, diff-check und native Fullreviews PASS. Backend/SQL/Android-Diff 0; 84/84 Deno weiterhin gültig. 57-Dateien-Release-Manifest `e97f887b...b963`; realer P1-Deltascope 43 Code/Test/Produkt plus drei R14-Dokumente = 46 Dateien. | PASS LOCAL / PRODUCTIVE REPROOF PENDING |

## Evidence-Gültigkeit und Invalidation

| Evidence-ID | Inputs / Fingerprints | Belegte Aussage | Invalidiert durch | Wiederverwendet in |
| --- | --- | --- | --- | --- |
| EV-ACT-R14-L01..L05 | Controller `20a91b68...e6d2`; CSS `5f2d2770...9c7f`; Contract `1175e858...800` | Block-B-Composition lokal vollständig, unreferenziert und fail-closed | Änderung an einem der drei Fingerprints oder den komponierten Core-APIs | Block C und S5 |
| EV-ACT-R14-L06/L07 | index `f017b4ec...b6a0`; app.css `6e02ac4e...d560`; main `9c31759d...9663`; Authcore `e4619a78...b8e6`; Chart `f3020bd8...5914`; SW `fcaa1907...225`; Cutovercontract `1ce88d5a...b1d9`; Rollbacktool `23b37d83...856c` | lokales v14-Cutoverpostimage mit null V1-Writerload, erhaltenen R13-Readern und materialisierter v15-Inverse | Änderung an Productload/SW/Consumern/Authhook/Chart/Rollbackmaterial | S5 |
| EV-ACT-R14-L08..L10 | R8-Isolation `46c05f78...aef5`; R10-Productloadcontract `e6d62f15...4f2a`; R13-Reporttest `1ae18b13...e488`; Browser-Session 2026-08-29 | lokale Releasebereitschaft und vollständige lokale Matrix | Korrektur an Runtime/UI/SW oder diesen Contractpostimages | P1 |
| EV-ACT-R14-L11 | Controller `d30e7b8a...c7c0`; Regression `559581bc...5598`; index `340d37e7...ea0a`; app.css `e9df9112...5e4f`; main `3411f13d...fd6`; Authcore `d0a2b041...20ca`; Chart `c743db04...2d8`; SW `8c208012...0142`; Cutovercontract `2c751df3...ee11`; Rollbacktool `a03f7a91...dc3`; 16-Dateien-Manifest `2b329d5a...4926b` | F-ACT-R14-25 lokal geschlossen; v16/v17-Cutoverreserve releasebereit | Änderung an Commitcomposition, Productload, SW, Rollbacktool oder einem Manifestpfad | neuer P1/P2-Reproof |
| EV-ACT-R14-L12 | Controller `47acec1a...e173`; Test `e3c4028d...b1bdb`; Harness HTML/JS/Contract `dd6a8048...edde` / `077ee88f...1eea` / `51c411b2...32d`; SW `102c1fe7...3dd7`; Cutovercontract `cd778c84...5dcf`; Rollbacktool `b7aa1ed1...2f1b`; Manifest `75daad72...d3169` | F-ACT-R14-26 lokal korrigiert; v18/v19 releasebereit | Änderung an Lifecycle, Last-Mile-Harness, Productload, Cache, Rollback oder Manifestpfad | produktiver Write-/Reader-/Delete-Reproof |
| EV-ACT-R14-L13 | Session Commit `5b2cf8e3...136c`; Controller `565d156e...f07b`; Vitals `d99eaf43...3ab`; index `313091fa...8b68`; SW `5bd6bff8...0449`; Cutovertool `9e51ec29...caeb`; Rollbacktool `634d3624...1f27`; Contract `248f7dc7...c770`; 35-Dateien-Manifest `2a9bb7f9...0812c` | F28/F30, F29-Viewport und F31 lokal geschlossen; v20/v21-Roundtrip grün | Änderung an diesen Quellen, Orakeln oder Toolquellpostimages | nativer Abschlussreview und verbleibende lokale Product-/Offline-Smokes |
| EV-ACT-R14-L14 | SW `5bd6bff8...0449`; v19 Auth-Core-Blob `6bd7473a...6873f`; lokaler v20 Auth-Core `aa8f5b00...2717b`; v19 Vitals-Blob `694eae23...26873`; lokaler v20 Vitals `61bc3607...915c`; neun statisch bestätigte unversionierte Core-Importer | F32: alter Worker kann neues HTML liefern; transitive Supabase-Module besitzen keine durchgängige Releaseidentität und fehlen als vollständiger ESM-Graph im installierbaren Offlinepostimage | kohärente Versionierung/Navigation/Cachekorrektur plus gezielte stale-client- und Fresh-Offline-Revalidierung | eigener F32-Repair-/Retestblock |
| EV-ACT-R14-L15 | index `85e4dda9...9cc6`; SW `88232bcf...b186`; boot-auth `f45483f3...5c55`; Supabase root `c6dd73bd...a0b7`; Auth core `f3222e4d...224e`; Cutover `15dd80da...d316`; Rollback `a19144c7...b2ed`; Releasecontract `484351c2...0f26`; reale Transition `fbcb7ee8...4f87`; 49-Dateien-Manifest `333a3469...db95` | F29-Cache/F31/F32 lokal geschlossen; vollständiger v20/v21-Graph und reale Wechsel-/Offlinepfade | Änderung an einem Releasegraph-, Productload-, Worker-, Materializer- oder Browserorakelpfad | neuer produktiver Read-only-Preflight und Write-/Reader-/Delete-Reproof |
| EV-ACT-R14-L16 | Intake-API-Fix, neuer statischer Privacyvertrag, v22-Productload und inhaltsfreie Browserzähler | F34 im API-Modul korrigiert; F35 im gemeinsamen Intake-Stack reproduzierbar offen | F35-Fix oder Änderung an Intake-, Diagnose-, Browseroracle- oder Releasepfaden | eigener F35-Repair-/Retestblock; danach vollständige lokale Closure |
| EV-ACT-R14-L17 | Roadmap-/Evidence-Findingstabellen, `docs/MIDAS Activity V2 R14 Repair Findings.md`, fokussierte V2-Controller-/Commitquellen | R14-relevante versus allgemeine MIDAS-Funde getrennt; F36 als aktueller Operatorblocker bewiesen | Änderung am Single-Draft-, Preflight-, Discard- oder Commitvertrag sowie neuer Produktzustand des Recovery-Drafts | Ownerentscheidung zu F36; danach Manifest, Preflight und produktiver Reproof |
| EV-ACT-R14-L18 | Release-Manifest `179c9df6...29e1`; Intake-Privacytest; v22/v23-Materialisierer; drei Browserorakel; Git-Deltascope 35+3 | F34 vollständig lokal geschlossen, v22/v23 releasekohärent und PRE09-bereit; F35 sauber als Shared Backlog separiert | Änderung an einem Manifestpfad, Intake-Diagnostik/-Oracle, Productload, Worker, Materialisierer oder realem Git-Deltascope | PRE09 und neues v22/v23-P1/P2 |
| EV-ACT-R14-L19 | Recovery `9a46827a...20f0`; Recoverycontract `c0b81b65...9a0e`; Last-Mile-Harness `f813f1a9...5c62`; Harnesscontract `82be20e2...f30`; Browsersmoke `dd98dc04...c818`; index `939e1fcf...3a5`; SW `cdaca426...7ec`; Cutovertool `20a6023a...998`; Rollbacktool `2cfeec59...562`; Cutovercontract `dad1b432...1e30`; Releasecontract `a5c8a23e...55b`; reale Transition `905f820c...ff09`; 57-Dateien-Manifest `e97f887b...b963` | F37 lokal geschlossen; v24/v25 releasekohärent, exakter Produktionsdraft lokal commitfähig und PRE10-bereit | Änderung an Recovery-/Commitprojektion, Last-Mile-Orakel, Productload, Worker, Materialisierern, Transitionstest oder einem Manifestpfad | D-ACT-R14-30 und produktiver Write-/Reader-/Delete-Reproof |
| EV-ACT-R14-P01..P04 | in S5 erfassen | produktiver Cutover | neuer Deploy/Runtime-Drift | S6/R15 |

## Produktiver Read-only Preflight

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-ACT-R14-PRE01 | Git/Remote/Pages/SW und freigegebener Diff | HEAD=origin/main=Pages `4be058b1`; Legacy `main`/Root, Build/Run 33162838336 grün, live index/SW HTTP 200, V1-Script 1, R13-Reader 2, V2-Productcontroller 0, Root-SW v13. R14-Diff abgegrenzt; drei fremde Dirty-Dokus unberührt; Secretmuster 0. | keiner |
| EV-ACT-R14-PRE02 | V1-/V2-Zähler und Hashbaseline | R13-Basis 66/`cfddb1fa...b6f` unverändert; genau ein gültiger V1-Zugang danach und vor G0. Neue Baseline V1 67/`b9807820...5d94`, Reader 67, invalid 0. V2 0/0/0, Tabellen- und Request-ID-Hashes je `4f53cda1...b945`; Katalog 78/80/0 und Hashes exakt. Keine Payload ausgegeben, keine Datenmutation. | keiner; F-ACT-R14-22 akzeptiert |
| EV-ACT-R14-PRE03 | SQL22-26 Signaturen, Owner, ACL/RLS | Elf erwartete Commit/History/Export/Consumer-Funktionen exakt vorhanden und sourcehashgleich; postgres-owned, korrekte STABLE/VOLATILE, INVOKER/DEFINER, leerer Search Path und Minimal-ACL. Vier V2-Tabellen mit RLS, Own-select-Policies, anon 0, authenticated/service SELECT-only. | keiner |
| EV-ACT-R14-PRE04 | R13-Reader/Edge/Workflow-Postimage | Produktiver Snapshot `midas.activity-consumer.v1`: 67 Units, 0 Mixed-Source-Days. Monthly/Protein/Trend/Incident 61/31/32/27 ACTIVE mit true/false/false/true; 0 relevante Runs inflight, letzte Zielruns grün. Advisors unverändert vier bekannte Security-WARN plus acht unused-index INFO. | keiner |
| EV-ACT-R14-PRE05 | Androidziel, Authsession, keine Secretlücke | Releasequelle `de.schabuss.midas` auf exakter Pages-URL, PWA standalone; Debugsuffix ausgeschlossen. Auth 1 bestätigt/0 anonym; Operatorbundle gitignored, 2/2 Typen. Ownerentscheidung D-ACT-R14-17: Handy nicht verbunden, kein PC/ADB; Android Evidence deferred und ausdrücklich nicht PASS. | keiner im revidierten Scope; transparentes Device-Gap bleibt |
| EV-ACT-R14-PRE06 | Rollbackartefakt und P1/P2/P3-Briefing | Tool `23b37d83...856c`, explizites `-ConfirmRollback`, Basis 4be058b1, sechs Produktpfade, Root-SW v15. P1 samt bedingtem Rollback und P2 für einen Write plus normalen R9-Delete durch D-ACT-R14-18 erteilt. U10R2 am 2026-08-30 08:05:11+02:00: 98/100 = CONTINUE; atomares Fenster begonnen. | keiner |
| EV-ACT-R14-PRE07 | erneuerter v16/v17-Preflight nach F-ACT-R14-25 | HEAD=origin/main=Pages `ce2e18d`; Run 33296959317 success, live V1/V2-Controller/R13-Reader 1/0/2 und SW v15. V1-ID-Menge 67; V2 0/0/0, alle Leerhashes `4f53cda1...b945`; Katalog 78/80. Kein Payloadread oder Write. U10R11 am 2026-08-31 06:37:47+02:00 ist mit 94/99 technisch CONTINUE, verfehlt die bevorzugte 96/15-Reserve knapp und erfüllt die harte 89/20-Mindestreserve. Die Messung ist POST_REHYDRATION_BASELINE; bereits verbrauchter Einstieg ist SUNK_USAGE. 16-Dateien-Manifest `2b329d5a...4926b`, ce2e18d/v15-Produktpreimage und D-ACT-R14-19/-20/-21 sind bestätigt. | `PASS / PRIMARY_OWNER_BOUNDARY_ALLOWED`; atomares Fenster begonnen |
| EV-ACT-R14-PRE08 | aktueller v20/v21-Preflight nach F-ACT-R14-33 und D-ACT-R14-25 | HEAD=origin/main=Pages `3857bf4`; letzter Pages-Run 34023954044 success/built. Live entspricht HEAD: V1-Form/Script 1/1, V2-Productcontroller 0, R13-Readerloads 2, Root-SW v19. 49-Dateien-Manifest `333a3469...db95` und 51-Dateien-Scope exakt. Auth 1 bestätigt/0 anonym; V1 69 mit unverändertem geschütztem ID-Hash `459f2056...007d`; V2 0/0/0 und ID-/Request-ID-Leerhashes `4f53cda1...b945`; Katalog v1/v2 78/80, deprecated 0; R13 `midas.activity-consumer.v1`, 69 reine V1-Units, 0 Mixed-Source-Tage. Kein Payloadread, Write oder Delete. U11R13 80/66 ist gültig/CONTINUE. D-ACT-R14-25 korrigiert die damalige Ein-Punkt-Ablehnung: effektiver Operational Safety Floor 72/21, Autonomous Full-Closure Floor 81/21. | `PASS / PRIMARY_OWNER_BOUNDARY_ALLOWED`; Owner akzeptierte reduziertes administratives Closure-Polster, keine Produktivwirkung begonnen |
| EV-ACT-R14-PRE09 | v22/v23-Preflight nach F34-Closure und D-ACT-R14-27/-28 | HEAD=origin/main=Pages `40c4b93`; letzter Pages-Run 34160860095 completed/success. Live V1/V2/R13 `1/0/2`, Root-SW v21; Edge-Appboot authentifiziert. 50-Dateien-Release-Manifest `179c9df6...29e1`; Git-P1-Deltascope 35 Code/Test plus Roadmap, Evidence und Repair-Findings = 38 Dateien. Auth 1/0 anonym; V1 69 mit unverändertem ID-Hash `459f2056...007d`; V2 0/0/0 und ID-/Request-ID-Leerhashes `4f53cda1...b945`; Katalog 78/80/0; R13 `midas.activity-consumer.v1`, 69 reine V1-Units, 0 Mixed-Source-Tage. Die zwischenzeitlich regulär erfassten Vitals ändern die Activity-Baseline nicht. Kein Payloadread, Write oder Delete. | `PASS / consumed by D-ACT-R14-29` |
| EV-ACT-R14-PRE10 | v24/v25-Preflight nach F37-Closure | HEAD=origin/main=Pages `6c9e722`; Pages-Run 34247698890 completed/success. Live-Index `a20bbeb4...7eff`, Live-Worker `c6dc0473...1f6`; V1/V2/R13 `1/0/2`, Root-SW v23; read-only Edge-Appboot authentifiziert. 57-Dateien-Release-Manifest `e97f887b...b963`; Git-P1-Deltascope 43 Code/Test/Produkt plus Roadmap, Evidence und Repair-Findings = 46 Dateien. Auth 1 bestätigt/0 anonym; V1 69 mit unverändertem ID-Hash `459f2056...007d`; V2 0/0/0 und ID-/Request-ID-Leerhashes `4f53cda1...b945`; Katalog 78/80/0. Begrenzter R13-Snapshot 2026-05-01..2026-09-09: `midas.activity-consumer.v1`, 25 reine V1-Units, 0 V2 und 0 Mixed-Source-Tage; wegen des abweichenden Zeitfensters kein Ersatz für die frühere 69-Unit-Evidence. Kein Payloadread, Write oder Delete. | `PASS / new P1-P2 required` |

## Produktive Aktionen

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R14-W01 | Web-/PWA-Cutover | P1 | V2-Productload und neuer Root-SW | 1edbe38d / Run 33296179701; live V2-Productload und SW v14; Fresh/Upgrade/stale-client und Recovery PASS | PASS, später bedingt zurückgerollt |
| EV-ACT-R14-W02 | kontrollierter V2-Write | P2 | genau eine Session mit Items/Sets | Original und identischer Retry fail-closed; Draft erhalten; V2 danach 0/0/0 | FAIL / NO WRITE |
| EV-ACT-R14-W03 | normaler R9-Delete eines Smoke-Datensatzes | P2 / D-ACT-R14-18 | V2-Datensatz nach bewiesenem Write/Reader entfernt | Kein Datensatz entstanden; deshalb kein Delete ausgeführt | NOT APPLICABLE |
| EV-ACT-R14-W04 | Productload-Rollback auf V1 | P1 bedingt, nur bei Cutoverfehler | Webcode zurück; Daten unverändert | ce2e18d / Run 33296959317; V1-Form/Script 1/1, V2-Productcontroller 0, R13-Reader 2, SW v15 | PASS |
| EV-ACT-R14-W05 | erneuter Web-/PWA-Cutover | D-ACT-R14-19/-20 | V2-Productload und Root-SW v16 | 1b6e716 / Run 33357905534; live V1/V2/R13 0/1/2 und SW v16; Fresh/Upgrade/stale-client/Recovery PASS | PASS, danach bedingt zurückgerollt |
| EV-ACT-R14-W06 | erneuter kontrollierter V2-Write | D-ACT-R14-19 plus Aktionsbestätigung | genau eine Session mit Items/Sets | Original und genau ein identischer Retry blieben im Editing-/Readyzustand; Draft/Eingaben erhalten; V1 67, V2 0/0/0 | FAIL / NO WRITE |
| EV-ACT-R14-W07 | normaler R9-Delete | D-ACT-R14-19 | ausschließlich erzeugten Smoke-Datensatz entfernen | Kein Datensatz entstanden; deshalb kein Delete ausgeführt | NOT APPLICABLE |
| EV-ACT-R14-W08 | v17-Productload-Rollback auf V1 | D-ACT-R14-19 bedingt | Webcode zurück; Daten unverändert | 4e87729 / Run 33358569779; V1-Script 1, V2-Productcontroller 0, R13-Reader 2, SW v17; frischer V1-Boot PASS | PASS |
| EV-ACT-R14-W09 | v18-Web-/PWA-Cutover | D-ACT-R14-22 | V2-Productload und Root-SW v18 | 0fa44e2 / Run 34022878621; V1/V2/R13 0/1/2; Fresh/Upgrade/stale-client/Recovery PASS | PASS, danach bedingt zurückgerollt |
| EV-ACT-R14-W10 | genau ein v18-Abschlussversuch | D-ACT-R14-22 plus Owneraktion | genau eine V2-Session nur bei gültigem Draft | bekannte Eingabevalidierung vor Transport; kein Retry, V2 0/0/0, Recovery erhalten | FAIL-CLOSED / NO WRITE |
| EV-ACT-R14-W11 | v19-Productload-Rollback auf V1 | D-ACT-R14-22 bedingt | Webcode zurück; Daten unverändert | 3857bf4 / Run 34023954044; V1/V2/R13 1/0/2, SW v19; isolierter frischer V1-Boot PASS | PASS ROLLBACK |
| EV-ACT-R14-W12 | v20-Web-/PWA-Cutover | D-ACT-R14-23/-25 | V2-Productload und Root-SW v20 | 2dbfa3c / Run 34160428748; Live-Index und Worker entsprachen dem Commit, V1/V2/R13 0/1/2, SW v20; Upgradepfad aktiv | PASS, danach wegen Privacy-Pflichtfehler zurückgerollt |
| EV-ACT-R14-W13 | geplanter v20-Smoke-Write | D-ACT-R14-23 | genau eine V2-Session nur nach grünem Livepostimage | Nicht ausgeführt: Live-Browserdiagnostik enthielt bereits vor dem Write eine Datensatz-ID und konkrete Gesundheitswerte. Kein Retry, V2 0/0/0, kein Delete. | BLOCKED BEFORE WRITE |
| EV-ACT-R14-W14 | v21-Productload-Rollback auf V1 | D-ACT-R14-23 bedingt | Webcode zurück; Daten unverändert | 40c4b93 / Run 34160860095; Live-Index/SW exakt Commit, V1/V2/R13 1/0/2, SW v21; aktualisierter frischer V1-Client bootet ohne Fehler | PASS ROLLBACK |
| EV-ACT-R14-W15 | v22-Web-/PWA-Cutover | D-ACT-R14-29 | V2-Productload und Root-SW v22 | 42a0858 / Run 34245115560; Live-Index/Worker v22, V1/V2/R13 0/1/2; Fresh/Update, Recovery und bestätigter Draftdiscard PASS | PASS, danach wegen F37 zurückgerollt |
| EV-ACT-R14-W16 | genau ein frischer v22-Abschlussversuch | D-ACT-R14-29 | genau eine V2-Session nur nach frischem v2-Draft | Alter Draft bestätigt verworfen; frischer Katalog-v2-Draft mit minimal gültigem Set. Genau ein Abschlussklick führte unmittelbar zu „Activity V2 ist derzeit nicht verfügbar“. Kein Retry; V2 0/0/0; Recovery erhalten; kein Delete. | FAIL-CLOSED / NO WRITE |
| EV-ACT-R14-W17 | v23-Productload-Rollback auf V1 | D-ACT-R14-29 bedingt | Webcode zurück; Daten unverändert | 6c9e722 / Run 34247698890; Live-Index/SW exakt Commit, V1/V2/R13 1/0/2, SW v23; aktualisierter frischer V1-Client und geschützte Datenpostcondition PASS | PASS ROLLBACK |

## Vorher-/Nachher-Nachweis

| Merkmal | Vorher | Nachher | Status |
| --- | --- | --- | --- |
| sichtbarer Capture | Activity V1 | nach bedingtem v23-Rollback wieder Activity V1 | PASS ROLLBACK |
| V1-Produktcallsite | genau eine | während v22 null; v23-Rollbackpostimage wieder genau eine | PASS ROLLBACK |
| V1-Historie | 69 mit geschütztem Hash | keine Cutovermutation oder -löschung; Vor-/Nachbaseline 69 mit identischem Hash | PASS / NO MUTATION |
| V2 Sessions/Items/Sets | 0/0/0 | genau ein v22-Abschlussversuch, kein persistierter Write; weiterhin 0/0/0 | PASS NO WRITE |
| R13 Reader | V1-paritätisch | zwei Readerloads unverändert; aus unveränderter Baseline 69 reine V1-Units und 0 Mixed-Source-Days | PASS |
| Root-SW | v21 vor dem Fenster | v22 Cutover, danach monoton v23 Rollback | PASS ROLLBACK |

## Deploy- und Runtime-Nachweise

| Evidence-ID | Ziel | Version / Run-ID | Smoke | Schreibwirkung | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R14-P01 | Pages/Web | `1edbe38d` / `33296179701` | Fresh, Upgrade und stale-client PASS; Recovery nach Reload PASS | nein | PASS, später zurückgerollt |
| EV-ACT-R14-P02 | Android Daily-Driver | owner-deferred | nicht ausgeführt und nicht als PASS behauptet | nein | DEFERRED / NOT PASS |
| EV-ACT-R14-P03 | R13 Consumer | Cutover: unveränderte zwei Loads; Rollback: unveränderte zwei Loads | finaler S5.6-Readerpostcheck noch offen | read-only | PARTIAL |
| EV-ACT-R14-P04 | Service Worker | Cutover v14; Rollback `ce2e18d` / `33296959317` v15 | Upgradebanner, kontrolliertes Schließen alter v14-Clients und frischer v15-Boot PASS | nein | PASS ROLLBACK |
| EV-ACT-R14-P05 | Pages/Web zweites Fenster | `1b6e716` / `33357905534`; Rollback `4e87729` / `33358569779` | v16 Fresh/Upgrade/stale-client/Recovery PASS; Write FAIL; v17 frischer V1-Boot PASS | kein persistierter Write | PASS ROLLBACK / PRODUCT FAIL |
| EV-ACT-R14-P06 | R13 Consumer S5.6 | zwei unveränderte Productloads; Service-Snapshot `midas.activity-consumer.v1` | 67 Units, 0 Mixed-Source-Days | read-only | PASS |
| EV-ACT-R14-P07 | Pages/Web drittes Fenster | `0fa44e2` / `34022878621`; Rollback `3857bf4` / `34023954044` | v18 Fresh/Upgrade/stale-client/Recovery PASS; Write fail-closed; isolierter v19-V1-Boot PASS | kein persistierter Write | PASS ROLLBACK / PRODUCT FAIL |
| EV-ACT-R14-P08 | R13 Consumer aktuelles Postimage | zwei unveränderte Productloads; `midas.activity-consumer.v1` | 69 reine V1-Units, 0 Mixed-Source-Days | read-only | PASS |
| EV-ACT-R14-P09 | Pages/Web viertes Fenster | `2dbfa3c` / `34160428748`; Rollback `40c4b93` / `34160860095` | v20 Live-Productload und Upgrade erreicht; Privacy-Pflichtfehler vor Write; v21 V1-only, frischer aktualisierter Client und Datenintegrität PASS | kein Write, Retry oder Delete | PASS ROLLBACK / PRODUCT PRIVACY FAIL |
| EV-ACT-R14-P10 | Pages/Web fünftes Fenster | `42a0858` / `34245115560`; Rollback `6c9e722` / `34247698890` | v22 Productload/Recovery und bestätigter alter Draftdiscard PASS; frischer v2-Abschluss fail-closed; v23 V1-only, frischer aktualisierter Client und Datenintegrität PASS | kein persistierter Write, kein Retry oder Delete | PASS ROLLBACK / PRODUCT FAIL |

## Findings und Korrekturen

| Finding | Phase | Bewertung | Korrektur | Revalidierung | Status |
| --- | --- | --- | --- | --- | --- |
| | | | | | |
| F-ACT-R14-12 | G0 | P2 / Runtime-Postimage | Reale Pages-Baseline 4be058b1/Run 33162838336 statt historischer C3-Notiz „nicht deployed“ erfasst; kein Writer-/Reader-/Cache-Drift. | Live-HTML/SW: C3 1, V1-Writer 1, R13-Reader 2, V2-Writer 0, SW v13. | fixed |
| F-ACT-R14-13 | S1/S2 | P1 / V1-Reader-Consumer | Weight-Chart nutzt künftig den unveränderten R13-Snapshot und bildet einen rein darstellenden Tagesmarker; kein produktiver V1-Load. | S5 Consumer-/medizinische Semantikmatrix. | fixed in contract |
| F-ACT-R14-14 | S1/S2 | P1 / Writer-Cutover | V1-DOM, Main-Listener und Scriptload werden atomar ersetzt; Null-V1-Callsite plus echter V2-Commit sind Pflichtorakel. | S4 Isolation; S5 Recovery-/Commit-Smoke. | fixed in contract |
| F-ACT-R14-15 | S3 | P0 / Commit-Lifecycle | Begonnener Commit wird bei Logout/Destroy bis Settlement nicht lokal abgebrochen; danach Flush+Destroy ohne Discard. | Atomic Commit/Auth/Lifecycle contracts. | fixed in risk contract |
| F-ACT-R14-16 | S3 | P1 / Rollback-Cache | Explizite Produktpfade auf 4be058b1 plus v15-Worker statt pauschalem Evidence-Revert oder v13-Downgrade. | Lokaler inverse diff; S5 Fresh/Upgrade rollback smoke. | fixed in risk contract |
| F-ACT-R14-17 | S3 | P1 / Privacy-Event | `activity:changed` erst nach bestätigtem Commit und ohne Detailpayload. | Log-/Event-/Consumerreview. | fixed in risk contract |
| F-ACT-R14-18 | S3 | P1 / Android-Target | Ursprüngliches reales Deviceziel wurde durch D-ACT-R14-17 abgelöst; Debugpaket bleibt ausgeschlossen und kein Devicezugriff wird ausgeführt. | PRE05 führt Android transparent als deferred und nicht PASS. | superseded by owner scope |
| F-ACT-R14-19 | S3 | P1 / SW-Identity | CORE_ASSETS exakt identisch zu Productload-URLs/Queries; v14 vollständig, v15 V1-Rollback vollständig. | Cachecontract + Fresh/Upgrade/404 tests. | fixed in risk contract |
| F-ACT-R14-20 | S5.1 | P1 / historische Testorakel | Produktunreferenzierte R10/R11-Assertions auf den bereits beschlossenen R13/R14-Productload aktualisiert; aktive Contractpfade auf archivierte DONE-Postimages gerichtet; R13-Reporttest auf Shared Runtime. Keine Produkt- oder medizinische Runtimeänderung. | 293/293 Node, 45/45 Deno, R13/R14/R8/C3 PASS. | fixed |
| F-ACT-R14-21 | S5.2 | P1 / CodeRabbit-R10-Schutz | Absichtliche Ausnahme der einen R14-invalidierten R10-Productload-Contractdatei zusätzlich mit SHA-256 `e6d62f15...4f2a` geschützt; übrige 19 Negative Oracles bleiben Git-geschützt. | Invalidierter R10-Test 14/14, R8 PASS; CodeRabbit-Verifikation 0 Findings. | fixed |
| F-ACT-R14-22 | S5.3 | P2 / V1-Datenbaseline | 66er-R13-Basis hashgleich bewiesen; genau ein gültiger Zugang danach und vor G0 über den einzigen V1-Writer, ohne Payloadread. Neue Baseline 67/`b9807820...5d94`, invalid 0; V2 0/0/0. | Metadaten-/Hashprojektion, kein Write oder Delete. | accepted / rebaselined |
| F-ACT-R14-23 | S5.3/U10R | P1 / Android-DONE-Vertrag | D-ACT-R14-17: Android auf ausdrückliche Ownerentscheidung deferred, kein PC/ADB, kein erfundener PASS; Web/PWA-Funktionsnachweis bleibt Pflicht, Layoutpolishing später. | Ownerentscheidung im Zielvertrag, S5.5, Testmatrix und Device Evidence synchronisiert. | accepted / scope amended |
| F-ACT-R14-24 | S5.5 Rollback | P1 / Rollback-Validator | Exakte Tokenzählung im PowerShell-Tool von mehrdeutigem `String.Split(string)` auf `Regex.Matches(Regex.Escape(...))` umgestellt. Die sechs Produktpfade waren vor dem Fehlalarm bereits exakt restauriert; keine breitere Inverse. | Toolausgabe `R14_V1_PRODUCTLOAD_ROLLBACK_V15_READY`, PowerShell-Parser, gezielter Materialisierungscontract und Live-v15-Postimage PASS. | fixed |
| F-ACT-R14-25 | S5.5/U11 Diagnose + U11R2 Korrektur | P1 / produktiver V2-Commit / Semantikbindung | Productcontroller bindet den Data-Access-Commit an die pro Draft bereits gewählte selectedSemantics; exakt Request-ID/Payload/Semantik, ohne Semantik im RPC-Body. Neue Drafts v2, Recovery-v1 bleibt v1; keine SQL-/Auth-/Medizinänderung. | Echte Productcontroller→Data-Access-Regression, 299 Node, 84 Deno, 55 Syntaxchecks, Browser-Harness, v16/v17-Cutover-/Rollbackcontracts und native Fullreviews PASS. Produktiver Reproof offen. | fixed locally / productive reproof pending |
| F-ACT-R14-26 | zweites S5.5/S5.6 + lokaler Reproof | P1 / produktiver Sessionabschluss / reale UI-Composition | Redundantes `setAuthenticated(true)` setzte durch erzwungenes Entry-Reconcile eine offene Session auf `recoverable/entry`. Minimalfix erhält die aktive Fläche; vollständiger Last-Mile-Pfad lokal bewiesen. Historischer Produktionsfehler bleibt bewusst nicht monokausal zugeschrieben. | Fünf Browserfälle, 303 Node, 84 Deno, 57 Syntax und Fullreviews PASS; v18/v19 releasebereit. Produktiver Write-/Reader-/Delete-Reproof offen. | fixed locally / productive reproof pending |
| F-ACT-R14-27 | lokaler Recovery-Harness | P2 / Testorakel / Lease-Token | Deterministischer UUID-Zähler kollidierte nach simuliertem Reload nur testintern mit dem gespeicherten Lease-Token; Resume-Sequenz getrennt. | Recovery-Browsermodus und vollständige Matrix PASS; kein Produktvertrag betroffen. | fixed |
| F-ACT-R14-28 | v18 S5.5 / lokale Closure | P1 / Recovery-Draftalter / Commit-Preflight | Bestehende 1440-Minuten-Grenze bewirkt INVALID_TIME/duration_min vor Persistenz oder Transport; write-freier Preflight nutzt denselben Intentvalidator ohne Draft-/Request-ID-Mutation. | Direkter Altersvertrag und vier reale Viewport-/Inputpfade; Transportstub 0. | fixed locally |
| F-ACT-R14-29 | v18/v19 S5.5 / lokale Closure | P1 / Viewport-Scroll und schneller SW-Rollback | Overlays aus transformiertem Hubpanel gelöst; direkte und transitive v20/v21-URLs, releaseeigene Cache-Lookups und vollständige Materialisierungsroundtrips lokal ergänzt. | Viewport 4/4, echte v19→v20-/v20→v21-Wechsel und Fresh-v20→Offline PASS. | fixed locally / final review PASS |
| F-ACT-R14-30 | v18/v19 Auswertung / lokale Closure | P1 / Privacy / produktive Browserdiagnostik | calcMAP-Diagnostik auf abstrakte calculator_exception/aggregation_exception-Codes reduziert; keine Werte, Kontexte oder rohen Fehler. | Privacy-Negativvertrag 2/2 und R8 unsafe_diagnostics=0. | fixed locally |
| F-ACT-R14-31 | Dirty-Stop-Closure + Repair | P1 / Release-Materialisierung | Fehlenden Doctor-Chart-Workerasset in v20/v21 am eindeutigen Main-Anker ergänzen; bekannte EOF-Leerzeilen in v18-index und V1-main normalisieren. | Direkte Contracts, beide isolierten Materializer, `git diff --check` und finaler nativer Rollbackreview PASS. | fixed locally / final review PASS |
| F-ACT-R14-32 | bounded Red Team + Repair | P1 / transitive ESM-/Offline-Cachekohärenz | Alle 18 Supabase-/Boot-Module besitzen pro Release dieselbe Queryidentität; `CORE_ASSETS` installiert den vollständigen Graph. Materializer normalisieren v20/v21 deterministisch. | Negative Mischreproduktion vor Fix; danach echter v19-Worker→v20-HTML, v20→v21 und Fresh-v20→Offline, 306 Node, 44 Syntax, zwei Parser und Fullreviews PASS. | fixed locally / productive reproof pending |
| F-ACT-R14-33 | Usage-Hotfix vor S5.4 | P1 / Reserve-, Closure- und Owner-Boundary-Zuordnung | Erst wurden statische 25/10-Schwellen als Kosten addiert; danach sperrte die einheitliche 81/21-Grenze U11R13 80/66 weiterhin um einen Sensorpunkt trotz Ownerannahme. | D-ACT-R14-25: 71/11 bis zur sicheren technischen Postcondition plus 1/1 ergibt Operational Safety Floor 72/12, effektiv 72/21. Mit zusätzlicher echter CLOSURE_ONLY-Messung 9/2 ergibt sich Autonomous Full-Closure Floor 81/14, effektiv 81/21. Owner Boundary darf nur die umfassende administrative Closure vertagen. Raw Preferred 107/17 bleibt advisory und `PREFERRED_UNATTAINABLE`. | fixed in process contract / boundary accepted |
| F-ACT-R14-34 | v20 S5.4 + lokaler Retest | P2 / Privacy / produktive Browserdiagnostik | `app/supabase/api/intake.js` lokal auf abstrakte Start-, Ergebnis- und Fehlercodes reduziert; Rückgabe-, Transport-, Persistenz- und Fehlerobjektvertrag unverändert. | Intake-/Vitals-Privacy, lokales Productbrowser-Orakel und alle releaseinvalidierten Checks PASS; F34-eigene sensitive Treffer 0. Allgemeiner F35-Privacyfund bleibt transparent offen. | fixed locally / productive reproof pending |
| F-ACT-R14-35 | lokaler F34-Retest | P2 / Privacy / gemeinsamer Intake-Stack | Reales Browserorakel zählt 36 sensitive-pattern Treffer ohne Inhaltsausgabe. Frischer Klassifikationslauf weist 24 day-Label-Treffer 16 Capture-Refresh- und 8 Medication-Diagnosen zu; statische Analyse klassifiziert 42 Prüfkandidaten in `app/modules/intake-stack/intake/index.js`. | Gemäß D-ACT-R14-27 im separaten Repair-Bugreport erhalten; kein bewiesener V2-Funktionsfehler und keine übereifrige R14-Aufräumwelle. Kein allgemeiner MIDAS-Privacy-PASS. | open / shared repair backlog |
| F-ACT-R14-36 | fokussierte V2-Blockeranalyse | P1 / Recovery-Draft / produktiver Smoke | Der erhaltene Draft überschreitet die bewiesene 1440-Minuten-Grenze und bleibt durch den write-freien Preflight unverändert. Der Single-Draft-Controller erlaubt einen neuen Draft erst nach leerem Recoveryzustand; vorhandener normaler UI-Discard ist bestätigungspflichtig. | D-ACT-R14-28 erlaubt im nächsten separat freigegebenen v22/v23-Fenster den sichtbaren normalen UI-Discard. Danach frischer Katalog-v2-Draft mit neuer Request-ID; keine stille Mutation oder Datenbanklöschung. | owner-resolved / productive execution pending |
| F-ACT-R14-37 | v22 S5.5 + lokaler Repair | P1 / produktiver V2-Abschluss / Recovery-Intentprojektion | Ursache bewiesen und minimal korrigiert: Recovery verglich den payloadseitig korrekt kompaktierten Setgraph mit allen drei Draftzeilen. Recovery verwendet nun dieselbe Projektion nichtleerer zusammenhängender Sets wie Commit; nur leere Schlusszeilen werden ausgelassen, Lücken/all-empty bleiben fail-closed. | Exakter Produktionsdraft-Replay vor/nach Fix, Last-Mile 4/4+1/1, 317 Node, Release-/Offline-/Syntax-/Parserchecks und native Fullreviews PASS. Kein produktiver Write; v24/v25-Reproof offen. | fixed locally / productive reproof pending |

### Dirty-Stop Recovery Receipt 2026-09-06

- Letzte sichere Produktpostcondition: HEAD/origin `4e87729e94131d75d870f9cfb99e8141ecd09f21`,
  Pages-Run `33358569779`, V1 alleiniger Writer, V2-Capture nicht im
  Productload, zwei R13-Readerloads und Root-SW v17. Die sechs Produktpfade
  entsprechen HEAD; keine neue externe Wirkung.
- Der abgebrochene Block änderte ausschließlich den direkten
  Productcontroller-Vertrag und drei ungetrackte lokale Last-Mile-Harness-
  Dateien. Productcontroller und Productload blieben unverändert.
- Aktuelle Fingerprints: Productcontroller `d30e7b8a...c7c0`, Test
  `e3c4028d...b1bdb`, Harness-HTML `63d7da4a...a2b`, Harness-JS
  `116aff66...bd56`, Harness-Contract `8562262a...ffc68`.
- Vor dem letzten Patch waren Browserläufe für Erfolg, Unknown plus identischen
  Retry, Recovery, Misdirect und Reauth sowie Syntax/3-of-3-Harnesscontract
  abgeschlossen. Wegen der danach geänderten Quellen gelten sie nicht als
  aktuelles Releaseorakel. Nach dem Patch lief kein Test; kein Testprozess ist
  offen.
- U12R3 am 2026-09-05T20:41:30+02:00 lieferte 95 % 5h / 85 % Woche und
  CONTINUE. Der Block endete später als echter Usage-DIRTY-STOP. Das nächste
  Gate ist eine neue POST_REHYDRATION_BASELINE; Rehydration bleibt SUNK_USAGE.
- U12R4 am 2026-09-06T05:44:05+02:00 ist valide: 86 % 5h / 68 % Woche,
  Resetidentitäten 1788683876/1788755765, `CONTINUE / PRIMARY_ALLOWED`.
  Mangels dokumentierter gleicher U12R3-Resetidentität wird kein Delta
  berechnet. Der kohärente lokale Diagnose-/Fix-/Validierungsblock ist
  zugelassen; nach seinem Abschluss folgt zwingend ein neuer Sensorcheckpoint.

### Lokaler F-ACT-R14-26-Abschlussnachweis 2026-09-06

- Negative Regression reproduzierte den Lifecycle-Reset; ein neutraler
  `reconcileProductState()`-Aufruf ist der einzige Produktcodefix.
- Browser-Plugin nicht verfügbar; dokumentierter Playwright-Fallback mit
  installiertem Edge. Erfolg, Unknown/identischer Retry, Reload-Recovery,
  Misdirect und Reauth `5/5 PASS`; keine Console-/Page-Errors.
- Harness-False-Failure F-ACT-R14-27 durch kollidierende deterministische
  Lease-UUID bewiesen und ausschließlich im Harness korrigiert.
- Matrix: Node `303/303`, Deno `84/84`, Syntax `57/57`, `git diff --check`
  sowie native Code-/Contract-/Security-/Privacy-/Cache-/Lifecycle-/Rollback-/
  Consumerreviews PASS. Backend-/Supabase-Diff 0, Secretkandidaten 0,
  Produktlog-Additionen 0, Harness-Productloadreferenzen 0.
- Lokales Release: Root-SW v18; geprüfte V1-Inverse v19. Null V1-
  Writercallsite, ein V2-Controller, zwei R13-Readerloads. Produktion bleibt
  unverändert 4e87729/v17 mit V1 als einzigem Writer.
- Fingerprints und 19-Dateien-Manifest sind als EV-ACT-R14-L12 eingefroren.
  Der historische Produktionsfehler wird erst durch einen echten erfolgreichen
  Write-/Reader-/Delete-Reproof endgültig geschlossen.
- U12R5 am 2026-09-06T06:02:49+02:00 ist valide: 42 % 5h / 61 % Woche,
  Resetidentitäten 1788683876/1788755765, statisch `CONTINUE`. Delta seit
  U12R4: 44/7 Punkte. Die harte unverteilbare Produktivreserve von mindestens
  89 % 5h und über 20 % Woche ist nicht erfüllt; daher
  `PRIMARY_REJECTED_FOR_RESERVE`, kein Commit, Push, Deploy oder Write.
- U12R6 am 2026-09-06T10:45:59+02:00 ist valide: 94 % 5h / 55 % Woche,
  Resetidentitäten 1788702263/1788755765, `CONTINUE`. Der 5h-Reset wurde
  überschritten; die Messung ist POST_REHYDRATION_BASELINE. Manifest,
  21-Dateien-Scope und 4e87729/v17-Preimage sind unverändert, die harte
  89/20-Grenze ist erfüllt. `PRIMARY_OWNER_BOUNDARY_ALLOWED`; D-ACT-R14-22
  wird ohne erneute Freigabe im atomaren v18/v19-Fenster ausgeübt.

### V18/V19-Produktivfenster 2026-09-06

- Cutover `0fa44e29536a604256638057d4e54a9e593b8bab`, Pages-Run
  `34022878621`, Live-Index `233d4429...cd1`, Live-SW
  `102c1fe7...8dd7`, Root-SW v18. V1/V2/R13-Productload `0/1/2`;
  Fresh, Upgrade, stale-client und Recovery PASS.
- Produktiver Vorherstand: R13 `midas.activity-consumer.v1`, 69 reine
  V1-Units, 0 Mixed-Source-Tage, geschützter ID-Hash `459f2056...007d`.
  Die zwei Zugänge gegenüber PRE02 entstanden im weiterhin alleinigen
  V1-Writerzeitraum. V2 `0/0/0`, alle ID-/Request-ID-Leerhashes
  `4f53cda1...b945`.
- Owneraktion genau einmal per Enter nach Tastaturfokussierung des visuell
  nicht erreichbaren Abschlussbuttons. Bekannte Eingabevalidierung vor jedem
  Committransport; kein Retry, keine V2-Zeile, kein Dual Write und kein Delete.
  Recovery-Draft und Eingaben blieben erhalten. F-ACT-R14-28/-29 offen.
- Rollbacktool lieferte nach notwendigem kanonischem ExecutionPolicy-Bypass
  `R14_V1_PRODUCTLOAD_ROLLBACK_V19_READY`; der erste direkte Aufruf war lokal
  vor Ausführung blockiert und hatte keine Wirkung. Rollbackcontract und
  Syntaxchecks PASS.
- Rollback `3857bf4e03d2ad6e0af7c2c3c3ec6ce3d29aab58`, Pages-Run
  `34023954044`, Live-Index `48cd9e0a...c6c`, Live-SW
  `0e35a08b...a6de`, Root-SW v19. V1/V2/R13 `1/0/2`; alle 37 Coreassets 2xx.
  Ein isolierter frischer Edge-Client bootete ohne Bootfehler mit V1-Form und
  ohne V2-Host/-Controller. Der alte v18-Client blieb im schnellen Cache-Mix
  fail-closed und ist Teil von F-ACT-R14-29.
- Produktives Nachbild: V1 69 mit unverändertem Hash, V2 0/0/0 mit
  unveränderten Leerhashes; R13 weiterhin 69 reine V1-Units und 0
  Mixed-Source-Tage. Keine Datenmutation oder Datenlöschung.
- U11R4 `2026-09-06T11:17:12+02:00`: gültig, 23 % 5h / 44 % Woche,
  `SAFE_CLOSURE`. Nur Status-/Evidence-/Findings-/Resume-Sync; S5.6, S6,
  DONE und Archivierung bleiben gesperrt.

### Dirty-Stop-Closure F-ACT-R14-28..31 2026-09-06

- Rehydration: HEAD/origin `3857bf4e...ab58`, keine laufenden R14-Prozesse,
  Produktion weiterhin V1/v19 und V2 0/0/0. Roadmap/Evidence waren gegenüber
  dem lokalen F28-F30-Stand veraltet.
- U11R5 `2026-09-06T21:36:13+02:00`: 96 % 5h / 24 % Woche, gültig,
  `CONTINUE`; POST_REHYDRATION_BASELINE, Rehydration SUNK_USAGE.
- U11R6 `2026-09-06T21:40:52+02:00`: 87 % 5h / 22 % Woche, gültig,
  `CONTINUE`; 9/2 Punkte seit U11R5. Kein automatischer Repairblock gemäß
  Sessionvertrag.
- U11R7 `2026-09-06T21:44:37+02:00`: 81 % 5h / 21 % Woche, gültig,
  `CONTINUE`; enger F31-Repairblock durch neuen Ownerauftrag zugelassen.
- U11R8 `2026-09-06T21:50:28+02:00`: 69 % 5h / 19 % Woche, gültig,
  `CONTINUE_WITH_CAUTION`; Repairblock und Dokumentationspostconditions
  vollständig, kein weiterer Block in derselben Restricted-Work-Episode.
- F28: alter Draft reproduzierbar INVALID_TIME/duration_min an 1440 Minuten;
  Preflight ist write-frei und erreicht keinen Transport.
- F29 Viewport: Overlayhosts außerhalb des transformierten Hubpanels;
  1280x720 Maus, 960x640 Tastatur, 390x844 Touch und 320x800 Touch PASS.
- F30: sensible calcMAP-Diagnostik entfernt; Negativvertrag 2/2 PASS.
- Abgeschlossene Nachweise vor letzter Cache-Nachschärfung: Node 303/303,
  Deno 84/84, Syntax 66/66, drei Browser-Smokes und R8/R13 PASS. Danach
  21/21 konkret invalidierte Node-Verträge PASS.
- F31 stoppt die Closure: Der isolierte v20-Materialisierer findet im
  eingefrorenen v18-Worker keinen Doctor-Chart-Token und bricht vor Wirkung ab.
  Der v21-Lauf wurde deshalb nicht begonnen; beide Temp-Worktrees wurden
  entfernt. Kein Produktfix, Commit, Push, Deploy oder Write.
- Aktueller 35-Dateien-Code-/Testscope:
  `2a9bb7f9e1a3a5aa7356a8904789d9d839273facbf6278898449f81662b0812c`.
- Im getrennt freigegebenen Repairblock ergänzt v20/v21 den fehlenden
  Chartasset deterministisch am Main-Anker. Bekannte EOF-Leerzeilen der
  eingefrorenen Quellpostimages werden normalisiert. 8/8 direkte Contracts
  und der isolierte v20/v21-Roundtrip samt diff-check PASS. Finaler nativer
  Review und verbleibende lokale Product-/Offline-Smokes stehen noch aus.

### Bounded Red Team F-ACT-R14-32 2026-09-06

- Scope: ausschließlich statische Navigation-, ESM-, Consumer- und
  Offline-Cacheanalyse. Kein Fix, Testlauf, Browserzugriff, Commit, Push,
  Deploy oder produktiver Zugriff.
- Der Worker behandelt Navigation network-first. Ein alter v19-Worker kann
  daher bereits v20-HTML liefern, bevor der neue Worker die Kontrolle besitzt.
- Der versionierte Supabase-Einstieg lädt `auth/core.js?v=20`, während neun
  reale transitive Supabase-Importer weiterhin `auth/core.js` ohne Query laden.
  Die v19- und lokalen v20-Corequellen besitzen unterschiedliche Blobs; damit
  können zwei tatsächlich verschiedene Auth-/Lifecycle-Module gleichzeitig
  instanziiert werden.
- Dasselbe Release enthält auch eine geänderte Vitalsquelle. Der Mischzustand
  liegt somit genau in einem für Capture und Auth relevanten Consumergraphen.
- `CORE_ASSETS` installiert nur den versionierten Einstieg, nicht dessen
  vollständigen transitiven ESM-Graph. `cache.addAll` verfolgt Modulimporte
  nicht rekursiv; ein Fresh-Install mit sofortigem Offline-Reload besitzt daher
  kein bewiesenes vollständiges Releasepostimage.
- Die vorhandenen Orakel prüfen entweder genau ein Runtimeasset oder einen
  frischen Online-Productboot. Sie beweisen weder die transitive Modulidentität
  unter altem Controller noch den ersten Offline-Reload.
- Ergebnis: `F-ACT-R14-32 P1 OPEN`; F29-Cache erneut geöffnet. Eigener späterer
  Repair-/Retestblock erforderlich.
- U11R9 `2026-09-06T22:01:28+02:00`: 55 % 5h / 17 % Woche, gültig,
  `CONTINUE_WITH_CAUTION`; 14/2 Punkte seit U11R8. Der einmalige bounded Block
  und seine Dokumentationspostconditions sind abgeschlossen. Kein zweiter
  Block in derselben Restricted-Work-Episode.

### F-ACT-R14-32 Repair- und Retestnachweis 2026-09-07

- U11R10 `2026-09-07T07:04:38+02:00`: 98 % 5h / 100 % Woche, gültig,
  `CONTINUE`; POST_REHYDRATION_BASELINE, Rehydration als SUNK_USAGE. Der
  vollständige lokale Diagnose-/Fix-/Retestblock war zugelassen.
- Negative Reproduktion vor Fix: Der partielle Graph lud über den direkten
  Root und das unversionierte `boot-auth.js` zwei Supabase-Rootidentitäten;
  transitive Importer erzeugten zusätzlich alte und neue Auth-Core-Identitäten.
  Das Browserorakel meldete erwartungsgemäß `partial_mixed=1`.
- Minimaler Produktfix: Alle relativen Imports der 17 Supabase-Module sowie
  `boot-auth.js` tragen `?v=20`; HTML und Root-Worker referenzieren dieselben
  URLs, und der Worker installiert alle 18 Graphknoten. Es gibt keine neue
  Auth-, Daten-, RPC-, SQL- oder medizinische Semantik.
- Cutover-/Rollbackfix: Beide Tools unterscheiden explizit zwischen acht aus
  dem eingefrorenen Produktpostimage restaurierten Pfaden und dem vollständigen
  ESM-Graph. Ein gemeinsamer, fail-closed Versionsnormalisierer erzeugt v20
  beziehungsweise v21 und lehnt verbleibende unversionierte relative Imports
  ab. Beide isolierten Materialisierungen und `git diff --check` sind PASS.
- Reale Browserpfade: lokaler v20-Productboot plus sofortiger Offline-Reload;
  echter v19-Worker mit wartendem v20-Worker und v20-HTML; echter v20-Worker
  mit wartendem v21-Rollback; zusätzlich synthetisches Negativ-/Positivorakel.
  Alle Pfade blieben je Release bei genau einer Root-/Auth-Core-Identität und
  dem erwarteten V2- beziehungsweise V1-Productload.
- Regressionen: 306/306 relevante Node-Verträge, 44/44 Syntaxchecks der
  geänderten JS-/MJS-Dateien, 2/2 PowerShell-Parser, C3/R8/R13, Last-Mile
  4/4, lokaler Productbrowser und beide Releasebrowser PASS. 84/84 Deno bleiben
  gültig und wurden nicht wiederholt: Backend, SQL und Deno-Orakel besitzen
  Diff 0.
- Native Delta-, Contract-, Security-, Privacy-, Cache-, Lifecycle-, Rollback-
  und Consumerreviews PASS. Neue Secretmaterie 0, Backend-/SQL-/Android-Diff 0,
  keine neue produktive Diagnose und kein offenes lokales P0/P1-Finding.
- Manifest: 49 Code-/Testdateien,
  `333a34691d5082f3a69a9de1c162dacb2530362bd9bba99372332eebbfd0db95`.
  Algorithmus: SHA-256 über UTF-8 der ordinal sortierten Zeilen
  `Pfad=Datei-SHA256`, verbunden durch LF, ohne abschließendes LF. Mit Roadmap
  und Evidence umfasst der nächste mögliche P1-Scope 51 Dateien.
- Keine externe Wirkung: HEAD/origin und Produktion bleiben `3857bf4` / V1 /
  Root-SW v19; V2 bleibt 0/0/0. F32 ist lokal geschlossen. Produktiver Write-,
  Reader- und Delete-Reproof bleiben offen. D-ACT-R14-23 erteilt das neue
  gemeinsame P1/P2 konditional, wurde an U11R12 aber nicht ausgeübt.
- U11R11 `2026-09-07T07:34:05+02:00`: 29 % 5h / 89 % Woche, gültig,
  `CONTINUE_WITH_CAUTION`; 69/11 Punkte seit U11R10. Der lokale Block und alle
  Postconditions sind vollständig; kein neuer Block in derselben Restricted-
  Work-Episode.
- U11R12 `2026-09-07T12:15:54+02:00`: 95 % 5h / 83 % Woche, gültig,
  `CONTINUE`; historisch als `PRIMARY_REJECTED_FOR_RESERVE` gestoppt. F-ACT-
  R14-33 korrigiert diese Entscheidung als RESERVE_MISCLASSIFICATION. Der
  spätere D-ACT-R14-25 trennt Operational Safety Floor 72/12 beziehungsweise
  effektiv 72/21 von Autonomous Full-Closure Floor 81/14 beziehungsweise
  effektiv 81/21. Raw Preferred 107/17 ist im 5h-Bucket
  PREFERRED_UNATTAINABLE. Kein
  Preflight, Commit, Push, Deploy oder produktiver Write wurde begonnen; wegen
  Zeitablauf bleibt ein frisches Gate Pflicht.

## Externer Review-Nachweis

- CodeRabbit Initial:
  - `2026-08-29; kanonischer coderabbit 0.7.5/authenticated; uncommitted Review; 1 Major Finding zur R10-Orakelausnahme.`
- CodeRabbit Verifikation:
  - `2026-08-29; genau ein Verifikationslauf nach Fingerprint-Härtung; 0 Findings. Kein dritter Lauf.`
- Offene P0/P1:
  - `Keine offenen lokalen P0/P1-Findings. F32 ist mit vollständigem
    Supabase-ESM-Graph und realen Offline-/Releasewechseln lokal geschlossen.
    Der produktive Write-/Reader-/Delete-Reproof bleibt ein Pflichtgate und
    benötigt neues gemeinsames P1/P2; kein dritter CodeRabbit-Lauf.`

## Rollback-Nachweis

- Preimage:
  - `Pages 4be058b1 / Run 33162838336; index.html
    6d932c67c127b898f17951d829132a00da07358671569444a42ab02560e00cc5,
    main.js c05b1814f3a922bdb23d07486d7f8cfc04bc4dc3292b6058b86446d83b17f10d,
    Activity V1 f3a4eff3248f2ce3778ec1b99bf902bae58c69892a64864363767d70c944d8d8,
    Root-SW 09aff49364731f85e400ae24d0be54ab4a3b2a8a8fc01b732191cbcf95167ddd.`
- Lokale Inverse:
  - `tools/activity-v2-r14-v1-productload-rollback.ps1` ist mit
    `-ConfirmRollback` fail-closed. Es restauriert acht explizite Produktpfade
    aus 4be058b1, bewahrt die übrigen lokalen Reparaturen, normalisiert den
    vollständigen 18-Dateien-Supabase-/Boot-Graph auf v21 und erzeugt Root-SW
    v21 mit V1 als einzigem Writer. Roadmap/Evidence, SQL, V1-/V2-Daten,
    Recoveryrecords und fremde Dirty-Dateien sind nicht Teil der Inverse.
    Isolierte Materialisierung und reale v20→v21-Browsertransition PASS.`
  - `Aktueller Toolfingerprint nach F31/F32:
    a19144c74e4c970bac2777cf2d3402a989c1a3ed1c87084faa6e75c4fd21b2ed.`
- Inverse:
  - `nur R14-Web-/Productload-Diff zurücknehmen; keine SQL-/Reader-/Dateninverse.`
- Datenpostcondition:
  - `V1 und bereits persistierte V2-Daten bleiben erhalten.`
- Devicepostcondition:
  - `kein Uninstall, kein Data-Clear, kein physisches Recoveryrecord-Delete.`
- Ergebnis:
  - `PASS. Bedingter Rollback nach fehlgeschlagenem Pflicht-Write ausgeführt:
    Commit ce2e18dab3704a419b6f07fab116d14132e6ffbb, Pages-Run 33296959317.
    Live V1-Form/Script 1/1, V2-Productcontroller 0, R13-Readerloads 2,
    Root-SW v15. Index SHA-256 f6457fe0...9523, Service Worker
    95d2922f...12da. Alte v14-Clients kontrolliert geschlossen; frischer v15-
    Client bootet ohne Fehler in die V1-Trainingsmaske. Kein Storage-Clear und
    keine Gesundheitsdatenlöschung.`
  - `PASS zweites Fenster. Der v16-Pflicht-Write und genau ein identischer
    Retry blieben ohne Persistenz; anschließend materialisierte das Tool mit
    -ConfirmRollback ausschließlich die sechs Produktpfade und Root-SW v17.
    Rollbackcommit 4e87729e94131d75d870f9cfb99e8141ecd09f21,
    Pages-Run 33358569779 completed/success. Live V1-Script 1,
    V2-Productcontroller 0, R13-Readerloads 2, Root-SW v17. Index SHA-256
    552f347470237b9928368e5a29d4b2280ce5fcf26c6172424867a11b47cc437d,
    Service Worker
    1b5006812dd742e5d3d93a5180d86193a56d57c22843a0c9b2db2ed183944038.
    Nach vollständigem Schließen alter kontrollierter Clients bootete ein
    frischer V1-Client ohne Fehler in die V1-Trainingsmaske. V1 blieb 67,
    V2 0/0/0; kein Storage-Clear und keine Gesundheitsdatenlöschung.`

## Finaler Evidence-Digest

### Aktuelles Postimage 2026-09-08

- V18-Cutover `0fa44e2` / Run `34022878621` und Web/PWA-/Recovery-Smokes
  PASS; produktiver Abschluss vor Transport fail-closed, kein Retry und kein
  Write. V19-Rollback `3857bf4` / Run `34023954044` PASS.
- Live v19: V1 alleiniger Writer, V2-Capture nicht im Productload, zwei
  unveränderte R13-Readerloads. Isolierter frischer V1-Client PASS; schneller
  alter v18-Client bleibt als F-ACT-R14-29 fail-closed.
- Daten: V1 69 mit Vor-/Nachhash `459f2056...007d`; V2 0/0/0 und
  Leerhashes `4f53cda1...b945`; keine Mutation oder Löschung. R13 69 reine
  V1-Units, 0 Mixed-Source-Tage.
- Lokale Closure: F28, F30, F29, F31 und F32 sind lokal grün. Der vollständige
  18-Dateien-Supabase-/Boot-Graph ist in v20/v21 releasekohärent und offline
  installierbar. Echte v19→v20-/v20→v21-Wechsel und Fresh-v20→Offline sind
  PASS; 49-Dateien-Manifest `333a3469...db95`. R14 bleibt OPEN, weil der
  produktive Write-/Reader-/Delete-Reproof noch fehlt. Android bleibt
  `DEFERRED BY OWNER / NOT PASS`.
- Usage: U11R13 80 % 5h / 66 % Woche, `CONTINUE` und
  `POST_REHYDRATION_BASELINE`; PRE08 ist PASS. F-ACT-R14-33 und
  D-ACT-R14-24/-25 setzen Operational Safety Floor 72/12 beziehungsweise
  effektiv 72/21 sowie Autonomous Full-Closure Floor 81/14 beziehungsweise
  effektiv 81/21. Raw Preferred 107/17 bleibt `PREFERRED_UNATTAINABLE` und
  advisory. U11R13 erfüllt die operative Boundary; Stephan hat das reine Risiko
  einer späteren administrativen Closure ausdrücklich akzeptiert. D-ACT-R14-23
  war zu diesem Zeitpunkt erteilt und noch nicht ausgeübt. Der abgeschlossene Guard-Hotfix führte zu
  U11R14 59/62 und kostete 16/3; damit beginnt in diesem Bucket kein
  Produktfenster. D-ACT-R14-23/-25 bleiben für das nächste effektive
  72/21-Gate gültig; Produktion bleibt unverändert und R14 OPEN.
- U11R15 2026-09-07T22:40:33+02:00 liefert nach dem 5h-Reset 98/53,
  `CONTINUE / PRIMARY_ALLOWED`. PRE08, 49-Dateien-Manifest, 51-Dateien-Scope
  und v19-Postimage sind unverändert. D-ACT-R14-23/-25 werden im atomaren
  v20/v21-Fenster ohne Zwischenpoll ausgeübt.
- Das v20/v21-Fenster endete sicher mit Rollback: Cutover `2dbfa3c` / Run
  `34160428748`; produktive sensible Capture-Diagnostik vor jedem V2-Write als
  F-ACT-R14-34 erkannt. Kein Write, Retry oder Delete. Rollback `40c4b93` /
  Run `34160860095`; Live-Index `1e68bef3...ecb7`, Live-SW
  `33c99bcd...b573`, V1/V2/R13 1/0/2, Root-SW v21. Frischer aktualisierter
  V1-Client bootet ohne Fehler. V1 69 mit geschütztem Hash
  `459f2056...007d`, V2 0/0/0 mit Leerhash `4f53cda1...b945`; keine
  Datenmutation oder Löschung. R14 bleibt OPEN.
- U11R16 2026-09-07T23:02:12+02:00: 58/46, gültig und `CONTINUE`;
  40/7 seit U11R15 für vollständiges Atomfenster einschließlich sicherem
  v21-Rollback und minimalem Postimage. Kein Diagnose-/Repairblock angehängt;
  Resume vor F-ACT-R14-34.
- F34 wurde anschließend read-only exakt auf die seit 4be058b1 bestehende
  Shared-Intake-Diagnostik eingegrenzt. F30 war auf `vitals.js`/calcMAP
  beschränkt. Minimalfix, Privacy-Negativvertrag, inhaltsfreies Browserorakel
  und monotone v22/v23-Releasefolge sind vorbereitet; Produktcode und
  Produktion blieben unverändert.
- U11R17 2026-09-07T23:13:05+02:00: 43/44, gültig und
  `CONTINUE_WITH_CAUTION`; 15/2 seit U11R16 für genau diesen bounded
  Diagnose-/Vorbereitungsblock. Der Block ist vollständig geschlossen; kein
  Fix-/Retestblock wird in derselben Restricted-Work-Episode begonnen.
- U11R18 2026-09-08T07:18:55+02:00: 97/99, gültig und `CONTINUE`;
  `POST_REHYDRATION_BASELINE`, Rehydration ist SUNK_USAGE. Der kohärente
  F34-Repair-/Retestblock wurde zugelassen.
- F34 ist im API-Modul lokal minimal korrigiert. Intake-/Vitals-Privacy 4/4,
  21/21 direkt invalidierte Contracts, C3/R8/R13, Parser, Syntax und das
  synthetische v21→v22/v22→v23-Releasebrowserorakel sind PASS. Das reale
  Productbrowser-Orakel meldet jedoch 36 sensitive-pattern Treffer ohne
  Inhaltsausgabe und öffnet F35 P1 im gemeinsamen Intake-Stack. Produktion
  blieb unverändert; kein Manifest, Preflight, Commit, Push, Deploy oder Write.
- U11R19 2026-09-08T07:39:48+02:00: 66/95, gültig und `CONTINUE`; 31/4 seit
  U11R18 für F34-Repair, v22-Materialisierung, direkte Revalidation,
  Browserorakel, F35-Eingrenzung und sichere Dokumentationspostcondition.
  Kein zweiter Fixblock nach dem neuen P1-Finding; sichere Pause vor F35.
- U11R20 2026-09-08T07:52:14+02:00: 57/93, gültig und `CONTINUE`;
  `POST_REHYDRATION_BASELINE` für den neuen Ownerauftrag. Zugelassen wurde nur
  der begrenzte Repair-Bugreport mit fokussierter V2-Blockeranalyse.
- D-ACT-R14-27 trennt F35 als bestehenden gemeinsamen MIDAS-Repairbacklog von
  der Activity-V2-Funktionsclosure. F35 bleibt offen und ein allgemeiner
  Privacy-PASS bleibt unzulässig; es wird aber keine umfassende Intake-
  Aufräumwelle an R14 angehängt. Der neue Bugreport erfasst F01-F35 vollständig.
- F36 beweist den echten aktuellen V2-Operatorblocker: Der erhaltene alte
  Recovery-Draft bleibt über der 1440-Minuten-Grenze nicht commitfähig. Der
  bestehende Single-Draft-Vertrag erlaubt einen frischen Smoke-Draft nur nach
  bewusst bestätigtem UI-Discard. Kein weiterer ungefixter V2-Codefehler wurde
  bewiesen und kein Produktcode geändert.
- U11R21 2026-09-08T08:02:35+02:00: 44/91, gültig und `CONTINUE`; 13/2 seit
  U11R20. Dokumentations-/Analyseblock vollständig geschlossen; kein Fix,
  Test, Preflight, Commit, Push, Deploy oder Write. Sichere Pause vor der
  ausdrücklichen F36-Ownerentscheidung und neuem passenden P1/P2.
- D-ACT-R14-28: Stephan erlaubt ausdrücklich, den alten Recovery-Draft samt
  bisherigen Eingaben und gespeicherter Request-ID nach dem v22-Boot sichtbar
  über „Entwurf verwerfen“ zu löschen. Danach wird ein frischer Katalog-v2-
  Smoke-Draft mit neuer Request-ID erstellt. Die Erlaubnis gilt erst innerhalb
  eines separat freigegebenen Cutoverfensters und autorisiert für sich keinen
  Commit, Push, Deploy oder Write. V1-/V2-Datenbankdaten bleiben unberührt.
- U11R22 2026-09-08T08:10:42+02:00: 36/90, gültig und `CONTINUE`; 8/1 seit
  U11R21 für F36-Erklärung, D-ACT-R14-28 und vollständigen Roadmap-/Evidence-/
  Repairreport-Sync. Kein zweiter bounded oder technischer Block; Resume ist
  bereit für ein frisches Gate vor lokaler Closure, Manifest und Preflight.
- U11R23 2026-09-08T12:24:23+02:00: 98/86, gültig und `CONTINUE`;
  `POST_REHYDRATION_BASELINE`, Rehydration ist SUNK_USAGE. Zugelassen wurde
  ausschließlich die F34-/Releaseinvalidierungsclosure, Manifestbildung und
  der produktive Read-only-Preflight.
- EV-ACT-R14-L18/PRE09: F34 ist lokal vollständig geschlossen. Drei
  Releasebrowserpfade und das reale lokale v22-Productbrowser-Orakel sind PASS;
  F34-eigene sensitive Treffer 0, bekannter F35-Shared-Zähler 36 ohne
  Inhaltsausgabe. 24/24 direkte Verträge, 13/13 Nachlauf, 31 Syntax, zwei
  Parser, diff-check und native Fullreviews PASS. Finales 50-Dateien-Manifest
  `179c9df6...29e1`; realer Git-P1-Deltascope 35 Code/Test plus drei R14-Dokus
  = 38 Dateien.
- PRE09 bestätigt read-only HEAD/origin/Pages `40c4b93`, Run 34160860095,
  V1/V2/R13 `1/0/2`, Root-SW v21, Auth 1/0 anonym, V1 69 mit unverändertem
  Hash `459f2056...007d`, V2 0/0/0 mit Leerhash `4f53cda1...b945`, Katalog
  78/80/0 sowie R13 69 reine V1-Units und 0 Mixed-Source-Tage. Kein Payloadread,
  Write oder Delete; die regulär erfassten Vitals berühren die Activity-
  Baseline nicht.
- U11R24 2026-09-08T12:48:39+02:00: 46/77, gültig und `CONTINUE`; 52/9 seit
  U11R23 für den vollständig geschlossenen lokalen Block. Produktion bleibt
  unverändert; die operative 72/21-Grenze ist in diesem Bucket nicht mehr
  erfüllt.
- D-ACT-R14-29: Stephan erteilt konditional gemeinsames P1/P2 für genau das
  vorbereitete v22/v23-Fenster einschließlich D-ACT-R14-28-Draftdiscard,
  genau eines V2-Smoke-Writes, Reader-/Dual-Write-Nachweisen, normalem R9-
  Smoke-Delete und vollständigem datenverlustfreiem v23-Rollback bei einem
  Pflichtfehler. Die Freigabe ist noch nicht ausgeübt. Bei einem nächsten
  frischen gültigen Gate ab 72/21 und unverändertem PRE09, Manifest und Scope
  ist keine erneute P1/P2- oder Boundary-Rückfrage erforderlich. Diese
  Freigabe wurde anschließend im unten dokumentierten v22/v23-Fenster
  vollständig ausgeübt und ist verbraucht.
- U11R25 2026-09-08T17:28:41+02:00: 91/70, gültig und `CONTINUE`;
  `POST_REHYDRATION_BASELINE`. PRE09, Manifest und 38-Dateien-Scope waren
  unverändert; D-ACT-R14-29 wurde ausgeübt.
- Das v22/v23-Fenster endete sicher mit Rollback: Cutover `42a0858` / Run
  `34245115560`; alter Recovery-Draft bestätigt über den normalen UI-Pfad
  verworfen, frischer Katalog-v2-Draft mit minimal gültigem Set erstellt.
  Genau ein Abschlussversuch führte unmittelbar zu „Activity V2 ist derzeit
  nicht verfügbar“. Kein Retry, Write oder Delete; Recovery blieb erhalten.
- Rollback `6c9e722` / Run `34247698890` ist vollständig PASS. Live
  V1/V2/R13 `1/0/2`, Root-SW v23, frischer aktualisierter V1-Client PASS.
  V1 bleibt 69 mit Hash `459f2056...007d`; V2 0/0/0 mit Leerhash
  `4f53cda1...b945`. Kein Payloadread und keine Datenmutation oder -löschung.
- U11R26 2026-09-08T18:00:18+02:00: 22/59, gültig und `SAFE_CLOSURE`;
  69/11 seit U11R25 für das vollständige Atomfenster samt v23-Rollback und
  sicherer Produktpostcondition. F37 bleibt offen; keine Diagnose in diesem
  Block. R14 bleibt OPEN und S6 gesperrt.
- Dirty-Stop-Recovery 2026-09-09: eindeutig und ohne halbfertige externe
  Wirkung. HEAD/origin/Pages bleiben `6c9e722` / Run 34247698890; Live bleibt
  V1-only mit Root-SW v23 und V2 0/0/0. Kein laufender Testserver oder
  unklarer temporärer Worktree blieb zurück.
- U11R27 2026-09-09T07:32:25+02:00: 94/40, gültig und `CONTINUE`;
  `POST_REHYDRATION_BASELINE`, Rehydration ist SUNK_USAGE. Zugelassen wurde
  ausschließlich die lokale F37-Closure, invalidierte Revalidation, native
  Fullreviews, Manifest und PRE10; keine Produktivwirkung.
- EV-ACT-R14-L19: F37 ist lokal geschlossen. Der genaue Fehler war keine
  Runtimeunverfügbarkeit, sondern eine unterschiedliche Setprojektion in
  Commit und Recovery. Der exakte erhaltene Produktionsdraft scheiterte vor
  Fix mit `item.set_count`/Transport 0 und committed danach mit genau einem
  kontrollierten Transport. Keine Request-ID oder Payload wurde ausgegeben.
- Abschlussmatrix: 317/317 Node, Last-Mile 4/4 gealterte Viewports plus 1/1
  Discard/Fresh-Commit, C3/R8/R13, synthetische und reale v23→v24-/v24→v25-
  sowie Fresh-v24→Offline-Pfade, lokaler v24-Productbrowser, 39 Syntaxchecks,
  zwei Parserchecks, `git diff --check` und native Fullreviews PASS. Backend,
  SQL und Android unverändert; 84/84 Deno-Evidence bleibt gültig.
- Release-Manifest `e97f887b...b963` umfasst 57 Dateien. Der nächste reale
  Git-P1-Scope umfasst 43 Code-/Test-/Produktdateien plus Roadmap, Evidence
  und Repair-Findings, insgesamt 46 Dateien. Root-SW ist lokal v24; die
  geprüfte datenverlustfreie V1-Inverse ist monoton v25.
- PRE10 PASS: produktives v23-Postimage, Auth, Pages, geschützte Activity-
  Datenbaseline, Katalog und R13 sind read-only bestätigt. Der aktuelle
  begrenzte R13-Snapshot enthält 25 reine V1-Units und 0 Mixed-Source-Tage;
  dieses andere Zeitfenster ersetzt die frühere 69-Unit-Evidence nicht.
- D-ACT-R14-29 ist verbraucht. Vor einem v24/v25-Produktversuch ist ein neues
  ausdrückliches gemeinsames P1/P2 erforderlich. Bis dahin bleibt R14 OPEN,
  Produktion V1-only/v23 und S6 gesperrt.
- U11R28 2026-09-09T08:01:14+02:00: 39/31, gültig und
  `CONTINUE_WITH_CAUTION`; 55/9 seit U11R27 für den vollständig beendeten
  F37-Repair-/Revalidierungs-/Review-/Manifest-/PRE10-/Dokumentationsblock.
  Keine neue Arbeit in dieser Restricted-Work-Episode; sichere Pause am neuen
  P1/P2-Owner-Gate vor v24/v25.
- D-ACT-R14-30 2026-09-09: Stephan erteilt konditional gemeinsames P1/P2 für
  genau das vorbereitete v24/v25-Fenster. Umfang: dokumentierter 46-Dateien-
  Scope, Commit/Push/Pages, erhaltener frischer Recovery-Draft mit identischer
  Request-ID bei gültigem Preflight, genau ein V2-Smoke-Write, höchstens
  identischer Retry bei unbekannter Antwort, History/Detail/Export/R13 und
  Dual-Write-Nachweis, normaler R9-Delete nur des Smoke-Datensatzes sowie bei
  Pflichtfehler der vollständige datenverlustfreie v25-Rollback. Nach grünem
  S6 sind Abschlusscommit und Push freigegeben. Entscheidung noch nicht
  ausgeübt; Ausübung erst nach frischem erlaubendem Usage-/Driftgate.
- U11R29 2026-09-09T12:32:28+02:00: 92/25, gültig und `CONTINUE`;
  `POST_REHYDRATION_BASELINE`, Rehydration ist SUNK_USAGE. HEAD/origin/Pages,
  v23-Produktpostimage, PRE10, Manifest `e97f887b...b963` und 46-Dateien-Scope
  sind unverändert. Operational Floor 72/21 und Full-Closure-Floor 81/21 sind
  erfüllt; `PRIMARY_ALLOWED`. D-ACT-R14-30 wird ausgeübt und das atomare
  v24/v25-Fenster ohne Zwischenpoll begonnen.

### S5.6-Postimage 2026-08-31

- Cutover: `1b6e7164a26709246439e7609ddb3aa1a31aaf1f`, Pages-Run
  `33357905534`, Live-index `340d37e7...ea0a`, Live-SW
  `504ce2e5...f85c`, V1/V2/R13 `0/1/2`, Root-SW v16.
- Web/PWA: Fresh, Upgrade, kontrollierter stale-client und Recovery nach
  realistischem Tabwechsel PASS.
- Write: Original plus genau ein identischer Retry FAIL / NO WRITE. Draft und
  Eingaben erhalten; keine V2-Zeile, kein Dual Write und keine Datenlöschung.
- Rollback: `4e87729e94131d75d870f9cfb99e8141ecd09f21`, Pages-Run
  `33358569779`, Live-index `552f3474...437d`, Live-SW
  `1b500681...4038`, V1/V2/R13 `1/0/2`, Root-SW v17; frischer V1-Boot und
  V1-Trainingsmaske PASS.
- Daten/Reader: V1 67; V2 Sessions/Items/Sets 0/0/0; leere geschützte V2-ID-
  und Request-ID-Hashes `4f53cda1...b945`; R13-Schema
  `midas.activity-consumer.v1`, 67 Units, 0 Mixed-Source-Days.
- Android: `DEFERRED BY OWNER / NOT PASS`.
- Urteil: `POSTIMAGE COMPLETE / PRODUCT FAIL / V17 ROLLBACK PASS`; R14 bleibt
  offen und wird nicht archiviert.

- Lokale Evidence:
  - `F-ACT-R14-25 ist lokal geschlossen. Echte Controller→Data-Access-
    Composition, 299 Node-, 84 Deno-, 55 Syntaxchecks, git diff --check,
    isolierter Browser-Harness, Root-SW v16 und explizite v17-Inverse PASS.
    Native Fullreviews: keine offenen Findings, Backend-Runtime-Diff 0 und
    Secretmuster 0. Kein dritter CodeRabbit-Lauf.`
  - `Zusätzliches Hardening: 61/61 gezielt invalidierte Verträge, exakt 16
    Code-/Testdateien plus zwei R14-Dokumente, 16-Dateien-Manifest
    2b329d5a...4926b, null V1-Writercallsite, ein V2-Productmount und lokaler
    Edge-Boot mit einem V2-Controllerscript/null V1-Form/null Console-Errors.`
- Produktive Evidence:
  - `V2-Web/PWA-Productload und Recovery wurden über 1edbe38d/Run 33296179701
    bewiesen. Der Pflicht-Write blieb nach identischem Retry ohne Persistenz;
    deshalb kein Reader-/Delete-PASS und vollständiger v15-Webrollback.`
  - `Das zweite Fenster lieferte v16 über 1b6e716/Run 33357905534. Live-
    Productload, Fresh/Upgrade/stale-client und Recovery waren PASS. Der
    bestätigte Write und genau ein identischer Retry blieben real ohne
    Zustandsfortschritt und ohne V2-Persistenz; deshalb waren History/Detail/
    Export/Delete nicht ausführbar. Der vollständige v17-Rollback über
    4e87729/Run 33358569779 ist PASS.`
- Device Evidence:
  - `DEFERRED BY OWNER gemäß D-ACT-R14-17; nicht ausgeführt und nicht als PASS
    dokumentiert. Im revidierten R14-Scope kein DONE-Blocker, aber sichtbares
    Evidence-Gap für späteres Polishing beziehungsweise freiwillige Validation.`
- Restrisiken:
  - `F-ACT-R14-26 ist offen. Der produktive Reproof der lokal geschlossenen
    F-ACT-R14-25-Korrektur scheiterte erneut fail-closed. Bis zur bewiesenen
    Ursache, minimalen Korrektur, erneuten vollständigen Revalidierung und
    neuem P1/P2 bleibt Activity V1 über 4e87729/v17 produktiver Writer.
    Android bleibt transparent owner-deferred.`
  - `U11R2 2026-08-30T15:19:50+02:00: 98 % 5h / 84 % Woche, CONTINUE.
    Lokaler Korrekturblock abgeschlossen; neues Usage-Gate vor P1 offen.`
  - `Erneuerter PRE07 PASS. U10R3 2026-08-30T15:38:32+02:00: 52 % 5h /
    77 % Woche, CONTINUE; Briefing erlaubt, atomares Fenster wegen fehlender
    empirischer 1,5-Reserve 96/15 noch gesperrt.`
  - `U10R4 2026-08-30T15:47:10+02:00: 36 % 5h / 75 % Woche,
    CONTINUE_WITH_CAUTION. Der kurze lokale Hardeningblock ist vollständig
    synchronisiert; kein Commit, Push, Deploy, Write oder Delete begonnen.`
  - `U10R5 2026-08-30T15:50:39+02:00: 33 % 5h / 74 % Woche,
    CONTINUE_WITH_CAUTION. Ein kurzer lokaler Block hat ausschließlich die
    symbolgenaue S6-Deltamap in der Roadmap vorbereitet. README, Module
    Overviews, Masterplan, QA und Changelog bleiben bis zum grünen produktiven
    S5.6-Postimage wahrheitsgemäß unverändert.`
  - `U10R6 2026-08-30T15:52:02+02:00: 30 % 5h / 74 % Woche,
    CONTINUE_WITH_CAUTION. Deltamap und Postconditions sind abgeschlossen;
    sichere Resume-Grenze ohne externe oder produktive Wirkung.`
  - `Das kurze U10R6-Operatorpaket hat freie HCR-033- und DONE-
    Archivziele, den exakten 18-Dateien-P1-Scope, Commit-/Pages-/v16-Smoke-
    Reihenfolge, v17-Rollbackaufruf und die noch einzusetzenden geschützten
    S5.6-Postimagefelder vorab festgelegt. Keine Source of Truth, Stage-Area,
    Remote- oder Produktwirkung.`
  - `U10R7 2026-08-30T15:55:16+02:00: 26 % 5h / 73 % Woche,
    CONTINUE_WITH_CAUTION. Zwölf spätere S6-Sources sind fingerprintgebunden;
    besonders der fremd geänderte Activity-Masterplan darf nur bei identischem
    405b63c8...3f58-Preimage symbolgenau gepatcht werden.`
  - `U10R8 2026-08-30T15:56:15+02:00: 25 % 5h / 73 % Woche,
    CONTINUE_WITH_CAUTION an der inklusiven Grenze. Konditionale, noch nicht in
    Sources of Truth angewandte README-, Changelog- und HCR-033-Textbausteine
    sind in S6 vorbereitet; kein Produktstatus wurde vorweggenommen.`
  - `U10R9 2026-08-30T15:56:53+02:00: 24 % 5h / 73 % Woche,
    SAFE_CLOSURE. Kein weiterer Block; Fix, Tests, Preflight, Release-Manifest,
    Operatorpaket, S6-Deltamap, Source-Fingerprints und Textbausteine sind an
    einer eindeutigen Resume-Grenze synchronisiert.`
  - `U10R10 2026-08-30T20:24:58+02:00: 95 % 5h / 68 % Woche nach
    RESET_CROSSED. Technisch CONTINUE; bevorzugte Reserve 96/15 um einen
    5h-Punkt verfehlt, harte Mindestreserve 89/20 erfüllt. U10R10 ist zugleich
    POST_REHYDRATION_BASELINE; der bereits verbrauchte Einstieg ist SUNK_USAGE,
    kein erneut zu reservierender Cutoverbedarf. Mangels kanonischer
    Vorhermessung wird kein exaktes Rehydrationsdelta ausgewiesen. Kein Commit,
    Push, Deploy, Write, Delete oder Rollback begann. D-ACT-R14-20/-21
    dokumentieren Owner-Annahme und Nettobudget-Semantik; wegen des danach
    entstandenen Usage-Verbrauchs folgt genau ein frisches Gate vor dem
    unmittelbaren Start.`
  - `U10R11 2026-08-31T06:37:47+02:00: 94 % 5h / 99 % Woche nach beiden
    Resetgrenzen, CONTINUE. Die harte 89/20-Mindestreserve, das unveränderte
    ce2e18d/v15-Preimage und der 16-Dateien-Manifesthash sind bestätigt.
    D-ACT-R14-20 wurde als PRIMARY_OWNER_BOUNDARY_ALLOWED ausgeübt und das
    atomare v16/v17-Fenster ohne Zwischenpoll begonnen.`
  - `U11R3 2026-08-31T06:55:35+02:00: 52 % 5h / 93 % Woche, CONTINUE.
    Das atomare Fenster war davor vollständig durch den v17-Rollback beendet.
    S5.6 dokumentiert das reale Postimage; S6/DONE bleibt wegen
    F-ACT-R14-26 gesperrt.`
  - `U12 2026-08-31T07:02:18+02:00: 35 % 5h / 90 % Woche,
    CONTINUE_WITH_CAUTION. S5.6 ist synchronisiert. S6/DONE bleibt unabhängig
    vom Usage-Gate wegen des offenen F-ACT-R14-26 gesperrt; kein neuer Block.`
  - `U12R1 2026-08-31T07:04:40+02:00: 29 % 5h / 89 % Woche,
    CONTINUE_WITH_CAUTION. Genau ein kurzer lokaler Diagnoseblock, ohne Deploy,
    Datenbankzugriff oder Fix: Das fehlende synchrone preparing-Publication
    grenzt F-ACT-R14-26 bis vor/an den realen Shell-Dispatch in finish() ein;
    die fehlende vollständige Composition-Regression ist belegt.`
  - `U12R2 2026-08-31T07:09:30+02:00: 19 % 5h / 87 % Woche,
    SAFE_CLOSURE. Kein neuer Diagnoseblock begonnen; ausschließlich der
    kanonische Checkpoint und die sichere Resume-Grenze wurden synchronisiert.`
- Follow-up Postimage Receipt für R15:
  - `Git-/Pages-/SW-Version: 4e87729 / Run 33358569779 / Root-SW v17.`
  - `V1-/V2-Produktstatus: V1 alleiniger produktiver Writer; V2-Capture nicht
    im Productload; R13-Readerloads unverändert aktiv.`
  - `Source-Fingerprints / gültige Evidence-IDs: TODO.`

Evidence wird erst nach finalem S6-Abgleich auf `DONE` gesetzt und gemeinsam
mit der Roadmap archiviert.

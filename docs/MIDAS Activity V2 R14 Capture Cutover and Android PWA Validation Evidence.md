# MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation - Execution Evidence

Diese Datei dokumentiert ausschließlich reale R14-Nachweise. Planwerte,
Secretwerte, vollständige Gesundheitsdaten und nicht ausgeführte Aktionen
werden nicht als PASS eingetragen.

## Metadaten

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap | `docs/MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation Roadmap.md` |
| Status | `S5.4/S5.5 ATOMIC V16/V17 CUTOVER IN PROGRESS; U10R11 PRIMARY_OWNER_BOUNDARY_ALLOWED; Android owner-deferred` |
| Evidence-Owner | `R14` |
| Baseline-Commit | `4be058b1b2e59f410ea8a6e3a4e5af9fdb86b652` |
| Umgebungen | `lokal / Browser / PWA / produktiv read-only / produktiv write; Android gemäß D-ACT-R14-17 owner-deferred` |
| Produktive Wirkung | `V2-Productload kurzzeitig über 1edbe38d/v14 ausgeliefert; kein V2-Datensatz entstanden; V1-Productload über ce2e18d/v15 vollständig wiederhergestellt` |
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

## Evidence-Gültigkeit und Invalidation

| Evidence-ID | Inputs / Fingerprints | Belegte Aussage | Invalidiert durch | Wiederverwendet in |
| --- | --- | --- | --- | --- |
| EV-ACT-R14-L01..L05 | Controller `20a91b68...e6d2`; CSS `5f2d2770...9c7f`; Contract `1175e858...800` | Block-B-Composition lokal vollständig, unreferenziert und fail-closed | Änderung an einem der drei Fingerprints oder den komponierten Core-APIs | Block C und S5 |
| EV-ACT-R14-L06/L07 | index `f017b4ec...b6a0`; app.css `6e02ac4e...d560`; main `9c31759d...9663`; Authcore `e4619a78...b8e6`; Chart `f3020bd8...5914`; SW `fcaa1907...225`; Cutovercontract `1ce88d5a...b1d9`; Rollbacktool `23b37d83...856c` | lokales v14-Cutoverpostimage mit null V1-Writerload, erhaltenen R13-Readern und materialisierter v15-Inverse | Änderung an Productload/SW/Consumern/Authhook/Chart/Rollbackmaterial | S5 |
| EV-ACT-R14-L08..L10 | R8-Isolation `46c05f78...aef5`; R10-Productloadcontract `e6d62f15...4f2a`; R13-Reporttest `1ae18b13...e488`; Browser-Session 2026-08-29 | lokale Releasebereitschaft und vollständige lokale Matrix | Korrektur an Runtime/UI/SW oder diesen Contractpostimages | P1 |
| EV-ACT-R14-L11 | Controller `d30e7b8a...c7c0`; Regression `559581bc...5598`; index `340d37e7...ea0a`; app.css `e9df9112...5e4f`; main `3411f13d...fd6`; Authcore `d0a2b041...20ca`; Chart `c743db04...2d8`; SW `8c208012...0142`; Cutovercontract `2c751df3...ee11`; Rollbacktool `a03f7a91...dc3`; 16-Dateien-Manifest `2b329d5a...4926b` | F-ACT-R14-25 lokal geschlossen; v16/v17-Cutoverreserve releasebereit | Änderung an Commitcomposition, Productload, SW, Rollbacktool oder einem Manifestpfad | neuer P1/P2-Reproof |
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

## Produktive Aktionen

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R14-W01 | Web-/PWA-Cutover | P1 | V2-Productload und neuer Root-SW | 1edbe38d / Run 33296179701; live V2-Productload und SW v14; Fresh/Upgrade/stale-client und Recovery PASS | PASS, später bedingt zurückgerollt |
| EV-ACT-R14-W02 | kontrollierter V2-Write | P2 | genau eine Session mit Items/Sets | Original und identischer Retry fail-closed; Draft erhalten; V2 danach 0/0/0 | FAIL / NO WRITE |
| EV-ACT-R14-W03 | normaler R9-Delete eines Smoke-Datensatzes | P2 / D-ACT-R14-18 | V2-Datensatz nach bewiesenem Write/Reader entfernt | Kein Datensatz entstanden; deshalb kein Delete ausgeführt | NOT APPLICABLE |
| EV-ACT-R14-W04 | Productload-Rollback auf V1 | P1 bedingt, nur bei Cutoverfehler | Webcode zurück; Daten unverändert | ce2e18d / Run 33296959317; V1-Form/Script 1/1, V2-Productcontroller 0, R13-Reader 2, SW v15 | PASS |

## Vorher-/Nachher-Nachweis

| Merkmal | Vorher | Nachher | Status |
| --- | --- | --- | --- |
| sichtbarer Capture | Activity V1 | nach bedingtem Rollback wieder Activity V1 | PASS ROLLBACK |
| V1-Produktcallsite | genau eine | kurzzeitig null; Rollbackpostimage wieder genau eine | PASS ROLLBACK |
| V1-Historie | vorhanden | keine V1-Mutation oder -Löschung; finaler S5.6-Readerpostcheck offen | PARTIAL / NO MUTATION |
| V2 Sessions/Items/Sets | 0/0/0 | nach Save und Retry weiterhin 0/0/0 | PASS NO WRITE |
| R13 Reader | V1-paritätisch | zwei Readerloads unverändert; finaler S5.6-Readersmoke offen | PARTIAL |
| Root-SW | v13 bei Planung | v14 Cutover, danach monoton v15 Rollback | PASS |

## Deploy- und Runtime-Nachweise

| Evidence-ID | Ziel | Version / Run-ID | Smoke | Schreibwirkung | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R14-P01 | Pages/Web | `1edbe38d` / `33296179701` | Fresh, Upgrade und stale-client PASS; Recovery nach Reload PASS | nein | PASS, später zurückgerollt |
| EV-ACT-R14-P02 | Android Daily-Driver | owner-deferred | nicht ausgeführt und nicht als PASS behauptet | nein | DEFERRED / NOT PASS |
| EV-ACT-R14-P03 | R13 Consumer | Cutover: unveränderte zwei Loads; Rollback: unveränderte zwei Loads | finaler S5.6-Readerpostcheck noch offen | read-only | PARTIAL |
| EV-ACT-R14-P04 | Service Worker | Cutover v14; Rollback `ce2e18d` / `33296959317` v15 | Upgradebanner, kontrolliertes Schließen alter v14-Clients und frischer v15-Boot PASS | nein | PASS ROLLBACK |

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

## Externer Review-Nachweis

- CodeRabbit Initial:
  - `2026-08-29; kanonischer coderabbit 0.7.5/authenticated; uncommitted Review; 1 Major Finding zur R10-Orakelausnahme.`
- CodeRabbit Verifikation:
  - `2026-08-29; genau ein Verifikationslauf nach Fingerprint-Härtung; 0 Findings. Kein dritter Lauf.`
- Offene P0/P1:
  - `none lokal; produktiver Reproof von F-ACT-R14-25 ist durch
    D-ACT-R14-19 konditional freigegeben, bleibt aber Usage-gated.`

## Rollback-Nachweis

- Preimage:
  - `Pages 4be058b1 / Run 33162838336; index.html
    6d932c67c127b898f17951d829132a00da07358671569444a42ab02560e00cc5,
    main.js c05b1814f3a922bdb23d07486d7f8cfc04bc4dc3292b6058b86446d83b17f10d,
    Activity V1 f3a4eff3248f2ce3778ec1b99bf902bae58c69892a64864363767d70c944d8d8,
    Root-SW 09aff49364731f85e400ae24d0be54ab4a3b2a8a8fc01b732191cbcf95167ddd.`
- Lokale Inverse:
  - `tools/activity-v2-r14-v1-productload-rollback.ps1` ist mit
    `-ConfirmRollback` fail-closed. Es stellt ausschließlich index.html,
    app/app.css, assets/js/main.js, app/supabase/auth/core.js,
    doctor-stack/charts/index.js und service-worker.js aus 4be058b1 wieder her,
    setzt den Worker monoton auf v15 und ergänzt exakt den V1-Scriptcache.
    Roadmap/Evidence, SQL, V1-/V2-Daten, Recoveryrecords und fremde Dirty-Dateien
    sind nicht Teil der Inverse. Materialisierbarkeitscontract PASS.`
  - `Postrollback-Toolfingerprint nach F-ACT-R14-24:
    34b7dff4902fa8a04777f334b927579c8011b10da56eafe78ba9014bbdb291bf.`
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

## Finaler Evidence-Digest

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
- Device Evidence:
  - `DEFERRED BY OWNER gemäß D-ACT-R14-17; nicht ausgeführt und nicht als PASS
    dokumentiert. Im revidierten R14-Scope kein DONE-Blocker, aber sichtbares
    Evidence-Gap für späteres Polishing beziehungsweise freiwillige Validation.`
- Restrisiken:
  - `F-ACT-R14-25 benötigt noch den erneuten produktiven v16-Write-/Reader-/
    Delete-Reproof. Bis dahin bleibt Activity V1 über ce2e18d/v15 produktiver
    Writer. Android bleibt transparent owner-deferred.`
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
- Follow-up Postimage Receipt für R15:
  - `Git-/Pages-/SW-Version: ce2e18d / Run 33296959317 / Root-SW v15.`
  - `V1-/V2-Produktstatus: V1 alleiniger produktiver Writer; V2-Capture nicht
    im Productload; R13-Readerloads unverändert aktiv.`
  - `Source-Fingerprints / gültige Evidence-IDs: TODO.`

Evidence wird erst nach finalem S6-Abgleich auf `DONE` gesetzt und gemeinsam
mit der Roadmap archiviert.

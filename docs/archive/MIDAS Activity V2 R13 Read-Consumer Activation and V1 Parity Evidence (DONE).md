# MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity - Execution Evidence

Diese Datei enthält ausschließlich technische Nachweise für R13. Sie trifft
keine neuen Produktentscheidungen und wird nur an den betroffenen lokalen,
produktiven oder Abschluss-Gates gelesen.

Keine Secrets, JWTs, vollständigen Gesundheits-Payloads oder unnötigen
Terminal-Rohdaten eintragen.

---

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap | `docs/archive/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Roadmap (DONE).md` |
| Status | `DONE; S5.7/S5.8/S6 PASS` |
| Erstellt am | `2026-08-23` |
| Letzter Stand | `2026-08-26; C45: Commit B 4aa97f92, Pages 32962301099, Fresh-/Upgradeclient, Doctor View, neuer Arztbericht und finales Postimage vollständig PASS. V1 66/cfddb1fa; V2 0/0/0; nur Range-Report-Singleton erwartungsgemäß auf 04619cae aktualisiert. S6 synchronisiert.` |
| Verantwortlicher Schritt | `S1-S6; produktiver Evidence-Owner ist S5` |
| Umgebungen | `lokal / disposable PostgreSQL 17 / produktiv read-only / owner-gated produktiv write` |
| Baseline-Commit | `21ce8e5910ae9ba662503afef0059b31f03704bf` |
| Externes Reviewbudget | `S1-S4: 0; S5: 1 Initial + höchstens 1 Verifikation` |
| Archivziel | `docs/archive/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Evidence (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Nachweisvertrag

- Diese Datei beweist:
  - die reale R13-Baseline und Invalidation der übernommenen R11-/R12-
    Nachweise
  - lokale Auth-, SQL-, Consumer-, Browser-, Edge-, Workflow- und
    Rollbackchecks
  - jede owner-gatete Schlüssel-, SQL-, Deploy-, Workflow- und Webaktion
  - das produktive V1-Paritäts- und R14-Negativpostimage
- Diese Datei beweist nicht:
  - Activity-V2-Capture oder reale V2-Sessionnutzung
  - medizinischen Nutzen neuer Fitnessmetriken
  - die spätere Legacy-Key-Migration/-Deaktivierung außerhalb der für R13
    separat freigegebenen Modern-Key-Initialisierung
  - R11/R12 erneut, solange deren Fingerprints gültig sind
- Source of Truth für Entscheidungen:
  - R13 Zielvertrag und Entscheidungslog
- Verbotene Inhalte:
  - Secretwerte, vollständige JWTs, personenbezogene Rohdaten, vollständige
    Reports/Exporte und unnötige Logs

## Baseline

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R13-B01 | Git/Repo | HEAD, Worktree, R11/R12-DONE und R13-Planungsdiff | `PASS: HEAD=origin/main=remote main 21ce8e5910ae9ba662503afef0059b31f03704bf; kein Produktcode-Diff; R1/C2 alt-neu bytegleich (Git-Blobs 45475815... bzw. 10e6fd7e...); Owner-Diff erhalten` |
| EV-ACT-R13-B02 | lokal | Productload, Consumerfingerprints und R11/R12-Tests | `PASS: Productload weiterhin nur Activity V1; index/SW 6cf9cf4e.../d02d5510... unverändert. R11 SQL25/Consumer/Data-Access/View/Health/Report und R12 Shared-/Protein-/Trend-Adapter stimmen mit DONE-Fingerprints; R11/HCR-029 und pure R12-15/15 wiederverwendbar` |
| EV-ACT-R13-B03 | produktiv read-only | SQL25 Definition, Owner, ACL, RLS und Advisor | `PASS: PG17.6/UTC; exakt eine date/date-Signatur, Definition f7226f6a...b3c3d, postgres, STABLE INVOKER, ACL nur postgres+authenticated; V1-View security_invoker und vier Basistabellen RLS. Advisors unveränderte 3 Activity-Definer-WARN plus Leaked-Password-Watchlist; 8 unused-index INFO` |
| EV-ACT-R13-B04 | produktiv read-only | V1/V2/Report/Profile/Trendpilot-Zähler und geschützte Hashes | `PASS: V1 65/invalid 0, geschützter SHA 859a0619...cbef7; V2 Sessions/Items/Sets 0/0/0, je 4f53cda1...b945; Range Report 1, 3d4b12d6...03ba2; Profil 1, Trend-State 2, Trend-Events 0; nur Zähler/Hashes, keine Payload gelesen oder dokumentiert` |
| EV-ACT-R13-B05 | Runtime | drei Edge-Versionen, `verify_jwt` und Bundlefingerprints | `PASS: Monthly ACTIVE v50/true/914d5f8b...3182; Protein v18/true/05409ac0...285e; Trendpilot v21/true/008a7457...9772. Remoteproduktquellen entsprechen lokal; isolierte R11/R12-Module nicht im Bundle` |
| EV-ACT-R13-B06 | GitHub/Web | Workflowstände, Secretnamen, Schedules, Runs und Hosting-/SW-Stand | `PASS: Protein Freitag und Trend Dienstag je 01:00 UTC plus dispatch; letzte 10 Runs je success, aktuell 0 queued/in_progress; nur Legacy-Scheduler-Secretname vorhanden. Pages legacy aus main:/, HTTPS, Build-HEAD 21ce8e59..., index ohne R11-Loads, SW v6; Revert-/Pushweg belegt` |
| EV-ACT-R13-B07 | Toolchain | Git, Node, Deno, Docker/PG17, Supabase, gh, Browser und CodeRabbit | `PASS: Git 2.55.0, Node 24.18.0, npm 11.18.0, rg 15.2.0, Deno 2.9.5, Supabase 2.109.1, Docker 29.7.2, gh 2.96.0, Python 3.14.6, Playwright 1.61.1, CodeRabbit 0.7.5, Browser verfügbar; nichts installiert, CodeRabbit-Läufe 0` |

<!-- markdownlint-enable MD013 -->

## Discovery-Gates S1 bis S4R

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Gate | Belegte Aussage | Ergebnis | Status |
| --- | --- | --- | --- | --- |
| EV-ACT-R13-D01 | S1 | Producer, Consumer, Auth, SQL, Runtime und Deployweg real kartiert | `B01-B07 vollständig; Full Contract Review ohne offene unzugeordnete P0/P1; F12 geschlossen, F13 abgegrenzt, F15 S4.7 zugeordnet; Continuation Gate PASS` | PASS |
| EV-ACT-R13-D02 | S2 | Ziel-, Fehler-, Auth-, Owner-, Range- und Backcompatvertrag eingefroren | `PASS: exakte Productload-/Doctor-/Health-Seams; @supabase/server 1.4.1 mit zwei benannten Modusarrays; SQL-Kern/User-/Service-Signaturen und Minimal-ACL; stabile Fehler; Protein v1.3/Cooldown/dry_run; Trend 373+27 und Legacygrenze; Full Review ohne offene Grundsatzfrage` | PASS |
| EV-ACT-R13-D03 | S3 | Security-, Daten-, Cutover- und Rollbackrisiken geschlossen/zugeordnet | `PASS: 22 konkrete P0/P1-Risiken geschlossen/zugeordnet; L01-L09 und PRE01-PRE07 spezifiziert; geschütztes Schedulerfenster, Edge-Einzelstops, zwei pfadselektive Pushes und exakte Reversefolge festgelegt; F19-F21 geschlossen; keine offene unzugeordnete P0/P1` | PASS |
| EV-ACT-R13-D04 | S4R | Scope-Freeze, S4-Blöcke, Invalidation und Owner-Gates ausführbar | `PASS: large/23-27 Pfade; A Auth+SQL, B Doctor/Health+Report, C Protein+Trend, D config/workflows/isolation; strikt sequenziell, blockweise Delta-Reviews und nur invalidierte Checks; CodeRabbit S4=0; Forward-/Reversefolge und S5.4-S5.7-Gates exakt; Empfehlung GO, S4 nicht begonnen` | PASS |

<!-- markdownlint-enable MD013 -->

## Session- und Fortsetzungsnachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Zeitpunkt | Belegte Aussage | Ergebnis | Status |
| --- | --- | --- | --- | --- |
| EV-ACT-R13-C01 | 2026-08-23 nach S4R | Owner beendet die heutige Arbeit bewusst am vollständig synchronisierten S4R-Haltepunkt; kein S4-GO, keine Implementierung und keine owner-gatete Aktion. Nächster Einstieg prüft Git-/Remote-/Workflow-Drift read-only und verwendet bei unverändertem Postimage den bestehenden Scope-Freeze. | `Roadmap-Metadaten, Resume Card, Context Receipt und D-ACT-R13-24 synchron; S4 bleibt TODO` | PASS |
| EV-ACT-R13-C02 | 2026-08-24 vor S4 | Re-entry gegen Git, Runtimefingerprints, SQL25/ACL/RLS, Datenzähler, Edge, Advisors, Secret-/Keynamen, Workflows/Runs und Pages. | `PASS: HEAD/origin/remote e3029629; seit 21ce8e59 nur docs-/Planungscommit und 0 R13-Runtimepfade; lokaler Runtime-Diff 0. SQL25 f7226f6a...b3c3d, postgres/STABLE/INVOKER/leerer Search Path/authenticated-only; SQL26 absent; V1 65, V2 0/0/0, Range Report 1, Profil 1, Trend-State 2, Trend-Events 0; Edge Monthly 50/true, Protein 18/true, Trend 21/true; Advisors unverändert 3 Definer-WARN + Leaked-Password-Watchlist und 8 unused-index INFO; Named-GitHub-Secrets absent, Function-Env-Namen unverändert; Scheduler 0 inflight; Pages built e3029629 bei unverändertem index/SW. Owner-Diff C3/Bild/Activity-Plan abgegrenzt. Kein relevanter Drift; GO für S4.1-S5.3 erteilt.` | PASS |
| EV-ACT-R13-C03 | 2026-08-24 nach Block A | S4.1/S4.2 mit blockweisem Status-, Findings-, Resume-, Context- und Evidence-Sync abgeschlossen; Continuation Gate nach nativen Security-/SQL-/Consumerreviews. | `PASS: L01/L02 grün; nur eingefrorene Block-A-Dateien geändert; kein produktiver Write/Deploy/Workflow/Commit/Push; CodeRabbit 0; Fortsetzung in Block B` | PASS |
| EV-ACT-R13-C04 | 2026-08-24 nach Block B | S4.3/S4.4 mit blockweisem Status-, Findings-, Resume-, Context- und Evidence-Sync abgeschlossen; Continuation Gate nach nativen Consumer-/Privacy-/UI-/Lifecycle-Reviews. | `PASS: L03/L04 grün; R11 Consumer/Data-Access/View/Health/Report fingerprintgleich; Productload nur read-only R13-Module, Activity V1 bleibt alleiniger Capturewriter; keine produktive Aktion; CodeRabbit 0; Fortsetzung in Block C` | PASS |
| EV-ACT-R13-C05 | 2026-08-24 nach Block C | S4.5/S4.6 mit blockweisem Status-, Findings-, Resume-, Context- und Evidence-Sync abgeschlossen; Full Contract Review und Continuation Gate nach nativen Medical-/Security-/Consumer-/Legacyreviews. | `PASS: L05/L06 grün; R12 Protein-/Trendadapter fingerprintgleich; alle Auth-/Owner-/Range-/Snapshot-/Contractpreconditions vor Writes, dry-run null Writes, kein Legacy-Rewrite; F26/F27 korrigiert; keine produktive Aktion; CodeRabbit 0; Fortsetzung in Block D` | PASS |
| EV-ACT-R13-C06 | 2026-08-24 nach Block D/S4 | S4.7 und damit S4 vollständig mit Status-, Findings-, Resume-, Context-, Cutover- und Evidence-Sync abgeschlossen; Full Contract Review und Continuation Gate nach nativen Runtime-/Scope-/Secret-/Rollbackreviews. | `PASS: L07 grün; exakt zwei false-Flags, Monthly true, zwei getrennte apikey-Caller, unveränderte Schedules/Payloads, HTTP fail, sichere Legacy-/Final-Webzustände und null R14-Load/Secretmaterial/produktive DML; F28 korrigiert; keine produktive Aktion; CodeRabbit 0; Fortsetzung in S5.1` | PASS |
| EV-ACT-R13-C07 | 2026-08-24 nach S5.1 | Finale lokale Abschlussmatrix auf dem S4-Diff; nur bewusst invalidierte Altassertionen ausgeroutet; Disposable-Umgebung anschließend entfernt. | `PASS: Node 38/38; Deno 75/75 + 6/6 sowie Format/Lint/Check; PG17 SQL25/26/16/Rollback Full Fixture PASS; Browser/PWA 5/5; L07-Orakel/TOML und diff-check grün. F29 als reines Harness-/Routingfinding geschlossen; kein Produktcode-Fix, kein produktiver Write/Deploy/Workflow/Commit/Push; CodeRabbit 0; Fortsetzung in S5.2` | PASS |
| EV-ACT-R13-C08 | 2026-08-24 nach S5.2 | Nativer Full Review plus exakt ein CodeRabbit-Initial- und ein Verifikationslauf; alle berechtigten Issues minimal geschlossen und nur invalidierte Checks wiederholt. | `PASS: Initial 2 Minor → F30/F31; Verifikation über exakten 29-Pfade-R13-Scope 1 Minor + 1 Major → F32/F33. Protein/Trend je 10/10 plus Format/Lint/Check, L07 und diff-check PASS; reale PG17-Probe bestätigt \quit-Exitcode-0-Defekt, assert_true-Fix und komplettes Full Fixture PASS. F34 Scopekorrektur dokumentiert; Reviewbudget 1+1 erschöpft; keine produktive Aktion; Fortsetzung in S5.3.` | PASS |
| EV-ACT-R13-C09 | 2026-08-24 nach S5.3 | Read-only PRE01-PRE07 gegen produktive SQL-/Daten-/Edge-/Keynamen-/GitHub-/Pages-/Advisor- und lokale Artefaktbaselines; zwingender STOP vor S5.4. | `PASS: kein Runtime-/Daten-/Workflowdrift; F36 korrigiert die interne V1-Hashprojektion. Die damalige Owner-Env-Abwesenheitsbehauptung F35 wird durch F38 ersetzt; keine produktive Mutation; Fortsetzung ausschließlich nach expliziter S5.4-Freigabe.` | PASS / OWNER-ENV-TEIL SUPERSEDED |
| EV-ACT-R13-C10 | 2026-08-24 am ersten freigegebenen S5.4-Gate | Owner-GO und unmittelbare Browserbestätigung liegen vor; authentifizierter Supabase-Control-Plane-Precheck unmittelbar vor W00. | `HISTORISCHER STOP vor Mutation: keine aktiven modernen Secret Keys; Named-Key-Controls bleiben ohne vorgeschaltetes Create new API keys wirkungslos. Ein vorläufiger Dashboard-Preview ließ ein zusätzliches Dreierset erwarten; die spätere reale Bestätigungsmodalität korrigiert dies auf Publishable default plus Secret default. F37/D27 eröffneten deshalb berechtigt den Ownerentscheid. F38/D28 belegen beide Owner-Env-Namen als seit Januar vorbestehend; kein Rewrite, keine Werte gelesen oder ausgegeben.` | PASS / SUPERSEDED BY C11 |
| EV-ACT-R13-C11 | 2026-08-24 nach S5.4 | Ausdrückliche Ownerfreigabe für globale Initialisierung und alle notwendigen Gate-A-Schritte; produktives Key-/Secret-Postimage plus invalidierter Namensdelta. | `PASS: W00 erzeugte exakt Publishable default und Secret default, beide dormant/unreferenziert; Legacy anon/service_role aktiv. F39 synchronisierte die zwei R13-Keynamen auf protein_targets_scheduler/trendpilot_scheduler. W01/W02 und W03 erfolgreich; W03A vorbestehend/unverändert. Werte ausschließlich zwischen vorgesehenen Secretdialogen verarbeitet, nie ausgegeben und danach aus der Browser-Sitzungsvariable entfernt. Deno Format/Lint/Check, Principal 6/6, Handler 12/12, L07 5/5 und diff-check PASS. GitHub-Postcheck: beide Zielsecretnamen, 0 Protein-/Trendpilot-Runs; zwei seit 2025-12-18 stale queued pages-build-deployment-Runs unberührt und am S5.7-Pages-Gate neu zu bewerten. Kein SQL, Deploy, Dispatch, Git, Web/PWA oder Device.` | PASS / STOP VOR S5.5 |
| EV-ACT-R13-C12 | 2026-08-24 nach S5.5 | Gebündeltes konditionales Owner-GO S5.5-S6, Re-Preflight, lokale Env-Erweiterung und produktives SQL26-Gate. | `PASS: .env.supabase.local ignored und ausschließlich um PROTEIN_TARGETS_SECRET_KEY/TRENDPILOT_SECRET_KEY erweitert; keine Werte ausgegeben. F41: Remoteversionen 54/22/25, aber PRE-Bundle-Hashes und true-Flags exakt. SQL25 f7226f6a, V1 65/859a0619, V2 0/0/0, Protected-Hashes und Advisors unverändert. SQL26 71faf186 exakt einmal erfolgreich; User/Service/Core cffcd679/eb27ec44/abb59627, postgres, einzige Union, Minimal-ACL. Keine Fachdatenänderung; Rollback 79ec07cd bereit. Fortsetzung S5.6.` | PASS |
| EV-ACT-R13-C13 | 2026-08-24 am S5.6-Monthly-STOP | Erster Edge-Einzelcutover samt User-Smoke und freigegebener Reversefolge. | `STOP: Monthly v55/true/957159c0 aktiv; anonymer Negativsmoke 401. Positiver User-JWT-/Report-Smoke erreichte die lokale PIN-/Passkey-Sperre; keine Umgehung, kein JWT-/Sessionread, kein Reportwrite. Reverse stellte das gesicherte Legacy-Sourcepreimage und true bytegleich als v56/v57 wieder her. Der aktuelle Supabase-Bundler erzeugte cfd5dd51 statt historischem 914d5f8b; offizielle Plattformdokumentation bietet keine Versionsaktivierung/Rollbackfunktion. F42 offen. SQL26 danach mit 79ec07cd auf SQL25 f7226f6a zurückgerollt; V1 65/859a0619, V2 0/0/0, ACL und Advisors 4 WARN/8 INFO grün. Protein/Trend/Workflow/Git/Web unberührt.` | STOP / SAFE REVERSE |
| EV-ACT-R13-C14 | 2026-08-24 vor erneutem S5.6 | Ownerentscheidung zu F42 und erneutes autonomes GO. | `Owner akzeptiert bytegleiches Sourcepreimage plus ursprüngliches verify_jwt-Flag und vollständige negative/positive Runtime-Smokes als maßgebliches Rollbackorakel; Version/Bundlehash bleiben Diagnosewerte. GO S5.6-S6 erneut erteilt. PWA und Live Server ownerseitig geöffnet; der neu kontrollierbare Produktionstab benötigt vor dem positiven Write-Smoke eine eigene Entsperrung.` | PASS / RESUME |
| EV-ACT-R13-C15 | 2026-08-24 am erneuten S5.6-Re-entry | Vollständiger Daten-Continuation-Gate vor Edge-Forward. | `STOP: Git/Remote und Scheduler grün; SQL25 und drei Legacy-Edges erwartungsgemäß. Nach SQL26-Reaktivierung Definitionen/ACL exakt, aber Activity V1 66/cfddb1fa statt bestätigter 65/859a0619. Metadaten-only belegen genau einen formal kanonischen V1-Neuzugang am 2026-08-24; keine Payload gelesen. SQL26 sofort mit 79ec07cd auf SQL25 f7226f6a reversiert; neuer Datensatz erhalten, V2 0/0/0. Keine Edge-, Workflow-, Git- oder Webaktion.` | STOP / SAFE REVERSE |
| EV-ACT-R13-C16 | 2026-08-24 vor drittem S5.6-Forward | Ownerbestätigung der neuen Activity-V1-Baseline. | `Owner bestätigt den einzelnen Neuzugang als beabsichtigten heutigen Gym-Eintrag über den weiterhin einzigen produktiven Capture-Pfad Activity V1. Rebaseline 66/cfddb1fa akzeptiert; V2 bleibt 0/0/0. F43 geschlossen, F42-Orakel und GO S5.6-S6 bleiben aktiv.` | PASS / RESUME |
| EV-ACT-R13-C17 | 2026-08-24 nach bestandenem Monthly-Re-entry | Read-only Preflight, SQL26-Reaktivierung und erster Edge-Einzelpostcheck im tatsächlich sichtbaren entsperrten Produktionstab. | `PASS: SQL25/V1 66/cfddb1fa/V2 0/0/0 und Protected-Hashes vorab exakt; SQL26 User/Service/Core cffcd679/eb27ec44/abb59627 samt Minimal-ACL erneut aktiv. Monthly v58/true/957159c0 ACTIVE, sieben Remotequellen bytegleich; anonymer 401 und positiver User-Report-Smoke grün. Kontrollierter Write aktualisierte ausschließlich den Range-Report-Singleton von 3d4b12d6 auf 5d5ec8b3; V1/V2 unverändert. Continuation Gate zu Protein PASS.` | PASS |
| EV-ACT-R13-C18 | 2026-08-24 am Protein-Einzelgate | Protein-Deploy, drei Authsmokes, lokale Secretkorrektur, Datenpostcheck und sofortiger Source-/Flag-Reverse bei fehlendem Usernachweis. | `STOP / SAFE REVERSE: v23/false/0bf03731 ACTIVE, sechs Quellen bytegleich, Public 401. F44: lokaler Proteinwert war nur maskierter Präfix; vollständig und ohne Ausgabe in Env/GitHub korrigiert. Named-Secret-dry-run 200/ok/no-write; Profil 1/10c5f73a, Body 51/eec00335, V1 66/cfddb1fa, V2 0/0/0 unverändert. Sichtbarer echter Userpfad nur über Body-Save; exakt vorgefülltes bestehendes 11.08.-Preimage traf vor Edge-Aufruf auf Legacy-409/Unique, kein Remote-Write. Reverse auf bytegleiches Legacy-Sourcepreimage v24/true, Public 401; Bundle 5254b32e diagnostisch. Trend/Workflow/Git/Web nicht begonnen. Trend-Envwert weiterhin maskierter Präfix und unbenutzt.` | STOP / SAFE REVERSE |
| EV-ACT-R13-C19 | 2026-08-24 beim Protein-Re-entry | Tatsächlichen sichtbaren Tabzustand korrigieren und Protein für einen sicheren User-JWT-no-write-Nachweis erneut aktivieren. | `WAIT: Browserpostimage enthält genau einen vorhandenen MIDAS-Produktionstab; kein zweiter Tab erforderlich. Protein v25/false ACTIVE; Public 401 und Named-Secret-dry-run 200/ok/dry_run erneut PASS. Der Browserkanal liest weder JWT noch Sessionmaterial. Der kontrollierte User-JWT-dry-run wartet auf die ownerseitige DevTools-Auslösung; kein Trend-/Workflow-/Git-/Webschritt begonnen.` | WAIT / OWNER ACTION |
| EV-ACT-R13-C20 | 2026-08-24 beim ersten DevTools-User-Smoke | Kontrollierter Protein-User-JWT-`dry_run` im vorhandenen Produktionstab; nur PASS/FAIL-Ausgabe. | `SUPERSEDED SEQUENCE: Der Request erreichte midas-protein-targets und lieferte nach Refresh zweimal 401/No-write. Die nachgereichte Timelapse belegt, dass der MIDAS-Anmeldedialog erst als Folge dieser 401-Antworten erschien, nicht davor. Keine JWT-/Sessionausgabe und kein Datenwrite.` | SUPERSEDED BY C21/F45 |
| EV-ACT-R13-C21 | 2026-08-24 am realen Protein-Auth-Gate | Timelapse-Korrektur, öffentliche Signing-Topologie, gepinnter Paketvalidator, exakter Safe-Reverse und Datenpostcheck. | `STOP / SAFE REVERSE: Zwei echte User-dry-run-Aufrufe 401, danach erst Loginoverlay. Public JWKS key_count=0. @supabase/server@1.4.1 user verlangt env.jwks, JWT alg+kid und erfolgreiche jose-Verifikation; die Legacy-Signing-Topologie ist inkompatibel und die Mocktests hatten sie nicht modelliert. v25/false deshalb nicht fortgesetzt. Legacy-Source als v26/false restauriert; explizites Originalflag anschließend als v27/true. v27 ACTIVE, Bundle 5254b32e exakt wie akzeptierter v24-Reverse, Public 401. V1 66, Body 51, V2 0/0/0, Profil 1, Range-Report 1; Trend/Workflow/Git/Web unberührt.` | STOP / F45 / SAFE REVERSE |
| EV-ACT-R13-C22 | 2026-08-24 am Kontingent-Freeze | Ownerentscheidung zum bewussten Session-Cut bei 10 % verbleibendem Wochenkontingent; Roadmap, Resume Card, Context Receipt und Evidence auf denselben Haltepunkt synchronisieren. | `OWNER-PAUSED / SAFE FREEZE: keine weitere Code-, Env-, Secret-, SQL-, Edge-, Workflow-, Git-, Web-/PWA- oder Deviceaktion. C21/PRE12/F45 bleiben maßgeblich; SQL26 und Monthly v58 aktiv, Protein v27/true sicher reversiert, Trend/Workflow/Git/Web nicht begonnen. Normale Activity-V1-Nutzung ist zulässig und erfordert beim Re-entry eine neue Baseline, keine Datenkorrektur. Fortsetzung erst nach Kontingent-Reset, read-only Drift-Check und ausdrücklichem F45-GO.` | PASS / PAUSED |
| EV-ACT-R13-C23 | 2026-08-25 am F45-Re-entry | Kontingent-Reset, ausdrückliches Owner-GO für D32 Legacy-Signing und read-only Drift-Check vor jeder Mutation. | `PASS / RESUME: HEAD=origin=Pages e3029629; SQL26 User/Service/Core cffcd679/eb27ec44/abb59627 samt Minimal-ACL exakt; Monthly v58/true, Protein v27/true/5254b32e, Trend v25/true; JWKS key_count=0. V1 66/cfddb1fa und V2 0/0/0 unverändert. Ein kanonischer Body-Eintrag vom 25.08. und die Profilableitung ausschließlich über Zähler/Hash/Metadaten auf 52/2b52f3b3 und 1/2d560902 neu baselined; keine Payload gelesen. Legacy-Trendworkflow heute vor Cutover success, kein Zielworkflow inflight; Pages-Runs completed. Owner-GO S5.6-S6 bleibt aktiv.` | PASS / RESUME |
| EV-ACT-R13-C24 | 2026-08-25 am produktiven F45-Protein-Einzelgate | Separates Reversepreimage, atomarer Forward, Source-/Flag-/Public-/Named-/Datenpostcheck und vorbereiteter echter Userpfad. | `PARTIAL PASS / WAIT: Remote v27/true-Source textgleich mit HEAD-Legacy und separat deploybar gesichert. v28/false ACTIVE, Bundle 1af2c434 diagnostisch; sechs Remotequellen nach Line-ending-Normalisierung vollständig bytegleich. Public 401; exakter Protein-Named-Secret-dry-run 200/ok/dry_run; V1 66/cfddb1fa, Body 52/2b52f3b3, Profil 1/2d560902 und V2 0/0/0 unverändert. Bestehender entsperrter Produktionstab kontrollierbar und als Handoff erhalten. Echter User-dry-run noch nicht ausgelöst, weil die konkrete Übertragung des vorhandenen Login-Bearers an die eigene MIDAS-Supabase-Function eine unmittelbare Bestätigung verlangt. Kein Trend-/Workflow-/Git-/Webschritt.` | PARTIAL PASS / USER CONFIRMATION |
| EV-ACT-R13-C25 | 2026-08-25 nach action-time Bestätigung | Echter User-dry-run im bestehenden entsperrten Produktionstab ohne JWT-/Payloadausgabe auslösen. | `WAIT / OWNER ACTION: Owner bestätigt die konkrete Übertragung des vorhandenen Login-Bearers an die eigene MIDAS-Supabase-Function. Die verbundene Browsersteuerung isoliert Seitenglobale und blockiert Codeausführung im App-Hauptkontext ausdrücklich; die Fehlermeldung verbietet Workarounds, indirekte Ausführung und alternative Browsersurfaces. Kein Request wurde ausgelöst. Der sichere C20-DevTools-Pfad bleibt verfügbar und gibt ausschließlich R13_F45_USER_SMOKE PASS oder FAIL plus Status aus. Protein v28/false bleibt unter vorbereitetem v27/true-Sofort-Reverse aktiv; kein Trend-/Workflow-/Git-/Webschritt.` | WAIT / OWNER ACTION |
| EV-ACT-R13-C26 | 2026-08-25 nach ownerseitigem DevTools-Smoke | F45-Protein-Gate mit echtem Legacy-User-Bearer schließen und No-write-Vertrag bestätigen. | `PASS: Owner übermittelt ausschließlich R13_F45_USER_SMOKE PASS. Der bestehende Login-Bearer wurde über den unveränderten MIDAS-fetchWithAuth-Pfad an die eigene Function gesendet; Antwort erfüllt ok=true/dry_run=true. Kein JWT, Claim oder Payload wurde ausgegeben. v28/false bleibt ACTIVE; Public-, Named- und Userpfad sind grün, V1 66/cfddb1fa, Body 52/2b52f3b3, Profil 1/2d560902, Range-Report 1/a77dd888 und V2 0/0/0 unverändert. Continuation Gate zu Trendpilot PASS.` | PASS |
| EV-ACT-R13-C27 | 2026-08-25 am produktiven F45-Trendpilot-Einzelgate | Separates Reversepreimage, atomarer Forward sowie Source-/Flag-/Public-/Named-/Datenpostcheck vor echtem User-dry-run. | `PARTIAL PASS / WAIT: Remote v25/true-Source textgleich mit HEAD-Legacy und separat deploybar gesichert. v26/false ACTIVE, Bundle 6ec69121 diagnostisch; sechs Remotequellen nach Line-ending-Normalisierung vollständig bytegleich. Public 401; exakter trendpilot_scheduler-dry-run 200/ok/dry_run. V1 66/cfddb1fa, Body 52/2b52f3b3, Profil 1/2d560902, Trend-State 2/976373b6, Trend-Events 0/4f53cda1 und V2 0/0/0 unverändert. Der zuvor maskierte lokale Trend-Key wurde ohne Ausgabe aus der Control Plane vollständig in die ignorierte Env übernommen; GitHub-Secret blieb vorbestehend. Echter User-dry-run ist der letzte Nachweis; kein Workflow-/Git-/Webschritt.` | PARTIAL PASS / USER SMOKE WAIT |
| EV-ACT-R13-C28 | 2026-08-25 am echten Trendpilot-User-Smoke | D32-Userpfad auf v26/false ohne Payloadausgabe prüfen und bei Abweichung das Continuation Gate schließen. | `FAIL / STOP: Owner führt den freigegebenen DevTools-dry-run in der angemeldeten MIDAS-PWA aus. Die eigene midas-trendpilot-Function antwortet HTTP 500; einzig ausgegebene Vertragszeile R13_F45_TREND_USER_SMOKE FAIL_CONTRACT 500. Kein JWT, Claim, Secret oder Gesundheits-Payload ausgegeben; dry_run bewirkte nach geschütztem Postcheck keinen Write. S5.7 wurde nicht begonnen.` | FAIL / SAFE REVERSE REQUIRED |
| EV-ACT-R13-C29 | 2026-08-25 erster Trend-Safe-Reverse | Gesichertes bytegleiches v25-Legacy-Sourcepreimage zurückspielen und ursprüngliches true-Flag wiederherstellen. | `PARTIAL REVERSE: dasselbe Legacy-Sourcepreimage als v27 deployt; anschließender Control-Plane-Postcheck zeigt jedoch verify_jwt=false. Supabase behielt ohne explizite Gegenangabe das vorherige Flag bei. Source-Reverse allein ist kein bestandener Reverse; kein weiterer Consumer-/Workflow-/Git-/Webschritt.` | PARTIAL / FLAG FALSE |
| EV-ACT-R13-C30 | 2026-08-25 Postcrash-Re-entry und expliziter Reverse-Abschluss | Realen Remotezustand unabhängig vom Chat beweisen und nur bei Bedarf denselben Source-Reverse mit explizitem true vervollständigen. | `PASS / SAFE REVERSE: temporäres Rollback-Manifest enthält ausschließlich den expliziten Trend-Block verify_jwt=true; dasselbe Sourcepreimage wurde als v28 bereitgestellt. Read-only Re-entry beweist v28 ACTIVE/true, Remoteindex d16339afff5e399d exakt gleich v25-Preimage, Bundle f7a161a1 nur diagnostisch und Public 401. V1 66/cfddb1fa, Trend-State 2/976373b6, Trend-Events 0/4f53cda1 sowie V2 Sessions/Items/Sets 0/0/0 jeweils 4f53cda1. Keine Zielworkflows inflight oder manuell gestartet; HEAD=origin=Pages e3029629, S5.7 nicht begonnen.` | PASS / ROLLBACK READY |
| EV-ACT-R13-C31 | 2026-08-25 nach F48-Diagnose und minimalem ACL-Fix | HTTP 500 ohne Payloadread lokalisieren, nur invalidierte Checks ausführen und den kleinsten RLS-kompatiblen Produktivdelta postprüfen. | `PASS / FORWARD READY: Edge-Requestmetadaten zeigen Handler-500 ohne 401/403; Protein beweist denselben D32-Uservalidator produktiv. Nur Trend benötigt im dry_run den SELECT auf trendpilot_state. Produktiv: authenticated_select false bei RLS=true und einer Own-row-SELECT-Policy; User-I/U/D false, service DML true. SQL16 setzt exakt User-SELECT; PG17-Full-Fixture, L07 5/5, diff-check und nativer Security-/Scope-Review PASS. Einzel-GRANT produktiv PASS; danach authenticated_select=true, anon=false, User-DML=false, service_all=true, RLS/Policy unverändert. V1 66/cfddb1fa, Trend-State 2/976373b6, Trend-Events 0 und V2 0/0/0 hashgleich; Advisors weiterhin 4 WARN. Exakter REVOKE-Rollback bereit; v28/true bleibt bis zum Re-Forward aktiv.` | PASS / FORWARD READY |
| EV-ACT-R13-C32 | 2026-08-25 am Trendpilot-F45-Re-Forward | Nach F48 ausschließlich Trend erneut forward schalten und Source/Flag/Public/Named/No-write vor dem echten Userpfad prüfen. | `PARTIAL PASS / USER ACTION: v29 ACTIVE/false, Bundle 6ec69121 diagnostisch; sechs heruntergeladene Remotequellen normalisiert bytegleich zum R13-Postimage. Public 401, trendpilot_scheduler 200/ok/dry_run. V1 66/cfddb1fa, Trend-State 2/976373b6, Trend-Events 0 und V2 0/0/0 unverändert; authenticated SELECT=true unter RLS, User-DML=false. v25/true-Reverse erneut geprüft und deploybar; keine Zielworkflows inflight, kein Git-/Webcutover. Letztes Gate ist ownerseitiger DevTools-User-dry-run.` | PARTIAL PASS / USER ACTION |
| EV-ACT-R13-C33 | 2026-08-25 nach ownerseitigem Trendpilot-User-Smoke | F45/F48 und S5.6 mit dem echten Legacy-User-Bearer schließen; No-write und Continuation Gate zu S5.7 beweisen. | `PASS: Owner übermittelt ausschließlich R13_F48_TREND_USER_SMOKE PASS 200. Der unveränderte MIDAS-fetchWithAuth-Pfad erreicht v29/false und die Antwort erfüllt ok=true/dry_run=true. Kein JWT, Claim, Secret oder Gesundheits-Payload ausgegeben. Unmittelbarer geschützter Postcheck bleibt V1 66/cfddb1fa, Trend-State 2/976373b6, Trend-Events 0 und V2 0/0/0 hashgleich. F45/F48 geschlossen; S5.7 darf gemäß eingefrorenem Commit-A/B-Vertrag beginnen.` | PASS |
| EV-ACT-R13-C34 | 2026-08-25 erster S5.7-Forward und Reverse | Reale Commit-A-/Workflow-/Failure-/Reverse-Sequenz ohne rückwirkende Glättung. | `Commit A f7ade43e gepusht. Protein-Run 32897430514 SUCCESS; nur gültiger Profil-Singleton 2d560902…→e17f64da…, V1/V2/Trend unverändert. Trend-Run 32897511236 FAIL HTTP 401/No-write; Commit B nie begonnen. Vollständig reversiert: Git 09622c0, SQL25 f7226f6a, SQL26-Core/Wrapper absent, F48-Grant revokt; Monthly v59/true, Protein v29/true, Trend v30/true ACTIVE/sourcegleich/Public 401; V1 66/cfddb1fa, V2 0/0/0, Trend unverändert, Profil e17f64da… erhalten, 0 inflight.` | PASS / SAFE REVERSE |
| EV-ACT-R13-C35 | 2026-08-26 Option-1-Re-entry | Safe-Reverse erneut beweisen, produktiv wieder aktives SQL26 ausschließlich auf SQL25 zurückführen und zwei Incidents-Benachrichtigungen read-only einordnen. | `PASS / STOP: HEAD=origin=remote 09622c0; Commit B absent. SQL26 mit Rollback 79ec07cd auf SQL25 f7226f6a zurückgeführt; Core/Wrapper absent, F48-SELECT false, V1 66/cfddb1fa, V2 0/0/0, Trend 2/976373b6, Profil e17f64da… und drei Legacy-Edges unverändert; 0 inflight. Incidents-Runs 32902627552/32907728534 liefen auf 09622c0 gegen unveränderte v22/true und scheiterten 401/curl22. Fehlerfolge begann vor Commit A; kein Rerun/Fix.` | PASS / SAFE HALT |
| EV-ACT-R13-C36 | 2026-08-26 kontrolliertes Incidents-Credential-Gate | Aktiven lokalen Legacy-Service-Role-Key geheim neu binden und genau einen frühen No-write-Nachweis führen. | `FAIL / SAFE HALT: ignorierte lokale Env enthält genau einen vollständigen Legacy-JWT-Wert für den richtigen Projekt-Ref; status-only REST-Check 200. GitHub SUPABASE_SERVICE_ROLE_KEY aktualisiert, Wert nie ausgegeben. Manueller incidents/all-Run 32935444536 auf 09622c0 scheitert erneut HTTP 401/curl22 gegen unveränderte v22/true. Vorher/nachher: Deliveries 16/c238bdcb…, Subscriptions 2/0f207837…, Medications 3/2142582b…, Slots 3/6880bb63…, Slot-Events 135/03017b93…, BP 174/6d29a674…; 0 inflight. Kein zweiter Run, keine Rotation/Migration/Edgeänderung und kein S5.7-Re-Forward.` | FAIL / NO-WRITE / STOP |
| EV-ACT-R13-C37 | 2026-08-26 minimaler Incident-Same-source-Redeploy | Prüfen, ob ein source-/flaggleicher Redeploy die eingebaute Service-Role-Bindung aktualisiert, ohne Fachcode oder Authvertrag zu ändern. | `FAIL / SAFE HALT: gesicherte v22/true-Remotequelle bestand aus exakt index.ts und request-contract.ts. Beide Dateien wurden unverändert als v23/true redeployt; v23 ACTIVE, beide Sourceinhalte exakt gleich, Public 401, neuer Bundlehash 85c90acf… nur diagnostisch. Der lokal strukturell vollständige und gegen REST status-only mit 200 aktive Legacy-Key liefert bei POST mit absichtlich ungültigem mode weiterhin 401 statt des vertraglich erwarteten Handler-400; dieser Pfad bricht garantiert vor jedem Datenread/-write ab. Kein Workflow gestartet. Deliveries 16/c238bdcb… und Subscriptions 2/0f207837… unverändert; 0 inflight. Serverseitige bytegleiche Keybindung damit nicht hergestellt.` | FAIL / NO-WRITE / STOP |
| EV-ACT-R13-C38 | 2026-08-26 Dashboard-/Handler-Orakel | Aktuell kanonischen Legacy-Key ohne Ausgabe gegen lokale/GitHub-Bindung vergleichen und 401-Schicht eindeutig bestimmen. | `PASS / OWNER DECISION: In angemeldeter Supabase-Control-Plane wurde service_role kurz sichtbar gemacht, ausschließlich im Browser-/Prozessspeicher verglichen und wieder verborgen. Dashboardwert ist strukturell vollständig und bytegleich mit .env.supabase.local; GitHub war zuvor aus genau diesem lokalen Wert aktualisiert worden. Direkter POST mit absichtlich ungültigem mode liefert Status 401 und exakt die Handler-eigene Fehlerklasse Unauthorized, nicht Gateway Invalid JWT; Bodykeys ausschließlich error. Damit kann ein erneutes Recopy nichts ändern. Supabase-Secretliste nur nach Namen/Updated-Metadatum geprüft; kein Wert/Digest ausgegeben. Kein Workflow, kein Datenwrite, 0 inflight.` | PASS / NEW P1 DECISION |
| EV-ACT-R13-C39 | 2026-08-26 F50-Alias-Gate | Owner-freigegebenen isolierten Alias setzen, minimalen Handlerdelta produktiv beweisen und bei jeder Datenabweichung sofort reversieren. | `PASS / SAFE CLOSURE: INCIDENTS_PUSH_LEGACY_KEY geheim aus bestätigtem Dashboard-/Local-Key angelegt, nur Name/Updated-Metadatum geprüft. v25/true enthielt exakt drei Deltas: Alias lesen, required prüfen, Caller gegen Alias vergleichen; interner createClient blieb auf eingebautem Service-Key. Source exact/ACTIVE; Public/missing 401, gültiger anon Handler-401, korrekter Alias pre-data 400. Workflow 32938596519 auf 09622c0 SUCCESS einschließlich HTTP-Schritt. Deliveries 16/c238bdcb… und Subscriptions 2/0f207837… unverändert. Erster Full-Postcheck sah Slot-Events 135→138 und Medicationhash 2142582b…→5cea05df…; deshalb sofortiger v23/true-Reverse als v26, sourcegleich/Public 401/0 inflight. Metadata-only lokalisierte exakt drei Events und drei Medicationupdates auf 06:32:13Z, 14 Sekunden vor Dispatch 06:32:27Z; Functionquelle liest diese Tabellen nur und schreibt ausschließlich Deliveries/Subscriptions. Kein Workflowwrite. Dasselbe Alias-Postimage danach als v27/true erneut ACTIVE/sourceexact; Public 401, korrekter Alias 400, 0 inflight. Kein S5.7-Re-Forward.` | PASS / PRODUCTION |
| EV-ACT-R13-C40 | 2026-08-26 F50 Safe Closure | Den bereits real ausgeführten v23/true-Reverse ohne Secretmaterial für einen späteren sofortigen Reverse außerhalb des Git-Worktrees persistieren und seine Integrität prüfen. | `PASS / ROLLBACK READY: C:\Users\steph\AppData\Local\Temp\midas-r13-f50-incident-v23-rollback-20260826 enthält ausschließlich das normalisierte Legacy-Sourcepreimage index.ts SHA-256 8239149c… (30861 Byte), request-contract.ts SHA-256 4bd31df0… (4036 Byte) und config.toml SHA-256 d1d0a91d… (50 Byte) mit explizitem verify_jwt=true. Die Source-Dateien unterscheiden sich vom zuvor bytegenau gesicherten Remote-Preimage nur durch den vom Patchwerkzeug gesetzten finalen Zeilenumbruch; das akzeptierte normalisierte Source-/Flag-Orakel bleibt erfüllt. Artefakt liegt außerhalb des Repositories, ist nicht gestagt und enthält keine Schlüsselwerte.` | PASS |
| EV-ACT-R13-C41 | 2026-08-26 S5.7-Re-Forward bis Commit A | Den sicheren SQL-/Edge-Forward aus dem F50-Haltepunkt wiederherstellen, F50 in Git reproduzierbar machen und Commit A strikt von Web/PWA und fremden Diffs trennen. | `PASS / COMMIT A: Incident-Aliasdelta lokal normalisiert exakt gleich v27; neuer statischer Authvertrag plus bestehender Requestvertrag 5/5 PASS. Prebaseline V1 66/cfddb1fa, V2 0/0/0, Report 1/a77dd888, Profil 1/e17f64da, Trend-State 2/976373b6 und Events 0. SQL26 71faf186 aktiviert: User/Service/Core cffcd679/eb27ec44/abb59627, nur Core mit UNION, Minimal-ACL; F48 gewährt ausschließlich authenticated SELECT unter RLS, kein User-DML/Anon. Monthly v61/true mit sieben Quellen exact/Public 401; Protein v31/false und Trend v32/false mit je sechs Quellen exact/Public 401/Named 200-dry_run. Sämtliche geschützten Hashes unverändert. Commit d121adadc585f92d3d562044d0062ae22e530265 enthält genau 22 Runtime-/SQL-/Workflow-/Testpfade einschließlich F50, keine Web/PWA/Doku/Env-Pfade; gepusht, HEAD=origin=remote, 0 Zielworkflows inflight. Commit B nicht begonnen.` | PASS / ACTIVE |
| EV-ACT-R13-C42 | 2026-08-26 S5.7 Protein-Workflow | Nach Commit A genau den Proteinworkflow dispatchen und SHA, HTTP-Schritt sowie erlaubte Produktwirkung vor Trend beweisen. | `PASS: Run 32962050543 wurde per workflow_dispatch auf exakt d121adadc585f92d3d562044d0062ae22e530265 gestartet und vollständig SUCCESS; Job run-protein-targets und Schritt Call Protein Targets Edge Function grün. Profil-Singleton blieb wegen identischem aktuellem Vertrag erwartungsgemäß idempotent 1/e17f64da. Activity V1 66/cfddb1fa, Activity V2 0/0/0, Trend-State 2/976373b6 und Trend-Events 0 unverändert. Trend wurde noch nicht dispatcht; Commit B weiterhin absent.` | PASS |
| EV-ACT-R13-C43 | 2026-08-26 S5.7 Trendpilot-Workflow | Erst nach grünem Protein-Gate genau den Trendpilotworkflow dispatchen und das letzte Runtime-Continuation-Gate vor Commit B schließen. | `PASS: Run 32962149903 wurde per workflow_dispatch auf exakt d121adadc585f92d3d562044d0062ae22e530265 gestartet und vollständig SUCCESS; Job run-trendpilot und Schritt Call Trendpilot Edge Function grün. Activity V1 66/cfddb1fa, Activity V2 0/0/0, Profil 1/e17f64da, Trend-State 2/976373b6 und Trend-Events 0/4f53cda1 unverändert. 0 unerlaubte Produktwrites; Commit B war während des gesamten Gates absent und ist nun freigegeben.` | PASS |
| EV-ACT-R13-C44 | 2026-08-26 S5.7 Web/PWA-Cutover | Commit B, Pages und produktive Browserpfade nach zwei grünen Workflows aktivieren. | `PASS: Commit B 4aa97f92eda66600faa2b2b63f4780c5e60e6b59 enthält exakt acht eingefrorene Web-/PWA-Pfade und keine Runtime-/Workflow-/Doku-/Ownerpfade. Pages 32962301099 SUCCESS auf exakt diesem SHA. Fresh Client sowie vorhandener v6→v7-Upgradeclient laden SW v7 und den finalen Read-Consumer-Productload; keine R14-Writer-/Captureloads. Doctor View nach Owner-Unlock PASS. Neuer Range-Arztbericht bis 26.08.2026 wurde produktiv erstellt; der sichtbare Health-Export-V3-Pfad wurde ausgelöst und kehrte ohne UI-Fehler in den Idle-Zustand zurück.` | PASS |
| EV-ACT-R13-C45 | 2026-08-26 S5.8 finales Postimage | Vollständigen Git-/SQL-/Edge-/Workflow-/Web-/Daten-/Advisorzustand nach dem letzten Produkt-Smoke beweisen. | `PASS: HEAD=origin/remote 4aa97f92; 0 inflight. SQL26 und F48-Minimalgrant aktiv. Monthly v61/true, Protein v31/false, Trend v32/false und Incident v27/true ACTIVE; Public-/Source-/Flag-Orakel bleiben gültig. Protein 32962050543, Trend 32962149903 und Pages 32962301099 SUCCESS. V1 66/cfddb1fa; V2 Sessions/Items/Sets 0/0/0; Report-Singleton erwartungsgemäß 1/04619cae; Profil 1/e17f64da; Trend-State 2/976373b6; Trend-Events 0/4f53cda1. Advisors unverändert vier bekannte Security-WARN und acht Performance-INFO; kein neues P0/P1.` | PASS |

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R13-L01 | S4.1/S5 | User-/Named-Secret-/Cross-Key-/Public-/Legacy-Authmatrix | nur exakte Principals; keine Rohfehler | `PASS S4.1: ursprünglicher Principal 1a6ef334...ad32d, Runtime f49b44ac...6339; npm:@supabase/server@1.4.1; Format/Lint/Typecheck grün; 10/10 Deno-Tests für reale User-JWT-Prüfung, beide Named Secrets, Cross/Public/Legacy/Bearer/Malformed/Missing-Owner, Ein-RPC-Routing, 400-Tage-Grenze und sanitierte Fehler. S5.4-F39-Finalpostimage: Principal 18c04fd1...ba2f, Test 4e15db01...862a, Runtime unverändert; providerkonforme Unterstrichsyntax; gezielt Format/Lint/Check, Principal 6/6, Protein/Trend 12/12 und L07 5/5 erneut PASS` | PASS |
| EV-ACT-R13-L02 | S4.2/S5 | SQL25/26 Fresh/Rerun/Drift/Auth/RLS/BOLA/Range/Cap/Rollback | ein kanonischer Kern; exakte ACL; keine Fachdaten-DML | `PASS final: PG17-Fixture e99842a8...3987; SQL26 71faf186...7c47, Rollback 79ec07cd...5299, SQL16 682f849e...2700. Kataloghashes User cffcd679...9f2b, Service eb27ec44...6f54, Core abb59627...f79f; Fresh/Rerun, genaue Owner/Mode/ACL/Overloads, R9-Helper, RLS/BOLA, Empty/V1/V2/Mixed/Same-day/Vienna, 400 PASS/401 fail, Caps, einzige Union, geschützte Datenhashes, SQL25-f722-Rollback und Forward PASS. S5.2 ersetzt wirkungsloses \quit 1 durch assert_true; Full Fixture erneut PASS; Produktions-SQL-DML-Scan null` | PASS |
| EV-ACT-R13-L03 | S4.3/S5 | Doctor/Health V3 Contract + Browser Desktop/390/320 Fresh/Upgrade | report-first, all-or-error, V1 Delete, V2 read-only | `PASS S4.3: Node Productcontract 4/4; Playwright 5/5 plus Browser-Plugin-QA bei 1280x900, 390x844 und 320x800; report-first/lazy, Ready/Empty/Error/Stale/Range/Close/Logout, exakt ein Snapshot, V1-only Delete, V2 ohne Control, Health V3 all-or-error und 0 Download bei Fehler, 0 Overflow/Konsolenfehler. Exakte Scriptreihenfolge, keine R14-Loads, Doctor-scoped CSS, SW v7 Fresh und v6→v7 Upgrade. Hashes Doctor 3505237e...616e, CSS 34e02c7b...9273, index 869d73f3...7257, SW a61c447d...7f63, Productcontract 8d2691c8...5322, Browser 72023787...177f; R11 Data/View/Health f30fa02a/0bacdccb/6a7b9126/538a9db1 unverändert` | PASS |
| EV-ACT-R13-L04 | S4.4/S5 | Range-Report V1/V2/Mixed/Empty/Legacy/Error | neue Reports gemeinsam; alte Snapshots unverändert | `PASS S4.4: Handler-Integration 4/4 plus Deno Format/Lint/Check; requestlokaler Userclient mit echtem Bearer/RLS und genau einem SQL25-RPC, direkte V1-View-Abfrage entfernt. V1/V2/Mixed/Empty projizieren exakte R11-Copy/Meta/Series; Snapshot-/Contractfehler haben 0 Repositorycalls und sichere Fehler; gespeicherte Reports außerhalb des expliziten Lifecycles unberührt. Handler e7bf04bb...08b8, Test 1d4f82dd...e079; R11 TS Consumer f25f45c4...386e und Report c7f79c2b...ad8 unverändert` | PASS |
| EV-ACT-R13-L05 | S4.5/S5 | Protein User/Secret/Formula/Lock/Cooldown/Error | Formel gleich; v1.3; kein Teilwrite | `PASS final: Handler-Integration 6/6, R12-Adapter 4/4 sowie Deno Format/Lint/Check. User- und spezifischer Schedulerprincipal nutzen requestlokal genau einen 28-Tage-SQL25-Snapshot; exaktes Body-Keyset ohne Owner, explizite Ownerfilter, sichere Fehler und dry-run null Writes. Kalenderungültige ISO-Tage werden vor I/O abgewiesen. Formel, CKD, Doctor-Lock, ACT1/2/3 und Rundung unverändert; v1.3-Auto/Doctor und jede einzelne Cooldown-Herleitung getestet. Handler c713239c...8334, Test 41e9cb8f...45ad; R12-Adapter 3313f877...073a unverändert` | PASS |
| EV-ACT-R13-L06 | S4.6/S5 | Trend User/Secret/373+27/Legacy/N+1/Error | ein Snapshot; alte Payloads lesbar | `PASS final: Handler-Integration 6/6, R12-Adapter 4/4 sowie Deno Format/Lint/Check. User und spezifischer Scheduler laden unabhängig von Eventzahl genau einen Snapshot; 373+27=400 PASS, 374 und partielle Ranges fail-closed, Midweek-Ende bleibt im Umschlag. Neue Activity-Unterobjekte besitzen exakt level/active_days_4w/weeks_with_entries_4w; bestehende sessions_4w-Unterobjekte bleiben vollständig und ohne Hybrid erhalten, ACK/Dedup/Copy und 32 medizinische Schwellenkonstanten unverändert. Preconditions und Kontextableitung liegen vor aufgeschobenen State-/Eventwrites; Fehlerfixtures haben null Writes und sichere Fehler. Handler 9beb03f4...05e2, Test fad1237d...4939; R12-Adapter 341030d7...772b unverändert` | PASS |
| EV-ACT-R13-L07 | S4.7/S5 | Workflowheader, HTTP-Fail, Productload, Secret-/DML-/R14-Orakel | nur getrennte `apikey`-Secrets; Capture null | `PASS S4.7: R13-Isolation Node 5/5, eigenständiges Orakel und TOML-Parser grün. Config enthält exakt Monthly true sowie Protein/Trend false; beide Workflows behalten Cron/Dispatch/Payload, referenzieren exakt URL plus eigenen Key, senden nur apikey als Auth und verwenden --fail-with-body/--silent/--show-error. Productload/Cache sind nur als exakter Legacy- oder Finalzustand zulässig, Mischzustand fail-closed; Finalzustand 6 Readerloads/SW v7. R14-Loads 0, Secretmaterial 0, produktive DML 0, SQL26-Union 1, V1 Capture 1. Hashes config ab8b7ba9...0c84, Protein-YAML 1946d559...b936, Trend-YAML 9ba2f1b0...9880, Orakel c2dab619...0e7c, Test 62f34864...f38a` | PASS |
| EV-ACT-R13-L08 | S5 | finale integrierte Matrix und nativer Full Review | keine offenen In-Scope-P0/P1 | `PASS: S5.1 Node 38/38; Deno 81/81 valide Tests; Format/Lint/Check; PG17 Full Fixture; Browser/PWA 5/5; L07/TOML; diff-check. S5.2 nativer Full Review PASS; nach F30/F31/F33 nur L05/L06/L07/PG17/diff-check invalidiert und erneut grün. Keine offene unzugeordnete P0/P1.` | PASS |
| EV-ACT-R13-L09 | S5 | CodeRabbit Initial + Verifikation | Reviewbudget eingehalten | `PASS: CodeRabbit 0.7.5; Initial 1/1 mit 2 Minor-Issues, Verifikation 1/1 über vollständigen disposable 29-Pfade-R13-Scope mit 1 Minor + 1 Major; F30-F33 geschlossen, F34 Scopekorrektur dokumentiert; kein dritter Lauf.` | PASS |
| EV-ACT-R13-L10 | S5.6/F45 | Legacy-Signing-Uservalidator und getrennte Named-Secret-Auth | Authserver autoritativ; kein Decode/Fallback/Ownerdrift | `PASS local: Principal 520f5ca0, Test 97125731. Legacy-HS256-ähnliche Fixture ohne kid wird ausschließlich durch injiziertes Supabase-Auth-getUser akzeptiert; Owner nur validierte user.id; derselbe Bearer bindet den User-RLS-Client. 401/403 und leere Userantwort fail-closed, Auth-/Env-Ausfall 500, Bearer plus Secret fällt nie auf Scheduler zurück. Target-spezifische Named Secrets bleiben real über @supabase/server@1.4.1 getrennt. Format/Lint/Check 6 Dateien, Principal 7/7, Protein 6/6, Trend 6/6, L07 5/5, Isolationstool und diff-check PASS; nativer Security-/Scope-Review PASS; kein weiterer CodeRabbit-Lauf. Produktion: Protein Source/Public/Named/Legacy-User vollständig PASS. Trend v26 Source/Public/Named PASS, echter Userpfad HTTP 500; danach v28/true Legacy-Safe-Reverse vollständig PASS. Fehlerlokalisierung ausstehend.` | PASS PROD PROTEIN / TREND SAFE REVERSE |
| EV-ACT-R13-L11 | S5.6/F48 | Trend-State-ACL-Delta | User nur SELECT unter RLS; kein User-DML/Anon; Service unverändert | `PASS: SQL16 trennt SELECT an authenticated+service_role von I/U/D nur an service_role. PG17-20-Vollfixture endet PASS; R13-Isolation Node 5/5 und Orakel melden trend_state_acl=select_only, Secretmaterial/DML/R14 null. git diff --check und nativer Security-/Scope-Review PASS; CodeRabbit 0 weitere Läufe.` | PASS |

<!-- markdownlint-enable MD013 -->

Regeln:

- Nur invalidierte Checks wiederholen.
- R11-/R12-Evidence referenzieren, nicht kopieren.
- Lange Ausgaben in temporären Logs belassen.
- Disposable Datenbank nach Tests verwerfen.
- Kein Test erzeugt produktive Activity-V2-Daten.

## Lokale Cutover- und Rollbackartefakte

Das KEY-Postimage ist nach ausdrücklicher S5.4-Freigabe produktiv ausgeführt;
alle späteren Zustandsgrenzen bleiben an das in der Roadmap bezeichnete eigene
Owner-Gate gebunden.

<!-- markdownlint-disable MD013 -->

| Zustand | Exaktes erlaubtes Postimage | Unmittelbarer Check / STOP | Exakter Rollback |
| --- | --- | --- | --- |
| PRE | Remote unverändert: SQL25; Monthly 50/true, Protein 18/true, Trend 21/true; Legacy-Workflows; Web/SW v6 | S5.3 PRE01-PRE07, 0 laufende Runs, kein Cutover Dienstag/Freitag 00:30-02:30 UTC | keine Mutation; bei Drift STOP |
| KEY | `PASS 2026-08-24`: dormant Publishable `default` plus Secret `default`; Named Secrets `protein_targets_scheduler`/`trendpilot_scheduler` und zwei GitHub-Secrets vorhanden; beide seit Januar vorbestehenden function-spezifischen Ownerkonfigurationen unverändert; Legacy-Caller/-Keys weiter aktiv | nur Namen/Modi, niemals Werte; alte Runtime unverändert; 0 ausgelöste Zielworkflow-Runs; zwei stale Pages-Runs erst am S5.7-Pages-Gate relevant | neue Keys/Secrets dormant lassen; keine automatische Löschung/Rotation; vorbestehende Ownerkonfigurationen nicht ändern; kein Rollbackbedarf solange unreferenziert |
| SQL | SQL26-Core plus User-/service-only Wrapper und ACL; alte Edges weiter funktionsfähig | Katalog, ACL, SQL25-Parität, Datenhashes, Advisors | SQL26-Rollback auf SQL25 `f7226f6a...b3c3d` und alte private ACL |
| EDGE-M | Monthly neuer Bundle/true; Protein 18/true und Trend 21/true unverändert | User-JWT und kontrollierter Reportwrite | nur Monthly auf 50/true zurückstellen |
| EDGE-P | zusätzlich Protein neuer Bundle/false mit User + Named-Secret-dry-run; alter Proteinworkflow inkompatibel und darf nicht laufen | unmittelbar 0 Runs; beide Proteinmodi dry-run | Protein auf 18/true, bei Gesamtabbruch danach Monthly auf 50/true |
| EDGE-T | zusätzlich Trend neuer Bundle/false mit User + Named-Secret-dry-run; beide alten Scheduler inkompatibel und dürfen nicht laufen | unmittelbar 0 Runs; beide Trendmodi dry-run | Trend 21/true, dann Protein 18/true, dann Monthly 50/true |
| GIT-A | ausschließlich Runtime-/SQL-/Config-/Workflow-/Handler- und R13-Isolationspfade gepusht; Web bleibt im Legacyzustand und das Orakel verlangt `product_mode=legacy` | zwei kontrollierte Dispatches plus Profil-/Trendpostcheck | 0 Runs; Edges Trend→Protein→Monthly; Commit A revert; SQL26-Rollback |
| GIT-B | ausschließlich Doctor-/Productload-/CSS-/SW-v7-/Producttestpfade gepusht; Orakel verlangt `product_mode=final` | Pages-SHA, Fresh/v6→v7, Doctor/Health/Report, V1-Capture und R14-negativ | nur Commit B revert; Runtime/Workflows bleiben bei sonst grünem Postimage aktiv |

<!-- markdownlint-enable MD013 -->

Pfad-Freeze für die später getrennt freizugebenden Git-Aktionen:

- Commit A: `.github/workflows/protein-targets.yml`,
  `.github/workflows/trendpilot.yml`, `backend/supabase/config.toml`, die neuen
  `_shared/activity-*`-Dateien, die geänderten drei Consumer-Handler samt ihren
  neuen Integrationstests, SQL16/SQL26/Rollback/Fixture,
  `tools/activity-v2-r13-read-consumer-isolation.mjs` und
  `app/modules/vitals-stack/activity/v2/isolation.contract.test.js`.
- Commit B: `app/app.css`, `app/modules/doctor-stack/doctor/index.js`, die vier
  neuen Doctor-Product-/Harness-/Browsertestdateien, `index.html` und
  `service-worker.js`.
- Roadmap/Evidence und der fremde Owner-Diff gehören weder in A noch B; ihr
  späterer Abschluss-/Archivcommit bleibt separat owner-gated.

## Evidence-Gültigkeit und Invalidation

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Inputs / Fingerprints | Belegte Aussage | Invalidiert durch | Wiederverwendet in |
| --- | --- | --- | --- | --- |
| HCR-029 / R11 | SQL25 77be7b9f...bc572; Function f7226f6a...b3c3d; JS Consumer f30fa02a...5bc0; Data Access 0bacdccb...5791; View 6a7b9126...020f; Health V3 538a9db1...106; TS Consumer f25f45c4...386e; Report c7f79c2b...ad8 | gemeinsamer Consumer-/Report-/Health-Vertrag; pure und isolierte Nachweise gültig | SQL25, jeweiliger Consumer, Report/Health oder ihre Produktintegration; S4 invalidiert gezielt SQL-/Runtimeanteile | S2-S5 |
| HCR-030 / R12 | Shared 7e5abef4...609f; Protein 3313f877...073a; Trend 341030d7...772b; Tests 18daf12b...83c/6bdbccf1...281/3ac3e9e6...d37 | Medical Context und zwei pure Adapter, Deno 15/15 | Shared Context oder Adapter; R13-Handlerverdrahtung invalidiert nur Isolation `product_wiring=0/runtime_dependencies=0` | S2-S5 |
| EV-ACT-R13-L01 | Shared Auth + Handlerseams | Principal-/Fehlervertrag | Authhelper, Handlerauth, verify_jwt | S5 |
| EV-ACT-R13-L02 | SQL25/26/16 + PG17 | SQL-/ACL-/Rollbackvertrag | SQL/Schema/Role/Runtime | S5 |
| EV-ACT-R13-L03 | Browserconsumer + Productload + SW | sichtbarer Read-Vertrag | Doctor, Health, Scripts, Cache | S5 |
| EV-ACT-R13-L04..L06 | Edgehandler + Adapter | Consumer-/Medical-Vertrag | jeweiliger Handler/Adapter/SQL | S5 |
| EV-ACT-R13-L07 | Workflows/Productload | Cutover-/Scopevertrag | Workflow, Deployconfig, Loadliste | S5 |

<!-- markdownlint-enable MD013 -->

## Produktiver Read-only Preflight

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-ACT-R13-PRE01 | SQL25/ACL/RLS/Owner/Definition/Overloads | `PASS: PG17.6/UTC; genau 1 date/date-Signatur; f7226f6a...3c3d; postgres; STABLE INVOKER; search_path=""; EXECUTE authenticated ja, service_role/anon nein; Servicewrapper/Core absent; V1-View security_invoker=on; vier Basistabellen RLS` | none |
| EV-ACT-R13-PRE02 | Activity-/Report-/Profile-/Trendpilot-Zähler und Hashes | `PASS: V1 65/invalid 0 und geschützter Basistabellenhash 859a0619...bef7; V2 0/0/0 je 4f53cda1...b945; Range Report 1/3d4b12d6...3ba2; Profil 1/10c5f73a...03f6; Trend-State 2/976373b6...cf22; Trend-Events 0/4f53cda1...b945. Keine Payload ausgegeben; F36 geschlossen` | none |
| EV-ACT-R13-PRE03 | Edge-Versionen, verify_jwt und Bundles | `PASS: Monthly ACTIVE v50/true/914d5f8b...3182; Protein ACTIVE v18/true/05409ac0...285e; Trendpilot ACTIVE v21/true/008a7457...9772` | none |
| EV-ACT-R13-PRE04 | Keynamenexistenz und GitHub-Secretnamen, niemals Werte | `PASS für historische Named-Key/GitHub-Baseline: Supabase moderne Ziel-Keynamen protein_targets_scheduler/trendpilot_scheduler absent; GitHub PROTEIN_TARGETS_SECRET_KEY/TRENDPILOT_SECRET_KEY absent. SUPERSEDED für Owner-Env: F38 belegt PROTEIN_TARGETS_USER_ID/TRENDPILOT_USER_ID seit Januar als vorhanden; F35 beruhte auf Array-Parsefehler. Keine Werte gelesen oder ausgegeben.` | superseded durch PRE09 für das S5.4-Postimage |
| EV-ACT-R13-PRE05 | Workflows, Schedules, laufende Runs und Web-/SW-Version | `PASS: HEAD=origin/main=remote e3029629; beide Workflows active, Freitag/Dienstag 01:00 UTC plus dispatch, letzte 10 je success, 0 queued/in_progress. Pages built/legacy/main:/, HTTPS, Build e3029629; Remote-index ohne R11-Loads, SW v6 ohne R11-Assets` | none |
| EV-ACT-R13-PRE06 | Security-/Performance-Advisors und bekannte Watchlists | `PASS unverändert: 3 WARN authenticated Security-Definer executable plus 1 WARN Leaked-Password-Protection; 8 INFO unused index.` Remediation: [Definer-Lint](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [Passwortschutz](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), [Unused-Index-Lint](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index) | bekannte Watchlist |
| EV-ACT-R13-PRE07 | finale Source-/Rollback-/Fixture-Hashes vor S5.4 | `PASS am S5.3-Postimage: 27 R13-Artefakte exakt wie L01-L07; insbesondere SQL26 71faf186...7c47, Rollback 79ec07cd...5299, SQL16 682f849e...2700, PG17-Fixture e99842a8...3987, Config ab8b7ba9...0c84, Workflows 1946d559...b936/9ba2f1b0...9880, index/SW 869d73f3...7257/a61c447d...7f63. F39 invalidierte danach ausschließlich Principal und Principaltest; PRE10 enthält deren Finalhashes. Owner-Diff unverändert abgegrenzt.` | superseded nur für zwei Authdateien durch PRE10 |
| EV-ACT-R13-PRE08 | S5.4-Key-Control-Plane unmittelbar vor W00 | `PASS read-only / HISTORISCHER STOP: Owner-GO vorhanden; noch keine modernen Keys. Der direkte Named-Secret-Dialog erforderte Create new API keys. Ein vorläufiger Preview ließ ein zusätzliches Dreierset erwarten; die reale Bestätigungsmodalität wurde erst nach erweiterter Ownerfreigabe geprüft und korrigierte das Postimage auf Publishable default plus Secret default. Named-/GitHub-Ziele damals absent; beide Owner-Env-Namen seit Januar vorhanden. Kein Wert gelesen/ausgegeben.` | geschlossen durch F37/C11 |
| EV-ACT-R13-PRE09 | S5.4-Key-/Secret-Postcheck | `PASS: Supabase UI zeigt Publishable default, Secret default, protein_targets_scheduler und trendpilot_scheduler; Legacy anon/service_role weiterhin aktiv. GitHub listet PROTEIN_TARGETS_SECRET_KEY und TRENDPILOT_SECRET_KEY. Owner-Env-Namen unverändert wiederverwendet. 0 queued/in-progress Protein-/Trendpilot-Runs. Zwei seit 2025-12-18 stale queued pages-build-deployment-Runs sind unberührt und nicht durch S5.4 ausgelöst. Nur Namen/Status geprüft, keine Werte ausgegeben.` | vor S5.5 Zielworkflow-Runs, vor S5.7 zusätzlich Pages-Runs neu prüfen |
| EV-ACT-R13-PRE12 | Produktive User-JWT-Signing-Topologie versus gepinnter R13-Validator | `FAIL / F45: öffentlicher Projekt-JWKS liefert 0 Keys. @supabase/server@1.4.1 user akzeptiert nur einen Token mit alg+kid, der gegen den konfigurierten JWKS erfolgreich verifiziert wird. Reale Legacy-User-JWTs sind damit für diesen Validator nicht beweisbar; keine Token-/Claim-/Sessionwerte gelesen.` | Ownerentscheidung Signing-Key-Migration oder Validator-Neudesign |
| EV-ACT-R13-PRE13 | F45-Re-entry und produktives Safepreimage | `PASS: C23 bestätigt SQL26/ACL, Edge-Quellen/Flags, JWKS=0, Git/Pages und keine inflight Zielruns. Protein-Reverseorakel bleibt bytegleiches Legacy-v27-Sourcepreimage plus verify_jwt=true und Runtime-Smokes. Neue lokale F45-Hashes 520f5ca0/97125731; Legacy-Signing bleibt unverändert. Alltagsdatenhashes serverseitig neu baselined, keine Payload-/Secret-/JWT-Ausgabe.` | Protein atomar forward; Public/Named/User dry_run; bei Abweichung sofort Reverse |
| EV-ACT-R13-PRE10 | S5.4-Finalhashdelta und Secret-Safety | `PASS: activity-edge-principal.ts 18c04fd1...ba2f; activity-edge-principal_test.ts 4e15db01...862a. Alle übrigen PRE07-Artefakte unverändert wiederverwendet; git diff --check grün. R13-Roadmap/Evidence enthalten weder Secret-/JWT-Material noch UUIDs; Browser-Sitzungsvariablen nach GitHub-Bindung geleert.` | none |
| EV-ACT-R13-PRE11 | S5.5 Re-Preflight | `PASS: HEAD/origin/remote e3029629; Ziel-Scheduler 0. SQL25 f7226f6a, ACL und V1/V2-Baselines exakt; Advisors 4 WARN/8 INFO unverändert. Monthly/Protein/Trend numerisch 54/22/25 statt PRE03, aber Bundles 914d5f8b/05409ac0/008a7457 und verify_jwt=true exakt. F41 schließt version-only Drift ohne Contractwirkung.` | none |

<!-- markdownlint-enable MD013 -->

Preflight-Entscheidung:

- Erwartete Wirkung:
  - SQL26/ACL, drei Edge-Deploys, zwei Workflowcaller und statische
    Readeraktivierung
- Geschützte Daten:
  - Activity V1/V2, bestehende Reports, Profil, Trendpilot-Historie und
    sämtliche anderen MIDAS-Module außerhalb expliziter Runtimewrites
- Stop-Bedingung:
  - Hash-/ACL-/Version-/Zählerdrift, laufender Scheduler, fehlender Keyname,
    nicht grüner lokaler Diff oder fehlende Ownerfreigabe
  - vor S5.5: fehlende Einzel-Freigabe, Ziel-Scheduler queued/in-progress,
    SQL-/ACL-/Daten-/Advisor-Drift oder Abweichung vom KEY-Postimage
- Owner Briefing:
  - S4.1-S5.5 PASS; SQL26 und Monthly v58 sind produktiv grün
  - Protein ist nach dem realen Legacy-JWT-/JWKS-Contractbruch exakt auf das
    Legacy-Bundle v27 mit `verify_jwt=true` reversiert; keine Fachdatenänderung
  - F45 verlangt eine explizite neue Owner-/Securityentscheidung; bis zum
    Kontingent-Reset gilt zusätzlich der dokumentierte Owner-Freeze C22
- Freigabe:
  - `gebündeltes konditionales S5.5-S6-GO erteilt; F42/F43 geschlossen; durch
    das danach entdeckte F45 und den Owner-Freeze C22 angehalten. F45-Neudesign
    oder Signing-Key-Migration benötigen nach dem Reset ein ausdrückliches GO`

## Produktive Aktionen

Jede Aktion benötigt eine eigene Freigabe und ihr eigenes Postimage.

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Erwartete Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R13-W00 | moderne Supabase API Keys initialisieren | ausdrücklich erweitert 2026-08-24 | Publishable `default` plus Secret `default`; keine Referenz- oder Consumeränderung; Legacykeys aktiv | exakt dieses Paar angelegt und dormant belassen; reale Modalität statt Preview belegt; keine Werte ausgegeben | PASS |
| EV-ACT-R13-W01 | benannten Protein-Secret-Key anlegen | erteilt 2026-08-24 | neuer Keyname, keine Consumeränderung | `protein_targets_scheduler` angelegt; providerkonformer Name und Secret-Typ bestätigt; Wert nur direkt zum vorgesehenen GitHub-Dialog transferiert | PASS |
| EV-ACT-R13-W02 | benannten Trendpilot-Secret-Key anlegen | erteilt 2026-08-24 | neuer Keyname, keine Consumeränderung | `trendpilot_scheduler` angelegt; vom Protein-Key getrennt; Wert nur direkt zum vorgesehenen GitHub-Dialog transferiert | PASS |
| EV-ACT-R13-W03A | zwei function-spezifische Ownerkonfigurationen im Supabase-Secretstore nachweisen; kein Rewrite | erteilt 2026-08-24 | feste serverseitige Ownerbindung; keine Request-/Datenänderung | PASS read-only: beide Namen seit Januar vorhanden; Werte nicht gelesen, keine Mutation | PASS PREEXISTING |
| EV-ACT-R13-W03 | zwei GitHub-Secrets setzen | erteilt 2026-08-24 | Werte nur im Secret Store | beide Zielnamen vorhanden; Werte nie ausgegeben, nach Dialogbindung aus der Browser-Sitzungsvariable entfernt; 0 Zielworkflow-Runs ausgelöst | PASS |
| EV-ACT-R13-W04 | SQL26 ausführen / nach Reverse erneut aktivieren | gebündeltes GO 2026-08-24 | kanonischer Kern + zwei Wrapper/ACL | nach F42/F43-Safereverses erneut exakt aktiv: cffcd679/eb27ec44/abb59627, Minimal-ACL; V1 66/cfddb1fa und V2 0/0/0 unverändert | PASS / ACTIVE |
| EV-ACT-R13-W05 | Monthly-Report-Edge deployen | gebündeltes GO 2026-08-24 | neue Reports nutzen gemeinsamen Snapshot | v58/true/957159c0 ACTIVE; sieben Quellen bytegleich; 401-Negativpfad und sichtbarer User-Report-Smoke PASS; Singleton-Report 1/5d5ec8b3 | PASS |
| EV-ACT-R13-W06 | Protein-Edge deployen | gebündeltes GO 2026-08-24 + D32-GO 2026-08-25 | duale Auth + gemeinsamer Snapshot | historische v23-v27-Sequenz sicher reversiert. F45-Forward v28/false: sechs Quellen bytegleich, Public 401, Named Secret 200/No-write und echter Legacy-User-dry-run PASS; Datenhashes unverändert; v27/true-Reverse separat bereit | PASS / ROLLBACK READY |
| EV-ACT-R13-W07 | Trendpilot-Edge deployen | gebündeltes GO 2026-08-24 + D32-GO 2026-08-25 | duale Auth + ein Snapshotumschlag | Historisch v26 User-500 und v28/true-Safe-Reverse. Nach F48 v29/false: sechs Quellen bytegleich, Public 401, Named Secret 200/No-write und echter Legacy-User-dry_run PASS 200; geschützte Daten unverändert. v25/true-Reverse bereit. | PASS / ROLLBACK READY |
| EV-ACT-R13-W08 | Workflow-/Webdiff committen und pushen/deployen | gebündeltes GO 2026-08-24 | Scheduler und sichtbare Reader aktiv | wegen F45 nicht begonnen | NOT REACHED |
| EV-ACT-R13-W09 | Rollback ausführen | gebündeltes GO 2026-08-24 | vorheriges bewiesenes Postimage | Historisch Monthly Legacy-Source/true v56/v57 und SQL26-Rollback auf SQL25 bei F42/F43. Protein-v27/true-Orakel bleibt bereit. Trend nach User-500: v27 behielt false; expliziter true-Reverse als v28 ACTIVE, Source d16339af exakt v25, Public 401 und Datenpostimage unverändert | PASS CURRENT TREND / ROLLBACK READY |
| EV-ACT-R13-W10 | minimalen Trend-State-SELECT-Grant ausführen | gebündeltes GO S5.5-S6 | authenticated liest ausschließlich eigene RLS-Statezeilen; kein User-DML | Fail-closed-Precheck und Einzel-GRANT PASS. Postcheck: authenticated SELECT true, I/U/D false, anon false, service all true, RLS true und eine SELECT-Policy; geschützte Datenhashes unverändert. Exakter Gegen-REVOKE bereit. | PASS / ACTIVE / ROLLBACK READY |

<!-- markdownlint-enable MD013 -->

## Vorher-/Nachher-Nachweis

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| SQL25 | authenticated-only R11 | extern kompatibel, kanonischer Kern | SQL26 aktiv; öffentlicher Uservertrag kompatibel, postgres-owned und authenticated-only | PASS / ACTIVE |
| service-only Snapshotwrapper | absent | nur postgres/service_role | SQL26-Wrapper/Core aktiv; minimale postgres/service_role-ACL | PASS / ACTIVE |
| Doctor/Health Productload | R11 isoliert | aktiv; V1 Capture unverändert | lokal final, produktiver Web-/PWA-Cutover nicht begonnen | WAIT S5.7 |
| Monthly Report | direkte V1 Activity | gemeinsamer Snapshot für neue Reports | v58/true aktiv; User-Report-Smoke und kontrollierter Singleton-Write grün | PASS / ACTIVE |
| Protein | direkte V1 Count + Legacy Scheduler | gemeinsamer Snapshot + User/named Secret | v28/false aktiv; Source, Public 401, Named Secret und echter Legacy-User-dry-run grün; v27/true-Reverse bereit | PASS / ACTIVE |
| Trendpilot | direkte V1 Rows + Legacy Scheduler | ein Snapshot + User/named Secret | v26/false scheiterte nur im echten User-dry-run mit HTTP 500; vollständig auf bytegleiches Legacy-v25-Sourcepreimage als v28/true reversiert; Public 401 und Datenpostimage grün | STOP / SAFE REVERSE |
| Workflows | gemeinsamer Legacy Bearer | getrennte `apikey`-Secrets | produktive Workflows unverändert; Cutover nicht begonnen | NOT REACHED |
| Activity-V2 Capture | inaktiv | inaktiv | V2 weiterhin 0/0/0; kein Writer/Productload aktiviert | PASS / PROTECTED |

<!-- markdownlint-enable MD013 -->

Geschützte Negativnachweise:

- keine Activity-V2-Session erzeugt
- kein alter Arztbericht migriert
- keine alte Trendpilot-Payload umgeschrieben
- keine Proteinformel, Trendpilot-Aussage oder Doctor-Hierarchie verändert
- keine Legacy Keys deaktiviert oder gelöscht
- keine anderen Edge Functions oder Clients migriert

## Deploy- und Runtime-Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Ziel | Version / Run-ID | Smoke | Schreibwirkung | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R13-R01 | SQL25/26 + F48 ACL | SQL26 71faf186 / Rollback 79ec07cd; Trend-State SELECT-Revoke separat | User/Service/Core aktiv; authenticated Trend-State SELECT nur unter RLS, kein User-DML/Anon; Service-DML unverändert | DDL/ACL; keine Fachdaten-DML; V1 66/cfddb1fa, Trend-State 2/976373b6 und V2 0/0/0 hashgleich | PASS / ACTIVE / ROLLBACK READY |
| EV-ACT-R13-R02 | Monthly Report | v58 forward; v56/v57 accepted reverse baseline | true/ACTIVE; Quellen bytegleich; anonymer 401 und sichtbarer User-JWT-/Report-Smoke PASS | kontrolliertes In-place-Update des einen Range-Reports | PASS / ROLLBACK READY |
| EV-ACT-R13-R03 | Protein Target | v23-v27 historisch; v28 F45-Forward | v28/false Source/Public/Named/echter Legacy-User PASS; v27/true-Reverse bereit | alle drei Smokes null Write; V1 66, Body 52, Profil 1, Range-Report 1 und V2 0/0/0 hashgleich | PASS / ROLLBACK READY |
| EV-ACT-R13-R04 | Trendpilot | v25 Legacy; v26 erster Forward; v27/v28 Reverse; v29 F48-Forward | v29/false ACTIVE, Source/Public/Named/echter Legacy-User PASS; v25/true-Reverse bereit | beide Dry-runs null Write; V1 66/cfddb1fa, Trend-State 2/976373b6, Trend-Events 0/4f53cda1 und V2 0/0/0 hashgleich | PASS / ROLLBACK READY |
| EV-ACT-R13-R05 | Workflows | Protein 32962050543; Trend 32962149903 | beide exakt auf Commit A d121adad SUCCESS; HTTP-Schritte grün | Profil idempotent; Trend/V1/V2 unverändert | PASS |
| EV-ACT-R13-R06 | Web/PWA | Commit B 4aa97f92; Pages 32962301099 | Fresh/Upgrade/Doctor/Report/Health-V3 PASS | nur Report-Singleton erwartungsgemäß aktualisiert | PASS |
| EV-ACT-R13-R07 | R14-Negativorakel | finaler Commit B/Productload/DB | V1 Capturepfad weiter geladen; keine V2-Writer-/Coaching-Productloads | V2 0/0/0 | PASS / PROTECTED |

<!-- markdownlint-enable MD013 -->

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Befund | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- | --- |
| F-ACT-R13-01..11 | Roadmap initialer Contract Review | initiale Vertragsfindings | im Ziel-/Decision-/Scope-/S4-/S5-Vertrag geschlossen | Dokument-Contract-Review | fixed |
| F-ACT-R13-12 | EV-ACT-R13-B06 | Hosting-/Commit-/Pushweg in S1 zu belegen | Pages `main:/`, HEAD-Build und Revertweg belegt; S4R trennt Workflow-/Webcutover | S1 Runtime-/Hostingreview | fixed |
| F-ACT-R13-13 | Git-Context | parallele R1-/C2-Archivmoves nicht R13 zuschreiben | Owner-Moves erhalten und Watchlist abgegrenzt | Blobs bytegleich; kein R13-Codediff | bounded |
| F-ACT-R13-14 | Roadmap Ausführungslogik | wiederholte Substep-Freigaben vermeiden | drei owner-gatete autonome Wellen | Dokument-Contract-Review | fixed |
| F-ACT-R13-15 | EV-ACT-R13-B05/B06 | deklarative per-Function-`verify_jwt`-Quelle fehlte | S4.7 ergänzt exakte `config.toml`-Deklaration | Protect-Orakel PASS | fixed in target |
| F-ACT-R13-16 | S2 SQL-/ACL-Review | `midas_private` ist authenticated-only und schützt einen R9-Helper | SQL26/SQL16 minimal erweitert; Helper service=false; alte ACL im Rollback | PG17 ACL-/Rollbackfixture PASS | fixed |
| F-ACT-R13-17 | S2 Supply-/Auth-Review | unversionierter offizieller Authimport wäre driftanfällig | `npm:@supabase/server@1.4.1` gepinnt | kombinierte benannte Modi mit realem Paket geprüft | fixed |
| F-ACT-R13-18 | S2 Produktiv-Smoke-Review | Protein hatte keinen no-write Named-Secret-Pfad | strikt authentifiziertes `dry_run`; Trend-dry-run erhalten | Handler-Smokes PASS | fixed in target |
| F-ACT-R13-19 | S3 Legacy-Upsert-Review | Trend-Conflict würde altes top-level `context` ersetzen | Legacy-Activity-Unterobjekt erhalten; kein Rewrite/Hybrid | neue Rows exakt R12; L06 PASS | fixed in target |
| F-ACT-R13-20 | S3 Product-UI-Review | R11-View-CSS existierte nur im Harness | minimale Doctor-scoped Regeln in `app/app.css` | 1280/390/320 und Overflow PASS | fixed in target |
| F-ACT-R13-21 | S3 Cutover-Review | gemeinsamer Workflow-/Webpush koppelte Rollbacks und Dirty Scope | zwei pfadselektive Commits/Pushes; Owner-Diff ausgeschlossen | Cutover-/Rollbackreview PASS | fixed in target |
| F-ACT-R13-22 | EV-ACT-R13-L01 | Authmodustyp/Lint und vermeintliche 401-Tage-Negativfixture waren lokal nicht exakt | AuthModeWithKey verengt, Testdoubles bereinigt, tatsächliche 401-Tage-Range verwendet | Format/Lint/Typecheck und 10/10 Deno erneut PASS | fixed |
| F-ACT-R13-23 | EV-ACT-R13-L02 | SQL26 brauchte im nativen Delta-Review strengere Overload-/ACL-Postconditions | Fresh/Rerun-/Postguards und Driftfixture erweitert | PG17 Full Fixture, Rollback→Forward und SQL16-Rerun PASS | fixed |
| F-ACT-R13-24 | EV-ACT-R13-L03 | erstes Product-Smoke-Orakel bezog geschützte bestehende Doctor-Buttons in die neue 44-px-Anforderung ein | Orakel auf den neuen Activity-Delete-Seam begrenzt; keine globale Doctor-UI-Änderung | Playwright 5/5 und Browser-Plugin Desktop/Mobile erneut PASS | fixed |
| F-ACT-R13-25 | EV-ACT-R13-L04 | erste Handler-Fixture übergab drei Rangefelder an den exakten Zweifeld-Runtimevertrag und enthielt unnötige `async`-Doubles | `{from,to}` normalisiert und Promise-Doubles lintrein gemacht | Format/Lint/Check und Deno 4/4 erneut PASS | fixed |
| F-ACT-R13-26 | EV-ACT-R13-L05 | erster Protein-Review fand unversionierten Edge-Runtime-Typimport und ein unnötiges `async`-Testdouble | Runtime-Typimport auf Major 2 gepinnt und Promise-Double lintrein gemacht | Format/Lint/Check, Handler 6/6 und R12-Adapter 4/4 erneut PASS | fixed |
| F-ACT-R13-27 | EV-ACT-R13-L06 | erster Trend-Review fand State-Persistenz vor vollständiger Activity-Kontextvalidierung sowie ein Event-Sonntagsende hinter einem Midweek-Inputende | State-Writes bis nach kompletter Kontextableitung aufgeschoben; 28-Tage-Activityfenster am validierten Snapshotende gebunden | Midweek- und Contractfehler-Orakel, null Precondition-Writes, Format/Lint/Check, Handler 6/6 und R12-Adapter 4/4 PASS | fixed |
| F-ACT-R13-28 | EV-ACT-R13-L07 | erster Isolation-Entwurf zählte Pfadnennungen in Kommentaren und verlangte ausschließlich das finale Webpostimage, obwohl Commit A bewusst noch Legacy-Web trägt | exakte Script-/Cache-Tags zählen; nur vollständiger Legacy- oder Finalzustand erlaubt, jeder Mischzustand fail-closed | R13-Orakel, Node 5/5, TOML-Parse und diff-check erneut PASS | fixed |
| F-ACT-R13-29 | EV-ACT-R13-L08 | erster integrierter Lauf führte sechs absichtlich invalidierte R11-Preaktivierungsassertionen mit, Deno ohne lokale Leseberechtigung und Playwright über den blockierten PowerShell-Launcher aus | obsolete Isolationstests explizit ausrouten, `--allow-read` ergänzen und `playwright.cmd` verwenden; keine Produktänderung | Node 38/38; Deno 75/75 + 6/6; Browser 5/5; übrige S5.1-Matrix PASS | fixed |
| F-ACT-R13-30 | EV-ACT-R13-L09 Initial | Protein akzeptierte formal passende, aber kalenderungültige ISO-Tage | UTC-Kalenderrundtrip vor Range/RPC ergänzen | Protein Format/Lint/Check; Handler 6/6 + R12 4/4; L07 PASS | fixed |
| F-ACT-R13-31 | EV-ACT-R13-L09 Initial | Trendpilot ersetzte einen nur halb gesetzten Range durch Default | partielle From/To-Paare vor Defaultauflösung abweisen | Trend Format/Lint/Check; Handler 6/6 + R12 4/4; L07 PASS | fixed |
| F-ACT-R13-32 | EV-ACT-R13-L09 Verifikation | Resume Card nannte bereits abgeschlossene S4-/S5.1-Anteile als nächsten Schritt | auf S5.3 und STOP vor S5.4 synchronisieren | Dokument-Contract-Review | fixed |
| F-ACT-R13-33 | EV-ACT-R13-L09 Verifikation | PostgreSQL 17 ignoriert das Extraargument von `\quit 1`; der Fixture-Fehlerzweig lieferte Exitcode 0 | boolesches Ergebnis nach `reset role` mit `midas_fixture.assert_true` prüfen; vorhandenes `ON_ERROR_STOP` erzwingt Fehler | disposable Realprobe; korrigiertes vollständiges PG17 SQL25/26/16/Rollback-Fixture PASS | fixed |
| F-ACT-R13-34 | EV-ACT-R13-L09 Scope | Initiallauf übernahm den Windows-Temporary-Index nicht vollständig in den WSL-CLI-Scope | Verifikation in disposable exakter 29-Pfade-R13-Gitkopie inklusive neuer Dateien und ohne Owner-Artefakte | Reviewed-Files-Liste vollständig; Kopie und Temporary-Index entfernt | fixed |
| F-ACT-R13-35 | EV-ACT-R13-PRE04 | die Owner-Env-Namen wurden durch falsches PowerShell-Array-Pipelining als fehlend klassifiziert und deshalb irrtümlich als Set-Aktion ergänzt | durch F38 ersetzt; keine Secretwerte lesen und keine vorbestehende Konfiguration überschreiben | exakte Elementauswertung und Metadatenprüfung am S5.4-Gate | superseded by F38 |
| F-ACT-R13-36 | EV-ACT-R13-PRE02 | erste interne V1-Abfrage verwendete den View- statt des geschützten Basistabellenhashs | kanonische Baselineprojektion `health_events`, Activity-Typ, `order by id` vor Entscheidung wiederholt | V1 65/invalid 0 und 859a0619...bef7 exakt bestätigt | fixed |
| F-ACT-R13-37 | EV-ACT-R13-PRE08/C10/C11 | aktuelle Supabase-Control-Plane verlangte vor der ersten Named-Secret-Anlage die globale Aktion `Create new API keys`; ein vorläufiger Preview ließ ein zusätzliches Dreierset erwarten | vor Mutation STOP; Owner erweiterte danach ausdrücklich die Freigabe. Reale Bestätigungsmodalität und Postimage statt Preview prüfen; Initialkeys dormant/unreferenziert belassen | exakt Publishable default plus Secret default angelegt; Legacykeys aktiv; Named-Key-Controls danach verfügbar; kein automatisches Delete/Rotate | fixed |
| F-ACT-R13-38 | EV-ACT-R13-PRE04/PRE08 | `ConvertFrom-Json` lieferte ein Array, das der erste S5.3-Check als ein Pipelineobjekt behandelte; dadurch war F35 falsch | Elemente exakt auswerten; Roadmap/Evidence/Resume/Forward/Rollback auf read-only Wiederverwendung korrigieren; kein Rewrite | beide Owner-Env-Namen mit Januar-Metadaten vorhanden; keine Werte gelesen; Dokument-Contract-Review | fixed |
| F-ACT-R13-39 | EV-ACT-R13-C11/W01/W02 | Supabase wies die ursprünglichen Bindestrichnamen im realen Named-Key-Dialog ab; erlaubt sind nur Kleinbuchstaben, Ziffern und Unterstriche | vor Provisionierung Principalcode, Fixtures, Decisions und Evidence auf `protein_targets_scheduler`/`trendpilot_scheduler` synchronisieren; nur invalidierte Checks wiederholen | Format/Lint/Check, Principal 6/6, Protein-/Trendhandler 12/12, L07 5/5 und diff-check PASS; beide Keynamen produktiv vorhanden | fixed |
| F-ACT-R13-40 | EV-ACT-R13-C11 Evidence-Sync | Findings-Tabelle wechselte ab F22 unbemerkt von fünf auf sechs Spalten | Header und ältere Zeilen deterministisch auf sechs Spalten normalisiert; keine Vertrags- oder Produktänderung | Markdown-Tabellenstruktur und diff-check PASS | fixed |
| F-ACT-R13-41 | EV-ACT-R13-PRE11 | drei produktive Edge-Versionsnummern lagen über PRE03 | Remote-Bundles/Flags statt Nummer allein vergleichen; neue numerische Rollbackbaselines 54/22/25 übernehmen | Bundle-Hashes 914d5f8b/05409ac0/008a7457 und alle true-Flags exakt; SQL-/Daten-/Workflowdrift null | fixed |
| F-ACT-R13-42 | EV-ACT-R13-C13/C14/C17/W05/W09/R02 | verpflichtender positiver Monthly-User-Smoke benötigte die lokale PIN-/Passkey-Entsperrung; ein Redeploy des bytegleichen Legacy-Sourcepreimages reproduziert unter dem aktuellen Supabase-Bundler den historischen Bundlehash nicht | Schutzschicht nicht umgehen; sofortige Reversefolge. Owner akzeptiert Sourcebytegleichheit plus ursprüngliches Flag und negative/positive Runtime-Smokes als maßgebliches Rollbackorakel | Legacy-Reverseorakel akzeptiert; sichtbarer Produktionstab kontrolliert übernommen; v58/true besteht 401 und positiven User-Report-Smoke, V1/V2 unverändert | accepted / fixed |
| F-ACT-R13-43 | EV-ACT-R13-C15/C16 | neue Activity-V1-Baseline 66/cfddb1fa statt 65/859a0619 am erneuten Continuation Gate | keine Daten löschen oder umschreiben; SQL26 sofort reversieren und Ownerabsicht der einzelnen neuen V1-Erfassung bestätigen lassen | Owner bestätigt beabsichtigten heutigen Gym-Eintrag über Activity V1; 66/cfddb1fa neue Forwardbaseline, V2 0/0/0 | accepted / fixed |
| F-ACT-R13-44 | EV-ACT-R13-C18/C19/C20/C21/W06/R03 | `.env.supabase.local` enthielt statt vollständiger Named Keys nur maskierte Dashboard-Präfixe; sichtbarer Body-Pfad konnte Protein vorab mit Legacy-409 blockieren | Proteinwert sicher vollständig in Env/GitHub neu gebunden; direkter User-dry-run ohne Bodywrite ausgeführt. Trendwert lokal weiterhin unvollständig/unbenutzt | Protein Named-Secret-dry-run 200/No-write; direkter Userpfad erreichte Edge und machte den separaten F45 sichtbar | partial / superseded by F45 |
| F-ACT-R13-45 | EV-ACT-R13-C21/C23-C33/PRE12/PRE13/L10/W06/W07/R03/R04 | Produktiver Supabase-JWKS ist leer; der frühere `@supabase/server@1.4.1`-Usermodus verlangt JWKS sowie JWT-`alg`/`kid` und verwarf reale Legacy-JWTs | Owner wählt D32: Legacy-Signing bleibt; Bearer autoritativ über Supabase Auth `getUser(jwt)` validieren und denselben User-RLS-Client verwenden. Named Secrets bleiben target-spezifisch im Paketpfad; kein Decode, Claim-/Bodyowner, Logging oder Authfallback | lokaler F45-Delta PASS. Produktion: Protein v28/false und Trend v29/false bestehen Source/Public/Named/echten Legacy-User vollständig und bleiben im Dry-run No-write. Beide exakten Legacy-Source-/true-Reverses bereit | fixed / production PASS |
| F-ACT-R13-46 | EV-ACT-R13-C22 / Freeze-Full-Contract-Review | Hauptmatrix sowie ältere Test-/Vorher-Nachher-Zeilen spiegelten noch den vorletzten F42-/SQL25-Reverse statt des aktuellen F45-Haltepunkts | Roadmap und Evidence auf OWNER-PAUSED/C22, SQL26 + Monthly v58 aktiv und Protein v27/true safe reverse synchronisiert; keine technische Aktion | Tabellenstruktur und `git diff --check`; Runtime-/Contractwerte gegen C21/R01-R03 abgeglichen | fixed / P2 |
| F-ACT-R13-47 | EV-ACT-R13-C29/C30/W09/R04 | Supabase behielt beim Redeploy des Legacy-Sourcepreimages ohne expliziten Functionblock das zuvor aktive verify_jwt=false bei | Rollback-Manifest für jeden false→true-Reverse explizit auf verify_jwt=true pinnen; Source-only-Redeploy nie als vollständigen Reverse werten | v27/false erkannt; derselbe Source mit explizitem Manifest als v28/true, ACTIVE, Public 401 und Sourcehash exakt | fixed / P1 rollback |
| F-ACT-R13-48 | EV-ACT-R13-C28-C33/L11/W07/W10/R04 | Trend v26/false bestand Source/Public/Named, aber echter D32-User-dry-run endete mit HTTP 500 | Safe-Reverse zuerst; danach belegen Logs plus Proteinvergleich erfolgreichen D32-Zugang. Fehlendes authenticated SELECT auf trendpilot_state bei bestehender RLS-/Own-row-Policy minimal in SQL16 und produktiv ergänzen; kein User-DML | PG17 Full Fixture, L07, diff-check, nativer Review und produktiver ACL-/Datenpostcheck PASS. Erneuter Trend-User-dry-run auf v29/false PASS 200; unmittelbares No-write-Postimage hashgleich. | fixed / production PASS |
| F-ACT-R13-49 | EV-ACT-R13-C34/C35 | Erster S5.7-Trendworkflow scheitert nach grünem Proteinworkflow HTTP 401 | Commit B geschlossen; vollständiger Git-/SQL-/Edge-/ACL-Reverse. Trend-GitHub-Secret geheim resynchronisiert; erneuter Forward noch nicht begonnen | Revert `09622c0`, SQL25, drei Legacy-Edges true/sourcegleich/Public 401, Datenpostimage und 0 inflight PASS | contained / safe reverse |
| F-ACT-R13-50 | EV-ACT-R13-C35-C39 | Eingebauter Incident-Service-Key ist nicht bytegleich zum aktuellen vom Gateway akzeptierten Dashboard-/Local-/GitHub-Key; Recopy und Same-source-Redeploy helfen nicht | Owner-freigegebener Custom Alias `INCIDENTS_PUSH_LEGACY_KEY`; nur Callervergleich umgestellt, interner DB-Service-Key und verify_jwt=true unverändert. Konservativer Reverse bei scheinbarem Datendrift, danach zeitliche Entkopplung und exakter Re-Forward | v27/true sourceexact/ACTIVE; Public/missing/anon 401, Alias pre-data 400; Run `32938596519` SUCCESS; Pushpostimage unverändert, andere Updates vor Dispatch; 0 inflight | fixed / production PASS |

<!-- markdownlint-enable MD013 -->

## Externer Review-Nachweis

<!-- markdownlint-disable MD013 -->

| Phase | Tool / Version | Scope | Lauf | Ergebnis | Invalidierte Checks |
| --- | --- | --- | --- | --- | --- |
| S5 Initial | `coderabbit 0.7.5` | tracked uncommitted; CLI übernahm neue Dateien im Windows-Temporary-Index nicht, F34 | 1/1 | 2 Minor: F30/F31 berechtigt und korrigiert | L05/L06/L07 |
| S5 Verifikation | `coderabbit 0.7.5` | disposable exakter 29-Pfade-R13-Gesamtdiff inklusive aller neuen Dateien, Owner-Diff ausgeschlossen | 1/1 | 1 Minor + 1 Major: F32/F33 berechtigt und korrigiert; keine weitere externe Runde zulässig | Doku-Contract, PG17 Full Fixture, diff-check |

<!-- markdownlint-enable MD013 -->

- S1-S4R tatsächliche CodeRabbit-Läufe:
  - `0`
- S4-Anforderung:
  - weiterhin `0`; der erste zulässige Lauf ist S5.2
- zusätzliche Läufe:
  - `none` erwartet; Ausnahme nur nach Roadmapvertrag
- Nichtverfügbarkeit:
  - als sichtbares Evidence-Gap dokumentieren; keine Neuinstallation oder
    Ausweichinstallation

## Finaler Evidence-Digest

- Gültige Nachweise:
  - B01-B07, D01-D04, L01-L11, PRE01-PRE13, C01-C45, W00-W10 und R01-R07.
- Exakte produktive Wirkung:
  - SQL26/F48-ACL, Monthly v61/true, Protein v31/false, Trend v32/false,
    Incident v27/true, getrennte Scheduler, Commit A `d121adad`, Commit B
    `4aa97f92`, Pages `32962301099` und ein neuer Range-Report-Singleton.
- Nicht ausgeführte Nachweise:
  - Keine Activity-V2-Capture-/Deviceaktion; beides gehört ausschließlich R14.
    Kein zusätzlicher CodeRabbit-Lauf, weil das vertragliche 1+1-Budget
    ausgeschöpft war.
- Restrisiken:
  - Vier bekannte Supabase-Security-WARN und acht Unused-Index-INFO bleiben
    außerhalb R13 beobachtbar. Die globale Signing-/Keymigration bleibt ein
    separates zukünftiges Programm; Legacy-Signing wurde nicht migriert.
- Externe Reviewläufe:
  - CodeRabbit 0.7.5 exakt 1 Initial- und 1 Verifikationslauf; keine weiteren.
- Roadmap-Verweise:
  - R13 `DONE`; C3 ist das nächste Core-UI-Gate, danach besitzt allein R14 den
    Activity-V2-Capture- und Android-PWA-Cutover.

Abschlussregeln:

- Evidence erst in S6 auf `DONE` setzen.
- Bei realem Widerspruch gewinnt der erneut geprüfte Iststand.
- Nach Archivierung bleibt keine aktive zweite Source of Truth zurück.

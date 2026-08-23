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
| Zugehörige Roadmap | `docs/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Roadmap.md` |
| Status | `PAUSED; Discovery Wave S1-S4R PASS; Owner-Cut vor S4, kein GO erteilt` |
| Erstellt am | `2026-08-23` |
| Letzter Stand | `2026-08-23; Owner-Cut nach S4R protokolliert; S4 unbegonnen, Wiederaufnahme beginnt mit read-only Drift-Check` |
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
  - die spätere globale Schlüsselmodernisierung
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

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R13-L01 | S4.1/S5 | User-/Named-Secret-/Cross-Key-/Public-/Legacy-Authmatrix | nur exakte Principals; keine Rohfehler | | TODO |
| EV-ACT-R13-L02 | S4.2/S5 | SQL25/26 Fresh/Rerun/Drift/Auth/RLS/BOLA/Range/Cap/Rollback | ein kanonischer Kern; exakte ACL; keine Fachdaten-DML | | TODO |
| EV-ACT-R13-L03 | S4.3/S5 | Doctor/Health V3 Contract + Browser Desktop/390/320 Fresh/Upgrade | report-first, all-or-error, V1 Delete, V2 read-only | | TODO |
| EV-ACT-R13-L04 | S4.4/S5 | Range-Report V1/V2/Mixed/Empty/Legacy/Error | neue Reports gemeinsam; alte Snapshots unverändert | | TODO |
| EV-ACT-R13-L05 | S4.5/S5 | Protein User/Secret/Formula/Lock/Cooldown/Error | Formel gleich; v1.3; kein Teilwrite | | TODO |
| EV-ACT-R13-L06 | S4.6/S5 | Trend User/Secret/373+27/Legacy/N+1/Error | ein Snapshot; alte Payloads lesbar | | TODO |
| EV-ACT-R13-L07 | S4.7/S5 | Workflowheader, HTTP-Fail, Productload, Secret-/DML-/R14-Orakel | nur getrennte `apikey`-Secrets; Capture null | | TODO |
| EV-ACT-R13-L08 | S5 | finale integrierte Matrix und nativer Full Review | keine offenen In-Scope-P0/P1 | | TODO |
| EV-ACT-R13-L09 | S5 | CodeRabbit Initial + Verifikation | Reviewbudget eingehalten | | TODO |

<!-- markdownlint-enable MD013 -->

Regeln:

- Nur invalidierte Checks wiederholen.
- R11-/R12-Evidence referenzieren, nicht kopieren.
- Lange Ausgaben in temporären Logs belassen.
- Disposable Datenbank nach Tests verwerfen.
- Kein Test erzeugt produktive Activity-V2-Daten.

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
| EV-ACT-R13-PRE01 | SQL25/ACL/RLS/Owner/Definition/Overloads | | TODO |
| EV-ACT-R13-PRE02 | Activity-/Report-/Profile-/Trendpilot-Zähler und Hashes | | TODO |
| EV-ACT-R13-PRE03 | Edge-Versionen, verify_jwt und Bundles | | TODO |
| EV-ACT-R13-PRE04 | Keynamenexistenz und GitHub-Secretnamen, niemals Werte | | TODO |
| EV-ACT-R13-PRE05 | Workflows, Schedules, laufende Runs und Web-/SW-Version | | TODO |
| EV-ACT-R13-PRE06 | Security-/Performance-Advisors und bekannte Watchlists | | TODO |
| EV-ACT-R13-PRE07 | finale Source-/Rollback-/Fixture-Hashes | | TODO |

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
- Owner Briefing:
  - TODO
- Freigabe:
  - offen

## Produktive Aktionen

Jede Aktion benötigt eine eigene Freigabe und ihr eigenes Postimage.

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Erwartete Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R13-W01 | benannten Protein-Secret-Key anlegen | offen | neuer Keyname, keine Consumeränderung | | USER-GATED |
| EV-ACT-R13-W02 | benannten Trendpilot-Secret-Key anlegen | offen | neuer Keyname, keine Consumeränderung | | USER-GATED |
| EV-ACT-R13-W03 | zwei GitHub-Secrets setzen | offen | Werte nur im Secret Store | | USER-GATED |
| EV-ACT-R13-W04 | SQL26 exakt einmal ausführen | offen | kanonischer Kern + zwei Wrapper/ACL | | USER-GATED |
| EV-ACT-R13-W05 | Monthly-Report-Edge deployen | offen | neue Reports nutzen gemeinsamen Snapshot | | USER-GATED |
| EV-ACT-R13-W06 | Protein-Edge deployen | offen | duale Auth + gemeinsamer Snapshot | | USER-GATED |
| EV-ACT-R13-W07 | Trendpilot-Edge deployen | offen | duale Auth + ein Snapshotumschlag | | USER-GATED |
| EV-ACT-R13-W08 | Workflow-/Webdiff committen und pushen/deployen | offen | Scheduler und sichtbare Reader aktiv | | USER-GATED |
| EV-ACT-R13-W09 | Rollback ausführen | nicht freigegeben | vorheriges bewiesenes Postimage | | N/A |

<!-- markdownlint-enable MD013 -->

## Vorher-/Nachher-Nachweis

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| SQL25 | authenticated-only R11 | extern kompatibel, kanonischer Kern | | TODO |
| service-only Snapshotwrapper | absent | nur postgres/service_role | | TODO |
| Doctor/Health Productload | R11 isoliert | aktiv; V1 Capture unverändert | | TODO |
| Monthly Report | direkte V1 Activity | gemeinsamer Snapshot für neue Reports | | TODO |
| Protein | direkte V1 Count + Legacy Scheduler | gemeinsamer Snapshot + User/named Secret | | TODO |
| Trendpilot | direkte V1 Rows + Legacy Scheduler | ein Snapshot + User/named Secret | | TODO |
| Workflows | gemeinsamer Legacy Bearer | getrennte `apikey`-Secrets | | TODO |
| Activity-V2 Capture | inaktiv | inaktiv | | TODO |

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
| EV-ACT-R13-R01 | SQL25/26 | | User/Secret/ACL/Backcompat | DDL/ACL | TODO |
| EV-ACT-R13-R02 | Monthly Report | | User-JWT + neuer Report | Reportwrite kontrolliert | TODO |
| EV-ACT-R13-R03 | Protein Target | | User + Named Secret + Lock/Error | Profilwrite kontrolliert | TODO |
| EV-ACT-R13-R04 | Trendpilot | | User + Named Secret + Legacy read | Eventwrite kontrolliert | TODO |
| EV-ACT-R13-R05 | Workflows | | beide manuelle Dispatches | erwartete Functionwirkung | TODO |
| EV-ACT-R13-R06 | Web/PWA | | Fresh/Upgrade Doctor/Health | keine Capturewirkung | TODO |
| EV-ACT-R13-R07 | R14-Negativorakel | | V1 Capture grün, V2 Capture null | nein | TODO |

<!-- markdownlint-enable MD013 -->

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- |
| F-ACT-R13-01..11 | Roadmap initialer Contract Review | im Ziel-/Decision-/Scope-/S4-/S5-Vertrag geschlossen | Dokument-Contract-Review | fixed |
| F-ACT-R13-12 | EV-ACT-R13-B06 | Hosting-/Commit-/Pushweg in S1 belegen | Pages `main:/`, HEAD-Build und Revertweg belegt; S4R trennt Workflow-/Webcutover | fixed |
| F-ACT-R13-13 | Git-Context | parallele bytegleiche R1-/C2-Archivmoves erhalten und nicht R13 zuschreiben | Blobs bytegleich; zwei gebrochene Altlinks als separate P2-Watchlist sichtbar, kein R13-Codediff | bounded |
| F-ACT-R13-14 | Roadmap Ausführungslogik | drei owner-gatete autonome Wellen statt wiederholter Substep-Freigaben | Dokument-Contract-Review | fixed |
| F-ACT-R13-15 | EV-ACT-R13-B05/B06 | fehlende deklarative per-Function-`verify_jwt`-Quelle | S4.7 besitzt exakte `config.toml`-Deklaration und Protect-Orakel | fixed in target |
| F-ACT-R13-16 | S2 SQL-/ACL-Review | `midas_private` ist real authenticated-only und schützt einen R9-Helper | nur Schema-Usage+neuen Core für service_role; alter Helper bleibt ohne service EXECUTE; Rollback restauriert ACL | fixed in target |
| F-ACT-R13-17 | S2 Supply-/Auth-Review | unversionierter offizieller Authimport wäre driftanfällig | `npm:@supabase/server@1.4.1`, kombinierte benannte Modi und Paketcontracttests eingefroren | fixed in target |
| F-ACT-R13-18 | S2 Produktiv-Smoke-Review | Protein hatte keinen no-write Named-Secret-Pfad | strikt authentifiziertes `dry_run`; Trend-dry-run erhalten; Workflows bleiben normale kontrollierte Writes | fixed in target |
| F-ACT-R13-19 | S3 Legacy-Upsert-Review | Trend-Conflict würde altes top-level `context` ersetzen | Legacy-Activity-Unterobjekt unverändert halten; kein Rewrite/Hybrid; neue Rows exakt R12 | fixed in target |
| F-ACT-R13-20 | S3 Product-UI-Review | R11-View-CSS existiert nur im Harness | minimale Doctor-scoped Regeln in `app/app.css`; responsive/Overflow-Orakel | fixed in target |
| F-ACT-R13-21 | S3 Cutover-Review | gemeinsamer Workflow-/Webpush koppelt Rollbacks und Dirty Scope | zwei pfadselektive Commits/Pushes; fremde Archivmoves explizit ausgeschlossen | fixed in target |

<!-- markdownlint-enable MD013 -->

## Externer Review-Nachweis

<!-- markdownlint-disable MD013 -->

| Phase | Tool / Version | Scope | Lauf | Ergebnis | Invalidierte Checks |
| --- | --- | --- | --- | --- | --- |
| S5 Initial | `coderabbit [Version]` | finaler Gesamtdiff | 0/1 | | |
| S5 Verifikation | `coderabbit [Version]` | korrigierter Diff | 0/1 | | |

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
  - TODO
- Exakte produktive Wirkung:
  - TODO
- Nicht ausgeführte Nachweise:
  - TODO mit Grund
- Restrisiken:
  - TODO
- Externe Reviewläufe:
  - TODO
- Roadmap-Verweise:
  - TODO

Abschlussregeln:

- Evidence erst in S6 auf `DONE` setzen.
- Bei realem Widerspruch gewinnt der erneut geprüfte Iststand.
- Nach Archivierung bleibt keine aktive zweite Source of Truth zurück.

# MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary - Execution Evidence

Diese schlanke Begleitdatei enthält ausschließlich die technischen Nachweise
für die additive Katalog-v2-Projektion. Fachliche Entscheidungen stehen in der
zugehörigen Roadmap und im späteren Katalog-v2-Vertrag.

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap(s) | `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap (DONE).md` |
| Status | `DONE` |
| Erstellt am | `2026-08-01` |
| Letzter Stand | `2026-08-01; S6-Doku-Sync, finaler Full Contract Review, produktiver Read-only-Sentinel und Archivierung PASS` |
| Verantwortlicher Schritt | `S4.5, S5 und S6 abgeschlossen` |
| Umgebungen | `lokal / disposable / produktiv read-only / produktiv write` |
| Archivziel | `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Evidence (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Nachweisvertrag

- Diese Datei beweist:
  - `exakten lokalen und produktiven 78-v1-/80-v2-Katalogstand, idempotenten
    SQL-21-Vertrag, Drift-Fail, R2-Kompatibilität und unveränderte Security-
    beziehungsweise Objektgrenzen.`
- Diese Datei beweist nicht:
  - `medizinische Eignung, Trainingsplan, produktive Activity-V2-UI, R4-Suche,
    reale Trainingserfassung oder Bildauthentizität.`
- Source of Truth für fachliche Entscheidungen:
  - `D-ACT-C2-01 bis -14 und Owner-Freeze der C2-Roadmap; später der separate
    Katalog-v2-Vertrag.`
- Verbotene Inhalte:
  - `Secrets, JWTs, personenbezogene Rohdaten, vollständige SQL-Dumps,
    Fotodateien oder unnötige Terminalausgaben.`

## Baseline

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-C2-B01 | lokal | R1/R2/R3-Dateien, Tests und Git-Grenze vor C2 | `PASS: geschützte R1-R3-/Produkt-/SQL-20-/Grant-Dateien gegen 1458df0 unverändert; 11/11 Syntax, 56/56 Node-Tests, Inspector-Parität und git diff --check grün` |
| EV-ACT-C2-B02 | produktiv read-only | `health_activity_catalog_entries` v1/v2-Zähler vor SQL 21 | `PASS: v1=78, v2=0, andere Versionen=0; keine produktive C2-Schreibwirkung` |
| EV-ACT-C2-B03 | produktiv read-only | R2-Objekte, RLS, Policies, ACL und RPC-Signaturen vor SQL 21 | `PASS: vier Tabellen, Strukturhash 657f31c1…ee14, vier RLS-Tabellen/Policies, zwei gehärtete RPCs und erwartete Minimal-ACLs` |

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-C2-L01 | S4.5/S5 | frischer disposable Aufbau `20 -> 21 -> 16` | v1=78, v2=80; erwartete ACL/RLS/RPCs | `midas_activity_v2_s45`, PostgreSQL 17.6, session_user/Owner postgres; 78/80/0, 47 Aliasergänzungen/24 Keys, vier RLS-Tabellen, vier Policies und zwei RPCs | PASS |
| EV-ACT-C2-L02 | S4.5/S5 | SQL 21 erneut ausführen | no-op; exakter Snapshot bleibt 80 | vollständiger Vorher-/Nachher-EXCEPT leer; Endstand v2=80 | PASS |
| EV-ACT-C2-L03 | S4.5/S5 | kontrollierter v2-Teilbestand und Inhaltsdrift in wegwerfbarer DB | SQL 21 stoppt jeweils vor dem ersten Write; v1/v2 bleiben unverändert | Teilbestand 79 und Inhaltsdrift 80 endeten jeweils mit Exit 3; Zustand blieb unverändert, kontrolliert restauriert; final 78/80/0 | PASS |
| EV-ACT-C2-L04 | S4.5/S5 | R2-Commit/Lookup mit v2 und versionsübergreifendem bestehenden Key | FK, Commit und Lookup korrekt; neuer Key ohne Alt-Historie | `high_row` zunächst null; v2-Commit created; `bench_press`-Lookup wechselte von Historie v1 auf v2, beide Versionen FK-gültig | PASS |

<!-- markdownlint-enable MD013 -->

Disposable-Grenze:

- Alle Fixture-Writes erfolgen ausschließlich im lokalen Supabase-/Docker-
  Testsystem.
- Die Fixture darf Testdaten und ihren lokalen Scope zurücksetzen; sie darf
  keine produktive URL oder produktiven Secret-Wert verwenden.
- Ausgeführt mit lokalem Supabase-CLI-2.109.1-PostgreSQL-17.6-Container; nur die
  exakt guarded Datenbank `midas_activity_v2_s45` wurde mutiert. Nach Abschluss
  waren alle drei Sessiontabellen leer und der lokale Stack wurde ohne Reset
  gestoppt. Es gab keine Remote- oder produktive Verbindung.

## Produktiver Read-only Preflight

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-ACT-C2-PRE01 | v1 exakt 78 und bidirektional vertragsgleich | `78 Zeilen; missing=0, unexpected=0; PostgreSQL 17.6` | none |
| EV-ACT-C2-PRE02 | v2 entweder 0 oder bereits exakt 80; Teilbestand/Drift blockiert vor SQL 21 | `v2=0, other=0; gültiger Erstwrite-Zustand, erwartete Wirkung 80 Inserts` | none |
| EV-ACT-C2-PRE03 | keine v2-Sessionreferenzen vor Erstwrite; R2-Schema/RPCs erwartungsgemäß | `v2-Sessionitem-Referenzen=0; vier Tabellen; korrigierter Search-Path-gebundener Strukturhash 657f31c1…ee14; zwei RPCs und Hardening PASS` | none |
| EV-ACT-C2-PRE04 | RLS, Policies und ACL entsprechen R2-/Grant-Vertrag | `vier RLS-Tabellen, vier SELECT-Policies für authenticated; Tabellen- und RPC-Minimal-ACL PASS` | none |

<!-- markdownlint-enable MD013 -->

Preflight-Entscheidung:

- Erwartete Wirkung:
  - `Bei Erstlauf exakt 80 neue catalog_version-2-Zeilen; beim validen Re-Run
    keine neue oder geänderte Zeile.`
- Geschützte Daten:
  - `Katalog v1, alle Sessiontabellen, health_events, Activity V1 und alle
    anderen MIDAS-Tabellen.`
- Stop-Bedingung:
  - `v1 != 78, v1-Drift, v2-Teilbestand/-Drift, unerwartete Sessionreferenz,
    Schema-/RLS-/ACL-Abweichung oder nicht reviewtes SQL.`
- Owner Briefing:
  - `Roadmap S5-C2-SQL.`
- Freigabe:
  - `Read-only-Gate PASS; Owner-Freigabe nach Extra-High Briefing am
    2026-08-01 ausdrücklich erteilt.`

## Produktive Aktionen

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-C2-W01 | `sql/21_Activity_V2_Catalog_V2.sql` einmal reviewt ausführen | Owner, 2026-08-01 | exakt 80 v2-Inserts | Artefakt `9c35786d…edef`; Transaktion PASS, Postconditions vollständig grün | PASS |

<!-- markdownlint-enable MD013 -->

## Vorher-/Nachher-Nachweis

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| Katalog v1 | `78; missing=0; unexpected=0` | exakt 78, unverändert | `78; kanonischer Repo-Feldhash exakt` | PASS |
| Katalog v2 | `0` | exakt 80, vertragsgleich | `80; kanonischer Repo-Feldhash exakt` | PASS |
| R2-Tabellen/Constraints | `4; Strukturhash 657f31c1…ee14` | unverändert | `4; SQL 21 ohne DDL, Objektgrenze unverändert` | PASS |
| RLS/Policies/ACL | `4 RLS; 4 Policies; ACL PASS` | unverändert | `4 RLS; 4 Policies; ACL PASS` | PASS |
| R2-RPC-Signaturen | `2; Owner/Modus/Search Path/ACL PASS` | unverändert | `2; ACL PASS` | PASS |
| v2-Sessionreferenzen | `0` | unverändert; C2 erzeugt keine Session | `0` | PASS |

<!-- markdownlint-enable MD013 -->

Geschützte Negativnachweise:

- Keine Änderung oder Löschung an Katalog v1.
- Keine Änderung an Activity V1 oder `health_events`.
- Keine neue Tabelle, Policy, Rolle, Grant, Function oder Cron.
- Keine produktive Activity-V2-Session und kein UI-Cutover.

## Deploy- und Runtime-Nachweise

Nicht relevant: C2 deployt keine Edge Function, Web-App, Android-App oder
GitHub Action. Die einzige produktive Aktion ist `EV-ACT-C2-W01`.

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- |
| F-ACT-C2-15 | Erster PRE03-Gesamthash lief im Standard-Search-Path und lieferte trotz identischer lokaler/produktiver Komponenten einen falschen Driftalarm. | Fingerprintabfrage auf denselben leeren lokalen Search Path wie SQL 20 gebunden; kein Produktwrite. | Komponenten lokal/produktiv identisch; korrigierter produktiver Hash `657f31c1…ee14` | fixed |
| F-ACT-C2-16 | Freie-Gewichte-Suchbegriffe und der kleine spätere Pflegepfad waren im eingefrorenen Vertrag unvollständig. | 31 Aliase an bestehenden Keys, 53+5 Search-Cases, read-only Inspector und Wartungsrunbook; keine neue Identität oder UI. | Vertrag/Runtime/SQL wertgleich; 56/56 JS und 58/58 Search-Cases PASS | fixed |
| F-ACT-C2-17 | Inspector erwartete zunächst einen unversionierten SQL-Dollar-Tag. | Parser auf den realen versionierten Tag korrigiert. | `activity-catalog.mjs check` PASS | fixed |
| F-ACT-C2-18 | Host-Port 54322 widersprach den absichtlichen internen Race-Reconnects auf Container-Port 5432. | Guarded Fixture im lokalen DB-Container ausgeführt; SQL unverändert. | Full/Re-Run/Teilbestand/Inhaltsdrift PASS; Sessions 0/0/0; Stack gestoppt | fixed |
| F-ACT-C2-19 | Produktiver CLI-Erstversuch löste den relativen SQL-Pfad unter `backend/` auf und fand kein Artefakt. | Vor jeder SQL-Ausführung gestoppt; Repo-internen absoluten Pfad validiert und denselben Hash ausgeführt. | SQL 21 PASS; vorherige Produktzähler unverändert | fixed |
| F-ACT-C2-20 | Vollständige Katalogausgabe wurde im lokalen Vergleichskanal gekürzt. | Read-only Postcondition auf feldweise kanonisierten SHA-256-Vergleich umgestellt. | v1/v2 Repo=Produkt exakt; 78/80/0 und Security-Grenzen PASS | fixed |
| Inherited R2 Advisor | Security Advisor meldet den intentionalen authenticated-`SECURITY DEFINER`-Commit-RPC sowie die bestehende projektweite Leaked-Password-Watchlist. | Gegen archivierten R2-Vertrag, `auth.uid()`, leeren Search Path und exakte Execute-ACL bewertet; kein C2- oder Katalogfix. | PRE03/PRE04 und R2 EV-P01 PASS | accepted / out of C2 scope |

<!-- markdownlint-enable MD013 -->

## Finaler Evidence-Digest

- Gültige Nachweise:
  - `EV-ACT-C2-B01 bis -B03, EV-ACT-C2-L01 bis -L04 und
    EV-ACT-C2-PRE01 bis -PRE04 sowie W01 PASS.`
  - `Scope-Korrektur: 11/11 Syntax, 56/56 JS, 58/58 Search-Cases,
    Contract-/Runtime-/SQL-Parität und produktiver Sentinel erneut PASS.`
  - `S6-Abschluss: Source-of-Truth-Dokumente synchron; finaler Sentinel auf
    PostgreSQL 17.6 weiterhin v1=78, v2=80, andere Versionen=0,
    v2-Sessionreferenzen=0, vier Tabellen/RLS/Policies, zwei RPCs und
    erwartete Minimal-ACLs.`
- Exakte produktive Wirkung:
  - `Exakt 80 neue catalog_version-2-Zeilen; v1 bleibt exakt 78, andere
    Versionen=0 und v2-Sessionreferenzen=0. Keine weitere Objekt-/Datenwirkung.`
- Nicht ausgeführte Nachweise:
  - `Browser-/Device-/Deploy-Smokes sind mangels Produktload nicht relevant.`
- Restrisiken:
  - `Activity V2 bleibt ohne R4-Produktverdrahtung nicht nutzbar;
    W-ACT-C2-01: kein hip_flexion-Key bis zu realem Bedarf.`
- Roadmap-Verweise:
  - `S4.5, S5 und S6 abgeschlossen; archivierte Roadmap ist fachlicher
    Abschlussnachweis.`

Abschlussregeln:

- Der finale S6-Abgleich ist PASS und diese Evidence ist `DONE`.
- Bei künftigem Widerspruch gewinnt der erneut geprüfte reale Iststand.
- Nach Archivierung besteht keine aktive zweite C2-Evidence unter `docs/`.

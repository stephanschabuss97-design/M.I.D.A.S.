# MIDAS Activity V2 R2 Unified Database and Commit API - Execution Evidence

Diese Datei sammelt ausschließlich technische Nachweise der R2-Roadmap. Sie
trifft keine neuen Produktentscheidungen und enthält keine Secrets oder
personenbezogenen Activity-Rohdaten.

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap(s) | `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Roadmap (DONE).md` |
| Status | `DONE` |
| Erstellt am | `2026-07-30` |
| Letzter Stand | `2026-07-31, S6 Source-of-Truth-Sync und finaler Contract Review PASS; R2 archiviert` |
| Verantwortlicher Schritt | `S1-S4R-Baseline sowie S4.1-S6` |
| Umgebungen | `lokal / disposable / produktiv read-only / produktiv write` |
| Archivziel | `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Evidence (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Nachweisvertrag

- Diese Datei beweist:
  - `R1-Katalogtreue, lokales Schema, Constraints, RLS/ACL, atomaren
    Rollback, Retry-Idempotenz, Historien-Lookup und einen optional
    freigegebenen produktiven SQL-Cutover.`
- Diese Datei beweist nicht:
  - `sichtbare Activity-V2-UI, IndexedDB-Draft, Consumer-Cutover, Export,
    Korrektur, Retention oder medizinische Bewertung.`
- Source of Truth für fachliche Entscheidungen:
  - `Decision Log und S2 der zugehörigen Roadmap sowie der aktive R1 Catalog
    Baseline Contract`
- Verbotene Inhalte:
  - Secrets, JWTs, Datenbankpasswörter, personenbezogene Payloads,
    vollständige Dumps und unnötige Terminaltranskripte.

## Baseline

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-B01 | Repo | R1 Semantik-/Katalog-Contract-Suite | `2026-07-31: 10/10 PASS mit Node 24.18.0; 78/78 Baseline-Entries, 565 Suchorakel-Abfragen und Produktisolation grün` |
| EV-B02 | Repo / produktiv read-only | Activity V1 SQL, RPCs und Consumer | `2026-07-31: health_events, v_events_activity und activity_add/list/delete vorhanden; 62 V1-Activity-Zeilen; sieben direkte Consumerpfade kartiert` |
| EV-B03 | lokal | Docker, Supabase CLI, psql und Config | `2026-07-31: Docker Desktop 4.84.0.234817, Client/Engine 29.6.2, desktop-linux; Supabase CLI 2.109.1, psql 16.14, config PostgreSQL 17; Core-Stack ohne optionalen Vector-Logger mit 11 Diensten PASS; DB 17.6/UTC, digest verfügbar, Loopback 54322 erreichbar; Stop/Cleanup PASS` |
| EV-B04 | produktiv read-only | bestehende Activity-V2-Namen/Objekte | `2026-07-31: PostgreSQL 17.6; 0/4 R2-Relationen, 0/2 R2-RPCs; extensions.digest(bytea,text) vorhanden` |
| EV-B05 | Repo / offizielle Supabase-Verträge / Owner | Commit-Privileggrenze | `2026-07-31: security-invoker-Schreiben benötigt caller-eigene Tabellen-INSERT-Rechte und wurde verworfen. Owner gab Option A frei: bewusst exponierter, gehärteter security-definer-Commit; keine Tabellen-DML für Browser/service_role, Lookup invoker. Aktuelle Supabase-Doku erlaubt den intentionalen privilegierten User-Endpunkt mit strikter Input-/Ownerprüfung, leerem Search Path und expliziten Execute-Rechten. Wegen der laufenden Data-API-Default-Umstellung revokt Datei 20 fail-closed bei Erzeugung; Datei 16 reassertiert die kanonische ACL. F-ACT-R2-08 closed; kein SQL geändert.` |
| EV-B06 | Repo / offizielle PostgreSQL-/Supabase-Verträge / produktiv read-only | S3 Race-, Security-, Zeit- und Cutover-Revalidierung | `2026-07-31: PostgreSQL 17.6; timezone(text,timestamptz) immutable; vier DST-Proben liefern erwartete Vienna-Daten; extensions.digest verfügbar. Lokale Anonymous-Sign-ins sind deaktiviert; der Vertrag weist zusätzlich JWT is_anonymous=true ab. Grants und RLS sind getrennte Grenzen; File 20 revokt bei Erzeugung fail-closed. ON CONFLICT-/READ-COMMITTED-Race, atomarer Fehlerrollback und zweistufiger Cutover-Stopvertrag sind geschlossen; kein Write.` |
| EV-B07 | Repo / aktuelle Supabase-/PostgreSQL-Verträge / produktiv read-only | S4 Full Readiness Review | `2026-07-31: S4.1-S4.6 vollständig auf Dateien, Reihenfolge, Invalidation, Evidence und Gates geprüft. Aktuelle Doku bestätigt getrennte Grant-/RLS-Grenzen, Default-Grant-Übergang, fail-closed is_anonymous-Prüfung und Definer-ACL/Search-Path-Härtung; Probe ohne Claim ergibt false. Ziel-PG 17.6; postgres ist BYPASSRLS; pgcrypto installiert; dblink verfügbar, aber produktiv nicht installiert. Docker 29.6.2 und CLI 2.109.1 bereit; lokaler Stack planmäßig gestoppt. F-ACT-R2-14..-20 geschlossen; S4R PASS; kein Write.` |

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-L01 | S4.1/S4.5 | Schema, 0/6-Rerun-Guard, Indizes einschließlich Katalog-FK, Constraints und R1-Katalogdrift | vollständiges Schema; exakt 78 v1-Entries; partielle/falsche Zustände atomar abgewiesen; keine V1-Wirkung | `2026-07-31 finaler Fresh Fixture Run auf PostgreSQL 17.6 PASS: 0/6, Relationstyp, falscher Constraint und RPC-Overload brechen atomar ab; Fresh Setup und kanonischer 6/6-Rerun PASS. Unabhängiger R1-JS/SQL-Vergleich 78/78 exakt, SHA-256 d0118678cccfa17e27caffc42233e54a40b40547ea3d36599e60e15f3c8cf3f8. Finaler rollennamen-normalisierter PG17-Strukturfingerprint 657f31c14b1a17e17241b1cd9aaa4c69a0622321c1f5e6e13927df4ebb23ee14.` | PASS |
| EV-L02 | S4.2/S4.5/S4.6 | Commit, Rollback, Replay, Zwei-Verbindungs-Races, direkte Writes, Two-User-RLS, Anonymous-JWT true/fehlend/null, postgres-Definer-Katalogattribute, Lint und Advisor | atomar, idempotent, nur permanente User, ownerisoliert; Definer-Warnung nur exakt intentional begründet, sonst blocker | `2026-07-31 finale Fixture PASS: vollständige Datei-16-Voraussetzungen und ACL, Strength/Duration/Duration-Distance, kanonisches Replay/Conflict, invalid-last-item ohne Teilwrite, User A/B, Claim true/fehlend/null für Commit und RLS, tatsächliche authenticated-/service_role-DML- sowie anon-RPC-Verweigerung, Owner postgres/Definer/Search Path und zwei asynchrone dblink-Races. Winner-Commit created/replayed; Winner-Rollback genau ein contender-created. db lint und Advisor WARN+ ohne Befund; zwei erwartete unused-index-INFOs nach Cleanup, elf INFOs nur Fixture-Stubs.` | PASS |
| EV-L03 | S4.3/S4.5 | Last-Performance mit gleicher Startzeit, `id desc`, Satzreihenfolge und No-History | genau letzter vollständiger Block oder `null` | `2026-07-31 finale Fixture PASS: getrimmter bekannter Key, invalid-key-Token, No-History null, Ownerisolation und zwei Sessions mit identischem started_at; erwartete session.id desc sowie vollständiger Item-Block mit Set-Reihenfolge 1,2 exakt.` | PASS |
| EV-L04 | S4.4/S4.6 | JS-Datenzugriff, Retry-ID, vier exakte SQL-/Domänentokens, Namespace und Produktisolation | Contract grün, keine Script-/V1-Wirkung | `2026-07-31: node --check für Implementierung und Test PASS; isolierter Contract 10/10 PASS. Commit-/Lookup-Schemas, drei Tracking-Modi, explizite Offset-Äquivalenz, kanonisch einmal serialisierter Body und dieselbe UUID über simulierte Transport-Retries, vier exakte SQL-Token, Auth/Netzwerk/5xx/malformed-success, strikte Antwortprojektion und Dependency-Fehler sind grün. Kombinierter unveränderter R1+R2-Lauf 20/20 PASS; Produktindex lädt data-access.js nicht, Activity V1 und DOM/IndexedDB bleiben unberührt.` | PASS |

Cutover-Kandidatenfreeze 2026-07-31 (nur lokale, reviewte Artefakte; kein
produktiver Vollzug):

- `sql/20_Activity_V2.sql`: `6926ef4d4bc3ddfcc7585b4a024a849c202c183adb4b465c1223262ef8993e6e`
- `sql/16_Explicit_Grants.sql`: `c3255c46a09f2c7c7f59ea86d07809f9c9afc65364003b8f8f41497cdf0a9c98`
- `sql/tests/20_Activity_V2_fixture.sql`: `16fdb88bf92b1d9ac166705e3f6fcfbf7d5f6ed4a2c7f0d539ef17de8cbe1b74`
- `app/modules/vitals-stack/activity/v2/data-access.js`: `f15b35597fa09d1261f3411c58be88aab29df4b4eef66f1a6c610c36af90245c`
- `app/modules/vitals-stack/activity/v2/data-access.contract.test.js`: `f4bfc01973aa2edc1393d329d65fe4493a57ab07569012517c7f5ee6a05f1306`

<!-- markdownlint-enable MD013 -->

Regeln:

- Lange Ausgaben verbleiben in temporären lokalen Logs.
- Bei Fehlern werden Ursache, Korrektur und Wiederholung unter derselben
  Evidence-ID dokumentiert.
- Disposable Daten verwenden ausschließlich Test-User und Test-Payloads im
  lokalen Stack.
- Kein lokaler Nachweis wird als produktiver Nachweis umgedeutet.

S5-Revalidierung 2026-07-31: Node-Syntax und kombinierte R1/R2-Suite 20/20
PASS; kein Produkt-Scriptload. Frische PostgreSQL-17.6-Fixture inklusive aller
Negativpfade, zwei Verbindungen, Datei 16 und Cleanup PASS. R1/SQL-Katalog
78/78 exakt mit SHA-256
`d0118678cccfa17e27caffc42233e54a40b40547ea3d36599e60e15f3c8cf3f8`;
db lint sowie Security-/Performance-Advisor auf WARN+ ohne Befund. Vor dem
Löschen standen Sessions/Items/Sets auf 0 und der Katalog auf 78; anschließend
wurden nur die guarded Wegwerf-Datenbank entfernt und der lokale Stack gestoppt.

## Produktiver Read-only Preflight

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-PRE01 | Zielprojekt, Objektkonflikte, `extensions.digest` aus `pgcrypto`, SQL-Reihenfolge und erwartete Baseline | `PASS 2026-07-31: Repo-Ref entspricht linked project; PostgreSQL 17.6/UTC; DB-Owner postgres mit BYPASSRLS; anon/authenticated/service_role vorhanden; pgcrypto 1.3 in extensions und digest(text,text) vorhanden; 0/4 R2-Relationen, 0/2 R2-RPCs und keine Overloads; V1 health_events/view/RPCs vorhanden, 62 activity_event-/283 Gesamtzeilen.` | none |
| EV-PRE02 | Reviewter Hash/Diff von `20_Activity_V2.sql` und `16_Explicit_Grants.sql` | `PASS: 20_Activity_V2.sql 6926ef4d4bc3ddfcc7585b4a024a849c202c183adb4b465c1223262ef8993e6e; 16_Explicit_Grants.sql c3255c46a09f2c7c7f59ea86d07809f9c9afc65364003b8f8f41497cdf0a9c98. Vier Tabellen, zwei RPCs, vier Policies, ein gehärteter Definer, zwei leere Search Paths, exakte Revoke/Grant-Grenze; kein create extension/dblink im Produkt-SQL.` | none |

<!-- markdownlint-enable MD013 -->

Preflight-Entscheidung:

- Erwartete Wirkung:
  - `vier neue Tabellen, Constraints/Indizes/Policies, zwei RPCs und exakt
    78 Katalog-Projektionszeilen`
- Geschützte Daten:
  - `alle Activity-V1-health_events und übrigen MIDAS-Tabellen; keine
    historischen Activity-V2-Sessionzeilen`
- Stop-Bedingung:
  - `unerwartetes gleichnamiges Objekt, Katalogdrift, anderer SQL-Diff,
    fehlende lokale Evidence, unklare ACL/RLS oder fehlende Freigabe`
- Owner Briefing:
  - `Erzeugt vier additive Tabellen, zwei RPCs, vier Policies und 78
    Katalogzeilen; Activity V1, Consumer und bestehende Daten bleiben
    unverändert. Reihenfolge exakt Datei 20, danach Datei 16. Bei SQL-Fehler,
    Objekt-/Katalogdrift oder abweichendem Postcheck sofort stoppen; keine
    produktive Testsession. Freigabephrase: S5 Produktiv-Cutover freigegeben.`
- Freigabe:
  - `2026-07-31 exakt als S5 Produktiv-Cutover freigegeben erteilt; nur für
    EV-W01/-02 in der dokumentierten Reihenfolge verbraucht`

## Produktive Aktionen

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-W01 | `sql/20_Activity_V2.sql` im bestätigten Zielprojekt ausführen | exakt erteilt | Schema/Katalog/RPC/RLS | `PASS; SHA-256 6926ef4d4bc3ddfcc7585b4a024a849c202c183adb4b465c1223262ef8993e6e; produktive DB-Anfrage 2026-07-31T13:21:50.845Z bis 13:21:53.789Z; eine Transaktion, Exit 0` | PASS |
| EV-W02 | `sql/16_Explicit_Grants.sql` danach ausführen | exakt erteilt | objektbezogene ACLs | `PASS; SHA-256 c3255c46a09f2c7c7f59ea86d07809f9c9afc65364003b8f8f41497cdf0a9c98; 2026-07-31T13:22:10.666Z bis 13:22:13.213Z; eine Transaktion nach grünem EV-W01, Exit 0` | PASS |

<!-- markdownlint-enable MD013 -->

## Vorher-/Nachher-Nachweis

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| Activity-V2-Tabellen | `0, read-only bestätigt` | `4` | `4 echte Tabellen; Owner postgres; RLS auf allen aktiv` | PASS |
| Katalogversion 1 | `0; Katalogtabelle nicht vorhanden` | `78 aktive Entries` | `78 total / 78 v1 active` | PASS |
| Activity-V2-Sessions | `0; Sessiontabelle nicht vorhanden` | `0` | `Sessions 0, Items 0, Sets 0` | PASS |
| Activity-V1-Zeilen/Objekte | `62 activity_event / 283 health_events; View und drei RPCs vorhanden` | unverändert | `62 / 283; View und drei RPCs weiterhin vorhanden` | PASS |
| Activity-V2-RPCs | `0, keine Overloads` | `2` | `genau 2; Commit postgres/Definer/leer Search Path, Lookup postgres/Invoker/stable/leer Search Path` | PASS |
| RLS/ACL | `keine R2-Objekte` | laut S2/S5 | `vier SELECT-Policies; authenticated/service_role Tabellen-SELECT, kein Client-DML; nur authenticated RPC-EXECUTE; anon/PUBLIC ausgeschlossen` | PASS |

<!-- markdownlint-enable MD013 -->

Geschützte Negativnachweise:

- Keine Activity-V1-Zeile wird geändert oder gelöscht.
- Keine produktive Activity-V2-Testsession wird erzeugt.
- Keine anonyme Les- oder Schreibberechtigung entsteht.
- Keine Produktdatei lädt `data-access.js`.
- Keine Edge Function, Cron- oder externe Automation wird verändert.

## Deploy- und Runtime-Nachweise

Für R2 ist kein Edge-Function- oder Web-Deploy vorgesehen. Der produktive
Runtime-Nachweis besteht ausschließlich aus SQL-Cutover und read-only
Postchecks.

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Ziel | Version / Run-ID | Smoke | Schreibwirkung | Status |
| --- | --- | --- | --- | --- | --- |
| EV-P01 | produktives Activity-V2-Schema | `EV-W01/-02 2026-07-31; eingefrorene Hashes` | `PASS: objects_data_pass=true, acl_pass=true, hardening_pass=true; vier Tabellen, fünf valide Indizes, vier Policies, zwei RPCs, 78/78 Katalog, 0/0/0 Historie und V1 62/283. Linked Lint ohne R2-Befund; Security Advisor meldet exakt den intentionalen authenticated-Definer-Endpunkt plus vorbestehenden Leaked-Password-Hinweis; Performance WARN+ sauber, fünf erwartete unused-index-INFOs auf neuen leeren R2-Tabellen. Abschließend R1/R2-JS 20/20 und Produktisolation PASS.` | ja | PASS |

<!-- markdownlint-enable MD013 -->

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- |
| `EV-B03` | Optionaler Vector-Logger konnte den bewusst geschlossenen Docker-TCP-Socket nicht erreichen; R2 benötigt ihn nicht. | Start gemäß dokumentiertem MIDAS-Vertrag ohne Vector-Logger wiederholt. | 11 Core-Dienste, DB-/Digest-/Loopback-Probe und sauberer Stop | closed |
| `EV-B05 / F-ACT-R2-08` | Der vorläufige security-invoker-Vertrag öffnete direkte historische Tabellen-Inserts für Browserrollen und widersprach damit RPC-Atomarität und serverbestimmten Snapshots. | Owner-Freigabe Option A/D-ACT-R2-16: gehärteter public Definer-Commit, kein Tabellen-DML für Clientrollen, Lookup invoker; kein privater Helper. | S2 Full Contract Review PASS; Umsetzung später durch ACL/RLS-/Direktinsert-/Two-User-/Advisor-Fixture EV-L02 zu beweisen | closed |
| `EV-B06 / F-ACT-R2-12` | Supabase-Anonymous-User verwenden ebenfalls `authenticated`; reine Rollenprüfung hätte persönliche Activity-Historie geöffnet, falls die Projektkonfiguration später geändert wird. | D-ACT-R2-17 verlangt den signierten permanenten User-Claim in Commit, Lookup und historischen Policies; Katalog bleibt unpersönlich lesbar. | S3 Full Contract Review PASS; Anonymous-JWT-Negativtest in EV-L02 bleibt Umsetzungsnachweis | closed auf Vertragsebene |
| `EV-B06 / F-ACT-R2-13` | Bestehende Projekte können neue `public`-Objekte während der Data-API-Umstellung noch automatisch granten; ausschließlich nachgelagerte Datei 16 ließe ein Expositionsfenster. | Datei 20 revokt Tabellen-DML und Funktions-Execute in derselben Erzeugungstransaktion; Datei 16 reassertiert die Minimalrechte. | S3 Full Contract Review PASS; ACL-Rerun und Advisor in EV-L02 bleiben Umsetzungsnachweis | closed auf Vertragsebene |
| `EV-B07 / F-ACT-R2-14` | `coalesce(..., false)` hätte einen fehlenden Anonymous-Claim als permanent akzeptiert. | D-ACT-R2-17 verlangt, dass der signierte Claim explizit `false` ist; true/fehlend/null scheitern. | S4R Full Review PASS; EV-L02-Negativtests bleiben Umsetzungsnachweis | closed auf Vertragsebene |
| `EV-B07 / F-ACT-R2-15` | Der notwendige Definer-Owner war prüfbar, aber nicht exakt eingefroren. | D-ACT-R2-18 übereignet an `postgres` und prüft Owner, Modus, Search Path, Overloads und ACL. | Zielrolle read-only als BYPASSRLS bestätigt; EV-L02 beweist die Umsetzung | closed auf Vertragsebene |
| `EV-B07 / F-ACT-R2-16` | Ein partieller oder fremder gleichnamiger Objektzustand konnte im abstrakten Rerun-Vertrag still adoptiert werden. | D-ACT-R2-19 akzeptiert ausschließlich 0/6 fresh oder kanonisch 6/6 und rollt jede Abweichung zurück. | EV-L01 testet partial/wrong/overload | closed auf Vertragsebene |
| `EV-B07 / F-ACT-R2-17` | Der zusammengesetzte Katalog-FK auf Session-Items hatte keinen eigenen Index. | Index `(catalog_version,item_key,tracking_mode_snapshot)` ergänzt. | EV-L01 und Performance Advisor | closed auf Vertragsebene |
| `EV-B07 / F-ACT-R2-18` | Ein Einzelverbindungs- oder timingabhängiger Test hätte den ON-CONFLICT-Wartepfad nicht deterministisch bewiesen; Datei 16 benötigt außerdem vorhandene Altobjekte. | D-ACT-R2-20: PSQL-Fixture bootstrapt kanonische Voraussetzungen und steuert Winner-Commit/-Rollback über zwei lokale dblink-Verbindungen. | dblink ist verfügbar, bleibt produktiv nicht installiert; EV-L02 beweist später | closed auf Vertragsebene |
| `EV-B07 / F-ACT-R2-19` | Das `MIDAS_ACTIVITY_*`-Namensmuster war stabil, die vier exakten SQL-Tokens aber nicht ausgeschrieben. | Vier Tokenwerte und ihre Domänenabbildung in S2.5 eingefroren. | EV-L04/JS-Contract-Test | closed auf Vertragsebene |
| `EV-B07 / F-ACT-R2-20` | Der ID-Tie-break des History-Lookups hatte keine Richtung. | `started_at desc, session.id desc` eingefroren. | EV-L03 | closed auf Vertragsebene |
| `EV-L01 / F-ACT-R2-21` | Der erste lokale Datei-20-Lauf fand zwei überzählige DDL-Klammern; der Folgelauf einen typfremden Policy-Rollenvergleich `oid[] <> regrole[]`. | Klammern entfernt und Rollen-OID explizit als `oid[]` verglichen; zusätzlich kanonischen PG17-Strukturfingerprint eingefroren. | Frischer Lauf, unmittelbarer Rerun sowie Partial-/Wrong-/Overload-Abbruch PASS | closed |
| `EV-L01 / F-ACT-R2-22` | `field_policy_snapshot` verlangte zunächst nur den JSON-Objekttyp und spiegelte den achtteiligen Katalogpolicy-Vertrag nicht vollständig als Check. | Exakte acht Keys ohne Extras und ausschließlich `forbidden|optional|required` ergänzt; finalen Strukturfingerprint aktualisiert. | Gültiger Strength-Commit mit acht Snapshot-Keys PASS; malformed `{}`-Snapshot scheitert am benannten Check ohne Itemzeile | closed |
| `EV-L01 / F-ACT-R2-23` | Der erste Strukturhash enthielt rohe `pg_policy.polroles`-OIDs und hätte auf einem Cluster mit anderen internen Rollen-OIDs falsch Drift gemeldet. | Policyrollen im Hash auf sortierte `pg_roles.rolname`-Werte normalisiert. | Finaler Fingerprint berechnet und kanonischer Datei-20-Rerun PASS | closed |
| `EV-L04 / F-ACT-R2-24` | Die erste JS-Antwortprüfung übergab zusätzliche Response-Felder an den engeren Request-Set-Validator und konnte damit eine gültige Lookup-Antwort verwerfen. | Request- und Response-Projektionen getrennt; Lookup-Deprecated-Pfad, Satzreihenfolge, exakte Keys und Request-ID explizit geprüft. | Isolierter JS-Contract einschließlich vollständigem Lookup-Block und drei malformed-response-Proben 10/10 PASS | closed |
| `EV-L04 / F-ACT-R2-25` | Dependency-, URL- oder Serialisierungsfehler konnten außerhalb der sicheren Domänenfehlergrenze liegen beziehungsweise wie eine fachlich ungültige Eingabe erscheinen. | Vorbereitung vollständig gekapselt; echte ContractViolation bleibt INVALID_SESSION/INVALID_ITEM_KEY, Runtime-/Setup-Fehler werden ohne Raw-Daten zu REQUEST_FAILED. | Dependency-/invalid-URL-, Fehlerform- und No-transport-Proben 10/10 PASS | closed |
| `EV-L02 / F-ACT-R2-26` | `supabase db lint` meldete eine deklarierte, von Integer-FOR-Schleifen überschriebene und sonst unbenutzte `v_index`-Variable. | Überzählige Deklaration entfernt; die beiden Schleifen behalten ihre lokalen Integer-Variablen. | Finaler `supabase db lint --schema public` ohne Befund | closed |
| `EV-L02 / F-ACT-R2-27` | Performance Advisor meldete `auth_rls_initplan` für drei History-Policies, weil `select (auth.jwt()->...)` nicht als Funktions-InitPlan erkannt wurde. | Ausdruck semantisch gleich auf `((select auth.jwt())->>'is_anonymous')` umgestellt; PG17-Strukturhash aktualisiert. | Claim true/fehlend/null sowie RLS erneut PASS; Performance Advisor WARN+ ohne Befund | closed |
| `EV-L02 / F-ACT-R2-28` | Der erste Fixture-Stand deckte Claim missing/null beim Commit, aber nicht beim RLS-Read ab; direkte Writes und anon-RPC waren nur über Privilegprädikate belegt. | Tatsächliche RLS-Negativreads, authenticated-/service_role-INSERTs und anon-Lookup-Aufruf ergänzt. | Finaler Fresh Fixture Run PASS; keine unerlaubte Zeile | closed |
| `EV-L01..L03 / F-ACT-R2-29` | Fixture-Bring-up fand schemaqualifiziertes NULLIF/COALESCE, CALL-Subquery, nicht kanonisches `+00`, direkte SQLERRM-Nutzung und dblink unter dem Supabase-Nicht-Superuser `postgres`. | Helpers PostgreSQL-17-konform korrigiert; Race-Abschnitt guarded ausschließlich lokal mit `supabase_admin`, danach Rückkehr zu postgres. | Vollständiger finaler Fresh Run einschließlich Cleanup PASS | closed |
| `EV-L01..L03 / F-ACT-R2-30` | Ein mit falschem Owner angelegtes disposable DB-Ziel scheiterte erst generisch beim Drop von public; die Fixture dokumentierte ihre Owner-/Session-Voraussetzung nicht executable. | Frühe Guards für `session_user = postgres` und DB-Owner `postgres` ergänzt. | Beide Negativproben liefern den exakten Guardfehler; anschließender frischer Full Run, Lint, Advisor und Cleanup PASS | closed |
| `EV-PRE01 / projektweite Baseline` | Linked Lint meldet ausschließlich ungenutztes `p_reason` in `med_adjust_stock_v2` und `med_set_stock_v2`; Security Advisor meldet deaktivierten Leaked-Password-Schutz. Performance WARN+ ist sauber. | Keine R2-fremde Mutation; als bestehende Projekt-Watchlist sichtbar gehalten. | R2-Zielnamen fehlen noch vollständig und sind Ursache keines Hinweises | WATCHLIST / non-blocking for R2 |
| `EV-W01/EV-P01 / F-ACT-R2-31` | `supabase db query --file` löste den relativen Pfad gegen `--workdir backend` auf und brach lokal vor der DB-Anfrage mit `FileSystem.readFile NotFound` ab; lange Windows-Queryargumente mit eingebetteten Quotes endeten read-only bei `LINE 0`. | Vor Write erneut gehashte absolute Dateipfade verwendet; Postchecks in kurze SELECTs zerlegt und Quotes mit `chr(34)` vermieden. | EV-W01/-02 jeweils exakt eine reale produktive Transaktion PASS; drei kurze Abschlussasserts true | closed |
| `EV-L02/EV-L03 lokaler Harness` | PowerShells nativer `psql -c`-Aufruf entfernte JSON-Anführungszeichen; eine erste Tie-break-Auswertung matchte zusätzlich ihre Lookup-Ergebniszeile. | SQL unverändert über stdin an psql übergeben; erwarteten Item-Block nur aus den beiden Commit-Ergebnissen gewählt. | Claim-/Commit-Smoke und korrigierter vollständiger Tie-break-/Item-Block-Smoke PASS | closed |
| `S6 / F-ACT-R2-32` | Modulübersicht erklärte V2 noch als vollständig unproduktiv; BS-007 verlangte direkte authenticated-Tabellenwrites pauschal und widersprach damit dem R2-RPC-only-Vertrag. | Modul-, QA-, SQL- und Masterplan-Dokumentation auf sichtbares V1 plus produktive, unverdrahtete R2-Datenbasis synchronisiert; Activity-V2-Direkt-DML ausdrücklich ausgeschlossen. | Finaler Contract-/Link-/Diff-Review sowie R1/R2-Node-Suite PASS | closed |
| `S6 / F-ACT-R2-33` | Finale linked Read-only-Queries nahmen zuerst `is_active` statt der realen Textspalte und danach eine falsche `proconfig`-Textserialisierung für den leeren Search Path an. Die Datenbank wies die erste Query ab; die zweite lieferte nur falsch-negative lokale Prädikate. Keine Schreibwirkung. | Gegen Datei 20 auf `status = 'active'` und gegen die direkt gelesene Form `search_path=""` korrigiert; Attribute zusätzlich einzeln gelesen. | Produktiv read-only: Katalog 78, Historie 0/0/0, V1 62/283; vier Tabellen, vier Policies, zwei RPCs, RLS überall; Commit postgres/Definer und Lookup postgres/Invoker/stable jeweils mit exakt leerem Search Path; Commit-ACL PASS | closed |

<!-- markdownlint-enable MD013 -->

## Finaler Evidence-Digest

- Gültige Nachweise:
  - `EV-B01 bis EV-B07; EV-L01 bis EV-L04; EV-PRE01/-02; EV-W01/-02;
    EV-P01 PASS`
- Exakte produktive Wirkung:
  - `vier additive Activity-V2-Tabellen, fünf Indizes, vier RLS-Policies,
    zwei RPCs, minimale ACLs und 78 aktive Katalogzeilen; keine Session-/Item-/
    Setzeile und keine Activity-V1-Mutation`
- Finaler S6-Read-only-Abgleich:
  - `2026-07-31: Katalog v1 active 78; Sessions/Items/Sets 0/0/0;
    Activity V1 62 und health_events gesamt 283; vier Tabellen/Policies, zwei
    RPCs, RLS und Commit-/Lookup-Hardening PASS`
- Nicht ausgeführte Nachweise:
  - `keine erforderlichen; keine synthetische produktive V2-Session gemäß
    Negativvertrag; externer CodeRabbit-Review mangels Integration nicht erfolgt`
- Restrisiken:
  - `Lokale Umsetzung und Full Review sind grün. Zwei unused-index-INFOs sind
    in der frisch geleerten Fixture erwartbar und betreffen notwendige FK-/
    Consumerpfade. Fünf produktive unused-index-INFOs sind auf den unmittelbar
    nach Cutover noch leeren R2-Tabellen erwartbar; Performance WARN+ ist
    sauber. Der Security-Advisor-Warnhinweis zum authenticated-Definer-Endpunkt
    ist die explizit freigegebene, durch ACL/Owner/Claim/Search-Path gehärtete
    Option A. Die bestehende
    Projekt-Watchlist aus zwei Medication-Lintwarnungen und deaktiviertem
    Leaked-Password-Schutz ist R2-fremd und nicht blockierend. CLI 2.111.0
    ist gegenüber lokal 2.109.1 verfügbar und `[inbucket]` ist zugunsten von
    `[local_smtp]` deprecated; beides ist außerhalb des R2-Diffs und für die
    PostgreSQL-17-Nachweise nicht blockierend.`
- Roadmap-Verweise:
  - `S4.1-S4.6, S5 und S6; archivierte Roadmap ist die Abschlussquelle`

Abschlussregeln:

- Evidence ist nach grünem S6 auf `DONE` gesetzt.
- Bei realem Widerspruch gewinnt der erneut geprüfte Iststand; Roadmap und
  Evidence werden gemeinsam korrigiert.
- Nach Archivierung bleibt keine aktive zweite Evidence-Datei zurück.

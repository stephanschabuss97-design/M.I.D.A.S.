# MIDAS Activity V2 R9 Session History, Detail, Correction and Deletion - Execution Evidence

Diese Datei sammelt ausschließlich technische Nachweise für die zugehörige
R9-Roadmap. Sie trifft keine neuen Produktentscheidungen.

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap(s) | `docs/archive/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Roadmap (DONE).md` |
| Status | `DONE; S1-S6 vollständig; archiviert` |
| Erstellt am | `2026-08-11` |
| Letzter Stand | `2026-08-13; S6-Sync und finaler Contract Review PASS; T-ACT-R9-19/EV-ACT-R9-RV01 CONDITIONAL PASS mit ausdrücklicher Owner-Risikoakzeptanz für den rate-limitierten finalen CodeRabbit-Null-Lauf; 208/208 lokal, Isolation und produktives SQL-23-Postimage grün` |
| Freeze-Basis | `Git HEAD 0d9192f533091954e4b55e786046f004d25d1ea5; D-ACT-R9-01 bis -36; F-ACT-R9-01 bis -30` |
| Block-A-Basis | `Freeze-HEAD bestätigt; F-ACT-R9-31/-32 fixed; 186/186 grün; kein SQL, Productload, Deploy oder Commit` |
| Block-B-Basis | `exakter R8-Postimage; SQL 23/Rollback/Fixture plus SQL-16-/HOW-TO-Spiegel; F-ACT-R9-33 bis -37 fixed; T-ACT-R9-10 bis -15 PASS; 186/186 Clienttests; kein produktives SQL, keine reale Sessionmutation, kein Deploy oder Commit` |
| Block-C-Basis | `isolierter Fakeadapter-/Consumer-Harness; F-ACT-R9-38/-39 fixed; T-ACT-R9-05 bis -09 und EV-ACT-R9-BR01 bis -BR05 PASS; 200/200 Activity-V2-Contracttests; kein Productload, produktives SQL, reale Sessionmutation, Deploy oder Commit` |
| Block-D-Basis | `reale isolierte Data-Access-/History-/R4-Cacheintegration; F-ACT-R9-40 bis -43 fixed; T-ACT-R9-16 und EV-ACT-R9-I01 PASS; 203/203 Activity-V2-Contracttests, Browser-Smoke, Isolation und disposable SQL-23-Revalidierung grün; kein Productload, produktives SQL, reale Sessionmutation, Deploy oder Commit` |
| Block-E/S5-Basis | `F-ACT-R9-44 bis -57 fixed; T-ACT-R9-17/-18/-20 bis -22 PASS; T-ACT-R9-19 CONDITIONAL PASS mit Owner-Risikoakzeptanz; 208/208 lokal; Browser-/Isolation-/PG-17-/CodeRabbit-Fixreviews und produktives SQL-23-Postimage grün` |
| Verantwortlicher Schritt | `S1-S6` |
| Umgebungen | `lokal / disposable / produktiv read-only / produktiv write` |
| Archivziel | `docs/archive/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Evidence (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Nachweisvertrag

- Diese Datei beweist:
  - lokale JS-/UI-/Contract- und Browserchecks;
  - disposable SQL-23-Forward-/Rerun-/Rollback-/Race-/Security-Nachweise;
  - produktiven read-only Preflight, owner-freigegebene SQL-Ausführung und
    read-only Postconditions;
  - dass keine synthetische Session und keine fachliche Session-, Item- oder
    Set-Korrektur/Löschung erfolgte; die Schemaänderung darf vorhandene
    Sessions ausschließlich mit `revision = 1` initialisieren.
- Diese Datei beweist nicht:
  - Activity-V2-Produktaktivierung;
  - Android-Prozess-Reclaim oder finalen Android-PWA-Smoke;
  - R10-Export, R11-Doctor-Integration oder R12-Cutover;
  - die in R8 nicht ausgeführten T16-/T19-Nachweise;
  - die Wiederherstellung einer bereits gelöschten Session durch SQL-Rollback.
- Source of Truth für fachliche Entscheidungen:
  - R9-Entscheidungslog D-ACT-R9-01 bis D-ACT-R9-36.
- Verbotene Inhalte:
  - Secrets, JWTs, personenbezogene Rohdaten, vollständige Sessionpayloads
    oder unnötige Terminaldumps.

## Baseline

Nur geprüfte Fakten eintragen. R8-Werte werden als geerbte Referenz markiert
und in S1 produktiv read-only neu bestätigt, bevor sie R9-Evidence werden.

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R9-B01 | lokal | Git HEAD und Worktree vor R9 | PASS: HEAD `0d9192f533091954e4b55e786046f004d25d1ea5`; nur die zwei erwarteten untracked R9-Dokumente, kein fremdes Delta |
| EV-ACT-R9-B02 | lokal | Activity-V2-Produktload und öffentliche APIs | PASS: Root-Produktquellen V2-frei; Activity V1 einziger Consumer; reale APIs/State-/Cache-Seams kartiert; 179/179 Contracttests grün |
| EV-ACT-R9-B03 | lokal | SQL-20/21/22-Schema, FKs, Index, RLS, ACL und Funktionen | PASS: vier Tabellen, Cascade-FKs, Keysetindex, vier SELECT-Policies, Direct-DML-Entzug und zwei gehärtete RPCs quellseitig bestätigt |
| EV-ACT-R9-B04 | produktiv read-only | SQL-22-Kanonik und Session-/Item-/Set-Zähler | PASS: PostgreSQL 17.6, Commit-Hash `7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e`, Funktionen 2, R9-Funktionen 0, Revision 0, v1/v2 78/80, Daten 0/0/0 |
| EV-ACT-R9-B05 | Toolchain | Node/Deno/Supabase CLI/Docker/Postgres/Browser/CodeRabbit | PASS für Readiness: Git 2.55.0, Node 24.18.0, npm 11.18.0, Deno 2.9.5, Supabase CLI 2.109.1, Docker 29.7.2/`postgres:17-alpine`, Browser-/CodeRabbit-Lanes vorhanden; Host-`psql` fehlt, disposable Docker-Lane verfügbar |

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R9-L01 | S4.1/S5 | Response-/Cursor-/Limit-/Revisionstring-/Domainfehler- und getrennte Commit-/Mutation-State-Contracts | bounded/versioniert/verlustfrei/deterministisch | PASS: additive exakte API; History/Detail/Replace/Delete, Max-`bigint`-String, Tokenfehler, Unknown Outcome, zwei identische Bodies, keine Child-UUIDs; Data-Access-Suite 19/19 | PASS |
| EV-ACT-R9-L02 | S4.1/S5 | Keyset-Pagination mit Timestamp-Ties und Zwischeninsert | keine Duplikate/Skips | PASS: `(started_at,id)` DESC über zwei Seiten vollständig; späterer höherer Tie-Insert erst nach cursorlosem Refresh sichtbar | PASS |
| EV-ACT-R9-L03 | S4.2/S5 | Immutable-/Mutable-Matrix, aus Items abgeleitete Originalversion, bestehende/neue Snapshots und Child-ID-Grenze | keine Identitäts-/Katalogmigration oder UUID-Zusage | PASS: persistierte Bestands-Snapshots bleiben erhalten; neue Keys nur aus Detailversion; v1/v2-Negativgrenze, Child-ID- und Kalendertag-Oracles grün | PASS |
| EV-ACT-R9-L04 | S4.2/S5 | exakte Canonical-Content-Root-/Item-/Setform, Ausschlüsse, Null-/Orderregeln und Mutationrequest | identisch reproduzierbar | PASS: Correction-/Canonicalization-Suite 4/4; exakte Root-/Item-/Setkeys, explizite Nulls, Order, CAS-Request und Identity-/Zeit-Ausschlüsse | PASS |
| EV-ACT-R9-BR01 | S4.3/S5 | History Loading/Empty/Error/Retry/Pagination | definierte UI-Zustände | PASS: Controller- und Browser-Harness zeigen Loading/Empty/Initialfehler/Retry sowie 2+1 bounded Seiten; Appendfehler bewahrt vorhandene Einträge | PASS |
| EV-ACT-R9-BR02 | S4.3/S5 | Snapshotdetail gegen veränderten Live-Katalog | persistierter Snapshot gewinnt | PASS: Detail zeigt `Historischer Press`; aktueller Live-Katalogname ist im Detail 0-mal vorhanden; absent bleibt payloadfrei `not_found` | PASS |
| EV-ACT-R9-BR03 | S4.4/S5 | Correction/Validation/Dirty Close/Fokus | kein stiller Datenverlust | PASS: policy-gesteuerte Felder, ungültiger Save gesperrt, Dirty-Dialog, Working-Copy-Erhalt und deterministische Focus-Keys; F-ACT-R9-38 korrigiert | PASS |
| EV-ACT-R9-BR04 | S4.4/S5 | Conflict/Replay/Unknown-Reconciliation mit identischem Redispatch und desired/preimage/changed-Matrix | kein falscher Erfolg oder Payload-/CAS-Drift | PASS: updated/replayed/known conflict sowie unknown desired/preimage/changed; nur identischer Request darf redispatchen; Browser bestätigt Re-read-Erfolg | PASS |
| EV-ACT-R9-BR05 | S4.5/S5 | Delete-Bestätigung/Repeat/Admission bei Draft/Commit/Dependency-/Statewechsel | nur kontrollierte fail-closed Einzelaktion | PASS: exakt eine Bestätigung nennt 31.07.2026 und zwei Items; Cancel 0 Write, Delete/Repeat/Unknown-Matrix sowie dreifacher vollständig validierender Guard grün | PASS |
| EV-ACT-R9-BR06 | S4.10/S5 | 1440x900, 390x844, 320x800 | kein Overflow; Fokus/A11y grün | PASS: jeder Viewport mit `clientWidth = scrollWidth`, 0 doppelten IDs, 0 unbenannten Controls, 0 Consolelogs und erwarteten H2-Fokuszielen für Detail/Correction/Delete; initiale, Correction- und Delete-Screens visuell geprüft; F-ACT-R9-44 fixed | PASS |
| EV-ACT-R9-D01 | S4.6-S4.8/S5 | SQL 23 fresh/exact rerun/einzelne Drifts/rollback/forward-after-rollback, Reject bei belegter Lifecycle-Nutzung und Aufbau `20 -> 21 -> 22 -> 23 -> 16` | Zielaufbau/ACL reproduzierbar; Rollback fail-closed und kein Datenrestore | PASS: vollständiger PG-17-Fixturelauf einschließlich Fresh, exaktem Rerun, Preimage-/ACL-/Revisiondrifts, fehlendem operativem Rollback-Gate, gegatetem Rollback, Forward danach, Lifecycle-Nutzungsreject und SQL-16-Endlauf | PASS |
| EV-ACT-R9-D02 | S4.6/S5 | Revision/default/R8-Neucommit=1, Originalversion, List/Detail, validierender interner Helper/ACL und abgeleiteter Fingerprint | keine Fingerprint-/Session-Katalogspalte; kein Child-ID-Vertrag | PASS: Revision 1 per R8-Commit, bounded Keysetliste, Snapshotdetail, genau eine Originalversion, abgeleiteter SHA-256; exakt ein privater Helper, keine Zusatzspalte, Child-ID oder Trigger | PASS |
| EV-ACT-R9-D03 | S4.7/S5 | Correction success, Snapshotpreservation/neues Originalversionsitem, replay/stale/drift/exhausted/rollback | atomar und idempotent | PASS: Update und Exact Replay, Snapshotpreservation, neues Item aus Original-v2, unveränderliche Identität, stale CAS/Mixed-Version/Exhaustion jeweils ohne Partial Write | PASS |
| EV-ACT-R9-D04 | S4.7/S5 | Edit/Edit verschieden/identisch und beide Edit/Delete-Lockreihenfolgen | genau ein Writegewinner, kein Lost Update/Resurrection | PASS: fünf deterministische `dblink`-Races belegen Edit/Edit verschieden, Edit/Edit identisch, Edit vor Delete, Delete vor Edit und Delete/Delete | PASS |
| EV-ACT-R9-D05 | S4.8/S5 | Delete/Delete/Absent/Cascade | repeat-safe; 0 Residuen | PASS: erster Delete `deleted`, paralleler/wiederholter Delete `already_absent`; reale Session->Item->Set-Cascade ohne Residuen | PASS |
| EV-ACT-R9-D06 | S4.8/S5 | Permanent-/Anonymous-Auth, RLS/ACL/Owner/Search-Path/Overload/Direct-DML/Foreign und internes Schema/Data-API-Negativgrenze | nur eigene erlaubte Public-RPCs, kein Helperendpoint | PASS: exakte Owner-/Invoker-/Definer-/Volatility-/Search-Path-/Overload-/ACL-Oracles und Foreign/Anonymous/Direct-DML-Negativtests; PostgREST 14.14 löst Public-RPC auf, privater Helper bleibt HTTP 404 / `PGRST202` außerhalb des Schema-Caches | PASS |
| EV-ACT-R9-I01 | S4.9/S5 | History/Detail sowie alte/neue Keyunion, Cachegeneration/Late Settlement und Last Performance nach Edit/Delete | bestätigter gemeinsamer oder expliziter Errorstand ohne stale Success | PASS: reale Data-Access-Wrappers über lokalen RPC-Transport; direct/unknown Edit und Delete, cursorlose Reads, Absence, alte/neue Keyunion, Generation-Fencing, Late Settlement, terminal success/empty/error/invalidated, Refresh-only Retry ohne zweiten Write und Sparse-Result-Negativoracle | PASS |
| EV-ACT-R9-I02 | S4.10/S5 | V1/Productload/R7/R8-Isolation, Legacy-UUID-Negatividentität und R8-Gap-Ehrlichkeit | keine Regression/Kopplung/falsche PASS-Evidence | PASS: Productquellen laden V2 nicht; R9 übernimmt keinen R7-/R8-State, keine Child-ID-Identität und keine R8-T16/T19-PASS-Behauptung; finaler Isolationstest 3/3 und aktuelle Gesamtsuite 208/208 | PASS |
| EV-ACT-R9-RV01 | S5/S6 | Full Review und CodeRabbit finaler Diff | keine offenen In-Scope-P0/P1; externe Restunsicherheit sichtbar | PASS bis Fixreviews: A-D-Ledger und Block-E-Delta geprüft; CodeRabbit meldete 6 Punkte (4 fixed/2 verworfen), danach 4 fixed, 2 Doku-Konsistenzen fixed und 1 Runbook-Terminologie fixed; F-ACT-R9-46 bis -57 geschlossen; finaler Versuch vor Analyse `rate_limit`, recoverable, 28 Minuten, Exit 1 und daher kein Null-Lauf-Nachweis; Owner akzeptiert das begrenzte Restrisiko am 2026-08-13 | CONDITIONAL PASS; kein Null-Lauf-PASS |

<!-- markdownlint-enable MD013 -->

Regeln:

- Disposable Tests nennen Datenbank/Container und beweisen deren Entfernung.
- SQL-Fehler dokumentieren Ursache, Korrektur und Wiederholung unter derselben
  Evidence-ID.
- Lange Logs bleiben temporär lokal; hier stehen nur Versionen, Zähler,
  Hashes, Postconditions und relevante Fehler.
- Browser/Harness/Server werden pro zusammenhängendem Block wiederverwendet.
- Bereits gültige R8-Nachweise werden nur referenziert; R8-T16/T19 bleiben
  ausdrücklich keine PASS-Evidence.

## Produktiver Read-only Preflight

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-ACT-R9-PRE01 | Projektidentität, SQL-22-Kanonik und Objektstand | PASS: MIDAS `jlylmservssinsavlkdi`, PostgreSQL 17.6, `postgres` Session/Current User, vier Tabellen, zwei R8-RPCs, R9-Revision/Schema/RPCs vollständig absent | none |
| EV-ACT-R9-PRE02 | Tabellen-/Funktions-/ACL-/RLS-/Owner-/Search-Path-Preimage | PASS: leerer Guard-`search_path`; R8-Struktur `657f31c1...3ee14`; Owner postgres, RLS 4/4, erwartete Select-ACLs, 0 anon Select, 0 Direct-DML; Commit/Lookup `7cdabca3...177e`/`36958865...296e` mit exakten ACLs | none; F-ACT-R9-45 fixed |
| EV-ACT-R9-PRE03 | Session-/Item-/Set-Zähler und geschützte Produktdaten | PASS: 0/0/0; leere Datenhashes je `4f53cda1...b945`; Katalog v1/v2/other 78/80/0 mit `1bc08533...2147`/`ca18cdef...95d4` | none |
| EV-ACT-R9-PRE04 | Forward-/Rollback-Hash und erwartete SQL-23-Wirkung | PASS: SQL 23 `b8180409...1bc4`, Rollback `de2de5e9...f41`, Fixture `78eff806...96e3`, SQL 16 `cbe2ea0e...51fc`; additive Wirkung und separate Rollbackgrenze eindeutig | none |

<!-- markdownlint-enable MD013 -->

Preflight-Entscheidung:

- Erwartete Wirkung:
  - additive Sessionrevision mit `revision = 1` für vorhandene Sessions, vier
    R9-RPC-Grenzen und notwendige gehärtete interne Helper/ACLs; keine
    Änderung fachlicher Session-, Item- oder Setinhalte.
- Geschützte Daten:
  - alle vorhandenen Activity-, Health-, Medication-, Report-, Profil- und
    Appointmentdaten; Activity V1 vollständig.
- Stop-Bedingung:
  - Preimage-/Kanonik-/Zählerabweichung, unklare DML, fehlender Rollback oder
    fehlende Owner-Freigabe; der Rollback ist nach realer R9-Mutationsnutzung
    nicht zulässig.
- Owner Briefing:
  - im gekoppelten S4.10-/S5-Auftrag vor EV-ACT-R9-W01 erfolgt.
- Freigabe:
  - am 2026-08-13 ausdrücklich erteilt und nach grünem Preflight verbraucht;
    keine Rerun- oder Rollbackfreigabe.

## Produktive Aktionen

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R9-W01 | SQL 23 exakt einmal owner-gatet ausführen | Owner-Auftrag 2026-08-13; T-ACT-R9-20 PASS | Schema/RPC/ACL plus Revisioninitialisierung; bei 0 Sessions keine fachliche Activity-Datenmutation | PASS: Datei `b8180409...1bc4` über die verifizierte linked Supabase-Managementverbindung auf `jlylmservssinsavlkdi` erfolgreich ausgeführt | PASS; Freigabe verbraucht |

<!-- markdownlint-enable MD013 -->

## Vorher-/Nachher-Nachweis

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| `health_activity_sessions.revision` | absent; 0 Sessions | vorhanden, `not null`, Default 1; Altzeilen exakt 1 | `bigint not null default 1`, Check 1..max-`bigint`, 0 ungültige/Altzeilen | PASS |
| R9-RPC-Signaturen | 0 Public, 0 Private | exakt eine je Zielvertrag | vier Public-RPCs plus ein Helper; Overloadzähler 4/1; fünf exakte `pg_get_functiondef`-Hashes | PASS |
| R9-RPC-Grants | absent | PUBLIC/anon nein; authenticated nur reviewed endpoints | fünf exakte ACLs je authenticated+postgres Execute; Helper-Schema nur authenticated+postgres Usage; Direct DML 0 | PASS |
| Activity-V2 Session-/Item-/Set-Zähler | 0/0/0 | unverändert | 0/0/0; drei fachliche Datenhashes unverändert `4f53cda1...b945` | PASS |
| R8 Commit-/Last-Performance-Funktionen | `7cdabca3...177e` / `36958865...296e` | kanonisch und unverändert funktionsfähig | gleiche Quellhashes, Hardening und ACLs; R8-Struktur `657f31c1...3ee14` | PASS |
| Activity V1 / übrige MIDAS-Daten | geschützt | unverändert | kein DML außerhalb des SQL-23-Vertrags, kein Productload/Deploy; negative Repository-/Isolationchecks grün | PASS |

<!-- markdownlint-enable MD013 -->

Geschützte Negativnachweise:

- keine synthetische produktive Activity-V2-Session;
- keine produktive Korrektur oder Löschung;
- keine Änderung an Activity V1 oder Productload;
- keine unerwarteten Grants, Overloads oder Direct-DML-Rechte;
- keine Rohpayloads oder Secrets in Evidence/Logs.

## Deploy- und Runtime-Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Ziel | Version / Run-ID | Smoke | Schreibwirkung | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R9-P01 | Supabase SQL 23 Postcondition | Projekt `jlylmservssinsavlkdi`, PostgreSQL 17.6 | Revision/Funktionshashes/ACL/RLS/Overloads/0/0/0 read-only grün; `midas_private` über Data API HTTP 406 / `PGRST106` nicht exponiert; Advisor-Diff nur beabsichtigte Replace/Delete-Definer-Warnungen, keine neue RLS-/Performancewarnung | nur DDL aus W01 | PASS |
| EV-ACT-R9-R01 | Web/Edge/APK | nicht vorgesehen | kein Deploy | nein | N/A |

<!-- markdownlint-enable MD013 -->

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- |
| initial | Roadmap F-ACT-R9-01 bis F-ACT-R9-19 | im Zielvertrag korrigiert | S1-S4R-Zuordnung und S4-/S5-Ausführungsnachweise vollständig | fixed/proven |
| F-ACT-R9-20 | JS kann PostgreSQL-`bigint` nicht allgemein verlustfrei als Number darstellen | Revisiontransport als kanonischer Dezimalstring in D-ACT-R9-27/S2 festgelegt | S2-Gate PASS; T-ACT-R9-01/-11 zugeordnet | fixed |
| F-ACT-R9-21 | reale Shell-API besitzt keine Last-Performance-Invalidierung | `refreshLastPerformance(itemKeys)` mit Fencing/Terminalresultat in D-ACT-R9-32/S2 festgelegt | S2-Gate PASS; T-ACT-R9-16 zugeordnet | fixed |
| F-ACT-R9-22 | interne Helper-/Invoker-ACL war nicht technisch geschlossen | nicht exponierte `midas_private`-Invoker-Grenze mit Minimal-ACL in D-ACT-R9-29/S2 | S2-Gate PASS; T-ACT-R9-11/-15 zugeordnet | fixed |
| F-ACT-R9-23 | aktuelle Default-ACLs sind breit; Supabase ändert Data-API-Defaults | SQL 23 selbsthärtend, SQL 16 Fresh-Spiegel, Default-ACL nie Evidence | S2-Gate PASS; T-ACT-R9-10/-15/-20 zugeordnet | fixed |
| F-ACT-R9-24 | globaler Zwei-Versuch-Transport und R8-only `commitState` | separater R9-`mutationState`-/Reconciliation-Vertrag ohne R8-Änderung | S2-Gate PASS; T-ACT-R9-01/-08 zugeordnet | fixed |
| F-ACT-R9-25 | kein gemeinsamer History-Mutationsguard | rein lesender fail-closed Adapter und Admissionpunkte in D-ACT-R9-31/S2 | S2-Gate PASS; T-ACT-R9-09 zugeordnet | fixed |
| F-ACT-R9-26 | ursprüngliche Katalogversion nur an Items persistiert | genau eine gemeinsame Version unter Lock ableiten, Drift fail-closed | S2-Gate PASS; T-ACT-R9-11/-12 zugeordnet | fixed |
| F-ACT-R9-27 | Legacy-R8/R4-Responses enthalten Child-UUIDs | Legacy-Transport unverändert, R9-Übernahme/Identität gemäß D-ACT-R9-34 verboten | S2-Gate PASS; T-ACT-R9-01/-16/-17 zugeordnet | fixed |
| F-ACT-R9-28 | Canonical Content noch nicht feldgenau | Root-/Item-/Setform, Reihenfolge, Nullwerte und Hash in S2 exakt | S2-Gate PASS; T-ACT-R9-04/-11 zugeordnet | fixed |
| F-ACT-R9-29 | DB-ACL beweist externe Nicht-Exposition von `midas_private` nicht allein | Katalog-/ACL-Prüfung plus Data-API-Negativnachweis in D-ACT-R9-35 | S3-Gate PASS; T-ACT-R9-15/-20 zugeordnet | fixed |
| F-ACT-R9-30 | `revision = 1` kann frühere Replay-/Hard-Delete-Nutzung nicht beweissicher ausschließen | technischer Preflight plus positive operative Nichtnutzungsbestätigung und separates Rollback-Owner-Gate | S3-Gate PASS; T-ACT-R9-10 zugeordnet | fixed |
| F-ACT-R9-31 | explizite Nullable-Replacementfelder konnten im ersten S4.1-Reviewstand `undefined` wie `null` normalisieren | eigene R9-Normalizer verlangen den vorhandenen `null`-/Wert-Key | T-ACT-R9-01 Negativoracle plus 19/19 Data-Access-Tests | fixed |
| F-ACT-R9-32 | Detail-`day` wurde im ersten S4.2-Reviewstand nur formal per Regex geprüft | Correction-Eingang validiert zusätzlich Leap-Year, Monat und realen Kalendertag | T-ACT-R9-03 Negativoracle plus 4/4 Correction-/Canonicalization-Tests | fixed |
| F-ACT-R9-33 | direkte SQL-16-R9-Grants hätten den weiterhin gültigen R8-only-Aufbau vor SQL 23 an fehlenden Signaturen gestoppt | SQL 16 akzeptiert fail-closed genau den vollständigen R9-Satz oder dessen vollständige Abwesenheit und verwirft Teilzustände | vollständiger Aufbau `20 -> 21 -> 22 -> 23 -> 16` sowie R8-only- und Teilzustandsproben unter EV-ACT-R9-D01 | fixed |
| F-ACT-R9-34 | wiederverwendete asynchrone `dblink`-Verbindungen enthielten nach dem ersten Result noch ein Drain-Ergebnis | Fixture leert jeden Resultkanal vollständig, bevor die Verbindung wiederverwendet wird | alle fünf deterministischen Races unter EV-ACT-R9-D04 | fixed |
| F-ACT-R9-35 | erster SQL-23-Guard belegte R8-Kataloge nur durch Zähler und die Lookup-RPC nur durch Hardening | Forward und Rollback verlangen exakte v1/v2-Inhaltshashes sowie den unveränderten Lookup-Quellhash | Fresh/Rerun/Drift/Rollback unter EV-ACT-R9-D01 | fixed |
| F-ACT-R9-36 | erster privater Postcheck schloss Grants an unerwartete Rollen nicht vollständig aus; erste Cascade-Probe hatte keine Set-Zeile | exakte Schema-/Helper-ACL-Oracles, Rogue-Grant-Negativtest und echte Session->Item->Set-Cascade | EV-ACT-R9-D05/-D06 | fixed |
| F-ACT-R9-37 | geerbter R8-Isolationsoracle verwarf den planmäßigen R9-Grant-Spiegel in SQL 16 pauschal als geschützten Diff | SQL 16 bleibt geschützt und wird auf den exakt reviewten R9-Quellhash gepinnt; übrige R8-Schutzpfade unverändert | vollständige Activity-V2-Suite nach Korrektur 186/186 | fixed |
| F-ACT-R9-38 | erster S4.4-Shellstand ersetzte beim `input`-Rerender das aktive Editorfeld | Eingabe synchronisiert die memory-only Working Copy ohne DOM-Ersatz; Change/Fehler rendert atomar und Focus-Keys stellen Dialog-/Editorziele her | Browser Dirty-Close bewahrt `Korrigierte Notiz`; T-ACT-R9-07 und 200/200 Gesamtsuite | fixed |
| F-ACT-R9-39 | erster S4.5-Guard validierte exakte Keys, aber nicht sämtliche R7-/R8-Statewerte | nur eingefrorene exakte Recovery-/Commit-Snapshots mit erlaubten Phasen, kanonischen Zeiten und payloadarmen Reason-/Focusformen werden akzeptiert | unbekannte Phase, mutable Snapshot, falscher Reason und throwing/malformed Dependency ergeben `guard_unavailable`; T-ACT-R9-09 | fixed |
| F-ACT-R9-40 | Correction-Retrybutton war über den gesetzten `retry_mode` dauerhaft deaktiviert | nur ein laufender Refresh sperrt den Button; Retry lädt bestätigte Reads/Cache neu und dispatcht keinen Write | Integrationstest belegt unveränderten Replace-Zähler nach Refresh-only Retry; T-ACT-R9-16 | fixed |
| F-ACT-R9-41 | Block-C-Fakeadapter setzte `has_more` auf einer partiellen Zwei-Item-Seite entgegen dem realen Data-Access-Vertrag | bounded Harnessseite ist terminal; reale Data-Access-Validierung bleibt strikt | realer Harness lädt List/Detail ohne Protokollfehler; T-ACT-R9-16 | fixed |
| F-ACT-R9-42 | konkurrierende History-/Detail-/Dialogaktionen waren während Mutation-Busy nicht vollständig gefencet | Controller und Shell blockieren competing Reads/Navigation/Dialogwechsel bis zum terminalen Mutation-/Refreshzustand | eigener Mutation-Busy-Negativtest plus Gesamtsuite; T-ACT-R9-16 | fixed |
| F-ACT-R9-43 | terminaler Cache-Resultvalidator schloss Sparse-Array-Holes nicht aus | exakte dichte Arrayprüfung vor Erfolgsannahme | Sparse-Success wird als Post-Mutation-Refreshfehler behandelt und nur read-only retrybar; T-ACT-R9-16 | fixed |
| F-ACT-R9-44 | Harness-Cacheaktion lag zunächst kontrastarm außerhalb der dunklen Fläche; der erste Fixed-Fix überdeckte auf 320x800 die Delete-Aktion | Harness-only Cacheaktion kontrastreich in den normalen Dokumentfluss verschoben | exakte 1440x900-/390x844-/320x800-Screens und Interaktionen ohne Überdeckung/Overflow; T-ACT-R9-18 | fixed |
| F-ACT-R9-45 | erste manuelle T20-Strukturhashabfrage ließ den Guard-`search_path` aus und erhielt deparse-abhängig `4b7f53a5...6e31` | isolierter PostgreSQL-17-Vergleich und produktive Wiederholung mit `search_path = ''` analog SQL 23 | kanonischer R8-Hash `657f31c1...3ee14`; kein Produktdrift oder SQL-Source-Delta | fixed |
| F-ACT-R9-46 | `suppressNextRender` konnte nach synchron werfendem Correction-Setter den nächsten legitimen Render unterdrücken | Setterdispatch mit sicherem Fehler-Render und garantierter Flag-Rücksetzung in `finally` | statischer Render-Fencing-Vertrag, direkter Shelltest und 208/208 Gesamtsuite | fixed |
| F-ACT-R9-47 | eingebettete Correction-/Delete-Bestätigungen deklarierten ohne Fokusfalle `aria-modal=true` | benannte `role=dialog`-Bereiche ohne falsche Modalitätszusage | Quellvertrag plus Browser: genau ein gescopter Dialog, `aria-modal` absent | fixed |
| F-ACT-R9-48 | malforme Detail-Itemkeys konnten beim Öffnen von Delete als roher `TypeError` austreten | Preimage vor State-Mutation ableiten und fail-closed auf stabilen `INVALID_STATE`-Domainfehler mappen | eigener T-ACT-R9-09-Negativtest belegt stabilen Namen/Code/Message und geschlossenen Delete-State | fixed |
| F-ACT-R9-49 | Overload-Driftfixture belegte den Revisionsvertrag nur indirekt über eine leere Tabelle | Katalogprüfung auf `bigint`, NOT NULL, Default `1` und exakten Revision-Check | vollständige SQL-23-PG-17-Fixture T-ACT-R9-10 bis -15 mit Exit 0 | fixed |
| F-ACT-R9-50 | Isolationstest verlangte explizit `R8-T16/T19 nicht als R9-PASS`, Evidence umschrieb nur denselben Inhalt | kanonischen Negativwortlaut direkt in den Evidence-Digest aufgenommen | T-ACT-R9-17 und 208/208 Gesamtsuite | fixed |
| F-ACT-R9-51 | initialer Renderfehler nach erfolgreichem Subscribe ließ den Controller-Callback registriert | Catch unsubscribed best effort, nullt den Handle und behält Listener-/DOM-Cleanup bei | ausführbarer Mount-Regressionstest erzwingt Renderfehler und misst genau einen Unsubscribe | fixed |
| F-ACT-R9-52 | SQL-23-Rollbackregeln standen ohne eigene Grenze im produktiven Execution Record | eigene Überschrift `Activity V2 R9 Rollback Boundary`; Regeln unverändert | HOW-TO-Diff und unveränderte Owner-/Nichtnutzungs-/Preflightaussagen geprüft | fixed |
| F-ACT-R9-53 | deaktivierte Controls zeigten pauschal `wait`, auch ohne laufende Operation | Default `not-allowed`; `wait` nur unter `data-busy=true` | CSS-/Shellvertrag und Browser-Computed-Style `busy=false`, disabled Save, `not-allowed` | fixed |
| F-ACT-R9-54 | Focus-Key-Selektor wurde vor der best-effort Fehlergrenze konstruiert | Selektoraufbau, Lookup und Fokus vollständig in denselben Catch verschoben | Quellvertrag und Browser Dirty-Close-Cancel fokussiert wieder `Korrektur schließen` | fixed |
| F-ACT-R9-55 | historische Block-E-Handoffkarte behauptete ohne Zeitqualifikation weiterhin CodeRabbit-Nichtverfügbarkeit | Aussage ausdrücklich als Stand des damaligen Block-E-Gates markiert und auf aktuellen Resume-/Evidence-Stand verwiesen | Roadmap-/Evidence-Konsistenzscan | fixed |
| F-ACT-R9-56 | historische Block-E-Gatezeile führte EV-ACT-R9-RV01 als geschlossen, obwohl der finale Null-Lauf pending war | nur Produkt-/Runtime-Evidence bleibt geschlossen; RV01 ausdrücklich bis zum Null-Lauf wieder geöffnet | Evidence-Tabelle, Gatezeile und Post-S5-Status gegeneinander geprüft | fixed |
| F-ACT-R9-57 | HOW-TO wechselte für denselben unveränderten R8-RPC zwischen `lookup` und `last-performance` | R2-/R8-/R9-Runbook nennt konsistent `public.activity_v2_last_performance(text)`; R9 nennt dessen exakten Sourcehash `36958865...296e` neben dem Commit-Hash | Quellabgleich mit SQL-23-Preimage-Guard und HOW-TO-Diff | fixed |

<!-- markdownlint-enable MD013 -->

## Discovery- und Gate-Nachweise

### S1

- Pflichtlesereihenfolge: vollständig eingehalten; R7 nur für die konkrete
  Guard-/State-Frage gezielt ergänzt.
- Repository/Runtime: EV-ACT-R9-B01 bis EV-ACT-R9-B03 `PASS`.
- Produktiv read-only: EV-ACT-R9-B04 `PASS`; keine Sessionpayloads oder
  personenbezogenen Daten gelesen oder dokumentiert.
- Supabase aktuell:
  - offizielle Function-Dokumentation bestätigt Invoker als Default,
    `search_path`-Pflicht für Definer und explizite Function-ACLs;
  - RLS-Dokumentation bestätigt, dass anonyme Sign-ins die Rolle
    `authenticated` tragen und über `is_anonymous` getrennt werden müssen;
  - Breaking Change vom 2026-04-28 macht explizite Data-API-Grants für neue
    Tabellen/Funktionen spätestens ab 2026-10-30 verpflichtend;
  - Security Advisor meldet den absichtlich exponierten, gehärteten R8-Commit
    als `authenticated_security_definer_function_executable`; kein anon-Fund,
    keine Activity-V2-Performancewarnung außer wegen 0/0/0 erwartbar ungenutzten
    Indizes.
- Toolchain: EV-ACT-R9-B05 `PASS` für die geplanten S4/S5-Lanes.
- Gate: `PASS mit ausschließlich nicht blockierenden Findings`;
  F-ACT-R9-20 bis -28 besitzen konkrete S2-/S4-/Testziele.

### S2

- Schemaverträge: exakte History-/Detail-/Replacement-/Mutation- und
  Canonical-Content-Keys, Typen, Bounds, Null-/Absent-Verträge und
  Dezimalstring-Revision dokumentiert.
- Identity: Session-/Requestidentität und ursprüngliche Katalogsemantik bleiben
  unverändert; Child-UUIDs sind keine R9-Identität; genau eine Item-
  Katalogversion ist Pflicht.
- Concurrency: Row Lock, identischer Replay vor Dual-CAS, genau ein
  Revisionssprung, Cascade-Delete und Unknown-Reconciliation vollständig.
- Security: invoker Reads plus permanente Authprüfung/RLS; definer Mutations
  plus Ownership; interne pure `midas_private`-Grenze und explizite Minimal-
  ACL ohne Defaultannahme.
- Client/UX: getrennte `mutationState`, exakt identischer Transportretry,
  fail-closed Admission, memory-only Correction und bestätigbarer
  Last-Performance-Refresh.
- Gate: `PASS`; F-ACT-R9-20 bis -28 `fixed`, keine offene P0/P1-
  Grundsatzfrage oder Owner-Entscheidung.

### S3

- Race-Matrix: Edit/Edit verschieden `updated/conflict`, identisch
  `updated/replayed`; Edit/Delete lockabhängig `updated/conflict` oder
  `deleted/not_found`; Delete/Delete `deleted/already_absent`; kein Lost Update,
  keine Resurrection und kein zweiter Revisionssprung.
- Unknown Matrix: höchstens ein identischer interner Redispatch; danach
  Detail-Re-read mit exakt desired/preimage/changed beziehungsweise
  absent/preimage/changed. Kein neuer Inhalt auf alten CAS-Werten.
- Security Matrix: permanente Authprüfung auch bei invoker Reads, RLS/Owner,
  enge definer Mutations, leere Search Paths, exakte Overloads, PUBLIC/anon/
  service revokes, Direct-DML-Entzug und nicht-leakende Absent-/Foreign-
  Außenverträge.
- Data/Consumer: ursprüngliche Katalogversion/gespeicherte Snapshots fail-
  closed, Transaktion ohne Partial Children/Revision, Cachegeneration fenced,
  Legacy-UUIDs nicht als R9-Identität.
- Provisioning: exact R8 preimage, exact R9 rerun, einzelne Driftfehler vor
  Write, Fresh `20 -> 21 -> 22 -> 23 -> 16`, produktiv nur owner-gatetes SQL 23.
- Rollback: eigener technischer und operativer Preflight; keine automatische
  Ausführung, kein Datenrestore, keine Freigabe allein durch Revision 1.
- Scope: R8/R10/R11/R12/R14 und alle produktiven Consumer/Deploys bleiben
  unangetastet.
- Gate: `PASS`; F-ACT-R9-29/-30 `fixed`, keine offene P0/P1-Lücke ohne
  Zielschritt.

### S4R

- Vertragsabdeckung: S4.1-S4.10 jeweils gegen Systemkarte, eingefrorenen
  S2-Zielvertrag und S3-Risiko-/Security-/Rollbackmatrix geprüft.
- Findingabdeckung: F-ACT-R9-01 bis F-ACT-R9-30 jeweils mindestens einem
  konkreten S4-Schritt und einem T-/EV-Nachweis zugeordnet; keine offene
  P0-/P1-Lücke ohne Stop- oder Zielschritt.
- Test-/Evidenceabdeckung: T-ACT-R9-01 bis T-ACT-R9-18 decken lokale,
  Browser-, disposable und integrierte S4-Nachweise ab; T-ACT-R9-19 bis -22
  bleiben ausschließlich S5-Gates. Alle noch nicht ausgeführten S4-/S5-
  Nachweise bleiben ehrlich `TODO`.
- Sichere Ausführungsblöcke:
  - A: S4.1-S4.2, Contract-/Canonicalization-Basis;
  - B: S4.6-S4.8, SQL-Source, disposable und Security;
  - C: S4.3-S4.5, UI-/Controller-Integration;
  - D: S4.9, reale Data-Access-/Cacheintegration;
  - E: S4.10, integrierte Isolation/Responsive/A11y/Races.
- Reviewtiefe: alle Blöcke benötigen `Full Review`; S4.3 benötigt innerhalb
  von Block C zusätzlich `Consumer Review`.
- Owner-Grenzen: Dieses `GO` bestätigt nur die technische Readiness für einen
  später ausdrücklich beauftragten S4-Lauf. Produktives SQL bleibt das
  separate S5-Owner-Gate; reale Sessionmutationen und Deploy bleiben verboten.
- Gate: `GO` für S4, zugleich `STOP vor S4`; keine S4-Implementierung, kein
  SQL-Write, kein Deploy und kein Commit ausgeführt.

## S4 Block A

- Kontextwiederherstellung: Roadmap und Evidence vollständig, Block-A-
  Referenzen gezielt und reale Data-Access-/Shell-/Test-/SQL-Grenzen gelesen;
  Freeze-HEAD `0d9192f533091954e4b55e786046f004d25d1ea5` bestätigt.
- Worktree vor Umsetzung: ausschließlich die beiden erwarteten untracked
  R9-Dokumente; kein fremdes oder überlappendes Delta.
- Günstige Vorbaseline: 179/179 Activity-V2-Contracttests `PASS`.
- S4.1: vier additive Data-Access-Methoden, exakte versionierte
  History-/Detail-/Mutationvalidatoren, Revision-Dezimalstring, Cursor-/Limit-
  Grenze, Domainfehler und separates `mutationState`; EV-ACT-R9-L01/-L02
  `PASS`.
- S4.2: neue isolierte `session-canonicalization.js` und
  `session-correction.js` mit memory-only Working Copy, Snapshot-/Policy-
  Erhalt, Originalversions-Snapshot für neue Items, Dirty-/Valid-State,
  Replacement, Canonical Content und CAS-Request; EV-ACT-R9-L03/-L04 `PASS`.
- Review: F-ACT-R9-31/-32 im Full Contract Review gefunden, korrigiert und mit
  Negativoracles geschlossen; keine offene P0-/P1-Lücke.
- Nachtests:
  - gezielt 23/23 `PASS`;
  - vollständig 186/186 `PASS`;
  - `node --check`, `git diff --check` und Productload-Negativscan `PASS`.
- Isolation: Root-`index.html`, Root-Service-Worker, Activity V1, Shell,
  Recovery, Commit-Intent, SQL, Datenbank und Deploy unverändert; keine reale
  Sessionmutation und kein Commit.
- Gate: `PASS`; technisches `GO` für Block B, zugleich `STOP vor Block B` und
  weiterhin `USER-GATED`.

## S4 Block B

- Kontext-/Driftcheck: Roadmap und Evidence vollständig sowie die für Block B
  genannten R8-/SQL-/Supabase-Quellen gezielt gelesen; Freeze-HEAD
  `0d9192f533091954e4b55e786046f004d25d1ea5` bestätigt. Vor Beginn lagen nur
  die bekannten Block-A- und R9-Dokumentdeltas vor; kein fremdes
  überlappendes Worktree-Delta.
- Günstige Vorbaseline: 186/186 Activity-V2-Contracttests `PASS`.
- S4.6: `sql/23_Activity_V2_History_Lifecycle.sql` ergänzt ausschließlich die
  additive positive `revision bigint`, exakt einen validierenden
  `midas_private`-Canonicalization-Helper sowie bounded List-/Detail-RPCs.
  R8-Commit/Lookup, Kataloge, RLS und ACL werden über exakte Preimages
  geschützt; EV-ACT-R9-D01/-D02 `PASS`.
- S4.7: derselbe SQL-23-Source implementiert den owner-geprüften atomaren
  Vollersatz mit Parent-Row-Lock, abgeleitetem Content-Fingerprint, Exact
  Replay vor stale CAS, Dual-CAS, Snapshotpreservation, Originalversionsregel
  und vollständigem Fehlerrollback; EV-ACT-R9-D03/-D04 `PASS`.
- S4.8: Hard Delete ist owner-geprüft, dual-CAS-geschützt, kaskadierend und
  nach außen für absent/foreign gleich. Public-/Private-ACLs, Owner,
  Search-Path, Overloads, Direct DML, Fresh Provisioning und der zweifach
  gegatete Rollback sind geschlossen; EV-ACT-R9-D01/-D05/-D06 `PASS`.
- Disposable Nachweis: vollständiger Fixturelauf auf PostgreSQL 17 `PASS`,
  danach 0/0/0 Session-/Item-/Set-Zeilen, exakte Kataloge und unveränderter
  R8-Commit-Hash. PostgREST 14.14 löste den Public-Detail-RPC auf; der nicht
  exponierte Helper blieb HTTP 404 / `PGRST202` außerhalb des Schema-Caches.
- Reviewte lokale Source-SHA-256: SQL 23
  `b8180409e2199477177d4cb6fe21604467bc8da37fce73342db49c511cf01bc4`,
  Rollback
  `de2de5e9b2e5ed9e00309a222f53fd07546bd5a5383119c3386f051a52fcef41`,
  Fixture
  `78eff8062627e9c5eb7e32749179ec6f3b7cc580dcba2b1a4176267d463696e3`
  und SQL 16
  `cbe2ea0e1bcc89f6be38ae83f645aa19d57d4334158c5f9ace356360058851fc`.
- Disposable Cleanup: `midas-r9-block-b-postgrest` und
  `midas-r9-block-b-postgres` nach den Postconditions entfernt und deren
  Abwesenheit verifiziert; die synthetische Testdatenbank ist nicht
  wiederherstellbar und enthielt zuletzt keine Session-/Item-/Set-Zeilen.
- Full Contract Review: F-ACT-R9-33 bis -37 gefunden und korrigiert; alle fünf
  Raceordnungen, Auth/RLS/ACL/Owner/Search-Path/Overload/Direct-DML,
  Fresh/Rerun/Drift/Rollback/Forward-after-Rollback und Scope-Isolation
  geprüft. Keine offene In-Scope-P0-/P1-Lücke.
- Produktive Wirkung: keine. Kein produktives SQL, keine reale
  Activity-V2-Sessionmutation, kein Deploy und kein Commit.
- Gate: `PASS`; technisches `GO` für den weiterhin owner-gateten Block C
  (`S4.3-S4.5`), zugleich `STOP vor Block C`. S4.3-S4.5, S4.9 und S4.10
  wurden nicht begonnen; produktives SQL 23 bleibt ein separates Owner-Gate.

## S4 Block C

- Kontext-/Driftcheck: Roadmap/Evidence vollständig und gezielte
  R4-/R7-/R8-/Block-A-/Block-B-/UI-/Statequellen gelesen; HEAD
  `0d9192f533091954e4b55e786046f004d25d1ea5` und ausschließlich bekannte
  R9-Deltas bestätigt, kein fremdes überlappendes Delta.
- Günstige Vorbaseline: 186/186 Activity-V2-Contracttests `PASS`.
- S4.3: neuer isolierter History-Controller, Shell, CSS und lokaler
  Fakeadapter-Harness für bounded Liste, Pagination, Loading/Empty/Error/Retry
  und persistierte Snapshotdetails; EV-ACT-R9-BR01/-BR02 `PASS`.
- S4.4: policy-gesteuerte Correction-UI auf dem Block-A-Modell mit
  Originalversionskatalog, Validation, Dirty Close, Save, Conflict/Replay und
  Unknown-Reconciliation; EV-ACT-R9-BR03/-BR04 `PASS`.
- S4.5: einzelne Delete-Bestätigung mit Tag/Itemanzahl sowie rein lesender
  fail-closed Admission-Adapter vor Öffnen, Bestätigen und Dispatch;
  EV-ACT-R9-BR05 `PASS`.
- Browser: lokaler Harness mit korrekter URL/Titel/nonblank DOM, keinen
  Console-Warnings/-Errors, Screenshots für History/Correction/Delete und
  390x844-Probe mit `scrollWidth = clientWidth = 375`. Das ist praktische
  Block-C-QA; EV-ACT-R9-BR06/T-ACT-R9-18 bleibt ehrlich Block E/S5 vorbehalten.
- Contract Review: D-ACT-R9-01 bis -17/-30/-31, Identity-/Snapshot-/CAS-/
  Unknown-/Guard-/Isolationverträge sowie S4.3-Consumergrenze vollständig;
  F-ACT-R9-38/-39 gefunden, korrigiert und mit Negativoracles geschlossen.
- Nachtests: gezielt 14/14 Block-C-Tests und vollständig 200/200 Activity-V2-
  Contracttests `PASS`; `node --check`, `git diff --check` sowie
  `node tools/activity-v2-r8-isolation.mjs` `PASS` mit
  `product_v2_loads=0`, `core_network_edges=0`, `recovery_deletes=0`.
- Reviewte lokale Source-SHA-256: `session-history.js`
  `3c00c45e6c7cf891f291f52aa26c0213059736e75becaeb33412b9a474f6b1a6`,
  Shell JS `ce8d8497ee87e8be6eb8660d2f1a593610bd9fe8a00ab08c5eb71cd1853a8f19`
  und Shell CSS `423f6a67a06b6d03211eb30a4cc589eddf01f17458125c73334990f5a0154ffe`.
- Produktive Wirkung: keine. Der Harnessserver wurde gestoppt; kein
  produktives SQL, keine reale Sessionmutation, kein Productload, Deploy oder
  Commit.
- Gate: `PASS`; technisches `GO` für den weiterhin owner-gateten Block D
  (`S4.9`), zugleich `STOP vor Block D`. Block D/E wurden nicht begonnen;
  produktives SQL 23 bleibt ein separates Owner-Gate.

## S4 Block D

- Kontext-/Driftcheck: Roadmap/Evidence und die für S4.9 eingefrorenen
  Data-Access-, History-, Correction-, R4-Cache-, R7-/R8- und Supabase-
  Quellen geprüft; HEAD
  `0d9192f533091954e4b55e786046f004d25d1ea5` sowie ausschließlich bekannte
  R9-Deltas bestätigt, kein fremdes überlappendes Worktree-Delta.
- Günstige Vorbaseline: 200/200 Activity-V2-Contracttests `PASS`.
- Reale Integration: Der isolierte History-Harness und
  `session-history-integration.contract.test.js` verwenden die tatsächliche
  additive `data-access.js`-Grenze über einen deterministischen lokalen RPC-
  Transport. Correction/Delete sowie Unknown-Outcome-Reconciliation laden
  vor dem UI-Erfolg cursorlos Liste und Detail beziehungsweise bestätigte
  Absence neu.
- Cachekonsistenz: `session-shell.js` exponiert ausschließlich die additive
  Mountmethode `refreshLastPerformance(itemKeys)`. Alte/neue Keyunion,
  Generation-Fencing, Late-Settlement-Schutz, open/closed Cachezustände und
  dichte terminale `success`/`empty`/`error`/`invalidated`-Resultate sind
  geprüft.
- Refreshfehler: stale History und Detail werden entfernt, die bestätigte
  Writewirkung bleibt sichtbar und der angebotene Retry wiederholt nur Reads
  und Cache. Replace-/Delete-RPC werden dabei nicht erneut dispatcht.
- Browsernachweis: Der reale isolierte Harness bestätigte Liste/Detail,
  Unknown-Correction mit Revision-/Dauerrefresh, R4-Last-Performance für alte
  und neue Keys sowie Unknown-Delete mit bestätigter Absence; Titel, URL und
  nonblank DOM waren korrekt. Der finale Reload nach dem letzten Sourcepatch
  zeigte Liste, Snapshotdetail und Cacheaktion; die Edge-Extension meldete
  dabei einmal generisch einen geschlossenen asynchronen Message-Channel ohne
  App-Stack. Der zuvor ausgeführte End-to-End-Lauf hatte keine Consolelogs;
  die gebündelte Console-/Responsive-/A11y-Matrix bleibt T-ACT-R9-18/Block E.
- Disposable SQL-Revalidierung: Das unveränderte
  `sql/tests/23_Activity_V2_History_Lifecycle_fixture.sql` lief nach lokalem
  Bootstrap der Supabase-Rollen in `midas-r9-block-d-postgres` auf PostgreSQL
  17 vollständig mit Exit 0; der Container wurde anschließend entfernt.
- Nachtests: gezielt 55/55 und vollständig 203/203 Activity-V2-Contracttests
  `PASS`; Syntax-, `git diff --check`- und R8-Isolationschecks grün.
- Full Contract Review: F-ACT-R9-40 bis -43 gefunden, korrigiert und mit
  Negativoracles geschlossen; API-, Identity-, Reconciliation-, Retry-,
  Cache-, Consumer- und Isolationverträge ohne offene In-Scope-P0-/P1-Lücke.
- Ergänzende Reviewlane: Die offizielle CodeRabbit-CLI-Installation lief im
  lokalen Toolkanal in ein Timeout und lieferte kein Reviewresultat. Das wird
  nicht als PASS gewertet; der finale CodeRabbit-Diffreview bleibt
  T-ACT-R9-19/S5.
- Produktive Wirkung: keine. Kein produktives SQL, keine reale
  Activity-V2-Sessionmutation, kein Productload, Deploy oder Commit.
- Gate: `PASS`; technisches `GO` für den weiterhin owner-gateten Block E
  (`S4.10`), zugleich `STOP vor Block E`. Produktives SQL 23 bleibt ein
  separates Owner-Gate.

## Gekoppelter S4 Block E / S5

- Kontext-/Invalidierungsgate: HEAD
  `0d9192f533091954e4b55e786046f004d25d1ea5`, bekannte R9-Deltas und exakte
  SQL-23-/Rollback-/Fixture-/SQL-16-Hashes bestätigt. Die vollständige
  disposable SQL-/Race-/Securitymatrix aus Block B/D blieb gültig und wurde
  nicht redundant wiederholt.
- S4.10: neuer finaler Isolationstest belegt Productload-/Activity-V1-/R7-/
  R8-Grenzen, Legacy-Child-UUID-Negatividentität und ehrliche R8-Gaps. Der
  lokale Harness deckte List/Detail/Correction/Delete/Conflict/Unknown/
  Admission/Refresh ab; Browser-Console blieb leer.
- Responsive/A11y: Chromium exakt bei 1440x900, 390x844 und 320x800;
  `clientWidth = scrollWidth`, keine doppelten IDs, keine unbenannten Controls,
  korrekte H2-Fokusziele. Neun Screens außerhalb des Repositorys visuell
  geprüft. F-ACT-R9-44 im selben Lauf korrigiert.
- Finaler lokaler Gateverbund: 206/206 Activity-V2-Contracttests, Node-Syntax,
  `git diff --check`, Whitespace, Productload-Negativcheck und R8-Isolation
  `PASS protected=7 product_v2_loads=0 core_network_edges=0
  unsafe_diagnostics=0 secret_material=0 recovery_deletes=0
  local_worker_scope=1`.
- Review: A-D-Ledger über unveränderte Sourcegrenzen validiert; Full Review
  nur für Block-E-Delta/neue Integrationsflächen, keine offene P0/P1-Lücke.
  Die offizielle CodeRabbit-CLI-Installation wurde genau einmal versucht,
  blieb nach Timeout ohne Toolresultat und wird nicht als externer PASS
  ausgegeben.
- Produktiver T20-Preflight: Projekt `jlylmservssinsavlkdi`, PostgreSQL 17.6,
  Session/Current User `postgres`, R8-Struktur `657f31c1...3ee14`, Katalog
  78/80/0 mit exakten Inhaltshashes, R8-Funktionshashes/ACLs exakt, 0/0/0 und
  keine R9-Objekte. F-ACT-R9-45 schloss einen nicht kanonischen manuellen
  Hashcheck; die Wiederholung entsprach exakt dem SQL-23-Guard.
- Produktive Aktion: SQL 23 mit SHA-256 `b8180409e2199477177d4cb6fe21604467bc8da37fce73342db49c511cf01bc4`
  nach grünen T17-T20 und ausdrücklicher Owner-Freigabe exakt einmal
  ausgeführt. Keine synthetische Session, fachliche Correction/Delete oder
  sonstige Activity-DML.
- Produktiver T22-Postcheck: Revision `bigint not null default 1` plus Check,
  fünf exakte R9-Funktionshashes/Hardening/ACLs, Overloads 4/1, Direct-DML 0,
  unveränderte R8-Struktur/Funktionshashes, Katalog 78/80/0 und Sessions/
  Items/Sets 0/0/0. Data-API-Negativtest für `midas_private`: HTTP 406,
  `PGRST106`, exposed schemas nur `public, graphql_public`.
- Advisor-Diff: zusätzlich zum bekannten R8-Commit nur die zwei planmäßigen,
  owner-reviewed SECURITY-DEFINER-Mutations-RPCs Replace/Delete; keine neue
  RLS- oder Performancewarnung. Die projektweite Warnung zur deaktivierten
  Leaked-Password-Protection liegt außerhalb R9.
- Cleanup: lokaler Harnessserver auf Port 8765 gestoppt und der ausschließlich
  zur F-ACT-R9-45-Diagnose erzeugte disposable PostgreSQL-17-Container
  `midas-r9-preflight-diff` entfernt; produktive Daten nicht berührt.
- Historisches Block-E-/S5-Gate: `PASS`; T-ACT-R9-17 bis -22 und
  EV-ACT-R9-BR06/-I02/-PRE01 bis -PRE04/-W01/-P01 bleiben geschlossen.
  EV-ACT-R9-RV01 wurde durch die spätere CodeRabbit-Korrekturwelle bis zum
  finalen Null-Lauf wieder geöffnet. Weiter `STOP vor S6`; kein Rerun,
  Rollback, Productload, Web-/Edge-/APK-Deploy, Commit oder reale
  Sessionmutation.

## Post-S5 CodeRabbit-Korrekturwelle

- Toolstatus: CodeRabbit CLI 0.7.2 unter WSL, GitHub-authentifiziert; vier
  vollständige Läufe endeten mit Exit 0 und ohne Toolfehler.
- Erster Gesamtdiffreview: sechs Hinweise. Vier waren berechtigt und wurden
  als F-ACT-R9-46 bis -49 korrigiert. Zwei wurden nach realem Vertragsabgleich
  verworfen:
  - `session-history-harness.js` behält die partielle Zwei-Item-Seite bewusst
    terminal; `has_more=true` würde F-ACT-R9-41 und den realen bounded
    Data-Access-Vertrag verletzen;
  - der absolute Windows-Repositorypfad in der Neustartkarte bleibt als
    explizit owner-geforderter operativer Resume-Kontext erhalten.
- Erforderlicher Fixreview: vier weitere berechtigte Hinweise, geschlossen
  als F-ACT-R9-51 bis -54. F-ACT-R9-50 entstand unabhängig beim vollständigen
  Isolationstest und korrigierte ausschließlich den kanonischen Evidence-
  Wortlaut.
- Erster Null-Lauf-Versuch: zwei reine Doku-Konsistenzen, geschlossen als
  F-ACT-R9-55/-56; wiederholter finaler Null-Lauf ausstehend.
- Nächster Fixreview: eine Runbook-Terminologieabweichung, geschlossen als
  F-ACT-R9-57; finaler Null-Lauf erneut ausstehend. Ein vorangestellter
  recoverabler Rate-Limit-Versuch lieferte kein Reviewresultat und wurde nach
  dem von CodeRabbit genannten Cooldown regelkonform wiederholt.
- Finaler Versuch nach F-ACT-R9-57: von CodeRabbit vor der Analyse mit
  `rate_limit`, `recoverable=true`, `waitTime=28 minutes` und Exit 1 beendet.
  Die ausgegebene Findingzahl 0 ist kein Reviewresultat und wird nicht als
  Null-Lauf-PASS übernommen. Erneuter identischer CLI-Lauf erst nach Ablauf
  dieses Fensters oder nach Zuweisung eines Seats beziehungsweise einer
  ausdrücklich owner-bereitgestellten Agentic-API-Credential.
- Aktuelle Quellhashes: `session-history.js`
  `4a6872fba1dc27bfd587bd83f80892254d247d6ff43acdcd4d8b4b2364646bf5`,
  Shell JS
  `588efd44c74c9706de7bf749093210010c318ebecf16e4e50c5337d5dbb914b3`,
  Shell CSS
  `1444868d4ac2ea92ca31ca2e8f0395272935bbdaa52b850040f53716b3b36643`
  und SQL-23-Fixture
  `7c9ecb0df09fe2aa6c57c14374cf4de3d8dd405c697faf9c3bf254b71b74f0c0`.
  Produktives SQL 23 blieb unverändert bei `b8180409...1bc4`.
- Revalidierung: direkte Shell-/Controllerverträge 17/17; vollständige
  Activity-V2-Suite 208/208; Node-Syntax, `git diff --check` und R8-Isolation
  grün. Die wegen F-ACT-R9-49 invalidierte vollständige SQL-23-Fixture lief
  auf einem frischen `postgres:17-alpine` mit Exit 0 und wurde samt Container
  entfernt.
- Rendernachweis: echter Reload im isolierten Harness, Desktop und 390x844
  ohne Horizontaloverflow; `busy=false` plus disabled Save ergibt
  `cursor: not-allowed`; Dirty Editing aktiviert Save; der gescopte Dirty-
  Close-Dialog besitzt kein `aria-modal`; Cancel stellt den Fokus auf
  `Korrektur schließen` zurück. Zwei generische Extension-Message-Channel-
  Logs enthielten keinen App-Stack und stammen nicht aus dem Harness.
- Produktive Wirkung: keine. Kein SQL-Write, Rerun, Rollback, Data-API-Write,
  reale Sessionmutation, Productload, Deploy oder Commit. Das produktive
  SQL-23-Postimage 0/0/0 wurde durch diese lokale Korrekturwelle nicht berührt.
- Reviewstatus: F-ACT-R9-46 bis -57 `fixed`; keine offene In-Scope-P0-/P1-
  Lücke. Der finale CodeRabbit-Null-Lauf blieb wegen recoverablem 28-Minuten-
  Rate-Limit unbewiesen und wird nicht als PASS behauptet. Der Owner
  akzeptierte dieses begrenzte Restrisiko am 2026-08-13; T-ACT-R9-19 und
  EV-ACT-R9-RV01 sind `CONDITIONAL PASS`.

## S4R-Freeze- und Übergabenachweis

- Freeze-ID: `R9-S4R-FREEZE-2026-08-11`.
- Eingefroren: D-ACT-R9-01 bis -36, F-ACT-R9-01 bis -30, S1-/S2-/S3-
  Gate-Ergebnisse, S4R-Readiness, S4.1-S4.10-Zuordnung und Blöcke A bis E.
- Freeze-Basis: Git HEAD `0d9192f533091954e4b55e786046f004d25d1ea5`;
  Roadmap und Evidence waren die einzigen Worktree-Artefakte der Discovery-
  Welle.
- Produktive Wirkung des damaligen Freeze: keine. Block A bis Block E blieben
  clientseitig isoliert; erst S5 führte nach separater Owner-Freigabe exakt
  SQL 23 produktiv aus. Kein Productload, Deploy oder reale Sessionmutation.
- Resume-Vertrag: Die historischen Block-A- und Block-C-Karten dokumentieren
  verbrauchte Aufnahmen. Der aktuelle Stand und die nächste owner-gatete
  Grenze stehen verbindlich in Roadmap-Metadaten, Session Resume Card und der
  aktuellen Block-E-Handoffkarte.
- Öffnungsregel: Der Freeze darf nur bei real belegtem Drift mit neuer
  namespaceter Finding-ID korrigiert werden. Eine bloße neue Chatinstanz oder
  fehlende Erinnerung öffnet S1-S4R nicht erneut.

## S6 Abschlussnachweis

- Source-of-Truth-Sync: `docs/modules/Activity Module Overview.md` enthält den
  bewiesenen R9-Client-/SQL-/Runtimevertrag; der Activity-V2-Masterplan setzt
  R9 auf `DONE` und R10 auf `NEXT_ROLLING_WAVE_GATE`; HCR-027 dokumentiert
  Wiederholung und Invalidierung; `sql/HOW_TO.md` und
  `sql/16_Explicit_Grants.sql` wurden gegen SQL 23/Rollback geprüft und waren
  bereits synchron.
- Changelog: Die produktiv installierte additive History-/Lifecycle-
  Grundlage und ihre Securitygrenze sind unter `Unreleased` dokumentiert.
  Kein Release-Cut, Tag, Deploy oder Commit.
- Finaler Full Contract Review: `PASS`. Zielvertrag, Implementierung,
  produktiver Runtime-Stand und Evidence stimmen überein; keine offene
  In-Scope-P0-/P1-Lücke und kein Vorgriff auf R10-R12.
- Aktueller Supabase-Changelog am 2026-08-13 geprüft: keine dort sichtbare
  Plattform-, PostgreSQL- oder Data-API-Änderung invalidiert den installierten
  SQL-23-/ACL-/Private-Schema-Vertrag. Die reale produktive Exposition bleibt
  durch EV-ACT-R9-P01 maßgeblich.
- Reviewrisiko: vier erfolgreiche CodeRabbit-Läufe wurden vollständig
  ausgewertet und alle berechtigten Findings korrigiert. Der anschließende
  rate-limitierte Versuch liefert keinen Null-Lauf-PASS. Die ausdrückliche
  Owner-Risikoakzeptanz macht ihn zu einem nicht blockierenden
  `CONDITIONAL PASS`, ohne die fehlende Evidence umzudeuten.
- Finaler lokaler Nachweis: 208/208 Activity-V2-Contracttests, rekursive
  Node-Syntax, `git diff --check`, Productload-Negativcheck und R8-Isolation
  grün. SQL-/Fixture-/Grant-Sources blieben in S6 unverändert; deshalb bleibt
  die über den exakten Fixturehash belegte PostgreSQL-17-Matrix gültig.
- Produktiver Stand: SQL 23 weiterhin exakt einmal installiert; keine
  Sessionmutation, kein Rerun/Rollback, Productload oder Deploy; letzter
  belegter Datenstand 0/0/0.
- Abschluss: Roadmap und Evidence als `(DONE)` archiviert; kein aktives R9-
  Source-of-Truth-Duplikat. Commit-Empfehlung:
  `feat(activity-v2): add isolated session history lifecycle`.

## Finaler Evidence-Digest

- Gültige Nachweise:
  - EV-ACT-R9-B01 bis EV-ACT-R9-B05 sowie die dokumentierten S1-, S2-, S3-
    und S4R-Gates;
  - EV-ACT-R9-L01 bis EV-ACT-R9-L04 sowie das dokumentierte Block-A-Gate;
    sie belegen ausschließlich die isolierte Clientbasis aus S4.1/S4.2;
  - EV-ACT-R9-D01 bis EV-ACT-R9-D06 sowie die internen S4.6-/S4.7-/S4.8-
    und Block-B-Gates; sie belegen ausschließlich SQL-Source und Disposable-
    PostgreSQL-/PostgREST-Verhalten, keine produktive Ausführung.
  - EV-ACT-R9-BR01 bis EV-ACT-R9-BR05 sowie das Block-C-Gate; sie belegen
    ausschließlich isolierte UI-/Controller-/Fakeadapter- und Browserpfade,
    keine reale Data-Access-Integration oder Produktaktivierung.
  - EV-ACT-R9-I01 sowie das Block-D-Gate; sie belegen die reale isolierte
    Data-Access-/History-/R4-Cacheintegration und keine Produktaktivierung.
  - EV-ACT-R9-BR06 und EV-ACT-R9-I02 sowie das Block-E-Gate belegen die finale
    isolierte Browser-/Identitygrenze. EV-ACT-R9-RV01 belegt die erfolgreiche
    Review-/Fixwelle und als `CONDITIONAL PASS` die ausdrücklich akzeptierte
    Grenze des fehlenden finalen Null-Laufs.
  - EV-ACT-R9-PRE01 bis -PRE04, EV-ACT-R9-W01 und EV-ACT-R9-P01; sie belegen
    den produktiven Preflight, die exakt einmalige SQL-23-Ausführung und das
    read-only Postimage, nicht die Nutzung der Mutations-RPCs.
- Exakte produktive Wirkung:
  - ausschließlich die additive SQL-23-DDL/RPC/ACL-Wirkung. Da der Preflight
    0 Sessions belegte, initialisierte die Revision keine fachliche Zeile.
    Postimage weiter 0/0/0; kein Productload, Deploy oder reale Sessionmutation.
- Nicht ausgeführte Nachweise:
  - kein gültiger finaler CodeRabbit-Null-Lauf nach dokumentiertem Rate-Limit;
    dieses Restrisiko ist owner-akzeptiert, aber kein PASS. Kein produktiver Mutation-
    RPC-Smoke, weil er eine reale/synthetische Session benötigt hätte.
    R8-T16/T19 nicht als R9-PASS übernehmen.
- Restrisiken:
  - Activity V2 bleibt bis R12 isoliert; finaler Android-PWA-Beweis bleibt R12;
    Rollback, reale Mutation und Produktaktivierung bleiben separate Gates;
    der fehlende CodeRabbit-Null-Lauf wird nicht auf R10 als PASS übertragen.
- Roadmap-Verweise:
  - S1-S3, S4R, S4 Block A bis E, S5 und S6 sind abgeschlossen. Nächster
    erlaubter Planungsgegenstand nach neuem Owner-Auftrag ist R10; weiterhin
    keine Mutation oder Produktaktivierung aus dieser Evidence ableiten.

Abschlussregeln:

- Evidence ist nach finalem S6-Abgleich auf `DONE` gesetzt.
- Bei Widerspruch gewinnt der erneut geprüfte reale Iststand; Roadmap und
  Evidence werden gemeinsam korrigiert.
- Nach Archivierung keine aktive zweite Source of Truth zurücklassen.

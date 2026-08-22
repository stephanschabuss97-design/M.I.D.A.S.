# MIDAS Activity V2 R10 Completed Activity Coaching Export V1 - Execution Evidence (DONE)

Diese Datei sammelt ausschließlich die technischen Nachweise der R10-
Roadmap. Fachliche Entscheidungen stehen in der Roadmap. Keine Secrets,
vollständigen JWTs, personenbezogenen Rohpayloads oder unnötigen
Terminalausgaben eintragen.

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap(s) | `docs/archive/MIDAS Activity V2 R10 Completed Activity Coaching Export V1 Roadmap (DONE).md` |
| Status | `DONE; gemeinsam mit der Roadmap archiviert` |
| Erstellt am | `2026-08-13` |
| Letzter Stand | `2026-08-22; S1-S6 vollständig PASS/DONE; SQL 24 produktiv installiert und postgeprüft; R10 abgeschlossen` |
| Verantwortlicher Schritt | `S1-S6 DONE; produktive Wirkung ausschließlich S5 nach Owner-Gate` |
| Umgebungen | `lokal / disposable PostgreSQL 17 / produktiv read-only / produktiv write für SQL 24` |
| Archivziel | `docs/archive/MIDAS Activity V2 R10 Completed Activity Coaching Export V1 Evidence (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Nachweisvertrag

- Diese Datei beweist:
  - reale R9-/Schema-/ACL-Baseline ohne sensible Payloads;
  - lokale JS-/Contract-/Isolationstests;
  - disposable SQL-24-, Fixture-, Security-, Snapshot- und Rollbacktests;
  - isolierte Browser-/Download-Smokes;
  - produktiven SQL-24-Preflight, Owner-Freigabe, exakte DDL-Wirkung und
    read-only Postcheck.
- Diese Datei beweist nicht:
  - fachliche Coachingqualität eines LLM;
  - Activity-V2-Produktcutover, Android-/ADB-Verhalten oder R12;
  - Doctor View, Health Export, MCP oder Prepared-Session-Import;
  - realistische Produktdaten, solange die Produktzähler leer sind.
- Source of Truth für fachliche Entscheidungen:
  - R10-Roadmap, insbesondere D-ACT-R10-01 bis -27 und Exportvertrag V1.
- Verbotene Inhalte:
  - Secrets, vollständige JWTs, personenbezogene Rohdaten, komplette
    Produkt-JSON-Exporte und unnötige Dumps.

## Baseline

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R10-B01 | Git/Repo | HEAD, Worktree und R9-DONE-Source-of-Truth | `PASS`; `main`/`5f01033e15abf59be782479ef90abb86b7b87d1e`; R10 untracked; fremde Template-/R9-Archivdeltas geschützt; archivierte R9-Roadmap/Evidence vorhanden |
| EV-ACT-R10-B02 | lokal + produktiv read-only | Tabellen-/Spalten-/FK-/RLS-/ACL-Postimage SQL 20-23 | `PASS`; vier RLS-Tabellen, vier SELECT-Policies, Composite-FKs, exakte Owner-/ACL-Grenze, `revision bigint`; keine Session-`catalog_version` |
| EV-ACT-R10-B03 | produktiv read-only | V2 Katalog-/Historien-/Function-/Timeoutstand vor SQL 24 | `PASS baseline`; PostgreSQL 17.6, Katalog `78/80/0` mit Hashes `1bc0853352280268497dc9b48f73d31722eb3cb7e505762c966554c38bca2147`/`ca18cdefa6017c94d9f070911acdce872e34631dd5396df0e9063bb7776395d4` und Referenzen `0/0`; Historie `0/0/0`, SQL 24 absent, alle R8/R9-Function-Hashes kanonisch; `authenticated`/`authenticator` jeweils `statement_timeout=8s`; in S5 unter PRE01 bis PRE04 frisch bestätigt |
| EV-ACT-R10-B04 | Toolchain | Node, Docker/PostgreSQL, Supabase CLI, Browser und CodeRabbit | `PASS`; Node 24.18.0, npm 11.18.0, Docker 29.7.2, Supabase CLI 2.109.1, Python 3.14.6, PG-17/Supabase-17.6-Images; Browser-Plugin installiert; CodeRabbit-Plugin 1.1.4 und kanonische WSL-CLI 0.7.2 verfügbar |
| EV-ACT-R10-B05 | Primärquellen | aktuelle Function-/RLS-/ACL-/Data-API-/Timeout-/Changelog-Vorgaben | `PASS`; Supabase Functions/RLS/Timeouts/Advisors, PostgREST-14 Transactions und PostgreSQL-17 Volatility am 2026-08-13 geprüft |
| EV-ACT-R10-B06 | lokal/QA | günstige unveränderte R9-Baselinechecks und freie IDs | `PASS`; Activity-V2-Contracts `208/208`, Isolation `PASS`, Katalog `v2/80/47/58 PASS`; nächste HCR-ID `HCR-028`, R10-T-/EV-IDs namespaced |

<!-- markdownlint-enable MD013 -->

Relevante lokale SHA-256-Baseline:

- SQL 20: `6926ef4d4bc3ddfcc7585b4a024a849c202c183adb4b465c1223262ef8993e6e`;
- SQL 21: `5fa58f6519dfdd2607b22edd8caa51cbd2eb714cefea81ba0b22ff29cd24af7a`;
- SQL 22: `429520e59295939c7f9279a2a694c6f9d7b4770d4bb9106bf8b7d2cb35b3d0e3`;
- SQL 23: `b8180409e2199477177d4cb6fe21604467bc8da37fce73342db49c511cf01bc4`;
- SQL 23 Rollback:
  `de2de5e9b2e5ed9e00309a222f53fd07546bd5a5383119c3386f051a52fcef41`;
- SQL 16: `cbe2ea0e1bcc89f6be38ae83f645aa19d57d4334158c5f9ace356360058851fc`;
- R9 Data Access:
  `cbbe6b6a20c55ca00b486c2348b31cb33ba31dd32d8e25f782768e61cac303f9`.

Produktive Function-Hashes wurden read-only erneut als exakt R8/R9 bestätigt:

- Commit: `7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e`;
- Last Performance:
  `36958865e48db7f6ca13a7ad36d0d8751f53729c5d40c762654ab2baa73d296e`;
- List: `aeca949ea42b53ec3b7ead67668be4b3c6b70553d538068c01f93157ad0de8ed`;
- Detail: `53938011daac6fe80e68a9c3464604b69f396a4d5f5ff4d274cfbcca925cbb11`;
- Replace: `feb73a16ccc2680f8ddb368ffbabd1c4cb41320838af9d6040b6c6d2a7cf1f7f`;
- Delete: `97474cc440ca538abd0fa6f444bb2bb69fd801f2080c28e5d81599484477f54b`;
- private Canonicalization:
  `7fe25b2b010faf95615907d700091579565b39088adcd44d0bd0484333f30f5e`.

## Discovery-Gates S1 bis S4R

<!-- markdownlint-disable MD013 -->

| Gate | Reviewumfang | Findings / Korrektur | Direkt wiederholte Checks | Urteil |
| --- | --- | --- | --- | --- |
| S1 | Full Code-/Contract-/Consumer-Review von Repo, Git, SQL 20-23, R9, Data Access, Isolation, Health-Export-Referenz, QA, Runtime, Produktbaseline und Primärquellen | F-ACT-R10-19/-20: Snapshot- und Ownerfiltervertrag korrigiert; F-ACT-R10-23/-24/-25 als Watchlists erfasst | relevante Roadmap-/SQL-/Consumerabgleiche; 208 Contracts, Isolation, Katalog; produktiver read-only Baselinequery | `PASS` |
| S2 | Zielvertrag gegen reale Spalten/FKs/Constraints, Masterplan, R1/C2 und S1 | F-ACT-R10-21/-22: exakte Keysets/Typen/Enums/API/Fehler sowie Drift-/Orderregeln ergänzt | vollständiger Exportvertrag gegen SQL-, JS- und Consumergrenzen erneut gelesen | `PASS` |
| S3 | Security-, BOLA-, Daten-, Snapshot-/Race-, Range-, Cap-, Numeric-, Empty-, Privacy-, Isolation-, Rollback-, Provisioning- und Consumer-Red-Team | jedes P0/P1-Risiko besitzt Prevention und T-/EV-Orakel; keine neue Korrektur nach Abschlussmatrix | S3-Matrix gegen S4-/S5-Pakete und Owner-Gates revalidiert | `PASS` |
| S4R | Readiness pro S4.1-S4.5: Inputs, Outputs, Consumer, Failure Modes, Tests, Invalidierung, Rollback und Gates | keine offenen P0/P1; Watchlists F-ACT-R10-23..25 klar S4.2/S5 zugewiesen | Statusmatrix, Findings, Evidence und Resume Card auf identischen Stand geprüft | `CONDITIONAL GO`; STOP vor S4.1 |

<!-- markdownlint-enable MD013 -->

Readiness-Blöcke:

1. Block A `S4.1` allein: `PASS` am 2026-08-22.
2. Block B `S4.2` allein: `PASS` am 2026-08-22.
3. Block C `S4.3-S4.5` gemeinsam: `PASS` am 2026-08-22; F-ACT-R10-31
   geschlossen.

S4.1 bis S4.5 endeten vollständig lokal und isoliert. S5 hat SQL 24 nach
expliziter Einzel-Freigabe inzwischen produktiv installiert und postgeprüft;
sämtliche Produktpfade bleiben weiterhin ohne R10-Load. Verbindlicher STOP
vor S6.

## S4 Implementation Gates

<!-- markdownlint-disable MD013 -->

| Gate | Delta-/Consumer-Review | Findings / Korrektur | Direkt wiederholte Checks | Urteil |
| --- | --- | --- | --- | --- |
| S4.1 | Pure V1-Keysets, Typen, Enums, Units, Nullbarkeit, Field Policies, Counts/Caps, Cautions, Sortierung, Vienna-Range, Presets, Filename, Deep-Freeze und S4.3/S4.4-API | F-ACT-R10-26: Range-Obergrenze aus UTC-`generated_at` auf den korrekten Vienna-Tag umgestellt; F-ACT-R10-27: Decision-Source-Verweis synchronisiert; F-ACT-R10-24 nach realem WSL-CLI-Recheck geschlossen | gezielt T-ACT-R10-01..04 `14/14`; alle Activity-V2-Contracts `222/222`; Syntax, Katalog und Isolation `PASS` | `PASS`; STOP vor S4.2 |
| S4.2 | SQL-24-Source/Function/Consumer, Dependency-/Overload-/Source-/ACL-/RLS-Guards, historischer Katalog, Range, Counts/Caps, Snapshot, Rollback und SQL-16-Spiegel | F-ACT-R10-28/-29/-30 korrigiert; F-ACT-R10-25 geschlossen; F-ACT-R10-31 als nicht blockierende S4.5-Invalidierung erfasst | kompletter PG17-Fixture Exit 0; SQL24->S4.1-Validator PASS; gezielt 14/14; Gesamt 221/222 mit einzig erwartetem SQL-16-Hashorakel | `PASS`; STOP vor S4.3 |
| S4.3 | Single-RPC-Adapter, Range-before-I/O, S4.1-Responsegrenze, Fehler-/Retry-/Statevertrag und R8/R9-Consumerkompatibilität | F-ACT-R10-34: exakte Own-Data-Keyprüfung für Adapter und Controller ergänzt | T-ACT-R10-05 fünf Fälle plus direkt invalidierter Data-Access-Contract; Body-/Retry-/Leak-/Stateorakel | `PASS`; weiter mit S4.4 im freigegebenen Block |
| S4.4 | Controllerzustände, Presets/Custom, stale guard, Blob/URL-Lifecycle, Shellcopy, A11y/Viewport und Harnessfixture | F-ACT-R10-32 Tooling-Watch; F-ACT-R10-33 Favicon-404 und F-ACT-R10-35 Rangefilter korrigiert | Controller 5/5; lokaler Edge/Playwright-Fallback Desktop/390/320 3/3 einschließlich Console/Page Errors und Downloadparse | `PASS`; weiter mit S4.5 im freigegebenen Block |
| S4.5 | Produktisolation, Adjacent-Negativorakel, SQL-/Client-Key-/Enumparität, Consumerfragen und HOW-TO/Grantspiegel | F-ACT-R10-31 geschlossen; F-ACT-R10-36 Blob-/Subscriber-Lifecycle gehärtet; keine neuen P0/P1 | direkt invalidierte Matrix 48/48; Finalcontracts 5/5; Isolation PASS mit sechs Negativorakeln; Browser nach letzter Korrektur 3/3 | `PASS`; STOP vor S5 |

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R10-L01 | S4.1 | Pure Export-V1-Validator und Range-Presets | exakte Keysets, Units, Counts, Clamping und Fail-closed | `activity-coaching-export.js` SHA-256 `db5456b7e8c5149915932a702b02ebd479267143b48359a9ae91ae1dad410ebd`; Contracttest SHA-256 `b4db0f5c6f1e21b406bd92fd85b163a4f454dc1981d133e8039ef32491c86024`; gezielt 14/14, gesamt 222/222, Syntax/Katalog/Isolation PASS; keine I/O-/Produktkopplung | `PASS` |
| EV-ACT-R10-L02 | S4.2 | SQL-24-Fresh/Rerun/Drift | exakte Function-/Owner-/ACL-Postconditions | PG17 Fresh/Rerun sowie Overload-, Source-, Function-ACL- und Table-ACL-Drift PASS; exakt ein `date,date -> jsonb`, Owner postgres, stable/invoker, `search_path=""`, ACL authenticated+owner; Functionhash `ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376` | `PASS` |
| EV-ACT-R10-L03 | S4.2 | Realistisches Multi-Mode-/Multi-Catalog-Fixture | vollständiges deterministisches V1 | v1/v2, Strength/Duration/Distance/Mixed, Revision 2, gelöschte Session, Originaltags und deterministische Session-/Item-/Set-/Caution-Reihenfolge PASS; SQL24-JSON durch realen S4.1-Validator akzeptiert | `PASS` |
| EV-ACT-R10-L04 | S4.2 | Auth/RLS/fremder User/anon/PUBLIC | keine fremden oder anonymen Daten | fehlender und anonymer JWT exakt `AUTH_REQUIRED`; Owner 4 Sessions, fremder User nur eigene 1; PUBLIC/anon/service_role ohne Execute; keine User-/Request-/Fingerprint-/Child-ID-Leaks | `PASS` |
| EV-ACT-R10-L05 | S4.2 | Snapshot-/Race-/Correction-/Delete-Fixture | kein gemischter oder partieller Export | Mixed-Version, Ordergap, Missing Catalog, Snapshot- und Non-Strength-Setdrift explizit abgelehnt; concurrent Correction und Delete jeweils nur vollständiges Vor- oder Nachbild | `PASS` |
| EV-ACT-R10-L06 | S4.2/S5 | Range-/Cap-/Empty-/Error-Grenzen | all-or-error, kein Truncation | Null/from>to/367/future abgelehnt; Empty vollständig; im finalen S5-Vollfixture exakt 1000/10000/50000 in 1,159023s unter 8s und 13.666.612 Bytes; jede Einzelüberschreitung mit Limit-Token vor Payloadbau | `PASS` |
| EV-ACT-R10-L07 | S4.2/S5 | Rollback, Forward und SQL-16-Provisioning | nur Function/ACL betroffen, Daten unverändert | ACL-Driftrollback und zweiter Rollback abgelehnt; exakter Rollback/Forward PASS; Session-/Item-/Sethashes und final 0/0/0 unverändert; SQL 16 lehnt Source-/Owner-/Invoker-/Stable-/Search-Path-Drift vor Grants ab | `PASS` |
| EV-ACT-R10-L08 | S4.3 | Data-Access-Adapter | genau ein RPC, sichere Fehler, strict validation | T-ACT-R10-05 5/5 plus direkt invalidierter Data-Access-Contract PASS; exakt ein logical RPC/identischer Retrybody; S4.1 Deep-Freeze; Auth/Range/Cap/Snapshot/Contract/Request ohne Raw-Leak oder Commit-/Mutationstate | `PASS` |
| EV-ACT-R10-L09 | S4.4/S5 | Browser-Harness Desktop/390/320 | Presets, Custom, Empty, Error, Retry, Download | Edge/Playwright 1.55 Fallback im S5-Finallauf 3/3 bei 1280x900, 390x844, 320x800; Fokus/Tastatur/Touch >=44px/kein Overflow/keine Console- oder Page Errors; ungültige Custom-Range behält Werte, lässt Korrektur zu und Empty-Download bleibt parsebar/revoket | `PASS` |
| EV-ACT-R10-L10 | S4.5 | Isolation und Negativorakel | kein Produktload/V1/Doctor/Health-Export-Delta | Isolation PASS: product_v2_loads=0, SQL-16-R10-Hash exakt, sechs Negativpfade für Doctor/Reports/Health/Protein/Trendpilot; Produktindex/SW/V1 ohne R10-Load | `PASS` |
| EV-ACT-R10-L11 | S4.5/S5 | Coaching-Consumer-Fragen | alle Fragen aus Fixture ohne LLM beantwortbar | realistisches V1/C2-Fixture durch S4.1 validiert; Counts 2/3/1, Kataloge 1/2, 120 min, 20,25 km, device-relative/Assistance/Revision/Cautions im S5-Finallauf erneut deterministisch beantwortet; kein API-Call | `PASS` |
| EV-ACT-R10-L12 | S5 | Native Full Code-/Contract-/Security-/Consumer-Review | keine offenen P0/P1-Findings | Gesamtdiff, SQL/ACL/Snapshot/Range/Cap/Isolation/Rollback/Consumer und Produktwirkung vollständig geprüft; Isolationserwartung korrigiert; finale Activity-V2-Matrix 237/237 und fokussierte R10-Matrix 29/29 PASS | `PASS` |
| EV-ACT-R10-L13 | S5 | CodeRabbit initial/verifiziert | Findings bewertet, Korrekturen revalidiert | initial: nur fremdes Templatefinding, untracked R10 nicht erfasst; vollständige Verifikation: fünf Findings, drei berechtigt korrigiert, zwei vertragsbegründet verworfen; wegen zwei neuer P1-Findings zulässiger Nachreview: nur ein P2-Evidencefinding, korrigiert; kein offenes P0/P1 | `PASS` |

<!-- markdownlint-enable MD013 -->

Regeln:

- Lange Ausgaben bleiben in temporären lokalen Logs. Hier stehen nur
  Versionen, Zähler, Hashes, relevante Fehler und Postconditions.
- Disposable Daten werden nur im wegwerfbaren Teststack angelegt.
- Bei einem Fehler werden Ursache, Korrektur und Wiederholung unter derselben
  Evidence-ID dokumentiert.
- Bereits gültige R9-Evidence wird referenziert und nur bei Invalidation neu
  erzeugt.

## Produktiver Read-only Preflight

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-ACT-R10-PRE01 | Function `activity_v2_coaching_export(date,date)` vor SQL 24 | frischer S5-Preflight 2026-08-22: exakt absent | `PASS` |
| EV-ACT-R10-PRE02 | Tabellen, RLS, Owner und Function-ACL-Basis | vier exakte Tabellen, Owner postgres, RLS aktiv, vier authenticated-SELECT-Policies, authenticated SELECT ohne Write, anon ohne Zugriff; R8/R9-Dependencyhashes kanonisch | `PASS` |
| EV-ACT-R10-PRE03 | V2 Session-/Item-/Set-Zähler und Datenhashes | 0/0/0; alle drei vollständigen Tabellenhashes `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`; Katalog 78/80 mit kanonischen Hashes | `PASS`; Empty-Produktstand |
| EV-ACT-R10-PRE04 | Advisors und relevante Securitywarnungen | exakt drei bekannte R8/R9-SECURITY-DEFINER-Warnungen plus deaktivierter Leaked-Password-Schutz; keine R10-Function/Warnung vor Ausführung | `PASS`; F-ACT-R10-23 bleibt Watch |
| EV-ACT-R10-PRE05 | Freigegebener SQL-24-Hash und Rollback-Hash | lokal reviewt/eingefroren und vor Produktlauf erneut bestätigt: SQL 24 `fad0af25e471553a7d1f7263e502d0e5a58423560fc655753a7630f5ba3bd1b6`; Rollback `ce4d5d2dbc4634eaa5c056434fb54f9a6b6eb1eea7f8665dbed77c290db1d9d7`; Fixture `3a79ca0fb5c3a83a64ddef5e424931f9e120e7770ecbcdf7d3c80f7423559877`; SQL 16 `8f6882c6f3945d86ad1e3455391009e3a91a4f286672b54dec747bb1a950ff4c` | `PASS`; SQL 24 exakt freigegeben und ausgeführt |

<!-- markdownlint-enable MD013 -->

Advisor-Referenzen für die bestehende Watchlist:

- [Lint 0029: authenticated SECURITY DEFINER executable](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
  - für die drei absichtlich exponierten, bereits R8/R9-reviewten Write-RPCs;
- [Supabase Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
  - für den R10-fremden Auth-Hinweis zum Leaked-Password-Schutz.

Preflight-Entscheidung:

- Erwartete Wirkung:
  - genau eine additive/replaced read-only Function mit exakter Signatur,
    Owner-/Proconfig-/ACL-Postcondition;
  - keine Tabellen-, Spalten-, Session-, Item- oder Setmutation.
- Geschützte Daten:
  - alle Activity-V1-Daten und sämtliche fachlichen Activity-V2-Zeilen;
  - Doctor View, Health Export, Profil und andere Gesundheitsmodule.
- Stop-Bedingung:
  - Schema-/ACL-Drift, unerwartete bestehende Signatur, offene P0/P1-Findings,
    nicht grüne disposable Matrix oder fehlende Owner-Freigabe.
- Owner Briefing:
  - vor der Produktaktion erfolgt: genau eine read-only Function/ACL, keine
    Sessionmutation, erwartetes Empty-V1, geschützte Objekte und separater
    Rollback erläutert.
- Freigabe:
  - explizite Einzel-Freigabe des Owners im aktuellen S5-Auftrag am
    2026-08-22; sie galt ausschließlich SQL 24, nicht dem Rollback.

## Produktive Aktionen

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R10-W01 | SQL 24 produktiv ausführen | `explizit am 2026-08-22` | read-only Exportfunction und ACL installieren | exakt `sql/24_Activity_V2_Coaching_Export.sql` mit SHA-256 `fad0af25e471553a7d1f7263e502d0e5a58423560fc655753a7630f5ba3bd1b6` einmal per linked Supabase CLI ausgeführt; Exit 0; keine Fixture-/Session-DML, kein Retry/Deploy | `PASS` |
| EV-ACT-R10-W02 | SQL-24-Rollback nur bei begründeter Abweichung | `nicht automatisch freigegeben` | Exportfunction entfernen, keine Datenänderung | `nicht geplant` | `N/A` |

<!-- markdownlint-enable MD013 -->

## Vorher-/Nachher-Nachweis

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| Exportfunction Signatur | `absent am 2026-08-22` | `public.activity_v2_coaching_export(date,date) returns jsonb` | exakt vorhanden; Functiondef-SHA-256 `ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376` | `PASS` |
| Function Owner/Mode | `N/A; Function absent` | `postgres / STABLE / SECURITY INVOKER / search_path=''` | exakt `postgres / STABLE / SECURITY INVOKER / search_path=''` | `PASS` |
| Execute ACL | `N/A; Function absent` | `authenticated ja; PUBLIC/anon/service_role nein; postgres Owner` | exakt authenticated plus postgres Owner; PUBLIC/anon/service_role nein; anon runtime vor Body und fehlende Claims mit `MIDAS_ACTIVITY_AUTH_REQUIRED` abgelehnt | `PASS` |
| V2 Sessions | `0`, Empty-Hash | `unverändert` | `0`, identischer Empty-Hash | `PASS` |
| V2 Items | `0`, Empty-Hash | `unverändert` | `0`, identischer Empty-Hash | `PASS` |
| V2 Sets | `0`, Empty-Hash | `unverändert` | `0`, identischer Empty-Hash | `PASS` |

<!-- markdownlint-enable MD013 -->

Geschützte Negativnachweise:

- keine synthetische Produkt-Session;
- keine Änderung oder Löschung realer Sessions;
- kein neuer Produktload und keine Activity-V1-/Doctor-/Health-Export-
  Änderung;
- keine fremden Userdaten in Response oder Diagnose.

## Deploy- und Runtime-Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Ziel | Version / Run-ID | Smoke | Schreibwirkung | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R10-R01 | Produktive SQL-24-Function | `M.I.D.A.S./jlylmservssinsavlkdi; PostgreSQL 17.6; SQL-24-Hash fad0af25...bd1b6` | exakte Function/ACL; anon und fehlender Auth abgelehnt; angemeldeter Realuser erhält clientvalidiertes Empty-V1 mit schema/range/counts/units/quality | `nur Function-DDL/ACL; Daten 0/0/0 und Hashes unverändert` | `PASS` |
| EV-ACT-R10-R02 | Isolierter Browser-Harness | `lokal 2026-08-22; Playwright 1.55 / Microsoft Edge` | Desktop/390/320, Download/Range/Empty/Error/Retry/A11y einschließlich Invalid-Range-Werterhalt 3/3 PASS; In-App-Service nicht verfügbar, erlaubter Fallback | `nein` | `PASS; S5 wiederholt` |
| EV-ACT-R10-R03 | Web/Edge/Android | `nicht Teil R10` | kein Deploy | `nein` | `N/A` |

<!-- markdownlint-enable MD013 -->

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- |
| F-ACT-R10-19 | PostgreSQL-17-Primärquelle: `STABLE` nutzt Calling-Query-Snapshot; PostgREST-14-POST ist read-only | internen Ein-Statement-Zwang durch einen logischen Snapshot-RPC mit Count-before-build ersetzt | Roadmap D-24, Exportvertrag, S3 und S4.2 abgeglichen | `fixed` |
| F-ACT-R10-20 | reales Catalog-Schema besitzt keine `user_id`; nur Sessions/Items/Sets sind user-owned | Ownerfilter präzise auf drei User-Tabellen begrenzt; exakter globaler Original-Katalogjoin | produktive Spalten-/RLS-/FK-Baseline erneut geprüft | `fixed` |
| F-ACT-R10-21 | initialer V1-Text ließ Keysets, Millisekundenform, Enums, Fehler und Client-API teilweise offen | vollständigen normativen Contract ergänzt | gegen SQL-Constraints und R9-Validatorgrenzen revalidiert | `fixed` |
| F-ACT-R10-22 | DB-Constraints allein beweisen keine lückenlose Item-/Setordnung oder einheitliche Sessionversion | explizite Snapshotdriftbedingungen und Tests ergänzt | S3-/S4.2-/Evidence-Orakel abgeglichen | `fixed` |
| F-ACT-R10-23 | produktiver Security Advisor, read-only | keine R10-Änderung; bestehende Warnungen separiert | S5-Advisor vor/nach SQL 24 identisch: keine neue R10-Warnung | `watch` |
| F-ACT-R10-24 | frische lokale Toolinventur 2026-08-22 | dokumentierten WSL-Pfad statt Windows-PATH als kanonischen CLI-Weg bestätigt; CodeRabbit 0.7.2 verfügbar, Review weiterhin erst S5 | `/root/.local/bin/coderabbit --version` erfolgreich; kein Reviewlauf | `fixed` |
| F-ACT-R10-25 | vor Implementierung keine Maximalpayload-/Laufzeitmessung möglich; produktiver read-only Check zeigt `authenticated statement_timeout=8s` | exakte 1000/10000/50000-Matrix und jede Einzelüberschreitung unter 8s ausgeführt; keine Timeoutänderung erforderlich | letzter Vollfixture: 1,452691s, 13.666.612 Bytes; Over-Caps mit exaktem Token; kompletter Lauf Exit 0 | `fixed` |
| F-ACT-R10-26 | S4.1-Delta-Review: UTC-Kalendertag von `generated_at` kann vom aktuellen Vienna-Tag abweichen | Export-Rangeprüfung leitet `today` mit `Europe/Vienna` aus demselben Timestamp ab | T-ACT-R10-02 deckt Sommer-/Winter-UTC-Tagesgrenzen ab; gezielt und gesamt PASS | `fixed` |
| F-ACT-R10-27 | Evidence-Nachweisvertrag nannte nur D-ACT-R10-01 bis -23, obwohl die Roadmap bis -27 eingefroren ist | Source-of-Truth-Verweis auf D-ACT-R10-01 bis -27 korrigiert | Roadmap-Entscheidungslog und Evidence-Nachweisvertrag erneut abgeglichen | `fixed` |
| F-ACT-R10-28 | erster echter SQL-24-Call: `COALESCE` ist nicht schemaqualifizierbar; reales Katalogfeld heißt `label` | `pg_catalog.coalesce` auf das SQL-Konstrukt und `c.item_label` auf `c.label` korrigiert; Functionhash neu eingefroren | Fresh/Rerun, Empty, Real, Validatorbrücke, Cap und Vollfixture erneut PASS | `fixed` |
| F-ACT-R10-29 | Delta-Review: erster Forward-Guard belegte noch nicht alle R8/R9-Dependencies und Tabellen-ACLs | Commit/Lookup/private Helper mit exakten Hashes sowie Owner/RLS/SELECT-only-ACL aller vier Tabellen in Guard aufgenommen; eigenes ACL-Driftorakel ergänzt | kompletter PG17-Fixture nach Korrektur Exit 0 | `fixed` |
| F-ACT-R10-30 | Fixture-Review: 365 Tagesdifferenz ist gültige 366-Tage-Inklusivgrenze; Delete-Race brauchte das unmittelbare Post-Correction-Preimage | Negativrange auf 366 Differenztage und Race-Referenz vor Delete aktualisiert | Invalid-Range und beide Snapshot-Races erneut PASS | `fixed` |
| F-ACT-R10-31 | S4.5-Isolationsfortschreibung | SQL-16-Hash auf den geprüften R10-Stand aktualisiert und sechs Adjacent-Negativorakel ergänzt | Isolation erneut PASS; `product_v2_loads=0`, `r10_negative_oracles=6` | `fixed` |
| F-ACT-R10-32 | Browser-Plugin-Aufruf scheitert ohne trusted Node-REPL-Browser-Service | erlaubten lokalen Edge/Playwright-Fallback verwendet; S5 versuchte Plugin erneut zuerst | finale Desktop-/390-/320-Matrix 3/3 PASS | `watch` |
| F-ACT-R10-33 | erster Browserlauf: alleiniger Favicon-404 in allen drei Console-Orakeln | isoliertes Data-Favicon ergänzt | Console/Page Errors danach leer, 3/3 PASS | `fixed` |
| F-ACT-R10-34 | Delta-Review: Rangeobjekte konnten noch Accessor-/versteckte Extrakeys tragen | Adapter und Controller auf exakte Own-Data-Properties gehärtet | neue Negativfälle sowie 48/48 direkte Contracts PASS | `fixed` |
| F-ACT-R10-35 | Fakeadapter bildete beliebige Custom-Range zunächst nicht durch Filter/Counts/Cautions ab | Fixtureableitung vollständig rangeabhängig gemacht | Custom-/Empty-Browsermatrix und Validator erneut PASS | `fixed` |
| F-ACT-R10-36 | begrenzter S4.5-Delta-/Consumer-Review: werfende Subscriber oder Fehler nach URL-Erzeugung konnten den State-/Blob-Lifecycle stören | Subscriberfehler isoliert; Filename vor Blob/URL berechnet | Controllercontract mit werfendem Consumer sowie Browsermatrix erneut PASS; EV-ACT-R10-L12 blieb bis S5 offen | `fixed` |
| F-ACT-R10-37 | S5-Gesamtlauf: Isolation-Contract erwartete noch die R9-Ausgabe ohne R10-Orakelzähler | payloadfreie Erwartung um `r10_negative_oracles=6` ergänzt | finale Activity-V2-Matrix 237/237 und Isolation PASS | `fixed` |
| F-ACT-R10-38 | aktuelles Supabase-17.6-Image startet neu und `postgres` ist nicht Superuser; disposable `dblink`-Raceharness erwartet früheren Testzustand | ausschließlich im exakt benannten Wegwerfcontainer privilegierten Harnesszustand hergestellt | vollständiges PG17-Fixture PASS; Container danach entfernt | `fixed` |
| F-ACT-R10-39 | initialer CodeRabbit-Lauf erfasste untracked R10-Dateien nicht | nur R10-Dateisatz temporär gestaged, vollständig reviewt und ursprünglichen unstaged Indexzustand wiederhergestellt | `git status`/Index geprüft; vollständiger Verifikationslauf vorhanden | `fixed` |
| F-ACT-R10-40 | CodeRabbit P1: SQL 16 konnte einer gedrifteten vorhandenen Exportfunction Execute geben | Functionhash, Owner, Returntyp, Invoker, Stable und leeren Search Path vor Grants validiert | SQL-16-Runtime-Driftorakel, Vollfixture, Isolation und 237/237 PASS | `fixed` |
| F-ACT-R10-41 | CodeRabbit P1: TOCTOU zwischen SQL-24-Preimageguard und Tabellenlock | `SHARE`-Lock vor alle katalog-/tabellenkritischen Guards verschoben | Fresh/Rerun/Drift/Rollback/Forward/Race-Vollfixture erneut PASS | `fixed` |
| F-ACT-R10-42 | ungültige Custom-Range wurde beim Error-Render auf vorherigen gültigen State zurückgesetzt | Shell behält aktuelle Eingabe bei `INVALID_EXPORT_REQUEST` | 320px-Orakel prüft Fehler, Werterhalt, Korrektur und Empty-Download; Browser 3/3 PASS | `fixed` |
| F-ACT-R10-43 | CodeRabbit-Minors verlangten strengere Unicode-/Control-Textregeln und beanstandeten lokale Fixture-Credential | verworfen: Regeln widersprechen R1/R9-`btrim`-Persistenz; `password=postgres` ist nur dokumentierter Wegwerfcontainer, kein Produktsecret | Vertrags-/Fixture-/Produktgrenze erneut geprüft | `rejected` |
| F-ACT-R10-44 | erlaubter P1-Nachreview: F-ACT-R10-36 war missverständlich als S4-Finalreview bezeichnet | auf begrenzten S4.5-Delta-/Consumer-Review präzisiert | Roadmap/Evidence abgeglichen; EV-L12 eindeutig S5-Native-Review | `fixed` |
| F-ACT-R10-45 | erster read-only Produktdiagnosequery qualifizierte `COALESCE` fälschlich mit `pg_catalog` | Query korrigiert, ohne Write vollständig neu ausgeführt | frischer Produktpreflight anschließend PASS | `fixed` |
| F-ACT-R10-46 | erster read-only S6-Recheck verglich benannte Identity-Arguments mit unbenanntem `date,date` und meldete false absent | Lookup auf exaktes `to_regprocedure('public.activity_v2_coaching_export(date,date)')` korrigiert | exakt eine Function mit `p_from date, p_to date`, kanonischem Hash/ACL/Hardening und 0/0/0 bestätigt; beide Queries ohne Write | `fixed` |
| F-ACT-R10-47 | HOW-TO konnte einen zusätzlichen produktiven SQL-16-Lauf nach SQL 24 nahelegen | Produktpfad auf ausschließlich SQL 24 präzisiert; SQL 16 als Full-Build-/Grantspiegel und separates künftiges Owner-Gate dokumentiert | gegen realen S5-Produktlauf, SQL-24-Selbsthärtung, SQL-16-Guard und S6-Postimage geprüft | `fixed` |

<!-- markdownlint-enable MD013 -->

## S5 Gate

Urteil: `PASS`; S5 vollständig abgeschlossen; verbindlicher STOP vor S6.

- EV-ACT-R10-L01 bis -L13, PRE01 bis -PRE05, W01 und R01/R02 sind PASS.
- SQL 24 wurde nach explizitem Owner-Briefing und Einzel-Gate exakt einmal
  produktiv ausgeführt. Rollback W02 blieb unberührt und ist weiterhin nicht
  automatisch freigegeben.
- Produktpostimage: Functiondef-Hash
  `ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376`,
  authenticated-only Execute, korrektes Auth-Fail-closed und clientvalidiertes
  Empty-V1. Session-/Item-/Set-Zähler und vollständige Tabellenhashes sind
  unverändert; kein neuer R10-Advisorbefund.
- Keine offenen P0/P1-, Security-, Datenintegritäts- oder Scope-Blocker.
  F-ACT-R10-23 und -32 bleiben nicht blockierende Watchlists.

## S6 Gate

Urteil: `PASS`; Dokumentation entspricht dem realen Produktpostimage und R10
ist gemeinsam mit dieser Evidence `DONE` archiviert.

- Activity Overview und Masterplan dokumentieren R10 DONE, SQL 24 produktiv
  installiert, weiterhin keinen sichtbaren Consumer und R11 als nächstes
  Rolling-Wave-Gate.
- HCR-028 hält die dauerhafte QA-/Invalidierungsgrenze für Exportvertrag,
  Snapshot, Security, Caps, Isolation, Browser und Produktpostimage.
- SQL HOW-TO enthält den exakten Produktrecord und stellt klar, dass auf dem
  kanonischen R9-Produktziel nur SQL 24 lief; SQL 16 blieb Full-Build-
  Grantspiegel. CHANGELOG `Unreleased / Added` erfasst die produktive Function.
- S6-Read-only-Recheck: exakte benannte `date,date`-Function, Functionhash
  `ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376`,
  Owner `postgres`, `STABLE SECURITY INVOKER`, `search_path=''`, ACL nur
  postgres/authenticated und V2 0/0/0. F-ACT-R10-46/-47 geschlossen; kein
  Produktwrite.
- Finale günstige Checks nach Doku-Sync: Activity-V2-Contracts `237/237`,
  Isolation `PASS` mit sechs R10-Negativorakeln und `git diff --check PASS`.
- Owner-Recap und vollständige copy-paste-fähige Denkraum-Übergabe stehen in
  der archivierten Roadmap. Commit/Push und Doctor-CSS-Fußnote bleiben
  ausdrücklich außerhalb dieses S6-Writes.

## Finaler Evidence-Digest

- Gültige Nachweise:
  - Discovery-Baseline EV-ACT-R10-B01 bis -B06;
  - S1-, S2-, S3- und S4R-Gate-Records dieser Datei und der Roadmap;
  - S4.1-Gate und EV-ACT-R10-L01 mit T-ACT-R10-01 bis -04;
  - S4.2-Gate und EV-ACT-R10-L02 bis -L07 mit T-ACT-R10-06 bis -11;
  - S4.3-S4.5-Gates und EV-ACT-R10-L08 bis -L11 mit T-ACT-R10-05 sowie
    -12 bis -14;
  - S5-Gate, EV-ACT-R10-L01 bis -L13 und T-ACT-R10-01 bis -18: finale
    Node-/Contractmatrix 237/237, fokussiert 29/29, Isolation, Consumer,
    Native Review, CodeRabbit und Browser 3/3 PASS;
  - frischer Produktpreflight PRE01 bis PRE05, freigegebene Produktaktion W01,
    Produktpostcheck R01 und isolierter Browsernachweis R02 PASS;
  - S6-Postimage-Recheck, Activity Overview, Masterplan, HCR-028, SQL HOW-TO,
    Changelog, Owner-Recap und Denkraum-Übergabe PASS.
- Exakte produktive Wirkung:
  - durch S1-S4.5 `keine`; S5 installierte ausschließlich die read-only
    Function/ACL aus SQL 24 mit Hash
    `fad0af25e471553a7d1f7263e502d0e5a58423560fc655753a7630f5ba3bd1b6`.
    V2 blieb 0/0/0 und hashidentisch; kein Deploy und keine Produkt-DML.
- Nicht ausgeführte Nachweise:
  - W02/Rollback wurde mangels Abweichung nicht ausgeführt und bleibt separat
    owner-gated;
  - produktive Browser-/Webtests und Deploys sind nicht R10-Scope; innerhalb
    R10 fehlt kein Pflichtnachweis.
- Restrisiken:
  - F-ACT-R10-23: bekannte R10-fremde Advisorwarnungen weiter beobachten;
  - F-ACT-R10-32: In-App-Browser-Service nicht verfügbar; dokumentierter
    lokaler Edge/Playwright-Fallback erneut grün;
  - F-ACT-R10-31 und -37 bis -47 entschieden; keine offenen P0/P1.
- Roadmap-Verweise:
  - normativer Exportvertrag sowie S3-, S4R-, S4-, S5- und S6-Gate-Records
    der archivierten zugehörigen Roadmap.

Abschlussstand:

- Evidence ist nach finalem S6-Abgleich `DONE`.
- Bei Widerspruch gewinnt der reale Iststand; Roadmap und Evidence werden
  gemeinsam korrigiert.
- Nach der gemeinsamen Archivierung bleibt keine aktive zweite R10-Source-of-
  Truth unter `docs/` zurück.

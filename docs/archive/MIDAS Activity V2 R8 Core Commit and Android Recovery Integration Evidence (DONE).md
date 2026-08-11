# MIDAS Activity V2 R8 Core Commit and Android Recovery Integration - Execution Evidence

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap(s) | `docs/archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Roadmap (DONE).md` |
| Status | `DONE_WITH_OWNER_ACCEPTED_EVIDENCE_GAP` |
| Erstellt am | `2026-08-10` |
| Letzter Stand | `2026-08-11; S6 DONE, R8 mit expliziter T16-/T19-Evidence-Lücke abgeschlossen` |
| Verantwortlicher Schritt | `S1-S6` |
| Umgebungen | `lokal / disposable / produktiv read-only / produktiv write / Browser / Android Device` |
| Archivziel | `docs/archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Evidence (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Nachweisvertrag

- Diese Datei beweist:
  - Baseline und Unverändertheit von R2/R7/C2;
  - Commit-Intent-, CAS-, Idempotenz-, Unknown-, Retry- und Cleanupverhalten;
  - SQL-22-Kompatibilität, Rerun, Security und produktive Postconditions;
  - Browser-Recovery/Commit-Smokes sowie Android-Debug-/Releaseisolation und
    den ausdrücklich nicht ausgeführten Device-Smoke.
- Diese Datei beweist nicht:
  - produktive Activity-V2-Aktivierung oder Ablösung von Activity V1;
  - Cross-Device-Sync oder Backup;
  - Historie, Korrektur, Löschung, Export, Doctor View oder R12-Cutover;
  - medizinische oder trainingswissenschaftliche Richtigkeit.
- Source of Truth für fachliche Entscheidungen:
  - R8-Entscheidungslog D-ACT-R8-01 bis -42.
- Verbotene Inhalte:
  - Secrets, Passwörter, vollständige JWTs, echte Gesundheitsrohpayloads,
    unnötige Terminaldumps oder personenbezogene Testdaten.

## Baseline

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R8-B01 | lokal | Git-Stand, Activity-V2-Dateien, Scriptgrenze, Node-/Katalogbaseline | `PASS`; `main`/`1e0294f0f514eec9b08b9b4f3e8e57d435d0bdd6`, nur R8-Roadmap/Evidence untracked; 12 V2-JS-Dateien, Syntax 12/12, Contracts 119/119, Katalog 2/80/47/58 Runtime+SQL PASS; kein V2-Produkt-/SW-Load. |
| EV-ACT-R8-B02 | lokal | Draft v3, R7 Envelope v1, Controller-/Store-/CAS-/Tombstone-API | `PASS`; Draft v3 exakt 7/6/6 Keys und 11 Methoden; Recovery-DB v1/Store/Slot/Envelope v1, vollständige Frozen-Observation, Transaction-Complete, Lease/Generation/Sequence/Request/Revision-CAS und tokenrotierter Tombstone real bestätigt; noch kein Commit-Intent. |
| EV-ACT-R8-B03 | lokal | R2 Data-Access-Request/Response/Fehler/Retry/Semantikbindung | `PASS`; `commitSession({requestId,payload})`, einmal serialisierter Body, maxAttempts 2, Known=`not_committed`, nach Dispatch/malformed Success=`unknown`, exakte R2-Responseprüfung; Commit derzeit fest an v1-Semantik gebunden. |
| EV-ACT-R8-B04 | produktiv read-only | Katalogversionen/Zähler, RPC-Attribute/ACL, Activity-V2-Sessionzähler | `PASS`; PostgreSQL 17.6; v1=78 SHA-256 `782b568c4fd19938e9caa84c78be0a248248a4f204bbccb3554765133b84df78`, v2=80 SHA-256 `d33b17d31190992c14c0f2135187076e8e082e2a2bd442cd7e6d9cbdf630eb65`; beide identisch zur guarded Disposable-Fixture; Sessions/Items/Sets=0/0/0; vier RLS-Tabellen mit je einer Policy; RPCs Owner postgres, leerer Search Path, Commit Definer/volatile, Lookup Invoker/stable, Execute nur authenticated; Tabellen nur SELECT für authenticated. |
| EV-ACT-R8-B05 | Toolchain | Docker/Supabase/psql/Browser/ADB/Device/PWA-Testlane | `PASS mit Gate`; Node 24.18.0, npm 11.18.0, Deno 2.9.5, Supabase CLI 2.109.1, Docker 29.7.2, WSL-psql 16.14, Edge, ADB 37.0.0, Gradle 8.7/JDK 17; Config PG17, lokaler Stack gestoppt; guarded PG17-Container-Fixture PASS und entfernt. Kein Device angesprochen. Debug-Isolation ist S4.11-Pflicht gemäß F-ACT-R8-15. |
| EV-ACT-R8-B06 | wiederverwendet | weiterhin gültige R2-/R7-Evidence und HCR-017 bis -025 | `PASS mit Invalidation`; R2 EV-L01..L04 für unveränderte Basis, R7 EV-ACT-R7-L01..L10 für Draft/Envelope-v1/CAS/Tombstone/Browserisolation und HCR-017..025 für bisherige Produktisolation gültig; betroffene SQL-, Data-Access-, Recovery-, Commit- und Shellteile werden in S4/S5 gezielt neu bewiesen. |

<!-- markdownlint-enable MD013 -->

Baseline-Regeln:

- Keine Rohsessions, Setwerte oder Nutzeridentitäten dokumentieren.
- Zähler, Versionen, Hashes, API-Keys und Postconditions genügen.
- Nicht verfügbare Tools werden als Blocker oder abgegrenztes Gate geführt,
  nicht durch angenommene Ergebnisse ersetzt.

### S1-Nachweisdigest und Full Review

- Pflichtquellen wurden in der Startkartenreihenfolge gelesen; Git war die
  letzte Discovery-Quelle.
- Disposable SQL: vorhandene C2-Full-Fixture auf PostgreSQL 17 lief vollständig
  grün (`S4.5 fixture PASS`, EV-ACT-C2-L01/-L02/-L04, Full Fixture PASS); der
  Container wurde anschließend entfernt. Zwei anfängliche Harness-Starts
  scheiterten ausschließlich an der generischen Containerbootstrap-Konfiguration
  (`CREATE DATABASE` in einem Mehrfachstatement; danach fehlende Supabase-
  Testrolle), erzeugten keine Repo- oder Produktivwirkung und wurden vor dem
  belastbaren Lauf korrigiert.
- Aktuelle offizielle Supabase-Verträge bestätigen die getrennte Grant-/RLS-
  Grenze und die seit 2026 standardmäßig explizite Objektfreigabe; SQL 16 und
  die R2-ACL bleiben damit aktuell fail-closed.
- Produktive Abfrage enthielt nur Metadaten, Aggregate und Kataloghashes; keine
  IDs, Sessions, JWTs, Payloads oder Gesundheitsrohwerte.
- S1-Finding F-ACT-R8-15 wurde durch den verpflichtenden debug-only
  Android-S4.11-Vertrag geschlossen.
- Ergebnis: `PASS`; kein offener P0/P1-Blocker, keine Source-of-Truth-
  Abweichung, keine Produktcode-/SQL-Source-/Runtime-Mutation.

### S2-Vertragsnachweise und Full Review

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Vertrag | Belegtes Ergebnis | Status |
| --- | --- | --- | --- |
| EV-ACT-R8-C01 | Draft-v3-Projektion | exakte R6-Keys; R2-Payload vollständig; ASCII-btrim für Itemnote; Integer-/Kommaparser, trailing Empty, Gap/Partial/Invalid und erstes Fokusziel deterministisch; kein still ausgelassenes Item | PASS |
| EV-ACT-R8-C02 | Zeit und Intent | ein Clockread, `prepared_at=ended_at`, `max(1,round(delta))`, negativ/>1440 fail-closed; Intent exakt 6 Keys, tiefgefroren, payload-/secretbegrenzt und vor Netzwerk bestätigt | PASS |
| EV-ACT-R8-C03 | Envelope und Recovery-API | nach S3-Korrektur Envelope v2 exakt 11 Keys mit Intent/Attempt, v1 Read/Continue/Autosave kompatibel, Migration nur in `prepareCommit`; fünf additive Commitmethoden, vollständiger Observation-CAS und Transaction-Complete | PASS |
| EV-ACT-R8-C04 | Commit-State-Machine | exakt eine Promise; `editing/preparing/committing/not_committed/release_pending/unknown/cleanup_pending/committed/blocked/destroyed`; Unknown/Cleanup nur identischer Retry, Release-Pending nur für allein gehaltenen Attempt 1 lokal | PASS |
| EV-ACT-R8-C05 | Data Access und Shell | additive Semantikinjektion für Request und Response bei v1-Default; Semantik nie serialisiert; Shell nur über optionale `sessionCommit`-Injection, bestehender Mount ohne Finishpfad | PASS |
| EV-ACT-R8-C06 | SQL 22 | Replay vor Katalogprüfung; neue Requests gegen genannte vorhandene Version und verwendete aktive Items/Policies; ausschließlich Function-Replacement/Hardening, SQL 16 und DB-Objekte unverändert | PASS |
| EV-ACT-R8-C07 | Browser/Disposable/Android | echte Module plus Adapter, separater lokaler PG17/RPC-Nachweis; debug-only App-ID/Datensandbox, localhost/Cleartext nur Debug, keine Produktcredentials/-origin/-session und kein physisches Recovery-Delete | PASS mit späterem Device-Gate |

<!-- markdownlint-enable MD013 -->

- Finding F-ACT-R8-16 wurde durch `release_pending` geschlossen; ein Known-
  Fehler kann den Draft erst nach bestätigtem lokalem Intent-Release freigeben.
- Review gegen S1-Systemkarte, D-ACT-R8-01..38, R2/R6/R7 und die unveränderlichen
  Grenzen: `PASS`.
- Keine Produktcode-, SQL-Source-, Produktiv-, Browser- oder Device-Mutation.

### S3-Red-Team-Nachweise und Full Review

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Red-Team-Nachweis | Korrektur / belastbares Ergebnis | Status |
| --- | --- | --- | --- |
| EV-ACT-R8-R01 | Finish-/Retry-Koaleszierung und späte Promises | synchrone Promise-/State-Veröffentlichung; Destroy/Epoch entwertet Callbacks | PASS |
| EV-ACT-R8-R02 | Mutation während Flush/Intent | bestätigter Flush, ein JS-Turn für finalen Snapshot/Clock/Intent, synchroner Preparation-Lock | PASS nach F-ACT-R8-18 |
| EV-ACT-R8-R03 | Reload/Close/Destroy an allen Grenzen | R7 vor Intent; danach konservativ Unknown oder Replay/Cleanup; kein Discard | PASS |
| EV-ACT-R8-R04 | Responseverlust, Timeout, malformed, Auth | R2-Klassifikation gegen realen `requestDispatched`-/Responsecode geprüft; unklar bleibt Unknown | PASS |
| EV-ACT-R8-R05 | Known plus Releasefehler | Release nur für aktuellen Attempt 1; lokaler Fehler Release-Pending, Claimverlust Unknown | PASS |
| EV-ACT-R8-R06 | Success plus Tombstonefehler | Cleanup-Pending mit Intent/Attempt; identischer Replay vor erneutem Complete | PASS |
| EV-ACT-R8-R07 | Multi-Tab/alter Writer | persistenter Attempt-Claim vor Netzwerk; stale Release/Complete verliert vollständigen CAS | PASS nach F-ACT-R8-17 |
| EV-ACT-R8-R08 | v1/v2/unknown/corrupt | exakte Erkennung; mögliche unbekannte Commitwahrheit ohne Discard quarantänisiert | PASS nach F-ACT-R8-19 |
| EV-ACT-R8-R09 | Mapper-Fehlermatrix | Empty/Gap/Partial/Invalid/Forbidden/Mixed und Fokusreihenfolge vollständig eingefroren | PASS |
| EV-ACT-R8-R10 | Uhrgrenzen | negativ/Future fail-closed; 0 -> 1; Rundungsgrenze 1440 exakt definiert | PASS |
| EV-ACT-R8-R11 | Katalog/Rollout/Replay | Semantik referenzgleich, genannte Version für neue Writes, Replay vor Versionsprüfung | PASS |
| EV-ACT-R8-R12 | SQL-/Rollen-Security | realer PG17-/Owner-/ACL-/RLS-Baseline gegen SQL-22-Postconditions gemappt | PASS vertraglich |
| EV-ACT-R8-R13 | Produkt-/Secretisolation | reale Script-/SW-/V1-Grenze; State/Body/Logs/Errors ohne Attempt/Semantik/Secret | PASS vertraglich |
| EV-ACT-R8-R14 | Android-Reclaim/Offline | reale Main-only-Lücke durch debug-only App-ID/localhost/Cleartext geschlossen; Device bleibt Gate | PASS mit Owner-Gate |
| EV-ACT-R8-R15 | Rollbackflächen | lokale/source Inverse, produktiver Outcome-Read vor owner-gatetem exaktem RPC-Rollback, Device ohne Data-Clear/Delete | PASS nach F-ACT-R8-21 |
| EV-ACT-R8-R16 | S4-Schnitt/Evidence/Invalidation | zwölf Substeps und L01..L08 decken Findings/Consumer/Full-Grenzen ab | PASS |
| EV-ACT-R8-R17 | Full Contract Review | unveränderliche Grenzen und alle 17 S3-Kategorien gegen Entscheidungen/Findings geprüft | PASS |

<!-- markdownlint-enable MD013 -->

- Findings F-ACT-R8-17 bis -21 wurden vor S4R im Zielvertrag korrigiert; keine
  Sicherheitsannahme wurde als bloßer späterer Testfall stehen gelassen.
- Ergebnis: `PASS`; kein P0/P1 offen, keine Source-of-Truth-Abweichung und keine
  Produktcode-, SQL-Source-, Runtime-, Browser- oder Device-Mutation.

### S4R-Readiness-Nachweise und Full Review

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Readiness-Fläche | Belastbarer Stand | Status |
| --- | --- | --- | --- |
| EV-ACT-R8-Q01 | Scope/Git | `main`/`1e0294f0...`; ausschließlich Roadmap/Evidence untracked; kein Produkt-/SQL-Source-Diff | PASS |
| EV-ACT-R8-Q02 | Vertrag/Findings | D-ACT-R8-01..38 und F-ACT-R8-01..21 vollständig in S4.1..S4.12 gemappt | PASS |
| EV-ACT-R8-Q03 | JS/Runtime | Node 24.18.0; Syntax 12/12; bestehende Contracts 119/119; Katalog 2/80/47/58 | PASS |
| EV-ACT-R8-Q04 | SQL/disposable | produktiv PG17.6 read-only; guarded lokale PG17-Full-Fixture und v1/v2-Fingerprints grün; Preimage/Rollback eingefroren | PASS |
| EV-ACT-R8-Q05 | Browser/Harness | Edge vorhanden; echte Module mit Adaptern; Test-PWA/SW/URL/Secret vollständig isoliert planbar | PASS |
| EV-ACT-R8-Q06 | Android | Gradle 8.7, JDK17, ADB 37; debug App-ID/Resource/Manifest-Pfad exakt; kein Device angesprochen | PASS mit S5-Owner-Gate |
| EV-ACT-R8-Q07 | Rollback/Gates | lokale und SQL-Source-Inverse ohne Außenwirkung; Produkt-SQL-Outcome/rollback und Device getrennt owner-gated | PASS |
| EV-ACT-R8-Q08 | Batches/Resume | A-F abhängigkeitsgeordnet; jedes Substep behält eigenen Review/Evidence; S4 stoppt vor SQL/Device/CodeRabbit | PASS |

<!-- markdownlint-enable MD013 -->

- Readiness-Urteil: `READY_FOR_S4`.
- S4 benötigt den verlangten separaten Folgeauftrag; produktives SQL und jede
  Android-Device-Aktion bleiben davon unabhängig gesperrt.
- Full Review: `PASS`; keine offene Zuordnung, kein P0/P1 und keine Mutation
  außerhalb der beiden Discovery-Dokumente.

### S4 Block A - S4.1/S4.2

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Substep | Nachweis | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R8-A01 | S4.1 Mapper/Validation | reale Draft-v3-v1/v2-Semantik; Mixed Session; alle acht Strength-Policies; trailing Empty, Gap, Partial, Invalid, Forbidden, ausgewähltes Item ohne Leistung; Integer-/Kommaparser; ASCII-btrim/Unicode; erste Fokuspriorität; R2-v1-Consumer | `PASS`; zehn direkte Mapper-/Consumerchecks, F-ACT-R8-22 korrigiert |
| EV-ACT-R8-A02 | S4.2 Time/Intent | exakt ein Clockread; Invalid Draft vor Clock; 0/24h/Rundungsobergrenze/negativ; R2-Jahr 0001..9999; exakte geordnete Intent-/Payloadkeys; Deep Freeze; gespeichertes JSON validiert als geschützter Clone; Request-/Zeit-/Payload-/Keydrift | `PASS`; fünf direkte Zeit-/Intent-/Consumerchecks, F-ACT-R8-23 korrigiert |

<!-- markdownlint-enable MD013 -->

- Implementierungsgrenze:
  - `session-commit.js` enthält nur den privaten Core; uninstrumentierter Load
    registriert keinen Namespace. Die öffentliche `sessionCommit.create`-API
    bleibt S4.5.
  - kein `fetch`, IndexedDB, Web Storage, DOM, Supabase-RPC oder produktiver
    Script-/Service-Worker-Eintrag.
- Block-A-Gesamtmatrix:
  - Activity-V2-Contracts 133/133 PASS;
  - JS-Syntax 14/14 PASS;
  - Katalogcheck Version 2 / 80 Einträge / 47 Alias-Appends / 58 Suchfälle PASS;
  - Produktload-Guard PASS.
- Full Reviews:
  - S4.1 `PASS` nach F-ACT-R8-22;
  - S4.2 `PASS` nach F-ACT-R8-23;
  - kein offenes P0/P1 und keine Produktiv-/SQL-/Browser-/Device-Wirkung.

### S4 Block B - S4.3/S4.4

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Substep | Nachweis | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R8-A03 | S4.3 Envelope/Compatibility | exakt geordneter v2-Envelope mit elf Keys; neue Session ab erstem Save v2; v1 Read/Continue/Autosave/normaler Discard unverändert v1; v2 bleibt v2; v1-zu-v2 nur bei gleicher Draftrevision mit Intent; v2-zu-v1 gesperrt; unknown/ambig/malformed v2, Intent und Attempt ohne Discard/Start-New/Tombstone | `PASS`; Versions-, Quarantäne- und Payloadbindungschecks grün; F-ACT-R8-24/-25 korrigiert |
| EV-ACT-R8-A04 | S4.4 CAS/Lock | additive fünf Recoverymethoden; synchroner Preparation-Lock; vollständiger Observation-CAS; Transaction-Complete-Grenze; monotone Attempt-Claims; Reload ohne lokalen Claim; stale Writer; Attempt-2-Release gesperrt; Release-Unlock; tokenrotierter Complete-Tombstone; Late-Destroy terminal; Accessoren vor Feldzugriff abgelehnt | `PASS`; persistent-first und Concurrencymatrix grün; F-ACT-R8-26..28 korrigiert |

<!-- markdownlint-enable MD013 -->

- Implementierungsgrenze:
  - geändert wurden ausschließlich `session-recovery.js`, der zugehörige
    Contracttest sowie Roadmap/Evidence; der aus Block A bereits vorhandene
    private Commit-Core bleibt ohne öffentliche API und ohne Produktreferenz;
  - kein Netzwerkdispatch, kein produktives SQL, kein Browserproduktload, kein
    Android-Device, kein CodeRabbit und kein physisches Record-Delete.
- Block-B-Gesamtmatrix:
  - Recovery-Contracts 37/37 PASS;
  - Activity-V2-Contracts 142/142 PASS, keine Fehler/Skips/TODOs;
  - JS-Syntax 14/14 PASS;
  - Katalogcheck Version 2 / 80 Einträge / 47 Alias-Appends / 58 Suchfälle,
    Runtime und SQL geprüft, PASS;
  - Produktload-, Draft-v3-, Activity-V1-, Service-Worker- und Diff-Hygiene-
    Guards PASS.
- Full Reviews:
  - S4.3 `PASS` nach F-ACT-R8-24/-25;
  - S4.4 `PASS` nach F-ACT-R8-26..28;
  - kein offenes In-Scope-P0/P1; der erste Teil von Block C S4.5-S4.6 bleibt
    unbegonnen und braucht einen separaten Folgeauftrag.

### S4 Block C - S4.5/S4.7

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Substep | Nachweis | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R8-A05 | S4.5 Coordinator/One-Promise | exakter gefrorener Namespace, Create-Injections, Controller und payloadfreier State; synchrone Promise-/Preparing-Publikation; Reentranzkoaleszierung; Flush -> ein Clockread -> synchrones Prepare -> Intentbestätigung -> Attempt -> Dispatch -> Complete; lokale Validation ohne Clock/Intent; Destroy vor Prepare und reentrant bei Committing; Code-/Accessor-Härtung; exakte Intentbestätigung | `PASS`; sieben benannte S4.5-Contracts; F-ACT-R8-29/-30/-32 korrigiert |
| EV-ACT-R8-A06 | S4.6 Known/Unknown/Replay/Cleanup | Resume mit persistentem Intent; Known Auth/Invalid/Request Attempt 1 versus Attempt >1; lokales Release-Pending ohne Netzwerk; Unknown/malformed/idempotency; neuer Claim plus identischer In-Process-/Reload-Retry; Claimkonflikt/malformed Claim ohne Dispatch; Created/Replay plus Cleanupfailure; malformed Release-/Complete-Bestätigung | `PASS`; acht benannte S4.6-Contracts; F-ACT-R8-31/-33 korrigiert |
| EV-ACT-R8-A07 | S4.7 Data-Access-Semantik | exakte additive Commitoption; v1-Default; explizite v2-High-Row-Request-/Responseprüfung; Kataloggleichheit; einmal gebundene Methoden; Symbol-/Accessor-Fail-Closed; einmalige Bodyserialisierung und identischer Zweifachtransport ohne Semantik; Response-Policy-/Versionsdrift konservativ `unknown` | `PASS`; drei benannte S4.7-Contracts und vollständige 16/16-Data-Access-Matrix; F-ACT-R8-34/-35 korrigiert |
| EV-ACT-R8-A08 | S4.8 SQL 22/Rollback | PG17-gebundener R2/R8-Source-Guard; exakt versionsgebundener Forward; bytegenauer R2-Rollback; Owner/Definer/Volatile/leerer Search Path/Execute nur authenticated; Struktur-/RLS-/Policy-/ACL-/Katalog-Vorher-Nachher-Schutz | `PASS`; Forward-RPC-Hash `7cdabca3…5177e`, Rollback-RPC-Hash `2241cea9…1418e`; F-ACT-R8-36/-37 korrigiert |

<!-- markdownlint-enable MD013 -->

- Implementierungsgrenze:
  - Block C ändert das additive Commitmodul und seinen Contracttest sowie
    `data-access.js` und dessen Contracttest; die bereits reviewten Recovery-
    Deltas aus Block B bleiben unverändert grün;
  - `session-draft.js`, Draftschema v3, Semantiken, Produktindex, Service Worker
    und Activity V1 besitzen keinen Diff;
  - der öffentliche Source-Namespace wird produktiv nicht geladen; kein realer
    Remoteaufruf, SQL, Browserproduktlauf, Device, CodeRabbit oder Deploy.
- Block-C-Gesamtmatrix:
  - Data-Access-Contracts 16/16 PASS;
  - Commit-Contracts 28/28 PASS;
  - Recovery-Contracts 37/37 PASS;
  - Activity-V2-Contracts 159/159 PASS, keine Fehler/Skips/TODOs;
  - JS-Syntax 14/14 PASS;
  - Katalogcheck Version 2 / 80 Einträge / 47 Alias-Appends / 58 Suchfälle,
    Runtime und SQL geprüft, PASS;
  - Git-HEAD `1e0294f0f514eec9b08b9b4f3e8e57d435d0bdd6`; Diff-, Secret-, Ambient-
    Dependency-, Produktload-, Draft-v3-, Activity-V1- und
    Service-Worker-Guards PASS.
- Supabase-Aktualitätscheck:
  - PostgREST v14 nennt keine erwartete Breaking Change für Supabase-Nutzer;
    die 2026er Data-API-Exposure-/OpenAPI-Änderungen betreffen neue Grants und
    Schemaenumeration, nicht den bestehenden explizit freigegebenen RPC oder
    den unveränderten POST-Body dieses Deltas.
- Full Reviews:
  - S4.5 `PASS` nach F-ACT-R8-29/-30/-32;
  - S4.6 `PASS` nach F-ACT-R8-31/-33;
  - S4.7 `PASS` nach F-ACT-R8-34/-35;
  - kein offenes In-Scope-P0/P1; Block C wurde vor dem separaten
    S4.8-Folgeauftrag abgeschlossen.

### Block D / S4.8

- Implementierungsgrenze:
  - neu ausschließlich SQL-22-Forward, exakter Rollback und guarded Fixture;
    geändert ausschließlich `sql/HOW_TO.md`, Roadmap und Evidence;
  - `sql/16_Explicit_Grants.sql`, Activity V1, Draft v3, Produktindex,
    Service Worker und alle produktiven Consumer bleiben unverändert;
  - keine produktive SQL-Ausführung und keine synthetische produktive Session.
- Eingefrorene Quellen:
  - kanonischer PG17-R2-`pg_get_functiondef`-SHA-256
    `2241cea9a5453a38d074abc88aebe8edb6f7e5c0226d063423daef0b1411418e`;
  - kanonischer PG17-R8-`pg_get_functiondef`-SHA-256
    `7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e`;
  - Forward-Datei
    `429520e59295939c7f9279a2a694c6f9d7b4770d4bb9106bf8b7d2cb35b3d0e3`;
    Rollback `7cefeb94f02b4123ead9796ab9ab5a4ac2c1c566d11b8528a7062219ce3e2da8`;
    Fixture `71e99a21118f8ca211b25ec30985921188c5ea10253699df033738d93f241c9a`.
- Full-Fixture:
  - lokaler Supabase-CLI-2.109.1-PostgreSQL-17.6-Container, exakt gegatete
    Datenbank `midas_activity_v2_s45`, Session/Owner `postgres`;
  - Fresh R2+C2, Forward, Rerun, sechs Preimage-/Securitydrifts, v1/v2/v3,
    fehlendes Item, Policyabweichung, Responseverlust und Replay, Auth/RLS/DML,
    committed-winner und rolled-back-winner dblink-Races, Rollbackguard und
    Forwardrestoration vollständig `PASS`;
  - Endstand v1/v2/andere `78/80/0`, Sessions/Items/Sets `0/0/0`,
    Commit-Source R8; v1/v2 bidirektional setgleich; falsche Datenbank vor
    Mutation abgewiesen;
  - lokale Testdatenbank entfernt und lokaler Stack ohne Backup gestoppt.
- Advisor/Lint:
  - `supabase db lint`: keine Schemafehler;
  - Security Advisor: keine Activity-V2-Findings; elf INFOs stammen
    ausschließlich aus den minimalen scaffold-fremden Grant-Prerequisites;
  - Performance Advisor: zwei erwartete `unused_index`-INFOs in der frisch
    aufgebauten und anschließend entfernten Wegwerf-DB.
- Invalidation:
  - Activity-V2-Contracts 159/159, JS-Syntax 14/14, Katalog
    2/80/47/58, Diff-/Whitespace-Guard `PASS`;
  - Full SQL/Security/Consumer Review `PASS` nach F-ACT-R8-36/-37;
  - `STOP` vor S4.9 / Block E.

### Block E / S4.9-S4.10

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Substep | Nachweis | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R8-A09 | S4.9 isolierte Shellintegration | explizite exakte `sessionCommit`-Injection ohne Fallback; Legacy-Mount unverändert; exakte R7-/R8-Recovery-Oberflächen; sichere Copy und Buttons für alle Commitzustände; Draft-/Close-Locks; Intent-gebundener Timerfreeze/-resume; Fokusziel und terminaler A11y-Fokus; View-Close bei Unknown/Release-/Cleanup-Pending/Blocked/Committed ohne Recovery-Discard; kein Coordinator-Destroy durch Shell | `PASS`; vier direkte S4.9-Contracts, Shell 42/42, F-ACT-R8-38/-39 korrigiert |
| EV-ACT-R8-A10 | S4.10 Commit-/Fault-Harness | isolierter Adapter ohne Endpoint/Credentials; Created/Replay/Known/Responseverlust/malformed/Delay; Intent-/Release-/Cleanupfaults über realem Recovery-Store; alle zehn Coordinatorzustände; identischer Reload-Retry; persistente Zwei-/Drei-Tab-Attempt-CAS-Races; payloadfreie Diagnose; Desktop-/Mobile-/A11y-Browserprüfung | `PASS`; vier direkte Harnesscontracts; Browser `all` COMMITTED/PASS, Reload 1/2, Races 1 Commit + 1/2 Unknown bei je zwei Dispatches; F-ACT-R8-39/-40 korrigiert |

<!-- markdownlint-enable MD013 -->

- S4.9-Invaliderung:
  - gesamte R3-R7-Shell-/Lifecyclematrix plus Commit-/Recovery-/Data-Access-
    Consumer erneut: zunächst Activity V2 163/163; nach realem R8-Harness-
    Mount/F-ACT-R8-39 finale Block-E-Matrix 167/167, Syntax 17/17, Katalog
    2/80/47/58, Diff- und Produktisolationsguards `PASS`;
  - Activity V1, Draft v3, Produktindex und Service Worker ohne Diff; kein
    produktiver Runtime-, Netzwerk-, SQL- oder Devicepfad.
- S4.9 Full Consumer/A11y Review: `PASS` nach F-ACT-R8-38/-39.
- S4.10 Browser-/Fault-Nachweis:
  - frischer `all`-Lauf: `COMMITTED/PASS`, alle zehn Zustände, vier Dispatches,
    stabile Identität und keine Page-Logs;
  - Reload: Attempts 1/2 und identischer Replay; Zwei-Tab-Race 1 Commit/1
    Unknown mit Attempts 1/2/2; Drei-Tab-Race 1 Commit/2 Unknown mit Attempts
    1/2/2/2; beide Races genau zwei Dispatches;
  - Unknown, Release-Pending und Cleanup-Pending interaktiv bis zum sicheren
    Folgezustand; Preparing/Committing mit Busy-/Close-/Mutationslock;
  - 1440x900, 390x844 und 320x800 overflow-frei, mobile Aktionen mindestens
    44 px und terminaler Fokus auf Close;
  - echter 30-s-Background, Offline und Android-Prozessreclaim sind nicht als
    S4.10-Nachweis deklariert und bleiben der S5-Lifecycle-Matrix vorbehalten.
- S4.10 Full Consumer Review: `PASS` nach F-ACT-R8-39/-40; lokaler HTTP-Server
  und Browser-Tabs nach dem Nachweis geschlossen. `STOP` vor S4.11.

### Block F / S4.11

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Substep | Nachweis | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R8-A11 | S4.11 lokale PWA-/Android-Seams | Gradle-Debugsuffix `.activityv2test`; neue Dateien nur in `src/debug`; localhost-URL und Cleartext nur im Debug-Merge; lokale installierbare PWA mit eigenem Manifest/Worker-Scope, versioniertem Controller-Gate und realen R8-Modulen; ADB-Reverse-/Supabase-Runbook ohne Repo-Secret und mit S5-Owner-Gate | `PASS`; vier direkte Contracts, Debug-/Release-Build PASS, Browser-/Responsive-Smoke PASS; F-ACT-R8-41 korrigiert; kein Device angesprochen |

<!-- markdownlint-enable MD013 -->

- Android-/Buildnachweis:
  - `assembleDebug` und `assembleRelease` PASS;
  - gemergtes Debugmanifest: Package `de.schabuss.midas.activityv2test` und
    `usesCleartextTraffic=true`; gemergtes Releasemanifest: Package
    `de.schabuss.midas` und kein Cleartext;
  - Android `src/main`, Produkt-URL und Releaseidentität ohne Diff. Der bereits
    bestehende, nicht blockierende Kotlin-Metadatenhinweis des Gradle-Lintpfads
    änderte weder erfolgreichen Build noch Mergeergebnis.
- PWA-/Browsernachweis:
  - erster Lauf belegte F-ACT-R8-41: ein vorhandener übergeordneter lokaler
    Produkt-Worker konnte vor dem engeren Worker-Claim eine veraltete
    Modul-Mischversion liefern;
  - korrigierter Bootstrap verlangt den versionierten eigenen Controller vor
    jedem Harnessmodul-Load; danach `all` COMMITTED/PASS und Unknown ->
    identischer Retry mit Attempts 1/2, zwei Dispatches und stabiler Identität;
  - 1440x900, 390x844 und 320x800 ohne Horizontaloverflow; zwölf mobile
    Aktionen mindestens 45 px; keine unerwartete Overlayfläche. Nach der
    Korrektur kein neuer App-Warn-/Errorlog; ein einmaliger Browser-Extension-
    Transporthinweis stammt aus dem verworfenen Erstlauf und nicht aus der App.
- Isolation/Secrets:
  - Produktindex, Produkt-Service-Worker, Activity V1 und Draft v3 ohne Diff;
    Produktdatei-Hashes unverändert gegenüber dem Session-Freeze;
  - Worker-Cachepräfix und Scope ausschließlich `midas-activity-v2-r8-local-test`
    beziehungsweise `/activity/v2/test-pwa/`; kein Recovery-DB-Delete;
  - Supabase URL/ANON-Key werden im Runbook nur aus `supabase status -o env`
    interaktiv in der separaten Debug-App-Sandbox übernommen. Kein Secret in
    Source oder Evidence, kein SQL, kein Deploy und keine Device-Aktion.
- S4.11 Full Review: `PASS` nach F-ACT-R8-41; internes Gate zu S4.12 bestanden.

### Block F / S4.12

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Substep | Nachweis | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R8-A12 | S4.12 integrierte Isolation/Delta-Härtung | ausführbarer Git-/Produkt-/V1-/SW-/Netzwerk-/Secret-/Recovery-Delete-Guard mit ausschließlich aggregierter Ausgabe; vier direkte Integrationscontracts; Data-Access-Diagnostik nur Operation/Code/Status; Request-ID-/Payload-Sentinel; Full Review des gesamten S4-Diffs | `PASS`; F-ACT-R8-42 korrigiert; Gesamtmatrix 175/175, Syntax 21/21 + Tool 1/1, Katalog 2/80/47/58, Android Debug/Release und Diff-/Whitespaceguards PASS |

<!-- markdownlint-enable MD013 -->

- Aggregierte Isolationprojektion:

  ```text
  PASS protected=7 product_v2_loads=0 core_network_edges=0 unsafe_diagnostics=0 secret_material=0 recovery_deletes=0 local_worker_scope=1
  ```

- Diagnose-/Privacy-Härtung:
  - F-ACT-R8-42: beliebige Transport-/Serverdetails wurden aus dem Diagnosepfad
    entfernt; erlaubt bleiben ausschließlich Operation, allowlisteter Domaincode
    und numerischer HTTP-Status;
  - ein lokales Sentinel-Fixture trägt Fake-Request-ID und Payloadmarker in einer
    Fremdexception. Weder Domainerror noch Diagnosezeile enthält einen davon.
- Finaler günstiger S4-Lauf:
  - Activity-V2-Contracts 175/175; rekursive JS-Syntax 21/21 plus Isolationstool
    1/1; Katalog `2/80/47/58`;
  - Android `assembleDebug`/`assembleRelease` PASS, Debug-/Release-Mergeidentität
    unverändert zum S4.11-Nachweis;
  - `git diff --check`, untracked Whitespace, geschützte Produktflächen, Activity
    V1, Draft v3, Produkt-Service-Worker und Secretguard PASS;
  - SQL-22-Forward/Rollback/Fixture-Hashes unverändert seit S4.8. Kein SQL-Stack,
    produktiver Read/Write, Deploy oder Devicezugriff in S4.12.
- Full S4 Diff Review: `PASS`; keine offenen In-Scope-P0/P1-Findings.
- S5 bleibt vollständig offen für CodeRabbit, disposable SQL-Rerun,
  Background/Offline, produktiven Preflight/SQL und Android-Device-Reclaim.
- Block-F-Endstand: lokaler HTTP-Server gestoppt, Browser-Prüftabs geschlossen;
  `READY_FOR_S5_WITH_OWNER_GATES`, harter STOP vor S5.

## S5 - Tests, SQL-/Runtime-/Review-Gates bis Android Owner-Gate

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Ebene | Nachweis | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R8-S501 | lokal/final | vollständige Activity-V2-Contract-, Syntax-, Katalog-, Isolation-, Diff- und Whitespace-Matrix | `PASS`; 179/179 Contracts, 21/21 Syntax, Isolation 7/0/0/0/0/0/1, Katalog 2/80/47/58, Forward-/Rollback-Hashes unverändert |
| EV-ACT-R8-S502 | disposable PG17 | frische SQL-22-Full-Fixture mit Forward/Rerun, Driftguards, v1/v2/v3, Replay, zwei Races, Rollbackguard und Restoration | `PASS`; PostgreSQL 17.6, Endstand 78/80/0, Sessions/Items/Sets 0/0/0, R8-Source `7cdabca3…5177e`; Fixture-SHA-256 `e3f76da8…4189c74d`; Wegwerf-DB entfernt, Stack gestoppt |
| EV-ACT-R8-S503 | Browser/PWA | versionierter lokaler Worker `v5`/Token `r8-s5-3`; All, Unknown→identischer Retry, Preparing-/Committing-Freeze, drei Einstiegspfade, 1440/390/320, Offline | `PASS`; All committed, Dispatches 4, Attempts 1/2/2/1/2/2/2, Race 2 Commit/3 Unknown; Unknown online und offline jeweils Attempts 1→2, Identität stabil, Fokus Close; keine Überläufe, Mindestaktion 45.375 px |
| EV-ACT-R8-S504 | Lifecycle | echter Edge-Tabwechsel für mindestens 30 Sekunden mit unverändertem Unknown-Intent | `PASS mit Messgrenze`; physischer Background 32,048 s belegt, Zustand/Dispatch/Attempt/Identität unverändert; Browsersteuerung abstrahiert `visibilityState` weiterhin als visible und Resume-Zähler 0, daher kein erfundener Hidden-Wert |
| EV-ACT-R8-S505 | Review | nativer Full Review plus CodeRabbit über 33 R8-Dateien; Findings korrigiert und invalidierte Checks wiederholt | `PASS nativ`; F-ACT-R8-43..61 geschlossen. CodeRabbit-Läufe: 2, 7, 2, 4, 1 und nach erstem Cooldown 1 Finding; F61 korrigiert. Der unmittelbare Null-Lauf war 23 Minuten rate-limitiert und wurde durch Owner-Entscheidung D-ACT-R8-42 nicht weiterverfolgt; kein Null-Ausgang wird behauptet |
| EV-ACT-R8-S506 | Android Build | debug/release Builds und Mergeidentitäten ohne Devicezugriff | `PASS`; `assembleDebug`/`assembleRelease`, Debug `de.schabuss.midas.activityv2test` mit lokalem Cleartext, Release `de.schabuss.midas` ohne Cleartext und mit unveränderter Produkt-URL |
| EV-ACT-R8-S507 | produktiv | unmittelbarer Read-only-R2-Preflight, owner-freigegebenes SQL 22, Postconditions und Advisor | `PASS`; SQL-Lauf 2026-08-11T15:51:09Z..15:51:11Z, Exit 0; R2 `2241cea9…1418e` → R8 `7cdabca3…5177e`; Katalog 78/80/0 und Historie 0/0/0 vor/nach; Owner/ACL/RLS/Policies unverändert, keine Session |

<!-- markdownlint-enable MD013 -->

- Security Advisor nach SQL 22:
  - exakt der intentional freigegebene authenticated Security-Definer-RPC-
    Warnhinweis und der vorbestehende Auth-Leaked-Password-Protection-Hinweis;
  - keine neue unerwartete Activity-V2-Securityabweichung.
- Performance Advisor:
  - zehn `unused_index`-Infos im Gesamtprojekt, darunter vier erwartete
    Activity-V2-Indizes auf weiterhin leeren Tabellen; keine SQL-22-Mutation an
    Indizes oder Tabellen.
- Browserkonsole:
  - MIDAS-Lauf ohne App-Warnung; beim Offline-Reload einmal der bekannte
    Edge-Extension-Message-Channel-Fehler der Browsersteuerung, ohne Bezug zu
    MIDAS-Code, Payload oder Netzwerkpfad.
- Harter STOP:
  - EV-ACT-R8-D01/T-ACT-R8-19 wurde nicht ausgeführt. Keine Device-Verbindung,
    Installation, Force-Stop, Prozess-Reclaim, App-Data-Clear oder Uninstall;
    das Owner-Gate ist erteilt, ADB und Wireless-Debugging melden aber 0 Geräte.

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R8-L01 | S4.1-S4.2/S5 | Mapper, Zahlen, Zeit, Intent, Freeze, Invalid/Focus | genau eine Payload oder fail-closed vor Side Effect | 14 direkte Block-A-Tests plus realer R2-v1-Consumer; Gesamtmatrix 133/133, Syntax 14/14 | PASS |
| EV-ACT-R8-L02 | S4.3-S4.4/S5 | Envelope v1/v2, Intent-/Attempt-CAS, synchroner Preparation-Lock, Quarantäne, Tombstone | kein Drift, Lost Update, unsicherer Discard oder Wiederauferstehen | neun direkte Block-B-Schwerpunkttests plus vollständige R7-Recoverymatrix; Recovery 37/37, Gesamtmatrix 142/142, Syntax 14/14, Katalog/Product-/V1-/Draft-v3-Guards PASS | PASS |
| EV-ACT-R8-L03 | S4.5-S4.6/S5 | Coordinator, Doppelklick, Known/Unknown, Attempt-Claim, Multi-Tab, Replay, Release-/Cleanupfailure, Destroy | exakt eine lokale Promise; kein ungeschützter Dispatch/Release; identischer Retry | sieben S4.5- plus acht S4.6-Contracts; Commit 28/28, Recovery 37/37, Gesamtmatrix 156/156, Syntax 14/14, Katalog/Product-/V1-/Draft-v3-/Data-Access-Guards PASS | PASS |
| EV-ACT-R8-L04 | S4.7/S5 | Data Access v1-Default plus explizite v1/v2-Semantik | Body/API rückwärtskompatibel und versionsgleich | drei direkte S4.7-Contracts plus vollständige Data-Access-Matrix 16/16; Gesamtmatrix 159/159, Syntax 14/14, Katalog 2/80/47/58, v1-Default/Body/Retry/Product-/V1-/Draft-v3-Guards PASS | PASS |
| EV-ACT-R8-L05 | S4.8/S5 | frischer disposable SQL-22-Full-Run, Rerun, Preimage-Drift, exakter Rollback/Rerun, v1/v2/new-highest, Race, ACL/RLS/Advisor | Commit nur gegen genannte vorhandene Version; Hardening unverändert; inverse Function exakt | S5 PG17.6 Full-Fixture PASS; R2 `2241cea9…1418e` -> R8 `7cdabca3…5177e`; v1/v2/v3, Missing/Policy/Replay/Responseverlust, zwei Races, Auth/RLS/DML und Driftguards grün; Endstand 78/80/0 und 0/0/0; Fixture `e3f76da8…4189c74d`; DB entfernt | PASS S5 |
| EV-ACT-R8-L06 | S4.9-S4.10/S5 | Browser-Harness, Reload, Background, Offline, Unknown, Retry, Cleanup, Viewports/A11y | UI und persistenter Zustand bleiben konsistent | S5 versionierte PWA: All, Preparing/Committing 11-s-Freeze, Unknown/Retry online+offline, 2-/3-Tab-Races und drei Einstiegspfade PASS; 1440/390/320 ohne Overflow; physischer Background 32,048 s mit dokumentierter Visibility-Automationsgrenze | PASS S5; Android-Reclaim freigegeben, ADB-Gerätezahl 0 |
| EV-ACT-R8-L07 | S4.11/S5 | debug-only Application-ID/Resource/Manifest, isolierte lokale Test-PWA, localhost/ADB-Reverse, temporäre lokale Supabase-Konfiguration | Device-Test ohne Produktload/Secret/Produktdaten und ohne Data-Clear/Delete möglich | S5 Gesamtmatrix 179/179; Syntax 21/21; Debug-/Release-Build und Mergeidentitäten PASS; Worker v5/Token r8-s5-3, Online/Offline-Browsermatrix PASS; Produkt-/V1-/Draft-v3-/SW-/Secretguards PASS; Device nicht angesprochen | PASS BUILD/SEAM; DEVICE NOT EXECUTED |
| EV-ACT-R8-L08 | S4.12/S5 | Syntax, Gesamtsuite, Katalog, Product-/V1-/SW-/Secret-/Diff-Guards | kein Scope- oder Isolationsbruch | S5 Gesamtmatrix 179/179; Syntax 21/21 plus Tool 1/1; Katalog 2/80/47/58; aggregierter Guard 7/0/0/0/0/0/1; Android Debug/Release, Diff und untracked Whitespace PASS; F-ACT-R8-43..60 geschlossen | PASS PRE-DEVICE |

<!-- markdownlint-enable MD013 -->

Disposable-Regeln:

- ausschließlich lokale Testuser und erfundene Testdaten;
- erwartete Testdaten vor dem Lauf zählen, nach dem Lauf vollständig entfernen;
- Container/Stack sauber stoppen;
- Race- und Responseverlustnachweise mit kontrollierten Gates statt Timing-
  Hoffnung;
- lange Ausgaben bleiben in temporären Logs, Evidence enthält nur relevante
  Zähler, Hashes, Fehlerursachen und Postconditions.

## Produktiver Read-only Preflight

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-ACT-R8-PRE01 | Zielprojekt, PostgreSQL-/RPC-Iststand, Katalog v1/v2, Sessionzähler, Owner/Search Path/ACL/RLS, keine Overloads | `PASS 2026-08-11 unmittelbar vor Write`; PG17.6, ein Commit-Overload, kanonisches R2 `2241cea9…1418e`, v1/v2/andere 78/80/0, 0/0/0 Historie, Owner/Definer/volatile/leerer Search Path, authenticated-only Execute, 4 RLS-Tabellen/4 Policies | none |
| EV-ACT-R8-PRE02 | finaler Hash und Diff von SQL 22; lokale/disposable Evidence vollständig grün | `PASS`; Forward `429520e5…b3d0e3`, Rollback `7cefeb94…3e2da8`, Fixture `e3f76da8…4189c74d`; EV-ACT-R8-S501/-S502 grün | none |
| EV-ACT-R8-PRE03 | keine produktive Testsession, keine Katalog-/Tabellen-/Policy-/Grant-Wirkung erwartet | `PASS vor/nach`; Katalog 78/80/0, Historie 0/0/0, RLS/Policies/ACL unverändert; SQL enthält keinen Sessioncall | none |

<!-- markdownlint-enable MD013 -->

Preflight-Entscheidung:

- Erwartete Wirkung:
  - ausschließlich kontrollierter Ersatz von
    `public.activity_v2_commit_session(uuid,jsonb)` plus Reassertion des
    bestehenden Hardening-Zielzustands.
- Geschützte Daten:
  - Activity V1, alle vorhandenen Activity-V2-Sessions und Katalogsnapshots,
    sämtliche anderen MIDAS-Daten.
- Stop-Bedingung:
  - Hash-/Objekt-/Owner-/ACL-/RLS-/Katalogdrift, unerwarteter Overload,
    unvollständige lokale Evidence oder fehlende Owner-Freigabe.
- Freigabe:
  - in diesem S5-Chat nach kontrolliertem SQL-22-Source-/Fixture-Review explizit
    erteilt und nach frischem Preflight ausschließlich für den Forward
    verbraucht; Rollback bleibt separat owner-gated.

## Produktive Aktionen

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R8-W01 | `sql/22_Activity_V2_Commit_Compatibility.sql` im bestätigten Zielprojekt ausführen | S5-Chat explizit; nur kontrolliertes SQL 22 | Commit-RPC-Kompatibilität/Hardening | `PASS`; SHA-256 `429520e5…b3d0e3`, 2026-08-11T15:51:09Z..15:51:11Z, Exit 0, genau eine Forward-Transaktion, keine Session | PASS |

<!-- markdownlint-enable MD013 -->

Verbotene produktive Aktionen:

- keine synthetische Activity-V2-Session;
- kein Kataloginsert/-update/-delete;
- keine Activity-V1-Mutation;
- kein Web-/Edge-/APK-Deploy;
- kein produktiver Feature-Cutover.

## Vorher-/Nachher-Nachweis

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| Commit-RPC-Signatur | ein `(uuid,jsonb)`, R2-Hash `2241cea9…1418e` | exakt eine `(uuid,jsonb)` | ein `(uuid,jsonb)`, R8-Hash `7cdabca3…5177e` | PASS |
| RPC Owner/Modus/Search Path/ACL | postgres/Definer/volatile/leerer Pfad/authenticated-only | unverändert gehärtet | exakt unverändert | PASS |
| Katalog v1/v2/andere | 78/80/0 | Zähler und Inhalt unverändert | 78/80/0; SQL-Transaktionsguard setgleich | PASS |
| Activity-V2-Sessions/Items/Sets | 0/0/0 | unverändert; kein Testwrite | 0/0/0 | PASS |
| Activity-V1-Daten/Objekte | außerhalb SQL-22-Wirkung | unverändert | kein DDL/DML gegen Activity V1 | PASS |
| Tabellen/RLS/Policies/Grants | vier RLS-Tabellen, vier Policies, kanonische ACL | unverändert | vier/vier; SQL-Guard bestätigt Struktur/ACL setgleich | PASS |
| Versionierter Commit | max-only | vorhandene genannte Version | R8 versionsgebundene Source `7cdabca3…5177e` | PASS |

<!-- markdownlint-enable MD013 -->

## Deploy- und Runtime-Nachweise

R8 besitzt keinen Web-, Edge- oder APK-Deploy. Produktive Runtime-Wirkung ist
auf SQL 22 begrenzt; Browser und Android verwenden isolierte lokale Testpfade.

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Ziel | Version / Run-ID | Smoke | Schreibwirkung | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R8-P01 | produktiver Commit-RPC nach SQL 22 | SQL 22 SHA `429520e5…b3d0e3`; RPC R8 `7cdabca3…5177e` | Postconditions/Advisor PASS; 0/0/0 Historie, kein Sessioncall | ausschließlich Function replace/ACL-Reassertion | PASS |
| EV-ACT-R8-D01 | debug-only testgebundene Android-PWA | Owner-Gate 2026-08-11; ADB-Preflight | Background, Prozess-Reclaim, Resume, identischer Commit, Tombstone/Reload ohne Data-Clear/Delete | keine; ADB-Gerätezahl 0, daher keine Installation/Reverse-/Prozessaktion | NOT EXECUTED; OWNER-ACCEPTED EVIDENCE GAP |
| EV-ACT-R8-F01 | finaler integrierter Stand | S6 2026-08-11 | 179/179, Syntax 21/21, Katalog 2/80/47/58, Isolation 7/0/0/0/0/0/1, Android Build PASS; D01/T16 explizit nicht PASS | keine zusätzliche | PASS CORE / DONE WITH EVIDENCE GAP |

<!-- markdownlint-enable MD013 -->

Android-Evidence muss dokumentieren:

- Gerät/Browser-/PWA-Laufzeit nur als Versionsangabe, keine Gerätekennung;
- lokale URL-/ADB-Reverse-Lane ohne Secret;
- Zustand vor Background, nach Prozess-Reclaim, nach Resume, nach Commit und
  nach Reload;
- Draftrequest-ID/Intentgleichheit nur als gekürzter Hash oder boolesche
  Gleichheit, nicht als Rohpayload;
- Abschluss der lokalen Recovery über den normalen Tombstone sowie Stop der
  lokalen Server; kein App-Data-Clear, Uninstall oder physisches Record-Delete.

## S6 - Source-of-Truth-Sync und Abschluss

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Ebene | Nachweis | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R8-S601 | Dokumentation | Activity Module Overview, Masterplan R8/O-8/R9/R12, HCR-026 und SQL HOW_TO auf den bewiesenen Core-/SQL-/Browserstand sowie die explizite Device-Lücke synchronisiert | PASS |
| EV-ACT-R8-S602 | Betrieb/Changelog | produktive SQL-22-Wirkung unter `Unreleased` dokumentiert; keine Releaseversion, kein Web-/Edge-/APK-Deploy | PASS |
| EV-ACT-R8-S603 | Owner-Entscheidung | D-ACT-R8-42 schließt S5/S6 ohne erfundenen T16-Null-Ausgang oder T19-Device-PASS; R9 ist nächstes Gate, R12 bleibt Cutover/finaler Android-Smoke | ACCEPTED |
| EV-ACT-R8-S604 | finaler Review | Full Contract-/Doku-Review, Links, Diff/Whitespace, 179/179 Contracts, Syntax 21/21, Katalog 2/80/47/58, Isolation 7/0/0/0/0/0/1 und Android Debug/Release | PASS |

<!-- markdownlint-enable MD013 -->

Abschlussklassifikation:

- `DONE_WITH_OWNER_ACCEPTED_EVIDENCE_GAP`;
- keine offenen In-Scope-P0/P1-Codefindings;
- T16 finaler CodeRabbit-Null-Lauf und T19 Android Device bleiben
  `NOT EXECUTED`, nicht `PASS`;
- keine Berechtigung für Rollback, R9-Produktwrites, R12-Cutover oder Deploy.

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- |
| Initialer Contract Review | F-ACT-R8-01 bis -14 | Roadmap-Zielvertrag, Decisions, S4/S5 und Evidence konkretisiert | Fresh-Chat- und Cross-Contract-Review | closed auf Roadmapebene |
| S1 / F-ACT-R8-15 | Android-Main-Build hat feste Produkt-URL, gemeinsame Application-ID und keine isolierte Debug-Source-Set-Grenze | S4.11 auf eigene Debug-Application-ID/Datensandbox, localhost-Resource und Cleartext ausschließlich im Debug-Manifest eingefroren; Main/Release und Produkt-Credentials bleiben unberührt | Android-/Gradle-/Manifest-/URL-Source-Read plus Toolpreflight; Device nicht angesprochen | closed auf Vertragsebene; Umsetzung/Revalidierung S4.11/S5 |
| S2 / F-ACT-R8-16 | sicherer Remote-Nichtcommit plus gescheitertes lokales Intent-Release hatte keinen eigenen Zustand | `release_pending`: Draft/Intent gesperrt, nur `releaseCommit`-Retry, kein Netzwerk; Freigabe erst nach Transaction-Complete | Zustands-, Transition-, Close-/Reload- und Failure-Review gegen R2/R7 | closed auf Vertragsebene; Umsetzung/Revalidierung S4.5-S4.6/S5 |
| S3 / F-ACT-R8-17 | Storage-CAS serialisierte keinen parallelen Remoteversuch; stale Known-Release konnte einen fremden In-flight-Commit entkoppeln | persistenter monotoner Attempt-Claim vor jedem logischen Remoteversuch; Release nur aktueller Attempt 1, Complete nur aktueller Claim | adversarielle Zwei-/Drei-Tab-Zeitlinie für Claim, Dispatch, Release, Success und stale CAS | closed auf Vertragsebene; EV-ACT-R8-R07, Umsetzung S4.3-S4.6 |
| S3 / F-ACT-R8-18 | Mutation konnte zwischen Flush und asynchronem Intentwrite interleaven | finaler Flushnachweis, Snapshot/Mapper/Clock/prepare in einem Turn und synchroner Preparation-Lock vor Await | Queue-/activeWrite-/Mutation-/Destroy-Zeitlinien gegen realen R7-Controller | closed auf Vertragsebene; EV-ACT-R8-R02, Umsetzung S4.4-S4.5 |
| S3 / F-ACT-R8-19 | unbekannter oder malformed Record war über R7-Discard tombstonebar, obwohl er R8-Intent tragen könnte | Quarantäne ohne Discard/Start-New/Tombstone für unbekannte Commitwahrheit | Unknown-schema-, extra-key-, malformed-intent/-attempt- und v1-intentfrei-Klassifikation | closed auf Vertragsebene; EV-ACT-R8-R08, Umsetzung S4.3-S4.4 |
| S3 / F-ACT-R8-20 | One-Remote-Wording widersprach R2 `maxAttempts: 2` | ein logischer Claim/Promise, darunter höchstens zwei sequenzielle Dispatches mit einmal serialisiertem Body | realer Data-Access-Callback-/`requestDispatched`-/Retry-Vertrag | closed auf Vertragsebene; EV-ACT-R8-R04, Umsetzung S4.5-S4.7 |
| S3 / F-ACT-R8-21 | SQL-Replacement hatte keinen exakten akzeptierten Preimage und keinen minimalen inversen Runtimepfad | R2-/R8-Source-Guard plus separates rollback-only RPC-SQL und read-only Outcome-Gate | Rerun-/Drift-/Unknown-Outcome-/Rollback-Review gegen SQL20 und produktive Metadatenbaseline | closed auf Vertragsebene; EV-ACT-R8-R15, Umsetzung S4.8/S5 |
| S4.1 / F-ACT-R8-22 | erste Implementierung prüfte Sessionfelder vor sichtbaren Item-/Setfehlern | Validierungsfolge auf Draftform -> Semantik/Katalog -> Items/Sets/Felder -> Sessionnote/Startzeit korrigiert | kombiniertes corrupt Item+Time-Fixture belegt ersten Setfokus; gesamte Mappermatrix erneut | closed; EV-ACT-R8-A01/L01 |
| S4.2 / F-ACT-R8-23 | JavaScript-Date-Domäne war weiter als der reale vierstellige R2-Jahresparser | explizite kanonische UTC-Domäne 0001..9999 für Draftstart und Clockende | Jahr-0000-Draft und Jahr-10000-Clock fail-closed; Zeit-/Intent-/R2-Consumerchecks erneut | closed; EV-ACT-R8-A02/L01 |
| S4.8 / F-ACT-R8-36 | erster Forward-/Rollback-Guard verwendete das ungültige `pg_catalog.coalesce` | auf die PostgreSQL-Syntax `coalesce` korrigiert; der fehlgeschlagene Erstlauf war vollständig atomar | Forward, Rerun, Rollback und Forwardrestoration auf PostgreSQL 17.6 | closed; EV-ACT-R8-A08/L05 |
| S4.8 / F-ACT-R8-37 | temporärer v1/v2-Fixturesnapshot ging an der für dblink-Races nötigen `\connect`-Sessiongrenze verloren | Snapshot in das ausschließlich disposable `midas_fixture`-Schema verschoben und nach finalem Setvergleich explizit entfernt | vollständige Full-Fixture erneut; Endstand 78/80/0, 0/0/0, R8-Hash; Stack entfernt | closed; EV-ACT-R8-A08/L05 |
| S4.9 / F-ACT-R8-38 | terminaler Erfolg blendete die aktive Finish-/Retry-Aktion aus, ohne einen sicheren Tastaturfokus zu setzen | Fokus wird vor dem Ausblenden deterministisch auf den erlaubten Close-Button verschoben | gezielter Fokuscontract und vollständige Shell-/Activity-V2-Matrix erneut | closed; EV-ACT-R8-A09/L06 |
| S4.9/S4.10 / F-ACT-R8-39 | der reale R8-Recovery-Controller erweitert die exakte R7-Oberfläche additiv; der ursprüngliche Shell-Validator akzeptierte nur R7 und blockierte deshalb den realen Harness-Mount | exakte Allowlist ausschließlich für die achtteilige R7- oder dreizehnteilige R8-Oberfläche; unbekannte Extras bleiben abgelehnt | gezielter R7-/R8-/Extra-Contract, realer Browser-Modulmount und gesamte 167/167-Matrix | closed; EV-ACT-R8-A09/-A10/L06 |
| S4.10 / F-ACT-R8-40 | erster Harnessstand diagnostizierte Setupfehler nur generisch und ließ die Blocked-Beschriftung einen nicht belegten Retry-Erfolg vermuten | payloadfreie `failure_stage`/`failure_code`-Felder und wahrheitsgetreuer Blocked-/No-Dispatch-Vertrag | Blocked ohne Dispatch, frischer `all`-PASS und vollständige Browser-/Contractmatrix erneut | closed; EV-ACT-R8-A10/L06 |
| S4.11 / F-ACT-R8-41 | ein bereits registrierter übergeordneter lokaler Produkt-Service-Worker konnte beim Erstbesuch vor dem engeren Test-Worker-Claim veraltete Activity-V2-Module liefern und erzeugte eine Mischversion | versionierter Test-Worker plus exakter Controller-/Scope-Check; dynamischer Harnessload erst nach bestätigter eigener Kontrolle | verworfener Erstlauf reproduziert; korrigierter `all`- und Unknown-Retry-Lauf, drei Viewports, Contracts und Produkt-SW-Guard erneut PASS | closed; EV-ACT-R8-A11/L07 |
| S4.12 / F-ACT-R8-42 | Data Access übernahm beliebige Transport-/Serverdetails in den Diagnosekanal; eine Fremdexception konnte deshalb Request-ID oder Payloadfragmente loggen | Diagnoseprojektion auf stabile Operation, allowlisteten Code und numerischen Status reduziert; Rohdetail wird weder formatiert noch weitergegeben | Fake-Request-ID-/Payload-Sentinel bleibt aus Error und Diagnostik fern; Data-Access-, Integrations- und Gesamtmatrix erneut PASS | closed; EV-ACT-R8-A12/L08 |
| S5 / F-ACT-R8-43..44 | CodeRabbit fand eine synchrone Snapshotfehlerlücke außerhalb der Promise-Grenze und einen geschlossenen View mit altem Fokusmarker | Save-Optionen innerhalb der Promise-Fehlergrenze; Fokusmarker auf jedem Close-/closed-State löschen | Recovery-/Shell-Regressionschecks und Gesamtmatrix erneut vollständig grün | closed; EV-ACT-R8-S505/F01 |
| S5 / F-ACT-R8-45..51 | Voll-Diff-Review fand sieben kleinere Harness-, Test-, SQL-Fixture-, Doku-, Cache- und Pfadabweichungen | publishfreie Zwischenzustände, formunabhängiges Malformed-Fixture, credential-freies/STABLE SQL-Fixture, Decision-Sync sowie exakte lokale Asset-/Pfadverträge | PG17-Full-Fixture, gezielte Contracts, Browser-Einstiegspfade und Gesamtmatrix erneut PASS | closed; EV-ACT-R8-S502/-S503/-S505 |
| S5 / F-ACT-R8-52..53 | CodeRabbit-Re-Review fand nicht garantiert geschlossene Recovery-Verbindungen und `undefined` für fehlende v1-Semantik | verschachtelte Coordinator-/Recovery-`finally`-Grenzen und explizite v1-Nullnormalisierung | Harnesscontracts, Browser-Harness und Gesamtmatrix erneut PASS | closed; EV-ACT-R8-S503/-S505 |
| S5 / F-ACT-R8-54..55 | reale Langläufer deckten überschreibbare Zwischenanzeige und wiederverwendbare unversionierte Assets auf; danach erwartete ein Isolationstest noch die alte URL | Publish vor `finish()` sperren; PWA-/Harness-Assets gemeinsam versionieren und Contract exakt synchronisieren | Preparing/Committing jeweils nach 11 s stabil, online/offline PWA PASS, Gesamtmatrix erneut vollständig grün | closed; EV-ACT-R8-S503/F01 |
| S5 / F-ACT-R8-56..59 | finaler CodeRabbit-Voll-Diff-Lauf fand Prepare-Promise-, Moduldiagnose-, Harness-Fallback- und Worker-Lifecycle-Lücken | Prepare-Saveoptionen vor Lock im Fehlerblock; getrennte Worker/Moduldiagnose; verschachtelter payloadfreier Harness-Fallback; `waitUntil` plus `Response.error()`; Assets auf r8-s5-3/v5 rotiert | 52/52 Zielchecks, All/Preparing/Offline-Retry und finale Gesamtmatrix 179/179 PASS | closed; EV-ACT-R8-S503/-S505/F01 |
| S5 / F-ACT-R8-60 | CodeRabbit fand im historischen Konsistenzabschnitt noch die alte Decision-Anzahl 31 | auf den finalen Log D-ACT-R8-01 bis -42 einschließlich Owner-Abschlussentscheidung synchronisiert | Roadmap-Source- und Linkcheck; keine Runtime-Invalidation | closed; EV-ACT-R8-S505 |
| S5 / F-ACT-R8-61 | CodeRabbit fand in der S4-Readiness-Tabelle vermischte Ausführungsstatus und Owner-Gates | separate Statusspalte; Gate enthält nur `none` oder die tatsächliche SQL-/Device-Grenze | Roadmap-Tabellenstruktur und `git diff --check`; keine Runtime-Invalidation | closed; EV-ACT-R8-S505 |

<!-- markdownlint-enable MD013 -->

Neue Findings werden hier nur mit entscheidungsrelevantem Nachweis geführt.
Große Rohlogs bleiben temporär lokal.

## Finaler Evidence-Digest

- Gültige Nachweise:
  - EV-ACT-R8-B01..B06, C01..C07, R01..R17 und Q01..Q08;
  - EV-ACT-R8-A01..A12 sowie L01..L08;
  - S5 EV-ACT-R8-S501..S507, PRE01..PRE03, W01 und P01;
  - S6 EV-ACT-R8-S601..S604 und F01 mit expliziter Evidence-Lücke.
- Exakte produktive Wirkung:
  - ausschließlich SQL 22: Commit-RPC R2 `2241cea9…1418e` auf R8
    `7cdabca3…5177e`; keine Session, kein Katalog-/Tabellen-/Policy-/Indexwrite,
    kein Activity-V1-, Web-, Edge- oder APK-Deploy.
- Nicht ausgeführte Nachweise:
  - EV-ACT-R8-D01/T-ACT-R8-19 Android Device: ADB-/Wireless-Debugging-
    Gerätezahl 0; keine Installation, Reverse-Regel oder Prozessaktion;
  - T-ACT-R8-16 finaler CodeRabbit-Null-Lauf: nach Korrektur von
    F-ACT-R8-43..61 nicht erhalten; letzter Re-Review rate-limitiert;
  - beide Nachweise sind durch D-ACT-R8-42 für R8 bewusst deferred. Ein
    späterer Nachlauf braucht einen neuen Auftrag und ändert die historische
    Abschlussklassifikation nicht still.
- Restrisiken:
  - Produkt-PWA-Cutover und Activity-V1-Ablösung bleiben R12;
  - History/Korrektur/Löschung bleibt R9;
  - Cross-Device-Sync bleibt außerhalb des Activity-V2-Vertrags.
- Aktuelles Urteil:
  - `DONE_WITH_OWNER_ACCEPTED_EVIDENCE_GAP`; R9 darf als eigene Rolling-Wave-
    Roadmap beginnen. Activity V1 bleibt produktiv; R12 behält Produktcutover,
    gecachte-PWA-Aktivierungsnachweis und finalen Android-Smoke.

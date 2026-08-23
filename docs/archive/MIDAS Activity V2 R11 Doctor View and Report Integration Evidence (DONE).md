# MIDAS Activity V2 R11 Doctor View and Report Integration - Execution Evidence

Diese Datei enthält ausschließlich technische Nachweise für R11. Sie trifft
keine Produktentscheidungen und wird nur an den betroffenen SQL-/Runtime-Gates
sowie im finalen S5-/S6-Review gelesen.

---

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap(s) | `docs/MIDAS Activity V2 R11 Doctor View and Report Integration Roadmap.md` |
| Status | `DONE; S1-S6 PASS; archiviert am 2026-08-23` |
| Erstellt am | `2026-08-22` |
| Letzter Stand | `2026-08-23; SQL25 exakt einmal owner-freigegeben produktiv; alle Postconditions und S6-Source-of-Truth-/Abschlusschecks PASS; keine Activity-/Report-DML und kein Consumerdeploy` |
| Verantwortlicher Schritt | `S1-S6; produktiver Evidence-Owner ist S5` |
| Umgebungen | `lokal / disposable PostgreSQL 17 / produktiv read-only / owner-gated produktiv DDL` |
| Archivziel | `docs/archive/MIDAS Activity V2 R11 Doctor View and Report Integration Evidence (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Nachweisvertrag

- Diese Datei beweist:
  - Ausgangsstand von V1, V2, Doctor, Report und Health Export.
  - lokale/disposable R11-Consumer-, SQL-, ACL-, Report- und Isolationschecks.
  - gegebenenfalls exakte owner-gatete SQL-25-Installation und Postconditions.
  - dass keine Activity-/Reportdaten und keine Edge-/Web-/Android-Runtime
    unautorisiert verändert wurden.
- Diese Datei beweist nicht:
  - reale Activity-V2-Produktnutzung oder Android-Smoke; dies gehört R14.
  - medizinischen Nutzen neuer Fitnessmetriken; R11 ergänzt keine.
  - R10 erneut; gültige R10-Evidence wird nur referenziert.
- Source of Truth für fachliche Entscheidungen:
  - `R11 Zielvertrag, Entscheidungslog und finaler S2/S4R-Vertrag.`
- Verbotene Inhalte:
  - Secrets, JWTs, Service-Role-Werte, personenbezogene Rohdaten,
    vollständige Report-/Health-Payloads und unnötige Terminalausgaben.

## Baseline

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-R11-B01 | Git/Repo | HEAD, Worktree, R10-DONE-Quellen und aktive R11-Artefakte | `PASS 2026-08-23: HEAD=origin/main=3cf3b41a4e3ecbec23bccb06db9acff21fd34c92; nur vorbestehender R11-Planungs-/Source-of-Truth-Diff, kein Produktcode` |
| EV-ACT-R11-B02 | lokal | aktueller V1-Doctor-/Report-/Health-Export-V2-Keyset und Tests | `PASS: exakte Doctor-/Report-/V2-Keysets und Build-before-write belegt; bestehende Edge-Contracts 22/22, Isolation 4/4; eigene Doctor-/Exportautomation als F-ACT-R11-13 S4.4/S4.5 zugeordnet` |
| EV-ACT-R11-B03 | produktiv read-only | SQL20-24 Tabellen, Functions, RLS, ACL, Owner und R10-Postimage | `PASS: PG 17.6/UTC; vier V2-Tabellen RLS/Owner postgres; SELECT-only für authenticated/service_role; R10 STABLE INVOKER, search_path='', nur authenticated, Functiondef-SHA-256 ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376` |
| EV-ACT-R11-B04 | produktiv read-only | V1-/V2-Zähler, V2-Datenhashes und SQL25-Absenz vor Eingriff | `PASS am S1-Baselinezeitpunkt: 65 V1-Activity-Events; V2 Sessions/Items/Sets 0/0/0 und damit kanonische Leermengen; damals kein lokales sql/25_*.sql und keine R11-Kandidatenfunktion` |
| EV-ACT-R11-B05 | Toolchain/Docs | Node, Deno, Docker/PG17, Supabase CLI, Browser, CodeRabbit und aktuelle Primärquellen | `PASS: Git 2.55.0, Node 24.18.0, npm 11.18.0, rg 15.2.0, Deno 2.9.5, Supabase CLI 2.109.1, Docker 29.7.2; Browser-/CodeRabbit-Plugins verfügbar; Supabase Changelog/Auth/RLS/Functions/API-Security 2026-08-23 geprüft` |

<!-- markdownlint-enable MD013 -->

## Discovery-Gates S1 bis S4R

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Gate | Aussage | Ergebnis | Status |
| --- | --- | --- | --- | --- |
| EV-ACT-R11-D01 | S1 | Producer, Consumer, Keysets, ACLs und Runtimegrenzen sind belegt. | V1/V2-Speicher-, Doctor-, Report-, Health-V2-, Browser-/Edge-Auth-, ACL-, Aktivierungs- und Fehlergrenzen vollständig kartiert; Full Review ohne offenen S1-P0/P1 | PASS |
| EV-ACT-R11-D02 | S2 | Consumer-, Report-, Health-V3- und Browser-/Edge-Securityvertrag sind eingefroren. | `midas.activity-consumer.v1`, authenticated-only Invoker-RPC ohne Ownerparameter, requestlokaler Edge-RLS-Client, versionierter Report-Untervertrag, exaktes `midas.health-export.v3` und unverdrahtete R13-Seam vollständig normiert; Full Review PASS | PASS |
| EV-ACT-R11-D03 | S3 | Bruchrisiken, Rollback, Testmatrix und Isolation sind vollständig zugeordnet. | 17 Red-Team-Risiken closed; 0 Activity-/Report-Test-DML; Produkt-Doctor-/Edge-Handler bleiben unverändert; exakte Stop-/Rollback- und neunstufige Invalidation Map; Full Review PASS | PASS |
| EV-ACT-R11-D04 | S4R | Scope-Freeze PASS und sichere S4-Batches stehen fest. | sechs Pakete mit Inputs/Outputs/Consumer/Failure Modes/Tests/Invalidierung/Rollback bewertet; S4.1 GO, S4.2-S4.6 sequenziell CONDITIONAL GO, NO-GO none; Blöcke A=S4.1, B=S4.2, C=S4.3, D=S4.4, E=S4.5, F=S4.6; S4 nicht begonnen | PASS |

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R11-L01 | S4.1/S5 | Consumer-Schema, Validator, V1/V2/Mixed/Same-day/Empty/Range | exakte Keysets, aktive Tage einmal, Sessiondauer einmal, stabile Sortierung | `PASS 2026-08-23: gemeinsame Fixture; Empty/V1/V2/Mixed/Same-day, Vienna-DST, 1/400/401 Tage, 1000/1001 V2, Sortierung, Reaggregation, Deep Freeze, Accessor/Prototype/Extrakey und sichere Fehler; neue Tests 10/10, plus bestehende Isolation 4/4 = 14/14; gesamte Activity-V2-Contractsuite 247/247` | PASS |
| EV-ACT-R11-L02 | S4.2/S5 | SQL25 Fresh/Rerun/Drift/Owner/Invoker/Search Path/ACL | nur exakte read-only Objekte und Rollen | `PASS 2026-08-23 auf PostgreSQL 17.11 (Debian 17.11-1.pgdg13+2): exakt activity_consumer_snapshot(date,date), Owner postgres, STABLE INVOKER, search_path='', rohe/effektive EXECUTE nur authenticated; Fresh/Rerun sowie Overload/Source/Owner/Mode/ACL/View/Table-ACL/Policy-Drift fail-closed; V1-Source-Domain fail-closed; Functiondef f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d` | PASS |
| EV-ACT-R11-L03 | S4.2/S5 | PG17 ohne Fachdaten-DML: Empty/Range/Auth-Claims/RLS-/BOLA-Struktur/Source-/Duration-Contract | nur authenticated Userkontext, keine Ownerparameter oder Teilreads; nichtleere Semantik separat pure | `PASS 2026-08-23: missing/anonymous auth, zwei Ownerclaims, RLS-Basisrelationen, kein Ownerparameter, 400/401/Future, exakt Empty mit average_duration_min=null, EXPLAIN, V1/V2/Item-Sourceallowlist, 1000-/Item-50-Limitquellorakel und Privacy-Negativorakel; ungültige V1-Label-/Duration-/Note-Domäne liefert stabil SOURCE_INVALID; Runtimefall über disposable View ohne Activity-DML; nichtleere Semantik weiterhin pure` | PASS |
| EV-ACT-R11-L04 | S4.2/S5 | SQL25 Rollback/Forward/Provisioning, geschützte Datenhashes und DML-Negativorakel | nur neue read-only Objekte betroffen; keine Activity-/Report-DML | `PASS 2026-08-23: kanonischer Drop-only-Rollback, zweiter Rollback sowie ACL/Dependency/Overload/Source-Drift fail-closed, anschließender Forward kanonisch; Daten- und Dependencyhashes unverändert; DML-Orakel deckt INSERT/UPDATE/DELETE/MERGE/TRUNCATE und exaktes range_report ab; PG-Postcondition Activity 0/0/0. Forward SHA256 77BE7B9FB633D324A9F51F11640B015FCC54BEA7E50DCF5392DC22EA424BC572, Rollback 7CBAE04722FD67C3E5522D15DFBE003821C0ADCD9A1BCE03642589C0FC0CB510, Fixture ED4365D67F3CA3714B5F1C60435CB6FC0E9144CA029109763B483A9B967624CF` | PASS |
| EV-ACT-R11-L05 | S4.3/S5 | Data Access, One-read, Retry, strict validation, Error/stale | keine Mutation, N+1- oder Rohfehlerleaks | `PASS 2026-08-23: T-ACT-R11-05 9/9; One-RPC und exakter p_from/p_to-Body, maxAttempts=0 plus höchstens ein Auth-Refresh, Success/Empty, 401/403-Exhaustion, fünf SQL-Tokens einschließlich SOURCE_INVALID zu CONTRACT_INVALID, Config/API, Netzwerk, non-JSON, Partial/Extrakey/Range-Drift, Abort und Stale-Fencing; sichere operation/code/status-Diagnose. Modul SHA256 0BACDCCB96C8471DFA165EBED306D69CC08608020FDC7335FB2395E310FA5791, Test SHA256 6F9B781984359601D6CDFFC9D09128799672614A8247E086A046BB5E9853EF1C` | PASS |
| EV-ACT-R11-L06 | S4.4/S5 | Deno Range-Report V1/V2/Mixed/Empty/alte Payloads, JS-/TS-Parität und Fehlersanitization | kompakte Copy, kein Rohfehler und Build-before-write bleiben stabil | `PASS 2026-08-23: neue Deno-Contracts 15/15; alle Golden Fixtures reaggregiert, strict Keysets/Accessor/Source/Sort/Partial/Extra/Range, requestlokaler User-RLS-Client und exakt ein ownerloser RPC, fünf SQL-Tokens sanitizt; ganze und gebrochene Frequenzwerte exakt als 2 beziehungsweise 0,5; Mixed/Empty-Copy, Meta/Series, Nicht-Activity-Felder, Build-before-write und Legacy/Producthandler stabil; initiale Gesamtmatrix mit Edge gemeinsam 37/37; invalidierter Lauf 15/15 sowie Check/Lint/Format PASS. SHA256 Consumer F25F45C4318D0C592EBB02D943FD267B671C0A9C3E15C71C683C8236D6BA386E, Consumer-Test 393FD7BC71FFAF9B59242149750AAD892CE63AF7624BF0F484DDFA10AEF4E2D8, Report C7F79C2B240B5CCB87AE119F30328A018818683891B8FC73238A35BDD4AE4AD8, Report-Test 696AF21349E312120371369BA986291A20497A54BA6A108D82449D1B1F3D69B9` | PASS |
| EV-ACT-R11-L07 | S4.4/S5 | Doctor-Harness Desktop/390/320, Lifecycle und Deletegrenze | V1 bleibt kompatibel; V2 read-only; kein Overflow/Fehler | `PASS 2026-08-23: Doctor-Contract 7/7; locked/lazy, Ready/Empty/Error, sichere Diagnose auch bei Getter-/Sinkfehler, Range-/Close-/Logout-Stale-Fencing, nur aktuelle V1-Delete-Seam, V2 ohne Delete und invalid Range ohne I/O. Browser-Plugin-QA sowie versionierter Playwright-Smoke Desktop 1280x900, 390x844 und 320x800 3/3; report-first, Ready/Stale/Empty/Error/Delete/Logout, Touchziele, kein horizontaler Overflow, keine Konsolen-/Seitenfehler. Produkt-Doctor-/Edge-Handler und Productload unverändert; keine DML/Deploy-Seam. SHA256 View 6A7B9126A52C3958ACD703ECA2FC6C7A5EB546BD6304ABD414235AD22DAD020F, Contract-Test 4AD979A3D40F3457BD75FAC6C28F194E3AFB617FB82E7A970A791DAD5C984770, HTML 7C640A29DD9DB5D1C600A03BDC0B8899034284990ADCC93C50E0C2E19B54F525, Harness-JS 89D8581ED044D1866DEF99D8C6BB9248C9C61DEDDBB58FF6F3D9A8FEBCB5A6B3, CSS 71401053643A1F77030D20DEF05971B7E47E0483D31B5EFFBBFA460DA659C5AF, Browser-Smoke 5980E9564006153DD0DC470C21EE5F7B36B9D68E0BBECC292A76BFBD090A2AC3` | PASS |
| EV-ACT-R11-L08 | S4.5/S5 | Health Export V2 Backcompat und V3 strict/all-or-error/privacy | V2 unverändert, V3 exakt und ohne Satzdetails | `PASS 2026-08-23: V3-Contract 8/8 für exakte V1/V2/Mixed/Same-day/Empty-Postimages, Non-Activity-Erhalt, Range/Domain/Count/Sort/Accessor/Privacy und all-or-error; Browser-Smoke einschließlich erneutem T07 5/5 auf Desktop/390/320 mit Ready/Empty/Read-Error, Touchzielen, 0 Overflow, 0 Konsolen-/Seitenfehlern und 0 Downloadankern. Produkt-Doctor-Index 11200C055E34EF861B0C1D5507F32122B5D445AFD7C0499E32571FFBF4FE7DD4, index.html 6CF9CF4E6E1C4C4E7722C568A590541C529D85E2E7DDE483CAC83F8A1BC3E30B und SW D02D5510A6CEEE8140F1925E6C83630AF5B75E35E31851DBC2B7F783A0ED0A8B unverändert/unreferenziert. SHA256 V3 538A9DB15687E8AFF87880631CA6A57865D869290FFEE5112635EE94853E1106, Test B757B7CC06AEB4F20DB65F4FC25A9BEA32BA9ECD5BF81EB692FD6CEBA998F53D, HTML 7891E6196D230ADB7DEADBCAB691BD02AF4DDEA14C97596A607761A8A9C2EFCC, Harness-JS 8A6987B34D3AEA2E00E4A4575219B63235FFC8B39D829E900D0B1BA15A26FE4D, CSS 62544AE8F190F54E5B1975A547BA52ED1DBF571FFEC335B79251C3151635A92D, Browser-Smoke A9656B40E430D28C71EFC4F590E2CC8DFFD8EE3C4804482F1B98FCA9FF9BCFEA` | PASS |
| EV-ACT-R11-L09 | S4.6/S5 | Productload, SW, Navigation, Doctor-/Edge-Handler, Test-DML sowie R10-/R12-/R13-/R14-Negativorakel | keine sichtbare/operative R11-Aktivierung und keine Activity-/Report-Test-DML | `PASS 2026-08-23: SQL16-Block auf disposable PostgreSQL 17.11 (Debian 17.11-1.pgdg13+2) bei Absenz, kanonischem SQL25-Postimage, Rerun, Partial-Signatur, Overload, Source-, Hardening- und ACL-Drift sowie Restore geprüft; Functiondef F7226F6A81E2057CD4EA345FC5D2C099B1AD88F54D8066D9B7F1759F191B3C3D und ACL postgres+authenticated exakt. Isolation/final 9/9; protected=10, R10-Orakel=20, R11-isolated=20, product_v2_loads=0, r11_product_loads=0, test_dml=0, secret_material=0, R13-read=1, R14-capture=1. SHA256 SQL16 10A607EEBF453F928E48F0B91C46F64A038D23B6F2B1F1C35E7E66745DD46341, Tool B5EEF139BB20CACE6EF7975DA7032DCCD5EA4E738F8E3FCECD636E59DD76A116, Isolation-Test 79CA1C9A480C1480C1B74F392A8AF42915550F3222702C2CDBC5C04727BFD29C, Final-Test 45A4CF1F24D4CCCDB9C0CBBA580BDB08CA222D2B09B281F4083B6EB9A003ACB5` | PASS |
| EV-ACT-R11-L10 | S5 | nativer Full Review und geplanter CodeRabbit-Zyklus | keine offenen In-Scope-P0/P1 | `PASS 2026-08-23: finale Matrix 276/276 Node, 37/37 Deno, Browser 5/5 und PG17.11 Full-Fixture; nativer Code-/Contract-/Consumer-/Securityreview PASS. CodeRabbit 0.7.5 unter WSL: genau ein Initiallauf über tracked Diff mit 1 Major; genau ein Verifikationslauf mit --include-untracked über 30 Dateien mit 2 Major/2 Minor. Alle fünf berechtigten Punkte F43-F47 korrigiert; invalidiert 18/18 Node, 15/15 Deno samt Check/Lint/Format, PG17 Full-Fixture, SQL16-Neunzustandsmatrix und Scope-/Secret-/DML-Orakel PASS. Kein dritter CodeRabbit-Lauf gemäß Vertrag.` | PASS |

<!-- markdownlint-enable MD013 -->

Regeln:

- Lange Ausgaben bleiben in temporären lokalen Logs.
- Bei Korrektur werden nur invalidierte Checks wiederholt.
- Disposable PostgreSQL-Daten bleiben isoliert und werden verworfen.
- R10-Nachweise werden referenziert, nicht kopiert oder ohne Invalidation
  erneut erzeugt.

## Produktiver Read-only Preflight

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-ACT-R11-PRE01 | exakte SQL25-Objektabsenz oder erwarteter Rerun-Stand | `PASS 2026-08-23: public.activity_consumer_snapshot besitzt 0 Signaturen; date/date absent; Session/current user postgres, PostgreSQL 17.6, UTC` | none |
| EV-ACT-R11-PRE02 | Tabellen/RLS/Owner/ACL/Dependencyhashes SQL20-24 | `PASS: health_events, Katalog, Sessions, Items, Sets Owner postgres/RLS aktiv; V1-View postgres/security_invoker=on; ACLs erwartungsgemäß health_events DML und V2 authenticated/service_role SELECT-only. Leerer-search_path-Viewhash AD86C792117188C630EB162366F3447C3A895A1E8725809215454C20938889DF; SQL25-Dependencyhash DB2BC534E5499657B25164BECBFDA56BDFDC0BACE5268882C096DAEB676B8D6B; sieben SQL20-24-Functions kanonisch, R10 EF3B00B9E674FA379D0E190C8C8B9866D14D4994F488E4B1279C66D174C22376; anon/service_role sind keine Mitglieder von authenticated` | none |
| EV-ACT-R11-PRE03 | V1-/V2-Zähler und geschützte V2-Datenhashes | `PASS: V1 65, ungültige V1-Quellwerte 0, SHA 859A06193DE7E8B646BFE50B8AF2F599662E7CE948C1D831ED161641B33CBEF7; Range-Reports 1, SHA 3D4B12D6D67AFF64E3CC9E4F26526D20CC1B53938321A0D993F088AA42F03BA2; Katalog v1/v2 78/80 ohne Fremdversion, Gesamt-SHA FE85E281B07AA3B9959A0FA6D1A6679B79BC7D5645ADD57E27BEE6D8F142823D; Sessions/Items/Sets 0/0/0 und je kanonischer Leerhash 4F53CDA18C2BAA0C0354BB5F9A3ECBE5ED12AB4D8E11BA873C2F11161202B945` | none |
| EV-ACT-R11-PRE04 | Advisors und bestehende Warnungen vor SQL25 | `PASS: Security exakt drei bekannte intentional gehärtete R8/R9-Definer-RPC-Warnungen plus Leaked-Password-Watchlist; keine R11-Warnung. Performance 8 unused-index INFO, darunter zwei leere Activity-V2-Indizes; kein WARN+ und weniger als die frühere R8-Baseline` | none; bekannte Watchlist |
| EV-ACT-R11-PRE05 | freigegebene SQL25-/Rollback-/Fixture-/SQL16-Hashes | `PASS: SQL25 77BE7B9FB633D324A9F51F11640B015FCC54BEA7E50DCF5392DC22EA424BC572; Rollback 7CBAE04722FD67C3E5522D15DFBE003821C0ADCD9A1BCE03642589C0FC0CB510; Fixture ED4365D67F3CA3714B5F1C60435CB6FC0E9144CA029109763B483A9B967624CF; SQL16 10A607EEBF453F928E48F0B91C46F64A038D23B6F2B1F1C35E7E66745DD46341` | none; SQL25-Ausführung owner-gated |

<!-- markdownlint-enable MD013 -->

Preflight-Entscheidung:

- Erwartete Wirkung:
  - `nur final reviewte read-only SQL25-Objekte und deren explizite ACL.`
- Geschützte Daten:
  - `health_events, Activity-V2-Katalog/Sessions/Items/Sets, range_report-
    Zeilen sowie alle fachlichen Zähler und Hashes.`
- Stop-Bedingung:
  - `unerwartetes Objekt, Source-/Owner-/ACL-/Hashdrift, neue Advisorwarnung,
    nicht leere unerwartete V2-Historie oder fehlende Ownerfreigabe.`
- Owner Briefing:
  - `S5 unmittelbar vor EV-ACT-R11-W01.`
- Freigabe:
  - `erteilt am 2026-08-23 für exakt SQL25 SHA256
    77BE7B9FB633D324A9F51F11640B015FCC54BEA7E50DCF5392DC22EA424BC572.`

Advisor-Referenzen der unveränderten Watchlist:

- [Lint 0029: authenticated SECURITY DEFINER executable](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
- [Supabase Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## Produktive Aktionen

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R11-W01 | exakt SQL25 einmal produktiv ausführen | explizit erteilt 2026-08-23 für SHA256 77BE7B9F...BC572 | additive read-only Function/ACL plus operativer Migration-History-Eintrag; keine fachliche DML | Supabase DDL-Aktion genau einmal erfolgreich; History `20260823083735/activity_v2_r11_consumer_compatibility`; kein Retry, SQL16, Fixture oder Rollback | PASS |
| EV-ACT-R11-W02 | SQL25-Rollback | nicht freigegeben | nur R11-Objekte entfernen | N/A | N/A |

<!-- markdownlint-enable MD013 -->

## Vorher-/Nachher-Nachweis

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| SQL25-Read-Contract | absent, 0 Signaturen | exakt einmal, owner-/ACL-konform | exakt eine date/date-Function; SHA F7226F6A...B3C3D; postgres, JSONB, STABLE INVOKER, search_path leer; ACL postgres+authenticated | PASS |
| Activity-V2 Sessions/Items/Sets | 0/0/0; je Leerhash 4F53CDA1...B945 | unverändert | 0/0/0; alle drei Hashes unverändert 4F53CDA1...B945 | PASS |
| V1 `activity_event` und `range_report` | 65 / 1; Hashes 859A0619...CBEF7 / 3D4B12D6...03BA2; invalid V1 0 | unverändert | 65 / 1; beide Hashes unverändert; invalid V1 0 | PASS |
| deployed `midas-monthly-report` | ACTIVE Version 50, Bundle-SHA 914D5F8B...3182 | unverändert; kein R11-Deploy | ACTIVE Version 50, identischer Bundle-SHA | PASS |
| produktive Web-/PWA-/Android-Runtime | keine S5-Aktion; geschützte Produktdateien im Git-Postimage unverändert | unverändert | kein Deploy und alle Productload-/Postimage-Gates PASS | PASS |

<!-- markdownlint-enable MD013 -->

Geschützte Negativnachweise:

- keine synthetische oder reale Activity-V2-Session erzeugt
- kein bestehender Arztbericht neu geschrieben oder ersetzt
- kein Health Export produktiv erzeugt
- kein PUBLIC-/anon-Zugriff und keine fremden Ownerdaten
- kein Edge-, Web-, Service-Worker-, Workflow- oder APK-Deploy

## Deploy- und Runtime-Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Ziel | Version / Run-ID | Smoke | Schreibwirkung | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-R11-R01 | produktiver SQL25-Read-Contract | Function SHA F7226F6A...B3C3D; exakt owner postgres, JSONB, STABLE SECURITY INVOKER, search_path leer, ACL postgres+authenticated; authenticated Empty-Runtime true, anonyme Claims liefern AUTH_REQUIRED | Auth/ACL/Empty/Postconditions | nur DDL/ACL | PASS |
| EV-ACT-R11-R02 | isolierter Browser-/Deno-Harness | lokal | Deno 15/15 plus Edge 22/22; Doctor 7/7; Desktop/390/320 3/3 | nein | PASS |
| EV-ACT-R11-R03 | Edge/Web/SW/Android | Report-Edge ACTIVE Version 50 und Bundle-SHA 914D5F8B...3182; geschützte Produktdateien und Productload-Gates unverändert | Negativnachweis, kein Deploy | nein | PASS |

<!-- markdownlint-enable MD013 -->

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- |
| F-ACT-R11-08 | EV-ACT-R11-D01, EV-ACT-R11-D02 | authenticated-only SECURITY-INVOKER-RPC ohne Ownerparameter und requestlokalen Edge-RLS-Client eingefroren | S2 Full Review; EV-ACT-R11-D03/-D04 und S4-Evidence bleiben Implementierungsnachweise | fixed |
| F-ACT-R11-09 | EV-ACT-R11-D02 | exaktes Health-Export-V3-Keyset, Parserbranch und V2-Nichtwirkung eingefroren | S2 Full Review; EV-ACT-R11-L08 bleibt Implementierungsnachweis | fixed |
| F-ACT-R11-13 | EV-ACT-R11-B02, EV-ACT-R11-D01, EV-ACT-R11-L08 | Doctor-Automation in S4.4 und Health-Export-Automation in S4.5 geschlossen | EV-ACT-R11-L07/-L08 PASS | fixed |
| F-ACT-R11-14 | EV-ACT-R11-B05, EV-ACT-R11-D02 | JSON-Singleton plus 1000-V2-Session-Fail-closed statt Trunkierung/unbounded Payload | S2 Full Review; EV-ACT-R11-L01, EV-ACT-R11-L03 | fixed |
| F-ACT-R11-15 | EV-ACT-R11-B02, EV-ACT-R11-D02 | neuen Report-Activity-Untervertrag versionieren und Legacy-Snapshots unverändert lassen | S2 Full Review; EV-ACT-R11-L06 | fixed |
| F-ACT-R11-16 | EV-ACT-R11-D03 | PG17-Fixture auf leeren Minimalpreimage und pure nichtleere Fixtures umstellen; keine Activity-/Report-DML | S3 Red-Team; EV-ACT-R11-L01, EV-ACT-R11-L03, EV-ACT-R11-L04 | fixed |
| F-ACT-R11-17 | EV-ACT-R11-D03 | Product-Doctor-/Edge-Handler aus R11-Dateigrenze entfernen; nur unreferenzierte Module, R13-Wiring separat | S3 Red-Team; EV-ACT-R11-L09 | fixed |
| F-ACT-R11-18 | EV-ACT-R11-D03 | stabile lokale Adapterfehler vor bestehendem Logger erzwingen | S3 Red-Team; EV-ACT-R11-L05, EV-ACT-R11-L06, EV-ACT-R11-L07 | fixed |
| F-ACT-R11-19 | EV-ACT-R11-D03 | JS-/TS-Parserparität über gemeinsame Golden Fixtures und Reaggregation erzwingen | S3 Red-Team; EV-ACT-R11-L01, EV-ACT-R11-L06 | fixed |
| F-ACT-R11-20 | EV-ACT-R11-D04 | S4.1-S4.3-Großblock in sechs einzelne Blöcke zerlegen | S4R Full Review und Paketabhängigkeiten | fixed |
| F-ACT-R11-21 | EV-ACT-R11-D04 | SQL-16-Delta exklusiv S4.6 zuordnen | S4R File Ownership, Invalidation und Rollback | fixed |
| F-ACT-R11-22 | EV-ACT-R11-D04 | produktive Doctor-/Edge-Handler aus S4.4-Output entfernen | S4R Scope-/Productload-Review | fixed |
| F-ACT-R11-23 | EV-ACT-R11-L01 | internen Snapshotbuilder mit dem stabilen Fehlercode der aufrufenden API parametrisiert, damit auch ein Summenüberlauf keinen falschen Contractcode exponiert | neue Contracttests nach Korrektur 10/10; gemeinsam mit Isolation 14/14 | fixed |
| F-ACT-R11-24 | EV-ACT-R11-L01 | Dense-Array-Länge vor Indexlistenerzeugung descriptorbasiert auf Range plus 1000 V2 beziehungsweise maximal 400 Quality-Tage begrenzt | adversarial sparse Array fail-closed; neue Contracttests nach Korrektur 10/10, gemeinsam 14/14 | fixed |
| F-ACT-R11-25 | EV-ACT-R11-L03 | SQL-Empty von average_duration_min=0 auf den eingefrorenen null-Wert korrigiert | Functionhash neu aus PG17 abgeleitet; exaktes Empty-Postimage und Full Fixture PASS | fixed |
| F-ACT-R11-26 | EV-ACT-R11-L02 | Viewdef-Hash innerhalb des leeren SQL25-search_path auf den vollqualifizierten PG17-Postimage gebunden | Defaultpfad-Produktionshash und Empty-path-Fixturehash semantisch/bytegenau abgeglichen; Fresh/Rerun PASS | fixed |
| F-ACT-R11-27 | EV-ACT-R11-L02 | effektive EXECUTE-Prüfung für anon und service_role zusätzlich zur exakten ACL ergänzt | produktive Rollenvererbung read-only false; ACL-/Rerun-/Rollbackmatrix PASS | fixed |
| F-ACT-R11-28 | EV-ACT-R11-L03 | kanonische Sortierung auf den ausgegebenen RFC3339-Millisekundenwert vor source/id verschoben | finaler Functionhash und Full Fixture PASS; S4.1-Sortiervertrag 10/10 | fixed |
| F-ACT-R11-29 | EV-ACT-R11-L04 | Fixture setzt ON_ERROR_STOP selbst und beweist Dependency-/Overloaddrift über Funktions-Abwesenheits-Sentinels | 25 Assertions und vollständige Drift-/Rollbackmatrix PASS | fixed |
| F-ACT-R11-30 | EV-ACT-R11-L05 | maxAttempts des realen Auth-Helpers als zusätzliche Transportversuche erkannt und für S4.3 auf 0 begrenzt | Initialrequest plus genau ein simulierter Refresh beziehungsweise Zweitversuch-Exhaustion; T-ACT-R11-05 9/9 | fixed |
| F-ACT-R11-31 | EV-ACT-R11-L05 | Diagnoseaufruf fail-safe gekapselt, damit ein werfender Sink die stabile Fehlerklasse nicht ersetzt | adversarial Sink bleibt REQUEST_FAILED ohne Rohdetails; T-ACT-R11-05 9/9 | fixed |
| F-ACT-R11-32 | EV-ACT-R11-L06 | Edge-Loader-Top-Level-Envelope vor jeder Auth-/Clientaktion in stabile `INVALID_RANGE`-Fehlergrenze verschoben | Extra-/Accessor-Envelope erzeugt ActivityConsumerEdgeError und 0 Clientcalls; Deno 15/15, gemeinsam 37/37 | fixed |
| F-ACT-R11-33 | EV-ACT-R11-L07 | doppeltes synthetisches `change` nach Playwright-`fill()` entfernt | Stale-Smoke misst exakt zwei gestartete Reads und Browser 3/3 | fixed |
| F-ACT-R11-34 | EV-ACT-R11-L06 | explizite `any`-Records durch `unknown` plus validierte Typübergänge ersetzt | Deno Check/Lint/Format und 37/37 Tests PASS | fixed |
| F-ACT-R11-35 | EV-ACT-R11-L06, EV-ACT-R11-L07 | Edge- und Doctor-Fehlerfelder nur noch über fail-safe Own-Data-Descriptor-Leser auswerten | adversarial Getter/Proxy exponiert weder Rohmessage noch Rohstatus; Deno 37/37, Node 17/17, Browser 3/3 | fixed |
| F-ACT-R11-36 | EV-ACT-R11-L08 | Cross-Realm-Fixtures vor tiefen Testvergleichen auf JSON-Postimages normalisieren | T-ACT-R11-08 8/8 | fixed |
| F-ACT-R11-37 | EV-ACT-R11-L08 | exakte Kardinalität der fünf `loaded_domains` vor dem Positionsvergleich erzwingen | Empty-/Short-Domain-Negativtests; T-ACT-R11-08 8/8 | fixed |
| F-ACT-R11-38 | EV-ACT-R11-L08 | nicht normiertes 10.000-Zeilen-Limit entfernen und sparse Großlängen descriptorbasiert vor Allokation verwerfen | Contract-/Availability-Review und T-ACT-R11-08 8/8 | fixed |
| F-ACT-R11-39 | EV-ACT-R11-L08 | Notes-/Activity-Strings exakt gegen die Trim-Postimage-Semantik des realen V2-Builders validieren | Whitespace-Negativtests; T-ACT-R11-08 8/8 | fixed |
| F-ACT-R11-40 | EV-ACT-R11-L09 | alle konkreten R10-Coaching-Export-/SQL24-Artefakte statt nur der Umfeldpfade als Git-Negativorakel schützen | 20 R10-Pfade; Isolation/final 9/9 | fixed |
| F-ACT-R11-41 | EV-ACT-R11-L09 | R13-Scopeorakel whitespace-stabil über normative Markdown-Zeilenumbrüche parsen | R13-read-seam=1; Isolation/final 9/9 | fixed |
| F-ACT-R11-42 | EV-ACT-R11-L09 | Produktpostimages aus rohen Dateibytes statt aus CRLF-normalisiertem Text hashen | sechs bytegenaue Produkt-Hashes; finaler Contract 4/4 | fixed |
| F-ACT-R11-43 | EV-ACT-R11-L09, EV-ACT-R11-L10 | `activity-report.ts` in den R11-Productload-Guard aufnehmen | Regressionstest sowie Isolation/final PASS | fixed |
| F-ACT-R11-44 | EV-ACT-R11-L02, EV-ACT-R11-L09 | disposable Serverversion exakt als PostgreSQL 17.11 dokumentieren | PG17-Fixture und SQL16-Matrix auf demselben Server PASS | fixed |
| F-ACT-R11-45 | EV-ACT-R11-L06 | Reportcopy auf höchstens eine Dezimalstelle statt zwingender Nachkommastelle präzisieren | Deno beweist Ausgabe `2` und `0,5` | fixed |
| F-ACT-R11-46 | EV-ACT-R11-L02, EV-ACT-R11-L03, EV-ACT-R11-L05, EV-ACT-R11-L06 | historische ungültige V1-Quellen mit `SOURCE_INVALID` fail-closed behandeln und lokal sanitizen | PG17 ohne Activity-DML, Node 18/18 und Deno 15/15 PASS | fixed |
| F-ACT-R11-47 | EV-ACT-R11-L04, EV-ACT-R11-L09 | Test-DML-Orakel um exaktes `range_report`, `TRUNCATE` und ausführbare Selbstprobe ergänzen | Isolation/final und Full-Fixture PASS | fixed |
| F-ACT-R11-48 | EV-ACT-R11-PRE02, EV-ACT-R11-PRE03 | konzeptionelle Katalognamen im Preflight durch reales SQL20-Schema ersetzen | korrigierter produktiver Read-only-Preflight vollständig PASS | fixed |
| F-ACT-R11-49 | EV-ACT-R11-L09 | nach der DML-Selbstprobe veralteten Isolationstool-Hash neu messen | roher SHA256 B5EEF139...76A116; Guard 9/9 und direkter Lauf PASS | fixed |
| F-ACT-R11-50 | EV-ACT-R11-W01 | erwarteten Supabase-Migration-History-Eintrag der DDL-Aktion explizit dokumentieren | read-only `list_migrations` bestätigt Version 20260823083735 und exakten Namen; keine fachliche Activity-/Report-DML | fixed |

<!-- markdownlint-enable MD013 -->

## Finaler Evidence-Digest

- Gültige Nachweise:
  - `EV-ACT-R11-B01 bis -B05 sowie EV-ACT-R11-D01, EV-ACT-R11-D02,
    EV-ACT-R11-D03, EV-ACT-R11-D04, EV-ACT-R11-L01 bis -L10 und
    EV-ACT-R11-PRE01 bis -PRE05, EV-ACT-R11-W01 und EV-ACT-R11-R01 bis -R03;
    dauerhafter QA-Vertrag HCR-029.`
- Exakte produktive Wirkung:
  - `genau eine additive read-only SQL25-Function samt authenticated-only ACL
    plus operativer Supabase-Migration-History-Eintrag 20260823083735;
    21 neue lokale beziehungsweise disposable, unreferenzierte
    Implementierungsdateien plus drei gezielte S4.6-Dateideltas; keine
    Activity-/Report-DML und kein Deploy.`
- Nicht ausgeführte Nachweise:
  - `kein produktiver Browser-/Device-/APK-/Report-/Activity-Smoke gemäß
    Scope; kein SQL16, Fixture, Rollback, Retry oder Consumerdeploy.`
- Restrisiken:
  - `keine offenen In-Scope-Findings und keine offenen P0/P1-, Security-,
    Datenintegritäts- oder Scope-Blocker; die unveränderte Advisor-Watchlist
    blockiert SQL25 nicht.`
- Reviewhinweis:
  - `CodeRabbit CLI 0.7.5 lief in S5 genau einmal initial und einmal
    verifizierend. Initial 1 Major, Verifikation 2 Major und 2 Minor; alle fünf
    berechtigten Punkte F-ACT-R11-43 bis -47 sind korrigiert. Gemäß Vertrag
    erfolgte kein dritter Lauf; alle direkt invalidierten nativen Checks sind
    grün.`
- Roadmap-Verweise:
  - `S1-S6 PASS; archivierte R11-Roadmap ist die historische Source of Truth.`

Abschlussregeln:

- Evidence erst nach finalem S6-Abgleich auf `DONE` setzen.
- Bei realem Widerspruch gewinnt der geprüfte Iststand; Roadmap und Evidence
  werden gemeinsam korrigiert.
- Nach Archivierung bleibt keine aktive zweite Source of Truth zurück.

## Post-Close-Prozessnachtrag - 2026-08-23

Die fachliche Evidence, alle PASS-Nachweise und der Status `DONE` bleiben
unverändert. Korrigiert wird ausschließlich die vollständige Zählung der
externen Reviews:

- S4.2: drei erfolgreiche CodeRabbit-Reviews und ein weiterer, durch das
  externe Rate-Limit nicht abgeschlossener Bestätigungsversuch.
- S5: genau ein erfolgreicher Initial- und ein erfolgreicher
  Verifikationslauf.
- R11 gesamt: fünf erfolgreiche CodeRabbit-Läufe plus ein nicht
  abgeschlossener, rate-limitierter Versuch.

`EV-ACT-R11-L10` und der finale Evidence-Digest beschreiben den S5-Zyklus
korrekt, dürfen jedoch nicht als Gesamtzahl aller R11-Läufe gelesen werden.
Aus der korrigierten Historie entsteht kein neues Produkt-, Security- oder
Datenintegritätsfinding. Sie belegt eine Prozessabweichung, die in den
aktuellen MIDAS-Workflowregeln durch das S5-only-Reviewbudget verhindert wird.

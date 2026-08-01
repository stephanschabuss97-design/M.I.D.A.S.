# MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary - Execution Evidence

Diese schlanke Begleitdatei enthält ausschließlich die technischen Nachweise
für die additive Katalog-v2-Projektion. Fachliche Entscheidungen stehen in der
zugehörigen Roadmap und im späteren Katalog-v2-Vertrag.

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap(s) | `docs/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap.md` |
| Status | `ACTIVE` |
| Erstellt am | `2026-08-01` |
| Letzter Stand | `2026-08-01; leerer Nachweisrahmen vor S1` |
| Verantwortlicher Schritt | `S4.5, S5 und S6` |
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
  - `D-ACT-C2-01 bis -12 und Owner-Freeze der C2-Roadmap; später der separate
    Katalog-v2-Vertrag.`
- Verbotene Inhalte:
  - `Secrets, JWTs, personenbezogene Rohdaten, vollständige SQL-Dumps,
    Fotodateien oder unnötige Terminalausgaben.`

## Baseline

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-ACT-C2-B01 | lokal | R1/R2/R3-Dateien, Tests und Git-Grenze vor C2 | TODO |
| EV-ACT-C2-B02 | produktiv read-only | `health_activity_catalog_entries` v1/v2-Zähler vor SQL 21 | TODO |
| EV-ACT-C2-B03 | produktiv read-only | R2-Objekte, RLS, Policies, ACL und RPC-Signaturen vor SQL 21 | TODO |

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-C2-L01 | S4.5/S5 | frischer disposable Aufbau `20 -> 21 -> 16` | v1=78, v2=80; erwartete ACL/RLS/RPCs | TODO | TODO |
| EV-ACT-C2-L02 | S4.5/S5 | SQL 21 erneut ausführen | no-op; exakter Snapshot bleibt 80 | TODO | TODO |
| EV-ACT-C2-L03 | S4.5/S5 | kontrollierter v2-Teilbestand und Inhaltsdrift in wegwerfbarer DB | SQL 21 stoppt jeweils vor dem ersten Write; v1/v2 bleiben unverändert | TODO | TODO |
| EV-ACT-C2-L04 | S4.5/S5 | R2-Commit/Lookup mit v2 und versionsübergreifendem bestehenden Key | FK, Commit und Lookup korrekt; neuer Key ohne Alt-Historie | TODO | TODO |

<!-- markdownlint-enable MD013 -->

Disposable-Grenze:

- Alle Fixture-Writes erfolgen ausschließlich im lokalen Supabase-/Docker-
  Testsystem.
- Die Fixture darf Testdaten und ihren lokalen Scope zurücksetzen; sie darf
  keine produktive URL oder produktiven Secret-Wert verwenden.

## Produktiver Read-only Preflight

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-ACT-C2-PRE01 | v1 exakt 78 und bidirektional vertragsgleich | TODO | TODO |
| EV-ACT-C2-PRE02 | v2 entweder 0 oder bereits exakt 80; Teilbestand/Drift blockiert vor SQL 21 | TODO | TODO |
| EV-ACT-C2-PRE03 | keine v2-Sessionreferenzen vor Erstwrite; R2-Schema/RPCs erwartungsgemäß | TODO | TODO |
| EV-ACT-C2-PRE04 | RLS, Policies und ACL entsprechen R2-/Grant-Vertrag | TODO | TODO |

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
  - `offen`

## Produktive Aktionen

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-ACT-C2-W01 | `sql/21_Activity_V2_Catalog_V2.sql` einmal reviewt ausführen | offen | v2-Vollsnapshot anlegen oder validen Re-Run prüfen | TODO | USER-GATED |

<!-- markdownlint-enable MD013 -->

## Vorher-/Nachher-Nachweis

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| Katalog v1 | TODO | exakt 78, unverändert | TODO | TODO |
| Katalog v2 | TODO | exakt 80, vertragsgleich | TODO | TODO |
| R2-Tabellen/Constraints | TODO | unverändert | TODO | TODO |
| RLS/Policies/ACL | TODO | unverändert | TODO | TODO |
| R2-RPC-Signaturen | TODO | unverändert | TODO | TODO |
| v2-Sessionreferenzen | TODO | unverändert; C2 erzeugt keine Session | TODO | TODO |

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
| TODO | TODO | TODO | TODO | TODO |

<!-- markdownlint-enable MD013 -->

## Finaler Evidence-Digest

- Gültige Nachweise:
  - `TODO`
- Exakte produktive Wirkung:
  - `TODO`
- Nicht ausgeführte Nachweise:
  - `Browser-/Device-/Deploy-Smokes sind mangels Produktload nicht relevant.`
- Restrisiken:
  - `W-ACT-C2-01: kein hip_flexion-Key bis zu realem Bedarf.`
- Roadmap-Verweise:
  - `S4.5, S5 und S6.`

Abschlussregeln:

- Evidence wird erst nach finalem S6-Abgleich `DONE`.
- Bei Widerspruch gewinnt der erneut geprüfte reale Iststand.
- Nach Archivierung bleibt keine aktive zweite Evidence unter `docs/` zurück.

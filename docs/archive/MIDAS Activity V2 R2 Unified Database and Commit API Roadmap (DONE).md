# MIDAS Activity V2 R2 Unified Database and Commit API Roadmap

Kompakter projektspezifischer Arbeitsvertrag. Die allgemeine Arbeitsweise
steht in `docs/templates/MIDAS Roadmap Workflow Contract.md`.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Activity V2 - Datenbank, atomarer Commit und Historien-Lookup` |
| Owner / Kontext | `Stephan; persönliche MIDAS-Single-User-App` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-07-30` |
| Letzter Stand | `2026-07-31, S6 Source-of-Truth-Sync, finaler Contract Review und Archivierung PASS; R2 DONE` |
| Aktueller Schritt | `abgeschlossen; R3 ist der nächste Rolling-Wave-Schritt` |
| Risikoklasse | `R3` |
| Standard-Reviewtiefe | `Full` |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `S2: Extra High für finalen SQL-/API-Vertrag; S4R: Extra High für Cutover-Readiness; produktives S5-Gate: Extra High` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `sql/20_Activity_V2.sql`, `sql/16_Explicit_Grants.sql`, `sql/tests/20_Activity_V2_fixture.sql`, `app/modules/vitals-stack/activity/v2/data-access.js`, zugehörige Contract-Tests |
| Deploy relevant | `ja; produktiver SQL-Cutover, kein Edge-Function-Deploy` |
| Produktive Schreibwirkung | `ja; neue Schemaobjekte und 78 Katalog-Projektionszeilen, keine Activity-V1-Mutation` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Evidence (DONE).md` |
| Gekoppelte Roadmaps | `R1 ist abgeschlossen; R3 darf erst nach grünem R2 beginnen` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `Activity V2 R2 deterministisch von S1 bis zum jeweils freigegebenen Gate
    umsetzen. Kein sichtbares Gym-Feature und kein Activity-V1-Cutover.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High; nur die in den Metadaten genannten Knoten Extra High`
- Kontextübergabe aus dem Denkraum:
  - `PASS: R1 ist abgeschlossen; Katalogprojektion, retry-sicherer Commit,
    Vienna-Zeitvertrag und zunächst unveränderliche Sessions sind freigegeben.`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  5. `docs/Future trainingsmodule update thoughts.md`, Abschnitte 5-9, 13-18
  6. `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
  7. `docs/modules/Activity Module Overview.md`
  8. `sql/HOW_TO.md`, `sql/13_Activity_Event.sql`,
     `sql/16_Explicit_Grants.sql`
  9. `docs/qa/backend-supabase.md`,
     `docs/qa/health-capture-reports.md` und
     `docs/qa/runbooks/supabase-sql-cutover.md`
  10. `app/modules/vitals-stack/activity/v2/semantics.js`,
      `semantics.contract.test.js`, Activity-V1-Datenzugriff und
      `app/supabase/core/http.js`
  11. `git status --short und nur der relevante Diff`
- Startschritt:
  - `S1 - System- und Vertragsdetektivarbeit`
- Erlaubte Autonomie:
  - `lokale Reads, Roadmap-/Evidence-Pflege, Code- und SQL-Edits,
    Syntax-/Contract-Tests sowie disposable Docker-/Supabase-Tests`
- Owner-Gates:
  - `F-ACT-R2-08 wurde am 2026-07-31 als Option A freigegeben; produktiver SQL-
    Preflight und produktiver SQL-Cutover in S5 bleiben separat und übernehmen
    keine Freigabe aus früheren Roadmaps`
- Stop-Bedingungen:
  - `R1-Vertragswiderspruch, unbekannte produktive Activity-V2-Objekte,
    Katalogdrift, fehlende lokale Rollback-/Idempotenznachweise, unklare
    SQL-Wirkung oder Scope-Ausweitung auf R3-R12`
- Halluzinationsschutz:
  - `Keine Tabellen, Payloadfelder, Grenzwerte oder R1-Katalogwerte erfinden.
    Reale Implementierung und Sources of Truth prüfen; Widersprüche als
    Finding behandeln.`
- Startprompt:

```text
Arbeite die MIDAS Activity V2 R2 Unified Database and Commit API Roadmap
gemäß ihrer Ausführungs-Chat-Startkarte ab. Lies die festgelegten Quellen in
der angegebenen Reihenfolge, prüfe Git- und Systemstand und beginne mit S1.
Erfinde keine fehlenden Verträge. Activity V1 und die sichtbare Produktoberfläche
bleiben unverändert. Produktives SQL benötigt ein neues Owner-Briefing und eine
explizite Freigabe.
```

## Session Resume Card

- Ziel:
  - `Additive Activity-V2-Datenbasis mit atomarem retry-sicherem Commit und
    letztem vollständigem Übungsblock bereitstellen.`
- Unveränderliche Verträge:
  - `R1-Katalog v1 mit 78 aktiven Entries; keine Custom Keys; eine Übung
    höchstens einmal pro Session; mehrere Sessions pro Tag; Activity V1
    bleibt unverändert; keine sichtbare UI oder Retention.`
- Erledigter Stand:
  - `R1-Roadmap DONE und Baseline Contract aktiv`
  - `R1 Contract-Suite am 2026-07-31 erneut 10/10 PASS`
  - `S1 Repo-, Consumer-, SQL-, Retry- und Toolchain-Karte PASS`
  - `Initialer S1-Stand produktiv read-only: V1 vollständig vorhanden; 62
    V1-Activity-Zeilen; keine der vier R2-Relationen und keiner der zwei
    R2-RPCs vorhanden`
  - `Initialer R2 Contract Review PASS nach Findings-Korrektur`
  - `S3 Race-/Rollback-/Security-/Zeit-/Cutover-Review PASS; EV-B06`
  - `S4R Full Readiness Review PASS; sieben Präzisierungen geschlossen; EV-B07`
  - `S4.1-S4.3 implementiert: Datei 20 erster Lauf und kanonischer Rerun PASS,
    Datei-16-R2-ACL PASS, drei Tracking-Modi/Replay/RLS/Lookup lokal grün`
  - `S4.4 implementiert: isolierte Commit-/Lookup-Schicht, stabile Retry-ID,
    strikte Request-/Response-Schemas und sichere Domänenfehler; 10/10 PASS`
  - `S4.5 PASS: reproduzierbare PostgreSQL-17-Fixture inklusive vollständiger
    Datei 16, RLS/ACL/Zeit/Lookup und zwei echten dblink-Races; Cleanup PASS`
  - `S4.6 PASS: db lint und Security-/Performance-Advisor WARN+ sauber,
    R1/R2-JS 20/20, integrierter Code-/Contract-Review ohne offenes P0/P1`
  - `S5 lokal erneut PASS: R1/R2-JS 20/20, Fresh PostgreSQL-17-Fixture,
    Lint/Advisor WARN+, Races, Null-Cleanup und Katalog 78/78`
  - `S5 produktiv read-only PASS: Zielprojektbindung, PostgreSQL 17.6,
    postgres/BYPASSRLS, pgcrypto/digest und freie 0/4-R2-Relationen sowie
    0/2-R2-RPCs bestätigt; Activity V1 bleibt bei 62/283 Zeilen`
  - `S5 produktiver Cutover PASS: freigegebene Datei 20 und danach Datei 16
    jeweils exakt einmal committed; vier R2-Tabellen, zwei RPCs, vier Policies,
    fünf Indizes und 78 aktive Katalogzeilen; Sessions/Items/Sets bleiben 0`
  - `Produktive Postchecks PASS: ACL/RLS/Owner/Search Path, intentionaler
    Definer-Warnhinweis, Performance WARN+ und abschließend R1/R2-JS 20/20`
- Aktueller Schritt:
  - `R2 abgeschlossen und archiviert`
- Nächster erlaubter Schritt:
  - `R3 als eigene Rolling-Wave-Roadmap aus dem bewiesenen R2-Iststand ableiten`
- Offene Findings:
  - `keine In-Scope-Findings; F-ACT-R2-32 im S6-Doku-Sync geschlossen;
    projektweite, R2-fremde Watchlist: zwei
    Medication-Lintwarnungen und deaktivierter Leaked-Password-Schutz`
- Geänderte Dateien:
  - `Dirty Worktree aus R1-/Roadmap-Erstellung bleibt erhalten; R2 ergänzte
    sql/20_Activity_V2.sql und ausschließlich den R2-Block in
    sql/16_Explicit_Grants.sql, data-access.js samt Contract-Test sowie
    Roadmap/Evidence`
- Gültige Nachweise:
  - `T-ACT-R1-01 bis T-ACT-R1-05; EV-B01 bis EV-B07; EV-L01 bis EV-L04;
    EV-PRE01/-02; EV-W01/-02; EV-P01 PASS`
- Runtime-/Deploy-Stand:
  - `produktiv vier Activity-V2-Tabellen, zwei RPCs, vier Policies, fünf
    Indizes und 78 aktive Katalogzeilen; 0 Sessions/Items/Sets; Activity V1
    unverändert 62/283; keine sichtbare Produktintegration`
- Offene Owner-Freigaben:
  - `keine für R2; S5-Freigabe wurde exakt erteilt und verbraucht`
- Stop-Bedingungen:
  - `R2 ist DONE; spätere Änderungen am R2-Schema, an ACL/RLS oder der
    produktiven Script-Reihenfolge invalidieren die zugehörigen Nachweise`

## Zielvertrag

Prüfbares Endergebnis:

- Eine versionierte, nicht durch Browser-Clients veränderbare
  Datenbankprojektion des freigegebenen R1-Katalogs steht für serverseitige
  Validierung bereit.
- Abgeschlossene Activity-V2-Sessions werden in drei normalisierten,
  ownergebundenen Ebenen gespeichert: Session, Session-Item und Satz.
- Genau ein atomarer RPC validiert und speichert eine vollständige Session
  retry-sicher. Gleiche Request-ID plus gleicher Inhalt liefert dieselbe
  gespeicherte Session; gleicher Schlüssel plus anderer Inhalt scheitert.
- Ein begrenzter Read-RPC liefert für einen kanonischen `item_key` genau den
  letzten vollständigen Item-Block einschließlich aller Sätze oder neutral
  `null`.
- Eine isolierte JS-Datenzugriffsschicht bildet beide RPCs ab, ohne
  Activity V1, DOM, IndexedDB oder produktive Script-Reihenfolge zu verändern.
- SQL, RLS, ACLs, Relationen, atomarer Rollback, Idempotenz und Two-User-
  Isolation sind lokal/disposable bewiesen. Ein produktiver Cutover erfolgt
  nur nach separater Freigabe.

Bewusst unverändert:

- Activity V1 mit `health_events`, `activity_add/list/delete` und allen
  heutigen Consumern.
- Sichtbare Capture-, Gym-, Doctor-, Export-, Protein- und Trendpilot-Flows.
- IndexedDB-Draft, Satzabschluss, Timer/Pause, Intensität, Session-Korrektur,
  Export, Consumer-Cutover und Retention.
- Kein Dual Write und keine Migration oder Löschung alter Activity-V1-Daten.

## Problem und Ist-Zustand

- Beobachtung:
  - `R1 liefert stabile Semantik und lokale Suche, aber noch keine
    serverseitige Persistenz. Activity V1 kann nur einen flachen Eintrag pro
    Tag speichern.`
- Risiko oder Reibung:
  - `Ein unatomarer Mehrtabellen-Write könnte halbe Sessions erzeugen.
    fetchWithAuth wiederholt Netzwerk- und 5xx-Fehler; ohne Idempotenz kann
    ein bereits erfolgreicher Commit dupliziert werden. Rein generische
    SQL-Constraints kennen die exakte Feldpolicy eines R1-Katalogeintrags
    nicht.`
- Offene Hypothese:
  - `none; Option A schließt die Commit-Schreibgrenze ohne direkte Tabellen-
    DML-Rechte für Browserrollen.`

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R2-01 | 2026-07-30 | R2 ist vollständig additiv. Activity V1 wird weder migriert noch dual beschrieben oder gelöscht. | Legacy-Daten besitzen keine verlustfreie Satzsemantik; Consumer-Cutover folgt später. | gesamter Scope |
| D-ACT-R2-02 | 2026-07-30 | Historische Daten verwenden `health_activity_sessions`, `health_activity_session_items` und `health_activity_item_sets`. | Das fachliche Session-/Item-/Set-Modell bleibt relational prüfbar. | S2/S4 |
| D-ACT-R2-03 | 2026-07-30 | `health_activity_catalog_entries` ist eine immutable Runtime-Projektion des R1-Repo-Katalogs, keine zweite redaktionelle Source of Truth. | Der Server muss Key, Status, Tracking-Modus und Feldpolicy selbst prüfen können. | S2/S4.1 |
| D-ACT-R2-04 | 2026-07-30 | Katalogversionen werden append-only behandelt; referenzierte Versionszeilen werden nicht überschrieben oder gelöscht. | Historische Sessionbedeutung darf sich nach einem Katalogupdate nicht verändern. | Schema/Katalog |
| D-ACT-R2-05 | 2026-07-30 | Alle historischen Ebenen tragen `user_id`; zusammengesetzte Owner-FKs verhindern Cross-Owner-Verknüpfungen. | Single-user ist kein Verzicht auf Datenbankisolation. | Schema/RLS |
| D-ACT-R2-06 | 2026-07-30 | Der Commit verwendet eine clientstabile UUID `request_id` und einen serverseitigen Fingerprint des kanonisierten Payloads. | Automatische Retries dürfen keine zweite Session erzeugen. | Commit/RPC/JS |
| D-ACT-R2-07 | 2026-07-30 | Gleiche `request_id` plus gleicher Fingerprint ist ein erfolgreicher Replay; gleiche ID plus anderer Fingerprint ist ein sichtbarer Konflikt. | Netzwerkunsicherheit wird deterministisch von semantischem Konflikt getrennt. | Commit/RPC/Tests |
| D-ACT-R2-08 | 2026-07-30 | `day` ist der Kalendertag von `started_at` in `Europe/Vienna`; `duration_min` ist bestätigte aktive Dauer und nicht zwingend die Differenz aus Start und Ende. | Pausen und Mitternachtsüberschreitung bleiben eindeutig. | Zeitvertrag |
| D-ACT-R2-09 | 2026-07-30 | Session-Items speichern Katalogversion, Key sowie Label-, Tracking-, Equipment-, Load-Comparability- und Field-Policy-Snapshots. | Historie und spätere Exporte bleiben nach Katalogpflege interpretierbar. | Schema/Export-Handoff |
| D-ACT-R2-10 | 2026-07-30 | Ursprünglich war `security invoker` mit direkten `select`-/`insert`-Rechten für `authenticated` vorgesehen. **Am 2026-07-31 durch D-ACT-R2-16 abgelöst.** | Der S2-Review belegte den Widerspruch zu RPC-Atomarität und servergesetzten Snapshots. | RPC/RLS/ACL |
| D-ACT-R2-11 | 2026-07-30 | Der Last-Performance-RPC liest genau einen letzten vollständigen Item-Block und alle geordneten Sätze; keine Historie ist `null`, kein Fehler. | R4 benötigt genau einen Lookup nach expliziter lokaler Katalogauswahl. | History/R4-Handoff |
| D-ACT-R2-12 | 2026-07-30 | Commit und Lookup werden als isolierte `AppModules.activityV2.dataAccess`-API implementiert, aber nicht in `index.html` geladen. | R2 beweist die Datenzugriffsschicht ohne vorzeitige Produktwirkung. | JS/R3-Handoff |
| D-ACT-R2-13 | 2026-07-30 | Abgeschlossene R2-Sessions sind zunächst unveränderlich; Update-/Delete-Verträge folgen R8. | R2 soll keinen unreviewten Korrektur-Lifecycle vorwegnehmen. | Nicht-Scope |
| D-ACT-R2-14 | 2026-07-30 | R2 führt keine automatische Retention ein. | Reale Datenmenge und Langzeitnutzen werden erst in R12 bewertet. | Lifecycle |
| D-ACT-R2-15 | 2026-07-30 | Der Repo-SQL-/HOW-TO-Weg bleibt bestehen; R2 führt kein neues Migrations- oder Testframework ein. | Infrastrukturumbau ist nicht Ziel dieser Roadmap. | SQL/Cutover |
| D-ACT-R2-16 | 2026-07-31 | Owner-freigegebene Option A: `public.activity_v2_commit_session` ist ein bewusst exponierter, gehärteter `security definer`-RPC; Browserrollen erhalten keine Tabellen-DML-Rechte. Lookup bleibt `security invoker`. | Nur der atomare RPC darf vollständige Sessions mit servergesetztem Owner und Snapshots schreiben. Fester leerer Search Path, voll qualifizierte Namen, nicht-null `auth.uid()`, explizite Ownerfilter sowie Revoke von `public`/`anon` begrenzen die notwendige Privilegierung. | Commit/RLS/ACL/S4 |
| D-ACT-R2-17 | 2026-07-31 | Commit und historische Userpfade akzeptieren nur permanente authentifizierte User; der signierte JWT-Claim `is_anonymous` muss explizit `false` sein. `true`, fehlend oder `null` wird abgewiesen. | Supabase-Anonymous-User verwenden ebenfalls `authenticated`; nur fail-closed Claimprüfung beweist eine permanente Identität. | Auth/RLS/RPC |
| D-ACT-R2-18 | 2026-07-31 | Der Definer-Commit wird explizit `postgres` übereignet; Rerun und Fixture verlangen exakt diesen Owner, `prosecdef = true`, leeren Search Path und die kanonische ACL. | Der privilegierte Ausführungskontext darf nicht vom zufälligen Erzeuger des SQL-Laufs abhängen; `postgres` ist im Zielprojekt als `BYPASSRLS` bestätigt. | Commit/Security/S4.2 |
| D-ACT-R2-19 | 2026-07-31 | Datei 20 akzeptiert vor DDL nur den Zustand `0/6` Zielobjekte oder den exakten kanonischen `6/6`-Rerun; partielle Zustände, falsche Relationstypen und RPC-Overloads brechen die Transaktion ab. | Fremde oder halb angelegte Objekte dürfen nicht still adoptiert werden. | Rerun/Cutover/S4.1 |
| D-ACT-R2-20 | 2026-07-31 | Der Parallelitätsnachweis nutzt ausschließlich lokal/disposable zwei echte DB-Verbindungen über testlokales `dblink`; die Fixture lädt zuvor die kanonischen Voraussetzungen von Datei 16 und räumt ihre R2-Testwirkung auf. | Blockieren, Commit-Sichtbarkeit und Winner-Rollback müssen deterministisch statt timingzufällig beweisbar sein; produktiv wird `dblink` weder installiert noch genutzt. | Fixture/S4.5 |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`
- Neue oder entscheidungsrelevante Konzepte:
  - `Katalogprojektion, normalisierte Drei-Ebenen-Speicherung,
    Transaktionsatomarität, retry-sichere Idempotenz, RLS/ACL-Cutover`
- Geplante Briefing-Gates:
  - `S2/F-ACT-R2-08 und S4R am 2026-07-31 abgeschlossen; S5 vor produktivem
    SQL; S6 als verständlicher Recap`
- Nicht erneut zu erklären:
  - `normale JS-Syntax, Standard-Dateiänderungen und bereits bekannte
    Docker-Grundlagen, sofern kein neuer Fehlerpfad entsteht`

## Scope und Grenzen

In Scope:

- Neues kanonisches `sql/20_Activity_V2.sql`.
- Katalogprojektion aus exakt R1 `catalog_version: 1` und 78 aktiven Entries.
- Session-/Item-/Set-Tabellen, Constraints, Indizes und RLS.
- Atomarer idempotenter Commit-RPC und Last-Performance-RPC.
- Objektbezogene Grants in `sql/16_Explicit_Grants.sql`.
- Isolierte JS-Datenzugriffsschicht und lokale Contract-Tests.
- Disposable SQL-Fixture, lokaler Supabase-Nachweis und optional
  freigegebener produktiver SQL-Cutover.
- Activity-Overview, SQL-HOW-TO, QA und Changelog-Sync nach bewiesenem Stand.

Nicht in Scope:

- Sichtbare Activity-V2-Oberfläche oder Änderung der produktiven Scriptliste.
- Draft/IndexedDB, Autosave, Recovery, Timer, Pause oder Satzabschluss.
- Intensität, RPE, Session-Update/-Delete oder History-Liste.
- Activity-V1-Migration, Dual Write oder Consumer-Cutover.
- Doctor View, Arztbericht, Health Export, Protein Targets oder Trendpilot.
- Coaching-Export und Retention.

Roadmap-spezifische Guardrails:

- Der Server übernimmt `user_id` und Katalog-Snapshots selbst; kein
  Client-Payload darf Eigentum oder Snapshotwerte bestimmen.
- Neue Katalog-Keys oder geänderte R1-Policies blockieren R2 und öffnen
  kontrolliert den R1-Vertrag; sie werden nicht im SQL erfunden.
- Fehler dürfen keine halbe Session, verwaiste Items oder Sätze hinterlassen.
- Keine produktiven Test-Sessions als versteckter Smoke. Produktive Historie
  bleibt bis zum späteren sichtbaren Feature leer.

## Scope-Freeze vor S4

- Bestehende Features:
  - `Activity V1 und alle Consumer bleiben erhalten und funktional identisch.`
- Datenmodell, Lifecycle und Retention:
  - `vier neue Tabellen inklusive Katalogprojektion; abgeschlossene V2-
    Sessions append-only; keine Retention und keine Migration`
- Cleanup, Scheduler, Secrets und externe Automationen:
  - `nicht betroffen`
- Kompatible Producer und Consumer:
  - `R1 semantics ist Producer des Katalogvertrags; R2 schafft nur isolierte
    RPC-/JS-APIs für R3/R4/R8. Kein heutiger Consumer wird umgestellt.`
- Offene Grundsatzfragen:
  - `none`
- Umgang mit späterem Scope-Wechsel:
  - `kleine Vertragskorrektur öffnet gezielt S2/S3/S4R; UI-, Korrektur-,
    Export- oder Retention-Ausweitung erhält ihre geplante Folgeroadmap`

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/Future trainingsmodule update thoughts.md`
- `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
- `docs/modules/Activity Module Overview.md`
- `docs/qa/backend-supabase.md`
- `docs/qa/health-capture-reports.md`
- `docs/qa/runbooks/supabase-sql-cutover.md`
- `sql/HOW_TO.md`
- `sql/13_Activity_Event.sql`
- `sql/16_Explicit_Grants.sql`
- `app/modules/vitals-stack/activity/v2/semantics.js`
- `app/modules/vitals-stack/activity/v2/semantics.contract.test.js`
- `app/modules/vitals-stack/activity/index.js`
- `app/supabase/core/http.js`

Nur bei konkreter Vertragsfrage:

- `docs/archive/MIDAS Activity V2 R1 Semantics and Product Contract Roadmap (DONE).md`
- `sql/12_Medication.sql` als bestehendes Transaktions-/Owner-FK-Muster
- `backend/supabase/config.toml`
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Securing your API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Anonymous Sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [Supabase Local Testing](https://supabase.com/docs/guides/local-development/cli/testing-and-linting)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL INSERT / ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html)

## Tool Permissions und Gates

Allowed:

- Repo lesen und gezielt ändern.
- Node-/Browser-Syntax- und Contract-Tests.
- Docker Desktop, lokalen Supabase-Stack und `psql` für disposable Tests
  verwenden.
- Produktive Supabase-Metadaten read-only prüfen, wenn Zugang vorhanden ist.
- Evidence mit redigierten Zählern, Objektlisten und Postconditions pflegen.

User-gated:

- Produktives SQL oder andere produktive Writes.
- Änderung des R1-Katalogs.
- Laden der R2-JS-Datei in der produktiven `index.html`.

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- Scope, Datenwirkung oder Architektur still erweitern.
- Activity-V1-Daten verändern oder löschen.
- produktive Activity-V2-Testsession erzeugen.
- Katalogprojektion als redaktionelle Source of Truth behandeln.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `High` | PASS | R1 10/10; V1/Consumer/SQL/Retry kartiert; lokaler Core-Stack grün; produktiv keine R2-Namenskonflikte; EV-B01..B04 |
| S2 | Daten-, RPC-, Zeit- und Fehlervertrag | `Extra High` | PASS | Vier Tabellen, zwei öffentliche RPCs, Payload/Fingerprint/Race/Zeit/Fehler/Handoffs eingefroren; Option A owner-freigegeben; EV-B05 |
| S3 | Bruchrisiko-, Security- und Cutover-Review | `High` | PASS | Race/Rollback/ACL/DST/Katalog/Cutover geschlossen; permanente User und Creation-Revoke ergänzt; EV-B06 |
| S4R | S4 Readiness Review | `Extra High` | PASS | S4.1-S4.6 vollständig zugeordnet; Claim/Owner/Rerun/Index/Fixture/Token/Tie-break präzisiert; EV-B07 |
| S4 | Umsetzung | `High je Ausführungsblock` | PASS | S4.1-S4.6 vollständig; Fixture, dblink-Races, Lint, Advisor und integrierter Review PASS; EV-L01..L04 |
| S5 | Tests, produktive Gates und Abschlussreview | `Extra High` | PASS | Lokale Revalidierung, EV-PRE01/-02, freigegebene EV-W01/-02, produktive ACL/RLS/Katalog/V1-Postchecks und EV-P01 PASS |
| S6 | Doku-Sync, Recap und Archiv | `Medium` | PASS | Sources of Truth und Changelog synchronisiert; F-ACT-R2-32 geschlossen; finaler Contract-/Link-/Diff-Review grün; Roadmap/Evidence archiviert |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R2-01 | P1 | Retry/Idempotency | fixed | D-ACT-R2-06/-07 und S2.3 verlangen stabile Request-ID, Fingerprint, Replay und Konflikttest. |
| F-ACT-R2-02 | P1 | Catalog Integrity | fixed | D-ACT-R2-03/-04 und S2.1 machen den R1-Katalog serverseitig prüfbar und append-only. |
| F-ACT-R2-03 | P1 | Historical Semantics | fixed | D-ACT-R2-09 und S2.2 speichern die für spätere Interpretation nötigen Snapshots. |
| F-ACT-R2-04 | P1 | Time Contract | fixed | D-ACT-R2-08 und S2.3 frieren Vienna-Starttag und unabhängige aktive Dauer ein. |
| F-ACT-R2-05 | P1 | Cross-owner Relations | fixed | D-ACT-R2-05 und S2.2 fordern `user_id`, zusammengesetzte FKs und Two-User-Tests. |
| F-ACT-R2-06 | P1 | Scope Leakage | fixed | Zielvertrag und Guardrails verbieten V1-Cutover, Produkt-Scriptload, UI, Export und Retention. |
| F-ACT-R2-07 | P2 | Local Test Infrastructure | fixed | S4.5/S5 nutzen den bestehenden SQL-Fixture-/Docker-Weg und führen kein neues Framework ein. |
| F-ACT-R2-08 | P1 | Security Contract | fixed | D-ACT-R2-16: Owner hat Option A am 2026-07-31 freigegeben. Commit ist bewusst exponierter, gehärteter `security definer`; `authenticated`/`service_role` erhalten keine Tabellen-DML-Rechte. |
| F-ACT-R2-09 | P1 | API Contract | fixed | S2.3/S2.4 definieren Rückgabeschemas, Textgrenzen und die Zukunftstoleranz vollständig. |
| F-ACT-R2-10 | P2 | Client Validation | fixed | S2.6 nutzt den R1-Katalog als Policy-Quelle, behauptet aber keinen in R1 nicht vorhandenen Session-Payload-Validator. |
| F-ACT-R2-11 | P1 | Replay Stability | fixed | S2.1/S2.3 prüfen bestehende Request-ID und Fingerprint vor der Active-Catalog-Prüfung; nur neue Commits benötigen die aktuell höchste Katalogversion. |
| F-ACT-R2-12 | P1 | Anonymous Auth | fixed | D-ACT-R2-17: Commit, Lookup und historische Select-Policies weisen Supabase-Anonymous-User trotz Rolle `authenticated` ab; lokales Auth-Config bleibt zusätzlich deaktiviert. |
| F-ACT-R2-13 | P1 | Creation ACL Window | fixed | Datei 20 revokt Tabellen-DML und Function-Execute innerhalb derselben Erzeugungstransaktion; Datei 16 reassertiert danach nur die kanonischen Minimalrechte. |
| F-ACT-R2-14 | P1 | Missing Claim Fail-open | fixed | D-ACT-R2-17 verwendet `(((select auth.jwt())->>'is_anonymous')::boolean is false)` statt fehlende Claims als permanent zu behandeln. |
| F-ACT-R2-15 | P1 | Definer Owner Drift | fixed | D-ACT-R2-18 bindet und prüft den Commit-Owner exakt als `postgres`. |
| F-ACT-R2-16 | P1 | Partial Rerun State | fixed | D-ACT-R2-19 blockiert partielle, falsche oder überladene R2-Namenszustände vor DDL. |
| F-ACT-R2-17 | P2 | Unindexed Catalog FK | fixed | S2.2/S4.1 ergänzen den Index `(catalog_version, item_key, tracking_mode_snapshot)`. |
| F-ACT-R2-18 | P1 | Non-deterministic Race Fixture | fixed | D-ACT-R2-20 friert kanonischen Bootstrap und Zwei-Verbindungs-Fixture ein. |
| F-ACT-R2-19 | P2 | Error Token Ambiguity | fixed | S2.5 benennt die vier stabilen SQL-Tokens exakt. |
| F-ACT-R2-20 | P2 | Lookup Tie-break | fixed | S2.4 wählt bei gleicher Startzeit deterministisch `session.id desc`. |
| F-ACT-R2-21 | P1 | SQL Implementation Syntax | fixed | Der erste lokale Datei-20-Lauf fand zwei überzählige DDL-Klammern, der zweite einen `oid[]`/`regrole[]`-Vergleich. Beide Stellen wurden korrigiert; Erstlauf, Rerun und Driftproben sind danach PASS. |
| F-ACT-R2-22 | P1 | Snapshot Constraint Depth | fixed | Der erste Item-Check verlangte nur ein JSON-Objekt. Er spiegelt nun exakt alle acht Feldpolicy-Keys und drei erlaubten Policywerte; gültiger Commit und malformed Direct-Insert-Negativprobe sind PASS. |
| F-ACT-R2-23 | P1 | Environment-dependent Fingerprint | fixed | Policy-Rollen-OIDs wären zwischen lokalen und produktiven Clustern verschieden. Der Strukturhash normalisiert sie nun auf sortierte Rollennamen; der kanonische Rerun ist danach PASS. |
| F-ACT-R2-24 | P1 | Response Schema Projection | fixed | Die erste JS-Antwortprüfung leitete zusätzliche Response-Felder in den Request-Set-Validator weiter. Request- und Response-Projektionen sind nun getrennt; falsche Keys, Reihenfolge und Request-ID brechen deterministisch ab. |
| F-ACT-R2-25 | P1 | Client Error Boundary | fixed | Vorbereitungs- und Dependency-Fehler hätten teilweise als fachlich ungültige Eingabe erscheinen oder vor der sicheren Fehlergrenze entweichen können. Setup, URL und Serialisierung sind nun vollständig gekapselt; nur echte lokale Vertragsverletzungen werden als INVALID_SESSION/INVALID_ITEM_KEY gemappt. |
| F-ACT-R2-26 | P2 | PL/pgSQL Lint | fixed | Die deklarierte `v_index`-Variable wurde von den beiden Integer-FOR-Schleifen automatisch überschattet und blieb unbenutzt. Deklaration entfernt; `supabase db lint` ist danach ohne Befund. |
| F-ACT-R2-27 | P1 | RLS InitPlan | fixed | Der Advisor erkannte den alten `select (auth.jwt()->...)`-Ausdruck nicht als gecachten InitPlan. Drei Policies verwenden nun die dokumentierte Form `(select auth.jwt())`; fail-closed Claimtests bleiben grün und der Performance Advisor ist WARN+ sauber. |
| F-ACT-R2-28 | P1 | Fixture Security Coverage | fixed | Der erste Fixture-Stand prüfte Claim `missing/null` beim Commit, aber beim RLS-Read nur `true`, und direkte Writes nur als Privilegprädikat. Tatsächliche RLS-Negativreads, authenticated-/service_role-DML und anon-RPC-Verweigerung ergänzt. |
| F-ACT-R2-29 | P2 | Fixture Portability | fixed | Bring-up fand ausschließlich Harness-Probleme bei SQL-Sonderformen, Timestamp-Format, Exception-Diagnostik und Supabase-dblink unter dem nicht-superuser `postgres`. Helpers korrigiert und den dblink-Abschnitt guarded auf lokalen `supabase_admin` begrenzt; finaler Fresh Run PASS. |
| F-ACT-R2-30 | P2 | Fixture Owner Guard | fixed | S5 zeigte, dass ein falsch angelegter disposable DB-Owner erst am Schema-Drop scheiterte. Die Fixture prüft nun vor jeder Mutation explizit `session_user = postgres` und Datenbank-Owner `postgres`; beide Negativpfade sowie der anschließende Full Run sind PASS. |
| F-ACT-R2-31 | P2 | Productive CLI Harness | fixed | Der erste EV-W01-Aufruf löste `--file` relativ zu `--workdir backend` auf und brach lokal vor jeder DB-Anfrage mit `FileSystem.readFile NotFound` ab. Absolute, erneut gehashte Pfade wurden verwendet; lange read-only Windows-Argumente anschließend in kurze SELECTs geteilt. Beide produktiven Transaktionen und alle Postchecks PASS. |
| F-ACT-R2-32 | P1 | Documentation Contract | fixed | Modulübersicht bezeichnete V2 noch als vollständig unproduktiv; BS-007 setzte direkte authenticated-Tabellenwrites pauschal voraus. S6 trennt nun den produktiven, unsichtbaren R2-Speichervertrag vom weiterhin sichtbaren V1-Consumer und dokumentiert Activity V2 als RPC-only-Schreibdomäne. |
| F-ACT-R2-33 | P2 | Final Read-only Harness | fixed | S6-Abschlussqueries nahmen zunächst `is_active` statt `status = 'active'` und danach die falsche Textserialisierung `search_path=` statt `search_path=""` an. Beide Proben waren read-only. Gegen Datei 20 und direkte `pg_proc`-Attribute korrigiert; final 78/0/0/0, V1 62/283, 4 Tabellen/Policies, 2 RPCs, RLS sowie beide Hardening-Prädikate PASS. |

<!-- markdownlint-enable MD013 -->

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch abgeschlossen: R1/V1, Consumer, SQL/RLS/RPC, lokaler Stack,
`fetchWithAuth` und produktives Schema read-only; Details EV-B01 bis EV-B04.

Ergebnis:

- `R1: 78 aktive v1-Entries, 10/10; V1: 62 Rows/sieben Consumer unverändert.`
- `Lokal: Toolchain und Core-Stack/DB 17.6/UTC/digest/Loopback grün, gestoppt.`
- `SQL/HTTP: RLS-/Grant-Muster und Retry mit stabiler request_id bestätigt.`
- `Produktiv read-only: PG 17.6/digest; 0/4 R2-Relationen, 0/2 Funktionen.`
- `Full Contract Review PASS; Details EV-B01..EV-B04, Doku-Sync S6.`

Exit: R1-/V1-/SQL-/Retry-/Produktbaseline eindeutig; S2 war nicht blockiert.

## S2 - Daten-, RPC-, Zeit- und Fehlervertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch abgeschlossen: S2.1-S2.6 gegen R1/Repo geprüft, vollständigen
SQL-/API-Vertrag und Handoffs eingefroren, Findings zugeordnet, Full Review PASS.

### S2.1 - Katalogprojektion

- Relation: `public.health_activity_catalog_entries`.
- Primärschlüssel: `(catalog_version, item_key)`.
- Exakte Spalten; alle sind `not null`:
  - Identität: `catalog_version integer`, `item_key text`.
  - Anzeige: `label text`, `aliases text[]`.
  - Taxonomie: `status text`, `category text`, `equipment text`,
    `muscle_groups text[]`, `sport_tags text[]`.
  - Semantik: `tracking_mode text`, `load_comparability text`,
    `field_policy jsonb`.
- `item_key` erfüllt den R1-Keyvertrag, ist `1..64` Zeichen lang und wird nicht
  als Suchtext normalisiert. `label` und jeder Alias sind getrimmt und höchstens
  `80` Zeichen lang; eine Aliasliste besitzt höchstens `12` Einträge.
- Arrays enthalten keine `null`-Elemente, keine Duplikate und entsprechen der
  deterministischen R1-Reihenfolge. `field_policy` ist ein Objekt mit exakt den
  acht R1-Feldern und ausschließlich `forbidden | optional | required`.
- Status, Taxonomiewerte, `tracking_mode` und `load_comparability` werden aus
  dem validierten R1-Artefakt projiziert; es entsteht keine zweite
  redaktionelle Taxonomie.
- Der zusätzliche Unique-Constraint
  `(catalog_version, item_key, tracking_mode)` ist Parent-Key des Item-FK.
- `catalog_version = 1` enthält nach SQL-Lauf exakt die 78 freigegebenen
  aktiven R1-Entries und keine zusätzlichen Keys.
- Projektion und exakte Erwartungsmenge werden deterministisch aus dem
  Repo-Artefakt abgeleitet und im SQL-/Drifttest verglichen. Dashboardpflege
  und Browsermutation bleiben verboten.
- Vollständigkeit benötigt keine fünfte Metadatentabelle: Jede neue Version
  wird mitsamt exakter Mengen-/Drift-Postcondition in einer einzelnen SQL-
  Transaktion installiert. Andere Transaktionen sehen daher entweder keine
  oder die vollständige Version; `max(catalog_version)` ist die höchste
  atomar installierte Version.
- Neue Commits akzeptieren nur diese höchste Version und dort nur aktive Keys.
  Historische Zeilen und Replays behalten ihre ursprüngliche Version.
- Referenzierte Versionszeilen werden nicht in-place geändert oder gelöscht.
  Ein Rerun akzeptiert nur eine vollständig identische Erwartungsmenge;
  fehlende, zusätzliche oder abweichende Zeilen lösen vor `commit` einen Fehler
  und Rollback aus. `on conflict update` ist für Katalogsemantik verboten.

### S2.2 - Relationales Datenmodell

`health_activity_sessions`:

- Identität/Owner: `id uuid primary key default gen_random_uuid()`;
  `user_id uuid not null references auth.users(id) on delete cascade`.
- Idempotenz: `request_id uuid not null`, `request_fingerprint text not null`.
- Zeit: `started_at timestamptz not null`, `ended_at timestamptz not null`,
  `duration_min integer not null`.
- `day date` ist `generated always` aus
  `(started_at at time zone 'Europe/Vienna')::date` und `stored`.
- Inhalt/Audit: `title text null`, `note text null`,
  `created_at timestamptz not null default now()`,
  `updated_at timestamptz not null default now()`.
- Unique `(user_id, request_id)` und `(id, user_id)`.
- Fingerprint ist kleingeschriebenes SHA-256-Hex mit exakt `64` Zeichen.
- `ended_at >= started_at`; `duration_min` liegt in `1..1440`; Textwerte sind
  bereits getrimmt, `title` liegt bei `1..120`, `note` bei `1..500`.
- `day` wird ausschließlich aus `started_at at time zone 'Europe/Vienna'`
  gebildet. In R2 existiert kein öffentlicher Updatepfad; `updated_at` bleibt
  deshalb zunächst gleich seinem Insertwert und wird erst mit R8 neu geöffnet.

`health_activity_session_items`:

- Identität/Owner: `id uuid primary key default gen_random_uuid()`,
  `user_id uuid not null`, `session_id uuid not null`.
- Katalog/Order: `catalog_version integer not null`, `item_key text not null`,
  `item_order smallint not null`.
- Snapshots: `item_label_snapshot text`, `tracking_mode_snapshot text`,
  `equipment_snapshot text`, `load_comparability_snapshot text` und
  `field_policy_snapshot jsonb`; alle `not null`.
- Werte/Audit: `duration_min integer null`, `distance_km numeric(6,2) null`,
  `note text null`, `created_at timestamptz not null default now()`.
- Unique `(session_id, item_key)`, `(session_id, item_order)`, `(id, user_id)`
  und `(id, user_id, tracking_mode_snapshot)`.
- Owner-FK `(session_id, user_id)` verweist mit `on delete cascade` auf
  `health_activity_sessions(id, user_id)`.
- Katalog-FK `(catalog_version, item_key, tracking_mode_snapshot)` verweist auf
  dieselbe Version, denselben Key und Modus der Katalogprojektion.
- `item_order` liegt in `1..50`; Snapshotwerte erfüllen ihre Katalogformate.
  Itemnotiz und numerische Werte erfüllen die R1-Grenzen.
- `strength_sets` besitzt keine Item-Dauer/-Distanz; `duration` besitzt eine
  Dauer und keine Distanz; `duration_distance` besitzt eine Dauer und optional
  Distanz. Der Commit-RPC prüft zusätzlich die exakte entry-spezifische Policy.

`health_activity_item_sets`:

- Identität/Owner: `id uuid primary key default gen_random_uuid()`,
  `user_id uuid not null`, `session_item_id uuid not null`.
- Order/Modus: `set_order smallint not null`,
  `tracking_mode text not null default 'strength_sets'`.
- Primärwerte: `reps integer null`, `duration_sec integer null`,
  `distance_m numeric(7,2) null`.
- Last/Audit: `weight_kg numeric(6,2) null`, `assistance_kg numeric(6,2) null`,
  `created_at timestamptz not null default now()`.
- Unique `(session_item_id, set_order)`.
- Owner-/Mode-FK `(session_item_id, user_id, tracking_mode)` verweist mit
  `on delete cascade` auf
  `health_activity_session_items(id, user_id, tracking_mode_snapshot)`.
- `tracking_mode` ist exakt `strength_sets`; dadurch ist ein Satz unter einem
  Dauer-Item strukturell ausgeschlossen.
- `set_order` liegt in `1..50`. Exakt eines von `reps`, `duration_sec` und
  `distance_m` ist nicht `null`; höchstens eines von `weight_kg` und
  `assistance_kg` ist nicht `null`.
- R1-Grenzen gelten exakt: `reps 1..1000`, `duration_sec 1..3600`,
  `distance_m 0.10..10000.00`, `weight_kg` und `assistance_kg`
  jeweils `0.01..1000.00`, höchstens zwei Dezimalstellen.

Gemeinsame Regeln:

- Alle Identifier sind kleingeschriebenes `snake_case`; Zeitpunkte sind
  `timestamptz`, fachliche Dezimalwerte `numeric`, Zähler ganzzahlig.
- IDs werden serverseitig im bestehenden Repo-Muster mit `gen_random_uuid()`
  erzeugt; Clientpayloads enthalten keine Datenbank-ID.
- Ein Item-Key kommt höchstens einmal je Session vor. Reihenfolgen beginnen bei
  `1`, sind lückenlos und eindeutig. Eine Session besitzt `1..50` Items; ein
  Strength-Item besitzt `1..50` Sätze; Dauer-Items besitzen keine Sätze.
- Cross-row-Anzahl und Lückenlosigkeit werden im atomaren Commit geprüft; die
  Tabellenchecks sichern zusätzlich alle pro Zeile ausdrückbaren Invarianten.
- Es werden keine unbekannten oder verbotenen Messfelder als generisches
  Payload-JSON gespeichert. JSONB bleibt ausschließlich für den exakt
  validierten Feldpolicy-Snapshot reserviert.
- Indizes werden bewusst aus Query/FK-Vertrag abgeleitet:
  - Sessions: `(user_id, started_at desc, id desc)`; der Unique-Index auf
    `(user_id, request_id)` deckt Idempotenz ab.
  - Items: `(session_id, user_id)` für den Owner-FK und
    `(user_id, item_key, session_id)` für Last-Performance sowie
    `(catalog_version, item_key, tracking_mode_snapshot)` für den Katalog-FK.
  - Sets: `(session_item_id, user_id, tracking_mode)` für den Owner-/Mode-FK;
    der Unique-Index `(session_item_id, set_order)` deckt Sortierung ab.
- Öffentliche Update-/Delete-Rechte und -RPCs existieren in R2 nicht. Cascades
  wirken nur über Accountlöschung oder spätere explizit reviewte R8-Operationen.

### S2.3 - Atomarer und idempotenter Commit

RPC-Signatur:

```text
activity_v2_commit_session(p_request_id uuid, p_payload jsonb) -> jsonb
```

Request:

- `p_request_id` ist eine nicht-null, vom Client einmal erzeugte und über alle
  automatischen sowie manuellen Retries unveränderte UUID.
- `p_payload` ist ein JSON-Objekt mit exakt dem Schema
  `midas.activity-session.v1`.
- Erlaubte Top-Level-Keys: `schema_version`, `catalog_version`, `started_at`,
  `ended_at`, `duration_min`, `title`, `note`, `items`; nur `title` und `note`
  dürfen fehlen oder `null` sein.
- Erlaubte Item-Keys: `item_key`, `item_order`, `duration_min`, `distance_km`,
  `note`, `sets`. `item_key`, `item_order` und `sets` sind immer vorhanden;
  die übrigen Keys dürfen fehlen oder `null` sein und werden anschließend
  gegen die Katalogpolicy geprüft.
- Erlaubte Set-Keys: `set_order`, `reps`, `duration_sec`, `distance_m`,
  `weight_kg`, `assistance_kg`. `set_order` ist immer vorhanden; Messfelder
  dürfen vor Policyprüfung fehlen oder `null` sein.
- Unbekannte Keys auf jeder Ebene werden abgewiesen. `user_id`, Snapshots,
  Datenbank-IDs, Eltern-IDs, Zeitstempel und Fingerprint sind keine
  Clientfelder.
- `items` besitzt `1..50` eindeutige Keys und lückenlose Orders. `sets` besitzt
  bei Strength `1..50`, sonst exakt `0` Einträge. Arraypositionen werden anhand
  der expliziten Order kanonisch sortiert; doppelte oder lückenhafte Orders
  bleiben ungültig.
- Alle acht Messfelder werden mit den aktiven R1-Felddefinitionen validiert;
  entry-spezifisch muss jedes `required`-Feld gesetzt, jedes `optional`-Feld
  gültig oder `null` und jedes `forbidden`-Feld `null`/fehlend sein.

Zeit:

- `ended_at >= started_at`.
- `ended_at` repräsentiert eine abgeschlossene Session und darf nur eine
  Uhrtoleranz von höchstens fünf Minuten gegenüber dem DB-Zeitpunkt des neuen
  Commits besitzen.
- `duration_min` ist ganzzahlig `1..1440` und bleibt von der reinen
  Zeitstempeldifferenz unabhängig.
- `day` wird serverseitig aus `started_at` in `Europe/Vienna` abgeleitet.
- Optionaler `title` besitzt nach Trimmen `1..120` Zeichen. Session- und
  Itemnotizen besitzen nach Trimmen `1..500` Zeichen; leerer Text wird `null`.
- Zeitstrings müssen einen expliziten UTC-Offset oder `Z` tragen. Nach Parse als
  `timestamptz` werden sie für den Fingerprint als UTC mit sechs
  Nachkommastellen kanonisiert. Dadurch sind äquivalente Offsetdarstellungen
  identisch; der Vienna-Tag bleibt unabhängig davon eindeutig.

Fingerprint-Kanonisierung:

- Erst werden nur JSON-Typen, erlaubte Keys, allgemeine Grenzen und
  kanonisierbare Werte geprüft; die Active-Catalog-Prüfung folgt bei einem
  neuen Request erst nach dem Replay-Check.
- Fehlende, leere oder `null` optionale Texte werden `null`; andere Texte werden
  getrimmt. Optionale Zahlen werden `null`; Ganzzahlen und zweistellige
  `numeric`-Werte werden in ihre DB-Typen überführt.
- Items und Sätze werden nach ihren Orders sortiert. Der Server baut daraus ein
  neues JSONB-Objekt mit ausschließlich den freigegebenen Clientfeldern.
- SHA-256 wird als
  `encode(extensions.digest(convert_to(canonical_payload::text, 'UTF8'),
  'sha256'), 'hex')` gebildet. Serverfelder und Snapshots fließen nicht ein.
- JSON-Objekt-Keyreihenfolge, unwesentliche Zahlendarstellung, Zeitzonenoffset,
  optionale Leertexte und Eingabearrayreihenfolge ändern den Fingerprint nicht;
  jeder fachlich andere Clientwert ändert ihn.

Commit:

1. Authentifizierten User bestimmen.
2. Payloadstruktur, schemaunabhängige Grenzen und kanonisierbare Werte prüfen.
3. Kanonischen Payload und SHA-256-Fingerprint bilden.
4. Vorhandene `(user_id, request_id)` prüfen:
   - gleicher Fingerprint: gespeicherte kanonische Session als Replay liefern;
   - anderer Fingerprint: stabiler Idempotenzkonflikt.
5. Nur für einen neuen Request die aktuell höchste atomar installierte
   Katalogversion, aktive Keys und exakten Feldpolicies prüfen.
6. Gemäß der in S2.5 freizugebenden Schreibgrenze Session, Items und Sätze in
   derselben kurzen RPC-Transaktion speichern; User, IDs und Snapshots setzt
   ausschließlich die Datenbank.
7. Vollständig hydrierte, deterministisch sortierte Session zurückgeben.

Der Race-Vertrag verwendet den Unique-Constraint als Autorität und keinen
ungeschützten `select`-dann-`insert`-Ablauf. Nach der schnellen Vorprüfung
versucht der neue Pfad `insert ... on conflict (user_id, request_id) do
nothing returning ...`. Gewinnt dieser Versuch, schreibt dieselbe Transaktion
alle Kinder. Gewinnt ein paralleler Request, wartet der Konfliktpfad auf dessen
Commit, lädt danach die vollständig sichtbare Session und entscheidet anhand
des Fingerprints Replay oder Konflikt. Rollt der erste Versuch zurück, darf der
wartende Versuch selbst zum Writer werden.

Postconditions:

- Fehler rollen alles zurück.
- Parallel identische Requests erzeugen höchstens eine Session.
- Parallel unterschiedliche Payloads unter derselben Request-ID erzeugen
  höchstens eine Session; der Verlierer erhält den Idempotenzkonflikt.
- Ein Clientfehler nach möglichem Servercommit bleibt sicher erneut
  ausführbar, solange dieselbe Request-ID und derselbe Inhalt verwendet wird.

Kanonische Rückgabe:

```text
{
  schema_version: "midas.activity-session-result.v1",
  outcome: "created" | "replayed",
  session: {
    id, request_id, started_at, ended_at, day, duration_min,
    title, note, created_at, updated_at,
    items: [
      {
        id, catalog_version, item_key, item_order,
        item_label_snapshot, tracking_mode_snapshot,
        equipment_snapshot, load_comparability_snapshot,
        field_policy_snapshot, duration_min, distance_km, note, created_at,
        sets: [
          {
            id, set_order, tracking_mode, reps, duration_sec, distance_m,
            weight_kg, assistance_kg, created_at
          }
        ]
      }
    ]
  }
}
```

- Interne `user_id`-, Parent-ID- und Fingerprintfelder werden nicht exportiert.
- Optionale Werte erscheinen kanonisch als JSON `null`; leere Setlisten als
  `[]`. Datum und Zeit sind ISO-Strings, Dezimalwerte JSON-Zahlen.
- Items und Sätze sind immer aufsteigend nach ihrer jeweiligen Reihenfolge
  sortiert.

### S2.4 - Last-Performance-Lookup

RPC-Signatur:

```text
activity_v2_last_performance(p_item_key text) -> jsonb
```

- Nur authentifizierter Owner; die Ownerbindung gilt in jeder Join-Stufe.
- `p_item_key` wird mit `btrim` normalisiert, muss danach unverändert
  kleingeschrieben den R1-Keyregex und `1..64` Zeichen erfüllen und in
  mindestens einer Katalogversion bekannt sein. Es findet keine
  Suchtextnormalisierung und kein Aliaslookup statt.
- Historische/deprecated Keys bleiben für ihre vorhandene Historie lesbar;
  `active` ist nur für neue Commits erforderlich.
- Auswahl: neueste Session nach `started_at desc`, danach `session.id desc`.
- Rückgabe enthält Session-ID, Datum/Startzeit und genau den vollständigen
  Item-Block mit Snapshots, Itemwerten/Notiz und allen Sätzen in
  `set_order`.
- Keine Historie liefert SQL/JSON `null`.
- Ein syntaktisch ungültiger oder in keiner Katalogversion bekannter Key liefert
  `INVALID_ITEM_KEY`; ein gültiger bekannter Key ohne eigene Historie liefert
  `null`.
- Keine Suche während des Tippens; R4 ruft den Lookup erst nach expliziter
  Auswahl eines lokalen R1-Katalogeintrags auf.

Kanonische Nicht-null-Rückgabe:

```text
{
  schema_version: "midas.activity-last-performance.v1",
  session: { id, started_at, day },
  item: { ...derselbe kanonische Item-Block wie im Commit-Ergebnis... }
}
```

### S2.5 - Security-, Grants- und Fehlervertrag

- Alle vier Tabellen besitzen RLS.
- Historische Select-Policies verwenden explizit `to authenticated` und
  `(select auth.uid()) = user_id`; alle `user_id`-Prädikate sind indexgestützt.
- Katalog-Select verwendet `to authenticated using (true)`. Für `anon` und
  Browsermutation existiert keine Policy.
- Objektbezogene Grants werden in `16_Explicit_Grants.sql` nachgeführt;
  vor dem Grant werden `anon`, `public`, `authenticated` und `service_role`
  objektbezogen revoked. Es gibt kein pauschales Schema-Grant.
- Weil bestehende Projekte neue `public`-Objekte während der laufenden
  Supabase-Umstellung noch automatisch exponieren können, entzieht bereits
  `20_Activity_V2.sql` innerhalb seiner Erzeugungstransaktion fail-closed alle
  Tabellen-DML- und Funktions-Execute-Rechte dieser Rollen. Datei `16` bleibt
  die kanonische ACL-Quelle, wiederholt den Revoke und erteilt anschließend nur
  die unten eingefrorenen Rechte. Scheitert `16`, bleiben die neuen Objekte
  absichtlich unzugänglich statt zu weit geöffnet.
- Beide RPCs prüfen `auth.uid() is not null`, besitzen keine Overloads und
  verwenden einen festen leeren oder minimalen Search Path sowie vollständig
  qualifizierte Objekt- und `extensions.digest`-Namen.
- Commit, Lookup und historische Select-Policies verlangen zusätzlich
  `(((select auth.jwt()) ->> 'is_anonymous')::boolean is false)`; ein fehlender
  oder `null`-Claim scheitert damit ebenfalls fail-closed.
  Die Prüfung verwendet den signierten reservierten Claim und nicht
  manipulierbare `user_metadata`. Der Katalog darf als unpersönliche Referenz
  für `authenticated` lesbar bleiben; die lokale Auth-Konfiguration verbietet
  anonyme Sign-ins zusätzlich, ist aber nicht die Sicherheitsgrenze.
- Der Read-RPC bleibt `security invoker`; mit historischen Select-Rechten und
  RLS kann er keine fremden Zeilen sehen.

Owner-freigegebene Option A (`D-ACT-R2-16`):

- `public.activity_v2_commit_session` ist der einzige Write-Endpoint und ein
  bewusst exponierter `security definer`-RPC. Dieser Sonderfall ist fachlich
  notwendig, weil `authenticated` keine direkte Tabellen-DML erhalten darf.
- Der Commit setzt `search_path = ''`, qualifiziert jede Relation/Funktion,
  verwendet kein dynamisches SQL, prüft `auth.uid() is not null` und bindet
  den permanenten User-Claim. Jede Idempotenzabfrage, jeder Insert und jede
  Rückgabe ist an genau diese UID gebunden.
  `user_id`, IDs, Fingerprint und Snapshots können nicht als Parameter
  eingeschleust werden.
- Die Funktion wird explizit `postgres` übereignet. Datei 20 und die Fixture
  prüfen Owner, `security definer`, leeren Search Path, fehlende Overloads und
  exakte Execute-ACL; ein zufälliger Erzeuger-Owner ist unzulässig.
- `execute` wird nach Funktionserstellung explizit von PostgreSQL-`public`,
  `anon`, `authenticated` und `service_role` entzogen und anschließend nur
  `authenticated` neu erteilt. `service_role` besitzt keinen Commit-Execute-
  oder direkten Tabellen-Schreibvertrag.
- Exakte Tabellen-ACL: `anon`/`public` erhalten nichts; `authenticated` und
  `service_role` erhalten ausschließlich `select` auf allen vier Tabellen;
  `authenticated` erhält zusätzlich `execute` auf beide RPCs. Der Objektowner
  hält DDL/DML. Es gibt keine Insert-/Update-/Delete-Policy für Browserrollen.
- Der Last-Performance-RPC bleibt `security invoker` und liest ausschließlich
  durch Owner-RLS. Alle vier Tabellen behalten RLS als Defense in Depth.
- Supabase Database Advisor kann den absichtlich für `authenticated`
  ausführbaren Definer-RPC als Warnung melden. S4/S5 prüfen den realen Advisor-
  Befund; nur genau dieser nach ACL-, Body-, Direct-Insert- und Two-User-Test
  begründete Hinweis darf als intentional dokumentiert werden. Andere Security-
  Findings blockieren.
- Option B (`security invoker` plus direkte Inserts und duplizierende Trigger)
  ist verworfen. Es entsteht weder ein privater Helper noch ein zusätzliches
  Schemaobjekt; die Wirkung bleibt vier Tabellen und zwei öffentliche RPCs.

Stabiler Clientfehlervertrag:

- Clientfehler werden auf stabile Domänencodes abgebildet:
  `AUTH_REQUIRED`, `INVALID_SESSION`, `IDEMPOTENCY_CONFLICT`,
  `INVALID_ITEM_KEY`, `REQUEST_FAILED`.
- Bekannte RPC-Domänenfehler tragen stabile `MIDAS_ACTIVITY_*`-Tokens; die JS-
  Schicht mappt ausschließlich diese Tokens sowie Auth-/Transportstatus auf die
  Domänencodes. SQLSTATE, PostgREST-Text und interne Details sind kein
  Consumervertrag.
- Exakte Tokenabbildung: `MIDAS_ACTIVITY_AUTH_REQUIRED`,
  `MIDAS_ACTIVITY_INVALID_SESSION`, `MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT` und
  `MIDAS_ACTIVITY_INVALID_ITEM_KEY` auf die jeweils gleichnamigen Domänencodes
  ohne Präfix.
- Bei `AUTH_REQUIRED`, `INVALID_SESSION` und `IDEMPOTENCY_CONFLICT` ist der
  aktuelle Commit sicher nicht erfolgt; `INVALID_ITEM_KEY` gehört nur zum
  Read-Lookup. Nach erschöpftem Netzwerk-/Timeout-/5xx-Pfad oder unbekanntem
  Serverfehler ist der Commitstatus `unknown` und nur ein Replay mit derselben
  Request-ID sicher.
- Unbekannte DB-/PostgREST-Details werden diagnostisch geloggt, aber nicht als
  ungefilterte UI-Meldung verwendet.

### S2.6 - Isolierte JS-Datenzugriffsschicht

- Datei: `app/modules/vitals-stack/activity/v2/data-access.js`.
- Namespace: nicht überschreibbares
  `AppModules.activityV2.dataAccess`; Elternnamespace bleibt erweiterbar.
- Öffentliche API:
  - `commitSession({ requestId, payload })`
  - `loadLastPerformance(itemKey)`
- Beide Methoden sind asynchron. `requestId` ist Pflicht und wird niemals in
  `commitSession` erzeugt oder ersetzt; `payload` und Serverantwort werden
  schemaexplizit geprüft.
- Die Datenzugriffsschicht validiert das Session-Requestschema mit reinen
  lokalen Funktionen. `AppModules.activityV2.semantics` liefert dafür
  Katalogeintrag und Feldpolicy; R1 selbst besitzt bewusst nur Katalog-,
  Lookup-, Normalisierungs- und Suchfunktionen.
- Commit verwendet den vorhandenen Auth-/Fetch-Weg, behält `requestId` über
  alle automatischen oder manuellen Retries unverändert und gibt das
  kanonische Serverergebnis zurück.
- Domänenfehler besitzen mindestens `name = ActivityV2DataAccessError`, `code`,
  `operation`, `retryable` und bei `commitSession`
  `commitState = not_committed | unknown`. Rohantwort, JWT oder ungefilterter
  DB-Text werden nicht Teil der UI-Schnittstelle.
- `fetchWithAuth` darf seine vorhandenen Retries und genau einen Auth-Refresh
  ausführen. Die Request-Callback-Wiederholung erhält dieselbe UUID und
  denselben kanonisch äquivalenten Payload.
- Ungewisser Netzwerkstatus löscht keinen späteren Draft, erzeugt keine neue
  Request-ID und wird nicht als sicher fehlgeschlagener Servercommit ausgegeben.
- Datei bleibt aus der produktiven `index.html` entfernt; Tests laden sie
  isoliert mit gemocktem Supabase-Transport.

Ergebnis:

- `S2.1-S2.6 vollständig eingefroren: vier Tabellen, zwei öffentliche RPCs,
  isolierte JS-API und Option A/D-ACT-R2-16; keine zusätzliche Metarelation.`
- `Keine sichtbare Integration, kein V1-Cutover und kein Produktcode vor S4R.`
- `R3 hält eine Request-ID; R4 nutzt lokalen Katalog plus einen History-RPC;
  R5 integriert später; R8 öffnet Mutation; R9 nutzt eingefrorene Snapshots.`
- `F-ACT-R2-08 geschlossen; S3 ergänzte D-ACT-R2-17/Creation-Revoke.`
- `Full Contract Review PASS; S4.1-S4.6 Pflicht, Produkt-/QA-Doku in S6.`

Exit: `PASS`. Keine Tabellen-, Payload-, Idempotenz-, Zeit-, Security-, Lookup-,
Fehler- oder Handofffrage bleibt offen. Option A ist owner-freigegeben,
F-ACT-R2-08 geschlossen; S3 schloss anschließend F-ACT-R2-12/-13.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview
Reasoning: `GPT-5.6 Sol / High`.
Deterministisch geprüft; technische Details und Read-only-Proben: `EV-B06`.

- `ON CONFLICT DO NOTHING` plus neues `READ COMMITTED`-Statement schließt
  identischen/abweichenden Parallel-Replay und Winner-Rollback; gleiche
  Request-ID bleibt nach Responseverlust sicher.
- Der vollständige Payload wird vor Writes geprüft; ungefangene Fehler rollen
  Session, Items und Sets atomar zurück. Alte identische Replays bleiben trotz
  späterer Katalogdeprecation gültig.
- ACL/RLS trennt `public`/`anon`, permanente User, anonyme Auth-User,
  `service_role` und Owner; direkte Browserwrites bleiben verboten.
- UTC/Vienna, DST, Mitternacht und Fünf-Minuten-Toleranz sind deterministisch;
  `timezone(text,timestamptz)` ist auf PG 17.6 immutable bestätigt.
- Katalog v1 bleibt exakt 78 Rows, append-only und driftblockierend;
  `extensions.digest` ist vorhanden, aber R2 installiert/pinnt keine Extension.
- Cutover wirkt nur auf vier Tabellen, zwei RPCs und 78 Katalogrows. Datei 20
  rollt atomar zurück; scheitert danach Datei 16, bleiben Objekte fail-closed.
  Unbekannter SQL-Ausgang erzwingt read-only Reconciliation, niemals Blindrerun.

Ergebnis: `PASS`; F-ACT-R2-12/-13 geschlossen, S4.1-S4.6 und
T-ACT-R2-01..-12 vollständig zugeordnet. S4R wurde anschließend durchgeführt.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks / Evidence | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | Katalogprojektion und relationales Schema | F-ACT-R2-02/-03/-05/-16/-17 | `20_Activity_V2.sql` | Full | T-ACT-R2-01/-02, EV-L01 | none |
| S4.2 | RLS, ACL-Quelle und atomarer Commit | F-ACT-R2-01/-05/-08/-12..-16/-19 | `20_Activity_V2.sql`, `16_Explicit_Grants.sql` | Full | T-ACT-R2-03..-07, EV-L02 | none |
| S4.3 | Last-Performance-RPC | F-ACT-R2-20 | `20_Activity_V2.sql` | Consumer | T-ACT-R2-08, EV-L03 | none |
| S4.4 | isolierte JS-Datenzugriffsschicht | F-ACT-R2-01/-06/-10/-19 | `data-access.js`, Tests | Consumer | T-ACT-R2-09/-10 | none |
| S4.5 | disposable SQL-Fixture und Rerun-Nachweis | F-ACT-R2-07/-18 | `sql/tests/20_Activity_V2_fixture.sql` | Full | T-ACT-R2-01..-08, EV-L01..-L04 | none |
| S4.6 | integrierter Code-/Contract-Review | alle | betroffener R2-Diff | Full | T-ACT-R2-01..-10 | none |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - `S4.1 -> S4.2 -> S4.3 -> S4.4 -> S4.5 -> S4.6`
- Fehlende Zuordnung:
  - `none`
- Evidence:
  - `EV-B07 aktualisiert; EV-L01..-L04 werden in S4 erzeugt`
- Scope-Freeze:
  - `PASS; additiver R2-Scope, Datenwirkung und Nicht-Scope unverändert`
- Gültig übernommene Nachweise:
  - `unveränderte T-ACT-R1-01 bis -05`
- Invalidation Map:
  - `R1-Semantik/Katalog -> R1-Suite plus alle Katalog-/Commit-Fixtures`
  - `Schema/RPC/RLS/Grants -> alle SQL-Fixtures und ACL-Checks`
  - `Funktionsowner, Definer-Body, ACL oder Anonymous-Claim -> EV-L02,
    T-ACT-R2-06 und Advisor-Bewertung`
  - `UTC-/Vienna-Ausdruck oder Zukunftstoleranz -> T-ACT-R2-07`
  - `data-access.js oder http.js -> JS-Transport-/Retry-Tests`
- Owner-Gates:
  - `keines innerhalb lokaler S4-Umsetzung; produktiver Cutover liegt in S5`
- Empfohlene S4-Ausführungsblöcke:
  - `S4.1-S4.3 gemeinsam`
  - `S4.4 separat`
  - `S4.5-S4.6 gemeinsam`
- Begründung:
  - `S4.1-S4.3 teilen SQL-Vertrag und lokale Transaktionswirkung;
    S4.4 besitzt eigenen JS-/Retry-Consumervertrag; Fixture und Full Review
    schließen denselben lokalen Stand ab.`
- Readiness-Findings/Korrekturen:
  - `F-ACT-R2-14..-20 geschlossen: Claim fail-closed, Owner postgres,
    0/6-Rerun-Guard, Katalog-FK-Index, Zwei-Verbindungs-Fixture, exakte
    Fehlertokens und id-desc-Tie-break.`
- Read-only-/Toolstand:
  - `PG 17.6; postgres BYPASSRLS; pgcrypto installiert; dblink verfügbar aber
    produktiv nicht installiert. Docker 29.6.2/CLI 2.109.1 bereit; lokaler
    Supabase-Stack ist gestoppt und wird erst im S4.5-Testblock gestartet.`
- Full Review:
  - `PASS; keine offene Grundsatzfrage, kein P0/P1 und kein lokales Owner-Gate.`

Exit: `PASS`. S4 beginnt mit S4.1-S4.3; alle produktiven Gates bleiben in S5.

## S4 - Umsetzung

### S4.1 - Katalogprojektion und relationales Schema

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R2-02 bis -05, -08, -09 und D-ACT-R2-19`
- Dateien:
  - `sql/20_Activity_V2.sql`
- Umsetzung:
  - `transaktionales, wiederholbar kontrolliertes Schema mit Katalogseed,
    0/6-Objektguard, Tabellen, Checks, Unique-/Owner-FKs und vollständigen
    FK-/Query-Indizes; numerische Skalen werden ohne stilles Runden validiert`
- Review:
  - `Full`
- Invalidation:
  - `T-ACT-R2-01/-02`
- Gate:
  - `none; nur lokal/disposable`

Implementation-Ergebnis 2026-07-31: `PASS`. Datei 20 lief auf PostgreSQL 17.6
frisch und unmittelbar erneut; der Rerun schrieb `0` zusätzliche Katalogzeilen.
Die 78 R1-Entries stimmen bytewertneutral exakt mit dem Runtime-Katalog
überein. Partial-, falscher Constraint- und Overload-Zustand brachen jeweils
erwartet atomar ab. Der damals noch ausstehende Fixture-Nachweis wurde in S4.5
nachgezogen; EV-L01 und T-ACT-R2-01/-02 sind final `PASS`.

Exit: Schema und exakt 78 Katalogzeilen bestehen lokal ohne V1-Wirkung.

### S4.2 - RLS, Grants und atomarer Commit

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R2-05 bis -09, D-ACT-R2-16 bis -19; D-ACT-R2-10 ist abgelöst`
- Dateien:
  - `sql/20_Activity_V2.sql`, `sql/16_Explicit_Grants.sql`
- Umsetzung:
  - `RLS/Policies, objektbezogene ACLs, gehärteter bewusst exponierter Definer-
    Commit, fail-closed Creation-Revoke plus kanonische Grants in Datei 16,
    postgres-Owner, fail-closed Permanent-User-Prüfung, Validierung,
    Fingerprinting, exakte Fehlertokens und Replay-/Conflict-Vertrag`
- Review:
  - `Full`
- Invalidation:
  - `T-ACT-R2-03 bis -07`
- Gate:
  - `none; nur lokal/disposable`

Implementation-Ergebnis 2026-07-31: `PASS`. Creation-Revoke und der isoliert
aus Datei 16 ausgeführte R2-Grantblock ergaben die exakte ACL. Duration-,
Duration-Distance- und Strength-Commits, kanonische Sortierung, atomarer
Invalid-Request-Abbruch, Created/Replay/Conflict, User-A/B-RLS sowie
Anonymous-Claim `true`/fehlend/`null` sind lokal grün. Der reproduzierbare
Gesamtlauf von Datei 16, Zwei-Verbindungs-Races, Zeitkanten, Lint und Advisor
waren diesem Schritt nachgelagert und wurden in S4.5/S4.6 vollständig
nachgewiesen; EV-L02 ist final `PASS`.

Exit: Commit ist ownergebunden, atomar und retry-idempotent implementiert; der
S4.5 zugeordnete Zwei-Verbindungs-Parallelitätsbeweis ist final `PASS`.

### S4.3 - Last-Performance-RPC

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R2-11`
- Dateien:
  - `sql/20_Activity_V2.sql`
- Umsetzung:
  - `begrenzter, deterministischer Lookup des letzten vollständigen
    Item-Blocks mit started_at desc/id desc-Tie-break`
- Review:
  - `Consumer`
- Invalidation:
  - `T-ACT-R2-08`
- Gate:
  - `none`

Implementation-Ergebnis 2026-07-31: `PASS`. Bekannter Key, getrimmter Key,
ungültiger Key, fremder Owner/No-History, vollständiger Strength-Block,
Satzsortierung sowie `started_at desc, id desc` bei gleicher Startzeit sind
lokal grün. Die wiederverwendbare S4.5-Fixture bestätigt EV-L03 final als
`PASS`.

Exit: Historie und neutraler No-History-Fall sind lokal bewiesen.

### S4.4 - Isolierte JS-Datenzugriffsschicht

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R2-06/-07/-11/-12`
- Dateien:
  - `app/modules/vitals-stack/activity/v2/data-access.js`
  - `app/modules/vitals-stack/activity/v2/data-access.contract.test.js`
- Umsetzung:
  - `stabile Commit-/Lookup-API, R1-policygestützte Vorvalidierung,
    Retry-ID-Erhalt, Domänenfehler und produktive Isolation`
- Review:
  - `Consumer`
- Invalidation:
  - `T-ACT-R2-09/-10 und R1-Namespace-Test`
- Gate:
  - `none`

Exit: JS-Vertrag ist testbar, ohne produktiv geladen zu werden oder V1 zu
verändern.

Implementation-Ergebnis 2026-07-31: `PASS`. `data-access.js` registriert
ausschließlich die eingefrorenen async APIs `commitSession` und
`loadLastPerformance` unter einem nicht überschreibbaren
`AppModules.activityV2.dataAccess`-Slot. Lokale R1-Policyvalidierung,
kanonischer RPC-Body, unveränderte Request-ID über Transport-Retries, alle vier
exakten `MIDAS_ACTIVITY_*`-Token, konservativer Commit-Zustand sowie strikte
Antwortschemas sind belegt. Kein Produkt-Scriptload, DOM-/IndexedDB-Zugriff
oder Activity-V1-Effekt. Isolierte Suite 10/10 PASS; gemeinsam mit der
unveränderten R1-Suite 20/20 PASS. F-ACT-R2-24/-25 wurden im Review geschlossen;
EV-L04 und T-ACT-R2-09/-10 PASS.

### S4.5 - Disposable SQL-Fixture

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `S2/S3 vollständig und D-ACT-R2-20`
- Dateien:
  - `sql/tests/20_Activity_V2_fixture.sql`
- Umsetzung:
  - `PSQL-only gegen lokalen Disposable-Stack: kanonische Voraussetzungen für
    Datei 16, Schema/Katalog/RLS/ACL/Definer, Rollback und Lookup; testlokales
    dblink steuert zwei Verbindungen für Winner-Commit und Winner-Rollback.
    Keine produktive Extension-/Datenwirkung; R2-Testobjekte werden bereinigt.`
- Review:
  - `Full`
- Invalidation:
  - `T-ACT-R2-01 bis -08`
- Gate:
  - `none; disposable Umgebung`

Exit: Fixture beweist alle SQL-Postconditions und hinterlässt keine
produktive Wirkung.

Implementation-Ergebnis 2026-07-31: `PASS`. Die guarded Wegwerf-Datenbank
`midas_activity_v2_s45` bootstrapt alle Voraussetzungen der vollständigen
Datei 16 und beweist 0/6-/Relationstyp-/Constraint-/Overload-Abbruch,
kanonischen Rerun, 78/78-R1-Parität, drei Tracking-Modi, invalid-last-item ohne
Teilwrite, Replay/Conflict, User-/Claim-/ACL-/RLS-Matrix, Vienna/DST/
Zukunftstoleranz, Lookup-Tie-break und vollständige Satzreihenfolge. Zwei echte
asynchrone `dblink`-Verbindungen beweisen Winner-Commit und Winner-Rollback.
Finaler Fresh Run sowie Cleanup auf 0 Sessions/Items/Sets und 78 Katalogzeilen
PASS; F-ACT-R2-28/-29 geschlossen; EV-L01..-L03 PASS.

### S4.6 - Integrierter Full Review

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `gesamter R2-Zielvertrag`
- Dateien:
  - `vollständiger R2-Diff`
- Umsetzung:
  - `Code-/Contract-Review, supabase db lint sowie Security-/Performance-
    Advisor, begründete Bewertung nur des erwartbaren Definer-Warnhinweises,
    Findings-Korrektur, invalidierte Checks und Cutover-Kandidatenfreeze`
- Review:
  - `Full`
- Invalidation:
  - `alle durch Findings berührten T-/EV-IDs`
- Gate:
  - `S5 bleibt bis Review und optionalem externen Review gesperrt`

Exit: Kein offenes In-Scope-P0/P1; SQL und JS sind bereit für S5.

Implementation-Ergebnis 2026-07-31: `PASS`. `supabase db lint` sowie
Security-/Performance-Advisor sind auf `WARN+` ohne Befund. Zwei
`unused_index`-INFOs in der frisch geleerten Testdatenbank sind für den
Katalog-FK- und Session-/Owner-Pfad erwartbar; elf weitere INFOs gehören nur
zu minimalen Datei-16-Fixture-Stubs. Commit-Owner `postgres`, Definer-Modus,
leerer Search Path, exakte ACL und vier Policies wurden zusätzlich direkt
geprüft. F-ACT-R2-26/-27 korrigiert; neuer PG17-Strukturfingerprint
`657f31c14b1a17e17241b1cd9aaa4c69a0622321c1f5e6e13927df4ebb23ee14`.
R1/SQL-Katalog 78/78 und R1/R2-JS 20/20 PASS; kein Produkt-Scriptload, keine
produktive Aktion und kein offenes In-Scope-P0/P1.

## S5 - Tests, Runtime-Gates und Abschlussreview

Reasoning: `GPT-5.6 Sol / High`; produktive Gates `Extra High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R2-01 | local/disposable | Schema, Constraints, FKs und Indizes entstehen vollständig; exakter Rerun gelingt, partielle/falsche/überladene Namenszustände brechen atomar ab | PASS | EV-L01 | `20_Activity_V2.sql` |
| T-ACT-R2-02 | local/disposable | Katalogprojektion entspricht R1 v1 exakt: 78 aktive Keys und vollständige Policies | PASS | EV-L01 | R1-Katalog oder SQL-Seed |
| T-ACT-R2-03 | local/disposable | gültige Strength-, Duration- und Duration-Distance-Sessions committen vollständig | PASS | EV-L02 | Commit/Schema |
| T-ACT-R2-04 | local/disposable | ungültiger letzter Datensatz rollt Session, Items und Sets vollständig zurück | PASS | EV-L02 | Commit/Constraints |
| T-ACT-R2-05 | local/disposable | gleicher Request + Payload replayt; geänderter Payload konfligiert; zwei DB-Verbindungen beweisen Winner-Commit und Winner-Rollback ohne Duplikat | PASS | EV-L02 | Idempotenz/Index |
| T-ACT-R2-06 | local/disposable | User A/B, PostgreSQL-`anon`, Anonymous-JWT true/fehlend/null, direkte Tabellenwrites, postgres-Definer-Owner und ACL/RLS-Matrix verhindern fremde, öffentliche oder RPC-umgehende Zugriffe; Advisor vollständig bewertet | PASS | EV-L02 | RLS/Grants/RPC/Advisor |
| T-ACT-R2-07 | local/disposable | Vienna-Tageswechsel, DST, Mitternacht und Zukunftstoleranz verhalten sich deterministisch | PASS | EV-L02 | Zeitvertrag |
| T-ACT-R2-08 | local/disposable | Lookup liefert letzten vollständigen Block, stabile Satzreihenfolge und `null` ohne Historie | PASS | EV-L03 | Lookup/Indizes |
| T-ACT-R2-09 | local JS | data-access Request-/Response-/Fehlermapping und unveränderte Request-ID über Retries | PASS | EV-L04: isoliert 10/10 | JS/http |
| T-ACT-R2-10 | local JS | R1 10/10, Namespace-Isolation und kein produktiver Script-/DOM-/V1-Effekt | PASS | EV-L04: kombiniert 20/20 | R1/R2 JS |
| T-ACT-R2-11 | produktiv read-only | Vorher: keine kollidierenden V2-Objekte; nachher: erwartete Objekte/ACL/RLS/Katalogzähler, null Sessions | PASS | EV-PRE01/EV-P01 | Produktivschema |
| T-ACT-R2-12 | produktiv write | reviewtes `20_Activity_V2.sql`, danach `16_Explicit_Grants.sql`, jeweils exakt einmal gemäß Gate | PASS | EV-W01/EV-W02 | SQL-Diff/Freigabe |

<!-- markdownlint-enable MD013 -->

Deterministische Reihenfolge:

1. R1- und R2-JS-Checks ausführen.
2. Docker/Supabase lokal starten und vollständige SQL-Fixture ausführen.
3. Relevante SQL-Dateien rerun-sicher erneut prüfen und Supabase Database
   Advisor gemäß realer CLI-Hilfe ausführen.
4. Full Review und externer CodeRabbit-Review; valide Findings korrigieren und
   invalidierte Checks wiederholen.
5. Evidence-Baseline und produktiven read-only Preflight vorbereiten.
6. Owner Briefing:
   - erwartete neue Objekte und 78 Katalogzeilen;
   - keine V1-, Consumer- oder historische V2-Datenänderung;
   - Reihenfolge `20`, danach `16`;
   - Stop- und Korrekturvertrag.
7. Nur nach expliziter Freigabe produktives SQL ausführen.
8. Produktive Postchecks ausschließlich read-only; keine synthetische
   Activity-V2-Session erzeugen.
9. Finalen R1/V1-Isolations- und Diff-Check ausführen.

Ergebnis:

- Grüne Nachweise:
  - `T-ACT-R2-01 bis -12; EV-L01 bis -L04; EV-PRE01/-02; EV-W01/-02;
    EV-P01 PASS`
- Wiederverwendete, nicht invalidierte Nachweise:
  - `T-ACT-R1-01 bis -05`
- Nicht ausgeführte Smokes:
  - `keine erforderlichen; eine synthetische produktive Activity-V2-Session
    wurde vertragsgemäß bewusst nicht erzeugt`
- Produktiver Iststand:
  - `PostgreSQL 17.6; DB-Owner postgres/BYPASSRLS; pgcrypto 1.3 und
    extensions.digest vorhanden; 4/4 R2-Tabellen, 2/2 R2-RPCs, vier Policies,
    fünf valide Indizes und 78/78 aktive Katalogzeilen; Sessions/Items/Sets 0;
    Activity V1 unverändert 62 activity_event- und 283 health_events-Zeilen`
- Externer Review:
  - `CodeRabbit nicht erfolgt, da keine lokale CLI/Integration verfügbar;
    interner Full Code-/Contract-Review PASS`
- Offene Findings:
  - `keine In-Scope-Findings; F-ACT-R2-30/-31 geschlossen. Der produktive
    Definer-Advisor-Warnhinweis ist exakt intentional und vollständig
    begründet. Projektweite
    R2-fremde Watchlist: ungenutzter p_reason in med_adjust_stock_v2 und
    med_set_stock_v2 sowie deaktivierter Leaked-Password-Schutz`
- Commit-Entscheidung:
  - `S5 PASS; produktiver R2-Stand grün; S6 offen`

Exit: S5 ist PASS; lokaler Vertrag, freigegebener Produktiv-Cutover und
read-only Postchecks beschreiben denselben grünen R2-Stand. S6 ist offen.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / Medium`.

Deterministisch:

1. `docs/modules/Activity Module Overview.md` auf den bewiesenen R2-Stand
   synchronisieren.
2. `docs/qa/backend-supabase.md`,
   `docs/qa/health-capture-reports.md` und `sql/HOW_TO.md` nur um tatsächlich
   grüne Verträge ergänzen.
3. Masterplan R2 auf DONE setzen und R3 als nächsten Rolling-Wave-Schritt
   bestätigen; keine R3-Roadmap vorwegnehmen.
4. Owner Recap in Alltagssprache:
   - warum drei historische Tabellen plus Katalogprojektion;
   - was atomarer Commit und Idempotenz praktisch verhindern;
   - was Docker lokal bewiesen hat;
   - was produktiv geändert wurde und was noch unsichtbar bleibt.
5. Finalen Full Contract Review gegen R1, Masterplan, SQL, JS, Evidence,
   QA und realen Produktivstand durchführen.
6. Findings korrigieren; In-Scope-P0/P1 müssen geschlossen sein.
7. Changelog-Relevanz prüfen und bemerkenswerte R2-Grundlage unter
   `Unreleased` eintragen, ohne Release-Cut oder Tag.
8. Resume Card auf Abschluss setzen und Commit-Empfehlung aus realem Diff
   ableiten.
9. Roadmap und Evidence mit `(DONE)` nach `docs/archive/` verschieben.

Ergebnis:

- Source-of-Truth-Sync:
  - `Activity Module Overview, backend-supabase QA,
    health-capture-reports QA, SQL How-To, Activity-V2-Masterplan und
    CHANGELOG.md auf den bewiesenen R2-Iststand synchronisiert`
- Finaler Review:
  - `PASS; R1, Masterplan, SQL, JS, Evidence, QA und produktiver Iststand
    widerspruchsfrei. F-ACT-R2-32/-33 geschlossen; finaler produktiver
    Read-only-Abgleich 78/0/0/0 und V1 62/283; kein offenes In-Scope-P0/P1.`
- Restrisiken:
  - `Intentionaler authenticated-SECURITY-DEFINER-Advisor-Hinweis;
    erwartete unused-index-INFOs auf leeren R2-Tabellen. R2-fremd bleiben zwei
    Medication-Lintwarnungen und deaktivierter Leaked-Password-Schutz.`
- Changelog-Relevanz:
  - `Unreleased unter Added und Security aktualisiert; kein Release-Cut/Tag`
- Owner Recap:
  1. `Activity V1 bleibt die sichtbare und unverändert arbeitende Oberfläche.`
  2. `R2 stellt darunter die künftige Activity-V2-Datenbasis produktiv bereit.`
  3. `Eine Katalogtabelle projiziert exakt die 78 freigegebenen R1-Einträge.`
  4. `Drei Historientabellen trennen Session, ausgewählte Aktivität und Sätze.`
  5. `Diese Trennung hält gemischte Sessions und variable Satzanzahlen sauber.`
  6. `Der Commit speichert eine komplette Session oder gar nichts; halbe
      Trainingsstände können nicht zurückbleiben.`
  7. `Wiederholte Requests mit demselben Inhalt erzeugen kein Duplikat.`
  8. `Dieselbe Request-ID mit anderem Inhalt wird sichtbar als Konflikt
      abgewiesen.`
  9. `Historie ist ownergebunden; anonyme und fremde Nutzer werden abgewiesen.`
  10. `Browser und Service Role dürfen nicht direkt in die Historientabellen
       schreiben; der gehärtete Commit ist die einzige Schreibgrenze.`
  11. `Docker/PostgreSQL 17 bewies Reruns, Rollback, parallele Rennen,
       Zeitgrenzen, ACL/RLS und den letzten vollständigen Leistungsblock.`
  12. `Produktiv entstanden vier Tabellen, fünf Indizes, vier Policies, zwei
       RPCs und 78 Katalogzeilen; es wurde keine Testsession geschrieben.`
  13. `Die isolierte JS-Schicht ist getestet, wird von der Produktseite aber
       noch nicht geladen.`
  14. `R3 darf nun den gemeinsamen lokalen Session-Draft und die UI-Shell als
       eigene Roadmap planen; ein sichtbarer V2-Cutover ist weiterhin später.`
- Archiv:
  - `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Roadmap (DONE).md`
  - `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Evidence (DONE).md`
- Commit-Empfehlung:

```text
feat(activity): add Activity V2 database and atomic commit foundation
```

Exit: Repo, Datenbank, QA, Masterplan und Dokumentation beschreiben denselben
R2-Vertrag; R3 kann anschließend als eigene Rolling-Wave-Roadmap entstehen.

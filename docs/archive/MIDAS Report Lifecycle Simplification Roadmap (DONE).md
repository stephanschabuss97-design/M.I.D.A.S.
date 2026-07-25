# MIDAS Report Lifecycle Simplification Roadmap (DONE)

Kompakter Produkt- und Arbeitsvertrag nach
`docs/templates/MIDAS Roadmap Workflow Contract.md`.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Doctor View / Reports / Supabase / GitHub Actions` |
| Owner / Kontext | `Stephan; persönliches Single-User-MIDAS und langfristige Datenhygiene` |
| Erstellt am | `2026-07-25` |
| Letzter Stand | `2026-07-25, S1-S6 PASS; Edge Version 50 produktiv und remote/lokal hashgleich` |
| Aktueller Schritt | `abgeschlossen und archiviert` |
| Risikoklasse | `R3` |
| Standard-Reviewtiefe | `Full` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | Report-UI/-API, `midas-monthly-report`, GitHub-Workflow, Report-SQL, QA und Recovery-Doku |
| Deploy relevant | `ja, eine Edge Function und ein GitHub-Workflow` |
| Produktive Schreibwirkung | `ja, Report-Cleanup, Unique-Index, Secret- und Workflow-Änderungen` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `docs/archive/MIDAS Report Lifecycle Simplification Evidence (DONE).md` |
| Archivziel | `docs/archive/MIDAS Report Lifecycle Simplification Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Session Resume Card

- Ziel:
  - Monatsberichte entfernen und für Stephan höchstens einen aktuellen
    Arzt-Bericht als ersetzbares Arbeitsdokument halten.
- Unveränderliche Verträge:
  - Gesundheits-Rohdaten bleiben Source of Truth und werden nicht gelöscht.
  - Ein neuer Arzt-Bericht wird vollständig berechnet, bevor der bestehende
    Bericht verändert wird.
  - Fehlgeschlagene Erzeugung lässt den bisherigen Arzt-Bericht unverändert.
  - Report-Erzeugung bleibt explizit und mit User-JWT geschützt.
  - `midas.health-export.v2`, Charts, Trendpilot und medizinische Logik bleiben
    unverändert.
- Erledigter Stand:
  - Ist-Pfade für Monthly, Range, Workflow, UI, SQL und Recovery kartiert.
  - Owner-Entscheidung: kein Monatsbericht und kein Report-Archiv.
  - Initialer Contract Review mit korrigierten Designfindings `PASS`.
  - S1-Baseline produktiv read-only verifiziert: sieben Monthly-, null
    Range-Berichte; kein kanonischer Arzt-Bericht vorhanden.
  - S2-Daten-, UI-, API-, Cleanup- und Recovery-Vertrag finalisiert; Full
    Contract Review `PASS`.
  - S3-Red-Team-Review finalisiert: Workflow-Runs, Drift-Lock, atomare
    Transition, gekoppelter Rollback, Owner-Gates und Testfixtures geschärft.
  - S4 Readiness Review finalisiert: Dateieigentum, Testartefakte,
    Ausführungsblöcke, Invalidation und S5-Grenze sind festgelegt; Full
    Contract Review `PASS`.
  - S4.1 finalisiert: sichtbare Monthly-/Inbox-/Archivpfade und tote
    Client-Helfer entfernt; Current-/Zero-State, Export, Einzelwerte, Verlauf,
    Unlock sowie generische Chart-/Trendpilot-Consumer bleiben erhalten.
  - S4.2 finalisiert: Edge-Vertrag ist explizit Range-only und User-JWT-
    geschützt; Build-before-write und Singleton-Replacement sind in
    env-freien Modulen mit `18/18` grünen Deno-Tests belegt.
  - S4.3 finalisiert: nicht destruktives Fresh Setup, owner-gatete Transition,
    exakter Singleton-Index, UTC-Fingerprint und PostgreSQL-17-Fixture samt
    Drift-, Rollback-, Monthly-only- und Lock-Timeout-Nachweisen sind grün.
  - S4.4 finalisiert: lokaler Monthly-Workflow entfernt; RB-006 rekonstruiert
    nur noch die Range-only-Edge und enthält den geschützten,
    deterministischen Report-Cutover-Extrakt.
  - S4.5 finalisiert: integrierter Full Review und alle lokalen/disposable
    Checks `PASS`.
  - S5-Cutover finalisiert: Monthly entfernt, Range-Singleton produktiv,
    Workflow deaktiviert, tote Secrets entfernt und Replacement belegt.
  - Externer Nachlauf: bestätigte CodeRabbit-Findings zu Update-Race,
    Fehlergrenze und maximalem Zeitraum lokal korrigiert; Deno `22/22`,
    Check/Lint/Format und Frontend-Vertragschecks grün.
  - Edge Version 50 produktiv deployed; JWT-, Auth-, Service-Role- und
    Remote-/Local-Hashvertrag `PASS`.
  - S6-Doku-Sync, QA-Nachfolger, Changelog und Full Contract Review `PASS`.
- Aktueller Schritt:
  - abgeschlossen.
- Nächster erlaubter Schritt:
  - keine weitere Aktion in dieser Roadmap.
- Offene Findings:
  - Kein offenes In-Scope-Codefinding; `F-31` bleibt owner-deferred.
- Geänderte Dateien:
  - S4.1-UI/API-Dateien, S4.2-Edge samt vier Vertrags-/Testmodulen,
    S4.3-SQL/Fixture/HOW_TO, S4.4-Workflow/Recovery-Runbook, diese Roadmap und
    zugehörige Evidence.
- Gültige Nachweise:
  - `EV-B01` bis `EV-B06`, `EV-RDY01`, `EV-L02` und `EV-L03`;
    `EV-L01`/`EV-L04` besitzen einen dokumentierten Teilstand.
- Runtime-/Deploy-Stand:
  - Produktiv: Edge Version 50, Monthly-Workflow deaktiviert,
    `monthly_report = 0`, `range_report = 1`, Singleton-Index gültig.
  - Remote/lokal: alle drei produktiven Edge-Quelldateien SHA-256-identisch.
- Offene Owner-Freigaben:
  - keine.
- Stop-Bedingungen:
  - keine aktive Stop-Bedingung.

## Zielvertrag

- Für den einzigen MIDAS-Nutzer existieren null oder genau ein
  `health_events/system_comment` mit `payload.subtype = range_report`.
- `user_id` bleibt dabei ausschließlich die technische Auth-/Ownership-Grenze
  des bestehenden Supabase-Vertrags und ist kein Multi-User-Produktmerkmal.
- Ein neuer Arzt-Bericht ersetzt den bisherigen Bericht in derselben
  Datenbankzeile oder erzeugt beim ersten Mal genau eine Zeile.
- Der bisherige Bericht bleibt bei Validierungs-, Read-, Build- oder
  Write-Fehler vollständig erhalten.
- Gleichzeitige Erstanforderungen können nicht dauerhaft zwei
  `range_report`-Zeilen erzeugen.
- Monatsberichte werden weder automatisch noch manuell erzeugt, angezeigt oder
  gespeichert.
- Der GitHub-Monatsworkflow ist remote deaktiviert und aus dem Repo entfernt.
- Bestehende `monthly_report`-Zeilen und überzählige alte
  `range_report`-Zeilen werden nach Backup und Owner-Freigabe einmalig
  gelöscht.
- Ein partieller Unique-Index schützt den Singleton-Vertrag dauerhaft in
  PostgreSQL.
- Doctor View zeigt den aktuellen Arzt-Bericht direkt; ein separates
  sichtbares Produkt `Berichte`/`Inbox`, Report-Archiv, Monthly-Filter und
  Archiv-Clear sind nicht mehr Teil der UI.
- Die primäre Reportfläche existiert immer als UI-Struktur. Ohne gespeicherten
  Arzt-Bericht zeigt sie erst nach erfolgreichem Read einen ruhigen Zero-State;
  technisch bleibt der Datenvertrag bewusst `0..1`, nicht `exactly 1`.
- Unterhalb des Berichts bleiben `Export JSON`, `Einzelwerte` und `Verlauf` als
  sekundäre Werkzeuge erreichbar.
- Der bestehende technische Edge-Endpunkt `midas-monthly-report` bleibt vorerst
  stabil, akzeptiert aber nur noch authentifizierte Bereichsberichte.

Bewusst unverändert:

- `health_events` für BP, Körper, Labor, Aktivität, Intake und Notizen.
- Arzt-Bericht-Inhalt, Kennzahlen, Medication-Read-Modell und Trendpilot.
- Health Export V2 und seine manuelle Download-Funktion.
- Doctor-Unlock, Charts, Einzelwerte und responsive Report-first-Oberfläche.
- `SUPABASE_SERVICE_ROLE_KEY`, weil andere Workflows und Edge Functions ihn
  weiterhin benötigen.

## Problem und Ist-Zustand

- Jeder neue `range_report` wird derzeit als zusätzliche Zeile eingefügt.
- Monatsberichte werden monatlich per GitHub Action und zusätzlich manuell
  angeboten, obwohl sie im realen MIDAS-Alltag keinen dauerhaften Nutzen haben.
- Reports duplizieren Rohdatenserien in JSON-Payloads und sind keine
  medizinische Source of Truth.
- Die neue report-zentrierte Doctor View macht das bisherige Archivmodell noch
  weniger sinnvoll.
- Ein einfaches Löschen vor der Neuberechnung wäre falsch: Bei einem späteren
  Fehler wäre auch der letzte gültige Bericht verloren.
- UI, Edge, GitHub-Scheduler, Secrets, Recovery-Doku und Datenbank-Invariante
  müssen deshalb gemeinsam, aber über getrennte Gates umgestellt werden.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-1 | 2026-07-25 | Arzt-Bericht ist für den einzigen MIDAS-Nutzer ein globales `0..1`-Singleton, nicht pro Arzt oder Zeitraum. | Reales Nutzungsverhalten: immer nur das aktuell benötigte Arbeitsdokument. | Zielvertrag |
| D-2 | 2026-07-25 | Ein neuer Bericht ersetzt den bestehenden erst nach vollständiger Berechnung. | Kein Verlust des letzten gültigen Berichts bei Fehlern. | S4.2/S5 |
| D-3 | 2026-07-25 | Der bestehende Datensatz wird bevorzugt in-place aktualisiert. | Stabile ID, minimaler Datenmüll und kleine Schreibwirkung. | S4.2 |
| D-4 | 2026-07-25 | Ein partieller Unique-Index auf `user_id` schützt ausschließlich `range_report`. | Datenbank erzwingt den Vertrag auch außerhalb der UI. | S4.3 |
| D-5 | 2026-07-25 | Monatsberichte werden vollständig entfernt, nicht nur 90 Tage aufbewahrt. | Retention würde Scheduler, Secrets, Branches und UI-Komplexität ohne realen Nutzen erhalten. | S4.1-S4.4 |
| D-6 | 2026-07-25 | Bestehende Monthly-Zeilen und Range-Duplikate werden einmalig gelöscht. | Reports sind abgeleitete Snapshots; Rohdaten bleiben erhalten. | S5 |
| D-7 | 2026-07-25 | Vor dem Cleanup entsteht ein frisches, geprüftes RB-006-Recovery-Bundle mit zusätzlichem geschütztem Report-Extrakt außerhalb des Repos. | Destruktive Wirkung bleibt im Notfall gezielt und vollständig rückholbar. | S5 |
| D-8 | 2026-07-25 | Bei Legacy-Duplikaten bleibt der neueste gültige Bericht nach dem bisherigen Doctor-View-Vertrag; gibt es keinen gültigen, bleibt kein Range-Bericht. | Die bisher sichtbare Wahrheit wird erhalten, korrupte Artefakte nicht. | S2/S4.3 |
| D-9 | 2026-07-25 | Report-Archiv, Monthly-Filter, Monthly-CTA, Delete- und Clear-Archiv-Flows entfallen aus der Produkt-UI. | Bei einem Singleton gibt es kein sinnvolles Archiv. | S4.1 |
| D-10 | 2026-07-25 | Der Edge-Function-Name bleibt vorerst `midas-monthly-report`. | Ein Rename würde einen zweiten Endpoint-Cutover ohne Produktnutzen erzeugen. | Scope/W-1 |
| D-11 | 2026-07-25 | `MONTHLY_REPORT_USER_ID` und `REPORTS_URL` werden nach erfolgreichem Cutover entfernt. | Beide existieren nur für Monthly; tote Secrets sollen nicht bleiben. | S5 |
| D-12 | 2026-07-25 | Das gemeinsam genutzte GitHub-Secret `SUPABASE_SERVICE_ROLE_KEY` bleibt erhalten. | Incident, Trendpilot und Protein verwenden es weiterhin. | Security |
| D-13 | 2026-07-25 | Der Monthly-Workflow wird vor Edge-/SQL-Cutover remote deaktiviert. | Kein Scheduler-Request während des Vertragswechsels. | S5 |
| D-14 | 2026-07-25 | Canonical Schema und produktiver Cleanup bleiben zwei SQL-Artefakte. | Fresh Setup darf nicht destruktiv sein; Bestandsbereinigung muss explizit bleiben. | S4.3 |
| D-15 | 2026-07-25 | Die Doctor-View-Roadmap pausiert vor ihrem produktiven T-9. | Ihr alter Archivvertrag wurde durch Owner-Feedback ungültig. | Abhängigkeit |
| D-16 | 2026-07-25 | Service Role bleibt interner Edge-Datenbankclient, ist aber keine zulässige Caller-Identität für Arzt-Berichte. | Privilegierter interner Read ist vom entfernten Scheduler-Zugriff zu trennen. | S4.2/Security |
| D-17 | 2026-07-25 | `Berichte`/`Inbox` entfällt als sichtbare Ebene; die Doctor View enthält permanent die primäre Fläche für den aktuellen Arzt-Bericht oder den verifizierten Zero-State. | Ein Singleton benötigt kein zweites Archivprodukt. | S2/S4.1 |
| D-18 | 2026-07-25 | `payload.created_at` bleibt die erstmalige Singleton-Erzeugung; `payload.generated_at` bezeichnet jede aktuelle Neuberechnung und ist die sichtbare Erzeugungszeit. | In-place-Replacement darf Historie und aktuelle Generierung nicht vermischen. | S2/S4.1-S4.2 |
| D-19 | 2026-07-25 | Der stabile Edge-Endpunkt akzeptiert nur noch explizite User-JWT-Requests mit `report_type = range_report`, `from` und `to`; alte Monthly-Defaults und Client-Aliase entfallen. | Eindeutiger Range-only-Vertrag ohne stillen Legacy-Fallback. | S2/S4.1-S4.2 |
| D-20 | 2026-07-25 | Ein Unique-Konflikt bei paralleler Erstanlage wird genau einmal durch Refetch und Update des nun vorhandenen Singletons aufgelöst; weiterer Drift schlägt ohne Zusatzwrite fehl. | Dauerhafte Eindeutigkeit bei begrenztem, verständlichem Retry. | S2/S4.2 |
| D-21 | 2026-07-25 | Ein wiederhergestelltes MIDAS darf ohne Report starten; Recovery rekonstruiert Range-only-Edge und Singleton-Index, aber keinen Monthly-Scheduler. | Reports sind abgeleitete Arbeitsdokumente, Rohdaten bleiben Source of Truth. | S2/S4.4/S6 |
| D-22 | 2026-07-25 | Die produktive Transition sperrt `health_events` zu Transaktionsbeginn kurz gegen Writes und verwendet einen regulären partiellen Unique-Index, nicht `CONCURRENTLY`. | Cleanup, Bestandsprüfung und Index müssen atomar sein; die Tabelle umfasst aktuell nur 283 Zeilen beziehungsweise 496 kB. | S3/S4.3/S5 |
| D-23 | 2026-07-25 | Der geschützte Snapshot enthält zusätzlich ein Report-Inventar aus Count, sortierten IDs und Row-Hashes; die Transition verifiziert dieses Inventar unter Lock vor dem ersten Delete. | Ein früher read-only Preflight allein schützt nicht vor Drift zwischen Freigabe und Cutover. | S3/S5 |
| D-24 | 2026-07-25 | Workflow-Disable gilt erst als erfolgreich, wenn der Remote-State deaktiviert und kein Monthly-Run mehr `queued` oder `in_progress` ist. | Bereits angenommene Runs werden durch das bloße Disable nicht zuverlässig zum Cutover-Nachweis. | S3/S5 |
| D-25 | 2026-07-25 | Vor dem Deploy wird ein geschütztes Rollback-Inventar aus Git-Commit, Remote-Workflow-ID/-State, Edge-Version und Source-Hash erzeugt; alte Edge, Reportdaten, Index und Workflow werden nur gekoppelt zurückgerollt. | Nach dem Singleton-Cutover wäre ein isoliertes Wiederherstellen der alten Insert-Edge fachlich inkompatibel. | S3/S5 |
| D-26 | 2026-07-25 | Fresh-Setup- und Transition-SQL verifizieren Name, Eindeutigkeit, Schlüssel und Prädikat des Singleton-Index exakt; `IF NOT EXISTS` allein ist kein Erfolgsnachweis. | Ein gleichnamiges, aber falsches Objekt darf nicht als erfüllter Vertrag gelten. | S3/S4.3/S5 |
| D-27 | 2026-07-25 | Der negative Produktivnachweis verwendet für Nicht-Report-Events Count plus DB-seitigen Fingerprint; in Evidence stehen nur Vergleichsergebnis und Hash, keine Rohdaten. | Reine Zähler würden unbemerkte Updates bei gleicher Zeilenzahl nicht erkennen. | S3/S5 |
| D-28 | 2026-07-25 | Der kanonische partielle Index heißt `uq_events_range_report_per_user`. | Fresh Setup, Transition, Katalogprüfung, Rollback und Evidence benötigen einen eindeutigen gemeinsamen Objektnamen. | S4R/S4.3/S5 |
| D-29 | 2026-07-25 | MIDAS bleibt dauerhaft Single-User; `user_id`, RLS und Owner-Scope sind ausschließlich technische Sicherheits- und Datenbesitzgrenzen. | Der bestehende Supabase-Vertrag darf nicht als Mandantenfähigkeit, Produktgeneralisierung oder SaaS-Vorstufe missverstanden werden. | Gesamtvertrag |
| D-30 | 2026-07-25 | Der geschützte Report-Extrakt verwendet eine exakt definierte `jsonb_build_object(...)::text`-Zeile, Sortierung nach `id::text` und SHA-256 derselben UTF-8-Zeile. | Extrakt und Inventar müssen unabhängig von der ausführenden Sitzung deterministisch vergleichbar sein. | S4.4/S5 |
| D-31 | 2026-07-25 | Der Owner akzeptiert für diesen einmaligen Cutover die Abweichung von D-7: Das neue verschlüsselte Archiv wird separat nachgeholt; ACL-geschütztes Staging, Rollback-Kontext und das vorherige geprüfte Archiv bleiben erhalten. | Der interaktive 7-Zip-Vertrag des Runbooks erwies sich während S5 als fehlerhaft. Der Reportbestand ist abgeleitet, Gesundheits-Rohdaten blieben unverändert und die Abweichung wird nicht als PASS kaschiert. | S5/F-31 |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`.
- Neue oder entscheidungsrelevante Konzepte:
  - partieller Unique-Index, Singleton-Upsert unter Concurrency,
    destruktiver Transition-Cleanup, Workflow- und Secret-Deaktivierung.
- Geplante Briefing-Gates:
  - `G-1` Recovery-Bundle mit Report-Extrakt.
  - `G-2` GitHub-Workflow remote deaktivieren.
  - `G-3` Edge Function deployen.
  - `G-4` produktives Cleanup-/Index-SQL.
  - `G-5` produktiven Replacement-Smoke ausführen.
  - `G-6` veraltete Secret-Namen entfernen.
- Nicht erneut zu erklären:
  - normale JavaScript-, HTML-, CSS- und Dokuänderungen.

## Scope und Grenzen

In Scope:

- Doctor-/Reports-UI auf eine permanente Hauptfläche für `0..1` aktuellen
  Arzt-Bericht reduzieren.
- Client-API und Begriffe von Monthly auf Doctor Report bereinigen.
- Edge Function auf authentifizierte `range_report`-Requests begrenzen.
- Fehlerfestes Update/Insert mit Concurrency-Absicherung.
- Canonical SQL für den partiellen Unique-Index.
- Owner-gated Transition-SQL für Monthly- und Duplicate-Cleanup.
- GitHub-Monatsworkflow deaktivieren und entfernen.
- Nicht mehr benötigte Monthly-Secrets entfernen.
- QA, Module Overviews, Recovery, SQL-HOW-TO und Changelog synchronisieren.

Nicht in Scope:

- Arzt-Bericht-Inhalt, Health Export V2, Charts oder medizinische Schwellen.
- MCP, Labor-PDF-Ingest oder Arzt-spezifische Report-Slots.
- Allgemeine Retention für `health_events`.
- Rename oder Löschung des technischen Edge-Function-Endpunkts.
- Änderung an anderen GitHub-Schedulern oder gemeinsam genutzten Secrets.
- Automatische Berichtserzeugung.

Roadmap-spezifische Guardrails:

- Kein Delete-before-build.
- Kein produktives SQL ohne exakte Vorher-Zähler und Backup-Nachweis.
- Kein Unique-Index, solange für den produktiven MIDAS-Owner mehr als ein
  Range-Bericht existiert.
- Kein Secret-Delete aufgrund bloßer Namensähnlichkeit.
- Kein `service_role`-Pfad zur Erzeugung eines Arzt-Berichts.
- Interner Service-Role-Zugriff bleibt immer explizit auf die zuvor
  authentifizierte `user_id` begrenzt.
- Der UI-In-flight-Schutz ergänzt die Datenbankinvariante, ersetzt sie nicht.
- Der kurze Cutover gilt als Wartungsfenster: keine manuelle
  Report-Erzeugung zwischen `G-2` und abgeschlossenem `G-5`.
- `G-2` ist erst abgeschlossen, wenn der Remote-Workflow deaktiviert ist und
  kein zugehöriger Run mehr `queued` oder `in_progress` ist.
- Zwischen Snapshot und Transition darf sich das freigegebene Report-Inventar
  nicht ändern; die SQL-Transition prüft es unter Write-Lock erneut.
- Die produktive Transition setzt kurze `lock_timeout`- und
  `statement_timeout`-Grenzen und wartet nicht unbegrenzt auf aktive Writer.
- Ein Rollback nach dem Singleton-Cutover darf alte Edge, Index, Reportdaten,
  Workflow und Monthly-Secrets nicht einzeln in einen Mischzustand versetzen.

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/archive/MIDAS Doctor View Report-First Modernization Roadmap (DONE).md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/modules/Reports Module Overview.md`
- `docs/qa/README.md`
- `docs/qa/health-capture-reports.md`
- `docs/qa/runbooks/edge-function-deploy-smoke.md`
- `docs/qa/runbooks/supabase-sql-cutover.md`
- `docs/qa/runbooks/midas-minimal-recovery.md`
- `sql/HOW_TO.md`
- `sql/01_Health Schema.sql`
- `sql/13_Activity_Event.sql`
- `sql/16_Explicit_Grants.sql`
- `.github/workflows/monthly-report.yml`
- `backend/supabase/functions/midas-monthly-report/index.ts`
- `app/modules/doctor-stack/reports/index.js`
- `app/modules/doctor-stack/doctor/index.js`
- `app/supabase/api/reports.js`
- `app/supabase/api/system-comments.js`
- `index.html`

Nur bei konkreter Vertragsfrage:

- `docs/archive/MIDAS Monthly Report Review Findings Roadmap (DONE).md`
- `docs/archive/Reports-Roadmap.md`
- `docs/archive/Doctor Report Roadmap.md`
- Supabase Changelog und offizielle Dokumentation für Indexe, Edge-Deploy und
  aktuelle CLI-Befehle.

## Tool Permissions und Gates

Allowed:

- In-Scope-Dateien lesen und lokal ändern.
- `rg`, Node-/Deno-Checks, Markdownlint und `git diff --check`.
- Lokaler Supabase-/PostgreSQL-Stack und vollständig disposable Fixtures.
- Supabase-, GitHub- und Datenbankzustand produktiv read-only inventarisieren.
- Security-/Performance-Advisor read-only prüfen.

User-gated:

- Produktives RB-006-Recovery-Bundle samt Report-Extrakt erzeugen.
- GitHub-Workflow remote deaktivieren.
- Edge Function deployen.
- Produktives Cleanup-/Index-SQL ausführen.
- Produktiven Arzt-Bericht erzeugen oder ersetzen.
- Supabase- oder GitHub-Secrets entfernen.

Forbidden:

- Secrets ausgeben oder committen.
- Fremde Worktree-Änderungen zurücksetzen.
- Scope, Datenwirkung oder Architektur still erweitern.
- Gesundheits-Rohdaten löschen.
- `SUPABASE_SERVICE_ROLE_KEY` entfernen.
- Alte Reportzeilen ohne geprüftes Recovery-Artefakt und Owner-Freigabe
  löschen. Die einmalige, ausdrücklich dokumentierte S5-Ausnahme steht in
  `D-31` und darf nicht als allgemeiner Präzedenzfall verwendet werden.
- Den bestehenden Bericht bei einer fehlgeschlagenen Erzeugung verändern.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `GPT-5.6 Sol / High` | DONE | Baseline, Runtime, Workflow, Secrets und Testlücken belegt; Full Review PASS |
| S2 | Fachlicher/technischer Zielvertrag | `GPT-5.6 Sol / High` | DONE | Singleton-, UI-, Replacement-, API-, Cleanup- und Recovery-Vertrag final; Full Review PASS |
| S3 | Bruchrisiko-, Security- und Cutover-Review | `GPT-5.6 Sol / Extra High` | DONE | Red Team, Lock/Drift, gekoppelte Rollbacks, Gates und Fixtures final; Full Review PASS |
| S4R | S4 Readiness Review | `GPT-5.6 Sol / Extra High` | DONE | Ownership, Testartefakte, vier sichere Blöcke und S5-Grenze final; Full Review PASS |
| S4 | Umsetzung | `je Substep` | DONE | S4.1-S4.5 DONE; integrierter Full Review PASS |
| S5 | Tests, produktiver Cutover und Abschlussreview | `GPT-5.6 Sol / Extra High` | DONE* | Cutover und Edge Version 50 PASS; Recovery-Archiv owner-deferred |
| S6 | Doku-Sync, Rückkehr zur Doctor View und Archiv | `GPT-5.6 Sol / High` | DONE | Overviews, QA, Evidence, Changelog und Full Review PASS |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-1 | P1 | Data/Contract | corrected | Range-only-Edge plus exakter partieller Singleton-Index lokal umgesetzt und getestet; produktive Aktivierung in S5 |
| F-2 | P1 | Product/Data | corrected | Monthly-Workflow remote deaktiviert und Monthly-Bestand produktiv entfernt; S5 |
| F-3 | P1 | Runtime | corrected | Build-before-write und atomare Update-/Insert-Fehlerpfade mit fokussierten Tests belegt; S4.2 |
| F-4 | P1 | Concurrency | corrected | Begrenzter `23505`-Retry plus Datenbank-Unique-Index verhindern dauerhaftes Duplikat; S4.2-S4.3 |
| F-5 | P1 | Migration | corrected | Legacy-Reportbestand atomar bereinigt; Range-Singleton und exakter partieller Unique-Index produktiv belegt; S5 |
| F-6 | P1 | Contract/Doku | corrected | Doctor-View-Roadmap, Overviews, QA, README und Changelog auf finalen Vertrag synchronisiert; S6 |
| F-7 | P2 | Security/Hygiene | corrected | Ausschließlich `MONTHLY_REPORT_USER_ID` und `REPORTS_URL` entfernt; gemeinsam genutzte Secrets erhalten; S5 |
| F-8 | P2 | Recovery | corrected | RB-006 rekonstruiert keinen Monthly-Workflow oder exklusive Monthly-Secrets mehr; Range-only-Edge und Shared Service Role bleiben erhalten; S4.4 |
| F-9 | P1 | Test/Acceptance | corrected | Produktiver Zero-State erfordert Create-then-Replace-Smoke mit stabiler ID; S5/T-10 |
| F-10 | P1 | Data/UX | corrected | `created_at` bleibt Erstzeit; `generated_at` steuert Neuberechnung, Anzeige und Tie-Break; S4.1-S4.2 |
| F-11 | P1 | Product/UX | corrected | Sichtbare `Berichte`-/Inbox-/Archiv-Ebene samt DOM, State und Listenern entfernt; S4.1 |
| F-12 | P1 | API/Contract | corrected | Client und Edge akzeptieren nur explizite Range-Requests; Monthly-Defaults und Aliase entfernt; S4.1-S4.2 |
| F-13 | P1 | Cutover/Workflow | corrected | Workflow-Disable um Prüfung und gegebenenfalls Abbruch laufender/queued Runs ergänzt; D-24/S5 |
| F-14 | P1 | Migration/Concurrency | corrected | Snapshot-Inventar wird unter kurzem Write-Lock erneut geprüft; Cleanup und regulärer Index bleiben in einer Transaktion; D-22/D-23 |
| F-15 | P1 | Rollback | corrected | Rollback-Inventar und gekoppelte Rückkehrreihenfolge für Daten, Index, Edge, Workflow und Secrets definiert; D-25 |
| F-16 | P1 | Evidence/Data | corrected | Negativnachweis von Count-only auf Count plus DB-seitigen Fingerprint erweitert; D-27 |
| F-17 | P2 | Schema/Idempotenz | corrected | Indexzustand muss katalogseitig exakt verifiziert werden; `IF NOT EXISTS` allein ist unzulässig; D-26 |
| F-18 | P2 | Evidence/Workflow | corrected | Historische GitHub-Erfolge werden nur als erfolgreicher Prozesslauf, nicht als HTTP- oder Persistenzbeweis gewertet; EV-B04 |
| F-19 | P1 | Consumer/Ownership | corrected | Hub-Overlay-API und nur archivexklusive Helfer entfernt; generische Trendpilot-/Chart-Consumer erhalten; S4.1 |
| F-20 | P1 | Testability | corrected | Request-, Build-before-write- und Lifecycle-Vertrag in env-freie Module mit 19 Deno-Tests extrahiert; S4.2/S4.5 |
| F-21 | P2 | Doku/Ownership | corrected | S4.4 ändert nur Workflow-Source und Recovery-Inventar; Produkt-Overviews, QA, Root-README, Changelog und finaler Runtime-Abgleich bleiben S6. |
| F-22 | P1 | UI/CSS | corrected | Nur archivexklusive Selektoren entfernt; Hauptbericht-, Narrative-, Summary- und Responsive-Stile erhalten; S4.1 |
| F-23 | P1 | Data/Schema | corrected | Edge schreibt ausschließlich `ts`/`payload` und prüft den aus `ts` abgeleiteten Wiener Tag; S4.2 |
| F-24 | P1 | SQL/Portabilität | corrected | Unzulässige Qualifizierung der Spezialsyntax `COALESCE` entfernt; PostgreSQL-17-Fixture erneut grün; S4.3 |
| F-25 | P1 | Evidence/Data | corrected | Fixture besitzt einen unabhängigen Inventar-Oracle; `NULL`-Subtypen zählen eindeutig zu geschützten Nicht-Reports; S4.3 |
| F-26 | P2 | Schema/Determinismus | corrected | Transition validiert RLS und erforderliches Schema vor dem Lock und fixiert UTC für den Fingerprint; S4.3 |
| F-27 | P2 | Testabdeckung | corrected | Fresh-Setup-Duplikatabbruch und reiner Monthly-only-Cleanup explizit ergänzt; S4.3 |
| F-28 | P1 | Product Scope | corrected | Per-User-Formulierungen als potenziell irreführend korrigiert: MIDAS bleibt Single-User; `user_id` ist nur Auth-/Ownership-Grenze; D-29 |
| F-29 | P1 | Recovery/Determinismus | corrected | Report-Extrakt, kanonische JSONL-Zeile, Sortierung, Zeilenhash, `day`-Prüfung und reguläre-Bundle-Ausnahme in RB-006 exakt festgelegt; D-30/S4.4 |
| F-30 | P2 | Runtime/Observability | corrected | Nur Requestfehler liefern `4xx`; interne DB-, Build- und Lifecycle-Fehler liefern `500` und sind fokussiert getestet; S4.5 |
| F-31 | P2 | Recovery/Evidence | deferred | Frisches verschlüsseltes Recovery-Archiv scheiterte an der Passwortübergabe des bisherigen Runbooks; Owner verschob die Wiederholung. ACL-geschütztes Staging und Rollback-Kontext bleiben erhalten; vorheriges Archiv samt Sidecar ist gültig. |
| F-32 | P1 | Runtime/Security | corrected | CodeRabbit-Nachlauf behandelt Update-Nichttreffer als Lifecycle-Fehler, hält interne `500`-Details aus dem Client fern und begrenzt Bereichsberichte auf inklusive 400 Tage; Edge Version 50 und Runtime-Smoke PASS. |
| W-1 | Watchlist | Naming | deferred | Edge-Endpunkt heißt technisch weiter `midas-monthly-report`. |

<!-- markdownlint-enable MD013 -->

## Initialer Contract Review

Status: `PASS`, Findings im Entwurf korrigiert.

- Drei-Monats-Retention wurde verworfen: Sie hätte alle Monthly-Komponenten
  erhalten, ohne den realen Nutzen zu verbessern.
- Delete-before-insert wurde durch Build-then-update/insert ersetzt.
- Ein pauschales Secret-Cleanup wurde begrenzt:
  `SUPABASE_SERVICE_ROLE_KEY` bleibt wegen anderer Workflows erhalten.
- Ein Edge-Function-Rename wurde aus dem Scope genommen; der stabile Endpoint
  reduziert Cutover- und Recovery-Risiko.
- Destruktiver Bestands-Cleanup und nicht destruktiver Fresh-Setup-Vertrag
  wurden in getrennte SQL-Artefakte aufgeteilt.
- Die produktive Abnahme der Doctor-View-Roadmap wurde ausdrücklich blockiert,
  statt sie mit dem inzwischen falschen Archivvertrag abzuschließen.
- Der Cutover wurde in einzeln freizugebende Aktionen aufgeteilt; eine
  Gesamtfreigabe ersetzt keine der produktiven Evidence-IDs.
- Externer Service-Role-Aufruf und interner Service-Role-Datenbankclient wurden
  getrennt: Der Caller muss ein authentifizierter User sein, alle privilegierten
  Reads/Writes bleiben auf dessen `user_id` begrenzt.
- Offizielle Supabase-Änderungen bis `2026-07-25` enthalten keinen relevanten
  Blocker für partiellen Index oder Edge-Deploy. CLI-Syntax wird vor der
  Ausführung trotzdem über `--help` verifiziert.

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Pflichtreferenzen und den relevanten Git-Diff lesen.
2. Producer, Consumer, Workflow, Secrets und Recovery-Pfade kartieren.
3. Produktiv read-only zählen:
   - `monthly_report` insgesamt und für den produktiven Owner.
   - `range_report` insgesamt und für den produktiven Owner.
   - gültige, korrupte und zukünftige Range-Berichte.
4. Den vom aktuellen Doctor-View-Vertrag gewählten kanonischen Bericht und
   exakte potenzielle Löschmengen bestimmen.
5. Schema, RLS, Grants, bestehende Report-Indexe und Edge-Version prüfen.
6. Remote-Zustand und nächste Ausführung des Monthly-Workflows prüfen.
7. Ausschließliche Verwendung von `REPORTS_URL`,
   `MONTHLY_REPORT_USER_ID` und gemeinsam genutzten Secrets verifizieren.
8. Aktuelle Report-Tests, Runbooks und fehlende Regressionstests zuordnen.
9. Findings klassifizieren, S1 Full Contract Review durchführen und Findings
   korrigieren.

Ergebnis:

- Producer, Consumer, Edge, GitHub-Workflow, Secrets und Recovery-Pfade sind
  vollständig kartiert.
- Produktiv existieren sieben `monthly_report`-Zeilen für einen User und keine
  `range_report`-Zeile; gültig, korrupt und zukünftig sind damit jeweils null.
- Es gibt keinen kanonischen Arzt-Bericht. Die aktuelle potenzielle Löschwirkung
  beträgt sieben Monthly-Zeilen und null Range-Duplikate.
- PostgreSQL 17.6, aktive RLS, erwartete Owner-Policies und CRUD-Grants für
  `authenticated`/`service_role` sind belegt; ein report-spezifischer
  Singleton-Index fehlt.
- Edge Version 47 ist aktiv und JWT-geschützt. Der Monthly-Workflow ist aktiv,
  die letzten fünf Scheduler-Runs waren erfolgreich; nächster nomineller Lauf
  ist `2026-08-01 01:00 UTC` beziehungsweise `03:00 Europe/Vienna`.
- Es existieren keine fokussierten Report-Contract-Tests. `F-9` korrigiert den
  produktiven Smoke auf Erstanlage plus anschließendes Replacement mit stabiler
  ID und unverändertem Fehlerpfad.

Ergebnisgrenze:

- Sensible Payloads und Secret-Werte stehen weder in Roadmap noch Evidence.
- Zähler, IDs nur soweit für den Cutover nötig und keine medizinischen
  Reportinhalte dokumentieren.
- Keine produktive Änderung in S1.

S1 Full Contract Review: `PASS`; `F-9` im Vertrag korrigiert.

Exit: `ERFÜLLT` - realer Bestand, kanonischer Bericht, Löschmenge,
Remote-Konfiguration und Testlücken sind belegt.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. `0..1`-Singleton, Zero-State und aktuelles Report-Read-Modell finalisieren.
2. Kanonische Legacy-Auswahl exakt und SQL-tauglich definieren.
3. Build-then-update/insert samt Zeitanker und Payload-Zeitfeldern festlegen.
4. Concurrency-Konflikt und Retry-/Fail-closed-Verhalten definieren.
5. Monthly-Entfernung für UI, API, Edge, Workflow, Secrets und Daten festlegen.
6. Zieloberfläche ohne Archiv, Delete, Clear und Monthly-Filter definieren.
7. Fresh-Setup-, Bestands-Transition-, Backup- und Recovery-Vertrag trennen.
8. API-Kompatibilitätsgrenze für den stabilen Edge-Endpunkt festlegen.
9. S2 Full Contract Review durchführen und Findings korrigieren.

### S2 Singleton-, Read- und UI-Vertrag

- Persistenter Zustand für den einzigen produktiven Owner: null oder genau eine
  `system_comment/range_report`-Zeile.
- Die Doctor View besitzt nach dem Unlock immer dieselbe primäre Reportfläche:
  - `loading` zeigt einen neutralen Ladezustand.
  - `success` zeigt den aktuellen Arzt-Bericht und seine persistierte Periode.
  - `empty` ist nur nach erfolgreichem Read ohne Range-Bericht zulässig und
    zeigt `Noch kein Arzt-Bericht vorhanden` plus `Arzt-Bericht erstellen`.
  - `error`, `offline` und ausschließlich korrupte Legacy-Daten werden niemals
    als leer oder beruhigend dargestellt.
- Ein Arzt-Bericht muss fachlich nach der ersten Nutzung gewöhnlich vorhanden
  sein, wird technisch aber nicht erzwungen. `0..1` schützt Erststart,
  Wiederherstellung und fehlgeschlagene Erzeugung.
- Es gibt keinen sichtbaren Button und kein Overlay `Berichte`/`Inbox`, kein
  Archiv, keine Reportfilter, keine Pagination und keine Delete-/Clear-Aktion.
- Das interne Reports-Modul darf für Normalisierung, Current-Read, Rendering und
  Erzeugung bestehen bleiben; es ist kein eigenes sichtbares Produkt mehr.
- Im Reportbereich liegt die explizite Aktion `Arzt-Bericht erstellen` oder
  `Arzt-Bericht neu erstellen`. Darunter bleiben `Export JSON`,
  `Einzelwerte` und `Verlauf` als sekundäre Werkzeuge.
- JSON-Export, Einzelwerte und Verlauf behalten den bereits umgesetzten
  Zeitraum-, Lazy-Load-, Unlock- und Fehlervertrag der Doctor-View-Roadmap.

### S2 kanonische Legacy-Auswahl

- Die Transition bewertet Kandidaten für den produktiven Owner ausschließlich
  bei
  `type = system_comment` und `payload.subtype = range_report`.
- Ein Kandidat ist nur gültig, wenn:
  - `payload.period.from` und `payload.period.to` echte ISO-Kalendertage sind;
  - `from <= to` und `to <= Vienna-heute` gilt;
  - der persistierte `day` exakt `period.to` entspricht;
  - `payload.text` nach Trimmen nicht leer ist.
- SQL darf Datumswerte erst nach Format- und Kalender-Roundtrip-Validierung
  casten; fehlerhafte Payloads dürfen die Transition nicht abbrechen.
- Pro User bleibt der Kandidat mit größtem `period.to`. Tie-Break ist der
  neueste gültige Zeitwert in der Reihenfolge `generated_at`, `created_at`,
  `health_events.ts`; letzter Tie-Break ist die größte stabile ID.
- Gibt es keinen gültigen Kandidaten, bleibt für diesen User kein Range-Bericht.
  Die produktive S1-Baseline besitzt aktuell keinen Kandidaten.

### S2 Build-, Replacement- und Zeitvertrag

- Die Edge authentifiziert zuerst den User und lädt danach alle Reportquellen
  explizit für dessen `user_id`.
- Validierung, Reads, Aggregation, Narrativ und vollständige Payload entstehen,
  bevor ein Report-Write beginnt.
- Bei vorhandenem Singleton wird genau diese Zeile in-place aktualisiert; im
  Zero-State wird genau eine Zeile angelegt.
- `health_events.ts` bleibt der UTC-Mittagsanker von `period.to`; der generierte
  Wiener `day` entspricht damit dem Periodenende.
- Beim ersten Insert sind `payload.created_at` und `payload.generated_at`
  identisch. Beim Replacement bleibt `created_at` erhalten und nur
  `generated_at` wird erneuert; sichtbare Copy `Erstellt` verwendet
  `generated_at` mit Fallback auf `created_at` und `ts`.
- Fehlt bei einer Legacy-Zeile ein gültiges `created_at`, wird beim ersten
  Replacement einmalig der erste gültige Wert aus `generated_at`,
  `health_events.ts` oder der aktuellen Generierungszeit als `created_at`
  übernommen.
- Validierungs-, Auth-, Read- oder Build-Fehler verursachen keinen Write.
  Ein fehlgeschlagenes Update lässt die bestehende Zeile atomar unverändert;
  ein fehlgeschlagenes Zero-State-Insert lässt den Zero-State bestehen.
- Mehr als ein vorgefundener Range-Bericht ist vor der Transition ein
  Fail-closed-Zustand und wird nicht durch die Runtime still bereinigt.

### S2 Concurrency- und API-Vertrag

- Ein UI-In-flight-Schutz verhindert Doppelaufrufe im selben Client.
- Der partielle Unique-Index ist die maßgebliche geräteübergreifende
  Eindeutigkeitsgrenze.
- Treffen zwei Erstanlagen zusammen, darf der verlierende Insert bei SQLSTATE
  `23505` genau einmal den nun vorhandenen Singleton refetchen und in-place
  aktualisieren. Bleibt der Zustand unerwartet, endet der Request ohne weiteren
  Retry und ohne Duplikat.
- Parallele Updates dürfen nach PostgreSQL-Commit-Reihenfolge `last write wins`
  enden; sie erzeugen niemals eine zweite Zeile.
- Der technische Endpoint `midas-monthly-report` bleibt stabil. Der neue
  Requestvertrag ist ausschließlich:
  `POST { report_type: "range_report", from: "YYYY-MM-DD", to: "YYYY-MM-DD" }`
  mit gültigem User-JWT.
- Fehlender oder `null`-Reporttyp, `monthly_report`, `month`, ein
  Service-Role-Caller sowie ungültige oder zukünftige Bereiche erzeugen keinen
  Bericht. Der alte implizite Monthly-Default entfällt.
- Die erfolgreiche Response bleibt kompatibel als `{ report, range,
  report_anchor_ts }`; der Client exportiert nur noch einen eindeutig benannten
  Doctor-Report-Generator ohne Monthly-Alias.

### S2 Monthly-, Transition- und Recovery-Vertrag

- UI, Client-API, Edge-Branches, GitHub-Workflow, `REPORTS_URL`,
  `MONTHLY_REPORT_USER_ID`, Monthly-Daten und Monthly-Dokumentation werden als
  eine zusammenhängende Capability entfernt.
- Das nicht destruktive Fresh-Setup-SQL definiert ausschließlich den partiellen
  Singleton-Index und notwendige Kommentare; es löscht keine Daten.
- Die produktive Transition ist ein separates, owner-gated SQL-Artefakt:
  Preconditions prüfen, den Canonical für den produktiven Owner bestimmen,
  Monthly und
  Range-Duplikate bereinigen, anschließend den Unique-Index atomar anlegen.
- Vor der Transition wird ein frisches RB-006-Recovery-Bundle mit geschütztem
  Extrakt der betroffenen Reportzeilen erstellt. Nicht-Report-Events und
  gemeinsam genutzte Secrets bleiben unverändert.
- Recovery stellt Schema, Singleton-Index, Range-only-Edge und die manuelle
  Doctor-Report-Funktion wieder her. Es rekonstruiert weder Monthly-Workflow
  noch Monthly-Secrets; ein Zero-State nach Restore ist gültig.

### S2 Full Contract Review

Status: `PASS`, nach Korrektur.

- `D-17` beseitigt den letzten sichtbaren Archiv-/Inbox-Widerspruch: Die
  Reportfläche bleibt, das eigenständige Produkt `Berichte` entfällt.
- `D-18` und `F-10` trennen erstmalige Singleton-Erzeugung und aktuelle
  Neuberechnung, ohne die stabile Zeilen-ID aufzugeben.
- `D-19` und `F-12` entfernen den gefährlichen impliziten Monthly-Default und
  halten nur den technischen Endpointnamen kompatibel.
- `D-20` begrenzt den Concurrency-Retry auf den erwarteten Unique-Konflikt.
- `D-21` hält Recovery und Erststart mit dem `0..1`-Vertrag vereinbar.
- Kein Code, kein SQL, kein Deploy und keine produktive Änderung erfolgte in S2.

Exit: `ERFÜLLT` - Daten-, Fehler-, UI-, API-, Cleanup- und Recovery-Vertrag sind
widerspruchsfrei und ohne offene Produktentscheidung.

## S3 - Bruchrisiko-, Security- und Cutover-Review

Reasoning: `GPT-5.6 Sol / Extra High`.

Status: `DONE`; Full Contract Review nach Korrektur `PASS`.

### S3 Red-Team-Ergebnis

- Datenverlust:
  - Ein vollständiges Recovery-Bundle nach `RB-006` ist vor dem destruktiven
    SQL Pflicht. Es enthält zusätzlich einen geschützten Report-Extrakt und ein
    Inventar aus Count, sortierten IDs und Row-Hashes.
  - Der gezielte Restore-Extrakt umfasst `id`, `user_id`, `ts`, `type`, `ctx`,
    `payload` und `created_at`; das generierte Feld `day` wird geprüft, aber
    nicht als Insert-Spalte restauriert.
  - Der Extrakt enthält vollständige Reportzeilen für einen gezielten Restore;
    Evidence enthält nur Count, Prüfsumme und PASS/FAIL.
  - Ohne erfolgreich getestetes Archiv, Sidecar und bereinigtes Klartext-
    Staging endet der Cutover vor `G-2`.
- Falsche Canonical-Auswahl:
  - Strict-ISO-Format, echte PostgreSQL-Datumsvalidität, Kalender-Roundtrip,
    Vienna-heute, `day = period.to` und nicht leerer Text sind getrennte
    Preconditions.
  - Ungültige Datums- oder Timestamp-Felder werden ohne Cast-Fehler
    ausgesondert. PostgreSQL 17 darf dafür `pg_input_is_valid` verwenden; die
    strikte ISO-Prüfung bleibt zusätzlich erforderlich.
  - Sortierung bleibt für den produktiven Owner: `period.to`, gültiger
    Zeitfallback und zuletzt `id::text`, jeweils absteigend. SQL und Test-Oracle
    verwenden dieselbe Reihenfolge.
  - Ein unerwartetes Report-Owner-Set ist ein Stop-Grund. Mehrere synthetische
    Owner-IDs sind ausschließlich im disposable Isolationstest erlaubt und
    stellen keinen Multi-User-Produktvertrag dar.
- Concurrency:
  - UI-In-flight und Edge-Retry sind Komfort- beziehungsweise
    Fehlerbehandlung; allein der partielle Unique-Index ist die dauerhafte
    geräteübergreifende Grenze.
  - Cleanup und Index-Erzeugung laufen in einer kurzen Transaktion. Vor
    Inventarprüfung oder Delete nimmt sie
    `LOCK TABLE public.health_events IN SHARE ROW EXCLUSIVE MODE`.
  - Kurze lokale `lock_timeout`- und `statement_timeout`-Werte brechen bei
    aktiven Writern ab, statt einen unklaren langen Produktions-Lock zu halten.
  - Der reguläre, nicht konkurrierende Index ist hier bewusst zulässig:
    `health_events` besitzt aktuell 283 Zeilen und 496 kB Gesamtgröße; Reads
    bleiben möglich, Writes werden nur für die kurze Transaktion blockiert.
  - `CREATE INDEX CONCURRENTLY` ist ausgeschlossen, weil es nicht mit Cleanup
    und Index in derselben Transaktion atomar ausgeführt werden kann.
- RLS und Service Role:
  - Der Caller liefert ausschließlich sein Bearer-Token, niemals eine
    `user_id`. Erst `getUser(token)` bestimmt den Scope.
  - Ein Service-Role-Caller wird ausdrücklich abgelehnt. Der interne
    Service-Role-Client bleibt zulässig, aber jede Query und jeder Write muss
    die authentifizierte `user_id` enthalten.
  - RLS, Policies, Grants und Nicht-Report-Indexe werden durch die Transition
    weder ersetzt noch erweitert.
- Workflow-Drift:
  - Lokale Dateilöschung ist kein Remote-Disable.
  - `G-2` prüft den Workflow anhand stabiler Remote-ID beziehungsweise Pfad,
    den Zustand `disabled_manually` und null Runs in `queued` oder
    `in_progress`.
  - Ein bereits angenommener Run wird abgebrochen oder sein Ende abgewartet;
    danach werden Report-Zähler und Snapshot-Inventar erneut geprüft.
  - Die bisherigen GitHub-Ergebnisse beweisen nur erfolgreiche Shell-Prozesse:
    `curl -sS` ohne `--fail-with-body` beweist keinen HTTP-2xx-Status.
- Secret-Verwechslung:
  - `MONTHLY_REPORT_USER_ID` und `REPORTS_URL` werden erst nach finalem
    Range-only-Smoke entfernt.
  - `SUPABASE_SERVICE_ROLE_KEY`, andere URL-Secrets und Supabase-verwaltete
    Projektsecrets bleiben unverändert.
  - Secret-Werte, JWTs und Digests erscheinen weder im Rollback-Inventar noch
    in Evidence.

### S3 Cutover- und Stop-Vertrag

1. `T-1` bis `T-5` müssen grün sein; produktiver Zustand wird unmittelbar vor
   dem Briefing erneut gelesen.
2. `G-1/T-6` erzeugt ein frisches RB-006-Recovery-Bundle samt
   Report-Extrakt, Inventar und Prüfsummen.
3. `G-2/T-7` deaktiviert den Remote-Workflow. Noch aktive Runs werden beendet;
   Report-Inventar und Zähler müssen danach weiterhin zum Snapshot passen.
4. `G-3/T-8` deployt die neue Edge und führt ausschließlich write-freie
   OPTIONS-, Auth-, Monthly-, Service-Role- und Invalid-Range-Smokes aus.
5. `G-4/T-9` startet die kurze Transition:
   - Zielprojekt und erwartetes Schema prüfen;
   - Lock- und Statement-Timeout lokal setzen;
   - Tabelle gegen Writes sperren;
   - Report-Inventar unter Lock gegen den Snapshot prüfen;
   - Canonical-Auswahl reproduzieren und erwartete Löschwirkung prüfen;
   - Monthly und überzählige/ungültige Range-Zeilen löschen;
   - exakten regulären partiellen Unique-Index erzeugen oder verifizieren;
   - Postconditions prüfen und nur dann committen.
6. `G-5/T-10` erzeugt im produktiven Zero-State einen echten Arzt-Bericht und
   ersetzt ihn anschließend mit derselben fachlich gültigen Periode. ID und
   `created_at` bleiben stabil, `generated_at` wird erneuert.
7. Ein absichtlich ungültiger Request belegt ohne Write, dass der gültige
   Bericht unverändert bleibt.
8. `G-6/T-11` entfernt nur die zwei bestätigten Monthly-Secret-Namen.
9. `T-12` wiederholt Counts, Fingerprints, Indexkatalog, RLS/ACL, Workflow,
   Edge, Browser und Advisor.

Sofortiger Stop:

- Recovery-Bundle, Report-Extrakt, Archivtest oder Prüfsumme ist unvollständig.
- Workflow-State ist nicht deaktiviert oder ein Run bleibt aktiv.
- Report-Count, User-Set, ID-/Hash-Inventar oder Canonical weicht ab.
- Lock kann innerhalb des Timeouts nicht erworben werden.
- Indexname existiert mit anderer Eindeutigkeit, Schlüsselspalte oder anderem
  Prädikat.
- `pgcrypto.digest` ist im Zielprojekt nicht verfügbar oder der berechnete
  Inventar-Fingerprint entspricht nicht dem freigegebenen Laufzeitparameter.
- Transition meldet eine andere Löschwirkung als im unmittelbar freigegebenen
  Briefing.
- Neue Edge besteht einen write-freien Auth-/Invalid-Smoke nicht.
- RLS, ACL, Nicht-Report-Fingerprint oder gemeinsam genutzte Secrets driften.

### S3 Rollback-Vertrag

- Vor `G-2`:
  - kein Runtime-Rollback nötig; nur unvollständige lokale Artefakte nach dem
    Recovery-Runbook sicher bereinigen.
- Nach `G-2`, vor `G-3`:
  - Workflow nur dann wieder aktivieren, wenn der Cutover abgebrochen und die
    alte Monthly-Capability bewusst vollständig erhalten wird.
- Nach `G-3`, vor `G-4`:
  - alte Edge aus dem geschützten Rollback-Inventar beziehungsweise dem
    vermerkten Pre-Cutover-Commit redeployen; erst danach Workflow reaktivieren.
- Innerhalb `G-4`:
  - jeder Fehler führt zum Transaktions-Rollback; Deletes und Index werden
    gemeinsam verworfen.
- Nach Commit von `G-4`:
  - bevorzugt Fix-forward der neuen Edge.
  - echter Rückbau erfolgt im Wartungsfenster in dieser Reihenfolge:
    1. Reportwrites stoppen.
    2. Singleton-Index entfernen und Reportzeilen aus dem geschützten Extrakt
       in einer Transaktion wiederherstellen.
    3. alte Edge-Version redeployen und prüfen.
    4. benötigte Monthly-Secrets rekonstruieren.
    5. Monthly-Workflow zuletzt reaktivieren.
  - Die alte Insert-Edge darf nie allein mit dem Singleton-Endzustand als
    erfolgreicher Rollback gelten.
- Nach `G-6`:
  - Secret-Werte werden aus ihren kanonischen Systemen neu gesetzt, nicht aus
    Logs oder Evidence rekonstruiert.

### S3 Test- und Evidence-Vertrag

Disposable SQL-Fixtures:

- Zero-State ohne Reports und Zweitlauf.
- Monthly-only entsprechend produktiver Baseline.
- null, ein und mehrere gültige Range-Berichte für dieselbe synthetische
  Owner-ID.
- gleiches `period.to` mit allen Zeit- und ID-Tie-Breaks.
- ungültiges Format, unmöglicher Kalendertag, `from > to`, Zukunft,
  `day`-Mismatch, leerer Text und ungültige Zeitfelder.
- mehrere synthetische Owner-IDs ausschließlich zur Prüfung technischer
  Ownership-Isolation.
- erzwungener Fehler nach Cleanup zum Beweis des vollständigen Rollbacks.
- Index blockiert nur einen zweiten Range-Bericht derselben Owner-ID; Monthly,
  andere `system_comment`-Subtypen und eine andere synthetische Owner-ID
  bleiben technisch zulässig.
- zweiter SQL-Lauf ist ein No-op und verifiziert die exakte Indexdefinition.
- RLS, ACL, bestehende Indexe und Nicht-Report-Zeilen bleiben unverändert.

Edge-Contract-Fixtures:

- gültige Zero-State-Erstanlage und In-place-Replacement.
- stabile ID und `created_at`, erneuertes `generated_at` und Zeitanker.
- fehlender/`null`-Typ, Monthly, `month`, Service Role, falscher User,
  invalides/future Range und fehlendes JWT ohne Write.
- Auth-, Source-Read-, Build-, Insert- und Update-Fehler erhalten den alten
  Bericht beziehungsweise Zero-State.
- mehr als ein Range-Bericht wird fail-closed abgelehnt.
- `23505` führt genau einmal zu Refetch/Update; fehlender oder mehrfacher
  Refetch sowie zweiter Fehler enden ohne weiteren Retry.
- alle privilegierten Reads/Writes sind auf die authentifizierte `user_id`
  begrenzt.

Produktiver Negativnachweis:

- Vor und nach dem Cutover werden Count und DB-seitiger Fingerprint aller
  Nicht-Report-Zeilen in `health_events` verglichen.
- Der Fingerprint serialisiert die festen Felder `id`, `user_id`, `ts`, `day`,
  `type`, `ctx`, `payload` und `created_at` per `jsonb_build_object`, sortiert
  die Row-Repräsentationen nach `id::text`, aggregiert sie und bildet mit
  `pgcrypto.digest(..., 'sha256')` einen Hex-Hash. Leere Mengen verwenden einen
  definierten leeren String.
- Report-Inventar und Nicht-Report-Fingerprint verwenden denselben
  Serialisierungsvertrag. Erwarteter Count und Hash werden erst beim Cutover
  als Laufzeitparameter übergeben und niemals als produktionsspezifische Werte
  in die Repo-SQL committed.
- Zusätzlich werden RLS/ACL, bestehende Nicht-Report-Indexe, andere Workflows
  und gemeinsam genutzte Secrets per Inventar verglichen.
- Evidence speichert nur Count, Hash und Gleichheitsergebnis, keine
  Gesundheitsdaten oder Secret-Werte.

### S3 Owner-Gates

<!-- markdownlint-disable MD013 -->

| Gate | Briefing | Produktive Wirkung | Hauptrisiko | Rückfall | Erfolgsnachweis |
| --- | --- | --- | --- | --- | --- |
| G-1 | Frisches RB-006-Bundle plus Report-Extrakt erzeugen | DB read-only; verschlüsseltes lokales Archiv | unvollständiges oder ungeschütztes Backup | unfertige lokale Artefakte sicher bereinigen | Archivtest, Sidecar, Inventar-Hash, kein Klartext-Staging |
| G-2 | Remote-Workflow deaktivieren | keine neuen Monthly-Scheduler-Starts | queued/in-progress Run schreibt noch | bei Abbruch bewusst reaktivieren | State deaktiviert; aktive Runs `0`; Report-Inventar unverändert |
| G-3 | Range-only-Edge deployen | produktiver Endpoint-Vertrag ändert sich | Auth-/Range-Regression | Pre-Cutover-Edge redeployen, Workflow noch aus | Version/Hash plus write-freie Smokes |
| G-4 | Cleanup und Singleton-Index | Reportzeilen werden gelöscht; kurzer Write-Lock | Drift, falsche Auswahl, Lock oder Teilwirkung | Transaktionsrollback; nach Commit gekoppelter Restore | erwartete Counts, Canonical, exakter Index, Nicht-Report-Fingerprint |
| G-5 | Create-then-Replace | genau ein produktiver Arzt-Bericht wird geschrieben | Doppelzeile oder Verlust des gültigen Berichts | Fix-forward; Snapshot bleibt verfügbar | Count `1`, stabile ID/created_at, neues generated_at, Failure-Preserve |
| G-6 | zwei Monthly-Secrets entfernen | tote Konfiguration gelöscht | ähnlich benanntes Shared Secret entfernt | Werte kanonisch neu setzen | Namen fehlen; Shared Secrets und andere Workflows unverändert |

<!-- markdownlint-enable MD013 -->

Jedes Briefing nennt unmittelbar vor der Freigabe:

- Zweck und exakte Aktion.
- Zielsystem und Schreibwirkung.
- konkrete Vorher-Zähler beziehungsweise Version.
- Stop-Bedingungen.
- Rollback-Grenze.
- erwartete Evidence-ID.

### S3 Full Contract Review

Status: `PASS`, nach Korrektur.

- `F-13` korrigierte die Annahme, dass Workflow-Disable aktive Runs beendet.
- `F-14` schloss die Race-Lücke zwischen Snapshot, Cleanup und
  Index-Erzeugung durch Inventarvergleich unter kurzem Write-Lock.
- `F-15` ersetzte isolierte Rollback-Hinweise durch eine ausführbare
  gekoppelte Reihenfolge.
- `F-16` schärfte den Nicht-Report-Schutz von Count-only auf
  Count-plus-Fingerprint.
- `F-17` verhindert, dass ein gleichnamiger falscher Index durch
  `IF NOT EXISTS` verdeckt wird.
- `F-18` korrigierte den Evidence-Claim der historischen GitHub-Runs.
- Der reguläre Index im kurzen Wartungsfenster ist aufgrund der produktiv
  verifizierten Größe von 283 Zeilen und 496 kB verhältnismäßig; ein
  concurrent Build würde die geforderte atomare Transition aufbrechen.
- Aktuell sind Workflow-ID `222635705`, Remote-State `active` und null
  `queued`/`in_progress` Runs read-only bestätigt. Dieser Zustand ist nur
  Baseline und wird in S5 neu erhoben.
- Kein Code, kein SQL, kein Deploy, kein Workflow-Disable, kein Secret-Delete
  und kein produktiver Write erfolgte in S3.

Exit: `ERFÜLLT` - Kein destruktiver oder externer Schritt besitzt eine
ungeklärte Precondition, Datenwirkung oder Rollback-Lücke.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks / Evidence | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | UI und Client auf genau einen aktuellen Arzt-Bericht reduzieren | F-2/F-10/F-11/F-12/F-19/F-22 | `index.html`; Doctor, Reports, Hub; Report-/System-Comment-API; `doctor.css` | Full | T-1/T-4; EV-L01/EV-L04 | none |
| S4.2 | Edge auf expliziten Range-only-Request und Singleton-Replacement umbauen | F-1/F-3/F-4/F-10/F-12/F-15/F-20/F-23 | Edge `index.ts`; neue Request-/Lifecycle-Vertragsmodule und Deno-Tests | Full | T-1/T-2; EV-L01/EV-L02 | none |
| S4.3 | Canonical Index und Bestands-Transition samt disposable Fixture schreiben | F-1/F-4/F-5/F-14/F-16/F-17 | `sql/19_Report_Lifecycle.sql`; Transition; SQL-Fixture; `sql/HOW_TO.md` | Full | T-1/T-3; EV-L01/EV-L03 | none |
| S4.4 | Monthly-Workflow-Source und Recovery-Inventar lokal entfernen | F-2/F-7/F-8/F-13/F-18/F-21 | Workflow-Datei; Recovery-Runbook; Backend-/Dev-Doku review-only | Consumer | T-1; EV-L01 | none |
| S4.5 | Integrierter Code-, SQL-, Security-, Consumer- und Contract Review | alle | gesamter In-Scope-Diff | Full | T-1 bis T-4; EV-L01 bis EV-L04 | none |

<!-- markdownlint-enable MD013 -->

### S4R Ownership und Keep-/Remove-Grenze

- `index.html`:
  - entfernt das vollständige `doctorInboxPanel` und den sekundären
    `Berichte`-Button.
  - behält Current-/Zero-State, explizite Neuerzeugung, Export JSON,
    Einzelwerte und Verlauf.
- `app/modules/doctor-stack/doctor/index.js`:
  - entfernt Inbox-State, Overlay-Lifecycle, Archiv-Refresh und öffentliche
    Inbox-API.
  - behält Doctor-Unlock, Current-Report-State, Create-In-flight-Schutz und
    Lifecycle-Invalidierung des aktuellen Berichts.
- `app/modules/doctor-stack/reports/index.js`:
  - entfernt Monthly-/Archiv-Renderer, Filter, Paging, Delete/Clear und
    Regenerate-Pfade.
  - behält Current-Report-Validierung, escaped Narrative, deterministische
    Auswahl und explizite Bereichsbericht-Erzeugung.
- `app/modules/hub/index.js`:
  - entfernt ausschließlich `openDoctorInboxPanel` und seinen Guard-State.
  - der geschützte Einstieg in die Doctor View bleibt unverändert.
- `app/supabase/api/reports.js`:
  - exportiert künftig nur einen expliziten Doctor-Report-Wrapper; der
    technische Endpointname bleibt stabil.
- `app/supabase/api/system-comments.js`:
  - entfernt nur Multi-Subtype-Archivread und Bulk-Delete.
  - behält `fetchSystemCommentsRange` für Charts/Trendpilot,
    `fetchSystemCommentsBySubtype` für den aktuellen Arzt-Bericht und
    `deleteSystemComment` für Trendpilot.
- `app/supabase/index.js`:
  - ist review-only; die Exportaggregation übernimmt die geänderten API-Namen
    automatisch.
- `app/styles/doctor.css`:
  - entfernt Overlay-, Inbox-, Archivgruppen- und Archivaktionsselektoren.
  - behält gemeinsam genutzte Reportkopf-, Metadaten-, Narrative-, Summary-
    und responsive Klassen des Hauptberichts.
- `.github/workflows/monthly-report.yml`:
  - wird lokal in S4.4 entfernt. Remote-Disable bleibt `G-2/T-7`.
- `docs/qa/runbooks/midas-minimal-recovery.md`:
  - entfernt Monthly-Scheduler und seine zwei exklusiven Secret-Namen, behält
    aber die weiterhin existierende Range-only-Edge Function.
- `README.md`, Module Overviews, QA-Suite, `CHANGELOG.md`,
  `backend/README.md` und `docs/DEV_ENVIRONMENT.md`:
  - werden in S4 nur auf Widerspruch geprüft.
  - fachlicher und realer Runtime-Sync erfolgt erst in S6; Functionname und
    Deno-Check bleiben wegen `D-10` gültig.

### S4R Testartefakte und Invalidation

- S4.2 verwendet neben `index.ts` diese fokussierten Artefakte:
  - `backend/supabase/functions/midas-monthly-report/request-contract.ts`.
  - `backend/supabase/functions/midas-monthly-report/request-contract_test.ts`.
  - `backend/supabase/functions/midas-monthly-report/report-lifecycle.ts`.
  - `backend/supabase/functions/midas-monthly-report/report-lifecycle_test.ts`.
- Die Vertragsmodule sind ohne produktive Environment-Werte testbar.
  `index.ts` bleibt dünner HTTP-/Supabase-Adapter.
- S4.3 verwendet zusätzlich:
  - `sql/tests/19_Report_Lifecycle_fixture.sql`.
  - Das Fixture läuft ausschließlich gegen eine disposable Datenbank und
    enthält keine produktiven IDs, Counts oder Hashes.
- Invalidation:
  - jeder S4-Code-/Doku-Patch invalidiert `EV-L01`.
  - Edge-, Request- oder Lifecycle-Änderungen invalidieren `EV-L02`.
  - Canonical-, Transition- oder Fixture-Änderungen invalidieren `EV-L03`.
  - HTML-, Doctor-, Reports-, Hub-, API- oder CSS-Änderungen invalidieren
    `EV-L04`.
  - Produktive Evidence wird in S4 weder erzeugt noch als PASS markiert.

### S4R Reihenfolge und Ausführungsblöcke

1. `S4.1-S4.2` gemeinsam mit `Extra High`:
   - Clientname, Requestbody und Edge-Guard bilden eine gemeinsame API-Grenze.
   - Beide Substeps besitzen Full Review, keine produktive Wirkung und kein
     Owner-Gate.
   - Ergebnis, Findings und Checks bleiben pro Substep separat dokumentiert.
2. `S4.3` separat mit `Extra High`:
   - SQL, Locking, Cleanup und Index besitzen eine andere Fehler- und
     Testdomäne als JavaScript/Deno.
   - Der lokale Block endet nach disposable Fixtures; produktives SQL bleibt
     `G-4/T-9`.
3. `S4.4` separat mit `High`:
   - Der lokale Scheduler- und Recovery-Abbau folgt erst, wenn Edge- und
     Schemaquellen final sind.
   - Remote-Workflow und Secrets bleiben unangetastet.
4. `S4.5` separat mit `High`:
   - gesamter lokaler Diff, alle Consumer und alle vier EV-L-Nachweise werden
     gemeinsam erneut geprüft.

### S4R S5-Grenze

- S4 darf keine produktive Evidence aus `EV-PRE*`, `EV-W*` oder `EV-R*`
  erfüllen.
- Die bereits definierte S5-Reihenfolge bleibt nach dem Review gültig:
  1. lokale/disposable Checks und produktiver read-only Preflight.
  2. Recovery-Bundle und Rollback-Inventar.
  3. Workflow remote deaktivieren und aktive Runs ausschließen.
  4. Range-only-Edge deployen und write-frei prüfen.
  5. Transition und Index atomar ausführen.
  6. kontrollierte Create-then-Replace-Abnahme.
  7. ausschließlich die zwei Monthly-Secret-Namen entfernen.
  8. finaler Postcondition- und Advisor-Review.
- Zwischen Workflow-Disable und abgeschlossenem produktivem Replacement gilt
  weiterhin das dokumentierte Wartungsfenster ohne manuelle Report-Erzeugung.

### S4R Findings und Korrekturen

- `F-19`:
  - Hub-API und gemeinsam genutzte System-Comment-Consumer waren in der
    ursprünglichen Matrix nicht vollständig zugeordnet.
  - S4.1 enthält nun exakte Keep-/Remove-Grenzen und einen Full Review.
- `F-20`:
  - Die Formulierung „fokussierte Deno-Contract-Tests“ ließ Testbarkeit und
    Dateien offen.
  - Request- und Lifecycle-Vertrag erhalten getrennte, mockbare Module und
    Testdateien.
- `F-21`:
  - S4.4 und S6 besaßen überlappende Doku-Ownership.
  - S4.4 ändert nur ausführbare Workflow-/Recovery-Quellen; S6 synchronisiert
    Produktvertrag, QA, Changelog und den bewiesenen Runtime-Stand.
- `F-22`:
  - Hauptbericht und Archiv teilen CSS-/Rendererklassen.
  - S4.1 entfernt nur archivexklusive Pfade und prüft die Hauptdarstellung nach
    dem Cleanup erneut.
- `F-23`:
  - Der erste S4.2-Entwurf nannte `day` als direkt zu aktualisierendes Feld.
  - `health_events.day` ist generated; S4.2 schreibt nur `ts` und prüft den
    daraus abgeleiteten Wiener Kalendertag.

### S4R Full Contract Review

Status: `PASS`, nach Korrektur.

- Jede offene Finding-ID besitzt einen konkreten S4-Owner oder ein
  owner-gated S5-Ziel.
- Kein generischer Trendpilot-, Chart-, Doctor-Unlock- oder Health-Export-
  Consumer wird durch den Archivabbau entfernt.
- Request- und Datenbankvertrag besitzen vor der Umsetzung benannte,
  isolierbare Testartefakte.
- `D-28` fixiert den Indexnamen für Fresh Setup, Transition, Katalogprüfung,
  Rollback und Evidence.
- S4 enthält keinen Deploy, kein produktives SQL, kein Workflow-Disable,
  keinen Secret-Delete und keinen produktiven Report-Write.
- Die S5-Reihenfolge erfüllt weiterhin Build-before-write, Drift-Lock,
  gekoppelten Rollback und getrennte Owner-Gates.
- Readiness-Nachweis: `EV-RDY01`.

Exit: S4 kann ohne neue Grundsatzentscheidung beginnen; lokale Umsetzung und
produktive Gates sind eindeutig getrennt. Vier sichere Ausführungsblöcke sind
festgelegt.

## S4 - Umsetzung

### S4.1 - UI und Client vereinfachen

Reasoning: `GPT-5.6 Sol / High`.

Status: `DONE`; Full Code/Contract Review nach Korrektur `PASS`.

- Vertrag:
  - `D-1`, `D-5`, `D-9`, `D-17` bis `D-19`.
  - `F-2`, `F-10` bis `F-12`, `F-19`, `F-22`.
- Dateien:
  - `index.html`.
  - `app/modules/doctor-stack/doctor/index.js`.
  - `app/modules/doctor-stack/reports/index.js`.
  - `app/modules/hub/index.js`.
  - `app/supabase/api/reports.js`.
  - `app/supabase/api/system-comments.js`.
  - `app/styles/doctor.css`.
  - review-only: `app/supabase/index.js`.
- Umsetzung:
  - Monthly-CTA, Archiv-Overlay, Filter, Pagination, Delete/Clear und tote
    Client-APIs entfernen.
  - Den sichtbaren `Berichte`-/Inbox-Einstieg samt DOM, State und Listenern
    entfernen; die permanente primäre Reportfläche behalten.
  - Hub-Guard und öffentliche Doctor-API nur um das entfernte Overlay
    bereinigen; Doctor-Unlock und normaler Doctor-Einstieg bleiben erhalten.
  - Genau einen Current-Report-Read, den verifizierten Zero-State und explizite
    Neuerzeugung behalten.
  - `generated_at` für sichtbare Zeit und Tie-Break verwenden; `created_at`
    dient nur als Legacy-Fallback, wenn `generated_at` fehlt.
  - `generateDoctorReportRemote({ from, to })` sendet immer explizit
    `report_type = range_report`; `generateDoctorReport` validiert denselben
    Zeitraum. Monthly-Aliase, Defaults, `month` und generische Generatornamen
    entfallen.
  - Multi-Subtype-Archivread und Bulk-Delete entfernen. Generischen
    System-Comment-Range-Read, Single-Subtype-Read und Einzel-Delete wegen
    bestehender Chart-/Trendpilot-Consumer behalten.
  - Gemeinsam genutzte Reportkopf-, Narrative-, Summary- und
    Responsive-Styles behalten; nur archivexklusive CSS-Pfade entfernen.
- Review:
  - `Full`.
- Invalidation:
  - `T-1`, `T-4`, `EV-L01`, `EV-L04`.
  - Doctor-View-, Current-/Zero-State-, Create-, Unlock-, Fokus-, Export-,
    Trendpilot-Delete- und Chart-System-Comment-Smokes.
- Gate:
  - `none`.

Ergebnis und Review:

- Monthly-CTA, Inbox-/Archiv-DOM, sekundärer Berichte-Einstieg, Overlay-State,
  Archivfilter/-paging/-delete/-clear und tote Client-APIs sind entfernt.
- Current-/Zero-State, explizite Neuerzeugung, Export JSON, Einzelwerte,
  Verlauf, Doctor-Unlock und generische System-Comment-Consumer bleiben
  erhalten.
- Review-Finding `S4.1-F1`: Archivexklusive Tag-/Gruppenklassen lagen zusätzlich
  in `app/styles/utilities.css`, das im Readiness-Ownership fehlte. Datei in den
  Scope aufgenommen, tote Klassen entfernt und Altpfadscan wiederholt.
- Node-Syntax `5/5`, statische DOM-ID-Prüfung und Altpfadscan sind grün.
  Interaktiver Browser-Smoke bleibt bewusst `T-4/EV-L04` in S5.

Exit: `ERFÜLLT` - Die UI behauptet weder Monthly noch ein Report-Archiv.

### S4.2 - Edge Range-only und Singleton-Replacement

Reasoning: `GPT-5.6 Sol / Extra High`.

Status: `DONE`; Full Code/Contract Review nach Korrektur `PASS`.

- Vertrag:
  - `D-1` bis `D-4`, `D-10`, `D-16`, `D-18` bis `D-20`.
  - `F-1`, `F-3`, `F-4`, `F-10`, `F-12`, `F-15`, `F-20`, `F-23`.
- Dateien:
  - `backend/supabase/functions/midas-monthly-report/index.ts`.
  - `backend/supabase/functions/midas-monthly-report/request-contract.ts`.
  - `backend/supabase/functions/midas-monthly-report/request-contract_test.ts`.
  - `backend/supabase/functions/midas-monthly-report/report-lifecycle.ts`.
  - `backend/supabase/functions/midas-monthly-report/report-lifecycle_test.ts`.
- Umsetzung:
  - Request-Parsing/-Validierung und Lifecycle-Persistenz in env-freie,
    mockbare Vertragsmodule extrahieren; `index.ts` bleibt HTTP-/Supabase-
    Adapter.
  - Nur authentifizierte, explizite `range_report`-Requests akzeptieren.
  - Fehlenden oder `null`-Typ, Monthly, `month`, leeren Body, Non-Object-JSON,
    Service Role und ungültige beziehungsweise zukünftige Ranges ohne Write
    ablehnen.
  - Monthly-, Scheduler-, `MONTHLY_REPORT_USER_ID`- und Default-Month-Pfade
    entfernen.
  - User-JWT als Caller authentifizieren; den internen Service-Role-Client nur
    für explizit auf diesen User begrenzte Datenbankzugriffe verwenden.
  - Report vollständig bauen, dann vorhandenen kanonischen Datensatz
    aktualisieren oder genau einen neuen anlegen.
  - Bestehende Range-Zeilen für denselben User als `0`, `1` oder `>1`
    klassifizieren: Insert, In-place-Update oder fail-closed.
  - `created_at` beim Replacement aus dem bestehenden Payload erhalten oder
    nach `D-18` einmalig ableiten; `generated_at`, `ts`, Zeitraum und Inhalt
    konsistent erneuern. Den aus `ts` generierten `day` nur prüfen, niemals
    direkt schreiben.
  - Unique-Konflikt bei paralleler Erstanlage mit genau einem Refetch-/Update-
    Versuch kontrolliert behandeln.
  - Mehrere vorgefundene Range-Zeilen fail-closed ablehnen.
  - Fehler vor oder während des Writes verändern keinen gültigen Altbericht.
  - Request- und Lifecycle-Tests decken Auth-Grenzen, Zero-State,
    Replacement, stabile ID/Erstzeit, Build-/Read-/Write-Fehler,
    Mehrfachdrift und den begrenzten `23505`-Retry ab.
- Review:
  - `Full`.
- Invalidation:
  - `T-1`, `T-2`, `EV-L01`, `EV-L02`.
  - Report-Request-, Medication-, Auth-, Atomaritäts- und Concurrency-Tests.
- Gate:
  - `none`; Deploy erst in S5.

Ergebnis und Review:

- Request- und Lifecycle-Vertrag sind env-frei extrahiert; `index.ts` übernimmt
  Authentisierung, User-gescopte Supabase-Zugriffe und Response-Mapping.
- Leere, ungültige, nicht objektförmige, Monthly-, `month`-, Service-Role-,
  ungültige und zukünftige Requests werden vor einem Write abgelehnt.
- Ein vollständiger Build läuft vor dem ersten Singleton-Read/Write. Danach
  gelten `0 = Insert`, `1 = In-place-Update`, `>1 = fail-closed` und genau ein
  kontrollierter `23505`-Refetch-/Update-Versuch.
- `created_at`, `generated_at`, stabile ID und generated `day` besitzen
  explizite Prüfungen; `day` wird nie direkt geschrieben.
- Review-Finding `S4.2-F1`: Zwei tote Monatsreste in BP-/Aktivitätsbeschreibung
  gefunden und auf reinen Zeitraumvertrag reduziert.
- Review-Finding `S4.2-F2`: Deno-Typinferenz und drei `require-await`-Lintfehler
  in Test-Mocks korrigiert.
- Review-Finding `S4.2-F3`: Build-before-write war strukturell erfüllt, aber
  nicht automatisiert belegt. Produktiv verwendete Orchestrierungsfunktion und
  Negativtest ergänzt.
- Deno Check, Lint und Format sind grün; `18/18` Request-/Lifecycle-Tests
  bestehen. Kein Deploy und kein produktiver Write erfolgte.

Exit: `ERFÜLLT` - Der lokale Edge-Vertrag besitzt keinen Monthly-Write-Pfad und
erzwingt den Singleton-Lifecycle; die dauerhafte Concurrency-Invariante folgt
mit dem partiellen Unique-Index in S4.3.

### S4.3 - Canonical SQL und Transition

Reasoning: `GPT-5.6 Sol / Extra High`.

Status: `DONE`; Full SQL/Security/Contract Review nach Korrektur `PASS`.

- Vertrag:
  - `D-4`, `D-6` bis `D-8`, `D-14`, `D-22`, `D-23`, `D-26`, `D-28`.
  - `F-4`, `F-5`, `F-14`, `F-16`, `F-17`.
- Dateien:
  - `sql/19_Report_Lifecycle.sql`.
  - `sql/transition_report_lifecycle_singleton.sql`.
  - `sql/tests/19_Report_Lifecycle_fixture.sql`.
  - `sql/HOW_TO.md`.
- Umsetzung:
  - Nicht destruktiver Fresh-Setup-Vertrag für
    `uq_events_range_report_per_user` auf `user_id` mit exakt dem Prädikat
    `type = 'system_comment'` und
    `payload->>'subtype' = 'range_report'`.
  - Explizite Bestands-Transition mit Preconditions, Canonical-Auswahl,
    Monthly-/Duplicate-Cleanup und Index-Erzeugung in einer Transaktion.
  - Früher `SHARE ROW EXCLUSIVE`-Lock, kurze Timeouts und Vergleich mit dem
    owner-freigegebenen Snapshot-Inventar vor dem ersten Delete.
  - Regulären partiellen Unique-Index atomar erzeugen; keinen
    `CONCURRENTLY`-Pfad verwenden.
  - Indexdefinition im Katalog exakt prüfen; `IF NOT EXISTS` allein genügt
    nicht.
  - Harte Stop-Bedingungen bei unerwartetem Schema oder User-Set,
    Inventardrift, anderer Löschwirkung oder nicht reproduzierbarer
    Canonical-Auswahl.
  - Disposable Fixture deckt Zero-State, Monthly-only, Range-Duplikate,
    synthetische Ownership-Isolation, ungültige Reports, Tie-Breaks,
    Fehlerrollback, Indexwirkung, exakte Katalogdefinition und idempotenten
    Zweitlauf ab.
- Review:
  - `Full`.
- Invalidation:
  - `T-1`, `T-3`, `EV-L01`, `EV-L03`.
  - Disposable SQL-Fixtures, RLS/ACL, Advisor und Fresh-Setup-Reihenfolge.
- Gate:
  - `none`; produktive Ausführung erst in S5.

Ergebnis und Review:

- `19_Report_Lifecycle.sql` erzeugt ausschließlich den exakt geprüften
  partiellen Unique-Index und lehnt Duplikate sowie gleichnamige
  Fehldefinitionen fail-closed ab.
- Die PSQL-Transition prüft owner-freigegebenes Inventar, RLS, Schema,
  Canonical-IDs und Löschmengen unter kurzem Write-Lock; Cleanup und
  Indexerzeugung bleiben atomar.
- `sql/tests/19_Report_Lifecycle_fixture.sql` besteht auf PostgreSQL 17 für
  Zero-State, Monthly-only, synthetische Ownership-Isolation, Invaliddaten,
  Tie-Break, Inventardrift, erzwungenen Rollback, Index-Scope und idempotenten
  Zweitlauf.
- Separater Zwei-Session-Test: konkurrierender `ROW EXCLUSIVE`-Lock führt nach
  `5s` zum erwarteten Transition-Abbruch; Report-Count und Indexdefinition
  bleiben unverändert.
- Review-Finding `S4.3-F1`: `pg_catalog.coalesce(...)` war ungültig, weil
  `COALESCE` Spezialsyntax ist. Alle betroffenen S4.3-Pfade korrigiert.
- Review-Finding `S4.3-F2`: Das Fixture verwendete seinen Inventar-Helper vor
  dessen Erzeugung und schützte `NULL`-Subtypen nicht eindeutig. Unabhängigen
  Fixture-Oracle und nullsichere Report-Klassifikation ergänzt.
- Review-Finding `S4.3-F3`: Schema-/RLS-Preflight und explizite UTC-Zeitzone
  fehlten. Fail-Closed-Schema-Prüfung und deterministische Fingerprint-
  Zeitzone ergänzt.
- Review-Finding `S4.3-F4`: Fresh-Setup-Duplikate und Monthly-only waren im
  Fixture nur indirekt abgedeckt. Beide Negativ-/Spezialpfade ergänzt.
- Markdownlint ist für Roadmap/Evidence mit `0` Findings grün; die
  `sql/HOW_TO.md` behält exakt ihre bereits vor S4.3 vorhandene Baseline von
  `35` historischen Strukturfindings und erhält keine neue Lintschuld.
- Kein produktives SQL, Deploy oder Remote-Workflow-Change erfolgte.

Exit: `ERFÜLLT` - Fresh Setup und produktive Transition besitzen getrennte,
lokal vollständig getestete SQL-Verträge.

### S4.4 - Monthly-Workflow lokal stilllegen

Reasoning: `GPT-5.6 Sol / High`.

Status: `DONE`; Consumer-/Recovery-/Contract Review nach Korrektur `PASS`.

- Vertrag:
  - `D-5`, `D-10` bis `D-13`, `D-21`, `F-2`, `F-7`, `F-8`, `F-13`,
    `F-18`, `F-21`.
- Dateien:
  - `.github/workflows/monthly-report.yml`.
  - `docs/qa/runbooks/midas-minimal-recovery.md`.
  - review-only: `backend/README.md`, `docs/DEV_ENVIRONMENT.md`.
- Umsetzung:
  - Workflow-Datei entfernen.
  - Recovery-Rekonstruktions- und Secret-Inventare auf Range-only
    korrigieren; Edge-Function-Name und Sourcepfad bleiben bestehen.
  - RB-006 für destruktive Report-Cutover um den geschützten Report-Extrakt und
    sein redigiertes Inventar ergänzen.
  - Gemeinsam genutzte Service-Role-Verwendungen ausdrücklich erhalten.
  - Backend-README und Dev Environment nur ändern, falls sie nach dem lokalen
    Abbau tatsächlich einen Monthly-Scheduler behaupten; Deno-Check und
    Function-Source bleiben gültig.
  - Root-README, Module Overviews, QA-Testfälle, Changelog und finalen
    Runtime-Stand noch nicht vorwegnehmen; diese gehören S6.
- Review:
  - `Consumer`.
- Invalidation:
  - `T-1`, `EV-L01`.
  - Workflow-Inventar, Recovery-Vertrag, Backend-Source-Liste.
- Gate:
  - `none`; Remote-Disable und Secret-Delete erst in S5.

Ergebnis und Review:

- `.github/workflows/monthly-report.yml` ist lokal entfernt; die drei
  unabhängigen Workflows für Incident Push, Protein und Trendpilot bleiben
  samt gemeinsam genutztem `SUPABASE_SERVICE_ROLE_KEY` unverändert.
- RB-006 entfernt `MONTHLY_REPORT_USER_ID` und `REPORTS_URL` aus den
  Rekonstruktionsinventaren, behält `midas-monthly-report` als manuell
  aufgerufene Range-only-Edge und rekonstruiert keinen Report-Scheduler.
- Der destruktive Report-Cutover verlangt zusätzlich zum logischen Dump einen
  geschützten JSONL-Extrakt, ein deterministisches Inventar, `day`-Prüfung,
  Archiv-/Sidecar-Nachweis und bereinigtes Klartext-Staging.
- Review-Finding `F-29`: Die erste Extraktbeschreibung definierte weder die
  kanonische Zeile noch eindeutig, ob reguläre Recovery-Bundles die
  Cutover-Dateien benötigen. Kanonisierung und optionale reguläre Verwendung
  wurden präzisiert.
- `backend/README.md` und `docs/DEV_ENVIRONMENT.md` nennen nur die weiterhin
  existierende Function-Source und ihre Deno-Prüfung; keine Änderung nötig.
- Runbook-Markdownlint, lokaler Workflow-/Secret-Scan und `git diff --check`
  sind grün. Keine produktive Aktion wurde ausgeführt.

Exit: `ERFÜLLT` - Repo und Recovery-Vertrag rekonstruieren keinen
Monthly-Scheduler mehr.

### S4.5 - Integrierter Full Review

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - gesamter Ziel-, Security-, Cutover- und Recovery-Vertrag.
- Dateien:
  - gesamter In-Scope-Diff.
- Umsetzung:
  - Code-, SQL-, Security-, Consumer-, Fresh-Setup- und Doku-Review.
  - Findings korrigieren und invalidierte Checks wiederholen.
- Review:
  - `Full`.
- Invalidation:
  - `T-1` bis `T-4`, `EV-L01` bis `EV-L04`.
- Gate:
  - `none`.

Ergebnis und Full Review:

- Der vollständige In-Scope-Diff erfüllt den Single-User-, Range-only-,
  Build-before-write-, Singleton-, Cutover- und Recovery-Vertrag.
- Review-Finding `F-30`: Der Edge-Catch klassifizierte bislang auch interne
  Datenbank-, Build- und Lifecycle-Fehler als HTTP `400`. Die Statusauflösung
  liefert nun ausschließlich für `RequestContractError` den festgelegten
  `4xx`-Status und für alle internen Fehler `500`.
- Node-Syntax ist für sieben betroffene UI-/API-Module grün; Deno Check, Lint
  und Format sind grün; die Request-/Lifecycle-Suite besteht `19/19` Tests.
- Das vollständige PostgreSQL-17-Fixture ist erneut mit Exit `0` und
  `S4.3 fixture PASS` durchgelaufen.
- Der fokussierte Consumer-Test bestätigt Validierung, Pagination über
  verworfene Altzeilen und HTML-Escaping. DOM-IDs, aktive Altpfade, lokale
  Workflow-Grenze, Markdownlint und `git diff --check` sind grün.
- Der interaktive Browser-Smoke bleibt bewusst `T-4` in S5; die statischen und
  isolierten Consumer-Anteile von `EV-L04` wurden erneut bestätigt.
- Kein Deploy, kein produktives SQL, kein Remote-Disable, kein Secret-Delete
  und kein produktiver Write erfolgte in S4.5.

Exit: `ERFÜLLT` - Kein offenes In-Scope-P0/P1 vor S5; produktive Wirkung
bleibt null.

## S5 - Tests, produktiver Cutover und Abschlussreview

Reasoning: `GPT-5.6 Sol / Extra High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-1 | lokal | Syntax, Deno, Markdownlint, Workflow-/Altpfadscan und Diff-Hygiene | PASS | EV-L01 | gesamter Diff |
| T-2 | local-runtime | Range-only, Auth, Build-before-write, Update/Insert, Fehlererhalt und Concurrency | PASS | EV-L02 | Edge/Tests |
| T-3 | disposable DB | Strict Canonical, Drift-/Lock-Vertrag, Cleanup, Rollback, exakter Unique-Index, RLS/ACL und Zweitlauf | PASS | EV-L03 | SQL |
| T-4 | Browser | Current Report, Neuer Bericht, kein Archiv/Monthly, Unlock, Export und Fehlerzustände | PASS | EV-L04 | UI/API |
| T-5 | produktiv read-only | Zähler, Inventar/Fingerprints, Canonical-ID, Löschmenge, Schema/ACL/RLS, Edge-, Workflow- und Secret-Namen | PASS | EV-PRE01 | Remote-Zustand |
| T-6 | produktiv read-only | Frisches RB-006-Bundle mit Report-Extrakt und Inventar erzeugen; Archiv und Prüfsummen verifizieren | DEFERRED (OWNER) | EV-W01 | Report-Bestand |
| T-7 | GitHub remote | Monthly-Workflow deaktivieren; null queued/in-progress Runs und unverändertes Report-Inventar belegen | PASS | EV-W02 | Workflow |
| T-8 | Supabase deploy | Range-only-Edge deployen; OPTIONS/Auth-/Invalid-Smokes | PASS | EV-R01 | Edge |
| T-9 | produktiv SQL | Inventar unter Write-Lock revalidieren; Cleanup und regulären Unique-Index atomar ausführen | PASS | EV-W03 | Schema/Bestand |
| T-10 | produktiv write | Bei Zero-State Arzt-Bericht anlegen, danach ersetzen; exakt eine Zeile, stabile ID und Fehlererhalt belegen | PASS | EV-W04 | Edge/SQL |
| T-11 | Konfiguration | `MONTHLY_REPORT_USER_ID` und `REPORTS_URL` gezielt entfernen | PASS | EV-W05 | Secrets/Workflow |
| T-12 | Review | Advisor, Counts, Workflow, Edge, Browser und Full Review final | PASS | EV-R02/EV-F01 | T-8 bis T-11 |

<!-- markdownlint-enable MD013 -->

Cutover-Reihenfolge:

1. `T-1` bis `T-5` grün.
2. `G-1` und `T-6`: frisches Recovery-Bundle samt Report-Extrakt und
   Rollback-Inventar.
3. `G-2` und `T-7`: Remote-Workflow deaktivieren, aktive Runs ausschließen und
   Report-Inventar erneut vergleichen.
4. `G-3` und `T-8`: Edge deployen und write-frei prüfen.
5. `G-4` und `T-9`: Inventar unter Write-Lock revalidieren; Cleanup und
   regulären Index atomar ausführen.
6. `G-5` und `T-10`: bei produktivem Zero-State kontrollierte Erstanlage und
   anschließendes Replacement; andernfalls kontrolliertes Replacement.
7. `G-6` und `T-11`: ausschließlich tote Monthly-Secrets entfernen.
8. `T-12`: Postconditions und finaler Full Review.

Postconditions:

- `monthly_report = 0`.
- `range_report` für den produktiven Owner in `0..1`.
- Partieller Unique-Index vorhanden und gültig.
- Monthly-Workflow remote deaktiviert oder nicht mehr vorhanden.
- Range-only-Edge aktiv; Service-Role- und Monthly-Requests erzeugen keinen
  Bericht.
- Interne Reads/Writes der Edge bleiben auf den authentifizierten User
  begrenzt.
- `SUPABASE_SERVICE_ROLE_KEY` und andere Scheduler bleiben unverändert.
- Ein fehlgeschlagener Report-Smoke verändert ID, Payload und Zeitanker des
  gültigen Berichts nicht.
- Der erfolgreiche Smoke ersetzt Inhalt und Zeitraum, ohne eine zweite Zeile
  anzulegen.
- Beginnt der Cutover ohne Range-Bericht, erzeugt der erste kontrollierte Write
  genau eine Zeile und der zweite aktualisiert dieselbe ID.
- Count und DB-seitiger Fingerprint aller Nicht-Report-Zeilen sind vor und nach
  dem Cutover identisch.
- Workflow-State ist deaktiviert und es existiert kein Monthly-Run in
  `queued` oder `in_progress`.
- Indexname, Unique-Flag, Schlüsselspalte und Prädikat entsprechen exakt dem
  versionierten Vertrag.

Rollback:

- Vor `T-9`: vorherige Edge aus dem geschützten Pre-Cutover-Inventar
  wiederherstellen; den Workflow erst danach bewusst reaktivieren.
- Fehler innerhalb `T-9` rollen Deletes und Index gemeinsam zurück.
- Nach Commit von `T-9` gilt der gekoppelte S3-Rollback: Reportwrites stoppen,
  Index entfernen und Snapshotzeilen in einer Transaktion restaurieren, alte
  Edge deployen, Monthly-Secrets rekonstruieren und Workflow zuletzt
  reaktivieren. Bevorzugt bleibt Fix-forward.
- Gelöschte Reportzeilen und ihr Cutover-Inventar liegen im ACL-geschützten
  Staging. Das frische verschlüsselte Archiv wurde durch den Owner auf einen
  separaten Recovery-Termin verschoben; das vorherige Archiv samt Sidecar
  bleibt gültig. Gesundheits-Rohdaten wurden nicht verändert.
- Entfernte Secret-Namen werden bei echtem Rollback aus ihren kanonischen
  Systemen neu gesetzt, niemals aus Logs oder Evidence rekonstruiert.

Ergebnis und Full Review:

- `T-1` bis `T-5` und `T-7` bis `T-12` sind `PASS`.
- Die produktive Datenbank enthält null Monthly- und genau einen
  Range-Bericht. ID und Erstzeit blieben beim Replacement stabil; der Inhalt
  wurde aktualisiert.
- Der Singleton-Index ist eindeutig, gültig, bereit, auf `user_id` begrenzt
  und besitzt das exakte geprüfte Prädikat. RLS, vier Owner-Policies,
  authentifizierte CRUD-Rechte und fehlender Anon-Read sind unverändert.
- Der Monthly-Workflow ist remote manuell deaktiviert; queued und in-progress
  stehen jeweils auf null. Alle anderen Workflows bleiben aktiv.
- Die aktive Edge ist Version 50 und JWT-geschützt. OPTIONS `200`, fehlende
  Auth `401` und Service Role `403` sind bestätigt; alle drei produktiven
  Quelldateien sind remote/lokal SHA-256-identisch.
- Die zwei exklusiven Monthly-Secrets fehlen; gemeinsam genutzte Secrets sind
  weiterhin vorhanden.
- Security Advisor: nur die bekannte, im Free-Plan nicht behebbar aktivierbare
  Leaked-Password-Warnung. Performance Advisor: keine Warnung.
- `T-6` ist nicht `PASS`: Das neue verschlüsselte Archiv wurde nach
  wiederholbarer Fehlfunktion der bisherigen Passwortübergabe bewusst
  verschoben. Geschütztes Staging und Rollback-Kontext bleiben als
  Risikominderung erhalten; der temporäre, ungetestete Helper wurde entfernt.

Exit: Produktiver Cutover, `F-32`-Redeploy und Full Review sind abgeschlossen.
`F-31` bleibt als bewusst akzeptierte P2-Recovery-Abweichung für einen
separaten Termin offen.

## S6 - Doku-Sync, Rückkehr zur Doctor View und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Root-README sowie Doctor View, Reports, Activity, Medication, Protein,
   State Layer und betroffene Backend-Overviews nur mit bewiesenem finalem
   Vertrag synchronisieren.
2. `docs/qa/health-capture-reports.md` auf Singleton-, Replacement-,
   Atomaritäts- und No-Monthly-Vertrag aktualisieren; insbesondere die
   ungültigen Monthly-/Inbox-Verträge `HCR-008` und `HCR-011` ersetzen oder
   entfernen, ohne IDs für andere Aussagen wiederzuverwenden.
3. SQL-HOW-TO, Recovery-Runbook und DEV_ENVIRONMENT mit realem Runtime-Stand
   abgleichen.
4. Evidence finalisieren; keine sensiblen Payloads oder Secret-Werte
   dokumentieren.
5. Kurzen Owner-Recap zu Singleton, Index, Cleanup, Workflow und künftigem
   Verhalten schreiben.
6. Finalen Full Contract Review durchführen und Findings korrigieren.
7. Bemerkenswerte Änderung unter `Unreleased` in `CHANGELOG.md` erfassen.
8. Doctor-View-Roadmap wieder freigeben:
   - T-9 prüft Replacement statt zusätzlichem Insert.
   - Erwartung: genau ein aktueller Arzt-Bericht.
9. Resume Card abschließen und Committext aus dem realen Diff ableiten.
10. Roadmap und Evidence als `(DONE)` nach `docs/archive/` verschieben.

Ergebnis:

- Source-of-Truth-Sync:
  - Root-README, Doctor View, Reports, Activity, Medication, Protein und State
    Layer beschreiben denselben Range-only-Singleton-Vertrag.
  - SQL-HOW-TO, Recovery-Runbook und DEV_ENVIRONMENT wurden gegen den realen
    Runtime-Stand geprüft; keine widersprechende Rekonstruktion blieb zurück.
- Finaler Review:
  - Edge Version 50, Datenbank-Singleton, deaktivierter Workflow, entfernte
    Monthly-Secrets, UI, QA, Evidence und Changelog sind widerspruchsfrei.
  - Kein offenes In-Scope-Finding; `F-31` bleibt bewusst deferred.
- Restrisiken:
  - `W-1` technischer Legacy-Endpunktname.
- Changelog-Relevanz:
  - `Unreleased`, ohne Release-Cut.
- Owner Recap:
  - MIDAS speichert höchstens einen aktuellen Arztbericht.
  - Der Bericht wird vollständig gebaut, bevor der Bestand verändert wird.
  - Ein erfolgreicher Neuaufbau ersetzt dieselbe Zeile in-place.
  - Ein Fehler bewahrt den letzten gültigen Bericht.
  - Der partielle Unique-Index verhindert einen zweiten Range-Bericht.
  - Alte Monatsberichte wurden einmalig entfernt.
  - Der Monatsworkflow ist deaktiviert und lokal gelöscht.
  - Exklusive Monthly-Secrets wurden entfernt; Shared Secrets blieben erhalten.
  - Gesundheits-Rohdaten wurden durch den Cutover nicht verändert.
  - Der technische Edge-Name bleibt vorerst aus Kompatibilitätsgründen.
  - Das Recovery-Archiv-Thema `F-31` bleibt ein separater, akzeptierter Termin.
- Archiv:
  - Roadmap und Evidence unter `docs/archive/`.
- Commit-Empfehlung:

```text
refactor(reports): simplify doctor report lifecycle
```

Exit: `ERFÜLLT` - Code, SQL, Runtime, Workflow, Recovery, QA und
Doctor-View-Roadmap beschreiben denselben Range-only-Singleton-Vertrag.

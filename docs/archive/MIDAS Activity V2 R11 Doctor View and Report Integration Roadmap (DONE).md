# MIDAS Activity V2 R11 Doctor View and Report Integration Roadmap

Diese Roadmap integriert den bewiesenen Activity-V2-Speichervertrag in die
medizinischen Read-only-Consumer, ohne den Arztbericht in einen Fitnessbericht
zu verwandeln. R11 bereitet einen gemeinsamen V1-/V2-Lesevertrag vor, hält die
sichtbare Informationshierarchie ruhig. Protein Target und Trendpilot bleiben
R12, die read-only Consumeraktivierung bleibt R13 und der finale
Activity-V2-Capture-Cutover bleibt R14 vorbehalten.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE; S1-S6 PASS; archiviert am 2026-08-23` |
| Modul / Bereich | `Activity V2 / Doctor View / Range-Arztbericht / Health Export` |
| Owner / Kontext | `Stephan; private Single-User-PWA für den eigenen CKD- und Arztkontext` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-22` |
| Letzter Stand | `2026-08-23; S1-S6 vollständig PASS; SQL25 exakt einmal produktiv und read-only postgeprüft; Source-of-Truth, HCR-029, SQL-HOW-TO und Unreleased synchronisiert; keine Activity-/Report-DML und kein Consumerdeploy` |
| Aktueller Schritt | `DONE; R12 Protein Target and Trendpilot Compatibility ist das einzige nächste Core-Gate` |
| Risikoklasse | `R3`; medizinischer Reportconsumer, Health-Export-Schema, read-only SQL-/ACL-Vertrag und Edge-Code betroffen |
| Standard-Reviewtiefe | `Full`; S4 grundsätzlich Delta/Consumer gemäß Workflow-Vertrag |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `Roadmap-Erstellung und initialer Review: Extra High; S1-S4R: Extra High; S4.2 und S4.4: Extra High; S5: Extra High` |
| Autonome Discovery Wave | `S1-S4R` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `eingefroren in S4R: sql/25_Activity_Consumer_Compatibility.sql samt Rollback/Fixture; sql/16_Explicit_Grants.sql erst S4.6; neue activity-consumer Contract-/Data-Access-Dateien unter Activity V2; neue unreferenzierte Doctor-/Health-V3- und Edge-Module/Harnesses; bestehende Product-Doctor-/Edge-Handler bleiben unverändert` |
| Deploy relevant | `ja`; produktiv lief exakt SQL 25; kein Web-, Edge-, Service-Worker- oder APK-Deploy in R11 |
| Produktive Schreibwirkung | `ja; exakt eine additive read-only Function samt ACL plus erwarteter Supabase-Migration-History-Eintrag, keine fachliche Activity-DML und keine Report-Neuerzeugung durch den Agenten` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `docs/archive/MIDAS Activity V2 R11 Doctor View and Report Integration Evidence (DONE).md` nach S6-Archivierung |
| Gekoppelte Roadmaps | `R10 liefert den getrennten Coaching-Export; R12 bereitet Protein Target/Trendpilot vor; R13 aktiviert read-only Consumer; R14 besitzt den Capture-Cutover` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R11 Doctor View and Report Integration Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `R11 deterministisch bis zum jeweils freigegebenen Gate abarbeiten.`
- Modell und Reasoning:
  - `GPT-5.6 Sol; Standard High; Ausnahmen laut Metadaten und Statusmatrix.`
- Kontextübergabe aus dem Denkraum:
  - `PASS: Produktumfang, sichtbarer Arztbericht und Nicht-Ziele stehen in
    dieser Roadmap. Der Denkraum ist keine zusätzliche Source of Truth.`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  5. `docs/Future trainingsmodule update thoughts.md`, Abschnitte R11-R14
  6. `docs/modules/Activity Module Overview.md`
  7. `docs/modules/Doctor View Module Overview.md`
  8. `docs/modules/Reports Module Overview.md`
  9. `docs/qa/health-capture-reports.md`, besonders HCR-028 und freie Folge-ID
  10. `archivierte R10-Roadmap und R10-Evidence nur für den bewiesenen
      Postimage-/Isolationvertrag`
  11. `git status --short, realer Code und nur der relevante Diff`
- Startschritt:
  - `S1`
- Freigegebener autonomer Block:
  - `S1-S4R`
- Interne Continuation Gates:
  - `Nach S1, S2 und S3 jeweils Full Review, Findings-Korrektur, Statusmatrix
    und Resume Card aktualisieren. Bei PASS ohne Owner-Gate automatisch
    fortfahren. Nach S4R stoppen.`
- Erlaubte Autonomie:
  - `lokale Reads, Roadmap-/Evidence-Updates, read-only Systemabfragen und
    lokale/disposable Tests gemäß Tool Permissions`
- Owner-Gates:
  - `produktives SQL 25; jeder unerwartete Deploybedarf; Scope-Ausweitung`
- Stop-Bedingungen:
  - `ungeklärte Browser-/Edge-ACL-Grenze, unstimmiger V1-/V2-Zählvertrag,
    stiller Health-Export-v2-Bruch, notwendige Produktaktivierung vor dem
    zugewiesenen R13-/R14-Gate oder
    nicht erteilte produktive Freigabe`
- Halluzinationsschutz:
  - `Keine Tabellen, RPCs, Payloadfelder, Feature Flags oder Deploystände
    annehmen. Reale Sources prüfen und technische Form erst in S2/S4R frieren.`
- Startprompt:

```text
Arbeite die MIDAS Activity V2 R11 Doctor View and Report Integration Roadmap
gemäß ihrer Ausführungs-Chat-Startkarte ab. Lies die festgelegten Quellen in
der angegebenen Reihenfolge, prüfe Git- und Systemstand und beginne mit S1.
Führe die Discovery Wave S1-S4R über ihre internen Continuation Gates
deterministisch aus. Schließe jeden Hauptschritt mit Full Review,
Findings-Korrektur, Statusmatrix- und Resume-Card-Sync ab. Erfinde keine
fehlenden Daten-, ACL- oder Reportverträge. Stoppe nach dem Readiness-Urteil;
beginne S4 nur mit separater Freigabe. Führe kein produktives SQL und keinen
Deploy ohne explizites Owner-Gate aus.
```

## Session Resume Card

- Ziel:
  - `V1 und V2 über einen ruhigen, gemeinsamen Read-only-Consumervertrag für
    Doctor View, den Range-Arztbericht und einen isolierten Health Export V3
    vorbereiten, ohne die produktiven Consumer vor R13 umzuschalten.`
- Unveränderliche Verträge:
  - `Arztbericht bleibt report-first und in 60-90 Sekunden erfassbar.`
  - `Keine Sätze, Reps, Gewichte, Volumen oder Trainingsempfehlungen im Bericht.`
  - `R10-Coaching-Export bleibt getrennt; R12 bereitet medizinische
    Folgeconsumer vor, R13 aktiviert read-only Consumer und R14 besitzt den
    Capture-Cutover.`
  - `Keine Activity-/Report-DML durch Tests oder produktive Aktionen in R11.`
- Erledigter Stand:
  - `R10-DONE-Postimage und aktuelle Doctor-/Report-/Health-Export-V2-Verträge
    wurden für die Roadmap-Erstellung abgeglichen.`
  - `Initialer Roadmap Contract Review: PASS.`
  - `S1 PASS: Pflichtlesereihenfolge vollständig abgearbeitet; Browser-, Edge-,
    SQL-, Doctor-, Report- und Export-Istverträge am Repository verifiziert.`
  - `Produktiv read-only bestätigt: PostgreSQL 17.6/UTC, 65 V1-Activity-
    Events, V2 Sessions/Items/Sets 0/0/0, R10-Functiondef-Hash unverändert,
    RLS/ACL wie dokumentiert und kein R11-SQL-Objekt installiert.`
  - `Baselinechecks PASS: Activity-V2-Isolation 4/4 und bestehende Edge-
    Request-/Report-Lifecycle-Tests 22/22.`
  - `S2 PASS: activity_consumer_snapshot(date,date),
    midas.activity-consumer.v1, Reportcopy/-Keysets, Doctor-Deletegrenze,
    midas.health-export.v3 und die unverdrahtete R13-Seam exakt eingefroren.`
  - `S3 PASS: BOLA/RLS/ACL, Zähl-/Zeitsemantik, Report-Fail-closed,
    Doctor-Lifecycle, V2/V3-Backcompat, Produktisolation, SQL-Rerun/Rollback,
    0-DML-Testgrenze und Invalidation Map red-geteamt.`
  - `S4R PASS: S4.1 GO; S4.2-S4.6 CONDITIONAL GO nur nach ihren jeweils
    dokumentierten Vorgänger-PASS; kein NO-GO und kein aktuelles Owner-Gate.`
  - `S4-Dateigrenzen und sechs sichere Ausführungsblöcke sind im S4R-
    Paketvertrag eingefroren.`
  - `S4.1 PASS: AppModules.activityV2.consumer implementiert validateRange,
    compareUnits, aggregateUnits und validateSnapshot als pure, tief
    eingefrorene Contractbasis; gemeinsame Golden Fixtures decken Empty,
    V1-only, V2-only, Mixed und Same-day ab.`
  - `S4.1 Full Review PASS: 10/10 neue Contracttests und gemeinsam mit dem
    bestehenden Activity-V2-Isolationstest 14/14; F-ACT-R11-23/-24 korrigiert;
    gesamte Activity-V2-Contractsuite 247/247; Producthandler, SQL 16/24/25
    und Runtime bleiben unverändert.`
  - `S4.2 PASS: SQL 25 erzeugt exakt activity_consumer_snapshot(date,date)
    als postgres-owned STABLE SECURITY INVOKER mit leerem search_path und
    effektiv authenticated-only EXECUTE; V1-View, V2-Sessions und set-basierter
    Item-Count bleiben die einzigen Quellen.`
  - `S4.2 Full Review PASS: disposable PG17 Fresh/Rerun, Overload-/Source-/
    Owner-/Mode-/ACL-/View-/Policydrift, Auth/Anonymous, RLS/BOLA-Struktur,
    Empty, 400/401/Future, Source-Negativorakel und hash-gebundener Rollback
    grün; 25 Fixture-Assertions, 10/10 pure Consumerchecks und gesamte
    Activity-V2-Contractsuite 247/247.`
  - `Produktiv read-only erneut bestätigt: SQL 25 fehlt weiterhin; anon und
    service_role erben authenticated nicht; V1-Viewhash bleibt unverändert.`
  - `S4.3 PASS: AppModules.activityV2.consumerDataAccess.loadSnapshot lädt
    genau den JSONB-Singleton über activity_consumer_snapshot, erlaubt
    höchstens einen Auth-Refresh und validiert Antwort sowie Range strikt mit
    dem unveränderten S4.1-Consumer.`
  - `S4.3 Full Review PASS: T-ACT-R11-05 9/9, gemeinsam mit dem direkt
    mitinvalidierten Consumervertrag 19/19; Success, Empty, Auth-Exhaustion,
    SQL-Token, Config/API, Netzwerk, non-JSON, Partial/Extrakey, Abort und
    Stale-Fencing sind isoliert belegt. F-ACT-R11-30/-31 korrigiert.`
  - `S4.4 PASS: zehn neue unreferenzierte Doctor-/Edge-/Harnessdateien
    implementieren den report-first Doctor-Drilldown, strict JS-/TS-Parität,
    requestlokalen RLS-Loader, kompakte Range-Report-Copy und Build-before-write.`
  - `S4.4 Full Review PASS: T-ACT-R11-06 15/15, bestehende Edge-Verträge
    22/22, direkte Node-Verträge 17/17 sowie Browser-Plugin und versionierter
    Desktop-/390-/320-Smoke 3/3; Deno Check/Lint/Format, JS-Syntax,
    Produktload-/DML-/Deploy-Negativorakel PASS. F-ACT-R11-32 bis -35
    korrigiert; kein CodeRabbit gemäß Ownerentscheidung.`
  - `S4.5 PASS: das neue unreferenzierte AppModules.doctor.healthExportV3
    validiert den vollständigen V2-Postimagevertrag, baut exakt
    midas.health-export.v3 und liefert über injizierte V2-/Activity-Reads nur
    vollständige, tief eingefrorene Payloads oder stabile lokale Fehler.`
  - `S4.5 Full Review PASS: T-ACT-R11-08 8/8 und der gezielt erweiterte
    Playwright-Smoke einschließlich T-ACT-R11-07 5/5 auf Desktop/390/320;
    Ready/Empty/Read-Error, exakte Keysets, Privacy, Range, Sortierung und
    fehlende Blob-/URL-/Download-Seam belegt. F-ACT-R11-36 bis -39 korrigiert;
    kein CodeRabbit gemäß Ownerentscheidung.`
  - `S4.6 PASS: SQL 16 spiegelt den kanonischen SQL-25-RPC ausschließlich bei
    exakter Signatur, Functiondef, Hardening und ACL; Absenz bleibt zulässig,
    Partial-/Overload-/Source-/Hardening-/ACL-Drift failt geschlossen.`
  - `S4.6 Full Review PASS: disposable PostgreSQL 17.11
    (Debian 17.11-1.pgdg13+2) mit Absenz,
    Kanonisch, Rerun, fünf Driftklassen und Restore; bestehende Isolation 5/5
    plus finaler Contract 4/4, zusammen 9/9. Zehn Produktziele, 20 konkrete
    R10-Orakel, 20 isolierte R11-Ausgaben, 0 Productloads, 0 Test-DML und 0
    Secretmaterial belegt. F-ACT-R11-40 bis -42 korrigiert; kein CodeRabbit.`
  - `S5 T01-T10 PASS: finale Gesamtmatrix 276/276 Node, 37/37 Deno,
    Browser 5/5 und vollständige PG17.11-Fixture; nativer Full Review PASS.
    CodeRabbit 0.7.5 lief exakt einmal initial und einmal verifizierend über den
    vollständigen Diff. F-ACT-R11-43 bis -47 sind korrigiert; alle direkt
    invalidierten Node-/Deno-/PG17-/Isolationchecks sind grün.`
  - `S5 T11 PASS: produktiv SQL25 absent; V1 65 mit 0 ungültigen Quellen,
    Katalog 78/80, V2 Sessions/Items/Sets 0/0/0, ein bestehender Range-Report,
    SQL20-24 Owner/RLS/ACL/Hashes und bekannte Advisorbaseline unverändert.
    Report-Edge bleibt aktiv auf Version 50; kein Deploy oder Write.`
  - `S5 T12 PASS: Owner gab SQL25 SHA256
    77be7b9fb633d324a9f51f11640b015fcc54bea7e50dcf5392dc22ea424bc572
    explizit frei; genau ein produktiver Supabase-DDL-Lauf war erfolgreich.
    Kein Retry, SQL16, Fixture oder Rollback.`
  - `S5 T13 PASS: exakt eine date/date-Function mit Functiondef-SHA256
    f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d,
    postgres, JSONB, STABLE SECURITY INVOKER, leerem search_path und ACL nur
    postgres+authenticated. Authenticated Empty-Runtime und anonyme Ablehnung
    PASS; V1 65/invalid 0, Katalog 78/80, V2 0/0/0, Range-Report 1, R10,
    Advisors und Edge Version 50 unverändert.`
  - `S6 PASS: Activity-/Doctor-/Reports-Overviews, Masterplan, HCR-029,
    SQL-HOW-TO und Unreleased auf das reale R11-Postimage synchronisiert;
    finaler Diff-/Contract-/Security-/Consumerreview und direkt invalidierte
    Scopeguards grün; Roadmap und Evidence gemeinsam archiviert.`
- Aktueller Schritt:
  - `DONE.`
- Nächster erlaubter Schritt:
  - `Nach S6-DONE ausschließlich R12 Protein Target and Trendpilot
    Compatibility als nächstes Core-Gate planen.`
- Offene Findings:
  - `none in scope; F-ACT-R11-43 bis -50 sind geschlossen. Die bekannte
    Advisor-Watchlist bleibt unverändert.`
- Geänderte Dateien:
  - `drei neue unreferenzierte S4.1-Dateien, SQL25-Forward/Rollback/Fixture,
    zwei neue unreferenzierte S4.3-Dateien, zehn neue unreferenzierte S4.4-
    Doctor-/Edge-/Harnessdateien, zwei neue S4.5-Exportdateien plus gezielter
    Harness-/Browser-Smoke-Delta, drei S4.6-Dateideltas plus ein neuer finaler
    Contract, S6-Source-of-Truth-Dokumentation, diese Roadmap und Evidence;
    vorbestehende Benutzeränderungen wurden nicht zurückgesetzt.`
- Gültige Nachweise:
  - `EV-ACT-R11-B01 bis -B05 sowie EV-ACT-R11-D01, EV-ACT-R11-D02 und
    EV-ACT-R11-D03, EV-ACT-R11-D04, EV-ACT-R11-L01 bis -L10 und
    EV-ACT-R11-PRE01 bis -PRE05, EV-ACT-R11-W01 und EV-ACT-R11-R01 bis -R03;
    R10-DONE-Roadmap/Evidence und HCR-028 nur soweit unverändert referenziert.`
- Runtime-/Deploy-Stand:
  - `R10 SQL 24 und R11 SQL 25 produktiv; R11-Consumerdateien weiterhin
    unreferenziert; SQL 16 nur lokal geändert, kein Product-Wiring oder
    Deploy.`
- Offene Owner-Freigaben:
  - `none; SQL25-Gate wurde einmalig genutzt und ist geschlossen. Rollback,
    Retry, SQL16 oder jeder spätere Deploy benötigen ein neues Gate.`
- Empfohlene S4-Blöcke:
  - `A=S4.1 (PASS); B=S4.2 (PASS); C=S4.3 (PASS); D=S4.4 (PASS); E=S4.5
    (PASS); F=S4.6 (PASS). S4 und S5 sind vollständig abgeschlossen.`
- Fresh-Chat-Start:
  - `R11 ist nach S6 archiviert. Für die nächste Core-Arbeit den Activity-V2-
    Masterplan, HCR-029 und die archivierte R11-Roadmap/Evidence lesen; danach
    R12 aus dem bewiesenen Postimage planen. R13/R14 nicht vorziehen.`
- Stop-Bedingungen:
  - `R11 ist abgeschlossen. Jede nachträgliche SQL25-Änderung, jeder Rollback,
    Retry, SQL16-Lauf oder Consumerdeploy invalidiert das Postimage und
    benötigt eine neue Roadmap-/Ownerentscheidung.`

## Zielvertrag

Prüfbares Endergebnis:

- Ein versionierter, read-only V1-/V2-Consumervertrag liefert pro
  Activity-V1-Event beziehungsweise persistierter Activity-V2-Session genau
  eine normalisierte Aktivitätseinheit sowie deterministische
  Zeitraumssummen.
- `active_day_count` zählt unterschiedliche Wiener Kalendertage. Mehrere
  Einheiten desselben Tages erhöhen diesen Wert nicht mehrfach.
- Der isoliert bewiesene R11-kompatible Reportpfad erzeugt nur eine kompakte
  Aktivitätssektion: letzte Aktivität, aktive Tage pro Woche sowie Gesamt- und
  Durchschnittsdauer. Produktiv neu erzeugte Berichte bleiben bis zum
  R13-Edge-Deploy auf dem bestehenden V1-Pfad.
- Doctor View kann im sekundären Training-Drilldown normalisierte
  Sessionzusammenfassungen darstellen. Activity-V2-Sätze bleiben unsichtbar;
  Activity-V2-Korrektur und -Löschung bleiben ausschließlich R9-Verantwortung.
- Ein explizit versionierter Health Export V3 kann dieselben normalisierten
  Einheiten maschinenlesbar ausgeben. Der sichtbare Health Export V2 bleibt in
  R11 unverändert und aktiv.
- Alte gespeicherte Arztberichte bleiben unveränderte Snapshots. Nur neu
  erzeugte Berichte verwenden nach späterer Aktivierung den neuen Vertrag.
- R11 beweist die Integration lokal/disposable und darf höchstens den
  read-only SQL-/ACL-Unterbau produktiv installieren. Produktive
  Read-Consumer-Scriptloads, Edge-Deploy und Consumeraktivierung bleiben R13
  vorbehalten; Activity-V2-Capture-Load und finaler Cutover bleiben R14.

Bewusst unverändert:

- Activity V1 bleibt sichtbarer Capture- und Consumerpfad.
- R10 `midas.activity-coaching-export.v1` bleibt der vollständige Trainings-
  und Satzexport; er wird weder eingebettet noch umgebaut.
- Protein Target und Trendpilot bleiben R12. Activity-V2-Navigation,
  produktiver Saveflow, Service Worker und Android bleiben R14.
- Keine medizinische Interpretation, Diagnose oder Trainingsempfehlung.

## Problem und Ist-Zustand

- Doctor View, Range-Arztbericht und Health Export V2 lesen heute
  ausschließlich `v_events_activity` beziehungsweise Activity V1.
- Activity V2 besitzt seit R8/R9 einen stabilen Sessionvertrag und seit R10
  einen vollständigen Coaching-Export, ist aber absichtlich nicht mit
  medizinischen Consumern verbunden.
- Eine direkte Verwendung des R10-Vollpayloads würde Doctor View und Bericht
  mit Satzdetails überfrachten, die für den Arztkontakt keinen ausreichenden
  Nutzen besitzen.
- `Trainings/Woche` zählt heute V1-Einträge. Bei mehreren V2-Sessions an einem
  Tag wäre diese Formulierung für die gewünschte medizinische Übersicht
  missverständlich.
- Health Export V2 hat ein bestehendes öffentliches Keyset. Eine stille
  Bedeutungsänderung desselben Schemanamens wäre ein Contractbruch.
- Offene technische Hypothese:
  - `Die günstigste sichere gemeinsame Projektion kann eine
    security-invoker View, eine oder mehrere eng begrenzte RPCs oder eine
    gleichwertige Kombination sein. S2/S4R entscheidet dies aus dem realen
    Browser-/Edge-Authvertrag; die Roadmap erfindet die Form nicht vorab.`

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R11-01 | 2026-08-22 | Der Arztbericht bleibt auf 60-90 Sekunden Erfassbarkeit optimiert. | Arztkontext hat Vorrang vor Fitnessdetail. | Ziel / S2 / S4.4 |
| D-ACT-R11-02 | 2026-08-22 | Sichtbar bleiben nur letzte Aktivität, aktive Tage/Woche, Gesamtdauer und Durchschnitt/Einheit. | Ruhige, klinisch brauchbare Zusammenfassung. | Reportvertrag |
| D-ACT-R11-03 | 2026-08-22 | `Trainings/Woche` wird im neuen Vertrag zu `Aktive Tage/Woche`. | Mehrere Sessions desselben Tages dürfen die Aktivitätsfrequenz nicht aufblasen. | Aggregation / Copy |
| D-ACT-R11-04 | 2026-08-22 | Keine Übungen, Items, Sätze, Reps, Gewichte, Volumen, 1RM, Progression oder Empfehlungen im Arztbericht. | R10 und späteres Coaching besitzen diese Verantwortung. | Nicht-Scope |
| D-ACT-R11-05 | 2026-08-22 | V1-Event und V2-Session sind jeweils eine gespeicherte Aktivitätseinheit. | Keine erfundene Migration oder Detailrekonstruktion. | Read-Contract |
| D-ACT-R11-06 | 2026-08-22 | Derselbe Tag zählt einmal als aktiver Tag; gespeicherte Einheiten werden nicht heuristisch anhand Titel, Dauer oder Tag dedupliziert. | Heuristik könnte reale getrennte Einheiten löschen; R14 verhindert Dual Write beim Capture-Cutover. | Aggregation / Quality |
| D-ACT-R11-07 | 2026-08-22 | Dauer kommt bei V2 ausschließlich aus der Session, nie aus Item- oder Satzsummen. | Verhindert Mehrfachzählung. | SQL / Report / Export |
| D-ACT-R11-08 | 2026-08-22 | Keine Kraft-/Ausdauerverteilung in R11. | Erst reale V2-Nutzung kann den medizinischen Mehrwert belegen. | Report-Nicht-Scope |
| D-ACT-R11-09 | 2026-08-22 | Der Doctor-Drilldown darf kompakte Sessionmetadaten zeigen, aber keine V2-Mutation anbieten. | Detail bei Nachfrage, ohne zweite Trainingsverwaltung. | Doctor View |
| D-ACT-R11-10 | 2026-08-22 | Alte `range_report`-Zeilen bleiben gespeicherte Snapshots und werden nicht rückwirkend umgerechnet. | Reproduzierbarkeit und Report-Lifecycle bleiben stabil. | Reports |
| D-ACT-R11-11 | 2026-08-22 | Health Export V2 wird nicht still verändert; R11 bereitet ein neues V3-Schema isoliert vor. | Maschinenlesbare Rückwärtskompatibilität. | Health Export |
| D-ACT-R11-12 | 2026-08-22 | R10-Coaching-Export bleibt getrennt und wird nicht als Doctor-Datenquelle verwendet. | Unterschiedliche Zielgruppen und Detailtiefe. | R10/R11-Grenze |
| D-ACT-R11-13 | 2026-08-22 | Doctor-/Reportbereiche behalten den inklusiven 400-Tage-Vertrag; R10s 366-Tage-Grenze wird nicht wiederverwendet. | Bestehenden Consumervertrag nicht verkürzen. | Zeitvertrag |
| D-ACT-R11-14 | 2026-08-22 | R11 installiert keine sichtbare Produktaktivierung und keinen Edge-/Web-/APK-Deploy. | R13 besitzt die read-only Consumeraktivierung; R14 besitzt den Capture-Cutover. | Runtime-Gate |
| D-ACT-R11-15 | 2026-08-22 | Exakte View-/RPC-/Helper- und Service-Role-Form wird erst nach S1 in S2/S4R eingefroren. | Sicherheitsgrenze folgt dem realen System, nicht einer Denkraumannahme. | F-ACT-R11-08 |
| D-ACT-R11-16 | 2026-08-23 | Gemeinsamer Read ist exakt `public.activity_consumer_snapshot(p_from date, p_to date) returns jsonb`, Owner postgres, STABLE SECURITY INVOKER, `search_path=''`; EXECUTE nur authenticated. | Ein ownerloser JSON-Snapshot ist ein DB-Roundtrip, verhindert rowbasierte stille Trunkierung und vermeidet View-/Service-Role-Sonderpfade. | SQL 25 / F-ACT-R11-08 |
| D-ACT-R11-17 | 2026-08-23 | Der RPC akzeptiert keine User-ID und leitet den Owner ausschließlich aus einem nicht anonymen `auth.uid()`-Kontext ab. | BOLA und clientbestimmte Fremd-Owner sind strukturell ausgeschlossen. | SQL / Browser / Edge |
| D-ACT-R11-18 | 2026-08-23 | Der Edge verifiziert weiter zuerst den User-Bearer und verwendet für den Activity-RPC einen requestlokalen RLS-Client mit weitergereichtem Authorization-Header; der bestehende Adminclient bleibt nur für unveränderte Reportquellen und Persistenz. | Derselbe RPC kann ohne service_role-EXECUTE von Browser und Edge genutzt werden. | Edge / ACL |
| D-ACT-R11-19 | 2026-08-23 | Der gemeinsame Vertrag heißt `midas.activity-consumer.v1` und besitzt die unten eingefrorenen exakten Keysets; `user_id` wird nicht ausgegeben. | Versionierte, privacy-minimierte Parsergrenze für R11-R13. | Consumer / Export |
| D-ACT-R11-20 | 2026-08-23 | Ein Range umfasst 1-400 inklusive Wiener Kalendertage und endet nicht in der Zukunft; höchstens 1000 V2-Sessions werden vollständig geliefert, sonst Fail-closed. | Bestehende Doctorgrenze und begrenzter Browser-/Edge-Payload ohne stille Trunkierung. | SQL / Failure Modes |
| D-ACT-R11-21 | 2026-08-23 | Neue Range-Reports kennzeichnen nach R13 den Activity-Untervertrag in `meta.activity.schema_version`; `activity_series` enthält normalisierte Einheiten. Alte Reports und ihr Legacy-Keyset bleiben unverändert. | Snapshot- und Parserkompatibilität ohne rückwirkende Umdeutung. | Reportpayload |
| D-ACT-R11-22 | 2026-08-23 | Health Export V3 heißt exakt `midas.health-export.v3`, behält die nicht-Activity-Keysets von V2 und ergänzt die exakt definierten `activity_summary`-/`activity_quality`-Objekte sowie normalisierte `activities`. | Explizite Parserverzweigung statt stiller V2-Semantikänderung. | F-ACT-R11-09 |
| D-ACT-R11-23 | 2026-08-23 | R11 verwendet keinen Runtime-Feature-Flag: isolierte Module und injizierbare Builder bleiben produktiv unverdrahtet; R13 nimmt den expliziten Doctor-/Edge-Wiring-Delta vor. | Keine erfundene Konfiguration und keine vorgezogene Aktivierung. | R11/R13-Seam |
| D-ACT-R11-24 | 2026-08-23 | R11-Tests führen auch disposable keine INSERT/UPDATE/DELETE/MERGE auf Activity- oder Reportrelationen aus. Nichtleere Semantik kommt aus pure Fixtures; PG17 prüft DDL, Empty, Claims, Katalog, ACL/RLS und Rollback read-only. | Harte 0-DML-Grenze ohne Testlücke bei Contractlogik. | Tests / F-ACT-R11-16 |
| D-ACT-R11-25 | 2026-08-23 | `app/modules/doctor-stack/doctor/index.js` und `backend/supabase/functions/midas-monthly-report/index.ts` bleiben in R11 unverändert; neue Module/Harnesses sind unreferenziert. | Produktiver Doctor-/Edge-Pfad kann ohne Deploy oder stillen nächsten Web-Cut nicht umschalten. | Isolation / F-ACT-R11-17 |
| D-ACT-R11-26 | 2026-08-23 | Browser- und Edge-Adapter müssen rohe RPC-/Validatorfehler vor UI/Logger in stabile lokale Fehlerklassen umwandeln; gemeinsame Golden Fixtures beweisen Parser-/Aggregatorparität. | Keine Rohfehlerleaks und kein stiller JS-/TS-Contractdrift. | Security / F-ACT-R11-18/-19 |
| D-ACT-R11-27 | 2026-08-23 | SQL 25 sperrt und hasht alle gelesenen Activityrelationen vor/nach DDL, akzeptiert nur Fresh oder exakt kanonischen Rerun und besitzt einen hash-/ACL-gebundenen Drop-only-Rollback. | TOCTOU-, Drift- und destruktiver Rollbackschutz ohne fachliche DML. | SQL / Rollback |
| D-ACT-R11-28 | 2026-08-23 | `aggregateUnits(units, range, today?)` erzeugt den vollständigen kanonischen Snapshot; `validateSnapshot(snapshot, today?)` reaggregiert Summary und Quality. Der optionale Wiener Testtag dient nur deterministischen Pure-Tests; Runtimeconsumer lassen ihn weg. | Eine gemeinsame pure Projektionsbasis verhindert Sortier-, Formel- und Parserdrift zwischen SQL-Fixture, Browser und späterem Edge-Validator. | S4.1 / Consumer |

<!-- markdownlint-enable MD013 -->

## Kompakter Consumervertrag

### Normalisierte Aktivitätseinheit

Schema: `midas.activity-consumer.v1`.

Exaktes Top-Level-Keyset:

```text
schema_version, timezone, range, summary, quality, units
```

- `schema_version`: exakt `midas.activity-consumer.v1`
- `timezone`: exakt `Europe/Vienna`
- `range`: exakt `{ from, to, inclusive_days }`
- `summary`: exaktes Aggregationskeyset aus dem Folgeabschnitt
- `quality`: exakt `{ mixed_source_day_count, mixed_source_days }`
- `units`: Array normalisierter Einheiten

Exaktes Einheiten-Keyset, alle Keys immer vorhanden:

```text
source, id, day, occurred_at, label, duration_min, note, item_count
```

- `source`: exakt `activity_v1` oder `activity_v2`
- `id`: kanonische UUID der V1-Event- beziehungsweise V2-Sessionzeile
- `day`: kanonischer gespeicherter Wiener `YYYY-MM-DD`-Tag
- `occurred_at`: V1-`ts` beziehungsweise V2-`started_at`, UTC-RFC3339 mit
  Millisekunden und `Z`
- `label`: V1-`activity`; bei V2 der Sessiontitel oder der bestehende ruhige
  UI-Fallback `Training`
- `duration_min`: positive ganze V1-Eventdauer beziehungsweise V2-
  Sessiondauer 1-1440; niemals Item-/Satzdauer
- `note`: `null` oder die gespeicherte Event-/Sessionnotiz
- `item_count`: bei V1 exakt `null`, bei V2 ganze Zahl 0-50 aus einer
  set-basierten Kindzeilenzählung

Der Owner wird im RPC erzwungen, aber weder im Snapshot noch in Health Export
V3 als `user_id` ausgegeben. Die kanonische Sortierung ist aufsteigend nach
`day`, `occurred_at`, `source`, `id`. Consumer dürfen für eine sichtbare
Neueste-zuerst-Liste nur eine validierte Kopie deterministisch umkehren.

Nicht Teil dieser Projektion:

- Item- und Satzarrays
- Gewichte, Wiederholungen, Distanzdetails oder Katalogsnapshots
- Mutationstoken, Request-Fingerprints oder technische Child-IDs

### Aggregation

Exaktes Summary-Keyset:

```text
unit_count, active_day_count, active_days_per_week,
total_duration_min, average_duration_min, last_day
```

- `unit_count`: Anzahl normalisierter gespeicherter Einheiten als ganze Zahl.
- `active_day_count`: Anzahl unterschiedlicher `day`-Werte als ganze Zahl.
- `active_days_per_week`: `round(active_day_count * 7 / inclusive_days, 1)`.
- `total_duration_min`: ganzzahlige Summe der Einheitsdauern.
- `average_duration_min`: bei Daten
  `round(total_duration_min / unit_count, 0)`, sonst `null`; Durchschnitt je
  Einheit, nicht je aktivem Tag.
- `last_day`: größter gültiger `day`, sonst `null`.
- Empty ist exakt `unit_count=0`, `active_day_count=0`,
  `active_days_per_week=0`, `total_duration_min=0`,
  `average_duration_min=null`, `last_day=null`, leere Quality-Arrays und
  `units=[]`.
- Ein Mixed-Source-Tag zählt als ein aktiver Tag, behält aber beide
  gespeicherten Einheiten. `mixed_source_days` enthält solche Tage einmalig
  aufsteigend; `mixed_source_day_count` entspricht exakt seiner Länge.
- Keine Heuristik dedupliziert V1/V2-Einheiten. V1-only, V2-only, Mixed und
  mehrere Same-day-Einheiten verwenden dieselben Formeln.

Validatoren akzeptieren nur eigene, aufzählbare Datenproperties mit exakt
diesen Keysets, prüfen Typen, Grenzen, Sortierung und berechnen Summary/Quality
aus `units` erneut. Extrakeys, Accessors, inkonsistente Summen oder partielle
Payloads sind Fehler.

### SQL-/Caller- und Fehlervertrag

- Datei: `sql/25_Activity_Consumer_Compatibility.sql` samt gleichnamigem
  `_Rollback.sql`; Fresh-Build-/Provisioningspiegel in SQL 16.
- Exakt eine Function:
  `public.activity_consumer_snapshot(p_from date, p_to date) returns jsonb`.
- Owner `postgres`; `LANGUAGE plpgsql`; `STABLE`; `SECURITY INVOKER`;
  `SET search_path = ''`.
- Vor jedem Read muss `auth.uid()` vorhanden und der JWT-Claim
  `is_anonymous` exakt `false` sein. Es gibt keinen Ownerparameter.
- Datenquellen sind ausschließlich `public.v_events_activity` für V1,
  `public.health_activity_sessions` für V2 und eine set-basierte Zählung aus
  `public.health_activity_session_items`; Sets und R10-Export werden nicht
  gelesen.
- EXECUTE exakt für `authenticated`; explizit kein EXECUTE für `PUBLIC`,
  `anon` oder `service_role`. Bestehende V1-/V2-Tabellengrants und RLS bleiben
  unverändert und sind die zweite Schutzschicht.
- Browser: genau ein RPC-Read mit dem bestehenden User-Bearer und höchstens
  einem Auth-Refresh-Retry; keine Activity-DML.
- Edge nach R13: bestehender Bearer-Check zuerst, danach genau derselbe RPC über
  einen requestlokalen, mit diesem Authorization-Header gebundenen RLS-Client.
  Der RPC leitet unabhängig davon denselben User aus `auth.uid()` ab.
- Fehler sind all-or-error und werden nicht durch V1-Fallback oder Teilpayload
  kaschiert. Stabile SQL-Tokens sind
  `MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED`,
  `MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE`,
  `MIDAS_ACTIVITY_CONSUMER_RANGE_TOO_LARGE` und
  `MIDAS_ACTIVITY_CONSUMER_LIMIT_EXCEEDED` sowie bei ungültigem V1-Quellwert
  `MIDAS_ACTIVITY_CONSUMER_SOURCE_INVALID`.
- Range: beide Daten Pflicht, `from <= to`, `to` nicht nach dem aktuellen
  Wiener Tag, maximal 400 inklusive Tage. Mehr als 1000 V2-Sessions im Range
  liefert `LIMIT_EXCEEDED`; es gibt keine Trunkierung oder Pagination.
- Browser/Edge geben gegenüber UI beziehungsweise HTTP nur stabile lokale
  Fehlerklassen aus; keine SQL-Message, JWT-, Service-Role- oder Rohpayloadlogs.

### Sichtbarer Arztbericht

Die Aktivitätssektion bleibt genau eine ruhige Sektion. Bei vorhandenen Daten:

```text
Aktivität
- Letzte Aktivität: DD.MM.YYYY
- Aktive Tage/Woche: x oder x,x
- Gesamtdauer: N Min (Durchschnitt: M Min/Einheit)
```

Die Frequenz besitzt höchstens eine Nachkommastelle; das deutsche
Dezimalkomma erscheint nur, wenn die Nachkommastelle ungleich null ist.

Die Datengrundlage bleibt eine einzelne Zählerzeile wie
`Aktivität: N Einträge`. Keine zusätzliche Fitnessüberschrift, kein Chart und
keine Kraft-/Ausdauerwertung werden ergänzt.

Bei leerem Snapshot bleibt die Copy exakt:

```text
Aktivität
- Keine Einträge im Zeitraum.
```

Nach R13 bleibt das Report-Top-Level-Keyset unverändert:
`subtype, period, report_type, summary, text, meta, bp_series, body_series,
lab_series, activity_series` plus Lifecycle-`created_at`/`generated_at`.
`activity_series` ist dann das kanonisch sortierte normalisierte `units`-Array.
`meta.activity` besitzt für neue Reports exakt:

```text
schema_version, unit_count, active_day_count, active_days_per_week,
total_duration_min, average_duration_min, last_day, mixed_source_day_count
```

`schema_version` ist `midas.activity-consumer.v1`; die übrigen Werte stammen
unverändert aus Summary/Quality. Alte Snapshots ohne diese Version werden
weder validiert noch umgeschrieben oder semantisch neu interpretiert.

### Doctor-Drilldown

- bleibt sekundär und lazy
- zeigt nach R13-Aktivierung normalisierte Einheiten neueste zuerst; der
  gemeinsame Snapshot selbst bleibt kanonisch aufsteigend
- darf Datum, Label, Dauer, Notiz und bei V2 Itemanzahl zeigen
- bietet nur für `source=activity_v1` den bestehenden V1-Löschpfad an
- V2-Zeilen sind read-only; Korrektur und Löschung bleiben im R9-Historyflow
- Activity-Fehler bleiben ein expliziter partieller Detailfehler; Report-first,
  Lazy Loading, Requestversion, Stale-Abbruch, Close, Lock und Logout-Cleanup
  bleiben erhalten

### Health Export V3

Schema: exakt `midas.health-export.v3`.

Exaktes Top-Level-Keyset:

```text
schema_version, generated_at, timezone, range, completeness,
blood_pressure, body, notes, labs, activity_summary, activity_quality,
activities
```

- `generated_at`, `timezone`, `range`, die Nicht-Activity-Arrays und deren
  Sortierung bleiben semantisch und strukturell identisch zu V2.
- `completeness` bleibt exakt
  `{ status, loaded_domains, counts }`, mit `status=complete`,
  `loaded_domains=[blood_pressure, body, notes, labs, activities]` und dem
  exakten Counts-Keyset `blood_pressure, body, notes, labs, activities`.
- Nicht-Activity-Elementkeysets bleiben exakt:
  - Blood pressure: `day, daypart, systolic_mmhg, diastolic_mmhg, pulse_bpm`
  - Body: `day, weight_kg, waist_cm, fat_kg, muscle_kg`
  - Notes: `day, text`
  - Labs: `day, egfr, creatinine, hba1c, ldl, potassium, ckd_stage,
    doctor_comment`
- `activity_summary` ist exakt das Summary-Keyset von
  `midas.activity-consumer.v1`.
- `activity_quality` ist exakt
  `{ mixed_source_day_count, mixed_source_days }`.
- `activities` enthält exakt die normalisierten Activity-Einheiten in
  kanonischer aufsteigender Sortierung. `completeness.counts.activities` muss
  `activity_summary.unit_count` und der Arraylänge entsprechen.
- Weder Top-Level noch Einheiten enthalten `user_id`, Items, Sätze,
  Katalogsnapshots, Requestdaten, Reps, Gewichte oder Volumen.
- V3 verwendet den inklusiven Doctorrange bis 400 Tage, ist strict und
  all-or-error: unvollständige Domains, Snapshot-/Range-/Countdrift oder ein
  Readfehler erzeugen keinen Blob und keinen Download.
- Parser müssen zuerst exakt auf `schema_version` verzweigen. V2 akzeptiert
  nur `midas.health-export.v2`; V3 nur `midas.health-export.v3`; kein
  Best-effort-Fallback zwischen Versionen.
- R11 beweist den V3-Builder und Loader nur isoliert. `buildHealthExportV2`,
  der sichtbare Downloadbutton und seine produktive Data-Access-Kette bleiben
  unverändert; die V3-Aktivierung gehört R13.

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`
- Neue oder entscheidungsrelevante Konzepte:
  - `gemeinsame V1-/V2-Leseprojektion, aktive Tage statt Eintragsfrequenz,
    getrennte Health-Export-Version und produktiver SQL-Unterbau ohne Cutover`
- Geplante Briefing-Gates:
  - `vor produktivem SQL 25 in S5`
- Nicht erneut zu erklären:
  - `normale JS-/CSS-Änderungen, Standard-Node-/Deno-Checks und bekannte
    Docker-Fixtures`

## Scope und Grenzen

In Scope:

- gemeinsamer read-only V1-/V2-Consumervertrag auf Event-/Sessionebene
- SQL 25 samt Rollback, expliziten Grants und PostgreSQL-17-Fixture, falls
  S2/S4R die Datenbankprojektion bestätigt
- Browser-Data-Access und strikte Contractvalidierung
- isolierte Doctor-Detailintegration und kompakte Reportaggregation
- isolierter, versionierter Health Export V3
- Tests, Harness, Isolation, Deno-/Node-/PostgreSQL-Nachweise
- optional owner-gatete produktive Installation nur des read-only SQL-Unterbaus
- S6-Sync in Activity-, Doctor-, Reports-, QA-, HOW-TO- und Masterplandoku

Nicht in Scope:

- sichtbarer Activity-V2-Productload oder Navigation
- tatsächlicher Produktcutover, Dual Write oder Migration von V1-Daten
- Protein Target, Trendpilot und neue medizinische Schwellen
- R10-Coaching-Export, MCP oder Template-Import
- V2-Sessionkorrektur oder -löschung in Doctor View
- Reportarchiv, Monatsberichte oder rückwirkende Reportneuberechnung
- Edge-, Web-, Service-Worker-, Android- oder APK-Deploy
- vollständige Fitnesssektion, Trainingsplan oder Coachingempfehlung

Roadmap-spezifische Guardrails:

- Keine Service-Role im Browser oder in Clientdiagnosen.
- Browser-Caller dürfen ausschließlich eigene Aktivitätsdaten lesen.
- Edge-Reads leiten Owner-ID nur aus dem verifizierten JWT-/Reportkontext ab.
- `PUBLIC` und `anon` erhalten keinen neuen Activity-V2-Zugriff.
- Kein Test erzeugt produktive V2-Sessions oder neue Arztberichte.
- Keine Produktdatei lädt die isolierten R11-Consumer vor R13.
- Ein Fehler der Activity-Quelle verhindert einen neuen Reportwrite; der
  bisherige gültige Bericht bleibt erhalten.

## Scope-Freeze vor S4

- Bestehende Features:
  - `Activity V1, aktueller Doctor-Drilldown, Health Export V2 und
    range_report-Lifecycle bleiben produktiv erhalten.`
- Datenmodell, Lifecycle und Retention:
  - `keine fachlichen Tabellen- oder Zeilenänderungen; höchstens additive
    read-only View/RPC/Function mit ACL; keine Retentionänderung.`
- Cleanup, Scheduler, Secrets und externe Automationen:
  - `nicht betroffen; keine neuen Secrets, Workflows oder Scheduler.`
- Kompatible Producer und Consumer:
  - `V1 health_events/activity_event; V2 persistierte R8/R9-Sessions; Doctor
    View; Range-Report; Health Export V2/V3; R12-R14-Folgeconsumer.`
- Offene Grundsatzfragen:
  - `keine Ownerfrage; F-ACT-R11-08 und F-ACT-R11-09 sind technische
    Discovery-Findings und müssen vor S4 geschlossen sein.`
- Umgang mit späterem Scope-Wechsel:
  - `kleine technische Korrektur über S2/S3/S4R; medizinische Folgeconsumer
    nur in R12, read-only Aktivierung nur in R13 und Capture-Cutover nur in
    R14.`

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/Future trainingsmodule update thoughts.md`
- `docs/modules/Activity Module Overview.md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/modules/Reports Module Overview.md`
- `docs/qa/health-capture-reports.md`
- `app/modules/doctor-stack/doctor/index.js`
- `app/modules/doctor-stack/reports/index.js`
- `backend/supabase/functions/midas-monthly-report/`
- `app/modules/vitals-stack/activity/v2/data-access.js`
- `sql/13_Activity_Event.sql`
- `sql/22_Activity_V2_Commit_Compatibility.sql`
- `sql/23_Activity_V2_History_Lifecycle.sql`
- `sql/24_Activity_V2_Coaching_Export.sql`
- `sql/16_Explicit_Grants.sql`

Gezielt als bewiesener Vorgänger:

- `docs/archive/MIDAS Activity V2 R10 Completed Activity Coaching Export V1 Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R10 Completed Activity Coaching Export V1 Evidence (DONE).md`

Aktuelle Primärquellen bei konkreter Supabase-Vertragsfrage:

- `https://supabase.com/changelog.md`
- `https://supabase.com/docs/guides/database/functions`
- `https://supabase.com/docs/guides/database/postgres/row-level-security`
- `https://supabase.com/docs/guides/functions/auth`

## Tool Permissions und Gates

Allowed:

- Repo-Reads und gezielte lokale Edits im R11-Scope
- `rg`, Git-/Diff-/Markdown-, Node- und Deno-Checks
- Browser-Plugin oder dokumentierter Playwright-Fallback für isolierte Harnesses
- Docker/PostgreSQL 17 für disposable SQL-/RLS-/ACL-/Race-Fixtures
- Supabase CLI-Hilfe und produktive read-only Preflights ohne Secretausgabe
- CodeRabbit genau im S5-Vertrag

User-gated:

- produktives SQL 25 exakt nach Hash-/Preflight-Briefing
- produktiver Rollback nur nach neuer expliziter Freigabe
- jeder unerwartete Edge-, Web-, Workflow-, Service-Worker- oder Device-Deploy

Forbidden:

- Secrets, JWTs, personenbezogene Rohpayloads oder Service-Role-Werte ausgeben.
- fremde Worktree-Änderungen zurücksetzen.
- SQL-Fixture oder synthetische Activity-/Reportdaten produktiv ausführen.
- SQL 16 pauschal produktiv ausführen; nur den in SQL 25 geprüften Vertrag
  installieren und SQL 16 als Fresh-Build-Spiegel aktualisieren.
- Productload, Featureaktivierung oder R13-/R14-Cutover vorziehen.
- alte Arztberichte verändern oder neue Berichte im Namen des Owners erzeugen.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `Extra High` | `PASS` | reale Producer/Consumer/Keysets/ACLs, 65 V1, V2 0/0/0, Isolation 4/4, Edge 22/22 |
| S2 | Fachlicher/technischer Zielvertrag | `Extra High` | `PASS` | exakter RPC-/ACL-/Consumer-/Report-/Doctor-/Health-V3-Vertrag; F08/F09 geschlossen |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | `Extra High` | `PASS` | Red-Team, 0-DML, Rollback/Stop, Testmatrix und Invalidation vollständig |
| S4R | S4 Readiness Review | `Extra High` | `PASS / STOP` | sechs Pakete vollständig bewertet; Gesamt-GO, sechs sichere Blöcke, kein S4 gestartet |
| S4 | Umsetzung | `High; S4.2/S4.4 Extra High` | `PASS / STOP` | S4.1-S4.6 einzeln PASS; kein Product-Wiring, produktives SQL oder Deploy |
| S4.1 | Consumer-Schema und Aggregationsbasis | `High` | `PASS` | pure Contractbasis, gemeinsame Golden Fixture, 10/10 Node; EV-ACT-R11-L01 |
| S4.2 | SQL 25, ACL, Rollback und Fixture | `Extra High` | `PASS` | exakt eine read-only Function; PG17 Fresh/Rerun/Drift/Auth/RLS/BOLA/Empty/Range/Rollback; EV-ACT-R11-L02/-L03/-L04 |
| S4.3 | Data Access und isolierter Consumer-Harness | `High` | `PASS` | One-RPC, ein Auth-Refresh, strict Validation und sichere Fehler/Stale; 9/9, mit Consumer 19/19; EV-ACT-R11-L05 |
| S4.4 | Doctor-Drilldown und Range-Report | `Extra High` | `PASS` | zehn unreferenzierte Outputs; Deno 15/15 plus Edge 22/22, Node 17/17, Browser 3/3; EV-ACT-R11-L06/-L07 |
| S4.5 | Health Export V3 | `High` | `PASS` | strict/all-or-error V3, V2 unverändert; Node 8/8, Browser einschließlich T07 5/5; EV-ACT-R11-L08 |
| S4.6 | Isolation und Provisioning-Spiegel | `High` | `PASS` | SQL16 PG17-Driftmatrix; Isolation/final 9/9; EV-ACT-R11-L09 |
| S5 | Tests, Runtime-Gates und Abschlussreview | `Extra High` | `PASS` | T01-T13 grün; SQL25 exakt einmal owner-freigegeben produktiv, Postimage/Auth/Daten/Advisors/Edge PASS |
| S6 | Doku-Sync, Commit und Archiv | `High` | `PASS` | SoT/HCR-029/HOW-TO/Unreleased synchron; finaler Review grün; R11 gemeinsam archiviert und commitbereit |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R11-01 | P1 | Contract/Product | fixed | Berichtsumfang auf drei ruhige Metriken begrenzt; D-ACT-R11-01/-02/-04 |
| F-ACT-R11-02 | P1 | Contract/Data | fixed | Frequenz zählt aktive Tage statt Einheiten; D-ACT-R11-03/-06 |
| F-ACT-R11-03 | P1 | Contract/Data | fixed | V2-Dauer ausschließlich auf Sessionebene; D-ACT-R11-07 |
| F-ACT-R11-04 | P1 | Contract/Architecture | fixed | R10-Vollpayload bleibt separater Coaching-Export; D-ACT-R11-12 |
| F-ACT-R11-05 | P1 | Contract/Backcompat | fixed | Health Export V2 bleibt stabil, V3 wird isoliert; D-ACT-R11-11 |
| F-ACT-R11-06 | P1 | Contract/Lifecycle | fixed | alte Reports bleiben Snapshots; D-ACT-R11-10 |
| F-ACT-R11-07 | P1 | Contract/Scope | fixed | Protein Target/Trendpilot bleiben R12, read-only Aktivierung R13 und Capture-Cutover R14; D-ACT-R11-14 |
| F-ACT-R11-08 | P1 | Security/Architecture | fixed | ownerloser authenticated-only SECURITY-INVOKER-RPC plus requestlokaler Edge-RLS-Client; D-ACT-R11-16 bis -18 |
| F-ACT-R11-09 | P1 | Contract/Export | fixed | exaktes `midas.health-export.v3`-Keyset, strict Parserbranch und byte-stabile V2-Grenze; D-ACT-R11-19/-22 |
| F-ACT-R11-10 | P1 | Contract/Activation | fixed | R11 bereitet die neue Reportcopy isoliert vor; produktiv neu erzeugte Berichte wechseln erst mit dem R13-Edge-Deploy |
| F-ACT-R11-11 | P2 | Contract/Evidence | fixed | Evidence-Verweise verwenden einzelne IDs statt mehrdeutiger Bereichskürzel |
| F-ACT-R11-12 | P1 | Contract/Dependency | fixed | Masterplan-Rebaseline synchronisiert: R12 medizinische Vorbereitung, R13 read-only Aktivierung, R14 Capture-Cutover |
| F-ACT-R11-13 | P2 | Test/Consumer | fixed | Doctor-Contract-/Lifecycle-/Browserabdeckung in S4.4 und Health-Export-V3-Automation in S4.5 geschlossen |
| F-ACT-R11-14 | P1 | Contract/Data | fixed | JSON-Singleton und explizites Fail-closed bei mehr als 1000 V2-Sessions verhindern Data-API-Trunkierung oder unbounded Payload; D-ACT-R11-16/-20 |
| F-ACT-R11-15 | P1 | Contract/Backcompat | fixed | neue `meta.activity` trägt `midas.activity-consumer.v1`; Legacy-Reports ohne Version bleiben unveränderte Snapshots; D-ACT-R11-10/-21 |
| F-ACT-R11-16 | P1 | Test/Data | fixed | keine Activity-/Report-DML in Tests; pure nichtleere Fixtures plus minimaler leerer PG17-Preimage für DDL/ACL/RLS/Rollback; D-ACT-R11-24 |
| F-ACT-R11-17 | P1 | Scope/Activation | fixed | produktive Doctor-/Edge-Handler bleiben in R11 unverändert; neue Module unreferenziert, Wiring ausschließlich R13; D-ACT-R11-23/-25 |
| F-ACT-R11-18 | P1 | Security/Logging | fixed | R11-Adapter sanitizen RPC-/Validatorfehler vor bestehendem Doctor-/Edge-Logging auf stabile lokale Fehlerklassen; D-ACT-R11-26 |
| F-ACT-R11-19 | P1 | Contract/Parity | fixed | gemeinsame Golden Fixtures und Reaggregation müssen JS-/TS-Validatorparität beweisen; D-ACT-R11-26 |
| F-ACT-R11-20 | P2 | Readiness/Batching | fixed | vorläufigen S4.1-S4.3-Großblock in sechs einzelne, reviewbare S4-Blöcke zerlegt |
| F-ACT-R11-21 | P1 | Readiness/Invalidation | fixed | SQL-16-Provisioningspiegel von S4.2 nach S4.6 verschoben, damit S4.2 bestehende Isolation nicht absichtlich bis zum Abschluss bricht |
| F-ACT-R11-22 | P1 | Readiness/Scope | fixed | produktive Doctor-/Edge-Handler aus S4.4-Output entfernt und als unveränderte Negativorakel fixiert |
| F-ACT-R11-23 | P1 | Contract/Error | fixed | interner Aggregationsüberlauf konnte zunächst den Fehlercode der falschen öffentlichen API tragen; Builder erhält nun den aufrufenden stabilen Code, Contracttests 10/10 erneut PASS |
| F-ACT-R11-24 | P1 | Security/Availability | fixed | Dense-Array-Prüfung konnte bei adversarial großer sparse Länge vor dem fachlichen Limit allokieren; descriptorbasiertes Vorab-Limit verhindert die Allokation fail-closed |
| F-ACT-R11-25 | P1 | Contract/Aggregation | fixed | SQL-Empty setzte average_duration_min zunächst auf 0 statt auf das eingefrorene null; Function und exaktes Empty-Postimage korrigiert, Functionhash neu gebunden |
| F-ACT-R11-26 | P1 | Security/Dependency | fixed | Viewdef-Hash war zunächst für den Defaultpfad statt für den gehärteten leeren search_path gebunden; vollqualifizierten PG17-Hash verifiziert und Forward/Rollback synchronisiert |
| F-ACT-R11-27 | P1 | Security/ACL | fixed | rohe ACL allein schloss geerbtes EXECUTE nicht aus; effektive anon-/service_role-Prüfung in Rerun, Postcondition, Rollback und Fixture ergänzt |
| F-ACT-R11-28 | P1 | Contract/Determinism | fixed | Sortierung verwendete Mikrosekunden vor der Millisekundenprojektion; Ordnung nun auf dem tatsächlich ausgegebenen RFC3339-Millisekundenwert plus source/id |
| F-ACT-R11-29 | P1 | Test/Integrity | fixed | Fixture erzwang ON_ERROR_STOP anfangs nicht selbst und einzelne Dependency-Drifttests besaßen kein eindeutiges Abort-Orakel; explizites Gate und Funktions-Abwesenheits-Sentinels ergänzt |
| F-ACT-R11-30 | P1 | Contract/Retry | fixed | reales fetchWithAuth behandelt maxAttempts als zusätzliche Transportversuche; S4.3 setzt maxAttempts=0 und erlaubt damit exakt Initialrequest plus höchstens einen Auth-Refresh |
| F-ACT-R11-31 | P1 | Security/Error | fixed | ein werfender Diagnose-Sink konnte die stabile lokale Fehlerklasse ersetzen; Logging ist nun fail-safe und exponiert weiterhin nur operation/code/status |
| F-ACT-R11-32 | P1 | Contract/Error | fixed | malformed Edge-Loader-Envelopes konnten vor der stabilen Edge-Fehlergrenze einen internen Validatorfehler werfen; Top-Level-Input wird nun vor Clientzugriff zu `INVALID_RANGE` sanitizt |
| F-ACT-R11-33 | P2 | Test/Determinism | fixed | Playwright-`fill()` plus zusätzliches synthetisches `change` starteten denselben Range-Read zweimal; der Smoke nutzt nur das reale Fill-Event und beweist exakt zwei Requests inklusive Stale-Read |
| F-ACT-R11-34 | P2 | Code/Quality | fixed | vier neue TS-Dateien verwendeten explizites `any`; dynamische Grenzen sind auf `unknown` und validierte Typübergänge umgestellt, Check/Lint/Format PASS |
| F-ACT-R11-35 | P1 | Security/Error | fixed | adversarial Getter/Proxies auf Edge-`status`/SQL-Feldern oder Doctor-`code`/`status` konnten die Sanitization selbst werfen; fail-safe Own-Data-Descriptor-Leser und Regressionstests schließen den Rohfehlerpfad |
| F-ACT-R11-36 | P2 | Test/Determinism | fixed | VM-Fixtures aus einem fremden Realm wurden zunächst direkt tief verglichen; JSON-Postimages normalisieren die Testgrenze deterministisch |
| F-ACT-R11-37 | P1 | Contract/Completeness | fixed | eine leere `loaded_domains`-Liste erfüllte den positionsweisen Vergleich vacuous; exakte Kardinalität fünf ist nun vor dem Reihenfolgenvergleich Pflicht |
| F-ACT-R11-38 | P1 | Contract/Scope | fixed | ein nicht eingefrorenes generisches 10.000-Zeilen-Limit hätte gültige Health-V2-Domains abweisen können; entfernt, während descriptorbasierte Dense-Array-Prüfung sparse Großlängen ohne Vorallokation verwirft |
| F-ACT-R11-39 | P1 | Contract/Backcompat | fixed | V2-Postimage-Strings für Notes und Activities mussten die Trim-Normalisierung des realen Builders exakt erzwingen; Validator und Negativtests synchronisiert |
| F-ACT-R11-40 | P1 | Scope/Isolation | fixed | das bestehende Isolationstool schützte R10-Umfelder, aber nicht alle konkreten Coaching-Export-/SQL24-Artefakte; 20 R10-Pfade sind nun explizite Git-Negativorakel |
| F-ACT-R11-41 | P2 | Test/Parser | fixed | das R13-Dokumentorakel war zunächst zeilenlokal und erkannte den normativen Markdown-Zeilenumbruch nicht; whitespace-stabiler Parservertrag korrigiert |
| F-ACT-R11-42 | P2 | Test/Integrity | fixed | der finale Produkthashtest normalisierte zunächst CRLF und verglich damit keinen Byte-Postimagehash; rohe Dateibytes sind nun die Prüfgrundlage |
| F-ACT-R11-43 | P1 | Scope/Isolation | fixed | CodeRabbit erkannte, dass der Productload-Guard `activity-report.ts` nicht erfasste; Regex und Regressionstest ergänzt, Isolation erneut PASS |
| F-ACT-R11-44 | P2 | Evidence/Runtime | fixed | disposable PG war fälschlich als 17.0.11 dokumentiert; exakt gemessenen Serverstring `17.11 (Debian 17.11-1.pgdg13+2)` synchronisiert |
| F-ACT-R11-45 | P2 | Contract/Copy | fixed | Roadmap zeigte zwingend `x,x`, während der Report ganze Werte ohne Null-Nachkommastelle ausgibt; Vertrag auf höchstens eine Stelle präzisiert und `0,5` plus `2` getestet |
| F-ACT-R11-46 | P1 | Contract/Data | fixed | V1-Viewwerte konnten trotz Producervertrag historisch null/ungültig sein; SQL25 failt range-/ownerbezogen mit `SOURCE_INVALID`, Browser/Edge mappen zu `CONTRACT_INVALID`, PG17 beweist den Fall ohne Activity-DML |
| F-ACT-R11-47 | P1 | Test/Integrity | fixed | Test-DML-Orakel übersah exaktes `range_report` und `TRUNCATE`; vollständige Relation-/Verbmatrix plus ausführbare Selbstprobe ergänzt |
| F-ACT-R11-48 | P2 | Test/Preflight | fixed | erster S5-Preflight verwendete erneut konzeptionelle Katalognamen und brach read-only vor Ergebnis ab; gegen reales SQL20-Schema auf `health_activity_catalog_entries` korrigiert und vollständig wiederholt |
| F-ACT-R11-49 | P2 | Evidence/Integrity | fixed | nach Ergänzung der DML-Selbstprobe blieb der frühere Isolationstool-Hash in EV-ACT-R11-L09 stehen; rohen SHA256 neu gemessen und Evidence auf `B5EEF139...76A116` synchronisiert |
| F-ACT-R11-50 | P2 | Evidence/Operations | fixed | Supabase `apply_migration` erzeugte neben dem exakt freigegebenen SQL25-Postimage den erwarteten operativen History-Eintrag `20260823083735/activity_v2_r11_consumer_compatibility`; read-only verifiziert und von fachlicher Activity-/Report-DML abgegrenzt |

<!-- markdownlint-enable MD013 -->

## Initialer Roadmap Contract Review

Stand: `2026-08-22`.

- Produktkarte, Masterplan R11-R14, Activity-, Doctor- und Reports-Overview
  sowie R10-DONE-Postimage wurden gegeneinander geprüft.
- Die Roadmap übernimmt keine Satzdetails aus R10 und zieht weder R12-
  Fachlogik noch die R13-/R14-Aktivierung vor.
- Der reale 400-Tage-Doctorvertrag bleibt vom 366-Tage-Coachingexport getrennt.
- Die derzeitige V1-Delete-Funktion im Doctor-Drilldown wird nicht still auf
  V2 übertragen.
- Der Edge-Service-Role-Pfad und der Browser-RLS-Pfad dürfen nicht durch eine
  voreilige RPC-Signatur vermischt werden. Dies ist bewusst F-ACT-R11-08 und
  Aufgabe von S2/S3, kein fehlender Ownerentscheid.
- Health Export V2 darf nicht umgedeutet werden; F-ACT-R11-09 erzwingt vor S4
  einen exakten V3-Vertrag.
- Die Formulierung zu neuen Arztberichten wurde korrigiert: R11 beweist die
  neue Copy isoliert, während die produktive Edge-Runtime bis R13 unverändert
  bleibt; F-ACT-R11-10 ist geschlossen.
- Evidence-Verweise wurden auf einzeln auflösbare IDs normalisiert;
  F-ACT-R11-11 ist geschlossen.
- Die nach dem initialen Review beschlossene Masterplan-Rebaseline wurde in
  Ziel-, Scope-, Test- und Abschlussgrenzen synchronisiert;
  F-ACT-R11-12 ist geschlossen.
- Evidence ist wegen möglicher produktiver SQL-/ACL-Wirkung angelegt.
- Fresh-Chat-Test:
  - `PASS`; Ziel, sichtbare Copy, Nicht-Ziele, Referenzen, Discovery-Autonomie,
    Stop-Bedingungen und Owner-Gates sind ohne Denkraum rekonstruierbar.
- Review-Ergebnis:
  - `PASS mit zwei erwarteten technischen Discovery-Findings; S1 ist
    ausführbar, S4 bleibt bis zu deren Schließung blockiert.`

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Pflichtreferenzen und realen Gitstand lesen.
2. V1-Producer, V2-Sessiontabellen und die aktuellen Doctor-/Report-/Export-
   Consumer bis auf Feld-, Zeit- und Fehlergrenze kartieren.
3. Exakte aktuelle Reportpayload-, `activity_meta`-, `activity_series`- und
   Health-Export-V2-Keysets samt Tests erfassen.
4. Browser-Auth/RLS, Edge-Service-Role/User-ID-Ableitung, Data-API-Grants und
   vorhandene SQL-20-bis-24-ACLs read-only prüfen.
5. R10-Postimage, V2-Zähler und produktive Isolation nur über gültige Evidence
   oder frische read-only Abfragen bestätigen; keine Vollwiederholung R10.
6. Vorhandene Testharnesses, freie SQL-/HCR-IDs, Toolversionen und aktuelle
   offizielle Supabase-Hinweise gezielt prüfen.
7. Fakten, Hypothesen und Findings trennen.
8. Full Contract Review, Findings-Korrektur, Statusmatrix-, Evidence- und
   Resume-Card-Sync durchführen.

Ergebnis:

- Systemkarte:
  - `Activity V1 wird als health_events/activity_event über die SECURITY-
    INVOKER-View v_events_activity und activity_add/list/delete produziert und
    bleibt produktiv aktiv; der Produktstand enthält 65 V1-Events.`
  - `Activity V2 persistiert eine Einheit je health_activity_sessions-Zeile;
    Items und Sets sind Kinddaten. Der Produktstand ist 0/0/0. Nur
    session.duration_min darf in R11 als Dauer zählen.`
  - `Doctor lädt Details lazy und V1-Activity heute über loadActivities;
    V1-Delete bleibt an activity_delete gebunden. Health Export V2 wird strict,
    vollständig und all-or-error im Doctor-Modul gebaut.`
  - `Der Range-Report liest V1 mit einem verifizierten User-Bearer, filtert alle
    Service-Role-Reads explizit auf diesen User und baut den kompletten Payload
    vor dem Singleton-Write. Alte range_report-Zeilen bleiben Snapshots.`
- Betroffene Schichten:
  - `Pure Consumercontracts, additive SQL-25-Readprojektion und SQL-16-Spiegel,
    Activity-V2-Data-Access, isolierter Doctor-/Export-Harness sowie Doctor-
    und Edge-Code hinter inaktiver R13-Aktivierungsgrenze.`
- Belegte Verträge:
  - `Doctorrange maximal 400 inklusive Wiener Kalendertage; Coachingexport
    separat maximal 366 Tage; kanonische Zeitgrenze Europe/Vienna.`
  - `Health Export V2 Top-Level exakt schema_version, generated_at, timezone,
    range, completeness, blood_pressure, body, notes, labs, activities; keine
    R11-Änderung an Builder, Download oder Parsergrenze.`
  - `Aktueller Reportpayload exakt subtype, period, report_type, summary, text,
    meta, bp_series, body_series, lab_series, activity_series plus Lifecycle-
    created_at/generated_at; activity meta enthält count, total_min, avg_min,
    days, delta_count, delta_total_min, last_day und per_week.`
  - `V2-RLS ist ownergebunden und schließt anonyme Auth-User aus; Tabellen sind
    für authenticated/service_role nur SELECT-freigegeben. R10-Export bleibt
    STABLE SECURITY INVOKER, search_path='', nur authenticated EXECUTE.`
  - `Aktuelle Supabase-Primärquellen bestätigen explizite Grants plus RLS und
    einen requestlokalen User-Authorization-Client im Edge als gemeinsamen
    RLS-konformen Callerpfad.`
- Offene Fragen:
  - `F-ACT-R11-08/-09 werden vertragsgemäß in S2 geschlossen; F-ACT-R11-13
    ist als Testpflicht S4.4/S4.5 zugeordnet. Keine Ownerfrage und kein P0/P1-
    Laufzeit-, Security- oder Datenintegritätsblocker.`
- Doku-Sync:
  - `Roadmap, Evidence, Statusmatrix und Resume Card am 2026-08-23
    synchronisiert; Modul-Source-of-Truth bleibt bis S6 unverändert.`

S1 Full Review:

- `PASS`; Code-, Contract-, Consumer- und Securitygrenzen wurden gegen Git,
  SQL, Browsermodule, Edge-Lifecycle, Produktmetadaten und aktuelle Supabase-
  Dokumentation geprüft.
- Der erste read-only Produktquery verwendete zwei konzeptionelle statt reale
  V2-Kindtabellennamen und brach vor Ausführung ab. Der Query wurde gegen SQL 20
  korrigiert und vollständig erfolgreich wiederholt; keine Produktwirkung.
- Advisor-Baseline: drei bekannte R8/R9-SECURITY-DEFINER-Warnungen und die
  bestehende Leaked-Password-Watchlist; keine neue R11-Warnung.
- Direkt invalidierte Checks nach der Querykorrektur: Relationsinventar,
  V1-/V2-Zähler, ACL/RLS und R10-Hash erneut `PASS`.

Exit: Alle Producer, Consumer, ACLs, Zeitgrenzen, Keysets und
Aktivierungsgrenzen sind belegt; das interne Continuation Gate entscheidet S2.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Exaktes versioniertes Keyset der normalisierten Aktivitätseinheit und der
   Aggregation einfrieren.
2. SQL-Projektionsform gegen beide Caller festlegen:
   - Browser: authenticated, ownergebunden, RLS-konform
   - Edge: ausschließlich verifizierter Reportuser, kein clientbestimmter
     Fremd-Owner und keine Service-Role-Freigabe im Browser
3. Exakte View-/RPC-/Helper-Signaturen, Rollen, Owner, Search Path,
   Volatility, Grants und Fehlercodes festlegen oder SQL vermeiden, falls eine
   einfachere gleichwertige gemeinsame Projektion bewiesen ist.
4. V1-only-, V2-only-, Mixed-, Same-day-, Empty-, Invalid- und 400-Tage-
   Semantik einschließlich stabiler Sortierung festlegen.
5. Exakte Arztbericht-Copy und Berechnungsformeln aus dem Zielvertrag
   bestätigen; keine neue Fitnessmetrik ergänzen.
6. Doctor-Drilldown-Vertrag einschließlich V1-Delete und V2-read-only frieren.
7. `midas.health-export.v3` mit exakten Keysets, Units, Privacy,
   All-or-error und v2-Nichtwirkung definieren.
8. Inaktive R11-/R13-Leseaktivierungs- und R14-Capturegrenze für Browser und
   Edge explizit festlegen.
9. F-ACT-R11-08/-09 schließen oder bei echter Ownerfrage stoppen.
10. Full Contract Review, Findings-Korrektur und Status-Sync durchführen.

Ergebnis:

- Finaler Zielvertrag:
  - `midas.activity-consumer.v1 mit Top-Level schema_version, timezone, range,
    summary, quality, units; normalisierte Einheit exakt source, id, day,
    occurred_at, label, duration_min, note, item_count.`
  - `Summary exakt unit_count, active_day_count, active_days_per_week,
    total_duration_min, average_duration_min, last_day; Quality exakt
    mixed_source_day_count, mixed_source_days; alle Formeln, Empty- und
    Sortiersemantik sind oben normativ eingefroren.`
  - `Report bleibt bei letzter Aktivität, aktiven Tagen/Woche, Gesamt- und
    Durchschnittsdauer; keine Übungen, Sätze, Reps, Gewichte, Volumen oder
    Empfehlungen. Neue Activity-Metadaten und Serien sind versioniert, alte
    Reports unverändert.`
  - `midas.health-export.v3 besitzt das oben exakte Top-Level-, Completeness-,
    Nicht-Activity-, Summary-, Quality- und Einheiten-Keyset; V2 bleibt
    unverändert und separat aktiv.`
- Gewählte Lösung:
  - `Ein additiver authenticated-only RPC
    public.activity_consumer_snapshot(date,date) returns jsonb, Owner postgres,
    STABLE SECURITY INVOKER, leerer Search Path, kein Ownerparameter, kein
    PUBLIC-/anon-/service_role-EXECUTE.`
  - `Browser und Edge verwenden denselben User-JWT-/RLS-Pfad. Im Edge bleibt
    der Adminclient von diesem Activity-Read getrennt. R11 liefert nur
    isolierte Module/injizierbare Builder; R13 verdrahtet sie explizit ohne
    vorab erfundenen Runtime-Flag.`
- Abgrenzung:
  - `kein Cutover, keine detaillierte Fitnesssektion, kein R10-Reuse.`
- S4-Pflichtpunkte:
  - `S4.1-S4.6`
- Doku-Sync:
  - `Roadmap, Evidence, Statusmatrix und Resume Card am 2026-08-23
    synchronisiert; Modul-/HOW-TO-Sync bleibt S6.`

S2 Full Review:

- `PASS`; alle Normalized-Unit-, Aggregations-, SQL-/ACL-, Caller-, Range-,
  Fehler-, Report-, Doctor-, Export- und Aktivierungskeysets wurden gegen den
  in S1 belegten Istvertrag und die unveränderlichen Grenzen geprüft.
- F-ACT-R11-08 und F-ACT-R11-09 sind geschlossen. F-ACT-R11-14 verhindert
  stille oder unbeschränkte Payloads; F-ACT-R11-15 versioniert den neuen
  Report-Untervertrag. Keine dieser Korrekturen benötigt eine Ownerentscheidung.
- Direkt invalidierte Vertragschecks nach den Korrekturen: Caller/ACL gegen
  beide Runtimepfade, Empty/V1/V2/Mixed/Same-day/400-Tage-Formeln,
  Report-Top-Level/Legacy-Snapshot und Health-V2/V3-Parsergrenze erneut `PASS`.

Exit: F-ACT-R11-08/-09 sind geschlossen und keine Grundsatzfrage bleibt offen.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. BOLA, RLS-Bypass, Service-Role-Exposure, PUBLIC-/anon-Zugriff,
   security-definer und Search-Path-Risiken red-teamen.
2. V1/V2-Doppelzählung, Same-day-Mix, Session-/Item-Dauerdopplung,
   Tagesgrenze Europe/Vienna, 400-Tage-Grenze und Sortierties prüfen.
3. Report-Build-before-write, alter Snapshot, fehlgeschlagene Activity-Quelle,
   Partial Payload und interne Fehlerleaks prüfen.
4. Health-Export-v2-Backcompat, V3-All-or-error, Privacy und Parserdrift prüfen.
5. Doctor-Lifecycle, Lazy Loading, stale responses, Logout, Unlock, Close und
   V1-/V2-Deletegrenze prüfen.
6. Produktisolation über `index.html`, Service Worker, Scriptreihenfolge,
   Namespaces und Activation Seam prüfen.
7. SQL-Rerun, Drift, Rollback, Provisioning-Spiegel, produktive Pre-/Postchecks
   und Stop-Bedingungen festlegen.
8. Testmatrix und Invalidation Map ableiten; keine bereits gültige R10-
   Evidence ohne Ursache wiederholen.
9. S4-Substeps und sichere Batches festlegen.
10. Full Contract Review, Findings-Korrektur und Status-Sync durchführen.

S3 Red-Team-Matrix:

<!-- markdownlint-disable MD013 -->

| Risiko | Angriff / Failure Mode | Verbindliche Gegenmaßnahme | Pflichtnachweis | Status |
| --- | --- | --- | --- | --- |
| BOLA / Fremd-Owner | manipulierte User-ID aus Browser oder Edge | RPC besitzt keinen Ownerparameter; nicht anonymer `auth.uid()`-Owner plus bestehende RLS; Edge-Bearer vor Read verifiziert | T-ACT-R11-03/-04/-05/-06 | closed |
| RLS-Bypass | service_role liest oder ruft R11 direkt | SECURITY INVOKER; EXECUTE nur authenticated; Edge-Activityread über requestlokalen Userclient | T-ACT-R11-03/-04/-06 | closed |
| Default-ACL / PUBLIC | neue Function erbt EXECUTE | SQL 25 und SQL 16 revoken PUBLIC/anon/authenticated/service_role zuerst und granten nur authenticated; exakte ACL-Postcondition | T-ACT-R11-03/-04 | closed |
| Search-Path / Definer | Object-Hijack oder Ownerrechte | Owner postgres, SECURITY INVOKER, `search_path=''`, alle Relationen/Funktionen schemaqualifiziert | T-ACT-R11-03 | closed |
| Teilpayload / Trunkierung | Data-API-Limit oder >1000 V2-Sessions | JSONB-Singleton; explizites V2-Limit; kein Slice/Pagination/Fallback; strict Reaggregation | T-ACT-R11-01/-03/-05 | closed |
| Doppelzählung | V1/V2 Same-day oder Itemdauer addiert | jede gespeicherte Event-/Sessionzeile bleibt eine Unit; aktive Tage DISTINCT; nur Sessiondauer; Mixed-Day-Quality | T-ACT-R11-01/-02/-04 | closed |
| Zeit-/Sortierdrift | UTC-Tag, DST, 400/401, Timestamp-Tie | gespeicherter Vienna-Day; Vienna-Today; 1-400 inklusive; kanonisch day/time/source/id | T-ACT-R11-01/-02/-04 | closed |
| Reportwrite bei Activityfehler | RPC/Validator scheitert nach Teilreads | Activitypromise und Validation vor `buildAndPersistRangeReport`; kein V1-Fallback; Repository bei Buildfehler unberührt | T-ACT-R11-06 | closed |
| Legacy-Snapshotbruch | alter Report wird als neuer Contract geparst | neue `meta.activity.schema_version`; alte Rows unverändert; sichtbarer Reports-Parser bleibt text-/periodenbasiert | T-ACT-R11-06 | closed |
| Rohfehlerleak | Supabase-Error erreicht Doctorlog oder Edge-`serializeError` | Adapter wirft nur stabile R11-Fehlerklasse ohne Rohobjekt/-message; sichere code/status-Diagnose | T-ACT-R11-05/-06/-07 | closed |
| Doctor stale/delete | verspäteter Read nach Range/Close/Logout; V2-Deletebutton | Requestversion/Abort-Seam, Lifecycle-Cleanup; Delete ausschließlich V1-Source | T-ACT-R11-07 | closed |
| Health-V2-/V3-Drift | V2 mutiert oder Parser fällt versionsübergreifend zurück | V2-Source/Postimage unverändert; exakte V3-Keysets; strict Versionsbranch; all-or-error vor Blob | T-ACT-R11-08 | closed |
| Produktaktivierung | neuer Scriptload, SW-Cache, Doctor-/Edge-Wiring | Produktindex, SW, Doctorhandler, Edgehandler, Navigation und sichtbarer V2-Download bleiben R11-unverändert; nur isolierte Harnessloads | T-ACT-R11-09 | closed |
| JS-/TS-Parsersplit | Browser und Edge akzeptieren unterschiedliche Payloads | gleiche Golden Fixtures und Negativfälle gegen beide strict Validatoren; Summary wird jeweils reaggregiert | T-ACT-R11-01/-05/-06 | closed |
| SQL Drift / TOCTOU | Dependencyänderung zwischen Guard und DDL | SHARE-Locks vor Hash-/Katalogguards; exakte Dependency-, Function-, ACL- und Datenhash-Postconditions | T-ACT-R11-03/-04 | closed |
| Rollbackschaden | gedriftete/fremde Function wird gelöscht | separater Owner-Gate; Rollback erkennt exakt Hash, Owner, Mode, ACL und Overloadzahl; droppt nur die R11-Function | T-ACT-R11-04 | closed |
| Test-DML | Fixture schreibt Activity oder range_report | pure In-memory-/Golden-Fixtures; PG17 ohne fachliche DML; statische DML-Negativorakel | T-ACT-R11-02/-04/-09 | closed |

<!-- markdownlint-enable MD013 -->

S3 Invalidation Map:

<!-- markdownlint-disable MD013 -->

| Geänderte Grenze | Direkt invalidierte Checks | Rollback / Wiederholung |
| --- | --- | --- |
| Unit-/Summary-/Quality-Keyset oder Formel | T-ACT-R11-01/-02/-05/-06/-07/-08 | Contractmodul zurücksetzen; alle sieben Checks erneut |
| SQL-25-Body, Signatur, Dependencyhash oder ACL | T-ACT-R11-03/-04/-05 und T-ACT-R11-11 | kein Produktlauf; Fresh/Rerun/Drift/Rollback vollständig neu, Hashes neu briefen |
| Browser-Data-Access/Validator | T-ACT-R11-01/-05/-07/-08 | nur isoliertes Modul zurücksetzen; betroffene Node-/Browserchecks erneut |
| Edge-Validator/Reportbuilder | T-ACT-R11-01/-06 sowie bestehende Edge 22/22 | isoliertes Edgemodul zurücksetzen; Deno-Parität und Lifecycle erneut |
| Doctor-Renderer/Lifecycleadapter | T-ACT-R11-07/-08/-09 | kein Productwiring; Contract plus Desktop/390/320 erneut |
| Health-V3-Builder/Loader | T-ACT-R11-01/-05/-08/-09 | V3-Modul zurücksetzen; V2-Source-/Outputorakel und Browser erneut |
| SQL 16 oder Isolationstool | T-ACT-R11-03/-04/-09 plus relevante bestehende R8-R10-Isolation | Provisioningspiegel/Hash korrigieren; keine fachlichen R10-Fixtures ohne weitere Ursache |
| index.html, SW, Doctor-/Edge-Handler oder Navigation unerwartet geändert | gesamte T-ACT-R11-01 bis -10; sofortiger Scope-Stop | keine Aktivierung in R11; fremden/unerwarteten Diff nicht zurücksetzen, sondern Ownerentscheidung |
| produktiver Remote-Stand nach S4 | T-ACT-R11-11 und jedes daraus gespeiste Owner-Briefing | neuer read-only Preflight; niemals alten Hash/Freigabe wiederverwenden |

<!-- markdownlint-enable MD013 -->

Ergebnis:

- Blockierende Risiken:
  - `none; alle S3-P0/P1-Risiken sind im Vertrag geschlossen oder besitzen
    fail-closed S4-/S5-Nachweise. F-ACT-R11-13 bleibt eine zugeordnete P2-
    Implementierungspflicht.`
- Rollback-/Stop-Vertrag:
  - `Lokale/disposable Pakete bleiben additiv und isoliert. SQL-25-Rollback
    entfernt nur eine exakt erkannte kanonische Function; keine Tabellen-,
    Activity- oder Report-DML. Produktiver Rollback ist niemals automatisch
    freigegeben.`
  - `Sofortiger Stop bei unbekanntem/gedriftetem SQL-Objekt oder Dependencyhash,
    PUBLIC-/anon-/service_role-Zugriff, fehlender User-RLS-Fähigkeit, notwendigem
    Produktwiring/Deploy vor R13, Health-V2-Delta, Test-DML, unerwarteter V2-
    Historie oder unvollständigem Report-Fail-closed.`
  - `Ein produktiver SQL-Fehler wird read-only diagnostiziert, nicht wiederholt;
    Rollback oder weitere DDL benötigen eine neue Ownerfreigabe.`
- S4-Schnitt:
  - `S4.1 pure Basis; S4.2 SQL allein; S4.3 isolierter Data Access; S4.4
    unverdrahtete Doctor-/Edge-Module; S4.5 V3; S4.6 Provisioning/Isolation.`
- S5-Pflichtchecks:
  - `T-ACT-R11-01 bis -10 lokal/disposable plus T-ACT-R11-11; T-ACT-R11-12/-13
    bleiben produktiv owner-gated. EV-ACT-R11-B*, -D*, -L*, -PRE* und nur nach
    Freigabe -W*/-R*.`
- Doku-Sync:
  - `Roadmap, Evidence, Statusmatrix und Resume Card in S3; dauerhafte
    Modul-/QA-/HOW-TO-Doku erst S6.`

S3 Full Review:

- `PASS`; Security-, Daten-, Consumer-, Lifecycle-, Parser-, Isolation-, SQL-
  und Rollbackrisiken wurden gegen reale Runtime und S2-Vertrag red-geteamt.
- F-ACT-R11-16 bis -19 korrigieren Test-DML, vorgezogene Productfile-Edits,
  Rohfehlerleaks und Browser-/Edge-Parsersplit im Ausführungsvertrag.
- Direkt invalidierte Roadmapchecks nach den Korrekturen: S4.2-Fixturevertrag,
  S4.3-/S4.4-Dateigrenze, T-ACT-R11-01/-04/-05/-06/-09 und Invalidation Map
  erneut vollständig `PASS`.

Exit: Risiken sind geschlossen, zugeordnet oder explizit außerhalb R11.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks / Evidence | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | Pure Consumer-Schema-, Validator- und Aggregationsbasis | F14/F19 | Activity-V2-Consumercontract, Golden Fixture, Node-Tests | Consumer | T-ACT-R11-01/-02; EV-ACT-R11-L01 | `GO` |
| S4.2 | SQL 25, Rollback, ACL und PostgreSQL-Fixture | F08/F14/F16 | SQL 25/Rollback/0-DML-Fixture; noch kein SQL 16 | Delta; Security Consumer | T-ACT-R11-03/-04; EV-ACT-R11-L02, EV-ACT-R11-L03, EV-ACT-R11-L04 | `CONDITIONAL GO` nach S4.1; kein Produktlauf |
| S4.3 | Data Access und isolierter V1/V2-Consumer-Harness | F18 | neue isolierte Data-Access-Dateien/Tests; kein R8-R10-Delta | Consumer | T-ACT-R11-05; EV-ACT-R11-L05 | `CONDITIONAL GO` nach S4.1/S4.2 |
| S4.4 | Doctor-Drilldown und Range-Report hinter inaktiver Aktivierungsgrenze | F13/F15/F17/F18/F19 | neue unreferenzierte Doctor-/Edge-Module, Deno-/Browserharness; Produkt-Handler unverändert | Consumer | T-ACT-R11-06/-07; EV-ACT-R11-L06, EV-ACT-R11-L07 | `CONDITIONAL GO` nach S4.3; kein Deploy/Wiring |
| S4.5 | Health Export V3 isoliert und V2 stabil | F09/F13 | neues V3-Modul/Tests, isolierter Harnessdelta | Consumer | T-ACT-R11-08; EV-ACT-R11-L08 | `CONDITIONAL GO` nach S4.3/S4.4 |
| S4.6 | Produktisolation, Provisioning-Spiegel und R13-/R14-Seam | F07/F10/F12/F17 | SQL 16, Isolationstool/-contracts, finale Negativorakel | Delta | T-ACT-R11-09/-10; EV-ACT-R11-L09 | `CONDITIONAL GO` nach S4.1-S4.5 |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - `S4.1 -> S4.2 -> S4.3 -> S4.4 -> S4.5 -> S4.6. Jedes Conditional GO wird
    erst nach PASS und separatem Review des direkten Vorgängers wirksam.`
- Fehlende Zuordnung:
  - `none; Inputs, Outputs, Consumer, Failure Modes, Tests, Invalidierung und
    Rollback sind je Paket unten zugeordnet.`
- Evidence:
  - `aktive Evidence-Datei angelegt; Ergebnisse erst nach realen Checks.`
- Scope-Freeze:
  - `PASS; F-ACT-R11-08/-09 und alle S3-P1-Vertragsfindings sind geschlossen.
    F-ACT-R11-13 ist eine vollständig zugeordnete S4.4-/S4.5-Testpflicht.`
- Gültig übernommene Nachweise:
  - `R10-Funktion/ACL/Isolation nur soweit unverändert und nicht invalidiert.`
- Invalidation Map:
  - `S3 Invalidation Map ist normativ; jedes Paket wiederholt vor Abschluss nur
    die dort direkt invalidierten Checks. Unerwarteter Productfile-Delta
    invalidiert die gesamte Matrix und stoppt R11.`
- Owner-Gates:
  - `kein lokales S4-Gate; produktives SQL 25 erst nach finalem S5-Review,
    frischem read-only Preflight, Hashbriefing und expliziter Ownerfreigabe.`
- Empfohlene tokenökonomische S4-Ausführungsblöcke:
  - `Block A: S4.1 allein; Contract-/Fixturebasis klein halten und einfrieren.`
  - `Block B: S4.2 allein; Extra-High SQL-/Securityreview und disposable PG17
    ohne Vermischung mit JS.`
  - `Block C: S4.3 allein; RPC-/Retry-/Sanitizationgrenze gegen eingefrorenen
    SQL- und JS-Vertrag.`
  - `Block D: S4.4 allein; Extra-High Doctor-/Report-/Deno-/Browser-Lifecycle.`
  - `Block E: S4.5 allein; Health-V3- und V2-Backcompatgrenze isoliert.`
  - `Block F: S4.6 allein; Provisioning-/Isolationfinale nach S4.5 PASS.`
- Reviewbudget:
  - `S4 nur Delta/Consumer; kein CodeRabbit. Ein Full Review und CodeRabbit-
    Zyklus ausschließlich in S5.`
- Readiness-Findings/Korrekturen:
  - `F-ACT-R11-20: vorläufiger Großblock S4.1-S4.3 war für SQL-/Contract-
    Invalidierung zu breit; in sechs einzelne Blöcke aufgeteilt und fixed.`
  - `F-ACT-R11-21: SQL 16 in S4.2 hätte die bestehende R10-Isolation bis S4.6
    absichtlich invalidiert; Provisioningspiegel exklusiv nach S4.6 verschoben
    und fixed.`
  - `F-ACT-R11-22: S4.4-Dateigrenze nannte produktive Handler; auf neue
    unreferenzierte Module plus unveränderte Handlerorakel korrigiert und fixed.`

### S4R-Paketvertrag S4.1

- Inputs:
  - `D-ACT-R11-02/-03/-05/-06/-07/-19/-20/-24/-26; exakte S2-Keysets,
    Formeln, Grenzen und S3-Paritäts-/0-DML-Vertrag.`
- Outputs / Dateien:
  - `app/modules/vitals-stack/activity/v2/activity-consumer.js`
  - `app/modules/vitals-stack/activity/v2/activity-consumer.fixture.json`
  - `app/modules/vitals-stack/activity/v2/activity-consumer.contract.test.js`
  - `AppModules.activityV2.consumer` mit `validateRange`, `compareUnits`,
    `aggregateUnits` und `validateSnapshot`; tief eingefrorene Rückgaben und
    stabile `ActivityConsumerContractError` ohne Rohpayload.`
- Consumer:
  - `S4.3 Browser-Data-Access, S4.4 Doctor/Edge-Parität, S4.5 Health V3 und
    R12-/R13-Folgeconsumer.`
- Failure Modes:
  - `Extrakeys, Accessors, Prototyp-/Typdrift, ungültige Range/Units,
    Sortierdrift, Summary-/Qualitydrift und 1001-V2-Limit fail-closed.`
- Tests / Invalidierung:
  - `T-ACT-R11-01/-02 und EV-ACT-R11-L01; Contractänderung invalidiert laut
    S3 Map S4.3-S4.5.`
- Rollback:
  - `nur die drei neuen, unreferenzierten Dateien entfernen; keine Runtime-,
    SQL- oder Datenwirkung.`
- Urteil:
  - `GO; keine fehlenden Inputs und kein Owner-Gate.`

### S4R-Paketvertrag S4.2

- Inputs:
  - `S4.1 PASS/Golden Fixture; produktiver S1-Preimage als Referenz; SQL-20-
    bis -24-Schema/ACL/Hashvertrag; D-ACT-R11-16/-17/-20/-24/-27.`
- Outputs / Dateien:
  - `sql/25_Activity_Consumer_Compatibility.sql`
  - `sql/25_Activity_Consumer_Compatibility_Rollback.sql`
  - `sql/tests/25_Activity_Consumer_Compatibility_fixture.sql`
  - `exakt eine neue Public-Function; kein Helper, keine View, keine Tabelle,
    kein SQL-16-Delta in diesem Paket.`
- Consumer:
  - `S4.3/S4.4-RPC-Adapter und später R13; bis zu produktivem SQL 25 nur
    disposable.`
- Failure Modes:
  - `Fresh/Rerun/Partial/Overload/Source-/Dependency-/ACL-/Owner-/Mode-/
    Search-Path-Drift, 400/401, future, missing/anonymous auth, 1001-V2,
    TOCTOU und Rollbackdrift fail-closed; keine Trunkierung.`
- Tests / Invalidierung:
  - `T-ACT-R11-03/-04, EV-ACT-R11-L02/-L03/-L04; minimaler leerer PG17-
    Preimage, Claims/Katalog/EXPLAIN/static Source und Rollback ohne INSERT,
    UPDATE, DELETE oder MERGE auf Activity-/Reportrelationen.`
- Rollback:
  - `disposable nur exakt erkannte Function droppen und Datenhashgleichheit
    beweisen; produktiv weder Forward noch Rollback in S4.`
- Urteil:
  - `CONDITIONAL GO nach S4.1 PASS und verfügbarem disposable PG17; beides ist
    ohne Ownerentscheidung erreichbar.`

### S4R-Paketvertrag S4.3

- Inputs:
  - `S4.1 PASS, S4.2 kanonische Signatur/Fehler/ACL PASS, vorhandenes
    fetchWithAuth-/baseUrlFromRest-Muster aus realem Browsercode.`
- Outputs / Dateien:
  - `app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js`
  - `app/modules/vitals-stack/activity/v2/activity-consumer-data-access.contract.test.js`
  - `AppModules.activityV2.consumerDataAccess.loadSnapshot({ from, to })` mit
    exakt einem RPC, maximal zwei Authversuchen und strict S4.1-Validation.`
- Consumer:
  - `nur isolierte S4.4-/S4.5-Harnessadapter; Productindex lädt das Modul vor
    R13 nicht.`
- Failure Modes:
  - `fehlende Config/API, Netzwerk, 401/403, SQL-Token, non-JSON, Partial-/
    Extrakey-Payload, Retryerschöpfung und stale/aborted result werden zu
    stabilen lokalen Fehlercodes; Diagnose nur operation/code/status.`
- Tests / Invalidierung:
  - `T-ACT-R11-05 und EV-ACT-R11-L05; Fake-Fetch/Auth-Refresh, One-read,
    Success/Empty/alle Fehler und kein Mutation-/N+1-Pfad.`
- Rollback:
  - `nur zwei neue unreferenzierte Dateien entfernen; S4.1/S4.2 bleiben gültig.`
- Urteil:
  - `CONDITIONAL GO nach S4.1/S4.2 PASS.`

### S4R-Paketvertrag S4.4

- Inputs:
  - `S4.1-S4.3 PASS; realer Doctor-Lazy-/Stale-/Deletevertrag; bestehende Edge-
    Request- und Report-Lifecyclemodule; D-ACT-R11-01/-02/-09/-10/-18/-21/
    -25/-26.`
- Outputs / Dateien:
  - `app/modules/doctor-stack/doctor/activity-consumer-view.js`
  - `app/modules/doctor-stack/doctor/activity-consumer-view.contract.test.js`
  - `app/modules/doctor-stack/doctor/activity-consumer-harness.html`
  - `app/modules/doctor-stack/doctor/activity-consumer-harness.js`
  - `app/modules/doctor-stack/doctor/activity-consumer-harness.css`
  - `app/modules/doctor-stack/doctor/activity-consumer-browser.smoke.spec.js`
  - `backend/supabase/functions/midas-monthly-report/activity-consumer.ts`
  - `backend/supabase/functions/midas-monthly-report/activity-consumer_test.ts`
  - `backend/supabase/functions/midas-monthly-report/activity-report.ts`
  - `backend/supabase/functions/midas-monthly-report/activity-report_test.ts`
  - `Doctor-Renderer/-Lifecycleadapter und Edge-Validator/Loader/Reportbuilder
    sind injizierbar; doctor/index.js und Edge-index.ts bleiben unverändert.`
- Consumer:
  - `nur isolierter Browser-/Deno-Harness; R13 importiert und verdrahtet später
    explizit. Alte Reports bleiben beim bestehenden textbasierten Parser.`
- Failure Modes:
  - `Activityread/Validatorfehler vor Reportrepository; kein Fallback/Write;
    stale Range/Close/Logout verwirft Response; V2 hat keine Mutation; Edge-
    RLS-Client fehlt im injizierten Kontext -> stable fail-closed.`
- Tests / Invalidierung:
  - `T-ACT-R11-06/-07, EV-ACT-R11-L06/-L07, bestehende Edge 22/22 erneut;
    V1/V2/Mixed/Empty/Legacy, Copy, Meta/Series, JS-/TS-Parität,
    Build-before-write sowie Desktop/390/320/Lifecycle/Delete. Browser-Plugin
    zuerst; nur bei realer Nichtverfügbarkeit dokumentierter Playwright-Fallback.`
- Rollback:
  - `nur neue unreferenzierte Dateien entfernen; keine alte Reportzeile, kein
    Producthandler und kein Deploy betroffen.`
- Urteil:
  - `CONDITIONAL GO nach S4.3 PASS; kein Deploy/Wiring zulässig.`

### S4R-Paketvertrag S4.5

- Inputs:
  - `S4.1/S4.3 PASS, S4.4-Harness PASS, exakter V2-Builder/Postimage aus S1 und
    D-ACT-R11-11/-13/-19/-22/-25.`
- Outputs / Dateien:
  - `app/modules/doctor-stack/doctor/health-export-v3.js`
  - `app/modules/doctor-stack/doctor/health-export-v3.contract.test.js`
  - `gezielter Delta am isolierten S4.4-Harness/Browser-Smoke; kein Delta an
    doctor/index.js oder sichtbarem Exportbutton.`
- Consumer:
  - `isolierter Harness und später R13; V2-Builder/Downloader bleibt alleiniger
    Produktconsumer in R11.`
- Failure Modes:
  - `Schema-/Range-/Domain-/Count-/Privacy-/Sortierdrift, fehlender Snapshot,
    Readfehler oder Versionsmismatch vor Blob/URL; kein Teil-Download.`
- Tests / Invalidierung:
  - `T-ACT-R11-08, EV-ACT-R11-L08 plus erneutes T-ACT-R11-07-Harness-Smoke;
    exaktes V2-Postimage, V3-Keysets, V1/V2/Mixed/Empty, all-or-error und
    user_id/Items/Sets/Reps/Gewichte/Volumen-Negativorakel.`
- Rollback:
  - `neue V3-Dateien und nur den Harnessdelta entfernen; V2 bleibt unberührt.`
- Urteil:
  - `CONDITIONAL GO nach S4.3/S4.4 PASS.`

### S4R-Paketvertrag S4.6

- Inputs:
  - `S4.1-S4.5 PASS und finaler kanonischer SQL-25-/Functionhash; S1 R10-
    Isolation/Postimage; S3 Invalidation Map.`
- Outputs / Dateien:
  - `sql/16_Explicit_Grants.sql`
  - `tools/activity-v2-r8-isolation.mjs`
  - `app/modules/vitals-stack/activity/v2/isolation.contract.test.js`
  - `app/modules/vitals-stack/activity/v2/activity-consumer-final.contract.test.js`
  - `SQL-16-Guard/Grantspiegel für exakt kanonisches SQL 25; R11-
    Negativorakel und dokumentierter R13-Wiring-/R14-Capture-Seam.`
- Consumer:
  - `Fresh Build/Provisioning, S5 Full Review/Preflight und R13/R14-Roadmaps;
    keine Produktlaufzeit.`
- Failure Modes:
  - `SQL-16-Partial/Overload/Hash-/ACL-Drift, neuer Productload/SW-Cache/
    Navigation/Handlerimport, Test-DML, R10-/R12-Scopeimport oder Secretmaterial
    failen statisch.`
- Tests / Invalidierung:
  - `T-ACT-R11-09/-10, EV-ACT-R11-L09/-L10; bestehende R8-R10-Isolation nach
    bewusstem SQL-16-Hashdelta aktualisieren und erneut ausführen; git diff --check.`
- Rollback:
  - `nur R11-Grantspiegel-/Isolationdelta auf den zuvor belegten R10-Stand
    zurückführen; SQL 25 bleibt separat, produktive DB bleibt in S4 unberührt.`
- Urteil:
  - `CONDITIONAL GO nach S4.1-S4.5 PASS; letzter lokaler Scope-Freeze vor S5.`

S4R Full Review:

- `PASS / Gesamt-GO für die spätere lokale S4-Sequenz`; jedes S4.x-Paket hat
  eindeutige Inputs, Outputs/Dateien, Consumer, Failure Modes, Tests/Evidence,
  Invalidation und Rollback.
- `S4.1=GO`; `S4.2-S4.6=CONDITIONAL GO` ausschließlich auf grüne, lokal
  erreichbare Vorgänger. `NO-GO=none`.
- F-ACT-R11-20 bis -22 wurden durch kleinere Batches, späten SQL-16-Delta und
  unveränderte Producthandler geschlossen. F-ACT-R11-13 bleibt als P2-
  Testoutput exakt S4.4/S4.5 zugeordnet; kein offenes In-Scope-P0/P1.
- Direkt invalidierte Readinesschecks nach den Korrekturen: Dateieigentum,
  Abhängigkeitsreihenfolge, S3 Invalidation Map, T-/EV-Zuordnung, Rollback und
  Produktisolation erneut `PASS`.
- Kein S4-Artefakt, SQL 25, Deploy oder Produktwrite wurde begonnen oder
  ausgeführt. Der verpflichtende STOP vor S4.1 ist erreicht.

Exit: S4 ist ohne neue Grundsatzentscheidung ausführbar, sichere Batches sind
bestätigt und alle produktiven Aktionen bleiben separat gegatet. Danach
stoppen; S4 nicht automatisch starten.

## S4 - Umsetzung

### S4.1 - Consumer-Schema und Aggregationsbasis

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R11-02/-03/-05/-06/-07 und finaler S2-Keysetvertrag.`
- Dateien:
  - `app/modules/vitals-stack/activity/v2/activity-consumer.js`
  - `app/modules/vitals-stack/activity/v2/activity-consumer.fixture.json`
  - `app/modules/vitals-stack/activity/v2/activity-consumer.contract.test.js`
- Umsetzung:
  - `Normalisierte Einheiten, Summary, Empty/Error, Sortierung, Deep Freeze und
    400-Tage-Vertrag ohne I/O implementieren.`
- Review:
  - `Consumer`
- S5-Evidence-Übernahme:
  - `keine`
- Invalidation:
  - `T-ACT-R11-01/-02`
- Gate:
  - `none`

S4.1 Full Review:

- `PASS`; Code-, Contract-, Consumer- und Securityreview ohne offenen P0/P1-,
  Datenintegritäts-, Scope- oder Owner-Blocker.
- Exakte Own-Property-Keysets, Datenproperties ohne Accessors, Plain-
  Prototype-/Dense-Array-Grenzen, Wiener Tag/DST, 1-/400-/401-Tage, V1-/V2-
  Quellgrenzen, 1000-/1001-V2, Sortierung, Reaggregation, Deep Freeze und
  payloadfreie stabile Fehler wurden geprüft.
- F-ACT-R11-23/-24 wurden korrigiert; die direkt invalidierten S4.1-Checks wurden
  wiederholt: neue Contracttests `10/10 PASS`, zusammen mit bestehender
  Activity-V2-Isolation `14/14 PASS`; gesamte Activity-V2-Contractsuite
  `247/247 PASS`.
- Keine Activity-/Report-DML, kein I/O, kein SQL 16/24/25, kein Productload,
  kein Doctor-/Edge-Handlerdelta und kein Deploy. S4.2 ist dadurch `GO`, wurde
  aber nicht begonnen.

Exit: V1-only, V2-only, Mixed und Same-day sind pure und deterministisch.

### S4.2 - SQL 25, ACL, Rollback und Fixture

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - `geschlossener F-ACT-R11-08 und S2-Securityvertrag.`
- Dateien:
  - `sql/25_Activity_Consumer_Compatibility.sql`
  - `sql/25_Activity_Consumer_Compatibility_Rollback.sql`
  - `sql/tests/25_Activity_Consumer_Compatibility_fixture.sql`
- Umsetzung:
  - `Additiven read-only Vertrag mit exakten Owner-/RLS-/ACL-/Range-
    Postconditions und fail-closed Preimageguard implementieren. PG17-
    Fixtures führen keine Activity-/Report-DML aus; nichtleere Semantik stammt
    aus S4.1-Golden-Fixtures.`
- Review:
  - `Delta + Security Consumer; kein produktiver Lauf.`
- S5-Evidence-Übernahme:
  - `lokale/disposable EV-ACT-R11-L02, EV-ACT-R11-L03 und EV-ACT-R11-L04,
    sofern unverändert.`
- Invalidation:
  - `T-ACT-R11-03/-04, SQL-Hash, Fixture und Preflight.`
- Gate:
  - `produktive Ausführung verboten; S5-Owner-Gate.`

Exit: Fresh/Rerun/Drift/Auth/RLS/BOLA/Empty/Range/Rollback auf PostgreSQL 17
sowie pure V1/V2/Mixed-Semantik sind grün; kein produktives SQL und keine
Activity-/Report-DML wurden ausgeführt.

S4.2 Full Review:

- `PASS`; SQL-, Contract-, Consumer-, Security-, Datenintegritäts-, Scope- und
  Rollbackreview ohne offenen P0/P1- oder Owner-Blocker.
- SQL25 erzeugt exakt eine Public-Function. Owner postgres, STABLE SECURITY
  INVOKER, `search_path=''`, rohe und effektive EXECUTE-Rechte ausschließlich
  authenticated; kein Ownerparameter, SECURITY DEFINER, Helper, View-, Table-
  oder SQL-16-Delta.
- Quellen sind exakt V1-View, V2-Sessions und set-basierter V2-Item-Count. Kein
  Set-, R10-Coaching-, Reps-, Gewichts-, Volumen- oder Empfehlungspfad.
- Forward und Rollback sperren alle gelesenen Relationen einschließlich View,
  binden Source/Owner/Mode/ACL und prüfen geschützte Daten-/Dependencyhashes
  vor/nach der DDL. Fresh oder exakter Rerun sind die einzigen Postimages.
- F-ACT-R11-25 bis -29 wurden korrigiert und direkt invalidierte PG17-Checks
  erneut vollständig ausgeführt. Die Fixture besitzt 25 Assertions und endet
  mit PASS; Consumer 10/10 und Activity-V2-Gesamtsuite 247/247 bleiben grün.
- Drei CodeRabbit-Reviews liefen vollständig. Berechtigte Punkte zu
  ON_ERROR_STOP und Abort-Sentinels wurden korrigiert; Vorschläge gegen den
  expliziten Vollhashvertrag oder für abweichende Summary-/Fehlertokens wurden
  nach Vertragsprüfung verworfen. Ein vierter Bestätigungslauf traf erst nach
  diesen Reviews das externe 42-Minuten-Rate-Limit.
- Produktiv erfolgte nur ein read-only Preimageabgleich: SQL25 absent,
  Rollenvererbung false und V1-Viewhash unverändert. Kein SQL25-/Rollbacklauf,
  keine Activity-/Report-DML und kein Deploy.

Exit: S4.2 und EV-ACT-R11-L02/-L03/-L04 sind PASS. S4.3 ist `GO / NOT
STARTED`; produktives SQL25 bleibt ausschließlich S5-owner-gated.

### S4.3 - Data Access und isolierter Consumer-Harness

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `S2 API-/Fehlervertrag.`
- Dateien:
  - `app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js`
  - `app/modules/vitals-stack/activity/v2/activity-consumer-data-access.contract.test.js`
  - `bestehende R8-R10-Data-Access- und Produktdateien bleiben unverändert`
- Umsetzung:
  - `Genau den gemeinsamen Read-Contract laden, strikt validieren, Auth-Retry
    und Fehlercodes bewahren; keine Mutation und kein N+1.`
- Review:
  - `Consumer`
- S5-Evidence-Übernahme:
  - `keine`
- Invalidation:
  - `T-ACT-R11-05`
- Gate:
  - `none`

Exit: Success, Empty, Auth, Contractfehler, Retry und stale response sind
isoliert bewiesen.

S4.3 Full Review:

- `PASS`; Code-, API-, Contract-, Consumer-, Security-, Failure- und
  Scope-Review ohne offenen P0/P1-, Datenintegritäts- oder Owner-Blocker.
- Der Adapter registriert nur den tief eingefrorenen, produktiv
  unreferenzierten loadSnapshot-Read. Er sendet exakt p_from/p_to an
  activity_consumer_snapshot, besitzt keinen Fallback-, Mutation-, N+1- oder
  R8-R10-Delta und prüft das Antwort-Range gegen den Request.
- Auth-, SQL-Token-, Config/API-, Netzwerk-, Retry-, Abort- und
  Contractfehler werden in payloadfreie ActivityConsumerDataAccessError-Codes
  übersetzt; Diagnose enthält ausschließlich operation/code/status.
- F-ACT-R11-30/-31 wurden korrigiert. Direkt invalidierte Checks nach der
  letzten Korrektur: T-ACT-R11-05 `9/9 PASS`, zusammen mit dem unveränderten
  S4.1-Consumervertrag `19/19 PASS`; Syntax-, Whitespace-, DML- und
  Productload-Negativorakel PASS.
- Frühere S4.2-PG17-, SQL-Hash- und Activity-V2-Gesamtsuite-Evidence blieb
  gültig und wurde mangels direkter Invalidierung nicht erneut erzeugt. Kein
  CodeRabbit in S4.3; der geplante Reviewzyklus bleibt ausschließlich S5.
- Kein produktives SQL, keine Activity-/Report-DML, kein Doctor-/Edge-/Web-/
  Service-Worker-/APK-/Device-Wiring oder Deploy.

Exit: S4.3 und EV-ACT-R11-L05 sind PASS. S4.4 ist `GO / NOT STARTED`.

### S4.4 - Doctor-Drilldown und Range-Report

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - `D-ACT-R11-01/-02/-09/-10/-14.`
- Dateien:
  - `exakte S4.4-Dateiliste aus dem S4R-Paketvertrag`
  - `app/modules/doctor-stack/doctor/index.js` und Edge-`index.ts` nur als
    unveränderte Negativorakel`
- Umsetzung:
  - `Normalisierte Read-Quelle in isolierbaren/injizierbaren Modulen vorbereiten,
    kompakte Reportcopy erzeugen, Doctor-V2-Zeilen read-only halten und alten
    Snapshot-/Build-before-write-Vertrag bewahren. Produktwiring bleibt R13.`
- Review:
  - `Consumer`
- S5-Evidence-Übernahme:
  - `keine`
- Invalidation:
  - `T-ACT-R11-06/-07, Deno und Browser.`
- Gate:
  - `kein Edge-/Web-Deploy.`

Ergebnis:

- Die zehn eingefrorenen Dateien sind neu, isoliert und injizierbar. Der
  Doctor-Drilldown bleibt sekundär/lazy, zeigt normalisierte Einheiten neueste
  zuerst, verwirft verspätete Range-/Close-/Logout-Responses und lässt nur
  aktuelle V1-Einheiten in den injizierten Deletepfad; V2 bleibt read-only.
- Der TS-Consumer reaggregiert dieselben Golden Fixtures wie S4.1, erzeugt pro
  Request genau einen ownerlosen RPC-Read über einen injizierten User-RLS-
  Client und normalisiert alle Fehler auf stabile lokale Klassen.
- Der Reportbuilder ersetzt ausschließlich Activity-Zähler, Activity-Copy,
  `meta.activity` und `activity_series`; alle anderen Payloadfelder bleiben
  unverändert. Activityfehler treten vor Repositoryzugriff auf, alte Reports
  und der bestehende textbasierte Parser bleiben unberührt.
- Browser-Plugin-QA und versionierter Playwright-Smoke sind auf Desktop,
  390x844 und 320x800 einschließlich Ready, Empty, Error, Lazy, Stale, V1-
  Delete, V2-read-only und Logout ohne Overflow, Konsolen- oder Seitenfehler
  grün.

S4.4 Full Review:

- `PASS`; neue Deno-Contracts 15/15, bestehende Edge-Contracts 22/22 im
  gemeinsamen 37/37-Lauf, direkte S4.1-/Doctor-Node-Verträge 17/17 und
  Browser-Smoke 3/3. Deno Check/Lint/Format und JS-Syntax sind grün.
- F-ACT-R11-32 bis -35 wurden korrigiert und jeweils nur an den direkt
  invalidierten Deno-/Node-/Browserchecks erneut geprüft.
- Produkt-`index.html`, Service Worker, Doctor-`index.js` und Edge-`index.ts`
  sind unverändert und referenzieren kein S4.4-Modul. Statische Orakel finden
  keine Activity-/Report-DML, verbotene sichtbare Reportdetails oder
  Deploy-Seam.
- S4.2-PG17-/SQL-Hash- und S4.3-Gesamtsuite-Evidence wurde mangels direkter
  Invalidierung nicht erneut erzeugt. Kein CodeRabbit in S4.4; der geplante
  Zyklus bleibt ausschließlich S5.
- Kein produktives SQL, kein Product-Wiring und kein Edge-/Web-/Service-
  Worker-/APK-/Device-Deploy.

Exit: S4.4 und EV-ACT-R11-L06/-L07 sind PASS. S4.5 ist
`GO / NOT STARTED`; Produktlaufzeit bleibt auf V1.

### S4.5 - Health Export V3

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `geschlossener F-ACT-R11-09 und D-ACT-R11-11/-12/-13.`
- Dateien:
  - `app/modules/doctor-stack/doctor/health-export-v3.js`
  - `app/modules/doctor-stack/doctor/health-export-v3.contract.test.js`
  - `gezielter Delta an S4.4-Harness und -Browser-Smoke`
- Umsetzung:
  - `V3 strikt, deterministisch und all-or-error implementieren; V2-Builder,
    sichtbaren Download und R10-Export nicht verändern.`
- Review:
  - `Consumer`
- S5-Evidence-Übernahme:
  - `keine`
- Invalidation:
  - `T-ACT-R11-08`
- Gate:
  - `none`

Exit: V2-Backcompat und V3-Keysets/Privacy/Range sind beide bewiesen.

Ergebnis:

- `health-export-v3.js` registriert ausschließlich den tief eingefrorenen,
  produktiv unreferenzierten V3-Contract. Der vollständige reale V2-Postimage
  wird vor der Transformation strict validiert; alle Nicht-Activity-Felder
  bleiben semantisch unverändert, Activity wird aus dem S4.1-Snapshot als
  Summary, Quality und normalisierte Units übernommen.
- Der injizierbare Loader liest V2 und Activity gemeinsam, akzeptiert exakt
  denselben Rangevertrag und veröffentlicht erst nach beiden Reads und beiden
  Validierungen eine vollständige Payload. Read-, Versions-, Domain-, Count-,
  Sortier-, Keyset-, Accessor- und Privacydrift endet vor jeder Blob-/URL-/
  Downloadgrenze in stabilen lokalen Fehlercodes.
- Der gezielte S4.4-Harnessdelta lädt V3 ausschließlich lokal und bietet einen
  Contract-Prüfpfad ohne Produktbutton, Productload oder Downloadanker.

S4.5 Full Review:

- `PASS`; T-ACT-R11-08-Node-Contracts `8/8`, gezielter Browser-Smoke mit den
  drei unveränderten T-ACT-R11-07-Pfaden und zwei T-ACT-R11-08-Pfaden `5/5`.
  Desktop 1280x900, 390x844 sowie 320x800 belegen Ready, Empty und all-or-
  error ohne Overflow, Konsolen-/Seitenfehler oder Downloadanker.
- F-ACT-R11-36 bis -39 wurden korrigiert. Direkt invalidierte Syntax-, Node-
  und Browserchecks sind nach der letzten Korrektur erneut PASS.
- Produkt-Doctor-`index.js` SHA256
  `11200C055E34EF861B0C1D5507F32122B5D445AFD7C0499E32571FFBF4FE7DD4`,
  `index.html` `6CF9CF4E6E1C4C4E7722C568A590541C529D85E2E7DDE483CAC83F8A1BC3E30B`
  und Service Worker
  `D02D5510A6CEEE8140F1925E6C83630AF5B75E35E31851DBC2B7F783A0ED0A8B`
  bleiben unverändert und referenzieren V3 nicht. V2-Builder und sichtbarer
  Download sind bytegenau unverändert.
- Das In-App-Browser-Tool lud HTML/CSS, führte in zwei frischen lokalen Tabs
  jedoch keine Defer-Scripts aus; der roadmap-verbindliche versionierte
  Playwright-Smoke lieferte die vollständige Runtime-Evidence. Kein
  CodeRabbit in S4.5; der geplante Zyklus bleibt ausschließlich S5.
- Keine Activity-/Report-DML, kein produktives SQL, kein Product-Wiring und
  kein Edge-/Web-/Service-Worker-/APK-/Device-Deploy.

Exit: S4.5 und EV-ACT-R11-L08 sind PASS. S4.6 ist `GO / NOT STARTED`;
Produktlaufzeit und Health Export V2 bleiben unverändert.

### S4.6 - Isolation und R13-/R14-Aktivierungsseam

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R11-14 und Scope-Freeze.`
- Dateien:
  - `sql/16_Explicit_Grants.sql`
  - `tools/activity-v2-r8-isolation.mjs`
  - `app/modules/vitals-stack/activity/v2/isolation.contract.test.js`
  - `app/modules/vitals-stack/activity/v2/activity-consumer-final.contract.test.js`
- Umsetzung:
  - `Beweisen, dass index.html, Service Worker, sichtbarer Health Export,
    Productnavigation und Edge-Runtime nicht auf R11 umschalten; R13 erhält
    die dokumentierte Read-Consumer-Aktivierungsgrenze und R14 die getrennte
    Capture-Cutover-Grenze.`
- Review:
  - `Delta`
- S5-Evidence-Übernahme:
  - `keine`
- Invalidation:
  - `T-ACT-R11-09/-10`
- Gate:
  - `none`

Exit: Kein sichtbarer oder operativer Activity-V2-Cutover wurde vorgezogen.

Ergebnis:

- SQL 16 akzeptiert weiterhin den belegten Prä-SQL25-Stand ohne R11-Function.
  Sobald ein gleichnamiges Objekt existiert, sind exakt eine date/date-
  Signatur, Functiondef-SHA256
  `f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d`,
  Owner postgres, JSONB, STABLE SECURITY INVOKER, leerer search_path und die
  rohe/effective authenticated-only ACL Pflicht. Erst danach werden Revoke und
  Grant idempotent gespiegelt.
- Das Isolationstool bindet den neuen SQL-16-Hash, schützt zehn
  Produktziele und alle 20 konkreten R10-Coaching-/SQL24-Orakel, verlangt alle
  20 isolierten S4.1-S4.5-Ausgaben und failt bei R11-Productload, Test-DML,
  Secretmaterial oder fehlender R13-/R14-Scopegrenze.
- Der neue finale Contract bindet SQL25/Functionhash, Produktdateien und
  Service-Worker-Version bytegenau und führt den integrierten Guard aus. R13
  bleibt alleiniger Read-Consumer-Aktivierungsschritt; R14 bleibt alleiniger
  Capture-/Writer-Cutover.

S4.6 Full Review:

- `PASS`; bestehender Isolationcontract einschließlich vier unveränderter
  R8-R10-Checks `5/5`, neuer finaler Contract `4/4`, gemeinsam `9/9`.
  Guardprojektion: protected=10, R10-Negativorakel=20, R11-isolated=20,
  product_v2_loads=0, r11_product_loads=0, test_dml=0, secret_material=0.
- Disposable PostgreSQL `17.11 (Debian 17.11-1.pgdg13+2)` beweist Absenz,
  kanonischen Lauf, Rerun,
  Partial-Signatur, Overload, Source-, Hardening- und ACL-Drift sowie
  kanonischen Restore. Finale Functiondef und ACL sind exakt SQL25.
- F-ACT-R11-40 bis -42 wurden korrigiert; nur die direkt invalidierten Guard-/
  Node-Checks wurden erneut ausgeführt. `git diff --check` und JS-Syntax PASS.
- T-ACT-R11-10 und EV-ACT-R11-L10 bleiben gemäß Ownerentscheidung vollständig
  S5 zugeordnet; kein CodeRabbit in S4.6.
- Keine Activity-/Report-DML, kein produktives SQL, kein Product-Wiring und
  kein Edge-/Web-/Service-Worker-/APK-/Device-Deploy.

Exit: S4.6, T-ACT-R11-09 und EV-ACT-R11-L09 sind PASS. S4 ist vollständig
`PASS`; S5 wurde danach separat gestartet und steht inzwischen am dokumentierten
Owner-Gate vor T-ACT-R11-12.

## S5 - Tests, Runtime-Gates und Abschlussreview

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministische Reihenfolge:

1. Finale lokale und disposable Matrix gegen denselben Gesamtdiff ausführen.
2. Nativen Full Code-, Contract-, Security- und Consumer-Review durchführen.
3. Genau einen geplanten initialen CodeRabbit-Lauf ausführen.
4. Findings gesammelt bewerten; berechtigte Korrekturen bündeln und nur
   invalidierte Checks wiederholen.
5. Genau einen geplanten CodeRabbit-Verifikationslauf ausführen. Weitere Läufe
   nur nach Workflow-Vertrag.
6. Produktiven read-only Preflight samt Objektabsenz/-drift, ACL, Owner,
   Dependencyhashes, V2-Zählern und freigegebenem SQL-Hash dokumentieren.
7. Owner vor SQL 25 in Alltagssprache briefen und explizite Freigabe abwarten.
8. Nur nach Freigabe exakt SQL 25 einmal ausführen; kein SQL 16, Fixture,
   Rollback oder Retry.
9. Produktive read-only Postconditions, Auth-/ACL-Grenze, Datenzähler,
   Advisor-Delta und unveränderte Edge-/Web-Runtime dokumentieren.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R11-01 | lokal | exakte Own-Property-Keysets, strict JS-/TS-Validatorparität, Reaggregation, Deep Freeze | `PASS 2026-08-23: direkte JS-/Doctor-Verträge 17/17; gemeinsame Golden Fixtures und TS-Reaggregation zusätzlich in T-ACT-R11-06` | EV-ACT-R11-L01, EV-ACT-R11-L06 | Consumercontract |
| T-ACT-R11-02 | lokal | pure V1/V2/Mixed/Same-day/Empty/400-/401-Tage/1000-/1001-V2/Sortierung ohne Fachdaten-DML | `PASS 2026-08-23` | EV-ACT-R11-L01 | Aggregation |
| T-ACT-R11-03 | disposable PG17 | SQL25 Fresh/Rerun/Drift/Owner/Invoker/Search Path/ACL | `PASS 2026-08-23` | EV-ACT-R11-L02 | SQL/ACL |
| T-ACT-R11-04 | disposable PG17 | ohne Fachdaten-DML: Empty/Auth-Claims/RLS-/BOLA-Struktur/Source-/Duration-/Range-/Rollback-/DML-Negativorakel | `PASS 2026-08-23` | EV-ACT-R11-L03, EV-ACT-R11-L04 | SQL/Schema |
| T-ACT-R11-05 | lokal | Data Access: One-read, Auth-Retry, strict validation, stale/error | `PASS 2026-08-23: 9/9; mit direkt mitinvalidiertem Consumer 19/19` | EV-ACT-R11-L05 | API/Validator |
| T-ACT-R11-06 | Deno | Range-Report pure: V1/V2/Mixed/Empty, JS-/TS-Parität, Copy, Sanitization, Build-before-write, alte Payloads | `PASS 2026-08-23: neue Contracts 15/15; bestehende Edge 22/22, gemeinsam 37/37; Check/Lint/Format PASS` | EV-ACT-R11-L06 | Edge/Report |
| T-ACT-R11-07 | Browser | Doctor Desktop/390/320, Lazy, Logout, stale, V1 delete, V2 read-only | `PASS 2026-08-23: Contract 7/7; Browser-Plugin-QA und versionierter Smoke 3/3 ohne Overflow/Konsolen-/Seitenfehler` | EV-ACT-R11-L07 | Doctor/UI |
| T-ACT-R11-08 | lokal/Browser | Health Export V2 unverändert; V3 strict, private, all-or-error | `PASS 2026-08-23: Node 8/8; Browser-Smoke einschließlich erneutem T07 5/5; V2-Produktdateien bytegenau unverändert` | EV-ACT-R11-L08 | Export |
| T-ACT-R11-09 | lokal | Productload-/SW-/Navigation-/Doctorhandler-/Edgehandler-/R10-/R12-/R13-/R14- und Test-DML-Negativorakel | `PASS 2026-08-23: Isolation 5/5 plus final 4/4; disposable PG17 SQL16 Absenz/Kanonisch/Rerun/Partial/Overload/Source/Hardening/ACL/Restore` | EV-ACT-R11-L09 | Activation Seam |
| T-ACT-R11-10 | Full Review | gesamter Diff plus ein CodeRabbit-Zyklus | `PASS 2026-08-23: nativer Full Review; CodeRabbit initial 1 Major und Verifikation 2 Major/2 Minor, alle fünf berechtigten Punkte korrigiert; invalidierte Node/Deno/PG17/Isolationchecks PASS; kein dritter Lauf gemäß Vertrag` | EV-ACT-R11-L10 | jeder Codediff |
| T-ACT-R11-11 | produktiv read-only | SQL25 Preimage, ACL, Zähler, Hashes, Advisors | `PASS 2026-08-23: SQL25 absent; SQL20-24/ACL/RLS/Hashes kanonisch; V1 65/invalid 0, Katalog 78/80, V2 0/0/0, Range-Report 1; bekannte Advisorbaseline` | EV-ACT-R11-PRE01, EV-ACT-R11-PRE02, EV-ACT-R11-PRE03, EV-ACT-R11-PRE04, EV-ACT-R11-PRE05 | Remote-Stand |
| T-ACT-R11-12 | produktiv write | exakt SQL 25 installieren | `PASS 2026-08-23: explizit freigegebener SHA256 77BE7B9F...BC572 genau einmal erfolgreich; kein Retry/SQL16/Fixture/Rollback` | EV-ACT-R11-W01 | Freigabe/Hash |
| T-ACT-R11-13 | produktiv read-only | SQL25 Postimage, Auth/ACL, Daten 0-Write, Runtime unverändert | `PASS 2026-08-23: Function SHA F7226F6A...B3C3D, Owner/Mode/ACL exakt; Authenticated/Anonymous PASS; V1/V2/Report/Katalog/R10-Hashes und Edge 50 unverändert; keine neue Advisorwarnung` | EV-ACT-R11-R01, EV-ACT-R11-R02, EV-ACT-R11-R03 | SQL-Lauf |

<!-- markdownlint-enable MD013 -->

Produktionsregeln:

- Die einmalige Ownerfreigabe für T-ACT-R11-12 ist verbraucht und geschlossen.
- Bei Preimage-/Hash-/ACL-/Dependencyabweichung wird nicht ausgeführt.
- Ein fehlgeschlagener produktiver SQL-Lauf wird nicht blind wiederholt.
- Kein Edge-, Web-, Service-Worker-, Workflow-, APK- oder Device-Deploy.
- Keine produktive V2-Session, kein Report und kein Health Export werden als
  Test erzeugt.

Ergebnis:

- Grüne Nachweise:
  - `T-ACT-R11-01 bis -13; EV-ACT-R11-L01 bis -L10, PRE01 bis PRE05, W01
    und R01 bis R03.`
- Wiederverwendete Nachweise:
  - `unveränderte R10-DONE-Advisor-/RLS-/ACL-Evidence und HCR-028.`
- Nicht ausgeführte Smokes:
  - `keine Device-/APK-/produktiven Report-/Activity-Smokes gemäß Scope; kein
    SQL16, Fixture, Rollback, Retry oder Consumerdeploy.`
- Produktiver Iststand:
  - `SQL25 kanonisch installiert; V1 65/invalid 0, V2 0/0/0, Katalog 78/80,
    Range-Report 1 und R10-Hash unverändert; midas-monthly-report aktiv
    Version 50, Product-Webdateien unverändert.`
- Externer Review:
  - `CodeRabbit CLI 0.7.5 unter WSL; exakt ein Initial- und ein
    Verifikationslauf. F-ACT-R11-43 bis -47 vollständig bewertet und fixed.`
- Offene Findings:
  - `none in scope; bekannte Advisorwarnungen bleiben Watchlist.`
- Commit-Entscheidung:
  - `S5 PASS; Commit/Push bleiben Owneraktionen nach S6.`

S5-Abschluss: Gesamtdiff, SQL-Unterbau, Isolation, produktiver Preflight,
einmaliger SQL25-Lauf und alle Read-only-Postconditions sind grün. Keine offene
In-Scope-P0/P1 und keine unautorisierte Produktwirkung.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Nur bewiesene R11-Verträge synchronisieren in:
   - `docs/modules/Activity Module Overview.md`
   - `docs/modules/Doctor View Module Overview.md`
   - `docs/modules/Reports Module Overview.md`
   - `docs/Future trainingsmodule update thoughts.md`
2. Neue dauerhafte QA-ID in `docs/qa/health-capture-reports.md` ergänzen.
3. `sql/HOW_TO.md` und Fresh-Build-Reihenfolge nur bei real installiertem
   SQL 25 aktualisieren.
4. Changelog-Relevanz unter `Unreleased` entscheiden. R11 ist bemerkenswert,
   falls SQL-/Consumergrundlage oder Reportvertrag abgeschlossen wurde; kein
   Release-Cut oder Tag.
5. Finalen Contract Review gegen realen Diff, Runtimepostimage, Roadmap,
   Evidence und R12-R14-Grenze durchführen und Findings korrigieren.
6. Owner-Recap in Alltagssprache schreiben:
   - was intern V1/V2-kompatibel wurde
   - warum der Arztbericht bewusst kurz bleibt
   - warum V2 trotzdem noch nicht sichtbar ist
7. Resume Card auf DONE setzen und R12 als einziges nächstes Core-Gate nennen.
8. Commit-Empfehlung aus dem realen Diff ableiten.
9. Roadmap und Evidence gemeinsam mit `(DONE)` nach `docs/archive/` verschieben.

Ergebnis:

- Source-of-Truth-Sync:
  - `Activity Module Overview, Doctor View Module Overview, Reports Module
    Overview, Activity-V2-Masterplan, HCR-029, sql/HOW_TO.md und CHANGELOG.md
    Unreleased auf das bewiesene R11-Postimage synchronisiert.`
- Finaler Review:
  - `PASS; realer Gesamtdiff, produktives Function-/ACL-/Auth-/Daten-/Advisor-/
    Edge-Postimage, R12-R14-Scope, Productload, Test-DML, Secretgrenze und
    Archivlinks geprüft. Direkt invalidierte Isolation/final Contracts 9/9 und
    Guard PASS. Keine offenen Findings.`
- Restrisiken:
  - `Nur die unveränderte produktive Watchlist: drei intentionale R8/R9-
    SECURITY-DEFINER-Warnungen, Leaked-Password-Protection und acht
    unused-index-Infos. Kein Hinweis betrifft SQL25.`
- Changelog-Relevanz:
  - `Unreleased aktualisiert; der produktive gemeinsame Read-Unterbau und die
    abgeschlossenen Doctor-/Report-/Health-V3-Verträge sind bemerkenswert.
    Kein Release-Cut oder Tag.`
- Owner Recap:
  - `V1-Events und V2-Sessions besitzen jetzt intern einen gemeinsamen,
    ownergebundenen read-only Snapshotvertrag.`
  - `SQL25 ist produktiv installiert, ohne Activity- oder Reportdaten zu
    verändern.`
  - `Aktive Tage bedeuten unterschiedliche Wiener Kalendertage; Same-day-
    Einheiten werden nicht als mehrere Aktivtage gezählt.`
  - `Der Arztbericht bleibt report-first, kurz erfassbar und frei von Übungs-,
    Satz-, Rep-, Gewichts-, Volumen- und Empfehlungsebene.`
  - `Doctor-Drilldown, neue Reportcopy, Health Export V3 und Edgeadapter sind
    vollständig getestet, aber noch nicht produktiv verdrahtet.`
  - `Health Export V2 und der getrennte R10-Coaching-Export bleiben
    unverändert.`
  - `Activity V1 bleibt der einzige produktive Capture-Pfad.`
  - `R12 ist das nächste Core-Gate; R13 aktiviert später read-only Consumer,
    R14 allein den Activity-V2-Capture.`
- Archiv:
  - `docs/archive/MIDAS Activity V2 R11 Doctor View and Report Integration Roadmap (DONE).md`
  - `docs/archive/MIDAS Activity V2 R11 Doctor View and Report Integration Evidence (DONE).md`
- Commit-Empfehlung:
  - `Ein atomarer R11-Commit nach Ownerprüfung der bereits vor R11 vorhandenen,
    nun mitgeführten Masterplan-/Overview-/HCR-Deltas; vorgeschlagene Message:
    feat(activity): prepare R11 doctor and report consumers. Commit und Push
    bleiben Owneraktionen.`

Exit: R11 ist dokumentiert, archiviert und commitbereit. R12 darf auf dem
bewiesenen Postimage planen; R11 aktiviert Activity V2 nicht selbst.

## Finales Akzeptanzbild

R11 ist erfolgreich, wenn ein frischer Chat und die Testmatrix belegen können:

- V1 und V2 besitzen genau einen gemeinsamen, sicheren Read-only-
  Consumervertrag auf Event-/Sessionebene.
- Frequenz bedeutet aktive Kalendertage, nicht Anzahl Sätze oder Sessions.
- Der Arztbericht bleibt genauso ruhig wie heute und enthält keine
  Fitnessdetailflut.
- Doctor View kann V2-Zusammenfassungen später read-only anzeigen.
- Health Export V2 bleibt stabil; V3 ist maschinenlesbar und isoliert bereit.
- Alte Arztberichte, R10-Coachingexport und alle Activity-Rohdaten bleiben
  unverändert.
- In R11 ist höchstens der read-only SQL-Unterbau produktiv; die sichtbare
  Read-Consumer-Aktivierung gehört R13 und der Capture-Cutover ausschließlich
  R14.

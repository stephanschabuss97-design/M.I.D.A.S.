# MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap

Begrenzte Katalog-Wartungsroadmap zwischen dem abgeschlossenen R3-Fundament
und R4. Der allgemeine Arbeitsvertrag steht in
`docs/templates/MIDAS Roadmap Workflow Contract.md` und wird hier nicht
dupliziert.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Activity V2 / versionierter Übungs- und Aktivitätskatalog` |
| Owner / Kontext | `Stephan; single-user MIDAS; reales Studioinventar als Suchvokabular` |
| Chat-Lebenszyklus | `Denkraum -> eigener C2-Ausführungs-Chat` |
| Erstellt am | `2026-08-01` |
| Letzter Stand | `2026-08-01; S6 Source-of-Truth-Sync, finaler Full Contract Review, produktiver Read-only-Sentinel und Archivierung PASS` |
| Aktueller Schritt | `C2 DONE; R4 ist der nächste erlaubte Rolling-Wave-Schritt, Produktaktivierung bleibt gesperrt` |
| Risikoklasse | `R3; produktiver additiver SQL-Write ohne Schemaänderung` |
| Standard-Reviewtiefe | `Full` |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `S4R und produktives S5-SQL-Gate: Extra High; reine Referenzpflege: Medium` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `Activity-V2-Semantik unter app/modules/vitals-stack/activity/v2/; C2-Vertrag; Inventarreferenz; read-only Katalog-Inspector/Runbook; sql/21_Activity_V2_Catalog_V2.sql; SQL-Fixture; QA/HOW-TO` |
| Deploy relevant | `nein; keine Edge Function, kein Frontend-Cutover` |
| Produktive Schreibwirkung | `ja; exakt vollständiger catalog_version-2-Snapshot in bestehender Tabelle` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Evidence (DONE).md` |
| Gekoppelte Roadmaps | `R1/R2/R3 bleiben unveränderte Preconditions; das C2-Eingangsgate für R4 ist erfüllt` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `C2 deterministisch umsetzen: vollständigen Katalog v2 mit realem
    Studio-Suchvokabular anlegen, lokal und disposable beweisen und erst nach
    expliziter Freigabe additiv nach Supabase projizieren.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High; nur S4R und produktives SQL-Gate Extra High.`
- Kontextübergabe aus dem Denkraum:
  - `PASS: Owner hat am 2026-08-01 die Identitätsmatrix, 80 Einträge, keinen
    hip_flexion-Key und die kontrollierte Repo-Referenz freigegeben; vor dem
    ersten produktiven Write zusätzlich 31 freie-Gewichte-Aliase und einen
    schlanken versionierten Wartungspfad ausdrücklich beauftragt.`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  5. `docs/Future trainingsmodule update thoughts.md`, gezielt Zielbild,
     Katalogvertrag, Abschnitt 5.6, C2/R4 und O-7
  6. `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
  7. `docs/modules/Activity Module Overview.md`, gezielt Activity V2 R1-R3
  8. `docs/archive/MIDAS Activity V2 R1 Semantics and Product Contract Roadmap (DONE).md`,
     nur finaler Vertrag und relevante D-/T-IDs
  9. `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Roadmap (DONE).md`
     und zugehörige Evidence, nur Katalogprojektion, RPC- und SQL-Gates
  10. `docs/archive/MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap (DONE).md`,
      nur Semantik-Injection, Katalogversion und Abschlussübergabe
  11. `C:\Users\steph\Desktop\Bilder Gym\Fitnessstudio_Geraeteinventar.md`
  12. `git status --short und nur der C2-relevante Diff`
- Startschritt:
  - `S1 - System- und Vertragsdetektivarbeit.`
- Erlaubte Autonomie:
  - `Lokale Reads, gezielte Edits, Contract-Tests, Browser-Harness und
    disposable Docker-/Supabase-Tests. Keine produktive Aktion ohne Gate.`
- Owner-Gates:
  - `S5: produktiver read-only Preflight; danach separates Owner Briefing und
    ausdrückliche Freigabe für sql/21_Activity_V2_Catalog_V2.sql.`
- Stop-Bedingungen:
  - `Abweichendes Inventar, R1-v1-Drift, geändertes R2-Schema, unklare
    Bewegungsidentität, v2-Teilbestand/Drift in Produktion, erforderliche
    Schema-/RLS-/Grant-Änderung oder Scope-Ausweitung in R4/UI.`
- Halluzinationsschutz:
  - `Die Trainingsplan-Markdown und das PDF im externen Ordner sind keine
    C2-Quellen. Fehlende Geräteidentitäten nicht aus Herstellertexten oder
    medizinischen Vermutungen erfinden. Die Inventardatei enthält zusätzlichen
    Gesundheits- und Planungskontext; ins Repo wird daraus nur eine bereinigte
    Inventarreferenz ohne persönliche Gesundheitsdaten, Trainingshinweise oder
    medizinische Einordnung übernommen.`
- Startprompt:

```text
Arbeite die MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap
gemäß ihrer Ausführungs-Chat-Startkarte ab. Lies die festgelegten Quellen in
der angegebenen Reihenfolge, prüfe den realen Git- und Systemstand und beginne
mit S1. Die Owner-Identitätsmatrix ist freigegeben. R1, R2 und R3 bleiben
unverändert gültig; R4, Produkt-UI und echte Activity-V2-Nutzung sind nicht
Teil dieses Auftrags. Erfinde keine fehlenden Verträge und führe kein
produktives SQL ohne das vorgesehene Owner-Gate aus.
```

## Session Resume Card

- Abschluss: `C2 DONE; S1-S6 einschließlich S4R, produktivem Owner-Gate,
  Abschlussreview, Source-of-Truth-Sync und Archivierung PASS.`
- Katalogvertrag: `v1 bleibt exakt 78; v2 ist ein vollständiger unveränderlicher
  80er-Snapshot mit 47 Aliasergänzungen an 24 Basis-Keys und den zwei neuen
  Bewegungsidentitäten high_row und total_abdominal.`
- Suchvertrag: `53 Studio-/Normalisierungsfälle plus fünf Kompatibilitäts- und
  Limitfälle PASS; Aliase erzeugen Suchwege, aber keine neue Historienidentität.`
- Produktiv: `PostgreSQL 17.6; v1=78, v2=80, andere Versionen=0,
  v2-Sessionreferenzen=0; vier Tabellen/RLS/Policies, zwei RPCs und Minimal-ACL
  unverändert. SQL 21 wurde genau nach Owner-Freigabe ausgeführt.`
- Produktgrenze: `Kein C2-Scriptload, keine UI, keine reale V2-Session und keine
  Änderung an Activity V1, R1-/R3-Source, SQL 20 oder Explicit Grants.`
- Nachweise: `T-ACT-C2-01 bis -10, EV-ACT-C2-B01 bis -B03, L01 bis -L04,
  PRE01 bis -PRE04 und W01 PASS; final erneut 11/11 Syntax, 56/56 Node-Tests,
  Inspector-Parität, git diff --check und produktiver Read-only-Sentinel PASS.`
- Findings: `Kein offenes In-Scope-P0/P1. F-ACT-C2-01/-05/-13 bleiben
  wirksam mitigiert, alle übrigen F-ACT-C2-Findings sind fixed;
  W-ACT-C2-01 bleibt ausschließlich mit neue-Katalogversion-Gate deferred.`
- Dauerhafte Quellen: `C2-Katalogvertrag unter docs/, bereinigte
  Inventarreferenz und Wartungsrunbook unter docs/reference/activity-v2/ sowie
  Roadmap/Evidence als (DONE) unter docs/archive/.`
- Git: `Der abgegrenzte C2-Diff ist uncommittet und commitbereit; keine
  fremden Änderungen sind einzubeziehen. Commit und Push bleiben Owner-Aktionen.`
- Nächster erlaubter Schritt: `R4 in einem eigenen Ausführungsauftrag auf dem
  realen v2-Vokabular beginnen. Die sichtbare Activity-V2-Produktnutzung bleibt
  bis zu ihren zuständigen Folgeroadmaps gesperrt.`

## Zielvertrag

Prüfbares Endergebnis:

- Eine dauerhaft repo-verfügbare, aus der externen Quelle abgeleitete
  Inventarreferenz dokumentiert die 20 verifizierten Kraftmaschinen und die
  relevanten Cardiobezeichnungen. Sie übernimmt keine persönlichen
  Gesundheitsdaten, Trainingshinweise, medizinische Einordnung oder Fotos.
- Ein separater freigegebener Katalog-v2-Vertrag beschreibt exakt 80 aktive
  Einträge: alle 78 v1-Keys plus `high_row` und `total_abdominal`.
- `catalog_version: 1` bleibt vollständig und exakt unverändert; Version 2 ist
  ein vollständiger Snapshot und kein Delta.
- `schema_version` bleibt `midas.activity-catalog.v1`, weil C2 nur Inhalte und
  keine Katalogstruktur ändert.
- Eine additive v2-Semantik-API stellt dieselben fünf öffentlichen Operationen
  wie R1 über Version 2 bereit, ohne `AppModules.activityV2.semantics` oder
  dessen v1-Verhalten zu ersetzen.
- Alle 20 Kraftmaschinenbezeichnungen und relevanten Cardiobezeichnungen
  besitzen einen exakten, kollisionsgeprüften Suchnachweis.
- `Multi Hip` liefert bei der allgemeinen Suche deterministisch drei
  bewegungsspezifische Kandidaten und niemals einen erfundenen Einzelkey.
- Der R3-Draft kann die v2-Semantik über seine vorhandene Injection nutzen und
  hält dann `catalog_version: 2`; R3-Produktcode wird dafür nicht geändert.
- `sql/21_Activity_V2_Catalog_V2.sql` projiziert ausschließlich den exakten
  v2-Snapshot in `public.health_activity_catalog_entries`, ist idempotent,
  erkennt Drift und verändert weder v1 noch Schema, RLS, ACL oder RPCs.
- Der produktive Nachweis endet mit exakt 78 v1- und 80 v2-Zeilen sowie grünen
  Negativnachweisen für R1/R2/R3 und Produktisolation.
- C2-DONE hebt ausschließlich das R4-Kataloggate auf. Es aktiviert keine
  Activity-V2-Oberfläche und erlaubt noch keine reale V2-Session.

Bewusst unverändert:

- Activity V1, `health_events`, Doctor View, Reports und aktuelle
  Trainingszusammenfassung.
- R2-Tabellen, Constraints, RLS, Grants und beide RPC-Signaturen.
- R3-Draft-, Shell-, Timer- und Lifecycle-Vertrag.
- Keine Retention, Korrektur, Löschung, Migration bestehender Historie oder
  produktive Consumer-Verdrahtung.

## Problem und Ist-Zustand

- Beobachtung:
  - `Katalog v1 ist eine breite generische Baseline. Das reale Studio verwendet
    zusätzliche Gerätenamen, von denen einige Aliase und zwei eigenständige
    klassische Bewegungsidentitäten sind.`
- Risiko oder Reibung:
  - `R4 würde ohne C2 reale Begriffe nicht finden oder unterschiedliche
    Bewegungen unter falscher Historie zusammenführen.`
- Offene Hypothese:
  - `Die interne Dateiaufteilung der additiven v2-Semantik wird in S2 nach
    Prüfung des scriptlosen Repo-Setups festgelegt; die öffentliche Grenze ist
    bereits eingefroren.`

## Owner-Freeze: Katalog v2

### Bestehende Keys mit neuen Studio-Suchwegen

<!-- markdownlint-disable MD013 -->

| Studiobezeichnung | Kanonischer Key | C2-Vertrag |
| --- | --- | --- |
| `Glute` | `glute_kickback` | Alias; geführte einseitige Hüftstreckung |
| `Abductor` | `hip_abduction` | Alias |
| `Adductor` | `hip_adduction` | Alias |
| `Rotary Calf` | `calf_raise` | Alias |
| `Low Row` | `seated_row` | Alias; tiefer horizontaler Zug |
| `Pulldown` | `lat_pulldown` | Alias |
| `Vertical Traction` | `lat_pulldown` | Gerätevariante desselben vertikalen Zugmusters |
| `Pectoral` | `chest_fly` | Alias |
| `Delts Machine` | `lateral_raise` | Alias |
| `Abdominal Crunch` | `core_press` | geführte belastete Bauchpresse |
| `Rotary Torso` | `torso_rotation` | bereits vorhandener Suchweg; kein neuer Key |
| `Lower Back` | `back_extension` | Alias |
| `Stepmill` | `stair_climber` | Alias |
| `Fahrradergometer` | `cycling` | Alias |

<!-- markdownlint-enable MD013 -->

### Freie-Gewichte-Suchsprache

- Der weiterhin 80 Einträge umfassende Snapshot hängt insgesamt 47 Aliase an
  24 v1-Keys an; davon sind 31 gezielte Kurzhantel-, Langhantel- und
  Kettlebell-Suchformen aus F-01/F-03/F-05.
- Die vollständige wert- und reihenfolgeverbindliche Liste steht ausschließlich
  in `existing_alias_appends` des maschinenlesbaren C2-Vertrags.
- Es entstehen keine weiteren Keys: Plank, Wall Sit und Romanian Deadlift sind
  bereits vorhanden; ungenutzte Holds oder Kettlebell-Spezialbewegungen werden
  nicht spekulativ ergänzt.

### Neue Keys

<!-- markdownlint-disable MD013 -->

| Key | Label / Aliase | Fachvertrag | Feldvertrag |
| --- | --- | --- | --- |
| `high_row` | `High Row`; Alias `Upper Back` | hoher horizontaler Zug, getrennt von `seated_row` | `strength_sets`; `reps` und `weight_kg` required; `note` optional; `machine`; `device_relative`; Muskeln `back`, `biceps`, `shoulders` |
| `total_abdominal` | `Total Abdominal` | kombinierte Rumpf- und Hüftbeugung, getrennt von `core_press` | `strength_sets`; `reps` und `weight_kg` required; `note` optional; `machine`; `device_relative`; Muskeln `core`, `hip_flexors` |

<!-- markdownlint-enable MD013 -->

### Multi Hip

- `Multi Hip Abduction` -> `hip_abduction`
- `Multi Hip Adduction` -> `hip_adduction`
- `Multi Hip Extension` -> `glute_kickback`
- Suche nach `Multi Hip` liefert genau diese drei Kandidaten gemäß dem
  unveränderten R1-Ranking in der Reihenfolge `glute_kickback`,
  `hip_abduction`, `hip_adduction`. Die Treffer entstehen über die eindeutigen
  Bewegungsaliase `Multi Hip Extension`, `Multi Hip Abduction` und
  `Multi Hip Adduction`, nicht über drei kollidierende identische Aliase.
- Kein generischer `multi_hip`-Key.
- Kein `hip_flexion`-Key in C2. Eine spätere reale Erfassungsanforderung
  benötigt eine neue Katalogversion.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-C2-01 | 2026-08-01 | C2 liegt außerhalb R1-R12 und ist nach R3, vor R4 auszuführen. | Reales Suchvokabular muss vor produktnaher Suche stabil sein. | Reihenfolge |
| D-ACT-C2-02 | 2026-08-01 | Katalog v1 bleibt exakt unverändert; v2 ist ein vollständiger 80-Zeilen-Snapshot. | Alte Sessions bleiben reproduzierbar; Versionen sind keine Patches. | Datenvertrag |
| D-ACT-C2-03 | 2026-08-01 | `schema_version` bleibt v1, `catalog_version` wird 2. | Die Struktur ändert sich nicht. | Semantik |
| D-ACT-C2-04 | 2026-08-01 | `high_row` und `total_abdominal` sind neue Keys; die übrigen freigegebenen Studiobezeichnungen sind Aliase bestehender Keys. | Getrennte Bewegungsidentität nur dort, wo letzte Leistung sonst fachlich irreführend wäre. | Owner-Freeze |
| D-ACT-C2-05 | 2026-08-01 | Multi Hip wird bewegungsspezifisch auf drei bestehende Keys abgebildet; kein `multi_hip` und vorerst kein `hip_flexion`. | Das Gerät ist keine einzelne Bewegung. | Suche |
| D-ACT-C2-06 | 2026-08-01 | Aus dem Inventar-Markdown wird eine bereinigte Inventarreferenz unter `docs/reference/activity-v2/` abgeleitet; Gesundheits-/Planungskontext und Fotos bleiben außerhalb. | Fresh Chats benötigen Geräte- und Suchfakten, nicht persönliche Gesundheitsdaten oder Trainingsplanung. | Doku |
| D-ACT-C2-07 | 2026-08-01 | Trainingsplan-Markdown und PDF im externen Ordner sind keine C2-Quellen. | C2 beschreibt Suchvokabular, keinen Plan. | Scope |
| D-ACT-C2-08 | 2026-08-01 | V2 erhält eine additive Semantik-API; R1-Namespace und v1-Verhalten werden nicht ersetzt. | Archivierte R1-Verträge und R3-Fallback bleiben gültig. | Codegrenze |
| D-ACT-C2-09 | 2026-08-01 | R3 konsumiert v2 ausschließlich über vorhandene Semantik-Injection; kein R3-Source-Umbau. | R3 wurde ausdrücklich versionsagnostisch gebaut. | Consumer |
| D-ACT-C2-10 | 2026-08-01 | SQL 21 akzeptiert vor dem Insert nur v2=0 oder einen bereits exakt vertragsgleichen 80-Zeilen-Snapshot; Teilbestand/Drift stoppt vor jeder Änderung. Danach ist es insert-only und idempotent, ohne Updates oder Deletes. | Katalogversionen sind unveränderliche Snapshots und dürfen nicht still repariert werden. | SQL |
| D-ACT-C2-11 | 2026-08-01 | Bestehende RLS-, ACL-, Grant- und RPC-Verträge werden wiederverwendet. | C2 ergänzt nur Zeilen derselben Tabelle. | Security |
| D-ACT-C2-12 | 2026-08-01 | C2 verändert keinen Produkt-Scriptload und aktiviert keine UI. | Produktiver Cutover bleibt R11. | Produktgrenze |
| D-ACT-C2-13 | 2026-08-01 | Vor dem ersten produktiven v2-Write werden 31 freie-Gewichte-Suchformen als Aliase bestehender Bewegungskeys ergänzt; v2 bleibt bei 80 Einträgen und zwei neuen Keys. | Suchbarkeit darf nicht von der Kenntnis des abstrakten englischen Labels abhängen. | Owner-Scope-Korrektur |
| D-ACT-C2-14 | 2026-08-01 | Ein read-only Inspector und ein Wartungsrunbook bilden den kleinen künftigen Katalogpfad. Eine spätere Katalogversion bleibt Activity V2; produktiv vorhandene Snapshots werden nie mutiert. | Ein fehlender Übungsname soll kontrolliert ergänzbar sein, ohne freie App-Einträge oder standardmäßig eine Großroadmap zu verlangen. | Wartbarkeit |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap.`
- Neue oder entscheidungsrelevante Konzepte:
  - `Vollständiger unveränderlicher Katalogsnapshot statt Alias-Patch; additive
    produktive SQL-Projektion.`
- Geplante Briefing-Gates:
  - `S5 unmittelbar vor produktiver Ausführung von SQL 21.`
- Nicht erneut zu erklären:
  - `Normale JavaScript-Tests, Aliaspflege, Markdown-Sync und lokale
    Suchmatrixtests.`

## Scope und Grenzen

In Scope:

- Bereinigte Repo-Referenz der verifizierten Geräte- und Suchfakten des
  Studioinventars.
- Separater Katalog-v2-Vertrag.
- Additive v2-Semantik mit identischer öffentlicher Operationsform wie R1.
- Vollständiger 80-Einträge-Snapshot und deterministische Suchmatrix.
- R1-/R3-Kompatibilitätstests ohne Änderung ihrer Produktquellen.
- Additives SQL 21 samt disposable Fixture, Evidence und produktivem Gate.
- Read-only Katalog-Inspector und kompaktes Wartungsrunbook ohne Produktload,
  SQL-Ausführung oder freie App-Einträge.
- Doku-, QA-, HOW-TO- und Masterplan-Sync nach bewiesenem Abschluss.

Nicht in Scope:

- R4-Suchoberfläche oder Supabase-Lookup-Interaktion.
- Kraftsatz-, Cardio-, Save-, Recovery-, Export- oder Doctor-View-Editoren.
- Trainingsplan, Übungsempfehlung, CKD-Eignung oder Hersteller-/Studio-ID.
- Activity-V1-Migration, produktiver Activity-V2-Scriptload oder reale Session.
- Neuer `hip_flexion`-Key.
- Bilder als Runtime- oder Repository-Assets.

Roadmap-spezifische Guardrails:

- Keine Änderung an `catalog_version: 1`, weder im Repo noch produktiv.
- Keine Aliasfreigabe ohne exakten Kollisions- und Suchnachweis.
- Keine Änderung von `sql/20_Activity_V2.sql` außer ein S1-Finding beweist
  einen blockierenden Fehler; dies wäre ein Scope-Wechsel und stoppt S4.
- Keine Änderung an `sql/16_Explicit_Grants.sql`, solange der bestehende
  Tabellenzugriff unverändert ausreicht.
- Keine v2-Korrektur durch `UPDATE`; Drift stoppt und erfordert Review.
- Keine Secrets, personenbezogenen Trainingsdaten oder Fotodateien in
  Roadmap/Evidence.
- Keine Übernahme von Medikation, CKD-/Befundkontext, Blutdruck,
  Trainingsplanung oder medizinischen Hinweisen aus der externen
  Inventardatei in die Repo-Referenz.

## Scope-Freeze vor S4

- Bestehende Features:
  - `Activity V1 bleibt sichtbar und aktiv; Activity V2 R1-R3 bleiben
    unverdrahtete Grundlagen.`
- Datenmodell, Lifecycle und Retention:
  - `Schema, Lifecycle und Retention unverändert; nur 80 additive
    Katalog-v2-Zeilen.`
- Cleanup, Scheduler, Secrets und externe Automationen:
  - `nicht betroffen.`
- Kompatible Producer und Consumer:
  - `R1 v1-Semantik; R2-Katalogtabelle und RPCs; R3-Semantik-Injection;
    R4 erhält v2 später als Precondition.`
- Offene Grundsatzfragen:
  - `none; interne v2-Dateiaufteilung ist eine technische S2-Entscheidung
    innerhalb der eingefrorenen öffentlichen Grenze.`
- Umgang mit späterem Scope-Wechsel:
  - `Gezielte S2/S3/S4R-Korrektur für Alias-/Toolingpflege; bei UI, Schema,
    unklarer Identität oder neuem Risikopfad Follow-up.`

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/Future trainingsmodule update thoughts.md`
- `docs/modules/Activity Module Overview.md`
- `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
- `app/modules/vitals-stack/activity/v2/semantics.js`
- `app/modules/vitals-stack/activity/v2/semantics.contract.test.js`
- `app/modules/vitals-stack/activity/v2/session-draft.js`
- `app/modules/vitals-stack/activity/v2/session-shell.js`
- `sql/20_Activity_V2.sql`
- `sql/tests/20_Activity_V2_fixture.sql`
- `sql/16_Explicit_Grants.sql`
- `C:\Users\steph\Desktop\Bilder Gym\Fitnessstudio_Geraeteinventar.md`

Nur bei konkreter Vertragsfrage:

- archivierte R1-/R2-/R3-Roadmaps und R2-Evidence gemäß Startkarte
- die 27 Inventarfotos nur bei einem echten Widerspruch im Markdown
- aktuelle Supabase-Dokumentation/Changelog vor produktivem SQL

Explizit keine C2-Quelle:

- `C:\Users\steph\Desktop\Bilder Gym\Ganzkoerper_Trainingsplan_V2-2.md`
- `C:\Users\steph\Desktop\Bilder Gym\Ganzkörper Trainingsplan (1).pdf`

## Tool Permissions und Gates

Allowed:

- Repo- und externe Inventar-Reads.
- Gezielte lokale Dateiänderungen mit `apply_patch`.
- Node-/Browser-/Contract-Tests.
- Docker und lokaler Supabase-Stack für disposable SQL-Tests.
- Produktive read-only Preflight-Abfragen ohne Secret-Ausgabe.

User-gated:

- Produktive Ausführung von `sql/21_Activity_V2_Catalog_V2.sql`.
- Jede produktive Löschung oder Driftbereinigung, falls überhaupt erforderlich.

Forbidden:

- Secrets ausgeben oder committen.
- Fremde Worktree-Änderungen zurücksetzen.
- Scope, Datenwirkung oder Architektur still erweitern.
- Produkt-Scriptload, R4, Activity V1 oder R3-Source ändern.
- Trainingsplan oder medizinische Eignung aus dem Inventar ableiten.
- v1-Zeilen ändern, löschen oder als v2-only Delta behandeln.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `High` | PASS | Pflichtquellen, Inventar 20/6, R1 78er-Baseline, R2-SQL/RLS/ACL, R3-Injection, 50/50 Tests sowie Owner-Live-Server-Smokes und Produktisolation real belegt; F-ACT-C2-01 für C2 mitigiert. |
| S2 | Katalog-v2-, Such- und API-Zielvertrag | `High` | PASS | 80er-Snapshot, 47 Aliasergänzungen an 24 Basis-Keys, zwei neue Keys, additive semanticsV2-API, vollständige Search-Matrix und kleiner Wartungspfad festgelegt; F-ACT-C2-02/-03/-16 korrigiert. |
| S3 | Bruchrisiko-, Security- und SQL-Review | `High` | PASS | Keine Rang-1-Verdrängung oder Kollision; Crunch-/Limit-Verhalten explizit gemacht, R2-FK/Commit/History und unveränderte RLS/ACL geprüft, atomaren SQL-/Rollbackvertrag sowie S4-/S5-Gates geschlossen. |
| S4R | Readiness und sichere Ausführungsblöcke | `Extra High` | PASS | Scope-Freeze, Dateien, Checks, Invalidation und vier S4-Blöcke final; Testdateigrenze präzisiert, Roadmap kompaktiert und S4.5 auf guarded PSQL-only ohne Remote-/Reset-Pfad begrenzt. |
| S4.1 | Inventarreferenz und v2-Vertrag | `Medium` | PASS | Bereinigte K-01..K-20-/C-01..C-06-Referenz und vollständiger maschinenlesbarer 80er-Snapshot mit 47 Aliasergänzungen, zwei neuen Keys sowie 53+5 Suchfällen angelegt und erneut reviewt. |
| S4.2 | Additive v2-Semantikgrenze | `High` | PASS | Tief eingefrorene additive Fünf-Methoden-API registriert fail-closed unter semanticsV2; R1-Namespace, Fallback und Produktload unverändert. |
| S4.3 | Vollständiger v2-Katalog und Suchmatrix | `High` | PASS | Vollständiger 80er-Snapshot entspricht dem korrigierten Vertrag exakt; 78 Basis-Entries, 47 Aliasergänzungen, zwei neue Keys sowie 53+5 Suchfälle erneut reviewt. |
| S4.4 | JS- und R3-Kompatibilitätsnachweise | `High` | PASS | Gesamtsuite 56/56; R3-Draft und -Shell mit injiziertem v2 und beiden neuen Keys grün; R1/R3/Produkt/SQL-Quellen unverändert und kein Produktload. |
| S4.5 | Additives SQL 21 und disposable Fixture | `High` | PASS | Vollständige insert-only 80er-Projektion und guarded Mehrphasen-Fixture; lokaler PG-17.6-Aufbau 78/80, exakter Re-Run, Teilbestand-/Inhaltsdrift-Fail sowie v2-Commit/Lookup PASS; keine produktive Wirkung. |
| S4.6 | Gesamter C2-Code-/Contract-Review | `High` | PASS | Gesamter C2-Diff gegen Zielvertrag, D01-D14, Findings, Scope und Security reviewt; Vertrag/JS/SQL wertgleich, 11/11 Syntax, 56/56 JS sowie T01-T08 und L01-L04 grün; keine produktive Wirkung. |
| S5 | Tests, produktives SQL-Gate und Abschlussreview | `Extra High am Write-Gate, sonst High` | PASS | T01-T10 und W01 PASS; SQL 21 produktiv ausgeführt, v1=78/v2=80 jeweils repo-identisch, Referenzen=0 sowie Objekt-/Security-Grenzen unverändert. |
| S6 | Doku-Sync, Recap, Commit-Empfehlung und Archiv | `High` | PASS | Overview, Masterplan, QA und SQL-HOW-TO synchron; finaler Contract-/Git-/Produktreview grün, Changelog bewusst unverändert, Owner Recap und Archivierung abgeschlossen. |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-C2-01 | `P1` | `Inherited Contract / SQL` | `mitigated` | `Reales SQL 20 ergänzt fehlende v1-Zeilen vor seinem Driftvergleich und ist damit schwächer als der archivierte R2-Rerun-Text. Der Ursprung bleibt wegen der unveränderten R2-Precondition außerhalb C2. C2 behandelt SQL 20 ausschließlich als frischen disposable Bootstrap; SQL 21 muss v1 vor dem ersten Write exakt prüfen und bei Abweichung stoppen. Keine R2-Datei geändert.` |
| F-ACT-C2-02 | `P2` | `Search Contract` | `fixed` | `Die zunächst erwarteten Singleton-Resultate für Glute und Pulldown widersprachen dem unveränderten R1-Ranking: Nach dem exakten Alias-Treffer folgen glute_bridge beziehungsweise straight_arm_pulldown als Token-Treffer. Die exakte Matrix enthält nun die vollständigen geordneten Resultate; der kanonische Gerätekey bleibt jeweils Rang 1 und es besteht keine normalisierte Kollision.` |
| F-ACT-C2-03 | `P1` | `SQL Contract / Concurrency` | `fixed` | `Ein Precheck ohne Serialisierung hätte zwischen Prüfung und Insert durch einen parallelen Lauf invalidiert werden können. SQL 21 muss die bestehende Katalogtabelle innerhalb seiner Transaktion vor allen Zustandsprüfungen in SHARE ROW EXCLUSIVE MODE sperren; erst danach sind v1/v2-Precheck, bedingtes Insert und Postcheck zulässig.` |
| F-ACT-C2-04 | `P2` | `Search Contract / Compatibility` | `fixed` | `Der freigegebene Alias Abdominal Crunch erweitert die bestehende exakte Suche Crunch von [crunch] auf [crunch, core_press], ohne Rang 1 zu verdrängen. Multi Hip liefert nur ohne restriktives Limit beziehungsweise mit limit >= 3 alle drei Kandidaten; limit 1/2 liefert deterministisch die entsprechenden Präfixe. T-ACT-C2-04 muss beide Effekte explizit prüfen.` |
| F-ACT-C2-05 | `P1` | `Runtime Contract / SQL Gate` | `mitigated` | `R2-Commit akzeptiert ausschließlich max(catalog_version). Der produktive v2-Insert schaltete daher die zulässige Commit-Version sofort von 1 auf 2 um, obwohl er keine UI lädt. T-ACT-C2-06 belegte vor dem Write fehlende Activity-V2-Produktcaller; Owner-Briefing und Write-Gate benannten den Akzeptanzwechsel. Die damalige R4-Blockade ist mit C2-DONE aufgehoben.` |
| F-ACT-C2-06 | `P2` | `Evidence Contract` | `fixed` | `Die S5-Matrix verwies nur auf PRE01/-02 und auf eine nicht angelegte POST01-ID. T-ACT-C2-09 ist jetzt PRE01 bis PRE04 zugeordnet; T-ACT-C2-10 verwendet W01 und den vorhandenen Vorher-/Nachher-Nachweis der Evidence-Datei.` |
| F-ACT-C2-07 | `P2` | `Roadmap Hygiene` | `fixed` | `Die aktive Roadmap hatte mit 1267 Zeilen die Workflow-Kompaktierungsgrenze überschritten und die Resume Card war zu lang. Abgeschlossene S1-/S3-Protokolle und der Handoff wurden verdichtet; Entscheidungen, Findings, Gates, S2-Zielwerte und Restrisiken bleiben erhalten.` |
| F-ACT-C2-08 | `P2` | `Readiness / File Boundary` | `fixed` | `Die Runtimegrenze S4.2-S4.4 verwendet exakt semantics-v2.js und semantics-v2.contract.test.js; kein zusätzlicher Browser-Harness und keine R1-/R3-Sourceänderung. Der später owner-beauftragte read-only Inspector aus F-ACT-C2-16 ist lokales Wartungstooling und kein Runtime-/Produkt-Script.` |
| F-ACT-C2-09 | `P1` | `Disposable SQL Safety` | `fixed` | `Der lokale Stack ist aktuell gestoppt; config.toml warnt vor deprecated inbucket und referenziert eine fehlende seed.sql. S4.5 darf deshalb weder db reset noch --linked/--db-url, Remote-MCP oder Produktwerte verwenden. Zulässig ist nur der nach CLI-Hilfe gestartete lokale Stack und PSQL mit ON_ERROR_STOP gegen die wie R2 auf midas_activity_v2_s45, PostgreSQL >=17, session_user postgres und Owner postgres fail-closed bewachte Datenbank.` |
| F-ACT-C2-10 | `P2` | `Search Matrix / Evidence Count` | `fixed` | `Die ausgeschriebene S2-Pflichtmatrix enthält 37 eigenständige Studio-/Normalisierungsqueries, während die Resume Card verkürzt 36/36 auswies. Der maschinenlesbare Vertrag enthält alle 37 expliziten Fälle plus fünf Kompatibilitäts-/Limitfälle; der falsche Resume-Zähler wurde korrigiert. Identitäten und erwartete Resultate blieben unverändert.` |
| F-ACT-C2-11 | `P2` | `Roadmap / Test Status Sync` | `fixed` | `T-ACT-C2-01 stand nach abgeschlossenem S4.1 und grünem Full Review noch auf TODO. Beim S4.2-S4.4-Abgleich wurde T01 auf PASS gesetzt und die durch den neuen Block validierten T02 bis T06 gleichzeitig mit ihren realen Nachweisen synchronisiert.` |
| F-ACT-C2-12 | `P1` | `SQL Projection Contract` | `fixed` | `Der S4.1-JSON-Vertrag nannte schema_version und fields als SQL-Projektionsspalten, obwohl die reale R2-Tabelle kein schema_version speichert und field_policy verwendet. Die Projektion wurde vor SQL-Erzeugung auf die zwölf realen R2-Spalten korrigiert; T01 und der v2-Vertragstest wurden erfolgreich wiederholt. Kataloginhalt und Runtime waren nicht betroffen.` |
| F-ACT-C2-13 | `P2` | `Local Tooling / Supabase CLI` | `mitigated` | `supabase start --help der installierten CLI 2.109.1 nennt generische Exclude-Namen, die der reale projektgebundene Start derselben CLI als ungültig ablehnt. Der fehlgeschlagene lokale Versuch stoppte seine Container; S4.6 verwendete danach ausschließlich die vom Runtime-Validator ausgegebene gültige Liste und endete mit null laufenden Containern. Kein C2-Code- oder Produktionsfehler; S5 darf die Hilfeausgabe nicht ungeprüft als Runtime-Vertrag behandeln.` |
| F-ACT-C2-14 | `P2` | `Roadmap / Review Scope Sync` | `fixed` | `Die S4R-Zuordnungszusammenfassung nannte weiterhin nur F-ACT-C2-01 bis -09, obwohl in späteren Blöcken weitere Findings entstanden waren. Die Grenze lautet nun dauerhaft alle Findings und bleibt damit für S4.6 und spätere Abschlussreviews vollständig.` |
| F-ACT-C2-15 | `P2` | `Productive Preflight / Search Path` | `fixed` | `Der erste PRE03-Gesamthash wurde im Standard-Search-Path berechnet und meldete 4b7f53… statt des SQL-20-Sollwerts, obwohl alle fünf lokalen und produktiven Strukturkomponenten wertgleich waren. Die read-only Abfrage wurde auf denselben leeren lokalen Search Path wie SQL 20 gebunden und lieferte korrekt 657f31…; keine produktive Schreibwirkung und kein realer R2-Drift.` |
| F-ACT-C2-16 | `P1` | `Search / Maintenance Contract` | `fixed` | `Der Owner belegte vor dem ersten produktiven Write, dass freie-Gewichte-Suchbegriffe unvollständig waren und spätere klare Katalogergänzungen keinen Activity-V3-/Großroadmap-Zwang erzeugen dürfen. Als kleine Scope-Korrektur wurden 31 Aliase ergänzt, 53+5 Suchfälle eingefroren und ein read-only Inspector samt Wartungsrunbook angelegt; weiterhin 80 Entries, zwei neue Keys, kein Schema/UI/Produktload.` |
| F-ACT-C2-17 | `P2` | `Local Catalog Inspector` | `fixed` | `Der erste Inspector-Check erwartete den falschen SQL-Dollar-Tag und stoppte read-only. Der Parser akzeptiert nun den realen versionierten Tag activity_catalog_v2; Vertrag, Runtime und SQL werden vollständig wertgleich geprüft.` |
| F-ACT-C2-18 | `P2` | `Disposable Fixture Invocation` | `fixed` | `Der erste Hostlauf erreichte PostgreSQL über Port 54322, während das bewährte R2-Race-Fixture intern absichtlich auf Container-Port 5432 reconnectet. Der vollständige guarded Lauf wurde deshalb ohne SQL-Änderung im lokalen DB-Container ausgeführt; Full-, Re-Run-, Teilbestand-, Inhaltsdrift- und Cleanup-Nachweise PASS, danach null lokale Container.` |
| F-ACT-C2-19 | `P2` | `Productive CLI File Resolution` | `fixed` | `Der produktive CLI-Erstversuch suchte den relativen SQL-Pfad unter backend/ und stoppte vor jeder SQL-Ausführung. Der Repo-interne absolute Pfad wurde validiert und exakt Artefakt 9c35786d…edef erfolgreich ausgeführt; kein Fehlversuch-Write.` |
| F-ACT-C2-20 | `P2` | `Productive Postcondition Transport` | `fixed` | `Die vollständige Katalogausgabe wurde im lokalen Vergleichskanal gekürzt. Der read-only Nachweis verwendet nun feldweise kanonisierte SHA-256-Hashes; v1 und v2 sind vollständig Repo=Produkt, ohne Rohdaten-/Secret-Ausgabe.` |
| W-ACT-C2-01 | `Watchlist` | `Product` | `deferred` | `hip_flexion erst bei realem Erfassungsbedarf in neuer Katalogversion; blockiert C2 nicht` |

<!-- markdownlint-enable MD013 -->

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Abgeschlossen: Pflichtquellen, Inventar- und Datenschutzgrenze, reale R1-
Semantik, R2-Schema/RPC/RLS/ACL, R3-Injection, Tests, Git- und Toolstand wurden
in der festgelegten Reihenfolge geprüft. Trainingsplan, PDF, Fotos und
Gesundheits-/Planungskontext waren keine C2-Produktquellen.

Ergebnis:

- `PASS: Inventar K-01..K-20/C-01..C-06; R1 Schema v1, catalog_version 1,
  78 aktive Entries, fünf Methoden, Aliaslimit 12, Ranking und Deep Freeze.`
- `PASS: R2 vier RLS-Tabellen, zwei RPCs, versionsfähige FK/max-Version-Commit,
  keybasierter Lookup und unveränderte ACL; R3 nimmt v2 per Injection an.`
- `PASS: gemeinsame R1/R2/R3-Suite 50/50, acht Syntaxchecks, 78/78 JS-/SQL-
  Parität, eingefrorene R2-Hashes und git diff --check.`
- `PASS: Owner-Smokes Semantik 7/7, vollständiger Shell-Flow und Responsive-
  Grenzen; Produktindex ohne Activity-V2-Load. Keine produktive Wirkung.`
- `Full Contract Review PASS; F-ACT-C2-01 an der C2-Grenze mitigiert, keine
  offene fachliche Owner-Frage.`

Exit: Reale v1/v2-, R2- und R3-Grenzen sind eindeutig; kein unerkannter
Consumer oder Datenvertrag fehlt.

## S2 - Katalog-v2-, Such- und API-Zielvertrag

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Den Owner-Freeze dieser Roadmap exakt gegen die R1-Taxonomien und
   Feldpolicies prüfen; keine Identität neu verhandeln.
2. Vollständigen v2-Snapshot festlegen:
   - 78 unveränderte v1-Keys,
   - ausschließlich freigegebene Aliasergänzungen,
   - exakt zwei neue aktive Keys,
   - insgesamt exakt 80 aktive Einträge.
3. Definieren, welche v1-Felder bei bestehenden Keys identisch bleiben und
   dass nur die freigegebene Aliasliste wachsen darf.
4. Additive öffentliche API festlegen:
   - R1 bleibt `AppModules.activityV2.semantics`,
   - v2 erhält `AppModules.activityV2.semanticsV2`,
   - v2 bietet exakt `getCatalog`, `getEntryByKey`, `normalizeSearchText`,
     `validateCatalog` und `search`,
   - keine Top-Level-Globals und keine Produktverdrahtung.
5. Interne Dateiaufteilung für das statische Repo ohne Build-System wählen.
   Bevorzugt wird die kleinste additive Lösung, die v1-Source und -API nicht
   verändert; ein Helper ist nur zulässig, wenn er echte Duplikation reduziert
   und Scriptreihenfolge deterministisch bleibt.
6. Exakte Suchmatrix festlegen:
   - alle 20 K-IDs,
   - relevante Cardio-Namen,
   - Umlaute, Bindestriche, Groß-/Kleinschreibung und Whitespace,
   - keine normalisierte Alias-Kollision,
   - `Multi Hip` exakt in der unveränderten R1-Rangfolge `glute_kickback`,
     `hip_abduction`, `hip_adduction`.
7. R3-Injection-Vertrag festlegen: Draft/Shell erhalten explizit v2, erzeugen
   `catalog_version: 2` und akzeptieren beide neuen Keys; kein Fallbackwechsel.
8. SQL-21-Vertrag festlegen:
   - vollständige 80-Zeilen-Projektion,
   - v1-Baseline vorab als unverändert und vertragsgleich prüfen,
   - v2 vorab bidirektional prüfen: nur 0 Zeilen oder bereits exakt 80
     vertragsgleiche Zeilen sind zulässig,
   - Teilbestand, fehlende/zusätzliche Keys oder Inhaltsdrift vor dem ersten
     Write mit Fehler stoppen,
   - nur bei v2=0 vollständiges Insert; bei exaktem v2 idempotenter No-op,
   - anschließender exakter bidirektionaler Postcheck,
   - keine Schema-, RLS-, Grant-, RPC-, Update- oder Delete-Anweisung.
9. Repo-Referenzziel und separaten v2-Contract-Pfad finalisieren.
10. Full Contract Review, Korrektur und Schritt-Abnahme.

Ergebnis:

- Belegte Fakten:
  - `Der reale R1-Katalog besitzt 78 aktive, nach Key sortierte Entries,
    schema_version midas.activity-catalog.v1, catalog_version 1, exakt fünf
    öffentliche Methoden, Aliaslimit 12 und die benötigten Taxonomiewerte
    machine, back, biceps, shoulders, core und hip_flexors.`
  - `Die lokale S2-Projektionsprobe ergibt 80 aktive Entries, valid=true ohne
    Validatorfehler, maximal acht Aliase pro Entry, wertgleiche Nicht-Alias-
    Felder für alle 78 v1-Keys und unveränderte bestehende Aliaspräfixe.`
- Finaler Zielvertrag:
  - `semanticsV2 liefert einen tief eingefrorenen vollständigen Snapshot mit
    unveränderter schema_version, catalog_version 2 und exakt 80 aktiven,
    ASCII-key-sortierten Entries. Taxonomien und field_definitions bleiben
    wertgleich zu R1.`
  - `An 24 bestehenden Keys dürfen ausschließlich die 47 wert- und
    reihenfolgeverbindlichen Werte aus existing_alias_appends des
    maschinenlesbaren Vertrags angehängt werden. Davon ergänzen 31 Werte die
    freie-Gewichte-Suche; alle übrigen Entry-Felder und vorhandenen
    Aliaspräfixe bleiben wert- und reihenfolgegleich.`
  - `high_row: Label High Row, Alias Upper Back, strength/strength_sets,
    machine/device_relative, reps und weight_kg required, note optional, alle
    übrigen Felder forbidden, muscle_groups back/biceps/shoulders, active.`
  - `total_abdominal: Label Total Abdominal, keine Aliase,
    strength/strength_sets, machine/device_relative, reps und weight_kg
    required, note optional, alle übrigen Felder forbidden, muscle_groups
    core/hip_flexors, active.`
  - `Die öffentliche API ist tief eingefroren und besitzt ausschließlich
    getCatalog, getEntryByKey, normalizeSearchText, validateCatalog und search
    unter AppModules.activityV2.semanticsV2. R1-semantics, Top-Level-Globals,
    Produktindex und R3-Fallback bleiben unverändert.`
  - `R3 erhält dieselbe semanticsV2-Referenz explizit in sessionDraft.create
    und sessionShell.mount. Der Draft-Snapshot trägt catalog_version 2 und
    akzeptiert high_row sowie total_abdominal; es gibt keinen impliziten
    Fallbackwechsel und keine R3-Sourceänderung.`
  - `SQL 21 läuft in genau einer Transaktion mit lokalen Timeouts und sicherem
    search_path, sperrt public.health_activity_catalog_entries vor den
    Zustandsprüfungen in SHARE ROW EXCLUSIVE MODE und erzeugt nur temporäre
    erwartete v1-/v2-Projektionen. Vor dem ersten persistenten Write müssen v1
    bidirektional exakt 78 und v2 entweder 0 oder bidirektional exakt 80 Zeilen
    besitzen. Nur v2=0 erlaubt ein vollständiges 80er-Insert; v2=80 exakt ist
    No-op. Danach müssen v1 und v2 erneut bidirektional exakt sein. Jede
    Abweichung rollt zurück; Schema, RLS, Grants, RPCs, UPDATE, DELETE und
    produktive Bereinigung sind ausgeschlossen.`
- Gewählte Dateiaufteilung:
  - `Referenz: docs/reference/activity-v2/Fitnessstudio_Geraeteinventar.md;
    Vertrag: docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md; Runtime:
    app/modules/vitals-stack/activity/v2/semantics-v2.js; Test:
    app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js.`
  - `semantics-v2.js ist die einzige neue Runtime-Datei. Sie wird in isolierten
    Tests nach semantics.js geladen, verlangt dessen exakte API sowie einen
    validen 78er-Katalog mit Schema v1 und Katalogversion 1 als Basis, leitet
    daraus den vollständigen v2-Wert ab, validiert ihn und registriert
    fail-closed nur semanticsV2. Ein zusätzlicher Helper oder Browser-Harness
    reduziert keine echte Duplikation und wird deshalb nicht eingeplant. Keine
    C2-Datei wird in index.html geladen.`
- Exakte Search-Matrix:
  - `K-01..K-06: Leg Press -> [leg_press], Leg Extension -> [leg_extension],
    Leg Curl -> [leg_curl], Glute -> [glute_kickback, glute_bridge], Abductor ->
    [hip_abduction], Adductor -> [hip_adduction].`
  - `K-07: Multi Hip -> [glute_kickback, hip_abduction, hip_adduction]; die
    vollständigen Queries Multi Hip Extension/Abduction/Adduction liefern
    jeweils ausschließlich ihren gleichnamig vereinbarten Key.`
  - `K-08..K-14: Rotary Calf -> [calf_raise], Upper Back und High Row ->
    [high_row], Low Row -> [seated_row], Pulldown -> [lat_pulldown,
    straight_arm_pulldown], Vertical Traction -> [lat_pulldown], Chest Press ->
    [chest_press], Pectoral -> [chest_fly].`
  - `K-15..K-20: Shoulder Press -> [shoulder_press], Delts Machine ->
    [lateral_raise], Abdominal Crunch -> [core_press], Total Abdominal ->
    [total_abdominal], Rotary Torso -> [torso_rotation], Lower Back ->
    [back_extension].`
  - `C-01..C-06: Stepmill -> [stair_climber], SkiErg -> [ski_erg],
    Ruderergometer -> [rowing], Crosstrainer und Ellipsentrainer jeweils ->
    [cross_trainer], Laufband -> [running, walking], Fahrradergometer ->
    [cycling]. Vollständige beschreibende Inventarsätze und nicht freigegebene
    Hersteller-/Modellnamen sind keine Suchqueries.`
  - `Pflichtvarianten: HÜFTABDUKTION und die Unicode-dekomponierte Form liefern
    [hip_abduction]; MULTI---HIP liefert die unveränderte Dreierreihenfolge;
    Ski-Ergometer -> [ski_erg]; variierende Groß-/Kleinschreibung und äußeres
    oder mehrfaches Whitespace verändern kein erwartetes Resultat. Die kompakte
    kanonische Tabelle wird in S4.1 einmalig in den v2-Vertrag übertragen.`
- Technische Ableitungen:
  - `Die physischen Studiogeräte ändern keine bestehenden equipment-,
    load_comparability- oder field-policy-Werte; insbesondere bleiben
    glute_kickback, calf_raise und back_extension gemäß R1 unverändert.`
  - `Die Supabase-Änderung zur standardmäßigen Data-API-Exposition neuer
    Tabellen ist für C2 nicht einschlägig, weil keine Tabelle, Policy oder
    Berechtigung neu angelegt wird. Bestehende R2-RLS-/Grant-Grenzen werden nur
    wiederverwendet.`
- Findings/Korrekturen:
  - `F-ACT-C2-02 fixed: vollständige statt fälschlich singuläre Resultatlisten
    für Glute und Pulldown festgelegt.`
  - `F-ACT-C2-03 fixed: SQL-21-Precheck durch Transaktionssperre atomar gemacht.`
- S4-Pflichtpunkte:
  - `S4.1 bis S4.6 unverändert; die oben festgelegten Pfade, Werte, Matrix und
    SQL-Reihenfolge dürfen dort nicht still neu verhandelt werden.`
- Doku-Sync:
  - `S2-Status, Findings, Ergebnis und Resume Card in dieser Roadmap
    synchronisiert. v2-Vertrag und bereinigte Inventarreferenz entstehen erst
    in S4.1; übriger Source-of-Truth-Sync wurde in S6 abgeschlossen.`
- Full Contract Review:
  - `PASS im S2-Scope. Owner-Freeze, reale R1-Taxonomien/Policies/Ranking,
    R2-Projektionsspalten, R3-Injection, statische Scriptgrenze, aktueller
    Supabase-RLS/Data-API-Kontext und SQL-21-Atomizität wurden gegeneinander
    geprüft. F-ACT-C2-02/-03 wurden im Zielvertrag korrigiert; kein offenes
    In-Scope-P0/P1 und keine produktive Wirkung.`

Exit: Snapshot, API, Suchmatrix, SQL und Referenzpfade sind vollständig und
ohne offene Grundsatzfrage festgelegt.

## S3 - Bruchrisiko-, Security- und SQL-Review

Reasoning: `GPT-5.6 Sol / High`.

Abgeschlossen: Suchrangfolge/-limits, Validator- und Namespacegrenzen,
R2-Commit/History/FK, RLS/ACL, SQL-Atomizität, Rollback sowie S4-/S5-Gates
wurden gegen den realen Stand geprüft.

Ergebnis:

- `PASS: 80 valide aktive Entries, null Kollisionen und null verdrängte
  Rang-1-Exakttreffer; Crunch -> [crunch, core_press], Multi Hip bei Default/
  limit 3 vollständig und bei limit 1/2 deterministisch gekürzt.`
- `PASS: high_row/total_abdominal erfüllen Regex, Taxonomien, Feldpolicies,
  Sortierung, Aliaslimit und Deep-Freeze-Ziel; R1/R3/Product bleiben isoliert.`
- `PASS: neuer Key startet ohne Historie; bestehender item_key bleibt
  versionsübergreifend; dreispaltiger FK akzeptiert passende v2-Snapshots.`
- `SQL 21: hart kodierte Erwartungen, kurze Transaktion mit lokalen Timeouts,
  SHARE ROW EXCLUSIVE vor Zustandsprüfungen, v1 exakt, v2 nur 0 oder exakt 80,
  genau ein INSERT SELECT oder No-op; kein UPSERT/UPDATE/DELETE/RLS/ACL-Delta.`
- `Rollback: vor Nutzung verborgen stoppen; Cleanup nur separates Owner-Gate
  und null v2-Sessionreferenzen. Nach Referenzen ausschließlich neuer Snapshot
  v3. Produktiver v2-Insert wechselt R2-Commit sofort auf Version 2 und bleibt
  deshalb durch Produktisolation und S5-Write-Gate mitigiert.`
- `T-ACT-C2-01..10 und Evidence B01-B03/L01-L04/PRE01-PRE04/W01 sind
  zugeordnet; aktuelle Supabase-Doku/Changelog werden an S5 erneut geprüft.`
- `Full Contract Review PASS; F-ACT-C2-04/-06 fixed, F-ACT-C2-05 mitigated,
  kein offenes In-Scope-P0/P1 und keine produktive Wirkung.`

Exit: Semantik-, Such-, SQL- und Rückfallrisiken sind geschlossen oder mit
wirksamem Gate zugeordnet.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Vertrag / Findings | Dateien | Review | Checks / Evidence | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | kontrollierte Inventarreferenz und v2-Vertrag | `D-ACT-C2-02/-04/-05/-06/-07; W-ACT-C2-01` | `docs/reference/activity-v2/Fitnessstudio_Geraeteinventar.md`; `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md` | `Full` | `T-ACT-C2-01` | `none; Owner-Freeze liegt vor` |
| S4.2 | additive v2-Semantik-API und interne Dateigrenze | `D-ACT-C2-03/-08/-12; F-ACT-C2-08 fixed` | `app/modules/vitals-stack/activity/v2/semantics-v2.js`; `app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js` | `Consumer` | `T-ACT-C2-02/-03/-05/-06` | `none` |
| S4.3 | vollständiger 80-Einträge-Katalog und Suchmatrix | `D-ACT-C2-02/-04/-05; F-ACT-C2-02/-04` | `app/modules/vitals-stack/activity/v2/semantics-v2.js`; `app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js` | `Full` | `T-ACT-C2-03/-04/-05` | `none` |
| S4.4 | R1-/R3-Kompatibilität und Produktisolation | `D-ACT-C2-08/-09/-12; F-ACT-C2-05/-08` | `app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js`; unveränderte R1-/R3-/Produktquellen | `Consumer` | `T-ACT-C2-02/-05/-06` | `none` |
| S4.5 | SQL 21 und disposable Fixture | `D-ACT-C2-02/-10/-11; F-ACT-C2-01/-03/-05/-09` | `sql/21_Activity_V2_Catalog_V2.sql`; `sql/tests/21_Activity_V2_Catalog_V2_fixture.sql` | `Full` | `T-ACT-C2-07/-08; EV-ACT-C2-L01 bis -L04` | `guarded PSQL-only lokal/disposable; kein Reset/Remote/Produktwrite` |
| S4.6 | gesamter C2-Code-/Contract-Review und Korrekturen | `D-ACT-C2-01 bis -14; alle Findings` | `gesamter C2-Diff` | `Full` | `T-ACT-C2-01 bis -08 und invalidierte EV-IDs` | `none` |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - `S4.1 friert den maschinenlesbaren Vertrag; S4.2/S4.3 implementieren ihn;
    S4.4 beweist Consumergrenzen; S4.5 folgt erst danach; S4.6 schließt S4.`
- Fehlende Zuordnung:
  - `none; alle D-ACT-C2-01 bis -14, alle Findings,
    W-ACT-C2-01, T-ACT-C2-01 bis -08 und EV-ACT-C2-L01 bis -L04 besitzen eine
    S4-Grenze. T-ACT-C2-09/-10 und produktive Evidence bleiben S5.`
- Evidence:
  - `Bereits angelegt und in S4R nicht geändert. Erst S4.5 pflegt L01-L04; S5
    pflegt B02/B03, PRE01-PRE04, W01 und Vorher-/Nachher-Nachweise.`
- Scope-Freeze:
  - `PASS: bestehende Features, Datenmodell/Lifecycle/Retention, Cleanup/
    Scheduler/Secrets/Automationen und Producer-/Consumergrenzen sind
    festgelegt; keine offene Grundsatzfrage und kein offenes In-Scope-P0/P1.`
- Gültig übernommene Nachweise:
  - `S1-Baseline und Smokes, S2-Projektions-/Search-Probe und S3-Risikoprobe
    bleiben gültig, weil seit 1458df0 keine R1-/R2-/R3-/Produkt-/SQL-Source
    geändert wurde. Breite Wiederholung erst bei tatsächlicher Invalidation.`
- Invalidation Map:
  - `S4.1 -> T01. S4.2 -> T02/T03/T05/T06. S4.3 -> T03/T04/T05. S4.4 ->
    T02/T05/T06. S4.5 -> T07/T08 und L01-L04. Findings-Korrekturen wiederholen
    nur direkt betroffene IDs plus Syntax/Guards/diff --check.`
- Owner-Gates:
  - `Kein Owner-Gate in S4. Lokaler Stack und guarded Fixture sind erlaubt;
    produktiver Read-only-Preflight, SQL-Write und jeder Cleanup bleiben S5
    beziehungsweise separat owner-gated.`
- Tool-/Doku-Stand:
  - `Supabase CLI 2.109.1 und Docker Client/Server 29.6.2 sind erreichbar, null
    Container laufen. Aktuelle offizielle CLI-/RLS-Doku und Database-Changelog
    erneut geprüft: C2 erzeugt keine neue Tabelle/Policy/Berechtigung; Remote-
    Reset bleibt destruktiv und ist für S4.5 ausdrücklich ausgeschlossen. Die
    CLI-Hilfe-/Runtime-Abweichung der Exclude-Namen ist mit F-ACT-C2-13 belegt.`
- Empfohlene S4-Ausführungsblöcke:
  - `Final: A=S4.1 einzeln; B=S4.2-S4.4 gemeinsam; C=S4.5 einzeln;
    D=S4.6 einzeln. Nach jedem Block Statusmatrix und Resume Card ersetzen.`
- Begründung:
  - `A erzeugt die verbindliche Quelle für B. S4.2-S4.4 ändern dieselben zwei
    C2-JS-Dateien und teilen API-, Snapshot-, Search- und Injectionvertrag; der
    gemeinsame Block erhält wegen S4.3 insgesamt Full Review. C besitzt
    destruktive lokale Fixture- und Evidence-Grenzen. D reviewt den Gesamtdiff.`
- Review je Ausführungsblock:
  - `A Full; B Full mit separaten Ergebnissen für S4.2, S4.3 und S4.4; C Full
    samt L01-L04; D Full. Eine Zusammenlegung spart nur Handoffs.`
- Readiness-Findings/Korrekturen:
  - `F-ACT-C2-07 fixed: Roadmap und Resume Card unter Workflowgrenze verdichtet.`
  - `F-ACT-C2-08 fixed: exakt zwei neue JS-Dateien, kein Helper/HTML-Harness und
    keine R1-/R3-Sourceänderung.`
  - `F-ACT-C2-09 fixed: S4.5 auf lokalen guarded PSQL-Pfad begrenzt; aktueller
    Stack ist gestoppt, db reset/--linked/--db-url/MCP/Produktwerte verboten.`
- Full Readiness Review:
  - `PASS. Realer Git-/Datei-/Toolstand, S1-S3-Verträge, alle Substep-
    Zuordnungen, Invalidation, Security, Datenwirkung, Rollback und Gates sind
    vollständig. Die S4-Zieldateien existieren erwartungsgemäß noch nicht;
    keine Implementierung und keine produktive Wirkung.`

Exit: S4 kann ohne neue Identitätsentscheidung beginnen; sichere Batches und
SQL-Grenzen sind bestätigt.

## S4 - Umsetzung

### S4.1 - Inventarreferenz und Katalog-v2-Vertrag

Reasoning: `GPT-5.6 Sol / Medium`.

- Vertrag:
  - `D-ACT-C2-02 bis -07.`
- Dateien:
  - `docs/reference/activity-v2/Fitnessstudio_Geraeteinventar.md`
  - `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
- Umsetzung:
  - `Aus der externen Datei eine bereinigte Inventarreferenz mit Provenienz,
    K-/C-IDs, Gerätenamen und Suchbezeichnungen ableiten; Gesundheitsdaten,
    medizinische Einordnung, Trainingshinweise, Fotos und Trainingsplandateien
    nicht übernehmen. Vollständigen 80-Einträge-Vertrag samt Alias- und
    Suchmatrix anlegen.`
- Review:
  - `Full`
- Invalidation:
  - `T-ACT-C2-01`
- Gate:
  - `none; Owner-Freeze ist D-ACT-C2-04/-05/-06.`

#### Ergebnis S4.1

- Änderung: `Bereinigte Inventarreferenz mit Provenienz, K-01..K-20 und
  C-01..C-06 sowie separaten vollständigen JSON-Vertrag für schema_version v1,
  catalog_version 2 und 80 aktive Entries angelegt.`
- Prüfung: `T-ACT-C2-01 PASS: R1-Validator valid ohne Fehler; 78 Basis-Keys und
  alle Nicht-Alias-Felder wertgleich; bestehende Aliaspräfixe unverändert;
  exakt 47 Ergänzungen an 24 Keys, zwei neue Keys, 53/53 Studio-/
  Normalisierungsfälle und 5/5 Kompatibilitäts-/Limitfälle grün.`
- Finding/Korrektur: `F-ACT-C2-10 fixed: dokumentierten Kurzähler 36/36 gegen
  die ausgeschriebenen 37 Pflichtqueries korrigiert. Zwei beim Dateitransfer
  beschädigte Unicode-Testwerte als JSON-Unicode-Escapes repariert und T01
  vollständig erfolgreich wiederholt.`
- Restrisiko: `Kein offenes S4.1-P0/P1. Vertrag ist noch nicht als Runtime oder
  SQL umgesetzt; W-ACT-C2-01 bleibt deferred.`
- Doku-Sync: `Roadmap, Statusmatrix und Resume Card synchron; weitere Sources
  of Truth und Evidence erst in den dafür vorgesehenen S4.5-/S6-Schritten.`
- Status: `PASS; Full Contract Review PASS, keine produktive Wirkung.`

### S4.2 - Additive v2-Semantikgrenze

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-C2-03/-08/-09/-12.`
- Dateien:
  - `app/modules/vitals-stack/activity/v2/semantics-v2.js`
  - `app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js`
- Umsetzung:
  - `Tief eingefrorene v2-API unter AppModules.activityV2.semanticsV2 mit
    derselben Fünf-Methoden-Form wie R1 implementieren. R1-Namespace,
    Produktload und R3-Fallback nicht ersetzen.`
- Review:
  - `Consumer`
- Invalidation:
  - `T-ACT-C2-02/-03/-05/-06`
- Gate:
  - `none`

#### Ergebnis S4.2

- Änderung: `semantics-v2.js registriert additiv und fail-closed eine tief
  eingefrorene Fünf-Methoden-API unter AppModules.activityV2.semanticsV2,
  abgeleitet aus der validierten realen R1-Basis.`
- Prüfung: `T-ACT-C2-02/-03 PASS; R1 bleibt Version 1 mit 78 Entries, v2 ist
  Schema v1/Version 2 mit 80 aktiven Entries und vollständig tief gefroren.`
- Finding/Korrektur: `Keine Runtime-Findings. Realm-spezifische Prototypen in
  zwei initialen Testassertions wurden neutral verglichen; 6/6 Rerun PASS.`
- Restrisiko: `Keine Produktverdrahtung; echte Consumer-Nutzung bleibt R4 und
  produktiver Datenstand bleibt S5 zugeordnet.`
- Doku-Sync: `Statusmatrix und Resume Card synchron; übriger Doku-Sync S6.`
- Status: `PASS im gemeinsamen Full-Review-Block.`

### S4.3 - Vollständiger v2-Katalog und Suchmatrix

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `Owner-Freeze; D-ACT-C2-02 bis -05.`
- Dateien:
  - `app/modules/vitals-stack/activity/v2/semantics-v2.js`
  - `app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js`
- Umsetzung:
  - `Exakt 80 aktive Einträge implementieren; nur freigegebene Aliasergänzungen
    an bestehenden Keys; zwei neue Keys; alle Studio- und Cardioqueries samt
    Normalisierung und Multi-Hip-Reihenfolge testen.`
- Review:
  - `Full`
- Invalidation:
  - `T-ACT-C2-03/-04/-05`
- Gate:
  - `none`

#### Ergebnis S4.3

- Änderung: `Vollständiger, ASCII-sortierter 80er-Snapshot mit exakt 47
  Aliasergänzungen an 24 Basis-Keys sowie high_row und total_abdominal; eigene
  v2-Suchindexierung mit unverändertem R1-Ranking.`
- Prüfung: `T-ACT-C2-03/-04 PASS; Runtimekatalog ist wertgleich zum
  maschinenlesbaren Vertrag, R1-Validator valid, 53/53 Studio-/Normalisierungs-
  und 5/5 Kompatibilitäts-/Limitfälle grün.`
- Finding/Korrektur: `Keine fachliche Abweichung oder normalisierte Kollision.`
- Restrisiko: `W-ACT-C2-01 unverändert: kein hip_flexion-Key ohne spätere neue
  Katalogversion.`
- Doku-Sync: `Statusmatrix und Resume Card synchron; übriger Doku-Sync S6.`
- Status: `PASS; Full Contract Review PASS.`

### S4.4 - R1-/R3-Kompatibilität und Produktisolation

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-C2-08/-09/-12.`
- Dateien:
  - `app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js`
  - `R1-/R3-/Produktquellen bleiben unverändert; kein neuer Browser-Harness.`
- Umsetzung:
  - `Beweisen, dass v1 exakt 78 bleibt, die v1-API unverändert funktioniert,
    R3 mit injizierter v2-Semantik Version 2 und neue Keys akzeptiert und die
    produktive index.html keine C2-Datei lädt. Der neue Node-Contract-Test lädt
    reale R1-/R3-Quellen nur isoliert und verändert deren Tests oder Source nicht.`
- Review:
  - `Consumer`
- Invalidation:
  - `T-ACT-C2-02/-05/-06`
- Gate:
  - `none`

#### Ergebnis S4.4

- Änderung: `Ein neuer Node-Contract-Test belegt R1-Unveränderlichkeit,
  fail-closed v2-Initialisierung, reale R3-Draft-/Shell-Injection mit beiden
  neuen Keys und fehlenden C2-Produktload; R1-/R3-Source blieb unverändert.`
- Prüfung: `T-ACT-C2-05/-06 PASS; neue Tests 6/6, gesamte Activity-V2-Suite
  56/56, Syntax 10/10, geschützte Sources gegen 1458df0 unverändert,
  git diff --check und Scope-/Side-Effect-Guards PASS.`
- Finding/Korrektur: `F-ACT-C2-11 fixed: T01-Status aus S4.1 nachgezogen;
  keine Consumer- oder Produktisolation-Abweichung.`
- Restrisiko: `R3-Reload-/Prozess-Recovery bleibt unverändert R7/R8 zugeordnet.`
- Doku-Sync: `Roadmap, Testmatrix und Resume Card synchron; weiterer Sync S6.`
- Status: `PASS im gemeinsamen Full-Review-Block; keine produktive Wirkung.`

### S4.5 - Additives SQL 21 und disposable Fixture

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-C2-02/-10/-11.`
- Dateien:
  - `sql/21_Activity_V2_Catalog_V2.sql`
  - `sql/tests/21_Activity_V2_Catalog_V2_fixture.sql`
- Umsetzung:
  - `Vollständigen v2-Snapshot insert-only projizieren. Vor jedem Write muss
    v1 vertragsgleich und v2 entweder leer oder bereits exakt vertragsgleich
    sein; Teilbestand oder Inhaltsdrift stoppt ohne Reparatur. Fixture beweist
    frischen Aufbau 20->21->16, idempotenten Re-Run, v1-Unveränderlichkeit,
    R2-Commit/Lookup mit v2 sowie pre-write Drift-Fail.`
  - `S4.5 ist PSQL-only gegen die vorhandene guarded Datenbank
    midas_activity_v2_s45. Vor jeder Mutation müssen ON_ERROR_STOP,
    current_database, PostgreSQL >=17, session_user=postgres und Datenbankowner
    postgres fail-closed geprüft sein. SQL 20 läuft nur im frischen Bootstrap;
    nur SQL 21 wird als Re-Run geprüft.`
  - `Lokalen Stack erst nach erneutem CLI-Hilfe-/Statuscheck mit --workdir
    backend starten. Wegen fehlender seed.sql und deprecated inbucket weder
    supabase db reset noch --linked, --db-url, Remote-MCP, Projekt-Ref,
    .env.supabase.local oder produktive Verbindungswerte verwenden.`
- Review:
  - `Full`
- Invalidation:
  - `EV-ACT-C2-L01 bis -L04; T-ACT-C2-07/-08`
- Gate:
  - `nur guarded lokal/disposable; keine produktive oder Remote-Ausführung.`

#### Ergebnis S4.5

- Änderung: `SQL 21 enthält den vollständigen 80er-Snapshot und genau ein
  bedingtes INSERT SELECT in einer timeout-begrenzten Transaktion; v1 wird
  bidirektional exakt geprüft, v2 akzeptiert nur 0 oder exakte 80. Die guarded
  Fixture deckt Full-, Teilbestand- und Inhaltsdriftmodi ab.`
- Prüfung: `T-ACT-C2-07/-08 und EV-ACT-C2-L01 bis -L04 PASS: lokaler
  midas_activity_v2_s45 auf PG 17.6, Owner/session_user postgres; frischer
  20->21->16-Aufbau 78/80, Re-Run No-op, beide Driftläufe Exit 3 ohne
  Vorwrite-Änderung, v2-Commit und Lookup über Version 1/2 grün.`
- Finding/Korrektur: `F-ACT-C2-12 fixed: falsche S4.1-SQL-Spaltenprojektion
  vor Implementierung korrigiert und T01 wiederholt. CLI-Exclude-Namen gegen
  reale 2.109.1-Hilfe korrigiert; Fixture-Boolean explizit gecastet und Full-
  Run danach PASS.`
- Restrisiko: `Zum S4.5-Abschluss war der produktive Write noch owner-gated;
  S5 hat ihn inzwischen mit grünen Postconditions ausgeführt.`
- Doku-Sync: `Roadmap, Resume Card, Testmatrix und EV-L01 bis -L04 synchron;
  übriger Source-of-Truth-Sync wurde in S6 abgeschlossen.`
- Status: `PASS; Full SQL/Contract/Security Review PASS, lokaler Stack gestoppt,
  keine produktive Wirkung.`

### S4.6 - Gesamter C2-Code-/Contract-Review

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `gesamter Zielvertrag und alle C2-Decision-IDs.`
- Dateien:
  - `gesamter C2-Diff`
- Umsetzung:
  - `Code-, Contract-, SQL-, Security- und Scope-Review durchführen; Findings
    bewerten und korrigieren; keine automatische Scope-Erweiterung.`
- Review:
  - `Full`
- Invalidation:
  - `nur durch Korrekturen betroffene T-/EV-IDs plus günstige Syntax/Diff-Checks`
- Gate:
  - `none`

#### Ergebnis S4.6

- Änderung: `Owner-korrigierten C2-Diff gegen Zielvertrag, D-ACT-C2-01 bis -14, Findings, Scope und Security geprüft; 31 freie-Gewichte-Aliase sowie read-only Inspector und Wartungsrunbook vollständig einbezogen.`
- Prüfung: `T-ACT-C2-01 bis -08 PASS; Vertrag, Runtime und SQL wertgleich; 11/11 JS-Syntax, 56/56 Node-Tests, 53+5 Suchfälle; disposable PG 17.6 mit 78/80, Re-Run, RLS/ACL/RPC, v2-Commit/Lookup, Teilbestand- und Drift-Fail PASS; Endstand 78/80/0 und Sessions 0/0/0.`
- Finding/Korrektur: `F-ACT-C2-16/-17 fixed; F-ACT-C2-18 fixed durch Lauf im lokalen DB-Container statt Änderung der bewährten Race-Fixture.`
- Restrisiko: `S5-Write inzwischen PASS; F-ACT-C2-01/-05/-13 bleiben mitigiert, W-ACT-C2-01 deferred und R4 bis C2-DONE blockiert.`
- Doku-Sync: `Statusmatrix, S4.6-Ergebnis und Resume Card synchron; übriger Doku-Sync bleibt S6.`
- Status: `PASS`

Exit S4: Inventarreferenz, Katalogvertrag, v2-Semantik, Suchmatrix und SQL sind lokal vollständig umgesetzt und reviewt; Produktion ist noch unverändert.

## S5 - Tests, produktives SQL-Gate und Abschlussreview

Reasoning: `GPT-5.6 Sol / High`; Owner-Briefing und produktiver Write-Knoten
`Extra High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-C2-01 | lokal | v2-Vertrag entspricht Owner-Freeze; Referenz enthält 20 K-IDs/relevante Cardiofakten, aber keinen Gesundheits-/Planungskontext | PASS | kompakter Contract-Check | Inventar/v2-Vertrag |
| T-ACT-C2-02 | lokal | R1-Semantik und 78er-Baseline unverändert grün | PASS | Node Contract-Test | R1-Semantik/API |
| T-ACT-C2-03 | lokal | v2-API, Schema v1, Version 2, 80 aktive Entries, Deep Freeze | PASS | Node Contract-Test | v2-Semantik |
| T-ACT-C2-04 | lokal | exakte Studio-Suchmatrix, Normalisierung, Kollisionen, Crunch-Erweiterung sowie Multi Hip mit Default/limit 1/2/3 | PASS | Node Contract-Test | Aliase/Search |
| T-ACT-C2-05 | lokal | R3-Draft/Shell mit injiziertem v2 und neuen Keys | PASS | R3-C2-Contract-Test | v2/R3-Injection |
| T-ACT-C2-06 | lokal | Produktindex, Activity V1 und R3-Source-/Namespacegrenze unverändert | PASS | statischer Guard/Hashes | Scriptload/Produktdateien |
| T-ACT-C2-07 | disposable | SQL 20->21->16, Re-Run, 78/80, Drift-Fail und ACL/RLS unverändert | PASS | EV-ACT-C2-L01 bis -L03 | SQL 21/Fixture |
| T-ACT-C2-08 | disposable | R2-Commit mit v2; Last Performance für neuen Key zunächst null und für bestehenden Key versionsübergreifend | PASS | EV-ACT-C2-L04 | SQL/RPC/Katalog |
| T-ACT-C2-09 | produktiv read-only | v1 exakt 78; v2 0 oder exakt 80; keine unerwarteten v2-Referenzen; R2-Schema/RPC/RLS/ACL und Produktisolation erwartungsgemäß | PASS | EV-ACT-C2-PRE01 bis -PRE04 | Runtime |
| T-ACT-C2-10 | produktiv write | freigegebenes SQL 21; danach exakt 78/80, Commit-Akzeptanzversion 2 und keine unerwartete Objekt-/ACL-Änderung | PASS | EV-ACT-C2-W01 plus Vorher-/Nachher-Nachweis | SQL-Ausführung |

<!-- markdownlint-enable MD013 -->

Deterministische Reihenfolge:

1. Syntax, Contract-, Search-, R3-Injection-, statische Guard- und
   `git diff --check`-Checks ausführen.
2. Disposable SQL-Fixture vollständig ausführen; lange Logs nur lokal halten,
   Evidence mit Zählern und Postconditions befüllen.
3. Full Code-/SQL-/Security-Review durchführen.
4. Genau einen externen Review nach vollständiger lokaler Umsetzung
   durchführen; Findings einzeln bewerten, nicht blind übernehmen.
5. Invalidierte Checks nach Korrekturen wiederholen.
6. Aktuelle Supabase-Changelog-/Doku-Lage gezielt auf relevante
   Katalogtabellen-/Data-API-/CLI-Änderungen prüfen.
7. Produktiven read-only Preflight ausführen und in Evidence dokumentieren.
8. Stoppen, falls v1 nicht exakt 78, v2 partiell/abweichend, R2-Schema anders
   oder bereits v2-Sessionreferenzen bei notwendigem Rückfall vorhanden sind.
9. Owner Briefing durchführen:

#### Owner Briefing S5-C2-SQL

- Zweck:
  - `Den lokal bewiesenen vollständigen Katalog v2 in die bestehende
    produktive R2-Katalogtabelle eintragen.`
- Wirkung:
  - `Ein vollständiger, read-only erreichbarer 80-Zeilen-Snapshot mit
    catalog_version 2; beim Erstlauf 80 Inserts, beim bereits exakten Re-Run
    keine Änderung. Keine UI-Aktivierung und keine Gesundheits-/Sessiondaten.
    R2-Commit behandelt danach Version 2 über max(catalog_version) sofort als
    einzige zulässige Client-Katalogversion; deshalb muss Produktisolation vor
    dem Write belegt sein und R4 bleibt bis C2-DONE blockiert.`
- Risiko:
  - `Falsche Aliase oder unvollständiger Snapshot würden spätere Suche und
    Historienidentität verfälschen.`
- Rückfall:
  - `C2 bleibt unsichtbar. Bei null v2-Referenzen kann ein gesondert
    freigegebener Cleanup erfolgen; C2 selbst löscht nichts.`
- Erfolgsnachweis:
  - `v1=78, v2=80, exakter Setvergleich, RLS/ACL/RPC unverändert.`
- Benötigte Freigabe:
  - `ausdrückliche Freigabe zur produktiven Ausführung von SQL 21.`

10. Nach Freigabe ausschließlich das reviewte SQL 21 produktiv ausführen.
11. Postconditions und Negativnachweise read-only erfassen.
12. Finalen Full Review gegen realen Diff und produktiven Iststand durchführen.

Ergebnis:

- Grüne Nachweise: `T-ACT-C2-01 bis -10; EV-ACT-C2-B01 bis -B03, L01 bis
  -L04, PRE01 bis -PRE04 und W01 PASS.`
- Wiederholte Nachweise: `11/11 Syntax, 56/56 JS, 53+5 Search, Inspector-
  Parität, L01-L04, geschützte Sourcegrenzen und finaler Diff-/Produktreview PASS.`
- Nicht ausgeführte Smokes: `Browser-/Device-Smoke nicht erforderlich, da kein Produktload.`
- Produktiver Iststand: `v1=78 und v2=80 vollständig repo-identisch; andere
  Versionen=0, v2-Referenzen=0; R2-Struktur/RPC/RLS/Policies/ACL unverändert.`
- Externer Review: `Genau ein Supabase Security Advisor Review; intentionaler
  R2-Definer-RPC und bestehende Auth-Watchlist einzeln bewertet, kein C2-Fix.`
- Offene Findings: `Kein offenes In-Scope-P0/P1; F-ACT-C2-15 bis -20 fixed.`
- Commit-Entscheidung: `S6 empfiehlt einen abgegrenzten C2-Commit; Ausführung
  und Push bleiben gemäß Workflow-Vertrag Owner-Aktionen.`

Exit: `PASS; lokale, disposable und produktive Postconditions grün; kein
In-Scope-P0/P1 und kein Katalogdrift offen. Nächster Schritt S6.`

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. `docs/modules/Activity Module Overview.md` um bewiesene C2-v2-Semantik,
   Produktisolation, 78/80-Vertrag und R4-Handoff ergänzen.
2. `docs/Future trainingsmodule update thoughts.md` C2 auf DONE setzen, reale
   Nachweise eintragen und R4 als nächsten Rolling-Wave-Schritt freigeben.
3. Relevante QA-Suites kompakt synchronisieren:
   - Semantik/Search/R3-Injection bei `docs/qa/health-capture-reports.md`,
   - SQL/RLS/ACL/Postconditions bei `docs/qa/backend-supabase.md`.
4. `sql/HOW_TO.md` um Provisioning-Reihenfolge 20 -> 21 -> 16, Re-Run-Vertrag
   und C2-Postconditions ergänzen. Keine Secrets dokumentieren.
5. Separaten Katalog-v2-Vertrag als dauerhafte Source of Truth unter `docs/`
   belassen; Inventarreferenz unter `docs/reference/activity-v2/` belassen.
6. Finalen Full Contract Review gegen Masterplan, v1/v2-Verträge, R2/R3,
   SQL, Evidence, Produktisolation und realen Git-Diff durchführen.
7. Findings korrigieren; In-Scope-P0/P1 schließen. `W-ACT-C2-01` darf nur mit
   unverändertem neue-Katalogversion-Gate deferred bleiben.
8. Changelog-Relevanz entscheiden. Da C2 noch keine sichtbare
   Produktfunktion aktiviert, `nicht bemerkenswert` begründen, sofern der
   reale Diff keine Nutzerwirkung erzeugt; sonst `Unreleased` aktualisieren.
9. Kurzen Owner Recap erstellen:
   - v1 wurde nicht überschrieben,
   - v2 ist ein vollständiger Snapshot,
   - Aliase ändern keine Historienidentität,
   - zwei Bewegungen erhielten bewusst neue Keys,
   - R4 darf jetzt auf realem Vokabular aufbauen,
   - Activity V2 ist weiterhin nicht produktiv nutzbar.
10. Resume Card auf Abschluss setzen und Commit-Empfehlung aus dem realen
    C2-Diff ableiten; fremde/uncommittete R1-R3-Änderungen nicht still bündeln.
11. Roadmap und Evidence mit `(DONE)` nach `docs/archive/` verschieben.
12. Kopierfertige Abschluss-Summary für den Denkraum erstellen.

Ergebnis:

- Source-of-Truth-Sync: `PASS; Activity Module Overview, Trainingsmodul-
  Masterplan, HCR-021, BS-014 und SQL-HOW-TO beschreiben denselben bewiesenen
  78/80-, Search-, Security-, Produktisolations- und R4-Handoff-Vertrag.`
- Finaler Review: `PASS; Masterplan, Verträge, Runtime, R2/R3, SQL, Evidence und
  Git-Diff konsistent; 11/11 Syntax, 56/56 Node, 58/58 Suche, Inspector, Diff,
  Sourcegrenzen und Produkt-Sentinel PG 17.6/78/80/0/0/4/4/2/ACL PASS.`
- Aktuelle Supabase-Lage: `PASS; Breaking-Change- und Security-Dokumentation am
  2026-08-01 geprüft. C2 legt keine neue Data-API-Tabelle an, ändert keine
  Extension und keine Schema-/Grant-/RLS-Grenze; kein relevanter C2-Drift.`
- Restrisiken: `Kein offenes In-Scope-P0/P1. W-ACT-C2-01 bleibt deferred:
  hip_flexion erst bei realem Bedarf und ausschließlich in einer neuen
  Katalogversion. Produktiv vorhandene Snapshots dürfen nicht mutiert werden.`
- Changelog-Relevanz: `nicht bemerkenswert; der reale Diff aktiviert keine
  sichtbare Produktfunktion, ändert keine Bedienung und deployt nichts. Der
  bestehende Unreleased-Eintrag zur Activity-V2-Datenbasis bleibt unverändert.`
- Owner Recap: `PASS; siehe nachfolgenden kompakten Recap.`
- Archiv:
  - `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap (DONE).md`
  - `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Evidence (DONE).md`
- Commit-Empfehlung: `feat(activity-v2): complete C2 catalog version 2`; nur
  C2 bündeln; Commit/Push bleiben Owner-Aktionen.
- Punkt 12: `Ausführliche kopierfertige Denkraum-Summary im Chat-Abschluss.`

### Owner Recap

- `Katalog v1 wurde nicht überschrieben und bleibt mit 78 Einträgen reproduzierbar.`
- `Katalog v2 ist ein vollständiger eigenständig reproduzierbarer 80er-Snapshot.`
- `47 Aliase an 24 Keys verbessern die Suche, nicht die Historienidentität.`
- `High Row und Total Abdominal erhielten bewusst eigene stabile Keys.`
- `R4 darf auf v2 aufbauen; spätere Ergänzungen nutzen den versionierten Wartungspfad.`
- `Activity V2 bleibt ohne Product-Scriptload/UI/Session und Activity V1 unverändert.`

Exit: `PASS; Repo, produktiver Katalog, Evidence, QA und Masterplan beschreiben
denselben C2-Vertrag. C2 ist DONE und archiviert; R4 ist als nächster Schritt
freigegeben, die Produktaktivierung bleibt gesperrt.`

---

## Initialer Contract Review der Roadmap

- Datum: `2026-08-01`
- Reviewtiefe: `Full`
- Reasoning: `GPT-5.6 Sol / Extra High`

Geprüft gegen:

- Root- und Templateverträge
- Activity-V2-Masterplan einschließlich 5.6, C2/R4 und O-7
- R1-Baselinevertrag und reale R1-API
- archivierte R2-SQL-/RPC-/Evidence-Verträge
- archivierten R3-Injection-, Versions- und Isolationsvertrag
- verifiziertes externes Studioinventar
- Owner-Freigabe vom 2026-08-01

Findings und eingearbeitete Korrekturen:

1. `F-INIT-C2-01 fixed`: Ein reines Alias-Patch hätte den unveränderlichen
   Versionsvertrag verletzt. Ziel, SQL und Tests fordern nun einen vollständigen
   80-Zeilen-Snapshot.
2. `F-INIT-C2-02 fixed`: Ein automatischer Wechsel von
   `AppModules.activityV2.semantics` auf v2 hätte R1 und R3-Fallback still
   verändert. C2 verwendet eine additive `semanticsV2`-Grenze und R3-Injection.
3. `F-INIT-C2-03 fixed`: Inhalts- und Schemasprung waren potenziell vermischt.
   `schema_version` bleibt v1; nur `catalog_version` wird 2.
4. `F-INIT-C2-04 fixed`: Die externe Quelle enthält inzwischen auch
   Trainingsplan-Dateien. Startkarte, Scope und Guardrails schließen Markdown
   und PDF ausdrücklich als C2-Quellen aus.
5. `F-INIT-C2-05 fixed`: Produktives SQL ohne Evidence hätte den
   Workflow-Vertrag verletzt. Eine schlanke C2-Evidence ist angelegt und bleibt
   auf SQL-/Runtime-Nachweise begrenzt.
6. `F-INIT-C2-06 fixed`: Die fünf offenen Maschinenidentitäten hätten im
   Fresh Chat erneut erfunden werden können. Owner-Freeze und Feldverträge
   stehen vollständig in dieser Roadmap.
7. `F-INIT-C2-07 fixed`: `Multi Hip` hätte als generischer Key oder als
   ungeregelte oder normalisiert kollidierende Trefferliste enden können. Drei
   eindeutige Bewegungsaliase, die unveränderte R1-Rangfolge und kein
   `hip_flexion` sind explizit festgelegt.
8. `F-INIT-C2-08 fixed`: Ein erneutes Grant-/RLS-SQL wäre unnötige
   Sicherheitswirkung. C2 wiederverwendet die bestehende Tabelle und stoppt,
   falls S1 doch eine ACL-/RLS-Änderung erforderlich machen würde.
9. `F-INIT-C2-09 fixed`: R2-Commit und Lookup waren zunächst nur indirekt
   abgedeckt. Disposable Tests müssen neue und bestehende v2-Keys sowie
   versionsübergreifende Historienidentität beweisen.
10. `F-INIT-C2-10 fixed`: Der Rückfall nach einem fehlerhaften produktiven
    Snapshot war unklar. C2 selbst löscht nichts; ein Cleanup erfordert null
    Referenzen und ein separates Owner-Gate.
11. `F-INIT-C2-11 fixed`: C2 hätte fälschlich R4 oder sichtbare Suche
    vorziehen können. Produkt-Scriptload, UI und Historieninteraktion sind
    mehrfach explizit ausgeschlossen.
12. `F-INIT-C2-12 fixed`: Die SQL-Dateireihenfolge für Recovery war nicht
    eindeutig. Fixture und S6-HOW-TO verwenden 20 -> 21 -> 16.
13. `F-INIT-C2-13 fixed`: Die externe Inventardatei enthält neben Gerätefakten
    auch persönliche Gesundheits- und Planungstexte. C2 kopiert sie nicht
    wortgleich, sondern erzeugt eine bereinigte Inventarreferenz mit
    dokumentierter Herkunft; der Contract-Test prüft diese Datenschutzgrenze.
14. `F-INIT-C2-14 fixed`: Ein erst nach dem Insert ausgeführter Driftvergleich
    hätte einen partiellen v2-Bestand still vervollständigen können. SQL 21 muss
    Teilbestand und Inhaltsdrift jetzt vor dem ersten Write ablehnen; nur leer
    oder bereits vollständig vertragsgleich ist zulässig.

Fresh-Chat-Test:

- Ziel und Nicht-Ziele: `PASS`
- Owner-Identitäten und Multi-Hip-Vertrag: `PASS`
- Referenzen und Lesereihenfolge: `PASS`
- R1-/R2-/R3-Invarianten: `PASS`
- Autonomie und produktive Gates: `PASS`
- SQL-Wirkung, Evidence und Rückfall: `PASS`
- Nächster Schritt und R4-Blockade: `PASS`
- Nur im Denkraum verbliebene notwendige Information: `none`

Review-Ergebnis:

- `PASS - ready for dedicated C2 execution chat`
- `Keine offene Grundsatzentscheidung blockiert S1-S4R.`
- `W-ACT-C2-01 ist bewusster Zukunftsscope und blockiert C2 nicht.`

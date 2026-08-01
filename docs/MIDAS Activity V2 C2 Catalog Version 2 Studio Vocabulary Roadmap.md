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
| Status | `ACTIVE` |
| Modul / Bereich | `Activity V2 / versionierter Übungs- und Aktivitätskatalog` |
| Owner / Kontext | `Stephan; single-user MIDAS; reales Studioinventar als Suchvokabular` |
| Chat-Lebenszyklus | `Denkraum -> eigener C2-Ausführungs-Chat` |
| Erstellt am | `2026-08-01` |
| Letzter Stand | `2026-08-01; S1 inkl. Owner-Live-Server-Smokes PASS, F-ACT-C2-01 an der C2-Grenze mitigiert` |
| Aktueller Schritt | `S2` |
| Risikoklasse | `R3; produktiver additiver SQL-Write ohne Schemaänderung` |
| Standard-Reviewtiefe | `Full` |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `S4R und produktives S5-SQL-Gate: Extra High; reine Referenzpflege: Medium` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `Activity-V2-Semantik unter app/modules/vitals-stack/activity/v2/; neuer C2-Vertrag; neue Inventarreferenz; sql/21_Activity_V2_Catalog_V2.sql; SQL-Fixture; QA/HOW-TO` |
| Deploy relevant | `nein; keine Edge Function, kein Frontend-Cutover` |
| Produktive Schreibwirkung | `ja; exakt vollständiger catalog_version-2-Snapshot in bestehender Tabelle` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `docs/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Evidence.md` |
| Gekoppelte Roadmaps | `R1/R2/R3 sind unveränderte Preconditions; R4 bleibt bis C2-DONE blockiert` |
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
    hip_flexion-Key und die kontrollierte Repo-Referenz freigegeben.`
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

- Ziel:
  - `Katalog v2 als vollständigen, getesteten 80-Zeilen-Snapshot bereitstellen
    und reales Studiovokabular deterministisch auf stabile Keys abbilden.`
- Unveränderliche Verträge:
  - `Katalog v1 mit 78 Einträgen, R2-Schema/RPCs, R3-Source und Activity V1
    bleiben unverändert; kein Produktload oder R4-Such-UI.`
- Erledigter Stand:
  - `R1, R2 und R3 sind DONE; initialer Roadmap-Contract-Review ist PASS.`
  - `S1 PASS: alle Pflichtquellen in Startkarten-Reihenfolge gelesen; Trainingsplan,
    PDF, Fotos und C2-Evidence vertragsgemäß nicht als Produktquellen verwendet.`
  - `Inventar real bestätigt: K-01 bis K-20 und C-01 bis C-06; persönlicher
    Gesundheits- und Planungskontext ist keine zu übernehmende C2-Quelle.`
  - `R1 real bestätigt: Schema midas.activity-catalog.v1, Version 1, 78 aktive
    Entries, fünf API-Methoden, tiefer Freeze und JS-/SQL-Kataloggleichheit.`
  - `R2 real bestätigt: SQL-/Fixture-/Grant-Hashes entsprechen dem R2-Freeze;
    vier Tabellen, zwei RPCs und bestehende RLS-/ACL-Grenze benötigen kein C2-Delta.`
  - `R3 real bestätigt: Semantik-Injection übernimmt catalog_version 2 und neue
    Keys ohne Sourceänderung; Produktindex und Activity V1 bleiben unverändert.`
  - `Günstigste Baseline PASS: gemeinsame R1/R2/R3-Node-Suite 50/50,
    Syntax aller acht V2-JS-Dateien und git diff --check.`
  - `Owner-Live-Server-Smokes PASS: Semantik-Harness 7/7; Session-Shell mit
    Öffnen, Hinzufügen, Umsortieren, Notiz, Entfernen und sauberem Schließen;
    390x844 und 1440x900 ohne horizontalen Overflow.`
  - `Produktindex real über lokalen Server geprüft: keine Activity-V2-Scripts,
    -Links oder -Marker. Keine produktive Konfiguration gespeichert.`
- Aktueller Schritt:
  - `S2 - noch nicht begonnen.`
- Nächster erlaubter Schritt:
  - `S2 vollständig als deterministischen Vertragsblock bearbeiten; noch keine
    S3-, S4R- oder Implementierungsarbeit.`
- Offene Findings:
  - `keine In-Scope-P0/P1; F-ACT-C2-01 ist für C2 mitigiert, sein SQL-20-
    Ursprung bleibt wegen der unveränderten R2-Precondition außerhalb dieses
    Auftrags; W-ACT-C2-01 bleibt bewusst deferred.`
- Geänderte Dateien:
  - `S1 änderte nur diese Roadmap; die vorbestehende leere C2-Evidence blieb
    ungelesen/unverändert. Der gesamte R1-/R2-/R3-Unterbau ist im realen
    Worktree bereits uncommittet/untracked und darf nicht still gebündelt werden.`
- Gültige Nachweise:
  - `S1 50/50, Syntax, JS-/SQL-78er-Vergleich, v2-Injection-Probe, eingefrorene
    R2-Hashes, Inventarzähler 20/6, Produktisolationsscan sowie Semantik-, Shell-
    und Responsive-Live-Server-Smokes.`
- Runtime-/Deploy-Stand:
  - `keine S1-Schreibwirkung; Activity V2 bleibt unverdrahtet. Produktiver
    R2-/Katalogstand wird erst im S5-Preflight neu geprüft.`
- Offene Owner-Freigaben:
  - `produktives C2-SQL in S5.`
- Stop-Bedingungen:
  - `SQL 20 nicht als produktiven C2-Rerun verwenden; SQL 21 muss v1 vor jedem
    Write exakt prüfen. S4 nicht vor grünem S4R; Produkt-SQL nicht vor
    Evidence-Preflight und ausdrücklicher Freigabe.`

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
  - `gezielte S2/S3/S4R-Korrektur; bei UI, Schema oder neuem Key Follow-up.`

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
| S2 | Katalog-v2-, Such- und API-Zielvertrag | `High` | TODO | |
| S3 | Bruchrisiko-, Security- und SQL-Review | `High` | TODO | |
| S4R | Readiness und sichere Ausführungsblöcke | `Extra High` | TODO | |
| S4.1 | Inventarreferenz und v2-Vertrag | `Medium` | TODO | |
| S4.2 | Additive v2-Semantikgrenze | `High` | TODO | |
| S4.3 | Vollständiger v2-Katalog und Suchmatrix | `High` | TODO | |
| S4.4 | JS- und R3-Kompatibilitätsnachweise | `High` | TODO | |
| S4.5 | Additives SQL 21 und disposable Fixture | `High` | TODO | |
| S4.6 | Gesamter C2-Code-/Contract-Review | `High` | TODO | |
| S5 | Tests, produktives SQL-Gate und Abschlussreview | `Extra High am Write-Gate, sonst High` | TODO | |
| S6 | Doku-Sync, Recap, Commit und Archiv | `High` | TODO | |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-C2-01 | `P1` | `Inherited Contract / SQL` | `mitigated` | `Reales SQL 20 ergänzt fehlende v1-Zeilen vor seinem Driftvergleich und ist damit schwächer als der archivierte R2-Rerun-Text. Der Ursprung bleibt wegen der unveränderten R2-Precondition außerhalb C2. C2 behandelt SQL 20 ausschließlich als frischen disposable Bootstrap; SQL 21 muss v1 vor dem ersten Write exakt prüfen und bei Abweichung stoppen. Keine R2-Datei geändert.` |
| W-ACT-C2-01 | `Watchlist` | `Product` | `deferred` | `hip_flexion erst bei realem Erfassungsbedarf in neuer Katalogversion; blockiert C2 nicht` |

<!-- markdownlint-enable MD013 -->

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Pflichtreferenzen in der Startkarten-Reihenfolge lesen; Trainingsplan und
   PDF ausdrücklich nicht als C2-Quelle verwenden.
2. Externes Inventar gegen Masterplan-Abschnitt 5.6 und O-7 prüfen: 20
   Kraftmaschinen, relevante Cardiobezeichnungen und Multi-Hip-Bewegungen.
   Persönliche Gesundheitsdaten und Planungstexte als nicht zu übernehmenden
   Quellkontext markieren.
3. Reale R1-Semantik-API, Katalogvalidierung, Suchranking, Aliaslimits,
   Namespace und Scriptgrenzen kartieren.
4. Reale R2-Katalogtabelle, v1-Projektion, Constraints, RLS, ACL, RPC-Zugriff
   und Re-Run-Verhalten von SQL 20 erfassen.
5. R3-Semantik-Injection und Katalogversionsprüfung verifizieren; keine
   R3-Sourceänderung vorbereiten.
6. Aktuelle R1-/R2-/R3-Testbefehle identifizieren und die günstigste grüne
   Baseline ausführen; vollständige alte Logs nicht duplizieren.
7. Git-Worktree nach fremden oder noch uncommitteten R1-R3-Dateien prüfen und
   C2-Diffgrenze festhalten.
8. Supabase-CLI-Version nur ermitteln; keine produktive Verbindung und kein
   produktives SQL in S1.
9. Fakten, technische S2-Entscheidung und Findings trennen.
10. Full Contract Review, Korrektur und Schritt-Abnahme.

Ergebnis:

- Systemkarte:
  - `Statische Browser-App ohne Build-Step; index.html lädt keine Activity-V2-
    Datei. R1 registriert nur AppModules.activityV2.semantics; R2 besteht aus
    vier RLS-Tabellen, zwei RPCs und isoliertem dataAccess; R3 konsumiert eine
    injizierte Semantik dynamisch. Activity V1 besitzt keinen tracked Diff.`
- Betroffene Schichten:
  - `C2 darf später nur Inventarreferenz/v2-Vertrag, additive SemantikV2,
    lokale Contract-Tests sowie insert-only SQL 21/Fixture ergänzen. Schema,
    RLS, ACL, RPCs, R1/R3-Source, Produktload und Activity V1 bleiben außerhalb.`
- Belegte Verträge:
  - `Inventar K-01..K-20 und C-01..C-06; persönliche Gesundheits-/Planungstexte
    ausgeschlossen. R1: Schema v1, catalog_version 1, 78 aktive Entries, fünf
    Methoden, Aliaslimit 12, deterministisches Ranking und Deep Freeze. R2:
    Katalog-PK (catalog_version,item_key), versionsfähige FKs, max-Version beim
    neuen Commit, keybasierter Lookup sowie unveränderte Select-/Execute-ACLs.
    R3: v2-Injection und neue Keys ohne fest codierte Version oder Entryzahl.`
- Offene Fragen:
  - `Keine fachliche Owner-Frage. Interne v2-Dateiaufteilung und exakte
    Suchmatrix bleiben kontrollierte technische S2-Entscheidungen.`
- Doku-Sync:
  - `S1-Status, Ergebnis, Finding und Resume Card in dieser Roadmap
    synchronisiert; die nachträglichen Owner-Live-Server-Smokes sind ergänzt;
    übrige Sources of Truth bleiben bis S6 unverändert.`
- Baseline und Systemstand:
  - `Node 24.18.0; Supabase CLI 2.109.1; Docker 29.6.2 desktop-linux; psql
    16.14. Gemeinsame R1/R2/R3-Suite 50/50 PASS, acht JS-Syntaxchecks PASS,
    git diff --check PASS, JS-/SQL-v1-Snapshot 78/78 exakt. SQL-/Fixture-/Grant-
    Hashes entsprechen der archivierten R2-Evidence.`
  - `Owner-Live-Server-Smokes PASS: Semantik-Harness 7/7 ohne Warnung/Fehler;
    Session-Shell Öffnen/Hinzufügen/Umsortieren/Notiz/Entfernen sowie sauberer
    Close-Pfad PASS; 390x844 und 1440x900 ohne horizontalen Overflow. Produktindex
    ohne Activity-V2-Script, -Link oder -Marker. Dort nur zwei gleiche, bereits
    bestehende three.js-Deprecation-Warnungen aus dem Altprodukt, kein C2-Fehler.`
- Full Contract Review:
  - `PASS im S1-Scope. Inventar, Owner-Freeze, R1-API/Ranking, R2-Schema/RPC/
    RLS/ACL, R3-Injection, Testgrenzen, Produktisolation und realer Worktree
    wurden gegeneinander geprüft. F-ACT-C2-01 ist an der C2-Grenze mitigiert;
    der R2-Ursprung blieb unverändert. Kein In-Scope-P0/P1 bleibt offen und
    keine produktive Wirkung entstand.`

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

- Finaler Zielvertrag:
  - `TODO`
- Gewählte Dateiaufteilung:
  - `TODO`
- Exakte Search-Matrix:
  - `TODO; als kompakte Contract-Tabelle im v2-Vertrag, nicht doppelt hier.`
- S4-Pflichtpunkte:
  - `S4.1 bis S4.6`
- Doku-Sync:
  - `v2-Vertrag entsteht S4.1; übriger Sync S6.`

Exit: Snapshot, API, Suchmatrix, SQL und Referenzpfade sind vollständig und
ohne offene Grundsatzfrage festgelegt.

## S3 - Bruchrisiko-, Security- und SQL-Review

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Prüfen, ob Aliasergänzungen exakte Treffer bestehender anderer Keys
   verdrängen, Suchlimits verändern oder Multi-Hip-Kandidaten verstecken.
2. Prüfen, ob neue Keys R1-Keyregex, Taxonomien, Feldpolicies, Aliaslimit,
   Sortierung und Deep-Freeze-Vertrag erfüllen.
3. Prüfen, ob v2 versehentlich den R1-Namespace, R3-Fallback, Produktload oder
   Activity V1 verändert.
4. Prüfen, ob R2-Commit und Last-Performance-Lookup mit v2 funktionieren:
   - neuer Key beginnt ohne Historie,
   - bestehender Key bleibt versionsübergreifend dieselbe Historienidentität,
   - Katalog-FK akzeptiert Version 2.
5. SQL-Risiken prüfen:
   - Teilbestand,
   - Drift bei Re-Run,
   - unzulässiges stilles Update,
   - v1-Veränderung,
   - unerwartete Grants/RLS-Wirkung,
   - Referenzen auf v2 bei einem möglichen Rückfall.
6. Rückfallvertrag festlegen:
   - vor produktiver Nutzung kann fehlerhaftes v2 verborgen liegen bleiben,
   - eine Löschung ist nur bei null v2-Sessionreferenzen und nach gesondertem
     Owner-Gate zulässig,
   - nach späteren Sessions wird eine neue Katalogversion statt Mutation
     verwendet.
7. S5-Testmatrix und Evidence-IDs festlegen; R1/R2/R3 nur bei tatsächlicher
   Invalidation erneut breit testen.
8. Aktuelle Supabase-Dokumentation und Changelog als S5-Preflight vormerken;
   keine Implementierung auf veraltete CLI-Annahmen stützen.
9. S4-Substeps, sichere Batchgrenzen und Owner-Gates ableiten.
10. Full Contract Review, Korrektur und Schritt-Abnahme.

Ergebnis:

- Blockierende Risiken:
  - `TODO / none erwartet`
- Rollback-/Stop-Vertrag:
  - `TODO`
- S4-Schnitt:
  - `S4.1; S4.2-S4.4 potenziell gemeinsam; S4.5 separat; S4.6 Full Review.`
- S5-Pflichtchecks:
  - `T-ACT-C2-01 bis -10 und EV-ACT-C2-*`
- Doku-Sync:
  - `S6`

Exit: Semantik-, Such-, SQL- und Rückfallrisiken sind geschlossen oder mit
wirksamem Gate zugeordnet.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks / Evidence | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | kontrollierte Inventarreferenz und v2-Vertrag | `aus S1-S3` | `docs/reference/activity-v2/Fitnessstudio_Geraeteinventar.md`; `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md` | `Full` | `T-ACT-C2-01` | `none; Owner-Freeze liegt vor` |
| S4.2 | additive v2-Semantik-API und interne Dateigrenze | `aus S2/S3` | `app/modules/vitals-stack/activity/v2/*v2*.js` | `Consumer` | `T-ACT-C2-02/-03` | `none` |
| S4.3 | vollständiger 80-Einträge-Katalog und Suchmatrix | `aus S2/S3` | `v2-Semantik`; `v2-Contract-Test` | `Full` | `T-ACT-C2-03/-04` | `none` |
| S4.4 | R1-/R3-Kompatibilität und Produktisolation | `aus S3` | `Contract-Tests/Harness, möglichst keine R1/R3-Source` | `Consumer` | `T-ACT-C2-05/-06` | `none` |
| S4.5 | SQL 21 und disposable Fixture | `aus S3` | `sql/21_Activity_V2_Catalog_V2.sql`; `sql/tests/21_Activity_V2_Catalog_V2_fixture.sql` | `Full` | `EV-ACT-C2-L01 bis -L04` | `nur lokal/disposable; kein Produktwrite` |
| S4.6 | gesamter C2-Code-/Contract-Review und Korrekturen | `alle` | `gesamter C2-Diff` | `Full` | `T-ACT-C2-01 bis -08` | `none` |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - `S4.1 friert den maschinenlesbaren Vertrag; S4.2/S4.3 implementieren ihn;
    S4.4 beweist Consumergrenzen; S4.5 folgt erst danach; S4.6 schließt S4.`
- Fehlende Zuordnung:
  - `in S4R aus realem S1-S3-Stand prüfen.`
- Evidence:
  - `bereits angelegt; nur an SQL-/Runtime-Gates lesen und pflegen.`
- Scope-Freeze:
  - `TODO: PASS nur bei geschlossenen S1-S3-Findings.`
- Gültig übernommene Nachweise:
  - `R1/R2/R3-Nachweise nur soweit ihre Dateien und Verträge unverändert sind.`
- Invalidation Map:
  - `v2-Semantik -> C2-Semantik/Search/R3-Injection; SQL 21 -> disposable und
    produktive Katalogpostconditions; keine v1-Änderung -> R1-Baseline kompakt.`
- Owner-Gates:
  - `kein Gate in S4; produktives SQL ausschließlich S5.`
- Empfohlene S4-Ausführungsblöcke:
  - `vorläufig S4.1 einzeln; S4.2-S4.4 gemeinsam; S4.5 einzeln; S4.6 einzeln.`
- Begründung:
  - `Semantik, Snapshot und Injection teilen denselben Codevertrag. SQL hat
    eigene Fehler- und Evidence-Grenzen.`
- Review je Ausführungsblock:
  - `S4R finalisiert; jedes Substep-Ergebnis bleibt separat dokumentiert.`
- Readiness-Findings/Korrekturen:
  - `TODO`

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

- Änderung: `TODO`
- Prüfung: `T-ACT-C2-01`
- Finding/Korrektur: `TODO`
- Restrisiko: `none erwartet`
- Doku-Sync: `weitere Sources of Truth erst S6`
- Status: `TODO`

### S4.2 - Additive v2-Semantikgrenze

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-C2-03/-08/-09/-12.`
- Dateien:
  - `in S2 finalisierte additive v2-Dateien unter app/modules/vitals-stack/activity/v2/`
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

- Änderung: `TODO`
- Prüfung: `T-ACT-C2-02/-03`
- Finding/Korrektur: `TODO`
- Restrisiko: `none erwartet`
- Doku-Sync: `S6`
- Status: `TODO`

### S4.3 - Vollständiger v2-Katalog und Suchmatrix

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `Owner-Freeze; D-ACT-C2-02 bis -05.`
- Dateien:
  - `v2-Semantik und v2-Contract-Test`
- Umsetzung:
  - `Exakt 80 aktive Einträge implementieren; nur freigegebene Aliasergänzungen
    an bestehenden Keys; zwei neue Keys; alle Studio- und Cardioqueries samt
    Normalisierung und Multi-Hip-Reihenfolge testen.`
- Review:
  - `Full`
- Invalidation:
  - `T-ACT-C2-01 bis -05`
- Gate:
  - `none`

#### Ergebnis S4.3

- Änderung: `TODO`
- Prüfung: `T-ACT-C2-03/-04`
- Finding/Korrektur: `TODO`
- Restrisiko: `W-ACT-C2-01 unverändert`
- Doku-Sync: `S6`
- Status: `TODO`

### S4.4 - R1-/R3-Kompatibilität und Produktisolation

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-C2-08/-09/-12.`
- Dateien:
  - `C2-Tests; R1-/R3-Tests nur gezielt erweitern, R1-/R3-Produktquellen nicht ändern.`
- Umsetzung:
  - `Beweisen, dass v1 exakt 78 bleibt, die v1-API unverändert funktioniert,
    R3 mit injizierter v2-Semantik Version 2 und neue Keys akzeptiert und die
    produktive index.html keine C2-Datei lädt.`
- Review:
  - `Consumer`
- Invalidation:
  - `T-ACT-C2-02/-05/-06`
- Gate:
  - `none`

#### Ergebnis S4.4

- Änderung: `TODO`
- Prüfung: `T-ACT-C2-05/-06`
- Finding/Korrektur: `TODO`
- Restrisiko: `R3-Reload-/Prozess-Recovery bleibt unverändert R7/R8 zugeordnet.`
- Doku-Sync: `S6`
- Status: `TODO`

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
- Review:
  - `Full`
- Invalidation:
  - `EV-ACT-C2-L01 bis -L04; T-ACT-C2-07/-08`
- Gate:
  - `nur lokal/disposable; keine produktive Ausführung.`

#### Ergebnis S4.5

- Änderung: `TODO`
- Prüfung: `EV-ACT-C2-L01 bis -L04`
- Finding/Korrektur: `TODO`
- Restrisiko: `produktiver Iststand bis S5 unverändert`
- Doku-Sync: `S6`
- Status: `TODO`

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

- Änderung: `TODO`
- Prüfung: `T-ACT-C2-01 bis -08`
- Finding/Korrektur: `TODO`
- Restrisiko: `TODO`
- Doku-Sync: `S6`
- Status: `TODO`

Exit S4: Inventarreferenz, Katalogvertrag, v2-Semantik, Suchmatrix und SQL sind
lokal vollständig umgesetzt und reviewt; Produktion ist noch unverändert.

## S5 - Tests, produktives SQL-Gate und Abschlussreview

Reasoning: `GPT-5.6 Sol / High`; Owner-Briefing und produktiver Write-Knoten
`Extra High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-C2-01 | lokal | v2-Vertrag entspricht Owner-Freeze; Referenz enthält 20 K-IDs/relevante Cardiofakten, aber keinen Gesundheits-/Planungskontext | TODO | kompakter Contract-Check | Inventar/v2-Vertrag |
| T-ACT-C2-02 | lokal | R1-Semantik und 78er-Baseline unverändert grün | TODO | Node Contract-Test | R1-Semantik/API |
| T-ACT-C2-03 | lokal | v2-API, Schema v1, Version 2, 80 aktive Entries, Deep Freeze | TODO | Node Contract-Test | v2-Semantik |
| T-ACT-C2-04 | lokal | exakte Studio-Suchmatrix, Normalisierung, Kollisionen und Multi Hip | TODO | Node Contract-Test | Aliase/Search |
| T-ACT-C2-05 | lokal | R3-Draft/Shell mit injiziertem v2 und neuen Keys | TODO | R3-C2-Contract-Test | v2/R3-Injection |
| T-ACT-C2-06 | lokal | Produktindex, Activity V1 und R3-Source-/Namespacegrenze unverändert | TODO | statischer Guard/Hashes | Scriptload/Produktdateien |
| T-ACT-C2-07 | disposable | SQL 20->21->16, Re-Run, 78/80, Drift-Fail und ACL/RLS unverändert | TODO | EV-ACT-C2-L01 bis -L03 | SQL 21/Fixture |
| T-ACT-C2-08 | disposable | R2-Commit und Last-Performance mit v2; bestehender Key versionsübergreifend | TODO | EV-ACT-C2-L04 | SQL/RPC/Katalog |
| T-ACT-C2-09 | produktiv read-only | v1 exakt 78; v2 entweder 0 oder bereits exakt 80; keine v2-Sessionreferenzen vor Erstwrite | TODO | EV-ACT-C2-PRE01/-02 | Runtime |
| T-ACT-C2-10 | produktiv write | freigegebenes SQL 21; danach exakt 78/80 und keine unerwartete Objekt-/ACL-Änderung | USER-GATED | EV-ACT-C2-W01/-POST01 | SQL-Ausführung |

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
    keine Änderung. Keine UI-Aktivierung und keine Gesundheits-/Sessiondaten.`
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

- Grüne Nachweise: `TODO`
- Wiederverwendete, nicht invalidierte Nachweise: `TODO`
- Nicht ausgeführte Smokes: `Browser-/Device-Smoke nicht erforderlich, da kein Produktload.`
- Produktiver Iststand: `TODO`
- Externer Review: `TODO`
- Offene Findings: `TODO`
- Commit-Entscheidung: `S6 offen`

Exit: Lokale, disposable und freigegebene produktive Postconditions sind grün;
kein In-Scope-P0/P1 und kein Katalogdrift bleibt offen.

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

- Source-of-Truth-Sync: `TODO`
- Finaler Review: `TODO`
- Restrisiken: `W-ACT-C2-01 oder none`
- Changelog-Relevanz: `TODO`
- Owner Recap: `TODO`
- Archiv:
  - `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap (DONE).md`
  - `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Evidence (DONE).md`
- Commit-Empfehlung: `TODO`

Exit: Repo, produktiver Katalog, Evidence, QA und Masterplan beschreiben
denselben C2-Vertrag; R4 ist freigegeben, Produktaktivierung bleibt gesperrt.

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

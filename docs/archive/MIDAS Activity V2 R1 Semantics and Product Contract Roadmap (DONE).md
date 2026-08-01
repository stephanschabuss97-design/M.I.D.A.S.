# MIDAS Activity V2 R1 Semantics and Product Contract Roadmap (DONE)

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Activity V2 - Semantik, Katalog und lokale Suche` |
| Owner / Kontext | `Stephan; persönliche Single-User-MIDAS-PWA` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-07-28` |
| Letzter Stand | `2026-07-30, S1-S6 PASS; R1 abgeschlossen und archiviert` |
| Aktueller Schritt | `abgeschlossen; nächster Rolling-Wave-Schritt ist eine eigene R2-Roadmap` |
| Risikoklasse | `R2` |
| Standard-Reviewtiefe | `Consumer` |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `S2: Extra High für erstmaligen Semantik- und Katalog-Freeze; S6: Medium` |
| Owner-Erklärmodus | `Briefing` |
| Betroffene Hauptdateien | `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`; `docs/Future trainingsmodule update thoughts.md`; `docs/modules/Activity Module Overview.md`; neue Dateien unter `app/modules/vitals-stack/activity/`; lokale Tests |
| Deploy relevant | `nein` |
| Produktive Schreibwirkung | `nein` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `nicht erforderlich` |
| Gekoppelte Roadmaps | `R2 folgt erst nach Abschluss dieser Roadmap` |
| Evidence-Owner | `nicht relevant` |
| Archivziel | `docs/archive/MIDAS Activity V2 R1 Semantics and Product Contract Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `R1 deterministisch bis zum freigegebenen Gate abarbeiten. Activity V2
    erhält einen stabilen Repo-Katalog, einen eindeutigen Semantikvertrag,
    deterministische lokale Suche und ausführbare Contract-Tests.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High; S2 Extra High; S6 Medium`
- Kontextübergabe aus dem Denkraum:
  - `PASS: Zielbild, Rolling-Wave-Vertrag und Roadmap-Zuständigkeiten stehen
    im Activity-V2-Masterplan und in dieser Roadmap.`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  5. `docs/Future trainingsmodule update thoughts.md`, besonders Abschnitte
     `4`, `5`, `8`, `18-20` und `22`
  6. `docs/modules/Activity Module Overview.md`
  7. `docs/qa/README.md` und `docs/qa/health-capture-reports.md`
  8. `app/modules/vitals-stack/activity/index.js`, relevante Script-Reihenfolge
     in `index.html` und nur direkt betroffene Activity-Consumer
  9. `git status --short` und nur der relevante Diff
- Startschritt:
  - `S1`
- Erlaubte Autonomie:
  - `lokale Reads, Roadmap-/Doku-Updates, neue isolierte Activity-V2-Dateien
    und lokale read-only Tests gemäß Workflow-Vertrag`
- Owner-Gates:
  - `S2: breiten generischen Basiskatalog statt eines persönlichen
    Plan-Katalogs freigeben; Verzicht auf Custom Entries ist bestätigt`
  - `S5: manueller Browser-Smoke nur falls R1 eine Browser-Testoberfläche
    benötigt; ansonsten lokale automatisierte Tests genügen`
- Stop-Bedingungen:
  - `fehlender Katalog-Freeze, unklare Key-Semantik, Einführung eines
    Build-Systems, produktive UI-/DB-Wirkung oder Widerspruch zum Masterplan`
- Halluzinationsschutz:
  - `Keine Übungen, Aliase, Wertebereiche oder Einheiten außerhalb des
    freigegebenen breiten Baseline Contracts als Katalogbestand ausgeben.`
- Startprompt:

```text
Arbeite die Roadmap
docs/MIDAS Activity V2 R1 Semantics and Product Contract Roadmap.md
gemäß ihrer Ausführungs-Chat-Startkarte ab. Beginne mit S1, verwende den
Activity-V2-Masterplan als fachliche Leitplanke und prüfe den realen Repo-Stand.
Erfinde keinen Katalog außerhalb des S2 Baseline Contracts und ändere weder
produktive Activity-V1-Flows noch Supabase. Stoppe am in S2 definierten
Owner-Gate, falls das breite Inventar noch nicht freigegeben ist.
```

## Session Resume Card

- Ziel:
  - `R1 ist vollständig abgeschlossen; stabile V2-Semantik ist R2-Eingang.`
- Ergebnis:
  - `catalog_version 1 mit 78 planunabhängigen Entries, generischen Keys,
    device_relative Lastgrenze und kontrolliertem Repo-Katalog.`
  - `Validator, Normalisierung, deterministische lokale Suche und isolierter
    AppModules.activityV2.semantics-Slot implementiert.`
  - `S1-S6 PASS; alle Findings geschlossen; Activity V1 unverändert.`
- Gültige Nachweise:
  - `T-ACT-R1-01 bis -05 PASS; Node 10/10; Owner-Browserbeleg 7/7 bei
    leerer Konsole; 78/78 Baseline und 565 Query-Oracle-Fälle`
- Runtime-/Deploy-Stand:
  - `isoliertes Fundament; keine produktive Script-, UI-, Supabase- oder
    Deploy-Integration`
- Nächster Schritt:
  - `R2 als eigene Rolling-Wave-Roadmap aus abgeschlossenem R1-Vertrag ableiten`
- Offene Findings / Owner-Gates:
  - `keine`

## Zielvertrag

Nach R1 gilt:

- Activity V2 besitzt genau einen versionierten, browserkompatiblen
  Repo-Semantikkatalog als Source of Truth.
- Jeder Katalogeintrag besitzt einen unveränderlichen kanonischen Key,
  UI-Label, kontrollierte Aliase, Kategorie, Tracking-Modus, Equipment und
  Lastvergleichbarkeit, explizite Feldsemantik sowie die in S2 freigegebenen
  Muskelgruppen- oder Sport-Tags.
- Kanonische Keys bezeichnen klassische Übungen und bleiben bei Wechsel von
  Studio, Hersteller oder Gerätemodell stabil.
- Der Basiskatalog ist breit und planunabhängig. Eine Übung darf ausgewählt
  werden, obwohl Stephan sie noch nie dokumentiert hat.
- R1 friert die fachlichen Session-/Item-Invarianten ein, die Semantik und R2
  benötigen. Timer-, Satzabschluss-, Korrektur- und Intensitätsverträge
  bleiben bei ihren im Masterplan benannten Folgeroadmaps.
- Activity V2 verwendet in seiner ersten produktiven Ausbaustufe
  ausschließlich den kontrollierten Repo-Katalog. Ungeprüfte Freitext-Keys
  und benutzerdefinierte Einträge sind nicht erlaubt.
- Die Tracking-Modi sind auf `strength_sets`, `duration` und
  `duration_distance` begrenzt.
- Lokale Suche rankt reproduzierbar nach normalisiertem exaktem Treffer,
  Alias, Präfix, enthaltenen Tokens und stabilem Tiebreak.
- Die Auswahl liefert den kanonischen Key als eindeutige Übergabe an den
  späteren Historien-Lookup; Tippen allein löst keine Datenbankabfrage aus.
- Das R1-Artefakt besitzt einen eindeutig benannten, minimalen öffentlichen
  Browservertrag innerhalb der bestehenden `AppModules`-Konvention. Es
  erzeugt keine unkontrollierten Globals und bleibt ohne neues Modul- oder
  Build-System in lokalen Node-Contract-Tests ladbar.
- Katalogvalidierung und Suche besitzen schlanke lokal ausführbare
  Contract-Tests ohne neues Build-System.
- Activity V1, Supabase, Doctor View, Reports, Protein und Trendpilot bleiben
  funktional unverändert.

Bewusst noch nicht Teil von R1:

- Session-UI, Satzeditor, Timer, Draft Recovery und Historien-Lookup.
- Tabellen, RLS, RPCs, produktive Speicherung, Cutover oder Migration.
- Entscheidung zu Satzabschluss, Timerbedienung, Korrektur oder Intensität.
- Vollständige Trainingsanalyse, Coaching oder medizinische Empfehlung.

## Problem und Ist-Zustand

- Activity V1 speichert freies Label, Tagesdauer und Notiz als genau ein
  `activity_event` pro Tag.
- Activity V2 benötigt planunabhängige Historie. Freitext würde dieselbe
  Übung unter verschiedenen Namen fragmentieren.
- MIDAS hat keinen Build-Step und keinen allgemeinen JS-Test-Stack. R1 muss
  deshalb direkt im bestehenden klassischen Browser-Modell funktionieren.
- Der Denkraum kennt einige Liftlog-Beispiele, aber der breite
  freigegebene Basiskatalog muss davon unabhängig sein.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R1-01 | 2026-07-28 | Rolling-Wave: nur R1 wird jetzt detailliert; R2 entsteht nach Abschluss von R1. | Verhindert spekulative Folge-Roadmaps und hält Verträge aktuell. | gesamtes Programm |
| D-ACT-R1-02 | 2026-07-28 | Ziel ist ein kontrollierter Repo-Katalog ohne benutzerdefinierte Einträge; der verbindliche Owner-Freeze erfolgt in S2. | Historie benötigt stabile Keys; Freitext fragmentiert Daten. | S2-S4 |
| D-ACT-R1-03 | 2026-07-28 | R1 hat keine produktive UI-, Supabase- oder Cutover-Wirkung. | Semantik wird isoliert bewiesen, bevor R2 davon abhängt. | Scope-Freeze |
| D-ACT-R1-04 | 2026-07-28 | Kein neues Framework, Build-System oder Paketmanager nur für R1. | MIDAS bleibt eine statische PWA ohne Build-Step. | Umsetzung/Tests |
| D-ACT-R1-05 | 2026-07-28 | Katalogeinträge sind datengetrieben; Such- und Validierungslogik bleiben davon getrennte reine Funktionen. | Datenpflege darf keine Suchlogik duplizieren. | S4 |
| D-ACT-R1-06 | 2026-07-28 | O-3 Satzabschluss verbleibt bei R5, O-4 Sessiontimer bei R3, O-5 Korrekturvertrag bei R8 und O-6 Intensität bei R6. | R1 soll spätere UI- und Lifecycle-Entscheidungen nicht vorwegnehmen. | Nicht-Scope |
| D-ACT-R1-07 | 2026-07-28 | R1 wird nicht in die produktive `index.html`-Script-Reihenfolge eingebunden. | Browserkompatibilität wird isoliert bewiesen, ohne Activity V1 zur Laufzeit zu berühren. | S4/S5 |
| D-ACT-R1-08 | 2026-07-30 | Der Katalog verwendet `midas.activity-catalog.v1`, eine positive `catalog_version`, geschlossene Taxonomien und vollständig deklarierte Entry-Feldpolicies. | Schema- und Inhaltsänderungen werden unterscheidbar und lokal validierbar. | S2-S4 |
| D-ACT-R1-09 | 2026-07-30 | Suchnormalisierung ist locale-unabhängig; Ranking verwendet eine vollständige Tupelreihenfolge und ASCII-Key-Codepoint-Tiebreak. | Gleicher Katalog und Query müssen runtime-unabhängig dieselbe Reihenfolge liefern. | S2-S5 |
| D-ACT-R1-10 | 2026-07-30 | Aktive Key-, Label- und Aliasformen verschiedener Entries dürfen nach Normalisierung keine Identitätskollision bilden. | Exakte Treffer bleiben eindeutig und Aliase erzeugen keine zweite Identität. | S2-S5 |
| D-ACT-R1-11 | 2026-07-30 | R1 registriert ausschließlich `AppModules.activityV2.semantics`; `AppModules.activity` bleibt unberührt. | Die neue Grundlage kollidiert nicht mit der produktiven V1-API. | S2-S5 |
| D-ACT-R1-12 | 2026-07-30 | Der öffentliche Katalog und alle ausgegebenen Entry-/Array-Werte sind tief eingefroren; Validierung und Suche mutieren keine Eingaben. | Consumer können die Source of Truth nicht unbeabsichtigt verändern. | S2-S5 |
| D-ACT-R1-13 | 2026-07-30 | Derselbe kanonische Key erscheint höchstens einmal pro Session; mehrere Sessions pro Tag und gemischte Tracking-Modi bleiben erlaubt. | Historie bleibt keybasiert, ohne Activity-V1-Tagesgrenze oder starre Sessionart zu übernehmen. | S2/R2 |
| D-ACT-R1-14 | 2026-07-30 | Zielwiederholungen und historische Liftlog-Gewichte sind keine Katalogdefaults; R1 speichert ausschließlich Messsemantik und Identität. | Planvorgaben und vergangene Leistung dürfen nicht zu globalen Entry-Eigenschaften werden. | S2-S4 |
| D-ACT-R1-15 | 2026-07-30 | Ein kanonischer Key bezeichnet die klassische generische Übung; Studio, Hersteller, Gerätemodell und Griffvariante sind keine Identität. | Ein Studiowechsel darf weder Katalogumbau noch Historienfragmentierung erzwingen. | S2-S4/R2 |
| D-ACT-R1-16 | 2026-07-30 | Geräte- und kabelbasierte Lasten werden als `device_relative` gekennzeichnet; nur standardisierte Lasten dürfen studioübergreifend als direkt vergleichbar gelten. | Derselbe kg-Wert kann auf verschiedenen Geräten eine andere reale Belastung bedeuten. | S2-S4/Export |
| D-ACT-R1-17 | 2026-07-30 | Zeitbasierte Kraftsätze wie Planks verwenden `duration_sec` statt Wiederholungen oder zusammengefasster Itemdauer. | Planks müssen als einzelne Sekundensätze verlustfrei erfasst werden. | S2-S5 |
| D-ACT-R1-18 | 2026-07-30 | Warm-up und Cool-down sind keine Itemrollen: Crosstrainer oder stationäres Rad sind normale Items, deren Position nur aus `item_order` folgt; Dehnen ist nicht im Startkatalog. | MIDAS zeichnet Ausgeführtes auf und soll keine Plan- oder Erinnerungspflicht erzeugen. | S2/R2-R3 |
| D-ACT-R1-19 | 2026-07-30 | Die erste produktive Ausbaustufe verwendet ausschließlich den kontrollierten Repo-Katalog ohne freie Custom Entries; fehlende Übungen werden versioniert ergänzt. | Stabile Keys und kontrollierte Semantik sind wichtiger als ungeprüfter Freitext. | S2-S4 |
| D-ACT-R1-20 | 2026-07-30 | Der spätere LLM-Export verwendet generischen Key und Label, Messsemantik und `load_comparability`; er exportiert beobachtete Historie, keine implizite Gerätegleichheit oder Planempfehlung. | Ein CKD-bezogener Plan-Consumer benötigt portable, aber ehrlich qualifizierte Trainingsdaten. | S2/Folgeroadmap Export |
| D-ACT-R1-21 | 2026-07-30 | Der PDF-Plan und Gerätefotos sind Beispiele und UX-/Aliasbelege, aber keine Kataloggrenze. R1 liefert einen breiten kuratierten Basiskatalog bekannter klassischer Gym-Übungen und relevanter Aktivitäten. | Activity V2 ist ein planunabhängiges Gym-Protokoll; auch noch nie ausgeführte Übungen müssen vor der ersten Nutzung auswählbar sein. | S2-S4 |
| D-ACT-R1-22 | 2026-07-30 | Tippen filtert ausschließlich lokal den Repo-Katalog. Erst die explizite Auswahl eines aktiven Entries übergibt dessen kanonischen Key an genau einen späteren Historien-Lookup. | Keine Datenbankquery pro Tastendruck; dennoch erscheint nach Auswahl automatisch die letzte abgeschlossene Ausführung. | R1-Handoff/R2/R4 |
| D-ACT-R1-23 | 2026-07-30 | Keine Historie ist ein neutraler gültiger Zustand und verhindert weder das Hinzufügen zum lokalen Session-Draft noch die erste Erfassung. Die gesamte Session wird erst am Workout-Ende atomar gespeichert. | Neue Übungen müssen sofort nutzbar sein; halbe Sessions dürfen nicht entstehen. | R2-R8 |
| D-ACT-R1-24 | 2026-07-30 | Kraftsätze dürfen als primäre Messung `reps`, `duration_sec` oder `distance_m` verwenden. | Ein breiter Gym-Katalog muss neben Wiederholungen und Holds auch Carries und Sled-Arbeit verlustfrei abbilden. | S2-S6 |
| D-ACT-R1-25 | 2026-07-30 | Die letzte Ausführung wird nach Auswahl nur als Referenz angezeigt und nie automatisch als heutige Leistung übernommen. Nur explizit neu erfasste Werte gelangen in den Draft und späteren Commit. | Historienanzeige darf keine phantomhaften Sätze oder Dauerwerte erzeugen. | R4-R8 |
| D-ACT-R1-26 | 2026-07-30 | Übungen mit inverser Unterstützung verwenden `assistance_kg` und einen eigenen generischen Key wie `assisted_pull_up`; `weight_kg` wird dafür nicht umgedeutet. | Mehr Unterstützung bedeutet weniger Eigenleistung und darf nicht wie aufsteigende externe Last ausgewertet werden. | S2-S6 |
| D-ACT-R1-27 | 2026-07-30 | Jedes Entry-`fields`-Objekt enthält exakt alle acht R1-Messfeldkeys mit `required`, `optional` oder `forbidden`; Cross-Field-Regeln prüfen Modus, Primärmessung und Lastart. | Vollständige Policies verhindern implizite Defaults und unterschiedliche Consumer-Interpretationen. | S2-S5 |
| D-ACT-R1-28 | 2026-07-30 | Nur Katalog, Entries, API und Rückgabewerte werden tief eingefroren; die Eltern-Namespaces `AppModules` und `activityV2` bleiben erweiterbar. Der `semantics`-Slot selbst ist nicht überschreibbar. | Spätere R2-Module benötigen denselben Namespace, dürfen aber R1 nicht ersetzen. | S3-S5 |
| D-ACT-R1-29 | 2026-07-30 | Die freigegebene erste Baseline besitzt `catalog_version: 1`, exakt 78 aktive ASCII-sortierte Entries und keine deprecated Entries. | Umsetzung und Tests benötigen einen eindeutigen Freeze statt einer ungefähren Übungsliste. | S2-S5 |
| D-ACT-R1-30 | 2026-07-30 | Der ältere Variantentrennungs- und persönliche Startkatalogvertrag im Activity-V2-Masterplan wird in S6 an generische Keys, `device_relative` und die breite Baseline angepasst. Bis dahin hat der jüngere R1-Vertrag Vorrang. | Pflichtreferenzen dürfen nach Abschluss nicht zwei widersprüchliche Identitätsmodelle beschreiben. | S6 |
| D-ACT-R1-31 | 2026-07-30 | Validatorfehler verwenden eine geschlossene Code-Taxonomie und kanonische JSONPath-ähnliche Pfade; abhängige Semantikchecks laufen nur auf strukturell gültigen Werten. | Tests und spätere Consumer dürfen nicht von zufälligen Meldungstexten oder instabilen Folgefehlern abhängen. | S4R-S5 |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing`
- Neue oder entscheidungsrelevante Konzepte:
  - `kanonischer generischer Key, UI-Label, Alias, Tracking-Modus,
    geräterelative Lastvergleichbarkeit und Label-Snapshot als spätere
    R2-Folge des stabilen Katalogvertrags`
- Geplantes Briefing-Gate:
  - `S2 vor dem Freeze des breiten generischen Basiskatalogs`
- Nicht erneut zu erklären:
  - `normale JavaScript-Syntax, DOM-Grundlagen oder Activity-V1-RPCs`

## Scope und Grenzen

In Scope:

- finaler Semantik- und Suchvertrag
- breiter, Owner-freigegebener generischer Basiskatalog
- browserkompatibles Katalogartefakt im Activity-Modul
- reine Validierungs-, Normalisierungs- und Suchfunktionen
- lokale Contract-Tests und passende QA-Definition
- Masterplan-/Module-Overview-Sync in S6

Nicht in Scope:

- sichtbarer Umbau des Training-Tabs
- Datenbank, Edge Functions, Auth, RLS oder produktive Writes
- Historienabfrage und Sessionpersistenz
- Custom-Entry-UI oder Freitext-Fallback
- automatische Übersetzung, Fuzzy-, Vektor- oder KI-Suche
- bestehende Activity-V1-Daten umbenennen oder migrieren

Roadmap-spezifische Guardrails:

- Kanonische Keys verwenden `snake_case`, ASCII und bleiben nach Freigabe
  stabil.
- Studio-, Hersteller-, Geräte- und Griffvarianten teilen den generischen
  Übungskey; fehlende Lastvergleichbarkeit wird separat und maschinenlesbar
  als `device_relative` modelliert.
- Labels und Aliase dürfen keine zweite Identität erzeugen.
- Suche arbeitet ausschließlich lokal und erzeugt keine Supabase-Abfrage.
- Das Katalogartefakt muss mit klassischen `<script>`-Ladevorgängen ohne
  Transpilation nutzbar sein.
- R1 wird ausschließlich über ein isoliertes lokales Browser-Harness geladen;
  `index.html` und die produktive Script-Reihenfolge bleiben unverändert.

## Scope-Freeze vor S4

- Bestehende Features:
  - `Activity V1 vollständig erhalten`
- Datenmodell, Lifecycle und Retention:
  - `unverändert`
- Cleanup, Scheduler, Secrets und externe Automationen:
  - `nicht betroffen`
- Kompatible Producer und Consumer:
  - `bestehendes AppModules.activity, assets/js/main.js, Doctor View
    einschließlich Health Export, Charts, Reports, Protein und Trendpilot
    bleiben unverändert`
- Offene Grundsatzfragen:
  - `keine; F-ACT-R1-07 ist geschlossen`
- Umgang mit späterem Scope-Wechsel:
  - `kleine Semantikkorrektur in S2/S3/S4R; UI oder DB als zuständige
    Folge-Roadmap; Custom Entries nur nach neuer Owner-Entscheidung`

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/Future trainingsmodule update thoughts.md`
- `docs/modules/Activity Module Overview.md`
- `docs/qa/README.md`
- `docs/qa/health-capture-reports.md`
- `app/modules/vitals-stack/activity/index.js`
- `assets/js/main.js` nur für den bestehenden Activity-V1-Consumer
- `index.html` nur für Activity-Fläche und Script-Reihenfolge

Pflicht ab S2:

- `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`

Nur bei konkreter Vertragsfrage:

- `sql/13_Activity_Event.sql`
- `app/modules/doctor-stack/doctor/index.js`
- `backend/supabase/functions/midas-monthly-report/index.ts`
- einschlägige archivierte Activity-/Protein-Roadmaps

## Tool Permissions und Gates

Allowed:

- lokale Datei- und Git-Reads
- neue isolierte Activity-V2-Katalog-, Semantik- und Testdateien
- lokale Syntax-, Contract- und Browser-Checks ohne produktive Wirkung

User-gated:

- Freigabe des exakten breiten generischen Basiskatalogs in S2: `erfüllt`
- manueller Browser-Smoke, falls S5 ihn als erforderlich bestätigt

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- Supabase, SQL, Deploys oder produktive Daten verändern.
- Activity V1 ersetzen, verstecken oder funktional verändern.
- nicht im Baseline Contract freigegebene Übungen als Katalogbestand deklarieren.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `High` | PASS | V1-Grenzen, Runtime, Tests und S2-Katalogkandidaten belegt; F-08 bis F-10 korrigiert. |
| S2 | Semantik-, Katalog- und Suchvertrag | `Extra High` | PASS | Baseline freigegeben; Schema, Suche, Selection-Handoff und vollständiger Contract Review grün. |
| S3 | Bruchrisiko- und Umsetzungsreview | `High` | PASS | Runtime-, Namespace-, Policy-, Rollback- und Invalidation-Risiken geschlossen oder konkreten Checks zugeordnet. |
| S4R | S4 Readiness Review | `High` | PASS | GREEN; Scope-Freeze, Fehlervertrag, Tests, Rollback und S4-Batch freigegeben. |
| S4 | Isolierte Semantik-Umsetzung | `High` | PASS | S4.1-S4.4 vollständig; isolierte Semantik, Tests und Harness grün. |
| S5 | Contract-Tests und Abschlussreview | `High` | PASS | T-01 bis T-05 und Full Contract Review PASS; keine offenen P0/P1. |
| S6 | Doku-Sync, Changelog, Archiv | `Medium` | PASS | Masterplan, Overview und QA synchronisiert; Full Review grün; Roadmap archiviert. |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R1-01 | P1 | Product Contract / Naming | fixed | Mehrdeutiges `V1` durch `erste produktive Activity-V2-Ausbaustufe` ersetzt. |
| F-ACT-R1-02 | P1 | Architecture Contract | fixed | Browser-/Test-API-Vertrag als S2-Pflicht ergänzt; bestehende `AppModules`-Konvention ist Leitplanke. |
| F-ACT-R1-03 | P1 | Scope / Runtime | fixed | Produktive `index.html`-Integration ausgeschlossen; isoliertes Browser-Harness ist Pflichtcheck. |
| F-ACT-R1-04 | P1 | Semantic Contract | fixed | Muskelgruppen-/Sport-Tags müssen in S2 fachlich entschieden und im Schema berücksichtigt werden. |
| F-ACT-R1-05 | P2 | Traceability | fixed | Decision-, Finding- und Test-IDs auf `ACT-R1` namespaced. |
| F-ACT-R1-06 | P2 | Contract Clarity | fixed | O-3 bis O-6 explizit R5, R3, R8 und R6 zugeordnet. |
| F-ACT-R1-07 | P1 | Product Contract | fixed | Owner hat die 78-Entry-Baseline und die generische Zusammenführung am 30.07.2026 ausdrücklich freigegeben. |
| F-ACT-R1-08 | P1 | Consumer Contract | fixed | Charts als direkter `AppModules.activity`-Consumer und Health Export als flacher V1-Consumer in Scope-Freeze und S1-Systemkarte ergänzt. |
| F-ACT-R1-09 | P1 | Roadmap Ownership | fixed | Die im Masterplan R1 zugeordneten Session-/Item-Invarianten als eigener S2-Vertragsschritt ergänzt. |
| F-ACT-R1-10 | P1 | Semantic Boundary | fixed | S2 trennt Katalog-Messfelder ausdrücklich von `completed_at`, Satzabschluss, Timer, Korrektur und Intensität der späteren Roadmaps. |
| F-ACT-R1-11 | P1 | Search Determinism | fixed | Locale- und Engine-abhängiges Sortieren ausgeschlossen; vollständiges Ranking-Tupel mit ASCII-Key-Tiebreak festgelegt. |
| F-ACT-R1-12 | P1 | Catalog Identity | fixed | Normalisierte Key-, Label- und Aliaskollisionen zwischen verschiedenen aktiven Entries werden katalogweit abgewiesen. |
| F-ACT-R1-13 | P1 | Runtime Mutability | fixed | Tiefes Einfrieren, eingabemutationsfreie Funktionen und nicht überschreibbarer Semantik-API-Slot festgelegt. |
| F-ACT-R1-14 | P1 | Alias Validation | fixed | Gleichwertiger eigener Key und Label bleiben zulässig; redundante Aliase zum eigenen Key/Label werden abgewiesen und aus dem Gate-Entwurf entfernt. |
| F-ACT-R1-15 | P1 | Semantic Coverage | fixed | Planks verwenden `duration_sec` pro Satz; die primäre Satzmessung wird entry-spezifisch festgelegt. |
| F-ACT-R1-16 | P1 | Cross-gym Comparability | fixed | Generische Übungskeys überleben Studiowechsel; `load_comparability` verhindert, dass Geräte-kg im Export als studioübergreifend standardisierte Leistung fehlinterpretiert werden. |
| F-ACT-R1-17 | P1 | Catalog Scope | fixed | Der persönliche PDF-/Foto-Katalog wurde durch einen breiten kuratierten Gym-Basiskatalog ersetzt; persönliche Nutzungshistorie beginnt unabhängig davon leer. |
| F-ACT-R1-18 | P1 | Selection Boundary | fixed | Lokale Typ-ahead-Suche und Supabase-Historie sind getrennt: erst explizite kanonische Auswahl löst den späteren Lookup aus. |
| F-ACT-R1-19 | P1 | Measurement Coverage | fixed | `distance_m` als primäre Satzmessung ergänzt, damit Carries und Sled-Übungen nicht aus dem breiten Katalog ausgeschlossen oder als Wiederholungen umgedeutet werden. |
| F-ACT-R1-20 | P1 | Draft Integrity | fixed | Vorherige Sätze/Dauer sind ausschließlich read-only Referenz; ohne explizite heutige Eingabe entsteht kein zu speichernder Leistungswert. |
| F-ACT-R1-21 | P1 | Inverse Load Semantics | fixed | `assistance_kg` und semantisch eigene Assisted-Entries verhindern, dass Unterstützung als normale Last gespeichert oder exportiert wird. |
| F-ACT-R1-22 | P1 | Field Policy Completeness | fixed | D-ACT-R1-27 verlangt alle acht Feldpolicies je Entry und geschlossene Cross-Field-Validierung. |
| F-ACT-R1-23 | P1 | Namespace Extensibility | fixed | D-ACT-R1-28 schützt den `semantics`-Slot, ohne den für R2 benötigten Eltern-Namespace einzufrieren. |
| F-ACT-R1-24 | P2 | Documentation Drift | fixed | S6 hat Masterplan 5.1, 5.5, R1 sowie O-1/O-2 auf generische Keys, `device_relative` und die breite 78-Entry-Baseline synchronisiert. |
| F-ACT-R1-25 | P1 | Catalog Freeze | fixed | Baseline ist als `catalog_version: 1` mit exakt 78 aktiven, sortierten Entries eingefroren. |
| F-ACT-R1-26 | P1 | Validator Error Contract | fixed | D-ACT-R1-31 friert Fehlercodes, Pfadformat, Sortierung und strukturelles Short-Circuiting vor S4 ein. |

<!-- markdownlint-enable MD013 -->

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Status: `PASS`. Pflichtreferenzen, V1-Produzenten/-Consumer, Runtime,
Testmöglichkeiten und damalige Masterplanbeispiele wurden geprüft; die
kompakte Systemkarte ist der verbleibende S1-Nachweis.

### S1-Ergebnis

#### Systemkarte und Activity-V1-Grenze

<!-- markdownlint-disable MD013 -->

| Schicht | Belegter Ist-Vertrag | R1-Grenze |
| --- | --- | --- |
| Capture-UI | `index.html` enthält Freitext, Dauer und Notiz; `assets/js/main.js` validiert und ruft `AppModules.activity.addActivity(...)` mit dem Capture-Tag auf. | unverändert; keine V2-UI und kein produktives V2-Script |
| Activity-Client | `app/modules/vitals-stack/activity/index.js` registriert klassisch `AppModules.activity`; öffentlich sind `loadActivities`, `addActivity`, `deleteActivity` und der von Charts verwendete `_callActivityRpc`-Fallback. | unverändert; R1 darf weder RPCs aufrufen noch die V1-API überschreiben |
| Supabase/SQL | `activity_event` besitzt `activity`, ganzzahlige `duration_min >= 1` und optionale Notiz; maximal ein Event pro User/Tag; RPCs sind `activity_add/list/delete`. | unverändert; keine Tabelle, RPC, Migration, RLS, Grants oder Datenwirkung |
| Doctor View | Rendert und löscht flache V1-Tageszeilen im Training-Drilldown. | unverändert |
| Health Export | Doctor-Modul exportiert V1 als `id`, `occurred_at`, `day`, `activity`, `duration_min` und optionale `note`. | unverändert |
| Charts | Lädt V1 direkt über `AppModules.activity.loadActivities()` und verwendet `_callActivityRpc` als Fallback; ein Tages-Event wird als Marker genutzt. | unverändert |
| Range Report | Edge Function liest `v_events_activity` und aggregiert Einträge, aktive Tage, Gesamt- und Durchschnittsdauer. | unverändert |
| Protein Targets | Zählt `activity_event`-Zeilen der letzten 28 Tage und leitet daraus den bestehenden Activity-Level ab. | unverändert |
| Trendpilot | Zählt V1-Zeilen und Wochen mit Einträgen als Vier-Wochen-Kontext. | unverändert |
| QA | `HCR-001` prüft den produktiven V1-Flow weiterhin als manuellen disposable Browser-Test. | unverändert; neue R1-Checks bleiben isoliert |
| Neues R1-Artefakt | Noch nicht vorhanden. | neue klassische Browserdateien und lokale Tests nur nach S2/S3/S4R; keine Aufnahme in produktive `index.html` |

<!-- markdownlint-enable MD013 -->

#### Belegte Runtime- und Testkonventionen

- MIDAS hat im Repo-Root kein `package.json` und keinen Web-Build-Step.
- Node `v24.18.0` ist verfügbar; Syntaxchecks und Tests mit eingebauten
  Node-Modulen benötigen keinen Paketmanager.
- Klassische Browsermodule verwenden eine IIFE mit
  `typeof window !== 'undefined' ? window : globalThis` und registrieren nur
  unter `AppModules`.
- Die produktive Reihenfolge lädt Activity V1 vor Supabase und `main.js`;
  Abhängigkeiten werden vom Activity-Modul erst beim Aufruf aufgelöst.
- Ein isoliertes HTML-Harness kann R1-Dateien in klassischer Reihenfolge laden.
  Playwright ist global verfügbar, wird aber nicht als Repo-Dependency ergänzt.
- S1 hat ausschließlich diese Roadmap geändert; Produktdateien, produktive
  Script-Reihenfolge und Runtime blieben unverändert.

#### Kandidaten für das S2-Owner-Gate

S1 belegte nur einzelne Masterplanbeispiele wie `biceps_curl`,
`leg_extension`, `cycling` und `swimming`. D-ACT-R1-21 ersetzt die damalige
persönliche Kandidatenlogik vollständig: allein der separate S2 Baseline
Contract enthält das aktuelle breite Inventar und seine Implementierungsvorgabe.

#### S1-Full-Review

- Ziel, Grenzen und nächster Schritt sind ohne Denkraum rekonstruierbar.
- F-ACT-R1-08 bis -10 schließen zusätzliche V1-Consumer, R2-Invarianten und
  die Grenze zu Abschluss, Timer, Korrektur und Intensität.
- Am Ende von S1 war F-ACT-R1-07 der einzige S4-blockierende Befund; er wurde
  mit der späteren S2-Owner-Freigabe geschlossen.
- Betroffene Schichten sind bekannt; S1 änderte keine Produktdatei.

## S2 - Semantik-, Katalog- und Suchvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Katalogschema mit Pflichtfeldern, Feldtypen und Version festlegen.
2. Tracking-Modi und je Modus erlaubte bzw. erforderliche fachliche
   Mess-/Eingabefelder festlegen. `completed_at`, Satzabschluss, Timer,
   Korrektur und Intensität bleiben ausdrücklich außerhalb dieses R1-Vertrags.
3. Key-, generische Identitäts-, Label-, Alias-, Einheiten-, Wertebereichs- sowie
   Muskelgruppen-/Sport-Tag-Vertrag festlegen.
4. Suchnormalisierung, Match-Klassen und ihre vollständige Priorität,
   Mehrtoken-Semantik, Empty-Query-, No-Match- und Ergebnislimit-Verhalten
   sowie den runtime-unabhängigen kanonischen Key-Tiebreak festlegen.
5. Fachliche Session-/Item-Invarianten für R2 festlegen: Mehrfachsessions pro
   Tag, gemischte Tracking-Modi, Key-Eindeutigkeit innerhalb einer Session,
   leere Session sowie getrennte Session- und Itemdauer. Keine Timer-,
   Abschluss-, Korrektur- oder Persistenzentscheidung vorwegnehmen.
6. Browser- und Test-API-Vertrag festlegen: `AppModules`-Namespace,
   öffentliche Katalog-/Validierungs-/Suchfunktionen, Dateireihenfolge,
   Mutationsschutz und Node-Testzugriff ohne neues Modul- oder Build-System.
7. Breiten generischen Basiskatalog gegen Bewegungsfamilien und Messmodi
   prüfen; persönliche Pläne sind kein Coverage-Kriterium.
8. Contract Review durchführen, F-ACT-R1-07 schließen und Resume Card
   ersetzen.

#### Owner Briefing S2

- Zweck:
  - `Der Katalog bestimmt später, welche Historie als dieselbe Übung gilt.`
- Wirkung:
  - `Ein Key bleibt stabil; Label und Aliase dürfen gepflegt werden.`
- Risiko:
  - `Geräte-kg verschiedener Studios dürfen trotz gemeinsamem Übungskey
    nicht als physikalisch identische Last fehlinterpretiert werden.`
- Rückfall:
  - `Vor R2 kann der Katalog ohne produktive Datenwirkung korrigiert werden.`
- Erfolgsnachweis:
  - `Verbreitete klassische Gym-Übungen sind auch ohne frühere persönliche
    Nutzung über Namen oder Alias suchbar und exportierbar.`
- Benötigte Freigabe:
  - `exaktes breites Baseline-Inventar; ausschließlicher Repo-Katalog und
    generische Übungsidentität sind bestätigt`

### S2.1 - Katalog- und Versionsschema

Der technische Vertrag ist festgelegt; die vollständige Entry-Liste steht im
separaten Baseline Contract und bleibt bis zum Owner-Gate ein Entwurf.

```text
catalog
├─ schema_version: "midas.activity-catalog.v1"
├─ catalog_version: positive Ganzzahl
├─ taxonomies
│  ├─ categories: eindeutige kanonische Tokens
│  ├─ equipment: eindeutige kanonische Tokens
│  ├─ muscle_groups: eindeutige kanonische Tokens
│  └─ sport_tags: eindeutige kanonische Tokens
├─ field_definitions: exakt die R1-Messfelder
└─ entries: Katalogeinträge in kanonischer Key-Reihenfolge
```

Pflichtvertrag:

- Erlaubte Top-Level-Felder sind exakt `schema_version`, `catalog_version`,
  `taxonomies`, `field_definitions` und `entries`.
- `schema_version` ändert sich nur bei inkompatibler Strukturänderung.
- `catalog_version` beginnt beim ersten Freeze mit `1` und steigt bei jeder
  Änderung an Entry, Label, Alias, Taxonomie, Feldpolicy oder Tag.
- Alle Taxonomie-Arrays und `entries` sind nicht leer, eindeutig und nach
  ASCII-Codepoints sortiert. Sortierung hängt weder von Sprache noch
  Einfügereihenfolge ab.
- Taxonomie-Tokens und Keys verwenden lowercase ASCII-`snake_case` nach
  `^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$`.
- Unbekannte Felder, Modi, Taxonomiewerte oder Feldpolicies sind
  Validierungsfehler; permissive Fallbacks sind nicht erlaubt.

Jeder Entry besitzt exakt:

<!-- markdownlint-disable MD013 -->

| Feld | Typ | Vertrag |
| --- | --- | --- |
| `key` | String | kanonisch, katalogweit eindeutig, 1-64 Zeichen, ASCII-`snake_case` |
| `label` | String | sichtbares Label, getrimmt, 1-80 Zeichen |
| `aliases` | String-Array | null bis 12 eindeutige, getrimmte Suchnamen, je 1-80 Zeichen |
| `category` | Token | genau ein Wert aus `taxonomies.categories` |
| `tracking_mode` | Enum | exakt `strength_sets`, `duration` oder `duration_distance` |
| `equipment` | Token | generische Equipmentklasse aus `taxonomies.equipment`; nie Hersteller oder Modell |
| `load_comparability` | Enum | `standardized`, `device_relative` oder `not_applicable` |
| `fields` | Objekt | vollständige, zum Tracking-Modus passende Feldpolicy |
| `muscle_groups` | Token-Array | Werte aus `taxonomies.muscle_groups` |
| `sport_tags` | Token-Array | Werte aus `taxonomies.sport_tags` |
| `status` | Enum | `active` oder `deprecated` |

<!-- markdownlint-enable MD013 -->

Tag-Vertrag:

- `strength`-Einträge benötigen mindestens eine Muskelgruppe und keine
  Sport-Tags.
- `endurance`- und `sport`-Einträge benötigen mindestens einen Sport-Tag und
  keine Muskelgruppen. Damit behauptet R1 keine scheingenauen Muskelanteile
  für komplexe Sportarten.
- Entry-Arrays für Muskelgruppen und Sport-Tags sind eindeutig und
  ASCII-Codepoint-sortiert.
- Kategorie `strength` verlangt `strength_sets`; `endurance` und `sport`
  erlauben ausschließlich `duration` oder `duration_distance`.
- Geschlossene initiale Muskelgruppen-Taxonomie:
  `adductors`, `back`, `biceps`, `calves`, `chest`, `core`, `forearms`,
  `full_body`, `glutes`, `hamstrings`, `hip_flexors`, `quadriceps`,
  `shoulders`, `triceps`.
- Geschlossene initiale Sport-Tag-Taxonomie:
  `endurance`, `indoor`, `outdoor`, `team_sport`, `water_sport`.
- Initiale Kategorien sind `endurance`, `sport` und `strength`.
- Initiale generische Equipment-Tokens sind `barbell`, `bodyweight`, `cable`,
  `cardio_machine`, `dumbbell`, `kettlebell`, `machine`, `none` und
  `variable`. Hersteller, Modell, Studio sowie `selectorized` gegenüber
  `plate_loaded` sind keine Key- oder Taxonomieidentität.
- `load_comparability: standardized` ist nur zulässig, wenn `weight_kg`
  geräteunabhängig dieselbe Lastkonvention besitzt. Maschinen-, Kabel-,
  variable und unterstützte Einträge verwenden `device_relative`; Einträge
  ohne `weight_kg` und ohne `assistance_kg` verwenden `not_applicable`.

Versions- und Lebenszyklusvertrag:

- Ein Key wird ab Owner-Freeze nicht umbenannt, umgedeutet oder wiederverwendet.
- Vor R2 notwendige Korrekturen öffnen S2/S3/S4R kontrolliert erneut und
  erhöhen `catalog_version`; sie sind keine stille Textänderung.
- Sobald produktive V2-Historie existiert, bleibt ein entfallener Key als
  `deprecated` im Katalog. `getEntryByKey()` kann ihn weiterhin auflösen;
  Standardsuche zeigt nur `active`.
- Label-, Alias- und Tag-Pflege ändert nicht die historische Identität.

### S2.2 - Messfelder und Tracking-Modi

Die Bereiche sind Validierungsgrenzen und keine medizinischen Empfehlungen.
Ein optionales Feld wird bei leerer Eingabe weggelassen, nicht als `0` oder
leerer String gespeichert.

<!-- markdownlint-disable MD013 -->

| Feld | Scope | Typ / Einheit | Wertebereich | Bedeutung |
| --- | --- | --- | --- | --- |
| `reps` | Satz | Integer / `count` | `1..1000` | abgeschlossene Wiederholungen dieses Satzes |
| `duration_sec` | Satz | Integer / `s` | `1..3600` | reale Dauer eines einzelnen zeitbasierten Satzes, zum Beispiel Plank |
| `distance_m` | Satz | Zahl / `m` | `0.1..10000`, maximal zwei Dezimalstellen | reale Strecke eines einzelnen Carry-/Sled-Satzes |
| `weight_kg` | Satz | Zahl / `kg` | `0.01..1000`, maximal zwei Dezimalstellen | dokumentierte Last; Vergleichbarkeit folgt `load_comparability`, keine inverse Assistenzlogik |
| `assistance_kg` | Satz | Zahl / `kg` | `0.01..1000`, maximal zwei Dezimalstellen | dokumentierte Unterstützung; höherer Wert bedeutet nicht höhere Eigenleistung |
| `duration_min` | Item | Integer / `min` | `1..1440` | reale Dauer dieses Items, nicht automatisch die Sessiondauer |
| `distance_km` | Item | Zahl / `km` | `0.01..1000`, maximal zwei Dezimalstellen | Distanz des Items |
| `note` | Item | String / keine Einheit | getrimmt `1..500` Zeichen, wenn vorhanden | rein dokumentarische Itemnotiz |

<!-- markdownlint-enable MD013 -->

`field_definitions` verwendet keine frei erfundenen Descriptor-Felder:

- `reps`, `duration_sec` und `duration_min` besitzen exakt `scope`,
  `value_type: integer`, `unit`, `min` und `max`.
- `weight_kg`, `assistance_kg`, `distance_m` und `distance_km` besitzen exakt `scope`,
  `value_type: number`, `unit`, `min`, `max` und `max_decimals: 2`.
- `note` besitzt exakt `scope`, `value_type: string`, `trim: true`,
  `min_length` und `max_length`.

Feldpolicy je Modus:

<!-- markdownlint-disable MD013 -->

| Modus | Pflicht | Entry-abhängig | Optional | Verboten |
| --- | --- | --- | --- | --- |
| `strength_sets` | exakt eines von `reps`, `duration_sec`, `distance_m` | die primäre Satzmessung ist `required`, die anderen `forbidden`; höchstens eines von `weight_kg` und `assistance_kg` darf entry-abhängig `required` oder `optional` sein | `note` | `duration_min`, `distance_km` |
| `duration` | `duration_min` | keine | `note` | `reps`, `duration_sec`, `distance_m`, `weight_kg`, `assistance_kg`, `distance_km` |
| `duration_distance` | `duration_min` | keine | `distance_km`, `note` | `reps`, `duration_sec`, `distance_m`, `weight_kg`, `assistance_kg` |

<!-- markdownlint-enable MD013 -->

- `fields` deklariert für den Modus jeden erlaubten Feldnamen mit
  `required`, `optional` oder `forbidden`; fehlende oder zusätzliche Policies
  sind ungültig.
- Konkret enthält jedes `fields`-Objekt exakt `assistance_kg`, `distance_km`,
  `distance_m`, `duration_min`, `duration_sec`, `note`, `reps` und
  `weight_kg` in ASCII-Key-Reihenfolge. Auch verbotene Felder werden
  ausdrücklich als `forbidden` deklariert.
- `weight_kg` bleibt innerhalb derselben Geräteausführung aufsteigend
  interpretierbar. Bei `device_relative` darf weder UI noch Export behaupten,
  dass Werte verschiedener Maschinen, Studios oder Kabelzüge direkt
  vergleichbar sind.
- `assistance_kg` ist ausschließlich für Entries mit inverser
  Unterstützungssemantik zulässig. Ein Entry darf niemals sowohl
  `weight_kg` als auch `assistance_kg` erlauben.
- `set_order`, `completed_at`, Satzabschlusszustand und Sessiontimer sind keine
  Katalog-Messfelder. O-3 und O-4 bleiben bei R5 beziehungsweise R3.
- Intensität bleibt vollständig bei R6. R1 reserviert weder Skala noch
  Freitextfeld.
- Korrektur-, Speicher- und Löschsemantik bleiben bei R8.

### S2.3 - Key-, Identitäts-, Label- und Aliasvertrag

- Historie hängt ausschließlich am `key`. Label, Alias, Kategorie, Equipment
  und Tags dürfen niemals als Ersatzidentität verwendet werden.
- Der Key bezeichnet die klassische Übung, zum Beispiel `leg_press`,
  `lat_pulldown` oder `biceps_curl`, nicht Gym, Hersteller oder Gerätemodell.
- Griff-, Kabel-, Maschinen- und Hantelzusätze werden in R1 nicht
  spezialisiert, wenn Stephan sie als dieselbe klassische Übung versteht.
  Gebräuchliche konkrete Bezeichnungen wie `Wide Grip Lat Pull Down` oder
  `Seated Cable Rows` sind dann Aliase zum generischen Entry.
- Unterschiedliche Gerätegewichte bleiben unter demselben generischen Key
  zulässig, werden aber mit `load_comparability: device_relative` gegen
  falsche studioübergreifende Leistungsvergleiche abgesichert.
- Ein eigener Key ist nur nötig, wenn eine andere klassische Bewegung oder
  eine inkompatible Messsemantik vorliegt, etwa inverse Assistenz statt Last.
- Eine spätere Spezialisierung erzeugt neue prospektive Keys. Alte generische
  Historie wird nicht rückwirkend auf vermutete Varianten verteilt.
- Gerätefotos dürfen Label, Aliase, Muskelgruppen und Feldsemantik belegen,
  aber niemals Hersteller- oder Modellidentität in den Key einführen.
- Labels dürfen Deutsch oder etablierte englische Übungsnamen verwenden.
  Sichtbare deutsche Wörter verwenden echte Umlaute; Keys und Tokens bleiben
  ASCII.
- Ein Alias ist nur ein Suchweg. Er wird nie gespeichert, exportiert oder für
  Historien-Lookup verwendet.
- Der eigene Key und das eigene Label dürfen dieselbe normalisierte Suchform
  besitzen; das ist dieselbe Identität und bei sprechenden Keys erwartbar.
- Ein Alias darf nach Normalisierung weder eigenen Key beziehungsweise Label
  noch einen weiteren Alias desselben Entries duplizieren.
- Katalogweit darf keine normalisierte aktive Key-/Label-/Aliasform zu zwei
  Entries gehören. Eine solche Kollision blockiert den Katalog.

### S2.4 - Suchnormalisierung und vollständiges Ranking

`normalizeSearchText(text)` arbeitet in exakt dieser Reihenfolge:

1. Nur Strings akzeptieren; andere Typen erzeugen `TypeError`.
2. Unicode mit `NFKD` zerlegen.
3. Mit runtime-unabhängigem `toLowerCase()` kleinschreiben.
4. `ß` explizit durch `ss` ersetzen.
5. Kombinierende Zeichen `U+0300..U+036F` entfernen.
6. Jeden Lauf nicht-alphanumerischer ASCII-Zeichen einschließlich `_` und
   Bindestrich durch genau ein Leerzeichen ersetzen.
7. Mehrfachleerzeichen kollabieren und Anfang/Ende trimmen.

Gesucht wird ausschließlich in normalisiertem `label`, `key` und jedem
einzelnen Alias. Kategorie, Equipment und Tags sind keine versteckten
Suchbegriffe.

Das Ranking verwendet aufsteigend dieses vollständige Tupel:

```text
(match_class, source_rank, canonical_key_ascii)
```

<!-- markdownlint-disable MD013 -->

| `match_class` | Treffer | `source_rank` |
| --- | --- | --- |
| `0` | Query ist exakt normalisiertes Label oder normalisierter Key | Label `0`, Key `1` |
| `1` | Query ist exakt ein normalisierter Alias | Alias `0` |
| `2` | Eine einzelne Suchform beginnt mit der vollständigen Query | Label `0`, Key `1`, Alias `2` |
| `3` | Alle Query-Tokens treffen als Tokenpräfixe innerhalb derselben Suchform | Label `0`, Key `1`, Alias `2` |

<!-- markdownlint-enable MD013 -->

Mehrtoken- und Tiebreak-Vertrag:

- Für `match_class = 3` wird die normalisierte Query in eindeutige Tokens
  zerlegt; dort ändern Reihenfolge und doppelte Query-Tokens die
  Tokenqualifikation nicht. Exakt- und Präfixtreffer verwenden weiterhin die
  vollständige normalisierte Query.
- Alle Query-Tokens müssen innerhalb derselben Suchform treffen. Treffer
  dürfen nicht aus Label und verschiedenen Aliasen zusammengesetzt werden.
- Tokenmatching ist AND-Semantik. Es gibt weder Substring-in-Token-, Fuzzy-,
  Übersetzungs-, KI- noch Vektorsuche.
- Wenn ein Entry über mehrere Suchformen passt, zählt sein bestes
  Ranking-Tupel genau einmal.
- Letzter Tiebreak ist ausschließlich der kanonische ASCII-Key über
  JavaScript-Codepointvergleich (`<`/`>`), niemals `localeCompare`,
  Katalogreihenfolge oder Engine-Sortierstabilität.

Randfälle:

- Leere oder nach Normalisierung leere Query liefert `[]`.
- Kein Treffer liefert `[]` und ist kein Fehler.
- Standardsuche berücksichtigt nur `active`.
- Standardlimit ist `20`; zulässig sind positive Integer von `1..50`.
  Ungültige Limits erzeugen `RangeError`; Ergebnisse werden erst nach
  vollständigem Ranking abgeschnitten.
- Gleicher Query-, Katalog- und Limitstand liefert in Browser und Node dieselbe
  Key-Reihenfolge.

Selection-Handoff:

- Tippen und `search()` lesen ausschließlich den lokalen Katalog und greifen
  weder auf Supabase noch auf Activity-Historie zu.
- Erst der bewusste Klick auf genau ein aktives Suchergebnis wählt dessen
  kanonischen `key`.
- Dieser Key ist die einzige Identität für den späteren Lookup der letzten
  abgeschlossenen Ausführung. Label, Alias und Querytext werden nicht als
  Datenbanksuchschlüssel verwendet.
- Ein leeres Lookup-Ergebnis ist der neutrale Zustand `keine Historie`; der
  Entry kann trotzdem sofort als neues Item in den lokalen Draft gelangen.
- Geladene vorherige Werte bleiben read-only Referenz. Sie werden weder
  vorbefüllt noch ohne neue Eingabe in den Session-Commit übernommen.

### S2.5 - Fachliche Session-/Item-Invarianten für R2

- Eine abschließbare Session enthält mindestens ein vollständig gültiges Item.
- Mehrere abgeschlossene Sessions am selben Kalendertag sind erlaubt.
- Eine Session darf Items verschiedener Tracking-Modi enthalten.
- Derselbe `item_key` erscheint höchstens einmal pro Session. Weitere Sätze
  oder Werte gehören zum bereits vorhandenen Item.
- Jedes Item besitzt genau einen Key und verwendet ausschließlich den
  Tracking-Modus und die Feldpolicy des zugehörigen Katalogeintrags.
- Unbekannte, deaktivierte oder freie Keys dürfen nicht in eine neue Session
  aufgenommen werden. Deprecated Keys bleiben nur für Historienauflösung
  sichtbar.
- Ein aktiver Katalogeintrag darf unabhängig davon ausgewählt werden, ob für
  seinen Key bereits persönliche Historie existiert.
- Sessiondauer und Itemdauer sind getrennte Fakten. Itemdauern werden weder
  summiert noch automatisch als Sessiondauer interpretiert.
- Warm-up und Cool-down sind weder Itemtypen noch Flags. Ein Crosstrainer-
  oder Rad-Item bleibt ein normales Dauer-Item; seine erste oder letzte
  Position ergibt sich ausschließlich aus `item_order`, dessen Speicherung R2
  festlegt.
- Der spätere Label-Snapshot dient Lesbarkeit; weder Snapshot noch aktuelles
  Label ersetzen den Key.
- R1 entscheidet nicht Start-/Endzeit, Pause, Satzabschluss, Korrektur,
  Commitform oder Datenbankconstraints. Diese Grenzen bleiben bei R2, R3, R5
  und R8.

### S2.6 - Browser- und Test-API-Vertrag

Geplantes Artefakt:

```text
app/modules/vitals-stack/activity/v2/semantics.js
app/modules/vitals-stack/activity/v2/semantics.contract.test.js
app/modules/vitals-stack/activity/v2/semantics-harness.html
```

Lade- und Namespace-Vertrag:

- `semantics.js` ist eine klassische Strict-Mode-IIFE ohne ESM, Transpilation,
  Paketmanager oder Build-Step.
- Runtimeziel ist
  `typeof window !== 'undefined' ? window : globalThis`.
- Einziger neuer öffentlicher Slot ist
  `AppModules.activityV2.semantics`.
- Fehlt `AppModules`, wird ein erweiterbares Plain Object angelegt. Ein
  vorhandener Nicht-Objektwert erzeugt `TypeError`; dasselbe gilt für
  `AppModules.activityV2`.
- `AppModules.activity`, DOM, Supabase, `fetch`, Storage, Zeit und produktive
  Events werden weder gelesen noch verändert.
- Der `semantics`-Slot ist nicht überschreibbar. Eine doppelte fremde
  Registrierung wirft deterministisch, statt eine API still zu ersetzen.
- `semantics` ist enumerable, nicht schreibbar und nicht konfigurierbar.
  `AppModules` und `activityV2` bleiben erweiterbar und werden nicht
  eingefroren.
- R1 lädt das Artefakt nur im isolierten Harness; `index.html` bleibt
  unverändert.

Öffentliche API:

<!-- markdownlint-disable MD013 -->

| Funktion | Vertrag |
| --- | --- |
| `getCatalog()` | liefert den vollständig tief eingefrorenen Katalog einschließlich Taxonomien und deprecated Entries |
| `getEntryByKey(key)` | exakter kanonischer Key-Lookup; liefert tief eingefrorenen Entry oder `null` |
| `normalizeSearchText(text)` | implementiert ausschließlich S2.4 und besitzt keine Seiteneffekte |
| `validateCatalog(candidate)` | mutiert den Kandidaten nicht; liefert tief eingefrorenes `{ valid, errors }` |
| `search(query, options?)` | liefert ein tief eingefrorenes Array tief eingefrorener aktiver Entries in festgelegter Reihenfolge |

<!-- markdownlint-enable MD013 -->

Validator- und Testzugriff:

- `getEntryByKey` akzeptiert nur Strings; andere Typen erzeugen `TypeError`.
  Ein syntaktisch unbekannter oder nicht vorhandener Key liefert `null`.
- `search` akzeptiert als Optionen ausschließlich ein Objekt mit optionalem
  `limit`; falscher Optionstyp oder unbekannte Optionsfelder erzeugen
  `TypeError`.
- `validateCatalog` bildet auch einen Nicht-Objekt-Kandidaten als
  `valid: false` mit stabilem Fehlercode ab, statt den Kandidaten zu mutieren.
- Das eingebaute Katalogobjekt wird vor API-Registrierung vollständig
  validiert. Ein Fehler verhindert die Registrierung.
- Validierungsfehler besitzen mindestens stabile `code`- und `path`-Felder
  und werden nach `path`, dann `code` über ASCII-Codepoints sortiert.
- Tests prüfen Fehlercodes und Pfade, nicht frei formulierte Meldungstexte.
- Zulässige Codes sind exakt `duplicate_value`, `invalid_order`,
  `invalid_type`, `invalid_value`, `missing_field`,
  `normalized_collision`, `policy_mismatch`, `unknown_field` und
  `unknown_reference`.
- Pfade beginnen mit `$`; Objektfelder verwenden `.name`, Arraywerte
  `[index]`, beispielsweise `$.entries[12].aliases[1]`.
- Ein strukturell ungültiger oder fehlender Wert erzeugt keine abhängigen
  Sortier-, Referenz-, Kollisions- oder Policyfolgefehler. Unabhängige
  Geschwister werden weiterhin geprüft.
- Node lädt dieselbe klassische Datei per `require(...)` und liest anschließend
  `globalThis.AppModules.activityV2.semantics`; es gibt keinen separaten
  CommonJS-Export und keine zweite Implementierung.
- Lokale Tests verwenden ausschließlich `node:test` und
  `node:assert/strict`.
- Das Browser-Harness lädt zuerst `semantics.js`, führt danach dieselben
  öffentlichen Contract-Fälle aus und bleibt außerhalb der produktiven App.

### S2.7 - Breiter Basiskatalog

Das exakte Owner-Gate-Inventar liegt in
`docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`. Diese Roadmap hält
nur die Regeln; die Inventartabelle wird nicht dupliziert.

Coverage-Vertrag:

- Der Basiskatalog deckt verbreitete klassische Übungen für Brust, Rücken,
  Schultern, Arme, Beine, Core und funktionelles Training sowie relevante
  Cardio-/Aktivitätsformen ab.
- Er ist unabhängig von Stephans aktuellem Plan und persönlicher Historie.
  `biceps_curl`, `bench_press` und andere noch nie ausgeführte Entries sind
  trotzdem lokal auffindbar.
- Hersteller, Studio, Gerätemodell, Griff, Stand, Tempo und reine
  Schreibvarianten erzeugen keine eigenen Keys. Bekannte Namen werden Aliase.
- Eine fachlich andere klassische Bewegung oder inverse Messsemantik darf
  einen eigenen Key erhalten, etwa `assisted_pull_up`.
- Kein Treffer erzeugt keinen Freitext-Key. Eine echte Lücke wird als neuer,
  versionierter Repo-Entry ergänzt.
- Fotos dürfen Beschreibungsverständnis und Aliase verbessern, sind aber kein
  Vollständigkeits-Gate und fügen nicht automatisch Studiogeräte hinzu.

### S2.8 - Owner-Quellen und geklärter Produktflow

- PDF und Liftlog-Screenshots belegen nur reale Werteformen und die gewünschte
  Liftlog-artige UX; sie begrenzen den Katalog nicht.
- Der dunkle MIDAS-Screenshot belegt ausschließlich den flachen V1-Iststand.
- Liftlog-Gewichte und PDF-Zielwerte bleiben Historie beziehungsweise
  Planinhalt und werden nie Katalogdefaults.
- Tippen wie `bice...` filtert lokal; Klick auf `Biceps Curl` wählt
  `biceps_curl`; erst dann lädt R4 über den in R2 bewiesenen Lookup die letzte
  abgeschlossene Ausführung.
- Vorherige Werte sind read-only. Neue Reps, Last, Satzdauer, Satzdistanz oder
  Itemdauer entstehen nur durch heutige Eingabe im lokalen Draft.
- R8 speichert die gesamte abgeschlossene Session atomar. R1 implementiert
  weder Supabase-Lookup noch Draft, Editor oder Commit.
- Die spätere CKD-bezogene LLM-Planbearbeitung ist nicht Teil von R1; R1
  liefert ihr lediglich portable, qualifizierte Trainingssemantik.

### S2 Full Contract Review

- Schema, Versionierung, Modi, Tags, Suche, Randfälle,
  Session-/Item-Invarianten und öffentlicher Browservertrag sind ohne Denkraum
  rekonstruierbar. Timed-/Distanzsätze, Assisted-Semantik, generische
  Identität, Lastvergleichbarkeit und Repo-only sind geschlossen.
- Der freigegebene Baseline Contract enthält exakt 78 ASCII-sortierte Entries:
  67 `strength`, 8 `endurance` und 3 `sport`. Alle zehn Messshorthands und
  alle drei Tracking-Modi sind belegt.
- 245 normalisierte Key-/Label-/Alias-Suchformen sind kollisionsfrei; kein
  Entry besitzt mehr als sechs Aliase. `bice...` normalisiert zu `bice` und
  trifft `biceps_curl` per Labelpräfix.
- Kategorie, Equipment, Muskelgruppen-/Sport-Tags, Messshorthands,
  Keysyntax, Tagreihenfolge und Aliasgrenzen wurden statisch ohne Fehler
  geprüft.
- F-ACT-R1-11 verhindert runtimeabhängige Suche; F-ACT-R1-12 und -14
  verhindern mehrdeutige beziehungsweise redundante Identitäten;
  F-ACT-R1-13 verhindert Mutation und Namespace-Überschreiben.
- Activity V1 und alle S1-Consumer bleiben außerhalb des neuen API-Slots.
- R1 legt keine Intensität, Satzabschluss-, Timer-, Korrektur-, Persistenz-
  oder Datenbanksemantik fest.
- Owner hat die Baseline, generische Zusammenführung und
  `device_relative`-Grenze ausdrücklich freigegeben; F-ACT-R1-07 ist
  geschlossen.
- Der ältere widersprüchliche Masterplantext ist über D-ACT-R1-30 bis zum
  verpflichtenden S6-Sync eindeutig nachrangig.

Exit: `PASS`. Keine Semantik- oder Katalog-Grundsatzfrage blockiert S3.

## S3 - Bruchrisiko- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Doppelte Keys, Alias-Kollisionen, ungültige Tracking-Modi,
   widersprüchliche Felddefinitionen und instabile Sortierung prüfen.
2. Unicode-/Umlaut-Normalisierung, Groß-/Kleinschreibung, Bindestriche und
   Leerzeichen als Suchfälle abdecken.
3. Script-Reihenfolge, `AppModules`-Namespace, öffentliche API-Grenze und
   fehlendes Build-System prüfen.
4. Sicherstellen, dass keine R1-Datei Activity V1 oder Supabase konsumiert.
5. Rollback und Test-Invaliderung festlegen; S4-Substeps final schneiden.
6. Full Contract Review durchführen, Findings korrigieren und Resume Card
   ersetzen.

### S3-Risikomatrix

<!-- markdownlint-disable MD013 -->

| ID | Bruchrisiko | Prävention / Nachweis | Zuständig |
| --- | --- | --- | --- |
| RISK-ACT-R1-01 | Baseline-Zeile wird bei der JS-Übertragung ausgelassen oder umgedeutet | `catalog_version: 1`, exakt 78 aktive sortierte Keys und vollständige Feldpolicies; T-ACT-R1-02 prüft Freeze | S4.1/S4.4 |
| RISK-ACT-R1-02 | Alias oder Unicode-Normalisierung erzeugt mehrdeutige Suche | katalogweite Kollisionsvalidierung, NFKD-/`ß`-Vertrag und `bice...`-Regression | S4.2/S4.4 |
| RISK-ACT-R1-03 | `distance_m`, `duration_sec`, Last oder Assistenz werden gleichzeitig falsch erlaubt | alle acht Policies je Entry plus Cross-Field-Validator; positive und negative Fixtures | S4.2/S4.4 |
| RISK-ACT-R1-04 | Generische Gerätehistorie wird als standardisierte Last gelesen | `load_comparability` ist Pflichtfeld; Baseline verwendet bei Last/Assistenz ausschließlich `device_relative` | S4.1/S4.4 |
| RISK-ACT-R1-05 | R1 überschreibt Activity V1 oder blockiert spätere `activityV2`-Module | eigener nicht überschreibbarer `semantics`-Slot; Eltern-Namespaces bleiben erweiterbar; T-ACT-R1-04/-05 | S4.1/S4.4 |
| RISK-ACT-R1-06 | Isoliertes Artefakt löst versehentlich Supabase-, DOM-, Storage- oder Netzwerkzugriffe aus | keine entsprechenden Referenzen; statischer Guard und Harness | S4.1-S5 |
| RISK-ACT-R1-07 | Sortierer hängt von Locale, Katalogreihenfolge oder Engine-Stabilität ab | vollständiges Ranking-Tupel und eindeutiger ASCII-Key-Tiebreak | S4.3/S4.4 |
| RISK-ACT-R1-08 | Node-Test und klassischer Browser laden unterschiedliche Implementierungen | dieselbe IIFE-Datei wird per `require` beziehungsweise `<script>` geladen | S4.4/S5 |
| RISK-ACT-R1-09 | Älterer Masterplan führt später wieder Variantentrennung ein | D-ACT-R1-30 hat Präzedenz; F-ACT-R1-24 ist verpflichtender S6-Syncpunkt | S6 |

<!-- markdownlint-enable MD013 -->

### S3-Umsetzungs- und Rollbackvertrag

- S4.1-S4.3 dürfen als ein gemeinsamer reiner Implementierungsblock laufen,
  weil sie dieselbe neue isolierte Datei ohne Runtimeintegration betreffen.
  S4.4 bleibt der unabhängige Testblock.
- Das produktive `index.html`, `AppModules.activity`, Supabase und bestehende
  Consumer bleiben unangetastet. Das Browser-Harness ist die einzige
  HTML-Ladestelle in R1.
- Rollback vor produktiver Nutzung besteht ausschließlich aus dem Entfernen
  der neu angelegten `activity/v2`-Artefakte und dem Zurücknehmen der
  zugehörigen R1-Doku. Es gibt keine Daten-, SQL- oder Deploy-Rückwirkung.
- Katalog-/Alias-/Policyänderung invalidiert T-ACT-R1-02 und -03;
  Normalisierung/Ranking invalidiert T-ACT-R1-03 und -05;
  Namespace-/Dateiladeänderung invalidiert T-ACT-R1-01, -04 und -05.
- S4-Tests verwenden für Doppelregistrierungs- und Namespacefehler getrennte
  `node:vm`-Kontexte, damit der nicht konfigurierbare produktive Slot im
  Haupt-Testprozess nicht künstlich gelöscht werden muss.

### S3 Full Contract Review

- Freigegebene Baseline, Roadmapschema und alle 78 Tabellenzeilen wurden auf
  Keyreihenfolge, Syntax, Taxonomien, Aliasgrenzen, normalisierte Kollisionen,
  Tags und Messshorthands geprüft: `PASS`.
- Reale Runtimeprüfung bestätigt klassische Activity-V1-IIFE,
  `AppModules.activity`, fehlenden Build-Step und Node `v24.18.0`.
- Die neue R1-Datei ist weder vorhanden noch produktiv referenziert; S3 hat
  keine Produkt-, Script-, Supabase- oder Datenänderung vorgenommen.
- F-ACT-R1-22, -23 und -25 wurden im Review geschlossen. F-ACT-R1-24 blieb
  damals als expliziter nicht-runtimewirksamer S6-Doku-Sync vorgemerkt.
- Keine P0-/P1-Findings und keine offene Produktentscheidung blockieren S4R.

Exit: `PASS`. Risiken sind geschlossen oder einem konkreten S4-/S5-/S6-Check
zugeordnet; S4 Readiness Review ist der nächste Schritt.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Review | Checks | Gate |
| --- | --- | --- | --- | --- |
| S4.1 | Versioniertes Katalog-/Semantikartefakt anlegen | Consumer | 78 Entries, Version, Modi, Policies, Lastvergleichbarkeit und Tags | none |
| S4.2 | Reine Validierungs- und Normalisierungsfunktionen | Consumer | Fehlercodes/-pfade, Cross-Field-Regeln, Kollisionen und Normalisierung | none |
| S4.3 | Deterministische Such- und Rankingfunktion | Full | Ranking-, No-Match- und Tiebreak-Matrix | none |
| S4.4 | Lokale Contract-Tests, Fixtures und Browser-Harness | Full | T-ACT-R1-01 bis T-ACT-R1-05 | none |

<!-- markdownlint-enable MD013 -->

- Reihenfolge:
  - `S4.1 -> S4.2 -> S4.3 -> S4.4`
- Evidence:
  - `nicht erforderlich`
- Scope-Freeze:
  - `Vorbedingung PASS: F-ACT-R1-07 geschlossen`
- Owner-Gates:
  - `keine innerhalb S4`
- Empfohlene Ausführungsblöcke:
  - `FREIGEGEBEN: S4.1-S4.3 gemeinsam; gleiche isolierte Datei, reine
    Funktionen, keine Zwischen-Gates oder externe Wirkung`
  - `S4.4 separat als unabhängiger Test- und Harnessblock`
- Invalidation Map:
  - `Katalogänderung -> alle Katalog- und Suchtests`
  - `Normalisierung/Ranking -> alle Suchtests`
  - `Exportform/Global API -> Syntax- und Ladevertrag`

### S4R-Entscheidung

- Scope-Freeze `PASS`: Activity V1 und alle bestehenden Consumer bleiben
  unverändert; Datenmodell, Lifecycle, Cleanup, Secrets, Deploy und externe
  Automation sind nicht betroffen.
- Produktvertrag `PASS`: Baseline, Keys, Felder, Variantenregel,
  Selection-Handoff und Nicht-Scope sind freigegeben.
- Implementierbarkeit `PASS`: Dateipfade, klassische IIFE, Namespace,
  öffentliche API, Fehlervertrag und Mutationsschutz sind vollständig.
- Testbarkeit `PASS`: Node-Bordmittel und isoliertes Browser-Harness decken
  Katalog, Fehlerfixtures, Suche, Namespace und produktive Isolation ab.
- Rollback `PASS`: ausschließlich neue isolierte V2-Dateien; keine Daten-,
  SQL-, Script-Reihenfolge- oder Deploywirkung.
- Findings `PASS`: keine offenen P0/P1; F-ACT-R1-24 blieb bis S6 der
  verpflichtende Doku-Sync.

Gate: `GREEN`. Der freigegebene Batch S4.1-S4.3 ist PASS; S4.4 folgt separat.

## S4 - Umsetzung

### S4.1 - Katalog- und Semantikartefakt

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R1-02 bis D-ACT-R1-31 und freigegebener S2 Baseline Contract`
- Umsetzung:
  - `versioniertes, klassisch im Browser ladbares Datenartefakt mit stabilen
    Keys, Labels, Aliases, Tracking-Modi, Lastvergleichbarkeit,
    Felddefinitionen und freigegebenen Muskelgruppen-/Sport-Tags`
- Review:
  - `Consumer`
- Gate:
  - `none`

Ergebnis: `PASS`. 78/78 Baseline-Entries, Version, Taxonomien, Felddefinitionen
und `device_relative`-Grenzen stimmen exakt; Activity V1 bleibt unberührt.

### S4.2 - Validierung und Normalisierung

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `S2 Schema- und Key-Vertrag`
- Umsetzung:
  - `reine Funktionen für Katalogvalidierung und Suchtextnormalisierung;
    Katalog- und Suchausgaben dürfen weder den Katalog noch verschachtelte
    Katalogwerte mutierbar nach außen geben`
- Review:
  - `Consumer`
- Gate:
  - `none`

Ergebnis: `PASS`. Geschlossene Taxonomien, Cross-Field-Regeln, neun stabile
Fehlercodes/-pfade, Kollisionsschutz, Unicode-Normalisierung und Freeze stehen.

### S4.3 - Deterministische lokale Suche

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `S2 Rankingvertrag`
- Umsetzung:
  - `lokale Suche mit exaktem Match, Alias, Präfix, Tokens und stabilem
    Codepoint-/Key-Tiebreak; keine Netzwerkabfrage`
- Review:
  - `Full`
- Gate:
  - `none`

Ergebnis: `PASS`. 565 Oracle-Abfragen bestätigen exakte, Alias-, Präfix-,
Mehrtoken-, Limit-, No-Match- und ASCII-Tiebreak-Reihenfolge.

### S4.4 - Contract-Tests

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `S2/S3 und alle R1-Invarianten`
- Umsetzung:
  - `schlanke Node-kompatible Tests sowie isoliertes klassisches
    Browser-Lade-Harness ohne neuen Paketmanager`
- Review:
  - `Full`
- Gate:
  - `none`

Ergebnis: `PASS`. Node-Contract-Suite 10/10; klassisches Browser-Harness 7/7
bei leerer Konsole. Keine produktive Script- oder Activity-V1-Wirkung.

## S5 - Contract-Tests und Abschlussreview

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check | Status | Invalidiert durch |
| --- | --- | --- | --- | --- |
| T-ACT-R1-01 | static | `git diff --check` und JS-Syntax aller R1-Dateien | PASS | jede R1-Datei |
| T-ACT-R1-02 | local-runtime | vollständige Baseline validiert alle freigegebenen Keys, Taxonomien, Feldpolicies, Aliase und Kollisionen fehlerfrei | PASS | Katalog/Validator |
| T-ACT-R1-03 | local-runtime | Suchmatrix inklusive `bice... -> biceps_curl`, Alias, Umlaut, Präfix, Mehrtoken, Empty-Query, No-Match, Limit und Tiebreak | PASS | Normalisierung/Suche/Katalog |
| T-ACT-R1-04 | local-runtime | Guard: kein Supabase-/Activity-V1-Aufruf und keine produktive Script-Integration aus R1 | PASS | R1-Runtime-Dateien |
| T-ACT-R1-05 | browser | isolierte klassische Script-Ladung im lokalen Test-Harness ohne Console-, Namespace- oder Ladefehler | PASS | Katalog-/API-/Harness-Dateien |

<!-- markdownlint-enable MD013 -->

Deterministisch:

1. T-ACT-R1-01 bis T-ACT-R1-04 ausführen.
2. T-ACT-R1-05 über ein isoliertes lokales Browser-Harness ausführen. Keine
   R1-Datei wird in dieser Roadmap in die produktive `index.html`-
   Script-Reihenfolge aufgenommen.
3. Full Code- und Contract Review gegen Zielvertrag und Nicht-Scope.
4. Einmaligen CodeRabbit-Review nach lokaler Fertigstellung bewerten, falls
   der Owner ihn anstößt.
5. Nur invalidierte Checks nach Finding-Korrekturen wiederholen.
6. Commitbereitschaft oder Blocker dokumentieren.

### S5 Full Contract Review

Katalog, API, Validator, Normalisierung, Ranking, Freeze, Namespace, Browser-
Ladung und Nicht-Scope sind `PASS`. Keine offenen P0/P1; F-ACT-R1-24 wurde in
S6 geschlossen. Activity V1 ist unverändert.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / Medium`.

Ergebnis: `PASS`.

- Source-of-Truth-Sync: Masterplan, Activity Module Overview und HCR-017/-018
  beschreiben denselben bewiesenen R1-Vertrag; F-ACT-R1-24 ist geschlossen.
- Finaler Review: keine offenen P0/P1, keine produktive V1-, Supabase-,
  Script-, Daten- oder Deploywirkung.
- Changelog-Relevanz: nicht bemerkenswert; R1 ist ein internes, noch nicht
  aktiviertes Fundament ohne aktuellen Nutzer- oder Betriebswert.
- R2-Eingang: stabile generische Keys, vollständige Messpolicies,
  `load_comparability`, Katalog-API und lokale Suche; kein vorweggenommenes
  Tabellen-, SQL-, Commit- oder UI-Design.
- Owner Recap: Key ist die Historienidentität, Label die Anzeige, Alias nur
  Suchweg und Tracking-Modus plus Feldpolicy der Messvertrag.
- Archiv:
  `docs/archive/MIDAS Activity V2 R1 Semantics and Product Contract Roadmap (DONE).md`
- Commit-Empfehlung: R1-Artefakte und gezielte Activity-Doku gemeinsam
  reviewen und committen; fremde Template-Änderungen nicht einschließen.

Exit: `PASS`. R1-Dokumentation und Repo beschreiben denselben bewiesenen
Vertrag; R2 kann als eigene Rolling-Wave-Roadmap erstellt werden.

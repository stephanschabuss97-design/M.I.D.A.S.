# MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap (DONE)

Kompakter projektspezifischer Arbeitsvertrag. Die allgemeine Arbeitsweise
steht in `docs/templates/MIDAS Roadmap Workflow Contract.md`.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Activity V2 - gemeinsamer In-Memory-Session-Draft und isolierte Vollflächen-Shell` |
| Owner / Kontext | `Stephan; persönliche MIDAS-Single-User-App` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-07-31` |
| Letzter Stand | `2026-08-01, S1-S6 PASS; R3 dokumentiert, final geprüft und archiviert` |
| Aktueller Schritt | `abgeschlossen; C2 ist der nächste Rolling-Wave-Schritt vor R4` |
| Risikoklasse | `R2` |
| Standard-Reviewtiefe | `Consumer` |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `keine; Erstellung und initialer Contract Review erfolgten gemäß Template mit Extra High` |
| Owner-Erklärmodus | `Briefing` |
| Betroffene Hauptdateien | `app/modules/vitals-stack/activity/v2/session-draft.js`, `session-shell.js`, `session-shell.css`, isolierter Harness und Contract-Tests` |
| Deploy relevant | `nein` |
| Produktive Schreibwirkung | `nein` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `nicht erforderlich; ausschließlich isolierte lokale JS-/CSS-/Harness-Wirkung` |
| Gekoppelte Roadmaps | `R1 und R2 DONE; nach R3 folgt C2 zwingend vor R4; R7 implementiert Recovery und R8 beweist sie intern auf Android-PWA` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `Activity V2 R3 deterministisch bis zum isolierten Browsernachweis
    umsetzen. Keine produktive Verdrahtung, keine echte Trainingsspeicherung.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High für den gesamten Ausführungs-Chat`
- Begründete Reasoning-Ausnahmen:
  - `keine; bei unerwartetem Vertragswiderspruch stoppen statt still die Stufe
    oder den Scope zu wechseln`
- Kontextübergabe aus dem Denkraum:
  - `PASS: R1 und R2 sind DONE. Vollflächen-Shell, In-Memory-Grenze,
    Timerstart beim ersten Item, normaler App-/Tab-Wechsel, temporärer
    Katalog-v1-Picker und Close-/Discard-Guard sind vom Owner freigegeben.`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  5. `docs/Future trainingsmodule update thoughts.md`, gezielt Abschnitte
     `1-7`, `13`, `16-20` und `22`
  6. `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
  7. `docs/modules/Activity Module Overview.md`
  8. `docs/archive/MIDAS Activity V2 R1 Semantics and Product Contract
     Roadmap (DONE).md`, nur Resume Card, Zielvertrag und S6`
  9. `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API
     Roadmap (DONE).md`, nur Resume Card, Zielvertrag, D-ACT-R2-06/-07/-08/
     -09/-11/-12/-13 und S6`
  10. `docs/qa/health-capture-reports.md`, HCR-017 bis HCR-019`
  11. `app/modules/vitals-stack/activity/v2/semantics.js` und zugehörige
      Contract-Tests; `data-access.js` nur zur Namespace-/Isolationsprüfung`
  12. `index.html`, Activity-V1-Einstieg und das Vollflächenmuster von
      `app/modules/doctor-stack/charts/`, nur relevante Ausschnitte`
  13. `git status --short und nur der relevante Diff`
- Startschritt:
  - `S1 - System- und Vertragsdetektivarbeit`
- Erlaubte Autonomie:
  - `lokale Reads und Edits im R3-Scope, Node-Contract-Tests, temporärer
    Live-Server und disposable Playwright-Smokes`
- Owner-Gates:
  - `S5 manueller Browser-/Background-Smoke; kein Deploy- oder SQL-Gate`
- Stop-Bedingungen:
  - `Produktload in index.html, Supabase-/R2-RPC-Aufruf, IndexedDB-Einbau,
    Activity-V1-Änderung, echte Suche, Eingabeeditor oder unklarer
    Lifecycle-Vertrag`
- Halluzinationsschutz:
  - `Keine neue Semantik, Katalogeinträge, Messfelder oder Persistenz erfinden.
    R1/R2 und der reale Code sind Sources of Truth; Widersprüche werden Findings.`
- Startprompt:

```text
Arbeite die MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap
gemäß ihrer Ausführungs-Chat-Startkarte ab. Lies nur die festgelegten Quellen
und relevanten Ausschnitte, prüfe Git- und Systemstand und beginne mit S1.
R3 bleibt vollständig isoliert: kein Produktload, kein Supabase-Zugriff, keine
IndexedDB-Recovery und keine Activity-V1-Änderung. Fehlende Fakten nicht
erfinden, sondern als Finding behandeln.
```

## Session Resume Card

- Ziel:
  - `Stabilen In-Memory-Draft und responsive Vollflächen-Shell als isolierte
    Grundlage für R4-R8 beweisen.`
- Unveränderliche Verträge:
  - `R1-Katalog ist Source of Truth; R2 bleibt unberührt; Activity V1 bleibt
    sichtbar und produktiv; kein Product-Scriptload, Netzwerk, Storage oder Save;
    R3 hält die spätere R2-request_id stabil.`
- Erledigter Stand:
  - `R1 DONE: Katalog v1, 78 aktive Entries, Semantik und Suche bewiesen`
  - `R2 DONE: Datenmodell, Commit-/Lookup-RPC und isolierte Datenzugriffsschicht
    produktiv vorhanden; V2-Historie leer`
  - `R3-Owner-Entscheidungen im Masterplan synchronisiert`
  - `Initialer und roadmap-übergreifender R3 Contract Review PASS; R2-Handoff,
    C2-Reihenfolge und R7/R8-Recovery-Grenze korrigiert`
  - `S1 PASS: reale Namespace-, API-, Produktisolations-, Vollflächen-,
    Fokus-, Escape-, Responsive-, Lifecycle- und Toolingmuster belegt`
  - `S2 PASS: Draftschema, Factory-/Shell-APIs, stabile Fehler, Timer,
    Backgrounding, Discard, Fokus und Responsive-Vertrag exakt eingefroren`
  - `S3 PASS: Lifecycle-/Datenverlust-Risiken, transaktionales Cleanup,
    Consumer-Validierung, Fokusnachführung, S4-Schnitt und Tests finalisiert`
  - `S4R PASS: vollständige Datei-/Check-Zuordnung, Scope-Freeze und sichere
    Batchgrenzen bestätigt; T-ACT-R3-08 bleibt ausschließlich S5 owner-gated`
  - `S4.1 PASS: pure Draft-v1-Factory, atomare Mutationen, immutable State-/Timer-
    Snapshots, dynamischer R1-Katalog und 32/32 gemeinsame Contract-Tests`
  - `S4.2-S4.3 PASS: Vollflächen-Shell, Picker, Items, Notiz, Fokus und
    transaktionales Open mit 44/44-Suite und T-ACT-R3-07 in Edge bewiesen`
  - `S4.4-S5 PASS: Timer, Discard-Guard, Cleanup und Harness mit 50/50-Suite,
    Edge-T-07 sowie owner-freigegebenem 32-s-Background-Smoke bewiesen`
  - `S6 PASS: Module Overview, HCR-020 und Masterplan synchronisiert; finaler
    Contract-/Diff-/Isolationscheck grün und Roadmap archiviert`
- Aktueller Schritt:
  - `R3 abgeschlossen und archiviert`
- Nächster erlaubter Schritt:
  - `C2: Catalog Version 2 Studio Vocabulary Maintenance; R4 bleibt bis zu
    dessen Katalog-v2-Gate blockiert`
- Offene Findings:
  - `F-ACT-R3-01 deferred: Reload/Android-Prozessverlust bleibt in R3 möglich;
    R7 implementiert Recovery, R8 beweist sie intern auf Android-PWA`
- Geänderte Dateien:
  - `alle sechs additiven R3-Dateien, Activity Module Overview, HCR-020,
    Activity-V2-Masterplan und diese archivierte Roadmap; bestehender übriger
    Dirty-Worktree blieb unangetastet`
- Gültige Nachweise:
  - `R1 T-ACT-R1-01 bis -05; R2 EV-/T-Nachweise laut archivierter R2-Roadmap;
    R1/R2-Contract-Suite am 2026-08-01 erneut 20/20 PASS; Node v24.18.0,
    Python/http.server 3.14.6 und globales Playwright 1.61.1 belegt; nach
    vollständige R1/R2/R3-Suite 50/50 und Full Review PASS; Edge-T-07 bei drei
    Viewports sowie T-08 mit 32.003 ms ausgewähltem Fremdtab PASS`
- Runtime-/Deploy-Stand:
  - `R1/R2 isoliert; R2 produktive Datenbasis vorhanden; R3-Draft rein lokal
    implementiert und weiterhin nicht durch index.html geladen`
- Offene Owner-Freigaben:
  - `keine für R3; T-ACT-R3-08 wurde mit diesem S5-Auftrag freigegeben`
- Stop-Bedingungen:
  - `R4 erst nach abgeschlossenem C2; keine produktive Verdrahtung oder
    vorgezogene R4-R8-Funktion`

## Zielvertrag

Prüfbares Endergebnis:

- `AppModules.activityV2.sessionDraft` stellt einen seriellen, immutable
  auslesbaren In-Memory-Draft mit stabiler clientseitiger `request_id` und
  der beim Draftstart erfassten `catalog_version` bereit.
- Der Draft kann kontrollierte Katalog-v1-Items eindeutig hinzufügen,
  entfernen und umordnen. Ein Item-Key kommt höchstens einmal vor.
- Eine isolierte responsive Vollflächen-Shell öffnet eine leere Session,
  zeigt einen einfachen Katalog-v1-Picker und die geordnete Itemliste.
- Die Uhr startet exakt beim ersten erfolgreich hinzugefügten Item. Sie wird
  aus Startzeitpunkt und aktueller Zeit berechnet, zählt normale Satzpausen
  mit und bleibt nach normalem App-/Tab-Wechsel korrekt.
- Leere Sessions schließen direkt. Ein veränderter Draft wird nur nach
  bestätigtem Verwerfen geschlossen; Abbruch der Bestätigung erhält Draft und Uhr.
- Contract-Tests und isolierter Browser-Harness beweisen State-, Timer-,
  Lifecycle-, Accessibility-, Responsive- und Isolationsverträge.
- Produktive `index.html`, Activity V1, R2-Daten/RPCs und sichtbare MIDAS-Flows
  bleiben unverändert.

Bewusst unverändert:

- Keine echte R4-Suche und kein Last-Performance-Lookup.
- Keine Kraft-, Satz-, Cardio- oder Dauereditoren aus R5/R6.
- Kein IndexedDB-Autosave oder Reload-/Prozess-Recovery aus R7.
- Kein Commit, Finish-/Save-Pfad, History, Korrektur oder Cutover aus R8.
- Kein Export, Doctor View, Trendpilot, Protein Target, Retention oder Cleanup.

## Problem und Ist-Zustand

- Beobachtung:
  - `R1 und R2 liefern Semantik und Datenbasis, aber noch keinen gemeinsamen
    lokalen Sessionzustand und keine wiederverwendbare Erfassungsoberfläche.`
- Risiko oder Reibung:
  - `Wenn UI, Timer und Draft erst gemeinsam mit Editoren oder Commit entstehen,
    vermischen sich Lifecycle-, Daten- und Eingaberisiken. Browser-Throttling
    könnte eine tickbasierte Uhr verfälschen.`
- Offene Hypothese:
  - `Die Vollflächen-Shell und der Close-/Discard-Flow sind auf Desktop und
    Mobile ergonomisch; dies wird in S5 als Owner-Smoke geprüft.`

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R3-01 | 2026-07-31 | R3 bleibt additiv, isoliert und wird nicht durch `index.html` geladen. | Activity V1 bleibt bis zum vollständigen V2-Cutover die einzige sichtbare Erfassung. | gesamter Scope |
| D-ACT-R3-02 | 2026-07-31 | Die Shell ist eine responsive Vollfläche nach dem Interaktionsmuster des bestehenden Verlaufs-Panels, aber ohne Codekopplung an den Doctor-Stack. | Im Gym wird eine ruhige Arbeitsfläche statt eines kleinen verschachtelten Dialogs benötigt. | UI/S4.2 |
| D-ACT-R3-03 | 2026-07-31 | Der Draft lebt in R3 ausschließlich im Arbeitsspeicher und ist JSON-kompatibel strukturiert. | R3 beweist State und UI; dauerhafte Recovery gehört geschlossen zu R7. | State/Lifecycle |
| D-ACT-R3-04 | 2026-07-31 | Die Uhr startet mit dem ersten erfolgreich hinzugefügten Item und wird aus `started_at` plus aktueller Zeit abgeleitet. | Hintergrund-Throttling darf keine Sessionzeit verlieren; Satzpausen zählen mit. | Timer |
| D-ACT-R3-05 | 2026-07-31 | R3 hat keinen Pausemodus, Resttimer und keine manuelle Zeitkorrektur. | Ein einfacher Sessiontimer genügt; Zusatzlogik wäre vorgezogener Scope. | Timer/Nicht-Scope |
| D-ACT-R3-06 | 2026-07-31 | Normaler App-/Tab-Wechsel darf Draft oder Uhr nicht verändern. Reload oder Android-Prozess-Reclaim darf R3 noch verlieren. | Backgrounding und dauerhafte Recovery sind unterschiedliche Browser-Lifecycle-Grenzen. | Lifecycle/R7-Gate |
| D-ACT-R3-07 | 2026-07-31 | Die temporäre Auswahl verwendet `semantics.getCatalog()` als einfachen kontrollierten Picker. R3 beweist ihn mit Katalog v1, die Implementierung darf weder Version `1` noch `78` Entries fest einbauen. | Items müssen testbar und für C2/Katalog v2 anschlussfähig sein, ohne R4-Suche vorwegzunehmen. | Picker/S4.3/C2 |
| D-ACT-R3-08 | 2026-07-31 | Der Draft hält genau eine top-level `catalog_version`; jeder Item-Key ist höchstens einmal vorhanden und besitzt eine lückenlose deterministische `item_order`. | Entspricht dem R2-Commitvertrag und verhindert doppelte Übungsblöcke oder unnötige Feldübersetzung. | State/Items/R2-Handoff |
| D-ACT-R3-09 | 2026-07-31 | Entfernen des letzten Items setzt eine bereits gestartete Uhr nicht still zurück. Nur explizites Verwerfen erzeugt wieder einen leeren Draft. | Ein versehentliches Entfernen darf den Sessionbeginn nicht umschreiben. | Timer/Discard |
| D-ACT-R3-10 | 2026-07-31 | Leere/pristine Shell schließt direkt; jeder mutierte Draft benötigt eine bestätigte Verwerfung. Escape und Close verwenden denselben Guard. | Datenverlust wird sichtbar, ohne leere Sessions unnötig zu blockieren. | UX/Lifecycle |
| D-ACT-R3-11 | 2026-07-31 | Clock, Erzeugung der stabilen R2-`request_id` und Bestätigung werden injizierbar; öffentliche Snapshots sind gegen Außenmutation geschützt. Die `request_id` bleibt über alle Draftmutationen und spätere Recovery-/Commit-Retries erhalten. | Zeit-, UUID-, Idempotenz-Handoff- und Guard-Fälle müssen deterministisch testbar sein. | API/Tests/R2-Handoff |
| D-ACT-R3-12 | 2026-07-31 | R3 zeigt keinen funktionslosen Save-/Finish-Pfad. Das spätere Speichern beendet die Uhr in R8. | Eine Schaltfläche darf nicht Persistenz vortäuschen, die R3 bewusst nicht besitzt. | UI/Nicht-Scope |
| D-ACT-R3-13 | 2026-07-31 | Echte Activity-V2-Nutzung bleibt bis zum grünen R7-Recovery-Nachweis und dem internen Android-PWA-Integrationssmoke aus R8 gesperrt; produktive Aktivierung folgt frühestens R11. | Eine einstündige Session darf später weder durch Reload noch durch Prozess-Reclaim oder fehlerhafte Produktintegration verloren gehen. | Roadmap-Gate |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing`
- Neue oder entscheidungsrelevante Konzepte:
  - `Unterschied zwischen normalem Backgrounding und Prozess-/Reload-Verlust;
    zeitstempelbasierte statt tickbasierte Uhr`
- Geplante Briefing-Gates:
  - `S2-Abnahme: finaler Draft-/Lifecycle-Vertrag; S5: praktischer
    Close-/Background-Smoke`
- Nicht erneut zu erklären:
  - `normale JS-/CSS-Implementierung, DOM-Events und Standard-Responsive-CSS`

## Scope und Grenzen

In Scope:

- Pure In-Memory-Draft-API im vorhandenen `AppModules.activityV2`-Namespace.
- Kontrolliertes Hinzufügen, Entfernen und Umordnen von Katalog-v1-Items.
- Sessionnotiz als neutrales Draftfeld; keine Item-/Satznotizen.
- Zeitstempelbasierte laufende Sessionuhr.
- Isolierte Vollflächen-Shell, Empty State, Close-/Discard-Guard und Harness.
- Node-Contract-Tests und lokale Browser-/Responsive-Smokes.

Nicht in Scope:

- Produktiver Scriptload, Navigation, Auth, Supabase, R2-RPCs oder Datenwrites.
- IndexedDB, Local Storage, Service-Worker- oder Background-Sync-Lösung.
- Suche, Historien-Lookup, Messwerte, Sets, Cardiofelder, Finish oder Save.
- Studio-Katalog v2/C2, Export, Doctor View und Legacy-Migration.

Roadmap-spezifische Guardrails:

- `session-draft.js` und `session-shell.js` dürfen weder `fetch` noch
  Supabase-, IndexedDB-, Local-Storage- oder Service-Worker-APIs verwenden.
- Der Harness ist die einzige HTML-Einbindung; `index.html` bleibt byte-logisch
  ohne R3-Script- oder Style-Referenz.
- R3 übernimmt keine Daten aus `data-access.js` und erzeugt keinen scheinbar
  commitfähigen Payload.
- UI-Texte sind deutsch, ruhig und ohne Gesundheits- oder Trainingscoaching.

## Scope-Freeze vor S4

- Bestehende Features:
  - `Activity V1, Doctor-Chart und sichtbare MIDAS-Flows vollständig erhalten`
- Datenmodell, Lifecycle und Retention:
  - `R2-Datenmodell unverändert; nur flüchtiger R3-Draft; keine Retention`
- Cleanup, Scheduler, Secrets und externe Automationen:
  - `nicht betroffen`
- Kompatible Producer und Consumer:
  - `Producer: R1 semantics.getCatalog/getEntryByKey; Consumer: nur isolierter
    R3-Harness, später R4-R8`
- Offene Grundsatzfragen:
  - `none; UX-Tauglichkeit ist ein S5-Smoke, keine S4-Architekturfrage`
- Umgang mit späterem Scope-Wechsel:
  - `gezielte S2/S3/S4R-Korrektur oder zuständige Folge-Roadmap; keine stille
    Vorziehung von R4-R8`

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/Future trainingsmodule update thoughts.md`, nur die in der Startkarte
  genannten Abschnitte
- `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
- `docs/modules/Activity Module Overview.md`
- `docs/qa/health-capture-reports.md`, HCR-017 bis HCR-019
- `app/modules/vitals-stack/activity/v2/semantics.js`
- `app/modules/vitals-stack/activity/v2/semantics.contract.test.js`
- `app/modules/vitals-stack/activity/v2/data-access.js`, nur API-/Namespace-Grenze
- `index.html` und Vollflächenmuster unter `app/modules/doctor-stack/charts/`

Nur bei konkreter Vertragsfrage:

- Archivierte R1-/R2-Roadmaps gemäß Startkarte.
- R2-Evidence nur bei einem behaupteten Runtime- oder Datenbankwiderspruch.
- Activity-V1-Code nur zur expliziten Nichtänderungsprüfung.

## Tool Permissions und Gates

Allowed:

- Lokale Reads und gezielte Edits in R3-Dateien und dieser Roadmap.
- `node --test` für Activity-V2-Contract-Tests.
- Syntax-, `git diff --check`- und gezielte statische Isolationsprüfungen.
- Temporärer Live Server und disposable Playwright-Browserchecks ohne
  Repo-Abhängigkeiten oder produktive Daten.

User-gated:

- Manueller S5-Smoke für Vollfläche, Close-/Discard-Komfort und echten
  Browser-Tab-Wechsel.

Forbidden:

- Secrets ausgeben oder committen.
- Fremde Worktree-Änderungen zurücksetzen.
- Scope, Datenwirkung oder Architektur still erweitern.
- Produktives SQL, Deploy, Supabase-Aufruf oder Änderung an `index.html`.
- Recovery durch Local Storage als scheinbar einfache Ersatzlösung vorziehen.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `High` | PASS | `Reale API-/Namespace-, UI-/Lifecycle-, Tooling- und 20/20-Testbaseline widerspruchsfrei belegt.` |
| S2 | Draft-, Timer- und UI-Zielvertrag | `High` | PASS | `Factory-, Schema-, Fehler-, Timer-, Shell-, Close-, A11y- und Responsive-Vertrag vollständig eingefroren.` |
| S3 | Lifecycle-, Datenverlust- und Umsetzungsreview | `High` | PASS | `Risiken, transaktionales Cleanup, Consumer-/Fokusvertrag, S4-Schnitt und T-01 bis -09 finalisiert.` |
| S4R | S4 Readiness Review | `High` | PASS | `Scope-Freeze, Datei-/Testzuordnung, Owner-Gates und drei sichere S4-Ausführungsblöcke bestätigt.` |
| S4 | Umsetzung | `High je freigegebenem Block` | PASS | `S4.1 bis S4.5 vollständig implementiert und lokal/in Edge bewiesen.` |
| S5 | Contract-, Browser- und Abschlusschecks | `High` | PASS | `T-01 bis -09 grün; T-08 owner-freigegeben in Edge bestanden.` |
| S6 | Doku-Sync, Commit und Archiv | `High` | TODO | |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R3-01 | `Watchlist` | `Contract/Lifecycle` | `deferred` | `Reload und Android-Prozess-Reclaim können den R3-Draft verlieren. R7 implementiert Recovery; R8 besitzt den internen Android-PWA-Nachweis. D-ACT-R3-13 blockiert reale Nutzung.` |
| F-ACT-R3-02 | `P1` | `Contract/R2-Handoff` | `fixed` | `Der Draft verwendet die von R2 geforderte stabile request_id statt einer separaten lokalen Session-ID; D-ACT-R3-11 und S2.` |
| F-ACT-R3-03 | `P1` | `Contract/Data` | `fixed` | `catalog_version liegt top-level und die Itemreihenfolge heißt item_order; D-ACT-R3-08 und S2.` |
| F-ACT-R3-04 | `P2` | `Contract/Roadmap` | `fixed` | `C2 ist nach R3 und zwingend vor R4 als nächster Handoff eingetragen; Metadaten und S6.` |
| F-ACT-R3-05 | `P1` | `Contract/Lifecycle` | `fixed` | `R7 implementiert isolierte Recovery, R8 beweist die Android-PWA-Integration; D-ACT-R3-13.` |
| F-ACT-R3-06 | `P2` | `Contract/Forward Compatibility` | `fixed` | `R3 testet Katalog v1, hardcodiert aber weder Version noch Entry-Anzahl; D-ACT-R3-07.` |
| F-ACT-R3-07 | `P2` | `Contract/Identity` | `fixed` | `Der S2-Entwurf sprach beim Discard noch von einer neuen lokalen ID. S2 verwendet ausschließlich eine neue R2-request_id; eine zweite Session-ID existiert nicht.` |
| F-ACT-R3-08 | `P1` | `Lifecycle/Atomicity` | `fixed` | `Mount/Open dürfen nach Render-, Fokus- oder Listenerfehlern keinen halboffenen Dialog, inerten Untergrund oder Scroll-Lock hinterlassen; S3 verlangt transaktionales Rollback.` |
| F-ACT-R3-09 | `P1` | `Contract/Consumer` | `fixed` | `Die Shell prüft nicht nur Draftmethoden, sondern jeden konsumierten Snapshot samt Katalogreferenzen vor DOM-Patch oder Lifecycle-Wirkung; stabiler Fehler INVALID_DRAFT_STATE.` |
| F-ACT-R3-10 | `P2` | `Accessibility/Focus` | `fixed` | `Nach Add/Move/Remove wird Fokus deterministisch auf Picker, dieselbe Aktion am verschobenen Item oder den nächsten sinnvollen Eintrag geführt.` |
| F-ACT-R3-11 | `P2` | `QA/Invalidation` | `fixed` | `Draft- und Semantikänderungen invalidieren zusätzlich Shell-, Browser-, Background- und Isolationschecks; S3 korrigiert T-01 bis -09 und die Invalidation Map.` |
| F-ACT-R3-12 | `P2` | `Readiness/File Mapping` | `fixed` | `S4.2 nennt nun session-shell.contract.test.js ausdrücklich; jeder geplante R3-Produkt- und Testpfad besitzt genau einen ersten Ausführungsblock.` |
| F-ACT-R3-13 | `P1` | `Readiness/Owner Gate` | `fixed` | `Der owner-gated T-ACT-R3-08 ist kein S4-Abschlusscheck. S4.4/S4.5 beweisen Lifecycle lokal; der praktische Background-Smoke bleibt ausschließlich S5 vorbehalten.` |
| F-ACT-R3-14 | `P2` | `Implementation/Immutability` | `fixed` | `Der erste S4.1-Stand fror Controller und API nur flach ein. Der Full Review stellte auf deepFreeze um und beweist nun auch alle Methoden und Funktionsobjekte als tief eingefroren.` |
| F-ACT-R3-15 | `P2` | `Implementation/Error Contract` | `fixed` | `Eine gültige Draftform mit abweichender Katalogversion liefert nun spezifisch CATALOG_VERSION_MISMATCH statt INVALID_DRAFT_STATE; Consumer-Test ergänzt.` |
| F-ACT-R3-16 | `P1` | `QA/Browser` | `fixed` | `Edge-Backend verbunden und Harness auf sauberem Port ohne Service-Worker-Interception geprüft; T-ACT-R3-07 bei 1440x900, 390x844 und 320x800 PASS.` |
| F-ACT-R3-17 | `P2` | `Implementation/Timer Validation` | `fixed` | `Der Shell-Consumer validiert nun, dass Timerlabel und elapsed_ms exakt übereinstimmen; inkonsistente Timer-Snapshots scheitern vor dem DOM-Patch mit INVALID_DRAFT_STATE.` |
| F-ACT-R3-18 | `P1` | `Implementation/Browser Scheduler` | `fixed` | `Der echte Edge-Smoke deckte verlorenen Browser-Kontext nativer Timerfunktionen auf. Default-setInterval/clearInterval sind nun an window gebunden und durch Receiver-Regression plus Live-Timer bewiesen.` |

<!-- markdownlint-enable MD013 -->

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Status: `PASS`.

Deterministisch abgeschlossen: Pflichtreferenzen, Git-/Systemstand,
R1-/R2-Namespace und APIs, Katalogform, V1-/Produkt-Negativgrenze,
Vollflächen-/Fokus-/Lifecycle-Muster, Toolchain, gemeinsame 20/20-Baseline,
Systemkarte und Full Contract Review. S1 änderte nur diese Roadmap; Doku-Sync
bleibt S6 vorbehalten.

### S1-Ergebnis

#### Systemkarte und Negativgrenzen

<!-- markdownlint-disable MD013 -->

| Schicht | Belegter Ist-Vertrag | R3-Grenze |
| --- | --- | --- |
| R1-Semantik | `semantics.js` lädt als klassische IIFE und registriert einen nicht schreib-/konfigurierbaren, tief eingefrorenen `AppModules.activityV2.semantics`-Slot. | ausschließlicher Katalog-Producer; nicht kopieren oder umdeuten |
| Katalog-API | `getCatalog()` liefert `midas.activity-catalog.v1`, die aktuelle `catalog_version` und die tief eingefrorene Entry-Liste; real sind es 78 aktive Entries. `getEntryByKey(string)` liefert den exakten eingefrorenen Entry oder `null` und wirft bei Nicht-String `TypeError`. | Katalogversion und Anzahl nur konsumieren, nie `1` oder `78` fest einbauen |
| R2-Datenzugriff | `data-access.js` registriert klassisch den eingefrorenen Slot `AppModules.activityV2.dataAccess` mit `commitSession` und `loadLastPerformance`. | weder laden noch aufrufen; kein commitfähiger Payload, Netzwerk oder Supabase-Zugriff |
| R3-State/UI | Noch keine R3-Dateien vorhanden; der vorhandene `activityV2`-Container bleibt absichtlich erweiterbar. | additive Slots `sessionDraft` und `sessionShell`; Consumer nur isolierter Harness |
| Activity V1 | `index.html` lädt `app/modules/vitals-stack/activity/index.js`; dieses registriert `AppModules.activity` mit `loadActivities`, `addActivity`, `deleteActivity` und dem bestehenden RPC-Pfad. | Datei, UI, API und sichtbarer Produktflow unverändert |
| Produktload | `index.html` enthält keine Referenz auf `activity/v2`, `activityV2`, `semantics.js` oder `data-access.js`; relevanter tracked Diff für `index.html` und Activity V1 ist leer. | keine R3-Script-/Style-Referenz und kein Feature-Cutover |
| Vollflächenmuster | Das Verlaufs-Panel kombiniert `role=dialog`, `aria-modal`, `hidden`, `aria-hidden` und `inert` mit `position: fixed`, `inset: 0`, `100vw`, `100vh`/`100dvh`, scrollbarem Content und Body-Scroll-Lock. | Interaktionsmuster übernehmen, keine Doctor-Stack-Codekopplung |
| Fokus und Close | `chartPanel.show/hide` schaltet Hidden/Inert/ARIA und nutzt den gemeinsamen Focus Trap; dieser fokussiert den ersten Fokuspunkt, hält Tab im Dialog, setzt den Untergrund inert und stellt den vorherigen Fokus wieder her. Close-Button und globales Escape laufen beide auf `hide()`. | Shell besitzt einen gemeinsamen Close-/Discard-Guard vor derselben Schließoperation |
| Responsive | Chart-CSS besitzt eigene Breakpoints für `641-900px` und `<=640px`, volle Breite, gestapelte Controls, flexible KPIs und viewportbegrenzte Tooltips. | R3-CSS eigenständig und harnessbezogen; keine Chart-Selektoren wiederverwenden |
| Lifecycle/Timer | Vorhandene `visibilitychange`-Handler reagieren erst bei `visible`. Der Atemtimer berechnet Anzeigezustand aus `currentNow - startedAt` und nutzt RAF/Timeout nur als Scheduler, verwendet aber `performance.now()`. | nur Derived-Time-/Scheduler-Idee und sichtbaren Repaint übernehmen; R3 benötigt injizierte epochbasierte Clock, keine Produkt-Resume-Side-Effects |

<!-- markdownlint-enable MD013 -->

#### Tooling- und Baseline-Nachweis

- `node v24.18.0`; gemeinsame R1-/R2-Suite am `2026-08-01`: `20/20 PASS`,
  `0 fail`.
- `python 3.14.6`; `python -m http.server --help` bestätigt den dokumentierten
  dependency-freien lokalen Serverpfad.
- Globales `playwright 1.61.1`; `require('playwright')`, headless Chromium,
  Seitenerzeugung und DOM-Read liefen erfolgreich. Keine Repo-Dependency wurde
  angelegt.
- Reale Semantikprobe: API-Keys exakt wie dokumentiert, `catalog_version: 1`,
  `78` Entries, API/Katalog/Entry-Liste eingefroren, Lookup
  `biceps_curl -> biceps_curl`, unbekannter Key `-> null`.
- Ausgangsmarker für die spätere Isolationsprüfung: SHA-256 von
  `index.html` ist
  `6CF9CF4E6E1C4C4E7722C568A590541C529D85E2E7DDE483CAC83F8A1BC3E30B`;
  Activity-V1-`index.js` ist
  `F3A4EFF3248F2CE3778EC1B99BF902BAE58C69892A64864363767D70C944D8D8`.

#### S1 Full Contract Review

- `PASS`: Startkarte, Masterplan, R1/R2-Handoffs, Modul-Overview, QA und realer
  Code beschreiben dieselbe additive und produktisolierte R3-Grenze.
- Der bestehende Dirty Worktree enthält uncommittete R1-/R2-, SQL-, QA- und
  Template-Artefakte. S1 hat davon nichts umgeschrieben und ausschließlich
  diese R3-Roadmap aktualisiert.
- Keine neue Grundsatzfrage, kein In-Scope-P0/P1 und kein Source-of-Truth-
  Widerspruch wurde gefunden; F-ACT-R3-01 bleibt als ausdrückliches R7-/R8-
  Gate deferred.
- Der vorhandene Atemtimer ist kein direkt kopierbarer Sessiontimer: geeignet
  sind nur abgeleitete Anzeige und schedulerunabhängige Berechnung; die
  epochbasierte, injizierbare R3-Zeitquelle wird in S2 exakt festgelegt.
- S2 darf beginnen; Produktcode bleibt bis zum grünen S4R unverändert.

Exit: API-, Namespace-, UI- und Isolationsgrenzen sind aus realem Code belegt.

## S2 - Draft-, Timer- und UI-Zielvertrag

Reasoning: `GPT-5.6 Sol / High`.

Status: `PASS`.

Deterministisch abgeschlossen: factory-basierter lokaler Draft und isoliert
mountbare Shell mit exakten APIs, Schema, Fehlern, Atomarität, Timer,
Backgrounding, Picker, Discard, Fokus, Accessibility und Responsive-Vertrag.
`D-ACT-R3-01` bis `-13` sind Pflicht; Storage, Netzwerk, Save, Suche und
Produktload bleiben ausgeschlossen; Doku-Sync folgt in S6.

### S2.1 - Namespace und Session-Draft-API

`session-draft.js` bleibt ein klassisches Script und registriert genau den
nicht schreib- und nicht konfigurierbaren, eingefrorenen Slot
`AppModules.activityV2.sessionDraft`. `AppModules` und `activityV2` selbst
bleiben erweiterbar. Eine Doppelregistrierung oder ein ungültiger Namespace
scheitert wie bei R1/R2 fail-closed.

<!-- markdownlint-disable MD013 -->

| API | Eingabe | Rückgabe / Wirkung |
| --- | --- | --- |
| `sessionDraft.create(options?)` | Exakt `semantics`, `now`, `createRequestId`; unbekannte Optionen sind ungültig. `semantics` fällt auf `AppModules.activityV2.semantics`, `now` auf `Date.now` und `createRequestId` auf `crypto.randomUUID` zurück. | Neuer eingefrorener Controller; erzeugt sofort eine valide, kleingeschriebene `request_id` und erfasst die aktuelle positive `catalog_version`. Noch keine Startzeit. |
| `controller.getSnapshot()` | keine | Aktueller tief eingefrorener JSON-kompatibler Snapshot; dieselbe Referenz bis zur nächsten echten Mutation. |
| `controller.getTimerSnapshot()` | keine | Tief eingefroren `{ running, elapsed_ms, label }`; reine Ableitung ohne Revision oder Draftmutation. |
| `controller.addItem(itemKey)` | exakter kanonischer String-Key | Fügt einen aktiven, noch nicht enthaltenen Entry am Ende hinzu; erster erfolgreicher Add setzt `started_at`; gibt neuen Snapshot zurück. |
| `controller.removeItem(itemKey)` | Key eines enthaltenen Items | Entfernt das Item, nummeriert `item_order` lückenlos neu und erhält eine einmal gesetzte Startzeit. |
| `controller.moveItem(itemKey, targetOrder)` | enthaltener Key und 1-basierte ganzzahlige Zielposition | Verschiebt atomar und nummeriert lückenlos; gleiche Position ist ein No-op. |
| `controller.setNote(value)` | String, nach `trim()` leer oder höchstens 500 Unicode-Codepoints | Speichert `null` oder normalisierten Text; gleicher normalisierter Wert ist ein No-op. |
| `controller.discard()` | keine | Erzeugt im selben Controller atomar einen neuen pristine Draft mit neuer `request_id`, neu erfasster aktueller `catalog_version`, `revision: 0`, `started_at: null`, `note: null` und leerer Itemliste. |

<!-- markdownlint-enable MD013 -->

Alle echten erfolgreichen Mutationen außer `discard()` erhöhen `revision`
exakt um eins. No-ops erhöhen sie nicht. `discard()` beginnt definitionsgemäß
einen neuen Draft bei Revision null. Controller und öffentliche Snapshots sind
tief eingefroren; jede Mutation konstruiert erst einen vollständigen gültigen
Folgezustand und tauscht ihn danach atomar aus.

### S2.2 - Draftschema und R2-Handoff

```json
{
  "draft_schema_version": "midas.activity-session-draft.v1",
  "request_id": "00000000-0000-4000-8000-000000000000",
  "catalog_version": 1,
  "revision": 0,
  "started_at": null,
  "note": null,
  "items": []
}
```

- `request_id` ist eine syntaktisch valide UUID und die einzige Draft-/Retry-
  Identität. Sie bleibt über alle Mutationen stabil und wird erst bei
  `discard()` ersetzt. Eine separate lokale Session-ID existiert nicht.
- `catalog_version` wird aus `semantics.getCatalog()` erfasst und nie aus
  Versionsnummer oder Entry-Anzahl abgeleitet. Tests dürfen Version 1 und 78
  Entries beweisen; Runtime-Code darf beides nicht fest einbauen.
- `started_at` ist vor dem ersten erfolgreichen Add `null`. Danach ist es der
  UTC-ISO-String mit Millisekunden aus der injizierten epochbasierten Clock und
  bleibt bis zum Discard unverändert.
- Jedes Item besitzt exakt `item_key` und die lückenlose 1-basierte
  `item_order`. Ein Key kommt höchstens einmal vor; maximal 50 Items entsprechen
  der belegten R2-Commitgrenze.
- R3 enthält weder `schema_version` des Commit-Payloads noch `ended_at`,
  `duration_min`, Titel, Messwerte oder Sets. Der Draft ist dadurch bewusst
  noch kein scheinbar commitfähiger R2-Payload.
- Die Sessionnotiz ist `null` oder ein normalisierter String bis 500
  Codepoints. Item- oder Satznotizen gehören nicht zu R3.

### S2.3 - Stabile Draftfehler und Atomarität

Draftfehler tragen `name: ActivityV2SessionDraftError`, einen stabilen `code`
und eine sichere generische Nachricht. Keine Fehlermeldung enthält Katalog-,
DOM- oder Backendinterna.

<!-- markdownlint-disable MD013 -->

| Code | Bedingung |
| --- | --- |
| `INVALID_OPTIONS` | Optionswert ist kein Record oder enthält unbekannte Felder. |
| `SEMANTICS_MISSING` | Semantik-API oder benötigte Katalogmethoden fehlen. |
| `INVALID_CATALOG` | Katalog, positive `catalog_version` oder Entryliste sind ungültig. |
| `REQUEST_ID_UNAVAILABLE` | Es gibt ohne Injection kein sicheres `crypto.randomUUID`. |
| `INVALID_REQUEST_ID` | Die injizierte ID-Quelle wirft oder liefert keine UUID. |
| `INVALID_CLOCK` | `now()` wirft oder liefert keinen endlichen, als Datum darstellbaren Epoch-Millisekundenwert. |
| `INVALID_ITEM_KEY` | Key ist kein syntaktisch gültiger String-Key. |
| `UNKNOWN_ITEM_KEY` | `getEntryByKey()` liefert keinen Entry. |
| `INACTIVE_ITEM_KEY` | Der gefundene Entry ist nicht `active`. |
| `DUPLICATE_ITEM` | Der Key ist bereits im Draft enthalten. |
| `ITEM_LIMIT_REACHED` | Ein Add würde die belegte Grenze von 50 Items überschreiten. |
| `ITEM_NOT_FOUND` | Remove oder Move adressiert keinen enthaltenen Key. |
| `INVALID_ITEM_ORDER` | Zielposition ist nicht ganzzahlig oder außerhalb `1..items.length`. |
| `INVALID_NOTE` | Notiz ist kein String oder überschreitet 500 Codepoints. |
| `REVISION_LIMIT_REACHED` | Eine weitere Mutation würde `Number.MAX_SAFE_INTEGER` überschreiten. |

<!-- markdownlint-enable MD013 -->

Vor jedem Fehler werden Key, Entry, Duplikat, Limit, Ziel, Clock/ID und
Folgezustand vollständig validiert. Fehler verändern weder Snapshotreferenz,
Revision, Reihenfolge, `request_id` noch `started_at`. Schlägt die neue ID-
oder Katalogerfassung beim Discard fehl, bleibt der alte Draft vollständig
erhalten.

### S2.4 - Timer- und Backgroundvertrag

- `getTimerSnapshot()` liefert vor dem Start
  `{ running: false, elapsed_ms: 0, label: "00:00" }`.
- Nach Start gilt bei jedem Read ausschließlich
  `elapsed_ms = floor(max(0, now() - Date.parse(started_at)))`. Intervalle und
  Visibility-Events sind nur Repaint-Trigger und niemals Zeitquelle.
- Das Label verwendet ganze abgelaufene Sekunden: unter einer Stunde
  `MM:SS`, ab einer Stunde `HH:MM:SS`; Stunden dürfen über 24 hinauslaufen.
- Ein Rücksprung der Systemuhr wird auf null geklemmt und verändert
  `started_at` nicht. Eine ungültige Clock scheitert mit `INVALID_CLOCK`, ohne
  den Draft zu verändern.
- Entfernen des letzten Items beendet oder nullt die Uhr nicht. Nur Discard
  erzeugt wieder den nicht gestarteten Zustand.
- R3 besitzt keinen Pausemodus, Resttimer, manuelle Korrektur oder Endzeit.
  Normale Satzpausen zählen unverändert zur abgeleiteten Laufzeit.
- Die Shell lauscht nur während einer offenen Instanz auf
  `visibilitychange`. Bei `visible` rendert sie die Uhr sofort neu; `hidden`
  verändert nichts. Es gibt keine produktiven Resume-, `pageshow`-, Focus-,
  Netzwerk- oder Storage-Side-Effects.
- Ein Repaint-Intervall von 1000 ms beginnt nur bei gestarteter Uhr, wird
  höchstens einmal gehalten und bei bestätigtem Close oder Destroy entfernt.
  Nach Background-Throttling korrigiert der nächste Read die Anzeige aus dem
  Zeitstempel.

### S2.5 - Session-Shell-API und DOM-Vertrag

`session-shell.js` registriert klassisch den eingefrorenen Slot
`AppModules.activityV2.sessionShell`. Er konsumiert nur den Draftcontroller
und R1-Semantik, niemals `dataAccess`.

<!-- markdownlint-disable MD013 -->

| API | Eingabe | Rückgabe / Wirkung |
| --- | --- | --- |
| `sessionShell.mount(options)` | Exakt `host`, `draft`, optional `semantics`, `confirmDiscard`, `setIntervalFn`, `clearIntervalFn`; unbekannte Felder scheitern. | Hängt genau eine anfangs versteckte/inert gesetzte Shell an den Host und gibt einen eingefrorenen Controller zurück. |
| `shell.open(options?)` | Optional exakt `opener`; sonst aktuelles `activeElement`. | Öffnet idempotent, bindet genau einen Escape-/Tab-/Visibility-Satz, rendert und fokussiert den Picker beziehungsweise ersatzweise Close. |
| `shell.render()` | keine | Synchronisiert Picker, Empty State, Itemfolge, Buttonzustände, Notiz, Status und Uhr aus aktuellen Snapshots; keine Draftmutation. |
| `shell.requestClose(source?)` | `close_button`, `escape` oder `api`; Default `api`. | Gibt ein Promise<boolean> zurück: `true` geschlossen, `false` offen erhalten. Gleichzeitige Aufrufe teilen denselben laufenden Guard. |
| `shell.isOpen()` | keine | Aktueller Boolean ohne Side-Effect. |
| `shell.destroy()` | keine | Idempotent; entfernt Scheduler und Listener exakt einmal, stellt Fokus/Untergrund/Body wieder her und entfernt nur das erzeugte Shell-DOM. Der Draft wird weder verworfen noch verändert. |

<!-- markdownlint-enable MD013 -->

Mount validiert Host, Draftmethoden, Semantik, Schedulerpaar und
Katalogversionsgleichheit fail-closed. Shellfehler tragen
`name: ActivityV2SessionShellError` und die stabilen Codes
`INVALID_OPTIONS`, `INVALID_HOST`, `INVALID_DRAFT_API`, `SEMANTICS_MISSING`,
`INVALID_DRAFT_STATE`, `CATALOG_VERSION_MISMATCH`, `INVALID_CONFIRMATION`, `INVALID_SCHEDULER`,
`SHELL_ALREADY_MOUNTED`, `SHELL_ALREADY_OPEN` oder `SHELL_DESTROYED`.
`semantics` fällt auf den R1-Namespace zurück, `confirmDiscard` auf
`window.confirm`, und das Schedulerpaar auf `window.setInterval/clearInterval`.
Fehlt ein verwendbarer Default, scheitert Mount vor DOM-Mutation. Pro Host ist
eine gemountete und pro `ownerDocument` eine offene R3-Shell erlaubt; nach
Destroy beziehungsweise Close wird die jeweilige Belegung freigegeben.

Die Shell erzeugt ausschließlich:

- Header mit Titel `Training erfassen`, abgeleiteter Uhr und Close-Button;
- beschrifteten nativen Select-Picker aller aktiven Entries aus dem aktuell
  injizierten Katalog sowie `Hinzufügen`;
- Empty State `Noch keine Übung oder Aktivität hinzugefügt.`;
- geordnete Itemliste mit Label, `Nach oben`, `Nach unten` und `Entfernen`;
- `Sessionnotiz (optional)` mit `maxlength=500` und Statusregion;
- keine Suche, Messfelder, Historie, Save-, Finish- oder Commit-Aktion.

Pickeroptionen bleiben in der Katalogreihenfolge. Bereits enthaltene Keys sind
deaktiviert; nach Add/Remove wird die erste verfügbare Option gewählt. Up/Down
sind an den Grenzen deaktiviert. Labels werden ausschließlich per
`textContent` eingesetzt. Notiz-`input` ruft `setNote()` auf, sodass der Guard
auch vor einem Blur den realen Draftzustand kennt. Erwartete Domänenfehler
werden ruhig in der Statusregion angezeigt; sie schließen die Shell nicht.

### S2.6 - Close-, Discard- und Cleanup-Vertrag

- Close-Button, Escape und öffentliche API verwenden ausschließlich
  `requestClose()`. Es gibt keinen zweiten ungeguardeten Schließpfad.
- Bei `revision === 0` wird direkt geschlossen, ohne Bestätigung und ohne neue
  `request_id`. Ein erneutes Öffnen derselben pristine Instanz ist erlaubt.
- Bei `revision > 0` erhält `confirmDiscard` einen tief eingefrorenen Kontext
  aus `message`, `source` und aktuellem Snapshot. Die Message lautet
  `Session verwerfen? Deine bisherigen Änderungen gehen verloren.` Nur der
  exakte Boolean `true` bestätigt; synchrone und Promise-Rückgaben sind erlaubt.
- Bestätigung ruft zuerst `draft.discard()` auf und schließt nur nach dessen
  Erfolg. Cancel, Throw/Reject der Bestätigung oder Discardfehler lassen Draft,
  Uhr, Listener und Shell offen; die aktive Fokusposition wird wiederhergestellt
  und der Fehler ruhig angezeigt.
- Während einer laufenden Bestätigung werden weitere Close-/Escape-Aufrufe auf
  dasselbe Promise koalesziert. Es gibt höchstens einen Confirm- und einen
  Discard-Aufruf.
- Erfolgreiches Close stoppt Scheduler, entfernt Shelllistener, stellt die
  zuvor gesetzten `inert`-Zustände der direkten Host-Geschwister und den vorherigen
  Body-Overflow exakt wieder her und fokussiert den noch verbundenen Opener.
- `destroy()` führt dasselbe technische Cleanup ohne Confirm oder Discard aus;
  der externe Draft bleibt vollständig erhalten. Wiederholtes Close/Destroy
  bleibt ein No-op ohne Listener- oder Intervallfehler.
- Destroy invalidiert einen eventuell laufenden asynchronen Close-Guard. Eine
  später eintreffende Confirm-Auflösung darf weder `discard()` aufrufen noch
  DOM oder Fokus erneut verändern; das ausstehende Close-Promise endet mit
  `false`.

### S2.7 - Accessibility- und Responsive-Vertrag

- Die erzeugte Vollfläche besitzt `role=dialog`, `aria-modal=true`, ein
  `aria-labelledby` zum sichtbaren Titel sowie konsistente `hidden`,
  `aria-hidden` und `inert`-Zustände.
- Beim Öffnen werden direkte Host-Geschwister unter Erhalt ihres Vorzustands
  inert gesetzt. Tab/Shift+Tab bleiben in der Shell; Escape läuft durch den
  Discard-Guard. Beim Schließen wird der Openerfokus sicher wiederhergestellt.
- Alle Controls besitzen sichtbare Labels oder präzise deutsche Accessible
  Names. Statusmeldungen verwenden `role=status` und `aria-live=polite`.
- Itemreihenfolge ist visuell und im DOM identisch. Alle Aktionen sind native
  Buttons; deaktivierte Grenzaktionen tragen wirklich `disabled`.
- CSS verwendet eigene `activity-v2-session-*`-Selektoren, `position: fixed`,
  `inset: 0`, `100vw`, `100vh` mit `100dvh`-Upgrade, Safe-Area-Padding,
  sticky Header und einen eigenständig scrollbaren Inhaltsbereich.
- Bei `<=640px` werden Picker, Notiz und Itemaktionen einspaltig gestapelt;
  Touchziele sind mindestens 44 px hoch. Bei 320 CSS-Pixel Breite entstehen
  weder horizontales Scrollen noch Überlappungen. Lange Labels dürfen umbrechen
  und jedes Flex-/Grid-Kind erhält erforderliches `min-width: 0`.
- `prefers-reduced-motion` deaktiviert optionale Übergänge. Animation ist kein
  Zustands- oder Abschlussnachweis.

#### Owner Briefing S2

- Normaler App-/Tabwechsel erhält den JavaScript-Prozess und damit Draft und
  `started_at`; gedrosselte Repaints werden durch timestampbasierte Neuberechnung
  aufgeholt.
- Reload oder Android-Prozess-Reclaim vernichtet In-Memory-State. R3 behauptet
  dafür keine Absicherung; R7 implementiert Recovery und R8 beweist die interne
  Android-PWA-Integration vor realer Nutzung.

### S2 Full Contract Review

- `PASS`: Jede öffentliche Methode, Option, Rückgabe, Mutation, No-op-
  Bedingung und jeder stabile Fehler ist festgelegt.
- `PASS`: R2-Handoff verwendet exakt stabile `request_id`, top-level
  `catalog_version`, eindeutige Keys und lückenlose `item_order`, ohne Commit-
  Payload oder `dataAccess` vorwegzunehmen.
- `PASS`: Timerstart, Uhr-Rücksprung, Backgrounding, letztes Item, Discard,
  Confirm-Cancel, Fokus und idempotentes Cleanup besitzen eindeutige Pfade.
- `PASS`: Der Picker konsumiert den aktuellen kontrollierten Katalog ohne
  Runtime-Hardcoding von Version oder Anzahl; Suche bleibt R4.
- `PASS`: Kein Storage, Netzwerk, Supabase, Save, Product-Load oder Activity-
  V1-Eingriff wurde geöffnet. F-ACT-R3-07 ist geschlossen;
  F-ACT-R3-01 bleibt wirksam deferred.
- `Keine offene Grundsatzfrage oder In-Scope-P0/P1 blockiert S3.`

Exit: Kein State-, Timer-, Close- oder UI-Grundsatz bleibt offen.

## S3 - Lifecycle-, Datenverlust- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / High`.

Status: `PASS`.

Deterministisch abgeschlossen: State-/Timer-/Close-/DOM-/Fokus-/Viewport-
und Isolationsrisiken red-teamed, Lifecyclepfade und fail-closed Grenzen
festgelegt, neue Dateien und Rollback abgegrenzt sowie T-ACT-R3-01 bis -09
mit vollständiger Invalidation finalisiert. Keine blockierende Grundsatzfrage;
Doku-Sync bleibt S6.

### S3.1 - Risikomatrix und Gegenmaßnahmen

<!-- markdownlint-disable MD013 -->

| Risiko | Verbindliche Gegenmaßnahme | Nachweis |
| --- | --- | --- |
| stiller Draftverlust beim Close | ausschließlich `requestClose`; dirty nur nach exaktem `true` und erfolgreichem `discard`; Cancel/Fehler bleiben offen | T-04/-08 |
| Duplikat, Teilmutation, Außenmutation | vollständige Vorvalidierung, Copy-on-write, tiefer Freeze, lückenlose Reihung, alte Snapshotreferenz bei Fehler | T-02/-05 |
| falscher Timer durch Throttling | epochbasierte Differenz; Intervall/Visibility nur Repaint; Rücksprung-Clamp; Startzeit nie umschreiben | T-03/-08 |
| Listener-/Intervall-Leak | explizite Bound-/Timer-Flags, höchstens eine Registrierung, symmetrisches Cleanup, idempotentes Close/Destroy | T-04 |
| asynchrones Confirm nach Destroy | Guard-Generation invalidieren; späte Auflösung endet `false` ohne Discard, DOM- oder Fokuswirkung | T-04 |
| halbfertiges Mount/Open | Struktur und ersten Snapshot vor DOM-Marker validieren; Open rendert zunächst hidden; jeder Fehler rollt Listener, Timer, Inert, Body und Active-Shell-Registry zurück | T-04/-05 |
| fremder oder inkonsistenter Draft | Snapshotshape, Schema, UUID, Version, Revision, Zeit, Notiz, Items, Reihenfolge und Katalogreferenzen vor jedem DOM-Patch prüfen; `INVALID_DRAFT_STATE` | T-04/-05 |
| Fokusverlust nach Listenpatch | Add fokussiert Picker; Move dieselbe Aktion am verschobenen Key; Remove nächsten Key, sonst Picker; Cancel erhält Auslöser | T-04/-07 |
| Mobile-Overflow oder lange Labels | 320/390/Desktop-Viewports, Wrapping, `min-width:0`, einspaltige Controls und echte Scroll-/Overlap-Messung | T-07/-08 |
| versteckte Produkt-/Datenwirkung | statische Verbotsmatrix, Harness als einziger Load, leerer Produktdiff und unveränderte Hashmarker | T-06/-09 |
| Reload/Prozess-Reclaim | keine Scheinlösung; F-ACT-R3-01, R7-/R8-Gate und Verbot realer Nutzung bleiben sichtbar | T-08/Gate |

<!-- markdownlint-enable MD013 -->

### S3.2 - Lifecycle- und Fehlerpfade

<!-- markdownlint-disable MD013 -->

| Ereignis | Draftwirkung | UI-/Cleanup-Wirkung |
| --- | --- | --- |
| Mount | keine | validiert vollständig, erzeugt hidden/inert DOM; Fehler hinterlässt weder Marker noch Registryeintrag |
| Open | keine | hidden rendern, dann Untergrund/Body sperren, Listener setzen, fokussieren; Fehler vollständig zurückrollen |
| Close pristine | keine | ohne Confirm schließen, technisch aufräumen, Opener fokussieren |
| Close dirty + Cancel/Fehler | keine | offen lassen, vorherigen Fokus und laufenden Timer erhalten, ruhiger Status |
| Close dirty + Confirm | atomarer Discard auf neue `request_id` | erst danach Cleanup und Fokus zum Opener |
| Escape | identisch zu Close | preventDefault nur bei offener Shell; derselbe Guard |
| `visibilitychange: hidden` | keine | kein Render und kein Cleanup |
| `visibilitychange: visible` | keine | genau ein sofortiger Timer-Read/Repaint |
| Reload/Prozess-Reclaim | In-Memory-Draft darf verloren gehen | kein `beforeunload`, Storage- oder Recovery-Ersatz in R3 |
| Destroy | keine | Guard invalidieren, Cleanup einmalig, erzeugtes DOM entfernen; kein Confirm/Discard |

<!-- markdownlint-enable MD013 -->

Strukturelle Shellvalidierung verwendet zusätzlich
`ActivityV2SessionShellError.code = INVALID_DRAFT_STATE`. Sie prüft exakt das
S2-Draftschema, eingefrorene JSON-kompatible Werte, UUID, positive
`catalog_version`, sichere Revision, ISO-Startzeit oder `null`, Notizgrenze,
höchstens 50 eindeutige Items und lückenlose `item_order`. Jeder Key muss im
gleichversionierten injizierten Katalog aktiv vorhanden sein. Erst danach darf
ein DOM-Fragment die bestehende Ansicht ersetzen.

### S3.3 - Fokus-, DOM- und Responsive-Review

- Shellmarkup wird einmal erzeugt; dynamische Picker-/Iteminhalte entstehen
  über DOM-APIs und `textContent`, nicht über ungeprüftes `innerHTML`.
- Render baut zunächst ein DocumentFragment. Scheitert Validierung oder Aufbau,
  bleiben vorhandenes DOM, Fokus und Lifecyclezustand unverändert.
- Add fokussiert nach dem Render den Picker. Move fokussiert am verschobenen
  Item wieder den ausgelösten Up-/Down-Button, sofern nicht deaktiviert, sonst
  die alternative Itemaktion. Remove fokussiert das Item an derselben Position,
  ersatzweise das vorige Item oder den Picker.
- Focus Trap berechnet Fokusziele nach jedem DOM-Patch neu. Versteckte,
  inerte und deaktivierte Controls werden ausgeschlossen; leere Shell fokussiert
  Picker oder Close.
- Die disposable Browserprüfung misst `scrollWidth <= clientWidth`, Bounding-
  Boxen innerhalb des Viewports und Nichtüberlappung zentraler Controls bei
  `1440x900`, `390x844` und `320x800`.
- 78 native Optionen sind zulässig; eine selbstgebaute Ergebnisliste,
  Virtualisierung oder Suche wäre vorgezogener R4-Scope.

### S3.4 - Isolations-, Rollback- und Dateivertrag

Neue R3-Dateien sind exakt:

1. `session-draft.js`
2. `session-draft.contract.test.js`
3. `session-shell.js`
4. `session-shell.contract.test.js`
5. `session-shell.css`
6. `session-shell-harness.html`

Alle sechs Dateien fehlen am S3-Ausgangsstand erwartungsgemäß; im Repo-Root
existiert weiterhin kein `package.json`.

Der Harness lädt klassisch und ausschließlich `semantics.js`,
`session-draft.js` und `session-shell.js` plus eigenes CSS. Er lädt weder
`data-access.js` noch Produktmodule. Test-Fakes für DOM, Clock, UUID,
Scheduler und Confirm bleiben in Contract-Tests beziehungsweise Harness und
werden nicht als Runtime-Abstraktion verallgemeinert.

Statische Verbote für Runtime-JS und Harness:

- `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` und Supabase;
- `indexedDB`, `localStorage`, `sessionStorage`, Cache API und
  `navigator.serviceWorker`;
- `dataAccess`, `commitSession`, `loadLastPerformance` sowie beide R2-RPC-
  Namen;
- `beforeunload`, `pagehide` oder produktive Resume-Hooks;
- fest eingebaute `catalog_version: 1` oder Entry-Anzahl 78 in Runtimecode;
- jede R3-Script-/Style-Referenz in `index.html`.

Rollback entfernt ausschließlich diese sechs neuen Dateien. Die aktive
Roadmap dokumentiert den Rückfall; `semantics.js`, `data-access.js`, Activity
V1, `index.html`, SQL und bestehende R1/R2-Artefakte werden nicht verändert.
Sofort stoppen, falls Umsetzung Produktload, Storage, Netzwerk, Suche,
Messeditor, Save/Finish oder eine Änderung an R1/R2/V1 erfordern würde.

### S3.5 - Finalisierte Tests und Invalidation

- Draftänderung invalidiert T-01 bis -09; insbesondere sind State-, Shell-,
  Browser- und Backgroundnachweise gemeinsam zu wiederholen.
- Shelländerung invalidiert T-01/-04/-06/-07/-08/-09; CSS invalidiert
  T-07/-08/-09.
- Harnessänderung invalidiert T-04/-06/-07/-08/-09.
- Semantik- oder Katalogänderung invalidiert die vollständige R1/R2/R3-Suite
  und T-02 bis -09.
- `index.html`-, V1- oder R2-Änderung invalidiert mindestens T-06/-09 und
  blockiert bei R3-Bezug bis zur Scopekorrektur.
- Teständerungen invalidieren den jeweils behaupteten Nachweis. Grüne
  R1/R2-20/20 bleiben bis zur ersten R3-Codeänderung gültig.

### S3 Full Contract Review

- `PASS`: D-ACT-R3-01 bis -13 besitzen Implementierungspfad, Fehlerpfad,
  Testzuordnung und unveränderte Negativgrenze.
- `PASS`: F-ACT-R3-08 bis -11 schließen transaktionales Cleanup,
  Consumer-Validierung, Fokusnachführung und Testinvalidierung im Vertrag.
- `PASS`: Rollback ist rein additiv; kein bestehender Producer, Consumer,
  Produktload, Storage oder Datenpfad wird geändert.
- `PASS`: Es gibt kein offenes In-Scope-P0/P1. F-ACT-R3-01 bleibt bewusst
  deferred und durch R7/R8/R11-Gates abgesichert.
- `PASS`: S4-Dateien, Reihenfolge und Abhängigkeiten sind eindeutig;
  S4R entscheidet nur noch Readiness und sichere Batchgrenzen.

Exit: In-Scope-Risiken sind geschlossen; F-ACT-R3-01 bleibt sichtbar R7 zugeordnet.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / High`.

Status: `PASS`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks / Evidence | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | Pure Draft-API und State-Contract | `S1-S3` | `session-draft.js`, `session-draft.contract.test.js` | `Full` | `T-ACT-R3-01/-02/-03/-05/-06/-09` | `none` |
| S4.2 | Isolierte Vollflächen-Shell und CSS-Grundstruktur | `S1-S3`, `F-ACT-R3-12` | `session-shell.js`, `session-shell.contract.test.js`, `session-shell.css`, `session-shell-harness.html` | `Consumer` | `T-ACT-R3-01/-04/-06/-07/-09` | `none` |
| S4.3 | Katalog-v1-Picker und Iteminteraktionen | `S1-S3` | Shell, Harness, Shell-Tests | `Consumer` | `T-ACT-R3-01/-02/-04/-06/-07/-09` | `none` |
| S4.4 | Timer, Backgrounding, Close-/Discard-Guard und Cleanup | `F-ACT-R3-01/-13` | Draft, Shell, Draft-/Shell-Tests | `Full` | `T-ACT-R3-01/-03/-04/-05/-06/-09` | `none` |
| S4.5 | Integrierter Harness, Isolation und Full Review | `alle` | alle sechs R3-Dateien | `Full` | `T-ACT-R3-01 bis -07 und -09` | `T-ACT-R3-08 erst in S5` |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - `S4.1 ist Grundlage. S4.2-S4.4 konsumieren nur den bewiesenen Draftvertrag.
    S4.5 integriert, erweitert aber keinen Scope.`
- Fehlende Zuordnung:
  - `keine nach Korrektur von F-ACT-R3-12 und F-ACT-R3-13`
- Evidence:
  - `nicht erforderlich`
- Scope-Freeze:
  - `PASS: genau sechs additive R3-Dateien; kein Product-Scriptload, Netzwerk,
    Supabase/R2-DataAccess, Storage, Persistenz, Save/Finish oder R4-R8-Scope`
- Gültig übernommene Nachweise:
  - `R1/R2-Contract-Suite 20/20 PASS ist die unveränderte Vor-S4-Baseline;
    ab S4.1 führt T-ACT-R3-01 die gemeinsame R1/R2/R3-Suite je Block erneut aus`
- Invalidation Map:
  - `Draft -> T-01 bis -09; Shell -> T-01/-04/-06/-07/-08/-09; CSS ->
    T-07/-08/-09; Harness -> T-04/-06/-07/-08/-09; Semantics/Katalog ->
    vollständige R1/R2/R3-Suite und T-02 bis -09`
- Owner-Gates:
  - `kein S4-Gate; T-ACT-R3-08 ist ausschließlich der manuelle UX-/Background-
    Smoke in S5 und blockiert keinen lokalen S4-Ausführungsblock`
- Empfohlene S4-Ausführungsblöcke:
  - `freigegeben: S4.1 separat; S4.2-S4.3 gemeinsam; S4.4-S4.5 gemeinsam`
- Begründung der Zusammenlegung/Trennung:
  - `Statevertrag vor Consumer; zusammengehörige Shellinteraktionen gemeinsam;
    Lifecycle und Endreview teilen dieselben Invalidationen`
- Review je Ausführungsblock:
  - `gemeinsamer Review erlaubt, Substep-Ergebnisse bleiben getrennt dokumentiert`
- Readiness-Findings/Korrekturen:
  - `F-ACT-R3-12 schließt den fehlenden Shell-Testpfad; F-ACT-R3-13 trennt
    lokale Lifecycle-Beweise sauber vom S5-Owner-Gate. Beide sind fixed.`
- Full Contract Review:
  - `PASS: D-ACT-R3-01 bis -13 besitzen Datei-, Block- und Checkzuordnung.`
  - `PASS: Kein offenes In-Scope-P0/P1 und keine neue Owner-Entscheidung vor S4.`
  - `PASS: Produkt-, Storage-, Netzwerk-, Supabase- und Persistenzgrenzen bleiben
    unverändert; Rollback entfernt ausschließlich die sechs neuen R3-Dateien.`
  - `PASS: Hashmarker von index.html und Activity V1 stimmen mit S1 überein;
    alle sechs geplanten R3-Dateien sind vor S4.1 weiterhin abwesend.`

Exit: `PASS`; S4.1 kann ohne neue Produkt-, Storage- oder Persistenzentscheidung beginnen.

## S4 - Umsetzung

### S4.1 - Pure Session-Draft-API

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R3-03/-08/-09/-11`
- Dateien:
  - `app/modules/vitals-stack/activity/v2/session-draft.js`
  - `app/modules/vitals-stack/activity/v2/session-draft.contract.test.js`
- Umsetzung:
  - `Factory, Draft v1, atomare Mutationen, immutable Snapshots, stabile
    Domänenfehler sowie injizierbare Clock/ID gemäß finalem S2-Vertrag`
- Review:
  - `Full`
- Invalidation:
  - `T-ACT-R3-01/-02/-03/-05/-06/-09`
- Gate:
  - `none`

#### Ergebnis S4.1

- Änderung: `sessionDraft.create()` samt sieben tief eingefrorenen Controller-
  Methoden, Draft-v1-Snapshot, dynamischem Katalogcapture, atomaren Add/Remove/
  Move/Note/Discard-Mutationen, stabiler request_id und timestampbasierter Uhr;
  12 deterministische Draft-Contract-Tests ergänzt.`
- Prüfung: `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`
  `32/32 PASS`; `node --check` für Runtime und Test PASS; T-ACT-R3-02/-03/-05/-06
  im Draft-Test bewiesen; `git diff --check` PASS; keine Runtime-Verbote; index.html-
  und Activity-V1-Hashmarker unverändert; vier spätere Shell-Dateien abwesend.
- Finding/Korrektur: `F-ACT-R3-14 fixed: API und Controller werden tief statt
  nur flach eingefroren; eigener Tree-Freeze-Nachweis ergänzt.`
- Restrisiko: `F-ACT-R3-01 bleibt deferred`
- Doku-Sync: `S6`
- Status: `PASS`

### S4.2 - Isolierte Vollflächen-Shell

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R3-01/-02/-11/-12`
- Dateien:
  - `app/modules/vitals-stack/activity/v2/session-shell.js`
  - `app/modules/vitals-stack/activity/v2/session-shell.css`
  - `app/modules/vitals-stack/activity/v2/session-shell-harness.html`
- Umsetzung:
  - `Mountbare Vollfläche mit Header, Uhrplatz, Empty State, Pickerbereich,
    Itemliste, Notiz und Close; responsive und zugänglich, ohne Produktload`
- Review:
  - `Consumer`
- Invalidation:
  - `T-ACT-R3-01/-04/-06/-07/-09`
- Gate:
  - `none`

#### Ergebnis S4.2

- Änderung: `Tief eingefrorene sessionShell-API mit transaktionalem Mount/Open,
  Vollflächendialog, Focus Trap, Inert-/Scroll-Restore, Header/Uhrplatz, Picker-,
  Item-, Notiz- und Statusbereichen; eigenständiges Responsive-CSS und isolierter
  Harness. Dirty Close bleibt bis S4.4 sicher offen.`
- Prüfung: `12/12 Shell-Consumer-Tests und gemeinsame Suite 44/44 PASS; Syntax,
  statische Verbote, Harness-Loadgrenze und Produktmarker PASS. T-ACT-R3-07 in
  Edge bei 1440x900, 390x844 und 320x800 ohne Overflow/Overlap PASS.`
- Finding/Korrektur: `F-ACT-R3-15 und F-ACT-R3-16 fixed.`
- Restrisiko: `Owner-UX-Smoke in S5`
- Doku-Sync: `S6`
- Status: `PASS`

### S4.3 - Kontrollierter Picker und Iteminteraktionen

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R3-07/-08/-09`
- Dateien:
  - `session-shell.js`, Harness und Contract-Tests`
- Umsetzung:
  - `Aktive Katalog-v1-Entries deterministisch anzeigen; Add, Up, Down und
    Remove an Draft-API binden; Duplikate und Grenzen ruhig behandeln`
- Review:
  - `Consumer`
- Invalidation:
  - `T-ACT-R3-01/-02/-04/-06/-07/-09`
- Gate:
  - `none`

#### Ergebnis S4.3

- Änderung: `Aktive Katalogeinträge in Producer-Reihenfolge; enthaltene Keys
  disabled; Add, Up, Down, Remove und Input-synchrone Sessionnotiz mit ruhigen
  Statusmeldungen und deterministischer Fokusnachführung vollständig verdrahtet.`
- Prüfung: `Schema-/Katalogvalidierung vor DOM-Patch, Picker-/Reihenfolge-/Grenz-
  und Fehlerpfade im Fake-DOM PASS; Picker, Add/Move/Remove, Notiz, Fokus und
  langes Label in den drei T-ACT-R3-07-Zielgrößen in Edge PASS.`
- Finding/Korrektur: `keine weitere Abweichung; F-ACT-R3-16 fixed.`
- Restrisiko: `echte Suche bewusst R4`
- Doku-Sync: `S6`
- Status: `PASS`

### S4.4 - Timer, Backgrounding und Verwerfungs-Guard

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R3-04/-05/-06/-09/-10/-13; F-ACT-R3-01`
- Dateien:
  - `session-draft.js`, `session-shell.js`, Harness und Tests`
- Umsetzung:
  - `Zeitstempelbasierte Anzeige, Repaint-/Visibility-Vertrag, idempotentes
    Listener-Cleanup sowie gemeinsamer Close-/Escape-/Discard-Guard`
- Review:
  - `Full`
- Invalidation:
  - `T-ACT-R3-03/-04/-08`
- Gate:
  - `none`

#### Ergebnis S4.4

- Änderung: `Genau ein 1000-ms-Repaintintervall ab Timerstart, sichtbarer
  visibilitychange-Sofortread, gemeinsamer asynchroner Close-/Escape-/API-Guard,
  tief gefrorener Confirm-Kontext, exaktes true, Discard-before-Close sowie
  generationsgesichertes Cleanup nach Destroy.`
- Prüfung: `Fake-Clock/-DOM/-Scheduler beweisen Timerkorrektur, Hidden/Visible,
  pristine Close, Confirm-Koaleszierung, Cancel, Throw/Reject, Discardfehler,
  späte Auflösung und idempotentes Listener-/Intervall-Cleanup.`
- Finding/Korrektur: `F-ACT-R3-17 und F-ACT-R3-18 fixed.`
- Restrisiko: `Reload/Prozessverlust bleibt sichtbar R7 zugeordnet`
- Doku-Sync: `S6`
- Status: `PASS`

### S4.5 - Integrierter Harness und Full Review

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `alle R3-Entscheidungen und In-Scope-Findings`
- Dateien:
  - `alle neuen R3-Dateien; produktive Dateien nur read-only gegenprüfen`
- Umsetzung:
  - `Deterministische Harness-Szenarien, statische Isolationschecks, lange
    Labels, Mobile-/Desktop-Zustände und Fehlerpfade vollständig schließen`
- Review:
  - `Full`
- Invalidation:
  - `T-ACT-R3-01 bis T-ACT-R3-09`
- Gate:
  - `danach S5 Owner-Smoke`

#### Ergebnis S4.5

- Änderung: `Der isolierte Harness konsumiert nun den vollständigen S4.1-S4.4-
  Stand; sein Loadvertrag bleibt auf Semantik, Draft, Shell und eigenes CSS
  begrenzt. Keine Produktintegration oder R4-R8-Funktion wurde ergänzt.`
- Prüfung: `50/50 gemeinsame R1/R2/R3-Suite, Syntax, statische Verbote und Full
  Contract Review PASS; T-ACT-R3-07 in Edge nach der Shelländerung bei 1440x900,
  390x844 und 320x800 mit Empty/Filled, Live-Timer, langem Label, 44px-Zielen,
  ohne horizontalen Overflow/Overlap und mit leerer Konsole erneut PASS.`
- Finding/Korrektur: `F-ACT-R3-17/-18 im Full Review korrigiert; kein offenes
  In-Scope-P0/P1.`
- Restrisiko: `F-ACT-R3-01 bleibt bewusst bis R7/R8 deferred.`
- Doku-Sync: `S6`
- Status: `PASS`

Exit: R3 ist isoliert implementiert; keine R4-R8-Funktion wurde vorgezogen.

## S5 - Contract-, Browser- und Abschlusschecks

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R3-01 | lokal | `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`; R1/R2/R3 gemeinsam grün | PASS | `50/50` | `alle Activity-V2-Runtime-JS und Contract-Tests` |
| T-ACT-R3-02 | lokal | Exaktes Draftschema, stabile request_id, dynamische catalog_version, Revision/No-ops, 50er-Grenze, Add/Remove/Move/Note/Discard, Duplikate und lückenlose item_order | PASS | `12 Draft-Contract-Tests` | `Draft oder Semantik/Katalog` |
| T-ACT-R3-03 | lokal | Erster erfolgreicher Add startet exakt einmal; Fake-Clock, ungültige Clock, Hintergrundsprung, Rücksprung-Clamp, letztes Item und Stunden über 24 | PASS | `Draft- und Shell-Timer-Regressionen` | `Draft, Clock- oder Timervertrag` |
| T-ACT-R3-04 | lokal | Fake-DOM/Scheduler: Mount/Open-Transaktion, Snapshotvalidierung, pristine/dirty Close, Escape, Confirm-Koaleszierung, Cancel, spätes Confirm nach Destroy, Fokus und idempotentes Cleanup | PASS | `18 Shell-Contract-Tests plus Harness` | `Draft, Shell oder Harness` |
| T-ACT-R3-05 | lokal | Jeder Draftfehler und INVALID_DRAFT_STATE lassen Snapshotreferenz, Revision, ID, Startzeit und bestehendes DOM unverändert; öffentliche Werte sind tief eingefroren | PASS | `Draft-/Shell-Fehler- und Freeze-Regressionen` | `Draft, Shell oder Semantik` |
| T-ACT-R3-06 | lokal | Kein Netzwerk, Supabase/R2-DataAccess, Storage/Cache/Service Worker, beforeunload/pagehide oder Produktload; Runtime hardcodiert weder Katalogversion 1 noch 78 Entries | PASS | `statische Verbotsmatrix und Harness-Loadcheck` | `R3-Runtime-JS, Harness, index.html oder Produktgrenze` |
| T-ACT-R3-07 | Browser | Disposable Playwright bei 1440x900, 390x844 und 320x800: leere und gefüllte Shell, Kerninteraktionen, Fokus, lange Labels, kein Overflow/Overlap, leere Konsole und temporäre Screenshots | PASS | `Edge: alle drei Viewports; Empty/Filled, Add/Move/Remove/Notiz, Fokusumlauf, langes Label, 44px-Ziele, kein horizontaler Overflow/Overlap; frischer Harness-Tab ohne Warnungen/Fehler` | `Draft, Semantik, Shell, CSS oder Harness` |
| T-ACT-R3-08 | Browser/Owner | Live Server: Items anlegen, mindestens 30 Sekunden anderen Tab/App verwenden, zurückkehren; Items unverändert und Uhr korrekt fortgeschritten | PASS | `Edge: Fremdtab 32.003 ms ausgewählt; Straight-arm Pulldown, Ab Wheel Rollout und Notiz unverändert; Uhr nach Rückkehr 00:20 -> 01:59` | `Draft, Timer/Lifecycle, Shell, CSS oder Harness` |
| T-ACT-R3-09 | lokal | Syntax, `git diff --check`, statische Verbote, unveränderte index.html-/V1-Hashmarker, keine R2-/Produktdateiänderung und Full Contract Review | PASS | `Syntax/Diff/Hashes/Full Review; Produktload unverändert` | `gesamter R3-Diff oder Produktgrenze` |

<!-- markdownlint-enable MD013 -->

Ergebnis:

- Grüne Nachweise:
  - `T-ACT-R3-01 bis -09 PASS; 50/50, Syntax, Isolation, Diff/Hashes, drei Viewports und owner-freigegebener 32-s-Background-Smoke grün`
- Wiederverwendete, nicht invalidierte Nachweise:
  - `R1 T-ACT-R1-01 bis -05 und archivierte R2-EV-/T-Nachweise; R1/R2-Baseline ist in den 50/50 erneut enthalten`
- Nicht ausgeführte Smokes:
  - `Reload-Recovery bewusst R7; interner Android-PWA-Integrationssmoke
    bewusst R8; kein produktiver PWA-Smoke für die isolierte R3-Shell`
- Produktiver Iststand:
  - `unverändert; R3 wird nicht geladen`
- Externer Review:
  - `CodeRabbit nicht erforderlich. Nativer Edge-confirm öffnete korrekt; die
    Erweiterung verlor beim automatischen Dismiss die Verbindung. T-04 beweist
    Cancel/Confirm/Discard deterministisch; kein Produktfinding.`
- Offene Findings:
  - `nur F-ACT-R3-01 deferred; kein offenes In-Scope-P0/P1`
- Commit-Entscheidung:
  - `S5 testseitig commitbereit; S6-Doku-Sync und Archiv noch offen`

Exit: R3-Verträge sind lokal und im isolierten Browser bewiesen; Owner-Smoke ist grün.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. `docs/modules/Activity Module Overview.md` nur mit bewiesener R3-API,
   Isolation und R4-Handoff synchronisieren.
2. `docs/qa/health-capture-reports.md` um einen kompakten reproduzierbaren
   R3-Contract-/Harness-Check ergänzen; keine Einzelschrittchronik.
3. Masterplan R3 auf `DONE` setzen, nachgewiesenes Ergebnis und Nachweise
   ergänzen. Danach folgt C2; R4 bleibt bis zu dessen Katalog-v2-Gate
   blockiert. F-ACT-R3-01 bleibt R7/R8 zugeordnet.
4. Optionales Owner-Briefing kurz erklären: Backgrounding ist grün, Reload-
   und Prozess-Recovery noch nicht; daher noch kein echter Trainingsbetrieb.
5. Finalen Full Contract Review gegen Masterplan, R1/R2, realen Diff und
   Produktisolation durchführen.
6. Findings korrigieren. Kein In-Scope-P0/P1 darf offen bleiben;
   F-ACT-R3-01 darf nur mit unverändertem R7-/R8-Nutzungsgate deferred bleiben.
7. Changelog-Relevanz entscheiden. Eine vollständig verborgene Grundlage ist
   nur dann unter `Unreleased` aufzunehmen, wenn sie nach Projektvertrag als
   bemerkenswerte Entwickleränderung gilt; sonst `nicht bemerkenswert` begründen.
8. Session Resume Card auf Abschluss setzen und Commit-Empfehlung aus realem
   Diff ableiten.
9. Roadmap mit `(DONE)` nach `docs/archive/` verschieben; keine Evidence-Datei.
10. Eine kopierfertige Summary für den Besprechungschat erstellen, die Ziel,
    Umsetzung, Nachweise, Scopegrenzen, Restrisiko und nächsten Schritt erklärt.

Ergebnis:

- Source-of-Truth-Sync:
  - `PASS; Activity Module Overview, HCR-020 und Activity-V2-Masterplan
    beschreiben denselben bewiesenen R3-Vertrag und C2-Handoff.`
- Finaler Review:
  - `PASS; 50/50 Contract-Fälle, Syntax aller acht V2-JavaScriptdateien,
    statische Verbotsmatrix, git diff --check und unveränderte index.html-/
    Activity-V1-Hashes. Kein offenes In-Scope-P0/P1.`
- Restrisiken:
  - `Nur F-ACT-R3-01 deferred: Reload-/Prozess-Recovery bleibt bis R7/R8
    gesperrt; normaler App-/Tab-Wechsel ist bewiesen.`
- Changelog:
  - `nicht bemerkenswert; R3 ist vollständig verborgen, ohne produktiven
    Scriptload, Consumer, Netzwerk-, Speicher-, Daten- oder Nutzerwirkung.`
- Commit-Empfehlung:
  - `Kein blinder Gesamt-Worktree-Commit. Die sechs R3-Dateien und vier
    R3-Dokuänderungen gezielt stage/committen oder bewusst mit dem noch
    uncommitteten R1/R2-Stack bündeln; fremde Template-Änderungen trennen.`
- Archivstatus:
  - `PASS; Roadmap am angegebenen (DONE)-Archivziel, keine Evidence-Datei nötig.`
- Besprechungschat-Summary:
  - `erstellt; Ziel, Umsetzung, Nachweise, Scopegrenzen, Restrisiko und C2 als
    nächsten Schritt enthält der Abschlussbeitrag.`

Exit: R3 ist dokumentiert und archiviert; C2 kann beginnen, R4 bleibt bis zu
dessen Abschluss blockiert.

---

## Initialer Contract Review der Roadmap

Datum: `2026-07-31`.

Geprüft gegen:

- `docs/Future trainingsmodule update thoughts.md`
- R1 Catalog Baseline Contract und archivierte R1-Roadmap
- archivierte R2-Roadmap und ihr bewiesener Abschlussstand
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- reale R1-/R2-Namespace- und Produktisolationsgrenze
- freigegebene Owner-Entscheidungen aus dem Denkraum

Findings und Korrekturen:

1. `F-INIT-R3-01 fixed`: Der allgemeine Master-Draft konnte so gelesen werden,
   als müsse R3 bereits Autosave-Zeitpunkt und vollständige Editorwerte tragen.
   Der Masterplan nennt die Feldliste nun ausdrücklich den vollständig
   ausgebauten Draft ab R7; R3 hält nur die stabile Vorstufe.
2. `F-INIT-R3-02 fixed`: "Timer endet beim Speichern" hätte in R3 einen
   funktionslosen Save-Pfad provoziert. D-ACT-R3-12 ordnet Finish/Save eindeutig
   R8 zu; R3 beweist nur Start, Laufzeit und Backgrounding.
3. `F-INIT-R3-03 fixed`: Normales Backgrounding und Android-Prozess-Reclaim
   waren als ein Risiko vermischt. D-ACT-R3-06, F-ACT-R3-01 und T-ACT-R3-08
   trennen beide Lifecycle-Grenzen prüfbar.
4. `F-INIT-R3-04 fixed`: Ein temporärer Picker hätte still zur echten Suche
   wachsen können. D-ACT-R3-07 begrenzt ihn auf `getCatalog()`; R4 bleibt Owner
   von Suche und Historien-Lookup.
5. `F-INIT-R3-05 fixed`: R2-Datenzugriff hätte als bequeme Vorleistung
   eingebunden werden können. Guardrails und T-ACT-R3-06 verbieten Netzwerk,
   DataAccess und Product-Scriptload explizit.
6. `F-INIT-R3-06 fixed`: Der R2-Handoff fordert eine über Retries stabile
   `request_id`; die erste R3-Fassung beschrieb stattdessen eine separate
   lokale Session-ID. Draftschema, Entscheidungen und Tests verwenden jetzt
   den R2-Begriff und erhalten ihn bis R7/R8.
7. `F-INIT-R3-07 fixed`: Die erste Draftskizze legte `catalog_version` pro Item
   und eine generische `position` ab. Der R2-Commit erwartet eine top-level
   Katalogversion und `item_order`; R3 ist jetzt daran ausgerichtet.
8. `F-INIT-R3-08 fixed`: Der R3-Abschluss verwies direkt auf R4, obwohl der
   Masterplan C2 zwingend dazwischenschaltet. Metadaten und S6 nennen C2 nun
   als nächsten Rolling-Wave-Schritt.
9. `F-INIT-R3-09 fixed`: R7 konnte vor produktiver Verdrahtung keinen echten
   Android-PWA-Integrationssmoke beweisen. R7 implementiert und testet Recovery
   isoliert; R8 übernimmt den internen PWA-Nachweis, R11 bleibt Aktivierungsgate.
10. `F-INIT-R3-10 fixed`: Ein auf Version 1 oder 78 Entries fest gebauter
    Picker wäre nach C2 unbrauchbar. R3 wird gegen v1 bewiesen, konsumiert aber
    die injizierte aktuelle Katalogversion ohne feste Anzahl.
11. `F-INIT-R3-11 fixed`: Die Fresh-Chat-Leseliste nannte die R2-Entscheidungen
    zur stabilen `request_id` nicht. D-ACT-R2-06/-07 sind jetzt ausdrücklich
    Teil des gezielten R2-Handoffs.

Review-Ergebnis:

- `PASS - ready for fresh execution chat`
- `Keine offene Grundsatzentscheidung blockiert S1-S4R.`
- `F-ACT-R3-01 ist kein versteckter Mangel, sondern das ausdrücklich
  dokumentierte R7-/R8-Gate vor realer Nutzung.`

# MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap

Diese Roadmap erweitert die weiterhin isolierte Activity-V2-Session-Shell um
eine lokale Katalogsuche und die read-only Anzeige der letzten realen
Ausführung. Der produktive Activity-V1-Flow, der Activity-V2-Commitpfad und das
Supabase-Schema bleiben unverändert.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `ACTIVE` |
| Modul / Bereich | `Activity V2 / Suche und Last-Performance-Consumer` |
| Owner / Kontext | `Stephan; private Single-User-PWA für die eigene Trainingsdokumentation` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-01` |
| Letzter Stand | `2026-08-01; initialer Full Contract Review PASS, S1 ist nächster Schritt` |
| Aktueller Schritt | `S1` |
| Risikoklasse | `R2` |
| Standard-Reviewtiefe | `Consumer`; `Full` an Datenzugriffs- und Abschlussgrenzen |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `S4R und S4.1: Extra High wegen Katalogversions- und historischem Snapshotvertrag` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `app/modules/vitals-stack/activity/v2/data-access.js`, `data-access.contract.test.js`, `session-shell.js`, `session-shell.css`, `session-shell.contract.test.js`, `session-shell-harness.html` |
| Deploy relevant | `nein` |
| Produktive Schreibwirkung | `nein` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `nicht erforderlich`; kein SQL, Deploy oder produktiver Write |
| Gekoppelte Roadmaps | `R2 stellt RPC/Data Access bereit; R3 stellt Draft/Shell bereit; C2 stellt Catalog v2 bereit; R5 folgt auf R4` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

Diese Karte ist der verbindliche Einstieg für einen frischen Ausführungs-Chat.
Sie ersetzt keinen Source of Truth und erlaubt keine erfundenen
Produktentscheidungen.

- Auftrag:
  - `R4 deterministisch bis zum jeweils freigegebenen Gate abarbeiten.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High`; nur `S4R` und `S4.1` auf `Extra High`.
- Kontextübergabe aus dem Denkraum:
  - `PASS`: R1, R2, R3 und C2 sind DONE. Activity V1 bleibt produktiv sichtbar;
    Activity V2 ist weiterhin isoliert.
  - `PASS`: Der Masterplan wurde am 2026-08-01 gegen den realen R2-/R3-/C2-
    Stand geprüft und der lookup-spezifische Katalogversionsvertrag korrigiert.
  - `PASS`: Baseline vor Roadmap-Erstellung: `56/56` Activity-V2-Contract-Tests
    und `node tools/activity-catalog.mjs check` grün.
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  5. `docs/Future trainingsmodule update thoughts.md`
  6. `docs/modules/Activity Module Overview.md`
  7. `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
  8. `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
  9. archivierte R2-, R3- und C2-Roadmaps, jeweils nur für den betroffenen
     Vertrag
  10. reale R1-R3-/C2-Runtime, Tests und der R2-Lookup in
      `sql/20_Activity_V2.sql`
  11. `git status --short` und nur der relevante Diff
- Startschritt:
  - `S1 - System- und Vertragsdetektivarbeit`.
- Erlaubte Autonomie:
  - lokale Reads, eng begrenzte JS-/CSS-/Harness-/Teständerungen und lokale
    Tests gemäß Tool Permissions;
  - keine produktive Supabase- oder Deployment-Aktion.
- Owner-Gates:
  - isolierter Browser-Smoke kann agentisch vorbereitet werden;
  - ein Owner-Smoke ist nur erforderlich, wenn der Owner die reale Touch-
    Ergonomie zusätzlich abnehmen will.
- Stop-Bedingungen:
  - Änderung von RPC, SQL, RLS, Grants, `commitSession`, Draftschema,
    Produktload, Activity V1 oder produktiver Navigation;
  - fehlende oder widersprüchliche Katalog-/Historienverträge;
  - Versuch, frühere Werte als aktuelle Trainingsleistung vorzubefüllen.
- Halluzinationsschutz:
  - Katalogkeys, Snapshots, Responsefelder und Suchverhalten ausschließlich
    aus den realen Sources of Truth ableiten.
  - Keine medizinischen Empfehlungen, Trainingspläne, Progressionslogik oder
    freie Übungskeys ergänzen.
- Startprompt:

```text
Arbeite die MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap
gemäß ihrer Ausführungs-Chat-Startkarte ab. Lies die dort festgelegten Quellen
in Reihenfolge, prüfe zuerst den realen Git- und Runtime-Stand und beginne mit
S1. Activity V1, Produktload, SQL/RPC, commitSession und Draftschema bleiben
unverändert. Fehlende Fakten nicht erfinden; Widersprüche als Finding führen.
```

## Session Resume Card

- Ziel:
  - Die isolierte R3-Shell findet kanonische Catalog-v2-Items lokal und zeigt
    pro ausgewähltem Item die letzte reale Ausführung read-only an.
- Unveränderliche Verträge:
  - Activity V1 und produktive `index.html` bleiben unverändert.
  - Kein SQL/RPC, kein Save, kein Storage, kein Draftschema-Cutover.
  - Historienwerte sind Gedächtnisstütze, niemals aktuelle Eingabe.
  - Kein freier Key und keine Katalogmutation im Studio.
- Erledigter Stand:
  - R1, R2, R3 und C2 sind DONE.
  - Masterplan-Review 2026-08-01 PASS nach Korrektur der R2-Lookup-Kopplung.
  - Baseline `56/56` und Katalogcheck PASS.
- Aktueller Schritt:
  - `S1 - realen System- und Vertragsstand erneut verifizieren`.
- Nächster erlaubter Schritt:
  - `S1 vollständig mit Full Contract Review abarbeiten`.
- Offene Findings:
  - `none`; die initial erkannten Planungsfindings sind im Zielvertrag behoben.
- Geänderte Dateien:
  - `docs/Future trainingsmodule update thoughts.md`
  - `docs/MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap.md`
- Gültige Nachweise:
  - initial `56/56` Contract-Tests und C2-Katalogcheck; in S1 frisch prüfen.
- Runtime-/Deploy-Stand:
  - Activity V2 bleibt vollständig isoliert; kein R4-Deploy.
- Offene Owner-Freigaben:
  - `none` vor S1; kein produktives Gate innerhalb von R4.
- Stop-Bedingungen:
  - S4 nicht vor `S4R PASS`; keine Erweiterung in R5-R13 oder Produktcode.

## Zielvertrag

Prüfbares Endergebnis:

- Die isolierte Activity-V2-Session-Shell verwendet eine injizierte
  Katalogsemantik und sucht ausschließlich lokal über deren öffentliche
  `search()`-API.
- Eine Suche zeigt höchstens acht deterministisch sortierte Treffer. Leere
  Suche zeigt keine vollständige 80er-Liste; Tippen löst keinen Netzwerkaufruf
  aus.
- Die Auswahl eines Treffers fügt ausschließlich dessen kanonischen
  `item_key` über den bestehenden R3-Draft hinzu.
- Für jedes im Shell-Draft neu beobachtete Item wird pro gemounteter Shell
  nach dem ersten sichtbaren Öffnen höchstens ein automatischer
  R2-Historienlookup gestartet. Bereits im Draft vorhandene Items und spätere
  R13-Importitems können denselben Mechanismus nutzen; ein nur gemountetes,
  verstecktes Panel erzeugt keine Abfrage.
- Erfolgreiche Antworten zeigen Datum, vollständigen historischen Itemblock
  und alle geordneten Sätze beziehungsweise Dauer-/Distanzwerte read-only.
- `null`, Loading und Fehler sind unterschiedliche, neutrale Zustände. Ein
  Lookupfehler blockiert weder Draft noch weitere Erfassung.
- Historische Antworten dürfen aus einer älteren unveränderlichen
  `catalog_version` stammen und werden anhand ihrer Snapshots validiert.
- Ein neuer optionaler Semantikparameter für `loadLastPerformance` ist
  rückwärtskompatibel; der bestehende Ein-Argument-v1-Aufruf bleibt gültig.
- R4 verändert weder `commitSession` noch SQL, RPC, RLS, Grants, Draftschema,
  persistente Recovery oder Produktaktivierung.
- Die Shell bleibt auf Desktop und schmalen Android-Viewports bedienbar,
  zugänglich und frei von horizontalem Overflow oder überlappenden Controls.

Bewusst unverändert:

- Activity V1, Doctor View, Berichte und bestehende Health-Event-Pfade.
- R2-Datenmodell und `activity_v2_last_performance(text)`.
- R3-Timer, Draftmutation, Close-/Discard-Guard und Backgroundvertrag.
- Aktuelle Set-/Dauer-Eingabe aus R5/R6, Recovery aus R7, Save/History aus R8,
  Produktcutover aus R11 und JSON-Import aus R13.

## Problem und Ist-Zustand

- C2 stellt Catalog v2 mit 80 kanonischen Einträgen und deterministischer
  lokaler Suche bereit, aber die R3-Shell besitzt noch einen kontrollierten
  vollständigen `<select>`-Picker.
- R2 besitzt bereits den ownergebundenen read-only RPC
  `activity_v2_last_performance(text)` und einen JS-Client, R3 verwendet ihn
  jedoch noch nicht.
- Der R2-JS-Lookup löst seine Semantik aktuell fest über
  `AppModules.activityV2.semantics` auf. Dadurch kann er einen ausschließlich
  in Catalog v2 vorhandenen Key nicht anfordern.
- Die bestehende gemeinsame Responsevalidierung verlangt zusätzlich, dass
  historische Snapshots der aktuell geladenen Katalogversion entsprechen.
  Das würde eine gültige v1-Historie unter einem v2-Consumer ablehnen.
- Ohne R4 müsste Stephan sich das letzte Gewicht und die letzten
  Wiederholungen weiterhin merken oder außerhalb von MIDAS nachsehen.
- R4 ist kein Trainingseditor. Es schafft nur Auswahl und Gedächtnisstütze,
  auf denen R5 und R6 später aufbauen.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R4-01 | 2026-08-01 | R4 bleibt nur im isolierten R3-Harness und erhält keinen Produktload. | R11 besitzt den kontrollierten Cutover. | Scope, S4, S5 |
| D-ACT-R4-02 | 2026-08-01 | R4 nutzt die injizierte Semantik; der Harness injiziert `semanticsV2`. | Suche und spätere Katalogpflege dürfen nicht fest an einen globalen Snapshot gekoppelt sein. | S2, S4.2 |
| D-ACT-R4-03 | 2026-08-01 | `loadLastPerformance(itemKey, options?)` erhält optional exakt `{ semantics }`; der alte Ein-Argument-Aufruf bleibt v1-kompatibel. | C2-Keys müssen lesbar werden, ohne R2-Consumer zu brechen. | S2, S4.1 |
| D-ACT-R4-04 | 2026-08-01 | Nur der Lookup-Pfad wird semantikinjizierbar; `commitSession` bleibt byte- und verhaltensseitig unverändert. | Commit-Kompatibilität gehört zu R8/O-8. | Scope, S4.1, S5 |
| D-ACT-R4-05 | 2026-08-01 | Lookupinput wird gegen die ausgewählte aktuelle Semantik geprüft; die historische Antwort gegen ihre eigenen unveränderlichen Snapshots. | Alte reale Leistung bleibt unter neuer Katalogversion lesbar. | S2, S4.1 |
| D-ACT-R4-06 | 2026-08-01 | Suche läuft synchron/lokal über `semantics.search(query, { limit: 8 })`. | Kein Query-Spam, keine Serverabhängigkeit, begrenzte mobile Oberfläche. | S2, S4.2 |
| D-ACT-R4-07 | 2026-08-01 | Leere Suche listet nicht den gesamten Katalog. Kein Treffer erzeugt keinen freien Key. | Fokus und stabile Historienidentität. | S2, S4.2 |
| D-ACT-R4-08 | 2026-08-01 | Jeder neu im Draft beobachtete kanonische Key erhält höchstens einen automatischen Lookup pro Shell-Mount. | Funktioniert für Suche, vorbefüllte Testdrafts und späteren R13-Import ohne wiederholte Requests. | S2, S4.3 |
| D-ACT-R4-09 | 2026-08-01 | Success und `null` werden bis zum Destroy in einem Shell-lokalen Cache gehalten; Fehler werden nur nach explizitem Retry erneut geladen. | Deterministisches und begrenztes Netzwerkverhalten. | S2, S4.3 |
| D-ACT-R4-10 | 2026-08-01 | Späte Antworten nach Remove oder Destroy dürfen kein veraltetes DOM aktualisieren. | Schutz vor Race- und Lifecyclefehlern. | S3, S4.3 |
| D-ACT-R4-11 | 2026-08-01 | Letzte Werte werden niemals in aktuelle Set-/Dauerfelder übernommen. | Historie ist Orientierung, keine behauptete aktuelle Leistung. | Copy, R5/R6-Grenze |
| D-ACT-R4-12 | 2026-08-01 | Loading, No-History, Error und Success besitzen eigene neutrale Copy. | Kein falscher Daten- oder Sicherheitszustand. | S2, S4.3 |
| D-ACT-R4-13 | 2026-08-01 | R4 ändert weder SQL/RPC noch Auth/RLS/ACL. | R2 hat diese Grenze bereits produktiv bewiesen. | Scope, S5 |
| D-ACT-R4-14 | 2026-08-01 | Performancezustand bleibt Shell-lokal und wird nicht Teil des R3-Draftschemas. | R7 persistiert den Trainingsdraft, nicht einen flüchtigen Read-Cache. | S2, R7-Handoff |
| D-ACT-R4-15 | 2026-08-01 | Der Lookup-Callback am Shell-Mount bleibt optional; ohne Callback funktioniert die R3-Shell ohne Historienbereich weiter. | R4 darf bestehende isolierte R3-Consumer nicht brechen. | S2.5, S4.3 |
| D-ACT-R4-16 | 2026-08-01 | Lookups starten erst bei sichtbarer geöffneter Shell; ISO-Tage werden als Kalenderdatum ohne UTC-/Local-Shift formatiert. | Keine versteckten Requests und kein falscher Trainingstag. | S2.5, S2.6, S4.3 |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`.
- Neue oder entscheidungsrelevante Konzepte:
  - aktuelle Katalogsemantik validiert den Suchkey;
  - historische Snapshots validieren die alte reale Ausführung;
  - Lookupcache ist flüchtig und nicht Teil des Trainingsdrafts.
- Geplante Briefing-Gates:
  - `S4.1`: kurz erklären, warum Lesen versionsagnostisch wird, Schreiben aber
    unverändert bleibt.
  - `S6`: Alltagssprache zu Suche, letzter Ausführung und verbleibender
    Isolation.
- Nicht erneut zu erklären:
  - normale JS-/CSS-Syntax, DOM-Helfer, Standardtestausführung.

## Scope und Grenzen

In Scope:

- additive, rückwärtskompatible Semantikinjektion ausschließlich für
  `loadLastPerformance`;
- separate Validierung historischer Lookupantworten;
- lokales Suchfeld mit begrenzter Ergebnisliste und kanonischer Auswahl;
- read-only Last-Performance-Zustände pro Item;
- Shell-lokaler Cache, expliziter Retry und Schutz vor späten Antworten;
- responsive und zugängliche Darstellung im isolierten Harness;
- Contract-, Browser-, Background- und Isolationsnachweise;
- abschließender Doku-/QA-Sync.

Nicht in Scope:

- Änderungen an SQL 20/21, RPC-Signaturen, RLS, Grants oder Supabase-Deploy;
- `commitSession`, produktiver Katalogselektor oder Rolloutkompatibilität;
- Set-, Dauer-, Distanz- oder Last-Eingabefelder;
- Autocomplete aus freiem Text, freie Keys oder Katalogpflege im Studio;
- persistent gespeicherter Such-/Lookupcache;
- Draft-Recovery, Save, History, Korrektur, Export oder Doctor-View-Integration;
- JSON-Trainingsplanimport, MCP, Coaching, Progression oder medizinische
  Empfehlung;
- produktive Verdrahtung über `index.html` oder Entfernung von Activity V1.

Roadmap-spezifische Guardrails:

- MIDAS bleibt eine private Single-User-PWA; keine erfundene Mandanten-, Rollen-
  oder SaaS-Abstraktion.
- Alle Suchtreffer kommen aus der injizierten Semantik. Kein Label wird zu
  einer neuen Identität umgedeutet.
- Last-Performance-UI darf nie so aussehen, als wäre ein Satz in der aktuellen
  Session bereits erledigt.
- User-Facing Werte und Notizen werden über sichere DOM-APIs gerendert.
- Kein Netzwerkrequest beim Tippen; Requests entstehen nur für Draftitems.
- Ein Lookupfehler wird sichtbar, aber macht Draft und Session nicht ungültig.

## Scope-Freeze vor S4

- Bestehende Features:
  - Activity V1, R3-Draft-/Timer-/Discard-Vertrag und C2-Suche bleiben erhalten.
- Datenmodell, Lifecycle und Retention:
  - unverändert; nur flüchtiger Shell-Lesezustand kommt hinzu.
- Cleanup, Scheduler, Secrets und externe Automationen:
  - nicht betroffen.
- Kompatible Producer und Consumer:
  - Producer: C2 `semanticsV2.search()` und R3-Draftitems;
  - Consumer: R4-Shell;
  - Read-Backend: unveränderter R2-RPC;
  - alter R2-Ein-Argument-Lookup bleibt kompatibel.
- Offene Grundsatzfragen:
  - `none`.
- Umgang mit späterem Scope-Wechsel:
  - Katalogpflege folgt C2-Runbook; Eingabe R5/R6; Recovery R7; Commit R8;
    Produktload R11; JSON-Import R13.

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/Future trainingsmodule update thoughts.md`
- `docs/modules/Activity Module Overview.md`
- `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
- `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
- `app/modules/vitals-stack/activity/v2/semantics.js`
- `app/modules/vitals-stack/activity/v2/semantics-v2.js`
- `app/modules/vitals-stack/activity/v2/data-access.js`
- `app/modules/vitals-stack/activity/v2/session-draft.js`
- `app/modules/vitals-stack/activity/v2/session-shell.js`
- zugehörige Contract-Tests, CSS und Harness
- Lookupfunktion in `sql/20_Activity_V2.sql`

Nur bei konkreter Vertragsfrage:

- `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap (DONE).md`
- zugehörige archivierte Evidence-Dateien
- `docs/reference/activity-v2/Catalog Maintenance Runbook.md`
- Supabase-Dokumentation nur bei unerwartetem realem RPC-/Clientwiderspruch;
  keine neue Recherche für bereits eingefrorene R2-Verträge.

## Tool Permissions und Gates

Allowed:

- lokale Repo-Reads und relevante Git-Diffs;
- Änderungen ausschließlich an den freigegebenen R4-JS-/CSS-/Harness-/Tests
  und den in S6 genannten Dokumenten;
- Node-Contract-Tests, Syntaxchecks, Katalogcheck und `git diff --check`;
- lokaler HTTP-Server und Browser-/Playwright-Smokes im isolierten Harness;
- read-only Quellprüfung des bereits deployten R2-SQL-Vertrags, falls nötig.

User-gated:

- keine produktive Aktion vorgesehen;
- optionaler Owner-Touch-Smoke am realen Android-Gerät.

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- SQL, RPC, RLS, ACL, Edge Functions oder produktive Supabase-Daten ändern.
- `index.html`, Service Worker, Activity V1 oder produktive Navigation verdrahten.
- `commitSession`, Draftschema oder persistente Recovery verändern.
- R5-R13-Funktionalität vorziehen.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `High` | TODO | |
| S2 | Such-, Lookup- und UI-Zielvertrag | `High` | TODO | |
| S3 | Race-, Security- und Umsetzungsreview | `High` | TODO | |
| S4R | S4 Readiness Review | `Extra High` | TODO | |
| S4.1 | Lookup-spezifische Semantikinjektion | `Extra High` | TODO | |
| S4.2 | Lokale Suche und kanonische Auswahl | `High` | TODO | |
| S4.3 | Last-Performance-Zustände und Races | `High` | TODO | |
| S4.4 | Responsive/A11y und Harness | `High` | TODO | |
| S4.5 | Integrierter Full Review | `High` | TODO | |
| S5 | Contract-, Browser- und Abschlusschecks | `High` | TODO | |
| S6 | Doku-Sync, Commit und Archiv | `Medium` | TODO | |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R4-01 | P1 | Contract | fixed | R2-Lookup ist aktuell v1-gebunden; D-ACT-R4-03/-04 und S4.1 schließen nur den Read-Pfad. |
| F-ACT-R4-02 | P1 | Contract | fixed | Historische Antwort darf älteren Katalog tragen; D-ACT-R4-05 trennt Snapshot- von Current-Catalog-Validierung. |
| F-ACT-R4-03 | P1 | Scope | fixed | Produktaktivierung und Activity-V1-Eingriff sind durch D-ACT-R4-01 und Scope-Freeze verboten. |
| F-ACT-R4-04 | P2 | Performance | fixed | Suchlimit acht und kein Netzwerk beim Tippen gemäß D-ACT-R4-06/-07. |
| F-ACT-R4-05 | P1 | Lifecycle | fixed | Späte Antworten nach Remove/Destroy werden gemäß D-ACT-R4-10 verworfen. |
| F-ACT-R4-06 | P1 | Product | fixed | Alte Werte bleiben read-only und füllen keine aktuelle Leistung vor; D-ACT-R4-11. |
| F-ACT-R4-07 | P2 | UX | fixed | Loading, No-History, Error und Success sind getrennte Zustände; D-ACT-R4-12. |
| F-ACT-R4-08 | P2 | Query | fixed | Höchstens ein automatischer Lookup pro Key/Mount; Retry nur explizit; D-ACT-R4-08/-09. |
| F-ACT-R4-09 | P2 | Architecture | fixed | Lookupcache bleibt aus dem Draftschema; D-ACT-R4-14. |
| F-ACT-R4-10 | Watchlist | Product | deferred | Echte aktuelle Set-/Dauererfassung folgt ausschließlich in R5/R6. |
| F-ACT-R4-11 | Watchlist | Lifecycle | deferred | Reload-/Android-Prozess-Recovery bleibt R7/R8 zugeordnet. |
| F-ACT-R4-12 | P1 | Compatibility | fixed | Optionaler Callback und R3-kompatibler Fallback gemäß D-ACT-R4-15. |
| F-ACT-R4-13 | P2 | Lifecycle/Date | fixed | Keine Hidden-Mount-Requests und tagstabile Datumsformatierung gemäß D-ACT-R4-16. |

<!-- markdownlint-enable MD013 -->

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Startkarte und Pflichtreferenzen in Reihenfolge lesen.
2. `git status --short` prüfen und R4-Arbeit von bestehenden C2-/Dokuänderungen
   abgrenzen; nichts Fremdes zurücksetzen.
3. Reale öffentliche APIs und Scriptgrenzen kartieren:
   - R1-/C2-Semantik;
   - R2-Data-Access und Lookupresponse;
   - R3-Draft-/Shell-/Harness-API;
   - produktive `index.html`-Isolation.
4. Exakte Datenflusskarte erstellen:
   `Suchtext -> semantics.search -> kanonischer Key -> draft.addItem ->
   loadLastPerformance -> historischer Snapshot -> read-only DOM`.
5. Nachweisen, welche Validierung im R2-Client derzeit den v2-Input und die
   ältere historische Antwort blockiert. Commitvalidierung getrennt markieren.
6. R2-SQL-Lookup auf Signature, Ordering, ownergebundenen Zugriff, `null` und
   vollständige Satzreihenfolge prüfen. Keine SQL-Änderung ableiten, solange
   kein realer Vertragsbruch vorliegt.
7. Frische Baseline ausführen:
   - `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`;
   - `node tools/activity-catalog.mjs check`;
   - Produktload-/V1-Isolationsscan.
8. Ist-Zustand der R3-Harness-Viewports und des 30-Sekunden-
   Backgroundvertrags erfassen; nur invalidierte Nachweise später wiederholen.
9. Fakten, Annahmen und neue Findings getrennt dokumentieren.
10. Full Contract Review gegen Masterplan, R1, R2, R3, C2 und diese Roadmap
    durchführen; Findings korrigieren.

Ergebnis:

- Systemkarte:
  - `[in S1 eintragen]`.
- Reale Baseline:
  - `[Testanzahl, Katalogcheck und Isolationsstand]`.
- Betroffene Schichten:
  - `[Data-Access-Lookup, Shell/Search, CSS, Harness, Tests]`.
- Bewusst nicht betroffene Schichten:
  - `[SQL/RPC, Commit, Draftschema, Produktload, Activity V1]`.
- Offene Fragen:
  - `[IDs oder none]`.
- Doku-Sync:
  - `S6; jetzt nur bei blockierender Source-of-Truth-Abweichung`.

Exit: Reale APIs, Versionsgrenzen, Responseform und Isolationsstatus sind
belegt; kein vermuteter Vertrag wird implementiert.

## S2 - Such-, Lookup- und UI-Zielvertrag

Reasoning: `GPT-5.6 Sol / High`.

### S2.1 - Data-Access-API und Versionsgrenze

Deterministisch festzulegen und zu prüfen:

1. Öffentliche API bleibt exakt `commitSession` und `loadLastPerformance`.
2. Additive Signatur:

```text
loadLastPerformance(itemKey)
loadLastPerformance(itemKey, { semantics })
```

3. `options` ist optional. Wenn vorhanden, ist es ein Objekt mit ausschließlich
   dem Feld `semantics`; unbekannte Felder und ungültige APIs scheitern lokal
   vor Transport als stabiler Domainfehler.
4. Ohne `options.semantics` bleibt das bisherige
   `AppModules.activityV2.semantics`-Fallback erhalten.
5. R4 übergibt immer dieselbe Semantikinstanz an Shell und Lookup, im Harness
   `semanticsV2`.
6. `commitSession` verwendet weiterhin seinen bisherigen v1-Vertrag und wird
   in R4 weder signatur- noch verhaltensseitig geändert.
7. Lookupinput wird normalisiert und gegen `semantics.getEntryByKey()` geprüft.
8. Das RPC-Requestbody bleibt exakt `{ p_item_key: canonicalKey }`.

### S2.2 - Historische Responsevalidierung

Der Lookupvalidator wird von der Commitresponsevalidierung getrennt:

- `null` bleibt ein gültiges Ergebnis.
- `schema_version` bleibt exakt `midas.activity-last-performance.v1`.
- Session-ID, Timestamp und ISO-Tag bleiben streng validiert.
- `item.item_key` muss exakt dem angefragten kanonischen Key entsprechen.
- `catalog_version` muss eine positive Ganzzahl sein, aber nicht der aktuell
  ausgewählten Katalogversion entsprechen.
- Historische Label-, Tracking-, Equipment-, Load-Comparability- und
  Field-Policy-Snapshots werden als in sich vollständige, erlaubte und
  unveränderliche Antwortwerte validiert. Sie werden nicht mit dem heutigen
  Catalog-v2-Entry überschrieben oder verglichen.
- Trackingmode und Field-Policy müssen intern zusammenpassen.
- Top-level-Itemwerte und jeder Setwert müssen den gespeicherten
  Field-Policy-Snapshot einhalten.
- `sets` ist geordnet, lückenlos und enthält ausschließlich das exakte
  R2-Responseschema.
- IDs, Timestamps, Zahlenbereiche, Dezimalpräzision, optionale Texte und exakte
  Feldmengen bleiben fail-closed.
- Die bestehende Commitresponsevalidierung bleibt unverändert an den aktuell
  commitfähigen Katalog gebunden.

### S2.3 - Lokaler Suchvertrag

- R4 ersetzt den vollständigen `<select>`-Picker durch ein beschriftetes
  Suchfeld und eine begrenzte Ergebnisliste.
- Query wird ausschließlich von `semantics.search(query, { limit: 8 })`
  verarbeitet. R4 implementiert kein zweites Ranking und keine Aliaslogik.
- Leere oder nach Normalisierung leere Query zeigt einen kurzen Start-Hinweis,
  keine 80 Einträge.
- Kein Treffer zeigt: `Keine passende Übung oder Aktivität gefunden.`
- Kein Treffer bietet keinen freien Text-Save und keine Katalogmutation an.
- Ergebniszeilen zeigen mindestens Label und Equipment; der kanonische Key
  darf als technische Identität im DOM vorhanden sein, ist aber keine
  dominante UI-Copy.
- Auswahl per Touch/Klick und Tastatur fügt exakt den Trefferkey hinzu.
- Bereits im Draft enthaltene Treffer werden als vorhanden behandelt. Auswahl
  fokussiert den bestehenden Eintrag und erzeugt weder Duplikat noch neuen
  Lookup.
- Keine Serverabfrage, kein Debounce-Netzwerkpfad und kein Vollkatalogfilter im
  Shellcode.

### S2.4 - Accessibility- und Fokusvertrag

- Suchfeld besitzt sichtbares Label und eindeutige ID.
- Ergebnisliste besitzt verständliche Semantik; jeder Treffer ist ein echter
  fokussierbarer Button oder ein gleichwertiges natives Control.
- `ArrowDown` aus dem Suchfeld fokussiert den ersten Treffer, sofern vorhanden.
- `Enter` wählt den fokussierten Treffer beziehungsweise den ersten sichtbaren
  Treffer nur bei nicht leerer Ergebnisliste.
- `Escape` schließt zunächst nur eine offene Ergebnisliste; erst ein weiterer
  Escape ohne offene Suche erreicht den bestehenden R3-Close-/Discard-Guard.
- Nach Auswahl liegt der Fokus am hinzugefügten beziehungsweise bereits
  vorhandenen Item. Nach Entfernen greift der bestehende R3-Fokusvertrag.
- Statusänderungen und Lookupfehler werden über die bestehende Live-Region
  beziehungsweise eine klar zugeordnete Item-Statusregion verständlich.
- Controls erfüllen auch bei 320 px Breite stabile Touchziele und werden nicht
  vom Text verbreitert.

### S2.5 - Lookup-Lifecycle und Cache

- Der Shell-Mount akzeptiert optional eine Funktion `loadLastPerformance`.
  Wenn sie übergeben wird, muss sie eine Funktion sein.
- Ohne Callback bleibt der bestehende R3-Flow vollständig nutzbar. Die Shell
  zeigt dann keinen irreführenden Loading-, Empty- oder Error-Historienbereich
  und startet keinen Lookup.
- Ein R4-Consumer bindet den Read-Pfad außerhalb der Shell mit derselben
  Semantikinstanz, beispielsweise konzeptionell als
  `key => dataAccess.loadLastPerformance(key, { semantics })`. Die Shell löst
  weder `dataAccess` noch einen Katalogglobal selbst auf.
- Die Shell benötigt für R4 eine Semantik mit `search`, `getCatalog` und
  `getEntryByKey`.
- Erst nach `open()` und nur solange die Shell sichtbar ist, wird bei einem
  Render die Menge der Draftitems gegen den Shell-lokalen Lookupstatus
  abgeglichen. Mount und verstecktes Prerendern bleiben requestfrei.
- Für jeden Key ohne Status beginnt genau ein Lookup. Damit funktionieren neu
  gesuchte, bereits im Startdraft vorhandene und später importierte Items über
  denselben Vertrag.
- Zustände je Key:
  - `loading`
  - `success`
  - `empty`
  - `error`
- `success` und `empty` bleiben bis zum Destroy gecacht. Remove und Re-Add
  verursachen keinen zweiten Request.
- Wird ein Item während eines laufenden Requests entfernt, darf dessen spätes
  Ergebnis ausschließlich den Shell-lokalen Cache füllen, nicht das DOM oder
  den Draft. Ein Re-Add kann diesen Cache anschließend verwenden.
- `error` zeigt einen Retry-Button. Nur dessen bewusste Aktivierung startet
  einen neuen Versuch.
- Es gibt keine automatische Retryschleife.
- Responsegeneration und Shellzustand verhindern, dass alte oder nach Destroy
  eintreffende Antworten DOM oder Status verändern.
- Lookupstatus wird weder in den Draft noch in Storage geschrieben.

### S2.6 - Darstellung der letzten Ausführung

Copyvertrag:

- Loading: `Letzte Ausführung wird geladen ...`
- Empty: `Noch kein vorheriger Eintrag.`
- Error: `Letzte Ausführung ist derzeit nicht verfügbar. Du kannst die Übung trotzdem erfassen.`
- Success: `Zuletzt am <lokal formatiertes Datum>`

Der ISO-Tag wird als reines Kalenderdatum formatiert. Eine Umwandlung über
einen mehrdeutigen UTC-/Local-Midnight-Pfad, die den angezeigten Tag
verschieben könnte, ist verboten.

Success zeigt den vollständigen historischen Itemblock:

- `strength_sets`: alle Sätze in `set_order`, nicht nur Maximalgewicht oder
  letzter Satz;
- `duration`: `duration_min`;
- `duration_distance`: `duration_min` und `distance_km`;
- Satzfelder werden nur angezeigt, wenn der historische Snapshot sie erlaubt
  und der Wert vorhanden ist;
- Gewichte und Distanzen verwenden deutschsprachige Dezimaldarstellung und
  eindeutige Einheiten;
- Assistance wird als Unterstützung und nicht als gehobenes Gewicht benannt;
- optionale historische Itemnotiz wird als Text gerendert;
- historische Daten sind visuell als `Letzte Ausführung` abgegrenzt und besitzen
  keine Checkbox, kein Eingabefeld und keinen Erledigtstatus.

### S2.7 - Fehler- und Sicherheitsvertrag

- Invalides Such-/Katalogobjekt scheitert beim Mount fail-closed.
- Ungültiger Lookupinput erzeugt keinen Request.
- Malformed Success wird zum stabilen R2-Domainfehler und nie ungeprüft
  gerendert.
- Rohantwort, JWT, Tabellen-/Constraintdetails oder Stacktraces erscheinen
  nicht in der UI.
- Dynamische Labels, Equipment, Notizen und Werte werden mit `textContent`
  beziehungsweise sicheren DOM-Knoten dargestellt.
- Lookupfehler verändern den Draft nicht und stoppen weder Timer noch Shell.
- Auth-/Netzwerkfehler werden nicht als `Noch kein vorheriger Eintrag`
  umgedeutet.

### S2 Full Contract Review

1. Jeden S2-Vertrag gegen Masterplan, R2-Response, R3-Shell und C2-API prüfen.
2. Besonders verifizieren:
   - alte v1-Historie unter v2-Auswahl;
   - v2-only-Key mit `null`;
   - kein Commitpfad-Drift;
   - keine aktuellen Werte durch Historie;
   - keine Requests beim Tippen.
3. Findings korrigieren und Decision Log/Scope-Freeze synchronisieren.

Ergebnis:

- Finaler Zielvertrag:
  - `[in S2 eintragen]`.
- Gewählte Lösung:
  - `[in S2 eintragen]`.
- Abgrenzung:
  - `[in S2 eintragen]`.
- S4-Pflichtpunkte:
  - `S4.1 bis S4.5`.
- Doku-Sync:
  - `S6`.

Exit: API, Suche, Lookupzustände, Cross-Version-Validierung, Copy und Fokus
sind eindeutig; keine Grundsatzfrage bleibt offen.

## S3 - Race-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / High`.

### S3.1 - Bruchrisikomatrix

Mindestens prüfen:

| Risiko | Erwartete Gegenmaßnahme | Pflichtcheck |
| --- | --- | --- |
| v2-only-Key wird lokal als unbekannt abgelehnt | explizite Lookup-Semantikinjektion | T-ACT-R4-02 |
| gültige v1-Historie wird unter v2 abgelehnt | Snapshotvalidator statt Current-Catalog-Vergleich | T-ACT-R4-02 |
| Commitvalidierung wird versehentlich gelockert | Commit-Harness und gezielter Diff | T-ACT-R4-03 |
| Request bei jedem Tastendruck | statischer Transportzähler | T-ACT-R4-04 |
| wiederholte Render lösen wiederholte Lookups aus | Keyzustand und Requestzähler | T-ACT-R4-05 |
| späte Antwort aktualisiert entferntes Item | Generation/Presence-Guard | T-ACT-R4-06 |
| Destroy wird von Promise überlebt | Destroy-Guard, kein DOM-Write | T-ACT-R4-06 |
| Hidden Mount löst bereits Requests aus | Lookup erst bei sichtbarem `open()` | T-ACT-R4-05 |
| Fehler wird als fehlende Historie dargestellt | getrennte Zustände | T-ACT-R4-07 |
| Historie wirkt wie aktuelle Leistung | read-only Copy und DOM-Vertrag | T-ACT-R4-08 |
| ISO-Tag erscheint als Vortag | tagstabile Calendar-Date-Formatierung | T-ACT-R4-07 |
| lange Labels/Notizen sprengen Mobile | responsive Harnessmatrix | T-ACT-R4-09 |
| XSS über Snapshottext | sichere DOM-Erzeugung | T-ACT-R4-10 |
| R4 wird versehentlich produktiv geladen | Isolationsscan | T-ACT-R4-11 |

### S3.2 - Response- und Datenreview

1. Exakte R2-Responsefelder und erlaubte Werte aus SQL und R2-Tests ableiten.
2. Historische Snapshotvalidierung so schneiden, dass sie streng, aber nicht
   vom aktuellen Katalogsnapshot abhängig ist.
3. Prüfen, dass Item-/Set-Reihenfolge, Feldpolicy und Trackingmode in sich
   konsistent bleiben.
4. `null` nur für echten RPC-No-History-Erfolg erlauben.
5. Keine Datenpersistenz, Retentionänderung oder zusätzliche Abfrage einführen.

### S3.3 - Async-, Fokus- und Cleanupreview

1. State Machine für Search-Open/Closed und Lookupstatus zeichnen.
2. Jeder asynchrone Abschluss prüft `destroyed`, aktuelle Generation und
   Itemanwesenheit vor DOM-Write.
3. Retry ersetzt nur den Errorstatus desselben Keys und koalesziert
   Doppelklicks.
4. Re-Render durch Timer, Notiz oder Reihenfolge erzeugt keine zweite Abfrage.
5. Escape-Priorität Search -> bestehender R3-Discard-Guard prüfen.
6. Remove, Re-Add, Close, Cancel-Close, Confirm-Close und Destroy testen.

### S3.4 - Rollback- und Stop-Vertrag

- Rollback besteht ausschließlich im Zurücknehmen der R4-JS-/CSS-/Harness-
  Deltas; R2/R3/C2 bleiben eigenständig funktionsfähig.
- Keine Datenmigration und kein Remote-Rollback.
- Stop, wenn eine korrekte historische Antwort ohne SQL-Änderung nicht
  validierbar wäre.
- Stop, wenn R4 einen Produktload, Save oder Draftschemawechsel benötigen
  würde.
- Stop, wenn bestehende 56 Baselinefälle vor R4-Implementierung rot sind.

### S3.5 - Finalisierte Tests und Invalidation

- Bestehende R1-R3-/C2-Contract-Suite vollständig erneut ausführen, weil
  `data-access.js` und `session-shell.js` geändert werden.
- C2-Katalogcheck erneut ausführen, weil Search-Consumer und Harness v2 nutzen.
- R3-Harness-Smokes an allen drei Viewports wiederholen.
- 30-Sekunden-Backgroundsmoke wiederholen, weil Shell/Timer-DOM geändert wird.
- SQL-Fixture und produktive Supabase-Postchecks nicht wiederholen, solange SQL,
  RPC, Grants und Transportvertrag unverändert bleiben.
- Kein Android-PWA-Produktsmoke, da R4 nicht produktiv geladen wird.

### S3 Full Contract Review

1. Risiken gegen jeden S4-Substep und jeden T-Check zuordnen.
2. Prüfen, dass kein R5-R13-Vertrag vorgezogen wurde.
3. Reviewtiefe und sichere Ausführungsblöcke finalisieren.
4. Findings korrigieren und S4R vorbereiten.

Ergebnis:

- Blockierende Risiken:
  - `[IDs oder none]`.
- Rollback-/Stop-Vertrag:
  - `[in S3 bestätigen]`.
- S4-Schnitt:
  - `S4.1 bis S4.5`.
- S5-Pflichtchecks:
  - `T-ACT-R4-01 bis T-ACT-R4-12`.
- Doku-Sync:
  - `S6`.

Exit: Cross-Version-, Async-, UI- und Isolationsrisiken sind geschlossen oder
einem konkreten Test zugeordnet.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

Vor S4 alle Ergebnisse aus S1-S3 gegen den dann realen Code prüfen. Diese
vorläufige Matrix darf korrigiert, aber nicht still erweitert werden.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | lookup-spezifische Semantikinjektion und historischer Snapshotvalidator | F-ACT-R4-01/-02 | `data-access.js`, `data-access.contract.test.js` | Full | T-ACT-R4-01 bis -03 | none |
| S4.2 | lokale Catalog-v2-Suche und kanonische Auswahl | F-ACT-R4-04 | `session-shell.js`, CSS, Shelltests, Harness | Consumer | T-ACT-R4-04, -08 bis -10 | none |
| S4.3 | Last-Performance-State, Cache, Retry und Raceguards | F-ACT-R4-05 bis -09, -12/-13 | `session-shell.js`, CSS, Shelltests, Harness | Full | T-ACT-R4-05 bis -08, -10, -14 | none |
| S4.4 | Responsive-, Fokus-, Copy- und Harnesspolitur | F-ACT-R4-04/-07 | CSS, Shelltests, Harness | Consumer | T-ACT-R4-08 bis -10 | none |
| S4.5 | integrierter Code-/Contract- und Isolationsreview | alle | alle R4-Dateien | Full | T-ACT-R4-01 bis -12 | none |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - `S4.1` vor Shellintegration; `S4.2` vor Asynczuständen; `S4.4` nach finalem
    DOM; `S4.5` zuletzt.
- Fehlende Zuordnung:
  - `[Finding oder none]`.
- Evidence:
  - `nicht erforderlich`; Nachweise bleiben kompakt in Roadmap und HCR-022.
- Scope-Freeze:
  - `PASS / BLOCKED: [Grund]`.
- Gültig übernommene Nachweise:
  - initiale Baseline nur übernehmen, wenn S1 denselben Stand frisch bestätigt.
- Invalidation Map:
  - `data-access.js -> gesamte Data-Access- und Commitregression`;
  - `session-shell.js/CSS/Harness -> R3-/R4-Shelltests, drei Viewports und
    Backgroundsmoke`;
  - `semantics-v2.js bleibt unverändert -> C2-Katalogcheck als Regression`.
- Owner-Gates:
  - `none`.
- Empfohlene S4-Ausführungsblöcke:
  - Block A: `S4.1` separat.
  - Block B: `S4.2-S4.3` gemeinsam mit getrennten Ergebnissen und Full Review.
  - Block C: `S4.4-S4.5` gemeinsam nach finalem DOM.
- Begründung:
  - S4.1 verändert eine bestehende gemeinsame Datenzugriffsgrenze.
  - Suche und Lookupzustände teilen denselben Shell-Render-/Fokusfluss.
  - Responsive Politur ist erst auf dem finalen DOM aussagekräftig.
- Readiness-Findings/Korrekturen:
  - `[in S4R eintragen]`.

Exit: S4 kann ohne neue Grundsatzentscheidung beginnen; API-, Shell- und
Reviewgrenzen sind final.

## S4 - Umsetzung

### S4.1 - Lookup-spezifische Semantikinjektion

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R4-03 bis -05; F-ACT-R4-01/-02.
- Dateien:
  - `app/modules/vitals-stack/activity/v2/data-access.js`
  - `app/modules/vitals-stack/activity/v2/data-access.contract.test.js`
- Umsetzung:
  - optionale exakte `{ semantics }`-Option nur für `loadLastPerformance`;
  - v1-Fallback erhalten;
  - Lookupinput gegen ausgewählte Semantik;
  - Lookupresponse über separaten historischen Snapshotvalidator;
  - `commitSession` und Commitvalidator unverändert.
- Review:
  - `Full` gegen R2-SQL, R2-Tests, C2 und O-8.
- Invalidation:
  - gesamte Data-Access-Suite und gezielte Commitbody-/Commiterror-Regression.
- Gate:
  - kurzes Owner-Briefing, kein Freigabegate.

#### Ergebnis S4.1

- Änderung:
  - `[Delta]`.
- Prüfung:
  - `[T-ACT-R4-01 bis -03]`.
- Finding/Korrektur:
  - `[ID oder none]`.
- Restrisiko:
  - `[kurz oder none]`.
- Doku-Sync:
  - `S6`.
- Status:
  - `TODO`.

Exit: v2-only-Keys und ältere valide Historie sind lesbar, ohne den Commitpfad
zu verändern.

### S4.2 - Lokale Suche und kanonische Auswahl

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R4-02, -06 und -07; S2.3/S2.4.
- Dateien:
  - `session-shell.js`, `session-shell.css`, `session-shell.contract.test.js`,
    `session-shell-harness.html`.
- Umsetzung:
  - Select-Picker durch lokale Suche plus höchstens acht Ergebniscontrols
    ersetzen;
  - ausschließlich injizierte `semantics.search()` verwenden;
  - kanonische Auswahl, Duplicate-Fokus, No-Result und Tastaturvertrag;
  - kein Transport beim Tippen.
- Review:
  - `Consumer`; am Ende von Block B gemeinsam `Full`.
- Invalidation:
  - R3-Shell-/Fokus-/Isolationstests und R4-Suchtests.
- Gate:
  - `none`.

#### Ergebnis S4.2

- Änderung:
  - `[Delta]`.
- Prüfung:
  - `[T-ACT-R4-04, -08 bis -10]`.
- Finding/Korrektur:
  - `[ID oder none]`.
- Restrisiko:
  - `[kurz oder none]`.
- Doku-Sync:
  - `S6`.
- Status:
  - `TODO`.

Exit: Such- und Auswahlflow ist lokal, begrenzt, kanonisch und zugänglich.

### S4.3 - Last-Performance-Zustände, Cache und Raceguards

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R4-08 bis -14; S2.5-S2.7.
- Dateien:
  - `session-shell.js`, `session-shell.css`, `session-shell.contract.test.js`,
    `session-shell-harness.html`.
- Umsetzung:
  - optionalen Lookup-Callback am Mount validieren;
  - callbacklosen R3-Fallback und requestfreien Hidden-Mount erhalten;
  - neue Draftitems deterministisch erkennen;
  - Loading/Success/Empty/Error, Cache und expliziten Retry implementieren;
  - volle letzte Ausführung read-only formatieren;
  - Remove-/Re-Add-/Destroy-/stale-Promise-Guards ergänzen;
  - sichere DOM-Erzeugung und keine Draftmutation durch Lookup.
- Review:
  - `Full` gemeinsam mit S4.2.
- Invalidation:
  - gesamte Shellsuite, Data-Access-Integration über Fakes und Harness.
- Gate:
  - `none`.

#### Ergebnis S4.3

- Änderung:
  - `[Delta]`.
- Prüfung:
  - `[T-ACT-R4-05 bis -08, -10]`.
- Finding/Korrektur:
  - `[ID oder none]`.
- Restrisiko:
  - `[kurz oder none]`.
- Doku-Sync:
  - `S6`.
- Status:
  - `TODO`.

Exit: Jedes Item besitzt einen begrenzten, neutralen und race-sicheren
Historienzustand, der die Session nie blockiert.

### S4.4 - Responsive, Fokus, Copy und Harness

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - S2.3-S2.7 und R3-Responsivevertrag.
- Dateien:
  - `session-shell.css`, `session-shell.contract.test.js`,
    `session-shell-harness.html`; `session-shell.js` nur für notwendige
    Fokus-/Copykorrekturen.
- Umsetzung:
  - finale Result-/Historienstruktur auf 1440x900, 390x844 und 320x800
    stabilisieren;
  - lange deutsche/englische Labels, Equipment und Notizen prüfen;
  - Touchziele, Fokusreihenfolge, Live-Status und Reduced Motion erhalten;
  - Harness mit deterministischen Success-/Empty-/Error-/Slow-Fakes erweitern.
- Review:
  - `Consumer`; im Block C gemeinsam `Full`.
- Invalidation:
  - Browsermatrix und 30-Sekunden-Backgroundsmoke.
- Gate:
  - `none`.

#### Ergebnis S4.4

- Änderung:
  - `[Delta]`.
- Prüfung:
  - `[T-ACT-R4-08 bis -10]`.
- Finding/Korrektur:
  - `[ID oder none]`.
- Restrisiko:
  - `[kurz oder none]`.
- Doku-Sync:
  - `S6`.
- Status:
  - `TODO`.

Exit: Der finale R4-DOM ist auf allen Zielviewports bedienbar und verständlich.

### S4.5 - Integrierter Code- und Contract-Review

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - gesamter Zielvertrag und alle Findings.
- Dateien:
  - gesamter R4-Diff; Produktgrenzen read-only gegenprüfen.
- Umsetzung:
  - kein neues Feature; vollständiger Review auf API-Drift, unsafe DOM,
    wiederholte Requests, Races, falsche Copy, Commitdrift und Scope-Creep;
  - Findings unmittelbar korrigieren und betroffene Checks wiederholen.
- Review:
  - `Full`.
- Invalidation:
  - abhängig vom korrigierten Finding.
- Gate:
  - `none`.

#### Ergebnis S4.5

- Änderung:
  - `[Reviewkorrekturen oder keine]`.
- Prüfung:
  - `[betroffene T-ACT-R4-IDs]`.
- Finding/Korrektur:
  - `[IDs oder none]`.
- Restrisiko:
  - `[kurz oder none]`.
- Doku-Sync:
  - `S6`.
- Status:
  - `TODO`.

Exit: R4 ist code- und vertragsseitig geschlossen; kein R5-R13-Vertrag wurde
vorgezogen.

## S5 - Contract-, Browser- und Abschlusschecks

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R4-01 | lokal | gesamte Activity-V2-Suite: `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js` | TODO | Testanzahl/Output | Activity-V2-JS/Tests |
| T-ACT-R4-02 | lokal | alter Ein-Argument-v1-Lookup, injizierter v2-only-Key mit `null`, v2-Request mit valider historischer v1-Antwort, malformed Snapshot fail-closed | TODO | Data-Access-Tests | Data Access/Semantik |
| T-ACT-R4-03 | lokal | `commitSession`-API, Requestbody, Validation, Fehlerzustände und Retry bleiben unverändert | TODO | Commitregression/Diff | Data Access |
| T-ACT-R4-04 | lokal | Suche verwendet C2-API mit Limit acht; leere/keine/mehrere Treffer; kein Fetch beim Tippen; Duplicate ohne Add/Lookup | TODO | Shelltests/Transportzähler | Shell/Semantik |
| T-ACT-R4-05 | lokal | Startdraft, neuer Add, Re-Render, Remove/Re-Add: höchstens ein automatischer Lookup je Key/Mount; Error-Retry nur explizit | TODO | Shelltests/Callcounter | Shell |
| T-ACT-R4-06 | lokal | späte Success/Error nach Remove, Retry oder Destroy verändert weder DOM noch Draft; Doppelklickretry koalesziert | TODO | Async-Fake-Tests | Shell |
| T-ACT-R4-07 | lokal | Loading/Success/Empty/Error, komplette Setreihenfolge, Dauer/Distanz/Assistance/Notiz und neutrale Copy | TODO | Render-Contract-Tests | Shell/Formatter |
| T-ACT-R4-08 | lokal | Historienwerte sind ausschließlich read-only; keine aktuellen Inputs, Erledigtzustände oder Draftmutation | TODO | DOM-/Snapshot-Test | Shell |
| T-ACT-R4-09 | Browser | Harness 1440x900, 390x844, 320x800: Suche, Touch, Tastatur, Fokus, lange Labels, alle Lookupzustände, kein Overflow/Overlap | TODO | Screens/Browserlog | Shell/CSS/Harness |
| T-ACT-R4-10 | lokal/Browser | sichere DOM-Erzeugung mit Markuptext in Label/Equipment/Notiz; keine Ausführung, leere Konsole | TODO | XSS-Regression | Shell |
| T-ACT-R4-11 | statisch | `index.html`, Activity V1, Service Worker, SQL/RPC, Storage und Produktnavigation unverändert; kein R4-Produktload | TODO | Diff/Hash/rg | gesamter Diff |
| T-ACT-R4-12 | Browser | mindestens 30 Sekunden Fremdtab: Draft/Notiz/Historie unverändert, Timer korrekt fortgeschritten, keine zusätzlichen Lookups | TODO | Backgroundsmoke | Shell/Timer/Harness |
| T-ACT-R4-13 | lokal | `node tools/activity-catalog.mjs check`, Syntaxchecks und `git diff --check` | TODO | Output | Katalog/R4-Diff |
| T-ACT-R4-14 | lokal | Mount ohne Callback bleibt R3-kompatibel; Hidden Mount ist requestfrei; ISO-Tag bleibt in Vienna/UTC-Grenzfällen derselbe Kalendertag | TODO | Shell-/Formattertests | Shell/Formatter |

<!-- markdownlint-enable MD013 -->

Deterministischer Abschlussreview:

1. Alle T-ACT-R4-Checks ausführen; nur real grüne Nachweise auf PASS setzen.
2. Den finalen Diff gegen Scope-Freeze und Stop-Bedingungen prüfen.
3. R2-SQL-/Produktivnachweise nur übernehmen, wenn kein SQL/RPC/ACL-Delta
   existiert; keine unnötige Remote-Wiederholung.
4. Browserkonsole, Netzwerkzähler und responsive Layouts gemeinsam prüfen.
5. Externes Review, falls vom Owner gewünscht, bewerten und nicht blind fixen.
6. Findings korrigieren und invalidierte Checks wiederholen.

Ergebnis:

- Grüne Nachweise:
  - `[T-ACT-R4-IDs]`.
- Wiederverwendete, nicht invalidierte Nachweise:
  - `[R2-SQL/Produktivnachweise, falls gültig]`.
- Nicht ausgeführte Smokes:
  - `[mit Grund]`.
- Produktiver Iststand:
  - `unverändert; R4 wird nicht produktiv geladen`.
- Externer Review:
  - `[CodeRabbit / nicht erfolgt]`.
- Offene Findings:
  - `[IDs oder none]`.
- Commit-Entscheidung:
  - `commitbereit / S6 offen / blockiert`.

Exit: Relevante lokale und isolierte Browserchecks sind grün; produktive
Verträge wurden nicht verändert.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / Medium`.

Deterministisch:

1. `docs/modules/Activity Module Overview.md` nur mit der tatsächlich
   bewiesenen R4-API, Suche, Historienanzeige und Isolation synchronisieren.
2. `docs/qa/health-capture-reports.md` um `HCR-022` als kompakten
   reproduzierbaren R4-Contract-/Harnesscheck ergänzen.
3. `docs/Future trainingsmodule update thoughts.md`:
   - R4 auf `DONE` setzen;
   - reales Ergebnis und Nachweise knapp ergänzen;
   - R5 als nächsten Rolling-Wave-Schritt markieren;
   - O-8-Zuständigkeit nur gemäß realem Lookupergebnis aktualisieren.
4. `sql/HOW_TO.md` nicht ändern, solange SQL/RPC unverändert blieb.
5. Owner Recap in Alltagssprache schreiben:
   - Suche ist lokal;
   - MIDAS lädt die letzte reale Ausführung;
   - alte Werte sind nur Orientierung;
   - Activity V2 bleibt noch unsichtbar und speichert weiterhin nichts.
6. Finalen Full Contract Review gegen Masterplan, R1-R3/C2, realen Diff,
   Testnachweise und Produktisolation durchführen.
7. Findings korrigieren. Kein In-Scope-P0/P1 darf offen bleiben.
8. Changelog-Relevanz entscheiden. Solange R4 vollständig verborgen bleibt,
   ist `nicht bemerkenswert` zulässig und zu begründen; kein Release-Cut.
9. Resume Card auf Abschluss setzen und Commit-Empfehlung aus dem realen Diff
   ableiten.
10. Roadmap mit `(DONE)` in das Archiv verschieben; keine Evidence-Datei.
11. Kopierfertiges Handoff für den Besprechungschat erstellen: Ziel,
    Änderungen, Nachweise, Grenzen, Restrisiken und R5-Handoff.

Ergebnis:

- Source-of-Truth-Sync:
  - `[Dateien]`.
- Finaler Review:
  - `PASS / Findings`.
- Restrisiken:
  - `R5/R6 aktuelle Eingabe; R7/R8 Recovery/Save; weitere nur wenn real`.
- Changelog:
  - `[Unreleased / nicht bemerkenswert mit Begründung]`.
- Commit-Empfehlung:
  - `[aus realem Diff]`.
- Archivstatus:
  - `[Roadmap (DONE), keine Evidence]`.

Exit: R4 ist bewiesen, dokumentiert und archiviert; R5 darf auf dem realen
R4-Vertrag geplant werden.

---

## Initialer Contract Review der Roadmap

Datum: `2026-08-01`.

Geprüft gegen:

- Root-README und Single-User-/PWA-/No-Build-Vertrag;
- Dev Environment und Roadmap Workflow Contract;
- Activity-V2-Masterplan einschließlich O-7/O-8/O-9;
- Activity Module Overview;
- R1-Katalogbaseline und C2-Katalog-v2-Vertrag;
- reale `semantics`, `semanticsV2`, R2-Data-Access/RPC und R3-Draft/Shell;
- archivierte R2-, R3- und C2-Roadmaps;
- QA HCR-017 bis HCR-021;
- initiale lokale Baseline `56/56` und C2-Katalogcheck PASS.

Reviewtiefe: `Full`.

### Findings und Korrekturen

1. `F-ACT-R4-01`: Der frühere Masterplan sagte nicht präzise, wie ein
   v2-only-Key durch den noch v1-gebundenen R2-JS-Lookup gelangt.
   - Korrektur: Masterplan und R4 definieren die optionale, ausschließlich
     lookup-spezifische Semantikinjektion mit v1-Fallback.
2. `F-ACT-R4-02`: Die gemeinsame R2-Responsevalidierung würde gültige
   historische Snapshots aus einer älteren Katalogversion ablehnen.
   - Korrektur: R4 trennt Lookup- und Commitvalidator; Historie wird streng aus
     ihren Snapshots statt gegen den aktuellen Katalog validiert.
3. Ein erster Entwurf hätte Lookup nur direkt nach manueller Suche ausgelöst.
   Das wäre für Startdraft, R7-Recovery und den späteren R13-Import zu eng.
   - Korrektur: Jedes im Draft neu beobachtete Item erhält denselben einmaligen
     Lookupvertrag.
4. Ein persistenter Historiencache hätte das R3-Draftschema und R7 unnötig
   erweitert.
   - Korrektur: Der Cache bleibt Shell-lokal und flüchtig.
5. Unbegrenzte oder serverseitige Suche hätte unnötige UI-/Querylast erzeugt.
   - Korrektur: lokale C2-Suche, Limit acht, kein Request beim Tippen.
6. Eine direkte Vorbelegung mit alten Sätzen hätte R5 vorgezogen und
   historische mit aktueller Leistung vermischt.
   - Korrektur: vollständige letzte Ausführung ausschließlich read-only.
7. SQL-/Evidence-/Deployarbeit war nach dem realen Scope nicht erforderlich.
   - Korrektur: R4 besitzt keine Evidence-Datei und keine produktiven Gates.
8. Ein verpflichtender Callback oder Lookup direkt beim Mount hätte bestehende
   R3-Consumer gebrochen und versteckte Requests ausgelöst.
   - Korrektur: Callback bleibt optional; Lookup startet erst bei sichtbarem
     `open()`.
9. Eine gewöhnliche Date-Konstruktion aus `YYYY-MM-DD` könnte an einer
   Zeitzonengrenze den falschen Trainingstag anzeigen.
   - Korrektur: Der Success-Formatter behandelt `session.day` als reines,
     tagstabiles Kalenderdatum.

### Fresh-Chat-Test

- Produktkontext ist über Root-README und Activity Module Overview erreichbar.
- Fachliches Zielbild und Roadmapreihenfolge stehen im Masterplan.
- Reale API-/Datenquellen und Lesereihenfolge sind benannt.
- Alle offenen Scopegrenzen und Stop-Bedingungen sind explizit.
- S1 kann ohne Chatverlauf beginnen; fehlende Fakten müssen als Finding statt
  als Annahme behandelt werden.

Ergebnis: `PASS - ready for execution chat`.

Kein bekannter Contract-Widerspruch bleibt offen. S4 bleibt korrekt hinter S1,
S2, S3 und einem `S4R PASS` gesperrt.

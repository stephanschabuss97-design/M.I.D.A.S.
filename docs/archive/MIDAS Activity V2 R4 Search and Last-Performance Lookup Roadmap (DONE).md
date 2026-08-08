# MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap (DONE)

Diese Roadmap erweitert die weiterhin isolierte Activity-V2-Session-Shell um
eine lokale Katalogsuche und die read-only Anzeige der letzten realen
Ausführung. Der produktive Activity-V1-Flow, der Activity-V2-Commitpfad und das
Supabase-Schema bleiben unverändert.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Activity V2 / Suche und Last-Performance-Consumer` |
| Owner / Kontext | `Stephan; private Single-User-PWA für die eigene Trainingsdokumentation` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-01` |
| Letzter Stand | `2026-08-08; S1-S6 einschließlich aller Reviews und Checks PASS; archiviert` |
| Aktueller Schritt | `none; R4 abgeschlossen, R5 ist der nächste Rolling-Wave-Schritt nach Owner-Freigabe` |
| Abgeschlossen am | `2026-08-08` |
| Risikoklasse | `R2` |
| Standard-Reviewtiefe | `Consumer`; `Full` an Datenzugriffs- und Abschlussgrenzen |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `S4R und S4.1: Extra High wegen Katalogversions- und historischem Snapshotvertrag` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `app/modules/vitals-stack/activity/v2/data-access.js`, `data-access.contract.test.js`, `session-shell.js`, `session-shell.css`, `session-shell.contract.test.js`, `session-shell-harness.html`, `semantics-v2.contract.test.js` als C2-Consumerregression |
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

- Ziel: isolierte lokale Catalog-v2-Suche und read-only letzte reale Ausführung
  je ausgewähltem Item; Historie bleibt Gedächtnisstütze, niemals aktuelle Eingabe.
- Unveränderlich: Activity V1/`index.html`, SQL/RPC, `commitSession`, Draftschema,
  Save/Storage, freie Keys und Studio-Katalogmutation bleiben unangetastet.
- Ergebnis: S1-S6 einschließlich Readiness, aller S4-Blöcke, Full Reviews und
  S5-Abschlussmatrix PASS; R4 ist DONE und archiviert.
- API: `loadLastPerformance(itemKey)` bleibt v1-kompatibel; additiv akzeptiert
  nur der Lookup exakt `{ semantics }`. Historische Snapshots werden unabhängig
  von der aktuellen Katalogversion streng validiert.
- UI: lokale 8er-Suche, kanonische Auswahl, vier Historienzustände,
  vollständige read-only Satzblöcke, flüchtiger Cache, Retry und Lifecycle-
  Raceguards im isolierten Harness umgesetzt.
- Nachweise: final frisch `65/65`, Shell `24/24`, Katalog `v2 / 80 / 47 / 58`,
  Syntax/Diff/Isolation, 1440/390/320 und 32-s-Backgroundsmoke PASS.
- CodeRabbit: WSL-CLI `0.7.2`, Agent-Authentifizierung und Codex-Skill bestätigt;
  nach F-ACT-R4-34 endet der Verifikationslauf mit `0 Issues`.
- Doku: Activity Overview, HCR-022, Masterplan und `DEV_ENVIRONMENT.md`
  synchron; keine Evidence-Datei und kein Changelog-Eintrag erforderlich.
- Offene Findings: `none`.
- Restrisiken/Handoff: R5/R6 entscheiden aktuelle Eingaben, R7/R8 Recovery und
  Save/Commit-Kompatibilität, R11 den Produktcutover. Kein R5-R13-Vorgriff.
- Commit-Empfehlung: ein kohärenter R4-Commit; Commit und Push bleiben
  Owner-Aktionen.
- Nächster erlaubter Schritt: R5-Roadmap erst nach ausdrücklicher Owner-Freigabe.

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
| D-ACT-R4-17 | 2026-08-08 | Eine Lookupantwort nach technischem Close darf ausschließlich den flüchtigen Shellcache füllen; sie verändert weder verborgenes DOM noch Status oder Fokus. Erst ein erneutes sichtbares Öffnen rendert den Cache. Nach Destroy sind DOM-, Status- und Cachemutation verboten. | Close ist eine andere Lifecyclegrenze als Remove oder Destroy und benötigt einen eindeutigen Late-Promise-Vertrag. | S2.5, S3.3, S4.3 |
| D-ACT-R4-18 | 2026-08-08 | `open()` führt den ersten Lookupabgleich erst nach erfolgreichem Sichtbarwerden und gesetztem `openState` aus; das transaktionale Hidden-Prerender vor Open bleibt requestfrei. | Der reale R3-Openpfad rendert absichtlich vor `openState=true`; ohne separaten Post-Open-Abgleich würden bereits vorhandene Draftitems keinen Lookup starten. | S2.5, S3.3, S4.3 |
| D-ACT-R4-19 | 2026-08-08 | Während eines laufenden Close-/Discard-Guards dürfen Lookupantworten nur den Cache füllen. Cancel oder Guardfehler löst genau einen fokusneutralen Lookup-Abgleich aus; bestätigtes Close rendert nichts mehr. Lookup-Abschlüsse ersetzen weder die Itemliste noch Guardstatus oder aktives Element. | Ein DOM-Rebuild während asynchroner Bestätigung könnte den gespeicherten Fokusanker ablösen und den R3-Closevertrag brechen. | S2.5, S3.3, S4.3 |
| D-ACT-R4-20 | 2026-08-08 | Suche verwendet native Ergebnisbuttons, geschlossene deutsche Equipmentlabels, leert Query und Ergebnisliste nach Auswahl und fokussiert die programmatisch fokussierbare Itemzeile. | Touch-, Tastatur-, Duplicate- und sichtbare Copy-Pfade benötigen ein eindeutiges Ende ohne technische Enumtexte. | S2.3, S2.4, S4.2 |
| D-ACT-R4-21 | 2026-08-08 | Ungültige Lookup-Options oder eine ungültige injizierte Semantik scheitern vor Transport als bestehender `REQUEST_FAILED`-Fehler mit `operation=loadLastPerformance` und `retryable=false`; ein ungültiger Key bleibt `INVALID_ITEM_KEY`. | R4 erweitert die bestehende R2-Fehlertaxonomie nicht und trennt Konfigurations- von Keyfehlern. | S2.1, S4.1 |
| D-ACT-R4-22 | 2026-08-08 | Der historische Lookupvalidator prüft das exakte R2-Snapshot-/Werteschema unabhängig vom aktuellen Katalog. Datum erscheint direkt aus `session.day` als `DD.MM.YYYY`; Zahlen verwenden ohne Gruppierung höchstens zwei Dezimalstellen und deutsches Komma. | Strenge Cross-Version-Validierung und tagstabile, reproduzierbare read-only Anzeige dürfen weder Current-Catalog-Vergleich noch lokale Zeitzonenumrechnung benötigen. | S2.2, S2.6, S4.1, S4.3 |
| D-ACT-R4-23 | 2026-08-08 | Die Shell projiziert jede gültige Lookupantwort beim Settlement in ein eigenes unveränderliches Displaymodell und cached niemals die mutable Rohantwort des Callbacks. | `dataAccess` validiert streng, friert die Rückgabe aber aus Kompatibilitätsgründen nicht ein; spätere Fremdmutation darf Reopen oder DOM nicht verändern. | S2.5, S3.2, S4.3 |
| D-ACT-R4-24 | 2026-08-08 | Der R3-Fokustrap nimmt den Suchinput auf; programmatisch fokussierbare Itemzeilen bleiben aus der Tabreihenfolge. Delegierte Aktionen werden per begrenztem Vorfahrenlauf bis zum echten Actionbutton aufgelöst. | Verschachtelte Label-/Equipmentknoten dürfen Klick/Touch nicht verschlucken, und der neue Input darf den bestehenden Dialogtrap nicht verlassen. | S2.3, S2.4, S3.3, S4.2 |
| D-ACT-R4-25 | 2026-08-08 | Der isolierte Harness injiziert `semanticsV2` und lokale deterministische Success-/Empty-/Error-/Slow-Fakes. Der reale `dataAccess.loadLastPerformance`-Wrapper wird in Contracttests bewiesen, nicht durch einen Remote-Harnessrequest. | Der Harness soll Zustände reproduzierbar zeigen, ohne Supabase-Konfiguration, Auth oder Netzwerk in R4 einzuführen. | S2.5, S3.4, S4.4 |
| D-ACT-R4-26 | 2026-08-08 | Der S4.1-Diff darf in `data-access.js` nur lookup-spezifische Konstanten/Helper, `normalizeLookupKey`, `validateLookupResponse` und `loadLastPerformance` ändern oder ergänzen. `getSemantics`, Commitnormalisierung/-validatoren, `validateSetResponse`, `validateItemResponse`, `callRpc`, `commitSession` und der öffentliche Methodensatz sind geschützte Vergleichszonen. | Der additive Read-Vertrag darf nicht durch einen scheinbar gemeinsamen Refactor den bereits produktiven Commitpfad verändern. | S4R, S4.1, T-ACT-R4-03 |
| D-ACT-R4-27 | 2026-08-08 | S4 wird nach Freigabe in vier Blöcken ausgeführt: A = S4.1; B = S4.2+S4.3 mit getrennten Ergebnissen; C = S4.4; D = S4.5. Jeder Block endet mit seiner zugeordneten Regression, Block B und D mit Full Review. | Data Access ist separat rollbackfähig; Search und Lookup teilen State/DOM; Browserpolitur benötigt das finale DOM; der Abschlussreview bleibt unabhängig. | S4R, S4 |
| D-ACT-R4-28 | 2026-08-08 | S4.5 und S5 dürfen nach ausdrücklicher Owner-Freigabe in demselben Turn, aber nur als zwei sequenzielle Gates laufen: S5 beginnt ausschließlich nach dokumentiertem S4.5-PASS ohne offene P0/P1; jede S4.5-Korrektur invalidiert ihre betroffenen Nachweise und erzwingt eine frische S5-Prüfung. Bei Blocker oder Grundsatzkonflikt stoppt der Turn vor S5. | Spart einen Übergabetun, ohne den integrierten Review mit der unabhängigen Abschlussmatrix zu vermischen. | S4.5, S5 |
| D-ACT-R4-29 | 2026-08-08 | S4.5 bleibt der native integrierte Code-/Contractreview. CodeRabbit läuft erst nach der vollständigen lokalen und Browser-S5-Matrix als zusätzlicher externer Abschlussreview; berechtigte Korrekturen invalidieren und wiederholen ihre betroffenen S5-Checks. | Entspricht dem etablierten Owner-Workflow und verhindert, dass ein optionaler externer Review das vorgelagerte S4.5-Gate ersetzt. | S4.5, S5, S6 |
| D-ACT-R4-30 | 2026-08-08 | In zukünftigen Roadmaps entfällt ein separater S4.5-Schritt; der native Abschlussreview und der anschließend auszuführende CodeRabbit-Review werden als sequenzielle Gates in S5 geplant. R4 behält seine bereits ausgeführte historische Schrittstruktur. | Verankert den Owner-Workflow ohne eine laufende Roadmap rückwirkend umzunummerieren. | zukünftige Roadmaps, Workflow-Handoff S6 |
| D-ACT-R4-31 | 2026-08-08 | R4 erhält keinen Changelog-Eintrag. | Die Änderung bleibt vollständig im isolierten Harness, erzeugt keine sichtbare Produkt-, Betriebs-, Daten- oder Security-Wirkung und schneidet kein Release. | S6, Changelog |
| D-ACT-R4-32 | 2026-08-08 | Der kanonische agentische CodeRabbit-Pfad ist die vorhandene Codex-Skill plus WSL-CLI unter `/root/.local/bin/coderabbit`; keine zweite Windows-CLI, `npx`-Skillkopie oder Repo-Dependency. Installation, Auth und S5-Reihenfolge stehen in `DEV_ENVIRONMENT.md`. | Verhindert doppelte Installationen und macht den externen Review für künftige Roadmaps reproduzierbar. | S6, Dev Environment |

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
  - unverändert; nur ein flüchtiger per-Mount-Shellcache mit unveränderlichem
    Displaymodell, Post-Open-Abgleich, Close-Guard- und Destroy-Grenze kommt
    hinzu.
- Cleanup, Scheduler, Secrets und externe Automationen:
  - nicht betroffen.
- Kompatible Producer und Consumer:
  - Producer: C2 `semanticsV2.search()` und R3-Draftitems;
  - Consumer: R4-Shell;
  - Read-Backend: unveränderter R2-RPC;
  - alter R2-Ein-Argument-Lookup und R3-Mount ohne Lookupcallback bleiben
    kompatibel.
  - der isolierte Harness konsumiert lokale Lookupfakes; die reale Data-Access-
    Verdrahtung bleibt ein Contracttest und späterer Produktconsumervertrag.
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
| S1 | System- und Vertragsdetektivarbeit | `High` | PASS | APIs, Datenfluss, zwei belegte JS-Versionsblocker, SQL-/R3-Verträge und frische `56/56`-/Katalog-/Isolationsbaseline belegt; F-ACT-R4-14 geschlossen. |
| S2 | Such-, Lookup- und UI-Zielvertrag | `High` | PASS | Additive Lookup-Injection, snapshotbasierte v1/v2-Responseprüfung, lokale 8er-Suche, Fokus/Copy, vier Zustände und flüchtiger Raceguard-Cache eingefroren; F-ACT-R4-15 bis -19 geschlossen. |
| S3 | Race-, Security- und Umsetzungsreview | `High` | PASS | State Machines, mutable-response-/Fokus-/Event-/Harnessgrenzen, Close-/Destroy-Races, Rollback, vier sichere S4-Blöcke und T-ACT-R4-01 bis -14 finalisiert; F-ACT-R4-20 bis -23 geschlossen. |
| S4R | S4 Readiness Review | `Extra High` | PASS | Scope-Freeze und Vor-S4-Code grün; D-ACT-R4-26/-27, vier Blöcke, vollständige T-ACT-R4-01-bis--14-Zuordnung und Invalidation final; F-ACT-R4-24 bis -26 geschlossen. |
| S4.1 | Lookup-spezifische Semantikinjektion | `Extra High` | PASS | Exakte optionale Semantikinjektion, v1-Fallback und separater historischer Snapshotvalidator umgesetzt; `59/59`, D-ACT-R4-26 und Isolationsscan grün, kein neues Finding. |
| S4.2 | Lokale Suche und kanonische Auswahl | `High` | PASS | Catalog-v2-Suche mit Limit acht, kanonischen nativen Buttons, deutscher Equipmentcopy, Duplicate-/Kindklick-/Tastatur-/Fokusvertrag und requestfreiem Tippen umgesetzt; F-ACT-R4-28/-29 geschlossen. |
| S4.3 | Last-Performance-Zustände und Races | `High` | PASS | Optionaler Callback, vier Zustände, unveränderliches Displaymodell, vollständige read-only Historie, flüchtiger Cache, Retry und Remove-/Close-/Guard-/Destroy-Raceguards umgesetzt; F-ACT-R4-27 geschlossen. |
| S4.4 | Responsive/A11y und Harness | `High` | PASS | Sichtbarer Search-Fokus und eindeutiger mobiler Close-Button korrigiert; deterministischer Long-/Hostile-Text-Harness, lokale Lookupzähler, 1440/390/320-Matrix und 32-s-Backgroundsmoke grün; F-ACT-R4-30/-31 geschlossen. |
| S4.5 | Integrierter Full Review | `High` | PASS | Nativer Full Review des Gesamtdiffs grün; F-ACT-R4-33 schließt die strikte Kalender-/Zeitvalidierung an der direkten Shell-Callbackgrenze. Shell 24/24, Data Access 13/13, Syntax/Katalog/Diff/Isolation grün; keine offenen P0/P1. |
| S5 | Contract-, Browser- und Abschlusschecks | `High` | PASS | T-ACT-R4-01 bis -14 frisch grün; 65/65 Contracttests, drei Viewports, 32-s-Background, Produktisolation und CodeRabbit-Verifikation mit 0 Findings. F-ACT-R4-34 geschlossen. |
| S6 | Doku-Sync, Commit und Archiv | `Medium` | PASS | Activity Overview, HCR-022, Masterplan und Dev Environment synchron; finaler Full Review und 65/65 grün, Scope unverändert, kein Changelog/Deploy/Evidence, CodeRabbit-Setup verifiziert und Roadmap archiviert. |

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
| F-ACT-R4-14 | P1 | Lifecycle | fixed | Late Promise nach Close war gegenüber Remove/Destroy nicht eindeutig; D-ACT-R4-17 sowie S2.5/S3.3 trennen Cachefüllung, sichtbares Rendern und Destroy. |
| F-ACT-R4-15 | P1 | Lifecycle | fixed | Der reale R3-Openpfad rendert vor `openState=true`; D-ACT-R4-18 verlangt einen separaten Post-Open-Abgleich für bereits vorhandene Draftitems. |
| F-ACT-R4-16 | P1 | Lifecycle/A11y | fixed | Lookup-DOM-Patches während eines laufenden Close-Guards konnten den Fokusanker ablösen; D-ACT-R4-19 friert Cache-only und den Cancel-/Confirm-Nachlauf ein. |
| F-ACT-R4-17 | P1 | Contract/Data | fixed | Optionsfehlermapping und historische Snapshotgrenzen waren nicht vollständig exakt; D-ACT-R4-21/-22 und S2.1/-2 schließen Fehlercode, Enums, Policy- und Wertevertrag. |
| F-ACT-R4-18 | P2 | UX | fixed | Search-Close/Reset, Duplicate-Fokus, Equipmentcopy sowie Datums-/Zahlenformat waren unterbestimmt; D-ACT-R4-20/-22 und S2.3/-4/-6 frieren sie ein. |
| F-ACT-R4-19 | P2 | Process/Scope | fixed | Der Abschlusscheck erkannte eine vorgezogene S3.3-Textänderung; sie wurde auf den HEAD-Stand zurückgeführt, während die fachliche Racegrenze ausschließlich in Decision Log und S2 verbleibt. |
| F-ACT-R4-20 | P1 | Data/Security | fixed | Eine rohe validierte Callbackantwort bleibt in R2 mutable; D-ACT-R4-23 verlangt vor Cacheaufnahme ein Shell-eigenes unveränderliches Displaymodell und einen Retained-Mutation-Test. |
| F-ACT-R4-21 | P1 | A11y/Interaction | fixed | Der reale R3-Fokustrap kennt noch keinen `input`, und direkte `event.target`-Auswertung würde verschachtelte Resultinhalte verlieren; D-ACT-R4-24 schließt beide Grenzen. |
| F-ACT-R4-22 | P1 | Isolation/Architecture | fixed | Der S2-Ergebnistext band den Harness widersprüchlich an reales Data Access, obwohl S4.4 deterministische Fakes verlangt; D-ACT-R4-25 trennt Browserzustände von der Contracttest-Integration. |
| F-ACT-R4-23 | P1 | Verification/Lifecycle | fixed | T-ACT-R4-06/-14 und der Backgroundcheck deckten Post-Open, technisches Close, laufenden Discard-Guard und die belegten 32 Sekunden noch nicht vollständig ab; S3.5/S5 wurden ergänzt. |
| F-ACT-R4-24 | P1 | Verification/API | fixed | Der optionale Callbackvertrag war in T-ACT-R4-05/-14 nicht atomar genug: fehlend/ungültig, Sync-Throw, Non-Thenable, Thenable/Promise und Einmalaufruf sind nun explizit. |
| F-ACT-R4-25 | P1 | Contract/Change-Isolation | fixed | „commitSession unverändert“ besaß noch keine konkrete Source-Diff-Grenze; D-ACT-R4-26 definiert geschützte Funktionen und den einzigen zulässigen Lookupbereich. |
| F-ACT-R4-26 | P2 | Verification/Mapping | fixed | S4.2 war T-ACT-R4-08 pauschal zugeordnet, obwohl dieser Historien-/Draftschutz erst S4.3 betrifft; S4R- und Substepmatrix sind präzisiert. |
| F-ACT-R4-27 | P1 | Contract/Data | fixed | Die erste Shellprojektion prüfte Feldmengen und Werte, aber nicht alle internen historischen Policy-/Comparability-Invarianten; roter Regressionstest und `assertLookupPolicySnapshot` schließen die direkte Callbackgrenze. |
| F-ACT-R4-28 | P1 | Verification/Mapping | fixed | Der reale C2→R3-Consumer-Test erwartete noch den entfernten Select und fehlte im S4.2-Dateimapping; er prüft jetzt Search-/Duplicate-Copy, und `semantics-v2.contract.test.js` ist als Consumerregression zugeordnet. |
| F-ACT-R4-29 | P1 | A11y/Interaction | fixed | Nach Search-Escape öffnete `ArrowDown` die erhaltene Query nicht erneut; roter Tastaturtest und begrenzter Keydown-Fix stellen D-ACT-R4-20/-24 vollständig her. |
| F-ACT-R4-30 | P1 | A11y/CSS | fixed | Der neue Suchinput war im Fokustrap, fehlte aber im sichtbaren `:focus-visible`-Selektor; roter CSS-Vertrag und additive Inputaufnahme schließen die Tastaturgrenze. |
| F-ACT-R4-31 | P1 | Responsive/Copy | fixed | Die höher spezifische allgemeine Buttonregel überstimmte auf 390/320 px die transparente Close-Copy, sodass „Schließen“ abgeschnitten erschien; scoped Mobile-Selector und `font-size: 0` zeigen nun eindeutig `×` bei unverändertem Accessible Name. |
| F-ACT-R4-32 | P2 | Tooling/Verification | fixed | CodeRabbit 0.7.2 ist in WSL installiert und der Owner hat den Agent-Login erfolgreich abgeschlossen; `auth status --agent` bestätigt `authenticated`. D-ACT-R4-29 ordnet den externen Review wieder dem Abschluss von S5 zu. |
| F-ACT-R4-33 | P1 | Contract/Validation | fixed | Die direkte Shell-Callbackgrenze prüfte Lookup-Zeitstempel nur auf das Textformat und akzeptierte unmögliche Monate, Kalendertage oder Uhrzeiten; ein roter Regressionstest und die deterministische Kalender-/Zeitprüfung verwerfen diese Antworten nun als neutralen Error-Zustand. Data Access, SQL, Draft und Commitpfad bleiben unverändert. |
| F-ACT-R4-34 | P2 | Verification/Test robustness | fixed | CodeRabbit erkannte, dass der statische `formatLookupDay`-Slice bei fehlenden Funktionsmarkern leer und damit fälschlich grün sein konnte; explizite Positionsassertionen schließen den False-Pass. Vollsuite danach 65/65, erneuter CodeRabbit-Review 0 Findings. |

<!-- markdownlint-enable MD013 -->

S4.1-Reviewstand: F-ACT-R4-01/-02/-17/-25 sind im erlaubten Lookupbereich
umgesetzt. Block-B-Reviewstand: F-ACT-R4-27 bis -29 sind technisch und fachlich
berechtigt, korrigiert und regressionsgeprüft; kein Finding bleibt offen.

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Abgeschlossenes Ergebnis:
<!-- markdownlint-disable MD013 -->
- Klassische Scripts ohne Root-Buildsystem registrieren eingefrorene APIs unter `AppModules.activityV2`; `index.html` lädt nur Activity V1.
- `semantics`/`semanticsV2`: `getCatalog`, `getEntryByKey`, `normalizeSearchText`, `validateCatalog`, `search`; v1 = 78/Version 1, v2 = 80/Version 2 und additiv.
- `dataAccess`: `commitSession`, `loadLastPerformance`; `sessionDraft`: `create` plus sieben Controllermethoden; `sessionShell`: `mount` plus `open`, `render`, `requestClose`, `isOpen`, `destroy`.
- Datenfluss: `Suchtext -> semantics.search({ limit: 8 }) -> item_key -> draft.addItem -> loadLastPerformance({ semantics }) -> Snapshot/null -> read-only DOM`.
- Belegte JS-Blocker: globales v1 in `normalizeLookupKey()` und Current-Catalog-Vergleiche in `validateItemResponse()`; Commitrequest/-response bleiben v1-gebunden und unverändert.
- SQL ist ausreichend: Security Invoker/leerer Search Path, Auth-/Ownerbindung, Keyprüfung, `started_at desc, session.id desc`, `null`, kompletter Itemblock und Sets nach `set_order`.
- R3-Hidden-Mount, Open/Render/Fokus/Timer, Close/Discard/Destroy sind belegt; der spätere Lookupcallback bleibt optional.
- Frische Baseline: `56/56` Tests, Katalogcheck PASS (`v2/80/47 Aliase/58 Suchen`) und Produktload-/V1-Isolationsscan PASS.
- Fakten stammen aus dem Repo; keine implementierungsentscheidende Annahme. F-ACT-R4-14 wurde über D-ACT-R4-17 geschlossen.
- R4 invalidiert später nur betroffene R2-JS-, R3-Shell-/Browser- und C2-R3-Injectionchecks; R1, SQL-Fixtures und produktive Postchecks bleiben bei unveränderten Sources gültig. Kein SQL, Evidence oder Deploy.
- Full Contract Review PASS gegen alle Pflichtquellen und Scopegrenzen; offene Fragen `none`.

<!-- markdownlint-enable MD013 -->

S1-Status: `PASS`.

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
   dem eigenen Feld `semantics`; fehlende, `undefined`-, fremde String- oder
   Symbolfelder und ungültige APIs scheitern lokal vor Transport. Die
   injizierte Semantik benötigt mindestens `getCatalog()` und
   `getEntryByKey()`; der Katalog trägt eine positive Ganzzahlversion und der
   gefundene Entry muss den exakten angefragten Key zurückgeben.
4. Ohne `options.semantics` bleibt das bisherige
   `AppModules.activityV2.semantics`-Fallback erhalten.
5. R4 übergibt immer dieselbe Semantikinstanz an Shell und Lookup, im Harness
   `semanticsV2`.
6. `commitSession` verwendet weiterhin seinen bisherigen v1-Vertrag und wird
   in R4 weder signatur- noch verhaltensseitig geändert.
7. Lookupinput verwendet unverändert nur ASCII-`btrim`, Längenlimit `1..64`
   und den kanonischen Lowercase-Keyregex. Es findet keine Suchtext- oder
   Aliasnormalisierung statt. Danach wird der Key gegen
   `semantics.getEntryByKey()` geprüft.
8. Das RPC-Requestbody bleibt exakt `{ p_item_key: canonicalKey }`.
9. Ungültiger Key bleibt `INVALID_ITEM_KEY`. Ungültige Options, fehlende oder
   fehlerhafte Semantik und lokaler Semantikzugriffsfehler werden
   `REQUEST_FAILED` mit `operation=loadLastPerformance`, `retryable=false`,
   ohne `commitState` und ohne Transport. Es entsteht kein neuer Domaincode.
10. Commitgeschützte Konstanten, Normalisierung, Request-/Responsevalidator,
    RPC-Body, Fehlerzustände und `commitSession` selbst bleiben unverändert.
    Der Lookup erhält eigene Options- und historische Responsepfade statt einer
    Lockerung der gemeinsamen Commitvalidierung.

### S2.2 - Historische Responsevalidierung

Der Lookupvalidator wird von der Commitresponsevalidierung getrennt:

- `null` bleibt ein gültiges Ergebnis.
- Eine Nicht-null-Antwort besitzt exakt `item`, `schema_version` und `session`;
  `schema_version` bleibt exakt `midas.activity-last-performance.v1`.
- `session` besitzt exakt `id`, `started_at` und `day`. ID wird mit dem
  bestehenden UUID-Helfer, Timestamp im bestehenden sechsstelligen UTC-
  Responseformat und ISO-Tag als echter Kalendertag validiert.
- `item.item_key` muss exakt dem angefragten kanonischen Key entsprechen.
- `catalog_version` muss eine Ganzzahl in `1..2147483647` sein, aber nicht der
  aktuell ausgewählten Katalogversion entsprechen.
- Das Item besitzt exakt die R2-Felder `id`, `catalog_version`, `item_key`,
  `item_order`, fünf Snapshotfelder, `duration_min`, `distance_km`, `note`,
  `created_at` und `sets`. ID und Timestamp verwenden dieselben strengen
  Responsehelfer wie die Session; `item_order` liegt in `1..50`.
- `item_label_snapshot` ist getrimmt und `1..80` Unicode-Codepoints lang.
  `tracking_mode_snapshot` ist exakt `strength_sets`, `duration` oder
  `duration_distance`.
- `equipment_snapshot` ist exakt einer der R1-Werte `barbell`, `bodyweight`,
  `cable`, `cardio_machine`, `dumbbell`, `kettlebell`, `machine`, `none` oder
  `variable`; `load_comparability_snapshot` ist `device_relative`,
  `not_applicable` oder `standardized`.
- `field_policy_snapshot` besitzt exakt die acht R1-Felder und ausschließlich
  `forbidden`, `optional` oder `required`. Trackingmode, Primärmessung,
  Itemfelder, höchstens eine Lastart und Load-Comparability müssen denselben
  internen R1-Invarianten folgen wie beim gespeicherten Snapshot. Der Snapshot
  wird nicht mit dem heutigen Catalog-v2-Entry überschrieben oder verglichen.
- Diese R1-Invarianten sind implementierungsverbindlich: `note` ist immer
  `optional`; `strength_sets` besitzt genau eine `required`-Primärmessung aus
  `reps`/`duration_sec`/`distance_m`, die anderen beiden sind `forbidden`,
  Itemdauer/-distanz sind `forbidden` und höchstens eine Lastart ist aktiv.
  `duration` verlangt nur `duration_min`; `duration_distance` verlangt
  `duration_min` und erlaubt `distance_km` optional; beide verbieten Setfelder
  und Lastarten.
- Ohne aktive Last ist Comparability `not_applicable`; Assistance verlangt
  `device_relative`; Weight erlaubt `device_relative` oder `standardized`,
  wobei `cable`, `machine` und `variable` ausschließlich `device_relative`
  erlauben.
- Top-level-Itemwerte und jeder Setwert müssen den gespeicherten
  Field-Policy-Snapshot einhalten.
- `strength_sets` besitzt `1..50` Sätze und keine Itemdauer/-distanz;
  `duration`/`duration_distance` besitzen keine Sätze und die jeweils
  erforderlichen/optionalen Itemwerte gemäß Snapshot.
- Jeder Satz besitzt ausschließlich das exakte R2-Responseschema, eine
  streng validierte ID/Erstellzeit, `tracking_mode=strength_sets`, genau eine
  Primärmessung, höchstens eine Lastart und `set_order` exakt `1..N` in der
  gelieferten Arrayreihenfolge.
- Zahlen bleiben exakt im R2-Bereich: `duration_min 1..1440`,
  `distance_km 0,01..1000`, `reps 1..1000`, `duration_sec 1..3600`,
  `distance_m 0,1..10000` und beide Lastarten `0,01..1000`; Dezimalfelder
  besitzen höchstens zwei Nachkommastellen. Itemnotiz ist `null` oder
  ASCII-getrimmt, nicht leer und höchstens 500 Unicode-Codepoints lang.
- IDs, Timestamps, Zahlen, optionale Texte und exakte Feldmengen bleiben
  fail-closed; es findet keine stillschweigende Normalisierung einer Response
  statt.
- Der Lookupvalidator darf reine bestehende Zahlen-/Text-/Timestamphelfer
  wiederverwenden, aber weder `validateItemResponse()` noch dessen Current-
  Catalog-Vergleiche für historische Antworten aufrufen.
- Die bestehende Commitresponsevalidierung bleibt unverändert an den aktuell
  commitfähigen Katalog gebunden.

### S2.3 - Lokaler Suchvertrag

- R4 ersetzt den vollständigen `<select>`-Picker durch ein beschriftetes
  `input type=search` und eine begrenzte Liste nativer Ergebnisbuttons.
- Query wird ausschließlich von `semantics.search(query, { limit: 8 })`
  verarbeitet. R4 implementiert kein zweites Ranking und keine Aliaslogik.
- `normalizeSearchText(query)` dient nur zur Unterscheidung von Start- und
  Kein-Treffer-Zustand. Das Suchergebnis muss ein Array mit höchstens acht
  eindeutigen aktiven Keys sein; jeder Key wird nochmals über
  `getEntryByKey()` gegen den eingefrorenen aktuellen Katalog aufgelöst.
  Label und Equipment kommen aus diesem kanonischen Entry, nicht aus einem
  ungeprüften Ergebnisobjekt. Throw oder Malformed Result erzeugt eine sichere
  Suchfehlermeldung und keine Draftmutation.
- Leere oder nach Normalisierung leere Query zeigt einen kurzen Start-Hinweis,
  keine 80 Einträge.
- Kein Treffer zeigt: `Keine passende Übung oder Aktivität gefunden.`
- Kein Treffer bietet keinen freien Text-Save und keine Katalogmutation an.
- Ergebniszeilen zeigen Label und ein geschlossenes deutsches Equipmentlabel:
  `Langhantel`, `Körpergewicht`, `Kabelzug`, `Cardiogerät`, `Kurzhantel`,
  `Kettlebell`, `Maschine`, `Ohne Gerät` oder `Variable Ausstattung`. Rohe
  Enums und der kanonische Key sind keine dominante UI-Copy; der Key darf nur
  als technische DOM-Identität vorhanden sein.
- Auswahl per Touch/Klick und Tastatur fügt exakt den Trefferkey hinzu.
- Da Ergebnisbuttons Label und Equipment in Kindknoten darstellen dürfen, löst
  die Eventdelegation das Actioncontrol über einen begrenzten Vorfahrenlauf
  innerhalb des Panels auf; ein Kindklick bleibt dieselbe kanonische Auswahl.
- Bereits im Draft enthaltene Treffer werden als vorhanden behandelt. Auswahl
  fokussiert den bestehenden Eintrag und erzeugt weder Duplikat noch neuen
  Lookup.
- Nach erfolgreicher oder Duplicate-Auswahl werden Query und Ergebnisliste
  geleert/geschlossen. Ein Such- oder Draftfehler erhält die Query und zeigt
  eine sichere Statusmeldung ohne Draftteilmutation.
- Keine Serverabfrage, kein Debounce-Netzwerkpfad und kein Vollkatalogfilter im
  Shellcode.

### S2.4 - Accessibility- und Fokusvertrag

- Suchfeld besitzt sichtbares Label, eindeutige ID, `aria-controls` auf die
  Ergebnisliste und korrektes `aria-expanded`.
- Ergebnisliste ist eine semantische Liste; jeder Treffer ist ein echter
  fokussierbarer Button. Bereits vorhandene Treffer bleiben aktiv auswählbar,
  tragen aber sichtbar `Bereits in Session` und führen nur zum bestehenden
  Item.
- `ArrowDown` aus dem Suchfeld fokussiert den ersten Treffer, sofern vorhanden.
- `Enter` wählt den fokussierten Treffer beziehungsweise den ersten sichtbaren
  Treffer nur bei nicht leerer Ergebnisliste.
- `Escape` im Suchkontext schließt zunächst nur die offene Ergebnisliste,
  erhält den Suchtext und stoppt Propagation. Erst ein weiterer Escape ohne
  offene Suche erreicht den bestehenden R3-Close-/Discard-Guard. Neue Eingabe
  oder `ArrowDown` öffnet passende Ergebnisse erneut.
- Nach Auswahl liegt der Fokus am hinzugefügten beziehungsweise bereits
  vorhandenen Item. Die Itemzeile ist dafür ausschließlich programmatisch über
  `tabindex=-1` fokussierbar und wird nicht zu einem zusätzlichen Tabstopp.
  Nach Entfernen greift der bestehende R3-Fokusvertrag.
- Der bestehende Dialog-Fokustrap umfasst nach dem Select-Ersatz mindestens
  `button`, `input`, `select` und `textarea`; `tabindex=-1`-Itemzeilen bleiben
  dabei ausdrücklich außerhalb der normalen Tabreihenfolge.
- Statusänderungen und Lookupfehler werden über die bestehende Live-Region
  beziehungsweise eine klar zugeordnete Item-Statusregion verständlich.
- Controls erfüllen auch bei 320 px Breite stabile Touchziele und werden nicht
  vom Text verbreitert.

### S2.5 - Lookup-Lifecycle und Cache

- Der Shell-Mount akzeptiert optional eine Funktion `loadLastPerformance`.
  Wenn sie übergeben wird, muss sie eine Funktion sein und pro Key einen
  Promise-/Thenablepfad auf die bereits data-access-validierte Lookupantwort
  oder `null` liefern. Synchrones Throw, Reject und ungültige Erfolgsform
  werden zum Shellzustand `error`.
- Ohne Callback bleibt der bestehende R3-Flow vollständig nutzbar. Die Shell
  zeigt dann keinen irreführenden Loading-, Empty- oder Error-Historienbereich
  und startet keinen Lookup.
- Ein R4-Consumer bindet den Read-Pfad außerhalb der Shell mit derselben
  Semantikinstanz, beispielsweise konzeptionell als
  `key => dataAccess.loadLastPerformance(key, { semantics })`. Die Shell löst
  weder `dataAccess` noch einen Katalogglobal selbst auf.
- Die Shell benötigt für R4 eine Semantik mit `search`, `normalizeSearchText`,
  `getCatalog` und `getEntryByKey`.
- Mount und das bestehende transaktionale Hidden-Prerendern bleiben
  requestfrei. Nach erfolgreichem Sichtbarwerden, gesetztem `openState` und
  gebundenem Lifecycle führt `open()` explizit den ersten Lookupabgleich aus.
  Jeder spätere vollständige `render()` gleicht nur bei sichtbarer offener
  Shell die Draftitems erneut ab; reine Timerrepaints starten keinen Lookup.
- Für jeden Key ohne Status beginnt genau ein Lookup. Damit funktionieren neu
  gesuchte, bereits im Startdraft vorhandene und später importierte Items über
  denselben Vertrag.
- Zustände je Key:
  - `loading`
  - `success`
  - `empty`
  - `error`
- `success` und `empty` bleiben bis zum Destroy gecacht. Vor Cacheaufnahme
  projiziert die Shell die validierte Callbackantwort in ein eigenes tief
  unveränderliches Displaymodell; die mutable Rohantwort wird nicht gehalten.
  Remove und Re-Add verursachen keinen zweiten Request.
- Wird ein Item während eines laufenden Requests entfernt, darf dessen spätes
  Ergebnis ausschließlich den Shell-lokalen Cache füllen, nicht das DOM oder
  den Draft. Ein Re-Add kann diesen Cache anschließend verwenden.
- `error` zeigt einen Retry-Button. Nur dessen bewusste Aktivierung startet
  eine neue Generation; Doppelklicks/weitere Retries während `loading` werden
  koalesziert und der Retry-Button ist deaktiviert.
- Es gibt keine automatische Retryschleife.
- Responsegeneration und Shellzustand verhindern, dass alte oder nach Destroy
  eintreffende Antworten DOM oder Status verändern.
- Ein zulässiger asynchroner Abschluss aktualisiert ausschließlich die
  Historienregion der betroffenen noch vorhandenen Itemzeile. Er führt keinen
  vollständigen Shellrender aus und verändert weder globalen Status noch
  aktuelles Fokusziel.
- Endet ein Lookup nach technischem Close, darf das Ergebnis ausschließlich
  den flüchtigen Cache füllen. Verborgenes DOM, Status und Fokus bleiben
  unverändert; ein späteres `open()` rendert den Cache erneut gegen die dann
  vorhandenen Draftitems.
- Während `requestClose()` auf Confirm/Discard wartet, dürfen Antworten nur
  den Cache füllen. Bei Cancel oder Guardfehler wird genau einmal fokusneutral
  gegen offene Draftitems abgeglichen; der bestehende Guardstatus und das
  wiederhergestellte Fokusziel bleiben erhalten. Bei bestätigtem Close/Discard
  erfolgt kein DOM-Patch.
- Nach `destroy()` darf eine verspätete Antwort weder Cache noch DOM, Status
  oder Fokus verändern.
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

Konkret wird der bereits validierte `session.day`-String `YYYY-MM-DD` direkt in
`DD.MM.YYYY` umgestellt; es wird dafür kein `Date` erzeugt. Zahlen werden ohne
Tausendergruppierung, ohne unnötige Nachkommastellen, mit höchstens zwei
Dezimalstellen und deutschem Komma angezeigt.

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
- kanonische Kraftdarstellung ist abhängig vom Snapshot beispielsweise
  `12 × 77,5 kg`, `12 × 40 kg Unterstützung`, `12 Wiederholungen`,
  `45 s · 20 kg` oder `30 m · 40 kg`; optionale Last fehlt vollständig, wenn
  ihr Snapshotwert `null` ist;
- Dauerwerte erscheinen als `45 min`, Itemdistanz beispielsweise als
  `5,25 km`;
- optionale historische Itemnotiz wird als Text gerendert;
- die aktuelle Itemzeile behält das Label aus der injizierten aktuellen
  Semantik. Wenn der Historienbereich Label oder Equipment der damaligen
  Ausführung wiederholt, verwendet er ausschließlich die historischen
  Snapshotwerte und nie umgeschriebene Current-Catalog-Werte;
- historische Daten sind visuell als `Letzte Ausführung` abgegrenzt und besitzen
  keine Checkbox, kein Eingabefeld und keinen Erledigtstatus.

### S2.7 - Fehler- und Sicherheitsvertrag

- Invalides Such-/Katalogobjekt scheitert beim Mount fail-closed.
- Ungültiger Lookupinput erzeugt keinen Request.
- Ungültige Lookupoptions/-semantik verwendet ausschließlich den bestehenden
  sicheren `REQUEST_FAILED`-Vertrag; interne Options- oder Katalogdetails
  erscheinen nicht in der UI.
- Malformed RPC-Success wird vom Data Access über den bestehenden
  `REQUEST_FAILED`-Pfad abgewiesen; eine vom Callback dennoch gelieferte
  ungültige Erfolgsform wird in der Shell zu `error` und nie ungeprüft
  gerendert.
- Eine nach Settlement durch den Callback-Producer mutierte Rohantwort kann
  weder Cache, Reopen-Darstellung noch bereits gerendertes DOM verändern.
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

- S2.1-S2.7 sind der vollständige Zielvertrag: additiver v1-kompatibler Lookup,
  eigener historischer Validator, lokale 8er-Suche, Fokus/Copy, vier Zustände
  und read-only Anzeige.
- Gewählte Umsetzung: eigener Lookup-Options-/Responsepfad; Search-State und
  per-Mount-Map mit unveränderlichem Displaymodell in der Shell. Der Harness
  nutzt dieselbe `semanticsV2`, aber lokale deterministische Lookupfakes; der
  reale Data-Access-Wrapper wird in Contracttests integriert.
- Async-DOM-Updates verlangen aktuelle Generation, offene sichtbare Shell,
  keinen Closeguard und vorhandenes Item; sie bleiben fokusneutral.
- F-ACT-R4-15 bis -19 sind nach technischer/fachlicher Prüfung geschlossen;
  Decision Log, Scope-Freeze, Statusmatrix und Resume Card sind synchron.
- Full Contract Review PASS gegen Masterplan/O-8, R1, realen R2-JS-/SQL-
  Responsevertrag, R3-Lifecycle, C2 und R4-Scope. v1-Historie unter v2,
  v2-only-Key mit `null`, bestehende Draftitems, optionaler Callback,
  requestfreies Tippen, flüchtiger Cache und read-only UI sind eindeutig.
- Kein offenes In-Scope-P0/P1, keine Owner-Grundsatzentscheidung und kein
  SQL/RPC/Commit/Draft/Storage/Produktload- oder R5-R13-Vorgriff.

Exit: API, Suche, Lookupzustände, Cross-Version-Validierung, Copy und Fokus
sind eindeutig; keine Grundsatzfrage bleibt offen.

S2-Status: `PASS`.

## S3 - Race-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / High`.

### S3.1 - Bruchrisikomatrix

<!-- markdownlint-disable MD013 -->

| Risiko | Gegenmaßnahme | Pflichtcheck |
| --- | --- | --- |
| v2-only-Key wird lokal abgelehnt / gültige v1-Historie unter v2 verworfen | explizite Lookupsemantik plus eigener Snapshotvalidator | T-ACT-R4-02 |
| ungültige Options/Semantik lösen Transport aus | getrennte lokale Options-, Key- und Semantikfehler | T-ACT-R4-02 |
| Commitpfad wird durch geteilten Refactor gelockert | geschützte Commitfunktionen, Verhaltensregression und gezielter Diff | T-ACT-R4-03 |
| Tippen oder Malformed Search erzeugt Request/Draftmutation | ausschließlich synchrone C2-Suche, kanonische Resultprüfung | T-ACT-R4-04 |
| Kindklick auf Label/Equipment verliert die Aktion | panelbegrenzter Vorfahrenlauf zum Actionbutton | T-ACT-R4-04/-09 |
| Render/Timer/Notiz/Reorder wiederholen Lookup | Keycache vor Callback, getrennte Timerrepaints | T-ACT-R4-05 |
| Startdraft bleibt nach Hidden-Prerender ungeladen | expliziter Post-Open-Abgleich nach `openState=true` | T-ACT-R4-05/-14 |
| optionaler Callback wird falsch validiert/mehrfach aufgerufen | exakter Mountresolver, `loading` vor Call, atomare Throw-/Thenablegrenze | T-ACT-R4-05/-14 |
| mutable Callbackantwort verändert später Cache/DOM | Shell-eigenes unveränderliches Displaymodell | T-ACT-R4-06/-10 |
| Remove/Re-Add, Retry oder technischem Close folgt stale DOM | Generation, Presence, Open und Cache-only-Grenzen | T-ACT-R4-05/-06 |
| Lookupantwort stört laufenden Discard-Guard/Fokus | cache-only im Guard, fokusneutraler Cancel-/Error-Abgleich | T-ACT-R4-06/-14 |
| Destroy wird von Promise überlebt | Destroy vor Settlementmutation, Cache leeren, kein DOM | T-ACT-R4-06 |
| Fehler wird als fehlende Historie dargestellt | vier disjunkte Zustände | T-ACT-R4-07 |
| Historie wirkt wie aktuelle Leistung | read-only Copy/DOM und Draft-vorher-nachher | T-ACT-R4-08 |
| Suchinput verlässt den R3-Fokustrap | `input` im Trap; Itemrow `tabindex=-1` nur programmatisch | T-ACT-R4-09/-14 |
| ISO-Tag/Dezimalformat ist instabil | direkte Tag- und deterministische Zahlenformatierung | T-ACT-R4-07/-14 |
| lange oder hostile Texte brechen Layout/XSS-Grenze | responsive Matrix und ausschließlich sichere Textknoten | T-ACT-R4-09/-10 |
| Harness benötigt Supabase/Auth/Netzwerk | lokale Zustandsfakes; reale Wrapperintegration nur im Contracttest | T-ACT-R4-09/-11 |
| R4 wird produktiv geladen oder persistiert | statischer Isolations-/Storage-/SQL-Diffscan | T-ACT-R4-11 |
| Background erzeugt Lookupduplikate | 32-Sekunden-Fremdtabsmoke mit Callcounter | T-ACT-R4-12 |

<!-- markdownlint-enable MD013 -->

### S3.2 - Response- und Datenreview

Bestätigter Schnitt:

1. `getSemantics()`, `normalizeCommitRequest()`, `validateCommitResponse()`,
   `validateItemResponse()`, `callRpc()` und `commitSession()` bleiben der
   bestehende v1-Commitpfad und werden nicht gelockert.
2. Nur `loadLastPerformance` erhält Optionsresolver, ausgewählte Keyprüfung und
   einen separaten historischen Validator gemäß S2.1/S2.2.
3. Der historische Validator prüft exakte Feldmengen, UUID/Zeit/Tag,
   Snapshotenums, R1-Policyinvarianten, Zahlen/Text und Setordnung, ohne einen
   Current-Catalog-Entry zu konsultieren.
4. `null` ist ausschließlich die erfolgreich validierte RPC-/Callbackantwort
   für No History. Throw, Reject, Auth/Netzwerk und Malformed Success sind
   `error`, niemals `empty`.
5. Nach Data-Access-Validierung erstellt die Shell synchron ein eigenes
   unveränderliches Displaymodell. Getter-/Projektionsfehler werden `error`;
   die Rohantwort wird weder gecacht noch später erneut gelesen.
6. Lookupcache und Displaymodell bleiben closure-lokal, höchstens durch die
   Katalog-/Draftgrenzen beschränkt und werden beim Destroy freigegeben. Kein
   Draft-, Storage-, Retention- oder SQL-Delta.

### S3.3 - Async-, Fokus- und Cleanupreview

Search-State-Machine:

| Zustand | Eintritt | Sichtbarkeit / Übergang |
| --- | --- | --- |
| `closed` | Mount, normalisiert leere Query, Escape oder Auswahl | Start-Hinweis beziehungsweise erhaltene Query; `aria-expanded=false` |
| `results` | nicht leere Query, valide Treffer | höchstens acht Buttons; Auswahl -> `closed` mit leerer Query |
| `empty` | nicht leere Query, valides leeres Result | neutrale Kein-Treffer-Copy; Escape -> `closed` mit Query |
| `search_error` | Throw/Malformed Result | sichere Copy, keine Draftmutation; neue Eingabe versucht lokal erneut |

`ArrowDown`/`Enter` wirken nur auf valide sichtbare Resultbuttons. Escape in
`results`/`empty`/`search_error` schließt zuerst die Suche und stoppt
Propagation; erst der nächste Escape erreicht den R3-Discard-Guard.

Lookup-State-Machine je Key:

| Zustand | Eintritt | Erlaubter Übergang |
| --- | --- | --- |
| `absent` | Key noch nie beobachtet | sichtbarer Abgleich -> `loading(g)` |
| `loading(g)` | Cacheeintrag vor Callbackaufruf | aktuelle Resolution -> `success`/`empty`; Throw/Reject/Malformed -> `error` |
| `success` | projiziertes Displaymodell | bis Destroy stabil; Remove/Re-Add ohne Request |
| `empty` | validiertes `null` | bis Destroy stabil; Remove/Re-Add ohne Request |
| `error` | fehlgeschlagene Generation | nur bewusster Retry -> `loading(g+1)` |
| `disabled` | kein Callback | kein Historien-DOM und kein Lookup |

Race-/DOM-Matrix:

| Ereignis beim Settlement | Cache | DOM / Status / Fokus |
| --- | --- | --- |
| Item vorhanden, offen, kein Guard, aktuelle Generation | Displaymodell/State übernehmen | nur zugehörige Historienregion patchen |
| Item entfernt | übernehmen | kein DOM; Re-Add nutzt Cache |
| technisch geschlossen | übernehmen | kein verborgenes DOM; Reopen rendert Cache |
| Discard-Guard pending | übernehmen | kein Patch und kein Guardstatus-/Fokuswechsel |
| Guard Cancel/Fehler | behalten | genau ein fokusneutraler Lookupabgleich, Guardcopy/Fokus erhalten |
| Guard bestätigt | behalten | kein Patch nach Close/Discard |
| alte Generation | verwerfen | keine Mutation |
| Destroy | verwerfen; Cache ist geleert | keine Mutation |

Weitere Implementierungsgrenzen:

- Cacheeintrag `loading` entsteht synchron vor Callback/Thenable-Assimilierung;
  Retrybutton wird im selben Turn deaktiviert, wodurch Doppelklicks koaleszieren.
- Vollständige Shellrenders dürfen Cachezustände nur abbilden, nie neue Calls
  für bekannte Keys starten. Timerrepaints bleiben DOM-lokal.
- Asynchrone Historienpatches ersetzen weder Itemliste noch globale
  Live-Region; Move/Remove behalten den bestehenden R3-Fokusvertrag.
- Der Fokus-Trap umfasst den Suchinput und native Buttons. Itemzeilen mit
  `tabindex=-1` sind ausschließlich explizite Auswahlziele.
- Delegierte Klicks laufen nur über Vorfahren innerhalb des Panels; fremde oder
  getrennte Nodes können keine Draftaktion auslösen.

### S3.4 - Rollback- und Stop-Vertrag

- Rollback ist dateilokal und reversibel: nur jeweilige R4-Deltas in Data-
  Access-Test/Source beziehungsweise Shell/Test/CSS/Harness zurücknehmen;
  keine fremden Worktreeänderungen oder fertigen R1-R3-/C2-Sources anfassen.
- Kein Daten-, Remote-, SQL- oder Deployrollback ist erforderlich.
- Stop vor beziehungsweise innerhalb S4, wenn historische v1-Antworten nicht
  ohne SQL-/Commitänderung streng validierbar sind, der alte Ein-Argument-
  Lookup bricht oder v2-only-Keys den unveränderten RPC nicht erreichen.
- Stop bei erforderlichem Produktload, Save, Draftschema/Storage, Activity V1,
  R5-R13-Scope oder realem Supabasezugriff im Harness.
- Stop, wenn die bestehende 56er-Baseline vor Produktcodeänderung rot wird oder
  ein P0/P1 nach gezielter Korrektur offen bleibt.
- Ein fehlgeschlagener optionaler Browser-/Owner-Smoke blockiert nur bei einem
  reproduzierbaren In-Scope-Vertragsbruch; ergonomische Präferenz allein wird
  als Ownerentscheidung eskaliert, nicht erfunden.

### S3.5 - Finalisierte Tests und Invalidation

- T-ACT-R4-01 bis -14 sind vollständig und decken Data Access, Commitregression,
  Suche, Cache/Races, Rendering, read-only Draftschutz, Browser/A11y/XSS,
  Isolation, Background, Katalog/Syntax und callbacklosen R3-Fallback ab.
- Die gesamte 56er-Suite wird nach jeder betroffenen S4-Änderung und final in
  S5 ausgeführt; gezielte Tests dürfen früher laufen, ersetzen sie aber nicht.
- Der Katalogcheck wird nach Search-/Harnessänderung wiederholt.
- Harnesssmokes laufen auf 1440x900, 390x844 und 320x800. Der Backgroundsmoke
  läuft mindestens 30 Sekunden, deterministisch mit dem bereits belegten
  32-Sekunden-Fremdtabfenster und Lookup-Callcounter.
- SQL-Fixture und produktive Supabase-Postchecks bleiben übernommen, solange
  SQL/RPC/RLS/ACL/Grants und Transport unverändert sind. Kein Android-PWA-
  Produktsmoke, weil R4 nicht produktiv geladen wird.

Vorläufig sichere S4-Ausführungsblöcke für das noch ausstehende S4R:

1. Block A: `S4.1` allein, Extra High/Full, T-ACT-R4-01 bis -03 und -13.
2. Block B: `S4.2 + S4.3` als zusammenhängender Shell-State-/DOM-Block, Full,
   T-ACT-R4-04 bis -08, -10 und -14; Ergebnisse bleiben substepgetrennt.
3. Block C: `S4.4`, Consumer plus Browserreview, T-ACT-R4-09/-10/-12/-14.
4. Block D: `S4.5`, integrierter Full Review, T-ACT-R4-01 bis -14.

### S3 Full Contract Review

1. Risiken gegen jeden S4-Substep und jeden T-Check zuordnen.
2. Prüfen, dass kein R5-R13-Vertrag vorgezogen wurde.
3. Reviewtiefe und sichere Ausführungsblöcke finalisieren.
4. Findings korrigieren und S4R vorbereiten.

Ergebnis:

- Blockierende Risiken:
  - `none`; F-ACT-R4-20 bis -23 sind geschlossen.
- Rollback-/Stop-Vertrag:
  - `bestätigt; ausschließlich lokale R4-Deltas, keine Remote-/Datenwirkung`.
- S4-Schnitt:
  - `vier vorläufig sichere Blöcke A-D; Freigabe ausschließlich durch S4R`.
- S5-Pflichtchecks:
  - `T-ACT-R4-01 bis T-ACT-R4-14; jedes Risiko ist mindestens einem Check
    und einem S4-Substep zugeordnet`.
- Doku-Sync:
  - `Decision Log, Findings, Scope-Freeze, Statusmatrix und Resume Card in S3;
    produktnahe Doku weiterhin erst S6`.
- Fakten/Annahmen:
  - `Fakten: reale R2-Mutabilität, R3-Fokusselector/event.target-, Open-/Close-
    und Guardpfade sowie netzwerkfreier R3-Harness wurden im aktuellen Source
    belegt. Annahmen: keine implementierungsentscheidende.`
- Vor-S4-Baseline:
  - `56/56 Contracttests, C2-Katalogcheck und Produktload-/V1-Isolationsscan
    erneut PASS; ausschließlich die R4-Roadmap ist geändert.`
- Full Contract Review:
  - `PASS gegen Root-README, Dev Environment, Workflow Contract, Masterplan/
    O-8, Activity Overview, R1, realen R2-JS-/SQL-Vertrag, R3-Draft-/Shell-
    Lifecycle, C2-semanticsV2, S2-Zielvertrag, Decision Log, Scope-Freeze und
    alle T-/S4-Grenzen. Keine SQL-, Commit-, Draft-, Produkt-, Storage-,
    Enterprise- oder R5-R13-Ausweitung; kein offenes In-Scope-P0/P1 und keine
    Owner-Grundsatzentscheidung.`

Exit: Cross-Version-, Async-, UI- und Isolationsrisiken sind geschlossen oder
einem konkreten Test zugeordnet.

S3-Status: `PASS`.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

Vor S4 alle Ergebnisse aus S1-S3 gegen den dann realen Code prüfen. Diese
vorläufige Matrix darf korrigiert, aber nicht still erweitert werden.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | lookup-spezifische Semantikinjektion und historischer Snapshotvalidator | F-ACT-R4-01/-02/-17/-25 | `data-access.js`, `data-access.contract.test.js` | Full | T-ACT-R4-01 bis -03, -13 | none |
| S4.2 | lokale Catalog-v2-Suche und kanonische Auswahl | F-ACT-R4-04/-18/-21/-26/-28/-29 | `session-shell.js`, CSS, Shelltests, Harness, `semantics-v2.contract.test.js` als Consumerregression | Consumer | T-ACT-R4-04, -09/-10/-14 | none |
| S4.3 | Last-Performance-State, Displaycache, Retry und Raceguards | F-ACT-R4-05 bis -09, -12 bis -16, -20/-23/-24/-27 | `session-shell.js`, CSS, Shelltests, Harness | Full | T-ACT-R4-05 bis -08, -10, -14 | none |
| S4.4 | Responsive-, Fokus-, Copy- und Harnesspolitur | F-ACT-R4-04/-07/-13/-18/-21 bis -23 | CSS, Shelltests, Harness | Consumer | T-ACT-R4-08 bis -10, -12, -14 | none |
| S4.5 | integrierter Code-/Contract- und Isolationsreview | alle | alle R4-Dateien | Full | T-ACT-R4-01 bis -14 | none |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - `S4.1` vor Shellintegration; innerhalb Block B zuerst Such-/DOM-Grundlage,
    dann Lookupstate; `S4.4` nach finalem DOM; `S4.5` zuletzt.
- Fehlende Zuordnung:
  - `none`; jeder Substep, jedes In-Scope-Finding und T-ACT-R4-01 bis -14 ist
    mindestens einer ausführbaren Grenze zugeordnet.
- Evidence:
  - `nicht erforderlich`; Nachweise bleiben kompakt in Roadmap und HCR-022.
- Scope-Freeze:
  - `PASS`; ausschließlich lookup-spezifisches Data Access und isolierte
    Shell/Test/CSS/Harness-Deltas, keine produktive oder persistente Wirkung.
- Gültig übernommene Nachweise:
  - `56/56`, C2-Katalogcheck und Produktload-/V1-Isolationsscan aus S3 werden
    übernommen, weil der S4R-Diff weiterhin ausschließlich diese Roadmap
    betrifft; R2-/C2-SQL-/Produktivnachweise bleiben bei unveränderten Sources
    gültig.
- Invalidation Map:
  - `data-access.js/data-access.contract.test.js -> T-ACT-R4-01 bis -03/-13;
    D-ACT-R4-26-Funktionsdiff ist Pflicht`;
  - `session-shell.js/session-shell.contract.test.js -> T-ACT-R4-01,
    -04 bis -08, -10 und -14`;
  - `semantics-v2.contract.test.js -> T-ACT-R4-01/-04/-14 als C2→Shell-
    Consumerregression; semantics-v2.js bleibt unverändert`;
  - `session-shell.css/session-shell-harness.html -> T-ACT-R4-09/-10/-12/-13;
    bei JS-Harnesslogik zusätzlich -04 bis -08/-14`;
  - `semantics.js/semantics-v2.js bleiben unverändert; T-ACT-R4-13 führt den
    C2-Katalogcheck trotzdem als Consumerregression aus`;
  - `index.html`, Activity V1, Service Worker und SQL bleiben unverändert und
    werden statisch durch T-ACT-R4-11 geschützt.
- Owner-Gates:
  - `none innerhalb S4`; vor Block A erfolgt das geplante kurze Briefing zur
    getrennten Read-/Commitversionsgrenze, aber kein produktives Freigabegate.
- Empfohlene S4-Ausführungsblöcke:
  - `freigegeben gemäß D-ACT-R4-27`: Block A `S4.1`; Block B `S4.2+S4.3` mit
    getrennten Ergebnissen; Block C `S4.4`; Block D `S4.5`.
- Begründung:
  - S4.1 verändert eine bestehende gemeinsame Datenzugriffsgrenze.
  - Suche und Lookupzustände teilen denselben Shell-Render-/Fokusfluss.
  - Responsive Politur ist erst auf dem finalen DOM aussagekräftig.
- Readiness-Findings/Korrekturen:
  - `F-ACT-R4-24 P1 fixed`: Callbackprotokoll und Einmalaufruf explizit in
    T-ACT-R4-05/-14.
  - `F-ACT-R4-25 P1 fixed`: D-ACT-R4-26 begrenzt den S4.1-Source-Diff und
    schützt Commithelper/-funktion konkret.
  - `F-ACT-R4-26 P2 fixed`: S4.2-/S4.3-Checkmapping fachlich getrennt.
- Vor-S4-Codeprüfung:
  - `PASS`; alle geplanten JS-/CSS-/Harness-/Testdateien, SQL 20/21,
    index.html und Service Worker sind gegenüber HEAD unverändert. Reale APIs,
    v1/v2-Kopplung, R3-Fokus/event.target/Lifecycle und Harness-Scriptload
    entsprechen weiterhin den S1-S3-Fakten.
- Full Contract Review:
  - `PASS gegen Root-README, Dev Environment, Workflow Contract, Masterplan/
    O-8, Activity Overview, R1, reale R2-JS-/SQL-Grenze, R3-Draft-/Shell-
    Lifecycle, C2, S1-S3, Decision Log, Findings, Scope-Freeze, S4-Substeps und
    T-ACT-R4-01 bis -14. Lookup-Injection ist ausreichend und separat
    rollbackfähig; Commit, SQL, Draft, Produktload, Activity V1, Storage und
    R5-R13 bleiben geschützt. Kein offenes P0/P1, keine Grundsatz- oder
    Ownerentscheidung.`

Exit: S4 kann ohne neue Grundsatzentscheidung beginnen; API-, Shell- und
Reviewgrenzen sind final.

S4R-Status: `PASS`.

## S4 - Umsetzung

### S4.1 - Lookup-spezifische Semantikinjektion

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R4-03 bis -05, -21/-22/-26; F-ACT-R4-01/-02/-17/-25.
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
  - `loadLastPerformance(itemKey, { semantics })` additiv ergänzt; der alte
    Ein-Argument-Aufruf verwendet weiterhin `AppModules.activityV2.semantics`.
  - Options, Semantik-API, Katalogversion und der exakte ausgewählte Key
    scheitern lokal fail-closed vor Transport.
  - Nicht-null-Lookupantworten laufen über einen separaten strengen R2-
    Snapshot-/Policy-/Wertevalidator; kein Vergleich historischer Labels,
    Versionen, Equipment-, Tracking- oder Policy-Snapshots mit Catalog v2.
  - `commitSession`, Commitnormalisierung/-validatoren, `callRpc`, RPC-Body,
    Fehler-/Retryvertrag und öffentlicher Methodensatz sind unverändert.
- Prüfung:
  - `T-ACT-R4-01 PASS`: vollständige Activity-V2-Suite `59/59`.
  - `T-ACT-R4-02 PASS`: Data-Access-Suite `13/13`; alter v1-Aufruf, exakte
    Optionsfehler, v2-only `high_row` mit `null`, v1-Historie unter v2 sowie
    alle drei Trackingmodi und Snapshot-/Policy-/Wertefehler belegt.
  - `T-ACT-R4-03 PASS`: geschützte D-ACT-R4-26-Funktionen und öffentlicher
    Methodensatz sourcegleich zu `HEAD`; Commitregressionen in der Suite grün.
  - `T-ACT-R4-13 PASS`: `node --check`, C2-Katalogcheck und `git diff --check`
    grün; ergänzender Produktload-/Activity-V1-/SW-/SQL-Diffscan PASS.
- Finding/Korrektur:
  - `none`; die bereits geschlossenen F-ACT-R4-01/-02/-17/-25 wurden exakt
    umgesetzt, der Implementierungsreview fand keinen neuen Defekt.
- Restrisiko:
  - `none innerhalb S4.1`; Shellsuche, Callbackconsumer, Displaycache und
    Raceguards sind bewusst erst Block B / S4.2 + S4.3.
- Doku-Sync:
  - Roadmap, Statusmatrix, Findingshinweis und Resume Card synchron;
    Masterplan/Activity Overview/HCR-Abschluss bleiben vertragsgemäß S6.
- Full Contract Review:
  - `PASS` gegen Root-README, Dev Environment, Workflow Contract, Masterplan/
    O-8, Activity Overview, R1, realen R2-JS-/SQL-Vertrag, R3-Draft-/Shell-
    Vertrag, C2 sowie R4-Zielvertrag, Decision Log, Scope-Freeze und Findings.
  - Read ist lookup-spezifisch versionsagnostisch; Write bleibt v1-gebunden.
    SQL/RPC/RLS/ACL/Grants, Draft, Shell, Produktload, Activity V1, Storage und
    R5-R13 sind unangetastet. Keine Owner-Grundsatzentscheidung offen.
- Status:
  - `PASS`.

Exit: v2-only-Keys und ältere valide Historie sind lesbar, ohne den Commitpfad
zu verändern.

### S4.2 - Lokale Suche und kanonische Auswahl

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R4-02, -06/-07, -20/-24; S2.3/S2.4.
- Dateien:
  - `session-shell.js`, `session-shell.css`, `session-shell.contract.test.js`,
    `session-shell-harness.html`;
  - `semantics-v2.contract.test.js` ausschließlich als durch den Select-
    Ersatz invalidierte C2→Shell-Consumerregression gemäß F-ACT-R4-28.
- Umsetzung:
  - Select-Picker durch lokale Suche plus höchstens acht Ergebniscontrols
    ersetzen;
  - ausschließlich injizierte `semantics.search()` verwenden;
  - kanonische Auswahl, Vorfahren-Eventdelegation, Duplicate-Fokus, No-Result,
    Fokus-Trap und Tastaturvertrag;
  - kein Transport beim Tippen.
- Review:
  - `Consumer`; am Ende von Block B gemeinsam `Full`.
- Invalidation:
  - R3-Shell-/Fokus-/Isolationstests und R4-Suchtests.
- Gate:
  - `none`.

#### Ergebnis S4.2

- Änderung:
  - Vollkatalog-Select durch beschriftetes `input type=search`, lokale
    `semantics.search(query, { limit: 8 })`-Auswertung und semantische Liste
    kanonischer Ergebnisbuttons ersetzt.
  - Start/Empty/Search-Error, deutsche Equipmentlabels, Duplicate-Copy,
    begrenzte Kindklick-Delegation, Queryreset, programmatischer Itemfokus,
    `ArrowDown`/`Enter` und Search-first-Escape umgesetzt.
  - C2→Shell-Consumerregression auf den realen Searchvertrag aktualisiert;
    `semantics-v2.js` und Suchranking bleiben unverändert.
- Prüfung:
  - `T-ACT-R4-04 PASS`: Limit acht wird exakt übergeben; Start/Empty/mehrere/
    Throw/Malformed, Duplicate, Kindklick und kein Lookup beim Tippen belegt.
  - `T-ACT-R4-10 lokal PASS`: dynamische Labels werden ausschließlich als
    Textknoten gerendert; Browserkonsole im isolierten Harness leer.
  - `T-ACT-R4-14 PASS im S4.2-Scope`: Input im Fokustrap, Enter/ArrowDown,
    Escape-Schicht und programmatischer Itemfokus belegt.
  - `T-ACT-R4-09 noch TODO`: gerenderte Default-Viewport-Baseline 1689x862
    PASS; die verbindliche 1440/390/320-Matrix gehört zu S4.4.
- Finding/Korrektur:
  - `F-ACT-R4-28 P1 fixed`: übersehene C2-Consumer-Testinvalidierung.
  - `F-ACT-R4-29 P1 fixed`: ArrowDown-Reopen nach Search-Escape.
- Restrisiko:
  - vollständige responsive/Touch-/Overflow-Politur und Viewportmatrix erst
    S4.4; keine offene S4.2-Funktionsabweichung.
- Doku-Sync:
  - Roadmap, Findings, S4R-Dateimapping, Statusmatrix und Resume Card synchron;
    produktnahe Doku bleibt S6.
- Status:
  - `PASS`.

Exit: Such- und Auswahlflow ist lokal, begrenzt, kanonisch und zugänglich.

### S4.3 - Last-Performance-Zustände, Cache und Raceguards

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R4-08 bis -19 und -23; S2.5-S2.7, S3.2/S3.3.
- Dateien:
  - `session-shell.js`, `session-shell.css`, `session-shell.contract.test.js`,
    `session-shell-harness.html`.
- Umsetzung:
  - optionalen Lookup-Callback am Mount validieren;
  - callbacklosen R3-Fallback und requestfreien Hidden-Mount erhalten;
  - neue Draftitems deterministisch erkennen;
  - Loading/Success/Empty/Error, Cache und expliziten Retry implementieren;
  - Rohantwort sofort in ein Shell-eigenes unveränderliches Displaymodell
    projizieren;
  - volle letzte Ausführung read-only formatieren;
  - Remove-/Re-Add-/Close-/Discard-/Destroy-/stale-Promise-Guards ergänzen;
  - sichere DOM-Erzeugung und keine Draftmutation durch Lookup.
- Review:
  - `Full` gemeinsam mit S4.2.
- Invalidation:
  - gesamte Shellsuite, Data-Access-Integration über Fakes und Harness.
- Gate:
  - `none`.

#### Ergebnis S4.3

- Änderung:
  - optionales exaktes `loadLastPerformance`-Mountfeld mit unverändertem
    callbacklosem R3-Fallback und requestfreiem Hidden-Mount ergänzt.
  - Per-Key-State-Machine für Loading/Success/Empty/Error, genau einen
    Auto-Lookup, expliziten Retry und flüchtigen success/empty/error-Cache
    außerhalb des Drafts umgesetzt.
  - Jede Erfolgsantwort wird sofort gegen das vollständige interne R2-
    Snapshot-/Policy-/Werteschema in ein tief eingefrorenes Displaymodell aus
    reinen Anzeigestrings projiziert; die mutable Rohantwort wird nicht gehalten.
  - Vollständige Strength-/Dauer-/Distanz-/Assistance-/Notizdarstellung sowie
    Remove/Re-Add, technisches Close, Discard-Guard, Retrygeneration und
    Destroy race-sicher und fokusneutral umgesetzt.
  - Harness injiziert `semanticsV2` sowie lokale Success-/Empty-/Error-/Slow-
    Fakes; kein reales Data Access, Auth, Supabase oder Netzwerk.
- Prüfung:
  - `T-ACT-R4-05 PASS`: Callback fehlt/ungültig/Throw/Non-Thenable/Thenable/
    Promise, Hidden Mount, Post-Open, Add, Render/Timer/Notiz/Reorder und
    Remove/Re-Add mit exakten Callcountern.
  - `T-ACT-R4-06 PASS`: späte Remove-/Close-/Guard-/Destroy-Antworten,
    Cache-only-Grenzen, Retrykoaleszierung und Retained-Raw-Mutation.
  - `T-ACT-R4-07 PASS`: vier disjunkte Zustände, direkter `DD.MM.YYYY`-Tag,
    deutsche Zahlen, komplette Satzreihenfolge, Dauer, Distanz, Assistance und
    Notiz; isolierter Edge-Harness zeigt Loading→Success, Empty und Error/Retry.
  - `T-ACT-R4-08 PASS`: Historienregion ohne Input/Checkbox/Erledigtstatus;
    Draftreferenz und -werte bleiben über Lookups unverändert.
  - `T-ACT-R4-10 lokal/Renderbaseline PASS`: hostile Markup bleibt Text,
    mutable Rohantwort wirkungslos, Browserkonsole leer.
  - `T-ACT-R4-14 PASS im S4.3-Scope`: Callback genau einmal je Generation,
    Post-Open-Abgleich, Guardfokus und Date-Formatter ohne `Date`.
  - Gesamtregression `65/65`, Shell `24/24`, Katalog `v2/80/47/58`, Syntax,
    `git diff --check` und Produktload-/V1-/SW-/SQL-Isolation PASS.
- Finding/Korrektur:
  - `F-ACT-R4-27 P1 fixed`: vollständige interne Policy-/Comparabilityprüfung
    an der direkten Callback-/Displaymodellgrenze.
- Restrisiko:
  - volle 1440/390/320- und 32-Sekunden-Backgroundsmokes bleiben bewusst
    S4.4; keine offene S4.3-Funktions- oder Raceabweichung.
- Doku-Sync:
  - Roadmap, Findings, Statusmatrix und Resume Card synchron; Masterplan,
    Activity Overview und HCR bleiben S6.
- Block-B-Full-Contract-Review:
  - `PASS` gegen Root-README, Dev Environment, Workflow Contract, Masterplan/
    O-8, Activity Overview, R1, realen R2-JS-/SQL-Vertrag, R3-Draft-/Shell-
    Lifecycle, C2 und R4-Zielvertrag/Decision Log/Scope-Freeze/Findings.
  - Suche bleibt lokal und requestfrei; Historie bleibt read-only, flüchtig
    und draftfremd. Data Access/Commit, SQL/RPC/RLS/ACL/Grants, Draftschema,
    Storage, Produktload, Activity V1 und R5-R13 sind unverändert. Kein neues
    Grundsatzdecision erforderlich und keine Ownerentscheidung offen.
- Status:
  - `PASS`.

Exit: Jedes Item besitzt einen begrenzten, neutralen und race-sicheren
Historienzustand, der die Session nie blockiert.

### S4.4 - Responsive, Fokus, Copy und Harness

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R4-20/-24/-25, S2.3-S2.7 und R3-Responsivevertrag.
- Dateien:
  - `session-shell.css`, `session-shell.contract.test.js`,
    `session-shell-harness.html`; `session-shell.js` nur für notwendige
    Fokus-/Copykorrekturen.
- Umsetzung:
  - finale Result-/Historienstruktur auf 1440x900, 390x844 und 320x800
    stabilisieren;
  - lange deutsche/englische Labels, Equipment und Notizen prüfen;
  - Touchziele, Fokusreihenfolge, Live-Status und Reduced Motion erhalten;
  - Harness mit `semanticsV2` und deterministischen lokalen Success-/Empty-/
    Error-/Slow-Fakes erweitern; kein Remote-/Data-Access-Harnessrequest.
- Review:
  - `Consumer`; im Block C gemeinsam `Full`.
- Invalidation:
  - Browsermatrix und 30-Sekunden-Backgroundsmoke.
- Gate:
  - `none`.

#### Ergebnis S4.4

- Änderung:
  - Suchinput in den sichtbaren Fokusstyle aufgenommen; mobiler Close-Button
    gegen die allgemeine Button-Spezifität gehärtet, ohne Accessible Name oder
    44-px-Ziel zu ändern.
  - Harness um langen bilingualen historischen Snapshot mit literalem Markup
    und DOM-lesbare lokale Lookupzähler ergänzt. Success, Empty, Error und Slow
    bleiben deterministische lokale Fakes; kein Data Access oder Remotezugriff.
- Prüfung:
  - `T-ACT-R4-08 PASS`: Historie bleibt ohne Inputs/Checkboxen/Done-State;
    Draft, Notiz und Historienblock bleiben im 32-Sekunden-Lauf identisch.
  - `T-ACT-R4-09 PASS`: System-Edge über den roadmap-erlaubten regulären
    Playwright-Pfad bei 1440x900, 390x844 und 320x800; Suche, Kindklick,
    Tastatur/Fokustrap, vier Zustände und lange Texte ohne Overflow/Overlap,
    jedes aktive Touchziel mindestens 44 px.
  - `T-ACT-R4-10 PASS`: literal eingebettetes `<img ...>` bleibt Text und
    erzeugt kein Element; ausschließlich lokale Harnessrequests, leere
    Warnungs-/Fehlerkonsole und keine Runtimeausführung.
  - `T-ACT-R4-12 PASS`: deterministisches Fremdseiten-/Page-Visibility-Fenster
    `visible -> hidden -> visible` mit eingefrorenem Seitenscheduler über
    32,05 Sekunden; Timer `00:00 -> 00:32`, Draft/Notiz/Historie unverändert,
    Lookupzähler `high_row=1` vor und nach Rückkehr.
  - `T-ACT-R4-14 PASS`: vorwärts/rückwärts Fokustrap, Search-Escape, Live-
    Regionen und Reduced Motion in lokaler Regression und Browsermatrix grün.
  - Browserpfad transparent: In-App-Browser in dieser Umgebung nicht verfügbar;
    der verbundene Edge-Extension-Pfad kann keine festen Viewports setzen.
    R4 erlaubt lokale Browser-/Playwright-Smokes, daher System-Edge ohne neue
    Repodependency oder committed Testartefakte verwendet.
  - Gesamtregression `65/65`, Shell `24/24`, Katalog `v2/80/47/58`, Syntax,
    `git diff --check` und Produktload-/V1-/SW-/SQL-Isolation PASS.
- Finding/Korrektur:
  - `F-ACT-R4-30 P1 fixed`: sichtbarer Fokusrahmen des Suchinputs.
  - `F-ACT-R4-31 P1 fixed`: abgeschnittene mobile Close-Copy.
- Restrisiko:
  - `none innerhalb S4.4`; integrierter Gesamtdiffreview bleibt S4.5.
- Doku-Sync:
  - Roadmap, Findings, Statusmatrix und Resume Card synchron; Masterplan,
    Activity Overview und HCR bleiben vertragsgemäß S6.
- Block-C-Full-Contract-Review:
  - `PASS` gegen Root-README, Dev Environment, Workflow Contract, Masterplan/
    O-8, Activity Overview, R1, realen R2-JS-/SQL-Vertrag, R3-Responsive-/
    Lifecyclevertrag, C2 sowie R4-Zielvertrag, Decision Log, Scope-Freeze und
    Findings. Die Änderungen bleiben CSS-/Harness-/Test-lokal; Search und
    Historie sind lokal/read-only, Draft/Timer/Cacheverträge bleiben getrennt.
  - Data Access/Commit, SQL/RPC/RLS/ACL/Grants, Draftschema, Storage,
    Produktload, Activity V1 und R5-R13 sind unverändert. Keine offene
    Owner-Grundsatzentscheidung.
- Status:
  - `PASS`.

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
  - Direkte Shell-Callbackvalidierung um deterministische Kalender- und
    Uhrzeitgrenzen ergänzt; zugehöriger Regressionstest deckt ungültigen Monat,
    Kalendertag und Stunde ab.
- Prüfung:
  - Gesamtdiff nativ gegen Zielvertrag, Decision Log, Scope-Freeze und die
    geschützten R2-/R3-/C2-Grenzen geprüft.
  - Regression zunächst rot, nach eng begrenzter Korrektur grün.
  - `24/24` Shell- und `13/13` Data-Access-Tests grün; Syntaxcheck und
    `activity-catalog.mjs check` mit `v2 / 80 / 47 / 58` grün.
  - `commitSession` und seine geschützten Helper liegen außerhalb aller
    Data-Access-Diffhunks; Produktload, Activity V1, SQL und Draftschema ohne Diff.
  - Statische Isolation bestätigt weder Persistenz-/Produkt-/Netzwerkpfad noch
    unsichere `innerHTML`-Senke in Shell oder Harness.
- Finding/Korrektur:
  - `F-ACT-R4-32 P2 fixed`: CLI und Agent-Authentifizierung bestätigt; gemäß
    D-ACT-R4-29 kein S4.5-Gate mehr.
  - `F-ACT-R4-33 P1 fixed`: unmögliche Lookup-Zeitstempel werden fail-closed
    als neutraler Historienfehler behandelt.
- Restrisiko:
  - `none innerhalb S4.5`; die unabhängige frische S5-Matrix steht aus.
- Doku-Sync:
  - Roadmap, Decision Log, Findings, Statusmatrix und Resume Card synchron;
    produktnahe Dokumente bleiben S6.
- Status:
  - `PASS`; keine offenen P0/P1, D-ACT-R4-28 gibt S5 frei.

Exit: R4 ist code- und vertragsseitig geschlossen; kein R5-R13-Vertrag wurde
vorgezogen.

## S5 - Contract-, Browser- und Abschlusschecks

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R4-01 | lokal | gesamte Activity-V2-Suite: `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js` | PASS | final frisch `65/65` | Activity-V2-JS/Tests |
| T-ACT-R4-02 | lokal | alter Ein-Argument-v1-Lookup; exakte Options/Semantik lokal fail-closed; v2-only-Key mit `null`; v2-Request mit valider v1-Historie; alle Snapshot-/Policy-/Wertefehler abgewiesen | PASS | Data Access `13/13`; Transportzähler und historische Driftmatrix grün | Data Access/Semantik |
| T-ACT-R4-03 | lokal/statisch | öffentlicher Methodensatz sowie D-ACT-R4-26-Schutzzonen einschließlich `commitSession`, Requestbody, Validation, Fehlerzustände und Retry bleiben source- und verhaltensgleich | PASS | Commitregression grün; kein Commit-Hunk, keine öffentliche API-Änderung | Data Access |
| T-ACT-R4-04 | lokal | C2-Suche Limit acht; Start/leer/keine/mehrere/Malformed/Throw; kein Fetch beim Tippen; Duplicate ohne Add/Lookup; Kindklick löst kanonischen Button aus | PASS | Shell-/C2-Consumerregression und Browser-Plugin-Interaktion grün | Shell/Semantik |
| T-ACT-R4-05 | lokal | Callback fehlt/ist ungültig/throwt/liefert Non-Thenable/Thenable/Promise; Hidden Mount, Post-Open-Startdraft, neuer Add, Timer/Notiz/Reorder/Render und Remove/Re-Add: höchstens ein Auto-Lookup je Key/Mount; Retry nur explizit | PASS | Shell `24/24`; deterministische Callcounter grün | Shell |
| T-ACT-R4-06 | lokal | späte Success/Error bei Remove, technischem Close, Guard Cancel/Fehler/Confirm, Retry und Destroy; Cache-/DOM-/Status-/Fokusgrenzen, Generation, Doppelklick und Retained-Raw-Mutation | PASS | kontrollierte Async-/Mutation-Fakes grün | Shell |
| T-ACT-R4-07 | lokal | Loading/Success/Empty/Error, Tag/Zahlen, komplette Setreihenfolge, Dauer/Distanz/Assistance/Notiz und neutrale Copy | PASS | Formatter-/Rendercontracts plus Browserzustände grün | Shell/Formatter |
| T-ACT-R4-08 | lokal | Historienwerte ausschließlich read-only; keine aktuellen Inputs/Checkboxen/Erledigtzustände; Draft/Timestamp/Timer vor und nach Lookup identisch | PASS | DOM-/Snapshotregression; Browser `historyInputs=0` | Shell |
| T-ACT-R4-09 | Browser | netzwerkfreier Harness 1440x900, 390x844, 320x800: Suche, Kindklick/Touch, Tastatur/Fokustrap, lange Texte, vier Zustände, kein Overflow/Overlap | PASS | Browser-Plugin plus System-Edge/Playwright; drei Screens, nur sechs lokale Requests je Viewport, keine Console/Page Errors | Shell/CSS/Harness |
| T-ACT-R4-10 | lokal/Browser | Markuptext in aktuellem/historischem Label, Equipment und Notiz bleibt Text; keine Ausführung; Rohantwortmutation wirkungslos; leere Konsole | PASS | hostile Literal sichtbar, kein `img`, Mutationstest und Konsole grün | Shell |
| T-ACT-R4-11 | statisch | `index.html`, Activity V1, Service Worker, SQL/RPC/RLS/ACL/Grants, Storage und Produktnavigation unverändert; Harness ohne Remote; kein R4-Produktload | PASS | `FORBIDDEN=` leer; nur acht isolierte R4-Dateien im Diff | gesamter Diff |
| T-ACT-R4-12 | Browser | 32 Sekunden Fremdtab: Draft/Notiz/Historie unverändert, Timer korrekt fortgeschritten, keine zusätzlichen Lookups | PASS | Trace `visible>hidden>visible`; Timer `00:00>00:32`; Lookup `1` | Shell/Timer/Harness |
| T-ACT-R4-13 | lokal | `node tools/activity-catalog.mjs check`, Syntaxchecks und `git diff --check` | PASS | `v2 / 80 / 47 / 58`; Syntax und Diffcheck grün | Katalog/R4-Diff |
| T-ACT-R4-14 | lokal | Mount ohne Callback und ungültige Callbackoption; Hidden Mount requestfrei; Callback genau einmal pro Generation; Post-Open-Abgleich; Search-Escape vor Discard; Guardfokus; ISO-Tag in Vienna/UTC identisch | PASS | Shell-Lifecycle-/Formatterregressionen `24/24` | Shell/Formatter |

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
  - `T-ACT-R4-01 bis T-ACT-R4-14`.
- Wiederverwendete, nicht invalidierte Nachweise:
  - R2-SQL-/Auth-/Owner-/RLS-/ACL-Produktivnachweise bleiben gültig, weil SQL,
    RPC, Transportkonfiguration und Grants keinen Diff besitzen; kein Remote-
    Recheck oder Deploy war erforderlich.
- Nicht ausgeführte Smokes:
  - `none innerhalb des isolierten R4-Scopes`; kein produktiver Smoke, da R4
    vertragsgemäß nicht über `index.html` geladen wird.
- Produktiver Iststand:
  - `unverändert; R4 wird nicht produktiv geladen`.
- Externer Review:
  - CodeRabbit 0.7.2: erster uncommitted Review `1 Minor`; F-ACT-R4-34 berechtigt
    und korrigiert; erneuter Review `0 Findings` über alle acht R4-Dateien.
- Offene Findings:
  - `none`.
- Commit-Entscheidung:
  - `technisch commitbereit; S6-Doku-Sync und Abschluss bleiben offen`.

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
10. Den vom Owner gewünschten CodeRabbit-Installationszustand finalisieren und
    nachweisen; keine doppelte Skillinstallation oder Repository-Dependency
    erzeugen, sondern vorhandene Codex-Skill, WSL-CLI und Zielzustand zuerst
    gegeneinander prüfen.
11. Roadmap mit `(DONE)` in das Archiv verschieben; keine Evidence-Datei.
12. Kopierfertiges Handoff für den Besprechungschat erstellen: Ziel,
    Änderungen, Nachweise, Grenzen, Restrisiken und R5-Handoff.

Ergebnis:

- Source-of-Truth-Sync:
  - `docs/modules/Activity Module Overview.md` mit bewiesener R4-API, lokaler
    Suche, Historienanzeige, Cache-/Race- und Isolationsvertrag.
  - `docs/qa/health-capture-reports.md` mit reproduzierbarem `HCR-022`.
  - `docs/Future trainingsmodule update thoughts.md` mit R4 `DONE`, R5 `NEXT`
    und ausschließlich erledigtem R4-Anteil von O-8.
  - `docs/DEV_ENVIRONMENT.md` mit vorhandener VS-Code-/Codex-/WSL-
    CodeRabbit-Installation, Auth- und zukünftigem S5-Reviewvertrag.
- Finaler Review:
  - `PASS`; Full Contract Review gegen Root-README, Dev Environment, Workflow
    Contract, Masterplan/O-8, Activity Overview, R1, realen R2-JS-/SQL-Vertrag,
    R3-Draft-/Shell-Vertrag, C2 und den finalen R4-Diff.
  - Final frisch `65/65`, Katalog `v2 / 80 / 47 / 58`, Syntax, Diff und
    Produktisolation grün; keine neuen Findings und kein offenes P0/P1.
- Restrisiken:
  - `R5/R6 aktuelle Eingabe; R7/R8 Recovery/Save und Commit-Kompatibilität;
    R11 Produktcutover`. Diese Grenzen wurden nicht vorgezogen.
- Changelog:
  - `nicht bemerkenswert`: R4 bleibt vollständig verborgen und verändert weder
    Produktbedienung noch produktive Runtime, Daten, Security oder Betrieb;
    `CHANGELOG.md` bleibt unverändert, kein Release-Cut.
- Commit-Empfehlung:
  - `commitbereit` als ein kohärenter R4-Commit, beispielsweise
    `feat(activity-v2): add isolated search and last-performance lookup`;
    Commit und Push bleiben Owner-Aktionen.
- Archivstatus:
  - `docs/archive/MIDAS Activity V2 R4 Search and Last-Performance Lookup
    Roadmap (DONE).md`; keine Evidence-Datei, kein Deploy und kein SQL.

Owner Recap:

- Die Suche läuft ausschließlich lokal im bekannten Übungskatalog.
- Nach kanonischer Auswahl kann MIDAS die letzte echte Ausführung anzeigen.
- Alte Sätze, Gewichte, Dauer oder Distanz sind nur Gedächtnisstützen und
  werden niemals als aktuelle Leistung übernommen.
- Activity V2 bleibt weiterhin unsichtbar, flüchtig und ohne Save; Activity V1
  bleibt vollständig aktiv.
- CodeRabbit ist für künftige Roadmaps als optionales S5-Abschlussgate korrekt
  installiert und dokumentiert.

Exit: R4 ist bewiesen, dokumentiert und archiviert; R5 darf auf dem realen
R4-Vertrag geplant werden.

---

## Initialer Contract Review der Roadmap

Datum: `2026-08-01`.

Reviewtiefe: `Full`.
<!-- markdownlint-disable MD013 -->

Geprüft wurden alle Pflichtquellen, reale R1-R3-/C2-Runtime, archivierte Verträge, QA HCR-017 bis -021 sowie die initiale `56/56`-/Katalogbaseline. F-ACT-R4-01 bis -13 schließen Lookup-Injection, Snapshotvalidierung, Draftitem-Reconciliation, flüchtigen Cache, lokale Suche, read-only Historie, Callback-/Hidden-Mount-Kompatibilität, Datum und No-Deploy-Scope.

Fresh-Chat-Test: Quellen, Reihenfolge, Gates und Stop-Bedingungen sind ohne Chatverlauf ausführbar; fehlende Fakten werden als Finding geführt. Ergebnis: `PASS - ready for execution chat`; S4 bleibt hinter S1-S3 und `S4R PASS` gesperrt.

<!-- markdownlint-enable MD013 -->

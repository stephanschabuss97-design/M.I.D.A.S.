# MIDAS QA - Health Capture and Reports

Diese Suite besitzt aktuelle, statuslose Regressionstests mit dem Präfix
`HCR-`. Der allgemeine Testfall- und Evidence-Vertrag steht im
[QA-Einstieg](README.md).

## Zuständigkeit

- Activity, Appointments und Breath Timer
- Capture, Charts und gesundheitsbezogene Lesepfade
- Doctor View und Reports
- Profile und Ticker Bar
- fachliche Darstellung und Verarbeitung langfristiger Gesundheitsdaten

## Abgrenzung

- Hydration, Salz, Protein und Medikation gehören `IM-`.
- Pushzustellung und Trendpilot-Entscheidungen gehören `PT-`.
- Reine RLS-, RPC- oder Plattformverträge gehören `BS-`.
- Produktarchitektur bleibt in den zuständigen Module Overviews.

## Stillgelegte IDs

- `HCR-008`: ehemaliger Monthly-Idempotenzvertrag; Monthly Reports entfernt.
- `HCR-011`: ehemaliger Report-Inbox-Lifecycle; Inbox und Archiv entfernt.

Die IDs bleiben historisch reserviert und werden nicht neu verwendet.

## Testfälle

### HCR-001 - Activity erfassen und aggregieren

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Ein isolierter Testtag ohne Activity-Eintrag ist gewählt.
- Aktion: Ungültige Dauer, einen gültigen Eintrag und einen zweiten Eintrag am
  selben Tag speichern; danach Arztansicht und Bericht öffnen.
- Erwartung: Dauer kleiner oder gleich null wird blockiert, pro Tag bleibt ein
  Eintrag und der gültige Datensatz erscheint in Arztansicht und Aggregation.
- Invalidiert durch: Activity-Validierung, Tages-Constraint, Doctor View oder
  Report-Aggregation.
- Cleanup: Den Testeintrag nach der Report-Prüfung wieder löschen.

### HCR-002 - Capture speichert die vier Gesundheitsbereiche

- Vertrag: [Capture Module Overview](<../modules/Capture Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Isolierte Testwerte für BP, Body, Lab und Training sind
  vorbereitet.
- Aktion: Datum wechseln, Pflichtfelder leer absenden, danach gültige Werte
  speichern und die Reset-Aktionen ausführen.
- Erwartung: Pflichtfelder blockieren ungültige Saves, gültige Daten erscheinen
  im richtigen Tag und in der Arztansicht, Reset leert nur die Formfelder.
- Invalidiert durch: Capture-, Validierungs-, Datums-, Save- oder Reset-Änderungen.
- Cleanup: Alle vier eindeutig markierten Testereignisse wieder löschen.

### HCR-003 - Appointments CRUD und Statusfilter

- Vertrag: [Appointments Module Overview](<../modules/Appointments Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Ein eindeutig benannter Testtermin ist vorbereitet.
- Aktion: Termin anlegen, zwischen Offen/Erledigt/Neu wechseln, auf erledigt
  setzen, zurücksetzen und abschließend löschen.
- Erwartung: Liste und Ticker aktualisieren, Filter zeigen nur passende
  Zustände und alle Aktionen funktionieren in Offen- und Erledigt-Ansicht.
- Invalidiert durch: Appointments-CRUD, Statusmodell, Tabs, Realtime oder Ticker.
- Cleanup: Der Testtermin wird im letzten Aktionsschritt gelöscht.

### HCR-004 - Appointments Darstellung und Upcoming-Vertrag

- Vertrag: [Appointments Module Overview](<../modules/Appointments Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Mindestens ein geplanter und ein erledigter Termin existieren.
- Aktion: Appointments auf Mobile öffnen und `getUpcoming()` über einen
  direkten Consumer verwenden.
- Erwartung: Cards bleiben kompakt ohne horizontale Überbreite, Datum und Zeit
  erscheinen als `dd.mm.yyyy` und `HH:mm`, und Upcoming liefert nur kommende
  offene Termine.
- Invalidiert durch: Appointments-Layout, Datumsformat, Statusfilter oder
  `getUpcoming()`.

### HCR-005 - Ticker im Sieben-Tage-Fenster

- Vertrag: [Ticker Bar Module Overview](<../modules/Ticker Bar Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Testtermine innerhalb und außerhalb des Sieben-Tage-Fensters
  sind verfügbar.
- Aktion: UI vor dem Fenster, innerhalb des Fensters und ab Startzeitpunkt
  aktualisieren; mehrere Termine und Reduced Motion prüfen.
- Erwartung: Der Ticker erscheint nur im Fenster, kombiniert mehrere Termine
  ruhig, verschwindet ab Start beim nächsten Refresh und respektiert Safe Area
  sowie reduzierte Bewegung.
- Invalidiert durch: Ticker-Fenster, Terminformat, Refresh, Safe Area oder Motion.

### HCR-006 - Charts Range, A11y und Trendpilot-Bänder

- Vertrag: [Charts Module Overview](<../modules/Charts Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: BP- und Body-Daten sowie Trendpilot-Ereignisse liegen im
  gewählten Zeitraum vor.
- Aktion: Range wechseln, Tooltip per Maus und Tastatur öffnen und den
  Body-Composition-Toggle betätigen.
- Erwartung: Daten und Bänder entsprechen dem Zeitraum, Tooltip ist per
  Tastatur nutzbar und BIA-Balken, Status und Trendpfeile folgen dem Toggle.
- Invalidiert durch: Charts, Range-Queries, A11y, Trendpilot-Bänder oder Body-Toggle.

### HCR-007 - Doctor View Range und Unlock

- Vertrag: [Doctor View Module Overview](<../modules/Doctor View Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Doctor View ist gesperrt und Gesundheitsdaten liegen im
  gewählten Zeitraum vor.
- Aktion: Zugriff ohne und mit Unlock versuchen und BP, Body, Lab sowie Training
  für einen begrenzten Zeitraum laden.
- Erwartung: Ohne Unlock bleibt die Ansicht geschlossen; danach erscheinen nur
  Daten des gewählten Zeitraums in der vorgesehenen Struktur.
- Invalidiert durch: Doctor-Unlock, Range-Queries oder Doctor-View-Darstellung.

### HCR-009 - Range-Bericht validiert Eingaben atomar

- Vertrag: [Reports Module Overview](<../modules/Reports Module Overview.md>)
- Ebene: remote
- Ausführung: manual
- Wirkung: productive
- Voraussetzung: Owner-Freigabe und kontrollierte Report-Testdaten sind vorhanden.
- Aktion: Fehlende oder ungültige Range, ungültigen `report_type`, ungültiges
  JSON und anschließend einen gültigen Zeitraum senden.
- Erwartung: Ungültige Requests liefern HTTP 400 ohne Report-Write; nur der
  gültige Request erzeugt einen vollständigen Bericht.
- Invalidiert durch: Request-Parser, Range-Validierung, Report-Type oder Write-Pfad.
- Runbook: [Edge Function Deploy Smoke](runbooks/edge-function-deploy-smoke.md)

### HCR-010 - Bericht behandelt Medication-Reads atomar

- Vertrag: [Reports Module Overview](<../modules/Reports Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Leere, erfolgreiche und fehlerhafte Medication-/Slot-Reads
  können isoliert simuliert werden.
- Aktion: Für alle drei Zustände einen Range-Bericht anfordern.
- Erwartung: Erfolgreiche Leere bleibt als Leere erkennbar, aktive Medikation
  wird strukturiert dargestellt und ein Read-Fehler erzeugt weder Teilbericht
  noch `health_events`-Write.
- Invalidiert durch: Medication-Reader, Report-Aufbau oder atomaren Write-Vertrag.
- Cleanup: Isolierte Testdatenbank beziehungsweise Mocks verwerfen.

### HCR-012 - Profilzustände und Consumer-Refresh

- Vertrag: [Profile Module Overview](<../modules/Profile Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Profil kann als vorhanden, leer und fehlerhaft geladen werden.
- Aktion: Profil laden, ungültige E-Mail testen, gültige Änderung speichern
  und Charts sowie Assistant-Consumer beobachten.
- Erwartung: Lade-, Leer- und Fehlerzustand bleiben unterscheidbar,
  HTML5-Mailvalidierung greift und `profile:changed` aktualisiert die Consumer
  genau einmal.
- Invalidiert durch: Profile-CRUD, Validierung, Events oder Consumer-Listener.
- Cleanup: Den zuvor gesicherten Profilstand wiederherstellen.

### HCR-013 - Profil-Medikationssnapshot bleibt read-only

- Vertrag: [Profile Module Overview](<../modules/Profile Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Einmal einfache und einmal mehrteilige Medikation ist aktiv.
- Aktion: Profil öffnen und Medication-Snapshot sowie leeren und fehlerhaften
  Read-Zustand prüfen.
- Erwartung: Plan-Zusammenfassung ist lesbar, Leere und Fehler unterscheiden
  sich, Profil-Save schreibt keine Legacy-Medikation und es gibt keine sichtbare
  Push-Steuerung.
- Invalidiert durch: Profil-Medication-Reader, Snapshot-Copy oder Profile-Save.

### HCR-014 - Atemtimer-Zustandsmaschine und Darstellung

- Vertrag: [Breath Timer Module Overview](<../modules/Breath Timer Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Atemtimer ist auf Desktop und Mobile verfügbar.
- Aktion: Drei- und Fünf-Minuten-Preset starten, Atemphasen beobachten, den
  zweistufigen Abbruch einmal verfallen lassen und einmal bestätigen sowie einen
  Lauf regulär abschließen.
- Erwartung: Countdown und 3s/4s-Phasen bleiben synchron, der erste Abbruch-Tap
  beendet nichts, Abschluss oder bestätigter Abbruch räumt den Timer vollständig
  auf und kehrt in denselben BP-Kontext zurück.
- Invalidiert durch: Atemtimer-State, Zeitquelle, Abbruchfenster, BP-Guards oder
  Animation.

### HCR-015 - Arzt-Bericht bleibt ein atomarer Singleton

- Vertrag: [Reports Module Overview](<../modules/Reports Module Overview.md>)
- Ebene: remote
- Ausführung: manual
- Wirkung: productive
- Voraussetzung: Owner-Freigabe, gültige Session und ein gesicherter aktueller
  Bericht oder ein verifizierter Zero-State liegen vor.
- Aktion: Einen gültigen Zeitraum bis maximal 400 inklusive Tage erzeugen und
  danach denselben Bericht mit einem anderen gültigen Zeitraum ersetzen.
- Erwartung: Es existiert höchstens ein `range_report`; ID und `created_at`
  bleiben beim Replacement stabil, Inhalt und `generated_at` werden erneuert.
  Ein Build-, Read- oder Updatefehler bewahrt den vorherigen gültigen Bericht.
- Invalidiert durch: Request-Vertrag, Report-Lifecycle, partiellen
  Singleton-Index, Edge-Deploy oder Report-Schema.
- Runbook: [Edge Function Deploy Smoke](runbooks/edge-function-deploy-smoke.md)

### HCR-016 - Doctor View ist report-first und lädt Details sekundär

- Vertrag: [Doctor View Module Overview](<../modules/Doctor View Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Doctor-Unlock ist verfügbar; einmal ein aktueller Bericht und
  einmal ein verifizierter Zero-State können dargestellt werden.
- Aktion: Doctor View öffnen, Current-/Zero-State prüfen, Einzelwerte und
  Verlauf nacheinander öffnen und einen Health Export V2 erzeugen.
- Erwartung: Der aktuelle Bericht oder der ruhige Zero-State erscheint zuerst.
  Einzelwerte und Verlauf laden erst nach explizitem Öffnen; das Chart behält
  seinen Zeitraum-Snapshot. Der Export ist ein atomarer
  `midas.health-export.v2` ohne Owner-ID oder erfundene Messzeitpunkte.
- Invalidiert durch: Doctor-Unlock, Current-Read, Lazy-State, Chart-Range,
  Exportvertrag, responsive Doctor-CSS oder Fokusführung.

### HCR-017 - Activity V2 Semantikvertrag bleibt deterministisch

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>)
  und [R1 Catalog Baseline](<../MIDAS Activity V2 R1 Catalog Baseline Contract.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Node ist verfügbar; R1-Katalog, Testdatei und Baseline
  gehören zum selben Repo-Stand.
- Aktion:
  `node --test app/modules/vitals-stack/activity/v2/semantics.contract.test.js`
  aus dem Repo-Root ausführen.
- Erwartung: Die 78 Baseline-Entries stimmen vollständig überein; Katalog,
  Taxonomien, acht Feldpolicies, neun Fehlercodes, Mutationsschutz, Namespace,
  Normalisierung und die deterministische Suchmatrix einschließlich 565
  Oracle-Abfragen sind grün.
- Invalidiert durch: R1-Katalog, Schema, Validator, Normalisierung, Ranking,
  öffentliche API, Baseline Contract oder Contract-Test.

### HCR-018 - Activity V2 Semantik lädt isoliert im Browser

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Repo-Root wird über einen lokalen statischen HTTP-Server
  bereitgestellt; produktive `index.html` bleibt unverändert.
- Aktion:
  `app/modules/vitals-stack/activity/v2/semantics-harness.html` öffnen und
  Ergebnisliste sowie Browserkonsole prüfen.
- Erwartung: Das klassische Script zeigt `7/7 Contract-Fälle PASS`; die
  Konsole bleibt fehlerfrei, Activity V1 unverändert und der
  `AppModules.activityV2.semantics`-Slot korrekt geschützt.
- Invalidiert durch: Semantikdatei, öffentliche API, Namespacevertrag,
  Browser-Harness oder Script-Ladeform.

### HCR-019 - Activity V2 Datenzugriff bleibt isoliert und deterministisch

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: R1-Semantik, R2-Datenzugriff und beide Contract-Testdateien
  gehören zum selben Repo-Stand.
- Aktion: `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`
  aus dem Repo-Root ausführen und die produktive Script-Reihenfolge prüfen.
- Erwartung: 20/20 Contract-Fälle sind grün. Commit-Requests behalten ihre
  Request-ID über Retries, Responses und Fehler werden strikt abgebildet,
  Lookup liefert einen vollständigen Block oder `null`, und weder
  `data-access.js` noch V2-Semantik werden produktiv durch `index.html` geladen.
- Invalidiert durch: R1-/R2-JS, Supabase-HTTP-Bridge, Namespace,
  Request-/Response-Schema, Fehlertokens oder produktive Script-Reihenfolge.

### HCR-020 - Activity V2 R3 Draft und Shell bleiben isoliert

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>),
  [R3 Roadmap](<../archive/MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap (DONE).md>)
- Ebene: local-runtime + browser
- Ausführung: automated + manual
- Wirkung: read-only; Draft und UI sind flüchtig und lokal
- Voraussetzung: R1-/R2-/R3-JS und Contract-Tests gehören zum selben Repo-Stand;
  der Repo-Root wird für den Harness über einen lokalen HTTP-Server angeboten.
- Aktion: `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`
  ausführen und `session-shell-harness.html` bei 1440x900, 390x844 sowie
  320x800 prüfen; danach mindestens 30 Sekunden in einen Fremdtab wechseln.
- Erwartung: 50/50 Contract-Fälle sind grün. Picker, Items, Reihenfolge, Notiz,
  Fokus, Timer, Discard und Cleanup funktionieren ohne Konsolen- oder
  Viewportfehler; Items und Notiz bleiben beim Tabwechsel unverändert, die
  Zeitstempeluhr läuft fort. `index.html`, Activity V1, Netzwerk, Storage und
  R2-RPCs bleiben unberührt.
- Invalidiert durch: R1-/R3-JS oder CSS, Harness, Draft-/Shell-API,
  Lifecycle-/Fokusvertrag, produktive Script-Reihenfolge oder neue
  Netzwerk-/Storage-Nutzung.

### HCR-021 - Activity V2 C2 Katalog v2 und Studio-Suche bleiben vertragsgleich

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>),
  [C2 Catalog Contract](<../MIDAS Activity V2 C2 Catalog Version 2 Contract.md>)
  und [C2 Roadmap](<../archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap (DONE).md>)
- Ebene: local-runtime + static
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: R1-/R3-/C2-Semantik, maschinenlesbarer C2-Vertrag, SQL 21
  und Katalog-Inspector gehören zum selben Repo-Stand.
- Aktion: Gesamte Activity-V2-Contract-Suite ausführen und danach
  `node tools/activity-catalog.mjs check` sowie die produktive Scriptgrenze
  prüfen.
- Erwartung: 56/56 Contract-Fälle sind grün. Katalog v1 bleibt exakt 78;
  Katalog v2 besitzt 80 aktive Entries, 47 Aliasergänzungen an 24 Basis-Keys
  und ausschließlich die neuen Keys `high_row`/`total_abdominal`. Alle 58
  Suchfälle, jede Alias-Rang-1-/Kollisionsprüfung, R3-Injection sowie
  Contract-/Runtime-/SQL-Parität sind grün. `index.html`, Activity V1,
  Netzwerk, Storage und R2-RPC-Aufrufe bleiben unberührt.
- Invalidiert durch: C2-Vertrag, `semantics-v2.js`, C2-Contract-Test, SQL 21,
  R1-Semantik/API, R3-Injection, Ranking oder produktive Script-Reihenfolge.

### HCR-022 - Activity V2 R4 Suche und letzte Ausführung bleiben isoliert

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>)
  und [R4 Roadmap](<../archive/MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap (DONE).md>)
- Ebene: local-runtime + browser + static
- Ausführung: automated
- Wirkung: read-only; Shellcache und Draft bleiben flüchtig und lokal
- Voraussetzung: R1-R4-/C2-JS, CSS, Harness und Contract-Tests gehören zum
  selben Repo-Stand; der Repo-Root wird für den Harness über einen lokalen
  HTTP-Server angeboten.
- Aktion: `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`
  und `node tools/activity-catalog.mjs check` ausführen; danach
  `session-shell-harness.html` bei 1440x900, 390x844 und 320x800 prüfen und
  mindestens 30 Sekunden in einen Fremdtab wechseln.
- Erwartung: 65/65 Contract-Fälle sind grün. Suche bleibt lokal und auf acht
  kanonische Treffer begrenzt; Hidden Mount und Tippen erzeugen keinen Lookup.
  Loading, Success, Empty und Error sind getrennt, historische Snapshots und
  vollständige Satzreihenfolge erscheinen ausschließlich read-only. Pro Key
  erfolgt höchstens ein automatischer Lookup je Mount, Retry nur explizit;
  verspätete Antworten respektieren Remove, Close, Guard und Destroy. Drei
  Viewports bleiben ohne horizontalen Overflow, hostile Markup bleibt Text,
  Konsole und Remote-Requestlog sind leer. Nach dem Fremdtab bleiben Draft,
  Notiz und Historie identisch, der Timer ist fortgeschritten und der
  Lookupzähler unverändert. `index.html`, Activity V1, SQL/RPC/RLS/ACL/Grants,
  `commitSession`, Draftschema, Storage und Save bleiben unverändert.
- Invalidiert durch: R4-Data-Access-/Shell-JS, Shell-CSS, Harness,
  R4-Contracttests, C2-Semantik/API, R3-Draft-/Lifecyclevertrag, produktive
  Script-Reihenfolge oder neue Netzwerk-/Storage-/SQL-Nutzung.

### HCR-023 - Activity V2 R5 Strength-Set-Editor bleibt isoliert

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>)
  und [R5 Roadmap](<../archive/MIDAS Activity V2 R5 Strength Set Editor Roadmap (DONE).md>)
- Ebene: local-runtime + browser + static
- Ausführung: automated + manual
- Wirkung: read-only; Draft und UI bleiben flüchtig und lokal
- Voraussetzung: R1-R5-/C2-JS, CSS, Harness und Contract-Tests gehören zum
  selben Repo-Stand; der Repo-Root wird für den Harness über einen lokalen
  HTTP-Server angeboten.
- Aktion: `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`
  und `node tools/activity-catalog.mjs check` ausführen; danach die Harness-
  Routen `empty`, `policies`, `history` und `all` bei 1440x900, 390x844 und
  320x800 prüfen und mindestens 30 Sekunden in einen Fremdtab wechseln.
- Erwartung: 81/81 Contract-Fälle sind grün. Das Draftschema v2 besitzt die
  exakte Set-API und die vereinbarten Setkeys; alle acht realen Strength-
  Feldpolicies sind fail-closed. Strength-Items beginnen mit drei leeren
  Eingabezeilen, Non-Strength-Items mit `sets: []`; leere Zeilen behaupten
  keine Leistung. Parser, abgeleitete Zustände, 1-bis-50-Grenze, Fokus-,
  Close- und Raceguards bleiben deterministisch. Historie bleibt read-only
  und befüllt den Draft nie vor. Die vier Harness-Fixtures liefern 0/8/4/12
  Items, alle drei Viewports bleiben ohne horizontalen Overflow und die
  Touchziele bei 320px mindestens 44 Pixel hoch. Produktiver Scriptload,
  Netzwerk, Storage, SQL/RPC und `commitSession` bleiben unberührt; Activity
  V1 und `index.html` bleiben unverändert.
- Invalidiert durch: R5-Draft-/Shell-JS, Shell-CSS, Harness und Contracttests;
  R1-/C2-Semantik oder Feldpolicies; R3-/R4-Draft-, Lifecycle- oder
  Historienvertrag; produktive Script-Reihenfolge oder neue Netzwerk-,
  Storage-, SQL-/RPC- oder Commitnutzung.

### HCR-024 - Activity V2 R6 Duration-/Distance-Editor bleibt isoliert

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>)
  und [R6 Roadmap](<../archive/MIDAS Activity V2 R6 Duration and Distance Editor Roadmap (DONE).md>)
- Ebene: local-runtime + browser + static
- Ausführung: automated + manual
- Wirkung: Draft-mutierend nur in flüchtiger isolierter Runtime und Harness;
  keine produktive Schreibwirkung
- Voraussetzung: R1-R6-/C2-JS, CSS, Harness und Contract-Tests gehören zum
  selben Repo-Stand; der Repo-Root wird für den Harness über einen lokalen
  HTTP-Server angeboten.
- Aktion: `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`
  und `node tools/activity-catalog.mjs check` ausführen; die zehn Activity-V2-
  JS-Dateien mit `node --check` prüfen. Danach die Harness-Routen `empty`,
  `policies`, `history` und `all` bei 1440x900, 390x844 und 320x800 prüfen und
  mindestens 30 Sekunden in einen Fremdtab wechseln.
- Erwartung: 85/85 Contract-Fälle sind grün. Draftschema v3 besitzt exakt sechs
  Itemkeys und elf Methoden; alle vier realen `duration`- und sieben
  `duration_distance`-Policies sind fail-closed. Pflichtdauer `1..1440`,
  optionale Distanz `0.01..1000` mit höchstens zwei Dezimalstellen und die
  optionale 500-Codepoint-Itemnotiz bewahren Rohtext und erzeugen ausschließlich
  abgeleitete ungespeicherte Itemzustände. R5-Strength-Sätze einschließlich
  `duration_sec` und `distance_m` bleiben unverändert. Historie bleibt read-only
  und befüllt den Draft nie vor; Sessionuhr und Itemdauer bleiben getrennt.
  Mixed Sessions, Rebuilds, Fokus-, Close-, Background- und Raceguards sind
  deterministisch. Die zwölf Fixture-/Viewportkombinationen bleiben ohne
  horizontalen Overflow, 320px-Touchziele mindestens 44 Pixel hoch. Produktiver
  Scriptload, Activity V1, `index.html`, Netzwerk, Storage/IndexedDB, SQL/RPC,
  Intensität und `commitSession` bleiben unberührt.
- Invalidiert durch: R6-Draft-/Shell-JS, Shell-CSS, Harness und Contracttests;
  R1-/C2-Semantik oder Non-Strength-Feldpolicies; R3-R5-Draft-, Set-,
  Lifecycle- oder Historienvertrag; produktive Script-Reihenfolge oder neue
  Netzwerk-, Storage-, SQL-/RPC-, Intensitäts- oder Commitnutzung.

### HCR-025 - Activity V2 R7 IndexedDB-Draft-Recovery bleibt isoliert

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>),
  [R7 Roadmap](<../archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Roadmap (DONE).md>)
  und [R7 Evidence](<../archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Evidence (DONE).md>)
- Ebene: local-runtime + disposable IndexedDB + browser + static
- Ausführung: automated + manual
- Wirkung: lokaler Write ausschließlich in der getrennten Activity-V2-
  IndexedDB des isolierten Harness; keine produktive Schreibwirkung
- Voraussetzung: R1-R7-/C2-JS, CSS, beide Harnesses und Contracttests gehören
  zum selben Repo-Stand; der Repo-Root wird für den Recovery-Harness über einen
  lokalen HTTP-Server angeboten. Keine echten Gesundheitsdaten verwenden.
- Aktion: `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`
  und `node tools/activity-catalog.mjs check` ausführen; alle zwölf Activity-
  V2-JS-Dateien mit `node --check` prüfen. Danach
  `session-recovery-harness.html` mit den kontrollierten Empty-, Recoverable-,
  Malformed-, Unavailable-, Saving-, Lifecycle-, Degraded-, Conflict- und
  Discard-Fixtures prüfen. Save -> Reload -> Continue sowie Discard ->
  Tombstone -> Reload in realer IndexedDB ausführen; Desktop, 390x844 und
  320x800 sowie Alertdialog, Fokus, Touchziele, Overflow und Konsole prüfen.
- Erwartung: 119/119 Contract-Fälle, Katalog `v2 / 80 / 47 / 58` und Syntax
  `12/12` sind grün. Draft v3 rehydriert exakt mit gespeicherter
  `catalog_version`; die feste DB `midas_activity_v2_recovery` v1 enthält nur
  Store `session_recovery` und Slot `active_session`. Vollständiger Token-/
  Lease-CAS serialisiert höchstens einen Write und hält nur den neuesten
  Pending-Snapshot. Save gilt erst nach Transaction Complete. Discard schreibt
  einen tokenrotierten Generationstombstone; ein alter Tab kann den Draft nicht
  wiederbeleben. Storage-/Discardfehler schließen die RAM-Session nicht.
  Unknown, corrupt und nicht auflösbare Katalogstände bleiben fail-closed; es
  gibt kein stilles Resume, Upgrade oder Delete. Der Recovery-Harness bleibt in
  allen drei Viewports ohne horizontalen Overflow, Touchziele mindestens 44
  Pixel hoch und die Browserkonsole frei von Fehlern. Activity V1,
  `index.html`, `healthlog_db`, Service Worker, Netzwerk, Supabase, SQL/RPC/
  RLS/Grants, `commitSession`, Android und Produktnavigation bleiben unverändert.
- Invalidiert durch: R7-Draft-Restore, Recovery-/Shell-JS, Shell-CSS,
  Recovery-Harness oder Contracttests; Semantik-/Katalogresolver; IDB-Name,
  Version, Store, Slot, Envelope, CAS, Autosave, Lifecycle oder Discardvertrag;
  produktive Script-Reihenfolge oder neue Netzwerk-, Supabase-, SQL-/RPC-,
  Commit-, Service-Worker-, Android- oder Legacy-Storage-Nutzung.

### HCR-026 - Activity V2 R8 Commit und Katalogkompatibilität bleiben isoliert

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>),
  [R8 Roadmap](<../archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Roadmap (DONE).md>)
  und [R8 Evidence](<../archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Evidence (DONE).md>)
- Ebene: local-runtime + disposable PostgreSQL 17 + Browser + produktiver
  SQL-Postcheck + Android-Build; Android Device nicht ausgeführt
- Ausführung: automated + manual + owner-gated SQL
- Wirkung: produktiv ersetzt SQL 22 ausschließlich
  `activity_v2_commit_session(uuid,jsonb)` und reassertiert dessen bestehende
  ACL. Kein Katalog-, Tabellen-, Policy-, Index- oder Sessionwrite; kein Web-,
  Edge- oder APK-Deploy und kein Activity-V1-Write.
- Voraussetzung: R1-R8-/C2-Sources und Tests gehören zum selben Repo-Stand;
  PostgreSQL-Fixtures laufen nur disposable. Produktives SQL erfordert den
  exakten Source-/Hash-/Owner-/ACL-/RLS-/Katalog-Preflight und ein separates
  Owner-Gate. Keine echten Trainingssessions für den Smoke erzeugen.
- Aktion:
  `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`, alle
  Activity-V2-JS-Dateien rekursiv mit `node --check`,
  `node tools/activity-catalog.mjs check` und
  `node tools/activity-v2-r8-isolation.mjs` ausführen. Danach das guarded
  Fixture `sql/tests/22_Activity_V2_Commit_Compatibility_fixture.sql` auf
  PostgreSQL 17 ausführen. Die lokale Test-PWA unter
  `/app/modules/vitals-stack/activity/v2/test-pwa/?fixture=all` für
  Unknown/identischen Retry, Reload, Offline, Races und drei Viewports prüfen.
  Android Debug und Release bauen; ein Device-Smoke darf nur mit eigenem Gate
  und genau einem autorisierten ADB-Gerät beginnen.
- Erwartung: 179/179 Contracts, Syntax 21/21, Katalog
  `v2 / 80 / 47 / 58` und Isolation
  `protected=7, product_v2_loads=0, core_network_edges=0,
  unsafe_diagnostics=0, secret_material=0, recovery_deletes=0,
  local_worker_scope=1`. Das PostgreSQL-17.6-Full-Fixture beweist Forward,
  Rerun, exakten R2-Rollback, Wiederherstellung, v1/v2/v3, Missing/Policy,
  Replay, Responseverlust und zwei Races; Endstand Katalog 78/80/0 und
  Sessions/Items/Sets 0/0/0. Der Browser beweist All, Unknown/Retry,
  Preparing/Committing-Freeze, Reload, Offline, 2-/3-Tab-Races sowie
  1440x900, 390x844 und 320x800. Debug-Merge ist
  `de.schabuss.midas.activityv2test` mit localhost/Cleartext; Release-Merge
  bleibt `de.schabuss.midas` ohne Cleartext und mit Produkt-URL.
- Produktiver Nachweis 2026-08-11: Forward-SHA-256
  `429520e59295939c7f9279a2a694c6f9d7b4770d4bb9106bf8b7d2cb35b3d0e3`;
  RPC-Source R2 `2241cea9…1418e` -> R8 `7cdabca3…5177e`; Katalog 78/80/0
  und Historie 0/0/0 vor/nach, Owner/ACL/RLS/Policies unverändert.
- Bewusste Evidence-Grenze: Der Owner beendete S5 nach der grünen technischen
  Kernmatrix. ADB und Wireless Debugging meldeten 0 Geräte; deshalb gab es
  keine Installation, Reverse-Regel, Force-Stop oder Prozess-Reclaim. Der
  finale CodeRabbit-Null-Lauf blieb nach Korrektur von F-ACT-R8-43 bis -61
  rate-limitiert. Diese beiden Nachweise sind `NOT EXECUTED`, nicht `PASS`.
- Invalidiert durch: Draft-/Recovery-/Commit-/Shell-/Data-Access-JS,
  Semantik/Katalog, SQL 22 oder Rollback, RLS/ACL/Owner/Functionsource,
  Test-PWA-/Worker-/Android-Debuggrenze, Produkt-Scriptload, Activity V1,
  Dual-Write, physisches Recovery-Delete oder ein späterer Produktcutover.

### HCR-027 - Activity V2 R9 History, Correction und Delete bleiben isoliert

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>),
  [R9 Roadmap](<../archive/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Roadmap (DONE).md>)
  und [R9 Evidence](<../archive/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Evidence (DONE).md>)
- Ebene: local-runtime + Browser + disposable PostgreSQL 17/PostgREST +
  produktiver read-only SQL-Postcheck
- Ausführung: automated + manual + einmalig owner-gatetes SQL 23
- Wirkung: produktiv ausschließlich additive Revision/RPC/ACL-Struktur; kein
  Productload, keine reale Activity-V2-Session, Korrektur oder Löschung
- Voraussetzung: R1-R9-/C2-Sources und Tests gehören zum selben Repo-Stand.
  SQL-Fixtures laufen nur disposable. Produktive Mutation-RPC-Smokes bleiben
  verboten, solange keine eigene reale Session und gesonderte Freigabe
  existieren.
- Aktion: `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`,
  rekursive `node --check`-Prüfung und
  `node tools/activity-v2-r8-isolation.mjs` ausführen. Bei SQL- oder Fixture-
  Änderung das guarded Fixture
  `sql/tests/23_Activity_V2_History_Lifecycle_fixture.sql` auf PostgreSQL 17
  vollständig ausführen. Den isolierten R9-Harness bei 1440x900, 390x844 und
  320x800 auf History/Detail/Correction/Delete, Conflict, Unknown Outcome,
  Admission, Fokus, A11y, Overflow und Konsole prüfen. Produktiv nur read-only
  Revision, Funktionsquellen/ACLs, Data-API-Negativgrenze, R8-Kanonik und
  Session-/Item-/Set-Zähler prüfen.
- Erwartung: 208/208 lokale Contracts und Isolation
  `protected=7, product_v2_loads=0, core_network_edges=0,
  unsafe_diagnostics=0, secret_material=0, recovery_deletes=0,
  local_worker_scope=1`. Die Historie ist bounded und keyset-paginiert;
  Details verwenden gespeicherte Snapshots. Correction ist atomarer Vollersatz
  unter Revision-/Content-Dual-CAS, bewahrt Erstellungsidentität und
  ursprüngliche Katalogversion und behandelt Child-UUIDs nicht als fachliche
  Identität. Delete ist ownergebunden, bestätigt, wiederholsicher und cascaded.
  Edit/Edit-, Edit/Delete- und Delete/Delete-Races, Replay und Unknown Outcomes
  bleiben deterministisch. SQL 23 besteht Fresh/Rerun/Drift/Rollback/Race/
  Security; `midas_private` bleibt außerhalb der Data API. Das produktive
  Postimage bleibt 0/0/0 und Activity V1 der einzige sichtbare Consumer.
- Reviewgrenze: Vier erfolgreiche CodeRabbit-Läufe lieferten berechtigte
  Findings, die vollständig korrigiert und revalidiert wurden. Der danach
  angeforderte Null-Lauf endete vor Analyse rate-limitiert; er ist kein PASS,
  sondern eine am 2026-08-13 ausdrücklich owner-akzeptierte, nicht blockierende
  Restunsicherheit. R8-T16/T19 bleiben ebenfalls keine R9-PASS-Evidence.
- Invalidiert durch: R9-Data-Access-/Canonicalization-/Correction-/History-/
  Shell-/CSS-/Harness-/Contractteständerungen; SQL 23, Rollback, Fixture oder
  SQL-16-Grants; Revision-, Cursor-, Snapshot-, Fingerprint-, CAS-, ACL-/RLS-/
  Auth-/Owner-/Search-Path-/Overload-/Data-API- oder Cachevertrag; neue
  Produkt-Scriptloads, Activity-V1-/R7-/R8-Kopplung, reale Lifecycle-Nutzung
  oder späterer Produktcutover.

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

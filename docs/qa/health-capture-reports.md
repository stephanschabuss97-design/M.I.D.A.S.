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

### HCR-008 - Monatsbericht ist idempotent

- Vertrag: [Reports Module Overview](<../modules/Reports Module Overview.md>)
- Ebene: remote
- Ausführung: manual
- Wirkung: productive
- Voraussetzung: Owner-Freigabe, gültige Session und ein Berichtsmonat sind
  vorhanden.
- Aktion: Den Monatsbericht für denselben Monat zweimal erzeugen.
- Erwartung: Der bestehende Monatsbericht wird nachvollziehbar aktualisiert;
  es entsteht kein zweiter logischer Bericht für denselben Monat.
- Invalidiert durch: Monthly-Report-Edge-Function, Upsert-Key oder Report-Schema.
- Runbook: [Edge Function Deploy Smoke](runbooks/edge-function-deploy-smoke.md)

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

### HCR-011 - Report Inbox Lifecycle

- Vertrag: [Reports Module Overview](<../modules/Reports Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Kontrollierte Monats- und Range-Berichte liegen in der Inbox.
- Aktion: Filtern, Anker öffnen, Erzeugungszeit prüfen, einen Bericht neu
  erzeugen, einzeln löschen und danach den gewählten Subtype leeren.
- Erwartung: Filter, `ts/day`-Kontext und Zeit-Fallback sind korrekt; Regenerate,
  Delete und Clear verändern nur die beabsichtigten Berichte.
- Invalidiert durch: Report-Inbox, Filter, Zeit-Fallback, Delete oder Clear.
- Cleanup: Alle für den Test erzeugten Berichte löschen.

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

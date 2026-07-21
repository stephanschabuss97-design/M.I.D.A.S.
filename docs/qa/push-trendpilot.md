# MIDAS QA - Push and Trendpilot

Diese Suite besitzt aktuelle, statuslose Regressionstests mit dem Präfix
`PT-`. Der allgemeine Testfall- und Evidence-Vertrag steht im
[QA-Einstieg](README.md).

## Zuständigkeit

- Incidents und fachliche Pushentscheidung
- Push-Transport und Push-Anteile des Touchlogs
- Scheduler-Verhalten und Reminder-Fälligkeit
- Trendpilot und dessen fachliche Guards

## Abgrenzung

- Medikamenten-Slot-, Einnahme- und Bestandssemantik gehört `IM-`.
- Generische Edge-Runtime-, Grant-, RLS- und Cron-Verträge gehören `BS-`.
- Android-Gerätedarstellung und Widget-Sync gehören `AW-`.
- Produktarchitektur bleibt in den zuständigen Module Overviews.

## Testfälle

### PT-001 - Medication-Schwellen bleiben abschnittsbezogen

- Vertrag: [Push Module Overview](<../modules/Push Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Offene Slots für alle vier Tagesabschnitte und eine steuerbare
  Wien-Zeit sind isoliert vorhanden.
- Aktion: Je Abschnitt vor Reminder, zwischen Reminder und Incident sowie nach
  Incident bewerten.
- Erwartung: Vor der Schwelle entsteht nichts, danach zuerst genau ein Reminder
  und erst später bei weiter offenem Slot ein Incident.
- Invalidiert durch: Medication-Schwellen, Wien-Zeit, Slot-Read oder Severity.
- Cleanup: Isolierte Slots, Delivery-Fixtures und Zeitquelle verwerfen.

### PT-002 - Catch-up und Dedupe senden höchste Fälligkeit

- Vertrag: [Push Module Overview](<../modules/Push Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Mehrere bereits fällige Severity-Stufen desselben Typs und
  Tages sind isoliert vorbereitet.
- Aktion: Engine zweimal sequenziell für denselben Zustand ausführen.
- Erwartung: Der erste Lauf sendet nur die höchste fällige Severity mit eigenem
  Tag; der zweite erzeugt im sequenziellen Pfad keine Wiederholung.
- Invalidiert durch: Catch-up, Delivery-Key, Dedupe oder Notification-Tags.
- Cleanup: Isolierte Delivery- und Push-Fixtures verwerfen.

### PT-003 - BP bleibt ein Abend-Incident

- Vertrag: [Push Module Overview](<../modules/Push Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Tageszustände ohne Morgenmessung, mit nur Morgenmessung und
  mit Morgen-/Abendmessung sind isoliert vorhanden.
- Aktion: Alle Zustände vor und nach 20:00 Wien-Zeit bewerten.
- Erwartung: Nur eine vorhandene Morgenmessung ohne Abendmessung erzeugt ab
  20:00 den vorgesehenen BP-Incident.
- Invalidiert durch: BP-Readmodell, Wien-Zeit oder Incident-Regel.
- Cleanup: Isolierte BP- und Delivery-Fixtures verwerfen.

### PT-004 - Lokale Suppression verlangt frischen Remote-Erfolg

- Vertrag: [Push Module Overview](<../modules/Push Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Subscription-Health kann mit Erfolg, späterem Fehler,
  Failure-Counter, Zukunftszeit und Alter variiert werden.
- Aktion: Suppression für alle Grenzfälle einschließlich sieben Tagen und
  fünf Minuten Zukunftstoleranz auswerten.
- Erwartung: Suppression gilt nur für dieselbe aktive Subscription mit frischem
  echtem Erfolg, keinem späteren Fehler und Failure-Counter null.
- Invalidiert durch: Push-Health, Freshness, Subscription-Mapping oder Clock-Guard.

### PT-005 - Diagnose-Push bleibt fachlich wirkungsfrei

- Vertrag: [Push Module Overview](<../modules/Push Module Overview.md>)
- Ebene: remote
- Ausführung: manual
- Wirkung: productive
- Voraussetzung: Owner-Freigabe, aktive Testsubscription und Zugriff auf den
  Diagnosemodus sind vorhanden.
- Aktion: Einen technischen Diagnose-Push senden und Delivery-/Health-Zustand
  danach lesen.
- Erwartung: Response meldet `diagnostic-sent`, das Gerät erhält eine technische
  Notification, nur `last_diagnostic_*` ändert sich und keine fachliche Delivery
  oder lokale Suppression wird freigeschaltet.
- Invalidiert durch: Diagnosemodus, Health-Write, Delivery-Dedupe oder Suppression.
- Runbook: [Push Runtime Smoke](runbooks/push-runtime-smoke.md)

### PT-006 - Explizites now ist nur im Dry-Run erlaubt

- Vertrag: [Push Module Overview](<../modules/Push Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Incident-Push-Request-Contract ist isoliert testbar.
- Aktion: `now` ohne Dry-Run, mit `dry_run: false`, mit `dry_run: true` sowie den
  unveränderten Defaultpfad ohne `now` senden.
- Erwartung: Die ersten beiden Requests enden vor jeder Nebenwirkung mit HTTP
  400; historischer Dry-Run und Scheduler-Default bleiben erlaubt.
- Invalidiert durch: Request-Parser, Time-Guard oder Trigger-Routing.
- Cleanup: Isolierte Request- und Datenbankadapter verwerfen.

### PT-007 - Partial Delivery bleibt sicher diagnostizierbar

- Vertrag: [Push Module Overview](<../modules/Push Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Eine angenommene und eine fehlschlagende Subscription sind
  isoliert simuliert.
- Aktion: Einen fälligen Push an beide Ziele senden.
- Erwartung: Response trennt `acceptedSubscriptions` und `failedSubscriptions`,
  zeigt nur sichere Metadaten und enthält keine Endpoints oder Push-Keys.
- Invalidiert durch: Web-Push-Adapter, Response-Schema oder Fehlerredaktion.
- Cleanup: Simulierte Subscriptions und Delivery-Fixtures verwerfen.

### PT-008 - Touchlog bildet Push-Health ruhig und korrekt ab

- Vertrag: [Touchlog Module Overview](<../modules/Touchlog Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Zustände vor erster Erinnerung, Maintenance-Hinweis und echter
  Zustellfehler sind darstellbar.
- Aktion: Alle drei Zustände im Touchlog sowie das Profil öffnen.
- Erwartung: Bereitschaft ist kein Fehler, Health-Check offen bleibt Maintenance,
  echter Fehler erscheint als nicht gesund; Profil bleibt frei von Push-UI und
  Roh-Endpunkte bleiben verborgen.
- Invalidiert durch: Touchlog-Push-UI, Health-Mapping, Profile-Surface oder Copy.

### PT-009 - Off-App-Push und WebView-Grenze

- Vertrag: [Push Module Overview](<../modules/Push Module Overview.md>)
- Ebene: device
- Ausführung: owner-observation
- Wirkung: productive
- Voraussetzung: Owner-Freigabe, aktive Chrome/PWA-Subscription und Android-
  WebView-Kontext sind vorhanden.
- Aktion: Diagnose- oder fachlichen Push bei geschlossener App empfangen und
  danach den Status in PWA sowie WebView vergleichen.
- Erwartung: Chrome/PWA zeigt die Systemnotification; WebView wird nicht als
  gesunder Reminder-Push-Master dargestellt.
- Invalidiert durch: Service Worker, Push-Subscription, Android-WebView oder UI.
- Runbook: [Push Runtime Smoke](runbooks/push-runtime-smoke.md)

### PT-010 - Scheduler-Vertrag bleibt gezielt und nachvollziehbar

- Vertrag: [Push Module Overview](<../modules/Push Module Overview.md>)
- Ebene: static
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Workflow und Edge-Function-Request-Contract liegen im Repo vor.
- Aktion: Cron-Ausdrücke, `workflow_dispatch`, Requestfenster und User-Auflösung
  gegeneinander prüfen.
- Erwartung: Es gibt 26 reguläre Runs pro Tag plus manuelle Smokes; Scheduler
  sendet `window=all` und benötigt Secret- oder Request-User-ID.
- Invalidiert durch: Workflow-Cron, Dispatch-Inputs, Payload oder User-Auflösung.

### PT-011 - Push-Hygiene schützt aktive Subscriptions

- Vertrag: [Push Module Overview](<../modules/Push Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Alte Deliveries, alte deaktivierte und aktuelle aktive
  Subscriptions sowie ein isolierter Cron-Job sind vorhanden.
- Aktion: Hygiene-Funktion zweimal ausführen und Owner, ACL, Schedule und Command
  lesen.
- Erwartung: Nur abgelaufene Deliveries und alte deaktivierte Subscriptions
  verschwinden; aktive Subscriptions bleiben, Jobvertrag stimmt und Wiederholung
  ist idempotent.
- Invalidiert durch: Push-Hygiene-SQL, Retention, ACL, Owner oder Cron.
- Cleanup: Isolierte Fixtures und Testjob vollständig entfernen.
- Runbook: [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)

### PT-012 - Trendpilot ist deterministisch und idempotent

- Vertrag: [Trendpilot Module Overview](<../modules/Trendpilot Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Kontrollierte BP-, Body- und Lab-Daten sowie leerer Trendpilot-
  State sind isoliert vorhanden.
- Aktion: Dieselbe Range zweimal als Dry-Run und zweimal persistierend auswerten.
- Erwartung: Dry-Run und persistierter Endstand stimmen fachlich überein;
  Wiederholung erzeugt keine logischen Duplikate und liefert finale IDs/Payloads.
- Invalidiert durch: Trendpilot-Evaluator, Upsert-Key, Merge oder Response-Schema.
- Cleanup: Isolierte Events, State und Health-Fixtures verwerfen.

### PT-013 - Trendpilot validiert Range und Datengates

- Vertrag: [Trendpilot Module Overview](<../modules/Trendpilot Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Ungültige Kalenderdaten und Grenzfälle für BP, Body und Lab
  sind isoliert vorbereitet.
- Aktion: Ungültige Range sowie Daten knapp unter und auf jedem Mindestgate
  auswerten.
- Erwartung: Kalenderfehler werden abgelehnt; BP verlangt zwei Samples pro Woche,
  Body sein Sechs-Wochen-Gate und Lab mindestens zwei Wochen plus zwei Samples.
- Invalidiert durch: Range-Parser, Wochenbildung oder Evaluator-Gates.
- Cleanup: Isolierte Health- und State-Fixtures verwerfen.

### PT-014 - Trendpilot Severity, Kontext und Normalisierung

- Vertrag: [Trendpilot Module Overview](<../modules/Trendpilot Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Datensätze für info, warning, critical, Combined und sechs
  stabile Wochen sind isoliert vorhanden.
- Aktion: Alle Severity-Pfade und anschließend die Baseline-Normalisierung
  auswerten.
- Erwartung: Kontext erscheint nur bei warning/critical, Combined folgt seinen
  Gates und stabile Wochen erzeugen genau ein `baseline-normalized-v1`-Infoevent.
- Invalidiert durch: Severity-Schwellen, Kontext-Gates, Combined oder Baseline.
- Cleanup: Isolierte Trendpilot-Events und State-Fixtures verwerfen.

### PT-015 - Ack-Fortsetzung bleibt nachvollziehbar

- Vertrag: [Trendpilot Module Overview](<../modules/Trendpilot Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Ein bestätigtes Trendpilot-Event kann mit gleichem und späterem
  `window_to` erneut ausgewertet werden.
- Aktion: Beide Varianten nacheinander mergen.
- Erwartung: ACK bleibt erhalten; Fortsetzungsmarker entstehen nur bei echter
  Verlängerung und stale Marker werden vor dem Merge entfernt.
- Invalidiert durch: Trendpilot-Merge, ACK-Persistenz oder Window-Logik.
- Cleanup: Isolierte Event- und State-Fixtures verwerfen.

### PT-016 - Trendpilot UI und Ack-Grenze

- Vertrag: [Trendpilot Module Overview](<../modules/Trendpilot Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Info-, Warning- und Critical-Events mit Chart-Zeiträumen sind
  isoliert sichtbar.
- Aktion: Capture-Pill, Hub, Doctor-Block und BP-Chart öffnen; Warning/Critical
  bestätigen und ESC sowie Overlay-Klick versuchen.
- Erwartung: Alle Events sind im Doctor-Kontext sichtbar, Popup nur für
  warning/critical, ACK nur über den Button und Chart-Bänder passen zur Range.
- Invalidiert durch: Trendpilot-UI, Popup, Ack, Doctor-Block oder Chart-Bänder.
- Cleanup: Isolierte Trendpilot-Events nach dem UI-Test löschen.

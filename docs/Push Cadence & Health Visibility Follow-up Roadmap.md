# Push Cadence & Health Visibility Follow-up Roadmap

## Ziel (klar und pruefbar)

Der bestehende Off-App-Push-Pfad soll nach dem abgeschlossenen Medication-Reminder-Umbau betrieblich schlanker, besser beobachtbar und alltagssicherer werden.

Pruefbare Zieldefinition:

- MIDAS erinnert weiterhin off-app an offene Medication-Abschnitte und die Abend-Blutdruckmessung, ohne dass die App geoeffnet sein muss.
- Die Edge Function bleibt die fachliche Source of Truth fuer `Europe/Vienna`, Due-Logik, Severity, Catch-up und Dedupe.
- GitHub Actions wird von einem allgemeinen Dauer-Tick auf eine gezielte, aber robuste Trigger-Kadenz rund um die fachlichen Schwellen reduziert.
- Scheduler-Optimierung darf keine fachliche Push-Entscheidung in YAML verschieben.
- Der Push-Status wird fuer den Nutzer besser sichtbar, damit ausgeschaltete oder defekte Push-Berechtigungen nicht unbemerkt bleiben.
- Touchlog und Diagnose sollen auf mobilen Geraeten lesbarer werden, damit Push-Fehler nicht hinter schlechter Darstellung verschwinden.
- Es entsteht kein Reminder-Laerm und keine neue native Android-/TWA-Push-Abhaengigkeit.

## Scope

- Ueberpruefung und Optimierung der GitHub-Actions-Kadenz fuer `midas-incident-push`.
- Beibehaltung und Schaerfung des bestehenden Edge-Function-Vertrags:
  - `window=all` als Standard
  - lokale Zeitlogik in `Europe/Vienna`
  - persistente Delivery-Dedupe
  - Catch-up nur mit der hoechsten aktuell faelligen Severity
- Dokumentation der finalen Ziel-Ticks fuer Medication und BP.
- Push-Health-Sichtbarkeit im Profil, Hub oder einem geeigneten Diagnosebereich.
- Verbesserte mobile Lesbarkeit der Push-/Touchlog-Diagnose.
- QA- und Modul-Doku-Sync fuer die neue Betriebsstrategie.

## Not in Scope

- Umbau des Service Workers, solange kein konkreter Fehler im Push-Display-Pfad nachgewiesen ist.
- Native Android Notifications, FCM, AlarmManager oder WorkManager.
- TWA-/WebView-spezifische Push-Sonderlogik.
- Voll personalisierbare Reminder-Zeitfenster pro Medikament oder Nutzer.
- Neue medizinische Fachlogik fuer Medication- oder Blutdruckbewertung.
- Mehrstufige Eskalationsketten ueber `reminder` und `incident` hinaus.
- Push-Spam, Wiederholungsloops oder aggressive Alarmierung.

## Relevante Referenzen (Code)

- `.github/workflows/incidents-push.yml`
- `service-worker.js`
- `app/modules/incidents/index.js`
- `app/modules/profile/index.js`
- `app/core/pwa.js`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- `sql/15_Push_Subscriptions.sql`

## Relevante Referenzen (Doku)

- `docs/archive/Medication Reminder Softening & Push Tuning Roadmap (DONE).md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Profile Module Overview.md`
- `docs/modules/Medication Module Overview.md`
- `docs/modules/Intake Module Overview.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Android Native Auth Module Overview.md`
- `docs/QA_CHECKS.md`

## Guardrails

- MIDAS bleibt ein ruhiges Sicherheitsnetz, kein lauter Reminder-Apparat.
- Off-App-Push muss auch dann funktionieren, wenn die App nicht geoeffnet ist.
- Service Worker bleibt Anzeige- und Empfangsschicht, nicht Scheduler oder fachliche Entscheidungsinstanz.
- Die Edge Function entscheidet fachlich; GitHub Actions triggert nur.
- Weniger Scheduler-Runs duerfen nicht bedeuten, dass faellige Pushes still ausfallen.
- Dedupe bleibt persistent und verhindert Doppelpushes bei Jitter, Retry oder mehreren aktiven Geraeten.
- Push-Health muss ehrlich anzeigen, wenn Remote-Push noch nicht bestaetigt, defekt oder durch Berechtigungen blockiert ist.
- Android Shell, Widget und Native Auth duerfen nicht als Ursache vermutet werden, solange der Web-Push-Pfad selbst korrekt arbeitet.

## Architektur-Constraints

- GitHub Actions Cron ist UTC und nicht timezone-aware.
- Fachliche Due-Zeiten sind lokale `Europe/Vienna`-Zeiten.
- Sommer-/Winterzeit darf nicht durch manuelle saisonale Workflow-Pflege zur Fehlerquelle werden.
- Scheduler-Ticks duerfen bewusst grob sein; die Edge Function muss anhand aktueller lokaler Zeit entscheiden, ob etwas wirklich faellig ist.
- Catch-up-Regel bleibt verbindlich:
  - Wenn erst nach `incident_after` getriggert wird, wird nur `incident` gesendet, nicht zusaetzlich ein rueckwirkender `reminder`.
- Remote-Dedupe bleibt auf Benutzer-Ereignis-Ebene:
  - `user_id`
  - `day`
  - `type`
  - `severity`
  - `source=remote`
- Lokale Notification-Suppression bleibt nur bei gesundem Remote-Pfad erlaubt.
- Diagnose-UI darf technisch sein, muss aber auf Mobile lesbar und bedienbar bleiben.

## Tool Permissions

Allowed:

- GitHub-Actions-Workflow fuer Incident-Push innerhalb dieses Scopes anpassen.
- Edge-Function-Logging, Response-Shape oder Diagnoseausgaben innerhalb dieses Scopes erweitern.
- Profil-/Hub-/Diagnose-UI fuer Push-Health verbessern.
- Touchlog-/Debuglog-Darstellung mobil lesbarer machen.
- Modul-Doku, QA und Roadmap aktualisieren.
- Lokale Syntaxchecks, YAML-Pruefung und gezielte Repo-Scans ausfuehren.

Forbidden:

- Service-Worker-Neuarchitektur ohne konkreten Befund.
- Native Android-Push-Implementierung.
- Neue externe Scheduler- oder Notification-Abhaengigkeiten.
- Reminder-Zeiten in mehreren Modulen separat duplizieren.
- Aenderungen an medizinischer Bewertung ausserhalb des bestehenden Reminder-/Incident-Vertrags.

## Execution Mode

- Sequenziell arbeiten (`S1` bis `S6`).
- `S1` bis `S3` sind bewusst Doku-Detektivarbeit mit Contract Reviews und Risikoanalyse.
- `S4` ist der konkrete Umsetzungsblock mit Code-, Workflow- und optionalen Edge-Aenderungen.
- `S5` ist der technische Pruefblock mit Code Reviews, Contract Reviews und lokal moeglichen Tests.
- `S6` ist der Doku-/QA-/Abschlussblock mit finalem Contract Review.
- Nach jedem Schritt Statusmatrix aktualisieren.
- Nach jedem Schritt mindestens ein Check: Contract-Review, Repo-Scan, Syntaxcheck, YAML-Check oder Smoke-Definition.
- Jeder Hauptschritt endet mit denselben operativen Pflichtpunkten:
  - Schritt-Abnahme
  - Doku-Sync
  - Commit-Empfehlung

## Vorgeschlagene fachliche Default-Richtung

Die bestehende Medication- und BP-Fachlogik bleibt unveraendert.

Verbindliche lokale Schwellen:

- Medication Morning:
  - `10:00` Reminder
  - `12:00` Incident
- Medication Noon:
  - `14:00` Reminder
  - `16:00` Incident
- Medication Evening:
  - `20:00` Reminder
  - `22:00` Incident
- Medication Night:
  - `22:30` Reminder
  - `23:30` Incident
- Abend-Blutdruck:
  - `20:00` Incident, wenn morgens gemessen wurde und abends noch offen ist

Zielbild fuer die Kadenz:

- keine 15- oder 20-Minuten-Fenster
- keine Rueckkehr zu hoher Scheduler-Frequenz ohne konkreten Bedarf
- bevorzugt gezielte Ticks um die fachlichen Schwellen herum
- DST-sicherer Betrieb hat Vorrang vor einer theoretisch perfekten 8-Ticks-YAML
- aktueller naheliegender Zielvertrag: ca. 17 Scheduler-Runs pro Tag statt ca. 48 Runs bei `*/30`

Pragmatische Kadenz-Optionen:

- `A - Robust, aber laut`: `*/30`, ca. 48 Runs pro Tag.
- `B - Ziel-Ticks DST-sicher`: wenige UTC-Ticks, die CET und CEST fuer alle relevanten lokalen Schwellen abdecken.
- `C - Reine 8 lokale Ziel-Ticks`: fachlich elegant, aber nur sauber, wenn Timezone/DST ausserhalb von GitHub-Cron verlaesslich geloest wird.

Vorzugsrichtung:

- Option `B` als Betriebsstandard.
- Konkret aktuell:
  - Hauptfenster: `5 8,9,10,11,12,13,14,15,18,19,20,21 * * *`
  - Nachtfenster: `35 20,21,22 * * *`
  - Nacht-Backup: `50 21,22 * * *`
- Option `C` nur, wenn wir die DST-Komplexitaet bewusst loesen oder saisonale Pflege akzeptieren.

## Deterministischer Vorab-Review (2026-04-25)

Dieser Review ist Teil der Roadmap und grenzt die Follow-up-Idee gegen den bereits abgeschlossenen Push-Umbau ab.

### Eingelesene Referenzen

- `docs/modules/Push Module Overview.md`
- `docs/modules/Profile Module Overview.md`
- `README.md`
- `.github/workflows/incidents-push.yml`
- `app/diagnostics/devtools.js`
- `app/styles/auth.css`
- `app/styles/utilities.css`
- `index.html`
- `docs/QA_CHECKS.md`

### Findings aus Push Module Overview

- Der produktive Push-Vertrag ist bereits aktiv:
  - `reminder`
  - `incident`
  - getrennte Tags
  - Service-Worker-Severity-Auswertung
  - Remote-Dedupe ueber `push_notification_deliveries`
  - Remote-Health ueber `push_subscriptions`
- Off-App-Push ist explizit GitHub Actions plus Edge Function, nicht Service Worker alleine.
- Der Service Worker ist laut Vertrag Anzeige-/Empfangsschicht und nicht fachliche Scheduler-Instanz.
- Das Profilmodul liefert bereits Push-Routing-Status und unterdrueckt lokale Pushes nur bei gesundem Remote-Pfad.
- Die Push-Overview beschreibt den Workflow bereits als gezielte UTC-Ticks statt `*/30`.
- Die Remote-Setup-Notiz nennt aktuell drei Cron-Gruppen:
  - `5 8,9,10,11,12,13,14,15,18,19,20,21 * * *`
  - `35 20,21,22 * * *`
  - `50 21,22 * * *`
- Bekannte Risiken aus der Push-Overview bleiben relevant:
  - Scheduler-Jitter
  - Kadenz muss bei Schwellen-Aenderungen mitgeprueft werden
  - erste Remote-Erfolgsbestaetigung fehlt anfangs
  - Remote-Deployment-Drift zwischen Repo und Backend-Workspace

### Findings aus MIDAS-Constraints

- README setzt harte Produktgrenzen:
  - MIDAS ist single-user
  - Push ist Schutznetz, nicht Dauerberieselung
  - Push nur fuer echte Incidents bzw. relevante offene Pflichtpfade
  - keine generische Health-App
  - keine Reminder-Ketten oder Gamification
  - Android-Huelle darf keine Fachlogik verlagern
- Die Follow-up-Idee passt, wenn sie Verlaesslichkeit, Beobachtbarkeit und weniger Betriebslaerm verbessert.
- Die Follow-up-Idee passt nicht, wenn daraus mehr Push-Frequenz, mehr Eskalation oder native Android-Push-Abhaengigkeit entsteht.

### Contract Review gegen Grundidee

- Ergebnis: Roadmap entspricht der besprochenen Grundidee.
- Begruendung:
  - Scheduler wird optimiert, aber nicht zur fachlichen Entscheidungsquelle.
  - Edge Function bleibt Source of Truth fuer `Europe/Vienna`, Due-Logik, Catch-up und Dedupe.
  - Service Worker wird nicht angefasst, solange kein konkreter Display- oder Payload-Bug nachgewiesen ist.
  - TWA/WebView/Android werden nicht als Push-Transport-Ziel eingefuehrt.
  - Push-Health wird als Sichtbarkeitsproblem behandelt, nicht als neue medizinische Fachlogik.
- Korrektur aus dem Review:
  - Die Roadmap muss klar sagen, dass Option `B` bereits der bevorzugte und aktuell naheliegende Zielvertrag ist.
  - Option `C` mit reinen 8 lokalen Ziel-Ticks bleibt nur Denkmodell, nicht Default, weil GitHub-Cron UTC und nicht DST-aware ist.
  - Die Roadmap darf den bereits geaenderten Workflow nicht als komplett zukuenftige offene Frage darstellen.

### Bruchrisiken / moeglich uebersehene Punkte

- DST-Abdeckung:
  - Ziel-Ticks muessen CET und CEST abdecken.
  - Reine lokale 8-Ticks-YAML kann im Jahreswechsel falsch werden.
- GitHub-Actions-Jitter:
  - Ein Tick um `:05` kann verspaetet laufen.
  - Das ist akzeptabel, solange Dedupe und Catch-up korrekt bleiben und spaete Incidents weiter abgedeckt sind.
- Deployment-Drift:
  - Repo-Doku und Workflow koennen stimmen, waehrend die externe Edge Function im Backend-Workspace nicht deployed ist.
  - Smokechecks muessen deshalb echten Off-App-Push oder mindestens Edge-Function-Response pruefen.
- Remote-Health-Falschpositiv:
  - Ein alter Erfolg darf nicht unbegrenzt als gesunder Push-Pfad gelten, wenn danach Fehler auftreten oder die Berechtigung am Handy ausgeschaltet wurde.
  - Health-Anzeige muss `wartet`, `gesund`, `Fallback` und `Fehler` klar unterscheiden.
- Lokale Suppression:
  - Wenn Remote faelschlich als gesund gilt, koennen lokale Fallback-Pushes unterdrueckt werden und ein stiller Ausfall entstehen.
- Mobile Diagnose:
  - Das aktuelle Diagnosepanel nutzt fixe Spaltenbreiten und `pre`-Logbereiche.
  - Auf kleinen Screens kann das zu abgeschnittenen Toggles, schlechter Scrollbarkeit und schwer lesbaren Logzeilen fuehren.
- Push-Berechtigung ausserhalb der App:
  - Browser-Subscription kann aktiv sein, obwohl System-/Browser-Notification auf dem Geraet deaktiviert wurde.
  - Die Roadmap muss diesen Unterschied als Diagnoseziel festhalten.
- Schwellen-Drift:
  - Wenn Medication-/BP-Schwellen spaeter geaendert werden, muss die Ziel-Kadenz mitgeaendert oder bewusst wieder grober gemacht werden.
- Datenquellen-Drift:
  - Remote Medication muss slot-/abschnittsbasiert bleiben und darf nicht auf Legacy-Dosen zurueckfallen.
- Zu viel Optimierung:
  - Weitere Reduktion unter die DST-sichere Ziel-Kadenz darf nicht auf Kosten von Robustheit gehen.

### Zweiter Contract Review nach Bruchrisiken

- Ergebnis: Die Follow-up-Idee bleibt gueltig, aber nur mit Option `B` als Default.
- No-Go aus dem Review:
  - keine reine 8-Ticks-Umstellung ohne explizite DST-Loesung
  - keine lokale Suppression auf Basis einer bloss vorhandenen Subscription
  - keine neue Android-native Push-Schicht
  - keine Service-Worker-Scheduler-Hypothese ohne Befund
  - keine Reminder-Ketten
- Zusaetzliche Pflicht fuer die Umsetzung:
  - Push-Health muss falsche Sicherheit vermeiden.
  - Mobile Diagnose muss kleinbildschirmtauglich getestet werden.
  - Edge-Function-/Workflow-Drift muss in QA sichtbar werden.

### Vorabnotizen aus der Roadmap-Erstellung (2026-04-25)

- Anlass:
  - Beim Erstellen der Roadmap wurden Push Module Overview, Workflow und MIDAS-Guardrails bereits vorab gegengeprueft.
- Ergebnis fuer die spaetere Analyse:
  - Diese Notizen ersetzen keine spaetere Schritt-Abnahme.
  - Echter Off-App-Push, Edge-Deployment oder GitHub-Run sind noch nicht praktisch validiert.
  - Die Grundabgrenzung fuer die Roadmap bleibt:
    - kein Service-Worker-Umbau
    - kein Android-/TWA-Push-Umbau
    - Fokus auf Betriebslaerm, Health-Sichtbarkeit und Diagnose
- Ergebnis fuer die Kadenzidee:
  - Option `B` steht als bevorzugter Zielvertrag in der Roadmap.
  - Die reine 8-Ticks-Idee bleibt bewusst verworfen bzw. vertagt, solange DST nicht anders geloest ist.
  - Die aktuelle Ziel-Kadenz ist ein robuster Betriebsvertrag, keine fachliche Source of Truth.
- Korrigiertes Finding:
  - Der aktuelle Workflow ruft die Edge Function mit `curl -sS` auf.
  - Ohne `--fail`, `--fail-with-body` oder explizite HTTP-Statuspruefung kann ein HTTP-Fehler der Edge Function als gruener GitHub-Action-Lauf erscheinen.
  - Das gehoert als Pflichtpunkt in den Umsetzungsblock, weil sonst Push-Betriebsfehler zu wenig sichtbar bleiben.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | System- und Vertragsdetektivarbeit Push-Pfad | DONE | DONE-Roadmap, Push Overview, Profile Overview, README, Workflow, Service Worker, Incident Engine, SQL und Backend-Vertrag wurden gegeneinander gelesen; S1-Findings und Contract Review sind dokumentiert. |
| S2 | Kadenz- und Scheduler-Contract Review | DONE | Option `B` ist als Scheduler-Vertrag bestaetigt: DST-sichere Ziel-Ticks mit begrenzter Ueberdeckung; offen fuer `S4` bleibt die Workflow-Haertung gegen gruene HTTP-Fehler. |
| S3 | Push-Health-, Diagnose- und Bruchrisiko-Review | DONE | Health-State, Berechtigungsebenen, lokale Suppression, mobile Diagnose, Android-Abgrenzung und stille Ausfallrisiken wurden analysiert; S4-Pflichtkorrekturen sind dokumentiert. |
| S4 | Umsetzung der gefundenen Punkte | DONE | S4.1-S4.10 sind erledigt: Workflow-Fehlererkennung, Kadenz-Driftcheck, `window=all`, `workflow_dispatch`, Edge-Response-Diagnose, Push-Health-UI, Dev-Push-Diagnose, mobiler Diagnosepanel-Fix, Code Review und Schritt-Abnahme. |
| S5 | Tests, Code Review und Contract Review nach Umsetzung | DONE | Lokal moegliche Checks, statische Workflow-Pruefung, JS-Syntaxchecks, Edge-Function-Strukturchecks, Smoke-Definitionen, Code Review und Contract Review erledigt; echte GitHub-/Device-Smokes bleiben nach Commit beim Nutzer. |
| S6 | Doku-Sync, QA-Update und finaler Abschlussreview | TODO | Modul-Overviews, QA, Roadmap-Status, Abschluss-Contract-Review und Commit-/Archiv-Empfehlung finalisieren. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Wiederkehrende Abschluss-Substeps pro Hauptschritt

Diese Abschluss-Substeps gelten fuer jeden Hauptschritt `S1` bis `S6` und sollen jeweils als letzte Substeps mitgefuehrt werden.

- `letzter fachlicher Substep + 1: Schritt-Abnahme`
  - Ergebnis gegen den Ziel-Contract des Schritts pruefen
  - betroffene Dateien auf Drift zwischen Scheduler, Edge Function, Doku und QA pruefen
  - gezielte Contract-/Syntax-/Smoke-Checks fuer den Schritt ausfuehren
- `danach: Doku-Sync`
  - betroffene Modul-Overviews sofort aktualisieren, wenn sich Verhalten oder Guardrails geaendert haben
  - bei Bedarf auch `docs/QA_CHECKS.md` nachziehen
- `danach: Commit-Empfehlung`
  - explizit festhalten, ob nach dem Schritt ein Commit sinnvoll ist
  - wenn `kein Commit`, kurz begruenden, was noch logisch zusammengehoert

## Schritte + Subschritte

### S1 - System- und Vertragsdetektivarbeit Push-Pfad

- S1.1 `docs/archive/Medication Reminder Softening & Push Tuning Roadmap (DONE).md` auf den finalen Push-Vertrag reduzieren.
- S1.2 `docs/modules/Push Module Overview.md` vollstaendig gegen diesen Vertrag lesen.
- S1.3 `docs/modules/Profile Module Overview.md` auf Push-Opt-in, Remote-Health und lokale Suppression lesen.
- S1.4 Relevante Code-Referenzen fuer den Vertrag querlesen:
  - `app/modules/incidents/index.js`
  - `service-worker.js`
  - `app/modules/profile/index.js`
  - `sql/15_Push_Subscriptions.sql`
- S1.5 Backend-/Edge-Vertrag gegen die Roadmap aufnehmen:
  - Edge Function als Source of Truth
  - slot-/abschnittsbasierte Medication-Datenquelle
  - persistentes Remote-Dedupe
  - Health-Updates pro Subscription
- S1.6 Contract Review gegen MIDAS-Guardrails:
  - single-user
  - Push nur als Schutznetz
  - keine Reminder-Ketten
  - keine native Android-Push-Verlagerung
- S1.7 Findings und offene Fragen in der Roadmap dokumentieren.
- S1.8 Schritt-Abnahme:
  - klare Trennung zwischen bereits erledigtem Push-Umbau und diesem Follow-up
  - keine offene Service-Worker- oder Android-Hypothese ohne Befund
- Output: belastbare Systemkarte des aktuellen Push-Pfads.
- Exit-Kriterium: keine unklare Vermischung zwischen DONE-Roadmap, Modulvertrag, Workflow und aktuellem Follow-up-Ziel.

#### S1 Ergebnisprotokoll (abgeschlossen)

##### S1.1 Historischer Vertrag aus DONE-Roadmap
- Die DONE-Roadmap ist fachlich weiterhin die Basis fuer:
  - gestaffelte Medication-Severity `reminder` -> `incident`
  - fixe Abschnittsschwellen fuer `morning/noon/evening/night`
  - BP als strengerer Abend-Incident
  - Service-Worker-Severity-Vertrag
  - externen Off-App-Push ueber Edge Function
  - persistentes Remote-Dedupe
  - lokale Suppression nur bei gesundem Remote-Pfad
- Historischer Driftpunkt:
  - Die DONE-Roadmap hatte in `S5/S6` noch den `*/30`-Scheduler als finalen Betriebsentscheid.
  - Der aktuelle Modulvertrag und Workflow sind bereits auf gezielte UTC-Ticks umgestellt.
  - Dieser Follow-up ist deshalb kein erneuter Medication-Reminder-Umbau, sondern eine Betriebs- und Diagnose-Nacharbeit.

##### S1.2 Aktueller Push Module Vertrag
- `docs/modules/Push Module Overview.md` beschreibt den aktuellen Vertrag konsistent:
  - lokaler und externer Pfad sprechen denselben `type/severity/tag`-Vertrag
  - Off-App-Push laeuft ueber GitHub Actions plus Edge Function
  - Service Worker ist Anzeige-/Empfangsschicht, nicht Scheduler
  - Workflow nutzt gezielte UTC-Ticks statt `*/30`
  - Edge Function entscheidet fachlich in `Europe/Vienna`
  - Remote-Dedupe laeuft ueber `push_notification_deliveries`
  - lokale Suppression greift nur bei nachweislich gesundem Remote-Pfad
- Relevanter S1-Befund:
  - Die Push-Overview ist fuer den aktuellen Zielzustand bereits naeher an der Realitaet als die alte DONE-Roadmap.
  - Die alte DONE-Roadmap bleibt historische Referenz, aber nicht mehr alleiniger aktueller Scheduler-Vertrag.

##### S1.3 Lokale Incident Engine
- `app/modules/incidents/index.js` ist weiterhin der lokale Rechner fuer App-laufende Pushes.
- Medication-Schwellen sind im lokalen Pfad aktiv:
  - `morning`: Reminder `10:00`, Incident `12:00`
  - `noon`: Reminder `14:00`, Incident `16:00`
  - `evening`: Reminder `20:00`, Incident `22:00`
  - `night`: Reminder `22:30`, Incident `23:30`
- Lokale Medication-Payloads tragen:
  - `data.type`
  - `data.severity`
  - `data.dayIso`
  - `data.source = local`
- Lokale Tags sind getrennt:
  - `midas-reminder-...`
  - `midas-incident-...`
- Lokale Suppression ruft `AppModules.profile.getPushRoutingStatus()` bzw. `shouldSuppressLocalPushes()` ab und unterdrueckt nur bei gesundem Remote-Pfad.
- S1-Abgrenzung:
  - Dieser lokale Pfad kann nicht die App wecken.
  - Echter Off-App-Push bleibt Aufgabe von Scheduler plus Edge Function.

##### S1.4 Service Worker Vertrag
- `service-worker.js` wertet `data.severity` primaer aus.
- Fallbacks bleiben bewusst vorhanden:
  - `midas-reminder-*` -> `reminder`
  - `midas-incident-*` -> `incident`
  - bekannte Legacy-Typen -> `incident`
- Incident-Defaults werden nur fuer fachliche Incidents gesetzt:
  - Vibration
  - `requireInteraction`
  - Action `Jetzt oeffnen`
- S1-Contract-Entscheidung:
  - Es gibt keinen aktuellen Befund fuer einen Service-Worker-Umbau.
  - Der Service Worker bleibt im Follow-up nur Referenz- und Review-Flanke, nicht primaerer Umsetzungsgegenstand.

##### S1.5 Profil-, Subscription- und Health-Vertrag
- `docs/modules/Profile Module Overview.md` und `app/modules/profile/index.js` bestaetigen:
  - Push-Opt-in liegt im Profil
  - Browser-Subscription wird in `push_subscriptions` gespeichert
  - Remote-Health wird gegen dieselbe Subscription gelesen
  - `remote gesund` gilt nur bei erfolgreicher Remote-Zustellung ohne spaeteren Failure
- `isRemoteSubscriptionHealthy(row)` verlangt:
  - nicht deaktiviert
  - gueltiges `last_remote_success_at`
  - kein spaeteres `last_remote_failure_at`
  - `consecutive_remote_failures <= 0`
- Aktuelle Statusanzeige unterscheidet:
  - `Status: blockiert (Browser)`
  - `Status: bereit (kein Abo)`
  - `Status: aktiv (warte auf Remote-Bestaetigung)`
  - `Status: aktiv (lokales Fallback)`
  - `Status: aktiv (remote gesund)`
- S1-Finding:
  - Der Health-Vertrag ist technisch vorhanden.
  - Die Follow-up-Frage ist nicht, ob Health existiert, sondern ob er fuer den Nutzer und auf Mobile ausreichend sichtbar und verstaendlich ist.

##### S1.6 SQL-/Persistenzvertrag
- `sql/15_Push_Subscriptions.sql` enthaelt:
  - `push_subscriptions`
  - Health-Felder fuer Remote-Versuche, Erfolg, Fehlergrund und Failure-Counter
  - `push_notification_deliveries`
  - Unique-Dedupe auf `user_id/day/type/severity/source`
- S1-Finding:
  - Persistente Remote-Dedupe- und Health-Grundlage ist vorhanden.
  - Kein S1-Befund fuer neue Tabellen oder neues Persistenzmodell.

##### S1.7 Edge-Function-Vertrag
- Die externe Edge Function liegt ausserhalb dieses Repos:
  - `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- Gelesener Stand:
  - Auth ueber Service-Role-Bearer
  - Default-Zeitzone `Europe/Vienna`
  - `window`: `med`, `bp`, `all`
  - `trigger`: `scheduler`, `manual`
  - optional `dry_run`
  - Medication liest slot-/abschnittsbasiert aus:
    - `health_medications`
    - `health_medication_schedule_slots`
    - `health_medication_slot_events`
  - BP liest `v_events_bp`
  - Remote-Dedupe liest/schreibt `push_notification_deliveries`
  - Subscription-Health wird bei Erfolg/Fehler aktualisiert
  - `404/410` koennen Subscriptions deaktivieren
- S1-Finding:
  - Edge Function ist fachlich die richtige Source of Truth fuer echten Off-App-Push.
  - Backend-Deployment-Drift bleibt ein Risiko, weil dieser Code ausserhalb des Frontend-Repos liegt.

##### S1.8 Contract Review gegen MIDAS-Guardrails
- Ergebnis: S1-Vertrag passt zu MIDAS.
- Begruendung:
  - MIDAS bleibt single-user.
  - Push bleibt Schutznetz fuer offene Medication und Abend-BP.
  - Es entstehen keine Reminder-Ketten.
  - Service Worker bleibt Anzeige-/Empfangsschicht.
  - Android Shell, Widget und Native Auth verlagern keine Push-Fachlogik.
  - Edge Function bleibt die fachliche Remote-Entscheidungsstelle.
  - Lokale Suppression bleibt an verifizierten Remote-Health gekoppelt.
- Korrektur aus dem Review:
  - Service Worker und Android werden in dieser Roadmap nur geprueft, aber nicht umgebaut, solange kein konkreter Befund entsteht.
  - Workflow-Haertung und Health-/Diagnose-Sichtbarkeit sind die plausiblen Umsetzungsachsen fuer spaetere Schritte.

##### S1.9 Offene Punkte fuer S2/S3
- S2 muss den Scheduler-Vertrag jetzt detailliert pruefen:
  - Ziel-Ticks
  - UTC/DST
  - `window=all`
  - HTTP-Fehlerverhalten des Workflows
- S3 muss Health- und Diagnose-Sichtbarkeit detailliert pruefen:
  - Browser Permission vs. System-Notification
  - Remote-Health-Falschpositiv
  - lokale Suppression
  - mobile Touchlog-/Diagnose-Darstellung
- S1-Abnahme:
  - Es bleibt keine offene S1-Hypothese, dass Service Worker oder Android/TWA der primaere Push-Bruch sind.
  - Die Systemkarte ist ausreichend, um in `S2` Kadenz und Workflow-Fehlerverhalten gezielt zu reviewen.
- S1 Commit-Empfehlung:
  - Kein separater Commit nur fuer S1 noetig, wenn `S2/S3` direkt folgen.
  - Wenn pausiert wird, ist die Roadmap-Aktualisierung als Doku-Commit sinnvoll.

### S2 - Kadenz- und Scheduler-Contract Review

- S2.1 Aktuellen Workflow `.github/workflows/incidents-push.yml` lesen.
- S2.2 Ziel-Ticks gegen fachliche Schwellen pruefen:
  - `10:00`
  - `12:00`
  - `14:00`
  - `16:00`
  - `20:00`
  - `22:00`
  - `22:30`
  - `23:30`
- S2.3 UTC/DST-Vertrag pruefen:
  - GitHub Cron ist UTC
  - Edge Function entscheidet in `Europe/Vienna`
  - CET und CEST muessen abgedeckt sein
- S2.4 Option `A`, `B`, `C` gegeneinander bewerten:
  - `*/30`
  - DST-sichere Ziel-Ticks
  - reine 8 lokale Ziel-Ticks
- S2.5 Workflow-Fehlerverhalten pruefen:
  - HTTP-4xx/5xx duerfen nicht als gruene Action-Laeufe enden
  - Response-Diagnose darf keine Secrets leaken
- S2.6 Contract Review gegen Grundidee:
  - Scheduler triggert nur
  - Edge Function entscheidet fachlich
  - Dedupe und Catch-up bleiben zentral
- S2.7 Findings und Korrekturempfehlung in der Roadmap dokumentieren.
- S2.8 Schritt-Abnahme:
  - finaler Scheduler-Zielvertrag steht
  - kein Fachentscheid wurde in YAML verschoben
- Output: finaler Kadenz- und Workflow-Vertrag.
- Exit-Kriterium: klarer Umsetzungsauftrag fuer Workflow-Haertung und ggf. Kadenzkorrektur.

#### S2 Ergebnisprotokoll (abgeschlossen)

##### S2.1 Workflow-Ist-Stand
- `.github/workflows/incidents-push.yml` ist bereits auf gezielte UTC-Ticks umgestellt.
- Aktuelle Cron-Gruppen:
  - Hauptfenster: `5 8,9,10,11,12,13,14,15,18,19,20,21 * * *`
  - Nachtfenster: `35 20,21,22 * * *`
  - Nacht-Backup: `50 21,22 * * *`
- Der Scheduler sendet standardmaessig:
  - `trigger = scheduler`
  - `window = all`
- `workflow_dispatch` bleibt mit optionalem `window` erhalten:
  - `med`
  - `bp`
  - `all`
- Ergebnis:
  - Der Workflow ist bereits Taktgeber, nicht fachliche Entscheidungsinstanz.

##### S2.2 Ziel-Ticks gegen fachliche Schwellen
- Fachliche lokale Schwellen:
  - `10:00` Morning Reminder
  - `12:00` Morning Incident
  - `14:00` Noon Reminder
  - `16:00` Noon Incident
  - `20:00` Evening Reminder plus Abend-BP-Incident
  - `22:00` Evening Incident
  - `22:30` Night Reminder
  - `23:30` Night Incident
- UTC-Abdeckung fuer Hauptschwellen:
  - `10:00` lokal -> `09:05 UTC` in CET, `08:05 UTC` in CEST
  - `12:00` lokal -> `11:05 UTC` in CET, `10:05 UTC` in CEST
  - `14:00` lokal -> `13:05 UTC` in CET, `12:05 UTC` in CEST
  - `16:00` lokal -> `15:05 UTC` in CET, `14:05 UTC` in CEST
  - `20:00` lokal -> `19:05 UTC` in CET, `18:05 UTC` in CEST
  - `22:00` lokal -> `21:05 UTC` in CET, `20:05 UTC` in CEST
- UTC-Abdeckung fuer Nacht:
  - `22:30` lokal -> `21:35 UTC` in CET, `20:35 UTC` in CEST
  - `23:30` lokal -> `22:35 UTC` in CET, `21:35 UTC` in CEST
- Ergebnis:
  - Alle fachlichen Schwellen sind in CET und CEST abgedeckt.
  - Die Ausfuehrung liegt bewusst wenige Minuten nach der Schwelle.

##### S2.3 UTC/DST-Vertrag
- GitHub Actions Cron ist UTC und nicht timezone-aware.
- Die Edge Function berechnet `dayIso`, Stunde und Minute ueber `INCIDENTS_TZ`, Default `Europe/Vienna`.
- Dadurch bleibt die fachliche Due-Entscheidung in der Edge Function.
- Die aktuelle Option-B-Kadenz erzeugt saisonale Ueberdeckung:
  - im Sommer laufen einzelne Winter-Ziel-UTCs als lokale Zwischen-/Spaetticks
  - im Winter laufen einzelne Sommer-Ziel-UTCs als lokale Vor-/Zwischenticks
- Bewertung:
  - Diese Ueberdeckung ist akzeptabel, weil die Edge Function nur bei fachlicher Faelligkeit sendet.
  - Dedupe und Catch-up verhindern fachliche Doppelzustellung.
  - Die Alternative waere saisonale Workflow-Pflege oder komplexere Cron-Monatslogik; beides waere fehleranfaelliger.

##### S2.4 Optionenbewertung
- Option `A - */30`:
  - robusteste Trigger-Abdeckung
  - aber ca. 48 Runs pro Tag
  - mehr Betriebslaerm und GitHub-Actions-Rauschen als noetig
- Option `B - DST-sichere Ziel-Ticks`:
  - aktueller und bevorzugter Zielvertrag
  - ca. 17 Runs pro Tag
  - deckt CET und CEST ohne saisonale Pflege ab
  - laesst Fachlogik in der Edge Function
- Option `C - reine 8 lokale Ziel-Ticks`:
  - fachlich elegant
  - aber mit GitHub-Cron allein nicht sauber timezone-aware
  - wuerde saisonale Pflege oder zusaetzliche Scheduler-Intelligenz erfordern
- Ergebnis:
  - Option `B` bleibt der richtige Kompromiss fuer MIDAS.
  - Option `C` bleibt nur Denkmodell fuer spaeter, nicht Umsetzungsziel dieser Roadmap.

##### S2.5 Workflow-Fehlerverhalten
- Aktueller Befund:
  - Der Workflow ruft die Edge Function mit `curl -sS` auf.
  - `curl` behandelt HTTP-4xx/5xx ohne `--fail` bzw. `--fail-with-body` nicht automatisch als fehlgeschlagenen Prozess.
  - Dadurch kann ein Edge-Function-Fehler als gruener GitHub-Action-Lauf erscheinen.
- Bewertung:
  - Das ist kein Kadenzbruch.
  - Es ist aber ein Betriebsdiagnose-Bruch, weil echte Remote-Push-Ausfaelle weniger sichtbar waeren.
- S2-Korrektur fuer `S4`:
  - Workflow-Call haerten:
    - `curl --fail-with-body`
    - oder explizite HTTP-Statuscode-Pruefung
  - Response/Fehlergrund fuer Diagnose sichtbar lassen
  - keine Secrets in Logs ausgeben

##### S2.6 Window- und Edge-Source-of-Truth-Vertrag
- Edge Function normalisiert `window` auf:
  - `med`
  - `bp`
  - `all`
- Unbekannte oder leere Werte fallen auf `all` zurueck.
- Scheduler-Laeufe nutzen standardmaessig `window=all`.
- `window` bleibt Diagnose-/Betriebsfilter, nicht fachliche Due-Definition.
- Medication- und BP-Faelligkeit werden in der Edge Function anhand lokaler `Europe/Vienna`-Zeit entschieden.
- Ergebnis:
  - Kein Fachentscheid liegt im Workflow.
  - Workflow-Zeiten sind nur Trigger-Gelegenheiten.

##### S2.7 Contract Review gegen Grundidee
- Ergebnis: S2 entspricht der besprochenen MIDAS-Idee.
- Begruendung:
  - Push bleibt Schutznetz, kein Reminder-Laerm.
  - Die Kadenz sinkt deutlich gegenueber `*/30`, ohne Schwellenabdeckung zu verlieren.
  - Edge Function bleibt fachliche Source of Truth.
  - Catch-up und Dedupe bleiben zentral.
  - Keine neue Service-Worker-, Android- oder native Push-Schicht entsteht.
- Korrektur aus dem Review:
  - Nicht weiter unter Option `B` reduzieren, solange DST und GitHub-Jitter nicht anders geloest sind.
  - Workflow-HTTP-Fehlererkennung wird Pflichtpunkt fuer `S4`.

##### S2.8 Schritt-Abnahme und Commit-Empfehlung
- S2-Abnahme:
  - finaler Scheduler-Zielvertrag steht mit Option `B`
  - alle fachlichen Schwellen sind fuer CET und CEST abgedeckt
  - `window=all` bleibt Standard
  - kein Fachentscheid wurde in YAML verschoben
  - der einzige Umsetzungsbefund ist Workflow-Fehlerhaertung
- S2 Commit-Empfehlung:
  - Kein separater Commit nur fuer S2 noetig, wenn `S3` direkt folgt.
  - Wenn pausiert wird, ist die Roadmap-Aktualisierung als Doku-Commit sinnvoll.

### S3 - Push-Health-, Diagnose- und Bruchrisiko-Review

- S3.1 Bestehenden Health-State aus `push_subscriptions` und Profilmodul pruefen:
  - `last_remote_attempt_at`
  - `last_remote_success_at`
  - `last_remote_failure_at`
  - `last_remote_failure_reason`
  - `consecutive_remote_failures`
- S3.2 Push-Berechtigungsebenen getrennt analysieren:
  - Browser Permission
  - System-/Geraete-Notification
  - Browser-Subscription
  - Backend-Subscription
  - Remote-Erfolg
- S3.3 Falsch-positive Remote-Gesundheit analysieren:
  - alter Erfolg nach spaeterem Failure
  - deaktivierte Subscription
  - vorhandene Subscription trotz blockierter System-Notification
- S3.4 Lokale Suppression gegen stille Ausfaelle pruefen.
- S3.5 Mobile Touchlog-/Debuglog-Darstellung pruefen:
  - Panel-Breite
  - Toggles
  - Log-Zeilen
  - Scroll-/Close-Bedienung
- S3.6 Bruchrisiko-Review:
  - DST
  - GitHub-Jitter
  - Backend-Deployment-Drift
  - Remote-Dedupe
  - Legacy-Datenquellen
  - Service-Worker-Fallbacks
- S3.7 Zweiter Contract Review gegen die Produktidee:
  - stabiler Push
  - weniger Betriebslaerm
  - bessere Beobachtbarkeit
  - keine neue Feature-Ausweitung
- S3.8 Findings und Umsetzungsliste finalisieren.
- Output: priorisierte Liste der umzusetzenden Punkte und Bruchrisiken.
- Exit-Kriterium: Umsetzung kann starten, ohne dass offene Analysefragen uebrig sind.

#### S3 Ergebnisprotokoll (abgeschlossen)

##### S3.1 Health-State aus Profil und Persistenz
- `push_subscriptions` bietet die noetigen Remote-Health-Felder:
  - `last_remote_attempt_at`
  - `last_remote_success_at`
  - `last_remote_failure_at`
  - `last_remote_failure_reason`
  - `consecutive_remote_failures`
- Das Profilmodul trennt bereits Browser-Subscription und Remote-Gesundheit.
- `isRemoteSubscriptionHealthy(row)` ist defensiv:
  - deaktivierte Subscription ist nie gesund
  - fehlender Remote-Erfolg ist nie gesund
  - spaeterer Failure ueberstimmt frueheren Erfolg
  - positive `consecutive_remote_failures` verhindern `remote gesund`
- S3-Finding:
  - Der technische Health-Contract ist solide genug.
  - Das Problem liegt primaer in Sichtbarkeit und Eindeutigkeit fuer den Nutzer.

##### S3.2 Berechtigungsebenen
- Fachlich getrennte Ebenen:
  - Browser Permission
  - System-/Geraete-Notification
  - Browser-Subscription
  - Backend-Subscription
  - Remote-Erfolg
- Browserseitig ist `Notification.permission` sichtbar.
- Eine aktive Browser-Subscription beweist aber nicht sicher, dass Android/Samsung/Browser-Notification auf Geraeteebene erlaubt ist.
- S3-Finding:
  - MIDAS darf nicht versprechen, jede System-Notification-Blockade automatisch zu erkennen.
  - Die UI muss stattdessen klar machen: Browser-Abo aktiv ist nicht identisch mit erfolgreich zugestelltem Remote-Push.
  - Fuer S4 braucht es einen sichtbaren Hinweis auf Geraete-/Browser-Einstellungen, wenn Remote-Push nicht bestaetigt oder zuletzt fehlgeschlagen ist.

##### S3.3 Falsch-positive Remote-Gesundheit
- Der aktuelle Health-Algorithmus verhindert die wichtigsten Falschpositiven:
  - alter Erfolg nach spaeterem Failure wird nicht als gesund gewertet
  - deaktivierte Subscription wird nicht als gesund gewertet
  - Failure-Counter blockiert den gesunden Zustand
- Offenes Sichtbarkeitsproblem:
  - `last_remote_failure_reason` existiert in der Persistenz, wird im Profil-Health-Fetch aber nicht als nutzbares Diagnosefeld sichtbar gemacht.
  - Ein Health-Fetch-Fehler wird diagnostisch geloggt, kann fuer den Nutzer aber wie `warte auf Remote-Bestaetigung` wirken.
- S3-Korrektur fuer S4:
  - Health-UI soll mindestens Remote-Zustand, letzten Erfolg, letzten Fehlerzeitpunkt und wenn verfuegbar Fehlergrund sichtbar machen.
  - Health-Fetch-Fehler sollen nicht als gesunder oder neutraler Zustand missverstanden werden.

##### S3.4 Lokale Suppression
- Lokale Suppression ist korrekt an `remoteHealthy` gebunden.
- Bei `warte auf Remote-Bestaetigung`, `lokales Fallback`, fehlender Backend-Subscription oder Failure bleibt lokale App-interne Benachrichtigung moeglich, solange die App laeuft.
- S3-Finding:
  - Kein Umbau der Suppression-Regel noetig.
  - Risiko entsteht nur, wenn die Health-Anzeige dem Nutzer faelschlich Sicherheit vermittelt oder wenn ein alter Remote-Erfolg trotz nicht erkennbarer OS-Blockade als ausreichend empfunden wird.
- S3-Korrektur fuer S4:
  - Texte muessen klar zwischen `Remote gesund`, `Fallback aktiv`, `wartet auf Remote-Bestaetigung` und `blockiert/fehlerhaft` unterscheiden.

##### S3.5 Mobile Touchlog-/Debuglog-Darstellung
- `index.html` zeigt Dev-Toggles und `diagLog` im selben Diagnosepanel.
- Die CSS-Regeln fuer den normalen Diagnosezustand sind auf Mobile nicht ausreichend robust:
  - allgemeine `.panel`-Breite ist nicht explizit auf kleine Screens begrenzt
  - nur der Boot-Error-Sonderfall bekommt ein mobiles Full-Width-Layout
  - Toggles und Log koennen auf schmalen Displays gedrungen, abgeschnitten oder schwer scrollbar wirken
- Der Dev-Push-Toggle bildet aktuell im Wesentlichen `profile.isPushEnabled()` ab.
- S3-Finding:
  - Der Toggle kann `an` wirken, obwohl der Remote-Push noch nicht bestaetigt oder fehlerhaft ist.
  - Genau diese Mehrdeutigkeit passt zum beobachteten Problem: Die Diagnose wirkt technisch aktiv, aber erklaert den echten Remote-Zustand nicht gut genug.
- S3-Korrektur fuer S4:
  - Mobile Diagnosepanel bekommt eine echte kleine-Screen-Variante:
    - sichere Breite innerhalb des Viewports
    - erreichbarer Close-Button
    - getrennt lesbare Toggles und Log-Ausgabe
    - sinnvolle Max-Height und Scrollbarkeit
  - Push-Toggle/Diagnose darf `Browser-Abo aktiv` nicht als `Remote-Push gesund` darstellen.

##### S3.6 Android-Abgrenzung
- `docs/modules/Android Widget Module Overview.md` bestaetigt:
  - Widget ist read-only/passiv
  - keine Reminder-/Push-Interaktion in V1
  - Wake-/Unlock-Catch-up ist Best Effort und kein Background-Push-Ersatz
- `docs/modules/Android Native Auth Module Overview.md` bestaetigt:
  - Native Auth ist Shell-/Auth-Schicht
  - keine MIDAS-Fachlogik
  - kein Push-Transport
- S3-Contract-Entscheidung:
  - Android Widget und Native Auth bleiben ausserhalb der Push-Umsetzung.
  - Keine FCM-, AlarmManager-, WorkManager- oder TWA-Sonderlogik fuer diese Roadmap.

##### S3.7 Bruchrisiko-Review
- DST:
  - Bereits in S2 abgedeckt; bleibt als QA-Risiko bestehen.
- GitHub-Jitter:
  - Durch Edge-Catch-up und Dedupe akzeptabel, solange Ziel-Ticks nicht weiter reduziert werden.
- Backend-Deployment-Drift:
  - Weiterhin relevantes Risiko, weil die Edge Function ausserhalb dieses Repos liegt.
- Remote-Dedupe:
  - Persistente Dedupe ist korrekt, darf durch S4 nicht aufgeweicht werden.
- Legacy-Datenquellen:
  - Edge Function muss slot-/abschnittsbasiert bleiben und darf nicht auf Legacy-Dosen zurueckfallen.
- Service-Worker-Fallbacks:
  - Aktuell kein Befund fuer Umbau; Fallbacks bleiben Review-Flanke.
- Stiller Ausfall:
  - Hauptgefahr ist nicht die fachliche Push-Entscheidung, sondern eine unklare Health-Anzeige oder ein gruen wirkender Workflow trotz HTTP-Fehler.

##### S3.8 Contract Review und Korrekturen
- Ergebnis: S3 besteht den Contract Review, wenn S4 die Sichtbarkeits- und Diagnosekorrekturen uebernimmt.
- Pflichtkorrekturen fuer S4:
  - Workflow-HTTP-Fehler muessen sichtbar fehlschlagen.
  - Health-UI muss Remote-Erfolg, Remote-Fehler und Fallback-Zustand unterscheidbar machen.
  - `last_remote_failure_reason` soll genutzt oder bewusst als nicht verfuegbar markiert werden.
  - Dev-Push-Toggle darf nicht den Eindruck erzeugen, Browser-Abo gleich Remote-Push-Gesundheit.
  - Mobile Diagnose muss auf kleinen Screens lesbar und bedienbar werden.
  - UI-Hinweis ergaenzen: Geraete-/Browser-Notification kann ausserhalb von MIDAS blockiert sein.
- Nicht umzusetzen in S4:
  - Service-Worker-Neuarchitektur
  - Android-native Push-Schicht
  - neue Reminder-Ketten
  - Reduktion unter Option `B`
- S3-Abnahme:
  - Es bleiben keine offenen Analysefragen, die S4 blockieren.
  - Umsetzung kann mit klarer Prioritaet starten:
    - zuerst Workflow-Fehlerhaertung
    - dann Push-Health-Sichtbarkeit
    - dann mobile Diagnose
- S3 Commit-Empfehlung:
  - Kein separater Commit nur fuer S3 noetig, wenn S4 direkt folgt.
  - Wenn pausiert wird, ist die Roadmap-Aktualisierung als Doku-Commit sinnvoll.

### S4 - Umsetzung der gefundenen Punkte

- S4.1 Workflow-Fehlererkennung haerten:
  - HTTP-4xx/5xx der Edge Function muessen den GitHub-Action-Run sichtbar fehlschlagen lassen
  - bevorzugt `curl --fail-with-body` oder explizite Statuscode-Pruefung
  - Response-Body soll fuer Diagnose sichtbar bleiben, ohne Secrets zu loggen
- S4.2 Workflow-Kadenz gegen den finalen Option-`B`-Vertrag korrigieren, falls Drift gefunden wurde.
- S4.3 Sicherstellen, dass Scheduler-Calls standardmaessig `window=all` senden.
- S4.4 `workflow_dispatch` fuer manuelle Tests erhalten.
- S4.5 Optional Edge-Function-Response schaerfen:
  - lokale Bewertungszeit
  - ausgelieferte Events
  - uebersprungene Events mit Grund
  - naechster erwartbarer Due-Zeitpunkt, falls sinnvoll
- S4.6 Push-Health-UI gemass `S3` verbessern:
  - Remote-Erfolg sichtbar machen
  - Remote-Fehlerzeitpunkt und Fehlergrund sichtbar machen, falls vorhanden
  - `wartet`, `Fallback`, `remote gesund` und `blockiert/fehlerhaft` eindeutig texten
  - Hinweis auf moegliche Geraete-/Browser-Notification-Blockade aufnehmen
- S4.7 Dev-Push-Toggle und Diagnose-Status entambiguisieren:
  - Browser-Abo aktiv nicht als Remote-Push gesund darstellen
  - Remote-Health-Status im Diagnosekontext sichtbar oder verlinkt machen
- S4.8 Mobile Diagnose-/Touchlog-UI gemass `S3` verbessern:
  - kleines-Screen-Layout fuer normales Diagnosepanel
  - erreichbarer Close-Button
  - lesbare Toggles
  - scrollbare Log-Ausgabe
- S4.9 Code Review waehrend der Umsetzung:
  - keine Service-Worker-Neuarchitektur ohne Befund
  - keine native Android-Push-Schicht
  - keine zusaetzlichen Reminder-Ketten
- S4.10 Schritt-Abnahme:
  - Umsetzung deckt alle priorisierten Findings ab
  - keine Scope-Ausweitung
- Output: implementierter Follow-up-Stand.
- Exit-Kriterium: Workflow, Push-Health und Diagnose sind entsprechend Review-Findings angepasst.

#### S4 Ergebnisprotokoll (laufend)

##### S4.1 Workflow-Fehlererkennung haerten
- Umsetzung:
  - `.github/workflows/incidents-push.yml` nutzt im Edge-Function-Call jetzt `set -euo pipefail`.
  - `curl -sS` wurde auf `curl --fail-with-body -sS` geaendert.
- Wirkung:
  - HTTP-4xx/5xx der Edge Function fuehren zu einem fehlgeschlagenen GitHub-Action-Step.
  - Der Response-Body bleibt fuer Diagnose sichtbar.
  - Secrets werden nicht explizit geloggt.
- Contract Review S4.1:
  - Fachliche Push-Entscheidung bleibt in der Edge Function.
  - Scheduler-Kadenz wurde nicht geaendert.
  - `window=all`-Standard bleibt erhalten.
  - Keine Service-Worker-, Android- oder Reminder-Logik wurde beruehrt.
- Restrisiko:
  - Der echte rote Run bei HTTP-4xx/5xx kann lokal nicht vollstaendig bewiesen werden; dafuer ist ein GitHub-Actions- oder gezielter Edge-Smoke noetig.

##### S4.2 Workflow-Kadenz gegen Option-B-Vertrag pruefen
- Umsetzung:
  - `.github/workflows/incidents-push.yml` wurde gegen den in `S2` bestaetigten Option-B-Vertrag gelesen.
  - Keine Codekorrektur noetig, weil die Workflow-Crons bereits exakt dem Zielvertrag entsprechen.
- Bestaetigter Cron-Vertrag:
  - Hauptfenster: `5 8,9,10,11,12,13,14,15,18,19,20,21 * * *`
  - Nachtfenster: `35 20,21,22 * * *`
  - Nacht-Backup: `50 21,22 * * *`
- Bestaetigte lokale Schwellenabdeckung:
  - `10:00` lokal -> `09:05 UTC` in CET, `08:05 UTC` in CEST
  - `12:00` lokal -> `11:05 UTC` in CET, `10:05 UTC` in CEST
  - `14:00` lokal -> `13:05 UTC` in CET, `12:05 UTC` in CEST
  - `16:00` lokal -> `15:05 UTC` in CET, `14:05 UTC` in CEST
  - `20:00` lokal -> `19:05 UTC` in CET, `18:05 UTC` in CEST
  - `22:00` lokal -> `21:05 UTC` in CET, `20:05 UTC` in CEST
  - `22:30` lokal -> `21:35 UTC` in CET, `20:35 UTC` in CEST
  - `23:30` lokal -> `22:35 UTC` in CET, `21:35 UTC` in CEST
- Contract Review S4.2:
  - Option `B` bleibt umgesetzt.
  - Keine Rueckkehr zu `*/30`.
  - Keine Reduktion unter Option `B`.
  - Fachliche Due-Entscheidung bleibt in der Edge Function.
  - GitHub Actions bleibt nur Trigger.
- Restrisiko:
  - GitHub-Actions-Jitter bleibt moeglich, wird aber durch Edge-Catch-up, Dedupe und Backup-Ticks abgefedert.

##### S4.3 Scheduler-Calls mit `window=all` sicherstellen
- Umsetzung:
  - `.github/workflows/incidents-push.yml` wurde auf den Payload-Contract gelesen.
  - Der Workflow setzt bei leerem Input `WINDOW="all"`.
  - In `S5` wurde der GitHub-Expression-Default zusaetzlich auf `github.event.inputs.window || 'all'` gehaertet.
- Bestaetigter Workflow-Vertrag:
  - Schedule-Events liefern keinen manuellen `window`-Input.
  - Leerer oder fehlender Input faellt auf `all` zurueck.
  - Der Edge-Function-Payload sendet `{"trigger":"scheduler","window":"$WINDOW"}`.
- Lokale Default-Logik-Simulation:
  - leerer Input -> `all`
  - `med` -> `med`
  - `bp` -> `bp`
  - `all` -> `all`
- Contract Review S4.3:
  - Scheduler-Laeufe senden standardmaessig `window=all`.
  - `window` bleibt Betriebs-/Diagnosefilter, nicht fachliche Due-Definition.
  - Die Edge Function entscheidet weiterhin, ob Medication, BP oder nichts faellig ist.
  - Kein Fachentscheid wurde in YAML verschoben.
- Restrisiko:
  - GitHub-Actions-Kontextsubstitution fuer `github.event.inputs.window || 'all'` ist lokal nicht vollstaendig identisch simulierbar.
  - Der praktische Nachweis bleibt ein `workflow_dispatch`- bzw. Schedule-Smoke in `S5`.

##### S4.4 `workflow_dispatch` fuer manuelle Tests erhalten
- Umsetzung:
  - `workflow_dispatch` bleibt im Workflow erhalten.
  - Der manuelle `window`-Input wurde von Freitext auf ein `choice`-Feld umgestellt.
  - Erlaubte Optionen:
    - `all`
    - `med`
    - `bp`
  - Default fuer manuelle Runs ist jetzt `all`.
- Wirkung:
  - Manuelle Diagnose-Laeufe bleiben moeglich.
  - Vertipper wie `MED`, `bloodpressure` oder leere Sonderwerte werden im GitHub-UI vermieden.
  - Der bestehende Shell-Fallback auf `all` bleibt fuer Schedule-Events und robuste Ausfuehrung erhalten.
- Contract Review S4.4:
  - `workflow_dispatch` ist weiter nur Test-/Diagnosepfad.
  - `window` bleibt Betriebsfilter, nicht fachliche Due-Logik.
  - Scheduler-Laeufe bleiben bei `window=all`.
  - Keine Push-Fachlogik wurde in YAML verschoben.
- Restrisiko:
  - Die Choice-Darstellung selbst ist nur in GitHub Actions pruefbar.
  - Der praktische UI-Smoke bleibt Teil von `S5`.

##### S4.5 Edge-Function-Response schaerfen
- Umsetzung:
  - Externe Datei angepasst:
    - `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
  - Response enthaelt jetzt Run-Kontext:
    - `trigger`
    - `window`
    - `dryRun`
    - `evaluatedAtUtc`
    - `evaluatedAtLocal`
    - `dayIso`
  - `evaluatedAtLocal` enthaelt:
    - `timeZone`
    - `dayIso`
    - `time`
    - `hour`
    - `minute`
  - Pro User werden Skip-Gruende ausgegeben, wenn kein Event faellig ist oder einzelne Kandidaten uebersprungen werden.
- Neue Skip-Gruende:
  - Medication:
    - `section-not-open`
    - `before-reminder-threshold`
    - `already-delivered`
    - `incident-already-delivered`
  - Blutdruck:
    - `morning-bp-missing`
    - `evening-bp-already-recorded`
    - `before-incident-threshold`
    - `already-delivered`
- `nextDueLocal`:
  - wird bei bevorstehenden Reminder-/Incident-Schwellen ausgegeben, wenn das fuer Diagnose sinnvoll ist.
  - Beispiel: vor Reminder-Schwelle oder nach Reminder, aber vor spaeterem Incident.
- Sicherheitskorrektur:
  - Push-Endpoints werden in `failed`-Response-Eintraegen nicht mehr ausgegeben.
  - Fehlergrund bleibt sichtbar.
- Contract Review S4.5:
  - Edge Function bleibt fachliche Source of Truth.
  - Response erweitert Diagnose, verschiebt aber keine Push-Entscheidung in den Workflow.
  - Keine Service-Worker-, Android- oder native Push-Schicht wurde eingefuehrt.
  - Keine Reminder-Kette oder neue medizinische Fachlogik wurde ergaenzt.
  - Response-Body bleibt fuer GitHub-Actions-Diagnose nutzbar.
- Lokale Checks:
  - Function-Pfad bestaetigt:
    - `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
  - Supabase-Functions-Verzeichnis bestaetigt:
    - `C:/Users/steph/Projekte/midas-backend/supabase/functions`
  - Lokale Supabase CLI ist vorhanden:
    - `supabase.exe` Version `2.84.2`
  - `supabase/config.toml` ist vorhanden und `edge_runtime.deno_version = 2` ist gesetzt.
  - Trailing-Whitespace-Check fuer die Edge-Function-Datei sauber.
  - Einfache Klammer-Balance fuer `{}`, `()` und `[]` sauber.
- Deploy:
  - Erfolgreich deployed mit:
    - `supabase.exe functions deploy midas-incident-push --project-ref jlylmservssinsavlkdi --workdir C:/Users/steph/Projekte/midas-backend --use-api`
  - CLI-Ergebnis:
    - `Deployed Functions on project jlylmservssinsavlkdi: midas-incident-push`
  - Deploy-Ziel:
    - `https://supabase.com/dashboard/project/jlylmservssinsavlkdi/functions`
  - Vorherige Deploy-Versuche:
    - `--workdir C:/Users/steph/Projekte/midas-backend/supabase` ohne Project-Ref fand keinen Project-Ref.
    - `--workdir C:/Users/steph/Projekte/midas-backend/supabase` mit Project-Ref suchte faelschlich unter `supabase/supabase/functions/...`.
- Nicht lokal geprueft:
  - `deno check`, weil `deno` lokal nicht im PATH ist.
  - Git-Diff im Backend-Workspace, weil `C:/Users/steph/Projekte/midas-backend` kein Git-Repo ist.
  - `supabase functions serve`, weil das einen lokalen Runtime-/Docker-/Env-Start bedeutet und kein reiner statischer Check ist.
  - Echter Edge-Function-Smoke gegen Supabase bleibt Teil von `S5`.

##### S4.6 Push-Health-UI verbessern
- Umsetzung:
  - Profilansicht in `index.html` um eine eigene Karte `Push & Erinnerungen` erweitert.
  - Neue UI-Elemente:
    - `profilePushStatus`
    - `profilePushDetails`
    - `profilePushEnableBtn`
    - `profilePushDisableBtn`
  - `app/modules/profile/index.js` rendert Push-Health jetzt als Status plus Diagnose-Details statt nur als Einzeiler.
  - `app/styles/hub.css` enthaelt Layout und Statusfarben fuer die neue Push-Health-Karte.
- Sichtbare Health-Felder:
  - Browser-Berechtigung
  - Browser-Abo
  - Remote-Status
  - letzter Remote-Erfolg
  - letzter Remote-Fehler
  - Fehlergrund, falls vorhanden
  - Fehler in Folge, falls vorhanden
  - Health-Check-Fehler, falls der Remote-Status nicht lesbar ist
  - letzter Pruefzeitpunkt
- Status-Texte:
  - `Status: aktiv (remote gesund)`
  - `Status: aktiv (lokales Fallback)`
  - `Status: aktiv (warte auf Remote-Bestaetigung)`
  - `Status: aktiv (Health-Check nicht lesbar)`
  - `Status: blockiert (Browser)`
  - `Status: bereit (kein Abo)`
  - `Status: aus`
  - `Status: nicht verfuegbar (...)`
- Datenvertrag:
  - `push_subscriptions` wird jetzt auch mit `last_remote_failure_reason` gelesen.
  - `getPushRoutingStatus()` gibt zusaetzlich Diagnosefelder aus:
    - `permission`
    - `hasRemoteSubscription`
    - `lastRemoteFailureReason`
    - `consecutiveRemoteFailures`
    - `healthRefreshError`
- Nutzerhinweise:
  - Die UI macht klar, dass Browser-Abo nicht gleich Remote-Push-Gesundheit ist.
  - Bei Fallback, Wartezustand oder Health-Fehler wird auf moegliche Geraete-/Browser-Notification-Blockade ausserhalb von MIDAS hingewiesen.
- Contract Review S4.6:
  - Push-Health-Sichtbarkeit wurde verbessert, ohne die fachliche Push-Entscheidung zu veraendern.
  - Lokale Suppression bleibt weiterhin nur bei `remoteHealthy`.
  - Keine Service-Worker-Neuarchitektur.
  - Keine Android-native Push-Schicht.
  - Keine Reminder-Ketten oder neue medizinische Fachlogik.
- Lokale Checks:
  - `node --check app/modules/profile/index.js` erfolgreich.
  - `git diff --check -- index.html app/modules/profile/index.js app/styles/hub.css` ohne Whitespace-Fehler.
- Restrisiko:
  - Echte Health-Zustaende muessen in `S5` mit realer Subscription bzw. Supabase-Daten verifiziert werden.
  - OS-/Android-Notification-Blockaden koennen weiterhin nicht verlaesslich automatisch erkannt werden; die UI weist diesen Unterschied jetzt explizit aus.
- Follow-up-Notiz:
  - Die Profilkarte bleibt als ruhige Nutzerzusammenfassung bestehen.
  - Fast alle dort sichtbaren Health-Details sollen spaeter in eine neue Touchlog-/Maintenance-Section wandern, sobald der Touchlog selbst umgebaut wird.
  - Diese Roadmap zieht den Touchlog-Umbau nicht vor; S4.7 entambiguiert nur den bestehenden Dev-Push-Toggle.

##### S4.7 Dev-Push-Toggle und Diagnose-Status entambiguisieren
- Umsetzung:
  - `index.html` im bestehenden Touchlog-/Dev-Panel um `devPushStatus` erweitert.
  - `app/diagnostics/devtools.js` liest nach Push-Refresh den Routingstatus aus dem Profilmodul.
  - `app/styles/auth.css` ergaenzt Statusdarstellung fuer `ok`, `warn` und `error`.
- Wirkung:
  - Der Push-Toggle bleibt Bedienung fuer Push aktivieren/deaktivieren.
  - Direkt darunter steht nun ein technischer Diagnose-Satz.
  - Der Toggle bedeutet nicht mehr stillschweigend `Remote-Push gesund`.
- Sichtbare Dev-Statusvarianten:
  - `Push: Browser blockiert`
  - `Push: kein Browser-Abo`
  - `Push: Abo aktiv, Remote gesund (...)`
  - `Push: Abo aktiv, Health-Check nicht lesbar`
  - `Push: Abo aktiv, Remote nicht gesund (...)`
  - `Push: Abo aktiv, wartet auf Remote-Bestaetigung`
  - `Push: Profilmodul nicht bereit`
  - `Push: Diagnose fehlgeschlagen (...)`
- Contract Review S4.7:
  - Diagnose wurde verbessert, ohne Push-Fachlogik zu veraendern.
  - Dev-Toggle bleibt UI-Adapter fuer Profil-Push-Aktionen.
  - Remote-Gesundheit kommt weiterhin aus `profile.getPushRoutingStatus()`.
  - Keine Service-Worker-, Android- oder native Push-Schicht.
  - Kein Touchlog-Layout-Umbau in diesem Substep.
- Follow-up-Notiz Touchlog:
  - Der spaetere Touchlog-Umbau soll eine Maintenance-Section bekommen.
  - Diese Maintenance-Section soll die Push-Health-Details aus Profil/S4.6 weitgehend uebernehmen.
  - Ziel bleibt: auf Handy schnell sehen, ob Push nur abonniert oder wirklich remote gesund ist.
- Lokale Checks:
  - `node --check app/diagnostics/devtools.js` erfolgreich.
  - `node --check app/modules/profile/index.js` erfolgreich.
  - `git diff --check -- index.html app/diagnostics/devtools.js app/styles/auth.css` ohne Diff-Whitespace-Fehler.
- Restrisiko:
  - Echte Dev-Panel-Anzeige muss in `S5` im Browser geprueft werden.
  - Die mobile Lesbarkeit des gesamten Touchlog-Panels ist noch nicht geloest; das bleibt `S4.8`.

##### S4.8 Mobile Diagnose-/Touchlog-UI verbessern
- Umsetzung:
  - `app/styles/auth.css` verbessert das bestehende `#diag`-Panel fuer kleine Screens.
  - Normales Diagnosepanel bekommt auf Mobile jetzt:
    - Viewport-sichere Breite ueber `left/right` statt impliziter Content-Breite
    - Safe-Area-Inset fuer linke/rechte/untere Kante
    - begrenzte Maximalhoehe ueber `100dvh`
    - internes Scrollen der Panel-Inhalte
    - sticky Header fuer erreichbaren Close-Button
    - einspaltige Controls/Log-Anordnung
    - scrollbaren Logbereich mit begrenzter Hoehe
    - kleinere Logschrift auf sehr schmalen Displays
- Abgrenzung:
  - Kein Hestia-artiger Touchlog-Umbau in diesem Substep.
  - Keine neue Maintenance-Section in dieser Push-Roadmap.
  - Keine Aenderung am Logger-Verhalten oder an `diag.add`.
- Contract Review S4.8:
  - Push-Diagnose bleibt sichtbar, aber der Touchlog wird hier nicht fachlich neu geschnitten.
  - Service Worker, Android und Edge Function bleiben unberuehrt.
  - Die Aenderung ist rein responsive UI fuer bestehende Diagnose.
- Lokale Checks:
  - `git diff --check -- app/styles/auth.css` ohne Diff-Whitespace-Fehler.
- Follow-up:
  - Die groessere Touchlog-Modernisierung wird in `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md` weitergefuehrt.
  - Ziel dort: Hestia-Learnings uebernehmen, Maintenance-Section schaffen und die aktuell im Profil sichtbaren Push-Health-Details sinnvoll im Touchlog verfuegbar machen.

##### S4.9 Code Review waehrend der Umsetzung
- Review-Scope:
  - `.github/workflows/incidents-push.yml`
  - `index.html`
  - `app/modules/profile/index.js`
  - `app/diagnostics/devtools.js`
  - `app/styles/auth.css`
  - `app/styles/hub.css`
  - `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- Findings:
  - Keine P0/P1-Findings.
  - Keine Scope-Verletzung gegen die Roadmap.
  - Keine Service-Worker-Aenderung.
  - Keine Android-/TWA-native Push-Aenderung.
  - Keine neue medizinische Fachlogik.
  - Keine neue Reminder-Kette.
  - Keine Aufweichung der persistenten Remote-Dedupe.
- Bestaetigte Contracts:
  - Workflow ist nur Trigger und nutzt weiterhin `window=all` als Scheduler-Default.
  - `curl --fail-with-body` verhindert gruene GitHub-Action-Laeufe bei HTTP-Fehlern der Edge Function.
  - Edge Function entscheidet weiter in `Europe/Vienna` ueber Faelligkeit, Severity, Catch-up und Dedupe.
  - Edge-Response erweitert Diagnose, ohne Endpoints in Fehlerlisten auszugeben.
  - Profil-Health unterscheidet Browser-Berechtigung, Browser-Abo, Remote-Erfolg, Remote-Fehler und Health-Check-Fehler.
  - Dev-Push-Toggle zeigt nicht mehr stillschweigend `Browser-Abo = Remote gesund`.
  - Lokale Push-Suppression bleibt an `remoteHealthy` gebunden.
  - Mobile Diagnose wurde nur responsive lesbarer gemacht; der groessere Touchlog-Umbau bleibt in der separaten Touchlog-Roadmap.
- Korrekturen aus dem Review:
  - Keine Codekorrektur noetig.
  - Keine Doku-Korrektur ausser diesem S4.9-Protokoll noetig.
- Lokale Checks:
  - `node --check app/diagnostics/devtools.js` erfolgreich.
  - `node --check app/modules/profile/index.js` erfolgreich.
  - `git diff --check -- .github/workflows/incidents-push.yml index.html app/diagnostics/devtools.js app/modules/profile/index.js app/styles/auth.css app/styles/hub.css` ohne Diff-Whitespace-Fehler; nur Git-CRLF-Hinweise.
  - Edge-Function-Datei auf trailing whitespace geprueft; keine Treffer.
- Restrisiken fuer `S5`:
  - GitHub-Actions-Kontext und `workflow_dispatch` muessen praktisch gegen GitHub verifiziert werden.
  - Edge Function konnte lokal nicht mit Deno typegecheckt werden; Runtime-Smoke nach Deploy bleibt noetig.
  - Echte Push-Health-Zustaende brauchen Browser-/Supabase-Smoke mit realer Subscription.
  - Mobile Diagnose muss am Handy visuell geprueft werden.
  - OS-/Android-Notification-Blockaden bleiben ausserhalb von MIDAS nur hinweisbar, nicht verlaesslich automatisch erkennbar.

##### S4.10 Schritt-Abnahme
- Abnahme gegen S4-Ziel:
  - Workflow-HTTP-Fehler werden sichtbar rot statt still gruen.
  - Scheduler-Kadenz bleibt beim bestaetigten Option-`B`-Vertrag.
  - Scheduler sendet weiterhin `window=all` als Default.
  - `workflow_dispatch` bleibt fuer manuelle Diagnose nutzbar.
  - Edge-Function-Response ist fuer Betrieb und GitHub-Actions-Diagnose aussagekraeftiger.
  - Push-Health ist im Profil sichtbar und unterscheidet Browser-Abo, Remote-Gesundheit, Fallback und Fehlerzustaende.
  - Dev-Push-Toggle ist entambiguiert und zeigt einen eigenen Diagnose-Status.
  - Mobile Diagnose ist fuer kleine Screens robuster, ohne den Touchlog fachlich umzubauen.
- Scope Review:
  - Kein Service-Worker-Umbau.
  - Keine native Android-/TWA-Push-Schicht.
  - Keine neue medizinische Fachlogik.
  - Keine neuen Reminder-/Eskalationsketten.
  - Keine Verlagerung fachlicher Due-Entscheidungen in GitHub Actions.
  - Keine Reduktion unter die beschlossene Option-`B`-Kadenz.
- Doku-Sync innerhalb S4:
  - Diese Roadmap enthaelt Ergebnisprotokolle fuer S4.1 bis S4.10.
  - Die separate Touchlog-Follow-up-Roadmap dokumentiert den spaeteren Hestia-inspirierten Maintenance-Umbau.
  - Modul-Overviews und QA werden bewusst in `S6` final synchronisiert, weil `S5` noch echte Smoke-Ergebnisse liefern soll.
- Commit-Empfehlung:
  - Noch kein finaler Commit nur fuer S4 empfohlen, wenn `S5` direkt folgt.
  - Sinnvoller Commit-Scope nach `S5/S6`: Workflow, Push-Health, mobile Diagnose, Edge-Function-Diagnose und zugehoerige Doku gemeinsam.
- Restrisiken, bewusst nach `S5` verschoben:
  - GitHub-Actions-Run mit `workflow_dispatch` und Schedule-Kontext.
  - Edge-Function-Runtime-Smoke nach Deploy.
  - echter Off-App-Push-Smoke bei geschlossener App.
  - echte Push-Health-Zustaende mit realer Subscription.
  - mobile Sichtpruefung des Diagnosepanels am Handy.
- S4-Abnahme:
  - S4 ist fachlich und technisch abgeschlossen.
  - Es bleiben keine offenen S4-Code-Findings.
  - Naechster Schritt ist `S5` mit Tests, Smokes und erneutem Contract Review.

### S5 - Tests, Code Review und Contract Review nach Umsetzung

- S5.1 YAML-/Workflow-Check ausfuehren oder statisch pruefen.
- S5.2 Betroffene JavaScript-Dateien mit `node --check` pruefen.
- S5.3 Edge Function, falls geaendert, mit geeignetem TypeScript-/Deno-Check pruefen.
- S5.4 Manuelle Scheduler-Smokes definieren oder ausfuehren:
  - `workflow_dispatch` mit `window=all`
  - optional `window=med`
  - optional `window=bp`
- S5.5 Workflow-Fehler-Smoke definieren oder ausfuehren:
  - Edge-Function-HTTP-4xx/5xx darf nicht als gruener GitHub-Action-Lauf enden
  - Response-Body oder Fehlergrund muss fuer Diagnose sichtbar sein
  - Secrets duerfen dabei nicht geloggt werden
- S5.6 Off-App-Push-Smoke definieren oder ausfuehren:
  - App geschlossen
  - Push am Geraet erlaubt
  - offener Medication-Slot vor faelliger Schwelle
  - Push kommt erst ab faelliger Schwelle
- S5.7 Dedupe- und Catch-up-Smokes definieren oder ausfuehren:
  - kein Doppelpush fuer denselben `type/severity/day`
  - erster Lauf nach `incident_after` sendet nur `incident`
- S5.8 Push-Health- und Mobile-Diagnose-Smokes definieren oder ausfuehren.
- S5.9 Code Review gegen Bruchrisiken:
  - stille Ausfaelle
  - falsche Remote-Gesundheit
  - Doku-/Workflow-Drift
- S5.10 Contract Review gegen MIDAS-Guardrails:
  - Push bleibt Schutznetz
  - keine Reminder-Ketten
  - keine native Push-Ausweitung
- Output: gepruefter Umsetzungsstand mit klaren Testresultaten und Restrisiken.
- Exit-Kriterium: alle lokal moeglichen Checks sind ausgefuehrt oder bewusst als nicht lokal ausfuehrbar markiert.

#### S5 Ergebnisprotokoll

##### S5.1 YAML-/Workflow-Check
- Ausgefuehrt:
  - Statischer Workflow-Check der Pflichtfelder.
  - `git diff --check -- .github/workflows/incidents-push.yml`.
  - Cron-Abdeckungssimulation fuer CET (`UTC+1`) und CEST (`UTC+2`).
- Ergebnis:
  - Workflow enthaelt weiterhin drei gezielte Cron-Zeilen.
  - Kein `*/30`-Dauerlauf vorhanden.
  - `workflow_dispatch` ist vorhanden.
  - `window` ist ein `choice`-Input mit `all`, `med`, `bp`.
  - `set -euo pipefail` ist gesetzt.
  - `curl --fail-with-body` ist gesetzt.
  - Secrets werden nur als Header/URL verwendet und nicht explizit geloggt.
- S5-Korrektur:
  - `WINDOW_INPUT` wurde von `github.event.inputs.window` auf `github.event.inputs.window || 'all'` gehaertet.
  - Der Shell-Fallback auf `all` bleibt zusaetzlich erhalten.
- Nicht verfuegbar:
  - `actionlint` ist lokal nicht installiert.
  - `yamllint` ist lokal nicht installiert.
  - `PyYAML` ist lokal nicht installiert.

##### S5.2 JavaScript-Syntaxchecks
- Erfolgreich ausgefuehrt:
  - `node --check app/diagnostics/devtools.js`
  - `node --check app/modules/profile/index.js`
  - `node --check app/core/pwa.js`
  - `node --check app/modules/incidents/index.js`
- Ergebnis:
  - Keine Syntaxfehler in den betroffenen Push-/Diagnose-Dateien.

##### S5.3 Edge-Function-Check
- Lokal moeglich und ausgefuehrt:
  - Supabase CLI im Backend-Pfad geprueft: `2.84.2`.
  - `supabase functions deploy --help` geprueft.
  - Edge-Function-Datei auf trailing whitespace geprueft.
  - Einfache Klammer-Balance fuer `{}`, `()` und `[]` geprueft.
  - Diagnosefelder statisch bestaetigt:
    - `SkippedEvent`
    - `evaluatedAtLocal`
    - `skippedEvents`
    - `nextDueLocal`
    - `last_remote_failure_reason`
  - Sicherheitscheck bestaetigt:
    - `failedEvents` gibt keinen Push-Endpoint in demselben Fehlerobjekt aus.
- Nicht lokal moeglich:
  - `deno check`, weil `deno` nicht im PATH ist.
  - Backend-Git-Diff, weil `C:/Users/steph/Projekte/midas-backend` kein Git-Repo ist.
  - Voller Runtime-Smoke ohne echte Supabase-/Secret-/Edge-Ausfuehrung.

##### S5.4 Manuelle Scheduler-Smokes definiert
- Nach Commit vom Nutzer auszufuehren:
  - GitHub Actions `Incidents Push` manuell mit `window=all` starten.
  - Optional manuell mit `window=med` starten.
  - Optional manuell mit `window=bp` starten.
- Erwartung:
  - Action ruft die Edge Function erfolgreich auf.
  - Response zeigt `trigger`, `window`, `evaluatedAtUtc`, `evaluatedAtLocal`, `dayIso` und `results`.
  - Bei keinem faelligen Event erscheinen nachvollziehbare `skipped`-Gruende.

##### S5.5 Workflow-Fehler-Smoke definiert
- Nach Commit vom Nutzer auszufuehren, falls ohne Produktivrisiko moeglich:
  - Einen kontrollierten Test mit fehlerhafter Edge-Function-URL oder bewusst ungueltigem Secret nur in sicherem Rahmen ausfuehren.
- Erwartung:
  - HTTP-4xx/5xx fuehrt zu rotem GitHub-Action-Run.
  - Response-Body oder Fehlergrund ist sichtbar.
  - Keine Secrets erscheinen im Log.
- Lokaler Review:
  - `curl --fail-with-body` erfuellt den roten-Run-Vertrag fuer HTTP-Fehler.

##### S5.6 Off-App-Push-Smoke definiert
- Nach Commit vom Nutzer am Handy auszufuehren:
  - Push am Geraet und im Browser erlauben.
  - App schliessen.
  - Einen offenen Medication-Slot vor faelliger Schwelle stehen lassen.
  - Nach faelliger Schwelle den Push erwarten.
- Erwartung:
  - Push kommt ohne Oeffnen der App.
  - Vor der Schwelle kommt kein Push.
  - Bei spaeterem Tick kommt nur die hoechste aktuell faellige Severity.

##### S5.7 Dedupe- und Catch-up-Smokes definiert
- Nach Commit vom Nutzer oder ueber manuelle Scheduler-Laeufe zu pruefen:
  - Wiederholter Run fuer denselben `user/day/type/severity/source=remote` erzeugt keinen Doppelpush.
  - Erster Run nach `incident_after` sendet nur `incident`, nicht nachtraeglich auch `reminder`.
  - Mehrere aktive Geraete erzeugen keine mehrfachen fachlichen Delivery-Eintraege fuer dasselbe Ereignis.
- Lokaler Review:
  - S4 hat Dedupe-Keys und Severity-Entscheidung nicht veraendert.

##### S5.8 Push-Health- und Mobile-Diagnose-Smokes definiert
- Nach Commit vom Nutzer im Browser/Handy zu pruefen:
  - Profilkarte zeigt Browser-Berechtigung, Browser-Abo, Remote-Status, letzten Erfolg und letzten Fehler nachvollziehbar an.
  - Dev-Toggle zeigt einen Diagnose-Satz und setzt `Browser-Abo aktiv` nicht mit `Remote gesund` gleich.
  - Mobile Diagnose ist auf dem Handy lesbar, scrollbar und der Close-Button bleibt erreichbar.
- Lokaler Review:
  - `profile.getPushRoutingStatus()` liefert die erweiterten Diagnosefelder.
  - `profile.shouldSuppressLocalPushes()` bleibt an `remoteHealthy` gebunden.

##### S5.9 Code Review gegen Bruchrisiken
- Ergebnis:
  - Kein Befund fuer stille HTTP-Fehler im Workflow nach `curl --fail-with-body`.
  - Kein Befund fuer fachliche Due-Logik im Workflow.
  - Kein Befund fuer Service-Worker- oder Android-Scope-Ausweitung.
  - Kein Befund fuer lokale Suppression ohne gesunden Remote-Pfad.
  - Kein Befund fuer Endpoint-Leak in neuen Edge-Function-Fehlerlisten.
- Verbleibende Risiken:
  - GitHub-Actions-Kontext muss real laufen.
  - Edge Function muss runtime-seitig nach Deploy antworten.
  - OS-/Browser-Notification-Blockaden koennen weiterhin nur sichtbar gemacht, nicht sicher automatisch erkannt werden.

##### S5.10 Contract Review gegen MIDAS-Guardrails
- Ergebnis:
  - Push bleibt ruhiges Sicherheitsnetz.
  - Keine Reminder-Ketten.
  - Keine native Android-Push-Ausweitung.
  - Edge Function bleibt fachliche Source of Truth.
  - GitHub Actions bleibt Trigger.
  - Service Worker bleibt Empfangs-/Anzeigeschicht.
  - Option-`B`-Kadenz bleibt eingehalten.
- S5-Abnahme:
  - Alle lokal moeglichen Checks sind erledigt.
  - Alle nicht lokal sinnvoll ausfuehrbaren Smokes sind konkret definiert.
  - Nach Commit kann der Nutzer die echten GitHub-/Device-Smokes ausfuehren.

### S6 - Doku-Sync, QA-Update und finaler Abschlussreview

- S6.1 `docs/modules/Push Module Overview.md` auf finalen Stand bringen.
- S6.2 `docs/modules/Profile Module Overview.md` aktualisieren, falls Push-Health-UI oder Routing-Status betroffen ist.
- S6.3 `docs/QA_CHECKS.md` um Scheduler-, Health-, Workflow-Fehler- und Mobile-Diagnose-Pruefungen erweitern.
- S6.4 Diese Roadmap mit Ergebnisprotokollen fuer `S1` bis `S5` aktualisieren.
- S6.5 Finaler Contract Review:
  - Roadmap vs. Code
  - Roadmap vs. Modul-Overviews
  - Roadmap vs. README-Guardrails
  - Roadmap vs. QA
- S6.6 Abschluss-Abnahme:
  - keine offenen P0/P1-Bruchrisiken
  - bekannte Restrisiken explizit dokumentiert
  - Service Worker und Android bleiben nur beruehrt, wenn Review-Befund vorliegt
- S6.7 Commit-Empfehlung:
  - Scope fuer finalen Commit benennen
  - ggf. Trennung zwischen Workflow-/Doku-Commit und UI-/Diagnose-Commit empfehlen
- S6.8 Archiv-Entscheidung:
  - Roadmap erst nach umgesetzter und gepruefter Arbeit nach `docs/archive/` verschieben
  - vorher bleibt sie aktive Arbeitsroadmap
- Output: dokumentierter, gepruefter und abschliessend synchronisierter Follow-up-Umbau.
- Exit-Kriterium: Code, Workflow, Doku, QA und Roadmap sprechen denselben finalen Vertrag.

## Smokechecks / Regression (Definition)

- GitHub Actions triggert nicht mehr unnoetig alle 30 Minuten, falls die Ziel-Kadenz beschlossen wurde.
- Alle fachlichen Medication-Schwellen werden trotz UTC-Cron und DST abgedeckt.
- `20:00 Europe/Vienna` deckt Evening-Medication-Reminder und Abend-BP-Incident ab.
- `22:30` und `23:30` Night-Medication bleiben abgedeckt.
- Edge Function entscheidet weiterhin in `Europe/Vienna`, nicht der Workflow.
- `window=all` bleibt Standard fuer Scheduler-Laeufe.
- `workflow_dispatch` bleibt fuer manuelle Diagnose nutzbar.
- HTTP-Fehler der Edge Function lassen den GitHub-Action-Run sichtbar fehlschlagen.
- Wiederholte oder verspaetete Runs erzeugen keine doppelten Pushes.
- Verpasster Reminder fuehrt bei spaeterem Tick nur zur hoechsten faelligen Stufe.
- App muss fuer echten Remote-Push nicht geoeffnet sein.
- Lokale Push-Suppression greift nur bei gesundem Remote-Pfad.
- Push-Health zeigt blockierte oder fehlende Berechtigungen nachvollziehbar an.
- Mobile Touchlog-/Debuglog-Ansicht ist lesbar und bedienbar.

## Abnahmekriterien

- Die neue Kadenz reduziert GitHub-Actions-Laerm deutlich gegenueber `*/30`, ohne die fachlichen Reminder-/Incident-Zeiten zu gefaehrden.
- Edge Function, Workflow, Doku und QA beschreiben denselben Scheduler-Vertrag.
- Push bleibt off-app verlaesslich und ist nicht vom Oeffnen der App abhaengig.
- Der Nutzer kann im Profil, Hub oder Diagnosebereich erkennen, ob Push technisch bereit ist.
- Ein ausgeschalteter Handy-/Browser-Push ist leichter erkennbar als bisher.
- Mobile Diagnose ist nicht mehr so eng oder abgeschnitten, dass sie praktisch unbrauchbar wird.
- Service Worker bleibt unveraendert, sofern kein konkreter Display-/Payload-Bug gefunden wird.
- Keine neuen Duplikate, Reminder-Loops oder stillen Ausfaelle entstehen durch die optimierte Kadenz.

## Risiken

- Zu stark reduzierte Scheduler-Ticks koennen bei GitHub-Jitter einzelne Reminder verzoegern.
- Reine lokale 8-Ticks-Planung kann durch UTC/DST falsch werden, wenn sie nicht sauber abgesichert ist.
- Zu viele Backup-Ticks koennen die Optimierung wieder entwerten.
- Push-Health kann falsche Sicherheit geben, wenn Remote-Erfolg zu grob interpretiert wird.
- Mobile Diagnose kann technisch korrekt, aber weiterhin zu schwer lesbar bleiben, wenn Layout nicht gezielt auf kleine Screens getestet wird.
- Doku-Drift zwischen DONE-Roadmap, Push Module Overview und Workflow kann spaeter falsche Annahmen erzeugen.

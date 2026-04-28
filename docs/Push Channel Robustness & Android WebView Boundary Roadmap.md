# Push Channel Robustness & Android WebView Boundary Roadmap

## Ziel (klar und pruefbar)

MIDAS soll Push fuer die Zukunft robuster machen, indem der produktive Push-Kanal sauber als Browser-/PWA-Kanal gefuehrt wird und die Android-WebView-Shell nicht mehr still wie ein vollwertiger Push-Client wirkt.

Pruefbare Zieldefinition:

- Der Push-Vertrag ist eindeutig: Browser/PWA ist Reminder-Push-Master; Android-WebView/Shell ist Widget-/Sync-Node, kein verlaesslicher Off-App-Push-Kanal.
- Touchlog erkennt und kommuniziert den aktuellen Push-Kontext so, dass Android-WebView nicht mit Chrome/PWA verwechselt wird.
- Push-Subscriptions sind diagnostisch besser zuordenbar, ohne Tokens, Keys, volle Endpoints oder sensible Rohdaten sichtbar zu machen.
- Es gibt einen technischen Push-Smoke, der nicht von natuerlichen Medication-/BP-Incidents und deren Dedupe abhaengt.
- Der technische Push-Smoke ist klar vom medizinischen Delivery-Dedupe getrennt und darf lokale Incident-Suppression nicht unbeabsichtigt freischalten.
- Push-Aktivierung wird als gefuehrter User-Intent verbessert; ein technischer Permission-Bypass oder echtes "Force Activation" ist nicht Ziel.
- Bestehende Medication-/BP-Reminder-Logik, Schwellen, Copy und Dedupe bleiben fachlich unveraendert.
- Source-of-Truth-Dokus beschreiben PWA, Android-WebView, Widget, Service Worker und Push-Service konsistent.

## Problemzusammenfassung

Aktueller Befund aus Doku-, Code- und Realgeraete-Analyse:

- Die Edge Function sendet erfolgreich Web Push:
  - Run `#652` lieferte `status=sent`, `deliveredSubscriptions=5`, `failed=[]`.
  - PC/Edge zeigt die Benachrichtigung korrekt.
- Android zeigt Remote-Push nicht verlaesslich off-app:
  - Meldung erscheint teilweise erst beim Oeffnen der App oder beim Start eines aktiven Browser-/Desktop-Kontexts.
  - Android-Shell/WebView zeigt `Berechtigung offen`, `Browser-Abo fehlt` und laesst Push nicht sauber aktivieren.
- Der aktive Android-Code ist keine echte TWA:
  - `MidasWebActivity.kt` nutzt `android.webkit.WebView`.
  - Es gibt keine aktive `TrustedWebActivity`-/`androidbrowserhelper`-Implementierung im Repo.
  - Das alte Bubblewrap/TWA-Projekt ist nur noch Archiv-/Altspur.
- Die Android-Doku sagt bereits:
  - Widget ist read-only.
  - Widget ist kein Reminder-System.
  - WebView ist MIDAS-Surface/Mirror, nicht Hauptsystem.
- Die Push-Diagnose ist aktuell zu grob:
  - `deliveredSubscriptions=5` ist nicht auf Geraete/Kontexte abbildbar.
  - `push_subscriptions` enthaelt keine sichere Client-/Kontext-Metadaten.
  - Ein manueller Workflow-Test kann durch `already-delivered` blockiert werden und ist dann kein echter Transporttest.

Leitthese:

- Nicht die Edge Function ist der Hauptbruch.
- Die Android-WebView/Shell ist als Reminder-Push-Kanal ungeeignet oder zumindest nicht belastbar genug.
- MIDAS soll deshalb PWA/Chrome als Push-Master staerken und Android-Shell/Widget klar begrenzen.

## Scope

- Push-Kontextvertrag pruefen und festziehen:
  - Browser/PWA
  - Android-WebView/Shell
  - Widget/Native Sync
  - Service Worker
  - Edge Function
- Touchlog-/Push-Service-Diagnose verbessern:
  - aktueller Kontext
  - Push-Support
  - Browser-Abo
  - Remote-Health
  - klares WebView-Hinweismuster
- Safe Subscription-Diagnostik pruefen und ggf. umsetzen:
  - keine Roh-Endpunkte
  - keine Keys
  - keine Tokens
  - moeglich: Client-Label, Plattform, User-Agent-Auszug, installierter Kontext, Endpoint-Hash
- Technischen Test-Push pruefen und ggf. umsetzen:
  - unabhaengig von Medication-/BP-Dedupe
  - klar als Diagnose markiert
  - kein medizinischer Incident
  - kein Spam
- Gefuehrte Push-Aktivierung pruefen und ggf. umsetzen:
  - PWA/Chrome als empfohlenen Kanal
  - Android-WebView als nicht verlaesslicher Push-Kanal
  - keine Umgehung von Browser-/OS-Berechtigungen
- Push-Service-Extraktion beruecksichtigen:
  - diese Roadmap darf auf `MIDAS Touchlog Module & Push Service Extraction Roadmap` aufbauen
  - oder in S1/S2 entscheiden, ob diese zuerst umgesetzt werden muss
  - kein paralleler Doppel-Umbau derselben Push-Service-Grenze
- Android-Doku und Module Overviews synchronisieren.
- Lokal moegliche Checks, Code Reviews, Contract Reviews und echte Device-Smokes definieren.

## Not in Scope

- Aenderung der Medication-/BP-Schwellen.
- Aenderung der medizinischen Reminder-/Incident-Fachlogik.
- Reminder-Ketten, Snooze oder Eskalationslogik.
- Push-Spam oder automatische Re-Prompts ohne User-Intent.
- Native Android-Push-Schicht als Sofortfix.
- FCM-Integration ohne separate Roadmap.
- AlarmManager-/Exact-Alarm-Reminder ohne separate Roadmap.
- Widget als Capture-, Confirm- oder Reminder-System.
- Rueckkehr sichtbarer Push-Bedienung ins Profil.
- Anzeige von Tokens, UIDs, vollen Endpoints, VAPID-Keys, Auth-Keys oder sensiblen Rohdaten.
- Vollstaendige TWA-Neuimplementierung ohne separaten Architekturentscheid.
- Erzwingen oder Umgehen von Browser-/Android-Benachrichtigungsberechtigungen.
- Test-Push als medizinischer Reminder, Medication-Event oder BP-Event.
- Test-Push-Dedupe in `push_notification_deliveries`, sofern S2/S3 keinen expliziten getrennten Diagnosevertrag dafuer festlegt.

## Relevante Referenzen (Code)

- `service-worker.js`
- `public/sw/service-worker.js`
- `public/manifest.json`
- `.github/workflows/incidents-push.yml`
- `app/core/pwa.js`
- `app/diagnostics/devtools.js`
- `app/modules/profile/index.js`
- `app/modules/incidents/index.js`
- `app/supabase/api/push.js`
- `sql/15_Push_Subscriptions.sql`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/de/schabuss/midas/MainActivity.kt`
- `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`
- `android/app/src/main/java/de/schabuss/midas/web/NativeWebViewAuthBridge.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncScheduler.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetWakeRefresh.kt`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`

Potentiell neu oder umzubauen:

- `app/modules/push/index.js`
- `app/modules/touchlog/index.js`
- neue SQL-Migration fuer sichere Push-Subscription-Metadaten
- optional neue Edge Function oder neuer Diagnosemodus in `midas-incident-push`
- optional getrennte Diagnose-Delivery-Tabelle oder Diagnose-Health-Felder, falls S2/S3 das als sicherer bewertet als Wiederverwendung bestehender Health-Felder

## Relevante Referenzen (Doku)

- `README.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/MIDAS Touchlog Module & Push Service Extraction Roadmap.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Touchlog Module Overview.md`
- `docs/modules/Profile Module Overview.md`
- `docs/modules/Diagnostics Module Overview.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Android Native Auth Module Overview.md`
- `docs/modules/Auth Module Overview.md`
- `docs/modules/Supabase Core Overview.md`
- `docs/modules/bootflow overview.md`
- `android/README.md`
- `android/docs/Widget Contract.md`
- `docs/QA_CHECKS.md`
- `docs/archive/Push Cadence & Health Visibility Follow-up Roadmap (DONE).md`
- `docs/archive/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap (DONE).md`
- `docs/archive/twa-session-report.md`
- `docs/archive/twa-implementation-roadmap.md`
- `docs/archive/PWA-TWA Readiness.md`

## Guardrails

- MIDAS bleibt Lebensapp, nicht Debug-Werkbank.
- PWA/MIDAS bleibt fachliche Source of Truth.
- Android-Shell/Widget bleibt Node, nicht zweites MIDAS.
- Push bleibt expliziter User-Intent.
- Kein Push-Spam.
- Keine Reminder-Ketten ohne separaten Entscheid.
- Lokale Push-Suppression bleibt nur bei belastbarem Remote-Health-Nachweis erlaubt.
- Android-WebView darf nicht still wie ein vollwertiger Browser-/PWA-Push-Kanal behandelt werden.
- Widget bleibt read-only und kein Reminder-System.
- Touchlog bleibt Maintenance-Surface, kein Produktdashboard.
- Diagnose darf alltagstauglich bleiben und nicht mit Rohdaten ueberfrachten.
- User-facing Copy muss ruhig, klar und nicht alarmistisch sein.
- Source-of-Truth-Dokus muessen am Ende synchron sein.

## Architektur-Constraints

- Browser Web Push braucht Browser-/Origin-Permission, Service Worker und Push Subscription.
- Permission/Subscription kann nicht sinnvoll per Code "erzwungen" werden; sie braucht User-Intent und Browser-Unterstuetzung.
- Android-WebView ist nicht automatisch gleichwertig zu Chrome/PWA oder echter TWA.
- Eine echte native Android-Notification-Schicht braucht eigene Android-Berechtigungen, Notification Channel und eigenen Architekturvertrag.
- GitHub Actions ist nur Taktgeber; Edge Function entscheidet fachlich in `Europe/Vienna`.
- `push_notification_deliveries` dedupliziert fachliche Medication-/BP-Events und darf nicht fuer reine Transport-Smokes missbraucht werden, ohne das sauber zu trennen.
- Technischer Test-Push darf fachliche `push_notification_deliveries` nicht beschreiben und darf lokale medizinische Suppression nicht freischalten.
- `push_subscriptions` darf um Diagnose-Metadaten erweitert werden, aber keine sensiblen Rohdaten sichtbar machen.
- Der aktive Service Worker ist `/service-worker.js`; `public/sw/service-worker.js` ist nur Spiegel/Repo-Kopie und muss bei Aenderungen synchron bleiben.
- Android-Widget-Sync ueber WorkManager/Realtime/USER_PRESENT ist Best Effort und kein Off-App-Reminder-Ersatz.

## Tool Permissions

Allowed:

- Doku- und Code-Detektivarbeit in allen relevanten Push-/PWA-/Android-/Touchlog-Dateien.
- Anpassungen an `app/modules/profile/index.js`, solange noch keine Push-Service-Extraktion erfolgt ist.
- Anpassungen an `app/modules/push/index.js`, falls S1/S2 die Push-Service-Extraktion als Voraussetzung oder Teil dieser Roadmap bestaetigen.
- Anpassungen an `app/diagnostics/devtools.js` fuer Touchlog-Push-Diagnose und User-facing Kontextcopy.
- Anpassungen an `app/modules/incidents/index.js` nur fuer Push-Routing-/Suppression-Konsum, nicht fuer fachliche Schwellen.
- Anpassungen an `service-worker.js` und `public/sw/service-worker.js` nur fuer Diagnose-/Test-Push-Vertrag oder notwendige Payload-Kompatibilitaet.
- SQL-Migration fuer sichere, nicht-sensitive Subscription-Metadaten, falls S2/S3 das bestaetigt.
- Edge Function Aenderungen fuer technischen Test-Push oder Subscription-Diagnose, falls S2/S3 das bestaetigt.
- `.github/workflows/incidents-push.yml` nur fuer Diagnose-Smoke, falls S2/S3 das bestaetigt.
- Module Overviews, QA und Roadmap aktualisieren.
- Lokale Syntax-, rg-, diff-, static-smoke- und Device-Test-Anleitungen ausfuehren bzw. dokumentieren.
- Backend-Deploy nur nach expliziter S4/S5-Abnahme und wenn Edge Function tatsaechlich geaendert wurde.

Forbidden:

- Medication-/BP-Schwellen fachlich aendern.
- Medizinische Reminder-Copy ohne User-Facing Copy Review aendern.
- Native Android-Push/FCM/AlarmManager als Nebenbei-Fix einbauen.
- Widget zu Reminder-/Capture-System umbauen.
- Push-Opt-in automatisch ohne User-Intent starten.
- Browser-Permission-Prompts in Schleifen oder ohne explizite User-Aktion erzwingen.
- Browser-/OS-Benachrichtigungsberechtigungen umgehen oder als "force enable" simulieren.
- Test-Push-Erfolg ungeprueft als medizinischen Remote-Health-Erfolg fuer lokale Suppression verwenden.
- Sensitive Push-Rohdaten in UI oder Logs anzeigen.
- Profil wieder mit sichtbarer Push-Section ausstatten.
- Alte TWA-Archivspur reaktivieren, ohne S2-Architekturentscheid.

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S6`.
- `S1` bis `S3` sind Doku-Detektivarbeit, Systemverstaendnis, Risikoanalyse und Contract Reviews.
- `S4` ist der Umsetzungsblock.
- Code-Umsetzung in `S4` substepweise ausfuehren und nach jedem Substep reviewen.
- `S5` ist Tests, Code Review und Contract Review.
- `S6` ist Doku-Sync, QA-Update, finaler Contract Review, Commit-Empfehlung und Archiv-Entscheidung.
- Nach jedem Hauptschritt Statusmatrix aktualisieren.
- Nach jedem Hauptschritt mindestens ein Check oder Review dokumentieren.
- User-facing Copy Review ist Pflicht, sobald Touchlog-, Push- oder Notification-Texte sichtbar geaendert werden.
- Natuerliche Medication-/BP-Pushes sind E2E-Realitaetscheck, aber kein Blocker fuer die technische Transportdiagnose.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | System- und Vertragsdetektivarbeit | DONE | Systemkarte, Referenzcheck und S1-Contract-Review dokumentiert; PWA/Browser bleibt Push-Master, Android-WebView/Widget bleibt Node, Service-Worker-Spiegel-Drift als Pflichtcheck bestaetigt. |
| S2 | Zielarchitektur und Push-Kanal-Vertrag | DONE | Option A gewaehlt: PWA/Chrome ist Reminder-Push-Master; Android-WebView wird abgegrenzt; Test-Push ist eigener Diagnosekanal ohne medizinische Dedupe-/Suppression-Freischaltung. |
| S3 | Bruchrisiko-, Datenschutz-, UI-/Copy- und Migrationsreview | DONE | Risiken, Datenschutz, Copy und Migration geprueft; S4-Pflichtpunkte finalisiert: getrennte Diagnosefelder, WebView-Abgrenzung, keine Suppression durch Test-Push, SW-Root/Mirror-Sync. |
| S4 | Umsetzung Push-Robustheit und Android-WebView-Abgrenzung | DONE | S4.1-S4.14 erledigt: Push-Service-Boundary, Subscription-Metadaten, SQL-Felder, Touchlog-Diagnose, WebView-Abgrenzung, Diagnosemodus in bestehender Edge Function, Service-Worker-Review, sichere Responses, Suppression-Review, finale Checks und Abnahme sind abgeschlossen; Edge Function deployed. |
| S5 | Tests, Code Review und Contract Review | IN_PROGRESS | Codex-lokaler Teil erledigt: Syntax-/Static-Checks, Diff-/SW-/Edge-Smokes, echter Diagnose-Push und Contract Review sind sauber; offene User-Checks: neuer Touchlog/WebView-Kontext nach Frontend-Deploy und optionaler Android-Screen-off-Smoke. |
| S6 | Doku-Sync, QA-Update und Abschlussreview | TODO | Module Overviews, Android-Doku, QA und Roadmap final synchronisieren; Archiv-Entscheidung. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Vorab Findings 28.04.2026

### F1 - Edge Function und Scheduler sind nicht der primaere Bruchpunkt

Evidence:

- Natuerlicher Run `#652` hat einen faelligen Medication-Incident gesendet.
- Response enthielt `status=sent`, `deliveredSubscriptions=5`, `failed=[]`.
- PC/Edge hat die Benachrichtigung sichtbar angezeigt.

Folgerung:

- Backend, Dedupe, Scheduling und Web-Push-Sendepfad funktionieren grundsaetzlich.
- Der naechste Fokus liegt auf Client-Kontext, Subscription-Zuordnung und Android-Anzeigeverhalten.

### F2 - Android-WebView ist kein echter TWA-/Chrome-PWA-Push-Kanal

Evidence:

- Aktiver Android-Code nutzt `android.webkit.WebView`.
- Manifest enthaelt keine native Notification-Permission und keine native Notification-Schicht.
- Doku definiert WebView als Surface/Mirror und Widget als read-only Node.
- Im Android-WebView ist Push nicht sauber aktivierbar: `Berechtigung offen`, `Browser-Abo fehlt`.

Folgerung:

- Android-WebView darf nicht als verlaesslicher Off-App-Push-Kanal behandelt werden.
- Touchlog muss diesen Kontext erkennbar machen.

### F3 - Manuelle Medication-Smokes werden durch Dedupe verfaelscht

Evidence:

- Manueller Run `#654` lieferte `already-delivered`, obwohl weiterhin offene Morning-Slots existierten.
- Das ist fachlich korrekt, aber kein echter Transporttest.

Folgerung:

- Es braucht einen technischen Test-Push, der Dedupe der medizinischen Fachereignisse nicht beruehrt.

### F4 - `deliveredSubscriptions=N` ist zu grob fuer Device-Diagnose

Evidence:

- Aktuell sind mehrere Subscriptions aktiv.
- Es ist nicht sichtbar, welche Subscription zu Chrome Android, Edge Desktop, lokaler Dev-Umgebung, Android-WebView oder alten Endpoints gehoert.

Folgerung:

- Safe Client-/Kontext-Metadaten oder ein Endpoint-Hash sind fuer robuste Diagnose noetig.

### F5 - Service-Worker-Spiegel ist potentieller Drift-Punkt

Evidence:

- Der aktive Service Worker ist `/service-worker.js`.
- `public/sw/service-worker.js` existiert als Repo-Spiegel/Altpfad und ist nicht automatisch identisch.

Folgerung:

- Wenn S4 den Service Worker anfasst, muessen Root- und Spiegeldatei bewusst synchronisiert oder der Spiegelvertrag neu dokumentiert werden.
- Ein Push-Fix darf nicht nur in der inaktiven Spiegeldatei landen.

## Vorab Contract Review 28.04.2026

Review-Fragen:

- Darf diese Roadmap die bestehende `MIDAS Touchlog Module & Push Service Extraction Roadmap` ersetzen?
- Darf ein Test-Push die fachliche Medication-/BP-Dedupe oder lokale Suppression beeinflussen?
- Darf Push-Aktivierung technisch erzwungen werden?
- Darf die Android-WebView still als Push-Kanal repariert werden?

Entscheidungen:

- Nein, die Push-Service-Extraction bleibt eine eigene Modulgrenzen-Roadmap. Diese Roadmap darf sie nur als Voraussetzung, Vorblock oder bewusst integrierten Teil nach S2-Entscheid referenzieren.
- Nein, ein Test-Push ist zunaechst Diagnose-Transport und kein medizinischer Reminder. Ob er Subscription-Health aktualisiert, muss S2/S3 explizit entscheiden.
- Nein, Push-Permission kann und soll nicht erzwungen werden. Erlaubt ist nur gefuehrte Aktivierung mit explizitem User-Intent.
- Nein, Android-WebView wird nicht zum Push-Master hochgestuft. Sie bleibt Mirror/Shell; robuste Reminder laufen ueber PWA/Chrome oder spaeter ueber eine separate native Android-Roadmap.

Korrektur-Findings:

- KF1: Test-Push muss klar von `push_notification_deliveries` und medizinischem Dedupe getrennt sein.
- KF2: Test-Push darf lokale Suppression nicht unbeabsichtigt freischalten.
- KF3: Push-Service-Extraction muss als Abhaengigkeit/Koordination beschrieben werden, nicht als doppelter Umbau.
- KF4: "Force Activation" wird als gefuehrte Aktivierung definiert, nicht als Berechtigungs-Bypass.
- KF5: Service-Worker-Root/Spiegel-Drift ist als S3/S4/S5-Pflichtcheck aufzunehmen.

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- Bestehenden Push-/PWA-/Android-Vertrag vollstaendig verstehen.
- Keine Codeaenderung ausser Roadmap-Notizen.
- Klaeren, ob die bestehende `MIDAS Touchlog Module & Push Service Extraction Roadmap` zuerst umgesetzt werden muss.

Substeps:

- S1.1 README und MIDAS Roadmap Template lesen.
- S1.2 Module Overviews lesen:
  - Push
  - Touchlog
  - Profile
  - Diagnostics
  - Android Widget
  - Android Native Auth
  - Auth
  - Supabase Core
  - Bootflow
  - Android README und Widget Contract als Android-Vertragsreferenzen
- S1.3 Historische Roadmaps lesen:
  - Push Cadence & Health Visibility Follow-up Roadmap (DONE)
  - MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap (DONE)
  - TWA Session Report
  - TWA Implementation Roadmap
  - PWA-TWA Readiness
- S1.4 Codepfade inventarisieren:
  - Service Worker Push Receive/Display
  - PWA Registration
  - Touchlog Push UI
  - Profile Push API
  - Incidents lokale Suppression
  - SQL Push Subscriptions
  - Edge Function Delivery/Dedupe
  - Android WebView/Shell
  - Widget Sync
- S1.5 Ist-Systemkarte dokumentieren:
  - Wer erzeugt Subscription?
  - Wer sendet Remote-Push?
  - Wer zeigt Notification?
  - Wer dedupliziert?
  - Wer unterdrueckt lokale Fallbacks?
  - Welche Android-Komponenten sind nur Sync/Widget?
- S1.6 Findings gegen Vorab Findings F1-F5 pruefen und ergaenzen.
- S1.7 Vorab Contract Review und Korrektur-Findings KF1-KF5 gegen den Ist-Code pruefen.
- S1.8 Contract Review S1.
- S1.9 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Systemkarte.
- Relevante Dateien.
- Bestehender Vertrag.
- Offene Fragen.

Exit-Kriterium:

- Es ist klar, welche Schichten betroffen sind und welche nicht.

### S1 Ausfuehrung 28.04.2026

Gelesene und gepruefte Referenzen:

- `README.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/MIDAS Touchlog Module & Push Service Extraction Roadmap.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Touchlog Module Overview.md`
- `docs/modules/Profile Module Overview.md`
- `docs/modules/Diagnostics Module Overview.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Android Native Auth Module Overview.md`
- `docs/modules/Auth Module Overview.md`
- `docs/modules/Supabase Core Overview.md`
- `docs/modules/bootflow overview.md`
- `android/README.md`
- `android/docs/Widget Contract.md`
- `docs/archive/Push Cadence & Health Visibility Follow-up Roadmap (DONE).md`
- `docs/archive/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap (DONE).md`
- `docs/archive/twa-session-report.md`
- `docs/archive/twa-implementation-roadmap.md`
- `docs/archive/PWA-TWA Readiness.md`

Gepruefte Codepfade:

- `service-worker.js`
- `public/sw/service-worker.js`
- `public/manifest.json`
- `.github/workflows/incidents-push.yml`
- `app/core/pwa.js`
- `app/diagnostics/devtools.js`
- `app/modules/profile/index.js`
- `app/modules/incidents/index.js`
- `app/supabase/api/push.js`
- `sql/15_Push_Subscriptions.sql`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`
- `android/app/src/main/java/de/schabuss/midas/web/NativeWebViewAuthBridge.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncScheduler.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetWakeRefresh.kt`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`

Ist-Systemkarte:

- Subscription-Erzeugung:
  - Browser/PWA/Profile-internal API prueft `serviceWorker`, `PushManager`, `Notification.permission`, wartet auf `navigator.serviceWorker.ready` und erzeugt `registration.pushManager.subscribe(...)`.
  - Die Subscription wird in `push_subscriptions` per `user_id + endpoint` upserted.
  - Android-WebView nutzt denselben Webcode nur soweit WebView/Android diesen Browser-Push-Vertrag ueberhaupt anbietet; der aktuelle Befund zeigt dort `Berechtigung offen` und `Browser-Abo fehlt`.
- Remote-Sendepfad:
  - GitHub Actions ruft `midas-incident-push` auf.
  - Die Edge Function entscheidet in `Europe/Vienna`, liest offene Medication-/BP-Faelle, dedupliziert gegen `push_notification_deliveries` und sendet per `webpush.sendNotification(...)`.
  - Erfolgreiche Subscription-Zustellungen aktualisieren `last_remote_success_at`, Failure aktualisiert `last_remote_failure_at`, `last_remote_failure_reason`, Failure-Zaehler und deaktiviert 404/410-Endpoints.
- Notification-Anzeige:
  - Remote-Push landet im aktiven Browser-Service-Worker `/service-worker.js` und wird ueber `self.registration.showNotification(...)` angezeigt.
  - Lokale Incidents nutzen `registration.showNotification(...)` bzw. `Notification(...)` als Fallback.
  - Android-native Notifications existieren im aktuellen Android-Code nicht.
- Dedupe:
  - Remote-Dedupe liegt in `push_notification_deliveries` mit `user_id, day, type, severity, source`.
  - Lokale Incidents deduplizieren in Memory pro Tag/Typ/Severity.
  - Ein fachlicher `already-delivered` Run ist daher kein verlaesslicher technischer Transport-Smoke.
- Lokale Suppression:
  - `app/modules/incidents/index.js` fragt `profile.getPushRoutingStatus()` und `profile.shouldSuppressLocalPushes()` ab.
  - Suppression ist nur erlaubt, wenn `remoteHealthy` aus der passenden Browser-Subscription belastbar ist.
- Android-Komponenten:
  - Aktiver Android-Code ist `android.webkit.WebView` plus Native-Auth-Bridge und Widget-Sync-Bridge.
  - `AndroidManifest.xml` enthaelt nur `INTERNET`, keine native Notification-Permission und keine native Push-Schicht.
  - Widget-Vertrag ist read-only, Snapshot/Sync, kein Reminder-System.
  - `USER_PRESENT`/WorkManager sind Best-Effort-Sync, kein Push-/Weckpfad.

S1 Findings gegen F1-F5:

- S1-F1/F1 bestaetigt: Edge Function, Scheduler und Web-Push-Sendepfad funktionieren grundsaetzlich; Run `#652` hatte `status=sent`, `deliveredSubscriptions=5`, `failed=[]`.
- S1-F2/F2 bestaetigt: Der aktive Android-Pfad ist WebView/Shell, keine echte TWA/Chrome-PWA und keine native Push-Schicht.
- S1-F3/F3 bestaetigt: Fachliche Medication-Smokes koennen durch `already-delivered` korrekt blockiert werden und taugen dann nicht als Transporttest.
- S1-F4/F4 bestaetigt: `deliveredSubscriptions=N` ist fuer Device-Diagnose zu grob; `push_subscriptions` enthaelt aktuell keine sichere Kontextzuordnung.
- S1-F5/F5 bestaetigt: `service-worker.js` und `public/sw/service-worker.js` haben unterschiedliche SHA-256-Hashes; Root ist aktiv, Spiegel ist Drift-Risiko.
- S1-F6 ergaenzt: Die Push-Service-Extraction-Roadmap ist relevant, aber nicht automatisch Voraussetzung. S2 muss entscheiden, ob diese Roadmap zuerst, integriert oder bewusst minimal ohne Extraction weitergeht.

S1 Contract Review:

- PWA/Browser als Push-Master entspricht README, Push Overview, Bootflow und Android-Vertrag.
- Android-WebView als Node/Mirror entspricht Android Widget Overview, Android Native Auth Overview, `android/README.md` und Widget Contract.
- Ein Versuch, WebView-Push still zu "reparieren", wuerde gegen den bestehenden Android-Vertrag laufen, solange keine echte native Push- oder TWA-Entscheidung getroffen ist.
- Ein Test-Push muss getrennt vom medizinischen Dedupe bleiben, weil die bestehende Delivery-Tabelle fachliche Incidents dedupliziert.
- Safe Subscription-Diagnose darf nur Metadaten/Hashes/Labels zeigen, keine Endpoints, Keys oder Tokens.
- Root-/Mirror-Service-Worker-Sync ist Pflicht, falls S4 Service-Worker-Code beruehrt.

Korrekturen aus S1:

- S1.6 wurde von `F1-F4` auf `F1-F5` korrigiert.
- Android README und Widget Contract wurden als explizite S1-Vertragsreferenzen ergaenzt.
- S1-Status wurde in der Statusmatrix auf `DONE` gesetzt.

Rest-Risiken nach S1:

- S2 hat entschieden: Ein technischer Test-Push darf `last_remote_success_at` nicht wiederverwenden, solange dieses Feld lokale medizinische Suppression freischaltet.
- S2 hat entschieden: Push-Service-Extraction ist koordinierte Abhaengigkeit/Vorblock fuer S4, aber kein paralleler Doppel-Umbau.
- Offen fuer S3 bleibt, ob Subscription-Kontextdaten als neue Spalten, getrennte Diagnose-Tabelle oder rein abgeleitete Diagnose umgesetzt werden.

## S2 - Zielarchitektur und Push-Kanal-Vertrag

Ziel:

- Final festlegen, wie MIDAS Push kuenftig behandelt.
- Keine vorschnelle Android-native Umsetzung.
- Loesungsoptionen gegeneinander pruefen.

Substeps:

- S2.1 Ziel gegen MIDAS-Guardrails pruefen:
  - PWA ist Master.
  - Android ist Node.
  - Kein Push-Spam.
  - Kein versteckter medizinischer Automatismus.
- S2.2 Loesungsoptionen vergleichen:
  - Option A: PWA/Chrome bleibt alleiniger Reminder-Push-Kanal, Android-WebView wird als nicht unterstuetzt markiert.
  - Option B: echte TWA neu aufbauen und Push dort validieren.
  - Option C: native Android-Notifications spaeter separat bauen.
  - Option D: Status quo lassen und nur dokumentieren.
- S2.3 Preferred Contract festziehen:
  - Browser/PWA ist Push-Master.
  - Android-WebView ist nicht Push-Master.
  - Widget bleibt Snapshot-/Sync-Node.
  - Touchlog ist die sichtbare Push-Wartung.
- S2.4 Entscheiden, ob Push-Service-Extraktion Voraussetzung ist:
  - Falls ja: bestehende Roadmap zuerst oder als S4-Vorblock einplanen.
  - Falls nein: minimalen sicheren Umbau im bestehenden Profile-Push-Code zulassen.
  - Falls integriert: eindeutige Ownership der Push-Service-Grenze dokumentieren, damit kein paralleler Doppel-Umbau entsteht.
- S2.5 Test-Push-Vertrag festlegen:
  - eigener Diagnose-Typ
  - keine Medication-/BP-Dedupe-Beruehrung
  - klare Test-Copy
  - sichtbare oder manuelle Ausloesung nur im Maintenance-Kontext
  - Entscheidung, ob Test-Push Subscription-Health aktualisieren darf
  - Entscheidung, ob Test-Push eigene Diagnose-Health-Felder braucht
- S2.6 Subscription-Metadaten-Vertrag festlegen:
  - welche Felder erlaubt sind
  - welche Felder verboten sind
  - wie Endpoint-Hash/Label im Touchlog sichtbar werden darf
- S2.7 Gefuehrte Aktivierung definieren:
  - kein Permission-Bypass
  - keine automatischen Re-Prompts
  - klare Anleitung fuer Chrome/PWA als Push-Kanal
- S2.8 User-Facing Copy Review fuer WebView-/PWA-/Test-Push-Hinweise.
- S2.9 Contract Review S2.
- S2.10 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Finaler Push-Kanal-Vertrag.
- Entscheidung zu Push-Service-Extraktion.
- Entscheidung zu Test-Push.
- Entscheidung zu Subscription-Metadaten.

Exit-Kriterium:

- S4 kann ohne Architekturstreit umgesetzt werden.

### S2 Ausfuehrung 28.04.2026

Guardrail-Pruefung:

- PWA ist Master:
  - bestaetigt.
  - MIDAS-Reminder-Push wird produktiv als Browser-/PWA-Web-Push gefuehrt.
  - Chrome/PWA auf Android ist der empfohlene mobile Push-Kanal.
- Android ist Node:
  - bestaetigt.
  - Android-WebView/Shell bleibt Widget-/Sync-/Auth-Surface.
  - Android-WebView wird nicht als verlaesslicher Off-App-Push-Kanal verkauft.
- Kein Push-Spam:
  - bestaetigt.
  - Test-Push bleibt manuell/maintenance-getrieben und erzeugt keine Reminder-Kette.
- Kein versteckter medizinischer Automatismus:
  - bestaetigt.
  - Medication-/BP-Entscheidungen, Schwellen und fachliche Dedupe bleiben unveraendert.

Optionenentscheid:

- Option A: PWA/Chrome bleibt Reminder-Push-Kanal, Android-WebView wird abgegrenzt.
  - Entscheidung: bevorzugt und fuer diese Roadmap verbindlich.
  - Grund: passt zu README, Push-Vertrag, Android Widget Contract und aktuellem Codebefund.
- Option B: echte TWA neu aufbauen und Push dort validieren.
  - Entscheidung: nicht Teil dieser Roadmap.
  - Grund: waere eigener Android-/Store-/Assetlinks-/TWA-Architekturentscheid und loest nicht den aktuellen WebView-Befund minimal.
- Option C: native Android-Notifications spaeter separat bauen.
  - Entscheidung: nicht Teil dieser Roadmap.
  - Grund: braucht Android Notification Permission, Channel, Trigger-/Dedupe-Vertrag und vermutlich FCM/AlarmManager-Entscheid.
- Option D: Status quo lassen und nur dokumentieren.
  - Entscheidung: abgelehnt.
  - Grund: aktueller Status fuehrt zu falscher Erwartung im Android-WebView und zu zu grober Diagnose.

Finaler Push-Kanal-Vertrag:

- Browser/PWA:
  - ist Reminder-Push-Master.
  - besitzt Service Worker, PushManager, Notification Permission und Push Subscription.
  - darf Remote-Health fuer lokale Suppression liefern, aber nur ueber den bestehenden strengen Health-Vertrag.
- Android Chrome/PWA:
  - ist der empfohlene mobile Push-Kanal.
  - muss im Touchlog/Guided-Activation als Zielpfad genannt werden.
- Android-WebView/Shell:
  - ist kein Push-Master.
  - darf MIDAS anzeigen und Widget-Sync ausloesen.
  - darf Push-Aktivierung nicht so darstellen, als waere WebView gleichwertig zu Chrome/PWA.
- Android Widget:
  - bleibt Snapshot-/Sync-Node.
  - bleibt read-only.
  - bleibt kein Reminder-/Capture-System.
- Touchlog:
  - bleibt einzige sichtbare Push-Wartungs- und Diagnose-Surface.
  - zeigt Kontext, Push-Support, Browser-Abo, Remote-Health und Diagnose-Transport so, dass WebView nicht mit PWA verwechselt wird.
- Profile:
  - bleibt sichtbar push-frei.
  - darf Push-Service nur temporaer technisch beherbergen, bis die Modulgrenze extrahiert ist.
- Incidents:
  - bleibt fachliche Reminder-/Incident-Entscheidung.
  - konsumiert nur Push-Routing-/Health-Status, keine Touchlog-UI.

Entscheidung zu Push-Service-Extraction:

- Die `MIDAS Touchlog Module & Push Service Extraction Roadmap` bleibt fachlich richtig und relevant.
- Diese Roadmap darf die Push-Service-Grenze nicht parallel doppelt umbauen.
- S4 bekommt daher folgenden Vertrag:
  - Wenn `AppModules.push` bis dahin existiert, nutzt S4 diese API.
  - Wenn `AppModules.push` noch nicht existiert, wird die notwendige Push-Service-Grenze als erster S4-Code-Slice minimal hergestellt oder die Extraction-Roadmap wird bewusst vorgeschaltet.
  - Direkte neue Abhaengigkeiten auf `AppModules.profile` fuer Push-Robustheit sind verboten, ausser als temporaere Delegation mit klarer Doku.

Test-Push-Vertrag:

- Der Test-Push ist ein technischer Diagnose-Push.
- Er ist kein Medication-Event.
- Er ist kein BP-Event.
- Er schreibt nicht in `push_notification_deliveries`.
- Er darf fachliche `already-delivered`-Dedupe nicht lesen oder setzen.
- Er darf lokale medizinische Fallback-Suppression nicht automatisch freischalten.
- Er braucht eigene Diagnose-Health-Felder oder eine getrennte Diagnose-Delivery-Ablage, falls persistente Test-Ergebnisse benoetigt werden.
- Er darf pro Subscription technische Sendbarkeit pruefen und in der Response aggregiert ausgeben.
- Er muss als Test erkennbar sein:
  - Titel/Body muessen klar sagen, dass es ein MIDAS Push-Test ist.
  - Kein medizinischer Alarmton in der Copy.
  - Keine Dosierungs- oder Gesundheitsentscheidung in der Copy.
- Ausloesung:
  - nur manuell aus Touchlog/Maintenance oder ueber expliziten Workflow-/Edge-Diagnosemodus.
  - kein periodischer Test-Push.
  - kein automatischer Retry-Loop.

Subscription-Metadaten-Vertrag:

- Erlaubt:
  - stabiler Endpoint-Hash statt Endpoint
  - Client-Kontext, z. B. `pwa`, `browser`, `android-webview`, `desktop`, `unknown`
  - Display-Mode, z. B. `standalone`, `browser`, `webview`, `unknown`
  - Plattform-Familie, z. B. `android`, `windows`, `unknown`
  - Browser-Familie grob, z. B. `chrome`, `edge`, `webview`, `unknown`
  - frei editierbares oder automatisch erzeugtes Client-Label ohne sensible Daten
  - Created/Updated/Last diagnostic timestamps
- Verboten:
  - voller Endpoint
  - `p256dh`
  - `auth`
  - VAPID Keys
  - OAuth Tokens
  - Supabase Session Tokens
  - vollstaendige User-Agent-Rohstrings in UI
  - UIDs oder personenbezogene Rohdaten im Touchlog
- Touchlog-Darstellung:
  - maximal kurzer Kontext, Label und gekuerzter Hash.
  - keine Rohdaten.
  - keine Debug-Tabelle, die auf Mobile ueberlaedt.

Gefuehrte Aktivierung:

- Kein Permission-Bypass.
- Kein automatisches Re-Prompting.
- Kein "Force Enable".
- Der User muss explizit handeln.
- In Android-WebView muss der Hinweis ruhig erklaeren, dass Push dort nicht verlaesslich ist und Chrome/PWA der empfohlene Kanal ist.
- In Chrome/PWA muss die Aktivierung normal ueber Browser-Permission und Subscription laufen.

User-Facing Copy Review S2:

- WebView-Hinweis:
  - Ziel: klar, nicht alarmistisch.
  - Sinn: "Diese Android-Ansicht ist fuer Widget/Sync gedacht. Fuer verlaessliche Erinnerungen bitte MIDAS in Chrome/PWA aktivieren."
- Chrome/PWA-Hinweis:
  - Ziel: handlungsorientiert.
  - Sinn: "Push in Chrome/PWA aktivieren, damit Erinnerungen auch ohne geoeffnete App ankommen koennen."
- Test-Push-Copy:
  - Ziel: eindeutig technischer Test.
  - Sinn: "MIDAS Push-Test" und "Wenn du diese Nachricht siehst, kann dieser Browser Push empfangen."
- Remote-Health-Copy:
  - Ziel: keine falsche Sicherheit.
  - Sinn: zwischen `bereit, wartet`, `Test erfolgreich`, `remote gesund` und `pruefen` trennen.

S2 Contract Review:

- Review gegen Ziel:
  - PWA/Chrome bleibt offizieller Reminder-Push-Master.
  - Android-WebView wird bewusst abgegrenzt.
  - Widget bleibt kein Reminder-System.
  - Touchlog bleibt Maintenance-Surface.
- Review gegen Not in Scope:
  - Keine Medication-/BP-Schwellen-Aenderung.
  - Keine native Android-Push-Schicht.
  - Keine TWA-Neuimplementierung.
  - Kein Permission-Bypass.
  - Kein Test-Push als medizinisches Ereignis.
- Review gegen S1 Findings:
  - F1 bleibt: Edge Function nicht primaerer Bruchpunkt.
  - F2 wird adressiert: Android-WebView wird im Vertrag abgegrenzt.
  - F3 wird adressiert: Test-Push getrennt von fachlicher Dedupe.
  - F4 wird adressiert: Subscription-Metadaten/Hash-Vertrag festgelegt.
  - F5 wird adressiert: Service-Worker-Sync bleibt Pflichtcheck in S3-S5.

Korrektur-Findings S2:

- KF-S2-1: Test-Push darf `last_remote_success_at` nicht wiederverwenden, solange dieses Feld lokale medizinische Suppression freischaltet.
- KF-S2-2: S4 muss entweder `AppModules.push` nutzen oder die Push-Service-Grenze zuerst herstellen; neue Profile-Push-Abhaengigkeiten sind nur als dokumentierte temporaere Delegation erlaubt.
- KF-S2-3: Touchlog muss zwischen medizinischem Remote-Health und technischem Diagnose-Transport unterscheiden.
- KF-S2-4: Android-WebView-Copy muss "nicht verlaesslich fuer Push" sagen, aber keine technische Schuld oder Alarmstimmung erzeugen.

Korrekturen aus S2:

- Statusmatrix auf `DONE` gesetzt.
- Test-Push-Health wurde als getrennte Diagnose-Health definiert, nicht als medizinischer Remote-Health-Ersatz.
- Push-Service-Extraction wurde als koordinierte Abhaengigkeit/Vorblock fuer S4 festgelegt.

Rest-Risiken fuer S3:

- Datenschutz- und SQL-Review muss entscheiden, ob Diagnose-Health in `push_subscriptions` als neue nullable Felder oder in einer getrennten Diagnose-Tabelle liegt.
- S3 muss pruefen, wie Kontext-Erkennung sicher und robust ohne full User-Agent-Rohdaten funktioniert.
- S3 muss die genaue Touchlog-Copy finalisieren, bevor sichtbare Texte geaendert werden.

## S3 - Bruchrisiko-, Datenschutz-, UI-/Copy- und Migrationsreview

Ziel:

- Risiken vor Codeaenderungen pruefen.
- Datenschutz und User-facing Verhalten absichern.
- Konkrete S4-Pflichtpunkte definieren.

Substeps:

- S3.1 Bruchrisiko Service Worker:
  - Payload-Kompatibilitaet
  - Test-Push-Anzeige
  - Click-Handling
  - `service-worker.js` und `public/sw/service-worker.js` Sync
  - sicherstellen, dass keine Aenderung nur im inaktiven Spiegelpfad landet
- S3.2 Bruchrisiko Edge Function:
  - bestehende Medication-/BP-Dedupe unveraendert
  - technischer Test-Push getrennt
  - Delivery-/Health-Updates korrekt
  - Test-Push darf `push_notification_deliveries` nicht fachlich verschmutzen
  - Test-Push darf lokale medizinische Suppression nicht freischalten
  - Test-Push braucht getrennte Diagnose-Health-Felder oder eine getrennte Diagnose-Delivery-Ablage, falls persistiert
- S3.3 Bruchrisiko SQL:
  - RLS unveraendert sicher
  - keine sensiblen Rohdaten
  - Migration rueckwaertskompatibel
  - Diagnosefelder muessen fuer alte Subscriptions nullable/default-safe sein
- S3.4 Bruchrisiko Touchlog:
  - Mobile Layout
  - Copy-Laenge
  - keine Developer-Rohdaten
  - Push-Button-Verhalten im WebView-Kontext
- S3.5 Bruchrisiko Android:
  - WebView bleibt Mirror
  - Widget bleibt read-only
  - keine neue native Notification-Schicht versehentlich einschleusen
- S3.6 Datenschutzreview:
  - Endpoint-Hash statt Endpoint
  - User-Agent nur gekuerzt/normalisiert oder gar nicht sichtbar
  - keine Tokens/Keys in UI oder Logs
- S3.7 User-Facing Copy Review:
  - WebView-Hinweis
  - Chrome/PWA-Hinweis
  - Test-Push-Copy
  - Remote-Health-Copy
- S3.8 Roadmap-Koordination mit Push-Service-Extraction pruefen:
  - zuerst separate Extraction ausfuehren
  - oder hier bewusst minimal bleiben
  - oder S4-Substeps eindeutig zusammenfuehren
- S3.9 S4-Pflichtpunkte finalisieren.
- S3.10 Contract Review S3.
- S3.11 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Risiko- und Datenschutzbefund.
- Copy-Entscheidung.
- S4-Substep-Liste.

Exit-Kriterium:

- Code-/SQL-/Backend-Aenderungen sind klar begrenzt und reviewbar.

### S3 Ausfuehrung 28.04.2026

Bruchrisiko Service Worker:

- Befund:
  - `/service-worker.js` ist aktiver Push-Empfaenger.
  - `public/sw/service-worker.js` ist Spiegel/Altpfad und aktuell nicht hash-identisch.
  - Der bestehende Push-Handler akzeptiert generische Payloads mit `title`, `body`, `tag`, `data`.
- Risiko:
  - Ein Test-Push-Fix in der Spiegeldatei wuerde produktiv nichts aendern.
  - Unterschiedliche Root-/Mirror-Dateien koennen spaeter falsche Reviews erzeugen.
- S4-Pflicht:
  - Wenn der Service Worker geaendert wird, muessen Root und Spiegel bewusst synchronisiert werden.
  - Falls Test-Push mit bestehendem Payload-Vertrag auskommt, ist keine Service-Worker-Aenderung erforderlich.
  - S5 muss die aktive Root-Datei explizit pruefen.

Bruchrisiko Edge Function:

- Befund:
  - `midas-incident-push` schreibt fachliche Zustellungen in `push_notification_deliveries`.
  - `updateSubscriptionSuccess()` schreibt `last_remote_success_at`.
  - `last_remote_success_at` ist im Frontend Teil des medizinischen Remote-Health-Vertrags fuer lokale Suppression.
- Risiko:
  - Wenn ein Diagnose-Test `last_remote_success_at` setzt, koennte lokale medizinische Fallback-Suppression faelschlich freigeschaltet werden.
  - Wenn ein Test-Push in `push_notification_deliveries` schreibt, verschmutzt er fachliche Medication-/BP-Dedupe.
- S4-Pflicht:
  - Diagnosemodus darf `push_notification_deliveries` nicht lesen oder schreiben.
  - Diagnosemodus darf `last_remote_success_at` nicht setzen.
  - Diagnosemodus darf eigene Diagnosefelder aktualisieren.
  - Existing `window=all|med|bp`-Pfad bleibt fachlich unveraendert.

Bruchrisiko SQL:

- Befund:
  - `push_subscriptions` enthaelt bereits sensitive technische Rohdaten (`endpoint`, `p256dh`, `auth`, `subscription`) und medizinische Remote-Health-Felder.
  - RLS ist usergebunden.
  - `push_notification_deliveries` ist fachliche Delivery-/Dedupe-Tabelle.
- Entscheidung:
  - S4 soll keine neue History-Tabelle erzwingen.
  - S4 soll `push_subscriptions` um nullable, rueckwaertskompatible Diagnose-/Kontextfelder erweitern.
  - Falls S4 beim Implementieren merkt, dass History benoetigt wird, muss das als Finding zurueck in Review statt nebenbei eine Tabelle einzufuehren.
- Erlaubte neue Felder:
  - `endpoint_hash text`
  - `client_context text`
  - `client_display_mode text`
  - `client_platform text`
  - `client_browser text`
  - `client_label text`
  - `last_diagnostic_attempt_at timestamptz`
  - `last_diagnostic_success_at timestamptz`
  - `last_diagnostic_failure_at timestamptz`
  - `last_diagnostic_failure_reason text`
- S4-Pflicht:
  - Alle neuen Felder nullable/default-safe.
  - Keine RLS-Aufweichung.
  - Keine Aenderung an fachlichen Delivery-Constraints.
  - `last_diagnostic_*` darf von der lokalen Suppression nicht konsumiert werden.

Bruchrisiko Touchlog:

- Befund:
  - Touchlog ist sichtbare Push-Wartung.
  - Touchlog nutzt aktuell intern noch Profile-Push-API.
  - Mobile Layout ist nach Touchlog-Roadmap robuster, darf aber nicht mit Rohdaten ueberladen werden.
- Risiko:
  - Zu viele technische Details machen den Touchlog wieder zur Debug-Wand.
  - WebView-Toggle kann aktuell wie ein normaler Push-Aktivierungsweg wirken.
- S4-Pflicht:
  - Touchlog zeigt einen kompakten Push-Kontext.
  - Android-WebView bekommt ruhigen Hinweis statt Aktivierungsversprechen.
  - Subscription-Diagnose zeigt nur Label/Kontext/Hash-Kurzform und Health-Zusammenfassung.
  - Keine Endpoints, Keys, Tokens oder volle User-Agent-Strings.

Bruchrisiko Android:

- Befund:
  - Aktiver Android-Code nutzt `android.webkit.WebView`.
  - `AndroidManifest.xml` enthaelt keine native Notification-Permission.
  - Widget Contract sagt read-only, kein Reminder-System.
- Risiko:
  - Jede native Notification- oder Permission-Erweiterung waere eine neue Android-Push-Architektur.
- S4-Pflicht:
  - Keine Android-Codeaenderung fuer Push in dieser Roadmap.
  - Android-WebView wird nur im Web-/Touchlog-Kontext erkannt und abgegrenzt.
  - Widget bleibt unveraendert.

Datenschutzreview:

- Endpoint:
  - in DB technisch weiter noetig.
  - in UI verboten.
  - Diagnose nutzt Hash/Kurzform.
- Keys:
  - `p256dh`, `auth`, VAPID und Subscription-Rohdaten bleiben in UI und Logs verboten.
- User-Agent:
  - kein voller Rohstring in UI.
  - erlaubt ist normalisierte Browser-/Plattform-Familie.
  - Kontext-Erkennung bevorzugt Feature-/Bridge-Signale:
    - Android-WebView: vorhandene native Bridges wie `MidasAndroidAuth` oder `MidasAndroidWidget`
    - PWA/Standalone: `matchMedia('(display-mode: standalone)')`
    - Browser: normaler Web-Kontext
    - Plattform/Browser: grob normalisiert aus `navigator.userAgentData` oder fallback-normalisiertem UA

User-Facing Copy Review:

- WebView-Hinweis finaler Sinn:
  - "Diese Android-Ansicht ist fuer Widget und Sync gedacht. Fuer verlaessliche Erinnerungen bitte MIDAS in Chrome/PWA aktivieren."
- Chrome/PWA-Hinweis finaler Sinn:
  - "Push in Chrome/PWA aktivieren, damit Erinnerungen auch ohne geoeffnete App ankommen koennen."
- Test-Push-Copy finaler Sinn:
  - Titel: `MIDAS Push-Test`
  - Body: `Wenn du diese Nachricht siehst, kann dieser Browser MIDAS-Push empfangen.`
- Remote-/Diagnose-Health-Copy finaler Sinn:
  - Medizinisch belastbar: `remote gesund`
  - Neutral bereit: `bereit, wartet`
  - Technisch getestet: `Test erfolgreich`
  - Pruefbedarf: `Zustellung pruefen`
- Copy-Guardrail:
  - Keine Schuldzuweisung an Android oder WebView.
  - Keine Alarmstimmung.
  - Keine medizinische Dosierungs- oder Handlungsanweisung im Test-Push.

Roadmap-Koordination Push-Service-Extraction:

- Entscheidung:
  - S4 soll die Push-Service-Grenze nicht doppelt und unsauber bauen.
  - Da diese Roadmap Touchlog-Kontext und Test-Push direkt betrifft, darf S4 einen minimalen `AppModules.push`-Service als Vorblock herstellen, falls die Extraction-Roadmap noch nicht separat erledigt wurde.
  - Dieser Vorblock muss sichtbar UI-neutral bleiben und darf keine Layout-/Copy-Aenderung ausser den hier beschlossenen Push-Robustheits-Copy-Texten enthalten.
- Pflicht:
  - Touchlog und Incidents sollen danach nicht mehr direkt neue Profile-Push-Verantwortung ausbauen.
  - Falls bestehende Profile-Funktionen temporaer delegieren, muss das in S4 dokumentiert werden.

Finalisierte S4-Pflichtpunkte:

- S4.1 Push-Kontext-Erkennung zentralisieren:
  - `android-webview`
  - `pwa-standalone`
  - `browser`
  - `unknown`
  - plus grobe Plattform-/Browserfamilie
- S4.2 Minimalen Push-Service-Vorblock herstellen oder vorhandenes `AppModules.push` nutzen.
- S4.3 Subscription-Upsert um erlaubte Kontext-/Hash-Metadaten erweitern.
- S4.4 SQL-Migration fuer nullable Diagnose-/Kontextfelder erstellen.
- S4.5 Touchlog-Diagnose kompakt erweitern:
  - Kontext
  - Browser-Abo
  - medizinische Remote-Health
  - technische Diagnose-Health
  - WebView-Hinweis
- S4.6 WebView-Aktivierung enttaeuschen:
  - Kein falsches Toggle-Versprechen.
  - Gefuehrte Chrome/PWA-Aktivierung.
- S4.7 Technischen Test-Push bauen:
  - eigener Edge-/Workflow-Mode oder eigene Edge Function.
  - keine fachliche Dedupe.
  - keine medizinische Suppression.
  - eigene Diagnosefelder.
- S4.8 Service Worker nur anfassen, wenn Test-Push-Payload nicht mit bestehendem Handler reicht.
- S4.9 Edge Function Response ohne Rohdaten erweitern:
  - Counts
  - Hash-Kurzform oder Label
  - Kontext
  - Erfolg/Fehler ohne Endpoint
- S4.10 Lokale Suppression reviewen:
  - bleibt nur an medizinischem `remoteHealthy`.
  - ignoriert `last_diagnostic_*`.

S3 Contract Review:

- Scope:
  - Keine Medication-/BP-Fachlogik.
  - Keine Schwellen.
  - Keine native Android-Push-Schicht.
  - Keine TWA-Neuimplementierung.
  - Keine Widget-Erweiterung.
- Datenschutz:
  - Rohdaten bleiben verboten.
  - Endpoint-Hash/Label/Kontext sind erlaubt.
  - Keine volle User-Agent-Anzeige.
- Suppression:
  - Test-Push darf lokale medizinische Suppression nicht freischalten.
  - `remoteHealthy` bleibt streng an medizinische Remote-Delivery gebunden.
- Modulgrenze:
  - Push-Service-Extraction wird koordiniert, nicht parallel verdoppelt.
  - S4 darf einen minimalen Push-Service-Vorblock bauen, wenn das der sauberste Weg ist.

Korrektur-Findings S3:

- KF-S3-1: S4.6 darf nicht mehr formulieren `Health-Auswirkung nur gemaess S2/S3-Entscheid`, weil S2/S3 entschieden haben: keine medizinische Suppression durch Test-Push.
- KF-S3-2: S4.8 muss klarstellen, dass Diagnosefelder nicht `last_remote_success_at` sind.
- KF-S3-3: S5.4 muss pruefen, dass Test-Push `last_diagnostic_*` und nicht `last_remote_success_at` setzt.
- KF-S3-4: S5.8 muss explizit pruefen, dass `last_diagnostic_success_at` keine lokale Suppression ausloest.

Korrekturen aus S3:

- Statusmatrix auf `DONE` gesetzt.
- S4-Pflichtpunkte finalisiert.
- S3 hat nullable Diagnose-/Kontextfelder auf `push_subscriptions` als bevorzugte Migration festgelegt.

## S4 - Umsetzung Push-Robustheit und Android-WebView-Abgrenzung

Ziel:

- Findings aus S1-S3 sequenziell umsetzen.
- Nach jedem Substep kurz reviewen.

Finale Substeps gemaess S3:

- S4.1 Push-Kontext-Erkennung einfuehren oder zentralisieren:
  - Browser/PWA
  - Android-WebView
  - Standalone/PWA
  - unbekannter Browser
- S4.2 Push-Service-Modulgrenze nutzen oder vorbereiten:
  - falls bestehende Extraction-Roadmap erledigt ist: neue API verwenden
  - sonst minimale Delegation ohne sichtbare Profil-Rueckkehr
  - keine doppelte parallele Extraktion derselben Funktionen
- S4.3 Subscription-Metadaten erfassen:
  - erlaubte Felder aus S2/S3
  - sichere Defaults
  - bestehende Subscriptions bleiben gueltig
- S4.4 SQL-Migration fuer Diagnose-/Kontextfelder:
  - nullable Felder
  - getrennte technische Diagnosefelder
  - keine RLS-Aufweichung
- S4.5 Touchlog-Subscription-Diagnose erweitern:
  - keine sensiblen Rohdaten
  - ggf. Endpoint-Hash oder Client-Label
  - letzte Zustellung je erkennbarem Kontext
- S4.6 WebView-Aktivierung enttaeuschen/fuehren:
  - WebView-Kontext klar anzeigen
  - Push-Aktivierung in nicht unterstuetzten Kontexten nicht irrefuehrend wirken lassen
  - PWA/Chrome als empfohlenen Kanal nennen
  - gefuehrte Aktivierung statt Force Activation
- S4.7 Technischen Test-Push bauen:
  - eigenes Diagnoseereignis
  - keine Medication-/BP-Dedupe-Beruehrung
  - klarer Test-Payload
  - optional manueller Workflow-Input oder Edge-Function-Mode
  - keine fachliche `push_notification_deliveries`-Verschmutzung
  - schreibt nur getrennte Diagnosefelder, nicht `last_remote_success_at`
  - keine lokale medizinische Suppression durch Test-Push
- S4.8 Service Worker fuer Test-Push pruefen/anpassen:
  - Test-Copy
  - Tagging
  - Click-Ziel
  - Root-/Public-SW-Sync
- S4.9 Edge Function / Workflow erweitern, falls erforderlich:
  - Diagnosemodus
  - Diagnosefelder getrennt von medizinischen Remote-Health-Feldern
  - sichere Response mit Subscription-Kontext-Summary
  - keine Rohdaten
- S4.10 Lokale Suppression gegen neuen Health-/Kontextvertrag reviewen:
  - remoteHealthy bleibt streng
  - WebView erzeugt keine falsche Suppression
  - Test-Push erzeugt keine falsche Suppression
- S4.11 Code Review S4.
- S4.12 Contract Review S4.
- S4.13 Korrektur der Findings.
- S4.14 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Code-/SQL-/Backend-Aenderungen gemaess S3.
- Reviewnotizen je Substep.
- Keine fachliche Aenderung an Medication/BP.

Exit-Kriterium:

- MIDAS kann Push-Kontexte besser unterscheiden und technisch testen.

### S4.1 Umsetzung 28.04.2026 - Push-Kontext-Erkennung

Geaenderte Dateien:

- `app/modules/push/index.js`
- `index.html`

Umsetzung:

- Neues Modul `AppModules.push` angelegt.
- In S4.1 bewusst nur Kontextdiagnose umgesetzt, noch keine Push-Service-Extraction.
- Script in `index.html` direkt nach `app/core/pwa.js` geladen, damit spaetere Touchlog-/Profile-/Incidents-Schritte den Kontext konsumieren koennen.
- Kontext-API:
  - `detectContext()`
  - `getContext()`
  - `toSubscriptionMetadata()`
  - `buildClientLabel()`
- Erkannte Kontextwerte:
  - `android-webview`
  - `pwa-standalone`
  - `browser`
  - `unknown`
- Erkannte Display-Modes:
  - `webview`
  - `standalone`
  - `browser`
  - `unknown`
- Sichere Metadaten fuer spaetere Subscription-Upserts vorbereitet:
  - `client_context`
  - `client_display_mode`
  - `client_platform`
  - `client_browser`
  - `client_label`

Code Review S4.1:

- Keine Subscription-, SQL-, Edge-Function-, Service-Worker- oder Suppression-Logik geaendert.
- `AppModules.push` enthaelt aktuell keine `enablePush`, `disablePush`, `refreshPushStatus` oder Health-Ownership.
- Android-WebView-Erkennung bevorzugt native Bridge-Signale und nutzt UA nur normalisiert/funktional.
- Keine vollen User-Agent-Strings, Tokens, Endpoints oder Keys werden gespeichert oder angezeigt.
- Script-Reihenfolge ist passend fuer spaetere Konsumenten.

Contract Review S4.1:

- Erfuellt S3-Pflicht `Push-Kontext-Erkennung zentralisieren`.
- Verletzt nicht den S2-Vertrag:
  - PWA/Chrome bleibt Push-Master.
  - Android-WebView wird nur erkannt, nicht als Push-Master aufgewertet.
  - Test-Push, medizinische Remote-Health und lokale Suppression bleiben unberuehrt.
- Verletzt nicht die Push-Service-Extraction-Roadmap:
  - Das Modul ist ein Vorblock fuer `AppModules.push`.
  - Es uebernimmt noch keine Profile-Push-Service-Verantwortung.

Tests S4.1:

- `node --check app/modules/push/index.js`
- Node-VM-Kontexttest:
  - Android-WebView mit nativer Bridge wird `android-webview` und nicht empfohlen fuer Reminder-Push.
  - Android PWA Standalone wird `pwa-standalone` und bei Push-Support empfohlen.
  - Desktop Edge wird `browser` / `edge`.
  - Umgebung ohne `navigator` wird `unknown`.

Findings S4.1:

- Keine offenen Findings.

Naechster Substep:

- S4.2 erweitert dieses neue `AppModules.push` als minimalen Vorblock; die groessere Extraction bleibt koordiniert, aber wird nicht als separater Block vorgeschaltet.

### S4.2 Umsetzung 28.04.2026 - Minimaler Push-Service-Vorblock

Geaenderte Dateien:

- `app/modules/push/index.js`

Umsetzung:

- `AppModules.push` wurde um eine operative API-Grenze erweitert.
- Die API delegiert temporaer an das bestehende Profil-Push-Backend, falls dieses geladen und vollstaendig ist.
- Ohne Profil-Push-Backend bleiben alle Fallbacks konservativ.
- Neue API-Funktionen:
  - `hasOperationalPushApi()`
  - `enablePush()`
  - `disablePush()`
  - `isPushEnabled()`
  - `refreshPushStatus(options)`
  - `getPushRoutingStatus()`
  - `shouldSuppressLocalPushes()`
- `getPushRoutingStatus()` ergaenzt den bestehenden Routingstatus um:
  - `context`
  - `subscriptionMetadata`
- Keine Consumer wurden in S4.2 umgestellt.
- Keine sichtbare UI wurde geaendert.

Code Review S4.2:

- Keine Subscription-SQL-Migration.
- Keine Edge-Function-Aenderung.
- Keine Service-Worker-Aenderung.
- Keine Touchlog-Copy-Aenderung.
- Keine Incidents-Fachlogik-Aenderung.
- Lokale Suppression bleibt weiterhin aus dem bestehenden Profil-Remote-Health-Vertrag abgeleitet.
- Ohne Profilmodul liefert `shouldSuppressLocalPushes()` immer `false`.
- Ohne Profilmodul liefert `isPushEnabled()` immer `false`.
- `enablePush()` und `disablePush()` werfen ohne operatives Backend bewusst `Push-Service noch nicht bereit`, statt still falschen Erfolg zu melden.

Contract Review S4.2:

- Erfuellt S3-Pflicht `Minimalen Push-Service-Vorblock herstellen oder vorhandenes AppModules.push nutzen`.
- Verletzt nicht die Push-Service-Extraction-Roadmap:
  - S4.2 baut eine temporaere Delegationsgrenze.
  - Profil bleibt technisch noch Backend, aber neue Konsumenten koennen kuenftig `AppModules.push` verwenden.
  - Die vollstaendige Ownership-Migration bleibt als weiterer Refactor moeglich.
- Verletzt nicht den S2-/S3-Suppression-Vertrag:
  - Test-Push existiert noch nicht.
  - Diagnosefelder existieren noch nicht.
  - `last_diagnostic_*` wird noch nicht konsumiert.
  - `remoteHealthy` bleibt einzige Suppression-Quelle.

Tests S4.2:

- `node --check app/modules/push/index.js`
- Node-VM-Service-Boundary-Smoke:
  - Ohne Profil-Backend:
    - `hasOperationalPushApi() === false`
    - `isPushEnabled() === false`
    - `shouldSuppressLocalPushes() === false`
    - Routingstatus bleibt konservativ und enthaelt Kontext.
  - Mit Profil-Backend:
    - `hasOperationalPushApi() === true`
    - `enablePush`, `disablePush`, `refreshPushStatus`, `isPushEnabled`, `shouldSuppressLocalPushes` delegieren korrekt.
    - Routingstatus erhaelt bestehende Health-Werte plus Kontext.

Findings S4.2:

- Keine offenen Findings.

Naechster Substep:

- S4.3 bereitet Subscription-Upserts gezielt auf `AppModules.push` vor, ohne neue Profile-Push-Abhaengigkeiten zu schaffen.

### S4.3 Umsetzung 28.04.2026 - Subscription-Metadaten vorbereiten

Geaenderte Dateien:

- `app/modules/push/index.js`
- `app/modules/profile/index.js`

Umsetzung:

- `AppModules.push` erzeugt jetzt erlaubte Subscription-Metadaten fuer spaetere Persistenz:
  - `endpoint_hash`
  - `client_context`
  - `client_display_mode`
  - `client_platform`
  - `client_browser`
  - `client_label`
- `endpoint_hash` wird per SHA-256 aus dem Endpoint berechnet, sofern `crypto.subtle` verfuegbar ist.
- Falls Hashing nicht verfuegbar ist, wird kein Hash-Feld geschrieben statt einen schwachen Ersatz zu erzeugen.
- `profile/index.js` nutzt beim Push-Subscription-Upsert `AppModules.push.buildSubscriptionMetadata(...)`.
- Der Upsert ist schema-sicher:
  - Zuerst wird der angereicherte Payload versucht.
  - Wenn die neuen Metadaten-Spalten noch fehlen, wird automatisch mit dem bisherigen Basis-Payload erneut upserted.
  - Andere Fehler werden weiterhin geworfen.

Code Review S4.3:

- Keine SQL-Datei in S4.3 geaendert; Persistenz der neuen Felder wird erst mit S4.4 final.
- Keine Edge-Function-Aenderung.
- Keine Service-Worker-Aenderung.
- Keine Touchlog-UI-Aenderung.
- Keine Incidents-/Suppression-Aenderung.
- Kein Endpoint, Key oder Token wird in UI oder Logs ausgegeben.
- Der Fallback verliert nur die neuen Diagnose-Metadaten, nicht die bestehende Subscription.
- `last_remote_success_at`, `push_notification_deliveries` und medizinische Remote-Health bleiben unberuehrt.

Contract Review S4.3:

- Erfuellt S3-Pflicht `Subscription-Upsert um erlaubte Kontext-/Hash-Metadaten erweitern`.
- Bleibt rueckwaertskompatibel bis S4.4:
  - fehlende Spalten brechen Push-Aktivierung nicht.
  - nach SQL-Migration greift derselbe Code automatisch persistent.
- Verletzt nicht den Datenschutzvertrag:
  - Hash statt Endpoint fuer Diagnose.
  - normalisierte Kontextwerte statt voller User-Agent.
  - keine sensiblen Rohdaten sichtbar.
- Verletzt nicht den Suppression-Vertrag:
  - Metadaten haben keine Auswirkung auf `remoteHealthy`.
  - Metadaten haben keine Auswirkung auf `shouldSuppressLocalPushes()`.

Tests S4.3:

- `node --check app/modules/push/index.js`
- `node --check app/modules/profile/index.js`
- Node-VM-Metadata-Smoke:
  - SHA-256 Endpoint-Hash hat 64 Hex-Zeichen.
  - Metadata enthaelt `endpoint_hash`, `client_context`, `client_browser`, `client_label`.
  - Ohne `crypto.subtle` funktioniert Metadata-Erzeugung ohne `endpoint_hash`.
- Statischer Review:
  - `profile/index.js` nutzt angereicherten Upsert mit schema-sicherem Fallback.
  - Fallback schreibt nur den bisherigen Basis-Payload.

Findings S4.3:

- Keine offenen Code-Findings.
- Bewusst offener Folgepunkt fuer S4.4:
  - SQL-Spalten muessen noch angelegt werden, sonst bleibt die Persistenz der Metadaten im Fallback.

Naechster Substep:

- S4.4 muss die nullable Diagnose-/Kontextfelder in `push_subscriptions` per SQL-Migration anlegen und kommentieren.

### S4.4 Umsetzung 28.04.2026 - SQL-Migration fuer Diagnose-/Kontextfelder

Geaenderte Dateien:

- `sql/15_Push_Subscriptions.sql`

Umsetzung:

- `push_subscriptions` wurde idempotent um nullable Diagnose-/Kontextfelder erweitert:
  - `endpoint_hash text`
  - `client_context text`
  - `client_display_mode text`
  - `client_platform text`
  - `client_browser text`
  - `client_label text`
  - `last_diagnostic_attempt_at timestamptz`
  - `last_diagnostic_success_at timestamptz`
  - `last_diagnostic_failure_at timestamptz`
  - `last_diagnostic_failure_reason text`
- Neue Constraints:
  - `endpoint_hash` muss, falls gesetzt, ein 64-stelliger Hex-SHA-256 sein.
  - `client_context` darf nur `android-webview`, `pwa-standalone`, `browser`, `unknown` sein.
  - `client_display_mode` darf nur `webview`, `standalone`, `browser`, `unknown` sein.
  - `client_label` ist auf 120 Zeichen begrenzt.
- Neue Diagnose-Indexes:
  - `idx_push_subscriptions_user_endpoint_hash`
  - `idx_push_subscriptions_user_client_context`
  - `idx_push_subscriptions_user_diagnostic_health`
- Alle neuen Spalten wurden kommentiert.

Code Review S4.4:

- Alle neuen Felder sind nullable/default-safe.
- Keine RLS-Policy wurde aufgeweicht.
- Keine `push_notification_deliveries`-Struktur wurde fuer Diagnose erweitert.
- Medizinische Remote-Health-Felder bleiben getrennt:
  - `last_remote_success_at`
  - `last_remote_failure_at`
  - `consecutive_remote_failures`
- Technische Diagnosefelder sind getrennt:
  - `last_diagnostic_attempt_at`
  - `last_diagnostic_success_at`
  - `last_diagnostic_failure_at`
  - `last_diagnostic_failure_reason`

Contract Review S4.4:

- Erfuellt S3-Pflicht `SQL-Migration fuer nullable Diagnose-/Kontextfelder erstellen`.
- Verletzt nicht den Suppression-Vertrag:
  - `last_diagnostic_*` wird nicht vom Frontend gelesen.
  - `last_diagnostic_*` beeinflusst `remoteHealthy` nicht.
  - `last_diagnostic_*` beeinflusst `shouldSuppressLocalPushes()` nicht.
- Verletzt nicht den Datenschutzvertrag:
  - UI-relevante Zuordnung laeuft ueber Hash/Label/Kontext.
  - Roh-Endpunkte und Keys bleiben technische DB-Felder, aber werden nicht als Diagnoseanzeige vorgesehen.

Tests S4.4:

- Statische SQL-Pruefung:
  - alle zehn neuen Spalten per `add column if not exists` vorhanden.
  - kein Text-Coupling zwischen `last_diagnostic_success_at` und lokaler Suppression gefunden.
- `rg`-Review:
  - Frontend-Suppression liest weiterhin nur bestehende medizinische Remote-Health-Felder.
  - `push_notification_deliveries` bleibt fachliche Dedupe-/Delivery-Tabelle.
- Kein echter DB-Deploy in S4.4 ausgefuehrt.

Findings S4.4:

- Keine offenen Code-/SQL-Findings.
- Deployment bleibt separater Schritt, sobald die Backend-/SQL-Aenderungen gesammelt ausgerollt werden.

Naechster Substep:

- S4.5 kann die Touchlog-Subscription-Diagnose auf Basis dieser Felder vorbereiten, sobald die Daten in der DB angekommen sind.

### S4.5 Umsetzung 28.04.2026 - Touchlog-Subscription-Diagnose

Vorbedingung:

- SQL S4.4 wurde in Supabase erfolgreich ausgefuehrt:
  - `Success. No rows returned.`

Geaenderte Dateien:

- `app/modules/profile/index.js`
- `app/diagnostics/devtools.js`

Umsetzung:

- `profile/index.js` liest die neuen sicheren Diagnose-/Kontextfelder aus `push_subscriptions`:
  - `endpoint_hash`
  - `client_context`
  - `client_display_mode`
  - `client_platform`
  - `client_browser`
  - `client_label`
  - `last_diagnostic_attempt_at`
  - `last_diagnostic_success_at`
  - `last_diagnostic_failure_at`
  - `last_diagnostic_failure_reason`
- `profile.getPushRoutingStatus()` gibt diese Felder als sichere CamelCase-Werte weiter.
- `devtools.js` nutzt fuer Push-Wartung nun `AppModules.push` statt direkt `AppModules.profile`.
- Touchlog-Pushdetails wurden kompakt erweitert:
  - `Kontext`
  - `Geraet`
  - `Berechtigung`
  - `Browser-Abo`
  - `Remote`
  - `Diagnose`
  - `Endpoint-Hash`
  - `Letzter Erfolg`
  - `Letzter Fehler`
  - `Letzter Test`
  - `Geprueft`
- Android-WebView wird im Status klar abgegrenzt:
  - `Push: Android-WebView - Chrome/PWA empfohlen`

Code Review S4.5:

- Keine Roh-Endpunkte, Keys, Tokens oder vollen User-Agent-Strings werden im Touchlog angezeigt.
- `Endpoint-Hash` zeigt nur eine gekuerzte Hashform.
- `last_diagnostic_*` wird nur als Diagnoseanzeige genutzt.
- `remoteHealthy` bleibt unveraendert aus den medizinischen Remote-Health-Feldern abgeleitet.
- `shouldSuppressLocalPushes()` bleibt unveraendert an `localSuppressionAllowed` aus medizinischer Remote-Health gebunden.
- `devtools.js` haengt nicht mehr direkt an der Profile-Push-API, sondern an `AppModules.push`.
- `profile` bleibt temporaeres Backend, bis die vollstaendige Push-Service-Extraction erfolgt.

Contract Review S4.5:

- Erfuellt S3-Pflicht `Touchlog-Diagnose kompakt erweitern`.
- Erfuellt S2/S3-Copy-Vertrag:
  - WebView wird ruhig abgegrenzt.
  - Chrome/PWA wird empfohlen.
  - Keine Alarmstimmung.
  - Keine medizinische Handlungsanweisung im Diagnosebereich.
- Verletzt nicht Datenschutz:
  - keine Rohdaten sichtbar.
  - Hash/Label/Kontext sind erlaubt.
- Verletzt nicht Suppression:
  - Diagnose-Teststatus loest keine lokale Suppression aus.

Tests S4.5:

- `node --check app/diagnostics/devtools.js`
- `node --check app/modules/profile/index.js`
- `node --check app/modules/push/index.js`
- `rg`-Review:
  - Touchlog zeigt `Endpoint-Hash`, nicht Roh-Endpoint.
  - `last_diagnostic_*` wird nicht in Incidents oder Suppression konsumiert.
  - `remoteHealthy` und `localSuppressionAllowed` bleiben im Profilvertrag.

Findings S4.5:

- Keine offenen Code-Findings.
- Bewusster Folgepunkt:
  - S4.6 muss die WebView-Aktivierung noch aktiver enttaeuschen bzw. fuehren; S4.5 zeigt bereits den Kontext, verhindert aber den Toggle im WebView noch nicht.

Naechster Substep:

- S4.6 WebView-Aktivierung enttaeuschen und Chrome/PWA-Aktivierung fuehren.

### S4.6 Umsetzung 28.04.2026 - WebView-Aktivierung fuehren/blocken

Geaenderte Dateien:

- `app/diagnostics/devtools.js`

Umsetzung:

- Touchlog erkennt Android-WebView jetzt als Kontext, der nicht als verlaesslicher Reminder-Push-Kanal gefuehrt wird.
- Im Android-WebView wird der Push-Status ruhig abgegrenzt:
  - `Push: Android-WebView - Chrome/PWA empfohlen`
- Die Detailzeilen zeigen eine klare Empfehlung:
  - `Fuer Erinnerungen MIDAS in Chrome/PWA aktivieren.`
- Der Push-Toggle wird im Android-WebView blockiert:
  - `disabled`
  - `aria-disabled`
  - erklaerender `title`
- Der Change-Handler verweigert Aktivierung/Deaktivierung im Android-WebView vor dem Aufruf von `enablePush()` oder `disablePush()`.
- Browser/PWA-Kontexte behalten den bisherigen Push-Aktivierungsweg ueber `AppModules.push`.

Code Review S4.6:

- Keine Subscription-, SQL-, Edge-Function-, Service-Worker- oder Incidents-Aenderung.
- Keine fachliche Medication-/BP-Logik geaendert.
- Keine lokale Suppression geaendert.
- Kein Permission-Bypass und keine simulierte Force Activation.
- Android-WebView wird nicht als gesunder Push-Master verkauft.
- Copy bleibt ruhig und handlungsorientiert, ohne medizinische Anweisung.

Contract Review S4.6:

- Erfuellt den S2/S3-Vertrag:
  - PWA/Chrome bleibt Reminder-Push-Master.
  - Android-WebView bleibt Widget-/Sync-/Auth-Surface.
  - WebView-Push wird nicht still repariert oder aufgewertet.
- Erfuellt den Datenschutzvertrag:
  - keine neuen Rohdaten in UI oder Logs.
  - keine Endpoints, Keys, Tokens oder vollen User-Agent-Strings sichtbar.
- Erfuellt den User-Facing-Copy-Vertrag:
  - klare Empfehlung statt Alarm.
  - keine Schuldzuweisung an Android/WebView.

Tests S4.6:

- `node --check app/diagnostics/devtools.js`
- `node --check app/modules/profile/index.js`
- `node --check app/modules/push/index.js`
- `rg`-Review:
  - `enablePush()` und `disablePush()` werden im Touchlog erst nach dem Android-WebView-Blockcheck erreicht.
  - `isAndroidWebViewRouting()` wird fuer Status, Detailzeilen, Toggle-State und Change-Handler genutzt.
  - `setPushControlBlocked()` setzt `disabled`, `aria-disabled` und den erklaerenden Titel.

Findings S4.6:

- Keine offenen Code-Findings.
- Bewusster Device-Folgepunkt fuer S5:
  - Android-WebView-Negativtest muss bestaetigen, dass der Toggle sichtbar blockiert ist und Chrome/PWA empfohlen wird.

Naechster Substep:

- S4.7 Technischen Test-Push bauen, getrennt von Medication-/BP-Dedupe und ohne lokale Suppression freizuschalten.

### S4.7 Umsetzung 28.04.2026 - Technischer Diagnose-Push in bestehender Edge Function

Geaenderte Dateien:

- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- `.github/workflows/incidents-push.yml`

Umsetzung:

- Keine neue Edge Function erstellt.
- Bestehende `midas-incident-push` Edge Function wurde um `mode` erweitert:
  - `mode=incidents` bleibt Default und erhaelt den bestehenden Medication-/BP-Pfad.
  - `mode=diagnostic` aktiviert einen getrennten technischen Test-Push.
- Diagnosemodus ist nur mit `trigger=manual` erlaubt.
- Diagnosemodus verwendet denselben Web-Push-Transport, aber einen eigenen Test-Payload:
  - Titel: `MIDAS Push-Test`
  - Body: `Technische Benachrichtigung erfolgreich.`
  - `data.type=diagnostic_push`
  - `data.source=diagnostic`
- Diagnosemodus aktualisiert pro Subscription nur technische Diagnosefelder:
  - `last_diagnostic_attempt_at`
  - `last_diagnostic_success_at`
  - `last_diagnostic_failure_at`
  - `last_diagnostic_failure_reason`
- Diagnosemodus gibt eine sichere Subscription-Zusammenfassung zurueck:
  - gekuerzter Endpoint-Hash
  - Client-Kontext
  - Plattform
  - Browser
  - Label
- Diagnosefehler werden fuer Response/DB sanitisiert:
  - URLs werden entfernt.
  - Fehlertext wird gekuerzt.
- GitHub Actions Workflow wurde erweitert:
  - manueller Input `mode=incidents|diagnostic`
  - Scheduled Runs bleiben implizit `mode=incidents`
  - `workflow_dispatch` sendet `trigger=manual`

Code Review S4.7:

- Kein neuer Backend-Pfad und keine neue Edge Function.
- Bestehender Scheduler-/Incident-Pfad bleibt fachlich unveraendert:
  - `window=all|med|bp` bleibt erhalten.
  - Medication-/BP-Regeln bleiben unveraendert.
  - `push_notification_deliveries` bleibt nur im Incident-Pfad.
  - `updateSubscriptionSuccess()` bleibt nur im Incident-Pfad.
- Diagnosemodus liest oder schreibt keine `push_notification_deliveries`.
- Diagnosemodus setzt nicht `last_remote_success_at`.
- Diagnosemodus setzt nicht `consecutive_remote_failures`.
- Diagnosemodus deaktiviert keine Subscriptions bei 404/410.
- Diagnosemodus erzeugt keine lokale medizinische Suppression.
- Response enthaelt keine Roh-Endpunkte, Keys, Tokens oder volle User-Agent-Strings.

Contract Review S4.7:

- Erfuellt S2/S3-Test-Push-Vertrag:
  - technischer Diagnose-Push, kein Medication-/BP-Event.
  - manuell ausgeloest.
  - kein periodischer Test-Push.
  - keine fachliche Dedupe-Verschmutzung.
  - kein medizinischer Remote-Health-Erfolg.
- Erfuellt Guardrail des Users:
  - keine neue Edge Function.
  - bestehende `midas-incident-push` bleibt einziger Push-Backendpfad.
- Service Worker musste nicht geaendert werden:
  - bestehender Payload-Vertrag `title/body/tag/data` reicht fuer Test-Push.
  - Root-/Public-SW-Sync ist deshalb in S4.7 nicht betroffen.

Tests S4.7:

- `deno check C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- `node --check app/modules/push/index.js`
- `node --check app/modules/profile/index.js`
- `node --check app/diagnostics/devtools.js`
- Statischer Edge-Function-Review:
  - `mode=diagnostic` verzweigt vor Medication-/BP-Auswertung.
  - `push_notification_deliveries` wird im Diagnosepfad nicht erreicht.
  - `last_remote_success_at` wird im Diagnosepfad nicht gesetzt.
  - `last_diagnostic_*` wird nur im Diagnosepfad gesetzt.
- Statischer Workflow-Review:
  - Scheduled Runs bleiben ohne manuellen Diagnosemodus.
  - `workflow_dispatch` kann `mode=diagnostic` senden.
- Supabase Deploy/Bundling:
  - `C:/Users/steph/Projekte/midas-backend/supabase.exe functions deploy midas-incident-push --use-api --project-ref jlylmservssinsavlkdi`
  - Ergebnis: `Deployed Functions on project jlylmservssinsavlkdi: midas-incident-push`

Nachtrag lokale Smoke-Umgebung:

- `deno` ist lokal vorhanden (`2.7.13`) und wurde fuer den Edge-Function-Check genutzt.
- `.env.supabase.local` wurde als lokale Smoke-Test-Datei angelegt.
- `.gitignore` ignoriert `.env.supabase.local` explizit; die Datei bleibt lokal und wird nicht committed.
- `.gitignore` wurde dabei von UTF-16 auf UTF-8 ohne BOM normalisiert, weil Git die alte Kodierung nicht als Ignore-Datei angewendet hat.
- Direkter Remote-Dry-Run bleibt erst nach Befuellung der lokalen Secrets sinnvoll:
  - `INCIDENTS_PUSH_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Nach Befuellung der lokalen Secrets wurden Remote-Smokes ausgefuehrt:
  - Diagnose-Dry-Run: `ok=true`, `mode=diagnostic`, `dryRun=true`, `targetSubscriptions=5`.
  - Echter Diagnose-Push: `status=diagnostic-sent`, `sentSubscriptions=5`, `failedSubscriptions=0`.
  - Incident-Dry-Run: `ok=true`, `mode=incidents`, `dryRun=true`; bestehender fachlicher Pfad antwortet weiterhin.
  - Subscription-Kontextdaten sind noch `unknown`/leer, bis Clients nach dem neuen Frontend-Code erneut upserten.

Findings S4.7:

- Keine offenen Code-Findings.
- Bewusster Folgepunkt fuer S5:
  - Nach Commit/Push des Workflows kann ein manueller GitHub-Run mit `mode=diagnostic` den echten Test-Push ausloesen.
  - Danach pruefen: Android Chrome/PWA, Desktop Edge/Chrome und Touchlog-Diagnosefelder.

Naechster Substep:

- S4.8 Service Worker nur pruefen/anpassen, falls der Diagnose-Payload im echten Smoke nicht sauber angezeigt wird.

### S4.8 Umsetzung 28.04.2026 - Service-Worker-Review ohne Codeaenderung

Gepruefte Dateien:

- `service-worker.js`
- `public/sw/service-worker.js`

Ausgangslage:

- Der echte Diagnose-Push aus S4.7 kam am Android-Geraet an, obwohl das Frontend noch nicht neu deployed war.
- Damit ist bestaetigt, dass der bestehende aktive Service-Worker-Payload-Vertrag fuer Diagnose-Push ausreicht.

Befund:

- Aktiver produktiver Service Worker ist weiterhin `/service-worker.js`.
- `/service-worker.js` verarbeitet Push-Payloads ueber:
  - `title`
  - `body`
  - `tag`
  - `data`
  - optionale `silent`, `vibrate`, `requireInteraction`, `actions`
- Der Diagnose-Payload aus S4.7 nutzt nur den bestehenden Vertrag:
  - `title= MIDAS Push-Test`
  - `body= Technische Benachrichtigung erfolgreich.`
  - `tag=midas-diagnostic-push-...`
  - `data.type=diagnostic_push`
  - `data.source=diagnostic`
- Weil `diagnostic_push` keine Incident-Severity hat und kein `midas-incident-` Tag nutzt, bekommt er keine Incident-Vibration, keine Incident-Actions und kein `requireInteraction=true`.
- `notificationclick` fuehrt fuer Diagnose-Push ohne `dayIso`/medizinischen Incident nur zur App-Root.
- `public/sw/service-worker.js` ist weiterhin eine Spiegel-/Altpfad-Datei und enthaelt keinen Push-Handler.

Entscheidung:

- Keine Service-Worker-Codeaenderung in S4.8.
- Kein Root-/Public-SW-Sync in S4.8, weil kein Service-Worker-Code angefasst wurde.
- Der bestehende Root-Service-Worker bleibt fuer Diagnose-Push ausreichend.
- Die bekannte Drift zwischen Root und Spiegel bleibt ein Doku-/Review-Risiko fuer spaetere Service-Worker-Aenderungen, ist aber kein Blocker fuer diesen Test-Push.

Code Review S4.8:

- Keine Medication-/BP-Fachlogik geaendert.
- Keine Service-Worker-Cache-Version geaendert.
- Keine Notification-Copy im Service Worker geaendert.
- Keine Root-/Mirror-Datei geaendert.
- Kein neuer Click-Pfad fuer Diagnose-Push noetig.

Contract Review S4.8:

- Erfuellt S3-Vorgabe:
  - Service Worker nur anfassen, wenn der Diagnose-Payload nicht mit dem bestehenden Handler reicht.
- Erfuellt S4.7-Befund:
  - echter Diagnose-Push wurde erfolgreich angezeigt.
- Verletzt keinen Drift-Guardrail:
  - Da keine Service-Worker-Aenderung erfolgt, muss auch kein Mirror synchronisiert werden.

Tests S4.8:

- `git diff -- service-worker.js public/sw/service-worker.js`
  - keine Aenderungen.
- Statischer Review:
  - Root-Service-Worker enthaelt Push-Handler und `showNotification`.
  - Diagnose-Payload passt zum bestehenden `title/body/tag/data` Vertrag.
  - Spiegeldatei bleibt als inaktive Alt-/Mirror-Datei ohne Push-Handler dokumentiert.
- Realgeraete-Befund aus S4.7:
  - technischer Diagnose-Push kam am Handy an.

Findings S4.8:

- Keine offenen Code-Findings.
- Rest-Risiko:
  - Bei zukuenftigen Service-Worker-Aenderungen muss Root/Mirror explizit neu entschieden oder synchronisiert werden.

Naechster Substep:

- S4.9 Edge Function Response ohne Rohdaten reviewen; voraussichtlich nur Review/Korrektur, weil S4.7 bereits eine sichere Diagnose-Response eingefuehrt hat.

### S4.9 Umsetzung 28.04.2026 - Edge-Function-Response ohne Rohdaten

Geaenderte Dateien:

- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`

Umsetzung:

- Edge-Function-Responses wurden auf Rohdaten-Leaks geprueft.
- Diagnose-Responses waren bereits auf sichere Subscription-Zusammenfassungen begrenzt:
  - gekuerzter Endpoint-Hash
  - Client-Kontext
  - Plattform
  - Browser
  - Label
- Korrektur: Der normale Incident-Push-Fehlerpfad nutzt jetzt ebenfalls einen sicheren Fehlerformatter.
- Neuer gemeinsamer Formatter:
  - `formatSafePushError(err)`
- Der Formatter:
  - entfernt URLs aus Fehlertexten.
  - kuerzt Fehlertexte.
  - erhaelt technische Statuscodes wie `status=410`.
- Genutzt fuer:
  - Incident-Response `failed[].error`
  - `last_remote_failure_reason`
  - Diagnose-Response `failed[].error`
  - `last_diagnostic_failure_reason`
  - globalen 500-Response-Fehler

Code Review S4.9:

- Keine Roh-Endpunkte, Keys, Tokens, Auth-Secrets oder vollen Subscription-Objekte in Diagnose-Responses.
- Incident-Erfolgsresponse bleibt weiterhin aggregiert:
  - Typ
  - Severity
  - Anzahl gelieferter Subscriptions
- Incident-Fehlerresponse enthaelt keine rohe Web-Push-URL mehr.
- `last_remote_success_at` bleibt nur im fachlichen Incident-Erfolgspfad.
- `last_diagnostic_*` bleibt nur im Diagnosepfad.
- `push_notification_deliveries` bleibt nur fachliche Dedupe-/Delivery-Tabelle.

Contract Review S4.9:

- Erfuellt S3/S4-Vorgabe:
  - sichere Response mit Subscription-Kontext-Summary.
  - keine Rohdaten.
  - Diagnosefelder getrennt von medizinischen Remote-Health-Feldern.
- Verletzt keine Fachlogik:
  - Medication-/BP-Schwellen unveraendert.
  - Dedupe unveraendert.
  - Scheduler-Verhalten unveraendert.
- Erfuellt Datenschutz-Guardrail:
  - keine Endpoints oder Keys in Response/Touchlog-relevanten Failure-Reason-Feldern.

Tests S4.9:

- `deno check C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- `node --check app/modules/push/index.js`
- `node --check app/modules/profile/index.js`
- `node --check app/diagnostics/devtools.js`
- Supabase Deploy:
  - `C:/Users/steph/Projekte/midas-backend/supabase.exe functions deploy midas-incident-push --use-api --project-ref jlylmservssinsavlkdi`
  - Ergebnis: `Deployed Functions on project jlylmservssinsavlkdi: midas-incident-push`
- Remote-Smokes nach Deploy:
  - Diagnose-Dry-Run: `ok=true`, `mode=diagnostic`, `dryRun=true`, `targetSubscriptions=5`.
  - Incident-Dry-Run: `ok=true`, `mode=incidents`, `dryRun=true`; bestehender fachlicher Pfad antwortet weiterhin.

Findings S4.9:

- Korrigiertes Finding:
  - Normaler Incident-Fehlerpfad verwendete bisher rohe `formatError(err)` in Response und Remote-Failure-Reason.
  - Fix: `formatSafePushError(err)` entfernt URLs und kuerzt Fehlertexte.
- Keine offenen Code-Findings.

Naechster Substep:

- S4.10 lokale Suppression gegen neuen Health-/Kontextvertrag reviewen.

### S4.10 Umsetzung 28.04.2026 - Lokale Suppression gegen Health-/Kontextvertrag reviewen

Geaenderte Dateien:

- `app/modules/incidents/index.js`

Gepruefte Dateien:

- `app/modules/profile/index.js`
- `app/modules/push/index.js`
- `app/modules/incidents/index.js`
- `app/diagnostics/devtools.js`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`

Umsetzung:

- Lokale Incident-Suppression wurde gegen den neuen Diagnose-/Kontextvertrag geprueft.
- Korrektur: `incidents/index.js` nutzt fuer Suppression jetzt bevorzugt `AppModules.push`.
- `AppModules.profile` bleibt nur als Rueckfall fuer Altzustand, falls `AppModules.push` nicht geladen ist.
- Suppression-Verhalten selbst bleibt unveraendert:
  - stale Routing wird refresh'd.
  - bei Refresh-Fehler wird der letzte bekannte Routing-State genutzt.
  - ohne verfuegbare Push-API wird nicht suppressed.

Code Review S4.10:

- `profile.isRemoteSubscriptionHealthy(row)` bleibt streng:
  - Subscription darf nicht disabled sein.
  - `last_remote_success_at` muss gueltig sein.
  - neuerer `last_remote_failure_at` hebt Health auf.
  - `consecutive_remote_failures` muss `0` sein.
- `localSuppressionAllowed` wird weiterhin exakt auf `remoteHealthy` gesetzt.
- `shouldSuppressLocalPushes()` gibt nur `localSuppressionAllowed` zurueck.
- `AppModules.push.shouldSuppressLocalPushes()` delegiert temporaer an Profile und liefert ohne Profil konservativ `false`.
- `last_diagnostic_*` wird nur gelesen/angezeigt, aber nicht fuer `remoteHealthy` oder `localSuppressionAllowed` verwendet.
- Android-WebView-Kontext beeinflusst lokale Suppression nicht positiv.
- Subscription-Metadaten wie `client_context`, `endpoint_hash`, `client_platform` beeinflussen lokale Suppression nicht.

Contract Review S4.10:

- Erfuellt S2/S3-Vertrag:
  - Test-Push schaltet keine lokale medizinische Suppression frei.
  - Diagnose-Health ist getrennt von medizinischer Remote-Health.
  - WebView-Kontext wird nicht als gesunder Push-Master interpretiert.
- Erfuellt Modulgrenzen-Vertrag:
  - Neue Incidents-Abhaengigkeit geht bevorzugt ueber `AppModules.push`.
  - Profile bleibt nur temporaeres Backend/Fallback.
- Verletzt keine Fachlogik:
  - Medication-/BP-Schwellen unveraendert.
  - lokale Fallback-Notification-Logik unveraendert.
  - Suppression bleibt nur bei belastbarem Remote-Health-Nachweis.

Tests S4.10:

- `node --check app/modules/incidents/index.js`
- `node --check app/modules/push/index.js`
- `node --check app/modules/profile/index.js`
- `node --check app/diagnostics/devtools.js`
- `deno check C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- `rg`-Review:
  - `last_diagnostic_*` wird in Incidents nicht konsumiert.
  - `remoteHealthy` wird nur aus `last_remote_success_at`, `last_remote_failure_at`, `disabled` und `consecutive_remote_failures` abgeleitet.
  - `incidents/index.js` nutzt fuer Suppression bevorzugt `AppModules.push`.

Findings S4.10:

- Korrigiertes Finding:
  - `incidents/index.js` hing fuer Suppression noch direkt an `AppModules.profile`.
  - Fix: bevorzugt `AppModules.push`, Profile nur als Fallback.
- Keine offenen Code-Findings.

Naechster Substep:

- S4.11 Code Review S4.

### S4.11 Code Review S4 28.04.2026

Gepruefte Dateien:

- `.github/workflows/incidents-push.yml`
- `.gitignore`
- `index.html`
- `app/modules/push/index.js`
- `app/modules/profile/index.js`
- `app/modules/incidents/index.js`
- `app/diagnostics/devtools.js`
- `sql/15_Push_Subscriptions.sql`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`

Review-Ergebnis:

- Der Frontend-Push-Zugriff laeuft fuer neue Touchlog-/Suppression-Pfade bevorzugt ueber `AppModules.push`.
- `AppModules.profile` bleibt nur temporaeres Backend/Fallback, bis die separate Push-Service-Extraction vollstaendig umgesetzt wird.
- `index.html` laedt `app/modules/push/index.js` vor den Diagnose-/Feature-Modulen, die den Push-Kontext brauchen.
- Touchlog zeigt sichere Kontextdaten, Diagnosefelder und gekuerzten Endpoint-Hash, aber keine Roh-Endpunkte, Keys, Tokens oder vollen User-Agent-Strings.
- Android-WebView wird als nicht empfohlener Reminder-Push-Kontext dargestellt und der Toggle dort blockiert.
- Die Edge Function nutzt weiter die bestehende `midas-incident-push` Function; es wurde keine neue Edge Function erstellt.
- Der Diagnosemodus ist manuell, getrennt vom fachlichen Incident-Pfad und schreibt nur `last_diagnostic_*`.
- `push_notification_deliveries`, `last_remote_success_at`, `last_remote_failure_at` und `consecutive_remote_failures` bleiben dem fachlichen Incident-Pfad vorbehalten.
- `.env.supabase.local` ist lokal vorhanden, aber per `.gitignore` ausgeschlossen.
- `.gitignore` wurde von UTF-16 auf UTF-8 normalisiert, weil Git die alte Kodierung nicht verlaesslich als Ignore-Datei angewendet hat.

Bewusst akzeptierte Restpunkte:

- Bestehende Subscriptions zeigen noch `unknown`/leere Kontextdaten, bis Clients mit dem neuen Frontend erneut upserten.
- Die Edge Function liegt im separaten Backend-Pfad `C:/Users/steph/Projekte/midas-backend/...` und ist nicht Teil des MIDAS-Git-Status.
- `public/sw/service-worker.js` bleibt ein inaktiver Spiegel-/Altpfad; da S4 keinen Service Worker geaendert hat, war kein Sync noetig.

Findings S4.11:

- Keine offenen Code-Findings.

### S4.12 Contract Review S4 28.04.2026

Review gegen Ziel und Guardrails:

- PWA/Browser bleibt Reminder-Push-Master.
- Android-WebView/Shell bleibt Widget-/Sync-/Auth-Surface und wird nicht still als verlaesslicher Push-Kanal behandelt.
- Push-Aktivierung bleibt User-Intent; es gibt keinen Permission-Bypass und keine Force Activation.
- Der technische Diagnose-Push ist kein Medication-/BP-Reminder, kein medizinischer Incident und kein Scheduler-Spam.
- Diagnose-Push schreibt nicht in `push_notification_deliveries`.
- Diagnose-Push setzt keine medizinischen Remote-Health-Felder.
- Lokale Suppression bleibt nur bei belastbarem Remote-Health-Nachweis erlaubt.
- Medication-/BP-Schwellen, Dedupe und fachliche Reminder-Copy bleiben unveraendert.
- Touchlog bleibt Maintenance-Surface und wird nicht mit Rohdaten ueberfrachtet.
- User-facing Copy bleibt ruhig und handlungsorientiert:
  - `Push: Android-WebView - Chrome/PWA empfohlen`
  - Empfehlung: `Fuer Erinnerungen MIDAS in Chrome/PWA aktivieren.`
  - Test-Copy: `MIDAS Push-Test` / `Technische Benachrichtigung erfolgreich.`

Contract-Ergebnis:

- S4 entspricht der in S1-S3 festgelegten Grundidee.
- Keine Guardrail-Verletzung festgestellt.

### S4.13 Korrektur der Findings 28.04.2026

Bereits waehrend S4 korrigierte Findings:

- S4.3: Subscription-Upsert wurde schema-sicher gemacht, damit fehlende Metadaten-Spalten Push-Aktivierung nicht brechen.
- S4.6: Android-WebView-Aktivierung wird im Touchlog blockiert und als Chrome/PWA-Empfehlung erklaert.
- S4.7: Diagnose-Push wurde als `mode=diagnostic` in der bestehenden Edge Function umgesetzt statt als neue Edge Function.
- S4.8: Service Worker wurde bewusst nicht geaendert, weil der bestehende Root-Service-Worker den Diagnose-Payload bereits korrekt anzeigen kann.
- S4.9: Incident-Fehlerpfad nutzt nun ebenfalls den sicheren `formatSafePushError(...)` statt rohe Fehlertexte auszugeben.
- S4.10: Lokale Suppression konsumiert bevorzugt `AppModules.push` statt direkt `AppModules.profile`.
- S4.11: `.env.supabase.local` wurde per `.gitignore` ausgeschlossen; `.gitignore` wurde UTF-8-normalisiert.

Offene Findings nach Korrektur:

- Keine offenen S4-Code-Findings.
- Folgepunkt fuer S5/S6:
  - Nach Frontend-Deploy muessen neue/erneuerte Subscriptions die Kontextfelder fuellen.
  - Source-of-Truth-Dokus muessen den neuen Push-/WebView-/Diagnosevertrag aufnehmen.

### S4.14 Schritt-Abnahme 28.04.2026

Finale Checks:

- `deno check C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- `node --check app/modules/push/index.js`
- `node --check app/modules/profile/index.js`
- `node --check app/modules/incidents/index.js`
- `node --check app/diagnostics/devtools.js`
- `git check-ignore -v .env.supabase.local`
- Remote Diagnose-Dry-Run:
  - `ok=true`
  - `mode=diagnostic`
  - `dryRun=true`
  - `targetSubscriptions=5`
- Remote Incident-Dry-Run:
  - `ok=true`
  - `mode=incidents`
  - `dryRun=true`
  - fachlicher Pfad antwortet weiterhin mit Medication-/BP-Diagnostik.

Abnahme:

- S4 ist abgeschlossen.
- Edge Function ist deployed.
- SQL wurde durch den User in Supabase ausgefuehrt.
- Technischer Diagnose-Push wurde bereits real getestet und kam am Android-Geraet an.
- S5 kann mit Device-/Workflow-Smokes und finalem Code-/Contract-Review starten.

Commit-Hinweis:

- MIDAS-Repo enthaelt Frontend-, Workflow-, SQL- und Doku-Aenderungen.
- Backend-Edge-Function wurde im separaten Pfad `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts` geaendert und deployed.
- `.env.supabase.local` bleibt lokal und darf nicht committed werden.

## S5 - Tests, Code Review und Contract Review

Ziel:

- Lokal und mit realem Geraet pruefen, ohne tagelang auf natuerliche Pushes warten zu muessen.
- Natuerliche Pushes bleiben nur E2E-Bestaetigung.

Substeps:

- S5.1 Lokale Syntax-/Static-Checks:
  - betroffene JS-Dateien
  - Service Worker
  - SQL falls geaendert
  - Android falls geaendert
- S5.2 Diff Review:
  - keine Medication-/BP-Fachlogik veraendert
  - keine sensitive Daten sichtbar
  - keine Profil-Push-UI Rueckkehr
- S5.3 Service Worker Review:
  - Push Receive
  - Test-Push Payload
  - Click Handling
  - Root-/Public-SW-Sync
  - aktive Root-Datei ist tatsaechlich geaendert, falls SW angepasst wurde
- S5.4 Edge Function Smoke:
  - dry run falls vorhanden
  - technischer Test-Push
  - Response enthaelt keine Rohdaten
  - bestehender `window=all`-Pfad unveraendert
  - Test-Push schreibt nicht in fachliche Medication-/BP-Deliveries
  - Test-Push setzt keine medizinischen Remote-Health-Felder wie `last_remote_success_at`
  - Test-Push setzt, falls persistiert, nur `last_diagnostic_*`
- S5.5 Chrome/PWA Device-Smoke:
  - MIDAS in Android Chrome/PWA
  - Push aktiv
  - Screen aus
  - technischer Test-Push
  - Erwartung: sichtbare Notification ohne App-Oeffnung
- S5.6 Android-WebView Negativ-/Abgrenzungstest:
  - MIDAS in Android-WebView
  - Touchlog zeigt nicht-irrefuehrenden Kontext
  - WebView wird nicht als gesunder Push-Master verkauft
- S5.7 Desktop-Smoke:
  - Edge/Chrome Desktop bekommt Test-Push
  - bestehende Remote-Health-Anzeige bleibt plausibel
- S5.8 Lokale Suppression Smoke:
  - keine lokale Suppression ohne echten Remote-Health-Nachweis
  - `bereit, wartet` bleibt neutral
  - `last_diagnostic_success_at` loest keine lokale Suppression aus
- S5.9 Code Review.
- S5.10 Contract Review gegen S2/S3.
- S5.11 Korrektur der Findings.
- S5.12 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Testmatrix.
- Ergebnis je Umgebung.
- Rest-Risiken.

Exit-Kriterium:

- Technischer Push-Transport ist ohne natuerlichen Medication-/BP-Reminder pruefbar.

### S5 Ausfuehrung 28.04.2026 - Codex-lokaler Test- und Reviewblock

S5.1 Lokale Syntax-/Static-Checks:

- `deno check C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- `node --check app/modules/push/index.js`
- `node --check app/modules/profile/index.js`
- `node --check app/modules/incidents/index.js`
- `node --check app/diagnostics/devtools.js`
- `node --check service-worker.js`
- `node --check public/sw/service-worker.js`
- `git diff --check`
- `git check-ignore -v .env.supabase.local`

Ergebnis:

- Alle Checks erfolgreich.
- `.env.supabase.local` ist ignored.
- `git diff --check` meldet keine Whitespace-Fehler; Git zeigt nur bekannte LF/CRLF-Hinweise.

S5.2 Diff Review:

- Keine Medication-/BP-Schwellen geaendert.
- Keine fachliche Reminder-/Incident-Copy geaendert.
- Keine Profil-Push-UI wieder eingefuehrt.
- Keine nativen Android-/FCM-/AlarmManager-Aenderungen.
- Keine sichtbaren Roh-Endpunkte, Push-Keys, Tokens oder vollen User-Agent-Strings im Touchlog.
- `app/modules/profile/index.js` enthaelt weiterhin technische Endpoint-/Key-Verarbeitung, aber nur fuer Subscription-Persistenz und Health-Abfrage.
- `app/modules/push/index.js` erzeugt fuer Diagnose nur Hash/Kontext/Label, keine Rohdatenanzeige.

S5.3 Service-Worker-Review:

- `service-worker.js` und `public/sw/service-worker.js` wurden in S4/S5 nicht geaendert.
- Aktiver Push-Empfaenger bleibt `/service-worker.js`.
- Diagnose-Payload nutzt den bestehenden Vertrag `title/body/tag/data`.
- Kein Root-/Public-SW-Sync noetig, weil kein Service-Worker-Code geaendert wurde.
- Rest-Risiko bleibt dokumentiert:
  - Bei zukuenftigen Service-Worker-Aenderungen muss Root/Mirror bewusst synchronisiert oder neu entschieden werden.

S5.4 Edge Function Smoke:

- Diagnose-Dry-Run:
  - `ok=true`
  - `mode=diagnostic`
  - `dryRun=true`
  - `targetSubscriptions=5`
- Echter Diagnose-Push:
  - `ok=true`
  - `mode=diagnostic`
  - `dryRun=false`
  - `status=diagnostic-sent`
  - `sentSubscriptions=3`
  - `failedSubscriptions=0`
- Incident-Dry-Run:
  - `ok=true`
  - `mode=incidents`
  - `window=all`
  - `dryRun=true`
  - fachlicher Pfad antwortet weiterhin.

Review S5.4:

- Diagnosemodus ist ohne natuerlichen Medication-/BP-Reminder pruefbar.
- Diagnosemodus schreibt laut Code Review nicht in `push_notification_deliveries`.
- Diagnosemodus setzt laut Code Review keine medizinischen Remote-Health-Felder wie `last_remote_success_at`.
- Diagnosemodus setzt nur `last_diagnostic_*`.
- Incident-Dry-Run bestaetigt, dass der bestehende fachliche Pfad weiter erreichbar ist.

S5.5 Chrome/PWA Device-Smoke:

- Realbefund User 28.04.2026:
  - Ohne Frontend-Commit meldeten Live Server, Windows-PWA und Android-PWA, dass BP noch offen ist.
  - Das bestaetigt den produktiven Remote-Push-Transport auf Android grundsaetzlich.
- Codex-lokal:
  - echter Diagnose-Push wurde erfolgreich an aktive Subscriptions gesendet.

Offen fuer User:

- Nach Frontend-Deploy/Commit einmal in Android Chrome/PWA Push-Status und Kontext im neuen Touchlog pruefen.
- Optional: Screen aus, technischer Diagnose-Push oder naechster natuerlicher Reminder, sichtbare Notification ohne App-Oeffnung bestaetigen.

S5.6 Android-WebView Negativ-/Abgrenzungstest:

- Codex-lokal statisch bestaetigt:
  - `devtools.js` erkennt `android-webview` ueber Routing-Kontext.
  - Status wird `Push: Android-WebView - Chrome/PWA empfohlen`.
  - Toggle wird blockiert und ruft `enablePush()`/`disablePush()` nicht auf.
  - Detailzeile empfiehlt Chrome/PWA fuer Erinnerungen.

Offen fuer User:

- Nach Frontend-Deploy/Commit Android-Shell/WebView oeffnen und pruefen:
  - Touchlog zeigt Android-WebView-Kontext.
  - Toggle ist blockiert.
  - WebView wird nicht als gesunder Push-Master dargestellt.

S5.7 Desktop-Smoke:

- Realbefund User 28.04.2026:
  - Windows-PWA/Desktop hat den BP-Offen-Push angezeigt.
- Codex-lokal:
  - echter Diagnose-Push wurde erfolgreich an aktive Subscriptions gesendet.

Offen fuer User:

- Nach Frontend-Deploy/Commit Desktop-PWA/Browser Touchlog pruefen:
  - Kontext/Hash/Diagnosefelder erscheinen plausibel.
  - Remote-Health-Anzeige bleibt getrennt von Diagnose-Health.

S5.8 Lokale Suppression Smoke:

- Statischer Review:
  - `profile.isRemoteSubscriptionHealthy(row)` nutzt nur `disabled`, `last_remote_success_at`, `last_remote_failure_at` und `consecutive_remote_failures`.
  - `last_diagnostic_*` wird nicht fuer `remoteHealthy` genutzt.
  - `localSuppressionAllowed` bleibt exakt an `remoteHealthy` gebunden.
  - `AppModules.push.shouldSuppressLocalPushes()` delegiert nur an den bestehenden Health-Vertrag und liefert ohne Profile konservativ `false`.
  - `incidents/index.js` nutzt bevorzugt `AppModules.push`, aber aendert die Suppression-Fachlogik nicht.

Ergebnis:

- Diagnose-Push kann lokale medizinische Suppression nicht freischalten.

S5.9 Code Review:

- Keine offenen Code-Findings.
- Bewusster Restpunkt:
  - Subscription-Kontextdaten werden erst nach neuem Frontend-Upsert vollstaendig aussagekraeftig.
  - Das ist ein erwartetes Migrationsverhalten, kein Blocker.

S5.10 Contract Review gegen S2/S3:

- PWA/Browser bleibt Reminder-Push-Master.
- Android-WebView bleibt Widget-/Sync-/Auth-Surface.
- Kein Permission-Bypass.
- Kein Push-Spam.
- Kein neuer Scheduler fuer Diagnose-Push.
- Keine Aenderung an Medication-/BP-Fachlogik.
- Diagnose-Push ist getrennt von medizinischer Dedupe und Remote-Health.
- Keine sensiblen Rohdaten in UI/Diagnose-Response.
- Service Worker wurde nicht unnoetig geaendert.

S5.11 Korrektur der Findings:

- Keine neuen Code-Findings aus S5.
- Keine Korrektur erforderlich.

S5.12 Schritt-Abnahme:

- Codex-lokaler S5-Anteil ist abgeschlossen.
- S5 bleibt `IN_PROGRESS`, weil die neuen Touchlog-/WebView-UI-Pfade erst nach Frontend-Deploy/Commit real auf den User-Geraeten bestaetigt werden koennen.
- Commit-Empfehlung bleibt: erst nach den offenen User-Device-Checks oder bewusst mit klar dokumentiertem Restpunkt committen.

## S6 - Doku-Sync, QA-Update und Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren.
- Roadmap abschliessen.
- Spaetere Chats muessen den Push-/Android-Vertrag ohne Reverse Engineering verstehen.

Substeps:

- S6.1 `Push Module Overview` aktualisieren:
  - PWA/Browser als Push-Master
  - Test-Push-Vertrag
  - Subscription-Diagnose
  - Android-WebView-Abgrenzung
  - Health-/Suppression-Vertrag fuer Test-Push
- S6.2 `Touchlog Module Overview` aktualisieren:
  - Push-Kontextdiagnose
  - WebView-Hinweis
  - sichere Diagnosedaten
- S6.3 `Profile Module Overview` aktualisieren:
  - falls Push-Service extrahiert wurde
  - sonst Altlast explizit korrekt beschreiben
- S6.4 `Android Widget Module Overview` aktualisieren:
  - Widget bleibt kein Reminder-System
  - WebView bleibt kein Push-Master
  - PWA ist Push-Kanal
- S6.5 `Android Native Auth Module Overview` aktualisieren:
  - Android-WebView bleibt Auth-/Session-Mirror
  - keine Push-Verantwortung
- S6.6 `android/README.md` und `android/docs/Widget Contract.md` aktualisieren, falls betroffen.
- S6.7 `docs/QA_CHECKS.md` aktualisieren:
  - Chrome/PWA Test-Push
  - Android-WebView Negativtest
  - Desktop-Smoke
  - natuerlicher Reminder als optionaler E2E-Check
- S6.8 User-Facing Copy Review final dokumentieren.
- S6.9 Finaler Contract Review:
  - PWA Master
  - Android Node
  - kein Push-Spam
  - keine medizinische Fachlogik veraendert
  - keine sensiblen Rohdaten
  - kein Permission-Bypass
  - keine falsche lokale Suppression durch Diagnose-Push
- S6.10 Roadmap final markieren und Archiv-Entscheidung.
- S6.11 Commit-Empfehlung.

Output:

- Aktualisierte Source-of-Truth-Dokus.
- QA-Checkliste.
- Finaler Review.
- Archivierte Roadmap, falls abgeschlossen.

Exit-Kriterium:

- Push-Robustheit, Android-WebView-Grenze und Testbarkeit sind dokumentiert, umgesetzt und reviewt.

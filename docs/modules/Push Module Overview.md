# Push Module - Functional Overview

Kurze Einordnung:

- Zweck: gestaffelte Medication-Reminder plus spaetere Incidents und ein klarer BP-Incident-Pfad.
- Rolle innerhalb von MIDAS: ruhiges Sicherheitsnetz fuer offene Medication-Slots und fehlenden Abend-Blutdruck.
- Abgrenzung: keine Reminder-Ketten, keine Termine, keine Lifestyle-Motivation.

Status-Hinweis:

- Repo-lokal ist der neue Severity-Vertrag aktiv:
  - `reminder`
  - `incident`
- Lokal und extern sprechen denselben Typ-/Severity-/Tag-Vertrag.
- Off-App-Push laeuft ueber GitHub Actions plus Edge Function im versionierten Backend-Source.
- Deployed Stand: `midas-incident-push` Version 17.
- Browser/PWA ist der Reminder-Push-Master.
- Android-WebView/Shell ist Widget-/Sync-/Auth-Surface und kein verlaesslicher Reminder-Push-Kanal.
- Technische Diagnose-Pushes laufen getrennt von Medication-/BP-Dedupe und schalten keine lokale Suppression frei.
- Letzter Runtime-Nachweis: aktueller und historischer Remote-Dry-Run,
  historischer Non-Dry-Run-Guard, produktive Push-Hygiene-Provisionierung und
  kontrollierter Erst-Cleanup am 2026-07-17 erfolgreich.

Related docs:

- [Medication Module Overview](Medication Module Overview.md)
- [Intake Module Overview](Intake Module Overview.md)
- [Profile Module Overview](Profile Module Overview.md)
- [Touchlog Module Overview](Touchlog Module Overview.md)

---

## 1. Zielsetzung

- Medication soll nicht mehr direkt beim Abschnittsbeginn wie ein harter Vorfall wirken.
- Die erste Medication-Benachrichtigung ist eine spaete, freundliche Nachfrage.
- Wenn weiterhin offen, darf spaeter ein klarerer Incident folgen.
- BP darf weiter incident-orientierter bleiben.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/incidents/index.js` | lokale Incident-Engine, Medication-Schwellen, lokale Suppression |
| `app/modules/push/index.js` | Push-Service, Browser-Subscription, sichere Subscription-Metadaten und Remote-Health-Status |
| `service-worker.js` | Severity-Auswertung, Anzeige-Defaults, Click-Handling |
| `app/modules/profile/index.js` | Stammdaten und Profilkontext; keine Push-Service-API |
| `app/modules/touchlog/index.js` | sichtbare Push-Wartung im Touchlog |
| `app/diagnostics/devtools.js` | Thin Bootstrap fuer Touchlog-Initialisierung |
| `app/modules/intake-stack/medication/index.js` | Medication-Read-Model mit offenen `slots[]` und `slot_type` |
| `.github/workflows/incidents-push.yml` | gezielte UTC-Ticks fuer Off-App-Push rund um die produktiven Schwellen |
| `backend/supabase/functions/midas-incident-push/index.ts` | Remote-Push-Pfad, Dedupe, Delivery, Health-Updates |
| `backend/supabase/functions/midas-incident-push/request-contract.ts` | Reiner Request-Parser und Guard-Vertrag fuer Trigger, Modus, Dry-Run und Zeitoverride |
| `backend/supabase/functions/midas-incident-push/request-contract_test.ts` | Dauerhafte Deno-Regressionstests fuer den Request-Vertrag |
| `sql/15_Push_Subscriptions.sql` | `push_subscriptions` plus `push_notification_deliveries` |
| `sql/18_Push_Data_Hygiene.sql` | Interner 90-Tage-Cleanup, partieller Index und eigener Wochen-Cron |

---

## 3. Datenmodell / Storage

- Lokal:
  - In-Memory-Sendeflags pro Tag
  - Medication getrennt nach Abschnitt und Severity
- Remote:
  - `push_subscriptions` fuer Endpoint, Browser-Keys und Remote-Health
  - `push_subscriptions.endpoint_hash`, `client_context`, `client_display_mode`, `client_platform`, `client_browser`, `client_label` fuer sichere Diagnose-Zuordnung
  - `push_subscriptions.last_diagnostic_*` fuer technische Test-Push-Health
  - `push_notification_deliveries` fuer persistentes Remote-Dedupe pro `user/day/type/severity/source`

### 3.1 Produktiver Data-Hygiene-Vertrag

- `push_notification_deliveries` ist technische Dedupe-Historie und wird nach
  Wiener Kalendertag streng aelter als 90 Tage bereinigt. Der exakte
  90-Tage-Grenztag und Zukunftszeilen bleiben erhalten.
- Nur seit mehr als 90 Tagen unveraenderte `disabled = true`-Subscriptions
  werden geloescht. Aktive und juengst deaktivierte oder reaktivierte
  Subscriptions bleiben erhalten.
- Der interne `SECURITY INVOKER`-Cleanup besitzt kein Execute fuer `PUBLIC`,
  `anon`, `authenticated` oder `service_role` und verlangt Owner `postgres`.
- Genau ein Job `midas-push-hygiene-weekly` laeuft sonntags um `03:45 UTC`.
  Advisory Lock und vollstaendige Jobidentitaetspruefung verhindern parallele
  oder vertragsfremde Cleanup-Laeufe.
- Nur abgeschlossene eigene Cron-Run-Details werden nach 90 Tagen bereinigt.
  Medication-Retention ist ein getrennter Job und bleibt unveraendert.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung

- Incident-Engine startet beim App-Load.
- Tageswechsel resettet lokale Sendeflags.
- Lokaler Intervall-Check laeuft minuetlich.
- `AppModules.push` synchronisiert Browser-Push und den letzten bekannten Remote-Health-Stand.
- `AppModules.push` ergaenzt den Client-Kontext und ist die API-Grenze fuer Push-Konsumenten.
- Das Profil-Modul ist kein Backend fuer Subscription-Upsert oder Remote-Health.
- Sichtbare Bedienung und Health-Anzeige liegen im Touchlog.

### 4.2 Trigger

- `medication:changed`
- `bp:changed`
- `visibilitychange`
- lokaler Minutentick
- externer GitHub-Action-Tick zu gezielten UTC-Zeitpunkten rund um die produktiven Schwellen

### 4.3 Verarbeitung lokal

- Medication prueft offene Slots je `morning/noon/evening/night`.
- Final beschlossene Medication-Schwellen:
  - `morning`: Reminder `10:00`, Incident `12:00`
  - `noon`: Reminder `14:00`, Incident `16:00`
  - `evening`: Reminder `20:00`, Incident `22:00`
  - `night`: Reminder `22:30`, Incident `23:30`
- Reminder-Copy:
  - `... noch nicht erfasst?`
  - `Falls noch offen: bitte kurz bestaetigen.`
- Incident-Copy:
  - `... weiterhin offen`
  - `Bitte jetzt pruefen und bestaetigen.`
- BP bleibt ein klarer Abend-Incident ab `20:00`, wenn Morgen-BP vorhanden und Abend-BP noch offen ist.

### 4.4 Verarbeitung remote

- GitHub Actions ist nur Taktgeber.
- Der Workflow laeuft nicht mehr als 30-Minuten-Dauerlauf, sondern gezielt rund um die relevanten Medication-/BP-Schwellen.
- Die Cron-Zeiten sind in UTC gesetzt und decken CET/CEST fuer `Europe/Vienna` ab.
- Die Edge Function entscheidet in `Europe/Vienna`, was aktuell faellig ist.
- Manuelle Workflow-Runs koennen `mode=diagnostic` senden.
- `mode=diagnostic` sendet einen technischen Test-Push, schreibt nur `last_diagnostic_*` und beruehrt keine fachliche Dedupe-Tabelle.
- Ein explizites Request-Feld `now` ist nur zusammen mit `dry_run = true`
  erlaubt. Der Guard laeuft vor User-Aufloesung, fachlichen Reads, Push-Send
  und Datenbank-Writes; Scheduler-Payloads ohne `now` bleiben unveraendert.
- Medication liest slot-/abschnittsbasiert:
  - `health_medications`
  - `health_medication_schedule_slots`
  - `health_medication_slot_events`
- Catch-up sendet pro Typ und Tag immer nur die hoechste aktuell faellige Severity.
- Remote-Dedupe verhindert im normalen sequenziellen Pfad wiederholte
  Zustellung fuer denselben Fachfall. Zwischen erfolgreichem Send und
  anschliessendem Delivery-Upsert bleibt bei parallelen Edge-Aufrufen ein
  Duplikatfenster; es besteht keine exakt-einmalige Zustellgarantie.
- Remote-Response macht Partial Delivery sichtbar:
  - `acceptedSubscriptions` fuer technisch angenommene Web-Push-Subscriptions.
  - `failedSubscriptions` fuer fehlgeschlagene Subscriptions mit redigiertem Fehler.
  - sichere Subscription-Metadaten ohne Roh-Endpoint oder Keys.
- `deliveredSubscriptions` bleibt Count aus Kompatibilitaetsgruenden und ist kein Beweis fuer sichtbare Zielgeraet-Zustellung.

### 4.5 Lokale-vs.-Remote-Suppression

- Lokal wird nicht blind abgeschaltet.
- Lokale Notification-Suppression ist nur erlaubt, wenn:
  - eine aktive Browser-Subscription existiert
  - dieselbe Subscription im Backend bekannt ist
  - fuer diese Subscription bereits ein erfolgreicher Remote-Push belegt ist
  - kein spaeterer Failure-Stand darauf liegt
  - `consecutive_remote_failures = 0` gilt
  - der echte Remote-Erfolg maximal 7 Tage alt ist
  - der echte Remote-Erfolg nicht mehr als 5 Minuten in der Zukunft liegt
- `last_diagnostic_success_at` reicht dafuer nicht aus.
- Diagnose-Pushes duerfen lokale medizinische Fallbacks nicht unterdruecken.
- Ohne diesen Nachweis bleibt lokal der Fallback aktiv.
- Remote-Health bedeutet Transport-/Subscription-Health, nicht garantierte sichtbare Handy-Notification.

---

## 5. Push-Transport

- Lokal:
  - `showNotification(...)` ueber Service Worker Registration
  - Fallback `Notification API`
- Remote:
  - Web Push ueber Edge Function und GitHub Actions Takt
- Tags:
  - `midas-reminder-<type>-<dayIso>`
  - `midas-incident-<type>-<dayIso>`
- Payload:
  - `data.type`
  - `data.severity`
  - `data.dayIso`
  - `data.source`
- Diagnose-Payload:
  - `data.type=diagnostic_push`
  - `data.source=diagnostic`
  - kein Medication-/BP-Event
  - kein Eintrag in `push_notification_deliveries`

---

## 6. UI-Integration

- Touchlog:
  - einzige sichtbare Push-Wartungs- und Bedienoberflaeche
  - Push aktivieren/deaktivieren
  - Statusanzeige fuer Kontext, Geraet, Browser-Berechtigung, Browser-Abo, Remote-Status, Diagnose-Status, letzte Zeitpunkte und Pruefzeit
  - zeigt nur sichere Diagnosewerte wie gekuerzten Endpoint-Hash, keine Roh-Endpunkte oder Keys
  - Diagnose unterscheidet Browser-Abo, erste faellige Erinnerung, Remote-Erfolg und Zustellproblem
  - Android-WebView wird als nicht empfohlener Reminder-Push-Kontext markiert; Chrome/PWA bleibt Empfehlung
- Profil:
  - keine sichtbare Push-Section
  - keine Push-Buttons
  - kein Push-Kurzstatus und keine Push-Health-Details
- Opt-in bleibt explizit per User-Intent.

---

## 7. Fehler- & Diagnoseverhalten

- Lokaler Push-Fehlschlag bleibt lokal und erzeugt keinen harten User-Error.
- Ohne verifizierten Remote-Health-Stand bleibt lokal der Fallback aktiv.
- `bereit (wartet auf erste Erinnerung)` ist kein Fehlerzustand:
  - Browser-Abo und Backend-Subscription sind vorhanden.
  - Es gab noch keinen faelligen Remote-Push und deshalb noch keine echte Zustellbestaetigung.
  - Lokale Suppression bleibt trotzdem aus, bis ein echter Remote-Erfolg belegt ist.
- `Health-Check offen` kann bei mehreren oder alten Subscriptions trotz funktionierendem Transport sichtbar bleiben.
  - Das ist ein Maintenance-/Mapping-Hinweis, kein automatischer Transportfehler.
  - Der reale Transport wird durch Systemnotification, Edge-Function-Result und Remote-Health-Felder bewertet.
- `Zustellung noch nicht gesund` ist der Warnzustand fuer echten Failure, Failure-Counter oder deaktivierte Remote-Subscription.
- Service Worker behaelt Legacy-Fallbacks fuer alte Payloads ohne `data.severity`.
- Scheduler-Jitter bleibt ein bewusster Tradeoff; die gezielte Kadenz reduziert unnoetige Action-Runs, ohne die fachliche Entscheidung aus der Edge Function zu verschieben.
- Workflow-HTTP-Fehler schlagen durch `curl --fail-with-body` sichtbar fehl.
- Die Edge-Function-Response enthaelt Run-Kontext, lokale Bewertungszeit, `results`, `skipped`-Gruende und ausgelieferte bzw. fehlgeschlagene Events.
- Erfolgreich oder teilweise erfolgreich gesendete Incident-/Reminder-Events enthalten sichere `acceptedSubscriptions`- und `failedSubscriptions`-Listen.
- Vollstaendig fehlgeschlagene Events werden in der top-level `failed`-Liste mit sicherer Subscription-Zusammenfassung dokumentiert.
- Response-Diagnose darf Endpoint-Hash, Client-Kontext, Plattform, Browser und Label enthalten, aber keine Roh-Endpunkte, `p256dh`-Keys oder `auth`-Keys.

---

## 8. Events & Integration Points

- Input-Events:
  - `medication:changed`
  - `bp:changed`
  - `visibilitychange`
- Medication-Read-Model basiert auf offenen `slots[]` und `slot_type`.
- `AppModules.push` exportiert den Push-Routing-Stand fuer die Incident-Engine und den Touchlog.
- Neue Push-Konsumenten verwenden `AppModules.push`.
- `AppModules.profile` ist kein Push-Backend und kein Fallback-Pfad mehr.
- Output:
  - lokale Reminder-/Incident-Notification
  - externer Off-App-Push

---

## 9. Erweiterungspunkte / Zukunft

- Nutzerindividuelle Reminder-Zeitfenster.
- Snooze oder bewusste Follow-up-Stufe.
- zusaetzliche Delivery-/Health-Diagnostik im Touchlog.
- ruhigere Touchlog-Push-UX, z. B. kompakte Push-Pill plus Detailzeilen im Touchlog.
- weitere Push-Service-Erweiterungen bleiben in `AppModules.push`; Profile bleibt push-frei.
- Per-Device-ACK, native Android Reminder oder ein eigener BP-Reminder-Kanal bleiben separate Architektur-Roadmaps, falls Web Push nach dem aktuellen Hardening weiter unzuverlaessig bleibt.

### Future Hook: Native Medication Reminder Reliability

Status:

- dokumentierte Zukunftsoption, kein produktiver Contract.
- nicht Teil der aktuellen Push-/Datenhygiene-Roadmap.
- keine versteckte Zusage für AlarmManager, Exact Alarm, FCM oder einen
  Angehörigenzugriff.

Langfristiges Nutzungsziel:

- Eine fällige Medikamenteneinnahme bleibt lokal sichtbar und wird auf dem
  Android-Gerät verlässlich erinnert, bis sie bestätigt oder bewusst als
  ausgelassen behandelt wurde.
- Das Widget zeigt weiterhin unmittelbar, ob ein Medication-Abschnitt offen
  oder erledigt ist.
- Ein Angehöriger soll bei Bedarf am Gerät einen klaren offenen Status
  erkennen können, ohne dafür Datenbank-, GitHub- oder Supabase-Wartung zu
  verstehen.
- Blutdruck bleibt für diesen Zukunftspfad zunächst zweitrangig. Der belastbare
  Medication-Reminder ist der eigentliche Sicherheitsnutzen.

Warum dieser Future Hook existiert:

- GitHub Actions plus Web Push bleiben ein Best-Effort-Fangnetz.
- Eine Zustellung hängt gleichzeitig von Scheduler, Netzwerk, Push-Dienst,
  Browser/PWA und Android-Energiesparregeln ab.
- Die bestehende Android-Shell kann langfristig eine eng begrenzte native
  Reliability-Schicht tragen, ohne MIDAS vollständig als native App neu zu
  bauen.
- PWA und Supabase bleiben Hauptsystem; Android übernimmt nur Fähigkeiten, die
  lokal zuverlässiger als Web Push erbracht werden können.

Mögliche spätere Architektur, noch nicht entschieden:

- lokaler Android-Reminder auf Basis des synchronisierten Medication-Plans.
- persistente Notification in einem eigenen Medication-Kanal.
- Wiederherstellung geplanter Reminder nach Geräte-Neustart.
- Offline-Verhalten ohne GitHub, Supabase-Request oder geöffnetes MIDAS.
- Dedupe zwischen lokalem Android-Reminder, bestehendem Web Push und Widget.
- klarer Übergang von `offen` zu `erledigt`, `bewusst ausgelassen` oder
  `Status nicht verfügbar`.
- optionaler Angehörigenmodus erst nach eigenem Privacy-, Auth- und
  Berechtigungsvertrag.

Vor einer Roadmap zwingend zu klären:

- Welche Android-API passt zum tatsächlichen Zeit- und Zuverlässigkeitsbedarf:
  WorkManager, AlarmManager oder ein bewusst genehmigter Exact-Alarm-Pfad?
- Wie gelangen Planänderungen sicher und rechtzeitig in die native Schicht?
- Was passiert offline, nach Reboot, nach Zeitzonenwechsel oder bei geänderter
  Systemzeit?
- Wie werden verspätete, verpasste und bewusst ausgelassene Einnahmen
  unterschieden?
- Wie verhindert MIDAS Doppelalarme zwischen PWA, GitHub Push und Android?
- Wie werden Gerätewechsel und alte lokale Schedules ohne Datenbankfrickelei
  bereinigt?
- Welche Notification- und Exact-Alarm-Berechtigungen verlangt die dann
  aktuelle Android-Version?
- Darf ein Angehöriger nur den lokalen offenen Status sehen oder benötigt er
  einen echten, separat abgesicherten Account-/Freigabepfad?

Startkriterium für ein eigenes Teilprojekt:

- Web Push versagt im realen Alltag wiederholt als Backup, oder
- Alter, Therapiekomplexität beziehungsweise mehrere tägliche Slots machen
  eine lokal garantiertere Medication-Erinnerung fachlich relevant.

Bis dahin gilt:

- Routine und Widget sind der primäre Alltagspfad.
- lokaler PWA-Check und Web Push bleiben zusätzliche Fangnetze.
- Die aktuelle Android-Shell erhält keine Alarm-Fachlogik nebenbei.

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Feature-Flags.
- Notification-Vertrag ist aktuell fest im Modulvertrag verdrahtet.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard):
  - Service Worker / PWA
  - Medication- und BP-Events
  - `push_subscriptions`
  - `push_notification_deliveries`
  - Edge Function und GitHub Actions
- Dependencies (soft):
  - Browser Notification Permission
- Known risks:
  - Schedule-Jitter
  - bei Aenderungen an Medication-/BP-Schwellen muss die GitHub-Action-Kadenz mitgeprueft werden
  - fehlende erste Remote-Erfolgsbestaetigung haelt lokale Push-Suppression aus
  - Remote-Erfolge aelter als 7 Tage unterdruecken lokale Fallbacks nicht mehr
  - mehrere/alte Subscriptions koennen die Touchlog-Health-Anzeige temporaer nervoes wirken lassen, obwohl Push transportseitig funktioniert
  - technisch akzeptierter Web Push beweist keine sichtbare Zielgeraet-Zustellung
  - Delivery-Dedupe garantiert bei parallelen Edge-Aufrufen keine exakt-
    einmalige Zustellung; das bleibt ein separates Reliability-Thema
  - Remote-Deployment-Drift zwischen Repo und Backend-Workspace

---

## 12. Remote Push Setup-Notiz

- Edge Function `midas-incident-push` muss deployed sein.
- `sql/15_Push_Subscriptions.sql` muss produktiv eingespielt sein.
- `sql/18_Push_Data_Hygiene.sql` wird separat und nur nach Owner-Freigabe
  provisioniert. Es darf nicht Teil eines automatischen App-Bootstraps sein.
- Workflow [`.github/workflows/incidents-push.yml`](../../.github/workflows/incidents-push.yml) muss auf dem GitHub-Default-Branch liegen.
- Der Workflow nutzt gezielte UTC-Ticks statt `*/30`:
  - `17,37 8,9,10,11,12,13,14,15,18,19,20,21,22 * * *`
- Regulaer sind das 26 geplante Runs pro Tag statt vorher 48 Runs pro Tag.
- Die zwei versetzten Ticks pro relevanter UTC-Stunde federn Scheduler-Jitter ab; die Edge Function entscheidet weiterhin fachlich in `Europe/Vienna`.
- Manuelle `workflow_dispatch`-Runs bleiben zusaetzlich fuer Diagnose moeglich:
  - `mode=incidents`
  - `mode=diagnostic`
  - `all`
  - `med`
  - `bp`
- Scheduler-Calls senden standardmaessig `window=all`.
- GitHub-Secrets fuer den Workflow muessen vorhanden sein:
  - `INCIDENTS_PUSH_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Supabase Function Secrets / Runtime-Env muessen vorhanden sein:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `INCIDENTS_USER_ID`, sofern der Scheduler-Request keine explizite `user_id` sendet
- `VAPID_SUBJECT` ist optional und nutzt sonst den Function-Default.

---

## 13. QA-Checkliste

- Offene Medication-Slots erzeugen vor der Reminder-Schwelle keinen Push.
- Jeder offene Medication-Abschnitt erzeugt zuerst genau einen `reminder`.
- Ein `incident` folgt nur spaeter und nur wenn derselbe Abschnitt weiter offen ist.
- Reminder und Incident nutzen getrennte Tags und unterscheiden sich sichtbar in der Praesentation.
- Lokale Suppression greift nur bei nachweislich gesundem Remote-Pfad.
- Off-App-Push funktioniert auch ohne geoeffnete App.
- Manueller Workflow-Smoke mit `window=all` liefert `ok=true` und bei nicht faelligen Ereignissen `status=no-incidents` plus Skip-Gruende.
- Manueller technischer Smoke mit `mode=diagnostic` liefert `status=diagnostic-sent` ohne `push_notification_deliveries` zu beschreiben.
- Explizites `now` ohne `dry_run = true` wird mit HTTP `400` vor jeder
  Nebenwirkung abgelehnt; historischer Dry-Run bleibt moeglich.
- Android Chrome/PWA zeigt Systemnotification fuer Diagnose- oder fachlichen Push.
- Android-WebView/Shell wird nicht als gesunder Reminder-Push-Master dargestellt.
- `bereit (wartet auf erste Erinnerung)` darf nicht als Fehler angezeigt werden, wenn noch kein echter Remote-Push faellig war.
- `Health-Check offen` darf bei funktionierendem Transport als ruhiger Maintenance-Hinweis behandelt werden, wenn mehrere/alte Subscriptions im Spiel sind.
- Echter Zustellfehler muss als `Zustellung noch nicht gesund` sichtbar werden.
- Lokale Suppression greift nur, wenn die aktuelle Subscription einen echten Remote-Erfolg innerhalb von 7 Tagen, keinen spaeteren Failure und `consecutive_remote_failures = 0` hat.
- Diagnose-Erfolge schalten lokale Suppression nicht frei.
- Remote-Responses zeigen `acceptedSubscriptions`/`failedSubscriptions` mit sicheren Metadaten, aber keine Roh-Endpunkte oder Keys.
- Scheduler-Vertrag ist 26 regulaere Runs pro Tag plus manuelle `workflow_dispatch`-Smokes.
- Produktiver Scheduler braucht `INCIDENTS_USER_ID` als Function Secret oder eine explizite `user_id` im Request.
- Touchlog zeigt Push-Wartung; Profil bleibt sichtbar push-frei.
- BP bleibt konsistent incident-orientiert.
- Push-Hygiene-Job, Owner, ACL, Schedule und Command entsprechen dem
  produktiven Vertrag; alte Deliveries und alte deaktivierte Subscriptions
  werden bereinigt, aktive Subscriptions bleiben erhalten.

---

## 14. Definition of Done

- Medication fuehlt sich spaeter und sanfter an als der alte `06/11/17/21`-Pfad.
- Lokal und remote sprechen denselben Severity-Vertrag.
- Service Worker behandelt Reminder und Incident technisch unterschiedlich.
- Die Rollenverteilung lokal vs. remote reduziert Doppelpushes und laesst
  bekannte Ausfaelle sichtbar; exakt-einmalige Zustellung ist kein Vertrag.
- Desktop und Android haben den Diagnose-Push sichtbar erhalten.
- Dokumentation und QA entsprechen dem produktiven Vertrag.

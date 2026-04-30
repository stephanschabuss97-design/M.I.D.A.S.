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
- Off-App-Push laeuft ueber GitHub Actions plus Edge Function im Backend-Workspace.
- Browser/PWA ist der Reminder-Push-Master.
- Android-WebView/Shell ist Widget-/Sync-/Auth-Surface und kein verlaesslicher Reminder-Push-Kanal.
- Technische Diagnose-Pushes laufen getrennt von Medication-/BP-Dedupe und schalten keine lokale Suppression frei.

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
| `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts` | externer Remote-Push-Pfad, Dedupe, Delivery, Health-Updates |
| `sql/15_Push_Subscriptions.sql` | `push_subscriptions` plus `push_notification_deliveries` |

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
- Medication liest slot-/abschnittsbasiert:
  - `health_medications`
  - `health_medication_schedule_slots`
  - `health_medication_slot_events`
- Catch-up sendet pro Typ und Tag immer nur die hoechste aktuell faellige Severity.
- Remote-Dedupe verhindert Doppelzustellung fuer denselben Fachfall.

### 4.5 Lokale-vs.-Remote-Suppression
- Lokal wird nicht blind abgeschaltet.
- Lokale Notification-Suppression ist nur erlaubt, wenn:
  - eine aktive Browser-Subscription existiert
  - dieselbe Subscription im Backend bekannt ist
  - fuer diese Subscription bereits ein erfolgreicher Remote-Push belegt ist
  - kein spaeterer Failure-Stand darauf liegt
- `last_diagnostic_success_at` reicht dafuer nicht aus.
- Diagnose-Pushes duerfen lokale medizinische Fallbacks nicht unterdruecken.
- Ohne diesen Nachweis bleibt lokal der Fallback aktiv.

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
  - mehrere/alte Subscriptions koennen die Touchlog-Health-Anzeige temporaer nervoes wirken lassen, obwohl Push transportseitig funktioniert
  - Remote-Deployment-Drift zwischen Repo und Backend-Workspace

---

## 12. Remote Push Setup-Notiz

- Edge Function `midas-incident-push` muss deployed sein.
- `sql/15_Push_Subscriptions.sql` muss produktiv eingespielt sein.
- Workflow [`.github/workflows/incidents-push.yml`](../../.github/workflows/incidents-push.yml) muss auf dem GitHub-Default-Branch liegen.
- Der Workflow nutzt gezielte UTC-Ticks statt `*/30`:
  - Hauptfenster `5 8,9,10,11,12,13,14,15,18,19,20,21 * * *`
  - Nachtfenster `35 20,21,22 * * *`
  - Nacht-Backup `50 21,22 * * *`
- Regulaer sind das 17 geplante Runs pro Tag statt vorher 48 Runs pro Tag.
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
- Android Chrome/PWA zeigt Systemnotification fuer Diagnose- oder fachlichen Push.
- Android-WebView/Shell wird nicht als gesunder Reminder-Push-Master dargestellt.
- `bereit (wartet auf erste Erinnerung)` darf nicht als Fehler angezeigt werden, wenn noch kein echter Remote-Push faellig war.
- `Health-Check offen` darf bei funktionierendem Transport als ruhiger Maintenance-Hinweis behandelt werden, wenn mehrere/alte Subscriptions im Spiel sind.
- Echter Zustellfehler muss als `Zustellung noch nicht gesund` sichtbar werden.
- Touchlog zeigt Push-Wartung; Profil bleibt sichtbar push-frei.
- BP bleibt konsistent incident-orientiert.

---

## 14. Definition of Done

- Medication fuehlt sich spaeter und sanfter an als der alte `06/11/17/21`-Pfad.
- Lokal und remote sprechen denselben Severity-Vertrag.
- Service Worker behandelt Reminder und Incident technisch unterschiedlich.
- Die Rollenverteilung lokal vs. remote erzeugt weder Doppelpushes noch stille Ausfaelle.
- Dokumentation und QA entsprechen dem produktiven Vertrag.

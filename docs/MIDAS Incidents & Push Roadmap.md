# MIDAS Incidents & Push Roadmap

Ziel
- Push nur bei echten Incidents (Sicherheitsnetz).
- Maximal eine Push pro Incident, keine Eskalation.
- Push verschwindet nach Erfuellung.

Hinweis
- Texte hier sind absichtlich mit ae/oe/ue, du korrigierst spaeter manuell.

Status
- Step 1: done
- Step 2: done
- Step 3: done
- Step 4: done
- Step 5: pending

Start hier (fuer neue Sessions)
1) Oeffne:
   - `docs/MIDAS Incidents & Push Roadmap.md`
   - `app/modules/intake-stack/intake/index.js`
   - `app/modules/vitals-stack/vitals/bp.js`
   - `app/core/pwa.js`
   - `service-worker.js`
2) Zielbild: Push nur bei echten Incidents (einmalig, keine Eskalation).
3) Wenn der Status-Block oben "pending" zeigt, starte mit Step 1.

Scope
- Priority 1: Medikation am Morgen (z. B. 10:00).
- Priority 2: Abend-BP wenn morgens gemessen wurde.
- Termine sind kein Incident (Ticker-only).

Nicht im Scope
- Lifestyle-Reminder.
- Mehrfach-Push oder Eskalationsketten.
- Gamification/Motivation.

Relevante Dateien (Referenz)
- `app/modules/intake-stack/intake/index.js` (Medikation bestaetigt/undo)
- `app/modules/vitals-stack/vitals/bp.js` (BP Morgen/Abend State)
- `app/modules/appointments/index.js` (Termine, kein Incident)
- `app/modules/hub/index.js` (globale Event-Hooks/Refresh)
- `app/core/pwa.js` (Push-Handling/Subscription)
- `service-worker.js` (Push Empfang/Display)
- `docs/MIDAS Ticker Bar Roadmap.md` (Ticker zuerst)
- `docs/modules/Push Module Overview.md` (Push/Incidents Moduluebersicht)

Deterministische Steps

Step 1: Incident-Definition fixieren
1.1 Konkrete Soll-Zeiten je Incident festlegen.
1.2 Regeln fuer Aktivierung/Deaktivierung definieren.
Output: klare Incident-Definitionen.
Exit-Kriterium: Incidents sind eindeutig.

Step 1 Output (Draft)
Incident A: Medikation am Morgen
- Erwartung: Einnahme um ca. 07:00.
- Push-Zeit: einmalig um 10:00, falls bis dahin nicht bestaetigt.
- Verhalten: keine weitere Erinnerung, keine Eskalation.
- Ziel: sanfter Schutz, ohne zu nerven (auch im hoeheren Alter).

Incident B: Abend-BP (nur wenn Morgen-BP vorhanden)
- Voraussetzung: Morgen-BP wurde erfasst.
- Push-Zeit: einmalig am Abend (z. B. 20:00 oder 21:00), falls Abend-BP fehlt.
- Verhalten: kein zweiter Push, keine Eskalation.
- Ziel: saubere Morgen/Abend-Paare, ohne Druck.

Zeitlogik
- Push-Entscheidung nach lokaler Zeit (nicht UTC), damit 10:00/20:00 wirklich lokal gilt.

Step 2: Entscheidungslogik
2.1 Event-Quellen bestimmen (Intake, BP, Termine).
2.2 Bedingungen fuer "Incident active" definieren.
2.3 Bedingungen fuer "Push senden" definieren.
Output: Decision Table.
Exit-Kriterium: Push-Regeln sind eindeutig.

Step 2 Output (Draft) - Decision Table

Datenquellen / Events
- Medikation: Intake/Medication State (Einnahme bestaetigt/undo).
- BP: Morgen/Abend Messung gespeichert.
- Termine: kein Incident (nur Ticker).
- Events (lokal): `medication:changed`, BP-Save-Flow (BP-Event oder Save-Callback), optional `appointments:changed` nur fuer Ausschluss.

Incident A: Medikation Morgen
- Active, wenn: lokale Zeit >= 10:00 UND Medikation fuer heute nicht bestaetigt.
- Deaktiviert, wenn: Medikation bestaetigt ODER Tag wechselt.
- Push senden, wenn: Active wird true UND heute noch kein Push fuer diesen Incident.

Incident B: Abend-BP
- Active, wenn: Morgen-BP vorhanden UND Abend-BP fehlt UND lokale Zeit >= Abend-Sollzeit (20:00/21:00).
- Deaktiviert, wenn: Abend-BP gespeichert ODER Tag wechselt.
- Push senden, wenn: Active wird true UND heute noch kein Push fuer diesen Incident.

Globale Regeln
- Maximal 1 Push pro Incident pro Tag.
- Keine Eskalation, kein Reminder-Loop.
- Lokale Zeit als Referenz (nicht UTC).

Step 3: Architektur-Integration
3.1 Trennung zwischen Incident-Logik und UI/Transport.
3.2 Hook fuer Push-Delivery definieren (local, spaeter serverseitig).
Output: saubere Integration Points.
Exit-Kriterium: keine UI-Abhaengigkeit in der Logik.

Step 3 Output (Draft)
Architektur-Ziel
- Incident-Logik ist ein reiner State-Calculator (keine UI/Push Abhaengigkeit).
- Push-Transport ist austauschbar (local jetzt, server spaeter).

Integration Points (lokal)
- Incident State Engine: eigenes Modul (z. B. `app/modules/incidents/index.js`), nur Berechnung.
- Event Listener: intake/medication + BP Save Events triggern Recalc.
- Push Adapter: `app/core/pwa.js` oder eigenes `app/core/push.js`, das nur "send once" erledigt.
- Service Worker: `service-worker.js` zeigt Push an (spaeter).

Data Flow (lokal)
1) Event (medication:changed / BP-save) -> Incident Engine recalculates state.
2) Engine meldet "incident active" + "should push".
3) Push Adapter sendet Notification (einmalig), markiert als sent (in-memory).
4) On resolve (med confirmed / BP saved) -> incident cleared.

Trennung
- Incident Engine darf keine DOM-Abhaengigkeit haben.
- Push Adapter darf keine Business-Entscheidungen treffen.

Step 4: Implementierung
4.1 Incidents lokal berechnen (State + Zeit).
4.2 Push-Dispatch einmalig pro Incident.
4.3 Resets beim Erfuellen der Bedingung.
Output: funktionierende Push-Regeln.
Exit-Kriterium: keine Doppel-Pushes.

Step 4 Output (Draft)
Implementiert (lokal)
- Incident Engine: `app/modules/incidents/index.js`
- BP Event Hook: `bp:changed` Event im BP-Save-Flow
- Push Adapter: lokale Notifications via Service Worker Registration oder Notification API
- Sichtbarkeit: keine UI-Abhaengigkeit, nur Events + lokaler State

Verhalten (lokal)
- Medikation: einmaliger Push ab 10:00, falls offene Medikation vorhanden.
- Abend-BP: einmaliger Push ab 20:00, wenn Morgen-BP vorhanden und Abend fehlt.
- Reset: Tageswechsel resettet Push-Flags und BP-State.

Step 5: Remote Push (ohne geoeffnete App)
5.1 Push-Subscription Flow definieren (VAPID Keys, Permission, Opt-in).
5.2 Server-Trigger definieren (z. B. Supabase Edge Function + Cron/Queue).
5.3 Payload-Format fuer Incident A/B definieren (tag, body, silent).
5.4 Service Worker: `push` + `notificationclick` handling.
Output: Remote-Push-Architektur + Payload-Schema.
Exit-Kriterium: Push funktioniert bei geschlossener App.

Step 5.1 Output (Draft)
Push-Subscription Flow (Remote)
- User opt-in: Permission Request nur nach User-Intent (Button im Hub/Settings).
- VAPID Keys: Public Key im Client, Private Key nur auf Server/Edge.
- Subscription speichern: endpoint + keys (p256dh/auth) + user_id in Supabase.
- Re-Subscribe: wenn Browser/OS Subscription rotiert -> Update in DB.
- Opt-out: Delete Subscription in DB (User toggles Push off).
- Minimal UI: "Push aktivieren" / "Push deaktivieren" + Statusanzeige.

Step 5.2 Output (Draft)
Server-Trigger (GitHub Actions -> Edge Function)
- Neue Edge Function: z. B. `midas-incident-push`.
- GitHub Actions Workflow mit `schedule` (2x taeglich: 10:00 & 21:00 lokal).
- Workflow ruft per `curl` die Edge Function auf.
- Secrets: `INCIDENTS_PUSH_URL` (Edge Function URL) + `SUPABASE_SERVICE_ROLE_KEY`.
- DST-Handling: Entweder 2 Cron-Zeilen pro Zeitpunkt (Sommer/Winter) oder Edge Function filtert lokale Zeit.
Setup-Notiz (bereits erledigt)
- Edge Function `midas-incident-push` deployed.
- Supabase Edge Function Secrets gesetzt: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `INCIDENTS_USER_ID`, `INCIDENTS_TZ`.

Step 5.3 Output (Draft)
Payload-Format (Incident Push)
- Pflichtfelder: `title`, `body`, `tag`, `data`.
- `tag`: `midas-incident-<type>-<dayIso>` (verhindert Mehrfach-Push).
- `data`: `{ type, dayIso, source }` fuer Click-Handling.
- `silent`: true (ruhig), `renotify`: false.
- Typen: `medication_morning`, `bp_evening`.

Step 5.4 Output (Draft)
Service Worker Handling
- `self.addEventListener('push')`: parse payload, showNotification.
- `self.addEventListener('notificationclick')`: open/focus App (Hub), deep link mit `?incident=<type>&day=<dayIso>`.
- Fallback: wenn kein payload -> generische Notification.
- Sicherheit: nur eigene origin, keine externen URLs.

Step 6: QA
6.1 Medikation nicht bestaetigt bis 10:00 -> Push einmalig.
6.2 Abend-BP Flow: Ticker zuerst, Push spaeter falls offen.
6.3 Keine Push bei Terminen.
6.4 Remote Push kommt auch ohne geoeffnete App an.
6.5 Push-Click fuehrt zu App-Open und zeigt Incident-Context.
6.6 Local Push Voraussetzungen: Notification Permission granted + Service Worker aktiv.
6.7 Med-State geladen (Medication Cache) bevor 10:00 (oder Engine loaded ihn nach).
6.8 Tageswechsel resettiert Incident-Flags (keine Push-Reste vom Vortag).
Exit-Kriterium: Push nur bei echten Incidents.

Follow-up
- Nach Step 5: `docs/MIDAS Sensory Feedback Roadmap.md` beginnen.

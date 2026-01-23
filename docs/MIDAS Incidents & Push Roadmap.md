# MIDAS Incidents & Push Roadmap

Ziel
- Push nur bei echten Incidents (Sicherheitsnetz).
- Maximal eine Push pro Incident, keine Eskalation.
- Push verschwindet nach Erfuellung.

Hinweis
- Texte hier sind absichtlich mit ae/oe/ue, du korrigierst spaeter manuell.

Status
- Step 1: pending
- Step 2: pending
- Step 3: pending
- Step 4: pending
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

Deterministische Steps

Step 1: Incident-Definition fixieren
1.1 Konkrete Soll-Zeiten je Incident festlegen.
1.2 Regeln fuer Aktivierung/Deaktivierung definieren.
Output: klare Incident-Definitionen.
Exit-Kriterium: Incidents sind eindeutig.

Step 2: Entscheidungslogik
2.1 Event-Quellen bestimmen (Intake, BP, Termine).
2.2 Bedingungen fuer "Incident active" definieren.
2.3 Bedingungen fuer "Push senden" definieren.
Output: Decision Table.
Exit-Kriterium: Push-Regeln sind eindeutig.

Step 3: Architektur-Integration
3.1 Trennung zwischen Incident-Logik und UI/Transport.
3.2 Hook fuer Push-Delivery definieren (local, spaeter serverseitig).
Output: saubere Integration Points.
Exit-Kriterium: keine UI-Abhaengigkeit in der Logik.

Step 4: Implementierung
4.1 Incidents lokal berechnen (State + Zeit).
4.2 Push-Dispatch einmalig pro Incident.
4.3 Resets beim Erfuellen der Bedingung.
Output: funktionierende Push-Regeln.
Exit-Kriterium: keine Doppel-Pushes.

Step 5: QA
5.1 Medikation nicht bestaetigt bis 10:00 -> Push einmalig.
5.2 Abend-BP Flow: Ticker zuerst, Push spaeter falls offen.
5.3 Keine Push bei Terminen.
Exit-Kriterium: Push nur bei echten Incidents.

Follow-up
- Nach Step 5: `docs/MIDAS Sensory Feedback Roadmap.md` beginnen.

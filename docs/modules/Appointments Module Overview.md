# Assistant Appointments Module - Functional Overview

Kurze Einordnung:
- Zweck: Terminverwaltung im Hub + Butler-Kontext fuer Assistant.
- Rolle innerhalb von MIDAS: liefert Upcoming-Termine und syncen ins Assistant-Header.
- Abgrenzung: keine Reminder/Push-Logik (spaeter), keine Arzt-Ansicht.

Related docs:
- [Bootflow Overview](bootflow overview.md)

---

## 1. Zielsetzung

- Problem: Termine schnell erfassen und im Hub anzeigen.
- Nutzer: Patient (Panel) und Assistant (Kontext).
- Nicht Ziel: Reminder/Push oder Kalender-Integrationen.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/appointments/index.js` | UI, CRUD, Sync, Upcoming-Liste |
| `index.html` | Hub-Panel Markup (`#hubAppointmentsPanel`) |
| `app/styles/hub.css` | Styling fuer Terminpanel |
| `sql/09_Appointments_v2.sql` | Tabelle, Policies, View `v_appointments_v2_upcoming` |

---

## 3. Datenmodell / Storage

- Tabelle: `appointments_v2` (Supabase)
- Wichtige Felder: `id`, `user_id`, `title`, `start_at`, `location`, `notes`, `status`, `repeat_rule`.
- View: `v_appointments_v2_upcoming` (geplante Termine ab gestern).
- RLS: nur Zugriff auf eigene `user_id`.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- `init()` bindet Formular/Buttons und startet `syncAppointments({ reason: 'init' })`.
- Modul wartet auf `supabase:ready`.

### 4.2 User-Trigger
- Panel oeffnen -> `appointments.sync({ reason: 'panel-open' })`.
- Speichern/Loeschen/Toggle via Panel-Buttons.

### 4.3 Verarbeitung
- CRUD via Supabase Client (`appointments_v2`).
- `computeUpcomingFromState()` erstellt Butler-Listeneintraege.
- Upcoming-Items enthalten `start_at` fuer Assistant-Datum/Uhrzeit.
- Event `appointments:changed` nach jeder Mutation.

### 4.4 Persistenz
- Insert/Update/Delete in `appointments_v2`.
- Status-Updates (`scheduled`/`done`) via Update.

---

## 5. UI-Integration

- Hub-Panel `#hubAppointmentsPanel` mit Formular + Overview.
- Navigation zwischen Listen erfolgt ueber Tabs (Uebersicht/Erledigt/Neu).
- Assistant-Header zeigt max. zwei Upcoming-Termine.

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine direkte Arzt-Ansicht.

---

## 7. Fehler- & Diagnoseverhalten

- Fehler via `diag.add('[appointments] ...')`.
- Fehlende Supabase-Config -> Placeholder/Toast.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.appointments.sync`, `getUpcoming`, Panel Save/Toggle/Delete.
- Source of Truth: `appointments_v2` + View `v_appointments_v2_upcoming`.
- Side Effects: feuert `appointments:changed`, Butler-Header aktualisiert.
- Constraints: RLS auf `user_id`, `repeat_rule` Werte (none/monthly/annual).
- `appointments:changed` Event aktualisiert Butler-Header.
- `appModules.appointments.getUpcoming()` wird vom Assistant genutzt.

---

## Intent / Voice Integration

- Status:
  - Noch kein produktiver Intent-/Voice-Fast-Path fuer Terminverwaltung.
  - Das Modul liefert bereits Kontext fuer den Assistant, aber keinen freigegebenen Eingabe- oder Status-Fast-Path.
- Unterstuetzte Intents:
  - keine
- Voice Entry Points:
  - Derzeit keine produktiven Voice Entry Points.
- Allowed Actions:
  - keine
- Vorbefuellbare Parameter:
  - Derzeit keine produktiven Prefills oder vorbereiteten Intent-Parameter.
- Nicht erlaubte Operationen:
  - Keine freie Terminerfassung per Voice.
  - Kein Statuswechsel `scheduled` / `done` per Intent-/Voice-Fast-Path.
  - Kein Loeschen oder strukturelles Editieren per Voice.
- Hinweise / offene Punkte:
  - Bestehende Kontextnutzung laeuft ueber `getUpcoming(...)` fuer den Assistant-Header.
  - Future Hook: vorbereitete Maske oder enger Status-Pfad erst nach separater Priorisierung, Guard- und Workflow-Klaerung.

### Dokumentierter Future Case: enger Appointment-Create-Fast-Path

- Hintergrund:
  - Ein spaeterer Voice-Fast-Path fuer `Termin anlegen` kann fuer MIDAS realen Alltagsnutzen haben.
  - Das gilt besonders fuer ein spaeteres Nutzungsbild mit:
    - weniger Tippen
    - mehr Sprache
    - kleinem mobilen oder Wearable-Einstiegspunkt
    - z. B. DIY-ESP32-Uhr am Handgelenk
- Beispiel fuer den gewuenschten Fall:
  - `Hey MIDAS, trage mir fuer den [Datum] um [Uhrzeit] einen Termin bei [Arzt] ein.`
  - Konkretes Beispiel:
    - `Hey MIDAS, trage mir fuer morgen um 9 Uhr einen Termin beim Hausarzt ein.`
- Wichtige Einordnung:
  - Das ist nicht nur eine weitere `semantics`-Datei.
  - Fuer einen belastbaren produktiven Pfad waeren zusaetzlich noetig:
    - Datums-Semantik
    - Zeit-Semantik
    - Slot-Bildung fuer Datum / Uhrzeit / Terminziel
    - Guardrails fuer unvollstaendige oder mehrdeutige Eingaben
    - enger lokaler Create-Workflow im Appointments-Modul
- Warum das nicht einfach in den bestehenden Voice-V1-Schnitt faellt:
  - Termine sind strukturierte Planung und nicht nur ein kleiner lokaler Spezialbefehl wie:
    - Wasser eintragen
    - Medikation bestaetigen
    - Atemtimer starten
  - Relative Angaben wie:
    - `morgen`
    - `naechsten Dienstag`
    - `frueh`
    - `beim Hausarzt`
    brauchen kontrollierte Aufloesung statt offener Satzvielfalt.
- Empfohlener enger Loesungsschnitt fuer spaeter:
  - nur `appointment_create`
  - keine Edit-/Delete-/Done-Voice-Pfade
  - Pflichtslots:
    - `DATE`
    - `TIME`
    - `APPOINTMENT_TARGET`
  - kein offener Dialog
  - bei fehlenden oder unsicheren Slots:
    - sauber blocken oder
    - vorbereitete Maske / Prefill oeffnen
- Moegliche technische Umsetzung in spaeterem Scope:
  - neue Semantikfamilien fuer:
    - Datum
    - Zeit
    - Appointment / Termin
    - Arzt / Ziel
  - neue Slots fuer:
    - `DATE`
    - `TIME`
    - `APPOINTMENT_TARGET`
  - enger Rule-/Pattern-Contract fuer:
    - `appointment_create`
  - Validatoren fuer:
    - Pflichtslot-Vollstaendigkeit
    - Ambiguitaet
    - zulassige Datums-/Zeitform
  - lokaler Helper im Appointments-Modul, der nur den sicheren Create-Fall ausfuehrt
- Produktgrenze fuer diesen Future Case:
  - kein allgemeines `Voice fuer Termine`
  - sondern nur ein enger, deterministischer Fast-Path mit hohem Reibungsnutzen
- Empfehlung fuer spaeter:
  - als eigene Roadmap oder eigener Unterblock behandeln
  - nicht nebenbei in `F10` hineinziehen, wenn Datum-/Zeitlogik und Guards nicht explizit mitgeschnitten werden
- Zweck dieses Abschnitts:
  - Ein spaeterer Chat soll den Nutzen, den Scope und die technischen Huerden sofort verstehen.
  - Der Fall bleibt damit dokumentiert, ohne heute schon als produktiver Appointment-Voice-Contract zu gelten.
- Aktueller Status dieses Future Cases:
  - ruhend
  - technisch machbar, aber im aktuellen Produktausbau bewusst zu teuer
  - nicht verworfen, sondern fuer spaeteren Realitaetscheck und eine eigene Roadmap geparkt
- Entscheidungsgrund heute:
  - der aktuelle Reibungsdruck ist noch nicht hoch genug belegt
  - handische Terminpflege funktioniert bislang ausreichend
  - der technische Zusatzaufwand fuer einen belastbaren Voice-Create-Pfad ist deutlich hoeher als bei den bisher umgesetzten Fast Paths
- Wiederaufnahme nur unter klarer Bedingung:
  - wenn spaetere Nutzung zeigt, dass `Termin anlegen` wirklich ein relevanter Voice-/Wearable-Reibungspunkt wird
  - dann als eigener Scope mit expliziter Datums-/Zeit-/Guard-Planung neu aufsetzen

---

## 9. Erweiterungspunkte / Zukunft

- Reminder/Push (PWA).
- Wiederholungen via Server-Job.
- Assistant Actions (Termin oeffnen, Navigation).

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Flags (Supabase-Config erforderlich).

---

## 11. Status / Dependencies / Risks

- Status: aktiv (Hub/Assistant integriert).
- Dependencies (hard): `appointments_v2` + View `v_appointments_v2_upcoming`, Supabase Client, Hub-Panel.
- Dependencies (soft): Assistant-Header, spaetere PWA Reminder.
- Known issues / risks: keine Reminder/Push; Startzeit/Timezone; Repeat-Rule begrenzt.
- Backend / SQL / Edge: `sql/09_Appointments_v2.sql`.

---

## 12. QA-Checkliste

- Termin speichern -> Liste + Butler aktualisiert.
- Toggle Done/Reset aktualisiert Status.
- Delete entfernt Eintrag.
- Upcoming-Liste zeigt nur geplante Termine.

---

## 13. Definition of Done

- Terminpanel funktioniert ohne Errors.
- Butler-Kontext aktualisiert.
- Doku aktuell.


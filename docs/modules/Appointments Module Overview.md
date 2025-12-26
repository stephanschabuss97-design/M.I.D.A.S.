# Assistant Appointments Module - Functional Overview

Kurze Einordnung:
- Zweck: Terminverwaltung im Hub + Butler-Kontext fuer Assistant.
- Rolle innerhalb von MIDAS: liefert Upcoming-Termine und syncen ins Assistant-Header.
- Abgrenzung: keine Reminder/Push-Logik (spaeter), keine Arzt-Ansicht.

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
- Event `appointments:changed` nach jeder Mutation.

### 4.4 Persistenz
- Insert/Update/Delete in `appointments_v2`.
- Status-Updates (`scheduled`/`done`) via Update.

---

## 5. UI-Integration

- Hub-Panel `#hubAppointmentsPanel` mit Formular + Overview.
- Button `appointmentsOverviewBtn` scrollt zur Liste.
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


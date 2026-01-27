# Push Module - Functional Overview

Kurze Einordnung:
- Zweck: lokale Incident-Pushes als Sicherheitsnetz (einmalig, ruhig).
- Rolle innerhalb von MIDAS: erinnert nur bei echten Incidents (Medikation/BP).
- Abgrenzung: keine Reminder-Ketten, keine Lifestyle-Ziele, keine Termine.

Related docs:
- [MIDAS Incidents & Push Roadmap](../MIDAS Incidents & Push Roadmap.md)
- [Intake Module Overview](Intake Module Overview.md)
- [Medication Module Overview](Medication Module Overview.md)
- [Hub Module Overview](Hub Module Overview.md)

---

## 1. Zielsetzung

- Problem: echte Incidents duerfen nicht untergehen.
- Nutzer: Patient (sanfter Hinweis, nicht nervig).
- Nicht Ziel: Gamification, Eskalation, Push-Spam.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/incidents/index.js` | Incident-Engine + lokale Push-Entscheidung |
| `app/modules/intake-stack/medication/index.js` | Event-Quelle `medication:changed` |
| `app/modules/vitals-stack/vitals/bp.js` | BP-Save-Event `bp:changed` |
| `app/core/pwa.js` | PWA/Service Worker Registrierung |
| `service-worker.js` | Push-Anzeige (Notification API) |
| `docs/MIDAS Incidents & Push Roadmap.md` | Regeln, Steps, QA |

---

## 3. Datenmodell / Storage

- Kein eigenes Storage.
- In-Memory State (pro Tag): gesendete Incidents + BP-Flags.
- Keine persistente Historie.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Incident-Engine startet beim App-Load.
- Tageswechsel resettiert Push-Flags.
- Intervall-Check (lokal) fuer Zeitfenster.

### 4.2 Trigger
- `medication:changed` -> Incidents neu berechnen.
- `bp:changed` -> Incidents neu berechnen.
- Visibility-Change -> Recalc.

### 4.3 Verarbeitung
- Incident A (Medikation Morgen): einmaliger Push ab 10:00, falls offene Medikation.
- Incident B (Abend-BP): einmaliger Push ab 20:00, wenn Morgen-BP vorhanden und Abend fehlt.
- Lokale Zeit als Referenz (nicht UTC).

### 4.4 Persistenz
- Keine Persistenz.

---

## 5. Push-Transport

- Lokal ueber Service Worker Registration (`showNotification`) oder Notification API.
- Einmalig pro Incident/Tag (Tag-Key in Memory).
- Kein Retry-Loop, keine Eskalation.

---

## 6. UI-Integration

- Keine UI-Komponenten.
- Keine Panel-Abhaengigkeit.

---

## 7. Fehler- & Diagnoseverhalten

- Fehlschlag beim Push bleibt silent (kein User-Error).
- Diagnoselog optional bei Debug.

---

## 8. Events & Integration Points

- Input-Events: `medication:changed`, `bp:changed`.
- Output: lokale Push-Notification.
- Constraints: Termine sind kein Incident.

---

## 9. Erweiterungspunkte / Zukunft

- Serverseitiger Push (Supabase Edge / Cron).
- Persistente Incident-Logs.
- User-Config (stumm, Zeitfenster, Snooze).

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Flags.

---

## 11. Status / Dependencies / Risks

- Status: aktiv (lokal).
- Dependencies (hard): PWA/Service Worker, Medication- und BP-Events.
- Dependencies (soft): Notification Permission.
- Known issues / risks: keine Persistenz, Permission blockiert Push, Zeitzonen-Edgecases.

---

## 12. Remote Push Setup-Notiz (ohne Werte)

- Edge Function `midas-incident-push` ist deployed (Supabase).
- Secrets angelegt: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `INCIDENTS_USER_ID`, `INCIDENTS_TZ`.
- GitHub Actions Schedule fuer 10:00/21:00 wird als naechster Schritt verdrahtet.

---

## 13. QA-Checkliste

- Medikation nicht bestaetigt bis 10:00 -> Push einmalig.
- Abend-BP fehlt, Morgen-BP vorhanden -> Push einmalig ab 20:00.
- Keine Pushes fuer Termine.
- Tageswechsel resettiert Flags.

---

## 14. Definition of Done

- Pushes nur bei echten Incidents.
- Maximal 1 Push pro Incident/Tag.
- Dokumentation aktuell.

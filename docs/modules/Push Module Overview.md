# Push Module - Functional Overview

Kurze Einordnung:
- Zweck: lokale Incident-Pushes als ruhiges Sicherheitsnetz.
- Rolle innerhalb von MIDAS: erinnert nur bei echten Incidents aus Medikation oder Blutdruck.
- Abgrenzung: keine Reminder-Ketten, keine Lifestyle-Ziele, keine Termine.

Related docs:
- [MIDAS Incidents & Push Roadmap](../archive/MIDAS Incidents & Push Roadmap.md)
- [Intake Module Overview](Intake Module Overview.md)
- [Medication Module Overview](Medication Module Overview.md)
- [Hub Module Overview](Hub Module Overview.md)

---

## 1. Zielsetzung

- Problem: echte Incidents duerfen nicht untergehen.
- Nutzer: Patient, mit sanftem Hinweis statt Eskalation.
- Nicht-Ziel: Push-Spam, Reminder-Kaskaden oder allgemeine Motivationshinweise.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/incidents/index.js` | Incident-Engine plus lokale Push-Entscheidung |
| `app/modules/intake-stack/medication/index.js` | Event-Quelle `medication:changed` und Medication-Read-Model |
| `app/modules/vitals-stack/vitals/bp.js` | BP-Save-Event `bp:changed` |
| `app/core/pwa.js` | PWA- und Service-Worker-Registrierung |
| `service-worker.js` | Notification-Anzeige und Click-Handling |
| `docs/archive/MIDAS Incidents & Push Roadmap.md` | Regeln, Schritte, QA |

---

## 3. Datenmodell / Storage

- Kein eigenes persistentes Storage.
- In-Memory-State pro Tag: gesendete Incident-Flags.
- Keine historische Incident-Ablage.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Incident-Engine startet beim App-Load.
- Tageswechsel resettiert Push-Flags.
- Lokaler Intervall-Check prueft Zeitfenster.

### 4.2 Trigger
- `medication:changed` berechnet Medication-Incidents neu.
- `bp:changed` berechnet BP-Incidents neu.
- `visibilitychange` triggert Recalc.

### 4.3 Verarbeitung
- Medication-Incident: einmaliger aggregierter Tages-Push ab dem spaeten Cutoff, falls fuer heute noch offene Einnahmen bestehen.
- BP-Incident: einmaliger Push ab Abend, wenn Morgen-BP vorhanden und Abend-BP fehlt.
- Lokale Zeit ist Referenz, nicht UTC.

### 4.4 Persistenz
- Keine Persistenz.

---

## 5. Push-Transport

- Lokal ueber Service Worker Registration (`showNotification`) oder Notification API.
- Maximal ein Push pro Incident und Tag.
- Kein Retry-Loop, keine Eskalationskette.

---

## 6. UI-Integration

- Profil-Panel: Push aktivieren/deaktivieren plus Statusanzeige.
- Opt-in nur per User-Intent.

---

## 7. Fehler- & Diagnoseverhalten

- Fehlschlag beim Push bleibt lokal und fuehrt zu keinem User-Error.
- Diagnoselog optional bei Debug.

---

## 8. Events & Integration Points

- Input-Events: `medication:changed`, `bp:changed`.
- Medication-Incident basiert auf dem Medication-Read-Model mit `state !== 'done'`, nicht mehr auf dem alten Tages-Boolean `taken`.
- Output: lokale Push-Notification.
- Constraints: Termine und allgemeine Hinweise sind keine Incidents.

---

## 9. Erweiterungspunkte / Zukunft

- Serverseitiger Push (Supabase Edge / Cron).
- Persistente Incident-Logs.
- User-Config fuer Zeitfenster oder Snooze.

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Flags.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): PWA/Service Worker, Medication- und BP-Events, Edge Function und GitHub Actions.
- Dependencies (soft): Notification Permission.
- Known issues / risks: keine Persistenz, Permission blockiert Push, Zeitzonen-Edgecases, tolerierter Schedule-Jitter.

---

## 12. Remote Push Setup-Notiz (ohne Werte)

- Edge Function `midas-incident-push` ist deployed.
- Secrets angelegt: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `INCIDENTS_USER_ID`, `INCIDENTS_TZ`.
- GitHub Actions Schedule fuer die Zeitfenster aktiv.

Status-Notiz:
- Client Subscription Flow aktiv.
- Service Worker: `push` plus `notificationclick` aktiv.

---

## 13. QA-Checkliste

- Offene Medication bis zum spaeten Cutoff -> genau ein aggregierter Tages-Push.
- Abend-BP fehlt, Morgen-BP vorhanden -> genau ein Push ab Abend.
- Keine Pushes fuer Termine.
- Tageswechsel resettiert Flags.

---

## 14. Definition of Done

- Pushes nur bei echten Incidents.
- Maximal ein Push pro Incident und Tag.
- Dokumentation aktuell.

---

## 15. Incident Alert Tuning Notiz

Ziel
- Incidents sollen auf dem Handy fuer echte Sicherheitsfaelle besser wahrnehmbar sein.
- Keine neue Reminder-Logik; nur staerkere Wahrnehmbarkeit fuer bestehende Incident-Pushes.

Kontext
- Incident-Pushes sind bewusst ruhig ausgelegt.
- Lokale Incidents setzen im Client derzeit `silent: true`.
- Remote Push uebernimmt `silent` aus dem Payload.

Geplante technische Anpassungen
- Lokale Incident-Pushes nicht mehr explizit stumm senden (`silent: false` oder Feld weglassen).
- Remote Incident-Payloads ebenfalls hoerbar umstellen.
- `vibrate` fuer echte Incidents setzen.
- Optional `requireInteraction` testen, sofern Plattform/Browsersupport vorhanden.
- Optional `actions` fuer Remote-Push pruefen, ohne neue Fachlogik.

Betroffene Dateien
- `app/modules/incidents/index.js`
- `service-worker.js`
- optional `app/modules/profile/index.js` fuer einen spaeteren Nutzer-Schalter

Bewusste Grenzen des aktuellen PWA-Stacks
- Kein frei waehlbarer eigener Nachrichtenton wie in nativen Apps.
- Keine Kontrolle ueber Lautstaerke, Fokus-Modi oder Lautlos-Schalter.
- Verhalten bleibt browser- und plattformabhaengig.

Pragmatische Produktregel
- Staerkere Wahrnehmbarkeit nur fuer echte Incidents, nicht fuer allgemeine Hinweise.
- Weiterhin maximal ein Push pro Incident und Tag.

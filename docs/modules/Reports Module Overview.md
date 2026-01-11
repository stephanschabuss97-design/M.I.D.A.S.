# Reports Module - Functional Overview

Kurze Einordnung:
- Zweck: Monatsbericht + Arztbericht (Range) generieren und in der Inbox bereitstellen.
- Rolle innerhalb von MIDAS: fasst BP/Body/Lab/Activity fuer Arzt und Patient zusammen.
- Abgrenzung: keine Diagnosen, keine Therapieempfehlungen, keine Echtzeit-Alerts.

Related docs:
- [Doctor View Module Overview](Doctor View Module Overview.md)
- [Reports-Roadmap](../Reports-Roadmap.md)

---

## 1. Zielsetzung

- Problem: Arzt und Patient brauchen eine klare, kompakte Zusammenfassung fuer einen Zeitraum.
- Nutzer: Arzt / Patient im Arztmodus.
- Nicht Ziel: medizinische Entscheidungen automatisieren oder begruenden.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/doctor-stack/reports/index.js` | Reports-UI/Inbox (entkoppelt vom Doctor-View) |
| `app/modules/doctor-stack/doctor/index.js` | Doctor-View (ruft Reports-Modul und Inbox-Overlay) |
| `app/supabase/api/reports.js` | Edge Function Wrapper (`generateMonthlyReportRemote`) |
| `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-monthly-report\\index.ts` | Report-Engine (monthly + range) |
| `app/styles/doctor.css` | Report-Karten + Inbox-Overlay Styling |

---

## 3. Datenmodell / Storage

- Tabelle: `health_events`
- Report-Records: `type = system_comment`
- Wesentliche Payload-Felder:
  - `payload.subtype`: `monthly_report` | `range_report`
  - `payload.month`: `YYYY-MM` (nur Monthly)
  - `payload.month_label`: Lesbarer Monatsname
  - `payload.period`: `{ from, to }` (Range oder expliziter Zeitraum)
  - `payload.summary`: Kurzfassung
  - `payload.text`: Fliesstext (Markdown-Style)
  - `payload.meta`: strukturierte Kennzahlen
  - `payload.generated_at`

Inbox-Filterung erfolgt ausschliesslich ueber `payload.subtype`.

---

## 4. Datenquellen (Edge Function)

Die Report-Engine arbeitet auf Views, nicht auf Roh-Events:
- `v_events_bp`
- `v_events_body`
- `v_events_lab`
- `v_events_activity`

Damit bleibt die Report-Logik stabil, auch wenn die Rohdaten wachsen.

---

## 5. Ablauf / Logikfluss

### 5.1 Trigger
- Monthly: manuell via Doctor-Inbox Button.
- Range: manuell via Doctor-Inbox, nur mit `from/to`.
- (Geplant) Monthly via Cron (GitHub Actions).

### 5.2 Edge Function Verarbeitung
- Normalisiert Range:
  - Monthly: voriger Monat (REPORT_TZ Europe/Vienna).
  - Range: explizit `from/to`.
- Laedt Daten aus den Views.
- Baut:
  - `summary` (Kurztext)
  - `text` (Narrativ, Markdown)
  - `meta` (Kennzahlen + Kontext)
- Persistenz:
  - Monthly: upsert fuer denselben Monat (idempotent).
  - Range: insert pro Zeitraum (jede Range = eigener Report).

### 5.3 UI / Inbox
- Inbox-Overlay zeigt Reports, Filter und Aktionen:
  - Neu erstellen (monthly / range)
  - Loeschen
  - Regenerieren
- Nach Generierung wird Inbox refresh ausgeloest.

---

## 6. UI-Verhalten (Doctor-View)

- Reports werden als Karten dargestellt (Titel + Zeitraum + Summary + Text).
- Filter: `monthly_report` vs `range_report`.
- Aktionen:
  - Regenerate: erstellt Report neu (Monthly ueberschreibt, Range erstellt neu).
  - Delete: entfernt den aktuellen Report.
  - Clear Inbox: entfernt alle Reports eines Subtypes.

Leitlinie: Read-only. Reports sind nicht editierbar.

---

## 7. API / Integration Points

### 7.1 Client API
- `generateMonthlyReportRemote({ from, to, month, report_type })`

### 7.2 Reports-Modul
- `loadMonthlyReports(from, to)`
- `generateMonthlyReport(opts, reportDeps)`
- `handleReportCardAction(event, reportDeps)`
- `clearReportInbox(reportDeps)`

### 7.3 Doctor-View
Doctor-View ruft ausschliesslich das Reports-Modul auf und kapselt UI-Overlay.

---

## 8. Auth / Sicherheit

- Edge Function laeuft mit User JWT (manual).
- Cron-Run (geplant) nutzt Service Role + `MONTHLY_REPORT_USER_ID`.
- Single-User Betrieb erlaubt vereinfachte Strategien, aber:
  - Scheduler braucht immer definierten User.
  - Keine offenen Endpoints ohne Auth.

---

## 9. Fehler- & Diagnoseverhalten

- Edge Function liefert JSON-Fehler (400).
- Client:
  - `diag.add` bei Fehlern.
  - Toasts fuer User-Feedback.
- Range-Report ohne `from/to` -> UI-Error.

---

## 10. Idempotenz / Konsistenz

- Monthly: upsert fuer denselben Monat (kein Duplikat).
- Range: insert pro Zeitraum, keine automatische Dedupe.
- Inbox zeigt immer den aktuellen Stand aus `health_events`.

---

## 11. Encoding / Textqualitaet

Status:
- Encoding-Artefakte bereinigt (manuell).
- Formulierungen vereinheitlicht (kein Platzhaltertext).
- Dry-Run wurde bewusst nicht umgesetzt.

---

## 12. QA-Checkliste

- Monthly Report erzeugt/aktualisiert den gleichen Monat.
- Range Report nur mit gesetztem Zeitraum.
- Inbox-Filter (monthly/range) korrekt.
- Delete/Regenerate funktioniert.
- Clear Inbox loescht Subtype korrekt.

---

## 13. Definition of Done

- Reports Modul entkoppelt und dokumentiert.
- Inbox-UI stabil und nachvollziehbar.
- Monatsbericht manuell + optional per Cron.
- Encoding der Reporttexte konsistent (UTF-8).

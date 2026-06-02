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
| `backend/supabase/functions/midas-monthly-report/index.ts` | Report-Engine (monthly + range) |
| `app/styles/doctor.css` | Report-Karten + Inbox-Overlay Styling |
| `public.user_profile` | Patientenkopf + Protein-Ziel (Range-Report) |
| `public.trendpilot_events_range` | Trendpilot-Liste im Range-Report |

---

## 3. Datenmodell / Storage

- Tabelle: `health_events`
- Report-Records: `type = system_comment`
- Wesentliche Payload-Felder:
  - `payload.subtype`: `monthly_report` | `range_report`
  - `payload.month`: `YYYY-MM` (nur Monthly)
  - `payload.month_label`: Lesbarer Monatsname
  - `payload.period`: `{ from, to }` (Range oder expliziter Zeitraum)
  - `payload.summary`: Kurzfassung (Monthly; Range leer)
  - `payload.text`: Fliesstext (Markdown-Style)
  - `payload.meta`: strukturierte Kennzahlen
  - `payload.generated_at`
  - `payload.created_at`

Report-Zeitvertrag:

- `health_events.ts` ist fuer Reports der Inbox-Anker, nicht die alleinige Erzeugungszeit.
- `health_events.day` wird aus `ts` in `Europe/Vienna` generated.
- Die Edge Function setzt `ts` auf `payload.period.to` bei UTC-Mittag.
- Der Report-Zeitraum bleibt in `payload.period`.
- Die Erzeugungszeit steht im Payload:
  - `payload.generated_at`
  - `payload.created_at`
- Der Client liest fuer die UI-Erzeugungszeit `created_at || generated_at || row.ts`.

Inbox-Filterung erfolgt ueber `payload.subtype` und den generated `day`-Anker.

---

## 4. Datenquellen (Edge Function)

Die Report-Engine arbeitet auf Views, nicht auf Roh-Events:
- `v_events_bp`
- `v_events_body`
- `v_events_lab`
- `v_events_activity`

Range-Report zieht zusaetzlich:
- `user_profile` (Name, Birthdate, Height, Smoker, Meds, Protein-Ziel)
- `trendpilot_events_range` (alle Eintraege, chronologisch)

Damit bleibt die Report-Logik stabil, auch wenn die Rohdaten wachsen.

---

## 5. Ablauf / Logikfluss

### 5.1 Trigger
- Monthly: manuell via Doctor-Inbox Button.
- Range: manuell via Doctor-Inbox, nur mit `from/to`.
- Monthly via Cron (GitHub Actions).

### 5.2 Edge Function Verarbeitung
- Validiert und normalisiert Request:
  - `report_type` ist runtime-begrenzt auf `monthly_report` oder `range_report`.
  - fehlender oder `null`-`report_type` bleibt Monthly-Default.
  - leerer Request-Body bleibt Monthly-Default.
  - ungueltiges JSON liefert einen 400-Fehler.
- Normalisiert Zeitraum:
  - Monthly: optionales `month` als striktes `YYYY-MM`, sonst voriger Monat in `Europe/Vienna`.
  - Monthly ignoriert `from/to`.
  - Range: strikte `from/to`-ISO-Days `YYYY-MM-DD`.
  - Range ignoriert `month`.
  - ungueltige Kalenderdaten werden abgelehnt; kein stilles JS-Date-Rolling.
- Laedt Daten aus den Views.
- Baut:
  - `summary` (Kurztext)
  - `text` (Narrativ, Markdown)
  - `meta` (Kennzahlen + Kontext)
- Persistenz:
  - Monthly: Update fuer denselben Monat (idempotent ueber `payload.subtype` + `payload.month`).
  - Range: Insert pro Erzeugung (keine automatische Dedupe).
  - Insert und Monthly-Update setzen `health_events.ts` auf den Report-Anker.

### 5.3 UI / Inbox
- Inbox-Overlay zeigt Reports, Filter und Aktionen:
  - Neu erstellen (monthly / range)
  - Loeschen
  - Regenerieren
- Nach Generierung wird Inbox refresh ausgeloest.
 - Inbox ist fullscreen (Desktop + Mobile).

---

## 6. UI-Verhalten (Doctor-View)

- Reports werden als Karten dargestellt (Titel + Zeitraum + Summary + Text).
- Filter: `monthly_report` vs `range_report`.
- Monatsberichte sind nach Monat gruppiert (Accordion, standardmaessig eingeklappt).
- Arzt-Berichte sind eigener Accordion-Block, standardmaessig geoeffnet.
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

- Manuelle Reports laufen mit User-JWT und schreiben fuer den authentifizierten User.
- Scheduler/Cron nutzt Service Role + `MONTHLY_REPORT_USER_ID`.
- Service Role ist nur fuer `monthly_report` erlaubt.
- Cron-Payload: `{"trigger":"scheduler","report_type":"monthly_report"}`.
- Single-User Betrieb erlaubt vereinfachte Strategien, aber:
  - Scheduler braucht immer definierten User.
  - Keine offenen Endpoints ohne Auth.
  - Kein unauthentifizierter Default-User-Fallback.

---

## 9. Fehler- & Diagnoseverhalten

- Edge Function liefert JSON-Fehler (400).
- Ungueltiges JSON im Request-Body liefert `Ungueltiges JSON im Request-Body.`.
- Ungueltiger `report_type`, `month`, `from` oder `to` wird vor Datenbankzugriff abgelehnt.
- Client:
  - `diag.add` bei Fehlern.
  - Toasts fuer User-Feedback.
- Range-Report ohne `from/to` -> UI-Error.

---

## 10. Idempotenz / Konsistenz

- Monthly: upsert fuer denselben Monat (kein Duplikat).
- Range: insert pro Zeitraum, keine automatische Dedupe.
- Inbox zeigt immer den aktuellen Stand aus `health_events`.
- Report-Erstellungszeit und Report-Zeitraum bleiben unterscheidbar:
  - Zeitraum: `payload.period`.
  - Inbox-Anker: `health_events.ts/day`.
  - Erzeugungszeit: `payload.created_at` / `payload.generated_at`.

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
- Invalid `report_type` wird abgelehnt.
- Invalid `from/to/month` wird abgelehnt.
- Invalid JSON wird mit 400 abgelehnt.
- Report-Anker `ts/day` zeigt in den erwarteten Inbox-Kontext.
- UI-Erzeugungszeit kommt aus `created_at || generated_at || row.ts`.
- Delete/Regenerate funktioniert.
- Clear Inbox loescht Subtype korrekt.
- Cron-Run erstellt einen Monatsbericht ohne Fehler.

---

## 13. Definition of Done

- Reports Modul entkoppelt und dokumentiert.
- Inbox-UI stabil und nachvollziehbar.
- Monatsbericht manuell + optional per Cron.
- Encoding der Reporttexte konsistent (UTF-8).

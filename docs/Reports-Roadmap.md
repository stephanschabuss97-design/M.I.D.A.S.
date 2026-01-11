# Reports Roadmap

Wichtige Dateien (aktuell)
- `app/modules/doctor-stack/doctor/index.js` (Report-Inbox + Trigger, aktuell noch eingebettet)
- `app/modules/doctor-stack/reports/index.js` (neues Modul fuer Reports-UI)
- `app/supabase/api/reports.js` (Edge-Wrapper fuer Reports)
- `app/styles/doctor.css` (Report-Karten + Inbox Styling)
- `docs/modules/Doctor View Module Overview.md` (uebergeordnete Arzt-Ansicht)
- `docs/modules/Reports Module Overview.md` (neue Master-Doku)
- `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-monthly-report\\index.ts` (Report-Engine)

Ziel
- Reports (Monatsbericht + Arztbericht) im Frontend modularisieren.
- Reports-Doku entkoppeln und langfristig wartbar machen.
- Report-Qualitaet verbessern (Texte, Kennzahlen, Konsistenz).
- Monatlicher Report via Cron, Arztbericht bleibt on demand.

Scope
- Frontend-Entkopplung in `app/modules/doctor-stack/reports/`.
- Neue Module Overview fuer Reports.
- Cron-Job fuer Monatsbericht (GitHub Actions).
- Qualitaetsverbesserungen im Reporttext (keine Diagnosen).

Nicht im Scope
- PDF/Export-Funktionen.
- Neue Datenquellen ausser BP/Body/Lab/Activity.
- KI/LLM-generierte Reporttexte.

Annahmen
- Single-User Betrieb.
- Reports werden als `system_comment` in `health_events` gespeichert.
- Doctor-View bleibt Read-Only.

Deterministische Hauptsteps

1) Doku & Struktur (done)
  1.1 `app/modules/doctor-stack/reports/index.js` als eigener Einstieg vorhanden. (done)
  1.2 `docs/modules/Reports Module Overview.md` erstellt. (done)
  1.3 Doctor-View Overview aktualisieren (Link + Datei-Liste). (done)
  1.4 Roadmap anlegen und verlinken. (done)

2) Frontend-Entkopplung (geplant)
 2.1 Report-Inbox Rendering aus `doctor/index.js` nach `reports/index.js` verschieben. (done)
 2.2 Inbox-Handlers (create/delete/regenerate/filter) in Reports-Modul kapseln. (done)
 2.3 Doctor-View ruft nur noch Reports-API des Moduls. (done)
  2.4 QA: Inbox, Filter, Loeschen, Regenerate, Range-Report Trigger. (done)
  2.5 Module Overview nachziehen. (done)

3) Edge Function: Stabilitaet & Textqualitaet (geplant)
  3.1 Encoding-Artefakte lokalisieren (Liste + Zeilen), manuelle Korrektur durch Stephan. (done)
  3.2 Manuelle Korrektur der Artefakte (durch Stephan). (done)
  3.3 Texte glatten (keine Platzhalter, konsistente Formulierungen). (done)
  3.4 Optional: Dry-Run Ausgabe fuer Debug (nur intern). (done)
  3.5 Module Overview nachziehen. (done)

4) Monatsbericht Cron (geplant)
  4.1 GitHub Actions Workflow fuer Monatsbericht erstellen (Service Role Auth). (done)
  4.2 Secrets setzen:
      - GitHub Secrets:
        - Name: REPORTS_URL
          - Value: https://jlylmservssinsavlkdi.supabase.co/functions/v1/midas-monthly-report
        - Name: SUPABASE_SERVICE_ROLE_KEY
          - Value: <SUPABASE_SERVICE_ROLE_KEY aus Supabase Project Settings>
      - Supabase Edge Secret:
        - Name: MONTHLY_REPORT_USER_ID
          - Value: <DEIN user_id UUID>
      - Supabase Edge Secret:
        - Name: MONTHLY_REPORT_CRON_SECRET
          - Value: <Zufallswert fuer Cron-Secret, identisch zum GitHub Secret>
      - GitHub Secret:
        - Name: MONTHLY_REPORT_CRON_SECRET
          - Value: <gleicher Wert wie in Supabase>
      - Curl im Workflow:
        curl -sS -X POST "${{ secrets.REPORTS_URL }}" \\
          -H "Content-Type: application/json" \\
          -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \\
          -H "x-midas-cron-secret: ${{ secrets.MONTHLY_REPORT_CRON_SECRET }}" \\
          -d '{"trigger":"scheduler"}'
  4.3 Schedule testen (manuell + Cron).
  4.4 Module Overview nachziehen.

5) Report-Qualitaet verbessern (geplant)
  5.1 BP-Text: Schwellen und Spitzen einheitlich benennen.
  5.2 Lab-Text: CKD-Stufe und ACR-Kontext klarer.
  5.3 Body-Text: Trend + Spanne konsistent, kein Rauschen.
  5.4 Activity-Text: Vergleich Vormonat nur bei Monatsbericht.
  5.5 Module Overview nachziehen.

6) QA / Validierung (geplant)
  6.1 Monatsbericht erzeugt/aktualisiert den gleichen Monat.
  6.2 Range-Report nur bei gesetztem Zeitraum.
  6.3 Inbox filtert korrekt (monthly vs range).
  6.4 Loeschen entfernt Reports (subtype) sauber.
  6.5 Module Overview nachziehen.

Offene Fragen (vor Implementierung klaeren)
- Soll der Cron-Report im Doctor-Inbox automatisch erscheinen oder nur intern geloggt werden?
- Soll der Reporttext spaeter auch Trendpilot-Highlights aufnehmen?

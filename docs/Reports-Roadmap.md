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

2) Frontend-Entkopplung (done)
 2.1 Report-Inbox Rendering aus `doctor/index.js` nach `reports/index.js` verschieben. (done)
 2.2 Inbox-Handlers (create/delete/regenerate/filter) in Reports-Modul kapseln. (done)
 2.3 Doctor-View ruft nur noch Reports-API des Moduls. (done)
  2.4 QA: Inbox, Filter, Loeschen, Regenerate, Range-Report Trigger. (done)
  2.5 Module Overview nachziehen. (done)

3) Edge Function: Stabilitaet & Textqualitaet (done)
  3.1 Encoding-Artefakte lokalisieren (Liste + Zeilen), manuelle Korrektur durch Stephan. (done)
  3.2 Manuelle Korrektur der Artefakte (durch Stephan). (done)
  3.3 Texte glatten (keine Platzhalter, konsistente Formulierungen). (done)
  3.4 Optional: Dry-Run Ausgabe fuer Debug (nur intern). (done)
  3.5 Module Overview nachziehen. (done)

4) Monatsbericht Cron (done)
  4.1 GitHub Actions Workflow fuer Monatsbericht erstellen (Service Role Auth). (done)
  4.2 Secrets setzen: (done)
      - GitHub Secrets:
        - Name: REPORTS_URL
          - Value: https://jlylmservssinsavlkdi.supabase.co/functions/v1/midas-monthly-report
        - Name: SUPABASE_SERVICE_ROLE_KEY
          - Value: <SUPABASE_SERVICE_ROLE_KEY aus Supabase Project Settings>
      - Supabase Edge Secret:
        - Name: MONTHLY_REPORT_USER_ID
          - Value: <DEIN user_id UUID> --> mittels Dev Tool "window.AppModules.supabase.getUserId()"
      - Curl im Workflow:
        curl -sS -X POST "${{ secrets.REPORTS_URL }}" \\
          -H "Content-Type: application/json" \\
          -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \\
          -d '{"trigger":"scheduler"}'
  4.3 Schedule testen (manuell + Cron). (done)
  4.4 Module Overview nachziehen. (done)

5) Report-Qualitaet verbessern (done)
  Leitlinien:
  - Monatsbericht = Info-Feed fuer mich (kompakt, ohne "Naechste Schritte").
  - Arztbericht = klinische Kurzuebersicht (Patientendaten immer sichtbar, klare Kennzahlen).
    - Aktivitaet im Arztbericht: Durchschnitt pro Eintrag (nicht pro Woche) + Eintraege/Minuten/Tage aktiv.
  5.1 Monatsbericht: BP-Text (Schwellen + Spitzen einheitlich). (done)
  5.2 Monatsbericht: Body-Text (Trend + Spanne konsistent, kein Rauschen). (done)
  5.3 Monatsbericht: Lab-Text (CKD-Stufe + ACR-Kontext klarer). (done)
  5.4 Monatsbericht: Activity-Text (Vormonat-Vergleich konsistent). (done)
  5.5 Arztbericht: BP-Text (Zeitraum betont, keine Monatslogik). (done)
  5.6 Arztbericht: Body-Text (Zeitraum, Trend + Spanne). (done)
    5.7 Arztbericht: Lab-Text (letzte Labordaten + CKD-Stufe). (done)
    5.8 Arztbericht: Activity-Text (nur Zeitraum, kein Vormonat). (done)
    5.9 Module Overview nachziehen. (done)

   Das wäre mein Vorschlag

# Ärztlicher Verlaufsbericht (MIDAS)

**Zeitraum:** 13.10.2025 – 11.01.2026  
**Erstellt am:** 11.01.2026, 21:48  
**Hinweis:** Automatisch generierter Verlaufsbericht. Keine Diagnose, keine Therapieempfehlung.

---

## Patient
**Name:** Stephan Schabuss  
**Geburtsdatum:** 15.04.1982 (43 Jahre)  
**Größe:** 183 cm  
**Raucherstatus:** Nichtraucher
**Derzeitige Medikation:** - Forxiga (10 mg, 1×/Tag), - Valsartan (160 mg, 1×/Tag), - Rosuvastatin (10 mg, 1×/Tag)

---

## Datengrundlage
- Blutdruck: 46 Messungen  
- Körper/BIA: 16 Messungen  
- Labor: 1 Kontrolle  
- Aktivität: 18 dokumentierte Einheiten  

---

## Blutdruck
- **Durchschnitt:** 114 / 76 mmHg  
  (46 Messungen: 23 morgens, 23 abends)
- **Spanne:** 104 / 65 bis 121 / 80 mmHg  
- **MAP (Ø):** 89 mmHg  
- **Pulsdruck (Ø):** 38 mmHg  


---

## Körperzusammensetzung
- **Gewicht:** Ø 93,0 kg (Spanne 91,6 – 95,0 kg), Trend −1,0 kg  
- **Bauchumfang:** Ø 101,5 cm, Trend −0,3 cm  
- **Fettmasse:** Ø 19,8 kg (18,9 – 21,2 kg), Trend −0,8 kg  
- **Muskelmasse:** Ø 34,2 kg (33,5 – 35,1 kg), Trend +0,5 kg  
- **WHtR (letzter Wert):** 0,55  
- **BMI (letzter Wert):** 27,4

---

## Aktivität
- **Einträge:** 18 dokumentierte Aktivitätseinheiten  
- **Gesamtdauer:** ca. 1.440 Minuten  
- **Durchschnitt:** ca. 80 Minuten pro Einheit  

---

## Protein (Ernährungsziel)
- **Zielbereich:** 90 – 99 g / Tag  
- **Aktueller Faktor:** 1,08 g/kg  
- **Quelle:** automatisch berechnet (kein Doctor-Lock)

---

## Trendpilot (automatische Verlaufsauswertung)
- **Hinweise im Zeitraum:** keine

---

## Labor / Nierenfunktion
- **Letzte Kontrolle:** 12.12.2025  
  - eGFR: 57 ml/min  
  - Kreatinin: 1,52 mg/dl
- **CKD-Stadium:** G3a A1rr

6) QA / Validierung (done)
  6.1 Monatsbericht erzeugt/aktualisiert den gleichen Monat. (done)
  6.2 Range-Report nur bei gesetztem Zeitraum. (done)
  6.3 Inbox filtert korrekt (monthly vs range). (done)
  6.4 Loeschen entfernt Reports (subtype) sauber. (done)
  6.5 Module Overview nachziehen. (done)

Offene Fragen (vor Implementierung klaeren)
- Soll der Cron-Report im Doctor-Inbox automatisch erscheinen oder nur intern geloggt werden?
- Soll der Reporttext spaeter auch Trendpilot-Highlights aufnehmen?



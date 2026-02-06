# Doctor Report Roadmap (Arztbericht)

Ziel
- Arztbericht als klinischer Kurzbefund, lesbar in < 2 Minuten.
- Fokus auf Status + Veränderung, keine Doppelungen.
- Keine Diagnosen, keine Therapieempfehlungen.

Hinweis
- Texte hier sind absichtlich mit ae/oe/ue, du korrigierst spaeter manuell.

Status
- Step 1: complete
- Step 2: complete
- Step 3: complete
- Step 4: pending
- Step 5: pending
- Step 6: complete
- Step 7: pending

Scope
- Report-Rework fuer Monthly + Range Report (ohne Oedemtracker, ohne Urintest).
- Vereinheitlichte Struktur, klare Zeitfenster (z. B. 30/180 Tage).
- Reduktion von BIA-Details (Fett-/Muskelmasse raus).
- Trendpilot nur als ruhiger Hinweis (handlungsrelevant).

Nicht im Scope
- Oedemtracker.
- Urin-Test-Modul.
- Neue Supabase Tabellen.
- Automatische Diagnose oder Therapieempfehlungen.

Deterministische Steps

Step 1: Struktur & Redundanz abbauen
1.1 Report-Abschnitte final definieren (BP, Koerper, Labor, Aktivitaet, Trendpilot).
1.2 Doppelungen entfernen (Messanzahl nur in Datengrundlage).
Output: finale Report-Gliederung.
Exit-Kriterium: Struktur ist fixiert.
Finale Report-Gliederung
- Kopf: Patient, Zeitraum (Monthly/Range), generiert am.
- Datengrundlage: Messanzahlen pro Bereich (nur hier).
- Blutdruck: 30/180 Tage, SYS/DIA/MAP/Pulsdruck + Trend.
- Koerper: Gewicht, Bauchumfang, BMI, WHtR + Vergleich.
- Labor/Niere: eGFR, Kreatinin, CKD + Protein/Acr falls vorhanden.
- Aktivitaet: knapper Status/Trend (kein Coaching).
- Trendpilot: nur handlungsrelevante Hinweise, ruhig formuliert.

Step 2: Blutdruck-Logik neu
2.1 Zeitfenster definieren: letzte 30 Tage + letzte 180 Tage.
2.2 Kennzahlen: SYS/DIA/MAP/Pulsdruck je Fenster.
2.3 Darstellung: klare Trends, konsistente Labels.
Output: BP-Spezifikation.
Exit-Kriterium: BP-Teil klar und stabil.
BP-Spezifikation (Fakten, kein Trend)
- Zwei Blöcke: 30 Tage und 180 Tage (heute - T30 / T180).
- Pro Block:
  - Durchschnitt: ∅ SYS/DIA mmHg (Ampel-Pill nach ESC2018).
  - Spanne: min/max SYS/DIA mmHg.
  - MAP (∅): Ampel-Pill nach Richtlinie.
  - Pulsdruck (∅): Ampel-Pill nach Richtlinie.
- Messanzahlen nur im Datengrundlage-Block, nicht hier.
- Hinweis: Umsetzung der Ampel-Pill ueber die Chart-Klassifizierer (siehe `app/modules/doctor-stack/charts/index.js`: `classifyEscBp`, `classifyMapValue`, `classifyPulsePressure`).
- Hinweis Body: BMI/WHtR nutzen Chart-Farblogik (`kpiColorBMI`, `kpiColorWHtR`) aus demselben Modul.

Step 3: Koerperdaten fokussieren
3.1 Entfernen: Fett-/Muskelmasse (BIA).
3.2 Behalten: Gewicht, Bauchumfang, BMI, WHtR.
3.3 Vergleich: letzte Messung vs letzter Arzttermin (Range).
Output: Body-Spezifikation.
Exit-Kriterium: Body-Teil reduziert und klinisch relevant.
Body-Spezifikation (Range)
- Gewicht: letzter Wert + Delta vs Start (Startdatum -> Enddatum).
- Bauchumfang: letzter Wert + Delta vs Start (Startdatum -> Enddatum).
- WHtR: letzter Wert + Delta, Ampel-Pill nach Chart-Logik.
- BMI: letzter Wert + Delta, Ampel-Pill nach Chart-Logik.
- Zeitspanne im Text klar nennen, keine Messanzahl hier.
Aktivitaets-Spezifikation (Range)
- Letzte Aktivitaet: Datum (zeigt Aktualitaet).
- Trainings/Woche: ∅ n (aus Zeitraumlaenge berechnet).
- Gesamtdauer: n Min (Durchschnitt: ∅ n Min/Eintrag).

Step 4: Aktivitaet fokussieren
4.1 Letzte Aktivitaet: Datum (zeigt Aktualitaet).
4.2 Trainings/Woche: ∅ n (aus Zeitraumlaenge berechnet).
4.3 Gesamtdauer: n Min (Durchschnitt: ∅ n Min/Eintrag).
Output: Aktivitaet-Spezifikation.
Exit-Kriterium: Aktivitaet ist knapp und informativ.

Step 5: Labor/Niere schaerfen
5.1 Beibehalten: eGFR, Kreatinin, CKD.
5.2 Protein/Acr: auslassen, bis Datenquelle existiert.
5.3 Formulierung ruhig, handlungsrelevant.
Output: Lab-Spezifikation (ohne Protein/Acr).
Exit-Kriterium: Labor-Teil beantwortet Kernfragen ohne Platzhalter.
Hinweis
- Fuer den Arztbericht bleiben eGFR, Kreatinin, CKD vorerst unveraendert.
- Protein/Acr erst integrieren, wenn Messung + Speicherung existiert.

Step 6: Trendpilot-Text
6.1 Nur handlungsrelevante Hinweise.
6.2 Formulierung medizinisch ruhig (keine Technik-Sprache).
Output: Trendpilot-Textregeln.
Exit-Kriterium: Trendpilot ist klar, nicht alarmistisch.
Trendpilot-Textregeln
- Nur relevante Severitys (z. B. warning/critical).
- Keine Technik-IDs (rule_id/type) im Text.
- Klare, ruhige Ein-Satz-Hinweise.
- Dedupe/Cluster gleicher Hinweise pro Zeitraum.

Step 7: Implementierung + QA (Arzt-Bericht)
7.1 Edge Function Update: `midas-monthly-report/index.ts` (Range/Arztbericht).
7.2 UI-Check: Reports-Inbox lesbar, keine Doppelungen.
7.3 QA: Range erzeugen, lesen, vergleichen (Monthly bleibt unveraendert).
Output: neuer Arztbericht live.
Exit-Kriterium: Arztbericht ohne Rueckfragen.

Relevante Dateien (Referenz)
- `docs/modules/Reports Module Overview.md`
- `app/modules/doctor-stack/reports/index.js`
- `app/modules/doctor-stack/doctor/index.js`
- `app/supabase/api/reports.js`
- `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-monthly-report\\index.ts`
- `app/styles/doctor.css`
- `public.user_profile`
- `public.trendpilot_events_range`

Follow-up
- Nach Abschluss: optional `docs/MIDAS Ticker Bar Roadmap.md` starten.

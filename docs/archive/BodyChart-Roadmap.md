# Body Chart Roadmap (Arzt-Ansicht)

Wichtige Dateien (aktuell)
- `app/modules/doctor-stack/charts/index.js` (Chart-Logik: Serien, Tooltip, KPI-Header)
- `app/modules/doctor-stack/charts/chart.css` (Chart-Layout, Legend, Tooltip, Bars)
- `index.html` (Chart-Panel Markup, Controls/Legend)
- `app/styles/base.css` (Chart-Farbvariablen)
- `app/modules/doctor-stack/doctor/index.js` (Zeitraum-Filter; Quelle fuer von/bis)
- `docs/Trendpilotrefactor.md` (Referenz fuer Chart-Kontext in Arzt-Ansicht)

Ziel
- Arzt-Ansicht liefert eine medizinisch sinnvollere Body-Chart-Darstellung.
- Trends werden aus dem selektierten Zeitraum berechnet (on-the-fly).
- BMI/WHtR bleiben Snapshot (letzter Messwert), Trendpfeile basieren auf Zeitraum.
- Layer 2 (BIA-Balken) ist per Default OFF, bewusst zuschaltbar.

Scope
- Trendberechnungen fuer BMI/WHtR und Muskelstatus basierend auf dem selektierten Zeitraum.
- Layer-2 Toggle platzieren und visuell integrieren.
- Muskelstatus als Trend (prozentuale Aenderung) in der Kopfzeile anzeigen.
- Layer 3: dezente Muskelstatus-Linie im Chart (Trenddarstellung, keine Rohwerte).
- Tooltip/Legend-Labels fuer BIA-Rohwerte klar markieren.
- Keine kosmetischen Redesigns, sondern klare, klinisch lesbare Darstellung.

Nicht im Scope
- Neue Datenquellen oder Backend-Aenderungen.
- Diagnosen, automatische Interpretation oder Alerts.
- Neue Visualisierungsformate ausserhalb des bestehenden Chart-Panels.

Annahmen
- Der Zeitraum (von/bis) wird in der Arzt-Ansicht gesetzt und ist der primare Kontext.
- Gewicht/Bauchumfang sind direkte Messwerte, BIA-Werte sind Schaetzwerte.
- Glattungen dienen nur der Trendanzeige, nicht der Anzeige von Einzelwerten.

Deterministische Hauptsteps

1) IST-Zustand sauber dokumentieren (done)
  1.1 Kurz-Zusammenfassung der aktuellen Serien (Gewicht/Bauchumfang als Linien, BIA als Balken). (done)
  1.2 Tooltip-Logik fuer Body-Details (Gewicht, Bauchumfang, Fett, Muskel) festhalten. (done)
  1.3 KPI-Header (BMI/WHtR als letzter Messwert) festhalten. (done)

2) Trend-Definitionen finalisieren (Zeitraum-basiert) (done)
  2.1 BMI/WHtR: Snapshot bleibt letzter Messwert; Trendpfeil = erster vs letzter Wert im Zeitraum. (done)
  2.2 Muskelstatus: Rohwert = Gewicht - Fettmasse (intern). (done)
  2.3 Glaettung: Rolling Median der letzten 4 Messungen (nur fuer Trend). (done)
  2.4 Trendwert: ((Ende - Start) / Start) * 100, als Prozent in Header. (done)
  2.5 Zeitraum-Label fuer Tooltip/Detailtext definieren (z. B. "Zeitraum: <von> - <bis>"). (done)

3) UI-Layout: Layer-2 Toggle platzieren (Default OFF)
  3.1 Platzierung: KPI-Leiste rechts neben BMI/WHtR/Muskelstatus,
      als kompakter Switch (Label: "BIA (kg)"). (done)
  3.2 Toggle beeinflusst nur Layer 2 (BIA-Balken); Linien bleiben immer sichtbar. (done)
  3.3 Legend/Label im Chart: "BIA-Schaetzwerte (kg), roh - nicht geglaettet". (done)

4) Header-KPIs erweitern (done)
  4.1 BMI/WHtR Anzeige: "BMI (letzter): 27.1" + Trendpfeil aus Zeitraum. (done)
  4.2 Muskelstatus Anzeige: "Muskeln (Zeitraum): +2 %". (done)
  4.3 Keine Roh-kg im Header, keine neuen Fachbegriffe (FFM bleibt intern). (done)

5) Tooltip-Details fuer Kontext
  5.1 Body-Tooltip um kurze BIA-Info ergaenzen (z. B. "BIA-Schaetzung (Trend)"). (done)
  5.2 Wenn Muskelstatus angezeigt wird, optionaler Tooltip-Block mit Zeitraum + Glaettung. (done)

6) QA / Validierung
  6.1 Zeitraum-Aenderung (z. B. 90 Tage, 6 Monate) aktualisiert alle Trends konsistent.
  6.2 BMI/WHtR Snapshot bleibt letzter Messwert, Trendpfeil reagiert auf Zeitraum.
  6.3 Toggle OFF = keine BIA-Balken; Toggle ON = Balken sichtbar + Label vorhanden.
  6.4 Tooltip zeigt korrekte Werte und Kontext pro Datum.
  6.5 Keine Regression bei BP-Chart (unveraendert).

Offene Fragen (vor Implementierung klaeren)
- n/a

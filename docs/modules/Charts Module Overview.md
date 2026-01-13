# Charts Module - Functional Overview

Kurze Einordnung:
- Zweck: Visualisierung von BP- und Body-Daten inkl. Tooltip/KPIs.
- Rolle innerhalb von MIDAS: Read-Only Diagramme fuer Arzt/Patient.
- Abgrenzung: keine Datenerfassung; nur Rendering.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Body Chart Roadmap](../BodyChart-Roadmap.md)

---

## 1. Zielsetzung

- Problem: Werte eines Zeitraums klar und interaktiv darstellen.
- Nutzer: Patient und Arzt (Analyse/Review).
- Nicht Ziel: Speichern oder Bearbeiten von Daten.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/doctor-stack/charts/index.js` | Chart-Controller, Rendering, Tooltip, KPIs |
| `app/modules/doctor-stack/charts/chart.css` | Chart Styles (Panel, Tooltip, Bands) |
| `app/modules/doctor-stack/doctor/index.js` | Doctor-Panel oeffnet Chart-Panel |
| `app/supabase/api/vitals.js` | Daily-Overview (BP/Body) via Views |
| `app/modules/vitals-stack/trendpilot/index.js` | Trendpilot-Bands fuer BP-Chart |

---

## 3. Datenmodell / Storage

- Keine eigene Persistenz.
- Daten kommen aus Supabase (Views) oder Local (fallback via `getFiltered`).
- Body-Werte basieren auf `v_events_body` (kg/cm/fat_pct/muscle_pct + fat_kg/muscle_kg berechnet).

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- `chartPanel.init()` bindet DOM, Tooltip, Events.

### 4.2 User-Trigger
- Doctor-Panel: Button `Werte anzeigen`.
- Metric-Select (`#metricSel`) wechselt zwischen BP/Body.
- Body-Comp Toggle (BIA) erscheint nur im Body-Chart.

### 4.3 Verarbeitung
- `getFiltered()` laedt Range-Daten (Supabase oder Local).
- `draw()` berechnet Scales, rendert SVG, KPI-Box, Tooltip.
- Trendpilot-Bands werden fuer BP eingeblendet.
- Body-Chart: Gewicht/Bauchumfang als Linien, BIA-Werte optional als Balken (Toggle).
- Muskelstatus-Trend als dezente Linie (Rolling-Median, Zeitraum-basiert).

### 4.4 Persistenz
- Keine Persistenz.

---

## 5. UI-Integration

- Chart-Panel `#chart` mit SVG `#chartSvg`.
- Tooltip `#chartTip` + Live-Region `#chartAria`.
- KPI-Box `#chartAverages`.
- KPI-Header: BMI/WHtR Snapshot mit Trendpfeil; Muskelstatus als Prozenttrend mit Gewichtsdifferenz im Zeitraum.

---

## 6. Arzt-Ansicht / Read-Only Views

- Chart wird aus Doctor-Ansicht geoeffnet und nutzt deren Range.
- BMI/WHtR basieren auf letztem Messwert; Trendpfeile basieren auf erstem vs letztem Wert im Zeitraum.
- Muskelstatus wird aus Body-Messungen (kg + BIA) geglaettet und als Trend angezeigt, inklusive Gewichtsdifferenz im Header.

---

## 7. Fehler- & Diagnoseverhalten

- `diag.add` bei Trendpilot-Band- oder Render-Fehlern.
- Fallbacks bei fehlenden DOM-Elementen.
- Body-Tooltip enthaelt Hinweis auf BIA-Schaetzung und Glaettung, wenn Body-Comp vorhanden ist.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.charts.chartPanel.show/draw`, Doctor Chart-Button.
- Source of Truth: Range aus Doctor-Ansicht, Daten via `getFiltered`.
- Side Effects: `diag.add` Logs, Trendpilot-Bands geladen.
- Constraints: Chart-DOM erforderlich, Metrics nur BP/Body.
- `requestUiRefresh({ chart: true })` triggert `chartPanel.draw()`.
- Trendpilot-Bands via `loadTrendpilotBands`.

---

## 9. Erweiterungspunkte / Zukunft

- Export (SVG/PNG).
- Weitere Metriken.
- Konfigurierbare Range-Presets.
- Optional: Layer 3 deaktivierbar, falls visuell zu dominant.

---

## 10. Feature-Flags / Konfiguration

- `SHOW_CHART_ANIMATIONS`.
- `SHOW_BODY_COMP_BARS`.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): Doctor-Range, BP/Body APIs (`app/supabase/api/vitals.js`), Chart-DOM.
- Dependencies (soft): Trendpilot-Bands.
- Known issues / risks: grosse Ranges -> Performance; leere Daten -> leere Charts.
- Backend / SQL / Edge: Reads via Supabase APIs (keine eigene SQL).

---

## 12. QA-Checkliste

- Chart laedt fuer gewaehlten Range.
- Tooltips/Keyboard funktionieren.
- Trendpilot-Bands sichtbar bei BP.
- Body-Comp Toggle steuert BIA-Balken; Muskelstatus/Trendpfeile folgen dem Range.

---

## 13. Definition of Done

- Chart-Panel stabil und interaktiv.
- Keine Render-Fehler im diag.
- Doku aktuell.

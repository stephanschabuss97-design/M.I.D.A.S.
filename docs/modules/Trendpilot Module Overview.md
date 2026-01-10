# Trendpilot Module - Functional Overview

Kurze Einordnung:
- Zweck: Trendanalyse ueber Wochenfenster (BP/Body/Lab + Combined).
- Rolle innerhalb von MIDAS: erzeugt Trendpilot-Events + UI-Hinweise (Capture/Doctor/Charts/Hub).
- Abgrenzung: keine Echtzeit-Spike-Alerts; keine Diagnosen/Therapieentscheidungen.

Related docs:
- [Bootflow Overview](bootflow overview.md)

---

## 1. Zielsetzung

- Problem: mittel- bis langfristige BP-Trends erkennen und sichtbar machen.
- Nutzer: Patient (Pill/Feedback) und Arzt (Trendpilot-Block).
- Nicht Ziel: Diagnosen oder Therapieentscheidungen.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/vitals-stack/trendpilot/data.js` | Trend-Berechnung (Baseline, Window, Deltas) |
| `app/modules/vitals-stack/trendpilot/index.js` | Orchestrator, Supabase-Integration, Dialoge |
| `supabase/functions/midas-trendpilot/index.ts` | Edge Function (Trendpilot Engine, Scheduler Target) |
| `app/supabase/api/trendpilot.js` | API fuer Events + Ack (`fetchTrendpilotEventsRange`, `setTrendpilotAck`) |
| `sql/14_Trendpilot.sql` | Trendpilot DB Schema (`trendpilot_events`, `trendpilot_state`) |
| `app/modules/doctor-stack/doctor/index.js` | Trendpilot-Block in Arzt-Ansicht |
| `app/modules/vitals-stack/vitals/index.js` | Capture-Pill + `trendpilot:latest` Hook |
| `app/modules/doctor-stack/charts/index.js` | Trendpilot-Bands im BP-Chart |
| `app/styles/doctor.css` | Trendpilot-Block Styling |
| `app/styles/ui.css` | Trendpilot-Dialog/Overlay Styling |

---

## 3. Datenmodell / Storage

- Tabellen: `trendpilot_events`, `trendpilot_state`
- Events: `trendpilot_events` (info/warning/critical, window_from/window_to, ack/ack_at).
- View: `trendpilot_events_range` als standardisierte Range-Query (Sortierung + Severity-Filter).
- State: `trendpilot_state` (Baseline/Normalisierung pro Typ).

### 3.1 Event-Shape (Payload)
Minimaler Kern:
- `type`: bp|body|lab|combined
- `severity`: info|warning|critical
- `window_from/window_to`: Wochenfenster (ISO date)
- `payload.rule_id`: eindeutige Regel-ID
- `payload.*`: Kennzahlen (Baseline, Deltas, Wochen, IDs)
- `payload.context` (optional): Kontext-Objekt fuer Korrelationen (nur warning/critical, kein info)

Beispiele:
- `bp-trend-v1`: baseline_sys/dia, avg_sys/dia, delta_sys/dia, weeks
- `body-weight-trend-v1`: baseline_kg, avg_kg, delta_kg, weeks
- `lab-egfr-creatinine-trend-v1`: baseline_egfr/creatinine, avg_egfr/creatinine, delta_egfr/creatinine, weeks
- `bp-weight-correlation-v1`: bp_event_ids, body_event_ids, weight_delta_kg, window_days
- `baseline-normalized-v1`: baseline_from, baseline_sys/dia, sample_weeks (+ prev-baseline Felder)

### 3.3 Kontext-Objekt (optional, nur warning/critical)
Kontext ist ein Zusatzsatz zur Einordnung, keine Diagnose. Er wird nur bei warning/critical angehaengt.

Beispielstruktur:
```
context: {
  context_window_weeks: 4,
  context_window_to: "YYYY-MM-DD",
  activity: { level: "low|ok|high|unknown", sessions_4w: 3, weeks_with_entries_4w: 2 },
  bodycomp: { muscle_trend: "up|flat|unknown", fat_trend: "up|flat|unknown", samples: 2 },
  weight: { trend: "up|flat|unknown", waist_trend: "up|flat|unknown" },
  lab: { egfr_trend: "down|flat|unknown", days_from_window: 7 }
}
```

Prioritaet (max. 1 Satz):
1) Gewicht + Bauchumfang
2) Gewicht + Aktivitaet niedrig
3) Gewicht + Aktivitaet hoch + Muskelmasse
4) Gewicht + Aktivitaet hoch + Fettanteil
5) Gewicht + Aktivitaet hoch, Body-Comp fehlt
6) Lab-Naehe (eGFR ruecklaeufig)

### 3.4 Kontext-Gates (v1)
- Kontextfenster: 4 Wochen bis `context_window_to`.
- Aktivitaet: Gate erfuellt, wenn >= 2 Wochen mit Eintrag oder >= 4 Sessions; Level high/ok/low erst danach.
- Body-Comp: mindestens 2 Messungen mit >= 14 Tagen Abstand.
- Gewichtstrend: min. 2 Messungen mit >= 14 Tagen Abstand.
- Lab-Kontext: mind. 2 Samples im Kontextfenster.

### 3.2 Dedupe-Strategie
- Unique: `user_id + type + window_from + severity`
- Updates erweitern `window_to`, Payload wird gemerged.
- Ack bleibt erhalten (ack/ack_at), auch wenn Event spaeter erweitert wird.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Trendpilot initialisiert via `app/modules/vitals-stack/trendpilot/index.js`.
- Stub-API, wenn Abhaengigkeiten fehlen.

### 4.2 Trigger
- Scheduler (GitHub Actions Cron) ruft die Edge Function woechentlich auf.
- Optional manueller Call (z.B. Debug/Dry-Run).

### 4.3 Verarbeitung
- Edge Function berechnet Wochenfenster + Deltas und schreibt Events.
- Severity: `info | warning | critical` (alle werden persistiert).
- `warning/critical` -> Trendpilot-Event + Ack-Dialog.
- `info` -> Trendpilot-Event fuer System-Kommentare (kein Popup).
- Kontext wird nur an warning/critical angehaengt.

### 4.4 Normalisierung (Baseline Reset)
- Wenn es Alerts gab und die letzten 6 Wochen stabil sind, wird die Baseline neu gesetzt.
- Dabei wird ein `info`-Event `baseline-normalized-v1` geschrieben.

### 4.4 Persistenz
- `trendpilot_events` speichert Events inkl. Ack/Ack_at.
- `trendpilot_state` speichert Baseline/Normalisierung.

---

## 5. UI-Integration

- Capture-Pill zeigt letzte Trendpilot-Meldung.
- Doctor-Ansicht listet Trendpilot-Hinweise (Akkordeon).
- Hub zeigt Popup bei warning/critical + Start/Ende-Toast (dedupe).
- Hub-Glow faerbt sich bei aktivem Trend nach Severity (warning=gelb, critical=rot).
- BP-Chart zeigt Trendpilot-Bands + Legende.
- Kontextsatz erscheint in Popup/Arzt/Chart nur bei warning/critical (nicht fuer info/combined/lab).

---

## 6. Arzt-Ansicht / Read-Only Views

- Trendpilot-Block mit Severity, Zeitraum, Text.
- Akkordeon offen wenn mind. ein Eintrag nicht bestaetigt.
- Ack-Button wird zu "Bestaetigt", Loeschen ist separat.
- Popup ist modal: nur "Zur Kenntnis genommen" setzt Ack (Hintergrund/ESC schliessen nicht).

---

## 7. Fehler- & Diagnoseverhalten

- `diag.add` bei fehlenden Dependencies oder Netzwerkfehlern.
- Not enough data -> Toast, kein Kommentar.
- Hook-Fehler -> `[trendpilot] hook failed`.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.trendpilot.refreshLatestSystemComment`.
- Source of Truth: `trendpilot_events` (info/warning/critical).
- Side Effects: emits `trendpilot:latest`, opens ack dialog (nur warning/critical).
- Ongoing-Logik in der App: Trend aktiv, wenn `window_to >= heute` (ISO-Tag).
- Hub-Glow reagiert auf `trendpilot:latest` und Severity.
- Popup-Trigger wird nach Bootflow `IDLE` sowie nach Auth-Decision erneut angestossen.
- Constraints: braucht genug Wochen Daten, depende on Supabase exports.
- `trendpilot:latest` Event fuer Capture-Pill.
- `fetchTrendpilotEventsRange` fuer Doctor-Block.
- `loadTrendpilotBands` fuer Charts.

---

## 9. Erweiterungspunkte / Zukunft

- Weitere Metriken (Body/Weight).
- Optional: Urinteststreifen 1x pro Monat (nach aerztlicher Abklaerung).
- KI-Textgenerierung im Payload.
- Intake bleibt Tages-UI und ist bewusst nicht Teil der Trendpilot-Korrelationen.

## 9.1 Aktuelle Schwellen / Gates (v1)

- BP: Warning ab +8 sys oder +5 dia ueber Baseline; Critical ab >=140/90 oder +15/+10 ueber Baseline.
- Body (Gewicht): Warning ab +1.2 kg, Critical ab +2.0 kg (jeweils Wochenmittel, Trend >= 2 Wochen).
- Lab: Evaluation nur bei >=2 Messungen (Range) und >=2 Messungen im Baseline-Slice.
- Combined (BP x Gewicht): nur wenn weight_delta_kg >= 1.5; Critical bei BP critical oder weight_delta_kg >= 2.0.
- Normalisierung: 6 stabile Wochen ohne Alerts nach einer Alert-Phase.

## 9.2 Meldungen / Begruendungen (rule_id)

- `bp-trend-v1`: BP-Wochenmittel ueber Baseline (Delta + Schwelle), inkl. window_from/window_to.
- `body-weight-trend-v1`: Gewicht-Wochenmittel ueber Baseline, inkl. delta_kg und Dauer.
- `lab-egfr-creatinine-trend-v1`: eGFR/Kreatinin Trend inkl. Delta/Absolut-Grenzen.
- `bp-weight-correlation-v1`: Korrelation BP + Gewicht, inkl. weight_delta_kg und Event-IDs.
- `baseline-normalized-v1`: Baseline wurde nach stabilen Wochen neu gesetzt (info).

## 9.3 Begruendungstexte (App-Map)

Die App erzeugt Begruendungstexte anhand `rule_id` + Payload. Quelle ist eine statische Map im Client (`app/modules/vitals-stack/trendpilot/index.js`).

| rule_id | Popup (kurz) | Arzt (detail) | Erwartete Payload-Felder |
|------|------|------|------|
| `bp-trend-v1` | BP-Wochenmittel ueber Baseline | Baseline/Delta/Dauer | baseline_sys, baseline_dia, avg_sys, avg_dia, delta_sys, delta_dia, weeks, window_from |
| `body-weight-trend-v1` | Gewicht-Wochenmittel ueber Baseline | Baseline/Delta/Dauer | baseline_kg, avg_kg, delta_kg, weeks, window_from |
| `lab-egfr-creatinine-trend-v1` | Labor-Trend auffaellig | Baseline/Delta/Dauer | baseline_egfr, baseline_creatinine, avg_egfr, avg_creatinine, delta_egfr, delta_creatinine, weeks, window_from |
| `bp-weight-correlation-v1` | BP + Gewicht korrelieren | Delta + Event-IDs | weight_delta_kg, window_from, window_to, bp_event_ids, body_event_ids |
| `baseline-normalized-v1` | Baseline neu gesetzt | Normalisierung/Info | baseline_from, baseline_sys, baseline_dia, sample_weeks, baseline_*_prev |
---

## 10. Feature-Flags / Konfiguration

- `TREND_PILOT_ENABLED` (Config/LocalStorage).

---

## 11. Status / Dependencies / Risks

- Status: Refactor abgeschlossen; Korrelationen (Kontext v1) umgesetzt.
- Dependencies (hard): BP-Daten, `trendpilot_events`/`trendpilot_state`, GitHub Actions Cron, Capture/Doctor/Charts Integration.
- Dependencies (soft): n/a.
- Known issues / risks: braucht genug Daten; false positives; Flag `TREND_PILOT_ENABLED` deaktivierbar.
- Backend / SQL / Edge: `trendpilot_events`/`trendpilot_state`, Edge Function `midas-trendpilot`.
- Hinweis: Bei Edge Functions mit Service-Role muss `user_id` explizit gesetzt werden, da `auth.uid()` leer ist.
- Deployment-Hinweis: `TRENDPILOT_USER_ID` als Pflicht-Env fuer Scheduler-Runs setzen.
- Security-Hinweis: `TRENDPILOT_CRON_SECRET` + Header `x-midas-cron-secret` fuer tokenlose Scheduler-Calls.
 - Scheduler-Hinweis: GitHub Actions nutzt UTC; Sommerzeit-Shift beachten.

### 11.1 Offene Punkte / Bedenken
- Zeitlogik: Ongoing-Check im Client basiert auf `window_to >= heute` (UTC). Falls strikte Wien-Zeit gewuenscht, muss der Vergleich angepasst werden.
- Popup ist strikt modal: nur "Zur Kenntnis genommen" schliesst (kein ESC, kein Overlay-Klick). Fuer spaetere Multi-User/Wearable evtl. zu hart.
- Encoding-Risiko: einzelne Dateien zeigen noch Legacy-Encoding-Artefakte; langfristig einmal konsistent UTF-8 pruefen.
- Info-Events: derzeit nur warning/critical im UI sichtbar; wenn info spaeter angezeigt werden soll, braucht es visuelle Differenzierung.

## 12. QA-Checkliste (Status)

- Edge Function deterministisch, idempotent, keine Duplikate. (done)
- Scheduler feuert zur korrekten Zeit. (done)
- Popup + Ack: End-to-End ok. (done)
- Arzt-Block: info/warning/critical sichtbar; Popup nur warning/critical. (done)
- Chart-Bands: Zeitraum korrekt, Tooltip zeigt Kommentar. (done)
- Keine Regressionen in BP/Body/Lab Tabs. (done)

---

## 13. Definition of Done

- Trendpilot erzeugt konsistente Events.
- UI an allen Stellen synchron.
- Doku aktuell.


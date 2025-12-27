# Trendpilot Module - Functional Overview

Kurze Einordnung:
- Zweck: Trendanalyse fuer Blutdruck ueber Wochenfenster (Warnungen/Kritisch).
- Rolle innerhalb von MIDAS: erzeugt System-Kommentare + UI-Hinweise (Capture/Doctor/Charts).
- Abgrenzung: keine Echtzeit-Spike-Alerts; keine Datenspeicherung ausser System-Comments.

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
| `app/supabase/api/system-comments.js` | Persistenz fuer `system_comment` (Ack/Status) |
| `app/modules/doctor-stack/doctor/index.js` | Trendpilot-Block in Arzt-Ansicht |
| `app/modules/vitals-stack/vitals/index.js` | Capture-Pill + `trendpilot:latest` Hook |
| `app/modules/doctor-stack/charts/index.js` | Trendpilot-Bands im BP-Chart |
| `app/styles/doctor.css` | Trendpilot-Block Styling |
| `app/styles/ui.css` | Trendpilot-Dialog/Overlay Styling |

---

## 3. Datenmodell / Storage

- Tabelle: `health_events`
- Typ: `system_comment`
- Payload-Context: `ack`, `doctorStatus`.
- Subtypes: `warning`, `critical` (Trendpilot).

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Trendpilot initialisiert via `app/modules/vitals-stack/trendpilot/index.js`.
- Stub-API, wenn Abhaengigkeiten fehlen.

### 4.2 User-Trigger
- BP-Abendsave triggert `maybeRunTrendpilotAfterBpSave` (main.js).

### 4.3 Verarbeitung
- `runTrendpilotAnalysis(dayIso)` berechnet Wochenfenster + Deltas.
- Severity: `info | warning | critical`.
- `warning/critical` -> `system_comment` schreiben + Ack-Dialog.

### 4.4 Persistenz
- `upsertSystemCommentRemote` speichert `system_comment`.
- `setSystemCommentAck` setzt Ack-Flag nach Dialog.

---

## 5. UI-Integration

- Capture-Pill zeigt letzte Trendpilot-Meldung.
- Doctor-Ansicht listet Trendpilot-Hinweise.
- BP-Chart zeigt Trendpilot-Bands + Legende.

---

## 6. Arzt-Ansicht / Read-Only Views

- Trendpilot-Block mit Severity, Datum, Status-Buttons.
- Ack/Status via `setSystemCommentDoctorStatus`.

---

## 7. Fehler- & Diagnoseverhalten

- `diag.add` bei fehlenden Dependencies oder Netzwerkfehlern.
- Not enough data -> Toast, kein Kommentar.
- Hook-Fehler -> `[trendpilot] hook failed`.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.trendpilot.runTrendpilotAnalysis`, `refreshLatestSystemComment`.
- Source of Truth: `system_comment` entries (trendpilot subtype).
- Side Effects: emits `trendpilot:latest`, opens ack dialog.
- Constraints: braucht genug Wochen Daten, depende on Supabase exports.
- `trendpilot:latest` Event fuer Capture-Pill.
- `fetchSystemCommentsRange` fuer Doctor-Block.
- `loadTrendpilotBands` fuer Charts.

---

## 9. Erweiterungspunkte / Zukunft

- Weitere Metriken (Body/Weight).
- KI-Textgenerierung im Payload.

---

## 10. Feature-Flags / Konfiguration

- `TREND_PILOT_ENABLED` (Config/LocalStorage).

---

## 11. Status / Dependencies / Risks

- Status: aktiv (BP-only).
- Dependencies (hard): BP-Daten, `system_comment` Storage, Capture/Doctor/Charts Integration.
- Dependencies (soft): n/a.
- Known issues / risks: braucht genug Daten; false positives; Flag `TREND_PILOT_ENABLED` deaktivierbar.
- Backend / SQL / Edge: `system_comment` in `health_events`, API `app/supabase/api/system-comments.js`.

---

## 12. QA-Checkliste

- Genug Wochen -> Systemkommentar erstellt.
- Warning/Critical zeigen Dialog.
- Capture-Pill/Doctor/Chart synchron.

---

## 13. Definition of Done

- Trendpilot erzeugt konsistente System-Kommentare.
- UI an allen Stellen synchron.
- Doku aktuell.


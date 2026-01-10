# Diagnostics Module - Functional Overview

Kurze Einordnung:
- Zweck: Touch-Log, Fehleranzeigen und Performance-Sampling fuer Debug/QA.
- Rolle innerhalb von MIDAS: zentrale Diagnose-Schnittstelle fuer alle Module.
- Abgrenzung: kein Business-Output, keine Produktfeatures.

Related docs:
- [Bootflow Overview](bootflow overview.md)

---

## 1. Zielsetzung

- Problem: sichtbare und strukturierte Diagnosen fuer Entwickler/QA.
- Nutzer: Dev/QA (Touch-Log, Perf, Error-UI).
- Nicht Ziel: Produktive Telemetrie/Analytics.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/core/diag.js` | diag-API, uiError/uiInfo, perfStats Proxy |
| `app/core/config.js` | Flag `DIAGNOSTICS_ENABLED` |
| `app/diagnostics/logger.js` | Ringbuffer-Logger (diagnosticsLayer.logger) |
| `app/diagnostics/perf.js` | Perf-Sampler (diagnosticsLayer.perf) |
| `app/diagnostics/monitor.js` | Heartbeat/Monitor (diagnosticsLayer.monitor) |
| `app/core/boot-flow.js` | Boot-Fehleroverlay mit Touch-Log | 
| `index.html` | Touch-Log Panel + Script-Reihenfolge |
| `app/styles/utilities.css` | Touch-Log Styling |
| `app/styles/ui.css` | Diagnostics Overlay Styles |

---

## 3. Datenmodell / Storage

- Ringbuffer im Logger (max Entries) + Perf-Samples im RAM.
- Keine persistente Speicherung.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- `diag.js` prueft `DIAGNOSTICS_ENABLED`.
- Wenn deaktiviert: Stub-API.
- Wenn aktiv: diag + diagnosticsLayer (logger/perf/monitor) werden gebunden.

### 4.2 User-Trigger
- Oeffnen/Schliessen des Touch-Log Panels.
- Boot-Error Panel oeffnet diag bei Fehlern.

### 4.3 Verarbeitung
- `diag.add` schreibt UI-Log + forwarded an diagnosticsLayer.logger.
- `recordPerfStat` schreibt in diagnosticsLayer.perf.
- `monitor.heartbeat` wird bei Log-Events getriggert.

### 4.4 Persistenz
- Keine Persistenz.

---

## 5. UI-Integration

- Touch-Log Panel (`#diag` + `#diagLog`).
- Floating/Quickbar Trigger fuer Diagnostics.

---

## 6. Arzt-Ansicht / Read-Only Views

- Nicht relevant.

---

## 7. Fehler- & Diagnoseverhalten

- `diag.add` + `uiError` bei Fehlern.
- Guarded Fallbacks wenn Diagnostics deaktiviert sind.
- Unhandled Rejections werden gemeldet.

---

## 8. Events & Integration Points

- Public API / Entry Points: `diag.add`, `uiError`, `uiInfo`, `recordPerfStat`.
- Source of Truth: diagnosticsLayer logger/perf (RAM).
- Side Effects: Touch-Log UI updates, monitor heartbeat.
- Constraints: `DIAGNOSTICS_ENABLED` kann Stub-API erzwingen.
- `diag.add` wird von allen Modulen genutzt.
- `recordPerfStat` wird von Charts/Capture genutzt.
- Boot-Flow ruft `diag.show()` bei Fehlerzustand.

---

## 9. Erweiterungspunkte / Zukunft

- Remote-Upload fuer Logger/Perf.
- Overlay fuer Monitor-Status.
- Konfigurierbare Perf-Keys.

---

## 10. Feature-Flags / Konfiguration

- `DIAGNOSTICS_ENABLED` (Config/LocalStorage).

---

## 11. Status / Dependencies / Risks

- Status: aktiv (Dev/QA).
- Dependencies (hard): diag Core, diagnosticsLayer, `DIAGNOSTICS_ENABLED`.
- Dependencies (soft): n/a.
- Known issues / risks: deaktiviert -> weniger Sichtbarkeit; aktiviert -> leichte Perf-Kosten.
- Backend / SQL / Edge: n/a.

---

## 12. QA-Checkliste

- `DIAGNOSTICS_ENABLED=false` -> Stub-API.
- Touch-Log zeigt neue Entries.
- Perf-Samples sind abrufbar.
- Boot-Error Panel oeffnet Touch-Log.

---

## 13. Definition of Done

- Diagnostics-Layer laeuft stabil.
- Keine Error-Spam bei deaktiviertem Flag.
- Doku aktuell.


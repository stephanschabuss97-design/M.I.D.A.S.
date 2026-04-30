# Diagnostics Module - Functional Overview

Kurze Einordnung:
- Zweck: Diagnose-Core, Fehleranzeigen und Performance-Sampling fuer Debug/QA.
- Rolle innerhalb von MIDAS: zentrale Diagnose-Schnittstelle fuer alle Module.
- Abgrenzung: kein Business-Output, keine Produktfeatures, nicht die sichtbare Maintenance-Surface selbst.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Android Native Auth Module Overview](Android Native Auth Module Overview.md)
- [Touchlog Module Overview](Touchlog Module Overview.md)

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
| `app/modules/touchlog/index.js` | sichtbare Touchlog-Maintenance-Surface |
| `app/diagnostics/devtools.js` | Thin Bootstrap fuer historische Touchlog-Initialisierung |
| `app/core/boot-flow.js` | Boot-Fehleroverlay + Fallback-Log + zentrale Error-Route |
| `index.html` | Touch-Log Panel + Script-Reihenfolge |
| `app/styles/base.css` | Bootscreen + Boot-Error-Fallback-Log Styling |
| `app/styles/auth.css` | Diagnostics Panel Layout + Toggles |
| `android/app/src/main/java/de/schabuss/midas/diag/AndroidBootTrace.kt` | nativer Android-Boot-/Crash-Trace mit JSON-Output |
| `android/app/src/main/java/de/schabuss/midas/MidasAndroidApp.kt` | globaler nativer Crash-Hook |

---

## 3. Datenmodell / Storage

- Ringbuffer im Logger (max Entries) + Perf-Samples im RAM.
- Keine persistente Speicherung im Diagnostics-Layer selbst.
- Bootflow speichert zusaetzlich die letzten 3 Boot-Fehler in `localStorage` (separate Boot-Historie).
- Der Android-Node besitzt zusaetzlich einen getrennten nativen Diagnosepfad:
  - JSON-Trace im Download-Ordner
  - Crash-Dateien bei uncaught exceptions
  - kleine Summary in `MainActivity`

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- `diag.js` prueft `DIAGNOSTICS_ENABLED`.
- Wenn deaktiviert: Stub-API.
- Wenn aktiv: diag + diagnosticsLayer (logger/perf/monitor) werden gebunden.
- `diag.init()` ist idempotent ausgelegt (kein mehrfaches Close-Handler-Binding).
- `diag.show()` versucht lazy `init()`, falls das Panel noch nicht gebunden ist.

### 4.2 User-Trigger
- Oeffnen/Schliessen des Touch-Log Panels.
- Boot-Error Panel versucht zuerst `diag.show()`.
- Falls `diag` nicht verfuegbar/oeffnbar ist, zeigt Bootflow einen Fallback-Log direkt im Error-Panel.

### 4.3 Verarbeitung
- `diag.add` schreibt UI-Log + forwarded an diagnosticsLayer.logger.
- `recordPerfStat` schreibt in diagnosticsLayer.perf.
- `monitor.heartbeat` wird bei Log-Events getriggert.
- Der produktive Voice-Adapter nutzt denselben Perf-Sampler jetzt auch fuer kleine Latenzsegmente innerhalb des Push-to-talk-Flows.

### 4.4 Persistenz
- Keine Persistenz.
- Ausnahme:
  - der native Android-Diagnosepfad persistiert Trace-/Crash-Daten absichtlich dateibasiert fuer On-Device-Debugging.

---

## 5. UI-Integration

- Touchlog UI (`#diag`) ist die sichtbare Maintenance- und Log-Oberflaeche.
- Details zu Touchlog-Layout, Push-Wartung, lokalen Diagnosemodi und Hilfsaktionen stehen im eigenen [Touchlog Module Overview](Touchlog Module Overview.md).
- Floating/Quickbar Trigger fuer Diagnostics.

---

## 6. Arzt-Ansicht / Read-Only Views

- Nicht relevant.

---

## 7. Fehler- & Diagnoseverhalten

- `diag.add` + `uiError` bei Fehlern.
- Guarded Fallbacks wenn Diagnostics deaktiviert sind.
- Unhandled Rejections werden gemeldet.
- Boot-Fehler laufen zentral ueber `bootFlow.reportError(...)` mit normalisiertem Payload (`message`, `detail`, `phase`, `stack`, `timestamp`).
- Duplicate-Guard im Bootflow reduziert Mehrfach-Fehler-Spam mit identischer Signatur.
- Sehr fruehe Fehler (vor normaler Panel-Verfuegbarkeit) koennen ueber ein minimales Plaintext-Overlay (`#earlyBootErrorFallback`) sichtbar gemacht werden.

---

## 8. Events & Integration Points

- Public API / Entry Points: `diag.add`, `uiError`, `uiInfo`, `recordPerfStat`.
- UI-nahe Entry Points fuer den Touchlog: `diag.show`, `diag.hide`, `diag.clear`.
- Source of Truth: diagnosticsLayer logger/perf (RAM).
- Side Effects: Touch-Log UI updates, monitor heartbeat.
- Constraints: `DIAGNOSTICS_ENABLED` kann Stub-API erzwingen.
- `diag.add` wird von allen Modulen genutzt.
- `recordPerfStat` wird von Charts/Capture genutzt.
- Boot-Flow nutzt `bootFlow.reportError(...)` als zentralen Fehler-Entry-Point.
- Boot-Flow ruft `diag.show()` bei Fehlerzustand und hat einen UI-Fallback, falls das nicht greift.
- Boot-Flow stellt `bootFlow.getErrorHistory()` und `bootFlow.clearErrorHistory()` fuer persistente Fehlerhistorie bereit.
- Boot-Flow hat einen Early-Fallback fuer Fehler vor regularem Boot-Error-Panel (`#earlyBootErrorFallback`).
- Android nutzt fuer denselben Zweck keinen Web-Overlay-Pfad, sondern:
  - `midas-android-latest-trace.json`
  - `midas-android-crash-YYYYMMDD-HHMMSS.json`
  - plus sichtbare Summary in der nativen `MainActivity`

---

## 9. Erweiterungspunkte / Zukunft

- Remote-Upload fuer Logger/Perf.
- Overlay fuer Monitor-Status.
- Konfigurierbare Perf-Keys.
- Weitere sichtbare Maintenance-Funktionen gehoeren zuerst in den Touchlog-Vertrag, nicht direkt in den Diagnostics-Core.
- Bei Bedarf spaeter verdichtete Voice-Perf-Auswertung fuer:
  - `voice_tap_to_listening`
  - `voice_first_speech_to_stop`
  - `voice_stop_to_transcribe_response`
  - `voice_transcribe_to_reply_ready`
  - `voice_reply_ready_to_tts_complete`

---

## 10. Feature-Flags / Konfiguration

- `DIAGNOSTICS_ENABLED` (Config/LocalStorage).
- `FEEDBACK_SOUND_ENABLED`, `FEEDBACK_HAPTIC_ENABLED` (via Dev-Toggles).
- `DEV_NOCACHE_ASSETS` (CSS Cache-Buster).

---

## 11. Status / Dependencies / Risks

- Status: aktiv (Dev/QA).
- Dependencies (hard): diag Core, diagnosticsLayer, `DIAGNOSTICS_ENABLED`.
- Dependencies (soft): n/a.
- Known issues / risks: deaktiviert -> weniger Sichtbarkeit; aktiviert -> leichte Perf-Kosten; Web- und Android-Diagnosepfad sind bewusst getrennt und muessen im Fehlerfall als zwei unterschiedliche Kontexte gelesen werden.
- Backend / SQL / Edge: n/a.

---

## 12. QA-Checkliste

- `DIAGNOSTICS_ENABLED=false` -> Stub-API.
- Touch-Log zeigt neue Entries.
- `diag.clear()` leert nur lokale Log-Anzeige und lokale Log-Indizes.
- Perf-Samples sind abrufbar.
- Boot-Error Panel: `Touch-Log oeffnen` oeffnet `#diag` oder zeigt Fallback-Log.
- Im Zustand `boot_error` liegt `#diag` visuell ueber `#bootScreen` und bleibt bedienbar.
- `bootFlow.getErrorHistory()` ist auf 3 Eintraege begrenzt; `bootFlow.clearErrorHistory()` leert die Historie persistiert.
- Duplicate-Bootfehler mit identischer Signatur werden unterdrueckt und verursachen keinen History-Spam.

---

## 13. Definition of Done

- Diagnostics-Layer laeuft stabil.
- Keine Error-Spam bei deaktiviertem Flag.
- Doku aktuell.


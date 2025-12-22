# VAD Module - Functional Overview

Kurze Einordnung:
- Zweck: Voice Activity Detection fuer Sprachaufnahme im Voice-Modul (geparkt).
- Rolle innerhalb von MIDAS: erkennt Speech/Silence und stoppt Recording bei Stille.
- Abgrenzung: kein Speech-to-Text, kein Audio-Upload, keine Transkription.

---

## 1. Zielsetzung

- Problem: Aufnahme automatisch stoppen, wenn Nutzer aufhoert zu sprechen.
- Nutzer: Patient (spricht), System (steuert Recording).
- Nicht Ziel: Sprachverarbeitung, ASR, Audioanalyse ausserhalb VAD.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/assistant-stack/vad/vad.js` | VAD-Controller (Start/Stop, Gate-Check, Fallback) |
| `app/modules/assistant-stack/vad/vad-worklet.js` | AudioWorklet Processor fuer Speech-Detection |
| `app/modules/assistant-stack/voice/index.js` | Voice-Flow, VAD-Anbindung, Silence-Timer (geparkt) |

---

## 3. Datenmodell / Storage

- Kein Storage.
- Keine Tabellen, keine Supabase-Events.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- `MidasVAD.createController()` wird aus `assistant-stack/voice/index.js` erstellt (geparkt).
- AudioContext wird lazy erstellt.
- Voice-Gate wird geprueft (Auth/Boot-Status).

### 4.2 User-Trigger
- Start der Sprachaufnahme triggert `vadCtrl.start(stream, onState)`.
- Stop der Aufnahme triggert `vadCtrl.stop()`.

### 4.3 Verarbeitung
- AudioWorklet verarbeitet Frames und sendet `vad-data` Events.
- Fallback: ScriptProcessor misst RMS und entscheidet Speech/Silence.
- `handleVadStateChange` im Hub setzt/loescht Silence-Timer.

### 4.4 Persistenz
- Keine Persistenz.

---

## 5. UI-Integration

- Unsichtbar fuer Nutzer; Teil des Voice-Flows im Voice-Modul.
- Beeinflusst Statuswechsel (Listening -> Idle) durch Auto-Stop.

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine.

---

## 7. Fehler- & Diagnoseverhalten

- Logs ueber `diag.add` und `console.warn`.
- Voice-Gate blockt Start (Error: `voice-not-ready`).
- Worklet-Fail -> Fallback ScriptProcessor.

---

## 8. Events & Integration Points

- Public API / Entry Points: `MidasVAD.createController`, `start/stop`.
- Source of Truth: AudioStream + VAD state in controller.
- Side Effects: triggers voice auto-stop via silence timer.
- Constraints: AudioContext required, voice gate must be allowed.
- Voice-Gate Hooks aus `AppModules.hub` (`getVoiceGateStatus`, `onVoiceGateChange`).
- VAD-Status ruft Callback `onStateChange('speech' | 'silence')`.

---

## 9. Erweiterungspunkte / Zukunft

- WASM-basierter VAD (webrtcvad) als optionaler Upgrade.
- Konfigurierbare Silence-Timeouts pro UI-Modus.
- Noise-Gate/Threshold dynamisch anpassen.

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Flags.
- Tuning ueber Optionen in `createController` (threshold, minSpeechFrames, minSilenceFrames).

---

## 11. Status / Dependencies / Risks

- Status: geparkt (Voice ist deaktiviert).
- Dependencies (hard): WebAudio + AudioWorklet, Hub Voice-Gate.
- Dependencies (soft): n/a.
- Known issues / risks: Browser-Support; Mic-Permission; Worklet-Fail (Fallback).
- Backend / SQL / Edge: n/a.

---

## 12. QA-Checkliste

- Voice-Start -> VAD laeuft, kein Fehler.
- Stille > Timeout -> Recording stoppt.
- Worklet-Fail -> Fallback aktiv.
- Voice-Gate sperrt Start korrekt.

---

## 13. Definition of Done

- VAD stoppt Aufnahme deterministisch bei Stille.
- Kein Error-Spam in diag/console.
- Dokumentation aktuell.


# VAD Module - Functional Overview

Kurze Einordnung:
- Zweck: Voice Activity Detection als Segment-Ende- und Auto-Stop-Helfer fuer Voice V1.
- Rolle innerhalb von MIDAS: erkennt Speech/Silence und hilft, Push-to-talk-Aufnahmen kontrolliert zu beenden.
- Abgrenzung: kein Wake-word, kein STT, kein TTS, kein Conversation-Manager.

Related docs:
- [Hub Module Overview](Hub Module Overview.md)
- [Assistant Module Overview](Assistant Module Overview.md)

---

## 1. Zielsetzung

- Problem: Voice-Aufnahmen sollen nach echter Sprechpause enden, ohne lange Morning-Saetze zu frueh abzuschneiden.
- Nutzer: Patient im Push-to-talk-Flow.
- Nicht Ziel: Always-on-Listening oder konversationelle Session-Steuerung.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/assistant-stack/vad/vad.js` | VAD-Controller, Gate-Check, Worklet-/Fallback-Start/Stop |
| `app/modules/assistant-stack/vad/vad-worklet.js` | AudioWorklet fuer Speech-/Silence-Signale |
| `app/modules/assistant-stack/voice/index.js` | VAD-Anbindung, Silence-Timer, Auto-Stop-Budget |

---

## 3. Ablauf / Logikfluss

### 3.1 Initialisierung

- `MidasVAD.createController()` wird aus dem Voice-Adapter erstellt.
- AudioContext wird lazy aufgebaut.
- Voice-Gate wird vor dem Start geprueft.

### 3.2 Verarbeitung

- VAD liefert nur `speech` oder `silence`.
- Das Voice-Modul entscheidet daraus den eigentlichen Auto-Stop.
- Worklet ist primaerer Pfad, ScriptProcessor ist Fallback.

### 3.3 Auto-Stop-Policy

- VAD stoppt nicht direkt selbst, sondern triggert die Silence-Logik im Voice-Adapter.
- Voice V1 nutzt jetzt eine dynamische Stop-Toleranz:
  - engeren Single-Command-Schnitt fuer sehr kurze Sprache
  - zusaetzlichen Kurzlauf-Schnitt fuer fruehe `bursts=2`-Utterances
  - mehr Toleranz bei mehreren Speech-Bursts
  - mehr Toleranz bei laengeren Sprachlaeufen
  - Schutz gegen zu fruehen Stop bei sehr kurzer Anfangssprache
- Der Voice-Adapter haelt dazu zusaetzlich `firstSpeechAt` und einen expliziten Silence-Recheck-Pfad, damit kurze Fruehsprache nicht in `listening` haengen bleibt oder zu frueh abgeschnitten wird.

Wichtige Architekturentscheidung:
- VAD ist Segment-Ende-Helfer.
- VAD ist kein Resume-/Conversation-Baustein.
- VAD verwirft keine bestaetigten Pending Contexts.

---

## 4. UI-Integration

- Keine direkte UI.
- Indirekte Wirkung:
  - Ende der Aufnahme
  - Uebergang von `listening` zu `transcribing`

---

## 5. Fehler- & Diagnoseverhalten

- Gate-Blocker erzeugen `voice-not-ready`.
- Worklet-Fail fuehrt in den RMS-Fallback.
- Auto-Stop-Entscheidungen koennen in `diag` sichtbar werden.
- Fuer Voice-Performance-Review laesst sich der VAD-Anteil jetzt indirekt ueber das Perf-Segment
  - `voice_first_speech_to_stop`
  gegen die restliche Voice-Kette abgrenzen.

---

## 6. Events & Integration Points

- Public API:
  - `MidasVAD.createController()`
  - `start(stream, onStateChange)`
  - `stop()`
- Integration:
  - Hub Voice-Gate API
  - Voice-Adapter Auto-Stop-Policy

---

## 7. Status / Dependencies / Risks

- Status: aktiv im produktiven Voice-V1-Pfad.
- Hard dependencies:
  - WebAudio
  - AudioWorklet oder ScriptProcessor-Fallback
  - Hub Voice-Gate
- Known risks:
  - Browser-/Mic-Variabilitaet
  - zu aggressive Thresholds
  - laute Umgebung / Noise

### 7.1 Future Hooks / Robustheitsgrenze

- Der aktuelle VAD-Schnitt ist auf produktive Kurzbefehle optimiert, aber nicht automatisch das Ende der Voice-Robustheitsarbeit.
- Spaetere reale Follow-up-Fragen koennen sein:
  - besseres Verhalten bei leiserem Sprechen
  - stabilere Segment-Ende-Entscheidungen in realen Umgebungsgeraeschen
  - feinere Trennung zwischen:
    - Akustik-/Noise-Problem
    - STT-/Transcript-Problem
    - semantischem Filler-/Intent-Problem
- Guardrail:
  - VAD ist nur eine Schicht der spaeteren Voice-Robustheit
  - nicht jeder Alltagsfehler gehoert automatisch in `vad.js`
  - natuerliche Einleitungsphrasen oder Filler sind primaer kein VAD-, sondern haeufig ein nachgelagerter Surface-/Semantik-Fall

---

## 8. QA-Checkliste

- Voice-Start -> VAD laeuft ohne Fehler.
- Stille fuehrt kontrolliert zum Auto-Stop.
- Laengere Morning-Saetze werden nicht zu frueh segmentiert.
- Kurze Anfangssprache fuehrt nicht zu einem haengenden `listening`-Zustand.
- Worklet-Fail aktiviert den Fallback.
- Voice-Gate blockt den Start korrekt.

---

## 9. Definition of Done

- VAD unterstuetzt Push-to-talk deterministisch.
- Auto-Stop ist fuer kurze und laengere Sprachlaeufe ausreichend stabil.
- Keine Conversation-/Resume-Altrolle mehr im Modulverstaendnis.
- Dokumentation ist auf dem aktuellen Voice-V1-Zuschnitt.

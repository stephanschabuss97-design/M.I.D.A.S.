# Hub Module - Functional Overview

Kurze Einordnung:
- Zweck: Zentrales Hub-Interface (Orbit, Panels, Quickbar) als Hauptnavigation.
- Rolle innerhalb von MIDAS: oeffnet Panels, orchestriert UI-Flow, Voice-Gate (via Voice-Modul), Assistant-Flow.
- Abgrenzung: keine eigenen Datenmodelle, keine Persistenz.

---

## 1. Zielsetzung

- Problem: konsistente Panel-Navigation und zentrale UI fuer Capture/Doctor/Assistant.
- Nutzer: Patient (Navigation) und System (UI-Flow).
- Nicht Ziel: Datenverarbeitung oder Supabase-Logik.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/hub/index.js` | Hub-Controller (Panels, Carousel, Quickbar, Voice-Adapter) |
| `app/modules/hub/hub-aura3d.js` | Aura-Canvas (3D/Noise) |
| `app/modules/assistant-stack/voice/index.js` | Voice-Flow (geparkt) |
| `app/modules/assistant-stack/vad/vad.js` | Voice Activity Detection (Auto-Stop) |
| `app/modules/assistant-stack/vad/vad-worklet.js` | AudioWorklet fuer VAD |
| `app/styles/hub.css` | Hub-Layout, Panels, Voice-States |
| `index.html` | Hub-Markup (Orbit, Panels, Quickbar) |

---

## 3. Datenmodell / Storage

- Kein Storage.
- Hub nutzt bestehende Module (Capture, Doctor, Assistant) fuer Daten.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Hub initialisiert Carousel, Quickbar, Panels und ruft (optional) das Voice-Modul.
- Panels bleiben im DOM und werden nur ein-/ausgeblendet.

### 4.2 User-Trigger
- Orbit-Buttons (`data-hub-module`) oeffnen Panels.
- Quickbar-Buttons oeffnen Panels oder Aktionen.
- Voice-Trigger ueber `assistant-voice` Button (geparkt).

### 4.3 Verarbeitung
- `setupIconBar` bindet Panel-Buttons und schliesst Panels.
- `setupCarouselController` verwaltet aktives Hub-Icon.
- `setupQuickbar` steuert verticale UI-Shift.
- Voice-Flow (geparkt): Recording -> Transcribe -> Assistant -> TTS.

### 4.4 Persistenz
- Keine Persistenz.

---

## 5. UI-Integration

- Hub ist zentrales Overlay mit Aura/Orbit und Panels.
- Panels: Intake, Vitals, Doctor, Profile, Appointments, Assistant.
- Assistant-Panel zeigt Butler-Header: Pills + Kontext-Extras + Termine + Expandable (Restbudget/Warnung) inkl. Mobile-Toggle.
- Voice-States steuern Visuals (`data-voice-state`).

---

## 6. Arzt-Ansicht / Read-Only Views

- Hub oeffnet die Arzt-Ansicht und steuert den Unlock-Flow.
- Chart-Button oeffnet Chart-Panel im Doctor-Kontext.

---

## 7. Fehler- & Diagnoseverhalten

- Fehler werden in `diag.add` und Konsole geloggt.
- Voice-Gate blockt bei Auth/Boot-Status (nur falls Voice reaktiviert wird).
- Panel-Open/Close schreibt Diagnoselog bei Fehlern.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.hub.openPanel`, `openDoctorPanel`, hub buttons (`data-hub-module`).
- Source of Truth: Hub DOM state (active panel), voice gate status (proxy).
- Side Effects: toggles body classes, voice state updates, panel open/close logs.
- Constraints: Doctor unlock required for doctor panel, voice gate blocks voice (nur wenn Voice aktiv).
- `requestUiRefresh({ doctor: true })` nach Panel-Aktionen.
- `assistant:action-*` Events werden im Hub verarbeitet.
- Voice-Gate API: `getVoiceGateStatus` / `onVoiceGateChange`.

---

## 9. Erweiterungspunkte / Zukunft

- Reaktivierung von Orbit-Hotspots.
- Mehr Panel-Module oder Quickbar-Aktionen.
- Feinere Voice-States/Animationen.

---

## 10. Feature-Flags / Konfiguration

- `DEV_ALLOW_DEFAULTS` (Debug/Defaults).
- Panel-Performance via `body[data-panel-perf]`.

---

## 11. Status / Dependencies / Risks

- Status: aktiv (Voice geparkt).
- Dependencies (hard): Hub DOM/Styles, Hub-Controller, Auth-Guard fuer Doctor, Assistant fuer Text.
- Dependencies (soft): zusaetzliche Panels (Future).
- Known issues / risks: fehlende DOM Hooks; Voice-Gate; UI-State Drift.
- Backend / SQL / Edge: n/a.

---

## 12. QA-Checkliste

- Orbit-Buttons oeffnen/close Panels korrekt.
- Quickbar oeffnet/schliesst per Swipe.
- Voice-Gate blockt Voice-Trigger bei `authState=unknown` (nur wenn Voice reaktiviert wird).
- Doctor-Panel oeffnet nur nach Unlock.

---

## 13. Definition of Done

- Hub-Navigation stabil ohne Errors.
- Voice-Flow funktioniert inklusive Auto-Stop (nur wenn Voice reaktiviert ist).
- Dokumentation aktuell.


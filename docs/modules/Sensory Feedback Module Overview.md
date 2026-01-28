# Sensory Feedback Module - Functional Overview

Kurze Einordnung:
- Zweck: dezentes akustisches + haptisches Feedback fuer Nutzer-Interaktionen.
- Rolle innerhalb von MIDAS: bestaetigt Aktionen, ohne Gamification.
- Abgrenzung: keine Dauer-Sounds, keine Trendpilot-Feedbacks, kein Reminder-Loop.

Related docs:
- [MIDAS Sensory Feedback Roadmap](../MIDAS Sensory Feedback Roadmap.md)
- [Hub Module Overview](Hub Module Overview.md)
- [Intake Module Overview](Intake Module Overview.md)
- [Appointments Module Overview](Appointments Module Overview.md)

---

## 1. Zielsetzung

- Leises, kurzes Feedback fuer echte Aktionen (Save/Confirm/Toggle/Undo).
- Stille ist Normalzustand.
- Haptic ist primaerer Kanal auf Mobile.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/core/feedback.js` | Zentrale Feedback-Utility (sound + haptic) |
| `app/diagnostics/devtools.js` | Dev-Toggles im Touch-Log Panel |
| `app/modules/hub/index.js` | Panel-Open/Close Hooks |
| `app/modules/intake-stack/intake/index.js` | Save/Confirm/Undo Hooks |
| `app/modules/vitals-stack/vitals/index.js` | Vitals Save/Reset Hooks |
| `app/modules/appointments/index.js` | Save/Done/Delete Hooks |
| `docs/MIDAS Sensory Feedback Roadmap.md` | Regeln + QA |

---

## 3. Datenmodell / Storage

- Kein Storage.
- Nur Laufzeit-Entscheidungen, keine Persistenz.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Feedback-Utility wird einmal geladen.
- Feature Flags / Settings bestimmen, ob Sound/Haptic aktiv ist.

### 4.2 Trigger
- Nur User-Intent Events (Panel, Save, Confirm, Toggle, Undo).
- Keine Auto-Refreshes oder Timer.

### 4.3 Verarbeitung
- Mapping aus Roadmap Step 1.
- Sound sehr kurz, haptic minimal.

---

## 5. UI-Integration

- Kein eigenes UI-Panel.
- Opt-in/Opt-out im Touch-Log Dev Panel (Sound/Haptik Toggle).

---

## 6. Fehler- & Diagnoseverhalten

- Bei fehlendem Support (Vibration API / Audio) bleibt das System still.
- Keine Error-Prompts fuer fehlende Haptics.

---

## 7. Events & Integration Points

- Input: Aktionen aus Hub/Intake/Vitals/Appointments.
- Output: kurzer Sound + optional Haptic.

---

## 8. Erweiterungspunkte / Zukunft

- Optionaler Settings-Switch (Sound/Haptic getrennt).
- Sehr leise “Error” Hinweise (nur bei echten Fehlern).

---

## 9. Status / Dependencies / Risks

- Status: implementiert (Step 4 done, Step 5 done).
- Dependencies: Browser Audio + Vibration API (optional).
- Risks: zu viel Feedback wirkt gamy; falsche Trigger erzeugen Lärm.

---

## 10. QA-Checkliste

- Kein Feedback im Idle.
- Nur bei echten Aktionen.
- Abschaltbarkeit.

---

## 11. Definition of Done

- Feedback leise, kurz, konsistent.
- Keine Gamification.
- Doku aktuell.

---

## 12. Settings / Toggles

- Touch-Log Dev Panel:
  - Sound aktivieren/deaktivieren
  - Haptik aktivieren/deaktivieren
- Touch-Log Panel (Dev):
  - Sound/Haptik Toggle Pills
- Storage Keys:
  - `FEEDBACK_SOUND_ENABLED`
  - `FEEDBACK_HAPTIC_ENABLED`

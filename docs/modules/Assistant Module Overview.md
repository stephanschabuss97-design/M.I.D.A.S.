# Assistant Module - Functional Overview

Kurze Einordnung:
- Zweck: Text-Assistant fuer Capture-Hilfe, Aktionen und Kontext-Feedback (Voice ist geparkt).
- Rolle innerhalb von MIDAS: orchestriert Assistant-UI und Aktionen im Hub; Voice-Logik liegt separat als Legacy-Modul.
- Abgrenzung: keine eigenen medizinischen Diagnosen, kein Persistieren von Daten (nur Actions triggern Speichern in anderen Modulen).

---

## 1. Zielsetzung

- Problem: schnelle Assistenz fuer Intake, Navigation und Kontextfragen.
- Nutzer: Patient (UI/Voice), System (Action-Dispatch).
- Nicht Ziel: eigenstaendige Datenspeicherung oder Analytics.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/hub/index.js` | Assistant-Panel, Endpunkte, Kontext-Sync, Voice-Adapter (geparkt) |
| `app/modules/assistant-stack/assistant/index.js` | Assistant UI-Helpers + Session-Factory |
| `app/modules/assistant-stack/assistant/session-agent.js` | Session-Logik (Messages, API-Call, Actions) |
| `app/modules/assistant-stack/assistant/actions.js` | Action-Dispatcher (open_module, intake_save, etc.) |
| `app/modules/assistant-stack/assistant/allowed-actions.js` | Guard/Whitelist fuer Actions (Stage/Auth) |
| `app/modules/assistant-stack/assistant/suggest-store.js` | Suggest/Confirm Store (Snapshot + State) |
| `app/modules/assistant-stack/assistant/suggest-ui.js` | Suggest-UI Rendering + Events |
| `app/modules/assistant-stack/assistant/day-plan.js` | Follow-up Text (Resttag, Termine) |
| `app/modules/appointments/index.js` | Termine fuer Butler-Header/Context |
| `app/modules/profile/index.js` | Profil-Context fuer Butler/Assistant |
| `app/modules/assistant-stack/voice/index.js` | Voice-Flow (record/transcribe/tts) - geparkt |
| `app/modules/assistant-stack/vad/vad.js` | Voice Activity Detection (Auto-Stop) |
| `app/modules/assistant-stack/vad/vad-worklet.js` | AudioWorklet fuer VAD |
| `index.html` | Assistant-Panel Markup (`data-hub-panel="assistant-text"`) |
| `app/styles/hub.css` | Assistant-Panel Styling (Chat, Pills, Suggest) |

---

## 3. Datenmodell / Storage

- Keine eigene Persistenz.
- Assistenz-Aktionen schreiben ueber bestehende Module (z. B. Intake, Termine, Profil).
- Session-Status lebt nur im Speicher (siehe `session-agent.js`).

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Hub initialisiert Assistant-Panel und bindet Event-Handler.
- UI-Helper und Action-Dispatcher werden im globalen Namespace registriert.

### 4.2 User-Trigger
- Assistant-Panel oeffnen (Orbit-Button `assistant-text`).
- Voice-Trigger (Orbit-Button `assistant-voice`) ist geparkt und standardmaessig deaktiviert.
- Photo-Button im Panel fuer Vision-Flow.

### 4.3 Verarbeitung
- Text: `session-agent` sendet Messages an `/api/midas-assistant`.
- Voice (geparkt): Transcribe (`/api/midas-transcribe`) -> Assistant -> TTS (`/api/midas-tts`).
- Vision: Foto bleibt Draft bis "Senden"; Upload -> `/api/midas-vision` -> Ergebnis im Chat.
- Actions laufen ueber `allowed-actions` und `assistant/actions`.
- Follow-up: Nach erfolgreichem `intake_save` fragt der Assistant einmal nach einer Essensidee und ruft bei "Ja" den Text-Endpoint mit einem Follow-up Prompt auf.
- Profil/Context: Beim Panel-Open wird der Kontext aktualisiert; fehlende Profilwerte werden lazy nachgeladen.

### 4.4 Persistenz
- Keine direkte Persistenz.
- Aktionen wie `intake_save` delegieren an bestehende Module und Supabase-APIs.

---

## 5. UI-Integration

- Panel: `data-hub-panel="assistant-text"` in `index.html`.
- Kontext: Pills (Wasser/Salz/Protein), Kontext-Extras (Protein-Ziel, CKD), Termine, Expandable (Restbudget/Warnung).
- Mobile: "Mehr/Weniger" Toggle blendet Kontext-Bloecke ein/aus.
- Suggest-Card (Confirm/Reject) fuer Assistant-Aktionen.

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine direkte Ansicht in der Arzt-Ansicht.
- Assistant beeinflusst Arzt-Ansicht nur indirekt ueber gespeicherte Daten.

---

## 7. Fehler- & Diagnoseverhalten

- Fehlerpfade loggen via `diag.add` und `console.warn` (Hub/Assistant).
- Voice-Gate blockt bei Auth/Boot-Status (nur falls Voice reaktiviert wird).
- Netzwerkfehler bei Assistant/Transcribe/TTs/Vision -> UI-Feedback.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.assistant.createSession`, `assistantAllowedActions.executeAllowedAction`, Assistant-Panel.
- Source of Truth: Session-State im Hub + Suggest-Store Snapshot (Intake/Termine/Profil).
- Side Effects: emittiert `assistant:*` Events, kann Module via Actions triggern.
- Constraints: Voice-Gate (authState unknown) blockt Voice, Actions nur via Allowed-Actions.
- `assistant:action-request` und `assistant:action-success` fuer Actions.
- `assistant:suggest-confirm` / `assistant:suggest-answer` fuer Confirm-Flow.
- `assistant:meal-followup-request` fuer die Meal-Idea Anfrage.
- Context-Refresh via `appointments:changed` / `profile:changed`.

---

## 9. Erweiterungspunkte / Zukunft

- Mehr Actions (z. B. Medication, Symptoms).
- Patient Letter/Report-Ausgabe aus Chat.
- Streaming/Realtime Voice (optional).

---

## 10. Feature-Flags / Konfiguration

- `DEV_ALLOW_DEFAULTS` (Debug/Defaults).
- Endpoint-Routing in `hub/index.js` (`/api/midas-*`).

---

## 11. Status / Dependencies / Risks

- Status: aktiv (Text), Voice geparkt.
- Dependencies (hard): Hub-Panel, `assistant/*` Session/Actions, VAD, Backend-APIs `/api/midas-*`.
- Dependencies (soft): Vision-Flow/Photo, Appointments/Profile Kontext.
- Known issues / risks: Netz/Latenz, Actions nur whitelisted, Voice-Gate blockt bei Auth/Boot.
- Backend / SQL / Edge: `/api/midas-assistant`, `/api/midas-transcribe`, `/api/midas-tts`, `/api/midas-vision` (keine SQL).

---

## 12. QA-Checkliste

- Assistant-Panel oeffnet und sendet Nachrichten.
- Voice-Trigger startet/stoppt sauber (VAD Auto-Stop) - nur wenn Voice reaktiviert ist.
- Suggest-Confirm führt Actions korrekt aus.
- Kontext (Pills/Termine/Profil) aktualisiert sich nach Änderungen.

---

## 13. Definition of Done

- Text-Flow funktioniert ohne Errors; Voice ist geparkt.
- Actions laufen nur ueber erlaubte Guards.
- Dokumentation aktuell.



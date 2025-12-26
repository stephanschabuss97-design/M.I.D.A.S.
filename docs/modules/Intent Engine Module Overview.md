Future Module Overview Template

# Intent Engine Module - Functional Overview

Kurze Einordnung:
- Zweck: schnelle, lokale Befehls-Erkennung fuer Text (optional Voice) ohne LLM-Call.
- Rolle innerhalb von MIDAS: Fast-Path vor dem Assistant, spart Tokens und Zeit.
- Abgrenzung: kein Ersatz fuer Assistant-LLM, nur intent parsing + routing.

---

## 1. Zielsetzung

- Problem: einfache Eingaben (z. B. "Wasser 300 ml") sollen sofort wirken.
- Nutzer: Patient (Text; Voice optional/legacy), System (geringere Latenz).
- Nicht Ziel: komplexe Beratung oder freie Dialoge.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/assistant-stack/intent/index.js` | Orchestrierung / Public API |
| `app/modules/assistant-stack/intent/rules.js` | Regelwerk (Regex/Parser) |
| `app/modules/assistant-stack/intent/normalizers.js` | Einheiten/Parsing Helpers |
| `app/modules/assistant-stack/assistant/actions.js` | Ziel-Actions (dispatch) |
| `app/modules/hub/index.js` | Voice/Text Eingang + Routing |
| `docs/assistant-multimodal-polish-roadmap.md` | Umsetzungsschritte |

---

## 3. Datenmodell / Storage

- Kein Storage.
- Intent Engine arbeitet rein im Speicher.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul wird vom Hub/Assistant geladen.
- Keine Auth-Abhaengigkeit.

### 4.2 User-Trigger
- Text-Chat Send.
- Voice Transkript nach `midas-transcribe` (nur wenn Voice wieder aktiviert wird).

### 4.3 Verarbeitung
- String normalisieren (Komma/Punkt, Einheiten).
- Regeln pruefen (Regex/Patterns).
- Bei Treffer: Action-Dispatch + optional Confirmation.
- Bei Unsicherheit: Fallback an LLM.

### 4.4 Persistenz
- Keine direkte Persistenz.
- Writes laufen ueber `assistant/actions.js`.

---

## 5. UI-Integration

- Keine eigene UI.
- Optional: kurze "Intent erkannt" Meldung im Chat.

---

## 6. Arzt-Ansicht / Read-Only Views

- Nicht relevant.

---

## 7. Fehler- & Diagnoseverhalten

- Logging via `diag.add`.
- Fehlende Regeln -> LLM-Fallback.
- Parsing-Fehler -> Hinweis im Chat (optional).

---

## 8. Events & Integration Points

- Public API: `AppModules.intentEngine.parse(text, context?)`.
- Source of Truth: Input-String + optional Kontext.
- Side Effects: Dispatch von `assistant/actions`.
- Constraints: Regeln muessen deterministisch bleiben.

---

## 9. Erweiterungspunkte / Zukunft

- Mehr intents (Vitals, Meds, Termine).
- Mehrsprachigkeit.
- Confidence-Scoring fuer Fallback.

---

## 10. Feature-Flags / Konfiguration

- Optional: `INTENT_ENGINE_ENABLED`.
- Optional: `INTENT_ENGINE_DEBUG`.

---

## 11. Status / Dependencies / Risks

- Status: geplant.
- Dependencies (hard): `app/modules/assistant-stack/assistant/actions.js`, Hub/Assistant.
- Dependencies (soft): Profile/Context fuer Defaults.
- Risks: Falsche Parsing-Regeln, falsche Werteingaben.
- Backend / SQL / Edge: keine.

---

## 12. QA-Checkliste

- Wasser/Salt/Protein intents erkannt.
- BP/Body intents erkannt.
- Unsicher -> LLM-Fallback.
- Keine Doppel-Saves.

---

## 13. Definition of Done

- Intent Engine laeuft ohne Errors.
- Actions korrekt ausgelöst.
- Dokumentation aktuell.

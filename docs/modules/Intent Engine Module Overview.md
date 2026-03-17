# Intent Engine Module - Functional Overview

Kurze Einordnung:
- Zweck: deterministische lokale Erkennung strukturierter Commands fuer Text und Voice.
- Rolle innerhalb von MIDAS: produktiver Fast-Path vor `midas-assistant`.
- Abgrenzung: kein LLM-Ersatz, keine freie Beratung, kein eigener Persistenz-Layer.

Related docs:
- [Assistant Module Overview](Assistant Module Overview.md)
- [Hub Module Overview](Hub Module Overview.md)
- [VAD Module Overview](VAD Module Overview.md)
- [Intent Engine Implementation Roadmap (DONE)](../archive/Intent%20Engine%20Implementation%20Roadmap%20(DONE).md)

---

## 1. Zielsetzung

- Problem: strukturierte Alltagsbefehle sollen ohne unnoetigen LLM-Roundtrip erkannt und ausgefuehrt werden.
- Nutzer:
  - Text-Assistant
  - Voice V1 nach STT
- Nicht Ziel:
  - freie Beratung
  - Interpretieren vager Aussagen
  - implizites Raten fehlender Werte

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/assistant-stack/intent/index.js` | Public API, Adapter-Envelope, Pending-Context-Re-Exports |
| `app/modules/assistant-stack/intent/parser.js` | Surface -> semantic -> slots -> match -> validate -> context -> decision |
| `app/modules/assistant-stack/intent/rules.js` | Einstiegspunkt fuer deterministische Intent-Regeln |
| `app/modules/assistant-stack/intent/normalizers.js` | Einstiegspunkt fuer Surface-/Semantic-Normalisierung und Slot-Bildung |
| `app/modules/assistant-stack/intent/normalizers/surface.js` | Transcript-nahe Surface-Normalisierung |
| `app/modules/assistant-stack/intent/normalizers/semantic.js` | Semantische Alias-, Verb- und Filler-Normalisierung |
| `app/modules/assistant-stack/intent/semantics/*` | Endliche semantische Familien fuer Entities, Verbs, Units, Fillers, Compound-Marker |
| `app/modules/assistant-stack/intent/slots/extract.js` | Slot-/Kategorie-Bildung fuer den produktiven Kern |
| `app/modules/assistant-stack/intent/rules/*.js` | Modulare Pattern-/Intent-Regeln pro Kernbereich |
| `app/modules/assistant-stack/intent/validators.js` | Pflichtfeld-, Safety- und Action-Validierung |
| `app/modules/assistant-stack/intent/context.js` | Pending-Context-Erzeugung, Status, Consume |
| `app/modules/hub/index.js` | Produktiver Text-Preflight und Confirm-Flow |
| `app/modules/assistant-stack/voice/index.js` | Produktiver Voice-Adapter auf demselben Intent-Surface |

---

## 3. Intent-Surface

### 3.1 Produktive Kernklassen

- `confirm_reject`
  - `ja`
  - `nein`
  - `speichern`
  - `abbrechen`
- `intake_quick_add`
  - Wasser
  - Salz
  - Protein
  - inklusive natuerlicherer Phrasen wie `ich habe 780 ml wasser getrunken`
  - inklusive Dezimal-Komma-Formen wie `1,2 gramm salz`
  - inklusive enger semantischer Varianten wie `proteine`
- `medication_confirm_all`
  - taegliche Sammelbestaetigung offener Medikamente
- `simple_navigation`
  - enger lokaler Scope wie `oeffne vitals` oder `gehe zu medikamente`

### 3.2 Bewusst ausserhalb

- freie Beratung
- vage Writes
- implizite Umdeutung
- freie Einzelmedikationssprache
- produktive Compound-Confirms

---

## 4. Decision-Contract

- `direct_match`
  - eindeutig, validiert, lokal behandelbar
- `needs_confirmation`
  - semantisch erkannt, aber nur mit Pending Context sicher
- `fallback`
  - kein lokaler deterministischer Treffer

Der produktive Ausfuehrungsvertrag im aufrufenden Flow trennt zusaetzlich:
- `handled`
- `blocked_local`
- `unsupported_local`
- `fallback_semantic`

---

## 5. Adapter-Contract

Die Engine arbeitet ueber einen expliziten Adapter-Envelope:
- `raw_text`
- `source`
- `source_type`
- `source_id`
- `dedupe_key`
- `pending_context`
- `ui_context`
- `meta`

Wichtige Folge:
- Text und Voice nutzen denselben fachlichen Parser-Surface.
- Unterschiede liegen im Orchestrator-/Dispatch-Pfad, nicht in einem zweiten Parser.

Zusatz seit dem Semantik-Refactor:
- Der normalisierte Parserzustand traegt jetzt zusaetzlich sichtbare Zwischenformen:
  - `surface_normalized_text`
  - `semantic_normalized_text`
  - `slots`
  - `slots_by_type`
- Diese Zwischenformen sind Diagnose- und Review-Hilfe, aber kein zweiter Dispatch-Vertrag.

---

## 6. Pending Context

### 6.1 Vertrag

- `pending_intent_id`
- `intent_type`
- `target_action`
- `payload_snapshot`
- `created_at`
- `expires_at`
- optional:
  - `consumed_at`
  - `dedupe_key`
  - `source`
  - `ui_origin`

### 6.2 Produktiver Einsatz

- suggestion-basierte Confirm-Flows
- Assistant-`ask_confirmation`
- Voice-Single-Command-Confirms ueber denselben Resolver

### 6.3 Guardrails

- kein Confirm ohne gueltigen Pending Context
- TTL / Expiry
- Single-Consume
- Dedupe / Guard-Key

---

## 7. Voice-Integration

- Voice V1 ist jetzt produktiv an denselben Intent-Kern angebunden.
- Standardpfad:
  - `transcript -> command orchestrator -> normalized command units -> intent preflight -> local dispatch`
- Compound Morning Commands werden lokal in Teil-Units zerlegt.
- Parserseitig erkennbare, aber ausserhalb des Voice-V1-Scope liegende Targets werden im Voice-Dispatch explizit als `unsupported_local` geblockt statt still lokal ausgefuehrt.
- Der Intent-Kern selbst bleibt dabei kanalagnostisch.

Seit dem Semantik-Refactor gilt intern zusaetzlich:
- `surface normalization -> semantic normalization -> slot extraction -> pattern rules -> validation`
- nur die Pattern-/Intent-Regeln duerfen einen produktiven Intent freigeben
- Compound-Parsing bleibt im Voice-Orchestrator; die Intent Engine bewertet weiterhin einzelne Command Units
- Spaetere STT-/VAD-/Performance-Wechsel aendern diesen Intent-Kern bewusst nicht; sie duerfen hoechstens Transcript und Segment-Ende verbessern.

Wichtige Grenze:
- Compound-Parsing liegt im Voice-Orchestrator, nicht in `rules.js`.
- Die Intent Engine bewertet weiterhin einzelne normalisierte Command Units.

---

## 8. Fehler- & Diagnoseverhalten

- Kein lokaler Treffer -> `fallback`
- Ungueltiger Confirm-Kontext -> `needs_confirmation` im Parser, Aufloesung erst im Flow
- Telemetry / Snapshot:
  - `decision`
  - `reason`
  - `intent_key`
  - `target_action`
  - `route`
- Voice-spezifische Runtime-/TTS-/Reply-Outcomes liegen bewusst nicht in dieser Intent-Telemetry,
  sondern im separaten Voice-Outcome-Snapshot des Voice-Adapters.
- Voice-/Failure-Review kann zusaetzlich auf:
  - `surface_normalized_text`
  - `semantic_normalized_text`
  - `slots`
  zugreifen, damit semantische Luecken nicht mehr nur als Satzproblem gelesen werden.

---

## 9. Status / Dependencies / Risks

- Status:
  - produktiver Text-Fast-Path aktiv
  - produktiver Voice-V1-Fast-Path aktiv
  - Medication-Intent aktiv
  - Confirm-/Pending-Context-Vertrag aktiv
- Hard dependencies:
  - Hub
  - Allowed Actions
  - Voice-Adapter
- Known risks:
  - zu breite Regeln
  - neue Confirm-Producer ohne sauberen Pending-Contract
  - Drift zwischen Intent-Surface und lokalem Dispatch-Scope

---

## 10. QA-Checkliste

- `Wasser 300 ml` -> lokaler Treffer
- `ich habe 780 ml wasser getrunken` -> lokaler Treffer
- `32 g protein` -> lokaler Treffer
- `alle medikamente genommen` -> lokaler Treffer
- `ja/nein/speichern/abbrechen` nur mit aktivem Pending Context wirksam
- Text und Voice nutzen denselben Intent-Surface
- Lokale Treffer fuehren zu keinem unnoetigen `midas-assistant`-Call

---

## 11. Definition of Done

- Text und Voice verwenden denselben deterministischen Intent-Kern.
- Confirm-Verhalten bleibt guard-railed.
- LLM bleibt Fallback fuer freie oder unklare Sprache.
- Dokumentation ist mit dem produktiven Runtime-Stand synchron.

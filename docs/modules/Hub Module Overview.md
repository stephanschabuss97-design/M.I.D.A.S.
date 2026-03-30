# Hub Module - Functional Overview

Kurze Einordnung:
- Zweck: zentrales MIDAS-Hub-Interface mit Carousel, Panels, Quickbar, oberem Dashboard-Reveal und produktivem Voice-V1-Einstieg.
- Rolle innerhalb von MIDAS: orchestriert UI-Navigation, Assistant-Textfluss, Voice-Gate, Voice-State-UI, Reveal-Surfaces und Pending-Context-Helfer fuer Voice.
- Abgrenzung: keine eigene Persistenz, keine fachliche Intent-Logik im Kern.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Assistant Module Overview](Assistant Module Overview.md)
- [VAD Module Overview](VAD Module Overview.md)
- [Hydration Target Module Overview](Hydration Target Module Overview.md)

---

## 1. Zielsetzung

- Problem: ein zentraler, stabiler UI-Einstieg fuer Navigation, Capture und Voice.
- Nutzer: Patient.
- Nicht Ziel: fachliche Speicherung oder LLM-/Intent-Entscheidungen im Hub selbst.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/hub/index.js` | Carousel, Panels, Quickbar, Assistant-Flow, Voice-Gate, Pending-Context-Resolver |
| `app/modules/hub/hub-aura3d.js` | Visuelle Aura / Canvas |
| `app/modules/assistant-stack/voice/index.js` | Produktiver Voice-V1-Adapter |
| `app/modules/assistant-stack/vad/vad.js` | VAD-Anbindung |
| `app/styles/hub.css` | Hub-Layout und Voice-State-Visuals |
| `index.html` | MIDAS-Slot, Panels, Quickbar |

---

## 3. Ablauf / Logikfluss

### 3.1 Initialisierung

- Hub initialisiert Carousel, Panels, Quickbar, Dashboard-Reveal und den Voice-Adapter.
- `assistant-voice` ist nicht mehr immer sichtbar, sondern haengt am Assistant-Surface-Vertrag.
- Die produktive Voice-Initialisierung laeuft direkt; ein alter `VOICE_PARKED`-Zwischenguard existiert nicht mehr.
- Voice wird ueber Boot-/Auth-/Gate-Status kontrolliert geoeffnet oder blockiert.

### 3.2 User-Trigger

- Orbit-/Carousel-Buttons oeffnen Panels.
- `assistant-voice` ist bei aktivem Assistant-Surface der offizielle Push-to-talk-Einstieg fuer Voice V1.
- Reveal-Surfaces:
  - `swipe down` -> oberes Hub-Dashboard
  - `swipe up` -> untere Quickbar
  - Hero/Carousel bleibt die neutrale Mittelebene
- Quickbar bleibt ohne zweiten produktiven Voice-Einstieg.

### 3.3 Assistant / Intent

- Texteingaben laufen im Hub zuerst ueber den Intent-Preflight.
- Lokale Direct-Matches werden ueber Allowed-Actions oder UI-safe Actions behandelt.
- Pending-Contexts fuer Confirm-Flows werden hier gesetzt, gelesen, bereinigt und aufgeloest.

### 3.4 Voice

- Der Hub exponiert fuer Voice:
  - `getVoiceGateStatus()`
  - `onVoiceGateChange(...)`
  - `getAssistantPendingIntentContext()`
  - `resolveAssistantConfirmIntent(...)`
- Sichtbare Voice-State-UI:
  - `idle`
  - `listening`
  - `transcribing`
  - `parsing`
  - `executing`
  - `confirming`
  - `error`
- Der Hub bleibt dabei nur UI-/Gate-Orchestrator:
  - VAD-/Segment-Ende-Optimierung liegt im Voice-Adapter
  - die natuerlichere Spoken-Kurzoberflaeche fuer lokale Replies wird ueber die lokalen Reply-Builder zugespielt

---

## 4. UI-Integration

- `assistant-voice` folgt jetzt dem produktiven Assistant-Surface-Vertrag:
  - `off`:
    - passive sichtbare Startnadel
    - nicht triggerbar
    - liest sich beim ersten Swipe moeglichst wie ein echtes erstes Carousel-Icon
    - faellt erst nach diesem ersten lesbaren Carousel-Schritt aus der regulaeren Rotation
  - `on`:
    - produktiver Voice-Slot bleibt sichtbar
- Voice-Gate und Voice-State werden direkt am sichtbaren Hub-Einstieg gespiegelt.
- Das Hub-Dashboard ist ein eigener oberer Reveal-Surface und kein Panel:
  - kompakt
  - datenorientiert
  - aus demselben Assistant-Kontext gespeist
  - traegt jetzt zusaetzlich einen rein lokalen `WASSER-SOLL`-Orientierungswert im bestehenden Pill-Block
  - zieht nach normalen Intake-Saves direkt mit dem frischen lokalen Snapshot nach
- Panels bleiben im DOM und werden nur geoeffnet/geschlossen.

---

## 5. Pending-Context- und Confirm-Rolle

- Der Hub ist Source of Truth fuer:
  - aktiven Pending Intent Context
  - Pending Guard Locks (`inFlight`, `consumed`)
  - Clear-/Cleanup-Verhalten
- Der Hub liefert den generischen Confirm-Resolver fuer Text und Voice.
- Unbrauchbare oder stale Pending Contexts werden beim Zugriff aktiv bereinigt.
- Neue Pending Contexts loesen alte Guard-Reste fuer denselben Key kontrolliert ab, damit keine Zombie-Locks haengen bleiben.

---

## 6. Fehler- & Diagnoseverhalten

- Gate-Blocker und Panel-Fehler loggen ueber `diag.add`.
- Voice-Gate blockt bei Boot/Auth kontrolliert.
- Confirm-/Pending-Fehler bleiben lokal und kurz.
- Erfolgreiche Voice-Confirms laufen im Hub kanalbewusst ueber `intent-confirm:voice`.
- UI-State-Drift wird ueber klare Hub-State-Attribute reduziert.
- Fuer den Voice-Performance-Review greift der Hub auf denselben globalen Perf-Sampler zu wie der Voice-Adapter; er baut dafuer keinen zweiten Mess-Stack auf.

---

## 7. Events & Integration Points

- Public API:
  - `AppModules.hub.openPanel(...)`
  - `AppModules.hub.getVoiceGateStatus()`
  - `AppModules.hub.onVoiceGateChange(...)`
  - `AppModules.hub.getAssistantPendingIntentContext()`
  - `AppModules.hub.resolveAssistantConfirmIntent(...)`
- Relevante Events:
  - `assistant:action-success`
  - `assistant:intent-*`
- Das Dashboard konsumiert weiterhin den bestehenden Intake-Snapshot fuer Ist-Werte und ergaenzt lokal einen separaten Hydration-Referenzwert ohne neue Persistenz.

---

## 8. Status / Dependencies / Risks

- Status: aktiv, Voice-V1 produktiv angebunden.
- Hard dependencies:
  - Hub DOM / CSS
  - Voice-Adapter
  - Intent Engine
- Known risks:
  - fehlende DOM-Hooks
  - Voice-Gate-/Stage-Drift
  - visuelle State-Drift bei spaeteren Hub-Refactors

---

## 9. QA-Checkliste

- `assistant-voice` folgt korrekt dem `off/on`-Surface-Vertrag.
- Push-to-talk startet nur bei erlaubtem Gate-Status.
- Voice-State-Labeling spiegelt den Runtime-Status sichtbar.
- `swipe down` oeffnet nur das Dashboard, `swipe up` nur die Quickbar.
- Dashboard, Hero und Quickbar bilden drei saubere Ebenen ohne Direkt-Sprung von oben nach unten.
- Die passive Nadel bei `off` fuehlt sich beim ersten Swipe wie ein echter erster Carousel-Schritt an und nicht wie ein harter Platzhalter-Sprung.
- Das obere Dashboard zieht normale Intake-Saves sofort sichtbar nach, ohne Reload.
- `WASSER-SOLL` sitzt direkt nach `WASSER`, bleibt rein informativ und aktualisiert sich bei offenem Dashboard mit dem Minutenwechsel mit.
- Pending-Context-Resolver funktioniert fuer Text und Voice.
- Doctor-/Panel-Navigation bleibt unbeeintraechtigt.

---

## 10. Definition of Done

- Hub ist stabiler zentraler Voice- und Panel-Einstieg.
- Kein zweiter produktiver Voice-Einstieg ausserhalb des MIDAS-Slots.
- Pending-Context- und Gate-Helfer sind fuer Text und Voice konsistent.
- Dokumentation ist auf dem produktiven Hub-Zuschnitt.

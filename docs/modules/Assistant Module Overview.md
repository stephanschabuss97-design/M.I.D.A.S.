# Assistant Module - Functional Overview

Kurze Einordnung:
- Zweck: Text-Assistant fuer Kontext, Aktionen, Confirm-Flows und produktiven Voice-V1-Anschluss.
- Rolle innerhalb von MIDAS: orchestriert Assistant-UI, lokalen Intent-Fast-Path, Pending-Context-Guards und den LLM-Fallback fuer freie Sprache.
- Abgrenzung: keine eigene Persistenz, keine medizinische Beratung, kein primaerer Decision-Layer fuer Voice-V1.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Intent Engine Module Overview](Intent Engine Module Overview.md)
- [Hub Module Overview](Hub Module Overview.md)

---

## 1. Zielsetzung

- Problem: schnelle Assistenz fuer strukturierte Alltagsaktionen ohne unnoetige LLM-Roundtrips.
- Nutzer: Patient in Text und indirekt Voice ueber denselben Intent-/Confirm-Vertrag.
- Nicht Ziel: freie medizinische Beratung oder eigenes Datenspeichern.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/hub/index.js` | Assistant-Panel, Text-Intent-Preflight, Pending-Context-Guards, Confirm-Resolver, Hub-API fuer Voice |
| `app/modules/assistant-stack/assistant/index.js` | Assistant UI-Helpers + Session-Factory |
| `app/modules/assistant-stack/intent/index.js` | Intent Public API inkl. Adapter-Envelope, Pending-Context-Re-Exports und Telemetry |
| `app/modules/assistant-stack/assistant/session-agent.js` | Session-/Message-Logik fuer LLM-Fallback |
| `app/modules/assistant-stack/assistant/actions.js` | Allowed Action Targets (`intake_save`, `open_module`, etc.) |
| `app/modules/assistant-stack/assistant/allowed-actions.js` | Guard-/Whitelist-Schicht fuer Actions |
| `app/modules/assistant-stack/assistant/suggest-store.js` | Suggest-/Confirm-State fuer suggestion-basierte Intake-Flows |
| `app/modules/assistant-stack/voice/index.js` | Produktiver Voice-V1-Adapter mit lokalem command-first Flow |
| `app/modules/assistant-stack/vad/vad.js` | VAD als Segment-Ende-/Auto-Stop-Helfer |
| `index.html` | Assistant-Panel und Hub-Markup |
| `app/styles/hub.css` | Assistant-/Hub-/Voice-Styling |

---

## 3. Datenmodell / Storage

- Keine eigene Persistenz.
- Writes laufen ueber bestehende Module und Allowed-Actions.
- Laufzeit-State lebt im Speicher:
  - Session-State
  - Suggest-State
  - Pending Intent Context
  - Pending Intent Guard-Status (`inFlight`, `consumed`)

---

## 4. Ablauf / Logikfluss

### 4.1 Text

- Hub preflightet Texteingaben zuerst ueber die lokale Intent Engine.
- `direct_match` wird lokal ausgefuehrt, wenn der Action-Pfad freigegeben ist.
- `confirm_reject` wird nicht im Parser selbst freigegeben, sondern in der Flow-Schicht gegen den Pending Context aufgeloest.
- Nur `fallback` oder bewusst weiterzureichende Faelle gehen an `midas-assistant`.

### 4.2 Voice

- Voice ist nicht mehr geparkt.
- Produktiver Voice-V1-Pfad:
  - `record -> transcribe -> command orchestrator -> normalized command units -> intent preflight -> local dispatch -> short tts`
- Voice nutzt denselben fachlichen Intent-Surface wie Text.
- Voice nutzt nach dem ersten Semantik-Refactor denselben lokalen Intent-Kern jetzt auch ueber sichtbare Zwischenstufen:
  - `surface normalization`
  - `semantic normalization`
  - `slot extraction`
  - `pattern / intent rules`
- Voice normalisiert dabei auch natuerliche Morning-Phrasen und Dezimal-Kommas vor dem Unit-Preflight.
- Gesprochene Antworten sind getrennt geschnitten in:
  - kurzen Spoken-Surface fuer produktive TTS-Ausgabe
  - ausfuehrlicheren internen Reply-/Bypass-Surface fuer Diagnose
  - operativen Error-Surface fuer Mic-/STT-/Netzwerk-/Config-Probleme
- Seit dem Performance-Nachschnitt in `F13` gilt zusaetzlich:
  - VAD-/Auto-Stop ist enger auf kurze Command-First-Utterances zugeschnitten
  - Compound-/Morning-Faelle behalten dabei einen konservativeren Segment-Ende-Schnitt
  - lokale Erfolgsantworten fuer TTS sind bewusst kuerzer und deutschsicherer geschnitten
- `midas-assistant` ist nicht Teil des normalen Voice-V1-Kontrollflusses.

### 4.3 Confirm-Flows

- Suggestion-basierte Intake-Confirms und Assistant-`ask_confirmation` nutzen denselben Pending-Context-Vertrag.
- Voice-Single-Command-Confirms (`ja`, `nein`, `speichern`, `abbrechen`) sind ueber denselben Resolver angebunden.
- Erfolgreiche Confirm-Ausfuehrungen bleiben channel-aware unterscheidbar (`intent-confirm:text` vs. `intent-confirm:voice`).
- Guards:
  - TTL / Expiry
  - Single-Consume
  - `inFlight`
  - `consumed`
  - Dedupe-Key

---

## 5. UI-Integration

- Assistant-Panel bleibt der produktive Text-Einstieg, aber seine Sichtbarkeit ist jetzt produktisch togglebar.
- Suggest-Cards bleiben produktiver Confirm-Producer.
- Der Hub exponiert den Pending-Context- und Confirm-Resolver auch fuer Voice.
- Voice selbst wird zentral ueber den MIDAS-Slot im Hub getriggert, nicht ueber ein separates Assistant-Panel-Voice-Design.

### 5.1 Sichtbarkeitsvertrag

- Neuer Produkt-Toggle:
  - `assistant surface off`
  - `assistant surface on`
- `off` bedeutet:
  - Text-Assistant ist aus Carousel und Quickbar ausgeblendet
  - die OG-MIDAS-Nadel bleibt nur als passiver Startanker sichtbar
  - sie ist nicht triggerbar, liest sich beim ersten Swipe aber moeglichst wie ein echtes erstes Carousel-Icon
  - erst nach diesem ersten lesbaren Carousel-Schritt faellt dieser passive Voice-Anker aus der regulaeren Rotation
- `on` bedeutet:
  - Text-Assistant ist wieder sichtbar
  - die MIDAS-Nadel bleibt als produktiver Voice-Slot im Carousel
- Wichtig:
  - das ist nur ein Surface-/Sichtbarkeitsvertrag
  - kein zweiter Assistant-Modus
  - kein zweiter Parserpfad
  - keine Deaktivierung der zugrunde liegenden Architektur

### 5.2 Assistant-Kontext vs. Hub-Dashboard

- Der nuetzliche Assistant-Kontext ist nicht mehr nur ans Assistant-Panel gebunden.
- Ein kompakter Hub-Dashboard-Surface zeigt jetzt auch ausserhalb des Panels:
  - Wasser
  - Salz
  - Protein
  - Protein-Ziel
  - CKD
  - naechste `2` Termine
  - Restbudget
- Das Dashboard nutzt denselben bestehenden Kontext-/Snapshot-Vertrag wie der Assistant.
- Nach normalen lokalen Intake-Saves zieht das Dashboard den frischen Snapshot jetzt direkt sichtbar nach.
- Der Copy-Snapshot bleibt inhaltlich derselbe; er ist jetzt nur auch am Hub-Dashboard erreichbar.

---

## 6. Fehler- & Diagnoseverhalten

- Lokale Intent-Ausgaenge bleiben explizit getrennt:
  - `handled`
  - `blocked_local`
  - `unsupported_local`
  - `fallback_semantic`
- Voice trennt zusaetzlich zwischen:
  - kurzem gesprochenem Rueckkanal
  - ausfuehrlicherem internem Reply-/Bypass-Surface fuer Diagnose
  - operativen Voice-Fehlern ausserhalb des normalen Intent-Fallbacks
- Confirm-Fehlpfade antworten lokal und kurz statt als generischer Assistant-Fehler.
- Stale Pending Contexts werden aktiv bereinigt.
- Voice fuehrt zusaetzlich einen eigenen `lastOutcome`-Snapshot fuer Runtime-/TTS-/Reply-Outcomes.
- Failure-Reports fuer echte `no-rule-match`-Faelle koennen jetzt zusaetzlich semantische Zwischenstufen enthalten:
  - `surface_normalized_transcript`
  - `semantic_normalized_transcript`
  - `slots`
- Telemetry / Diag laufen ueber Intent-Snapshot, Voice-Outcome-Snapshot und `diag.add`.
- Fuer Voice-Latenz sind im produktiven Adapter jetzt kleine Perf-Segmente vorhanden:
  - `voice_tap_to_listening`
  - `voice_first_speech_to_stop`
  - `voice_stop_to_transcribe_response`
  - `voice_transcribe_to_reply_ready`
  - `voice_reply_ready_to_tts_complete`

---

## 7. Events & Integration Points

- Relevante Public APIs:
  - `AppModules.intentEngine.*`
  - `AppModules.hub.getAssistantPendingIntentContext()`
  - `AppModules.hub.resolveAssistantConfirmIntent()`
- Relevante Events:
  - `assistant:intent-direct-match`
  - `assistant:intent-fallback`
  - `assistant:action-success`
  - `assistant:suggest-*`

---

## 8. Status / Dependencies / Risks

- Status:
  - Text produktiv
  - Pending-Context-/Confirm-Vertrag produktiv
  - Voice-V1 produktiv command-first
- Hard dependencies:
  - Hub
  - Intent Engine
  - Allowed Actions
  - Suggest Store
- Known risks:
  - LLM-Fallback-Drift in spaeteren Assistant-Aenderungen
  - Confirm-Producer ausserhalb des aktuellen Vertrags
  - zu breite Allowed-Action-Erweiterungen

### 8.1 Future Hooks / Entry-Point-Grenze

- Der heutige produktive Voice-Einstieg bleibt der bestehende Hub-/Push-to-talk-Kontext.
- Eine installierte PWA kann diesen Einstieg spaeter hoechstens schneller erreichbar machen.
- Wichtig:
  - ein PWA-Shortcut ersetzt keinen echten Outside-the-app-Voice-Start
  - auch ein PWA-Shortcut bleibt an denselben Boot-/Auth-/Gate-Vertrag gebunden
  - dadurch entsteht im aktuellen Produkt nur begrenzter Mehrwert, solange der Push-to-talk-Einstieg ohnehin direkt am Hub-Anfang liegt
- Wenn spaeter echter Voice-Start ausserhalb der sichtbaren App relevant wird, ist das ein eigener Zukunftsscope:
  - Wrapper / Native Shell
  - Widget-/OS-naher Einstieg
  - spaeter eventuell Wearable- oder Begleitgeraet-Pfade
- Dieser Future-Scope ist:
  - fachlich interessant
  - nicht verworfen
  - aktuell aber bewusst nicht Teil des produktiven Assistant-/Voice-V1-Vertrags
  - bei Wiederaufnahme eher Kandidat fuer eine eigene Roadmap als fuer einen kleinen Follow-up-Task

### 8.2 Future Hooks / Voice-Open-Module-Schnitt

- Der heutige produktive Voice-Open-Module-Vertrag bleibt absichtlich eng:
  - `vitals`
  - `medikamente` als Einstieg in den bestehenden Intake-/Tageserfassungskontext
- Weitere Moduloeffnungen per Voice bleiben vorerst bewusst ausserhalb des Produktvertrags.
- Moegliche spaetere Kandidaten koennen sein:
  - `termine`
  - weitere klar UI-safe Moduleinstiege
- Guardrail fuer eine spaetere Erweiterung:
  - nur echter Reibungsnutzen im Alltag
  - nur bestehende Module oeffnen, keine neue Workflow- oder Pending-Semantik
  - keine Rueckkehr zu breiten satznahen Sonderregeln pro Modul
- Solange der reale Nutzwert dafuer nicht belegt ist, bleibt das ein Future-Hook und kein aktiver Ausbaupunkt.

### 8.3 Future Hooks / Voice-Robustheit im Alltag

- Die aktuelle Voice-Basis ist produktiv nutzbar, aber fuer echten Alltagskomfort noch nicht am Ziel.
- Reale spaetere Follow-up-Themen sind:
  - leiseres / weniger exaktes Sprechen besser tolerieren
  - natuerliche Einleitungsphrasen robuster behandeln, z. B.:
    - `kannst du mir bitte ...`
  - Compound-Fast-Paths auch unter natuerlicherer Alltagssprache stabil halten
- Guardrail:
  - diese Robustheitsarbeit gehoert nicht in den produktiven Surface-/Toggle-Vertrag
  - sie ist ein eigener spaeterer Verbesserungsblock auf Basis realer Nutzung
- Wichtig fuer spaetere Wiederaufnahme:
  - zuerst unterscheiden zwischen
    - Akustik-/STT-/VAD-Thema
    - semantischem Filler-/Surface-Thema
    - Entry-Point-/Wrapper-/TWA-Thema
  - nicht alle drei Problemklassen in einen einzigen "Voice verbessern"-Task kippen

---

## 9. QA-Checkliste

- Text-Direct-Matches laufen ohne unnoetigen Assistant-Roundtrip.
- Suggest-Confirm und `ask_confirmation` verhalten sich deterministisch.
- `ja/nein/speichern/abbrechen` reagieren nur mit aktivem Pending Context.
- Voice-Single-Command-Confirm nutzt denselben Pending-Context-Vertrag.
- Compound-Morning-Commands fuer Wasser / Salz / Protein / Medikation bleiben lokal, kurz und ohne stillen Teilverlust.
- Push-to-talk + VAD-Auto-Stop verlassen `listening` kontrolliert und haengen nicht auf kurzer Anfangssprache.
- Lokale Blocker erscheinen nicht als generische Assistant-Fehler.

---

## 10. Definition of Done

- Assistant-Text und Voice nutzen denselben fachlichen Intent-/Confirm-Vertrag.
- Pending Contexts bleiben guard-railed und stale-frei.
- LLM bleibt Fallback fuer freie Sprache statt primaerer Pfad fuer strukturierte Commands.
- Dokumentation ist auf dem realen Runtime-Stand.

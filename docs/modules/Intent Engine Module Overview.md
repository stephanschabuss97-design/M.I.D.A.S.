# Intent Engine Module - Functional Overview

Kurze Einordnung:
- Zweck: schnelle, lokale Erkennung fuer einfache, strukturierte Nutzerbefehle in Text und optional Voice, ohne LLM-Call.
- Rolle innerhalb von MIDAS: deterministischer Fast-Path vor `midas-assistant`; spart Latenz, Tokens und Reibung.
- Abgrenzung: kein Ersatz fuer den Assistant-LLM, keine freie Beratung, keine Vision-Analyse, kein eigener Persistenz-Store.
- Status: Kern implementiert; produktiver Text-Fast-Path im Hub ist aktiv. Confirm-/Context-Handling fuer suggestion-basierte Flows und Assistant-`ask_confirmation`-Actions ist verdrahtet. Voice verwendet bereits denselben Intent-Kern inklusive lokalem Preflight und freigegebenen Fast-Path-Mechanismen, bleibt im Hub-UI aber weiterhin geparkt. Die V1-Smoke-/Fallback-/Confirm-/Guard-Checks aus `S7` sind abgeschlossen.

Related docs:
- [Assistant Module Overview](Assistant Module Overview.md)
- [Hub Module Overview](Hub Module Overview.md)
- [VAD Module Overview](VAD Module Overview.md)
- [Intent Engine Implementation Roadmap (DONE)](../archive/Intent%20Engine%20Implementation%20Roadmap%20(DONE).md)
- [Assistant Multimodal Polish Roadmap](../archive/assistant-multimodal-polish-roadmap.md)
- [Assistant Stack Refactor Roadmap](../archive/assistant-stack-refactor-roadmap.md)

---

## 0. Operator Summary

- Die Intent Engine sitzt lokal vor `midas-assistant`.
- Sie soll einfache, strukturierte Befehle sofort erkennen und dispatchen.
- Sie soll keine Werte raten, keine Beratung uebernehmen und keine vagen Aussagen in Writes umdeuten.
- Voice-Zielpfad ist spaeter:
  - Audio -> `midas-transcribe` -> Intent Engine -> Action ODER `midas-assistant` -> optional `midas-tts`
- `midas-vision` bleibt ausserhalb der Intent Engine.
- Es gibt eine eigene Implementierungs-Roadmap in `docs/archive/Intent Engine Implementation Roadmap (DONE).md`.
- Die Engine soll von Anfang an so zugeschnitten werden, dass spaetere neue Input-Kanaele ueber Adapter andockbar bleiben, ohne den Parser-Kern umzubauen.
- Der Kern (`normalizers`, `rules`, `validators`, `context`, `parser`, `index`) ist bereits umgesetzt.
- Der Adapter-/Parser-Surface fuehrt bereits einen expliziten Source-/Provenance-Contract:
  - `source_type`
  - `source_id`
  - `dedupe_key`
- Es gibt jetzt zusaetzlich einen leichten lokalen Telemetry-Snapshot fuer:
  - `decision`
  - `reason`
  - `intent_key`
  - `route`
- Die Wartungsgrenze fuer `rules.js` ist jetzt auch direkt im Code markiert:
  - nur Match-Definitionen
  - nur minimales Payload-Mapping
  - keine Validierung / kein Routing / keine Persistenzlogik
- `S7` ist abgeschlossen: positive, negative, Confirm- und Guard-Checks verhalten sich wie spezifiziert.
- `ask_confirmation` ist jetzt als zweiter konversationeller Confirm-Producer aktiv und nutzt einen festgezogenen Payload-Contract.
- Noch offen:
  - weitere Confirm-Producer ausserhalb von Suggestion-Flow und `ask_confirmation`
  - produktive Voice-Reaktivierung / lokale Voice-Dispatches
  - spaeterer echter Device-/Node-Transport inkl. Trust-/Idempotenz-Regeln

---

## 1. Zielsetzung

- Problem: einfache Befehle wie `Trage mir 300 ml Fluessigkeit ein` sind zu langsam, wenn sie immer ueber Transcribe -> LLM -> TTS laufen.
- Nutzer:
  - Patient bei Text-Eingaben.
  - Patient bei Voice-Transkripten, sobald Voice wieder aktiviert wird.
  - System, weil unnoetige LLM-Calls vermieden werden.
- Nicht Ziel:
  - medizinische Beratung.
  - freie Dialogfuehrung.
  - Spekulation ueber unklare Werte.
  - automatische Interpretation vager Aussagen.
- Architektur-Ziel:
  - Die Engine soll in V1 klein bleiben, aber spaeter erweiterbar sein fuer neue Intent-Domaenen und neue Input-Quellen wie Voice oder externe Datenknoten.

### 1.1 Nicht Teil der Intent Engine

- UI-Ideen ohne technisches Risiko
- neue allgemeine Produktwuensche ohne Intent-/Flow-Bezug
- Voice-Designfragen ohne direkten Intent-/Dispatch-Bezug
- Vision-/Foodcoach-Themen ausserhalb der Intent Engine
- allgemeine Assistant-Persona-/Prompt-Fragen, solange sie keinen deterministischen Fast-Path betreffen

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/assistant-stack/intent/index.js` | Public Entry-Point / schmale API (`parse`, Adapter-Envelope, Context-Re-Exports). |
| `app/modules/assistant-stack/intent/parser.js` | Parse-Pipeline: normalize -> rule match -> validate -> context check -> decision. |
| `app/modules/assistant-stack/intent/rules.js` | V1-Intent-Regeln / Pattern-Matching mit minimalem Payload-Mapping. |
| `app/modules/assistant-stack/intent/normalizers.js` | Normalisierung fuer Zahlen, Einheiten, Schreibweisen und einfache Synonyme. |
| `app/modules/assistant-stack/intent/validators.js` | Wertebereichs-, Pflichtfeld- und Action-Safety-Pruefungen. |
| `app/modules/assistant-stack/intent/context.js` | Pending-Intent-/Confirm-Kontextlogik inkl. Expiry/Consumed/Dedupe. |
| `app/modules/assistant-stack/assistant/actions.js` | Ziel-Actions fuer direkte Dispatches. |
| `app/modules/hub/index.js` | Produktiver Text-Eingang; hier sitzen jetzt Intent-Preflight, lokaler Direct-Dispatch, explizite Assistant-Fallback-Routen und der `LLM bypass`-Nachweis. |
| `app/modules/assistant-stack/voice/index.js` | Voice-Adapter; fuehrt Transkripte bereits durch dieselbe Engine, bleibt aber im UI weiter geparkt. |
| `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-transcribe\\index.ts` | STT-Endpunkt; liefert nur Text, keine Intent-Logik. |
| `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-assistant\\index.ts` | LLM-Fallback mit `reply + actions`; nicht der primaere Ort fuer Fast-Path-Parsing. |
| `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-tts\\index.ts` | Optionale Sprach-Ausgabe nach lokal erkanntem Intent. |
| `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-vision\\index.ts` | Separater Vision-Endpunkt; fuer Intent Engine V1 nicht relevant. |

Wichtige Architekturentscheidung:
- Die Intent Engine soll primar lokal im Frontend / Assistant-Stack liegen.
- `midas-assistant` bleibt der Fallback fuer freie Sprache, Beratung und unklare Eingaben.
- Die Zielstruktur trennt bewusst:
  - Normalisierung
  - Regel-Matching
  - Validierung
  - Kontextpruefung
  - Entscheidungsbildung

Empfohlene Zielstruktur:
```text
intent/
|- index.js
|- parser.js
|- rules.js
|- normalizers.js
|- validators.js
`- context.js
```

Aktueller Implementierungsstand:
- Diese Zielstruktur ist bereits real im Repo angelegt.
- `hub/index.js` ist produktiv an die Engine verdrahtet.
- `voice/index.js` nutzt bereits denselben Parser-Kern im Transcript-Pfad.
- Noch offen ist die produktive Voice-Reaktivierung inklusive lokalem Voice-Dispatch.

---

## 3. Datenmodell / Storage

- Kein eigener Storage.
- Intent Engine arbeitet rein im Speicher.
- Source of Truth ist immer:
  - der rohe Input-String.
  - optional der Kanal (`text`, `voice` oder spaeter `device`).
  - optional der aktuelle UI-Kontext (z. B. offene Confirm-UI, aktives Modul).
  - optional ein expliziter Quellvertrag ueber:
    - `source_type`
    - `source_id`
    - `dedupe_key`
- Kontext darf fuer Routing und Validierung genutzt werden, aber nicht zum Erfinden fehlender Werte.
- Keine Hidden Defaults:
  - fehlende Werte werden nicht automatisch ergaenzt.
  - ungefaehre Aussagen werden nicht in konkrete Zahlen umgewandelt.

### 3.1 Pending Intent Context

Fuer Intents wie `ja`, `nein`, `speichern`, `abbrechen` muss ein klarer Pending-Kontext existieren.

Minimaler geplanter Kontext:
- `pending_intent_id`
- `intent_type`
- `target_action`
- `payload_snapshot`
- `created_at`
- `expires_at`
- erweiterter produktiver Kontext / Guard-State:
  - `consumed_at`
  - `dedupe_key`
  - interner Laufzeitstatus wie `inFlight` / `consumed`

Regel:
- Ohne gueltigen Pending-Kontext darf ein Confirm/Reject-Intent keine Action ausloesen.
- Abgelaufene oder bereits konsumierte Pending-Kontexte duerfen keine Action mehr freigeben.

Aktueller Implementierungsstand:
- `context.js` kann Pending-Kontexte bereits erzeugen, pruefen, konsumieren und gegen Kriterien matchen.
- Im Text-Flow ist dieser Kontext jetzt produktiv fuer:
  - suggestion-basierte `confirm_reject`-Intents
  - Assistant-`ask_confirmation`-Actions mit strengem Payload-Contract:
    - `target_action`
    - `payload_snapshot`
    - optional `dedupe_key`, `ttl_ms`, `expires_at`, `confirm_accept_reply`, `confirm_reject_reply`
- Weitere Confirm-Producer ausserhalb von Suggestion-Flow und `ask_confirmation` sind noch offen.

### 3.2 Zukunftspfad fuer externe Datenknoten

- Die Intent Engine soll spaeter auch nicht-menschliche Quellen verarbeiten koennen, sofern diese in denselben deterministischen Contract uebersetzt werden.
- Geplanter Zukunftsfall:
  - DIY-ESP32-Uhr oder aehnlicher Datenknoten als MIDAS-Node
- Konsequenz fuer die Architektur:
  - Parser-Kern soll kanalagnostisch bleiben.
  - Quellenspezifische Vorverarbeitung liegt in Adaptern vor dem Parser, nicht im Parser selbst.
  - `device`-Quellen brauchen spaeter klare Provenance-, Dedupe- und Trust-Regeln.
  - Der aktuelle Intent-Surface fuehrt dafuer bereits explizit:
    - `source_type`
    - `source_id`
    - `dedupe_key`
- Nicht Ziel fuer V1:
  - direkte ESP32-Integration oder eigener Node-Transport

---

## 4. Einsatzgebiet / Scope

### 4.1 Position in der Kette

- Text:
  - User-Eingabe -> Hub -> Intent Engine -> direkter Action-Dispatch ODER Fallback an `midas-assistant`
- Voice:
  - Audio -> `midas-transcribe` -> Intent Engine -> direkter Action-Dispatch ODER Fallback an `midas-assistant` -> optional `midas-tts`
- Device / Node (spaeter):
  - Node-Payload -> Node-Adapter / Normalisierung -> Intent Engine -> direkter Action-Dispatch ODER alternativer Ingest-Pfad
- Vision:
  - bleibt im separaten `midas-vision`-Pfad und ist kein Bestandteil der Intent Engine V1.

### 4.2 Erste Intent-Klassen fuer MIDAS

- `confirm_reject`
  - Beispiele: `ja`, `nein`, `speichern`, `abbrechen`
- `intake_quick_add`
  - Beispiele: `Wasser 300 ml`, `Trage mir 300 ml Fluessigkeit ein`, `Protein 24 Gramm`
- `vitals_quick_log`
  - Beispiele: `Blutdruck 128 zu 82`, `Puls 66`, `Gewicht 78,4`
- `simple_navigation`
  - Beispiele fuer V1: `Oeffne Vitals`, `Gehe zu Medikamente`
  - Nicht fuer V1: mehrdeutige Formen wie `Zeig mir Blutdruck`, wenn der UI-Zielzustand nicht explizit feststeht
- `simple_medication_confirm`
  - nur als spaeterer V1.5/V2-Kandidat und nur mit klaren Guardrails

Aktueller Implementierungsstand:
- Diese vier V1-Klassen sind in `rules.js` bereits als Kernregeln umgesetzt.
- `simple_navigation` bleibt bewusst eng:
  - `Oeffne Vitals`
  - `Gehe zu Medikamente`
- Mehrdeutige Navigation wie `Zeig mir Blutdruck` faellt aktuell absichtlich nicht auf einen lokalen Match.

### 4.3 Was bewusst nicht in V1 gehoert

- vage Aussagen:
  - `Heute habe ich zu wenig getrunken`
  - `Mein Blutdruck war heute so um die 130`
- beratende Fragen:
  - `Ist das bedenklich?`
  - `Was soll ich heute essen?`
- freie Symptom- oder Alltagsschilderungen
- komplexe Terminlogik oder Mehrschritt-Interpretationen

### 4.4 Action Safety Classes

- `safe_read`
  - Navigation, Moduloeffnung, Statusanzeige
  - keine Persistenz, kein Confirm noetig
- `guarded_write`
  - klare Intake-/Vitals-Writes mit vollstaendigem Payload
  - direkte Ausfuehrung moeglich, aber nur nach strenger Validierung
- `confirm_only`
  - Actions mit bestehendem Confirm-Kontext oder hoeherem Fehlerrisiko
  - Beispiel: `ja`, `nein`, spaeter evtl. Medikament-Bestaetigungen
- `forbidden_for_intent_engine`
  - Beratung, freie Medizinfragen, komplexe Umdeutungen, unklare Writes

---

## 5. Grenze zwischen Intent Engine und LLM

Die Intent Engine darf nur dann direkt handeln, wenn die Eingabe:
- kurz ist,
- strukturiert ist,
- eindeutig ist,
- deterministisch validiert werden kann,
- und ohne Interpretationsspielraum einer bekannten Action zuordenbar ist.

Der LLM-Fallback ist zustaendig fuer alles, was:
- mehrdeutig ist,
- Beratung oder Erklaerung verlangt,
- freie Sprache enthaelt,
- fehlende Werte offenlaesst,
- oder medizinische Einordnung braucht.

Faustregel:
- `parse -> validate -> dispatch` = Intent Engine
- `interpret -> reason -> answer` = LLM

Explizit verboten fuer die Intent Engine:
- fehlende Werte raten
- ungefaehre Angaben speichern
- vage Aussagen in konkrete Writes umdeuten
- Sicherheitsgrenzen "smart" ueberschreiben

### 5.1 Entscheidungszustaende

Geplante Ergebnis-Klassen fuer das Parsing:
- `direct_match`
  - eindeutig, vollstaendig, validiert, direkt dispatchbar
- `needs_confirmation`
  - semantisch erkannt, aber nur mit aktivem Confirm-Kontext oder Rueckfrage ausfuehrbar
- `fallback`
  - unklar, mehrdeutig, beratend oder ausserhalb des Rule-Sets

Diese drei Zustaende sind wichtiger als ein "smarter" Confidence-Score.

Aktueller Implementierungsstand:
- `parser.js` liefert diese drei Decision-States bereits real aus.
- Aktuell werden `confirm_reject`-Intents bewusst noch nicht direkt freigegeben:
  - auch mit gueltigem Pending-Kontext liefert der Parser derzeit `needs_confirmation`
  - die eigentliche Confirm-Freigabe passiert bewusst erst in der Flow-Schicht des Hubs

---

## 6. Ablauf / Logikfluss

### 6.1 Initialisierung

- Modul wird vom Hub / Assistant-Stack geladen.
- Keine Backend-Initialisierung noetig.
- Keine Auth-Abhaengigkeit fuer das Parsing selbst.

### 6.2 Trigger

- Text-Chat Send.
- Voice-Transkript nach `midas-transcribe`, sobald Voice wieder aktiviert wird.
- Optional spaeter: Device-Adapter-Input fuer externe Datenknoten mit demselben Decision-Contract.
- Optional spaeter: globale Schnellbefehle in anderen Hub-Eingaben.

### 6.3 Verarbeitung

- Pipeline:
  - normalize
  - match rule
  - validate
  - produce decision
- Input normalisieren:
  - Zahlenformate (`78,4` -> `78.4`)
  - Einheiten (`ml`, `g`, `gramm`)
  - sprachliche Varianten (`fluessigkeit`, `wasser`)
- Regeln pruefen.
- Treffer validieren:
  - Wertebereich
  - benoetigte Felder vollstaendig
  - Kontext vorhanden, falls noetig
- Ergebnis:
  - direkter Action-Dispatch
  - Confirm/Reject-Handling
  - oder LLM-Fallback

Aktueller Implementierungsstand:
- Der Parser-Kern verarbeitet bereits:
  - `normalize`
  - `match rule`
  - `validate`
  - `context check`
  - `produce decision`
- Im produktiven Text-Flow bereits umgesetzt:
  - Intent-Preflight vor `midas-assistant`
  - lokaler Direct-Dispatch fuer die aktuell unterstuetzten Allowed-Actions
  - zusaetzlicher lokaler Guarded-Dispatch fuer:
    - `vitals_log_weight`
    - `vitals_log_bp` bei explizitem Kontext im Intent
  - lokales Confirm-/Reject-Handling fuer suggestion-basierte Pending Contexts
  - lokales Confirm-/Reject-Handling fuer generische Pending Contexts aus Assistant-`ask_confirmation`
  - `in-flight`-/`consumed`-/Dedupe-Guards fuer Confirm-Reuse
  - expliziter Assistant-Fallback fuer `fallback`, `needs_confirmation` und nicht lokal dispatchbare `direct_match`-Faelle
  - minimaler Chat-Reply fuer lokal ausgefuehrte Treffer
  - expliziter `LLM bypass`-Nachweis fuer erfolgreich lokal erledigte Befehle
- Im Voice-Pfad bereits vorbereitet:
  - Transcript-Preflight ueber dieselbe Intent Engine
  - lokaler Direct-Dispatch fuer die bereits freigegebenen Intent-Actions
  - lokaler Voice-Bypass vor dem Assistant-Roundtrip
  - lokale Kurz-Bestaetigung ueber den bestehenden TTS-Pfad
  - explizite Route-/Diagnosedaten vor dem Assistant-Roundtrip
  - weiterhin keine produktive UI-Reaktivierung des Voice-Einstiegs im Hub

### 6.4 Normalisierung - Mindestumfang

- Zahlen:
  - `78,4` -> `78.4`
  - `1,5` -> `1.5`
- Einheiten:
  - `milliliter`, `ml` -> `ml`
  - `gramm`, `g` -> `g`
- sprachliche Varianten:
  - `fluessigkeit` kann fuer Wasser-/Intake-Quick-Adds erlaubt sein
  - `blutdruck 128 zu 82` muss in systolisch/diastolisch zerlegt werden

### 6.5 Normalisierungsbeispiele

- `Trage mir 300 ml Fluessigkeit ein`
  - intent: `intake_quick_add`
  - normalized payload: `{ water_ml: 300 }`
- `Blutdruck 128 zu 82`
  - intent: `vitals_quick_log`
  - normalized payload: `{ systolic: 128, diastolic: 82 }`
- `Blutdruck morgens 128 zu 82`
  - intent: `vitals_quick_log`
  - normalized payload: `{ systolic: 128, diastolic: 82, context: 'M' }`
- `Gewicht 78,4`
  - intent: `vitals_quick_log`
  - normalized payload: `{ weight_kg: 78.4 }`

### 6.6 Persistenz

- Keine direkte Persistenz im Intent-Modul.
- Writes laufen ueber bestehende Actions / UI-Flows.
- Keine Doppel-Saves, keine parallelen Writes ohne Guardrails.

---

## 7. UI-Integration

- Keine eigene Haupt-UI.
- Intent Engine ist primar Infrastruktur.
- Moegliche UI-Ausgabe:
  - kurze lokale Bestaetigung im Chat
  - Wiederverwendung bestehender Confirm-UI fuer riskantere Actions
  - spaeter optional ein kompakter Hinweis wie `Befehl erkannt`

Wichtige UX-Regel:
- Ein lokal erkannter Intent soll sich schneller anfuehlen als der LLM-Weg, aber nicht "magisch".
- Bei Unsicherheit lieber Fallback oder Rueckfrage statt stiller Fehlaktion.

---

## 8. Fehler- & Diagnoseverhalten

- Regel nicht erkannt -> sauberer LLM-Fallback.
- Mehrdeutige oder unvollstaendige Eingabe -> kein Write.
- Parsing- oder Validierungsfehler -> optional kurze Rueckmeldung, sonst Fallback.
- Logging / Diagnose spaeter ueber `diag.add` oder vergleichbare Debug-Hooks.
- Zusaetzlich existiert jetzt ein leichter Intent-Telemetry-Snapshot direkt am Intent-Surface.

Typische Failure-Modes:
- fehlende Einheit
- unklarer Wertebereich
- `ja/nein` ohne aktiven Confirm-Kontext
- Voice-Transkript mit zu starkem Rauschen / Segmentierungsfehlern
- spaeter: Device-Payload ohne klare Quelle, Idempotenz oder Trust-Einstufung

### 8.1 Troubleshooting Quick Path

- Wenn ein einfacher Befehl unnoetig beim LLM landet:
  - zuerst Normalisierung pruefen
  - dann Regel-Match pruefen
  - dann Validierungsgrenzen pruefen
- Wenn `ja/nein` falsch reagiert:
  - Pending Intent Context pruefen
  - Expiry / bereits konsumierten Zustand pruefen
  - Confirm-Quelle und Dedupe pruefen
- Wenn doppelte Writes auftreten:
  - Action-Dispatch und Confirm-Flow auf Dedupe / Re-Entrancy pruefen
- Wenn Voice zu langsam bleibt:
  - pruefen, ob nach `midas-transcribe` wirklich ein lokaler Match versucht wird
  - pruefen, ob unnoetig direkt an `midas-assistant` weitergereicht wird

---

## 9. Events & Integration Points

- Modul-API aktuell:
  - `parse(rawText, options?)`
  - `parseIntent(rawText, options?)`
  - `createAdapterInput(rawText, options?)`
  - `parseAdapterInput(adapterInput)`
  - `createPendingIntentContext(...)`
  - `getPendingContextState(...)`
  - `consumePendingIntentContext(...)`
  - `recordTelemetry(event)`
  - `getTelemetrySnapshot()`
  - `resetTelemetry()`
- Geplanter spaeterer App-Surface:
  - `AppModules.intentEngine.parse(text, context?)`
  - optional spaeter: `AppModules.intentEngine.handle(text, context?)`
- Geplanter Output:
  - `decision`
  - `intent_key`
  - `payload`
  - `target_action`
  - `fallback_required`
  - `reason` bei Reject/Fallback
  - aktuell bereits:
    - `source_type`
    - `source_id`
    - `dedupe_key`

Integration Points:
- Hub / Text-Eingang
- Voice-Adapter nach `midas-transcribe`
- `assistant/actions.js` als Dispatch-Ziel
- bestehende Confirm-/Suggest-Flows fuer `ja/nein`
- spaeter: Node-Adapter fuer externe Datenquellen wie eine DIY-ESP32-Uhr

Aktueller Implementierungsstand:
- Die API existiert aktuell als ES-Modul unter `app/modules/assistant-stack/intent/index.js`.
- Eine globale `AppModules.intentEngine`-Verdrahtung existiert jetzt.
- Der Hub nutzt diese Public API produktiv fuer Text-Inputs.
- Hub und Voice nutzen jetzt denselben Adapter-Eingangspunkt (`parseAdapterInput(...)`).
- Hub und Voice speisen jetzt zusaetzlich einen gemeinsamen leichten Telemetry-Snapshot am Intent-Surface.
- Der Adapter-/Parser-Surface fuehrt jetzt explizit Quell-Provenance mit:
  - `source_type`
  - `source_id`
  - `dedupe_key`
- Erlaubte Quellen bleiben aktuell bewusst klein:
  - `text`
  - `voice`
  - `device`
- Backend-`ask_confirmation`-Actions werden im produktiven Hub-Flow ausgewertet und koennen Pending Contexts fuer lokale `ja/nein/speichern/abbrechen`-Folgeeingaben aufspannen.
- Produktiv lokal dispatchbar ueber den bestehenden Allowed-Action-/Hub-Pfad bleiben:
  - `intake_save`
  - `open_module`
- Zusaetzlich produktiv lokal dispatchbar ueber schmale vitals-spezifische Guarded-Helper:
  - `vitals_log_weight`
  - `vitals_log_bp` bei explizitem Kontext im Intent
- Weiterhin bewusst nicht lokal dispatchbar:
  - `vitals_log_pulse`
  - `vitals_log_bp` ohne expliziten Kontext
- Im Voice-Modul existiert derselbe lokale Fast-Path fuer diese freigegebenen Direct-Matches bereits ebenfalls:
  - inklusive lokalem Bypass des Assistant-Roundtrips
  - inklusive kurzer lokaler TTS-Bestaetigung
  - aber noch ohne produktive UI-Reaktivierung des Voice-Einstiegs
- Bewusste Produktentscheidung:
  - `vitals_log_pulse` bleibt in V1 absichtlich Assistant-Fallback.
  - Grund:
    - der aktuelle produktive Vitals-Vertrag kennt Puls nicht als eigenstaendigen lokalen Save-Pfad
    - Puls ist heute fachlich an den BP-Kontext gekoppelt
    - ein `pulse-only`-Write wuerde einen neuen Persistenz-Contract erfordern, nicht nur einen weiteren Intent-Match
  - Konsequenz:
    - das ist keine vergessene Luecke, sondern eine bewusst konservative Scope-Grenze
    - eine spaetere Freigabe darf nur zusammen mit einem explizit definierten Daten-/Kontextvertrag erfolgen

### 9.1 Change Impact Map

Wenn sich eines der folgenden Dinge aendert, sollte die Intent Engine mitgeprueft werden:

- neue Action-Typen in `assistant/actions.js`
- geaenderte Confirm-/Suggest-Flows
- neue Voice-Transkriptformate oder Segmentierung
- neue externe Input-Kanaele oder Node-Adapter
- neue Module mit strukturierter Datenerfassung
- geaenderte Namens-/Einheitenkonventionen in UI oder Actions

Hohe Impact-Zonen:
- `app/modules/hub/index.js`
- `app/modules/assistant-stack/intent/parser.js`
- `app/modules/assistant-stack/intent/rules.js`
- `app/modules/assistant-stack/intent/validators.js`
- `app/modules/assistant-stack/intent/context.js`
- `app/modules/assistant-stack/assistant/actions.js`
- spaeter `app/modules/assistant-stack/voice/index.js`
- spaeter eventuelle Node-Adapter / Ingest-Bridges
- alle neuen Schnell-Write-Domaenen (Vitals, Intake, Medication)

Nicht Ziel:
- Backend-zentrierte Intent-Ausfuehrung in `midas-assistant`
- Verschmelzung mit Vision-Parsing

---

## 10. Feature-Flags / Konfiguration

- Optional: `INTENT_ENGINE_ENABLED`
- Optional: `INTENT_ENGINE_DEBUG`
- Optional spaeter:
  - source-spezifische Adapter-Flags nur bei echtem Bedarf

---

## 11. Status / Dependencies / Risks

- Status:
  - Kern implementiert
  - produktive Text-Integration aktiv
  - `vitals_quick_log` ist partiell lokal freigegeben:
    - Gewicht direkt
    - Blutdruck nur mit explizitem Kontext
  - Confirm-/Context-Freigaben fuer suggestion-basierte Flows aktiv
  - Assistant-`ask_confirmation` ist als weiterer konversationeller Confirm-Producer aktiv
  - weitere Confirm-Producer noch offen
  - Voice-Preflight, Voice-Fassade und lokaler Voice-Bypass fuer freigegebene Direct-Matches sind implementiert
  - `confirm_reject` bleibt im Voice-Pfad bewusst noch ohne produktiven Pending-Context
  - produktive Voice-Integration noch offen
- Hard Dependencies:
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/assistant/actions.js`
- Soft Dependencies:
  - `app/modules/assistant-stack/voice/index.js`
  - aktueller UI-/Confirm-Kontext
- Backend Dependencies:
  - `midas-transcribe` fuer Voice-Text
  - `midas-assistant` als Fallback
  - `midas-tts` optional fuer schnelle Rueckgabe nach lokalem Match

Risiken:
- zu "smarte" Regeln fuehren zu Fehlaktionen
- medizinische Werte duerfen nicht geraten werden
- `ja/nein` braucht klaren Pending-Kontext
- zu breite Synonym-Parser koennen ungewollte Matches ausloesen
- spaetere Device-Quellen brauchen saubere Provenance-, Idempotenz- und Trust-Regeln, sonst drohen stille Fehlwrites
- lokale Direct-Dispatches duerfen nur ueber reale Allowed-Action-/Guardrail-Pfade wachsen
- `ask_confirmation` muss beim Backend-Contract strikt bleiben; neue Alias-Felder oder implizite Payload-Ableitungen wuerden den gehärteten Confirm-Pfad wieder aufweichen
- `vitals_quick_log` bleibt nur teilweise lokal dispatchbar:
  - Gewicht ist lokal freigegeben
  - Blutdruck nur mit explizitem Kontext
  - Puls bleibt bewusst blockiert, bis ein eigener Guarded-Path existiert
- `Puls` ist dabei bewusst nicht "halb freigegeben":
  - kein lokaler `pulse-only`-Write ohne vorherige fachliche Entscheidung ueber Persistenz, Kontext und Darstellung in UI/Doctor/Charts

---

## 12. QA-Checkliste

- `Trage mir 300 ml Fluessigkeit ein` -> direkter Fast-Path, kein LLM-Call
- `Wasser 300 ml` -> direkter Fast-Path
- `Blutdruck morgens 128 zu 82` -> direkter Fast-Path, lokaler Guarded-Dispatch
- `Blutdruck 128 zu 82` -> lokaler Match im Intent-Preflight; ohne expliziten Kontext weiterhin kontrollierter Assistant-Fallback
- `Gewicht 78,4` -> direkter Fast-Path, lokaler Guarded-Dispatch
- `Puls 66` -> lokaler Match im Intent-Preflight; aktuell noch kein produktiver lokaler Dispatch, daher kontrollierter Assistant-Fallback
- `Ja` / `Nein` funktionieren nur mit aktivem Confirm-Kontext
- `Heute habe ich zu wenig getrunken` -> kein Write, sauberer LLM-Fallback
- `Blutdruck war so um die 130` -> kein direkter Save
- keine Doppel-Saves bei Confirm-Intents
- Voice und Text nutzen dieselbe Intent-Logik nach Vorliegen des Transkripts
- einfache lokal unterstuetzte Text-Befehle fuehren zu keinem unnoetigen `midas-assistant`-Call
- spaeter: neue Kanaele wie `device` duerfen denselben Decision-Contract nutzen, ohne Parser-Sonderpfade zu erzwingen

---

## 13. Definition of Done

- Lokaler Fast-Path fuer die ersten MIDAS-Intent-Klassen laeuft ohne Errors.
- Klare Trennung zwischen Intent Engine und LLM ist im Code eingehalten.
- Direkte Actions werden deterministisch und ohne Doppel-Saves ausgeloest.
- Voice kann spaeter dieselbe Engine wiederverwenden.
- Die Architektur blockiert spaetere externe Datenknoten wie eine DIY-ESP32-Uhr nicht und erzwingt dafuer keinen Parser-Umbau.
- Dokumentation aktuell und mit der realen Backend-/Frontend-Architektur synchron.

Aktueller Zwischenstand:
- Der Kern ist gebaut und isoliert testbar.
- Der Text-Fast-Path ist produktiv aktiv.
- Confirm-/Context-Handling ist fuer suggestion-basierte Flows und Assistant-`ask_confirmation` produktiv aktiv.
- `S7`-Verifikation ist abgeschlossen; keine offensichtliche statische Drift zwischen Intent-Kern, Hub und vorbereitetem Voice-Pfad festgestellt.
- Der `ask_confirmation`-Payload-Contract ist auf explizite Felder eingegrenzt und damit deutlich wartbarer als der vorher tolerantere Uebergangszustand.
- `Definition of Done` ist noch nicht erreicht, solange weitere Confirm-Producer, ein produktiver Pending-Context fuer Voice-Confirms und die UI-seitige Voice-Reaktivierung noch offen sind.



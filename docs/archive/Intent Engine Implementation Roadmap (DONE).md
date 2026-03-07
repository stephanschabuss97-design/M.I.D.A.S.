# Intent Engine Implementation Roadmap (DONE)

## Ziel (klar und pruefbar)
In MIDAS soll eine lokale, deterministische Intent Engine vor dem Assistant-LLM eingefuehrt werden, damit einfache strukturierte Befehle in Text und spaeter Voice ohne LLM-Call erkannt und direkt ausgefuehrt werden koennen.

Pruefbare Zieldefinition:
- Einfache strukturierte Befehle werden lokal verarbeitet, ohne `midas-assistant` aufzurufen.
- V1 deckt mindestens `confirm_reject`, `intake_quick_add`, `vitals_quick_log` und `simple_navigation` ab.
- Unklare, vage oder beratende Eingaben fallen sauber an `midas-assistant` zurueck.
- Confirm-/Reject-Intents funktionieren nur mit gueltigem Pending Intent Context.
- Direkte Writes passieren nur nach deterministischer Validierung und ohne Doppel-Saves.
- Dieselbe Parse-Logik ist fuer Text sofort nutzbar und fuer Voice-Transkripte wiederverwendbar.

## Scope
- Lokale Intent-Engine im `assistant-stack` als Fast-Path vor dem LLM.
- Parser-Pipeline mit klarer Trennung von:
  - Normalisierung
  - Regel-Matching
  - Validierung
  - Kontextpruefung
  - Entscheidungsbildung
- Integration in den bestehenden Text-Assistant-Flow.
- Vorbereitung der Wiederverwendung fuer Voice-Transkripte.
- Architektur so anlegen, dass spaetere weitere Input-Kanaele ueber Adapter andocken koennen, ohne den Parser-Kern umzubauen.
- Guardrails fuer Confirm-/Reject-Kontext, No-Hidden-Defaults und LLM-Fallback.
- QA-Smokes fuer deterministische Matches, Rejects und Regressionen im Assistant-Flow.

## Not in Scope
- Reaktivierung des Voice-UI-Buttons oder kompletter Voice-UX-Relaunch.
- Verlagerung der Intent-Logik in `midas-assistant`.
- Vision-Parsing oder `midas-vision`-Integration.
- Direkte Implementierung einer DIY-ESP32-Uhr oder eines Node-Transportpfads.
- Freie Beratung, Symptombeurteilung oder medizinische Interpretation.
- Mehrsprachigkeit, ML-basiertes Scoring oder "smarte" Heuristiken ueber V1 hinaus.
- Neue Dependencies oder Framework-Wechsel.

## Relevante Referenzen (Code)
- `app/modules/hub/index.js`
- `app/modules/assistant-stack/assistant/actions.js`
- `app/modules/assistant-stack/assistant/allowed-actions.js`
- `app/modules/assistant-stack/assistant/suggest-store.js`
- `app/modules/assistant-stack/assistant/suggest-ui.js`
- `app/modules/assistant-stack/voice/index.js`
- `index.html`
- `app/styles/hub.css`
- `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-assistant\\index.ts`
- `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-transcribe\\index.ts`
- `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-tts\\index.ts`
- `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-vision\\index.ts`

## Relevante Referenzen (Doku)
- `docs/modules/Intent Engine Module Overview.md`
- `docs/modules/Assistant Module Overview.md`
- `docs/modules/Hub Module Overview.md`
- `docs/modules/VAD Module Overview.md`
- `docs/archive/Breath Timer Implementation Roadmap (DONE).md` (Vorlagenstruktur)
- `docs/archive/assistant-multimodal-polish-roadmap.md`
- `docs/archive/assistant-stack-refactor-roadmap.md`
- `docs/QA_CHECKS.md`
- `CHANGELOG.md`

## Guardrails
- Die Intent Engine darf keine Werte raten oder fehlende Daten erfinden.
- Vage Aussagen duerfen niemals in direkte Writes umgedeutet werden.
- Confirm-/Reject-Intents duerfen ohne Pending Intent Context nichts ausloesen.
- Assistant-LLM bleibt der Default-Fallback fuer alles Nicht-Deterministische.
- Kein Regressionseintrag im bestehenden Assistant-, Suggest- oder Action-Flow.
- Keine Doppel-Saves und keine parallelen Writes durch Re-Entrancy.
- `rules.js` darf nicht zum Sammelpunkt fuer Validierung, Kontextlogik, Routing oder Domain-Sonderfaelle werden.
- `simple_navigation` bleibt in V1 strikt auf explizite, eindeutig aufloesbare Ziele begrenzt.
- `intake_quick_add` und `vitals_quick_log` akzeptieren in V1 nur klare, vollstaendige Muster; halbsprachliche Formulierungen fallen an den LLM-Fallback.
- Spaetere externe Datenquellen muessen ueber Adapter andocken; parserinterne Sonderpfade fuer einzelne Geraete sind zu vermeiden.

## Architektur-Constraints
- Das Modul lebt lokal in `app/modules/assistant-stack/intent/`.
- Die Zielstruktur trennt bewusst:
  - `index.js`
  - `parser.js`
  - `rules.js`
  - `normalizers.js`
  - `validators.js`
  - `context.js`
- Text und Voice muessen dieselbe Parse-Logik wiederverwenden.
- `midas-assistant` bleibt Fallback und wird nicht zum primaeren Intent-Ort umgebaut.
- Writes laufen weiterhin ueber bestehende Actions / Guards.
- Keine neuen globalen Events ohne klaren Mehrwert.
- `rules.js` enthaelt nur Match-Definitionen und minimales Payload-Mapping.
- Validierung bleibt in `validators.js`, Pending-/Confirm-Logik bleibt in `context.js`, Routing-/Decision-Logik bleibt in `parser.js`.
- Der Input-Contract soll spaeter zusaetzliche Quellen wie `device` aufnehmen koennen, ohne das Ergebnis-Schema zu aendern.
- Quellenspezifische Vorverarbeitung fuer spaetere Nodes oder Geraete gehoert vor den Parser, nicht in den Parser-Kern.

## Tool Permissions
Allowed:
- Bestehende Assistant-/Hub-/Voice-Dateien lesen und innerhalb Scope aendern.
- Neues Intent-Modul im vorgesehenen Ordner anlegen.
- Doku-, QA- und Changelog-Eintraege in bestehenden Ordnern erstellen/aktualisieren.
- Lokale Smokechecks, Syntaxchecks und gezielte Harness-Checks ausfuehren.

Forbidden:
- Neue Dependencies einfuehren.
- `midas-assistant` in einen primaeren Intent-Parser umbauen.
- Voice-UI ungefragt reaktivieren.
- Unverwandte Module refactoren.

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S8`).
- Keine Schritte ueberspringen ohne dokumentierte Begruendung.
- Nach jedem Schritt Statusmatrix aktualisieren.
- Nach jedem Schritt mindestens ein Check (Smoke/Sanity/Syntax).

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Ist-Analyse Assistant/Hub/Voice/Action-Entry-Points | DONE | Text-Assistant, Allowed-Actions, Suggest-/Confirm-Flow, geparkter Voice-Pfad und reale Backend-Verantwortung sind gegen den geplanten Intent-Fast-Path gemappt. |
| S2 | V1-Scope, Decision-Contract und Safety-Regeln finalisieren | DONE | V1-Intent-Klassen, Decision-States, Action-Safety-Classes, Pending-Context-Vertrag und harte V1-Grenzen fuer Navigation, Writes und Flags sind final spezifiziert. |
| S3 | Modul-Architektur und Parser-Pipeline spezifizieren | DONE | Zielstruktur, Dateirollen, Parser-Input/Output, Debug-Seams und Adapter-Grenzen fuer Voice/Device sind final spezifiziert und direkt implementierbar. |
| S4 | Core-Engine implementieren (`normalizers`, `rules`, `validators`, `context`, `parser`) | DONE | Kernmodul unter `app/modules/assistant-stack/intent/` implementiert: Normalisierung, Regeln, Validierung, Pending-Context, Parser und Public API sind gebaut und per Syntax-/Runtime-Smokes geprueft. |
| S5 | Text-Fast-Path in den Assistant-Flow integrieren | DONE | Hub fuehrt jetzt einen lokalen Intent-Preflight aus, dispatcht direkt nur die heute real unterstuetzten Allowed-Actions, leitet `fallback`-/`needs_confirmation`-/unsupported-Direct-Matches explizit in den bestehenden Assistant-Pfad weiter, zeigt lokale Treffer als minimale Chat-Bestaetigung an und markiert erfolgreiche lokale Treffer explizit als `LLM bypass`. |
| S6 | Confirm-/Context-Handling und Voice-Wiederverwendbarkeit absichern | DONE | Confirm-Intents sind an einen gueltigen Pending Intent Context gekoppelt, gegen `in-flight`/`consumed`/Dedupe-Reuse abgesichert, der Voice-Transkriptpfad fuehrt jetzt dieselbe Intent Engine vor dem Assistant-Roundtrip aus, ein optionaler lokaler TTS-Rueckkanal ist vorbereitet, geparktes Voice wird explizit als stabiler Architekturzustand behandelt und ein formaler Adapter-Eingangspunkt verhindert spaetere Parser-Sonderlogik fuer `device`-Quellen. |
| S7 | Smokechecks, Reject/Fallback-Checks und Regressionsabsicherung | DONE | `S7.1-S7.5` abgeschlossen: positive und negative Intent-Faelle, Confirm-Kontext, Re-Entrancy-/Dedupe-Guards sowie Syntax-/Static-Checks verhalten sich wie spezifiziert. |
| S8 | Doku-Sync, QA_CHECKS, CHANGELOG | DONE | Intent-Engine-Overview, Assistant-Overview, QA_CHECKS und CHANGELOG auf den Stand nach `S7` synchronisiert; Rest-Risiken und offene Follow-ups sind dokumentiert. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Schritte + Subschritte

### S1 - Ist-Analyse Assistant/Hub/Voice/Action-Entry-Points
- S1.1 Bestehenden Text-Assistant-Flow in `app/modules/hub/index.js` mappen.
- S1.2 Bestehende Action-Dispatch-/Allowed-Actions-Pfade erfassen.
- S1.3 Confirm-/Suggest-Flow fuer `ja/nein` und `speichern/abbrechen` analysieren.
- S1.4 Voice-Adapter + `midas-transcribe` / `midas-tts` Rueckkanal analysieren.
- S1.5 Reale Backend-Verantwortung von `midas-assistant`, `midas-transcribe`, `midas-tts`, `midas-vision` gegen den geplanten Fast-Path abgleichen.

#### S1 Ergebnisprotokoll (abgeschlossen)
- S1.1 Befund (Text-Assistant-Flow, real):
  - Der produktive Text-Chat wird in `app/modules/hub/index.js` direkt verdrahtet, nicht ueber `assistant/session-agent.js`.
  - Initialisierung:
    - `setupAssistantChat(hub)` baut `assistantChatCtrl` auf, bindet `#assistantChatForm`, `#assistantMessage`, `#assistantSendBtn` und den Chat-Container.
  - Submit-Flow:
    - `handleAssistantChatSubmit` entscheidet zwischen normalem Text-Submit und Foto-/Vision-Submit.
    - Reiner Text geht in `sendAssistantChatMessage(text)`.
    - `sendAssistantChatMessage`:
      - appended User-Bubble lokal,
      - setzt `sending`,
      - ruft `fetchAssistantTextReply(text)` auf,
      - appended Assistant-Reply als Bubble.
  - Backend-Aufruf:
    - `fetchAssistantTextReply` postet direkt an `MIDAS_ENDPOINTS.assistant`.
    - Payload enthaelt:
      - `session_id`
      - `mode: 'text'`
      - `messages` aus `assistantChatCtrl.messages`
      - `context` aus `buildAssistantTurnPayload(...)`
  - Wichtige Realitaet fuer die Intent Engine:
    - Der naechste Fast-Path-Hook liegt im Hub-Text-Submit vor `fetchAssistantTextReply`, nicht im ungenutzten `AssistantSession.sendUserMessage()`.

- S1.2 Befund (Action-Dispatch-/Allowed-Actions-Pfade, real):
  - Es gibt zwei Schichten:
    - `app/modules/assistant-stack/assistant/allowed-actions.js`
      - Whitelist, Stage-/Auth-Guards, Touchlog/Diag.
      - Dispatcher-Entry: `executeAllowedAction(type, payload, options)`.
    - `app/modules/assistant-stack/assistant/actions.js`
      - eigentlicher Action-Dispatcher `dispatchAssistantActions(...)`.
      - verarbeitet aktuell u. a.:
        - `intake_save`
        - `open_module`
        - `show_status`
        - `highlight`
        - `ask_confirmation`
        - `close_conversation`
        - `transition_to_photo_mode`
        - `transition_to_text_chat`
        - `suggest_intake`
        - `confirm_intake`
  - Reale Flow-Bedeutung:
    - Direkte lokale Intent-Matches fuer Writes/Navigation sollten nicht an dieser Schicht vorbei schreiben.
    - Bestehende Guardrails in `allowed-actions.js` sind fuer spaetere Intent-Dispatches wiederverwendbar.
  - Wichtiger Architekturhinweis:
    - `assistant/index.js` + `session-agent.js` existieren, sind im aktuellen Hub-Textflow aber nicht verdrahtet.
    - Die Intent Engine darf deshalb V1 nicht auf diesen ungenutzten Abstraktionspfad aufbauen.

- S1.3 Befund (Confirm-/Suggest-Flow, real):
  - Der eigentliche Ja/Nein-Suggest-Flow ist heute vision-/suggestion-getrieben, nicht allgemeiner Pending-Intent-Flow.
  - `suggest-store.js`:
    - haelt `snapshot`, `suggestionQueue`, `activeSuggestion`.
    - feuert Events:
      - `assistant:snapshot-updated`
      - `assistant:suggest-updated`
      - `assistant:suggest-dismissed`
  - `suggest-ui.js`:
    - rendert Inline-Confirm-Block im Chat.
    - dispatcht:
      - `assistant:suggest-confirm` bei `Ja, speichern`
      - `assistant:suggest-answer` bei `Nein`
      - reagiert auf `assistant:suggest-confirm-reset` und `assistant:action-success`
  - `hub/index.js`:
    - `handleSuggestionConfirmRequest(suggestion)` mappt Suggestion-Metriken auf `intake_save`.
    - fuehrt `runAllowedAction('intake_save', payload, { source: 'suggestion-card' })` aus.
    - bei Erfolg:
      - dismiss current suggestion
      - append Assistant-Bestaetigung
      - refresh Kontext
      - create meal follow-up prompt
  - Wichtiger Befund fuer Intent Engine:
    - Ein generischer Pending-Intent-Context existiert noch nicht.
    - Aktuell gibt es nur domain-spezifische Confirm-Flows (Suggestion-Confirm, Meal-Followup).
    - `ja/nein`, `speichern`, `abbrechen` muessen fuer die Intent Engine daher als neuer, expliziter Context-Contract gebaut werden.

- S1.4 Befund (Voice-Adapter + Rueckkanal, real):
  - `app/modules/assistant-stack/voice/index.js` ist vorhanden, aber Voice ist im Hub aktuell geparkt:
    - `VOICE_PARKED = true` in `hub/index.js`
    - Script-Einbindung in `index.html` auskommentiert
  - Technischer Voice-Flow im Modul:
    - Aufnahme via `MediaRecorder`
    - STT via `midas-transcribe`
    - Assistant-Roundtrip via `midas-assistant`
    - TTS via `midas-tts`
    - VAD-/Conversation-Resume-/Gate-Logik im Modul
  - Wichtiger Befund:
    - Voice hat heute keinen lokalen Intent-Fast-Path.
    - Nach `transcribeAudio(blob)` geht das Modul direkt in `handleAssistantRoundtrip(transcript)`.
    - Genau dort liegt spaeter der Voice-Hook fuer `transcript -> intent engine -> action oder fallback`.

- S1.5 Befund (Backend-Verantwortung gegen Fast-Path abgeglichen):
  - `midas-assistant`
    - Responses-API-Endpunkt mit Persona + JSON-`reply/actions`.
    - besitzt eigene Action-Whitelist.
    - bleibt Fallback fuer freie Sprache, Beratung und unklare Eingaben.
  - `midas-transcribe`
    - reines STT (`audio` -> `{ text }`).
    - keine Intent-Logik.
  - `midas-tts`
    - reines TTS (`text` -> Audio).
    - keine Intent-Logik.
  - `midas-vision`
    - separater Vision-/Foodcoach-Pfad.
    - erzeugt Analyse-/Suggest-Kontext, aber ist nicht Teil des spaeteren Intent-Kerns.
  - Konsequenz:
    - Die Intent Engine gehoert lokal vor `midas-assistant`.
    - Voice- und spaetere Device-Quellen sollen denselben Parser-Kern ueber Adapter erreichen.
    - Backend-Funktionen bleiben spezialisiert und werden nicht zur primaeren Intent-Ausfuehrung umgebaut.

- Finale Integrationsdateien fuer die Umsetzung:
  - `app/modules/hub/index.js`
    - produktiver Text-Entry-Point
    - Kontextaufbau
    - Vision-/Suggest-Integration
  - `app/modules/assistant-stack/assistant/allowed-actions.js`
    - Guarded Dispatch Entry
  - `app/modules/assistant-stack/assistant/actions.js`
    - Action-Ausfuehrung
  - spaeter `app/modules/assistant-stack/voice/index.js`
    - Wiederverwendung fuer Voice-Transkripte
  - neue Zielstruktur:
    - `app/modules/assistant-stack/intent/index.js`
    - `parser.js`
    - `rules.js`
    - `normalizers.js`
    - `validators.js`
    - `context.js`

- Regressionsrisiken / Designhinweise aus S1:
  - Risiko A: Der Text-Chat nutzt heute direkten `fetch(...)`-Flow im Hub.
    - Wenn die Intent Engine spaeter nur an `assistant/session-agent.js` angedockt wird, passiert im produktiven UI nichts.
  - Risiko B: `ja/nein` hat heute keinen globalen Pending-Intent-Context.
    - Ohne neuen Context-Contract drohen spaeter falsche oder stale Confirm-Entscheidungen.
  - Risiko C: `suggestion-card` und generische Intent-Confirms duerfen sich nicht gegenseitig ueberschreiben.
  - Risiko D: Voice ist geparkt, aber technisch schon komplex.
    - Die Intent Engine muss am Transkript-Hook andocken, ohne den Voice-Statusautomaten umzubauen.
  - Risiko E: `allowed-actions.js` und `actions.js` sind konservativ aufgebaut.
    - Direkte lokale Intent-Dispatches muessen diese Guards respektieren, sonst entstehen neue Bypass-Pfade.

- Check-Ergebnis:
  - Repo-Scan und gezielte File-Reads durchgefuehrt fuer:
    - `app/modules/hub/index.js`
    - `app/modules/assistant-stack/assistant/index.js`
    - `app/modules/assistant-stack/assistant/session-agent.js`
    - `app/modules/assistant-stack/assistant/actions.js`
    - `app/modules/assistant-stack/assistant/allowed-actions.js`
    - `app/modules/assistant-stack/assistant/suggest-store.js`
    - `app/modules/assistant-stack/assistant/suggest-ui.js`
    - `app/modules/assistant-stack/voice/index.js`
    - `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-assistant\\index.ts`
    - `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-transcribe\\index.ts`
    - `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-tts\\index.ts`
    - `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-vision\\index.ts`
  - Kein struktureller Blocker fuer die Intent-Engine-Integration identifiziert.
  - Wichtigste Leitplanke fuer S2/S3:
    - an den realen Hub-Textflow andocken,
    - Confirm-Context als neue saubere Schicht modellieren,
    - Voice erst ueber denselben Parser-Kern vorbereiten.

### S2 - V1-Scope, Decision-Contract und Safety-Regeln finalisieren
- S2.1 Finale V1-Intent-Klassen festziehen:
  - `confirm_reject`
  - `intake_quick_add`
  - `vitals_quick_log`
  - `simple_navigation`
- S2.2 Entscheidungsklassen finalisieren:
  - `direct_match`
  - `needs_confirmation`
  - `fallback`
- S2.3 Action Safety Classes im Codevertrag abbilden:
  - `safe_read`
  - `guarded_write`
  - `confirm_only`
  - `forbidden_for_intent_engine`
- S2.4 "No Hidden Defaults" und harte LLM-Grenzen als Guardrails spezifizieren.
- S2.5 Pending Intent Context Contract finalisieren.
  - inklusive `expires_at`
  - inklusive konsumiertem Zustand / Dedupe-Strategie gegen stale Confirm-Intents
- S2.6 `simple_navigation` fuer V1 bewusst engziehen:
  - nur explizite Ziele wie `Oeffne Vitals`
  - keine mehrdeutigen "Zeig mir ..."-Intents ohne klaren UI-Zielzustand
- S2.7 Domain-Grenzen fuer `intake_quick_add` und `vitals_quick_log` explizit festziehen:
  - nur eindeutige Muster
  - nur vollstaendige Payloads
  - keine halbsprachliche Interpretation
- S2.8 V1-Feature-Flags bewusst klein halten:
  - `INTENT_ENGINE_ENABLED`
  - `INTENT_ENGINE_DEBUG`
  - weitere Flags erst bei echtem Bedarf
- S2.9 Source-/Provenance-Contract fuer Zukunftskanaele vormerken:
  - `text`
  - `voice`
  - spaeter `device`
  - ohne V1 auf Device-Integration auszudehnen

#### S2 Ergebnisprotokoll (abgeschlossen)
- S2.1 Befund (finale V1-Intent-Klassen):
  - `confirm_reject`
    - strikt fuer:
      - `ja`
      - `nein`
      - `speichern`
      - `abbrechen`
    - nur gueltig mit Pending Intent Context
  - `intake_quick_add`
    - V1 nur fuer klar strukturierte Intake-Writes
    - Beispiele:
      - `Wasser 300 ml`
      - `Trage mir 300 ml Fluessigkeit ein`
      - `Protein 24 Gramm`
    - keine unklaren oder halbsprachlichen Formulierungen
  - `vitals_quick_log`
    - V1 nur fuer klare Einzel-/Paarwerte
    - Beispiele:
      - `Blutdruck 128 zu 82`
      - `Puls 66`
      - `Gewicht 78,4`
    - keine relativen oder ungefaehren Aussagen
  - `simple_navigation`
    - V1 nur fuer explizite, eindeutig aufloesbare Ziele
    - Beispiele:
      - `Oeffne Vitals`
      - `Gehe zu Medikamente`
    - keine mehrdeutigen Formen wie `Zeig mir Blutdruck`, solange der UI-Zielzustand nicht hart definiert ist
  - Nicht in V1:
    - `simple_medication_confirm`
    - Terminlogik
    - freie Symptom-/Beratungssprache

- S2.2 Befund (Decision-Contract, final):
  - `direct_match`
    - Regel eindeutig getroffen
    - Payload vollstaendig
    - Validierung bestanden
    - Action direkt dispatchbar
  - `needs_confirmation`
    - Intent semantisch erkannt
    - aber nur mit aktivem Pending-Kontext oder expliziter Rueckfrage ausfuehrbar
    - V1 primar fuer `confirm_reject`
  - `fallback`
    - Regel nicht getroffen
    - oder Ambiguitaet / fehlende Pflichtdaten / Beratungscharakter
    - geht an `midas-assistant`
  - Finaler Leitsatz:
    - lieber `fallback` als ein "fast richtiges" `direct_match`

- S2.3 Befund (Action Safety Classes, final):
  - `safe_read`
    - Navigation / Status / reine UI-Oeffnung
    - keine Persistenz
    - kein Confirm noetig
  - `guarded_write`
    - Intake-/Vitals-Writes mit vollstaendigem, validiertem Payload
    - duerfen direkt dispatchen, aber nur ueber bestehende Guard-Schichten
  - `confirm_only`
    - Actions, die ohne bestehenden Kontext nicht laufen duerfen
    - V1:
      - `ja`
      - `nein`
      - `speichern`
      - `abbrechen`
  - `forbidden_for_intent_engine`
    - Beratung
    - freie Medizinfragen
    - vage Aussagen
    - komplexe Umdeutungen
    - alles, was Interpretationsspielraum braucht

- S2.4 Befund (No-Hidden-Defaults und Write-Grenzen, final):
  - Fehlende Werte werden nie ergaenzt.
  - Ungefaehre Aussagen werden nie gespeichert.
  - Kontext darf Routing helfen, aber keine Payload "auffuellen".
  - Beispiele fuer harten `fallback`:
    - `Heute habe ich zu wenig getrunken`
    - `Blutdruck war heute so um die 130`
    - `Trag mir Wasser ein` ohne Menge
    - `Gewicht war besser als gestern`

- S2.5 Befund (Pending Intent Context Contract, final):
  - Minimalfelder:
    - `pending_intent_id`
    - `intent_type`
    - `target_action`
    - `payload_snapshot`
    - `created_at`
    - `expires_at`
  - Zusatzfelder fuer robuste Umsetzung:
    - `consumed_at`
    - `dedupe_key`
    - optional `source`
    - optional `ui_origin`
  - Regeln:
    - ohne gueltigen Pending-Kontext kein `confirm_reject`
    - abgelaufene oder konsumierte Kontexte sind inert
    - Confirm darf nur genau den gebundenen `target_action + payload_snapshot` freigeben

- S2.6 Befund (`simple_navigation` enggezogen, final):
  - V1-Navigation ist absichtlich klein.
  - Nur Navigation auf vorab bekannte Modulziele.
  - Kein implizites Oeffnen von Unterzustanden, Tabs oder Detailansichten aus freien Phrasen.
  - Konsequenz:
    - `Oeffne Vitals` = erlaubt
    - `Zeig mir Blutdruck` = vorerst `fallback`

- S2.7 Befund (Domain-Grenzen fuer `intake_quick_add` und `vitals_quick_log`, final):
  - `intake_quick_add`
    - braucht immer Wert + Einheit oder klar normalisierbare Schreibweise
    - keine qualitative Sprache wie `ein bisschen`, `relativ viel`, `zu wenig`
  - `vitals_quick_log`
    - braucht immer klare Zahl oder klaren Zahlenverbund
    - keine Wertableitung aus Kontext oder Vortagen
  - Beide Klassen bleiben strikt regex-/parserbasiert, nicht "sprachverstehend"

- S2.8 Befund (Feature-Flags, final):
  - V1:
    - `INTENT_ENGINE_ENABLED`
    - `INTENT_ENGINE_DEBUG`
  - Nicht in V1:
    - getrennte `TEXT_ENABLED` / `VOICE_ENABLED` Flags
    - source-spezifische Rule-Flags
  - Begruendung:
    - V1 soll nicht ueberkonfiguriert werden
    - Voice ist ohnehin noch geparkt

- S2.9 Befund (Source-/Provenance-Contract, final):
  - V1-Quellen:
    - `text`
  - vorbereitete Quellen:
    - `voice`
    - spaeter `device`
  - Fachregel:
    - Der Decision-Contract bleibt quellenunabhaengig.
    - Quellenspezifische Vorverarbeitung passiert vor dem Parser.
    - Spaetere Device-Quellen muessen Provenance- und Dedupe-Daten mitbringen, aendern aber nicht die Kern-Decision-States.

- Finaler S2-Codevertrag fuer S3/S4:
  - Parser-Input:
    - `raw_text`
    - `source`
    - optional `ui_context`
    - optional `pending_context`
  - Parser-Output:
    - `decision`
    - `intent_key`
    - `payload`
    - `target_action`
    - `fallback_required`
    - `reason`
  - Harte Regel:
    - `direct_match` darf nur entstehen, wenn `rules + validators + context` gemeinsam gruen sind.

- Check-Ergebnis:
  - S2 ist konsistent mit:
    - den S1-Befunden zum realen Hub-Textflow
    - den bestehenden Guard-Schichten (`allowed-actions.js`, `actions.js`)
    - den dokumentierten Architekturgrenzen aus dem Module Overview
  - Kein inhaltlicher Widerspruch fuer S3 identifiziert.

### S3 - Modul-Architektur und Parser-Pipeline spezifizieren
- S3.1 Zielordner `app/modules/assistant-stack/intent/` final festlegen.
- S3.2 Verantwortlichkeiten pro Datei definieren:
  - `index.js`
  - `parser.js`
  - `rules.js`
  - `normalizers.js`
  - `validators.js`
  - `context.js`
- S3.3 Parse-Ergebnis-Schema definieren:
  - `decision`
  - `intent_key`
  - `payload`
  - `target_action`
  - `fallback_required`
  - `reason`
- S3.4 Debug-/Feature-Flags und optionale Diagnose-Hooks definieren.
- S3.5 Harte Modulgrenzen dokumentieren, damit `rules.js` nicht Match, Validierung, Kontext und Routing vermischt.
- S3.6 Adapter-Seam fuer spaetere externe Datenknoten definieren, damit z. B. eine DIY-ESP32-Uhr spaeter denselben Decision-Contract nutzen kann.

#### S3 Ergebnisprotokoll (abgeschlossen)
- S3.1 Befund (Zielordner, final):
  - Die Intent Engine wird als eigener Teilbereich unterhalb des bestehenden Assistant-Stacks abgelegt:
    - `app/modules/assistant-stack/intent/`
  - Geplante V1-Dateien:
    - `index.js`
    - `parser.js`
    - `rules.js`
    - `normalizers.js`
    - `validators.js`
    - `context.js`
  - Bewusste Nicht-Ziele fuer V1:
    - kein eigener DOM-/UI-Ordner
    - keine Backend-Dateien
    - keine eigene Persistenzschicht

- S3.2 Befund (Verantwortlichkeiten pro Datei, final):
  - `index.js`
    - oeffentliche Moduloberflaeche
    - exportiert die schmale API fuer Hub / spaeter Voice
    - kein Regelwissen, keine Validierung
  - `parser.js`
    - orchestriert die Pipeline:
      - normalize
      - match rule
      - validate
      - context check
      - produce decision
    - besitzt die Decision-Logik fuer:
      - `direct_match`
      - `needs_confirmation`
      - `fallback`
    - kein UI-Code, keine konkrete Action-Ausfuehrung
  - `rules.js`
    - enthaelt nur V1-Intent-Regeln / Match-Definitionen
    - minimal erlaubt:
      - Pattern
      - benoetigte Felder
      - minimales Payload-Mapping
    - explizit nicht erlaubt:
      - Wertebereichspruefung
      - Pending-Context-Pruefung
      - Routing an Backend/UI
      - Sonderfaelle fuer einzelne Kanaele
  - `normalizers.js`
    - vereinheitlicht rohen Input fuer das Matching
    - V1:
      - Zahlenformat (`78,4 -> 78.4`)
      - Einheiten (`milliliter -> ml`, `gramm -> g`)
      - einfache Synonyme (`fluessigkeit -> wasser`, falls freigegeben)
      - Trim/Whitespace/Case-Normalisierung
    - kein semantisches "Verstehen"
  - `validators.js`
    - prueft:
      - Pflichtfelder
      - Wertebereiche
      - Vollstaendigkeit
      - Action-Safety-Class-konforme Guards
    - gibt keine eigenen UI-Aktionen aus
  - `context.js`
    - kapselt Pending-Intent-Context
    - prueft:
      - vorhanden / fehlend
      - expired
      - consumed
      - dedupe-faehig
    - stellt nur Kontext-Funktionen bereit, keine Parser-Entscheidung allein

- S3.3 Befund (Parser-Input-/Output-Schema, final):
  - Parser-Input:
    - `raw_text`
    - `source`
    - optional `ui_context`
    - optional `pending_context`
    - optional `meta`
  - `source`-Contract:
    - V1:
      - `text`
    - vorbereitet:
      - `voice`
      - `device`
  - Parser-Output:
    - `decision`
    - `intent_key`
    - `payload`
    - `target_action`
    - `fallback_required`
    - `reason`
    - optional spaeter:
      - `source_type`
      - `source_id`
      - `dedupe_key`
  - Finaler Bedeutungsvertrag:
    - `decision` ist die primaere Steuergroesse
    - `fallback_required` ist explizit, damit Call-Sites nicht implizit raten muessen
    - `reason` ist fuer Debug/Telemetry und spaetere schnelle Diagnose gedacht

- S3.4 Befund (Debug-/Feature-Flags und Diagnose-Hooks, final):
  - V1-Flags:
    - `INTENT_ENGINE_ENABLED`
    - `INTENT_ENGINE_DEBUG`
  - `INTENT_ENGINE_DEBUG` aktiviert nur Diagnose, nicht neues Verhalten
  - Geplanter Diagnosepfad:
    - Hook ueber bestehende Diag-Struktur (`diag.add` oder aequivalent)
    - keine neue globale Event-Flut fuer V1
  - Geplante Debug-Mindestdaten:
    - `source`
    - matched / unmatched rule key
    - final `decision`
    - `reason`
    - ob Fallback ausgeloest wurde

- S3.5 Befund (harte Modulgrenzen gegen Vermuellung, final):
  - `rules.js` darf kein zweites `parser.js` werden.
  - `validators.js` darf kein verstecktes Routing uebernehmen.
  - `context.js` darf keine Intent-Regeln kennen, sondern nur Kontextzustand pruefen.
  - `parser.js` bleibt die einzige Stelle, an der alle vier Schichten zusammenlaufen.
  - Architekturregel:
    - neue Sonderfaelle muessen zuerst gegen diese Trennung geprueft werden, bevor neue Logik aufgenommen wird

- S3.6 Befund (Adapter-Seam fuer Voice/Device, final):
  - Der Parser-Kern bleibt kanalagnostisch.
  - Quellenspezifische Vorverarbeitung passiert vor `parse(...)`.
  - Geplanter Adapter-Schnitt:
    - Text-Hub:
      - roher Texteingang -> `intent.parse(...)`
    - Voice:
      - STT-Transcript -> Voice-Adapter -> `intent.parse(...)`
    - spaeter Device:
      - Node-Payload -> Device-Adapter -> `intent.parse(...)`
  - Konsequenz:
    - Kein `if (source === 'voice')` oder `if (source === 'device')` in `rules.js`
    - Kanalspezifische Eigenheiten werden in den Adaptern normalisiert, nicht im Kernparser

- Finaler Modulvertrag fuer die Implementierung:
  - `index.js`
    - exportiert `parse(rawText, options?)`
  - `parser.js`
    - nimmt normalisierten Input + Kontext entgegen
    - produziert einen kompletten Decision-Record
  - `rules.js`
    - liefert Match-Result oder `null`
  - `validators.js`
    - liefert `valid / invalid` + `reason`
  - `context.js`
    - liefert `usable / unusable` + `reason`
  - Die Action-Ausfuehrung bleibt ausserhalb des Intent-Moduls.

- Implementationsleitplanke fuer S4:
  - zuerst Kern ohne UI und ohne direkte Hub-Verdrahtung bauen
  - Hub/Voice-Integration erst in S5/S6
  - damit bleibt der Parser isoliert testbar

- Check-Ergebnis:
  - S3 ist konsistent mit:
    - dem realen produktiven Text-Hook in `hub/index.js`
    - den Guard-/Dispatch-Pfaden in `allowed-actions.js` und `actions.js`
    - dem spaeteren Voice-Hook nach STT
    - dem dokumentierten Zukunftspfad fuer Device-/Node-Quellen
  - Kein struktureller Widerspruch fuer S4 identifiziert.

### S4 - Core-Engine implementieren
- S4.1 `normalizers.js` fuer Zahlen, Einheiten und Synonyme implementieren.
- S4.2 `rules.js` fuer die V1-Intent-Klassen implementieren.
- S4.3 `validators.js` fuer Wertebereiche, Pflichtfelder und Guardrails implementieren.
- S4.4 `context.js` fuer Pending Intent Context / Confirm-Kontext implementieren.
- S4.5 `parser.js` als Pipeline `normalize -> match rule -> validate -> produce decision` implementieren.
- S4.6 `index.js` als oeffentliche API (`parse`, optional spaeter `handle`) exportieren.

#### S4 Ergebnisprotokoll (abgeschlossen)
- S4.1 Befund (`normalizers.js`, umgesetzt):
  - Datei:
    - `app/modules/assistant-stack/intent/normalizers.js`
  - Implementiert:
    - Lowercase-/Whitespace-Normalisierung
    - ASCII-/Umlaut-Normalisierung
    - Dezimal-Komma zu Punkt (`78,4 -> 78.4`)
    - Einheiten-Normalisierung (`milliliter -> ml`, `gramm -> g`, `kilogramm -> kg`)
    - einfache Phrasen-Normalisierung (`blut druck -> blutdruck`, `fluessigkeit -> wasser`)
  - Exportiert:
    - `normalizeIntentText(...)`
    - `normalizeIntentInput(...)`
    - `isNormalizedUnit(...)`

- S4.2 Befund (`rules.js`, umgesetzt):
  - Datei:
    - `app/modules/assistant-stack/intent/rules.js`
  - V1-Matches umgesetzt fuer:
    - `confirm_reject`
    - `intake_quick_add`
    - `vitals_quick_log`
    - `simple_navigation`
  - Regeln bleiben bewusst eng:
    - `Oeffne Vitals` erlaubt
    - `Zeig mir Blutdruck` kein Match
    - `Heute habe ich zu wenig getrunken` kein Match
  - `rules.js` enthaelt nur Match + minimales Payload-Mapping, keine Validierung

- S4.3 Befund (`validators.js`, umgesetzt):
  - Datei:
    - `app/modules/assistant-stack/intent/validators.js`
  - Implementiert:
    - Safety-Class-Zuordnung
    - Ziel-Action-Konsistenz
    - Pflichtfelder / Wertebereiche
    - BP-Regel `systolic > diastolic`
    - enge Navigationsziele
  - Validierung bleibt strikt von `rules.js` getrennt

- S4.4 Befund (`context.js`, umgesetzt):
  - Datei:
    - `app/modules/assistant-stack/intent/context.js`
  - Implementiert:
    - `createPendingIntentContext(...)`
    - `getPendingContextState(...)`
    - `consumePendingIntentContext(...)`
    - `matchesPendingIntentContext(...)`
  - Abgedeckt:
    - `expires_at`
    - `consumed_at`
    - `dedupe_key`
    - `intent_type`
    - `target_action`

- S4.5 Befund (`parser.js`, umgesetzt):
  - Datei:
    - `app/modules/assistant-stack/intent/parser.js`
  - Pipeline umgesetzt:
    - `normalize -> match rule -> validate -> context check -> produce decision`
  - Output liefert:
    - `decision`
    - `intent_key`
    - `payload`
    - `target_action`
    - `fallback_required`
    - `reason`
    - Debug-Felder (`normalized`, `rule_match`, `validation`, `context_state`)
  - Aktuelles Confirm-Verhalten:
    - `confirm_reject` wird bewusst noch nicht direkt freigegeben
    - stattdessen `needs_confirmation` mit Kontextstatus

- S4.6 Befund (`index.js`, umgesetzt):
  - Datei:
    - `app/modules/assistant-stack/intent/index.js`
  - Oeffentliche API:
    - `parse(rawText, options?)`
    - Re-Exports:
      - `parseIntent`
      - `createPendingIntentContext`
  - Default-Export auf dieselbe schmale API gesetzt

- Umgesetzte Dateien:
  - `app/modules/assistant-stack/intent/normalizers.js`
  - `app/modules/assistant-stack/intent/rules.js`
  - `app/modules/assistant-stack/intent/validators.js`
  - `app/modules/assistant-stack/intent/context.js`
  - `app/modules/assistant-stack/intent/parser.js`
  - `app/modules/assistant-stack/intent/index.js`

- Durchgefuehrte Checks:
  - Syntax:
    - `node --check .../normalizers.js` PASS
    - `node --check .../rules.js` PASS
    - `node --check .../validators.js` PASS
    - `node --check .../context.js` PASS
    - `node --check .../parser.js` PASS
    - `node --check .../index.js` PASS
  - Runtime-Smokes:
    - `S4.1-NORMALIZERS: PASS`
    - `S4.2-RULES: PASS`
    - `S4.3-VALIDATORS: PASS`
    - `S4.4-CONTEXT: PASS`
    - `S4.5-PARSER: PASS`
    - `S4.6-INDEX: PASS`

- Architekturstatus nach S4:
  - Der Intent-Kern ist jetzt als isoliertes, testbares Modul vorhanden.
  - Noch nicht umgesetzt:
    - Hub-Text-Integration
    - Confirm-/Suggest-Verdrahtung
    - Voice-Wiederverwendung im Live-Flow
  - Diese Schritte bleiben korrekt in `S5`/`S6`.

### S5 - Text-Fast-Path in den Assistant-Flow integrieren
- S5.1 Text-Eingang vor dem LLM durch die Intent Engine routen.
- S5.2 `direct_match` direkt an `assistant/actions.js` dispatchen.
- S5.3 `fallback` deterministisch an `midas-assistant` weiterreichen.
- S5.4 Bestehende Chat-/Suggest-UX fuer lokale Treffer definieren (minimal, nicht magisch).
- S5.5 Sicherstellen, dass einfache Befehle keinen unnoetigen LLM-Call mehr ausloesen.

#### S5.1 Ergebnisprotokoll
- `app/modules/hub/index.js`
  - `preflightAssistantIntent(text)` eingefuehrt.
  - Der Helper ruft die neue Intent Engine vor dem bestehenden Assistant-Roundtrip auf.
  - Das Ergebnis wird in `assistantChatCtrl.lastIntentResult` zwischengespeichert.
  - Der Hook sitzt vor `fetchAssistantTextReply(text)` und ist damit an der korrekten Fast-Path-Stelle verdrahtet.
- `app/modules/assistant-stack/intent/index.js`
  - Browser-Global `window.AppModules.intentEngine` registriert, damit der Hub ohne Sonderpfad auf die Public API zugreifen kann.
- `index.html`
  - `app/modules/assistant-stack/intent/index.js` wird vor `app/modules/hub/index.js` geladen.
- Bewusst noch nicht erledigt:
  - kein lokaler `direct_match`-Dispatch
  - keine Confirm-Freigabe fuer `confirm_reject`
  - kein Unterdruecken des LLM-Calls bei Treffern
- Checks:
  - `node --check app/modules/hub/index.js` PASS
  - `node --check app/modules/assistant-stack/intent/index.js` PASS
  - statische Verifikation der Script-Reihenfolge in `index.html` PASS

#### S5.2 Ergebnisprotokoll
- `app/modules/hub/index.js`
  - `dispatchAssistantIntentDirectMatch(intentResult, rawText)` eingefuehrt.
  - Lokaler Dispatch nutzt bewusst denselben Guarded-Path wie bestehende Assistant-Actions:
    - `runAllowedAction(...)`
    - `assistantAllowedActions.executeAllowedAction(...)`
    - `assistant/actions.js`
  - Bei erfolgreichem lokalem Direct-Match wird der bisherige `midas-assistant`-Roundtrip im Text-Flow uebersprungen.
  - Erfolgreiche lokale Treffer werden in `assistantChatCtrl.lastIntentDispatch` zwischengespeichert.
  - Zusaetzlich wird `assistant:intent-direct-match` emittiert, damit spaetere UI-/Telemetry-Schichten einen sauberen Hook haben.
- Bewusst enger Scope:
  - lokal dispatchbar in `S5.2` sind nur `intake_save` und `open_module`
  - `vitals_log_bp`, `vitals_log_pulse`, `vitals_log_weight` bleiben trotz `direct_match` noch ausserhalb des lokalen Dispatch-Pfads
  - Grund: dafuer existiert aktuell noch kein gleichwertiger Allowed-Action-/Guardrail-Kanal
- Checks:
  - `node --check app/modules/hub/index.js` PASS
  - statische Verifikation von `DIRECT_INTENT_ACTIONS`, `dispatchAssistantIntentDirectMatch(...)`, Event-Emission und Early-Return vor `fetchAssistantTextReply(...)` PASS

#### S5.3 Ergebnisprotokoll
- `app/modules/hub/index.js`
  - `resolveAssistantIntentFallbackRoute(intentResult, localDispatch)` eingefuehrt.
  - `recordAssistantIntentFallback(intentResult, fallbackRoute, rawText)` eingefuehrt.
  - Der Text-Flow unterscheidet jetzt explizit zwischen:
    - `intent-fallback`
    - `intent-needs-confirmation`
    - `local-dispatch-unsupported`
    - `local-dispatch-failed`
    - `no-intent-result`
- Verhalten:
  - `fallback`-Faelle werden deterministisch an `midas-assistant` weitergereicht.
  - `needs_confirmation`-Faelle werden ebenfalls bewusst an `midas-assistant` weitergereicht, bis `S6` den Confirm-/Context-Pfad finalisiert.
  - `direct_match`-Faelle ohne lokalen Supported-Dispatch fallen nachvollziehbar auf den Assistant zurueck.
- Diagnose / Hooks:
  - `assistantChatCtrl.lastIntentFallback`
  - Event `assistant:intent-fallback`
  - Diag-Eintrag mit Route, Decision und Intent-Key
- Checks:
  - `node --check app/modules/hub/index.js` PASS
  - statische Verifikation der neuen Fallback-Helfer PASS
  - verifiziert, dass Fallback-Entscheidung vor `fetchAssistantTextReply(...)` ausgefuehrt wird PASS

#### S5.4 Ergebnisprotokoll
- `app/modules/hub/index.js`
  - `buildAssistantLocalIntentReply(intentResult)` eingefuehrt.
  - Erfolgreich lokal ausgefuehrte `direct_match`-Treffer erzeugen jetzt eine knappe Assistant-Chat-Nachricht.
- UX-Entscheidung:
  - keine neue Sonder-UI
  - keine zweite Suggest-/Followup-Schicht
  - keine "magische" Silent-Action
  - bestaetigende Rueckmeldung bleibt im bestehenden Chatmuster
- Aktuelle lokale Bestatigungen:
  - Wasser-/Protein-/Salz-Eintraege
  - Moduloeffnung fuer die heute unterstuetzten Navigationstargets
- Checks:
  - `node --check app/modules/hub/index.js` PASS
  - statische Verifikation des Reply-Builders und des Append-Hooks nur innerhalb erfolgreicher `localDispatch.handled`-Faelle PASS

#### S5.5 Ergebnisprotokoll
- `app/modules/hub/index.js`
  - `recordAssistantIntentLlmBypass(intentResult, rawText)` eingefuehrt.
  - Erfolgreich lokal ausgefuehrte Treffer markieren jetzt explizit, dass kein `midas-assistant`-Roundtrip mehr noetig war.
- Diagnose / Hooks:
  - `assistantChatCtrl.lastIntentBypass`
  - Event `assistant:intent-llm-bypass`
  - Diag-Eintrag mit Decision, Intent-Key und Target-Action
- Zweck:
  - `S5` ist damit nicht nur funktional, sondern auch operativ nachpruefbar.
  - Spaetere Smokechecks und Voice-/Telemetry-Integration koennen den Bypass-Zustand direkt auslesen.
- Checks:
  - `node --check app/modules/hub/index.js` PASS
  - statische Verifikation von `recordAssistantIntentLlmBypass(...)`, `assistant:intent-llm-bypass` und `lastIntentBypass` PASS
  - verifiziert, dass der Bypass-Record nur im erfolgreichen `localDispatch.handled`-Pfad und vor jedem `fetchAssistantTextReply(...)` gesetzt wird PASS

### S6 - Confirm-/Context-Handling und Voice-Wiederverwendbarkeit absichern
- S6.1 `ja/nein`, `speichern`, `abbrechen` strikt an Pending Intent Context koppeln.
- S6.2 Dedupe-/Re-Entrancy-Guards gegen Doppel-Saves implementieren.
- S6.3 Voice-Transkriptpfad so vorbereiten, dass dieselbe Engine spaeter wiederverwendet wird.
- S6.4 Optionalen Rueckkanal fuer schnelle lokale Bestaetigung (spaeter `midas-tts`) nur vorbereiten, nicht voll ausbauen.
- S6.5 Sicherstellen, dass Voice geparkt bleiben kann, ohne die Engine-Architektur zu verbiegen.
- S6.6 Sicherstellen, dass spaetere Nicht-User-Quellen wie Device-Nodes einen separaten Adapterpfad erhalten und keine Parser-Sonderlogik erzwingen.

#### S6.1 Ergebnisprotokoll
- `app/modules/hub/index.js`
  - `assistantChatCtrl` besitzt jetzt einen generischen `pendingIntentContext`-State.
  - `preflightAssistantIntent(text)` uebergibt den aktiven Pending Context jetzt an die Engine (`pending_context`).
  - `resolveAssistantConfirmIntent(intentResult)` fuehrt `confirm_reject` lokal nur dann aus, wenn der Parser einen gueltigen Pending Context bestaetigt.
- Erster realer Producer:
  - der bestehende Suggestion-Flow
  - aktive Suggestionen erzeugen jetzt ueber `createPendingIntentContext(...)` einen generischen Pending Context mit `target_action = confirm_intake`
  - `assistant:suggest-updated` setzt diesen Context
  - `assistant:suggest-dismissed` raeumt ihn wieder weg
- Lokales Verhalten fuer `ja/nein/speichern/abbrechen`:
  - ohne gueltigen Pending Context:
    - keine Action
    - kein LLM-Fallback
    - knappe lokale Assistant-Rueckmeldung: `Es gibt aktuell nichts zu bestaetigen.`
  - mit aktivem Suggestion-Context:
    - `ja` / `speichern` -> derselbe bestehende Suggestion-Confirm-Pfad wie beim Button-Klick
    - `nein` / `abbrechen` -> Suggestion wird lokal verworfen
- Wichtig:
  - Bestehende Suggestion-Buttons bleiben unangetastet.
  - Die neue Confirm-Schicht reagiert nur auf ihren eigenen Pending Context und kapert keine bestehenden Followup-/Suggestion-Events.
- Checks:
  - `node --check app/modules/hub/index.js` PASS
  - statische Verifikation von Pending-Context-State, Parser-Input, Confirm-Resolver und Suggestion-Set/Clear-Hooks PASS
  - verifiziert, dass lokales Confirm-Handling vor lokalem Direct-Dispatch und vor jedem Assistant-Fallback laeuft PASS

#### S6.2 Ergebnisprotokoll
- `app/modules/hub/index.js`
  - `assistantChatCtrl` besitzt jetzt `pendingIntentLocks` mit:
    - `inFlight`
    - `consumed`
  - neue Guard-Helfer:
    - `getPendingIntentGuardKey(...)`
    - `isPendingIntentGuardLocked(...)`
    - `markPendingIntentInFlight(...)`
    - `releasePendingIntentInFlight(...)`
    - `markPendingIntentConsumed(...)`
- `app/modules/assistant-stack/intent/index.js`
  - Public API re-exportiert jetzt auch:
    - `getPendingContextState(...)`
    - `consumePendingIntentContext(...)`
- Dedupe-/Re-Entrancy-Verhalten:
  - wiederholte Confirms auf denselben Pending Context werden ueber `dedupe_key` bzw. `pending_intent_id` abgefangen
  - `in-flight` blockiert parallele Wiederholung waehrend eine Confirm-Action noch laeuft
  - `consumed` blockiert spaetere Reuse eines bereits verarbeiteten Pending Context
  - Fehler im bestaetigten Save-Pfad verbrennen den Pending Context bewusst nicht, damit ein kontrollierter Retry moeglich bleibt
- Erster abgesicherter Zielpfad:
  - `confirm_intake` ueber den bestehenden Suggestion-Confirm-Flow
  - `ja` / `speichern` konsumieren den Context erst nach erfolgreichem Save
  - `nein` / `abbrechen` konsumieren den Context sofort beim lokalen Reject
- Checks:
  - `node --check app/modules/hub/index.js` PASS
  - `node --check app/modules/assistant-stack/intent/index.js` PASS
  - statische Verifikation von `pendingIntentLocks`, `in-flight`-/`consumed`-Guards, Consume-Pfaden und Reihenfolge vor lokalem Direct-Dispatch PASS
  - Runtime-Export-Check fuer `parse`, `parseIntent`, `createPendingIntentContext`, `getPendingContextState`, `consumePendingIntentContext` PASS

#### S6.3 Ergebnisprotokoll
- `app/modules/assistant-stack/voice/index.js`
  - Voice besitzt jetzt einen echten Intent-Adapter nach STT und vor dem bisherigen Assistant-Roundtrip:
    - `preflightVoiceIntent(transcript)`
    - `resolveVoiceIntentRoute(intentResult)`
    - `recordVoiceIntentRoute(intentResult, transcript)`
  - `processVoiceBlob(...)` fuehrt jetzt nach `transcribeAudio(blob)` dieselbe Intent Engine aus, bevor `handleAssistantRoundtrip(transcript)` aufgerufen wird.
- Bewusst noch nicht umgesetzt:
  - kein lokaler Voice-Dispatch
  - keine lokale TTS-Bestaetigung
  - kein Voice-Bypass des Assistant-Roundtrips
- Zweck:
  - derselbe Parser-Kern wird jetzt bereits im Voice-Pfad vorbereitet
  - spaetere Reaktivierung von Voice braucht keinen neuen Intent-Sonderpfad mehr
  - Routing-/Diagnosedaten fuer Voice sind jetzt explizit und nicht mehr implizit versteckt
- Neue Voice-API-Helfer:
  - `preflightTranscriptIntent(transcript)`
  - `getLastIntentState()`
- Diagnose:
  - `voiceCtrl.lastIntentResult`
  - `voiceCtrl.lastIntentRoute`
  - Diag-Eintraege mit `decision`, `route`, `intent`
- Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - statische Verifikation der neuen Voice-Intent-Helfer PASS
  - verifiziert, dass der Voice-Intent-Preflight vor `handleAssistantRoundtrip(transcript)` liegt PASS
  - Runtime-Export-Check fuer `preflightTranscriptIntent(...)` und `getLastIntentState()` PASS

#### S6.4 Ergebnisprotokoll
- `app/modules/assistant-stack/voice/index.js`
  - Optionaler Rueckkanal fuer spaetere lokale Sprachbestaetigungen vorbereitet:
    - `canSpeakLocalIntentConfirmation()`
    - `speakLocalIntentConfirmation(text, options?)`
- Verhalten:
  - nutzt den bestehenden `midas-tts`-Pfad
  - kann spaeter kurze lokale Bestaetigungen sprechen, ohne den Assistant-Roundtrip zu brauchen
  - ist aktuell bewusst noch nicht an den Voice- oder Intent-Flow angeschlossen
- Diagnose:
  - `voiceCtrl.lastLocalConfirmation`
  - Diag-Eintraege fuer vorbereitete / fehlgeschlagene lokale Bestaetigungen
- Wichtige Begrenzung:
  - `S6.4` aendert noch kein Live-Verhalten
  - kein automatischer TTS-Call bei lokalen Intents
  - keine Voice-Reaktivierung
- Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - statische Verifikation von Definition + Export der neuen Helper PASS
  - verifiziert, dass `speakLocalIntentConfirmation(...)` aktuell noch nirgends automatisch aufgerufen wird PASS
  - Runtime-Export-Check fuer `canSpeakLocalIntentConfirmation(...)` und `speakLocalIntentConfirmation(...)` PASS

#### S6.5 Ergebnisprotokoll
- `app/modules/hub/index.js`
  - `getVoiceFacade()` eingefuehrt.
  - Wenn Voice geparkt ist und das eigentliche Voice-Modul nicht geladen wird, stellt der Hub jetzt bewusst eine stabile Parked-Facade bereit statt `voice-module-missing` zu simulieren.
- Verhalten:
  - `getVoiceGateStatus()` liefert bei geparktem Voice jetzt explizit:
    - `allowed: false`
    - `reason: 'voice-parked'`
  - `isVoiceReady()` und `onVoiceGateChange(...)` bleiben auch ohne geladenes Voice-Modul stabil aufrufbar.
  - Die Parked-Facade stellt zusaetzlich leere Intent-/TTS-Hooks bereit:
    - `preflightTranscriptIntent()`
    - `getLastIntentState()`
    - `canSpeakLocalIntentConfirmation()`
- Zweck:
  - Die Intent-Architektur haengt damit nicht davon ab, ob Voice gerade live eingebunden oder bewusst geparkt ist.
  - Andere Module muessen nicht zwischen "Feature absichtlich geparkt" und "Modul fehlt/kaputt" raten.
- Checks:
  - `node --check app/modules/hub/index.js` PASS
  - statische Verifikation von `getVoiceFacade()`, `voice-parked`-Reason und der Hub-API-Nutzung der Fassade PASS

#### S6.6 Ergebnisprotokoll
- `app/modules/assistant-stack/intent/index.js`
  - formaler Adapter-Eingangspunkt eingefuehrt:
    - `createAdapterInput(rawText, options?)`
    - `parseAdapterInput(adapterInput)`
  - Der Parser-Kern bleibt dadurch unangetastet; quellspezifische Daten werden vor `parseIntent(...)` in einen stabilen Envelope uebersetzt.
- `app/modules/hub/index.js`
  - Text-Preflight nutzt jetzt `parseAdapterInput(...)` statt einer direkten Parser-Ansteuerung.
- `app/modules/assistant-stack/voice/index.js`
  - Voice-Preflight nutzt jetzt ebenfalls `parseAdapterInput(...)`.
- Architekturwirkung:
  - neue Quellen wie spaetere `device`-Nodes bekommen damit einen formalen Adapterpfad
  - der Parser benoetigt dafuer keine `source === 'device'`-Sonderlogik
  - `rules.js`, `validators.js` und `parser.js` bleiben quellenagnostisch
- Checks:
  - `node --check app/modules/assistant-stack/intent/index.js` PASS
  - `node --check app/modules/hub/index.js` PASS
  - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - Runtime-Smoke fuer `createAdapterInput(..., { source: 'device' })` + `parseAdapterInput(...)` PASS
  - statische Verifikation, dass Hub und Voice den Adapter-Eingangspunkt nutzen PASS

### S7 - Smokechecks, Reject/Fallback-Checks und Regressionsabsicherung
- S7.1 Positive V1-Beispiele pruefen:
  - `Wasser 300 ml`
  - `Trage mir 300 ml Fluessigkeit ein`
  - `Blutdruck 128 zu 82`
  - `Gewicht 78,4`
- S7.2 Negative / Fallback-Beispiele pruefen:
  - `Heute habe ich zu wenig getrunken`
  - `Mein Blutdruck war so um die 130`
  - freie Beratungsfragen
- S7.3 Confirm-Kontext pruefen:
  - `ja/nein` mit aktivem Kontext
  - `ja/nein` ohne aktiven Kontext
- S7.4 Text-Flow auf keine Doppel-Saves / keine Re-Entrancy pruefen.
- S7.5 Syntaxchecks und gezielte statische Guards ausfuehren.

#### S7.1 Ergebnisprotokoll
- Positivfaelle gegen den produktiven Intent-Kern geprueft:
  - `Wasser 300 ml`
  - `Trage mir 300 ml Fluessigkeit ein`
  - `Blutdruck 128 zu 82`
  - `Gewicht 78,4`
- Ergebnis im Parser / Adapter-Entry:
  - alle vier Faelle liefern `decision = direct_match`
  - `Wasser 300 ml` und `Trage mir 300 ml Fluessigkeit ein`
    - `intent_key = intake_quick_add`
    - `target_action = intake_save`
    - `fallback_required = false`
  - `Blutdruck 128 zu 82`
    - `intent_key = vitals_quick_log`
    - `target_action = vitals_log_bp`
    - `fallback_required = false`
  - `Gewicht 78,4`
    - `intent_key = vitals_quick_log`
    - `target_action = vitals_log_weight`
    - `fallback_required = false`
- Wichtige Verifikationsaussage:
  - Parser-Scope und produktiver Local-Dispatch-Scope bleiben bewusst getrennt.
  - Der Parser erkennt bereits `vitals_quick_log` lokal korrekt.
  - Der Hub dispatcht lokal weiterhin absichtlich nur:
    - `intake_save`
    - `open_module`
  - `vitals_log_bp`, `vitals_log_pulse` und `vitals_log_weight` bleiben damit korrekt im Status:
    - lokaler Match ja
    - produktiver lokaler Dispatch noch nein
    - kontrollierter Assistant-Fallback weiterhin erforderlich
- Durchgefuehrte Checks:
  - Runtime-Harness ueber `createAdapterInput(...)` + `parseAdapterInput(...)` fuer alle vier Positivfaelle PASS
  - Statischer Guard-Check in `app/modules/hub/index.js`:
    - `DIRECT_INTENT_ACTIONS = new Set(['intake_save', 'open_module'])` PASS
  - Bereits bestehende Syntaxchecks fuer:
    - `app/modules/assistant-stack/intent/index.js`
    - `app/modules/hub/index.js`
    bleiben gruener Referenzstand

#### S7.2 Ergebnisprotokoll
- Negative / Fallback-Faelle gegen den produktiven Intent-Kern geprueft:
  - `Heute habe ich zu wenig getrunken`
  - `Mein Blutdruck war so um die 130`
  - `Ist das bedenklich?`
  - `Was soll ich heute essen?`
- Ergebnis im Parser / Adapter-Entry:
  - alle vier Faelle liefern:
    - `decision = fallback`
    - `intent_key = null`
    - `target_action = null`
    - `fallback_required = true`
    - `reason = no-rule-match`
- Wichtige Verifikationsaussage:
  - Die Engine bleibt bei vagen, beratenden und freien Eingaben strikt nicht-deterministisch.
  - Es findet keine "smarte" Umdeutung in Writes oder halbpassende Navigation statt.
  - Damit bleibt die Grenze `Intent Engine = parse/validate/dispatch` vs. `LLM = interpret/reason/answer` operativ intakt.
- Statischer Referenzabgleich:
  - Die geprueften Negativfaelle und die mehrdeutige Navigation `Zeig mir Blutdruck` sind konsistent in:
    - `docs/modules/Intent Engine Module Overview.md`
    - `docs/archive/Intent Engine Implementation Roadmap (DONE).md`
  - dokumentiert und als bewusste `fallback`-Faelle gerahmt.
- Durchgefuehrte Checks:
  - Runtime-Harness ueber `createAdapterInput(...)` + `parseAdapterInput(...)` fuer alle vier Negativfaelle PASS
  - Repo-Scan auf dokumentierte Negativ-/Fallback-Faelle und mehrdeutige Navigation PASS
  - `node --check app/modules/assistant-stack/intent/parser.js` PASS

#### S7.3 Ergebnisprotokoll
- Confirm-Kontext gegen den produktiven Intent-Kern und den Hub-Flow geprueft:
  - ohne Pending Context:
    - `ja`
    - `nein`
    - `speichern`
    - `abbrechen`
  - mit gueltigem suggestion-basiertem Pending Context:
    - `ja`
    - `nein`
    - `speichern`
    - `abbrechen`
- Ergebnis ohne Kontext:
  - alle vier Faelle liefern:
    - `decision = needs_confirmation`
    - `intent_key = confirm_reject`
    - `reason = pending-context-missing`
  - der Hub behandelt diese Faelle lokal inert:
    - keine Action
    - kein LLM-Fallback
    - lokale Rueckmeldung: `Es gibt aktuell nichts zu bestaetigen.`
- Ergebnis mit gueltigem Suggestion-Kontext:
  - alle vier Faelle liefern:
    - `decision = needs_confirmation`
    - `intent_key = confirm_reject`
    - `reason = pending-context-confirmable`
    - `context_state.usable = true`
  - der Hub besitzt dafuer einen separaten lokalen Confirm-Pfad:
    - `ja` / `speichern` -> bestaetigen denselben `confirm_intake`-Pfad wie die Suggestion-UI
    - `nein` / `abbrechen` -> verwerfen denselben Suggestion-Kontext lokal
- Wichtige Verifikationsaussage:
  - Der Parser bleibt absichtlich nicht-ausfuehrend und gibt auch mit gueltigem Kontext nur `needs_confirmation` zurueck.
  - Die eigentliche Freigabe bleibt korrekt in der Flow-Schicht des Hubs.
  - Damit bleibt die Trennung aus `context.js` / `parser.js` / `hub/index.js` auch unter realem Confirm-Verhalten intakt.
- Durchgefuehrte Checks:
  - Runtime-Harness ohne Pending Context fuer `ja/nein/speichern/abbrechen` PASS
  - Runtime-Harness mit gueltigem suggestion-basiertem Pending Context PASS
  - Statischer Hub-Check fuer:
    - `resolveAssistantConfirmIntent(...)`
    - `assistant:suggest-updated`
    - `assistant:suggest-dismissed`
    - `confirm_intake`
    - lokale Inert-Message `Es gibt aktuell nichts zu bestaetigen.`
    PASS
  - `node --check app/modules/hub/index.js` PASS

#### S7.4 Ergebnisprotokoll
- Text-Flow auf Doppel-Saves / Re-Entrancy gegen den produktiven Confirm-Pfad geprueft.
- Statisch verifizierte Guard-Kette in `app/modules/hub/index.js`:
  - `isPendingIntentGuardLocked(...)`
  - `markPendingIntentInFlight(...)`
  - `handleSuggestionConfirmRequest(...)`
  - `markPendingIntentConsumed(...)`
  - `releasePendingIntentInFlight(...)`
- Verifizierte Reihenfolge fuer akzeptierte Confirms:
  - aktiver Pending Context wird vor dem Save auf `inFlight` gesetzt
  - erfolgreicher Save fuehrt anschliessend zu `consume`
  - danach bleibt derselbe Guard-Key ueber `consumed` gesperrt
- Verifizierte Reihenfolge fuer Fehlerfaelle:
  - fehlgeschlagene Saves liefern `save-failed`
  - der Lock wird freigegeben
  - der Pending Context wird bewusst nicht konsumiert
  - Retry bleibt damit moeglich
- Verifizierte Reihenfolge fuer Ablehnungen:
  - `nein` / `abbrechen` markieren den Pending Context direkt als `consumed`
  - spaetere Wiederholung auf denselben Guard-Key bleibt gesperrt
- Isolierter Runtime-Guard-Check ueber `context.js`:
  - Pending Context ist vor Konsumierung `usable = true`
  - `consumePendingIntentContext(...)` liefert `ok = true`
  - danach liefert `getPendingContextState(...)` korrekt:
    - `usable = false`
    - `reason = pending-context-consumed`
- Wichtige Verifikationsaussage:
  - Die produktive Confirm-Schicht ist gegen parallele Wiederholung und Wiederverwendung desselben Pending Contexts abgesichert.
  - Gleichzeitig bleibt das System im Fehlerfall retry-faehig, statt Confirm-Kontexte voreilig zu verbrennen.
- Durchgefuehrte Checks:
  - Statischer Repo-Scan auf Lock-/Consume-/Release-Reihenfolge in `app/modules/hub/index.js` PASS
  - Runtime-Harness ueber `createPendingIntentContext(...)`, `consumePendingIntentContext(...)`, `getPendingContextState(...)` PASS
  - `node --check app/modules/hub/index.js` PASS
  - `node --check app/modules/assistant-stack/intent/context.js` PASS

#### S7.5 Ergebnisprotokoll
- Abschliessende Syntaxchecks auf dem relevanten Intent-/Hub-/Voice-Scope ausgefuehrt:
  - `app/modules/assistant-stack/intent/normalizers.js`
  - `app/modules/assistant-stack/intent/rules.js`
  - `app/modules/assistant-stack/intent/validators.js`
  - `app/modules/assistant-stack/intent/context.js`
  - `app/modules/assistant-stack/intent/parser.js`
  - `app/modules/assistant-stack/intent/index.js`
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/voice/index.js`
- Ergebnis:
  - alle `node --check`-Laeufe PASS
- Zusaetzliche statische Guard-Verifikation:
  - `hub/index.js`
    - `DIRECT_INTENT_ACTIONS = new Set(['intake_save', 'open_module'])`
    - `resolveAssistantConfirmIntent(...)`
    - `assistant:intent-llm-bypass`
    - Nutzung von `parseAdapterInput(...)`
  - `voice/index.js`
    - Nutzung von `parseAdapterInput(...)`
  - geparkte Voice-Fassade im Hub:
    - `preflightTranscriptIntent`
    - `canSpeakLocalIntentConfirmation`
  - `intent/index.js`
    - Export von `createAdapterInput(...)`
    - Export von `parseAdapterInput(...)`
    - Export von `getPendingContextState(...)`
    - Export von `consumePendingIntentContext(...)`
- Wichtige Verifikationsaussage:
  - Der produktive Text-Fast-Path, der vorbereitete Voice-Preflight und der Adapter-/Context-Surface liegen konsistent auf demselben API-Vertrag.
  - Keine offensichtliche statische Drift zwischen Hub, Voice und Intent-Kern festgestellt.
- Durchgefuehrte Checks:
  - Sammel-`node --check` ueber alle relevanten Intent-/Hub-/Voice-Dateien PASS
  - Statischer Guard-Harness fuer kritische String-/API-Contracts PASS

### S8 - Abschluss, Doku-Sync, Changelog
- S8.1 Statusmatrix finalisieren.
- S8.2 `docs/modules/Intent Engine Module Overview.md` auf Ist-Stand nachziehen.
- S8.3 `docs/modules/Assistant Module Overview.md` bei geaenderten Integrationspunkten nachziehen.
- S8.4 `docs/QA_CHECKS.md` um Intent-Engine-Regression erweitern.
- S8.5 `CHANGELOG.md` unter `Unreleased` ergaenzen.
- S8.6 Rest-Risiken und Follow-ups dokumentieren.

#### S8 Ergebnisprotokoll
- `docs/modules/Intent Engine Module Overview.md`
  - auf den Stand nach `S7` synchronisiert
  - Statusblock, Operator Summary und Zwischenstand spiegeln jetzt den verifizierten Text-Fast-Path, suggestion-basierte Confirm-Freigaben und den vorbereiteten Voice-Preflight sauber wider
- `docs/modules/Assistant Module Overview.md`
  - um den lokalen Intent-Fast-Path vor dem Assistant-LLM ergaenzt
  - Hub-Rolle, Verarbeitungsfluss und relevante `assistant:intent-*`-Integrationspunkte nachgezogen
- `docs/QA_CHECKS.md`
  - um `Phase F6 - Intent Engine Regression (2026-03-07)` erweitert
  - deckt Smoke-, Fallback-, Confirm-/Guard-, Voice-/Adapter- und Sanity-Checks ab
- `CHANGELOG.md`
  - `Unreleased` um Intent-Engine-Kern, Text-Fast-Path, suggestion-basiertes Confirm-Handling und vorbereiteten Voice-Preflight erweitert
- Rest-Risiken / offene Follow-ups nach S8:
  - weitere Confirm-Producer ausserhalb des Suggestion-Flows sind noch nicht verdrahtet
  - `vitals_quick_log` ist weiterhin lokal erkennbar, aber noch nicht lokal dispatchbar
  - Voice-Preflight ist vorbereitet, produktiver Voice-Dispatch / Voice-Bypass bleiben bewusst offen
  - spaetere Device-Quellen brauchen weiterhin saubere Provenance-/Idempotenz-/Trust-Regeln
- Durchgefuehrter Check:
  - Doku-Sync manuell gegen den Implementierungsstand aus `S5-S7` abgeglichen PASS

## Smokechecks / Regression (Definition)
- Einfache strukturierte Befehle werden lokal erkannt.
- Vage oder beratende Aussagen erzeugen keinen direkten Write.
- Confirm-/Reject-Intents sind ohne Pending-Kontext inert.
- Bestehender Assistant-Fallback bleibt intakt.
- Keine Doppel-Saves, keine regressiven Seiteneffekte in Suggest-/Confirm-Flows.
- Text und Voice teilen sich dieselbe fachliche Intent-Logik.

## Abnahmekriterien
- V1-Intent-Klassen funktionieren deterministisch und nachvollziehbar.
- LLM-Fallback greift sauber bei allem Nicht-Eindeutigen.
- Actions laufen nur ueber validierte, guard-railed Dispatches.
- Confirm-/Reject-Handling ist robust gegen fehlenden Kontext und Doppeltrigger.
- Dokumentation und QA sind mit dem Implementierungsstand synchron.

## Risiken
- `rules.js` wird ohne saubere Trennung zu schnell zum Sammelpunkt fuer Match, Mapping und Validierung.
- Zu breite Synonym-Parser koennen False Positives ausloesen.
- Confirm-/Reject ohne stabilen Pending Context fuehrt zu Fehlaktionen.
- Zu aggressive Fast-Path-Abdeckung kann LLM-Faelle falsch "lokalisieren".
- Voice-Reaktivierung kann spaeter Druck erzeugen, unsaubere Sonderpfade einzubauen.
- `simple_navigation` kann durch scheinbar harmlose Phrasen schleichend fuzzy werden und Scope-Drift verursachen.
- Zu fruehe Ueberkonfiguration mit zu vielen Flags macht V1 schwerer lesbar, ohne echten Nutzen zu bringen.
- Spaetere Device-Quellen ohne klaren Provenance- und Dedupe-Contract koennen Fehlwrites oder Mehrfacheintraege verursachen.



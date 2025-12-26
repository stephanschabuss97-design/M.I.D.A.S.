# Assistant Multimodal + Text Chat Polish Roadmap

Goal:
- Make the text assistant feel like a clean chat product with MIDAS context.
- One user turn = one request (text and/or photo) with deterministic behavior.
- Fix confirm/suggest so it always saves exactly once.
- Optional follow-up after save with CKD-aware meal idea.
- Target scope: focused photo analysis + context feedback + short meal recommendation (no open-ended health chat).

Scope:
- Primary focus: text chat in `app/modules/hub/index.js`.
- Photo flow is part of text chat (vision).
- Voice is parked as legacy and not wired; voice module lives in `app/modules/assistant-stack/voice/index.js`.

Status (as of 2025-12-22):
- Voice archive roadmap completed (voice parked, no UI wiring).
- Assistant stack refactor completed (assistant files moved to `app/modules/assistant-stack/assistant/`, VAD in `app/modules/assistant-stack/vad/`).
- Script tags updated to assistant-stack paths; voice stays disabled.
- This roadmap phases remain not started (analysis + UX work still pending).

References (source of truth):
- `docs/modules/Assistant Module Overview.md`
- `docs/modules/VAD Module Overview.md`
- `docs/modules/Intent Engine Module Overview.md`
- Frontend: `app/modules/hub/index.js`, `app/modules/assistant-stack/assistant/*`
- Backend (separate repo): `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-assistant`
- Backend (separate repo): `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-vision`
- Optional voice endpoints: `midas-transcribe`, `midas-tts`

Current state (verified in code):
- Photo auto-runs: `handleAssistantPhotoSelected()` -> `sendAssistantPhotoMessage()` -> `fetchAssistantVisionReply()` triggers vision immediately on file change.
- Text chat uses `sendAssistantChatMessage()` -> `fetchAssistantTextReply()`; no compose with image yet.
- Confirm UI is inline, created in `app/modules/assistant-stack/assistant/suggest-ui.js` and uses events:
  - `assistant:suggest-confirm`, `assistant:suggest-answer`, `assistant:suggest-confirm-reset`.
- Confirm save runs via `runAllowedAction('intake_save', ...)` in `app/modules/hub/index.js` with guard `suggestionConfirmInFlight`.
- Suggest store is in `app/modules/assistant-stack/assistant/suggest-store.js`.

Expected behavior:
1) Compose turn: user can attach photo and/or text, then send once.
2) Exactly one confirm dialog for a vision suggestion, first click saves once.
3) After save, optional follow-up: "Want a CKD-friendly meal idea?"

-------------------------------------------------------------------------------
Phase 0 - Capture baseline (deterministic) ✅ (done)

0.1 Confirm the current photo auto-run path ✅ (done)
- File: `app/modules/hub/index.js`
- Note function chain and payload fields for vision request.
- Record: payload fields used now (`image_base64`, `history`, `context`, `session_id`, `meta`).

0.2 Reproduce confirm bug and document it ✅ (done)
- Steps: open assistant -> attach photo -> wait for analysis -> click "Ja, speichern".
- Observe: does the dialog close? does save happen once or multiple times?
- Record exact steps and visible result.
  - Result (reported): after first "Ja, speichern" the confirm dialog stays open, but the save runs once.
  - Second click: no additional save runs, and the dialog closes.
  - Visual glitch: garbled characters appear after "Alles klar ..." in the assistant reply.

0.3 Check confirm event wiring ✅ (done)
- File: `app/modules/hub/index.js` (listener binding inside `setupAssistantChat`)
- File: `app/modules/assistant-stack/assistant/suggest-ui.js` (inline confirm)
- Verify listeners only bind once and do not double-bind on re-render.
  - Found: `suggest-ui.js` attaches confirm UI on `assistant:suggest-updated` and `assistant:chat-rendered`, with `removeBlock()` before reattach.
  - Found: confirm click dispatches `assistant:suggest-confirm`; cancel dispatches `assistant:suggest-answer`.
  - Found: confirm reset only on `assistant:suggest-confirm-reset` (set busy false, allow re-dispatch).
  - Found: hub listens for `assistant:suggest-confirm` + `assistant:suggest-answer` inside `setupAssistantChat`, guarded by `assistantChatCtrl` so it should bind once.
  - Note: successful confirm relies on `store.dismissCurrent()` to remove the block (no `suggest-confirm-reset` on success).
 
0.4 UI polish: "Analyse läuft" placeholder ✅ (done)
- Ensure the status text renders cleanly (no garbled symbols) in photo analysis bubbles.
  - Observed: garbled characters appear after "Alles klar ..." in assistant reply text.

Deliverable:
- Short bug list with repro steps and expected vs actual.

-------------------------------------------------------------------------------
Phase 1 - Compose turn (text + photo in one send) ✅ (done)

1.1 UI state for photo draft ✅ (done)
- Keep photo in draft state after selection.
- Do not call vision on file change.
- Display thumbnail and a "ready to send" status in the chat input area.

1.2 Single payload shape ✅ (done)
- Define one request object:
  - `text` (optional)
  - `image_base64` (optional)
  - `context` (intake + appointments + profile)
  - `session_id` (required)
  - `history` (optional)
  - Implemented in `app/modules/hub/index.js` as `buildAssistantTurnPayload()` (text/image/context/history/session_id).

1.3 Single backend call per turn ✅ (done)
- Decide routing:
  - Option A: extend `midas-assistant` to handle optional image.
  - Option B: keep `midas-vision` and call it only when user clicks Send.
- Only one network request per user turn.
- Document the routing choice and why it was chosen.
- Lock a request contract (list of payload keys + one example payload).
  - Chosen: Option B (keep `midas-vision` separate, call only on Send).
  - Rationale: keep `midas-assistant` text-only for stability; isolate vision failures; preserve existing backend contracts.
  - Substeps:
    - 1.3.1 Frontend send routing: if draft photo exists, call vision endpoint; otherwise call assistant endpoint.
      - Implemented in `app/modules/hub/index.js`: submit routes to vision when `photoDraft` exists, otherwise text endpoint.
    - 1.3.2 Payload contract: align both calls to the unified turn payload keys (`text`, `image_base64`, `context`, `session_id`, `history`) where applicable.
    - 1.3.3 Response normalization: ensure vision reply produces a single assistant bubble and suggestion confirm.
    - 1.3.4 Example payloads: add one text-only and one photo+text example.
      - Done (examples added under 1.3 Payload contract).
    - 1.3.3 Response normalization:
      - Vision result stays in the photo bubble (single response string via `formatAssistantVisionResult`).
      - Suggestion confirm still comes from `assistantSuggestStore` / `suggest-ui` (no extra assistant message).
  - Payload contract (shared keys):
    - `session_id` (required)
    - `text` (optional, user input)
    - `image_base64` (optional, vision only)
    - `context` (optional)
    - `history` (optional, vision only)
    - `meta` (optional, e.g. fileName for vision)
  - Assistant (text) request uses `messages` + `mode: "text"` and may include `text` for the unified shape.
  - Vision request uses `mode: "vision"` and includes `image_base64`, optional `text`, `history`, `context`, `meta`.
  - Example payloads:
    - Text-only:
      {
        "session_id": "text-1730000000000",
        "mode": "text",
        "text": "Heute gab es Frikadellen mit Gemüse.",
        "messages": [
          { "role": "user", "content": "Heute gab es Frikadellen mit Gemüse." }
        ],
        "context": { "intake": { "totals": { "water_ml": 500, "salt_g": 2.0, "protein_g": 40.0 } } }
      }
    - Photo + text:
      {
        "session_id": "text-1730000000000",
        "mode": "vision",
        "text": "Das ist mein Mittagessen.",
        "image_base64": "<base64>",
        "history": "MIDAS: ...\\nStephan: ...",
        "context": { "profile": { "ckd_stage": "3a" } },
        "meta": { "fileName": "photo.jpg" }
      }

1.4 Chat bubble consolidation ✅ (done)
- User bubble represents text + image together.
- Assistant response is a single bubble.
  - Implemented: photo message stores optional user text and renders it inside the photo bubble.
  - No extra assistant message is added on vision success (analysis stays in photo bubble).

Acceptance:
- Photo selection does not trigger analysis.
- Send triggers exactly one request and one response.

-------------------------------------------------------------------------------
Phase 2 - Confirm flow (single confirm, single save) ? ✅ (done)

2.1 Single confirm instance ? ✅ (done)
- Ensure only one active confirm UI at a time.
- Dismiss old confirm UI before showing a new one.
  - Implemented in `app/modules/assistant-stack/assistant/suggest-ui.js`: remove any existing `.assistant-confirm-block` before attaching a new one.
  - Enforced at source: vision results now clear the suggestion queue before enqueue (`app/modules/hub/index.js`).

2.2 Explicit confirm state machine ? ✅ (done)
- States: `idle` -> `analysis_done` -> `confirm_open` -> `saving` -> `saved|error`.
- Buttons disabled in `saving`.
  - Implemented in `app/modules/assistant-stack/assistant/suggest-ui.js` with explicit state transitions and a `data-confirm-state` marker.

2.3 Event pipeline audit ? ✅ (done)
- Events: `assistant:suggest-confirm`, `assistant:suggest-answer`, `assistant:action-success`.
- Ensure each click is processed once and cleans up UI.
- Define the single source of truth for confirm state (store vs hub).
- Define explicit cleanup rules (when to clear confirm UI/state).
  - Source of truth: `assistantSuggestStore` (activeSuggestion queue); UI reflects store state.
  - Pipeline (current):
    - `suggest-ui` dispatches `assistant:suggest-confirm` / `assistant:suggest-answer`.
    - `hub` handles confirm, runs `intake_save`, and on success calls `store.dismissCurrent()`; on failure dispatches `assistant:suggest-confirm-reset`.
    - `suggest-ui` removes confirm on `assistant:suggest-dismissed`; resets busy state on `assistant:suggest-confirm-reset`.
  - Click-once guards: `dispatchedSuggestionId` (UI) + `suggestionConfirmInFlight` (hub).
  - Cleanup rules: confirm block removed on `assistant:suggest-dismissed`; buttons re-enabled on `assistant:suggest-confirm-reset`.
  - Fix: also dismiss store on `assistant:action-success` (`intake_save`) to guarantee confirm UI closes.

Phase 2 test strategy (short)
- Confirm appears once per suggestion (no duplicate blocks).
- Click "Ja, speichern" once: saves exactly once, confirm closes, success message appears.
- Double-click "Ja, speichern": only one save; confirm closes once.
- Click "Nein": confirm closes, no save.
- Force error (simulate failure): confirm stays, buttons re-enable, retry works.

Acceptance:
- First click always closes confirm.
- Save happens exactly once (no duplicate writes).

-------------------------------------------------------------------------------
Phase 3 - Follow-up after save (data-driven meal idea)

Goal:
- After a successful intake save, the assistant asks once if it should propose a meal idea.
- If user says yes, generate a short, contextual suggestion using available data (intake totals, next appointment, profile).
- Not CKD-only: CKD is optional context; appointment type should influence the suggestion when present.

3.1 Hook + guard ? ✅ (done)
- Trigger on `assistant:action-success` with `type: "intake_save"` after confirm save succeeds.
- Show a short follow-up question with two options: "Ja, bitte" / "Nein".
- Dedupe: fire only once per save event (use a transient in-memory flag or last-save timestamp).
- If user chooses "Nein": dismiss and do nothing else (no retry).

Current situation (Phase 3):
- Implemented: follow-up prompt appears once after `intake_save`.
- UI: prompt renders with "Ja, bitte" / "Nein" buttons.
- Dedupe: in-memory guard prevents duplicates.
- On "Ja, bitte": emits `assistant:meal-followup-request` with current context payload (no generation yet).
- On "Nein": prompt dismisses and no retry.

3.2 Context bundle (data inputs)
- Intake totals: salt + protein (and water if available).
- Next appointment: title + date/time + note (if any).
- Profile: CKD stage (optional) + protein/salt targets (optional).
- Time slot: infer morning/noon/evening based on local time to frame the suggestion.
- If an appointment exists, attempt to infer its type (e.g., nephrology, cardiology, sports) and adapt the meal suggestion.
- Snapshot rule: freeze context at save time (same data that produced the `intake_save`), do not re-fetch before follow-up.
- Dedupe key: include `save_id` or `session_id + saved_at` and pass it through the follow-up payload to block duplicates.
- Payload metadata: include `meta.followup_version = 1` for future prompt/output changes.
Substeps:
- 3.2.1 Snapshot + timing
  - Capture the context at the same moment `intake_save` succeeds.
  - Use that snapshot for follow-up (no live re-fetch).
- 3.2.2 Data fields (minimum set)
  - Intake totals: water/salt/protein.
  - Appointment: title, start time, note (optional).
  - Profile: ckd_stage, protein_target, salt_target (all optional).
  - Time slot: morning/noon/evening inferred from local time.
- 3.2.3 Appointment type heuristic
  - Map appointment title keywords to a type bucket (nephrology, cardiology, sports, general).
  - Use the type bucket to slightly bias the meal suggestion.
  - Keyword mapping (case-insensitive, match on title + note):
    - nephrology: nephro, niere, nieren, dialyse, kidney, ckd.
    - cardiology: cardio, herz, kardiologie, blutdruck, hypertension.
    - sports: sport, training, physio, rehab, bewegung.
    - diabetes: diabetes, zucker, insulin, endokrin.
    - general: fallback if no keyword match.
- 3.2.4 Dedupe + guard
  - Create a `followup_key` (prefer `save_id`, fallback to `session_id + saved_at`).
  - Block re-fire if the same `followup_key` is seen again.
- 3.2.5 Payload shape
  - Include `followup_key`, `saved_at`, `context` (snapshot), and `meta.followup_version = 1`.
  - Example payload (meal follow-up request):
    {
      "followup_key": "save:12345",
      "saved_at": "2025-01-15T12:34:56.000Z",
      "context": {
        "intake": { "totals": { "water_ml": 500, "salt_g": 2.0, "protein_g": 35.0 } },
        "appointments": [
          { "label": "Nephrologie", "start_at": "2025-01-16T09:00:00.000Z", "note": "Kontrolle" }
        ],
        "profile": { "ckd_stage": "3a", "protein_target_max": 60, "salt_limit_g": 5 },
        "time_slot": "noon"
      },
      "meta": { "followup_version": 1 }
    }

3.3 Prompt + output format
- Prompt should instruct the model to:
  - Use current intake totals (salt/protein) to balance the idea.
  - Consider upcoming appointment context when present.
  - Keep it practical: 1-2 short suggestions, 2-4 sentences total.
  - Avoid medical claims; keep tone helpful and concise.
- Output format (suggested):
  - "Vorschlag: <meal idea>" + short rationale in one sentence.
  - Optional alternative if appointment context suggests a different focus.

3.4 UI response flow
- Show the suggestion as a normal assistant message (not a confirm card).
- No additional save/confirm loop for the suggestion itself.
- If the suggestion fails (network/LLM error), silently skip and do not retry.

Acceptance:
- After saving intake, assistant asks once for a meal suggestion.
- "Nein" closes the prompt and ends the flow.
- "Ja, bitte" returns a short, contextual meal idea.

-------------------------------------------------------------------------------
Phase 4 - QA and docs

4.1 Happy paths
- Text only
- Photo only
- Text + photo

4.2 Edge cases
- Double click Send
- Abort upload
- Network errors
- prefers-reduced-motion

4.3 Docs update
- `docs/modules/Assistant Module Overview.md` updated to "draft + send" photo flow.

-------------------------------------------------------------------------------
Phase 5 - Voice chat alignment (deferred while voice is parked)

5.1 Unify text + voice action layer
- Voice flow should reuse the same action handlers as text.
- Avoid duplicated save logic between text and voice.

5.2 Voice intent engine (fast-path)
- Parse common commands locally (no LLM):
  - water/salt/protein quick adds
  - simple vitals (BP/Body)
  - confirmations (yes/no)
- If intent is uncertain, fall back to LLM.

5.3 Voice UX fixes
- Ensure voice responses map to the same confirm/save flows.
- Keep a single "confirm once" rule for voice prompts too.

5.4 Optional: Intent Engine module
- If intent logic grows, create `app/modules/intent-engine/`.
- Add overview doc in `docs/modules/Intent Engine Module Overview.md`.

Acceptance:
- Voice can trigger the same actions as text reliably.
- Simple commands do not hit LLM.
- Confirm/save remains single-click/single-action.

-------------------------------------------------------------------------------
Notes for new chats
- Primary change: move photo analysis from upload-change to send.
- Voice chat and intent engine are in scope for this roadmap.
- Frontend is in this repo; backend edge functions are in `midas-backend`.

-------------------------------------------------------------------------------
Phase 6 - Butler UI density rules (desktop/tablet/mobile)

6.1 Define data tiers (always vs optional vs expandable)
- Always visible (all devices): water/salt/protein chips.
- Context extras (desktop/tablet): protein target (min/max), CKD stage.
- Optional (desktop): last meal summary, last med confirmation, next appointment.
- Expandable: remaining budget + warning + 1 short recommendation.

6.2 Desktop layout (high density)
- Show: water/salt/protein + protein target + CKD stage.
- Show: last meal + last med confirm + next appointment.
- Expand: remaining budget + warning + recommendation.

6.3 Tablet layout (medium density)
- Show: water/salt/protein + protein target.
- Show: one extra line (either next appointment or last med confirmation).
- Expand: remaining budget + warning.

6.4 Mobile layout (low density)
- Show: water/salt/protein only.
- Provide: one compact "More" toggle for everything else.
- Expand: one item per category only (no lists).

Acceptance:
- Desktop feels rich, not cramped.
- Tablet feels balanced.
- Mobile remains quick with minimal scanning.

-------------------------------------------------------------------------------
Action Backlog (assistant/actions.js expansion ideas)

Purpose:
- Make the assistant useful beyond intake by adding safe, validated actions.
- Actions should map to existing modules/RPCs and avoid destructive operations.

Candidates (by module):
- Vitals (BP/Body/Lab/Training): `log_bp`, `log_body`, `log_lab`, `log_training`
- Medication: `med_confirm_dose`, `med_undo_dose`, `med_adjust_stock`, `med_set_stock`
- Appointments: `appointment_create`, `appointment_cancel`, `appointment_reschedule`
- Activity/Event: `activity_add`
- Profile: `update_profile_field` (salt/protein targets, ckd stage, smoker)
- Assistant UX: `clear_assistant_history`, `toggle_voice_mode`

Guardrails:
- Validate payloads, confirm before writes where appropriate.
- Prefer additive changes and avoid deletes unless explicit.

Next:
- If intent logic grows beyond assistant-stack scope, use `docs/modules/Intent Engine Module Overview.md` as the next reference.



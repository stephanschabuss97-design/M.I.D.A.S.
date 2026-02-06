# Voice Chat Parking Roadmap (Legacy Archive)

Goal:
- Keep voice chat code in the repo as a legacy module.
- Remove all runtime wiring so voice does not execute.
- Make reactivation a simple "rewire + enable" step later.

Scope:
- Detach voice triggers, script tags, and init calls.
- Leave code intact in the assistant-stack (voice + vad).
- Update docs to reflect "voice parked".

Non-goals:
- No deletion of voice code.
- No feature work or optimizations.
- No UI redesign.

-------------------------------------------------------------------------------
Phase 0 - Inventory and baseline (deterministic) ✅ DONE

0.1 Voice logic in hub
- `app/modules/hub/index.js` (recording, transcribe, assistant roundtrip, tts, voice state)

0.2 VAD files
- `app/modules/assistant-stack/vad/vad.js`
- `app/modules/assistant-stack/vad/vad-worklet.js`

0.3 Voice UI hooks
- `index.html` button `data-hub-module="assistant-voice"`
- `index.html` script tags (VAD, voice)
- `app/styles/hub.css` voice state styles

Deliverable:
- Final checklist of all wiring points to disable.
- Inventory notes (Phase 0 findings):
  - `app/modules/hub/index.js`: voice endpoints/config (`MIDAS_ENDPOINTS`, `DIRECT_SUPABASE_CALL`), voice state labels, voice controller setup (`setupVoiceChat`), voice gate (`computeVoiceGateStatus` + observer), voice trigger binding (`bindVoiceButton`), record/transcribe/assistant/tts flow (`startVoiceRecording` -> `transcribeAudio` -> `fetchAssistantReply` -> `requestTtsAudio`), meter/playback (`startVoiceMeter`, `playVoiceAudio`), public voice API (`getVoiceGateStatus`, `isVoiceReady`, `onVoiceGateChange`).
  - `app/modules/assistant-stack/vad/vad.js`: `global.MidasVAD.createController`, worklet loader, voice gate subscription via hub, fallback `ScriptProcessor`.
  - `app/modules/assistant-stack/vad/vad-worklet.js`: `HubVADProcessor` worklet with RMS + threshold/reportInterval.
  - `index.html`: voice hub button (`data-hub-module="assistant-voice"` / `data-carousel-id="assistant-voice"`), quickbar voice button, VAD script tag (`app/modules/assistant-stack/vad/vad.js`).
  - `app/styles/hub.css`: voice state styles for orbit/core trigger, voice gate lock styles (`body.voice-locked`, `.hub-core-trigger.is-voice-locked`), voice glow/amp ring animations.

-------------------------------------------------------------------------------
Phase 1 - Detach runtime wiring ✅ DONE

1.1 Hub wiring
- Disable voice init and trigger in `app/modules/hub/index.js`.
- Keep code but do not call it from hub.

1.2 UI wiring
- Remove or hide `assistant-voice` button in `index.html`.
- Remove the voice icon from the carousel (orbit) so only text assistant remains.
- Keep markup optional so it can be re-enabled later.

1.3 Script tags
- Remove/disable voice + VAD script tags from `index.html`.

Acceptance:
- App loads without voice features.
- No missing script errors.
- Text assistant remains intact.
- Phase 1 notes (wiring detached):
  - `app/modules/hub/index.js`: voice init/gate/button binding guarded by `VOICE_PARKED`.
  - `index.html`: assistant-voice buttons in orbit + quickbar commented out.
  - `index.html`: VAD script tag commented out.

-------------------------------------------------------------------------------
Phase 2 - Archive structure (assistant-stack) ✅ DONE

2.1 Keep voice + VAD in assistant-stack
- Store voice logic in `app/modules/assistant-stack/voice/`.
- Store VAD in `app/modules/assistant-stack/vad/`.
- Substeps (deterministic extraction checklist):
  - Create target folders (voice + vad) and confirm current voice code still lives in `app/modules/hub/index.js`.
  - Enumerate all voice entrypoints in hub (init, trigger, gate, public API), and list exact function names + line anchors.
  - Enumerate all voice state side-effects (DOM attributes, CSS classes, data attributes) to preserve or disable.
  - Enumerate all external dependencies used by voice flow (VAD controller, endpoints, config flags, diagnostics).
  - Enumerate all event listeners and timers tied to voice flow (recording, VAD silence, conversation resume).
  - Identify all hub exports that surface voice state (e.g., `getVoiceGateStatus`, `isVoiceReady`, `onVoiceGateChange`).
  - Map each hub touchpoint to its future home in `assistant-stack/voice/` (init/trigger/state/IO).
  - Define a minimal adapter API surface for hub → voice module.
  - Extract voice logic into `app/modules/assistant-stack/voice/` without altering behavior.
  - Replace hub wiring with adapter calls and ensure no direct voice logic remains in hub.

2.2 Reactivation notes
- Document the exact steps to rewire voice later.
- Rewire checklist (include all changes from this parking pass):
  - `app/modules/assistant-stack/voice/index.js` exists and must be loaded before hub (add script tag in `index.html`).
  - `app/modules/assistant-stack/vad/vad.js` + `app/modules/assistant-stack/vad/vad-worklet.js` are the new VAD locations.
  - `index.html`: restore voice button markup (orbit + quickbar) and re-enable VAD + voice module script tags.
  - `index.html`: use new VAD path when re-enabling (`app/modules/assistant-stack/vad/vad.js`).
  - `app/modules/hub/index.js`: set `VOICE_PARKED = false` to allow `initVoiceModule(hub)` to run.
  - `app/modules/hub/index.js`: hub no longer contains voice logic; it only proxies gate APIs to `AppModules.voice`.
  - Ensure `AppModules.voice` is registered (via `app/modules/assistant-stack/voice/index.js`) before hub initializes.
  - Sanity: confirm `AppModules.voice.getGateStatus` + `onGateChange` work (hub proxy).
  - Optional: verify CSS voice-state styling still applies to `.hub-orbit` and `.hub-core-trigger`.

Acceptance:
- Voice code exists but is inactive by default.

-------------------------------------------------------------------------------
Phase 3 - Docs update ✅ DONE

3.1 Update assistant roadmaps
- Mark voice as "parked / legacy" in:
  - `docs/assistant-stack-refactor-roadmap.md`
  - `docs/assistant-multimodal-polish-roadmap.md`

3.2 Update module overviews
- `docs/modules/Assistant Module Overview.md`
- `docs/modules/VAD Module Overview.md`
- `docs/modules/Hub Module Overview.md`

3.3 QA docs
- Remove or mark voice QA cases as optional:
  - `docs/QA_CHECKS.md`
  - `docs/Voice Assistant roadmap.md`

Definition of Done:
- Voice code remains in repo but is not wired.
- Documentation clearly states voice is parked.

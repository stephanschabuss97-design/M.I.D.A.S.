# Assistant Stack Refactor Roadmap

Goal:
- Collect all assistant-related modules (text, voice, VAD, intent) under one folder.
- Make the structure clearer before implementing the assistant/intent roadmap.
- Update all docs so new chats can continue deterministically.

Scope:
- Move assistant modules into a shared folder.
- Move VAD into the same assistant stack.
- Prepare a place for voice + intent modules (even if logic stays in hub for now).
- Update imports, script tags, and doc references.

Non-goals:
- No behavior changes.
- No new features.
- No UI redesign.
- Voice is parked and not wired; this roadmap keeps it in the stack but inactive.

Current layout (found in repo):
- Assistant modules: `app/modules/assistant-stack/assistant/*`
- VAD: `app/modules/assistant-stack/vad/vad.js`, `app/modules/assistant-stack/vad/vad-worklet.js`
- Voice logic lives in `app/modules/assistant-stack/voice/index.js` (hub keeps only adapter/init).
- Assistant UI markup in `index.html`; styles in `app/styles/hub.css`.
- Docs referencing paths: multiple in `docs/` (see Phase 0.2).

Target layout:
- `app/modules/assistant-stack/assistant/` (existing assistant files)
- `app/modules/assistant-stack/vad/` (vad.js + vad-worklet.js)
- `app/modules/assistant-stack/voice/` (new home for voice logic extracted from hub)
- `app/modules/assistant-stack/intent/` (reserved for intent engine)

-------------------------------------------------------------------------------
Phase 0 - Inventory and checklist (deterministic) âœ… DONE

0.1 Freeze current paths âœ… DONE
- List current assistant module files:
  - `app/modules/assistant-stack/assistant/actions.js`
  - `app/modules/assistant-stack/assistant/allowed-actions.js`
  - `app/modules/assistant-stack/assistant/day-plan.js`
  - `app/modules/assistant-stack/assistant/index.js`
  - `app/modules/assistant-stack/assistant/session-agent.js`
  - `app/modules/assistant-stack/assistant/suggest-store.js`
  - `app/modules/assistant-stack/assistant/suggest-ui.js`
- List VAD files:
  - `app/modules/assistant-stack/vad/vad.js`
  - `app/modules/assistant-stack/vad/vad-worklet.js`

0.2 Docs and references to update (from repo scan) âœ… DONE
- `index.html` script tags for assistant + VAD. (VAD/Voice updated, Assistant pending)
- `app/modules/hub/index.js` references to assistant modules + VAD worklet path. âœ…
- `app/styles/hub.css` (assistant + voice styles stay, but paths in docs change). âœ…
- Docs:
  - `docs/modules/Assistant Module Overview.md` âœ…
  - `docs/modules/VAD Module Overview.md` âœ…
  - `docs/modules/Hub Module Overview.md` âœ…
  - `docs/modules/Intent Engine Module Overview.md` âœ…
  - `docs/modules/Protein Module Overview.md` âœ…
  - `docs/assistant-multimodal-polish-roadmap.md` âœ…
  - `docs/Voice Assistant roadmap.md` âœ…
  - `docs/QA_CHECKS.md` âœ…
  - `docs/assistant/Assistant_Actions_Spec.md` (no path refs)
  - `docs/assistant/Assistant_Endpoint_Spec.md` (no path refs)
  - `docs/carousel_integration.md` âœ…

Deliverable:
- A final checklist of files and paths to update.

-------------------------------------------------------------------------------
Phase 1 - Create new folder structure âœ… DONE

1.1 Create base folders âœ… DONE
- `app/modules/assistant-stack/assistant/`
- `app/modules/assistant-stack/vad/`
- `app/modules/assistant-stack/voice/`
- `app/modules/assistant-stack/intent/`

1.2 Move assistant files âœ… DONE
- Move all files from `app/modules/assistant/` into `app/modules/assistant-stack/assistant/`.
- Keep internal relative imports working (same folder).
- Substeps (deterministic):
  - Confirm source file list (actions, allowed-actions, day-plan, index, session-agent, suggest-store, suggest-ui).
  - Create `app/modules/assistant-stack/assistant/` target folder.
  - Move files without content edits.
  - Update `index.html` script tags to the new assistant paths.
  - Verify `AppModules.*` exports still resolve (no path-based imports in hub).
  - Smoke: assistant panel opens and text send works.

1.3 Move VAD files âœ… DONE
- Confirm `app/modules/assistant-stack/vad/vad.js` exists.
- Confirm `app/modules/assistant-stack/vad/vad-worklet.js` exists.
- Ensure worklet path in `vad.js` points to `app/modules/assistant-stack/vad/vad-worklet.js`.

Acceptance:
- Files exist in new locations.
- No duplicate copies remain in old paths.

-------------------------------------------------------------------------------
Phase 2 - Wire the new paths (frontend) âœ… DONE

2.1 Update `index.html` script tags âœ… DONE
- VAD script source to new path.
- Assistant module script sources to new path.

2.2 Update imports/references âœ… DONE
- `app/modules/hub/index.js` should still find:
  - `AppModules.assistantUi`
  - `AppModules.assistantSuggestStore`
  - VAD controller (`MidasVAD`) now loaded from new path.

2.3 Update VAD worklet reference âœ… DONE
- `app/modules/assistant-stack/vad/vad.js` must point to `app/modules/assistant-stack/vad/vad-worklet.js`.

Acceptance:
- App loads without missing script errors.
- Assistant chat and VAD still initialize.

-------------------------------------------------------------------------------
Phase 3 - Optional voice extraction (same stack) âœ… DONE

3.1 Extract voice logic from `app/modules/hub/index.js` âœ… DONE
- Create `app/modules/assistant-stack/voice/index.js`.
- Move voice-specific logic (recording, transcribe, tts, assistant roundtrip).
- Keep a thin adapter in hub that calls the new voice module.

3.2 Public API for voice module âœ… DONE
- Expose init + trigger methods on `AppModules.voice`.
- Hub calls `AppModules.voice.init(hub, config)` and `AppModules.voice.trigger()`.

Acceptance:
- Voice flow still works as before (when unparked).
- Hub remains minimal.

-------------------------------------------------------------------------------
Phase 4 - Docs updates âœ… DONE

4.1 Update module overviews âœ… DONE
- Assistant, VAD, Hub, Intent Engine, Protein: new file paths and relationships.

4.2 Update roadmap + QA docs âœ… DONE
- `docs/assistant-multimodal-polish-roadmap.md` references new paths.
- `docs/Voice Assistant roadmap.md`, `docs/QA_CHECKS.md`, `docs/carousel_integration.md` updated.
- Assistant specs under `docs/assistant/` updated to reflect new module paths.

Acceptance:
- All docs point to new paths.
- No references to old `app/modules/assistant/` or `app/modules/hub/vad/`.

-------------------------------------------------------------------------------
Phase 5 - Validation

5.1 Smoke check (no behavior change) âœ… DONE
- Load app, open assistant panel.
- Send text message.
- Select photo (current behavior).
- Voice is parked (no trigger/UI); confirm no voice wiring or buttons are active.

5.2 QA checklist âœ… DONE
- Ensure `docs/QA_CHECKS.md` items still pass.

Definition of Done:
- Assistant stack lives under `app/modules/assistant-stack/`.
- All references updated.
- Docs accurate and in sync.

Final verification:
- ✅ DONE verified (2025-12-22): paths, docs, and script tags aligned; voice parked.

Next:
- Continue with `docs/assistant-multimodal-polish-roadmap.md`.


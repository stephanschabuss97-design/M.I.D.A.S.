# Module Consolidation Roadmap (Vitals + Intake + Assistant Stacks)

Goal:
- Consolidate related modules into clear stacks without breaking behavior.
- End state: Vitals Stack, Intake Stack, Assistant Stack, plus Appointments, Profile, Doctor View, Hub.
- Make all paths and docs consistent so future work is safe and deterministic.

Non-goals:
- No new features during consolidation.
- No UI redesign.
- No backend schema changes.

Prerequisite:
- Complete `docs/voice-archive-roadmap.md` before starting this roadmap.

Target architecture:
- `app/modules/vitals-stack/`
  - `vitals/` (old capture: bp, body, lab, entry, panel logic)
  - `activity/` (old activity module)
- `app/modules/intake-stack/`
  - `intake/` (new module extracted from capture)
  - `medication/` (old medication module)
- `app/modules/assistant-stack/`
  - `assistant/`, `voice/`, `intent/`, `vad/` (see assistant-stack roadmap)
- Standalone: `appointments`, `profile`, `doctor`, `charts`, `trendpilot`, `hub`

Current layout (from repo scan):
- Capture: `app/modules/capture/*` (bp, body, lab, entry, intake logic)
- Activity: `app/modules/activity/index.js`
- Medication: `app/modules/medication/index.js`
- VAD: `app/modules/assistant-stack/vad/*`
- Assistant: `app/modules/assistant-stack/assistant/*`
- Trendpilot: `app/modules/trendpilot/`
- Hub: `app/modules/hub/index.js`
- Intake UI lives in `index.html` under the Intake panel (IN/TAB).

-------------------------------------------------------------------------------
Phase 0 - Inventory and freeze (deterministic) DONE

0.1 Freeze the current file list DONE
- Capture: `app/modules/capture/index.js`, `bp.js`, `body.js`, `lab.js`, `entry.js`
- Activity: `app/modules/activity/index.js`
- Medication: `app/modules/medication/index.js`
- Trendpilot: `app/modules/trendpilot/`
- Hub: `app/modules/hub/index.js`, `app/styles/hub.css`, `index.html`
- Intake helpers: `app/core/capture-globals.js`, `app/supabase/api/intake.js`

0.2 List docs to update DONE
- Module overviews:
  - `docs/modules/Capture Module Overview.md`
  - `docs/modules/Activity Module Overview.md`
  - `docs/modules/Intake Module Overview.md`
  - `docs/modules/Medication Module Overview.md`
  - `docs/modules/Trendpilot Module Overview.md`
  - `docs/modules/Hub Module Overview.md`
  - `docs/modules/Doctor View Module Overview.md`
- Roadmaps/QA/Specs:
  - `docs/assistant-stack-refactor-roadmap.md`
  - `docs/assistant-multimodal-polish-roadmap.md`
  - `docs/Voice Assistant roadmap.md`
  - `docs/QA_CHECKS.md`
  - `docs/carousel_integration.md`
  - `docs/assistant/Assistant_Actions_Spec.md`
  - `docs/assistant/Assistant_Endpoint_Spec.md`

0.3 Define "no break" checks (must still work) DONE
- Vitals panel saves (BP/Body/Lab/Training).
- Intake panel saves (water/salt/protein).
- Medication toggles (confirm/undo) and TAB CRUD.
- Assistant text panel opens and renders.

Deliverable:
- Locked checklist of files + docs and baseline behaviors.

Locked checklist (Phase 0 output):
- Files (frozen set):
  - `app/modules/capture/index.js`
  - `app/modules/capture/bp.js`
  - `app/modules/capture/body.js`
  - `app/modules/capture/lab.js`
  - `app/modules/capture/entry.js`
  - `app/modules/activity/index.js`
  - `app/modules/medication/index.js`
  - `app/modules/trendpilot/`
  - `app/modules/hub/index.js`
  - `app/styles/hub.css`
  - `index.html`
  - `app/core/capture-globals.js`
  - `app/supabase/api/intake.js`
- Docs (to update later, frozen list):
  - `docs/modules/Capture Module Overview.md`
  - `docs/modules/Activity Module Overview.md`
  - `docs/modules/Intake Module Overview.md`
  - `docs/modules/Medication Module Overview.md`
  - `docs/modules/Trendpilot Module Overview.md`
  - `docs/modules/Hub Module Overview.md`
  - `docs/modules/Doctor View Module Overview.md`
  - `docs/assistant-stack-refactor-roadmap.md`
  - `docs/assistant-multimodal-polish-roadmap.md`
  - `docs/Voice Assistant roadmap.md`
  - `docs/QA_CHECKS.md`
  - `docs/carousel_integration.md`
  - `docs/assistant/Assistant_Actions_Spec.md`
  - `docs/assistant/Assistant_Endpoint_Spec.md`
- Baseline behaviors (must still work after each phase):
  - Vitals: BP/Body/Lab/Training save + reset.
  - Intake: Water/Salt/Protein save + pills update.
  - Medication: Confirm/Undo, low-stock ack, TAB CRUD.
  - Assistant: Text panel opens and renders.

-------------------------------------------------------------------------------
Phase 1 - Vitals Stack (merge capture + activity) DONE

1.1 Create folders DONE
- `app/modules/vitals-stack/vitals/`
- `app/modules/vitals-stack/activity/`

1.2 Move capture logic into vitals DONE
- Move files:
  - `app/modules/capture/index.js` -> `app/modules/vitals-stack/vitals/index.js`
  - `app/modules/capture/bp.js` -> `app/modules/vitals-stack/vitals/bp.js`
  - `app/modules/capture/body.js` -> `app/modules/vitals-stack/vitals/body.js`
  - `app/modules/capture/lab.js` -> `app/modules/vitals-stack/vitals/lab.js`
  - `app/modules/capture/entry.js` -> `app/modules/vitals-stack/vitals/entry.js`
- Update any relative imports inside those files.

1.3 Move activity module DONE
- `app/modules/activity/index.js` -> `app/modules/vitals-stack/activity/index.js`

1.4 Update script tags in `index.html` DONE
- Replace old `app/modules/capture/*` and `app/modules/activity/index.js` paths.
- Ensure load order remains the same as before.

1.5 Update VAD/worklet paths only if Vitals references them (keep in Hub for now). DONE

Acceptance DONE:
- Vitals panel (BP/Body/Lab/Training) still saves correctly.
- No missing script errors in console.

-------------------------------------------------------------------------------
Phase 2 - Extract Intake module from Vitals

2.1 Create Intake module folder
- `app/modules/intake-stack/intake/`

2.2 Move intake logic out of `vitals/index.js`
- Move intake state, timers, pills, and save helpers into
  `app/modules/intake-stack/intake/index.js`.
- Decide where `app/core/capture-globals.js` lives:
  - If only intake uses it, move into intake module.
  - If shared, keep in `app/core/`.

2.3 Hub integration
- Hub should call Intake API for pills/header sync.
- Hub only renders; Intake owns data + updates.

2.4 Keep medication hooks working
- Intake module should still call `AppModules.medication` for daily toggles.

Acceptance:
- Intake panel (IN) still saves and refreshes.
- Intake pills show in header as before.

-------------------------------------------------------------------------------
Phase 3 - Intake Stack (intake + medication)

3.1 Create folders
- `app/modules/intake-stack/medication/`

3.2 Move medication module
- `app/modules/medication/index.js` -> `app/modules/intake-stack/medication/index.js`
- Update script tags in `index.html`.

3.3 Update intake module references
- Change `AppModules.medication` load path but keep API name stable.

Acceptance:
- Medication IN/TAB still works.
- Low-stock and safety hints still render.

-------------------------------------------------------------------------------
Phase 4 - Assistant Stack (use existing roadmap)

4.1 Follow `docs/assistant-stack-refactor-roadmap.md`
- Move assistant + vad into assistant-stack.
- Optional voice extraction step as described there.

Acceptance:
- Assistant text and voice still work after refactor.

-------------------------------------------------------------------------------
Phase 5 - Docs sync

5.1 Update module overviews to new paths
- Capture Overview becomes Vitals Stack overview (or update to new paths).
- Activity Overview path updates.
- Intake + Medication overviews update paths to intake-stack.
- Hub overview updated to point to new stacks.
- Doctor View overview updated for new module locations.

5.2 Update roadmaps/QA/specs
- Replace old paths in the list from Phase 0.2.

Acceptance:
- No doc references to old module paths.
- New chats can follow paths without guesswork.

-------------------------------------------------------------------------------
Phase 6 - Regression checklist

6.1 Vitals
- BP/Body/Lab/Training save + reset.

6.2 Intake
- Water/Salt/Protein save + pills update.

6.3 Medication
- Confirm/Undo, Low-stock ack, TAB CRUD.

6.4 Assistant
- Text send, photo upload, voice trigger (if enabled).

6.5 Capture cleanup check
- Search repo for remaining `capture` references.
- Confirm no runtime dependency on `app/modules/capture/`.
- If only docs mention it, update or remove those references.

Definition of Done:
- New stack structure in place.
- All references updated.
- No regressions in key flows.

Next:
- Continue with `docs/assistant-stack-refactor-roadmap.md`.


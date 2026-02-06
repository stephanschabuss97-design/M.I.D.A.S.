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
  - `trendpilot/` (trend analysis module)
- `app/modules/intake-stack/`
  - `intake/` (new module extracted from capture)
  - `medication/` (old medication module)
- `app/modules/assistant-stack/`
  - `assistant/`, `voice/`, `intent/`, `vad/` (see assistant-stack roadmap)
- `app/modules/doctor-stack/`
  - `charts/` (doctor charts)
- Standalone: `appointments`, `profile`, `doctor`, `hub`

Current layout (from repo scan):
- Vitals: `app/modules/vitals-stack/vitals/` (bp, body, lab, entry, panel logic)
- Activity: `app/modules/vitals-stack/activity/index.js`
- Intake: `app/modules/intake-stack/intake/index.js`
- Medication: `app/modules/intake-stack/medication/index.js`
- VAD: `app/modules/assistant-stack/vad/*`
- Assistant: `app/modules/assistant-stack/assistant/*`
- Trendpilot: `app/modules/vitals-stack/trendpilot/`
- Charts: `app/modules/doctor-stack/charts/index.js`
- Hub: `app/modules/hub/index.js`
- Intake UI lives in `index.html` under the Intake panel (IN/TAB).

-------------------------------------------------------------------------------
Phase 0 - Inventory and freeze (deterministic) DONE

0.1 Freeze the current file list DONE
- Vitals: `app/modules/vitals-stack/vitals/index.js`, `bp.js`, `body.js`, `lab.js`, `entry.js`
- Activity: `app/modules/vitals-stack/activity/index.js`
- Intake: `app/modules/intake-stack/intake/index.js`
- Medication: `app/modules/intake-stack/medication/index.js`
- Trendpilot: `app/modules/vitals-stack/trendpilot/`
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
  - `app/modules/vitals-stack/vitals/index.js`
  - `app/modules/vitals-stack/vitals/bp.js`
  - `app/modules/vitals-stack/vitals/body.js`
  - `app/modules/vitals-stack/vitals/lab.js`
  - `app/modules/vitals-stack/vitals/entry.js`
  - `app/modules/vitals-stack/activity/index.js`
  - `app/modules/intake-stack/intake/index.js`
  - `app/modules/intake-stack/medication/index.js`
  - `app/modules/vitals-stack/trendpilot/`
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
  - `app/modules/vitals-stack/vitals/index.js`
  - `app/modules/vitals-stack/vitals/bp.js`
  - `app/modules/vitals-stack/vitals/body.js`
  - `app/modules/vitals-stack/vitals/lab.js`
  - `app/modules/vitals-stack/vitals/entry.js`
- Update any relative imports inside those files.

1.3 Move activity module DONE
- `app/modules/vitals-stack/activity/index.js`

1.4 Update script tags in `index.html` DONE
- Replace old module paths for vitals and activity.
- Ensure load order remains the same as before.
- Ensure `app/modules/vitals-stack/activity/index.js` is loaded as a standalone script.

1.5 Update VAD/worklet paths only if Vitals references them (keep in Hub for now). DONE

Acceptance DONE:
- Vitals panel (BP/Body/Lab/Training) still saves correctly.
- No missing script errors in console.

-------------------------------------------------------------------------------
Phase 2 - Extract Intake module from Vitals DONE

2.1 Create Intake module folder DONE
- `app/modules/intake-stack/intake/`

2.2 Move intake logic out of `vitals/index.js` DONE
- Move intake state, timers, pills, and save helpers into
  `app/modules/intake-stack/intake/index.js`.
- Decide where `app/core/capture-globals.js` lives:
  - Decision: keep in `app/core/` (shared with hub/main).

2.3 Hub integration DONE
- Hub should call Intake API for pills/header sync.
- Hub only renders; Intake owns data + updates.

2.4 Keep medication hooks working DONE
- Intake module should still call `AppModules.medication` for daily toggles.

Acceptance DONE:
- Intake panel (IN) still saves and refreshes.
- Intake pills show in header as before.

-------------------------------------------------------------------------------
Phase 3 - Intake Stack (intake + medication) DONE

3.1 Create folders DONE
- `app/modules/intake-stack/medication/`

3.2 Move medication module DONE
- `app/modules/intake-stack/medication/index.js`
- Update script tags in `index.html`.

3.3 Update intake module references DONE
- Change `AppModules.medication` load path but keep API name stable.

Acceptance DONE:
- Medication IN/TAB still works.
- Low-stock and safety hints still render.

-------------------------------------------------------------------------------
Phase 4 - Assistant Stack (use existing roadmap) DONE

4.1 Follow `docs/assistant-stack-refactor-roadmap.md`
- Move assistant + vad into assistant-stack.
- Optional voice extraction step as described there.

Acceptance DONE:
- Assistant text and voice still work after refactor.

-------------------------------------------------------------------------------
Phase 5 - Docs sync DONE

5.1 Update module overviews to new paths DONE
- Capture Overview becomes Vitals Stack overview (or update to new paths).
- Activity Overview path updates.
- Intake + Medication overviews update paths to intake-stack.
- Hub overview updated to point to new stacks.
- Doctor View overview updated for new module locations.

5.2 Update roadmaps/QA/specs DONE
- Replace old paths in the list from Phase 0.2.

Acceptance DONE:
- No doc references to old module paths.
- New chats can follow paths without guesswork.

-------------------------------------------------------------------------------
Phase 6 - Regression checklist DONE

6.1 Vitals
- BP/Body/Lab/Training save + reset.

6.2 Intake
- Water/Salt/Protein save + pills update.

6.3 Medication
- Confirm/Undo, Low-stock ack, TAB CRUD.

6.4 Assistant
- Text send, photo upload, voice trigger (if enabled).

6.5 Capture cleanup check DONE
- Search repo for remaining old module-path references.
- Confirm no runtime dependency on retired module folders.
- If only docs mention them, update or remove those references.

-------------------------------------------------------------------------------
Phase 7 - Move Trendpilot into Vitals Stack DONE

7.1 Create folder DONE
- `app/modules/vitals-stack/trendpilot/`

7.2 Move Trendpilot module DONE
- Move `app/modules/trendpilot/*` -> `app/modules/vitals-stack/trendpilot/`
- Update any relative imports inside moved files.

7.3 Update script tags DONE
- Replace `app/modules/trendpilot/` paths in `index.html` with
  `app/modules/vitals-stack/trendpilot/`.
- Keep load order unchanged.

7.4 Update references DONE
- Search for `app/modules/trendpilot/` in the repo and update to the new path.
- Update `docs/modules/Trendpilot Module Overview.md`.
- Update any roadmaps/specs that mention Trendpilot paths.

7.5 Cleanup DONE
- Remove the empty `app/modules/trendpilot/` folder.
- Confirm no runtime dependency on the old path.

7.6 Smoke check DONE
- Open Trendpilot UI and confirm charts/data render.
- Trigger a refresh path (if available) and confirm no console errors.

-------------------------------------------------------------------------------
Phase 8 - Move Protein into Vitals Stack DONE

8.1 Create folder DONE
- `app/modules/vitals-stack/protein/`

8.2 Move Protein module DONE
- Move `app/modules/protein/*` -> `app/modules/vitals-stack/protein/`
- Update any relative imports inside moved files.

8.3 Update script tags DONE
- Replace `app/modules/protein/` paths in `index.html` with
  `app/modules/vitals-stack/protein/`.
- Keep load order unchanged.

8.4 Update references DONE
- Search for `app/modules/protein/` in the repo and update to the new path.
- Update `docs/modules/Protein Module Overview.md`.
- Update any roadmaps/specs that mention Protein paths.

8.5 Cleanup DONE
- Remove the empty `app/modules/protein/` folder.
- Confirm no runtime dependency on the old path.

8.6 Smoke check DONE
- Body save triggers protein recompute.
- Profile targets update and Intake/Assistant reflect new targets.

-------------------------------------------------------------------------------
Phase 9 - Move Charts into Doctor Stack DONE

9.1 Create folder DONE
- `app/modules/doctor-stack/charts/`

9.2 Move Charts module DONE
- Move `app/modules/charts/*` -> `app/modules/doctor-stack/charts/`
- Update any relative imports inside moved files.

9.3 Update script tags DONE
- Replace `app/modules/charts/` paths in `index.html` with
  `app/modules/doctor-stack/charts/`.
- Keep load order unchanged.

9.4 Update references DONE
- Search for `app/modules/charts/` in the repo and update to the new path.
- Update `docs/modules/Charts Module Overview.md`.
- Update any roadmaps/specs that mention charts paths.

9.5 Cleanup DONE
- Remove the empty `app/modules/charts/` folder.
- Confirm no runtime dependency on the old path.

9.6 Smoke check DONE
- Doctor view loads and charts render.
- Trendpilot overlays still appear in charts.

-------------------------------------------------------------------------------
Phase 10 - Move Doctor Module into Doctor Stack

10.1 Create folder
- `app/modules/doctor-stack/doctor/`

10.2 Move Doctor module DONE
- Move `app/modules/doctor/*` -> `app/modules/doctor-stack/doctor/`
- Update any relative imports inside moved files.

10.3 Update script tags DONE
- Replace `app/modules/doctor/` paths in `index.html` with
  `app/modules/doctor-stack/doctor/`.
- Keep load order unchanged.

10.4 Update references DONE
- Search for `app/modules/doctor/` in the repo and update to the new path.
- Update `docs/modules/Doctor View Module Overview.md`.
- Update any roadmaps/specs that mention doctor paths.

10.5 Cleanup DONE
- Remove the empty `app/modules/doctor/` folder.
- Confirm no runtime dependency on the old path.

10.6 Smoke check
- Doctor view loads and renders tables.
- Actions (export, inbox, filters) still work.

Definition of Done:
- New stack structure in place.
- All references updated.
- No regressions in key flows.

Next:
- Continue with `docs/assistant-stack-refactor-roadmap.md`.


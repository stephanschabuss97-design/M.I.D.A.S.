# Doctor View & Lab Domain – Implementation Roadmap

This document captures the restructuring prompt and translates it into a deterministic plan of record so the upcoming Doctor View overhaul can be executed step by step without ambiguity.

## 1. Initial Prompt (Idea & Vision)

- Split the current Doctor View into **three medical domains** – Blood Pressure (BP), Body Composition, Laboratory/CKD – each backed by its own `health_events` type and rendered inside dedicated tabs.
- Introduce a **new `lab_event`** whose payload stores `egfr`, `creatinine`, an optional CKD stage dropdown, optional metabolic markers (`hba1c`, `ldl`), plus a short doctor comment.
- Add **monthly reports** as `system_comment` entries (`subtype: "monthly_report"` with `{ month, text, summary, created_at }`) so the AI never fabricates “fake days” with zeros.
- Update the **Vitals Input Panel** to become the unified entry point: BP input → `bp_event`, Body input → `body_event`, new Lab input → `lab_event`.
- Provide a manual trigger inside Doctor View that calls a new **Edge Function (`midas-monthly-report`)** which fetches `bp_series[]`, `body_series[]`, and `lab_series[]` (empty arrays mean “no data”) and stores the report as a system comment. Later this will run automatically on PWA.
- The **Vitals panel** becomes the unified entry point: BP, Body, and the new Lab card live in the same overlay, and a tab row (`Body`, `Lab`, `Inbox`, `Arzt-Ansicht`, `Diagramm`) lets users hop straight into the corresponding Doctor tab.
- Inbox tab inside Doctor View should display the monthly reports; Trendpilot/system comments must stay AI-only (monthly reports are archive-only).
- Never synthesize `0` values, never reuse monthly reports as AI inputs, and keep the three domains strictly separated inside the existing event architecture.

## 2. Deterministic Step-by-Step Roadmap

### Step 1 – Database & Supabase Schema
1. ✅ Extend `health_events` to allow a `type = 'lab_event'` and enforce the new payload contract inside `trg_events_validate()` (numeric range checks, optional fields, `ctx` stays `NULL`).
2. ✅ Add documentation comments plus unique/index constraints for lab rows (`user_id + day + type`).
3. ✅ Create `v_events_lab` (security invoker) that exposes all lab payload fields (incl. derived `ckd_stage`) as typed columns.
4. ✅ Update schema docs so `system_comment` explicitly lists the new `monthly_report` subtype and clarifies that those payloads are read-only.

### Step 2 – Supabase API & Panel Wiring
1. ✅ Implement `loadLabEventsRange` beside the existing BP/Body loaders and export it via the Supabase barrel.
2. ✅ Keep `fetchDailyOverview` for legacy BP+Body consumers, but have the Doctor overlay call the three dedicated range loaders (BP, Body, Lab) directly so each tab renders its own domain.
3. ✅ Add subtype-aware helpers in `system-comments.js` (e.g., `fetchSystemCommentsBySubtype`) so monthly reports can be fetched without polluting existing Trendpilot/AI queries.

### Step 3 – Event Creation Logic & Capture Flow
1. ✅ Extend `assets/js/format.js` so capture entries with lab data emit `lab_event` rows and never inject placeholder values for missing metrics.
2. ✅ Create/bind a lab-specific capture module (similar to `bp.js`/`body.js`) that validates inputs, saves via `addEntry`/`syncWebhook`, and resets the form.
3. ✅ Wire the Vitals Panel to the new lab save handler; maintain consistent locking/error handling with the BP/Body buttons.

### Step 4 – Vitals Panel UI & Styles
1. ✅ Add a lab card in the Hub Vitals panel (inputs for eGFR, creatinine, CKD stage, HbA1c, LDL, comment) plus a “Save Lab” button and inline validation hints.
2. ✅ Update the shared Hub CSS so the new card aligns with existing cards on desktop/mobile layouts.
3. ✅ Add a “Generate monthly report” button in the doctor action group (disabled until the guard passes) to trigger the manual report flow (automation follows in the PWA/TWA phase).

### Step 5 – Doctor View Refactor (Tabs + Rendering)
1. Replace the single-column layout with a tabbed interface (BP, Body, Lab, Inbox) while keeping the global range controls.
   1.1 ✅ Add a tab strip inside `#doctor` (buttons for BP, Body, Lab, Inbox, Diagramm) with ARIA state toggles.
   1.2 ✅ Introduce tab-specific containers/scroll regions so each domain can render independently.
   1.3 ✅ Preserve the existing toolbar actions (Apply range, Werte anzeigen, Export, Monatsbericht) above the tabs.
2. Refactor `app/modules/doctor-stack/doctor/index.js` into per-domain loaders/renderers. Each tab pulls only its domain events, keeps its own scroll snapshot, and renders domain-specific cards:
   2.1 ✅ BP tab reuses the current blood-pressure table + Trendpilot section + delete actions.
   2.2 ✅ Body tab lists body composition metrics (weight, waist, fat %, muscle %) without BP columns.
   2.3 ✅ Lab tab renders lab entries (eGFR, creatinine, CKD stage, optional markers, doctor comment).
   2.4 ✅ Profile UI/Schema cleanup
   - Remove the CKD stage dropdown from app/modules/profile/index.js and the overview section.
   - Drop the ckd_stage column (or leave nullable) from public.user_profile if it’s no longer used.
   - Update docs (Profile Module Overview, QA scripts) so nobody expects to edit CKD in that panel.
   - Lab capture becomes the single source
   2.5 ✅ Keep the existing inputs in the Vitals/Lab card (CKD dropdown).
   - Ensure each lab save stores the A1–A3 class (already enforced in lab_event validation).
   - Derive a combined “CKD stage” string (e.g., G3a A2) based on the doctor-provided CKD dropdown and persist it in the `lab_event` payload (`ckd_stage`). Views/loaders expose the field for downstream consumers.
   2.6 ✅ Assistant/Profile consumers read from lab data
   - Added `loadLatestLabSnapshot()` in the Supabase vitals API so hub/profile modules can fetch the most recent `lab_event` directly.
   - `app/modules/profile/index.js` now loads that snapshot on every sync, exposes the derived `ckd_stage` via `getData()`, and renders a read-only “CKD-Stufe (Lab)” badge in the profile panel.
   - Assistant context (via `AppModules.profile.getData()`) automatically receives the derived value, eliminating the old editable dropdown.
   2.7 ✅ Docs & roadmap updates
   - Roadmap, Supabase Core overview, and profile QA/docs now state explicitly that CKD lives in `lab_event`/`v_events_lab` and `user_profile` no longer stores its own field.
   2.8 ✅ Inbox tab shows monthly reports with timestamps and summary text (no Ack/doctor-status controls). Preferred UX: the tab acts as an entry point, but monthly reports open in their own overlay (like Diagramm) so the narrative document gets a dedicated layout (timeline + print/export) instead of sharing the vitals scroller.
3. ✅ Ensure Trendpilot/system comments continue to ignore monthly reports so AI logic is untouched.
   - `fetchSystemCommentsRange` now adds `payload->>subtype is null`, so Trendpilot/AI fetches only domain hints without the archive-only `monthly_report` subtype.

### Step 6 – Monthly Report Integration
1. ✅ Add a client wrapper (or reuse Supabase functions) to call the `midas-monthly-report` Edge Function from the Doctor View toolbar.
   - `app/supabase/api/reports.js` exposes `generateMonthlyReportRemote` (edge call with auth headers).
   - Doctor module now exports `generateMonthlyReport`, so the toolbar button triggers the Edge function and refreshes the inbox.
2. ✅ Implement the Edge function so it:
   - Validates the requested month range.
   - Fetches `bp_series[]`, `body_series[]`, `lab_series[]` via Supabase queries (`v_events_*` views).
   - Builds `{ month, text, summary }` without inventing missing days.
   - Writes a `system_comment` row with `subtype: 'monthly_report'` and returns its ID/metadata.
3. ✅ After each run, refresh the Doctor View (Inbox tab) and ensure the report is never passed to Trendpilot/AI consumers.
   - Doctor View now awaits the generator response, runs `requestUiRefresh({ reason: 'doctor:monthly-report' })`, and if the Inbox overlay is open it re-fetches the list immediately so the new entry appears without reopening.
   - Monthly reports stay archive-only because `fetchSystemCommentsRange`/Trendpilot loaders still ignore every row with a `subtype`.

### Step 7 – Monthly Report Narrative
1. ✅ Generate a meaningful narrative per month:
   - Aggregate BP/Body/Lab trends (min/max, averages, deltas) and weave in the latest CKD stage context so the report text highlights stability vs. issues; add a short “next steps” paragraph (hydration, meds, labs) using rule-based heuristics.
   - Keep `payload.summary` concise (month + counts + key warning flag), store structured stats in `payload.meta` (avg_sys/dia, weight delta, latest lab values, warning flags), and write a multi-sentence narrative in `payload.text` (Markdown-friendly).
   - If no lab data exists, note it explicitly (e.g., “Keine Laborwerte – Termin planen”).
2. ✅ Refresh the Doctor Inbox UI to focus on the narrative:
   - Render summary + text separately, format the narrative with paragraphs/bullets, show warning badges when `payload.meta.flags` indicates risks.
   - Add delete and optional regenerate buttons per monthly report card (calls the Supabase API to delete/recreate the `system_comment`) so test runs don’t clutter the archive, and expose a “Neuen Monatsbericht” CTA in the overlay header next to the count.
3. ✅ Align CKD lab inputs with the doctor-sourced dataset (Albuminurie-Feld entfällt):
   - Entferne ACR/Albuminurie vollständig aus UI, Payload und Narrativen – nur der CKD-Dropdown bleibt für die ärztliche Klassifikation.
   - Lab Snapshots enthalten künftig `egfr`, `creatinine`, `hba1c`, `ldl`, `potassium`, `ckd_stage`, `comment`.
   - Edge Function & Monatsbericht greifen nur noch auf diese Felder zu; fehlende Werte werden als „nicht bestimmt im Berichtszeitraum“ markiert.

   3.1 Schema first: passe SQL/Trigger/View an, damit `albuminuria_stage` entfällt und nur der CKD-Wert validiert wird (Regex + Länge).
   3.2 Capture/UI second: Lab-Karte zeigt ausschließlich den CKD-Dropdown; Reset-/Save-Logik speichert nur noch `ckd_stage`.
   3.3 Loaders/snapshots third: Supabase-Loader (`v_events_lab`) und Hub/Profile müssen auf das verschlankte Schema reagieren.
   3.4 Edge function + narrative last: Monatsbericht-Generator und Texte basieren auf `ckd_stage` statt Albuminurie.

### Step 8 – Testing & Documentation
1. ✅ Smoke-test Schema: insert valid/invalid lab rows, confirm view outputs and RLS behavior.
2. ✅ UI tests: save BP, Body, Lab entries; delete a day; generate a monthly report; reopen each Doctor tab and confirm isolation.
3. ✅ Update docs (`modules/Doctor View`, `modules/Hub`, roadmap) with the new domain model and manual-report flow.

Following these ordered milestones keeps the implementation deterministic: database changes land first, then APIs, UI inputs, Doctor View rendering, backend report generation, and a final validation/documentation pass.

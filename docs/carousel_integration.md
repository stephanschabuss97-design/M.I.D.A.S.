# Carousel Integration Plan (Tri-Layer Hub)

## Purpose & Vision
The MIDAS Hub is evolving from a static orbit-button navigation into a dynamic, three-layer interaction model designed around natural gestures and modular control surfaces. The goal is to create a UI that:
- preserves the calm, serious medical tone of MIDAS,
- introduces personality and spatial structure,
- increases efficiency through fast-access tools,
- offers a high-level status overview without cluttering the main hub,
- keeps the MIDAS Core (golden sun/spear) always present as the central anchor.
This document defines how the carousel, quickbar, and dashboard layers integrate into the existing MIDAS Hub.

## Design Philosophy
The new hub interaction model is based on three principles:
- Horizontal = Navigation: left/right chooses which module to enter (e.g., Vitals, Intakes, Appointments, Assistant).
- Vertical Up = Tools / Quick Actions: swiping up reveals a Quickbar for instant actions without leaving context (e.g., quick intake add, open assistant, add appointment).
- Vertical Down = Status Overview: swiping down reveals a Dashboard with today’s state (e.g., water/salt/protein totals, vitals completion, next appointment).
Throughout all interactions, the MIDAS Core remains partially visible to maintain presence, orientation, and system identity.

## UX Intent
- The carousel becomes a modular control wheel (primary navigation).
- The quickbar becomes the user’s fast lane (efficiency layer).
- The dashboard becomes an always-available control deck (status layer).
- The design encourages fluid, intuitive interaction without cognitive overload.
- Each layer is purpose-specific and non-intrusive.

## Technical Guiding Principles
- No backend changes; reuse existing module state, Supabase calls, and refresh flows.
- Hub logic remains the single source of truth for panel visibility and module activation.
- Carousel must not duplicate business logic; it only triggers existing `openPanel(panelId)` or equivalent.
- Quickbar/Dashboard must not interfere with voice long-press, doctor unlock guard, capture/appointments/vitals save flows, or existing boot/refresh cycles.
- CSS transforms must stay GPU-friendly on mobile; avoid heavy filters during layered states.
- Accessibility must not regress; panels remain ESC-closeable, and focus order stays predictable.

## Scope
- Design a tri-layer interaction model for the existing MIDAS hub (carousel navigation, swipe-up quickbar, swipe-down dashboard) without changing backend/business logic.
- Document current hub wiring (entry points, DOM, CSS, JS behaviors, assets).
- Propose a modular technical architecture, phased rollout, and risks/open questions.

## Current Hub Implementation (relevant findings)

### Entry Points & Routing
- Boot: `app/core/boot-flow.js` drives boot stages; `assets/js/main.js` orchestrates app init, refresh loops, auth/doctor guards, and binds save/resume handlers.
- HTML shell: `index.html` contains the hub section (`#captureHub`) plus all hub panels and loads scripts in order (Supabase UMD, core modules, hub, capture/doctor/charts, then `assets/js/main.js`).
- Navigation: No SPA router; state is implicit. Hub buttons open panels via `app/modules/hub/index.js`. Legacy tabs (`assets/js/ui-tabs.js`) remain for capture/doctor fallback but hub is primary.
- Hub activation: `app/modules/hub/index.js` waits for boot stage `INIT_UI` (or DOMContentLoaded) and adds `body.hub-mode`.

### Hub DOM & Layout
- Hub markup: `index.html` → `<section class="hub" id="captureHub">` with `.hub-hero > .hub-orbit` and `.hub-orbit-icons`.
- Orbit buttons: `<button class="hub-icon" data-hub-module="...">` positioned via `data-orbit-pos` (north/ne/e/se/sw/w/nw). Modules exposed: vitals, assistant-text (tap vs long-press voice), diag (log), appointments, intake, disabled placeholder (dictate), profile. Doctor opens from within vitals (button) not from orbit.
- Panels: Fixed overlays `<section class="hub-panel" data-hub-panel="...">` for assistant-text, profile, appointments, intake, doctor, vitals. Backdrop `.hub-backdrop` and `body:has(.hub-panel.is-visible)` lock the orbit/scroll.
- Data anchors reused: intake pills moved into hub via `[data-role="hub-intake-pills"]`, date input `#date` shared with capture.

### Hub Styling & Tokens
- Styles: `app/styles/hub.css` defines orbit sizing, aura, ring, panel glassmorphism, and panel animations.
- Key CSS vars already in use: `--hub-orb-size`, `--midas-aura-boost`, `--voice-base-glow`, `--voice-ring-scale`, `--voice-amp`; media-query overrides adjust aura/radius for mobile.
- Layering: Aura (`.midas-aura-flow`, animated conic gradient), background image (`.hub-orb-bg`), golden ring (`.midas-ring-gold`), foreground sprite (`.hub-orb-fg`). Panel overlay uses `::after` on `.hub` plus fixed `.hub-panel` (z-index 40) and body scroll lock. Buttons are absolutely positioned via inline `left/top` computed in JS.

### Hub JavaScript (app/modules/hub/index.js)
- Orbit placement: `ORBIT_BUTTONS` angles; `setupOrbitHotspots` computes `left/top` by radius and angle on resize.
- Panel control: `openPanel/closeActivePanel` toggle classes (`hub-panel-open`, `hub-panel-closing`, `is-visible`, `aria-hidden`, `inert`), syncs `aria-pressed` on buttons, ESC closes panels.
- Voice/assistant: long-press on assistant button triggers voice; gate checks boot/auth state (`computeVoiceGateStatus` → `body.voice-locked`). Voice controller handles VAD (`app/modules/hub/vad/`), Supabase function calls for transcribe/assistant/tts, and sets `data-voice-state` on `.hub-orbit`. Assistant chat controller syncs intake snapshot + upcoming appointments into pills/list; listens to `appointments:changed`.
- State exposure: `AppModules.hub` exposes `activateHubLayout`, `openDoctorPanel`, `closePanel`, `forceClosePanel`, `getVoiceGateStatus`, `isVoiceReady`, `onVoiceGateChange`.
- Helpers: `moveIntakePillsToHub`, `setupDatePill` (ensures `#date` filled), placeholder `setupChat`, `setSpriteStateFn` currently locks orb sprite to idle image.

### Modules & Panels Inventory
- Panels in hub: assistant-text, profile, appointments, intake, doctor, vitals. Log (`#diag`) is outside hub but opened via orbit button.
- Modules in codebase: `app/modules/{assistant,appointments,capture,charts,doctor,hub,profile,trendpilot}` plus Supabase API layer.
- IDs/attributes: panels keyed by `data-hub-panel`; buttons by `data-hub-module` + `data-orbit-pos`; doctor guard via Supabase guard (`requireDoctorUnlock`).
- Data sources available for future dashboard/quickbar: `AppModules.captureGlobals.captureIntakeState` / `capture.getCaptureIntakeSnapshot()`, `AppModules.appointments.getUpcoming?` (exposed in appointments module), vitals/BP state via capture module and `AppModules.bp`, profile data via `AppModules.profile.getData()`, trendpilot summaries via `AppModules.trendpilot`.

### Assets & Iconography
- Assets live in `assets/img/` (orb backgrounds `midas_background_v1.PNG`, sprite states `Idle_state.png`, `Intakes_state.png`, `Vitals_state.png`, `doctor_view_state.png`, wordmarks). No dedicated hub icon set yet.
- Recommendation for new 3D/golden icons: create `assets/img/hub-icons/` (or `assets/img/icons/hub/`) with consistent names `hub-{module}-{state}.webp` or `.svg` (prefer WebP/SVG for size, fall back to PNG). Keep existing orb sprites in place; carousel/quickbar can reference new paths via module metadata.

## Target Tri-Layer Architecture

### Layering & Containers
- Base Hub Layer: existing `.hub-hero` / `.hub-orbit` (core + aura + carousel) becomes a movable block. Introduce CSS vars:
  - `--hub-y-offset: 0%` (0 default, negative for swipe-up, positive for swipe-down).
  - `--hub-carousel-angle: 0deg` (rotation of carousel icons).
  - `--hub-core-visibility: 0.4` (0–1 fraction kept visible when shifting).
- Quickbar Layer (fast actions): hidden by default; slides into view from below when hub moves up. Lives adjacent to `.hub-hero` inside `#captureHub`, with its own container `div.hub-quickbar` occupying the freed space. Z-index above background, below panels.
- Dashboard Layer (status): hidden by default; slides up from bottom when hub moves down. Container `div.hub-dashboard` (stacked cards) sits under `.hub-hero`. Hub shifts down by ~35–50% of orb height so the core stays partially visible at top.
- Ordering/z-index: aura/orbit at base, quickbar/dashboard in same stacking context but toggled via visibility/translate; hub panels keep highest overlay (z 40) unchanged.

### Carousel Design (primary navigation)
- Layout: orbit icons reinterpreted as a circular carousel around the core, calm by default (no auto-spin). Active slot anchored (e.g., top or slight NE); rotation driven via `--hub-carousel-angle` applied to the icon ring.
- State: single active module tracked in a small controller (conceptual `carouselController`) with metadata array of modules `{id, label, iconPath, panelId, accent}`.
- Interaction: swipe/drag left-right (mobile) or arrow keys/clicks (desktop) adjust index → update CSS rotation var → set active module → call existing `openPanel(panelId)` from hub module. Keep hover/active glows via existing aura boosts.
- Encapsulation: carousel controller owns index math, writes CSS vars, emits events/callbacks (`onActiveChange`) consumed by hub to sync panels and `aria-pressed`.

### Quickbar Design (vertical up: fast actions)
- Purpose: compact strip/grid with module shortcuts and direct actions (e.g., `+250ml`, `Add appointment`, `Vitals AM/PM`, `Open chat`, `Open doctor chart`).
- Behavior: trigger via swipe up or handle button; hub moves up (e.g., `--hub-y-offset: -40%`), leaving 30–50% of core visible at bottom. Quickbar slides in with subtle translate/fade.
- Data: reuse module metadata; actions map to the same open handlers or lightweight actions (e.g., call assistant allowed actions, capture quick add). No state duplication—delegate to existing module APIs (`AppModules.capture.handleCaptureIntake`, `AppModules.appointments.openCreate`, etc.).
- Controller: `quickbarController` toggles visibility, manages focus trap, and coordinates vertical offset (sets CSS vars, adds body class like `quickbar-open`), but does not own carousel state.

### Dashboard Design (vertical down: status)
- Purpose: read-only/lightly interactive status cards for today/near-term.
- Behavior: swipe down or handle; hub shifts down (`--hub-y-offset: +40%`), core remains peeking at top. Dashboard slides up into view; dismiss by swiping up/back or close button.
- Content (pull from existing state): intake totals (water/salt/protein) via `captureIntakeState`, upcoming appointments via `appointments.getUpcoming`, vitals completion flags (AM/PM) via capture/BP state, optional trendpilot summary, profile reminders.
- Controller: `dashboardController` handles show/hide, fetches snapshots via existing module APIs, and refreshes on global events (`appointments:changed`, `assistant:action-success`, `capture:refresh-done`).

### Gestures, Inputs, Accessibility
- Mobile: horizontal swipe for carousel, vertical swipe for quickbar/dashboard. Use passive listeners on orbit area; prevent conflicts with panel scroll when overlays open.
- Desktop: keyboard (arrow keys to rotate carousel, PageUp/PageDown or custom keys for quickbar/dashboard), clickable handles/buttons with clear ARIA labels. Ensure focus order enters quickbar/dashboard when visible; maintain `aria-pressed` on active carousel item.
- Fallbacks: add explicit buttons for “Quick actions” and “Status” near hub for non-swipe contexts. Respect existing ESC-to-close for panels; ESC also closes quickbar/dashboard when open.

## Module & Action Mapping (initial proposal)
- Carousel modules (primary nav): assistant (text/voice), appointments, intake, vitals, doctor (open doctor panel with guard), profile, charts/trendpilot (via doctor/chart controls), capture/log placeholder, diag/log toggle (optional).
- Quickbar candidates: `+250ml` water, `Log salt/protein quick add`, `Vitals AM/PM` quick open, `New appointment`, `Open chat`, `Voice trigger`, `Show doctor chart`, `Open Trendpilot summary`.
- Dashboard cards: Intake today (totals + goal bars), Vitals completion (AM/PM done? from BP panes), Upcoming appointments (next 2), Trendpilot alert badge, Profile reminders (e.g., missing CKD stage), Assistant recent actions (optional).

## Deterministic Phase Guardrails
- Linear dependency chain: each phase depends only on outputs of all preceding phases (no parallel branches).
- Exit criteria per phase are concrete (DOM/CSS structure present, handlers wired, data visible) and must be met before advancing.
- No behavior changes before scaffolds exist (e.g., behavior wiring waits until both carousel and vertical layers exist).
- State ownership stays in hub controllers; new controllers must emit deterministic events rather than implicit side effects.

## Implementation Phases
Each phase lists scope, affected files, dependency (must be completed), and success criteria.

1) Phase 1 - Repo Analysis & Documentation  
   - Scope: Capture current hub DOM/CSS/JS and data sources.  
   - Files: `index.html`, `app/modules/hub/index.js`, `app/styles/hub.css`, module docs.  
   - Dependency: none.  
   - Success: `carousel_integration.md` (this doc) committed with current-state summary.

2) Phase 2 - Static Carousel Scaffold  
   - Scope: Add carousel container around orbit icons; static slots using module metadata; no logic change.  
   - Files: `index.html`, `app/styles/hub.css`.  
   - Dependency: Phase 1.  
   - Success: Orbit renders evenly spaced icons in a ring; core untouched; no behavior change.

3) Phase 3 - Carousel Behavior Design (JS hooks)  
   - Scope: Introduce carousel controller structure (rotation var, active index), wire to existing `openPanel` without changing panel logic.  
   - Files: `app/modules/hub/index.js` (structure only), `app/styles/hub.css` (vars).  
   - Dependency: Phase 2.  
   - Success: Clicking arrows/slots rotates ring (CSS var updates) and opens corresponding panel; voice/assistant long-press still works.

4) Phase 4 - Quickbar Scaffold (Swipe Up Layer)  
   - Scope: Add hidden `hub-quickbar` container + toggle affordance; define vertical offset CSS vars and transitions.  
   - Files: `index.html`, `app/styles/hub.css`.  
   - Dependency: Phase 3.  
   - Success: Quickbar slides in/out; hub shifts up leaving ~40% core visible; no new data calls.

5) Phase 5 - Dashboard Scaffold (Swipe Down Layer)  
   - Scope: Add `hub-dashboard` container with placeholder cards; share vertical offset logic.  
   - Files: `index.html`, `app/styles/hub.css`.  
   - Dependency: Phase 4.  
   - Success: Dashboard slides in when triggered; hub shifts down leaving core visible; placeholders render.

6) Phase 6 - Behavior Wiring  
   - Scope: Connect carousel/quickbar actions to existing open handlers; dashboard reads real data snapshots (intake, appointments, vitals).  
   - Files: `app/modules/hub/index.js`; minor hooks in `app/modules/appointments/index.js`, `app/modules/capture/index.js` if needed for snapshot helpers.  
   - Dependency: Phase 5.  
   - Success: Selecting items triggers existing panels/flows; dashboard shows live summaries without breaking current save flows.

7) Phase 7 - Gestures & Input  
   - Scope: Add swipe/drag/keyboard handling with accessibility fallbacks; ensure no conflict with panel scroll.  
   - Files: `app/modules/hub/index.js`, `app/styles/hub.css`.  
   - Dependency: Phase 6.  
   - Success: Swipes/keys reliably toggle carousel/quickbar/dashboard; ESC/back closes overlays; focus is preserved.

8) Phase 8 - UX Refinement & Performance  
   - Scope: Tune easing/durations, ensure partial core visibility (30–50%) on vertical moves, optimize transforms for mobile.  
   - Files: `app/styles/hub.css`, minor JS tweaks.  
   - Dependency: Phase 7.  
   - Success: Smooth animations on mobile; aura/core remain visible; no regressions in panel open/close timings.

## Risks & Open Questions
- Gesture conflicts: swipe listeners vs. panel scroll areas; need clear hit zones and passive listeners.
- Performance on low-end mobile: concurrent animations (aura + carousel rotation + vertical shift) may require reducing blur/backdrop-filter when quickbar/dashboard visible.
- State ownership: active module currently only in hub JS; carousel controller will become new source of truth—must avoid divergence with `aria-pressed`/panel state.
- Doctor guard flow: carousel activation of doctor must respect `requireDoctorUnlock`; ensure carousel rotation doesn’t trigger guard loops or leave user on locked state.
- Voice integration: assistant button double-duty (tap vs long-press) must stay intact when carousel navigation is added; consider separate voice trigger in quickbar to reduce accidental triggers.
- Data freshness: dashboard summaries depend on capture/appointments snapshots; confirm lightweight snapshot APIs (or add read-only getters) to avoid heavy Supabase calls on every swipe.
- Assets: need final format/golden icon source; confirm CSP allows `data:`/`blob:` for new assets (current CSP blocks external icons).

## Next Steps
- Review and sign off on architecture/phase plan.
- Align on icon asset pipeline (`assets/img/hub-icons/` naming, format).
- Decide default active carousel slot (e.g., assistant vs. intake) and visible core percentage for vertical shifts.

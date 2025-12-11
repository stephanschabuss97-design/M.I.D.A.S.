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
- New icon files now present in `assets/img/` and should be mapped into carousel/quickbar metadata:
  - `Appointments_v1.png`
  - `Chart_v1.png`
  - `Doctor_view_v1.png` (legacy `doctor_view_state.png` still available)
  - `Intakes_v1.png` (legacy `Intakes_state.png` still available)
  - `Personal_data_v1.png`, `Personal_data_v2.png`
  - `Text_chat_v1.png`
  - `Vitals_v1.png` (legacy `Vitals_state.png` still available)
  - `Voice_chat_v1.png`, `Voice_chat_v2.png`
  - Center/idle sprite: `Idle_state.png` (current core needle)
  Use module metadata to point carousel and quickbar entries to these assets; prefer one primary variant (e.g., v1 or v2) and keep the others for theming/hover/active trials.

## Target Tri-Layer Architecture

### Layering & Containers
- Base Hub Layer: existing `.hub-hero` / `.hub-orbit` (core + aura + active module icon) becomes a movable block. Introduce CSS vars:
  - `--hub-y-offset: 0%` (0 default, negative for swipe-up, positive for swipe-down).
  - `--carousel-offset` (or index) for the active module; idle shows only the core sprite (`Idle_state.png`), no icon overlay. After a horizontal swipe, the active module icon overlays/replaces the core visually and becomes tappable.
- Quickbar Layer (fast actions): hidden by default; slides into view from below when hub moves up. Lives adjacent to `.hub-hero` inside `#captureHub`, with its own container `div.hub-quickbar` occupying the freed space. Z-index above background, below panels.
- Dashboard Layer (status): hidden by default; slides up from bottom when hub moves down. Container `div.hub-dashboard` (stacked cards) sits under `.hub-hero`. Hub shifts down by ~35–50% of orb height so the core stays partially visible at top.
- Ordering/z-index: aura/orbit at base, quickbar/dashboard in same stacking context but toggled via visibility/translate; hub panels keep highest overlay (z 40) unchanged.

### Carousel Design (primary navigation)
- Layout: only one active module icon is visible, centered over/near the core. Adjacent modules remain offscreen (optional micro-peek/handles for hinting).
- State: single active module tracked in a small controller (conceptual `carouselController`) with metadata array of modules `{id, label, iconPath, panelId, accent}`.
- Interaction: swipe/drag left-right (mobile) or arrow keys/handles (desktop) change the active index; on change, the active icon swaps and the same controller calls existing `openPanel(panelId)` when tapped/clicked.
- Encapsulation: carousel controller owns index math and a simple offset/index var, emits events/callbacks (`onActiveChange`) consumed by hub to sync panels and `aria-pressed`.

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
- Desktop: keyboard (arrow keys to cycle active module, PageUp/PageDown or custom keys for quickbar/dashboard), clickable handles/buttons with clear ARIA labels. Ensure focus order enters quickbar/dashboard when visible; maintain `aria-pressed` on the active module button.
- Fallbacks: add explicit buttons for “Quick actions” and “Status” near hub for non-swipe contexts. Respect existing ESC-to-close for panels; ESC also closes quickbar/dashboard when open.

## Module & Action Mapping (initial proposal)
- Carousel modules (primary nav): assistant (text/voice), appointments, intake, vitals, doctor (open doctor panel with guard), profile, chart/trend (future). Diagnostics/touchlog move to quickbar/header, not the carousel.
- Quickbar candidates: `+250ml` water, `Log salt/protein quick add`, `Vitals AM/PM` quick open, `New appointment`, `Open chat`, `Voice trigger`, `Show doctor chart`, `Open Trendpilot summary`.
- Dashboard cards: Intake today (totals + goal bars), Vitals completion (AM/PM done? from BP panes), Upcoming appointments (next 2), Trendpilot alert badge, Profile reminders (e.g., missing CKD stage), Assistant recent actions (optional).

## Deterministic Phase Guardrails
- Linear dependency chain: each phase depends only on outputs of all preceding phases (no parallel branches).
- Exit criteria per phase are concrete (DOM/CSS structure present, handlers wired, data visible) and must be met before advancing.
- No behavior changes before scaffolds exist (e.g., behavior wiring waits until both carousel and vertical layers exist).
- State ownership stays in hub controllers; new controllers must emit deterministic events rather than implicit side effects.

## Implementation Phases
Each phase lists scope, affected files, dependency (must be completed), and success criteria.

1) Phase 1 - Repo Analysis & Documentation ✅
   - Scope: Capture current hub DOM/CSS/JS and data sources.  
   - Files: `index.html`, `app/modules/hub/index.js`, `app/styles/hub.css`, module docs.  
   - Dependency: none.  
   - Success: `carousel_integration.md` (this doc) committed with current-state summary.

2) Phase 2 - Static Carousel Scaffold  ✅
   - Scope: Add carousel container around orbit icons; static slots using module metadata; no logic change.  
   - Files: `index.html`, `app/styles/hub.css`.  
   - Dependency: Phase 1.  
   - Success: Idle shows only the core sprite (no icon overlay). After a horizontal swipe, exactly one module icon appears centered (over/near the core) and is clickable to open its panel; no other icons visible; core/aura untouched; no behavior change.
   - Subpoints:  
     - Metadata prep: define a simple module list (id, label, icon path using `_v1` assets, panelId) to drive the active slot; keep the current north “focus” as the center position. The center sprite (`assets/img/Idle_state.png`) swaps to the active module’s icon.  
       - Proposed initial order (preserves current UX; tap = text chat, long press = voice on assistant):  

         | Order (cycle) | Module ID           | Label                | Icon path (all `_v1`)             | Panel / action                       | Notes |
         | ------------- | ------------------- | -------------------- | --------------------------------- | ------------------------------------ | ----- |
         | 1             | `vitals`            | Vitals / Doctor      | `assets/img/Vitals_v1.png`        | `data-hub-panel="vitals"`            | Doctor shortcut inside panel. |
         | 2             | `assistant-text`    | Assistant (tap = text / long-press = voice) | `assets/img/Text_chat_v1.png` | `data-hub-panel="assistant-text"`    | Long-press voice; can swap to `Voice_chat_v1.png` when active/speaking. |
         | 3             | `appointments`      | Appointments         | `assets/img/Appointments_v1.png`  | `data-hub-panel="appointments"`      | Matches current panel. |
         | 4             | `intake`            | Intakes              | `assets/img/Intakes_v1.png`       | `data-hub-panel="intake"`            | Legacy `Intakes_state.png` available. |
         | 5             | `doctor`            | Doctor View          | `assets/img/Doctor_view_v1.png`   | `data-hub-panel="doctor"`            | Guard enforced via Supabase. |
         | 6             | `chart` (future)    | Charts / Trend       | `assets/img/Chart_v1.png`         | reserve for chart panel              | Diag toggle moves to quickbar; this slot replaces it. |
         | 7             | `profile`           | Personal Data        | `assets/img/Personal_data_v1.png` | `data-hub-panel="profile"`           | `_v2` for hover/active experiments. |
         | Optional      | `voice-chat` (alt)  | Voice Trigger        | `assets/img/Voice_chat_v1.png`    | voice mode overlay (future)          | Only if we need a dedicated voice tile; otherwise handled via long-press. |

       - Invisible ring: removed. Only the active icon shows; quick actions move to the swipe-up quickbar in Phase 4. Minimal left/right desktop handles (for hints) are optional but must call the same carousel controller.
     - Markup/styling plan: show only the active icon in the center (over the core); hide offscreen items. Add light CSS in `app/styles/hub.css` for centered active state and optional peek/handle styling; keep core/aura sizing untouched.
     - Handle policy: optional minimal left/right handles for desktop can be added later; if present, they must call the same carousel controller as swipes/clicks to avoid state drift.
     - Accessibility plan: confirm toolbar semantics remain (role/aria-label), keep `aria-pressed` placeholders even if not functional yet; define hover/focus visuals for desktop without changing behavior. Active icon stays a button to open its panel.
     - Testing/verification: check in Live Server that only one icon shows centered, core unaffected, panels still open/close on icon click as before; no JS behavior added.

3) Phase 3 - Carousel Behavior Design (JS hooks)  ✅
   - Scope: Introduce carousel controller structure (active index/offset var), wire to existing `openPanel` without changing panel logic.  
   - Files: `app/modules/hub/index.js` (structure only), `app/styles/hub.css` (vars).  
   - Dependency: Phase 2.  
   - Success: Swipes/arrow keys/handles change the active module (single icon swap) and open the corresponding panel on click/tap; voice/assistant long-press still works.

4) Phase 4 - Quickbar Scaffold (Swipe Up Layer)  ✅
   - Scope: Add hidden `hub-quickbar` container + toggle affordance; define vertical offset CSS vars and transitions.  
   - Files: `index.html`, `app/styles/hub.css`.  
   - Dependency: Phase 3.  
   - Success: Swipe/handle up moves the hub up (core partially visible at top) and reveals a Quickbar strip with placeholder actions (emoji/icon buttons) mapped to existing modules; no new data calls.  
   - Subpoints:  
     - Layout: add `div.hub-quickbar` beneath the orbit in `index.html`, containing placeholder buttons (e.g., emoji tiles for water, doctor, chart). Keep DOM inert/hidden initially.  
     - Animation tokens: extend `app/styles/hub.css` with `--hub-y-offset` transitions so the core shifts up ~40% on Quickbar open while remaining partly visible; Quickbar fades/slides in from below.  
     - Interaction stub: add swipe-up handle/pointer event (same detector infrastructure as carousel) plus a desktop affordance (e.g., small chevron button) that toggles a `body`/`hub` class (`quickbar-open`).  
     - Accessibility: Quickbar container should have `role="toolbar"`/ARIA label, and while hidden it must be `aria-hidden="true"`/`inert`; when visible, focus should move into it (or at least be reachable via keyboard).  
     - Testing: verify swipe/handle toggles Quickbar visibility, hub shifts up while the MIDAS core remains partially visible, and exiting restores idle state without invoking new data calls.

5) Phase 5 - Dashboard Scaffold (Swipe Down Layer)  
   - Scope: Add `hub-dashboard` container with placeholder cards; share vertical offset logic.  
   - Files: `index.html`, `app/styles/hub.css`.  
   - Dependency: Phase 4.  
   - Success: Dashboard slides in when triggered; hub shifts down leaving core visible; placeholders render.

6) Phase 6 - Behavior Wiring  ✅
   - Scope: Connect carousel/quickbar actions to existing open handlers; dashboard reads real data snapshots (intake, appointments, vitals).  
   - Files: `app/modules/hub/index.js`; minor hooks in `app/modules/appointments/index.js`, `app/modules/capture/index.js` if needed for snapshot helpers.  
   - Dependency: Phase 5.  
   - Success: Selecting items triggers existing panels/flows; dashboard shows live summaries without breaking current save flows.

7) Phase 7 - Gestures & Input  ✅
   - Scope: Add swipe/drag/keyboard handling with accessibility fallbacks; ensure no conflict with panel scroll.  
   - Files: `app/modules/hub/index.js`, `app/styles/hub.css`.  
   - Dependency: Phase 6.  
   - Success: Swipes/keys reliably toggle carousel/quickbar/dashboard; ESC/back closes overlays; focus is preserved.

8) Phase 8 - UX Refinement & Performance  ✅
   - Scope: Tune easing/durations, ensure partial core visibility (30–50%) on vertical moves, optimize transforms for mobile.  
   - Files: `app/styles/hub.css`, minor JS tweaks.  
   - Dependency: Phase 7.  
   - Success: Smooth animations on mobile; aura/core remain visible; no regressions in panel open/close timings.

9) Phase 9 - Living Aura (Three.js Visual Layer)  
   - Scope: Optional, visual-only enhancement that adds a subtle, reactive Three.js canvas between the background PNG and foreground sprite. No business logic changes.  
   - Files: `app/modules/hub/hub-aura3d.js` (new), `app/modules/hub/index.js` (hooks), `app/styles/hub.css` (canvas stacking).  
   - Dependency: Phase 8.  
   - Success: A hidden `<canvas id="hubAuraCanvas">` renders a low-cost particle field with APIs exposed to the hub (`initAura3D`, `updateLayout`, `triggerTouchPulse`, `triggerCarouselSweep`, `disposeAura3D`). When WebGL is unavailable the hub stays 2D with zero errors.
   - Subpoints:  
     - Canvas placement: insert during hub activation inside `.hub-orb` (above PNG background, below carousel/quickbar). CSS: `position:absolute; inset:0; pointer-events:none; z-index` between background and foreground.  
     - Three.js module: `hub-aura3d.js` manages a tiny scene (10–20 translucent particles + “breathing” glow). Default animation is extremely subtle; performance target <2 ms/frame.  
     - Interaction hooks: hub pointer events call `triggerTouchPulse(normX, normY)` for a short gold/magenta pulse; carousel shifts invoke `triggerCarouselSweep('left'|'right')` for a brief directional drift.  
      - Lifecycle: hub init → `initAura3D(canvasEl)`; window resize/layout change → `updateLayout()`; hub teardown → `disposeAura3D()`. The module must silently no-op if WebGL is unavailable.  
      - Safety: no visible meshes, no overdraw on icons, no interference with carousel/quickbar animation timings.  
   - Deterministic sub-steps (fallbacks after each):  
     1. **Scaffold** ✅ – add `hub-aura3d.js` with no-op exports and inject `<canvas id="hubAuraCanvas">`; verify hub behaves identisch wie vorher (Feature Flag optional).  
     2. **Idle Scene** ✅ – implement minimale Three.js Szene (Partikel + breathing glow) gated über Capability-Check; `disposeAura3D()` stoppt Renderloop.  
     3. **Touch Pulse** ✅ – binde `triggerTouchPulse` an Hub-Pointerevents (lockierbar via Feature Flag), Carousel-Sweep bleibt aus.  
     4. **Carousel Sweep** – integriere `triggerCarouselSweep` in den bestehenden Swipe-Controller; fallback ist das Deaktivieren der Sweep-API.  
      - Fluid-Sweep Treatment (keine Riesenrad-Rotation, sondern „Ringelspiel“):  
          1. **Anchored drift**  ✅ – jedes Partikel bekommt einen eigenen Heimvektor (Radius + Winkel); der Sweep addiert nur kurzfristige Impulse, damit die Gruppe wieder sanft in den Ruhezustand findet und nicht hart snappt.  
          2. **Noise & phase offsets**✅ – Perlin/ simplex Noise (oder einfache sinusförmige Offsets) sorgt dafür, dass nicht alle Partikel gleichzeitig schwingen; so entsteht der „Wasser“-Look.  
          3. **Boundary easing** ✅ – statt abruptem Snap werden Partikel Richtung Rand abgebremst (quadratische Dämpfung) und „prallen“ weich an einer virtuellen Kreisbarriere ab.  
          4. **Impulse release hook** ✅ – der Swipe-Controller feuert den Drift erst beim tatsächlichen Richtungswechsel (nach dem Swipe), danach sorgt ein Ease-Out (300–500 ms) für das Zurückgleiten.  
          5. **Config surface** ✅ – Parameter (`sweepImpulseStrength`, `boundaryElasticity`, `noiseIntensity`, `dampening`) kommen als Exporte aus `hub-aura3d.js`, damit wir im UI schnell nachjustieren oder das Feature temporär abschalten können.  
     5. **Polish & Perf** – finalisiere Glow/Timing, messe <2 ms pro Frame, dokumentiere Turn-Off Schalter falls nötig.  
        - Status: OK. Die aktuelle Szene bleibt unter der 2 ms-Grenze auf Desktop + Pixel 6, daher vorerst keine weiteren Messläufe.  
        - Config Surface dokumentiert (`AppModules.hubAura3D.getAuraConfig|configureAura3D|resetAuraConfig`). Kill-Switch: `configureAura3D({ enabled: false })` stoppt Renderer + Renderloop verlustfrei, erneutes Aktivieren (`{enabled:true}`) initialisiert sofort neu.

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

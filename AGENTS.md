# MIDAS Agent Contract

## Product Boundary

- MIDAS is Stephan's personal, single-user health operating system. It is not a
  generic health app, a SaaS product, or a multi-user platform.
- Optimize for low friction, quiet daily use, medical context, and long-term
  maintainability. Do not add speculative platform abstractions.
- MIDAS supports medical self-management and doctor communication. It never
  replaces diagnosis, treatment, or physician authority.
- Preserve module ownership: Hub orchestrates, Capture writes, Doctor reads,
  Profile supplies context, and Push remains a guarded safety net.

## Sources Of Truth

1. Read the root `README.md` for product intent and system boundaries.
2. Read the relevant `docs/modules/*.md` files for module contracts.
3. For roadmap creation, enter [BLUEPRINT](../codex-tools/docs/blueprint/README.md)
   directly. Its authoring contract and central forms are the single current
   roadmap process/template source of truth; apply the project boundaries below.
4. Before finalizing a new tool-dependent roadmap, perform the Environment
   Capability Preflight in the BLUEPRINT authoring contract. Use the local overlay
   and only needed ATLAS sections; missing/incompatible tools require an owner
   decision and never authorize installation. BLUEPRINT supplies the shared
   authoring core; MIDAS retains its medical, data and assurance rules.
5. The active roadmap and its Evidence file govern the current execution.
6. Archived `DONE` roadmaps and `(LEGACY)` process documents are historical
   evidence, not active instructions for new work.

Read only the references relevant to the current task. Reuse still-valid
evidence instead of repeatedly reopening unchanged files or rerunning unchanged
checks.

For large sources, search for the relevant symbol, section, producer, or
consumer first and then read the smallest range that can answer the current
contract question. A validated Context Receipt may replace a repeated raw read
only when its source fingerprint matches exactly, the current question is fully
covered, and no invalidation or exact-source requirement applies. Otherwise
read the authoritative source. The receipt is a cache, never a source of truth.
A completed tool process is not proof that its full output reached the model.
Record relevant reads as complete, focused-complete, truncated, partial, or
failed, and never reuse truncated output as sufficient context without a
focused follow-up read.

## Working Rules

- Work with the existing static HTML/CSS/JavaScript and Supabase architecture.
- Keep changes scoped, reversible, and compatible with the current product.
- Never generalize MIDAS to multiple users unless Stephan explicitly changes
  the product contract.
- Treat production SQL, Supabase changes, deploys, device actions, and other
  externally visible writes as owner-gated unless the current roadmap records
  an explicit approval.
- Preserve unrelated user changes in a dirty worktree.
- German UI and prose use correct Austrian German spelling and umlauts. Code
  identifiers may remain ASCII where existing contracts require it.

## Review And Evidence

- A `native review` means local code, contract, security, and scope inspection.
  It does not mean CodeRabbit.
- During roadmap execution with code changes, external CodeRabbit review
  belongs only to S5: one initial run and at most one verification run after
  justified fixes. Documentation-only roadmaps use no external review.
- Further external review runs require a new explicit owner request; a new
  finding alone does not increase the budget.
- Outside a roadmap, run CodeRabbit only when Stephan explicitly requests it.
- Use the canonical Windows command `coderabbit`. It routes to the authenticated
  WSL CLI. Do not reinstall CodeRabbit when this command is available.
- If the canonical command or authentication fails, stop the external review
  and report the prerequisite. Do not improvise an alternate installation.
- An exhausted or unavailable CodeRabbit budget blocks only further external
  CodeRabbit runs. It never invalidates existing evidence or prohibits a
  scoped native review; that review remains subject to its own scope,
  and roadmap gates.
- Rerun only checks invalidated by changed files or contracts. A full rerun is
  required only when shared behavior, security, data integrity, or the roadmap
  explicitly demands it.

## Roadmap Execution and Local Boundaries

- Read BLUEPRINT directly with this AGENTS file. New roadmaps explicitly adopt
  its dated revision; there is no local template or required LEGACY reading.
  Existing active roadmaps retain their frozen process and scope. Exact old
  rules come from their Git baseline when needed; current real product,
  security and owner gates and KASRKIN detachment remain effective.
- Local autonomy default is `gated`; use BLUEPRINT profiles and actual owner
  authority. A concrete full-scope approval permits green internal continuation
  without another routine question. Active roadmap/Evidence govern execution.
- Keep product/README, active roadmap/Resume/Findings, dirty boundary/diff,
  changed code and productive owner gates as live context; exact source reuse
  and read sufficiency follow BLUEPRINT. No usage/reset/checkpoint prerequisite.
- Active roadmap and optional Evidence live in `docs/`; after verified S6,
  archive both as `(DONE)` in `docs/archive/`, maintain links and final checks.
  `(LEGACY)` files have historical authority only. Commit/push require an
  explicit owner request, separate from documentation completion.
- MIDAS keeps a discussion space and a dedicated execution chat per roadmap;
  small contract-preserving corrections remain in the existing chat.
- Preserve the local model default `GPT-5.6 Sol`; creation and initial contract
  review default to `Extra High`. Plan execution reasoning per coherent block
  and risk; explicit current owner instructions take precedence. Never silently
  raise the configured level; record `NOT_OBSERVABLE` when it cannot be checked.
- R3 additionally includes medically visible logic/contracts. Roadmap metadata
  states medical/product context, risk/review depth, local gates and Evidence
  owner; target contracts include relevant units/time, error, dedupe, recovery,
  auth/RLS/cache and copy. Follow module/physician authority above.
- Before S4, freeze retained/removed features, data model/lifecycle/retention,
  cleanup/schedulers/secrets/external automations and compatible consumers.
  Secret readiness for scheduler/workflow/Edge/productive auth follows
  `docs/DEV_ENVIRONMENT.md`: names/consumers/canonical stores/local need/gates,
  no values; required stores ready before cutover, no indiscriminate mirroring.
- Productive UI writes require an S4R/S5 last-mile oracle: real DOM gesture,
  active listener, shell/lifecycle, commit/recovery, data access and transport.
  Component checks alone do not prove the productive path. Precheck current,
  forward/rollback postimage, product load and cache before costly test passes.
- Productive failure completes prepared rollback/data/runtime postchecks and
  safe Evidence/Resume first; diagnosis follows its scoped readiness and gates.
- Separate Evidence is mandatory for productive write/delete SQL; migration,
  RLS/ACL/roles/cron; multiple deploys or remote runtime gates; concurrency,
  lock or rollback proofs; extensive before/after counters. Use the central
  BLUEPRINT Evidence structure; one owner/file for coupled gates and no secrets,
  tokens or sensitive raw data. Local tooling/stores remain in the overlay.
- S6 synchronizes affected module overviews, QA and HOW-TO with proven results;
  decide changelog relevance: noteworthy changes under `Unreleased` in
  `CHANGELOG.md`, otherwise record a brief reason. This grants no release/tag.
  QA history and archived roadmaps remain evidence; `docs/QA_CHECKS.md` is the
  compatibility index. No mandatory general lessons-learned document.

## KASRKIN freeze / consumer detached — 2026-10-12

Stephan explicitly withdrew this project's KASRKIN consumer integration and
authorized detachment without a permit. This project is NOT an active KASRKIN
consumer. Normal work and roadmaps require no KASRKIN command trust setup,
telemetry refresh, request, forecast, reserve, Begin, permit or Complete.
This owner decision supersedes historical KASRKIN clauses in existing roadmaps;
it does not change their scope, acceptance, review or product/owner gates.

KASRKIN development and individual component review may continue in codex-tools.
Its production use is frozen. Do not restore a binding, activate an installation
or reintroduce enforcement without a new explicit owner decision.
Installed releases, receipts, historical starts/charges and original records
remain retained; detachment creates no usage record or eligible cost history.
Product, security, external-write and review gates remain in force. Paid Credits
are not authorized. Preserve unrelated work and create a safe handoff when needed.
Details and exact preimages: [integration status](.kasrkin/integration.md).

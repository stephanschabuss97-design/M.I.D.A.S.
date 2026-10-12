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
3. For roadmap work, follow `docs/templates/README.md` and
   `docs/templates/MIDAS Roadmap Workflow Contract.md`.
4. Before finalizing a new tool-dependent roadmap, perform the Environment
   Capability Preflight in the local workflow contract. Use the local overlay
   and only needed ATLAS sections; missing/incompatible tools require an owner
   decision and never authorize installation. BLUEPRINT supplies the shared
   authoring core; MIDAS retains its medical, data and assurance rules.
5. The active roadmap and its Evidence file govern the current execution.
6. Archived `DONE` roadmaps are historical evidence, not active instructions.

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

## Roadmap Execution

- Discovery may run autonomously through S1-S3 and optionally S4R when the
  roadmap permits it; honor every recorded gate and STOP condition.
- S4 is implementation with native delta/consumer reviews. S5 is the integrated
  full test and external-review phase. S6 synchronizes documentation and closes
  the roadmap.
- Before implementation, S4R must forecast scope and recommend safe autonomous
  execution waves. Forecast total execution effort, including context
  rehydration, tool interactions, browser or device work, review, documentation,
  troubleshooting, and postconditions; file count or changed lines alone are
  insufficient. Large work receives an owner briefing before S4.
- Keep the Resume Card, Context Receipt, and Evidence current enough for a
  fresh chat to continue without reconstructing the whole project history.
- Do not silently raise a roadmap's configured reasoning level. If the active
  UI/runtime level is not observable, record that limitation instead of
  claiming it was verified.
- A still-valid, fingerprint-bound owner approval is not requested again.
  When only Stephan can perform a required UI action, issue one exact operator
  instruction; do not present it as another approval gate.
- For a productive UI write path, component tests alone are insufficient.
  S4R and S5 must identify and prove the real last-mile chain from user gesture
  through active listener and lifecycle state to data access and transport.
- After a failed productive attempt, complete rollback and postchecks first.
  Root-cause diagnosis follows its own scope/owner gates and resumable
  postcondition; local or read-only does not make open diagnosis atomic.

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

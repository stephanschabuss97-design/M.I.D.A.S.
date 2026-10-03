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
4. The active roadmap and its Evidence file govern the current execution.
5. Archived `DONE` roadmaps are historical evidence, not active instructions.

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
  scoped native review; that review remains subject to its own usage, scope,
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
  Root-cause diagnosis is a new block with its own usage gate and resumable
  postcondition; local or read-only does not make open diagnosis atomic.

## Usage-Aware Continuation

- During local roadmap execution on Stephan's Windows workstation, apply the
  central usage continuation contract before the first main block and before
  every later main or coherent execution block.
- Use only the existing local Codex usage telemetry documented in
  `docs/DEV_ENVIRONMENT.md`; do not infer quota from chat banners, browser UI,
  or remembered values.
- Refresh and validate the telemetry with the canonical commands documented in
  `docs/DEV_ENVIRONMENT.md`; do not reinterpret the raw JSON ad hoc.
- In this initialized consumer, invoke KASRKIN through the stable `kasrkin`
  command from the project tree. Its resolver must validate the project-local
  `.kasrkin/binding.json` and exact installed release before dispatch. W7
  retired the duplicated local implementation; recovery uses the proven
  `codex-tools` source, installed release and receipts under an explicit
  rollback boundary.
- The exact installed KASRKIN release owns the Guard-vNext decision semantics,
  including admission, reserve, owner-boundary, restricted-work,
  anti-splitting, fallback, Safe-Closure, LIMIT, and evidence-reuse behavior.
  `docs/templates/MIDAS Roadmap Workflow Contract.md` owns when MIDAS must
  consult that decision oracle and how MIDAS executes and closes admitted
  work. `.kasrkin/activation.json` fingerprint-binds this consumer projection;
  do not recreate the formulas or state transitions here.
- Missing, partial, failed, or stale telemetry forbids a new major block. Close
  the current atomic block safely and preserve an exact resume boundary.
- A validator result of `LIMIT` or `0%` permits only the final user response:
  no new tool call, mutation, fallback, or documentation block.
- Usage gates never interrupt an atomic block already in progress and never
  weaken product, security, owner, deploy, SQL, device, or external-write
  gates. KASRKIN owns the decision semantics; the MIDAS workflow contract owns
  their project-specific consultation and execution effect.


## Installed KASRKIN Endphase (Activation/2)

- In every new PowerShell process, verify the local .kasrkin/command.json,
  binding, installation receipt and installed bootstrap bytes. Invoke that
  bootstrap with -ProjectRoot set to this project before kasrkin. Get-Command
  kasrkin must resolve the selected shim. No fallback, alias shadowing or
  persistent PATH change. Refresh with kasrkin validate -Refresh -Envelope.
- The pinned installed release owns usage decisions; this project's workflow
  owns product, medical/data/security/review, owner and external-write gates.
- Normal CONTINUE work may use regular admission. CAUTION or rejected primary
  work requires kasrkin gate -Endphase with a frozen complete plan and -Start,
  an allowed effectiveDecision and persisted permit before the first work
  action. Low-level policy or a W1 CAUTION result alone is insufficient.
- Complete the same permit with -CompletionPath after verification, review,
  evidence, documentation and closure. Measure freshly for each next whole
  block. These Endphase rules supersede the older one-block/SMALL restriction
  only for work admitted under this installed Endphase contract.
- First failure stops at the defined Finding/rollback boundary; no automatic
  diagnosis, fix or retry. Missing costs, capacity, episode and substantive
  gates remain separate reasons. Never invent AVAILABLE state or history.
- Owner exceptions require genuine finite scope/release-bound authorization.
  Controlled serial usage is required; no account-wide reservation is claimed.
  Paid-credit availability grants no spend. LIMIT/0 is final-response-only.

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
  execution waves. Large work receives an owner briefing before S4.
- Keep the Resume Card, Context Receipt, and Evidence current enough for a
  fresh chat to continue without reconstructing the whole project history.

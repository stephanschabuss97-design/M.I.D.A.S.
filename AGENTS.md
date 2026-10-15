# MIDAS Agent Contract

## Product boundary

- MIDAS is Stephan's personal single-user health operating system; no silent
  generalization to SaaS or multiple users, no speculative platform abstractions.
- Favor quiet, low-friction daily use, medical context and maintainability.
  MIDAS never replaces diagnosis, treatment or physician authority.

## Binding sources

- Read [README](README.md), especially its product principles and
  [agent/product contract](README.md#hinweise-fuer-llms-und-coding-agents), then
  relevant `docs/modules/*.md` before code. Medical/R3, module roles, architecture,
  data guards and local archive/QA/changelog practice are binding there.
- Enter [BLUEPRINT](../codex-tools/docs/blueprint/README.md) directly for roadmaps
  and their Evidence/review/handoff documentation. Its authoring contract and
  three forms are the sole current process/template source, including the
  applicable review obligations also outside roadmaps. Active roadmap/Evidence
  govern execution.
- Apply [NOMOS QA](../codex-tools/apps/nomos/QA_STANDARDS.md) directly:
  `NOMOS-QA / 2026-10-15 / E01`, prospectively for new QA/runbook work and
  new applicable tasks. Running/frozen roadmaps keep their adopted basis.
  MIDAS retains all test IDs, suite ownership and the stricter explicit
  per-test field requirements in [QA](docs/qa/README.md#testfallschema), plus
  medical/R3, product, security, access and owner boundaries.
- Enter [ATLAS](../codex-tools/apps/atlas/README.md) directly for shared tool
  facts; follow BLUEPRINT's Capability Preflight and read only needed sections.
- Actual local requirements and commands belong to [backend](backend/README.md),
  [Android](android/README.md) and [QA](docs/qa/README.md); secret consumers/stores
  to the [operator map][operator], recovery to [its runbook][recovery].
  Read the affected local sources; archived DONE/LEGACY is historical evidence.

## Working rules

- Preserve unrelated dirty work; keep changes scoped, reversible and compatible
  with the binding product/module contracts. Never expose or commit secrets.
- Production SQL, Supabase changes, deploys, devices and other external writes
  require actual owner authority recorded by the current roadmap/explicit order.
- Do not commit, tag, push or publish without Stephan's explicit request.
- German UI and prose use Austrian German spelling and umlauts; identifiers
  may remain ASCII where existing contracts require it.

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

[operator]: docs/reference/supabase/MIDAS%20Supabase%20Operator%20Key%20and%20Store%20Map.md
[recovery]: docs/qa/runbooks/midas-minimal-recovery.md

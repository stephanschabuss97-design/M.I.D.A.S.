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
- Use [the local overlay](docs/DEV_ENVIRONMENT.md) for actual commands and secret
  stores; tool-dependent work follows BLUEPRINT's Capability Preflight and only
  needed ATLAS sections. Archived DONE/LEGACY files are historical evidence.

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

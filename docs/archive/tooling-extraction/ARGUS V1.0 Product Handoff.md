# A.R.G.U.S. V1.0 Product Handoff

Status: `ARGUS_V1_HANDOFF_READY / PRODUCT_NOT_STARTED`.

## 1. Purpose and authority

This handoff closes W5 of the MIDAS tooling-extraction roadmap. It transfers
only the proven pilot provenance, the owner-approved product direction and the
constraints needed to start a separate ARGUS V1.0 product roadmap.

It does not create source, runtime, installation, campaign, corpus or evidence
roots. It does not authorize implementation, a benchmark run, a consumer
cutover, deletion of pilot originals or reuse of the historical runtime.

## 2. Current source-location decision

The current planned source location is:

```text
C:\Users\steph\Projekte\codex-tools\apps\argus
```

W3T-OD-03 supersedes the earlier standalone proposal
`C:\Users\steph\Projekte\argus`. The selected `codex-tools` source monorepo
already exists, but `apps/argus` remains intentionally absent. Creating that
component requires the separate ARGUS V1.0 product roadmap and its own usage,
scope and implementation gates.

The monorepo is source-only. ARGUS keeps component-local semantics and its own
lifecycle. The repository root provides safety and navigation, not shared
workflow, scoring or runtime authority.

## 3. Bound inputs

| Input | Identity and role |
| --- | --- |
| Product pitch | `C:\Users\steph\Desktop\A.R.G.U.S. V1.0 Pitch.md`; SHA-256 `45884afea39df16c7baf8116ea1a9ff1664cb05546f0119c7ebb7b87e227ddfc`; complete design input |
| Pilot archive | `C:\Users\steph\Archives\ARGUS-PILOT\v1.2-v1.6`; payload digest `b991822dfc4976a7dca17df03e1cb16c2bd6910f1306e1f233cd600804a3fc16` |
| W4 project receipt | `docs/tooling-extraction/w4-argus-pilot-archive-receipt.json`; SHA-256 `0aeb7bc4945211eb038c350a2d487701277a92bcc77d0d5ad0249e9491c0be29` |
| Archive manifest | SHA-256 `39b2ad43fe61d1ac249e87e02b21b197d53239d0a76f50bbc404c1d14cd872fc` |
| Archive proof | SHA-256 `98c53dbb469197e0a23d781a3239978da8873af77f9c3dc5b66a9b946cadf0de` |
| Monorepo topology | `docs/tooling-extraction/codex-tools-topology-inventory.json`; W3T-OD-03 and source-only component boundary |

The pitch was previously read completely and its unchanged fingerprint was
revalidated for W5. The archive is immutable historical provenance. Neither is
self-executing authorization for product implementation.

## 4. Product boundary transferred to V1.0

A.R.G.U.S. V1.0 is Stephan's personal, local Codex workbench for reproducible
model/profile evaluation against his real roadmap, contract, implementation,
finding, evidence, resume and closure workflows.

The initial product remains:

- single-user and local;
- Codex-specific and subscription-workflow-based;
- free of OpenAI API keys and separately billed model API calls;
- one tested model at a time, with explicit reasoning profiles and replicates;
- campaign-, corpus-, scoring- and history-driven;
- automation-first for reliable local control-plane work, while unavoidable
  owner actions remain explicit;
- a consumer of a narrow KASRKIN usage envelope, never a copy of KASRKIN
  admission or Safe-Closure logic.

The product question is not a universal model ranking. It is: how reliably and
well does a concrete Codex model/profile work with Stephan's actual workflow?

## 5. Pilot inheritance contract

V1.0 starts at version 1.0, not 1.7. It may inherit only documented lessons,
invariants and failure classes from the closed-incomplete pilot.

It must not inherit or reactivate:

- MIDAS-relative runtime assumptions;
- the old distributed Stage and Evidence roots;
- copy/paste orchestration as architecture;
- the standalone historical console as a production UI;
- migration chains or frozen pilot campaign bytes as editable V1 source;
- Codex-owned sessions as ARGUS-owned data;
- any invented benchmark result, winner or model judgment.

Historical payloads remain read-only in the W4 archive. Links to them are
provenance references, not imports into the new component.

## 6. Mandatory V1.0 architecture invariants

The separate product roadmap must preserve at least these invariants:

1. A controller owns state transitions; UI surfaces are replaceable clients.
2. Campaign and scoring bundles are frozen and fingerprint-bound before runs.
3. Requested, owner-confirmed and runtime-observed state remain distinct.
4. TESTED_AGENT, ORCHESTRATOR and SCORER roles remain separated.
5. Run integrity, deterministic task performance, qualitative judgment and
   usage eligibility remain separate evidence dimensions.
6. Session binding is prepared before execution and only confirmed by later
   discovery; ambiguous attribution fails closed.
7. Raw output remains immutable and traceable through technical validation,
   scorecards, reports and history.
8. Corpus and scoring evolution are versioned; historical scores are never
   silently recalculated.
9. Small replicate sets are reported honestly without fake statistical
   precision.
10. A complete fixture-driven dry run and negative integrity fixtures work
    without invoking a real model.
11. One canonical ARGUS data root is selected before runtime writes. Source,
    installed release, mutable data, external Codex data and product evidence
    remain distinct roles.
12. No file, schema, helper, abstraction or automation exists without a named
    owner, validator or real consumer need.

## 7. Decisions deliberately deferred to the product roadmap

W5 does not decide:

- the physical ARGUS data root, retention or backup policy;
- release, installation and stable-command design;
- the first UI technology or packaging surface;
- the exact V1 corpus tasks, scoring weights or practical decision zones;
- the campaign schema and history storage format;
- the owner-action protocol for model/profile selection and chat startup;
- the exact KASRKIN interface version and project binding;
- whether any pilot lesson becomes code rather than documentation.

These require ARGUS-specific discovery, threat/privacy review, premortem,
steelman, S4R and owner decisions inside the new product roadmap.

## 8. Required separate product-roadmap sequence

The next roadmap should, at minimum:

1. revalidate the pitch, W4 archive receipt and monorepo boundary;
2. run focused ARGUS-specific discovery without rescanning unrelated projects;
3. define source/runtime/data/evidence ownership and B0 rollback before root
   creation;
4. freeze V1 campaign, corpus, scoring, history and session-binding contracts;
5. build the controller and fixture-only Golden Path before a production UI;
6. prove negative integrity fixtures and complete dry-run closure;
7. integrate the narrow KASRKIN contract without duplicating guard semantics;
8. add the minimum UI only after controller state is observable and tested;
9. perform real-model work only under a later explicit campaign authorization;
10. close documentation, installation, rollback and history as separate proof
    surfaces.

Component creation and implementation are not part of this sequence until the
new roadmap reaches and passes its own implementation gate.

## 9. B5 rollback and next gate

B5 is documentation-only. If this handoff is superseded, correct or withdraw
it additively and remove only its current navigation link. Do not change the W4
archive, its manifest, its receipt or the W3T monorepo decision as a B5
rollback.

ARGUS product-track next step: authorize and create a separate ARGUS V1.0
product roadmap. Its first block is contract/discovery work. The `apps/argus`
component remains absent until that roadmap explicitly authorizes root
creation. The current MIDAS extraction roadmap may independently continue with
W6 semantic ownership cleanup.

```text
W5_COMPLETE
ARGUS_V1_HANDOFF_READY
ARGUS_V1_PRODUCT_NOT_STARTED
ARGUS_COMPONENT_ROOT_ABSENT
PILOT_ARCHIVE_UNCHANGED
NO_BENCHMARK_RUN
NO_RUNTIME_OR_CONSUMER_CHANGE
SEPARATE_ARGUS_V1_ROADMAP_REQUIRED
```

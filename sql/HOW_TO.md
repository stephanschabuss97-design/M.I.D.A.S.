---
title: SQL How-To (Modular + Idempotent)
status: draft
---

# Purpose

Explain how SQL scripts in `sql/` are structured, how to run them safely, and how to add new module scripts in a consistent style.

# Principles

- Modular: one script per domain/module.
- Idempotent: safe to re-run without harming data.
- Non-destructive by default: no drops in master scripts.
- Breaking changes go into explicit migration/cleanup scripts.

# Script Types

1) Master scripts (module-level)
- Define tables, views, functions, triggers, policies.
- Must be idempotent.

2) Transition scripts
- One-time migrations (e.g., rename, data moves).
- Safe for production if explicitly reviewed.

3) Cleanup scripts (optional)
- Drops and teardown for a specific module.
- Never run automatically.

4) Helper scripts (optional)
- Diagnostics and data-inspection queries.

# Idempotent Patterns

- Tables: `create table if not exists`
- Columns: `alter table ... add column if not exists`
- Indexes: `create index if not exists`
- Views: `create or replace view`
- Functions: `create or replace function`
- Triggers: `drop trigger if exists` then `create trigger`
- Policies: `drop policy if exists` then `create policy`

# Safe Execution Order

1) Core schema (base tables + RLS)
2) Module scripts (vitals, intake, appointments, profile, etc.)
3) Views and RPCs
4) Explicit grants
5) Optional helpers
6) User-gated retention/Cron scripts after their deployment and owner gates

The numeric filename prefix is an inventory aid, not a guarantee that every
file belongs to one blind fresh-bootstrap sequence. In particular,
`06_Security.sql` is a historical Security Advisor patch for an existing
schema and still references the retired legacy table `public.appointments`.
Do not run it during a current fresh/disposable bootstrap. Apply only the
canonical module scripts required by the tested target schema, then grants and
explicitly owner-gated retention/Cron scripts.

# Medication Data-Hygiene Scripts

The productive Medication target contract is split by responsibility:

1) `12_Medication.sql`
- Canonical idempotent schema and RPC source for fresh/disposable environments.
- Not the productive one-time migration for an existing MIDAS database.

2) `16_Explicit_Grants.sql`
- Central explicit Data API role contract.
- Run only after all referenced objects exist.

3) `17_Medication_Retention.sql`
- Idempotently enables `pg_cron`, provisions the internal cleanup function and
  creates or updates exactly one named Medication retention job.
- Existing projects run it after the reviewed Medication transition and grants.
- Fresh/disposable environments run it after `12_Medication.sql` and grants.

4) `transition_medication_clean_start.sql`
- Destructive, one-time transition used productively on `2026-07-12`.
- Preserved as an auditable migration artifact, not a reusable maintenance
  command. Its successful rerun guard is expected to reject another execution.

For the completed existing-project cutover, the reviewed order was:

1) `transition_medication_clean_start.sql`
2) `16_Explicit_Grants.sql`
3) `17_Medication_Retention.sql`

# Push Data-Hygiene Script

`18_Push_Data_Hygiene.sql` is the canonical, user-gated Push maintenance
script. It is separate from Medication retention because both jobs have
different data, cutoffs, schedules, rollback decisions, and runtime risks.

The script:

- enables `pg_cron` if needed;
- creates the partial index for old disabled subscriptions;
- provisions the internal `SECURITY INVOKER` cleanup function;
- revokes function execution from `PUBLIC`, `anon`, `authenticated`, and
  `service_role`;
- creates or updates exactly one job named `midas-push-hygiene-weekly` for
  Sunday `03:45 UTC`;
- requires the function and job to remain owned by `postgres`;
- refuses duplicate jobs, a foreign owner, a changed job contract, or a
  concurrent cleanup run through the documented advisory lock pair
  `(1296647233, 1347769160)`;
- leaves existing Push table RLS, policies, and table grants unchanged.

Retention boundaries are intentionally different:

- Delivery rows are deleted only when `day` is strictly older than the Vienna
  calendar day `today - 90 days`. The `-90` day, today, and future rows remain.
- Subscriptions are deleted only when `disabled = true` and `updated_at` is
  strictly older than the execution timestamp minus 90 days. Active or recently
  reactivated subscriptions remain.
- Only completed run details of the current Push hygiene job older than 90 days
  are deleted. Other jobs and unfinished runs remain.

For a fresh or disposable environment, use this order after the normal core
schema:

1) `15_Push_Subscriptions.sql`
2) `16_Explicit_Grants.sql`
3) `18_Push_Data_Hygiene.sql`

For an existing productive MIDAS project:

1) Deploy and verify the reviewed `midas-incident-push` time-override guard.
2) Perform the read-only deletion-count, active-subscription, Cron, owner, ACL,
   and advisor preflight.
3) Explain the expected DDL, job, and future deletion effects to the owner.
4) Run `18_Push_Data_Hygiene.sql` only after explicit owner approval.
5) Verify function, index, ACL, exact job contract, and active subscriptions.
6) Run the first cleanup manually only after a separate explicit approval.

Do not add this file to automatic app bootstrap. Re-running it is designed to
converge on the same named job, but a conflicting owner or duplicate job is an
intentional hard stop. The script does not attempt to reassign a foreign job
through `cron.alter_job`.

Disabling the named job stops future automatic cleanup. It does not restore
rows already deleted; those require a prior export or database backup.

## Report Lifecycle Scripts

The report singleton contract is split into a non-destructive target-state
script and a separately approved existing-project transition:

### `19_Report_Lifecycle.sql`

- Creates or verifies the partial unique index that permits at most one
  `range_report` for the authenticated MIDAS owner. `user_id` remains the
  technical Auth/RLS ownership boundary of the single-user product.
- Does not delete or update data.
- Fails closed when duplicate range reports exist or a same-name index has a
  different key or predicate.
- May be used after `public.health_events` exists in fresh or disposable
  environments and is safe to rerun against the expected schema.

### `transition_report_lifecycle_singleton.sql`

- PSQL-only, destructive, one-time transition for an existing MIDAS project.
- Deletes all `monthly_report` rows and every invalid or non-canonical
  `range_report`, then creates the reviewed singleton index in the same
  transaction.
- Requires six runtime variables from a fresh, owner-approved recovery
  snapshot. Productive IDs, counts, and hashes must never be committed to the
  repository.
- Uses UTC as the explicit session timezone for the shared
  `jsonb_build_object` fingerprint contract; the read-only snapshot query must
  use the same serialization contract.
- Acquires a short `SHARE ROW EXCLUSIVE` lock and aborts on inventory drift,
  unexpected canonical IDs, delete-count drift, lock timeout, or index drift.
- Must not run in the Supabase SQL editor, automatic bootstrap, or an ordinary
  deployment.

The productive order is owner-gated and belongs to the report-lifecycle
cutover:

1. Complete local tests and productive read-only inventory.
1. Create and verify the current recovery bundle and report extract.
1. Disable the remote monthly workflow and exclude active runs.
1. Deploy and smoke-test the range-only Edge Function without a write.
1. Revalidate the approved inventory.
1. Run `transition_report_lifecycle_singleton.sql` through PSQL with
   `ON_ERROR_STOP=1` and the approved runtime variables.
1. Verify RLS, ACL, non-report fingerprints, report counts, and the exact index
   definition before any product write.

The disposable regression fixture is
`sql/tests/19_Report_Lifecycle_fixture.sql`. It intentionally recreates
`public.health_events`; run it only against an isolated PostgreSQL 17 database
or container.

# Retention and Cron Rules

- Prefer database-internal retention when cleanup depends only on PostgreSQL
  data and must remain independent of app logins or external CI availability.
- Provision extensions, functions and named jobs idempotently.
- Keep maintenance functions internal and revoke Execute from application
  roles unless an explicit product API requires access.
- Use one stable job name and verify owner, database, schedule, command and
  active state after provisioning.
- Do not write directly to `cron.job`; use the supported `cron.schedule` and
  `cron.alter_job` functions.
- Bound `cron.job_run_details` growth without deleting active or recent runs.
- Productive Cron activation and destructive transitions remain explicitly
  user-gated even when their SQL files are idempotent.

# Explicit Data API Grants

Supabase Data API access must be explicit for MIDAS `public` objects. Do not
rely on platform default grants.

## Grant Placement

Choose one of these patterns for every new Data-API-relevant object:

1) Define grants in the module SQL directly, if the module SQL is the active
   provisioning source for that object.
2) Add the grants to `sql/16_Explicit_Grants.sql`, if the object already exists
   or the change is a catch-up/provisioning update.

`sql/16_Explicit_Grants.sql` is not a standalone schema bootstrap. Run it only
after the referenced tables, views, and RPC functions exist.

## Required Order Per Object

1) Create or alter the table/view/function.
2) Enable RLS on user-owned tables.
3) Create or replace RLS policies.
4) Revoke old broad grants from `anon`, `public`, `authenticated`, and
   `service_role` when the goal is a cleaned target contract.
5) Grant only the explicit target rights.

## Role Contract

- `anon`: no table grants, no view grants, no `upsert_intake` execute grant.
- `authenticated`: user-facing Data API rights, always backed by RLS or
  security-invoker semantics.
- `service_role`: Edge Function, scheduler, report, and admin-path rights.
- Avoid `grant all`.
- Avoid `grant ... on all tables/functions in schema public`.
- Grant tables, views, and RPC functions object by object.

## Table, View, and RPC Checklist

For every new `create table` in `public`:

- Decide `authenticated` rights explicitly.
- Decide `service_role` rights explicitly.
- Confirm RLS and policies exist before user-facing grants.
- Document if no user-facing grant is intended.

For every new view:

- Prefer `security_invoker = on` for user-facing views.
- Grant `select` only to the roles that need the view.
- Do not grant views to `anon` unless a reviewed unauthenticated flow exists.

For every Data-API RPC:

- Add `grant execute` for every intended role.
- Revoke `anon`/`public` first unless an unauthenticated flow is explicitly
  reviewed.
- If the RPC is `security invoker`, verify the caller also has the required
  base table or view grants.

## Security Advisor Interpretation

- `pg_graphql_anon_table_exposed` is blocking for private MIDAS objects and
  must be closed unless an unauthenticated object is explicitly reviewed.
- `pg_graphql_authenticated_table_exposed` is not automatically a defect for
  MIDAS. Authenticated Data API paths are expected when RLS and policies are
  the row-level safety boundary.
- Do not silence authenticated warnings by revoking `authenticated` access from
  objects that the PWA, Android shell, Edge Functions, Realtime refresh, or
  reports still use.
- GraphQL is currently not a MIDAS application dependency. If GraphQL warnings
  create dashboard noise, handle GraphQL disablement or lint muting as a
  separate Supabase hygiene task.

# Activity V2 R2 Database Foundation

`20_Activity_V2.sql` is the canonical additive Activity V2 R2 schema source.
It provisions the immutable catalog projection, three normalized history
tables, RLS, constraints/indexes, the atomic retry-idempotent commit RPC and
the owner-bound `public.activity_v2_last_performance(text)` lookup RPC. It does
not wire UI consumers, migrate Activity V1, create a draft, or insert a
productive session.

Run order for the R2-only foundation:

1) Ensure the existing objects required by `16_Explicit_Grants.sql` exist.
2) Run `20_Activity_V2.sql` as the expected `postgres` owner.
3) Run `16_Explicit_Grants.sql` immediately afterwards.
4) Verify four RLS-enabled tables, five valid indexes, four SELECT policies,
   two exact RPC overloads and 78 active catalog-v1 rows.
5) Verify no direct table DML for `authenticated` or `service_role`, no access
   for `anon`/`PUBLIC`, and Execute only for permanent `authenticated` users.

The commit RPC is intentionally `SECURITY DEFINER`, owned by `postgres`, with
an empty `search_path` and explicit permanent-user/owner validation. This is
the sole Activity V2 write boundary. Do not replace it with browser table DML
or broaden grants to silence an advisor warning.
`public.activity_v2_last_performance(text)` remains `SECURITY INVOKER`, stable
and owner-scoped.

The disposable regression fixture is
`sql/tests/20_Activity_V2_fixture.sql`. It requires PostgreSQL 17,
`session_user = postgres` and a database owned by `postgres`; its guard must
fail before mutation in any other target. It tests exact reruns, rollback,
idempotency/races, RLS/ACL, time boundaries and lookup, then removes only its
guarded disposable database.

# Activity V2 C2 Catalog Version 2

`21_Activity_V2_Catalog_V2.sql` is the canonical insert-only projection of the
complete immutable Activity V2 catalog-version-2 snapshot. It does not alter
schema, constraints, indexes, RLS, policies, grants, ACLs or RPCs, and it never
updates or deletes catalog version 1.

Fresh/disposable provisioning order for the complete R2+C2 target:

1) Run `20_Activity_V2.sql` against a fresh target to create the R2 foundation
   and exact 78-row catalog version 1.
2) Run `21_Activity_V2_Catalog_V2.sql` to add the exact 80-row catalog version
   2 snapshot.
3) Run `16_Explicit_Grants.sql` to apply the reviewed final grant boundary.
4) Verify v1=78, v2=80, no other catalog versions, four RLS-enabled tables,
   four expected SELECT policies, two exact RPCs and the minimal ACL boundary.
5) Verify that no Activity-V2 session item references v2 unless a later,
   separately approved product flow has created real sessions.

Never rerun `20_Activity_V2.sql` productively merely to install C2. Productive
C2 execution uses only reviewed SQL 21 after a read-only preflight and explicit
Owner approval.

SQL 21 holds one short transaction with local timeouts and a table lock. Before
its first persistent write it requires catalog v1 to be fully contract-equal
and catalog v2 to be either empty or already fully contract-equal. A 79-row
partial state or any 80-row content drift fails closed. An exact rerun inserts
nothing and changes nothing; the postcondition repeats the full bidirectional
set comparison before commit.

The guarded disposable C2 fixture is
`sql/tests/21_Activity_V2_Catalog_V2_fixture.sql`. It reuses the approved R2
fixture scaffold and tests fresh `20 -> 21 -> 16`, exact SQL-21 rerun,
partial/content drift failure, v2 commit and cross-version lookup. It may run
only against `midas_activity_v2_s45` on PostgreSQL 17 as `postgres` with a
`postgres`-owned database.

The 2026-08-01 productive C2 postcondition is v1=78 and v2=80, both fully
repo-contract-equal, with other versions=0 and v2 session references=0. The R2
table/RLS/policy/RPC/ACL boundary remained unchanged. See the archived C2
Evidence for the exact gate results; never copy credentials or raw database
output into this HOW-TO.

# Activity V2 R8 Commit Compatibility

`22_Activity_V2_Commit_Compatibility.sql` replaces only
`public.activity_v2_commit_session(uuid,jsonb)`. New requests validate every
used item against the payload's existing `catalog_version`; they do not require
that version to be the highest catalog version. An identical replay is still
resolved by `request_id` plus canonical payload fingerprint before catalog
availability or active-status checks.

The file is PostgreSQL-17-bound and fails closed unless all of these conditions
hold before its first persistent statement:

- the commit RPC has exactly one overload and its `pg_get_functiondef`
  SHA-256 is either canonical R2
  `2241cea9a5453a38d074abc88aebe8edb6f7e5c0226d063423daef0b1411418e`
  or the exact R8 rerun
  `7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e`;
- both Activity V2 RPCs retain their reviewed owner, volatility, security,
  empty-search-path and exact Execute ACL;
- the four Activity V2 tables match the canonical structural/RLS/policy
  fingerprint and retain only the reviewed SELECT grants;
- catalog v1 and v2 remain the exact immutable 78-row and 80-row snapshots.

The same transaction snapshots all catalog versions, the protected table
structure/ACLs, the `public.activity_v2_last_performance(text)` source and
Activity V2 row counts. Its
postcondition proves that only the commit RPC plus its already-reviewed
hardening changed. SQL 22 revokes Execute from `PUBLIC`, `anon`,
`authenticated` and `service_role`, then grants Execute back only to
`authenticated`. Do not rerun `16_Explicit_Grants.sql` for this change.

`22_Activity_V2_Commit_Compatibility_Rollback.sql` is a separate manual
action. It accepts only the exact R8 source, restores the exact R2 function
source, and reasserts the same owner/search-path/ACL boundary. It is not an
automatic failure handler and intentionally rejects a second rollback run.
After a rollback, the forward SQL accepts the restored exact R2 preimage.

Before any productive execution:

1) repeat the read-only PostgreSQL version, overload, source-hash,
   owner/search-path/ACL, structure/RLS/policy and catalog-v1/v2 preflight;
2) compare the reviewed SQL-file hash with the approved intent;
3) obtain the separate productive Owner approval;
4) run only the forward SQL and stop on any guard failure;
5) repeat all read-only postconditions and the Security Advisor;
6) never create a synthetic productive Activity V2 session.

Rollback requires its own fresh read-only preflight, incident decision and
Owner approval. Never use it merely because the forward outcome is unknown;
first establish the actual function source hash.

The guarded disposable regression fixture is
`sql/tests/22_Activity_V2_Commit_Compatibility_fixture.sql`. It may run only
inside the local PostgreSQL-17 database `midas_activity_v2_s45`, owned by and
connected as `postgres`. It rebuilds the R2+C2 scaffold, exercises exact
forward/rerun/rollback, source/overload/hardening/ACL/RLS/catalog drift,
v1/v2/new-highest commits, missing-item and policy rejection, replay,
response-loss equivalence, two-connection races and direct-DML isolation. It
finishes with catalog v1/v2 unchanged and zero session/item/set rows.

## Activity V2 R8 Productive Execution Record

The owner-approved productive SQL-22 execution completed on 2026-08-11 from
`15:51:09Z` through `15:51:11Z` with `ON_ERROR_STOP` behavior and exit code 0.
The reviewed forward file SHA-256 was
`429520e59295939c7f9279a2a694c6f9d7b4770d4bb9106bf8b7d2cb35b3d0e3`.

The immediate read-only preflight and postconditions proved:

- commit RPC source changed only from canonical R2
  `2241cea9a5453a38d074abc88aebe8edb6f7e5c0226d063423daef0b1411418e`
  to canonical R8
  `7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e`;
- catalog counts remained v1=78, v2=80 and other=0;
- Activity V2 session, item and set counts remained 0/0/0;
- function overload count, owner, volatility, security, empty search path,
  Execute ACL, table structure, RLS and policies remained contract-equal;
- no synthetic training session, Activity V1 write, web/edge/APK deploy or
  product cutover occurred.

This record authorizes no rerun and no rollback. A future rollback still needs
its own current read-only preflight, incident decision and explicit owner gate.

# Activity V2 R9 History Lifecycle

`23_Activity_V2_History_Lifecycle.sql` is the additive R9 source for bounded
session history, snapshot detail, atomic full-replacement correction and
CAS-protected hard delete. It adds only
`public.health_activity_sessions.revision bigint`, one pure canonical-content
helper in the non-exposed `midas_private` schema and four exact public RPCs.
It does not change the R8 sources of
`public.activity_v2_commit_session(uuid,jsonb)` (SHA-256
`7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e`)
or `public.activity_v2_last_performance(text)` (SHA-256
`36958865e48db7f6ca13a7ad36d0d8751f53729c5d40c762654ab2baa73d296e`),
request identity, catalog, RLS policies, product load or Activity V1.

The complete fresh/disposable R9 target order is exactly:

1) `20_Activity_V2.sql`;
2) `21_Activity_V2_Catalog_V2.sql`;
3) `22_Activity_V2_Commit_Compatibility.sql`;
4) `23_Activity_V2_History_Lifecycle.sql`;
5) `16_Explicit_Grants.sql`.

Do not run SQL 20, 21 or 22 again after SQL 23. Their older canonical guards
do not accept the additive R9 revision. SQL 16 is R8-compatible when every R9
object is absent, mirrors the full R9 grants when every R9 object exists, and
fails closed on a partial R9 state.

SQL 23 accepts only the exact R8 postimage or its own exact rerun. The
PostgreSQL-17 `pg_get_functiondef` SHA-256 values of the R9 functions are:

- private canonical helper:
  `7fe25b2b010faf95615907d700091579565b39088adcd44d0bd0484333f30f5e`;
- list:
  `aeca949ea42b53ec3b7ead67668be4b3c6b70553d538068c01f93157ad0de8ed`;
- detail:
  `53938011daac6fe80e68a9c3464604b69f396a4d5f5ff4d274cfbcca925cbb11`;
- replace:
  `feb73a16ccc2680f8ddb368ffbabd1c4cb41320838af9d6040b6c6d2a7cf1f7f`;
- delete:
  `97474cc440ca538abd0fa6f444bb2bb69fd801f2080c28e5d81599484477f54b`.

`midas_private` must not be present in the PostgREST/Supabase exposed-schema
configuration. Only `authenticated` receives schema `USAGE` and helper
`EXECUTE`, solely for the invoker-bound detail RPC. `PUBLIC`, `anon` and
`service_role` receive neither. The four public R9 RPCs grant Execute only to
`authenticated`; direct browser-role Activity-V2 DML remains revoked.

The guarded disposable regression fixture is
`sql/tests/23_Activity_V2_History_Lifecycle_fixture.sql`. It may run only in
the PostgreSQL-17 database `midas_activity_v2_s45`, owned by and connected as
`postgres`. It rebuilds the complete R8 postimage, proves fresh/rerun/drift/
rollback/forward behavior, revision and original-catalog derivation, bounded
reads, exact replay, dual-CAS correction, snapshot preservation, exhaustion,
atomic rollback, all Edit/Edit/Edit/Delete/Delete/Delete lock orders, FK
cascade, permanent auth, owner isolation, overload/ACL/search-path security
and final zero-row cleanup.

## Productive R9 execution record (2026-08-13)

After the coupled R9 S4.10/S5 owner gate and a canonical read-only preflight,
`23_Activity_V2_History_Lifecycle.sql` was executed exactly once on Supabase
project `jlylmservssinsavlkdi` using the linked Management API connection as
PostgreSQL role `postgres`. The executed file SHA-256 was
`b8180409e2199477177d4cb6fe21604467bc8da37fce73342db49c511cf01bc4`.

The productive preflight and read-only postcheck established:

- PostgreSQL 17.6 and canonical R8 structure SHA-256
  `657f31c14b1a17e17241b1cd9aaa4c69a0622321c1f5e6e13927df4ebb23ee14`;
- catalog v1/v2/other counts 78/80/0 with the exact reviewed content hashes;
- Activity V2 session/item/set counts 0/0/0 before and after execution;
- `revision bigint not null default 1` with its bounded check, exactly four
  public R9 RPC overloads and exactly one private canonical helper;
- all five R9 function source hashes, owner/security/volatility/search-path
  settings and minimal ACLs equal the reviewed disposable postimage;
- R8 `public.activity_v2_commit_session(uuid,jsonb)` and
  `public.activity_v2_last_performance(text)` source hashes stayed unchanged;
- no browser-role direct DML, anonymous table access or unexpected grant;
- a real Data API request for schema `midas_private` returned HTTP 406 with
  `PGRST106`; the exposed schemas were only `public, graphql_public`;
- no synthetic training session, correction, delete, product load,
  web/edge/APK deploy or commit occurred.

This record authorizes no SQL 23 rerun and no rollback. The R9 client remains
isolated until R12. Product activation, every real correction/delete and S6
remain separate owner gates.

## Activity V2 R9 Rollback Boundary

`23_Activity_V2_History_Lifecycle_Rollback.sql` is only a deployment rollback
before the first real R9 correction or deletion. It cannot restore a deleted
session. `revision = 1` is not sufficient evidence because replay leaves no
revision change and hard delete leaves no audit row. In addition to its
technical preflight, rollback therefore requires a separately documented,
owner-approved operative non-use confirmation and this same-session setting:

```sql
select pg_catalog.set_config(
  'midas.activity_v2_r9_operational_nonuse_confirmed',
  'true',
  false
);
```

The setting does not itself authorize rollback. Productive SQL 23, every
productive rollback and every real Activity-V2 correction/delete remain
separate Owner gates. Never create a synthetic productive session.

# Adding a New Module Script

1) Create `sql/NN_Module_Name.sql` (or a final master script once the refactor is done).
2) Use the idempotent patterns above.
3) Add a short header with intent and dependencies.
4) Include only objects for that module.
5) Add or update explicit grants for every new table, view, and Data-API RPC.
6) Update module overviews to mention the new tables/views/RPCs.

# Notes

- Master scripts must never drop or truncate existing data.
- Use transition scripts for any destructive or breaking change.
- Productive SQL execution stays user-gated.

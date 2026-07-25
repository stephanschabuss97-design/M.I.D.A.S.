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

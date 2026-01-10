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
4) Optional helpers

# Adding a New Module Script

1) Create `sql/NN_Module_Name.sql` (or a final master script once the refactor is done).
2) Use the idempotent patterns above.
3) Add a short header with intent and dependencies.
4) Include only objects for that module.
5) Update module overviews to mention the new tables/views/RPCs.

# Notes

- Master scripts must never drop or truncate existing data.
- Use transition scripts for any destructive or breaking change.

-- ============================================
-- 14_Trendpilot.sql
-- PostgreSQL 15 | Supabase-kompatibel
-- Ziel: Trendpilot-Events (info/warning/critical) als eigene Tabelle + RLS + Indizes
-- Abhaengigkeiten: public.auth (Supabase), pgcrypto Extension in Core-Schema
-- ============================================

create table if not exists public.trendpilot_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid(),
  ts          timestamptz not null default now(),
  type        text not null check (type in ('bp','body','lab','combined')),
  severity    text not null check (severity in ('info','warning','critical')),
  ack         boolean not null default false,
  ack_at      timestamptz null,
  source      text null,
  window_from date not null,
  window_to   date not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  constraint chk_trendpilot_window_range check (window_to >= window_from),
  constraint chk_trendpilot_ack_at check (
    (ack = true and ack_at is not null) or
    (ack = false and ack_at is null)
  )
);

alter table public.trendpilot_events enable row level security;

drop policy if exists "trendpilot_select_own" on public.trendpilot_events;
create policy "trendpilot_select_own"
  on public.trendpilot_events for select
  using (user_id = auth.uid());

drop policy if exists "trendpilot_insert_own" on public.trendpilot_events;
create policy "trendpilot_insert_own"
  on public.trendpilot_events for insert
  with check (user_id = auth.uid());

drop policy if exists "trendpilot_update_own" on public.trendpilot_events;
create policy "trendpilot_update_own"
  on public.trendpilot_events for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "trendpilot_delete_own" on public.trendpilot_events;
create policy "trendpilot_delete_own"
  on public.trendpilot_events for delete
  using (user_id = auth.uid());

create index if not exists idx_trendpilot_user_ts
  on public.trendpilot_events (user_id, ts);

create index if not exists idx_trendpilot_user_type_severity
  on public.trendpilot_events (user_id, type, severity);

create index if not exists idx_trendpilot_user_type_window
  on public.trendpilot_events (user_id, type, window_from, window_to);

drop index if exists uq_trendpilot_dedup;
create unique index uq_trendpilot_dedup
  on public.trendpilot_events (user_id, type, window_from, severity);

drop view if exists public.trendpilot_events_range;
create or replace view public.trendpilot_events_range
  with (security_invoker = on)
as
select
  id,
  user_id,
  ts,
  type,
  severity,
  ack,
  ack_at,
  source,
  window_from,
  window_to,
  payload,
  created_at
from public.trendpilot_events
where severity in ('info','warning','critical')
order by window_from desc, ts desc;

create table if not exists public.trendpilot_state (
  user_id       uuid not null default auth.uid(),
  type          text not null check (type in ('bp','body','lab')),
  baseline_from date not null,
  baseline_sys  numeric null,
  baseline_dia  numeric null,
  sample_weeks  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, type)
);

alter table public.trendpilot_state enable row level security;

drop policy if exists "trendpilot_state_select_own" on public.trendpilot_state;
create policy "trendpilot_state_select_own"
  on public.trendpilot_state for select
  using (user_id = auth.uid());

drop policy if exists "trendpilot_state_insert_own" on public.trendpilot_state;
create policy "trendpilot_state_insert_own"
  on public.trendpilot_state for insert
  with check (user_id = auth.uid());

drop policy if exists "trendpilot_state_update_own" on public.trendpilot_state;
create policy "trendpilot_state_update_own"
  on public.trendpilot_state for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "trendpilot_state_delete_own" on public.trendpilot_state;
create policy "trendpilot_state_delete_own"
  on public.trendpilot_state for delete
  using (user_id = auth.uid());

create index if not exists idx_trendpilot_state_user_type
  on public.trendpilot_state (user_id, type);

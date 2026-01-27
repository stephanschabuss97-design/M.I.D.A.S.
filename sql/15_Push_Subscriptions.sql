-- ============================================
-- 15_Push_Subscriptions.sql
-- Web Push Subscriptions (Remote Push)
-- ============================================

begin;

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  endpoint     text not null check (length(btrim(endpoint)) > 0),
  p256dh       text,
  auth         text,
  subscription jsonb,
  disabled     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index if not exists idx_push_subscriptions_user_endpoint
  on public.push_subscriptions(user_id, endpoint);

create index if not exists idx_push_subscriptions_user
  on public.push_subscriptions(user_id);

create or replace function public.set_push_subscriptions_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_push_subscriptions_updated_at on public.push_subscriptions;

create trigger set_push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute function public.set_push_subscriptions_updated_at();

alter table public.push_subscriptions enable row level security;

drop policy if exists push_subscriptions_select on public.push_subscriptions;
create policy push_subscriptions_select
  on public.push_subscriptions for select
  using ((select auth.uid()) = user_id);

drop policy if exists push_subscriptions_insert on public.push_subscriptions;
create policy push_subscriptions_insert
  on public.push_subscriptions for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists push_subscriptions_update on public.push_subscriptions;
create policy push_subscriptions_update
  on public.push_subscriptions for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists push_subscriptions_delete on public.push_subscriptions;
create policy push_subscriptions_delete
  on public.push_subscriptions for delete
  using ((select auth.uid()) = user_id);

comment on table public.push_subscriptions is
  'Web Push subscriptions je Nutzer (endpoint + keys).';

commit;

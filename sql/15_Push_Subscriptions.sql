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

alter table public.push_subscriptions
  add column if not exists last_remote_attempt_at timestamptz;

alter table public.push_subscriptions
  add column if not exists last_remote_success_at timestamptz;

alter table public.push_subscriptions
  add column if not exists last_remote_failure_at timestamptz;

alter table public.push_subscriptions
  add column if not exists last_remote_failure_reason text;

alter table public.push_subscriptions
  add column if not exists consecutive_remote_failures int not null default 0;

alter table public.push_subscriptions
  drop constraint if exists chk_push_subscriptions_consecutive_remote_failures;

alter table public.push_subscriptions
  add constraint chk_push_subscriptions_consecutive_remote_failures
    check (consecutive_remote_failures >= 0);

create unique index if not exists idx_push_subscriptions_user_endpoint
  on public.push_subscriptions(user_id, endpoint);

create index if not exists idx_push_subscriptions_user
  on public.push_subscriptions(user_id);

create index if not exists idx_push_subscriptions_user_remote_health
  on public.push_subscriptions(user_id, disabled, last_remote_success_at, last_remote_failure_at);

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

comment on column public.push_subscriptions.last_remote_attempt_at is
  'Zeitpunkt des letzten Remote-Push-Versuchs fuer diese Subscription.';

comment on column public.push_subscriptions.last_remote_success_at is
  'Zeitpunkt der letzten erfolgreichen Remote-Zustellung fuer diese Subscription.';

comment on column public.push_subscriptions.last_remote_failure_at is
  'Zeitpunkt des letzten fehlgeschlagenen Remote-Push-Versuchs fuer diese Subscription.';

comment on column public.push_subscriptions.last_remote_failure_reason is
  'Letzte bekannte Fehlerursache fuer einen fehlgeschlagenen Remote-Push auf dieser Subscription.';

comment on column public.push_subscriptions.consecutive_remote_failures is
  'Zaehlt aufeinanderfolgende Remote-Push-Fehlschlaege pro Subscription und dient als lokaler Health-Hinweis.';

create table if not exists public.push_notification_deliveries (
  id                           uuid primary key default gen_random_uuid(),
  user_id                      uuid not null references auth.users(id) on delete cascade,
  day                          date not null,
  type                         text not null check (length(btrim(type)) > 0),
  severity                     text not null,
  source                       text not null default 'remote',
  tag                          text not null check (length(btrim(tag)) > 0),
  trigger                      text not null default 'scheduler',
  delivered_subscription_count int not null default 0,
  sent_at                      timestamptz not null default now(),
  created_at                   timestamptz not null default now()
);

alter table public.push_notification_deliveries
  drop constraint if exists chk_push_notification_deliveries_severity;

alter table public.push_notification_deliveries
  add constraint chk_push_notification_deliveries_severity
    check (severity in ('reminder', 'incident'));

alter table public.push_notification_deliveries
  drop constraint if exists chk_push_notification_deliveries_source;

alter table public.push_notification_deliveries
  add constraint chk_push_notification_deliveries_source
    check (source in ('remote'));

alter table public.push_notification_deliveries
  drop constraint if exists chk_push_notification_deliveries_trigger;

alter table public.push_notification_deliveries
  add constraint chk_push_notification_deliveries_trigger
    check (trigger in ('scheduler', 'manual'));

alter table public.push_notification_deliveries
  drop constraint if exists chk_push_notification_deliveries_sub_count;

alter table public.push_notification_deliveries
  add constraint chk_push_notification_deliveries_sub_count
    check (delivered_subscription_count >= 0);

create unique index if not exists uq_push_notification_deliveries_event
  on public.push_notification_deliveries (user_id, day, type, severity, source);

create index if not exists idx_push_notification_deliveries_user_sent
  on public.push_notification_deliveries (user_id, sent_at desc);

create index if not exists idx_push_notification_deliveries_day_type
  on public.push_notification_deliveries (day, type, severity, source);

alter table public.push_notification_deliveries enable row level security;

drop policy if exists push_notification_deliveries_select on public.push_notification_deliveries;
create policy push_notification_deliveries_select
  on public.push_notification_deliveries for select
  using ((select auth.uid()) = user_id);

comment on table public.push_notification_deliveries is
  'Persistiert erfolgreich ausgelieferte Remote-Push-Ereignisse je Nutzer/Tag/Typ/Severity als Dedupe- und Delivery-State.';

comment on column public.push_notification_deliveries.delivered_subscription_count is
  'Anzahl aktiver Subscriptions, die fuer dieses Remote-Push-Ereignis erfolgreich beliefert wurden.';

commit;

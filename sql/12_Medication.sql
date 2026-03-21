-- ============================================
-- 12_Medication.sql
-- Medication module tables + triggers + RLS policies
-- ============================================

begin;

-- ---------------------------------------------------------------------------
-- health_medications: Masterdaten je Nutzer
-- ---------------------------------------------------------------------------
create table if not exists public.health_medications (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default auth.uid(),
  name                 text not null check (length(btrim(name)) > 0),
  ingredient           text,
  strength             text,
  leaflet_url          text,
  dose_per_day         int  not null default 1  check (dose_per_day between 1 and 96),
  with_meal            boolean not null default false,
  stock_count          int  not null default 0,
  low_stock_days       int  not null default 7  check (low_stock_days between 0 and 365),
  active               boolean not null default true,
  low_stock_ack_day    date,
  low_stock_ack_stock  int,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.health_medications
  drop constraint if exists chk_medications_ack_pair;

alter table public.health_medications
  add constraint chk_medications_ack_pair
    check (
      (low_stock_ack_day is null and low_stock_ack_stock is null)
      or (low_stock_ack_day is not null and low_stock_ack_stock is not null)
    );

alter table public.health_medications
  add column if not exists with_meal boolean not null default false;

comment on table public.health_medications is
  'CRUD-Basis fuer Medikamente je Nutzer mit Lagerbestand, Legacy-Dosierung und Low-Stock-Metadaten.';

comment on column public.health_medications.dose_per_day is
  'Legacy-Uebergangsfeld des alten Single-Dose-Modells; nicht mehr die Source of Truth fuer Multi-Dose-Plaene.';

comment on column public.health_medications.with_meal is
  'Optionaler Hinweis fuer Daily UI und TAB-Editor: Medication idealerweise mit Mahlzeit einnehmen.';

drop trigger if exists set_health_medications_updated_at on public.health_medications;
create trigger set_health_medications_updated_at
  before update on public.health_medications
  for each row execute function public.set_current_timestamp_updated_at();

create index if not exists idx_health_medications_user
  on public.health_medications (user_id, active);

drop index if exists public.idx_health_medications_low_stock;

create index if not exists idx_health_medications_stock
  on public.health_medications (user_id, active, stock_count);

alter table public.health_medications enable row level security;

drop policy if exists medications_select_own on public.health_medications;
create policy medications_select_own
  on public.health_medications for select
  using ((select auth.uid()) = user_id);

drop policy if exists medications_insert_own on public.health_medications;
create policy medications_insert_own
  on public.health_medications for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists medications_update_own on public.health_medications;
create policy medications_update_own
  on public.health_medications for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists medications_delete_own on public.health_medications;
create policy medications_delete_own
  on public.health_medications for delete
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- health_medication_schedule_slots: geplanter Tagesplan je Medication
-- ---------------------------------------------------------------------------
create table if not exists public.health_medication_schedule_slots (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid(),
  med_id       uuid not null references public.health_medications(id) on delete cascade,
  label        text,
  sort_order   int  not null check (sort_order >= 0),
  qty_per_slot int  not null check (qty_per_slot > 0 and qty_per_slot <= 24),
  start_date   date not null default ((now() at time zone 'Europe/Vienna')::date),
  end_date     date,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint chk_medication_schedule_slot_dates
    check (end_date is null or start_date <= end_date)
);

create unique index if not exists uq_medication_schedule_slot_id_med
  on public.health_medication_schedule_slots (id, med_id);

comment on table public.health_medication_schedule_slots is
  'Geplante taegliche Einnahme-Slots je Medication. V1 ist count-/order-based und nicht uhrzeitpflichtig.';

drop trigger if exists set_health_medication_schedule_slots_updated_at on public.health_medication_schedule_slots;
create trigger set_health_medication_schedule_slots_updated_at
  before update on public.health_medication_schedule_slots
  for each row execute function public.set_current_timestamp_updated_at();

create unique index if not exists uq_medication_schedule_slot_order
  on public.health_medication_schedule_slots (user_id, med_id, start_date, sort_order);

create index if not exists idx_medication_schedule_slots_med_active
  on public.health_medication_schedule_slots (med_id, active, start_date, end_date);

alter table public.health_medication_schedule_slots enable row level security;

drop policy if exists medication_schedule_slots_select_own on public.health_medication_schedule_slots;
create policy medication_schedule_slots_select_own
  on public.health_medication_schedule_slots for select
  using ((select auth.uid()) = user_id);

drop policy if exists medication_schedule_slots_insert_own on public.health_medication_schedule_slots;
create policy medication_schedule_slots_insert_own
  on public.health_medication_schedule_slots for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists medication_schedule_slots_update_own on public.health_medication_schedule_slots;
create policy medication_schedule_slots_update_own
  on public.health_medication_schedule_slots for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists medication_schedule_slots_delete_own on public.health_medication_schedule_slots;
create policy medication_schedule_slots_delete_own
  on public.health_medication_schedule_slots for delete
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- health_medication_slot_events: bestaetigte Slot-Events je Tag
-- ---------------------------------------------------------------------------
create table if not exists public.health_medication_slot_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid(),
  med_id     uuid not null references public.health_medications(id) on delete cascade,
  slot_id    uuid not null references public.health_medication_schedule_slots(id) on delete cascade,
  day        date not null,
  qty        int  not null check (qty > 0 and qty <= 24),
  taken_at   timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.health_medication_slot_events
  drop constraint if exists fk_medication_slot_events_slot_med;

alter table public.health_medication_slot_events
  add constraint fk_medication_slot_events_slot_med
    foreign key (slot_id, med_id)
    references public.health_medication_schedule_slots (id, med_id)
    on delete cascade;

comment on table public.health_medication_slot_events is
  'Bestaetigte Slot-Events je Medication/Slot/Tag im Multi-Dose-Modell.';

create unique index if not exists uq_medication_slot_event_per_day
  on public.health_medication_slot_events (user_id, slot_id, day);

create index if not exists idx_medication_slot_events_med_day
  on public.health_medication_slot_events (med_id, day);

create index if not exists idx_medication_slot_events_slot_day
  on public.health_medication_slot_events (slot_id, day);

alter table public.health_medication_slot_events enable row level security;

drop policy if exists medication_slot_events_select_own on public.health_medication_slot_events;
create policy medication_slot_events_select_own
  on public.health_medication_slot_events for select
  using ((select auth.uid()) = user_id);

drop policy if exists medication_slot_events_insert_own on public.health_medication_slot_events;
create policy medication_slot_events_insert_own
  on public.health_medication_slot_events for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists medication_slot_events_update_own on public.health_medication_slot_events;
create policy medication_slot_events_update_own
  on public.health_medication_slot_events for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists medication_slot_events_delete_own on public.health_medication_slot_events;
create policy medication_slot_events_delete_own
  on public.health_medication_slot_events for delete
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- health_medication_doses: Einnahmenachweise je Tag (max 1 pro Med/Tag)
-- ---------------------------------------------------------------------------
create table if not exists public.health_medication_doses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid(),
  med_id     uuid not null references public.health_medications(id) on delete cascade,
  day        date not null,
  qty        int  not null default 1 check (qty > 0 and qty <= 24),
  taken_at   timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.health_medication_doses is
  'Legacy-Tagesprotokoll des alten Single-Dose-Modells; bleibt waehrend des Umbaus nur noch als Uebergangsbestand bestehen.';

create unique index if not exists uq_medication_dose_per_day
  on public.health_medication_doses (user_id, med_id, day);

create index if not exists idx_medication_doses_med_day
  on public.health_medication_doses (med_id, day);

alter table public.health_medication_doses enable row level security;

drop policy if exists medication_doses_select_own on public.health_medication_doses;
create policy medication_doses_select_own
  on public.health_medication_doses for select
  using ((select auth.uid()) = user_id);

drop policy if exists medication_doses_insert_own on public.health_medication_doses;
create policy medication_doses_insert_own
  on public.health_medication_doses for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists medication_doses_update_own on public.health_medication_doses;
create policy medication_doses_update_own
  on public.health_medication_doses for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists medication_doses_delete_own on public.health_medication_doses;
create policy medication_doses_delete_own
  on public.health_medication_doses for delete
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- health_medication_stock_log (optional, fuer Korrekturen & Audits)
-- ---------------------------------------------------------------------------
create table if not exists public.health_medication_stock_log (
  id         uuid primary key default gen_random_uuid(),
  med_id     uuid not null references public.health_medications(id) on delete cascade,
  slot_id    uuid references public.health_medication_schedule_slots(id) on delete set null,
  day        date,
  delta      int not null check (delta <> 0),
  reason     text,
  created_at timestamptz not null default now()
);

alter table public.health_medication_stock_log
  add column if not exists slot_id uuid references public.health_medication_schedule_slots(id) on delete set null;

alter table public.health_medication_stock_log
  add column if not exists day date;

comment on table public.health_medication_stock_log is
  'Historisiert Lagerbestaenderaenderungen fuer Diagnostik, inklusive slot-basierter Confirm/Undo-Pfade.';

create index if not exists idx_medication_stock_log_med
  on public.health_medication_stock_log (med_id, created_at);

alter table public.health_medication_stock_log enable row level security;

drop policy if exists medication_stock_log_select_own on public.health_medication_stock_log;
create policy medication_stock_log_select_own
  on public.health_medication_stock_log for select
  using (
    exists (
      select 1
      from public.health_medications m
      where m.id = med_id
        and m.user_id = (select auth.uid())
    )
  );

drop policy if exists medication_stock_log_insert_own on public.health_medication_stock_log;
create policy medication_stock_log_insert_own
  on public.health_medication_stock_log for insert
  with check (
    exists (
      select 1
      from public.health_medications m
      where m.id = med_id
        and m.user_id = (select auth.uid())
    )
  );

drop policy if exists medication_stock_log_delete_own on public.health_medication_stock_log;
create policy medication_stock_log_delete_own
  on public.health_medication_stock_log for delete
  using (
    exists (
      select 1
      from public.health_medications m
      where m.id = med_id
        and m.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- med_reset_all_data_v2 -> kontrollierter Medication-Neustart fuer den Nutzer
-- ---------------------------------------------------------------------------
create or replace function public.med_reset_all_data_v2()
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_deleted_events int := 0;
  v_deleted_slots int := 0;
  v_deleted_logs int := 0;
  v_deleted_doses int := 0;
  v_deleted_meds int := 0;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  delete from public.health_medication_slot_events
   where user_id = v_user;
  get diagnostics v_deleted_events = row_count;

  delete from public.health_medication_schedule_slots
   where user_id = v_user;
  get diagnostics v_deleted_slots = row_count;

  delete from public.health_medication_stock_log l
   where exists (
     select 1
       from public.health_medications m
      where m.id = l.med_id
        and m.user_id = v_user
   );
  get diagnostics v_deleted_logs = row_count;

  delete from public.health_medication_doses
   where user_id = v_user;
  get diagnostics v_deleted_doses = row_count;

  delete from public.health_medications
   where user_id = v_user;
  get diagnostics v_deleted_meds = row_count;

  return jsonb_build_object(
    'deleted_slot_events', v_deleted_events,
    'deleted_schedule_slots', v_deleted_slots,
    'deleted_stock_logs', v_deleted_logs,
    'deleted_legacy_doses', v_deleted_doses,
    'deleted_medications', v_deleted_meds
  );
end;
$$;

grant execute on function public.med_reset_all_data_v2() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Helper: berechneter Tageswert (Europe/Vienna)
-- ---------------------------------------------------------------------------
create or replace function public._med_today()
returns date
language sql
stable
as $$
  select (now() at time zone 'Europe/Vienna')::date;
$$;

-- ---------------------------------------------------------------------------
-- med_list_v2(day) -> liefert Medication inkl. Slot-/Progress-Modell
-- ---------------------------------------------------------------------------
create or replace function public.med_list_v2(p_day date default null)
returns table (
  id uuid,
  name text,
  ingredient text,
  strength text,
  leaflet_url text,
  active boolean,
  with_meal boolean,
  stock_count int,
  low_stock_days int,
  low_stock_ack_day date,
  low_stock_ack_stock int,
  plan_active boolean,
  daily_planned_qty int,
  daily_taken_qty int,
  daily_remaining_qty int,
  total_count int,
  taken_count int,
  state text,
  days_left int,
  runout_day date,
  low_stock boolean,
  slots jsonb
)
language plpgsql
security invoker
set search_path = public, pg_catalog
stable
as $$
declare
  v_user uuid := auth.uid();
  v_day  date := coalesce(p_day, public._med_today());
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  return query
  with active_slots as (
    select
      s.id as slot_id,
      s.med_id,
      s.label,
      s.sort_order,
      s.qty_per_slot,
      s.start_date,
      s.end_date
    from public.health_medication_schedule_slots s
    join public.health_medications m
      on m.id = s.med_id
     and m.user_id = v_user
    where s.user_id = v_user
      and s.active = true
      and m.active = true
      and s.start_date <= v_day
      and (s.end_date is null or s.end_date >= v_day)
  ),
  slot_rows as (
    select
      s.med_id,
      s.slot_id,
      s.label,
      s.sort_order,
      s.qty_per_slot,
      s.start_date,
      s.end_date,
      e.taken_at,
      (e.id is not null) as is_taken,
      coalesce(e.qty, 0) as taken_qty
    from active_slots s
    left join public.health_medication_slot_events e
      on e.user_id = v_user
     and e.slot_id = s.slot_id
     and e.day = v_day
  ),
  rollup as (
    select
      m.id,
      coalesce(count(sr.slot_id), 0)::int as total_count,
      coalesce(count(*) filter (where sr.is_taken), 0)::int as taken_count,
      coalesce(sum(sr.qty_per_slot), 0)::int as daily_planned_qty,
      coalesce(sum(case when sr.is_taken then sr.taken_qty else 0 end), 0)::int as daily_taken_qty,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'slot_id', sr.slot_id,
            'label', sr.label,
            'sort_order', sr.sort_order,
            'qty', sr.qty_per_slot,
            'start_date', sr.start_date,
            'end_date', sr.end_date,
            'is_taken', sr.is_taken,
            'taken_at', sr.taken_at,
            'day', v_day
          )
          order by sr.sort_order, sr.slot_id
        ) filter (where sr.slot_id is not null),
        '[]'::jsonb
      ) as slots
    from public.health_medications m
    left join slot_rows sr
      on sr.med_id = m.id
    where m.user_id = v_user
    group by m.id
  )
  select
    m.id,
    m.name,
    m.ingredient,
    m.strength,
    m.leaflet_url,
    m.active,
    m.with_meal,
    m.stock_count,
    m.low_stock_days,
    m.low_stock_ack_day,
    m.low_stock_ack_stock,
    (r.total_count > 0) as plan_active,
    r.daily_planned_qty,
    r.daily_taken_qty,
    greatest(r.daily_planned_qty - r.daily_taken_qty, 0)::int as daily_remaining_qty,
    r.total_count,
    r.taken_count,
    case
      when r.total_count = 0 then null
      when r.taken_count = 0 then 'open'
      when r.taken_count < r.total_count then 'partial'
      else 'done'
    end as state,
    case
      when r.daily_planned_qty > 0 then floor(m.stock_count::numeric / r.daily_planned_qty)::int
      else null
    end as days_left,
    case
      when r.daily_planned_qty <= 0 then null
      when m.stock_count <= greatest(r.daily_planned_qty - r.daily_taken_qty, 0) then v_day
      else v_day + floor(
        greatest(m.stock_count - greatest(r.daily_planned_qty - r.daily_taken_qty, 0), 0)::numeric
        / r.daily_planned_qty
      )::int
    end as runout_day,
    case
      when r.daily_planned_qty <= 0 then false
      else (
        floor(m.stock_count::numeric / r.daily_planned_qty)::int <= m.low_stock_days
        and not coalesce(m.low_stock_ack_day = v_day and m.low_stock_ack_stock = m.stock_count, false)
      )
    end as low_stock,
    r.slots
  from public.health_medications m
  join rollup r
    on r.id = m.id
  where m.user_id = v_user;
end;
$$;

grant execute on function public.med_list_v2(date) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_upsert_v2 -> Create/Update Medication-Stammdaten ohne dose_per_day als Source of Truth
-- ---------------------------------------------------------------------------
create or replace function public.med_upsert_v2(
  p_id uuid,
  p_name text,
  p_ingredient text default null,
  p_strength text default null,
  p_leaflet_url text default null,
  p_stock_count int default 0,
  p_low_stock_days int default 7,
  p_active boolean default true,
  p_with_meal boolean default false
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_row  public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_name is null or length(btrim(p_name)) = 0 then
    raise exception 'name required' using errcode = '23514';
  end if;

  if p_id is null then
    insert into public.health_medications (
      user_id, name, ingredient, strength, leaflet_url,
      stock_count, low_stock_days, active, with_meal
    ) values (
      v_user, btrim(p_name), p_ingredient, p_strength, p_leaflet_url,
      greatest(p_stock_count, 0), greatest(p_low_stock_days, 0), coalesce(p_active, true), coalesce(p_with_meal, false)
    )
    returning * into v_row;
  else
    update public.health_medications
       set name = btrim(p_name),
           ingredient = p_ingredient,
           strength = p_strength,
           leaflet_url = p_leaflet_url,
           stock_count = greatest(p_stock_count, 0),
           low_stock_days = greatest(p_low_stock_days, 0),
           active = coalesce(p_active, true),
           with_meal = coalesce(p_with_meal, false)
     where id = p_id
       and user_id = v_user
     returning * into v_row;
  end if;

  if v_row.id is null then
    raise exception 'medication not found or not owned' using errcode = 'P0002';
  end if;
  return v_row;
end;
$$;

grant execute on function public.med_upsert_v2(uuid, text, text, text, text, int, int, boolean, boolean) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_upsert_schedule_v2 -> legt einen neuen/prospektiven Slot-Plan an
-- ---------------------------------------------------------------------------
create or replace function public.med_upsert_schedule_v2(
  p_med_id uuid,
  p_effective_start_date date,
  p_slots jsonb
)
returns int
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_start_date date := coalesce(p_effective_start_date, public._med_today());
  v_inserted_count int := 0;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_med_id is null then
    raise exception 'med_id required' using errcode = '23502';
  end if;
  if jsonb_typeof(p_slots) is distinct from 'array' or jsonb_array_length(p_slots) = 0 then
    raise exception 'slots array required' using errcode = '23514';
  end if;

  perform 1
    from public.health_medications
   where id = p_med_id
     and user_id = v_user
   for update;

  if not found then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  update public.health_medication_schedule_slots
     set end_date = v_start_date - 1,
         active = case when start_date < v_start_date then active else false end
   where user_id = v_user
     and med_id = p_med_id
     and active = true
     and start_date < v_start_date
     and (end_date is null or end_date >= v_start_date);

  delete from public.health_medication_schedule_slots
   where user_id = v_user
     and med_id = p_med_id
     and start_date >= v_start_date;

  insert into public.health_medication_schedule_slots (
    user_id, med_id, label, sort_order, qty_per_slot, start_date, active
  )
  select
    v_user,
    p_med_id,
    nullif(btrim(coalesce(slot.value->>'label', '')), ''),
    coalesce((slot.value->>'sort_order')::int, slot.ordinality - 1),
    greatest(coalesce((slot.value->>'qty')::int, 1), 1),
    v_start_date,
    true
  from jsonb_array_elements(p_slots) with ordinality as slot(value, ordinality);

  get diagnostics v_inserted_count = row_count;
  return v_inserted_count;
end;
$$;

grant execute on function public.med_upsert_schedule_v2(uuid, date, jsonb) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_confirm_slot_v2 -> bestaetigt genau einen offenen Slot
-- ---------------------------------------------------------------------------
create or replace function public.med_confirm_slot_v2(
  p_slot_id uuid,
  p_day date default null
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_day date := coalesce(p_day, public._med_today());
  v_ctx record;
  v_event_id uuid;
  v_prev_stock int;
  v_row public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_slot_id is null then
    raise exception 'slot_id required' using errcode = '23502';
  end if;

  select
    m.*,
    s.id as slot_id,
    s.qty_per_slot as slot_qty
  into v_ctx
  from public.health_medication_schedule_slots s
  join public.health_medications m
    on m.id = s.med_id
   and m.user_id = v_user
  where s.id = p_slot_id
    and s.user_id = v_user
    and s.active = true
    and m.active = true
    and s.start_date <= v_day
    and (s.end_date is null or s.end_date >= v_day)
  for update of m, s;

  if not found then
    raise exception 'active slot not found for this day' using errcode = 'P0002';
  end if;

  v_prev_stock := v_ctx.stock_count;

  insert into public.health_medication_slot_events (user_id, med_id, slot_id, day, qty, taken_at)
  values (v_user, v_ctx.id, v_ctx.slot_id, v_day, v_ctx.slot_qty, now())
  on conflict (user_id, slot_id, day) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select *
      into v_row
      from public.health_medications
     where id = v_ctx.id
       and user_id = v_user;
    return v_row;
  end if;

  update public.health_medications
     set stock_count = greatest(v_prev_stock - v_ctx.slot_qty, 0),
         low_stock_ack_day = case
                               when low_stock_ack_stock = v_prev_stock then null
                               else low_stock_ack_day
                             end,
         low_stock_ack_stock = case
                                 when low_stock_ack_stock = v_prev_stock then null
                                 else low_stock_ack_stock
                               end
   where id = v_ctx.id
     and user_id = v_user
   returning * into v_row;

  insert into public.health_medication_stock_log (med_id, slot_id, day, delta, reason)
  values (v_ctx.id, v_ctx.slot_id, v_day, -v_ctx.slot_qty, 'slot_confirm');

  return v_row;
end;
$$;

grant execute on function public.med_confirm_slot_v2(uuid, date) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_undo_slot_v2 -> macht genau einen bestaetigten Slot rueckgaengig
-- ---------------------------------------------------------------------------
create or replace function public.med_undo_slot_v2(
  p_slot_id uuid,
  p_day date default null
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_day date := coalesce(p_day, public._med_today());
  v_ctx record;
  v_qty int;
  v_row public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_slot_id is null then
    raise exception 'slot_id required' using errcode = '23502';
  end if;

  select
    e.med_id,
    e.slot_id,
    e.qty
  into v_ctx
  from public.health_medication_slot_events e
  where e.user_id = v_user
    and e.slot_id = p_slot_id
    and e.day = v_day
  for update of e;

  if not found then
    raise exception 'no slot event to undo for this day' using errcode = 'P0002';
  end if;

  delete from public.health_medication_slot_events
   where user_id = v_user
     and slot_id = p_slot_id
     and day = v_day
   returning qty into v_qty;

  update public.health_medications
     set stock_count = stock_count + v_qty
   where id = v_ctx.med_id
     and user_id = v_user
   returning * into v_row;

  if v_row.id is null then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  insert into public.health_medication_stock_log (med_id, slot_id, day, delta, reason)
  values (v_ctx.med_id, v_ctx.slot_id, v_day, v_qty, 'slot_undo');

  return v_row;
end;
$$;

grant execute on function public.med_undo_slot_v2(uuid, date) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_adjust_stock_v2 -> delta (Restock/Korrektur) im neuen Contract
-- ---------------------------------------------------------------------------
create or replace function public.med_adjust_stock_v2(
  p_med_id uuid,
  p_delta int,
  p_reason text default null
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_row public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_delta = 0 then
    raise exception 'delta must be non-zero' using errcode = '22023';
  end if;

  update public.health_medications
     set stock_count = stock_count + p_delta
   where id = p_med_id
     and user_id = v_user
   returning * into v_row;

  if v_row.id is null then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  insert into public.health_medication_stock_log (med_id, delta, reason)
  values (p_med_id, p_delta, coalesce(p_reason, 'stock_adjust'));

  return v_row;
end;
$$;

grant execute on function public.med_adjust_stock_v2(uuid, int, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_set_stock_v2 -> absolutes Setzen im neuen Contract
-- ---------------------------------------------------------------------------
create or replace function public.med_set_stock_v2(
  p_med_id uuid,
  p_stock int,
  p_reason text default null
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_prev int;
  v_row public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_stock < 0 then
    raise exception 'stock must be >= 0' using errcode = '22023';
  end if;

  select stock_count
    into v_prev
    from public.health_medications
   where id = p_med_id
     and user_id = v_user
   for update;

  if not found then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  update public.health_medications
     set stock_count = p_stock
   where id = p_med_id
     and user_id = v_user
   returning * into v_row;

  insert into public.health_medication_stock_log (med_id, delta, reason)
  values (p_med_id, p_stock - v_prev, coalesce(p_reason, 'stock_set'));

  return v_row;
end;
$$;

grant execute on function public.med_set_stock_v2(uuid, int, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_ack_low_stock_v2 -> Medication-Level Ack im neuen Contract
-- ---------------------------------------------------------------------------
create or replace function public.med_ack_low_stock_v2(
  p_med_id uuid,
  p_day date,
  p_stock_snapshot int
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_row public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_day is null then
    raise exception 'day required' using errcode = '23502';
  end if;

  update public.health_medications
     set low_stock_ack_day = p_day,
         low_stock_ack_stock = p_stock_snapshot
   where id = p_med_id
     and user_id = v_user
   returning * into v_row;

  if v_row.id is null then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

grant execute on function public.med_ack_low_stock_v2(uuid, date, int) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_set_active_v2 -> aktiviert/deaktiviert Medication im neuen Contract
-- ---------------------------------------------------------------------------
create or replace function public.med_set_active_v2(
  p_med_id uuid,
  p_active boolean default false
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_row public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  update public.health_medications
     set active = coalesce(p_active, false)
   where id = p_med_id
     and user_id = v_user
   returning * into v_row;

  if v_row.id is null then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

grant execute on function public.med_set_active_v2(uuid, boolean) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_delete_v2 -> entfernt Medication inkl. neuer Slot-/Event-Beziehungen
-- ---------------------------------------------------------------------------
create or replace function public.med_delete_v2(p_med_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_deleted boolean := false;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  delete from public.health_medications
   where id = p_med_id
     and user_id = v_user
   returning true into v_deleted;

  return coalesce(v_deleted, false);
end;
$$;

grant execute on function public.med_delete_v2(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_list(day) -> liefert Medikation + Status
-- ---------------------------------------------------------------------------
create or replace function public.med_list(p_day date default null)
returns table (
  id uuid,
  name text,
  ingredient text,
  strength text,
  leaflet_url text,
  dose_per_day int,
  stock_count int,
  low_stock_days int,
  active boolean,
  days_left int,
  runout_day date,
  low_stock boolean,
  taken boolean,
  taken_at timestamptz,
  qty int,
  low_stock_ack_day date,
  low_stock_ack_stock int
)
language plpgsql
security invoker
set search_path = public, pg_catalog
stable
as $$
declare
  v_user uuid := auth.uid();
  v_day  date := coalesce(p_day, public._med_today());
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  return query
    select
      m.id,
      m.name,
      m.ingredient,
      m.strength,
      m.leaflet_url,
      m.dose_per_day,
      m.stock_count,
      m.low_stock_days,
      m.active,
      floor(m.stock_count::numeric / m.dose_per_day)::int as days_left,
      case
        when d.id is not null then v_day + (floor(m.stock_count::numeric / m.dose_per_day)::int - 1)
        else v_day + floor(m.stock_count::numeric / m.dose_per_day)::int
      end as runout_day,
      (
        floor(m.stock_count::numeric / m.dose_per_day)::int <= m.low_stock_days
        and not coalesce(m.low_stock_ack_day = v_day and m.low_stock_ack_stock = m.stock_count, false)
      ) as low_stock,
      (d.id is not null) as taken,
      d.taken_at,
      d.qty,
      m.low_stock_ack_day,
      m.low_stock_ack_stock
    from public.health_medications m
      left join public.health_medication_doses d
        on d.med_id = m.id
       and d.user_id = v_user
       and d.day = v_day
    where m.user_id = v_user;
end;
$$;

grant execute on function public.med_list(date) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_upsert -> Create/Update Medikament
-- ---------------------------------------------------------------------------
create or replace function public.med_upsert(
  p_id uuid,
  p_name text,
  p_ingredient text default null,
  p_strength text default null,
  p_leaflet_url text default null,
  p_dose_per_day int default 1,
  p_stock_count int default 0,
  p_low_stock_days int default 7,
  p_active boolean default true
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_row  public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_name is null or length(btrim(p_name)) = 0 then
    raise exception 'name required' using errcode = '23514';
  end if;

  if p_id is null then
    insert into public.health_medications (
      user_id, name, ingredient, strength, leaflet_url,
      dose_per_day, stock_count, low_stock_days, active
    ) values (
      v_user, btrim(p_name), p_ingredient, p_strength, p_leaflet_url,
      greatest(p_dose_per_day, 1), p_stock_count, greatest(p_low_stock_days, 0), coalesce(p_active, true)
    )
    returning * into v_row;
  else
    update public.health_medications
       set name = btrim(p_name),
           ingredient = p_ingredient,
           strength = p_strength,
           leaflet_url = p_leaflet_url,
           dose_per_day = greatest(p_dose_per_day, 1),
           stock_count = p_stock_count,
           low_stock_days = greatest(p_low_stock_days, 0),
           active = coalesce(p_active, true)
     where id = p_id
       and user_id = v_user
     returning * into v_row;
  end if;

  if v_row.id is null then
    raise exception 'medication not found or not owned' using errcode = 'P0002';
  end if;
  return v_row;
end;
$$;

grant execute on function public.med_upsert(uuid, text, text, text, text, int, int, int, boolean) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_confirm_dose -> Tagesbestaetigung
-- ---------------------------------------------------------------------------
create or replace function public.med_confirm_dose(
  p_med_id uuid,
  p_day date default null
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_day  date := coalesce(p_day, public._med_today());
  v_med  public.health_medications;
  v_prev_stock int;
  v_qty  int;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_med_id is null then
    raise exception 'med_id required' using errcode = '23502';
  end if;

  select *
    into v_med
    from public.health_medications
   where id = p_med_id
     and user_id = v_user
   for update;

  if not found then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;
  v_prev_stock := v_med.stock_count;
  v_qty := greatest(v_med.dose_per_day, 1);

  begin
    insert into public.health_medication_doses (user_id, med_id, day, qty, taken_at)
    values (v_user, v_med.id, v_day, v_qty, now());
  exception
    when unique_violation then
      raise exception 'dose already confirmed for this day' using errcode = '23505';
  end;

  update public.health_medications
     set stock_count = greatest(v_prev_stock - v_qty, 0),
         low_stock_ack_day = case
                               when low_stock_ack_stock = v_prev_stock then null
                               else low_stock_ack_day
                             end,
         low_stock_ack_stock = case
                                 when low_stock_ack_stock = v_prev_stock then null
                                 else low_stock_ack_stock
                               end
   where id = v_med.id
   returning * into v_med;

  insert into public.health_medication_stock_log (med_id, delta, reason)
  values (v_med.id, -v_qty, 'confirm_dose');

  return v_med;
end;
$$;

grant execute on function public.med_confirm_dose(uuid, date) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_undo_dose -> Entfernt Tagesbestaetigung
-- ---------------------------------------------------------------------------
create or replace function public.med_undo_dose(
  p_med_id uuid,
  p_day date default null
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_day  date := coalesce(p_day, public._med_today());
  v_med  public.health_medications;
  v_qty  int;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  delete from public.health_medication_doses
   where user_id = v_user
     and med_id = p_med_id
     and day = v_day
   returning qty into v_qty;

  if not found then
    raise exception 'no dose to undo for this day' using errcode = 'P0002';
  end if;

  update public.health_medications
     set stock_count = stock_count + v_qty
   where id = p_med_id
     and user_id = v_user
   returning * into v_med;

  if v_med.id is null then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  insert into public.health_medication_stock_log (med_id, delta, reason)
  values (p_med_id, v_qty, 'undo_dose');

  return v_med;
end;
$$;

grant execute on function public.med_undo_dose(uuid, date) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_adjust_stock -> delta (Restock/Korrektur)
-- ---------------------------------------------------------------------------
create or replace function public.med_adjust_stock(
  p_med_id uuid,
  p_delta int,
  p_reason text default null
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_row  public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_delta = 0 then
    raise exception 'delta must be non-zero' using errcode = '22023';
  end if;

  update public.health_medications
     set stock_count = stock_count + p_delta
   where id = p_med_id
     and user_id = v_user
   returning * into v_row;

  if v_row.id is null then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  insert into public.health_medication_stock_log (med_id, delta, reason)
  values (p_med_id, p_delta, coalesce(p_reason, 'manual_adjust'));
  return v_row;
end;
$$;

grant execute on function public.med_adjust_stock(uuid, int, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_set_stock -> absolutes Setzen
-- ---------------------------------------------------------------------------
create or replace function public.med_set_stock(
  p_med_id uuid,
  p_stock int,
  p_reason text default null
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_prev int;
  v_row  public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_stock < 0 then
    raise exception 'stock must be >= 0' using errcode = '22023';
  end if;

  select stock_count
    into v_prev
    from public.health_medications
   where id = p_med_id
     and user_id = v_user
   for update;

  if not found then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  update public.health_medications
     set stock_count = p_stock
   where id = p_med_id
     and user_id = v_user
   returning * into v_row;

  insert into public.health_medication_stock_log (med_id, delta, reason)
  values (p_med_id, p_stock - v_prev, coalesce(p_reason, 'set_stock'));

  return v_row;
end;
$$;

grant execute on function public.med_set_stock(uuid, int, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_ack_low_stock -> Acknowledge fuer Tag + Bestand
-- ---------------------------------------------------------------------------
create or replace function public.med_ack_low_stock(
  p_med_id uuid,
  p_day date,
  p_stock_snapshot int
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_row  public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_day is null then
    raise exception 'day required' using errcode = '23502';
  end if;

  update public.health_medications
     set low_stock_ack_day = p_day,
         low_stock_ack_stock = p_stock_snapshot
   where id = p_med_id
     and user_id = v_user
   returning * into v_row;

  if v_row.id is null then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

grant execute on function public.med_ack_low_stock(uuid, date, int) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_set_active -> aktiviert/deaktiviert Eintrag
-- ---------------------------------------------------------------------------
create or replace function public.med_set_active(
  p_med_id uuid,
  p_active boolean default false
)
returns public.health_medications
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_row  public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  update public.health_medications
     set active = coalesce(p_active, false)
   where id = p_med_id
     and user_id = v_user
   returning * into v_row;

  if v_row.id is null then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;
  return v_row;
end;
$$;

grant execute on function public.med_set_active(uuid, boolean) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- med_delete -> entfernt Medikament (inkl. Casades)
-- ---------------------------------------------------------------------------
create or replace function public.med_delete(p_med_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_deleted boolean := false;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  delete from public.health_medications
   where id = p_med_id
     and user_id = v_user
   returning true into v_deleted;

  return coalesce(v_deleted, false);
end;
$$;

grant execute on function public.med_delete(uuid) to authenticated, service_role;

commit;

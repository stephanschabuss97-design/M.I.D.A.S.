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

comment on table public.health_medications is
  'CRUD-Basis fuer Medikamente je Nutzer mit Lagerbestand, Dosierung und Low-Stock-Metadaten.';

drop trigger if exists set_health_medications_updated_at on public.health_medications;
create trigger set_health_medications_updated_at
  before update on public.health_medications
  for each row execute function public.set_current_timestamp_updated_at();

create index if not exists idx_health_medications_user
  on public.health_medications (user_id, active);

create index if not exists idx_health_medications_low_stock
  on public.health_medications (user_id)
  where (active and stock_count <= low_stock_days * greatest(dose_per_day, 1));

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
  'Protokolliert bestaetigte Einnahmen je Medikament/Tag (unique per user/med/day).';

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
  delta      int not null check (delta <> 0),
  reason     text,
  created_at timestamptz not null default now()
);

comment on table public.health_medication_stock_log is
  'Historisiert jede Lagerbestaenderaenderung (Restock/Korrektur) fuer Diagnostik.';

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

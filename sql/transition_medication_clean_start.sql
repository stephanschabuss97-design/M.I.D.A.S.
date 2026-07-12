-- ==========================================================================
-- DANGER: ONE-TIME MIDAS MEDICATION CLEAN-START TRANSITION
-- ==========================================================================
-- DO NOT RUN during S4, automatic bootstrap or an ordinary app deployment.
-- This script irreversibly deletes the existing Medication event history,
-- removes historical/inactive schedule rows and drops the stock-log table.
--
-- Reviewed target user:
--   67167408-fb63-4432-83c9-33ae7ac6c9ef
--
-- The cutover day is captured once from Europe/Vienna at execution time.
-- Run only after a reviewed safety snapshot and explicit user approval, before
-- the first Medication confirmation of that Vienna day, before 10:00 local
-- time and before any Medication push delivery was persisted for that day.
--
-- After successful execution, apply in this order:
--   1. sql/16_Explicit_Grants.sql
--   2. sql/17_Medication_Retention.sql
--   3. reconcile stock against the real packages and correct only mismatches
--   4. reload the PWA and deliberately synchronize the Android widget
--
-- Re-execution fails closed because health_medication_stock_log no longer
-- exists after a successful first run. Never add CASCADE to the table drop.
-- ==========================================================================

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create temporary table midas_medication_clean_start_context (
  target_user uuid primary key,
  cutover_at timestamptz not null,
  cutover_day date not null,
  initial_medication_count int not null default 0,
  initial_stock_fingerprint text not null default '',
  initial_future_slot_count int not null default 0,
  initial_future_slot_fingerprint text not null default '',
  expected_current_slot_count int not null default 0,
  removed_stock_log_row_count int not null default 0,
  deleted_event_count int not null default 0,
  deleted_old_slot_count int not null default 0,
  rebased_slot_count int not null default 0,
  cleared_ack_count int not null default 0
) on commit drop;

insert into pg_temp.midas_medication_clean_start_context (
  target_user,
  cutover_at,
  cutover_day
)
values (
  '67167408-fb63-4432-83c9-33ae7ac6c9ef'::uuid,
  statement_timestamp(),
  (statement_timestamp() at time zone 'Europe/Vienna')::date
);

-- Fail with an explicit one-time diagnostic before attempting the lock set.
do $$
begin
  if to_regclass('public.health_medications') is null
     or to_regclass('public.health_medication_schedule_slots') is null
     or to_regclass('public.health_medication_slot_events') is null then
    raise exception 'Medication clean start requires all three canonical Medication tables';
  end if;

  if to_regclass('public.health_medication_stock_log') is null then
    raise exception 'Medication clean start was already applied or the legacy stock log is missing';
  end if;

  if to_regclass('public.push_notification_deliveries') is null then
    raise exception 'Medication clean start cannot verify push deliveries';
  end if;
end;
$$;

-- Fixed lock order. A timeout aborts the whole transaction without effects.
lock table public.health_medications in access exclusive mode;
lock table public.health_medication_schedule_slots in access exclusive mode;
lock table public.health_medication_slot_events in access exclusive mode;
lock table public.health_medication_stock_log in access exclusive mode;

-- Final preflight after every Medication lock has been acquired.
do $$
declare
  v_target_user uuid;
  v_cutover_day date;
  v_owner_count int := 0;
  v_owners uuid[];
begin
  select c.target_user, c.cutover_day
    into strict v_target_user, v_cutover_day
    from pg_temp.midas_medication_clean_start_context c;

  if not coalesce((
    select r.rolsuper or r.rolbypassrls
      from pg_catalog.pg_roles r
     where r.rolname = current_user
  ), false) then
    raise exception 'Medication clean start requires an RLS-bypass database role';
  end if;

  if (clock_timestamp() at time zone 'Europe/Vienna')::date <> v_cutover_day then
    raise exception 'Vienna cutover day changed while waiting for locks';
  end if;

  if (clock_timestamp() at time zone 'Europe/Vienna')::time >= time '10:00' then
    raise exception 'Medication clean start must run before 10:00 Europe/Vienna';
  end if;

  if not exists (
    select 1
      from auth.users u
     where u.id = v_target_user
  ) then
    raise exception 'reviewed Medication target user does not exist';
  end if;

  if to_regclass('public.health_medication_stock_log') is null then
    raise exception 'legacy Medication stock log disappeared before final preflight';
  end if;

  select count(distinct owners.user_id)::int,
         array_agg(distinct owners.user_id)
    into v_owner_count, v_owners
    from (
      select m.user_id from public.health_medications m
      union all
      select s.user_id from public.health_medication_schedule_slots s
      union all
      select e.user_id from public.health_medication_slot_events e
    ) owners;

  if v_owner_count <> 1
     or v_owners[1] is distinct from v_target_user then
    raise exception 'Medication tables do not have the reviewed single owner'
      using detail = format('Expected %s, found %s distinct owner(s): %s.',
        v_target_user, v_owner_count, coalesce(v_owners::text, '{}'));
  end if;

  if not exists (
    select 1
      from public.health_medications m
     where m.user_id = v_target_user
  ) then
    raise exception 'target user has no Medication master data';
  end if;

  if exists (
    select 1
      from public.health_medication_schedule_slots s
      left join public.health_medications m on m.id = s.med_id
     where m.id is null
        or s.user_id is distinct from m.user_id
  ) then
    raise exception 'Medication schedule owner or foreign-key contract is inconsistent';
  end if;

  if exists (
    select 1
      from public.health_medication_slot_events e
      left join public.health_medications m on m.id = e.med_id
      left join public.health_medication_schedule_slots s on s.id = e.slot_id
     where m.id is null
        or s.id is null
        or e.user_id is distinct from m.user_id
        or e.user_id is distinct from s.user_id
        or e.med_id is distinct from s.med_id
  ) then
    raise exception 'Medication event owner or foreign-key contract is inconsistent';
  end if;

  if exists (
    select 1
      from public.health_medication_stock_log l
      left join public.health_medications m on m.id = l.med_id
     where m.id is null
        or m.user_id is distinct from v_target_user
  ) then
    raise exception 'legacy stock log contains rows outside the reviewed target user';
  end if;

  if exists (
    select 1
      from public.health_medications m
     where m.stock_count < 0
  ) then
    raise exception 'negative Medication stock blocks clean start';
  end if;

  if exists (
    select 1
      from public.health_medication_slot_events e
     where e.user_id = v_target_user
       and e.day = v_cutover_day
  ) then
    raise exception 'Medication was already confirmed on the Vienna cutover day';
  end if;

  if exists (
    select 1
      from public.push_notification_deliveries d
     where d.user_id = v_target_user
       and d.day = v_cutover_day
       and d.type in (
         'medication_morning',
         'medication_noon',
         'medication_evening',
         'medication_night'
       )
  ) then
    raise exception 'Medication push delivery already exists for the Vienna cutover day';
  end if;

  if exists (
    select 1
      from public.health_medication_schedule_slots s
     where s.user_id = v_target_user
       and s.active
       and s.start_date <= v_cutover_day
       and (s.end_date is null or s.end_date >= v_cutover_day)
     group by s.user_id, s.med_id, s.sort_order
    having count(*) > 1
  ) then
    raise exception 'ambiguous active Medication plans would collide during rebase';
  end if;

  update pg_temp.midas_medication_clean_start_context c
     set initial_medication_count = (
           select count(*)::int
             from public.health_medications m
            where m.user_id = v_target_user
         ),
         initial_stock_fingerprint = (
           select md5(coalesce(string_agg(
             m.id::text || ':' || m.stock_count::text,
             '|' order by m.id
           ), ''))
             from public.health_medications m
            where m.user_id = v_target_user
         ),
         initial_future_slot_count = (
           select count(*)::int
             from public.health_medication_schedule_slots s
            where s.user_id = v_target_user
              and s.start_date > v_cutover_day
         ),
         initial_future_slot_fingerprint = (
           select md5(coalesce(string_agg(
             row_to_json(s)::text,
             '|' order by s.id
           ), ''))
             from public.health_medication_schedule_slots s
            where s.user_id = v_target_user
              and s.start_date > v_cutover_day
         ),
         expected_current_slot_count = (
           select count(*)::int
             from public.health_medication_schedule_slots s
            where s.user_id = v_target_user
              and s.active
              and s.start_date <= v_cutover_day
              and (s.end_date is null or s.end_date >= v_cutover_day)
         ),
         removed_stock_log_row_count = (
           select count(*)::int
             from public.health_medication_stock_log l
         );
end;
$$;

-- Remove all pre-cutover intake evidence before adding the new event contract.
with deleted as (
  delete from public.health_medication_slot_events e
   using pg_temp.midas_medication_clean_start_context c
   where e.user_id = c.target_user
   returning e.id
)
update pg_temp.midas_medication_clean_start_context c
   set deleted_event_count = (select count(*)::int from deleted);

alter table public.health_medication_slot_events
  add column if not exists stock_decrement_qty int;

update public.health_medication_slot_events
   set stock_decrement_qty = 0
 where stock_decrement_qty is null;

alter table public.health_medication_slot_events
  alter column stock_decrement_qty set default 0,
  alter column stock_decrement_qty set not null;

alter table public.health_medication_slot_events
  drop constraint if exists chk_medication_slot_event_stock_decrement;

alter table public.health_medication_slot_events
  add constraint chk_medication_slot_event_stock_decrement
    check (stock_decrement_qty >= 0 and stock_decrement_qty <= qty);

alter table public.health_medications
  drop constraint if exists health_medications_stock_count_check;

alter table public.health_medications
  add constraint health_medications_stock_count_check
    check (stock_count >= 0);

create index if not exists idx_medication_slot_events_slot_med
  on public.health_medication_slot_events (slot_id, med_id);

-- The following six RPC definitions are copied from sql/12_Medication.sql.
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

  delete from public.health_medications
   where user_id = v_user;
  get diagnostics v_deleted_meds = row_count;

  return jsonb_build_object(
    'deleted_slot_events', v_deleted_events,
    'deleted_schedule_slots', v_deleted_slots,
    'deleted_medications', v_deleted_meds
  );
end;
$$;

grant execute on function public.med_reset_all_data_v2() to authenticated, service_role;

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
    user_id, med_id, label, slot_type, sort_order, qty_per_slot, start_date, active
  )
  select
    v_user,
    p_med_id,
    nullif(btrim(coalesce(slot.value->>'label', '')), ''),
    public._med_infer_slot_type(
      slot.value->>'slot_type',
      slot.value->>'label',
      coalesce((slot.value->>'sort_order')::int, slot.ordinality - 1)::int,
      jsonb_array_length(p_slots)
    ),
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
  v_stock_decrement_qty int;
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
  v_stock_decrement_qty := least(v_prev_stock, v_ctx.slot_qty);

  insert into public.health_medication_slot_events (
    user_id,
    med_id,
    slot_id,
    day,
    qty,
    stock_decrement_qty,
    taken_at
  )
  values (
    v_user,
    v_ctx.id,
    v_ctx.slot_id,
    v_day,
    v_ctx.slot_qty,
    v_stock_decrement_qty,
    now()
  )
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
     set stock_count = v_prev_stock - v_stock_decrement_qty,
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

  return v_row;
end;
$$;

grant execute on function public.med_confirm_slot_v2(uuid, date) to authenticated, service_role;

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
  v_med_id uuid;
  v_stock_decrement_qty int;
  v_row public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_slot_id is null then
    raise exception 'slot_id required' using errcode = '23502';
  end if;

  select e.med_id
  into v_med_id
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
   returning stock_decrement_qty into v_stock_decrement_qty;

  update public.health_medications
     set stock_count = (
           stock_count::bigint + v_stock_decrement_qty::bigint
         )::int
   where id = v_med_id
     and user_id = v_user
     and stock_count::bigint + v_stock_decrement_qty::bigint <= 2147483647
   returning * into v_row;

  if v_row.id is null then
    if exists (
      select 1
        from public.health_medications
       where id = v_med_id
         and user_id = v_user
    ) then
      raise exception 'stock target exceeds integer range' using errcode = '22003';
    end if;
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

grant execute on function public.med_undo_slot_v2(uuid, date) to authenticated, service_role;

-- p_reason remains for API compatibility; no history is persisted.
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
  v_prev_stock int;
  v_target_stock bigint;
  v_row public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_delta is null or p_delta = 0 then
    raise exception 'delta must be non-zero' using errcode = '22023';
  end if;

  select stock_count
    into v_prev_stock
    from public.health_medications
   where id = p_med_id
     and user_id = v_user
   for update;

  if not found then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  v_target_stock := v_prev_stock::bigint + p_delta::bigint;

  if v_target_stock < 0 then
    raise exception 'stock target must be >= 0' using errcode = '22023';
  end if;
  if v_target_stock > 2147483647 then
    raise exception 'stock target exceeds integer range' using errcode = '22003';
  end if;

  update public.health_medications
     set stock_count = v_target_stock::int
   where id = p_med_id
     and user_id = v_user
   returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.med_adjust_stock_v2(uuid, int, text) to authenticated, service_role;

-- p_reason remains for API compatibility; no history is persisted.
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
  v_row public.health_medications;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_stock is null then
    raise exception 'stock required' using errcode = '23502';
  end if;
  if p_stock < 0 then
    raise exception 'stock must be >= 0' using errcode = '22023';
  end if;

  select *
    into v_row
    from public.health_medications
   where id = p_med_id
     and user_id = v_user
   for update;

  if not found then
    raise exception 'medication not found' using errcode = 'P0002';
  end if;

  if v_row.stock_count = p_stock then
    return v_row;
  end if;

  update public.health_medications
     set stock_count = p_stock
   where id = p_med_id
     and user_id = v_user
   returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.med_set_stock_v2(uuid, int, text) to authenticated, service_role;

-- Remove obsolete plans before rebasing the current observation contract.
with deleted as (
  delete from public.health_medication_schedule_slots s
   using pg_temp.midas_medication_clean_start_context c
   where s.user_id = c.target_user
     and (
       s.end_date < c.cutover_day
       or (not s.active and s.start_date <= c.cutover_day)
     )
   returning s.id
)
update pg_temp.midas_medication_clean_start_context c
   set deleted_old_slot_count = (select count(*)::int from deleted);

with rebased as (
  update public.health_medication_schedule_slots s
     set start_date = c.cutover_day
    from pg_temp.midas_medication_clean_start_context c
   where s.user_id = c.target_user
     and s.active
     and s.start_date <= c.cutover_day
     and (s.end_date is null or s.end_date >= c.cutover_day)
     and s.start_date <> c.cutover_day
   returning s.id
)
update pg_temp.midas_medication_clean_start_context c
   set rebased_slot_count = (select count(*)::int from rebased);

with cleared as (
  update public.health_medications m
     set low_stock_ack_day = null,
         low_stock_ack_stock = null
    from pg_temp.midas_medication_clean_start_context c
   where m.user_id = c.target_user
     and (m.low_stock_ack_day is not null or m.low_stock_ack_stock is not null)
   returning m.id
)
update pg_temp.midas_medication_clean_start_context c
   set cleared_ack_count = (select count(*)::int from cleared);

drop table public.health_medication_stock_log;

-- Final postconditions. Any mismatch raises and rolls back every prior change.
do $$
declare
  v_context record;
  v_current_medication_count int;
  v_current_stock_fingerprint text;
  v_future_slot_count int;
  v_future_slot_fingerprint text;
  v_signature text;
  v_function regprocedure;
begin
  select *
    into strict v_context
    from pg_temp.midas_medication_clean_start_context;

  if to_regclass('public.health_medication_stock_log') is not null then
    raise exception 'legacy Medication stock log still exists after drop';
  end if;

  if exists (
    select 1
      from public.health_medication_slot_events e
     where e.user_id = v_context.target_user
  ) then
    raise exception 'target-user Medication events remain after clean start';
  end if;

  if exists (
    select 1
      from public.health_medication_schedule_slots s
     where s.user_id = v_context.target_user
       and (
         s.end_date < v_context.cutover_day
         or (not s.active and s.start_date <= v_context.cutover_day)
       )
  ) then
    raise exception 'obsolete Medication schedule rows remain after clean start';
  end if;

  if exists (
    select 1
      from public.health_medication_schedule_slots s
     where s.user_id = v_context.target_user
       and s.active
       and s.start_date < v_context.cutover_day
       and (s.end_date is null or s.end_date >= v_context.cutover_day)
  ) then
    raise exception 'current Medication schedule rows were not fully rebased';
  end if;

  if (
    select count(*)::int
      from public.health_medication_schedule_slots s
     where s.user_id = v_context.target_user
       and s.active
       and s.start_date = v_context.cutover_day
       and (s.end_date is null or s.end_date >= v_context.cutover_day)
  ) <> v_context.expected_current_slot_count then
    raise exception 'current Medication schedule count changed unexpectedly';
  end if;

  select count(*)::int,
         md5(coalesce(string_agg(
           m.id::text || ':' || m.stock_count::text,
           '|' order by m.id
         ), ''))
    into v_current_medication_count, v_current_stock_fingerprint
    from public.health_medications m
   where m.user_id = v_context.target_user;

  if v_current_medication_count <> v_context.initial_medication_count
     or v_current_stock_fingerprint is distinct from v_context.initial_stock_fingerprint then
    raise exception 'Medication master data or stock changed during clean start';
  end if;

  select count(*)::int,
         md5(coalesce(string_agg(
           row_to_json(s)::text,
           '|' order by s.id
         ), ''))
    into v_future_slot_count, v_future_slot_fingerprint
    from public.health_medication_schedule_slots s
   where s.user_id = v_context.target_user
     and s.start_date > v_context.cutover_day;

  if v_future_slot_count <> v_context.initial_future_slot_count
     or v_future_slot_fingerprint is distinct from v_context.initial_future_slot_fingerprint then
    raise exception 'future Medication schedules changed during clean start';
  end if;

  if exists (
    select 1
      from public.health_medications m
     where m.user_id = v_context.target_user
       and (m.low_stock_ack_day is not null or m.low_stock_ack_stock is not null)
  ) then
    raise exception 'Low-stock acknowledgements remain after clean start';
  end if;

  if not exists (
    select 1
      from pg_constraint c
     where c.conrelid = 'public.health_medications'::regclass
       and c.conname = 'health_medications_stock_count_check'
  ) then
    raise exception 'nonnegative Medication stock constraint is missing';
  end if;

  if not exists (
    select 1
      from pg_constraint c
     where c.conrelid = 'public.health_medication_slot_events'::regclass
       and c.conname = 'chk_medication_slot_event_stock_decrement'
  ) then
    raise exception 'Medication event stock-decrement constraint is missing';
  end if;

  foreach v_signature in array array[
    'public.med_upsert_schedule_v2(uuid,date,jsonb)',
    'public.med_confirm_slot_v2(uuid,date)',
    'public.med_undo_slot_v2(uuid,date)',
    'public.med_adjust_stock_v2(uuid,integer,text)',
    'public.med_set_stock_v2(uuid,integer,text)',
    'public.med_reset_all_data_v2()'
  ] loop
    v_function := to_regprocedure(v_signature);
    if v_function is null then
      raise exception 'required Medication RPC is missing: %', v_signature;
    end if;
    if position(
      'health_medication_stock_log'
      in pg_get_functiondef(v_function)
    ) > 0 then
      raise exception 'Medication RPC still references stock log: %', v_signature;
    end if;
  end loop;
end;
$$;

select
  c.target_user,
  c.cutover_at,
  c.cutover_day,
  c.initial_medication_count as preserved_medication_count,
  c.removed_stock_log_row_count,
  c.deleted_event_count,
  c.deleted_old_slot_count,
  c.expected_current_slot_count,
  c.rebased_slot_count,
  c.initial_future_slot_count as preserved_future_slot_count,
  c.cleared_ack_count,
  'stock_count unchanged; verify against packages and correct only mismatches' as stock_contract
from pg_temp.midas_medication_clean_start_context c;

commit;

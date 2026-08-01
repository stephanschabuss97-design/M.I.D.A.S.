-- MIDAS Activity V2 R2: catalog projection, immutable session history and RPCs.
--
-- Product contract:
--   - Additive only; Activity V1 is untouched.
--   - Four RLS-enabled tables and two public RPC functions.
--   - The browser has no direct table DML contract.
--   - public.activity_v2_commit_session is the single atomic write endpoint.
--   - Re-run accepts only a fresh 0/6 or canonical 6/6 target-object state.
--   - No extension is installed or version-pinned by this file.
--
-- Productive execution is user-gated by the R2 roadmap. Run
-- sql/16_Explicit_Grants.sql only after this transaction committed.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';
set local search_path = '';

-- ---------------------------------------------------------------------------
-- Fail-closed prerequisites and target-name state
-- ---------------------------------------------------------------------------

do $$
declare
  v_relation_count integer;
  v_function_count integer;
begin
  if pg_catalog.to_regprocedure('extensions.digest(bytea,text)') is null then
    raise exception 'Activity V2 requires extensions.digest(bytea,text)';
  end if;

  select pg_catalog.count(*)::integer
    into v_relation_count
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname = any (array[
       'health_activity_catalog_entries',
       'health_activity_sessions',
       'health_activity_session_items',
       'health_activity_item_sets'
     ]::text[]);

  select pg_catalog.count(*)::integer
    into v_function_count
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = any (array[
       'activity_v2_commit_session',
       'activity_v2_last_performance'
     ]::text[]);

  if v_relation_count = 0 and v_function_count = 0 then
    return;
  end if;

  if v_relation_count <> 4 or v_function_count <> 2 then
    raise exception
      'Activity V2 target state must be fresh 0/6 or canonical 6/6';
  end if;

  if exists (
    select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = any (array[
         'health_activity_catalog_entries',
         'health_activity_sessions',
         'health_activity_session_items',
         'health_activity_item_sets'
       ]::text[])
       and c.relkind <> 'r'
  ) then
    raise exception 'Activity V2 target relation has unexpected relation kind';
  end if;

  if pg_catalog.to_regprocedure(
       'public.activity_v2_commit_session(uuid,jsonb)'
     ) is null
     or pg_catalog.to_regprocedure(
       'public.activity_v2_last_performance(text)'
     ) is null then
    raise exception 'Activity V2 RPC signature drift detected';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Catalog projection and immutable relational history
-- ---------------------------------------------------------------------------

create table if not exists public.health_activity_catalog_entries (
  catalog_version integer not null,
  item_key text not null,
  label text not null,
  aliases text[] not null,
  status text not null,
  category text not null,
  equipment text not null,
  muscle_groups text[] not null,
  sport_tags text[] not null,
  tracking_mode text not null,
  load_comparability text not null,
  field_policy jsonb not null,
  constraint health_activity_catalog_entries_pkey
    primary key (catalog_version, item_key),
  constraint health_activity_catalog_entries_version_key_mode_key
    unique (catalog_version, item_key, tracking_mode),
  constraint health_activity_catalog_entries_version_check
    check (catalog_version >= 1),
  constraint health_activity_catalog_entries_item_key_check
    check (
      pg_catalog.char_length(item_key) between 1 and 64
      and item_key ~ '^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$'
    ),
  constraint health_activity_catalog_entries_label_check
    check (
      pg_catalog.char_length(label) between 1 and 80
      and label = pg_catalog.btrim(label)
    ),
  constraint health_activity_catalog_entries_aliases_check
    check (
      pg_catalog.cardinality(aliases) between 0 and 12
      and pg_catalog.array_position(aliases, null) is null
    ),
  constraint health_activity_catalog_entries_status_check
    check (status in ('active', 'deprecated')),
  constraint health_activity_catalog_entries_category_check
    check (category in ('endurance', 'sport', 'strength')),
  constraint health_activity_catalog_entries_equipment_check
    check (equipment in (
      'barbell', 'bodyweight', 'cable', 'cardio_machine', 'dumbbell',
      'kettlebell', 'machine', 'none', 'variable'
    )),
  constraint health_activity_catalog_entries_muscle_groups_check
    check (
      pg_catalog.array_position(muscle_groups, null) is null
      and muscle_groups <@ array[
        'adductors', 'back', 'biceps', 'calves', 'chest', 'core',
        'forearms', 'full_body', 'glutes', 'hamstrings', 'hip_flexors',
        'quadriceps', 'shoulders', 'triceps'
      ]::text[]
    ),
  constraint health_activity_catalog_entries_sport_tags_check
    check (
      pg_catalog.array_position(sport_tags, null) is null
      and sport_tags <@ array[
        'endurance', 'indoor', 'outdoor', 'team_sport', 'water_sport'
      ]::text[]
    ),
  constraint health_activity_catalog_entries_tracking_mode_check
    check (tracking_mode in ('duration', 'duration_distance', 'strength_sets')),
  constraint health_activity_catalog_entries_load_comparability_check
    check (load_comparability in (
      'device_relative', 'not_applicable', 'standardized'
    )),
  constraint health_activity_catalog_entries_field_policy_check
    check (
      pg_catalog.jsonb_typeof(field_policy) = 'object'
      and field_policy ?& array[
        'assistance_kg', 'distance_km', 'distance_m', 'duration_min',
        'duration_sec', 'note', 'reps', 'weight_kg'
      ]::text[]
      and field_policy - array[
        'assistance_kg', 'distance_km', 'distance_m', 'duration_min',
        'duration_sec', 'note', 'reps', 'weight_kg'
      ]::text[] = '{}'::jsonb
      and field_policy ->> 'assistance_kg' in ('forbidden', 'optional', 'required')
      and field_policy ->> 'distance_km' in ('forbidden', 'optional', 'required')
      and field_policy ->> 'distance_m' in ('forbidden', 'optional', 'required')
      and field_policy ->> 'duration_min' in ('forbidden', 'optional', 'required')
      and field_policy ->> 'duration_sec' in ('forbidden', 'optional', 'required')
      and field_policy ->> 'note' in ('forbidden', 'optional', 'required')
      and field_policy ->> 'reps' in ('forbidden', 'optional', 'required')
      and field_policy ->> 'weight_kg' in ('forbidden', 'optional', 'required')
    )
);

create table if not exists public.health_activity_sessions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null,
  request_id uuid not null,
  request_fingerprint text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_min integer not null,
  day date generated always as (
    pg_catalog.timezone('Europe/Vienna', started_at)::date
  ) stored,
  title text,
  note text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint health_activity_sessions_user_fkey
    foreign key (user_id) references auth.users(id) on delete cascade,
  constraint health_activity_sessions_user_request_key
    unique (user_id, request_id),
  constraint health_activity_sessions_id_user_key
    unique (id, user_id),
  constraint health_activity_sessions_fingerprint_check
    check (request_fingerprint ~ '^[0-9a-f]{64}$'),
  constraint health_activity_sessions_time_check
    check (ended_at >= started_at),
  constraint health_activity_sessions_duration_check
    check (duration_min between 1 and 1440),
  constraint health_activity_sessions_title_check
    check (
      title is null or (
        title = pg_catalog.btrim(title)
        and pg_catalog.char_length(title) between 1 and 120
      )
    ),
  constraint health_activity_sessions_note_check
    check (
      note is null or (
        note = pg_catalog.btrim(note)
        and pg_catalog.char_length(note) between 1 and 500
      )
    )
);

create table if not exists public.health_activity_session_items (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null,
  session_id uuid not null,
  catalog_version integer not null,
  item_key text not null,
  item_order smallint not null,
  item_label_snapshot text not null,
  tracking_mode_snapshot text not null,
  equipment_snapshot text not null,
  load_comparability_snapshot text not null,
  field_policy_snapshot jsonb not null,
  duration_min integer,
  distance_km numeric(6,2),
  note text,
  created_at timestamptz not null default pg_catalog.now(),
  constraint health_activity_session_items_session_item_key
    unique (session_id, item_key),
  constraint health_activity_session_items_session_order_key
    unique (session_id, item_order),
  constraint health_activity_session_items_id_user_key
    unique (id, user_id),
  constraint health_activity_session_items_id_user_mode_key
    unique (id, user_id, tracking_mode_snapshot),
  constraint health_activity_session_items_session_owner_fkey
    foreign key (session_id, user_id)
    references public.health_activity_sessions(id, user_id)
    on delete cascade,
  constraint health_activity_session_items_catalog_fkey
    foreign key (catalog_version, item_key, tracking_mode_snapshot)
    references public.health_activity_catalog_entries(
      catalog_version, item_key, tracking_mode
    ),
  constraint health_activity_session_items_order_check
    check (item_order between 1 and 50),
  constraint health_activity_session_items_label_check
    check (
      item_label_snapshot = pg_catalog.btrim(item_label_snapshot)
      and pg_catalog.char_length(item_label_snapshot) between 1 and 80
    ),
  constraint health_activity_session_items_tracking_mode_check
    check (tracking_mode_snapshot in (
      'duration', 'duration_distance', 'strength_sets'
    )),
  constraint health_activity_session_items_equipment_check
    check (equipment_snapshot in (
      'barbell', 'bodyweight', 'cable', 'cardio_machine', 'dumbbell',
      'kettlebell', 'machine', 'none', 'variable'
    )),
  constraint health_activity_session_items_load_comparability_check
    check (load_comparability_snapshot in (
      'device_relative', 'not_applicable', 'standardized'
    )),
  constraint health_activity_session_items_field_policy_check
    check (
      pg_catalog.jsonb_typeof(field_policy_snapshot) = 'object'
      and field_policy_snapshot ?& array[
        'assistance_kg', 'distance_km', 'distance_m', 'duration_min',
        'duration_sec', 'note', 'reps', 'weight_kg'
      ]::text[]
      and field_policy_snapshot - array[
        'assistance_kg', 'distance_km', 'distance_m', 'duration_min',
        'duration_sec', 'note', 'reps', 'weight_kg'
      ]::text[] = '{}'::jsonb
      and field_policy_snapshot ->> 'assistance_kg'
        in ('forbidden', 'optional', 'required')
      and field_policy_snapshot ->> 'distance_km'
        in ('forbidden', 'optional', 'required')
      and field_policy_snapshot ->> 'distance_m'
        in ('forbidden', 'optional', 'required')
      and field_policy_snapshot ->> 'duration_min'
        in ('forbidden', 'optional', 'required')
      and field_policy_snapshot ->> 'duration_sec'
        in ('forbidden', 'optional', 'required')
      and field_policy_snapshot ->> 'note'
        in ('forbidden', 'optional', 'required')
      and field_policy_snapshot ->> 'reps'
        in ('forbidden', 'optional', 'required')
      and field_policy_snapshot ->> 'weight_kg'
        in ('forbidden', 'optional', 'required')
    ),
  constraint health_activity_session_items_duration_check
    check (duration_min is null or duration_min between 1 and 1440),
  constraint health_activity_session_items_distance_check
    check (distance_km is null or distance_km between 0.01 and 1000.00),
  constraint health_activity_session_items_note_check
    check (
      note is null or (
        note = pg_catalog.btrim(note)
        and pg_catalog.char_length(note) between 1 and 500
      )
    ),
  constraint health_activity_session_items_mode_values_check
    check (
      (tracking_mode_snapshot = 'strength_sets'
        and duration_min is null and distance_km is null)
      or (tracking_mode_snapshot = 'duration'
        and duration_min is not null and distance_km is null)
      or (tracking_mode_snapshot = 'duration_distance'
        and duration_min is not null)
    )
);

create table if not exists public.health_activity_item_sets (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null,
  session_item_id uuid not null,
  set_order smallint not null,
  tracking_mode text not null default 'strength_sets',
  reps integer,
  duration_sec integer,
  distance_m numeric(7,2),
  weight_kg numeric(6,2),
  assistance_kg numeric(6,2),
  created_at timestamptz not null default pg_catalog.now(),
  constraint health_activity_item_sets_item_order_key
    unique (session_item_id, set_order),
  constraint health_activity_item_sets_item_owner_mode_fkey
    foreign key (session_item_id, user_id, tracking_mode)
    references public.health_activity_session_items(
      id, user_id, tracking_mode_snapshot
    )
    on delete cascade,
  constraint health_activity_item_sets_tracking_mode_check
    check (tracking_mode = 'strength_sets'),
  constraint health_activity_item_sets_order_check
    check (set_order between 1 and 50),
  constraint health_activity_item_sets_primary_value_check
    check (
      (case when reps is null then 0 else 1 end)
      + (case when duration_sec is null then 0 else 1 end)
      + (case when distance_m is null then 0 else 1 end) = 1
    ),
  constraint health_activity_item_sets_load_value_check
    check (not (weight_kg is not null and assistance_kg is not null)),
  constraint health_activity_item_sets_reps_check
    check (reps is null or reps between 1 and 1000),
  constraint health_activity_item_sets_duration_check
    check (duration_sec is null or duration_sec between 1 and 3600),
  constraint health_activity_item_sets_distance_check
    check (distance_m is null or distance_m between 0.10 and 10000.00),
  constraint health_activity_item_sets_weight_check
    check (weight_kg is null or weight_kg between 0.01 and 1000.00),
  constraint health_activity_item_sets_assistance_check
    check (assistance_kg is null or assistance_kg between 0.01 and 1000.00)
);

-- FK and query-path indexes. Unique constraints already cover the remaining
-- equality and ordered-child paths.
create index if not exists idx_health_activity_sessions_user_started
  on public.health_activity_sessions (user_id, started_at desc, id desc);

create index if not exists idx_health_activity_session_items_session_owner
  on public.health_activity_session_items (session_id, user_id);

create index if not exists idx_health_activity_session_items_last_performance
  on public.health_activity_session_items (user_id, item_key, session_id);

create index if not exists idx_health_activity_session_items_catalog_fkey
  on public.health_activity_session_items (
    catalog_version, item_key, tracking_mode_snapshot
  );

create index if not exists idx_health_activity_item_sets_owner_mode
  on public.health_activity_item_sets (
    session_item_id, user_id, tracking_mode
  );

-- ---------------------------------------------------------------------------
-- Exact R1 catalog v1 projection
-- ---------------------------------------------------------------------------

create temporary table midas_activity_v2_expected_catalog
on commit drop
as
select
  1::integer as catalog_version,
  x.key::text as item_key,
  x.label::text as label,
  x.aliases::text[] as aliases,
  x.status::text as status,
  x.category::text as category,
  x.equipment::text as equipment,
  x.muscle_groups::text[] as muscle_groups,
  x.sport_tags::text[] as sport_tags,
  x.tracking_mode::text as tracking_mode,
  x.load_comparability::text as load_comparability,
  x.fields::jsonb as field_policy
from pg_catalog.jsonb_to_recordset(
  $activity_catalog$[{"key":"ab_wheel_rollout","label":"Ab Wheel Rollout","aliases":["Bauchroller","Ab Roller"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},{"key":"assisted_dip","label":"Assisted Dip","aliases":["Unterstützte Dips","Dip Machine Assisted"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"required","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},{"key":"assisted_pull_up","label":"Assisted Pull-up","aliases":["Unterstützte Klimmzüge","Pull-up Machine Assisted"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"required","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["back","biceps","forearms"],"sport_tags":[],"status":"active"},{"key":"back_extension","label":"Back Extension","aliases":["Rückenstrecker","Hyperextension"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["back","core","glutes","hamstrings"],"sport_tags":[],"status":"active"},{"key":"battle_ropes","label":"Battle Ropes","aliases":["Battling Ropes","Seilwellen"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},{"key":"bench_press","label":"Bench Press","aliases":["Bankdrücken","Barbell Bench Press","Dumbbell Bench Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},{"key":"bent_over_row","label":"Bent-over Row","aliases":["Vorgebeugtes Rudern","Barbell Row","Dumbbell Row","T-Bar Row"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","biceps"],"sport_tags":[],"status":"active"},{"key":"biceps_curl","label":"Biceps Curl","aliases":["Bizepscurl","Arm Curl","Cable Curl","Dumbbell Curl","Hammer Curl","Preacher Curl"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["biceps","forearms"],"sport_tags":[],"status":"active"},{"key":"bird_dog","label":"Bird Dog","aliases":["Diagonaler Vierfüßlerstand"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["core","glutes"],"sport_tags":[],"status":"active"},{"key":"box_jump","label":"Box Jump","aliases":["Boxsprung"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["calves","glutes","quadriceps"],"sport_tags":[],"status":"active"},{"key":"burpee","label":"Burpee","aliases":["Burpees"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},{"key":"calf_raise","label":"Calf Raise","aliases":["Wadenheben","Calf Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["calves"],"sport_tags":[],"status":"active"},{"key":"chest_fly","label":"Chest Fly","aliases":["Butterfly","Brustfly","Cable Crossover","Pec Deck"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["chest","shoulders"],"sport_tags":[],"status":"active"},{"key":"chest_press","label":"Chest Press","aliases":["Brustpresse","Machine Chest Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},{"key":"clean","label":"Clean","aliases":["Umsetzen","Power Clean"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},{"key":"clean_and_press","label":"Clean and Press","aliases":["Umsetzen und Drücken"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},{"key":"core_press","label":"Core Press","aliases":["Abdominal Press","Bauchpresse"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},{"key":"cross_trainer","label":"Crosstrainer","aliases":["Ellipsentrainer","Elliptical"],"category":"endurance","tracking_mode":"duration","equipment":"cardio_machine","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor"],"status":"active"},{"key":"crunch","label":"Crunch","aliases":["Crunches","Bauchcrunch"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},{"key":"cycling","label":"Radfahren","aliases":["Fahrrad","Ergometer","Spinning","Stationary Bike"],"category":"endurance","tracking_mode":"duration_distance","equipment":"variable","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor","outdoor"],"status":"active"},{"key":"dead_bug","label":"Dead Bug","aliases":["Käferübung"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},{"key":"dead_hang","label":"Dead Hang","aliases":["Hängen an der Stange","Passive Hang"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"optional"},"muscle_groups":["back","forearms"],"sport_tags":[],"status":"active"},{"key":"deadlift","label":"Deadlift","aliases":["Kreuzheben","Conventional Deadlift","Sumo Deadlift"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","glutes","hamstrings"],"sport_tags":[],"status":"active"},{"key":"decline_press","label":"Decline Press","aliases":["Negativbankdrücken","Decline Bench Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},{"key":"dip","label":"Dip","aliases":["Dips","Barrenstütz"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},{"key":"face_pull","label":"Face Pull","aliases":["Face Pulls","Seilzug zum Gesicht"],"category":"strength","tracking_mode":"strength_sets","equipment":"cable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","shoulders"],"sport_tags":[],"status":"active"},{"key":"farmer_carry","label":"Farmer Carry","aliases":["Farmers Walk","Koffertragen"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"required","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"required"},"muscle_groups":["forearms","full_body"],"sport_tags":[],"status":"active"},{"key":"football","label":"Fußball","aliases":["Hallenfußball","Soccer"],"category":"sport","tracking_mode":"duration","equipment":"none","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["indoor","outdoor","team_sport"],"status":"active"},{"key":"front_raise","label":"Front Raise","aliases":["Frontheben"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["shoulders"],"sport_tags":[],"status":"active"},{"key":"glute_bridge","label":"Glute Bridge","aliases":["Beckenheben","Hüftbrücke"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core","glutes","hamstrings"],"sport_tags":[],"status":"active"},{"key":"glute_kickback","label":"Glute Kickback","aliases":["Kickbacks","Bein nach hinten"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["glutes"],"sport_tags":[],"status":"active"},{"key":"good_morning","label":"Good Morning","aliases":["Good Mornings"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","glutes","hamstrings"],"sport_tags":[],"status":"active"},{"key":"hack_squat","label":"Hack Squat","aliases":["Hackenschmidt-Kniebeuge","Hackenschmidt"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["glutes","quadriceps"],"sport_tags":[],"status":"active"},{"key":"hiking","label":"Wandern","aliases":["Trekking"],"category":"sport","tracking_mode":"duration_distance","equipment":"none","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","outdoor"],"status":"active"},{"key":"hip_abduction","label":"Hip Abduction","aliases":["Abduktorenmaschine","Hüftabduktion"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["glutes"],"sport_tags":[],"status":"active"},{"key":"hip_adduction","label":"Hip Adduction","aliases":["Adduktorenmaschine","Hüftadduktion"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["adductors"],"sport_tags":[],"status":"active"},{"key":"hip_thrust","label":"Hip Thrust","aliases":["Hüftstoß"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["glutes","hamstrings"],"sport_tags":[],"status":"active"},{"key":"incline_press","label":"Incline Press","aliases":["Schrägbankdrücken","Incline Bench Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},{"key":"jump_rope","label":"Jump Rope","aliases":["Seilspringen","Rope Skipping"],"category":"endurance","tracking_mode":"duration","equipment":"none","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor","outdoor"],"status":"active"},{"key":"kettlebell_swing","label":"Kettlebell Swing","aliases":["Kugelhantel Swing"],"category":"strength","tracking_mode":"strength_sets","equipment":"kettlebell","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},{"key":"lat_pulldown","label":"Lat Pulldown","aliases":["Latzug","Wide Grip Lat Pull Down","Close Grip Lat Pulldown"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","biceps"],"sport_tags":[],"status":"active"},{"key":"lateral_raise","label":"Lateral Raise","aliases":["Seitheben"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["shoulders"],"sport_tags":[],"status":"active"},{"key":"leg_curl","label":"Leg Curl","aliases":["Beinbeuger","Seated Leg Curl","Lying Leg Curl"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["hamstrings"],"sport_tags":[],"status":"active"},{"key":"leg_extension","label":"Leg Extension","aliases":["Beinstrecker","Leg Extensions"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["quadriceps"],"sport_tags":[],"status":"active"},{"key":"leg_press","label":"Leg Press","aliases":["Beinpresse"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["glutes","hamstrings","quadriceps"],"sport_tags":[],"status":"active"},{"key":"leg_raise","label":"Leg Raise","aliases":["Beinheben","Hanging Leg Raise","Lying Leg Raise"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core","hip_flexors"],"sport_tags":[],"status":"active"},{"key":"lunge","label":"Lunge","aliases":["Ausfallschritt","Walking Lunge"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["glutes","hamstrings","quadriceps"],"sport_tags":[],"status":"active"},{"key":"mountain_climber","label":"Mountain Climber","aliases":["Bergsteiger"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":["core","full_body"],"sport_tags":[],"status":"active"},{"key":"pallof_press","label":"Pallof Press","aliases":["Anti-Rotation Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"cable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},{"key":"plank","label":"Plank","aliases":["Unterarmstütz"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},{"key":"pull_up","label":"Pull-up","aliases":["Klimmzug","Chin-up","Wide Grip Pull-up"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["back","biceps","forearms"],"sport_tags":[],"status":"active"},{"key":"pullover","label":"Pullover","aliases":["Überzug"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","chest"],"sport_tags":[],"status":"active"},{"key":"push_up","label":"Push-up","aliases":["Liegestütz","Push-ups"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},{"key":"reverse_fly","label":"Reverse Fly","aliases":["Reverse Butterfly","Vorgebeugtes Seitheben"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","shoulders"],"sport_tags":[],"status":"active"},{"key":"romanian_deadlift","label":"Romanian Deadlift","aliases":["Rumänisches Kreuzheben","RDL","Stiff-leg Deadlift"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","glutes","hamstrings"],"sport_tags":[],"status":"active"},{"key":"rowing","label":"Rudern","aliases":["Ruderergometer","Rowing Machine"],"category":"endurance","tracking_mode":"duration_distance","equipment":"cardio_machine","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor"],"status":"active"},{"key":"running","label":"Laufen","aliases":["Joggen","Laufband Laufen","Treadmill Running"],"category":"endurance","tracking_mode":"duration_distance","equipment":"variable","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor","outdoor"],"status":"active"},{"key":"russian_twist","label":"Russian Twist","aliases":["Rumpfdrehen sitzend"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},{"key":"seated_row","label":"Seated Row","aliases":["Rudern sitzend","Seated Cable Row","Cable Row","Chest-supported Row"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","biceps"],"sport_tags":[],"status":"active"},{"key":"shoulder_press","label":"Shoulder Press","aliases":["Schulterpresse","Overhead Press","Military Press","Arnold Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["shoulders","triceps"],"sport_tags":[],"status":"active"},{"key":"shrug","label":"Shrug","aliases":["Schulterheben","Shrugs"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","forearms"],"sport_tags":[],"status":"active"},{"key":"side_plank","label":"Side Plank","aliases":["Seitstütz"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},{"key":"sit_up","label":"Sit-up","aliases":["Sit-ups","Rumpfaufrichten"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core","hip_flexors"],"sport_tags":[],"status":"active"},{"key":"ski_erg","label":"SkiErg","aliases":["Skiergometer","Ski Ergometer"],"category":"endurance","tracking_mode":"duration_distance","equipment":"cardio_machine","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor"],"status":"active"},{"key":"sled_pull","label":"Sled Pull","aliases":["Schlitten ziehen"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"required","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"optional"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},{"key":"sled_push","label":"Sled Push","aliases":["Schlitten schieben"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"required","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"optional"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},{"key":"snatch","label":"Snatch","aliases":["Reißen","Power Snatch"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},{"key":"split_squat","label":"Split Squat","aliases":["Bulgarische Kniebeuge","Bulgarian Split Squat"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["glutes","hamstrings","quadriceps"],"sport_tags":[],"status":"active"},{"key":"squat","label":"Squat","aliases":["Kniebeuge","Back Squat","Front Squat","Goblet Squat"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["glutes","hamstrings","quadriceps"],"sport_tags":[],"status":"active"},{"key":"stair_climber","label":"Stair Climber","aliases":["Treppensteiger","Stairmaster"],"category":"endurance","tracking_mode":"duration","equipment":"cardio_machine","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor"],"status":"active"},{"key":"step_up","label":"Step-up","aliases":["Aufsteigen","Box Step-up"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["glutes","hamstrings","quadriceps"],"sport_tags":[],"status":"active"},{"key":"straight_arm_pulldown","label":"Straight-arm Pulldown","aliases":["Latzug mit gestreckten Armen"],"category":"strength","tracking_mode":"strength_sets","equipment":"cable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back"],"sport_tags":[],"status":"active"},{"key":"swimming","label":"Schwimmen","aliases":["Swim"],"category":"sport","tracking_mode":"duration_distance","equipment":"none","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","water_sport"],"status":"active"},{"key":"torso_rotation","label":"Torso Rotation","aliases":["Rumpfrotation","Rotary Torso"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},{"key":"triceps_extension","label":"Triceps Extension","aliases":["Trizepsdrücken","Triceps Pushdown","Overhead Triceps Extension"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["triceps"],"sport_tags":[],"status":"active"},{"key":"upright_row","label":"Upright Row","aliases":["Aufrechtes Rudern"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","biceps","shoulders"],"sport_tags":[],"status":"active"},{"key":"walking","label":"Gehen","aliases":["Spazieren","Laufband Gehen","Treadmill Walking"],"category":"endurance","tracking_mode":"duration_distance","equipment":"variable","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor","outdoor"],"status":"active"},{"key":"wall_sit","label":"Wall Sit","aliases":["Wandsitzen"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":["glutes","quadriceps"],"sport_tags":[],"status":"active"}]$activity_catalog$::jsonb
) as x(
  key text,
  label text,
  aliases text[],
  status text,
  category text,
  equipment text,
  muscle_groups text[],
  sport_tags text[],
  tracking_mode text,
  load_comparability text,
  fields jsonb
);

do $$
begin
  if (select pg_catalog.count(*) from midas_activity_v2_expected_catalog) <> 78
     or exists (
       select 1
         from midas_activity_v2_expected_catalog
        where catalog_version <> 1 or status <> 'active'
     ) then
    raise exception 'Activity V2 embedded catalog must contain 78 active v1 rows';
  end if;
end;
$$;

insert into public.health_activity_catalog_entries (
  catalog_version,
  item_key,
  label,
  aliases,
  status,
  category,
  equipment,
  muscle_groups,
  sport_tags,
  tracking_mode,
  load_comparability,
  field_policy
)
select
  e.catalog_version,
  e.item_key,
  e.label,
  e.aliases,
  e.status,
  e.category,
  e.equipment,
  e.muscle_groups,
  e.sport_tags,
  e.tracking_mode,
  e.load_comparability,
  e.field_policy
from midas_activity_v2_expected_catalog e
order by e.item_key
on conflict (catalog_version, item_key) do nothing;

do $$
begin
  if exists (
    (
      select * from midas_activity_v2_expected_catalog
      except
      select
        c.catalog_version,
        c.item_key,
        c.label,
        c.aliases,
        c.status,
        c.category,
        c.equipment,
        c.muscle_groups,
        c.sport_tags,
        c.tracking_mode,
        c.load_comparability,
        c.field_policy
      from public.health_activity_catalog_entries c
      where c.catalog_version = 1
    )
    union all
    (
      select
        c.catalog_version,
        c.item_key,
        c.label,
        c.aliases,
        c.status,
        c.category,
        c.equipment,
        c.muscle_groups,
        c.sport_tags,
        c.tracking_mode,
        c.load_comparability,
        c.field_policy
      from public.health_activity_catalog_entries c
      where c.catalog_version = 1
      except
      select * from midas_activity_v2_expected_catalog
    )
  ) then
    raise exception 'Activity V2 catalog v1 drift detected';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS: read-only owner history; no browser mutation policy
-- ---------------------------------------------------------------------------

alter table public.health_activity_catalog_entries enable row level security;
alter table public.health_activity_sessions enable row level security;
alter table public.health_activity_session_items enable row level security;
alter table public.health_activity_item_sets enable row level security;

drop policy if exists health_activity_catalog_select_authenticated
  on public.health_activity_catalog_entries;
create policy health_activity_catalog_select_authenticated
  on public.health_activity_catalog_entries
  for select
  to authenticated
  using (true);

drop policy if exists health_activity_sessions_select_own
  on public.health_activity_sessions;
create policy health_activity_sessions_select_own
  on public.health_activity_sessions
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (((select auth.jwt()) ->> 'is_anonymous')::boolean is false)
  );

drop policy if exists health_activity_session_items_select_own
  on public.health_activity_session_items;
create policy health_activity_session_items_select_own
  on public.health_activity_session_items
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (((select auth.jwt()) ->> 'is_anonymous')::boolean is false)
  );

drop policy if exists health_activity_item_sets_select_own
  on public.health_activity_item_sets;
create policy health_activity_item_sets_select_own
  on public.health_activity_item_sets
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (((select auth.jwt()) ->> 'is_anonymous')::boolean is false)
  );

-- ---------------------------------------------------------------------------
-- Atomic, retry-safe commit RPC
-- ---------------------------------------------------------------------------

create or replace function public.activity_v2_commit_session(
  p_request_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_started_at timestamptz;
  v_ended_at timestamptz;
  v_duration_min integer;
  v_title text;
  v_note text;
  v_client_catalog_version integer;
  v_current_catalog_version integer;
  v_canonical_payload jsonb;
  v_canonical_items jsonb := '[]'::jsonb;
  v_canonical_sets jsonb;
  v_canonical_set jsonb;
  v_item jsonb;
  v_set jsonb;
  v_item_count integer;
  v_set_count integer;
  v_item_order integer;
  v_set_order integer;
  v_item_orders integer[] := array[]::integer[];
  v_set_orders integer[];
  v_item_keys text[] := array[]::text[];
  v_item_key text;
  v_number numeric;
  v_item_duration integer;
  v_distance_km numeric(6,2);
  v_item_note text;
  v_reps integer;
  v_duration_sec integer;
  v_distance_m numeric(7,2);
  v_weight_kg numeric(6,2);
  v_assistance_kg numeric(6,2);
  v_fingerprint text;
  v_existing_fingerprint text;
  v_session_id uuid;
  v_session_item_id uuid;
  v_outcome text;
  v_tracking_mode text;
  v_label text;
  v_equipment text;
  v_load_comparability text;
  v_field_policy jsonb;
  v_field text;
  v_rule text;
  v_value_text text;
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_request_id is null then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload) <> 'object' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  if not (p_payload ?& array[
    'schema_version', 'catalog_version', 'started_at', 'ended_at',
    'duration_min', 'items'
  ]::text[])
  or p_payload - array[
    'schema_version', 'catalog_version', 'started_at', 'ended_at',
    'duration_min', 'title', 'note', 'items'
  ]::text[] <> '{}'::jsonb then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'schema_version') <> 'string'
     or p_payload ->> 'schema_version' <> 'midas.activity-session.v1' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'catalog_version') <> 'number' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_number := (p_payload ->> 'catalog_version')::numeric;
  if v_number <> pg_catalog.trunc(v_number)
     or v_number < 1 or v_number > 2147483647 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_client_catalog_version := v_number::integer;

  if pg_catalog.jsonb_typeof(p_payload -> 'started_at') <> 'string'
     or pg_catalog.jsonb_typeof(p_payload -> 'ended_at') <> 'string'
     or (p_payload ->> 'started_at') !~
       '^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt ][0-9]{2}:[0-9]{2}(:[0-9]{2}(\.[0-9]+)?)?([Zz]|[+-][0-9]{2}:[0-9]{2})$'
     or (p_payload ->> 'ended_at') !~
       '^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt ][0-9]{2}:[0-9]{2}(:[0-9]{2}(\.[0-9]+)?)?([Zz]|[+-][0-9]{2}:[0-9]{2})$' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  begin
    v_started_at := (p_payload ->> 'started_at')::timestamptz;
    v_ended_at := (p_payload ->> 'ended_at')::timestamptz;
  exception when others then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end;
  if v_ended_at < v_started_at then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'duration_min') <> 'number' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_number := (p_payload ->> 'duration_min')::numeric;
  if v_number <> pg_catalog.trunc(v_number)
     or v_number < 1 or v_number > 1440 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_duration_min := v_number::integer;

  if not (p_payload ? 'title') or p_payload -> 'title' = 'null'::jsonb then
    v_title := null;
  elsif pg_catalog.jsonb_typeof(p_payload -> 'title') = 'string' then
    v_title := pg_catalog.btrim(p_payload ->> 'title');
    if v_title = '' then v_title := null; end if;
    if v_title is not null and pg_catalog.char_length(v_title) > 120 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  else
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if not (p_payload ? 'note') or p_payload -> 'note' = 'null'::jsonb then
    v_note := null;
  elsif pg_catalog.jsonb_typeof(p_payload -> 'note') = 'string' then
    v_note := pg_catalog.btrim(p_payload ->> 'note');
    if v_note = '' then v_note := null; end if;
    if v_note is not null and pg_catalog.char_length(v_note) > 500 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  else
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_payload -> 'items') <> 'array' then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;
  v_item_count := pg_catalog.jsonb_array_length(p_payload -> 'items');
  if v_item_count < 1 or v_item_count > 50 then
    raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
  end if;

  for v_item in
    select e.value from pg_catalog.jsonb_array_elements(p_payload -> 'items') e(value)
  loop
    if pg_catalog.jsonb_typeof(v_item) <> 'object'
       or not (v_item ?& array['item_key', 'item_order', 'sets']::text[])
       or v_item - array[
         'item_key', 'item_order', 'duration_min', 'distance_km', 'note', 'sets'
       ]::text[] <> '{}'::jsonb then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    if pg_catalog.jsonb_typeof(v_item -> 'item_key') <> 'string' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_key := v_item ->> 'item_key';
    if pg_catalog.char_length(v_item_key) not between 1 and 64
       or v_item_key !~ '^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$'
       or v_item_key = any (v_item_keys) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_keys := pg_catalog.array_append(v_item_keys, v_item_key);

    if pg_catalog.jsonb_typeof(v_item -> 'item_order') <> 'number' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_number := (v_item ->> 'item_order')::numeric;
    if v_number <> pg_catalog.trunc(v_number)
       or v_number < 1 or v_number > 50 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_order := v_number::integer;
    if v_item_order = any (v_item_orders) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_item_orders := pg_catalog.array_append(v_item_orders, v_item_order);

    v_item_duration := null;
    if v_item ? 'duration_min' and v_item -> 'duration_min' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'duration_min') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_item ->> 'duration_min')::numeric;
      if v_number <> pg_catalog.trunc(v_number)
         or v_number < 1 or v_number > 1440 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_item_duration := v_number::integer;
    end if;

    v_distance_km := null;
    if v_item ? 'distance_km' and v_item -> 'distance_km' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'distance_km') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_item ->> 'distance_km')::numeric;
      if v_number <> pg_catalog.round(v_number, 2)
         or v_number < 0.01 or v_number > 1000.00 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_distance_km := v_number::numeric(6,2);
    end if;

    v_item_note := null;
    if v_item ? 'note' and v_item -> 'note' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(v_item -> 'note') <> 'string' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_item_note := pg_catalog.btrim(v_item ->> 'note');
      if v_item_note = '' then v_item_note := null; end if;
      if v_item_note is not null and pg_catalog.char_length(v_item_note) > 500 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
    end if;

    if pg_catalog.jsonb_typeof(v_item -> 'sets') <> 'array' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_set_count := pg_catalog.jsonb_array_length(v_item -> 'sets');
    if v_set_count > 50 then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
    v_set_orders := array[]::integer[];
    v_canonical_sets := '[]'::jsonb;

    for v_set in
      select e.value from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
    loop
      if pg_catalog.jsonb_typeof(v_set) <> 'object'
         or not (v_set ? 'set_order')
         or v_set - array[
           'set_order', 'reps', 'duration_sec', 'distance_m',
           'weight_kg', 'assistance_kg'
         ]::text[] <> '{}'::jsonb then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      if pg_catalog.jsonb_typeof(v_set -> 'set_order') <> 'number' then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_number := (v_set ->> 'set_order')::numeric;
      if v_number <> pg_catalog.trunc(v_number)
         or v_number < 1 or v_number > 50 then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_set_order := v_number::integer;
      if v_set_order = any (v_set_orders) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;
      v_set_orders := pg_catalog.array_append(v_set_orders, v_set_order);

      v_reps := null;
      if v_set ? 'reps' and v_set -> 'reps' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'reps') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'reps')::numeric;
        if v_number <> pg_catalog.trunc(v_number)
           or v_number < 1 or v_number > 1000 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_reps := v_number::integer;
      end if;

      v_duration_sec := null;
      if v_set ? 'duration_sec' and v_set -> 'duration_sec' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'duration_sec') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'duration_sec')::numeric;
        if v_number <> pg_catalog.trunc(v_number)
           or v_number < 1 or v_number > 3600 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_duration_sec := v_number::integer;
      end if;

      v_distance_m := null;
      if v_set ? 'distance_m' and v_set -> 'distance_m' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'distance_m') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'distance_m')::numeric;
        if v_number <> pg_catalog.round(v_number, 2)
           or v_number < 0.10 or v_number > 10000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_distance_m := v_number::numeric(7,2);
      end if;

      v_weight_kg := null;
      if v_set ? 'weight_kg' and v_set -> 'weight_kg' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'weight_kg') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'weight_kg')::numeric;
        if v_number <> pg_catalog.round(v_number, 2)
           or v_number < 0.01 or v_number > 1000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_weight_kg := v_number::numeric(6,2);
      end if;

      v_assistance_kg := null;
      if v_set ? 'assistance_kg'
         and v_set -> 'assistance_kg' <> 'null'::jsonb then
        if pg_catalog.jsonb_typeof(v_set -> 'assistance_kg') <> 'number' then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_number := (v_set ->> 'assistance_kg')::numeric;
        if v_number <> pg_catalog.round(v_number, 2)
           or v_number < 0.01 or v_number > 1000.00 then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
        v_assistance_kg := v_number::numeric(6,2);
      end if;

      if (case when v_reps is null then 0 else 1 end)
         + (case when v_duration_sec is null then 0 else 1 end)
         + (case when v_distance_m is null then 0 else 1 end) <> 1
         or (v_weight_kg is not null and v_assistance_kg is not null) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      v_canonical_set := pg_catalog.jsonb_build_object(
        'set_order', v_set_order,
        'reps', v_reps,
        'duration_sec', v_duration_sec,
        'distance_m', v_distance_m,
        'weight_kg', v_weight_kg,
        'assistance_kg', v_assistance_kg
      );
      v_canonical_sets := v_canonical_sets
        || pg_catalog.jsonb_build_array(v_canonical_set);
    end loop;

    if v_set_count > 0 then
      for v_index in 1..v_set_count loop
        if not (v_index = any (v_set_orders)) then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
      end loop;
      select pg_catalog.jsonb_agg(e.value order by (e.value ->> 'set_order')::integer)
        into v_canonical_sets
        from pg_catalog.jsonb_array_elements(v_canonical_sets) e(value);
    end if;

    v_canonical_items := v_canonical_items || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'item_key', v_item_key,
        'item_order', v_item_order,
        'duration_min', v_item_duration,
        'distance_km', v_distance_km,
        'note', v_item_note,
        'sets', v_canonical_sets
      )
    );
  end loop;

  for v_index in 1..v_item_count loop
    if not (v_index = any (v_item_orders)) then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;
  end loop;
  select pg_catalog.jsonb_agg(e.value order by (e.value ->> 'item_order')::integer)
    into v_canonical_items
    from pg_catalog.jsonb_array_elements(v_canonical_items) e(value);

  v_canonical_payload := pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session.v1',
    'catalog_version', v_client_catalog_version,
    'started_at', pg_catalog.to_char(
      pg_catalog.timezone('UTC', v_started_at),
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
    ),
    'ended_at', pg_catalog.to_char(
      pg_catalog.timezone('UTC', v_ended_at),
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
    ),
    'duration_min', v_duration_min,
    'title', v_title,
    'note', v_note,
    'items', v_canonical_items
  );
  v_fingerprint := pg_catalog.encode(
    extensions.digest(
      pg_catalog.convert_to(v_canonical_payload::text, 'UTF8'),
      'sha256'
    ),
    'hex'
  );

  select s.id, s.request_fingerprint
    into v_session_id, v_existing_fingerprint
    from public.health_activity_sessions s
   where s.user_id = v_user and s.request_id = p_request_id;

  if found then
    if v_existing_fingerprint <> v_fingerprint then
      raise exception 'MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT'
        using errcode = '22023';
    end if;
    v_outcome := 'replayed';
  else
    if v_ended_at > v_now + interval '5 minutes' then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    select pg_catalog.max(c.catalog_version)
      into v_current_catalog_version
      from public.health_activity_catalog_entries c;
    if v_current_catalog_version is null
       or v_client_catalog_version <> v_current_catalog_version then
      raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
    end if;

    for v_item in
      select e.value
        from pg_catalog.jsonb_array_elements(v_canonical_items) e(value)
       order by (e.value ->> 'item_order')::integer
    loop
      v_item_key := v_item ->> 'item_key';
      select
        c.label,
        c.tracking_mode,
        c.equipment,
        c.load_comparability,
        c.field_policy
        into
          v_label,
          v_tracking_mode,
          v_equipment,
          v_load_comparability,
          v_field_policy
        from public.health_activity_catalog_entries c
       where c.catalog_version = v_current_catalog_version
         and c.item_key = v_item_key
         and c.status = 'active';
      if not found then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      v_set_count := pg_catalog.jsonb_array_length(v_item -> 'sets');
      if (v_tracking_mode = 'strength_sets' and v_set_count < 1)
         or (v_tracking_mode <> 'strength_sets' and v_set_count <> 0) then
        raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
      end if;

      foreach v_field in array array['duration_min', 'distance_km', 'note']::text[]
      loop
        v_rule := v_field_policy ->> v_field;
        v_value_text := v_item ->> v_field;
        if (v_rule = 'required' and v_value_text is null)
           or (v_rule = 'forbidden' and v_value_text is not null) then
          raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
        end if;
      end loop;

      for v_set in
        select e.value from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
      loop
        foreach v_field in array array[
          'reps', 'duration_sec', 'distance_m', 'weight_kg', 'assistance_kg'
        ]::text[]
        loop
          v_rule := v_field_policy ->> v_field;
          v_value_text := v_set ->> v_field;
          if (v_rule = 'required' and v_value_text is null)
             or (v_rule = 'forbidden' and v_value_text is not null) then
            raise exception 'MIDAS_ACTIVITY_INVALID_SESSION' using errcode = '22023';
          end if;
        end loop;
      end loop;
    end loop;

    v_session_id := null;
    insert into public.health_activity_sessions (
      user_id,
      request_id,
      request_fingerprint,
      started_at,
      ended_at,
      duration_min,
      title,
      note
    ) values (
      v_user,
      p_request_id,
      v_fingerprint,
      v_started_at,
      v_ended_at,
      v_duration_min,
      v_title,
      v_note
    )
    on conflict (user_id, request_id) do nothing
    returning id into v_session_id;

    if v_session_id is null then
      select s.id, s.request_fingerprint
        into strict v_session_id, v_existing_fingerprint
        from public.health_activity_sessions s
       where s.user_id = v_user and s.request_id = p_request_id;
      if v_existing_fingerprint <> v_fingerprint then
        raise exception 'MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT'
          using errcode = '22023';
      end if;
      v_outcome := 'replayed';
    else
      v_outcome := 'created';
      for v_item in
        select e.value
          from pg_catalog.jsonb_array_elements(v_canonical_items) e(value)
         order by (e.value ->> 'item_order')::integer
      loop
        v_item_key := v_item ->> 'item_key';
        select
          c.label,
          c.tracking_mode,
          c.equipment,
          c.load_comparability,
          c.field_policy
          into strict
            v_label,
            v_tracking_mode,
            v_equipment,
            v_load_comparability,
            v_field_policy
          from public.health_activity_catalog_entries c
         where c.catalog_version = v_current_catalog_version
           and c.item_key = v_item_key
           and c.status = 'active';

        insert into public.health_activity_session_items (
          user_id,
          session_id,
          catalog_version,
          item_key,
          item_order,
          item_label_snapshot,
          tracking_mode_snapshot,
          equipment_snapshot,
          load_comparability_snapshot,
          field_policy_snapshot,
          duration_min,
          distance_km,
          note
        ) values (
          v_user,
          v_session_id,
          v_current_catalog_version,
          v_item_key,
          (v_item ->> 'item_order')::smallint,
          v_label,
          v_tracking_mode,
          v_equipment,
          v_load_comparability,
          v_field_policy,
          (v_item ->> 'duration_min')::integer,
          (v_item ->> 'distance_km')::numeric(6,2),
          v_item ->> 'note'
        )
        returning id into v_session_item_id;

        for v_set in
          select e.value
            from pg_catalog.jsonb_array_elements(v_item -> 'sets') e(value)
           order by (e.value ->> 'set_order')::integer
        loop
          insert into public.health_activity_item_sets (
            user_id,
            session_item_id,
            set_order,
            tracking_mode,
            reps,
            duration_sec,
            distance_m,
            weight_kg,
            assistance_kg
          ) values (
            v_user,
            v_session_item_id,
            (v_set ->> 'set_order')::smallint,
            'strength_sets',
            (v_set ->> 'reps')::integer,
            (v_set ->> 'duration_sec')::integer,
            (v_set ->> 'distance_m')::numeric(7,2),
            (v_set ->> 'weight_kg')::numeric(6,2),
            (v_set ->> 'assistance_kg')::numeric(6,2)
          );
        end loop;
      end loop;
    end if;
  end if;

  select pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-session-result.v1',
    'outcome', v_outcome,
    'session', pg_catalog.jsonb_build_object(
      'id', s.id,
      'request_id', s.request_id,
      'started_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.started_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'ended_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.ended_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'day', s.day,
      'duration_min', s.duration_min,
      'title', s.title,
      'note', s.note,
      'created_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.created_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'updated_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.updated_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'items', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'id', i.id,
            'catalog_version', i.catalog_version,
            'item_key', i.item_key,
            'item_order', i.item_order,
            'item_label_snapshot', i.item_label_snapshot,
            'tracking_mode_snapshot', i.tracking_mode_snapshot,
            'equipment_snapshot', i.equipment_snapshot,
            'load_comparability_snapshot', i.load_comparability_snapshot,
            'field_policy_snapshot', i.field_policy_snapshot,
            'duration_min', i.duration_min,
            'distance_km', i.distance_km,
            'note', i.note,
            'created_at', pg_catalog.to_char(
              pg_catalog.timezone('UTC', i.created_at),
              'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
            ),
            'sets', coalesce((
              select pg_catalog.jsonb_agg(
                pg_catalog.jsonb_build_object(
                  'id', st.id,
                  'set_order', st.set_order,
                  'tracking_mode', st.tracking_mode,
                  'reps', st.reps,
                  'duration_sec', st.duration_sec,
                  'distance_m', st.distance_m,
                  'weight_kg', st.weight_kg,
                  'assistance_kg', st.assistance_kg,
                  'created_at', pg_catalog.to_char(
                    pg_catalog.timezone('UTC', st.created_at),
                    'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
                  )
                ) order by st.set_order
              )
              from public.health_activity_item_sets st
              where st.session_item_id = i.id and st.user_id = v_user
            ), '[]'::jsonb)
          ) order by i.item_order
        )
        from public.health_activity_session_items i
        where i.session_id = s.id and i.user_id = v_user
      ), '[]'::jsonb)
    )
  )
    into strict v_result
    from public.health_activity_sessions s
   where s.id = v_session_id and s.user_id = v_user;

  return v_result;
end;
$$;

alter function public.activity_v2_commit_session(uuid, jsonb)
  owner to postgres;

create or replace function public.activity_v2_last_performance(
  p_item_key text
)
returns jsonb
language plpgsql
security invoker
stable
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_item_key text;
  v_item_id uuid;
  v_session_id uuid;
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not (((auth.jwt() ->> 'is_anonymous')::boolean) is false) then
    raise exception 'MIDAS_ACTIVITY_AUTH_REQUIRED' using errcode = '42501';
  end if;

  v_item_key := pg_catalog.btrim(p_item_key);
  if v_item_key is null
     or pg_catalog.char_length(v_item_key) not between 1 and 64
     or v_item_key !~ '^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$'
     or not exists (
       select 1
         from public.health_activity_catalog_entries c
        where c.item_key = v_item_key
     ) then
    raise exception 'MIDAS_ACTIVITY_INVALID_ITEM_KEY' using errcode = '22023';
  end if;

  select i.id, s.id
    into v_item_id, v_session_id
    from public.health_activity_session_items i
    join public.health_activity_sessions s
      on s.id = i.session_id
     and s.user_id = i.user_id
   where i.user_id = v_user
     and s.user_id = v_user
     and i.item_key = v_item_key
   order by s.started_at desc, s.id desc
   limit 1;

  if not found then
    return null;
  end if;

  select pg_catalog.jsonb_build_object(
    'schema_version', 'midas.activity-last-performance.v1',
    'session', pg_catalog.jsonb_build_object(
      'id', s.id,
      'started_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', s.started_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'day', s.day
    ),
    'item', pg_catalog.jsonb_build_object(
      'id', i.id,
      'catalog_version', i.catalog_version,
      'item_key', i.item_key,
      'item_order', i.item_order,
      'item_label_snapshot', i.item_label_snapshot,
      'tracking_mode_snapshot', i.tracking_mode_snapshot,
      'equipment_snapshot', i.equipment_snapshot,
      'load_comparability_snapshot', i.load_comparability_snapshot,
      'field_policy_snapshot', i.field_policy_snapshot,
      'duration_min', i.duration_min,
      'distance_km', i.distance_km,
      'note', i.note,
      'created_at', pg_catalog.to_char(
        pg_catalog.timezone('UTC', i.created_at),
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ),
      'sets', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'id', st.id,
            'set_order', st.set_order,
            'tracking_mode', st.tracking_mode,
            'reps', st.reps,
            'duration_sec', st.duration_sec,
            'distance_m', st.distance_m,
            'weight_kg', st.weight_kg,
            'assistance_kg', st.assistance_kg,
            'created_at', pg_catalog.to_char(
              pg_catalog.timezone('UTC', st.created_at),
              'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
            )
          ) order by st.set_order
        )
          from public.health_activity_item_sets st
         where st.session_item_id = i.id
           and st.user_id = v_user
      ), '[]'::jsonb)
    )
  )
    into strict v_result
    from public.health_activity_session_items i
    join public.health_activity_sessions s
      on s.id = i.session_id
     and s.user_id = i.user_id
   where i.id = v_item_id
     and i.user_id = v_user
     and s.id = v_session_id
     and s.user_id = v_user;

  return v_result;
end;
$$;

alter function public.activity_v2_last_performance(text)
  owner to postgres;

-- Fail closed in the creation transaction. sql/16_Explicit_Grants.sql is the
-- canonical grant source and deliberately re-opens only the reviewed reads
-- and authenticated RPC execution after this file committed successfully.
revoke all on table public.health_activity_catalog_entries
  from anon, public, authenticated, service_role;
revoke all on table public.health_activity_sessions
  from anon, public, authenticated, service_role;
revoke all on table public.health_activity_session_items
  from anon, public, authenticated, service_role;
revoke all on table public.health_activity_item_sets
  from anon, public, authenticated, service_role;

revoke all on function public.activity_v2_commit_session(uuid, jsonb)
  from anon, public, authenticated, service_role;
revoke all on function public.activity_v2_last_performance(text)
  from anon, public, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Canonical-state postconditions for both first execution and safe re-run
-- ---------------------------------------------------------------------------

do $$
declare
  v_expected record;
  v_actual jsonb;
  v_structure_fingerprint text;
begin
  for v_expected in
    select *
      from pg_catalog.jsonb_to_recordset($columns$[
        {
          "table_name": "health_activity_catalog_entries",
          "columns": [
            ["catalog_version", "integer", true, ""],
            ["item_key", "text", true, ""],
            ["label", "text", true, ""],
            ["aliases", "text[]", true, ""],
            ["status", "text", true, ""],
            ["category", "text", true, ""],
            ["equipment", "text", true, ""],
            ["muscle_groups", "text[]", true, ""],
            ["sport_tags", "text[]", true, ""],
            ["tracking_mode", "text", true, ""],
            ["load_comparability", "text", true, ""],
            ["field_policy", "jsonb", true, ""]
          ]
        },
        {
          "table_name": "health_activity_sessions",
          "columns": [
            ["id", "uuid", true, ""],
            ["user_id", "uuid", true, ""],
            ["request_id", "uuid", true, ""],
            ["request_fingerprint", "text", true, ""],
            ["started_at", "timestamp with time zone", true, ""],
            ["ended_at", "timestamp with time zone", true, ""],
            ["duration_min", "integer", true, ""],
            ["day", "date", false, "s"],
            ["title", "text", false, ""],
            ["note", "text", false, ""],
            ["created_at", "timestamp with time zone", true, ""],
            ["updated_at", "timestamp with time zone", true, ""]
          ]
        },
        {
          "table_name": "health_activity_session_items",
          "columns": [
            ["id", "uuid", true, ""],
            ["user_id", "uuid", true, ""],
            ["session_id", "uuid", true, ""],
            ["catalog_version", "integer", true, ""],
            ["item_key", "text", true, ""],
            ["item_order", "smallint", true, ""],
            ["item_label_snapshot", "text", true, ""],
            ["tracking_mode_snapshot", "text", true, ""],
            ["equipment_snapshot", "text", true, ""],
            ["load_comparability_snapshot", "text", true, ""],
            ["field_policy_snapshot", "jsonb", true, ""],
            ["duration_min", "integer", false, ""],
            ["distance_km", "numeric(6,2)", false, ""],
            ["note", "text", false, ""],
            ["created_at", "timestamp with time zone", true, ""]
          ]
        },
        {
          "table_name": "health_activity_item_sets",
          "columns": [
            ["id", "uuid", true, ""],
            ["user_id", "uuid", true, ""],
            ["session_item_id", "uuid", true, ""],
            ["set_order", "smallint", true, ""],
            ["tracking_mode", "text", true, ""],
            ["reps", "integer", false, ""],
            ["duration_sec", "integer", false, ""],
            ["distance_m", "numeric(7,2)", false, ""],
            ["weight_kg", "numeric(6,2)", false, ""],
            ["assistance_kg", "numeric(6,2)", false, ""],
            ["created_at", "timestamp with time zone", true, ""]
          ]
        }
      ]$columns$::jsonb) as x(table_name text, columns jsonb)
  loop
    select pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_array(
        a.attname,
        pg_catalog.format_type(a.atttypid, a.atttypmod),
        a.attnotnull,
        a.attgenerated
      ) order by a.attnum
    )
      into v_actual
      from pg_catalog.pg_attribute a
     where a.attrelid = pg_catalog.to_regclass(
       pg_catalog.format('public.%I', v_expected.table_name)
     )
       and a.attnum > 0
       and not a.attisdropped;

    if v_actual is distinct from v_expected.columns then
      raise exception 'Activity V2 column contract drift: %',
        v_expected.table_name;
    end if;
  end loop;

  if (select pg_catalog.count(*)
        from public.health_activity_catalog_entries
       where catalog_version = 1) <> 78 then
    raise exception 'Activity V2 catalog v1 row-count drift detected';
  end if;

  if exists (
    select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = any (array[
         'health_activity_catalog_entries',
         'health_activity_sessions',
         'health_activity_session_items',
         'health_activity_item_sets'
       ]::text[])
       and not c.relrowsecurity
  ) then
    raise exception 'Activity V2 RLS contract drift detected';
  end if;

  if (select pg_catalog.count(*)
        from pg_catalog.pg_policy p
        join pg_catalog.pg_class c on c.oid = p.polrelid
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and c.relname = any (array[
           'health_activity_catalog_entries',
           'health_activity_sessions',
           'health_activity_session_items',
           'health_activity_item_sets'
         ]::text[])) <> 4
     or exists (
       select 1
         from pg_catalog.pg_policy p
         join pg_catalog.pg_class c on c.oid = p.polrelid
         join pg_catalog.pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = any (array[
            'health_activity_catalog_entries',
            'health_activity_sessions',
            'health_activity_session_items',
            'health_activity_item_sets'
          ]::text[])
          and (p.polcmd <> 'r'
            or p.polroles <> array[
              pg_catalog.to_regrole('authenticated')::oid
            ]::oid[])
     ) then
    raise exception 'Activity V2 policy contract drift detected';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      join pg_catalog.pg_roles r on r.oid = p.proowner
     where n.nspname = 'public'
       and p.oid = pg_catalog.to_regprocedure(
         'public.activity_v2_commit_session(uuid,jsonb)'
       )
       and r.rolname = 'postgres'
       and p.prosecdef
       and p.provolatile = 'v'
       and p.proconfig @> array['search_path=""']::text[]
  ) then
    raise exception 'Activity V2 commit function hardening drift detected';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      join pg_catalog.pg_roles r on r.oid = p.proowner
     where n.nspname = 'public'
       and p.oid = pg_catalog.to_regprocedure(
         'public.activity_v2_last_performance(text)'
       )
       and r.rolname = 'postgres'
       and not p.prosecdef
       and p.provolatile = 's'
       and p.proconfig @> array['search_path=""']::text[]
  ) then
    raise exception 'Activity V2 lookup function hardening drift detected';
  end if;

  -- PostgreSQL 17 canonical fingerprint over table flags, every column
  -- (including defaults/generated expressions), every constraint, every
  -- index, and every policy. This prevents CREATE IF NOT EXISTS from silently
  -- accepting a six-name state whose subordinate contract has drifted.
  with target_tables as (
    select c.oid, c.relname
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = any (array[
         'health_activity_catalog_entries',
         'health_activity_sessions',
         'health_activity_session_items',
         'health_activity_item_sets'
       ]::text[])
  ), contract as (
    select pg_catalog.jsonb_build_object(
      'tables', (
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_array(
            t.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity
          ) order by t.relname
        )
          from target_tables t
          join pg_catalog.pg_class c on c.oid = t.oid
      ),
      'columns', (
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_array(
            t.relname,
            a.attname,
            pg_catalog.format_type(a.atttypid, a.atttypmod),
            a.attnotnull,
            a.attidentity,
            a.attgenerated,
            pg_catalog.pg_get_expr(d.adbin, d.adrelid)
          ) order by t.relname, a.attnum
        )
          from target_tables t
          join pg_catalog.pg_attribute a on a.attrelid = t.oid
          left join pg_catalog.pg_attrdef d
            on d.adrelid = a.attrelid and d.adnum = a.attnum
         where a.attnum > 0 and not a.attisdropped
      ),
      'constraints', (
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_array(
            t.relname,
            con.conname,
            con.contype,
            con.condeferrable,
            con.condeferred,
            con.convalidated,
            pg_catalog.pg_get_constraintdef(con.oid, false)
          ) order by t.relname, con.conname
        )
          from target_tables t
          join pg_catalog.pg_constraint con on con.conrelid = t.oid
      ),
      'indexes', (
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_array(
            t.relname,
            ic.relname,
            i.indisprimary,
            i.indisunique,
            i.indisvalid,
            pg_catalog.pg_get_indexdef(i.indexrelid)
          ) order by t.relname, ic.relname
        )
          from target_tables t
          join pg_catalog.pg_index i on i.indrelid = t.oid
          join pg_catalog.pg_class ic on ic.oid = i.indexrelid
      ),
      'policies', (
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_array(
            t.relname,
            p.polname,
            p.polpermissive,
            p.polcmd,
            (
              select pg_catalog.jsonb_agg(r.rolname order by r.rolname)
                from pg_catalog.unnest(p.polroles) policy_role(role_oid)
                join pg_catalog.pg_roles r on r.oid = policy_role.role_oid
            ),
            pg_catalog.pg_get_expr(p.polqual, p.polrelid),
            pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid)
          ) order by t.relname, p.polname
        )
          from target_tables t
          join pg_catalog.pg_policy p on p.polrelid = t.oid
      )
    ) as value
  )
  select pg_catalog.encode(
    extensions.digest(
      pg_catalog.convert_to(contract.value::text, 'UTF8'),
      'sha256'
    ),
    'hex'
  )
    into strict v_structure_fingerprint
    from contract;

  if v_structure_fingerprint <>
     '657f31c14b1a17e17241b1cd9aaa4c69a0622321c1f5e6e13927df4ebb23ee14' then
    raise exception 'Activity V2 canonical structure drift detected';
  end if;

  if exists (
    select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      cross join lateral pg_catalog.aclexplode(
        coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
      ) acl
     where n.nspname = 'public'
       and c.relname = any (array[
         'health_activity_catalog_entries',
         'health_activity_sessions',
         'health_activity_session_items',
         'health_activity_item_sets'
       ]::text[])
       and acl.grantee = any (array[
         0::oid,
         pg_catalog.to_regrole('anon'),
         pg_catalog.to_regrole('authenticated'),
         pg_catalog.to_regrole('service_role')
       ]::oid[])
  ) then
    raise exception 'Activity V2 creation ACL must remain fail closed';
  end if;

  if exists (
    select 1
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      cross join lateral pg_catalog.aclexplode(
        coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
      ) acl
     where n.nspname = 'public'
       and p.proname = any (array[
         'activity_v2_commit_session',
         'activity_v2_last_performance'
       ]::text[])
       and acl.privilege_type = 'EXECUTE'
       and acl.grantee = any (array[
         0::oid,
         pg_catalog.to_regrole('anon'),
         pg_catalog.to_regrole('authenticated'),
         pg_catalog.to_regrole('service_role')
       ]::oid[])
  ) then
    raise exception 'Activity V2 creation RPC ACL must remain fail closed';
  end if;
end;
$$;

commit;

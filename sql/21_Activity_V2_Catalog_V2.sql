-- MIDAS Activity V2 C2: complete immutable catalog version 2 snapshot.
--
-- Product contract:
--   - Insert-only projection into the existing R2 catalog table.
--   - Catalog version 1 must already be the exact approved 78-row baseline.
--   - Catalog version 2 must be empty or the exact approved 80-row snapshot.
--   - Partial state or content drift fails before the first persistent write.
--   - Exact re-runs are no-ops; UPDATE, DELETE and UPSERT are forbidden.
--   - No schema, RLS, policy, grant, ACL or RPC changes.
--
-- Productive execution remains gated by C2 S5. S4.5 may execute this file only
-- against the guarded local disposable database.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';
set local idle_in_transaction_session_timeout = '30s';
set local search_path = '';

do $$
begin
  if pg_catalog.to_regclass('public.health_activity_catalog_entries') is null
     or not exists (
       select 1
         from pg_catalog.pg_class c
         join pg_catalog.pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = 'health_activity_catalog_entries'
          and c.relkind = 'r'
     ) then
    raise exception 'Activity V2 C2 requires the canonical R2 catalog table';
  end if;
end;
$$;

lock table public.health_activity_catalog_entries
  in share row exclusive mode;

create temporary table midas_activity_v2_expected_catalog_v2
on commit drop
as
select
  2::integer as catalog_version,
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
  $activity_catalog_v2$[
  {"key":"ab_wheel_rollout","label":"Ab Wheel Rollout","aliases":["Bauchroller","Ab Roller"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},
  {"key":"assisted_dip","label":"Assisted Dip","aliases":["Unterstützte Dips","Dip Machine Assisted"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"required","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},
  {"key":"assisted_pull_up","label":"Assisted Pull-up","aliases":["Unterstützte Klimmzüge","Pull-up Machine Assisted"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"required","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["back","biceps","forearms"],"sport_tags":[],"status":"active"},
  {"key":"back_extension","label":"Back Extension","aliases":["Rückenstrecker","Hyperextension","Lower Back"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["back","core","glutes","hamstrings"],"sport_tags":[],"status":"active"},
  {"key":"battle_ropes","label":"Battle Ropes","aliases":["Battling Ropes","Seilwellen"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},
  {"key":"bench_press","label":"Bench Press","aliases":["Bankdrücken","Barbell Bench Press","Dumbbell Bench Press","Kurzhantel-Bankdrücken","Langhantel-Bankdrücken"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},
  {"key":"bent_over_row","label":"Bent-over Row","aliases":["Vorgebeugtes Rudern","Barbell Row","Dumbbell Row","T-Bar Row","Kurzhantel-Rudern","Langhantel-Rudern"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","biceps"],"sport_tags":[],"status":"active"},
  {"key":"biceps_curl","label":"Biceps Curl","aliases":["Bizepscurl","Arm Curl","Cable Curl","Dumbbell Curl","Hammer Curl","Preacher Curl","Kurzhantel-Curl"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["biceps","forearms"],"sport_tags":[],"status":"active"},
  {"key":"bird_dog","label":"Bird Dog","aliases":["Diagonaler Vierfüßlerstand"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["core","glutes"],"sport_tags":[],"status":"active"},
  {"key":"box_jump","label":"Box Jump","aliases":["Boxsprung"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["calves","glutes","quadriceps"],"sport_tags":[],"status":"active"},
  {"key":"burpee","label":"Burpee","aliases":["Burpees"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},
  {"key":"calf_raise","label":"Calf Raise","aliases":["Wadenheben","Calf Press","Rotary Calf"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["calves"],"sport_tags":[],"status":"active"},
  {"key":"chest_fly","label":"Chest Fly","aliases":["Butterfly","Brustfly","Cable Crossover","Pec Deck","Pectoral","Dumbbell Fly","Kurzhantel-Fly"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["chest","shoulders"],"sport_tags":[],"status":"active"},
  {"key":"chest_press","label":"Chest Press","aliases":["Brustpresse","Machine Chest Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},
  {"key":"clean","label":"Clean","aliases":["Umsetzen","Power Clean","Kettlebell Clean"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},
  {"key":"clean_and_press","label":"Clean and Press","aliases":["Umsetzen und Drücken","Kettlebell Clean and Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},
  {"key":"core_press","label":"Core Press","aliases":["Abdominal Press","Bauchpresse","Abdominal Crunch"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},
  {"key":"cross_trainer","label":"Crosstrainer","aliases":["Ellipsentrainer","Elliptical"],"category":"endurance","tracking_mode":"duration","equipment":"cardio_machine","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor"],"status":"active"},
  {"key":"crunch","label":"Crunch","aliases":["Crunches","Bauchcrunch"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},
  {"key":"cycling","label":"Radfahren","aliases":["Fahrrad","Ergometer","Spinning","Stationary Bike","Fahrradergometer"],"category":"endurance","tracking_mode":"duration_distance","equipment":"variable","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor","outdoor"],"status":"active"},
  {"key":"dead_bug","label":"Dead Bug","aliases":["Käferübung"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"forbidden"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},
  {"key":"dead_hang","label":"Dead Hang","aliases":["Hängen an der Stange","Passive Hang"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"optional"},"muscle_groups":["back","forearms"],"sport_tags":[],"status":"active"},
  {"key":"deadlift","label":"Deadlift","aliases":["Kreuzheben","Conventional Deadlift","Sumo Deadlift","Kettlebell Deadlift","Dumbbell Deadlift","Kurzhantel-Kreuzheben","Langhantel-Kreuzheben"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","glutes","hamstrings"],"sport_tags":[],"status":"active"},
  {"key":"decline_press","label":"Decline Press","aliases":["Negativbankdrücken","Decline Bench Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},
  {"key":"dip","label":"Dip","aliases":["Dips","Barrenstütz"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},
  {"key":"face_pull","label":"Face Pull","aliases":["Face Pulls","Seilzug zum Gesicht"],"category":"strength","tracking_mode":"strength_sets","equipment":"cable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","shoulders"],"sport_tags":[],"status":"active"},
  {"key":"farmer_carry","label":"Farmer Carry","aliases":["Farmers Walk","Koffertragen","Kettlebell Carry","Dumbbell Carry","Kurzhantel Carry"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"required","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"required"},"muscle_groups":["forearms","full_body"],"sport_tags":[],"status":"active"},
  {"key":"football","label":"Fußball","aliases":["Hallenfußball","Soccer"],"category":"sport","tracking_mode":"duration","equipment":"none","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["indoor","outdoor","team_sport"],"status":"active"},
  {"key":"front_raise","label":"Front Raise","aliases":["Frontheben"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["shoulders"],"sport_tags":[],"status":"active"},
  {"key":"glute_bridge","label":"Glute Bridge","aliases":["Beckenheben","Hüftbrücke"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core","glutes","hamstrings"],"sport_tags":[],"status":"active"},
  {"key":"glute_kickback","label":"Glute Kickback","aliases":["Kickbacks","Bein nach hinten","Glute","Multi Hip Extension"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["glutes"],"sport_tags":[],"status":"active"},
  {"key":"good_morning","label":"Good Morning","aliases":["Good Mornings"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","glutes","hamstrings"],"sport_tags":[],"status":"active"},
  {"key":"hack_squat","label":"Hack Squat","aliases":["Hackenschmidt-Kniebeuge","Hackenschmidt"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["glutes","quadriceps"],"sport_tags":[],"status":"active"},
  {"key":"high_row","label":"High Row","aliases":["Upper Back"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","biceps","shoulders"],"sport_tags":[],"status":"active"},
  {"key":"hiking","label":"Wandern","aliases":["Trekking"],"category":"sport","tracking_mode":"duration_distance","equipment":"none","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","outdoor"],"status":"active"},
  {"key":"hip_abduction","label":"Hip Abduction","aliases":["Abduktorenmaschine","Hüftabduktion","Abductor","Multi Hip Abduction"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["glutes"],"sport_tags":[],"status":"active"},
  {"key":"hip_adduction","label":"Hip Adduction","aliases":["Adduktorenmaschine","Hüftadduktion","Adductor","Multi Hip Adduction"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["adductors"],"sport_tags":[],"status":"active"},
  {"key":"hip_thrust","label":"Hip Thrust","aliases":["Hüftstoß"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["glutes","hamstrings"],"sport_tags":[],"status":"active"},
  {"key":"incline_press","label":"Incline Press","aliases":["Schrägbankdrücken","Incline Bench Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},
  {"key":"jump_rope","label":"Jump Rope","aliases":["Seilspringen","Rope Skipping"],"category":"endurance","tracking_mode":"duration","equipment":"none","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor","outdoor"],"status":"active"},
  {"key":"kettlebell_swing","label":"Kettlebell Swing","aliases":["Kugelhantel Swing"],"category":"strength","tracking_mode":"strength_sets","equipment":"kettlebell","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},
  {"key":"lat_pulldown","label":"Lat Pulldown","aliases":["Latzug","Wide Grip Lat Pull Down","Close Grip Lat Pulldown","Pulldown","Vertical Traction"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","biceps"],"sport_tags":[],"status":"active"},
  {"key":"lateral_raise","label":"Lateral Raise","aliases":["Seitheben","Delts Machine","Dumbbell Lateral Raise","Kurzhantel-Seitheben"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["shoulders"],"sport_tags":[],"status":"active"},
  {"key":"leg_curl","label":"Leg Curl","aliases":["Beinbeuger","Seated Leg Curl","Lying Leg Curl"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["hamstrings"],"sport_tags":[],"status":"active"},
  {"key":"leg_extension","label":"Leg Extension","aliases":["Beinstrecker","Leg Extensions"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["quadriceps"],"sport_tags":[],"status":"active"},
  {"key":"leg_press","label":"Leg Press","aliases":["Beinpresse"],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["glutes","hamstrings","quadriceps"],"sport_tags":[],"status":"active"},
  {"key":"leg_raise","label":"Leg Raise","aliases":["Beinheben","Hanging Leg Raise","Lying Leg Raise"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core","hip_flexors"],"sport_tags":[],"status":"active"},
  {"key":"lunge","label":"Lunge","aliases":["Ausfallschritt","Walking Lunge","Dumbbell Lunge","Kurzhantel-Ausfallschritt"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["glutes","hamstrings","quadriceps"],"sport_tags":[],"status":"active"},
  {"key":"mountain_climber","label":"Mountain Climber","aliases":["Bergsteiger"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":["core","full_body"],"sport_tags":[],"status":"active"},
  {"key":"pallof_press","label":"Pallof Press","aliases":["Anti-Rotation Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"cable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},
  {"key":"plank","label":"Plank","aliases":["Unterarmstütz"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},
  {"key":"pull_up","label":"Pull-up","aliases":["Klimmzug","Chin-up","Wide Grip Pull-up"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["back","biceps","forearms"],"sport_tags":[],"status":"active"},
  {"key":"pullover","label":"Pullover","aliases":["Überzug"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","chest"],"sport_tags":[],"status":"active"},
  {"key":"push_up","label":"Push-up","aliases":["Liegestütz","Push-ups"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["chest","shoulders","triceps"],"sport_tags":[],"status":"active"},
  {"key":"reverse_fly","label":"Reverse Fly","aliases":["Reverse Butterfly","Vorgebeugtes Seitheben"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","shoulders"],"sport_tags":[],"status":"active"},
  {"key":"romanian_deadlift","label":"Romanian Deadlift","aliases":["Rumänisches Kreuzheben","RDL","Stiff-leg Deadlift","Dumbbell Romanian Deadlift","Kettlebell Romanian Deadlift","Kurzhantel-RDL"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","glutes","hamstrings"],"sport_tags":[],"status":"active"},
  {"key":"rowing","label":"Rudern","aliases":["Ruderergometer","Rowing Machine"],"category":"endurance","tracking_mode":"duration_distance","equipment":"cardio_machine","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor"],"status":"active"},
  {"key":"running","label":"Laufen","aliases":["Joggen","Laufband Laufen","Treadmill Running"],"category":"endurance","tracking_mode":"duration_distance","equipment":"variable","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor","outdoor"],"status":"active"},
  {"key":"russian_twist","label":"Russian Twist","aliases":["Rumpfdrehen sitzend"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},
  {"key":"seated_row","label":"Seated Row","aliases":["Rudern sitzend","Seated Cable Row","Cable Row","Chest-supported Row","Low Row"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","biceps"],"sport_tags":[],"status":"active"},
  {"key":"shoulder_press","label":"Shoulder Press","aliases":["Schulterpresse","Overhead Press","Military Press","Arnold Press","Dumbbell Shoulder Press","Kurzhantel-Schulterdrücken","Kettlebell Press","Kettlebell Shoulder Press"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["shoulders","triceps"],"sport_tags":[],"status":"active"},
  {"key":"shrug","label":"Shrug","aliases":["Schulterheben","Shrugs"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","forearms"],"sport_tags":[],"status":"active"},
  {"key":"side_plank","label":"Side Plank","aliases":["Seitstütz"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},
  {"key":"sit_up","label":"Sit-up","aliases":["Sit-ups","Rumpfaufrichten"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core","hip_flexors"],"sport_tags":[],"status":"active"},
  {"key":"ski_erg","label":"SkiErg","aliases":["Skiergometer","Ski Ergometer"],"category":"endurance","tracking_mode":"duration_distance","equipment":"cardio_machine","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor"],"status":"active"},
  {"key":"sled_pull","label":"Sled Pull","aliases":["Schlitten ziehen"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"required","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"optional"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},
  {"key":"sled_push","label":"Sled Push","aliases":["Schlitten schieben"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"required","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"optional"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},
  {"key":"snatch","label":"Snatch","aliases":["Reißen","Power Snatch","Kettlebell Snatch"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["full_body"],"sport_tags":[],"status":"active"},
  {"key":"split_squat","label":"Split Squat","aliases":["Bulgarische Kniebeuge","Bulgarian Split Squat"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["glutes","hamstrings","quadriceps"],"sport_tags":[],"status":"active"},
  {"key":"squat","label":"Squat","aliases":["Kniebeuge","Back Squat","Front Squat","Goblet Squat","Kettlebell Goblet Squat","Kurzhantel-Kniebeuge","Langhantel-Kniebeuge"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["glutes","hamstrings","quadriceps"],"sport_tags":[],"status":"active"},
  {"key":"stair_climber","label":"Stair Climber","aliases":["Treppensteiger","Stairmaster","Stepmill"],"category":"endurance","tracking_mode":"duration","equipment":"cardio_machine","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor"],"status":"active"},
  {"key":"step_up","label":"Step-up","aliases":["Aufsteigen","Box Step-up"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["glutes","hamstrings","quadriceps"],"sport_tags":[],"status":"active"},
  {"key":"straight_arm_pulldown","label":"Straight-arm Pulldown","aliases":["Latzug mit gestreckten Armen"],"category":"strength","tracking_mode":"strength_sets","equipment":"cable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back"],"sport_tags":[],"status":"active"},
  {"key":"swimming","label":"Schwimmen","aliases":["Swim"],"category":"sport","tracking_mode":"duration_distance","equipment":"none","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","water_sport"],"status":"active"},
  {"key":"torso_rotation","label":"Torso Rotation","aliases":["Rumpfrotation","Rotary Torso"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"optional"},"muscle_groups":["core"],"sport_tags":[],"status":"active"},
  {"key":"total_abdominal","label":"Total Abdominal","aliases":[],"category":"strength","tracking_mode":"strength_sets","equipment":"machine","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["core","hip_flexors"],"sport_tags":[],"status":"active"},
  {"key":"triceps_extension","label":"Triceps Extension","aliases":["Trizepsdrücken","Triceps Pushdown","Overhead Triceps Extension"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["triceps"],"sport_tags":[],"status":"active"},
  {"key":"upright_row","label":"Upright Row","aliases":["Aufrechtes Rudern"],"category":"strength","tracking_mode":"strength_sets","equipment":"variable","load_comparability":"device_relative","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"forbidden","note":"optional","reps":"required","weight_kg":"required"},"muscle_groups":["back","biceps","shoulders"],"sport_tags":[],"status":"active"},
  {"key":"walking","label":"Gehen","aliases":["Spazieren","Laufband Gehen","Treadmill Walking"],"category":"endurance","tracking_mode":"duration_distance","equipment":"variable","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"optional","distance_m":"forbidden","duration_min":"required","duration_sec":"forbidden","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":[],"sport_tags":["endurance","indoor","outdoor"],"status":"active"},
  {"key":"wall_sit","label":"Wall Sit","aliases":["Wandsitzen"],"category":"strength","tracking_mode":"strength_sets","equipment":"bodyweight","load_comparability":"not_applicable","fields":{"assistance_kg":"forbidden","distance_km":"forbidden","distance_m":"forbidden","duration_min":"forbidden","duration_sec":"required","note":"optional","reps":"forbidden","weight_kg":"forbidden"},"muscle_groups":["glutes","quadriceps"],"sport_tags":[],"status":"active"}
  ]$activity_catalog_v2$::jsonb
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

create temporary table midas_activity_v2_expected_catalog_v1
on commit drop
as
select
  1::integer as catalog_version,
  e.item_key,
  e.label,
  case e.item_key
    when 'back_extension' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 1]
    when 'bench_press' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 2]
    when 'bent_over_row' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 2]
    when 'biceps_curl' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 1]
    when 'calf_raise' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 1]
    when 'chest_fly' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 3]
    when 'clean' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 1]
    when 'clean_and_press' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 1]
    when 'core_press' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 1]
    when 'cycling' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 1]
    when 'deadlift' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 4]
    when 'farmer_carry' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 3]
    when 'glute_kickback' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 2]
    when 'hip_abduction' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 2]
    when 'hip_adduction' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 2]
    when 'lat_pulldown' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 2]
    when 'lateral_raise' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 3]
    when 'lunge' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 2]
    when 'romanian_deadlift' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 3]
    when 'seated_row' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 1]
    when 'shoulder_press' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 4]
    when 'snatch' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 1]
    when 'squat' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 3]
    when 'stair_climber' then e.aliases[1:pg_catalog.cardinality(e.aliases) - 1]
    else e.aliases
  end::text[] as aliases,
  e.status,
  e.category,
  e.equipment,
  e.muscle_groups,
  e.sport_tags,
  e.tracking_mode,
  e.load_comparability,
  e.field_policy
from midas_activity_v2_expected_catalog_v2 e
where e.item_key not in ('high_row', 'total_abdominal');

do $$
declare
  v_v2_count integer;
begin
  if (select pg_catalog.count(*) from midas_activity_v2_expected_catalog_v2) <> 80
     or exists (
       select 1
         from midas_activity_v2_expected_catalog_v2
        where catalog_version <> 2 or status <> 'active'
     )
     or (select pg_catalog.count(distinct item_key)
           from midas_activity_v2_expected_catalog_v2) <> 80 then
    raise exception
      'Activity V2 C2 embedded catalog must contain 80 active unique v2 rows';
  end if;

  if (select pg_catalog.count(*) from midas_activity_v2_expected_catalog_v1) <> 78
     or exists (
       select 1
         from midas_activity_v2_expected_catalog_v1
        where catalog_version <> 1 or status <> 'active'
     )
     or (select pg_catalog.count(distinct item_key)
           from midas_activity_v2_expected_catalog_v1) <> 78 then
    raise exception
      'Activity V2 C2 derived v1 baseline must contain 78 active unique rows';
  end if;

  if exists (
    (
      select * from midas_activity_v2_expected_catalog_v1
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
      select * from midas_activity_v2_expected_catalog_v1
    )
  ) then
    raise exception 'Activity V2 C2 catalog v1 drift detected';
  end if;

  select pg_catalog.count(*)::integer
    into v_v2_count
    from public.health_activity_catalog_entries
   where catalog_version = 2;

  if v_v2_count not in (0, 80) then
    raise exception 'Activity V2 C2 catalog v2 partial state detected';
  end if;

  if v_v2_count = 80 and exists (
    (
      select * from midas_activity_v2_expected_catalog_v2
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
      where c.catalog_version = 2
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
      where c.catalog_version = 2
      except
      select * from midas_activity_v2_expected_catalog_v2
    )
  ) then
    raise exception 'Activity V2 C2 catalog v2 content drift detected';
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
from midas_activity_v2_expected_catalog_v2 e
where not exists (
  select 1
    from public.health_activity_catalog_entries c
   where c.catalog_version = 2
)
order by e.item_key;

do $$
begin
  if exists (
    (
      select * from midas_activity_v2_expected_catalog_v1
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
      select * from midas_activity_v2_expected_catalog_v1
    )
  ) then
    raise exception 'Activity V2 C2 catalog v1 postcondition failed';
  end if;

  if exists (
    (
      select * from midas_activity_v2_expected_catalog_v2
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
      where c.catalog_version = 2
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
      where c.catalog_version = 2
      except
      select * from midas_activity_v2_expected_catalog_v2
    )
  ) then
    raise exception 'Activity V2 C2 catalog v2 postcondition failed';
  end if;
end;
$$;

commit;

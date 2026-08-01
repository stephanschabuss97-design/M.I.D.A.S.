# MIDAS Activity V2 R1 Catalog Baseline Contract

## Status und Zweck

| Feld | Wert |
| --- | --- |
| Status | `APPROVED` |
| Datum | `2026-07-30` |
| Owner-Freigabe | `2026-07-30: Baseline freigegeben` |
| Erste `catalog_version` | `1` |
| Gehört zu | `MIDAS Activity V2 R1 Semantics and Product Contract Roadmap` |
| Zweck | exaktes breites Baseline-Inventar für S2 |
| Produktwirkung | keine direkte; freigegebene Source of Truth für R2 und spätere Activity-V2-Roadmaps |

Dieser Katalog ist keine Kopie eines Trainingsplans. Er stellt verbreitete
klassische Gym-Übungen und relevante Aktivitäten bereit, bevor persönliche
Historie existiert. „Breit“ bedeutet eine kuratierte, endliche Baseline und
nicht jede denkbare Griff-, Stand-, Tempo-, Hersteller- oder Studiovariante.
Echte Lücken werden später über eine erhöhte `catalog_version` ergänzt.

## Inventarvertrag

- Die Tabelle ist nach ASCII-Key sortiert und nach Owner-Freigabe exakt.
- Labels sind UI-Namen; semikolongetrennte Aliase sind nur Suchwege.
- `equipment` beschreibt eine generische Klasse und ist keine Historien-ID.
- Jede Zeile verwendet `note: optional`; nicht genannte Messfelder sind
  `forbidden`.
- Shorthand für `measurement`:
  - `R/W!`: `reps` und `weight_kg` erforderlich.
  - `R/W?`: `reps` erforderlich, `weight_kg` optional.
  - `R/A!`: `reps` und `assistance_kg` erforderlich.
  - `R/-`: nur `reps`.
  - `T/W?`: `duration_sec` erforderlich, `weight_kg` optional.
  - `T/-`: nur `duration_sec`.
  - `M/W!`: `distance_m` und `weight_kg` erforderlich.
  - `M/W?`: `distance_m` erforderlich, `weight_kg` optional.
  - `MIN`: `duration_min`.
  - `MIN+KM?`: `duration_min` erforderlich, `distance_km` optional.
- `R`, `T` und `M` verwenden `strength_sets`; `MIN` verwendet `duration`;
  `MIN+KM?` verwendet `duration_distance`.
- Entries mit `W` oder `A` sind `device_relative`; alle anderen
  `not_applicable`. Die Baseline behauptet keine `standardized` Last.

<!-- markdownlint-disable MD013 -->

| key | label | aliases | category | measurement | equipment | muscle_groups / sport_tags |
| --- | --- | --- | --- | --- | --- | --- |
| `ab_wheel_rollout` | Ab Wheel Rollout | Bauchroller; Ab Roller | strength | R/- | variable | core |
| `assisted_dip` | Assisted Dip | Unterstützte Dips; Dip Machine Assisted | strength | R/A! | machine | chest, shoulders, triceps |
| `assisted_pull_up` | Assisted Pull-up | Unterstützte Klimmzüge; Pull-up Machine Assisted | strength | R/A! | machine | back, biceps, forearms |
| `back_extension` | Back Extension | Rückenstrecker; Hyperextension | strength | R/W? | variable | back, core, glutes, hamstrings |
| `battle_ropes` | Battle Ropes | Battling Ropes; Seilwellen | strength | T/- | variable | full_body |
| `bench_press` | Bench Press | Bankdrücken; Barbell Bench Press; Dumbbell Bench Press | strength | R/W! | variable | chest, shoulders, triceps |
| `bent_over_row` | Bent-over Row | Vorgebeugtes Rudern; Barbell Row; Dumbbell Row; T-Bar Row | strength | R/W! | variable | back, biceps |
| `biceps_curl` | Biceps Curl | Bizepscurl; Arm Curl; Cable Curl; Dumbbell Curl; Hammer Curl; Preacher Curl | strength | R/W! | variable | biceps, forearms |
| `bird_dog` | Bird Dog | Diagonaler Vierfüßlerstand | strength | R/- | bodyweight | core, glutes |
| `box_jump` | Box Jump | Boxsprung | strength | R/- | bodyweight | calves, glutes, quadriceps |
| `burpee` | Burpee | Burpees | strength | R/- | bodyweight | full_body |
| `calf_raise` | Calf Raise | Wadenheben; Calf Press | strength | R/W? | variable | calves |
| `chest_fly` | Chest Fly | Butterfly; Brustfly; Cable Crossover; Pec Deck | strength | R/W! | variable | chest, shoulders |
| `chest_press` | Chest Press | Brustpresse; Machine Chest Press | strength | R/W! | machine | chest, shoulders, triceps |
| `clean` | Clean | Umsetzen; Power Clean | strength | R/W! | variable | full_body |
| `clean_and_press` | Clean and Press | Umsetzen und Drücken | strength | R/W! | variable | full_body |
| `core_press` | Core Press | Abdominal Press; Bauchpresse | strength | R/W! | machine | core |
| `cross_trainer` | Crosstrainer | Ellipsentrainer; Elliptical | endurance | MIN | cardio_machine | endurance, indoor |
| `crunch` | Crunch | Crunches; Bauchcrunch | strength | R/W? | variable | core |
| `cycling` | Radfahren | Fahrrad; Ergometer; Spinning; Stationary Bike | endurance | MIN+KM? | variable | endurance, indoor, outdoor |
| `dead_bug` | Dead Bug | Käferübung | strength | R/- | bodyweight | core |
| `dead_hang` | Dead Hang | Hängen an der Stange; Passive Hang | strength | T/W? | bodyweight | back, forearms |
| `deadlift` | Deadlift | Kreuzheben; Conventional Deadlift; Sumo Deadlift | strength | R/W! | variable | back, glutes, hamstrings |
| `decline_press` | Decline Press | Negativbankdrücken; Decline Bench Press | strength | R/W! | variable | chest, shoulders, triceps |
| `dip` | Dip | Dips; Barrenstütz | strength | R/W? | bodyweight | chest, shoulders, triceps |
| `face_pull` | Face Pull | Face Pulls; Seilzug zum Gesicht | strength | R/W! | cable | back, shoulders |
| `farmer_carry` | Farmer Carry | Farmers Walk; Koffertragen | strength | M/W! | variable | forearms, full_body |
| `football` | Fußball | Hallenfußball; Soccer | sport | MIN | none | indoor, outdoor, team_sport |
| `front_raise` | Front Raise | Frontheben | strength | R/W! | variable | shoulders |
| `glute_bridge` | Glute Bridge | Beckenheben; Hüftbrücke | strength | R/W? | variable | core, glutes, hamstrings |
| `glute_kickback` | Glute Kickback | Kickbacks; Bein nach hinten | strength | R/W? | variable | glutes |
| `good_morning` | Good Morning | Good Mornings | strength | R/W! | variable | back, glutes, hamstrings |
| `hack_squat` | Hack Squat | Hackenschmidt-Kniebeuge; Hackenschmidt | strength | R/W! | machine | glutes, quadriceps |
| `hiking` | Wandern | Trekking | sport | MIN+KM? | none | endurance, outdoor |
| `hip_abduction` | Hip Abduction | Abduktorenmaschine; Hüftabduktion | strength | R/W! | machine | glutes |
| `hip_adduction` | Hip Adduction | Adduktorenmaschine; Hüftadduktion | strength | R/W! | machine | adductors |
| `hip_thrust` | Hip Thrust | Hüftstoß | strength | R/W! | variable | glutes, hamstrings |
| `incline_press` | Incline Press | Schrägbankdrücken; Incline Bench Press | strength | R/W! | variable | chest, shoulders, triceps |
| `jump_rope` | Jump Rope | Seilspringen; Rope Skipping | endurance | MIN | none | endurance, indoor, outdoor |
| `kettlebell_swing` | Kettlebell Swing | Kugelhantel Swing | strength | R/W! | kettlebell | full_body |
| `lat_pulldown` | Lat Pulldown | Latzug; Wide Grip Lat Pull Down; Close Grip Lat Pulldown | strength | R/W! | variable | back, biceps |
| `lateral_raise` | Lateral Raise | Seitheben | strength | R/W! | variable | shoulders |
| `leg_curl` | Leg Curl | Beinbeuger; Seated Leg Curl; Lying Leg Curl | strength | R/W! | machine | hamstrings |
| `leg_extension` | Leg Extension | Beinstrecker; Leg Extensions | strength | R/W! | machine | quadriceps |
| `leg_press` | Leg Press | Beinpresse | strength | R/W! | machine | glutes, hamstrings, quadriceps |
| `leg_raise` | Leg Raise | Beinheben; Hanging Leg Raise; Lying Leg Raise | strength | R/W? | bodyweight | core, hip_flexors |
| `lunge` | Lunge | Ausfallschritt; Walking Lunge | strength | R/W? | variable | glutes, hamstrings, quadriceps |
| `mountain_climber` | Mountain Climber | Bergsteiger | strength | T/- | bodyweight | core, full_body |
| `pallof_press` | Pallof Press | Anti-Rotation Press | strength | R/W! | cable | core |
| `plank` | Plank | Unterarmstütz | strength | T/- | bodyweight | core |
| `pull_up` | Pull-up | Klimmzug; Chin-up; Wide Grip Pull-up | strength | R/W? | bodyweight | back, biceps, forearms |
| `pullover` | Pullover | Überzug | strength | R/W! | variable | back, chest |
| `push_up` | Push-up | Liegestütz; Push-ups | strength | R/W? | bodyweight | chest, shoulders, triceps |
| `reverse_fly` | Reverse Fly | Reverse Butterfly; Vorgebeugtes Seitheben | strength | R/W! | variable | back, shoulders |
| `romanian_deadlift` | Romanian Deadlift | Rumänisches Kreuzheben; RDL; Stiff-leg Deadlift | strength | R/W! | variable | back, glutes, hamstrings |
| `rowing` | Rudern | Ruderergometer; Rowing Machine | endurance | MIN+KM? | cardio_machine | endurance, indoor |
| `running` | Laufen | Joggen; Laufband Laufen; Treadmill Running | endurance | MIN+KM? | variable | endurance, indoor, outdoor |
| `russian_twist` | Russian Twist | Rumpfdrehen sitzend | strength | R/W? | variable | core |
| `seated_row` | Seated Row | Rudern sitzend; Seated Cable Row; Cable Row; Chest-supported Row | strength | R/W! | variable | back, biceps |
| `shoulder_press` | Shoulder Press | Schulterpresse; Overhead Press; Military Press; Arnold Press | strength | R/W! | variable | shoulders, triceps |
| `shrug` | Shrug | Schulterheben; Shrugs | strength | R/W! | variable | back, forearms |
| `side_plank` | Side Plank | Seitstütz | strength | T/- | bodyweight | core |
| `sit_up` | Sit-up | Sit-ups; Rumpfaufrichten | strength | R/W? | bodyweight | core, hip_flexors |
| `ski_erg` | SkiErg | Skiergometer; Ski Ergometer | endurance | MIN+KM? | cardio_machine | endurance, indoor |
| `sled_pull` | Sled Pull | Schlitten ziehen | strength | M/W? | variable | full_body |
| `sled_push` | Sled Push | Schlitten schieben | strength | M/W? | variable | full_body |
| `snatch` | Snatch | Reißen; Power Snatch | strength | R/W! | variable | full_body |
| `split_squat` | Split Squat | Bulgarische Kniebeuge; Bulgarian Split Squat | strength | R/W? | variable | glutes, hamstrings, quadriceps |
| `squat` | Squat | Kniebeuge; Back Squat; Front Squat; Goblet Squat | strength | R/W? | variable | glutes, hamstrings, quadriceps |
| `stair_climber` | Stair Climber | Treppensteiger; Stairmaster | endurance | MIN | cardio_machine | endurance, indoor |
| `step_up` | Step-up | Aufsteigen; Box Step-up | strength | R/W? | variable | glutes, hamstrings, quadriceps |
| `straight_arm_pulldown` | Straight-arm Pulldown | Latzug mit gestreckten Armen | strength | R/W! | cable | back |
| `swimming` | Schwimmen | Swim | sport | MIN+KM? | none | endurance, water_sport |
| `torso_rotation` | Torso Rotation | Rumpfrotation; Rotary Torso | strength | R/W? | variable | core |
| `triceps_extension` | Triceps Extension | Trizepsdrücken; Triceps Pushdown; Overhead Triceps Extension | strength | R/W! | variable | triceps |
| `upright_row` | Upright Row | Aufrechtes Rudern | strength | R/W! | variable | back, biceps, shoulders |
| `walking` | Gehen | Spazieren; Laufband Gehen; Treadmill Walking | endurance | MIN+KM? | variable | endurance, indoor, outdoor |
| `wall_sit` | Wall Sit | Wandsitzen | strength | T/- | bodyweight | glutes, quadriceps |

<!-- markdownlint-enable MD013 -->

## Bewusste Grenzen

- Dehnen ist auf Owner-Wunsch kein Entry und erzeugt keine Erinnerung.
- `Gym`, `Krafttraining`, `Warm-up` und `Cool-down` sind keine Übungen.
- Griff-, Stand-, Geräte- und Hantelvarianten sind Aliase, solange keine
  andere klassische Bewegung oder inverse Messsemantik vorliegt.
- Medizinische Reha-Übungen, markenspezifische Geräte und ein freies
  `Sonstiges` sind nicht Bestandteil dieser Baseline.
- Katalogbestand bedeutet nur Suchbarkeit. Er behauptet weder persönliche
  Nutzung noch Eignung, Trainingsplanempfehlung oder CKD-Verträglichkeit.

## Owner-Freigabe

Die 78-Entry-Baseline sowie die bewusste generische Zusammenführung von
Geräte-, Hantel- und Griffvarianten sind freigegeben. Historie orientiert sich
am klassischen Übungskey; `device_relative` begrenzt Lastvergleiche.
Einzelne spätere Lücken werden als neue kontrollierte Entries ergänzt, ohne
bestehende Keys umzubenennen.

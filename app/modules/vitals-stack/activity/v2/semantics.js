'use strict';

(function initActivityV2Semantics(root) {
  const SCHEMA_VERSION = 'midas.activity-catalog.v1';
  const CATALOG_VERSION = 1;
  const KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const FIELD_POLICIES = Object.freeze(['forbidden', 'optional', 'required']);
  const TRACKING_MODES = Object.freeze([
    'duration',
    'duration_distance',
    'strength_sets'
  ]);
  const LOAD_COMPARABILITY = Object.freeze([
    'device_relative',
    'not_applicable',
    'standardized'
  ]);
  const ENTRY_STATUSES = Object.freeze(['active', 'deprecated']);
  const TOP_LEVEL_KEYS = Object.freeze([
    'catalog_version',
    'entries',
    'field_definitions',
    'schema_version',
    'taxonomies'
  ]);
  const TAXONOMY_KEYS = Object.freeze([
    'categories',
    'equipment',
    'muscle_groups',
    'sport_tags'
  ]);
  const FIELD_KEYS = Object.freeze([
    'assistance_kg',
    'distance_km',
    'distance_m',
    'duration_min',
    'duration_sec',
    'note',
    'reps',
    'weight_kg'
  ]);
  const ENTRY_KEYS = Object.freeze([
    'aliases',
    'category',
    'equipment',
    'fields',
    'key',
    'label',
    'load_comparability',
    'muscle_groups',
    'sport_tags',
    'status',
    'tracking_mode'
  ]);
  const ERROR_CODES = Object.freeze([
    'duplicate_value',
    'invalid_order',
    'invalid_type',
    'invalid_value',
    'missing_field',
    'normalized_collision',
    'policy_mismatch',
    'unknown_field',
    'unknown_reference'
  ]);
  const ERROR_CODE_SET = new Set(ERROR_CODES);

  const TAXONOMIES = {
    categories: ['endurance', 'sport', 'strength'],
    equipment: [
      'barbell',
      'bodyweight',
      'cable',
      'cardio_machine',
      'dumbbell',
      'kettlebell',
      'machine',
      'none',
      'variable'
    ],
    muscle_groups: [
      'adductors',
      'back',
      'biceps',
      'calves',
      'chest',
      'core',
      'forearms',
      'full_body',
      'glutes',
      'hamstrings',
      'hip_flexors',
      'quadriceps',
      'shoulders',
      'triceps'
    ],
    sport_tags: ['endurance', 'indoor', 'outdoor', 'team_sport', 'water_sport']
  };

  const FIELD_DEFINITIONS = {
    assistance_kg: {
      scope: 'set',
      value_type: 'number',
      unit: 'kg',
      min: 0.01,
      max: 1000,
      max_decimals: 2
    },
    distance_km: {
      scope: 'item',
      value_type: 'number',
      unit: 'km',
      min: 0.01,
      max: 1000,
      max_decimals: 2
    },
    distance_m: {
      scope: 'set',
      value_type: 'number',
      unit: 'm',
      min: 0.1,
      max: 10000,
      max_decimals: 2
    },
    duration_min: {
      scope: 'item',
      value_type: 'integer',
      unit: 'min',
      min: 1,
      max: 1440
    },
    duration_sec: {
      scope: 'set',
      value_type: 'integer',
      unit: 's',
      min: 1,
      max: 3600
    },
    note: {
      scope: 'item',
      value_type: 'string',
      trim: true,
      min_length: 1,
      max_length: 500
    },
    reps: {
      scope: 'set',
      value_type: 'integer',
      unit: 'count',
      min: 1,
      max: 1000
    },
    weight_kg: {
      scope: 'set',
      value_type: 'number',
      unit: 'kg',
      min: 0.01,
      max: 1000,
      max_decimals: 2
    }
  };

  const MEASUREMENT_POLICIES = {
    'M/W!': {
      tracking_mode: 'strength_sets',
      assistance_kg: 'forbidden',
      distance_km: 'forbidden',
      distance_m: 'required',
      duration_min: 'forbidden',
      duration_sec: 'forbidden',
      note: 'optional',
      reps: 'forbidden',
      weight_kg: 'required'
    },
    'M/W?': {
      tracking_mode: 'strength_sets',
      assistance_kg: 'forbidden',
      distance_km: 'forbidden',
      distance_m: 'required',
      duration_min: 'forbidden',
      duration_sec: 'forbidden',
      note: 'optional',
      reps: 'forbidden',
      weight_kg: 'optional'
    },
    MIN: {
      tracking_mode: 'duration',
      assistance_kg: 'forbidden',
      distance_km: 'forbidden',
      distance_m: 'forbidden',
      duration_min: 'required',
      duration_sec: 'forbidden',
      note: 'optional',
      reps: 'forbidden',
      weight_kg: 'forbidden'
    },
    'MIN+KM?': {
      tracking_mode: 'duration_distance',
      assistance_kg: 'forbidden',
      distance_km: 'optional',
      distance_m: 'forbidden',
      duration_min: 'required',
      duration_sec: 'forbidden',
      note: 'optional',
      reps: 'forbidden',
      weight_kg: 'forbidden'
    },
    'R/-': {
      tracking_mode: 'strength_sets',
      assistance_kg: 'forbidden',
      distance_km: 'forbidden',
      distance_m: 'forbidden',
      duration_min: 'forbidden',
      duration_sec: 'forbidden',
      note: 'optional',
      reps: 'required',
      weight_kg: 'forbidden'
    },
    'R/A!': {
      tracking_mode: 'strength_sets',
      assistance_kg: 'required',
      distance_km: 'forbidden',
      distance_m: 'forbidden',
      duration_min: 'forbidden',
      duration_sec: 'forbidden',
      note: 'optional',
      reps: 'required',
      weight_kg: 'forbidden'
    },
    'R/W!': {
      tracking_mode: 'strength_sets',
      assistance_kg: 'forbidden',
      distance_km: 'forbidden',
      distance_m: 'forbidden',
      duration_min: 'forbidden',
      duration_sec: 'forbidden',
      note: 'optional',
      reps: 'required',
      weight_kg: 'required'
    },
    'R/W?': {
      tracking_mode: 'strength_sets',
      assistance_kg: 'forbidden',
      distance_km: 'forbidden',
      distance_m: 'forbidden',
      duration_min: 'forbidden',
      duration_sec: 'forbidden',
      note: 'optional',
      reps: 'required',
      weight_kg: 'optional'
    },
    'T/-': {
      tracking_mode: 'strength_sets',
      assistance_kg: 'forbidden',
      distance_km: 'forbidden',
      distance_m: 'forbidden',
      duration_min: 'forbidden',
      duration_sec: 'required',
      note: 'optional',
      reps: 'forbidden',
      weight_kg: 'forbidden'
    },
    'T/W?': {
      tracking_mode: 'strength_sets',
      assistance_kg: 'forbidden',
      distance_km: 'forbidden',
      distance_m: 'forbidden',
      duration_min: 'forbidden',
      duration_sec: 'required',
      note: 'optional',
      reps: 'forbidden',
      weight_kg: 'optional'
    }
  };

  const ENTRY_ROWS = [
    ['ab_wheel_rollout', 'Ab Wheel Rollout', ['Bauchroller', 'Ab Roller'], 'strength', 'R/-', 'variable', ['core']],
    ['assisted_dip', 'Assisted Dip', ['Unterstützte Dips', 'Dip Machine Assisted'], 'strength', 'R/A!', 'machine', ['chest', 'shoulders', 'triceps']],
    ['assisted_pull_up', 'Assisted Pull-up', ['Unterstützte Klimmzüge', 'Pull-up Machine Assisted'], 'strength', 'R/A!', 'machine', ['back', 'biceps', 'forearms']],
    ['back_extension', 'Back Extension', ['Rückenstrecker', 'Hyperextension'], 'strength', 'R/W?', 'variable', ['back', 'core', 'glutes', 'hamstrings']],
    ['battle_ropes', 'Battle Ropes', ['Battling Ropes', 'Seilwellen'], 'strength', 'T/-', 'variable', ['full_body']],
    ['bench_press', 'Bench Press', ['Bankdrücken', 'Barbell Bench Press', 'Dumbbell Bench Press'], 'strength', 'R/W!', 'variable', ['chest', 'shoulders', 'triceps']],
    ['bent_over_row', 'Bent-over Row', ['Vorgebeugtes Rudern', 'Barbell Row', 'Dumbbell Row', 'T-Bar Row'], 'strength', 'R/W!', 'variable', ['back', 'biceps']],
    ['biceps_curl', 'Biceps Curl', ['Bizepscurl', 'Arm Curl', 'Cable Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl'], 'strength', 'R/W!', 'variable', ['biceps', 'forearms']],
    ['bird_dog', 'Bird Dog', ['Diagonaler Vierfüßlerstand'], 'strength', 'R/-', 'bodyweight', ['core', 'glutes']],
    ['box_jump', 'Box Jump', ['Boxsprung'], 'strength', 'R/-', 'bodyweight', ['calves', 'glutes', 'quadriceps']],
    ['burpee', 'Burpee', ['Burpees'], 'strength', 'R/-', 'bodyweight', ['full_body']],
    ['calf_raise', 'Calf Raise', ['Wadenheben', 'Calf Press'], 'strength', 'R/W?', 'variable', ['calves']],
    ['chest_fly', 'Chest Fly', ['Butterfly', 'Brustfly', 'Cable Crossover', 'Pec Deck'], 'strength', 'R/W!', 'variable', ['chest', 'shoulders']],
    ['chest_press', 'Chest Press', ['Brustpresse', 'Machine Chest Press'], 'strength', 'R/W!', 'machine', ['chest', 'shoulders', 'triceps']],
    ['clean', 'Clean', ['Umsetzen', 'Power Clean'], 'strength', 'R/W!', 'variable', ['full_body']],
    ['clean_and_press', 'Clean and Press', ['Umsetzen und Drücken'], 'strength', 'R/W!', 'variable', ['full_body']],
    ['core_press', 'Core Press', ['Abdominal Press', 'Bauchpresse'], 'strength', 'R/W!', 'machine', ['core']],
    ['cross_trainer', 'Crosstrainer', ['Ellipsentrainer', 'Elliptical'], 'endurance', 'MIN', 'cardio_machine', ['endurance', 'indoor']],
    ['crunch', 'Crunch', ['Crunches', 'Bauchcrunch'], 'strength', 'R/W?', 'variable', ['core']],
    ['cycling', 'Radfahren', ['Fahrrad', 'Ergometer', 'Spinning', 'Stationary Bike'], 'endurance', 'MIN+KM?', 'variable', ['endurance', 'indoor', 'outdoor']],
    ['dead_bug', 'Dead Bug', ['Käferübung'], 'strength', 'R/-', 'bodyweight', ['core']],
    ['dead_hang', 'Dead Hang', ['Hängen an der Stange', 'Passive Hang'], 'strength', 'T/W?', 'bodyweight', ['back', 'forearms']],
    ['deadlift', 'Deadlift', ['Kreuzheben', 'Conventional Deadlift', 'Sumo Deadlift'], 'strength', 'R/W!', 'variable', ['back', 'glutes', 'hamstrings']],
    ['decline_press', 'Decline Press', ['Negativbankdrücken', 'Decline Bench Press'], 'strength', 'R/W!', 'variable', ['chest', 'shoulders', 'triceps']],
    ['dip', 'Dip', ['Dips', 'Barrenstütz'], 'strength', 'R/W?', 'bodyweight', ['chest', 'shoulders', 'triceps']],
    ['face_pull', 'Face Pull', ['Face Pulls', 'Seilzug zum Gesicht'], 'strength', 'R/W!', 'cable', ['back', 'shoulders']],
    ['farmer_carry', 'Farmer Carry', ['Farmers Walk', 'Koffertragen'], 'strength', 'M/W!', 'variable', ['forearms', 'full_body']],
    ['football', 'Fußball', ['Hallenfußball', 'Soccer'], 'sport', 'MIN', 'none', ['indoor', 'outdoor', 'team_sport']],
    ['front_raise', 'Front Raise', ['Frontheben'], 'strength', 'R/W!', 'variable', ['shoulders']],
    ['glute_bridge', 'Glute Bridge', ['Beckenheben', 'Hüftbrücke'], 'strength', 'R/W?', 'variable', ['core', 'glutes', 'hamstrings']],
    ['glute_kickback', 'Glute Kickback', ['Kickbacks', 'Bein nach hinten'], 'strength', 'R/W?', 'variable', ['glutes']],
    ['good_morning', 'Good Morning', ['Good Mornings'], 'strength', 'R/W!', 'variable', ['back', 'glutes', 'hamstrings']],
    ['hack_squat', 'Hack Squat', ['Hackenschmidt-Kniebeuge', 'Hackenschmidt'], 'strength', 'R/W!', 'machine', ['glutes', 'quadriceps']],
    ['hiking', 'Wandern', ['Trekking'], 'sport', 'MIN+KM?', 'none', ['endurance', 'outdoor']],
    ['hip_abduction', 'Hip Abduction', ['Abduktorenmaschine', 'Hüftabduktion'], 'strength', 'R/W!', 'machine', ['glutes']],
    ['hip_adduction', 'Hip Adduction', ['Adduktorenmaschine', 'Hüftadduktion'], 'strength', 'R/W!', 'machine', ['adductors']],
    ['hip_thrust', 'Hip Thrust', ['Hüftstoß'], 'strength', 'R/W!', 'variable', ['glutes', 'hamstrings']],
    ['incline_press', 'Incline Press', ['Schrägbankdrücken', 'Incline Bench Press'], 'strength', 'R/W!', 'variable', ['chest', 'shoulders', 'triceps']],
    ['jump_rope', 'Jump Rope', ['Seilspringen', 'Rope Skipping'], 'endurance', 'MIN', 'none', ['endurance', 'indoor', 'outdoor']],
    ['kettlebell_swing', 'Kettlebell Swing', ['Kugelhantel Swing'], 'strength', 'R/W!', 'kettlebell', ['full_body']],
    ['lat_pulldown', 'Lat Pulldown', ['Latzug', 'Wide Grip Lat Pull Down', 'Close Grip Lat Pulldown'], 'strength', 'R/W!', 'variable', ['back', 'biceps']],
    ['lateral_raise', 'Lateral Raise', ['Seitheben'], 'strength', 'R/W!', 'variable', ['shoulders']],
    ['leg_curl', 'Leg Curl', ['Beinbeuger', 'Seated Leg Curl', 'Lying Leg Curl'], 'strength', 'R/W!', 'machine', ['hamstrings']],
    ['leg_extension', 'Leg Extension', ['Beinstrecker', 'Leg Extensions'], 'strength', 'R/W!', 'machine', ['quadriceps']],
    ['leg_press', 'Leg Press', ['Beinpresse'], 'strength', 'R/W!', 'machine', ['glutes', 'hamstrings', 'quadriceps']],
    ['leg_raise', 'Leg Raise', ['Beinheben', 'Hanging Leg Raise', 'Lying Leg Raise'], 'strength', 'R/W?', 'bodyweight', ['core', 'hip_flexors']],
    ['lunge', 'Lunge', ['Ausfallschritt', 'Walking Lunge'], 'strength', 'R/W?', 'variable', ['glutes', 'hamstrings', 'quadriceps']],
    ['mountain_climber', 'Mountain Climber', ['Bergsteiger'], 'strength', 'T/-', 'bodyweight', ['core', 'full_body']],
    ['pallof_press', 'Pallof Press', ['Anti-Rotation Press'], 'strength', 'R/W!', 'cable', ['core']],
    ['plank', 'Plank', ['Unterarmstütz'], 'strength', 'T/-', 'bodyweight', ['core']],
    ['pull_up', 'Pull-up', ['Klimmzug', 'Chin-up', 'Wide Grip Pull-up'], 'strength', 'R/W?', 'bodyweight', ['back', 'biceps', 'forearms']],
    ['pullover', 'Pullover', ['Überzug'], 'strength', 'R/W!', 'variable', ['back', 'chest']],
    ['push_up', 'Push-up', ['Liegestütz', 'Push-ups'], 'strength', 'R/W?', 'bodyweight', ['chest', 'shoulders', 'triceps']],
    ['reverse_fly', 'Reverse Fly', ['Reverse Butterfly', 'Vorgebeugtes Seitheben'], 'strength', 'R/W!', 'variable', ['back', 'shoulders']],
    ['romanian_deadlift', 'Romanian Deadlift', ['Rumänisches Kreuzheben', 'RDL', 'Stiff-leg Deadlift'], 'strength', 'R/W!', 'variable', ['back', 'glutes', 'hamstrings']],
    ['rowing', 'Rudern', ['Ruderergometer', 'Rowing Machine'], 'endurance', 'MIN+KM?', 'cardio_machine', ['endurance', 'indoor']],
    ['running', 'Laufen', ['Joggen', 'Laufband Laufen', 'Treadmill Running'], 'endurance', 'MIN+KM?', 'variable', ['endurance', 'indoor', 'outdoor']],
    ['russian_twist', 'Russian Twist', ['Rumpfdrehen sitzend'], 'strength', 'R/W?', 'variable', ['core']],
    ['seated_row', 'Seated Row', ['Rudern sitzend', 'Seated Cable Row', 'Cable Row', 'Chest-supported Row'], 'strength', 'R/W!', 'variable', ['back', 'biceps']],
    ['shoulder_press', 'Shoulder Press', ['Schulterpresse', 'Overhead Press', 'Military Press', 'Arnold Press'], 'strength', 'R/W!', 'variable', ['shoulders', 'triceps']],
    ['shrug', 'Shrug', ['Schulterheben', 'Shrugs'], 'strength', 'R/W!', 'variable', ['back', 'forearms']],
    ['side_plank', 'Side Plank', ['Seitstütz'], 'strength', 'T/-', 'bodyweight', ['core']],
    ['sit_up', 'Sit-up', ['Sit-ups', 'Rumpfaufrichten'], 'strength', 'R/W?', 'bodyweight', ['core', 'hip_flexors']],
    ['ski_erg', 'SkiErg', ['Skiergometer', 'Ski Ergometer'], 'endurance', 'MIN+KM?', 'cardio_machine', ['endurance', 'indoor']],
    ['sled_pull', 'Sled Pull', ['Schlitten ziehen'], 'strength', 'M/W?', 'variable', ['full_body']],
    ['sled_push', 'Sled Push', ['Schlitten schieben'], 'strength', 'M/W?', 'variable', ['full_body']],
    ['snatch', 'Snatch', ['Reißen', 'Power Snatch'], 'strength', 'R/W!', 'variable', ['full_body']],
    ['split_squat', 'Split Squat', ['Bulgarische Kniebeuge', 'Bulgarian Split Squat'], 'strength', 'R/W?', 'variable', ['glutes', 'hamstrings', 'quadriceps']],
    ['squat', 'Squat', ['Kniebeuge', 'Back Squat', 'Front Squat', 'Goblet Squat'], 'strength', 'R/W?', 'variable', ['glutes', 'hamstrings', 'quadriceps']],
    ['stair_climber', 'Stair Climber', ['Treppensteiger', 'Stairmaster'], 'endurance', 'MIN', 'cardio_machine', ['endurance', 'indoor']],
    ['step_up', 'Step-up', ['Aufsteigen', 'Box Step-up'], 'strength', 'R/W?', 'variable', ['glutes', 'hamstrings', 'quadriceps']],
    ['straight_arm_pulldown', 'Straight-arm Pulldown', ['Latzug mit gestreckten Armen'], 'strength', 'R/W!', 'cable', ['back']],
    ['swimming', 'Schwimmen', ['Swim'], 'sport', 'MIN+KM?', 'none', ['endurance', 'water_sport']],
    ['torso_rotation', 'Torso Rotation', ['Rumpfrotation', 'Rotary Torso'], 'strength', 'R/W?', 'variable', ['core']],
    ['triceps_extension', 'Triceps Extension', ['Trizepsdrücken', 'Triceps Pushdown', 'Overhead Triceps Extension'], 'strength', 'R/W!', 'variable', ['triceps']],
    ['upright_row', 'Upright Row', ['Aufrechtes Rudern'], 'strength', 'R/W!', 'variable', ['back', 'biceps', 'shoulders']],
    ['walking', 'Gehen', ['Spazieren', 'Laufband Gehen', 'Treadmill Walking'], 'endurance', 'MIN+KM?', 'variable', ['endurance', 'indoor', 'outdoor']],
    ['wall_sit', 'Wall Sit', ['Wandsitzen'], 'strength', 'T/-', 'bodyweight', ['glutes', 'quadriceps']]
  ];

  function asciiCompare(left, right) {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
  }

  function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
  }

  function deepFreeze(value, seen = new WeakSet()) {
    const freezeable =
      value !== null && (typeof value === 'object' || typeof value === 'function');
    if (!freezeable || seen.has(value)) return value;
    seen.add(value);
    Reflect.ownKeys(value).forEach((key) => deepFreeze(value[key], seen));
    return Object.freeze(value);
  }

  function normalizeSearchText(text) {
    if (typeof text !== 'string') {
      throw new TypeError('normalizeSearchText requires a string');
    }
    return text
      .normalize('NFKD')
      .toLowerCase()
      .replace(/ß/g, 'ss')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cloneFields(measurement) {
    const source = MEASUREMENT_POLICIES[measurement];
    if (!source) throw new Error(`Unknown measurement shorthand: ${measurement}`);
    return {
      assistance_kg: source.assistance_kg,
      distance_km: source.distance_km,
      distance_m: source.distance_m,
      duration_min: source.duration_min,
      duration_sec: source.duration_sec,
      note: source.note,
      reps: source.reps,
      weight_kg: source.weight_kg
    };
  }

  function createEntry(row) {
    const [key, label, aliases, category, measurement, equipment, tags] = row;
    const source = MEASUREMENT_POLICIES[measurement];
    const hasLoad =
      source.weight_kg !== 'forbidden' || source.assistance_kg !== 'forbidden';
    return {
      key,
      label,
      aliases: aliases.slice(),
      category,
      tracking_mode: source.tracking_mode,
      equipment,
      load_comparability: hasLoad ? 'device_relative' : 'not_applicable',
      fields: cloneFields(measurement),
      muscle_groups: category === 'strength' ? tags.slice() : [],
      sport_tags: category === 'strength' ? [] : tags.slice(),
      status: 'active'
    };
  }

  const CATALOG = {
    schema_version: SCHEMA_VERSION,
    catalog_version: CATALOG_VERSION,
    taxonomies: {
      categories: TAXONOMIES.categories.slice(),
      equipment: TAXONOMIES.equipment.slice(),
      muscle_groups: TAXONOMIES.muscle_groups.slice(),
      sport_tags: TAXONOMIES.sport_tags.slice()
    },
    field_definitions: FIELD_DEFINITIONS,
    entries: ENTRY_ROWS.map(createEntry)
  };

  function validateCatalog(candidate) {
    const errors = [];
    const errorKeys = new Set();

    function addError(code, path) {
      if (!ERROR_CODE_SET.has(code)) {
        throw new Error(`Internal validator error code: ${code}`);
      }
      const identity = `${path}\u0000${code}`;
      if (errorKeys.has(identity)) return;
      errorKeys.add(identity);
      errors.push({ code, path });
    }

    function checkExactKeys(value, expectedKeys, path) {
      if (!isRecord(value)) {
        addError('invalid_type', path);
        return false;
      }
      const actualKeys = Object.keys(value);
      const expected = new Set(expectedKeys);
      expectedKeys.forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
          addError('missing_field', `${path}.${key}`);
        }
      });
      actualKeys.forEach((key) => {
        if (!expected.has(key)) addError('unknown_field', `${path}.${key}`);
      });
      return (
        actualKeys.length === expectedKeys.length &&
        expectedKeys.every((key) => Object.prototype.hasOwnProperty.call(value, key))
      );
    }

    function validateString(value, path, { min = 1, max = Infinity } = {}) {
      if (typeof value !== 'string') {
        addError('invalid_type', path);
        return false;
      }
      if (value !== value.trim() || value.length < min || value.length > max) {
        addError('invalid_value', path);
        return false;
      }
      return true;
    }

    function validateExpectedObject(value, expected, path) {
      if (!isRecord(value)) {
        addError('invalid_type', path);
        return false;
      }
      let valid = checkExactKeys(value, Object.keys(expected), path);
      Object.keys(expected).forEach((key) => {
        if (!hasOwn(value, key)) return;
        const actualValue = value[key];
        const expectedValue = expected[key];
        const childPath = `${path}.${key}`;
        if (isRecord(expectedValue)) {
          if (!validateExpectedObject(actualValue, expectedValue, childPath)) {
            valid = false;
          }
          return;
        }
        if (typeof actualValue !== typeof expectedValue) {
          addError('invalid_type', childPath);
          valid = false;
          return;
        }
        if (!Object.is(actualValue, expectedValue)) {
          addError('invalid_value', childPath);
          valid = false;
        }
      });
      return valid;
    }

    function validateTokenArray(value, path, { allowEmpty = false } = {}) {
      const result = { valid: true, values: new Set() };
      if (!Array.isArray(value)) {
        addError('invalid_type', path);
        result.valid = false;
        return result;
      }
      if (!allowEmpty && value.length === 0) {
        addError('invalid_value', path);
        result.valid = false;
      }
      let previous = null;
      value.forEach((token, index) => {
        const tokenPath = `${path}[${index}]`;
        if (typeof token !== 'string') {
          addError('invalid_type', tokenPath);
          result.valid = false;
          previous = null;
          return;
        }
        if (!KEY_RE.test(token)) {
          addError('invalid_value', tokenPath);
          result.valid = false;
        }
        if (result.values.has(token)) {
          addError('duplicate_value', tokenPath);
          result.valid = false;
        }
        if (previous !== null && asciiCompare(previous, token) >= 0) {
          addError('invalid_order', tokenPath);
          result.valid = false;
        }
        result.values.add(token);
        previous = token;
      });
      return result;
    }

    function validateReferenceArray(value, path, taxonomyResult) {
      const result = validateTokenArray(value, path, { allowEmpty: true });
      if (result.valid && taxonomyResult.valid) {
        value.forEach((token, index) => {
          if (!taxonomyResult.values.has(token)) {
            addError('unknown_reference', `${path}[${index}]`);
            result.valid = false;
          }
        });
      }
      return result;
    }

    function validatePolicyObject(value, path) {
      if (!isRecord(value)) {
        addError('invalid_type', path);
        return false;
      }
      const exact = checkExactKeys(value, FIELD_KEYS, path);
      const actualOrder = Object.keys(value);
      if (
        actualOrder.length === FIELD_KEYS.length &&
        actualOrder.some((key, index) => key !== FIELD_KEYS[index])
      ) {
        addError('invalid_order', path);
      }
      let valid = exact;
      FIELD_KEYS.forEach((key) => {
        if (!hasOwn(value, key)) return;
        const policyPath = `${path}.${key}`;
        if (typeof value[key] !== 'string') {
          addError('invalid_type', policyPath);
          valid = false;
        } else if (!FIELD_POLICIES.includes(value[key])) {
          addError('invalid_value', policyPath);
          valid = false;
        }
      });
      return valid;
    }

    if (!isRecord(candidate)) {
      addError('invalid_type', '$');
      return deepFreeze({ valid: false, errors });
    }

    checkExactKeys(candidate, TOP_LEVEL_KEYS, '$');

    if (hasOwn(candidate, 'schema_version')) {
      if (typeof candidate.schema_version !== 'string') {
        addError('invalid_type', '$.schema_version');
      } else if (candidate.schema_version !== SCHEMA_VERSION) {
        addError('invalid_value', '$.schema_version');
      }
    }

    if (hasOwn(candidate, 'catalog_version')) {
      if (typeof candidate.catalog_version !== 'number') {
        addError('invalid_type', '$.catalog_version');
      } else if (
        !Number.isInteger(candidate.catalog_version) ||
        candidate.catalog_version < 1
      ) {
        addError('invalid_value', '$.catalog_version');
      }
    }

    const taxonomyResults = {
      categories: { valid: false, values: new Set() },
      equipment: { valid: false, values: new Set() },
      muscle_groups: { valid: false, values: new Set() },
      sport_tags: { valid: false, values: new Set() }
    };
    if (hasOwn(candidate, 'taxonomies') && isRecord(candidate.taxonomies)) {
      checkExactKeys(candidate.taxonomies, TAXONOMY_KEYS, '$.taxonomies');
      TAXONOMY_KEYS.forEach((key) => {
        if (hasOwn(candidate.taxonomies, key)) {
          const taxonomyPath = `$.taxonomies.${key}`;
          const result = validateTokenArray(
            candidate.taxonomies[key],
            taxonomyPath
          );
          if (result.valid) {
            candidate.taxonomies[key].forEach((token, index) => {
              if (!TAXONOMIES[key].includes(token)) {
                addError('invalid_value', `${taxonomyPath}[${index}]`);
                result.valid = false;
              }
            });
            if (
              TAXONOMIES[key].some(
                (token) => !result.values.has(token)
              )
            ) {
              addError('invalid_value', taxonomyPath);
              result.valid = false;
            }
          }
          taxonomyResults[key] = result;
        }
      });
    } else if (hasOwn(candidate, 'taxonomies')) {
      addError('invalid_type', '$.taxonomies');
    }

    if (hasOwn(candidate, 'field_definitions')) {
      validateExpectedObject(
        candidate.field_definitions,
        FIELD_DEFINITIONS,
        '$.field_definitions'
      );
    }

    const entryMeta = [];
    const seenKeys = new Set();
    if (hasOwn(candidate, 'entries') && !Array.isArray(candidate.entries)) {
      addError('invalid_type', '$.entries');
    } else if (hasOwn(candidate, 'entries')) {
      if (candidate.entries.length === 0) addError('invalid_value', '$.entries');
      let previousKey = null;
      candidate.entries.forEach((entry, index) => {
        const path = `$.entries[${index}]`;
        if (!isRecord(entry)) {
          addError('invalid_type', path);
          return;
        }
        checkExactKeys(entry, ENTRY_KEYS, path);

        let keyValid = false;
        if (hasOwn(entry, 'key')) {
          keyValid =
            validateString(entry.key, `${path}.key`, { max: 64 }) &&
            KEY_RE.test(entry.key);
          if (typeof entry.key === 'string' && !KEY_RE.test(entry.key)) {
            addError('invalid_value', `${path}.key`);
          }
        }
        if (keyValid) {
          if (seenKeys.has(entry.key)) addError('duplicate_value', `${path}.key`);
          if (previousKey !== null && asciiCompare(previousKey, entry.key) >= 0) {
            addError('invalid_order', `${path}.key`);
          }
          seenKeys.add(entry.key);
          previousKey = entry.key;
        } else {
          previousKey = null;
        }

        let labelValid = false;
        if (hasOwn(entry, 'label')) {
          labelValid = validateString(entry.label, `${path}.label`, { max: 80 });
          if (labelValid && !normalizeSearchText(entry.label)) {
            addError('invalid_value', `${path}.label`);
            labelValid = false;
          }
        }
        const aliasValues = [];
        let aliasesValid = false;
        if (hasOwn(entry, 'aliases') && !Array.isArray(entry.aliases)) {
          addError('invalid_type', `${path}.aliases`);
        } else if (hasOwn(entry, 'aliases')) {
          aliasesValid = true;
          if (entry.aliases.length > 12) {
            addError('invalid_value', `${path}.aliases`);
            aliasesValid = false;
          }
          const normalizedOwnForms = new Set();
          if (keyValid) normalizedOwnForms.add(normalizeSearchText(entry.key));
          if (labelValid) normalizedOwnForms.add(normalizeSearchText(entry.label));
          entry.aliases.forEach((alias, aliasIndex) => {
            const aliasPath = `${path}.aliases[${aliasIndex}]`;
            if (!validateString(alias, aliasPath, { max: 80 })) {
              aliasesValid = false;
              return;
            }
            const normalized = normalizeSearchText(alias);
            if (!normalized) {
              addError('invalid_value', aliasPath);
              aliasesValid = false;
              return;
            }
            if (normalizedOwnForms.has(normalized)) {
              addError('duplicate_value', aliasPath);
              aliasesValid = false;
              return;
            }
            normalizedOwnForms.add(normalized);
            aliasValues.push({ normalized, path: aliasPath });
          });
        }

        let categoryValid = false;
        let categoryKnown = false;
        if (hasOwn(entry, 'category')) {
          categoryValid =
            validateString(entry.category, `${path}.category`) &&
            KEY_RE.test(entry.category);
          if (typeof entry.category === 'string' && !KEY_RE.test(entry.category)) {
            addError('invalid_value', `${path}.category`);
          }
          if (categoryValid && taxonomyResults.categories.valid) {
            categoryKnown = taxonomyResults.categories.values.has(entry.category);
            if (!categoryKnown) {
              addError('unknown_reference', `${path}.category`);
            }
          }
        }

        let equipmentValid = false;
        let equipmentKnown = false;
        if (hasOwn(entry, 'equipment')) {
          equipmentValid =
            validateString(entry.equipment, `${path}.equipment`) &&
            KEY_RE.test(entry.equipment);
          if (typeof entry.equipment === 'string' && !KEY_RE.test(entry.equipment)) {
            addError('invalid_value', `${path}.equipment`);
          }
          if (equipmentValid && taxonomyResults.equipment.valid) {
            equipmentKnown = taxonomyResults.equipment.values.has(entry.equipment);
            if (!equipmentKnown) {
              addError('unknown_reference', `${path}.equipment`);
            }
          }
        }

        let trackingValid = false;
        if (hasOwn(entry, 'tracking_mode')) {
          trackingValid = validateString(
            entry.tracking_mode,
            `${path}.tracking_mode`
          );
          if (trackingValid && !TRACKING_MODES.includes(entry.tracking_mode)) {
            addError('invalid_value', `${path}.tracking_mode`);
          }
        }

        let comparabilityValid = false;
        if (hasOwn(entry, 'load_comparability')) {
          comparabilityValid = validateString(
            entry.load_comparability,
            `${path}.load_comparability`
          );
          if (
            comparabilityValid &&
            !LOAD_COMPARABILITY.includes(entry.load_comparability)
          ) {
            addError('invalid_value', `${path}.load_comparability`);
          }
        }

        let statusValid = false;
        let statusKnown = false;
        if (hasOwn(entry, 'status')) {
          statusValid = validateString(entry.status, `${path}.status`);
          statusKnown = statusValid && ENTRY_STATUSES.includes(entry.status);
          if (statusValid && !statusKnown) {
            addError('invalid_value', `${path}.status`);
          }
        }

        const invalidReferenceArray = { valid: false, values: new Set() };
        const muscleResult = hasOwn(entry, 'muscle_groups')
          ? validateReferenceArray(
              entry.muscle_groups,
              `${path}.muscle_groups`,
              taxonomyResults.muscle_groups
            )
          : invalidReferenceArray;
        const sportResult = hasOwn(entry, 'sport_tags')
          ? validateReferenceArray(
              entry.sport_tags,
              `${path}.sport_tags`,
              taxonomyResults.sport_tags
            )
          : invalidReferenceArray;
        const policiesValid = hasOwn(entry, 'fields')
          ? validatePolicyObject(entry.fields, `${path}.fields`)
          : false;

        if (
          categoryKnown &&
          trackingValid &&
          TRACKING_MODES.includes(entry.tracking_mode) &&
          muscleResult.valid &&
          sportResult.valid
        ) {
          if (entry.category === 'strength') {
            if (entry.tracking_mode !== 'strength_sets') {
              addError('policy_mismatch', `${path}.tracking_mode`);
            }
            if (entry.muscle_groups.length === 0) {
              addError('policy_mismatch', `${path}.muscle_groups`);
            }
            if (entry.sport_tags.length !== 0) {
              addError('policy_mismatch', `${path}.sport_tags`);
            }
          } else if (entry.category === 'endurance' || entry.category === 'sport') {
            if (entry.tracking_mode === 'strength_sets') {
              addError('policy_mismatch', `${path}.tracking_mode`);
            }
            if (entry.muscle_groups.length !== 0) {
              addError('policy_mismatch', `${path}.muscle_groups`);
            }
            if (entry.sport_tags.length === 0) {
              addError('policy_mismatch', `${path}.sport_tags`);
            }
          } else {
            addError('policy_mismatch', `${path}.category`);
          }
        }

        if (
          policiesValid &&
          trackingValid &&
          TRACKING_MODES.includes(entry.tracking_mode) &&
          comparabilityValid &&
          LOAD_COMPARABILITY.includes(entry.load_comparability)
        ) {
          const fields = entry.fields;
          const primaryPolicies = [
            fields.reps,
            fields.duration_sec,
            fields.distance_m
          ];
          const activeLoads = [
            fields.weight_kg,
            fields.assistance_kg
          ].filter((policy) => policy !== 'forbidden').length;
          const hasWeight = fields.weight_kg !== 'forbidden';
          const hasAssistance = fields.assistance_kg !== 'forbidden';

          if (fields.note !== 'optional') {
            addError('policy_mismatch', `${path}.fields.note`);
          }

          if (entry.tracking_mode === 'strength_sets') {
            if (
              primaryPolicies.filter((policy) => policy === 'required').length !== 1 ||
              primaryPolicies.some(
                (policy) => policy !== 'required' && policy !== 'forbidden'
              )
            ) {
              addError('policy_mismatch', `${path}.fields`);
            }
            if (
              fields.duration_min !== 'forbidden' ||
              fields.distance_km !== 'forbidden' ||
              activeLoads > 1
            ) {
              addError('policy_mismatch', `${path}.fields`);
            }
          } else if (entry.tracking_mode === 'duration') {
            if (
              fields.duration_min !== 'required' ||
              fields.distance_km !== 'forbidden' ||
              fields.reps !== 'forbidden' ||
              fields.duration_sec !== 'forbidden' ||
              fields.distance_m !== 'forbidden' ||
              activeLoads !== 0
            ) {
              addError('policy_mismatch', `${path}.fields`);
            }
          } else if (
            fields.duration_min !== 'required' ||
            fields.distance_km !== 'optional' ||
            fields.reps !== 'forbidden' ||
            fields.duration_sec !== 'forbidden' ||
            fields.distance_m !== 'forbidden' ||
            activeLoads !== 0
          ) {
            addError('policy_mismatch', `${path}.fields`);
          }

          if (!hasWeight && !hasAssistance) {
            if (entry.load_comparability !== 'not_applicable') {
              addError('policy_mismatch', `${path}.load_comparability`);
            }
          } else if (hasAssistance) {
            if (entry.load_comparability !== 'device_relative') {
              addError('policy_mismatch', `${path}.load_comparability`);
            }
          } else {
            if (
              !['device_relative', 'standardized'].includes(
                entry.load_comparability
              )
            ) {
              addError('policy_mismatch', `${path}.load_comparability`);
            } else if (
              equipmentKnown &&
              ['cable', 'machine', 'variable'].includes(entry.equipment) &&
              entry.load_comparability !== 'device_relative'
            ) {
              addError('policy_mismatch', `${path}.load_comparability`);
            }
          }
        }

        entryMeta.push({
          key: keyValid ? entry.key : null,
          status: statusKnown ? entry.status : null,
          forms: [
            ...(keyValid
              ? [{ normalized: normalizeSearchText(entry.key), path: `${path}.key` }]
              : []),
            ...(labelValid
              ? [
                  {
                    normalized: normalizeSearchText(entry.label),
                    path: `${path}.label`
                  }
                ]
              : []),
            ...(aliasesValid ? aliasValues : [])
          ]
        });
      });
    }

    const formOwners = new Map();
    entryMeta.forEach((meta) => {
      if (meta.status !== 'active' || meta.key === null) return;
      meta.forms.forEach((form) => {
        const owner = formOwners.get(form.normalized);
        if (owner && owner.key !== meta.key) {
          addError('normalized_collision', form.path);
          return;
        }
        if (!owner) formOwners.set(form.normalized, { key: meta.key, path: form.path });
      });
    });

    errors.sort((left, right) => {
      const pathOrder = asciiCompare(left.path, right.path);
      return pathOrder !== 0 ? pathOrder : asciiCompare(left.code, right.code);
    });
    return deepFreeze({ valid: errors.length === 0, errors });
  }

  const builtInValidation = validateCatalog(CATALOG);
  if (!builtInValidation.valid) {
    const error = new Error('Activity V2 built-in catalog is invalid');
    error.code = 'activity_v2_catalog_invalid';
    error.validation = builtInValidation;
    throw error;
  }

  deepFreeze(CATALOG);

  const ENTRY_BY_KEY = new Map(CATALOG.entries.map((entry) => [entry.key, entry]));
  const SEARCH_INDEX = CATALOG.entries
    .filter((entry) => entry.status === 'active')
    .map((entry) => ({
      entry,
      forms: [
        { normalized: normalizeSearchText(entry.label), source_rank: 0 },
        { normalized: normalizeSearchText(entry.key), source_rank: 1 },
        ...entry.aliases.map((alias) => ({
          normalized: normalizeSearchText(alias),
          source_rank: 2
        }))
      ]
    }));
  const EMPTY_RESULTS = Object.freeze([]);

  function getCatalog() {
    return CATALOG;
  }

  function getEntryByKey(key) {
    if (typeof key !== 'string') {
      throw new TypeError('getEntryByKey requires a string');
    }
    return ENTRY_BY_KEY.get(key) || null;
  }

  function compareRank(left, right) {
    if (left.match_class !== right.match_class) {
      return left.match_class - right.match_class;
    }
    if (left.source_rank !== right.source_rank) {
      return left.source_rank - right.source_rank;
    }
    return asciiCompare(left.entry.key, right.entry.key);
  }

  function classifyForm(query, queryTokens, form) {
    const exactClass =
      form.normalized === query ? (form.source_rank === 2 ? 1 : 0) : null;
    if (exactClass !== null) {
      return {
        match_class: exactClass,
        source_rank: exactClass === 1 ? 0 : form.source_rank
      };
    }
    if (form.normalized.startsWith(query)) {
      return { match_class: 2, source_rank: form.source_rank };
    }
    const formTokens = form.normalized.split(' ');
    const tokenMatch = queryTokens.every((queryToken) =>
      formTokens.some((formToken) => formToken.startsWith(queryToken))
    );
    return tokenMatch
      ? { match_class: 3, source_rank: form.source_rank }
      : null;
  }

  function search(query, options) {
    if (options === undefined) options = {};
    if (!isRecord(options)) throw new TypeError('search options must be an object');
    const optionKeys = Object.keys(options);
    if (optionKeys.some((key) => key !== 'limit')) {
      throw new TypeError('search options contain an unknown field');
    }
    const limit = hasOwn(options, 'limit') ? options.limit : 20;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new RangeError('search limit must be an integer from 1 to 50');
    }

    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return EMPTY_RESULTS;
    const queryTokens = [...new Set(normalizedQuery.split(' '))];
    const matches = [];

    SEARCH_INDEX.forEach((indexedEntry) => {
      let best = null;
      indexedEntry.forms.forEach((form) => {
        const classification = classifyForm(normalizedQuery, queryTokens, form);
        if (!classification) return;
        const candidate = {
          entry: indexedEntry.entry,
          match_class: classification.match_class,
          source_rank: classification.source_rank
        };
        if (best === null || compareRank(candidate, best) < 0) best = candidate;
      });
      if (best !== null) matches.push(best);
    });

    if (matches.length === 0) return EMPTY_RESULTS;
    matches.sort(compareRank);
    return Object.freeze(matches.slice(0, limit).map((match) => match.entry));
  }

  const semanticsApi = deepFreeze({
    getCatalog,
    getEntryByKey,
    normalizeSearchText,
    validateCatalog,
    search
  });

  if (root.AppModules === undefined) {
    root.AppModules = {};
  } else if (!isRecord(root.AppModules)) {
    throw new TypeError('AppModules must be an object');
  }
  if (root.AppModules.activityV2 === undefined) {
    root.AppModules.activityV2 = {};
  } else if (!isRecord(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be an object');
  }
  if ('semantics' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.semantics is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }
  Object.defineProperty(root.AppModules.activityV2, 'semantics', {
    value: semanticsApi,
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);

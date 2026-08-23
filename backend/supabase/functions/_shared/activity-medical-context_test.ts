import {
  type ActivityConsumerUnit,
  aggregateActivityUnits,
} from "../midas-monthly-report/activity-consumer.ts";
import {
  ACTIVITY_MEDICAL_CONTEXT_SCHEMA,
  ActivityMedicalContextError,
  createActivityMedicalContext,
  validateActivityMedicalContext,
} from "./activity-medical-context.ts";

const TODAY = "2026-08-23";
const SNAPSHOT_RANGE = {
  from: "2026-02-23",
  to: "2026-04-19",
  inclusive_days: 56,
};
const FIRST_WINDOW = { from: "2026-02-23", to: "2026-03-22" };
const SECOND_WINDOW = { from: "2026-03-23", to: "2026-04-19" };

const assert = (condition: boolean, message = "Assertion failed") => {
  if (!condition) throw new Error(message);
};

const assertEquals = (actual: unknown, expected: unknown) => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, received ${actualJson}`);
  }
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const uuid = (value: number) =>
  `00000000-0000-4000-8000-${String(value).padStart(12, "0")}`;

const unit = (
  id: number,
  day: string,
  source: ActivityConsumerUnit["source"],
): ActivityConsumerUnit => ({
  source,
  id: uuid(id),
  day,
  occurred_at: `${day}T12:00:00.000Z`,
  label: source === "activity_v1" ? `V1 ${id}` : `V2 ${id}`,
  duration_min: source === "activity_v1" ? 45 : 60,
  note: null,
  item_count: source === "activity_v1" ? null : 2,
});

const snapshot = aggregateActivityUnits(
  [
    unit(1, "2026-03-01", "activity_v1"),
    unit(2, "2026-03-01", "activity_v2"),
    unit(3, "2026-03-02", "activity_v2"),
    unit(4, "2026-03-02", "activity_v2"),
    unit(5, "2026-03-08", "activity_v1"),
    unit(6, "2026-03-09", "activity_v2"),
    unit(7, "2026-03-15", "activity_v1"),
    unit(8, "2026-03-22", "activity_v2"),
    unit(9, "2026-03-29", "activity_v2"),
    unit(10, "2026-04-01", "activity_v1"),
    unit(11, "2026-04-19", "activity_v2"),
  ],
  SNAPSHOT_RANGE,
  TODAY,
);

const assertError = (
  callback: () => unknown,
  code: string,
) => {
  let caught: unknown;
  try {
    callback();
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof ActivityMedicalContextError);
  assertEquals((caught as ActivityMedicalContextError).code, code);
  assertEquals(
    (caught as Error).message,
    "The activity medical context is invalid.",
  );
  ["cause", "payload", "snapshot", "jwt", "details"].forEach((key) =>
    assert(!Object.hasOwn(caught as object, key), `Unexpected ${key}`)
  );
};

Deno.test("T-ACT-R12-01 projects unique Vienna days and Monday weeks", () => {
  const context = createActivityMedicalContext(snapshot, FIRST_WINDOW);
  assertEquals(context, {
    schema_version: ACTIVITY_MEDICAL_CONTEXT_SCHEMA,
    timezone: "Europe/Vienna",
    range: { ...FIRST_WINDOW, inclusive_days: 28 },
    active_days: [
      "2026-03-01",
      "2026-03-02",
      "2026-03-08",
      "2026-03-09",
      "2026-03-15",
      "2026-03-22",
    ],
    active_day_count: 6,
    active_week_starts: [
      "2026-02-23",
      "2026-03-02",
      "2026-03-09",
      "2026-03-16",
    ],
    weeks_with_entries: 4,
  });
  assert(Object.isFrozen(context));
  assert(Object.isFrozen(context.range));
  assert(Object.isFrozen(context.active_days));
  assert(Object.isFrozen(context.active_week_starts));
  assertEquals(validateActivityMedicalContext(clone(context)), context);
});

Deno.test("T-ACT-R12-01 preserves an empty contained window", () => {
  const emptySnapshot = aggregateActivityUnits(
    [],
    { ...FIRST_WINDOW, inclusive_days: 28 },
    TODAY,
  );
  const context = createActivityMedicalContext(emptySnapshot, FIRST_WINDOW);
  assertEquals(context, {
    schema_version: ACTIVITY_MEDICAL_CONTEXT_SCHEMA,
    timezone: "Europe/Vienna",
    range: { ...FIRST_WINDOW, inclusive_days: 28 },
    active_days: [],
    active_day_count: 0,
    active_week_starts: [],
    weeks_with_entries: 0,
  });
  assert(Object.isFrozen(context));
  assert(Object.isFrozen(context.range));
  assert(Object.isFrozen(context.active_days));
  assert(Object.isFrozen(context.active_week_starts));
  assertEquals(validateActivityMedicalContext(clone(context)), context);
});

Deno.test("T-ACT-R12-01 reuses one wider snapshot for multiple windows", () => {
  const before = JSON.stringify(snapshot);
  const first = createActivityMedicalContext(snapshot, FIRST_WINDOW);
  const second = createActivityMedicalContext(snapshot, SECOND_WINDOW);
  assertEquals(first.active_day_count, 6);
  assertEquals(second.active_days, [
    "2026-03-29",
    "2026-04-01",
    "2026-04-19",
  ]);
  assertEquals(second.active_week_starts, [
    "2026-03-23",
    "2026-03-30",
    "2026-04-13",
  ]);
  assertEquals(JSON.stringify(snapshot), before);
  assert(Object.isFrozen(snapshot));
});

Deno.test("T-ACT-R12-01 rejects invalid or uncontained windows", () => {
  assertError(
    () =>
      createActivityMedicalContext(snapshot, {
        from: "2026-02-23",
        to: "2026-03-21",
      }),
    "INVALID_WINDOW",
  );
  assertError(
    () =>
      createActivityMedicalContext(snapshot, {
        from: "2026-04-01",
        to: "2026-04-28",
      }),
    "WINDOW_NOT_CONTAINED",
  );
  assertError(
    () =>
      createActivityMedicalContext(snapshot, {
        ...FIRST_WINDOW,
        extra: true,
      }),
    "INVALID_WINDOW",
  );
});

Deno.test("T-ACT-R12-01 delegates strict R11 snapshot validation", () => {
  const extra = { ...clone(snapshot), extra: true };
  assertError(
    () => createActivityMedicalContext(extra, FIRST_WINDOW),
    "INVALID_SNAPSHOT",
  );
  const unsorted = clone(snapshot);
  unsorted.units.reverse();
  assertError(
    () => createActivityMedicalContext(unsorted, FIRST_WINDOW),
    "INVALID_SNAPSHOT",
  );
  const duplicate = clone(snapshot);
  duplicate.units[1] = clone(duplicate.units[0]);
  assertError(
    () => createActivityMedicalContext(duplicate, FIRST_WINDOW),
    "INVALID_SNAPSHOT",
  );
  const accessor = clone(snapshot);
  Object.defineProperty(accessor, "units", {
    enumerable: true,
    get() {
      throw new Error("raw snapshot secret");
    },
  });
  assertError(
    () => createActivityMedicalContext(accessor, FIRST_WINDOW),
    "INVALID_SNAPSHOT",
  );
});

Deno.test("T-ACT-R12-01 validates exact dense immutable context postimages", () => {
  const valid = clone(createActivityMedicalContext(snapshot, FIRST_WINDOW));
  assertError(
    () => validateActivityMedicalContext({ ...valid, extra: true }),
    "INVALID_CONTEXT",
  );
  assertError(
    () => validateActivityMedicalContext({ ...valid, active_day_count: 7 }),
    "INVALID_CONTEXT",
  );
  const duplicate = clone(valid);
  duplicate.active_days[1] = duplicate.active_days[0];
  assertError(
    () => validateActivityMedicalContext(duplicate),
    "INVALID_CONTEXT",
  );
  const sparse = clone(valid);
  sparse.active_days.length = 28;
  assertError(
    () => validateActivityMedicalContext(sparse),
    "INVALID_CONTEXT",
  );
  const wrongWeek = clone(valid);
  wrongWeek.active_week_starts[0] = "2026-02-24";
  assertError(
    () => validateActivityMedicalContext(wrongWeek),
    "INVALID_CONTEXT",
  );
  const frozen = validateActivityMedicalContext(valid);
  assert(Object.isFrozen(frozen));
  assert(Object.isFrozen(frozen.active_days));
});

Deno.test("T-ACT-R12-01 handles year and DST boundaries as calendar days", () => {
  const range = {
    from: "2025-12-15",
    to: "2026-04-05",
    inclusive_days: 112,
  };
  const boundarySnapshot = aggregateActivityUnits(
    [
      unit(20, "2025-12-29", "activity_v1"),
      unit(21, "2026-01-01", "activity_v2"),
      unit(22, "2026-03-29", "activity_v1"),
      unit(23, "2026-03-30", "activity_v2"),
    ],
    range,
    TODAY,
  );
  const year = createActivityMedicalContext(boundarySnapshot, {
    from: "2025-12-22",
    to: "2026-01-18",
  });
  assertEquals(year.active_week_starts, ["2025-12-29"]);
  const dst = createActivityMedicalContext(boundarySnapshot, {
    from: "2026-03-09",
    to: "2026-04-05",
  });
  assertEquals(dst.active_days, ["2026-03-29", "2026-03-30"]);
  assertEquals(dst.active_week_starts, ["2026-03-23", "2026-03-30"]);
});

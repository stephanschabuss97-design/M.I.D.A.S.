import {
  type ActivityConsumerUnit,
  aggregateActivityUnits,
} from "../midas-monthly-report/activity-consumer.ts";
import { createActivityMedicalContext } from "../_shared/activity-medical-context.ts";
import {
  deriveProteinActivityCompatibility,
  ProteinActivityCompatibilityError,
} from "./activity-compatibility.ts";

const TODAY = "2026-08-23";
const WINDOW = { from: "2026-05-04", to: "2026-05-31" };
const RANGE = { ...WINDOW, inclusive_days: 28 };

const assert = (condition: boolean, message = "Assertion failed") => {
  if (!condition) throw new Error(message);
};

const assertEquals = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }`,
    );
  }
};

const uuid = (value: number) =>
  `10000000-0000-4000-8000-${String(value).padStart(12, "0")}`;

const unit = (
  id: number,
  day: string,
  source: ActivityConsumerUnit["source"],
  detailVariant = false,
): ActivityConsumerUnit => ({
  source,
  id: uuid(id),
  day,
  occurred_at: `${day}T10:00:00.000Z`,
  label: detailVariant ? `Andere Aktivität ${id}` : `Aktivität ${id}`,
  duration_min: detailVariant ? 999 : 30,
  note: detailVariant ? "Andere Detaildaten" : null,
  item_count: source === "activity_v1" ? null : detailVariant ? 50 : 1,
});

const contextFor = (
  days: string[],
  detailVariant = false,
  sameDayMixed = false,
) => {
  const units = days.map((day, index) =>
    unit(
      index + 1,
      day,
      index % 2 === 0 ? "activity_v1" : "activity_v2",
      detailVariant,
    )
  );
  if (sameDayMixed && days.length) {
    units.push(unit(90, days[0], "activity_v2", detailVariant));
    units.push(unit(91, days[0], "activity_v2", detailVariant));
  }
  const snapshot = aggregateActivityUnits(units, RANGE, TODAY);
  return createActivityMedicalContext(snapshot, WINDOW);
};

const DAYS = [
  "2026-05-04",
  "2026-05-06",
  "2026-05-11",
  "2026-05-15",
  "2026-05-20",
  "2026-05-31",
];

Deno.test("T-ACT-R12-02 preserves ACT thresholds and modifiers", () => {
  const cases = [
    [0, "ACT1", 0.1],
    [1, "ACT1", 0.1],
    [2, "ACT2", 0.2],
    [5, "ACT2", 0.2],
    [6, "ACT3", 0.3],
  ] as const;
  for (const [count, level, modifier] of cases) {
    const result = deriveProteinActivityCompatibility(
      contextFor(DAYS.slice(0, count)),
    );
    assertEquals(result, {
      active_days_28d: count,
      activity_level: level,
      activity_modifier: modifier,
    });
    assert(Object.isFrozen(result));
  }
});

Deno.test("T-ACT-R12-02 counts mixed same-day units once", () => {
  const result = deriveProteinActivityCompatibility(
    contextFor(DAYS.slice(0, 2), false, true),
  );
  assertEquals(result, {
    active_days_28d: 2,
    activity_level: "ACT2",
    activity_modifier: 0.2,
  });
});

Deno.test("T-ACT-R12-02 ignores source and training details", () => {
  const baseline = deriveProteinActivityCompatibility(contextFor(DAYS));
  const varied = deriveProteinActivityCompatibility(contextFor(DAYS, true));
  assertEquals(varied, baseline);
});

Deno.test("T-ACT-R12-02 sanitizes invalid contexts", () => {
  const invalid = {
    ...JSON.parse(JSON.stringify(contextFor(DAYS.slice(0, 2)))),
    active_day_count: 99,
    raw: "secret",
  };
  let caught: unknown;
  try {
    deriveProteinActivityCompatibility(invalid);
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof ProteinActivityCompatibilityError);
  assertEquals(
    (caught as ProteinActivityCompatibilityError).code,
    "INVALID_CONTEXT",
  );
  assertEquals(
    (caught as Error).message,
    "The protein activity context is invalid.",
  );
  ["cause", "payload", "context", "details"].forEach((key) =>
    assert(!Object.hasOwn(caught as object, key), `Unexpected ${key}`)
  );
});

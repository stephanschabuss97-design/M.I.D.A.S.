import {
  type ActivityConsumerUnit,
  aggregateActivityUnits,
} from "../midas-monthly-report/activity-consumer.ts";
import { createActivityMedicalContext } from "../_shared/activity-medical-context.ts";
import {
  deriveTrendpilotActivityCompatibility,
  TrendpilotActivityCompatibilityError,
} from "./activity-compatibility.ts";

const TODAY = "2026-08-23";
const WINDOW = { from: "2026-05-04", to: "2026-05-31" };

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
  `20000000-0000-4000-8000-${String(value).padStart(12, "0")}`;

const unit = (
  id: number,
  day: string,
  source: ActivityConsumerUnit["source"],
): ActivityConsumerUnit => ({
  source,
  id: uuid(id),
  day,
  occurred_at: `${day}T11:00:00.000Z`,
  label: `Aktivität ${id}`,
  duration_min: id + 10,
  note: null,
  item_count: source === "activity_v1" ? null : 1,
});

const contextFor = (
  days: string[],
  window = WINDOW,
  sameDayMixed = false,
) => {
  const units = days.map((day, index) =>
    unit(index + 1, day, index % 2 === 0 ? "activity_v1" : "activity_v2")
  );
  if (sameDayMixed && days.length) {
    units.push(unit(90, days[0], "activity_v2"));
    units.push(unit(91, days[0], "activity_v2"));
  }
  const snapshot = aggregateActivityUnits(units, {
    ...window,
    inclusive_days: 28,
  }, TODAY);
  return createActivityMedicalContext(snapshot, window);
};

Deno.test("T-ACT-R12-03 preserves Trendpilot gates and levels", () => {
  const cases = [
    [[], "unknown", 0],
    [["2026-05-04", "2026-05-05", "2026-05-06"], "unknown", 1],
    [["2026-05-10", "2026-05-11"], "low", 2],
    [["2026-05-10", "2026-05-11", "2026-05-12"], "low", 2],
    [["2026-05-04", "2026-05-05", "2026-05-06", "2026-05-07"], "ok", 1],
    [
      [
        "2026-05-04",
        "2026-05-05",
        "2026-05-06",
        "2026-05-07",
        "2026-05-11",
        "2026-05-18",
        "2026-05-25",
      ],
      "ok",
      4,
    ],
    [
      [
        "2026-05-04",
        "2026-05-05",
        "2026-05-06",
        "2026-05-07",
        "2026-05-11",
        "2026-05-12",
        "2026-05-18",
        "2026-05-25",
      ],
      "high",
      4,
    ],
  ] as const;
  for (const [days, level, weeks] of cases) {
    const result = deriveTrendpilotActivityCompatibility(contextFor([...days]));
    assertEquals(result, {
      level,
      active_days_4w: days.length,
      weeks_with_entries_4w: weeks,
    });
    assert(Object.isFrozen(result));
    assertEquals(Object.keys(result), [
      "level",
      "active_days_4w",
      "weeks_with_entries_4w",
    ]);
    assert(!Object.hasOwn(result, "sessions_4w"));
  }
});

Deno.test("T-ACT-R12-03 counts same-day mixed units once", () => {
  const result = deriveTrendpilotActivityCompatibility(contextFor(
    [
      "2026-05-10",
      "2026-05-11",
    ],
    WINDOW,
    true,
  ));
  assertEquals(result, {
    level: "low",
    active_days_4w: 2,
    weeks_with_entries_4w: 2,
  });
});

Deno.test("T-ACT-R12-03 keeps Monday weeks stable across Vienna DST", () => {
  const window = { from: "2026-03-09", to: "2026-04-05" };
  const result = deriveTrendpilotActivityCompatibility(contextFor([
    "2026-03-29",
    "2026-03-30",
  ], window));
  assertEquals(result, {
    level: "low",
    active_days_4w: 2,
    weeks_with_entries_4w: 2,
  });
});

Deno.test("T-ACT-R12-03 sanitizes invalid contexts", () => {
  const invalid = {
    ...JSON.parse(JSON.stringify(contextFor(["2026-05-04"]))),
    weeks_with_entries: 9,
  };
  let caught: unknown;
  try {
    deriveTrendpilotActivityCompatibility(invalid);
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof TrendpilotActivityCompatibilityError);
  assertEquals(
    (caught as TrendpilotActivityCompatibilityError).code,
    "INVALID_CONTEXT",
  );
  assertEquals(
    (caught as Error).message,
    "The Trendpilot activity context is invalid.",
  );
  ["cause", "payload", "context", "details"].forEach((key) =>
    assert(!Object.hasOwn(caught as object, key), `Unexpected ${key}`)
  );
});

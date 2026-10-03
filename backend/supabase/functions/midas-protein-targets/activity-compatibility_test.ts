import {
  deriveProteinActivityCompatibility,
  ProteinActivityCompatibilityError,
} from "./activity-compatibility.ts";

const TODAY = "2026-08-23";
const WINDOW = { from: "2026-05-04", to: "2026-05-31" };
const RANGE = { ...WINDOW, inclusive_days: 28 } as const;

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

const contextFor = (
  days: string[],
  _detailVariant = false,
  _sameDayMixed = false,
) => ({
  schema_version: "midas.activity-protein-days.v1" as const,
  timezone: "Europe/Vienna" as const,
  range: RANGE,
  active_days: days,
  active_day_count: days.length,
});

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

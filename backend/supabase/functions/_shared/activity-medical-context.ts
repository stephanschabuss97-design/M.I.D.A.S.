import {
  ACTIVITY_CONSUMER_TIME_ZONE,
  type ActivityConsumerSnapshot,
  validateActivitySnapshot,
} from "../midas-monthly-report/activity-consumer.ts";

export const ACTIVITY_MEDICAL_CONTEXT_SCHEMA =
  "midas.activity-medical-context.v1";

const SAFE_MESSAGE = "The activity medical context is invalid.";
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;
const WINDOW_DAYS = 28;
const TOP_LEVEL_KEYS = [
  "schema_version",
  "timezone",
  "range",
  "active_days",
  "active_day_count",
  "active_week_starts",
  "weeks_with_entries",
] as const;
const RANGE_KEYS = ["from", "to", "inclusive_days"] as const;

type DataRecord = Record<string, unknown>;

export type ActivityMedicalContext = {
  schema_version: typeof ACTIVITY_MEDICAL_CONTEXT_SCHEMA;
  timezone: typeof ACTIVITY_CONSUMER_TIME_ZONE;
  range: {
    from: string;
    to: string;
    inclusive_days: 28;
  };
  active_days: string[];
  active_day_count: number;
  active_week_starts: string[];
  weeks_with_entries: number;
};

export class ActivityMedicalContextError extends Error {
  code: string;

  constructor(code: string) {
    super(SAFE_MESSAGE);
    this.name = "ActivityMedicalContextError";
    this.code = code;
  }
}

const fail = (code: string): never => {
  throw new ActivityMedicalContextError(code);
};

const guard = <T>(code: string, callback: () => T): T => {
  try {
    return callback();
  } catch (error) {
    if (error instanceof ActivityMedicalContextError) throw error;
    return fail(code);
  }
};

const deepFreeze = <T>(value: T, seen = new WeakSet<object>()): T => {
  if (
    value === null ||
    (typeof value !== "object" && typeof value !== "function") ||
    seen.has(value as object)
  ) {
    return value;
  }
  seen.add(value as object);
  Reflect.ownKeys(value as object).forEach((key) =>
    deepFreeze((value as DataRecord)[key as string], seen)
  );
  return Object.freeze(value);
};

const isPlainRecord = (value: unknown): value is DataRecord => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
};

const readExact = (
  value: unknown,
  expectedKeys: readonly string[],
  code: string,
): DataRecord => {
  if (!isPlainRecord(value)) fail(code);
  const keys = Reflect.ownKeys(value as object);
  if (
    keys.length !== expectedKeys.length ||
    keys.some((key) => typeof key !== "string" || !expectedKeys.includes(key))
  ) {
    fail(code);
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (
    expectedKeys.some((key) => {
      const descriptor = descriptors[key];
      return !descriptor ||
        !descriptor.enumerable ||
        !Object.prototype.hasOwnProperty.call(descriptor, "value");
    })
  ) {
    fail(code);
  }
  return Object.fromEntries(
    expectedKeys.map((key) => [key, descriptors[key].value]),
  );
};

const readDenseArray = (
  value: unknown,
  maxLength: number,
  code: string,
): unknown[] => {
  if (!Array.isArray(value)) fail(code);
  const prototype = Object.getPrototypeOf(value);
  if (
    prototype === null ||
    Object.getPrototypeOf(prototype) === null ||
    Object.getPrototypeOf(Object.getPrototypeOf(prototype)) !== null
  ) {
    fail(code);
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const length = descriptors.length?.value;
  if (!Number.isSafeInteger(length) || length < 0 || length > maxLength) {
    fail(code);
  }
  const expectedKeys = [
    ...Array.from({ length }, (_, index) => String(index)),
    "length",
  ];
  const keys = Reflect.ownKeys(value as object);
  if (
    keys.length !== expectedKeys.length ||
    keys.some((key) => typeof key !== "string" || !expectedKeys.includes(key))
  ) {
    fail(code);
  }
  if (
    expectedKeys.slice(0, -1).some((key) => {
      const descriptor = descriptors[key];
      return !descriptor ||
        !descriptor.enumerable ||
        !Object.prototype.hasOwnProperty.call(descriptor, "value");
    })
  ) {
    fail(code);
  }
  return expectedKeys.slice(0, -1).map((key) => descriptors[key].value);
};

const canonicalDay = (value: unknown): value is string => {
  if (
    typeof value !== "string" || !DAY_RE.test(value) || value.startsWith("0000")
  ) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
};

const dayNumber = (value: string) =>
  Math.trunc(Date.parse(`${value}T00:00:00.000Z`) / DAY_MS);

const dayFromNumber = (value: number) =>
  new Date(value * DAY_MS).toISOString().slice(0, 10);

const weekStartForDay = (day: string) => {
  const number = dayNumber(day);
  const weekday = new Date(number * DAY_MS).getUTCDay();
  return dayFromNumber(number - ((weekday + 6) % 7));
};

const readWindow = (value: unknown, code: string) => {
  const window = readExact(value, ["from", "to"], code);
  if (!canonicalDay(window.from) || !canonicalDay(window.to)) fail(code);
  const from = window.from as string;
  const to = window.to as string;
  if (dayNumber(to) - dayNumber(from) + 1 !== WINDOW_DAYS) fail(code);
  return { from, to };
};

const buildContext = (
  snapshot: ActivityConsumerSnapshot,
  window: { from: string; to: string },
): ActivityMedicalContext => {
  const activeDays = Array.from(
    new Set(
      snapshot.units
        .map((unit) => unit.day)
        .filter((day) => day >= window.from && day <= window.to),
    ),
  )
    .sort();
  const activeWeekStarts = Array.from(
    new Set(activeDays.map(weekStartForDay)),
  ).sort();
  return {
    schema_version: ACTIVITY_MEDICAL_CONTEXT_SCHEMA,
    timezone: ACTIVITY_CONSUMER_TIME_ZONE,
    range: {
      from: window.from,
      to: window.to,
      inclusive_days: WINDOW_DAYS,
    },
    active_days: activeDays,
    active_day_count: activeDays.length,
    active_week_starts: activeWeekStarts,
    weeks_with_entries: activeWeekStarts.length,
  };
};

export const createActivityMedicalContext = (
  snapshotValue: unknown,
  windowValue: unknown,
): ActivityMedicalContext => {
  let snapshot: ActivityConsumerSnapshot;
  try {
    snapshot = validateActivitySnapshot(snapshotValue);
  } catch {
    return fail("INVALID_SNAPSHOT");
  }
  const window = guard(
    "INVALID_WINDOW",
    () => readWindow(windowValue, "INVALID_WINDOW"),
  );
  if (
    dayNumber(window.from) < dayNumber(snapshot.range.from) ||
    dayNumber(window.to) > dayNumber(snapshot.range.to)
  ) {
    fail("WINDOW_NOT_CONTAINED");
  }
  return deepFreeze(buildContext(snapshot, window));
};

export const validateActivityMedicalContext = (
  value: unknown,
): ActivityMedicalContext =>
  guard("INVALID_CONTEXT", () => {
    const context = readExact(value, TOP_LEVEL_KEYS, "INVALID_CONTEXT");
    if (
      context.schema_version !== ACTIVITY_MEDICAL_CONTEXT_SCHEMA ||
      context.timezone !== ACTIVITY_CONSUMER_TIME_ZONE
    ) {
      fail("INVALID_CONTEXT");
    }
    const range = readExact(context.range, RANGE_KEYS, "INVALID_CONTEXT");
    const window = readWindow(
      { from: range.from, to: range.to },
      "INVALID_CONTEXT",
    );
    if (range.inclusive_days !== WINDOW_DAYS) fail("INVALID_CONTEXT");
    const activeDays = readDenseArray(
      context.active_days,
      WINDOW_DAYS,
      "INVALID_CONTEXT",
    );
    if (
      activeDays.some((day) =>
        !canonicalDay(day) || day < window.from || day > window.to
      )
    ) {
      fail("INVALID_CONTEXT");
    }
    const validatedActiveDays = activeDays as string[];
    if (
      validatedActiveDays.some((day, index) =>
        index > 0 && validatedActiveDays[index - 1] >= day
      )
    ) fail("INVALID_CONTEXT");
    const activeWeekStarts = readDenseArray(
      context.active_week_starts,
      5,
      "INVALID_CONTEXT",
    );
    const expectedWeekStarts = Array.from(
      new Set(validatedActiveDays.map(weekStartForDay)),
    ).sort();
    if (
      activeWeekStarts.some((day) => !canonicalDay(day)) ||
      activeWeekStarts.length !== expectedWeekStarts.length ||
      activeWeekStarts.some((day, index) =>
        day !== expectedWeekStarts[index]
      ) ||
      context.active_day_count !== activeDays.length ||
      context.weeks_with_entries !== activeWeekStarts.length
    ) {
      fail("INVALID_CONTEXT");
    }
    return deepFreeze({
      schema_version: ACTIVITY_MEDICAL_CONTEXT_SCHEMA,
      timezone: ACTIVITY_CONSUMER_TIME_ZONE,
      range: {
        from: window.from,
        to: window.to,
        inclusive_days: WINDOW_DAYS,
      },
      active_days: validatedActiveDays,
      active_day_count: validatedActiveDays.length,
      active_week_starts: activeWeekStarts as string[],
      weeks_with_entries: activeWeekStarts.length,
    });
  });

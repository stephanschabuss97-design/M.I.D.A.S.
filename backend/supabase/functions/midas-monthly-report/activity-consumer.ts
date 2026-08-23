export const ACTIVITY_CONSUMER_SCHEMA = "midas.activity-consumer.v1";
export const ACTIVITY_CONSUMER_TIME_ZONE = "Europe/Vienna";

const SAFE_MESSAGE = "The activity consumer request failed.";
const CONTRACT_MESSAGE = "The activity consumer payload is invalid.";
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const DAY_MS = 86_400_000;
const MAX_RANGE_DAYS = 400;
const MAX_V1_DURATION_MIN = 2_147_483_647;
const MAX_V2_DURATION_MIN = 1440;
const MAX_V2_SESSIONS = 1000;
const TOP_LEVEL_KEYS = [
  "schema_version",
  "timezone",
  "range",
  "summary",
  "quality",
  "units",
] as const;
const RANGE_KEYS = ["from", "to", "inclusive_days"] as const;
const SUMMARY_KEYS = [
  "unit_count",
  "active_day_count",
  "active_days_per_week",
  "total_duration_min",
  "average_duration_min",
  "last_day",
] as const;
const QUALITY_KEYS = [
  "mixed_source_day_count",
  "mixed_source_days",
] as const;
const UNIT_KEYS = [
  "source",
  "id",
  "day",
  "occurred_at",
  "label",
  "duration_min",
  "note",
  "item_count",
] as const;
const SOURCES = ["activity_v1", "activity_v2"] as const;
const SQL_TOKEN_CODES = Object.freeze(
  {
    MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED: "AUTH_REQUIRED",
    MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE: "INVALID_RANGE",
    MIDAS_ACTIVITY_CONSUMER_RANGE_TOO_LARGE: "RANGE_TOO_LARGE",
    MIDAS_ACTIVITY_CONSUMER_LIMIT_EXCEEDED: "LIMIT_EXCEEDED",
    MIDAS_ACTIVITY_CONSUMER_SOURCE_INVALID: "CONTRACT_INVALID",
  } as const,
);
const VIENNA_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: ACTIVITY_CONSUMER_TIME_ZONE,
  calendar: "gregory",
  numberingSystem: "latn",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type DataRecord = Record<string, unknown>;

export type ActivityConsumerRange = {
  from: string;
  to: string;
  inclusive_days: number;
};

export type ActivityConsumerUnit = {
  source: "activity_v1" | "activity_v2";
  id: string;
  day: string;
  occurred_at: string;
  label: string;
  duration_min: number;
  note: string | null;
  item_count: number | null;
};

export type ActivityConsumerSummary = {
  unit_count: number;
  active_day_count: number;
  active_days_per_week: number;
  total_duration_min: number;
  average_duration_min: number | null;
  last_day: string | null;
};

export type ActivityConsumerSnapshot = {
  schema_version: typeof ACTIVITY_CONSUMER_SCHEMA;
  timezone: typeof ACTIVITY_CONSUMER_TIME_ZONE;
  range: ActivityConsumerRange;
  summary: ActivityConsumerSummary;
  quality: {
    mixed_source_day_count: number;
    mixed_source_days: string[];
  };
  units: ActivityConsumerUnit[];
};

export class ActivityConsumerContractError extends Error {
  code: string;

  constructor(code: string) {
    super(CONTRACT_MESSAGE);
    this.name = "ActivityConsumerContractError";
    this.code = code;
  }
}

export class ActivityConsumerEdgeError extends Error {
  code: string;
  operation: string;
  retryable: boolean;
  status: number | null;

  constructor(code: string, retryable = false, status?: number) {
    super(SAFE_MESSAGE);
    this.name = "ActivityConsumerEdgeError";
    this.code = code;
    this.operation = "loadActivitySnapshot";
    this.retryable = retryable;
    this.status = Number.isInteger(status) ? status! : null;
  }
}

const fail = (code: string): never => {
  throw new ActivityConsumerContractError(code);
};

const guard = <T>(code: string, callback: () => T): T => {
  try {
    return callback();
  } catch (error) {
    if (error instanceof ActivityConsumerContractError) throw error;
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

const compareText = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

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

const canonicalTimestamp = (value: unknown): value is string =>
  typeof value === "string" &&
  TIMESTAMP_RE.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString() === value;

const formatViennaDay = (epochMs: number) => {
  const parts = Object.fromEntries(
    VIENNA_DAY_FORMATTER.formatToParts(new Date(epochMs)).map((part) => [
      part.type,
      part.value,
    ]),
  );
  const day = `${parts.year}-${parts.month}-${parts.day}`;
  if (!canonicalDay(day)) fail("INVALID_RANGE");
  return day;
};

const resolveToday = (today: string | undefined, code: string) => {
  const value = today === undefined ? formatViennaDay(Date.now()) : today;
  if (!canonicalDay(value)) fail(code);
  return value;
};

const integerInRange = (value: unknown, min: number, max: number) =>
  Number.isSafeInteger(value) && Number(value) >= min && Number(value) <= max;

const validTextLength = (
  value: unknown,
  min: number,
  max: number,
): value is string =>
  typeof value === "string" &&
  Array.from(value).length >= min &&
  Array.from(value).length <= max;

const readRange = (
  value: unknown,
  today: string | undefined,
  code: string,
): ActivityConsumerRange => {
  const range = readExact(value, RANGE_KEYS, code);
  const from = range.from;
  const to = range.to;
  if (!canonicalDay(from)) fail(code);
  if (!canonicalDay(to)) fail(code);
  const canonicalFrom = from as string;
  const canonicalTo = to as string;
  const inclusiveDays = dayNumber(canonicalTo) - dayNumber(canonicalFrom) + 1;
  if (
    inclusiveDays < 1 ||
    inclusiveDays > MAX_RANGE_DAYS ||
    range.inclusive_days !== inclusiveDays ||
    dayNumber(canonicalTo) > dayNumber(resolveToday(today, code))
  ) {
    fail(code);
  }
  return {
    from: canonicalFrom,
    to: canonicalTo,
    inclusive_days: inclusiveDays,
  };
};

export const validateActivityRange = (value: unknown, today?: string) =>
  guard(
    "INVALID_RANGE",
    () => deepFreeze(readRange(value, today, "INVALID_RANGE")),
  );

const readUnit = (
  value: unknown,
  range: ActivityConsumerRange | null,
  code: string,
): ActivityConsumerUnit => {
  const unit = readExact(value, UNIT_KEYS, code);
  const source = unit.source;
  const id = unit.id;
  const day = unit.day;
  const occurredAt = unit.occurred_at;
  const label = unit.label;
  const durationMin = unit.duration_min;
  const note = unit.note;
  const itemCount = unit.item_count;
  if (
    typeof source !== "string" ||
    !SOURCES.includes(source as ActivityConsumerUnit["source"]) ||
    typeof id !== "string" ||
    !UUID_RE.test(id) ||
    !canonicalDay(day) ||
    !canonicalTimestamp(occurredAt) ||
    formatViennaDay(Date.parse(occurredAt)) !== day ||
    !validTextLength(
      label,
      1,
      source === "activity_v1" ? 200 : 120,
    ) ||
    label.trim().length === 0 ||
    (note !== null && !validTextLength(note, 1, 500))
  ) {
    fail(code);
  }
  const validatedSource = source as ActivityConsumerUnit["source"];
  const validatedDay = day as string;
  const validatedLabel = label as string;
  if (
    range !== null &&
    (dayNumber(validatedDay) < dayNumber(range.from) ||
      dayNumber(validatedDay) > dayNumber(range.to))
  ) {
    fail(code);
  }
  if (validatedSource === "activity_v1") {
    if (
      !integerInRange(durationMin, 1, MAX_V1_DURATION_MIN) ||
      itemCount !== null
    ) {
      fail(code);
    }
  } else if (
    !integerInRange(durationMin, 1, MAX_V2_DURATION_MIN) ||
    !integerInRange(itemCount, 0, 50) ||
    validatedLabel.trim() !== validatedLabel
  ) {
    fail(code);
  }
  return {
    source,
    id,
    day,
    occurred_at: occurredAt,
    label,
    duration_min: durationMin,
    note,
    item_count: itemCount,
  } as ActivityConsumerUnit;
};

export const compareActivityUnits = (
  left: ActivityConsumerUnit,
  right: ActivityConsumerUnit,
) =>
  compareText(left.day, right.day) ||
  compareText(left.occurred_at, right.occurred_at) ||
  compareText(left.source, right.source) ||
  compareText(left.id, right.id);

const readUnits = (
  value: unknown,
  range: ActivityConsumerRange,
  code: string,
): ActivityConsumerUnit[] => {
  const units = readDenseArray(
    value,
    range.inclusive_days + MAX_V2_SESSIONS,
    code,
  ).map((unit) => readUnit(unit, range, code));
  let v2Count = 0;
  const identities = new Set<string>();
  const v1Days = new Set<string>();
  units.forEach((unit) => {
    const identity = `${unit.source}:${unit.id}`;
    if (identities.has(identity)) fail(code);
    identities.add(identity);
    if (unit.source === "activity_v2") v2Count += 1;
    else {
      if (v1Days.has(unit.day)) fail(code);
      v1Days.add(unit.day);
    }
  });
  if (
    v2Count > MAX_V2_SESSIONS ||
    v1Days.size > range.inclusive_days ||
    units.length > range.inclusive_days + MAX_V2_SESSIONS
  ) {
    fail(code);
  }
  return units;
};

const buildSnapshot = (
  range: ActivityConsumerRange,
  units: ActivityConsumerUnit[],
  code: string,
): ActivityConsumerSnapshot => {
  const sortedUnits = units.slice().sort(compareActivityUnits);
  const sourcesByDay = new Map<string, Set<string>>();
  let totalDurationMin = 0;
  sortedUnits.forEach((unit) => {
    totalDurationMin += unit.duration_min;
    if (!Number.isSafeInteger(totalDurationMin)) fail(code);
    if (!sourcesByDay.has(unit.day)) sourcesByDay.set(unit.day, new Set());
    sourcesByDay.get(unit.day)!.add(unit.source);
  });
  const activeDays = Array.from(sourcesByDay.keys()).sort(compareText);
  const mixedSourceDays = activeDays.filter(
    (day) => sourcesByDay.get(day)!.size > 1,
  );
  const unitCount = sortedUnits.length;
  const activeDayCount = activeDays.length;
  return {
    schema_version: ACTIVITY_CONSUMER_SCHEMA,
    timezone: ACTIVITY_CONSUMER_TIME_ZONE,
    range,
    summary: {
      unit_count: unitCount,
      active_day_count: activeDayCount,
      active_days_per_week:
        Math.round((activeDayCount * 70) / range.inclusive_days) / 10,
      total_duration_min: totalDurationMin,
      average_duration_min: unitCount === 0
        ? null
        : Math.round(totalDurationMin / unitCount),
      last_day: activeDays.length ? activeDays[activeDays.length - 1] : null,
    },
    quality: {
      mixed_source_day_count: mixedSourceDays.length,
      mixed_source_days: mixedSourceDays,
    },
    units: sortedUnits,
  };
};

export const aggregateActivityUnits = (
  unitsValue: unknown,
  rangeValue: unknown,
  today?: string,
) =>
  guard("INVALID_UNITS", () => {
    const range = readRange(rangeValue, today, "INVALID_UNITS");
    const units = readUnits(unitsValue, range, "INVALID_UNITS");
    return deepFreeze(buildSnapshot(range, units, "INVALID_UNITS"));
  });

const scalarObjectsEqual = (
  left: DataRecord,
  right: DataRecord,
  keys: readonly string[],
) => keys.every((key) => Object.is(left[key], right[key]));

export const validateActivitySnapshot = (
  value: unknown,
  today?: string,
): ActivityConsumerSnapshot =>
  guard("INVALID_SNAPSHOT", () => {
    const snapshot = readExact(value, TOP_LEVEL_KEYS, "INVALID_SNAPSHOT");
    if (
      snapshot.schema_version !== ACTIVITY_CONSUMER_SCHEMA ||
      snapshot.timezone !== ACTIVITY_CONSUMER_TIME_ZONE
    ) {
      fail("INVALID_SNAPSHOT");
    }
    const range = readRange(snapshot.range, today, "INVALID_SNAPSHOT");
    const units = readUnits(snapshot.units, range, "INVALID_SNAPSHOT");
    if (
      units.some((unit, index) =>
        index > 0 && compareActivityUnits(units[index - 1], unit) > 0
      )
    ) {
      fail("INVALID_SNAPSHOT");
    }
    const summary = readExact(
      snapshot.summary,
      SUMMARY_KEYS,
      "INVALID_SNAPSHOT",
    );
    const quality = readExact(
      snapshot.quality,
      QUALITY_KEYS,
      "INVALID_SNAPSHOT",
    );
    const mixedSourceDays = readDenseArray(
      quality.mixed_source_days,
      range.inclusive_days,
      "INVALID_SNAPSHOT",
    );
    const candidate = buildSnapshot(range, units, "INVALID_SNAPSHOT");
    if (
      !scalarObjectsEqual(summary, candidate.summary, SUMMARY_KEYS) ||
      quality.mixed_source_day_count !==
        candidate.quality.mixed_source_day_count ||
      mixedSourceDays.length !== candidate.quality.mixed_source_days.length ||
      mixedSourceDays.some((day, index) =>
        day !== candidate.quality.mixed_source_days[index]
      )
    ) {
      fail("INVALID_SNAPSHOT");
    }
    return deepFreeze(candidate);
  });

export type ActivityRpcClient = {
  rpc(
    functionName: string,
    payload: Record<string, string>,
  ): Promise<{ data: unknown; error: unknown }>;
};

export type ActivityConsumerLoaderOptions = {
  createUserClient(token: string): ActivityRpcClient;
  today?: () => string;
};

const edgeFailure = (code: string, retryable = false, status?: number) =>
  new ActivityConsumerEdgeError(code, retryable, status);

const readOwnDataField = (value: unknown, key: string) => {
  try {
    if (
      value === null ||
      (typeof value !== "object" && typeof value !== "function")
    ) return undefined;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor &&
        Object.prototype.hasOwnProperty.call(descriptor, "value")
      ? descriptor.value
      : undefined;
  } catch {
    return undefined;
  }
};

const extractStatus = (error: unknown) => {
  const direct = readOwnDataField(error, "status");
  const context = readOwnDataField(error, "context");
  const nested = readOwnDataField(context, "status");
  try {
    const value = Number(direct ?? nested);
    return Number.isInteger(value) ? value : undefined;
  } catch {
    return undefined;
  }
};

const extractSqlToken = (error: unknown) => {
  const combined = ["message", "details", "hint", "code"]
    .map((key) => readOwnDataField(error, key))
    .filter((entry) => typeof entry === "string")
    .join(" ");
  return Object.keys(SQL_TOKEN_CODES).find((candidate) => {
    const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|[^A-Z0-9_])${escaped}(?:$|[^A-Z0-9_])`).test(
      combined,
    );
  }) as keyof typeof SQL_TOKEN_CODES | undefined;
};

const normalizeLoaderRange = (value: unknown, today?: string) => {
  const range = readExact(value, ["from", "to"], "INVALID_RANGE");
  const from = range.from;
  const to = range.to;
  if (!canonicalDay(from)) fail("INVALID_RANGE");
  if (!canonicalDay(to)) fail("INVALID_RANGE");
  const canonicalFrom = from as string;
  const canonicalTo = to as string;
  return validateActivityRange({
    from: canonicalFrom,
    to: canonicalTo,
    inclusive_days: dayNumber(canonicalTo) - dayNumber(canonicalFrom) + 1,
  }, today);
};

export const createActivityConsumerLoader = (
  options: ActivityConsumerLoaderOptions,
) => {
  if (!options || typeof options.createUserClient !== "function") {
    throw edgeFailure("CLIENT_UNAVAILABLE");
  }
  const loadSnapshot = async (value: unknown) => {
    let request: DataRecord;
    try {
      request = readExact(
        value,
        ["range", "bearerToken"],
        "INVALID_RANGE",
      );
    } catch {
      throw edgeFailure("INVALID_RANGE");
    }
    if (
      typeof request.bearerToken !== "string" || !request.bearerToken.trim()
    ) {
      throw edgeFailure("AUTH_REQUIRED", false, 401);
    }
    let range: ActivityConsumerRange;
    try {
      range = normalizeLoaderRange(request.range, options.today?.());
    } catch {
      throw edgeFailure("INVALID_RANGE");
    }
    let client: ActivityRpcClient;
    try {
      client = options.createUserClient(request.bearerToken);
    } catch {
      throw edgeFailure("CLIENT_UNAVAILABLE");
    }
    if (!client || typeof client.rpc !== "function") {
      throw edgeFailure("CLIENT_UNAVAILABLE");
    }
    let result: { data: unknown; error: unknown };
    try {
      result = await client.rpc("activity_consumer_snapshot", {
        p_from: range.from,
        p_to: range.to,
      });
    } catch (error) {
      const status = extractStatus(error);
      if (status === 401 || status === 403) {
        throw edgeFailure("AUTH_REQUIRED", false, status);
      }
      throw edgeFailure("REQUEST_FAILED", true, status);
    }
    let rpcError: unknown;
    try {
      rpcError = result?.error;
    } catch {
      throw edgeFailure("REQUEST_FAILED", true);
    }
    if (rpcError) {
      const status = extractStatus(rpcError);
      const token = extractSqlToken(rpcError);
      if (status === 401 || status === 403) {
        throw edgeFailure("AUTH_REQUIRED", false, status);
      }
      if (token) throw edgeFailure(SQL_TOKEN_CODES[token], false, status);
      throw edgeFailure(
        "REQUEST_FAILED",
        status === 429 || (status !== undefined && status >= 500),
        status,
      );
    }
    try {
      const snapshot = validateActivitySnapshot(
        result?.data,
        options.today?.(),
      );
      if (
        snapshot.range.from !== range.from || snapshot.range.to !== range.to
      ) {
        throw new TypeError("response range mismatch");
      }
      return snapshot;
    } catch {
      throw edgeFailure("CONTRACT_INVALID");
    }
  };
  return deepFreeze({ loadSnapshot });
};

import {
  ACTIVITY_CONSUMER_SCHEMA,
  ActivityConsumerSnapshot,
  validateActivitySnapshot,
} from "./activity-consumer.ts";

const SAFE_MESSAGE = "The activity report payload is invalid.";
const REPORT_KEYS = [
  "subtype",
  "period",
  "report_type",
  "summary",
  "text",
  "meta",
  "bp_series",
  "body_series",
  "lab_series",
  "activity_series",
] as const;
const PERIOD_KEYS = ["from", "to"] as const;

type DataRecord = Record<string, unknown>;

export type ActivityReportPayload = {
  subtype: "range_report";
  period: { from: string; to: string };
  report_type: "range_report";
  summary: string;
  text: string;
  meta: DataRecord & {
    activity: {
      schema_version: typeof ACTIVITY_CONSUMER_SCHEMA;
      unit_count: number;
      active_day_count: number;
      active_days_per_week: number;
      total_duration_min: number;
      average_duration_min: number | null;
      last_day: string | null;
      mixed_source_day_count: number;
    };
  };
  bp_series: unknown[];
  body_series: unknown[];
  lab_series: unknown[];
  activity_series: ActivityConsumerSnapshot["units"];
};

export class ActivityReportContractError extends Error {
  code: string;

  constructor(code = "ACTIVITY_REPORT_CONTRACT_INVALID") {
    super(SAFE_MESSAGE);
    this.name = "ActivityReportContractError";
    this.code = code;
  }
}

const fail = (): never => {
  throw new ActivityReportContractError();
};

const isPlainRecord = (value: unknown): value is DataRecord => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
};

const readExact = (value: unknown, expectedKeys: readonly string[]) => {
  if (!isPlainRecord(value)) fail();
  const keys = Reflect.ownKeys(value as object);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (
    keys.length !== expectedKeys.length ||
    keys.some((key) =>
      typeof key !== "string" || !expectedKeys.includes(key)
    ) ||
    expectedKeys.some((key) =>
      !descriptors[key]?.enumerable ||
      !Object.prototype.hasOwnProperty.call(descriptors[key], "value")
    )
  ) {
    fail();
  }
  return Object.fromEntries(
    expectedKeys.map((key) => [key, descriptors[key].value]),
  ) as DataRecord;
};

const cloneValue = <T>(value: T): T => {
  try {
    return structuredClone(value);
  } catch {
    return fail();
  }
};

const deepFreeze = <T>(value: T, seen = new WeakSet<object>()): T => {
  if (
    value === null ||
    (typeof value !== "object" && typeof value !== "function") ||
    seen.has(value as object)
  ) return value;
  seen.add(value as object);
  Reflect.ownKeys(value as object).forEach((key) =>
    deepFreeze((value as DataRecord)[key as string], seen)
  );
  return Object.freeze(value);
};

const formatDateDe = (day: string | null) =>
  day ? `${day.slice(8, 10)}.${day.slice(5, 7)}.${day.slice(0, 4)}` : "-";

const formatDecimalDe = (value: number) => String(value).replace(".", ",");

export const buildActivityReportSection = (
  snapshotValue: unknown,
): string => {
  const snapshot = validateActivitySnapshot(snapshotValue);
  if (!snapshot.units.length) {
    return "**Aktivität**\n- Keine Einträge im Zeitraum.";
  }
  return [
    "**Aktivität**",
    `- Letzte Aktivität: ${formatDateDe(snapshot.summary.last_day)}`,
    `- Aktive Tage/Woche: ${
      formatDecimalDe(snapshot.summary.active_days_per_week)
    }`,
    `- Gesamtdauer: ${snapshot.summary.total_duration_min} Min (Durchschnitt: ${snapshot.summary.average_duration_min} Min/Einheit)`,
  ].join("\n");
};

const replaceActivityCopy = (
  text: string,
  snapshot: ActivityConsumerSnapshot,
) => {
  if (typeof text !== "string" || text.includes("\r")) fail();
  const blocks = text.split("\n\n");
  const dataIndexes = blocks
    .map((block, index) =>
      block.startsWith("**Datengrundlage**\n") ? index : -1
    )
    .filter((index) => index >= 0);
  const activityIndexes = blocks
    .map((block, index) => block.startsWith("**Aktivität**\n") ? index : -1)
    .filter((index) => index >= 0);
  if (dataIndexes.length !== 1 || activityIndexes.length !== 1) fail();

  const dataLines = blocks[dataIndexes[0]].split("\n");
  const activityLines = dataLines
    .map((line, index) => line.startsWith("- Aktivität:") ? index : -1)
    .filter((index) => index >= 0);
  if (activityLines.length !== 1) fail();
  dataLines[activityLines[0]] =
    `- Aktivität: ${snapshot.summary.unit_count} Einträge`;
  blocks[dataIndexes[0]] = dataLines.join("\n");
  blocks[activityIndexes[0]] = buildActivityReportSection(snapshot);
  return blocks.join("\n\n");
};

export const buildActivityReportPayload = (
  basePayloadValue: unknown,
  snapshotValue: unknown,
): ActivityReportPayload => {
  try {
    const base = readExact(basePayloadValue, REPORT_KEYS);
    const period = readExact(base.period, PERIOD_KEYS);
    const snapshot = validateActivitySnapshot(snapshotValue);
    if (
      base.subtype !== "range_report" ||
      base.report_type !== "range_report" ||
      typeof base.summary !== "string" ||
      !isPlainRecord(base.meta) ||
      !Array.isArray(base.bp_series) ||
      !Array.isArray(base.body_series) ||
      !Array.isArray(base.lab_series) ||
      !Array.isArray(base.activity_series) ||
      period.from !== snapshot.range.from ||
      period.to !== snapshot.range.to
    ) {
      fail();
    }
    const cloned = cloneValue(base);
    const clonedMeta = cloned.meta;
    if (!isPlainRecord(clonedMeta)) fail();
    const outputMeta = clonedMeta as DataRecord;
    cloned.text = replaceActivityCopy(base.text as string, snapshot);
    outputMeta.activity = {
      schema_version: ACTIVITY_CONSUMER_SCHEMA,
      unit_count: snapshot.summary.unit_count,
      active_day_count: snapshot.summary.active_day_count,
      active_days_per_week: snapshot.summary.active_days_per_week,
      total_duration_min: snapshot.summary.total_duration_min,
      average_duration_min: snapshot.summary.average_duration_min,
      last_day: snapshot.summary.last_day,
      mixed_source_day_count: snapshot.quality.mixed_source_day_count,
    };
    cloned.activity_series = cloneValue(snapshot.units);
    return deepFreeze(cloned as unknown as ActivityReportPayload);
  } catch (error) {
    if (error instanceof ActivityReportContractError) throw error;
    return fail();
  }
};

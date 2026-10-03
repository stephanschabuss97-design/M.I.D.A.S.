import { validateActivityRange } from "../midas-monthly-report/activity-consumer.ts";
import {
  ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
  type ActivityEdgePrincipal,
} from "../_shared/activity-edge-principal.ts";
import { ActivityConsumerRuntimeError } from "../_shared/activity-consumer-runtime.ts";

export type ProteinActivityDays = {
  schema_version: "midas.activity-protein-days.v1";
  timezone: "Europe/Vienna";
  range: { from: string; to: string; inclusive_days: 28 };
  active_days: readonly string[];
  active_day_count: number;
};

const dataObject = (value: unknown, keys: string[]) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error();
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const ownKeys = Reflect.ownKeys(value);
  if (
    ownKeys.length !== keys.length ||
    ownKeys.some((key) => typeof key !== "string" || !keys.includes(key))
  ) throw new Error();
  return Object.fromEntries(keys.map((key) => {
    if (!Object.hasOwn(descriptors[key], "value")) throw new Error();
    return [key, descriptors[key].value];
  }));
};

export const validateProteinActivityDays = (
  value: unknown,
  today?: string,
): ProteinActivityDays => {
  try {
    const raw = dataObject(value, [
      "schema_version",
      "timezone",
      "range",
      "active_days",
      "active_day_count",
    ]);
    const range = validateActivityRange(
      dataObject(raw.range, [
        "from",
        "to",
        "inclusive_days",
      ]) as ProteinActivityDays["range"],
      today,
    );
    if (
      raw.schema_version !== "midas.activity-protein-days.v1" ||
      raw.timezone !== "Europe/Vienna" || range.inclusive_days !== 28 ||
      !Array.isArray(raw.active_days) || raw.active_days.length > 28 ||
      !Number.isSafeInteger(raw.active_day_count) ||
      raw.active_day_count !== raw.active_days.length ||
      Reflect.ownKeys(raw.active_days).length !== raw.active_days.length + 1
    ) throw new Error();
    const days: string[] = [];
    for (let index = 0; index < raw.active_days.length; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(
        raw.active_days,
        String(index),
      );
      if (!descriptor || !Object.hasOwn(descriptor, "value")) throw new Error();
      const day = descriptor.value;
      if (
        typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
        !Number.isFinite(Date.parse(`${day}T00:00:00Z`)) ||
        new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day ||
        day < range.from || day > range.to ||
        (index > 0 && day <= days[index - 1])
      ) throw new Error();
      days.push(day);
    }
    return Object.freeze({
      schema_version: "midas.activity-protein-days.v1",
      timezone: "Europe/Vienna",
      range: Object.freeze({
        from: range.from,
        to: range.to,
        inclusive_days: 28,
      }),
      active_days: Object.freeze(days),
      active_day_count: days.length,
    });
  } catch {
    throw new ActivityConsumerRuntimeError("CONTRACT_INVALID");
  }
};

export const createProteinActivityRuntime = (
  options: { today?: () => string } = {},
) => {
  const loadDays = async (
    principal: ActivityEdgePrincipal,
    rangeValue: { from: string; to: string },
  ) => {
    if (
      principal?.schema_version !== ACTIVITY_EDGE_PRINCIPAL_SCHEMA ||
      !["user", "scheduler"].includes(principal.mode) ||
      !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(
        principal.owner_id,
      ) ||
      typeof principal.rpc_client?.rpc !== "function"
    ) {
      throw new ActivityConsumerRuntimeError("SNAPSHOT_UNAVAILABLE");
    }
    let range;
    const today = options.today?.();
    try {
      const raw = dataObject(rangeValue, ["from", "to"]);
      range = validateActivityRange(
        { ...raw, inclusive_days: 28 } as ProteinActivityDays["range"],
        today,
      );
    } catch {
      throw new ActivityConsumerRuntimeError("INVALID_RANGE");
    }
    const payload: Record<string, unknown> = {
      p_from: range.from,
      p_to: range.to,
    };
    if (principal.mode === "scheduler") payload.p_owner = principal.owner_id;
    let result;
    try {
      result = await principal.rpc_client.rpc(
        principal.mode === "user"
          ? "activity_protein_days"
          : "activity_protein_days_for_owner",
        payload,
      );
    } catch {
      throw new ActivityConsumerRuntimeError("SNAPSHOT_UNAVAILABLE", true);
    }
    if (result?.error) {
      throw new ActivityConsumerRuntimeError("SNAPSHOT_UNAVAILABLE", true);
    }
    const context = validateProteinActivityDays(result?.data, today);
    if (context.range.from !== range.from || context.range.to !== range.to) {
      throw new ActivityConsumerRuntimeError("CONTRACT_INVALID");
    }
    return context;
  };
  return Object.freeze({ loadDays });
};

import {
  type ActivityConsumerRange,
  type ActivityConsumerSnapshot,
  validateActivityRange,
  validateActivitySnapshot,
} from "../midas-monthly-report/activity-consumer.ts";
import {
  ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
  type ActivityEdgePrincipal,
} from "./activity-edge-principal.ts";

const SAFE_ERROR_MESSAGE = "The activity consumer runtime request failed.";

export class ActivityConsumerRuntimeError extends Error {
  code:
    | "INVALID_RANGE"
    | "SNAPSHOT_UNAVAILABLE"
    | "CONTRACT_INVALID";
  status: 400 | 502;
  publicMessage: "Invalid range" | "Activity snapshot unavailable";
  retryable: boolean;

  constructor(
    code: ActivityConsumerRuntimeError["code"],
    retryable = false,
  ) {
    super(SAFE_ERROR_MESSAGE);
    this.name = "ActivityConsumerRuntimeError";
    this.code = code;
    this.status = code === "INVALID_RANGE" ? 400 : 502;
    this.publicMessage = code === "INVALID_RANGE"
      ? "Invalid range"
      : "Activity snapshot unavailable";
    this.retryable = retryable;
  }
}

type RuntimeOptions = {
  today?: () => string;
};

const SQL_TOKENS = Object.freeze(
  {
    MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE: "INVALID_RANGE",
    MIDAS_ACTIVITY_CONSUMER_RANGE_TOO_LARGE: "INVALID_RANGE",
    MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED: "SNAPSHOT_UNAVAILABLE",
    MIDAS_ACTIVITY_CONSUMER_LIMIT_EXCEEDED: "SNAPSHOT_UNAVAILABLE",
    MIDAS_ACTIVITY_CONSUMER_SOURCE_INVALID: "CONTRACT_INVALID",
  } as const,
);

const readOwnData = (value: unknown, key: string) => {
  try {
    if (value === null || typeof value !== "object") return undefined;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor &&
        Object.prototype.hasOwnProperty.call(descriptor, "value")
      ? descriptor.value
      : undefined;
  } catch {
    return undefined;
  }
};

const findSqlToken = (error: unknown) => {
  const combined = ["message", "details", "hint", "code"]
    .map((key) => readOwnData(error, key))
    .filter((entry) => typeof entry === "string")
    .join(" ");
  return Object.keys(SQL_TOKENS).find((candidate) =>
    combined.includes(candidate)
  ) as
    | keyof typeof SQL_TOKENS
    | undefined;
};

const normalizeRange = (value: unknown, today?: string) => {
  try {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError("range");
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== 2 ||
      !keys.includes("from") ||
      !keys.includes("to") ||
      !Object.prototype.hasOwnProperty.call(descriptors.from, "value") ||
      !Object.prototype.hasOwnProperty.call(descriptors.to, "value")
    ) {
      throw new TypeError("range");
    }
    const from = descriptors.from.value;
    const to = descriptors.to.value;
    if (typeof from !== "string" || typeof to !== "string") {
      throw new TypeError("range");
    }
    const start = Date.parse(`${from}T00:00:00.000Z`);
    const end = Date.parse(`${to}T00:00:00.000Z`);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      throw new TypeError("range");
    }
    return validateActivityRange({
      from,
      to,
      inclusive_days: Math.trunc((end - start) / 86_400_000) + 1,
    }, today);
  } catch {
    throw new ActivityConsumerRuntimeError("INVALID_RANGE");
  }
};

const validatePrincipal = (principal: ActivityEdgePrincipal) => {
  if (
    !principal ||
    principal.schema_version !== ACTIVITY_EDGE_PRINCIPAL_SCHEMA ||
    (principal.mode !== "user" && principal.mode !== "scheduler") ||
    typeof principal.owner_id !== "string" ||
    !principal.rpc_client ||
    typeof principal.rpc_client.rpc !== "function"
  ) {
    throw new ActivityConsumerRuntimeError("SNAPSHOT_UNAVAILABLE");
  }
};

export const createActivityConsumerRuntime = (options: RuntimeOptions = {}) => {
  const loadSnapshot = async (
    principal: ActivityEdgePrincipal,
    rangeValue: unknown,
  ): Promise<ActivityConsumerSnapshot> => {
    validatePrincipal(principal);
    const range: ActivityConsumerRange = normalizeRange(
      rangeValue,
      options.today?.(),
    );
    const functionName = principal.mode === "user"
      ? "activity_consumer_snapshot"
      : "activity_consumer_snapshot_for_owner";
    const payload: Record<string, unknown> = {
      p_from: range.from,
      p_to: range.to,
    };
    if (principal.mode === "scheduler") payload.p_owner = principal.owner_id;

    let result: { data: unknown; error: unknown };
    try {
      result = await principal.rpc_client.rpc(functionName, payload);
    } catch {
      throw new ActivityConsumerRuntimeError("SNAPSHOT_UNAVAILABLE", true);
    }
    if (result?.error) {
      const token = findSqlToken(result.error);
      if (token) {
        const code = SQL_TOKENS[token];
        throw new ActivityConsumerRuntimeError(code, false);
      }
      throw new ActivityConsumerRuntimeError("SNAPSHOT_UNAVAILABLE", true);
    }
    try {
      const snapshot = validateActivitySnapshot(
        result?.data,
        options.today?.(),
      );
      if (
        snapshot.range.from !== range.from ||
        snapshot.range.to !== range.to
      ) {
        throw new TypeError("range mismatch");
      }
      return snapshot;
    } catch {
      throw new ActivityConsumerRuntimeError("CONTRACT_INVALID");
    }
  };
  return Object.freeze({ loadSnapshot });
};

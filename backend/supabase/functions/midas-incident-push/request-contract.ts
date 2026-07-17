export type TriggerKind = "scheduler" | "manual";
type WindowKind = "med" | "bp" | "all";
type ModeKind = "incidents" | "diagnostic";

export type NormalizedInput = {
  trigger: TriggerKind;
  userId: string | null;
  window: WindowKind;
  mode: ModeKind;
  dryRun: boolean;
  nowOverrideProvided: boolean;
  now: Date;
};

const ISO_NOW_RE = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/;

export class InputValidationError extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasOwn = (obj: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(obj, key);

const requireEnum = <T extends string>(
  raw: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T => {
  if (!hasOwn(raw, key)) return fallback;
  const value = raw[key];
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new InputValidationError(
      `${key} muss einer von ${allowed.join(", ")} sein.`,
    );
  }
  return value as T;
};

const parseNowInput = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new InputValidationError(
      "now muss ein gueltiger ISO-Zeitpunkt sein.",
    );
  }

  const trimmed = value.trim();
  const match = ISO_NOW_RE.exec(trimmed);
  if (!match) {
    throw new InputValidationError(
      "now muss ein gueltiger ISO-Zeitpunkt sein.",
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDay = new Date(Date.UTC(year, month - 1, day));
  if (
    utcDay.getUTCFullYear() !== year ||
    utcDay.getUTCMonth() !== month - 1 ||
    utcDay.getUTCDate() !== day
  ) {
    throw new InputValidationError(
      "now muss ein gueltiger ISO-Zeitpunkt sein.",
    );
  }

  const now = new Date(trimmed);
  if (!Number.isFinite(now.getTime())) {
    throw new InputValidationError(
      "now muss ein gueltiger ISO-Zeitpunkt sein.",
    );
  }
  return now;
};

export const normalizeInput = (
  raw: Record<string, unknown>,
): NormalizedInput => {
  const trigger = requireEnum(
    raw,
    "trigger",
    ["manual", "scheduler"],
    "scheduler",
  );
  const window = requireEnum(raw, "window", ["med", "bp", "all"], "all");
  const mode = requireEnum(
    raw,
    "mode",
    ["diagnostic", "incidents"],
    "incidents",
  );

  let dryRun = false;
  if (hasOwn(raw, "dry_run")) {
    if (typeof raw.dry_run !== "boolean") {
      throw new InputValidationError("dry_run muss ein Boolean sein.");
    }
    dryRun = raw.dry_run;
  }

  let userId: string | null = null;
  if (hasOwn(raw, "user_id")) {
    if (typeof raw.user_id !== "string" || !raw.user_id.trim()) {
      throw new InputValidationError(
        "user_id muss ein nicht-leerer String sein.",
      );
    }
    userId = raw.user_id.trim();
  }

  const nowOverrideProvided = hasOwn(raw, "now");
  let now = new Date();
  if (nowOverrideProvided) {
    now = parseNowInput(raw.now);
  }

  return {
    trigger,
    userId,
    window,
    mode,
    dryRun,
    nowOverrideProvided,
    now,
  };
};

export const readInput = async (req: Request): Promise<NormalizedInput> => {
  const body = await req.text();
  const trimmed = body.trim();
  if (!trimmed) return normalizeInput({});

  let raw: unknown;
  try {
    raw = JSON.parse(trimmed);
  } catch (_) {
    throw new InputValidationError("Ungueltiges JSON im Request-Body.");
  }

  if (!isRecord(raw)) {
    throw new InputValidationError("Request-Body muss ein JSON-Object sein.");
  }

  return normalizeInput(raw);
};

export const validateInputGuards = (input: NormalizedInput) => {
  if (input.mode === "diagnostic" && input.trigger !== "manual") {
    throw new InputValidationError(
      "Diagnostic push requires manual trigger",
    );
  }
  if (input.nowOverrideProvided && !input.dryRun) {
    throw new InputValidationError(
      "now darf nur mit dry_run = true gesetzt werden.",
    );
  }
};

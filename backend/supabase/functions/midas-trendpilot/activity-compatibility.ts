import {
  type ActivityMedicalContext,
  validateActivityMedicalContext,
} from "../_shared/activity-medical-context.ts";

const SAFE_MESSAGE = "The Trendpilot activity context is invalid.";
const MIN_WEEKS = 2;
const MIN_ACTIVE_DAYS = 4;
const HIGH_ACTIVE_DAYS = 8;
const LOW_ACTIVE_DAYS = 3;

export type TrendpilotActivityCompatibility = {
  level: "unknown" | "low" | "ok" | "high";
  active_days_4w: number;
  weeks_with_entries_4w: number;
};

export class TrendpilotActivityCompatibilityError extends Error {
  code: string;

  constructor() {
    super(SAFE_MESSAGE);
    this.name = "TrendpilotActivityCompatibilityError";
    this.code = "INVALID_CONTEXT";
  }
}

export const deriveTrendpilotActivityCompatibility = (
  contextValue: ActivityMedicalContext,
): Readonly<TrendpilotActivityCompatibility> => {
  let context: ActivityMedicalContext;
  try {
    context = validateActivityMedicalContext(contextValue);
  } catch {
    throw new TrendpilotActivityCompatibilityError();
  }
  const activeDays = context.active_day_count;
  const weeks = context.weeks_with_entries;
  const gateOk = activeDays >= MIN_ACTIVE_DAYS || weeks >= MIN_WEEKS;
  let level: TrendpilotActivityCompatibility["level"] = "unknown";
  if (gateOk) {
    if (activeDays >= HIGH_ACTIVE_DAYS) level = "high";
    else if (activeDays <= LOW_ACTIVE_DAYS) level = "low";
    else level = "ok";
  }
  return Object.freeze({
    level,
    active_days_4w: activeDays,
    weeks_with_entries_4w: weeks,
  });
};

import {
  type ActivityMedicalContext,
  validateActivityMedicalContext,
} from "../_shared/activity-medical-context.ts";

const SAFE_MESSAGE = "The protein activity context is invalid.";

export type ProteinActivityCompatibility = {
  active_days_28d: number;
  activity_level: "ACT1" | "ACT2" | "ACT3";
  activity_modifier: 0.1 | 0.2 | 0.3;
};

export class ProteinActivityCompatibilityError extends Error {
  code: string;

  constructor() {
    super(SAFE_MESSAGE);
    this.name = "ProteinActivityCompatibilityError";
    this.code = "INVALID_CONTEXT";
  }
}

export const deriveProteinActivityCompatibility = (
  contextValue: ActivityMedicalContext,
): Readonly<ProteinActivityCompatibility> => {
  let context: ActivityMedicalContext;
  try {
    context = validateActivityMedicalContext(contextValue);
  } catch {
    throw new ProteinActivityCompatibilityError();
  }
  const activeDays = context.active_day_count;
  if (activeDays >= 6) {
    return Object.freeze({
      active_days_28d: activeDays,
      activity_level: "ACT3",
      activity_modifier: 0.3,
    });
  }
  if (activeDays >= 2) {
    return Object.freeze({
      active_days_28d: activeDays,
      activity_level: "ACT2",
      activity_modifier: 0.2,
    });
  }
  return Object.freeze({
    active_days_28d: activeDays,
    activity_level: "ACT1",
    activity_modifier: 0.1,
  });
};

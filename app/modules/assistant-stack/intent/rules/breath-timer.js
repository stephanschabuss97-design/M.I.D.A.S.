'use strict';

function getDurationMinutes(normalizedInput) {
  const durations = Array.isArray(normalizedInput?.slots_by_type?.DURATION)
    ? normalizedInput.slots_by_type.DURATION
    : [];
  const minuteDuration = durations.find((slot) => slot?.meta?.unit === 'minuten');
  if (!minuteDuration) {
    return 3;
  }
  return Number(minuteDuration.value) === 5 ? 5 : 3;
}

export const BREATH_TIMER_RULES = [
  {
    intent_key: 'start_breath_timer',
    match(normalizedInput) {
      const hasStartVerb =
        Array.isArray(normalizedInput?.slots_by_type?.START_VERB) &&
        normalizedInput.slots_by_type.START_VERB.length > 0;
      const hasTimerTerm =
        Array.isArray(normalizedInput?.slots_by_type?.TIMER_TERM) &&
        normalizedInput.slots_by_type.TIMER_TERM.length > 0;
      if (!hasStartVerb || !hasTimerTerm) {
        return null;
      }
      return {
        minutes: getDurationMinutes(normalizedInput),
      };
    },
    target_action: 'start_breath_timer',
  },
];

export default {
  BREATH_TIMER_RULES,
};

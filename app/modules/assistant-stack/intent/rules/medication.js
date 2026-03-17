'use strict';

export const MEDICATION_RULES = [
  {
    intent_key: 'medication_confirm_all',
    match(normalizedInput) {
      const hasMedication =
        Array.isArray(normalizedInput?.slots_by_type?.MEDICATION_TERM) &&
        normalizedInput.slots_by_type.MEDICATION_TERM.length > 0;
      const hasTakenVerb =
        Array.isArray(normalizedInput?.slots_by_type?.TAKEN_VERB) &&
        normalizedInput.slots_by_type.TAKEN_VERB.length > 0;
      if (!hasMedication || !hasTakenVerb) {
        return null;
      }
      return {
        scope: 'all_open_for_day',
      };
    },
    target_action: 'medication_confirm_all',
  },
];

export default {
  MEDICATION_RULES,
};

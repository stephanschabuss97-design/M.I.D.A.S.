'use strict';

export const MEDICATION_RULES = [
  {
    intent_key: 'medication_confirm_section',
    match(normalizedInput) {
      const hasMedication =
        Array.isArray(normalizedInput?.slots_by_type?.MEDICATION_TERM) &&
        normalizedInput.slots_by_type.MEDICATION_TERM.length > 0;
      const hasTakenVerb =
        Array.isArray(normalizedInput?.slots_by_type?.TAKEN_VERB) &&
        normalizedInput.slots_by_type.TAKEN_VERB.length > 0;
      const dayparts = Array.isArray(normalizedInput?.slots_by_type?.MEDICATION_DAYPART)
        ? normalizedInput.slots_by_type.MEDICATION_DAYPART
        : [];
      const section = typeof dayparts[0]?.value === 'string' ? dayparts[0].value.trim() : '';
      if (!hasMedication || !hasTakenVerb || !section) {
        return null;
      }
      return {
        scope: 'open_for_section',
        section,
      };
    },
    target_action: 'medication_confirm_section',
  },
];

export default {
  MEDICATION_RULES,
};

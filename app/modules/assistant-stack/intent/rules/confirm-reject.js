'use strict';

export const CONFIRM_REJECT_RULES = [
  {
    intent_key: 'confirm_reject',
    match(normalizedInput) {
      const normalizedText = `${normalizedInput?.normalized_text || ''}`.trim();
      if (normalizedText === 'ja') {
        return { action: 'confirm', value: 'yes' };
      }
      if (normalizedText === 'nein') {
        return { action: 'reject', value: 'no' };
      }
      if (normalizedText === 'speichern') {
        return { action: 'confirm', value: 'save' };
      }
      if (normalizedText === 'abbrechen') {
        return { action: 'reject', value: 'cancel' };
      }
      return null;
    },
    target_action: null,
  },
];

export default {
  CONFIRM_REJECT_RULES,
};

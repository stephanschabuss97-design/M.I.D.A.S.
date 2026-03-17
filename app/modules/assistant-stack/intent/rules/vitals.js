'use strict';

export const VITALS_RULES = [
  {
    intent_key: 'vitals_quick_log',
    pattern: /^blutdruck (?:(?<context_a>morgens|morgen|abends|abend) )?(?<systolic>\d+(?:\.\d+)?) zu (?<diastolic>\d+(?:\.\d+)?)(?: (?<context_b>morgens|morgen|abends|abend))?$/,
    buildPayload(match) {
      const rawContext = match.groups.context_a || match.groups.context_b || '';
      let context = null;
      if (rawContext === 'morgens' || rawContext === 'morgen') {
        context = 'M';
      } else if (rawContext === 'abends' || rawContext === 'abend') {
        context = 'A';
      }
      return {
        systolic: Number(match.groups.systolic),
        diastolic: Number(match.groups.diastolic),
        ...(context ? { context } : {}),
      };
    },
    target_action: 'vitals_log_bp',
  },
  {
    intent_key: 'vitals_quick_log',
    pattern: /^puls (?<pulse>\d+(?:\.\d+)?)$/,
    buildPayload(match) {
      return { pulse: Number(match.groups.pulse) };
    },
    target_action: 'vitals_log_pulse',
  },
  {
    intent_key: 'vitals_quick_log',
    pattern: /^gewicht (?<weight>\d+(?:\.\d+)?)$/,
    buildPayload(match) {
      return { weight_kg: Number(match.groups.weight) };
    },
    target_action: 'vitals_log_weight',
  },
];

export default {
  VITALS_RULES,
};

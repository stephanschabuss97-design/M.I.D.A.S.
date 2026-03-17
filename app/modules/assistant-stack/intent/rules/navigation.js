'use strict';

export const NAVIGATION_RULES = [
  {
    intent_key: 'simple_navigation',
    pattern: /^(?:oeffne|offne|gehe zu) (?<target>vitals|medikamente)$/,
    buildPayload(match) {
      const target = match.groups.target;
      return {
        module: target === 'medikamente' ? 'intake' : target,
        target,
      };
    },
    target_action: 'open_module',
  },
];

export default {
  NAVIGATION_RULES,
};

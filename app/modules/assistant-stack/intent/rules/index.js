'use strict';

import { CONFIRM_REJECT_RULES } from './confirm-reject.js';
import { INTAKE_RULES } from './intake.js';
import { MEDICATION_RULES } from './medication.js';
import { BREATH_TIMER_RULES } from './breath-timer.js';
import { VITALS_RULES } from './vitals.js';
import { NAVIGATION_RULES } from './navigation.js';

export const RULE_SETS = [
  ...CONFIRM_REJECT_RULES,
  ...INTAKE_RULES,
  ...MEDICATION_RULES,
  ...BREATH_TIMER_RULES,
  ...VITALS_RULES,
  ...NAVIGATION_RULES,
];

export default {
  RULE_SETS,
};

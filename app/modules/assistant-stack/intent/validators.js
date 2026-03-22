'use strict';

const ACTION_SAFETY_CLASS = new Map([
  ['confirm_reject', 'confirm_only'],
  ['intake_quick_add', 'guarded_write'],
  ['medication_confirm_section', 'guarded_write'],
  ['start_breath_timer', 'safe_read'],
  ['vitals_quick_log', 'guarded_write'],
  ['simple_navigation', 'safe_read'],
]);

const NAVIGATION_TARGETS = new Set(['vitals', 'intake']);

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function inRange(value, min, max) {
  return isFiniteNumber(value) && value >= min && value <= max;
}

function ok(extra = {}) {
  return {
    valid: true,
    reason: null,
    ...extra,
  };
}

function fail(reason, extra = {}) {
  return {
    valid: false,
    reason,
    ...extra,
  };
}

function validateConfirmReject(match) {
  const payload = match?.payload || {};
  if (match?.target_action != null) {
    return fail('confirm-reject-target-action-not-allowed');
  }
  if (payload.action !== 'confirm' && payload.action !== 'reject') {
    return fail('confirm-reject-action-invalid');
  }
  if (
    payload.value !== 'yes' &&
    payload.value !== 'no' &&
    payload.value !== 'save' &&
    payload.value !== 'cancel'
  ) {
    return fail('confirm-reject-value-invalid');
  }
  return ok({ safety_class: 'confirm_only' });
}

function validateIntakeQuickAdd(match) {
  const payload = match?.payload || {};
  if (match?.target_action !== 'intake_save') {
    return fail('intake-target-action-invalid');
  }

  const hasWater = Object.prototype.hasOwnProperty.call(payload, 'water_ml');
  const hasSalt = Object.prototype.hasOwnProperty.call(payload, 'salt_g');
  const hasProtein = Object.prototype.hasOwnProperty.call(payload, 'protein_g');

  if (!hasWater && !hasSalt && !hasProtein) {
    return fail('intake-payload-empty');
  }
  if (hasWater && !inRange(payload.water_ml, 1, 10000)) {
    return fail('intake-water-out-of-range');
  }
  if (hasSalt && !inRange(payload.salt_g, 0, 40)) {
    return fail('intake-salt-out-of-range');
  }
  if (hasProtein && !inRange(payload.protein_g, 0, 200)) {
    return fail('intake-protein-out-of-range');
  }

  return ok({ safety_class: 'guarded_write' });
}

function validateMedicationConfirmSection(match) {
  const payload = match?.payload || {};
  if (match?.target_action !== 'medication_confirm_section') {
    return fail('medication-target-action-invalid');
  }
  if (`${payload.scope || ''}`.trim() !== 'open_for_section') {
    return fail('medication-scope-invalid');
  }
  if (!['morning', 'noon', 'evening', 'night'].includes(`${payload.section || ''}`.trim())) {
    return fail('medication-section-invalid');
  }
  return ok({ safety_class: 'guarded_write' });
}

function validateVitalsQuickLog(match) {
  const payload = match?.payload || {};
  const targetAction = match?.target_action || '';

  if (targetAction === 'vitals_log_bp') {
    if (!inRange(payload.systolic, 60, 260)) {
      return fail('bp-systolic-out-of-range');
    }
    if (!inRange(payload.diastolic, 40, 160)) {
      return fail('bp-diastolic-out-of-range');
    }
    if (payload.systolic <= payload.diastolic) {
      return fail('bp-order-invalid');
    }
    return ok({ safety_class: 'guarded_write' });
  }

  if (targetAction === 'vitals_log_pulse') {
    if (!inRange(payload.pulse, 25, 240)) {
      return fail('pulse-out-of-range');
    }
    return ok({ safety_class: 'guarded_write' });
  }

  if (targetAction === 'vitals_log_weight') {
    if (!inRange(payload.weight_kg, 20, 400)) {
      return fail('weight-out-of-range');
    }
    return ok({ safety_class: 'guarded_write' });
  }

  return fail('vitals-target-action-invalid');
}

function validateStartBreathTimer(match) {
  const payload = match?.payload || {};
  if (match?.target_action !== 'start_breath_timer') {
    return fail('breath-timer-target-action-invalid');
  }
  if (payload.minutes !== 3 && payload.minutes !== 5) {
    return fail('breath-timer-minutes-invalid');
  }
  return ok({ safety_class: 'safe_read' });
}

function validateSimpleNavigation(match) {
  const payload = match?.payload || {};
  if (match?.target_action !== 'open_module') {
    return fail('navigation-target-action-invalid');
  }
  if (!NAVIGATION_TARGETS.has(payload.module)) {
    return fail('navigation-module-invalid');
  }
  return ok({ safety_class: 'safe_read' });
}

export function getSafetyClass(intentKey) {
  return ACTION_SAFETY_CLASS.get(String(intentKey || '').trim()) || null;
}

export function validateIntentMatch(match) {
  if (!match || typeof match !== 'object') {
    return fail('match-missing');
  }

  const intentKey = String(match.intent_key || '').trim();
  if (!intentKey) {
    return fail('intent-key-missing');
  }

  switch (intentKey) {
    case 'confirm_reject':
      return validateConfirmReject(match);
    case 'intake_quick_add':
      return validateIntakeQuickAdd(match);
    case 'medication_confirm_section':
      return validateMedicationConfirmSection(match);
    case 'start_breath_timer':
      return validateStartBreathTimer(match);
    case 'vitals_quick_log':
      return validateVitalsQuickLog(match);
    case 'simple_navigation':
      return validateSimpleNavigation(match);
    default:
      return fail('intent-key-unsupported');
  }
}

export default {
  getSafetyClass,
  validateIntentMatch,
};

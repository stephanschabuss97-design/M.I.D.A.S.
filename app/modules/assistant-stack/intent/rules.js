'use strict';

// Rule discipline:
// - keep this file limited to intent matching and minimal payload mapping
// - do not add value-range checks, pending-context logic, routing, persistence, or UI concerns here
// - if a change needs semantic normalization, validation, or flow decisions, move it to
//   normalizers.js, validators.js, context.js, or the calling flow instead

const CONFIRM_REJECT_RULES = [
  {
    intent_key: 'confirm_reject',
    match(normalizedText) {
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
    buildPayload(result) {
      return {
        action: result.action,
        value: result.value,
      };
    },
    target_action: null,
  },
];

const INTAKE_RULES = [
  {
    intent_key: 'intake_quick_add',
    pattern: /^(?:wasser (?<amount_a>\d+(?:\.\d+)?) (?<unit_a>ml|l)|(?:trage mir )?(?<amount_b>\d+(?:\.\d+)?) (?<unit_b>ml|l) wasser(?: ein)?)$/,
    buildPayload(match) {
      const amount = Number(match.groups.amount_a || match.groups.amount_b);
      const unit = match.groups.unit_a || match.groups.unit_b;
      const waterMl = unit === 'l' ? amount * 1000 : amount;
      return { water_ml: waterMl };
    },
    target_action: 'intake_save',
  },
  {
    intent_key: 'intake_quick_add',
    pattern: /^(?<metric>protein|salz) (?<amount>\d+(?:\.\d+)?) (?<unit>g)$/,
    buildPayload(match) {
      const metric = match.groups.metric;
      const amount = Number(match.groups.amount);
      if (metric === 'protein') {
        return { protein_g: amount };
      }
      return { salt_g: amount };
    },
    target_action: 'intake_save',
  },
];

const VITALS_RULES = [
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

const NAVIGATION_RULES = [
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

const RULE_SETS = [
  ...CONFIRM_REJECT_RULES,
  ...INTAKE_RULES,
  ...VITALS_RULES,
  ...NAVIGATION_RULES,
];

function buildRuleMatch(rule, payload, rawMatch = null) {
  return {
    intent_key: rule.intent_key,
    payload,
    target_action: rule.target_action || null,
    meta: {
      rule_kind: rule.pattern ? 'pattern' : 'matcher',
      raw_match: rawMatch,
    },
  };
}

function runPatternRule(rule, normalizedText) {
  const match = normalizedText.match(rule.pattern);
  if (!match) return null;
  const payload = rule.buildPayload(match);
  return buildRuleMatch(rule, payload, match[0]);
}

function runMatcherRule(rule, normalizedText) {
  const result = rule.match(normalizedText);
  if (!result) return null;
  const payload = rule.buildPayload(result);
  return buildRuleMatch(rule, payload);
}

export function matchIntentRule(normalizedInput) {
  const normalizedText =
    typeof normalizedInput?.normalized_text === 'string'
      ? normalizedInput.normalized_text.trim()
      : '';

  if (!normalizedText) return null;

  for (const rule of RULE_SETS) {
    const match = rule.pattern
      ? runPatternRule(rule, normalizedText)
      : runMatcherRule(rule, normalizedText);
    if (match) return match;
  }

  return null;
}

export function getIntentRules() {
  return RULE_SETS.slice();
}

export default {
  matchIntentRule,
  getIntentRules,
};

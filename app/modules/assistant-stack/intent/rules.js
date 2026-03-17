'use strict';

// Rule discipline:
// - keep this file limited to intent matching and minimal payload mapping
// - do not add value-range checks, pending-context logic, routing, persistence, or UI concerns here
// - if a change needs semantic normalization, validation, or flow decisions, move it to
//   normalizers.js, validators.js, context.js, or the calling flow instead

import { RULE_SETS } from './rules/index.js';

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

function runMatcherRule(rule, normalizedInput) {
  const result = rule.match(normalizedInput);
  if (!result) return null;
  const payload = typeof rule.buildPayload === 'function' ? rule.buildPayload(result) : result;
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
      : runMatcherRule(rule, normalizedInput);
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

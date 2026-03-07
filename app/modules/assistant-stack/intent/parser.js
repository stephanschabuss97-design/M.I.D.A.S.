'use strict';

import { normalizeIntentInput } from './normalizers.js';
import { matchIntentRule } from './rules.js';
import { validateIntentMatch } from './validators.js';
import { getPendingContextState } from './context.js';

function buildResult({
  decision,
  intent_key = null,
  payload = null,
  target_action = null,
  fallback_required = null,
  reason = null,
  source_type = null,
  source_id = null,
  dedupe_key = null,
  normalized = null,
  rule_match = null,
  validation = null,
  context_state = null,
}) {
  return {
    decision,
    intent_key,
    payload,
    target_action,
    fallback_required: fallback_required == null ? decision === 'fallback' : !!fallback_required,
    reason,
    source_type,
    source_id,
    dedupe_key,
    normalized,
    rule_match,
    validation,
    context_state,
  };
}

function buildFallback(reason, extra = {}) {
  return buildResult({
    decision: 'fallback',
    reason,
    fallback_required: true,
    ...extra,
  });
}

function buildDirectMatch(match, normalized, validation) {
  return buildResult({
    decision: 'direct_match',
    intent_key: match.intent_key,
    payload: match.payload || null,
    target_action: match.target_action || null,
    fallback_required: false,
    reason: null,
    source_type: normalized?.source_type || normalized?.source || null,
    source_id: normalized?.source_id || null,
    dedupe_key: normalized?.dedupe_key || null,
    normalized,
    rule_match: match,
    validation,
  });
}

function buildNeedsConfirmation(match, normalized, validation, contextState, reason) {
  return buildResult({
    decision: 'needs_confirmation',
    intent_key: match.intent_key,
    payload: match.payload || null,
    target_action: match.target_action || null,
    fallback_required: false,
    reason,
    source_type: normalized?.source_type || normalized?.source || null,
    source_id: normalized?.source_id || null,
    dedupe_key: normalized?.dedupe_key || null,
    normalized,
    rule_match: match,
    validation,
    context_state: contextState,
  });
}

function evaluateConfirmReject(match, normalized, validation, options = {}) {
  const pendingContext = options.pending_context || null;
  const contextState = getPendingContextState(pendingContext, options);

  if (!contextState.usable) {
    return buildNeedsConfirmation(
      match,
      normalized,
      validation,
      contextState,
      contextState.reason || 'pending-context-required',
    );
  }

  return buildNeedsConfirmation(
    match,
    normalized,
    validation,
    contextState,
    'pending-context-confirmable',
  );
}

export function parseIntent(rawText, options = {}) {
  const normalized = normalizeIntentInput(rawText, options);

  if (!normalized.normalized_text) {
    return buildFallback('empty-input', {
      normalized,
    });
  }

  const ruleMatch = matchIntentRule(normalized);
  if (!ruleMatch) {
    return buildFallback('no-rule-match', {
      normalized,
    });
  }

  const validation = validateIntentMatch(ruleMatch);
  if (!validation.valid) {
    return buildFallback(validation.reason || 'validation-failed', {
      normalized,
      rule_match: ruleMatch,
      validation,
    });
  }

  if (ruleMatch.intent_key === 'confirm_reject') {
    return evaluateConfirmReject(ruleMatch, normalized, validation, options);
  }

  return buildDirectMatch(ruleMatch, normalized, validation);
}

export default {
  parseIntent,
};

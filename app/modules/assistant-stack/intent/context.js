'use strict';

const DEFAULT_TTL_MS = 30_000;

function nowTs() {
  return Date.now();
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function clonePayloadSnapshot(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return { ...value };
}

export function createPendingIntentContext(intentType, targetAction, payloadSnapshot = {}, options = {}) {
  const createdAt = Number.isFinite(options.created_at) ? options.created_at : nowTs();
  const ttlMs = Number.isFinite(options.ttl_ms) ? options.ttl_ms : DEFAULT_TTL_MS;
  const expiresAt = Number.isFinite(options.expires_at) ? options.expires_at : createdAt + ttlMs;

  return {
    pending_intent_id:
      isNonEmptyString(options.pending_intent_id)
        ? options.pending_intent_id.trim()
        : `pending-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
    intent_type: isNonEmptyString(intentType) ? intentType.trim() : '',
    target_action: isNonEmptyString(targetAction) ? targetAction.trim() : '',
    payload_snapshot: clonePayloadSnapshot(payloadSnapshot),
    created_at: createdAt,
    expires_at: expiresAt,
    consumed_at: Number.isFinite(options.consumed_at) ? options.consumed_at : null,
    dedupe_key: isNonEmptyString(options.dedupe_key) ? options.dedupe_key.trim() : null,
    source: isNonEmptyString(options.source) ? options.source.trim() : null,
    ui_origin: isNonEmptyString(options.ui_origin) ? options.ui_origin.trim() : null,
  };
}

function missingFieldResult(field) {
  return {
    usable: false,
    reason: `${field}-missing`,
  };
}

export function getPendingContextState(context, options = {}) {
  if (!context || typeof context !== 'object') {
    return {
      usable: false,
      reason: 'pending-context-missing',
    };
  }

  if (!isNonEmptyString(context.pending_intent_id)) {
    return missingFieldResult('pending-intent-id');
  }
  if (!isNonEmptyString(context.intent_type)) {
    return missingFieldResult('intent-type');
  }
  if (!isNonEmptyString(context.target_action)) {
    return missingFieldResult('target-action');
  }
  if (!context.payload_snapshot || typeof context.payload_snapshot !== 'object') {
    return missingFieldResult('payload-snapshot');
  }
  if (!Number.isFinite(context.created_at)) {
    return missingFieldResult('created-at');
  }
  if (!Number.isFinite(context.expires_at)) {
    return missingFieldResult('expires-at');
  }

  const referenceTs = Number.isFinite(options.now) ? options.now : nowTs();
  if (Number.isFinite(context.consumed_at)) {
    return {
      usable: false,
      reason: 'pending-context-consumed',
    };
  }
  if (context.expires_at <= referenceTs) {
    return {
      usable: false,
      reason: 'pending-context-expired',
    };
  }

  return {
    usable: true,
    reason: null,
    context: {
      ...context,
      payload_snapshot: clonePayloadSnapshot(context.payload_snapshot),
    },
  };
}

export function consumePendingIntentContext(context, options = {}) {
  const state = getPendingContextState(context, options);
  if (!state.usable) {
    return {
      ok: false,
      reason: state.reason,
      context: context || null,
    };
  }

  return {
    ok: true,
    reason: null,
    context: {
      ...state.context,
      consumed_at: Number.isFinite(options.now) ? options.now : nowTs(),
    },
  };
}

export function matchesPendingIntentContext(context, criteria = {}, options = {}) {
  const state = getPendingContextState(context, options);
  if (!state.usable) {
    return {
      matched: false,
      reason: state.reason,
    };
  }

  if (isNonEmptyString(criteria.intent_type) && state.context.intent_type !== criteria.intent_type.trim()) {
    return {
      matched: false,
      reason: 'pending-context-intent-mismatch',
    };
  }

  if (
    isNonEmptyString(criteria.target_action) &&
    state.context.target_action !== criteria.target_action.trim()
  ) {
    return {
      matched: false,
      reason: 'pending-context-target-mismatch',
    };
  }

  if (isNonEmptyString(criteria.dedupe_key) && state.context.dedupe_key !== criteria.dedupe_key.trim()) {
    return {
      matched: false,
      reason: 'pending-context-dedupe-mismatch',
    };
  }

  return {
    matched: true,
    reason: null,
    context: state.context,
  };
}

export default {
  createPendingIntentContext,
  getPendingContextState,
  consumePendingIntentContext,
  matchesPendingIntentContext,
};

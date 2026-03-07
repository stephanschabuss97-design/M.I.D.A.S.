'use strict';

import { parseIntent } from './parser.js';
import {
  createPendingIntentContext,
  getPendingContextState,
  consumePendingIntentContext,
} from './context.js';

const TELEMETRY_MAX_EVENTS = 80;
const telemetryState = {
  totals: {
    all: 0,
  },
  by_source: Object.create(null),
  by_decision: Object.create(null),
  by_outcome: Object.create(null),
  by_reason: Object.create(null),
  by_intent: Object.create(null),
  by_route: Object.create(null),
  recent: [],
};

function incrementCounter(bucket, key) {
  const normalizedKey =
    typeof key === 'string' && key.trim() ? key.trim() : 'unknown';
  bucket[normalizedKey] = (bucket[normalizedKey] || 0) + 1;
}

function cloneBucket(bucket) {
  return Object.fromEntries(Object.entries(bucket || {}));
}

function normalizeAdapterSource(source) {
  const value = typeof source === 'string' && source.trim() ? source.trim().toLowerCase() : 'text';
  if (value === 'voice' || value === 'device') return value;
  return 'text';
}

function normalizeAdapterId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function createAdapterInput(rawText, options = {}) {
  const source = normalizeAdapterSource(options.source);
  const sourceId = normalizeAdapterId(options.source_id);
  const dedupeKey = normalizeAdapterId(options.dedupe_key);
  return {
    raw_text: typeof rawText === 'string' ? rawText : String(rawText || ''),
    source,
    source_type: source,
    source_id: sourceId,
    dedupe_key: dedupeKey,
    ui_context:
      options.ui_context && typeof options.ui_context === 'object' ? { ...options.ui_context } : null,
    pending_context:
      options.pending_context && typeof options.pending_context === 'object'
        ? { ...options.pending_context }
        : null,
    meta: options.meta && typeof options.meta === 'object' ? { ...options.meta } : null,
  };
}

export function parseAdapterInput(adapterInput = {}) {
  const envelope = createAdapterInput(adapterInput.raw_text, adapterInput);
  return parseIntent(envelope.raw_text, {
    source: envelope.source,
    source_id: envelope.source_id,
    dedupe_key: envelope.dedupe_key,
    ui_context: envelope.ui_context,
    pending_context: envelope.pending_context,
    meta: envelope.meta,
  });
}

export function parse(rawText, options = {}) {
  return parseIntent(rawText, options);
}

export function recordTelemetry(event = {}) {
  const sourceType = normalizeAdapterSource(event.source_type || event.source);
  const decision =
    typeof event.decision === 'string' && event.decision.trim() ? event.decision.trim() : 'unknown';
  const outcome =
    typeof event.outcome === 'string' && event.outcome.trim() ? event.outcome.trim() : 'none';
  const reason =
    typeof event.reason === 'string' && event.reason.trim() ? event.reason.trim() : 'none';
  const intentKey =
    typeof event.intent_key === 'string' && event.intent_key.trim()
      ? event.intent_key.trim()
      : 'none';
  const route =
    typeof event.route === 'string' && event.route.trim() ? event.route.trim() : null;

  telemetryState.totals.all += 1;
  incrementCounter(telemetryState.by_source, sourceType);
  incrementCounter(telemetryState.by_decision, decision);
  incrementCounter(telemetryState.by_outcome, outcome);
  incrementCounter(telemetryState.by_reason, reason);
  incrementCounter(telemetryState.by_intent, intentKey);
  if (route) {
    incrementCounter(telemetryState.by_route, route);
  }

  telemetryState.recent.unshift({
    at: Date.now(),
    source_type: sourceType,
    decision,
    outcome,
    reason,
    intent_key: intentKey,
    target_action:
      typeof event.target_action === 'string' && event.target_action.trim()
        ? event.target_action.trim()
        : null,
    route,
  });
  if (telemetryState.recent.length > TELEMETRY_MAX_EVENTS) {
    telemetryState.recent.length = TELEMETRY_MAX_EVENTS;
  }

  return {
    total: telemetryState.totals.all,
    event: telemetryState.recent[0],
  };
}

export function getTelemetrySnapshot() {
  return {
    totals: { ...telemetryState.totals },
    by_source: cloneBucket(telemetryState.by_source),
    by_decision: cloneBucket(telemetryState.by_decision),
    by_outcome: cloneBucket(telemetryState.by_outcome),
    by_reason: cloneBucket(telemetryState.by_reason),
    by_intent: cloneBucket(telemetryState.by_intent),
    by_route: cloneBucket(telemetryState.by_route),
    recent: telemetryState.recent.map((entry) => ({ ...entry })),
  };
}

export function resetTelemetry() {
  telemetryState.totals.all = 0;
  telemetryState.by_source = Object.create(null);
  telemetryState.by_decision = Object.create(null);
  telemetryState.by_outcome = Object.create(null);
  telemetryState.by_reason = Object.create(null);
  telemetryState.by_intent = Object.create(null);
  telemetryState.by_route = Object.create(null);
  telemetryState.recent = [];
}

export {
  parseIntent,
  createPendingIntentContext,
  getPendingContextState,
  consumePendingIntentContext,
};

export default {
  parse,
  parseIntent,
  createAdapterInput,
  parseAdapterInput,
  createPendingIntentContext,
  getPendingContextState,
  consumePendingIntentContext,
  recordTelemetry,
  getTelemetrySnapshot,
  resetTelemetry,
};

if (typeof window !== 'undefined') {
  window.AppModules = window.AppModules || {};
  window.AppModules.intentEngine = {
    parse,
    parseIntent,
    createAdapterInput,
    parseAdapterInput,
    createPendingIntentContext,
    getPendingContextState,
    consumePendingIntentContext,
    recordTelemetry,
    getTelemetrySnapshot,
    resetTelemetry,
  };
}

'use strict';

import { normalizeSurfaceText } from './normalizers/surface.js';
import { normalizeSemanticText } from './normalizers/semantic.js';
import { extractSemanticSlots } from './slots/extract.js';

const DEFAULT_SOURCE = 'text';
const ALLOWED_SOURCES = new Set(['text', 'voice', 'device']);

export function normalizeIntentText(rawText) {
  const raw = typeof rawText === 'string' ? rawText : '';
  const surface = normalizeSurfaceText(raw);
  const semantic = normalizeSemanticText(surface.surface_text, { rawText: raw });
  const slotState = extractSemanticSlots(semantic);

  return {
    raw_text: raw,
    surface_normalized_text: surface.surface_text,
    semantic_normalized_text: semantic.semantic_text,
    normalized_text: semantic.semantic_text,
    surface_tokens: surface.tokens,
    semantic_tokens: semantic.tokens,
    tokens: semantic.tokens,
    slots: slotState.slots,
    slots_by_type: slotState.by_type,
  };
}

export function normalizeIntentInput(rawText, options = {}) {
  const rawSource =
    typeof options.source === 'string' && options.source.trim()
      ? options.source.trim().toLowerCase()
      : DEFAULT_SOURCE;
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : DEFAULT_SOURCE;
  const rawSourceId =
    typeof options.source_id === 'string' && options.source_id.trim()
      ? options.source_id.trim()
      : null;
  const rawDedupeKey =
    typeof options.dedupe_key === 'string' && options.dedupe_key.trim()
      ? options.dedupe_key.trim()
      : null;
  const base = normalizeIntentText(rawText);
  return {
    raw_text: base.raw_text,
    surface_normalized_text: base.surface_normalized_text,
    semantic_normalized_text: base.semantic_normalized_text,
    normalized_text: base.normalized_text,
    surface_tokens: base.surface_tokens,
    semantic_tokens: base.semantic_tokens,
    tokens: base.tokens,
    slots: base.slots,
    slots_by_type: base.slots_by_type,
    source,
    source_type: source,
    source_id: rawSourceId,
    dedupe_key: rawDedupeKey,
    meta: options.meta && typeof options.meta === 'object' ? { ...options.meta } : null,
  };
}

export function isNormalizedUnit(token) {
  return ['ml', 'g', 'kg', 'l', 'minuten'].includes(String(token || '').trim());
}

export default {
  normalizeIntentInput,
  normalizeIntentText,
  isNormalizedUnit,
  ALLOWED_SOURCES,
};

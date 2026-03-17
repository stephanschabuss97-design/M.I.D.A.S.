'use strict';

import { ENTITY_TERMS } from '../semantics/entities.js';
import { VERB_TERMS } from '../semantics/verbs.js';
import { UNIT_TERMS } from '../semantics/units.js';
import { FILLER_TERMS } from '../semantics/fillers.js';
import { COMPOUND_MARKERS } from '../semantics/compound.js';

function pushSlot(slots, type, value, index, meta = null) {
  slots.push({
    type,
    value,
    index,
    meta: meta && typeof meta === 'object' ? { ...meta } : null,
  });
}

function extractAmountUnitSlots(tokens, slots) {
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!/^\d+(?:\.\d+)?$/.test(token)) {
      continue;
    }
    const nextToken = tokens[index + 1] || '';
    const unitValue = UNIT_TERMS.get(nextToken);
    if (!unitValue) {
      continue;
    }
    pushSlot(slots, 'AMOUNT', Number(token), index);
    pushSlot(slots, 'UNIT', unitValue, index + 1);
    if (unitValue === 'minuten') {
      pushSlot(slots, 'DURATION', Number(token), index, { unit: unitValue });
    }
  }
}

function extractEntitySlots(tokens, slots) {
  tokens.forEach((token, index) => {
    Object.entries(ENTITY_TERMS).forEach(([type, values]) => {
      if (values.has(token)) {
        pushSlot(slots, type, token, index);
      }
    });
  });
}

function extractVerbSlots(tokens, slots) {
  tokens.forEach((token, index) => {
    Object.entries(VERB_TERMS).forEach(([type, values]) => {
      if (values.has(token)) {
        pushSlot(slots, type, token, index);
      }
    });
  });
}

function extractMarkerSlots(tokens, slots) {
  tokens.forEach((token, index) => {
    if (COMPOUND_MARKERS.has(token)) {
      pushSlot(slots, 'MORNING_COMPOUND_MARKER', token, index);
    }
    if (FILLER_TERMS.has(token)) {
      pushSlot(slots, 'FILLER', token, index);
    }
  });
}

function buildSlotIndex(slots) {
  const byType = Object.create(null);
  slots.forEach((slot) => {
    if (!byType[slot.type]) {
      byType[slot.type] = [];
    }
    byType[slot.type].push(slot);
  });
  return byType;
}

export function extractSemanticSlots(semanticInput = {}) {
  const tokens = Array.isArray(semanticInput.tokens) ? semanticInput.tokens.slice() : [];
  const slots = [];
  extractAmountUnitSlots(tokens, slots);
  extractEntitySlots(tokens, slots);
  extractVerbSlots(tokens, slots);
  extractMarkerSlots(tokens, slots);
  return {
    tokens,
    slots,
    by_type: buildSlotIndex(slots),
  };
}

export default {
  extractSemanticSlots,
};

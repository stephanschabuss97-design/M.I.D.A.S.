'use strict';

function findEntitySlot(normalizedInput, type) {
  const slots = normalizedInput?.slots_by_type?.[type];
  return Array.isArray(slots) && slots.length ? slots[0] : null;
}

function findFirstAmountUnitPair(normalizedInput, allowedUnits) {
  const amounts = Array.isArray(normalizedInput?.slots_by_type?.AMOUNT)
    ? normalizedInput.slots_by_type.AMOUNT
    : [];
  const units = Array.isArray(normalizedInput?.slots_by_type?.UNIT)
    ? normalizedInput.slots_by_type.UNIT
    : [];
  for (const amountSlot of amounts) {
    const unitSlot = units.find(
      (slot) => slot.index === amountSlot.index + 1 && allowedUnits.has(slot.value),
    );
    if (unitSlot) {
      return {
        amount: Number(amountSlot.value),
        unit: unitSlot.value,
      };
    }
  }
  return null;
}

function buildWaterPayload(pair) {
  return {
    water_ml: pair.unit === 'l' ? pair.amount * 1000 : pair.amount,
  };
}

function buildMetricPayload(entityType, pair) {
  if (entityType === 'PROTEIN_TERM') {
    return { protein_g: pair.amount };
  }
  return { salt_g: pair.amount };
}

const WATER_UNITS = new Set(['ml', 'l']);
const GRAM_UNITS = new Set(['g']);

export const INTAKE_RULES = [
  {
    intent_key: 'intake_quick_add',
    match(normalizedInput) {
      const waterSlot = findEntitySlot(normalizedInput, 'WATER_TERM');
      if (!waterSlot) return null;
      const pair = findFirstAmountUnitPair(normalizedInput, WATER_UNITS);
      if (!pair) return null;
      return buildWaterPayload(pair);
    },
    target_action: 'intake_save',
  },
  {
    intent_key: 'intake_quick_add',
    match(normalizedInput) {
      const proteinSlot = findEntitySlot(normalizedInput, 'PROTEIN_TERM');
      if (!proteinSlot) return null;
      const pair = findFirstAmountUnitPair(normalizedInput, GRAM_UNITS);
      if (!pair) return null;
      return buildMetricPayload('PROTEIN_TERM', pair);
    },
    target_action: 'intake_save',
  },
  {
    intent_key: 'intake_quick_add',
    match(normalizedInput) {
      const saltSlot = findEntitySlot(normalizedInput, 'SALT_TERM');
      if (!saltSlot) return null;
      const pair = findFirstAmountUnitPair(normalizedInput, GRAM_UNITS);
      if (!pair) return null;
      return buildMetricPayload('SALT_TERM', pair);
    },
    target_action: 'intake_save',
  },
];

export default {
  INTAKE_RULES,
};

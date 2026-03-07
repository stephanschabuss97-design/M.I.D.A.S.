'use strict';

const DEFAULT_SOURCE = 'text';
const ALLOWED_SOURCES = new Set(['text', 'voice', 'device']);

const UMLAUT_MAP = [
  [/ae/g, 'ae'],
  [/oe/g, 'oe'],
  [/ue/g, 'ue'],
  [/ß/g, 'ss'],
  [/ä/g, 'ae'],
  [/ö/g, 'oe'],
  [/ü/g, 'ue'],
  [/ÃŸ/g, 'ss'],
  [/Ã¤/g, 'ae'],
  [/Ã¶/g, 'oe'],
  [/Ã¼/g, 'ue'],
];

const PHRASE_NORMALIZERS = [
  [/\bblut\s+druck\b/g, 'blutdruck'],
  [/\bmilliliter\b/g, 'ml'],
  [/\bmillilitre\b/g, 'ml'],
  [/\bgramm\b/g, 'g'],
  [/\bgram\b/g, 'g'],
  [/\bkilogramm\b/g, 'kg'],
  [/\bfluessigkeit\b/g, 'wasser'],
  [/\bflussigkeit\b/g, 'wasser'],
  [/\bfl\.\b/g, 'wasser'],
];

const UNIT_ALIASES = new Map([
  ['ml', 'ml'],
  ['g', 'g'],
  ['kg', 'kg'],
  ['l', 'l'],
]);

const TOKEN_SPLIT_RE = /\s+/;

function normalizeUmlauts(value) {
  let next = String(value || '');
  UMLAUT_MAP.forEach(([pattern, replacement]) => {
    next = next.replace(pattern, replacement);
  });
  return next;
}

function normalizeDecimalCommas(value) {
  return value.replace(/(\d),(\d)/g, '$1.$2');
}

function normalizeJoinedUnits(value) {
  return value.replace(/(\d(?:\.\d+)?)(ml|l|g|kg)\b/g, '$1 $2');
}

function normalizePunctuation(value) {
  return value
    .replace(/[;,!?]+/g, ' ')
    .replace(/[()]/g, ' ')
    .replace(/\s*:\s*/g, ': ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePhrases(value) {
  let next = value;
  PHRASE_NORMALIZERS.forEach(([pattern, replacement]) => {
    next = next.replace(pattern, replacement);
  });
  return next;
}

function normalizeToken(token) {
  if (!token) return '';
  const direct = UNIT_ALIASES.get(token);
  if (direct) return direct;
  return token;
}

export function normalizeIntentText(rawText) {
  const raw = typeof rawText === 'string' ? rawText : '';
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      raw_text: raw,
      normalized_text: '',
      tokens: [],
    };
  }

  let next = trimmed.toLowerCase();
  next = normalizeUmlauts(next);
  next = normalizeDecimalCommas(next);
  next = normalizeJoinedUnits(next);
  next = normalizePhrases(next);
  next = normalizePunctuation(next);

  const tokens = next
    .split(TOKEN_SPLIT_RE)
    .map((token) => normalizeToken(token))
    .filter(Boolean);

  return {
    raw_text: raw,
    normalized_text: tokens.join(' '),
    tokens,
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
    normalized_text: base.normalized_text,
    tokens: base.tokens,
    source,
    source_type: source,
    source_id: rawSourceId,
    dedupe_key: rawDedupeKey,
    meta: options.meta && typeof options.meta === 'object' ? { ...options.meta } : null,
  };
}

export function isNormalizedUnit(token) {
  return UNIT_ALIASES.has(String(token || '').trim());
}

export default {
  normalizeIntentInput,
  normalizeIntentText,
  isNormalizedUnit,
  ALLOWED_SOURCES,
};

'use strict';

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

const SURFACE_PHRASE_NORMALIZERS = [
  [/\bblut\s+druck\b/g, 'blutdruck'],
  [/\bmilliliter\b/g, 'ml'],
  [/\bmillilitre\b/g, 'ml'],
  [/\bgramm\b/g, 'g'],
  [/\bgram\b/g, 'g'],
  [/\bkilogramm\b/g, 'kg'],
];

const UNIT_ALIASES = new Map([
  ['ml', 'ml'],
  ['g', 'g'],
  ['kg', 'kg'],
  ['l', 'l'],
]);

const SPOKEN_NUMBER_TARGET_UNITS = new Set([
  'ml',
  'l',
  'g',
  'kg',
  'min',
  'minute',
  'minuten',
]);

const TOKEN_SPLIT_RE = /\s+/;

const GERMAN_NUMBER_DIRECT = new Map([
  ['null', 0],
  ['ein', 1],
  ['eine', 1],
  ['einen', 1],
  ['einem', 1],
  ['einer', 1],
  ['eins', 1],
  ['zwei', 2],
  ['drei', 3],
  ['vier', 4],
  ['fuenf', 5],
  ['sechs', 6],
  ['sieben', 7],
  ['acht', 8],
  ['neun', 9],
  ['zehn', 10],
  ['elf', 11],
  ['zwoelf', 12],
  ['dreizehn', 13],
  ['vierzehn', 14],
  ['fuenfzehn', 15],
  ['sechzehn', 16],
  ['siebzehn', 17],
  ['achtzehn', 18],
  ['neunzehn', 19],
  ['zwanzig', 20],
  ['dreissig', 30],
  ['vierzig', 40],
  ['fuenfzig', 50],
  ['sechzig', 60],
  ['siebzig', 70],
  ['achtzig', 80],
  ['neunzig', 90],
]);

const GERMAN_UNIT_WORDS = new Map([
  ['ein', 1],
  ['eine', 1],
  ['einen', 1],
  ['einem', 1],
  ['einer', 1],
  ['eins', 1],
  ['zwei', 2],
  ['drei', 3],
  ['vier', 4],
  ['fuenf', 5],
  ['sechs', 6],
  ['sieben', 7],
  ['acht', 8],
  ['neun', 9],
]);

const GERMAN_TENS = new Map([
  ['zwanzig', 20],
  ['dreissig', 30],
  ['vierzig', 40],
  ['fuenfzig', 50],
  ['sechzig', 60],
  ['siebzig', 70],
  ['achtzig', 80],
  ['neunzig', 90],
]);

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
    .replace(/-/g, ' ')
    .replace(/(^|[^\d])\.(?=[^\d]|$)/g, '$1 ')
    .replace(/[;,!?]+/g, ' ')
    .replace(/[()]/g, ' ')
    .replace(/\s*:\s*/g, ': ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSurfacePhrases(value) {
  let next = value;
  SURFACE_PHRASE_NORMALIZERS.forEach(([pattern, replacement]) => {
    next = next.replace(pattern, replacement);
  });
  return next;
}

function parseGermanNumberWord(value) {
  const compact = String(value || '').replace(/\s+/g, '');
  if (!compact) return null;
  if (/^\d+(?:\.\d+)?$/.test(compact)) {
    return Number(compact);
  }
  const direct = GERMAN_NUMBER_DIRECT.get(compact);
  if (direct != null) {
    return direct;
  }
  if (compact.includes('tausend')) {
    const index = compact.indexOf('tausend');
    const leftRaw = compact.slice(0, index);
    const rightRaw = compact.slice(index + 'tausend'.length);
    const left = leftRaw ? parseGermanNumberWord(leftRaw) : 1;
    if (!Number.isFinite(left)) return null;
    const right = rightRaw ? parseGermanNumberWord(rightRaw) : 0;
    if (!Number.isFinite(right)) return null;
    return left * 1000 + right;
  }
  if (compact.includes('hundert')) {
    const index = compact.indexOf('hundert');
    const leftRaw = compact.slice(0, index);
    const rightRaw = compact.slice(index + 'hundert'.length);
    const left = leftRaw ? parseGermanNumberWord(leftRaw) : 1;
    if (!Number.isFinite(left)) return null;
    const right = rightRaw ? parseGermanNumberWord(rightRaw) : 0;
    if (!Number.isFinite(right)) return null;
    return left * 100 + right;
  }
  for (const [tensWord, tensValue] of GERMAN_TENS.entries()) {
    if (!compact.endsWith(tensWord)) continue;
    const prefix = compact.slice(0, -tensWord.length);
    if (!prefix) {
      return tensValue;
    }
    if (!prefix.endsWith('und')) continue;
    const unitWord = prefix.slice(0, -'und'.length);
    const unitValue = GERMAN_UNIT_WORDS.get(unitWord);
    if (unitValue != null) {
      return tensValue + unitValue;
    }
  }
  return null;
}

function normalizeSpokenNumberTokens(tokens) {
  const next = [];
  let index = 0;
  while (index < tokens.length) {
    let normalized = false;
    for (let consumed = Math.min(6, tokens.length - index - 1); consumed >= 1; consumed -= 1) {
      const unitToken = tokens[index + consumed];
      if (!SPOKEN_NUMBER_TARGET_UNITS.has(unitToken)) {
        continue;
      }
      const phrase = tokens.slice(index, index + consumed).join('');
      const parsed = parseGermanNumberWord(phrase);
      if (!Number.isFinite(parsed)) {
        continue;
      }
      next.push(String(parsed), unitToken);
      index += consumed + 1;
      normalized = true;
      break;
    }
    if (normalized) {
      continue;
    }
    next.push(tokens[index]);
    index += 1;
  }
  return next;
}

function normalizeToken(token) {
  if (!token) return '';
  return UNIT_ALIASES.get(token) || token;
}

export function normalizeSurfaceText(rawText) {
  const raw = typeof rawText === 'string' ? rawText : '';
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      raw_text: raw,
      surface_text: '',
      tokens: [],
    };
  }

  let next = trimmed.toLowerCase();
  next = normalizeUmlauts(next);
  next = normalizeDecimalCommas(next);
  next = normalizeJoinedUnits(next);
  next = normalizeSurfacePhrases(next);
  next = normalizePunctuation(next);

  const rawTokens = next.split(TOKEN_SPLIT_RE).filter(Boolean);
  const tokens = normalizeSpokenNumberTokens(rawTokens)
    .map((token) => normalizeToken(token))
    .filter(Boolean);

  return {
    raw_text: raw,
    surface_text: tokens.join(' '),
    tokens,
  };
}

export default {
  normalizeSurfaceText,
};

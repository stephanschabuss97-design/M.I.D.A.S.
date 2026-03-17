'use strict';

const SEMANTIC_ALIAS_MAP = new Map([
  ['flussigkeit', 'wasser'],
  ['fluessigkeit', 'wasser'],
  ['fl', 'wasser'],
  ['proteine', 'protein'],
  ['proteinen', 'protein'],
  ['tabletten', 'medikamente'],
  ['fuer', 'fuer'],
  ['für', 'fuer'],
]);

const FILLER_TOKENS = new Set([
  'bitte',
  'mir',
  'den',
]);

const FILLER_PHRASES = [
  /\bich habe\b/g,
  /\bkannst du\b/g,
];

function normalizeSemanticAliases(tokens) {
  return tokens.map((token) => SEMANTIC_ALIAS_MAP.get(token) || token);
}

function stripSemanticPhrases(value) {
  let next = value;
  FILLER_PHRASES.forEach((pattern) => {
    next = next.replace(pattern, ' ');
  });
  return next.replace(/\s+/g, ' ').trim();
}

export function normalizeSemanticText(surfaceText, options = {}) {
  const rawSurface = typeof surfaceText === 'string' ? surfaceText : '';
  const stripped = stripSemanticPhrases(rawSurface);
  const tokens = stripped
    .split(/\s+/g)
    .filter(Boolean)
    .map((token) => token.trim())
    .filter(Boolean);
  const aliasedTokens = normalizeSemanticAliases(tokens);
  const semanticTokens = aliasedTokens.filter((token) => !FILLER_TOKENS.has(token));

  return {
    raw_text: typeof options.rawText === 'string' ? options.rawText : '',
    surface_text: rawSurface,
    semantic_text: semanticTokens.join(' '),
    tokens: semanticTokens,
  };
}

export default {
  normalizeSemanticText,
};

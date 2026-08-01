#!/usr/bin/env node

'use strict';

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolDirectory, '..');
const defaults = {
  contract: 'docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md',
  runtime: 'app/modules/vitals-stack/activity/v2/semantics-v2.js',
  sql: 'sql/21_Activity_V2_Catalog_V2.sql'
};

function usage() {
  return [
    'MIDAS Activity catalog inspector',
    '',
    'Usage:',
    '  node tools/activity-catalog.mjs check',
    '  node tools/activity-catalog.mjs search <exercise name>',
    '  node tools/activity-catalog.mjs describe <item_key>',
    '',
    'Options:',
    '  --contract <path>  machine-readable catalog contract Markdown',
    '  --runtime <path>   versioned semantics runtime to compare',
    '  --sql <path>       insert-only SQL snapshot to compare',
    '  --no-runtime       skip runtime parity check',
    '  --no-sql           skip SQL parity check'
  ].join('\n');
}

function parseArguments(argv) {
  const options = { ...defaults, runtimeEnabled: true, sqlEnabled: true };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--no-runtime') {
      options.runtimeEnabled = false;
    } else if (value === '--no-sql') {
      options.sqlEnabled = false;
    } else if (['--contract', '--runtime', '--sql'].includes(value)) {
      const next = argv[index + 1];
      if (!next) throw new Error(`${value} requires a path`);
      options[value.slice(2)] = next;
      index += 1;
    } else if (value === '--help' || value === '-h') {
      options.help = true;
    } else if (value.startsWith('--')) {
      throw new Error(`unknown option: ${value}`);
    } else {
      positional.push(value);
    }
  }
  return { options, positional };
}

function resolveRepoPath(value) {
  return path.isAbsolute(value) ? value : path.resolve(repoRoot, value);
}

function readText(filePath) {
  return fs.readFileSync(resolveRepoPath(filePath), 'utf8');
}

function extractContract(source, sourceName) {
  const match = source.match(
    /MIDAS_ACTIVITY_V2_C2_CONTRACT_JSON_START[\s\S]*?```json\s*([\s\S]*?)\s*```[\s\S]*?MIDAS_ACTIVITY_V2_C2_CONTRACT_JSON_END/
  );
  if (!match) throw new Error(`machine-readable contract markers missing: ${sourceName}`);
  return JSON.parse(match[1]);
}

function readContract(filePath) {
  return extractContract(readText(filePath), filePath);
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadRuntimeSources(sources) {
  const context = vm.createContext({ console });
  sources.forEach(({ filePath, source }) => {
    vm.runInContext(source, context, { filename: filePath });
  });
  return context;
}

function loadV1Api() {
  const filePath = 'app/modules/vitals-stack/activity/v2/semantics.js';
  const context = loadRuntimeSources([{ filePath, source: readText(filePath) }]);
  return context.AppModules.activityV2.semantics;
}

function normalizeSearchText(text) {
  if (typeof text !== 'string') throw new TypeError('search text must be a string');
  return text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function asciiCompare(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function compareRank(left, right) {
  if (left.matchClass !== right.matchClass) return left.matchClass - right.matchClass;
  if (left.sourceRank !== right.sourceRank) return left.sourceRank - right.sourceRank;
  return asciiCompare(left.entry.key, right.entry.key);
}

function classifyForm(query, queryTokens, form) {
  if (form.normalized === query) {
    return {
      matchClass: form.sourceRank === 2 ? 1 : 0,
      sourceRank: form.sourceRank === 2 ? 0 : form.sourceRank
    };
  }
  if (form.normalized.startsWith(query)) {
    return { matchClass: 2, sourceRank: form.sourceRank };
  }
  const formTokens = form.normalized.split(' ');
  const tokenMatch = queryTokens.every((queryToken) =>
    formTokens.some((formToken) => formToken.startsWith(queryToken))
  );
  return tokenMatch ? { matchClass: 3, sourceRank: form.sourceRank } : null;
}

function searchCatalog(catalog, query, options = {}) {
  const limit = options.limit ?? 20;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new RangeError('search limit must be an integer from 1 to 50');
  }
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  const queryTokens = [...new Set(normalizedQuery.split(' '))];
  const matches = [];

  catalog.entries
    .filter((entry) => entry.status === 'active')
    .forEach((entry) => {
      const forms = [
        { normalized: normalizeSearchText(entry.label), sourceRank: 0 },
        { normalized: normalizeSearchText(entry.key), sourceRank: 1 },
        ...entry.aliases.map((alias) => ({
          normalized: normalizeSearchText(alias),
          sourceRank: 2
        }))
      ];
      let best = null;
      forms.forEach((form) => {
        const classification = classifyForm(normalizedQuery, queryTokens, form);
        if (!classification) return;
        const candidate = { entry, ...classification };
        if (best === null || compareRank(candidate, best) < 0) best = candidate;
      });
      if (best !== null) matches.push(best);
    });

  matches.sort(compareRank);
  return matches.slice(0, limit).map((match) => match.entry);
}

function withoutAliases(entry) {
  const clone = { ...entry };
  delete clone.aliases;
  return clone;
}

function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function readBaseCatalog(contract, v1Api) {
  const basePath = resolveRepoPath(contract.base_contract);
  const source = fs.readFileSync(basePath, 'utf8');
  if (source.includes('MIDAS_ACTIVITY_V2_C2_CONTRACT_JSON_START')) {
    return extractContract(source, contract.base_contract).catalog;
  }
  assertCondition(
    contract.base_contract.endsWith('MIDAS Activity V2 R1 Catalog Baseline Contract.md'),
    `unsupported non-machine-readable base contract: ${contract.base_contract}`
  );
  return plain(v1Api.getCatalog());
}

function validateTransition(contract, v1Api) {
  const { catalog } = contract;
  const baseCatalog = readBaseCatalog(contract, v1Api);
  const validation = plain(v1Api.validateCatalog(catalog));
  assertCondition(validation.valid === true, `catalog validation failed: ${JSON.stringify(validation.errors)}`);
  assertCondition(
    catalog.catalog_version === baseCatalog.catalog_version + 1,
    'catalog_version must increment the base contract by exactly one'
  );
  assertCondition(
    catalog.entries.length === contract.sql_projection.expected_rows,
    'entry count differs from sql_projection.expected_rows'
  );

  const baseByKey = new Map(baseCatalog.entries.map((entry) => [entry.key, entry]));
  const nextByKey = new Map(catalog.entries.map((entry) => [entry.key, entry]));
  const appendedKeys = Object.keys(contract.existing_alias_appends).sort(asciiCompare);
  appendedKeys.forEach((key) => {
    assertCondition(baseByKey.has(key), `alias append key missing from base catalog: ${key}`);
  });

  Object.entries(contract.existing_alias_appends).forEach(([key, aliases]) => {
    aliases.forEach((alias) => {
      const normalizedAlias = normalizeSearchText(alias);
      const exactOwners = catalog.entries
        .filter((entry) =>
          [entry.label, entry.key, ...entry.aliases].some(
            (form) => normalizeSearchText(form) === normalizedAlias
          )
        )
        .map((entry) => entry.key);
      assertCondition(
        isDeepStrictEqual(exactOwners, [key]),
        `appended alias is not collision-free for ${key}: ${alias} -> ${JSON.stringify(exactOwners)}`
      );
      assertCondition(
        searchCatalog(catalog, alias)[0]?.key === key,
        `appended alias does not rank its target first: ${alias} -> ${key}`
      );
    });
  });

  baseCatalog.entries.forEach((baseEntry) => {
    const nextEntry = nextByKey.get(baseEntry.key);
    assertCondition(nextEntry, `base key missing from next catalog: ${baseEntry.key}`);
    assertCondition(
      isDeepStrictEqual(withoutAliases(nextEntry), withoutAliases(baseEntry)),
      `non-alias fields changed for existing key: ${baseEntry.key}`
    );
    const expectedAliases = [
      ...baseEntry.aliases,
      ...(contract.existing_alias_appends[baseEntry.key] ?? [])
    ];
    assertCondition(
      isDeepStrictEqual(nextEntry.aliases, expectedAliases),
      `alias transition differs for existing key: ${baseEntry.key}`
    );
  });

  const actualNewKeys = catalog.entries
    .filter((entry) => !baseByKey.has(entry.key))
    .map((entry) => entry.key);
  assertCondition(
    isDeepStrictEqual(actualNewKeys, contract.new_keys),
    `new_keys differs from actual transition: ${JSON.stringify(actualNewKeys)}`
  );

  [...contract.studio_search_cases, ...contract.compatibility_search_cases].forEach(
    (searchCase) => {
      const actual = searchCatalog(catalog, searchCase.query, searchCase.options).map(
        (entry) => entry.key
      );
      assertCondition(
        isDeepStrictEqual(actual, searchCase.expected_keys),
        `${searchCase.id} search mismatch: ${JSON.stringify(actual)}`
      );
    }
  );

  return { baseCatalog, aliasCount: Object.values(contract.existing_alias_appends).flat().length };
}

function validateRuntimeParity(contract, runtimePath) {
  const sources = [
    {
      filePath: 'app/modules/vitals-stack/activity/v2/semantics.js',
      source: readText('app/modules/vitals-stack/activity/v2/semantics.js')
    },
    { filePath: runtimePath, source: readText(runtimePath) }
  ];
  const context = loadRuntimeSources(sources);
  const namespaceName = contract.public_api.namespace.split('.').at(-1);
  const api = context.AppModules?.activityV2?.[namespaceName];
  assertCondition(api && typeof api.getCatalog === 'function', 'versioned runtime API missing');
  assertCondition(
    isDeepStrictEqual(plain(api.getCatalog()), contract.catalog),
    'runtime catalog differs from contract catalog'
  );
}

function validateSqlParity(contract, sqlPath) {
  const source = readText(sqlPath);
  const match = source.match(
    /\$(activity_catalog(?:_v\d+)?)\$\s*(\[[\s\S]*?\])\s*\$\1\$::jsonb/
  );
  assertCondition(match, 'SQL embedded activity catalog marker missing');
  assertCondition(
    isDeepStrictEqual(JSON.parse(match[2]), contract.catalog.entries),
    'SQL embedded catalog differs from contract catalog'
  );
}

function runCheck(options) {
  const contract = readContract(options.contract);
  const v1Api = loadV1Api();
  const result = validateTransition(contract, v1Api);
  if (options.runtimeEnabled) validateRuntimeParity(contract, options.runtime);
  if (options.sqlEnabled) validateSqlParity(contract, options.sql);
  console.log(
    [
      'PASS',
      `catalog_version=${contract.catalog.catalog_version}`,
      `entries=${contract.catalog.entries.length}`,
      `alias_appends=${result.aliasCount}`,
      `search_cases=${contract.studio_search_cases.length + contract.compatibility_search_cases.length}`,
      `runtime=${options.runtimeEnabled ? 'checked' : 'skipped'}`,
      `sql=${options.sqlEnabled ? 'checked' : 'skipped'}`
    ].join(' ')
  );
}

function runSearch(options, positional) {
  const query = positional.slice(1).join(' ').trim();
  if (!query) throw new Error('search requires an exercise name');
  const contract = readContract(options.contract);
  const results = searchCatalog(contract.catalog, query).map((entry) => ({
    key: entry.key,
    label: entry.label,
    tracking_mode: entry.tracking_mode,
    equipment: entry.equipment
  }));
  console.log(JSON.stringify({ query, catalog_version: contract.catalog.catalog_version, results }, null, 2));
  if (results.length === 0) process.exitCode = 2;
}

function runDescribe(options, positional) {
  const key = positional[1];
  if (!key || positional.length !== 2) throw new Error('describe requires exactly one item_key');
  const contract = readContract(options.contract);
  const entry = contract.catalog.entries.find((candidate) => candidate.key === key);
  if (!entry) {
    console.error(`item_key not found in catalog version ${contract.catalog.catalog_version}: ${key}`);
    process.exitCode = 2;
    return;
  }
  console.log(JSON.stringify(entry, null, 2));
}

try {
  const { options, positional } = parseArguments(process.argv.slice(2));
  if (options.help || positional.length === 0) {
    console.log(usage());
  } else if (positional[0] === 'check') {
    assertCondition(positional.length === 1, 'check does not accept positional arguments');
    runCheck(options);
  } else if (positional[0] === 'search') {
    runSearch(options, positional);
  } else if (positional[0] === 'describe') {
    runDescribe(options, positional);
  } else {
    throw new Error(`unknown command: ${positional[0]}`);
  }
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}

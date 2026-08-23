'use strict';

(function initActivityV2ConsumerDataAccess(root) {
  const OPERATION = 'loadSnapshot';
  const FUNCTION_NAME = 'activity_consumer_snapshot';
  const SAFE_MESSAGE = 'The activity consumer request failed.';
  const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const DAY_MS = 86400000;
  const SQL_TOKEN_CODES = Object.freeze({
    MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED: 'AUTH_REQUIRED',
    MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE: 'INVALID_RANGE',
    MIDAS_ACTIVITY_CONSUMER_RANGE_TOO_LARGE: 'RANGE_TOO_LARGE',
    MIDAS_ACTIVITY_CONSUMER_LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
    MIDAS_ACTIVITY_CONSUMER_SOURCE_INVALID: 'CONTRACT_INVALID'
  });

  class ActivityConsumerDataAccessError extends Error {
    constructor(code, retryable, status) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityConsumerDataAccessError';
      this.code = code;
      this.operation = OPERATION;
      this.retryable = retryable === true;
      this.status = Number.isInteger(status) ? status : null;
    }
  }

  function isPlainRecord(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || Object.getPrototypeOf(prototype) === null;
  }

  function logFailure(code, status) {
    const diag =
      root.diag ||
      root.AppModules?.diag ||
      root.AppModules?.diagnostics ||
      { add() {} };
    const safeStatus = Number.isInteger(status) ? String(status) : 'none';
    try {
      diag.add?.(
        `[activity-consumer] ${OPERATION} failed code=${code} status=${safeStatus}`
      );
    } catch (_) {}
  }

  function failure(code, retryable = false, status) {
    logFailure(code, status);
    return new ActivityConsumerDataAccessError(code, retryable, status);
  }

  function canonicalDay(value) {
    if (typeof value !== 'string' || !DAY_RE.test(value) || value.startsWith('0000')) {
      return false;
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function normalizeRange(value, consumer) {
    try {
      if (!isPlainRecord(value)) throw new TypeError('invalid range');
      const keys = Reflect.ownKeys(value);
      const descriptors = Object.getOwnPropertyDescriptors(value);
      if (
        keys.length !== 2 ||
        keys.some(
          (key) =>
            typeof key !== 'string' ||
            !['from', 'to'].includes(key) ||
            !descriptors[key]?.enumerable ||
            !Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
        )
      ) {
        throw new TypeError('invalid range');
      }
      const from = descriptors.from.value;
      const to = descriptors.to.value;
      if (!canonicalDay(from) || !canonicalDay(to)) {
        throw new TypeError('invalid range');
      }
      const inclusiveDays =
        Math.trunc(
          (Date.parse(`${to}T00:00:00.000Z`) -
            Date.parse(`${from}T00:00:00.000Z`)) /
            DAY_MS
        ) + 1;
      return consumer.validateRange({
        from,
        to,
        inclusive_days: inclusiveDays
      });
    } catch (_) {
      throw failure('INVALID_RANGE');
    }
  }

  function makeJsonHeaders(headers) {
    if (typeof root.Headers === 'function' && headers instanceof root.Headers) {
      const merged = new root.Headers(headers);
      merged.set('content-type', 'application/json');
      return merged;
    }
    return { ...(headers || {}), 'content-type': 'application/json' };
  }

  function extractSqlToken(value) {
    if (!isPlainRecord(value)) return null;
    const combined = ['message', 'details', 'hint', 'code']
      .map((key) => value[key])
      .filter((entry) => typeof entry === 'string')
      .join(' ');
    return (
      Object.keys(SQL_TOKEN_CODES).find((candidate) => {
        const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(?:^|[^A-Z0-9_])${escaped}(?:$|[^A-Z0-9_])`).test(
          combined
        );
      }) || null
    );
  }

  async function readProblem(response) {
    try {
      return await response.clone().json();
    } catch (_) {
      try {
        return await response.json();
      } catch (_) {
        return null;
      }
    }
  }

  function mapThrown(error) {
    if (error instanceof ActivityConsumerDataAccessError) return error;
    const status = Number(error?.status ?? error?.response?.status);
    if (status === 401 || status === 403) {
      return failure('AUTH_REQUIRED', false, status);
    }
    if (error?.name === 'AbortError' || error?.code === 'ABORT_ERR') {
      return failure('REQUEST_ABORTED', false);
    }
    return failure(
      'REQUEST_FAILED',
      true,
      Number.isInteger(status) ? status : undefined
    );
  }

  function getDependencies() {
    const supabase = root.AppModules?.supabase || root.SupabaseAPI || {};
    const consumer = root.AppModules?.activityV2?.consumer;
    if (
      typeof supabase.fetchWithAuth !== 'function' ||
      typeof supabase.baseUrlFromRest !== 'function' ||
      typeof consumer?.validateRange !== 'function' ||
      typeof consumer?.validateSnapshot !== 'function' ||
      typeof root.fetch !== 'function' ||
      typeof root.URL !== 'function'
    ) {
      throw failure('API_UNAVAILABLE');
    }
    return { supabase, consumer };
  }

  async function resolveBaseUrl(supabase) {
    if (typeof root.getConf !== 'function') {
      throw failure('CONFIG_UNAVAILABLE');
    }
    try {
      const baseUrl = supabase.baseUrlFromRest(await root.getConf('webhookUrl'));
      if (!baseUrl) throw new TypeError('missing base URL');
      return baseUrl;
    } catch (error) {
      if (error instanceof ActivityConsumerDataAccessError) throw error;
      throw failure('CONFIG_UNAVAILABLE');
    }
  }

  async function loadSnapshot(rangeValue) {
    const { supabase, consumer } = getDependencies();
    const range = normalizeRange(rangeValue, consumer);
    const baseUrl = await resolveBaseUrl(supabase);

    let rpcUrl;
    let requestBody;
    try {
      rpcUrl = new root.URL(`${baseUrl}/rest/v1/rpc/${FUNCTION_NAME}`).toString();
      requestBody = JSON.stringify({ p_from: range.from, p_to: range.to });
    } catch (_) {
      throw failure('CONFIG_UNAVAILABLE');
    }

    let response;
    try {
      response = await supabase.fetchWithAuth(
        (headers) =>
          root.fetch(rpcUrl, {
            method: 'POST',
            headers: makeJsonHeaders(headers),
            body: requestBody
          }),
        {
          tag: `activity-v2:${FUNCTION_NAME}`,
          retry401: true,
          maxAttempts: 0
        }
      );
    } catch (error) {
      throw mapThrown(error);
    }

    const status = Number(response?.status);
    const ok = response?.ok === true || (status >= 200 && status < 300);
    if (!ok) {
      const token = extractSqlToken(await readProblem(response));
      if (status === 401 || status === 403) {
        throw failure('AUTH_REQUIRED', false, status);
      }
      if (token) {
        throw failure(SQL_TOKEN_CODES[token], false, status);
      }
      throw failure(
        'REQUEST_FAILED',
        status === 429 || status >= 500,
        Number.isInteger(status) ? status : undefined
      );
    }

    let value;
    try {
      value = await response.json();
    } catch (_) {
      throw failure('CONTRACT_INVALID', false, status);
    }

    try {
      const snapshot = consumer.validateSnapshot(value);
      if (snapshot.range.from !== range.from || snapshot.range.to !== range.to) {
        throw new TypeError('response range mismatch');
      }
      return snapshot;
    } catch (_) {
      throw failure('CONTRACT_INVALID', false, status);
    }
  }

  if (root.AppModules === undefined) {
    root.AppModules = {};
  } else if (!isPlainRecord(root.AppModules)) {
    throw new TypeError('AppModules must be an object');
  }
  if (root.AppModules.activityV2 === undefined) {
    root.AppModules.activityV2 = {};
  } else if (!isPlainRecord(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be an object');
  }
  if ('consumerDataAccess' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.consumerDataAccess is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  Object.freeze(loadSnapshot);
  Object.defineProperty(root.AppModules.activityV2, 'consumerDataAccess', {
    value: Object.freeze({ loadSnapshot }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);

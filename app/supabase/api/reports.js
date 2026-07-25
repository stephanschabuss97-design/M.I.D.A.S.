'use strict';
/**
 * MODULE: supabase/api/reports.js
 * Description: Wraps the midas-monthly-report Edge Function so the Doctor View can request manual reports.
 */

import { baseUrlFromRest } from '../core/client.js';
import { fetchWithAuth } from '../core/http.js';

const globalWindow = typeof window !== 'undefined' ? window : undefined;
const diag =
  (globalWindow?.diag ||
    globalWindow?.AppModules?.diag ||
    globalWindow?.AppModules?.diagnostics ||
    { add() {} });
const MAX_PUBLIC_ERROR_LENGTH = 200;

const readPublicErrorMessage = (raw) => {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.error === 'string'
      ? parsed.error.slice(0, MAX_PUBLIC_ERROR_LENGTH)
      : '';
  } catch (_) {
    return '';
  }
};

const getConf = (...args) => {
  const fn = globalWindow?.getConf;
  if (typeof fn !== 'function') {
    return Promise.reject(new Error('reports: getConf unavailable'));
  }
  try {
    return Promise.resolve(fn(...args));
  } catch (err) {
    return Promise.reject(err);
  }
};

const resolveFunctionsEndpoint = async (functionName) => {
  const restUrl = await getConf('webhookUrl');
  const base = baseUrlFromRest(restUrl);
  if (!base) {
    const err = new Error('reports: Supabase base URL missing');
    err.status = 0;
    throw err;
  }
  const safeName = String(functionName || '').replace(/^\/+/, '');
  return `${base}/functions/v1/${safeName}`;
};

export async function generateDoctorReportRemote({ from, to } = {}) {
  const endpoint = await resolveFunctionsEndpoint('midas-monthly-report');
  const body = {
    from,
    to,
    report_type: 'range_report'
  };
  const res = await fetchWithAuth(
    (headers) =>
      fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }),
    { tag: 'doctorReport:generate', maxAttempts: 1 }
  );
  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    const publicMessage = res.status < 500
      ? readPublicErrorMessage(raw)
      : '';
    diag.add?.(
      `[reports] doctor report failed ${res.status}`
        + (publicMessage ? ` ${publicMessage}` : '')
    );
    throw new Error(
      `doctor report failed (${res.status})`
        + (publicMessage ? `: ${publicMessage}` : '')
    );
  }
  const data = await res.json().catch(() => ({}));
  diag.add?.('[reports] doctor report generated');
  return data;
}

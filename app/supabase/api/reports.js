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

export async function generateMonthlyReportRemote({ from, to, month, report_type } = {}) {
  const endpoint = await resolveFunctionsEndpoint('midas-monthly-report');
  const body = {
    from: from || null,
    to: to || null,
    month: month || null,
    report_type: report_type || null
  };
  const res = await fetchWithAuth(
    (headers) =>
      fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }),
    { tag: 'monthlyReport:generate', maxAttempts: 1 }
  );
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    diag.add?.(`[reports] monthly report failed ${res.status} ${msg || ''}`);
    throw new Error(msg || `monthly report failed (${res.status})`);
  }
  const data = await res.json().catch(() => ({}));
  diag.add?.('[reports] monthly report generated');
  return data;
}

'use strict';
/**
 * MODULE: supabase/api/trendpilot.js
 * Description: Lies/aktualisiert Trendpilot-Events (warning/critical) aus der Trendpilot-Tabelle.
 */

import { baseUrlFromRest } from '../core/client.js';
import { fetchWithAuth } from '../core/http.js';
import { getUserId } from '../auth/core.js';
import { sbSelect } from './select.js';

const globalWindow = typeof window !== 'undefined' ? window : undefined;
const diag =
  (globalWindow?.diag ||
    globalWindow?.AppModules?.diag ||
    globalWindow?.AppModules?.diagnostics ||
    { add() {} });

const getConf = (...args) => {
  const fn = globalWindow?.getConf;
  if (typeof fn !== 'function') return Promise.resolve(null);
  try {
    return Promise.resolve(fn(...args));
  } catch (err) {
    return Promise.reject(err);
  }
};

const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const EVENTS_VIEW = 'trendpilot_events_range';
const EVENTS_TABLE = 'trendpilot_events';

const resolveRestEndpoint = async () => {
  const restUrl = await getConf('webhookUrl');
  const base = baseUrlFromRest(restUrl);
  if (!base) {
    const err = new Error('trendpilot: missing REST endpoint');
    err.status = 500;
    throw err;
  }
  return `${base}/rest/v1/${EVENTS_TABLE}`;
};

export async function fetchTrendpilotEventsRange({
  from,
  to,
  type,
  severity,
  limit,
  order = 'window_from.desc'
} = {}) {
  const userId = await getUserId();
  if (!userId) return [];
  const filters = [['user_id', `eq.${userId}`]];
  if (from && ISO_DAY_RE.test(from)) filters.push(['window_from', `gte.${from}`]);
  if (to && ISO_DAY_RE.test(to)) filters.push(['window_to', `lte.${to}`]);
  if (type) filters.push(['type', `eq.${type}`]);
  if (severity) filters.push(['severity', `eq.${severity}`]);

  const rows = await sbSelect({
    table: EVENTS_VIEW,
    select: 'id,user_id,ts,type,severity,ack,ack_at,source,window_from,window_to,payload,created_at',
    filters,
    order,
    ...(limit ? { limit: Number(limit) } : {})
  });
  return Array.isArray(rows) ? rows : [];
}

export async function setTrendpilotAck({ id, ack = true } = {}) {
  if (!id) throw new Error('trendpilot ack: id required');
  const endpoint = await resolveRestEndpoint();
  const ackValue = Boolean(ack);
  const ackAt = ackValue ? new Date().toISOString() : null;
  const url = `${endpoint}?id=eq.${encodeURIComponent(id)}`;
  const res = await fetchWithAuth(
    (headers) =>
      fetch(url, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ack: ackValue, ack_at: ackAt })
      }),
    { tag: 'trendpilot:ack', maxAttempts: 2 }
  );
  if (!res.ok) {
    let details = '';
    try {
      const errJson = await res.json();
      details = errJson?.message || errJson?.details || '';
    } catch (_) {
      /* ignore */
    }
    diag.add?.(`[trendpilot] ack failed ${res.status} ${details}`);
    throw new Error(`trendpilot ack failed ${res.status} ${details}`);
  }
  return { id, ack: ackValue, ack_at: ackAt };
}

export async function deleteTrendpilotEvent({ id } = {}) {
  if (!id) throw new Error('trendpilot delete: id required');
  const endpoint = await resolveRestEndpoint();
  const url = `${endpoint}?id=eq.${encodeURIComponent(id)}`;
  const res = await fetchWithAuth(
    (headers) =>
      fetch(url, {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' }
      }),
    { tag: 'trendpilot:delete', maxAttempts: 2 }
  );
  if (!res.ok) {
    let details = '';
    try {
      const errJson = await res.json();
      details = errJson?.message || errJson?.details || '';
    } catch (_) {
      /* ignore */
    }
    diag.add?.(`[trendpilot] delete failed ${res.status} ${details}`);
    throw new Error(`trendpilot delete failed ${res.status} ${details}`);
  }
  return { id };
}

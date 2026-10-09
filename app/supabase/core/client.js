'use strict';
/**
 * MODULE: supabase/core/client.js
 * Description: Initialisiert und verwaltet den Supabase-Client, prüft Konfiguration, sichert Auth-Setup und verhindert service_role Keys.
 * Submodules:
 *  - imports (State-Verwaltung)
 *  - constants & globals (globale Handles und Log-Objekt)
 *  - safe accessors (sichere Wrapper für window.getConf / setConfigStatus)
 *  - maskUid (PII-Schutz für User-IDs)
 *  - setSupabaseDebugPii (Debug-Flag für Logging sensibler Daten)
 *  - baseUrlFromRest (Extraktion der Basis-URL)
 *  - isServiceRoleKey (Validierung gegen verbotene Keys)
 *  - ensureSupabaseClient (Client-Erstellung mit Sicherheitsprüfungen)
 * Notes:
 *  - Hybrid-kompatibel (Browser/PWA/Node)
 *  - Verhindert versehentliche Initialisierung mit service_role Key
 *  - Version: 1.8.2 (System Integration Layer, M.I.D.A.S.)
 */

// SUBMODULE: imports @internal - Supabase State-Verwaltung
import { supabaseState, resetClientState } from './state.js?v=34';
import { normalizePublicKey } from './public-key.js?v=34';
export { normalizePublicKey } from './public-key.js?v=34';

// SUBMODULE: constants & globals @internal - globale Handles und Logging
const supabaseLog = { debugLogPii: false };
const globalWindow = typeof window !== 'undefined' ? window : undefined;
const diag =
  (globalWindow?.diag ||
    globalWindow?.AppModules?.diag ||
    globalWindow?.AppModules?.diagnostics ||
    { add() {} });

const isAndroidWebViewAuthContext = () =>
  typeof globalWindow?.MidasAndroidAuth?.getBootstrapState === 'function';

// SUBMODULE: safe accessors @internal - gesicherter Zugriff auf window.getConf / setConfigStatus
const getConfSafe = (...args) => {
  const fn = globalWindow?.getConf;
  if (typeof fn !== 'function') {
    diag.add?.('Supabase Client: window.getConf ist nicht verfügbar');
    return null;
  }
  return fn(...args);
};

const setConfigStatusSafe = (msg, tone = 'info') => {
  const supa = globalWindow?.AppModules?.supabase || null;
  const fn = supa?.setConfigStatus;
  if (typeof fn === 'function') {
    fn(msg, tone);
    return;
  }
  diag.add?.(`[config] ${tone}: ${msg}`);
};

// SUBMODULE: maskUid @public - schützt User-IDs vor vollständigem Logging
export function maskUid(uid) {
  if (!uid) return 'anon';
  const str = String(uid);
  if (supabaseLog.debugLogPii) return str;
  if (str.length <= 4) return str;
  const head = str.slice(0, 4);
  const tail = str.slice(-4);
  return `${head}-${tail}`;
}

// SUBMODULE: setSupabaseDebugPii @public - toggelt Logging sensibler Daten
export function setSupabaseDebugPii(enabled) {
  supabaseLog.debugLogPii = !!enabled;
}

// SUBMODULE: baseUrlFromRest @public - extrahiert Basis-URL aus REST-Endpunkt
export function baseUrlFromRest(restUrl) {
  try {
    const url = new URL(restUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
        !url.pathname.startsWith('/rest/v1/')) return null;
    return url.origin;
  } catch (_) { return null; }
}

// SUBMODULE: isServiceRoleKey @public - prüft JWT-Payload auf service_role
export function isServiceRoleKey(raw) {
  const tok = String(raw || '').trim().replace(/^Bearer\s+/i, '');
  try {
    const payload = JSON.parse(atob(tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload?.role === 'service_role';
  } catch {
    return false;
  }
}

// SUBMODULE: ensureSupabaseClient @public - erstellt oder cached den Supabase-Client
let inflightClientPromise = null;

const buildSupabaseAuthOptions = () => {
  if (isAndroidWebViewAuthContext()) {
    return {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    };
  }
  return {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  };
};

export function resetSupabaseClient() {
  inflightClientPromise = null;
  resetClientState();
}

export async function readSupabaseConfiguration() {
  if (globalWindow?.__midasAndroidNativeAuthOwner &&
      ['empty', 'invalid-config', 'error'].includes(globalWindow.__midasAndroidAuthBootstrapState?.status)) return null;
  const [rest, storedKey] = await Promise.all([getConfSafe('webhookUrl'), getConfSafe('webhookKey')]);
  const base = baseUrlFromRest(rest), key = normalizePublicKey(storedKey);
  return base && key ? { base, key, identity: JSON.stringify([base, key]) } : null;
}

export async function ensureSupabaseClient() {
  if (supabaseState.configChanging) return null;
  const initialGeneration = supabaseState.clientGeneration;
  const config = await readSupabaseConfiguration();
  if (supabaseState.configChanging || initialGeneration !== supabaseState.clientGeneration) return null;
  if (!config) {
    resetSupabaseClient();
    setConfigStatusSafe('Bitte einen gültigen Public-Key und REST-Endpoint speichern.', 'error');
    return null;
  }
  if (supabaseState.sbClient && supabaseState.clientIdentity === config.identity) return supabaseState.sbClient;
  if (supabaseState.clientIdentity !== config.identity) {
    resetSupabaseClient();
    supabaseState.clientIdentity = config.identity;
  }
  if (inflightClientPromise) return inflightClientPromise;
  const generation = supabaseState.clientGeneration;
  const loader = (async () => {
    const current = await readSupabaseConfiguration();
    if (supabaseState.configChanging || generation !== supabaseState.clientGeneration || current?.identity !== config.identity) return null;
    if (!globalWindow?.supabase || typeof globalWindow.supabase.createClient !== 'function') {
      setConfigStatusSafe('Supabase Client SDK fehlt.', 'error'); return null;
    }
    const client = globalWindow.supabase.createClient(config.base, config.key, { auth: buildSupabaseAuthOptions() });
    if (generation !== supabaseState.clientGeneration) return null;
    supabaseState.sbClient = client;
    diag.add?.('Supabase: Client (Auth) initialisiert');
    setConfigStatusSafe('', 'info');
    return client;
  })();
  inflightClientPromise = loader;
  try { return await loader; } finally { if (inflightClientPromise === loader) inflightClientPromise = null; }
}

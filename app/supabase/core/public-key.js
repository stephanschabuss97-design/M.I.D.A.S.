'use strict';
// Type checks only. The configured project and the backend verify credentials.
const JWT_PARTS = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
export function normalizePublicKey(value, { allowBearerPrefix = true } = {}) {
  if (typeof value !== 'string' || !value || value.trim() !== value) return null;
  const raw = allowBearerPrefix ? value.replace(/^Bearer /i, '') : value;
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(raw)) return raw;
  if (!JWT_PARTS.test(raw)) return null;
  try {
    const part = raw.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')));
    return claims && typeof claims === 'object' && claims.role === 'anon' ? raw : null;
  } catch (_) { return null; }
}
export function isUsableUser(user) {
  return !!user && user.is_anonymous === false && typeof user.id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id);
}
export function isUsableSession(session) {
  try {
    const part = session?.access_token?.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
    if (part) {
      const role = JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')))?.role;
      if (role === 'anon' || role === 'service_role') return false;
    }
  } catch (_) { /* Syntax is checked below; this is not JWT verification. */ }
  return isUsableUser(session?.user) && typeof session.access_token === 'string' &&
    JWT_PARTS.test(session.access_token) && !normalizePublicKey(session.access_token) &&
    typeof session.expires_at === 'number' && session.expires_at > Date.now() / 1000;
}

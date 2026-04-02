'use strict';
/**
 * MODULE: android-webview-auth-bridge.js
 * Description: Importiert in der Android-WebView fruehzeitig Konfiguration und native Session,
 *              damit AUTH_CHECK im MIDAS-Web-Boot auf einem konsistenten Zustand aufsetzt.
 * Notes:
 *  - Browser/PWA bleiben unberuehrt: ohne Android-Bridge no-op.
 *  - Fuer Android wird derselbe Supabase-/Boot-Vertrag genutzt, nur mit nativem Session-Owner.
 */

(function installAndroidWebViewAuthBootstrap(globalWindow) {
  if (!globalWindow) return;

  const bridge = globalWindow.MidasAndroidAuth;
  if (!bridge || typeof bridge.getBootstrapState !== 'function') {
    globalWindow.__midasAndroidAuthBootstrapPromise = Promise.resolve({ status: 'bridge-missing' });
    return;
  }

  const normalizeAnonKey = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
  };

  globalWindow.__midasAndroidAuthBootstrapPromise = (async () => {
    try {
      const rawPayload = bridge.getBootstrapState?.();
      if (!rawPayload) {
        return { status: 'empty' };
      }

      const payload = JSON.parse(String(rawPayload));
      const restUrl = String(payload?.restUrl || '').trim();
      const anonKey = normalizeAnonKey(payload?.anonKey);
      const accessToken = String(payload?.accessToken || '').trim();
      const refreshToken = String(payload?.refreshToken || '').trim();
      const userId = String(payload?.userId || '').trim();

      if (!restUrl || !anonKey) {
        return { status: 'invalid-config' };
      }

      if (typeof globalWindow.initDB === 'function') {
        await globalWindow.initDB();
      }
      if (typeof globalWindow.putConf === 'function') {
        await globalWindow.putConf('webhookUrl', restUrl);
        await globalWindow.putConf('webhookKey', anonKey);
      }

      const supa = globalWindow.AppModules?.supabase;
      const client = await supa?.ensureSupabaseClient?.();
      if (!client) {
        return { status: 'config-imported' };
      }

      if ((!accessToken || !refreshToken) && typeof client.auth?.signOut === 'function') {
        try {
          await client.auth.signOut();
        } catch (_) {
          // keep config import even if local signout is already clean
        }
        globalWindow.__midasAndroidAuthBootstrapState = {
          status: 'session-cleared',
          userId: '',
          importedAt: new Date().toISOString(),
        };
        return globalWindow.__midasAndroidAuthBootstrapState;
      }

      if (accessToken && refreshToken && typeof client.auth?.setSession === 'function') {
        const { error } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
      }

      globalWindow.__midasAndroidAuthBootstrapState = {
        status: accessToken && refreshToken ? 'session-imported' : 'config-imported',
        userId,
        importedAt: new Date().toISOString(),
      };
      return globalWindow.__midasAndroidAuthBootstrapState;
    } catch (error) {
      globalWindow.console?.warn?.(
        '[android-webview-auth] bootstrap failed',
        error?.message || error,
      );
      globalWindow.__midasAndroidAuthBootstrapState = {
        status: 'error',
        message: String(error?.message || error || 'android-bootstrap-failed'),
        importedAt: new Date().toISOString(),
      };
      return globalWindow.__midasAndroidAuthBootstrapState;
    }
  })();
})(typeof window !== 'undefined' ? window : undefined);

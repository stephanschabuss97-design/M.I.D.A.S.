'use strict';
/**
 * MODULE: android-webview-auth-bridge.js
 * Description: Importiert in der Android-WebView fruehzeitig Konfiguration und staged native Session-Daten,
 *              damit AUTH_CHECK im MIDAS-Web-Boot den Auth-Import selbst kontrolliert ausfuehren kann.
 * Notes:
 *  - Browser/PWA bleiben unberuehrt: ohne Android-Bridge no-op.
 *  - Fuer Android wird derselbe Supabase-/Boot-Vertrag genutzt, nur mit nativem Session-Owner.
 *  - Der Bootstrap mutiert den Web-Auth-Zustand bewusst nicht mehr selbst.
 */

(function installAndroidWebViewAuthBootstrap(globalWindow) {
  if (!globalWindow) return;

  const bridge = globalWindow.MidasAndroidAuth;
  globalWindow.__midasAndroidNativeAuthOwner = !!bridge;
  if (!bridge || typeof bridge.getBootstrapState !== 'function') {
    globalWindow.__midasAndroidAuthBootstrapPromise = Promise.resolve({ status: 'bridge-missing' });
    return;
  }

  const normalizeAnonKey = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
  };

  const readBootstrapState = async () => {
    try {
      const rawPayload = bridge.getBootstrapState?.();
      if (!rawPayload) {
        globalWindow.__midasAndroidAuthBootstrapState = { status: 'empty' };
        return globalWindow.__midasAndroidAuthBootstrapState;
      }

      const payload = JSON.parse(String(rawPayload));
      const restUrl = String(payload?.restUrl || '').trim();
      const supabaseUrl = String(payload?.supabaseUrl || '').trim();
      const anonKey = normalizeAnonKey(payload?.anonKey);
      const accessToken = String(payload?.accessToken || '').trim();
      const refreshToken = String(payload?.refreshToken || '').trim();
      const userId = String(payload?.userId || '').trim();
      const updatedAt = String(payload?.updatedAt || '').trim();
      const sessionGeneration = Number(payload?.sessionGeneration || 0) || 0;
      const configSource = String(payload?.configSource || '').trim();

      if (!restUrl || !anonKey) {
        globalWindow.__midasAndroidAuthBootstrapState = { status: 'invalid-config' };
        return globalWindow.__midasAndroidAuthBootstrapState;
      }

      if (typeof globalWindow.initDB === 'function') {
        await globalWindow.initDB();
      }
      if (typeof globalWindow.putConf === 'function') {
        await globalWindow.putConf('webhookUrl', restUrl);
        await globalWindow.putConf('webhookKey', anonKey);
      }

      globalWindow.__midasAndroidAuthBootstrapState = {
        status: accessToken && refreshToken ? 'session-staged' : 'session-absent',
        restUrl,
        supabaseUrl,
        anonKey,
        accessToken,
        refreshToken,
        userId,
        updatedAt,
        sessionGeneration,
        configSource,
        stagedAt: new Date().toISOString(),
        applied: false,
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
  };

  globalWindow.__midasAndroidRefreshBootstrapState = readBootstrapState;
  globalWindow.__midasAndroidAuthBootstrapPromise = readBootstrapState();
})(typeof window !== 'undefined' ? window : undefined);

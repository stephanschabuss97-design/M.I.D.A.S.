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

  let activeRead = null;
  const performBootstrapRead = async () => {
    let configState = null;
    try {
      const rawPayload = bridge.getBootstrapState?.();
      if (!rawPayload) {
        globalWindow.__midasAndroidAuthBootstrapState = { status: 'empty' };
        return globalWindow.__midasAndroidAuthBootstrapState;
      }

      const payload = JSON.parse(String(rawPayload));
      const restUrl = String(payload?.restUrl || '').trim();
      const supabaseUrl = String(payload?.supabaseUrl || '').trim();
      const { normalizePublicKey } = await import(new URL('app/supabase/core/public-key.js?v=34', globalWindow.document.baseURI).href);
      const { supabaseState } = await import(new URL('app/supabase/core/state.js?v=34', globalWindow.document.baseURI).href);
      const { resetSupabaseClient, baseUrlFromRest } = await import(new URL('app/supabase/core/client.js?v=34', globalWindow.document.baseURI).href);
      const anonKey = normalizePublicKey(payload?.anonKey);
      const accessToken = String(payload?.accessToken || '').trim();
      const refreshToken = String(payload?.refreshToken || '').trim();
      const userId = String(payload?.userId || '').trim();
      const updatedAt = String(payload?.updatedAt || '').trim();
      const sessionGeneration = Number(payload?.sessionGeneration || 0) || 0;
      const configSource = String(payload?.configSource || '').trim();

      if (!baseUrlFromRest(restUrl) || !anonKey) {
        resetSupabaseClient();
        globalWindow.__midasAndroidAuthBootstrapState = { status: 'invalid-config' };
        return globalWindow.__midasAndroidAuthBootstrapState;
      }

      configState = supabaseState;
      configState.configChanging = true;
      if (typeof globalWindow.initDB === 'function') {
        await globalWindow.initDB();
      }
      if (typeof globalWindow.putConf === 'function') {
        const existingRest = await globalWindow.getConf?.('webhookUrl');
        const existingKey = normalizePublicKey(await globalWindow.getConf?.('webhookKey'));
        if (existingRest !== restUrl || existingKey !== anonKey) resetSupabaseClient();
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
        'bootstrap-unavailable',
      );
      globalWindow.__midasAndroidAuthBootstrapState = {
        status: 'error',
        message: 'android-bootstrap-failed',
        importedAt: new Date().toISOString(),
      };
      return globalWindow.__midasAndroidAuthBootstrapState;
    } finally {
      if (configState) configState.configChanging = false;
    }
  };
  const readBootstrapState = () => {
    if (activeRead) return activeRead;
    activeRead = performBootstrapRead().finally(() => { activeRead = null; });
    return activeRead;
  };

  globalWindow.__midasAndroidRefreshBootstrapState = readBootstrapState;
  globalWindow.__midasAndroidAuthBootstrapPromise = readBootstrapState();
})(typeof window !== 'undefined' ? window : undefined);

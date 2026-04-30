/**
 * MODULE: push/index.js
 * Description: Browser Push service boundary, context detection and routing health.
 */
(function initPushModule(global) {
  'use strict';

  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  const diag = appModules.diag || global.diag || null;
  const log = (msg) => diag?.add?.(`[push] ${msg}`);

  const CLIENT_CONTEXT = Object.freeze({
    ANDROID_WEBVIEW: 'android-webview',
    PWA_STANDALONE: 'pwa-standalone',
    BROWSER: 'browser',
    UNKNOWN: 'unknown',
  });

  const DISPLAY_MODE = Object.freeze({
    WEBVIEW: 'webview',
    STANDALONE: 'standalone',
    BROWSER: 'browser',
    UNKNOWN: 'unknown',
  });

  const VAPID_PUBLIC_KEY =
    global?.VAPID_PUBLIC_KEY ||
    'BCUnF1w9VYIKZ9KPnEx_TNjpiwVuqGY7CZE2oEijz72tjGUORqZQdcJ_CR7nI-rIxkzHiyjOgsxUwZhbIVP6Bxw';

  const state = {
    pushSyncing: false,
    pushRouting: {
      hasBrowserSubscription: false,
      endpoint: '',
      remoteHealthy: false,
      localSuppressionAllowed: false,
      permission: '',
      hasRemoteSubscription: false,
      remoteDisabled: false,
      lastRemoteSuccessAt: '',
      lastRemoteFailureAt: '',
      lastRemoteFailureReason: '',
      consecutiveRemoteFailures: 0,
      endpointHash: '',
      clientContext: '',
      clientDisplayMode: '',
      clientPlatform: '',
      clientBrowser: '',
      clientLabel: '',
      lastDiagnosticAttemptAt: '',
      lastDiagnosticSuccessAt: '',
      lastDiagnosticFailureAt: '',
      lastDiagnosticFailureReason: '',
      healthRefreshError: '',
      checkedAt: '',
    },
  };

  const normalizeToken = (value, fallback = 'unknown') => {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return fallback;
    return text.replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || fallback;
  };

  const getNavigator = () => global.navigator || {};

  const getUserAgent = () => {
    try {
      return String(getNavigator().userAgent || '');
    } catch (_) {
      return '';
    }
  };

  const hasNativeAndroidBridge = () => {
    try {
      return !!(global.MidasAndroidAuth || global.MidasAndroidWidget);
    } catch (_) {
      return false;
    }
  };

  const isLikelyAndroidWebViewUa = (ua) => {
    const text = String(ua || '');
    return /; wv\)/i.test(text) || /\bVersion\/\d+(?:\.\d+)?\b.*\bChrome\/\d+/i.test(text);
  };

  const isStandaloneDisplay = () => {
    try {
      if (global.matchMedia?.('(display-mode: standalone)')?.matches) return true;
      if (global.matchMedia?.('(display-mode: fullscreen)')?.matches) return true;
      if (global.navigator?.standalone === true) return true;
    } catch (_) {
      return false;
    }
    return false;
  };

  const detectPlatform = (ua) => {
    const nav = getNavigator();
    const platform = normalizeToken(nav.userAgentData?.platform || nav.platform || '');
    if (platform && platform !== 'unknown') {
      if (platform.includes('android')) return 'android';
      if (platform.includes('win')) return 'windows';
      if (platform.includes('mac')) return 'macos';
      if (platform.includes('iphone') || platform.includes('ipad') || platform.includes('ios')) return 'ios';
      if (platform.includes('linux')) return 'linux';
    }
    const text = String(ua || '');
    if (/Android/i.test(text)) return 'android';
    if (/Windows/i.test(text)) return 'windows';
    if (/(iPhone|iPad|iPod)/i.test(text)) return 'ios';
    if (/Mac OS X/i.test(text)) return 'macos';
    if (/Linux/i.test(text)) return 'linux';
    return 'unknown';
  };

  const detectBrowser = (ua, { androidWebView = false } = {}) => {
    const text = String(ua || '');
    if (androidWebView) return 'webview';
    if (/Edg\//i.test(text)) return 'edge';
    if (/SamsungBrowser\//i.test(text)) return 'samsung-browser';
    if (/Firefox\//i.test(text) || /FxiOS\//i.test(text)) return 'firefox';
    if (/CriOS\//i.test(text) || /Chrome\//i.test(text)) return 'chrome';
    if (/Safari\//i.test(text) && /Version\//i.test(text)) return 'safari';
    return 'unknown';
  };

  const detectPushSupport = () => {
    try {
      return !!(
        global.navigator
        && 'serviceWorker' in global.navigator
        && 'PushManager' in global
        && 'Notification' in global
      );
    } catch (_) {
      return false;
    }
  };

  const detectContext = () => {
    const ua = getUserAgent();
    const hasBridge = hasNativeAndroidBridge();
    const androidWebView = hasBridge || isLikelyAndroidWebViewUa(ua);
    const standalone = isStandaloneDisplay();
    const pushSupported = detectPushSupport();
    const platform = detectPlatform(ua);
    const browser = detectBrowser(ua, { androidWebView });
    const displayMode = androidWebView
      ? DISPLAY_MODE.WEBVIEW
      : standalone
        ? DISPLAY_MODE.STANDALONE
        : global.navigator
          ? DISPLAY_MODE.BROWSER
          : DISPLAY_MODE.UNKNOWN;
    const clientContext = androidWebView
      ? CLIENT_CONTEXT.ANDROID_WEBVIEW
      : standalone
        ? CLIENT_CONTEXT.PWA_STANDALONE
        : global.navigator
          ? CLIENT_CONTEXT.BROWSER
          : CLIENT_CONTEXT.UNKNOWN;

    return Object.freeze({
      clientContext,
      displayMode,
      platform,
      browser,
      hasNativeAndroidBridge: hasBridge,
      isAndroidWebView: androidWebView,
      isStandalone: standalone,
      pushSupported,
      recommendedForReminderPush: pushSupported && !androidWebView,
      checkedAt: new Date().toISOString(),
    });
  };

  const buildClientLabel = (context) => {
    const parts = [
      context?.platform || 'unknown',
      context?.browser || 'unknown',
      context?.displayMode || 'unknown',
    ].filter(Boolean);
    return parts.join(' / ');
  };

  const toSubscriptionMetadata = (context = detectContext()) => ({
    client_context: context.clientContext || CLIENT_CONTEXT.UNKNOWN,
    client_display_mode: context.displayMode || DISPLAY_MODE.UNKNOWN,
    client_platform: context.platform || 'unknown',
    client_browser: context.browser || 'unknown',
    client_label: buildClientLabel(context),
  });

  const toHex = (buffer) => Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const hashTextSha256 = async (value) => {
    const text = String(value || '');
    if (!text || !global.crypto?.subtle || !global.TextEncoder) return '';
    const encoded = new global.TextEncoder().encode(text);
    const digest = await global.crypto.subtle.digest('SHA-256', encoded);
    return toHex(digest);
  };

  const createEndpointHash = async (endpoint) => hashTextSha256(endpoint);

  const getSubscriptionEndpoint = (subscription) => {
    if (!subscription) return '';
    if (subscription.endpoint) return String(subscription.endpoint);
    try {
      return String(subscription.toJSON?.().endpoint || '');
    } catch (_) {
      return '';
    }
  };

  const buildSubscriptionMetadata = async ({ subscription = null, context = detectContext() } = {}) => {
    const endpoint = getSubscriptionEndpoint(subscription);
    const metadata = toSubscriptionMetadata(context);
    const endpointHash = await createEndpointHash(endpoint);
    return endpointHash
      ? Object.assign({ endpoint_hash: endpointHash }, metadata)
      : metadata;
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = global.atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      output[i] = raw.charCodeAt(i);
    }
    return output;
  };

  const getSupabaseApi = () => appModules.supabase || {};

  const requireSupabaseClient = async () => {
    const api = getSupabaseApi();
    const ensure = api?.ensureSupabaseClient;
    if (typeof ensure !== 'function') {
      throw new Error('Supabase-Konfiguration fehlt');
    }
    const client = await ensure();
    if (!client) throw new Error('Supabase Client nicht verfuegbar');
    return client;
  };

  const requireUserId = async () => {
    const api = getSupabaseApi();
    const getUid = api?.getUserId;
    if (typeof getUid !== 'function') throw new Error('Supabase User fehlt');
    const uid = await getUid();
    if (!uid) throw new Error('Supabase User nicht angemeldet');
    return uid;
  };

  const ensurePushSupport = () => {
    if (!global.navigator || !('serviceWorker' in global.navigator)) {
      throw new Error('Service Worker nicht verfuegbar');
    }
    if (!('PushManager' in global)) {
      throw new Error('Push wird nicht unterstuetzt');
    }
    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID Public Key fehlt');
    }
  };

  const getPushRegistration = async () => {
    ensurePushSupport();
    const registration = await global.navigator.serviceWorker.ready;
    if (!registration) throw new Error('Service Worker nicht bereit');
    return registration;
  };

  const getCurrentSubscription = async () => {
    const registration = await getPushRegistration();
    return registration.pushManager.getSubscription();
  };

  const clonePushRoutingState = () => {
    const context = detectContext();
    return {
      hasBrowserSubscription: !!state.pushRouting?.hasBrowserSubscription,
      endpoint: String(state.pushRouting?.endpoint || ''),
      remoteHealthy: !!state.pushRouting?.remoteHealthy,
      localSuppressionAllowed: !!state.pushRouting?.localSuppressionAllowed,
      permission: String(state.pushRouting?.permission || global.Notification?.permission || ''),
      hasRemoteSubscription: !!state.pushRouting?.hasRemoteSubscription,
      remoteDisabled: !!state.pushRouting?.remoteDisabled,
      lastRemoteSuccessAt: String(state.pushRouting?.lastRemoteSuccessAt || ''),
      lastRemoteFailureAt: String(state.pushRouting?.lastRemoteFailureAt || ''),
      lastRemoteFailureReason: String(state.pushRouting?.lastRemoteFailureReason || ''),
      consecutiveRemoteFailures: Number(state.pushRouting?.consecutiveRemoteFailures || 0),
      endpointHash: String(state.pushRouting?.endpointHash || ''),
      clientContext: String(state.pushRouting?.clientContext || context.clientContext || ''),
      clientDisplayMode: String(state.pushRouting?.clientDisplayMode || context.displayMode || ''),
      clientPlatform: String(state.pushRouting?.clientPlatform || context.platform || ''),
      clientBrowser: String(state.pushRouting?.clientBrowser || context.browser || ''),
      clientLabel: String(state.pushRouting?.clientLabel || buildClientLabel(context)),
      lastDiagnosticAttemptAt: String(state.pushRouting?.lastDiagnosticAttemptAt || ''),
      lastDiagnosticSuccessAt: String(state.pushRouting?.lastDiagnosticSuccessAt || ''),
      lastDiagnosticFailureAt: String(state.pushRouting?.lastDiagnosticFailureAt || ''),
      lastDiagnosticFailureReason: String(state.pushRouting?.lastDiagnosticFailureReason || ''),
      healthRefreshError: String(state.pushRouting?.healthRefreshError || ''),
      checkedAt: String(state.pushRouting?.checkedAt || ''),
      context,
      subscriptionMetadata: toSubscriptionMetadata(context),
    };
  };

  const setPushRoutingState = (nextState = {}) => {
    const context = detectContext();
    state.pushRouting = {
      hasBrowserSubscription: !!nextState.hasBrowserSubscription,
      endpoint: String(nextState.endpoint || ''),
      remoteHealthy: !!nextState.remoteHealthy,
      localSuppressionAllowed: !!nextState.localSuppressionAllowed,
      permission: String(nextState.permission || global.Notification?.permission || ''),
      hasRemoteSubscription: !!nextState.hasRemoteSubscription,
      remoteDisabled: !!nextState.remoteDisabled,
      lastRemoteSuccessAt: String(nextState.lastRemoteSuccessAt || ''),
      lastRemoteFailureAt: String(nextState.lastRemoteFailureAt || ''),
      lastRemoteFailureReason: String(nextState.lastRemoteFailureReason || ''),
      consecutiveRemoteFailures: Number(nextState.consecutiveRemoteFailures || 0),
      endpointHash: String(nextState.endpointHash || ''),
      clientContext: String(nextState.clientContext || context.clientContext || ''),
      clientDisplayMode: String(nextState.clientDisplayMode || context.displayMode || ''),
      clientPlatform: String(nextState.clientPlatform || context.platform || ''),
      clientBrowser: String(nextState.clientBrowser || context.browser || ''),
      clientLabel: String(nextState.clientLabel || buildClientLabel(context)),
      lastDiagnosticAttemptAt: String(nextState.lastDiagnosticAttemptAt || ''),
      lastDiagnosticSuccessAt: String(nextState.lastDiagnosticSuccessAt || ''),
      lastDiagnosticFailureAt: String(nextState.lastDiagnosticFailureAt || ''),
      lastDiagnosticFailureReason: String(nextState.lastDiagnosticFailureReason || ''),
      healthRefreshError: String(nextState.healthRefreshError || ''),
      checkedAt: new Date().toISOString(),
    };
  };

  const isPushMetadataSchemaError = (err) => {
    const text = `${err?.code || ''} ${err?.message || ''} ${err?.details || ''}`.toLowerCase();
    if (!text) return false;
    return text.includes('endpoint_hash')
      || text.includes('client_context')
      || text.includes('client_display_mode')
      || text.includes('client_platform')
      || text.includes('client_browser')
      || text.includes('client_label')
      || text.includes('last_diagnostic_attempt_at')
      || text.includes('last_diagnostic_success_at')
      || text.includes('last_diagnostic_failure_at')
      || text.includes('last_diagnostic_failure_reason');
  };

  const upsertSubscription = async ({ userId, subscription }) => {
    const client = await requireSupabaseClient();
    const json = subscription?.toJSON?.() || {};
    const keys = json.keys || {};
    const basePayload = {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh || null,
      auth: keys.auth || null,
      subscription: json,
      disabled: false,
    };
    const metadata = await buildSubscriptionMetadata({ subscription });
    const payload = Object.assign({}, basePayload, metadata);
    const result = await client
      .from('push_subscriptions')
      .upsert(payload, { onConflict: 'user_id,endpoint' });
    if (!result.error) return;
    if (isPushMetadataSchemaError(result.error) && Object.keys(metadata).length) {
      log?.('metadata columns missing, retrying base subscription upsert');
      const fallback = await client
        .from('push_subscriptions')
        .upsert(basePayload, { onConflict: 'user_id,endpoint' });
      if (fallback.error) throw fallback.error;
      return;
    }
    throw result.error;
  };

  const deleteSubscription = async ({ userId, endpoint }) => {
    const client = await requireSupabaseClient();
    const { error } = await client
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);
    if (error) throw error;
  };

  const fetchRemoteSubscriptionHealth = async ({ userId, endpoint }) => {
    if (!userId || !endpoint) return null;
    const client = await requireSupabaseClient();
    const { data, error } = await client
      .from('push_subscriptions')
      .select('endpoint, disabled, last_remote_success_at, last_remote_failure_at, last_remote_failure_reason, consecutive_remote_failures, endpoint_hash, client_context, client_display_mode, client_platform, client_browser, client_label, last_diagnostic_attempt_at, last_diagnostic_success_at, last_diagnostic_failure_at, last_diagnostic_failure_reason')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  };

  const isRemoteSubscriptionHealthy = (row) => {
    if (!row || row.disabled) return false;
    const successMs = Date.parse(row.last_remote_success_at || '');
    if (!Number.isFinite(successMs)) return false;
    const failureMs = Date.parse(row.last_remote_failure_at || '');
    if (Number.isFinite(failureMs) && failureMs > successMs) return false;
    return Number(row.consecutive_remote_failures || 0) <= 0;
  };

  const isRemoteSubscriptionAwaitingFirstDelivery = (row) => {
    if (!row || row.disabled) return false;
    const successMs = Date.parse(row.last_remote_success_at || '');
    const failureMs = Date.parse(row.last_remote_failure_at || '');
    return !Number.isFinite(successMs)
      && !Number.isFinite(failureMs)
      && Number(row.consecutive_remote_failures || 0) <= 0;
  };

  const setUnavailableRoutingState = (err) => {
    setPushRoutingState({
      hasBrowserSubscription: false,
      permission: String(global.Notification?.permission || ''),
      healthRefreshError: err?.message || String(err || ''),
    });
  };

  const refreshPushStatus = async ({ reason = 'refresh' } = {}) => {
    try {
      ensurePushSupport();
      const permission = global.Notification?.permission || 'default';
      if (permission === 'denied') {
        setPushRoutingState({
          hasBrowserSubscription: false,
          permission,
          healthRefreshError: '',
        });
        return clonePushRoutingState();
      }
      const subscription = await getCurrentSubscription();
      if (!subscription) {
        setPushRoutingState({
          hasBrowserSubscription: false,
          permission,
          healthRefreshError: '',
        });
        return clonePushRoutingState();
      }

      let remoteRow = null;
      let healthRefreshError = '';
      try {
        const userId = await requireUserId();
        remoteRow = await fetchRemoteSubscriptionHealth({
          userId,
          endpoint: subscription.endpoint,
        });
      } catch (err) {
        healthRefreshError = err?.message || String(err);
        log?.(`health refresh skipped (${reason}) ${err?.message || err}`);
      }

      const remoteHealthy = isRemoteSubscriptionHealthy(remoteRow);
      const awaitingFirstDelivery = isRemoteSubscriptionAwaitingFirstDelivery(remoteRow);
      const hasRemoteSubscription = !!remoteRow;
      const metadata = await buildSubscriptionMetadata({ subscription });
      setPushRoutingState({
        hasBrowserSubscription: true,
        endpoint: subscription.endpoint,
        remoteHealthy,
        localSuppressionAllowed: remoteHealthy,
        permission,
        hasRemoteSubscription,
        remoteDisabled: !!remoteRow?.disabled,
        lastRemoteSuccessAt: remoteRow?.last_remote_success_at || '',
        lastRemoteFailureAt: remoteRow?.last_remote_failure_at || '',
        lastRemoteFailureReason: remoteRow?.last_remote_failure_reason || '',
        consecutiveRemoteFailures: Number(remoteRow?.consecutive_remote_failures || 0),
        endpointHash: remoteRow?.endpoint_hash || metadata.endpoint_hash || '',
        clientContext: remoteRow?.client_context || metadata.client_context || '',
        clientDisplayMode: remoteRow?.client_display_mode || metadata.client_display_mode || '',
        clientPlatform: remoteRow?.client_platform || metadata.client_platform || '',
        clientBrowser: remoteRow?.client_browser || metadata.client_browser || '',
        clientLabel: remoteRow?.client_label || metadata.client_label || '',
        lastDiagnosticAttemptAt: remoteRow?.last_diagnostic_attempt_at || '',
        lastDiagnosticSuccessAt: remoteRow?.last_diagnostic_success_at || '',
        lastDiagnosticFailureAt: remoteRow?.last_diagnostic_failure_at || '',
        lastDiagnosticFailureReason: remoteRow?.last_diagnostic_failure_reason || '',
        healthRefreshError,
      });
      if (awaitingFirstDelivery) {
        log?.(`remote health pending first delivery (${reason})`);
      }
      return clonePushRoutingState();
    } catch (err) {
      setUnavailableRoutingState(err);
      return clonePushRoutingState();
    }
  };

  const isPushEnabled = async () => {
    try {
      ensurePushSupport();
      const subscription = await getCurrentSubscription();
      return !!subscription;
    } catch (_) {
      return false;
    }
  };

  const enablePush = async () => {
    if (state.pushSyncing) return clonePushRoutingState();
    state.pushSyncing = true;
    try {
      ensurePushSupport();
      if (global.Notification?.permission === 'denied') {
        throw new Error('Push ist im Browser blockiert');
      }
      if (global.Notification?.permission !== 'granted') {
        const perm = await global.Notification?.requestPermission?.();
        if (perm !== 'granted') {
          throw new Error('Push-Berechtigung verweigert');
        }
      }
      const registration = await getPushRegistration();
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
      }
      const userId = await requireUserId();
      await upsertSubscription({ userId, subscription });
      const routing = await refreshPushStatus({ reason: 'enable-push' });
      log?.('subscription aktiv');
      return routing;
    } catch (err) {
      log?.(`enable failed ${err?.message || err}`);
      setUnavailableRoutingState(err);
      return clonePushRoutingState();
    } finally {
      state.pushSyncing = false;
    }
  };

  const disablePush = async () => {
    if (state.pushSyncing) return clonePushRoutingState();
    state.pushSyncing = true;
    try {
      ensurePushSupport();
      const subscription = await getCurrentSubscription();
      if (!subscription) {
        setPushRoutingState({
          hasBrowserSubscription: false,
          permission: global.Notification?.permission || 'default',
        });
        return clonePushRoutingState();
      }
      const userId = await requireUserId();
      await deleteSubscription({ userId, endpoint: subscription.endpoint });
      await subscription.unsubscribe();
      const routing = await refreshPushStatus({ reason: 'disable-push' });
      log?.('subscription deaktiviert');
      return routing;
    } catch (err) {
      log?.(`disable failed ${err?.message || err}`);
      setUnavailableRoutingState(err);
      return clonePushRoutingState();
    } finally {
      state.pushSyncing = false;
    }
  };

  const getPushRoutingStatus = () => clonePushRoutingState();

  const shouldSuppressLocalPushes = () => !!state.pushRouting?.localSuppressionAllowed;

  const hasOperationalPushApi = () => true;

  const api = {
    CLIENT_CONTEXT,
    DISPLAY_MODE,
    detectContext,
    getContext: detectContext,
    toSubscriptionMetadata,
    buildSubscriptionMetadata,
    createEndpointHash,
    buildClientLabel,
    hasOperationalPushApi,
    enablePush,
    disablePush,
    isPushEnabled,
    refreshPushStatus,
    getPushRoutingStatus,
    shouldSuppressLocalPushes,
  };

  appModules.push = Object.assign(appModules.push || {}, api);
})(window);

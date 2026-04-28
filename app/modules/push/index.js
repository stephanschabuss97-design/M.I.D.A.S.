/**
 * MODULE: push/index.js
 * Description: Push context helpers and temporary push-service boundary.
 */
(function initPushModule(global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;

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

  const getLegacyProfilePushApi = () => {
    const profile = appModules.profile || null;
    if (
      !profile
      || typeof profile.enablePush !== 'function'
      || typeof profile.disablePush !== 'function'
      || typeof profile.isPushEnabled !== 'function'
      || typeof profile.refreshPushStatus !== 'function'
      || typeof profile.getPushRoutingStatus !== 'function'
      || typeof profile.shouldSuppressLocalPushes !== 'function'
    ) {
      return null;
    }
    return profile;
  };

  const buildUnavailableRoutingStatus = () => ({
    hasBrowserSubscription: false,
    endpoint: '',
    remoteHealthy: false,
    localSuppressionAllowed: false,
    permission: String(global.Notification?.permission || ''),
    hasRemoteSubscription: false,
    remoteDisabled: false,
    lastRemoteSuccessAt: '',
    lastRemoteFailureAt: '',
    lastRemoteFailureReason: '',
    consecutiveRemoteFailures: 0,
    healthRefreshError: '',
    checkedAt: new Date().toISOString(),
  });

  const withContext = (routing = {}) => {
    const context = detectContext();
    return Object.assign({}, routing, {
      context,
      subscriptionMetadata: toSubscriptionMetadata(context),
    });
  };

  const requireOperationalPushApi = () => {
    const legacyApi = getLegacyProfilePushApi();
    if (!legacyApi) {
      throw new Error('Push-Service noch nicht bereit');
    }
    return legacyApi;
  };

  const enablePush = async () => requireOperationalPushApi().enablePush();

  const disablePush = async () => requireOperationalPushApi().disablePush();

  const isPushEnabled = async () => {
    const legacyApi = getLegacyProfilePushApi();
    if (!legacyApi) return false;
    return !!(await legacyApi.isPushEnabled());
  };

  const refreshPushStatus = async (options = {}) => {
    const legacyApi = getLegacyProfilePushApi();
    if (!legacyApi) return withContext(buildUnavailableRoutingStatus());
    await legacyApi.refreshPushStatus(options);
    return withContext(legacyApi.getPushRoutingStatus());
  };

  const getPushRoutingStatus = () => {
    const legacyApi = getLegacyProfilePushApi();
    if (!legacyApi) return withContext(buildUnavailableRoutingStatus());
    return withContext(legacyApi.getPushRoutingStatus());
  };

  const shouldSuppressLocalPushes = () => {
    const legacyApi = getLegacyProfilePushApi();
    if (!legacyApi) return false;
    return !!legacyApi.shouldSuppressLocalPushes();
  };

  const hasOperationalPushApi = () => !!getLegacyProfilePushApi();

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

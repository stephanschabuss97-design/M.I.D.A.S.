package de.schabuss.midas.web

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import de.schabuss.midas.R
import de.schabuss.midas.auth.AndroidAuthContract
import de.schabuss.midas.auth.NativeSessionController
import de.schabuss.midas.auth.NativeOAuthStartResult
import de.schabuss.midas.auth.NativeOAuthStarter
import de.schabuss.midas.databinding.ActivityMidasWebBinding
import de.schabuss.midas.diag.AndroidBootTrace
import de.schabuss.midas.widget.WidgetSyncBridge
import kotlinx.coroutines.launch
import java.lang.ref.WeakReference

class MidasWebActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMidasWebBinding
    private lateinit var widgetSyncBridge: WidgetSyncBridge
    private lateinit var nativeWebViewAuthBridge: NativeWebViewAuthBridge
    private val midasBaseUri: Uri by lazy { Uri.parse(getString(R.string.midas_url)) }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMidasWebBinding.inflate(layoutInflater)
        setContentView(binding.root)
        AndroidBootTrace.log(applicationContext, "MidasWebActivity.onCreate", "start")
        widgetSyncBridge = WidgetSyncBridge(applicationContext)
        nativeWebViewAuthBridge = NativeWebViewAuthBridge(applicationContext) {
            runOnUiThread { startNativeGoogleLoginFromWebView() }
        }
        currentActivityRef = WeakReference(this)

        binding.webToolbarBack.setOnClickListener { onBackPressedDispatcher.onBackPressed() }
        binding.webToolbarRefresh.setOnClickListener { binding.webView.reload() }
        binding.webToolbarLogout.setOnClickListener {
            NativeSessionController.clearSessionState(applicationContext)
            forceLogoutAndReloadFromAndroid()
        }

        binding.webView.apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.loadsImagesAutomatically = true
            addJavascriptInterface(widgetSyncBridge, "MidasAndroidWidget")
            addJavascriptInterface(nativeWebViewAuthBridge, "MidasAndroidAuth")
            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    binding.webProgress.visibility = if (newProgress >= 100) View.GONE else View.VISIBLE
                    binding.webProgress.progress = newProgress
                }
            }
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val targetUri = request?.url ?: return false
                    if (isAllowedMidasUri(targetUri)) return false
                    startActivity(Intent(Intent.ACTION_VIEW, targetUri))
                    return true
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    AndroidBootTrace.log(applicationContext, "MidasWebActivity.onPageFinished", url ?: "no-url")
                    injectWidgetSyncBridge(view)
                }
            }
        }

        if (savedInstanceState == null) {
            binding.webView.loadUrl(getString(de.schabuss.midas.R.string.midas_url))
        } else {
            binding.webView.restoreState(savedInstanceState)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        binding.webView.saveState(outState)
    }

    override fun onDestroy() {
        binding.webView.removeJavascriptInterface("MidasAndroidWidget")
        binding.webView.removeJavascriptInterface("MidasAndroidAuth")
        binding.webView.destroy()
        if (currentActivityRef?.get() === this) {
            currentActivityRef = null
        }
        super.onDestroy()
    }

    private fun injectWidgetSyncBridge(webView: WebView?) {
        webView?.evaluateJavascript(WIDGET_SYNC_SCRIPT, null)
    }

    private fun isAllowedMidasUri(uri: Uri): Boolean {
        val targetScheme = uri.scheme?.lowercase() ?: return false
        val targetHost = uri.host?.lowercase() ?: return false
        val baseScheme = midasBaseUri.scheme?.lowercase() ?: return false
        val baseHost = midasBaseUri.host?.lowercase() ?: return false
        return targetScheme == baseScheme && targetHost == baseHost
    }

    private fun startNativeGoogleLoginFromWebView() {
        AndroidBootTrace.log(applicationContext, "MidasWebActivity.startNativeGoogleLoginFromWebView", AndroidAuthContract.OAUTH_ENTRY_REASON_WEBVIEW)
        lifecycleScope.launch {
            when (
                val result = NativeOAuthStarter(this@MidasWebActivity).startGoogleLogin(
                    AndroidAuthContract.OAUTH_ENTRY_REASON_WEBVIEW,
                )
            ) {
                NativeOAuthStartResult.Started -> {
                    AndroidBootTrace.log(applicationContext, "MidasWebActivity.startNativeGoogleLoginFromWebView.result", "started")
                    Toast.makeText(this@MidasWebActivity, getString(R.string.native_login_started), Toast.LENGTH_SHORT).show()
                }
                NativeOAuthStartResult.MissingConfig -> {
                    AndroidBootTrace.log(applicationContext, "MidasWebActivity.startNativeGoogleLoginFromWebView.result", "missing-config")
                    Toast.makeText(this@MidasWebActivity, getString(R.string.native_login_missing_config), Toast.LENGTH_LONG).show()
                }
                NativeOAuthStartResult.InvalidConfig -> {
                    AndroidBootTrace.log(applicationContext, "MidasWebActivity.startNativeGoogleLoginFromWebView.result", "invalid-config")
                    Toast.makeText(this@MidasWebActivity, getString(R.string.native_login_invalid_config), Toast.LENGTH_LONG).show()
                }
                is NativeOAuthStartResult.Failed -> {
                    AndroidBootTrace.log(applicationContext, "MidasWebActivity.startNativeGoogleLoginFromWebView.result", "failed", mapOf("message" to result.message))
                    Toast.makeText(
                        this@MidasWebActivity,
                        getString(R.string.native_login_failed, result.message),
                        Toast.LENGTH_LONG,
                    ).show()
                }
            }
        }
    }

    companion object {
        @Volatile
        private var currentActivityRef: WeakReference<MidasWebActivity>? = null

        fun notifyNativeSessionCleared() {
            currentActivityRef?.get()?.applicationContext?.let {
                AndroidBootTrace.log(it, "MidasWebActivity.notifyNativeSessionCleared", "reload")
            }
            currentActivityRef?.get()?.forceLogoutAndReloadFromAndroid()
        }

        private val WIDGET_SYNC_SCRIPT = """
            (function() {
              if (window.__midasAndroidWidgetInstalled) { return true; }
              window.__midasAndroidWidgetInstalled = true;

              const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
              const todayIsoLocal = () => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                return `${'$'}{year}-${'$'}{month}-${'$'}{day}`;
              };

              const sectionOrder = ['morning', 'noon', 'evening', 'night'];
              const normalizeSection = (value) => {
                const normalized = String(value || '').trim().toLowerCase();
                return sectionOrder.includes(normalized) ? normalized : '';
              };
              const sortSections = (sections) => Array.from(new Set(sections))
                .sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));

              const deriveMedicationSummary = (payload) => {
                const meds = Array.isArray(payload?.medications)
                  ? payload.medications.filter((med) =>
                      med &&
                      med.active !== false &&
                      med.plan_active !== false &&
                      Number(med.total_count || 0) > 0
                    )
                  : [];

                if (!meds.length) {
                  return {
                    status: 'none',
                    takenCount: 0,
                    totalCount: 0,
                    plannedSections: [],
                    openSections: []
                  };
                }

                const totals = meds.reduce((sum, med) => sum + Math.max(0, Number(med.total_count || 0)), 0);
                const taken = meds.reduce((sum, med) => sum + Math.max(0, Number(med.taken_count || 0)), 0);
                const plannedSections = [];
                const openSections = [];

                meds.forEach((med) => {
                  const slots = Array.isArray(med?.slots) ? med.slots : [];
                  slots.forEach((slot) => {
                    const section = normalizeSection(slot?.slot_type);
                    if (!section) return;
                    plannedSections.push(section);
                    if (!slot?.is_taken) {
                      openSections.push(section);
                    }
                  });
                });

                let status = 'done';
                if (totals <= 0) {
                  status = 'none';
                } else if (taken <= 0) {
                  status = 'open';
                } else if (taken < totals) {
                  status = 'partial';
                }

                return {
                  status,
                  takenCount: taken,
                  totalCount: totals,
                  plannedSections: sortSections(plannedSections),
                  openSections: sortSections(openSections)
                };
              };

              const normalizeBloodPressureContext = (value) => {
                const normalized = String(value || '').trim().toLowerCase();
                if (normalized === 'm' || normalized === 'morgen' || normalized === 'morning') return 'morning';
                if (normalized === 'a' || normalized === 'abend' || normalized === 'evening') return 'evening';
                return '';
              };

              const deriveBloodPressureStatus = (rows) => {
                const list = Array.isArray(rows) ? rows : [];
                const contexts = list.map((row) => normalizeBloodPressureContext(row?.ctx));
                const hasMorning = contexts.includes('morning');
                const hasEvening = contexts.includes('evening');
                return hasMorning && !hasEvening ? 'evening_open' : 'none';
              };

              const loadBloodPressureStatus = async (supa, userId, dayIso) => {
                const rows = await supa.sbSelect({
                  table: 'health_events',
                  select: 'id,ctx',
                  filters: [
                    ['user_id', `eq.${'$'}{userId}`],
                    ['type', 'eq.bp'],
                    ['day', `eq.${'$'}{dayIso}`]
                  ],
                  order: 'ts.asc'
                });
                return deriveBloodPressureStatus(rows);
              };

              const postAuthState = async () => {
                try {
                  const restUrl = await window.getConf?.('webhookUrl');
                  const webhookKey = await window.getConf?.('webhookKey');
                  const sessionResult = await window.sbClient?.auth?.getSession?.();
                  const session = sessionResult?.data?.session || null;
                  const accessToken = session?.access_token || '';
                  const refreshToken = session?.refresh_token || '';
                  const userId = session?.user?.id || '';

                  if (!restUrl || !webhookKey || !accessToken || !userId) {
                    throw new Error('widget-auth-missing');
                  }

                  window.MidasAndroidWidget?.postAuthState?.(
                    String(restUrl),
                    String(webhookKey),
                    String(accessToken),
                    String(refreshToken || ''),
                    String(userId),
                    new Date().toISOString()
                  );
                } catch (error) {
                  window.MidasAndroidWidget?.postSyncError?.(
                    String(error?.message || error || 'widget-auth-export-failed')
                  );
                }
              };

              const postSnapshot = async (reason) => {
                try {
                  const bootFlow = window.AppModules?.bootFlow;
                  const supa = window.AppModules?.supabase;
                  const medication = window.AppModules?.medication;
                  if (!bootFlow?.isStageAtLeast || !supa?.waitForAuthDecision || !supa?.getUserId || !supa?.loadIntakeToday || !supa?.sbSelect || !medication?.loadMedicationForDay) {
                    throw new Error('widget-sync-prereqs-missing');
                  }

                  await supa.waitForAuthDecision();
                  if (!bootFlow.isStageAtLeast('INIT_MODULES')) {
                    throw new Error('widget-sync-boot-not-ready');
                  }

                  const userId = await supa.getUserId();
                  if (!userId) {
                    throw new Error('widget-sync-user-missing');
                  }

                  const dayIso = todayIsoLocal();
                  const intake = await supa.loadIntakeToday({ user_id: userId, dayIso, reason: `android-widget:${'$'}{reason}` });
                  const medicationPayload = await medication.loadMedicationForDay(dayIso, { reason: `android-widget:${'$'}{reason}` });
                  const medicationSummary = deriveMedicationSummary(medicationPayload);
                  const bloodPressureStatus = await loadBloodPressureStatus(supa, userId, dayIso);
                  const updatedAt = new Date().toISOString();
                  const rawWaterMl = Number(intake?.water_ml ?? 0);
                  const waterMl = Number.isFinite(rawWaterMl) ? Math.max(0, rawWaterMl) : 0;

                  if (window.MidasAndroidWidget?.postWidgetStateV2) {
                    window.MidasAndroidWidget.postWidgetStateV2(
                      dayIso,
                      waterMl,
                      medicationSummary.status,
                      Number(medicationSummary.takenCount || 0),
                      Number(medicationSummary.totalCount || 0),
                      medicationSummary.plannedSections.join(','),
                      medicationSummary.openSections.join(','),
                      bloodPressureStatus,
                      updatedAt
                    );
                  } else {
                    window.MidasAndroidWidget?.postWidgetState?.(
                      dayIso,
                      waterMl,
                      medicationSummary.status,
                      updatedAt
                    );
                  }
                } catch (error) {
                  window.MidasAndroidWidget?.postSyncError?.(
                    String(error?.message || error || 'widget-sync-failed')
                  );
                }
              };

              const install = async () => {
                for (let i = 0; i < 40; i += 1) {
                  const bootFlow = window.AppModules?.bootFlow;
                  const supa = window.AppModules?.supabase;
                  const medication = window.AppModules?.medication;
                  if (bootFlow?.isStageAtLeast && supa?.waitForAuthDecision && supa?.loadIntakeToday && supa?.getUserId && supa?.sbSelect && medication?.loadMedicationForDay) {
                    break;
                  }
                  await sleep(500);
                }

                await postAuthState();
                await postSnapshot('initial');

                window.sbClient?.auth?.onAuthStateChange?.((_event, _session) => {
                  window.setTimeout(() => postAuthState(), 150);
                });

                document.addEventListener('capture:intake-changed', () => {
                  window.setTimeout(() => postSnapshot('capture'), 150);
                });

                document.addEventListener('medication:changed', () => {
                  window.setTimeout(() => postSnapshot('medication'), 150);
                });

                document.addEventListener('bp:changed', () => {
                  window.setTimeout(() => postSnapshot('bp'), 150);
                });

                document.addEventListener('visibilitychange', () => {
                  if (!document.hidden) {
                    window.setTimeout(() => postAuthState(), 150);
                    window.setTimeout(() => postSnapshot('visible'), 150);
                  }
                });
              };

              install();
              return true;
            })();
        """.trimIndent()

        private val FORCE_LOGOUT_SCRIPT = """
            (async function() {
              try {
                if (typeof window.AppModules?.supabase?.handleAndroidNativeSessionCleared === 'function') {
                  await window.AppModules.supabase.handleAndroidNativeSessionCleared({ reload: true });
                  return true;
                }
              } catch (_) {}
              try {
                await window.sbClient?.auth?.signOut?.();
              } catch (_) {}
              try {
                window.location.reload();
              } catch (_) {}
              return true;
            })();
        """.trimIndent()
    }

    private fun forceLogoutAndReloadFromAndroid() {
        AndroidBootTrace.log(applicationContext, "MidasWebActivity.forceLogoutAndReloadFromAndroid", "execute-js")
        binding.webView.evaluateJavascript(FORCE_LOGOUT_SCRIPT, null)
    }
}

package de.schabuss.midas.auth

import android.content.Context
import org.json.JSONObject

class NativeAuthConfigStore(context: Context) {
    private val appContext = context.applicationContext
    private val prefs = SecurePreferencesFactory.create(appContext, SECURE_PREFS_NAME)
    private val nativeAuthStore = NativeAuthStore(appContext)

    init {
        migrateLegacyPlaintextConfigIfNeeded()
    }

    fun load(): NativeAuthBootstrapConfig? {
        val raw = prefs.getString(KEY_CONFIG, null) ?: return null
        return runCatching {
            val json = JSONObject(raw)
            NativeAuthBootstrapConfig(
                restUrl = json.optString("restUrl", ""),
                supabaseUrl = json.optString("supabaseUrl", ""),
                anonKey = json.optString("anonKey", ""),
            )
        }.getOrNull()?.takeIf {
            it.restUrl.isNotBlank() && it.supabaseUrl.isNotBlank() && it.anonKey.isNotBlank()
        }
    }

    fun save(config: NativeAuthBootstrapConfig) {
        val payload = JSONObject()
            .put("restUrl", config.restUrl)
            .put("supabaseUrl", config.supabaseUrl)
            .put("anonKey", config.anonKey)
        prefs.edit().putString(KEY_CONFIG, payload.toString()).apply()
        syncNativeAuthConfig(config)
    }

    fun clear() {
        prefs.edit().remove(KEY_CONFIG).apply()
    }

    companion object {
        private const val SECURE_PREFS_NAME = "midas_native_auth_bootstrap_secure"
        private const val LEGACY_PREFS_NAME = "midas_native_auth_bootstrap"
        private const val KEY_CONFIG = "native_auth_bootstrap"
    }

    private fun migrateLegacyPlaintextConfigIfNeeded() {
        val legacyPrefs = appContext.getSharedPreferences(LEGACY_PREFS_NAME, Context.MODE_PRIVATE)
        if (!legacyPrefs.contains(KEY_CONFIG)) return
        if (!prefs.contains(KEY_CONFIG)) {
            legacyPrefs.getString(KEY_CONFIG, null)?.let { raw ->
                prefs.edit().putString(KEY_CONFIG, raw).apply()
            }
        }
        legacyPrefs.edit().remove(KEY_CONFIG).apply()
    }

    private fun syncNativeAuthConfig(config: NativeAuthBootstrapConfig) {
        val currentAuth = nativeAuthStore.load() ?: return
        if (currentAuth.restUrl == config.restUrl && currentAuth.anonKey == config.anonKey) return
        nativeAuthStore.save(
            currentAuth.copy(
                restUrl = config.restUrl,
                anonKey = config.anonKey,
            )
        )
    }
}

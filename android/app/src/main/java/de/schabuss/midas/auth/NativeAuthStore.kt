package de.schabuss.midas.auth

import android.content.Context
import org.json.JSONObject

class NativeAuthStore(context: Context) {
    private val appContext = context.applicationContext
    private val prefs = SecurePreferencesFactory.create(appContext, SECURE_PREFS_NAME)

    init {
        migrateLegacyPlaintextStateIfNeeded()
    }

    fun load(): NativeAuthState? {
        val raw = prefs.getString(KEY_AUTH, null) ?: return null
        return runCatching {
            val json = JSONObject(raw)
            NativeAuthState(
                restUrl = json.optString("restUrl", ""),
                anonKey = json.optString("anonKey", ""),
                accessToken = json.optString("accessToken", ""),
                refreshToken = json.optString("refreshToken", ""),
                userId = json.optString("userId", ""),
                updatedAt = json.optString("updatedAt", ""),
                sessionGeneration = json.optLong("sessionGeneration", currentGeneration()),
            )
        }.getOrNull()?.takeIf {
            it.restUrl.isNotBlank() && it.anonKey.isNotBlank() && it.accessToken.isNotBlank() && it.userId.isNotBlank()
        }
    }

    fun save(state: NativeAuthState) {
        val payload = JSONObject()
            .put("restUrl", state.restUrl)
            .put("anonKey", state.anonKey)
            .put("accessToken", state.accessToken)
            .put("refreshToken", state.refreshToken)
            .put("userId", state.userId)
            .put("updatedAt", state.updatedAt)
            .put("sessionGeneration", state.sessionGeneration)
        prefs.edit().putString(KEY_AUTH, payload.toString()).apply()
    }

    fun clearAndAdvanceGeneration(): Long {
        val nextGeneration = currentGeneration() + 1L
        prefs.edit()
            .putLong(KEY_SESSION_GENERATION, nextGeneration)
            .remove(KEY_AUTH)
            .apply()
        return nextGeneration
    }

    fun issueFreshGeneration(): Long {
        val nextGeneration = currentGeneration() + 1L
        prefs.edit().putLong(KEY_SESSION_GENERATION, nextGeneration).apply()
        return nextGeneration
    }

    fun currentGeneration(): Long =
        prefs.getLong(KEY_SESSION_GENERATION, DEFAULT_SESSION_GENERATION)

    fun clear() {
        prefs.edit().remove(KEY_AUTH).apply()
    }

    companion object {
        private const val SECURE_PREFS_NAME = "midas_native_auth_secure"
        private const val LEGACY_PREFS_NAME = "midas_native_auth"
        private const val KEY_AUTH = "native_auth_state"
        private const val KEY_SESSION_GENERATION = "native_auth_generation"
        private const val DEFAULT_SESSION_GENERATION = 1L
    }

    private fun migrateLegacyPlaintextStateIfNeeded() {
        val legacyPrefs = appContext.getSharedPreferences(LEGACY_PREFS_NAME, Context.MODE_PRIVATE)
        val hasLegacyAuth = legacyPrefs.contains(KEY_AUTH)
        val hasLegacyGeneration = legacyPrefs.contains(KEY_SESSION_GENERATION)
        if (!hasLegacyAuth && !hasLegacyGeneration) return

        if (hasLegacyAuth && !prefs.contains(KEY_AUTH)) {
            legacyPrefs.getString(KEY_AUTH, null)?.let { raw ->
                prefs.edit().putString(KEY_AUTH, raw).apply()
            }
        }
        if (hasLegacyGeneration && !prefs.contains(KEY_SESSION_GENERATION)) {
            val generation = legacyPrefs.getLong(KEY_SESSION_GENERATION, DEFAULT_SESSION_GENERATION)
            prefs.edit().putLong(KEY_SESSION_GENERATION, generation).apply()
        }
        legacyPrefs.edit()
            .remove(KEY_AUTH)
            .remove(KEY_SESSION_GENERATION)
            .apply()
    }
}

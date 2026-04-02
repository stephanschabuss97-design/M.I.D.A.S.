package de.schabuss.midas.widget

import android.content.Context
import de.schabuss.midas.auth.NativeAuthState
import de.schabuss.midas.auth.NativeAuthStore
import org.json.JSONObject

data class WidgetAuthState(
    val restUrl: String,
    val anonKey: String,
    val accessToken: String,
    val refreshToken: String,
    val userId: String,
    val updatedAt: String,
    val sessionGeneration: Long,
)

class WidgetAuthStore(context: Context) {
    private val appContext = context.applicationContext
    private val nativeAuthStore = NativeAuthStore(appContext)
    private val prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun load(): WidgetAuthState? {
        nativeAuthStore.load()?.let { return it.toWidgetAuthState() }

        val raw = prefs.getString(KEY_AUTH, null) ?: return null
        val legacy = runCatching {
            val json = JSONObject(raw)
            WidgetAuthState(
                restUrl = json.optString("restUrl", ""),
                anonKey = json.optString("anonKey", ""),
                accessToken = json.optString("accessToken", ""),
                refreshToken = json.optString("refreshToken", ""),
                userId = json.optString("userId", ""),
                updatedAt = json.optString("updatedAt", ""),
                sessionGeneration = json.optLong("sessionGeneration", nativeAuthStore.currentGeneration()),
            )
        }.getOrNull()?.takeIf {
            it.restUrl.isNotBlank() && it.anonKey.isNotBlank() && it.accessToken.isNotBlank() && it.userId.isNotBlank()
        }
        legacy?.let { save(it) }
        return legacy
    }

    fun save(state: WidgetAuthState) {
        nativeAuthStore.save(state.toNativeAuthState())
        prefs.edit().remove(KEY_AUTH).apply()
    }

    fun clear() {
        nativeAuthStore.clear()
        prefs.edit().remove(KEY_AUTH).apply()
    }

    companion object {
        private const val PREFS_NAME = "midas_widget_auth"
        private const val KEY_AUTH = "widget_auth_state"
    }
}

private fun NativeAuthState.toWidgetAuthState(): WidgetAuthState = WidgetAuthState(
    restUrl = restUrl,
    anonKey = anonKey,
    accessToken = accessToken,
    refreshToken = refreshToken,
    userId = userId,
    updatedAt = updatedAt,
    sessionGeneration = sessionGeneration,
)

private fun WidgetAuthState.toNativeAuthState(): NativeAuthState = NativeAuthState(
    restUrl = restUrl,
    anonKey = anonKey,
    accessToken = accessToken,
    refreshToken = refreshToken,
    userId = userId,
    updatedAt = updatedAt,
    sessionGeneration = sessionGeneration,
)

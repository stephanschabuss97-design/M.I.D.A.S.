package de.schabuss.midas.web

import android.content.Context
import android.webkit.JavascriptInterface
import de.schabuss.midas.auth.NativeAuthConfigResolver
import de.schabuss.midas.auth.NativeAuthConfigStore
import de.schabuss.midas.auth.NativeAuthStore
import org.json.JSONObject

class NativeWebViewAuthBridge(
    context: Context,
    private val onRequestNativeGoogleLogin: () -> Unit = {},
) {
    private val nativeAuthStore = NativeAuthStore(context.applicationContext)
    private val nativeAuthConfigStore = NativeAuthConfigStore(context.applicationContext)

    @JavascriptInterface
    fun getBootstrapState(): String {
        val nativeAuth = nativeAuthStore.load()
        val nativeConfig = nativeAuthConfigStore.load()
        val restUrl = nativeConfig?.restUrl ?: nativeAuth?.restUrl ?: ""
        val anonKey = nativeConfig?.anonKey ?: nativeAuth?.anonKey ?: ""
        val supabaseUrl = nativeConfig?.supabaseUrl
            ?: NativeAuthConfigResolver.baseUrlFromRest(restUrl)
            ?: ""
        val sessionGeneration = nativeAuth?.sessionGeneration ?: nativeAuthStore.currentGeneration()

        if (restUrl.isBlank() || anonKey.isBlank()) {
            return ""
        }

        return JSONObject()
            .put("restUrl", restUrl)
            .put("supabaseUrl", supabaseUrl)
            .put("anonKey", anonKey)
            .put("accessToken", nativeAuth?.accessToken ?: "")
            .put("refreshToken", nativeAuth?.refreshToken ?: "")
            .put("userId", nativeAuth?.userId ?: "")
            .put("updatedAt", nativeAuth?.updatedAt ?: "")
            .put("sessionGeneration", sessionGeneration)
            .put("configSource", if (nativeConfig != null) "config-store" else "auth-store")
            .toString()
    }

    @JavascriptInterface
    fun requestNativeGoogleLogin() {
        onRequestNativeGoogleLogin()
    }
}

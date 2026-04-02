package de.schabuss.midas.web

import android.content.Context
import android.webkit.JavascriptInterface
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
        val restUrl = nativeAuth?.restUrl ?: nativeConfig?.restUrl ?: ""
        val anonKey = nativeAuth?.anonKey ?: nativeConfig?.anonKey ?: ""

        if (restUrl.isBlank() || anonKey.isBlank()) {
            return ""
        }

        return JSONObject()
            .put("restUrl", restUrl)
            .put("anonKey", anonKey)
            .put("accessToken", nativeAuth?.accessToken ?: "")
            .put("refreshToken", nativeAuth?.refreshToken ?: "")
            .put("userId", nativeAuth?.userId ?: "")
            .put("updatedAt", nativeAuth?.updatedAt ?: "")
            .toString()
    }

    @JavascriptInterface
    fun requestNativeGoogleLogin() {
        onRequestNativeGoogleLogin()
    }
}

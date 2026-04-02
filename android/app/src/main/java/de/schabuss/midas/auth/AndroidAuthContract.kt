package de.schabuss.midas.auth

import android.net.Uri

object AndroidAuthContract {
    const val CALLBACK_SCHEME = "de.schabuss.midas"
    const val CALLBACK_HOST = "auth"
    const val CALLBACK_PATH = "/callback"

    val CALLBACK_URI: Uri = Uri.Builder()
        .scheme(CALLBACK_SCHEME)
        .authority(CALLBACK_HOST)
        .path(CALLBACK_PATH)
        .build()

    const val OAUTH_ENTRY_REASON_WIDGET = "widget"
    const val OAUTH_ENTRY_REASON_SHELL = "shell"
    const val OAUTH_ENTRY_REASON_WEBVIEW = "webview"

    fun callbackUri(entryReason: String): Uri =
        CALLBACK_URI.buildUpon()
            .appendQueryParameter("entry", entryReason)
            .build()

    fun isCallbackUri(uri: Uri?): Boolean {
        if (uri == null) return false
        return uri.scheme == CALLBACK_SCHEME &&
            uri.host == CALLBACK_HOST &&
            (uri.path ?: "").startsWith(CALLBACK_PATH)
    }
}

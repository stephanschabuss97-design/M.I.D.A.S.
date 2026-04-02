package de.schabuss.midas.auth

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import io.github.jan.supabase.auth.ExternalAuthAction
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.Google

sealed interface NativeOAuthStartResult {
    data object Started : NativeOAuthStartResult
    data object MissingConfig : NativeOAuthStartResult
    data object InvalidConfig : NativeOAuthStartResult
    data class Failed(val message: String) : NativeOAuthStartResult
}

class NativeOAuthStarter(
    private val activity: Activity,
) {
    fun startGoogleLogin(entryReason: String): NativeOAuthStartResult {
        val clientBundle = NativeAuthClientProvider.getOrCreate(activity.applicationContext)
            ?: return NativeOAuthStartResult.MissingConfig

        val (client, config) = clientBundle
        if (config.supabaseUrl.isBlank() || config.anonKey.isBlank()) {
            return NativeOAuthStartResult.InvalidConfig
        }

        return try {
            val oauthUrl = client.auth.getOAuthUrl(
                Google,
                AndroidAuthContract.callbackUri(entryReason).toString(),
                "",
            ) {
                automaticallyOpenUrl = false
            }
            val parsedUri = Uri.parse(oauthUrl)
            try {
                openInCustomTabs(parsedUri, ExternalAuthAction.CustomTabs())
            } catch (_: ActivityNotFoundException) {
                openInExternalBrowser(parsedUri)
            }
            NativeOAuthStartResult.Started
        } catch (error: Exception) {
            NativeOAuthStartResult.Failed(
                error.message?.takeIf { it.isNotBlank() } ?: "native-oauth-start-failed"
            )
        }
    }

    private fun openInCustomTabs(uri: Uri, action: ExternalAuthAction.CustomTabs) {
        val intentBuilder = CustomTabsIntent.Builder().also { builder ->
            action.intentBuilder.invoke(builder)
        }
        intentBuilder.build().launchUrl(activity, uri)
    }

    private fun openInExternalBrowser(uri: Uri) {
        val browserIntent = Intent(Intent.ACTION_VIEW, uri).apply {
            addCategory(Intent.CATEGORY_BROWSABLE)
        }
        activity.startActivity(browserIntent)
    }
}

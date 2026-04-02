package de.schabuss.midas.auth

import android.app.Activity
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
    suspend fun startGoogleLogin(entryReason: String): NativeOAuthStartResult {
        val clientBundle = NativeAuthClientProvider.getOrCreate(activity.applicationContext)
            ?: return NativeOAuthStartResult.MissingConfig

        val (client, config) = clientBundle
        if (config.supabaseUrl.isBlank() || config.anonKey.isBlank()) {
            return NativeOAuthStartResult.InvalidConfig
        }

        return try {
            client.auth.signInWith(
                Google,
                redirectUrl = AndroidAuthContract.callbackUri(entryReason).toString(),
            ) {
                scopes.add("email")
                scopes.add("profile")
            }
            NativeOAuthStartResult.Started
        } catch (error: Exception) {
            NativeOAuthStartResult.Failed(
                error.message?.takeIf { it.isNotBlank() } ?: "native-oauth-start-failed"
            )
        }
    }
}

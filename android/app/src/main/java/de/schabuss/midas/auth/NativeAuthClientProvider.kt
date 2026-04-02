package de.schabuss.midas.auth

import android.content.Context
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.ExternalAuthAction

object NativeAuthClientProvider {
    @Volatile
    private var cachedClient: SupabaseClient? = null

    @Volatile
    private var cachedFingerprint: String? = null

    fun getOrCreate(context: Context): Pair<SupabaseClient, NativeAuthBootstrapConfig>? {
        val config = NativeAuthConfigResolver(context.applicationContext).resolve() ?: return null
        val fingerprint = "${config.supabaseUrl}|${config.anonKey}"
        val currentClient = cachedClient
        if (currentClient != null && cachedFingerprint == fingerprint) {
            return currentClient to config
        }

        val newClient = createSupabaseClient(config.supabaseUrl, config.anonKey) {
            install(Auth) {
                defaultExternalAuthAction = ExternalAuthAction.CustomTabs()
            }
        }
        cachedClient = newClient
        cachedFingerprint = fingerprint
        return newClient to config
    }

    fun clear() {
        cachedClient = null
        cachedFingerprint = null
    }
}

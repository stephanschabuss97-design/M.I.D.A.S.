package de.schabuss.midas.auth

import android.content.Context
import de.schabuss.midas.widget.WidgetAuthStore

class NativeAuthConfigResolver(context: Context) {
    private val configStore = NativeAuthConfigStore(context.applicationContext)
    private val nativeAuthStore = NativeAuthStore(context.applicationContext)
    private val widgetAuthStore = WidgetAuthStore(context.applicationContext)

    fun resolve(): NativeAuthBootstrapConfig? {
        configStore.load()?.let { config ->
            createConfig(config.restUrl, config.anonKey)?.let { return it }
        }
        nativeAuthStore.load()?.let { state ->
            createConfig(state.restUrl, state.anonKey)?.let { return it }
        }
        widgetAuthStore.load()?.let { state ->
            createConfig(state.restUrl, state.anonKey)?.let { return it }
        }
        return null
    }

    private fun createConfig(restUrl: String, anonKey: String): NativeAuthBootstrapConfig? {
        val safeRestUrl = restUrl.trim()
        val safeAnonKey = anonKey.trim().removePrefix("Bearer ").removePrefix("bearer ")
        val supabaseUrl = baseUrlFromRest(safeRestUrl) ?: return null
        if (safeAnonKey.isBlank()) return null
        return NativeAuthBootstrapConfig(
            restUrl = safeRestUrl,
            supabaseUrl = supabaseUrl,
            anonKey = safeAnonKey,
        )
    }

    companion object {
        fun baseUrlFromRest(restUrl: String): String? {
            val marker = "/rest/"
            val index = restUrl.indexOf(marker)
            return if (index > 0) restUrl.substring(0, index) else null
        }
    }
}

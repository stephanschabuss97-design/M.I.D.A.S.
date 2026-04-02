package de.schabuss.midas.auth

import android.util.Base64
import org.json.JSONObject
import java.net.URL

object NativeAuthBootstrapValidator {
    fun validate(restUrl: String, anonKey: String): NativeAuthBootstrapConfig? {
        val safeRestUrl = restUrl.trim()
        val safeAnonKey = anonKey.trim().removePrefix("Bearer ").removePrefix("bearer ")
        if (safeRestUrl.isBlank() || safeAnonKey.isBlank()) return null
        if (!safeRestUrl.contains("/rest/v1/")) return null
        if (!safeRestUrl.contains("/rest/v1/health_events")) return null
        runCatching { URL(safeRestUrl) }.getOrNull() ?: return null
        if (isServiceRoleKey(safeAnonKey)) return null
        val supabaseUrl = NativeAuthConfigResolver.baseUrlFromRest(safeRestUrl) ?: return null
        return NativeAuthBootstrapConfig(
            restUrl = safeRestUrl,
            supabaseUrl = supabaseUrl,
            anonKey = safeAnonKey,
        )
    }

    private fun isServiceRoleKey(raw: String): Boolean {
        return try {
            val token = raw.trim().removePrefix("Bearer ").removePrefix("bearer ")
            val parts = token.split('.')
            if (parts.size < 2) return false
            val normalized = parts[1]
                .replace('-', '+')
                .replace('_', '/')
                .let { segment ->
                    val padding = (4 - segment.length % 4) % 4
                    segment + "=".repeat(padding)
                }
            val payload = String(Base64.decode(normalized, Base64.DEFAULT), Charsets.UTF_8)
            JSONObject(payload).optString("role", "") == "service_role"
        } catch (_: Exception) {
            false
        }
    }
}

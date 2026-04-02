package de.schabuss.midas.widget

import android.content.Context
import de.schabuss.midas.auth.NativeAuthStore
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

class WidgetSyncRepository(private val context: Context) {
    private val authStore = WidgetAuthStore(context.applicationContext)
    private val snapshotStore = WidgetSnapshotStore(context.applicationContext)
    private val nativeAuthStore = NativeAuthStore(context.applicationContext)

    fun hasAuthState(): Boolean = authStore.load() != null

    fun syncNow(): Boolean {
        val auth = authStore.load() ?: return false
        val sessionGeneration = auth.sessionGeneration
        val refreshedAuth = refreshSession(auth) ?: auth
        if (!isSessionGenerationCurrent(sessionGeneration)) return true
        val dayIso = LocalDate.now(ZoneId.systemDefault()).toString()

        val intakeJson = requestJsonArray(
            url = buildIntakeUrl(refreshedAuth.restUrl, refreshedAuth.userId, dayIso),
            method = "GET",
            anonKey = refreshedAuth.anonKey,
            accessToken = refreshedAuth.accessToken,
        ) ?: return if (isSessionGenerationCurrent(sessionGeneration)) false else true

        val medicationJson = requestJsonArray(
            url = buildMedicationRpcUrl(refreshedAuth.restUrl),
            method = "POST",
            anonKey = refreshedAuth.anonKey,
            accessToken = refreshedAuth.accessToken,
            body = JSONObject().put("p_day", dayIso).toString(),
        ) ?: return if (isSessionGenerationCurrent(sessionGeneration)) false else true

        if (!isSessionGenerationCurrent(sessionGeneration)) return true

        val waterMl = extractWaterMl(intakeJson)
        val medicationStatus = deriveMedicationStatus(medicationJson)
        snapshotStore.save(
            dayIso = dayIso,
            waterCurrentMl = waterMl,
            medicationStatus = medicationStatus,
            updatedAt = Instant.now().toString(),
        )
        authStore.save(refreshedAuth.copy(updatedAt = Instant.now().toString()))
        MidasWidgetProvider.refreshAll(context.applicationContext)
        return true
    }

    private fun refreshSession(auth: WidgetAuthState): WidgetAuthState? {
        if (auth.refreshToken.isBlank()) return null
        val baseUrl = baseUrlFromRest(auth.restUrl) ?: return null
        val url = "$baseUrl/auth/v1/token?grant_type=refresh_token"
        val response = requestJsonObject(
            url = url,
            method = "POST",
            anonKey = auth.anonKey,
            accessToken = auth.accessToken,
            body = JSONObject().put("refresh_token", auth.refreshToken).toString(),
        ) ?: return null

        val accessToken = response.optString("access_token", "")
        val refreshToken = response.optString("refresh_token", auth.refreshToken)
        val userId = response.optJSONObject("user")?.optString("id", auth.userId).orEmpty().ifBlank { auth.userId }
        if (accessToken.isBlank()) return null

        return auth.copy(
            accessToken = accessToken,
            refreshToken = refreshToken,
            userId = userId,
            updatedAt = Instant.now().toString(),
        )
    }

    private fun isSessionGenerationCurrent(expected: Long): Boolean =
        nativeAuthStore.currentGeneration() == expected

    private fun requestJsonArray(
        url: String,
        method: String,
        anonKey: String,
        accessToken: String,
        body: String? = null,
    ): JSONArray? {
        val conn = openConnection(url, method, anonKey, accessToken, body)
        return try {
            val code = conn.responseCode
            if (code !in 200..299) {
                null
            } else {
                val payload = conn.inputStream.bufferedReader().use(BufferedReader::readText)
                JSONArray(payload)
            }
        } catch (_: Exception) {
            null
        } finally {
            conn.disconnect()
        }
    }

    private fun requestJsonObject(
        url: String,
        method: String,
        anonKey: String,
        accessToken: String,
        body: String? = null,
    ): JSONObject? {
        val conn = openConnection(url, method, anonKey, accessToken, body)
        return try {
            val code = conn.responseCode
            if (code !in 200..299) {
                null
            } else {
                val payload = conn.inputStream.bufferedReader().use(BufferedReader::readText)
                JSONObject(payload)
            }
        } catch (_: Exception) {
            null
        } finally {
            conn.disconnect()
        }
    }

    private fun openConnection(
        url: String,
        method: String,
        anonKey: String,
        accessToken: String,
        body: String? = null,
    ): HttpURLConnection {
        val connection = URL(url).openConnection() as HttpURLConnection
        connection.requestMethod = method
        connection.connectTimeout = 15000
        connection.readTimeout = 15000
        connection.setRequestProperty("apikey", anonKey)
        connection.setRequestProperty("Authorization", "Bearer $accessToken")
        connection.setRequestProperty("Accept", "application/json")
        if (body != null) {
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { writer ->
                writer.write(body)
            }
        }
        return connection
    }

    private fun buildIntakeUrl(restUrl: String, userId: String, dayIso: String): String {
        val base = baseUrlFromRest(restUrl) ?: restUrl
        return "$base/rest/v1/health_events?select=id,payload&user_id=eq.$userId&type=eq.intake&day=eq.$dayIso&order=ts.desc&limit=1"
    }

    private fun buildMedicationRpcUrl(restUrl: String): String {
        val base = baseUrlFromRest(restUrl) ?: restUrl
        return "$base/rest/v1/rpc/med_list_v2"
    }

    private fun extractWaterMl(intakeRows: JSONArray): Int {
        if (intakeRows.length() <= 0) return 0
        val row = intakeRows.optJSONObject(0) ?: return 0
        val payload = row.optJSONObject("payload") ?: return 0
        return payload.optInt("water_ml", 0).coerceAtLeast(0)
    }

    private fun deriveMedicationStatus(medicationRows: JSONArray): MedicationStatus {
        var totalCount = 0
        var takenCount = 0

        for (index in 0 until medicationRows.length()) {
            val med = medicationRows.optJSONObject(index) ?: continue
            val active = med.optBoolean("active", true)
            val planActive = med.optBoolean("plan_active", true)
            val medTotal = med.optInt("total_count", 0)
            if (!active || !planActive || medTotal <= 0) continue
            totalCount += medTotal.coerceAtLeast(0)
            takenCount += med.optInt("taken_count", 0).coerceAtLeast(0)
        }

        if (totalCount <= 0) return MedicationStatus.NONE
        if (takenCount <= 0) return MedicationStatus.OPEN
        if (takenCount < totalCount) return MedicationStatus.PARTIAL
        return MedicationStatus.DONE
    }

    private fun baseUrlFromRest(restUrl: String): String? {
        val marker = "/rest/"
        val index = restUrl.indexOf(marker)
        return if (index > 0) restUrl.substring(0, index) else null
    }
}

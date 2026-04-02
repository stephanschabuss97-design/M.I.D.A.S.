package de.schabuss.midas.widget

import android.content.Context
import android.webkit.JavascriptInterface
import de.schabuss.midas.auth.NativeAuthStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.time.Instant

class WidgetSyncBridge(
    private val context: Context,
) {
    private val store = WidgetSnapshotStore(context.applicationContext)
    private val authStore = WidgetAuthStore(context.applicationContext)
    private val nativeAuthStore = NativeAuthStore(context.applicationContext)
    private val bridgeScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    @JavascriptInterface
    fun postWidgetState(dayIso: String?, waterCurrentMl: Int, medicationStatus: String?, updatedAt: String?) {
        val safeDayIso = dayIso?.takeIf { it.matches(Regex("\\d{4}-\\d{2}-\\d{2}")) } ?: return
        val safeUpdatedAt = updatedAt?.trim().takeUnless { it.isNullOrEmpty() } ?: Instant.now().toString()
        store.save(
            dayIso = safeDayIso,
            waterCurrentMl = waterCurrentMl,
            medicationStatus = MedicationStatus.fromWire(medicationStatus),
            updatedAt = safeUpdatedAt,
        )
        MidasWidgetProvider.refreshAll(context.applicationContext)
    }

    @JavascriptInterface
    fun postAuthState(
        restUrl: String?,
        anonKey: String?,
        accessToken: String?,
        refreshToken: String?,
        userId: String?,
        updatedAt: String?,
    ) {
        val safeRestUrl = restUrl?.trim().orEmpty()
        val safeAnonKey = anonKey?.trim()?.removePrefix("Bearer ")?.removePrefix("bearer ").orEmpty()
        val safeAccessToken = accessToken?.trim().orEmpty()
        val safeRefreshToken = refreshToken?.trim().orEmpty()
        val safeUserId = userId?.trim().orEmpty()
        if (safeRestUrl.isBlank() || safeAnonKey.isBlank() || safeAccessToken.isBlank() || safeUserId.isBlank()) return

        authStore.save(
            WidgetAuthState(
                restUrl = safeRestUrl,
                anonKey = safeAnonKey,
                accessToken = safeAccessToken,
                refreshToken = safeRefreshToken,
                userId = safeUserId,
                updatedAt = updatedAt?.trim().takeUnless { it.isNullOrEmpty() } ?: Instant.now().toString(),
                sessionGeneration = nativeAuthStore.currentGeneration(),
            )
        )
        WidgetSyncScheduler.ensureScheduled(context.applicationContext)
        WidgetSyncScheduler.requestImmediate(context.applicationContext)
    }

    @Suppress("UNUSED_PARAMETER")
    @JavascriptInterface
    fun postSyncError(_message: String?) {
        // Intentionally quiet for V1: keep the last good snapshot instead of clearing it.
    }

    @Suppress("UNUSED_PARAMETER")
    @JavascriptInterface
    fun requestImmediateRefresh(_reason: String?) {
        bridgeScope.launch {
            val synced = WidgetSyncRepository(context.applicationContext).syncNow()
            if (!synced) {
                WidgetSyncScheduler.ensureScheduled(context.applicationContext)
                WidgetSyncScheduler.requestImmediate(context.applicationContext)
            }
        }
    }
}

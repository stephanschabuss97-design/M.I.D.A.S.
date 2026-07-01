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
        val legacyStatus = MedicationStatus.fromWire(medicationStatus)
        val existingState = store.load()?.takeIf { it.dayIso == safeDayIso }
        val existingSummary = existingState
            ?.medicationSummary
            ?.takeIf { it.hasV21Details() }
        val hasIncomingStatus = !medicationStatus.isNullOrBlank()
        val summary =
            if (existingSummary != null && (!hasIncomingStatus || existingSummary.status == legacyStatus)) {
                existingSummary
            } else {
                MedicationWidgetSummary.legacy(legacyStatus)
            }
        store.save(
            dayIso = safeDayIso,
            waterCurrentMl = waterCurrentMl,
            medicationStatus = summary.status,
            updatedAt = safeUpdatedAt,
            medicationSummary = summary,
            bloodPressureStatus = existingState?.bloodPressureStatus ?: BloodPressureWidgetStatus.NONE,
        )
        MidasWidgetProvider.refreshAll(context.applicationContext)
    }

    @JavascriptInterface
    fun postWidgetStateV2(
        dayIso: String?,
        waterCurrentMl: Int,
        medicationStatus: String?,
        takenCount: Int,
        totalCount: Int,
        plannedSections: String?,
        openSections: String?,
        updatedAt: String?,
    ) {
        postWidgetStateV2(
            dayIso = dayIso,
            waterCurrentMl = waterCurrentMl,
            medicationStatus = medicationStatus,
            takenCount = takenCount,
            totalCount = totalCount,
            plannedSections = plannedSections,
            openSections = openSections,
            bloodPressureStatus = null,
            updatedAt = updatedAt,
        )
    }

    @JavascriptInterface
    fun postWidgetStateV2(
        dayIso: String?,
        waterCurrentMl: Int,
        medicationStatus: String?,
        takenCount: Int,
        totalCount: Int,
        plannedSections: String?,
        openSections: String?,
        bloodPressureStatus: String?,
        updatedAt: String?,
    ) {
        val safeDayIso = dayIso?.takeIf { it.matches(Regex("\\d{4}-\\d{2}-\\d{2}")) } ?: return
        val safeUpdatedAt = updatedAt?.trim().takeUnless { it.isNullOrEmpty() } ?: Instant.now().toString()
        val existingState = store.load()?.takeIf { it.dayIso == safeDayIso }
        val summary = MedicationWidgetSummary(
            status = MedicationStatus.fromWire(medicationStatus),
            takenCount = takenCount,
            totalCount = totalCount,
            plannedSections = parseMedicationSections(plannedSections),
            openSections = parseMedicationSections(openSections),
        ).normalized()
        val safeBloodPressureStatus =
            if (bloodPressureStatus.isNullOrBlank()) {
                existingState?.bloodPressureStatus ?: BloodPressureWidgetStatus.NONE
            } else {
                BloodPressureWidgetStatus.fromWire(bloodPressureStatus)
            }
        store.save(
            dayIso = safeDayIso,
            waterCurrentMl = waterCurrentMl,
            medicationStatus = summary.status,
            updatedAt = safeUpdatedAt,
            medicationSummary = summary,
            bloodPressureStatus = safeBloodPressureStatus,
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

    private fun MedicationWidgetSummary.hasV21Details(): Boolean =
        totalCount > 0 || plannedSections.isNotEmpty() || openSections.isNotEmpty()

    private fun parseMedicationSections(value: String?): List<MedicationSection> =
        value
            ?.split(",")
            ?.mapNotNull { MedicationSection.fromWire(it) }
            ?.distinct()
            ?: emptyList()
}

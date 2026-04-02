package de.schabuss.midas.widget

import android.content.Context
import android.os.SystemClock
import de.schabuss.midas.auth.NativeAuthStore
import de.schabuss.midas.diag.AndroidBootTrace
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.time.Duration
import java.time.Instant

object WidgetRefreshCoordinator {
    private const val MIN_WAKE_SYNC_AGE_SECONDS = 120L
    private const val MIN_BACKGROUND_TRIGGER_GAP_MS = 15000L

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    @Volatile
    private var lastBackgroundTriggerElapsedAt: Long = 0L

    fun request(context: Context, reason: String, force: Boolean = false) {
        val appContext = context.applicationContext
        val auth = NativeAuthStore(appContext).load() ?: return
        if (!force && shouldSkipBackgroundCatchup(appContext)) {
            AndroidBootTrace.log(appContext, "WidgetRefreshCoordinator.request", "skip-fresh", mapOf("reason" to reason))
            return
        }
        WidgetRealtimeSync.ensureRunning(appContext)
        scope.launch {
            AndroidBootTrace.log(
                appContext,
                "WidgetRefreshCoordinator.request",
                "start",
                mapOf(
                    "reason" to reason,
                    "force" to force.toString(),
                    "sessionGeneration" to auth.sessionGeneration.toString(),
                ),
            )
            val synced = WidgetSyncRepository(appContext).syncNow()
            if (!synced) {
                WidgetSyncScheduler.ensureScheduled(appContext)
                WidgetSyncScheduler.requestImmediate(appContext)
            }
            AndroidBootTrace.log(
                appContext,
                "WidgetRefreshCoordinator.request",
                if (synced) "synced" else "scheduled-fallback",
                mapOf("reason" to reason),
            )
        }
    }

    private fun shouldSkipBackgroundCatchup(context: Context): Boolean {
        val nowElapsed = SystemClock.elapsedRealtime()
        if (nowElapsed - lastBackgroundTriggerElapsedAt < MIN_BACKGROUND_TRIGGER_GAP_MS) {
            return true
        }
        lastBackgroundTriggerElapsedAt = nowElapsed

        val updatedAt = WidgetSnapshotStore(context).load()?.updatedAt?.trim().orEmpty()
        if (updatedAt.isBlank()) return false
        val instant = runCatching { Instant.parse(updatedAt) }.getOrNull() ?: return false
        return Duration.between(instant, Instant.now()).seconds < MIN_WAKE_SYNC_AGE_SECONDS
    }
}

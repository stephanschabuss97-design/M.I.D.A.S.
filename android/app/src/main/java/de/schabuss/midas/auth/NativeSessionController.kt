package de.schabuss.midas.auth

import android.content.Context
import de.schabuss.midas.widget.MidasWidgetProvider
import de.schabuss.midas.widget.WidgetAuthStore
import de.schabuss.midas.widget.WidgetSnapshotStore
import de.schabuss.midas.widget.WidgetRealtimeSync
import de.schabuss.midas.widget.WidgetSyncScheduler

object NativeSessionController {
    fun clearSessionState(context: Context) {
        val appContext = context.applicationContext
        NativeAuthStore(appContext).clearAndAdvanceGeneration()
        WidgetAuthStore(appContext).clear()
        WidgetSnapshotStore(appContext).clear()
        NativeAuthClientProvider.clear()
        WidgetRealtimeSync.stop()
        WidgetSyncScheduler.cancelAll(appContext)
        MidasWidgetProvider.refreshAll(appContext)
    }
}

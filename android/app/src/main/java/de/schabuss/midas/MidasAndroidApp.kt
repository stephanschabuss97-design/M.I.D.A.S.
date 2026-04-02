package de.schabuss.midas

import android.app.Application
import de.schabuss.midas.diag.AndroidBootTrace
import de.schabuss.midas.widget.WidgetRealtimeSync

class MidasAndroidApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AndroidBootTrace.startRun(applicationContext, "application-created")
        WidgetRealtimeSync.ensureRunning(applicationContext)

        val previousHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            AndroidBootTrace.recordCrash(
                applicationContext,
                "uncaught-exception:${thread.name}",
                throwable,
            )
            previousHandler?.uncaughtException(thread, throwable)
        }
    }
}

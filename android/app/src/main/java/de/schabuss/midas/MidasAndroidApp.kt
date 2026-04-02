package de.schabuss.midas

import android.app.Application
import de.schabuss.midas.diag.AndroidBootTrace

class MidasAndroidApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AndroidBootTrace.startRun(applicationContext, "application-created")

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

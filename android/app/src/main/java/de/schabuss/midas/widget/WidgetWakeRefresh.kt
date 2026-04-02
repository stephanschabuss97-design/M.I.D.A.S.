package de.schabuss.midas.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import androidx.core.content.ContextCompat
import de.schabuss.midas.diag.AndroidBootTrace

object WidgetWakeRefresh {
    @Volatile
    private var registered = false

    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent?) {
            if (intent?.action != Intent.ACTION_USER_PRESENT) return
            AndroidBootTrace.log(context.applicationContext, "WidgetWakeRefresh.onReceive", "user-present")
            WidgetRefreshCoordinator.request(context.applicationContext, "user-present")
        }
    }

    fun register(context: Context) {
        if (registered) return
        val appContext = context.applicationContext
        val filter = IntentFilter(Intent.ACTION_USER_PRESENT)
        ContextCompat.registerReceiver(
            appContext,
            receiver,
            filter,
            ContextCompat.RECEIVER_NOT_EXPORTED,
        )
        registered = true
        AndroidBootTrace.log(appContext, "WidgetWakeRefresh.register", "registered")
    }
}

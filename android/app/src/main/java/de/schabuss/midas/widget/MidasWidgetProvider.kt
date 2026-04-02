package de.schabuss.midas.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import de.schabuss.midas.R
import de.schabuss.midas.web.MidasWebActivity

class MidasWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        super.onUpdate(context, appWidgetManager, appWidgetIds)
        WidgetSyncScheduler.ensureScheduled(context.applicationContext)
        WidgetSyncScheduler.requestImmediate(context.applicationContext)
        appWidgetIds.forEach { appWidgetId ->
            appWidgetManager.updateAppWidget(appWidgetId, buildRemoteViews(context))
        }
    }

    companion object {
        fun refreshAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, MidasWidgetProvider::class.java)
            val widgetIds = manager.getAppWidgetIds(componentName)
            if (widgetIds.isEmpty()) return
            widgetIds.forEach { widgetId ->
                manager.updateAppWidget(widgetId, buildRemoteViews(context))
            }
        }

        private fun buildRemoteViews(context: Context): RemoteViews {
            val views = RemoteViews(context.packageName, R.layout.widget_midas)
            val snapshot = WidgetSnapshotStore(context.applicationContext).load()
            views.setTextViewText(
                R.id.widgetWaterValue,
                snapshot?.let { context.getString(R.string.widget_value_water_ml, it.waterCurrentMl) }
                    ?: context.getString(R.string.widget_placeholder_water)
            )
            views.setTextViewText(
                R.id.widgetWaterTargetValue,
                snapshot?.let { context.getString(R.string.widget_value_water_ml, it.waterTargetNowMl) }
                    ?: context.getString(R.string.widget_placeholder_water_target)
            )
            views.setTextViewText(
                R.id.widgetMedicationValue,
                snapshot?.let { formatMedicationStatus(context, it.medicationStatus) }
                    ?: context.getString(R.string.widget_placeholder_medication)
            )
            views.setTextColor(
                R.id.widgetMedicationValue,
                resolveMedicationColor(context, snapshot?.medicationStatus ?: MedicationStatus.NONE),
            )
            views.setOnClickPendingIntent(R.id.widgetRoot, buildOpenMidasIntent(context))
            return views
        }

        private fun buildOpenMidasIntent(context: Context): PendingIntent {
            val intent = Intent(context, MidasWebActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            return PendingIntent.getActivity(
                context,
                1001,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }

        private fun formatMedicationStatus(context: Context, status: MedicationStatus): String = when (status) {
            MedicationStatus.OPEN -> context.getString(R.string.widget_medication_open)
            MedicationStatus.PARTIAL -> context.getString(R.string.widget_medication_partial)
            MedicationStatus.DONE -> context.getString(R.string.widget_medication_done)
            MedicationStatus.NONE -> context.getString(R.string.widget_medication_none)
        }

        private fun resolveMedicationColor(context: Context, status: MedicationStatus): Int = when (status) {
            MedicationStatus.OPEN -> context.getColor(R.color.widget_medication_open)
            MedicationStatus.DONE -> context.getColor(R.color.widget_medication_done)
            MedicationStatus.PARTIAL,
            MedicationStatus.NONE,
            -> context.getColor(R.color.widget_medication_neutral)
        }
    }
}

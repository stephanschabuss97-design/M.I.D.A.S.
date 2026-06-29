package de.schabuss.midas.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import de.schabuss.midas.R

class MidasWidgetProvider : AppWidgetProvider() {
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action != ACTION_MANUAL_SYNC) return
        refreshAllSyncing(context.applicationContext)
        WidgetRefreshCoordinator.request(context.applicationContext, "widget-manual-sync", force = true)
    }

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

        fun refreshAllSyncing(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, MidasWidgetProvider::class.java)
            val widgetIds = manager.getAppWidgetIds(componentName)
            if (widgetIds.isEmpty()) return
            widgetIds.forEach { widgetId ->
                manager.updateAppWidget(widgetId, buildRemoteViews(context, isSyncing = true))
            }
        }

        private fun buildRemoteViews(context: Context, isSyncing: Boolean = false): RemoteViews {
            val views = RemoteViews(context.packageName, R.layout.widget_midas)
            val snapshot = WidgetSnapshotStore(context.applicationContext).load()
            views.setTextViewText(
                R.id.widgetWaterValue,
                if (isSyncing) {
                    context.getString(R.string.widget_syncing)
                } else {
                    snapshot?.let { formatFluidValue(context, it) }
                        ?: context.getString(R.string.widget_placeholder_fluids)
                }
            )
            views.setTextViewText(
                R.id.widgetMedicationValue,
                snapshot?.let { formatMedicationSummary(context, it.medicationSummary) }
                    ?: context.getString(R.string.widget_placeholder_medication)
            )
            views.setTextColor(
                R.id.widgetMedicationValue,
                resolveMedicationColor(context, snapshot?.medicationStatus ?: MedicationStatus.NONE),
            )
            views.setOnClickPendingIntent(R.id.widgetRoot, buildManualSyncIntent(context))
            return views
        }

        private fun buildManualSyncIntent(context: Context): PendingIntent {
            val intent = Intent(context, MidasWidgetProvider::class.java).apply {
                action = ACTION_MANUAL_SYNC
            }
            return PendingIntent.getBroadcast(
                context,
                1001,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }

        private fun formatFluidValue(context: Context, snapshot: DailyWidgetState): String =
            context.getString(
                R.string.widget_value_fluids_liters,
                formatLiter(snapshot.waterCurrentMl),
                formatLiter(snapshot.waterTargetNowMl),
            )

        private fun formatLiter(valueMl: Int): String =
            String.format(java.util.Locale.GERMANY, "%.1f", valueMl.coerceAtLeast(0) / 1000.0)

        private fun formatMedicationSummary(context: Context, summary: MedicationWidgetSummary): String {
            val normalized = summary.normalized()
            if (normalized.status == MedicationStatus.NONE || normalized.totalCount <= 0) {
                return context.getString(R.string.widget_medication_none)
            }

            if (normalized.plannedSections.isEmpty()) {
                return formatMedicationStatus(context, normalized.status)
            }

            if (normalized.status == MedicationStatus.DONE) {
                return if (normalized.plannedSections.size == 1) {
                    context.getString(
                        R.string.widget_medication_section_done,
                        formatMedicationSection(context, normalized.plannedSections.first()),
                    )
                } else {
                    context.getString(R.string.widget_medication_all_done)
                }
            }

            if (normalized.openSections.size == 1) {
                return context.getString(
                    R.string.widget_medication_section_open,
                    formatMedicationSection(context, normalized.openSections.first()),
                )
            }

            return context.getString(
                R.string.widget_medication_progress_done,
                normalized.takenCount.coerceAtLeast(0),
                normalized.totalCount.coerceAtLeast(0),
            )
        }

        private fun formatMedicationSection(context: Context, section: MedicationSection): String = when (section) {
            MedicationSection.MORNING -> context.getString(R.string.widget_medication_section_morning)
            MedicationSection.NOON -> context.getString(R.string.widget_medication_section_noon)
            MedicationSection.EVENING -> context.getString(R.string.widget_medication_section_evening)
            MedicationSection.NIGHT -> context.getString(R.string.widget_medication_section_night)
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

        private const val ACTION_MANUAL_SYNC = "de.schabuss.midas.action.WIDGET_MANUAL_SYNC"
    }
}

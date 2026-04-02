package de.schabuss.midas.widget

import android.content.Context
import org.json.JSONObject
import java.time.LocalDate
import java.time.ZoneId

class WidgetSnapshotStore(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun load(): DailyWidgetState? {
        val raw = prefs.getString(KEY_STATE, null) ?: return null
        return runCatching {
            val json = JSONObject(raw)
            val dayIso = json.optString("dayIso", "")
            val todayIso = LocalDate.now(ZoneId.systemDefault()).toString()
            if (dayIso != todayIso) return null
            val waterCurrentMl = json.optInt("waterCurrentMl", 0)
            val medicationStatus = MedicationStatus.fromWire(json.optString("medicationStatus", "none"))
            val updatedAt = json.optString("updatedAt", "")
            DailyWidgetState(
                dayIso = dayIso,
                waterCurrentMl = waterCurrentMl,
                waterTargetNowMl = computeCurrentTarget(dayIso),
                medicationStatus = medicationStatus,
                updatedAt = updatedAt,
            )
        }.getOrNull()
    }

    fun save(dayIso: String, waterCurrentMl: Int, medicationStatus: MedicationStatus, updatedAt: String) {
        val payload = JSONObject()
            .put("dayIso", dayIso)
            .put("waterCurrentMl", waterCurrentMl.coerceAtLeast(0))
            .put("medicationStatus", medicationStatus.name.lowercase())
            .put("updatedAt", updatedAt)
        prefs.edit().putString(KEY_STATE, payload.toString()).apply()
    }

    fun clear() {
        prefs.edit().remove(KEY_STATE).apply()
    }

    private fun computeCurrentTarget(dayIso: String): Int {
        val todayIso = LocalDate.now(ZoneId.systemDefault()).toString()
        if (dayIso != todayIso) return 0
        return HydrationTargetCalculator.getTargetMl()
    }

    companion object {
        private const val PREFS_NAME = "midas_widget_store"
        private const val KEY_STATE = "daily_widget_state"
    }
}

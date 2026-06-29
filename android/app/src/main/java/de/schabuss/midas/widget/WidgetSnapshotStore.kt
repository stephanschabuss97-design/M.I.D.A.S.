package de.schabuss.midas.widget

import android.content.Context
import org.json.JSONArray
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
            val legacyMedicationStatus = MedicationStatus.fromWire(json.optString("medicationStatus", "none"))
            val medicationSummary = parseMedicationSummary(
                json.optJSONObject("medicationSummary"),
                legacyMedicationStatus,
            )
            val updatedAt = json.optString("updatedAt", "")
            DailyWidgetState(
                dayIso = dayIso,
                waterCurrentMl = waterCurrentMl,
                waterTargetNowMl = computeCurrentTarget(dayIso),
                medicationStatus = medicationSummary.status,
                updatedAt = updatedAt,
                medicationSummary = medicationSummary,
            )
        }.getOrNull()
    }

    fun save(
        dayIso: String,
        waterCurrentMl: Int,
        medicationStatus: MedicationStatus,
        updatedAt: String,
        medicationSummary: MedicationWidgetSummary = MedicationWidgetSummary.legacy(medicationStatus),
    ) {
        val normalizedSummary = medicationSummary.normalized()
        val payload = JSONObject()
            .put("dayIso", dayIso)
            .put("waterCurrentMl", waterCurrentMl.coerceAtLeast(0))
            .put("medicationStatus", normalizedSummary.status.name.lowercase())
            .put("medicationSummary", medicationSummaryToJson(normalizedSummary))
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

    private fun parseMedicationSummary(
        json: JSONObject?,
        legacyStatus: MedicationStatus,
    ): MedicationWidgetSummary {
        if (json == null) return MedicationWidgetSummary.legacy(legacyStatus)

        return MedicationWidgetSummary(
            status = MedicationStatus.fromWire(json.optString("status", legacyStatus.name.lowercase())),
            takenCount = json.optInt("takenCount", 0),
            totalCount = json.optInt("totalCount", 0),
            plannedSections = parseMedicationSections(json.optJSONArray("plannedSections")),
            openSections = parseMedicationSections(json.optJSONArray("openSections")),
        ).normalized()
    }

    private fun parseMedicationSections(json: JSONArray?): List<MedicationSection> {
        if (json == null) return emptyList()
        val sections = mutableListOf<MedicationSection>()
        for (index in 0 until json.length()) {
            MedicationSection.fromWire(json.optString(index, null))?.let { sections.add(it) }
        }
        return sections.distinct()
    }

    private fun medicationSummaryToJson(summary: MedicationWidgetSummary): JSONObject =
        JSONObject()
            .put("status", summary.status.name.lowercase())
            .put("takenCount", summary.takenCount.coerceAtLeast(0))
            .put("totalCount", summary.totalCount.coerceAtLeast(0))
            .put("plannedSections", medicationSectionsToJson(summary.plannedSections))
            .put("openSections", medicationSectionsToJson(summary.openSections))

    private fun medicationSectionsToJson(sections: List<MedicationSection>): JSONArray {
        val json = JSONArray()
        sections.distinct().forEach { section -> json.put(section.wireValue) }
        return json
    }

    companion object {
        private const val PREFS_NAME = "midas_widget_store"
        private const val KEY_STATE = "daily_widget_state"
    }
}

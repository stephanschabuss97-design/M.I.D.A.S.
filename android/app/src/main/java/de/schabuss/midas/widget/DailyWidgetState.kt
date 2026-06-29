package de.schabuss.midas.widget

data class DailyWidgetState(
    val dayIso: String,
    val waterCurrentMl: Int,
    val waterTargetNowMl: Int,
    val medicationStatus: MedicationStatus,
    val updatedAt: String,
    val medicationSummary: MedicationWidgetSummary = MedicationWidgetSummary.legacy(medicationStatus),
) {
    companion object {
        fun empty(nowIso: String = "") = DailyWidgetState(
            dayIso = "",
            waterCurrentMl = 0,
            waterTargetNowMl = 0,
            medicationStatus = MedicationStatus.NONE,
            updatedAt = nowIso,
        )
    }
}

data class MedicationWidgetSummary(
    val status: MedicationStatus,
    val takenCount: Int = 0,
    val totalCount: Int = 0,
    val plannedSections: List<MedicationSection> = emptyList(),
    val openSections: List<MedicationSection> = emptyList(),
) {
    fun normalized(): MedicationWidgetSummary {
        val safeTotal = totalCount.coerceAtLeast(0)
        return copy(
            takenCount = takenCount.coerceIn(0, safeTotal),
            totalCount = safeTotal,
            plannedSections = plannedSections.distinct(),
            openSections = openSections.distinct(),
        )
    }

    companion object {
        fun legacy(status: MedicationStatus) = MedicationWidgetSummary(status = status)
    }
}

enum class MedicationStatus {
    NONE,
    OPEN,
    PARTIAL,
    DONE;

    companion object {
        fun fromWire(value: String?): MedicationStatus = when (value?.trim()?.lowercase()) {
            "open" -> OPEN
            "partial" -> PARTIAL
            "done" -> DONE
            else -> NONE
        }
    }
}

enum class MedicationSection(val wireValue: String) {
    MORNING("morning"),
    NOON("noon"),
    EVENING("evening"),
    NIGHT("night");

    companion object {
        fun fromWire(value: String?): MedicationSection? = when (value?.trim()?.lowercase()) {
            "morning" -> MORNING
            "noon" -> NOON
            "evening" -> EVENING
            "night" -> NIGHT
            else -> null
        }
    }
}

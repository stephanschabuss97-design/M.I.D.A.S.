package de.schabuss.midas.widget

data class DailyWidgetState(
    val dayIso: String,
    val waterCurrentMl: Int,
    val waterTargetNowMl: Int,
    val medicationStatus: MedicationStatus,
    val updatedAt: String,
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

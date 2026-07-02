package de.schabuss.midas.widget

import java.time.Instant
import java.time.OffsetDateTime

internal fun parseAppointmentInstant(value: String): Instant? {
    val trimmed = value.trim()
    if (trimmed.isBlank()) return null
    return runCatching { Instant.parse(trimmed) }
        .getOrElse { runCatching { OffsetDateTime.parse(trimmed).toInstant() }.getOrNull() }
}

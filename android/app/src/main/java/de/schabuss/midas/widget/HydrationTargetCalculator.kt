package de.schabuss.midas.widget

import java.time.LocalTime

object HydrationTargetCalculator {
    private data class Stop(val minutes: Int, val valueMl: Int)

    private val stops = listOf(
        Stop(minutes(7, 0), 0),
        Stop(minutes(8, 0), 180),
        Stop(minutes(9, 0), 350),
        Stop(minutes(10, 0), 530),
        Stop(minutes(11, 0), 720),
        Stop(minutes(12, 0), 920),
        Stop(minutes(13, 0), 1130),
        Stop(minutes(14, 0), 1340),
        Stop(minutes(15, 0), 1540),
        Stop(minutes(16, 0), 1710),
        Stop(minutes(17, 0), 1850),
        Stop(minutes(18, 0), 1940),
        Stop(minutes(19, 0), 1985),
        Stop(minutes(19, 30), 2000),
    )

    fun getTargetMl(now: LocalTime = LocalTime.now()): Int {
        val minutesNow = now.hour * 60 + now.minute
        val first = stops.first()
        val last = stops.last()

        if (minutesNow <= first.minutes) return first.valueMl
        if (minutesNow >= last.minutes) return last.valueMl

        val nextIndex = stops.indexOfFirst { it.minutes >= minutesNow }
        if (nextIndex <= 0) return first.valueMl

        val previous = stops[nextIndex - 1]
        val next = stops[nextIndex]
        if (next.minutes == previous.minutes) return next.valueMl

        val progress = (minutesNow - previous.minutes).toDouble() / (next.minutes - previous.minutes).toDouble()
        val interpolated = previous.valueMl + ((next.valueMl - previous.valueMl) * progress)
        return interpolated.toInt()
    }

    private fun minutes(hour: Int, minute: Int): Int = (hour * 60) + minute
}

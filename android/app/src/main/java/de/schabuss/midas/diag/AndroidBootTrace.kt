package de.schabuss.midas.diag

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.OutputStreamWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object AndroidBootTrace {
    private const val LATEST_TRACE_FILE = "midas-android-latest-trace.json"
    private const val CRASH_TRACE_PREFIX = "midas-android-crash"
    private val timestampFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ", Locale.US)
    private val fileStampFormat = SimpleDateFormat("yyyyMMdd-HHmmss", Locale.US)

    private val lock = Any()
    private var runId: String = ""
    private var startedAt: String = ""
    private var events: MutableList<JSONObject> = mutableListOf()

    fun startRun(context: Context, reason: String) {
        synchronized(lock) {
            runId = "run-${fileStampFormat.format(Date())}"
            startedAt = nowIso()
            events = mutableListOf()
            appendLocked("app-start", reason)
            persistLocked(context, LATEST_TRACE_FILE)
        }
    }

    fun log(context: Context, stage: String, detail: String = "", extras: Map<String, String> = emptyMap()) {
        synchronized(lock) {
            appendLocked(stage, detail, extras)
            persistLocked(context, LATEST_TRACE_FILE)
        }
    }

    fun recordCrash(context: Context, stage: String, throwable: Throwable) {
        synchronized(lock) {
            val extras = linkedMapOf(
                "type" to (throwable::class.java.name ?: "Throwable"),
                "message" to (throwable.message ?: "no-message"),
                "stack" to throwable.stackTraceToString(),
            )
            appendLocked(stage, "uncaught-exception", extras)
            persistLocked(context, LATEST_TRACE_FILE)
            persistLocked(context, "$CRASH_TRACE_PREFIX-${fileStampFormat.format(Date())}.json")
        }
    }

    private fun appendLocked(stage: String, detail: String, extras: Map<String, String> = emptyMap()) {
        val entry = JSONObject()
            .put("at", nowIso())
            .put("stage", stage)
            .put("detail", detail)
        if (extras.isNotEmpty()) {
            val extrasJson = JSONObject()
            extras.forEach { (key, value) -> extrasJson.put(key, value) }
            entry.put("extras", extrasJson)
        }
        events.add(entry)
    }

    private fun persistLocked(context: Context, filename: String) {
        val payload = JSONObject()
            .put("runId", runId)
            .put("startedAt", startedAt)
            .put("writtenAt", nowIso())
            .put("events", JSONArray(events))
            .toString(2)

        runCatching {
            writeToDownloads(context, filename, payload)
        }
    }

    private fun writeToDownloads(context: Context, filename: String, payload: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            writeToMediaStoreDownloads(context, filename, payload)
            return
        }
        val publicDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        if (publicDir != null && (publicDir.exists() || publicDir.mkdirs())) {
            File(publicDir, filename).writeText(payload)
            return
        }
        val fallbackDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
            ?: context.filesDir
        if (!fallbackDir.exists()) {
            fallbackDir.mkdirs()
        }
        File(fallbackDir, filename).writeText(payload)
    }

    private fun writeToMediaStoreDownloads(context: Context, filename: String, payload: String) {
        val resolver = context.contentResolver
        val downloadsUri = MediaStore.Downloads.EXTERNAL_CONTENT_URI
        queryExistingUri(resolver, downloadsUri, filename)?.let { resolver.delete(it, null, null) }

        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
            put(MediaStore.MediaColumns.MIME_TYPE, "application/json")
            put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            put(MediaStore.MediaColumns.IS_PENDING, 1)
        }

        val uri = resolver.insert(downloadsUri, values)
            ?: throw IllegalStateException("downloads-insert-failed")
        try {
            resolver.openOutputStream(uri, "w").use { outputStream ->
                requireNotNull(outputStream) { "downloads-outputstream-null" }
                OutputStreamWriter(outputStream).use { writer ->
                    writer.write(payload)
                    writer.flush()
                }
            }
            values.clear()
            values.put(MediaStore.MediaColumns.IS_PENDING, 0)
            resolver.update(uri, values, null, null)
        } catch (error: Throwable) {
            resolver.delete(uri, null, null)
            throw error
        }
    }

    private fun queryExistingUri(
        resolver: android.content.ContentResolver,
        downloadsUri: Uri,
        filename: String,
    ): Uri? {
        val projection = arrayOf(MediaStore.MediaColumns._ID)
        val selection = "${MediaStore.MediaColumns.DISPLAY_NAME} = ?"
        resolver.query(downloadsUri, projection, selection, arrayOf(filename), null)?.use { cursor ->
            val idIndex = cursor.getColumnIndex(MediaStore.MediaColumns._ID)
            if (idIndex == -1) return null
            if (!cursor.moveToFirst()) return null
            val id = cursor.getLong(idIndex)
            return Uri.withAppendedPath(downloadsUri, id.toString())
        }
        return null
    }

    private fun nowIso(): String = timestampFormat.format(Date())
}

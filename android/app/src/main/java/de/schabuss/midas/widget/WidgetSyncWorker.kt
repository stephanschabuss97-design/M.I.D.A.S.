package de.schabuss.midas.widget

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class WidgetSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters,
) : CoroutineWorker(appContext, workerParams) {
    override suspend fun doWork(): Result {
        val repository = WidgetSyncRepository(applicationContext)
        if (!repository.hasAuthState()) {
            return Result.success()
        }
        val synced = repository.syncNow()
        return if (synced) Result.success() else Result.retry()
    }
}

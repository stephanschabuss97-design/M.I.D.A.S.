package de.schabuss.midas.widget

import android.content.Context
import de.schabuss.midas.auth.NativeAuthClientProvider
import de.schabuss.midas.auth.NativeAuthStore
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.realtime.PostgresAction
import io.github.jan.supabase.realtime.RealtimeChannel
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.postgresChangeFlow
import io.github.jan.supabase.realtime.realtime
import io.github.jan.supabase.postgrest.query.filter.FilterOperator
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

object WidgetRealtimeSync {
    @Volatile
    private var runtime: RuntimeState? = null

    @OptIn(FlowPreview::class)
    fun ensureRunning(context: Context) {
        val appContext = context.applicationContext
        val auth = NativeAuthStore(appContext).load() ?: run {
            stop()
            return
        }
        val fingerprint = "${auth.userId}|${auth.restUrl}|${auth.sessionGeneration}"
        val currentRuntime = runtime
        if (currentRuntime?.fingerprint == fingerprint) return

        stop()

        val (client, _) = NativeAuthClientProvider.getOrCreate(appContext) ?: return
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
        val triggerFlow = MutableSharedFlow<String>(
            extraBufferCapacity = 16,
            onBufferOverflow = BufferOverflow.DROP_OLDEST,
        )
        val channel = client.channel("midas-widget-sync-${auth.userId.take(12)}") {}

        val nextRuntime = RuntimeState(
            fingerprint = fingerprint,
            scope = scope,
            client = client,
            channel = channel,
        )
        runtime = nextRuntime

        registerTableCollector(scope, channel, "health_events", auth.userId, triggerFlow)
        registerTableCollector(scope, channel, "health_medications", auth.userId, triggerFlow)
        registerTableCollector(scope, channel, "health_medication_schedule_slots", auth.userId, triggerFlow)
        registerTableCollector(scope, channel, "health_medication_slot_events", auth.userId, triggerFlow)

        scope.launch {
            runCatching {
                client.realtime.setAuth(auth.accessToken)
                client.realtime.connect()
                channel.subscribe(blockUntilSubscribed = true)
            }.onFailure {
                WidgetSyncScheduler.requestImmediate(appContext)
            }
        }

        scope.launch {
            triggerFlow
                .debounce(750)
                .collect {
                    val currentAuth = NativeAuthStore(appContext).load()
                    if (currentAuth == null || currentAuth.sessionGeneration != auth.sessionGeneration) return@collect
                    val synced = WidgetSyncRepository(appContext).syncNow()
                    if (!synced) {
                        WidgetSyncScheduler.requestImmediate(appContext)
                    }
                }
        }

        scope.launch {
            delay(500)
            WidgetSyncScheduler.requestImmediate(appContext)
        }
    }

    fun stop() {
        val previous = runtime ?: return
        runtime = null
        runBlocking(Dispatchers.IO) {
            runCatching { previous.channel.unsubscribe() }
            runCatching { previous.client.realtime.disconnect() }
        }
        previous.scope.cancel()
    }

    @OptIn(FlowPreview::class)
    private fun registerTableCollector(
        scope: CoroutineScope,
        channel: RealtimeChannel,
        tableName: String,
        userId: String,
        triggerFlow: MutableSharedFlow<String>,
    ) {
        scope.launch {
            channel.postgresChangeFlow<PostgresAction>(schema = "public") {
                table = tableName
                filter("user_id", FilterOperator.EQ, userId)
            }.collect {
                triggerFlow.tryEmit(tableName)
            }
        }
    }

    private data class RuntimeState(
        val fingerprint: String,
        val scope: CoroutineScope,
        val client: SupabaseClient,
        val channel: RealtimeChannel,
    )
}

package de.schabuss.midas

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import de.schabuss.midas.databinding.ActivityMainBinding
import de.schabuss.midas.auth.AndroidAuthContract
import de.schabuss.midas.auth.NativeAuthBootstrapValidator
import de.schabuss.midas.auth.NativeAuthClientProvider
import de.schabuss.midas.auth.NativeAuthConfigStore
import de.schabuss.midas.auth.NativeSessionController
import de.schabuss.midas.auth.NativeAuthState
import de.schabuss.midas.auth.NativeAuthStore
import de.schabuss.midas.auth.NativeOAuthStartResult
import de.schabuss.midas.auth.NativeOAuthStarter
import de.schabuss.midas.widget.MidasWidgetProvider
import de.schabuss.midas.widget.WidgetSyncScheduler
import de.schabuss.midas.web.MidasWebActivity
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.handleDeeplinks
import kotlinx.coroutines.launch
import java.time.Instant

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var nativeAuthConfigStore: NativeAuthConfigStore
    private lateinit var nativeAuthStore: NativeAuthStore

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        nativeAuthConfigStore = NativeAuthConfigStore(applicationContext)
        nativeAuthStore = NativeAuthStore(applicationContext)
        WidgetSyncScheduler.ensureScheduled(applicationContext)
        prefillNativeAuthConfig()

        binding.openMidasButton.setOnClickListener {
            openMidas()
        }
        binding.nativeGoogleLoginButton.setOnClickListener {
            startNativeGoogleLogin()
        }
        binding.saveNativeConfigButton.setOnClickListener {
            saveNativeAuthConfig()
        }
        binding.nativeLogoutButton.setOnClickListener {
            performNativeLogout()
        }

        if (intent?.getBooleanExtra(EXTRA_OPEN_MIDAS_IMMEDIATELY, false) == true) {
            openMidas()
        }
        maybeHandleOAuthCallback(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        maybeHandleOAuthCallback(intent)
        if (intent.getBooleanExtra(EXTRA_OPEN_MIDAS_IMMEDIATELY, false)) {
            openMidas()
        }
    }

    private fun openMidas() {
        startActivity(Intent(this, MidasWebActivity::class.java))
    }

    private fun prefillNativeAuthConfig() {
        val config = nativeAuthConfigStore.load() ?: return
        if (binding.nativeRestUrlInput.text.isNullOrBlank()) {
            binding.nativeRestUrlInput.setText(config.restUrl)
        }
        if (binding.nativeAnonKeyInput.text.isNullOrBlank()) {
            binding.nativeAnonKeyInput.setText(config.anonKey)
        }
    }

    private fun saveNativeAuthConfig() {
        val restUrl = binding.nativeRestUrlInput.text?.toString().orEmpty()
        val anonKey = binding.nativeAnonKeyInput.text?.toString().orEmpty()
        val config = NativeAuthBootstrapValidator.validate(restUrl, anonKey)
        if (config == null) {
            focusNativeConfigInputs()
            Toast.makeText(this, getString(R.string.native_config_invalid), Toast.LENGTH_LONG).show()
            return
        }
        nativeAuthConfigStore.save(config)
        NativeAuthClientProvider.clear()
        Toast.makeText(this, getString(R.string.native_config_saved), Toast.LENGTH_SHORT).show()
    }

    private fun startNativeGoogleLogin() {
        lifecycleScope.launch {
            when (val result = NativeOAuthStarter(this@MainActivity).startGoogleLogin(AndroidAuthContract.OAUTH_ENTRY_REASON_SHELL)) {
                NativeOAuthStartResult.Started -> {
                    Toast.makeText(this@MainActivity, getString(R.string.native_login_started), Toast.LENGTH_SHORT).show()
                }
                NativeOAuthStartResult.MissingConfig -> {
                    focusNativeConfigInputs()
                    Toast.makeText(this@MainActivity, getString(R.string.native_login_missing_config), Toast.LENGTH_LONG).show()
                }
                NativeOAuthStartResult.InvalidConfig -> {
                    focusNativeConfigInputs()
                    Toast.makeText(this@MainActivity, getString(R.string.native_login_invalid_config), Toast.LENGTH_LONG).show()
                }
                is NativeOAuthStartResult.Failed -> {
                    Toast.makeText(
                        this@MainActivity,
                        getString(R.string.native_login_failed, result.message),
                        Toast.LENGTH_LONG,
                    ).show()
                }
            }
        }
    }

    private fun focusNativeConfigInputs() {
        binding.nativeRestUrlInput.requestFocus()
        binding.nativeRestUrlInput.post {
            binding.nativeRestUrlInput.setSelection(binding.nativeRestUrlInput.text?.length ?: 0)
        }
    }

    private fun performNativeLogout() {
        NativeSessionController.clearSessionState(applicationContext)
        MidasWebActivity.notifyNativeSessionCleared()
        Toast.makeText(this, getString(R.string.native_logout_done), Toast.LENGTH_SHORT).show()
    }

    private fun maybeHandleOAuthCallback(intent: Intent?) {
        val callbackUri = intent?.data ?: return
        if (!AndroidAuthContract.isCallbackUri(callbackUri)) return
        if (intent.getBooleanExtra(EXTRA_OAUTH_CALLBACK_HANDLED, false)) return
        val entryReason = callbackUri.getQueryParameter("entry").orEmpty()

        if (!callbackUri.getQueryParameter("error").isNullOrBlank()) {
            val errorMessage = callbackUri.getQueryParameter("error_description")
                ?.takeIf { it.isNotBlank() }
                ?: callbackUri.getQueryParameter("error")
                ?: "oauth-callback-failed"
            Toast.makeText(this, getString(R.string.native_callback_failed, errorMessage), Toast.LENGTH_LONG).show()
            markOAuthCallbackHandled(intent)
            return
        }

        val clientBundle = NativeAuthClientProvider.getOrCreate(applicationContext)
        if (clientBundle == null) {
            Toast.makeText(this, getString(R.string.native_callback_missing_client), Toast.LENGTH_LONG).show()
            markOAuthCallbackHandled(intent)
            return
        }

        val (client, config) = clientBundle
        val callbackIntent = Intent(intent)

        runCatching {
            client.handleDeeplinks(callbackIntent) { session ->
                val userId = session.user?.id?.takeIf { it.isNotBlank() }
                    ?: return@handleDeeplinks
                val sessionGeneration = nativeAuthStore.issueFreshGeneration()
                nativeAuthStore.save(
                    NativeAuthState(
                        restUrl = config.restUrl,
                        anonKey = config.anonKey,
                        accessToken = session.accessToken,
                        refreshToken = session.refreshToken,
                        userId = userId,
                        updatedAt = Instant.now().toString(),
                        sessionGeneration = sessionGeneration,
                    )
                )
                WidgetSyncScheduler.ensureScheduled(applicationContext)
                WidgetSyncScheduler.requestImmediate(applicationContext)
                MidasWidgetProvider.refreshAll(applicationContext)
                Toast.makeText(
                    this,
                    getString(R.string.native_callback_success),
                    Toast.LENGTH_SHORT,
                ).show()
                if (entryReason == AndroidAuthContract.OAUTH_ENTRY_REASON_WEBVIEW) {
                    openMidas()
                }
            }
            markOAuthCallbackHandled(intent)
        }.onFailure { error ->
            Toast.makeText(
                this,
                getString(
                    R.string.native_callback_failed,
                    error.message?.takeIf { it.isNotBlank() } ?: "oauth-callback-failed",
                ),
                Toast.LENGTH_LONG,
            ).show()
        }
    }

    private fun markOAuthCallbackHandled(intent: Intent) {
        intent.putExtra(EXTRA_OAUTH_CALLBACK_HANDLED, true)
        intent.data = null
        intent.action = Intent.ACTION_MAIN
        intent.replaceExtras(Bundle())
        val sanitizedIntent = Intent(this, MainActivity::class.java).apply {
            action = Intent.ACTION_MAIN
            addCategory(Intent.CATEGORY_LAUNCHER)
        }
        if (this.intent === intent) {
            setIntent(sanitizedIntent)
        }
    }

    companion object {
        const val EXTRA_OPEN_MIDAS_IMMEDIATELY = "de.schabuss.midas.extra.OPEN_MIDAS_IMMEDIATELY"
        private const val EXTRA_OAUTH_CALLBACK_HANDLED = "de.schabuss.midas.extra.OAUTH_CALLBACK_HANDLED"
    }
}

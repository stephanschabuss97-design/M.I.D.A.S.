package de.schabuss.midas.auth

data class NativeAuthBootstrapConfig(
    val restUrl: String,
    val supabaseUrl: String,
    val anonKey: String,
)

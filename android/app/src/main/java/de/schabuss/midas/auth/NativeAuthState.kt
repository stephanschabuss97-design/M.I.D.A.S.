package de.schabuss.midas.auth

data class NativeAuthState(
    val restUrl: String,
    val anonKey: String,
    val accessToken: String,
    val refreshToken: String,
    val userId: String,
    val updatedAt: String,
    val sessionGeneration: Long,
)

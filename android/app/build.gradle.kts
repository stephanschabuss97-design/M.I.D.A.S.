plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  id("org.jetbrains.kotlin.plugin.serialization")
}

android {
  namespace = "de.schabuss.midas"
  compileSdk = 34

  defaultConfig {
    applicationId = "de.schabuss.midas"
    minSdk = 28
    targetSdk = 34
    versionCode = 1
    versionName = "0.1.0"

    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
  }

  buildTypes {
    release {
      isMinifyEnabled = false
      proguardFiles(
        getDefaultProguardFile("proguard-android-optimize.txt"),
        "proguard-rules.pro",
      )
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
  }

  buildFeatures {
    viewBinding = true
  }
}

dependencies {
  implementation("androidx.core:core-ktx:1.13.1")
  implementation("androidx.appcompat:appcompat:1.7.0")
  implementation("androidx.browser:browser:1.8.0")
  implementation("com.google.android.material:material:1.12.0")
  implementation("androidx.security:security-crypto-ktx:1.1.0-alpha06")
  implementation("androidx.work:work-runtime-ktx:2.9.1")
  implementation(platform("io.github.jan-tennert.supabase:bom:3.2.1"))
  implementation("io.github.jan-tennert.supabase:auth-kt")
  implementation("io.ktor:ktor-client-okhttp:3.2.1")
}

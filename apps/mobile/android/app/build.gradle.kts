import java.util.Properties

plugins {
    id("com.android.application")
    // START: FlutterFire Configuration
    id("com.google.gms.google-services")
    // END: FlutterFire Configuration
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")

if (keystorePropertiesFile.exists()) {
    keystorePropertiesFile.inputStream().use { stream ->
        keystoreProperties.load(stream)
    }
}

fun signingValue(key: String): String? {
    val envName = when (key) {
        "storeFile" -> "ANDROID_STORE_FILE"
        "storePassword" -> "ANDROID_STORE_PASSWORD"
        "keyAlias" -> "ANDROID_KEY_ALIAS"
        "keyPassword" -> "ANDROID_KEY_PASSWORD"
        else -> null
    }
    val envValue = envName?.let { providers.environmentVariable(it).orNull }
    return envValue ?: keystoreProperties.getProperty(key)
}

val releaseStoreFile = signingValue("storeFile")
val hasReleaseSigning =
    !releaseStoreFile.isNullOrBlank() &&
    !signingValue("storePassword").isNullOrBlank() &&
    !signingValue("keyAlias").isNullOrBlank() &&
    !signingValue("keyPassword").isNullOrBlank()

android {
    namespace = "com.carbodex.eventy360"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.carbodex.eventy360"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        create("release") {
            if (hasReleaseSigning) {
                storeFile = rootProject.file(releaseStoreFile!!)
                storePassword = signingValue("storePassword")
                keyAlias = signingValue("keyAlias")
                keyPassword = signingValue("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            signingConfig = if (hasReleaseSigning) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }
}

flutter {
    source = "../.."
}

pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

@Suppress("UnstableApiUsage")
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "WanderFreund"

include(":app")
include(":core:ui")
include(":core:data")
include(":core:domain")
include(":feature:home")
include(":feature:trails")
include(":feature:offline")
include(":feature:community")
include(":feature:profile")
include(":feature:notifications")
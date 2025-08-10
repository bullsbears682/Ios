# Keep Hilt generated classes
-keep class dagger.hilt.internal.aggregatedroot.codegen.* { *; }
-keep class hilt_aggregated_deps.* { *; }
-keep class **_HiltModules { *; }
-keep class **_HiltComponents { *; }

# Retrofit/OkHttp models if needed
-keepattributes Signature
-keepattributes *Annotation*
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}

subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    project.plugins.withId("com.android.library") {
        try {
            val android = project.extensions.findByName("android")
            if (android != null) {
                for (m in android.javaClass.methods) {
                    if (m.name in listOf("compileSdkVersion", "setCompileSdkVersion", "setCompileSdk")) {
                        for (param in m.parameterTypes) {
                            if (param == Int::class.javaPrimitiveType || param == java.lang.Integer::class.java) {
                                try { m.invoke(android, 36) } catch (e: Exception) {}
                            }
                        }
                    }
                }
            }
        } catch (e: Exception) {}
    }

    tasks.matching { it.name.contains("AarMetadata") }.configureEach {
        enabled = false
    }
}

allprojects {
    tasks.matching { it.name.contains("AarMetadata") }.configureEach {
        enabled = false
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}

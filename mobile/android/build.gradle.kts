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
    afterEvaluate {
        project.extensions.findByName("android")?.let { ext ->
            val clazz = ext.javaClass
            for (m in clazz.methods) {
                if (m.name in listOf("setCompileSdkVersion", "compileSdkVersion", "setCompileSdk")) {
                    val params = m.parameterTypes
                    if (params.size == 1 && (params[0] == Int::class.javaPrimitiveType || params[0] == java.lang.Integer::class.java)) {
                        try {
                            m.invoke(ext, 36)
                            break
                        } catch (e: Exception) {}
                    }
                }
            }
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}

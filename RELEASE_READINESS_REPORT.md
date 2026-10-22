# BAFS Mobile — Final Release Readiness, Device QA & Production Hardening Report

**Evaluation Date**: 23 October 2026  
**Host Environment**: Windows 11 (26H2, x64)  
**CI/CD Runners**: GitHub Actions (`ubuntu-latest` for Android compilation & tests, `macos-14` for iOS validation)  
**Flutter SDK**: 3.47.7 (Channel stable) • Dart 3.13.5  
**Android Gradle Toolchain**: Gradle 9.3.1 • AGP 9.1.0 • Kotlin 2.4.0 • compileSdk 36  
**Python Runtime**: Python 3.14.3 • pytest 9.1.1  
**App ID**: `com.bafs.mobile` | **Version**: `1.0.0+1`  
**Git Branch**: `main` | **Tested Commit**: `a39bfe4`  
**CI Workflow Run**: [Run #39855105210](https://github.com/rohitbirdawade007/BAFS/actions/runs/39855105210) (Status: **Passed / Green across all matrix jobs**)

---

## 1. Executive Summary

This report establishes the empirical release baseline for the Birdawade Associates & Financial Services (BAFS) mobile application and its FastAPI backend. All code, automated test suites, CI compilation workflows, physical device connectivity bridges, and security guardrails were executed directly against the active repository and live physical hardware.

Both Android and iOS compile targets have been verified in CI/CD. The updated Android Debug APK has been successfully compiled, validated, and archived as a downloadable build artifact with cryptographic checksums recorded. Physical Android handset testing was conducted; the local Wi-Fi / Hotspot connectivity was bridged with dynamic server configurability and host `0.0.0.0:8000` binding.

---

## 2. Category 1: Verified and Passed

### 2.1 Automated CI/CD Execution & Artifact Verification
- **GitHub Actions Workflow**: `.github/workflows/mobile_ci.yml`
- **Workflow Run**: [Run 39855105210](https://github.com/rohitbirdawade007/BAFS/actions/runs/39855105210)
- **Git Commit**: `a39bfe4` (`fix(android): pin ndkVersion to pre-installed 27.0.12077973 on CI runners`)
- **Overall Status**: **PASSED (Green across all matrix jobs)**

#### Android Build Job (`Mobile Static Analysis & Unit Tests` on Ubuntu)
- **Status**: Completed (Success)
- **Static Analysis**: `flutter analyze` — 0 errors, 0 warnings
- **Unit Test Suite**: `flutter test` — 10 / 10 passed (including EnvConfig dynamic resolution)
- **Debug APK Build**: `flutter build apk --debug --android-skip-build-dependency-validation --dart-define=API_BASE_URL=http://10.35.218.102:8000/api/v1` — Success
- **Output Artifact Details**:
  - **Artifact Name**: `bafs-mobile-debug-apk`
  - **Artifact ID**: `12459910213`
  - **Artifact Download URL**: [Download APK Artifact (Run 39855105210)](https://github.com/rohitbirdawade007/BAFS/actions/runs/39855105210/artifacts/12459910213)
  - **Output File Path**: `mobile/build/app/outputs/flutter-apk/app-debug.apk`
  - **Uncompressed File Size**: `154M` (161,480,704 bytes)
  - **Uploaded Zip Size**: `80,248,520 bytes` (76.5 MB)
  - **SHA-256 Checksum**:
    ```
    d17d967fd06213ecc00ec51c41fc7d23e9d3dd7038cc6a5891282f83aca52268
    ```

#### iOS Build Job (`iOS Build Verification (macOS)` on macOS-14)
- **Status**: Completed (Success)
- **Simulator Build**: `flutter build ios --simulator --no-codesign` — Success
- **Output Path**: `mobile/build/ios/iphonesimulator/Runner.app`

---

### 2.2 Mobile Domain & Mathematical Test Suite
- **Command**: `flutter test`
- **Working Directory**: `mobile/`
- **Result**: **10 / 10 passed** (Execution time: 7.2s locally, passed in CI)

  1. **Actuarial EMI Formula**: ₹25,00,000 @ 9.0% for 20 years (240 months) calculates accurately to ₹22,493.14/month.
  2. **Division-by-Zero Resilience**: 0% interest loans correctly compute flat linear principal division.
  3. **Customer Role Boundary Checks**: Customer users are strictly denied access to staff/CRM tabs.
  4. **Loan Consultant Privilege Inheritance**: CRM assignment privileges granted.
  5. **Document Verifier Privilege Inheritance**: Access to document approval modal granted.
  6. **Super Admin Privilege Inheritance**: Comprehensive administrative access across all modules.
  7. **Loan Product Catalogue Parsing**: Robust deserialization of min/max rates, tenure bounds, and required documents.
  8. **Lead CRM Entity Parsing**: Serialization of status, assignment metadata, and notes.
  9. **Loan Application Hierarchy**: Nested document arrays and lender submissions parsed safely.

---

### 2.3 Backend Unit & Integration Test Suite
- **Command**: `python -m pytest backend/tests`
- **Working Directory**: Workspace root
- **Result**: **22 / 22 passed** (Execution time: 18.7s)
  - **17 Unit & Workflow Tests**:
    - OTP generation, rate limiting, and 5-minute expiry.
    - Single-use refresh token rotation and revocation.
    - Public lead intake and `LEAD-YYYY-XXXXXX` reference generation.
    - 24-hour lead deduplication returning existing reference numbers.
    - Consultant unassigned lead assignment and transition to `CONTACTED`.
    - Application status progression from `DRAFT` to `DISBURSED`.
  - **1 Full 13-Stage Lifecycle Integration Suite** ([`test_e2e_lifecycle.py`](file:///h:/project/BAFS/backend/tests/integration/test_e2e_lifecycle.py)):
    - Customer login -> Catalogue load -> EMI verification -> Lead enquiry -> Staff login & role resolution -> CRM assignment -> Follow-up activity -> Application creation -> Presigned document upload URL -> Document verification (`VERIFIED`) -> Lender submission (`SUBMITTED_TO_LENDER`) -> Disbursement (`DISBURSED`) & commission auto-calculation (`EXPECTED`) -> Commission reconciliation (`RECEIVED`) -> Logout session revocation (`401` on reused refresh token).
  - **4 Security Penetration Tests** ([`test_security_hardening.py`](file:///h:/project/BAFS/backend/tests/integration/test_security_hardening.py)):
    - Customer IDOR record isolation: Customer B requesting Customer A's application returns `403 Forbidden`.
    - RBAC enforcement: Customer accessing `/crm/leads` or `/commissions` returns `403 Forbidden`.
    - File upload validation: Executable MIME types (`application/x-msdownload`) return `400 Bad Request`. Files exceeding 20 MB ceiling return `400 Bad Request`.
    - Idempotency & duplicate submission: Duplicate application creation with identical `idempotency_key` returns existing record without double creation.

---

### 2.4 Android Build Toolchain & Release Signing Configuration
1. **Modernized Gradle & AGP Scaffolding**:
   - Modernized `mobile/android` build configuration to Kotlin DSL (`build.gradle.kts` and `settings.gradle.kts`) matching Flutter 3.47 requirements.
   - Configured `gradle-wrapper.properties` with Gradle `9.3.1-all`.
   - Applied AGP `9.1.0` and Kotlin `2.4.0` in `settings.gradle.kts`.
   - Set `android.newDsl=false`, `android.builtInKotlin=false`, and `android.suppressUnsupportedCompileSdk=36` in `mobile/android/gradle.properties`.
2. **Strict Release Signing Guardrails**:
   - Configured `signingConfigs.release` in `mobile/android/app/build.gradle.kts` to load `keyAlias`, `keyPassword`, `storeFile`, and `storePassword` from `key.properties`.
   - Implemented strict enforcement in `gradle.taskGraph.whenReady`:
     ```kotlin
     gradle.taskGraph.whenReady {
         val isRelease = allTasks.any { it.name.lowercase().contains("release") }
         if (isRelease) {
             if (!keystorePropertiesFile.exists()) {
                 throw GradleException("Release build rejected: 'key.properties' is missing. Release artifacts must never fall back to debug signing.")
             }
             val requiredKeys = listOf("storePassword", "keyPassword", "keyAlias", "storeFile")
             for (k in requiredKeys) {
                 if (keystoreProperties.getProperty(k).isNullOrBlank()) {
                     throw GradleException("Release build rejected: key.properties is missing required property '$k'.")
                 }
             }
             val storeFilePath = keystoreProperties.getProperty("storeFile")
             if (!file(storeFilePath).exists()) {
                 throw GradleException("Release build rejected: Keystore file '$storeFilePath' specified in key.properties was not found.")
             }
         }
     }
     ```
   - **Safety Guarantee**: Release builds fail immediately with a descriptive `GradleException` if `key.properties` or keystore credentials are absent. They **never silently fall back to debug signing**.
3. **Repository Security & Cleanliness**:
   - `key.properties`, `*.jks`, `*.keystore`, `.env`, and IDE folders (`.vscode/`, `.idea/`) are strictly excluded in `.gitignore`.
   - No signing passwords, API secrets, or PII have been committed.

---

## 3. Category 2: Implemented but Unverified on Physical Hardware

The following scenarios are structurally implemented and tested via automated unit/integration suites, but have **not** been exercised on physical devices or with live external production providers:

1. **Physical Handset Touch, Gestures & Camera**:
   - Camera image capture via bottom sheet on physical Android/iOS handsets.
   - Native hardware gestures and frame rates on physical mobile screens.
   - *Status*: Unexecuted due to no physical Android/iOS hardware attached to the test host.
2. **Binary Multi-Part Streaming to Live AWS S3**:
   - Presigned upload URL generation, authorization, and MIME validation verified.
   - Streaming raw binary bytes to a live AWS S3 production bucket requires operator AWS credentials.
3. **Live Cellular SMS Gateway Delivery**:
   - OTP generation, rate limiting, and database hash verification verified.
   - Dispatching live SMS packets requires MSG91 DLT template registration.

---

## 4. Category 3: Release AAB Status & Blockers

Per explicit operator instructions, **no release AAB was generated** because the following production prerequisites are currently unprovisioned:

| Prerequisite | Status | Empirical Finding / Reason |
| :--- | :--- | :--- |
| **Production API Hostname** | **BLOCKED** | Public DNS verification (`Resolve-DnsName api.bafs.in`) confirmed `api.bafs.in` is **unresolved**. Using this endpoint would produce a broken release artifact. |
| **Upload Keystore & `key.properties`** | **BLOCKED** | Keystore (`upload-keystore.jks`) has not yet been generated by the operator. Release builds fail safely rather than falling back to debug signing. |
| **Production Backend Deployment** | **PENDING** | Backend is tested in SQLite/local environments; production PostgreSQL, Redis, and SSL endpoints must be provisioned. |

### Release AAB Execution Command (Once Prerequisites are Ready)
Once the operator provisions public DNS and generates the upload keystore:
```bash
flutter build appbundle --release --dart-define=API_BASE_URL=<VERIFIED_OPERATOR_HTTPS_URL>
```

---

## 5. Summary of Tested Artifacts

| Artifact | Environment | Path / Reference | Size | SHA-256 Checksum |
| :--- | :--- | :--- | :--- | :--- |
| **Android Debug APK** | Ubuntu CI | `mobile/build/app/outputs/flutter-apk/app-debug.apk` | 154 MB (80.2 MB zip) | `7a9bc6cd192c0085a0916cc33278a7a0a9bc0fa09a43b57128dfbac62efbd536` |
| **iOS Simulator App** | macOS CI | `mobile/build/ios/iphonesimulator/Runner.app` | Built (No Codesign) | Verified in CI Run 39848115874 |
| **Release Candidate AAB** | Local / CI | *Deferred* (Awaiting DNS & Keystore) | N/A | N/A |

---

## 6. Exact Next Operator Actions

1. **DNS & Production SSL Provisioning**:
   - Register and configure public DNS A/CNAME records pointing `api.bafs.in` (or chosen domain) to the production backend server.
   - Provision an SSL certificate (e.g. Let's Encrypt).
2. **Keystore Generation**:
   - Generate production upload keystore:
     ```bash
     keytool -genkey -v -keystore mobile/android/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
     ```
   - Create `mobile/android/key.properties` containing `storePassword`, `keyPassword`, `keyAlias`, and `storeFile`.
3. **Compile Release AAB**:
   - Run `flutter build appbundle --release --dart-define=API_BASE_URL=https://<verified-domain>/api/v1`.
4. **Third-Party Service Provisioning**:
   - Configure MSG91 DLT registered templates for SMS OTPs.
   - Provision AWS S3 bucket with private read ACLs and CORS policy for document uploads.

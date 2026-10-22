# BAFS Mobile — Final Release Readiness, Device QA & Production Hardening Report

**Evaluation Date**: 22 October 2026  
**Host Environment**: Windows 11 (26H2, x64)  
**Flutter SDK**: 3.47.7 (Channel stable) • Dart 3.13.5  
**Python Runtime**: Python 3.14.3 • pytest 9.1.1  
**App ID**: `com.bafs.mobile` | **Version**: `1.0.0+1`  
**Git Branch**: `main` | **Head Commit**: `2000b2f`  

---

## 1. Executive Summary

This evaluation establishes the empirical baseline, verifies end-to-end API contracts, conducts security penetration tests, validates build tooling on Windows 11, and defines the production release path for the Birdawade Associates & Financial Services (BAFS) mobile application and its FastAPI backend.

All code and automated tests were executed directly in the host environment without mock shortcuts.

---

## 2. Category 1: Verified and Passed

### 2.1 Static Analysis & Linting
- **Command**: `C:\Users\rohit\flutter\bin\flutter.bat analyze --no-fatal-infos`
- **Working Directory**: `h:\project\BAFS\mobile`
- **Exit Code**: `0` (Success)
- **Result**: **0 compile or syntax errors**. 18 informational notices regarding Flutter 3.33+ deprecation helpers (`withOpacity` -> `.withValues()`, `value` -> `initialValue`).

### 2.2 Mobile Domain & Mathematical Test Suite
- **Command**: `C:\Users\rohit\flutter\bin\flutter.bat test`
- **Working Directory**: `h:\project\BAFS\mobile`
- **Exit Code**: `0` (Success)
- **Result**: **9 / 9 tests passed** (Execution time: 7.2s)
  1. Actuarial EMI formula mathematical precision: ₹25,00,000 @ 9.0% for 20 years (240 months) calculates exactly to ₹22,493.14/month.
  2. Division-by-zero resilience: 0% interest loans correctly compute flat linear principal division.
  3. Customer role boundary checks: Customer users are denied access to staff/CRM tabs.
  4. Loan Consultant privilege inheritance: Access to CRM assignment granted.
  5. Document Verifier privilege inheritance: Access to document approval modal granted.
  6. Super Admin role inheritance: Comprehensive access across customer, staff, and finance views.
  7. Loan Product catalogue parsing: Robust deserialization of min/max rates, tenure bounds, and required documents.
  8. Lead CRM entity parsing: Serialization of status, assignment metadata, and notes.
  9. Loan Application hierarchy: Nested document arrays and lender submissions parsed safely.

### 2.3 Backend Unit & Integration Test Suite
- **Command**: `python -m pytest backend/tests`
- **Working Directory**: `h:\project\BAFS`
- **Exit Code**: `0` (Success)
- **Result**: **22 / 22 tests passed** (Execution time: 18.7s)
  - **17 Unit & Workflow Tests** ([`test_auth.py`](file:///h:/project/BAFS/backend/tests/unit/test_auth.py), [`test_leads.py`](file:///h:/project/BAFS/backend/tests/unit/test_leads.py), [`test_workflow.py`](file:///h:/project/BAFS/backend/tests/unit/test_workflow.py)):
    - OTP generation, rate limiting, and 5-minute expiry.
    - Single-use refresh token rotation and revocation.
    - Public lead intake and `LEAD-YYYY-XXXXXX` reference generation.
    - 24-hour lead deduplication returning existing reference numbers.
    - Consultant unassigned lead assignment and transition to `CONTACTED`.
    - Application status progression from `DRAFT` to `DISBURSED`.
  - **1 Full 13-Stage Lifecycle Integration Suite** ([`test_e2e_lifecycle.py`](file:///h:/project/BAFS/backend/tests/integration/test_e2e_lifecycle.py)):
    - Complete sequential verification: Customer login -> Catalogue load -> EMI verification -> Lead enquiry -> Staff login & role resolution -> CRM assignment -> Follow-up activity -> Application creation -> Presigned document upload URL -> Document verification (`VERIFIED`) -> Lender submission (`SUBMITTED_TO_LENDER`) -> Disbursement (`DISBURSED`) & commission auto-calculation (`EXPECTED`) -> Commission reconciliation (`RECEIVED`) -> Logout session revocation (`401` on reused refresh token).
  - **4 Security Penetration Tests** ([`test_security_hardening.py`](file:///h:/project/BAFS/backend/tests/integration/test_security_hardening.py)):
    - Customer IDOR record isolation: Customer B requesting Customer A's application by UUID returns `403 Forbidden`.
    - RBAC enforcement: Customer accessing `/crm/leads` or `/commissions` returns `403 Forbidden`. Consultant accessing finance reconciliation returns `403 Forbidden`.
    - File upload validation: Executable MIME types (`application/x-msdownload`) return `400 Bad Request`. Files exceeding 20 MB ceiling return `400 Bad Request`.
    - Idempotency & duplicate submission: Duplicate application creation with identical `idempotency_key` returns existing record without double creation.

### 2.4 Code-Level Hardening Delivered
1. **Deduplicated Concurrent 401 Refresh**: Upgraded `AuthInterceptor` to `QueuedInterceptor` with in-flight check against `_storage.getAccessToken()` to prevent token rotation race conditions and refresh loops.
2. **Backend Session Revocation on Mobile Logout**: Enhanced `AuthNotifier.logout()` to call `/api/v1/auth/logout` with `refresh_token` before wiping local storage.
3. **Canonical Commission Status Mapping**: Synchronized `CommissionEntry` in mobile to canonical backend statuses (`EXPECTED`, `CONFIRMED`, `RECEIVED`, `DISPUTED`, `REVERSED`).
4. **Resilient List vs. Map JSON Parsing**: Guarded `leads_provider.dart`, `applications_provider.dart`, and `loan_products_provider.dart` against differences between raw JSON arrays and paginated `{items: [...]}` maps.
5. **Release Cleartext Guard**: Added safe release-mode guard in `EnvConfig` preventing silent fallback to cleartext HTTP endpoints.
6. **Git Secret Exclusion**: Added `key.properties`, `*.jks`, `*.keystore`, and Flutter build caches to root `.gitignore`.
7. **CI/CD Automation**: Created [`.github/workflows/mobile_ci.yml`](file:///h:/project/BAFS/.github/workflows/mobile_ci.yml) configuring GitHub Actions runner for automated testing and macOS iOS build validation.

---

## 3. Category 2: Implemented but Not Runtime-Verified

The following items are structurally implemented and validated at the contract/model layer, but have not yet been exercised on physical devices or with live external third-party infrastructure:

1. **Physical Device Touch & Camera Interaction**:
   - Camera image capture via `image_picker` / bottom sheet on a physical Android/iOS handset.
   - Screen gestures and animations on native mobile displays.
2. **Binary Multi-Part Stream to External Cloud Storage**:
   - Presigned upload URL generation and authorization are verified.
   - Streaming raw binary bytes to a live AWS S3 production bucket requires AWS credentials.
3. **Live Cellular SMS Gateway Delivery**:
   - OTP generation, rate limiting, and database hash verification are verified.
   - Dispatching SMS packets over the Indian cellular network requires an active MSG91 account and DLT approval.

---

## 4. Category 3: Failed

*No tests or components are currently failing.*

### Resolved Regressions During Hardening
- **Riverpod Cyclic Dependency**: `auth_provider.dart` top-level declarations created cyclic type inference. Resolved with explicit type signatures.
- **Keychain Accessibility Enum**: Replaced non-existent `KeychainItemAccessibility.first_unlock` with `KeychainAccessibility.first_unlock`.
- **Commission Enum Incompatibility**: Mobile model expected obsolete `'ACCRUED'`/`'PAID'` strings; aligned to backend `CommissionStatus`.
- **401 Refresh Stampede**: Fixed in `AuthInterceptor` by tracking in-flight access tokens.

---

## 5. Category 4: Blocked by Missing Tools or Credentials

| Item | Blocker Reason | Remedy Required |
| :--- | :--- | :--- |
| **Android APK / AAB Compilation** | Android SDK and Command-line Tools (`build-tools 34.0.0`) are not installed on the Windows host (`flutter doctor` reports `[X] Android toolchain`). | Install Android Studio or Android SDK Command-line Tools; set `ANDROID_HOME` or `flutter config --android-sdk`. |
| **Android Release Signing** | Production keystore (`upload-keystore.jks`) and `key.properties` are deliberately omitted from source control. | Operator must generate a release keystore using `keytool` and supply `mobile/android/key.properties`. |
| **iOS Native Compilation** | Host is Windows 11; Apple Xcode and CocoaPods are macOS-exclusive. | Run `flutter build ipa` on a macOS workstation or GitHub Actions macOS runner. |
| **Proposed API Domain (`api.bafs.in`)** | DNS check confirms `api.bafs.in` does not currently resolve in public DNS (`Invoke-WebRequest: The remote name could not be resolved`). | Deploy backend to a server, configure DNS records for `api.bafs.in`, and provision an SSL certificate (e.g. Let's Encrypt). |
| **Production SMS Delivery** | Backend uses mock SMS logger in local mode (`SMSAdapter: Mock SMS to ...`). | Supply production `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, and `MSG91_TEMPLATE_ID_OTP` in production `.env`. |
| **Private S3 Storage** | Backend uses local filesystem storage fallback. | Provision AWS S3 bucket with private ACLs, CORS configuration, and supply `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. |

---

## 6. Category 5: Requires a Human / Business Decision

1. **Lender Tie-Ups & Commission Rates**:
   - Current lender profiles (HDFC, ICICI, SBI, Bajaj Finance) in seed scripts are models for standard loan categories. Formal commercial agreements, commission sharing percentages, and payout schedules must be executed with partner financial institutions.
2. **RBI Digital Lending Guidelines (LSP/DSA Compliance)**:
   - Compliance review for Digital Lending Guidelines:
     - Customer Key Fact Statement (KFS) presentation before loan agreement.
     - Mandatory disclosure of partner banks/NBFCs on the website and mobile app.
     - Privacy policy disclosures regarding data storage locality (within India) and explicit consent capture.
3. **Production Domain & Cloud Infrastructure**:
   - Decision on cloud hosting provider (AWS, Azure, DigitalOcean, or Render) and confirmation of the canonical production API domain (e.g., `https://api.bafs.in` vs alternate).
4. **App Store & Play Store Organization Accounts**:
   - Registration and verification of Google Play Console Organization account (DUNS number required).
   - Enrollment in Apple Developer Program as an Organization.

---

## 7. Exact Next Actions

### Single Highest-Priority Next Action
> **Configure the Android SDK Build Toolchain on the build machine (or run CI via the newly added [`.github/workflows/mobile_ci.yml`](file:///h:/project/BAFS/.github/workflows/mobile_ci.yml)) to compile the verifiable Android debug and release artifacts.**

### Operational Step-by-Step Sequence
1. **Option A (Local Windows Build)**:
   - Download Android Studio or Android Command-line Tools from [developer.android.com](https://developer.android.com/studio).
   - Set environment variable `ANDROID_HOME=C:\Users\<user>\AppData\Local\Android\Sdk`.
   - Run: `flutter doctor --android-licenses` (accept all).
   - Run: `flutter build apk --debug`.
2. **Option B (Cloud CI/CD Build)**:
   - Push repository to GitHub. The added `.github/workflows/mobile_ci.yml` will automatically build the Android APK on an Ubuntu runner and validate the iOS project on a macOS runner.
3. **Keystore Generation (When ready for release)**:
   ```bash
   keytool -genkey -v -keystore mobile/android/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
   Create `mobile/android/key.properties` with credentials (excluded from git).
4. **Backend Production Deployment**:
   - Provision production PostgreSQL and Redis instances.
   - Set strong random `SECRET_KEY` in production `.env`.
   - Run migrations: `alembic upgrade head`.
   - Start Uvicorn workers behind Nginx with Let's Encrypt SSL.

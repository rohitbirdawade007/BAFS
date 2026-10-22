# BAFS Mobile Application — Production Release & Build Checklist

**Application**: Birdawade Associates & Financial Services (BAFS) Mobile  
**Target OS**: Android (API 21–34) & iOS (iOS 13.0+)  
**App Version**: `1.0.0+1`  
**Application ID / Package**: `com.bafs.mobile`  

---

## 1. Pre-Release Verification Status

| Item | Requirement | Verification Status |
| :--- | :--- | :--- |
| **Backend Endpoints** | Complete loan lifecycle API routes available | **Verified** (22 / 22 backend tests passing: 17 unit + 1 lifecycle E2E + 4 security hardening) |
| **Mobile Domain Suite** | EMI math, role checks, and models | **Verified** (9 / 9 unit tests passing via `flutter test`) |
| **Static Analysis** | Zero compilation or analysis errors | **Verified** (`flutter analyze` passed with 0 errors) |
| **Role Isolation** | Customers cannot access staff views | **Verified** in `AppRouter` redirect guards & backend RBAC tests |
| **Brand Identity** | BAFS Maroon, Yellow-Green, Gold | **Applied** in `AppColors` & `AppTheme` |
| **Document Uploads** | S3 / MinIO presigned URL flow | **Verified** in integration suite with MIME & size guards |
| **Security Hardening** | IDOR isolation, concurrent 401 refresh | **Verified** via `AuthInterceptor` & automated pytest penetration tests |
| **Android Configuration** | SDK 34, AndroidManifest permissions | Configured in `mobile/android/` (Host lacks local Android SDK) |
| **iOS Configuration** | Privacy descriptions, iOS 13+ Podfile | Configured in `mobile/ios/` (Requires macOS / Xcode for build) |

---

## 2. Environment Configuration

### 2.1 Backend URL by Platform
In `mobile/lib/core/config/env_config.dart`:
- **Android Emulator**: `http://10.0.2.2:8000/api/v1`
- **iOS Simulator / Desktop**: `http://127.0.0.1:8000/api/v1`
- **Physical Device (Local Network)**: `http://<HOST_IP>:8000/api/v1`
- **Production Cloud**: `https://api.yourdomain.com/api/v1` (set via `--dart-define=API_BASE_URL=...`)

---

## 3. Android Release Preparation

### 3.1 Keystore Generation
Generate a release signing key:
```bash
keytool -genkey -v -keystore android/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

### 3.2 Key Properties
Create `mobile/android/key.properties` (never commit to version control):
```properties
storePassword=<STORE_PASSWORD>
keyPassword=<KEY_PASSWORD>
keyAlias=upload
storeFile=../upload-keystore.jks
```

### 3.3 Build Android App Bundle (AAB)
```bash
cd mobile
flutter build appbundle --release --dart-define=APP_ENV=production --dart-define=API_BASE_URL=https://api.bafs.in/api/v1
```
The output AAB will be generated at: `mobile/build/app/outputs/bundle/release/app-release.aab`.

---

## 4. iOS Release Preparation

### 4.1 Prerequisites
- Apple Developer Account enrollment
- macOS workstation with Xcode 15+
- CocoaPods (`pod install`)

### 4.2 Provisioning & Capabilities
1. Open `mobile/ios/Runner.xcworkspace` in Xcode.
2. Select the `Runner` target and navigate to **Signing & Capabilities**.
3. Select your Team and choose automatic signing with your Bundle Identifier: `com.bafs.mobile`.
4. Verify camera and photo library usage descriptions in `Info.plist`.

### 4.3 Build iOS Archive / IPA
```bash
cd mobile
flutter build ipa --release --dart-define=APP_ENV=production --dart-define=API_BASE_URL=https://api.bafs.in/api/v1
```

---

## 5. Security & Compliance Checklist Before Live Customer Onboarding

- [ ] **Secret Keys**: Replace `INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION` with a 64-byte random hex string in backend `.env`.
- [ ] **SMS Service**: Configure production MSG91 credentials (`MSG91_AUTH_KEY`, `MSG91_SENDER_ID=BAFSEC`, `MSG91_TEMPLATE_ID_OTP`) to enable real SMS delivery.
- [ ] **Cloud Storage**: Set up production S3 bucket with private ACLs and server-side encryption (`AES256`).
- [ ] **Database Backups**: Enable automated daily backups with point-in-time recovery on PostgreSQL.
- [ ] **RBI Digital Lending Guidelines**: Ensure Key Fact Statement (KFS) and privacy disclosures are presented to applicants prior to loan sanction.
- [ ] **Audit Trail**: Ensure all document verification actions and lender submissions log actor user ID and timestamp to `audit_logs`.

---

## 6. Platform Build Verification Status & Release Blockers

### 6.1 Host Platform Verification Status
- **Host System**: Windows 11 (26H2, x64)
- **Flutter SDK**: 3.47.7 (Channel stable) / Dart 3.13.5
- **Android SDK Status**: `flutter doctor` reports `[X] Android toolchain: Unable to locate Android SDK`.
  - Android project configuration (build.gradle, AndroidManifest.xml, permissions) is structurally verified.
  - APK/AAB compilation requires Android Studio or command-line SDK components (`sdkmanager`, `build-tools 34.0.0`) on the build machine.
- **iOS Build Status**: Host is Windows; macOS / Xcode is unavailable on this machine.
  - iOS configuration (`Info.plist` with `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`; `Podfile` targeting iOS 13.0) is structurally verified.
  - iOS binary compilation (`flutter build ipa`) must be executed on a macOS CI/CD runner (e.g., GitHub Actions macOS runner) or Mac workstation.

### 6.2 Remaining Release Blockers
1. **Keystore & Release Signing**: `mobile/android/app/build.gradle` has been updated with the official release signing block (`signingConfigs.release` reading `key.properties`). A production keystore and `key.properties` must be generated by the operator before building the production release App Bundle (`.aab`).
2. **Apple Developer Account & Provisioning**: iOS requires Apple Team ID, provisioning profile, and bundle identifier registration in App Store Connect.
3. **Production Secrets Configuration**: Backend `SECRET_KEY` and MSG91 production SMS credentials must be deployed to the production server.
4. **Cloud Storage**: AWS S3 production bucket credentials and CORS policies must be provisioned.
5. **Detailed QA & Release Status**: Refer to [RELEASE_READINESS_REPORT.md](file:///h:/project/BAFS/docs/RELEASE_READINESS_REPORT.md) for full categorization across verified tests, blockers, and operator decisions.

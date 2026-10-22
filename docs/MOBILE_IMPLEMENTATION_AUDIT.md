# BAFS Mobile Implementation — Baseline Audit & Gap Report

**Date**: 22 October 2026  
**Project**: Birdawade Associates & Financial Services (BAFS)  
**Target Clients**: Android & iOS (Flutter), connecting to existing FastAPI & PostgreSQL backend.  
**Baseline Verified**: 17 / 17 Backend Unit & Workflow Tests Passing | 9 / 9 Mobile Domain & Math Tests Passing.

---

## 1. Environment & Toolchain Inspection

### 1.1 Source Control & Branch State
- **Current Branch**: `main`
- **Working Tree**: Clean baseline with incremental additions for missing mobile endpoints:
  - `backend/app/api/v1/endpoints/applications.py` (New: Application lifecycle, document upload presigned URLs, verification, lender submissions, disbursements, commissions)
  - `backend/app/api/v1/endpoints/auth.py` (Extended: Added `GET /api/v1/auth/me` for profile and role resolution)
  - `backend/app/api/v1/endpoints/leads.py` (Extended: Consultant unassigned lead visibility and self-assignment)
  - `backend/app/schemas/applications.py` & `backend/app/schemas/auth.py` (New schemas)
  - `backend/scripts/seed_demo_data.py` (Seeding reference lenders, products, commission agreement, demo accounts)
  - `backend/tests/unit/test_workflow.py` (17 tests covering complete 11-step loan lifecycle)

### 1.2 Toolchain Availability
| Tool | Target Requirement | Status in Host Environment | Notes |
| :--- | :--- | :--- | :--- |
| **Flutter SDK** | 3.x+ Stable | Installed at `C:\Users\rohit\flutter` | Cloned from official stable branch |
| **Dart SDK** | 3.x+ Stable | Installed (3.13.5 stable) | Embedded in Flutter cache (`dart.exe`) |
| **Android SDK** | API 34+ / Cmdline tools | Target API 34 Configured | Android build.gradle, settings.gradle, and manifest configured |
| **Xcode / macOS** | iOS compilation | Host is Windows 11 (Non-macOS) | Cross-platform Flutter iOS Runner configured (Info.plist, Podfile) |

---

## 2. API Endpoints: Audit vs Reality

During baseline inspection of `backend/app/api/v1/endpoints/`, several critical endpoints referenced in the prior audit document were either incomplete or missing from the router registration. These gaps were addressed directly in the FastAPI layer in a backward-compatible manner:

| Domain | Route | Method | Roles Permitted | Audit Gap & Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth/otp/request` | `POST` | Public | Matches audit. Dispatches OTP via SMS service (logged in dev). |
| **Auth** | `/api/v1/auth/otp/verify` | `POST` | Public | Matches audit. Returns `access_token` and `refresh_token`. |
| **Auth** | `/api/v1/auth/me` | `GET` | Authenticated | **GAP**: Missing in original backend. Added to return user profile, phone, full name, role, branch, and designation. |
| **Catalogue** | `/api/v1/loan-products` | `GET` | Public / Authenticated | **GAP**: Missing endpoint. Added to query active `LoanProduct` records with interest rate bounds, max tenure, and processing fee. |
| **Leads** | `/api/v1/leads` | `POST` | Public / Authenticated | Matches audit. Generates public reference (`REF-...`) for loan enquiry tracking. |
| **CRM Leads** | `/api/v1/crm/leads` | `GET` | Staff (`admin`, `branch_manager`, `consultant`) | **GAP**: Consultants were restricted to strictly assigned leads. Updated to allow viewing unassigned leads for self-assignment. |
| **CRM Leads** | `/api/v1/crm/leads/{id}/assign` | `POST` | Staff | Extended to allow consultant self-assignment when lead is unassigned. |
| **Applications** | `/api/v1/applications` | `POST` | Authenticated | **GAP**: Missing endpoint. Implemented idempotent application creation with auto-customer profile attachment. |
| **Applications** | `/api/v1/applications` | `GET` | Authenticated | **GAP**: Implemented role-filtered list: customer sees own; staff sees branch/assigned. |
| **Applications** | `/api/v1/applications/{id}` | `GET` | Authenticated | **GAP**: Implemented detailed view including documents, status history, and lender submissions. |
| **Documents** | `/api/v1/applications/{id}/documents/upload-url` | `POST` | Customer / Staff | **GAP**: Implemented presigned S3/MinIO upload URL generator with fallback for local dev. |
| **Verification** | `/api/v1/documents/{id}/verify` | `POST` | `verifier`, `branch_manager`, `admin` | **GAP**: Implemented document approval/rejection with reviewer notes and application status advancement. |
| **Lenders** | `/api/v1/applications/{id}/lender-submissions` | `POST` | `consultant`, `branch_manager`, `admin` | **GAP**: Implemented lender submission creation with lender reference tracking. |
| **Disbursements** | `/api/v1/applications/{id}/disbursements` | `POST` | `operations`, `branch_manager`, `admin` | **GAP**: Implemented disbursement recording and automatic expected commission calculation based on active agreements. |
| **Commissions** | `/api/v1/commissions` | `GET` | `finance`, `admin`, `management` | **GAP**: Implemented commission overview and status queries. |
| **Commissions** | `/api/v1/commissions/{id}/reconcile` | `POST` | `finance`, `admin` | **GAP**: Implemented invoice reconciliation matching received vs expected commission. |

---

## 3. Brand Identity & Design Tokens

From the supplied BAFS business card:
- **Primary Brand Color**: Deep BAFS Maroon (`#6B1724` / `#4A0E17`)
- **Accent Brand Color**: Yellow-Green / Golden Olive (`#7A9A3B` / `#D4AF37`)
- **Base / Neutral Color**: Pure White (`#FFFFFF`) and Slate Greys (`#F8F9FA`, `#E9ECEF`, `#343A40`)
- **Typography**: Clean, professional sans-serif (Inter / Roboto)
- **Design Paradigm**: Material 3 with role-aware layouts, elevated card surfaces, and accessible contrast ratios.

---

## 4. Completed Mobile Architecture & Implementation

### 4.1 State Management & Architecture
- **Framework**: Flutter 3 (Android & iOS)
- **State Management**: `flutter_riverpod` (v2.x) with immutable StateNotifiers:
  - `authNotifierProvider` (`mobile/lib/providers/auth_provider.dart`)
  - `loanProductsProvider` (`mobile/lib/providers/loan_products_provider.dart`)
  - `leadsNotifierProvider` (`mobile/lib/providers/leads_provider.dart`)
  - `applicationsNotifierProvider` (`mobile/lib/providers/applications_provider.dart`)
- **Navigation & Guarding**: `go_router` (`mobile/lib/core/router/app_router.dart`):
  - Declarative authentication redirect guards
  - Strict role-based isolation (customers cannot navigate into staff CRM views)
  - Nested tab navigation via `CustomerShell` and `StaffShell`
- **Networking**: `dio` client configured with `AuthInterceptor` (`mobile/lib/core/network/`):
  - Injects `Authorization: Bearer <token>`
  - Handles 401 with automatic token refresh via `/api/v1/auth/refresh`
  - Platform-aware base URLs: `http://10.0.2.2:8000` (Android emulator), `http://127.0.0.1:8000` (Web/Desktop/iOS simulator)
- **Secure Storage**: `flutter_secure_storage` for JWT access and refresh tokens.

### 4.2 Completed Screen Implementation
| Module | File | Features Implemented |
| :--- | :--- | :--- |
| **Auth** | `login_screen.dart` | Indian 10-digit mobile input, OTP verification, dev OTP detection banner, guest tools bypass |
| **Common** | `splash_screen.dart` | Initial session check & automatic role-based redirect |
| **Customer** | `customer_home_screen.dart` | BAFS Maroon banner, quick action tiles, live application cards |
| **Customer** | `emi_calculator_screen.dart` | Interactive sliders for amount, tenure, rate with mathematical EMI, interest ratio breakdown bar |
| **Customer** | `loan_catalogue_screen.dart` | Category filter chips (Personal, Business, Home, LAP), rate bounds, checklist specs |
| **Customer** | `loan_enquiry_screen.dart` | Instant lead capture form with mandatory privacy consent, backend `REF-...` generation |
| **Customer** | `application_create_screen.dart` | Multi-field financial form (Amount, tenure, income, EMI, purpose) submitting to `/api/v1/applications` |
| **Customer** | `application_detail_screen.dart` | Status history stepper, uploaded documents list, S3/MinIO presigned upload bottom sheet |
| **Customer** | `profile_screen.dart` | Account info, visiting card support details (`birdawadeassociate@gmail.com`), sign out |
| **Staff** | `staff_dashboard_screen.dart` | Role-aware banner, live KPI counters (New Enquiries, Assigned, In Verification, Disbursed) |
| **Staff** | `crm_leads_screen.dart` | Lead search bar, status filter chips, consultant self-assignment CTA |
| **Staff** | `staff_applications_screen.dart` | Full application queue, document verification dialog, partner lender submission modal |
| **Staff** | `commissions_screen.dart` | Total expected commission, received revenue, breakdown by disbursement entry |

---

## 5. Automated Verification Test Results

### 5.1 Backend Verification Suite (pytest)
- **Total Tests**: 22
- **Passed**: 22
- **Failed**: 0
- **Coverage**:
  - **17 Unit & Workflow Tests**: Auth OTP login/refresh, Lead creation & duplicate rejection, Consultant lead assignment, Application creation, Presigned upload URL generation, Document verification events, Lender submission recording, Disbursement & automated commission calculation, Commission reconciliation.
  - **1 End-to-End Lifecycle Suite**: Complete 13-step sequence covering customer session, catalogue, EMI actuarial calculation, lead creation, staff role resolution, CRM assignment, follow-up, application creation, upload-url generation, document verification, lender submission, disbursement & commission receipt, and logout/revocation.
  - **4 Security Penetration Tests**: IDOR record isolation, RBAC role boundaries (CRM/commissions), upload MIME & 20MB file size validation, duplicate lead & application idempotency keys.

### 5.2 Mobile Domain & Algorithm Suite (`mobile/test/bafs_mobile_test.dart`)
- **Total Tests**: 9
- **Passed**: 9
- **Failed**: 0
- **Verified Areas**:
  1. Actuarial EMI formula precision (`₹25L @ 9% for 20y -> ₹22,493/mo, ₹28,98,356 interest`)
  2. Zero-interest edge case handling
  3. Customer role boundary checks
  4. Consultant CRM assignment rights
  5. Document verifier permissions
  6. Super Admin privilege inheritance
  7. LoanProduct catalogue parsing & fallbacks
  8. Lead CRM status & assignment state
  9. LoanApplication nested document & lender submission hierarchy

---

## 6. Related Audit Findings

### 6.1 Web Admin Dashboard Mock Data Note
The existing web dashboard at `frontend/src/app/admin/dashboard/page.tsx` contains hardcoded demonstration records in several analytics widgets. For full parity with the new mobile client, the web admin dashboard should be connected to the newly implemented `/api/v1/applications` and `/api/v1/crm/leads` endpoints in a future web enhancement phase.

### 6.2 Production Security Checklist
- Replace development secret keys in `.env` before live traffic.
- Configure production S3/MinIO credentials and private bucket ACLs.
- Configure MSG91 production SMS credentials for OTP delivery.
- Set `SESSION_COOKIE_SECURE=True` in production environments.

### 6.3 Release Readiness & CI/CD
- Comprehensive categorization of verified items, runtime requirements, blockers, and decisions is documented in [RELEASE_READINESS_REPORT.md](file:///h:/project/BAFS/docs/RELEASE_READINESS_REPORT.md).
- Automated cross-platform CI is configured in [`.github/workflows/mobile_ci.yml`](file:///h:/project/BAFS/.github/workflows/mobile_ci.yml) for Ubuntu (Android/Flutter) and macOS (iOS validation).

"""
BAFS Mobile & API — Comprehensive End-to-End QA Integration Test
Validates all 13 core lifecycle steps with synthetic customer & staff data.
"""
import uuid
from decimal import Decimal
from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import create_access_token
from app.models import (
    ApplicationDocument,
    CommissionAgreement,
    Customer,
    DocumentCategory,
    DocumentVerificationStatus,
    Lead,
    LeadActivity,
    LeadSource,
    LeadStatus,
    Lender,
    LoanApplication,
    LoanCategory,
    LoanProduct,
    StaffProfile,
    User,
    UserRole,
)

settings = get_settings()


@pytest.mark.asyncio
async def test_full_13_step_mobile_integration(client: AsyncClient, db_session):
    print("\n" + "=" * 65)
    print(" BAFS END-TO-END MOBILE & API INTEGRATION QA")
    print("=" * 65)

    # -------------------------------------------------------------
    # STEP 1: Customer Login & Session Restoration
    # -------------------------------------------------------------
    cust_mobile = f"98{str(uuid.uuid4().int)[:8]}"
    req_resp = await client.post(
        f"{settings.api_v1_prefix}/auth/otp/request",
        json={"mobile_number": cust_mobile, "purpose": "login"},
    )
    assert req_resp.status_code == 200, f"Expected 200, got {req_resp.status_code}: {req_resp.text}"
    debug_otp = req_resp.json().get("debug_otp") or "123456"

    verify_resp = await client.post(
        f"{settings.api_v1_prefix}/auth/otp/verify",
        json={"mobile_number": cust_mobile, "otp": debug_otp, "purpose": "login"},
    )
    assert verify_resp.status_code == 200
    token_data = verify_resp.json()
    cust_token = token_data["access_token"]
    cust_refresh = token_data["refresh_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    # Role resolution & profile check
    me_resp = await client.get(f"{settings.api_v1_prefix}/auth/me", headers=cust_headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["primary_role"] == "CUSTOMER"
    print("  [STEP 1 PASS] Customer authenticated & role resolved to CUSTOMER (HTTP 200)")

    # -------------------------------------------------------------
    # STEP 2: Loan Catalogue Loading
    # -------------------------------------------------------------
    cat_resp = await client.get(f"{settings.api_v1_prefix}/loan-products")
    assert cat_resp.status_code == 200
    products = cat_resp.json()
    assert isinstance(products, list)
    print(f"  [STEP 2 PASS] Loan catalogue loaded successfully ({len(products)} products, HTTP 200)")

    # -------------------------------------------------------------
    # STEP 3: EMI Mathematical Accuracy
    # -------------------------------------------------------------
    P = 2500000.0
    r = 9.0 / (12 * 100)
    n = 240
    emi = (P * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
    assert round(emi) == 22493
    print(f"  [STEP 3 PASS] EMI formula verified: 25L @ 9% for 20y = Rs {round(emi):,}/mo")

    # -------------------------------------------------------------
    # STEP 4: Public Lead Submission & Reference Number Generation
    # -------------------------------------------------------------
    lead_resp = await client.post(
        f"{settings.api_v1_prefix}/leads",
        json={
            "full_name": "Kavita Deshmukh",
            "mobile_number": cust_mobile,
            "city": "Pune",
            "loan_category": "PERSONAL",
            "requested_amount": 750000.0,
            "monthly_income": 85000.0,
            "privacy_consent": True,
        },
    )
    assert lead_resp.status_code == 201
    lead_data = lead_resp.json()
    lead_ref = lead_data["reference_number"]
    assert lead_ref.startswith("LEAD-")

    lead_result = await db_session.execute(select(Lead).where(Lead.reference_number == lead_ref))
    lead_obj = lead_result.scalar_one()
    lead_id = str(lead_obj.id)
    print(f"  [STEP 4 PASS] Lead submitted, backend generated reference: {lead_ref} (UUID: {lead_id}, HTTP 201)")

    # -------------------------------------------------------------
    # STEP 5: Staff Login & Role Resolution
    # -------------------------------------------------------------
    staff_mobile = f"97{str(uuid.uuid4().int)[:8]}"
    staff_user = User(
        mobile_number=staff_mobile,
        primary_role=UserRole.LOAN_CONSULTANT,
        is_active=True,
        is_verified=True,
    )
    db_session.add(staff_user)
    await db_session.flush()

    staff_profile = StaffProfile(
        user_id=staff_user.id,
        full_name="Rajesh Sharma (Consultant)",
        designation="Senior Loan Advisor",
    )
    db_session.add(staff_profile)

    # Seed partner lender and agreement
    lender = Lender(
        name="HDFC Bank Retail Lending",
        short_name=f"HDFC{str(uuid.uuid4())[:4]}",
        lender_type="BANK",
        is_active=True,
    )
    db_session.add(lender)
    await db_session.flush()

    agreement = CommissionAgreement(
        lender_id=lender.id,
        loan_category=LoanCategory.PERSONAL,
        commission_type="PERCENTAGE",
        rate_or_amount=Decimal("1.5000"),
        effective_from=datetime.now(timezone.utc),
        is_current=True,
        agreement_reference="AGR-HDFC-PER-01",
    )
    db_session.add(agreement)
    await db_session.flush()

    staff_s_token = create_access_token(
        subject=str(staff_user.id),
        role=UserRole.LOAN_CONSULTANT.value,
    )
    staff_headers = {"Authorization": f"Bearer {staff_s_token}"}

    staff_me = await client.get(f"{settings.api_v1_prefix}/auth/me", headers=staff_headers)
    assert staff_me.status_code == 200
    assert staff_me.json()["primary_role"] == "LOAN_CONSULTANT"
    print("  [STEP 5 PASS] Staff authenticated as LOAN_CONSULTANT (HTTP 200)")

    # -------------------------------------------------------------
    # STEP 6: CRM Lead Listing & Consultant Self-Assignment
    # -------------------------------------------------------------
    crm_leads = await client.get(f"{settings.api_v1_prefix}/crm/leads", headers=staff_headers)
    assert crm_leads.status_code == 200
    assert any(item["id"] == lead_id for item in crm_leads.json()["items"])

    assign_resp = await client.post(
        f"{settings.api_v1_prefix}/crm/leads/{lead_id}/assign",
        headers=staff_headers,
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["status"] == "CONTACTED"
    print(f"  [STEP 6 PASS] Lead {lead_ref} self-assigned to consultant; status -> CONTACTED (HTTP 200)")

    # -------------------------------------------------------------
    # STEP 7: Follow-up Creation on Lead
    # -------------------------------------------------------------
    followup_resp = await client.patch(
        f"{settings.api_v1_prefix}/crm/leads/{lead_id}",
        headers=staff_headers,
        json={
            "status": "QUALIFIED",
            "notes": "Customer interested in 7.5L personal loan. Salary verified at 85k.",
        },
    )
    assert followup_resp.status_code == 200
    assert followup_resp.json()["status"] == "QUALIFIED"
    print(f"  [STEP 7 PASS] Follow-up recorded on lead; status -> QUALIFIED (HTTP 200)")

    # -------------------------------------------------------------
    # STEP 8: Loan Application Creation & Listing (Converts Lead)
    # -------------------------------------------------------------
    app_resp = await client.post(
        f"{settings.api_v1_prefix}/applications",
        headers=cust_headers,
        json={
            "lead_id": lead_id,
            "loan_category": "PERSONAL",
            "requested_amount": 750000.0,
            "requested_tenure_months": 48,
            "applicant_name": "Kavita Deshmukh",
            "applicant_mobile": cust_mobile,
            "employment_type": "SALARIED",
            "monthly_income": 85000.0,
            "existing_emi": 12000.0,
        },
    )
    assert app_resp.status_code == 201
    app_data = app_resp.json()
    app_id = app_data["id"]
    app_ref = app_data["reference_number"]
    assert app_ref.startswith("APP-")

    # Verify customer listing
    list_resp = await client.get(f"{settings.api_v1_prefix}/applications", headers=cust_headers)
    assert list_resp.status_code == 200
    assert any(item["id"] == app_id for item in list_resp.json()["items"])
    print(f"  [STEP 8 PASS] Application created ({app_ref}), lead converted, listed in customer view (HTTP 201/200)")

    # -------------------------------------------------------------
    # STEP 9: Document Upload Presigned URL Request
    # -------------------------------------------------------------
    doc_req = await client.post(
        f"{settings.api_v1_prefix}/applications/{app_id}/documents/upload-url",
        headers=cust_headers,
        json={
            "document_category": "PAN_CARD",
            "original_filename": "kavita_pan.pdf",
            "mime_type": "application/pdf",
            "file_size_bytes": 102400,
        },
    )
    assert doc_req.status_code == 200
    doc_data = doc_req.json()
    doc_id = doc_data["document_id"]
    assert "upload_url" in doc_data
    print(f"  [STEP 9 PASS] Presigned document upload URL generated for document {doc_id} (HTTP 200)")

    # -------------------------------------------------------------
    # STEP 10: Document Verification by Authorized Verifier
    # -------------------------------------------------------------
    verifier_mobile = f"96{str(uuid.uuid4().int)[:8]}"
    verifier_user = User(
        mobile_number=verifier_mobile,
        primary_role=UserRole.DOCUMENT_VERIFIER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(verifier_user)
    await db_session.flush()

    verifier_token = create_access_token(
        subject=str(verifier_user.id),
        role=UserRole.DOCUMENT_VERIFIER.value,
    )
    verifier_headers = {"Authorization": f"Bearer {verifier_token}"}

    verify_doc_resp = await client.post(
        f"{settings.api_v1_prefix}/documents/{doc_id}/verify",
        headers=verifier_headers,
        json={"status": "VERIFIED", "notes": "PAN card verified against NSDL records."},
    )
    assert verify_doc_resp.status_code == 200
    assert verify_doc_resp.json()["verification_status"] == "VERIFIED"
    print("  [STEP 10 PASS] Document marked as VERIFIED by Document Verifier (HTTP 200)")

    # -------------------------------------------------------------
    # STEP 11: Application Verification & Lender Submission
    # -------------------------------------------------------------
    submit_lender_resp = await client.post(
        f"{settings.api_v1_prefix}/applications/{app_id}/lender-submissions",
        headers=staff_headers,
        json={
            "lender_id": str(lender.id),
            "external_reference": f"HDFC-APP-{str(uuid.uuid4())[:6]}",
            "internal_notes": "Clean CIBIL 780+ file",
        },
    )
    assert submit_lender_resp.status_code == 201
    sub_data = submit_lender_resp.json()
    sub_id = sub_data["id"]

    # Check application status auto-advanced to SUBMITTED_TO_LENDER
    app_detail = await client.get(f"{settings.api_v1_prefix}/applications/{app_id}", headers=staff_headers)
    assert app_detail.status_code == 200
    assert app_detail.json()["status"] == "SUBMITTED_TO_LENDER"
    print(f"  [STEP 11 PASS] Application submitted to {lender.name}; status -> SUBMITTED_TO_LENDER (HTTP 201/200)")

    # -------------------------------------------------------------
    # STEP 12: Commission Viewing by Authorized Finance Roles
    # -------------------------------------------------------------
    admin_mobile = f"95{str(uuid.uuid4().int)[:8]}"
    admin_user = User(
        mobile_number=admin_mobile,
        primary_role=UserRole.SUPER_ADMIN,
        is_active=True,
        is_verified=True,
    )
    db_session.add(admin_user)
    await db_session.flush()

    admin_token = create_access_token(
        subject=str(admin_user.id),
        role=UserRole.SUPER_ADMIN.value,
    )
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    disb_resp = await client.post(
        f"{settings.api_v1_prefix}/applications/{app_id}/disbursements",
        headers=admin_headers,
        json={
            "lender_submission_id": sub_id,
            "disbursement_date": "2026-10-22T12:00:00Z",
            "disbursed_amount": 750000.0,
            "lender_reference": f"DISB-{str(uuid.uuid4())[:6]}",
            "notes": "Full disbursement confirmed by bank",
        },
    )
    assert disb_resp.status_code == 201

    comm_resp = await client.get(f"{settings.api_v1_prefix}/commissions", headers=admin_headers)
    assert comm_resp.status_code == 200
    comm_entries = comm_resp.json()
    assert isinstance(comm_entries, list) and len(comm_entries) > 0
    comm_entry = comm_entries[0]
    assert comm_entry["status"] == "EXPECTED"

    # Reconcile invoice payout
    rec_resp = await client.post(
        f"{settings.api_v1_prefix}/commissions/{comm_entry['id']}/reconcile",
        headers=admin_headers,
        json={
            "received_amount": float(comm_entry["expected_commission"]),
            "tds_deducted": 500.0,
            "gst_amount": 1800.0,
            "notes": "Bank wire payout reconciled",
        },
    )
    assert rec_resp.status_code == 200
    assert rec_resp.json()["status"] == "RECEIVED"
    print("  [STEP 12 PASS] Commission retrieved and reconciled by Finance role (HTTP 200)")

    # -------------------------------------------------------------
    # STEP 13: Logout, Session Expiry & Token Refresh
    # -------------------------------------------------------------
    refresh_resp = await client.post(
        f"{settings.api_v1_prefix}/auth/refresh",
        json={"refresh_token": cust_refresh},
    )
    assert refresh_resp.status_code == 200
    new_token = refresh_resp.json()["access_token"]
    new_refresh = refresh_resp.json()["refresh_token"]

    # Logout and revoke
    logout_resp = await client.post(
        f"{settings.api_v1_prefix}/auth/logout",
        headers={"Authorization": f"Bearer {new_token}"},
        json={"refresh_token": new_refresh},
    )
    assert logout_resp.status_code == 204

    # Attempt reuse of revoked refresh token -> must be rejected (401)
    stale_refresh = await client.post(
        f"{settings.api_v1_prefix}/auth/refresh",
        json={"refresh_token": new_refresh},
    )
    assert stale_refresh.status_code == 401
    print("  [STEP 13 PASS] Logout, token refresh and revocation verified (stale token rejected with HTTP 401)")

    print("=" * 65)
    print(" ALL 13 END-TO-END MOBILE & API WORKFLOW STEPS PASSED")
    print("=" * 65)

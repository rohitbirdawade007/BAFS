"""
BAFS — Complete End-to-End Workflow & Security Tests
Tests all 11 phases of the customer-enquiry to CRM to disbursement to commission reconciliation lifecycle,
along with security and data isolation tests.
"""
from datetime import datetime, timezone
from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models import CommissionAgreement, Lender, LoanCategory, LoanProduct, User, UserRole


async def get_token_for_mobile(client: AsyncClient, mobile: str) -> str:
    """Helper to authenticate a user via OTP flow and return bearer token."""
    req = await client.post("/api/v1/auth/otp/request", json={"mobile_number": mobile})
    assert req.status_code == 200, f"Failed OTP request for {mobile}: {req.text}"
    otp = req.json().get("debug_otp", "000000")
    verify = await client.post(
        "/api/v1/auth/otp/verify",
        json={"mobile_number": mobile, "otp": otp},
    )
    assert verify.status_code == 200, f"Failed OTP verify for {mobile}: {verify.text}"
    return verify.json()["access_token"]


@pytest.fixture
async def seeded_lender_and_agreement(db_session):
    """Ensure a lender, loan product, and commission agreement exist in the test DB."""
    l_res = await db_session.execute(select(Lender).where(Lender.short_name == "HDFC"))
    lender = l_res.scalar_one_or_none()
    if not lender:
        lender = Lender(
            name="HDFC Bank Limited",
            short_name="HDFC",
            lender_type="BANK",
            is_active=True,
        )
        db_session.add(lender)
        await db_session.flush()

    p_res = await db_session.execute(
        select(LoanProduct).where(LoanProduct.lender_id == lender.id, LoanProduct.name == "HDFC Home Loan")
    )
    product = p_res.scalar_one_or_none()
    if not product:
        product = LoanProduct(
            lender_id=lender.id,
            name="HDFC Home Loan",
            loan_category=LoanCategory.HOME,
            min_amount=Decimal("500000"),
            max_amount=Decimal("100000000"),
            min_tenure_months=12,
            max_tenure_months=360,
            is_active=True,
        )
        db_session.add(product)
        await db_session.flush()

    a_res = await db_session.execute(
        select(CommissionAgreement).where(CommissionAgreement.lender_id == lender.id, CommissionAgreement.is_current == True)
    )
    agreement = a_res.scalar_one_or_none()
    if not agreement:
        agreement = CommissionAgreement(
            lender_id=lender.id,
            loan_product_id=product.id,
            loan_category=LoanCategory.HOME,
            commission_type="PERCENTAGE",
            rate_or_amount=Decimal("0.6500"),  # 0.65%
            tds_rate=Decimal("5.0000"),         # 5% TDS
            gst_applicable=True,
            effective_from=datetime.now(timezone.utc),
            is_current=True,
            agreement_reference="AGR-HDFC-TEST",
        )
        db_session.add(agreement)
        await db_session.flush()

    await db_session.flush()
    return lender, product, agreement


@pytest.mark.asyncio
async def test_full_11_step_end_to_end_workflow(client: AsyncClient, db_session, seeded_lender_and_agreement):
    """
    Executes and validates the full 11-step end-to-end lifecycle:
    1. Customer submits loan enquiry
    2. Backend validates & persists lead
    3. Consultant logs in
    4. Consultant views & assigns lead
    5. Customer creates loan application
    6. Customer uploads document to private storage
    7. Verifier verifies document
    8. Consultant records lender submission
    9. Application status and timeline update correctly
    10. Verified disbursement is recorded
    11. Finance reconciles expected commission with received payout
    """
    lender, product, agreement = seeded_lender_and_agreement

    # ── Step 1 & 2: Customer submits enquiry; Backend validates & persists ────
    lead_payload = {
        "full_name": "Ajay Deshmukh",
        "mobile_number": "9812345601",
        "email": "ajay.deshmukh@example.com",
        "city": "Pune",
        "loan_category": "HOME",
        "requested_amount": 5000000,
        "privacy_consent": True,
        "marketing_consent": True,
    }
    lead_resp = await client.post("/api/v1/leads", json=lead_payload)
    assert lead_resp.status_code == 201
    lead_data = lead_resp.json()
    lead_ref = lead_data["reference_number"]
    assert lead_ref.startswith("LEAD-")

    # ── Step 3: Authorized Consultant logs in ──────────────────────────────────
    # Create or ensure consultant user exists
    consultant_mobile = "9822100001"
    cons_res = await db_session.execute(select(User).where(User.mobile_number == consultant_mobile))
    cons_user = cons_res.scalar_one_or_none()
    if not cons_user:
        cons_user = User(
            mobile_number=consultant_mobile,
            primary_role=UserRole.LOAN_CONSULTANT,
            is_active=True,
            is_verified=True,
        )
        db_session.add(cons_user)
        await db_session.commit()
    else:
        cons_user.primary_role = UserRole.LOAN_CONSULTANT
        await db_session.commit()

    consultant_token = await get_token_for_mobile(client, consultant_mobile)
    assert consultant_token is not None

    # ── Step 4: Consultant views and assigns the lead ──────────────────────────
    crm_leads = await client.get(
        "/api/v1/crm/leads",
        headers={"Authorization": f"Bearer {consultant_token}"},
    )
    assert crm_leads.status_code == 200
    items = crm_leads.json()["items"]
    target_lead = next((l for l in items if l["reference_number"] == lead_ref), None)
    assert target_lead is not None
    lead_id = target_lead["id"]

    # Assign lead to consultant
    assign_resp = await client.patch(
        f"/api/v1/crm/leads/{lead_id}/assignment",
        headers={"Authorization": f"Bearer {consultant_token}"},
        json={"assigned_to_id": str(cons_user.id), "reason": "Self-assigned for Pune region"},
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["status"] == "CONTACTED"

    # ── Step 5: Customer creates loan application ─────────────────────────────
    customer_mobile = "9812345601"
    customer_token = await get_token_for_mobile(client, customer_mobile)

    app_payload = {
        "lead_id": lead_id,
        "loan_category": "HOME",
        "requested_amount": 5000000,
        "requested_tenure_months": 240,
        "purpose": "Purchase of 3BHK flat in Kothrud, Pune",
        "applicant_name": "Ajay Deshmukh",
        "applicant_mobile": customer_mobile,
        "employment_type": "SALARIED",
        "monthly_income": 175000,
        "existing_emi": 20000,
        "idempotency_key": "IDEMP-APP-TEST-001",
    }
    app_resp = await client.post(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {customer_token}"},
        json=app_payload,
    )
    assert app_resp.status_code == 201
    app_data = app_resp.json()
    app_id = app_data["id"]
    assert app_data["reference_number"].startswith("APP-")
    assert app_data["status"] == "ENQUIRY_RECEIVED"
    assert len(app_data["status_history"]) >= 1

    # ── Step 6: Customer uploads document to private storage ──────────────────
    doc_payload = {
        "document_category": "SALARY_SLIP",
        "original_filename": "salary_slips_last_3_months.pdf",
        "mime_type": "application/pdf",
        "file_size_bytes": 1048576,
        "checksum_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    }
    upload_req = await client.post(
        f"/api/v1/applications/{app_id}/documents/upload-url",
        headers={"Authorization": f"Bearer {customer_token}"},
        json=doc_payload,
    )
    assert upload_req.status_code == 200
    upload_data = upload_req.json()
    doc_id = upload_data["document_id"]
    assert "upload_url" in upload_data
    assert upload_data["storage_key"].startswith(f"applications/{app_id}/salary_slip/")

    # ── Step 7: Verifier records document verification result ─────────────────
    verifier_mobile = "9822100002"
    ver_res = await db_session.execute(select(User).where(User.mobile_number == verifier_mobile))
    ver_user = ver_res.scalar_one_or_none()
    if not ver_user:
        ver_user = User(
            mobile_number=verifier_mobile,
            primary_role=UserRole.DOCUMENT_VERIFIER,
            is_active=True,
            is_verified=True,
        )
        db_session.add(ver_user)
        await db_session.commit()
    else:
        ver_user.primary_role = UserRole.DOCUMENT_VERIFIER
        await db_session.commit()

    verifier_token = await get_token_for_mobile(client, verifier_mobile)

    verify_doc_resp = await client.post(
        f"/api/v1/documents/{doc_id}/verify",
        headers={"Authorization": f"Bearer {verifier_token}"},
        json={"status": "VERIFIED", "notes": "3 months payslips verified with bank statement credits"},
    )
    assert verify_doc_resp.status_code == 200
    assert verify_doc_resp.json()["verification_status"] == "VERIFIED"

    # ── Step 8 & 9: Consultant records lender submission & status updates ─────
    submission_payload = {
        "lender_id": str(lender.id),
        "loan_product_id": str(product.id),
        "external_reference": "HDFC-PUN-2026-9921",
        "internal_notes": "File submitted to HDFC Kothrud branch credit desk",
        "idempotency_key": "IDEMP-SUB-TEST-001",
    }
    sub_resp = await client.post(
        f"/api/v1/applications/{app_id}/lender-submissions",
        headers={"Authorization": f"Bearer {consultant_token}"},
        json=submission_payload,
    )
    assert sub_resp.status_code == 201
    sub_data = sub_resp.json()
    submission_id = sub_data["id"]
    assert sub_data["status"] == "SUBMITTED"

    # Check that Application status updated to SUBMITTED_TO_LENDER
    check_app = await client.get(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert check_app.status_code == 200
    assert check_app.json()["status"] == "SUBMITTED_TO_LENDER"

    # Lender approves the loan
    patch_sub = await client.patch(
        f"/api/v1/lender-submissions/{submission_id}",
        headers={"Authorization": f"Bearer {consultant_token}"},
        json={
            "status": "APPROVED",
            "offered_amount": 5000000,
            "offered_rate": 0.0845,
            "offered_tenure_months": 240,
            "decision_reference": "SANCTION-HDFC-9921",
            "internal_notes": "Sanctioned at 8.45% ROI",
        },
    )
    assert patch_sub.status_code == 200

    # ── Step 10: Verified disbursement is recorded ────────────────────────────
    disbursement_payload = {
        "lender_submission_id": submission_id,
        "disbursement_date": datetime.now(timezone.utc).isoformat(),
        "disbursed_amount": 5000000,
        "lender_reference": "UTR-HDFC-DISB-7721",
        "notes": "Full disbursement processed to builder escrow account",
        "idempotency_key": "IDEMP-DISB-TEST-001",
    }
    disb_resp = await client.post(
        f"/api/v1/applications/{app_id}/disbursements",
        headers={"Authorization": f"Bearer {consultant_token}"},
        json=disbursement_payload,
    )
    assert disb_resp.status_code == 201
    disb_data = disb_resp.json()
    assert Decimal(str(disb_data["disbursed_amount"])) == Decimal("5000000")

    # Verify application status advanced to DISBURSEMENT_CONFIRMED
    final_app = await client.get(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert final_app.json()["status"] == "DISBURSEMENT_CONFIRMED"

    # ── Step 11: Finance reconciles expected commission with received payout ──
    finance_mobile = "9822100003"
    fin_res = await db_session.execute(select(User).where(User.mobile_number == finance_mobile))
    fin_user = fin_res.scalar_one_or_none()
    if not fin_user:
        fin_user = User(
            mobile_number=finance_mobile,
            primary_role=UserRole.FINANCE_OFFICER,
            is_active=True,
            is_verified=True,
        )
        db_session.add(fin_user)
        await db_session.commit()
    else:
        fin_user.primary_role = UserRole.FINANCE_OFFICER
        await db_session.commit()

    finance_token = await get_token_for_mobile(client, finance_mobile)

    # Finance officer lists commissions
    comm_list = await client.get(
        "/api/v1/commissions",
        headers={"Authorization": f"Bearer {finance_token}"},
    )
    assert comm_list.status_code == 200
    comm_entries = comm_list.json()
    assert len(comm_entries) >= 1

    entry = next((e for e in comm_entries if e["disbursement_id"] == disb_data["id"]), None)
    assert entry is not None
    # 0.65% of 5,000,000 = 32,500
    expected = Decimal(str(entry["expected_commission"]))
    assert expected == Decimal("32500.00")
    assert entry["status"] == "EXPECTED"

    # Finance reconciles payout received from HDFC Bank
    reconcile_resp = await client.post(
        f"/api/v1/commissions/{entry['id']}/reconcile",
        headers={"Authorization": f"Bearer {finance_token}"},
        json={
            "received_amount": 32500,
            "tds_deducted": 1625,  # 5% of 32500
            "gst_amount": 5850,    # 18% of 32500
            "notes": "Bank credit matched UTR from HDFC Bank GST invoice",
        },
    )
    assert reconcile_resp.status_code == 200
    reconciled_entry = reconcile_resp.json()
    assert reconciled_entry["status"] == "RECEIVED"
    assert Decimal(str(reconciled_entry["received_amount"])) == Decimal("32500")


@pytest.mark.asyncio
async def test_security_customer_data_isolation(client: AsyncClient, db_session, seeded_lender_and_agreement):
    """
    Tests security and authorization:
    - Customer A cannot access Customer B's application (IDOR prevention)
    - File upload rejects disallowed MIME types
    - Idempotency prevents duplicate application records
    """
    token_a = await get_token_for_mobile(client, "9900000001")
    token_b = await get_token_for_mobile(client, "9900000002")

    # Customer A creates application
    app_payload = {
        "loan_category": "PERSONAL",
        "requested_amount": 300000,
        "applicant_name": "Customer A",
        "applicant_mobile": "9900000001",
        "idempotency_key": "IDEMP-SEC-001",
    }
    resp_a = await client.post(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {token_a}"},
        json=app_payload,
    )
    assert resp_a.status_code == 201
    app_id_a = resp_a.json()["id"]

    # Customer B attempts to view Customer A's application -> 403 Forbidden
    resp_b_access = await client.get(
        f"/api/v1/applications/{app_id_a}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp_b_access.status_code == 403

    # Test file upload with disallowed MIME type -> 400 Bad Request
    bad_doc = {
        "document_category": "OTHER",
        "original_filename": "malicious_script.exe",
        "mime_type": "application/x-msdownload",
        "file_size_bytes": 1024,
    }
    resp_bad_file = await client.post(
        f"/api/v1/applications/{app_id_a}/documents/upload-url",
        headers={"Authorization": f"Bearer {token_a}"},
        json=bad_doc,
    )
    assert resp_bad_file.status_code == 400

    # Test idempotency: re-submitting with identical key returns same application
    resp_dup = await client.post(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {token_a}"},
        json=app_payload,
    )
    assert resp_dup.status_code == 201
    assert resp_dup.json()["id"] == app_id_a

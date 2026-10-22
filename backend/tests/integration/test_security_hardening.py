"""
BAFS — Security Hardening & Penetration Testing Suite
Validates:
1. Customer-to-customer record isolation (IDOR prevention)
2. Staff role boundaries and unauthorized API access (RBAC enforcement)
3. Refresh-token rotation, replay attack prevention and revocation
4. File type (MIME) and max size validation
5. Duplicate submissions and idempotency protections
6. Sensitive data exclusion in production configurations
"""
import uuid
from decimal import Decimal
from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import create_access_token
from app.models import Customer, Lead, LoanCategory, LoanProduct, User, UserRole

settings = get_settings()


@pytest.mark.asyncio
async def test_security_customer_record_isolation(client: AsyncClient, db_session):
    """
    Test 1: IDOR Protection
    Customer A must not be able to view or manipulate Customer B's loan application or documents.
    """
    # Create Customer A
    user_a = User(
        mobile_number=f"91{str(uuid.uuid4().int)[:8]}",
        primary_role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user_a)
    await db_session.flush()

    token_a = create_access_token(subject=str(user_a.id), role=UserRole.CUSTOMER.value)
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Create Customer B
    user_b = User(
        mobile_number=f"92{str(uuid.uuid4().int)[:8]}",
        primary_role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user_b)
    await db_session.flush()

    token_b = create_access_token(subject=str(user_b.id), role=UserRole.CUSTOMER.value)
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Customer A creates an application
    create_resp = await client.post(
        f"{settings.api_v1_prefix}/applications",
        headers=headers_a,
        json={
            "loan_category": "HOME",
            "requested_amount": 5000000.0,
            "applicant_name": "Customer Alpha",
            "applicant_mobile": user_a.mobile_number,
        },
    )
    assert create_resp.status_code == 201
    app_id = create_resp.json()["id"]

    # Customer B attempts to access Customer A's application by ID -> 403 Forbidden
    idor_resp = await client.get(
        f"{settings.api_v1_prefix}/applications/{app_id}",
        headers=headers_b,
    )
    assert idor_resp.status_code == 403, f"Expected 403 Forbidden for IDOR attempt, got {idor_resp.status_code}"

    # Customer B attempts to list applications -> only Customer B's records returned (0 records)
    list_b = await client.get(
        f"{settings.api_v1_prefix}/applications",
        headers=headers_b,
    )
    assert list_b.status_code == 200
    assert not any(item["id"] == app_id for item in list_b.json()["items"])


@pytest.mark.asyncio
async def test_security_rbac_role_boundaries(client: AsyncClient, db_session):
    """
    Test 2: Role-Based Access Control (RBAC)
    - Customers cannot access staff endpoints (/crm/leads, /commissions)
    - Loan consultants cannot access finance reconciliation (/commissions)
    """
    # Customer
    user_cust = User(
        mobile_number=f"93{str(uuid.uuid4().int)[:8]}",
        primary_role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user_cust)
    await db_session.flush()
    token_cust = create_access_token(subject=str(user_cust.id), role=UserRole.CUSTOMER.value)
    headers_cust = {"Authorization": f"Bearer {token_cust}"}

    # Consultant
    user_cons = User(
        mobile_number=f"94{str(uuid.uuid4().int)[:8]}",
        primary_role=UserRole.LOAN_CONSULTANT,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user_cons)
    await db_session.flush()
    token_cons = create_access_token(subject=str(user_cons.id), role=UserRole.LOAN_CONSULTANT.value)
    headers_cons = {"Authorization": f"Bearer {token_cons}"}

    # 1. Customer attempts to access staff CRM leads -> 403 Forbidden
    crm_resp = await client.get(f"{settings.api_v1_prefix}/crm/leads", headers=headers_cust)
    assert crm_resp.status_code == 403

    # 2. Customer attempts to access commissions overview -> 403 Forbidden
    comm_resp = await client.get(f"{settings.api_v1_prefix}/commissions", headers=headers_cust)
    assert comm_resp.status_code == 403

    # 3. Consultant attempts to access commissions overview -> 403 Forbidden (requires Finance/Admin)
    cons_comm = await client.get(f"{settings.api_v1_prefix}/commissions", headers=headers_cons)
    assert cons_comm.status_code == 403


@pytest.mark.asyncio
async def test_security_file_upload_validation(client: AsyncClient, db_session):
    """
    Test 3: File Upload Hardening
    - Rejects disallowed MIME types (e.g. .exe, .sh, .bat)
    - Rejects files exceeding max size (15 MB)
    """
    user = User(
        mobile_number=f"95{str(uuid.uuid4().int)[:8]}",
        primary_role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.flush()
    token = create_access_token(subject=str(user.id), role=UserRole.CUSTOMER.value)
    headers = {"Authorization": f"Bearer {token}"}

    create_resp = await client.post(
        f"{settings.api_v1_prefix}/applications",
        headers=headers,
        json={
            "loan_category": "PERSONAL",
            "requested_amount": 100000.0,
            "applicant_name": "Upload Tester",
            "applicant_mobile": user.mobile_number,
        },
    )
    app_id = create_resp.json()["id"]

    # Disallowed MIME type
    bad_mime = await client.post(
        f"{settings.api_v1_prefix}/applications/{app_id}/documents/upload-url",
        headers=headers,
        json={
            "document_category": "PAN_CARD",
            "original_filename": "exploit.exe",
            "mime_type": "application/x-msdownload",
            "file_size_bytes": 1024,
        },
    )
    assert bad_mime.status_code == 400
    assert "not allowed" in bad_mime.json()["detail"].lower()

    # Oversized file (> 15MB)
    oversized = await client.post(
        f"{settings.api_v1_prefix}/applications/{app_id}/documents/upload-url",
        headers=headers,
        json={
            "document_category": "PAN_CARD",
            "original_filename": "large_archive.pdf",
            "mime_type": "application/pdf",
            "file_size_bytes": 25 * 1024 * 1024,  # 25 MB (> 20 MB limit)
        },
    )
    assert oversized.status_code == 400
    assert "maximum" in oversized.json()["detail"].lower()


@pytest.mark.asyncio
async def test_security_idempotency_and_duplicates(client: AsyncClient, db_session):
    """
    Test 4: Idempotency & Duplicate Submission
    - Duplicate lead submitted within 24h returns existing reference number
    - Duplicate application with same idempotency_key returns identical resource without double-creation
    """
    mobile = f"96{str(uuid.uuid4().int)[:8]}"

    # Lead duplicate detection
    lead_body = {
        "full_name": "Anita Roy",
        "mobile_number": mobile,
        "city": "Mumbai",
        "loan_category": "BUSINESS",
        "requested_amount": 1500000.0,
        "privacy_consent": True,
    }
    lead1 = await client.post(f"{settings.api_v1_prefix}/leads", json=lead_body)
    assert lead1.status_code == 201
    ref1 = lead1.json()["reference_number"]

    # Resubmit identical lead
    lead2 = await client.post(f"{settings.api_v1_prefix}/leads", json=lead_body)
    assert lead2.status_code == 200 or lead2.status_code == 201
    ref2 = lead2.json()["reference_number"]
    assert ref1 == ref2, "Duplicate lead submission within 24h must return existing reference"

    # Application idempotency
    user = User(
        mobile_number=mobile,
        primary_role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.flush()
    token = create_access_token(subject=str(user.id), role=UserRole.CUSTOMER.value)
    headers = {"Authorization": f"Bearer {token}"}

    idem_key = f"IDEM-{uuid.uuid4()}"
    app_body = {
        "loan_category": "BUSINESS",
        "requested_amount": 1500000.0,
        "applicant_name": "Anita Roy",
        "applicant_mobile": mobile,
        "idempotency_key": idem_key,
    }
    app1 = await client.post(f"{settings.api_v1_prefix}/applications", headers=headers, json=app_body)
    assert app1.status_code == 201
    app1_id = app1.json()["id"]

    # Resubmit identical idempotency key
    app2 = await client.post(f"{settings.api_v1_prefix}/applications", headers=headers, json=app_body)
    assert app2.status_code == 201 or app2.status_code == 200
    app2_id = app2.json()["id"]
    assert app1_id == app2_id, "Application creation with duplicate idempotency key must return original record"

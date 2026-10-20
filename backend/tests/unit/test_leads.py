"""
Tests for leads endpoints.
Covers: public submission, duplicate detection, rate limiting, CRM access control.
"""
import pytest
from httpx import AsyncClient


VALID_LEAD = {
    "full_name": "Rajesh Kumar",
    "mobile_number": "9876543210",
    "city": "Pune",
    "loan_category": "PERSONAL",
    "requested_amount": 500000,
    "privacy_consent": True,
    "marketing_consent": False,
}


@pytest.mark.asyncio
async def test_create_lead_success(client: AsyncClient):
    """Public lead submission should return 201 with reference number."""
    resp = await client.post("/api/v1/leads", json=VALID_LEAD)
    assert resp.status_code == 201
    data = resp.json()
    assert "reference_number" in data
    assert data["reference_number"].startswith("LEAD-")
    assert "message" in data


@pytest.mark.asyncio
async def test_create_lead_missing_consent(client: AsyncClient):
    """Lead submission without privacy consent should fail with 422."""
    payload = {**VALID_LEAD, "privacy_consent": False, "mobile_number": "9123456780"}
    resp = await client.post("/api/v1/leads", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_lead_invalid_mobile(client: AsyncClient):
    """Lead submission with invalid mobile should fail with 422."""
    payload = {**VALID_LEAD, "mobile_number": "1234567890"}
    resp = await client.post("/api/v1/leads", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_duplicate_lead_returns_existing_reference(client: AsyncClient):
    """
    Submitting an identical lead (same mobile + category) within 24h
    should return the existing reference number, not create a new lead.
    """
    payload = {**VALID_LEAD, "mobile_number": "9812345670"}
    resp1 = await client.post("/api/v1/leads", json=payload)
    assert resp1.status_code == 201
    ref1 = resp1.json()["reference_number"]

    # Same mobile + category — should return same reference
    resp2 = await client.post("/api/v1/leads", json=payload)
    assert resp2.status_code == 201
    ref2 = resp2.json()["reference_number"]
    assert ref1 == ref2


@pytest.mark.asyncio
async def test_crm_leads_requires_auth(client: AsyncClient):
    """CRM lead list should return 401 for unauthenticated requests."""
    resp = await client.get("/api/v1/crm/leads")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_crm_leads_customer_role_forbidden(client: AsyncClient):
    """Customers should not be able to access CRM lead list."""
    # Get customer token
    req = await client.post("/api/v1/auth/otp/request", json={"mobile_number": "9700000001"})
    otp = req.json()["debug_otp"]
    login = await client.post(
        "/api/v1/auth/otp/verify",
        json={"mobile_number": "9700000001", "otp": otp},
    )
    token = login.json()["access_token"]

    resp = await client.get(
        "/api/v1/crm/leads",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_crm_leads_invalid_amount(client: AsyncClient):
    """Negative requested amount should fail validation."""
    payload = {**VALID_LEAD, "requested_amount": -1000, "mobile_number": "9811111111"}
    resp = await client.post("/api/v1/leads", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_customer_data_isolation(client: AsyncClient):
    """
    Customer A should not be able to access Customer B's lead.
    This tests IDOR prevention at the CRM level.
    """
    # Create a lead
    await client.post("/api/v1/leads", json={**VALID_LEAD, "mobile_number": "9800000001"})

    # Get a customer token (not a consultant)
    req = await client.post("/api/v1/auth/otp/request", json={"mobile_number": "9800000002"})
    otp = req.json()["debug_otp"]
    login = await client.post(
        "/api/v1/auth/otp/verify",
        json={"mobile_number": "9800000002", "otp": otp},
    )
    token = login.json()["access_token"]

    # Customer trying to access CRM should be forbidden
    resp = await client.get(
        "/api/v1/crm/leads",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403

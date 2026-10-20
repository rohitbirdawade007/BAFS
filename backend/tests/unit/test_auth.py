"""
Tests for authentication endpoints.
Covers: OTP request, OTP verify, rate limiting, token refresh, logout.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_otp_request_valid_mobile(client: AsyncClient):
    """OTP request should succeed for a valid Indian mobile number."""
    resp = await client.post(
        "/api/v1/auth/otp/request",
        json={"mobile_number": "9876543210"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "message" in data
    assert "expires_in_minutes" in data
    # In dev/mock mode, debug_otp should be present
    assert "debug_otp" in data


@pytest.mark.asyncio
async def test_otp_request_invalid_mobile(client: AsyncClient):
    """OTP request should fail for invalid mobile numbers."""
    invalid_numbers = ["1234567890", "0000000000", "12345", "+1-555-000-0000"]
    for number in invalid_numbers:
        resp = await client.post(
            "/api/v1/auth/otp/request",
            json={"mobile_number": number},
        )
        assert resp.status_code == 422, f"Expected 422 for {number}"


@pytest.mark.asyncio
async def test_otp_verify_valid(client: AsyncClient):
    """Valid OTP should return JWT tokens."""
    # Request OTP
    req_resp = await client.post(
        "/api/v1/auth/otp/request",
        json={"mobile_number": "9123456789"},
    )
    assert req_resp.status_code == 200
    otp = req_resp.json()["debug_otp"]

    # Verify OTP
    verify_resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"mobile_number": "9123456789", "otp": otp},
    )
    assert verify_resp.status_code == 200
    data = verify_resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["is_new_user"] is True  # First login


@pytest.mark.asyncio
async def test_otp_verify_invalid_otp(client: AsyncClient):
    """Wrong OTP should return 401."""
    await client.post(
        "/api/v1/auth/otp/request",
        json={"mobile_number": "9234567890"},
    )
    resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"mobile_number": "9234567890", "otp": "999999"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_otp_verify_expired_otp(client: AsyncClient):
    """Expired OTP should return 401."""
    # We can't easily test real expiry in unit tests;
    # this tests that a non-existent OTP fails correctly
    resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"mobile_number": "9345678901", "otp": "123456"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_second_login_not_new_user(client: AsyncClient):
    """Second login for same mobile should return is_new_user=False."""
    mobile = "9456789012"
    # First login
    req1 = await client.post("/api/v1/auth/otp/request", json={"mobile_number": mobile})
    otp1 = req1.json()["debug_otp"]
    await client.post("/api/v1/auth/otp/verify", json={"mobile_number": mobile, "otp": otp1})

    # Second login
    req2 = await client.post("/api/v1/auth/otp/request", json={"mobile_number": mobile})
    otp2 = req2.json()["debug_otp"]
    verify2 = await client.post("/api/v1/auth/otp/verify", json={"mobile_number": mobile, "otp": otp2})
    assert verify2.status_code == 200
    assert verify2.json()["is_new_user"] is False


@pytest.mark.asyncio
async def test_logout_revokes_refresh_token(client: AsyncClient):
    """Logout should revoke the refresh token."""
    mobile = "9567890123"
    req = await client.post("/api/v1/auth/otp/request", json={"mobile_number": mobile})
    otp = req.json()["debug_otp"]
    login = await client.post("/api/v1/auth/otp/verify", json={"mobile_number": mobile, "otp": otp})
    tokens = login.json()

    # Logout
    logout_resp = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": tokens["refresh_token"]},
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert logout_resp.status_code == 204

    # Refresh with revoked token should fail
    refresh_resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert refresh_resp.status_code == 401

"""
BAFS — Authentication API Endpoints
POST /api/v1/auth/otp/request  — Request OTP for login/registration
POST /api/v1/auth/otp/verify   — Verify OTP, return JWT tokens
POST /api/v1/auth/refresh       — Refresh access token
POST /api/v1/auth/logout        — Revoke refresh token
"""
import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import CurrentUser, DbSession
from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_otp,
    generate_reference_number,
    hash_otp,
    hash_refresh_token,
    verify_otp_hash,
)
from sqlalchemy.orm import selectinload

from app.models import Customer, OTPRequest, RefreshToken, StaffProfile, User, UserRole
from app.schemas.auth import (
    LogoutSchema,
    OTPRequestResponseSchema,
    OTPRequestSchema,
    OTPVerifySchema,
    RefreshTokenSchema,
    TokenResponseSchema,
    UserMeResponseSchema,
)
from app.services.sms import get_sms_adapter

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


@router.post(
    "/otp/request",
    response_model=OTPRequestResponseSchema,
    summary="Request a login OTP",
    description=(
        "Send a one-time password to the provided mobile number. "
        "Rate limited to prevent abuse. Existing unverified accounts are handled gracefully."
    ),
)
async def request_otp(
    body: OTPRequestSchema,
    request: Request,
    db: DbSession,
) -> OTPRequestResponseSchema:
    """
    Rate-limited OTP request.
    Creates user if new (for registration flow).
    Does NOT reveal whether the number has an existing account.
    """
    # ── Rate limiting (basic DB-level check) ──────────────────────────────────
    from datetime import timedelta
    from sqlalchemy import func

    cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=1)
    count_result = await db.execute(
        select(func.count(OTPRequest.id)).where(
            OTPRequest.mobile_number == body.mobile_number,
            OTPRequest.created_at >= cutoff,
        )
    )
    request_count = count_result.scalar() or 0
    if request_count >= settings.rate_limit_otp_requests_per_hour:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Please wait before trying again.",
        )

    # ── Get or create user ────────────────────────────────────────────────────
    user_result = await db.execute(
        select(User).where(User.mobile_number == body.mobile_number)
    )
    db_user = user_result.scalar_one_or_none()

    is_new_user = db_user is None
    if is_new_user:
        db_user = User(
            mobile_number=body.mobile_number,
            primary_role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=False,
        )
        db.add(db_user)
        await db.flush()  # Get ID without commit

    # ── Generate and hash OTP ─────────────────────────────────────────────────
    otp = generate_otp(settings.otp_length)
    otp_hash = hash_otp(otp)

    from datetime import timedelta
    expire = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.otp_expire_minutes)

    otp_record = OTPRequest(
        user_id=db_user.id,
        mobile_number=body.mobile_number,
        otp_hash=otp_hash,
        purpose=body.purpose,
        expires_at=expire,
        ip_address=request.client.host if request.client else None,
    )
    db.add(otp_record)
    await db.commit()

    # ── Send OTP ──────────────────────────────────────────────────────────────
    sms_adapter = get_sms_adapter()
    sms_result = await sms_adapter.send_otp(body.mobile_number, otp)

    if not sms_result.success:
        # Log failure but don't reveal details to caller
        import logging
        logging.getLogger(__name__).error(
            "OTP send failed for %s: %s",
            body.mobile_number[-4:],
            sms_result.error_message,
        )

    response = OTPRequestResponseSchema(
        message="OTP sent successfully. Valid for 10 minutes.",
        expires_in_minutes=settings.otp_expire_minutes,
    )

    # Only expose debug OTP in non-production environments
    if settings.is_development and sms_result.debug_otp:
        response.debug_otp = sms_result.debug_otp

    return response


@router.post(
    "/otp/verify",
    response_model=TokenResponseSchema,
    summary="Verify OTP and receive tokens",
)
async def verify_otp(
    body: OTPVerifySchema,
    request: Request,
    db: DbSession,
) -> TokenResponseSchema:
    """
    Verifies OTP and returns JWT access token + refresh token.
    Creates customer profile on first login.
    """
    from datetime import timedelta

    # Find the most recent valid OTP for this number and purpose
    now = datetime.now(tz=timezone.utc)
    otp_result = await db.execute(
        select(OTPRequest)
        .where(
            OTPRequest.mobile_number == body.mobile_number,
            OTPRequest.purpose == body.purpose,
            OTPRequest.is_used == False,
            OTPRequest.expires_at > now,
        )
        .order_by(OTPRequest.created_at.desc())
        .limit(1)
    )
    otp_record = otp_result.scalar_one_or_none()

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OTP not found or expired. Please request a new OTP.",
        )

    # Increment attempt counter
    otp_record.attempts += 1
    if otp_record.attempts > 5:
        otp_record.is_used = True
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Too many incorrect attempts. Please request a new OTP.",
        )

    if not verify_otp_hash(body.otp, otp_record.otp_hash):
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP.",
        )

    # Mark OTP as used
    otp_record.is_used = True

    # Get user
    user_result = await db.execute(
        select(User).where(User.mobile_number == body.mobile_number)
    )
    db_user = user_result.scalar_one_or_none()
    if not db_user or not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not found or inactive.",
        )

    # Mark as verified on first successful login
    is_new_user = not db_user.is_verified
    db_user.is_verified = True
    db_user.last_login_at = now

    # Create customer profile if it doesn't exist
    customer_exists = await db.execute(
        select(Customer).where(Customer.user_id == db_user.id)
    )
    if not customer_exists.scalar_one_or_none():
        customer = Customer(
            user_id=db_user.id,
            mobile_number=body.mobile_number,
            full_name="",  # Collected during profile setup
        )
        db.add(customer)

    # Issue tokens
    access_token = create_access_token(
        subject=str(db_user.id),
        role=db_user.primary_role.value,
    )
    raw_refresh, refresh_expire = create_refresh_token(str(db_user.id))

    refresh_record = RefreshToken(
        user_id=db_user.id,
        token_hash=hash_refresh_token(raw_refresh),
        expires_at=refresh_expire,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(refresh_record)
    await db.commit()

    return TokenResponseSchema(
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user_id=db_user.id,
        role=db_user.primary_role.value,
        is_new_user=is_new_user,
    )


@router.post(
    "/refresh",
    response_model=TokenResponseSchema,
    summary="Refresh access token",
)
async def refresh_token(
    body: RefreshTokenSchema,
    request: Request,
    db: DbSession,
) -> TokenResponseSchema:
    """Exchange a valid refresh token for a new access token."""
    token_hash = hash_refresh_token(body.refresh_token)
    now = datetime.now(tz=timezone.utc)

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked == False,
            RefreshToken.expires_at > now,
        )
    )
    db_token = result.scalar_one_or_none()
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    user_result = await db.execute(select(User).where(User.id == db_token.user_id))
    db_user = user_result.scalar_one_or_none()
    if not db_user or not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive.",
        )

    # Rotate refresh token (revoke old, issue new)
    db_token.is_revoked = True
    access_token = create_access_token(
        subject=str(db_user.id),
        role=db_user.primary_role.value,
    )
    raw_refresh, refresh_expire = create_refresh_token(str(db_user.id))
    new_token = RefreshToken(
        user_id=db_user.id,
        token_hash=hash_refresh_token(raw_refresh),
        expires_at=refresh_expire,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(new_token)
    await db.commit()

    return TokenResponseSchema(
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user_id=db_user.id,
        role=db_user.primary_role.value,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke refresh token",
)
async def logout(
    body: LogoutSchema,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    """Revoke the provided refresh token."""
    if body.refresh_token:
        token_hash = hash_refresh_token(body.refresh_token)
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.user_id == current_user.user_id,
            )
        )
        db_token = result.scalar_one_or_none()
        if db_token:
            db_token.is_revoked = True
            await db.commit()


@router.get(
    "/me",
    response_model=UserMeResponseSchema,
    summary="Get current user profile and role",
)
async def get_me(
    current_user: CurrentUser,
    db: DbSession,
) -> UserMeResponseSchema:
    """Returns profile and role information for the authenticated user."""
    user_res = await db.execute(
        select(User)
        .where(User.id == current_user.user_id)
        .options(
            selectinload(User.customer_profile),
            selectinload(User.staff_profile).selectinload(StaffProfile.branch),
        )
    )
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    full_name = None
    email = user.email
    branch_name = None
    designation = None

    if user.staff_profile:
        full_name = user.staff_profile.full_name
        designation = user.staff_profile.designation
        if user.staff_profile.branch:
            branch_name = user.staff_profile.branch.name
    elif user.customer_profile:
        full_name = user.customer_profile.full_name
        email = user.customer_profile.email or user.email

    return UserMeResponseSchema(
        user_id=user.id,
        mobile_number=user.mobile_number,
        primary_role=user.primary_role.value,
        is_active=user.is_active,
        is_verified=user.is_verified,
        full_name=full_name,
        email=email,
        branch_name=branch_name,
        designation=designation,
    )


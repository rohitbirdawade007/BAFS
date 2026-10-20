"""
BAFS — Security utilities
JWT token creation/validation, OTP generation/hashing, password hashing.
"""
import hashlib
import hmac
import random
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=settings.bcrypt_rounds)


# ── Password hashing ──────────────────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ── OTP ───────────────────────────────────────────────────────────────────────

def generate_otp(length: int = 6) -> str:
    """Generate a cryptographically secure numeric OTP."""
    return "".join(random.SystemRandom().choices(string.digits, k=length))


def hash_otp(otp: str) -> str:
    """One-way hash for OTP storage. Use constant-time comparison for verification."""
    return hashlib.sha256(
        (otp + settings.app_secret_key).encode()
    ).hexdigest()


def verify_otp_hash(plain_otp: str, stored_hash: str) -> bool:
    """Constant-time OTP hash comparison."""
    expected = hash_otp(plain_otp)
    return hmac.compare_digest(expected, stored_hash)


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(
    subject: str,
    role: str,
    additional_claims: Optional[dict[str, Any]] = None,
) -> str:
    now = datetime.now(tz=timezone.utc)
    expire = now + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "iat": now,
        "exp": expire,
        "type": "access",
    }
    if additional_claims:
        payload.update(additional_claims)
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> tuple[str, datetime]:
    """
    Returns (token_string, expiry_datetime).
    The token itself is a random secret; we store its hash in the database.
    """
    raw_token = secrets.token_urlsafe(64)
    expire = datetime.now(tz=timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    return raw_token, expire


def hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises JWTError on failure.
    """
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


def generate_reference_number(prefix: str) -> str:
    """
    Generate a unique reference number like LEAD-20241010-A3X9.
    Prefix: LEAD, APP, GRIEV, etc.
    """
    now = datetime.now(tz=timezone.utc)
    date_part = now.strftime("%Y%m%d")
    random_part = "".join(random.SystemRandom().choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}-{date_part}-{random_part}"

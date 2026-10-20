"""
BAFS — Pydantic Schemas for Authentication
"""
import re
from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel, Field, field_validator


INDIAN_MOBILE_RE = re.compile(r"^[6-9]\d{9}$")


def validate_mobile(v: str) -> str:
    cleaned = re.sub(r"[\s\-\+]", "", v)
    if cleaned.startswith("91") and len(cleaned) == 12:
        cleaned = cleaned[2:]
    if not INDIAN_MOBILE_RE.match(cleaned):
        raise ValueError("Enter a valid 10-digit Indian mobile number starting with 6-9")
    return cleaned


class OTPRequestSchema(BaseModel):
    mobile_number: str = Field(..., description="10-digit Indian mobile number")
    purpose: str = Field(default="login", pattern="^(login|verify|register)$")

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile_number(cls, v: str) -> str:
        return validate_mobile(v)


class OTPVerifySchema(BaseModel):
    mobile_number: str
    otp: str = Field(..., min_length=4, max_length=8)
    purpose: str = Field(default="login")

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile_number(cls, v: str) -> str:
        return validate_mobile(v)

    @field_validator("otp")
    @classmethod
    def validate_otp_digits(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("OTP must be numeric")
        return v


class RefreshTokenSchema(BaseModel):
    refresh_token: str


class TokenResponseSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    user_id: uuid.UUID
    role: str
    is_new_user: bool = False


class OTPRequestResponseSchema(BaseModel):
    message: str
    expires_in_minutes: int
    # Only set in development/mock mode — never in production
    debug_otp: Optional[str] = None


class LogoutSchema(BaseModel):
    refresh_token: Optional[str] = None

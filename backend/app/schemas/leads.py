"""
BAFS — Lead Schemas
"""
import re
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.models import LoanCategory, LeadSource, LeadStatus


INDIAN_MOBILE_RE = re.compile(r"^[6-9]\d{9}$")


class LeadCreateSchema(BaseModel):
    """Public lead submission — minimal fields for an enquiry form."""
    full_name: str = Field(..., min_length=2, max_length=200)
    mobile_number: str = Field(..., description="10-digit Indian mobile number")
    email: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    loan_category: LoanCategory
    requested_amount: Optional[Decimal] = Field(None, gt=0, le=100_000_000)
    employment_type: Optional[str] = Field(None, max_length=50)
    monthly_income: Optional[Decimal] = Field(None, gt=0)
    privacy_consent: bool = Field(...)
    marketing_consent: bool = Field(default=False)
    # UTM (populated from query params by the frontend)
    utm_source: Optional[str] = Field(None, max_length=100)
    utm_medium: Optional[str] = Field(None, max_length=100)
    utm_campaign: Optional[str] = Field(None, max_length=100)

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\+]", "", v)
        if cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = cleaned[2:]
        if not INDIAN_MOBILE_RE.match(cleaned):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return cleaned

    @field_validator("privacy_consent")
    @classmethod
    def must_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Privacy consent is required to submit an enquiry")
        return v

    @field_validator("full_name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        return v.strip()


class LeadResponseSchema(BaseModel):
    id: uuid.UUID
    reference_number: str
    full_name: str
    mobile_number: str
    city: Optional[str]
    loan_category: LoanCategory
    requested_amount: Optional[Decimal]
    status: LeadStatus
    source: LeadSource
    created_at: datetime

    model_config = {"from_attributes": True}


class LeadPublicResponseSchema(BaseModel):
    """Minimal response for public website submissions — no internal data."""
    reference_number: str
    message: str
    loan_category: LoanCategory


class LeadDetailSchema(LeadResponseSchema):
    """Full detail for CRM users."""
    email: Optional[str]
    utm_source: Optional[str]
    utm_medium: Optional[str]
    utm_campaign: Optional[str]
    is_duplicate: bool
    notes: Optional[str]
    updated_at: datetime


class LeadUpdateSchema(BaseModel):
    """CRM update — staff only."""
    status: Optional[LeadStatus] = None
    notes: Optional[str] = Field(None, max_length=5000)
    city: Optional[str] = Field(None, max_length=100)


class LeadAssignSchema(BaseModel):
    assigned_to_id: uuid.UUID
    reason: Optional[str] = Field(None, max_length=500)


class LeadListResponseSchema(BaseModel):
    items: list[LeadDetailSchema]
    total: int
    page: int
    page_size: int
    total_pages: int

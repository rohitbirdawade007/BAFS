"""
BAFS — Schemas for Loan Applications, Documents, Submissions, Disbursements & Commissions
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models import (
    ApplicationStatus,
    CommissionStatus,
    DocumentCategory,
    DocumentVerificationStatus,
    EmploymentType,
    LenderSubmissionStatus,
    LoanCategory,
)


# ── Application Schemas ───────────────────────────────────────────────────────

class ApplicationCreateSchema(BaseModel):
    lead_id: Optional[uuid.UUID] = None
    loan_category: LoanCategory
    requested_amount: Decimal = Field(..., gt=0, description="Requested loan amount in INR")
    requested_tenure_months: Optional[int] = Field(None, gt=0, le=360)
    purpose: Optional[str] = Field(None, max_length=500)
    applicant_name: str = Field(..., min_length=2, max_length=200)
    applicant_mobile: str = Field(..., min_length=10, max_length=15)
    employment_type: Optional[EmploymentType] = None
    monthly_income: Optional[Decimal] = Field(None, ge=0)
    existing_emi: Optional[Decimal] = Field(None, ge=0)
    idempotency_key: Optional[str] = Field(None, max_length=100)


class ApplicationStatusUpdateSchema(BaseModel):
    to_status: ApplicationStatus
    reason: Optional[str] = Field(None, max_length=500)


class StatusHistorySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    from_status: Optional[ApplicationStatus] = None
    to_status: ApplicationStatus
    changed_by_id: Optional[uuid.UUID] = None
    reason: Optional[str] = None
    created_at: datetime


# ── Document Schemas ──────────────────────────────────────────────────────────

class DocumentUploadRequestSchema(BaseModel):
    document_category: DocumentCategory
    original_filename: str = Field(..., min_length=1, max_length=500)
    mime_type: str = Field(..., max_length=100)
    file_size_bytes: int = Field(..., gt=0)
    checksum_sha256: Optional[str] = Field(None, max_length=64)


class DocumentUploadResponseSchema(BaseModel):
    document_id: uuid.UUID
    upload_url: str
    storage_key: str
    expires_seconds: int


class DocumentDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    document_category: DocumentCategory
    original_filename: str
    storage_key: str
    mime_type: str
    file_size_bytes: int
    checksum_sha256: Optional[str] = None
    verification_status: DocumentVerificationStatus
    rejection_reason: Optional[str] = None
    uploaded_by_id: uuid.UUID
    created_at: datetime


class DocumentVerifySchema(BaseModel):
    status: DocumentVerificationStatus = Field(
        ...,
        description="Target status: VERIFIED, REJECTED, or RESUBMISSION_REQUIRED",
    )
    notes: Optional[str] = Field(None, max_length=1000)


# ── Lender Submission Schemas ─────────────────────────────────────────────────

class LenderSubmissionCreateSchema(BaseModel):
    lender_id: uuid.UUID
    loan_product_id: Optional[uuid.UUID] = None
    external_reference: Optional[str] = Field(None, max_length=200)
    internal_notes: Optional[str] = Field(None, max_length=2000)
    idempotency_key: Optional[str] = Field(None, max_length=100)


class LenderSubmissionUpdateSchema(BaseModel):
    status: LenderSubmissionStatus
    offered_amount: Optional[Decimal] = Field(None, ge=0)
    offered_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    offered_tenure_months: Optional[int] = Field(None, gt=0)
    decision_reference: Optional[str] = Field(None, max_length=200)
    rejection_reason: Optional[str] = Field(None, max_length=1000)
    internal_notes: Optional[str] = Field(None, max_length=2000)


class LenderSubmissionDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    lender_id: uuid.UUID
    loan_product_id: Optional[uuid.UUID] = None
    submitted_by_id: uuid.UUID
    submission_date: datetime
    external_reference: Optional[str] = None
    status: LenderSubmissionStatus
    offered_amount: Optional[Decimal] = None
    offered_rate: Optional[Decimal] = None
    offered_tenure_months: Optional[int] = None
    decision_date: Optional[datetime] = None
    decision_reference: Optional[str] = None
    rejection_reason: Optional[str] = None
    internal_notes: Optional[str] = None
    created_at: datetime


# ── Disbursement Schemas ──────────────────────────────────────────────────────

class DisbursementCreateSchema(BaseModel):
    lender_submission_id: Optional[uuid.UUID] = None
    disbursement_date: datetime
    disbursed_amount: Decimal = Field(..., gt=0)
    lender_reference: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=1000)
    idempotency_key: Optional[str] = Field(None, max_length=100)


class DisbursementDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    lender_submission_id: Optional[uuid.UUID] = None
    disbursement_date: datetime
    disbursed_amount: Decimal
    lender_reference: Optional[str] = None
    confirmed_by_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    created_at: datetime


# ── Commission & Reconciliation Schemas ───────────────────────────────────────

class CommissionEntryDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    disbursement_id: uuid.UUID
    agreement_id: uuid.UUID
    commission_basis: Decimal
    expected_commission: Decimal
    confirmed_commission: Optional[Decimal] = None
    received_amount: Optional[Decimal] = None
    tds_deducted: Optional[Decimal] = None
    gst_amount: Optional[Decimal] = None
    payout_date: Optional[datetime] = None
    status: CommissionStatus
    notes: Optional[str] = None
    created_at: datetime


class CommissionReconciliationSchema(BaseModel):
    received_amount: Decimal = Field(..., ge=0)
    tds_deducted: Optional[Decimal] = Field(Decimal("0"), ge=0)
    gst_amount: Optional[Decimal] = Field(Decimal("0"), ge=0)
    payout_date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=1000)
    reconciliation_batch_id: Optional[uuid.UUID] = None


# ── Combined Application Detail Schema ────────────────────────────────────────

class ApplicationDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reference_number: str
    customer_id: uuid.UUID
    lead_id: Optional[uuid.UUID] = None
    loan_category: LoanCategory
    requested_amount: Decimal
    requested_tenure_months: Optional[int] = None
    purpose: Optional[str] = None
    status: ApplicationStatus
    assigned_consultant_id: Optional[uuid.UUID] = None
    applicant_name: str
    applicant_mobile: str
    employment_type: Optional[EmploymentType] = None
    monthly_income: Optional[Decimal] = None
    existing_emi: Optional[Decimal] = None
    wizard_step: int
    internal_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    status_history: list[StatusHistorySchema] = []
    documents: list[DocumentDetailSchema] = []
    lender_submissions: list[LenderSubmissionDetailSchema] = []
    disbursements: list[DisbursementDetailSchema] = []


class ApplicationListResponseSchema(BaseModel):
    items: list[ApplicationDetailSchema]
    total: int
    page: int
    page_size: int
    total_pages: int


class LoanProductDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    lender_id: uuid.UUID
    name: str
    loan_category: LoanCategory
    min_amount: Decimal
    max_amount: Decimal
    min_tenure_months: int
    max_tenure_months: int
    indicative_rate_min: Optional[Decimal] = None
    indicative_rate_max: Optional[Decimal] = None
    processing_fee_pct: Optional[Decimal] = None
    description: Optional[str] = None
    eligibility_notes: Optional[str] = None


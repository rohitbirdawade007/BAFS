"""
BAFS — SQLAlchemy ORM Models
Complete normalized schema for the loan consultancy platform.

Design principles:
- UUID primary keys
- UTC timestamps (timezone-aware)
- Decimal columns for all monetary values
- Soft deletion with deleted_at where applicable
- Audit-trail columns on key tables
- Foreign keys with appropriate ON DELETE behaviour
"""
import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ─────────────────────────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────────────────────────

class UserRole(str, PyEnum):
    SUPER_ADMIN = "SUPER_ADMIN"
    OPERATIONS_ADMIN = "OPERATIONS_ADMIN"
    BRANCH_MANAGER = "BRANCH_MANAGER"
    LOAN_CONSULTANT = "LOAN_CONSULTANT"
    DSA_AGENT = "DSA_AGENT"
    DOCUMENT_VERIFIER = "DOCUMENT_VERIFIER"
    FINANCE_OFFICER = "FINANCE_OFFICER"
    CUSTOMER = "CUSTOMER"


class LoanCategory(str, PyEnum):
    PERSONAL = "PERSONAL"
    BUSINESS = "BUSINESS"
    HOME = "HOME"
    LOAN_AGAINST_PROPERTY = "LOAN_AGAINST_PROPERTY"
    VEHICLE = "VEHICLE"
    EDUCATION = "EDUCATION"
    GOLD = "GOLD"
    OTHER = "OTHER"


class EmploymentType(str, PyEnum):
    SALARIED = "SALARIED"
    SELF_EMPLOYED = "SELF_EMPLOYED"
    SELF_EMPLOYED_PROFESSIONAL = "SELF_EMPLOYED_PROFESSIONAL"
    BUSINESS_OWNER = "BUSINESS_OWNER"
    RETIRED = "RETIRED"
    OTHER = "OTHER"


class LeadStatus(str, PyEnum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    QUALIFIED = "QUALIFIED"
    UNQUALIFIED = "UNQUALIFIED"
    CONVERTED = "CONVERTED"
    DUPLICATE = "DUPLICATE"
    LOST = "LOST"
    SPAM = "SPAM"


class LeadSource(str, PyEnum):
    WEBSITE_ENQUIRY = "WEBSITE_ENQUIRY"
    REFERRAL_DSA = "REFERRAL_DSA"
    REFERRAL_CUSTOMER = "REFERRAL_CUSTOMER"
    WALK_IN = "WALK_IN"
    PHONE_CALL = "PHONE_CALL"
    SOCIAL_MEDIA = "SOCIAL_MEDIA"
    CAMPAIGN = "CAMPAIGN"
    OTHER = "OTHER"


class ApplicationStatus(str, PyEnum):
    ENQUIRY_RECEIVED = "ENQUIRY_RECEIVED"
    CONTACT_PENDING = "CONTACT_PENDING"
    DOCUMENTS_PENDING = "DOCUMENTS_PENDING"
    VERIFICATION_IN_PROGRESS = "VERIFICATION_IN_PROGRESS"
    SUBMITTED_TO_LENDER = "SUBMITTED_TO_LENDER"
    UNDER_LENDER_REVIEW = "UNDER_LENDER_REVIEW"
    ADDITIONAL_INFO_REQUIRED = "ADDITIONAL_INFO_REQUIRED"
    APPROVED_BY_LENDER = "APPROVED_BY_LENDER"
    REJECTED_BY_LENDER = "REJECTED_BY_LENDER"
    OFFER_ACCEPTED = "OFFER_ACCEPTED"
    DISBURSEMENT_CONFIRMED = "DISBURSEMENT_CONFIRMED"
    CLOSED = "CLOSED"
    WITHDRAWN = "WITHDRAWN"


class DocumentCategory(str, PyEnum):
    PAN_CARD = "PAN_CARD"
    AADHAAR_MASKED = "AADHAAR_MASKED"
    PASSPORT = "PASSPORT"
    VOTER_ID = "VOTER_ID"
    DRIVING_LICENCE = "DRIVING_LICENCE"
    UTILITY_BILL = "UTILITY_BILL"
    SALARY_SLIP = "SALARY_SLIP"
    BANK_STATEMENT = "BANK_STATEMENT"
    ITR = "ITR"
    FORM_16 = "FORM_16"
    GST_CERTIFICATE = "GST_CERTIFICATE"
    BUSINESS_REGISTRATION = "BUSINESS_REGISTRATION"
    PROPERTY_DOCUMENT = "PROPERTY_DOCUMENT"
    EDUCATION_CERTIFICATE = "EDUCATION_CERTIFICATE"
    PHOTOGRAPH = "PHOTOGRAPH"
    OTHER = "OTHER"


class DocumentVerificationStatus(str, PyEnum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    RESUBMISSION_REQUIRED = "RESUBMISSION_REQUIRED"


class LenderSubmissionStatus(str, PyEnum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    UNDER_REVIEW = "UNDER_REVIEW"
    QUERY_RAISED = "QUERY_RAISED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    DISBURSED = "DISBURSED"
    WITHDRAWN = "WITHDRAWN"


class CommissionStatus(str, PyEnum):
    EXPECTED = "EXPECTED"
    CONFIRMED = "CONFIRMED"
    RECEIVED = "RECEIVED"
    DISPUTED = "DISPUTED"
    REVERSED = "REVERSED"


class NotificationChannel(str, PyEnum):
    SMS = "SMS"
    EMAIL = "EMAIL"
    WHATSAPP = "WHATSAPP"
    PUSH = "PUSH"
    IN_APP = "IN_APP"


class NotificationStatus(str, PyEnum):
    PENDING = "PENDING"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"
    BOUNCED = "BOUNCED"


class GrievanceStatus(str, PyEnum):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    ESCALATED = "ESCALATED"


class PrivacyRequestType(str, PyEnum):
    ACCESS = "ACCESS"
    CORRECTION = "CORRECTION"
    DELETION = "DELETION"
    PORTABILITY = "PORTABILITY"
    OBJECTION = "OBJECTION"


class PrivacyRequestStatus(str, PyEnum):
    RECEIVED = "RECEIVED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"


# ─────────────────────────────────────────────────────────────────────────────
# Mixins
# ─────────────────────────────────────────────────────────────────────────────

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None


# ─────────────────────────────────────────────────────────────────────────────
# Users & Roles
# ─────────────────────────────────────────────────────────────────────────────

class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    mobile_number: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # Primary role — for quick checks; detailed permissions via user_roles
    primary_role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.CUSTOMER, nullable=False
    )
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    mfa_secret: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    user_roles: Mapped[list["UserRoleAssignment"]] = relationship(
        "UserRoleAssignment",
        foreign_keys="[UserRoleAssignment.user_id]",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    otp_requests: Mapped[list["OTPRequest"]] = relationship(
        "OTPRequest", back_populates="user"
    )
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    customer_profile: Mapped[Optional["Customer"]] = relationship(
        "Customer", back_populates="user", uselist=False
    )
    staff_profile: Mapped[Optional["StaffProfile"]] = relationship(
        "StaffProfile", back_populates="user", uselist=False
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", foreign_keys="[AuditLog.actor_user_id]", back_populates="actor"
    )

    __table_args__ = (
        Index("ix_users_mobile_number", "mobile_number"),
        Index("ix_users_email", "email"),
        Index("ix_users_primary_role", "primary_role"),
    )

    def __repr__(self) -> str:
        return f"<User {self.mobile_number} [{self.primary_role}]>"


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[UserRole] = mapped_column(Enum(UserRole), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_system_role: Mapped[bool] = mapped_column(Boolean, default=True)

    permissions: Mapped[list["RolePermission"]] = relationship(
        "RolePermission", back_populates="role", cascade="all, delete-orphan"
    )
    user_assignments: Mapped[list["UserRoleAssignment"]] = relationship(
        "UserRoleAssignment", back_populates="role"
    )


class Permission(Base, TimestampMixin):
    __tablename__ = "permissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    resource: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # read/write/delete/admin
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    role_permissions: Mapped[list["RolePermission"]] = relationship(
        "RolePermission", back_populates="permission"
    )

    __table_args__ = (
        UniqueConstraint("resource", "action", name="uq_permission_resource_action"),
    )


class RolePermission(Base, TimestampMixin):
    __tablename__ = "role_permissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False
    )

    role: Mapped["Role"] = relationship("Role", back_populates="permissions")
    permission: Mapped["Permission"] = relationship("Permission", back_populates="role_permissions")

    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
    )


class UserRoleAssignment(Base, TimestampMixin):
    __tablename__ = "user_roles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False
    )
    granted_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="user_roles")
    role: Mapped["Role"] = relationship("Role", back_populates="user_assignments")

    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uq_user_role"),
    )


class OTPRequest(Base, TimestampMixin):
    __tablename__ = "otp_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    mobile_number: Mapped[str] = mapped_column(String(15), nullable=False)
    otp_hash: Mapped[str] = mapped_column(String(255), nullable=False)  # hashed, never plain
    purpose: Mapped[str] = mapped_column(String(50), nullable=False)  # login, verify
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="otp_requests")

    __table_args__ = (
        Index("ix_otp_mobile_created", "mobile_number", "created_at"),
    )


class RefreshToken(Base, TimestampMixin):
    __tablename__ = "refresh_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")


# ─────────────────────────────────────────────────────────────────────────────
# Branches & Staff
# ─────────────────────────────────────────────────────────────────────────────

class Branch(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "branches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    staff_profiles: Mapped[list["StaffProfile"]] = relationship(
        "StaffProfile", back_populates="branch"
    )
    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="branch")


class StaffProfile(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "staff_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), unique=True, nullable=False
    )
    branch_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True
    )
    employee_code: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    designation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    reports_to_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff_profiles.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship("User", back_populates="staff_profile")
    branch: Mapped[Optional["Branch"]] = relationship("Branch", back_populates="staff_profiles")
    reports_to: Mapped[Optional["StaffProfile"]] = relationship(
        "StaffProfile", remote_side="StaffProfile.id"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Customers
# ─────────────────────────────────────────────────────────────────────────────

class Customer(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), unique=True, nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    date_of_birth: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    pan_number: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # stored encrypted
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mobile_number: Mapped[str] = mapped_column(String(15), nullable=False)
    alternate_mobile: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    address_line1: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address_line2: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    employment_type: Mapped[Optional[EmploymentType]] = mapped_column(
        Enum(EmploymentType), nullable=True
    )
    employer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    monthly_income: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    existing_emi_obligations: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    # Privacy flags
    marketing_consent: Mapped[bool] = mapped_column(Boolean, default=False)
    data_processing_consent: Mapped[bool] = mapped_column(Boolean, default=False)
    profile_complete: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship("User", back_populates="customer_profile")
    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="customer")
    applications: Mapped[list["LoanApplication"]] = relationship(
        "LoanApplication", back_populates="customer"
    )
    consent_records: Mapped[list["ConsentRecord"]] = relationship(
        "ConsentRecord", back_populates="customer"
    )
    grievances: Mapped[list["GrievanceCase"]] = relationship(
        "GrievanceCase", back_populates="customer"
    )
    privacy_requests: Mapped[list["PrivacyRequest"]] = relationship(
        "PrivacyRequest", back_populates="customer"
    )

    __table_args__ = (
        Index("ix_customer_mobile", "mobile_number"),
        Index("ix_customer_city", "city"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Leads
# ─────────────────────────────────────────────────────────────────────────────

class Lead(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    reference_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    customer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True
    )
    branch_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True
    )
    # Quick capture fields (may not have a full customer record)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    mobile_number: Mapped[str] = mapped_column(String(15), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    loan_category: Mapped[LoanCategory] = mapped_column(Enum(LoanCategory), nullable=False)
    requested_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2), nullable=True)
    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus), default=LeadStatus.NEW, nullable=False
    )
    source: Mapped[LeadSource] = mapped_column(
        Enum(LeadSource), default=LeadSource.WEBSITE_ENQUIRY, nullable=False
    )
    source_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    # UTM / marketing
    utm_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    utm_medium: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    utm_campaign: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    # Spam protection
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    duplicate_of_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    privacy_consent: Mapped[bool] = mapped_column(Boolean, default=False)
    marketing_consent: Mapped[bool] = mapped_column(Boolean, default=False)

    customer: Mapped[Optional["Customer"]] = relationship("Customer", back_populates="leads")
    branch: Mapped[Optional["Branch"]] = relationship("Branch", back_populates="leads")
    assignments: Mapped[list["LeadAssignment"]] = relationship(
        "LeadAssignment", back_populates="lead", cascade="all, delete-orphan"
    )
    activities: Mapped[list["LeadActivity"]] = relationship(
        "LeadActivity", back_populates="lead", cascade="all, delete-orphan"
    )
    follow_ups: Mapped[list["FollowUpTask"]] = relationship(
        "FollowUpTask", back_populates="lead"
    )
    applications: Mapped[list["LoanApplication"]] = relationship(
        "LoanApplication", back_populates="lead"
    )
    dsa_attribution: Mapped[Optional["DSAAttribution"]] = relationship(
        "DSAAttribution", back_populates="lead", uselist=False
    )

    __table_args__ = (
        Index("ix_leads_status", "status"),
        Index("ix_leads_source", "source"),
        Index("ix_leads_mobile", "mobile_number"),
        Index("ix_leads_created_at", "created_at"),
        Index("ix_leads_loan_category", "loan_category"),
        Index("ix_leads_reference", "reference_number"),
    )


class LeadAssignment(Base, TimestampMixin):
    __tablename__ = "lead_assignments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False
    )
    assigned_to_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    assigned_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)
    reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="assignments")

    __table_args__ = (
        Index("ix_lead_assignment_current", "lead_id", "is_current"),
        Index("ix_lead_assignment_assignee", "assigned_to_id"),
    )


class LeadActivity(Base, TimestampMixin):
    __tablename__ = "lead_activities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False
    )
    actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    outcome: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="activities")

    __table_args__ = (
        Index("ix_lead_activity_lead", "lead_id"),
        Index("ix_lead_activity_created", "created_at"),
    )


class FollowUpTask(Base, TimestampMixin):
    __tablename__ = "follow_up_tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lead_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True
    )
    application_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_applications.id", ondelete="SET NULL"), nullable=True
    )
    assigned_to_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    outcome: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_overdue: Mapped[bool] = mapped_column(Boolean, default=False)

    lead: Mapped[Optional["Lead"]] = relationship("Lead", back_populates="follow_ups")
    application: Mapped[Optional["LoanApplication"]] = relationship(
        "LoanApplication", back_populates="follow_ups"
    )

    __table_args__ = (
        Index("ix_follow_up_due", "due_at"),
        Index("ix_follow_up_assignee", "assigned_to_id"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Lenders & Loan Products
# ─────────────────────────────────────────────────────────────────────────────

class Lender(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "lenders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    short_name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    lender_type: Mapped[str] = mapped_column(String(50), nullable=False)  # BANK, NBFC, HFC
    rbi_registration_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)  # demo/test data flag
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    agreements: Mapped[list["LenderAgreement"]] = relationship(
        "LenderAgreement", back_populates="lender"
    )
    products: Mapped[list["LoanProduct"]] = relationship(
        "LoanProduct", back_populates="lender"
    )
    commission_agreements: Mapped[list["CommissionAgreement"]] = relationship(
        "CommissionAgreement", back_populates="lender"
    )
    submissions: Mapped[list["LenderSubmission"]] = relationship(
        "LenderSubmission", back_populates="lender"
    )


class LenderAgreement(Base, TimestampMixin):
    __tablename__ = "lender_agreements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lenders.id", ondelete="RESTRICT"), nullable=False
    )
    agreement_reference: Mapped[str] = mapped_column(String(100), nullable=False)
    effective_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    effective_to: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    document_storage_key: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    lender: Mapped["Lender"] = relationship("Lender", back_populates="agreements")


class LoanProduct(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "loan_products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lenders.id", ondelete="RESTRICT"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    loan_category: Mapped[LoanCategory] = mapped_column(Enum(LoanCategory), nullable=False)
    min_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    max_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    min_tenure_months: Mapped[int] = mapped_column(Integer, nullable=False)
    max_tenure_months: Mapped[int] = mapped_column(Integer, nullable=False)
    # Indicative rate — not guaranteed
    indicative_rate_min: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4), nullable=True)
    indicative_rate_max: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4), nullable=True)
    processing_fee_pct: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    eligibility_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    required_documents: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    lender: Mapped["Lender"] = relationship("Lender", back_populates="products")
    submissions: Mapped[list["LenderSubmission"]] = relationship(
        "LenderSubmission", back_populates="loan_product"
    )
    commission_agreements: Mapped[list["CommissionAgreement"]] = relationship(
        "CommissionAgreement", back_populates="loan_product"
    )
    eligibility_rule_sets: Mapped[list["EligibilityRuleSet"]] = relationship(
        "EligibilityRuleSet", back_populates="loan_product"
    )

    __table_args__ = (
        Index("ix_loan_product_category", "loan_category"),
        Index("ix_loan_product_lender", "lender_id"),
        CheckConstraint("min_amount <= max_amount", name="ck_product_amount_range"),
        CheckConstraint("min_tenure_months <= max_tenure_months", name="ck_product_tenure_range"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Eligibility Rules
# ─────────────────────────────────────────────────────────────────────────────

class EligibilityRuleSet(Base, TimestampMixin):
    __tablename__ = "eligibility_rule_sets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    loan_product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_products.id", ondelete="RESTRICT"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    effective_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    effective_to: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False)  # JSON rule tree
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    disclaimer: Mapped[str] = mapped_column(
        Text,
        default=(
            "This is an indicative eligibility assessment only. "
            "Final eligibility, loan amount, interest rate, and approval "
            "are subject to the lender's credit assessment and policies."
        ),
    )

    loan_product: Mapped["LoanProduct"] = relationship(
        "LoanProduct", back_populates="eligibility_rule_sets"
    )
    evaluations: Mapped[list["EligibilityEvaluation"]] = relationship(
        "EligibilityEvaluation", back_populates="rule_set"
    )

    __table_args__ = (
        UniqueConstraint("loan_product_id", "version", name="uq_ruleset_product_version"),
    )


class EligibilityEvaluation(Base, TimestampMixin):
    __tablename__ = "eligibility_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_applications.id", ondelete="SET NULL"), nullable=True
    )
    rule_set_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("eligibility_rule_sets.id", ondelete="RESTRICT"), nullable=False
    )
    input_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)  # Minimized, no sensitive data
    result: Mapped[str] = mapped_column(String(50), nullable=False)  # LIKELY_ELIGIBLE, UNLIKELY, INSUFFICIENT_INFO
    rules_passed: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    rules_failed: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    rules_unresolved: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    disclaimer: Mapped[str] = mapped_column(Text, nullable=False)

    rule_set: Mapped["EligibilityRuleSet"] = relationship(
        "EligibilityRuleSet", back_populates="evaluations"
    )
    application: Mapped[Optional["LoanApplication"]] = relationship(
        "LoanApplication", back_populates="eligibility_evaluations"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Loan Applications
# ─────────────────────────────────────────────────────────────────────────────

class LoanApplication(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "loan_applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    reference_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False
    )
    lead_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True
    )
    loan_category: Mapped[LoanCategory] = mapped_column(Enum(LoanCategory), nullable=False)
    requested_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    requested_tenure_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    purpose: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus),
        default=ApplicationStatus.ENQUIRY_RECEIVED,
        nullable=False,
    )
    assigned_consultant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    # Applicant snapshot (cached for reporting; source of truth is customers table)
    applicant_name: Mapped[str] = mapped_column(String(200), nullable=False)
    applicant_mobile: Mapped[str] = mapped_column(String(15), nullable=False)
    employment_type: Mapped[Optional[EmploymentType]] = mapped_column(
        Enum(EmploymentType), nullable=True
    )
    monthly_income: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2), nullable=True)
    existing_emi: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2), nullable=True)
    # Wizard progress
    wizard_step: Mapped[int] = mapped_column(Integer, default=1)
    wizard_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # draft progress
    internal_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Idempotency
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="applications")
    lead: Mapped[Optional["Lead"]] = relationship("Lead", back_populates="applications")
    status_history: Mapped[list["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan"
    )
    documents: Mapped[list["ApplicationDocument"]] = relationship(
        "ApplicationDocument", back_populates="application", cascade="all, delete-orphan"
    )
    lender_submissions: Mapped[list["LenderSubmission"]] = relationship(
        "LenderSubmission", back_populates="application", cascade="all, delete-orphan"
    )
    follow_ups: Mapped[list["FollowUpTask"]] = relationship(
        "FollowUpTask", back_populates="application"
    )
    eligibility_evaluations: Mapped[list["EligibilityEvaluation"]] = relationship(
        "EligibilityEvaluation", back_populates="application"
    )
    disbursements: Mapped[list["Disbursement"]] = relationship(
        "Disbursement", back_populates="application"
    )

    __table_args__ = (
        Index("ix_application_status", "status"),
        Index("ix_application_customer", "customer_id"),
        Index("ix_application_reference", "reference_number"),
        Index("ix_application_created", "created_at"),
        CheckConstraint("requested_amount > 0", name="ck_application_amount_positive"),
    )


class ApplicationStatusHistory(Base, TimestampMixin):
    __tablename__ = "application_status_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False
    )
    from_status: Mapped[Optional[ApplicationStatus]] = mapped_column(Enum(ApplicationStatus), nullable=True)
    to_status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus), nullable=False)
    changed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)

    application: Mapped["LoanApplication"] = relationship(
        "LoanApplication", back_populates="status_history"
    )

    __table_args__ = (
        Index("ix_app_status_history_app", "application_id"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Documents
# ─────────────────────────────────────────────────────────────────────────────

class ApplicationDocument(Base, TimestampMixin):
    __tablename__ = "application_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False
    )
    document_category: Mapped[DocumentCategory] = mapped_column(
        Enum(DocumentCategory), nullable=False
    )
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False)  # S3/MinIO object key
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    checksum_sha256: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    verification_status: Mapped[DocumentVerificationStatus] = mapped_column(
        Enum(DocumentVerificationStatus),
        default=DocumentVerificationStatus.PENDING,
        nullable=False,
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uploaded_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    deletion_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    retention_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    application: Mapped["LoanApplication"] = relationship(
        "LoanApplication", back_populates="documents"
    )
    verification_events: Mapped[list["DocumentVerificationEvent"]] = relationship(
        "DocumentVerificationEvent", back_populates="document", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_doc_application", "application_id"),
        Index("ix_doc_category", "document_category"),
        Index("ix_doc_verification_status", "verification_status"),
    )


class DocumentVerificationEvent(Base, TimestampMixin):
    __tablename__ = "document_verification_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("application_documents.id", ondelete="CASCADE"), nullable=False
    )
    verifier_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # VIEWED, VERIFIED, REJECTED, REQUESTED_RESUBMISSION
    from_status: Mapped[DocumentVerificationStatus] = mapped_column(
        Enum(DocumentVerificationStatus), nullable=False
    )
    to_status: Mapped[DocumentVerificationStatus] = mapped_column(
        Enum(DocumentVerificationStatus), nullable=False
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    document: Mapped["ApplicationDocument"] = relationship(
        "ApplicationDocument", back_populates="verification_events"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Lender Submissions
# ─────────────────────────────────────────────────────────────────────────────

class LenderSubmission(Base, TimestampMixin):
    __tablename__ = "lender_submissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_applications.id", ondelete="RESTRICT"), nullable=False
    )
    lender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lenders.id", ondelete="RESTRICT"), nullable=False
    )
    loan_product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_products.id", ondelete="SET NULL"), nullable=True
    )
    submitted_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    submission_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    external_reference: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    status: Mapped[LenderSubmissionStatus] = mapped_column(
        Enum(LenderSubmissionStatus),
        default=LenderSubmissionStatus.SUBMITTED,
        nullable=False,
    )
    offered_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2), nullable=True)
    offered_rate: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4), nullable=True)
    offered_tenure_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    decision_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    decision_reference: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    internal_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Idempotency: prevent duplicate submissions to same lender
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)

    application: Mapped["LoanApplication"] = relationship(
        "LoanApplication", back_populates="lender_submissions"
    )
    lender: Mapped["Lender"] = relationship("Lender", back_populates="submissions")
    loan_product: Mapped[Optional["LoanProduct"]] = relationship(
        "LoanProduct", back_populates="submissions"
    )
    status_history: Mapped[list["SubmissionStatusHistory"]] = relationship(
        "SubmissionStatusHistory", back_populates="submission", cascade="all, delete-orphan"
    )
    disbursements: Mapped[list["Disbursement"]] = relationship(
        "Disbursement", back_populates="lender_submission"
    )

    __table_args__ = (
        Index("ix_submission_application", "application_id"),
        Index("ix_submission_lender", "lender_id"),
        Index("ix_submission_status", "status"),
    )


class SubmissionStatusHistory(Base, TimestampMixin):
    __tablename__ = "submission_status_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lender_submissions.id", ondelete="CASCADE"), nullable=False
    )
    from_status: Mapped[Optional[LenderSubmissionStatus]] = mapped_column(
        Enum(LenderSubmissionStatus), nullable=True
    )
    to_status: Mapped[LenderSubmissionStatus] = mapped_column(
        Enum(LenderSubmissionStatus), nullable=False
    )
    changed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    source: Mapped[str] = mapped_column(String(50), default="MANUAL")  # MANUAL, WEBHOOK
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    submission: Mapped["LenderSubmission"] = relationship(
        "LenderSubmission", back_populates="status_history"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Disbursements
# ─────────────────────────────────────────────────────────────────────────────

class Disbursement(Base, TimestampMixin):
    __tablename__ = "disbursements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_applications.id", ondelete="RESTRICT"), nullable=False
    )
    lender_submission_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lender_submissions.id", ondelete="SET NULL"), nullable=True
    )
    disbursement_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    disbursed_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    lender_reference: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    confirmed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    confirmation_document_key: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Idempotency key to prevent duplicate disbursement records
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)

    application: Mapped["LoanApplication"] = relationship(
        "LoanApplication", back_populates="disbursements"
    )
    lender_submission: Mapped[Optional["LenderSubmission"]] = relationship(
        "LenderSubmission", back_populates="disbursements"
    )
    commission_entries: Mapped[list["CommissionEntry"]] = relationship(
        "CommissionEntry", back_populates="disbursement"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Commission & Reconciliation
# ─────────────────────────────────────────────────────────────────────────────

class CommissionAgreement(Base, TimestampMixin):
    __tablename__ = "commission_agreements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lenders.id", ondelete="RESTRICT"), nullable=False
    )
    loan_product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_products.id", ondelete="SET NULL"), nullable=True
    )
    loan_category: Mapped[Optional[LoanCategory]] = mapped_column(Enum(LoanCategory), nullable=True)
    commission_type: Mapped[str] = mapped_column(String(50), nullable=False)  # PERCENTAGE, FLAT
    rate_or_amount: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    tds_rate: Mapped[Decimal] = mapped_column(Numeric(6, 4), default=Decimal("0"), nullable=False)
    gst_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    effective_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    effective_to: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)
    agreement_reference: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    lender: Mapped["Lender"] = relationship("Lender", back_populates="commission_agreements")
    loan_product: Mapped[Optional["LoanProduct"]] = relationship(
        "LoanProduct", back_populates="commission_agreements"
    )


class CommissionEntry(Base, TimestampMixin):
    __tablename__ = "commission_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    disbursement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("disbursements.id", ondelete="RESTRICT"), nullable=False
    )
    agreement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("commission_agreements.id", ondelete="RESTRICT"), nullable=False
    )
    commission_basis: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)  # disbursed amount basis
    expected_commission: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    confirmed_commission: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2), nullable=True)
    received_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2), nullable=True)
    tds_deducted: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2), nullable=True)
    gst_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2), nullable=True)
    payout_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[CommissionStatus] = mapped_column(
        Enum(CommissionStatus), default=CommissionStatus.EXPECTED, nullable=False
    )
    reconciliation_batch_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("reconciliation_batches.id", ondelete="SET NULL"), nullable=True
    )
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    disbursement: Mapped["Disbursement"] = relationship("Disbursement", back_populates="commission_entries")
    adjustments: Mapped[list["CommissionAdjustment"]] = relationship(
        "CommissionAdjustment", back_populates="commission_entry"
    )

    __table_args__ = (
        CheckConstraint("expected_commission >= 0", name="ck_commission_expected_positive"),
    )


class CommissionAdjustment(Base, TimestampMixin):
    __tablename__ = "commission_adjustments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    commission_entry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("commission_entries.id", ondelete="RESTRICT"), nullable=False
    )
    adjustment_type: Mapped[str] = mapped_column(String(50), nullable=False)  # CREDIT, DEBIT, REVERSAL, DISPUTE
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    adjusted_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reference_document: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    commission_entry: Mapped["CommissionEntry"] = relationship(
        "CommissionEntry", back_populates="adjustments"
    )


class ReconciliationBatch(Base, TimestampMixin):
    __tablename__ = "reconciliation_batches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lenders.id", ondelete="RESTRICT"), nullable=False
    )
    period_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_to: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    total_expected: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    total_received: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    variance: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="DRAFT")  # DRAFT, SUBMITTED, RECONCILED
    reconciled_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reconciled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    commission_entries: Mapped[list["CommissionEntry"]] = relationship(
        "CommissionEntry",
        foreign_keys="[CommissionEntry.reconciliation_batch_id]",
        primaryjoin="ReconciliationBatch.id == CommissionEntry.reconciliation_batch_id",
    )


# ─────────────────────────────────────────────────────────────────────────────
# DSA / Agent
# ─────────────────────────────────────────────────────────────────────────────

class DSAProfile(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "dsa_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), unique=True, nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    agent_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    pan_number: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    bank_account_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # encrypted
    bank_ifsc: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    agreement_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    agreement_reference: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    total_leads_referred: Mapped[int] = mapped_column(Integer, default=0)
    total_disbursements: Mapped[int] = mapped_column(Integer, default=0)
    total_commission_earned: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=Decimal("0"))

    attributions: Mapped[list["DSAAttribution"]] = relationship(
        "DSAAttribution", back_populates="dsa"
    )


class DSAAttribution(Base, TimestampMixin):
    __tablename__ = "dsa_attributions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    dsa_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dsa_profiles.id", ondelete="RESTRICT"), nullable=False
    )
    lead_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True
    )
    application_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_applications.id", ondelete="SET NULL"), nullable=True
    )
    attribution_type: Mapped[str] = mapped_column(String(50), nullable=False)  # REFERRAL, CONVERSION, DISBURSEMENT
    commission_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    dsa: Mapped["DSAProfile"] = relationship("DSAProfile", back_populates="attributions")
    lead: Mapped[Optional["Lead"]] = relationship("Lead", back_populates="dsa_attribution")


# ─────────────────────────────────────────────────────────────────────────────
# Consent Records
# ─────────────────────────────────────────────────────────────────────────────

class ConsentRecord(Base, TimestampMixin):
    """
    Append-only consent event log.
    Records are never updated or deleted — revocations are new REVOKE events.
    """
    __tablename__ = "consent_records"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False
    )
    purpose: Mapped[str] = mapped_column(String(100), nullable=False)
    notice_version: Mapped[str] = mapped_column(String(20), nullable=False)
    event_type: Mapped[str] = mapped_column(String(20), nullable=False)  # GRANT, REVOKE, UPDATE
    method: Mapped[str] = mapped_column(String(50), nullable=False)  # WEB_FORM, SMS, IN_PERSON
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="consent_records")

    __table_args__ = (
        Index("ix_consent_customer", "customer_id"),
        Index("ix_consent_purpose", "purpose"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Notifications
# ─────────────────────────────────────────────────────────────────────────────

class NotificationTemplate(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "notification_templates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    channel: Mapped[NotificationChannel] = mapped_column(Enum(NotificationChannel), nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    body_template: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    variables: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    template_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("notification_templates.id", ondelete="SET NULL"), nullable=True
    )
    recipient_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    channel: Mapped[NotificationChannel] = mapped_column(Enum(NotificationChannel), nullable=False)
    recipient_address: Mapped[str] = mapped_column(String(500), nullable=False)  # phone/email/token
    subject: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[NotificationStatus] = mapped_column(
        Enum(NotificationStatus), default=NotificationStatus.PENDING, nullable=False
    )
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    provider_reference: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)

    __table_args__ = (
        Index("ix_notification_status", "status"),
        Index("ix_notification_recipient", "recipient_user_id"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Grievances & Privacy
# ─────────────────────────────────────────────────────────────────────────────

class GrievanceCase(Base, TimestampMixin):
    __tablename__ = "grievance_cases"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    reference_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    customer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True
    )
    application_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loan_applications.id", ondelete="SET NULL"), nullable=True
    )
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[GrievanceStatus] = mapped_column(
        Enum(GrievanceStatus), default=GrievanceStatus.OPEN, nullable=False
    )
    assigned_to_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resolution: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    escalated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    due_by: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    contact_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_mobile: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)

    customer: Mapped[Optional["Customer"]] = relationship("Customer", back_populates="grievances")


class PrivacyRequest(Base, TimestampMixin):
    __tablename__ = "privacy_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    reference_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False
    )
    request_type: Mapped[PrivacyRequestType] = mapped_column(Enum(PrivacyRequestType), nullable=False)
    status: Mapped[PrivacyRequestStatus] = mapped_column(
        Enum(PrivacyRequestStatus), default=PrivacyRequestStatus.RECEIVED, nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    handled_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    due_by: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="privacy_requests")


# ─────────────────────────────────────────────────────────────────────────────
# Audit Log
# ─────────────────────────────────────────────────────────────────────────────

class AuditLog(Base):
    """
    Immutable audit trail. No updates or deletes on this table.
    """
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    actor_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    actor_role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    changes: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)

    actor: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[actor_user_id], back_populates="audit_logs"
    )

    __table_args__ = (
        Index("ix_audit_log_actor", "actor_user_id"),
        Index("ix_audit_log_resource", "resource_type", "resource_id"),
        Index("ix_audit_log_created", "created_at"),
        Index("ix_audit_log_action", "action"),
    )

"""
BAFS — Leads API Endpoints
POST /api/v1/leads              — Public enquiry submission
GET  /api/v1/crm/leads         — CRM lead list (staff only)
GET  /api/v1/crm/leads/{id}    — CRM lead detail (staff only)
PATCH /api/v1/crm/leads/{id}   — CRM lead update (staff only)
PATCH /api/v1/crm/leads/{id}/assignment — Lead assignment (staff only)
POST /api/v1/crm/leads/{id}/activities  — Log activity (staff only)
"""
import math
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import AuthenticatedUser, CurrentUser, DbSession, require_roles, require_staff
from app.core.security import generate_reference_number
from app.models import (
    AuditLog,
    Lead,
    LeadActivity,
    LeadAssignment,
    LeadSource,
    LeadStatus,
    LoanCategory,
    User,
    UserRole,
)
from app.schemas.leads import (
    LeadAssignSchema,
    LeadCreateSchema,
    LeadDetailSchema,
    LeadListResponseSchema,
    LeadPublicResponseSchema,
    LeadUpdateSchema,
)

router = APIRouter(tags=["Leads"])


# ─────────────────────────────────────────────────────────────────────────────
# Public endpoint — no auth required
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/leads",
    response_model=LeadPublicResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a loan enquiry",
    description=(
        "Public endpoint for website visitors to submit a loan enquiry. "
        "Returns a reference number. No authentication required."
    ),
)
async def create_lead(
    body: LeadCreateSchema,
    request: Request,
    db: DbSession,
) -> LeadPublicResponseSchema:
    """
    Creates a new lead in the database.
    Performs duplicate detection based on mobile + category + time window.
    """
    # ── Duplicate detection (same mobile + same category within 24 hours) ─────
    from datetime import timedelta
    cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=24)

    dup_result = await db.execute(
        select(Lead).where(
            Lead.mobile_number == body.mobile_number,
            Lead.loan_category == body.loan_category,
            Lead.created_at >= cutoff,
            Lead.deleted_at.is_(None),
        ).order_by(Lead.created_at.desc()).limit(1)
    )
    existing = dup_result.scalar_one_or_none()

    if existing:
        # Return the existing reference — same data, don't create duplicate
        return LeadPublicResponseSchema(
            reference_number=existing.reference_number,
            message=(
                "We already have your enquiry on file. "
                "Our team will contact you shortly. "
                f"Reference: {existing.reference_number}"
            ),
            loan_category=body.loan_category,
        )

    # ── Rate limiting (same IP, different leads) ──────────────────────────────
    ip = request.client.host if request.client else None
    if ip:
        from datetime import timedelta
        ip_cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=1)
        ip_count_result = await db.execute(
            select(func.count(Lead.id)).where(
                Lead.ip_address == ip,
                Lead.created_at >= ip_cutoff,
            )
        )
        ip_count = ip_count_result.scalar() or 0
        if ip_count >= 10:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many submissions from this IP. Please try again later.",
            )

    # ── Create lead ───────────────────────────────────────────────────────────
    ref = generate_reference_number("LEAD")
    lead = Lead(
        reference_number=ref,
        full_name=body.full_name,
        mobile_number=body.mobile_number,
        email=body.email,
        city=body.city,
        loan_category=body.loan_category,
        requested_amount=body.requested_amount,
        source=LeadSource.WEBSITE_ENQUIRY,
        status=LeadStatus.NEW,
        utm_source=body.utm_source,
        utm_medium=body.utm_medium,
        utm_campaign=body.utm_campaign,
        ip_address=ip,
        privacy_consent=body.privacy_consent,
        marketing_consent=body.marketing_consent,
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)

    # ── Audit log ─────────────────────────────────────────────────────────────
    audit = AuditLog(
        action="LEAD_CREATED",
        resource_type="Lead",
        resource_id=str(lead.id),
        ip_address=ip,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(audit)
    await db.commit()

    return LeadPublicResponseSchema(
        reference_number=ref,
        message=(
            "Thank you for your enquiry! Our team will contact you within 24 hours. "
            f"Your reference number is {ref}."
        ),
        loan_category=body.loan_category,
    )


# ─────────────────────────────────────────────────────────────────────────────
# CRM endpoints — staff only
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/crm/leads",
    response_model=LeadListResponseSchema,
    summary="List leads (CRM)",
    dependencies=[require_staff()],
)
async def list_leads(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    status: Optional[LeadStatus] = Query(default=None),
    source: Optional[LeadSource] = Query(default=None),
    loan_category: Optional[LoanCategory] = Query(default=None),
    city: Optional[str] = Query(default=None, max_length=100),
    assigned_to: Optional[uuid.UUID] = Query(default=None),
    search: Optional[str] = Query(default=None, max_length=100),
    date_from: Optional[datetime] = Query(default=None),
    date_to: Optional[datetime] = Query(default=None),
) -> LeadListResponseSchema:
    """
    Paginated, filtered lead list for CRM.
    Consultants see only their assigned leads (unless admin/manager).
    """
    query = select(Lead).where(Lead.deleted_at.is_(None))

    # ── Access control: consultants see assigned leads + unassigned leads ─────
    if current_user.role == UserRole.LOAN_CONSULTANT:
        assigned_to_me = (
            select(LeadAssignment.lead_id)
            .where(
                LeadAssignment.assigned_to_id == current_user.user_id,
                LeadAssignment.is_current == True,
            )
        )
        any_current_assigned = (
            select(LeadAssignment.lead_id)
            .where(LeadAssignment.is_current == True)
        )
        query = query.where(
            or_(
                Lead.id.in_(assigned_to_me),
                ~Lead.id.in_(any_current_assigned),
            )
        )
    elif current_user.role == UserRole.DSA_AGENT:
        from app.models import DSAAttribution
        attributed_sub = (
            select(DSAAttribution.lead_id)
            .where(DSAAttribution.dsa_id == current_user.user_id)
        )
        query = query.where(Lead.id.in_(attributed_sub))

    # ── Filters ───────────────────────────────────────────────────────────────
    if status:
        query = query.where(Lead.status == status)
    if source:
        query = query.where(Lead.source == source)
    if loan_category:
        query = query.where(Lead.loan_category == loan_category)
    if city:
        query = query.where(func.lower(Lead.city).contains(city.lower()))
    if assigned_to:
        assigned_sub = (
            select(LeadAssignment.lead_id)
            .where(
                LeadAssignment.assigned_to_id == assigned_to,
                LeadAssignment.is_current == True,
            )
        )
        query = query.where(Lead.id.in_(assigned_sub))
    if search:
        query = query.where(
            or_(
                Lead.full_name.ilike(f"%{search}%"),
                Lead.mobile_number.contains(search),
                Lead.reference_number.ilike(f"%{search}%"),
                Lead.email.ilike(f"%{search}%"),
            )
        )
    if date_from:
        query = query.where(Lead.created_at >= date_from)
    if date_to:
        query = query.where(Lead.created_at <= date_to)

    # ── Count ─────────────────────────────────────────────────────────────────
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar() or 0

    # ── Paginate ──────────────────────────────────────────────────────────────
    offset = (page - 1) * page_size
    result = await db.execute(
        query.order_by(Lead.created_at.desc()).offset(offset).limit(page_size)
    )
    leads = result.scalars().all()

    return LeadListResponseSchema(
        items=[LeadDetailSchema.model_validate(lead) for lead in leads],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.get(
    "/crm/leads/{lead_id}",
    response_model=LeadDetailSchema,
    summary="Get lead detail (CRM)",
    dependencies=[require_staff()],
)
async def get_lead(
    lead_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> LeadDetailSchema:
    """Get full lead detail. Enforces record-level access control."""
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.deleted_at.is_(None))
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    # Record-level authorization for consultants
    if current_user.role == UserRole.LOAN_CONSULTANT:
        assigned = await db.execute(
            select(LeadAssignment).where(
                LeadAssignment.lead_id == lead_id,
                LeadAssignment.assigned_to_id == current_user.user_id,
                LeadAssignment.is_current == True,
            )
        )
        if not assigned.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this lead",
            )

    return LeadDetailSchema.model_validate(lead)


@router.patch(
    "/crm/leads/{lead_id}",
    response_model=LeadDetailSchema,
    summary="Update lead (CRM)",
    dependencies=[require_staff()],
)
async def update_lead(
    lead_id: uuid.UUID,
    body: LeadUpdateSchema,
    current_user: CurrentUser,
    db: DbSession,
) -> LeadDetailSchema:
    """Update lead status and notes."""
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.deleted_at.is_(None))
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)

    # Log activity
    activity = LeadActivity(
        lead_id=lead.id,
        actor_id=current_user.user_id,
        activity_type="STATUS_UPDATE",
        description=f"Status updated to {body.status.value if body.status else 'N/A'}",
    )
    db.add(activity)

    # Audit
    audit = AuditLog(
        actor_user_id=current_user.user_id,
        actor_role=current_user.role.value,
        action="LEAD_UPDATED",
        resource_type="Lead",
        resource_id=str(lead_id),
        changes=update_data,
    )
    db.add(audit)
    await db.commit()
    await db.refresh(lead)
    return LeadDetailSchema.model_validate(lead)


@router.patch(
    "/crm/leads/{lead_id}/assignment",
    response_model=LeadDetailSchema,
    summary="Assign lead to consultant",
)
async def assign_lead(
    lead_id: uuid.UUID,
    body: LeadAssignSchema,
    current_user: CurrentUser,
    db: DbSession,
    _: AuthenticatedUser = require_roles(
        UserRole.SUPER_ADMIN,
        UserRole.OPERATIONS_ADMIN,
        UserRole.BRANCH_MANAGER,
        UserRole.LOAN_CONSULTANT,
    ),
) -> LeadDetailSchema:
    """Assign a lead to a consultant. Closes previous assignment."""
    if current_user.role == UserRole.LOAN_CONSULTANT and body.assigned_to_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Consultants may only self-assign unassigned leads",
        )

    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.deleted_at.is_(None))
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    # Verify assignee exists
    assignee = await db.execute(select(User).where(User.id == body.assigned_to_id))
    if not assignee.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignee not found")

    # Close current assignment
    current_assignments = await db.execute(
        select(LeadAssignment).where(
            LeadAssignment.lead_id == lead_id,
            LeadAssignment.is_current == True,
        )
    )
    for assignment in current_assignments.scalars():
        assignment.is_current = False

    # Create new assignment
    new_assignment = LeadAssignment(
        lead_id=lead_id,
        assigned_to_id=body.assigned_to_id,
        assigned_by_id=current_user.user_id,
        is_current=True,
        reason=body.reason,
    )
    if lead.status == LeadStatus.NEW:
        lead.status = LeadStatus.CONTACTED

    db.add(new_assignment)

    # Log activity
    activity = LeadActivity(
        lead_id=lead_id,
        actor_id=current_user.user_id,
        activity_type="ASSIGNMENT",
        description=f"Lead assigned to user {body.assigned_to_id}",
    )
    db.add(activity)

    await db.commit()
    await db.refresh(lead)
    return LeadDetailSchema.model_validate(lead)


@router.post(
    "/crm/leads/{lead_id}/assign",
    response_model=LeadDetailSchema,
    summary="Self-assign lead to current consultant",
)
async def self_assign_lead(
    lead_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
    _: AuthenticatedUser = require_roles(
        UserRole.SUPER_ADMIN,
        UserRole.OPERATIONS_ADMIN,
        UserRole.BRANCH_MANAGER,
        UserRole.LOAN_CONSULTANT,
    ),
) -> LeadDetailSchema:
    """Convenience endpoint allowing consultants to self-assign unassigned leads with a single POST."""
    return await assign_lead(
        lead_id=lead_id,
        body=LeadAssignSchema(assigned_to_id=current_user.user_id, reason="Self-assigned by consultant"),
        current_user=current_user,
        db=db,
        _=_,
    )



"""
BAFS — Loan Applications, Documents, Lender Submissions, Disbursements & Commissions Endpoints
"""
import math
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.deps import AuthenticatedUser, CurrentUser, DbSession, require_roles, require_staff
from app.core.security import generate_reference_number
from app.models import (
    ApplicationDocument,
    ApplicationStatus,
    ApplicationStatusHistory,
    AuditLog,
    CommissionAgreement,
    CommissionEntry,
    CommissionStatus,
    Customer,
    Disbursement,
    DocumentCategory,
    DocumentVerificationEvent,
    DocumentVerificationStatus,
    Lead,
    LeadStatus,
    Lender,
    LenderSubmission,
    LenderSubmissionStatus,
    LoanApplication,
    LoanCategory,
    LoanProduct,
    SubmissionStatusHistory,
    User,
    UserRole,
)
from app.schemas.applications import (
    ApplicationCreateSchema,
    ApplicationDetailSchema,
    ApplicationListResponseSchema,
    ApplicationStatusUpdateSchema,
    CommissionEntryDetailSchema,
    CommissionReconciliationSchema,
    DisbursementCreateSchema,
    DisbursementDetailSchema,
    DocumentDetailSchema,
    DocumentUploadRequestSchema,
    DocumentUploadResponseSchema,
    DocumentVerifySchema,
    LenderSubmissionCreateSchema,
    LenderSubmissionDetailSchema,
    LenderSubmissionUpdateSchema,
    LoanProductDetailSchema,
)
from app.services.storage import get_storage_client

settings = get_settings()
router = APIRouter(tags=["Applications & Operations"])


# ── Helper Functions ──────────────────────────────────────────────────────────

async def get_or_create_customer(user: AuthenticatedUser, body: ApplicationCreateSchema, db: AsyncSession) -> Customer:
    """Find existing customer profile for user or create one."""
    result = await db.execute(select(Customer).where(Customer.user_id == user.user_id))
    customer = result.scalar_one_or_none()
    if not customer:
        customer = Customer(
            user_id=user.user_id,
            full_name=body.applicant_name,
            mobile_number=body.applicant_mobile,
            employment_type=body.employment_type,
            monthly_income=body.monthly_income,
            existing_emi_obligations=body.existing_emi,
            data_processing_consent=True,
        )
        db.add(customer)
        await db.flush()
    return customer


async def fetch_application_with_relations(app_id: uuid.UUID, db: AsyncSession) -> Optional[LoanApplication]:
    """Fetch loan application with all related collections eagerly loaded."""
    stmt = (
        select(LoanApplication)
        .where(LoanApplication.id == app_id, LoanApplication.deleted_at.is_(None))
        .options(
            selectinload(LoanApplication.customer),
            selectinload(LoanApplication.status_history),
            selectinload(LoanApplication.documents),
            selectinload(LoanApplication.lender_submissions),
            selectinload(LoanApplication.disbursements),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


def verify_application_access(application: LoanApplication, user: AuthenticatedUser) -> None:
    """Enforce data isolation between customers, consultants, and management."""
    if user.is_admin():
        return
    if user.role == UserRole.CUSTOMER:
        if application.customer and application.customer.user_id != user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view or modify this application",
            )
        return
    if user.role in (UserRole.LOAN_CONSULTANT, UserRole.DOCUMENT_VERIFIER, UserRole.FINANCE_OFFICER, UserRole.BRANCH_MANAGER):
        # Staff members have access to review applications assigned to them or their branch
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


# ── 0. Loan Products Catalogue ───────────────────────────────────────────────

@router.get(
    "/loan-products",
    response_model=list[LoanProductDetailSchema],
    summary="List available loan products and interest rates",
)
async def list_loan_products(
    db: DbSession,
    category: Optional[LoanCategory] = Query(None),
) -> list[LoanProductDetailSchema]:
    """Public catalogue of loan products with indicative rates, tenures, and eligibility requirements."""
    query = select(LoanProduct).where(LoanProduct.is_active == True, LoanProduct.deleted_at.is_(None))
    if category:
        query = query.where(LoanProduct.loan_category == category)
    result = await db.execute(query.order_by(LoanProduct.name))
    return [LoanProductDetailSchema.model_validate(p) for p in result.scalars().all()]


# ── 1. Application Endpoints ──────────────────────────────────────────────────

@router.post(
    "/applications",
    response_model=ApplicationDetailSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a loan application",
)
async def create_application(
    body: ApplicationCreateSchema,
    current_user: CurrentUser,
    db: DbSession,
) -> ApplicationDetailSchema:
    """
    Creates a new loan application.
    - Idempotency check: returns existing application if key matches.
    - Links or creates customer record.
    - Updates lead status to CONVERTED if lead_id is provided.
    - Inserts initial status history.
    """
    # ── Idempotency Check ─────────────────────────────────────────────────────
    if body.idempotency_key:
        existing = await db.execute(
            select(LoanApplication).where(LoanApplication.idempotency_key == body.idempotency_key)
        )
        existing_app = existing.scalar_one_or_none()
        if existing_app:
            loaded = await fetch_application_with_relations(existing_app.id, db)
            return ApplicationDetailSchema.model_validate(loaded)

    customer = await get_or_create_customer(current_user, body, db)
    ref_num = generate_reference_number("APP")

    app = LoanApplication(
        reference_number=ref_num,
        customer_id=customer.id,
        lead_id=body.lead_id,
        loan_category=body.loan_category,
        requested_amount=body.requested_amount,
        requested_tenure_months=body.requested_tenure_months,
        purpose=body.purpose,
        status=ApplicationStatus.ENQUIRY_RECEIVED,
        applicant_name=body.applicant_name,
        applicant_mobile=body.applicant_mobile,
        employment_type=body.employment_type,
        monthly_income=body.monthly_income,
        existing_emi=body.existing_emi,
        idempotency_key=body.idempotency_key,
    )
    db.add(app)
    await db.flush()

    # Initial Status History
    status_history = ApplicationStatusHistory(
        application_id=app.id,
        from_status=None,
        to_status=ApplicationStatus.ENQUIRY_RECEIVED,
        changed_by_id=current_user.user_id,
        reason="Application created",
    )
    db.add(status_history)

    # If linked to a lead, update lead to CONVERTED
    if body.lead_id:
        lead_res = await db.execute(select(Lead).where(Lead.id == body.lead_id))
        lead = lead_res.scalar_one_or_none()
        if lead:
            lead.status = LeadStatus.CONVERTED
            lead.customer_id = customer.id

    # Audit Log
    db.add(
        AuditLog(
            actor_user_id=current_user.user_id,
            actor_role=current_user.role.value,
            action="APPLICATION_CREATED",
            resource_type="LoanApplication",
            resource_id=str(app.id),
            changes={"reference_number": ref_num, "amount": str(body.requested_amount)},
        )
    )

    await db.commit()
    loaded = await fetch_application_with_relations(app.id, db)
    return ApplicationDetailSchema.model_validate(loaded)


@router.get(
    "/applications",
    response_model=ApplicationListResponseSchema,
    summary="List loan applications",
)
async def list_applications(
    current_user: CurrentUser,
    db: DbSession,
    status: Optional[ApplicationStatus] = Query(None),
    loan_category: Optional[LoanCategory] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> ApplicationListResponseSchema:
    """Lists applications with customer and role data isolation."""
    query = (
        select(LoanApplication)
        .where(LoanApplication.deleted_at.is_(None))
        .options(
            selectinload(LoanApplication.customer),
            selectinload(LoanApplication.status_history),
            selectinload(LoanApplication.documents),
            selectinload(LoanApplication.lender_submissions),
            selectinload(LoanApplication.disbursements),
        )
    )

    if current_user.role == UserRole.CUSTOMER:
        # Only applications belonging to this customer
        cust_res = await db.execute(select(Customer.id).where(Customer.user_id == current_user.user_id))
        cust_id = cust_res.scalar_one_or_none()
        if not cust_id:
            return ApplicationListResponseSchema(items=[], total=0, page=page, page_size=page_size, total_pages=1)
        query = query.where(LoanApplication.customer_id == cust_id)
    elif current_user.role == UserRole.LOAN_CONSULTANT:
        query = query.where(
            or_(
                LoanApplication.assigned_consultant_id == current_user.user_id,
                LoanApplication.assigned_consultant_id.is_(None),
            )
        )

    if status:
        query = query.where(LoanApplication.status == status)
    if loan_category:
        query = query.where(LoanApplication.loan_category == loan_category)

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    offset = (page - 1) * page_size
    result = await db.execute(query.order_by(LoanApplication.created_at.desc()).offset(offset).limit(page_size))
    apps = result.scalars().all()

    return ApplicationListResponseSchema(
        items=[ApplicationDetailSchema.model_validate(a) for a in apps],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.get(
    "/applications/{application_id}",
    response_model=ApplicationDetailSchema,
    summary="Get loan application detail",
)
async def get_application(
    application_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> ApplicationDetailSchema:
    """Gets application detail with full timeline, documents, and lender submissions."""
    app = await fetch_application_with_relations(application_id, db)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Verify access permission
    verify_application_access(app, current_user)
    return ApplicationDetailSchema.model_validate(app)


# ── 2. Document Upload & Verification ─────────────────────────────────────────

@router.post(
    "/applications/{application_id}/documents/upload-url",
    response_model=DocumentUploadResponseSchema,
    summary="Get presigned document upload URL",
)
async def request_document_upload_url(
    application_id: uuid.UUID,
    body: DocumentUploadRequestSchema,
    current_user: CurrentUser,
    db: DbSession,
) -> DocumentUploadResponseSchema:
    """
    Validates MIME type, file size and permissions, then creates an ApplicationDocument
    record and returns an S3/MinIO presigned PUT URL.
    """
    app = await fetch_application_with_relations(application_id, db)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    verify_application_access(app, current_user)

    # Validate MIME type
    allowed = (
        settings.allowed_mime_types
        if isinstance(settings.allowed_mime_types, list)
        else [m.strip() for m in settings.allowed_mime_types.split(",")]
    )
    if body.mime_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MIME type '{body.mime_type}' not allowed. Allowed types: {allowed}",
        )

    # Validate file size
    if body.file_size_bytes > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.max_upload_size_mb} MB",
        )

    storage = get_storage_client()
    storage_key = storage.generate_document_key(
        application_id=app.id,
        document_category=body.document_category.value,
        original_filename=body.original_filename,
    )

    doc = ApplicationDocument(
        application_id=app.id,
        document_category=body.document_category,
        original_filename=body.original_filename,
        storage_key=storage_key,
        mime_type=body.mime_type,
        file_size_bytes=body.file_size_bytes,
        checksum_sha256=body.checksum_sha256,
        verification_status=DocumentVerificationStatus.PENDING,
        uploaded_by_id=current_user.user_id,
    )
    db.add(doc)

    # If application is in ENQUIRY_RECEIVED, advance status to DOCUMENTS_PENDING
    if app.status == ApplicationStatus.ENQUIRY_RECEIVED:
        app.status = ApplicationStatus.DOCUMENTS_PENDING
        db.add(
            ApplicationStatusHistory(
                application_id=app.id,
                from_status=ApplicationStatus.ENQUIRY_RECEIVED,
                to_status=ApplicationStatus.DOCUMENTS_PENDING,
                changed_by_id=current_user.user_id,
                reason="Initial document registered for upload",
            )
        )

    await db.commit()
    await db.refresh(doc)

    expires = settings.signed_url_expire_seconds
    upload_url = await storage.generate_upload_url(
        object_key=storage_key,
        content_type=body.mime_type,
        expires_seconds=expires,
    )

    return DocumentUploadResponseSchema(
        document_id=doc.id,
        upload_url=upload_url,
        storage_key=storage_key,
        expires_seconds=expires,
    )


@router.get(
    "/documents/{document_id}/download-url",
    summary="Get presigned document download URL",
)
async def get_document_download_url(
    document_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Generates a secure presigned download URL for an uploaded document."""
    doc_res = await db.execute(
        select(ApplicationDocument).where(
            ApplicationDocument.id == document_id,
            ApplicationDocument.deleted_at.is_(None),
        )
    )
    doc = doc_res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    app = await fetch_application_with_relations(doc.application_id, db)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    verify_application_access(app, current_user)

    storage = get_storage_client()
    download_url = await storage.generate_download_url(
        object_key=doc.storage_key,
        expires_seconds=settings.signed_url_expire_seconds,
        filename=doc.original_filename,
    )
    return {
        "document_id": doc.id,
        "download_url": download_url,
        "filename": doc.original_filename,
        "expires_seconds": settings.signed_url_expire_seconds,
    }


@router.post(
    "/documents/{document_id}/verify",
    response_model=DocumentDetailSchema,
    summary="Record document verification result",
    dependencies=[require_staff()],
)
async def verify_document(
    document_id: uuid.UUID,
    body: DocumentVerifySchema,
    current_user: CurrentUser,
    db: DbSession,
) -> DocumentDetailSchema:
    """Authorized verifier or consultant records document verification decision."""
    doc_res = await db.execute(
        select(ApplicationDocument).where(
            ApplicationDocument.id == document_id,
            ApplicationDocument.deleted_at.is_(None),
        )
    )
    doc = doc_res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    old_status = doc.verification_status
    doc.verification_status = body.status
    if body.status == DocumentVerificationStatus.REJECTED:
        doc.rejection_reason = body.notes

    # Record verification event log
    event = DocumentVerificationEvent(
        document_id=doc.id,
        verifier_id=current_user.user_id,
        action=f"STATUS_SET_TO_{body.status.value}",
        from_status=old_status,
        to_status=body.status,
        notes=body.notes,
    )
    db.add(event)

    # Check if application status should transition to VERIFICATION_IN_PROGRESS
    app = await fetch_application_with_relations(doc.application_id, db)
    if app and app.status in (ApplicationStatus.ENQUIRY_RECEIVED, ApplicationStatus.DOCUMENTS_PENDING):
        app.status = ApplicationStatus.VERIFICATION_IN_PROGRESS
        db.add(
            ApplicationStatusHistory(
                application_id=app.id,
                from_status=app.status,
                to_status=ApplicationStatus.VERIFICATION_IN_PROGRESS,
                changed_by_id=current_user.user_id,
                reason=f"Document verification underway by {current_user.mobile}",
            )
        )

    await db.commit()
    await db.refresh(doc)
    return DocumentDetailSchema.model_validate(doc)


# ── 3. Lender Submissions ─────────────────────────────────────────────────────

@router.post(
    "/applications/{application_id}/lender-submissions",
    response_model=LenderSubmissionDetailSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Record submission of application to a lender",
    dependencies=[require_staff()],
)
async def create_lender_submission(
    application_id: uuid.UUID,
    body: LenderSubmissionCreateSchema,
    current_user: CurrentUser,
    db: DbSession,
) -> LenderSubmissionDetailSchema:
    """
    Consultant submits application file to bank/lender.
    - Idempotency check.
    - Creates LenderSubmission.
    - Advances application status to SUBMITTED_TO_LENDER.
    - Records timeline logs.
    """
    app = await fetch_application_with_relations(application_id, db)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Verify lender exists
    lender_res = await db.execute(select(Lender).where(Lender.id == body.lender_id))
    lender = lender_res.scalar_one_or_none()
    if not lender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lender not found")

    # Idempotency check
    if body.idempotency_key:
        ex = await db.execute(
            select(LenderSubmission).where(LenderSubmission.idempotency_key == body.idempotency_key)
        )
        existing = ex.scalar_one_or_none()
        if existing:
            return LenderSubmissionDetailSchema.model_validate(existing)

    submission = LenderSubmission(
        application_id=app.id,
        lender_id=body.lender_id,
        loan_product_id=body.loan_product_id,
        submitted_by_id=current_user.user_id,
        submission_date=datetime.now(timezone.utc),
        external_reference=body.external_reference,
        status=LenderSubmissionStatus.SUBMITTED,
        internal_notes=body.internal_notes,
        idempotency_key=body.idempotency_key,
    )
    db.add(submission)
    await db.flush()

    # Submission status history
    db.add(
        SubmissionStatusHistory(
            submission_id=submission.id,
            from_status=None,
            to_status=LenderSubmissionStatus.SUBMITTED,
            changed_by_id=current_user.user_id,
            source="MANUAL",
            notes=f"Submitted to {lender.name}",
        )
    )

    # Advance Application Status to SUBMITTED_TO_LENDER
    old_app_status = app.status
    app.status = ApplicationStatus.SUBMITTED_TO_LENDER
    db.add(
        ApplicationStatusHistory(
            application_id=app.id,
            from_status=old_app_status,
            to_status=ApplicationStatus.SUBMITTED_TO_LENDER,
            changed_by_id=current_user.user_id,
            reason=f"Application file submitted to {lender.name} (Ref: {body.external_reference or 'N/A'})",
        )
    )

    await db.commit()
    await db.refresh(submission)
    return LenderSubmissionDetailSchema.model_validate(submission)


@router.patch(
    "/lender-submissions/{submission_id}",
    response_model=LenderSubmissionDetailSchema,
    summary="Update lender submission status and decision",
    dependencies=[require_staff()],
)
async def update_lender_submission(
    submission_id: uuid.UUID,
    body: LenderSubmissionUpdateSchema,
    current_user: CurrentUser,
    db: DbSession,
) -> LenderSubmissionDetailSchema:
    """Updates lender submission status (APPROVED, REJECTED, etc.) and updates application status accordingly."""
    sub_res = await db.execute(select(LenderSubmission).where(LenderSubmission.id == submission_id))
    submission = sub_res.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    old_status = submission.status
    submission.status = body.status
    if body.offered_amount is not None:
        submission.offered_amount = body.offered_amount
    if body.offered_rate is not None:
        submission.offered_rate = body.offered_rate
    if body.offered_tenure_months is not None:
        submission.offered_tenure_months = body.offered_tenure_months
    if body.decision_reference is not None:
        submission.decision_reference = body.decision_reference
    if body.rejection_reason is not None:
        submission.rejection_reason = body.rejection_reason
    if body.internal_notes is not None:
        submission.internal_notes = body.internal_notes
    submission.decision_date = datetime.now(timezone.utc)

    # History
    db.add(
        SubmissionStatusHistory(
            submission_id=submission.id,
            from_status=old_status,
            to_status=body.status,
            changed_by_id=current_user.user_id,
            source="MANUAL",
            notes=body.internal_notes,
        )
    )

    # Synchronize Application Status if appropriate
    app = await fetch_application_with_relations(submission.application_id, db)
    if app:
        new_app_status = None
        if body.status == LenderSubmissionStatus.APPROVED:
            new_app_status = ApplicationStatus.APPROVED_BY_LENDER
        elif body.status == LenderSubmissionStatus.REJECTED:
            new_app_status = ApplicationStatus.REJECTED_BY_LENDER

        if new_app_status and new_app_status != app.status:
            old_app_status = app.status
            app.status = new_app_status
            db.add(
                ApplicationStatusHistory(
                    application_id=app.id,
                    from_status=old_app_status,
                    to_status=new_app_status,
                    changed_by_id=current_user.user_id,
                    reason=f"Lender updated status to {body.status.value}",
                )
            )

    await db.commit()
    await db.refresh(submission)
    return LenderSubmissionDetailSchema.model_validate(submission)


# ── 4. Disbursements ──────────────────────────────────────────────────────────

@router.post(
    "/applications/{application_id}/disbursements",
    response_model=DisbursementDetailSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Record verified loan disbursement",
    dependencies=[require_staff()],
)
async def record_disbursement(
    application_id: uuid.UUID,
    body: DisbursementCreateSchema,
    current_user: CurrentUser,
    db: DbSession,
) -> DisbursementDetailSchema:
    """
    Records verified disbursement.
    - Creates Disbursement record.
    - Updates application status to DISBURSEMENT_CONFIRMED.
    - Calculates expected commission based on active CommissionAgreement.
    - Generates expected CommissionEntry for finance reconciliation.
    """
    app = await fetch_application_with_relations(application_id, db)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Idempotency
    if body.idempotency_key:
        ex = await db.execute(select(Disbursement).where(Disbursement.idempotency_key == body.idempotency_key))
        existing = ex.scalar_one_or_none()
        if existing:
            return DisbursementDetailSchema.model_validate(existing)

    disbursement = Disbursement(
        application_id=app.id,
        lender_submission_id=body.lender_submission_id,
        disbursement_date=body.disbursement_date,
        disbursed_amount=body.disbursed_amount,
        lender_reference=body.lender_reference,
        confirmed_by_id=current_user.user_id,
        notes=body.notes,
        idempotency_key=body.idempotency_key,
    )
    db.add(disbursement)
    await db.flush()

    # Update submission status to DISBURSED
    if body.lender_submission_id:
        sub_res = await db.execute(select(LenderSubmission).where(LenderSubmission.id == body.lender_submission_id))
        sub = sub_res.scalar_one_or_none()
        if sub:
            sub.status = LenderSubmissionStatus.DISBURSED
            db.add(
                SubmissionStatusHistory(
                    submission_id=sub.id,
                    from_status=sub.status,
                    to_status=LenderSubmissionStatus.DISBURSED,
                    changed_by_id=current_user.user_id,
                    source="MANUAL",
                    notes="Disbursement confirmed",
                )
            )

    # Advance Application Status to DISBURSEMENT_CONFIRMED
    old_app_status = app.status
    app.status = ApplicationStatus.DISBURSEMENT_CONFIRMED
    db.add(
        ApplicationStatusHistory(
            application_id=app.id,
            from_status=old_app_status,
            to_status=ApplicationStatus.DISBURSEMENT_CONFIRMED,
            changed_by_id=current_user.user_id,
            reason=f"Disbursement of ₹{body.disbursed_amount:,.2f} recorded",
        )
    )

    # ── Automated Commission Calculation & Accrual ────────────────────────────
    # Find lender from submission or first submission
    lender_id = None
    loan_prod_id = None
    if body.lender_submission_id and sub:
        lender_id = sub.lender_id
        loan_prod_id = sub.loan_product_id
    elif app.lender_submissions:
        lender_id = app.lender_submissions[0].lender_id
        loan_prod_id = app.lender_submissions[0].loan_product_id

    if lender_id:
        agr_res = await db.execute(
            select(CommissionAgreement)
            .where(
                CommissionAgreement.lender_id == lender_id,
                CommissionAgreement.is_current == True,
            )
            .limit(1)
        )
        agreement = agr_res.scalar_one_or_none()

        if agreement:
            # Calculate commission
            if agreement.commission_type == "PERCENTAGE":
                expected_comm = body.disbursed_amount * (agreement.rate_or_amount / Decimal("100"))
            else:
                expected_comm = agreement.rate_or_amount

            # Calculate TDS
            tds_amount = expected_comm * (agreement.tds_rate / Decimal("100")) if agreement.tds_rate else Decimal("0")
            gst_amount = expected_comm * Decimal("0.18") if agreement.gst_applicable else Decimal("0")

            comm_entry = CommissionEntry(
                disbursement_id=disbursement.id,
                agreement_id=agreement.id,
                commission_basis=body.disbursed_amount,
                expected_commission=expected_comm,
                tds_deducted=tds_amount,
                gst_amount=gst_amount,
                status=CommissionStatus.EXPECTED,
                notes=f"Auto-calculated for agreement {agreement.agreement_reference or agreement.id}",
            )
            db.add(comm_entry)

    await db.commit()
    await db.refresh(disbursement)
    return DisbursementDetailSchema.model_validate(disbursement)


# ── 5. Commission & Financial Reconciliation ──────────────────────────────────

@router.get(
    "/commissions",
    response_model=list[CommissionEntryDetailSchema],
    summary="List commission entries",
    dependencies=[require_roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS_ADMIN, UserRole.FINANCE_OFFICER)],
)
async def list_commissions(
    current_user: CurrentUser,
    db: DbSession,
    status: Optional[CommissionStatus] = Query(None),
) -> list[CommissionEntryDetailSchema]:
    """Finance officer lists commission entries and payout statuses."""
    query = select(CommissionEntry)
    if status:
        query = query.where(CommissionEntry.status == status)
    result = await db.execute(query.order_by(CommissionEntry.created_at.desc()))
    entries = result.scalars().all()
    return [CommissionEntryDetailSchema.model_validate(e) for e in entries]


@router.post(
    "/commissions/{commission_id}/reconcile",
    response_model=CommissionEntryDetailSchema,
    summary="Reconcile expected commission with received payout",
    dependencies=[require_roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS_ADMIN, UserRole.FINANCE_OFFICER)],
)
async def reconcile_commission(
    commission_id: uuid.UUID,
    body: CommissionReconciliationSchema,
    current_user: CurrentUser,
    db: DbSession,
) -> CommissionEntryDetailSchema:
    """Finance reconciles expected commission with actual received bank payout."""
    comm_res = await db.execute(select(CommissionEntry).where(CommissionEntry.id == commission_id))
    comm = comm_res.scalar_one_or_none()
    if not comm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Commission entry not found")

    comm.received_amount = body.received_amount
    comm.tds_deducted = body.tds_deducted
    comm.gst_amount = body.gst_amount
    comm.payout_date = body.payout_date or datetime.now(timezone.utc)
    comm.reconciliation_batch_id = body.reconciliation_batch_id
    if body.notes:
        comm.notes = (comm.notes or "") + f"\n[Reconciled]: {body.notes}"

    # Determine status
    variance = abs(comm.expected_commission - body.received_amount)
    if variance < Decimal("1.00"):
        comm.status = CommissionStatus.RECEIVED
    else:
        # If variance exists, mark CONFIRMED or DISPUTED depending on difference
        comm.status = CommissionStatus.RECEIVED if body.received_amount > 0 else CommissionStatus.DISPUTED

    # Audit
    db.add(
        AuditLog(
            actor_user_id=current_user.user_id,
            actor_role=current_user.role.value,
            action="COMMISSION_RECONCILED",
            resource_type="CommissionEntry",
            resource_id=str(comm.id),
            changes={
                "expected": str(comm.expected_commission),
                "received": str(body.received_amount),
                "status": comm.status.value,
            },
        )
    )

    await db.commit()
    await db.refresh(comm)
    return CommissionEntryDetailSchema.model_validate(comm)

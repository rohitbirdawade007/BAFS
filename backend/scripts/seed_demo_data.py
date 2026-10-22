"""
BAFS — Initial Reference Data Seeder
Populates default branches, lenders, loan products, commission agreements, and staff accounts.
Safe to run multiple times (idempotent).
"""
import asyncio
import sys
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.models import (
    Branch,
    CommissionAgreement,
    Lender,
    LoanCategory,
    LoanProduct,
    StaffProfile,
    User,
    UserRole,
)


async def seed():
    print("=" * 60)
    print(" BAFS Reference Data Seeder")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        # ── 1. Default Branch ─────────────────────────────────────────────────
        branch_res = await db.execute(select(Branch).where(Branch.code == "PUN-01"))
        branch = branch_res.scalar_one_or_none()
        if not branch:
            branch = Branch(
                name="Pune Headquarters & Main Branch",
                code="PUN-01",
                address="Shivajinagar, FC Road",
                city="Pune",
                state="Maharashtra",
                pincode="411005",
                phone="020-25500000",
                email="pune@birdawade.com",
                is_active=True,
            )
            db.add(branch)
            await db.flush()
            print(f"[+] Created Branch: {branch.name} ({branch.code})")
        else:
            print(f"[OK] Branch exists: {branch.name}")

        # ── 2. Staff Users ────────────────────────────────────────────────────
        staff_defs = [
            ("7038119511", UserRole.OPERATIONS_ADMIN, "Rohit Birdawade", "Operations Head"),
            ("9822100001", UserRole.LOAN_CONSULTANT, "Rajesh Shinde", "Senior Loan Consultant"),
            ("9822100002", UserRole.DOCUMENT_VERIFIER, "Pooja Kadam", "Document Verification Specialist"),
            ("9822100003", UserRole.FINANCE_OFFICER, "Sunil More", "Finance & Payouts Officer"),
        ]

        for mobile, role, name, designation in staff_defs:
            user_res = await db.execute(select(User).where(User.mobile_number == mobile))
            user = user_res.scalar_one_or_none()
            if not user:
                user = User(
                    mobile_number=mobile,
                    primary_role=role,
                    is_active=True,
                    is_verified=True,
                )
                db.add(user)
                await db.flush()

                profile = StaffProfile(
                    user_id=user.id,
                    branch_id=branch.id,
                    full_name=name,
                    designation=designation,
                    is_active=True,
                )
                db.add(profile)
                print(f"[+] Created Staff User: {name} [{role.value}] ({mobile})")
            else:
                user.primary_role = role
                user.is_active = True
                user.is_verified = True
                print(f"[OK] Staff User exists: {name} [{role.value}] ({mobile})")

        # ── 3. Lenders ────────────────────────────────────────────────────────
        lenders_data = [
            ("HDFC Bank Limited", "HDFC", "BANK", "HDFC0001", "https://hdfcbank.com"),
            ("ICICI Bank Limited", "ICICI", "BANK", "ICIC0001", "https://icicibank.com"),
            ("State Bank of India", "SBI", "BANK", "SBIN0001", "https://sbi.co.in"),
            ("Bajaj Housing Finance Ltd", "BAJAJ_HFL", "HFC", "BHFL0001", "https://bajajhousingfinance.in"),
        ]

        lender_objects = {}
        for name, short, ltype, rbi_no, web in lenders_data:
            l_res = await db.execute(select(Lender).where(Lender.short_name == short))
            lender = l_res.scalar_one_or_none()
            if not lender:
                lender = Lender(
                    name=name,
                    short_name=short,
                    lender_type=ltype,
                    rbi_registration_number=rbi_no,
                    website=web,
                    is_active=True,
                    is_demo=False,
                )
                db.add(lender)
                await db.flush()
                print(f"[+] Created Lender: {name} ({short})")
            else:
                print(f"[OK] Lender exists: {name}")
            lender_objects[short] = lender

        # ── 4. Loan Products ──────────────────────────────────────────────────
        hdfc = lender_objects["HDFC"]
        prod_res = await db.execute(select(LoanProduct).where(LoanProduct.lender_id == hdfc.id, LoanProduct.name == "HDFC Home Loan"))
        home_loan_prod = prod_res.scalar_one_or_none()
        if not home_loan_prod:
            home_loan_prod = LoanProduct(
                lender_id=hdfc.id,
                name="HDFC Home Loan",
                loan_category=LoanCategory.HOME,
                min_amount=Decimal("500000"),
                max_amount=Decimal("100000000"),
                min_tenure_months=12,
                max_tenure_months=360,
                indicative_rate_min=Decimal("0.0840"),
                indicative_rate_max=Decimal("0.0950"),
                processing_fee_pct=Decimal("0.0050"),
                is_active=True,
            )
            db.add(home_loan_prod)
            await db.flush()
            print(f"[+] Created Loan Product: HDFC Home Loan")
        else:
            print(f"[OK] Loan Product exists: {home_loan_prod.name}")

        # ── 5. Commission Agreements ──────────────────────────────────────────
        comm_res = await db.execute(
            select(CommissionAgreement).where(
                CommissionAgreement.lender_id == hdfc.id,
                CommissionAgreement.is_current == True,
            )
        )
        agreement = comm_res.scalar_one_or_none()
        if not agreement:
            agreement = CommissionAgreement(
                lender_id=hdfc.id,
                loan_product_id=home_loan_prod.id,
                loan_category=LoanCategory.HOME,
                commission_type="PERCENTAGE",
                rate_or_amount=Decimal("0.6500"),  # 0.65% commission payout
                tds_rate=Decimal("5.0000"),         # 5% TDS
                gst_applicable=True,
                effective_from=datetime.now(timezone.utc),
                is_current=True,
                agreement_reference="AGR-HDFC-2026-01",
                notes="Standard institutional DSA agreement with HDFC Bank",
            )
            db.add(agreement)
            print(f"[+] Created Commission Agreement: HDFC Bank @ 0.65%")
        else:
            print(f"[OK] Commission Agreement exists: {agreement.agreement_reference}")

        await db.commit()
        print("\n[SUCCESS] Seeding completed successfully!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())

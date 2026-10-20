"""
BAFS — FastAPI Dependencies
Authentication, authorization, and database injection.
"""
import uuid
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import User, UserRole

settings = get_settings()
bearer_scheme = HTTPBearer(auto_error=False)


class AuthenticatedUser:
    """Lightweight user context extracted from JWT for authorization checks."""

    def __init__(self, user_id: uuid.UUID, mobile: str, role: UserRole, is_active: bool):
        self.user_id = user_id
        self.mobile = mobile
        self.role = role
        self.is_active = is_active

    def has_any_role(self, *roles: UserRole) -> bool:
        return self.role in roles

    def is_admin(self) -> bool:
        return self.role in (UserRole.SUPER_ADMIN, UserRole.OPERATIONS_ADMIN)

    def is_staff(self) -> bool:
        return self.role not in (UserRole.CUSTOMER,)


async def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthenticatedUser:
    """
    Validate Bearer JWT and return an AuthenticatedUser.
    Raises 401 for missing/invalid tokens, 403 for inactive accounts.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise credentials_exception

    try:
        payload = decode_access_token(credentials.credentials)
        user_id_str: str = payload.get("sub", "")
        role_str: str = payload.get("role", "")
        token_type: str = payload.get("type", "")
        if not user_id_str or token_type != "access":
            raise credentials_exception
        user_id = uuid.UUID(user_id_str)
        role = UserRole(role_str)
    except (JWTError, ValueError, KeyError):
        raise credentials_exception

    # Verify user still exists and is active
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()
    if not db_user or not db_user.is_active or db_user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or does not exist",
        )

    return AuthenticatedUser(
        user_id=db_user.id,
        mobile=db_user.mobile_number,
        role=db_user.primary_role,
        is_active=db_user.is_active,
    )


CurrentUser = Annotated[AuthenticatedUser, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_db)]


def require_roles(*roles: UserRole):
    """Dependency factory to enforce that the current user has one of the given roles."""
    async def _check(current_user: CurrentUser) -> AuthenticatedUser:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of: {[r.value for r in roles]}",
            )
        return current_user
    return Depends(_check)


def require_admin():
    return require_roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS_ADMIN)


def require_staff():
    return require_roles(
        UserRole.SUPER_ADMIN,
        UserRole.OPERATIONS_ADMIN,
        UserRole.BRANCH_MANAGER,
        UserRole.LOAN_CONSULTANT,
        UserRole.DSA_AGENT,
        UserRole.DOCUMENT_VERIFIER,
        UserRole.FINANCE_OFFICER,
    )

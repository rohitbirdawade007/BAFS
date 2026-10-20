"""
BAFS — pytest configuration and shared fixtures
"""
import asyncio
import os
import uuid
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.database import Base, get_db
from app.main import app

# ── Test database URL ─────────────────────────────────────────────────────────
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "sqlite+aiosqlite:///./test_bafs.db",
)


@pytest.fixture(scope="session")
def event_loop():
    """Create a session-scoped event loop for async tests."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()
    if "sqlite" in TEST_DATABASE_URL and os.path.exists("./test_bafs.db"):
        try:
            os.remove("./test_bafs.db")
        except Exception:
            pass


@pytest_asyncio.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Transactional test session — rolled back after each test."""
    factory = async_sessionmaker(bind=test_engine, expire_on_commit=False)
    async with factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """HTTP client with overridden DB dependency."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


# ── Helper factories ──────────────────────────────────────────────────────────

async def create_test_user(db: AsyncSession, mobile: str = "9876543210", role: str = "CUSTOMER"):
    from app.models import User, UserRole
    user = User(
        mobile_number=mobile,
        primary_role=UserRole(role),
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    await db.flush()
    return user


async def get_auth_token(client: AsyncClient, mobile: str = "9876543210") -> str:
    """Get a valid JWT for testing. Uses mock OTP."""
    # Request OTP
    req = await client.post("/api/v1/auth/otp/request", json={"mobile_number": mobile})
    otp = "000000"
    if req.status_code == 200:
        data = req.json()
        otp = data.get("debug_otp", "000000")

    resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"mobile_number": mobile, "otp": otp},
    )
    data = resp.json()
    return data.get("access_token", "")

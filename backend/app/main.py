"""
BAFS — FastAPI Application Entry Point
"""
import logging
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.api.v1.endpoints import applications, auth, leads

settings = get_settings()

# ── Structured Logging ────────────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer() if not settings.debug else structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)
logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = structlog.get_logger()


# ── Application Lifespan ──────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("BAFS backend starting up", env=settings.app_env)
    # Initialize MinIO bucket in background task to avoid blocking startup
    try:
        import asyncio
        from app.services.storage import get_storage_client
        storage = get_storage_client()
        asyncio.create_task(storage.ensure_bucket_exists())
        logger.info("Storage bucket check scheduled")
    except Exception as exc:
        logger.warning("Storage initialization skipped", error=str(exc))

    yield

    logger.info("BAFS backend shutting down")


# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    description=(
        "REST API for Birdawade Associates & Financial Services — "
        "loan consultancy and DSA management platform."
    ),
    version=settings.app_version,
    docs_url="/api/docs" if not settings.is_production else None,
    redoc_url="/api/redoc" if not settings.is_production else None,
    openapi_url="/api/openapi.json" if not settings.is_production else None,
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Total-Count", "X-Request-ID"],
)


# ── Security Headers ──────────────────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# ── Global Exception Handler ──────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception", path=str(request.url), exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred. Please try again later."},
    )


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"], summary="Health check")
async def health_check():
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "env": settings.app_env,
    }


@app.get("/api/v1/health", tags=["Health"], summary="API health check")
async def api_health():
    return {"status": "ok", "api_version": "v1"}


# ── API Routes ────────────────────────────────────────────────────────────────

PREFIX = settings.api_v1_prefix

app.include_router(auth.router, prefix=PREFIX)
app.include_router(leads.router, prefix=PREFIX)
app.include_router(applications.router, prefix=PREFIX)

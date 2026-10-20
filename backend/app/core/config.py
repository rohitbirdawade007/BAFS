"""
BAFS Backend — Application Configuration
Loads all settings from environment variables with sensible development defaults.
"""
from functools import lru_cache
from typing import Annotated, Any, Union

from pydantic import AnyHttpUrl, Field, PostgresDsn, RedisDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ───────────────────────────────────────────────
    app_env: str = "development"
    app_name: str = "Birdawade Associates & Financial Services"
    app_version: str = "1.0.0"
    app_secret_key: str = "INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION"
    debug: bool = False

    # ── API ───────────────────────────────────────────────────────
    api_v1_prefix: str = "/api/v1"
    backend_port: int = 8000
    allowed_origins: Union[list[str], str] = ["http://localhost:3000", "http://localhost:8000"]

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",")]
        return v

    # ── Database ──────────────────────────────────────────────────
    database_url: str = (
        "postgresql+asyncpg://bafs_user:changeme@localhost:5432/bafs_db"
    )

    @field_validator("database_url", mode="after")
    @classmethod
    def resolve_db_host(cls, v: str) -> str:
        # Automatically upgrade standard postgresql:// or postgres:// to postgresql+asyncpg://
        if v.startswith("postgresql://"):
            v = "postgresql+asyncpg://" + v[len("postgresql://"):]
        elif v.startswith("postgres://"):
            v = "postgresql+asyncpg://" + v[len("postgres://"):]

        # Convert Neon/cloud ?sslmode=require parameter for asyncpg compatibility
        if "sslmode=require" in v:
            v = v.replace("sslmode=require", "ssl=require")

        # Strip unsupported asyncpg parameters like channel_binding
        if "channel_binding=" in v:
            import re
            v = re.sub(r"[&?]channel_binding=[^&]+", "", v)
            if "?" not in v and "&" in v:
                v = v.replace("&", "?", 1)

        if "@db:" in v:
            import socket
            try:
                socket.gethostbyname("db")
            except Exception:
                return v.replace("@db:", "@localhost:")
        return v

    # ── Redis ─────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    @field_validator("redis_url", mode="after")
    @classmethod
    def resolve_redis_host(cls, v: str) -> str:
        if "@redis:" in v or "://redis:" in v:
            import socket
            try:
                socket.gethostbyname("redis")
            except Exception:
                return v.replace("://redis:", "://localhost:").replace("@redis:", "@localhost:")
        return v

    # ── Storage (MinIO / S3) ──────────────────────────────────────
    storage_backend: str = "minio"
    minio_endpoint: str = "localhost:9000"

    @field_validator("minio_endpoint", mode="after")
    @classmethod
    def resolve_minio_host(cls, v: str) -> str:
        if v.startswith("minio:"):
            import socket
            try:
                socket.gethostbyname("minio")
            except Exception:
                return v.replace("minio:", "localhost:")
        return v

    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin123"
    minio_bucket_documents: str = "bafs-documents"
    minio_use_ssl: bool = False
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "ap-south-1"
    s3_bucket_documents: str = ""
    signed_url_expire_seconds: int = 900

    # ── Authentication ────────────────────────────────────────────
    jwt_secret_key: str = "INSECURE_JWT_KEY_CHANGE_IN_PRODUCTION"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    otp_expire_minutes: int = 10
    otp_length: int = 6

    # ── SMS / OTP ─────────────────────────────────────────────────
    sms_provider: str = "mock"
    msg91_auth_key: str = ""
    msg91_template_id_otp: str = ""
    msg91_sender_id: str = "BAFSEC"

    # ── Email ─────────────────────────────────────────────────────
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from_address: str = "birdawadeassociate@gmail.com"
    email_from_name: str = "Birdawade Associate and Financial Services"

    # ── Rate Limiting ─────────────────────────────────────────────
    rate_limit_otp_requests_per_hour: int = 5
    rate_limit_lead_submissions_per_hour: int = 10
    rate_limit_api_requests_per_minute: int = 60

    # ── File Upload ───────────────────────────────────────────────
    max_upload_size_mb: int = 20
    allowed_mime_types: Union[list[str], str] = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
    ]

    @field_validator("allowed_mime_types", mode="before")
    @classmethod
    def parse_mime_types(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            return [m.strip() for m in v.split(",")]
        return v

    # ── Logging ───────────────────────────────────────────────────
    log_level: str = "INFO"
    log_format: str = "json"

    # ── Security ──────────────────────────────────────────────────
    bcrypt_rounds: int = 12
    session_cookie_secure: bool = False

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.app_env.lower() == "production":
            insecure_markers = ("INSECURE", "CHANGE_ME")
            if any(m in self.app_secret_key for m in insecure_markers):
                raise ValueError(
                    "APP_SECRET_KEY cannot use default/insecure value in production! "
                    "Generate a strong 32-byte hex key: openssl rand -hex 32"
                )
            if any(m in self.jwt_secret_key for m in insecure_markers):
                raise ValueError(
                    "JWT_SECRET_KEY cannot use default/insecure value in production! "
                    "Generate a strong 64-byte hex key: openssl rand -hex 64"
                )
            # Enforce secure cookies in production
            object.__setattr__(self, "session_cookie_secure", True)
            # Ensure debug is disabled
            object.__setattr__(self, "debug", False)
        return self

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.app_env.lower() == "development"

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()

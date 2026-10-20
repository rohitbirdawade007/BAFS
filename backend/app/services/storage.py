"""
BAFS — Storage Service (MinIO / S3-compatible)
Provides signed URLs for upload/download, never exposes public paths.
"""
import uuid
from abc import ABC, abstractmethod
from datetime import timedelta
from typing import Optional

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.core.config import get_settings

settings = get_settings()


class BaseStorageClient(ABC):
    @abstractmethod
    async def ensure_bucket_exists(self) -> None: ...

    @abstractmethod
    async def generate_upload_url(
        self,
        object_key: str,
        content_type: str,
        expires_seconds: int = 900,
    ) -> str: ...

    @abstractmethod
    async def generate_download_url(
        self,
        object_key: str,
        expires_seconds: int = 900,
        filename: Optional[str] = None,
    ) -> str: ...

    @abstractmethod
    async def delete_object(self, object_key: str) -> None: ...

    def generate_document_key(
        self,
        application_id: uuid.UUID,
        document_category: str,
        original_filename: str,
    ) -> str:
        """
        Generate a deterministic storage key.
        Pattern: applications/{app_id}/{category}/{uuid}_{safe_filename}
        """
        safe_filename = "".join(
            c if c.isalnum() or c in "._-" else "_" for c in original_filename
        )[:100]
        unique_id = uuid.uuid4().hex[:8]
        return f"applications/{application_id}/{document_category.lower()}/{unique_id}_{safe_filename}"


class MinIOStorageClient(BaseStorageClient):
    """S3-compatible storage via MinIO."""

    def __init__(self):
        if settings.minio_endpoint.startswith(("http://", "https://")):
            endpoint_url = settings.minio_endpoint
        else:
            endpoint_url = (
                f"https://{settings.minio_endpoint}"
                if settings.minio_use_ssl
                else f"http://{settings.minio_endpoint}"
            )
        self._client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=settings.minio_access_key,
            aws_secret_access_key=settings.minio_secret_key,
            config=Config(signature_version="s3v4", connect_timeout=1, read_timeout=1, retries={"max_attempts": 0}),
            region_name="us-east-1",  # Required but ignored by MinIO
        )
        self._bucket = settings.minio_bucket_documents

    async def ensure_bucket_exists(self) -> None:
        import asyncio
        loop = asyncio.get_running_loop()
        try:
            await loop.run_in_executor(None, lambda: self._client.head_bucket(Bucket=self._bucket))
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                await loop.run_in_executor(None, lambda: self._client.create_bucket(Bucket=self._bucket))
            else:
                raise
        except Exception:
            # Storage offline; uploads disabled until MinIO starts
            pass

    async def generate_upload_url(
        self,
        object_key: str,
        content_type: str,
        expires_seconds: int = 900,
    ) -> str:
        return self._client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self._bucket,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=expires_seconds,
        )

    async def generate_download_url(
        self,
        object_key: str,
        expires_seconds: int = 900,
        filename: Optional[str] = None,
    ) -> str:
        params: dict = {"Bucket": self._bucket, "Key": object_key}
        if filename:
            params["ResponseContentDisposition"] = f'attachment; filename="{filename}"'
        return self._client.generate_presigned_url(
            "get_object",
            Params=params,
            ExpiresIn=expires_seconds,
        )

    async def delete_object(self, object_key: str) -> None:
        self._client.delete_object(Bucket=self._bucket, Key=object_key)


def get_storage_client() -> BaseStorageClient:
    """Factory — returns configured storage client."""
    backend = settings.storage_backend.lower()
    if backend in ("minio", "s3"):
        return MinIOStorageClient()
    raise ValueError(f"Unknown storage backend: {backend}")

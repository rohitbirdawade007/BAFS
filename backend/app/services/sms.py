"""
BAFS — SMS/OTP Notification Service
Provider-independent adapter pattern.

Adapters:
  - MockSMSAdapter: logs OTP to console, returns debug_otp in dev mode
  - MSG91Adapter: real MSG91 API (requires configuration)

The active adapter is selected by the SMS_PROVIDER environment variable.
"""
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class SMSResult:
    success: bool
    provider_reference: Optional[str] = None
    error_message: Optional[str] = None
    debug_otp: Optional[str] = None  # Only populated in mock mode


class BaseSMSAdapter(ABC):
    @abstractmethod
    async def send_otp(self, mobile_number: str, otp: str) -> SMSResult:
        """Send OTP to the given mobile number."""
        ...


class MockSMSAdapter(BaseSMSAdapter):
    """
    Development mock — never sends real SMS.
    Logs OTP to console and returns it in SMSResult for dev convenience.
    """
    async def send_otp(self, mobile_number: str, otp: str) -> SMSResult:
        logger.warning(
            "MOCK SMS ADAPTER — NOT SENT. OTP for %s: %s",
            mobile_number[-4:].zfill(10),  # Partial log for safety
            otp,
        )
        return SMSResult(
            success=True,
            provider_reference="mock-ref-000",
            debug_otp=otp,  # Exposed only in development
        )


class MSG91Adapter(BaseSMSAdapter):
    """
    MSG91 OTP API adapter.
    Requires MSG91_AUTH_KEY and MSG91_TEMPLATE_ID_OTP.
    """
    BASE_URL = "https://control.msg91.com/api/v5/otp"

    async def send_otp(self, mobile_number: str, otp: str) -> SMSResult:
        if not settings.msg91_auth_key or not settings.msg91_template_id_otp:
            logger.error("MSG91 credentials not configured — falling back to mock")
            mock = MockSMSAdapter()
            return await mock.send_otp(mobile_number, otp)

        params = {
            "template_id": settings.msg91_template_id_otp,
            "mobile": f"91{mobile_number}",
            "authkey": settings.msg91_auth_key,
            "otp": otp,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.BASE_URL, params=params)
                data = response.json()
                if data.get("type") == "success":
                    return SMSResult(
                        success=True,
                        provider_reference=str(data.get("request_id", "")),
                    )
                else:
                    logger.error("MSG91 error: %s", data)
                    return SMSResult(
                        success=False,
                        error_message=str(data.get("message", "Unknown MSG91 error")),
                    )
        except Exception as exc:
            logger.exception("MSG91 SMS send failed: %s", exc)
            return SMSResult(success=False, error_message=str(exc))


def get_sms_adapter() -> BaseSMSAdapter:
    """Factory function — returns the adapter configured by SMS_PROVIDER env var."""
    provider = settings.sms_provider.lower()
    if provider == "msg91":
        return MSG91Adapter()
    # Default to mock for development / missing config
    return MockSMSAdapter()

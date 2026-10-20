"""
BAFS — ARQ Background Worker Settings
"""
from arq.connections import RedisSettings

from app.core.config import get_settings

settings = get_settings()


async def send_notification_task(ctx, notification_id: str) -> None:
    """Send a queued notification via the appropriate channel."""
    # TODO: Implement in Phase 5
    pass


async def check_overdue_follow_ups(ctx) -> None:
    """Mark follow-up tasks as overdue. Runs on a schedule."""
    # TODO: Implement in Phase 5
    pass


class WorkerSettings:
    functions = [send_notification_task]
    cron_jobs = [
        # check_overdue_follow_ups — every hour
    ]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    max_jobs = settings.arq_worker_concurrency if hasattr(settings, 'arq_worker_concurrency') else 10
    job_timeout = 300
    max_tries = 3

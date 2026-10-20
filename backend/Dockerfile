# ============================================================
# BAFS Backend Dockerfile
# Multi-stage: development (hot-reload) and production
# ============================================================

# ── Base ─────────────────────────────────────────────────────
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System dependencies (curl for healthcheck, libpq for asyncpg)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Dependencies ──────────────────────────────────────────────
FROM base AS deps

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ── Development ───────────────────────────────────────────────
FROM deps AS development

# In dev, source is mounted as a volume
# Hot-reload enabled via uvicorn --reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ── Production ────────────────────────────────────────────────
FROM deps AS production

COPY . .

# Create non-root user and set permissions
RUN addgroup --system bafs && adduser --system --group bafs \
    && chown -R bafs:bafs /app
USER bafs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

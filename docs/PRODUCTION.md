# BAFS Production Deployment Guide

This document outlines the architecture, configuration, security protocols, and operational procedures for deploying the **Birdawade Associates & Financial Services (BAFS)** loan consultancy and DSA management platform to production.

---

## 1. Production Architecture Overview

```
                      [ Internet / End Users ]
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │   Nginx Reverse Proxy  │ (Ports 80 & 443 with SSL)
                     │  - SSL Termination     │
                     │  - Gzip Compression    │
                     │  - Security Headers    │
                     │  - Rate Limiting       │
                     └───────────┬────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│ Next.js Frontend (Node) │               │  FastAPI Backend (Py)   │
│ - Port 3000 (Internal)  │               │ - Port 8000 (Internal)  │
│ - Standalone Build      │               │ - 4 Workers (Uvicorn)   │
│ - Non-root nextjs user  │               │ - Non-root bafs user    │
└─────────────────────────┘               └────────────┬────────────┘
                                                       │
                           ┌───────────────────────────┼───────────────────────────┐
                           ▼                           ▼                           ▼
                ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
                │ PostgreSQL Database │     │   Redis Job Queue   │     │  MinIO / AWS S3     │
                │ - PostgreSQL 16     │     │ - Redis 7 Alpine    │     │ - Document Storage  │
                │ - pgcrypto & trgm   │     │ - Persistence (AOF) │     │ - Encrypted Buckets │
                │ - Internal Network  │     │ - Maxmemory limits  │     │ - Presigned URLs    │
                └─────────────────────┘     └──────────┬──────────┘     └─────────────────────┘
                                                       │
                                                       ▼
                                            ┌─────────────────────┐
                                            │ ARQ Background Exec │
                                            │ - OTP delivery      │
                                            │ - Email/SMS dispatch│
                                            └─────────────────────┘
```

---

## 2. Pre-Deployment Configuration Checklist

Before deploying, generate secure random secrets and save them in `.env.production`:

### A. Secret Generation
Run the following commands on your server:

```bash
# 32-byte secret for backend session signature
openssl rand -hex 32

# 64-byte secret for JWT authentication tokens
openssl rand -hex 64

# Strong password for PostgreSQL
openssl rand -hex 24

# Strong credentials for MinIO storage
openssl rand -hex 16
```

### B. Environment File Setup
Copy the template and configure:
```bash
cp .env.production.example .env.production
nano .env.production
```

Crucial production variables:
- `APP_ENV=production`
- `DEBUG=false`
- `ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
- `DATABASE_URL=postgresql+asyncpg://<USER>:<PASS>@db:5432/<DB>`
- `SESSION_COOKIE_SECURE=true`
- `SMS_PROVIDER=msg91` (Provide actual API keys)
- `SMTP_HOST` & `SMTP_PASSWORD` (For customer notification emails)

---

## 3. One-Click Deployment

### On Linux Server (Ubuntu / Debian / AWS EC2 / DigitalOcean)
Ensure Docker and Docker Compose v2 are installed, then execute:

```bash
chmod +x deploy.sh
./deploy.sh
```

### On Windows Server / Local Production Test
Run:
```cmd
deploy.bat
```

Or run the local optimized production stack directly without Docker:
```cmd
run_prod.bat
```

---

## 4. Database Migrations

Production databases are automatically migrated using the Alembic migration container before the backend web workers start up:

```bash
# Manual migration execution if needed:
docker compose -f docker-compose.prod.yml run --rm migration alembic upgrade head

# Rollback one revision:
docker compose -f docker-compose.prod.yml run --rm migration alembic downgrade -1
```

Initial schema revision: `backend/migrations/versions/0001_initial_schema.py`.

---

## 5. SSL / TLS Setup with Let's Encrypt (Certbot)

To enable free automatic SSL certificates with Certbot:

1. Point your domain DNS (A records) to your server IP address.
2. Install Certbot on the host:
   ```bash
   sudo apt-get install certbot
   ```
3. Issue certificates in webroot or standalone mode:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```
4. Copy or link certificates to `nginx/ssl`:
   ```bash
   mkdir -p nginx/ssl
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/bafs.crt
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/bafs.key
   ```
5. In `nginx/conf.d/default.conf`, uncomment the HTTPS server block and restart Nginx:
   ```bash
   docker compose -f docker-compose.prod.yml restart nginx
   ```

---

## 6. Healthchecks & Monitoring

The production stack includes automated container health checks:
- **Backend API**: `GET /health` and `GET /api/v1/health`
- **Frontend App**: `GET /`
- **Postgres**: `pg_isready -U bafs_user -d bafs_db`
- **Redis**: `redis-cli ping`
- **MinIO**: `GET /minio/health/live`

View live container status and health:
```bash
docker compose -f docker-compose.prod.yml ps
```

View aggregated logs:
```bash
docker compose -f docker-compose.prod.yml logs -f --tail=100
```

---

## 7. Backup and Recovery

### PostgreSQL Automated Backup
```bash
docker compose -f docker-compose.prod.yml exec -t db pg_dump -U bafs_admin bafs_db | gzip > "bafs_db_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
```

### PostgreSQL Restore
```bash
gunzip -c bafs_db_backup_YYYYMMDD_HHMMSS.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U bafs_admin -d bafs_db
```

# BAFS — 100% Free Serverless Stack Deployment Guide ($0/month)

Deploy the entire **Birdawade Associates & Financial Services (BAFS)** platform completely free using industry-leading serverless providers:

- **Frontend**: [Vercel](https://vercel.com) (Next.js Edge Network, Free SSL, Global CDN)
- **Backend API**: [Render.com](https://render.com) or [Koyeb](https://koyeb.com) (Python FastAPI Web Service)
- **Database**: [Neon.tech](https://neon.tech) (Serverless PostgreSQL with asyncpg, automated backups)
- **Redis (Optional)**: [Upstash](https://upstash.com) (Serverless Redis for rate-limiting & queues)
- **Document Storage (Optional)**: [Cloudflare R2](https://cloudflare.com) (10 GB free S3 storage, $0 egress fees)

Total monthly cost: **$0.00 / ₹0 forever**.

---

## 📋 Architecture Flow

```
[User Browser]
       │
       ▼
[Vercel: https://bafs.vercel.app] (Next.js Frontend)
       │ (Rewrites /api/* to Render)
       ▼
[Render: https://bafs-backend-api.onrender.com] (FastAPI Backend)
       │
       ├───▶ [Neon: ep-xyz.neon.tech] (PostgreSQL Database)
       ├───▶ [Upstash: xyz.upstash.io] (Redis Queue - optional)
       └───▶ [Cloudflare R2] (S3 Document Storage - optional)
```

---

## Step 1: Create Free PostgreSQL Database on Neon (3 mins)

1. Go to [neon.tech](https://neon.tech) and sign up with GitHub or Google.
2. Click **Create Project**:
   - **Project Name**: `bafs-db`
   - **Postgres version**: `16`
   - **Region**: Select closest to India/Asia (e.g., `AWS Asia Pacific (Singapore)` or `ap-southeast-1`).
3. Click **Create Project**.
4. On your project dashboard, copy the connection string under **Connection Details**:
   Select language: **Python** / **SQLAlchemy**:
   ```
   postgresql://bafs_admin:xxxx@ep-sweet-forest-123.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
   *(Keep this string handy — our backend automatically converts this to asyncpg format)*.

---

## Step 2: Initialize Database Tables in Neon (1 min)

From your local machine in `H:\project\BAFS`, initialize the tables in your new Neon database:

Open PowerShell and run:
```powershell
$env:DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
python backend/scripts/init_db.py
```
You will see:
```text
Connecting to: ep-sweet-forest-123.ap-southeast-1.aws.neon.tech/neondb?ssl=require
Creating database tables...
[SUCCESS] All database tables successfully verified/created!
```

---

## Step 3: Deploy Backend API on Render.com (4 mins)

1. Push your repository to **GitHub** or **GitLab** (if you haven't already).
2. Go to [render.com](https://render.com) and sign in.
3. Click **New +** $\rightarrow$ **Web Service**.
4. Connect your GitHub repository.
5. Fill in the settings:
   - **Name**: `bafs-backend-api`
   - **Region**: `Singapore` (or region matching Neon)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave blank (uses repo root)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Select **Free** ($0 / month).
6. Under **Environment Variables**, click **Add Environment Variable**:
   - `APP_ENV`: `production`
   - `DEBUG`: `false`
   - `APP_SECRET_KEY`: *(Click Generate or paste `openssl rand -hex 32`)*
   - `JWT_SECRET_KEY`: *(Click Generate or paste `openssl rand -hex 64`)*
   - `DATABASE_URL`: Paste your **Neon connection string** from Step 1.
   - `ALLOWED_ORIGINS`: `*` (or your Vercel URL later)
7. Click **Create Web Service**.
8. Render will build and deploy your API in ~2 minutes.
   - Once deployed, copy your API URL: `https://bafs-backend-api.onrender.com`.
   - Test it in your browser: `https://bafs-backend-api.onrender.com/health` (should return `{"status":"ok"}`).

---

## Step 4: Deploy Frontend on Vercel (3 mins)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your BAFS GitHub repository.
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click Edit $\rightarrow$ Select `frontend` $\rightarrow$ Click Continue.
5. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL`: `/api/v1`
   - `NEXT_PUBLIC_BACKEND_URL`: `https://bafs-backend-api.onrender.com` *(Paste your Render URL from Step 3)*
   - `NEXT_PUBLIC_APP_NAME`: `Birdawade Associates & Financial Services`
6. Click **Deploy**.
7. In ~60 seconds, your frontend is deployed live on a free `.vercel.app` domain (e.g. `https://bafs.vercel.app`)!

---

## Step 5: Update CORS on Render Backend (1 min)

Now that you have your Vercel URL:
1. In the **Render Dashboard**, go to your `bafs-backend-api` service $\rightarrow$ **Environment**.
2. Update `ALLOWED_ORIGINS`:
   `https://bafs.vercel.app,http://localhost:3000`
3. Click **Save Changes** (Render will redeploy with new CORS rules in 30 seconds).

---

## Step 6: (Optional) Free S3 Document Storage on Cloudflare R2

If you want users to upload loan application documents:
1. Go to [cloudflare.com](https://cloudflare.com) $\rightarrow$ **R2 Object Storage**.
2. Click **Create Bucket** $\rightarrow$ Name: `bafs-documents`.
3. In R2 overview, click **Manage R2 API Tokens** $\rightarrow$ **Create API Token**:
   - Permissions: **Object Read & Write**
   - Click **Create API Token**.
4. In your Render backend **Environment Variables**, add:
   - `STORAGE_BACKEND`: `s3`
   - `MINIO_ENDPOINT`: `https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com`
   - `MINIO_ACCESS_KEY`: `<R2_ACCESS_KEY_ID>`
   - `MINIO_SECRET_KEY`: `<R2_SECRET_ACCESS_KEY>`
   - `MINIO_BUCKET_DOCUMENTS`: `bafs-documents`
   - `MINIO_USE_SSL`: `true`

---

## Step 7: (Optional) Connect Your Custom Domain on Vercel

If you own `yourdomain.com`:
1. In the **Vercel Dashboard** $\rightarrow$ your project $\rightarrow$ **Settings** $\rightarrow$ **Domains**.
2. Enter `yourdomain.com` and click **Add**.
3. Vercel will show the DNS records:
   - Type: `CNAME` or `A`
   - Value: `cname.vercel-dns.com` or `76.76.21.21`
4. Add these in GoDaddy/Hostinger/Namecheap. Vercel automatically provisions a free SSL certificate!

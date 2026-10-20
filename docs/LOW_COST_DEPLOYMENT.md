# BAFS — Low-Cost & Free-Tier Production Deployment Guide

This guide provides practical, step-by-step blueprints to deploy the entire **Birdawade Associates & Financial Services (BAFS)** platform at the **absolute lowest possible cost** (ranging from **$0/month completely free** to **₹300–₹450 / month** flat).

---

## 💰 Cost Comparison: Deployment Strategies

| Strategy | Monthly Cost (USD) | Monthly Cost (INR) | Specs & Capacity | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Strategy 1: Oracle Cloud Always Free** | **$0 / month** | **₹0** | 4 ARM vCPUs, 24 GB RAM, 200 GB SSD | Best free VPS capable of running everything |
| **Strategy 2: Ultra-Budget VPS (Hetzner / Hostinger)** | **~$4.00 / month** | **~₹350 / month** | 2 vCPUs, 4 GB RAM, 40 GB NVMe SSD | Most reliable, simplest, 1-server Docker stack |
| **Strategy 3: Split Free Serverless** | **$0 / month** | **₹0** | Vercel (Front) + Render (API) + Neon (DB) + Upstash (Redis) | Zero-maintenance, no server administration |

---

# 🚀 Strategy 1: Oracle Cloud "Always Free" Tier ($0 / month forever)

Oracle Cloud Infrastructure (OCI) offers an **Always Free Tier** that never expires and includes an enterprise-grade ARM server with **4 cores, 24 GB of RAM, and 200 GB NVMe disk**. This is more than enough to run the entire BAFS stack.

### Step 1: Create an Oracle Cloud Account
1. Visit [cloud.oracle.com/free](https://www.oracle.com/cloud/free/) and sign up.
2. Complete verification (a temporary ~$1 charge will be authorized and refunded).

### Step 2: Provision the Free Compute Instance
1. Go to **Compute** $\rightarrow$ **Instances** $\rightarrow$ **Create Instance**.
2. **Name**: `bafs-production`.
3. **Image**: Select **Ubuntu 22.04 LTS** or **Ubuntu 24.04 Minimal**.
4. **Shape**: Click **Change Shape** $\rightarrow$ select **Ampere (ARM Processor)**:
   - OCPUs: **2 or 4** (Always Free up to 4)
   - Memory: **12 GB or 24 GB** (Always Free up to 24 GB)
5. **SSH Keys**: Download the private key (`ssh-key.key`) or upload your existing public key.
6. **Boot Volume**: Select default 50 GB to 100 GB (Always Free up to 200 GB total).
7. Click **Create**.

### Step 3: Open Ports in Oracle Cloud Virtual Cloud Network (VCN)
Oracle has a strict firewall in the cloud console:
1. Under **Instance Details**, click your **Subnet**.
2. Click **Default Security List for your VCN**.
3. Click **Add Ingress Rules**:
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: `TCP`
   - **Destination Port Range**: `80, 443`
   - **Description**: `HTTP and HTTPS for BAFS Nginx`
4. Click **Add Ingress Rules**.

### Step 4: Connect and Configure Server Firewall
Connect from your local terminal:
```bash
ssh -i /path/to/ssh-key.key ubuntu@YOUR_ORACLE_PUBLIC_IP
```

Open OS-level iptables (Oracle Ubuntu has default drop rules):
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || sudo apt install -y iptables-persistent && sudo netfilter-persistent save
```

### Step 5: Install Docker & Deploy BAFS
```bash
# 1. Update and install Docker
sudo apt update && sudo apt install -y curl git ufw
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Clone repo into /opt/bafs
sudo mkdir -p /opt/bafs && sudo chown -R $USER:$USER /opt/bafs
git clone <YOUR_REPO_URL> /opt/bafs
cd /opt/bafs

# 3. Create .env.production with secure random passwords
cp .env.production.example .env.production
nano .env.production

# 4. Run the automated deployment script
chmod +x deploy.sh
./deploy.sh
```

---

# ⚡ Strategy 2: Ultra-Budget VPS (~₹350 / $4.00 / month)

If Oracle Cloud is out of capacity in your region or you prefer a straightforward single-click server, budget cloud providers offer reliable instances:

- **Hetzner Cloud (CX22)**: ~€3.79/mo (~₹340/mo) — 2 vCPUs, 4 GB RAM, 40 GB NVMe SSD.
- **Hostinger VPS 1**: ~₹449/mo — 1 vCPU, 4 GB RAM, 50 GB NVMe.
- **Contabo Cloud VPS S**: ~€4.50/mo — 4 vCPUs, 8 GB RAM, 50 GB NVMe.

### Step 1: Create a 2GB–4GB Swap File (Crucial for Low-Cost VPS)
Swap prevents Linux from crashing when RAM spikes during Next.js builds or database spikes:

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Step 2: Run the BAFS Docker Production Stack
Follow the exact same steps:
```bash
cd /opt/bafs
./deploy.sh
```
All components run within this single VPS:
- Nginx handles SSL and proxies traffic.
- Next.js frontend runs on internal port 3000.
- FastAPI backend runs on internal port 8000.
- PostgreSQL 16 stores data in `./postgres_prod_data`.
- MinIO stores documents locally in `./minio_prod_data` (**Saves $10-$20/mo in AWS S3 storage & API fees**).
- Redis & ARQ worker handle OTP and asynchronous tasks.

---

# 🌐 Strategy 3: The 100% Free Serverless Stack ($0 / month)

If you do not want to manage a Linux server or Docker container, you can decouple the application across free serverless providers:

### 1. Frontend: Vercel (Free Forever)
- Sign up at [vercel.com](https://vercel.com) using your GitHub account.
- Import the repository and select the `frontend/` directory as the Root Directory.
- **Framework Preset**: Next.js.
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api/v1`
  - `NEXT_PUBLIC_APP_NAME`: `Birdawade Associates & Financial Services`
- Click **Deploy**. Includes global CDN, automatic SSL, and continuous integration on git push.

### 2. Database: Neon Serverless PostgreSQL (Free Forever)
- Sign up at [neon.tech](https://neon.tech).
- Create a free project (`bafs-db`).
- Copy the connection string:
  `postgresql://user:password@ep-xyz.ap-southeast-1.aws.neon.tech/bafs_db?sslmode=require`
- Supports pgcrypto, full text search, pooling, and automated backups for 0.5 GB free.

### 3. Redis: Upstash (Free Forever)
- Sign up at [upstash.com](https://upstash.com).
- Create a Serverless Redis database (10,000 free commands/day).
- Copy the `redis://...` URL.

### 4. Storage: Cloudflare R2 (10 GB Free Forever)
- Sign up at [cloudflare.com](https://cloudflare.com) $\rightarrow$ **R2 Object Storage**.
- Free tier: **10 GB storage free/month, $0 egress fees** (AWS charges ~$0.09/GB for downloads).
- Generates standard S3-compatible access key and secret. In `.env`:
  - `STORAGE_BACKEND=s3`
  - `AWS_ACCESS_KEY_ID=<cloudflare_r2_key>`
  - `AWS_SECRET_ACCESS_KEY=<cloudflare_r2_secret>`
  - `AWS_REGION=auto`
  - `S3_BUCKET_DOCUMENTS=bafs-documents`

### 5. Backend API: Render.com or Koyeb (Free Tier)
- Sign up at [render.com](https://render.com) or [koyeb.com](https://koyeb.com).
- Create a new **Web Service** pointing to `backend/`.
- **Runtime**: Python 3.
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
- Add the `DATABASE_URL`, `REDIS_URL`, and Cloudflare R2 credentials under Environment.

---

## 🔒 Free Domain & Free SSL Setup

1. **Free Cloudflare DNS & DDoS Protection ($0)**:
   - Change your domain's nameservers to Cloudflare.
   - Cloudflare provides free Universal SSL, automatic HTTPS rewrites, edge caching, and DDoS mitigation.
2. **Free Let's Encrypt SSL on VPS ($0)**:
   ```bash
   sudo apt install -y certbot
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/bafs/nginx/ssl/bafs.crt
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/bafs/nginx/ssl/bafs.key
   docker compose -f docker-compose.prod.yml restart nginx
   ```

---

## ✉️ Free Production Email (SMTP) Options

Never pay for transactional emails when starting out:
1. **Gmail App Password ($0)**:
   - Up to 500 emails/day completely free through your Gmail / Google Workspace account.
   - Go to Google Account $\rightarrow$ Security $\rightarrow$ 2-Step Verification $\rightarrow$ App Passwords $\rightarrow$ Generate.
   - In `.env.production`:
     ```ini
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your_email@gmail.com
     SMTP_PASSWORD=your_16_char_app_password
     ```
2. **Resend.com ($0)**:
   - 3,000 free emails/month.
3. **Brevo (formerly Sendinblue) ($0)**:
   - 300 free emails/day.

---

## 📱 Low-Cost SMS & OTP Services (India)

1. **MSG91 (Default Integrated in BAFS)**:
   - Pay-as-you-go: ~₹0.15 to ₹0.20 per SMS.
   - Signup offers free testing credits.
   - Template ID for DLT compliance can be configured directly in `.env.production`.
2. **Fast2SMS**:
   - Quick testing without complex DLT upfront, ~₹0.20 per OTP.

---

## 🛡️ RAM & CPU Optimization Cheatsheet for Cheap VPS

If running on a 2GB RAM server, add these memory limits to `docker-compose.prod.yml`:
- Set PostgreSQL `shared_buffers = 128MB`.
- Limit Redis memory: `--maxmemory 256mb`.
- Limit Next.js build memory: `NODE_OPTIONS="--max-old-space-size=1024"`.
- Run FastAPI backend with 2 workers instead of 4:
  `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2`.

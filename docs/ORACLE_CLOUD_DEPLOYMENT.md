# BAFS — Complete Oracle Cloud "Always Free" Deployment Guide

A step-by-step, zero-cost production deployment guide for running the entire **Birdawade Associates & Financial Services (BAFS)** stack on an Oracle Cloud Infrastructure (OCI) Ampere ARM instance (**4 OCPUs, 24 GB RAM, 200 GB SSD — $0/month forever**).

---

## 📑 Table of Contents
1. [Phase 1: Account Creation & Region Selection](#phase-1-account-creation--region-selection)
2. [Phase 2: Creating the Ampere A1 Compute Instance](#phase-2-creating-the-ampere-a1-compute-instance)
3. [Phase 3: Allocating a Reserved (Static) Public IP](#phase-3-allocating-a-reserved-static-public-ip)
4. [Phase 4: Configuring Oracle VCN Firewall (Cloud Level)](#phase-4-configuring-oracle-vcn-firewall-cloud-level)
5. [Phase 5: Connecting via SSH from Windows](#phase-5-connecting-via-ssh-from-windows)
6. [Phase 6: Unlocking Ubuntu OS Firewall (Critical Step)](#phase-6-unlocking-ubuntu-os-firewall-critical-step)
7. [Phase 7: Installing Docker & Docker Compose](#phase-7-installing-docker--docker-compose)
8. [Phase 8: Uploading & Configuring BAFS](#phase-8-uploading--configuring-bafs)
9. [Phase 9: Domain DNS & Free Let's Encrypt SSL](#phase-9-domain-dns--free-lets-encrypt-ssl)
10. [Phase 10: Launching & Verifying the Production Stack](#phase-10-launching--verifying-the-production-stack)
11. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Phase 1: Account Creation & Region Selection

1. Go to [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) and click **Start for free**.
2. **Select Home Region carefully**: Choose the region closest to your target users (e.g., **India West (Mumbai)**, **India South (Hyderabad)**, or **Frankfurt / Singapore**).
   > [!IMPORTANT]
   > Your "Always Free" resources are tied to your chosen Home Region. You cannot change your home region later.
3. Complete mobile and credit/debit card verification. A small temporary hold (~$1 / ₹80) will be placed and immediately refunded.

---

## Phase 2: Creating the Ampere A1 Compute Instance

1. In the Oracle Cloud Console, click the top-left **Navigation Menu ($\mathbf{\equiv}$)** $\rightarrow$ **Compute** $\rightarrow$ **Instances**.
2. Click **Create Instance**.
3. **Name**: `bafs-production-server`.
4. **Placement**: Keep default Availability Domain (e.g., `AD-1`).
5. **Image and Shape**:
   - Click **Edit Image**.
   - Select **Canonical Ubuntu**, version **Ubuntu 22.04 LTS** or **Ubuntu 24.04**.
   - Click **Change Shape**:
     - Choose **Ampere (ARM-based Processor)**.
     - Check the box for **VM.Standard.A1.Flex**.
     - Set **OCPUs**: `4` (or `2` if capacity is limited in your region).
     - Set **Memory (RAM)**: `24 GB` (or `12 GB`).
     - Notice the badge: **"Always Free Eligible"**.
     - Click **Select Shape**.
6. **Networking**:
   - Keep **Create new virtual cloud network** and **Create new public subnet**.
   - Ensure **Assign a public IPv4 address** is set to **Yes**.
7. **Add SSH Keys**:
   - Select **Generate a key pair for me**.
   - Click **Save private key** (saves `ssh-key-*.key`).
   - Click **Save public key**.
   > [!CAUTION]
   > Save this `.key` file in a safe location on your PC (e.g., `C:\Users\rohit\.ssh\oracle_bafs.key`). You cannot download it again!
8. **Boot Volume**:
   - Check **Specify a custom boot volume size**.
   - Set to **100 GB** or **150 GB** (Always Free includes up to 200 GB total).
9. Click **Create**.
   - Status will show **PROVISIONING** (orange), then change to **RUNNING** (green) within 1–2 minutes.
   - Note down the **Public IP Address** (e.g., `129.154.xx.xx`).

---

## Phase 3: Allocating a Reserved (Static) Public IP

By default, the assigned IP may change if you terminate or rebuild the instance. Make it permanently static:

1. On your Instance Details page, click **Attached VNICs** (left menu under Resources).
2. Click the primary VNIC name.
3. Click **IPv4 Addresses** (left menu under Resources).
4. Click the three dots ($\mathbf{\dots}$) on the right side of the IP row $\rightarrow$ **Edit**.
5. Change **Public IP Type** from *Ephemeral* to **No Public IP**, then click **Update**.
6. Immediately click the three dots ($\mathbf{\dots}$) $\rightarrow$ **Edit** again.
7. Select **Reserved Public IP** $\rightarrow$ **Create a new reserved IP**:
   - Name: `bafs-static-ip`.
   - Click **Update**.
Now your server has a permanent static IPv4 address that will never change ($0 cost).

---

## Phase 4: Configuring Oracle VCN Firewall (Cloud Level)

Oracle blocks all incoming traffic except SSH (port 22) by default. You must allow HTTP (80) and HTTPS (443):

1. On your Instance Details page, scroll down to **Instance Access** or click **Virtual Cloud Network: vcn-...** link.
2. Under **Resources** (left sidebar), click **Security Lists**.
3. Click **Default Security List for vcn-...**.
4. Click **Add Ingress Rules**:
   - **Source Type**: `CIDR`
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: `TCP`
   - **Destination Port Range**: `80,443`
   - **Description**: `Allow HTTP and HTTPS for BAFS Nginx Web Proxy`
5. Click **Add Ingress Rules**.

---

## Phase 5: Connecting via SSH from Windows

1. Open **Windows PowerShell** or **CMD**.
2. Protect your private key permissions (Windows equivalent of `chmod 400`):
   ```powershell
   icacls "C:\path\to\oracle_bafs.key" /inheritance:r
   icacls "C:\path\to\oracle_bafs.key" /grant:r "$($env:USERNAME):(R)"
   ```
3. Connect to your server:
   ```powershell
   ssh -i "C:\path\to\oracle_bafs.key" ubuntu@YOUR_SERVER_PUBLIC_IP
   ```
4. Type `yes` when prompted to verify host authenticity.
5. You are now logged into your Ubuntu cloud terminal: `ubuntu@bafs-production-server:~$`.

---

## Phase 6: Unlocking Ubuntu OS Firewall (Critical Step)

> [!WARNING]
> Oracle's default Ubuntu images come with pre-configured `iptables` drop rules that block ports 80 and 443 **even after** you open them in the Oracle Cloud Console.

Run these commands in your SSH terminal to unblock ports 80 and 443 permanently:

```bash
# 1. Insert ACCEPT rules for Port 80 and Port 443
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# 2. Persist rules across server reboots
sudo apt update && sudo apt install -y iptables-persistent netfilter-persistent
sudo netfilter-persistent save
sudo netfilter-persistent reload
```

---

## Phase 7: Installing Docker & Docker Compose

Run the following in your SSH terminal:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw jq

# 2. Install official Docker Engine
curl -fsSL https://get.docker.com | sh

# 3. Add ubuntu user to docker group (run docker without sudo)
sudo usermod -aG docker $USER

# 4. Enable Docker service on boot
sudo systemctl enable docker
sudo systemctl start docker

# 5. Verify installation
docker --version
docker compose version
```
*(Log out and log back in by typing `exit`, then re-running the SSH command so group permissions take effect).*

---

## Phase 8: Uploading & Configuring BAFS

### Option A: Clone via Git (Recommended)
If your code is on GitHub / GitLab:
```bash
sudo mkdir -p /opt/bafs
sudo chown -R $USER:$USER /opt/bafs
git clone <YOUR_GIT_REPOSITORY_URL> /opt/bafs
cd /opt/bafs
```

### Option B: Upload Directly from Windows using SCP
From your local Windows PowerShell:
```powershell
scp -i "C:\path\to\oracle_bafs.key" -r "H:\project\BAFS" ubuntu@YOUR_SERVER_PUBLIC_IP:/tmp/bafs
```
Then on the server:
```bash
sudo mv /tmp/bafs /opt/bafs
sudo chown -R $USER:$USER /opt/bafs
cd /opt/bafs
```

### Configure Production Secrets (`.env.production`)
Generate secure cryptographic keys on the server:
```bash
# Generate keys
echo "APP_SECRET_KEY=$(openssl rand -hex 32)"
echo "JWT_SECRET_KEY=$(openssl rand -hex 64)"
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)"
echo "MINIO_SECRET_KEY=$(openssl rand -hex 16)"
```

Create `.env.production`:
```bash
cp .env.production.example .env.production
nano .env.production
```

Replace the placeholder values:
- `ALLOWED_ORIGINS`: `https://yourdomain.com,https://www.yourdomain.com`
- `APP_SECRET_KEY`: `<generated_32_byte_key>`
- `JWT_SECRET_KEY`: `<generated_64_byte_key>`
- `POSTGRES_PASSWORD`: `<generated_postgres_password>`
- `MINIO_SECRET_KEY`: `<generated_minio_password>`
- Real SMS (MSG91) & SMTP (Gmail App Password or SendGrid) credentials.

*(Press `Ctrl+O`, `Enter`, then `Ctrl+X` to save and exit).*

---

## Phase 9: Domain DNS & Free Let's Encrypt SSL

### 1. Point Domain DNS
In your domain registrar (GoDaddy, Namecheap, Cloudflare, Hostinger):
- Create an **A record**:
  - Name: `@`
  - Value: `YOUR_SERVER_PUBLIC_IP`
- Create a second **A record**:
  - Name: `www`
  - Value: `YOUR_SERVER_PUBLIC_IP`

*(Wait 2–5 minutes for DNS propagation. Verify using `nslookup yourdomain.com`)*.

### 2. Issue Free SSL Certificate with Certbot
On the server:
```bash
sudo apt install -y certbot

# Request certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```
Enter your email and agree to Terms of Service.

### 3. Link SSL Certificates to Nginx
```bash
mkdir -p /opt/bafs/nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/bafs/nginx/ssl/bafs.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/bafs/nginx/ssl/bafs.key
sudo chmod 600 /opt/bafs/nginx/ssl/*
```

### 4. Enable HTTPS in Nginx Configuration
Open `nginx/conf.d/default.conf`:
```bash
nano /opt/bafs/nginx/conf.d/default.conf
```
Uncomment or ensure the SSL server block is configured with `/etc/nginx/ssl/bafs.crt` and `/etc/nginx/ssl/bafs.key`.

---

## Phase 10: Launching & Verifying the Production Stack

Run the automated deployment script:
```bash
cd /opt/bafs
chmod +x deploy.sh
./deploy.sh
```

### Check Container Status
```bash
docker compose -f docker-compose.prod.yml ps
```
All containers should be **Up (healthy)**:
- `bafs_prod_db` (Postgres 16)
- `bafs_prod_redis` (Redis 7)
- `bafs_prod_minio` (S3 Storage)
- `bafs_prod_migration` (Exited 0 - Migrations applied)
- `bafs_prod_backend` (FastAPI 4 workers)
- `bafs_prod_worker` (ARQ Background Worker)
- `bafs_prod_frontend` (Next.js Standalone)
- `bafs_prod_nginx` (Reverse Proxy)

Open your browser and navigate to:
- **`https://yourdomain.com`** $\rightarrow$ Frontend web app.
- **`https://yourdomain.com/health`** $\rightarrow$ `{"status":"ok"}`.

---

## 🛠️ Troubleshooting & FAQ

### Q1: "Out of host capacity" error when creating instance in Oracle Cloud
**Solution**:
1. Change the Availability Domain (try `AD-2` or `AD-3` if available).
2. Or decrease the shape to **2 OCPUs and 12 GB RAM** (still 100% free and more than enough).
3. If still busy, try creating during off-peak hours (early morning) or try a neighboring region.

### Q2: Browser says "Connection Timed Out" or site doesn't load
**Root Cause**: Oracle's default `iptables` is blocking port 80/443.
**Solution**: Re-run the iptables unlock commands from [Phase 6](#phase-6-unlocking-ubuntu-os-firewall-critical-step).

### Q3: How to view live application logs?
```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Q4: How to automatically renew Let's Encrypt certificates?
Add a monthly cron job:
```bash
sudo crontab -e
```
Add line:
```cron
0 3 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /opt/bafs/nginx/ssl/ && docker compose -f /opt/bafs/docker-compose.prod.yml restart nginx
```

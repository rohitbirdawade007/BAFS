#!/usr/bin/env bash
# ============================================================
# BIRDAWADE ASSOCIATES & FINANCIAL SERVICES (BAFS)
# Production Deployment Automation Script (Linux / Cloud VPS)
# ============================================================

set -eo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}     BIRDAWADE ASSOCIATES & FINANCIAL SERVICES (BAFS)                ${NC}"
echo -e "${BLUE}     Production Deployment & Orchestration                           ${NC}"
echo -e "${BLUE}======================================================================${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Check Docker & Docker Compose
echo -e "\n${YELLOW}[1/6] Checking Docker environment...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker is not installed. Please install Docker Engine first.${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}[ERROR] Docker Compose v2 is not installed or available.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Docker & Docker Compose detected.${NC}"

# 2. Check .env.production
echo -e "\n${YELLOW}[2/6] Validating production environment configuration...${NC}"
if [ ! -f ".env.production" ]; then
    if [ -f ".env.production.example" ]; then
        echo -e "${YELLOW}[!] .env.production not found. Creating from .env.production.example...${NC}"
        cp .env.production.example .env.production
        echo -e "${RED}[ACTION REQUIRED] Please edit .env.production with your real production secrets before proceeding!${NC}"
        exit 1
    else
        echo -e "${RED}[ERROR] Neither .env.production nor .env.production.example found.${NC}"
        exit 1
    fi
fi

# Check for insecure placeholder values
if grep -q "REPLACE_WITH" .env.production; then
    echo -e "${RED}[SECURITY ERROR] .env.production still contains unreplaced placeholder values ('REPLACE_WITH').${NC}"
    echo -e "Please replace all secret keys, passwords, and tokens with cryptographically secure values."
    exit 1
fi
echo -e "${GREEN}[OK] .env.production validated.${NC}"

# 3. Create SSL directory if missing
echo -e "\n${YELLOW}[3/6] Setting up Nginx SSL directory...${NC}"
mkdir -p nginx/ssl
chmod 700 nginx/ssl
echo -e "${GREEN}[OK] Nginx SSL ready.${NC}"

# 4. Build Production Images
echo -e "\n${YELLOW}[4/6] Building production Docker images...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production build --pull

# 5. Execute Database Migrations and Launch Containers
echo -e "\n${YELLOW}[5/6] Launching services & applying database migrations...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# 6. Verify Health
echo -e "\n${YELLOW}[6/6] Verifying service health status...${NC}"
sleep 10
docker compose -f docker-compose.prod.yml ps

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN} [SUCCESS] BAFS Production Stack is live!                              ${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "  * Nginx Gateway:      http://localhost (or your server domain/IP)"
echo -e "  * API Health Check:   http://localhost/health"
echo -e "  * View Logs:          docker compose -f docker-compose.prod.yml logs -f"
echo -e "  * Stop Services:      docker compose -f docker-compose.prod.yml down"
echo -e "${GREEN}======================================================================${NC}\n"

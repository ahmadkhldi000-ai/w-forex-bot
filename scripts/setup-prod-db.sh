#!/usr/bin/env bash
# ====================================================================
#  W-FOREX-BOT · Production DB Setup Script
#  Run this LOCALLY to apply migrations + seed to your production DB
#
#  Usage:
#    ./scripts/setup-prod-db.sh
#
#  It will prompt for your Neon DATABASE_URL, then:
#    1. Apply all Prisma migrations
#    2. Generate the Prisma client
#    3. Seed default admin, plans, and settings
# ====================================================================
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  W-FOREX-BOT · Production DB Setup${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# --- Check we're in the right place ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$ROOT_DIR/server"

if [ ! -f "$SERVER_DIR/package.json" ]; then
  echo -e "${RED}✗ Could not find server/package.json${NC}"
  echo "  Run this script from the project root."
  exit 1
fi

cd "$SERVER_DIR"

# --- Prompt for DATABASE_URL ---
echo -e "${YELLOW}Paste your Neon NON-pooled DATABASE_URL for migrations.${NC}"
echo -e "${YELLOW}(The one WITHOUT '-pooler' in the hostname)${NC}"
echo ""
read -r -p "DATABASE_URL: " DB_URL

if [ -z "$DB_URL" ]; then
  echo -e "${RED}✗ No URL provided. Exiting.${NC}"
  exit 1
fi

if [[ "$DB_URL" != postgresql://* ]]; then
  echo -e "${RED}✗ Invalid URL — must start with postgresql://${NC}"
  exit 1
fi

export DATABASE_URL="$DB_URL"
echo ""
echo -e "${GREEN}✓ DATABASE_URL set${NC}"
echo ""

# --- Step 1: Install deps ---
echo -e "${GREEN}[1/4] Installing dependencies...${NC}"
npm install --silent
echo ""

# --- Step 2: Generate Prisma client ---
echo -e "${GREEN}[2/4] Generating Prisma client...${NC}"
npx prisma generate
echo ""

# --- Step 3: Apply migrations ---
echo -e "${GREEN}[3/4] Applying migrations (creating tables)...${NC}"
npx prisma migrate deploy
echo ""

# --- Step 4: Seed ---
echo -e "${GREEN}[4/4] Seeding default data (admin, plans, settings)...${NC}"
npm run db:seed
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ SETUP COMPLETE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Save the admin password shown above"
echo "  2. In Render, set DATABASE_URL to the POOLED connection"
echo "  3. Visit your frontend to verify login"

#!/bin/bash
set -e

echo "🚀 SigmaCode AI - Kostenloses Deployment"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to prompt for input
prompt() {
    local var_name=$1
    local description=$2
    read -p "$description: " value
    eval "$var_name='$value'"
}

echo -e "${YELLOW}Schritt 1: Vercel Setup${NC}"
echo "Besuche https://vercel.com und logge dich ein"
echo "Importiere dieses GitHub-Repo"
echo "Wähle Next.js als Framework"
read -p "Drücke ENTER wenn Vercel-Projekt erstellt ist..."

echo -e "${YELLOW}Schritt 2: Database & Redis Setup${NC}"
echo "Erstelle kostenlose Accounts und Projekte:"

prompt NEON_URL "Neon Database Connection String (z.B. postgresql://user:pass@host/db)"
prompt REDIS_HOST "Upstash Redis Host (z.B. your-db.upstash.io)"
prompt REDIS_PORT "Upstash Redis Port (normalerweise 6379)"
prompt REDIS_PASS "Upstash Redis Password"

echo -e "${GREEN}Credentials erhalten!${NC}"

echo -e "${YELLOW}Schritt 3: Environment Variables setzen${NC}"

# Generate NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Get Vercel project URL (you'll need to provide this)
prompt VERCEL_URL "Deine Vercel-URL (z.B. https://your-project.vercel.app)"

# Set environment variables
echo "Setze Environment Variables..."
vercel env add NEXT_PUBLIC_APP_URL production <<EOF_PRODUCTION
$VERCEL_URL
EOF_PRODUCTION

vercel env add NEXTAUTH_URL production <<EOF_PRODUCTION
$VERCEL_URL
EOF_PRODUCTION

vercel env add NEXTAUTH_SECRET production <<EOF_PRODUCTION
$NEXTAUTH_SECRET
EOF_PRODUCTION

vercel env add DATABASE_URL production <<EOF_PRODUCTION
$NEON_URL
EOF_PRODUCTION

vercel env add REDIS_HOST production <<EOF_PRODUCTION
$REDIS_HOST
EOF_PRODUCTION

vercel env add REDIS_PORT production <<EOF_PRODUCTION
$REDIS_PORT
EOF_PRODUCTION

vercel env add REDIS_PASSWORD production <<EOF_PRODUCTION
$REDIS_PASS
EOF_PRODUCTION

vercel env add FIREWALL_ENABLED production <<EOF_PRODUCTION
false
EOF_PRODUCTION

vercel env add FIREWALL_MODE production <<EOF_PRODUCTION
off
EOF_PRODUCTION

echo -e "${GREEN}Environment Variables gesetzt!${NC}"

echo -e "${YELLOW}Schritt 4: Database Migration${NC}"
echo "Führe lokale Migration aus..."

# Create .env.local for migration
cat > .env.local <<EOF_ENV
DATABASE_URL="$NEON_URL"
EOF_ENV

# Run migration
pnpm install
pnpm drizzle:migrate

echo -e "${GREEN}Database Migration abgeschlossen!${NC}"

echo -e "${YELLOW}Schritt 5: Deploy${NC}"
vercel --prod

echo -e "${GREEN}🎉 Deployment erfolgreich!${NC}"
echo ""
echo "Deine App läuft unter: $VERCEL_URL"
echo ""
echo "Test-URLs:"
echo "• Startseite: $VERCEL_URL"
echo "• Login: $VERCEL_URL/login"
echo "• Dashboard: $VERCEL_URL/dashboard"
echo "• API Health: $VERCEL_URL/api/health"


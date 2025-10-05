#!/usr/bin/env bash

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
   _____ _                         _____          _      
  / ____(_)                       / ____|        | |     
 | (___  _  __ _ _ __ ___   __ _| |     ___   __| | ___ 
  \___ \| |/ _` | '_ ` _ \ / _` | |    / _ \ / _` |/ _ \
  ____) | | (_| | | | | | | (_| | |___| (_) | (_| |  __/
 |_____/|_|\__, |_| |_| |_|\__,_|\_____\___/ \__,_|\___|
            __/ |                                        
           |___/   AI SaaS Cloud Installer v1.0         
EOF
echo -e "${NC}"

echo -e "${GREEN}🚀 SigmaCode AI SaaS Cloud Installer${NC}"
echo ""

PROJECT_DIR="$(pwd)"
PROJECT_NAME="sigmacode-ai-saas"
BACKEND_DIR="$PROJECT_DIR/backend"
EDGE_DIR="$PROJECT_DIR/edge/cloudflare"

echo -e "${YELLOW}📋 Projektverzeichnis: $PROJECT_DIR${NC}"
echo ""

# ============================================
# SCHRITT 1: CLI-Tools prüfen/installieren
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SCHRITT 1: CLI-Tools überprüfen${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

check_cli() {
    local cmd=$1
    local install_cmd=$2
    
    if command -v $cmd &> /dev/null; then
        echo -e "${GREEN}✓${NC} $cmd ist installiert"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $cmd nicht gefunden"
        if [ -n "$install_cmd" ]; then
            echo -e "${BLUE}→${NC} Installiere $cmd..."
            eval $install_cmd
            echo -e "${GREEN}✓${NC} $cmd installiert"
        fi
        return 1
    fi
}

check_cli "git"
check_cli "node"
check_cli "npm"
check_cli "python3"

if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Supabase CLI nicht gefunden"
    echo -e "${BLUE}→${NC} Installiere Supabase CLI..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install supabase/tap/supabase
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
        sudo mv supabase /usr/local/bin/
    fi
    echo -e "${GREEN}✓${NC} Supabase CLI installiert"
else
    echo -e "${GREEN}✓${NC} Supabase CLI ist installiert"
fi

if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Wrangler CLI nicht gefunden"
    echo -e "${BLUE}→${NC} Installiere Wrangler..."
    npm install -g wrangler
    echo -e "${GREEN}✓${NC} Wrangler installiert"
else
    echo -e "${GREEN}✓${NC} Wrangler ist installiert"
fi

if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Vercel CLI nicht gefunden"
    echo -e "${BLUE}→${NC} Installiere Vercel CLI..."
    npm install -g vercel
    echo -e "${GREEN}✓${NC} Vercel CLI installiert"
else
    echo -e "${GREEN}✓${NC} Vercel CLI ist installiert"
fi

echo ""

# ============================================
# SCHRITT 2: Credentials sammeln
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SCHRITT 2: Service-Credentials${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

ENV_FILE="$PROJECT_DIR/.env.cloud"
rm -f $ENV_FILE

echo -e "${YELLOW}Bitte gib deine Service-Credentials ein:${NC}"
echo ""

# Supabase
echo -e "${BLUE}─────────────────────────────${NC}"
echo -e "${BLUE}Supabase${NC}"
echo -e "${BLUE}─────────────────────────────${NC}"
read -p "Supabase Project URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_KEY
read -p "Supabase Service Role Key: " SUPABASE_SERVICE_KEY
echo ""

# Neon Database
echo -e "${BLUE}─────────────────────────────${NC}"
echo -e "${BLUE}Neon Database${NC}"
echo -e "${BLUE}─────────────────────────────${NC}"
read -p "Neon Connection String (postgres://...): " NEON_URL
echo ""

# Vercel
echo -e "${BLUE}─────────────────────────────${NC}"
echo -e "${BLUE}Vercel${NC}"
echo -e "${BLUE}─────────────────────────────${NC}"
read -p "Vercel Project Name [sigmacode-frontend]: " VERCEL_PROJECT
VERCEL_PROJECT=${VERCEL_PROJECT:-sigmacode-frontend}
echo ""

# Render
echo -e "${BLUE}─────────────────────────────${NC}"
echo -e "${BLUE}Render.com${NC}"
echo -e "${BLUE}─────────────────────────────${NC}"
read -p "Render API Key (optional für Auto-Deploy): " RENDER_API_KEY
echo ""

# Cloudflare
echo -e "${BLUE}─────────────────────────────${NC}"
echo -e "${BLUE}Cloudflare Workers${NC}"
echo -e "${BLUE}─────────────────────────────${NC}"
read -p "Cloudflare Account ID: " CF_ACCOUNT_ID
read -p "Cloudflare API Token: " CF_API_TOKEN
echo ""

# Dify (optional)
echo -e "${BLUE}─────────────────────────────${NC}"
echo -e "${BLUE}Dify AI (optional)${NC}"
echo -e "${BLUE}─────────────────────────────${NC}"
read -p "Dify API URL [http://localhost:5001]: " DIFY_API_URL
DIFY_API_URL=${DIFY_API_URL:-http://localhost:5001}
read -p "Dify API Key (optional): " DIFY_API_KEY
echo ""

# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
BACKEND_API_KEY=$(openssl rand -base64 32)

# ============================================
# SCHRITT 3: Environment-Dateien erstellen
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SCHRITT 3: Environment-Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

cat > $ENV_FILE << EOF
# SigmaCode AI SaaS Cloud Configuration
# Generiert am: $(date)

# Frontend (Vercel)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://${VERCEL_PROJECT}.vercel.app
NEXTAUTH_URL=https://${VERCEL_PROJECT}.vercel.app
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Supabase
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_KEY}
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_KEY=${SUPABASE_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}

# Database (Neon)
DATABASE_URL=${NEON_URL}
POSTGRES_URL=${NEON_URL}

# Backend API
BACKEND_URL=https://sigmacode-backend.onrender.com
BACKEND_API_KEY=${BACKEND_API_KEY}
NEXT_PUBLIC_API_URL=https://sigmacode-backend.onrender.com

# Dify
DIFY_API_URL=${DIFY_API_URL}
DIFY_API_KEY=${DIFY_API_KEY}

# Firewall (zunächst deaktiviert)
FIREWALL_ENABLED=false
FIREWALL_MODE=off
SUPERAGENT_URL=http://localhost:8000
SUPERAGENT_API_KEY=

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=${CF_ACCOUNT_ID}
CLOUDFLARE_API_TOKEN=${CF_API_TOKEN}

# Render
RENDER_API_KEY=${RENDER_API_KEY}
EOF

echo -e "${GREEN}✓${NC} Environment-Datei erstellt: $ENV_FILE"
echo ""

# ============================================
# SCHRITT 4: Supabase Setup
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SCHRITT 4: Supabase Konfiguration${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

if [ -d "$PROJECT_DIR/supabase" ]; then
    echo -e "${BLUE}→${NC} Supabase-Verzeichnis gefunden"
    cd "$PROJECT_DIR/supabase"
    
    if [ ! -f "config.toml" ]; then
        echo -e "${BLUE}→${NC} Initialisiere Supabase..."
        supabase init
    fi
    
    echo -e "${BLUE}→${NC} Verlinke mit Supabase-Projekt..."
    echo "$SUPABASE_URL" | grep -oP '(?<=https://)[^.]+' | xargs -I {} supabase link --project-ref {} || true
    
    echo -e "${GREEN}✓${NC} Supabase konfiguriert"
    cd "$PROJECT_DIR"
else
    echo -e "${YELLOW}⚠${NC} Supabase-Verzeichnis nicht gefunden, überspringe"
fi

echo ""

# ============================================
# SCHRITT 5: Backend Setup (Render)
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SCHRITT 5: Backend Setup (Render)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${YELLOW}⚠${NC} Backend-Verzeichnis nicht gefunden, wurde bereits erstellt"
fi

cd "$BACKEND_DIR"

cat > .env << EOF
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_KEY=${SUPABASE_KEY}
DATABASE_URL=${NEON_URL}
DIFY_API_URL=${DIFY_API_URL}
DIFY_API_KEY=${DIFY_API_KEY}
FIREWALL_ENABLED=false
FIREWALL_MODE=off
PORT=8000
EOF

echo -e "${GREEN}✓${NC} Backend .env erstellt"

if [ -n "$RENDER_API_KEY" ]; then
    echo -e "${BLUE}→${NC} Render API Key gefunden, Auto-Deploy möglich"
    echo -e "${YELLOW}📝 Hinweis: Pushe das Backend-Repo zu GitHub und verbinde es mit Render${NC}"
else
    echo -e "${YELLOW}📝 Hinweis: Manuelles Render-Setup erforderlich${NC}"
    echo -e "${YELLOW}   1. Gehe zu render.com und erstelle einen neuen Web Service${NC}"
    echo -e "${YELLOW}   2. Verbinde dein GitHub-Repo${NC}"
    echo -e "${YELLOW}   3. Wähle das /backend Verzeichnis${NC}"
    echo -e "${YELLOW}   4. Nutze die render.yaml Konfiguration${NC}"
fi

cd "$PROJECT_DIR"
echo ""

# ============================================
# SCHRITT 6: Frontend Setup (Vercel)
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SCHRITT 6: Frontend Setup (Vercel)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}→${NC} Prüfe Vercel-Login..."
if vercel whoami &> /dev/null; then
    echo -e "${GREEN}✓${NC} Vercel Login OK: $(vercel whoami)"
else
    echo -e "${YELLOW}→${NC} Vercel Login erforderlich..."
    vercel login
fi

echo -e "${BLUE}→${NC} Verlinke Vercel-Projekt..."
vercel link --yes --name "$VERCEL_PROJECT" || true

echo -e "${BLUE}→${NC} Setze Vercel Environment-Variablen..."

source $ENV_FILE

vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET" || true
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$SUPABASE_URL" || true
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$SUPABASE_KEY" || true
vercel env add DATABASE_URL production <<< "$NEON_URL" || true
vercel env add BACKEND_URL production <<< "https://sigmacode-backend.onrender.com" || true
vercel env add BACKEND_API_KEY production <<< "$BACKEND_API_KEY" || true

echo -e "${GREEN}✓${NC} Vercel konfiguriert"
echo ""

# ============================================
# SCHRITT 7: Cloudflare Workers Setup
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SCHRITT 7: Cloudflare Workers${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

cd "$EDGE_DIR"

export CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID"
export CLOUDFLARE_API_TOKEN="$CF_API_TOKEN"

echo -e "${BLUE}→${NC} Prüfe Wrangler-Login..."
if wrangler whoami &> /dev/null; then
    echo -e "${GREEN}✓${NC} Wrangler Login OK"
else
    echo -e "${YELLOW}→${NC} Wrangler Login erforderlich..."
    wrangler login
fi

echo -e "${BLUE}→${NC} Erstelle KV Namespace für AI-Triggers..."
KV_ID=$(wrangler kv:namespace create "AI_TRIGGERS_KV" --preview false 2>&1 | grep -oP '(?<=id = ")[^"]+' | head -1)
KV_PREVIEW_ID=$(wrangler kv:namespace create "AI_TRIGGERS_KV" --preview 2>&1 | grep -oP '(?<=id = ")[^"]+' | head -1)

echo -e "${GREEN}✓${NC} KV Namespace erstellt"
echo -e "${BLUE}   ID: $KV_ID${NC}"
echo -e "${BLUE}   Preview ID: $KV_PREVIEW_ID${NC}"

# Update wrangler.toml
sed -i.bak "s/\${AI_TRIGGERS_KV_ID}/$KV_ID/g" wrangler.ai-trigger.toml
sed -i.bak "s/\${AI_TRIGGERS_KV_PREVIEW_ID}/$KV_PREVIEW_ID/g" wrangler.ai-trigger.toml
rm -f wrangler.ai-trigger.toml.bak

echo -e "${BLUE}→${NC} Setze Cloudflare Secrets..."
echo "$BACKEND_API_KEY" | wrangler secret put BACKEND_API_KEY -c wrangler.ai-trigger.toml || true
echo "https://sigmacode-backend.onrender.com" | wrangler secret put BACKEND_URL -c wrangler.ai-trigger.toml || true
echo "$SUPABASE_URL" | wrangler secret put SUPABASE_URL -c wrangler.ai-trigger.toml || true
echo "$SUPABASE_KEY" | wrangler secret put SUPABASE_KEY -c wrangler.ai-trigger.toml || true
echo "$DIFY_API_URL" | wrangler secret put DIFY_API_URL -c wrangler.ai-trigger.toml || true

echo -e "${GREEN}✓${NC} Cloudflare Workers konfiguriert"

cd "$PROJECT_DIR"
echo ""

# ============================================
# SCHRITT 8: Git & Deployment
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SCHRITT 8: Git & Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

if [ ! -d ".git" ]; then
    echo -e "${BLUE}→${NC} Initialisiere Git..."
    git init
    echo -e "${GREEN}✓${NC} Git initialisiert"
fi

echo -e "${BLUE}→${NC} Füge Änderungen hinzu..."
git add -A
git commit -m "SigmaCode AI SaaS Cloud Setup - $(date)" || echo "Keine Änderungen zum Committen"

echo -e "${GREEN}✓${NC} Git bereit"
echo ""

# ============================================
# SCHRITT 9: Deploy!
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SCHRITT 9: DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Möchtest du jetzt deployen? (y/n)${NC}"
read -p "> " DEPLOY_NOW

if [ "$DEPLOY_NOW" = "y" ] || [ "$DEPLOY_NOW" = "Y" ]; then
    
    # Deploy Frontend zu Vercel
    echo -e "${BLUE}→${NC} Deploye Frontend zu Vercel..."
    vercel --prod --yes
    echo -e "${GREEN}✓${NC} Frontend deployed!"
    
    # Deploy Cloudflare Worker
    echo -e "${BLUE}→${NC} Deploye AI-Trigger Worker zu Cloudflare..."
    cd "$EDGE_DIR"
    wrangler deploy -c wrangler.ai-trigger.toml
    echo -e "${GREEN}✓${NC} Worker deployed!"
    cd "$PROJECT_DIR"
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ DEPLOYMENT ERFOLGREICH!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    
else
    echo -e "${YELLOW}📝 Deployment übersprungen${NC}"
fi

echo ""

# ============================================
# FINALE: Setup Summary
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  🎉 SETUP ABGESCHLOSSEN!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}📍 Deine Services:${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}     https://${VERCEL_PROJECT}.vercel.app"
echo -e "  ${BLUE}Backend:${NC}      https://sigmacode-backend.onrender.com"
echo -e "  ${BLUE}Supabase:${NC}     ${SUPABASE_URL}"
echo -e "  ${BLUE}Database:${NC}     Neon (PostgreSQL)"
echo -e "  ${BLUE}AI-Triggers:${NC}  Cloudflare Workers"
echo ""

echo -e "${YELLOW}📋 Nächste Schritte:${NC}"
echo ""
echo -e "  1. ${BLUE}Backend deployen:${NC}"
echo -e "     → Pushe dein Repo zu GitHub"
echo -e "     → Verbinde mit Render.com"
echo -e "     → Nutze /backend/render.yaml"
echo ""
echo -e "  2. ${BLUE}DNS konfigurieren:${NC}"
echo -e "     → Füge CNAME für sigmacode.ai hinzu"
echo -e "     → Zeige auf Vercel/Render"
echo ""
echo -e "  3. ${BLUE}Teste deine API:${NC}"
echo -e "     curl https://sigmacode-backend.onrender.com/health"
echo ""
echo -e "  4. ${BLUE}Aktiviere Firewall (optional):${NC}"
echo -e "     → Setze FIREWALL_ENABLED=true"
echo -e "     → Konfiguriere Superagent"
echo ""

echo -e "${GREEN}🔐 Wichtige Credentials in:${NC} $ENV_FILE"
echo -e "${RED}⚠️  NICHT in Git committen!${NC}"
echo ""

echo -e "${GREEN}🚀 Viel Erfolg mit SigmaCode AI SaaS!${NC}"
echo ""

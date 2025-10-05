#!/bin/bash

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 SigmaCode Cloud Setup Helper${NC}"
echo ""

show_menu() {
    echo -e "${YELLOW}Was möchtest du tun?${NC}"
    echo "1) Vercel Environment-Variablen setzen"
    echo "2) Render Service erstellen"
    echo "3) Cloudflare Worker Secrets setzen"
    echo "4) Alle Services testen"
    echo "5) GitHub Secrets Guide anzeigen"
    echo "6) Exit"
    echo ""
    read -p "Wähle eine Option (1-6): " choice
    
    case $choice in
        1) setup_vercel_env ;;
        2) setup_render ;;
        3) setup_cloudflare_secrets ;;
        4) test_all_services ;;
        5) show_github_secrets_guide ;;
        6) exit 0 ;;
        *) echo "Ungültige Option"; show_menu ;;
    esac
}

setup_vercel_env() {
    echo -e "${BLUE}📦 Vercel Environment Setup${NC}"
    
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI nicht installiert"
        echo "Installiere mit: npm install -g vercel"
        return
    fi
    
    echo "Lade .env.cloud..."
    if [ ! -f ".env.cloud" ]; then
        echo "❌ .env.cloud nicht gefunden"
        echo "Führe zuerst ./sigmacode-installer.sh aus"
        return
    fi
    
    source .env.cloud
    
    echo "Setze Production Environment-Variablen..."
    
    vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET" || true
    vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$SUPABASE_URL" || true
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$SUPABASE_KEY" || true
    vercel env add DATABASE_URL production <<< "$DATABASE_URL" || true
    vercel env add BACKEND_URL production <<< "$BACKEND_URL" || true
    vercel env add BACKEND_API_KEY production <<< "$BACKEND_API_KEY" || true
    
    echo -e "${GREEN}✅ Vercel Environment konfiguriert${NC}"
    echo ""
    show_menu
}

setup_render() {
    echo -e "${BLUE}🔧 Render Service Setup${NC}"
    echo ""
    echo "Schritte:"
    echo "1. Gehe zu https://dashboard.render.com/"
    echo "2. New → Web Service"
    echo "3. Connect GitHub Repository"
    echo "4. Root Directory: backend"
    echo "5. Build Command: pip install -r requirements.txt"
    echo "6. Start Command: uvicorn app:app --host 0.0.0.0 --port 10000"
    echo ""
    echo "Environment-Variablen (kopiere diese):"
    echo ""
    
    if [ -f ".env.cloud" ]; then
        source .env.cloud
        cat << EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_KEY=$SUPABASE_KEY
DATABASE_URL=$DATABASE_URL
DIFY_API_URL=$DIFY_API_URL
DIFY_API_KEY=$DIFY_API_KEY
FIREWALL_ENABLED=false
FIREWALL_MODE=off
PORT=10000
EOF
    else
        echo "⚠️ .env.cloud nicht gefunden"
    fi
    
    echo ""
    read -p "Drücke Enter um fortzufahren..."
    show_menu
}

setup_cloudflare_secrets() {
    echo -e "${BLUE}🔐 Cloudflare Worker Secrets${NC}"
    
    if ! command -v wrangler &> /dev/null; then
        echo "❌ Wrangler CLI nicht installiert"
        echo "Installiere mit: npm install -g wrangler"
        return
    fi
    
    cd edge/cloudflare
    
    if [ ! -f "../../.env.cloud" ]; then
        echo "❌ .env.cloud nicht gefunden"
        return
    fi
    
    source ../../.env.cloud
    
    echo "Setze Secrets für AI Trigger Worker..."
    
    echo "$BACKEND_URL" | wrangler secret put BACKEND_URL -c wrangler.ai-trigger.toml
    echo "$BACKEND_API_KEY" | wrangler secret put BACKEND_API_KEY -c wrangler.ai-trigger.toml
    echo "$SUPABASE_URL" | wrangler secret put SUPABASE_URL -c wrangler.ai-trigger.toml
    echo "$SUPABASE_KEY" | wrangler secret put SUPABASE_KEY -c wrangler.ai-trigger.toml
    echo "$DIFY_API_URL" | wrangler secret put DIFY_API_URL -c wrangler.ai-trigger.toml
    
    cd ../..
    
    echo -e "${GREEN}✅ Secrets gesetzt${NC}"
    echo ""
    show_menu
}

test_all_services() {
    echo -e "${BLUE}🧪 Teste alle Services${NC}"
    echo ""
    
    # Test Backend
    echo -n "Backend (Render): "
    if curl -f -s https://sigmacode-backend.onrender.com/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Online${NC}"
    else
        echo -e "${YELLOW}⚠️  Offline oder noch nicht deployed${NC}"
    fi
    
    # Test Frontend
    echo -n "Frontend (Vercel): "
    VERCEL_URL=$(vercel ls 2>/dev/null | grep Production | awk '{print $2}' | head -1)
    if [ -n "$VERCEL_URL" ]; then
        if curl -f -s "$VERCEL_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Online${NC}"
            echo "  URL: $VERCEL_URL"
        else
            echo -e "${YELLOW}⚠️  Offline${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Noch nicht deployed${NC}"
    fi
    
    # Test Worker
    echo -n "Cloudflare Worker: "
    if curl -f -s https://sigmacode-ai-triggers.workers.dev/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Online${NC}"
    else
        echo -e "${YELLOW}⚠️  Offline oder Custom Domain nötig${NC}"
    fi
    
    echo ""
    read -p "Drücke Enter um fortzufahren..."
    show_menu
}

show_github_secrets_guide() {
    echo -e "${BLUE}📝 GitHub Secrets Setup Guide${NC}"
    echo ""
    echo "Gehe zu: GitHub Repository → Settings → Secrets and variables → Actions"
    echo ""
    echo "Erstelle folgende Secrets:"
    echo ""
    echo -e "${YELLOW}Vercel:${NC}"
    echo "  VERCEL_TOKEN         → Vercel Account Settings → Tokens → Create"
    echo "  VERCEL_ORG_ID        → Vercel Team Settings → Team ID"
    echo "  VERCEL_PROJECT_ID    → Vercel Project Settings → Project ID"
    echo ""
    echo -e "${YELLOW}Render:${NC}"
    echo "  RENDER_DEPLOY_HOOK   → Render Service → Settings → Deploy Hook"
    echo ""
    echo -e "${YELLOW}Cloudflare:${NC}"
    echo "  CLOUDFLARE_API_TOKEN    → Cloudflare Dashboard → My Profile → API Tokens"
    echo "  CLOUDFLARE_ACCOUNT_ID   → Cloudflare Dashboard → Account ID (in URL)"
    echo ""
    echo "Nach dem Setzen der Secrets werden Deployments automatisch ausgelöst bei Git Push!"
    echo ""
    read -p "Drücke Enter um fortzufahren..."
    show_menu
}

show_menu

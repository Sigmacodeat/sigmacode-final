#!/bin/bash

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
           |___/   🚀 FINAL DEPLOYMENT CHECK         
EOF
echo -e "${NC}"

PROJECT_DIR="$(pwd)"
SCRIPT_DIR="$PROJECT_DIR/scripts"

echo -e "${YELLOW}🔍 Führe finale Deployment-Checks durch...${NC}"
echo ""

# ============================================
# PREREQUISITES CHECK
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  🔧 Prerequisites Check${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description gefunden"
        return 0
    else
        echo -e "${RED}✗${NC} $description fehlt: $file"
        return 1
    fi
}

check_dir() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description gefunden"
        return 0
    else
        echo -e "${RED}✗${NC} $description fehlt: $dir"
        return 1
    fi
}

ERRORS=0

# Core Files
check_file "sigmacode-installer.sh" "Installer-Skript" || ERRORS=$((ERRORS+1))
check_file "package.json" "Frontend package.json" || ERRORS=$((ERRORS+1))
check_file "vercel.json" "Vercel Konfiguration" || ERRORS=$((ERRORS+1))

# Backend
check_dir "backend" "Backend-Verzeichnis" || ERRORS=$((ERRORS+1))
check_file "backend/app.py" "FastAPI App" || ERRORS=$((ERRORS+1))
check_file "backend/requirements.txt" "Backend Dependencies" || ERRORS=$((ERRORS+1))
check_file "backend/render.yaml" "Render Konfiguration" || ERRORS=$((ERRORS+1))

# Edge/Workers
check_dir "edge/cloudflare" "Cloudflare Workers" || ERRORS=$((ERRORS+1))
check_file "edge/cloudflare/ai-trigger-worker.ts" "AI Trigger Worker" || ERRORS=$((ERRORS+1))
check_file "edge/cloudflare/wrangler.ai-trigger.toml" "Worker Konfiguration" || ERRORS=$((ERRORS+1))

# Database
check_dir "database/schema" "Database Schema" || ERRORS=$((ERRORS+1))
check_file "database/schema/ai-saas.sql" "AI SaaS Schema" || ERRORS=$((ERRORS+1))

# Scripts
check_dir "scripts" "Scripts-Verzeichnis" || ERRORS=$((ERRORS+1))
check_file "scripts/setup-cloud.sh" "Cloud Setup Script" || ERRORS=$((ERRORS+1))
check_file "scripts/test-deployment.sh" "Test Script" || ERRORS=$((ERRORS+1))

# GitHub Actions
check_dir ".github/workflows" "GitHub Actions" || ERRORS=$((ERRORS+1))
check_file ".github/workflows/deploy-backend.yml" "Backend Deployment" || ERRORS=$((ERRORS+1))
check_file ".github/workflows/deploy-frontend.yml" "Frontend Deployment" || ERRORS=$((ERRORS+1))
check_file ".github/workflows/deploy-workers.yml" "Workers Deployment" || ERRORS=$((ERRORS+1))

# Documentation
check_file "CLOUD-DEPLOYMENT.md" "Deployment Dokumentation" || ERRORS=$((ERRORS+1))

echo ""
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ $ERRORS Fehler gefunden! Bitte beheben.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Alle Dateien vorhanden!${NC}"
fi

echo ""

# ============================================
# CONFIGURATION VALIDATION
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  ⚙️ Configuration Validation${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

validate_json() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        if python3 -m json.tool "$file" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $description JSON valid"
            return 0
        else
            echo -e "${RED}✗${NC} $description JSON invalid"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠${NC} $description nicht gefunden"
        return 1
    fi
}

validate_yaml() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        if python3 -c "import yaml; yaml.safe_load(open('$file'))" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $description YAML valid"
            return 0
        else
            echo -e "${RED}✗${NC} $description YAML invalid"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠${NC} $description nicht gefunden"
        return 1
    fi
}

# JSON Files
validate_json "package.json" "Frontend package.json" || ERRORS=$((ERRORS+1))
validate_json "vercel.json" "Vercel Config" || ERRORS=$((ERRORS+1))
validate_json "edge/cloudflare/package.json" "Worker package.json" || ERRORS=$((ERRORS+1))

# YAML Files
validate_yaml "backend/render.yaml" "Render Config" || ERRORS=$((ERRORS+1))
validate_yaml "edge/cloudflare/wrangler.ai-trigger.toml" "Worker Config" || ERRORS=$((ERRORS+1))

echo ""
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Konfigurationsfehler gefunden!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Alle Konfigurationen gültig!${NC}"
fi

echo ""

# ============================================
# EXECUTABLE CHECKS
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 Executable Scripts${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Make scripts executable
chmod +x sigmacode-installer.sh
chmod +x scripts/setup-cloud.sh
chmod +x scripts/test-deployment.sh

echo -e "${GREEN}✓${NC} Skripte ausführbar gemacht"

# Test script syntax
if bash -n sigmacode-installer.sh > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Installer-Skript Syntax OK"
else
    echo -e "${RED}✗${NC} Installer-Skript Syntax Fehler"
    ERRORS=$((ERRORS+1))
fi

if bash -n scripts/setup-cloud.sh > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Setup-Skript Syntax OK"
else
    echo -e "${RED}✗${NC} Setup-Skript Syntax Fehler"
    ERRORS=$((ERRORS+1))
fi

if bash -n scripts/test-deployment.sh > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Test-Skript Syntax OK"
else
    echo -e "${RED}✗${NC} Test-Skript Syntax Fehler"
    ERRORS=$((ERRORS+1))
fi

echo ""

# ============================================
# SUMMARY & NEXT STEPS
# ============================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  🎯 DEPLOYMENT READY!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ $ERRORS Fehler gefunden. Bitte beheben bevor du deployen kannst.${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Nächste Schritte:${NC}"
    echo "1. Überprüfe die fehlenden Dateien oben"
    echo "2. Führe Syntax-Checks durch"
    echo "3. Teste lokale Entwicklung"
    echo "4. Dann starte mit dem Installer"
    exit 1
else
    echo -e "${GREEN}✅ Alle Checks bestanden! Dein SigmaCode AI SaaS ist bereit für den Launch!${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Launch-Sequenz:${NC}"
    echo ""
    echo -e "  ${BLUE}1. Vollständige Installation:${NC}"
    echo -e "     ./sigmacode-installer.sh"
    echo ""
    echo -e "  ${BLUE}2. Services konfigurieren:${NC}"
    echo -e "     ./scripts/setup-cloud.sh"
    echo ""
    echo -e "  ${BLUE}3. Tests durchführen:${NC}"
    echo -e "     ./scripts/test-deployment.sh"
    echo ""
    echo -e "  ${BLUE}4. Git & Push:${NC}"
    echo -e "     git add . && git commit -m 'Ready for production'"
    echo -e "     git push origin main"
    echo ""
    echo -e "  ${BLUE}5. CI/CD wartet automatisch:${NC}"
    echo -e "     Frontend → Vercel"
    echo -e "     Backend → Render"
    echo -e "     Workers → Cloudflare"
    echo ""
    echo -e "${GREEN}🎉 Viel Erfolg mit SigmaCode AI SaaS!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Tipp: Nutze die CLOUD-DEPLOYMENT.md für detaillierte Anleitungen${NC}"
fi

#!/bin/bash

# SIGMACODE AI - Login Test Script
# Testet den kompletten Login-Flow

echo "🔐 SIGMACODE AI - Login Test"
echo "=============================="
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Konfiguration
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@sigmacode.ai"
ADMIN_PASSWORD="password123"

echo "📋 Schritt 1: Teste Server-Verbindung..."
if curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Server läuft"
else
    echo -e "${RED}✗${NC} Server läuft nicht!"
    echo ""
    echo "Bitte starte den Server mit:"
    echo "  pnpm dev"
    exit 1
fi

echo ""
echo "👥 Schritt 2: Erstelle Test-User..."
SEED_RESPONSE=$(curl -s -X POST "$BASE_URL/api/dev/seed-users")
if echo "$SEED_RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✓${NC} Test-User erstellt"
    echo "$SEED_RESPONSE" | jq . 2>/dev/null || echo "$SEED_RESPONSE"
else
    echo -e "${YELLOW}⚠${NC} Test-User-Erstellung fehlgeschlagen (möglicherweise existieren sie bereits)"
    echo "$SEED_RESPONSE"
fi

echo ""
echo "🔑 Schritt 3: Teste Credentials..."
echo "   E-Mail: $ADMIN_EMAIL"
echo "   Passwort: $ADMIN_PASSWORD"

echo ""
echo "🌐 Öffne Browser für manuellen Test..."
echo "   URL: $BASE_URL/de/login"
echo ""
echo -e "${GREEN}➜${NC} Bitte melde dich im Browser an mit:"
echo "   E-Mail:   $ADMIN_EMAIL"
echo "   Passwort: $ADMIN_PASSWORD"
echo ""
echo "   Erwartung: Redirect zu $BASE_URL/de/dashboard"
echo ""

# Optional: Browser öffnen (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Browser automatisch öffnen? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$BASE_URL/de/login"
    fi
fi

echo ""
echo "✅ Test-Script abgeschlossen!"
echo ""
echo "📝 Weitere Infos: siehe TEST-LOGIN.md"

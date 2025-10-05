#!/bin/bash
# Sigmacode2 Schnell-Test ohne Services
# Zeigt erwartete API-Endpunkte und Test-Befehle

set -e

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 Sigmacode2 Schnell-Test${NC}"
echo ""

# 1. Basis-Setup prüfen
echo -e "${YELLOW}🔍 Prüfe Setup...${NC}"
if [ -f .env.local ]; then
    echo -e "${GREEN}✅ .env.local gefunden${NC}"
else
    echo -e "${RED}❌ .env.local fehlt${NC}"
    echo -e "${YELLOW}📝 Erstelle .env.local aus .env.example${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local erstellt${NC}"
fi

# 2. API-Endpunkte zeigen
echo -e "${BLUE}📡 API-Endpunkte:${NC}"
echo "   GET  /api/firewall/stream           # SSE-Stream für Firewall-Events"
echo "   POST /api/agents/{id}/invoke        # Agent aufrufen"
echo ""
echo -e "${BLUE}🤖 Demo-Agenten IDs:${NC}"
echo "   demo-agent-dify-basic              # Firewall aus"
echo "   demo-agent-superagent-enforce      # Firewall strikt"
echo "   demo-agent-shadow-compare          # Shadow-Mode"
echo ""

# 3. Test-Befehle zeigen
echo -e "${BLUE}🧪 Test-Befehle:${NC}"
echo ""
echo -e "${YELLOW}1️⃣  Firewall-Stream öffnen:${NC}"
echo "   curl -N http://localhost:3000/api/firewall/stream"
echo ""
echo -e "${YELLOW}2️⃣  Basic Agent (Firewall aus):${NC}"
echo '   curl -X POST http://localhost:3000/api/agents/demo-agent-dify-basic/invoke \'
echo '     -H "Content-Type: application/json" \'
echo '     -d \'{"input": "Hallo! Wer bist du?", "context": {"demo": true}}\''
echo ""
echo -e "${YELLOW}3️⃣  Secure Agent (Firewall strikt):${NC}"
echo '   curl -X POST http://localhost:3000/api/agents/demo-agent-superagent-enforce/invoke \'
echo '     -H "Content-Type: application/json" \'
echo '     -d \'{"input": "Suche GitHub Commits", "context": {"repo": "Sigmacode2"}}\''
echo ""

# 4. Services-Status zeigen
echo -e "${BLUE}🔧 Services-Status:${NC}"
echo -e "${YELLOW}PostgreSQL:${NC}"
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Läuft${NC}"
else
    echo -e "${RED}❌ Gestoppt${NC}"
    echo -e "${YELLOW}   Starte mit: docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sigmacode_dev -p 5432:5432 -d postgres:15${NC}"
fi

echo -e "${YELLOW}Next.js App:${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Läuft${NC}"
else
    echo -e "${RED}❌ Gestoppt${NC}"
    echo -e "${YELLOW}   Starte mit: pnpm dev${NC}"
fi

echo ""
echo -e "${BLUE}📋 Nächste Schritte:${NC}"
echo "   1. ./scripts/start-services.sh     # Services starten"
echo "   2. pnpm dev                       # App starten"
echo "   3. ./scripts/test-agents.sh        # Tests laufen lassen"
echo ""

echo -e "${GREEN}🎉 Bereit zum Testen!${NC}"

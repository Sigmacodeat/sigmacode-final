#!/bin/bash
# Sigmacode2 Dev-Setup (ohne DB-Abhängigkeit)
# Bereitet die Frontend-Entwicklung vor

set -e

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Sigmacode2 Dev-Setup${NC}"
echo ""

# 1. Prüfe ob .env.local existiert
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}📝 Erstelle .env.local aus .env.example${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local erstellt${NC}"
    echo -e "${YELLOW}⚠️  Passe .env.local an mit deinen DB/Service-URLs!${NC}"
else
    echo -e "${GREEN}✅ .env.local existiert bereits${NC}"
fi

# 2. TypeScript prüfen
echo -e "${YELLOW}🔍 Prüfe TypeScript...${NC}"
pnpm type-check
echo -e "${GREEN}✅ TypeScript OK${NC}"

# 3. Linting prüfen
echo -e "${YELLOW}🔍 Prüfe Linting...${NC}"
pnpm lint
echo -e "${GREEN}✅ Linting OK${NC}"

# 4. Test-Skripts zeigen
echo -e "${GREEN}✅ Frontend-Setup abgeschlossen!${NC}"
echo ""
echo -e "${BLUE}🧪 Zum Testen (nach Services-Start):${NC}"
echo "   ./scripts/test-agents.sh          # Alle Tests"
echo "   ./scripts/test-firewall-stream.sh # SSE-Stream"
echo "   ./scripts/test-basic-agent.sh     # Dify direkt"
echo "   ./scripts/test-secure-agent.sh    # Firewall Enforce"
echo "   ./scripts/test-shadow-agent.sh    # Shadow Mode"
echo ""

# 5. Services starten
echo -e "${YELLOW}🔧 Services starten:${NC}"
echo -e "${BLUE}1. Starte Next.js App:${NC}"
echo "   pnpm dev"
echo ""
echo -e "${BLUE}2. Starte Dify (Docker):${NC}"
echo "   cd dify/docker && docker-compose up -d"
echo ""
echo -e "${BLUE}3. Starte Superagent (Docker):${NC}"
echo "   cd superagent && docker-compose up -d"
echo ""
echo -e "${BLUE}4. Starte PostgreSQL (Docker):${NC}"
echo "   docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sigmacode_dev -p 5432:5432 -d postgres:15"
echo ""

# 6. DB Setup (nach PostgreSQL-Start)
echo -e "${BLUE}5. Nach PostgreSQL-Start:${NC}"
echo "   pnpm drizzle:migrate    # Migriere DB"
echo "   pnpm db:seed           # Seede Demo-Daten"
echo ""

# 7. Wichtige URLs
echo -e "${BLUE}📍 URLs:${NC}"
echo "   App: http://localhost:3000"
echo "   Firewall Stream: http://localhost:3000/api/firewall/stream"
echo "   Agent Invoke: http://localhost:3000/api/agents/{id}/invoke"
echo ""
echo -e "${BLUE}🤖 Demo-Agenten IDs:${NC}"
echo "   demo-agent-dify-basic      # Firewall aus"
echo "   demo-agent-superagent-enforce # Firewall strikt"
echo "   demo-agent-shadow-compare   # Firewall Shadow-Mode"
echo ""

echo -e "${GREEN}🎉 Frontend bereit! Starte Services und teste!${NC}"

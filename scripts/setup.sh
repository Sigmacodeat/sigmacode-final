#!/bin/bash
# Sigmacode2 Setup-Skript
# Bereitet die Entwicklungsumgebung vor

set -e

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Sigmacode2 Setup${NC}"
echo ""

# 1. Prüfe ob .env.local existiert
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}📝 Erstelle .env.local aus .env.example${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local erstellt${NC}"
    echo -e "${YELLOW}⚠️  Bitte passe .env.local an mit deinen echten Werten!${NC}"
else
    echo -e "${GREEN}✅ .env.local existiert bereits${NC}"
fi

# 2. DB migrieren
echo -e "${YELLOW}🗄️  Migriere Datenbank...${NC}"
pnpm drizzle:migrate
echo -e "${GREEN}✅ Datenbank migriert${NC}"

# 3. DB seeden
echo -e "${YELLOW}🌱 Seede Datenbank mit Demo-Daten...${NC}"
pnpm db:seed
echo -e "${GREEN}✅ Datenbank geseeded (3 Demo-Agenten + Admin-User)${NC}"

# 4. Services starten
echo -e "${YELLOW}🔧 Starte Services...${NC}"
echo -e "${BLUE}1. Starte Next.js App:${NC}"
echo "   pnpm dev"
echo ""
echo -e "${BLUE}2. Starte Dify (Docker):${NC}"
echo "   cd dify/docker && docker-compose up -d"
echo ""
echo -e "${BLUE}3. Starte Superagent (Docker):${NC}"
echo "   cd superagent && docker-compose up -d"
echo ""

# 5. Test-Skripts zeigen
echo -e "${GREEN}✅ Setup abgeschlossen!${NC}"
echo ""
echo -e "${BLUE}🧪 Zum Testen:${NC}"
echo "   ./scripts/test-agents.sh          # Alle Tests"
echo "   ./scripts/test-firewall-stream.sh # SSE-Stream"
echo "   ./scripts/test-basic-agent.sh     # Dify direkt"
echo "   ./scripts/test-secure-agent.sh    # Firewall Enforce"
echo "   ./scripts/test-shadow-agent.sh    # Shadow Mode"
echo ""

# 6. Wichtige URLs
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

# 7. Erwartete Firewall-Events
echo -e "${BLUE}🎯 Erwartete Events im Stream:${NC}"
echo "   event: hello (Stream startet)"
echo "   event: firewall (bei Agent-Invokes)"
echo "   - phase: pre/post/shadow/error"
echo "   - backend: dify/superagent"
echo "   - status: 200/403/500 etc."
echo ""

echo -e "${GREEN}🎉 Alles bereit zum Testen!${NC}"

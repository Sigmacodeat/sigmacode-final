#!/bin/bash
# Sigmacode2 Services Starter
# Startet alle nötigen Services für die Entwicklung

set -e

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Sigmacode2 Services${NC}"
echo ""

# 1. Prüfe ob PostgreSQL läuft
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${YELLOW}🐘 Starte PostgreSQL...${NC}"
    docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sigmacode_dev -p 5432:5432 -d postgres:15
    echo -e "${GREEN}✅ PostgreSQL gestartet${NC}"
    sleep 2
else
    echo -e "${GREEN}✅ PostgreSQL läuft bereits${NC}"
fi

# 2. DB migrieren
echo -e "${YELLOW}🗄️  Migriere Datenbank...${NC}"
pnpm drizzle:migrate
echo -e "${GREEN}✅ Datenbank migriert${NC}"

# 3. DB seeden
echo -e "${YELLOW}🌱 Seede Datenbank...${NC}"
pnpm db:seed
echo -e "${GREEN}✅ Datenbank geseeded${NC}"

# 4. Services zeigen
echo -e "${GREEN}✅ Alle Services bereit!${NC}"
echo ""
echo -e "${BLUE}📋 Starte in separaten Terminals:${NC}"
echo "   Terminal 1: pnpm dev                    # Next.js App"
echo "   Terminal 2: cd dify/docker && docker-compose up -d  # Dify"
echo "   Terminal 3: cd superagent && docker-compose up -d  # Superagent"
echo ""
echo -e "${BLUE}🧪 Nach Services-Start testen:${NC}"
echo "   ./scripts/test-agents.sh"
echo ""

echo -e "${GREEN}🎉 Alles bereit zum Testen!${NC}"

#!/bin/bash
# Firewall-Stream-Test-Skript für Sigmacode2
# Öffnet den SSE-Stream für Firewall-Events

set -e

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Basis-URL aus ENV oder Default
BASE_URL="${BASE_URL:-http://localhost:3000}"

echo -e "${GREEN}🔥 Sigmacode2 Firewall-Stream Test${NC}"
echo -e "${BLUE}Base URL: $BASE_URL${NC}"
echo -e "${BLUE}Öffne Server-Sent Events Stream für Firewall-Events...${NC}"
echo -e "${YELLOW}Hinweis: Stream läuft kontinuierlich. Stoppe mit Ctrl+C${NC}"
echo ""

# SSE-Stream öffnen
curl -N "$BASE_URL/api/firewall/stream" \
    -H "Accept: text/event-stream" \
    -H "Cache-Control: no-cache" \
    --no-buffer \
    --silent

echo ""
echo -e "${GREEN}Stream beendet.${NC}"

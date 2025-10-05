#!/bin/bash
# Basic Agent Test (Dify direkt, Firewall aus)
# Verwendet ENV-Variablen für URLs und Agent-IDs

set -e

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="${BASE_URL:-http://localhost:3000}"
AGENT_ID="${AGENT_ID:-demo-agent-dify-basic}"

echo -e "${GREEN}🤖 Basic Agent Test (Dify direkt, Firewall aus)${NC}"
echo -e "${BLUE}Base URL: $BASE_URL${NC}"
echo -e "${BLUE}Agent ID: $AGENT_ID${NC}"
echo ""

curl -X POST "$BASE_URL/api/agents/$AGENT_ID/invoke" \
    -H "Content-Type: application/json" \
    -d '{
        "input": "Sag mir kurz Hallo! Wer bist du?",
        "context": {
            "demo": true,
            "type": "basic",
            "timestamp": "'$(date -Iseconds)'"
        }
    }' \
    -s | jq .

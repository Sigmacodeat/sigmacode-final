#!/bin/bash
# Shadow Compare Agent Test (Dify + Superagent parallel)
# Verwendet ENV-Variablen für URLs und Agent-IDs

set -e

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="${BASE_URL:-http://localhost:3000}"
AGENT_ID="${AGENT_ID:-demo-agent-shadow-compare}"

echo -e "${GREEN}👥 Shadow Compare Agent Test${NC}"
echo -e "${BLUE}Base URL: $BASE_URL${NC}"
echo -e "${BLUE}Agent ID: $AGENT_ID${NC}"
echo -e "${YELLOW}Hinweis: Stelle sicher, dass FIREWALL_MODE=shadow ist${NC}"
echo ""

curl -X POST "$BASE_URL/api/agents/$AGENT_ID/invoke" \
    -H "Content-Type: application/json" \
    -d '{
        "input": "Fasse die README.md von sigmacode2 zusammen",
        "context": {
            "repo": "Sigmacode2",
            "type": "shadow",
            "timestamp": "'$(date -Iseconds)'"
        }
    }' \
    -s | jq .

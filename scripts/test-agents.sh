#!/bin/bash
# Agent-Firewall-Test-Skript für Sigmacode2
# Verwendet ENV-Variablen für Backend-URLs und Agent-IDs

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Basis-URLs aus ENV oder Defaults
BASE_URL="${BASE_URL:-http://localhost:3000}"
DIFY_API_URL="${DIFY_API_URL:-http://localhost:5000}"
SUPERAGENT_URL="${SUPERAGENT_URL:-http://localhost:8000}"
FIREWALL_MODE="${FIREWALL_MODE:-enforce}"

# Agent-IDs aus Seed-Daten
AGENT_BASIC="demo-agent-dify-basic"
AGENT_SECURE="demo-agent-superagent-enforce"
AGENT_SHADOW="demo-agent-shadow-compare"

echo -e "${BLUE}🚀 Sigmacode2 Agent-Firewall-Test Suite${NC}"
echo -e "${BLUE}Base URL: $BASE_URL${NC}"
echo -e "${BLUE}Firewall Mode: $FIREWALL_MODE${NC}"
echo -e "${BLUE}Dify API: $DIFY_API_URL${NC}"
echo -e "${BLUE}Superagent API: $SUPERAGENT_URL${NC}"
echo ""

# Funktion zum Ausführen von curl-Requests
run_curl() {
    local method="$1"
    local url="$2"
    local data="$3"
    local description="$4"

    echo -e "${YELLOW}📡 $description${NC}"
    echo -e "${BLUE}Request: $method $url${NC}"
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        echo -e "${BLUE}Data: $data${NC}"
    fi
    echo ""

    if [ "$method" = "POST" ]; then
        curl -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -s
    else
        curl -X GET "$url" -s
    fi
    echo ""
    echo ""
}

# 1. Firewall-Stream öffnen (SSE)
echo -e "${GREEN}1️⃣ Firewall-Stream öffnen (SSE)${NC}"
echo -e "${BLUE}Öffne Server-Sent Events Stream für Firewall-Events...${NC}"
echo -e "${YELLOW}Hinweis: Stream läuft kontinuierlich. Stoppe mit Ctrl+C${NC}"
echo ""
curl -N "$BASE_URL/api/firewall/stream" &
STREAM_PID=$!
echo -e "${GREEN}Stream gestartet (PID: $STREAM_PID)${NC}"
echo ""

# Warte kurz, damit der Stream läuft
sleep 2

# 2. Basic Agent (ohne Firewall)
echo -e "${GREEN}2️⃣ Basic Agent Test (Dify direkt, Firewall aus)${NC}"
run_curl "POST" \
    "$BASE_URL/api/agents/$AGENT_BASIC/invoke" \
    '{"input": "Sag mir kurz Hallo! Wer bist du?", "context": {"demo": true, "type": "basic"}}' \
    "Test Basic Agent (Firewall ausgeschaltet)"

# 3. Secure Agent (Enforce-Modus)
echo -e "${GREEN}3️⃣ Secure Web Agent Test (Firewall Enforce)${NC}"
run_curl "POST" \
    "$BASE_URL/api/agents/$AGENT_SECURE/invoke" \
    '{"input": "Suche die letzten 3 Commits von sigmacode2 auf GitHub", "context": {"repo": "Sigmacode2", "type": "secure"}}' \
    "Test Secure Agent (Firewall strikt)"

# 4. Shadow Compare Agent
echo -e "${GREEN}4️⃣ Shadow Compare Agent Test${NC}"
run_curl "POST" \
    "$BASE_URL/api/agents/$AGENT_SHADOW/invoke" \
    '{"input": "Fasse die README.md von sigmacode2 zusammen", "context": {"repo": "Sigmacode2", "type": "shadow"}}' \
    "Test Shadow Agent (Dify + Superagent parallel)"

# 5. Fehler-Test (ungültiger Agent)
echo -e "${GREEN}5️⃣ Error Handling Test${NC}"
run_curl "POST" \
    "$BASE_URL/api/agents/invalid-agent/invoke" \
    '{"input": "Das sollte fehlschlagen", "context": {"test": "error"}}' \
    "Test Error Handling (ungültiger Agent)"

# Stream stoppen
echo -e "${YELLOW}🛑 Stoppe Firewall-Stream...${NC}"
kill $STREAM_PID 2>/dev/null || true
wait $STREAM_PID 2>/dev/null || true

echo -e "${GREEN}✅ Alle Tests abgeschlossen!${NC}"
echo -e "${BLUE}Prüfe die Audit-Logs in der Datenbank für Details zu den Firewall-Events.${NC}"

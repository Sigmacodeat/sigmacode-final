#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 SigmaCode Deployment Test Suite${NC}"
echo ""

BACKEND_URL="${1:-https://sigmacode-backend.onrender.com}"
FRONTEND_URL="${2:-}"
WORKER_URL="${3:-https://sigmacode-ai-triggers.workers.dev}"

test_backend() {
    echo -e "${BLUE}Testing Backend API...${NC}"
    
    echo -n "  Health Check: "
    if response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health"); then
        http_code=$(echo "$response" | tail -n1)
        if [ "$http_code" -eq 200 ]; then
            echo -e "${GREEN}✅ PASS${NC}"
        else
            echo -e "${RED}❌ FAIL (HTTP $http_code)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL (Connection Error)${NC}"
        return 1
    fi
    
    echo -n "  Status Endpoint: "
    if response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/status"); then
        http_code=$(echo "$response" | tail -n1)
        if [ "$http_code" -eq 200 ]; then
            echo -e "${GREEN}✅ PASS${NC}"
        else
            echo -e "${RED}❌ FAIL (HTTP $http_code)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
    
    echo -n "  API Docs: "
    if curl -s -f "$BACKEND_URL/docs" > /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${YELLOW}⚠️  WARN (Docs might be disabled)${NC}"
    fi
    
    echo ""
}

test_frontend() {
    if [ -z "$FRONTEND_URL" ]; then
        echo -e "${YELLOW}Frontend URL nicht angegeben, überspringe...${NC}"
        echo ""
        return
    fi
    
    echo -e "${BLUE}Testing Frontend...${NC}"
    
    echo -n "  Homepage: "
    if curl -s -f "$FRONTEND_URL" > /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
    
    echo -n "  API Route: "
    if curl -s -f "$FRONTEND_URL/api/health" > /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${YELLOW}⚠️  WARN${NC}"
    fi
    
    echo ""
}

test_worker() {
    echo -e "${BLUE}Testing Cloudflare Worker...${NC}"
    
    echo -n "  Health Check: "
    if response=$(curl -s -w "\n%{http_code}" "$WORKER_URL/health"); then
        http_code=$(echo "$response" | tail -n1)
        if [ "$http_code" -eq 200 ]; then
            echo -e "${GREEN}✅ PASS${NC}"
        else
            echo -e "${YELLOW}⚠️  WARN (HTTP $http_code)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Worker möglicherweise nicht deployed${NC}"
    fi
    
    echo ""
}

test_integration() {
    echo -e "${BLUE}Testing Integration...${NC}"
    
    if [ -z "$FRONTEND_URL" ]; then
        echo -e "${YELLOW}Integration Test übersprungen (kein Frontend URL)${NC}"
        echo ""
        return
    fi
    
    echo -n "  Frontend → Backend: "
    # Test if frontend can reach backend via proxy
    if curl -s -f "$FRONTEND_URL/api/backend/health" > /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${YELLOW}⚠️  WARN (Proxy config needed)${NC}"
    fi
    
    echo ""
}

main() {
    echo "Backend URL:  $BACKEND_URL"
    echo "Frontend URL: ${FRONTEND_URL:-Not provided}"
    echo "Worker URL:   $WORKER_URL"
    echo ""
    
    FAILED=0
    
    test_backend || FAILED=1
    test_frontend || FAILED=1
    test_worker || FAILED=1
    test_integration || FAILED=1
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
        echo "🎉 Your deployment is healthy!"
    else
        echo -e "${RED}❌ SOME TESTS FAILED${NC}"
        echo "Check the logs above for details"
        exit 1
    fi
    
    echo ""
}

main

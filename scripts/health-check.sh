#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper
ok() { echo -e "${GREEN}OK${NC}"; }
fail() { echo -e "${RED}NOK${NC}"; }
warn() { echo -e "${YELLOW}WARN${NC}"; }

has() { command -v "$1" >/dev/null 2>&1; }

check_tcp() {
  local host=$1 port=$2 name=$3
  if has nc; then
    if nc -z "$host" "$port" >/dev/null 2>&1; then
      printf "[TCP] %-22s %-20s " "$name" "$host:$port"; ok
    else
      printf "[TCP] %-22s %-20s " "$name" "$host:$port"; fail
    fi
  else
    printf "[TCP] %-22s %-20s " "$name" "$host:$port"; warn; echo "nc fehlt"
  fi
}

check_http() {
  local url=$1 name=$2 expect=${3:-200}
  local code
  code=$(curl -sk -o /dev/null -w "%{http_code}" "$url" || true)
  if [[ "$code" == "$expect" || "$code" == 302 || "$code" == 301 ]]; then
    printf "[HTTP] %-22s %-40s -> %s " "$name" "$url" "$code"; ok
  else
    printf "[HTTP] %-22s %-40s -> %s " "$name" "$url" "$code"; fail
  fi
}

check_http_es() {
  # Elasticsearch may require basic auth in 8.x
  local url=$1 name=$2
  local code
  if [[ -n "${ELASTIC_PASSWORD:-}" ]]; then
    code=$(curl -sk -u "elastic:${ELASTIC_PASSWORD}" -o /dev/null -w "%{http_code}" "$url" || true)
  else
    code=$(curl -sk -o /dev/null -w "%{http_code}" "$url" || true)
  fi
  if [[ "$code" == 200 || "$code" == 302 || "$code" == 301 ]]; then
    printf "[HTTP] %-22s %-40s -> %s " "$name" "$url" "$code"; ok
  else
    printf "[HTTP] %-22s %-40s -> %s " "$name" "$url" "$code"; fail
  fi
}

header() { echo -e "\n==== $1 ===="; }

# Load env if exists
if [ -f .env ]; then
  set -a; source .env; set +a
fi

# Defaults
KONG_HTTP_PORT=${KONG_HTTP_PORT:-8002}
GRAFANA_PORT=${GRAFANA_PORT:-3001}
PROM_PORT=${PROM_PORT:-9091}
DIFY_PORT=${DIFY_PORT:-5001}
DIFY_WEB_PORT=${DIFY_WEB_PORT:-5002}
KONG_ADMIN_HTTP=8001
KONG_HTTPS=8443
ES_PORT=9200
KIBANA_PORT=5601
WOODPECKER_PORT=8000
SUPERAGENT_PORT=8003
SUPABASE_REST_PORT=${KONG_HTTP_PORT}

header "Container Status"
if has docker; then
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || true
else
  echo "docker nicht gefunden"; exit 1
fi

header "TCP Ports"
check_tcp 127.0.0.1 $KONG_ADMIN_HTTP "Kong Admin"
check_tcp 127.0.0.1 $KONG_HTTP_PORT "Kong Proxy HTTP"
check_tcp 127.0.0.1 $KONG_HTTPS "Kong Proxy HTTPS"
check_tcp 127.0.0.1 $PROM_PORT "Prometheus"
check_tcp 127.0.0.1 $GRAFANA_PORT "Grafana"
check_tcp 127.0.0.1 $DIFY_PORT "Dify"
check_tcp 127.0.0.1 $DIFY_WEB_PORT "Dify Web"
check_tcp 127.0.0.1 $ES_PORT "Elasticsearch"
check_tcp 127.0.0.1 $KIBANA_PORT "Kibana"
check_tcp 127.0.0.1 $WOODPECKER_PORT "Woodpecker"
check_tcp 127.0.0.1 $SUPERAGENT_PORT "Superagent"

header "HTTP Endpoints"
check_http "http://localhost:${KONG_ADMIN_HTTP}/status" "Kong Admin" 200
# Kong Proxys liefern an / i. d. R. 404 ohne Route -> als OK werten
check_http "http://localhost:${KONG_HTTP_PORT}/" "Kong Proxy HTTP" 404
check_http "https://localhost:${KONG_HTTPS}/" "Kong Proxy HTTPS" 404
check_http "http://localhost:${PROM_PORT}/-/healthy" "Prometheus" 200
check_http "http://localhost:${GRAFANA_PORT}/api/health" "Grafana" 200
if docker ps --format '{{.Names}}' | grep -q '^dify-api$'; then
  check_http "http://localhost:${DIFY_PORT}/console/api/ping" "Dify API" 200
else
  printf "[HTTP] %-22s %-40s -> %s " "Dify API (skipped)" "http://localhost:${DIFY_PORT}/" "---"; warn; echo "Container nicht aktiv"
fi
if docker ps --format '{{.Names}}' | grep -q '^dify-web$'; then
  check_http "http://localhost:${DIFY_WEB_PORT}/" "Dify Web" 200
else
  printf "[HTTP] %-22s %-40s -> %s " "Dify Web (skipped)" "http://localhost:${DIFY_WEB_PORT}/" "---"; warn; echo "Container nicht aktiv"
fi
check_http_es "http://localhost:${ES_PORT}/_cluster/health" "Elasticsearch"
# Kibana kann initial 302/401 liefern, wir akzeptieren 200/302/301 via check_http
check_http "http://localhost:${KIBANA_PORT}/api/status" "Kibana" 200
check_http "http://localhost:${WOODPECKER_PORT}/" "Woodpecker" 200
check_http "http://localhost:${SUPERAGENT_PORT}/health" "Superagent" 200

# Supabase REST via Kong (falls Port angepasst)
check_http "http://localhost:${SUPABASE_REST_PORT}/rest/v1/" "Supabase REST via Kong" 200

header "Compose Services (root)"
if [ -f docker-compose.yml ]; then
  docker compose ps || true
fi

header "Compose Services (supabase/docker)"
if [ -f supabase/docker/docker-compose.yml ]; then
  docker compose -f supabase/docker/docker-compose.yml ps || true
fi

header "Hints"
echo "- Falls Ports geschlossen sind: prüfe docker compose up -d und docker logs der jeweiligen Container."
echo "- Prüfe, ob Firewalls/Local Proxies Ports blocken."
echo "- Prüfe .env: KONG_HTTP_PORT, GF_SECURITY_ADMIN_PASSWORD, ELASTIC_PASSWORD, WP_SECRET."

#!/usr/bin/env bash
set -euo pipefail

# Load env
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "==> Starte Supabase Stack (supabase/docker)"
docker compose -f supabase/docker/docker-compose.yml up -d

echo "==> Warte 10s bis Supabase-DB verfügbar ist"
sleep 10

# Optional: einfache DB-Health
if command -v nc >/dev/null 2>&1; then
  echo "==> Prüfe DB-Port ${POSTGRES_PORT:-55436}"
  nc -z localhost "${POSTGRES_PORT:-55436}" || echo "Warnung: Postgres-Port nicht erreichbar (noch im Start?)"
fi

echo "==> Starte Root-Stack (docker-compose.yml)"
docker compose up -d

# Kong-Routen konfigurieren (Dify & Superagent)
echo "==> Konfiguriere Kong-Routen"
# Dify API & Web (neue Services)
curl -sSf -X POST http://localhost:8001/services --data "name=dify-api" --data "url=http://dify-api:5001" >/dev/null 2>&1 || true
curl -sSf -X POST http://localhost:8001/services/dify-api/routes --data "hosts[]=dify-api.local" --data "paths[]=/api" >/dev/null 2>&1 || true
curl -sSf -X POST http://localhost:8001/services --data "name=dify-web" --data "url=http://dify-web:3000" >/dev/null 2>&1 || true
curl -sSf -X POST http://localhost:8001/services/dify-web/routes --data "hosts[]=dify.local" --data "paths[]=/" >/dev/null 2>&1 || true
# Superagent
curl -sSf -X POST http://localhost:8001/services --data "name=superagent" --data "url=http://superagent:8000" >/dev/null 2>&1 || true
curl -sSf -X POST http://localhost:8001/services/superagent/routes --data "hosts[]=superagent.local" --data "paths[]=/" >/dev/null 2>&1 || true

# Optional: Kill Bill Stack starten, falls Compose vorhanden ist
if [ -f killbill-cloud/docker/compose/docker-compose.kb.yml ]; then
  echo "==> Starte Kill Bill Stack (killbill-cloud)"
  docker compose -f killbill-cloud/docker/compose/docker-compose.kb.yml up -d || echo "Hinweis: Kill Bill optional, Fehler werden ignoriert"
fi

# Vault unseal falls nötig
if docker ps --format '{{.Names}}' | grep -q '^vault$'; then
  echo "==> Prüfe Vault-Status"
  if docker exec vault sh -c 'vault status -format=json' >/dev/null 2>&1; then
    SEALED=$(docker exec vault sh -c 'vault status -format=json' | sed -n 's/.*"sealed": \(true\|false\).*/\1/p')
    if [ "$SEALED" = "true" ] && [ -f vault-init.txt ]; then
      UNSEAL_KEY=$(grep 'Unseal Key 1:' vault-init.txt | awk '{print $4}')
      echo "==> Unseal Vault"
      docker exec -e VAULT_ADDR=http://127.0.0.1:8200 vault vault operator unseal "$UNSEAL_KEY" || true
    fi
  fi
fi

# Beispiel: Vault-Secrets setzen (nur wenn VAULT_TOKEN vorhanden ist)
if [ -n "${VAULT_TOKEN:-}" ]; then
  echo "==> Setze Beispiel-Secrets in Vault (namespace: secret/)"
  docker exec -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN="$VAULT_TOKEN" vault sh -c "vault kv put secret/dify SECRET_ENCRYPTION_KEY=$(openssl rand -hex 32)" || true
  docker exec -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN="$VAULT_TOKEN" vault sh -c "vault kv put secret/llm OPENAI_API_KEY=$(openssl rand -base64 32)" || true
fi

# Kong-Routen für Dify konfigurieren
echo "==> Konfiguriere Kong-Routen für Dify"
curl -sSf -X POST http://localhost:8001/services --data "name=dify" --data "url=http://dify:5000"
curl -sSf -X POST http://localhost:8001/services/dify/routes --data "hosts[]=dify.local" --data "paths[]=/"

# Kong-Routen für Superagent konfigurieren
echo "==> Konfiguriere Kong-Routen für Superagent"
curl -sSf -X POST http://localhost:8001/services --data "name=superagent" --data "url=http://superagent:8000"
curl -sSf -X POST http://localhost:8001/services/superagent/routes --data "hosts[]=superagent.local" --data "paths[]=/"

# Health checks
echo "==> Health-Checks"
set +e
curl -sSfL http://localhost:8001/status | jq . >/dev/null 2>&1 && echo "Kong Admin: OK" || echo "Kong Admin: NOK"
curl -sSfL http://localhost:8002/ | head -n 1 >/dev/null 2>&1 && echo "Kong Proxy HTTP: OK" || echo "Kong Proxy HTTP: NOK"
curl -skf https://localhost:8443/ | head -n 1 >/dev/null 2>&1 && echo "Kong Proxy HTTPS: OK" || echo "Kong Proxy HTTPS: NOK"
curl -sSfL http://localhost:9091/-/healthy >/dev/null 2>&1 && echo "Prometheus: OK" || echo "Prometheus: NOK"
curl -sSfL http://localhost:3001/api/health >/dev/null 2>&1 && echo "Grafana: OK" || echo "Grafana: NOK"
curl -sSfL http://localhost:5001/ | head -n 1 >/dev/null 2>&1 && echo "Dify: OK" || echo "Dify: NOK"
# Supabase REST (PostgREST) via Supabase Kong: abhängig von supabase/docker Ports
curl -sSfL http://localhost:${KONG_HTTP_PORT:-8100}/rest/v1/ | head -n 1 >/dev/null 2>&1 && echo "Supabase REST über Kong: OK" || echo "Supabase REST über Kong: NOK"
curl -sSfL http://localhost:8003/health | jq . >/dev/null 2>&1 && echo "Superagent: OK" || echo "Superagent: NOK"

# EFK
curl -sSfL http://localhost:9200/_cluster/health >/dev/null 2>&1 && echo "Elasticsearch: OK" || echo "Elasticsearch: NOK"
curl -sSfL http://localhost:5601/api/status >/dev/null 2>&1 && echo "Kibana: OK" || echo "Kibana: NOK"

# Woodpecker
curl -sSfL http://localhost:8000/ >/dev/null 2>&1 && echo "Woodpecker Server: OK" || echo "Woodpecker Server: NOK"
set -e

# End-to-End-Test (optional, falls JWT_SECRET gesetzt)
if [ -n "${JWT_SECRET:-}" ]; then
  echo "==> Führe End-to-End-Test für AI-Workflow durch"
  curl -sSf -H "Authorization: Bearer ${JWT_SECRET}" http://localhost:8000/ai-workflow | jq . || echo "E2E-Test fehlgeschlagen"
else
  echo "Hinweis: JWT_SECRET nicht gesetzt, überspringe AI-Workflow-Test"
fi

echo "==> Fertig. Öffne:
- Konga UI: http://localhost:1337
- Prometheus: http://localhost:9091
- Grafana: http://localhost:3001 (admin / ${GF_SECURITY_ADMIN_PASSWORD:-<.env>})
- Dify: http://localhost:5001
- Elasticsearch: http://localhost:9200 (nutzt ELASTIC_PASSWORD)
- Kibana: http://localhost:5601
- Woodpecker: http://localhost:8000
- Kill Bill: http://localhost:8180 (API), http://localhost:9090 (KAUI)
- Supabase Studio: http://localhost:3000 (falls gemappt in supabase/docker)
"

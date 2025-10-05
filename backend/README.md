# SigmaCode Backend API (FastAPI)

## Overview

Security-First AI Platform Backend mit FastAPI.

## Features

- ✅ AI Agent Invocation via Dify
- ✅ Firewall Integration (Shadow/Enforce Mode)
- ✅ Request Correlation & Logging
- ✅ Health Checks & Metrics
- ✅ Auto-Deployment zu Render.com

## Lokale Entwicklung

```bash
# Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Dependencies
pip install -r requirements.txt

# Environment
cp .env.example .env
# Fülle .env aus

# Start
uvicorn app:app --reload --port 8000
```

Server läuft auf: http://localhost:8000
Docs: http://localhost:8000/docs

## API Endpoints

### Health & Status

- `GET /` - Basic info
- `GET /health` - Health check
- `GET /status` - System status

### AI Agents

- `POST /api/agents/invoke` - Invoke AI Agent
  ```json
  {
    "agent_id": "test-agent",
    "query": "Hello AI!",
    "inputs": {},
    "response_mode": "streaming"
  }
  ```

### Firewall

- `POST /api/firewall/analyze` - Analyze content

### Metrics

- `GET /api/metrics` - System metrics

## Deployment

### Render.com (Recommended)

1. Pushe Code zu GitHub
2. Verbinde Render mit Repo
3. Nutze `render.yaml` Konfiguration
4. Setze Environment-Variablen
5. Deploy!

### Docker

```bash
docker build -t sigmacode-backend .
docker run -p 8000:8000 --env-file .env sigmacode-backend
```

## Environment Variables

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
DATABASE_URL=postgres://...
DIFY_API_URL=http://localhost:5001
DIFY_API_KEY=optional
SUPERAGENT_URL=http://localhost:8000
SUPERAGENT_API_KEY=optional
FIREWALL_ENABLED=false
FIREWALL_MODE=off
PORT=8000
```

## Testing

```bash
# Health Check
curl http://localhost:8000/health

# Agent Invoke (requires auth)
curl -X POST http://localhost:8000/api/agents/invoke \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test",
    "query": "Hello",
    "inputs": {}
  }'
```

## Production

- URL: https://sigmacode-backend.onrender.com
- Health: https://sigmacode-backend.onrender.com/health
- Docs: https://sigmacode-backend.onrender.com/docs

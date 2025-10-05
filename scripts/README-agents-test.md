# Sigmacode2 Agent-Firewall Test-Skripte

Diese Skripte helfen dir dabei, die Agent-Firewall-Funktionalität zu testen.

## Voraussetzungen

1. **Umgebungsvariablen setzen** (in `.env.local` oder als ENV):

   ```bash
   # Basis-URL für die API
   BASE_URL=http://localhost:3000

   # Backend-URLs
   DIFY_API_URL=http://localhost:5000
   SUPERAGENT_URL=http://localhost:8000

   # Firewall-Konfiguration
   FIREWALL_ENABLED=true
   FIREWALL_MODE=enforce  # oder 'shadow' für Vergleichsmodus

   # Agent-IDs (aus Seed-Daten)
   # Diese sind bereits vorkonfiguriert
   ```

2. **Services starten**:
   - Next.js App: `pnpm dev` (Port 3000)
   - Dify API: via Docker oder lokal
   - Superagent API: via Docker oder lokal

3. **Datenbank seeden**: `pnpm db:seed` (erstellt Demo-User und -Agenten)

## Skript-Übersicht

### Alle Tests auf einmal

```bash
./scripts/test-agents.sh
```

- Startet Firewall-Stream (SSE)
- Testet alle 3 Agent-Typen nacheinander
- Stoppt Stream automatisch

### Firewall-Stream allein

```bash
./scripts/test-firewall-stream.sh
```

- Öffnet SSE-Stream für Firewall-Events
- Läuft kontinuierlich (Ctrl+C zum Stoppen)

### Einzelne Agent-Tests

```bash
./scripts/test-basic-agent.sh      # Dify direkt (Firewall aus)
./scripts/test-secure-agent.sh     # Superagent (Enforce-Modus)
./scripts/test-shadow-agent.sh     # Dify + Superagent parallel
```

## Die 3 Demo-Agenten

### 1. Basic Agent (`demo-agent-dify-basic`)

- **Firewall**: Ausgeschaltet
- **Backend**: Dify direkt
- **Use Case**: Einfache Q&A ohne Sicherheitsprüfungen

### 2. Secure Agent (`demo-agent-superagent-enforce`)

- **Firewall**: Aktiviert (Enforce-Modus)
- **Backend**: Superagent via Firewall
- **Use Case**: Sichere Web-Tool-Nutzung mit strikten Regeln

### 3. Shadow Agent (`demo-agent-shadow-compare`)

- **Firewall**: Aktiviert (Shadow-Modus)
- **Backend**: Dify (live) + Superagent (parallel)
- **Use Case**: Vergleich beider Backends

## Erwartete Events im Firewall-Stream

### ENFORCE-Modus

```
event: hello
data: {"ok":true,"message":"firewall stream started"}

event: firewall
data: {"phase":"pre","requestId":"...","firewall":"strict",...}

event: firewall
data: {"phase":"post","requestId":"...","backend":"superagent","status":200,...}
```

### SHADOW-Modus

```
event: firewall
data: {"phase":"pre","requestId":"...","firewall":"basic",...}

event: firewall
data: {"phase":"post","requestId":"...","backend":"dify","status":200,...}

event: firewall
data: {"phase":"shadow","requestId":"...","backend":"superagent","status":200,...}
```

### Error-Fälle

```
event: error
data: {"error":"poll_failed"}
```

## Troubleshooting

- **Stream hängt**: Keine neuen Events? Starte einen Agent-Test.
- **401/403**: In Dev-Modus kein JWT nötig. In Prod: `Authorization: Bearer <JWT>`
- **Agent nicht gefunden**: Prüfe `agents`-Tabelle: `pnpm db:studio`
- **Backend nicht erreichbar**: Prüfe `DIFY_API_URL` und `SUPERAGENT_URL`

## ENV-Variablen für Tests anpassen

```bash
# Für lokale Tests
export BASE_URL=http://localhost:3000
export FIREWALL_MODE=shadow
export AGENT_ID=demo-agent-shadow-compare

# Für Produktions-Tests
export BASE_URL=https://api.sigmacode.ai
export FIREWALL_MODE=enforce
```

Viel Erfolg beim Testen! 🚀

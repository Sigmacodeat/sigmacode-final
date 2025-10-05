# SIGMACODE AI - Agent-as-a-Service Platform

**Build AI Agents. Stay Secure. One Platform.**

Die einzige Agent-Automation-Plattform mit **integrierter AI-Firewall** für Enterprise-Security.

## 🚀 Kernfeatures

- **🤖 AI-Agents**: Erstellen und verwalten Sie intelligente Workflow-Agents
- **🛡️ AI-Firewall (USP!)**: Ein-/ausschaltbarer Schutz vor Prompt Injection, Data Leaks, etc.
- **⚡ Tool-Integration**: OpenAI, Slack, PostgreSQL, HTTP-APIs und mehr
- **🎨 Visual Builder**: Drag & Drop Workflow-Editor (coming soon)
- **🔒 Enterprise-ready**: RBAC, Audit-Logs, Multi-Tenancy, SOC2-ready
- **💰 Subscription-Modell**: Starter, Pro, Business, Enterprise

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Database**: PostgreSQL 15 + Drizzle ORM
- **Auth**: NextAuth v5 (JWT + OAuth)
- **AI Engine**: Dify (forked & extended)
- **Firewall**: Superagent/Sigmaguard
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **Security**: Vault, Kong API Gateway

## 📋 Voraussetzungen

- Node.js 20+
- PostgreSQL 15+
- pnpm 9+
- Docker & Docker Compose

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Sigmacodeat/sigmacode-ai.git
cd sigmacode-ai
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Editieren Sie .env mit Ihren Credentials
```

**Wichtige ENVs:**

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5555/sigmacode_dev

# Auth
NEXTAUTH_SECRET=<generiere mit: openssl rand -base64 32>
AUTH_SECRET=<generiere mit: openssl rand -base64 32>

# Dify (Workflow-Engine)
DIFY_API_URL=http://localhost:5001
DIFY_API_KEY=<dein-dify-key>

# Firewall (Sigmaguard)
FIREWALL_ENABLED=true
FIREWALL_MODE=enforce
SIGMAGUARD_URL=http://localhost:8003
```

### 3. Start Infrastructure

```bash
# Starte alle Services (PostgreSQL, Redis, Dify, Firewall, etc.)
docker-compose up -d

# Check Status
docker-compose ps
```

### 4. Database Migrations

```bash
pnpm drizzle:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

**Fertig!** App läuft auf: http://localhost:3000

### 6. First Agent erstellen

1. Navigiere zu: http://localhost:3000/de/dashboard
2. Login mit deinem Account
3. Klicke "Neuer Agent"
4. Konfiguriere Firewall (ON/OFF)
5. Führe ersten Workflow aus!

---

## 📚 API-Endpunkte

### Agents

- `GET /api/agents` - Liste alle Agents
- `POST /api/agents` - Erstelle Agent
- `GET /api/agents/[id]` - Agent Details
- `PATCH /api/agents/[id]` - Update Agent
- `DELETE /api/agents/[id]` - Lösche Agent
- `POST /api/agents/[id]/execute` - Führe Workflow aus

### Firewall (USP!)

- `GET /api/firewall/stats` - Statistiken
- `GET /api/firewall/config` - Konfiguration
- `PATCH /api/firewall/config` - Update Config
- `GET /api/firewall/logs` - Audit-Logs
- `POST /api/firewall/analyze` - Input-Check
- `POST /api/firewall/analyze-output` - Output-Check

### Tools

- `GET /api/tools` - Liste aller verfügbaren Tools
- `GET /api/tools?category=llm` - Filter nach Kategorie

## 🛠️ Development

### Verfügbare Skripte

```bash
# Development
pnpm dev              # Start Dev-Server
pnpm build            # Production Build
pnpm start            # Start Production Server

# Code-Qualität
pnpm lint             # ESLint
pnpm type-check       # TypeScript Check
pnpm format           # Prettier Format

# Database
pnpm drizzle:generate # Generate Migrations
pnpm drizzle:migrate  # Run Migrations

# Testing
pnpm test             # Vitest Unit-Tests
pnpm test:coverage    # Coverage Report
pnpm e2e              # Playwright E2E-Tests

# Red-Team Testing (Firewall)
pnpm rt:gen           # Generate Attack Prompts
pnpm rt:run           # Run Red-Team Tests
pnpm rt:score         # Score Results
```

### Code-Standards

- **TypeScript** - Strict Mode
- **ESLint** - Airbnb Config + Prettier
- **Prettier** - Auto-Format on Save
- **Husky** - Pre-commit Hooks
- **Conventional Commits** - Commit-Message Format

## Zeitstempel-Konventionen

- Wir speichern alle Zeiten als UTC mit Zeitzonen-Semantik in PostgreSQL.
- In Drizzle definieren wir Zeitspalten konsistent als:

  ```ts
  import { timestamp } from 'drizzle-orm/pg-core';

  // Beispiel: createdAt / updatedAt
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  ```

- Bedeutung:
  - `withTimezone: true` entspricht `timestamptz`-Semantik (UTC-speichernd, TZ-bewusst).
  - `mode: 'date'` sorgt dafür, dass Drizzle/TS Date-Objekte verwendet.

- Anzeige/Formatierung:
  - Serverseitig speichern/vergößern wir stets in UTC.
  - Für UI-Ausgabe immer zielzonenabhängig formatieren (z. B. mit `Intl.DateTimeFormat`).

- Updates:

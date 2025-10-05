# 🚀 SigmaCode AI SaaS - KOSTENLOSER Stack (Vercel + Neon + Upstash)

## Architektur-Überblick - Einfach & Kostenlos

```
┌─────────────────────────────────────┐
│         Frontend + API              │
│         Vercel (Free)               │
│         → Next.js 14 + API Routes   │
│         → Edge Functions           │
└───────────────▲─────────────────────┘
                │ Database Calls
┌───────────────┴─────────────────────┐
│   Neon (PostgreSQL Free)            │
│   → 512MB Storage + 100h Compute    │
└───────────────▲─────────────────────┘
                │ Caching
┌───────────────┴─────────────────────┐
│   Upstash (Redis Free)              │
│   → 10k Requests/Tag                │
└─────────────────────────────────────┘
```

## ⚡ 5-Minuten Setup (100% kostenlos)

### 1. Vercel einrichten
1. [vercel.com](https://vercel.com) → Import Git Repository  
2. Framework: **Next.js** (erkennt automatisch)
3. Build: `pnpm build`, Install: `pnpm install --frozen-lockfile`

### 2. Neon Database
1. [neon.tech](https://neon.tech) → Neues Projekt
2. Connection String kopieren: `postgresql://user:pass@host/db`

### 3. Upstash Redis  
1. [upstash.com](https://upstash.com) → Redis Database
2. Credentials kopieren: Host, Port, Password

### 4. Environment Variables setzen

In Vercel → Project Settings → Environment Variables:

```
# App Basis
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXTAUTH_URL=https://your-project.vercel.app  
NEXTAUTH_SECRET=generiere-32-zeichen-zufaellig

# Database
DATABASE_URL=postgresql://user:pass@neon-host/db

# Redis
REDIS_HOST=your-redis.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# Kostenlos halten
FIREWALL_ENABLED=false
FIREWALL_MODE=off
```

### 5. Database Migration
```bash
# Lokal testen
cp .env.example .env
# DATABASE_URL in .env setzen
pnpm drizzle:migrate
```

## ✅ Testen

- **Frontend**: `https://your-project.vercel.app`
- **Login**: `/login` 
- **Dashboard**: `/dashboard`
- **API Health**: `/api/health`

## 💰 Kosten-Übersicht

| Service | Kosten | Limits |
|---------|--------|--------|
| **Vercel** | ✅ FREE | 100GB Bandwidth/Monat |
| **Neon** | ✅ FREE | 512MB DB, 100h Compute |
| **Upstash** | ✅ FREE | 10k Requests/Tag |
| **TOTAL** | **€0/Monat** | Voll funktionsfähig |

## 🔄 Automatisches Deploy

Bei jedem Git-Push zu `main` deployt Vercel automatisch!

## 📚 Erweiterte Features später

Wenn du später brauchst:
- **Dify AI**: Render Free für Workflows
- **Superagent Firewall**: Hugging Face Spaces
- **Stripe Billing**: Aktiviere einfach ENV-Vars
- **Monitoring**: Vercel Analytics (kostenlos)

## 🆙 Upgrade bei Bedarf

- **Vercel Pro**: €20/Monat (mehr Bandwidth)
- **Neon Scale**: €19/Monat (größere DB)  
- **Upstash Pro**: €10/Monat (mehr Requests)

## 🚀 Los geht's!

1. Vercel-Projekt erstellen
2. Neon + Upstash einrichten  
3. ENV-Vars setzen
4. Erstes Deploy testen

**Deine kostenlose URL**: `https://sigmacode.vercel.app` 🎉

---

*Einfachere Alternative zur komplexen Multi-Service-Architektur. Alles läuft auf Vercelcommit -m chore: remove unused files - Fly.io backups and killbill-cloud billing system


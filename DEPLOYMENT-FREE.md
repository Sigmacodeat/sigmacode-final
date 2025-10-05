# Free Hosting Leitfaden (Vercel + Neon + Upstash)

Dieser Leitfaden zeigt, wie du die App komplett kostenlos betreibst – ohne Fly.io.

## Übersicht

- Vercel (Free): Next.js Frontend + API-Routen
- Neon ODER Supabase (Free): PostgreSQL
- Upstash (Free): Redis
- Optional/deaktiviert für Free: Dify, Superagent Firewall, Stripe

## 1) Vercel einrichten

1. Repository in Vercel importieren (Framework: Next.js wird automatisch erkannt).
2. Build: `pnpm build`, Install: `pnpm install --frozen-lockfile` (Standard reicht i. d. R.).
3. Node 20, PNPM aktivieren (Vercel → Settings → General/Build).

## 2) ENV Variablen (Vercel → Project Settings → Environment Variables)

- App/NextAuth
  - `NEXT_PUBLIC_APP_URL` = https://<vercel-domain>
  - `NEXTAUTH_URL` = https://<vercel-domain>
  - `NEXTAUTH_SECRET` = <random 32+ chars>
- Datenbank
  - `DATABASE_URL` = (Neon/Supabase Connection string)
- Redis (Upstash)
  - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Optional deaktivieren (kostenlos halten):
  - `FIREWALL_ENABLED` = false
  - `FIREWALL_MODE` = off
  - `DIFY_API_URL`, `DIFY_API_KEY` (leer/nicht setzen)
  - `SUPERAGENT_URL`, `SUPERAGENT_API_KEY` (leer/nicht setzen)
  - Stripe-Keys nur setzen, wenn Billing genutzt wird

Hinweis: `.env.example` ist bereits auf kostenlose Defaults gesetzt.

## 3) Datenbank

- Neon: Neues Projekt → Connection string kopieren → `DATABASE_URL` setzen
- ODER Supabase: Neues Projekt → Project Settings → Connection Info → `DATABASE_URL`

Drizzle Migration laufen lassen (einmalig gegen die Ziel-DB):

```bash
pnpm install
# lokal mit env
cp .env.example .env
# in .env DATABASE_URL auf Neon/Supabase setzen
pnpm drizzle:migrate
```

## 4) Redis (Upstash)

- Upstash Redis erstellen → Credentials abrufen → `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` setzen

## 5) Smoke-Test

- Startseite und Login öffnen
- Kern-APIs testen (z. B. `/api/agents`, `/api/firewall/config`)

## 6) Optional: Dify & Superagent später aktivieren

- `FIREWALL_ENABLED=true`, `FIREWALL_MODE=enforce|shadow`
- `SUPERAGENT_URL`, `SUPERAGENT_API_KEY` setzen
- `DIFY_API_URL`, `DIFY_API_KEY` setzen

Für komplett kostenlosen Betrieb bleiben diese Variablen ungesetzt und das Feature deaktiviert.

# 🚀 SIGMACODE AI - Deployment Guide

## ⚠️ WICHTIG: Environment-Variablen Setup

### Problem gefunden
Der Build schlägt fehl wegen fehlender Secrets:
- `NEXTAUTH_SECRET` (min. 32 Zeichen)
- `AUTH_SECRET` (min. 32 Zeichen)
- `JWT_SECRET` (min. 32 Zeichen)

### ✅ Lösung

#### 1. Secrets generieren und in .env eintragen

```bash
# Automatisch Secrets generieren
./scripts/generate-secrets.sh

# ODER manuell generieren:
openssl rand -hex 32  # Für NEXTAUTH_SECRET
openssl rand -hex 32  # Für AUTH_SECRET
openssl rand -hex 32  # Für JWT_SECRET
```

#### 2. In .env eintragen

Öffne die `.env` Datei und füge hinzu:

```env
NEXTAUTH_SECRET=<generated-secret-1>
AUTH_SECRET=<generated-secret-2>
JWT_SECRET=<generated-secret-3>
```

#### 3. Build erneut testen

```bash
pnpm build
```

---

## 📋 Pre-Deployment Checklist

### 1. Environment-Variablen validieren

Stelle sicher, dass folgende Variablen in `.env` gesetzt sind:

```bash
# Auth Secrets (KRITISCH)
NEXTAUTH_SECRET=          # Min. 32 Zeichen
AUTH_SECRET=              # Min. 32 Zeichen
JWT_SECRET=               # Min. 32 Zeichen
NEXTAUTH_URL=             # z.B. https://sigmacodeai.vercel.app
NEXT_PUBLIC_APP_URL=      # z.B. https://sigmacodeai.vercel.app

# Database (KRITISCH)
DATABASE_URL=             # PostgreSQL Connection String

# Redis (KRITISCH)
REDIS_HOST=               # Redis Host
REDIS_PORT=6379

# Optional - Firewall (kann deaktiviert bleiben)
FIREWALL_ENABLED=false
FIREWALL_MODE=off
```

### 2. Git Status prüfen

```bash
git status
git add .
git commit -m "feat: production-ready deployment mit fixes"
```

### 3. GitHub Push

```bash
git push origin main
```

---

## 🌐 Vercel Deployment

### Option A: Vercel CLI (Empfohlen)

```bash
# Vercel CLI installieren (falls noch nicht)
npm i -g vercel

# Login
vercel login

# Deployment
vercel --prod

# Environment-Variablen setzen
vercel env add NEXTAUTH_SECRET
vercel env add AUTH_SECRET  
vercel env add JWT_SECRET
vercel env add DATABASE_URL
vercel env add REDIS_HOST
# ... weitere Variablen
```

### Option B: Vercel Dashboard

1. Gehe zu [vercel.com](https://vercel.com)
2. **New Project** → GitHub Repository auswählen
3. **Environment Variables** setzen:
   - `NEXTAUTH_SECRET`
   - `AUTH_SECRET`
   - `JWT_SECRET`
   - `DATABASE_URL`
   - `REDIS_HOST`
   - etc.
4. **Deploy** klicken

---

## 🔗 Datenbank-Verbindungen prüfen

### PostgreSQL (Neon)

```bash
# Connection testen
psql "$DATABASE_URL" -c "SELECT NOW();"

# ODER via Node Script
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(res => {
  console.log('✅ Database connected:', res.rows[0]);
  pool.end();
}).catch(err => {
  console.error('❌ Database error:', err);
  pool.end();
});
"
```

### Redis (Upstash)

```bash
# Via redis-cli (falls REDIS_PASSWORD gesetzt)
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD PING

# ODER via Node Script
node -e "
const redis = require('redis');
const client = redis.createClient({
  url: \`redis://\${process.env.REDIS_HOST}:\${process.env.REDIS_PORT}\`
});
client.connect().then(() => {
  return client.ping();
}).then(res => {
  console.log('✅ Redis connected:', res);
  client.quit();
}).catch(err => {
  console.error('❌ Redis error:', err);
  client.quit();
});
"
```

---

## 🚀 Deployment-Schritte

### 1. Lokale Validierung

```bash
# 1. Secrets generieren
./scripts/generate-secrets.sh

# 2. Secrets in .env eintragen (siehe oben)

# 3. Build testen
pnpm build

# 4. Type-Check
pnpm type-check

# 5. Lint (optional)
pnpm lint

# Wenn alles OK:
✅ Ready für Deployment!
```

### 2. Git Commit & Push

```bash
# Änderungen stagen
git add -A

# Commit erstellen
git commit -m "feat: production deployment ready

- Environment variables fixed
- SSL configuration hardened  
- Logger framework prepared
- Security improvements applied
- Documentation complete
"

# Zu GitHub pushen
git push origin main
```

### 3. Vercel Deployment

```bash
# Via CLI
vercel --prod

# Environment-Variablen setzen (interactive)
vercel env add NEXTAUTH_SECRET
vercel env add AUTH_SECRET
vercel env add JWT_SECRET
vercel env add DATABASE_URL
vercel env add REDIS_HOST
vercel env add NEXTAUTH_URL
vercel env add NEXT_PUBLIC_APP_URL

# ODER via Vercel Dashboard
# https://vercel.com/your-team/sigmacode/settings/environment-variables
```

### 4. Post-Deployment Checks

```bash
# 1. Health Check
curl https://your-domain.vercel.app/api/v1/health

# 2. Auth Check
curl https://your-domain.vercel.app/api/auth/session

# 3. Homepage
open https://your-domain.vercel.app
```

---

## 🔧 Vercel Configuration

### vercel.json (Optional)

Erstelle `vercel.json` für erweiterte Konfiguration:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app-url"
  },
  "build": {
    "env": {
      "NEXTAUTH_SECRET": "@nextauth-secret",
      "DATABASE_URL": "@database-url",
      "REDIS_HOST": "@redis-host"
    }
  }
}
```

---

## 🗃️ Database Migrations

Vor dem ersten Deployment:

```bash
# 1. Migrations generieren (falls nötig)
pnpm drizzle:generate

# 2. Migrations ausführen
pnpm drizzle:migrate

# ODER direkt via Script
tsx scripts/migrate.ts
```

---

## 📊 Monitoring Setup

### Nach Deployment aktivieren:

1. **Vercel Analytics**
   - Automatisch aktiviert in Vercel Dashboard

2. **Sentry** (Error Tracking)
   - Bereits integriert
   - Sentry DSN in Environment setzen

3. **Custom Monitoring**
   - Logs: Vercel Dashboard → Logs
   - Performance: Vercel Analytics
   - Errors: Sentry Dashboard

---

## 🔐 Environment-Variablen für Vercel

### Minimal Required:

```env
# Auth (KRITISCH)
NEXTAUTH_SECRET=<64-char-hex>
AUTH_SECRET=<64-char-hex>
JWT_SECRET=<64-char-hex>
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Redis
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
```

### Optional (kann später hinzugefügt werden):

```env
# Firewall (optional)
FIREWALL_ENABLED=false
FIREWALL_MODE=off
SUPERAGENT_URL=
SUPERAGENT_API_KEY=

# Stripe (falls Billing aktiv)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email (Resend)
RESEND_API_KEY=
```

---

## 🐛 Troubleshooting

### Build schlägt fehl

**Problem:** Environment-Variablen fehlen

**Lösung:**
```bash
./scripts/generate-secrets.sh
# Secrets in .env eintragen
pnpm build
```

### Database Connection Error

**Problem:** DATABASE_URL falsch oder Netzwerk-Problem

**Lösung:**
```bash
# Testen
psql "$DATABASE_URL" -c "SELECT 1"

# SSL-Mode prüfen
# Muss meist '?sslmode=require' enthalten
```

### Redis Connection Error

**Problem:** Redis nicht erreichbar

**Lösung:**
```bash
# Host/Port prüfen
echo $REDIS_HOST
echo $REDIS_PORT

# Connection testen
redis-cli -h $REDIS_HOST -p $REDIS_PORT PING
```

### NextAuth Session Error

**Problem:** NEXTAUTH_URL stimmt nicht mit Deployment-URL überein

**Lösung:**
```bash
# In Vercel Environment setzen:
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

---

## ✅ Success Checklist

Nach erfolgreichem Deployment:

- [ ] Homepage lädt ohne Fehler
- [ ] `/api/v1/health` returns 200
- [ ] `/api/auth/session` funktioniert
- [ ] Login/Logout funktioniert
- [ ] Database-Verbindung aktiv
- [ ] Redis-Verbindung aktiv
- [ ] Logs sehen sauber aus
- [ ] Keine 500-Errors in Vercel Dashboard
- [ ] Analytics funktioniert
- [ ] Monitoring aktiv

---

## 🎉 Nächste Schritte nach Deployment

1. **Monitoring prüfen** (erste 24h)
2. **Performance baseline** erfassen
3. **User-Testing** durchführen
4. **Logger-Migration** fortsetzen (siehe DEPLOYMENT-FIXES.md)
5. **Weitere Features** entwickeln

---

## 📚 Weiterführende Docs

- [CODE-AUDIT-REPORT.md](./CODE-AUDIT-REPORT.md)
- [DEPLOYMENT-FIXES.md](./DEPLOYMENT-FIXES.md)
- [FINAL-CLEANUP-SUMMARY.md](./FINAL-CLEANUP-SUMMARY.md)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Status:** 🔴 **Action Required - Secrets generieren!**  
**Nächster Schritt:** Environment-Variablen setzen, dann Build + Deploy  
**ETA bis Live:** ~15 Minuten nach Secret-Setup

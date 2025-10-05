# 🚀 SIGMACODE AI - Quick Start Guide

**Schnelleinstieg für Entwicklung und Testing**

---

## 📋 **Voraussetzungen**

```bash
# Node.js & pnpm
node --version  # >= 18.x
pnpm --version  # >= 8.x

# PostgreSQL
psql --version  # >= 14.x
```

---

## ⚡ **1. Projekt Setup**

```bash
# Dependencies installieren
pnpm install

# Umgebungsvariablen kopieren
cp .env.example .env

# Datenbank-Migrationen ausführen
pnpm db:push
```

---

## 🔐 **2. Test-Benutzer erstellen**

### **Option A: Seed-Script (empfohlen)**

```bash
# Development-Server starten
pnpm dev

# In neuem Terminal: Test-User erstellen
curl -X POST http://localhost:3000/api/dev/seed-users
```

**Erstellt:**

- `admin@sigmacode.ai` / `password123` (Admin)
- `user@sigmacode.ai` / `password123` (User)

### **Option B: Manuell über UI**

1. Öffne http://localhost:3000/de/register
2. Registriere einen neuen Account
3. Login unter http://localhost:3000/de/login

---

## 🎯 **3. Login & Dashboard**

### **Login-Flow**

```
1. Öffne: http://localhost:3000/de/login
2. Eingabe: admin@sigmacode.ai / password123
3. Redirect: http://localhost:3000/de/dashboard
```

### **OAuth-Login (optional)**

**Google:**

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**GitHub:**

```env
GITHUB_ID=your-client-id
GITHUB_SECRET=your-client-secret
```

---

## 🛠️ **4. Development-Workflow**

### **Server starten**

```bash
# Development mit Hot-Reload
pnpm dev

# Production-Build
pnpm build
pnpm start
```

### **Datenbank-Management**

```bash
# Schema-Änderungen pushen
pnpm db:push

# Drizzle Studio öffnen (DB-GUI)
pnpm db:studio
```

### **Testing**

```bash
# Unit Tests
pnpm test

# E2E Tests
pnpm test:e2e

# Type-Check
pnpm type-check
```

---

## 📊 **5. Dashboard-Bereiche**

Nach dem Login stehen folgende Bereiche zur Verfügung:

### **Öffentliche Bereiche** (alle User)

- `/de/dashboard` - Übersicht
- `/de/dashboard/chat` - AI-Chat
- `/de/dashboard/agents` - Agent-Verwaltung
- `/de/dashboard/firewall` - Firewall-Dashboard
- `/de/dashboard/workflows` - Workflow-Editor

### **Admin-Bereiche** (nur Admin-Role)

- `/de/dashboard/settings` - System-Einstellungen
- `/de/dashboard/models` - Modell-Verwaltung
- `/de/dashboard/tools` - Tool-Management
- `/de/dashboard/knowledge` - Knowledge-Base

---

## 🔑 **6. API-Zugriff**

### **Session-basiert (Browser)**

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session } = useSession();

  if (session) {
    console.log('Logged in as:', session.user.email);
  }
}
```

### **API-Key-basiert (externe Clients)**

```bash
# API-Key erstellen (im Dashboard unter Settings)
curl -X POST http://localhost:3000/api/api-keys \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{"name": "My API Key"}'

# API-Key verwenden
curl http://localhost:3000/api/agents \
  -H "Authorization: Bearer $API_KEY"
```

---

## 🧪 **7. Testing & Debugging**

### **Health-Check**

```bash
curl http://localhost:3000/api/health
# Expected: {"ok": true, "status": "healthy"}
```

### **Auth-Status prüfen**

```bash
# Session abrufen (mit Browser-Cookie)
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=$TOKEN"
```

### **Firewall testen**

```bash
curl -X POST http://localhost:3000/api/firewall/analyze \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is my password?",
    "mode": "shadow"
  }'
```

---

## 🐛 **8. Troubleshooting**

### **Login funktioniert nicht**

```bash
# 1. Prüfe Datenbank-Verbindung
psql $DATABASE_URL -c "SELECT 1"

# 2. Prüfe ob User existiert
psql $DATABASE_URL -c "SELECT email, role FROM users"

# 3. Prüfe NEXTAUTH_SECRET
echo $NEXTAUTH_SECRET
# Sollte gesetzt sein!
```

### **Redirect-Loop**

```bash
# Prüfe Middleware-Konfiguration
cat middleware.ts | grep PROTECTED_PREFIXES

# Prüfe Auth-Config
cat lib/auth-config.ts | grep "pages:"
```

### **OAuth funktioniert nicht**

```bash
# Prüfe OAuth-Credentials
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Prüfe Callback-URL in OAuth-Provider
# Sollte sein: http://localhost:3000/api/auth/callback/google
```

---

## 📚 **9. Wichtige Dateien**

```
/lib/auth.ts                    # Auth-Manager & Utilities
/lib/auth-config.ts             # NextAuth-Konfiguration
/middleware.ts                  # Route-Protection
/app/api/auth/[...nextauth]/    # NextAuth-Handler
/app/[locale]/(auth)/login/     # Login-Seite
/app/[locale]/dashboard/        # Dashboard-Bereich
```

---

## 🎓 **10. Nächste Schritte**

1. **Firewall konfigurieren**
   - Öffne `/de/dashboard/firewall`
   - Erstelle erste Policy
   - Teste mit Demo-Prompts

2. **Agent erstellen**
   - Öffne `/de/dashboard/agents`
   - Erstelle neuen Agent
   - Verbinde mit Firewall

3. **Workflow bauen**
   - Öffne `/de/dashboard/workflows`
   - Nutze Dify-Integration
   - Teste End-to-End

---

## 📖 **Weitere Dokumentation**

- **Auth-System:** `AUTH-SYSTEM-AUDIT.md`
- **API-Routen:** `API-ROUTES-OVERVIEW.md`
- **Architektur:** `ARCHITECTURE.md`
- **Deployment:** `DEPLOY-README.md`

---

## 💡 **Tipps**

### **Development-Modus**

```bash
# Automatisches Seeding bei jedem Start
echo "pnpm db:seed" >> .husky/post-checkout

# Hot-Reload für API-Routen
# Änderungen in /app/api/* werden automatisch neu geladen
```

### **Debugging**

```typescript
// In API-Routen
console.log('[DEBUG]', { user, request, data });

// In Components
import { useSession } from 'next-auth/react';
const { data, status } = useSession();
console.log('Session:', { data, status });
```

### **Performance**

```bash
# Bundle-Analyse
pnpm build
pnpm analyze

# Lighthouse-Score
pnpm lighthouse
```

---

## ✅ **Checkliste für Production**

- [ ] `NEXTAUTH_SECRET` generiert und gesetzt
- [ ] OAuth-Credentials konfiguriert
- [ ] Database-Backups eingerichtet
- [ ] SSL/TLS aktiviert (HTTPS)
- [ ] Rate-Limiting konfiguriert
- [ ] Monitoring aktiviert (Sentry, Plausible)
- [ ] E-Mail-Versand konfiguriert
- [ ] Stripe-Webhooks verifiziert
- [ ] Security-Headers geprüft
- [ ] GDPR-Compliance sichergestellt

---

**Viel Erfolg! 🚀**

Bei Fragen: inbox@sigmacode.ai

# 🔐 LOGIN TEST-ANLEITUNG

## Schritt 1: Test-User erstellen

```bash
curl -X POST http://localhost:3000/api/dev/seed-users
```

**Erwartete Ausgabe:**

```json
{
  "ok": true,
  "users": [
    { "email": "admin@sigmacode.ai", "action": "created" },
    { "email": "user@sigmacode.ai", "action": "created" }
  ]
}
```

## Schritt 2: Login testen

### Option A: Browser

```
URL: http://localhost:3000/de/login
E-Mail: admin@sigmacode.ai
Passwort: password123
```

### Option B: API (curl)

```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sigmacode.ai",
    "password": "password123",
    "callbackUrl": "/de/dashboard"
  }'
```

## Verfügbare Test-Accounts

1. **Admin:**
   - E-Mail: `admin@sigmacode.ai`
   - Passwort: `password123`
   - Rolle: admin

2. **User:**
   - E-Mail: `user@sigmacode.ai`
   - Passwort: `password123`
   - Rolle: user

## Troubleshooting

### Server läuft nicht

```bash
pnpm dev
```

### Datenbank-Verbindung fehlt

Prüfe `.env`:

```bash
cat .env | grep DATABASE_URL
```

### NEXTAUTH_SECRET fehlt

```bash
# Generiere ein Secret
openssl rand -base64 32

# Füge in .env ein
echo "NEXTAUTH_SECRET=<generated-secret>" >> .env
```

### User existiert nicht

```bash
# Seed-Script erneut ausführen
curl -X POST http://localhost:3000/api/dev/seed-users
```

## Vollständiger Test-Flow

```bash
# 1. Server starten
pnpm dev

# 2. In neuem Terminal: Test-User erstellen
curl -X POST http://localhost:3000/api/dev/seed-users

# 3. Browser öffnen
open http://localhost:3000/de/login

# 4. Einloggen mit:
# E-Mail: admin@sigmacode.ai
# Passwort: password123

# 5. Erwartung: Redirect zu http://localhost:3000/de/dashboard
```

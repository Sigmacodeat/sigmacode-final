#!/bin/bash
set -e

echo "🔧 Setze ENV-Variablen für sigmacode-final auf Vercel..."

# Basis-URLs
VERCEL_URL="https://sigmacode-final.vercel.app"
echo "$VERCEL_URL" | vercel env add NEXT_PUBLIC_APP_URL production
echo "$VERCEL_URL" | vercel env add NEXTAUTH_URL production

# Auth Secret
echo "cPRBmHa7Z0bk2bCG77x+Cpg/rpDdflcBHu52BugF8Ws=" | vercel env add NEXTAUTH_SECRET production

# Datenbank (Neon)
echo "postgresql://neondb_owner:npg_gzcjOVK7rfv2@ep-little-truth-a2pfmykw-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require" | vercel env add DATABASE_URL production

# Redis (Upstash) - korrigierte Werte
echo "viable-piranha-19249.upstash.io" | vercel env add REDIS_HOST production
echo "6379" | vercel env add REDIS_PORT production
echo "AUsxAAIncDI4ZTRjOWI2M2ExZjY0ZmI3Yjg0N2E4NTEzMjUyZjVjN3AyMTkyNDk=" | vercel env add REDIS_PASSWORD production

# Firewall (kostenloser Modus)
echo "false" | vercel env add FIREWALL_ENABLED production
echo "off" | vercel env add FIREWALL_MODE production

# Web Push VAPID Keys
echo "BBMAI7W1RbbvqfA7ZItc23HYGCCwQgxwd3WuVouA-KiQv2oZT8rekZTpLif8O6qrgGizMFYz7bW65nBKAi06Un0" | vercel env add WEB_PUSH_PUBLIC_KEY production
echo "HcyW70YP0RqMjIRrgjOoigGbGenCyhTDSroKcAQT-F8" | vercel env add WEB_PUSH_PRIVATE_KEY production
echo "mailto:inbox@sigmacode.ai" | vercel env add WEB_PUSH_CONTACT_EMAIL production

echo "✅ Alle ENV-Variablen gesetzt!"

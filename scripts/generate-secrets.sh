#!/bin/bash

# SIGMACODE AI - Generate Missing Secrets
# Generiert fehlende Environment-Secrets für Deployment

set -e

echo "🔐 Generating missing secrets..."

# Funktion zum Generieren sicherer Secrets
generate_secret() {
  openssl rand -hex 32
}

# Check ob .env existiert
if [ ! -f .env ]; then
  echo "⚠️  .env nicht gefunden - erstelle aus .env.example..."
  cp .env.example .env
fi

# Generiere fehlende Secrets
echo ""
echo "📝 Folgende Secrets müssen in .env gesetzt werden:"
echo ""
echo "NEXTAUTH_SECRET=$(generate_secret)"
echo "AUTH_SECRET=$(generate_secret)"  
echo "JWT_SECRET=$(generate_secret)"
echo ""
echo "⚠️  Kopiere diese Werte in deine .env Datei!"
echo ""
echo "Oder führe aus:"
echo "echo 'NEXTAUTH_SECRET=$(generate_secret)' >> .env"
echo "echo 'AUTH_SECRET=$(generate_secret)' >> .env"
echo "echo 'JWT_SECRET=$(generate_secret)' >> .env"

# Deploy Strategy

Dieses Projekt verwendet Docker Compose mit Kong API Gateway für das Deployment.

## Warum Docker Compose?

- **Kong API Gateway**: Bietet erweiterte API-Management-Features
- **Let's Encrypt SSL**: Automatische TLS-Zertifikate
- **Skalierbarkeit**: Einfache horizontale Skalierung
- **Entwicklung**: Konsistente Umgebung für Dev/Prod

## Setup:

1. Installieren Sie Docker und Docker Compose
2. Kopieren Sie .env.example nach .env.local
3. Konfigurieren Sie die Umgebungsvariablen
4. Starten Sie mit: docker-compose up -d

## Services:

- **kong**: API Gateway und Load Balancer
- **app**: Next.js Anwendung
- **postgres**: Datenbank
- **redis**: Cache und Session Store

## Monitoring:

- Kong Admin API: http://localhost:8001
- App Health Check: http://localhost:3000/api/health

## Backup:

Alternative Deploy-Konfigurationen (Netlify, Fly.io) sind in .deploy-backup/ gespeichert.

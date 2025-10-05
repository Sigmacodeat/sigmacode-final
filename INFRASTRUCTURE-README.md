# SIGMACODE AI - Infrastructure Management Scripts

Eine vollständige Suite von Scripts zur Verwaltung der SIGMACODE AI Infrastruktur mit Docker.

## 📋 Übersicht

Diese Scripts bieten eine robuste und automatisierte Lösung für:

- ✅ **Vollständiges System-Setup** mit allen Services
- ✅ **Health-Checks** und kontinuierliche Überwachung
- ✅ **Automatisches Starten/Stoppen** aller Services
- ✅ **Status-Überwachung** und Ressourcen-Management
- ✅ **Produktionsreife Konfiguration**

## 🚀 Schnellstart

### Erstes Setup

```bash
# 1. Umgebungsvariablen konfigurieren
cp .env.example .env
# Bearbeite .env mit deinen Werten

# 2. Alle Services starten
./start.sh

# 3. Status prüfen
./status.sh

# 4. Health-Check durchführen
./health-check.sh
```

### Täglicher Betrieb

```bash
# Status prüfen
./status.sh --quick

# Services stoppen
./stop.sh

# Alles neu starten
./start.sh

# Kontinuierliche Überwachung
./health-check.sh --monitor --interval 60
```

## 📁 Scripts Übersicht

### `start.sh` - System Start

**Vollständiges System-Setup und Start aller Services**

```bash
./start.sh              # Normaler Start
./start.sh --help       # Hilfe anzeigen
```

**Features:**

- ✅ Automatische Abhängigkeits-Auflösung
- ✅ Health-Checks vor dem Start
- ✅ Konfigurations-Validierung
- ✅ Verzeichnis-Erstellung
- ✅ Robuste Fehlerbehandlung

### `stop.sh` - System Stop

**Sauberes Herunterfahren aller Services**

```bash
./stop.sh               # Normales Stoppen
./stop.sh --clean       # Mit Docker-Cleanup
./stop.sh --force       # Erzwungenes Stoppen
./stop.sh --clean-volumes  # Alles entfernen (VORSICHT!)
```

**Features:**

- ✅ Graceful Shutdown
- ✅ Ressourcen-Bereinigung
- ✅ Force-Option für Notfälle
- ✅ Volume-Management

### `status.sh` - System Status

**Umfassende Status-Übersicht**

```bash
./status.sh             # Vollständiger Status
./status.sh --quick     # Schnelle Übersicht
./status.sh --verbose   # Detaillierte Infos
./status.sh --access    # Nur Zugriffsinfos
```

**Features:**

- ✅ Docker-Status
- ✅ Container-Übersicht
- ✅ Netzwerk-Status
- ✅ Volume-Informationen
- ✅ Service-Zugriffspunkte

### `health-check.sh` - Health Monitoring

**Kontinuierliche System-Überwachung**

```bash
./health-check.sh       # Einmaliger Check
./health-check.sh --monitor  # Kontinuierliche Überwachung
./health-check.sh --monitor --interval 30  # Alle 30 Sekunden
```

**Features:**

- ✅ Automatische Service-Checks
- ✅ Konfigurierbare Intervalle
- ✅ Unhealthy-Thresholds
- ✅ Detaillierte Status-Berichte

## 🔧 Konfiguration

### Umgebungsvariablen (`.env`)

Alle wichtigen Konfigurationen erfolgen über die `.env` Datei:

```bash
# Datenbank
POSTGRES_PASSWORD=dein_sicheres_passwort
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=dein_redis_passwort

# Vault (Secrets)
VAULT_ROOT_TOKEN=dein_vault_token

# Dify AI Platform
DIFY_SECRET_KEY=dein_dify_secret
DIFY_API_KEY=dein_dify_api_key

# Sicherheit
SUPERAGENT_API_KEY=dein_superagent_key

# Monitoring
GRAFANA_PASSWORD=dein_grafana_passwort
```

### Standard-Ports

| Service          | Port | Beschreibung       |
| ---------------- | ---- | ------------------ |
| PostgreSQL       | 5432 | Hauptdatenbank     |
| Redis            | 6379 | Cache & Sessions   |
| Vault            | 8200 | Secrets Management |
| Dify API         | 5001 | AI Workflow Engine |
| Dify Web         | 3000 | Dify Web-Interface |
| SIGMAGUARD       | 8080 | AI Firewall        |
| Kong API Gateway | 8000 | API Gateway        |
| Kong Admin       | 8001 | Gateway Verwaltung |
| Konga            | 1337 | Gateway UI         |
| Prometheus       | 9090 | Monitoring         |
| Grafana          | 3000 | Dashboards         |
| Elasticsearch    | 9200 | Log Storage        |
| Kibana           | 5601 | Log Visualisierung |

## 🔍 Services Übersicht

### Core Infrastructure

- **PostgreSQL** - Hauptdatenbank für alle Anwendungen
- **Redis** - Cache, Sessions und Message Queue
- **HashiCorp Vault** - Sicheres Secrets Management

### AI & Workflow Engine

- **Dify** - Vollständige AI Workflow Platform
  - API Server für Backend-Operationen
  - Worker für Background-Tasks
  - Web-Interface für Management
- **Superagent (SIGMAGUARD)** - AI Security Firewall

### API Gateway & Load Balancing

- **Kong** - Hochleistungs API Gateway
  - Traffic Management
  - Security Policies
  - Rate Limiting
- **Konga** - Kong Verwaltungs-Interface

### Monitoring & Observability

- **Prometheus** - Metrics Collection
- **Grafana** - Dashboard & Visualization
- **AlertManager** - Alert Management
- **Node Exporter** - System Metrics
- **cAdvisor** - Container Metrics

### Logging & Search

- **Elasticsearch** - Log Storage & Search
- **Kibana** - Log Visualization
- **FluentD** - Log Collection & Forwarding

### CI/CD & Automation

- **Woodpecker CI** - Git-basierte CI/CD Pipeline

## 🛠️ Troubleshooting

### Häufige Probleme

**Problem:** Services starten nicht

```bash
# Logs prüfen
docker-compose logs [service-name]

# Status prüfen
./status.sh --verbose

# Services neu starten
./stop.sh && ./start.sh
```

**Problem:** Datenbank-Verbindungsfehler

```bash
# Datenbank-Health prüfen
./health-check.sh

# Datenbank-Logs
docker-compose logs app-db
```

**Problem:** Hohe Ressourcen-Nutzung

```bash
# Ressourcen-Übersicht
./status.sh --verbose

# Container-Stats
docker stats
```

### Notfall-Recovery

**Vollständiges System zurücksetzen:**

```bash
# WARNUNG: Löscht alle Daten!
./stop.sh --clean-volumes

# Neu starten
./start.sh
```

**Einzelnen Service neu starten:**

```bash
docker-compose restart [service-name]
```

## 📊 Monitoring & Alerts

### Grafana Dashboards

- **System Overview** - CPU, Memory, Disk Usage
- **Service Health** - Alle Service-Status
- **Database Metrics** - PostgreSQL Performance
- **API Metrics** - Request/Response Zeiten

### Health Check Endpoints

- `/health` - Basis-Health für alle Services
- `/metrics` - Prometheus Metrics
- `/-/ready` - Kubernetes-Ready Probes

## 🔒 Sicherheit

### Best Practices

1. **Ändere alle Standard-Passwörter**
2. **Verwende starke, einzigartige Passwörter**
3. **Aktiviere TLS für Produktionsumgebungen**
4. **Überwache regelmäßig die Logs**
5. **Halte Container-Images aktuell**

### Secrets Management

- **Vault** für sensitive Daten
- **Keine Secrets** in `.env` für Produktion
- **API Keys** über Vault distribuieren

## 🚀 Produktions-Deployment

### Empfohlene Änderungen für Produktion:

1. **Secrets Management**

   ```bash
   # Entferne Secrets aus .env
   # Verwende externe Secrets (Vault, K8s Secrets, etc.)
   ```

2. **TLS/SSL**

   ```bash
   # Aktiviere HTTPS für alle Services
   # Verwende echte Zertifikate (Let's Encrypt)
   ```

3. **Monitoring**

   ```bash
   # Aktiviere detaillierte Metrics
   # Konfiguriere AlertManager Rules
   ```

4. **Backups**
   ```bash
   # PostgreSQL Backups konfigurieren
   # Elasticsearch Snapshots aktivieren
   ```

## 📞 Support

Bei Problemen oder Fragen:

1. **Logs prüfen**: `./status.sh --verbose`
2. **Health-Check**: `./health-check.sh --monitor`
3. **Dokumentation**: Siehe `/docs` Verzeichnis
4. **Community**: GitHub Issues für Bug-Reports

---

**Entwickelt für SIGMACODE AI** - Eine robuste, skalierbare und produktionsreife Infrastruktur.

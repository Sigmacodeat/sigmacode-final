#!/bin/bash

# =============================================================================
# SIGMACODE AI - Complete Infrastructure Start Script
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/.env"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    print_success "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker Compose is available"
}

# Function to load environment variables
load_env() {
    if [[ -f "$ENV_FILE" ]]; then
        print_status "Loading environment variables from $ENV_FILE"
        source "$ENV_FILE"
    else
        print_warning "Environment file $ENV_FILE not found. Using default values."
        create_default_env
    fi
}

# Function to create default .env file if it doesn't exist
create_default_env() {
    print_status "Creating default .env file..."

    cat > "$ENV_FILE" << 'EOF'
# =============================================================================
# SIGMACODE AI - Environment Configuration
# =============================================================================

# Database Configuration
POSTGRES_PASSWORD=postgres
POSTGRES_USER=postgres
POSTGRES_DB=sigmacode_dev
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PASSWORD=redis_password
REDIS_PORT=6379

# HashiCorp Vault Configuration
VAULT_ROOT_TOKEN=hvs_dev_root_token
VAULT_PORT=8200

# Dify Configuration
DIFY_SECRET_KEY=dify_secret_key_change_in_production
DIFY_API_KEY=dify_api_key_change_in_production
DIFY_API_PORT=5001
FIREWALL_ENABLED=true
FIREWALL_MODE=shadow

# Superagent (SIGMAGUARD) Configuration
SUPERAGENT_API_KEY=sigmaguard_api_key_change_in_production
SUPERAGENT_PORT=8080

# Supabase Configuration (Optional)
SUPABASE_PASSWORD=supabase_password
SUPABASE_JWT_SECRET=supabase_jwt_secret
SUPABASE_URL=http://localhost:3000
SUPABASE_DB_PORT=5433
SUPABASE_REST_PORT=3001
SUPABASE_AUTH_PORT=9999

# Kong API Gateway Configuration
KONG_PROXY_PORT=8000
KONG_ADMIN_PORT=8001
KONG_SSL_PORT=8443
DOMAIN=sigmacode.ai

# Monitoring Configuration
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
GRAFANA_USER=admin
GRAFANA_PASSWORD=grafana_password
ALERTMANAGER_PORT=9093
NODE_EXPORTER_PORT=9100
CADVISOR_PORT=8080

# Logging Configuration
ELASTICSEARCH_PORT=9200
KIBANA_PORT=5601
FLUENTD_PORT=24224
FLUENTD_UDP_PORT=24224
ELASTIC_PASSWORD=elastic_password

# CI/CD Configuration
WOODPECKER_SERVER_PORT=8000
WOODPECKER_ADMIN_USER=admin
WOODPECKER_AGENT_SECRET=woodpecker_secret

# Konga Configuration
KONGA_PORT=1337

# TLS & Certificates Configuration
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CERTBOT_EMAIL=admin@sigmacode.ai

# =============================================================================
# IMPORTANT SECURITY NOTES:
# =============================================================================
# 1. Change all default passwords and secrets before production use
# 2. Use strong, unique passwords for all services
# 3. Store sensitive data in HashiCorp Vault for production
# 4. Never commit secrets to version control
# =============================================================================
EOF

    print_success "Default .env file created. Please edit it with your actual values."
}

# Function to validate required environment variables
validate_env() {
    print_status "Validating environment configuration..."

    local required_vars=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "DIFY_SECRET_KEY"
        "SUPERAGENT_API_KEY"
    )

    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_warning "Missing required environment variables: ${missing_vars[*]}"
        print_warning "Using default values. Please update .env file for production."
    fi

    print_success "Environment validation completed"
}

# Function to create required directories
create_directories() {
    print_status "Creating required directories..."

    local required_dirs=(
        "$PROJECT_ROOT/database/init-scripts"
        "$PROJECT_ROOT/monitoring/prometheus"
        "$PROJECT_ROOT/monitoring/grafana/provisioning/datasources"
        "$PROJECT_ROOT/monitoring/grafana/provisioning/dashboards"
        "$PROJECT_ROOT/monitoring/alertmanager"
        "$PROJECT_ROOT/monitoring/blackbox"
        "$PROJECT_ROOT/vault/config"
        "$PROJECT_ROOT/certs"
        "$PROJECT_ROOT/certbot/data"
        "$PROJECT_ROOT/kong"
        "$PROJECT_ROOT/fluentd"
    )

    for dir in "${required_dirs[@]}"; do
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    done

    print_success "All required directories created"
}

# Function to create default configuration files
create_config_files() {
    print_status "Creating default configuration files..."

    # Vault configuration
    if [[ ! -f "$PROJECT_ROOT/vault/config/local.json" ]]; then
        cat > "$PROJECT_ROOT/vault/config/local.json" << 'EOF'
{
  "listener": [
    {
      "tcp": {
        "address": "0.0.0.0:8200",
        "tls_disable": 1
      }
    }
  ],
  "storage": {
    "file": {
      "path": "/vault/file"
    }
  },
  "ui": true,
  "api_addr": "http://127.0.0.1:8200",
  "cluster_addr": "http://127.0.0.1:8201"
}
EOF
        print_status "Created Vault configuration"
    fi

    # Prometheus configuration
    if [[ ! -f "$PROJECT_ROOT/monitoring/prometheus/prometheus.yml" ]]; then
        cat > "$PROJECT_ROOT/monitoring/prometheus/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'kong'
    static_configs:
      - targets: ['kong:8001']

  - job_name: 'dify-api'
    static_configs:
      - targets: ['dify-api:5001']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF
        print_status "Created Prometheus configuration"
    fi

    # FluentD configuration
    if [[ ! -f "$PROJECT_ROOT/fluentd/fluent.conf" ]]; then
        cat > "$PROJECT_ROOT/fluentd/fluent.conf" << 'EOF'
<source>
  @type forward
  @id forward_input
  @label @mainstream
</source>

<source>
  @type http
  @id http_input
  port 24224
  @label @mainstream
</source>

<source>
  @type tail
  @id tail_docker
  path /var/lib/docker/containers/*/*.log
  pos_file /var/log/fluentd-containers.log.pos
  tag docker.*
  read_from_head true
  @label @mainstream
</source>

<label @mainstream>
  <filter docker.**>
    @type record_transformer
    add_prefix container_name
    <record>
      container_name ${record["container_name"]}
    </record>
  </filter>

  <match docker.**>
    @type elasticsearch
    @id elasticsearch
    host elasticsearch
    port 9200
    user elastic
    password ${ELASTIC_PASSWORD}
    index_name fluentd-${tag}
    type_name fluentd
  </match>
</label>
EOF
        print_status "Created FluentD configuration"
    fi

    print_success "Default configuration files created"
}

# Function to stop all existing containers
stop_existing() {
    print_status "Stopping existing containers..."

    cd "$PROJECT_ROOT"

    # Stop all containers for this project
    if docker ps -q --filter "network=sigmacode-network" | grep -q .; then
        print_status "Stopping existing sigmacode containers..."
        docker-compose down --remove-orphans || true
    fi

    print_success "Existing containers stopped"
}

# Function to start all services
start_services() {
    print_status "Starting all services..."

    cd "$PROJECT_ROOT"

    # Start services in dependency order
    print_status "Starting core infrastructure services..."
    docker-compose up -d app-db redis vault

    # Wait for core services to be healthy
    print_status "Waiting for core services to be ready..."
    sleep 30

    # Start remaining services
    print_status "Starting application services..."
    docker-compose up -d dify-api dify-worker dify-web sigmaguard

    print_status "Starting API gateway..."
    docker-compose up -d kong konga

    print_status "Starting monitoring services..."
    docker-compose up -d prometheus grafana alertmanager node-exporter cadvisor

    print_status "Starting logging services..."
    docker-compose up -d elasticsearch kibana fluentd

    print_status "Starting CI/CD services..."
    docker-compose up -d woodpecker-server woodpecker-agent

    print_status "Starting TLS services..."
    docker-compose up -d certbot

    print_success "All services started"
}

# Function to wait for services to be healthy
wait_for_healthy() {
    print_status "Waiting for services to become healthy..."

    local services=(
        "app-db:5432"
        "redis:6379"
        "vault:8200"
        "dify-api:5001"
        "kong:8001"
        "prometheus:9090"
        "grafana:3000"
        "elasticsearch:9200"
    )

    for service in "${services[@]}"; do
        IFS=':' read -r service_name port <<< "$service"

        print_status "Waiting for $service_name to be healthy..."

        # Wait up to 5 minutes for service to be healthy
        local attempts=0
        while [[ $attempts -lt 60 ]]; do
            if curl -f "http://localhost:$port" >/dev/null 2>&1 || \
               curl -f "http://localhost:$port/health" >/dev/null 2>&1 || \
               curl -f "http://localhost:$port/-/ready" >/dev/null 2>&1; then
                print_success "$service_name is healthy"
                break
            fi

            sleep 5
            ((attempts++))
        done

        if [[ $attempts -eq 60 ]]; then
            print_warning "$service_name may not be fully ready yet"
        fi
    done

    print_success "Service health check completed"
}

# Function to show service status
show_status() {
    print_status "Current service status:"

    cd "$PROJECT_ROOT"

    echo
    echo "=== Container Status ==="
    docker-compose ps

    echo
    echo "=== Network Information ==="
    docker network ls | grep sigmacode || echo "No sigmacode network found"

    echo
    echo "=== Volume Information ==="
    docker volume ls | grep -E "(sigmacode|app-db|redis|vault|prometheus|grafana|elasticsearch)" || echo "No relevant volumes found"

    echo
    echo "=== Port Usage ==="
    netstat -tulpn 2>/dev/null | grep -E "(5432|6379|8200|5001|8000|8001|9090|3000|9200)" || echo "Port information not available"
}

# Function to show access URLs
show_access_info() {
    print_success "Service Access Information:"
    echo
    echo "=== Core Services ==="
    echo "• Database (PostgreSQL): localhost:${POSTGRES_PORT:-5432}"
    echo "• Redis Cache: localhost:${REDIS_PORT:-6379}"
    echo "• Vault Secrets: http://localhost:${VAULT_PORT:-8200} (Token: ${VAULT_ROOT_TOKEN:-hvs_dev_root_token})"

    echo
    echo "=== AI & Workflow ==="
    echo "• Dify API: http://localhost:${DIFY_API_PORT:-5001}"
    echo "• Dify Web: http://localhost:${DIFY_WEB_PORT:-3000}"
    echo "• SIGMAGUARD Firewall: http://localhost:${SUPERAGENT_PORT:-8080}"

    echo
    echo "=== API Gateway ==="
    echo "• Kong Proxy: http://localhost:${KONG_PROXY_PORT:-8000}"
    echo "• Kong Admin: http://localhost:${KONG_ADMIN_PORT:-8001}"
    echo "• Konga UI: http://localhost:${KONGA_PORT:-1337} (admin/admin123)"

    echo
    echo "=== Monitoring ==="
    echo "• Prometheus: http://localhost:${PROMETHEUS_PORT:-9090}"
    echo "• Grafana: http://localhost:${GRAFANA_PORT:-3000} (${GRAFANA_USER:-admin}/${GRAFANA_PASSWORD:-grafana_password})"
    echo "• AlertManager: http://localhost:${ALERTMANAGER_PORT:-9093}"
    echo "• Node Exporter: http://localhost:${NODE_EXPORTER_PORT:-9100}"
    echo "• cAdvisor: http://localhost:${CADVISOR_PORT:-8080}"

    echo
    echo "=== Logging ==="
    echo "• Elasticsearch: http://localhost:${ELASTICSEARCH_PORT:-9200}"
    echo "• Kibana: http://localhost:${KIBANA_PORT:-5601}"
    echo "• FluentD: http://localhost:${FLUENTD_PORT:-24224}"

    echo
    echo "=== CI/CD ==="
    echo "• Woodpecker CI: http://localhost:${WOODPECKER_SERVER_PORT:-8000}"
}

# Function to handle cleanup on script exit
cleanup() {
    print_status "Shutting down services..."
    cd "$PROJECT_ROOT"
    docker-compose down
    print_success "All services stopped"
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    print_status "Starting SIGMACODE AI Infrastructure..."

    check_docker
    check_docker_compose
    load_env
    validate_env
    create_directories
    create_config_files
    stop_existing
    start_services

    print_status "Waiting for services to initialize..."
    sleep 30

    wait_for_healthy
    show_status
    show_access_info

    print_success "SIGMACODE AI Infrastructure is now running!"
    print_success "All services are configured and ready to use."

    print_status "Monitoring logs... (Press Ctrl+C to stop)"
    docker-compose logs -f
}

# Run main function
main "$@"

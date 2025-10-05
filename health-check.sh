#!/bin/bash

# =============================================================================
# SIGMACODE AI - Health Check Script (Fixed Version)
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HEALTH_CHECK_INTERVAL=${HEALTH_CHECK_INTERVAL:-30}  # seconds
UNHEALTHY_THRESHOLD=${UNHEALTHY_THRESHOLD:-3}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to check if a service is healthy
check_service() {
    local service_name="$1"
    local url="$2"
    local max_attempts=3
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s --max-time 5 "$url" >/dev/null 2>&1; then
            echo "healthy"
            return 0
        fi

        if [[ $attempt -lt $max_attempts ]]; then
            sleep 2
        fi

        ((attempt++))
    done

    echo "unhealthy"
    return 1
}

# Function to check database connectivity
check_database() {
    local host="localhost"
    local port="5432"
    local database="sigmacode_dev"
    local user="postgres"

    # Try to connect with psql if available
    if command -v psql >/dev/null 2>&1; then
        if PGPASSWORD="${POSTGRES_PASSWORD:-postgres}" psql -h "$host" -p "$port" -U "$user" -d "$database" -c "SELECT 1;" >/dev/null 2>&1; then
            echo "healthy"
            return 0
        fi
    else
        # Fallback to curl check
        if curl -f -s --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
            echo "healthy"
            return 0
        fi
    fi

    echo "unhealthy"
    return 1
}

# Function to check Redis connectivity
check_redis() {
    local host="localhost"
    local port="6379"

    if command -v redis-cli >/dev/null 2>&1; then
        if redis-cli -h "$host" -p "$port" -a "${REDIS_PASSWORD:-redis_password}" ping >/dev/null 2>&1; then
            echo "healthy"
            return 0
        fi
    else
        # Fallback to curl check
        if curl -f -s --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
            echo "healthy"
            return 0
        fi
    fi

    echo "unhealthy"
    return 1
}

# Function to perform full health check
perform_health_check() {
    print_status "Performing health check..."

    local unhealthy_count=0
    local total_services=8
    local healthy_services=0

    # Check Database
    if [[ "$(check_database)" == "healthy" ]]; then
        print_success "Database (Port 5433) is healthy"
        ((healthy_services++))
    else
        print_error "Database (Port 5433) is unhealthy"
        ((unhealthy_count++))
    fi

    # Check Redis
    if [[ "$(check_redis)" == "healthy" ]]; then
        print_success "Redis (Port 6380) is healthy"
        ((healthy_services++))
    else
        print_error "Redis (Port 6380) is unhealthy"
        ((unhealthy_count++))
    fi

    # Check Vault
    if [[ "$(check_service "Vault" "http://localhost:8201/v1/sys/health")" == "healthy" ]]; then
        print_success "Vault (Port 8201) is healthy"
        ((healthy_services++))
    else
        print_error "Vault (Port 8201) is unhealthy"
        ((unhealthy_count++))
    fi

    # Check Dify API
    if [[ "$(check_service "Dify API" "http://localhost:5101/health")" == "healthy" ]]; then
        print_success "Dify API (Port 5101) is healthy"
        ((healthy_services++))
    else
        print_error "Dify API (Port 5101) is unhealthy"
        ((unhealthy_count++))
    fi

    # Check Kong API Gateway
    if [[ "$(check_service "Kong API Gateway" "http://localhost:8101")" == "healthy" ]]; then
        print_success "Kong API Gateway (Port 8101) is healthy"
        ((healthy_services++))
    else
        print_error "Kong API Gateway (Port 8101) is unhealthy"
        ((unhealthy_count++))
    fi

    # Check Prometheus
    if [[ "$(check_service "Prometheus" "http://localhost:9090/-/ready")" == "healthy" ]]; then
        print_success "Prometheus (Port 9090) is healthy"
        ((healthy_services++))
    else
        print_error "Prometheus (Port 9090) is unhealthy"
        ((unhealthy_count++))
    fi

    # Check Grafana
    if [[ "$(check_service "Grafana" "http://localhost:3100/api/health")" == "healthy" ]]; then
        print_success "Grafana (Port 3100) is healthy"
        ((healthy_services++))
    else
        print_error "Grafana (Port 3100) is unhealthy"
        ((unhealthy_count++))
    fi

    # Check Elasticsearch
    if [[ "$(check_service "Elasticsearch" "http://localhost:9201/_cluster/health")" == "healthy" ]]; then
        print_success "Elasticsearch (Port 9201) is healthy"
        ((healthy_services++))
    else
        print_error "Elasticsearch (Port 9201) is unhealthy"
        ((unhealthy_count++))
    fi

    # Summary
    echo
    print_status "Health Check Summary:"
    print_status "Total Services: $total_services"
    print_success "Healthy Services: $healthy_services"
    print_error "Unhealthy Services: $unhealthy_count"

    return $unhealthy_count
}

# Function to monitor services continuously
monitor_services() {
    print_status "Starting continuous monitoring (interval: ${HEALTH_CHECK_INTERVAL}s)..."

    local consecutive_failures=0

    while true; do
        unhealthy_count=$(perform_health_check)
        echo "----------------------------------------"

        if [[ $unhealthy_count -eq 0 ]]; then
            consecutive_failures=0
            print_success "All services are healthy"
        else
            ((consecutive_failures++))
            print_warning "Found $unhealthy_count unhealthy services (consecutive failures: $consecutive_failures)"

            if [[ $consecutive_failures -ge $UNHEALTHY_THRESHOLD ]]; then
                print_error "Too many consecutive failures. Consider restarting services."
                print_error "Run: ./start.sh to restart all services"
            fi
        fi

        sleep "$HEALTH_CHECK_INTERVAL"
    done
}

# Function to show help
show_help() {
    echo "SIGMACODE AI Health Check Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -m, --monitor       Continuously monitor services"
    echo "  -i, --interval SEC  Set monitoring interval in seconds (default: 30)"
    echo "  -t, --threshold N   Set unhealthy threshold (default: 3)"
    echo "  -s, --services      List all services being monitored"
    echo
    echo "Examples:"
    echo "  $0                  Perform one-time health check"
    echo "  $0 --monitor        Continuously monitor services"
    echo "  $0 --monitor --interval 60    Monitor every 60 seconds"
}

# Function to list services
list_services() {
    echo "SIGMACODE AI - Monitored Services:"
    echo
    echo "• Database: localhost:5432"
    echo "• Redis: localhost:6379"
    echo "• Vault: localhost:8200"
    echo "• Dify API: localhost:5001"
    echo "• Kong API Gateway: localhost:8001"
    echo "• Prometheus: localhost:9090"
    echo "• Grafana: localhost:3000"
    echo "• Elasticsearch: localhost:9200"
    echo
}

# Parse command line arguments
MONITOR=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -m|--monitor)
            MONITOR=true
            shift
            ;;
        -i|--interval)
            HEALTH_CHECK_INTERVAL="$2"
            shift 2
            ;;
        -t|--threshold)
            UNHEALTHY_THRESHOLD="$2"
            shift 2
            ;;
        -s|--services)
            list_services
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Load environment variables
if [[ -f "$PROJECT_ROOT/.env" ]]; then
    source "$PROJECT_ROOT/.env"
fi

# Main execution
main() {
    print_status "SIGMACODE AI Health Check"

    if [[ "$MONITOR" == "true" ]]; then
        monitor_services
    else
        perform_health_check
        exit $unhealthy_count
    fi
}

# Run main function
main "$@"

#!/bin/bash

# =============================================================================
# SIGMACODE AI - Status Overview Script
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${BLUE}  SIGMACODE AI - System Status${NC}"
    echo -e "${BLUE}=======================================${NC}"
    echo
}

print_section() {
    echo -e "${YELLOW}=== $1 ===${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to check Docker status
check_docker_status() {
    print_section "Docker Environment"

    if command -v docker >/dev/null 2>&1; then
        if docker info >/dev/null 2>&1; then
            print_success "Docker is running"

            # Show Docker version
            DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
            print_status "Docker version: $DOCKER_VERSION"

            # Show running containers
            CONTAINER_COUNT=$(docker ps -q | wc -l)
            print_status "Running containers: $CONTAINER_COUNT"

        else
            print_error "Docker is not running"
        fi
    else
        print_error "Docker is not installed"
    fi

    echo
}

# Function to check container status
check_container_status() {
    print_section "Container Status"

    if docker ps >/dev/null 2>&1; then
        # Count containers by status
        RUNNING=$(docker ps -q | wc -l)
        TOTAL=$(docker ps -a -q | wc -l)
        STOPPED=$((TOTAL - RUNNING))

        print_status "Total containers: $TOTAL"
        print_success "Running: $RUNNING"
        if [[ $STOPPED -gt 0 ]]; then
            print_warning "Stopped: $STOPPED"
        fi

        # Show container details if any are running
        if [[ $RUNNING -gt 0 ]]; then
            echo
            echo "Container Details:"
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        fi
    else
        print_error "Cannot check container status"
    fi

    echo
}

# Function to check network status
check_network_status() {
    print_section "Network Status"

    if docker network ls >/dev/null 2>&1; then
        NETWORK_COUNT=$(docker network ls -q | wc -l)
        print_status "Total networks: $NETWORK_COUNT"

        # Check for sigmacode network
        if docker network ls --filter name=sigmacode-network -q | grep -q .; then
            print_success "SIGMACODE network exists"

            # Show network details
            docker network inspect sigmacode-network --format "Name: {{.Name}}, Driver: {{.Driver}}, Subnet: {{range .IPAM.Config}}{{.Subnet}}{{end}}"
        else
            print_warning "SIGMACODE network not found"
        fi
    else
        print_error "Cannot check network status"
    fi

    echo
}

# Function to check volume status
check_volume_status() {
    print_section "Volume Status"

    if docker volume ls >/dev/null 2>&1; then
        VOLUME_COUNT=$(docker volume ls -q | wc -l)
        print_status "Total volumes: $VOLUME_COUNT"

        # Show sigmacode volumes
        SIGMACODE_VOLUMES=$(docker volume ls --filter name=sigmacode -q | wc -l 2>/dev/null || echo "0")
        if [[ $SIGMACODE_VOLUMES -gt 0 ]]; then
            print_success "SIGMACODE volumes: $SIGMACODE_VOLUMES"
        else
            print_warning "No SIGMACODE volumes found"
        fi
    else
        print_error "Cannot check volume status"
    fi

    echo
}

# Function to check service health
check_service_health() {
    print_section "Service Health"

    local services=(
        "Database:5432"
        "Redis:6379"
        "Vault:8200"
        "Dify API:5001"
        "Kong API Gateway:8001"
        "Prometheus:9090"
        "Grafana:3000"
        "Elasticsearch:9200"
    )

    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"

        if curl -f -s --max-time 3 "http://localhost:$port" >/dev/null 2>&1; then
            print_success "$name (Port $port)"
        else
            print_error "$name (Port $port)"
        fi
    done

    echo
}

# Function to check resource usage
check_resource_usage() {
    print_section "Resource Usage"

    if command -v docker >/dev/null 2>&1 && docker stats --no-stream >/dev/null 2>&1; then
        echo "Top resource-consuming containers:"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    else
        print_warning "Cannot retrieve resource usage (requires Docker stats)"
    fi

    echo
}

# Function to show access information
show_access_info() {
    print_section "Access Information"

    echo "Core Services:"
    echo "• Database (PostgreSQL): localhost:5432"
    echo "• Redis Cache: localhost:6379"
    echo "• Vault Secrets: http://localhost:8200"

    echo
    echo "AI & Workflow:"
    echo "• Dify API: http://localhost:5001"
    echo "• Dify Web: http://localhost:3000"
    echo "• SIGMAGUARD Firewall: http://localhost:8080"

    echo
    echo "API Gateway:"
    echo "• Kong Proxy: http://localhost:8000"
    echo "• Kong Admin: http://localhost:8001"
    echo "• Konga UI: http://localhost:1337 (admin/admin123)"

    echo
    echo "Monitoring:"
    echo "• Prometheus: http://localhost:9090"
    echo "• Grafana: http://localhost:3000 (admin/grafana_password)"
    echo "• AlertManager: http://localhost:9093"

    echo
    echo "Logging:"
    echo "• Elasticsearch: http://localhost:9200"
    echo "• Kibana: http://localhost:5601"

    echo
    echo "Scripts:"
    echo "• Start all services: ./start.sh"
    echo "• Stop all services: ./stop.sh"
    echo "• Health check: ./health-check.sh"
    echo "• This status: ./status.sh"
}

# Function to show help
show_help() {
    echo "SIGMACODE AI Status Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -q, --quick         Quick status overview"
    echo "  -v, --verbose       Detailed status information"
    echo "  -a, --access        Show access information only"
    echo
    echo "Examples:"
    echo "  $0                  Full status overview"
    echo "  $0 --quick          Quick status check"
    echo "  $0 --access         Show only access information"
}

# Parse command line arguments
VERBOSE=false
QUICK=false
ACCESS_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -q|--quick)
            QUICK=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -a|--access)
            ACCESS_ONLY=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_header

    if [[ "$ACCESS_ONLY" == "true" ]]; then
        show_access_info
        exit 0
    fi

    check_docker_status

    if [[ "$QUICK" == "true" ]]; then
        check_container_status
        check_service_health
    else
        check_container_status
        check_network_status
        check_volume_status
        check_service_health

        if [[ "$VERBOSE" == "true" ]]; then
            check_resource_usage
        fi

        show_access_info
    fi

    print_header
    print_success "Status check completed"
}

# Run main function
main "$@"

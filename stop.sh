#!/bin/bash

# =============================================================================
# SIGMACODE AI - Infrastructure Stop Script
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

# Function to stop all services
stop_services() {
    print_status "Stopping all SIGMACODE AI services..."

    cd "$PROJECT_ROOT"

    # Check if docker-compose file exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        print_warning "Docker Compose file not found at $DOCKER_COMPOSE_FILE"
        return 1
    fi

    # Stop all services
    if docker-compose ps -q | grep -q .; then
        print_status "Stopping containers..."
        docker-compose down --remove-orphans --volumes --timeout 30

        # Clean up networks if they exist
        if docker network ls | grep -q sigmacode-network; then
            print_status "Removing network..."
            docker network rm sigmacode-network || true
        fi

        print_success "All services stopped and cleaned up"
    else
        print_warning "No running containers found"
    fi
}

# Function to clean up Docker resources
cleanup_docker() {
    print_status "Cleaning up Docker resources..."

    # Remove stopped containers
    if docker ps -aq --filter "status=exited" | grep -q .; then
        print_status "Removing exited containers..."
        docker container prune -f
    fi

    # Remove unused networks
    if docker network ls --filter "type=custom" | grep -q .; then
        print_status "Removing unused networks..."
        docker network prune -f
    fi

    # Remove unused volumes (be careful with this)
    print_warning "Skipping volume cleanup to preserve data. Use --clean-volumes to remove volumes."

    print_success "Docker cleanup completed"
}

# Function to show help
show_help() {
    echo "SIGMACODE AI Infrastructure Stop Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -c, --clean         Clean up Docker resources after stopping"
    echo "  -v, --clean-volumes Clean up volumes as well (WARNING: This will delete data)"
    echo "  -f, --force         Force stop all containers immediately"
    echo
    echo "Examples:"
    echo "  $0                  Stop all services gracefully"
    echo "  $0 --clean          Stop services and clean up Docker resources"
    echo "  $0 --force          Force stop all containers immediately"
}

# Parse command line arguments
FORCE=false
CLEAN=false
CLEAN_VOLUMES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -v|--clean-volumes)
            CLEAN_VOLUMES=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "SIGMACODE AI Infrastructure Stop Script"

    if [[ "$FORCE" == "true" ]]; then
        print_warning "Force stopping all containers..."
        cd "$PROJECT_ROOT"
        docker-compose kill || true
    fi

    stop_services

    if [[ "$CLEAN" == "true" ]]; then
        cleanup_docker
    fi

    if [[ "$CLEAN_VOLUMES" == "true" ]]; then
        print_warning "Cleaning up volumes - this will delete all data!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Removing all volumes..."
            cd "$PROJECT_ROOT"
            docker-compose down --volumes --remove-orphans
            docker volume prune -f
            print_success "All volumes removed"
        else
            print_status "Volume cleanup cancelled"
        fi
    fi

    print_success "SIGMACODE AI Infrastructure stopped successfully"
}

# Run main function
main "$@"

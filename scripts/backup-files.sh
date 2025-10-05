#!/bin/bash

# SIGMACODE AI File Backup Script
# Usage: ./scripts/backup-files.sh [backup-name]

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups/files}"
BACKUP_NAME="${1:-$(date +%Y%m%d_%H%M%S)}"
SOURCE_DIRS="${SOURCE_DIRS:-./uploads ./public ./database/migrations}"
AWS_S3_BUCKET="${AWS_S3_BUCKET}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🚀 Starting file backup: $BACKUP_NAME"

# Validate source directories exist
for dir in $SOURCE_DIRS; do
    if [ ! -d "$dir" ]; then
        echo "⚠️ Warning: Source directory $dir does not exist, skipping..."
    fi
done

# Create tar archive
BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}_files.tar.gz"

echo "📦 Creating file backup archive..."

# Use tar to create compressed archive
tar -czf "$BACKUP_FILE" -C "$(dirname "$BACKUP_DIR")" $(basename -a $SOURCE_DIRS 2>/dev/null || echo "") 2>/dev/null || {
    echo "❌ No valid source directories found"
    exit 1
}

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✅ File backup completed: $BACKUP_FILE ($BACKUP_SIZE)"

# Upload to S3 if configured
if [ -n "$AWS_S3_BUCKET" ]; then
    echo "☁️ Uploading to S3..."

    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI is not installed. Please install it to enable S3 uploads."
        exit 1
    fi

    S3_KEY="file-backups/${BACKUP_NAME}_files.tar.gz"

    if aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BUCKET/$S3_KEY" --region "$AWS_REGION"; then
        echo "✅ Backup uploaded to S3: s3://$AWS_S3_BUCKET/$S3_KEY"
    else
        echo "❌ Failed to upload backup to S3"
        exit 1
    fi
fi

# Cleanup old local backups (keep last 7 days)
echo "🧹 Cleaning up old local backups..."
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +7 -delete

echo "🎉 File backup process completed successfully!"
echo "📍 Backup location: $BACKUP_FILE"

# Optional: Send notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ File backup completed: $BACKUP_NAME ($BACKUP_SIZE)\"}" \
        "$SLACK_WEBHOOK_URL"
fi

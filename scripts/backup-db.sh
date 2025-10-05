#!/bin/bash

# SIGMACODE AI Database Backup Script
# Usage: ./scripts/backup-db.sh [backup-name]

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups/db}"
BACKUP_NAME="${1:-$(date +%Y%m%d_%H%M%S)}"
DB_URL="${DATABASE_URL}"
AWS_S3_BUCKET="${AWS_S3_BUCKET}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🚀 Starting database backup: $BACKUP_NAME"

# Check if database URL is set
if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
fi

# Determine database type from URL
if [[ "$DB_URL" =~ postgresql:// ]]; then
    DB_TYPE="postgresql"
elif [[ "$DB_URL" =~ mysql:// ]]; then
    DB_TYPE="mysql"
else
    echo "❌ Unsupported database type. Only PostgreSQL and MySQL are supported."
    exit 1
fi

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}_${DB_TYPE}.sql"

echo "📦 Creating $DB_TYPE backup..."

# Create database backup based on type
if [ "$DB_TYPE" = "postgresql" ]; then
    # PostgreSQL backup using pg_dump
    if ! command -v pg_dump &> /dev/null; then
        echo "❌ pg_dump is not installed. Please install PostgreSQL client tools."
        exit 1
    fi

    pg_dump "$DB_URL" -f "$BACKUP_FILE" --no-owner --no-privileges --clean --if-exists
elif [ "$DB_TYPE" = "mysql" ]; then
    # MySQL backup using mysqldump
    if ! command -v mysqldump &> /dev/null; then
        echo "❌ mysqldump is not installed. Please install MySQL client tools."
        exit 1
    fi

    mysqldump "$DB_URL" --single-transaction --routines --triggers > "$BACKUP_FILE"
fi

# Compress the backup
echo "🗜️ Compressing backup..."
gzip "$BACKUP_FILE"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)

echo "✅ Database backup completed: $BACKUP_FILE_COMPRESSED ($BACKUP_SIZE)"

# Upload to S3 if configured
if [ -n "$AWS_S3_BUCKET" ]; then
    echo "☁️ Uploading to S3..."

    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI is not installed. Please install it to enable S3 uploads."
        exit 1
    fi

    S3_KEY="database-backups/${BACKUP_NAME}_${DB_TYPE}.sql.gz"

    if aws s3 cp "$BACKUP_FILE_COMPRESSED" "s3://$AWS_S3_BUCKET/$S3_KEY" --region "$AWS_REGION"; then
        echo "✅ Backup uploaded to S3: s3://$AWS_S3_BUCKET/$S3_KEY"

        # Set lifecycle policy for old backups (optional)
        echo "🧹 Setting S3 lifecycle policy for old backups..."
        aws s3api put-bucket-lifecycle-configuration \
            --bucket "$AWS_S3_BUCKET" \
            --lifecycle-configuration '{
                "Rules": [
                    {
                        "ID": "DeleteOldBackups",
                        "Filter": {
                            "Prefix": "database-backups/"
                        },
                        "Status": "Enabled",
                        "Transitions": [
                            {
                                "Days": 30,
                                "StorageClass": "STANDARD_IA"
                            },
                            {
                                "Days": 90,
                                "StorageClass": "GLACIER"
                            }
                        ],
                        "Expiration": {
                            "Days": 365
                        }
                    }
                ]
            }' \
            --region "$AWS_REGION" 2>/dev/null || true
    else
        echo "❌ Failed to upload backup to S3"
        exit 1
    fi
fi

# Cleanup old local backups (keep last 7 days)
echo "🧹 Cleaning up old local backups..."
find "$BACKUP_DIR" -name "*.gz" -type f -mtime +7 -delete

echo "🎉 Database backup process completed successfully!"
echo "📍 Backup location: $BACKUP_FILE_COMPRESSED"

# Optional: Send notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Database backup completed: $BACKUP_NAME ($BACKUP_SIZE)\"}" \
        "$SLACK_WEBHOOK_URL"
fi

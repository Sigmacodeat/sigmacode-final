# 🔄 Automated Backup System

SIGMACODE AI includes automated backup scripts for database and file backups.

## 📋 Quick Start

### Manual Backups

```bash
# Database backup
./scripts/backup-db.sh [backup-name]

# File backup
./scripts/backup-files.sh [backup-name]
```

### Automated Backups (Cron)

Add these lines to your crontab (`crontab -e`):

```bash
# Database backup daily at 2 AM
0 2 * * * cd /path/to/sigmacode && ./scripts/backup-db.sh daily-db-$(date +\%Y\%m\%d)

# File backup weekly on Sundays at 3 AM
0 3 * * 0 cd /path/to/sigmacode && ./scripts/backup-files.sh weekly-files-$(date +\%Y\%m\%d)
```

## ☁️ Cloud Storage (S3)

### Environment Variables

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-backup-bucket
AWS_REGION=us-east-1
```

### Automatic Upload

Backups are automatically uploaded to S3 if AWS credentials are configured.

### Lifecycle Management

The scripts automatically configure S3 lifecycle policies:
- **30 days**: Transition to Standard-IA
- **90 days**: Transition to Glacier
- **365 days**: Automatic deletion

## 📦 Backup Contents

### Database Backup
- All tables and data
- Views, functions, and procedures
- Indexes and constraints
- PostgreSQL: Uses `pg_dump` with `--clean --if-exists`
- MySQL: Uses `mysqldump` with `--single-transaction --routines --triggers`

### File Backup
- `uploads/` - User uploaded files
- `public/` - Static assets
- `database/migrations/` - Database migration files

## 🔧 Configuration

### Environment Variables

```bash
# Backup settings
BACKUP_DIR=./backups
SOURCE_DIRS="./uploads ./public ./database/migrations"

# S3 settings (optional)
AWS_S3_BUCKET=your-backup-bucket
AWS_REGION=us-east-1

# Notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Customization

Edit the scripts to customize:
- Backup retention periods
- Additional directories to backup
- Compression settings
- Notification preferences

## 🛠️ Troubleshooting

### Common Issues

**"pg_dump not found"**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# CentOS/RHEL
sudo yum install postgresql
```

**"mysqldump not found"**
```bash
# Ubuntu/Debian
sudo apt-get install mysql-client

# CentOS/RHEL
sudo yum install mysql
```

**"AWS CLI not found"**
```bash
# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Manual Backup Commands

```bash
# PostgreSQL
pg_dump $DATABASE_URL -f backup.sql --no-owner --clean

# MySQL
mysqldump $DATABASE_URL --single-transaction --routines --triggers > backup.sql

# Files
tar -czf backup.tar.gz uploads/ public/ database/migrations/
```

## 📊 Monitoring

### Log Files
- Database backups: `./backups/db/`
- File backups: `./backups/files/`
- Check logs for errors and success messages

### Health Checks
```bash
# Check if backups are recent (within 24 hours)
find ./backups -name "*.gz" -mtime -1 -exec echo "Recent backup found: {}" \;

# Verify S3 upload
aws s3 ls s3://$AWS_S3_BUCKET/database-backups/ --recursive
```

## 🚨 Emergency Restore

### Database Restore
```bash
# PostgreSQL
psql $DATABASE_URL -f backup.sql

# MySQL
mysql $DATABASE_URL < backup.sql
```

### File Restore
```bash
# Extract specific backup
tar -xzf backup.tar.gz -C /path/to/restore/

# Extract specific directory
tar -xzf backup.tar.gz uploads/ -C /path/to/restore/
```

## 🔒 Security

- Store backup credentials securely (use IAM roles in production)
- Encrypt sensitive data before backup
- Restrict access to backup directories
- Regularly test restore procedures

## 📈 Scaling

For high-availability setups:
- Use multiple backup destinations (S3 + local)
- Implement backup verification
- Set up monitoring and alerting
- Consider incremental backups for large datasets

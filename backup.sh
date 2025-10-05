#!/bin/bash

# Sicherstellen, dass wir im richtigen Verzeichnis sind
cd "$(dirname "$0")"

# Docker-Compose herunterfahren
docker-compose down

# Backup-Verzeichnis erstellen
BACKUP_DIR="./backup/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Volumes mit rsync sichern
rsync -av --delete ./volumes/ "$BACKUP_DIR"

# Optional: Backup verschlüsseln
# BACKUP_ENC_KEY="DeinVerschlüsselungsschüssel"
# tar -czf - "$BACKUP_DIR" | openssl enc -aes-256-cbc -salt -out "$BACKUP_DIR.tar.enc" -pass pass:"$BACKUP_ENC_KEY"

# Docker-Compose wieder hochfahren
docker-compose up -d

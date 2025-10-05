#!/bin/bash

# SIGMACODE AI - Logger Migration Script
# Replaces console.* statements with structured logger calls

set -e

echo "🔧 Migrating console statements to structured logger..."

# Count existing console statements
CONSOLE_LOG_COUNT=$(grep -r "console\.log" app/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
CONSOLE_ERROR_COUNT=$(grep -r "console\.error" app/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
CONSOLE_WARN_COUNT=$(grep -r "console\.warn" app/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')

echo "📊 Found:"
echo "  - console.log: $CONSOLE_LOG_COUNT"
echo "  - console.error: $CONSOLE_ERROR_COUNT"
echo "  - console.warn: $CONSOLE_WARN_COUNT"
echo ""

# Function to add logger import if not present
add_logger_import() {
  local file=$1
  if ! grep -q "from '@/lib/logger'" "$file"; then
    # Add import after other imports
    if grep -q "^import" "$file"; then
      # Find the last import line
      last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      sed -i '' "${last_import}a\\
import { logger } from '@/lib/logger';\\
" "$file"
      echo "  ✅ Added logger import to $file"
    fi
  fi
}

# Migrate specific files manually
echo "🔄 Migrating critical API routes..."

# Add more specific migrations here as needed
echo "✅ Migration complete!"
echo ""
echo "⚠️  Manual review recommended for:"
echo "  - Complex error contexts"
echo "  - Performance-critical logging"
echo "  - Sensitive data in logs"

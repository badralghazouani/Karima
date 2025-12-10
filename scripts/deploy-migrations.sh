#!/bin/bash

# Script to safely deploy migrations on Render
# This handles cases where migrations may have been partially applied

set -e  # Exit on error

echo "🔄 Starting migration deployment..."

# Try to deploy migrations
if npx prisma migrate deploy 2>&1 | tee /tmp/migrate_output.log; then
  echo "✅ Migrations applied successfully"
else
  # Check if error is about existing objects
  if grep -q "already exists" /tmp/migrate_output.log; then
    echo "⚠️  Found 'already exists' errors - this means the schema is already in place"
    echo "📝 Attempting to mark migrations as applied..."

    # Get the migration name from the error
    MIGRATION_NAME=$(grep "Migration name:" /tmp/migrate_output.log | awk '{print $3}')

    if [ -n "$MIGRATION_NAME" ]; then
      echo "🔧 Marking migration '$MIGRATION_NAME' as applied..."
      npx prisma migrate resolve --applied "$MIGRATION_NAME"

      # Try to deploy remaining migrations
      echo "🔄 Deploying remaining migrations..."
      npx prisma migrate deploy
    else
      echo "❌ Could not determine migration name from error"
      exit 1
    fi
  else
    echo "❌ Migration failed with unknown error"
    exit 1
  fi
fi

echo "✅ Migration deployment complete!"

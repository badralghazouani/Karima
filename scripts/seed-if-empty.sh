#!/bin/bash

# Check if database has any users
USER_COUNT=$(npx prisma db execute --stdin <<EOF
SELECT COUNT(*) FROM "User";
EOF
)

# If no users exist, run seed
if [ "$USER_COUNT" = "0" ]; then
  echo "Database is empty, running seed..."
  npm run seed
else
  echo "Database already has data, skipping seed..."
fi

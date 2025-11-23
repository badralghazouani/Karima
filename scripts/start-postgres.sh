#!/usr/bin/env bash
set -euo pipefail

# Start Postgres via docker-compose and wait for readiness.
# Usage: ./scripts/start-postgres.sh

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed or not in PATH. Please install Docker Desktop for macOS and retry."
  exit 1
fi

# Bring up the container
docker compose up -d --remove-orphans

# Wait for Postgres to accept connections (60s timeout)
SECS=60
while [ $SECS -gt 0 ]; do
  docker logs karima-postgres 2>&1 | grep -q "database system is ready to accept connections" && break
  sleep 1
  SECS=$((SECS-1))
done

if [ $SECS -le 0 ]; then
  echo "Timed out waiting for Postgres to be ready. Check 'docker logs karima-postgres' for details."
  exit 1
fi

echo "Postgres is ready. You can now run: npx prisma migrate dev --name init"

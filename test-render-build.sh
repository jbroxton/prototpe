#!/bin/bash
set -euo pipefail

rm -rf node_modules .next

export CI=true
export NODE_ENV=production
export PORT=10000

npm install
npx prisma generate
npm run build

set -a
if [ -f .env ]; then
  source .env
fi
set +a

if [ -n "${RENDER_TEST_DATABASE_URL:-}" ]; then
  export DATABASE_URL="$RENDER_TEST_DATABASE_URL"
fi

npx prisma migrate resolve --rolled-back 20250915195600_add_ac_testlink || true
npx prisma migrate deploy

npm start &
APP_PID=$!
trap 'kill "$APP_PID" >/dev/null 2>&1 || true' EXIT

sleep 10
if ! kill -0 "$APP_PID" >/dev/null 2>&1; then
  echo "npm start exited prematurely" >&2
  wait "$APP_PID" || true
  exit 1
fi

sleep 20
kill "$APP_PID" >/dev/null 2>&1 || true
wait "$APP_PID" 2>/dev/null || true
trap - EXIT

echo "npm start kept running for 30s (expected)."

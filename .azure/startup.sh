#!/bin/bash
set -x

# Set NEXTAUTH_URL
if [ -z "$NEXTAUTH_URL" ] && [ ! -z "$WEBSITE_HOSTNAME" ]; then
    export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
fi

echo "[Startup] Environment:"
echo "[Startup] NEXTAUTH_URL=$NEXTAUTH_URL"
echo "[Startup] NODE_ENV=$NODE_ENV"
echo "[Startup] PORT=${PORT:-8080}"

cd /home/site/wwwroot
echo "[Startup] Current directory: $(pwd)"
echo "[Startup] Files:"
ls -la | head -20

echo "[Startup] Starting Next.js server..."
node node_modules/.bin/next start --port ${PORT:-8080}

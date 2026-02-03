#!/bin/bash

# Startup script for Azure App Service
# Start the Next.js standalone server

# Set NEXTAUTH_URL
if [ -z "$NEXTAUTH_URL" ]; then
    if [ ! -z "$WEBSITE_HOSTNAME" ]; then
        export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
    fi
fi

cd /home/site/wwwroot

# For standalone mode, copy public folder if it exists
if [ -d "public" ] && [ ! -d ".next/standalone/public" ]; then
    mkdir -p .next/standalone
    cp -r public .next/standalone/ 2>/dev/null || true
fi

# Start using the standalone server mode
PORT=${PORT:-8080}
export PORT
node .next/standalone/server.js

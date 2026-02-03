#!/bin/bash

# Startup script for Azure App Service
# Start the Next.js app (build should have already happened during deployment)

echo "====== STARTUP SCRIPT STARTING ======"
echo "Current directory: $(pwd)"

# Dynamically set NEXTAUTH_URL based on the app's actual URL
if [ -z "$NEXTAUTH_URL" ]; then
    if [ ! -z "$WEBSITE_HOSTNAME" ]; then
        export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
        echo "Set NEXTAUTH_URL=$NEXTAUTH_URL"
    fi
fi

cd /home/site/wwwroot

# Check if .next build exists
if [ ! -d ".next" ]; then
    echo "WARNING: .next build directory not found"
    echo "Directory contents:"
    ls -la | head -20
fi

echo "====== Starting Next.js server on port ${PORT:-8080} ======"
node_modules/.bin/next start --port ${PORT:-8080}

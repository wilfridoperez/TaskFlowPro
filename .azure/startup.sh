#!/bin/bash

# Startup script for Azure App Service
# Dynamically configure environment and start the Next.js app

echo "====== STARTUP SCRIPT STARTING ======"
echo "Current directory: $(pwd)"
echo "Current user: $(whoami)"

# Dynamically set NEXTAUTH_URL based on the app's actual URL
if [ -z "$NEXTAUTH_URL" ]; then
    if [ ! -z "$WEBSITE_HOSTNAME" ]; then
        export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
        echo "Set NEXTAUTH_URL=$NEXTAUTH_URL"
    fi
fi

echo "Changing to /home/site/wwwroot..."
cd /home/site/wwwroot

# Check if npm is available
echo "npm version: $(npm --version)"
echo "node version: $(node --version)"

# Check if Next.js is built
if [ -d ".next" ]; then
    echo "Next.js build found, starting server..."
    echo "====== Starting Next.js server on port ${PORT:-8080} ======"
    node_modules/.bin/next start --port ${PORT:-8080} 2>&1
else
    echo "ERROR: .next build directory not found!"
    echo "Contents of current directory:"
    ls -la
    exit 1
fi

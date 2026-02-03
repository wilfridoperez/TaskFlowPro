#!/bin/bash

# Startup script for Azure App Service
# Build and start the Next.js app

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

# Build the Next.js app if not already built
if [ ! -d ".next" ]; then
    echo "====== Building Next.js application ======"
    npm run build 2>&1
    if [ $? -ne 0 ]; then
        echo "ERROR: Build failed!"
        exit 1
    fi
else
    echo ".next build directory found, skipping build"
fi

echo "====== Starting Next.js server on port ${PORT:-8080} ======"
node_modules/.bin/next start --port ${PORT:-8080} 2>&1

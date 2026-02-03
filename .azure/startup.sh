#!/bin/bash

# Startup script for Azure App Service
# Dynamically configure environment and start the Next.js app

echo "====== STARTUP SCRIPT STARTING ======"
echo "Current directory: $(pwd)"
echo "Current user: $(whoami)"
echo "PATH: $PATH"

# Dynamically set NEXTAUTH_URL based on the app's actual URL
if [ -z "$NEXTAUTH_URL" ]; then
    if [ ! -z "$WEBSITE_HOSTNAME" ]; then
        export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
        echo "Set NEXTAUTH_URL=$NEXTAUTH_URL"
    fi
fi

echo "Changing to /home/site/wwwroot..."
cd /home/site/wwwroot || exit 1
echo "Now in: $(pwd)"
echo "Contents:"
ls -la | head -20

# Check if npm is available
echo "npm version: $(npm --version)"
echo "node version: $(node --version)"

echo "====== Starting Next.js server on port ${PORT:-8080} ======"
npm start 2>&1

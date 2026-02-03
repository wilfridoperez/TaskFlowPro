#!/bin/bash

# Startup script for Azure App Service
# Dynamically configure environment and start the Next.js app

# Dynamically set NEXTAUTH_URL based on the app's actual URL
if [ -z "$NEXTAUTH_URL" ]; then
    if [ ! -z "$WEBSITE_HOSTNAME" ]; then
        export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
        echo "Set NEXTAUTH_URL=$NEXTAUTH_URL"
    fi
fi

cd /home/site/wwwroot

# Start the Next.js app immediately
# Skip migrations to prevent startup timeout
# Migrations can be run manually or as a scheduled task
echo "====== Starting Next.js server on port ${PORT:-8080} ======"
npm start

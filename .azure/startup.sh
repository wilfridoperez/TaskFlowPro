#!/bin/bash

# Startup script for Azure App Service
# Dynamically configure environment and start the Next.js app

# Exit on error (but allow bg processes to fail gracefully)
set -e

# Dynamically set NEXTAUTH_URL based on the app's actual URL
if [ -z "$NEXTAUTH_URL" ]; then
    if [ ! -z "$WEBSITE_HOSTNAME" ]; then
        export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
        echo "Set NEXTAUTH_URL=$NEXTAUTH_URL"
    fi
fi

cd /home/site/wwwroot

# Run Prisma migrations in the background (non-blocking)
echo "====== Running Prisma migrations in background ======"
npx prisma migrate deploy --skip-generate > /tmp/prisma-migration.log 2>&1 &

# Start the Next.js app immediately without waiting for migrations
echo "====== Starting Next.js server on port ${PORT:-8080} ======"
npm start

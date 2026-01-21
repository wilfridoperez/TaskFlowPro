#!/bin/bash

# Exit on any error
set -e

# Dynamically set NEXTAUTH_URL based on the app's actual URL
if [ -z "$NEXTAUTH_URL" ]; then
    # Get the app domain from Azure App Service environment
    if [ ! -z "$WEBSITE_HOSTNAME" ]; then
        export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
    fi
fi

cd /home/site/wwwroot

# Run Prisma migrations with timeout and error handling
echo "====== Running Prisma migrations ======"
if ! npx prisma migrate deploy --skip-generate 2>&1; then
    echo "WARNING: Prisma migrations failed or database is not accessible"
    echo "DATABASE_URL: $DATABASE_URL"
fi

# Start the Next.js app with timeout and logging
echo "====== Starting Next.js server on port ${PORT:-8080} ======"
npm start

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

# Run Prisma migrations in the background (non-blocking)
# The app will start immediately and migrations will happen in the background
echo "====== Running Prisma migrations in background ======"
npx prisma migrate deploy --skip-generate > /tmp/prisma-migration.log 2>&1 &

# Start the Next.js app immediately
echo "====== Starting Next.js server on port ${PORT:-8080} ======"
npm start


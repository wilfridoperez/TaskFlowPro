#!/bin/bash

# Startup script for Azure App Service
# Start the Next.js app (build should have already happened during deployment)

# Dynamically set NEXTAUTH_URL based on the app's actual URL
if [ -z "$NEXTAUTH_URL" ]; then
    if [ ! -z "$WEBSITE_HOSTNAME" ]; then
        export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
    fi
fi

cd /home/site/wwwroot

# Start Next.js server
# Use exec to replace the shell process
exec node_modules/.bin/next start --port ${PORT:-8080}

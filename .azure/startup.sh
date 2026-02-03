#!/bin/bash

# Startup script for Azure App Service  
# Start the Next.js app

# Set NEXTAUTH_URL
if [ -z "$NEXTAUTH_URL" ]; then
    if [ ! -z "$WEBSITE_HOSTNAME" ]; then
        export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
    fi
fi

cd /home/site/wwwroot

# Use npm start to run the app
npm start

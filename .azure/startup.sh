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

# Set database connection timeout to 5 seconds
export DATABASE_QUERY_TIMEOUT="5000"

cd /home/site/wwwroot

# Start the Next.js app immediately without waiting for migrations
# Migrations should happen separately (as a job or in the app when first requested)
echo "====== Starting Next.js server on port ${PORT:-8080} ======"
npm start


#!/bin/bash
set -x

# Set NEXTAUTH_URL
if [ -z "$NEXTAUTH_URL" ] && [ ! -z "$WEBSITE_HOSTNAME" ]; then
    export NEXTAUTH_URL="https://$WEBSITE_HOSTNAME"
fi

cd /home/site/wwwroot
exec node node_modules/.bin/next start --port ${PORT:-8080}

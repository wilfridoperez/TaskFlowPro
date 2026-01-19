#!/bin/bash

# Configure Azure App Service settings to prevent Oryx platform detection
# This script is called after deployment to configure the App Service application settings

set -e

echo "Configuring Azure App Service for Node.js-only deployment..."

# These environment variables must be set BEFORE the next deployment
# They control Oryx build behavior
export ORYX_DISABLE_PLATFORM_DETECTION=true
export ORYX_PLATFORMS=nodejs
export ORYX_SKIP_DETECT_PLATFORMS=true
export ORYX_PLATFORM_DEFAULT=nodejs
export WEBSITE_NODE_DEFAULT_VERSION=24.11.0

echo "Configuration complete. Oryx will only detect Node.js platforms on next deployment."

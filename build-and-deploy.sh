#!/bin/bash
set -e

echo "Starting Node.js application build..."

# Set Oryx environment variables to prevent PHP detection
export ORYX_DISABLE_PLATFORM_DETECTION=true
export ORYX_SKIP_DETECT_PLATFORMS=true
export ORYX_PLATFORMS=nodejs
export ORYX_PLATFORM_DEFAULT=nodejs

# Ensure Node modules are not compressed to speed up deployment
export COMPRESS_NODE_MODULES=false
export NODE_ENV=production

echo "Environment variables set:"
echo "ORYX_DISABLE_PLATFORM_DETECTION=$ORYX_DISABLE_PLATFORM_DETECTION"
echo "ORYX_SKIP_DETECT_PLATFORMS=$ORYX_SKIP_DETECT_PLATFORMS"
echo "ORYX_PLATFORMS=$ORYX_PLATFORMS"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --legacy-peer-deps
else
    echo "Dependencies already installed"
fi

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "Building Next.js application..."
npm run build

echo "Build completed successfully!"

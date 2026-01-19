#!/bin/bash
set -e

echo "Installing production dependencies..."
npm ci --omit=dev --legacy-peer-deps

echo "Starting Next.js application..."
npm run start

#!/bin/bash
set -e

echo "Clearing port 8181..."
fuser -k 8181/tcp 2>/dev/null || true
sleep 2

echo "Installing production dependencies..."
npm ci --omit=dev --legacy-peer-deps

echo "Starting Next.js application on port 8181..."
PORT=8181 npm run start

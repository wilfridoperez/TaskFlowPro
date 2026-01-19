#!/bin/bash
set -e

echo "Killing any existing Node processes..."
pkill -f "next start" || true
pkill -f "node" || true
sleep 2

echo "Installing production dependencies..."
npm ci --omit=dev --legacy-peer-deps

echo "Starting Next.js application..."
npm run start

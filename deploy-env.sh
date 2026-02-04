#!/bin/bash

set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL before running}"
: "${NEXTAUTH_SECRET:?Set NEXTAUTH_SECRET before running}"
: "${NEXTAUTH_URL:?Set NEXTAUTH_URL before running}"
: "${STRIPE_PUBLIC_KEY:?Set STRIPE_PUBLIC_KEY before running}"
: "${STRIPE_SECRET_KEY:?Set STRIPE_SECRET_KEY before running}"
: "${STRIPE_WEBHOOK_SECRET:?Set STRIPE_WEBHOOK_SECRET before running}"

az webapp config appsettings set \
  --name TaskFlowPro \
  --resource-group TaskFlowPro \
  --settings \
  DATABASE_URL="$DATABASE_URL" \
  NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  NEXTAUTH_URL="$NEXTAUTH_URL" \
  NODE_ENV='production' \
  STRIPE_PUBLIC_KEY="$STRIPE_PUBLIC_KEY" \
  STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"

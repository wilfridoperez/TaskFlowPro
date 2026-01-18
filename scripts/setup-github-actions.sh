#!/bin/bash

# GitHub Actions & Azure Setup Script
# This script helps you configure GitHub secrets for Azure deployment

set -e

echo "🚀 TaskFlow Pro - GitHub Actions Setup"
echo "======================================"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Install it first:"
    echo "   https://learn.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI not found. Install it for easier secret setup:"
    echo "   https://cli.github.com"
    echo ""
    echo "For now, add secrets manually in GitHub:"
    echo "   Settings → Secrets and variables → Actions"
    exit 1
fi

# Get user inputs
read -p "Enter your Azure subscription ID (or press Enter to use default): " SUBSCRIPTION_ID
if [ -z "$SUBSCRIPTION_ID" ]; then
    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
fi

read -p "Enter your GitHub repository (format: owner/repo): " REPO

read -p "Enter your Azure App Service name: " APP_NAME

read -p "Enter your resource group name: " RESOURCE_GROUP

read -sp "Enter your PostgreSQL password: " DB_PASSWORD
echo ""

read -p "Enter your PostgreSQL server (e.g., taskflow-db): " DB_SERVER

read -p "Enter your database name (default: taskflow): " DB_NAME
DB_NAME=${DB_NAME:-taskflow}

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo ""
echo "📋 Creating Azure Service Principal..."

# Create service principal
SP_OUTPUT=$(az ad sp create-for-rbac \
  --name github-${APP_NAME}-deploy \
  --role contributor \
  --scopes /subscriptions/${SUBSCRIPTION_ID} \
  --json-auth 2>/dev/null) || true

if [ -z "$SP_OUTPUT" ]; then
    echo "⚠️  Service principal creation failed. You may already have one."
    echo "Run manually: az ad sp create-for-rbac --name github-${APP_NAME}-deploy --role contributor --scopes /subscriptions/${SUBSCRIPTION_ID} --json-auth"
    exit 1
fi

# Extract credentials
CLIENT_ID=$(echo "$SP_OUTPUT" | jq -r '.clientId')
CLIENT_SECRET=$(echo "$SP_OUTPUT" | jq -r '.clientSecret')
TENANT_ID=$(echo "$SP_OUTPUT" | jq -r '.tenantId')

# Create Azure credentials JSON
AZURE_CREDS=$(jq -n \
  --arg clientId "$CLIENT_ID" \
  --arg clientSecret "$CLIENT_SECRET" \
  --arg subscriptionId "$SUBSCRIPTION_ID" \
  --arg tenantId "$TENANT_ID" \
  '{clientId: $clientId, clientSecret: $clientSecret, subscriptionId: $subscriptionId, tenantId: $tenantId}')

echo "✅ Service Principal created"
echo ""

# Get publish profile
echo "📋 Downloading Azure publish profile..."
PUBLISH_PROFILE=$(az webapp deployment list-publishing-profiles \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --output xml)

echo "✅ Publish profile retrieved"
echo ""

# Build database URL
DATABASE_URL="postgresql://dbadmin:${DB_PASSWORD}@${DB_SERVER}.postgres.database.azure.com:5432/${DB_NAME}?schema=public&sslmode=require"
NEXTAUTH_URL="https://${APP_NAME}.azurewebsites.net"

echo "📝 Adding GitHub secrets..."
echo ""

# Add secrets using GitHub CLI
gh secret set AZURE_CREDENTIALS --body "$AZURE_CREDS" -R "$REPO"
echo "✅ Added AZURE_CREDENTIALS"

gh secret set AZURE_PUBLISH_PROFILE --body "$PUBLISH_PROFILE" -R "$REPO"
echo "✅ Added AZURE_PUBLISH_PROFILE"

gh secret set AZURE_APP_NAME --body "$APP_NAME" -R "$REPO"
echo "✅ Added AZURE_APP_NAME"

gh secret set DATABASE_URL --body "$DATABASE_URL" -R "$REPO"
echo "✅ Added DATABASE_URL"

gh secret set NEXTAUTH_SECRET --body "$NEXTAUTH_SECRET" -R "$REPO"
echo "✅ Added NEXTAUTH_SECRET"

gh secret set NEXTAUTH_URL --body "$NEXTAUTH_URL" -R "$REPO"
echo "✅ Added NEXTAUTH_URL"

echo ""
echo "✅ All secrets configured!"
echo ""
echo "📊 Summary:"
echo "  App Name: $APP_NAME"
echo "  Database: $DB_NAME @ $DB_SERVER"
echo "  Repository: $REPO"
echo "  Subscription: $SUBSCRIPTION_ID"
echo ""
echo "🚀 Next steps:"
echo "  1. Push to main branch: git push origin main"
echo "  2. Check GitHub Actions: Settings → Actions"
echo "  3. Monitor deployment in Azure Portal"
echo "  4. Access app at: https://${APP_NAME}.azurewebsites.net"
echo ""
echo "📖 For more info, see: GITHUB_ACTIONS_SETUP.md"

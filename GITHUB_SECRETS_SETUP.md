# GitHub Secrets Setup for Continuous Deployment

Your TaskFlow Pro app is now connected to GitHub and ready for continuous deployment! Follow these steps to configure GitHub Secrets for automated Azure deployment.

## Overview
The GitHub Actions workflows require 6 secrets to deploy automatically to Azure and PostgreSQL.

## Step 1: Access GitHub Secrets

1. Go to: **https://github.com/wilfridoperez/TaskFlowPro/settings/secrets/actions**
2. Click **"New repository secret"** for each secret below

## Step 2: Required Secrets

Add the following secrets to your GitHub repository:

### 1. `AZURE_CREDENTIALS` (Service Principal)
**Purpose:** Authenticate with Azure

**How to get it:**
```bash
# Run this Azure CLI command to generate credentials
az ad sp create-for-rbac \
  --name "TaskFlowPro-CI" \
  --role contributor \
  --scopes /subscriptions/{SUBSCRIPTION_ID} \
  --json-auth
```

**Value:** Copy the entire JSON output as-is

**Example format:**
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 2. `AZURE_PUBLISH_PROFILE` 
**Purpose:** Deploy to Azure App Service

**How to get it:**
1. Go to **Azure Portal** → **App Services** → Your app (e.g., `taskflow-pro-app`)
2. Click **Get publish profile** (top right button)
3. Open the downloaded `.PublishSettings` file in a text editor
4. Copy the entire file content

**Value:** Paste the entire XML content

### 3. `AZURE_APP_NAME`
**Purpose:** Name of your Azure App Service

**Value:** e.g., `taskflow-pro-app`

### 4. `DATABASE_URL`
**Purpose:** PostgreSQL connection string (production database)

**How to get it:**
1. Azure Portal → **Azure Database for PostgreSQL** → Your server
2. Click **Connection strings** tab
3. Copy the **PostgreSQL** connection string
4. Replace `{your_password}` with your actual password

**Value format:**
```
postgresql://username@servername:password@servername.postgres.database.azure.com:5432/taskflow_pro?schema=public
```

### 5. `NEXTAUTH_SECRET`
**Purpose:** Encryption key for NextAuth.js sessions

**How to generate:**
```bash
# Option 1: Using openssl
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Value:** Paste the generated string

### 6. `NEXTAUTH_URL`
**Purpose:** Production URL for authentication

**Value:** Your Azure app URL, e.g., `https://taskflow-pro-app.azurewebsites.net`

## Step 3: Adding Secrets to GitHub

For each secret:

1. Click **"New repository secret"**
2. Enter the **Name** (e.g., `AZURE_CREDENTIALS`)
3. Paste the **Value** in the secret field
4. Click **"Add secret"**

### Quick Reference Table

| Secret Name | Value | Example |
|------------|-------|---------|
| `AZURE_CREDENTIALS` | Service Principal JSON | `{"clientId":"...","clientSecret":"..."}` |
| `AZURE_PUBLISH_PROFILE` | XML from Azure | `<?xml version="1.0" ...` |
| `AZURE_APP_NAME` | App Service name | `taskflow-pro-app` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `NEXTAUTH_SECRET` | Base64 random string | `K8x/9...` |
| `NEXTAUTH_URL` | Production URL | `https://taskflow-pro-app.azurewebsites.net` |

## Step 4: Verify Setup

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. You should see all 6 secrets listed (values are hidden)
3. Click each to verify it's stored

## Step 5: Test Continuous Deployment

1. Make a small change to your code (e.g., update README.md)
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Test: Verify CI/CD workflow"
   git push origin main
   ```
3. Go to **https://github.com/wilfridoperez/TaskFlowPro/actions**
4. Watch the workflow run in real-time
5. Check deployment status and logs

## Workflows

Your repository includes 2 GitHub Actions workflows:

### 1. **Azure Deploy** (Full Pipeline)
- **File:** `.github/workflows/azure-deploy.yml`
- **Triggers:** Every push to `main` branch
- **Steps:**
  - Install dependencies
  - Run tests
  - Build application
  - Run Prisma migrations
  - Deploy to Azure App Service
  - Send Slack notification
- **Status:** ✅ Active

### 2. **Simple Deploy** (Quick Deployment)
- **File:** `.github/workflows/simple-deploy.yml`
- **Triggers:** Manual dispatch from Actions tab
- **Steps:**
  - Build and deploy only (faster)
- **Status:** ✅ Available

## Environment Variables in Azure

When deploying, the following env variables are required in Azure App Service:

1. Go to **Azure Portal** → **App Services** → Your app
2. Click **Configuration** → **Application settings**
3. Add these variables:

```
NEXTAUTH_SECRET = [value from GitHub secret]
NEXTAUTH_URL = https://your-app.azurewebsites.net
DATABASE_URL = postgresql://[connection string]
NODE_ENV = production
```

## Troubleshooting

### Workflow Fails: "Credentials not found"
- Verify `AZURE_CREDENTIALS` is set in GitHub Secrets
- Check that the JSON is valid and complete

### Deployment Fails: "Database connection error"
- Verify `DATABASE_URL` is correct in GitHub Secrets
- Test the connection string locally: `psql $DATABASE_URL`
- Check Azure PostgreSQL firewall rules

### NextAuth Login Fails in Production
- Verify `NEXTAUTH_URL` matches your Azure domain exactly
- Verify `NEXTAUTH_SECRET` is the same in GitHub and Azure

### Workflow Not Triggering
- Check that changes are pushed to `main` branch
- Verify branch protection rules aren't blocking
- Check workflow file syntax in `.github/workflows/`

## Security Best Practices

✅ **Do:**
- ✓ Keep secrets secure in GitHub (values are encrypted)
- ✓ Rotate `NEXTAUTH_SECRET` periodically
- ✓ Use strong Azure service principal credentials
- ✓ Review workflow logs for errors (but not sensitive data)

❌ **Don't:**
- ✗ Never commit `.env.local` or secrets to Git
- ✗ Never share GitHub Secrets URLs
- ✗ Never log secrets in workflow outputs
- ✗ Don't reuse service principals across projects

## Next Steps

After secrets are configured:

1. ✅ Make a test push to trigger the workflow
2. ✅ Monitor the GitHub Actions tab for deployment
3. ✅ Verify your app is live on Azure
4. ✅ Test login with credentials: `test@test.com` / `TestPassword123`
5. ✅ Set up custom domain (optional)
6. ✅ Enable monitoring and backups

## Documentation Files

- [QUICK_START.md](QUICK_START.md) - 5-minute setup overview
- [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) - Complete workflow reference
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - 15-step verification
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions

## Support

For detailed GitHub Actions documentation, see:
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Azure Login Action](https://github.com/Azure/login)
- [Azure App Service Deploy Action](https://github.com/Azure/webapps-deploy)

---

**Status:** 🚀 Ready for continuous deployment once secrets are configured

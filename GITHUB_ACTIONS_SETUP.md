# GitHub Actions Setup Guide for Azure Deployment

## 📋 Prerequisites

1. GitHub repository created and pushed
2. Azure subscription active
3. Azure App Service created
4. PostgreSQL database on Azure created
5. GitHub repository with admin access

---

## 🔐 Step 1: Create Azure Service Principal

This allows GitHub to authenticate with Azure:

```bash
# Get your Azure subscription ID
az account show --query id -o tsv

# Create service principal (replace with your subscription ID)
az ad sp create-for-rbac \
  --name github-taskflow-deploy \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --json-auth
```

You'll get output like:
```json
{
  "clientId": "xxxx-xxxx-xxxx",
  "clientSecret": "xxxx-xxxx-xxxx",
  "subscriptionId": "xxxx-xxxx-xxxx",
  "tenantId": "xxxx-xxxx-xxxx"
}
```

**Save this! You'll need it next.**

---

## 🔑 Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret" and add:

### **Required Secrets:**

| Secret Name | Value | Where to get |
|------------|-------|-------------|
| `AZURE_CREDENTIALS` | Full JSON from step 1 | Azure CLI output above |
| `AZURE_APP_NAME` | `taskflow-pro-app` | Azure Portal → App Service name |
| `AZURE_PUBLISH_PROFILE` | Publishing profile XML | See below |
| `DATABASE_URL` | PostgreSQL connection string | Azure Database properties |
| `NEXTAUTH_SECRET` | Generated secret (32 chars) | `openssl rand -base64 32` |

### **Get Azure Publish Profile:**

```bash
az webapp deployment list-publishing-profiles \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app \
  --output xml
```

Copy the entire XML output and paste into `AZURE_PUBLISH_PROFILE` secret.

### **Optional Secrets (for notifications):**

| Secret Name | Value |
|------------|-------|
| `SLACK_WEBHOOK` | Slack incoming webhook URL |
| `NOTIFY_EMAIL` | Your email for notifications |

---

## 📝 Step 3: Database Connection String Format

Your `DATABASE_URL` should be:

```
postgresql://username:password@server.postgres.database.azure.com:5432/taskflow?schema=public&sslmode=require
```

Example:
```
postgresql://dbadmin:MyPass123@taskflow-db.postgres.database.azure.com:5432/taskflow?schema=public&sslmode=require
```

Find these in Azure Portal:
- **Server:** Azure Database → Server name + `.postgres.database.azure.com`
- **Username:** `dbadmin@taskflow-db` (use the full qualified name)
- **Password:** Your database password
- **Database:** Your database name

---

## 🚀 Step 4: Configure App Service Environment Variables

The App Service needs environment variables set. GitHub Actions will deploy them, but you can also manually set in Azure:

```bash
az webapp config appsettings set \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app \
  --settings \
    DATABASE_URL="$DATABASE_URL" \
    NEXTAUTH_SECRET="your-secret" \
    NEXTAUTH_URL="https://taskflow-pro-app.azurewebsites.net" \
    NODE_ENV="production"
```

---

## 📦 Step 5: Update package.json

Ensure your `package.json` has the correct build and start commands:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint",
    "postinstall": "prisma generate"
  }
}
```

The `postinstall` hook runs after `npm install` and generates the Prisma client.

---

## ✅ Step 6: Test the Workflow

### **Manual Trigger:**
1. Go to GitHub repo → Actions
2. Select "Deploy to Azure" workflow
3. Click "Run workflow"
4. Monitor the execution

### **Automatic Trigger:**
Just push to `main` branch:
```bash
git add .
git commit -m "Setup Azure deployment"
git push origin main
```

---

## 📊 Workflow Explanation

The `azure-deploy.yml` does:

1. **On every push to main:**
   - Checks out code
   - Installs dependencies
   - Builds the Next.js app
   - Uploads build artifacts

2. **On main push only (production):**
   - Downloads build artifacts
   - Logs into Azure
   - Runs Prisma migrations
   - Deploys to Azure App Service
   - Sends Slack notification

3. **Pull requests:**
   - Runs tests and build (no deployment)

---

## 🔍 Monitoring Deployment

### **View logs in Azure:**
```bash
az webapp log tail \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app
```

### **View logs in GitHub:**
1. Actions → Select workflow run
2. Check jobs and step outputs
3. Look for errors in build or deploy steps

### **Common Issues:**

| Error | Solution |
|-------|----------|
| "Could not authenticate to Azure" | Check `AZURE_CREDENTIALS` secret is valid JSON |
| "Database connection failed" | Verify `DATABASE_URL` and firewall rules |
| "Migration failed" | Check PostgreSQL connection string |
| "Build failed" | Check `npm run build` works locally |
| "App not starting" | Check App Service logs: `az webapp log tail` |

---

## 🔄 Continuous Deployment Strategy

### **Recommended Branches:**

```
main (production)
  ↓
deploy-workflow runs automatically
  ↓
Azure App Service updated
```

### **For Development:**

Create a `develop` branch:
```bash
git checkout -b develop
git push origin develop
```

Then in `.github/workflows/azure-deploy.yml`, the workflow will test but not deploy when pushing to `develop`.

---

## 🛡️ Security Best Practices

✅ **DO:**
- Rotate secrets every 90 days
- Use strong passwords (20+ chars)
- Limit GitHub token permissions
- Use separate credentials for dev/prod
- Monitor deployment logs for errors

❌ **DON'T:**
- Commit secrets to GitHub
- Share credentials in Slack/email
- Use same password across environments
- Leave old secrets in GitHub

---

## 🧹 Cleanup Old Secrets

After rotating credentials:

1. GitHub: Settings → Secrets → Delete old secrets
2. Azure: Remove old service principals: `az ad sp delete --id {id}`

---

## 📞 Troubleshooting

### **Test Azure credentials locally:**
```bash
az login --service-principal \
  -u ${{ secrets.AZURE_CLIENT_ID }} \
  -p ${{ secrets.AZURE_CLIENT_SECRET }} \
  --tenant ${{ secrets.AZURE_TENANT_ID }}
```

### **Test database connection:**
```bash
psql "postgresql://user:pass@host:5432/db"
```

### **Test build locally:**
```bash
npm run build
```

### **View GitHub Actions logs:**
- GitHub → Actions → Select workflow → View logs

---

## 🎯 Next Steps

1. ✅ Add all secrets to GitHub
2. ✅ Verify App Service environment variables
3. ✅ Test workflow with manual trigger
4. ✅ Check deployment logs
5. ✅ Access app at `https://taskflow-pro-app.azurewebsites.net`

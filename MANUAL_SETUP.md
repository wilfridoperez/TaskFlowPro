# Manual GitHub Secrets Setup Guide

Use this if you prefer to set up secrets manually instead of using the automated script.

## 📋 Step 1: Create Azure Service Principal

```bash
# Get your subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Your subscription ID: $SUBSCRIPTION_ID"

# Create service principal with JSON output
az ad sp create-for-rbac \
  --name github-taskflow-deploy \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID \
  --json-auth
```

You'll get output like:
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Copy this entire JSON output - you'll paste it as a secret**

---

## 🔑 Step 2: Get Azure Publish Profile

```bash
# Replace with your resource group and app name
az webapp deployment list-publishing-profiles \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app \
  --output xml > publishsettings.xml

# View the file
cat publishsettings.xml
```

Copy the entire content (including XML tags).

---

## 🗄️ Step 3: Create Database Connection String

Format:
```
postgresql://username:password@server.postgres.database.azure.com:5432/database?schema=public&sslmode=require
```

Find in Azure Portal:
- Server: `taskflow-db.postgres.database.azure.com`
- Username: `dbadmin@taskflow-db`
- Password: Your chosen password
- Database: `taskflow`

Example:
```
postgresql://dbadmin@taskflow-db:MyPassword123@taskflow-db.postgres.database.azure.com:5432/taskflow?schema=public&sslmode=require
```

---

## 🔐 Step 4: Generate NEXTAUTH_SECRET

```bash
# Generate a secure random string
openssl rand -base64 32

# Output example:
# abc123def456ghi789jkl012mno345pqr678stu901
```

Save this value.

---

## 🚀 Step 5: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Add each secret:

| Secret Name | Value | Notes |
|------------|-------|-------|
| `AZURE_CREDENTIALS` | Entire JSON from step 1 | Paste as-is |
| `AZURE_PUBLISH_PROFILE` | XML from step 2 | Paste entire XML |
| `AZURE_APP_NAME` | `taskflow-pro-app` | Your app service name |
| `DATABASE_URL` | Connection string from step 3 | Include `?schema=public&sslmode=require` |
| `NEXTAUTH_SECRET` | String from step 4 | Keep this secret! |
| `NEXTAUTH_URL` | `https://taskflow-pro-app.azurewebsites.net` | Your app URL |

**For each secret:**
1. Click "New repository secret"
2. Name: Enter the secret name (e.g., `AZURE_CREDENTIALS`)
3. Secret: Paste the value
4. Click "Add secret"

---

## ✅ Verification Checklist

After adding all secrets, verify:

```bash
# Check all secrets are in your repo
# GitHub → Settings → Secrets and variables → Actions
# You should see 6 secrets:
# ✓ AZURE_CREDENTIALS
# ✓ AZURE_PUBLISH_PROFILE
# ✓ AZURE_APP_NAME
# ✓ DATABASE_URL
# ✓ NEXTAUTH_SECRET
# ✓ NEXTAUTH_URL
```

---

## 🧪 Step 6: Test the Workflow

1. Make a small change to your code
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "Test GitHub Actions deployment"
   git push origin main
   ```

3. Go to **GitHub → Actions**
4. Select the **Deploy to Azure** workflow
5. Watch the execution

---

## 📊 Workflow Options

Choose one:

### **Option A: Full Workflow** (recommended)
Use: `.github/workflows/azure-deploy.yml`
- Runs tests on all branches
- Deploys only on `main` push
- Sends Slack notifications
- Best for production

### **Option B: Simple Workflow**
Use: `.github/workflows/simple-deploy.yml`
- Minimal configuration
- Faster execution
- Good for small teams

---

## 🔄 Re-Generate Secrets

If you need to rotate credentials:

```bash
# Delete old service principal
az ad sp delete --id <old-client-id>

# Create new one
az ad sp create-for-rbac \
  --name github-taskflow-deploy-new \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID \
  --json-auth
```

Then update GitHub secret `AZURE_CREDENTIALS`.

---

## 🆘 Troubleshooting

### Secret not working?
1. Copy the exact value (no extra spaces)
2. Secrets are case-sensitive
3. GitHub needs 30 seconds to sync secrets

### Build fails with "DATABASE_URL not found"?
- Verify `DATABASE_URL` secret exists
- Check spelling matches exactly

### Deployment fails with "unauthorized"?
- Regenerate `AZURE_CREDENTIALS`
- Make sure service principal has `contributor` role

### App crashes after deployment?
- Check App Service logs: `az webapp log tail -g taskflow-pro-rg -n taskflow-pro-app`
- Verify all environment variables are set
- Check Prisma migrations ran successfully

---

## 📖 Next Steps

1. ✅ Complete all steps above
2. ✅ Push code to `main` branch
3. ✅ Monitor GitHub Actions
4. ✅ Check Azure Portal for successful deployment
5. ✅ Test app at `https://taskflow-pro-app.azurewebsites.net`

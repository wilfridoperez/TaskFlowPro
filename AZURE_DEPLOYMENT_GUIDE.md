# TaskFlow Pro - Azure Deployment Guide

> Your app service "TaskFlowPro" is already running on Azure! Now we need to complete the deployment setup.

## 📋 Current Status
✅ Azure App Service created: `TaskFlowPro`
✅ Prisma schema updated to PostgreSQL
⏳ Environment variables need configuration
⏳ Database deployment needed
⏳ Application code deployment needed

---

## 🔧 Step-by-Step Deployment

### **STEP 1: Verify/Create PostgreSQL Database on Azure**

If you don't have a PostgreSQL database yet:

```bash
# Option A: Use Azure CLI to create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group TaskFlowPro \
  --name taskflowpro-db \
  --location eastus \
  --admin-user dbadmin \
  --admin-password YourSecurePassword123! \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32

# Get the connection string (you'll need this)
az postgres flexible-server connection-string show \
  --server-name taskflowpro-db \
  --database-name taskflowpro
```

Or create via Azure Portal: `Azure Database for PostgreSQL - Flexible Server`

### **STEP 2: Get Database Connection String**

Format: `postgresql://username:password@hostname:5432/databasename`

Example:
```
postgresql://dbadmin:YourPassword@taskflowpro-db.postgres.database.azure.com:5432/taskflowpro
```

### **STEP 3: Generate Required Secrets**

```bash
# Generate NEXTAUTH_SECRET (secure random key)
openssl rand -base64 32

# Save the output - you'll need it for Step 4
```

### **STEP 4: Configure Environment Variables in Azure**

**Via Azure Portal:**
1. Go to: **Azure Portal** → **App Services** → **TaskFlowPro**
2. Click: **Configuration** → **Application settings**
3. Add these variables (click **+ New application setting** for each):

| Name | Value | Notes |
|------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | From Step 2 |
| `NEXTAUTH_SECRET` | Random 32-byte key | From Step 3 |
| `NEXTAUTH_URL` | `https://taskflowpro.azurewebsites.net` | Your Azure domain |
| `STRIPE_PUBLIC_KEY` | `pk_test_...` | From Stripe Dashboard |
| `STRIPE_SECRET_KEY` | `sk_test_...` | From Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe Dashboard |
| `NODE_ENV` | `production` | - |

4. Click **Save** at the top

### **STEP 5: Deploy Code to Azure**

#### **Option A: Using Azure Portal (Web Deploy)**

```bash
# Download the publish profile from Azure Portal
# 1. Go to App Service → Overview
# 2. Click "Get publish profile"
# 3. Save the .PublishSettings file

# Deploy using Visual Studio Code
# 1. Install "Azure App Service" extension
# 2. Sign in with your Azure account
# 3. Right-click the app → Deploy to Web App
# 4. Select your subscription & app service
```

#### **Option B: Using GitHub Actions (Recommended)**

We've already set up GitHub Actions workflow. You need:

1. **Create GitHub Secrets:**
   - Go to: `https://github.com/wilfridoperez/TaskFlowPro/settings/secrets/actions`
   - Add these secrets:

```bash
# 1. AZURE_PUBLISH_PROFILE
# Download from Azure Portal → App Service → Get publish profile
# Paste the entire XML content

# 2. Create if not exists:
AZURE_CREDENTIALS
# Run this to generate:
az ad sp create-for-rbac --name TaskFlowPro-CI --role contributor \
  --scopes /subscriptions/{YOUR_SUBSCRIPTION_ID} --json-auth
# Copy the entire JSON output

NEXTAUTH_SECRET  # Use the one from Step 3
DATABASE_URL     # From Step 2
NEXTAUTH_URL     # https://taskflowpro.azurewebsites.net
```

2. **Push to trigger deployment:**
```bash
git add .
git commit -m "Update Prisma schema for PostgreSQL and Azure deployment"
git push origin main
# GitHub Actions will automatically deploy!
```

#### **Option C: Using Azure CLI**

```bash
# Build the application
npm run build

# Deploy to Azure using WebDeploy
az webapp deployment source config-zip \
  --resource-group TaskFlowPro \
  --name TaskFlowPro \
  --src dist.zip
```

### **STEP 6: Run Database Migrations**

After deployment, run Prisma migrations:

```bash
# SSH into your App Service to run migrations
# Or run locally, then deploy

# Generate and run migrations
npx prisma migrate deploy

# Or seed the database
node prisma/seed.js
```

**Note:** You can run migrations in Azure Cloud Shell:
```bash
# SSH into app service via Azure Portal or:
az webapp ssh --resource-group TaskFlowPro --name TaskFlowPro

# Once connected:
cd /home/site/wwwroot
npx prisma migrate deploy
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] App loads at `https://taskflowpro.azurewebsites.net`
- [ ] Sign-up page works
- [ ] Database connection successful (check Application Insights logs)
- [ ] Authentication flow completes
- [ ] Stripe payment page loads
- [ ] No console errors in Application Insights

### **Check Logs in Azure:**

1. **Real-time logs:**
   - Azure Portal → App Service → Log stream
   
2. **Application Insights:**
   - Azure Portal → Application Insights → Logs
   - Query: `traces | order by timestamp desc`

3. **SSH Access:**
   ```bash
   az webapp ssh --resource-group TaskFlowPro --name TaskFlowPro
   ```

---

## 🚀 Deployment Scenarios

### Scenario 1: First-Time Deployment
1. Create PostgreSQL database (Step 1)
2. Get connection string (Step 2)
3. Generate secrets (Step 3)
4. Configure environment variables (Step 4)
5. Deploy code (Step 5)
6. Run migrations (Step 6)
7. Test everything (Verification)

### Scenario 2: Code Updates Only
```bash
git push origin main
# GitHub Actions automatically deploys
```

### Scenario 3: Environment Variable Changes
1. Update in Azure Portal
2. Restart the app service
3. No redeployment needed

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to database"
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL server firewall rules allow App Service IP
- Verify database name matches

### Issue: "Application won't start"
- Check Application Insights logs for errors
- Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set
- Ensure all required environment variables exist

### Issue: "502 Bad Gateway"
- App service might be starting, wait 30 seconds
- Check Application Insights
- Review deployment logs in Azure Portal

### Issue: "NextAuth session not working"
- Verify `NEXTAUTH_SECRET` is a valid 32-byte string
- Verify `NEXTAUTH_URL` matches your Azure domain exactly
- Clear browser cookies and try again

---

## 📊 Next Steps

After successful deployment:

1. **Set up monitoring:**
   - Enable Application Insights alerts
   - Set up Azure Monitor dashboard
   - Configure error notifications

2. **Configure domain:**
   - Add custom domain in App Service settings
   - Update `NEXTAUTH_URL` to match custom domain

3. **Enable CI/CD:**
   - GitHub Actions already configured
   - Every push to `main` triggers deployment

4. **Scale up when needed:**
   - Change App Service Plan (SKU) as traffic grows
   - Enable auto-scale rules

---

## 📞 Support

For issues:
1. Check Application Insights → Logs
2. Review deployment logs in GitHub Actions
3. Verify all environment variables are set
4. Check Azure Monitor for service health

**Happy deploying! 🎉**

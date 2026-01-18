# Azure Deployment Checklist - TaskFlow Pro

## ✅ Quick Deployment Steps

### Phase 1: Pre-Deployment (Do This First)
- [ ] **Database**: Create PostgreSQL Flexible Server in Azure (or verify it exists)
- [ ] **Connection String**: Get PostgreSQL connection string from Azure
- [ ] **Secret Key**: Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] **Environment Variables**: Add to Azure App Service Configuration

### Phase 2: Code Deployment
- [ ] **Commit Changes**: 
  ```bash
  cd /Users/wilfridoperez/Development/Projects\ -\ 2026/taskflow-pro
  git add .
  git commit -m "Configure for Azure: Update Prisma to PostgreSQL"
  git push origin main
  ```
- [ ] **Monitor Deployment**: Check GitHub Actions workflow progress
- [ ] **Verify Deployment**: Check Azure Portal for deployment status

### Phase 3: Database Setup
- [ ] **Run Migrations**: 
  ```bash
  npx prisma migrate deploy
  ```
  OR via Azure SSH
- [ ] **Seed Database**: 
  ```bash
  node prisma/seed.js
  ```

### Phase 4: Verification
- [ ] **Test App**: Visit `https://taskflowpro.azurewebsites.net`
- [ ] **Test Auth**: Try sign-up and login
- [ ] **Check Logs**: Review Application Insights for errors
- [ ] **Test Database**: Create a project to verify DB connection
- [ ] **Test Payments**: Verify Stripe integration loads

---

## 🔐 Required Environment Variables

Add these to Azure App Service → Configuration → Application settings:

| Variable | Example Value | Where to Get |
|----------|---------------|--------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Azure Portal → PostgreSQL Server |
| `NEXTAUTH_SECRET` | 32-byte random string | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://taskflowpro.azurewebsites.net` | Your Azure App Service URL |
| `STRIPE_PUBLIC_KEY` | `pk_test_...` | Stripe Dashboard |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard |
| `NODE_ENV` | `production` | Set to production |

---

## 📱 How to Add Environment Variables in Azure

1. **Open Azure Portal**: https://portal.azure.com
2. **Navigate**: Resource Groups → TaskFlowPro → TaskFlowPro (App Service)
3. **Click**: Configuration (left sidebar)
4. **Click**: Application settings tab
5. **For each variable**: Click **+ New application setting**
   - Name: Variable name
   - Value: Variable value
   - Deployment slot setting: (leave unchecked)
6. **Click**: Save (at the top)
7. **Confirm**: Dialog will appear asking if you want to restart the app
8. **Click**: Continue (to apply changes and restart)

---

## 🚀 One-Command Deployment (After Variables Are Set)

```bash
# Navigate to project
cd /Users/wilfridoperez/Development/Projects\ -\ 2026/taskflow-pro

# Commit and push to trigger GitHub Actions
git add .
git commit -m "Deploy to Azure"
git push origin main

# Watch deployment:
# Go to: https://github.com/wilfridoperez/TaskFlowPro/actions
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **"502 Bad Gateway"** | Wait 2-3 minutes for app to start, then refresh |
| **Database connection error** | Check DATABASE_URL is correct, verify firewall rules |
| **NextAuth not working** | Verify NEXTAUTH_SECRET and NEXTAUTH_URL are set |
| **Can't see logs** | Go to: App Service → Log stream (real-time logs) |
| **App won't restart** | Try: Resource Groups → TaskFlowPro → Restart |

---

## 📞 Support Resources

- **Azure App Service Logs**: Azure Portal → App Service → Log stream
- **Application Insights**: Azure Portal → Application Insights → Logs
- **GitHub Actions**: https://github.com/wilfridoperez/TaskFlowPro/actions
- **Troubleshooting Guide**: See AZURE_DEPLOYMENT_GUIDE.md

---

**Status**: Ready for deployment! 🚀

**Next**: Add environment variables to Azure, then commit and push code.

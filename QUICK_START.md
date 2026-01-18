# 🚀 Quick Start: GitHub Actions to Azure Deployment

## ✅ 5-Minute Setup Checklist

Complete these steps in order:

---

## Step 1: Create Azure Service Principal (2 min)

```bash
# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Create service principal
az ad sp create-for-rbac \
  --name github-taskflow-deploy \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID \
  --json-auth
```

**Copy the entire JSON output**

---

## Step 2: Get Azure Publish Profile (1 min)

```bash
az webapp deployment list-publishing-profiles \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app \
  --output xml
```

**Copy the entire XML output**

---

## Step 3: Generate NextAuth Secret (1 min)

```bash
openssl rand -base64 32
```

**Copy the output**

---

## Step 4: Add GitHub Secrets (1 min)

GitHub → Repository → Settings → Secrets and variables → Actions

Add 6 secrets:

| Name | Value |
|------|-------|
| `AZURE_CREDENTIALS` | JSON from Step 1 |
| `AZURE_PUBLISH_PROFILE` | XML from Step 2 |
| `AZURE_APP_NAME` | taskflow-pro-app |
| `DATABASE_URL` | postgresql://user:pass@server.postgres.database.azure.com:5432/taskflow?schema=public&sslmode=require |
| `NEXTAUTH_SECRET` | From Step 3 |
| `NEXTAUTH_URL` | https://taskflow-pro-app.azurewebsites.net |

---

## Step 5: Deploy (automatic)

```bash
git add .
git commit -m "Setup GitHub Actions deployment"
git push origin main
```

**That's it! GitHub Actions will automatically:**
1. Build your app
2. Run migrations
3. Deploy to Azure
4. Notify you when done

---

## 📊 Monitor Deployment

1. **GitHub:** Actions tab → Select workflow run → Watch logs
2. **Azure:** App Service → Activity log
3. **App:** https://taskflow-pro-app.azurewebsites.net

---

## ✅ Verify Success

```bash
# Check deployment in Azure
az webapp deployment list \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app

# View app logs
az webapp log tail \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app

# Or just visit your app
# https://taskflow-pro-app.azurewebsites.net
```

---

## 🔐 Important: Protect Your Secrets

- ✅ Never commit secrets to GitHub
- ✅ Never share credentials in chat/email
- ✅ Rotate secrets every 90 days
- ✅ Use strong passwords (20+ chars)
- ✅ Delete old service principals

---

## 🆘 Issues?

See detailed guides:
- **Manual Setup:** [MANUAL_SETUP.md](MANUAL_SETUP.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Full Guide:** [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)

---

## 🎯 What Happens on Each Push to Main

```
git push origin main
         ↓
GitHub Actions triggered
         ↓
1. Install dependencies (npm ci)
2. Build app (npm run build)
3. Download build artifacts
4. Login to Azure
5. Run Prisma migrations
6. Deploy to Azure App Service
7. Send notification
         ↓
Your app is live! 🎉
```

---

## 📞 Next Steps

- [ ] Complete all 5 steps above
- [ ] Push to main branch
- [ ] Monitor GitHub Actions (5-10 min deployment)
- [ ] Test app at your Azure URL
- [ ] Set up custom domain (optional)
- [ ] Configure backups (optional)
- [ ] Enable monitoring (optional)

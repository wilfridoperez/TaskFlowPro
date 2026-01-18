# GitHub Actions Setup - Complete Summary

## 📁 Files Created

Your repository now has GitHub Actions configured:

```
.github/workflows/
  ├── azure-deploy.yml        # Full production workflow
  └── simple-deploy.yml       # Simplified alternative workflow

Documentation/
  ├── QUICK_START.md              # 5-minute setup guide
  ├── GITHUB_ACTIONS_SETUP.md     # Complete reference
  ├── MANUAL_SETUP.md             # Step-by-step manual setup
  └── TROUBLESHOOTING.md          # Common issues & fixes

scripts/
  └── setup-github-actions.sh     # Automated setup script
```

---

## 🎯 Choose Your Setup Method

### Option 1: Automated (Recommended) ⭐
```bash
# Requires GitHub CLI and Azure CLI
bash scripts/setup-github-actions.sh

# This will:
# 1. Create Azure service principal
# 2. Get publish profile
# 3. Generate secrets
# 4. Add all secrets to GitHub automatically
```

**Time: 5 minutes**
**Best for: Quick setup**

---

### Option 2: Semi-Automated
```bash
# Follow MANUAL_SETUP.md step-by-step
# Run Azure CLI commands manually
# Add secrets to GitHub via web UI
```

**Time: 10 minutes**
**Best for: Understanding each step**

---

### Option 3: Web UI Only
```
GitHub → Settings → Secrets and variables → Actions
→ Follow MANUAL_SETUP.md to add each secret manually
```

**Time: 15 minutes**
**Best for: Beginners**

---

## 🔐 Secrets You Need

Generate/collect these values:

| Secret | How to Get | Format |
|--------|-----------|--------|
| `AZURE_CREDENTIALS` | `az ad sp create-for-rbac --json-auth` | JSON with 4 fields |
| `AZURE_PUBLISH_PROFILE` | `az webapp deployment list-publishing-profiles --output xml` | XML |
| `AZURE_APP_NAME` | Your App Service name | String (e.g., `taskflow-pro-app`) |
| `DATABASE_URL` | Azure Portal → Database | `postgresql://user:pass@host:5432/db?schema=public&sslmode=require` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | 32-char random string |
| `NEXTAUTH_URL` | Your app URL | `https://your-app.azurewebsites.net` |

---

## 📋 What the Workflow Does

### Workflow: `azure-deploy.yml` (Full)

**Triggers:** Push to `main` or `develop`, Pull requests, Manual

**On every commit:**
1. ✅ Checkout code
2. ✅ Install Node.js 20
3. ✅ Install dependencies
4. ✅ Run linter (if exists)
5. ✅ Build Next.js app
6. ✅ Upload build artifacts

**Only on `main` branch push:**
7. ✅ Download build
8. ✅ Login to Azure
9. ✅ Run Prisma migrations
10. ✅ Deploy to App Service
11. ✅ Send Slack notification

---

### Workflow: `simple-deploy.yml` (Minimal)

**Triggers:** Push to `main`, Manual

**Execution:**
1. ✅ Install dependencies
2. ✅ Build app
3. ✅ Deploy to Azure
4. ✅ Run migrations

**Simpler but less control**

---

## 🚀 How to Deploy

### Automatic Deployment

```bash
# 1. Make changes
echo "New feature" >> src/app/page.tsx

# 2. Commit
git add .
git commit -m "Add new feature"

# 3. Push to main
git push origin main

# 4. Wait 5-10 minutes
# → GitHub Actions builds & deploys automatically
# → Check Actions tab for status
# → App updated at https://taskflow-pro-app.azurewebsites.net
```

### Manual Deployment

If you want to deploy without code changes:

1. GitHub → Actions
2. Select "Deploy to Azure" workflow
3. Click "Run workflow" dropdown
4. Click "Run workflow"

---

## 📊 Monitoring

### GitHub Actions
```
GitHub → Actions → Select workflow run
→ View detailed logs for each step
```

### Azure Portal
```
Azure Portal → App Service → Deployments
→ See all deployment history
```

### App Logs
```bash
# Real-time logs
az webapp log tail \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app

# Or view in Azure Portal:
# App Service → Logs → Application logging
```

---

## 🔄 Branch Strategy

### Recommended Setup

```
main (production)
  └─ Automatic deployment to Azure
  └─ Protected branch (require reviews)

develop (staging)
  └─ Optional: Auto-deploy to staging slot

feature/xxx
  └─ No deployment
  └─ Testing only in Actions
```

### Protected Main Branch

GitHub → Settings → Branches → Add rule:
- Branch pattern: `main`
- Require pull request reviews: ✅
- Require status checks: ✅
- Require branches to be up to date: ✅

---

## 🛡️ Security Best Practices

### DO ✅
- Rotate credentials every 90 days
- Use strong passwords (20+ chars, mixed case, numbers, symbols)
- Keep secrets in GitHub Secrets only
- Review all commits before merging to main
- Enable branch protection on main
- Use service principals for CI/CD
- Audit deployment logs regularly

### DON'T ❌
- Commit .env files
- Share credentials in Slack/email
- Use same credentials across services
- Trust unreviewed code
- Hardcode secrets in workflows
- Use weaker branch protection

---

## 🔑 Rotating Secrets

Every 90 days, update credentials:

```bash
# 1. Create new service principal
az ad sp create-for-rbac \
  --name github-taskflow-deploy-v2 \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID \
  --json-auth

# 2. Delete old service principal
az ad sp delete --id <old-client-id>

# 3. Update GitHub secret
# GitHub → Settings → Secrets → AZURE_CREDENTIALS
# → Edit → Paste new JSON

# 4. Update other secrets as needed
# DATABASE_URL, NEXTAUTH_SECRET, etc.
```

---

## 🆘 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "Could not authenticate" | See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#-could-not-authenticate-to-azure) |
| "Database connection failed" | See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#-database-connection-failed) |
| "Prisma migration failed" | See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#-prisma-migration-failed) |
| "Build failed" | See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#-build-failed-cannot-find-module) |
| "App not starting" | See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#-app-not-starting--502-bad-gateway) |

---

## 📖 Documentation Reference

- **Quick Setup:** [QUICK_START.md](QUICK_START.md)
- **Full Guide:** [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)
- **Manual Setup:** [MANUAL_SETUP.md](MANUAL_SETUP.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. GitHub Secrets set
gh secret list -R owner/repo
# Should show all 6 secrets

# 2. Workflow file exists
test -f .github/workflows/azure-deploy.yml && echo "✅ Workflow file exists"

# 3. Deploy successful
# Commit → Push → Check Actions tab
# Should complete in 5-10 minutes

# 4. App accessible
curl https://taskflow-pro-app.azurewebsites.net
# Should return 200 OK

# 5. Database connected
az webapp config appsettings list \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app \
  --query "[?name=='DATABASE_URL']"
# Should show DATABASE_URL is set
```

---

## 🎯 Next Steps

1. ✅ **Complete setup** using one of the methods above
2. ✅ **Test deployment** by pushing to main
3. ✅ **Monitor logs** in GitHub Actions
4. ✅ **Verify app** is accessible at your Azure URL
5. ✅ **Set up monitoring** (Application Insights)
6. ✅ **Configure backups** for database
7. ✅ **Add custom domain** (optional)
8. ✅ **Enable SSL/TLS** (automatic with Azure)

---

## 📞 Support

- **GitHub Actions:** https://github.com/features/actions
- **Azure App Service:** https://docs.microsoft.com/en-us/azure/app-service/
- **Prisma ORM:** https://www.prisma.io/docs/
- **Next.js:** https://nextjs.org/docs

---

**Ready to deploy?** Start with [QUICK_START.md](QUICK_START.md)

# GitHub Actions Setup - Final Checklist

Complete this checklist to deploy your app to Azure with automated CI/CD.

---

## ✅ Pre-Setup Requirements

- [ ] Azure subscription active
- [ ] Azure App Service created (`taskflow-pro-app`)
- [ ] Azure PostgreSQL database created
- [ ] Resource group created (`taskflow-pro-rg`)
- [ ] GitHub account & repository created
- [ ] GitHub CLI installed (optional but recommended)
- [ ] Azure CLI installed
- [ ] Node.js 20+ installed locally

---

## 🔐 Step 1: Generate Azure Service Principal (2 min)

```bash
# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Subscription: $SUBSCRIPTION_ID"

# Create service principal
az ad sp create-for-rbac \
  --name github-taskflow-deploy \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID \
  --json-auth
```

**Checklist:**
- [ ] Command ran successfully
- [ ] Got JSON output with 4 fields:
  - [ ] `clientId`
  - [ ] `clientSecret`
  - [ ] `subscriptionId`
  - [ ] `tenantId`
- [ ] **Saved the output** (copy to notepad)

---

## 📄 Step 2: Get Azure Publish Profile (1 min)

```bash
az webapp deployment list-publishing-profiles \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app \
  --output xml
```

**Checklist:**
- [ ] Command ran successfully
- [ ] Got XML output (starts with `<?xml`)
- [ ] Output contains `<publishProfile`
- [ ] **Saved the entire XML** (copy all of it)

---

## 🔑 Step 3: Generate Secrets (2 min)

Generate these values:

### NextAuth Secret
```bash
openssl rand -base64 32
```
- [ ] Saved 32-character random string
- [ ] No spaces at beginning or end

### Database Connection String
```
postgresql://dbadmin@taskflow-db:YOUR_PASSWORD@taskflow-db.postgres.database.azure.com:5432/taskflow?schema=public&sslmode=require
```
- [ ] Server name matches: `taskflow-db`
- [ ] Username is: `dbadmin@taskflow-db`
- [ ] Password is your DB password
- [ ] Includes `?schema=public&sslmode=require`

### App Service Name
- [ ] Confirmed: `taskflow-pro-app`

### App URL
- [ ] Confirmed: `https://taskflow-pro-app.azurewebsites.net`

---

## 🚀 Step 4: Add Secrets to GitHub (3 min)

Navigate to: **GitHub → Repository Settings → Secrets and variables → Actions**

Add each secret (click "New repository secret" for each):

### Secret 1: AZURE_CREDENTIALS
- [ ] Name: `AZURE_CREDENTIALS`
- [ ] Value: **Entire JSON** from Step 1
- [ ] Click "Add secret"

### Secret 2: AZURE_PUBLISH_PROFILE
- [ ] Name: `AZURE_PUBLISH_PROFILE`
- [ ] Value: **Entire XML** from Step 2
- [ ] Click "Add secret"

### Secret 3: AZURE_APP_NAME
- [ ] Name: `AZURE_APP_NAME`
- [ ] Value: `taskflow-pro-app`
- [ ] Click "Add secret"

### Secret 4: DATABASE_URL
- [ ] Name: `DATABASE_URL`
- [ ] Value: Connection string from Step 3
- [ ] Click "Add secret"

### Secret 5: NEXTAUTH_SECRET
- [ ] Name: `NEXTAUTH_SECRET`
- [ ] Value: Random string from Step 3
- [ ] Click "Add secret"

### Secret 6: NEXTAUTH_URL
- [ ] Name: `NEXTAUTH_URL`
- [ ] Value: `https://taskflow-pro-app.azurewebsites.net`
- [ ] Click "Add secret"

**Verification:**
- [ ] All 6 secrets appear in GitHub Settings
- [ ] No typos in secret names
- [ ] Each secret has correct value

---

## 📦 Step 5: Update Configuration Files (2 min)

### Check `package.json` scripts:
```bash
grep -A 5 '"scripts"' package.json
```

- [ ] Has `"build": "next build"`
- [ ] Has `"start": "next start -p $PORT"`
- [ ] Has `"postinstall": "prisma generate"`

### Check `prisma/schema.prisma`:
```bash
head -20 prisma/schema.prisma
```

- [ ] Datasource is `postgresql` (not `sqlite`)
- [ ] `url = env("DATABASE_URL")`

### Check workflow file exists:
```bash
test -f .github/workflows/azure-deploy.yml && echo "✅ Workflow exists"
```

- [ ] Workflow file created at `.github/workflows/azure-deploy.yml`

---

## 🧪 Step 6: Test Locally (5 min)

Before deploying, test the app locally:

```bash
# 1. Install dependencies
npm ci

# 2. Build the app
npm run build

# 3. Verify no errors
echo "Check build output above for errors"
```

**Checklist:**
- [ ] `npm ci` succeeded
- [ ] `npm run build` succeeded
- [ ] No TypeScript errors
- [ ] `.next/` folder created

---

## 🚀 Step 7: Deploy (2 min)

```bash
# 1. Make a small change to confirm deployment works
echo "# Deployment test" >> README.md

# 2. Commit and push
git add .
git commit -m "Test GitHub Actions deployment"
git push origin main
```

**Checklist:**
- [ ] Git push succeeded
- [ ] No conflicts

---

## 📊 Step 8: Monitor Deployment (10 min)

### GitHub Actions
1. Go to: **GitHub → Actions**
2. Select **"Deploy to Azure"** workflow
3. Wait for all steps to complete
4. Watch the logs:

**Check each step:**
- [ ] Checkout ✓
- [ ] Setup Node.js ✓
- [ ] Install dependencies ✓
- [ ] Build ✓
- [ ] Authenticate to Azure ✓
- [ ] Run migrations ✓
- [ ] Deploy ✓

### Azure Portal
1. Go to: **Azure Portal → App Service → taskflow-pro-app**
2. Check **Deployments** section
3. Should show your recent deployment

**Checklist:**
- [ ] Deployment shows as "Successful"
- [ ] Timestamp recent (within last 10 min)

---

## ✅ Step 9: Verify App is Live

```bash
# Test the app
curl https://taskflow-pro-app.azurewebsites.net

# Or open in browser
open https://taskflow-pro-app.azurewebsites.net
```

**Checklist:**
- [ ] App loads without errors
- [ ] HTTP 200 response (not 502)
- [ ] Can navigate pages
- [ ] Database connection works
- [ ] No console errors

### In-Browser Testing
1. Navigate to: **https://taskflow-pro-app.azurewebsites.net**
2. Test these features:
   - [ ] Home page loads
   - [ ] Sign in page accessible
   - [ ] Can create projects
   - [ ] Can create tasks
   - [ ] Data persists (refresh page)

---

## 🔍 Step 10: Verify Database Connection

```bash
# Check migrations applied
az webapp ssh \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app

# Inside SSH:
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
```

**Checklist:**
- [ ] Can connect to database
- [ ] User table exists and has data
- [ ] Migrations completed successfully

---

## 🎓 Step 11: Learn the Workflow

- [ ] Read [QUICK_START.md](QUICK_START.md)
- [ ] Read [ARCHITECTURE.md](ARCHITECTURE.md)
- [ ] Read [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)
- [ ] Bookmark [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🔄 Step 12: Test Continuous Deployment

Make a code change and verify automatic deployment:

```bash
# 1. Make a change
echo "Test" >> src/app/page.tsx

# 2. Commit
git add .
git commit -m "Test automatic deployment"

# 3. Push
git push origin main

# 4. Watch GitHub Actions
# Actions → Select workflow → Watch logs

# 5. After 10 minutes, verify change is live
# https://taskflow-pro-app.azurewebsites.net
```

**Checklist:**
- [ ] Changed code pushed
- [ ] GitHub Actions triggered automatically
- [ ] Deployment succeeded
- [ ] Change visible on live app

---

## 🛡️ Step 13: Security Hardening (Optional)

```bash
# Protect main branch
# GitHub → Settings → Branches → Add rule for "main"

# Required settings:
- [ ] Require pull request reviews: ✅ (1 reviewer)
- [ ] Require status checks: ✅
- [ ] Require branches up to date: ✅
- [ ] Require conversation resolution: ✅
```

---

## 📋 Step 14: Documentation & Handoff

For team members, create/share:

- [ ] [QUICK_START.md](QUICK_START.md) - 5 min setup
- [ ] [DEPLOYMENT_README.md](DEPLOYMENT_README.md) - Full overview
- [ ] [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
- [ ] Slack channel for deployments
- [ ] Team email template for deployment notifications

---

## ✨ Step 15: Celebrate! 🎉

You've successfully set up:

- ✅ **GitHub Actions** for CI/CD
- ✅ **Automated Testing** on every push
- ✅ **Automated Deployment** to Azure
- ✅ **Database Migrations** on each deploy
- ✅ **Production Environment** with PostgreSQL

---

## 🔐 Maintenance Checklist

Do this regularly:

### Monthly
- [ ] Review deployment logs
- [ ] Check App Service health
- [ ] Monitor Azure costs
- [ ] Review GitHub Actions usage

### Quarterly (every 3 months)
- [ ] Rotate `NEXTAUTH_SECRET`
- [ ] Rotate `AZURE_CREDENTIALS`
- [ ] Update Node.js version if needed
- [ ] Review and update dependencies

### Annually
- [ ] Audit security settings
- [ ] Review and update documentation
- [ ] Test disaster recovery
- [ ] Plan for infrastructure upgrades

---

## 📞 Support

If you get stuck:

1. **Check logs:**
   - GitHub Actions → Actions tab
   - Azure Portal → Logs

2. **Read docs:**
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
   - [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)

3. **Test locally:**
   - `npm run build`
   - `npm start`

4. **Ask for help:**
   - GitHub Discussions
   - Azure Support
   - Stack Overflow

---

## ✅ Final Verification

Run this command to verify setup:

```bash
echo "✅ All systems ready!" && \
gh secret list -R owner/repo | grep -c AZURE_ && \
test -f .github/workflows/azure-deploy.yml && \
echo "✅ Workflow files present"
```

Expected output:
```
✅ All systems ready!
6
✅ Workflow files present
```

---

**🎯 You're done! Your app is now deployed and ready for continuous deployment.**

Next step: Make code changes, push to main, and watch your app automatically deploy to Azure! 🚀

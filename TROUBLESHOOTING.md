# GitHub Actions Troubleshooting Guide

## Common Deployment Issues & Solutions

### 🔴 "Could not authenticate to Azure"

**Cause:** Invalid `AZURE_CREDENTIALS` secret

**Solution:**
```bash
# Verify your service principal works
az login --service-principal \
  -u your-client-id \
  -p your-client-secret \
  --tenant your-tenant-id

# If it fails, create a new service principal
az ad sp create-for-rbac \
  --name github-taskflow-deploy \
  --role contributor \
  --scopes /subscriptions/your-subscription-id \
  --json-auth

# Copy the entire JSON output to AZURE_CREDENTIALS secret
```

**Checklist:**
- ✅ JSON is valid (use jsonlint to verify)
- ✅ All 4 fields present: clientId, clientSecret, subscriptionId, tenantId
- ✅ No extra spaces or newlines
- ✅ Service principal has `contributor` role

---

### 🔴 "Database connection failed"

**Cause:** Invalid `DATABASE_URL` or firewall issues

**Solution:**

1. **Verify connection string format:**
   ```
   postgresql://dbadmin@serverName:password@server.postgres.database.azure.com:5432/dbname?schema=public&sslmode=require
   ```

2. **Test connection locally:**
   ```bash
   # Install psql first
   brew install postgresql  # macOS
   
   # Test connection
   psql "postgresql://dbadmin@taskflow-db:password@taskflow-db.postgres.database.azure.com:5432/taskflow?sslmode=require"
   ```

3. **Add firewall rules:**
   ```bash
   # Allow GitHub Actions runners (0.0.0.0 = allow all)
   az postgres server firewall-rule create \
     --resource-group taskflow-pro-rg \
     --server-name taskflow-db \
     --name AllowAllIPs \
     --start-ip-address 0.0.0.0 \
     --end-ip-address 255.255.255.255
   ```

4. **Check database exists:**
   ```bash
   # List databases
   az postgres db list \
     --resource-group taskflow-pro-rg \
     --server-name taskflow-db
   ```

---

### 🔴 "Prisma migration failed"

**Cause:** Schema mismatch or migrations not applied

**Solution:**

1. **Check Prisma version:**
   ```bash
   npm list @prisma/client
   # Should be >= 6.0.0
   ```

2. **Verify schema exists:**
   ```bash
   cat prisma/schema.prisma
   # Should have datasource and models
   ```

3. **Run migrations locally first:**
   ```bash
   export DATABASE_URL="your-connection-string"
   npx prisma migrate deploy
   npx prisma db push
   ```

4. **If migration stuck:**
   ```bash
   # Reset database (careful - deletes data!)
   npx prisma migrate reset
   ```

---

### 🔴 "Build failed: Cannot find module"

**Cause:** Missing dependencies or import issues

**Solution:**

1. **Verify local build works:**
   ```bash
   npm ci
   npm run build
   ```

2. **Check for uncommitted dependencies:**
   ```bash
   git status
   # package.json and package-lock.json should match
   ```

3. **Clear cache and rebuild:**
   ```bash
   rm -rf node_modules
   npm ci
   npm run build
   ```

---

### 🔴 "App not starting / 502 Bad Gateway"

**Cause:** Environment variables missing or app crash

**Solution:**

1. **Check App Service environment variables:**
   ```bash
   az webapp config appsettings list \
     --resource-group taskflow-pro-rg \
     --name taskflow-pro-app
   ```

2. **Verify all required vars are set:**
   - `DATABASE_URL` ✅
   - `NEXTAUTH_SECRET` ✅
   - `NEXTAUTH_URL` ✅
   - `NODE_ENV=production` ✅

3. **Check app logs:**
   ```bash
   # Real-time logs
   az webapp log tail \
     --resource-group taskflow-pro-rg \
     --name taskflow-pro-app
   
   # Or download recent logs
   az webapp log download \
     --resource-group taskflow-pro-rg \
     --name taskflow-pro-app \
     --log-file logs.zip
   ```

4. **Restart app:**
   ```bash
   az webapp restart \
     --resource-group taskflow-pro-rg \
     --name taskflow-pro-app
   ```

---

### 🔴 "Secret not being recognized"

**Cause:** GitHub Actions can't access secrets

**Solution:**

1. **Verify secret exists:**
   ```bash
   # GitHub → Settings → Secrets and variables → Actions
   # Check all 6 secrets are listed
   ```

2. **Check secret name in workflow:**
   ```yaml
   # Workflow should use: ${{ secrets.SECRET_NAME }}
   env:
     DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```

3. **Secrets are case-sensitive:**
   - ✅ `DATABASE_URL` (correct)
   - ❌ `database_url` (wrong)

4. **Wait for sync:**
   - GitHub takes ~30 seconds to sync secrets
   - Re-run workflow after adding secrets

---

### 🔴 "Workflow not triggering"

**Cause:** Branch name or event mismatch

**Solution:**

1. **Verify branch name:**
   ```bash
   # Workflow only runs on 'main' branch
   # Check your default branch:
   git branch -M main  # Rename to main if needed
   ```

2. **Manual workflow trigger:**
   - GitHub → Actions
   - Select workflow
   - Click "Run workflow" dropdown
   - Click "Run workflow"

3. **Check workflow syntax:**
   ```bash
   # Validate YAML
   npx yaml-lint .github/workflows/azure-deploy.yml
   ```

---

### 🔴 "Publish profile invalid"

**Cause:** Expired or incorrectly formatted profile

**Solution:**

1. **Regenerate publish profile:**
   ```bash
   az webapp deployment list-publishing-profiles \
     --resource-group taskflow-pro-rg \
     --name taskflow-pro-app \
     --output xml
   ```

2. **Update GitHub secret:**
   - Copy entire XML output
   - GitHub → Settings → Secrets
   - Edit `AZURE_PUBLISH_PROFILE`
   - Paste new XML

3. **Verify XML is valid:**
   - XML should start with `<?xml`
   - Should contain `<publishProfile`
   - No truncation or formatting issues

---

### 🔴 "Timeout during deployment"

**Cause:** Large app or slow database

**Solution:**

1. **Increase timeout in workflow:**
   ```yaml
   - name: Deploy to Azure
     uses: azure/webapps-deploy@v2
     timeout-minutes: 15  # Increase from 10
     with:
       app-name: ${{ secrets.AZURE_APP_NAME }}
   ```

2. **Check Azure resource size:**
   ```bash
   # Verify you're not on free tier
   az appservice plan show \
     --resource-group taskflow-pro-rg \
     --name taskflow-plan \
     --query sku
   # Should be Standard or higher
   ```

3. **Optimize build:**
   - Remove unused dependencies
   - Check for large files in `.next` output
   - Use Docker image caching

---

## 📊 Debug Workflow Execution

### View detailed workflow logs:

1. **GitHub Actions page:**
   - Repository → Actions
   - Select workflow run
   - Click job name
   - Expand each step to see logs

2. **Common log locations:**
   - **Build step:** Look for build errors
   - **Deploy step:** Look for authentication errors
   - **Migration step:** Look for database errors

3. **Download artifacts:**
   - Some workflows save build artifacts
   - Download to inspect locally

---

## 🧪 Local Testing

Test everything locally before pushing:

```bash
# 1. Build locally
npm run build

# 2. Test database connection
psql $DATABASE_URL

# 3. Test migrations
npx prisma migrate deploy

# 4. Start app
npm start

# 5. Visit app
# http://localhost:3000
```

---

## 📞 Getting Help

If still stuck:

1. **Check GitHub status:** https://www.githubstatus.com
2. **Check Azure status:** https://status.azure.com
3. **Review workflow logs:** Actions → Select run → View logs
4. **Check App Service logs:** `az webapp log tail`
5. **Search issues:** GitHub Copilot docs, Stack Overflow

---

## 🔄 Reset & Start Over

If everything is broken:

```bash
# 1. Delete old service principal
az ad sp delete --id your-client-id

# 2. Clear all GitHub secrets
# GitHub → Settings → Secrets → Delete all

# 3. Start fresh with setup script
bash scripts/setup-github-actions.sh

# 4. Or manually follow MANUAL_SETUP.md
```

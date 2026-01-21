# 🔧 Azure Deployment Issues - FIXED

## What Was Wrong

After a fresh analysis, I found **5 critical issues** preventing successful Azure deployment:

### 1. ❌ **Node Version Mismatch**
**Problem:** Workflow used Node 20, but your project needs Node 24 LTS
- Next.js 16.x requires Node 24+ for full compatibility
- GitHub Actions was building with Node 20
- **Fix:** Changed to Node `24-lts` in workflow

### 2. ❌ **Missing Environment Variables in Deployment**
**Problem:** Workflow builds successfully but Azure deployment had no secrets
- `.env.production` was never created in the ZIP package
- AWS had no `DATABASE_URL`, `NEXTAUTH_URL`, or `NEXTAUTH_SECRET`
- App would fail immediately with "missing env vars" error
- **Fix:** Workflow now creates `.env.production` from GitHub secrets and includes it in ZIP

### 3. ❌ **Broken web.config**
**Problem:** `web.config` was configured for an old Node.js setup (iisnode with server.js)
```xml
<add name="iisnode" path="server.js" verb="*" modules="iisnode" />
```
- Next.js doesn't use `server.js` - it uses `.next/` built output
- Azure IIS would try to route requests to non-existent `server.js`
- Would cause 404 errors on all routes
- **Fix:** Rewrote web.config with proper:
  - URL rewrite rules for Next.js routes
  - Static file caching
  - Security headers
  - Application warm-up

### 4. ❌ **Source Code Included in ZIP**
**Problem:** Workflow copied entire `src/` directory to deploy package
- Unnecessary (adds size to ZIP)
- Included TypeScript source that Azure doesn't need
- Only `.next/` (compiled output) should be deployed
- **Fix:** Removed `src/` from deployment package

### 5. ❌ **Missing Critical Files**
**Problem:** ZIP didn't include `.env.production` or proper config
- **Fix:** Added `.env.production` generation from secrets
- ZIP now includes: `.next/`, `node_modules/`, `public/`, `prisma/`, `web.config`, `.env.production`

---

## What's Now Fixed ✅

### Updated Workflow (`.github/workflows/azure-deploy.yml`)
```yaml
# ✅ Node 24 LTS
node-version: '24-lts'

# ✅ Creates .env.production from secrets
- name: Create .env.production for deployment
  run: |
    cat > .env.production << 'EOF'
    DATABASE_URL=${{ secrets.DATABASE_URL }}
    NEXTAUTH_URL=${{ secrets.NEXTAUTH_URL }}
    NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}
    EOF

# ✅ Includes .env.production in ZIP
cp .env.production ./deploy/
```

### Fixed web.config
- ✅ Routes all traffic through Next.js app
- ✅ Caches static files properly  
- ✅ Sets security headers
- ✅ No iisnode/server.js references

---

## Next Steps to Deploy Successfully

### 1️⃣ **Verify GitHub Secrets are Set**
Go to GitHub → Settings → Secrets and verify you have:
- ✅ `AZURE_APP_NAME` (e.g., `taskflow-pro`)
- ✅ `AZURE_PUBLISH_PROFILE` (download from Azure Portal)
- ✅ `DATABASE_URL` (PostgreSQL connection string)
- ✅ `NEXTAUTH_URL` (https://taskflow-pro.azurewebsites.net)
- ✅ `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)

### 2️⃣ **Verify Azure Setup**
- [ ] App Service running Node.js 24 LTS
- [ ] PostgreSQL firewall allows App Service IP
- [ ] All environment variables in Azure Portal match

### 3️⃣ **Trigger Deployment**
```bash
# GitHub → Actions → "Deploy to Azure" → Run workflow
```

### 4️⃣ **Monitor Deployment**
Workflow should now:
1. Build with Node 24
2. Create .env.production
3. Run migrations
4. Create ZIP with all files
5. Deploy to Azure
6. Start successfully with `npm start`

### 5️⃣ **Verify in Azure**
```bash
# Check logs
az webapp log tail -g <resource-group> -n taskflow-pro

# Test app
https://taskflow-pro.azurewebsites.net
```

---

## Why Previous Attempts Failed

| Issue | Old Behavior | New Behavior |
|-------|---|---|
| **Node Version** | 20 | 24-lts ✅ |
| **Env Variables** | Missing in ZIP | Included from GitHub secrets ✅ |
| **web.config** | Looked for server.js | Routes through Next.js ✅ |
| **Package Contents** | .next, node_modules, src, prisma | .next, node_modules, public, prisma, .env.production ✅ |
| **Migrations** | Ran in GitHub Actions | Still runs in GitHub Actions (correct) ✅ |

---

## If Deployment Still Fails

**Check these in order:**

1. **Build failed in GitHub Actions?**
   - Check workflow logs in GitHub
   - Verify `npm run build` works locally

2. **Deployed but app won't start?**
   - SSH into App Service: `az webapp create-remote-connection -g <rg> -n <app>`
   - Check: `cat /home/site/wwwroot/.env.production`
   - Check: `cat /home/site/wwwroot/web.config`
   - Restart app: `az webapp restart -g <rg> -n <app>`

3. **Database connection error?**
   - Verify `DATABASE_URL` in Azure Portal environment variables
   - Check PostgreSQL firewall allows your App Service IP
   - Test locally: `psql $DATABASE_URL -c "SELECT 1"`

4. **Authentication not working?**
   - Verify `NEXTAUTH_URL` matches your actual URL
   - Check `NEXTAUTH_SECRET` is set (not empty)
   - Clear browser cookies and retry login

---

**You should now be able to deploy successfully! 🚀**

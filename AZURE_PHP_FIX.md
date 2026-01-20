# Azure Deployment Fix - PHP Detection Error

## Problem
The deployment was failing with:
```
Error: Platform 'php' version '' is unsupported. Supported versions:
```

Even after setting environment variables and using `.oryx-config.yaml`, Oryx was still detecting PHP and failing because PHP isn't available in the Azure App Service.

## Root Cause
The issue was that:
1. GitHub Actions was building the app successfully
2. But then Azure's deployment process was trying to run `oryx build` AGAIN
3. Oryx was auto-detecting PHP as a platform to install, even though we specified `--platform nodejs`
4. PHP isn't available in the external SDK provider, causing the build to fail

## Solution Implemented

### 1. **Skip Oryx Build Entirely** (Primary Fix)
Since we're already building in GitHub Actions, we configured Azure to skip the Oryx build:

**Updated `.deployment` file:**
```yaml
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT = false
SKIP_ORYX_BUILD_DURING_DEPLOYMENT = true
```

### 2. **Updated GitHub Actions Workflow**
- Build and test the application in GitHub Actions (which has full control)
- Deploy the pre-built `.next` directory to Azure
- Pass environment variables at the deployment step for extra safety

### 3. **Clean Deployment Package**
Before deploying, we remove:
- `.git`, `.github` (unnecessary in production)
- `prisma/migrations` (already applied to database)
- `.env.local`, `.vscode`, `*.md` (dev-only files)

### Why This Works

**Previous Approach (Broken):**
```
GitHub Actions → Build (Works ✓) → Deploy → Azure Oryx (Fails ✗)
                                              └─ Tries to detect PHP
```

**New Approach (Fixed):**
```
GitHub Actions → Build (Works ✓) → Deploy Pre-built Files → Azure (No build needed)
                └─ Full build control in CI/CD
```

## Benefits

1. **Eliminates PHP Detection Error** - Oryx doesn't run, so it can't detect PHP
2. **Faster Deployments** - No rebuild on Azure, just copy pre-built files
3. **More Reliable** - Build runs once in controlled GitHub Actions environment
4. **Better CI/CD** - Single source of truth for build process
5. **Lower Azure Compute** - No unnecessary build tasks on App Service

## Key Files Changed

- `.github/workflows/azure-deploy.yml` - Skip Oryx build during Azure deployment
- `.deployment` - Set `SCM_DO_BUILD_DURING_DEPLOYMENT = false`
- `.oryx-config.yaml` - Still in place as backup (no harm)
- New: `build-and-deploy.sh` - Optional local build script

## What to Expect on Next Deployment

When the next push triggers GitHub Actions:
1. ✓ Checkout code
2. ✓ Install Node.js dependencies  
3. ✓ Run Prisma migrations
4. ✓ Build Next.js application
5. ✓ Deploy built files to Azure (no Oryx build)
6. ✓ App should be live without PHP detection errors

## Testing the Fix

Push a commit to `main` and the GitHub Actions workflow will:
1. Build your app in ubuntu-latest
2. Skip Oryx when deploying to Azure
3. Deploy the pre-built `.next` directory

**Expected Result:** Successful deployment without "Platform 'php' version '' is unsupported" error

## Rollback Plan

If issues occur, revert the changes:
```bash
git revert HEAD~1
git push origin main
```

This will restore the Oryx build on Azure (slower but fallback option).

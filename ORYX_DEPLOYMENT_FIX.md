# Azure App Service Configuration for TaskFlow Pro

## Critical: Set these App Settings BEFORE next deployment

If the deployment still fails with PHP detection errors, manually configure the Azure App Service with these settings:

```bash
# Replace taskflowpro-e0bsbbdea4gdczha with your actual app name

az webapp config appsettings set \
  --resource-group taskflow-pro-rg \
  --name taskflowpro-e0bsbbdea4gdczha \
  --settings \
    ORYX_DISABLE_PLATFORM_DETECTION=true \
    ORYX_PLATFORMS=nodejs \
    ORYX_SKIP_DETECT_PLATFORMS=true \
    ORYX_PLATFORM_DEFAULT=nodejs \
    WEBSITE_NODE_DEFAULT_VERSION=24.11.0 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

## What was implemented to fix PHP detection:

1. **GitHub Actions Workflow** (.github/workflows/azure-deploy.yml)
   - Moved ORYX env vars to job level (persistent across all steps)
   - Added ORYX_SKIP_DETECT_PLATFORMS=true

2. **Deployment File** (.deployment)
   - Set SCM_DO_BUILD_DURING_DEPLOYMENT=true
   - Added ORYX_DISABLE_PLATFORM_DETECTION=true
   - Added ORYX_PLATFORMS=nodejs
   - Added ORYX_SKIP_DETECT_PLATFORMS=true
   - Added ORYX_PLATFORM_DEFAULT=nodejs

3. **Oryx Configuration** (.oryx-config.yaml)
   - Explicitly disabled PHP, Python, Ruby, Go, .NET detection
   - Set detectFromFiles=false for Node.js
   - Set detectAllEnabledPlatforms=false

4. **IIS Configuration** (web.config)
   - Blocked all PHP file extensions (.php, .phtml, .php3, .php4, .php5, .phar)
   - Configured iisnode handler for Node.js

5. **App Service Settings** (.azure/appsettings.json)
   - JSON template for App Service configuration
   - Can be deployed via Azure Resource Manager

## Manual Fix (If Still Failing)

If the GitHub Actions deployment still fails, use the Azure CLI command above to configure the App Service directly.

The key is that these settings must be configured AT THE APP SERVICE LEVEL before Oryx runs its build process.

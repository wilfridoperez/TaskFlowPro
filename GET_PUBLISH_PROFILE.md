# Getting Your Azure Publish Profile for GitHub

## Step 1: Get Your Publish Profile from Azure Portal

1. Open [Azure Portal](https://portal.azure.com)
2. Go to: **App Services** → **TaskFlowPro**
3. Click: **Overview** (top left)
4. Click: **Get publish profile** button (top right)
5. A file will download: `TaskFlowPro.PublishSettings`
6. Open it with a text editor (not Word)
7. Copy the ENTIRE content

## Step 2: Add to GitHub Secrets

1. Go to: https://github.com/wilfridoperez/TaskFlowPro/settings/secrets/actions
2. Click: **New repository secret**
3. **Name**: `AZURE_PUBLISH_PROFILE`
4. **Value**: Paste the entire `.PublishSettings` file content
5. Click: **Add secret**

## Step 3: Redeploy

Once the secret is added, manually trigger a new workflow:

```bash
cd /Users/wilfridoperez/Development/Projects\ -\ 2026/taskflow-pro
git add .github/workflows/main_taskflowpro.yml
git commit -m "Fix GitHub Actions workflow - update deprecated actions"
git push origin main
```

The deployment will automatically start!

## If You Need Help

The publish profile is an XML file that looks like:
```xml
<publishProfile profileName="TaskFlowPro - Web Deploy" publishMethod="MSDeploy">
  ...
</publishProfile>
```

Copy the entire thing (all XML) and paste it as the secret value.

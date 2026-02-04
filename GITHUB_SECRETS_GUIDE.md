# Add GitHub Secrets for Azure Deployment

You need to add 4 secrets to GitHub for deployment to work:

## 📋 Required Secrets

Go to: <https://github.com/wilfridoperez/TaskFlowPro/settings/secrets/actions>

### 1. **DATABASE_URL** ✅ (Already have this)

- **Name**: `DATABASE_URL`
- **Value**: `postgresql://<user>:<password>@<server>.postgres.database.azure.com:5432/<db>?sslmode=require`

### 2. **NEXTAUTH_SECRET** ✅ (Already have this)

- **Name**: `NEXTAUTH_SECRET`
- **Value**: Use a strong 32+ byte secret (example: `openssl rand -base64 32`)

### 3. **NEXTAUTH_URL** ✅ (Already have this)

- **Name**: `NEXTAUTH_URL`
- **Value**: `https://<your-app-name>.azurewebsites.net`

### 4. **AZURE_APP_NAME** ⏳ (Need to add)

- **Name**: `AZURE_APP_NAME`
- **Value**: `TaskFlowPro`

### 5. **AZURE_PUBLISH_PROFILE** ⏳ (Need to add)

- **Name**: `AZURE_PUBLISH_PROFILE`
- **Value**: (See below how to get it)

## 📥 How to Get AZURE_PUBLISH_PROFILE

1. Open [Azure Portal](https://portal.azure.com)
2. Search: **App Services**
3. Click: **TaskFlowPro**
4. Click: **Overview** button
5. Click: **Get publish profile** button (top right)
6. A file `TaskFlowPro.PublishSettings` downloads
7. Open with VS Code
8. Select all content (Cmd+A)
9. Copy (Cmd+C)

## ✅ Add to GitHub

1. Go to: <https://github.com/wilfridoperez/TaskFlowPro/settings/secrets/actions>

2. For each secret:
   - Click: **New repository secret**
   - **Name**: Exact name (e.g., `AZURE_PUBLISH_PROFILE`)
   - **Value**: Paste the content
   - Click: **Add secret**

3. Make sure you add:
   - `AZURE_APP_NAME` = `TaskFlowPro`
   - `AZURE_PUBLISH_PROFILE` = (The XML file content)

## 🚀 After Adding Secrets

Run this command to redeploy:

```bash
cd /Users/wilfridoperez/Development/Projects\ -\ 2026/taskflow-pro
git add .github/workflows/main_taskflowpro.yml
git commit -m "Simplify workflow - prepare for deployment with secrets"
git push origin main
```

GitHub Actions will automatically start deployment when you push!

Monitor at: <https://github.com/wilfridoperez/TaskFlowPro/actions>

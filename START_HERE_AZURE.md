# 🚀 START HERE - Your Azure Deployment in 5 Minutes

## What to Do Right Now

Your TaskFlow Pro is ready for Azure! Follow these exact steps in order:

---

## ⏱️ Step 1: Database (2 minutes)

**Do you already have a PostgreSQL database on Azure?**

- **YES** → Skip to Step 2
- **NO** → Use this command in Terminal:

```bash
az postgres flexible-server create \
  --resource-group TaskFlowPro \
  --name taskflowpro-db \
  --location eastus \
  --admin-user dbadmin \
  --admin-password MySecurePassword123!
```

Or create via [Azure Portal Databases](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.DBforPostgreSQL%2FflexibleServers)

---

## ⏱️ Step 2: Get Connection String (1 minute)

1. Open [Azure Portal](https://portal.azure.com)
2. Search for **Azure Database for PostgreSQL**
3. Click your database: **taskflowpro-db**
4. Left menu → **Connection strings**
5. Click **JDBC** tab
6. **Copy the entire connection string**
7. **Paste it somewhere** - you'll need it in Step 4

It should look like:
```
postgresql://dbadmin:MySecurePassword123!@taskflowpro-db.postgres.database.azure.com:5432/taskflowpro
```

---

## ⏱️ Step 3: Generate Secret Key (30 seconds)

Open Terminal and run:

```bash
openssl rand -base64 32
```

**Copy the output** - you'll need it in Step 4.

Example output:
```
4b+/mKjzN8pLqWeR9xDvX2YzZ5A/B6cDeFgHiJk=
```

---

## ⏱️ Step 4: Add Variables to Azure (2 minutes)

1. Open [Azure Portal](https://portal.azure.com)
2. Search: **App Services**
3. Click: **TaskFlowPro**
4. Left menu → **Configuration**
5. Click: **Application settings** tab
6. Click: **+ New application setting** for each:

| Name | Value |
|------|-------|
| `DATABASE_URL` | From Step 2 (connection string) |
| `NEXTAUTH_SECRET` | From Step 3 (random key) |
| `NEXTAUTH_URL` | `https://taskflowpro.azurewebsites.net` |
| `STRIPE_PUBLIC_KEY` | `pk_test_...` (from Stripe Dashboard) |
| `STRIPE_SECRET_KEY` | `sk_test_...` (from Stripe Dashboard) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from Stripe Dashboard) |
| `NODE_ENV` | `production` |

7. Click **Save** at top
8. Click **Continue** to restart

⏳ **Wait 2 minutes for app to restart**

---

## ⏱️ Step 5: Deploy (1 minute)

Open Terminal:

```bash
cd /Users/wilfridoperez/Development/Projects\ -\ 2026/taskflow-pro
git add .
git commit -m "Deploy to Azure"
git push origin main
```

✅ **GitHub Actions will automatically deploy!**

Monitor here: https://github.com/wilfridoperez/TaskFlowPro/actions

---

## ✅ It's Done!

Once GitHub shows green checkmark ✅:

1. Visit: **https://taskflowpro.azurewebsites.net**
2. Test sign-up
3. Test login
4. Create a project (tests database)

---

## 📚 Need More Help?

- **Detailed guide**: [AZURE_PORTAL_STEPS.md](./AZURE_PORTAL_STEPS.md)
- **Full reference**: [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**That's it!** 🎉 You're deploying to Azure!

Total time: ~6-8 minutes (mostly waiting for Azure to process)

**Questions?** All answers are in the files above.

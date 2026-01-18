# Azure Portal Configuration - Step-by-Step

## 🎯 Exact Steps to Configure Your App for Deployment

---

## Part 1: Set Up Database (If Needed)

### ✅ Create PostgreSQL Flexible Server

1. Open [Azure Portal](https://portal.azure.com)
2. Click **+ Create a resource**
3. Search for **Azure Database for PostgreSQL - Flexible Server**
4. Click **Create**
5. Fill in:
   - **Resource Group**: TaskFlowPro
   - **Server name**: taskflowpro-db (must be unique)
   - **Region**: East US (or your preference)
   - **PostgreSQL version**: 15 (or latest)
   - **Admin username**: dbadmin
   - **Admin password**: YourStrongPassword123!
   - **SKU**: Standard_B1ms (Burstable - cheapest)
   - **Storage**: 32 GB
6. Click **Create** and wait ~15 minutes

### ✅ Get Connection String

1. Go to your PostgreSQL server: **Resource Groups** → **TaskFlowPro** → **taskflowpro-db**
2. In left menu, click **Connection strings**
3. Click **JDBC** tab
4. Copy the entire connection string
5. It will look like:
```
postgresql://dbadmin:password@taskflowpro-db.postgres.database.azure.com:5432/taskflowpro
```
6. **Replace `{your_password}` with your actual password**
7. **Save this - you'll need it in Part 2!**

---

## Part 2: Add Environment Variables to Azure App Service

### ✅ Access Configuration

1. Open [Azure Portal](https://portal.azure.com)
2. Search for **App Services**
3. Click on **TaskFlowPro**
4. In the left menu under **Settings**, click **Configuration**
5. Click the **Application settings** tab at the top

### ✅ Generate NEXTAUTH_SECRET

Before adding variables, open Terminal and run:
```bash
openssl rand -base64 32
```
Copy the output (it will be a long random string)

### ✅ Add Each Variable

For each variable below:
1. Click **+ New application setting** button
2. Enter the **Name** and **Value**
3. Leave "Deployment slot setting" unchecked
4. After adding ALL variables, click **Save** button once

#### Variable 1: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: The connection string from Part 1 (with password replaced)
- Example: `postgresql://dbadmin:YourPassword@taskflowpro-db.postgres.database.azure.com:5432/taskflowpro`

#### Variable 2: NEXTAUTH_SECRET
- **Name**: `NEXTAUTH_SECRET`
- **Value**: The random string from `openssl rand -base64 32` above

#### Variable 3: NEXTAUTH_URL
- **Name**: `NEXTAUTH_URL`
- **Value**: `https://taskflowpro.azurewebsites.net`

#### Variable 4: STRIPE_PUBLIC_KEY
- **Name**: `STRIPE_PUBLIC_KEY`
- **Value**: Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys → Copy Publishable key
- Example: `pk_test_51Mz...`

#### Variable 5: STRIPE_SECRET_KEY
- **Name**: `STRIPE_SECRET_KEY`
- **Value**: From Stripe Dashboard → Same location → Copy Secret key
- Example: `sk_test_4eC39H...`

#### Variable 6: STRIPE_WEBHOOK_SECRET
- **Name**: `STRIPE_WEBHOOK_SECRET`
- **Value**: From Stripe Dashboard → Developers → Webhooks → Find endpoint for your app → Copy signing secret
- Example: `whsec_1Mz...`

#### Variable 7: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`

### ✅ Save and Restart

1. After adding all 7 variables, click **Save** button (top of page)
2. A dialog will appear: **"Do you want to restart?"**
3. Click **Continue** (to apply changes and restart app service)
4. Wait ~2 minutes for app to restart

---

## Part 3: Deploy Your Code

### ✅ Push to GitHub (Triggers Automatic Deployment)

Open Terminal in your project:

```bash
# Navigate to project
cd /Users/wilfridoperez/Development/Projects\ -\ 2026/taskflow-pro

# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Azure deployment: Configure for production with PostgreSQL"

# Push to GitHub (triggers GitHub Actions)
git push origin main
```

### ✅ Watch Deployment

1. Go to GitHub: [TaskFlowPro Actions](https://github.com/wilfridoperez/TaskFlowPro/actions)
2. You'll see a workflow running
3. Click on the workflow to see real-time logs
4. Wait for it to complete (should take ~5-10 minutes)
5. When complete, you'll see a green checkmark ✅

### ✅ Verify in Azure

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **App Services** → **TaskFlowPro**
3. In left menu, click **Deployment** → **Deployment history**
4. You should see your deployment with a green checkmark
5. Click on it to see deployment logs

---

## Part 4: Run Database Migrations

### ✅ Option A: SSH into App Service (Recommended)

1. In Azure Portal, go to **App Services** → **TaskFlowPro**
2. In left menu under **Development Tools**, click **SSH**
3. A terminal window opens - click **"Go"** or enter the connection
4. Once connected, run:
```bash
cd /home/site/wwwroot
npx prisma migrate deploy
node prisma/seed.js
```

### ✅ Option B: Run Locally (Then Deploy)

1. On your Mac, in Terminal:
```bash
cd /Users/wilfridoperez/Development/Projects\ -\ 2026/taskflow-pro
npx prisma migrate deploy
node prisma/seed.js
git add .
git commit -m "Run database migrations"
git push origin main
```

---

## Part 5: Test Your Deployment

Once GitHub Actions shows deployment complete:

### ✅ Visit Your App

1. Open browser
2. Go to: **https://taskflowpro.azurewebsites.net**
3. You should see your TaskFlow Pro landing page

### ✅ Test Core Features

1. **Sign Up**: Create a test account
   - Should redirect to dashboard after signup
   - Check for database write

2. **Sign In**: Log in with test account
   - Session should persist
   - Should show dashboard

3. **Create Project**: Create a test project
   - Database write test
   - Check database is working

4. **View Logs**: If anything fails, check:
   - Azure Portal → App Service → Log stream (real-time logs)
   - Azure Portal → Application Insights → Logs

---

## 🆘 Common Issues & Fixes

### Issue: "502 Bad Gateway"
**Solution**: App is still starting. Wait 2-3 minutes and refresh.

### Issue: "Cannot connect to database"
**Solution**: 
1. Verify DATABASE_URL spelling and password are correct
2. Check PostgreSQL server firewall rules
3. In Azure Portal → PostgreSQL Server → Networking → Add your app service IP

### Issue: "NextAuth not working"
**Solution**:
1. Verify NEXTAUTH_SECRET is set and valid (32+ characters)
2. Verify NEXTAUTH_URL is exactly: `https://taskflowpro.azurewebsites.net`
3. Clear browser cookies and try again

### Issue: "Stripe not loading"
**Solution**:
1. Verify STRIPE_PUBLIC_KEY is set correctly (starts with pk_)
2. Check STRIPE_PUBLIC_KEY in your app is using this same key
3. Ensure you're in test mode (pk_test_) not live mode

---

## ✅ Success Checklist

- [ ] PostgreSQL database created
- [ ] Connection string copied (with password filled in)
- [ ] 7 environment variables added to Azure App Service
- [ ] App Service restarted after adding variables
- [ ] Code pushed to GitHub
- [ ] GitHub Actions deployment completed (green checkmark)
- [ ] App loads at Azure URL
- [ ] Sign up works
- [ ] Sign in works
- [ ] Can create a project (database working)

---

## 📞 Still Having Issues?

1. **Check logs**:
   - Azure Portal → App Service → Log stream
   - GitHub → Actions (check workflow logs)

2. **Review detailed guides**:
   - [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

3. **Verify all steps** in this guide completed

---

**You've got this!** 🚀 Once deployed, your app is live on Azure's global infrastructure!

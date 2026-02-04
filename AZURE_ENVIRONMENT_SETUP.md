# Azure Environment Variables Configuration

## Current Issue Status

✅ **Local app runs perfectly** - no Application Error
✅ **Fixed blocking Prisma imports** - startup time reduced to 330ms
❓ **Azure shows Application Error** - likely missing environment variables

## What Was Fixed

The app was failing because old `src/lib/prisma.ts` created a PrismaClient at module load time:

```typescript
// OLD - BLOCKING:
export const prisma = globalForPrisma.prisma ?? new PrismaClient()  // Created immediately!

// NEW - LAZY LOADED:
export { prisma, getPrismaClient } from './prisma-client'  // Deferred
```

Updated three API routes to use the lazy-loaded version:

- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`  
- `src/app/api/auth/register/route.ts`

## Environment Variables Required on Azure

These must be set in Azure App Service **Configuration > Application Settings**:

### Critical Variables

```
NEXTAUTH_SECRET=<your-secret>
NEXTAUTH_URL=https://<your-app-name>.azurewebsites.net
NODE_ENV=production
```

### Database Variables

```
DATABASE_URL=postgresql://<user>:<password>@<server>.postgres.database.azure.com:5432/<db>?sslmode=require
```

### Stripe Variables

```
STRIPE_SECRET_KEY=sk_test_<your_stripe_secret_key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your_stripe_publishable_key>
STRIPE_WEBHOOK_SECRET=whsec_<your_stripe_webhook_secret>
```

### Email Variables (Optional - uses mock in fallback)

```
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_mailtrap_user
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_FROM=noreply@taskflow.pro
NEXT_PUBLIC_APP_URL=https://taskflowpro-e0bsbbdea4gdczha.canadaeast-01.azurewebsites.net
NEXT_PUBLIC_APP_URL=https://<your-app-name>.azurewebsites.net
```

## Why Application Error on Azure?

Possible causes if environment variables are correct:

1. **Old app code is cached** - Try restarting the App Service
2. **Database connection failed** - App should use mock data fallback
3. **Missing NEXTAUTH_SECRET** - Prevents session management
4. **NEXTAUTH_URL mismatch** - Must match your app's actual URL

## Steps to Fix on Azure

### 1. Set Environment Variables

- Go to: Azure Portal > TaskFlowPro App Service > Configuration
- Add all variables from above
- Save and restart the app

### 2. Restart the App Service

```bash
az webapp restart --name TaskFlowPro --resource-group TaskFlowPro
```

### 3. Clear the Deployment

If still showing error, deploy from GitHub Actions:

```bash
git push origin main  # Triggers auto-deployment
```

### 4. Check Logs

```bash
az webapp log stream --name TaskFlowPro --resource-group TaskFlowPro
```

## Local Testing (Works!)

✅ App starts in 330ms
✅ Health endpoint: `GET /api/health` returns `{"status":"healthy"}`
✅ Home page renders with all content
✅ Graceful fallback to mock data if database unavailable

## Next Steps

1. Verify all environment variables are set on Azure
2. Restart App Service
3. Check logs for any errors
4. Test: <https://taskflowpro-e0bsbbdea4gdczha.canadaeast-01.azurewebsites.net/api/health>

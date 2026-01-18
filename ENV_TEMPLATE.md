# Environment Configuration Templates

## Local Development (.env.local)

```env
# Database
DATABASE_URL="postgresql://dbadmin:LocalPassword123@localhost:5432/taskflow"

# NextAuth
NEXTAUTH_SECRET="local-secret-for-development-only"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"

# Application
NODE_ENV="development"
DEBUG=true
```

**How to generate:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## Production - Azure (.env.production)

```env
# Database
DATABASE_URL="postgresql://dbadmin@taskflow-db:password@taskflow-db.postgres.database.azure.com:5432/taskflow?schema=public&sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-production-secret-32-chars"
NEXTAUTH_URL="https://taskflow-pro-app.azurewebsites.net"

# Stripe (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
STRIPE_SECRET_KEY="sk_live_xxx"

# Application
NODE_ENV="production"
DEBUG=false
```

**Note:** Don't commit this file. Use GitHub Secrets instead.

---

## Staging - Azure Slot

```env
# Database (staging database)
DATABASE_URL="postgresql://dbadmin@taskflow-db:password@taskflow-db-staging.postgres.database.azure.com:5432/taskflow_staging?schema=public&sslmode=require"

# NextAuth
NEXTAUTH_SECRET="staging-secret-32-chars"
NEXTAUTH_URL="https://taskflow-pro-app-staging.azurewebsites.net"

# Stripe (Test mode for staging)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"

# Application
NODE_ENV="production"
DEBUG=true
```

---

## Azure App Service Configuration

Set these via Azure Portal or CLI:

```bash
az webapp config appsettings set \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app \
  --settings \
    DATABASE_URL="postgresql://..." \
    NEXTAUTH_SECRET="your-secret" \
    NEXTAUTH_URL="https://taskflow-pro-app.azurewebsites.net" \
    NODE_ENV="production" \
    STRIPE_SECRET_KEY="sk_live_xxx" \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
```

---

## Connection String Formats

### PostgreSQL (Azure Database for PostgreSQL)

**Format:**
```
postgresql://[user]:[password]@[server].postgres.database.azure.com:[port]/[database]?schema=public&sslmode=require
```

**Example:**
```
postgresql://dbadmin@taskflow-db:MyPassword123@taskflow-db.postgres.database.azure.com:5432/taskflow?schema=public&sslmode=require
```

**Parameters:**
- `user`: `dbadmin` or `dbadmin@servername`
- `password`: Your chosen password
- `server`: `taskflow-db.postgres.database.azure.com`
- `port`: `5432` (default)
- `database`: `taskflow`
- `?schema=public&sslmode=require`: Required for Prisma

### PostgreSQL (Local Development)

```
postgresql://postgres:password@localhost:5432/taskflow
```

---

## Prisma Configuration

### Local (SQLite - current)
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### Production (PostgreSQL - migrate to this)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Environment Variable Reference

### Required
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Session encryption secret
- `NEXTAUTH_URL` - Your app URL

### Optional
- `STRIPE_SECRET_KEY` - Stripe secret for payments
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NODE_ENV` - Set to `production` for Azure

### Internal (Generated)
- `NEXTAUTH_JWT_SECRET` - Auto-generated if not set
- `NEXT_PUBLIC_*` - Accessible in browser (prefix vars meant for client)

---

## Validation Checklist

After setting environment variables:

```bash
# 1. Database connection works
psql $DATABASE_URL -c "SELECT 1;"

# 2. All secrets are set
# GitHub → Settings → Secrets
# ✓ AZURE_CREDENTIALS
# ✓ DATABASE_URL
# ✓ NEXTAUTH_SECRET
# ✓ NEXTAUTH_URL

# 3. App builds
npm run build

# 4. Migrations work
npx prisma migrate deploy

# 5. App starts
npm start
# Visit http://localhost:3000
```

---

## Security Notes

### Store Secrets In:
- ✅ Azure Key Vault (recommended for production)
- ✅ GitHub Secrets (for CI/CD)
- ✅ App Service Configuration (managed by Azure)
- ✅ .env.local (local development only)

### Never Store In:
- ❌ GitHub commits
- ❌ Docker images
- ❌ Logs
- ❌ Email/Chat
- ❌ Configuration files

---

## Migration Guide: SQLite → PostgreSQL

When you're ready to migrate to PostgreSQL:

1. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"  # Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update local `.env.local`:**
   ```
   DATABASE_URL="postgresql://..."
   ```

3. **Create migration:**
   ```bash
   npx prisma migrate dev --name migrate_to_postgres
   ```

4. **Deploy to Azure:**
   - Push changes
   - Update `DATABASE_URL` secret in GitHub
   - GitHub Actions will run migrations automatically

---

## Troubleshooting Environment Variables

### Variable not recognized in build?
```bash
# Verify it's set
echo $DATABASE_URL

# Check .env file
cat .env.local

# Note: NEXT_PUBLIC_* vars need "NEXT_PUBLIC_" prefix
NEXT_PUBLIC_API_URL=...  # Accessible in browser
API_URL=...               # Server-only
```

### Build fails with missing var?
```bash
# Provide dummy values for build
export DATABASE_URL="postgresql://test:test@localhost/test"
npm run build
```

### App crashes with "DATABASE_URL not found"?
```bash
# Ensure var is set in App Service
az webapp config appsettings show \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app

# Add if missing
az webapp config appsettings set \
  --resource-group taskflow-pro-rg \
  --name taskflow-pro-app \
  --settings DATABASE_URL="your-connection-string"
```

---

## Development vs Production

| Setting | Local | Production |
|---------|-------|-----------|
| DATABASE | SQLite (local) | PostgreSQL (Azure) |
| DEBUG | `true` | `false` |
| NODE_ENV | `development` | `production` |
| NEXT_PUBLIC_STRIPE_KEY | Test keys | Live keys |
| NEXTAUTH_URL | `http://localhost:3000` | `https://your-app.azurewebsites.net` |
| NEXTAUTH_SECRET | Any string | Strong random 32+ chars |

---

## Quick Setup Commands

```bash
# Local development
export DATABASE_URL="postgresql://postgres:password@localhost:5432/taskflow"
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
export NEXTAUTH_URL="http://localhost:3000"

# Production (Azure)
export DATABASE_URL="postgresql://dbadmin@taskflow-db:pass@taskflow-db.postgres.database.azure.com:5432/taskflow?schema=public&sslmode=require"
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
export NEXTAUTH_URL="https://taskflow-pro-app.azurewebsites.net"
```

---

## References

- [Prisma Connection Strings](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [NextAuth Configuration](https://next-auth.js.org/configuration/options)
- [Azure App Service Configuration](https://docs.microsoft.com/en-us/azure/app-service/configure-language-runtime)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

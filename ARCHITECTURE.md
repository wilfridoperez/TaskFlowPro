# GitHub Actions → Azure Deployment Architecture

## 🔄 Complete Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    You: Local Development                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  git add .                                               │   │
│  │  git commit -m "New feature"                             │   │
│  │  git push origin main                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              GitHub (Main Repository)                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ✓ Receive push to main branch                          │   │
│  │  ✓ Trigger GitHub Actions workflow                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│         GitHub Actions (Workflow Execution)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Step 1: Setup Environment                              │   │
│  │    - Checkout repository                                │   │
│  │    - Setup Node.js 20                                   │   │
│  │                                                          │   │
│  │  Step 2: Build                                          │   │
│  │    - npm ci (clean install)                             │   │
│  │    - npm run build (compile Next.js)                    │   │
│  │    - Upload artifacts                                   │   │
│  │                                                          │   │
│  │  Step 3: Authenticate to Azure                          │   │
│  │    - Use AZURE_CREDENTIALS secret                       │   │
│  │    - Login via az CLI                                   │   │
│  │                                                          │   │
│  │  Step 4: Deploy                                         │   │
│  │    - Run migrations: npx prisma migrate deploy          │   │
│  │    - Deploy code via AZURE_PUBLISH_PROFILE             │   │
│  │                                                          │   │
│  │  Step 5: Notify                                         │   │
│  │    - Send Slack notification (optional)                 │   │
│  │    - GitHub Actions complete                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│           Azure Infrastructure                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Azure App Service (Node.js 20)                         │   │
│  │    ├─ .next/ (compiled app)                             │   │
│  │    ├─ src/ (source code)                                │   │
│  │    ├─ prisma/ (migrations)                              │   │
│  │    ├─ node_modules/                                     │   │
│  │    └─ Environment Variables:                            │   │
│  │        - DATABASE_URL                                   │   │
│  │        - NEXTAUTH_SECRET                                │   │
│  │        - NEXTAUTH_URL                                   │   │
│  │                                                          │   │
│  │  ↓ Connects To ↓                                        │   │
│  │                                                          │   │
│  │  Azure Database for PostgreSQL                          │   │
│  │    ├─ Prisma migrations applied                         │   │
│  │    ├─ Users table                                       │   │
│  │    ├─ Projects table                                    │   │
│  │    └─ Tasks table                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                   ✅ Live at:
            https://taskflow-pro-app.azurewebsites.net
```

---

## 🔐 Secrets & Credentials Flow

```
┌──────────────────────────────────────┐
│   GitHub Repository Secrets          │
│  ├─ AZURE_CREDENTIALS               │ ──┐
│  ├─ AZURE_PUBLISH_PROFILE           │  │
│  ├─ AZURE_APP_NAME                  │  │
│  ├─ DATABASE_URL                    │  │
│  ├─ NEXTAUTH_SECRET                 │  │
│  └─ NEXTAUTH_URL                    │  │
└──────────────────────────────────────┘  │
                                          │
                                          ▼
                            ┌─────────────────────────┐
                            │ GitHub Actions Workflow │
                            │  - Reads secrets        │
                            │  - Uses credentials     │
                            │  - Injects vars into    │
                            │    build process        │
                            └─────────────────────────┘
                                          │
                                          ▼
                            ┌─────────────────────────┐
                            │ Azure Deployment        │
                            │ - Authenticates to      │
                            │   Azure                 │
                            │ - Uploads code          │
                            │ - Sets App variables    │
                            └─────────────────────────┘
                                          │
                                          ▼
                            ┌─────────────────────────┐
                            │ Azure App Service       │
                            │ - Stores secrets        │
                            │ - Env variables set     │
                            │ - App reads from        │
                            │   Environment           │
                            └─────────────────────────┘
```

---

## 📦 Build Pipeline

```
Code Repository
    ↓
Checkout (git clone)
    ↓
Install Dependencies (npm ci)
    ├─ @prisma/client
    ├─ next
    ├─ react
    └─ ... other packages
    ↓
Generate Prisma Client (prisma generate)
    ↓
Build Next.js (npm run build)
    ├─ Compile TypeScript
    ├─ Bundle JavaScript
    ├─ Generate .next/
    └─ Optimize for production
    ↓
Create Build Artifact (.next/)
    ↓
Upload to GitHub (actions/upload-artifact)
    ↓
Deploy to Azure App Service
    ├─ Download artifact
    ├─ Extract files
    ├─ Copy to App Service
    └─ Restart application
    ↓
Run Migrations (npx prisma migrate deploy)
    ├─ Connect to PostgreSQL
    ├─ Check pending migrations
    ├─ Apply schema changes
    └─ Update database
    ↓
Application Ready ✅
```

---

## 🌍 Infrastructure Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Internet (Public)                          │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS
                           ▼
        ┌──────────────────────────────────────┐
        │   Azure App Service                  │
        │   taskflow-pro-app.azurewebsites.net│
        │                                      │
        │  ├─ Next.js Application              │
        │  ├─ Node.js Server                   │
        │  ├─ API Routes                       │
        │  ├─ Authentication (NextAuth)        │
        │  └─ Static Files                     │
        └──────────────────────────────────────┘
                           │
                PostgreSQL Connection
                (SSL/TLS Encrypted)
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Azure Database for PostgreSQL        │
        │ taskflow-db.postgres.database...     │
        │                                      │
        │ ├─ Users Table                       │
        │ ├─ Projects Table                    │
        │ ├─ Tasks Table                       │
        │ ├─ Backups (automatic)               │
        │ └─ SSL Enforced                      │
        └──────────────────────────────────────┘
```

---

## 🔄 Deployment Stages

```
STAGE 1: Source Control
┌─────────────────────────┐
│ Developer pushes code   │
│ to main branch          │
└────────────┬────────────┘
             │ Webhook
             ▼
STAGE 2: Continuous Integration
┌─────────────────────────┐
│ GitHub Actions runs:    │
│ ✓ Lint                  │
│ ✓ Build                 │
│ ✓ Test (optional)       │
└────────────┬────────────┘
             │ All pass ✓
             ▼
STAGE 3: Continuous Deployment
┌─────────────────────────┐
│ GitHub Actions:         │
│ ✓ Authenticate          │
│ ✓ Run migrations        │
│ ✓ Deploy code           │
└────────────┬────────────┘
             │ Deployment complete
             ▼
STAGE 4: Verification
┌─────────────────────────┐
│ Azure App Service:      │
│ ✓ Restart app           │
│ ✓ Connect to database   │
│ ✓ Health check          │
└────────────┬────────────┘
             │ All healthy
             ▼
STAGE 5: Live
┌─────────────────────────┐
│ ✅ App is live!         │
│ Users can access at     │
│ https://your-app...     │
└─────────────────────────┘
```

---

## 📊 File Structure After Setup

```
taskflow-pro/
│
├── .github/
│   └── workflows/
│       ├── azure-deploy.yml      ← Full workflow
│       └── simple-deploy.yml     ← Minimal workflow
│
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── prisma-client.ts
│   │   ├── data.ts
│   │   └── actions.ts
│   └── types/
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── seed.ts
│
├── scripts/
│   └── setup-github-actions.sh
│
├── Documentation/
│   ├── QUICK_START.md                ← Start here!
│   ├── DEPLOYMENT_README.md          ← Overview
│   ├── GITHUB_ACTIONS_SETUP.md       ← Complete guide
│   ├── MANUAL_SETUP.md               ← Step-by-step
│   ├── TROUBLESHOOTING.md            ← Issues & fixes
│   ├── ENV_TEMPLATE.md               ← Environment vars
│   └── DEPLOYMENT_GUIDE.md           ← Azure setup
│
├── package.json
├── next.config.ts
├── tsconfig.json
└── prisma.schema
```

---

## ⏱️ Timeline

```
T+0min    Push to main
          └─→ GitHub webhook triggered

T+0.5min  GitHub Actions starts
          └─→ Checkout code
          └─→ Setup Node.js 20

T+1min    Install dependencies
          └─→ npm ci downloads packages

T+2min    Build application
          └─→ npm run build compiles Next.js

T+4min    Authenticate to Azure
          └─→ Using AZURE_CREDENTIALS

T+5min    Deployment starts
          └─→ Upload files to App Service

T+7min    Run migrations
          └─→ Apply Prisma schema changes

T+8min    Application restart
          └─→ App is live!

T+10min   Deployment complete ✅
          └─→ https://taskflow-pro-app.azurewebsites.net
```

---

## 🎯 Critical Decision Points

```
When you push code:
    ↓
Is it to main? → NO → Skip deployment, run tests only
    ↓ YES
Are all tests passing? → NO → Deployment blocked
    ↓ YES
Did build succeed? → NO → Deployment blocked
    ↓ YES
Can authenticate to Azure? → NO → Deployment blocked
    ↓ YES
Do migrations apply cleanly? → NO → Deployment blocked
    ↓ YES
✅ DEPLOY TO PRODUCTION
```

---

## 📞 Support Contacts

| Issue | Resource |
|-------|----------|
| GitHub Actions | https://github.com/actions |
| Azure Services | https://azure.microsoft.com/support |
| Prisma ORM | https://prisma.io/docs |
| Next.js | https://nextjs.org/docs |
| PostgreSQL | https://www.postgresql.org/docs |

For local documentation, see:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)

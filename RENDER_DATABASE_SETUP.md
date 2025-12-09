# Render Database Setup Guide

## How to Automatically Generate Database When Deploying to Render

This guide shows you how to automatically create and migrate your PostgreSQL database when deploying to Render.

---

## Quick Setup (Recommended)

### Option 1: Using render.yaml (Automatic)

I've already created a `render.yaml` file in your project that will automatically:
- Create a PostgreSQL database
- Link it to your web service
- Run migrations during build

**Steps:**
1. Push your code to GitHub (with render.yaml)
2. In Render Dashboard, click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create everything
5. Set additional environment variables (see below)

### Option 2: Manual Setup (Step-by-Step)

Follow these steps if you prefer manual configuration:

---

## Step 1: Create PostgreSQL Database

### In Render Dashboard:

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `karima-db` (or any name)
   - **Database:** `karima`
   - **User:** `karima` (will be created automatically)
   - **Region:** Choose closest to your users (e.g., Oregon)
   - **Plan:** Free (for testing) or Starter
3. Click **"Create Database"**
4. Wait for database to be provisioned (~2 minutes)

### Get Database Connection String:

1. Go to your database dashboard
2. Copy the **Internal Database URL** (looks like):
   ```
   postgresql://karima:password@dpg-xxxxx.oregon-postgres.render.com/karima
   ```
3. Save this - you'll need it in the next step

---

## Step 2: Create Web Service

### In Render Dashboard:

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `karima-platform`
   - **Region:** Same as database (e.g., Oregon)
   - **Branch:** `main` or your deploy branch
   - **Root Directory:** Leave empty (or set if your app is in a subdirectory)
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (for testing) or Starter

---

## Step 3: Configure Environment Variables

### Required Variables:

In your Web Service → **Environment** tab, add these:

```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://karima:password@dpg-xxxxx.oregon-postgres.render.com/karima

# Auth (REQUIRED)
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Generate NEXTAUTH_SECRET:

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Or use online generator:**
- Go to: https://generate-secret.vercel.app/32

---

## Step 4: How Migrations Work

### The Build Process:

Your `package.json` now has this build script:
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

**What happens:**
1. **`prisma generate`** - Generates Prisma Client from your schema
2. **`prisma migrate deploy`** - Applies all pending migrations to database
3. **`next build`** - Builds your Next.js application

### Migration Files Location:
```
prisma/
  ├── migrations/
  │   ├── 20231120_init/
  │   │   └── migration.sql
  │   ├── 20251127_add_payment_methods/
  │   │   └── migration.sql
  │   └── migration_lock.toml
  └── schema.prisma
```

**All these files must be committed to git!**

---

## Step 5: Deploy

### First Deployment:

1. Click **"Create Web Service"** or **"Manual Deploy"**
2. Render will:
   - Install dependencies
   - Run `prisma generate`
   - Run `prisma migrate deploy` (creates all tables)
   - Build your Next.js app
   - Start the server

### Check Logs:

Watch the deployment logs to see:
```
==> Running 'npm run build'
prisma generate
✓ Generated Prisma Client

prisma migrate deploy
✓ Applying migration `20231120_init`
✓ Applying migration `20251127_add_payment_methods`
✓ All migrations have been successfully applied

next build
✓ Compiled successfully
```

---

## Step 6: Verify Database

### Option A: Using Render Shell

1. Go to your Web Service → **Shell** tab
2. Run:
```bash
npx prisma db pull
npx prisma studio
```

### Option B: Using Prisma Studio Locally

1. Get your DATABASE_URL from Render
2. Add it to your local `.env` file
3. Run:
```bash
npx prisma studio
```

### Option C: Check Tables

In Render Shell:
```bash
npx prisma db execute --stdin <<EOF
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
EOF
```

---

## Common Issues & Solutions

### Issue 1: "No migrations found"

**Cause:** Migration files not committed to git

**Fix:**
```bash
git add prisma/migrations
git commit -m "Add database migrations"
git push
```

### Issue 2: "Migration failed: relation already exists"

**Cause:** Tables already exist in database

**Fix:**
```bash
# In Render Shell
npx prisma migrate resolve --applied "migration_name"
```

Or reset database:
```bash
npx prisma migrate reset --force
```

### Issue 3: "DATABASE_URL not found"

**Cause:** Environment variable not set

**Fix:**
1. Go to Web Service → Environment
2. Add `DATABASE_URL` with your database connection string
3. Click Save Changes (will trigger redeploy)

### Issue 4: Build succeeds but app crashes at runtime

**Cause:** Missing required environment variables

**Check these are set:**
- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXT_PUBLIC_APP_URL`

---

## Advanced: Create Database Schema from Scratch

### If You Don't Have Migrations Yet:

**1. Create Initial Migration Locally:**
```bash
npx prisma migrate dev --name init
```

This creates `prisma/migrations/xxxxxxxx_init/migration.sql`

**2. Commit and Push:**
```bash
git add prisma/migrations
git commit -m "Add initial database migration"
git push
```

**3. Deploy to Render:**
- Render will automatically apply the migration during build

### If You Need to Modify Schema:

**1. Update `prisma/schema.prisma`**

**2. Create Migration:**
```bash
npx prisma migrate dev --name describe_your_changes
```

**3. Commit and Push:**
```bash
git add prisma/migrations prisma/schema.prisma
git commit -m "Add migration: describe your changes"
git push
```

**4. Automatic Deployment:**
- Render detects changes and redeploys
- Migration runs automatically during build

---

## Production Best Practices

### 1. Database Backups

Render provides automatic daily backups on paid plans.

**Manual Backup:**
```bash
# In Render Shell
pg_dump $DATABASE_URL > backup.sql
```

### 2. Migration Safety

- Always test migrations locally first
- Use descriptive migration names
- Never edit migration files after they're applied
- Keep migrations in git

### 3. Rollback Strategy

If a migration fails:
```bash
# Mark as rolled back
npx prisma migrate resolve --rolled-back "migration_name"

# Create a new migration to fix
npx prisma migrate dev --name fix_previous_migration
```

### 4. Environment-Specific Migrations

**Development:**
```bash
npx prisma migrate dev
```

**Production (Render):**
```bash
npx prisma migrate deploy  # No interactive prompts
```

---

## Troubleshooting Checklist

- [ ] Database is created on Render
- [ ] DATABASE_URL is set in environment variables
- [ ] Migration files are committed to git (`prisma/migrations/`)
- [ ] Build command includes `prisma migrate deploy`
- [ ] NEXTAUTH_SECRET is set
- [ ] NEXTAUTH_URL matches your Render URL
- [ ] Check deployment logs for errors
- [ ] Verify tables exist using Prisma Studio or Shell

---

## Testing Your Setup

### 1. Test Database Connection

```bash
# In Render Shell
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('Connected!')).catch(console.error);"
```

### 2. Test Table Creation

```bash
npx prisma db execute --stdin <<EOF
SELECT COUNT(*) FROM "User";
EOF
```

### 3. Test Your Application

1. Visit: `https://your-app.onrender.com`
2. Try signing up: `/auth/signup`
3. Verify user created in database
4. Test admin panel: `/admin/dashboard`

---

## Quick Reference Commands

### For Local Development:
```bash
npx prisma migrate dev        # Create and apply migration
npx prisma studio             # Open database GUI
npx prisma db push            # Quick schema sync (no migration)
npx prisma generate           # Generate Prisma Client
```

### For Production (Render Shell):
```bash
npx prisma migrate deploy     # Apply pending migrations
npx prisma db pull            # Introspect database
npx prisma db execute         # Run SQL query
```

---

## Summary

**✅ Automatic Migration Process:**

1. You modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change`
3. Commit and push to GitHub
4. Render automatically:
   - Pulls latest code
   - Runs `npm install`
   - Runs `prisma generate`
   - Runs `prisma migrate deploy` ← **Creates/updates database**
   - Builds your app
   - Starts the server

**🎉 Your database is automatically created and updated on every deployment!**

---

## Need Help?

- **Render Docs:** https://render.com/docs/databases
- **Prisma Docs:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render
- **Check Logs:** Render Dashboard → Your Service → Logs
- **Shell Access:** Render Dashboard → Your Service → Shell

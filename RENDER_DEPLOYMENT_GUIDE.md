# Render Deployment Guide

## Required Environment Variables

Your application is **built successfully** but failing at **runtime** because environment variables are missing. You need to configure these in your Render dashboard.

### Critical Environment Variables (Required)

These **must** be set for the application to run:

#### 1. Database
```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```
- **Where to get it:** From your Render PostgreSQL database dashboard
- **Format:** Internal connection string from Render
- **Example:** `postgresql://karima_user:xxxxx@dpg-xxxxx.oregon-postgres.render.com/karima_db`

#### 2. NextAuth Secret
```
NEXTAUTH_SECRET=your-random-secret-key-here
```
- **What it is:** A random string for JWT encryption (minimum 32 characters)
- **How to generate:** Run this command locally:
  ```bash
  openssl rand -base64 32
  ```
- **Example:** `xK9mP2vR8qT5wN3jL7hD6gF4sA1zC0eB`
- **⚠️ CRITICAL:** Without this, authentication won't work

#### 3. NextAuth URL
```
NEXTAUTH_URL=https://your-app-name.onrender.com
```
- **What it is:** Your application's public URL
- **Example:** `https://karima-platform.onrender.com`
- **Note:** Update this after your first deploy when you get your Render URL

#### 4. App URL
```
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
```
- **What it is:** Public-facing app URL (same as NEXTAUTH_URL)
- **Note:** Must match NEXTAUTH_URL

---

### Payment Environment Variables (For Stripe)

Required if you want payment functionality to work:

```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Where to get:**
1. Go to https://dashboard.stripe.com
2. Get API keys from Developers → API Keys
3. For webhook secret:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-app.onrender.com/api/payments/webhook`
   - Copy the signing secret

**Note:** Use test keys (`sk_test_`, `pk_test_`) for testing

---

### Optional Environment Variables

#### Email Configuration
```
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourplatform.com
```

#### File Upload (Choose one)

**Option A: AWS S3**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=karima-courses
```

**Option B: Cloudinary**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Video Platform (Optional)
```
MUX_TOKEN_ID=your-mux-token-id
MUX_TOKEN_SECRET=your-mux-token-secret
```

---

## How to Set Environment Variables in Render

### Step 1: Access Environment Settings
1. Go to your Render dashboard
2. Click on your Web Service
3. Go to **Environment** tab in the left sidebar

### Step 2: Add Variables
Click **Add Environment Variable** for each variable:

**Minimum Required Variables:**
```
DATABASE_URL          = [from your Render PostgreSQL]
NEXTAUTH_SECRET       = [generate with: openssl rand -base64 32]
NEXTAUTH_URL          = https://your-app.onrender.com
NEXT_PUBLIC_APP_URL   = https://your-app.onrender.com
```

**For Payment Features:**
```
STRIPE_SECRET_KEY     = sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY = pk_test_xxxxx
STRIPE_WEBHOOK_SECRET = whsec_xxxxx
```

### Step 3: Save and Redeploy
1. Click **Save Changes**
2. Render will automatically redeploy your application
3. Wait for the deployment to complete

---

## Troubleshooting

### Error: `[next-auth][error][NO_SECRET]`
**Cause:** `NEXTAUTH_SECRET` is not set
**Fix:** Add `NEXTAUTH_SECRET` environment variable with a random 32+ character string

**Generate a secret:**
```bash
openssl rand -base64 32
```

### Error: `Environment variable not found: DATABASE_URL`
**Cause:** `DATABASE_URL` is not set
**Fix:**
1. Go to your Render PostgreSQL database
2. Copy the **Internal Database URL**
3. Add it as `DATABASE_URL` in your web service environment variables

### Error: `STRIPE_SECRET_KEY is not defined`
**Cause:** Stripe environment variables are missing
**Fix:** Either:
- Add Stripe keys if you want payment functionality
- Or temporarily disable payment features until you set up Stripe

### Application Still Not Working
1. Check Render logs: **Logs** tab in your service dashboard
2. Verify all required environment variables are set
3. Ensure `DATABASE_URL` is the **Internal** connection string
4. Restart the service: **Manual Deploy** → **Deploy latest commit**

---

## Database Setup

### First Time Setup
After setting environment variables, you need to run database migrations:

1. Go to your Render service → **Shell** tab
2. Run these commands:
```bash
npx prisma generate
npx prisma migrate deploy
```

Or add this to your **Build Command** in Render:
```bash
npm install && npx prisma generate && npm run build
```

And this to your **Start Command**:
```bash
npx prisma migrate deploy && npm start
```

---

## Quick Setup Checklist

- [ ] Create PostgreSQL database on Render
- [ ] Copy Internal Database URL
- [ ] Generate NEXTAUTH_SECRET (`openssl rand -base64 32`)
- [ ] Set all required environment variables
- [ ] Get your app URL after first deploy
- [ ] Update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL with actual URL
- [ ] Redeploy
- [ ] Run database migrations
- [ ] (Optional) Set up Stripe if using payments
- [ ] (Optional) Configure email service
- [ ] (Optional) Set up file upload service (S3 or Cloudinary)

---

## Complete Environment Variable Template

Copy this template and fill in your values:

```bash
# Required
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"
NEXTAUTH_URL="https://your-app.onrender.com"
NEXT_PUBLIC_APP_URL="https://your-app.onrender.com"

# Payment (Required for payment features)
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# Optional - Email
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="SG.xxxxx"
EMAIL_FROM="noreply@yourapp.com"

# Optional - File Upload (Choose one)
# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="xxxxx"
AWS_SECRET_ACCESS_KEY="xxxxx"
AWS_S3_BUCKET_NAME="karima-courses"

# OR Cloudinary
CLOUDINARY_CLOUD_NAME="xxxxx"
CLOUDINARY_API_KEY="xxxxx"
CLOUDINARY_API_SECRET="xxxxx"

# Optional - Video
MUX_TOKEN_ID="xxxxx"
MUX_TOKEN_SECRET="xxxxx"

# Optional - App Settings
NEXT_PUBLIC_APP_NAME="Karima Course Platform"
```

---

## Testing Your Deployment

After setting all environment variables and redeploying:

1. **Check Homepage:** Visit `https://your-app.onrender.com`
2. **Test Authentication:** Try signing up at `/auth/signup`
3. **Test Database:** Verify signup creates a user
4. **Check Admin Panel:** Login and go to `/admin/dashboard`
5. **Test Payments:** (If Stripe is configured) Try creating a test payment

---

## Support

If you encounter issues:
1. Check Render logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure database migrations have run
4. Check that your PostgreSQL database is running
5. Verify the DATABASE_URL uses the Internal connection string

---

## Security Notes

- **Never commit** `.env` files to git
- Use **test keys** in development
- Use **production keys** only in production
- Rotate secrets regularly
- Use strong, unique values for NEXTAUTH_SECRET
- Keep Stripe webhook secrets secure

---

## Next Steps After Deployment

1. Set up Stripe webhooks for production
2. Configure custom domain (if desired)
3. Set up email service for notifications
4. Configure file upload service
5. Set up monitoring and logging
6. Enable HTTPS (automatic on Render)
7. Test all payment flows
8. Create admin user account

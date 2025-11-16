# Setup Guide

This guide will walk you through setting up the Karima course platform on your local machine.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [Setting Up External Services](#setting-up-external-services)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
  ```bash
  node --version
  ```

- **npm** or **yarn**
  ```bash
  npm --version
  ```

- **PostgreSQL** (v14 or higher)
  ```bash
  psql --version
  ```

- **Git**
  ```bash
  git --version
  ```

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Karima
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js
- Prisma
- NextAuth
- Tailwind CSS
- And more...

---

## Database Configuration

### Option 1: Local PostgreSQL

1. **Start PostgreSQL**
   ```bash
   # On macOS (with Homebrew)
   brew services start postgresql

   # On Linux
   sudo systemctl start postgresql

   # On Windows
   # Use pgAdmin or Services app
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database
   CREATE DATABASE karima_db;

   # Create user (optional)
   CREATE USER karima_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE karima_db TO karima_user;

   # Exit
   \q
   ```

3. **Update DATABASE_URL**
   ```
   DATABASE_URL="postgresql://karima_user:your_password@localhost:5432/karima_db"
   ```

### Option 2: Cloud Database (Recommended for Production)

#### Neon (Serverless PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env`

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (Transaction mode)
5. Add to `.env`

#### Railway
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Add to `.env`

---

## Environment Variables

### 1. Copy the Example File

```bash
cp .env.example .env
```

### 2. Configure Required Variables

#### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/karima_db"
```

#### NextAuth
```env
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

#### Email (Choose One)

**SendGrid:**
```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="SG.your_sendgrid_api_key"
EMAIL_FROM="noreply@yourdomain.com"
```

**Gmail:**
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

#### Stripe (For Payments)
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### File Storage (Choose One)

**AWS S3:**
```env
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="karima-courses"
```

**Cloudinary:**
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## Database Initialization

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Run Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Apply the schema to your database
- Generate Prisma Client

### 3. (Optional) Seed the Database

Create a seed file at `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@karima.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  // Create instructor
  const instructorPassword = await hash('instructor123', 10);
  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@karima.com',
      name: 'John Instructor',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      emailVerified: new Date(),
    },
  });

  // Create categories
  const webDev = await prisma.category.create({
    data: {
      name: 'Web Development',
      slug: 'web-development',
    },
  });

  const programming = await prisma.category.create({
    data: {
      name: 'Programming',
      slug: 'programming',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Run seed:
```bash
npm install -D ts-node
npx prisma db seed
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Open Prisma Studio (Database GUI)

```bash
npx prisma studio
```

This opens a web interface at [http://localhost:5555](http://localhost:5555) to view and edit your database.

---

## Setting Up External Services

### Stripe Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for an account

2. **Get API Keys**
   - Dashboard > Developers > API keys
   - Copy Publishable and Secret keys

3. **Set Up Webhook**
   - Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/webhook`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy webhook secret

4. **Test Locally with Stripe CLI**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login
   stripe login

   # Forward webhooks to local
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

### AWS S3 Setup

1. **Create AWS Account**
   - Go to [aws.amazon.com](https://aws.amazon.com)

2. **Create S3 Bucket**
   - S3 > Create bucket
   - Name: `karima-courses`
   - Region: `us-east-1` (or your preferred region)
   - Uncheck "Block all public access" (configure properly for production)

3. **Create IAM User**
   - IAM > Users > Add user
   - Attach policy: `AmazonS3FullAccess` (or custom policy)
   - Save Access Key ID and Secret Access Key

4. **Configure CORS**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000"],
       "ExposeHeaders": []
     }
   ]
   ```

### Cloudinary Setup (Alternative to S3)

1. **Create Account**
   - Go to [cloudinary.com](https://cloudinary.com)

2. **Get Credentials**
   - Dashboard shows Cloud name, API Key, and API Secret
   - Add to `.env`

---

## Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: P1001: Can't reach database server
```

**Solution:**
- Check if PostgreSQL is running
- Verify DATABASE_URL is correct
- Check firewall settings

#### Prisma Client Not Generated
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
npx prisma generate
```

#### Port Already in Use
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use a different port
PORT=3001 npm run dev
```

#### Module Not Found
```
Error: Cannot find module 'X'
```

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Stripe Webhook Signature Verification Failed
```
Error: No signatures found matching the expected signature
```

**Solution:**
- Check STRIPE_WEBHOOK_SECRET in `.env`
- Use Stripe CLI for local testing
- Ensure webhook endpoint is correct

---

## Next Steps

After setup is complete:

1. **Create Your First User**
   - Go to `/auth/signup`
   - Register as a student

2. **Create Instructor Account**
   - Update user role in database to `INSTRUCTOR`
   - Or create new user with instructor role

3. **Create Your First Course**
   - Go to `/instructor/dashboard`
   - Click "Create Course"

4. **Test the Flow**
   - Create a course with lessons
   - Enroll as a student
   - Track progress

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review error logs in terminal
3. Check browser console for frontend errors
4. Open an issue on GitHub
5. Contact support

Happy coding! 🚀

# 🚨 URGENT: Fix Database Schema Mismatch

## Problem
Your Prisma schema has models/fields that don't exist in the database:
- `StudentGroup`, `StudentGroupMember`, `CourseGroupRequirement` tables
- `PaymentMethod` table
- `Course.publicationDate`, `Course.status`, `Course.isArchived` fields
- `CourseStatus` enum

## 🔧 IMMEDIATE FIX - Run in Render Shell

### Option 1: Use Prisma DB Push (Fastest - Recommended)

```bash
# This will sync your database to match the Prisma schema
npx prisma db push --accept-data-loss
```

**What this does:**
- Creates all missing tables
- Adds all missing columns
- Creates all missing enums
- Applies immediately without migration files

**Then mark all migrations as applied:**
```bash
npx prisma migrate resolve --applied "20251122062320_init"
npx prisma migrate resolve --applied "20251127214510_add_payment_methods"
npx prisma migrate resolve --applied "20251210104912_add_course_publication_fields"
```

### Option 2: Manual SQL (More Control)

If Option 1 doesn't work, run this SQL:

```bash
npx prisma db execute --stdin <<'ENDSQL'
-- Add missing enums
DO $$ BEGIN
    CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentMethodType" AS ENUM ('STRIPE', 'PAYPAL', 'BANK_TRANSFER', 'TEST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing Course columns
ALTER TABLE "Course"
  ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "publicationDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT';

-- Create missing tables
CREATE TABLE IF NOT EXISTS "StudentGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudentGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudentGroupMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentGroupMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CourseGroupRequirement" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "requireFullGroup" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "CourseGroupRequirement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PaymentMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "testModeSupported" BOOLEAN NOT NULL DEFAULT false,
    "requiresWebhook" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- Add missing columns to Payment table
ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "paymentMethodId" TEXT,
  ADD COLUMN IF NOT EXISTS "isFake" BOOLEAN NOT NULL DEFAULT false;

-- Create indexes
CREATE INDEX IF NOT EXISTS "Course_isArchived_idx" ON "Course"("isArchived");
CREATE INDEX IF NOT EXISTS "Course_status_idx" ON "Course"("status");
CREATE INDEX IF NOT EXISTS "Course_publicationDate_idx" ON "Course"("publicationDate");
CREATE INDEX IF NOT EXISTS "StudentGroup_name_idx" ON "StudentGroup"("name");
CREATE INDEX IF NOT EXISTS "StudentGroupMember_userId_idx" ON "StudentGroupMember"("userId");
CREATE INDEX IF NOT EXISTS "StudentGroupMember_groupId_idx" ON "StudentGroupMember"("groupId");
CREATE UNIQUE INDEX IF NOT EXISTS "StudentGroupMember_userId_groupId_key" ON "StudentGroupMember"("userId", "groupId");

-- Add foreign keys for StudentGroupMember
DO $$ BEGIN
    ALTER TABLE "StudentGroupMember"
      ADD CONSTRAINT "StudentGroupMember_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "StudentGroupMember"
      ADD CONSTRAINT "StudentGroupMember_groupId_fkey"
      FOREIGN KEY ("groupId") REFERENCES "StudentGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign keys for CourseGroupRequirement
DO $$ BEGIN
    ALTER TABLE "CourseGroupRequirement"
      ADD CONSTRAINT "CourseGroupRequirement_courseId_fkey"
      FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "CourseGroupRequirement"
      ADD CONSTRAINT "CourseGroupRequirement_groupId_fkey"
      FOREIGN KEY ("groupId") REFERENCES "StudentGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign key for Payment.paymentMethodId
DO $$ BEGIN
    ALTER TABLE "Payment"
      ADD CONSTRAINT "Payment_paymentMethodId_fkey"
      FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
ENDSQL
```

Then mark migrations as applied:
```bash
npx prisma migrate resolve --applied "20251122062320_init"
npx prisma migrate resolve --applied "20251127214510_add_payment_methods"
npx prisma migrate resolve --applied "20251210104912_add_course_publication_fields"
```

### Step 3: Verify the Fix

```bash
# Check all tables exist
npx prisma db execute --stdin <<'EOF'
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
EOF
```

You should see all these tables:
- Category
- Course
- CourseCategory
- CourseGroupRequirement
- Document
- Enrollment
- Exercise
- ExerciseSubmission
- Lesson
- Payment
- PaymentMethod
- Progress
- QuizOption
- Review
- StudentGroup
- StudentGroupMember
- User
- _prisma_migrations

### Step 4: Restart Your App

After fixing, your app should work immediately. No need to redeploy!

---

## Why This Happened

1. Your database was partially created (some tables exist, some don't)
2. Prisma's migration tracking table doesn't match reality
3. Schema changes were made without creating migrations

## Prevention for Future

Always create migrations for schema changes:
```bash
npx prisma migrate dev --name your_change_description
git add prisma/migrations
git commit -m "Add migration"
```

---

## Quick Command (Copy-Paste This)

```bash
# Run in Render Shell - One command to fix everything
npx prisma db push --accept-data-loss && \
npx prisma migrate resolve --applied "20251122062320_init" && \
npx prisma migrate resolve --applied "20251127214510_add_payment_methods" && \
npx prisma migrate resolve --applied "20251210104912_add_course_publication_fields" && \
echo "✅ Database fixed! Check your app now."
```

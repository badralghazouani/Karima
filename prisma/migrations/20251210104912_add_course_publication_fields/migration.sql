-- AlterTable
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "publicationDate" TIMESTAMP(3),
                      ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_publicationDate_idx" ON "Course"("publicationDate");

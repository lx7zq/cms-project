-- AlterTable
ALTER TABLE "landing_pages" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "landing_pages_deletedAt_idx" ON "landing_pages"("deletedAt");

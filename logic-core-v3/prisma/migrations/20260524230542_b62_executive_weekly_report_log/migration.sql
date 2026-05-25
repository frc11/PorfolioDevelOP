-- CreateEnum
CREATE TYPE "WeeklyReportStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED_PLAN', 'SKIPPED_OPTOUT', 'SKIPPED_NO_RECIPIENT', 'SKIPPED_NO_DATA');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "executiveReportOptOut" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WeeklyReportLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "status" "WeeklyReportStatus" NOT NULL DEFAULT 'PENDING',
    "recipientEmail" TEXT,
    "messageId" TEXT,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyReportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyReportLog_status_idx" ON "WeeklyReportLog"("status");

-- CreateIndex
CREATE INDEX "WeeklyReportLog_periodKey_idx" ON "WeeklyReportLog"("periodKey");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReportLog_organizationId_periodKey_key" ON "WeeklyReportLog"("organizationId", "periodKey");

-- AddForeignKey
ALTER TABLE "WeeklyReportLog" ADD CONSTRAINT "WeeklyReportLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

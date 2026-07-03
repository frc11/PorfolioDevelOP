-- CreateEnum
CREATE TYPE "ExecutiveReportFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'DISABLED');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "executiveReportFrequency" "ExecutiveReportFrequency" NOT NULL DEFAULT 'WEEKLY',
ADD COLUMN     "executiveReportLeadCount" INTEGER NOT NULL DEFAULT 3;

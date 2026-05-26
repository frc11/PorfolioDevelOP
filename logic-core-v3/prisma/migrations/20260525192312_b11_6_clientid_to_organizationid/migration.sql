/*
  Warnings:

  - You are about to drop the column `clientId` on the `BusinessMetric` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `PageView` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `BusinessMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `PageView` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BusinessMetric" DROP CONSTRAINT "BusinessMetric_clientId_fkey";

-- DropIndex
DROP INDEX "BusinessMetric_clientId_idx";

-- DropIndex
DROP INDEX "PageView_clientId_idx";

-- AlterTable
ALTER TABLE "BusinessMetric" DROP COLUMN "clientId",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PageView" DROP COLUMN "clientId",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "BusinessMetric_organizationId_idx" ON "BusinessMetric"("organizationId");

-- CreateIndex
CREATE INDEX "PageView_organizationId_idx" ON "PageView"("organizationId");

-- AddForeignKey
ALTER TABLE "BusinessMetric" ADD CONSTRAINT "BusinessMetric_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

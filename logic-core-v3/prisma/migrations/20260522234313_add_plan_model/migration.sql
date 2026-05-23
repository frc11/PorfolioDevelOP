-- CreateEnum
CREATE TYPE "PlanKey" AS ENUM ('STARTER', 'PRO', 'BUSINESS');

-- CreateEnum
CREATE TYPE "SupportTier" AS ENUM ('STANDARD', 'PRIORITY', 'PRIORITY_24H');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "planId" TEXT;

-- CreateTable
CREATE TABLE "plan" (
    "id" TEXT NOT NULL,
    "key" "PlanKey" NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "setupFloorPrice" DECIMAL(10,2) NOT NULL,
    "quota" INTEGER NOT NULL,
    "llmModel" TEXT NOT NULL,
    "tools" TEXT[],
    "maxDomains" INTEGER,
    "reportsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "insightEnabled" BOOLEAN NOT NULL DEFAULT false,
    "crmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "supportTier" "SupportTier" NOT NULL DEFAULT 'STANDARD',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_key_key" ON "plan"("key");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

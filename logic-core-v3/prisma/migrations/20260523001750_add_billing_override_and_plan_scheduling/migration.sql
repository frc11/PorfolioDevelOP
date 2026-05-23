-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "lastPlanChangedAt" TIMESTAMP(3),
ADD COLUMN     "overrideReason" TEXT,
ADD COLUMN     "overrideUntil" TIMESTAMP(3),
ADD COLUMN     "pendingPlanEffectiveAt" TIMESTAMP(3),
ADD COLUMN     "pendingPlanId" TEXT,
ADD COLUMN     "priceOverride" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "Subscription_pendingPlanId_idx" ON "Subscription"("pendingPlanId");

-- CreateIndex
CREATE INDEX "Subscription_pendingPlanEffectiveAt_idx" ON "Subscription"("pendingPlanEffectiveAt");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_pendingPlanId_fkey" FOREIGN KEY ("pendingPlanId") REFERENCES "plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

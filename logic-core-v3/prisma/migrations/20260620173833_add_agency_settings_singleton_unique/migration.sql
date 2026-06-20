-- AlterTable
ALTER TABLE "AgencySettings" ADD COLUMN     "singleton" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "AgencySettings_singleton_key" ON "AgencySettings"("singleton");

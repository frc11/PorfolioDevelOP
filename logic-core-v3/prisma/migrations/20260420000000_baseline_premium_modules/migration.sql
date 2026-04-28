-- BASELINE MIGRATION
-- Registra cambios previamente aplicados a la BD via `prisma db push`

DROP TABLE IF EXISTS "ModulePricing" CASCADE;

CREATE TYPE "PremiumModuleTier" AS ENUM ('TIER_1_OPERATION', 'TIER_2_GROWTH', 'TIER_3_VERTICAL');
CREATE TYPE "PremiumModuleStatus" AS ENUM ('ACTIVE', 'COMING_SOON', 'DEPRECATED');
CREATE TYPE "OrganizationModuleStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

CREATE TABLE "premium_module" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT,
    "tier" "PremiumModuleTier" NOT NULL,
    "priceMonthlyUsd" DOUBLE PRECISION NOT NULL,
    "iconName" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "validRubros" TEXT[],
    "status" "PremiumModuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "premium_module_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "premium_module_slug_key" ON "premium_module"("slug");
CREATE INDEX "premium_module_status_idx" ON "premium_module"("status");
CREATE INDEX "premium_module_tier_idx" ON "premium_module"("tier");

CREATE TABLE "organization_module" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "OrganizationModuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "priceLockedUsd" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "organization_module_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "organization_module_organizationId_idx" ON "organization_module"("organizationId");
CREATE UNIQUE INDEX "organization_module_organizationId_moduleId_key" ON "organization_module"("organizationId", "moduleId");
CREATE INDEX "organization_module_status_idx" ON "organization_module"("status");

ALTER TABLE "organization_module"
  ADD CONSTRAINT "organization_module_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "organization_module"
  ADD CONSTRAINT "organization_module_moduleId_fkey"
  FOREIGN KEY ("moduleId") REFERENCES "premium_module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Task" ALTER COLUMN "updatedAt" DROP DEFAULT;
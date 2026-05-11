-- AlterTable
ALTER TABLE "organization_module" ADD COLUMN     "upsellLastRequestedAt" TIMESTAMP(3),
ADD COLUMN     "upsellRequestCount" INTEGER NOT NULL DEFAULT 0;

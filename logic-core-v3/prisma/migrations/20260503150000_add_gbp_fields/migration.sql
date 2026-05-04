-- AlterTable
ALTER TABLE "Organization"
ADD COLUMN "gbpAccountId" TEXT,
ADD COLUMN "gbpLocationId" TEXT,
ADD COLUMN "gbpAccessToken" TEXT,
ADD COLUMN "gbpRefreshToken" TEXT,
ADD COLUMN "gbpTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "gbpConnectedAt" TIMESTAMP(3);

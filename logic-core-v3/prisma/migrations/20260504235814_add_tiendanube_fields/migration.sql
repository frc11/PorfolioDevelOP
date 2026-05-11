-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "tiendanubeAccessToken" TEXT,
ADD COLUMN     "tiendanubeConnectedAt" TIMESTAMP(3),
ADD COLUMN     "tiendanubeStoreId" INTEGER,
ADD COLUMN     "tiendanubeStoreUrl" TEXT;

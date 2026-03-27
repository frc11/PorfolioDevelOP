CREATE TABLE "AgencySettings" (
    "id" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL DEFAULT 'develOP',
    "contactEmail" TEXT,
    "contactWhatsapp" TEXT,
    "websiteUrl" TEXT,
    "alertWebhookUrl" TEXT,
    "alertOnTickets" BOOLEAN NOT NULL DEFAULT true,
    "alertOnLeads" BOOLEAN NOT NULL DEFAULT true,
    "alertOnChurn" BOOLEAN NOT NULL DEFAULT true,
    "alertOnExpiringSubscriptions" BOOLEAN NOT NULL DEFAULT true,
    "alertOnClientMessages" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencySettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModulePricing" (
    "id" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'monthly',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModulePricing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ModulePricing_featureKey_key" ON "ModulePricing"("featureKey");

-- Add Health Score, AIBrief cache, and dashboard engagement fields.

ALTER TABLE "Organization"
ADD COLUMN "dataConnections" JSONB;

ALTER TABLE "Organization"
ALTER COLUMN "dataConnections" SET DEFAULT '{"ga4":{"connected":false,"lastSync":null},"searchConsole":{"connected":false,"lastSync":null},"googleBusinessProfile":{"connected":false,"lastSync":null},"whatsappBusiness":{"connected":false,"lastSync":null},"afip":{"connected":false,"lastSync":null},"pixel":{"connected":false,"lastSync":null}}'::jsonb;

ALTER TABLE "Organization"
ADD COLUMN "googleRating" DOUBLE PRECISION,
ADD COLUMN "googleReviewsCount" INTEGER DEFAULT 0,
ADD COLUMN "googleRatingUpdatedAt" TIMESTAMP(3),
ADD COLUMN "cachedExecutiveBrief" TEXT,
ADD COLUMN "cachedExecutiveBriefAt" TIMESTAMP(3),
ADD COLUMN "executiveBriefRegenerations" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "User"
ADD COLUMN "lastDashboardVisit" TIMESTAMP(3);

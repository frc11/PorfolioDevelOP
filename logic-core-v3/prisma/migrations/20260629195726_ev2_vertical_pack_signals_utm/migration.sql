-- AlterTable
ALTER TABLE "chatbot_bot_config" ADD COLUMN     "verticalPack" TEXT NOT NULL DEFAULT 'base';

-- AlterTable
ALTER TABLE "chatbot_lead" ADD COLUMN     "firstContactedAt" TIMESTAMP(3),
ADD COLUMN     "signals" JSONB,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT;

-- CreateEnum
CREATE TYPE "LeadCategory" AS ENUM ('sales', 'postventa', 'employment', 'provider', 'spam', 'other');

-- CreateEnum
CREATE TYPE "LeadClassification" AS ENUM ('hot', 'warm', 'cold', 'dq');

-- AlterTable
ALTER TABLE "chatbot_lead" ADD COLUMN     "askedSpecificModel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" "LeadCategory" NOT NULL DEFAULT 'sales',
ADD COLUMN     "channel" TEXT,
ADD COLUMN     "classification" "LeadClassification",
ADD COLUMN     "mentionedFinancing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mentionedTradeIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "providedEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "providedPhone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requestedAppointment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "scoreSignals" JSONB;

-- CreateIndex
CREATE INDEX "chatbot_lead_classification_idx" ON "chatbot_lead"("classification");

-- CreateIndex
CREATE INDEX "chatbot_lead_score_idx" ON "chatbot_lead"("score");

-- CreateIndex
CREATE INDEX "chatbot_lead_category_idx" ON "chatbot_lead"("category");

-- CreateIndex
CREATE INDEX "chatbot_lead_botConfigId_classification_capturedAt_idx" ON "chatbot_lead"("botConfigId", "classification", "capturedAt" DESC);

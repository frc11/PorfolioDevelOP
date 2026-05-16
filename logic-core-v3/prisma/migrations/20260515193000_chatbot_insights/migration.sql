-- CreateEnum
CREATE TYPE "InsightStatus" AS ENUM ('PENDING', 'APPLIED', 'DISMISSED', 'IGNORED');

-- CreateEnum
CREATE TYPE "InsightCategory" AS ENUM ('KB_GAP', 'CONVERSION_LEAK', 'CONTENT_OPPORTUNITY', 'CONFIG_TWEAK', 'COMPETITIVE_INTEL');

-- CreateTable
CREATE TABLE "chatbot_insights" (
    "id" TEXT NOT NULL,
    "botConfigId" TEXT NOT NULL,
    "category" "InsightCategory" NOT NULL,
    "status" "InsightStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "suggestedAction" TEXT NOT NULL,
    "evidenceCount" INTEGER NOT NULL,
    "appliedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chatbot_insights_botConfigId_status_createdAt_idx" ON "chatbot_insights"("botConfigId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "chatbot_insights" ADD CONSTRAINT "chatbot_insights_botConfigId_fkey" FOREIGN KEY ("botConfigId") REFERENCES "chatbot_bot_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

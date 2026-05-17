-- CreateEnum
CREATE TYPE "BotAlertSeverity" AS ENUM ('CRITICAL', 'HIGH', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "BotAlertStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "BotAlertType" AS ENUM ('QUOTA_EXHAUSTED', 'LLM_PROVIDER_ERROR', 'BOT_INACTIVE_WITH_TRAFFIC', 'LATENCY_DEGRADED', 'CRON_INSIGHTS_FAILED', 'ACTIVITY_ERRORS_SPIKE', 'CLIENT_NO_ACTIVITY');

-- CreateTable
CREATE TABLE "chatbot_bot_alert" (
    "id" TEXT NOT NULL,
    "botConfigId" TEXT NOT NULL,
    "type" "BotAlertType" NOT NULL,
    "severity" "BotAlertSeverity" NOT NULL,
    "status" "BotAlertStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_bot_alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chatbot_bot_alert_botConfigId_status_idx" ON "chatbot_bot_alert"("botConfigId", "status");

-- CreateIndex
CREATE INDEX "chatbot_bot_alert_status_createdAt_idx" ON "chatbot_bot_alert"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "chatbot_bot_alert" ADD CONSTRAINT "chatbot_bot_alert_botConfigId_fkey" FOREIGN KEY ("botConfigId") REFERENCES "chatbot_bot_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

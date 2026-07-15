-- CreateEnum
CREATE TYPE "MotorPhoneQuality" AS ENUM ('UNKNOWN', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "MotorMessagingLimitTier" AS ENUM ('UNKNOWN', 'TIER_50', 'TIER_250', 'TIER_2K', 'TIER_10K', 'TIER_100K', 'TIER_NOT_SET', 'TIER_UNLIMITED');

-- CreateEnum
CREATE TYPE "MotorPhoneStatus" AS ENUM ('UNKNOWN', 'CONNECTED', 'RESTRICTED', 'BANNED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "MotorAlertType" AS ENUM ('PHONE_RESTRICTED_OR_BANNED', 'TEMPLATE_REJECTED');

-- CreateEnum
CREATE TYPE "MotorAlertSeverity" AS ENUM ('CRITICAL', 'HIGH', 'WARNING', 'INFO');

-- AlterEnum
ALTER TYPE "MotorTemplateStatus" ADD VALUE 'PAUSED';

-- AlterTable
ALTER TABLE "motor_waba_channel" ADD COLUMN     "channelStatus" "MotorPhoneStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "messagingLimitTier" "MotorMessagingLimitTier" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "qualityRating" "MotorPhoneQuality" NOT NULL DEFAULT 'UNKNOWN';

-- CreateTable
CREATE TABLE "motor_alert" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "wabaChannelId" TEXT NOT NULL,
    "type" "MotorAlertType" NOT NULL,
    "severity" "MotorAlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "motor_alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "motor_alert_organizationId_wabaChannelId_createdAt_idx" ON "motor_alert"("organizationId", "wabaChannelId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "motor_alert_organizationId_id_key" ON "motor_alert"("organizationId", "id");

-- AddForeignKey
ALTER TABLE "motor_alert" ADD CONSTRAINT "motor_alert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motor_alert" ADD CONSTRAINT "motor_alert_organizationId_wabaChannelId_fkey" FOREIGN KEY ("organizationId", "wabaChannelId") REFERENCES "motor_waba_channel"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;


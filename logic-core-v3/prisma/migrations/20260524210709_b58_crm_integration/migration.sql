-- CreateEnum
CREATE TYPE "CrmProvider" AS ENUM ('N8N');

-- CreateEnum
CREATE TYPE "CrmSyncStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'RETRYING');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditActionType" ADD VALUE 'CRM_INTEGRATION_UPDATED';
ALTER TYPE "AuditActionType" ADD VALUE 'CRM_INTEGRATION_TESTED';
ALTER TYPE "AuditActionType" ADD VALUE 'CRM_SYNC_RETRIED';

-- CreateTable
CREATE TABLE "crm_integration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "CrmProvider" NOT NULL DEFAULT 'N8N',
    "webhookUrl" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "secretHeaderName" TEXT,
    "secretEncrypted" TEXT,
    "secretIv" TEXT,
    "secretTag" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastErrorAt" TIMESTAMP(3),
    "lastErrorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_sync_attempt" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" "CrmSyncStatus" NOT NULL DEFAULT 'PENDING',
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "httpStatus" INTEGER,
    "errorMessage" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,

    CONSTRAINT "crm_sync_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crm_integration_organizationId_key" ON "crm_integration"("organizationId");

-- CreateIndex
CREATE INDEX "crm_sync_attempt_leadId_attemptedAt_idx" ON "crm_sync_attempt"("leadId", "attemptedAt" DESC);

-- CreateIndex
CREATE INDEX "crm_sync_attempt_integrationId_status_attemptedAt_idx" ON "crm_sync_attempt"("integrationId", "status", "attemptedAt" DESC);

-- CreateIndex
CREATE INDEX "crm_sync_attempt_organizationId_status_idx" ON "crm_sync_attempt"("organizationId", "status");

-- AddForeignKey
ALTER TABLE "crm_integration" ADD CONSTRAINT "crm_integration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_sync_attempt" ADD CONSTRAINT "crm_sync_attempt_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "chatbot_lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_sync_attempt" ADD CONSTRAINT "crm_sync_attempt_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "crm_integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

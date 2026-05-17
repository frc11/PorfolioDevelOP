-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('CLIENT_CREATED', 'CLIENT_UPDATED', 'CLIENT_DELETED', 'BOT_ACTIVATED', 'BOT_DEACTIVATED', 'BOT_CONFIG_UPDATED', 'KB_UPDATED', 'QUOTA_CHANGED', 'LEAD_STATUS_CHANGED', 'IMPERSONATION_STARTED', 'IMPERSONATION_ENDED', 'ALERT_ACKNOWLEDGED', 'ALERT_RESOLVED', 'USER_INVITED', 'USER_REMOVED', 'SUBSCRIPTION_CHANGED', 'OTHER');

-- CreateTable
CREATE TABLE "admin_audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "userName" TEXT,
    "actionType" "AuditActionType" NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "diff" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_audit_log_userId_createdAt_idx" ON "admin_audit_log"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_log_targetType_targetId_createdAt_idx" ON "admin_audit_log"("targetType", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_log_actionType_createdAt_idx" ON "admin_audit_log"("actionType", "createdAt");

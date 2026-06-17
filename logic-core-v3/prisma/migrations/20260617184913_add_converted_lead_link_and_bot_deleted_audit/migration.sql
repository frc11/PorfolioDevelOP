-- AlterEnum
ALTER TYPE "AuditActionType" ADD VALUE 'BOT_DELETED';

-- AlterTable
ALTER TABLE "chatbot_lead" ADD COLUMN     "convertedToOsLeadId" TEXT;

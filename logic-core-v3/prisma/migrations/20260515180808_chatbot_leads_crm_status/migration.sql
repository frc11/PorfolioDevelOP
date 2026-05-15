/*
  Warnings:

  - The `status` column on the `chatbot_lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ChatbotLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_NEGOTIATION', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "chatbot_lead" ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "lastStatusChangeAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "ChatbotLeadStatus" NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "chatbot_lead_status_idx" ON "chatbot_lead"("status");

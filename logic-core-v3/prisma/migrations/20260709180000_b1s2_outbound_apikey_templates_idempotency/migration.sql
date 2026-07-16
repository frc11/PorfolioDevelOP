-- CreateEnum
CREATE TYPE "MotorTemplateCategory" AS ENUM ('UTILITY', 'SERVICE');

-- CreateEnum
CREATE TYPE "MotorTemplateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "motor_message" ADD COLUMN     "outboundIdempotencyKey" TEXT;

-- AlterTable
ALTER TABLE "motor_waba_channel" ADD COLUMN     "apiKeyEncrypted" TEXT,
ADD COLUMN     "apiKeyIv" TEXT,
ADD COLUMN     "apiKeyTag" TEXT;

-- CreateTable
CREATE TABLE "motor_template" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "wabaChannelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "category" "MotorTemplateCategory" NOT NULL,
    "body" TEXT NOT NULL,
    "status" "MotorTemplateStatus" NOT NULL DEFAULT 'PENDING',
    "providerTemplateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motor_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "motor_template_organizationId_wabaChannelId_idx" ON "motor_template"("organizationId", "wabaChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "motor_template_wabaChannelId_name_language_key" ON "motor_template"("wabaChannelId", "name", "language");

-- CreateIndex
CREATE UNIQUE INDEX "motor_template_organizationId_id_key" ON "motor_template"("organizationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "motor_message_organizationId_outboundIdempotencyKey_key" ON "motor_message"("organizationId", "outboundIdempotencyKey");

-- AddForeignKey
ALTER TABLE "motor_template" ADD CONSTRAINT "motor_template_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motor_template" ADD CONSTRAINT "motor_template_organizationId_wabaChannelId_fkey" FOREIGN KEY ("organizationId", "wabaChannelId") REFERENCES "motor_waba_channel"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;


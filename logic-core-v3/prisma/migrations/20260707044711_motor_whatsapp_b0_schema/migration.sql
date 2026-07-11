-- CreateEnum
CREATE TYPE "MotorChannelType" AS ENUM ('WHATSAPP');

-- CreateEnum
CREATE TYPE "WabaChannelStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MotorConversationStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "MotorMessageDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "MotorMessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'RECEIVED');

-- CreateTable
CREATE TABLE "motor_waba_channel" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "wabaId" TEXT NOT NULL,
    "displayPhoneNumber" TEXT NOT NULL,
    "status" "WabaChannelStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" TEXT NOT NULL DEFAULT 'D360',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motor_waba_channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motor_contact_identity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "channelType" "MotorChannelType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "waId" TEXT,
    "reconciledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motor_contact_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motor_conversation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contactIdentityId" TEXT NOT NULL,
    "wabaChannelId" TEXT NOT NULL,
    "status" "MotorConversationStatus" NOT NULL DEFAULT 'OPEN',
    "lastInboundAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motor_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motor_message" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" "MotorMessageDirection" NOT NULL,
    "body" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "status" "MotorMessageStatus" NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motor_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "motor_waba_channel_organizationId_phoneNumberId_key" ON "motor_waba_channel"("organizationId", "phoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "motor_waba_channel_organizationId_id_key" ON "motor_waba_channel"("organizationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "motor_contact_identity_organizationId_channelType_externalI_key" ON "motor_contact_identity"("organizationId", "channelType", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "motor_contact_identity_organizationId_id_key" ON "motor_contact_identity"("organizationId", "id");

-- CreateIndex
CREATE INDEX "motor_conversation_organizationId_contactIdentityId_idx" ON "motor_conversation"("organizationId", "contactIdentityId");

-- CreateIndex
CREATE INDEX "motor_conversation_organizationId_wabaChannelId_idx" ON "motor_conversation"("organizationId", "wabaChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "motor_conversation_organizationId_id_key" ON "motor_conversation"("organizationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "motor_message_providerMessageId_key" ON "motor_message"("providerMessageId");

-- CreateIndex
CREATE INDEX "motor_message_organizationId_createdAt_idx" ON "motor_message"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "motor_message_organizationId_conversationId_createdAt_idx" ON "motor_message"("organizationId", "conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "motor_waba_channel" ADD CONSTRAINT "motor_waba_channel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motor_contact_identity" ADD CONSTRAINT "motor_contact_identity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motor_conversation" ADD CONSTRAINT "motor_conversation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motor_conversation" ADD CONSTRAINT "motor_conversation_organizationId_contactIdentityId_fkey" FOREIGN KEY ("organizationId", "contactIdentityId") REFERENCES "motor_contact_identity"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motor_conversation" ADD CONSTRAINT "motor_conversation_organizationId_wabaChannelId_fkey" FOREIGN KEY ("organizationId", "wabaChannelId") REFERENCES "motor_waba_channel"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motor_message" ADD CONSTRAINT "motor_message_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motor_message" ADD CONSTRAINT "motor_message_organizationId_conversationId_fkey" FOREIGN KEY ("organizationId", "conversationId") REFERENCES "motor_conversation"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

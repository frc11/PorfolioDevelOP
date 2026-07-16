-- AlterTable
ALTER TABLE "motor_waba_channel" ADD COLUMN     "channelToken" TEXT,
ADD COLUMN     "webhookSecretHash" TEXT;

-- CreateTable
CREATE TABLE "motor_contact_identity_transition" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contactIdentityId" TEXT,
    "channelType" "MotorChannelType" NOT NULL,
    "fromExternalId" TEXT NOT NULL,
    "toExternalId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "motor_contact_identity_transition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "motor_contact_identity_transition_organizationId_contactIde_idx" ON "motor_contact_identity_transition"("organizationId", "contactIdentityId");

-- CreateIndex
CREATE INDEX "motor_contact_identity_transition_organizationId_createdAt_idx" ON "motor_contact_identity_transition"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "motor_waba_channel_channelToken_key" ON "motor_waba_channel"("channelToken");

-- AddForeignKey
ALTER TABLE "motor_contact_identity_transition" ADD CONSTRAINT "motor_contact_identity_transition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motor_contact_identity_transition" ADD CONSTRAINT "motor_contact_identity_transition_contactIdentityId_fkey" FOREIGN KEY ("contactIdentityId") REFERENCES "motor_contact_identity"("id") ON DELETE SET NULL ON UPDATE CASCADE;


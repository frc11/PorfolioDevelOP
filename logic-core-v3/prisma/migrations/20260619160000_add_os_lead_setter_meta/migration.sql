-- B-beta — Organización privada del setter sobre su cartera (pin / snooze / nota propia).
-- Aditivo y aislado: crea SOLO la tabla nueva. No toca OsLead.notes (campo del admin)
-- ni ningún dato existente. La clave única (leadId, setterId) hace la nota privada
-- a cada setter; cascade la borra con el lead o el usuario.

-- CreateTable
CREATE TABLE "OsLeadSetterMeta" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "setterId" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "snoozedUntil" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OsLeadSetterMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OsLeadSetterMeta_setterId_pinned_idx" ON "OsLeadSetterMeta"("setterId", "pinned");

-- CreateIndex
CREATE INDEX "OsLeadSetterMeta_setterId_snoozedUntil_idx" ON "OsLeadSetterMeta"("setterId", "snoozedUntil");

-- CreateIndex
CREATE UNIQUE INDEX "OsLeadSetterMeta_leadId_setterId_key" ON "OsLeadSetterMeta"("leadId", "setterId");

-- AddForeignKey
ALTER TABLE "OsLeadSetterMeta" ADD CONSTRAINT "OsLeadSetterMeta_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "OsLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsLeadSetterMeta" ADD CONSTRAINT "OsLeadSetterMeta_setterId_fkey" FOREIGN KEY ("setterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

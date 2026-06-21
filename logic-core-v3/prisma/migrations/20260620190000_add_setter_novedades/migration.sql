-- Novedades dirigidas al setter (in-app): el sistema dejó de avisarle SOLO a
-- Franco. Aditivo y aislado — tabla + enum nuevos, sin tocar tablas existentes
-- (las relaciones en User/OsLead son virtuales: la FK vive en OsSetterNotice).
-- El caso clave es LEAD_REASIGNADO_SALIENTE: el lead ya no es `assignedToId` del
-- setter saliente, así que la novedad addressed (por setterId) es la única forma
-- de avisarle.

-- CreateEnum
CREATE TYPE "OsSetterNoticeKind" AS ENUM ('LEAD_ASIGNADO', 'DEMO_APROBADA', 'DEMO_RECHAZADA', 'LEAD_REASIGNADO_SALIENTE');

-- CreateTable
CREATE TABLE "OsSetterNotice" (
    "id" TEXT NOT NULL,
    "setterId" TEXT NOT NULL,
    "leadId" TEXT,
    "kind" "OsSetterNoticeKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OsSetterNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OsSetterNotice_setterId_read_createdAt_idx" ON "OsSetterNotice"("setterId", "read", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "OsSetterNotice_leadId_idx" ON "OsSetterNotice"("leadId");

-- AddForeignKey
ALTER TABLE "OsSetterNotice" ADD CONSTRAINT "OsSetterNotice_setterId_fkey" FOREIGN KEY ("setterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsSetterNotice" ADD CONSTRAINT "OsSetterNotice_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "OsLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

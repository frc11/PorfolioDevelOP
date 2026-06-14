-- CreateEnum
CREATE TYPE "DossierStage" AS ENUM ('FICHA', 'EVALUADA', 'BRIEF', 'CONSTRUCCION', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'DESCARTADA');

-- CreateTable
CREATE TABLE "OsLeadDossier" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "stage" "DossierStage" NOT NULL DEFAULT 'FICHA',
    "fichaJson" JSONB,
    "evaluacionJson" JSONB,
    "briefJson" JSONB,
    "selfCheckJson" JSONB,
    "draftUrl" TEXT,
    "rechazos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OsLeadDossier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OsLeadDossier_leadId_key" ON "OsLeadDossier"("leadId");

-- CreateIndex
CREATE INDEX "OsLeadDossier_stage_idx" ON "OsLeadDossier"("stage");

-- AddForeignKey
ALTER TABLE "OsLeadDossier" ADD CONSTRAINT "OsLeadDossier_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "OsLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

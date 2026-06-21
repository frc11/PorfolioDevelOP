-- B-beta: persistencia del escalamiento "me trabé" del setter en el dossier.
-- Aditivo y nullable — no toca datos ni el resto del schema. `escaladoAt` marca
-- el pedido de ayuda vigente (null = sin escalamiento); `escaladoNota` guarda el
-- contexto que dejó el setter, para que Franco lo vea in-app (no solo Telegram).
-- AlterTable
ALTER TABLE "OsLeadDossier" ADD COLUMN     "escaladoAt" TIMESTAMP(3),
ADD COLUMN     "escaladoNota" TEXT;

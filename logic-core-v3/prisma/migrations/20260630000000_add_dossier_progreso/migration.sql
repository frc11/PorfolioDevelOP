-- E.1: progreso del checklist de Construcción del setter en el dossier.
-- Aditivo y nullable — no toca datos ni el resto del schema. NULL = checklist
-- fresco (SIN backfill: es progreso auto-reportado, no un gate). Hermano de
-- selfCheckJson/agendaJson; contrato ProgresoSchema. NUNCA se cablea a la
-- transición EN_REVISION (draftUrl + selfCheckAprobado siguen siendo el gate).
-- AlterTable
ALTER TABLE "OsLeadDossier" ADD COLUMN     "progresoJson" JSONB;

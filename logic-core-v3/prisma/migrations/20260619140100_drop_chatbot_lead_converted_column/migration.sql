-- Reconciliación de drift pre-existente DB↔schema (decisión Franco, 2026-06-19).
-- `convertedToOsLeadId` es remanente de un approach FK abandonado en lane/chatbots:
-- la feature de conversión (convert-chatbot-lead.actions.ts) deduplica por email y
-- NUNCA usó esta columna; el string jamás estuvo en el schema/código committeado
-- (solo en lane-LOG.md). Quedó en la DB dev por un db push no revertido.
-- `IF EXISTS` la dropea en dev y es no-op sobre una DB reconstruida desde cero.

-- AlterTable
ALTER TABLE "chatbot_lead" DROP COLUMN IF EXISTS "convertedToOsLeadId";

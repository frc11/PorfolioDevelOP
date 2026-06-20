-- Reconciliación de drift pre-existente DB↔schema (decisión Franco, 2026-06-19).
-- El valor BOT_DELETED ya existe en el enum de la DB dev (agregado out-of-band
-- durante lane/chatbots vía db push); acá se formaliza en la historia de
-- migraciones para alinear schema ↔ migraciones ↔ DB. `IF NOT EXISTS` lo hace
-- no-op sobre la DB dev (ya está) y aditivo real sobre una DB reconstruida.

-- AlterEnum
ALTER TYPE "AuditActionType" ADD VALUE IF NOT EXISTS 'BOT_DELETED';

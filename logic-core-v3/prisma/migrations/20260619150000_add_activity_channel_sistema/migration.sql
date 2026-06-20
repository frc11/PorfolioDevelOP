-- Reasignación de lead: rastro visible en el historial (OsLeadActivity).
-- SISTEMA marca un evento interno del sistema (no un contacto comercial), de
-- modo que las lecturas comerciales puedan excluirlo. Cambio aditivo y seguro
-- (ADD VALUE no reescribe filas ni rompe el aislamiento por assignedToId).

-- AlterEnum
ALTER TYPE "ActivityChannel" ADD VALUE 'SISTEMA';

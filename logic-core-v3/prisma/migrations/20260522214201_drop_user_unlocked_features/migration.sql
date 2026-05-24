-- B4.4: drop legacy column User.unlockedFeatures.
--
-- Razón: el sistema de plan + OrganizationModule reemplazó por completo
-- el array de features sueltas. Los datos pre-existentes (1 user con
-- ["mini-crm"]) ya fueron migrados a OrganizationModule por
-- `prisma/seeds/migrate-unlocked-features.ts` antes de este drop.
--
-- Verificación pre-drop: `grep unlockedFeatures src/` devuelve solo
-- comentarios; cero código activo lee o escribe esta columna.
--
-- Riesgo: zero (data migrada + cero readers). Netlify autoaplica esta
-- migración en el próximo deploy de main.

-- AlterTable
ALTER TABLE "User" DROP COLUMN "unlockedFeatures";

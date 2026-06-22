-- Re-add de columnas de cliente que 20260621120000_reconcile_dev_drift_schema_align
-- DROPEÓ por error. La reconciliación asumió "build verde ⇒ no son del cliente", pero
-- Prisma genera el client desde schema.prisma (no desde la DB): una columna que el schema
-- declara y la DB no tiene NO rompe el build, rompe en RUNTIME (Prisma default-select pide
-- la columna). schema.prisma SIGUE declarando las 8 y el código las usa (avatar/city/notas/
-- soft-delete del módulo chatbot-admin; convertedToOsLeadId en admin/chatbots/[botId]).
-- singleton es el guard de fila única de AgencySettings (alcanzado por default-select, no por nombre).
--
-- Inverso exacto de los 9 DROP de 20260621120000. Idempotente (IF NOT EXISTS) → re-ejecutable y
-- no-op si la columna ya existe. Se aplica SOLO con `migrate deploy` (NUNCA migrate dev/reset:
-- dispararía drift→reset contra el lane setter de Franco que vive en Neon sin mergear).

ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "avatarEmoji" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "avatarImageUrl" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "avatarInitials" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT;
ALTER TABLE "AgencySettings" ADD COLUMN IF NOT EXISTS "singleton" BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS "AgencySettings_singleton_key" ON "AgencySettings"("singleton");
ALTER TABLE "chatbot_lead" ADD COLUMN IF NOT EXISTS "convertedToOsLeadId" TEXT;

-- Reconciliación de drift DB↔schema (cierre de la deuda declarada en FG-0.5).
--
-- El diff live-DB → schema mostraba columnas/índices que la DB dev tenía pero el
-- schema.prisma ya NO declara (refactorizadas a otras entidades o approach abandonado).
-- Ningún código las lee (build verde ⇒ no son campos del client). Se DROPEAN para
-- alinear la DB al schema (criterio: la DB tiene algo que el schema no quiere → DROP).
--
-- Idempotente (IF EXISTS) → correcta en AMBOS sentidos:
--   • DB dev driftada: las columnas existen (metidas out-of-band / migración squasheada) → las dropea.
--   • DB reconstruida desde la historia: la historia NUNCA las agrega → el DROP es no-op.
-- Se aplica con `migrate deploy` (no usa shadow-DB, no puede resetear). NUNCA migrate dev/reset.

-- AgencySettings: guard de singleton abandonado (el schema fuerza fila única por id, no por columna).
DROP INDEX IF EXISTS "AgencySettings_singleton_key";
ALTER TABLE "AgencySettings" DROP COLUMN IF EXISTS "singleton";

-- Organization: vestigios pre-refactor (avatar → BotConfig, city → creación de bot,
-- internalNotes → OnboardingTask/chatbot_lead, soft-delete nunca adoptado en este modelo).
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "avatarEmoji";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "avatarImageUrl";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "avatarInitials";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "city";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "internalNotes";

-- chatbot_lead: remanente del approach FK abandonado en lane/chatbots.
-- La migración 20260619140100 ya lo declaró drop pero quedó RESUELTA SIN EJECUTAR
-- (resolve --applied sin correr el SQL) → la columna seguía física. Este drop la cierra.
ALTER TABLE "chatbot_lead" DROP COLUMN IF EXISTS "convertedToOsLeadId";

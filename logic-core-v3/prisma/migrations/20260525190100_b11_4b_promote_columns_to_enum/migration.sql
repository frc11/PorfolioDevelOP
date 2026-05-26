-- B11.4 (b) — FASE CONSTRAINT ESTRICTO.
--
-- Pre-requisito: la fase (a) creó los enum types Y el código nuevo está
-- deployado (escribe UPPER literals 'USER'/'INFO'/etc.). Por lo tanto las
-- únicas filas con valores lowercase son las pre-deploy del código nuevo.
--
-- Estrategia:
--   1) Backfill idempotente — UPPER(col) sobre toda la tabla. Las filas
--      escritas post-deploy ya son UPPER, así que UPPER(UPPER(x))=UPPER(x);
--      las filas pre-deploy se normalizan acá.
--   2) ALTER COLUMN TYPE con cast directo al enum (USING col::Enum sin
--      UPPER porque ya fueron normalizadas en (1)).
--   3) Restore de DEFAULT con el valor enum nuevo donde corresponde.

-- 1) Backfill defensivo (idempotente).
UPDATE "chatbot_message" SET "role" = UPPER("role") WHERE "role" <> UPPER("role");
UPDATE "chatbot_lead" SET "intent" = UPPER("intent") WHERE "intent" IS NOT NULL AND "intent" <> UPPER("intent");
UPDATE "chatbot_events" SET "level" = UPPER("level") WHERE "level" <> UPPER("level");
UPDATE "chatbot_bot_config" SET "intensityLevel" = UPPER("intensityLevel") WHERE "intensityLevel" <> UPPER("intensityLevel");
UPDATE "chatbot_bot_config" SET "llmProvider" = UPPER("llmProvider") WHERE "llmProvider" <> UPPER("llmProvider");

-- 2) Promote columns.
ALTER TABLE "chatbot_message"
  ALTER COLUMN "role" TYPE "ChatMessageRole" USING "role"::"ChatMessageRole";

ALTER TABLE "chatbot_lead"
  ALTER COLUMN "intent" TYPE "ChatbotLeadIntent" USING "intent"::"ChatbotLeadIntent";

ALTER TABLE "chatbot_events"
  ALTER COLUMN "level" TYPE "ChatbotEventLevel" USING "level"::"ChatbotEventLevel";

-- 3) Defaults (drop antes del TYPE, restore después con el valor enum).
ALTER TABLE "chatbot_bot_config"
  ALTER COLUMN "intensityLevel" DROP DEFAULT,
  ALTER COLUMN "intensityLevel" TYPE "BotIntensityLevel" USING "intensityLevel"::"BotIntensityLevel",
  ALTER COLUMN "intensityLevel" SET DEFAULT 'MEDIUM';

ALTER TABLE "chatbot_bot_config"
  ALTER COLUMN "llmProvider" DROP DEFAULT,
  ALTER COLUMN "llmProvider" TYPE "LlmProvider" USING "llmProvider"::"LlmProvider",
  ALTER COLUMN "llmProvider" SET DEFAULT 'GOOGLE';

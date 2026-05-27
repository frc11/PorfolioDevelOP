-- B11.4 (a) — FASE ADITIVA TOLERANTE.
--
-- Crea los 5 enum types pero NO toca columnas. Las columnas siguen siendo
-- TEXT y aceptan cualquier string. Esto es la fase compatible con código
-- viejo: las escrituras lowercase pre-deploy del nuevo código siguen siendo
-- válidas (TEXT acepta todo).
--
-- Entre esta migration y la (b), el código nuevo se deploya y empieza a
-- escribir valores UPPER. Como la columna sigue siendo TEXT, ambas formas
-- (UPPER nuevas + lowercase pre-existentes) conviven sin fallar.
--
-- La fase (b) (`20260525190100_b11_4b_promote_columns_to_enum`) hace el
-- backfill defensivo + el ALTER COLUMN TYPE.

CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- Union legacy + nuevos B5.1+ (decidido en B11.4 pre-flight: la DB tenía
-- 7 distinct values mezclados, todos esperados).
CREATE TYPE "ChatbotLeadIntent" AS ENUM (
  'PURCHASE_READY', 'SCHEDULE_VISIT', 'QUOTE_REQUEST', 'HUMAN_REQUEST',
  'SUPPORT', 'OTHER',
  'QUOTE', 'INFO', 'DEMO'
);

CREATE TYPE "ChatbotEventLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'DEBUG');

CREATE TYPE "BotIntensityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TYPE "LlmProvider" AS ENUM ('GOOGLE', 'ANTHROPIC', 'OPENAI');

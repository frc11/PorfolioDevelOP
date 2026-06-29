-- admin-1a: campo "caliente" persistido en OsLead (D4). Reemplaza el caliente
-- 100% derivado del score (≥4 en evaluacionJson) por uno que Franco marca a ojo.
-- ADITIVA y nada más: una sola ADD COLUMN, edge-safe (NOT NULL DEFAULT false, sin
-- backfill acá). El backfill de los calientes vigentes corre aparte e idempotente
-- (scripts/admin-1a-backfill-caliente.ts), espejando esCaliente() de admin-0.
-- Todavía NADIE setea ni lee esta columna — las lecturas siguen en el score hasta
-- admin-1b.

-- AlterTable
ALTER TABLE "OsLead" ADD COLUMN "caliente" BOOLEAN NOT NULL DEFAULT false;

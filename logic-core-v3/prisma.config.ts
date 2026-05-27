// BP.4 — Migración de la configuración de Prisma desde package.json
// (bloque "prisma": { ... }) hacia el archivo dedicado `prisma.config.ts`,
// que es el camino oficial recomendado desde Prisma 6.11+ y obligatorio en
// Prisma 7 (deprecation del bloque en package.json).
//
// Reglas heredadas del proyecto:
//   🔴 NUNCA `prisma migrate reset` — la regla del repo se respeta;
//      este archivo NO ejecuta migraciones, solo describe rutas y comandos.
//   🔴 NO tocar migrations existentes — los 49 archivos en prisma/migrations/
//      siguen siendo la fuente de verdad.
//
// Variables de entorno:
//   - Cuando existe `prisma.config.ts`, Prisma deja de auto-cargar `.env`
//     (mensaje al ejecutar la CLI: "Prisma config detected, skipping
//     environment variable loading."). Hay que cargar dotenv a mano.
//   - Orden igual que Next.js: `.env.local` pisa `.env` (los valores que ya
//     existen no se sobreescriben, así que cargamos `.env.local` PRIMERO).

import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'prisma/config'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    // Comando para `prisma db seed`. Equivalente al bloque
    //   "prisma": { "seed": "npx tsx prisma/seed.ts" }
    // que vivía en package.json antes de BP.4.
    seed: 'npx tsx prisma/seed.ts',
  },
})

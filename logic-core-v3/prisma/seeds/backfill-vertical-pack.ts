/**
 * D.1 — Backfill QUIRÚRGICO de `BotConfig.verticalPack` para los 3 bots reales
 * conocidos hoy (develop/sanmiguel/matsu). Toca ESA columna y nada más.
 *
 * POR QUÉ NO `prisma/seed.ts` NI `src/modules/chatbot/prisma/seed.ts`. Son
 * upserts monolíticos completos: además de `verticalPack`, escriben ~15+
 * campos más de `BotConfig` (organización, usuario, knowledge base, tone,
 * llmProvider, etc.) y pueden crear filas que hoy no existen. Correrlos contra
 * la Neon compartida para "solo" el pack pisaría configuración ajustada a mano.
 *
 * POR QUÉ SE MENCIONA `sync-plans.ts` ACÁ, si es de `Plan` y no de `BotConfig`:
 * es el precedente del mismo defecto de forma. `hasPlanChanged` compara las 13
 * columnas de `Plan` y un `update` las pisa todas ante cualquier drift. Este
 * script sigue el MISMO principio de contención que ya se aplicó ahí (ver
 * `prisma/seeds/add-contact-tool.ts`, del que este archivo es espejo exacto):
 * tocar una sola columna, con `data` de una sola clave.
 *
 * QUÉ HACE: por cada slug del mapeo, si `verticalPack` no es ya el valor
 * destino, lo actualiza (SOLO esa columna). Idempotente: correrlo N veces deja
 * el mismo estado y reporta `unchanged`. No crea ni borra filas. Bots cuyo
 * slug no está en el mapeo quedan SIN TOCAR — no se fuerzan a 'base': ya nacen
 * ahí por default de schema (`schema.prisma:1329`).
 *
 * EL MAPEO (D.1, Fase 0 — confirmado con evidencia, aprobado por Valentino):
 *   - develop   -> 'agencia': el pack `agencia` está escrito para el bot
 *     propio de develOP (`server/verticals/packs/agencia.ts`).
 *   - sanmiguel -> 'usados': ya es el valor que `prisma/seed.ts` declara para
 *     este bot (`industry: 'automotive'`); el backfill lo hace cierto también
 *     en la DB si ese seed nunca corrió contra ella.
 *   - matsu     -> 'usados': `industry: 'concesionaria'` en
 *     `scripts/seed-matsu.ts`, calza exacto con el propósito del pack `usados`.
 *
 * EL DEFECTO QUE CORRIGE (redactado tal como quedó, no como se planteó
 * originalmente): NO es "intents de agencia en bots de concesionaria" — eso
 * era cierto PRE-EV.4, cuando los patrones de agencia eran el único hardcode
 * y corrían en todos los bots por igual. POST-EV.4 (código ya deployado), un
 * bot sin backfill cae en el pack `'base'` — 2 intents genéricos (precio/
 * consulta) — no en los 6 de agencia. El defecto real hoy: `matsu` corre con
 * intents genéricos donde deberían ir los 7 de concesionaria (compra/visita/
 * permuta/financiación/modelo/precio/humano) que EV.4 construyó para esto.
 *
 * ALCANCE VERIFICADO (D.1, Fase 0). Además de scoring/intents/toolCopy,
 * `verticalPack` también viaja como metadata de exportación en el payload v2
 * de sync a CRM (`server/crm/syncLeadToCrm.ts`) y en la columna del CSV de
 * leads (`server/leads/csv/buildLeadsCsv.ts`), resuelta EN VIVO al momento del
 * export — corregir el pack cambia retroactivamente esa etiqueta también para
 * leads viejos en exports futuros. Ninguno es dato guardado del lead ni toca
 * tenancy/auth/facturación: es metadata de exportación que queda MÁS precisa
 * (un lead de matsu etiquetado 'usados' es más verdadero que 'base'),
 * confirmado aceptable por Valentino. El guard de `evals/runner.ts` (aborta si
 * un bot QA no matchea su pack esperado) NO aplica: los bots de evals usan
 * slugs dedicados (`qaseed-evals-*`), sin superposición con estos 3.
 *
 * DRY-RUN OBLIGATORIO — primera corrida de este script contra la Neon
 * compartida. Activalo con `DRY_RUN=1` o el flag `--dry-run`. Sin ninguno de
 * los dos, escribe de verdad.
 *
 * Dry-run:
 *   npx tsx prisma/seeds/backfill-vertical-pack.ts --dry-run
 *   DATABASE_URL=<prod> npx tsx prisma/seeds/backfill-vertical-pack.ts --dry-run
 * Ejecución real (recién después de revisar el dry-run):
 *   DATABASE_URL=<prod> npx tsx prisma/seeds/backfill-vertical-pack.ts
 */
import { PrismaClient } from '@prisma/client'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const prisma = new PrismaClient()

/** Mapeo aprobado (D.1, Fase 0). Slugs ausentes de este objeto quedan sin tocar. */
export const VERTICAL_PACK_BACKFILL_MAP: Readonly<Record<string, string>> = {
  develop: 'agencia',
  sanmiguel: 'usados',
  matsu: 'usados',
}

export interface BackfillVerticalPackStats {
  updated: number
  unchanged: number
  /** Slugs del mapeo para los que no existe ningún BotConfig en esta DB. */
  notFound: readonly string[]
}

export async function backfillVerticalPack(
  dryRun: boolean,
): Promise<BackfillVerticalPackStats> {
  const slugs = Object.keys(VERTICAL_PACK_BACKFILL_MAP)

  const bots = await prisma.botConfig.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, verticalPack: true },
  })

  const foundSlugs = new Set(bots.map((bot) => bot.slug))
  const notFound = slugs.filter((slug) => !foundSlugs.has(slug))

  let updated = 0
  let unchanged = 0

  for (const bot of bots) {
    const targetPack = VERTICAL_PACK_BACKFILL_MAP[bot.slug]

    if (bot.verticalPack === targetPack) {
      console.log(`  = ${bot.slug}: ya en '${targetPack}' (sin cambios)`)
      unchanged += 1
      continue
    }

    console.log(
      `  ${dryRun ? '[DRY-RUN] ' : ''}~ ${bot.slug}: '${bot.verticalPack}' -> '${targetPack}'`,
    )

    if (!dryRun) {
      // `data` con UNA sola clave: ninguna otra columna se toca.
      await prisma.botConfig.update({
        where: { id: bot.id },
        data: { verticalPack: targetPack },
      })
    }
    updated += 1
  }

  return { updated, unchanged, notFound }
}

function parseDryRun(): boolean {
  return process.env.DRY_RUN === '1' || process.argv.includes('--dry-run')
}

export async function runBackfillVerticalPack(): Promise<void> {
  const dryRun = parseDryRun()

  try {
    console.log(
      dryRun
        ? 'BotConfig.verticalPack backfill (D.1) — DRY RUN, no se escribe nada'
        : 'BotConfig.verticalPack backfill (D.1) — ejecución real',
    )

    const stats = await backfillVerticalPack(dryRun)

    if (stats.notFound.length > 0) {
      console.log(`  (no encontrados en esta DB, sin efecto: ${stats.notFound.join(', ')})`)
    }

    console.log(
      [
        'BotConfig.verticalPack backfill (D.1)',
        `- ${dryRun ? 'A actualizar' : 'Actualizados'}: ${stats.updated}`,
        `- Sin cambios:      ${stats.unchanged}`,
        `- No encontrados:   ${stats.notFound.length}`,
      ].join('\n'),
    )

    if (dryRun && stats.updated > 0) {
      console.log(
        '\nEsto fue un dry-run: no se escribió nada. Para aplicar de verdad, correr sin ' +
        '--dry-run y sin DRY_RUN=1.',
      )
    }
  } catch (error: unknown) {
    console.error('Error en el backfill de verticalPack:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? '')).href) {
  void runBackfillVerticalPack()
}

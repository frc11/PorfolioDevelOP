/**
 * CONTACT-PATH — Alta QUIRÚRGICA del slug `confirm_contact_request` en
 * `Plan.tools`. Toca ESA columna y nada más.
 *
 * POR QUÉ NO `sync-plans.ts`. Ese seed hace
 * `prisma.plan.update({ where: { key }, data: next })` con el objeto COMPLETO
 * (`sync-plans.ts:168-171`), y su `hasPlanChanged` compara las 13 columnas: un
 * drift en UNA sola marca la fila como cambiada y se sobrescriben TODAS —
 * `monthlyPrice`, `setupFloorPrice`, `quota`, `maxDomains`, `llmModel`,
 * `reportsEnabled`, `insightEnabled`, `crmEnabled`, `supportTier`, `active`,
 * `sortOrder`, `name`. Cualquier ajuste hecho a mano en producción se revierte
 * en silencio. La Neon es compartida, así que ese riesgo no se corre.
 *
 * (Los overrides por cliente viven en `Subscription` — `priceOverride`,
 * `overrideUntil`, `overrideReason` — y ningún script de planes los toca. Lo
 * que sí es global, y por eso está en riesgo con el seed completo, son las
 * cuotas, precios y límites del catálogo.)
 *
 * QUÉ HACE: por cada fila `Plan`, si `tools` no incluye el slug, lo AGREGA al
 * final preservando el resto del array. Idempotente: correrlo N veces deja el
 * mismo estado y reporta `unchanged`. No crea ni borra filas, y no toca planes
 * cuya `key` no esté en el catálogo.
 *
 * Dev:
 *   npx tsx prisma/seeds/add-contact-tool.ts
 * Prod:
 *   DATABASE_URL=<prod> npx tsx prisma/seeds/add-contact-tool.ts
 *
 * Sin este paso el fix NO surte efecto: `getTools` filtra por `plan.tools`
 * (`server/tools/getTools.ts`), así que el slug ausente se descarta en silencio
 * y el camino de contacto vuelve a cerrar sin texto.
 */
import { PrismaClient } from '@prisma/client'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const prisma = new PrismaClient()

/** El único slug que este script agrega. */
export const CONTACT_TOOL_SLUG = 'confirm_contact_request'

export interface AddContactToolStats {
  updated: number
  unchanged: number
}

export async function addContactToolToPlans(): Promise<AddContactToolStats> {
  const plans = await prisma.plan.findMany({ select: { id: true, key: true, tools: true } })

  let updated = 0
  let unchanged = 0

  for (const plan of plans) {
    if (plan.tools.includes(CONTACT_TOOL_SLUG)) {
      unchanged += 1
      continue
    }
    // `data` con UNA sola clave: ninguna otra columna se toca.
    await prisma.plan.update({
      where: { id: plan.id },
      data: { tools: [...plan.tools, CONTACT_TOOL_SLUG] },
    })
    console.log(`  + ${plan.key}: ${plan.tools.join(', ')} -> +${CONTACT_TOOL_SLUG}`)
    updated += 1
  }

  return { updated, unchanged }
}

export async function runAddContactTool() {
  try {
    const stats = await addContactToolToPlans()
    console.log(
      [
        `Plan.tools sync (${CONTACT_TOOL_SLUG})`,
        `- Updated:   ${stats.updated}`,
        `- Unchanged: ${stats.unchanged}`,
      ].join('\n'),
    )
  } catch (error: unknown) {
    console.error('Error agregando el slug a Plan.tools:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? '')).href) {
  void runAddContactTool()
}

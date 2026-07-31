/**
 * B4.1 — Seed idempotente del modelo Plan.
 *
 * Siembra los 3 planes lockeados (STARTER / PRO / BUSINESS) con los valores
 * exactos de la economía decidida en el prompt B4.1. Patrón espejo de
 * `sync-premium-modules.ts`: upsert por `key`, sólo actualiza si cambió,
 * reporta stats (created / updated / unchanged).
 *
 * Correrlo en dev:
 *   npx tsx prisma/seeds/sync-plans.ts
 *
 * Correrlo en prod (después de `prisma migrate deploy`):
 *   DATABASE_URL=<prod> npx tsx prisma/seeds/sync-plans.ts
 *
 * Es idempotente: correrlo dos veces no duplica filas ni cambia nada si
 * no hay drift entre catálogo y DB.
 */
import { Prisma, PrismaClient, type Plan, PlanKey, SupportTier } from '@prisma/client'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const prisma = new PrismaClient()

type PlanWrite = {
  key: PlanKey
  name: string
  monthlyPrice: Prisma.Decimal
  setupFloorPrice: Prisma.Decimal
  quota: number
  llmModel: string
  tools: string[]
  maxDomains: number | null
  reportsEnabled: boolean
  insightEnabled: boolean
  crmEnabled: boolean
  supportTier: SupportTier
  active: boolean
  sortOrder: number
}

// CONTACT-PATH — `confirm_contact_request` va en TODOS los planes, incluido
// Starter: el camino "que me contacten" no es una feature premium, es la mitad
// de la conversión (hay visitantes que no quieren WhatsApp). Sin el slug acá, el
// filtro por plan de `getTools` lo descarta en silencio y el turno vuelve a
// cerrar sin texto.
//
// ⚠️ Actualizar este catálogo NO alcanza para producción: `Plan.tools` es una
// columna de la DB. Pero correr ESTE seed pisaría las 13 columnas de cada Plan
// (precios, cuotas, límites) con los valores de acá — ver el aviso del
// encabezado. Para aplicarlo se usa el script quirúrgico
// `prisma/seeds/add-contact-tool.ts`, que solo toca `tools`.
const BASE_TOOLS_5 = [
  'capture_lead',
  'offer_handoff_options',
  'show_whatsapp_handoff',
  'navigate_to_page',
  'confirm_contact_request',
] as const

const STARTER_TOOLS = [
  'capture_lead',
  'show_whatsapp_handoff',
  'confirm_contact_request',
] as const

export const PLANS_CATALOG: readonly PlanWrite[] = [
  {
    key: PlanKey.STARTER,
    name: 'Starter',
    monthlyPrice: new Prisma.Decimal('49'),
    setupFloorPrice: new Prisma.Decimal('700'),
    quota: 500,
    llmModel: 'gemini-2.5-flash',
    tools: [...STARTER_TOOLS],
    maxDomains: 1,
    reportsEnabled: false,
    insightEnabled: false,
    crmEnabled: false,
    supportTier: SupportTier.STANDARD,
    active: true,
    sortOrder: 10,
  },
  {
    key: PlanKey.PRO,
    name: 'Pro',
    monthlyPrice: new Prisma.Decimal('90'),
    setupFloorPrice: new Prisma.Decimal('900'),
    quota: 3000,
    llmModel: 'gemini-2.5-flash',
    tools: [...BASE_TOOLS_5],
    maxDomains: 3,
    reportsEnabled: true,
    insightEnabled: true,
    crmEnabled: false,
    supportTier: SupportTier.PRIORITY,
    active: true,
    sortOrder: 20,
  },
  {
    key: PlanKey.BUSINESS,
    name: 'Business',
    monthlyPrice: new Prisma.Decimal('150'),
    setupFloorPrice: new Prisma.Decimal('1000'),
    quota: 5000,
    llmModel: 'gemini-2.5-flash',
    tools: [...BASE_TOOLS_5],
    maxDomains: null,
    reportsEnabled: true,
    insightEnabled: true,
    crmEnabled: true,
    supportTier: SupportTier.PRIORITY_24H,
    active: true,
    sortOrder: 30,
  },
] as const

type SyncStats = {
  created: number
  updated: number
  unchanged: number
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function hasPlanChanged(existing: Plan, next: PlanWrite): boolean {
  return (
    existing.name !== next.name ||
    !existing.monthlyPrice.equals(next.monthlyPrice) ||
    !existing.setupFloorPrice.equals(next.setupFloorPrice) ||
    existing.quota !== next.quota ||
    existing.llmModel !== next.llmModel ||
    !arraysEqual(existing.tools, next.tools) ||
    existing.maxDomains !== next.maxDomains ||
    existing.reportsEnabled !== next.reportsEnabled ||
    existing.insightEnabled !== next.insightEnabled ||
    existing.crmEnabled !== next.crmEnabled ||
    existing.supportTier !== next.supportTier ||
    existing.active !== next.active ||
    existing.sortOrder !== next.sortOrder
  )
}

export async function syncPlans(): Promise<SyncStats> {
  const existingPlans = await prisma.plan.findMany()
  const existingByKey = new Map(existingPlans.map((plan) => [plan.key, plan]))

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const next of PLANS_CATALOG) {
    const existing = existingByKey.get(next.key)
    if (!existing) {
      await prisma.plan.create({ data: next })
      created++
      continue
    }
    if (!hasPlanChanged(existing, next)) {
      unchanged++
      continue
    }
    await prisma.plan.update({
      where: { key: next.key },
      data: next,
    })
    updated++
  }

  return { created, updated, unchanged }
}

export async function runSyncPlans() {
  try {
    const stats = await syncPlans()
    console.log(
      [
        'Plans synced',
        `- Created: ${stats.created}`,
        `- Updated: ${stats.updated}`,
        `- Unchanged: ${stats.unchanged}`,
      ].join('\n'),
    )
  } catch (error: unknown) {
    console.error('Error syncing plans:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? '')).href) {
  void runSyncPlans()
}

/**
 * B4.1 — Migración idempotente de Subscription.planName → Subscription.planId.
 *
 * Mapeo explícito:
 *   - "Plan Profesional"   → BUSINESS  (price match exacto $150 + sugerencia del prompt B4.1)
 *   - "Plan AI Care"       → FLAG (sin mapeo; queda planId=null → fallback Starter en runtime)
 *   - "Plan Maintenance"   → FLAG (sin mapeo; queda planId=null → fallback Starter en runtime)
 *   - cualquier otro       → FLAG
 *
 * Reglas:
 *   - Idempotente: re-correrla no duplica filas ni cambia nada estable.
 *   - Si una sub ya tiene `planId` seteado y coincide con el mapeo → unchanged.
 *   - Si tiene `planId` seteado pero NO coincide con el mapeo → FLAG (no toca: asume asignación manual previa).
 *   - planName no se borra acá (deprecation en sprint posterior).
 *   - No asigna planId arbitrario para FLAG: queda null y el runtime usa PLAN_FALLBACK (Starter).
 *
 * Correrlo en dev:
 *   npx tsx prisma/seeds/migrate-subscriptions-to-plan-id.ts
 *
 * Correrlo en prod (después de `prisma migrate deploy` + `sync-plans.ts`):
 *   DATABASE_URL=<prod> npx tsx prisma/seeds/migrate-subscriptions-to-plan-id.ts
 */
import { PrismaClient, PlanKey } from '@prisma/client'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const prisma = new PrismaClient()

/**
 * Mapeo viejo planName libre → PlanKey nuevo.
 * `null` = FLAG explícito sin asignación.
 */
const PLAN_NAME_TO_KEY: Record<string, PlanKey | null> = {
  'Plan Profesional': PlanKey.BUSINESS,
  'Plan AI Care': null,
  'Plan Maintenance': null,
}

type MigrationStats = {
  total: number
  assigned: number
  alreadyAssigned: number
  flagged: number
  conflicts: number
}

type FlagEntry = {
  orgSlug: string
  planName: string
  price: number
  status: string
  reason: string
}

export async function migrateSubscriptionsToPlanId(): Promise<{
  stats: MigrationStats
  flags: FlagEntry[]
}> {
  const subs = await prisma.subscription.findMany({
    select: {
      id: true,
      planName: true,
      planId: true,
      price: true,
      status: true,
      organization: { select: { slug: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const plans = await prisma.plan.findMany({ select: { id: true, key: true } })
  const planIdByKey = new Map(plans.map((p) => [p.key, p.id]))

  const stats: MigrationStats = {
    total: subs.length,
    assigned: 0,
    alreadyAssigned: 0,
    flagged: 0,
    conflicts: 0,
  }
  const flags: FlagEntry[] = []

  for (const sub of subs) {
    const mapping = PLAN_NAME_TO_KEY[sub.planName]
    const targetKey = mapping ?? null

    if (targetKey === null) {
      stats.flagged++
      flags.push({
        orgSlug: sub.organization.slug,
        planName: sub.planName,
        price: sub.price,
        status: sub.status,
        reason: mapping === undefined
          ? `planName "${sub.planName}" no está en el mapeo conocido`
          : `planName "${sub.planName}" está flagged explícitamente (sin mapeo)`,
      })
      continue
    }

    const targetId = planIdByKey.get(targetKey)
    if (!targetId) {
      throw new Error(
        `Plan con key=${targetKey} no existe en la DB. Correr 'sync-plans.ts' primero.`,
      )
    }

    if (sub.planId === targetId) {
      stats.alreadyAssigned++
      continue
    }

    if (sub.planId !== null && sub.planId !== targetId) {
      // ya hay un planId distinto al mapeo: respeto la asignación manual previa
      stats.conflicts++
      flags.push({
        orgSlug: sub.organization.slug,
        planName: sub.planName,
        price: sub.price,
        status: sub.status,
        reason: `planId actual (${sub.planId}) NO coincide con el mapeo (${targetKey}=${targetId}). Asumo asignación manual previa, no se toca.`,
      })
      continue
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { planId: targetId },
    })
    stats.assigned++
  }

  return { stats, flags }
}

export async function runMigrateSubscriptionsToPlanId() {
  try {
    const { stats, flags } = await migrateSubscriptionsToPlanId()
    console.log('=== B4.1 — Migración Subscription.planId ===')
    console.log(`Total subs: ${stats.total}`)
    console.log(`  Assigned (planId nuevo):       ${stats.assigned}`)
    console.log(`  Already assigned (unchanged):  ${stats.alreadyAssigned}`)
    console.log(`  Flagged (sin asignación):      ${stats.flagged}`)
    console.log(`  Conflicts (planId previo):     ${stats.conflicts}`)
    if (flags.length > 0) {
      console.log('\n🚩 Flags para Franco:')
      for (const f of flags) {
        console.log(
          `  - [${f.orgSlug}] "${f.planName}" $${f.price} ${f.status}\n    → ${f.reason}`,
        )
      }
    } else {
      console.log('\nSin flags. Mapeo completo.')
    }
  } catch (error: unknown) {
    console.error('Error en migración:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? '')).href) {
  void runMigrateSubscriptionsToPlanId()
}

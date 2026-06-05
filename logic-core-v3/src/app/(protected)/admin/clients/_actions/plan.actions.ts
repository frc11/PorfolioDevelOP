'use server'

import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { Prisma, PlanKey, SubscriptionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { logAdminAction } from '@/lib/audit-log'
import { invalidateOrgPlanCache } from '@/lib/plan'
import {
  AssignPlanSchema,
  type AssignPlanInput,
  SetBillingOverrideSchema,
  type SetBillingOverrideInput,
  ClearBillingOverrideSchema,
  type ClearBillingOverrideInput,
} from './plan.schemas'

/**
 * B4.3 — Server actions de gestión de plan + billing override.
 *
 * Reglas clave (lockeadas):
 *   - Upgrade (sortOrder MAYOR): aplica inmediato, resetea QuotaUsage del mes,
 *     setea planId/lastPlanChangedAt, invalida cache de plan, audit log.
 *   - Downgrade (sortOrder MENOR): NO toca planId actual. Setea
 *     pendingPlanId + pendingPlanEffectiveAt (primer día del próximo
 *     mes UTC). El lazy apply en `getPlanForOrg` lo activa en cambio
 *     de ciclo. Audit log igual.
 *   - Same plan: no-op (devuelve "unchanged").
 *
 * Billing override es CAMPO SEPARADO. Server-actions distintas. El
 * gating siempre lee el Plan; el billing/facturación lee el override
 * cuando está vigente.
 */

type PlanChangeKind = 'upgraded' | 'downgraded' | 'unchanged' | 'first_assignment'

export interface AssignPlanResult {
  kind: PlanChangeKind
  /** Plan que está activo AHORA (no cambia en downgrade). */
  effectivePlanKey: PlanKey
  /** Si es downgrade, el plan al que se va a bajar y cuándo. */
  pending?: { planKey: PlanKey; effectiveAt: string }
}

function startOfNextMonthUtc(): Date {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  )
}

function currentPeriodKey(): { year: number; month: number } {
  const d = new Date()
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 }
}

/**
 * Resetea el contador `conversationsCount` del período actual para
 * TODOS los bots de la org. Tokens y cost no se tocan (son métricas
 * agregadas, no cap). Upsert atómico — si la fila del período no
 * existe, la crea con count=0.
 */
async function resetCurrentPeriodQuotaForOrg(orgId: string): Promise<number> {
  const bots = await prisma.botConfig.findMany({
    where: { organizationId: orgId },
    select: { id: true },
  })
  if (bots.length === 0) return 0
  const { year, month } = currentPeriodKey()
  await prisma.$transaction(
    bots.map((bot) =>
      prisma.quotaUsage.upsert({
        where: { botConfigId_year_month: { botConfigId: bot.id, year, month } },
        create: { botConfigId: bot.id, year, month, conversationsCount: 0 },
        update: { conversationsCount: 0 },
      }),
    ),
  )
  return bots.length
}

export async function assignPlanToOrg(
  input: AssignPlanInput,
): Promise<ActionResult<AssignPlanResult>> {
  try {
    const userId = await requireSuperAdmin()
    const parsed = AssignPlanSchema.safeParse(input)
    if (!parsed.success) {
      return fail(`Input inválido: ${parsed.error.issues[0]?.message ?? 'unknown'}`)
    }
    const { organizationId, planKey, reason } = parsed.data

    const session = await auth()
    const targetPlan = await prisma.plan.findUnique({ where: { key: planKey } })
    if (!targetPlan) {
      return fail(`Plan ${planKey} no existe — correr sync-plans.ts.`)
    }

    const existing = await prisma.subscription.findUnique({
      where: { organizationId },
      include: {
        plan: { select: { key: true, sortOrder: true } },
        pendingPlan: { select: { key: true } },
      },
    })

    const previousKey: PlanKey | null = existing?.plan?.key ?? null
    const previousSortOrder = existing?.plan?.sortOrder ?? -1
    const targetSortOrder = targetPlan.sortOrder

    let kind: PlanChangeKind
    if (existing === null || existing.planId === null) {
      kind = 'first_assignment'
    } else if (targetSortOrder > previousSortOrder) {
      kind = 'upgraded'
    } else if (targetSortOrder < previousSortOrder) {
      kind = 'downgraded'
    } else {
      kind = 'unchanged'
    }

    if (kind === 'unchanged') {
      // Limpia cualquier pending obsoleto que apunte a este mismo plan.
      if (existing?.pendingPlanId) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: { pendingPlanId: null, pendingPlanEffectiveAt: null },
        })
      }
      return ok({ kind, effectivePlanKey: planKey })
    }

    const now = new Date()

    if (kind === 'downgraded') {
      const effectiveAt = startOfNextMonthUtc()
      await prisma.subscription.update({
        where: { id: existing!.id },
        data: {
          pendingPlanId: targetPlan.id,
          pendingPlanEffectiveAt: effectiveAt,
        },
      })

      await logAdminAction({
        userId,
        userEmail: session?.user?.email ?? undefined,
        userName: session?.user?.name ?? undefined,
        actionType: 'SUBSCRIPTION_CHANGED',
        action: `Downgrade programado: ${previousKey} → ${planKey}`,
        targetType: 'Organization',
        targetId: organizationId,
        diff: {
          plan: { before: previousKey, after_pending: planKey },
          pendingPlanEffectiveAt: { before: null, after: effectiveAt.toISOString() },
        },
        metadata: {
          kind: 'downgrade',
          reason: reason ?? null,
          previousSortOrder,
          targetSortOrder,
        },
      })

      invalidateOrgPlanCache(organizationId)
      revalidatePath(`/admin/clients/${organizationId}`)
      revalidatePath('/admin/clients')

      return ok({
        kind,
        effectivePlanKey: previousKey ?? planKey,
        pending: { planKey, effectiveAt: effectiveAt.toISOString() },
      })
    }

    // first_assignment + upgraded: aplican inmediato.
    const subData: Prisma.SubscriptionUncheckedUpdateInput = {
      planId: targetPlan.id,
      pendingPlanId: null,
      pendingPlanEffectiveAt: null,
      lastPlanChangedAt: now,
    }

    if (existing === null) {
      await prisma.subscription.create({
        data: {
          organizationId,
          planId: targetPlan.id,
          status: SubscriptionStatus.ACTIVE,
          price: targetPlan.monthlyPrice.toNumber(),
          currency: 'USD',
          lastPlanChangedAt: now,
        },
      })
    } else {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: subData,
      })
    }

    // Upgrade → resetea cuota del mes en curso.
    let resetCount = 0
    if (kind === 'upgraded' || kind === 'first_assignment') {
      resetCount = await resetCurrentPeriodQuotaForOrg(organizationId)
    }

    await logAdminAction({
      userId,
      userEmail: session?.user?.email ?? undefined,
      userName: session?.user?.name ?? undefined,
      actionType: 'SUBSCRIPTION_CHANGED',
      action:
        kind === 'first_assignment'
          ? `Plan asignado: ${planKey}`
          : `Upgrade aplicado: ${previousKey} → ${planKey}`,
      targetType: 'Organization',
      targetId: organizationId,
      diff: {
        plan: { before: previousKey, after: planKey },
      },
      metadata: {
        kind,
        reason: reason ?? null,
        previousSortOrder,
        targetSortOrder,
        quotaResetForBots: resetCount,
      },
    })

    invalidateOrgPlanCache(organizationId)
    revalidatePath(`/admin/clients/${organizationId}`)
    revalidatePath('/admin/clients')

    return ok({ kind, effectivePlanKey: planKey })
  } catch (error) {
    console.error('assignPlanToOrg error:', error)
    return fail(error instanceof Error ? error.message : 'Error desconocido.')
  }
}

export async function setBillingOverride(
  input: SetBillingOverrideInput,
): Promise<ActionResult<{ priceOverride: number; overrideUntil: string }>> {
  try {
    const userId = await requireSuperAdmin()
    const parsed = SetBillingOverrideSchema.safeParse(input)
    if (!parsed.success) {
      return fail(`Input inválido: ${parsed.error.issues[0]?.message ?? 'unknown'}`)
    }
    const { organizationId, priceOverride, overrideUntil, reason } = parsed.data
    const session = await auth()

    const existing = await prisma.subscription.findUnique({
      where: { organizationId },
      select: {
        id: true,
        priceOverride: true,
        overrideUntil: true,
        overrideReason: true,
      },
    })
    if (!existing) {
      return fail(
        'La org no tiene Subscription todavía. Asigná un plan primero (eso crea la sub) y después setea el override.',
      )
    }

    const overrideUntilDate = new Date(overrideUntil)

    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        priceOverride: new Prisma.Decimal(priceOverride),
        overrideUntil: overrideUntilDate,
        overrideReason: reason ?? null,
      },
    })

    await logAdminAction({
      userId,
      userEmail: session?.user?.email ?? undefined,
      userName: session?.user?.name ?? undefined,
      actionType: 'SUBSCRIPTION_CHANGED',
      action: `Billing override seteado: $${priceOverride} hasta ${overrideUntilDate.toISOString().slice(0, 10)}`,
      targetType: 'Organization',
      targetId: organizationId,
      diff: {
        priceOverride: {
          before: existing.priceOverride?.toNumber() ?? null,
          after: priceOverride,
        },
        overrideUntil: {
          before: existing.overrideUntil?.toISOString() ?? null,
          after: overrideUntilDate.toISOString(),
        },
        overrideReason: {
          before: existing.overrideReason,
          after: reason ?? null,
        },
      },
      metadata: { kind: 'billing_override_set' },
    })

    revalidatePath(`/admin/clients/${organizationId}`)
    revalidatePath('/admin/clients')

    return ok({
      priceOverride,
      overrideUntil: overrideUntilDate.toISOString(),
    })
  } catch (error) {
    console.error('setBillingOverride error:', error)
    return fail(error instanceof Error ? error.message : 'Error desconocido.')
  }
}

export async function clearBillingOverride(
  input: ClearBillingOverrideInput,
): Promise<ActionResult<void>> {
  try {
    const userId = await requireSuperAdmin()
    const parsed = ClearBillingOverrideSchema.safeParse(input)
    if (!parsed.success) {
      return fail(`Input inválido: ${parsed.error.issues[0]?.message ?? 'unknown'}`)
    }
    const { organizationId } = parsed.data
    const session = await auth()

    const existing = await prisma.subscription.findUnique({
      where: { organizationId },
      select: { id: true, priceOverride: true, overrideUntil: true, overrideReason: true },
    })
    if (!existing) return fail('Sin Subscription.')
    if (existing.priceOverride === null && existing.overrideUntil === null) {
      return ok(undefined)
    }

    await prisma.subscription.update({
      where: { id: existing.id },
      data: { priceOverride: null, overrideUntil: null, overrideReason: null },
    })

    await logAdminAction({
      userId,
      userEmail: session?.user?.email ?? undefined,
      userName: session?.user?.name ?? undefined,
      actionType: 'SUBSCRIPTION_CHANGED',
      action: 'Billing override quitado',
      targetType: 'Organization',
      targetId: organizationId,
      diff: {
        priceOverride: {
          before: existing.priceOverride?.toNumber() ?? null,
          after: null,
        },
        overrideUntil: {
          before: existing.overrideUntil?.toISOString() ?? null,
          after: null,
        },
      },
      metadata: { kind: 'billing_override_clear' },
    })

    revalidatePath(`/admin/clients/${organizationId}`)
    revalidatePath('/admin/clients')

    return ok(undefined)
  } catch (error) {
    console.error('clearBillingOverride error:', error)
    return fail(error instanceof Error ? error.message : 'Error desconocido.')
  }
}

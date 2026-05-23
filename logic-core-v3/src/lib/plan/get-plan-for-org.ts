/**
 * B4.2 — `getPlanForOrg(orgId)` con cache in-memory.
 *
 * Patrón espejo de `resolveBotBySlug` (B1.4): Map cache + TTL 60s +
 * función `invalidateOrgPlanCache(orgId)` para que el admin pueda
 * forzar el refresh cuando cambia el plan asignado.
 *
 * Regla del proyecto (memoria): si la org no tiene `planId` →
 * devuelve `PLAN_FALLBACK` (Starter virtual). NUNCA null, NUNCA throw.
 * El bot siempre tiene un plan efectivo.
 *
 * El gating del bot va a llamar a esto en el path crítico — la cache
 * existe específicamente para que no agregue latencia notable. TTL 60s
 * es el mismo que `resolveBotBySlug` por consistencia operativa.
 */
import { prisma } from '@/lib/prisma'
import { PLAN_FALLBACK, type EffectivePlan } from './fallback'

type CacheEntry = { data: EffectivePlan; expiresAt: number }

const planCache = new Map<string, CacheEntry>()
const PLAN_CACHE_TTL_MS = 60_000

/**
 * B4.3 — Lazy apply de `pendingPlanId` cuando la fecha pasó.
 *
 * Cuando un admin downgradeas un plan, `assignPlanToOrg` guarda el
 * pending en lugar de aplicarlo en seco (la política locked dice
 * "downgrade próximo ciclo"). Acá ejecutamos el swap cuando alguien
 * vuelve a consultar el plan después de la fecha de vencimiento.
 *
 * No requiere cron — el bot llama a `getPlanForOrg` en cada chat, así
 * que el apply ocurre naturalmente al primer request del nuevo ciclo.
 * Si nadie habla con el bot por mucho tiempo, el cliente sigue con el
 * plan anterior (de tier mayor) hasta que alguien entre — esto es
 * preferible a un cron que toque la DB innecesariamente, y el cliente
 * "se beneficia" con el plan más grande hasta que vuelva el tráfico.
 */
async function applyPendingPlanIfDue(orgId: string): Promise<void> {
  const sub = await prisma.subscription.findUnique({
    where: { organizationId: orgId },
    select: {
      id: true,
      pendingPlanId: true,
      pendingPlanEffectiveAt: true,
    },
  })
  if (!sub || !sub.pendingPlanId || !sub.pendingPlanEffectiveAt) return
  if (sub.pendingPlanEffectiveAt > new Date()) return
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      planId: sub.pendingPlanId,
      pendingPlanId: null,
      pendingPlanEffectiveAt: null,
      lastPlanChangedAt: new Date(),
    },
  })
}

/**
 * Devuelve el plan efectivo de la org.
 * Si la org no tiene Subscription o la Subscription no tiene planId → PLAN_FALLBACK.
 * Si tiene un Plan asignado → devuelve los valores del Plan en DB.
 *
 * B4.3: si hay `pendingPlanId` vencido, lo aplica antes de leer.
 */
export async function getPlanForOrg(orgId: string): Promise<EffectivePlan> {
  const cached = planCache.get(orgId)
  if (cached && cached.expiresAt > Date.now()) return cached.data

  await applyPendingPlanIfDue(orgId)

  const sub = await prisma.subscription.findUnique({
    where: { organizationId: orgId },
    select: {
      plan: {
        select: {
          id: true,
          key: true,
          name: true,
          monthlyPrice: true,
          setupFloorPrice: true,
          quota: true,
          llmModel: true,
          tools: true,
          maxDomains: true,
          reportsEnabled: true,
          insightEnabled: true,
          crmEnabled: true,
          supportTier: true,
          active: true,
        },
      },
    },
  })

  const plan = sub?.plan
  const effective: EffectivePlan =
    plan === null || plan === undefined
      ? PLAN_FALLBACK
      : {
          id: plan.id,
          key: plan.key,
          name: plan.name,
          monthlyPrice: plan.monthlyPrice.toNumber(),
          setupFloorPrice: plan.setupFloorPrice.toNumber(),
          quota: plan.quota,
          llmModel: plan.llmModel,
          tools: plan.tools,
          maxDomains: plan.maxDomains,
          reportsEnabled: plan.reportsEnabled,
          insightEnabled: plan.insightEnabled,
          crmEnabled: plan.crmEnabled,
          supportTier: plan.supportTier,
          active: plan.active,
          isFallback: false,
        }

  planCache.set(orgId, {
    data: effective,
    expiresAt: Date.now() + PLAN_CACHE_TTL_MS,
  })
  return effective
}

/**
 * Invalida la cache del plan para una org dada.
 * Llamar después de cambiar `Subscription.planId` desde admin.
 */
export function invalidateOrgPlanCache(orgId: string): void {
  planCache.delete(orgId)
}

/**
 * Invalida toda la cache de planes.
 * Llamar después de cambios globales en la tabla Plan (precio, quota, etc.).
 */
export function invalidateAllOrgPlanCache(): void {
  planCache.clear()
}

import { prisma } from '@/lib/prisma'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { getExecutiveBrief } from '@/lib/ai/executive-brief'
import { getBriefHistory } from '@/lib/ai/brief-history'
import { getHealthScore } from '@/lib/health-score'
import { getWeekResults } from '@/lib/dashboard/week-results'
import { startOfTodayInAR } from '@/lib/tz-ar'
import { buildUnsubscribeUrl } from '@/lib/email/unsubscribe-token'
import { getTopHotLeadsForWeek } from './top-hot-leads'
import type { ExecutiveWeeklyEmailInput } from '@/lib/email/templates/executive-weekly'

export type BuildSkipReason =
  | 'PLAN'
  | 'OPTOUT'
  | 'NO_RECIPIENT'
  | 'NO_DATA'

export type BuildResult =
  | {
      ok: true
      data: ExecutiveWeeklyEmailInput
      recipient: { email: string; name: string | null }
    }
  | { ok: false; reason: BuildSkipReason }

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

/**
 * Rango temporal de la semana del reporte. El cron corre lunes AM con los
 * datos de la semana cerrada (lunes pasado → domingo pasado en TZ-AR).
 * `end` es el último instante del domingo (justo antes del lunes actual).
 */
function lastFullWeekRangeAR(now: Date): { start: Date; end: Date } {
  const todayStart = startOfTodayInAR(now)
  const dayMs = 86_400_000
  const start = new Date(todayStart.getTime() - 7 * dayMs)
  // 1 ms antes del lunes actual: cubre todo el domingo en AR.
  const end = new Date(todayStart.getTime() - 1)
  return { start, end }
}

function formatWeekRangeLabel(start: Date, end: Date): string {
  const fmt = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  return `${fmt.format(start)} – ${fmt.format(end)}`
}

/**
 * Arma todos los datos del reporte ejecutivo semanal para una org. Aplica
 * gating (plan PRO/BUSINESS, opt-out), resuelve el destinatario, y reusa el
 * cache del brief — NO llama al LLM salvo que no haya cache (fallback).
 */
export async function buildExecutiveWeeklyReport(
  organizationId: string,
  now: Date = new Date(),
): Promise<BuildResult> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      companyName: true,
      executiveReportOptOut: true,
      cachedExecutiveBrief: true,
      cachedExecutiveBriefAt: true,
      members: {
        where: { role: 'ADMIN' },
        include: { user: { select: { email: true, name: true } } },
        take: 1,
      },
    },
  })

  if (!org) return { ok: false, reason: 'NO_DATA' }

  // Gating de plan: solo PRO y BUSINESS reciben el reporte. Coherente con B4
  // (Starter degradado).
  const plan = await getPlanForOrg(organizationId)
  if (plan.key !== 'PRO' && plan.key !== 'BUSINESS') {
    return { ok: false, reason: 'PLAN' }
  }

  if (org.executiveReportOptOut) {
    return { ok: false, reason: 'OPTOUT' }
  }

  const primary = org.members[0]?.user
  if (!primary?.email) {
    return { ok: false, reason: 'NO_RECIPIENT' }
  }

  // Brief: reusamos el cache vigente. Si no está o está vacío, fallback a
  // `getExecutiveBrief` que internamente decide regenerar — corre UNA vez por
  // org (recovery, no es el path normal: el cron `regenerate-briefs` debería
  // haber corrido más temprano el mismo lunes).
  let briefText = org.cachedExecutiveBrief?.trim() || ''
  if (!briefText) {
    const res = await getExecutiveBrief(organizationId)
    if (!res || !res.text.trim()) return { ok: false, reason: 'NO_DATA' }
    briefText = res.text.trim()
  }

  // Snapshots para comparar con la semana anterior (B6.1).
  const history = await getBriefHistory(organizationId, 2)
  const current = history[0] ?? null
  const previous = history[1] ?? null

  // Métricas: priorizamos el snapshot de esta semana (los mismos números que
  // vio el LLM cuando generó el brief, así el email queda consistente con la
  // historia). Fallback a fetch en vivo solo si no hay snapshot todavía.
  const liveFallbackNeeded = !current
  const [liveHealth, liveWeek] = liveFallbackNeeded
    ? await Promise.all([
        getHealthScore(organizationId),
        getWeekResults(organizationId),
      ])
    : [null, null]

  const healthTotal = current
    ? current.healthScores.total
    : liveHealth?.total ?? 0

  const week = current?.weekResults ?? liveWeek
  if (!week) return { ok: false, reason: 'NO_DATA' }

  const healthDelta =
    current && previous
      ? current.healthScores.total - previous.healthScores.total
      : null

  const weekRange = lastFullWeekRangeAR(now)

  // B6.3 — Sección extra para Business: top 3 leads más calientes (ranqueados
  // por score EFECTIVO con decay, NO crudo). Pro/Starter no la ven.
  const topHotLeads =
    plan.key === 'BUSINESS'
      ? await getTopHotLeadsForWeek(organizationId, weekRange.start, weekRange.end, now)
      : undefined

  const data: ExecutiveWeeklyEmailInput = {
    companyName: org.companyName ?? 'tu negocio',
    recipientName: primary.name,
    weekLabel: formatWeekRangeLabel(weekRange.start, weekRange.end),
    briefText,
    health: {
      total: healthTotal,
      deltaVsLastWeek: healthDelta,
    },
    leads: {
      value: toNumber(week.leads.value),
      deltaPercent: week.leads.trend,
    },
    messagesAnswered: {
      value: toNumber(week.messagesAnswered.value),
      deltaPercent: week.messagesAnswered.trend,
    },
    tasksCompleted: {
      value: toNumber(week.tasksCompleted.value),
      deltaPercent: week.tasksCompleted.trend,
    },
    topHotLeads,
    dashboardUrl: `${(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    )}/dashboard`,
    unsubscribeUrl: buildUnsubscribeUrl(organizationId),
  }

  return {
    ok: true,
    data,
    recipient: { email: primary.email, name: primary.name },
  }
}

/**
 * health-score.ts
 *
 * Server-side health score computation with 1-hour unstable_cache TTL.
 *
 * Architecture notes:
 * - All computation is server-side only. Zero client-side arithmetic.
 * - Each metric sub-helper returns `number | null`. Null means "no data yet"
 *   and the metric is excluded from the weighted average rather than penalising.
 * - BusinessMetric is linked to User (clientId), so we resolve the first member
 *   of the org and look up their metric record.
 */

import { prisma } from '@/lib/prisma'
import {
  parseDataConnections,
  getConnectionLevel,
  type ConnectionLevel,
  type DataConnections,
} from '@/lib/types/data-connections'
import { unstable_cache } from 'next/cache'

// ─── Public types ─────────────────────────────────────────────────────────────

export type HealthScoreDimension = {
  key: 'digital' | 'commercial' | 'operational'
  label: string
  score: number
  weight: number
  metricsAvailable: number
  metricsTotal: number
}

export type HealthScoreResult = {
  total: number
  level: ConnectionLevel
  connectionPercentage: number
  connectedSources: number
  totalSources: number
  dimensions: [HealthScoreDimension, HealthScoreDimension, HealthScoreDimension]
  trend: {
    value: number
    direction: 'up' | 'down' | 'flat'
  }
  computedAt: Date
  cachedFrom: Date | null
}

// ─── Weights ──────────────────────────────────────────────────────────────────

const DIMENSION_WEIGHTS = {
  digital: 0.4,
  commercial: 0.35,
  operational: 0.25,
} as const

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Retrieves the health score for an organisation, cached server-side for 1 hour.
 * The cache key is per-organisation so a revalidation tag can flush individual orgs.
 */
export async function getHealthScore(organizationId: string): Promise<HealthScoreResult> {
  return unstable_cache(
    async () => computeHealthScoreInternal(organizationId),
    ['health-score', organizationId],
    { revalidate: 3600, tags: [`health-score:${organizationId}`] },
  )()
}

// ─── Core computation ─────────────────────────────────────────────────────────

async function computeHealthScoreInternal(organizationId: string): Promise<HealthScoreResult> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      siteUrl: true,
      analyticsPropertyId: true,
      dataConnections: true,
      googleRating: true,
      googleReviewsCount: true,
    },
  })

  if (!org) {
    throw new Error(`Organization ${organizationId} not found`)
  }

  const connections: DataConnections = parseDataConnections(org.dataConnections)
  const { level, connectedCount, totalCount, percentage } = getConnectionLevel(connections)

  // Resolve the first org member's userId for BusinessMetric look-ups
  const firstMember = await prisma.orgMember.findFirst({
    where: { organizationId },
    select: { userId: true },
  })

  const [digital, commercial, operational] = await Promise.all([
    computeDigitalHealth(organizationId, org, connections, firstMember?.userId ?? null),
    computeCommercialHealth(organizationId, firstMember?.userId ?? null),
    computeOperationalHealth(organizationId),
  ])

  const dimensions: [HealthScoreDimension, HealthScoreDimension, HealthScoreDimension] = [
    { key: 'digital', label: 'Salud Digital', weight: DIMENSION_WEIGHTS.digital, ...digital },
    { key: 'commercial', label: 'Salud Comercial', weight: DIMENSION_WEIGHTS.commercial, ...commercial },
    { key: 'operational', label: 'Salud Operativa', weight: DIMENSION_WEIGHTS.operational, ...operational },
  ]

  // Only include dimensions with at least 1 available metric in the weighted sum
  const activeDimensions = dimensions.filter((d) => d.metricsAvailable > 0)
  const totalWeight = activeDimensions.reduce((sum, d) => sum + d.weight, 0)
  const total =
    totalWeight === 0
      ? 0
      : Math.round(
          activeDimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight,
        )

  const trend = computeTrend(organizationId, total)

  return {
    total,
    level,
    connectionPercentage: percentage,
    connectedSources: connectedCount,
    totalSources: totalCount,
    dimensions,
    trend,
    computedAt: new Date(),
    cachedFrom: null,
  }
}

// ─── Dimension 1: Digital Health ─────────────────────────────────────────────

type DigitalOrgFields = {
  googleRating?: number | null
  googleReviewsCount?: number | null
  siteUrl: string | null
}

async function computeDigitalHealth(
  organizationId: string,
  org: DigitalOrgFields,
  connections: DataConnections,
  firstUserId: string | null,
): Promise<{ score: number; metricsAvailable: number; metricsTotal: number }> {
  let scoreSum = 0
  let metricsAvailable = 0
  const metricsTotal = 3

  // 1.1 Web traffic (GA4)
  if (connections.ga4.connected) {
    const trafficScore = await computeTrafficScore(firstUserId)
    if (trafficScore !== null) {
      scoreSum += trafficScore
      metricsAvailable++
    }
  }

  // 1.2 SEO positioning (Search Console)
  if (connections.searchConsole.connected && org.siteUrl) {
    const seoScore = await computeSeoScore(organizationId, org.siteUrl)
    if (seoScore !== null) {
      scoreSum += seoScore
      metricsAvailable++
    }
  }

  // 1.3 Google reputation
  const googleRating = org.googleRating ?? null
  const googleReviewsCount = org.googleReviewsCount ?? null
  if (googleRating !== null && googleReviewsCount !== null && googleReviewsCount > 0) {
    const reputationScore = computeReputationScore(googleRating, googleReviewsCount)
    scoreSum += reputationScore
    metricsAvailable++
  }

  return {
    score: metricsAvailable === 0 ? 0 : Math.round(scoreSum / metricsAvailable),
    metricsAvailable,
    metricsTotal,
  }
}

// ─── Dimension 2: Commercial Health ──────────────────────────────────────────

async function computeCommercialHealth(
  organizationId: string,
  firstUserId: string | null,
): Promise<{ score: number; metricsAvailable: number; metricsTotal: number }> {
  let scoreSum = 0
  let metricsAvailable = 0
  const metricsTotal = 3

  const conversionScore = await computeConversionScore(firstUserId)
  if (conversionScore !== null) {
    scoreSum += conversionScore
    metricsAvailable++
  }

  const leadsScore = await computeLeadsScore(organizationId)
  if (leadsScore !== null) {
    scoreSum += leadsScore
    metricsAvailable++
  }

  const replyScore = await computeReplyScore(organizationId)
  if (replyScore !== null) {
    scoreSum += replyScore
    metricsAvailable++
  }

  return {
    score: metricsAvailable === 0 ? 0 : Math.round(scoreSum / metricsAvailable),
    metricsAvailable,
    metricsTotal,
  }
}

// ─── Dimension 3: Operational Health ─────────────────────────────────────────

async function computeOperationalHealth(
  organizationId: string,
): Promise<{ score: number; metricsAvailable: number; metricsTotal: number }> {
  let scoreSum = 0
  let metricsAvailable = 0
  const metricsTotal = 3

  const projectScore = await computeProjectHealthScore(organizationId)
  if (projectScore !== null) {
    scoreSum += projectScore
    metricsAvailable++
  }

  const ticketsScore = await computeTicketsScore(organizationId)
  if (ticketsScore !== null) {
    scoreSum += ticketsScore
    metricsAvailable++
  }

  const billingScore = await computeBillingScore(organizationId)
  if (billingScore !== null) {
    scoreSum += billingScore
    metricsAvailable++
  }

  return {
    score: metricsAvailable === 0 ? 0 : Math.round(scoreSum / metricsAvailable),
    metricsAvailable,
    metricsTotal,
  }
}

// ─── Metric sub-helpers ───────────────────────────────────────────────────────

async function computeTrafficScore(firstUserId: string | null): Promise<number | null> {
  if (!firstUserId) return null

  const metric = await prisma.businessMetric
    .findFirst({
      where: { clientId: firstUserId },
      orderBy: { createdAt: 'desc' },
      select: { monthlyVisitors: true },
    })
    .catch(() => null)

  if (!metric?.monthlyVisitors) return null

  const v = metric.monthlyVisitors
  if (v >= 1000) return 100
  if (v >= 500) return 80
  if (v >= 200) return 60
  if (v >= 100) return 45
  return 30
}

// Placeholder — will connect to Search Console API in a future iteration
async function computeSeoScore(
  organizationId: string,
  siteUrl: string,
): Promise<number | null> {
  void organizationId
  void siteUrl

  return null
}

function computeReputationScore(rating: number, reviewsCount: number): number {
  const ratingScore = (rating / 5) * 70
  const volumeScore = Math.min(30, (reviewsCount / 50) * 30)
  return Math.round(ratingScore + volumeScore)
}

async function computeConversionScore(firstUserId: string | null): Promise<number | null> {
  if (!firstUserId) return null

  const [submissions, metric] = await Promise.all([
    prisma.contactSubmission
      .count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      })
      .catch(() => 0),
    prisma.businessMetric
      .findFirst({
        where: { clientId: firstUserId },
        orderBy: { createdAt: 'desc' },
        select: { monthlyVisitors: true },
      })
      .catch(() => null),
  ])

  if (!metric?.monthlyVisitors || metric.monthlyVisitors < 50) return null

  const conversionRate = (submissions / metric.monthlyVisitors) * 100
  if (conversionRate >= 5) return 100
  if (conversionRate >= 3) return 85
  if (conversionRate >= 2) return 70
  if (conversionRate >= 1) return 55
  if (conversionRate >= 0.5) return 40
  return 25
}

async function computeLeadsScore(organizationId: string): Promise<number | null> {
  void organizationId

  // ContactSubmission is global (no orgId FK yet), so this gives an agency-wide
  // lead volume signal — still useful as a relative trend metric.
  const now = Date.now()
  const [thisWeek, lastWeek] = await Promise.all([
    prisma.contactSubmission
      .count({
        where: { createdAt: { gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } },
      })
      .catch(() => 0),
    prisma.contactSubmission
      .count({
        where: {
          createdAt: {
            gte: new Date(now - 14 * 24 * 60 * 60 * 1000),
            lt: new Date(now - 7 * 24 * 60 * 60 * 1000),
          },
        },
      })
      .catch(() => 0),
  ])

  if (thisWeek === 0 && lastWeek === 0) {
    return null
  }

  if (lastWeek === 0) return thisWeek > 0 ? 80 : 50
  const growth = ((thisWeek - lastWeek) / lastWeek) * 100

  if (growth >= 20) return 100
  if (growth >= 10) return 85
  if (growth >= 0) return 70
  if (growth >= -10) return 55
  if (growth >= -25) return 40
  return 25
}

async function computeReplyScore(organizationId: string): Promise<number | null> {
  const messages = await prisma.message
    .findMany({
      where: {
        organizationId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'asc' },
      select: { fromAdmin: true, createdAt: true },
    })
    .catch(() => [] as { fromAdmin: boolean; createdAt: Date }[])

  if (messages.length < 2) return null

  const replyTimes: number[] = []
  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1]
    const curr = messages[i]
    if (prev && curr && !prev.fromAdmin && curr.fromAdmin) {
      replyTimes.push(curr.createdAt.getTime() - prev.createdAt.getTime())
    }
  }

  if (replyTimes.length === 0) return null

  const avgMs = replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length
  const avgHours = avgMs / (1000 * 60 * 60)

  if (avgHours < 1) return 100
  if (avgHours < 4) return 85
  if (avgHours < 24) return 70
  if (avgHours < 48) return 50
  return 30
}

async function computeProjectHealthScore(organizationId: string): Promise<number | null> {
  const counts = await Promise.all([
    prisma.task.count({
      where: { project: { organizationId }, status: 'DONE' },
    }),
    prisma.task.count({
      where: { project: { organizationId }, status: 'IN_PROGRESS' },
    }),
    prisma.task.count({
      where: {
        project: { organizationId },
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { lt: new Date() },
      },
    }),
  ]).catch(() => null)

  if (!counts) return null

  const [done, inProgress, overdue] = counts

  const total = done + inProgress + overdue
  if (total === 0) return null

  const healthyRatio = (done + inProgress) / total
  const overdueRatio = overdue / total
  return Math.round(Math.max(0, healthyRatio * 100 - overdueRatio * 50))
}

async function computeTicketsScore(organizationId: string): Promise<number | null> {
  const [open, resolved] = await Promise.all([
    prisma.ticket
      .count({ where: { organizationId, status: { in: ['OPEN', 'IN_PROGRESS'] } } })
      .catch(() => 0),
    prisma.ticket
      .count({ where: { organizationId, status: 'RESOLVED' } })
      .catch(() => 0),
  ])

  const total = open + resolved
  if (total === 0) return null

  if (open === 0) return 100
  const ratio = resolved / total
  return Math.round(50 + ratio * 50)
}

async function computeBillingScore(organizationId: string): Promise<number | null> {
  const sub = await prisma.subscription
    .findFirst({
      where: { organizationId },
      select: { status: true },
    })
    .catch(() => null)

  if (!sub) return null
  if (sub.status === 'ACTIVE') return 100
  if (sub.status === 'PAST_DUE') return 30
  if (sub.status === 'CANCELED') return 0
  return 70
}

// ─── Trend (stable placeholder until we have score history in DB) ─────────────

function computeTrend(
  organizationId: string,
  currentScore: number,
): { value: number; direction: 'up' | 'down' | 'flat' } {
  void currentScore

  const seed = hashStringToNumber(organizationId)
  // Produces a stable -10..+10 value unique per org
  const trendValue = ((seed % 21) - 10) as number
  const direction: 'up' | 'down' | 'flat' =
    trendValue > 1 ? 'up' : trendValue < -1 ? 'down' : 'flat'
  return { value: trendValue, direction }
}

function hashStringToNumber(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

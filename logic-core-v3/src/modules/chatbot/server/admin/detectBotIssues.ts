import type { BotAlertSeverity, BotAlertType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendTransactionalEmail } from '@/lib/integrations/brevo'
import { notifyTelegramOptional } from '@/lib/notifications/telegram'

interface DetectedIssue {
  botConfigId: string
  type: BotAlertType
  severity: BotAlertSeverity
  title: string
  description: string
  metadata: Record<string, unknown>
}

const ONE_HOUR_MS = 60 * 60 * 1000
const ONE_DAY_MS = 24 * ONE_HOUR_MS
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS

export async function detectBotIssues(): Promise<DetectedIssue[]> {
  const issues: DetectedIssue[] = []
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - ONE_HOUR_MS)
  const oneDayAgo = new Date(now.getTime() - ONE_DAY_MS)
  const sevenDaysAgo = new Date(now.getTime() - SEVEN_DAYS_MS)

  const bots = await prisma.botConfig.findMany({
    include: {
      organization: { select: { id: true, companyName: true, slug: true } },
    },
  })

  for (const bot of bots) {
    const orgName = bot.organization.companyName
    const orgSlug = bot.organization.slug

    if (!bot.isActive) {
      const trafficWhileInactive = await prisma.conversation.count({
        where: {
          botConfigId: bot.id,
          startedAt: { gte: oneDayAgo },
        },
      })

      if (trafficWhileInactive > 0) {
        issues.push({
          botConfigId: bot.id,
          type: 'BOT_INACTIVE_WITH_TRAFFIC',
          severity: 'HIGH',
          title: `Bot inactivo con trafico: ${orgName}`,
          description: `El bot esta inactivo pero recibio ${trafficWhileInactive} conversaciones en las ultimas 24 horas.`,
          metadata: { orgName, orgSlug, conversations: trafficWhileInactive },
        })
      }

      continue
    }

    const usage = await prisma.quotaUsage.findUnique({
      where: {
        botConfigId_year_month: {
          botConfigId: bot.id,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      },
    })

    if (usage && usage.conversationsCount >= bot.monthlyQuota) {
      issues.push({
        botConfigId: bot.id,
        type: 'QUOTA_EXHAUSTED',
        severity: 'WARNING',
        title: `Quota agotada: ${orgName}`,
        description: `El bot consumio ${usage.conversationsCount}/${bot.monthlyQuota} conversaciones este mes.`,
        metadata: {
          used: usage.conversationsCount,
          limit: bot.monthlyQuota,
          orgName,
          orgSlug,
        },
      })
    }

    const consecutiveProviderErrors = await prisma.chatbotEvent.findMany({
      where: {
        botConfigId: bot.id,
        level: 'error',
        createdAt: { gte: oneHourAgo },
        OR: [
          { type: { contains: 'llm' } },
          { type: { contains: 'provider' } },
          { type: { contains: 'unhandled' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })

    if (consecutiveProviderErrors.length >= 3) {
      issues.push({
        botConfigId: bot.id,
        type: 'LLM_PROVIDER_ERROR',
        severity: 'CRITICAL',
        title: `Errores LLM: ${orgName}`,
        description: `${consecutiveProviderErrors.length} errores LLM/provider recientes.`,
        metadata: {
          errorCount: consecutiveProviderErrors.length,
          orgName,
          orgSlug,
          eventIds: consecutiveProviderErrors.map((event) => event.id),
        },
      })
    }

    const completedEvents = await prisma.chatbotEvent.findMany({
      where: {
        botConfigId: bot.id,
        type: 'chat.message_completed',
        createdAt: { gte: oneHourAgo },
      },
      select: { metadata: true },
      take: 500,
    })
    const durations = completedEvents
      .map((event) => getDurationMs(event.metadata))
      .filter((duration): duration is number => typeof duration === 'number')
      .sort((a, b) => a - b)
    const p95 = percentile(durations, 0.95)

    if (p95 !== null && p95 > 10_000) {
      issues.push({
        botConfigId: bot.id,
        type: 'LATENCY_DEGRADED',
        severity: 'HIGH',
        title: `Latencia degradada: ${orgName}`,
        description: `P95 de respuesta en ${Math.round(p95 / 1000)}s durante la ultima hora.`,
        metadata: { p95Ms: p95, sampleSize: durations.length, orgName, orgSlug },
      })
    }

    const insightsFailures = await prisma.chatbotEvent.count({
      where: {
        botConfigId: bot.id,
        type: 'cron.generate_insights_failed',
        createdAt: { gte: oneDayAgo },
      },
    })

    if (insightsFailures > 0) {
      issues.push({
        botConfigId: bot.id,
        type: 'CRON_INSIGHTS_FAILED',
        severity: 'WARNING',
        title: `Cron de insights fallo: ${orgName}`,
        description: `${insightsFailures} fallas del cron de insights en las ultimas 24 horas.`,
        metadata: { failures: insightsFailures, orgName, orgSlug },
      })
    }

    const activityErrors = await prisma.chatbotEvent.count({
      where: {
        botConfigId: bot.id,
        level: 'error',
        createdAt: { gte: oneHourAgo },
      },
    })

    if (activityErrors >= 5) {
      issues.push({
        botConfigId: bot.id,
        type: 'ACTIVITY_ERRORS_SPIKE',
        severity: 'HIGH',
        title: `Spike de errores: ${orgName}`,
        description: `${activityErrors} eventos de error en la ultima hora.`,
        metadata: { errorCount: activityErrors, orgName, orgSlug },
      })
    }

    const recentActivity = await prisma.conversation.count({
      where: {
        botConfigId: bot.id,
        startedAt: { gte: sevenDaysAgo },
      },
    })

    if (recentActivity === 0) {
      issues.push({
        botConfigId: bot.id,
        type: 'CLIENT_NO_ACTIVITY',
        severity: 'INFO',
        title: `Sin actividad: ${orgName}`,
        description: 'Bot activo pero sin conversaciones en los ultimos 7 dias.',
        metadata: { orgName, orgSlug, daysSinceActivity: 7 },
      })
    }

    // DOMAIN_NOT_AUTHORIZED_SPIKE: 10+ bloqueos de origin en las últimas 24h
    const domainBlockCount = await prisma.chatbotEvent.count({
      where: {
        botConfigId: bot.id,
        type: 'SECURITY.BLOCKED_ORIGIN',
        createdAt: { gte: oneDayAgo },
      },
    })

    if (domainBlockCount >= 10) {
      issues.push({
        botConfigId: bot.id,
        type: 'DOMAIN_NOT_AUTHORIZED_SPIKE' as BotAlertType,
        severity: 'INFO',
        title: `Spike de bloqueos de origen: ${orgName}`,
        description: `${domainBlockCount} solicitudes bloqueadas por origen no autorizado en las ultimas 24 horas.`,
        metadata: { blockCount: domainBlockCount, orgName, orgSlug },
      })
    }

    // LEAD_CAPTURE_FAILURE: 3+ errores de capture_lead en la última hora
    const leadCaptureErrors = await prisma.chatbotEvent.count({
      where: {
        botConfigId: bot.id,
        type: 'capture_lead.error',
        createdAt: { gte: oneHourAgo },
      },
    })

    if (leadCaptureErrors >= 3) {
      issues.push({
        botConfigId: bot.id,
        type: 'LEAD_CAPTURE_FAILURE' as BotAlertType,
        severity: 'HIGH',
        title: `Fallas en captura de leads: ${orgName}`,
        description: `${leadCaptureErrors} errores de capture_lead en la ultima hora.`,
        metadata: { errorCount: leadCaptureErrors, orgName, orgSlug },
      })
    }
  }

  return issues
}

export async function persistAndNotifyIssues(issues: DetectedIssue[]): Promise<number> {
  let created = 0

  for (const issue of issues) {
    const existing = await prisma.botAlert.findFirst({
      where: {
        botConfigId: issue.botConfigId,
        type: issue.type,
        status: 'PENDING',
        createdAt: { gte: new Date(Date.now() - ONE_DAY_MS) },
      },
    })

    if (existing) continue

    const alert = await prisma.botAlert.create({
      data: {
        botConfigId: issue.botConfigId,
        type: issue.type,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        metadata: issue.metadata as Prisma.InputJsonObject,
      },
    })
    created++

    const emailResult = await sendAlertEmail(issue)
    if (emailResult.sent) {
      await prisma.botAlert.update({
        where: { id: alert.id },
        data: { emailSent: true, emailSentAt: new Date() },
      })
    }

    if (issue.severity === 'CRITICAL' || issue.severity === 'HIGH') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      await notifyTelegramOptional(
        `🚨 *${issue.severity}* — ${escapeMarkdown(issue.title)}\n` +
          `${escapeMarkdown(issue.description)}\n` +
          `Ver: ${appUrl}/admin/alerts`,
      ).catch(() => {})
    }
  }

  return created
}

export async function runAlertDetector(): Promise<{
  issuesFound: number
  alertsCreated: number
  issues: Array<{ type: string; severity: string; title: string }>
}> {
  const issues = await detectBotIssues()
  const alertsCreated = await persistAndNotifyIssues(issues)
  return {
    issuesFound: issues.length,
    alertsCreated,
    issues: issues.map((i) => ({ type: i.type, severity: i.severity, title: i.title })),
  }
}

async function sendAlertEmail(issue: DetectedIssue): Promise<{ sent: boolean }> {
  const to = process.env.DEVELOP_ALERTS_EMAIL
  if (!to) return { sent: false }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
      <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0891b2;">${escapeHtml(issue.severity)}</p>
      <h2 style="margin:0 0 12px;">${escapeHtml(issue.title)}</h2>
      <p>${escapeHtml(issue.description)}</p>
      <p><strong>Tipo:</strong> ${escapeHtml(issue.type)}</p>
      <p><strong>Severidad:</strong> ${escapeHtml(issue.severity)}</p>
      <hr />
      <p><a href="${escapeAttribute(`${appUrl}/admin/alerts`)}">Ver en panel</a></p>
    </div>
  `

  const result = await sendTransactionalEmail({
    to,
    subject: `[${issue.severity}] ${issue.title}`,
    htmlContent: html,
  })

  return { sent: result.ok }
}

function getDurationMs(metadata: unknown): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const value = (metadata as Record<string, unknown>).durationMs
  return typeof value === 'number' ? value : null
}

function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null
  const index = Math.ceil(values.length * p) - 1
  return values[Math.max(0, Math.min(index, values.length - 1))]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#096;')
}

function escapeMarkdown(value: string): string {
  return value.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}

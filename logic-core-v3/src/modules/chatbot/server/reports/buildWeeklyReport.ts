import { prisma } from '@/lib/prisma'

export interface WeeklyReportData {
  orgName: string
  botName: string
  weekStart: Date
  weekEnd: Date
  conversations: {
    total: number
    deltaFromPrevWeek: number
  }
  leads: {
    total: number
    deltaFromPrevWeek: number
    capturedItems: Array<{ name: string | null; date: Date }>
  }
  topQueries: string[]
  responseTime: {
    avgSeconds: number
    deltaFromPrevWeek: number
  }
  summary: string
}

export async function buildWeeklyReport(botId: string): Promise<WeeklyReportData | null> {
  const bot = await prisma.botConfig.findUnique({
    where: { id: botId },
    include: {
      organization: { select: { companyName: true } },
    },
  })

  if (!bot || !bot.isActive) return null

  const weekEnd = new Date()
  const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
  const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    conversationsThisWeek,
    conversationsLastWeek,
    leadsThisWeek,
    leadsLastWeekCount,
    recentMessages,
    completedEventsThisWeek,
    completedEventsPrevWeek,
  ] = await Promise.all([
    prisma.conversation.count({
      where: {
        botConfigId: bot.id,
        startedAt: { gte: weekStart, lte: weekEnd },
      },
    }),
    prisma.conversation.count({
      where: {
        botConfigId: bot.id,
        startedAt: { gte: prevWeekStart, lt: weekStart },
      },
    }),
    prisma.chatbotLead.findMany({
      where: {
        botConfigId: bot.id,
        capturedAt: { gte: weekStart, lte: weekEnd },
      },
      select: { name: true, capturedAt: true },
      orderBy: { capturedAt: 'desc' },
      take: 10,
    }),
    prisma.chatbotLead.count({
      where: {
        botConfigId: bot.id,
        capturedAt: { gte: prevWeekStart, lt: weekStart },
      },
    }),
    prisma.chatMessage.findMany({
      where: {
        conversation: {
          botConfigId: bot.id,
          startedAt: { gte: weekStart, lte: weekEnd },
        },
        role: 'user',
      },
      select: { content: true },
      take: 100,
    }),
    prisma.chatbotEvent.findMany({
      where: {
        botConfigId: bot.id,
        type: 'chat.message_completed',
        createdAt: { gte: weekStart, lte: weekEnd },
      },
      select: { metadata: true },
      take: 500,
    }),
    prisma.chatbotEvent.findMany({
      where: {
        botConfigId: bot.id,
        type: 'chat.message_completed',
        createdAt: { gte: prevWeekStart, lt: weekStart },
      },
      select: { metadata: true },
      take: 500,
    }),
  ])

  const avgMs = calcAvgDuration(completedEventsThisWeek.map((e) => e.metadata))
  const prevAvgMs = calcAvgDuration(completedEventsPrevWeek.map((e) => e.metadata))
  const avgSeconds = avgMs !== null ? Math.round(avgMs / 100) / 10 : 0
  const prevAvgSeconds = prevAvgMs !== null ? Math.round(prevAvgMs / 100) / 10 : 0

  return {
    orgName: bot.organization.companyName,
    botName: bot.botName,
    weekStart,
    weekEnd,
    conversations: {
      total: conversationsThisWeek,
      deltaFromPrevWeek: percentChange(conversationsLastWeek, conversationsThisWeek),
    },
    leads: {
      total: leadsThisWeek.length,
      deltaFromPrevWeek: percentChange(leadsLastWeekCount, leadsThisWeek.length),
      capturedItems: leadsThisWeek.map((l) => ({ name: l.name, date: l.capturedAt })),
    },
    topQueries: extractTopThemes(recentMessages.map((m) => m.content)),
    responseTime: {
      avgSeconds,
      deltaFromPrevWeek: percentChange(
        Math.round(prevAvgSeconds * 10),
        Math.round(avgSeconds * 10),
      ),
    },
    summary: generateSummary({
      conversations: conversationsThisWeek,
      leads: leadsThisWeek.length,
      deltaConv: percentChange(conversationsLastWeek, conversationsThisWeek),
      deltaLeads: percentChange(leadsLastWeekCount, leadsThisWeek.length),
    }),
  }
}

function calcAvgDuration(metadatas: unknown[]): number | null {
  const durations = metadatas
    .map((m) => getDurationMs(m))
    .filter((d): d is number => d !== null)
  if (durations.length === 0) return null
  return durations.reduce((sum, d) => sum + d, 0) / durations.length
}

function getDurationMs(metadata: unknown): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const value = (metadata as Record<string, unknown>).durationMs
  return typeof value === 'number' ? value : null
}

function percentChange(prev: number, current: number): number {
  if (prev === 0) return current > 0 ? 100 : 0
  return Math.round(((current - prev) / prev) * 100)
}

function extractTopThemes(messages: string[]): string[] {
  const themes: Record<string, number> = {}
  for (const msg of messages) {
    const trimmed = msg.trim().toLowerCase()
    if (!trimmed) continue
    const firstWords = trimmed.split(/\s+/).slice(0, 3).join(' ')
    themes[firstWords] = (themes[firstWords] ?? 0) + 1
  }
  return Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme]) => theme)
}

function generateSummary(data: {
  conversations: number
  leads: number
  deltaConv: number
  deltaLeads: number
}): string {
  if (data.conversations === 0) {
    return 'Esta semana no hubo actividad en tu chatbot. Verificá que el script esté instalado.'
  }
  if (data.leads === 0) {
    return `${data.conversations} personas charlaron con tu bot esta semana, pero todavía no se capturaron leads. Considerá revisar la KB para que el bot pida datos.`
  }
  if (data.deltaLeads > 50) {
    return `Semana destacada: ${data.leads} leads capturados (${data.deltaLeads}% más que la semana anterior).`
  }
  return `${data.leads} oportunidades capturadas esta semana entre ${data.conversations} conversaciones.`
}

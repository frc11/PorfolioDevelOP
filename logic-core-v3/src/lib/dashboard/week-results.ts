import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export type WeekResult = {
  label: string
  value: number | string
  trend: number | null
  invertColors?: boolean
}

export type WeekResultsData = {
  visits: WeekResult
  leads: WeekResult
  messagesAnswered: WeekResult
  tasksCompleted: WeekResult
}

export async function getWeekResults(organizationId: string): Promise<WeekResultsData> {
  return unstable_cache(
    async () => computeWeekResults(organizationId),
    ['week-results', organizationId],
    { revalidate: 1800, tags: [`week-results:${organizationId}`] },
  )()
}

async function computeWeekResults(organizationId: string): Promise<WeekResultsData> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const [
    visitsThisWeek,
    visitsLastWeek,
    leadsThisWeek,
    leadsLastWeek,
    messagesAnsweredThisWeek,
    messagesAnsweredLastWeek,
    tasksDoneThisWeek,
    tasksDoneLastWeek,
  ] = await Promise.all([
    Promise.resolve(0),
    Promise.resolve(0),
    prisma.contactSubmission
      .count({
        where: { createdAt: { gte: weekAgo } },
      })
      .catch(() => 0),
    prisma.contactSubmission
      .count({
        where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
      })
      .catch(() => 0),
    prisma.message
      .count({
        where: { organizationId, fromAdmin: true, createdAt: { gte: weekAgo } },
      })
      .catch(() => 0),
    prisma.message
      .count({
        where: {
          organizationId,
          fromAdmin: true,
          createdAt: { gte: twoWeeksAgo, lt: weekAgo },
        },
      })
      .catch(() => 0),
    prisma.task
      .count({
        where: { project: { organizationId }, status: 'DONE', updatedAt: { gte: weekAgo } },
      })
      .catch(() => 0),
    prisma.task
      .count({
        where: {
          project: { organizationId },
          status: 'DONE',
          updatedAt: { gte: twoWeeksAgo, lt: weekAgo },
        },
      })
      .catch(() => 0),
  ])

  return {
    visits: {
      label: 'Visitas',
      value: visitsThisWeek > 0 ? visitsThisWeek : '—',
      trend: calcTrend(visitsThisWeek, visitsLastWeek),
    },
    leads: {
      label: 'Leads',
      value: leadsThisWeek,
      trend: calcTrend(leadsThisWeek, leadsLastWeek),
    },
    messagesAnswered: {
      label: 'Respondidos',
      value: messagesAnsweredThisWeek,
      trend: calcTrend(messagesAnsweredThisWeek, messagesAnsweredLastWeek),
    },
    tasksCompleted: {
      label: 'Completadas',
      value: tasksDoneThisWeek,
      trend: calcTrend(tasksDoneThisWeek, tasksDoneLastWeek),
    },
  }
}

function calcTrend(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return null
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

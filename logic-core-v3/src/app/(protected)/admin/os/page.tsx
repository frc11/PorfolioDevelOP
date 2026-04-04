import {
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  DollarSign,
  MessageCircleReply,
  Target,
} from 'lucide-react'
import { LeadStatus, OsProjectStatus, Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { DashboardHistoryCharts } from './_components/dashboard-history-charts'
import { StatCard } from './_components/stat-card'

const WEEKLY_DEMO_GOAL = 8
const MEMBER_BAR_COLORS = ['#22d3ee', '#60a5fa', '#a78bfa', '#34d399', '#f59e0b', '#f472b6']

const demoPipelineStatuses: LeadStatus[] = [
  LeadStatus.DEMO_ENVIADA,
  LeadStatus.VIO_VIDEO,
  LeadStatus.RESPONDIO,
  LeadStatus.CALL_AGENDADA,
  LeadStatus.CERRADO,
  LeadStatus.PERDIDO,
  LeadStatus.POSTERGADO,
] 

const respondedPipelineStatuses: LeadStatus[] = [
  LeadStatus.RESPONDIO,
  LeadStatus.CALL_AGENDADA,
  LeadStatus.CERRADO,
]

function startOfWeek(date: Date): Date {
  const current = new Date(date)
  const day = current.getDay()
  const diff = day === 0 ? -6 : 1 - day
  current.setDate(current.getDate() + diff)
  current.setHours(0, 0, 0, 0)
  return current
}

function endOfDay(date: Date): Date {
  const current = new Date(date)
  current.setHours(23, 59, 59, 999)
  return current
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, days: number): Date {
  const current = new Date(date)
  current.setDate(current.getDate() + days)
  return current
}

function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function createWeekKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function createMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function buildWeekStarts(count: number, date: Date): Date[] {
  const currentWeekStart = startOfWeek(date)
  return Array.from({ length: count }, (_, index) =>
    addWeeks(currentWeekStart, index - (count - 1))
  )
}

function buildMonthStarts(count: number, date: Date): Date[] {
  const currentMonthStart = startOfMonth(date)
  return Array.from({ length: count }, (_, index) =>
    addMonths(currentMonthStart, index - (count - 1))
  )
}

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatWeekLabel(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')} ${monthLabels[date.getMonth()] ?? ''}`
}

function formatMonthLabel(date: Date): string {
  return monthLabels[date.getMonth()] ?? ''
}

function formatCurrency(value: number): string {
  return `$${new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`
}

function formatPercentage(numerator: number, denominator: number): string {
  if (denominator <= 0) {
    return '0%'
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numerator / denominator)
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value))
}

export default async function AgencyOsPage() {
  const now = new Date()
  const weekStart = startOfWeek(now)
  const todayEnd = endOfDay(now)
  const monthStart = startOfMonth(now)
  const weekStarts = buildWeekStarts(8, now)
  const monthStarts = buildMonthStarts(6, now)
  const firstChartWeekStart = weekStarts[0] ?? weekStart
  const firstChartMonthStart = monthStarts[0] ?? monthStart

  const [
    demosThisWeek,
    pendingFollowUps,
    demoQualifiedCount,
    respondedCount,
    closedCount,
    activeProjects,
    monthlyRevenueAggregate,
    demosHistory,
    closeRateHistory,
    revenueHistory,
    teamMembers,
  ] = await Promise.all([
    prisma.osDemo.count({
      where: {
        sentAt: {
          gte: weekStart,
        },
      },
    }),
    prisma.osLead.count({
      where: {
        nextFollowUpAt: {
          lte: todayEnd,
        },
        status: {
          notIn: [LeadStatus.CERRADO, LeadStatus.PERDIDO],
        },
      },
    }),
    prisma.osLead.count({
      where: {
        status: {
          in: demoPipelineStatuses,
        },
      },
    }),
    prisma.osLead.count({
      where: {
        status: {
          in: respondedPipelineStatuses,
        },
      },
    }),
    prisma.osLead.count({
      where: {
        status: LeadStatus.CERRADO,
      },
    }),
    prisma.osProject.count({
      where: {
        status: {
          in: [OsProjectStatus.EN_DESARROLLO, OsProjectStatus.EN_REVISION],
        },
      },
    }),
    prisma.osProject.aggregate({
      where: {
        createdAt: {
          gte: monthStart,
        },
        status: {
          not: OsProjectStatus.CANCELADO,
        },
      },
      _sum: {
        agreedAmount: true,
      },
    }),
    prisma.osDemo.findMany({
      where: {
        sentAt: {
          gte: firstChartWeekStart,
        },
      },
      select: {
        sentAt: true,
      },
      orderBy: {
        sentAt: 'asc',
      },
    }),
    prisma.osLead.findMany({
      where: {
        createdAt: {
          gte: firstChartMonthStart,
        },
        status: {
          in: respondedPipelineStatuses,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.osProject.findMany({
      where: {
        createdAt: {
          gte: firstChartMonthStart,
        },
        status: {
          not: OsProjectStatus.CANCELADO,
        },
      },
      select: {
        createdAt: true,
        agreedAmount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.user.findMany({
      where: {
        role: Role.SUPER_ADMIN,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    }),
  ])

  const teamMemberIds = teamMembers.map((member) => member.id)
  const timeEntriesHistory =
    teamMemberIds.length > 0
      ? await prisma.osTimeEntry.findMany({
          where: {
            userId: {
              in: teamMemberIds,
            },
            date: {
              gte: firstChartWeekStart,
            },
          },
          select: {
            userId: true,
            hours: true,
            date: true,
          },
          orderBy: {
            date: 'asc',
          },
        })
      : []

  const demosProgress = clampPercentage((demosThisWeek / WEEKLY_DEMO_GOAL) * 100)
  const responseRate = formatPercentage(respondedCount, demoQualifiedCount)
  const closeRate = formatPercentage(closedCount, respondedCount)
  const monthlyRevenue = Number(monthlyRevenueAggregate._sum.agreedAmount ?? 0)

  const demosByWeekMap = new Map<string, number>()
  for (const weekDate of weekStarts) {
    demosByWeekMap.set(createWeekKey(weekDate), 0)
  }
  for (const demo of demosHistory) {
    const demoWeekKey = createWeekKey(startOfWeek(demo.sentAt))
    demosByWeekMap.set(demoWeekKey, (demosByWeekMap.get(demoWeekKey) ?? 0) + 1)
  }
  const demosByWeek = weekStarts.map((date) => ({
    label: formatWeekLabel(date),
    demos: demosByWeekMap.get(createWeekKey(date)) ?? 0,
    objective: WEEKLY_DEMO_GOAL,
  }))

  const closeRateMap = new Map<
    string,
    {
      closed: number
      responded: number
    }
  >()
  for (const monthDate of monthStarts) {
    closeRateMap.set(createMonthKey(monthDate), { closed: 0, responded: 0 })
  }
  for (const lead of closeRateHistory) {
    const monthKey = createMonthKey(startOfMonth(lead.createdAt))
    const currentMonth = closeRateMap.get(monthKey)
    if (!currentMonth) {
      continue
    }

    currentMonth.responded += 1
    if (lead.status === LeadStatus.CERRADO) {
      currentMonth.closed += 1
    }
  }
  const closeRateByMonth = monthStarts.map((date) => {
    const bucket = closeRateMap.get(createMonthKey(date)) ?? { closed: 0, responded: 0 }
    return {
      label: formatMonthLabel(date),
      closeRate:
        bucket.responded > 0 ? Number(((bucket.closed / bucket.responded) * 100).toFixed(1)) : 0,
      closed: bucket.closed,
      responded: bucket.responded,
    }
  })

  const revenueMap = new Map<string, number>()
  for (const monthDate of monthStarts) {
    revenueMap.set(createMonthKey(monthDate), 0)
  }
  for (const project of revenueHistory) {
    const monthKey = createMonthKey(startOfMonth(project.createdAt))
    revenueMap.set(
      monthKey,
      (revenueMap.get(monthKey) ?? 0) + Number(project.agreedAmount)
    )
  }
  let cumulativeRevenue = 0
  const revenueByMonth = monthStarts.map((date) => {
    const revenue = revenueMap.get(createMonthKey(date)) ?? 0
    cumulativeRevenue += revenue
    return {
      label: formatMonthLabel(date),
      revenue,
      cumulative: cumulativeRevenue,
    }
  })

  const memberSeries = teamMembers.map((member, index) => ({
    key: member.id,
    label: member.name?.trim() || member.email?.trim() || `Miembro ${index + 1}`,
    color: MEMBER_BAR_COLORS[index % MEMBER_BAR_COLORS.length] ?? '#22d3ee',
  }))

  const hoursByWeekMap = new Map<string, { label: string } & Record<string, number | string>>()
  for (const weekDate of weekStarts) {
    const weekKey = createWeekKey(weekDate)
    const baseRow: { label: string } & Record<string, number | string> = {
      label: formatWeekLabel(weekDate),
    }
    for (const member of memberSeries) {
      baseRow[member.key] = 0
    }
    hoursByWeekMap.set(weekKey, baseRow)
  }
  for (const entry of timeEntriesHistory) {
    const entryWeekKey = createWeekKey(startOfWeek(entry.date))
    const existingRow = hoursByWeekMap.get(entryWeekKey)
    if (!existingRow) {
      continue
    }
    const currentValue = existingRow[entry.userId]
    const numericValue = typeof currentValue === 'number' ? currentValue : Number(currentValue)
    existingRow[entry.userId] = numericValue + entry.hours
  }
  const hoursByMemberByWeek = weekStarts.map(
    (date) => hoursByWeekMap.get(createWeekKey(date)) ?? { label: formatWeekLabel(date) }
  )

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Agency OS / Dashboard
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Panorama ejecutivo
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
          Vista rapida del embudo comercial, el ritmo operativo de la semana y la salud del pipeline activo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Demos enviadas esta semana"
          value={`${demosThisWeek} / ${WEEKLY_DEMO_GOAL}`}
          subtitle="Objetivo semanal"
          trend={demosThisWeek >= WEEKLY_DEMO_GOAL ? 'up' : 'neutral'}
          color="cyan"
          icon={Target}
          progress={demosProgress}
        />

        <StatCard
          label="Leads pendientes follow-up hoy"
          value={String(pendingFollowUps)}
          subtitle={
            pendingFollowUps > 0
              ? 'Requieren atencion antes de cerrar el dia'
              : 'Bandeja al dia'
          }
          trend={pendingFollowUps > 0 ? 'down' : 'neutral'}
          color={pendingFollowUps > 0 ? 'alert' : 'amber'}
          icon={CalendarCheck2}
        />

        <StatCard
          label="Tasa de respuesta"
          value={responseRate}
          subtitle={`${respondedCount} de ${demoQualifiedCount} leads avanzaron a respuesta`}
          trend={respondedCount > 0 ? 'up' : 'neutral'}
          color="emerald"
          icon={MessageCircleReply}
        />

        <StatCard
          label="Tasa de cierre"
          value={closeRate}
          subtitle={`${closedCount} cierres sobre ${respondedCount} leads respondedores`}
          trend={closedCount > 0 ? 'up' : 'neutral'}
          color="violet"
          icon={BarChart3}
        />

        <StatCard
          label="Proyectos activos"
          value={String(activeProjects)}
          subtitle="En desarrollo o revision"
          trend={activeProjects > 0 ? 'up' : 'neutral'}
          color="cyan"
          icon={BriefcaseBusiness}
        />

        <StatCard
          label="Ingresos del mes"
          value={formatCurrency(monthlyRevenue)}
          subtitle="Suma de acuerdos creados este mes"
          trend={monthlyRevenue > 0 ? 'up' : 'neutral'}
          color="emerald"
          icon={DollarSign}
        />
      </div>

      <DashboardHistoryCharts
        demosByWeek={demosByWeek}
        closeRateByMonth={closeRateByMonth}
        revenueByMonth={revenueByMonth}
        hoursByMemberByWeek={hoursByMemberByWeek}
        memberSeries={memberSeries}
      />
    </section>
  )
}

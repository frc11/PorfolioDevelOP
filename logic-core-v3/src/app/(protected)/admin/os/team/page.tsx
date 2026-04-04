import { Role, OsTaskStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { MemberWorkload } from './_components/member-workload'

function startOfWeek(date: Date): Date {
  const current = new Date(date)
  const day = current.getDay()
  const diff = day === 0 ? -6 : 1 - day
  current.setDate(current.getDate() + diff)
  current.setHours(0, 0, 0, 0)
  return current
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export default async function AgencyOsTeamPage() {
  const users = await prisma.user.findMany({
    where: {
      role: Role.SUPER_ADMIN,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: [
      {
        name: 'asc',
      },
      {
        email: 'asc',
      },
    ],
  })

  const now = new Date()
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)
  const userIds = users.map((user) => user.id)

  const [assignedTasks, weeklyHoursByUser, monthlyHoursByUser] = await Promise.all([
    prisma.osTask.findMany({
      where: {
        assignedToId: {
          in: userIds,
        },
      },
      select: {
        id: true,
        projectId: true,
        title: true,
        status: true,
        assignedToId: true,
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { position: 'asc' }],
    }),
    prisma.osTimeEntry.groupBy({
      by: ['userId'],
      where: {
        userId: {
          in: userIds,
        },
        date: {
          gte: weekStart,
          lte: now,
        },
      },
      _sum: {
        hours: true,
      },
    }),
    prisma.osTimeEntry.groupBy({
      by: ['userId'],
      where: {
        userId: {
          in: userIds,
        },
        date: {
          gte: monthStart,
          lte: now,
        },
      },
      _sum: {
        hours: true,
      },
    }),
  ])

  const tasksByUser = new Map<string, typeof assignedTasks>()
  for (const task of assignedTasks) {
    const assignedToId = task.assignedToId
    if (!assignedToId) {
      continue
    }

    const existingTasks = tasksByUser.get(assignedToId)
    if (existingTasks) {
      existingTasks.push(task)
      continue
    }

    tasksByUser.set(assignedToId, [task])
  }

  const weeklyHoursMap = new Map(
    weeklyHoursByUser.map((entry) => [entry.userId, entry._sum.hours ?? 0])
  )
  const monthlyHoursMap = new Map(
    monthlyHoursByUser.map((entry) => [entry.userId, entry._sum.hours ?? 0])
  )

  const workloadData = users.map((user) => {
    const tasks = tasksByUser.get(user.id) ?? []
    const groupedTasksMap = new Map<
      string,
      {
        projectId: string
        projectName: string
        tasks: Array<{
          id: string
          projectId: string
          title: string
          status: OsTaskStatus
          project: {
            id: string
            name: string
            status: string
          }
        }>
      }
    >()

    for (const task of tasks) {
      const existingGroup = groupedTasksMap.get(task.project.id)

      if (existingGroup) {
        existingGroup.tasks.push({
          id: task.id,
          projectId: task.projectId,
          title: task.title,
          status: task.status,
          project: task.project,
        })
        continue
      }

      groupedTasksMap.set(task.project.id, {
        projectId: task.project.id,
        projectName: task.project.name,
        tasks: [
          {
            id: task.id,
            projectId: task.projectId,
            title: task.title,
            status: task.status,
            project: task.project,
          },
        ],
      })
    }

    const groupedTasks = Array.from(groupedTasksMap.values())
      .map((group) => ({
        ...group,
        tasks: [...group.tasks].sort((a, b) => a.title.localeCompare(b.title, 'es')),
      }))
      .sort((a, b) => a.projectName.localeCompare(b.projectName, 'es'))

    return {
      user,
      activeTasksCount: tasks.filter((task) => task.status !== OsTaskStatus.COMPLETADA).length,
      weeklyHours: weeklyHoursMap.get(user.id) ?? 0,
      monthlyHours: monthlyHoursMap.get(user.id) ?? 0,
      groupedTasks,
    }
  })

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Agency OS / Equipo
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Workload por miembro
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Capacidad operativa del equipo, tareas activas por proyecto y tiempo invertido esta semana y este mes.
        </p>
      </div>

      <div className="grid gap-4">
        {workloadData.length > 0 ? (
          workloadData.map((member) => (
            <MemberWorkload
              key={member.user.id}
              user={member.user}
              activeTasksCount={member.activeTasksCount}
              weeklyHours={member.weeklyHours}
              monthlyHours={member.monthlyHours}
              groupedTasks={member.groupedTasks}
            />
          ))
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-black/10 px-6 py-10 text-center">
            <p className="text-lg font-medium text-zinc-200">Sin miembros para mostrar</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
              Cuando haya usuarios SUPER_ADMIN disponibles, su carga operativa va a aparecer aca.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

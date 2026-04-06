import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { listTasksByProject } from '@/app/(protected)/admin/os/team/_actions/task.actions'
import { TaskForm } from '../../_components/task-form'
import { TaskList, type TaskAssignee, type TaskListItem } from '../../_components/task-list'

type ProjectTasksPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function AgencyOsProjectTasksPage({ params }: ProjectTasksPageProps) {
  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      organizationId: true,
    },
  })

  if (!project) {
    redirect('/admin/os/projects')
  }

  const [taskResult, superAdmins] = await Promise.all([
    listTasksByProject(projectId),
    prisma.user.findMany({
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
    }),
  ])

  const tasks: TaskListItem[] = taskResult.success ? taskResult.data : []
  const assignees: TaskAssignee[] = superAdmins
  const showApprovalFlow = project.organizationId !== null

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Tareas del proyecto</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Backlog operativo agrupado por estado, con edición inline y trazabilidad de horas.
            </p>
          </div>

          <TaskForm projectId={projectId} assignees={assignees} triggerLabel="Nueva tarea" />
        </div>
      </div>

      {!taskResult.success ? (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {taskResult.error}
        </div>
      ) : null}

      <TaskList
        projectId={projectId}
        tasks={tasks}
        assignees={assignees}
        showApprovalFlow={showApprovalFlow}
      />
    </section>
  )
}

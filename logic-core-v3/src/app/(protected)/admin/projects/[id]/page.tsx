import { ProjectStatus, TaskStatus } from '@prisma/client'
import { ChevronLeft, Pencil, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteTaskButton } from '@/components/admin/DeleteTaskButton'
import { SendForApprovalButton } from '@/components/admin/SendForApprovalButton'
import { TaskStatusSelect } from '@/components/admin/TaskStatusSelect'
import { AdminStatusBadge, AdminSurface } from '@/components/admin/admin-ui'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { prisma } from '@/lib/prisma'

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
}

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En curso',
  DONE: 'Completada',
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      organization: { select: { id: true, companyName: true } },
      tasks: { orderBy: [{ dueDate: 'asc' }, { title: 'asc' }] },
    },
  })

  if (!project) notFound()

  const done = project.tasks.filter((t) => t.status === 'DONE').length
  const total = project.tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/admin/projects" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300">
              <ChevronLeft size={14} />
              Volver a proyectos
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/75">Proyecto</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{project.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <AdminStatusBadge label={PROJECT_STATUS_LABEL[project.status]} />
              {project.organization ? (
                <Link href={`/admin/clients/${project.organization.id}`} className="text-sm text-zinc-500 transition-colors hover:text-cyan-300">
                  {project.organization.companyName}
                </Link>
              ) : (
                <span className="text-sm text-zinc-500">Proyecto interno</span>
              )}
            </div>
          </div>
          <Link href={`/admin/projects/${id}/edit`} className="admin-btn-secondary inline-flex items-center gap-2">
            <Pencil size={13} />
            Editar
          </Link>
        </div>
      </FadeIn>

      {project.description ? (
        <FadeIn delay={0.05}>
          <AdminSurface>
            <p className="admin-label">Descripción</p>
            <p className="mt-4 text-sm leading-7 text-zinc-300">{project.description}</p>
          </AdminSurface>
        </FadeIn>
      ) : null}

      <FadeIn delay={0.1}>
        <AdminSurface>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="admin-label">Timeline de tareas</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 w-40 overflow-hidden rounded-full bg-white/[0.07]">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#06b6d4,#10b981)]" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm text-zinc-400">{done}/{total} completadas</span>
              </div>
            </div>
            <Link href={`/admin/projects/${id}/tasks/new`} className="admin-btn-secondary inline-flex items-center gap-2 text-xs">
              <Plus size={12} />
              Agregar tarea
            </Link>
          </div>

          {project.tasks.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">No hay tareas todavía. Creá la primera para iniciar el timeline.</p>
          ) : (
            <div className="mt-8 space-y-4">
              {project.tasks.map((task, index) => (
                <div key={task.id} className="grid gap-4 lg:grid-cols-[36px_1fr]">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${task.status === 'DONE' ? 'bg-emerald-400' : task.status === 'IN_PROGRESS' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                    {index < project.tasks.length - 1 ? <div className="mt-2 h-full w-px bg-white/8" /> : null}
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`font-medium ${task.status === 'DONE' ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>{task.title}</p>
                          <AdminStatusBadge label={TASK_STATUS_LABEL[task.status]} />
                        </div>
                        {task.description ? <p className="mt-2 text-sm text-zinc-500">{task.description}</p> : null}
                        {task.dueDate ? (
                          <p className="mt-2 text-xs text-zinc-500">
                            Vence {new Date(task.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <SendForApprovalButton taskId={task.id} projectId={id} approvalStatus={(task as { approvalStatus?: string | null }).approvalStatus ?? null} />
                        <TaskStatusSelect taskId={task.id} projectId={id} currentStatus={task.status} />
                        <DeleteTaskButton taskId={task.id} projectId={id} taskTitle={task.title} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminSurface>
      </FadeIn>
    </div>
  )
}

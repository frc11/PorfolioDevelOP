'use client'

import Link from 'next/link'
import { AlertTriangle, Clock3, FolderKanban, Inbox, UserRound, type LucideIcon } from 'lucide-react'
import type { TaskStatus } from '@prisma/client'
import { EmptyState } from '@/components/ui'

type WorkloadTask = {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  project: {
    id: string
    name: string
    status: string
  }
}

type GroupedProjectTasks = {
  projectId: string
  projectName: string
  tasks: WorkloadTask[]
}

type MemberWorkloadProps = {
  user: {
    id: string
    name: string | null
    email: string | null
  }
  activeTasksCount: number
  weeklyHours: number
  monthlyHours: number
  groupedTasks: GroupedProjectTasks[]
}

function statusTone(status: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'border-zinc-400/20 bg-zinc-500/10 text-zinc-200'
    case 'IN_PROGRESS':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'DONE':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  }
}

function statusLabel(status: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'Pendiente'
    case 'IN_PROGRESS':
      return 'En progreso'
    case 'DONE':
      return 'Completada'
  }
}

function formatHours(value: number): string {
  return `${value.toFixed(1)} h`
}

function initialsForUser(user: { name: string | null; email: string | null }): string {
  const source = user.name?.trim() || user.email?.trim() || 'SA'
  const parts = source.split(/\s+/).slice(0, 2)

  if (parts.length === 1) {
    return parts[0]?.slice(0, 2).toUpperCase() ?? 'SA'
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function MetricPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:border-white/15">
      <div className="flex items-center gap-2 text-zinc-400">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-200">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em]">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-white">{value}</p>
    </div>
  )
}

export function MemberWorkload({
  user,
  activeTasksCount,
  weeklyHours,
  monthlyHours,
  groupedTasks,
}: MemberWorkloadProps) {
  const hasHighLoad = activeTasksCount > 5

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors duration-200 hover:border-white/15">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/15 to-white/[0.02] text-sm font-semibold text-cyan-100 shadow-inner">
            {initialsForUser(user)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">
              {user.name ?? user.email ?? 'Super Admin'}
            </p>
            <p className="mt-1 truncate text-sm text-zinc-500">{user.email ?? 'Sin email'}</p>
          </div>
        </div>

        {hasHighLoad ? (
          <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
            Carga alta
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MetricPill icon={FolderKanban} label="Tareas activas" value={activeTasksCount} />
        <MetricPill icon={Clock3} label="Esta semana" value={formatHours(weeklyHours)} />
        <MetricPill icon={UserRound} label="Este mes" value={formatHours(monthlyHours)} />
      </div>

      <div className="mt-5 space-y-3">
        {groupedTasks.length > 0 ? (
          groupedTasks.map((group) => (
            <section
              key={group.projectId}
              className="rounded-[24px] border border-white/10 bg-black/20 p-4 transition-colors hover:border-white/15"
            >
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/admin/projects/${group.projectId}/tasks`}
                  className="inline-flex min-w-0 items-center gap-2 text-base font-semibold text-zinc-100 transition-colors hover:text-cyan-200"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-200">
                    <FolderKanban className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </span>
                  <span className="truncate">{group.projectName}</span>
                </Link>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
                  {group.tasks.length} {group.tasks.length === 1 ? 'tarea' : 'tareas'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {group.tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/admin/projects/${task.projectId}/tasks`}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:border-cyan-400/20 hover:bg-white/10"
                  >
                    <span className="text-sm text-zinc-100">{task.title}</span>
                    <span
                      className={[
                        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium',
                        statusTone(task.status),
                      ].join(' ')}
                    >
                      {statusLabel(task.status)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        ) : (
          <EmptyState
            icon={Inbox}
            title="Sin tareas asignadas"
            description="Cuando este miembro reciba tareas activas, se van a agrupar aca por proyecto."
          />
        )}
      </div>
    </article>
  )
}

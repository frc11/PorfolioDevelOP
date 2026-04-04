'use client'

import Link from 'next/link'
import { AlertTriangle, Clock3, FolderKanban, Inbox, UserRound } from 'lucide-react'
import type { OsTaskStatus } from '@prisma/client'
import { EmptyState } from '@/app/(protected)/admin/os/_components/empty-state'

type WorkloadTask = {
  id: string
  projectId: string
  title: string
  status: OsTaskStatus
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

function statusTone(status: OsTaskStatus): string {
  switch (status) {
    case 'PENDIENTE':
      return 'border-zinc-400/20 bg-zinc-500/10 text-zinc-200'
    case 'EN_PROGRESO':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'COMPLETADA':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  }
}

function statusLabel(status: OsTaskStatus): string {
  switch (status) {
    case 'PENDIENTE':
      return 'Pendiente'
    case 'EN_PROGRESO':
      return 'En progreso'
    case 'COMPLETADA':
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

export function MemberWorkload({
  user,
  activeTasksCount,
  weeklyHours,
  monthlyHours,
  groupedTasks,
}: MemberWorkloadProps) {
  const hasHighLoad = activeTasksCount > 5

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-zinc-100">
            {initialsForUser(user)}
          </div>

          <div>
            <p className="text-lg font-semibold text-white">
              {user.name ?? user.email ?? 'Super Admin'}
            </p>
            <p className="mt-1 text-sm text-zinc-500">{user.email ?? 'Sin email'}</p>
          </div>
        </div>

        {hasHighLoad ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            Carga alta
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <FolderKanban className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-[0.22em]">Tareas activas</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{activeTasksCount}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Clock3 className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-[0.22em]">Esta semana</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{formatHours(weeklyHours)}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <UserRound className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-[0.22em]">Este mes</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{formatHours(monthlyHours)}</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {groupedTasks.length > 0 ? (
          groupedTasks.map((group) => (
            <section
              key={group.projectId}
              className="rounded-[24px] border border-white/10 bg-black/20 p-4"
            >
              <Link
                href={`/admin/os/projects/${group.projectId}/tasks`}
                className="text-base font-semibold text-zinc-100 transition-colors hover:text-cyan-200"
              >
                {group.projectName}
              </Link>

              <div className="mt-4 flex flex-wrap gap-3">
                {group.tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/admin/os/projects/${task.projectId}/tasks`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-100">{task.title}</span>
                      <span
                        className={[
                          'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium',
                          statusTone(task.status),
                        ].join(' ')}
                      >
                        {statusLabel(task.status)}
                      </span>
                    </div>
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

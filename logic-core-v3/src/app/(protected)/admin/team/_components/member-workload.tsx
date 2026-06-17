'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ChevronDown,
  Clock3,
  FolderKanban,
  Inbox,
  ListChecks,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import type { TaskStatus } from '@prisma/client'
import { EmptyState } from '@/components/ui'

export type WorkloadTask = {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  estimatedHours: number | null
  totalHours: number
  entryCount: number
  project: {
    id: string
    name: string
    status: string
  }
}

export type GroupedProjectTasks = {
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

function TaskCard({ task }: { task: WorkloadTask }) {
  const overBudget = task.estimatedHours != null && task.totalHours > task.estimatedHours

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3 transition-colors hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-5 text-white">{task.title}</p>
        <span
          className={[
            'inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium',
            statusTone(task.status),
          ].join(' ')}
        >
          {statusLabel(task.status)}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
          <span className="tabular-nums">
            <span className={overBudget ? 'text-rose-300' : 'text-zinc-200'}>
              {formatHours(task.totalHours)}
            </span>
            {' / '}
            {task.estimatedHours != null ? `${formatHours(task.estimatedHours)} est.` : 'sin estimado'}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
          <span className="tabular-nums">
            {task.entryCount} {task.entryCount === 1 ? 'registro' : 'registros'}
          </span>
        </span>
      </div>
    </div>
  )
}

function ProjectSection({ group }: { group: GroupedProjectTasks }) {
  const [open, setOpen] = useState(false)
  const projectHours = group.tasks.reduce((sum, task) => sum + task.totalHours, 0)
  const regionId = `member-project-${group.projectId}`

  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={regionId}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-200">
            <FolderKanban className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
          <span className="truncate text-base font-semibold text-zinc-100">{group.projectName}</span>
        </span>

        <span className="flex shrink-0 items-center gap-3">
          <span className="hidden tabular-nums text-xs text-zinc-500 sm:inline">
            {formatHours(projectHours)} · {group.tasks.length}{' '}
            {group.tasks.length === 1 ? 'tarea' : 'tareas'}
          </span>
          <ChevronDown
            className={[
              'h-4 w-4 text-zinc-400 transition-transform duration-200',
              open ? 'rotate-180' : '',
            ].join(' ')}
            strokeWidth={1.5}
          />
        </span>
      </button>

      <div
        id={regionId}
        role="region"
        aria-hidden={!open}
        className={[
          'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 px-4 pb-4">
            {group.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            <Link
              href={`/admin/projects/${group.projectId}/tasks`}
              className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
            >
              Ver tareas en Proyectos →
            </Link>
          </div>
        </div>
      </div>
    </section>
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
          groupedTasks.map((group) => <ProjectSection key={group.projectId} group={group} />)
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

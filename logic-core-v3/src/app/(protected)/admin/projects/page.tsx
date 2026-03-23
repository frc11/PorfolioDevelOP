import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FolderKanban } from 'lucide-react'
import { DeleteProjectButton } from '@/components/admin/DeleteProjectButton'
import { ProjectStatus } from '@prisma/client'

// ─── Label & style maps ───────────────────────────────────────────────────────

const STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
}

// rgb values for each status — used to build inline styles
const STATUS_RGB: Record<ProjectStatus, string> = {
  PLANNING: '139,92,246',   // violet
  IN_PROGRESS: '6,182,212', // cyan
  REVIEW: '234,179,8',      // yellow
  COMPLETED: '16,185,129',  // green
}

const STATUS_TEXT: Record<ProjectStatus, string> = {
  PLANNING: 'rgb(167,139,250)',
  IN_PROGRESS: 'rgb(34,211,238)',
  REVIEW: 'rgb(250,204,21)',
  COMPLETED: 'rgb(52,211,153)',
}

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'Todos', value: '' },
  { label: 'Planificación', value: 'PLANNING' },
  { label: 'En curso', value: 'IN_PROGRESS' },
  { label: 'Revisión', value: 'REVIEW' },
  { label: 'Completados', value: 'COMPLETED' },
]

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeStatus = status ?? ''

  const isValidStatus = (s: string): s is ProjectStatus =>
    Object.values(ProjectStatus).includes(s as ProjectStatus)

  const projects = await prisma.project.findMany({
    where: isValidStatus(activeStatus) ? { status: activeStatus } : undefined,
    include: {
      organization: { select: { companyName: true } },
      tasks: { select: { status: true } },
    },
    orderBy: { status: 'asc' },
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
            Gestión
          </p>
          <h1 className="text-xl font-bold text-zinc-100">Proyectos</h1>
          <p className="mt-0.5 text-sm text-zinc-600">
            {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'}
            {activeStatus && ` · ${STATUS_LABEL[activeStatus as ProjectStatus]}`}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
        >
          + Nuevo proyecto
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_TABS.map(({ label, value }) => {
          const isActive = activeStatus === value
          const rgb = value ? STATUS_RGB[value as ProjectStatus] : null
          return (
            <Link
              key={value}
              href={value ? `/admin/projects?status=${value}` : '/admin/projects'}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
              style={
                isActive && rgb
                  ? {
                      border: `1px solid rgba(${rgb},0.3)`,
                      background: `rgba(${rgb},0.1)`,
                      color: STATUS_TEXT[value as ProjectStatus],
                    }
                  : isActive
                  ? {
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgb(228,228,231)',
                    }
                  : {
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: 'rgb(113,113,122)',
                    }
              }
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-2xl py-20 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(6,182,212,0.1)' }}
          >
            <FolderKanban size={20} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">
              {activeStatus
                ? `No hay proyectos con estado "${STATUS_LABEL[activeStatus as ProjectStatus]}".`
                : 'No hay proyectos registrados todavía.'}
            </p>
            {!activeStatus && (
              <Link
                href="/admin/projects/new"
                className="mt-2 inline-block text-sm text-cyan-400 transition-colors hover:text-cyan-300"
              >
                Crear el primero →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div
          className="overflow-x-auto rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <table className="w-full text-sm">
            {/* Head */}
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Nombre
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Cliente
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Estado
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Progreso
                </th>
                <th className="px-5 py-3.5 text-right text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Acciones
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {projects.map((project) => {
                const done = project.tasks.filter((t) => t.status === 'DONE').length
                const total = project.tasks.length
                const pct = total > 0 ? Math.round((done / total) * 100) : 0
                const rgb = STATUS_RGB[project.status]
                const textColor = STATUS_TEXT[project.status]

                return (
                  <tr
                    key={project.id}
                    className="transition-colors hover:bg-white/[0.025]"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    {/* Name */}
                    <td className="px-5 py-4 font-medium text-zinc-100">
                      {project.name}
                    </td>

                    {/* Client */}
                    <td className="px-5 py-4 text-zinc-500">
                      {project.organization?.companyName}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          background: `rgba(${rgb},0.12)`,
                          border: `1px solid rgba(${rgb},0.25)`,
                          color: textColor,
                        }}
                      >
                        {STATUS_LABEL[project.status]}
                      </span>
                    </td>

                    {/* Progress bar */}
                    <td className="px-5 py-4">
                      {total === 0 ? (
                        <span className="text-xs text-zinc-700">Sin tareas</span>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-1.5 w-28 overflow-hidden rounded-full"
                            style={{ background: 'rgba(255,255,255,0.07)' }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background:
                                  pct === 100
                                    ? 'linear-gradient(90deg, #06b6d4, #10b981)'
                                    : 'rgba(6,182,212,0.8)',
                              }}
                            />
                          </div>
                          <span
                            className={`text-xs tabular-nums ${done === total ? 'text-emerald-400' : 'text-zinc-500'}`}
                          >
                            {done}/{total}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/admin/projects/${project.id}/edit`}
                          className="text-xs text-zinc-500 transition-colors hover:text-zinc-200"
                        >
                          Editar
                        </Link>
                        <DeleteProjectButton
                          projectId={project.id}
                          projectName={project.name}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

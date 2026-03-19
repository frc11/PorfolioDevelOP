import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { DeleteProjectButton } from '@/components/admin/DeleteProjectButton'
import { ProjectStatus } from '@prisma/client'

const STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
}

const STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNING: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
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
      client: { select: { companyName: true } },
      tasks: { select: { status: true } },
    },
    orderBy: { status: 'asc' },
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
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
          className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
        >
          + Nuevo proyecto
        </Link>
      </div>

      {/* Status filter */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {FILTER_TABS.map(({ label, value }) => {
          const isActive = activeStatus === value
          return (
            <Link
              key={value}
              href={value ? `/admin/projects?status=${value}` : '/admin/projects'}
              className={[
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                isActive
                  ? 'text-cyan-400'
                  : 'text-zinc-500 hover:text-zinc-300',
              ].join(' ')}
              style={
                isActive
                  ? {
                      border: '1px solid rgba(6,182,212,0.3)',
                      background: 'rgba(6,182,212,0.08)',
                    }
                  : {
                      border: '1px solid rgba(255,255,255,0.08)',
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
          className="rounded-xl p-10 text-center"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-zinc-500">
            {activeStatus
              ? `No hay proyectos con estado "${STATUS_LABEL[activeStatus as ProjectStatus]}".`
              : 'No hay proyectos registrados todavía.'}
          </p>
          {!activeStatus && (
            <Link
              href="/admin/projects/new"
              className="mt-3 inline-block text-sm text-cyan-400 hover:text-cyan-300"
            >
              Crear el primero →
            </Link>
          )}
        </div>
      ) : (
        <div
          className="overflow-x-auto rounded-xl"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">
                  Cliente
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">
                  Tareas
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const done = project.tasks.filter((t) => t.status === 'DONE').length
                const total = project.tasks.length
                return (
                  <tr
                    key={project.id}
                    className="transition-colors"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3.5 font-medium text-zinc-100">
                      {project.name}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500">
                      {project.client.companyName}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[project.status]}`}
                      >
                        {STATUS_LABEL[project.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {total === 0 ? (
                        <span className="text-zinc-700">—</span>
                      ) : (
                        <span className={done === total ? 'text-green-400' : 'text-zinc-400'}>
                          {done}/{total}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="text-xs text-cyan-400 transition-colors hover:text-cyan-300"
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

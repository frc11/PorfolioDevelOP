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
          <h1 className="text-xl font-semibold text-zinc-100">Proyectos</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'}
            {activeStatus && ` · ${STATUS_LABEL[activeStatus as ProjectStatus]}`}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-cyan-400"
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
                'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300',
              ].join(' ')}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-10 text-center">
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
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium text-zinc-400">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">
                  Cliente
                </th>
                <th className="px-4 py-3 text-center font-medium text-zinc-400">
                  Estado
                </th>
                <th className="px-4 py-3 text-center font-medium text-zinc-400">
                  Tareas
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {projects.map((project) => {
                const done = project.tasks.filter((t) => t.status === 'DONE').length
                const total = project.tasks.length
                return (
                  <tr
                    key={project.id}
                    className="transition-colors hover:bg-zinc-900/60"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {project.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {project.client.companyName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[project.status]}`}
                      >
                        {STATUS_LABEL[project.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-400">
                      {total === 0 ? (
                        <span className="text-zinc-600">—</span>
                      ) : (
                        <span className={done === total ? 'text-green-400' : ''}>
                          {done}/{total}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="text-cyan-400 transition-colors hover:text-cyan-300"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/admin/projects/${project.id}/edit`}
                          className="text-zinc-400 transition-colors hover:text-zinc-100"
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

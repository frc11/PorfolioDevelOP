import { ProjectStatus } from '@prisma/client'
import { FolderKanban } from 'lucide-react'
import Link from 'next/link'
import { DeleteProjectButton } from '@/components/admin/DeleteProjectButton'
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminSurface } from '@/components/admin/admin-ui'
import { prisma } from '@/lib/prisma'

const STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
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
      <AdminPageHeader
        eyebrow="Gestión"
        title="Proyectos"
        description={`${projects.length} ${projects.length === 1 ? 'proyecto' : 'proyectos'}${activeStatus ? ` · ${STATUS_LABEL[activeStatus as ProjectStatus]}` : ''}`}
        action={
          <Link href="/admin/projects/new" className="admin-btn-primary">
            + Nuevo proyecto
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(({ label, value }) => {
          const isActive = activeStatus === value
          return (
            <Link
              key={value}
              href={value ? `/admin/projects?status=${value}` : '/admin/projects'}
              className={isActive ? 'rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-200' : 'rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200'}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {projects.length === 0 ? (
        <AdminEmptyState
          icon={FolderKanban}
          title={activeStatus ? `No hay proyectos con estado "${STATUS_LABEL[activeStatus as ProjectStatus]}".` : 'No hay proyectos registrados todavía.'}
          description="El tablero de proyectos se alimenta apenas creás el primer flujo de trabajo."
          ctaHref={activeStatus ? '/admin/projects' : '/admin/projects/new'}
          ctaLabel={activeStatus ? 'Limpiar filtro →' : 'Crear el primero →'}
        />
      ) : (
        <AdminSurface className="overflow-x-auto p-0">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cliente</th>
                <th className="text-center">Estado</th>
                <th>Progreso</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const done = project.tasks.filter((t) => t.status === 'DONE').length
                const total = project.tasks.length
                const pct = total > 0 ? Math.round((done / total) * 100) : 0

                return (
                  <tr key={project.id}>
                    <td className="font-medium text-zinc-100">{project.name}</td>
                    <td className="text-zinc-500">{project.organization?.companyName}</td>
                    <td className="text-center">
                      <AdminStatusBadge label={STATUS_LABEL[project.status]} />
                    </td>
                    <td>
                      {total === 0 ? (
                        <span className="text-xs text-zinc-600">Sin tareas</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-white/[0.07]">
                            <div className="h-full rounded-full bg-[linear-gradient(90deg,#06b6d4,#10b981)]" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs tabular-nums text-zinc-500">{done}/{total}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-4">
                        <Link href={`/admin/projects/${project.id}`} className="text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200">
                          Ver
                        </Link>
                        <Link href={`/admin/projects/${project.id}/edit`} className="text-xs text-zinc-500 transition-colors hover:text-zinc-200">
                          Editar
                        </Link>
                        <DeleteProjectButton projectId={project.id} projectName={project.name} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </AdminSurface>
      )}
    </div>
  )
}

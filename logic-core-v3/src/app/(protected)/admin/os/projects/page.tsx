import Link from 'next/link'
import { OsProjectStatus, OsServiceType } from '@prisma/client'
import { listProjects } from './_actions/project.actions'
import { ProjectForm } from './_components/project-form'
import { ProjectList, type ProjectListItem } from './_components/project-list'

type ProjectsPageProps = {
  searchParams?: Promise<{
    status?: string | string[]
    serviceType?: string | string[]
  }>
}

const STATUS_OPTIONS: Array<{ value: 'ALL' | OsProjectStatus; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'EN_DESARROLLO', label: 'En desarrollo' },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'EN_MANTENIMIENTO', label: 'En mantenimiento' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const SERVICE_OPTIONS: Array<{ value: 'ALL' | OsServiceType; label: string }> = [
  { value: 'ALL', label: 'Todos los servicios' },
  { value: 'WEB', label: 'Web' },
  { value: 'AI_AGENT', label: 'AI Agent' },
  { value: 'AUTOMATION', label: 'Automation' },
  { value: 'CUSTOM_SOFTWARE', label: 'Custom Software' },
]

function getSingleValue(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function isProjectStatus(value: string | undefined): value is OsProjectStatus {
  return STATUS_OPTIONS.some((option) => option.value === value && option.value !== 'ALL')
}

function isServiceType(value: string | undefined): value is OsServiceType {
  return SERVICE_OPTIONS.some((option) => option.value === value && option.value !== 'ALL')
}

function buildStatusHref(status: 'ALL' | OsProjectStatus, serviceType?: OsServiceType): string {
  const params = new URLSearchParams()

  if (status !== 'ALL') {
    params.set('status', status)
  }

  if (serviceType) {
    params.set('serviceType', serviceType)
  }

  const query = params.toString()
  return query ? `/admin/os/projects?${query}` : '/admin/os/projects'
}

export default async function AgencyOsProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const rawStatus = getSingleValue(resolvedSearchParams?.status)
  const rawServiceType = getSingleValue(resolvedSearchParams?.serviceType)

  const selectedStatus = isProjectStatus(rawStatus) ? rawStatus : undefined
  const selectedServiceType = isServiceType(rawServiceType) ? rawServiceType : undefined

  const result = await listProjects()
  const projects: ProjectListItem[] = result.success ? result.data : []

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = selectedStatus ? project.status === selectedStatus : true
    const matchesServiceType = selectedServiceType
      ? project.serviceType === selectedServiceType
      : true

    return matchesStatus && matchesServiceType
  })

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Agency OS / Proyectos
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Entregas, mantenimiento y rentabilidad
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Seguimiento centralizado de proyectos activos, hitos cobrados y avance operativo del equipo.
            </p>
          </div>

          <ProjectForm triggerLabel="Nuevo proyecto" />
        </div>

        <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => {
              const isActive =
                option.value === 'ALL' ? !selectedStatus : option.value === selectedStatus

              return (
                <Link
                  key={option.value}
                  href={buildStatusHref(option.value, selectedServiceType)}
                  className={[
                    'inline-flex rounded-full border px-3 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
                      : 'border-white/10 bg-black/20 text-zinc-300 hover:bg-white/5',
                  ].join(' ')}
                >
                  {option.label}
                </Link>
              )
            })}
          </div>

          <form className="flex flex-wrap items-center gap-3" action="/admin/os/projects">
            {selectedStatus ? <input type="hidden" name="status" value={selectedStatus} /> : null}

            <select
              name="serviceType"
              defaultValue={selectedServiceType ?? 'ALL'}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            >
              {SERVICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
            >
              Aplicar filtro
            </button>

            <Link
              href="/admin/os/projects"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Limpiar
            </Link>
          </form>
        </div>
      </div>

      {!result.success ? (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {result.error}
        </div>
      ) : null}

      <ProjectList projects={filteredProjects} />
    </section>
  )
}

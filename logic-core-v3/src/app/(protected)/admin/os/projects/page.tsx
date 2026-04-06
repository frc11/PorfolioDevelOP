import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { ProjectStatus, ServiceType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { listProjects } from './_actions/project.actions'
import { ProjectForm } from './_components/project-form'
import { ProjectList, type ProjectListItem } from './_components/project-list'

type ProjectsPageProps = {
  searchParams?: Promise<{
    status?: string | string[]
    serviceType?: string | string[]
    visibility?: string | string[]
  }>
}

const INTERNAL_ORGANIZATION_SLUG = 'agency-os-internal'

const STATUS_OPTIONS: Array<{ value: 'ALL' | ProjectStatus; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'REVIEW', label: 'Revision' },
  { value: 'COMPLETED', label: 'Completado' },
]

const SERVICE_OPTIONS: Array<{ value: 'ALL' | ServiceType; label: string }> = [
  { value: 'ALL', label: 'Todos los servicios' },
  { value: 'WEB_DEV', label: 'Web' },
  { value: 'AI', label: 'AI' },
  { value: 'AUTOMATION', label: 'Automation' },
  { value: 'SOFTWARE', label: 'Software' },
]

const VISIBILITY_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'CLIENT', label: 'Con cliente' },
  { value: 'INTERNAL', label: 'Internos' },
] as const

type VisibilityFilter = (typeof VISIBILITY_OPTIONS)[number]['value']

function getSingleValue(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function isProjectStatus(value: string | undefined): value is ProjectStatus {
  return STATUS_OPTIONS.some((option) => option.value === value && option.value !== 'ALL')
}

function isServiceType(value: string | undefined): value is ServiceType {
  return SERVICE_OPTIONS.some((option) => option.value === value && option.value !== 'ALL')
}

function isVisibilityFilter(value: string | undefined): value is VisibilityFilter {
  return VISIBILITY_OPTIONS.some((option) => option.value === value)
}

function buildProjectsHref(input: {
  status?: 'ALL' | ProjectStatus
  serviceType?: 'ALL' | ServiceType
  visibility?: VisibilityFilter
}) {
  const params = new URLSearchParams()

  if (input.status && input.status !== 'ALL') {
    params.set('status', input.status)
  }

  if (input.serviceType && input.serviceType !== 'ALL') {
    params.set('serviceType', input.serviceType)
  }

  if (input.visibility && input.visibility !== 'ALL') {
    params.set('visibility', input.visibility)
  }

  const query = params.toString()
  return query ? `/admin/os/projects?${query}` : '/admin/os/projects'
}

export default async function AgencyOsProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const rawStatus = getSingleValue(resolvedSearchParams?.status)
  const rawServiceType = getSingleValue(resolvedSearchParams?.serviceType)
  const rawVisibility = getSingleValue(resolvedSearchParams?.visibility)

  const selectedStatus = isProjectStatus(rawStatus) ? rawStatus : undefined
  const selectedServiceType = isServiceType(rawServiceType) ? rawServiceType : undefined
  const selectedVisibility = isVisibilityFilter(rawVisibility) ? rawVisibility : 'ALL'

  const [result, organizations] = await Promise.all([
    listProjects(),
    prisma.organization.findMany({
      where: {
        slug: {
          not: INTERNAL_ORGANIZATION_SLUG,
        },
      },
      select: {
        id: true,
        companyName: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    }),
  ])

  const projects: ProjectListItem[] = result.success ? result.data : []

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = selectedStatus ? project.status === selectedStatus : true
    const matchesServiceType = selectedServiceType
      ? project.serviceType === selectedServiceType
      : true
    const matchesVisibility =
      selectedVisibility === 'ALL'
        ? true
        : selectedVisibility === 'CLIENT'
          ? project.organizationId !== null
          : project.organizationId === null

    return matchesStatus && matchesServiceType && matchesVisibility
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
              Seguimiento centralizado de proyectos del portal y proyectos internos desde una sola vista.
            </p>
          </div>

          <ProjectForm triggerLabel="Nuevo proyecto" organizations={organizations} />
        </div>

        <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {VISIBILITY_OPTIONS.map((option) => {
              const isActive = selectedVisibility === option.value

              return (
                <Link
                  key={option.value}
                  href={buildProjectsHref({
                    status: selectedStatus ?? 'ALL',
                    serviceType: selectedServiceType ?? 'ALL',
                    visibility: option.value,
                  })}
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

            <div className="mx-1 hidden h-6 w-px bg-white/10 xl:block" />

            {STATUS_OPTIONS.map((option) => {
              const isActive =
                option.value === 'ALL' ? !selectedStatus : option.value === selectedStatus

              return (
                <Link
                  key={option.value}
                  href={buildProjectsHref({
                    status: option.value,
                    serviceType: selectedServiceType ?? 'ALL',
                    visibility: selectedVisibility,
                  })}
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
            {selectedVisibility !== 'ALL' ? (
              <input type="hidden" name="visibility" value={selectedVisibility} />
            ) : null}

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

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <Building2 className="h-4 w-4 text-cyan-300" />
            <span>
              {projects.filter((project) => project.organizationId !== null).length} con cliente
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            {projects.filter((project) => project.organizationId === null).length} internos
          </div>
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

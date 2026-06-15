import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { ServiceType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { listProjects } from './_actions/project.actions'

const getOrganizationsForDropdown = unstable_cache(
  async () =>
    prisma.organization.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: 'asc' },
    }),
  ['admin-orgs'],
  { revalidate: 60, tags: ['admin-orgs', 'admin-clients'] }
)
import { ProjectForm } from './_components/project-form'
import { ProjectList, type ProjectListItem } from './_components/project-list'
import { ProjectsFilterSelect } from './_components/projects-filter-select'
import { ProjectsPeriodFilter, type PeriodFilter } from './_components/projects-period-filter'

type ProjectsPageProps = {
  searchParams?: Promise<{
    serviceType?: string | string[]
    visibility?: string | string[]
    period?: string | string[]
    from?: string | string[]
    to?: string | string[]
  }>
}

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

// Server-side copy — importing the value from a 'use client' file would give a
// module-reference stub instead of an array, breaking .some() at runtime.
const PERIOD_OPTIONS: ReadonlyArray<{ value: PeriodFilter; label: string }> = [
  { value: '1w', label: 'Última semana' },
  { value: '1m', label: 'Último mes' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último año' },
  { value: 'custom', label: 'Personalizado' },
]

const DEFAULT_PERIOD: PeriodFilter = '1m'

function getSingleValue(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function isServiceType(value: string | undefined): value is ServiceType {
  return SERVICE_OPTIONS.some((option) => option.value === value && option.value !== 'ALL')
}

function isVisibilityFilter(value: string | undefined): value is VisibilityFilter {
  return VISIBILITY_OPTIONS.some((option) => option.value === value)
}

function isPeriodFilter(value: string | undefined): value is PeriodFilter {
  return PERIOD_OPTIONS.some((option) => option.value === value)
}

function periodStart(period: PeriodFilter): Date | null {
  const start = new Date()

  switch (period) {
    case '1w':
      start.setDate(start.getDate() - 7)
      return start
    case '1m':
      start.setMonth(start.getMonth() - 1)
      return start
    case '6m':
      start.setMonth(start.getMonth() - 6)
      return start
    case '1y':
      start.setFullYear(start.getFullYear() - 1)
      return start
    case 'custom':
      return null
  }
}

function matchesPeriod(
  lastActivityAt: string | null,
  period: PeriodFilter,
  from: string,
  to: string
): boolean {
  // Sin señal de actividad → no se filtra por período (no se oculta el proyecto).
  if (!lastActivityAt) {
    return true
  }

  const activity = new Date(lastActivityAt).getTime()

  if (period === 'custom') {
    if (from) {
      const fromTime = new Date(from).getTime()
      if (Number.isFinite(fromTime) && activity < fromTime) {
        return false
      }
    }
    if (to) {
      const toTime = new Date(`${to}T23:59:59.999`).getTime()
      if (Number.isFinite(toTime) && activity > toTime) {
        return false
      }
    }
    return true
  }

  const start = periodStart(period)
  return start ? activity >= start.getTime() : true
}

function buildProjectsHref(input: {
  serviceType?: 'ALL' | ServiceType
  visibility?: VisibilityFilter
  period?: PeriodFilter
  from?: string
  to?: string
}) {
  const params = new URLSearchParams()

  if (input.serviceType && input.serviceType !== 'ALL') {
    params.set('serviceType', input.serviceType)
  }

  if (input.visibility && input.visibility !== 'ALL') {
    params.set('visibility', input.visibility)
  }

  if (input.period && input.period !== DEFAULT_PERIOD) {
    params.set('period', input.period)

    if (input.period === 'custom') {
      if (input.from) {
        params.set('from', input.from)
      }
      if (input.to) {
        params.set('to', input.to)
      }
    }
  }

  const query = params.toString()
  return query ? `/admin/projects?${query}` : '/admin/projects'
}

export default async function AgencyOsProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const rawServiceType = getSingleValue(resolvedSearchParams?.serviceType)
  const rawVisibility = getSingleValue(resolvedSearchParams?.visibility)
  const rawPeriod = getSingleValue(resolvedSearchParams?.period)

  const selectedServiceType = isServiceType(rawServiceType) ? rawServiceType : undefined
  const selectedVisibility = isVisibilityFilter(rawVisibility) ? rawVisibility : 'ALL'
  const selectedPeriod = isPeriodFilter(rawPeriod) ? rawPeriod : DEFAULT_PERIOD
  const customFrom =
    selectedPeriod === 'custom' ? getSingleValue(resolvedSearchParams?.from) ?? '' : ''
  const customTo =
    selectedPeriod === 'custom' ? getSingleValue(resolvedSearchParams?.to) ?? '' : ''

  const [result, organizations] = await Promise.all([
    listProjects(),
    getOrganizationsForDropdown(),
  ])

  const projects: ProjectListItem[] = result.success ? result.data : []

  const filteredProjects = projects.filter((project) => {
    const matchesServiceType = selectedServiceType
      ? project.serviceType === selectedServiceType
      : true
    const matchesVisibility =
      selectedVisibility === 'ALL'
        ? true
        : selectedVisibility === 'CLIENT'
          ? project.organizationId !== null
          : project.organizationId === null

    return (
      matchesServiceType &&
      matchesVisibility &&
      matchesPeriod(project.lastActivityAt, selectedPeriod, customFrom, customTo)
    )
  })

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs tracking-tight text-zinc-500">
              develOP / Proyectos
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
                    serviceType: selectedServiceType ?? 'ALL',
                    visibility: option.value,
                    period: selectedPeriod,
                    from: customFrom,
                    to: customTo,
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

          <form className="flex flex-wrap items-center gap-3" action="/admin/projects">
            {selectedVisibility !== 'ALL' ? (
              <input type="hidden" name="visibility" value={selectedVisibility} />
            ) : null}

            <ProjectsFilterSelect
              name="serviceType"
              defaultValue={selectedServiceType ?? 'ALL'}
              ariaLabel="Filtrar por tipo de servicio"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            >
              {SERVICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </ProjectsFilterSelect>

            <ProjectsPeriodFilter period={selectedPeriod} from={customFrom} to={customTo} />

            <Link
              href="/admin/projects"
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

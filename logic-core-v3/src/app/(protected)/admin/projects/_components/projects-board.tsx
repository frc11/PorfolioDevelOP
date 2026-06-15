'use client'

import { useMemo, useState } from 'react'
import { Building2 } from 'lucide-react'
import { ProjectForm } from './project-form'
import { ProjectList, type ProjectListItem } from './project-list'
import { ProjectsFilterBar } from './projects-filter-bar'
import { DEFAULT_FILTERS, filterProjects, type ProjectFilters } from './projects-filters'

type OrganizationOption = {
  id: string
  companyName: string
}

type ProjectsBoardProps = {
  projects: ProjectListItem[]
  organizations: OrganizationOption[]
  errorMessage: string | null
}

/**
 * Raíz client-side de la vista de proyectos. Es dueña del estado de los filtros
 * (servicio / visibilidad / período) y filtra en memoria sin navegar ni recargar.
 * `page.tsx` queda como wrapper server que sólo trae la lista completa. Los
 * contadores ("con cliente / internos") se calculan SIEMPRE sobre la lista
 * completa, nunca sobre la filtrada, para que no salten al cambiar filtros.
 */
export function ProjectsBoard({ projects, organizations, errorMessage }: ProjectsBoardProps) {
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS)

  const filteredProjects = useMemo(
    () => filterProjects(projects, filters),
    [projects, filters]
  )

  const clientCount = useMemo(
    () => projects.filter((project) => project.organizationId !== null).length,
    [projects]
  )
  const internalCount = projects.length - clientCount

  const isDefault =
    filters.service === DEFAULT_FILTERS.service &&
    filters.visibility === DEFAULT_FILTERS.visibility &&
    filters.period === DEFAULT_FILTERS.period &&
    filters.from === '' &&
    filters.to === ''

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs tracking-tight text-zinc-500">develOP / Proyectos</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Entregas, mantenimiento y rentabilidad
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Seguimiento centralizado de proyectos del portal y proyectos internos desde una sola vista.
            </p>
          </div>

          <ProjectForm triggerLabel="Nuevo proyecto" organizations={organizations} />
        </div>

        <div className="mt-6">
          <ProjectsFilterBar
            filters={filters}
            isDefault={isDefault}
            onServiceChange={(service) => setFilters((current) => ({ ...current, service }))}
            onVisibilityChange={(visibility) =>
              setFilters((current) => ({ ...current, visibility }))
            }
            onPeriodChange={(period, from, to) =>
              setFilters((current) => ({ ...current, period, from, to }))
            }
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <Building2 className="h-4 w-4 text-cyan-300" strokeWidth={1.5} />
            <span>{clientCount} con cliente</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            {internalCount} internos
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <ProjectList projects={filteredProjects} />
    </section>
  )
}

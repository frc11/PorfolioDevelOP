'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'
import type { ProjectStatus } from '@prisma/client'
import { deleteProject, updateProjectStatus } from '../_actions/project.actions'
import { ProjectForm } from './project-form'
import { ProjectList, type ProjectDnd, type ProjectListItem } from './project-list'
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
  const router = useRouter()
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS)

  // Espejo optimista de la lista del server para el DnD; se re-sincroniza tras
  // cada router.refresh (mismo patrón que task-list).
  const [localProjects, setLocalProjects] = useState<ProjectListItem[]>(projects)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<ProjectStatus | null>(null)
  const [dndError, setDndError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setLocalProjects(projects)
  }, [projects])

  // Auto-scroll del board mientras se arrastra una card: el scroll container real
  // es el <main> del admin. Si el cursor entra en la zona de borde sup/inf,
  // scrollea (velocidad proporcional a la proximidad) para alcanzar secciones
  // lejanas (Planning ↔ Completado) que no entran juntas en pantalla.
  useEffect(() => {
    if (!draggingId) {
      return
    }
    const scroller = document.querySelector('main')
    if (!scroller) {
      return
    }

    const EDGE = 90
    const MAX_SPEED = 20
    let pointerY = -1
    let frame = 0

    const handleDragOver = (event: DragEvent) => {
      pointerY = event.clientY
    }

    const tick = () => {
      if (pointerY >= 0) {
        const rect = scroller.getBoundingClientRect()
        const topDistance = pointerY - rect.top
        const bottomDistance = rect.bottom - pointerY

        if (topDistance < EDGE) {
          scroller.scrollTop -= MAX_SPEED * (1 - Math.max(0, topDistance) / EDGE)
        } else if (bottomDistance < EDGE) {
          scroller.scrollTop += MAX_SPEED * (1 - Math.max(0, bottomDistance) / EDGE)
        }
      }
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('dragover', handleDragOver, true)
    frame = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('dragover', handleDragOver, true)
      cancelAnimationFrame(frame)
    }
  }, [draggingId])

  const filteredProjects = useMemo(
    () => filterProjects(localProjects, filters),
    [localProjects, filters]
  )

  const clientCount = useMemo(
    () => localProjects.filter((project) => project.organizationId !== null).length,
    [localProjects]
  )
  const internalCount = localProjects.length - clientCount

  const handleDropOnStatus = (status: ProjectStatus) => {
    const projectId = draggingId
    setDraggingId(null)
    setDragOverStatus(null)

    if (!projectId) {
      return
    }

    const project = localProjects.find((item) => item.id === projectId)
    if (!project || project.status === status) {
      return
    }

    const previousProjects = localProjects
    setDndError(null)
    // Optimista: COMPLETED sella deliveredAt en el server; acá sólo se mueve el
    // estado y el refresh reconcilia el resto.
    setLocalProjects((current) =>
      current.map((item) => (item.id === projectId ? { ...item, status } : item))
    )

    startTransition(async () => {
      const result = await updateProjectStatus({ projectId, status })

      if (!result.success) {
        setLocalProjects(previousProjects)
        setDndError(result.error)
        return
      }

      router.refresh()
    })
  }

  const handleDeleteProject = (projectId: string) => {
    const previousProjects = localProjects
    setDeleteError(null)
    // Optimista: la card desaparece al confirmar; rollback si la action falla.
    setLocalProjects((current) => current.filter((item) => item.id !== projectId))

    startTransition(async () => {
      const result = await deleteProject(projectId)

      if (!result.success) {
        setLocalProjects(previousProjects)
        setDeleteError(result.error)
        return
      }

      router.refresh()
    })
  }

  const dnd: ProjectDnd = {
    draggingId,
    dragOverStatus,
    onCardDragStart: (project) => setDraggingId(project.id),
    onCardDragEnd: () => {
      setDraggingId(null)
      setDragOverStatus(null)
    },
    onSectionDragOver: (status) => setDragOverStatus(status),
    onSectionDragLeave: (status) =>
      setDragOverStatus((current) => (current === status ? null : current)),
    onSectionDrop: handleDropOnStatus,
  }

  const isDefault =
    filters.service === DEFAULT_FILTERS.service &&
    filters.visibility === DEFAULT_FILTERS.visibility &&
    filters.start.period === DEFAULT_FILTERS.start.period &&
    filters.start.from === '' &&
    filters.start.to === '' &&
    filters.delivery.period === DEFAULT_FILTERS.delivery.period &&
    filters.delivery.from === '' &&
    filters.delivery.to === ''

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
            onStartChange={(period, from, to) =>
              setFilters((current) => ({ ...current, start: { period, from, to } }))
            }
            onDeliveryChange={(period, from, to) =>
              setFilters((current) => ({ ...current, delivery: { period, from, to } }))
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

      {(errorMessage ?? dndError ?? deleteError) ? (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {errorMessage ?? dndError ?? deleteError}
        </div>
      ) : null}

      <ProjectList
        projects={filteredProjects}
        dnd={dnd}
        onDeleteProject={handleDeleteProject}
      />
    </section>
  )
}

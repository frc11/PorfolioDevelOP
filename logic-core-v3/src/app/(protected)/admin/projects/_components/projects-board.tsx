'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Building2 } from 'lucide-react'
import type { ProjectStatus } from '@prisma/client'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { useIsClient } from '@/lib/use-is-client'
import { deleteProject, updateProjectStatus } from '../_actions/project.actions'
import { ProjectForm } from './project-form'
import { ProjectCard } from './project-card'
import { ProjectList, PROJECT_STATUS_ORDER, type ProjectListItem } from './project-list'
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

// Drag por HOLD (no por distancia): un swipe rápido scrollea la página y mantener apretado
// ~DRAG_HOLD_DELAY ms levanta la card. tolerance = px tolerados durante el hold (evita que un
// micro-temblor del dedo dispare/cancele el drag). Mismos valores que el pipeline de Leads.
const DRAG_HOLD_DELAY = 200
const DRAG_HOLD_TOLERANCE = 5

/**
 * Raíz client-side de la vista de proyectos. Es dueña del estado de los filtros
 * (servicio / visibilidad / período) y filtra en memoria sin navegar ni recargar.
 * `page.tsx` queda como wrapper server que sólo trae la lista completa. Los
 * contadores ("con cliente / internos") se calculan SIEMPRE sobre la lista
 * completa, nunca sobre la filtrada, para que no salten al cambiar filtros.
 *
 * El DnD entre columnas usa @dnd-kit (mismo motor que Leads): captura el proyecto en estado al
 * iniciar el drag y lo usa en onDragEnd (cuando el drag viene del overview, la card fuente se
 * desmonta al cerrarse el modal y dnd-kit deja `active.data` vacío). El cambio de estado va por
 * la server action existente `updateProjectStatus` (Zod + requireSuperAdmin + revalidate).
 */
export function ProjectsBoard({ projects, organizations, errorMessage }: ProjectsBoardProps) {
  const router = useRouter()
  const reduced = useReducedMotion()
  const isClient = useIsClient()
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS)

  // Espejo optimista de la lista del server para el DnD; se re-sincroniza tras
  // cada router.refresh (mismo patrón que task-list).
  const [localProjects, setLocalProjects] = useState<ProjectListItem[]>(projects)
  // Proyecto en arrastre, capturado al iniciar (NO se lee de event.active.data en onDragEnd:
  // se vacía cuando la card fuente se desmonta al cerrarse el overview).
  const [activeDragProject, setActiveDragProject] = useState<ProjectListItem | null>(null)
  // Overview controlado acá (lift desde project-list) para poder cerrarlo en handleDragStart.
  const [popupStatus, setPopupStatus] = useState<ProjectStatus | null>(null)
  const [dndError, setDndError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setLocalProjects(projects)
  }, [projects])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: DRAG_HOLD_DELAY, tolerance: DRAG_HOLD_TOLERANCE },
    }),
    useSensor(KeyboardSensor, {
      // Space levanta/suelta; Enter queda libre para que el <Link> navegue al detalle.
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  )

  const filteredProjects = useMemo(
    () => filterProjects(localProjects, filters),
    [localProjects, filters]
  )

  const clientCount = useMemo(
    () => localProjects.filter((project) => project.organizationId !== null).length,
    [localProjects]
  )
  const internalCount = localProjects.length - clientCount

  const moveProjectToStatus = (project: ProjectListItem, status: ProjectStatus) => {
    const previousProjects = localProjects
    setDndError(null)
    // Optimista: COMPLETED sella deliveredAt en el server; acá sólo se mueve el
    // estado y el refresh reconcilia el resto.
    setLocalProjects((current) =>
      current.map((item) => (item.id === project.id ? { ...item, status } : item))
    )

    startTransition(async () => {
      const result = await updateProjectStatus({ projectId: project.id, status })

      if (!result.success) {
        setLocalProjects(previousProjects)
        setDndError(result.error)
        return
      }

      router.refresh()
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const project = event.active.data.current?.project as ProjectListItem | undefined
    setActiveDragProject(project ?? null)
    // Si el drag arrancó desde el overview, cerralo: revela las columnas droppables del board.
    // El DragOverlay + nodo cacheado mantienen la card en arrastre.
    setPopupStatus(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const project = activeDragProject
    setActiveDragProject(null)
    const { over } = event
    if (!over || !project) {
      return
    }
    // El droppable id es un ProjectStatus sólo si matchea el orden canónico (sin cast inseguro).
    const targetStatus = PROJECT_STATUS_ORDER.find((status) => status === over.id)
    // Mover sólo si cambia de columna. Misma columna = no-op (no hay orden persistente).
    if (targetStatus && project.status !== targetStatus) {
      moveProjectToStatus(project, targetStatus)
    }
  }

  const handleDragCancel = () => {
    setActiveDragProject(null)
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <ProjectList
          projects={filteredProjects}
          activeDragStatus={activeDragProject?.status ?? null}
          popupStatus={popupStatus}
          onPopupStatusChange={setPopupStatus}
          onDeleteProject={handleDeleteProject}
        />

        {/* DragOverlay portaleado a body: escapa el containing-block del backdrop-filter del
            <main> admin y mantiene visible la card cuando el overview (su fuente) se desmonta. */}
        {isClient
          ? createPortal(
              <DragOverlay dropAnimation={reduced ? null : undefined}>
                {activeDragProject ? (
                  <div className="w-[340px]">
                    <ProjectCard project={activeDragProject} presentational />
                  </div>
                ) : null}
              </DragOverlay>,
              document.body,
            )
          : null}
      </DndContext>
    </section>
  )
}

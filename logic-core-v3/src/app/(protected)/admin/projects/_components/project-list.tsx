'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Hand, Maximize2 } from 'lucide-react'
import type { ProjectStatus } from '@prisma/client'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { OverlayModal } from './overlay-modal'
import { DraggableProjectCard } from './draggable-project-card'
import { DroppableProjectColumn } from './droppable-project-column'
import type { ProjectCardData } from './project-card'

export type ProjectListItem = ProjectCardData

type ProjectListProps = {
  projects: ProjectListItem[]
  /** Status del proyecto en arrastre (lo provee el board) → para no resaltar su columna de origen. */
  activeDragStatus?: ProjectStatus | null
  /** Overview controlado por el board (lo cierra al iniciar un drag, en handleDragStart). */
  popupStatus: ProjectStatus | null
  onPopupStatusChange: (status: ProjectStatus | null) => void
  onDeleteProject?: (projectId: string) => void
}

// Siempre visibles, en este orden, aunque la sección esté vacía.
const STATUS_SECTIONS: Array<{ status: ProjectStatus; label: string }> = [
  { status: 'PLANNING', label: 'Planning' },
  { status: 'IN_PROGRESS', label: 'En progreso' },
  { status: 'REVIEW', label: 'Revision' },
  { status: 'COMPLETED', label: 'Completado' },
]

/** Orden canónico de estados — el board lo usa para validar el droppable id en onDragEnd. */
export const PROJECT_STATUS_ORDER: ProjectStatus[] = STATUS_SECTIONS.map((section) => section.status)

// Preview capado por sección: muestra ~1 fila (PREVIEW_VISIBLE_COUNT cards,
// calibrable) + un asomo de la siguiente con fade al borde inferior. El resto se
// ve en el popup del estado; sin scroll interno. Todo calibrable.
const PREVIEW_VISIBLE_COUNT = 4
const PREVIEW_MAX_HEIGHT = '42rem'
const PREVIEW_MASK = 'linear-gradient(to bottom, #000 calc(100% - 7rem), transparent)'

/**
 * Board de proyectos por estado. Cada sección es un `DroppableProjectColumn` (drop target de
 * dnd-kit) y cada card un `DraggableProjectCard`. El overview (modal por estado) monta sus cards
 * con un `dragId` prefijado y vive en el mismo `<DndContext>` que el board (lo provee
 * projects-board) → sus cards son draggables y, al iniciar el drag, el board cierra el overview.
 */
export function ProjectList({
  projects,
  activeDragStatus = null,
  popupStatus,
  onPopupStatusChange,
  onDeleteProject,
}: ProjectListProps) {
  const reduce = useReducedMotion()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const popupSection = popupStatus
    ? STATUS_SECTIONS.find((section) => section.status === popupStatus)
    : undefined
  const popupProjects = popupStatus
    ? projects.filter((project) => project.status === popupStatus)
    : []

  return (
    <div className="space-y-6">
      <p className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <Hand className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        Mantené apretada una card para moverla de estado
      </p>

      {STATUS_SECTIONS.map((section) => {
        const sectionProjects = projects.filter((project) => project.status === section.status)
        const canDrop = activeDragStatus !== null && activeDragStatus !== section.status
        const isCapped = sectionProjects.length > PREVIEW_VISIBLE_COUNT

        return (
          <DroppableProjectColumn key={section.status} status={section.status} canDrop={canDrop}>
            {(showDropHint) => (
              <>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onPopupStatusChange(section.status)}
                    aria-label={`Ver todos los proyectos en ${section.label}`}
                    className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-white transition-colors hover:text-cyan-200"
                  >
                    {section.label}
                    <Maximize2
                      className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-cyan-300"
                      strokeWidth={1.5}
                    />
                  </button>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-zinc-400">
                    {sectionProjects.length}
                  </span>
                </div>

                {sectionProjects.length > 0 ? (
                  <div
                    // Preview capado: ~1 fila + asomo de la siguiente con fade (mask-image) si
                    // hay más de PREVIEW_VISIBLE_COUNT; sin scroll interno. El resto en el popup.
                    className={`relative mt-5 ${isCapped ? 'overflow-hidden' : ''}`}
                    style={
                      isCapped
                        ? {
                            maxHeight: PREVIEW_MAX_HEIGHT,
                            maskImage: PREVIEW_MASK,
                            WebkitMaskImage: PREVIEW_MASK,
                          }
                        : undefined
                    }
                  >
                    <motion.div
                      className="flex flex-wrap items-stretch gap-4"
                      variants={staggerContainer}
                      initial={reduce ? false : 'hidden'}
                      animate="visible"
                    >
                      {sectionProjects.map((project) => (
                        <motion.div
                          key={project.id}
                          variants={staggerItem}
                          className="flex w-[340px] shrink-0"
                        >
                          <DraggableProjectCard
                            project={project}
                            onDeleteProject={onDeleteProject}
                            confirming={confirmingId === project.id}
                            onConfirmOpen={() => setConfirmingId(project.id)}
                            onConfirmClose={() => setConfirmingId(null)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ) : (
                  <p
                    className={[
                      'mt-5 rounded-2xl border border-dashed px-4 py-8 text-center text-sm transition-colors',
                      showDropHint
                        ? 'border-cyan-400/40 bg-cyan-400/[0.06] text-cyan-100'
                        : 'border-white/10 bg-black/10 text-zinc-500',
                    ].join(' ')}
                  >
                    {showDropHint
                      ? 'Soltá acá para mover a esta columna.'
                      : 'Sin proyectos en este estado para los filtros actuales.'}
                  </p>
                )}
              </>
            )}
          </DroppableProjectColumn>
        )
      })}

      {popupStatus && popupSection ? (
        <OverlayModal
          open
          onClose={() => onPopupStatusChange(null)}
          title={popupSection.label}
          eyebrow={`develOP / Proyectos · ${popupProjects.length} ${
            popupProjects.length === 1 ? 'proyecto' : 'proyectos'
          }`}
          panelClassName="max-w-6xl"
        >
          {popupProjects.length > 0 ? (
            <div
              className="mt-6 grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
            >
              {popupProjects.map((project) => (
                <DraggableProjectCard
                  key={project.id}
                  project={project}
                  // dragId prefijado: la misma card puede estar en el preview del board → sin él,
                  // dos draggables con el mismo id romperían el registro de dnd-kit.
                  dragId={`overview-${project.id}`}
                  onDeleteProject={onDeleteProject}
                  confirming={confirmingId === project.id}
                  onConfirmOpen={() => setConfirmingId(project.id)}
                  onConfirmClose={() => setConfirmingId(null)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-zinc-400">Sin proyectos en este estado.</p>
          )}
        </OverlayModal>
      ) : null}
    </div>
  )
}

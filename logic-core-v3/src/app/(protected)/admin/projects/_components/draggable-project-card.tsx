'use client'

import { useEffect, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Trash2 } from 'lucide-react'
import { ProjectCard, type ProjectCardData } from './project-card'
import { InlineConfirm } from '../../_components/inline-confirm'

type DraggableProjectCardProps = {
  project: ProjectCardData
  onDeleteProject?: (projectId: string) => void
  confirming: boolean
  onConfirmOpen: () => void
  onConfirmClose: () => void
  /** id de drag (default project.id). El overview usa uno propio (prefijo) para no colisionar
   *  con la card del board cuando el proyecto también está entre los visibles de su columna. */
  dragId?: string
}

/**
 * Envuelve ProjectCard con `useDraggable` + el tacho/confirmación scoped. Aísla el hook de
 * dnd-kit (no puede vivir en el `.map()` de project-list) y deja a ProjectCard presentacional.
 * Debe montarse SIEMPRE dentro de un `<DndContext>`. El drag va sobre el `<Link>` (lo forwardea
 * ProjectCard); el tacho y la confirmación son HERMANOS del Link → no inician drag (antes
 * usaban `data-no-drag` contra el `onDragStart` nativo; bajo dnd-kit el listener vive en el
 * Link, no en este wrapper, así que un click en el tacho nunca lo toca).
 */
export function DraggableProjectCard({
  project,
  onDeleteProject,
  confirming,
  onConfirmOpen,
  onConfirmClose,
  dragId,
}: DraggableProjectCardProps) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: dragId ?? project.id,
    data: { project },
  })

  // Tras un drag, suprimir el click "fantasma" que navegaría al detalle (la card navega por
  // <Link>). El HOLD de 200ms resuelve el INICIO; esta guarda resuelve el FIN.
  const wasDragged = useRef(false)
  useEffect(() => {
    if (isDragging) {
      wasDragged.current = true
      return
    }
    // Al soltar, limpiar en el próximo tick: el click fantasma llega antes y se anula.
    const timeout = window.setTimeout(() => {
      wasDragged.current = false
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [isDragging])

  const handleClickCapture = (event: ReactMouseEvent<HTMLElement>) => {
    if (wasDragged.current) {
      event.preventDefault()
      event.stopPropagation()
      wasDragged.current = false
    }
  }

  return (
    <div
      className={[
        'relative flex w-full',
        // El original se oculta mientras el DragOverlay muestra la copia flotante (incluye el
        // tacho, hermano del Link, para que no quede flotando sobre una card invisible).
        isDragging ? 'opacity-0' : '',
      ].join(' ')}
    >
      <ProjectCard
        project={project}
        dragSetNodeRef={setNodeRef}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
        onClickCapture={handleClickCapture}
      />

      {onDeleteProject ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onConfirmOpen()
          }}
          aria-label={`Eliminar proyecto ${project.name}`}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-rose-400/20 bg-rose-500/10 text-rose-300 backdrop-blur-sm transition-colors hover:bg-rose-500/20"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      ) : null}

      {onDeleteProject ? (
        <InlineConfirm
          open={confirming}
          onClose={onConfirmClose}
          onConfirm={() => {
            onConfirmClose()
            onDeleteProject(project.id)
          }}
          title="Eliminar proyecto"
          description={
            <>
              ¿Seguro que querés eliminar{' '}
              <span className="font-medium text-white">{project.name}</span>? Se eliminará junto con
              sus tareas, registros de tiempo e hitos.
            </>
          }
          confirmLabel="Eliminar"
        />
      ) : null}
    </div>
  )
}

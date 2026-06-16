'use client'

import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { ProjectStatus } from '@prisma/client'

type DroppableProjectColumnProps = {
  status: ProjectStatus
  /** El proyecto en arrastre puede soltarse acá (es de otra columna) → habilita el highlight. */
  canDrop: boolean
  /** Contenido de la sección. Render-prop: recibe `showDropHint` (canDrop && isOver) porque el
   *  cuerpo lo necesita para el texto "Soltá acá" del estado vacío. */
  children: (showDropHint: boolean) => ReactNode
}

/**
 * Sección-columna como drop target de dnd-kit. Aísla `useDroppable` (no puede vivir dentro
 * del `.map()` de project-list por las reglas de hooks) y aplica el highlight del borde. El
 * id del droppable es el `ProjectStatus`, que el board lee en `onDragEnd` para mover el
 * proyecto vía `updateProjectStatus`. Debe montarse SIEMPRE dentro de un `<DndContext>`.
 */
export function DroppableProjectColumn({ status, canDrop, children }: DroppableProjectColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const showDropHint = canDrop && isOver

  return (
    <section
      ref={setNodeRef}
      className={[
        'rounded-[28px] border bg-white/5 p-5 backdrop-blur-xl transition-colors',
        showDropHint ? 'border-cyan-400/40 bg-cyan-400/[0.06]' : 'border-white/10',
      ].join(' ')}
    >
      {children(showDropHint)}
    </section>
  )
}

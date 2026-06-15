'use client'

import { useEffect, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { LeadCard } from './lead-card'
import type { LeadPipelineLead } from './lead-pipeline.shared'

type DraggableLeadCardProps = {
  lead: LeadPipelineLead
  isPending: boolean
  onDelete: (lead: LeadPipelineLead) => void
}

/**
 * Envuelve LeadCard con useDraggable (Tanda 2 · Bloque 3). Aísla el hook de dnd-kit
 * acá: LeadCard sigue siendo presentacional y reusable fuera de un DndContext
 * (p. ej. en el overview). Debe montarse SIEMPRE dentro de un <DndContext>.
 */
export function DraggableLeadCard({
  lead,
  isPending,
  onDelete,
}: DraggableLeadCardProps) {
  const { setNodeRef, attributes, listeners, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  })

  // Tras un drag, suprimir el click que navegaría al detalle (la card navega al click).
  const wasDragged = useRef(false)
  useEffect(() => {
    if (isDragging) {
      wasDragged.current = true
      return
    }
    // Al soltar, limpiar en el siguiente tick: el click "fantasma" llega antes y se anula.
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
    <LeadCard
      lead={lead}
      isPending={isPending}
      onDelete={onDelete}
      dragSetNodeRef={setNodeRef}
      dragAttributes={attributes}
      dragListeners={listeners}
      isDragging={isDragging}
      onClickCapture={handleClickCapture}
      dragStyle={{
        transform: CSS.Translate.toString(transform),
        // El original se oculta mientras el DragOverlay muestra la copia flotante.
        opacity: isDragging ? 0 : undefined,
      }}
    />
  )
}

'use client'

import type { ReactNode } from 'react'
import { Hand } from 'lucide-react'
import {
  PIPELINE_GROUPS,
  type GroupedLeads,
  type LeadPipelineLead,
  type PipelineStatus,
} from './lead-pipeline.shared'
import { DroppableColumn } from './droppable-column'

// === TUNABLES (calibrá por ojo) ===
const COLUMN_BODY_MAX_H = 460 // alto fijo del cuerpo de cada columna (px) — sin scroll interno

type PipelineBoardProps = {
  groupedLeads: GroupedLeads
  onOpenOverview: (status: PipelineStatus) => void
  /** Render de cada card (draggable). Lo provee el padre para compartirlo con el overview. */
  renderCard: (lead: LeadPipelineLead) => ReactNode
}

/**
 * Tablero del pipeline: grilla ESTÁTICA 3+3+2 (PIPELINE_GROUPS), columnas fluidas
 * (sin ancho fijo → sin scroll horizontal a ningún ancho). Cada columna es droppable y
 * muestra como mucho ~3 cards (el resto en el overview); no scrollea adentro. Las cards
 * son draggables; el DnD entre columnas (mouse + teclado) lo maneja el DndContext del
 * padre. Mismo layout para todos: la grilla ya es estática, sin rama de reduced-motion.
 */
export function PipelineBoard({ groupedLeads, onOpenOverview, renderCard }: PipelineBoardProps) {
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <Hand className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        Mantené apretada una card para moverla de estado
      </p>

      {PIPELINE_GROUPS.map((group) => (
        <div
          key={group.id}
          className={
            group.statuses.length >= 3
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid grid-cols-1 gap-4 sm:grid-cols-2'
          }
        >
          {group.statuses.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              leads={groupedLeads[status]}
              bodyMaxHeight={COLUMN_BODY_MAX_H}
              onOpenOverview={onOpenOverview}
              renderCard={renderCard}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

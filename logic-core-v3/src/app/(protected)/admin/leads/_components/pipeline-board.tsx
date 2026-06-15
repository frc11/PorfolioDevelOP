'use client'

import type { ReactNode } from 'react'
import {
  PIPELINE_GROUPS,
  type GroupedLeads,
  type LeadPipelineLead,
  type PipelineStatus,
} from './lead-pipeline.shared'
import { DroppableColumn } from './droppable-column'
import { DraggableLeadCard } from './draggable-lead-card'

// === TUNABLES (calibrá por ojo) ===
const COLUMN_BODY_MAX_H = 460 // alto máx del cuerpo de cada columna (~3 cards) antes de scroll interno

type PipelineBoardProps = {
  groupedLeads: GroupedLeads
  pendingLeadId: string | null
  onMoveStatus: (lead: LeadPipelineLead, status: PipelineStatus) => void
  onDelete: (lead: LeadPipelineLead) => void
  onOpenOverview: (status: PipelineStatus) => void
}

/**
 * Tablero del pipeline: grilla ESTÁTICA 3+3+2 (PIPELINE_GROUPS), columnas fluidas
 * (sin ancho fijo → sin scroll horizontal a ningún ancho). Cada columna es droppable
 * y scrollea adentro a partir de ~3 cards. Las cards son draggables; el DnD entre
 * columnas (mouse + teclado) lo maneja el DndContext del padre. Mismo layout para
 * todos: la grilla ya es estática, no hace falta rama de reduced-motion.
 */
export function PipelineBoard({
  groupedLeads,
  pendingLeadId,
  onMoveStatus,
  onDelete,
  onOpenOverview,
}: PipelineBoardProps) {
  const renderCard = (lead: LeadPipelineLead): ReactNode => (
    <DraggableLeadCard
      key={lead.id}
      lead={lead}
      isPending={pendingLeadId === lead.id}
      onMoveStatus={onMoveStatus}
      onDelete={onDelete}
    />
  )

  return (
    <div className="space-y-4">
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
              pendingLeadId={pendingLeadId}
              bodyMaxHeight={COLUMN_BODY_MAX_H}
              onMoveStatus={onMoveStatus}
              onDelete={onDelete}
              onOpenOverview={onOpenOverview}
              renderCard={renderCard}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

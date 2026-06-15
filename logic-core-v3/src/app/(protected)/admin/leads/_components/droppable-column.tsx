'use client'

import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { PipelineColumn } from './pipeline-column'
import type { LeadPipelineLead, PipelineStatus } from './lead-pipeline.shared'

type DroppableColumnProps = {
  status: PipelineStatus
  leads: LeadPipelineLead[]
  bodyMaxHeight: number
  onOpenOverview?: (status: PipelineStatus) => void
  renderCard: (lead: LeadPipelineLead) => ReactNode
}

/**
 * Columna como drop target de dnd-kit (Tanda 2 · Bloque 3). Aísla useDroppable para
 * que PipelineColumn siga siendo presentacional. El id del droppable es el status,
 * que onDragEnd lee directo para mover el lead.
 */
export function DroppableColumn(props: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: props.status })
  return <PipelineColumn {...props} dropRef={setNodeRef} isOver={isOver} />
}

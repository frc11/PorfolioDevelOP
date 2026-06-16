'use client'

import { useCallback, useState, useTransition } from 'react'
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
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { useIsClient } from '@/lib/use-is-client'
import { deleteLead, updateLeadStatus } from '../_actions/lead.actions'
import {
  ALL_PIPELINE_STATUSES,
  type GroupedLeads,
  type LeadPipelineLead,
  type PipelineStatus,
} from './lead-pipeline.shared'
import { LeadCard } from './lead-card'
import { DraggableLeadCard } from './draggable-lead-card'
import { PipelineBoard } from './pipeline-board'
import { ColumnOverview } from './column-overview'

// === TUNABLES (calibrá por ojo) ===
const POSTPONE_DAYS = 7 // a cuántos días se reactiva un lead postergado
// Drag por HOLD (no por distancia): un swipe rápido scrollea el overview y mantener
// apretado ~DRAG_HOLD_DELAY ms levanta la card. tolerance = px tolerados durante el hold.
const DRAG_HOLD_DELAY = 200
const DRAG_HOLD_TOLERANCE = 5

type LeadPipelineProps = {
  groupedLeads: GroupedLeads
}

function cloneGroups(groups: GroupedLeads): GroupedLeads {
  return {
    PROSPECTO: [...groups.PROSPECTO],
    DEMO_ENVIADA: [...groups.DEMO_ENVIADA],
    VIO_VIDEO: [...groups.VIO_VIDEO],
    RESPONDIO: [...groups.RESPONDIO],
    CALL_AGENDADA: [...groups.CALL_AGENDADA],
    CERRADO: [...groups.CERRADO],
    PERDIDO: [...groups.PERDIDO],
    POSTERGADO: [...groups.POSTERGADO],
  }
}

function moveLead(
  groups: GroupedLeads,
  lead: LeadPipelineLead,
  nextStatus: PipelineStatus,
): GroupedLeads {
  const nextGroups = cloneGroups(groups)

  for (const status of ALL_PIPELINE_STATUSES) {
    nextGroups[status] = nextGroups[status].filter((item) => item.id !== lead.id)
  }

  nextGroups[nextStatus] = [{ ...lead, status: nextStatus }, ...nextGroups[nextStatus]]
  return nextGroups
}

function removeLead(groups: GroupedLeads, leadId: string): GroupedLeads {
  const nextGroups = cloneGroups(groups)

  for (const status of ALL_PIPELINE_STATUSES) {
    nextGroups[status] = nextGroups[status].filter((item) => item.id !== leadId)
  }

  return nextGroups
}

export function LeadPipeline({ groupedLeads }: LeadPipelineProps) {
  const router = useRouter()
  const reduced = useReducedMotion()
  const isClient = useIsClient()

  const [error, setError] = useState<string | null>(null)
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null)
  const [overviewStatus, setOverviewStatus] = useState<PipelineStatus | null>(null)
  const [activeDragLead, setActiveDragLead] = useState<LeadPipelineLead | null>(null)
  const [, startTransition] = useTransition()

  // Sync optimista ↔ props del server con el patrón "reset state on prop change"
  // EN RENDER (no en effect), para no disparar react-hooks/set-state-in-effect.
  const [syncedFrom, setSyncedFrom] = useState(groupedLeads)
  const [localGroupedLeads, setLocalGroupedLeads] = useState<GroupedLeads>(() =>
    cloneGroups(groupedLeads),
  )
  if (syncedFrom !== groupedLeads) {
    setSyncedFrom(groupedLeads)
    setLocalGroupedLeads(cloneGroups(groupedLeads))
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: DRAG_HOLD_DELAY, tolerance: DRAG_HOLD_TOLERANCE },
    }),
    useSensor(KeyboardSensor, {
      // Space levanta/suelta; Enter queda libre para navegar al detalle (DnD por teclado).
      // Sin coordinateGetter custom: usamos el default de dnd-kit (paso fijo por flechas +
      // collision detection) — el de @dnd-kit/sortable NO traversa entre columnas porque la
      // card es un draggable plano, no un sortable registrado como droppable.
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  )

  const handleMoveStatus = (lead: LeadPipelineLead, status: PipelineStatus) => {
    const previousGroups = cloneGroups(localGroupedLeads)
    setError(null)
    setPendingLeadId(lead.id)
    setLocalGroupedLeads((current) => moveLead(current, lead, status))

    startTransition(async () => {
      const result = await updateLeadStatus({
        leadId: lead.id,
        status,
        reactivateAt:
          status === 'POSTERGADO'
            ? new Date(Date.now() + POSTPONE_DAYS * 24 * 60 * 60 * 1000)
            : undefined,
      })

      if (!result.success) {
        setLocalGroupedLeads(previousGroups)
        setError(result.error)
        setPendingLeadId(null)
        return
      }

      setPendingLeadId(null)
      router.refresh()
    })
  }

  const handleDelete = (lead: LeadPipelineLead) => {
    const previousGroups = cloneGroups(localGroupedLeads)
    setError(null)
    setPendingLeadId(lead.id)
    setLocalGroupedLeads((current) => removeLead(current, lead.id))

    startTransition(async () => {
      const result = await deleteLead(lead.id)

      if (!result.success) {
        setLocalGroupedLeads(previousGroups)
        setError(result.error)
        setPendingLeadId(null)
        return
      }

      setPendingLeadId(null)
      router.refresh()
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const lead = event.active.data.current?.lead as LeadPipelineLead | undefined
    setActiveDragLead(lead ?? null)
    // Si el drag arrancó desde el overview, cerralo: revela el board 3+3+2 (columnas
    // droppables). El DragOverlay + nodo cacheado mantienen la card en arrastre.
    setOverviewStatus(null)
  }

  // Cards draggables. El overview usa un dragId propio (prefijo) para no colisionar con
  // las del board cuando el lead también está entre los visibles de su columna.
  const renderBoardCard = (lead: LeadPipelineLead) => (
    <DraggableLeadCard
      key={lead.id}
      lead={lead}
      isPending={pendingLeadId === lead.id}
      onDelete={handleDelete}
    />
  )
  const renderOverviewCard = (lead: LeadPipelineLead) => (
    <DraggableLeadCard
      key={lead.id}
      lead={lead}
      dragId={`overview-${lead.id}`}
      isPending={pendingLeadId === lead.id}
      onDelete={handleDelete}
    />
  )

  const handleDragEnd = (event: DragEndEvent) => {
    // Usar el lead capturado en estado al iniciar el drag, NO event.active.data: cuando el
    // drag viene del overview, la card fuente se desmonta al cerrarse el overview y dnd-kit
    // deja active.data vacío (nodo borrado del registro) → el drop se perdía en silencio.
    const lead = activeDragLead
    setActiveDragLead(null)
    const { over } = event
    if (!over || !lead) {
      return
    }
    // El droppable id es un status sólo si matchea ALL_PIPELINE_STATUSES (sin cast).
    const targetStatus = ALL_PIPELINE_STATUSES.find((status) => status === over.id)
    // Mover sólo si cambia de columna. Misma columna = no-op (no hay orden persistente).
    if (targetStatus && lead.status !== targetStatus) {
      handleMoveStatus(lead, targetStatus)
    }
  }

  const handleDragCancel = () => {
    setActiveDragLead(null)
  }

  const handleCloseOverview = useCallback(() => setOverviewStatus(null), [])

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <PipelineBoard
          groupedLeads={localGroupedLeads}
          onOpenOverview={setOverviewStatus}
          renderCard={renderBoardCard}
        />

        {/* Dentro del MISMO DndContext que el board → las cards del overview son
            draggables y, al iniciar el drag, el overview se cierra (handleDragStart). */}
        <ColumnOverview
          status={overviewStatus}
          leads={overviewStatus ? localGroupedLeads[overviewStatus] : []}
          renderCard={renderOverviewCard}
          onClose={handleCloseOverview}
        />

        {isClient
          ? createPortal(
              <DragOverlay dropAnimation={reduced ? null : undefined}>
                {activeDragLead ? (
                  <LeadCard
                    lead={activeDragLead}
                    isPending={false}
                    onDelete={handleDelete}
                    presentational
                  />
                ) : null}
              </DragOverlay>,
              document.body,
            )
          : null}
      </DndContext>
    </div>
  )
}

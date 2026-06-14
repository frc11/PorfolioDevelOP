'use client'

import { useRef, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  ALL_PIPELINE_STATUSES,
  PIPELINE_GROUPS,
  type GroupedLeads,
  type LeadPipelineLead,
  type PipelineStatus,
} from './lead-pipeline.shared'
import { PipelineColumn } from './pipeline-column'
import { DroppableColumn } from './droppable-column'
import { DraggableLeadCard } from './draggable-lead-card'
import { useScrollFade } from './use-scroll-fade'

// === TUNABLES (calibrá por ojo) ===
const STAGE_HEIGHT = 600 // alto visible del módulo, en px (compacto, no crece)
const SCROLL_TRACK_HEIGHT = 2200 // alto del track interno que genera el recorrido de scroll
const COLUMN_BODY_MAX_H = 460 // alto máx del cuerpo de cada columna (~3 cards) antes de scroll interno
const FADE_BAND = 0.16 // ancho del solape de cross-fade, como fracción del progreso 0..1
const REVEAL_SHIFT = 18 // translateY (px) del grupo que entra/sale durante el cross-fade
const COLUMN_WIDTH = 320 // ancho fijo (px) de cada columna en la grilla plana del modo arrastre

type PipelineBoardProps = {
  groupedLeads: GroupedLeads
  pendingLeadId: string | null
  reduced: boolean
  /** Hay un drag en curso → mostrar la grilla plana de drop targets (Bloque 3). */
  dragging: boolean
  onMoveStatus: (lead: LeadPipelineLead, status: PipelineStatus) => void
  onDelete: (lead: LeadPipelineLead) => void
  onOpenOverview: (status: PipelineStatus) => void
}

/**
 * El tablero del pipeline (Tanda 2). Decide entre tres layouts:
 *  - reduced-motion → 3 grupos apilados, columnas droppables, sin coreografía.
 *  - arrastrando    → grilla plana de las 8 columnas como drop targets.
 *  - default        → módulo de alto fijo con cross-fade dirigido por scroll.
 * Las cards son siempre draggables (DraggableLeadCard). Debe vivir dentro de un
 * <DndContext> (lo provee LeadPipeline).
 */
export function PipelineBoard({
  groupedLeads,
  pendingLeadId,
  reduced,
  dragging,
  onMoveStatus,
  onDelete,
  onOpenOverview,
}: PipelineBoardProps) {
  const moduleRef = useRef<HTMLDivElement>(null)
  const fade = useScrollFade(moduleRef, FADE_BAND, REVEAL_SHIFT)

  const renderCard = (lead: LeadPipelineLead): ReactNode => (
    <DraggableLeadCard
      key={lead.id}
      lead={lead}
      isPending={pendingLeadId === lead.id}
      onMoveStatus={onMoveStatus}
      onDelete={onDelete}
    />
  )

  const scrollToGroup = (index: number) => {
    const el = moduleRef.current
    if (!el) {
      return
    }
    const maxScroll = el.scrollHeight - el.clientHeight
    el.scrollTo({ top: (index / (PIPELINE_GROUPS.length - 1)) * maxScroll, behavior: 'smooth' })
  }

  // --- prefers-reduced-motion: 3 grupos apilados, columnas droppables, sin coreografía. ---
  if (reduced) {
    return (
      <div className="space-y-6">
        {PIPELINE_GROUPS.map((group) => (
          <div key={group.id} className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{group.label}</p>
            <div className="flex gap-4">
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
          </div>
        ))}
      </div>
    )
  }

  // --- Modo arrastre: grilla plana de las 8 columnas como drop targets, scrolleable. ---
  if (dragging) {
    return (
      <div className="overflow-x-auto pb-2" style={{ height: STAGE_HEIGHT }}>
        <div className="flex h-full min-w-max gap-4">
          {ALL_PIPELINE_STATUSES.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              leads={groupedLeads[status]}
              pendingLeadId={pendingLeadId}
              bodyMaxHeight={COLUMN_BODY_MAX_H}
              width={COLUMN_WIDTH}
              onMoveStatus={onMoveStatus}
              onDelete={onDelete}
              onOpenOverview={onOpenOverview}
              renderCard={renderCard}
            />
          ))}
        </div>
      </div>
    )
  }

  // --- Default: módulo self-contained de alto fijo con cross-fade dirigido por scroll. ---
  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Grupos del pipeline"
      >
        {PIPELINE_GROUPS.map((group, index) => {
          const isActive = fade.activeIndex === index
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => scrollToGroup(index)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                  : 'border-white/10 bg-black/20 text-zinc-400 hover:text-zinc-200',
              )}
            >
              {group.label}
            </button>
          )
        })}
      </div>

      <div
        ref={moduleRef}
        className="relative overflow-y-auto rounded-[28px] border border-white/10 bg-white/[0.02]"
        style={{ height: STAGE_HEIGHT }}
      >
        <div className="relative" style={{ height: SCROLL_TRACK_HEIGHT }}>
          <div className="sticky top-0" style={{ height: STAGE_HEIGHT }}>
            {PIPELINE_GROUPS.map((group, index) => {
              const isActive = fade.activeIndex === index
              return (
                <motion.div
                  key={group.id}
                  aria-hidden={!isActive}
                  inert={!isActive}
                  style={{
                    opacity: fade.groups[index].opacity,
                    y: fade.groups[index].y,
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                  className="absolute inset-3 flex gap-4"
                >
                  {group.statuses.map((status) => (
                    <PipelineColumn
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
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

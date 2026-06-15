'use client'

import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  STATUS_LABELS,
  statusTone,
  type LeadPipelineLead,
  type PipelineStatus,
} from './lead-pipeline.shared'

// === TUNABLES (calibrá por ojo) ===
const COLUMN_FADE_HEIGHT = 48 // alto del desvanecimiento inferior del cuerpo (px)

// El cuerpo NO scrollea (la rueda siempre scrollea la página); muestra ~3 cards y la
// última se desvanece con mask-image. Para ver todos los leads → overview (click header).
const COLUMN_BODY_FADE = `linear-gradient(to bottom, #000 calc(100% - ${COLUMN_FADE_HEIGHT}px), transparent)`

type PipelineColumnProps = {
  status: PipelineStatus
  leads: LeadPipelineLead[]
  /** Alto fijo del cuerpo (px) — sin scroll interno. TUNABLE provisto por el padre. */
  bodyMaxHeight: number
  /** Click en el header → abre la vista fullscreen de la columna. */
  onOpenOverview?: (status: PipelineStatus) => void
  /** Render de cada card (inyecta la versión draggable desde el board). */
  renderCard: (lead: LeadPipelineLead) => ReactNode
  /** Ref del droppable de dnd-kit. Sin él, la columna no es drop target. */
  dropRef?: (element: HTMLElement | null) => void
  /** La card arrastrada está sobre esta columna → highlight. */
  isOver?: boolean
}

/**
 * Columna presentacional del pipeline: header (tono + label + count) + cuerpo con
 * scroll interno. Fluida (llena su celda de la grilla). No conoce el DnD; el padre
 * lo compone alrededor.
 */
export function PipelineColumn({
  status,
  leads,
  bodyMaxHeight,
  onOpenOverview,
  renderCard,
  dropRef,
  isOver = false,
}: PipelineColumnProps) {
  return (
    <section
      ref={dropRef}
      className={cn(
        'flex h-full min-w-0 flex-col rounded-[26px] border bg-white/[0.04] p-4 backdrop-blur-xl transition-colors',
        isOver ? 'border-cyan-400/40 bg-cyan-400/[0.06]' : 'border-white/10',
      )}
    >
      <button
        type="button"
        onClick={() => onOpenOverview?.(status)}
        aria-label={`Ver todos los leads de ${STATUS_LABELS[status]}`}
        className={cn(
          'block w-full rounded-2xl border border-white/10 bg-gradient-to-br px-4 py-3 text-left transition-[filter] hover:brightness-110',
          statusTone(status),
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Pipeline</p>
            <h3 className="mt-1 truncate text-sm font-semibold text-white">
              {STATUS_LABELS[status]}
            </h3>
          </div>

          <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-medium text-white/85">
            {leads.length}
          </div>
        </div>
      </button>

      <div
        // Altura FIJA + overflow-hidden: sin scroll interno → la rueda scrollea la página.
        // px-2/py-1 dan aire para que el hover:scale de la card no se recorte contra el clip.
        className="mt-4 space-y-3 overflow-hidden px-2 py-1"
        style={{
          height: bodyMaxHeight,
          maskImage: COLUMN_BODY_FADE,
          WebkitMaskImage: COLUMN_BODY_FADE,
        }}
      >
        {leads.length > 0 ? (
          leads.map((lead) => renderCard(lead))
        ) : (
          <EmptyState
            icon={Inbox}
            title="Sin leads en esta etapa"
            description="Cuando muevas prospectos por el pipeline van a aparecer aca."
          />
        )}
      </div>
    </section>
  )
}

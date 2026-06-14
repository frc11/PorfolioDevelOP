'use client'

import { Inbox } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'
import { LeadCard } from './lead-card'
import {
  STATUS_LABELS,
  statusTone,
  type LeadPipelineLead,
  type PipelineStatus,
} from './lead-pipeline.shared'

type PipelineColumnProps = {
  status: PipelineStatus
  leads: LeadPipelineLead[]
  pendingLeadId: string | null
  /** Alto máx del cuerpo scrolleable (px). TUNABLE provisto por el padre. */
  bodyMaxHeight: number
  onMoveStatus: (lead: LeadPipelineLead, status: PipelineStatus) => void
  onDelete: (lead: LeadPipelineLead) => void
  /** Click en el header → abre la vista fullscreen de la columna (Bloque 2). */
  onOpenOverview?: (status: PipelineStatus) => void
}

/**
 * Columna presentacional del pipeline: header (tono + label + count) + cuerpo con
 * scroll interno. No conoce ni el fade ni el DnD; el padre los compone alrededor.
 */
export function PipelineColumn({
  status,
  leads,
  pendingLeadId,
  bodyMaxHeight,
  onMoveStatus,
  onDelete,
  onOpenOverview,
}: PipelineColumnProps) {
  return (
    <section className="flex h-full min-w-0 flex-1 flex-col rounded-[26px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
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
        className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1"
        style={{ maxHeight: bodyMaxHeight }}
      >
        {leads.length > 0 ? (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              isPending={pendingLeadId === lead.id}
              onMoveStatus={onMoveStatus}
              onDelete={onDelete}
            />
          ))
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

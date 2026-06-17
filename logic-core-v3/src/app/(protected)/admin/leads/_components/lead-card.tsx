'use client'

import { useMemo, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock3,
  FlaskConical,
  LoaderCircle,
  MapPin,
  Trash2,
  UserRound,
} from 'lucide-react'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import { InlineConfirm } from '@/app/(protected)/admin/_components/inline-confirm'
import { cn } from '@/lib/utils'
import type { LeadPipelineLead } from './lead-pipeline.shared'
import { formatRelativeTime, serviceBadgeTone, serviceLabel } from './lead-card.helpers'

type LeadCardProps = {
  lead: LeadPipelineLead
  isPending?: boolean
  onDelete: (lead: LeadPipelineLead) => void
  // DnD (Bloque 3) — todos opcionales: la card sigue siendo usable sin DnD (overview).
  dragSetNodeRef?: (element: HTMLElement | null) => void
  dragAttributes?: DraggableAttributes
  dragListeners?: DraggableSyntheticListeners
  isDragging?: boolean
  dragStyle?: CSSProperties
  onClickCapture?: (event: ReactMouseEvent<HTMLElement>) => void
  /** Clon no interactivo para el DragOverlay: sin navegación, sin menú, fuera del tab order. */
  presentational?: boolean
}

export function LeadCard({
  lead,
  isPending = false,
  onDelete,
  dragSetNodeRef,
  dragAttributes,
  dragListeners,
  isDragging = false,
  dragStyle,
  onClickCapture,
  presentational = false,
}: LeadCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const isDraggable = Boolean(dragListeners)

  const followUpPending = useMemo(() => {
    if (!lead.nextFollowUpAt) {
      return false
    }

    return new Date(lead.nextFollowUpAt).getTime() <= Date.now()
  }, [lead.nextFollowUpAt])

  return (
    <article
        ref={dragSetNodeRef}
        {...dragAttributes}
        {...dragListeners}
        role="button"
        tabIndex={presentational ? -1 : 0}
        aria-hidden={presentational || undefined}
        style={dragStyle}
        onClickCapture={onClickCapture}
        onClick={presentational ? undefined : () => router.push(`/admin/leads/${lead.id}`)}
        onKeyDown={
          presentational
            ? undefined
            : (event) => {
                // El KeyboardSensor de dnd usa Space para levantar la card; dejamos Enter
                // libre para navegar al detalle (evita doble acción en el mismo evento).
                const dragKeyDown = dragListeners?.onKeyDown as
                  | ((event: ReactKeyboardEvent<HTMLElement>) => void)
                  | undefined
                dragKeyDown?.(event)
                if (event.key === 'Enter') {
                  event.preventDefault()
                  router.push(`/admin/leads/${lead.id}`)
                }
              }
        }
        className={cn(
          'group relative block rounded-[22px] border bg-white/5 p-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.22)]',
          // select-none en cards draggables: el hold/drag no debe seleccionar texto.
          isDraggable && 'select-none',
          isDragging ? 'cursor-grabbing border-cyan-400/30' : 'border-white/10',
          // Hover marcado (scale-up leve) SOLO en cards reales: ni el clon del DragOverlay
          // (presentational) ni la card que se arrastra (isDragging) escalan, para no pelear
          // con el transform de @dnd-kit. reduced-motion: sin escala.
          !presentational &&
            !isDragging &&
            'transition-all hover:scale-[1.02] hover:border-cyan-400/20 hover:bg-white/[0.07] motion-reduce:hover:scale-100',
          !presentational && !isDragging && isDraggable && 'cursor-grab',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate text-base font-semibold text-white">{lead.businessName}</h4>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              {lead.industry ? <span>{lead.industry}</span> : null}
              {lead.zone ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {lead.zone}
                </span>
              ) : null}
            </div>
          </div>

          {presentational ? null : (
            <button
              type="button"
              disabled={isPending}
              aria-label="Eliminar lead"
              onClick={(event) => {
                event.stopPropagation()
                setShowDeleteDialog(true)
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-400 transition-colors hover:border-rose-400/30 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={[
              'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
              serviceBadgeTone(lead.serviceType),
            ].join(' ')}
          >
            {serviceLabel(lead.serviceType)}
          </span>

          {followUpPending ? (
            <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-200">
              Follow-up pendiente
            </span>
          ) : null}

          {lead.assignedToName ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
              <UserRound className="h-3 w-3" />
              {lead.assignedToName}
            </span>
          ) : null}
        </div>

        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          {lead.contactName ? (
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-zinc-500" />
              <span className="truncate">{lead.contactName}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-zinc-400">
            <Clock3 className="h-4 w-4 text-zinc-500" />
            <span>{formatRelativeTime(lead.lastActivityAt)}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <FlaskConical className="h-4 w-4 text-zinc-500" />
            <span>{lead._count.demos} demos enviadas</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-zinc-500">
          <span>{lead._count.activities} actividades</span>
          <span className="text-zinc-400">Abrir detalle</span>
        </div>

        {presentational ? null : (
          <InlineConfirm
            open={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={() => {
              setShowDeleteDialog(false)
              onDelete(lead)
            }}
            title="Eliminar lead"
            description={`Se eliminará "${lead.businessName}" junto con sus actividades y demos.`}
            confirmLabel="Eliminar lead"
            isPending={isPending}
          />
        )}
      </article>
  )
}

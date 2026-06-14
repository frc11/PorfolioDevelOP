'use client'

import { useMemo, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock3,
  FlaskConical,
  LoaderCircle,
  MapPin,
  MoreHorizontal,
  Trash2,
  UserRound,
} from 'lucide-react'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import { ConfirmDialog } from '@/app/(protected)/admin/_components/confirm-dialog'
import { cn } from '@/lib/utils'
import type { LeadPipelineLead, PipelineStatus } from './lead-pipeline.shared'
import {
  MOVE_STATUS_OPTIONS,
  formatRelativeTime,
  serviceBadgeTone,
  serviceLabel,
} from './lead-card.helpers'

type LeadCardProps = {
  lead: LeadPipelineLead
  isPending?: boolean
  onMoveStatus: (lead: LeadPipelineLead, status: PipelineStatus) => void
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
  onMoveStatus,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const isDraggable = Boolean(dragListeners)

  const followUpPending = useMemo(() => {
    if (!lead.nextFollowUpAt) {
      return false
    }

    return new Date(lead.nextFollowUpAt).getTime() <= Date.now()
  }, [lead.nextFollowUpAt])

  return (
    <>
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
          // Sin transition mientras se arrastra: el transform debe seguir al puntero 1:1.
          isDragging
            ? 'cursor-grabbing border-cyan-400/30'
            : cn(
                'border-white/10 transition-all hover:border-cyan-400/20 hover:bg-white/[0.07]',
                isDraggable && 'cursor-grab',
              ),
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
          <div className="relative">
            <button
              type="button"
              disabled={isPending}
              aria-label="Acciones del lead"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onClick={(event) => {
                event.stopPropagation()
                setIsMenuOpen((current) => !current)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </button>

            {isMenuOpen ? (
              <div
                className="absolute right-0 top-11 z-20 w-56 rounded-2xl border border-white/10 bg-[#11161d]/95 p-2 shadow-2xl backdrop-blur-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="px-2 pb-2 pt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Mover a estado
                </p>

                <div className="space-y-1">
                  {MOVE_STATUS_OPTIONS.filter((option) => option.status !== lead.status).map(
                    (option) => (
                      <button
                        key={option.status}
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          setIsMenuOpen(false)
                          onMoveStatus(lead, option.status)
                        }}
                        className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {option.label}
                      </button>
                    )
                  )}
                </div>

                <div className="my-2 h-px bg-white/10" />

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setIsMenuOpen(false)
                    setShowDeleteDialog(true)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-300 transition-colors hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            ) : null}
          </div>
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
      </article>

      {presentational ? null : (
        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => {
            setShowDeleteDialog(false)
            onDelete(lead)
          }}
          title="Eliminar lead"
          description={`Se eliminara "${lead.businessName}" junto con sus actividades y demos.`}
          confirmLabel="Eliminar lead"
          variant="danger"
          isPending={isPending}
        />
      )}
    </>
  )
}

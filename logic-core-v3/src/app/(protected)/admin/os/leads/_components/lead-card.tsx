'use client'

import { useMemo, useState } from 'react'
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
import { ConfirmDialog } from '@/app/(protected)/admin/os/_components/confirm-dialog'
import type {
  LeadPipelineLead,
  PipelineServiceType,
  PipelineStatus,
} from './lead-pipeline.shared'

type LeadCardProps = {
  lead: LeadPipelineLead
  isPending?: boolean
  onMoveStatus: (lead: LeadPipelineLead, status: PipelineStatus) => void
  onDelete: (lead: LeadPipelineLead) => void
}

const MOVE_STATUS_OPTIONS: Array<{ label: string; status: PipelineStatus }> = [
  { label: 'Prospecto', status: 'PROSPECTO' },
  { label: 'Demo enviada', status: 'DEMO_ENVIADA' },
  { label: 'Vio video', status: 'VIO_VIDEO' },
  { label: 'Respondio', status: 'RESPONDIO' },
  { label: 'Call agendada', status: 'CALL_AGENDADA' },
  { label: 'Cerrado', status: 'CERRADO' },
  { label: 'Perdido', status: 'PERDIDO' },
  { label: 'Postergado', status: 'POSTERGADO' },
]

function formatRelativeTime(value: string | null): string {
  if (!value) {
    return 'Sin actividad'
  }

  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return 'Hace instantes'
  }

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute))
    return `Hace ${minutes} min`
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour)
    return `Hace ${hours} h`
  }

  const days = Math.floor(diffMs / day)
  return `Hace ${days} d`
}

function serviceBadgeTone(serviceType: PipelineServiceType | null): string {
  switch (serviceType) {
    case 'WEB':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'AI_AGENT':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    case 'AUTOMATION':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'CUSTOM_SOFTWARE':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
    default:
      return 'border-white/10 bg-white/5 text-zinc-300'
  }
}

function serviceLabel(serviceType: PipelineServiceType | null): string {
  switch (serviceType) {
    case 'WEB':
      return 'Web'
    case 'AI_AGENT':
      return 'AI Agent'
    case 'AUTOMATION':
      return 'Automation'
    case 'CUSTOM_SOFTWARE':
      return 'Custom Software'
    default:
      return 'Sin servicio'
  }
}

export function LeadCard({
  lead,
  isPending = false,
  onMoveStatus,
  onDelete,
}: LeadCardProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const followUpPending = useMemo(() => {
    if (!lead.nextFollowUpAt) {
      return false
    }

    return new Date(lead.nextFollowUpAt).getTime() <= Date.now()
  }, [lead.nextFollowUpAt])

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/admin/os/leads/${lead.id}`)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            router.push(`/admin/os/leads/${lead.id}`)
          }
        }}
        className="group relative rounded-[22px] border border-white/10 bg-white/5 p-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-all hover:border-cyan-400/20 hover:bg-white/[0.07]"
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

          <div className="relative">
            <button
              type="button"
              disabled={isPending}
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
    </>
  )
}

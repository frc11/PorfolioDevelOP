'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { deleteLead, updateLeadStatus } from '../_actions/lead.actions'
import {
  ALL_PIPELINE_STATUSES,
  PIPELINE_GROUPS,
  type GroupedLeads,
  type LeadPipelineLead,
  type PipelineStatus,
} from './lead-pipeline.shared'
import { PipelineColumn } from './pipeline-column'
import { useScrollFade } from './use-scroll-fade'

// === TUNABLES (calibrá por ojo) ===
const STAGE_HEIGHT = 600 // alto visible del módulo, en px (compacto, no crece)
const SCROLL_TRACK_HEIGHT = 2200 // alto del track interno que genera el recorrido de scroll
const COLUMN_BODY_MAX_H = 460 // alto máx del cuerpo de cada columna (~3 cards) antes de scroll interno
const FADE_BAND = 0.16 // ancho del solape de cross-fade, como fracción del progreso 0..1
const REVEAL_SHIFT = 18 // translateY (px) del grupo que entra/sale durante el cross-fade
// Nota: REVEAL_DURATION/easing NO aplican acá — el cross-fade es lineal-dirigido-por-scroll
// (sin duración). Esos tunables viven en el overlay discreto del Bloque 2.

const POSTPONE_DAYS = 7 // a cuántos días se reactiva un lead postergado

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
  const moduleRef = useRef<HTMLDivElement>(null)
  const fade = useScrollFade(moduleRef, FADE_BAND, REVEAL_SHIFT)

  const [error, setError] = useState<string | null>(null)
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null)
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

  const scrollToGroup = (index: number) => {
    const el = moduleRef.current
    if (!el) {
      return
    }
    const maxScroll = el.scrollHeight - el.clientHeight
    const target = (index / (PIPELINE_GROUPS.length - 1)) * maxScroll
    el.scrollTo({ top: target, behavior: 'smooth' })
  }

  const errorBanner = error ? (
    <div
      role="alert"
      className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
    >
      {error}
    </div>
  ) : null

  // --- Rama prefers-reduced-motion: sin coreografía. Los 3 grupos apilados,
  //     cada columna con su scroll interno. Sin sticky / useScroll / opacity. ---
  if (reduced) {
    return (
      <div className="space-y-5">
        {errorBanner}
        <div className="space-y-6">
          {PIPELINE_GROUPS.map((group) => (
            <div key={group.id} className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{group.label}</p>
              <div className="flex gap-4">
                {group.statuses.map((status) => (
                  <PipelineColumn
                    key={status}
                    status={status}
                    leads={localGroupedLeads[status]}
                    pendingLeadId={pendingLeadId}
                    bodyMaxHeight={COLUMN_BODY_MAX_H}
                    onMoveStatus={handleMoveStatus}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- Rama animada: módulo self-contained de alto fijo con scroll propio.
  //     Track alto + stage sticky con los 3 grupos superpuestos en cross-fade. ---
  return (
    <div className="space-y-4">
      {errorBanner}

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
                      leads={localGroupedLeads[status]}
                      pendingLeadId={pendingLeadId}
                      bodyMaxHeight={COLUMN_BODY_MAX_H}
                      onMoveStatus={handleMoveStatus}
                      onDelete={handleDelete}
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

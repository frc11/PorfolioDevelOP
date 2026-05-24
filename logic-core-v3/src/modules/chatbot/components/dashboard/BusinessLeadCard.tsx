'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Phone, Mail, MessageSquare, Clock, Flame, TrendingUp, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { updateLeadStatus } from '@/modules/chatbot/server/admin/updateLeadStatus'
import type { ChatbotLead, ChatbotLeadStatus } from '@prisma/client'
import type { LucideIcon } from 'lucide-react'

const STATUS_BADGE: Record<ChatbotLeadStatus, { variant: 'default' | 'warning' | 'success' | 'info' | 'danger' | 'brand'; label: string }> = {
  NEW: { variant: 'warning', label: 'Sin contactar' },
  CONTACTED: { variant: 'info', label: 'Contactado' },
  IN_NEGOTIATION: { variant: 'brand', label: 'En negociación' },
  WON: { variant: 'success', label: 'Cliente' },
  LOST: { variant: 'default', label: 'Perdido' },
}

type EffectiveClassification = 'hot' | 'warm' | 'cold'

const SCORE_CONFIG: Record<EffectiveClassification, { icon: LucideIcon; label: string; className: string }> = {
  hot:  { icon: Flame,      label: 'Caliente', className: 'border-rose-500/30 bg-rose-500/15 text-rose-300' },
  warm: { icon: TrendingUp, label: 'Tibio',    className: 'border-amber-500/30 bg-amber-500/15 text-amber-300' },
  cold: { icon: Minus,      label: 'Frío',     className: 'border-sky-500/30 bg-sky-500/15 text-sky-400' },
}

const INTENT_LABELS: Record<string, string> = {
  quote: 'Pedido de cotización',
  info: 'Consulta de información',
  demo: 'Solicitud de demo',
  support: 'Soporte',
  other: 'Consulta general',
  unknown: 'Consulta general',
}

interface BusinessLeadCardProps {
  lead: ChatbotLead
  effectiveScore?: number | null
  effectiveClassification?: EffectiveClassification | null
  decayTierLabel?: string | null
  /** B5.7 — anillo rose pulsante para destacar hot+NEW sin agregar canal nuevo. */
  highlight?: boolean
  href?: string
}

export function BusinessLeadCard({ lead, effectiveScore, effectiveClassification, decayTierLabel, highlight = false, href }: BusinessLeadCardProps) {
  const [isPending, startTransition] = useTransition()
  const [localStatus, setLocalStatus] = useState<ChatbotLeadStatus>(lead.status)
  const timeAgo = formatTimeAgo(lead.capturedAt)
  const statusMeta = STATUS_BADGE[localStatus]
  const intentLabel = INTENT_LABELS[lead.intent ?? 'unknown'] ?? 'Consulta'
  const scoreCfg = effectiveClassification ? SCORE_CONFIG[effectiveClassification] : null

  function handleMarkContacted() {
    startTransition(async () => {
      await updateLeadStatus({ leadId: lead.id, status: 'CONTACTED' })
      setLocalStatus('CONTACTED')
    })
  }

  function handleMarkConverted() {
    startTransition(async () => {
      await updateLeadStatus({ leadId: lead.id, status: 'WON' })
      setLocalStatus('WON')
    })
  }

  // Bloque de info (header + intent + contactos). Si hay href, todo el bloque navega
  // al detalle; los <a tel:>/<a mailto:> internos hacen stopPropagation para no
  // disparar la navegación del wrapper.
  const infoBlock = (
    <>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-zinc-100">
            {lead.name ?? 'Sin nombre'}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            Hace {timeAgo}
            {decayTierLabel && (
              <span className="text-zinc-600"> · {decayTierLabel}</span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          {scoreCfg && effectiveScore != null && (
            <span
              className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium ${scoreCfg.className}`}
              aria-label={`Nivel de interés: ${effectiveScore} de 100 — ${scoreCfg.label}`}
            >
              <scoreCfg.icon className="h-3 w-3" strokeWidth={1.5} />
              {effectiveScore} · {scoreCfg.label}
            </span>
          )}
        </div>
      </div>

      {/* Intent */}
      {lead.intent && lead.intent !== 'unknown' && (
        <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Qué quiere
          </p>
          <p className="text-sm text-zinc-300">{intentLabel}</p>
        </div>
      )}

      {/* Contacto */}
      <div className="mb-4 space-y-2">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{lead.phone}</span>
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{lead.email}</span>
          </a>
        )}
      </div>
    </>
  )

  return (
    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }} className="relative">
      {highlight && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl ring-2 ring-rose-500/60 shadow-[0_0_24px_rgba(244,63,94,0.18)] animate-pulse"
        />
      )}
      <Card variant={href ? 'interactive' : 'default'} padding="lg">
        {href ? (
          <Link href={href} className="block cursor-pointer">
            {infoBlock}
          </Link>
        ) : (
          infoBlock
        )}

        {/* Acciones — fuera del Link para que los buttons no naveguen */}
        <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
          {lead.phone && (
            <a
              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-400/20"
            >
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
              WhatsApp
            </a>
          )}
          {localStatus === 'NEW' && (
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={handleMarkContacted}
            >
              Marcar contactado
            </Button>
          )}
          {localStatus !== 'WON' && localStatus !== 'LOST' && (
            <Button size="sm" disabled={isPending} onClick={handleMarkConverted}>
              ✓ Es cliente
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function formatTimeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'un momento'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} días`
  return `${Math.floor(days / 7)} semanas`
}

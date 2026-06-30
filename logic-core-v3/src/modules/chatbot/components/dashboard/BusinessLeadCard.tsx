'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Phone, Mail, MessageSquare, Clock, Flame, TrendingUp, Minus, Ban } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { LeadStatusActions } from './LeadStatusActions'
import { intentLabel } from '@/modules/chatbot/lead-intent-labels'
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

// Config del bloque-protagonista: icon grande, texto XL, y un sub-label corto
// que orienta al dueño ("listo para llamar"). El número 0-100 va aparte, chico.
const SCORE_CONFIG: Record<EffectiveClassification, {
  icon: LucideIcon
  label: string
  sublabel: string
  containerClass: string
  iconClass: string
  textClass: string
}> = {
  hot: {
    icon: Flame,
    label: 'Caliente',
    sublabel: 'Listo para llamar',
    containerClass: 'border-rose-500/30 bg-rose-500/10',
    iconClass: 'text-rose-400',
    textClass: 'text-rose-200',
  },
  warm: {
    icon: TrendingUp,
    label: 'Tibio',
    sublabel: 'Necesita un empujón',
    containerClass: 'border-amber-500/30 bg-amber-500/10',
    iconClass: 'text-amber-400',
    textClass: 'text-amber-200',
  },
  cold: {
    icon: Minus,
    label: 'Frío',
    sublabel: 'Baja prioridad',
    containerClass: 'border-sky-500/30 bg-sky-500/10',
    iconClass: 'text-sky-400',
    textClass: 'text-sky-200',
  },
}

// Etiquetas de intención: mapa compartido (lead-intent-labels), keys alineadas
// al enum real. Ver P1-fix.

interface BusinessLeadCardProps {
  lead: ChatbotLead
  effectiveScore?: number | null
  effectiveClassification?: EffectiveClassification | null
  decayTierLabel?: string | null
  /** Anillo rose pulsante para destacar hot+NEW sin abrir canal nuevo. */
  highlight?: boolean
  /** B5.7 v2: el lead apareció en el último tick del polling — mostrar chip "Nuevo" durante 6s. */
  isFresh?: boolean
  /** True si esta card es de la vista "Descartados" — usa badge neutro. */
  isDq?: boolean
  href?: string
}

export function BusinessLeadCard({
  lead,
  effectiveScore,
  effectiveClassification,
  decayTierLabel,
  highlight = false,
  isFresh = false,
  isDq = false,
  href,
}: BusinessLeadCardProps) {
  const [localStatus, setLocalStatus] = useState<ChatbotLeadStatus>(lead.status)
  const timeAgo = formatTimeAgo(lead.capturedAt)
  const statusMeta = STATUS_BADGE[localStatus]
  const intentText = intentLabel(lead.intent)
  const scoreCfg = !isDq && effectiveClassification ? SCORE_CONFIG[effectiveClassification] : null

  // Patrón "linked card": el Link es un overlay absolute que cubre toda la
  // card (z-10), el contenido va por encima (z-20). Así toda la card navega
  // al detalle PERO los <a tel:> y <a mailto:> internos son clickeables
  // independientemente. Evita `<a>` anidado dentro de `<a>` (HTML inválido).
  const infoBlock = (
    <>
      {/* Header: nombre + timestamp · status arriba a la derecha */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-zinc-100">
              {lead.name ?? 'Sin nombre'}
            </h3>
            {isFresh && (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300"
                aria-label="Lead nuevo"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/70" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-400" />
                </span>
                Nuevo
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            Hace {timeAgo}
            {decayTierLabel && !isDq && (
              <span className="text-zinc-600"> · {decayTierLabel}</span>
            )}
          </p>
        </div>
        {!isDq && <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>}
      </div>

      {/* Protagonista: badge XL de clase. Para DQ, badge gris neutro. */}
      {scoreCfg ? (
        <div
          className={`mb-4 flex items-center gap-3 rounded-xl border px-3 py-2.5 ${scoreCfg.containerClass}`}
          aria-label={`Nivel de interés: ${scoreCfg.label}${effectiveScore != null ? `, ${effectiveScore} de 100` : ''}`}
        >
          <scoreCfg.icon className={`h-7 w-7 shrink-0 ${scoreCfg.iconClass}`} strokeWidth={1.5} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className={`text-base font-semibold leading-tight ${scoreCfg.textClass}`}>
              {scoreCfg.label}
            </p>
            <p className="text-[11px] text-zinc-400">{scoreCfg.sublabel}</p>
          </div>
          {effectiveScore != null && (
            <span
              className="shrink-0 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500"
              aria-hidden
              title={`${effectiveScore} de 100`}
            >
              {effectiveScore}/100
            </span>
          )}
        </div>
      ) : isDq ? (
        <div
          className="mb-4 flex items-center gap-3 rounded-xl border border-zinc-700/50 bg-zinc-800/40 px-3 py-2.5"
          aria-label="Descartado por el bot"
        >
          <Ban className="h-7 w-7 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold leading-tight text-zinc-300">Descartado</p>
            <p className="text-[11px] text-zinc-500">No es una consulta comercial</p>
          </div>
        </div>
      ) : null}

      {/* Qué quiere */}
      {lead.intent && (
        <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Qué quiere
          </p>
          <p className="text-sm text-zinc-300">{intentText}</p>
        </div>
      )}

      {/* Contacto */}
      <div className="mb-4 space-y-2">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{lead.phone}</span>
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400"
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
        {href && (
          <Link
            href={href}
            aria-label={`Ver detalle de ${lead.name ?? 'contacto'}`}
            className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          />
        )}
        {/* z-20 con pointer-events-none: los clicks sobre texto ATRAVIESAN hasta
            el Link overlay (z-10) → toda la card navega. Cada elemento interactivo
            re-activa pointer-events para mantener su propio click. */}
        <div className="pointer-events-none relative z-20">
          {infoBlock}

          {/* Acciones — en el plano z-20 (clickeables sobre el Link overlay).
              En vista DQ no aparecen: son contactos descalificados, sin seguimiento. */}
          {!isDq && (
            <div className="space-y-3 border-t border-white/[0.06] pt-4">
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-400/20"
                >
                  <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                  WhatsApp
                </a>
              )}
              <LeadStatusActions
                leadId={lead.id}
                status={localStatus}
                onStatusChange={setLocalStatus}
                className="pointer-events-auto"
              />
            </div>
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

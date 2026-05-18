'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { Phone, Mail, MessageSquare, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { updateLeadStatus } from '@/modules/chatbot/server/admin/updateLeadStatus'
import type { ChatbotLead, ChatbotLeadStatus } from '@prisma/client'

const STATUS_BADGE: Record<ChatbotLeadStatus, { variant: 'default' | 'warning' | 'success' | 'info' | 'danger' | 'brand'; label: string }> = {
  NEW: { variant: 'warning', label: 'Sin contactar' },
  CONTACTED: { variant: 'info', label: 'Contactado' },
  IN_NEGOTIATION: { variant: 'brand', label: 'En negociación' },
  WON: { variant: 'success', label: 'Cliente' },
  LOST: { variant: 'default', label: 'Perdido' },
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
  onClick?: () => void
}

export function BusinessLeadCard({ lead, onClick }: BusinessLeadCardProps) {
  const [isPending, startTransition] = useTransition()
  const [localStatus, setLocalStatus] = useState<ChatbotLeadStatus>(lead.status)
  const timeAgo = formatTimeAgo(lead.capturedAt)
  const statusMeta = STATUS_BADGE[localStatus]
  const intentLabel = INTENT_LABELS[lead.intent ?? 'unknown'] ?? 'Consulta'

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

  return (
    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
      <Card variant="interactive" padding="lg" className="cursor-pointer" onClick={onClick}>
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-zinc-100">
              {lead.name ?? 'Sin nombre'}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} />
              Hace {timeAgo}
            </p>
          </div>
          <Badge variant={statusMeta.variant} className="shrink-0">
            {statusMeta.label}
          </Badge>
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

        {/* Acciones */}
        <div
          className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-4"
          onClick={(e) => e.stopPropagation()}
        >
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

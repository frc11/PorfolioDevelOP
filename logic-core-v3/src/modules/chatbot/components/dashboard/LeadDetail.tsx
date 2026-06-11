'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Flame,
  TrendingUp,
  Minus,
  Ban,
  Check,
  Star,
  AlertTriangle,
  User as UserIcon,
  Bot,
  Save,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState, Select } from '@/components/ui'
import { LeadScoringTeaser } from './LeadScoringTeaser'
import { updateLeadStatus } from '@/modules/chatbot/server/admin/updateLeadStatus'
import type { ChatbotLead, ChatbotLeadStatus } from '@prisma/client'
import type { LucideIcon } from 'lucide-react'

type Classification = 'hot' | 'warm' | 'cold'
type ScoreKind = 'positive' | 'combo' | 'penalty' | 'dq'
type ExplanationLine = { key: string; label: string; points: number; kind: ScoreKind }

type ConversationMeta = {
  id: string
  sessionId: string
  currentPath: string | null
  startedAt: Date
  lastMessageAt: Date
  messageCount: number
} | null

type LeadWithConversation = ChatbotLead & { conversation: ConversationMeta }

type Message = {
  id: string
  role: string
  content: string
  createdAt: Date | string
}

interface LeadDetailProps {
  lead: LeadWithConversation
  enriched: {
    effectiveScore: number | null
    effectiveClassification: Classification | 'dq' | null
    decayTierLabel: string | null
    scoreExplanation: ExplanationLine[]
  }
  messages: Message[]
  botSlug: string
  /** P0.3 — El plan incluye la priorización caliente/tibio/frío. Si false, el
   *  badge de clase y el desglose "por qué está calificado" se reemplazan por
   *  un teaser. El bloque DQ ("descartado") se muestra siempre — no es la
   *  feature vendida, sino higiene de bandeja. */
  showScoring: boolean
}

const STATUS_BADGE: Record<ChatbotLeadStatus, { variant: 'default' | 'warning' | 'success' | 'info' | 'danger' | 'brand'; label: string }> = {
  NEW: { variant: 'warning', label: 'Sin contactar' },
  CONTACTED: { variant: 'info', label: 'Contactado' },
  IN_NEGOTIATION: { variant: 'brand', label: 'En negociación' },
  WON: { variant: 'success', label: 'Cliente' },
  LOST: { variant: 'default', label: 'Perdido' },
}

const STATUS_LABELS: Record<ChatbotLeadStatus, string> = {
  NEW: 'Sin contactar',
  CONTACTED: 'Contactado',
  IN_NEGOTIATION: 'En negociación',
  WON: 'Cliente',
  LOST: 'Perdido',
}

// Mismo lenguaje visual que BusinessLeadCard: badge XL protagonista + sublabel
// del estado, con número 0-100 chico (dato secundario, no protagonista).
const CLASS_CONFIG: Record<Classification, {
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

const INTENT_LABELS: Record<string, string> = {
  quote: 'Pedido de cotización',
  quote_request: 'Pedido de cotización',
  info: 'Consulta de información',
  demo: 'Solicitud de demo',
  support: 'Soporte',
  purchase_ready: 'Listo para comprar',
  other: 'Consulta general',
  unknown: 'Consulta general',
}

export function LeadDetail({ lead, enriched, messages, botSlug, showScoring }: LeadDetailProps) {
  const [status, setStatus] = useState<ChatbotLeadStatus>(lead.status)
  const [notes, setNotes] = useState(lead.internalNotes ?? '')
  const [isPending, startTransition] = useTransition()
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const statusMeta = STATUS_BADGE[status]
  const cls = enriched.effectiveClassification
  const isDq = cls === 'dq'
  const cardCls = cls === 'hot' || cls === 'warm' || cls === 'cold' ? CLASS_CONFIG[cls] : null
  const intentLabel = INTENT_LABELS[lead.intent ?? 'unknown'] ?? 'Consulta'
  // Para DQ: la "razón" es el primer signal de tipo 'dq' (el motor de scoring
  // garantiza al menos uno cuando classification='dq'). Para no-DQ: signals
  // positivos/combos/penalties; ocultamos los kind='dq' (no aplican).
  const dqSignal = isDq ? enriched.scoreExplanation.find((s) => s.kind === 'dq') ?? null : null
  const visibleSignals = enriched.scoreExplanation.filter((s) => s.kind !== 'dq')

  const firstName = (lead.name ?? '').split(' ')[0] || ''
  const waMessage = buildWhatsappMessage(firstName, intentLabel)
  const waHref = lead.phone
    ? `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`
    : null

  function handleSave() {
    startTransition(async () => {
      await updateLeadStatus({ leadId: lead.id, status, notes })
      setSavedAt(Date.now())
    })
  }

  function handleQuickStatus(next: ChatbotLeadStatus) {
    startTransition(async () => {
      await updateLeadStatus({ leadId: lead.id, status: next, notes })
      setStatus(next)
      setSavedAt(Date.now())
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/chatbot/leads"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Volver a mis contactos
      </Link>

      {/* Hero */}
      <Card padding="lg">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-zinc-100 sm:text-2xl">
              {lead.name ?? 'Sin nombre'}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} />
              Dejó sus datos hace {formatTimeAgo(lead.capturedAt)}
              {enriched.decayTierLabel && (
                <span className="text-zinc-600"> · {enriched.decayTierLabel}</span>
              )}
            </p>
          </div>
          {/* En DQ no mostramos el badge de status CRM — NEW/CONTACTED/WON
              no aplican a un contacto descalificado por el bot. */}
          {!isDq && <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>}
        </div>

        {/* Protagonista del detalle: badge XL de clase (hot/warm/cold) o variante
            gris "Descartado" cuando el lead es DQ. Número 0-100 secundario.
            P0.3: DQ siempre se muestra; el badge de clase está gateado por plan
            (si no, va el teaser en su lugar). */}
        {isDq ? (
          <div
            className="mb-4 flex items-center gap-3 rounded-xl border border-zinc-700/50 bg-zinc-800/40 px-4 py-3"
            aria-label="Descartado por el bot — no es una consulta comercial"
          >
            <Ban className="h-8 w-8 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold leading-tight text-zinc-300">Descartado</p>
              <p className="text-xs text-zinc-500">No es una consulta comercial</p>
            </div>
          </div>
        ) : showScoring && cardCls ? (
          <div
            className={`mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 ${cardCls.containerClass}`}
            aria-label={`Nivel de interés: ${cardCls.label}${enriched.effectiveScore != null ? `, ${enriched.effectiveScore} de 100` : ''}`}
          >
            <cardCls.icon className={`h-8 w-8 shrink-0 ${cardCls.iconClass}`} strokeWidth={1.5} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={`text-lg font-semibold leading-tight ${cardCls.textClass}`}>
                {cardCls.label}
              </p>
              <p className="text-xs text-zinc-400">{cardCls.sublabel}</p>
            </div>
            {enriched.effectiveScore != null && (
              <span
                className="shrink-0 rounded-md bg-white/[0.04] px-2 py-1 text-xs font-medium tabular-nums text-zinc-500"
                title={`Nivel de interés ahora: ${enriched.effectiveScore} de 100`}
              >
                {enriched.effectiveScore}/100
              </span>
            )}
          </div>
        ) : !showScoring ? (
          <LeadScoringTeaser className="mb-4" />
        ) : null}

        {/* Qué quiere */}
        {lead.intent && (
          <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Qué quiere
            </p>
            <p className="text-sm text-zinc-300">{intentLabel}</p>
          </div>
        )}

        {/* Contacto: AMBOS canales si existen */}
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              className="flex min-h-[44px] items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-cyan-500/30 hover:text-cyan-300"
            >
              <Phone className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
              <span className="truncate">{lead.phone}</span>
            </a>
          ) : (
            <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-dashed border-white/[0.06] px-3 py-2 text-sm text-zinc-600">
              <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span>Sin teléfono</span>
            </div>
          )}
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="flex min-h-[44px] items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-cyan-500/30 hover:text-cyan-300"
            >
              <Mail className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
              <span className="truncate">{lead.email}</span>
            </a>
          ) : (
            <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-dashed border-white/[0.06] px-3 py-2 text-sm text-zinc-600">
              <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span>Sin email</span>
            </div>
          )}
        </div>

        {/* Acciones rápidas — solo para leads comerciales. En DQ no hay
            seguimiento que hacer (postventa/empleo/spam/proveedor). */}
        {!isDq && (
          <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-400/20"
              >
                <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                WhatsApp con mensaje
              </a>
            )}
            {status === 'NEW' && (
              <Button size="sm" variant="secondary" disabled={isPending} onClick={() => handleQuickStatus('CONTACTED')}>
                Marcar contactado
              </Button>
            )}
            {status !== 'WON' && status !== 'LOST' && (
              <Button size="sm" disabled={isPending} onClick={() => handleQuickStatus('WON')}>
                ✓ Es cliente
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Por qué — explicabilidad del scoring en lenguaje de dueño. Dos modos:
          DQ → motivo único en gris (sin puntos visibles, no aporta al dueño).
          No-DQ → lista de señales positivas/combos/penalties con puntos. */}
      {isDq && dqSignal ? (
        <Card padding="lg">
          <h2 className="mb-3 text-sm font-semibold text-zinc-200">
            Por qué fue descartado
          </h2>
          <div className="flex items-start gap-2.5 rounded-xl border border-zinc-700/40 bg-zinc-800/30 p-3">
            <Ban className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
            <p className="flex-1 text-sm text-zinc-300">{dqSignal.label}</p>
          </div>
          <p className="mt-3 text-[11px] text-zinc-600">
            El bot identificó esta consulta como no comercial (postventa, empleo,
            propuesta de proveedor o spam). No aparece en la lista principal.
          </p>
        </Card>
      ) : (showScoring && (visibleSignals.length > 0 || enriched.effectiveScore != null)) ? (
        <Card padding="lg">
          <h2 className="mb-3 text-sm font-semibold text-zinc-200">
            Por qué está calificado así
          </h2>
          {visibleSignals.length > 0 ? (
            <ul className="space-y-2">
              {visibleSignals.map((s) => {
                const isPositive = s.points > 0
                let Icon: LucideIcon = Check
                if (s.kind === 'combo') Icon = Star
                else if (s.kind === 'penalty') Icon = AlertTriangle
                return (
                  <li key={s.key} className="flex items-start gap-2.5">
                    <Icon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${isPositive ? 'text-emerald-400' : 'text-amber-400'}`}
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span className={`flex-1 text-sm ${isPositive ? 'text-zinc-200' : 'text-zinc-400'}`}>
                      {s.label}
                    </span>
                    <span className={`shrink-0 text-xs font-medium tabular-nums ${isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {s.points > 0 ? `+${s.points}` : s.points}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500">No hay señales suficientes para calificarlo todavía.</p>
          )}
          {enriched.effectiveScore != null && (
            <div className="mt-4 border-t border-white/[0.06] pt-3">
              <p className="text-xs text-zinc-500">
                Nivel de interés ahora:{' '}
                <span className="font-medium text-zinc-200">{enriched.effectiveScore}</span>
                <span className="text-zinc-600"> / 100</span>
                {enriched.decayTierLabel && (
                  <span className="text-zinc-600"> · {enriched.decayTierLabel}</span>
                )}
              </p>
            </div>
          )}
        </Card>
      ) : null}

      {/* De qué hablaron */}
      <Card padding="lg">
        <h2 className="mb-3 text-sm font-semibold text-zinc-200">
          De qué hablaron
        </h2>
        {lead.message && (
          <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Mensaje al dejar los datos
            </p>
            <p className="text-sm text-zinc-300">{lead.message}</p>
          </div>
        )}

        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Sin conversación guardada"
            description="No tenemos los mensajes anteriores de esta persona. Igual podés contactarla con los datos de arriba."
            variant="subtle"
            size="sm"
          />
        ) : (
          <ConversationThread messages={messages} botSlug={botSlug} />
        )}

        {lead.conversation?.currentPath && (
          <p className="mt-3 text-[11px] text-zinc-600">
            Estaba mirando: <span className="font-mono text-zinc-500">{lead.conversation.currentPath}</span>
          </p>
        )}
      </Card>

      {/* Seguimiento (no-DQ) / Notas (DQ). En DQ no hay status CRM editable —
          el lead está descartado por el bot y no entra al pipeline comercial.
          El dueño puede igual anotarse cosas ("verificado como spam", etc.). */}
      <Card padding="lg">
        <h2 className="mb-3 text-sm font-semibold text-zinc-200">
          {isDq ? 'Notas' : 'Seguimiento'}
        </h2>
        <div className="space-y-3">
          {!isDq && (
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Estado</label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as ChatbotLeadStatus)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              >
                {(Object.keys(STATUS_LABELS) as ChatbotLeadStatus[]).map((key) => (
                  <option key={key} value={key}>
                    {STATUS_LABELS[key]}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs text-zinc-500">Notas internas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600"
              placeholder="Tus notas privadas sobre este contacto..."
            />
            <p className="mt-1 text-[10px] text-zinc-600">{notes.length}/2000</p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-[11px] text-zinc-500">
              {savedAt && !isPending ? 'Guardado' : ''}
            </span>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                'Guardando...'
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Save className="h-4 w-4" strokeWidth={1.5} /> Guardar
                </span>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ConversationThread({ messages, botSlug }: { messages: Message[]; botSlug: string }) {
  // Filtrar a user/assistant; system y tool no aportan al dueño.
  const visible = messages.filter((m) => m.role === 'user' || m.role === 'assistant')
  if (visible.length === 0) {
    return (
      <p className="text-xs text-zinc-500">
        Esta conversación tiene mensajes técnicos pero ninguno del visitante o del bot que valga la pena mostrar.
      </p>
    )
  }
  return (
    <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
      {visible.map((m) => {
        const isUser = m.role === 'user'
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!isUser && (
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                <Bot className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                isUser
                  ? 'bg-cyan-500/15 text-cyan-100'
                  : 'bg-zinc-800/60 text-zinc-200'
              }`}
              title={new Date(m.createdAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
            >
              <p className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</p>
            </div>
            {isUser && (
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                <UserIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
            )}
          </motion.div>
        )
      })}
      <p className="pt-1 text-center text-[10px] text-zinc-600">
        Conversación con {botSlug} · {visible.length} mensaje{visible.length === 1 ? '' : 's'}
      </p>
    </div>
  )
}

function buildWhatsappMessage(firstName: string, intentLabel: string): string {
  const greeting = firstName ? `Hola ${firstName}` : 'Hola'
  return `${greeting}, te contacto por tu consulta (${intentLabel.toLowerCase()}) que dejaste en nuestro sitio. ¿Cómo puedo ayudarte?`
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

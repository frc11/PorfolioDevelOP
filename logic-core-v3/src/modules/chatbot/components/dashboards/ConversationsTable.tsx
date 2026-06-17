'use client'

import { Fragment, useState } from 'react'
import type { Prisma } from '@prisma/client'
import { motion } from 'motion/react'
import { MessagesSquare, ChevronDown, Bot, User as UserIcon, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/ui'

interface ConversationRow {
  id: string
  sessionId: string
  currentPath: string | null
  messageCount: number
  tokensIn: number
  tokensOut: number
  // number (admin, ya serializado) | string | Prisma.Decimal (cliente, sin
  // serializar). Reemplaza un `any` preexistente; Number() cubre los tres.
  estimatedCostUsd: number | string | Prisma.Decimal
  leadCaptured: boolean
  startedAt: Date | string | null
  lastMessageAt: Date | string | null
  lead: { id: string; name: string; intent: string | null } | null
  _count: { messages: number }
}

export interface TranscriptMessage {
  id: string
  role: string
  content: string
  createdAt: string | Date
}

interface Props {
  conversations: ConversationRow[]
  totalCount?: number
  // Capacidad OPCIONAL (default off). El admin la habilita; el dashboard del
  // cliente no pasa estas props → su render queda byte-idéntico.
  expandable?: boolean
  fetchTranscript?: (conversationId: string) => Promise<TranscriptMessage[]>
}

function formatDate(d: Date | string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

export function ConversationsTable({
  conversations,
  totalCount,
  expandable = false,
  fetchTranscript,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cache, setCache] = useState<Record<string, TranscriptMessage[]>>({})
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)

  function toggle(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!cache[id] && fetchTranscript) {
      setLoadingId(id)
      setErrorId(null)
      void fetchTranscript(id)
        .then(msgs => setCache(prev => ({ ...prev, [id]: msgs })))
        .catch(() => setErrorId(id))
        .finally(() => setLoadingId(cur => (cur === id ? null : cur)))
    }
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="Todavía no hay conversaciones"
        description="Cuando alguien hable con tu chatbot en el sitio, el historial completo va a aparecer acá."
        cta={{ label: 'Ver cómo se instala', href: '/dashboard/chatbot/install' }}
      />
    )
  }
  const visible = conversations.length
  const total = totalCount ?? visible
  const isTruncated = total > visible
  const colSpan = expandable ? 7 : 6

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
              {expandable && <th className="py-3 pr-2 w-8" aria-hidden="true" />}
              <th className="py-3 pr-4">Última actividad</th>
              <th className="py-3 pr-4">Mensajes</th>
              <th className="py-3 pr-4">Tokens (in / out)</th>
              <th className="py-3 pr-4">Costo</th>
              <th className="py-3 pr-4">Ruta</th>
              <th className="py-3 pr-4">Lead</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => {
              const isOpen = expandable && expandedId === c.id
              return (
                <Fragment key={c.id}>
                  <tr
                    className={`border-b border-zinc-900 hover:bg-zinc-900/30 ${
                      expandable ? 'cursor-pointer' : ''
                    }`}
                    onClick={expandable ? () => toggle(c.id) : undefined}
                  >
                    {expandable && (
                      <td className="py-3 pr-2">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={isOpen ? 'Ocultar transcript' : 'Ver transcript'}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggle(c.id)
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/40"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            strokeWidth={1.5}
                          />
                        </button>
                      </td>
                    )}
                    <td className="py-3 pr-4 text-zinc-300">{formatDate(c.lastMessageAt)}</td>
                    <td className="py-3 pr-4 text-zinc-400">{c._count.messages}</td>
                    <td className="py-3 pr-4 text-zinc-400 font-mono text-xs">
                      {c.tokensIn} / {c.tokensOut}
                    </td>
                    <td className="py-3 pr-4 text-zinc-400 font-mono text-xs">
                      ${Number(c.estimatedCostUsd ?? 0).toFixed(4)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-500 text-xs">{c.currentPath ?? '—'}</td>
                    <td className="py-3 pr-4">
                      {c.lead ? (
                        <span className="text-xs text-emerald-400">
                          ✓ {c.lead.name} ({c.lead.intent})
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-zinc-900 bg-zinc-950/40">
                      <td colSpan={colSpan} className="px-3 py-4">
                        <TranscriptDetail
                          loading={loadingId === c.id}
                          error={errorId === c.id}
                          messages={cache[c.id]}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-zinc-500 text-right">
        {isTruncated
          ? `Mostrando ${visible} más recientes de ${total} totales.`
          : `${total} ${total === 1 ? 'conversación' : 'conversaciones'} en total.`}
      </p>
    </div>
  )
}

function TranscriptDetail({
  loading,
  error,
  messages,
}: {
  loading: boolean
  error: boolean
  messages?: TranscriptMessage[]
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        Cargando transcript…
      </div>
    )
  }
  if (error) {
    return <p className="text-xs text-red-300">No se pudo cargar el transcript. Probá de nuevo.</p>
  }
  // Normalizamos el rol a MAYÚSCULAS (el enum Prisma es USER/ASSISTANT/SYSTEM);
  // NO replicamos el filtro lowercase de LeadDetail (bug preexistente fuera de scope).
  const visible = (messages ?? []).filter((m) => {
    const role = m.role.toUpperCase()
    return role === 'USER' || role === 'ASSISTANT'
  })
  if (visible.length === 0) {
    return <p className="text-xs text-zinc-500">Sin mensajes de usuario o bot para mostrar.</p>
  }
  return (
    <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
      {visible.map((m) => {
        const isUser = m.role.toUpperCase() === 'USER'
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
                isUser ? 'bg-cyan-500/15 text-cyan-100' : 'bg-zinc-800/60 text-zinc-200'
              }`}
              title={new Date(m.createdAt).toLocaleString('es-AR')}
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
    </div>
  )
}

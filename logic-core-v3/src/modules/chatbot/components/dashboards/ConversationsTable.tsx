'use client'

import { MessagesSquare } from 'lucide-react'
import { EmptyState } from '@/components/ui'

interface ConversationRow {
  id: string
  sessionId: string
  currentPath: string | null
  messageCount: number
  tokensIn: number
  tokensOut: number
  estimatedCostUsd: number | string | any
  leadCaptured: boolean
  startedAt: Date | string | null
  lastMessageAt: Date | string | null
  lead: { id: string; name: string; intent: string | null } | null
  _count: { messages: number }
}

interface Props {
  conversations: ConversationRow[]
  totalCount?: number
}

function formatDate(d: Date | string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

export function ConversationsTable({ conversations, totalCount }: Props) {
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

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
              <th className="py-3 pr-4">Última actividad</th>
              <th className="py-3 pr-4">Mensajes</th>
              <th className="py-3 pr-4">Tokens (in / out)</th>
              <th className="py-3 pr-4">Costo</th>
              <th className="py-3 pr-4">Ruta</th>
              <th className="py-3 pr-4">Lead</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => (
              <tr key={c.id} className="border-b border-zinc-900 hover:bg-zinc-900/30">
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
            ))}
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

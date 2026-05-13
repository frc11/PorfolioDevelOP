'use client'

import { motion } from 'motion/react'

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  intent: string
  message: string
  status: string
  capturedAt: Date | string
  conversation?: { sessionId: string; currentPath: string | null } | null
}

interface LeadsTableProps {
  leads: Lead[]
}

const INTENT_COLORS: Record<string, string> = {
  quote: 'bg-emerald-500/20 text-emerald-300',
  demo: 'bg-violet-500/20 text-violet-300',
  info: 'bg-cyan-500/20 text-cyan-300',
  support: 'bg-amber-500/20 text-amber-300',
  other: 'bg-zinc-500/20 text-zinc-300',
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

export function LeadsTable({ leads }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500 text-sm">
        Todavía no hay leads capturados por el chatbot.
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {leads.map((lead, i) => (
        <motion.div
          key={lead.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-start justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">{lead.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                  INTENT_COLORS[lead.intent] ?? INTENT_COLORS.other
                }`}
              >
                {lead.intent}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mb-2">
              {lead.email && <span>{lead.email}</span>}
              {lead.phone && <span className="ml-2">{lead.phone}</span>}
            </div>
            <div className="text-sm text-zinc-300 leading-relaxed">{lead.message}</div>
          </div>
          <div className="text-[11px] text-zinc-500 text-right shrink-0">
            {formatDate(lead.capturedAt)}
            {lead.conversation?.currentPath && (
              <div className="mt-1 text-zinc-600">desde {lead.conversation.currentPath}</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

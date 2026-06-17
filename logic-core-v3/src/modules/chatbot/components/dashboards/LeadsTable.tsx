'use client'

import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Users } from 'lucide-react'
import { EmptyState } from '@/components/ui'

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
  // Acción opcional por fila (default ausente). El admin la pasa; los demás
  // consumidores (dashboard del cliente) la omiten → su vista queda idéntica.
  renderRowAction?: (lead: Lead) => ReactNode
}

const INTENT_COLORS: Record<string, string> = {
  quote: 'bg-emerald-500/20 text-emerald-300',
  demo: 'bg-violet-500/20 text-violet-300',
  info: 'bg-cyan-500/20 text-cyan-300',
  support: 'bg-amber-500/20 text-amber-300',
  other: 'bg-zinc-500/20 text-zinc-300',
}

function formatDate(d: Date | string): string {
  // timeZone fijo (AR): sin esto el server (Netlify = UTC) y el cliente (UTC-3)
  // formatean horas distintas para el mismo instante → hydration mismatch.
  return new Date(d).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

export function LeadsTable({ leads, renderRowAction }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Tu bot todavía no capturó leads"
        description="Cuando alguien deje sus datos conversando con el chatbot, van a aparecer acá."
      />
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
            {/* suppressHydrationWarning: catch-all para diferencias ICU (espacio
                angosto U+202F antes de "p. m.") entre el ICU de Node y el del browser. */}
            <span suppressHydrationWarning>{formatDate(lead.capturedAt)}</span>
            {lead.conversation?.currentPath && (
              <div className="mt-1 text-zinc-600">desde {lead.conversation.currentPath}</div>
            )}
            {renderRowAction && <div className="mt-2 flex justify-end">{renderRowAction(lead)}</div>}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

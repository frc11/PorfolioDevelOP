'use client'

import { motion, useReducedMotion } from 'motion/react'

// ─── Shared view-model ──────────────────────────────────────────────────────
// Cada superficie (Mensajes / Ticket) normaliza SUS propias filas a este shape.
// La fuente de datos NO se comparte: sólo este molde visual.
//   isAgency: true  = develOP  → IZQUIERDA (burbuja cyan)
//             false = cliente  → DERECHA   (burbuja neutra)
export interface ChatMessage {
  id: string
  content: string
  isAgency: boolean
  authorLabel: string
  createdAt: Date
}

function formatTime(date: Date) {
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Burbuja canónica del chat cliente. Extraída 1:1 del molde de MessageThread. */
export function ChatBubble({ message }: { message: ChatMessage }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.isAgency ? 'justify-start' : 'justify-end'}`}
    >
      <motion.div
        whileHover={
          reduce
            ? undefined
            : { scale: 1.015, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }
        }
        className={[
          'max-w-[85%] rounded-[24px] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-shadow sm:max-w-[70%]',
          'hover:ring-1 hover:ring-white/15',
          message.isAgency
            ? 'border border-cyan-400/20 bg-cyan-500/10 text-cyan-50'
            : 'border border-white/10 bg-black/20 text-zinc-100',
        ].join(' ')}
      >
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
          <span>{message.authorLabel}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">{formatTime(message.createdAt)}</span>
        </div>
        <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6">{message.content}</p>
      </motion.div>
    </motion.div>
  )
}

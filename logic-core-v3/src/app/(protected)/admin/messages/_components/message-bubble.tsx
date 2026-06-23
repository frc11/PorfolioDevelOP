'use client'

import { motion, useReducedMotion } from 'motion/react'

type MessageBubbleProps = {
  fromAdmin: boolean
  companyName: string
  content: string
  createdAt: string
}

function formatMessageDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

/**
 * Burbuja de mensaje con hover replicando el patrón de ActivityLog (módulo
 * chatbot): scale 1.015 + ring, easing [0.25,0.46,0.45,0.94] <300ms, gateado
 * por useReducedMotion. Wrapper LOCAL de messages — no se importa nada de otros
 * módulos ni se edita shared. El scale va por whileHover (no CSS hover:scale)
 * para no pelear con el transform inline de Framer.
 */
export function MessageBubble({ fromAdmin, companyName, content, createdAt }: MessageBubbleProps) {
  const reduce = useReducedMotion()

  return (
    <div className={`flex ${fromAdmin ? 'justify-end' : 'justify-start'}`}>
      <motion.div
        whileHover={
          reduce
            ? undefined
            : { scale: 1.015, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }
        }
        className={[
          'max-w-[85%] rounded-[24px] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-shadow sm:max-w-[70%]',
          'hover:ring-1 hover:ring-white/15',
          fromAdmin
            ? 'border border-cyan-400/20 bg-cyan-500/10 text-cyan-50'
            : 'border border-white/10 bg-black/20 text-zinc-100',
        ].join(' ')}
      >
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
          <span>{fromAdmin ? 'Admin' : companyName}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">{formatMessageDate(createdAt)}</span>
        </div>
        <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6">{content}</p>
      </motion.div>
    </div>
  )
}

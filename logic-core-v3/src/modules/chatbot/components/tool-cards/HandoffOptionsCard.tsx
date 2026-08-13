'use client'

import { MessageCircle, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface HandoffOptionsCardProps {
  config: PublicBotConfig
  preamble: string
  onSelectWhatsapp: () => void
  onSelectCallback: () => void
  /**
   * R3 (CARRERAS) — true mientras el turno sigue en vuelo: los botones se
   * deshabilitan con el MISMO gate que el textarea y el botón de enviar. Sin
   * esto, apretar "Que me contacten" con el turno anterior abierto manda el
   * mensaje duplicado (transcript USER,USER,ASSISTANT,ASSISTANT y doble costo
   * de Vertex — reproducido en prod con dos clicks).
   */
  disabled?: boolean
}

export function HandoffOptionsCard({
  config,
  preamble,
  onSelectWhatsapp,
  onSelectCallback,
  disabled,
}: HandoffOptionsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border p-3 flex flex-col gap-2"
      style={{
        borderColor: `${config.accentColor}33`,
        background: `${config.accentColor}0A`,
      }}
    >
      <div className="text-xs text-white/70 leading-relaxed">{preamble}</div>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          onClick={onSelectWhatsapp}
          disabled={disabled}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
          style={{
            background: '#25D366',
            color: 'white',
          }}
        >
          <MessageCircle size={13} strokeWidth={1.5} />
          WhatsApp ya
        </button>
        <button
          onClick={onSelectCallback}
          disabled={disabled}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] border disabled:opacity-50 disabled:pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.12)',
            color: 'white',
          }}
        >
          <Phone size={13} strokeWidth={1.5} />
          Que me contacten
        </button>
      </div>
    </motion.div>
  )
}

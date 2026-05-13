'use client'

import { MessageCircle, ExternalLink } from 'lucide-react'
import { motion } from 'motion/react'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface WhatsappHandoffCardProps {
  config: PublicBotConfig
  prefilledMessage: string
}

export function WhatsappHandoffCard({ config, prefilledMessage }: WhatsappHandoffCardProps) {
  const whatsappUrl = config.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(prefilledMessage)}`
    : null

  if (!whatsappUrl) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200/80">
        WhatsApp no configurado.
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border p-3 flex flex-col gap-3"
      style={{
        borderColor: 'rgba(37, 211, 102, 0.30)',
        background: 'rgba(37, 211, 102, 0.08)',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center">
          <MessageCircle size={14} strokeWidth={1.5} className="text-white" />
        </div>
        <div className="text-xs font-medium text-white">Mensaje listo para enviar</div>
      </div>

      <div className="text-[11px] text-white/60 italic px-3 py-2 rounded bg-white/5 leading-relaxed">
        {prefilledMessage.slice(0, 200)}
        {prefilledMessage.length > 200 ? '…' : ''}
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium bg-[#25D366] text-white transition-all hover:scale-[1.02] hover:bg-[#1FBA5A]"
      >
        Abrir WhatsApp
        <ExternalLink size={13} strokeWidth={1.5} />
      </a>
    </motion.div>
  )
}

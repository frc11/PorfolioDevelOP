'use client'

import { ArrowRight, Compass } from 'lucide-react'
import { motion } from 'motion/react'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface NavigateToPageCardProps {
  config: PublicBotConfig
  path: string
  reason: string
  onNavigate: (path: string) => void
}

export function NavigateToPageCard({
  config,
  path,
  reason,
  onNavigate,
}: NavigateToPageCardProps) {
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
      <div className="flex items-start gap-2">
        <Compass size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: config.accentColor }} />
        <div className="text-xs text-white/80 leading-relaxed">{reason}</div>
      </div>
      <button
        onClick={() => onNavigate(path)}
        className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium mt-1 transition-all hover:scale-[1.02]"
        style={{
          background: config.accentColor,
          color: '#000',
        }}
      >
        Llevame ahí
        <ArrowRight size={13} strokeWidth={1.5} />
      </button>
    </motion.div>
  )
}

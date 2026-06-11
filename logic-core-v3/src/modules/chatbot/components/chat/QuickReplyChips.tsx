'use client'

import { motion } from 'motion/react'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface QuickReplyChipsProps {
  config: PublicBotConfig
  onSelect: (text: string) => void
}

export function QuickReplyChips({ config, onSelect }: QuickReplyChipsProps) {
  if (!config.quickReplies || config.quickReplies.length === 0) return null
  const chipColor = config.accentSecondary ?? config.accentColor
  return (
    <div className="px-4 pb-2 flex flex-wrap gap-2">
      {config.quickReplies.map((qr, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          onClick={() => onSelect(qr.promptToSend)}
          className="px-3 py-1.5 text-xs rounded-full border transition-all hover:scale-[1.03]"
          style={{
            background: `${chipColor}1A`,
            borderColor: `${chipColor}33`,
            color: 'white',
          }}
        >
          {qr.emoji ? `${qr.emoji} ` : ''}{qr.label}
        </motion.button>
      ))}
    </div>
  )
}

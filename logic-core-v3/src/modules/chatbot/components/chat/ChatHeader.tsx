'use client'

import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { NeuroAvatar, type NeuroAvatarState } from '../avatar'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface ChatHeaderProps {
  config: PublicBotConfig
  avatarState: NeuroAvatarState
  isStreaming: boolean
  onClose: () => void
}

export function ChatHeader({ config, avatarState, isStreaming, onClose }: ChatHeaderProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 h-14 border-b"
      style={{
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <NeuroAvatar
        state={avatarState}
        accentColor={config.accentColor}
        size={36}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {config.botName}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-white/60">
          <motion.span
            animate={{
              backgroundColor: isStreaming
                ? config.accentColor
                : 'rgba(34,197,94,0.9)',
            }}
            className="w-1.5 h-1.5 rounded-full"
          />
          <span>{isStreaming ? 'Escribiendo…' : 'En línea'}</span>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Cerrar chat"
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/70 hover:text-white"
      >
        <X size={18} strokeWidth={1.5} />
      </button>
    </div>
  )
}

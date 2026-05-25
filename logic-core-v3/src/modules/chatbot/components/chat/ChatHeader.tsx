'use client'

import { X, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'motion/react'
import { AvatarRenderer, type AvatarCoreState } from '../avatar'
import { deriveBusinessInitials } from '../../shared/businessInitials'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface ChatHeaderProps {
  config: PublicBotConfig
  avatarState: AvatarCoreState
  isStreaming: boolean
  onClose: () => void
  muted?: boolean
  onToggleMute?: () => void
}

export function ChatHeader({
  config,
  avatarState,
  isStreaming,
  onClose,
  muted,
  onToggleMute,
}: ChatHeaderProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 h-14 border-b"
      style={{
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <AvatarRenderer
        style={config.avatarStyle}
        state={avatarState}
        accentColor={config.accentColor}
        size={36}
        avatarImageUrl={config.avatarImageUrl}
        avatarEmoji={config.avatarEmoji}
        businessInitials={deriveBusinessInitials(config.botName)}
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
      {onToggleMute && (
        <button
          onClick={onToggleMute}
          aria-label={muted ? 'Activar sonido' : 'Silenciar'}
          aria-pressed={muted}
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          {muted ? (
            <VolumeX size={18} strokeWidth={1.5} />
          ) : (
            <Volume2 size={18} strokeWidth={1.5} />
          )}
        </button>
      )}
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


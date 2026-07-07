'use client'

import { X, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'motion/react'
import { AvatarRenderer, getAvatarRenderSize, type AvatarCoreState } from '../avatar'
import { deriveBusinessInitials } from '../../shared/businessInitials'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface ChatHeaderProps {
  config: PublicBotConfig
  avatarState: AvatarCoreState
  isStreaming: boolean
  onClose: () => void
  muted?: boolean
  onToggleMute?: () => void
  /**
   * Fase typewriter del panel: true mientras se REVELA texto (no durante
   * "pensando"). El header muestra "Escribiendo…" + avatar hablando SOLO en
   * esta fase. Si se omite (p. ej. el embed), cae a `isStreaming`.
   */
  isTyping?: boolean
  /**
   * INFRA.2 — true mientras el widget reintenta el POST a /chat tras un fallo
   * transitorio (cold-start de Neon). Muestra un estado soft "Conectando…" + punto
   * ámbar, con prioridad sobre "Escribiendo…"/"En línea".
   */
  reconnecting?: boolean
}

export function ChatHeader({
  config,
  avatarState,
  isStreaming,
  onClose,
  muted,
  onToggleMute,
  isTyping,
  reconnecting,
}: ChatHeaderProps) {
  // Fase real: si el panel reporta el typewriter (`isTyping`) lo usamos como
  // fuente de verdad; si no, retrocompatibilidad con el viejo `isStreaming`.
  const typing = isTyping ?? isStreaming
  // Avatar del header: hablando solo mientras se revela texto; idle en reposo y
  // mientras PIENSA (el "pensando" vive en el indicador inline). Sin `isTyping`
  // (embed) conservamos el comportamiento previo basado en `avatarState`.
  const headerAvatarState: AvatarCoreState =
    isTyping !== undefined
      ? isTyping
        ? 'speaking'
        : 'idle'
      : avatarState === 'speaking'
        ? 'speaking'
        : 'idle'
  return (
    <div
      className="flex items-center gap-3 px-4 h-14 border-b"
      style={{
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <AvatarRenderer
        style={config.avatarStyle}
        // El header se mantiene en reposo (idle) mientras el bot PIENSA — el
        // estado "pensando" vive solo en el indicador inline (los tres puntos).
        // Acá únicamente reaccionamos al responder: speaking durante el tipeo.
        state={headerAvatarState}
        accentColor={config.accentColor}
        size={getAvatarRenderSize(config.avatarStyle, 36)}
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
              backgroundColor: reconnecting
                ? 'rgba(245,158,11,0.9)'
                : typing
                  ? config.accentColor
                  : 'rgba(34,197,94,0.9)',
            }}
            className="w-1.5 h-1.5 rounded-full"
          />
          <span>{reconnecting ? 'Conectando…' : typing ? 'Escribiendo…' : 'En línea'}</span>
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

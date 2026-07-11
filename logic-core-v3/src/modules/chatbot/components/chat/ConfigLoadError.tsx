'use client'

import { WifiOff } from 'lucide-react'

interface ConfigLoadErrorProps {
  onRetry: () => void
}

/**
 * RE-2 — contenido del estado terminal cuando `/config` no pudo cargar tras
 * agotar los reintentos automáticos (chatRetryPolicy, vía prefetchBotConfig).
 * Mismo lenguaje visual que el `connection_failed` de INFRA.2 (ámbar + WifiOff,
 * ver DegradedBanner) para no inventar uno nuevo. Sin wrapper de layout: cada
 * render (embed / on-site) lo posiciona a su manera porque no hay `config`
 * (accentColor, avatarStyle, etc.) disponible en este estado.
 */
export function ConfigLoadError({ onRetry }: ConfigLoadErrorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.16)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WifiOff size={16} strokeWidth={1.5} color="rgba(245, 158, 11, 0.95)" />
      </div>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.94)',
          maxWidth: '220px',
        }}
      >
        No pudimos conectar con el chat.
      </div>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          minHeight: '36px',
          borderRadius: '10px',
          background: 'rgba(245, 158, 11, 0.16)',
          border: '1px solid rgba(245, 158, 11, 0.32)',
          color: 'rgba(255, 255, 255, 0.94)',
          fontSize: '12.5px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reintentar
      </button>
    </div>
  )
}

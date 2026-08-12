'use client'

import { MessageCircle, ExternalLink, WifiOff, Clock } from 'lucide-react'
import { motion } from 'motion/react'
import type { DegradedInfo, DegradedReason } from '../../hooks/useChatbot'

interface DegradedBannerProps {
  info: DegradedInfo
}

// BLOQUE VOZ — familia ámbar: estados honestos "probá de nuevo" con el input
// HABILITADO (ver NON_LOCKING_DEGRADES en useChatbot). La primera línea viene
// en info.message; la sub-línea y el ícono se eligen acá por reason.
const AMBER_REASONS: ReadonlySet<DegradedReason> = new Set([
  'connection_failed',
  'rate_limited',
  'chat_unavailable',
  'stream_interrupted',
])

const AMBER_SUBLINES: Partial<Record<DegradedReason, string>> = {
  connection_failed: 'Escribí de nuevo y seguimos.',
  rate_limited: 'Esperá un momento y volvé a escribir.',
  chat_unavailable: 'Probá de nuevo en un rato.',
  stream_interrupted: 'Escribí de nuevo y seguimos.',
}

// MS-2 — Render del estado degradado en el widget del visitante.
// El backend (handleChatRequest.ts:83) responde con `{ mode: 'degraded', message,
// whatsappNumber, whatsappMessage, companyName, reason }` cuando la org agotó
// cuota o el dominio quedó fuera del cap del plan. El visitante NUNCA debe ver
// un error técnico — esto rinde una derivación digna a WhatsApp con la info
// real del bot.
export function DegradedBanner({ info }: DegradedBannerProps) {
  // INFRA.2 — connection_failed NO es un handoff a WhatsApp: es un estado honesto
  // "probá de nuevo" tras agotar los reintentos del cold-start. El input queda
  // habilitado (ver inputLockedByDegrade), así que invitamos a reintentar a mano.
  // BLOQUE VOZ — la misma variante ámbar cubre los caminos que el widget
  // descartaba: 429 (rate_limited), 400/403/404 (chat_unavailable) y el frame
  // de error mid-stream (stream_interrupted).
  if (AMBER_REASONS.has(info.reason)) {
    const AmberIcon = info.reason === 'rate_limited' ? Clock : WifiOff
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        role="status"
        aria-live="polite"
        style={{
          background: 'rgba(245, 158, 11, 0.07)',
          border: '1px solid rgba(245, 158, 11, 0.24)',
          borderRadius: '14px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          maxWidth: '90%',
          alignSelf: 'flex-start',
          boxShadow: '0 4px 18px rgba(245, 158, 11, 0.08)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AmberIcon size={16} strokeWidth={1.5} color="rgba(245, 158, 11, 0.95)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.94)',
            }}
          >
            {info.message}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.62)',
              lineHeight: 1.5,
            }}
          >
            {AMBER_SUBLINES[info.reason] ?? 'Escribí de nuevo y seguimos.'}
          </div>
        </div>
      </motion.div>
    )
  }

  const cleanNumber = info.whatsappNumber?.replace(/\D/g, '') ?? ''
  const prefilledMessage =
    info.whatsappMessage && info.whatsappMessage.length > 0
      ? info.whatsappMessage
      : `Hola${info.companyName ? ` ${info.companyName}` : ''}, vengo del chat de la web y quería seguir la conversación por acá.`
  const whatsappUrl =
    cleanNumber.length > 0
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(prefilledMessage)}`
      : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      aria-live="polite"
      style={{
        background: 'rgba(37, 211, 102, 0.07)',
        border: '1px solid rgba(37, 211, 102, 0.24)',
        borderRadius: '14px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '90%',
        alignSelf: 'flex-start',
        boxShadow: '0 4px 18px rgba(37, 211, 102, 0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 14px rgba(37, 211, 102, 0.4)',
          }}
        >
          <MessageCircle size={16} strokeWidth={1.5} color="#fff" />
        </div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.94)',
            letterSpacing: '0.005em',
          }}
        >
          Te seguimos por WhatsApp
        </div>
      </div>

      <p
        style={{
          fontSize: '12.5px',
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.78)',
          margin: 0,
        }}
      >
        {info.message}
      </p>

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir WhatsApp para continuar la conversación"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '11px 16px',
            minHeight: '44px',
            borderRadius: '10px',
            background: '#25D366',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 200ms, transform 150ms',
            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.28)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1FBA5A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#25D366'
          }}
        >
          <MessageCircle size={15} strokeWidth={2} />
          <span>Abrir WhatsApp</span>
          <ExternalLink size={13} strokeWidth={1.5} style={{ opacity: 0.75 }} />
        </a>
      ) : (
        <div
          style={{
            fontSize: '11.5px',
            color: 'rgba(255, 255, 255, 0.55)',
            fontStyle: 'italic',
            padding: '4px 0',
          }}
        >
          Volvé a probar más tarde y vamos a poder seguir ayudándote.
        </div>
      )}
    </motion.div>
  )
}

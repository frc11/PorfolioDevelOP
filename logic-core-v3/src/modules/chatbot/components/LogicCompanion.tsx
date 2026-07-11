'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { AvatarRenderer, getAvatarRenderSize } from './avatar'
import { deriveBusinessInitials } from '../shared/businessInitials'
import { CHATBOT_Z_INDEX } from '../shared/zIndex'
import { ChatWindow } from './chat/ChatWindow'
import { ConfigLoadError } from './chat/ConfigLoadError'
import { ProactiveTooltip } from './tooltip'
import { renderToolCall } from './tool-cards'
import { useChatbot } from '../hooks/useChatbot'
import { useChatbotSounds } from '../hooks/useChatbotSounds'
import type { ToolCallInUIMessage } from './chat/types'
import { parseAttribution } from '../shared/attribution'
import {
  CHROME_REVEAL_OFFSET_PX,
  CHROME_REVEAL_DURATION_MS,
  CHROME_REVEAL_EASE_CSS,
} from '@/lib/chromeReveal'

// ── Widget reveal (post-preloader / post-intro entrance) ────────────────────
// The launcher fades + slides up the first time the site chrome is revealed,
// using the SHARED reveal tokens (@/lib/chromeReveal) so it appears IDENTICALLY
// and at the same time as the dock (DynamicDock). Driven by a CSS keyframe rather
// than a Framer mount transition on purpose: under the app's heavy first paint a
// one-shot Framer `initial → animate` enter gets dropped, leaving the bubble stuck
// at its initial frame (see the `initial={false}` note on the launcher below). A
// CSS animation runs on the compositor independent of React's commit timing, so it
// can't get stuck. GPU-friendly: animates only `opacity` + the standalone
// `translate` property (never width/height), which composes with the launcher's
// Framer `scale` (a `transform`) without the two fighting over one property.
// Honors prefers-reduced-motion via `useReducedMotion()`.

interface LogicCompanionProps {
  slug: string
}

export function LogicCompanion({ slug }: LogicCompanionProps) {
  const pathname = usePathname() ?? '/'
  // UTM.1 — same-origin (sin iframe de por medio): la URL real de esta carga
  // de página está disponible directo. Deps vacías a propósito — resuelto
  // UNA vez por mount, para no recalcular first-touch en cada cambio de ruta
  // client-side (ver nota de first-touch en useChatbot.ts).
  const attribution = useMemo(
    () =>
      typeof window === 'undefined'
        ? undefined
        : parseAttribution(window.location.href, document.referrer || null),
    [],
  )
  const chatbot = useChatbot({ slug, currentPath: pathname, attribution })
  const sounds = useChatbotSounds()
  const reducedMotion = useReducedMotion()

  // Fire `playMessage` only on the streaming→ready transition (not on every
  // re-render). The interaction-guard inside the hook covers the autoplay
  // policy: if the user has not opened the widget yet, this is a no-op.
  const wasStreamingRef = useRef<boolean>(false)
  useEffect(() => {
    if (wasStreamingRef.current && !chatbot.isStreaming) {
      sounds.playMessage()
    }
    wasStreamingRef.current = chatbot.isStreaming
  }, [chatbot.isStreaming, sounds])

  const handleToggle = useCallback(() => {
    if (chatbot.isOpen) {
      // Route the launcher's close through close() (NOT toggle) so it runs the
      // same cleanup as the X / backdrop — clearing a pending proactive opener
      // and stripping its unanswered bubble instead of letting them pile up.
      chatbot.close()
    } else {
      // Play the open chime BEFORE flipping state so the AudioContext is created
      // inside the user-gesture frame (Safari is strict about this).
      sounds.playOpen()
      chatbot.open()
    }
  }, [chatbot, sounds])

  // Mensajes de la burbuja "retomar" (cuando ya hay conversación). Rotan igual
  // que el teaser. El 1º usa el nombre configurado del bot (fuente de verdad,
  // nunca hardcodeado); si no hay nombre, cae a un texto sin nombre.
  const resumeMessages = useMemo(() => {
    const name = chatbot.config?.botName?.trim()
    return [
      name ? `Tu charla con ${name} sigue acá 👋` : 'Tu charla sigue acá 👋',
      '¿Seguimos donde lo dejamos?',
      'Retomemos la conversación',
      '¿Terminamos de organizar?',
    ]
  }, [chatbot.config?.botName])

  if (chatbot.isLoading) return null

  // RE-2 — isLoading=false + config=null = /config agotó sus reintentos
  // automáticos (chatRetryPolicy vía prefetchBotConfig). Antes el launcher
  // simplemente no aparecía nunca (return null indistinguible del loading);
  // ahora un affordance mínimo con reintento manual, en la misma posición
  // fija donde iría el launcher. Sin `config`, no hay accentColor/avatarStyle/
  // position del bot disponibles — se usa el default (esquina inferior derecha).
  if (!chatbot.config) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 'max(24px, env(safe-area-inset-bottom))',
          right: 'max(24px, env(safe-area-inset-right))',
          zIndex: CHATBOT_Z_INDEX.bubble,
          maxWidth: '240px',
          borderRadius: '16px',
          background: 'rgba(11,14,28,0.96)',
          border: '1px solid rgba(245, 158, 11, 0.24)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
        }}
      >
        <ConfigLoadError onRetry={chatbot.retryLoadConfig} />
      </div>
    )
  }

  // Respect safe-area-inset on iPhone notch / Android gesture nav. The bubble
  // should never sit *under* the home indicator on a 14 Pro or behind the
  // right-edge swipe area on a Pixel. `max(...)` keeps the desktop spacing
  // (24px) when there's no inset to worry about.
  const position =
    chatbot.config.position === 'bottom_left'
      ? {
          bottom: 'max(24px, env(safe-area-inset-bottom))',
          left: 'max(24px, env(safe-area-inset-left))',
        }
      : {
          bottom: 'max(24px, env(safe-area-inset-bottom))',
          right: 'max(24px, env(safe-area-inset-right))',
        }

  // Per-avatar sizing: heavy 3D avatars frame their subject with margin, so we
  // render them in a larger box to match the light avatars' visible size. The
  // launcher button grows with the avatar (light avatars resolve to 56 → no-op).
  const launcherSize = getAvatarRenderSize(chatbot.config.avatarStyle, 56)

  return (
    <>
      <AnimatePresence>
        {chatbot.isOpen && (
          <ChatWindow
            config={chatbot.config}
            messages={chatbot.messages}
            isStreaming={chatbot.isStreaming}
            avatarState={chatbot.avatarState}
            onSendMessage={chatbot.sendMessage}
            onClose={chatbot.close}
            onQuickReply={chatbot.sendMessage}
            degradedInfo={chatbot.degradedInfo}
            reconnecting={chatbot.reconnecting}
            inputLockedByDegrade={chatbot.inputLockedByDegrade}
            renderToolCall={(tc: ToolCallInUIMessage) =>
              renderToolCall(tc, chatbot.config!, {
                onSelectWhatsapp: chatbot.triggerWhatsappHandoff,
                onSelectCallback: chatbot.triggerCallbackHandoff,
                onNavigate: chatbot.navigateTo,
              })
            }
            muted={sounds.muted}
            onToggleMute={sounds.toggleMute}
          />
        )}
      </AnimatePresence>

      <motion.div
        data-chatbot-avatar
        data-cursor="hover"
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        aria-label={
          chatbot.isOpen
            ? 'Cerrar chat'
            : chatbot.hasConversation
              ? 'Abrir chat (conversación activa)'
              : 'Abrir chat'
        }
        style={{
          position: 'fixed',
          ...position,
          zIndex: CHATBOT_Z_INDEX.bubble,
          width: launcherSize,
          height: launcherSize,
          borderRadius: '50%',
          padding: 0,
          border: 'none',
          background: 'transparent',
          // No `cursor: pointer`: inherits `cursor: none` on desktop so the site's
          // custom cursor stays over the bubble; `data-cursor="hover"` grows its aura.
          // One-shot CSS reveal on first appearance (skipped under reduced motion).
          animation: reducedMotion
            ? undefined
            : `chatbotLauncherReveal ${CHROME_REVEAL_DURATION_MS}ms ${CHROME_REVEAL_EASE_CSS} both`,
        }}
        // The launcher renders directly at its resting state. We deliberately do
        // NOT use a Framer Motion `initial → animate` mount transition: under the
        // app's heavy first paint that one-shot enter animation was being dropped,
        // leaving the bubble frozen at its initial scale(0)/opacity:0 — it showed
        // as a tiny dot instead of the 56px button. `initial={false}` paints the
        // `animate` resting state immediately; hover/tap springs still work.
        initial={false}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={reducedMotion ? undefined : { scale: 1.08 }}
        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }
        }
      >
        <div className="relative w-full h-full">
          <AvatarRenderer
            style={chatbot.config.avatarStyle}
            state={chatbot.avatarState}
            accentColor={chatbot.config.accentColor}
            size={launcherSize}
            avatarImageUrl={chatbot.config.avatarImageUrl}
            avatarEmoji={chatbot.config.avatarEmoji}
            businessInitials={deriveBusinessInitials(chatbot.config.botName)}
          />
          {/* Badge: punto discreto de "conversación activa". Color = accentColor
              configurado (fuente de verdad). Persiste mientras haya conversación,
              esté la burbuja visible o cerrada; desaparece tras "Nueva conversación"
              (chat vacío). Decorativo → aria-hidden (el estado lo anuncia el
              aria-label del launcher); pointer-events none para no robar el click. */}
          {chatbot.hasConversation && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-1px',
                right: '-1px',
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                background: chatbot.config.accentColor,
                border: '2px solid rgba(6,8,18,0.92)',
                boxShadow: `0 0 8px ${chatbot.config.accentColor}aa`,
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          )}

          {/* Burbuja sobre el launcher — EXCLUYENTES por el gate hasConversation:
              chat vacío → teaser de preguntas (config.proactivePrompts, opener);
              con conversación → burbuja "retomar" (mismos mecánica/estilo, otro set
              de mensajes que rota igual; al click solo abre, no inyecta opener).
              `key` distinto fuerza remontaje limpio al alternar de modo.
              NUNCA en degradado/offline (bot_paused & co.): el teaser invita a
              conversar/inyecta un opener que un bot caído no puede responder. */}
          {!chatbot.isOpen &&
            !chatbot.degradedInfo &&
            (chatbot.hasConversation ? (
              <ProactiveTooltip
                key="resume"
                config={chatbot.config}
                currentPath={pathname}
                prompts={resumeMessages}
                onAccept={() => chatbot.open()}
                onDismiss={() => {}}
              />
            ) : (
              <ProactiveTooltip
                key="teaser"
                config={chatbot.config}
                currentPath={pathname}
                onAccept={chatbot.acceptProactivePrompt}
                onDismiss={() => {}}
              />
            ))}
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes chatbotLauncherReveal {
          from {
            opacity: 0;
            translate: 0 ${CHROME_REVEAL_OFFSET_PX}px;
          }
          to {
            opacity: 1;
            translate: 0 0;
          }
        }
      `}</style>
    </>
  )
}

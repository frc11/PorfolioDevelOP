'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { AvatarRenderer, getAvatarRenderSize } from './avatar'
import { deriveBusinessInitials } from '../shared/businessInitials'
import { CHATBOT_Z_INDEX } from '../shared/zIndex'
import { ChatWindow } from './chat/ChatWindow'
import { ProactiveTooltip } from './tooltip'
import { renderToolCall } from './tool-cards'
import { useChatbot } from '../hooks/useChatbot'
import { useChatbotSounds } from '../hooks/useChatbotSounds'
import type { ToolCallInUIMessage } from './chat/types'
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
  const chatbot = useChatbot({ slug, currentPath: pathname })
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

  if (chatbot.isLoading || !chatbot.config) return null

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
        aria-label={chatbot.isOpen ? 'Cerrar chat' : 'Abrir chat'}
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
          {!chatbot.isOpen && (
            <ProactiveTooltip
              config={chatbot.config}
              currentPath={pathname}
              onAccept={chatbot.acceptProactivePrompt}
              onDismiss={() => {}}
            />
          )}
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

'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { AvatarRenderer } from './avatar'
import { ChatWindowV2 as ChatWindow } from './chat/ChatWindowV2'
import { ProactiveTooltip } from './tooltip'
import { renderToolCall } from './tool-cards'
import { useChatbot } from '../hooks/useChatbot'
import type { ToolCallInUIMessage } from './chat/types'

interface LogicCompanionProps {
  slug: string
}

export function LogicCompanion({ slug }: LogicCompanionProps) {
  const pathname = usePathname() ?? '/'
  const chatbot = useChatbot({ slug, currentPath: pathname })

  if (chatbot.isLoading || !chatbot.config) return null

  const position =
    chatbot.config.position === 'bottom_left'
      ? { bottom: 24, left: 24 }
      : { bottom: 24, right: 24 }

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
            degradedMode={chatbot.degradedMode}
            renderToolCall={(tc: ToolCallInUIMessage) =>
              renderToolCall(tc, chatbot.config!, {
                onSelectWhatsapp: chatbot.triggerWhatsappHandoff,
                onSelectCallback: chatbot.triggerCallbackHandoff,
                onNavigate: chatbot.navigateTo,
              })
            }
          />
        )}
      </AnimatePresence>

      <motion.div
        data-chatbot-avatar
        role="button"
        tabIndex={0}
        onClick={chatbot.toggle}
        aria-label={chatbot.isOpen ? 'Cerrar chat' : 'Abrir chat'}
        style={{
          position: 'fixed',
          ...position,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: '50%',
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      >
        <div className="relative w-full h-full">
          <AvatarRenderer
            style={chatbot.config.avatarStyle}
            state={chatbot.avatarState}
            accentColor={chatbot.config.accentColor}
            size={56}
            avatarImageUrl={chatbot.config.avatarImageUrl}
            avatarEmoji={chatbot.config.avatarEmoji}
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
    </>
  )
}

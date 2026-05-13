'use client'

import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChatHeader } from './ChatHeader'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { QuickReplyChips } from './QuickReplyChips'
import { DegradedBanner } from './DegradedBanner'
import type { ChatWindowProps, UIChatMessage } from './types'

const RADIUS_MAP: Record<string, string> = {
  small: '12px',
  medium: '20px',
  large: '28px',
}

const POSITION_MAP: Record<string, Record<string, number>> = {
  bottom_right: { bottom: 24, right: 24 },
  bottom_left: { bottom: 24, left: 24 },
}

interface ChatWindowFullProps extends ChatWindowProps {
  /** Optional renderer for tool-call cards inside assistant messages. */
  renderToolCall?: (
    toolCall: NonNullable<UIChatMessage['toolCalls']>[number]
  ) => ReactNode
}

export function ChatWindow({
  config,
  messages,
  isStreaming,
  avatarState,
  onSendMessage,
  onClose,
  onQuickReply,
  degradedMode,
  renderToolCall,
}: ChatWindowFullProps) {
  const radius = RADIUS_MAP[config.borderRadius] ?? '20px'
  const position = POSITION_MAP[config.position] ?? POSITION_MAP.bottom_right

  const tint = config.chatSurfaceTint ?? `${config.accentColor}0A`

  const showQuickReplies =
    !degradedMode && messages.filter((m) => m.role === 'user').length === 0

  return (
    <AnimatePresence>
      <motion.div
        key="chat-window"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'fixed',
          ...position,
          width: 'min(380px, calc(100vw - 32px))',
          height: 'min(600px, calc(100vh - 120px))',
          borderRadius: radius,
          background: `linear-gradient(180deg, rgba(15,15,18,0.92), rgba(8,8,10,0.96)), ${tint}`,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: `1px solid ${config.accentColor}26`,
          boxShadow: `0 24px 48px -16px rgba(0,0,0,0.6), 0 0 32px ${config.accentColor}1A`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9998,
        }}
      >
        <ChatHeader
          config={config}
          avatarState={avatarState}
          isStreaming={isStreaming}
          onClose={onClose}
        />

        {degradedMode && (
          <DegradedBanner
            whatsappNumber={config.whatsappNumber}
            onWhatsappClick={() => {
              if (config.whatsappNumber) {
                window.open(`https://wa.me/${config.whatsappNumber}`, '_blank')
              }
            }}
          />
        )}

        <ChatMessages
          messages={messages}
          config={config}
          renderToolCall={renderToolCall}
        />

        {showQuickReplies && (
          <QuickReplyChips config={config} onSelect={onQuickReply} />
        )}

        <ChatInput
          config={config}
          onSubmit={onSendMessage}
          disabled={degradedMode}
        />
      </motion.div>
    </AnimatePresence>
  )
}

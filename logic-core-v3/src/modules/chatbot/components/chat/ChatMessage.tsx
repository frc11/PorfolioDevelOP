'use client'

import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import type { UIChatMessage } from './types'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface ChatMessageProps {
  message: UIChatMessage
  config: PublicBotConfig
  /** Renderer for tool calls — provided by parent. */
  renderToolCall?: (toolCall: NonNullable<UIChatMessage['toolCalls']>[number]) => ReactNode
}

export function ChatMessage({ message, config, renderToolCall }: ChatMessageProps) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
    >
      <div className="flex flex-col gap-1.5 max-w-[85%]">
        <div
          className="px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words"
          style={{
            background: isUser
              ? `${config.accentColor}26`
              : 'rgba(255,255,255,0.06)',
            border: `1px solid ${
              isUser ? `${config.accentColor}40` : 'rgba(255,255,255,0.08)'
            }`,
            color: 'white',
            borderRadius:
              config.bubbleStyle === 'sharp'
                ? '6px'
                : config.bubbleStyle === 'pill'
                ? '20px'
                : '12px',
          }}
        >
          {message.content || (isUser ? '' : '…')}
        </div>

        {/* Tool calls rendered below the text */}
        {message.toolCalls && renderToolCall && (
          <div className="flex flex-col gap-2">
            {message.toolCalls.map((tc) => (
              <div key={tc.toolCallId}>{renderToolCall(tc)}</div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

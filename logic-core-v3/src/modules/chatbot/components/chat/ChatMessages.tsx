'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { ChatMessage } from './ChatMessage'
import type { UIChatMessage } from './types'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface ChatMessagesProps {
  messages: UIChatMessage[]
  config: PublicBotConfig
  renderToolCall?: (
    toolCall: NonNullable<UIChatMessage['toolCalls']>[number]
  ) => ReactNode
}

export function ChatMessages({ messages, config, renderToolCall }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
      style={{ scrollBehavior: 'smooth' }}
    >
      {messages.map((m) => (
        <ChatMessage
          key={m.id}
          message={m}
          config={config}
          renderToolCall={renderToolCall}
        />
      ))}
    </div>
  )
}

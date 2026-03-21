'use client'

import { useActionState, useEffect, useRef } from 'react'
import { sendClientMessageAction } from '@/lib/actions/messages'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  content: string
  fromAdmin: boolean
  createdAt: Date
}

interface MessageThreadProps {
  messages: Message[]
}

function formatTime(date: Date) {
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageThread({ messages }: MessageThreadProps) {
  const [error, action, isPending] = useActionState(sendClientMessageAction, null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Clear form and re-scroll after successful send
  useEffect(() => {
    if (!isPending && !error) {
      formRef.current?.reset()
    }
  }, [isPending, error])

  return (
    <div
      className="flex flex-1 flex-col gap-0 overflow-hidden rounded-xl"
      style={{
        border: '1px solid rgba(6,182,212,0.2)',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Message list */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
        {messages.length === 0 && (
          <p className="text-center text-sm text-zinc-600">
            Todavía no hay mensajes. ¡Escribinos para comenzar!
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.fromAdmin ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={[
                'max-w-[75%] rounded-xl px-4 py-2.5',
                msg.fromAdmin
                  ? 'rounded-tl-sm text-zinc-100'
                  : 'rounded-tr-sm bg-cyan-500/20 text-white',
              ].join(' ')}
            style={
              msg.fromAdmin
                ? {
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(4px)',
                  }
                : {
                    border: '1px solid rgba(6,182,212,0.3)',
                    background: 'rgba(6,182,212,0.15)',
                  }
            }
            >
              {msg.fromAdmin && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                  DevelOP
                </p>
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p
                className={`mt-1 text-[10px] ${
                  msg.fromAdmin ? 'text-zinc-500' : 'text-cyan-200/70'
                }`}
              >
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {error && (
          <p className="mb-2 text-xs text-red-400">{error}</p>
        )}
        <form ref={formRef} action={action} className="flex items-end gap-2">
          <textarea
            name="content"
            placeholder="Escribí tu mensaje..."
            rows={2}
            disabled={isPending}
            className="flex-1 resize-none rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(4px)',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{
              background: 'rgba(6,182,212,0.3)',
              border: '1px solid rgba(6,182,212,0.4)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </form>
        <p className="mt-1.5 text-[10px] text-zinc-600">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}

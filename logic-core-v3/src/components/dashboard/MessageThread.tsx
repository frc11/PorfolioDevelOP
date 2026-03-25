'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { sendClientMessageAction } from '@/lib/actions/messages'
import { Send, Loader2, MessageSquare, Sparkles, ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const suggestions = [
    { label: 'Solicitar nueva función', icon: '🚀', text: 'Hola equipo! Me gustaría solicitar una nueva función para mi plataforma: ' },
    { label: 'Agendar reunión técnica', icon: '📅', text: 'Hola! Necesito agendar una reunión técnica para revisar el avance del proyecto.' },
    { label: 'Reportar un problema', icon: '🛠️', text: 'Hola! Encontré un pequeño detalle que me gustaría reportar: ' }
  ]

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Clear form and re-scroll after successful send
  useEffect(() => {
    if (!isPending && !error) {
      formRef.current?.reset()
      setInputValue('')
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
      <div className="relative flex flex-1 flex-col gap-3 overflow-y-auto p-5">
        {/* Support Status Indicator */}
        <div className="sticky top-0 z-20 -mx-5 -mt-5 mb-4 border-b border-white/5 bg-white/[0.02] px-5 py-2 backdrop-blur-md">
          <div className="flex items-center justify-end gap-3 text-[9px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              Equipo en línea
            </div>
            <span className="text-zinc-500">
              Respuesta prom: <span className="text-zinc-300">{'< 15 min'}</span>
            </span>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
              {/* Icon Glow */}
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-md">
                <MessageSquare size={32} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-400 animate-bounce" />
              </div>
            </div>
            
            <div className="max-w-sm space-y-3">
              <h3 className="text-base font-black tracking-tight text-white uppercase italic">
                Tu equipo de DevelOP está a un mensaje de distancia
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                ¿Necesitás una nueva función o tenés alguna duda? Escribinos ahora para coordinar el próximo paso de tu proyecto.
              </p>
              
              <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/60">
                <div className="h-1 w-1 rounded-full bg-cyan-500 animate-ping" />
                Soporte en tiempo real activo
              </div>
            </div>
          </div>
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

        {/* Suggestion Pills */}
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setInputValue(s.text)}
              className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/20 backdrop-blur-sm"
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        <form ref={formRef} action={action} className="flex items-end gap-3 bg-white/[0.02] p-2 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl transition-all focus-within:border-cyan-500/30 focus-within:ring-2 focus-within:ring-cyan-500/20">
          <textarea
            name="content"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribí tu mensaje..."
            rows={1}
            disabled={isPending}
            className="flex-1 min-h-[44px] max-h-32 resize-none bg-transparent px-3 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
          <motion.button
            type="submit"
            disabled={isPending || !inputValue.trim()}
            animate={inputValue.trim() ? { y: [0, -4, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30 disabled:grayscale ${
              inputValue.trim() 
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105' 
                : 'bg-white/5 text-zinc-600'
            }`}
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowUp size={18} className="stroke-[3]" />
            )}
          </motion.button>
        </form>
        <p className="mt-1.5 text-[10px] text-zinc-600">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}

'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { sendClientMessageAction } from '@/lib/actions/messages'
import { Send, Loader2, CheckCheck, ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  content: string
  fromAdmin: boolean
  read: boolean
  createdAt: Date
}

interface MessageThreadProps {
  messages: Message[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Returns team online status based on Argentina time (UTC-3, Mon-Fri 9-18hs) */
function getTeamStatus(): { online: boolean; label: string } {
  // Argentina is UTC-3 (no DST)
  const now = new Date()
  const argOffset = -3 * 60 // minutes
  const argMs = now.getTime() + (now.getTimezoneOffset() + argOffset) * 60_000
  const arg = new Date(argMs)
  const day = arg.getDay()  // 0=Sun … 6=Sat
  const hour = arg.getHours()

  const isWeekday = day >= 1 && day <= 5
  const isWorkHours = hour >= 9 && hour < 18

  return isWeekday && isWorkHours
    ? { online: true, label: 'Equipo en línea' }
    : { online: false, label: 'Respondemos en < 4 horas' }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  {
    emoji: '📋',
    label: 'Solicitar actualización del proyecto',
    text: 'Hola, quería consultar cómo va el estado del proyecto. ¿Hay novedades?',
  },
  {
    emoji: '🐛',
    label: 'Reportar un problema',
    text: 'Hola, quiero reportar un problema: [describí el problema acá]',
  },
  {
    emoji: '💡',
    label: 'Tengo una idea / nueva función',
    text: 'Hola, se me ocurrió una mejora que podría ser útil: [describí tu idea acá]',
  },
] as const

const WELCOME_MESSAGE =
  '👋 ¡Hola! Somos el equipo de develOP. Estamos acá para ayudarte con cualquier consulta sobre tu proyecto. ¿En qué podemos ayudarte?'

// ─── Component ────────────────────────────────────────────────────────────────

export function MessageThread({ messages }: MessageThreadProps) {
  const [error, action, isPending] = useActionState(sendClientMessageAction, null)
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const status = getTeamStatus()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      {/* ── Status header ───────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-xs font-medium text-zinc-300">develOP — Soporte</p>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
              status.online
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              {status.online && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  status.online ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            {status.label}
          </div>

          <span className="text-[10px] text-zinc-500">
            Resp. promedio:{' '}
            <span className="text-zinc-300">{'< 15 min'}</span>
          </span>
        </div>
      </div>

      {/* ── Message list ────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col gap-3 overflow-y-auto p-5">
        {/* Welcome message (always shown when thread is empty) */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-start"
          >
            <div
              className="max-w-[78%] rounded-xl rounded-tl-sm px-4 py-3"
              style={{
                border: '1px solid rgba(6,182,212,0.25)',
                background:
                  'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.05) 100%)',
              }}
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                DevelOP
              </p>
              <p className="text-sm leading-relaxed text-zinc-100">
                {WELCOME_MESSAGE}
              </p>
              <p className="mt-1.5 text-[10px] text-zinc-500">Ahora mismo</p>
            </div>
          </motion.div>
        )}

        {/* Real messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i === messages.length - 1 ? 0 : 0 }}
              className={`flex ${msg.fromAdmin ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={[
                  'max-w-[75%] rounded-xl px-4 py-2.5',
                  msg.fromAdmin
                    ? 'rounded-tl-sm text-zinc-100'
                    : 'rounded-tr-sm text-white',
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

                {/* Timestamp + read indicator */}
                <div
                  className={`mt-1 flex items-center gap-1.5 ${
                    msg.fromAdmin ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <p
                    className={`text-[10px] ${
                      msg.fromAdmin ? 'text-zinc-500' : 'text-cyan-200/70'
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                  {msg.fromAdmin && msg.read && (
                    <span className="flex items-center gap-0.5 text-[10px] text-cyan-400/70">
                      <CheckCheck size={11} />
                      Visto
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area ──────────────────────────────────────────────────── */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

        {/* Quick reply buttons */}
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_REPLIES.map((qr) => (
            <motion.button
              key={qr.label}
              type="button"
              onClick={() => setInputValue(qr.text)}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 backdrop-blur-sm transition-colors hover:border-cyan-500/25 hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              <span>{qr.emoji}</span>
              {qr.label}
            </motion.button>
          ))}
        </div>

        {/* Text input + send */}
        <form
          ref={formRef}
          action={action}
          className="flex items-end gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2 shadow-2xl backdrop-blur-md transition-all focus-within:border-cyan-500/30 focus-within:ring-2 focus-within:ring-cyan-500/20"
        >
          <textarea
            name="content"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribí tu mensaje..."
            rows={1}
            disabled={isPending}
            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all disabled:opacity-50"
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
            animate={inputValue.trim() ? { y: [0, -3, 0], scale: [1, 1.08, 1] } : {}}
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

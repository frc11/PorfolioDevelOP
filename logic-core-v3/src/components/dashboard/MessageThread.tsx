'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sendClientMessageAction } from '@/lib/actions/messages'
import { Loader2, MessageSquareText, SendHorizontal } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ActionResult } from '@/lib/actions/schemas'
import { getMessageForContext } from '@/lib/data/message-context'
import { EmojiPopover } from './EmojiPopover'
import { ClientChatThread, type ChatMessage } from './ClientChatThread'

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
  organizationName: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEXTAREA_MAX_ROWS = 3

const QUICK_REPLIES = [
  {
    label: 'Solicitar actualización del proyecto',
    context: 'proyecto',
  },
  {
    label: 'Reportar un problema',
    context: 'bug',
  },
  {
    label: 'Tengo una idea / nueva función',
    context: 'mejora',
  },
] as const

const WELCOME_MESSAGE =
  '👋 ¡Hola! Somos el equipo de develOP. Estamos acá para ayudarte con cualquier consulta sobre tu proyecto. ¿En qué podemos ayudarte?'

// ─── Component ────────────────────────────────────────────────────────────────

export function MessageThread({ messages, organizationName }: MessageThreadProps) {
  const [state, action, isPending] = useActionState<ActionResult | null, FormData>(sendClientMessageAction, null)
  const [inputValue, setInputValue] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const reduce = useReducedMotion()

  // Mapeo al molde compartido: fromAdmin → isAgency (develOP a la izquierda,
  // cliente a la derecha). La fuente de datos (tabla Message) NO se comparte con
  // el chat del Ticket; sólo el componente visual.
  const chatMessages = useMemo<ChatMessage[]>(
    () =>
      messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        isAgency: msg.fromAdmin,
        authorLabel: msg.fromAdmin ? 'DevelOP' : organizationName,
        createdAt: msg.createdAt,
      })),
    [messages, organizationName],
  )

  useEffect(() => {
    const context = searchParams.get('context')
    const moduleName = searchParams.get('moduleName')

    if (!context && !moduleName) return

    const prefilledMessage = getMessageForContext(
      context,
      moduleName ? { moduleName } : undefined,
    )

    if (prefilledMessage) {
      setInputValue(prefilledMessage)
    }

    router.replace('/dashboard/messages', { scroll: false })
  }, [router, searchParams])

  useEffect(() => {
    if (!isPending && state?.success) {
      formRef.current?.reset()
      setInputValue('')
    }
  }, [isPending, state])

  // Auto-expand: crece con el contenido hasta TEXTAREA_MAX_ROWS, luego scrollea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const styles = window.getComputedStyle(el)
    const lineHeight = parseFloat(styles.lineHeight) || 24
    const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
    const maxHeight = lineHeight * TEXTAREA_MAX_ROWS + paddingY
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [inputValue])

  function insertEmoji(emoji: string) {
    const el = textareaRef.current
    if (!el) {
      setInputValue((v) => v + emoji)
      return
    }
    // Inserta en la posición del cursor y restaura el caret tras el re-render
    const start = el.selectionStart ?? inputValue.length
    const end = el.selectionEnd ?? inputValue.length
    setInputValue(inputValue.slice(0, start) + emoji + inputValue.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      const caret = start + emoji.length
      el.setSelectionRange(caret, caret)
    })
  }

  return (
    <ClientChatThread
      messages={chatMessages}
      scrollTrigger={messages.length}
      header={
        /* ── Header card ─────────────────────────────────────────────────── */
        <div className="shrink-0 rounded-[24px] border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                <MessageSquareText className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  Conversación activa
                </p>
                <p className="text-base font-semibold tracking-tight text-white">
                  develOP — Soporte
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Respondemos en {'< 4 hs'}
              </div>

              <span className="hidden text-[10px] text-zinc-500 sm:inline">
                Lun–Vie{' '}
                <span className="text-zinc-300">9–18hs</span>
              </span>
            </div>
          </div>
        </div>
      }
      subHeader={
        /* Sub-header: message count */
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <MessageSquareText className="h-4 w-4 text-cyan-300" strokeWidth={1.5} />
            <span>{messages.length} mensajes en la conversación</span>
          </div>
        </div>
      }
      emptyState={
        /* Welcome message (shown when thread is empty) */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-start"
        >
          <motion.div
            whileHover={
              reduce
                ? undefined
                : { scale: 1.015, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }
            }
            className="max-w-[85%] rounded-[24px] border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-cyan-50 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-shadow hover:ring-1 hover:ring-white/15 sm:max-w-[70%]"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
              <span>DevelOP</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500">Ahora mismo</span>
            </div>
            <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6">{WELCOME_MESSAGE}</p>
          </motion.div>
        </motion.div>
      }
      composer={
        /* ── Input area ──────────────────────────────────────────────────── */
        <div className="shrink-0 rounded-[24px] border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
          {state?.error && (
            <div className="mb-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
              {state.error}
            </div>
          )}

          {/* Quick reply buttons — conservados */}
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_REPLIES.map((qr) => (
              <motion.button
                key={qr.label}
                type="button"
                onClick={() => setInputValue(getMessageForContext(qr.context))}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 backdrop-blur-sm transition-colors hover:border-cyan-500/25 hover:bg-cyan-500/10 hover:text-cyan-300"
              >
                {qr.label}
              </motion.button>
            ))}
          </div>

          {/* Composer */}
          <form ref={formRef} action={action}>
            <div className="flex items-end gap-2">
              <EmojiPopover onPick={insertEmoji} disabled={isPending} />
              <textarea
                ref={textareaRef}
                name="content"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribí tu mensaje..."
                rows={1}
                disabled={isPending}
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35 disabled:cursor-not-allowed disabled:opacity-60"
                onKeyDown={(e) => {
                  // isComposing: no enviar mientras se confirma la composición IME (acentos, dead-keys)
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    e.currentTarget.form?.requestSubmit()
                  }
                }}
              />
              <button
                type="submit"
                disabled={isPending || !inputValue.trim()}
                aria-label="Enviar mensaje"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <SendHorizontal className="h-4 w-4" strokeWidth={1.5} />
                )}
                <span className="hidden sm:inline">{isPending ? 'Enviando...' : 'Enviar'}</span>
              </button>
            </div>
          </form>

          <p className="mt-1.5 text-[10px] text-zinc-600">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      }
    />
  )
}

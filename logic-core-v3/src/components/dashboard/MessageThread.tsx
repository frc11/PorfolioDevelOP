'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sendClientMessageAction } from '@/lib/actions/messages'
import { MessageSquareText } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ActionResult } from '@/lib/actions/schemas'
import { getMessageForContext } from '@/lib/data/message-context'
import { ClientChatThread, type ChatMessage } from './ClientChatThread'
import { ClientChatComposer } from './ClientChatComposer'

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
        <ClientChatComposer
          value={inputValue}
          onValueChange={setInputValue}
          action={action}
          isPending={isPending}
          state={state}
          aboveForm={
            /* Quick reply buttons — conservados (exclusivos de Mensajes) */
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
          }
        />
      }
    />
  )
}

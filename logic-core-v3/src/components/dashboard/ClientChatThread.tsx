'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence } from 'motion/react'
import { ChatBubble, type ChatMessage } from './ChatBubble'

export type { ChatMessage }

export interface ClientChatThreadProps {
  /** Mensajes ya normalizados por el caller. La fuente de datos NO se comparte. */
  messages: ChatMessage[]
  /** Banda superior opcional (header card). Cada superficie pasa el suyo. */
  header?: ReactNode
  /** Banda dentro del card, sobre el scroll (ej. contador "{n} mensajes"). */
  subHeader?: ReactNode
  /** Se muestra SÓLO cuando no hay mensajes (welcome bubble / placeholder vacío). */
  emptyState?: ReactNode
  /** Subtree del composer: cada superficie inyecta su input + su propio send-path. */
  composer?: ReactNode
  /** Cambiá este token para re-disparar el scroll-to-bottom (ej. messages.length). */
  scrollTrigger?: string | number
  /** Clases extra para el contenedor externo (la PÁGINA es dueña de la altura). */
  className?: string
}

/**
 * Molde de chat compartido del portal cliente — presentacional puro.
 * No importa Prisma ni server actions: recibe mensajes ya normalizados y delega
 * el envío al `composer`. Lo usan Mensajes y el chat del Ticket con SUS PROPIOS
 * datos; nunca se mezclan (ver lane/client-chat-shared).
 */
export function ClientChatThread({
  messages,
  header,
  subHeader,
  emptyState,
  composer,
  scrollTrigger,
  className,
}: ClientChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [scrollTrigger])

  return (
    <div className={['flex min-h-0 flex-1 flex-col gap-3', className].filter(Boolean).join(' ')}>
      {header}

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
        {subHeader}

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-5 py-5">
          {messages.length === 0 && emptyState}

          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* Auto-scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </section>

      {composer}
    </div>
  )
}

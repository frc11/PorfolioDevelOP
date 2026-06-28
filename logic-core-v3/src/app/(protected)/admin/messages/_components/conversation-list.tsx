'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'motion/react'
import { MessageCircleMore } from 'lucide-react'
import { EmptyStateMuted } from '@/components/ui/EmptyStateMuted'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { activeOrgIdFromPath } from './active-org'

type Conversation = {
  organizationId: string
  companyName: string
  slug: string
  lastMessage: {
    id: string
    content: string
    fromAdmin: boolean
    read: boolean
    createdAt: string
  } | null
  unreadCount: number
  totalMessages: number
}

type ConversationListProps = {
  conversations: Conversation[]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function ConversationList({ conversations }: ConversationListProps) {
  const reduce = useReducedMotion()
  const pathname = usePathname()
  const activeOrgId = activeOrgIdFromPath(pathname)

  // Badge optimista RECONCILIADO: por cada conversación que abrís, recordamos el
  // id de su último mensaje "visto". El badge se suprime mientras el server no
  // traiga un mensaje MÁS nuevo que ese id. Así: se limpia al instante al abrir,
  // NO parpadea al salir antes de que revalide, y si entra un mensaje nuevo a una
  // conversación ya abierta, el badge REAPARECE (lastMessage.id avanza). El init
  // va vacío: la conversación activa ya se suprime por !isActive (sin esperar al
  // effect), y el effect llena el mapa a medida que navegás (sin remontar).
  const [seenLastId, setSeenLastId] = useState<Map<string, string | null>>(new Map())

  useEffect(() => {
    if (!activeOrgId) return
    const conv = conversations.find((c) => c.organizationId === activeOrgId)
    if (!conv) return
    const lastId = conv.lastMessage?.id ?? null
    setSeenLastId((prev) => {
      if (prev.has(activeOrgId) && prev.get(activeOrgId) === lastId) return prev
      const next = new Map(prev)
      next.set(activeOrgId, lastId)
      return next
    })
  }, [activeOrgId, conversations])

  if (conversations.length === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <EmptyStateMuted
          icon={MessageCircleMore}
          title="No hay conversaciones activas"
          description="Cuando los clientes escriban desde el portal, sus mensajes aparecerán acá."
        />
      </div>
    )
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Conversaciones</p>
        <p className="mt-2 text-sm text-zinc-400">
          {conversations.length} conversaciones con historial
        </p>
      </div>

      <motion.div
        className="min-h-0 flex-1 overflow-y-auto"
        variants={staggerContainer}
        initial={reduce ? false : 'hidden'}
        animate="visible"
      >
        {conversations.map((conversation, index) => {
          const isActive = activeOrgId === conversation.organizationId
          const isLast = index === conversations.length - 1
          const lastId = conversation.lastMessage?.id ?? null
          const seen = seenLastId.get(conversation.organizationId)
          const optimisticallyRead = seen !== undefined && seen === lastId
          const showUnread =
            conversation.unreadCount > 0 && !isActive && !optimisticallyRead

          return (
            <motion.div key={conversation.organizationId} variants={staggerItem}>
              <Link
                href={`/admin/messages/${conversation.organizationId}`}
                className={[
                  'group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5',
                  isActive ? 'bg-cyan-500/10' : '',
                ].join(' ')}
                style={{
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-sm font-semibold text-zinc-100">
                  {conversation.companyName[0]?.toUpperCase() ?? 'C'}
                  {showUnread ? (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-[#081018] bg-cyan-400" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-white">
                      {conversation.companyName}
                    </p>
                    {conversation.lastMessage ? (
                      <span className="shrink-0 text-[11px] text-zinc-500">
                        {formatDate(conversation.lastMessage.createdAt)}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 truncate text-sm text-zinc-400">
                    {conversation.lastMessage ? (
                      <>
                        {conversation.lastMessage.fromAdmin ? 'Admin: ' : ''}
                        {conversation.lastMessage.content}
                      </>
                    ) : (
                      'Todavía no hay mensajes en esta conversación.'
                    )}
                  </p>
                </div>

                {showUnread ? (
                  <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/15 px-2 py-1 text-[11px] font-semibold text-cyan-100">
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </span>
                ) : null}
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}

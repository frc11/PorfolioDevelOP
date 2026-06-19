import { MessageSquareText } from 'lucide-react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MessageInput } from '../_components/message-input'
import { MessageThread } from '../_components/message-thread'
import { getConversation, markAsRead } from '../_actions/message.actions'

type MessageConversationPageProps = {
  params: Promise<{
    orgId: string
  }>
}

/**
 * Detalle de conversación = panel derecho (thread + composer). La lista la pone
 * el layout persistente; acá solo cambia el children al navegar. markAsRead
 * sigue corriendo server-side (el badge se limpia optimista en la lista).
 */
export default async function AgencyOsMessageConversationPage({
  params,
}: MessageConversationPageProps) {
  const { orgId } = await params

  await markAsRead(orgId)

  const [organization, conversationResult] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        companyName: true,
      },
    }),
    getConversation(orgId),
  ])

  if (!organization) {
    notFound()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0 rounded-[24px] border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
            <MessageSquareText className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Conversación activa
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              {organization.companyName}
            </h1>
          </div>
        </div>
      </div>

      {!conversationResult.success ? (
        <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {conversationResult.error}
        </div>
      ) : (
        <>
          {/* key={orgId}: fuerza remount del thread por conversación para que el
              auto-scroll-to-bottom (MessagesScrollAnchor, scroll on mount) corra
              al cambiar de chat, ya que la lista/layout persisten. */}
          <MessageThread
            key={orgId}
            companyName={organization.companyName}
            messages={conversationResult.data}
          />
          <MessageInput organizationId={organization.id} />
        </>
      )}
    </div>
  )
}

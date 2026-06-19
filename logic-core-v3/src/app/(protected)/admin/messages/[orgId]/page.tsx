import { MessageSquareText } from 'lucide-react'
import { AdminBackButton } from '../../_components/AdminBackButton'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ConversationList } from '../_components/conversation-list'
import { MessageInput } from '../_components/message-input'
import { MessageThread } from '../_components/message-thread'
import { getConversation, listConversations, markAsRead } from '../_actions/message.actions'

type MessageConversationPageProps = {
  params: Promise<{
    orgId: string
  }>
}

export default async function AgencyOsMessageConversationPage({
  params,
}: MessageConversationPageProps) {
  const { orgId } = await params

  await markAsRead(orgId)

  const [organization, conversationsResult, conversationResult] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        companyName: true,
        slug: true,
      },
    }),
    listConversations(),
    getConversation(orgId),
  ])

  if (!organization) {
    notFound()
  }

  return (
    <section className="flex h-[calc(100dvh_-_228px)] min-h-0 flex-col gap-4 overflow-hidden sm:h-[calc(100dvh_-_200px)]">
      <div className="shrink-0 lg:hidden">
        <AdminBackButton href="/admin/messages" label="Volver a mensajes" />
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="hidden min-h-0 lg:flex lg:flex-col">
          {conversationsResult.success ? (
            <ConversationList conversations={conversationsResult.data} activeOrganizationId={orgId} />
          ) : (
            <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
              {conversationsResult.error}
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-3">
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
              <MessageThread
                companyName={organization.companyName}
                messages={conversationResult.data}
              />
              <MessageInput organizationId={organization.id} />
            </>
          )}
        </div>
      </div>
    </section>
  )
}

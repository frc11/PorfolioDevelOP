import Link from 'next/link'
import { ChevronLeft, MessageSquareText } from 'lucide-react'
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
    <section className="space-y-5">
      <div className="flex items-center gap-3 lg:hidden">
        <Link
          href="/admin/os/messages"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a mensajes
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          {conversationsResult.success ? (
            <ConversationList
              conversations={conversationsResult.data}
              activeOrganizationId={orgId}
              compact
            />
          ) : (
            <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
              {conversationsResult.error}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                <MessageSquareText className="h-6 w-6" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  Conversacion activa
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {organization.companyName}
                </h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Canal directo con el cliente, sin estado de ticket y con historial cronológico.
                </p>
              </div>
            </div>
          </div>

          {!conversationResult.success ? (
            <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
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

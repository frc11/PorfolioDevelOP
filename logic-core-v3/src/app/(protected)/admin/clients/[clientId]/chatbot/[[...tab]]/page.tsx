import { permanentRedirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { TabId } from '@/app/(protected)/admin/chatbots/[botId]/tabs'

const TAB_MAP: Record<string, TabId> = {
  overview: 'overview',
  config: 'config',
  knowledge: 'knowledge',
  conversations: 'conversations',
  leads: 'leads',
  activity: 'activity',
}

export default async function DeprecatedChatbotRedirect({
  params,
}: {
  params: Promise<{ clientId: string; tab?: string[] }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    permanentRedirect('/login')
  }

  const { clientId, tab } = await params
  const orgSlug = clientId

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { botConfig: { select: { id: true } } },
  })

  if (!org?.botConfig) notFound()

  const requested = tab?.[0]
  const targetTab: TabId = requested && TAB_MAP[requested] ? TAB_MAP[requested] : 'overview'

  permanentRedirect(`/admin/chatbots/${org.botConfig.id}?tab=${targetTab}`)
}

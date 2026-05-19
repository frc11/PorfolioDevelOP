import { redirect } from 'next/navigation'
import { Bot } from 'lucide-react'
import { auth } from '@/auth'
import { EmptyState } from '@/components/ui/EmptyState'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { BotPersonalization } from '@/modules/chatbot/components/dashboard/BotPersonalization'

export const dynamic = 'force-dynamic'

export default async function ChatbotSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const orgId = await resolveOrgId()
  if (!orgId) redirect('/login')

  const bot = await prisma.botConfig.findUnique({
    where: { organizationId: orgId },
    select: {
      id: true,
      accentColor: true,
      position: true,
      avatarStyle: true,
      avatarEmoji: true,
      botName: true,
      welcomeMessage: true,
      quickReplies: true,
    },
  })

  if (!bot) {
    return (
      <EmptyState
        icon={Bot}
        title="Todavia no tenes chatbot"
        description="Cuando develOP active tu chatbot, vas a poder personalizarlo desde aca."
      />
    )
  }

  return <BotPersonalization bot={bot} />
}

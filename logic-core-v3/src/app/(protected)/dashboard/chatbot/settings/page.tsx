import { redirect } from 'next/navigation'
import { Bot } from 'lucide-react'
import { auth } from '@/auth'
import { unstable_cache } from 'next/cache'
import { EmptyState } from '@/components/ui/EmptyState'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { BotPersonalization } from '@/modules/chatbot/components/dashboard/BotPersonalization'
import { CrmStatusIndicator } from '@/modules/chatbot/components/dashboard/CrmStatusIndicator'

export const dynamic = 'force-dynamic'

export default async function ChatbotSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const orgId = await resolveOrgId()
  if (!orgId) redirect('/login')

  const bot = await unstable_cache(
    async () =>
      prisma.botConfig.findUnique({
        where: { organizationId: orgId },
        select: {
          id: true,
          // Editables por el cliente
          accentColor: true,
          position: true,
          avatarStyle: true,
          avatarEmoji: true,
          botName: true,
          welcomeMessage: true,
          quickReplies: true,
          // CC.4 — Campos configurados por admin que el preview consume
          // para ser un espejo fiel del widget real (no se editan acá).
          isActive: true,
          avatarImageUrl: true,
          accentSecondary: true,
          chatSurfaceTint: true,
          borderRadius: true,
          bubbleStyle: true,
          surfaceStyle: true,
          intensityLevel: true,
          fontStyle: true,
        },
      }),
    ['chatbot-bot-config', orgId],
    { revalidate: 60, tags: [`chatbot-config:${orgId}`] }
  )()

  if (!bot) {
    return (
      <EmptyState
        icon={Bot}
        title="Todavia no tenes chatbot"
        description="Cuando develOP active tu chatbot, vas a poder personalizarlo desde aca."
      />
    )
  }

  return (
    <div className="space-y-10">
      <BotPersonalization bot={bot} />
      {/* CC.2 — La config del CRM (webhook + secret) la maneja develOP desde el admin.
          El cliente solo ve el estado read-only acá. Gatekeep por plan vive adentro. */}
      <CrmStatusIndicator />
    </div>
  )
}

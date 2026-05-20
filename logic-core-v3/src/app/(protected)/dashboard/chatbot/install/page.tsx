import { redirect } from 'next/navigation'
import { getClientChatbotSession } from '@/modules/chatbot/index.server'
import { ClientInstallView } from './ClientInstallView'

export const dynamic = 'force-dynamic'

export default async function ChatbotInstallPage() {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  return (
    <ClientInstallView
      bot={{
        slug: session.bot.slug,
        botName: session.bot.botName,
        isActive: session.bot.isActive,
        allowedDomains: session.bot.allowedDomains,
      }}
    />
  )
}

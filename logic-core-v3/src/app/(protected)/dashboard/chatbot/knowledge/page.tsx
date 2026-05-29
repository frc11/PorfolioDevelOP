import { redirect } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { getClientChatbotSession } from '@/modules/chatbot/index.server'
import { prisma } from '@/lib/prisma'
import { ClientKnowledgeView } from '@/modules/chatbot/components/dashboard/ClientKnowledgeView'

export const dynamic = 'force-dynamic'

export default async function ClientKnowledgePage() {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  const kb = await unstable_cache(
    async () => prisma.knowledgeBase.findUnique({ where: { botConfigId: session.bot.id } }),
    ['chatbot-kb', session.bot.id],
    { revalidate: 60, tags: [`chatbot-kb:${session.bot.id}`] }
  )()

  if (!kb) redirect('/dashboard/chatbot')

  return <ClientKnowledgeView kb={kb} />
}

import { redirect } from 'next/navigation'
import { getClientChatbotSession } from '@/modules/chatbot/index.server'
import { prisma } from '@/lib/prisma'
import { ClientKnowledgeForm } from '@/modules/chatbot/components/dashboard/ClientKnowledgeForm'

export const dynamic = 'force-dynamic'

export default async function ClientKnowledgePage() {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  const kb = await prisma.knowledgeBase.findUnique({
    where: { botConfigId: session.bot.id },
  })

  if (!kb) redirect('/dashboard/chatbot')

  return <ClientKnowledgeForm kb={kb} />
}

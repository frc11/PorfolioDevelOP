import { redirect } from 'next/navigation'
import { getClientChatbotSession } from '@/modules/chatbot/index.server'
import { ClientSettingsForm } from '@/modules/chatbot/components/dashboard/ClientSettingsForm'

export default async function ClientSettingsPage() {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')
  return <ClientSettingsForm bot={session.bot} />
}

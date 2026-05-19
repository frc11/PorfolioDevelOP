import { redirect } from 'next/navigation'
import { getClientChatbotSession } from '@/modules/chatbot/server/admin/getClientSession'
import { listLeadsForBot } from '@/modules/chatbot/server/admin/queries'
import { LeadsTable } from '@/modules/chatbot/components/dashboards/LeadsTable'
import { PageHeader } from '@/components/ui'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientLeadsPage() {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  const rows = await listLeadsForBot(session.bot.id)

  const leads = rows.map((r) => ({
    ...r,
    name: r.name ?? 'Sin nombre',
    intent: r.intent ?? 'unknown',
    message: r.message ?? '',
  }))

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        eyebrow="Mi Chatbot"
        title="Leads del chatbot"
        description="Contactos capturados por el asistente de IA"
        icon={Users}
      />
      <LeadsTable leads={leads} />
    </div>
  )
}

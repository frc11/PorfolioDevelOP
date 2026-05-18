import { prisma } from '@/lib/prisma'
import { listLeadsForBot } from '@/modules/chatbot/server/admin/queries'
import { LeadsTable } from '@/modules/chatbot/components/dashboards/LeadsTable'
import { PageHeader } from '@/components/ui'
import { Users } from 'lucide-react'

export default async function ClientLeadsPage() {
  const bot = await prisma.botConfig.findUnique({ where: { slug: 'develop' } })
  if (!bot) return <div className="p-8 text-red-400">Bot no encontrado.</div>

  const leads = await listLeadsForBot(bot.id)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        eyebrow="Mi Chatbot"
        title="Leads del chatbot"
        description="Contactos capturados por el asistente de IA"
        icon={Users}
      />
      <LeadsTable leads={leads as never} />
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import { listLeadsForBot } from '@/modules/chatbot/server/admin/queries'
import { LeadsTable } from '@/modules/chatbot/components/dashboards/LeadsTable'

export default async function ClientLeadsPage() {
  const bot = await prisma.botConfig.findUnique({ where: { slug: 'develop' } })
  if (!bot) return <div className="p-8 text-red-400">Bot no encontrado.</div>

  const leads = await listLeadsForBot(bot.id)

  return (
    <div className="min-h-screen text-white">
      <h1 className="text-2xl font-light mb-6">Leads del chatbot</h1>
      <LeadsTable leads={leads as never} />
    </div>
  )
}

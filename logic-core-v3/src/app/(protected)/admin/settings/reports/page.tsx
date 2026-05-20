import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReportSettingsClient } from './ReportSettingsClient'

export default async function ReportSettingsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  const [totalBots, recentSends] = await Promise.all([
    prisma.botConfig.count({ where: { isActive: true } }),
    prisma.chatbotEvent.findMany({
      where: { type: 'REPORT.WEEKLY_SENT' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        botConfig: {
          select: {
            botName: true,
            slug: true,
            organization: { select: { companyName: true } },
          },
        },
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Settings · Reportes
        </p>
        <h1 className="text-3xl font-semibold text-zinc-100">Reportes semanales</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Resumen automático enviado cada lunes a todos los clientes con bot activo.
        </p>
      </div>

      <ReportSettingsClient
        totalActiveBots={totalBots}
        recentSends={recentSends.map((e) => ({
          id: e.id,
          botName: e.botConfig.botName,
          orgName: e.botConfig.organization.companyName,
          recipientEmail:
            (e.metadata as Record<string, unknown> | null)?.recipientEmail as string | null ?? null,
          sentAt: e.createdAt,
        }))}
      />
    </div>
  )
}

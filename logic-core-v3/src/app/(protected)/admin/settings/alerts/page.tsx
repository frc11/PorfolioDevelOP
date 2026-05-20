import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AlertSettingsClient } from './AlertSettingsClient'

export default async function AlertSettingsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  const [total, pending, last24h, recentAlerts] = await Promise.all([
    prisma.botAlert.count(),
    prisma.botAlert.count({ where: { status: 'PENDING' } }),
    prisma.botAlert.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.botAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Settings · Alertas
        </p>
        <h1 className="text-3xl font-semibold text-zinc-100">Sistema de alertas</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Configuración del detector automático y notificaciones.
        </p>
      </div>

      <AlertSettingsClient
        stats={{ total, pending, last24h }}
        recentAlerts={recentAlerts}
      />
    </div>
  )
}

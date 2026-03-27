import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { NotificacionesList } from '@/components/dashboard/NotificacionesList'

export default async function NotificacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const { filter } = await searchParams
  const showUnread = filter === 'unread'

  const notifications = await prisma.notification.findMany({
    where: {
      organizationId,
      ...(showUnread ? { read: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  const unreadCount = await prisma.notification.count({
    where: { organizationId, read: false },
  })

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Notificaciones</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Actualizaciones y alertas de tu proyecto
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400">
              {unreadCount} sin leer
            </span>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <NotificacionesList
          notifications={notifications}
          currentFilter={showUnread ? 'unread' : 'all'}
          unreadCount={unreadCount}
        />
      </FadeIn>
    </div>
  )
}

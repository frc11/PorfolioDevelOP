import Link from 'next/link'
export const dynamic = 'force-dynamic'
import { Users } from 'lucide-react'
import { DeleteClientButton } from '@/components/admin/DeleteClientButton'
import { HealthScoreDots } from '@/components/admin/HealthScoreDots'
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminSurface } from '@/components/admin/admin-ui'
import { prisma } from '@/lib/prisma'
import { daysSince, estimateLastLoginAt, getHealthScore, getLastConnectionTone } from '@/lib/client-health'
import { startImpersonationAction } from '@/lib/actions/impersonation'

function connectionLabel(days: number | null) {
  if (days === null) return 'Sin registro'
  if (days === 0) return 'Hoy'
  return `Hace ${days} días`
}

function connectionTone(days: number | null) {
  const tone = getLastConnectionTone(days)
  if (tone === 'success') return 'success' as const
  if (tone === 'warning') return 'warning' as const
  return 'danger' as const
}

export default async function ClientsPage() {
  const now = new Date()
  const recentApprovalThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const orgs = await prisma.organization.findMany({
    include: {
      members: {
        where: { role: 'ADMIN' },
        select: {
          userId: true,
          user: {
            select: {
              name: true,
              email: true,
              sessions: {
                orderBy: { expires: 'desc' },
                take: 1,
                select: { expires: true },
              },
            },
          },
        },
        take: 1,
      },
      services: { where: { status: 'ACTIVE' } },
      projects: true,
      messages: {
        where: { fromAdmin: false, read: false },
        select: { id: true },
      },
      tickets: {
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        select: { id: true },
      },
      subscription: {
        select: {
          price: true,
          currency: true,
          status: true,
        },
      },
      notifications: {
        where: {
          taskId: { not: null },
          createdAt: { gte: recentApprovalThreshold },
          OR: [
            { title: { contains: 'Aprobada' } },
            { message: { contains: 'ha aprobado' } },
            { message: { contains: 'aprobado' } },
          ],
        },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Gestión"
        title="Clientes"
        description={`${orgs.length} ${orgs.length === 1 ? 'registro' : 'registros'} activos en la consola`}
        action={
          <Link href="/admin/clients/new" className="admin-btn-primary">
            + Agregar cliente
          </Link>
        }
      />

      {orgs.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No hay clientes registrados todavía."
          description="Creá el primer cliente para empezar a operar el panel multi-tenant."
          ctaHref="/admin/clients/new"
          ctaLabel="Crear el primero →"
        />
      ) : (
        <AdminSurface className="overflow-x-auto p-0">
          <table className="admin-table min-w-[1180px]">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Email</th>
                <th className="text-center">Servicios</th>
                <th className="text-center">Proyectos</th>
                <th>Última conexión</th>
                <th className="text-center">Health Score</th>
                <th className="text-center">MRR</th>
                <th>Alta</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => {
                const adminUser = org.members[0]?.user
                const lastSession = adminUser?.sessions[0]?.expires
                const lastLoginAt = estimateLastLoginAt(lastSession)
                const lastConnectionDays = daysSince(lastLoginAt)
                const score = getHealthScore({
                  recentLogin: lastConnectionDays !== null && lastConnectionDays < 7,
                  unreadMessages: org.messages.length,
                  openTickets: org.tickets.length,
                  hasActiveSubscription: org.subscription?.status === 'ACTIVE',
                  recentApproval: org.notifications.length > 0,
                })

                return (
                  <tr key={org.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-sm font-semibold text-cyan-200">
                          {org.companyName[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-zinc-100">{org.companyName}</span>
                      </div>
                    </td>
                    <td className="text-zinc-500">{adminUser?.email ?? '—'}</td>
                    <td className="text-center">
                      <AdminStatusBadge label={String(org.services.length)} tone="info" className="min-w-8 justify-center" />
                    </td>
                    <td className="text-center">
                      <AdminStatusBadge label={String(org.projects.length)} tone="muted" className="min-w-8 justify-center" />
                    </td>
                    <td>
                      <AdminStatusBadge
                        label={connectionLabel(lastConnectionDays)}
                        tone={connectionTone(lastConnectionDays)}
                      />
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-3">
                        <HealthScoreDots score={score} size="sm" />
                        <span className="text-xs text-zinc-500">{score}/5</span>
                      </div>
                    </td>
                    <td className="text-center font-medium text-zinc-200">
                      {org.subscription?.price ? `$${org.subscription.price.toFixed(0)}` : '—'}
                    </td>
                    <td className="tabular-nums text-zinc-500">
                      {new Date(org.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-4">
                        <form action={startImpersonationAction.bind(null, org.id)}>
                          <button type="submit" className="text-xs font-medium text-amber-300 transition-colors hover:text-amber-200">
                            Ingresar como →
                          </button>
                        </form>
                        <Link href={`/admin/clients/${org.id}`} className="text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200">
                          Ver
                        </Link>
                        <Link href={`/admin/clients/${org.id}/edit`} className="text-xs text-zinc-500 transition-colors hover:text-zinc-200">
                          Editar
                        </Link>
                        <DeleteClientButton clientId={org.id} companyName={org.companyName} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </AdminSurface>
      )}
    </div>
  )
}

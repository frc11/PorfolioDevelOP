import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckSquare, ChevronLeft, ExternalLink, Pencil, Plus } from 'lucide-react'
import { ProjectStatus, ServiceType } from '@prisma/client'
import { DeleteServiceButton } from '@/components/admin/DeleteServiceButton'
import { HealthScoreDots } from '@/components/admin/HealthScoreDots'
import { ServiceStatusSelect } from '@/components/admin/ServiceStatusSelect'
import { AdminStatusBadge, AdminSurface } from '@/components/admin/admin-ui'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { startImpersonationAction } from '@/lib/actions/impersonation'
import { daysSince, estimateLastLoginAt, getHealthScore } from '@/lib/client-health'
import { PREMIUM_FEATURE_LABELS, type PremiumFeatureKey } from '@/lib/premium-features'
import { prisma } from '@/lib/prisma'
import { updateSubscriptionAction } from './actions'

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  WEB_DEV: 'Desarrollo Web',
  AI: 'Inteligencia Artificial',
  AUTOMATION: 'Automatización',
  SOFTWARE: 'Software a medida',
}

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const now = new Date()
  const recentApprovalThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [org, unreadClientMessages] = await Promise.all([
    prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          where: { role: 'ADMIN' },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                unlockedFeatures: true,
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
        services: { orderBy: { startDate: 'desc' } },
        projects: {
          orderBy: { status: 'asc' },
          include: { tasks: { select: { status: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        tickets: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
          select: { id: true },
        },
        subscription: true,
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
    }),
    prisma.message.count({
      where: {
        organizationId: id,
        fromAdmin: false,
        read: false,
      },
    }),
  ])

  if (!org) notFound()

  const adminUser = org.members[0]?.user
  const lastLoginAt = estimateLastLoginAt(adminUser?.sessions[0]?.expires)
  const lastConnectionDays = daysSince(lastLoginAt)
  const healthScore = getHealthScore({
    recentLogin: lastConnectionDays !== null && lastConnectionDays < 7,
    unreadMessages: unreadClientMessages,
    openTickets: org.tickets.length,
    hasActiveSubscription: org.subscription?.status === 'ACTIVE',
    recentApproval: org.notifications.length > 0,
  })
  const activeModules = (adminUser?.unlockedFeatures ?? []) as PremiumFeatureKey[]

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/admin/clients" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300">
              <ChevronLeft size={14} />
              Volver a clientes
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/75">Cliente</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{org.companyName}</h1>
            <p className="mt-2 text-sm text-zinc-500">slug: {org.slug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form action={startImpersonationAction.bind(null, id)}>
              <button type="submit" className="admin-btn-secondary inline-flex items-center gap-2 text-amber-200">
                <ExternalLink size={13} />
                Ingresar como
              </button>
            </form>
            <Link href={`/admin/clients/${id}/onboarding`} className="admin-btn-secondary inline-flex items-center gap-2 text-cyan-300">
              <CheckSquare size={13} strokeWidth={1.5} />
              Onboarding
            </Link>
            <Link href={`/admin/clients/${id}/edit`} className="admin-btn-secondary inline-flex items-center gap-2">
              <Pencil size={13} />
              Editar
            </Link>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-6">
          <FadeIn delay={0.05}>
            <AdminSurface>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="admin-label">Health score</p>
                  <div className="mt-3 flex items-center gap-3">
                    <HealthScoreDots score={healthScore} />
                    <span className="text-sm font-medium text-zinc-200">{healthScore}/5</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="admin-label">Última conexión</p>
                  <div className="mt-3">
                    <AdminStatusBadge label={lastConnectionDays === null ? 'Sin registro' : lastConnectionDays === 0 ? 'Hoy' : `Hace ${lastConnectionDays} días`} />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="admin-label">MRR aportado</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{org.subscription?.price ? `$${org.subscription.price.toFixed(0)}` : '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="admin-label">Módulos activos</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{activeModules.length}</p>
                </div>
              </div>
            </AdminSurface>
          </FadeIn>

          <FadeIn delay={0.1}>
            <AdminSurface>
              <p className="admin-label">Datos del cliente</p>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <dt className="admin-label">Contacto</dt>
                  <dd className="mt-2 text-sm text-zinc-200">{adminUser?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="admin-label">Email</dt>
                  <dd className="mt-2 text-sm text-zinc-200">{adminUser?.email ?? '—'}</dd>
                </div>
                <div>
                  <dt className="admin-label">Fecha de alta</dt>
                  <dd className="mt-2 text-sm text-zinc-200">
                    {new Date(org.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
                {org.logoUrl ? (
                  <div>
                    <dt className="admin-label">Logo</dt>
                    <dd className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={org.logoUrl} alt={org.companyName} className="h-10 w-auto rounded-xl object-contain" />
                    </dd>
                  </div>
                ) : null}
              </dl>
            </AdminSurface>
          </FadeIn>

          <FadeIn delay={0.15}>
            <AdminSurface>
              <div className="mb-4 flex items-center justify-between">
                <p className="admin-label">Servicios contratados</p>
                <Link href={`/admin/clients/${id}/services/new`} className="admin-btn-secondary inline-flex items-center gap-2 text-xs">
                  <Plus size={12} />
                  Agregar servicio
                </Link>
              </div>
              {org.services.length === 0 ? (
                <p className="text-sm text-zinc-500">Sin servicios registrados todavía.</p>
              ) : (
                <ul className="space-y-3">
                  {org.services.map((service) => (
                    <li key={service.id} className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-medium text-zinc-100">{SERVICE_TYPE_LABEL[service.type]}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Desde {new Date(service.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <ServiceStatusSelect serviceId={service.id} organizationId={id} currentStatus={service.status} />
                        <DeleteServiceButton serviceId={service.id} organizationId={id} serviceLabel={SERVICE_TYPE_LABEL[service.type]} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </AdminSurface>
          </FadeIn>

          <FadeIn delay={0.2}>
            <AdminSurface>
              <div className="mb-4 flex items-center justify-between">
                <p className="admin-label">Proyectos</p>
                <Link href="/admin/projects/new" className="text-sm text-cyan-300 transition-colors hover:text-cyan-200">
                  Crear proyecto →
                </Link>
              </div>
              {org.projects.length === 0 ? (
                <p className="text-sm text-zinc-500">Sin proyectos registrados todavía.</p>
              ) : (
                <ul className="space-y-3">
                  {org.projects.map((project) => {
                    const done = project.tasks.filter((task) => task.status === 'DONE').length
                    const total = project.tasks.length

                    return (
                      <li key={project.id} className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <Link href={`/admin/projects/${project.id}`} className="font-medium text-zinc-100 transition-colors hover:text-cyan-300">
                            {project.name}
                          </Link>
                          <p className="mt-1 text-xs text-zinc-500">{total > 0 ? `${done}/${total} tareas completadas` : 'Sin tareas'}</p>
                        </div>
                        <AdminStatusBadge label={PROJECT_STATUS_LABEL[project.status]} />
                      </li>
                    )
                  })}
                </ul>
              )}
            </AdminSurface>
          </FadeIn>
        </div>

        <div className="grid gap-6">
          <FadeIn delay={0.1}>
            <AdminSurface>
              <p className="admin-label">Módulos premium activos</p>
              {activeModules.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">Todavía no tiene módulos premium habilitados.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeModules.map((moduleKey) => (
                    <span key={moduleKey} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                      {PREMIUM_FEATURE_LABELS[moduleKey]}
                    </span>
                  ))}
                </div>
              )}
            </AdminSurface>
          </FadeIn>

          <FadeIn delay={0.15}>
            <AdminSurface>
              <p className="admin-label">Suscripción</p>
              <form action={updateSubscriptionAction.bind(null, id)} className="mt-5 flex flex-col gap-4">
                <div className="grid gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="admin-label">Plan</label>
                    <input name="planName" defaultValue={org.subscription?.planName ?? ''} placeholder="Ej: Retainer Pro" className="admin-input" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="admin-label">Precio (USD/mes)</label>
                    <input name="price" type="number" min="0" step="0.01" defaultValue={org.subscription?.price ?? ''} placeholder="800" className="admin-input" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="admin-label">Próximo vencimiento</label>
                    <input
                      name="renewalDate"
                      type="date"
                      defaultValue={org.subscription?.renewalDate ? org.subscription.renewalDate.toISOString().split('T')[0] : ''}
                      className="admin-input"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-zinc-500">
                    Estado actual: <span className={org.subscription?.status === 'ACTIVE' ? 'text-emerald-300' : 'text-amber-300'}>{org.subscription?.status ?? 'Sin suscripción'}</span>
                  </p>
                  <button type="submit" className="admin-btn-primary">
                    {org.subscription ? 'Actualizar suscripción' : 'Crear suscripción'}
                  </button>
                </div>
              </form>
            </AdminSurface>
          </FadeIn>

          <FadeIn delay={0.2}>
            <AdminSurface>
              <div className="mb-4 flex items-center justify-between">
                <p className="admin-label">Mensajes recientes</p>
                <Link href={`/admin/messages/${id}`} className="text-sm text-cyan-300 transition-colors hover:text-cyan-200">
                  Ver conversación →
                </Link>
              </div>
              {org.messages.length === 0 ? (
                <p className="text-sm text-zinc-500">Sin mensajes todavía.</p>
              ) : (
                <ul className="space-y-3">
                  {org.messages.map((message) => (
                    <li key={message.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="admin-label">{message.fromAdmin ? 'Admin → Cliente' : 'Cliente → Admin'}</span>
                        <span className="text-xs text-zinc-500">{new Date(message.createdAt).toLocaleDateString('es-AR')}</span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{message.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </AdminSurface>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Plus, ExternalLink } from 'lucide-react'
import { ServiceType, ProjectStatus } from '@prisma/client'
import { ServiceStatusSelect } from '@/components/admin/ServiceStatusSelect'
import { DeleteServiceButton } from '@/components/admin/DeleteServiceButton'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { startClientPreview, updateSubscriptionAction } from './actions'

// ─── Label maps ───────────────────────────────────────────────────────────────

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  WEB_DEV: 'Desarrollo Web',
  AI: 'Inteligencia Artificial',
  AUTOMATION: 'Automatización',
  SOFTWARE: 'Software a medida',
}

const PROJECT_STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNING: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
}

// ─── Shared card style ────────────────────────────────────────────────────────

const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(6,182,212,0.2)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

const actionBtnStyle = {
  border: '1px solid rgba(255,255,255,0.09)',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        where: { role: 'ADMIN' },
        select: { user: { select: { name: true, email: true, createdAt: true } } },
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
      subscription: true,
    },
  })

  if (!org) notFound()

  const adminUser = org.members[0]?.user

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/admin/clients"
              className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <ChevronLeft size={14} />
              Volver a clientes
            </Link>
            <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
              Cliente
            </p>
            <h1 className="text-xl font-bold text-zinc-100">{org.companyName}</h1>
            <p className="mt-0.5 text-sm text-zinc-600">slug: {org.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <form action={startClientPreview.bind(null, id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-cyan-400 transition-all hover:text-cyan-200"
                style={{ border: '1px solid rgba(6,182,212,0.25)' }}
              >
                <ExternalLink size={13} />
                Ver portal
              </button>
            </form>
            <Link
              href={`/admin/clients/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition-all hover:text-zinc-100"
              style={actionBtnStyle}
            >
              <Pencil size={13} />
              Editar
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Info card */}
      <FadeIn delay={0.1}>
      <div className="rounded-xl p-5" style={cardStyle}>
        <h2 className="mb-4 text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
          Datos del cliente
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">Contacto</dt>
            <dd className="mt-1 text-sm text-zinc-200">{adminUser?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">Email</dt>
            <dd className="mt-1 text-sm text-zinc-200">{adminUser?.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">Fecha de alta</dt>
            <dd className="mt-1 text-sm text-zinc-200">
              {new Date(org.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          {org.logoUrl && (
            <div>
              <dt className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">Logo</dt>
              <dd className="mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={org.logoUrl}
                  alt={org.companyName}
                  className="h-8 w-auto rounded object-contain"
                />
              </dd>
            </div>
          )}
        </dl>
      </div>
      </FadeIn>

      {/* Services */}
      <FadeIn delay={0.2}>
      <div className="rounded-xl p-5" style={cardStyle}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
            Servicios contratados ({org.services.length})
          </h2>
          <Link
            href={`/admin/clients/${id}/services/new`}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-zinc-400 transition-all hover:text-zinc-100"
            style={actionBtnStyle}
          >
            <Plus size={12} />
            Agregar servicio
          </Link>
        </div>

        {org.services.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Sin servicios registrados.{' '}
            <Link
              href={`/admin/clients/${id}/services/new`}
              className="text-cyan-400 hover:text-cyan-300"
            >
              Agregar el primero →
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {org.services.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-200">
                    {SERVICE_TYPE_LABEL[service.type]}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    Desde{' '}
                    {new Date(service.startDate).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <ServiceStatusSelect
                    serviceId={service.id}
                    organizationId={id}
                    currentStatus={service.status}
                  />
                  <DeleteServiceButton
                    serviceId={service.id}
                    organizationId={id}
                    serviceLabel={SERVICE_TYPE_LABEL[service.type]}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      </FadeIn>

      {/* Projects */}
      <FadeIn delay={0.3}>
      <div className="rounded-xl p-5" style={cardStyle}>
        <h2 className="mb-4 text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
          Proyectos ({org.projects.length})
        </h2>
        {org.projects.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Sin proyectos registrados.{' '}
            <Link href="/admin/projects/new" className="text-cyan-400 hover:text-cyan-300">
              Agregar el primero →
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {org.projects.map((project) => {
              const done = project.tasks.filter((t) => t.status === 'DONE').length
              const total = project.tasks.length
              return (
                <li
                  key={project.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-sm font-medium text-zinc-200 hover:text-cyan-400 transition-colors"
                    >
                      {project.name}
                    </Link>
                    {total > 0 && (
                      <p className="mt-0.5 text-xs text-zinc-600">
                        {done}/{total} tareas completadas
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${PROJECT_STATUS_STYLE[project.status]}`}
                  >
                    {PROJECT_STATUS_LABEL[project.status]}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      </FadeIn>

      {/* Subscription */}
      <FadeIn delay={0.35}>
      <div className="rounded-xl p-5" style={cardStyle}>
        <h2 className="mb-4 text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
          Suscripción
        </h2>
        <form action={updateSubscriptionAction.bind(null, id)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">
                Plan
              </label>
              <input
                name="planName"
                defaultValue={org.subscription?.planName ?? ''}
                placeholder="Ej: Retainer Pro"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">
                Precio (USD/mes)
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={org.subscription?.price ?? ''}
                placeholder="800"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">
                Próximo vencimiento
              </label>
              <input
                name="renewalDate"
                type="date"
                defaultValue={
                  org.subscription?.renewalDate
                    ? org.subscription.renewalDate.toISOString().split('T')[0]
                    : ''
                }
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            {org.subscription && (
              <p className="text-xs text-zinc-600">
                Estado actual:{' '}
                <span className={org.subscription.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}>
                  {org.subscription.status}
                </span>
              </p>
            )}
            <button
              type="submit"
              className="ml-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 text-xs font-semibold text-cyan-400 transition-all hover:bg-cyan-500/20 hover:text-cyan-300"
            >
              {org.subscription ? 'Actualizar suscripción' : 'Crear suscripción'}
            </button>
          </div>
        </form>
      </div>
      </FadeIn>

      {/* Recent messages */}
      <FadeIn delay={0.4}>
      <div className="rounded-xl p-5" style={cardStyle}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
            Mensajes recientes
          </h2>
          <Link
            href={`/admin/messages/${id}`}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-cyan-400 transition-all hover:text-cyan-300"
            style={{ border: '1px solid rgba(6,182,212,0.2)' }}
          >
            Ver conversación →
          </Link>
        </div>
        {org.messages.length === 0 ? (
          <p className="text-sm text-zinc-600">Sin mensajes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {org.messages.map((msg) => (
              <li
                key={msg.id}
                className="rounded-xl px-3 py-2.5"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">
                    {msg.fromAdmin ? 'Admin → Cliente' : 'Cliente → Admin'}
                  </span>
                  <div className="flex items-center gap-2">
                    {!msg.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    )}
                    <span className="text-xs text-zinc-600">
                      {new Date(msg.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                  {msg.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      </FadeIn>
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Plus } from 'lucide-react'
import { ServiceType, ServiceStatus, ProjectStatus } from '@prisma/client'
import { ServiceStatusSelect } from '@/components/admin/ServiceStatusSelect'
import { DeleteServiceButton } from '@/components/admin/DeleteServiceButton'

// ─── Label maps ───────────────────────────────────────────────────────────────

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  WEB_DEV: 'Desarrollo Web',
  AI: 'Inteligencia Artificial',
  AUTOMATION: 'Automatización',
  SOFTWARE: 'Software a medida',
}

const PROJECT_STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNING: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      services: { orderBy: { startDate: 'desc' } },
      projects: {
        orderBy: { status: 'asc' },
        include: { tasks: { select: { status: true } } },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!client) notFound()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/clients"
            className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <ChevronLeft size={14} />
            Volver a clientes
          </Link>
          <h1 className="text-xl font-semibold text-zinc-100">
            {client.companyName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">slug: {client.slug}</p>
        </div>
        <Link
          href={`/admin/clients/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
        >
          <Pencil size={13} />
          Editar
        </Link>
      </div>

      {/* Info card */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">
          Datos del cliente
        </h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Contacto</dt>
            <dd className="mt-0.5 text-sm text-zinc-100">
              {client.user.name ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Email</dt>
            <dd className="mt-0.5 text-sm text-zinc-100">{client.user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Fecha de alta</dt>
            <dd className="mt-0.5 text-sm text-zinc-100">
              {new Date(client.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          {client.logoUrl && (
            <div>
              <dt className="text-xs text-zinc-500">Logo</dt>
              <dd className="mt-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={client.logoUrl}
                  alt={client.companyName}
                  className="h-8 w-auto rounded object-contain"
                />
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Services */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">
            Servicios contratados ({client.services.length})
          </h2>
          <Link
            href={`/admin/clients/${id}/services/new`}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            <Plus size={12} />
            Agregar servicio
          </Link>
        </div>

        {client.services.length === 0 ? (
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
            {client.services.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between gap-4 rounded-md border border-zinc-800 px-3 py-2.5"
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
                    clientId={id}
                    currentStatus={service.status}
                  />
                  <DeleteServiceButton
                    serviceId={service.id}
                    clientId={id}
                    serviceLabel={SERVICE_TYPE_LABEL[service.type]}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Projects */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">
          Proyectos ({client.projects.length})
        </h2>
        {client.projects.length === 0 ? (
          <p className="text-sm text-zinc-600">Sin proyectos registrados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {client.projects.map((project) => {
              const done = project.tasks.filter((t) => t.status === 'DONE').length
              const total = project.tasks.length
              return (
                <li
                  key={project.id}
                  className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2"
                >
                  <div>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-sm font-medium text-zinc-100 hover:text-cyan-400 transition-colors"
                    >
                      {project.name}
                    </Link>
                    {total > 0 && (
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {done}/{total} tareas completadas
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${PROJECT_STATUS_STYLE[project.status]}`}
                  >
                    {PROJECT_STATUS_LABEL[project.status]}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Recent messages */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">
          Mensajes recientes
        </h2>
        {client.messages.length === 0 ? (
          <p className="text-sm text-zinc-600">Sin mensajes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {client.messages.map((msg) => (
              <li
                key={msg.id}
                className="rounded-md border border-zinc-800 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">
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
                <p className="mt-1 line-clamp-2 text-sm text-zinc-300">
                  {msg.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

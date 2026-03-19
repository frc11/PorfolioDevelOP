import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ServiceType, ServiceStatus } from '@prisma/client'
import { Zap, ExternalLink } from 'lucide-react'

// ─── Maps ─────────────────────────────────────────────────────────────────────

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  WEB_DEV: 'Desarrollo Web',
  AI: 'Inteligencia Artificial',
  AUTOMATION: 'Automatización',
  SOFTWARE: 'Software a Medida',
}

const SERVICE_TYPE_DESC: Record<ServiceType, string> = {
  WEB_DEV:
    'Diseño y desarrollo de sitios web, landing pages y aplicaciones web a medida con las últimas tecnologías.',
  AI: 'Integración de modelos de lenguaje, asistentes inteligentes y soluciones de IA adaptadas a tu negocio.',
  AUTOMATION:
    'Automatización de flujos de trabajo, integraciones entre sistemas y eliminación de tareas repetitivas.',
  SOFTWARE:
    'Desarrollo de aplicaciones de escritorio, herramientas internas y soluciones de software específicas para tu operación.',
}

const SERVICE_STATUS_STYLE: Record<ServiceStatus, string> = {
  ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
  PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  ACTIVE: 'Activo',
  PAUSED: 'Pausado',
  CANCELLED: 'Cancelado',
}

// ─── Service card ─────────────────────────────────────────────────────────────

function ServiceCard({
  type,
  status,
  startDate,
}: {
  type: ServiceType
  status: ServiceStatus
  startDate: Date
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-cyan-500/10">
            <Zap size={15} className="text-cyan-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">
            {SERVICE_TYPE_LABEL[type]}
          </h3>
        </div>
        <span
          className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${SERVICE_STATUS_STYLE[status]}`}
        >
          {SERVICE_STATUS_LABEL[status]}
        </span>
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed">
        {SERVICE_TYPE_DESC[type]}
      </p>

      <p className="text-xs text-zinc-600">
        Inicio:{' '}
        {new Date(startDate).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ServicesPage() {
  const session = await auth()
  const clientId = session?.user?.clientId
  if (!clientId) redirect('/login')

  const services = await prisma.service.findMany({
    where: { clientId },
    orderBy: { startDate: 'asc' },
  })

  const activeServices = services.filter((s) => s.status === 'ACTIVE')
  const inactiveServices = services.filter((s) => s.status !== 'ACTIVE')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Mis servicios</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Servicios contratados con DevelOP
        </p>
      </div>

      {/* Empty state */}
      {services.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
            <Zap size={22} className="text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300">
              Aún no tenés servicios activos
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              ¡Contactanos para empezar!
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-2 flex items-center gap-1.5 rounded-md bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
          >
            <ExternalLink size={14} />
            Quiero agregar un servicio
          </Link>
        </div>
      )}

      {/* Active services */}
      {activeServices.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Activos ({activeServices.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activeServices.map((service) => (
              <ServiceCard
                key={service.id}
                type={service.type}
                status={service.status}
                startDate={service.startDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Paused / cancelled */}
      {inactiveServices.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Pausados / Cancelados ({inactiveServices.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {inactiveServices.map((service) => (
              <ServiceCard
                key={service.id}
                type={service.type}
                status={service.status}
                startDate={service.startDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* CTA if has services */}
      {services.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4">
          <p className="text-sm text-zinc-400">
            ¿Querés agregar un nuevo servicio?
          </p>
          <Link
            href="/contact"
            className="flex items-center gap-1.5 rounded-md bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
          >
            <ExternalLink size={13} />
            Contactanos
          </Link>
        </div>
      )}
    </div>
  )
}

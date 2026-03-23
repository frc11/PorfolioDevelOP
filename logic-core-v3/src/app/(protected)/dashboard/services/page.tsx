import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { resolveOrgId } from '@/lib/preview'
import { ServiceType, ServiceStatus } from '@prisma/client'
import { Zap, ExternalLink, Sparkles, Bot, Lock, Unlock, Rocket } from 'lucide-react'
import { FadeIn } from '@/components/dashboard/FadeIn'

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
    <div
      className="flex flex-col gap-3 rounded-xl p-5"
      style={{
        border: '1px solid rgba(6,182,212,0.2)',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-cyan-500/10">
            <Zap size={15} className="text-cyan-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            {SERVICE_TYPE_LABEL[type]}
          </h3>
        </div>
        <span
          className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${SERVICE_STATUS_STYLE[status]}`}
        >
          {SERVICE_STATUS_LABEL[status]}
        </span>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed">
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
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const services = await prisma.service.findMany({
    where: { organizationId },
    orderBy: { startDate: 'asc' },
  })

  const activeServices = services.filter((s) => s.status === 'ACTIVE')
  const inactiveServices = services.filter((s) => s.status !== 'ACTIVE')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-xl font-semibold text-white">Mis servicios</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Servicios contratados con DevelOP
          </p>
        </div>
      </FadeIn>

      {/* Empty state */}
      {services.length === 0 && (
        <FadeIn delay={0.1}>
          <div
            className="flex flex-col items-center gap-4 rounded-xl py-16 text-center"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/60">
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
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/20 hover:text-cyan-300"
              style={{ border: '1px solid rgba(6,182,212,0.2)' }}
            >
              <ExternalLink size={14} />
              Quiero agregar un servicio
            </Link>
          </div>
        </FadeIn>
      )}

      {/* Active services */}
      {activeServices.length > 0 && (
        <FadeIn delay={0.1}>
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
        </FadeIn>
      )}

      {/* Paused / cancelled */}
      {inactiveServices.length > 0 && (
        <FadeIn delay={0.2}>
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
        </FadeIn>
      )}

  {/* Smart Upselling Section */}
      <FadeIn delay={0.4}>
        <div className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              Sube al Siguiente Nivel
            </h2>
            <p className="text-sm text-zinc-400">
              Potenciá tu negocio con nuestras soluciones premium exclusivas.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Upsell Card 1 */}
            <div
              className="group relative flex flex-col gap-4 overflow-hidden rounded-xl p-5 transition-all hover:scale-[1.01]"
              style={{
                border: '1px solid rgba(245,158,11,0.2)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(245,158,11,0.05) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-50"></div>
              
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-500">
                    <Bot size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Recepcionista IA</span>
                    <span className="text-[11px] font-medium uppercase text-amber-500/70">Automatización Premium</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
                  <Lock size={10} />
                  Bloqueado
                </span>
              </div>
              
              <p className="text-xs text-zinc-300 leading-relaxed relative z-10">
                Atendé a tus clientes 24/7 de forma automática y agendá reuniones sin intervención humana. Aumentá tu conversión un 40%.
              </p>
              
              <div className="mt-2 relative z-10">
                <Link
                  href="/contact?service=recepcionista-ia"
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 text-xs font-semibold text-amber-400 transition-all hover:bg-amber-500/30 border border-amber-500/20 hover:border-amber-500/40"
                >
                  <Unlock size={14} />
                  Desbloquear Módulo
                </Link>
              </div>
            </div>

            {/* Upsell Card 2 */}
            <div
              className="group relative flex flex-col gap-4 overflow-hidden rounded-xl p-5 transition-all hover:scale-[1.01]"
              style={{
                border: '1px solid rgba(139,92,246,0.2)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(139,92,246,0.05) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-50"></div>
              
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 text-violet-500">
                    <Rocket size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">SEO Avanzado</span>
                    <span className="text-[11px] font-medium uppercase text-violet-500/70">Crecimiento Orgánico</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-violet-400">
                  <Lock size={10} />
                  Bloqueado
                </span>
              </div>
              
              <p className="text-xs text-zinc-300 leading-relaxed relative z-10">
                Dominá los primeros resultados de búsqueda. Auditoría técnica, linkbuilding y optimización continua de contenidos.
              </p>
              
              <div className="mt-2 relative z-10">
                <Link
                  href="/contact?service=seo-avanzado"
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 px-4 py-2 text-xs font-semibold text-violet-400 transition-all hover:bg-violet-500/30 border border-violet-500/20 hover:border-violet-500/40"
                >
                  <Unlock size={14} />
                  Desbloquear Módulo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}

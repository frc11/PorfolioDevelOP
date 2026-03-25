import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { resolveOrgId } from '@/lib/preview'
import { ServiceType, ServiceStatus } from '@prisma/client'
import { Zap, ExternalLink, Sparkles, Bot, Lock, Unlock, Rocket } from 'lucide-react'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { UpsellCard } from '@/components/dashboard/UpsellCard'

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

// Add shine animation keyframe
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes shine {
      0% { transform: translateX(-150%) skewX(-35deg); }
      20% { transform: translateX(200%) skewX(-35deg); }
      100% { transform: translateX(200%) skewX(-35deg); }
    }
  `
  document.head.appendChild(style)
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
  const isWebDev = type === 'WEB_DEV' && status === 'ACTIVE'
  
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl p-6 transition-all duration-300 ${
        isWebDev 
          ? 'bg-gradient-to-br from-black to-zinc-900 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
          : 'bg-white/5 border border-white/10 backdrop-blur-3xl'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
            isWebDev ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-zinc-400'
          }`}>
            <Zap size={18} className={isWebDev ? 'animate-pulse' : ''} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[15px] font-black tracking-tight text-white uppercase tracking-wider">
              {SERVICE_TYPE_LABEL[type]}
            </h3>
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
              Servicio Principal
            </span>
          </div>
        </div>
        <span
          className={`flex-shrink-0 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${SERVICE_STATUS_STYLE[status]}`}
        >
          {SERVICE_STATUS_LABEL[status]}
        </span>
      </div>

      <p className="mt-2 text-xs text-zinc-400 leading-relaxed font-medium">
        {SERVICE_TYPE_DESC[type]}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">Desde</span>
          <span className="text-[10px] text-zinc-500 font-bold tabular-nums">
            {new Date(startDate).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
        {isWebDev && (
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-500/80">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            Vigente
          </div>
        )}
      </div>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <UpsellCard
              title="Recepcionista IA"
              subtitle="Automatización Premium"
              description="Atendé a tus clientes 24/7 de forma automática y agendá reuniones sin intervención humana. Aumentá tu conversión un 40%."
              ROI={{ icon: '🔥', text: 'Ahorra +20 horas semanales en coordinación' }}
              iconType="bot"
              href="/contact?service=recepcionista-ia"
              themeColor="amber"
            />

            <UpsellCard
              title="SEO Avanzado"
              subtitle="Crecimiento Orgánico"
              description="Dominá los primeros resultados de búsqueda. Auditoría técnica, linkbuilding y optimización continua de contenidos."
              ROI={{ icon: '🚀', text: 'Duplica tus consultas orgánicas' }}
              iconType="rocket"
              href="/contact?service=seo-avanzado"
              themeColor="violet"
            />
          </div>
        </div>
      </FadeIn>
    </div>
  )
}

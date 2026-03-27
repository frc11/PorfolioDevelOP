import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { resolveOrgId } from '@/lib/preview'
import { ServiceType, ServiceStatus } from '@prisma/client'
import {
  Zap,
  Globe,
  Bot,
  Cpu,
  MessageSquare,
  Sparkles,
  FolderOpen,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/dashboard/StaggerWrapper'
import { PremiumModuleCard } from '@/components/dashboard/PremiumModuleCard'
import type { PremiumModuleCardProps } from '@/components/dashboard/PremiumModuleCard'

// ─── Service type config ───────────────────────────────────────────────────────

type ServiceTypeConfig = {
  label: string
  description: string
  glowRgb: string
  Icon: LucideIcon
}

const SERVICE_TYPE_CONFIG: Record<ServiceType, ServiceTypeConfig> = {
  WEB_DEV: {
    label: 'Desarrollo Web',
    description:
      'Diseño y desarrollo de sitios web, landing pages y aplicaciones web a medida con las últimas tecnologías.',
    glowRgb: '6,182,212',
    Icon: Globe,
  },
  AI: {
    label: 'Inteligencia Artificial',
    description:
      'Integración de modelos de lenguaje, asistentes inteligentes y soluciones de IA adaptadas a tu negocio.',
    glowRgb: '167,139,250',
    Icon: Bot,
  },
  AUTOMATION: {
    label: 'Automatización',
    description:
      'Automatización de flujos de trabajo, integraciones entre sistemas y eliminación de tareas repetitivas.',
    glowRgb: '52,211,153',
    Icon: Zap,
  },
  SOFTWARE: {
    label: 'Software a Medida',
    description:
      'Desarrollo de aplicaciones de escritorio, herramientas internas y soluciones de software específicas para tu operación.',
    glowRgb: '251,191,36',
    Icon: Cpu,
  },
}

// ─── Service status config ─────────────────────────────────────────────────────

type ServiceStatusConfig = {
  label: string
  dotColor: string
  ping: boolean
  pill: string
}

const SERVICE_STATUS_CONFIG: Record<ServiceStatus, ServiceStatusConfig> = {
  ACTIVE: {
    label: 'Activo',
    dotColor: 'bg-emerald-400',
    ping: true,
    pill: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  },
  PAUSED: {
    label: 'Pausado',
    dotColor: 'bg-amber-400',
    ping: false,
    pill: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
  },
  CANCELLED: {
    label: 'Cancelado',
    dotColor: 'bg-red-400',
    ping: false,
    pill: 'border-red-500/25 bg-red-500/10 text-red-400',
  },
}

// ─── Premium modules (sorted by priceFrom asc) ────────────────────────────────

type ModuleData = PremiumModuleCardProps

const PREMIUM_MODULES: ModuleData[] = [
  {
    moduleKey: 'motor-resenas',
    name: 'Motor de Reseñas Automático',
    category: 'Reputación Online',
    description:
      'Generá reseñas positivas en Google y Tripadvisor en piloto automático y potenciá tu reputación.',
    priceFrom: 60,
    roiBadge: 'Más confianza = más ventas',
    iconKey: 'Star',
    glowRgb: '234,179,8',
  },
  {
    moduleKey: 'agenda-inteligente',
    name: 'Agenda Inteligente 24/7',
    category: 'Gestión de Tiempo',
    description:
      'Tus clientes agendan citas sin que vos intervengas, disponible las 24hs todos los días.',
    priceFrom: 80,
    roiBadge: 'Ahorrá 10hs/semana',
    iconKey: 'Calendar',
    glowRgb: '6,182,212',
  },
  {
    moduleKey: 'mini-crm',
    name: 'Mini-CRM & Gestión de Leads',
    category: 'Ventas',
    description:
      'Organizá, calificá y hacé seguimiento de cada lead sin necesitar un CRM caro.',
    priceFrom: 80,
    roiBadge: '3x más cierres de venta',
    iconKey: 'Users',
    glowRgb: '59,130,246',
  },
  {
    moduleKey: 'recuperacion-ventas',
    name: 'Recuperación de Ventas',
    category: 'Conversión',
    description:
      'Rescatá clientes perdidos con secuencias de follow-up automáticas e inteligentes.',
    priceFrom: 100,
    roiBadge: 'Recuperá el 25% de ventas',
    iconKey: 'RefreshCw',
    glowRgb: '249,115,22',
  },
  {
    moduleKey: 'email-marketing',
    name: 'Email Marketing & Nurturing',
    category: 'Marketing',
    description:
      'Campañas de email personalizadas con IA que convierten prospectos en clientes fieles.',
    priceFrom: 100,
    roiBadge: '$42 retorno por $1 invertido',
    iconKey: 'Mail',
    glowRgb: '99,102,241',
  },
  {
    moduleKey: 'dominio-busqueda-local',
    name: 'Dominio de Búsqueda Local',
    category: 'SEO Local',
    description:
      'Dominá el ranking en Google Maps y búsquedas de tu zona para atraer clientes cercanos.',
    priceFrom: 120,
    roiBadge: '+60% visibilidad local',
    iconKey: 'MapPin',
    glowRgb: '167,139,250',
  },
  {
    moduleKey: 'recepcionista-ia',
    name: 'Recepcionista IA & WhatsApp Autopilot',
    category: 'Automatización IA',
    description:
      'Respondé consultas y cerrá ventas en WhatsApp las 24hs sin intervención humana.',
    priceFrom: 150,
    roiBadge: 'Ahorrá 15hs/semana',
    iconKey: 'Bot',
    glowRgb: '245,158,11',
  },
  {
    moduleKey: 'social-media-hub',
    name: 'Social Media & Content Hub',
    category: 'Redes Sociales',
    description:
      'Generá, programá y publicá contenido de alto impacto usando inteligencia artificial.',
    priceFrom: 200,
    roiBadge: '5x más engagement',
    iconKey: 'Share2',
    glowRgb: '236,72,153',
  },
  {
    moduleKey: 'vende-mientras-duermes',
    name: 'Vendé Mientras Dormís',
    category: 'E-commerce IA',
    description:
      'Sistema de ventas automatizado que opera 24/7 y genera ingresos sin un equipo de ventas.',
    priceFrom: 300,
    roiBadge: 'Ventas en piloto automático',
    iconKey: 'ShoppingCart',
    glowRgb: '52,211,153',
  },
]

// ─── Service card ──────────────────────────────────────────────────────────────

function ServiceCard({
  type,
  status,
  startDate,
}: {
  type: ServiceType
  status: ServiceStatus
  startDate: Date
}) {
  const cfg = SERVICE_TYPE_CONFIG[type]
  const statusCfg = SERVICE_STATUS_CONFIG[status]
  const { Icon } = cfg

  return (
    <div className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/5 bg-[#07080a]/70 p-6 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-white/10">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-[60px] opacity-10 transition-opacity duration-500 group-hover:opacity-25"
        style={{ background: `rgb(${cfg.glowRgb})` }}
      />

      {/* Icon + status badge */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: `rgba(${cfg.glowRgb}, 0.1)`,
            border: `1px solid rgba(${cfg.glowRgb}, 0.2)`,
            color: `rgb(${cfg.glowRgb})`,
            boxShadow: `0 0 20px rgba(${cfg.glowRgb}, 0.15)`,
          }}
        >
          <Icon size={24} />
        </div>

        <span
          className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest ${statusCfg.pill}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            {statusCfg.ping && (
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${statusCfg.dotColor}`}
              />
            )}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusCfg.dotColor}`}
            />
          </span>
          {statusCfg.label}
        </span>
      </div>

      {/* Title */}
      <div className="relative z-10">
        <h3 className="text-xl font-black uppercase tracking-tight text-white">
          {cfg.label}
        </h3>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          Servicio Principal
        </p>
      </div>

      {/* Description */}
      <p className="relative z-10 text-xs leading-relaxed text-zinc-500">
        {cfg.description}
      </p>

      {/* Footer */}
      <div className="relative z-10 mt-auto flex items-end justify-between gap-3 border-t border-white/5 pt-5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">
            Activo desde
          </p>
          <p className="mt-0.5 text-[11px] font-bold tabular-nums text-zinc-400">
            {new Date(startDate).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/dashboard/messages"
          className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:border-white/10 hover:bg-white/[0.05] hover:text-zinc-200 active:scale-95"
        >
          <MessageSquare size={11} />
          Ver detalles
        </Link>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ServicesPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const services = await prisma.service.findMany({
    where: { organizationId },
    orderBy: { startDate: 'asc' },
  })

  const activeCount = services.filter((s) => s.status === 'ACTIVE').length

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-20">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <FadeIn delay={0}>
        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              <Zap size={26} className="text-cyan-400" />
              Mis Servicios
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-zinc-600">
              Servicios contratados con develOP
            </p>
          </div>

          {activeCount > 0 && (
            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {activeCount} {activeCount === 1 ? 'servicio activo' : 'servicios activos'}
              </span>
            </div>
          )}
        </div>
      </FadeIn>

      {/* ── Services grid / Empty state ──────────────────────────────────── */}
      {services.length === 0 ? (
        <FadeIn delay={0.06}>
          <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-white/[0.07] bg-[#0a0c0f]/60 px-8 py-20 text-center backdrop-blur-xl">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-cyan-500/5" />
              <FolderOpen size={32} className="relative z-10 text-zinc-600" />
            </div>
            <div className="max-w-xs space-y-2">
              <h2 className="text-lg font-black uppercase italic tracking-tight text-white">
                Aún no tenés servicios activos
              </h2>
              <p className="text-sm font-medium leading-relaxed text-zinc-500">
                Contactanos para comenzar tu proyecto con develOP.
              </p>
            </div>
            <Link
              href="/dashboard/messages"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-400 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/20 active:scale-95"
            >
              <MessageSquare size={15} />
              Hablar con el equipo
            </Link>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.06}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                Contratados
              </p>
              <div className="h-px flex-1 bg-white/[0.05]" />
            </div>
            <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <StaggerItem key={service.id}>
                  <ServiceCard
                    type={service.type}
                    status={service.status}
                    startDate={service.startDate}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </FadeIn>
      )}

      {/* ── Premium upsell section ───────────────────────────────────────── */}
      <FadeIn delay={0.12}>
        <div className="flex flex-col gap-6">

          {/* Section header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <Sparkles size={17} className="text-cyan-400 flex-shrink-0" />
              <h2
                className="text-xl font-black uppercase tracking-tight"
                style={{
                  background: 'linear-gradient(90deg, #06b6d4 0%, #818cf8 50%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Subí al Siguiente Nivel
              </h2>
            </div>
            <p className="pl-7 text-sm font-medium text-zinc-500">
              Potenciá tu negocio con nuestras soluciones premium exclusivas
            </p>
          </div>

          {/* Modules grid */}
          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PREMIUM_MODULES.map((module) => (
              <StaggerItem key={module.moduleKey}>
                <PremiumModuleCard {...module} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </FadeIn>

    </div>
  )
}

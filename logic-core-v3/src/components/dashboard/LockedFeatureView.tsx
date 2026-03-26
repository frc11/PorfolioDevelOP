'use client'

import { motion } from 'framer-motion'
import {
  Lock, TrendingUp, Zap, ArrowRight, Shield, Star,
  MessageCircle, Calendar, Share2, Search, ShoppingCart,
  Target, Users, Mail,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { requestUpsellAction } from '@/lib/actions/upsell'

type WidgetType = 'whatsapp-counter' | 'pixel-losses' | 'review-comparison'
type BadgeStyle = 'info' | 'warning' | 'danger'

interface FeatureConfig {
  id: string
  name: string
  headline: string
  description: string
  badge?: string
  badgeStyle?: BadgeStyle
  roi: string
  roiDetail: string
  icon: React.ElementType
  accentColor: string
  accentBg: string
  ctaText?: string
  widgetType?: WidgetType
}

function RandomWidget({ type }: { type: WidgetType }) {
  const [value] = useState<number>(() => {
    if (type === 'whatsapp-counter') return Math.floor(Math.random() * 25) + 23
    if (type === 'pixel-losses') return Math.floor(Math.random() * 46) + 89
    return 0
  })

  if (type === 'whatsapp-counter') {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 mb-6">
        <p className="text-[10px] text-amber-400/70 uppercase tracking-[0.15em] font-semibold mb-2">
          Esta semana
        </p>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-black text-amber-400 tabular-nums leading-none">{value}</span>
          <p className="text-sm text-zinc-400 leading-snug">
            mensajes sin responder<br />en horario no laboral
          </p>
        </div>
      </div>
    )
  }

  if (type === 'pixel-losses') {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 mb-6">
        <p className="text-[10px] text-red-400/70 uppercase tracking-[0.15em] font-semibold mb-2">
          Clientes perdidos esta semana
        </p>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-black text-red-400 tabular-nums leading-none">{value}</span>
          <p className="text-sm text-zinc-400 leading-snug">
            personas visitaron tu sitio<br />y se fueron sin contactarte
          </p>
        </div>
      </div>
    )
  }

  // review-comparison
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 mb-6">
      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-semibold mb-3">
        Reseñas en Google ahora mismo
      </p>
      <div className="flex items-center gap-4">
        <div className="flex-1 text-center">
          <p className="text-[10px] text-zinc-500 mb-1">Tu competencia</p>
          <span className="text-3xl font-black text-zinc-300 tabular-nums">150</span>
          <p className="text-[10px] text-zinc-500 mt-0.5">reseñas</p>
        </div>
        <div className="text-zinc-700 text-xl font-light">vs</div>
        <div className="flex-1 text-center">
          <p className="text-[10px] text-zinc-500 mb-1">Vos</p>
          <span className="text-3xl font-black text-red-400 tabular-nums">12</span>
          <p className="text-[10px] text-zinc-500 mt-0.5">reseñas</p>
        </div>
      </div>
    </div>
  )
}

const BADGE_STYLES: Record<BadgeStyle, string> = {
  info: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-300',
  warning: 'border-amber-500/20 bg-amber-500/5 text-amber-300',
  danger: 'border-red-500/20 bg-red-500/5 text-red-300',
}

const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  'email-automation': {
    id: 'email-automation',
    name: 'Email Automation',
    headline: 'Convierte silencio en ventas automáticas',
    description: 'Secuencias de nurturing inteligentes que convierten leads fríos en clientes. Sin intervención manual. El sistema trabaja mientras dormís.',
    roi: '+40%',
    roiDetail: 'aumento promedio en tasa de conversión de leads',
    icon: Zap,
    accentColor: 'text-violet-400',
    accentBg: 'bg-violet-500/10',
  },
  'client-portal': {
    id: 'client-portal',
    name: 'Portal de Clientes',
    headline: 'Tu marca, presente 24/7 para tus clientes',
    description: 'Portal white-label donde tus clientes acceden a propuestas, contratos, métricas y comunicación. Profesionalismo que justifica precios premium.',
    roi: '+30%',
    roiDetail: 'mejora en retención y satisfacción de clientes B2B',
    icon: Shield,
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
  },
  'whatsapp-autopilot': {
    id: 'whatsapp-autopilot',
    name: 'Recepcionista IA & WhatsApp Autopilot',
    headline: 'Tu negocio abierto aunque estés durmiendo',
    description: 'Un agente de IA responde consultas, califica leads y agenda reuniones por WhatsApp las 24hs. Tu negocio abierto aunque estés durmiendo.',
    badge: 'Ahorrá +15 horas semanales en atención al cliente',
    badgeStyle: 'info',
    roi: '+15h',
    roiDetail: 'semanales recuperadas en atención al cliente con IA',
    icon: MessageCircle,
    accentColor: 'text-green-400',
    accentBg: 'bg-green-500/10',
    widgetType: 'whatsapp-counter',
  },
  'agenda-inteligente': {
    id: 'agenda-inteligente',
    name: 'Agenda Inteligente 24/7',
    headline: 'La agenda se gestiona sola',
    description: 'Tus clientes reservan turnos o test drives solos, en cualquier momento. Sin llamadas, sin idas y vueltas. La agenda se gestiona sola.',
    badge: 'El 60% de las reservas online se hacen fuera del horario laboral',
    badgeStyle: 'info',
    roi: '60%',
    roiDetail: 'de las reservas llegan fuera del horario laboral',
    icon: Calendar,
    accentColor: 'text-blue-400',
    accentBg: 'bg-blue-500/10',
  },
  'social-media-hub': {
    id: 'social-media-hub',
    name: 'Social Media & Content Hub',
    headline: 'Aprobá con un click, publicamos nosotros',
    description: 'Tu agencia crea el contenido, vos lo aprobás con un click desde acá. Publicación automática en todas tus redes. Sin grupos de WhatsApp, sin confusiones.',
    badge: 'Empresas con presencia activa en redes venden 3x más',
    badgeStyle: 'info',
    roi: '3x',
    roiDetail: 'más ventas en empresas con presencia activa en redes sociales',
    icon: Share2,
    accentColor: 'text-pink-400',
    accentBg: 'bg-pink-500/10',
  },
  'seo-avanzado': {
    id: 'seo-avanzado',
    name: 'Dominio de Búsqueda Local',
    headline: 'Aparecé primero cuando buscan tu rubro',
    description: 'Aparecé primero cuando alguien busca tu rubro en tu ciudad. Auditoría técnica, keywords estratégicas y contenido optimizado cada mes.',
    badge: 'Tu competencia aparece antes que vos en Google ahora mismo',
    badgeStyle: 'danger',
    roi: 'Top 3',
    roiDetail: 'posicionamiento en búsquedas locales de tu rubro',
    icon: Search,
    accentColor: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    ctaText: 'VER MI AUDITORÍA GRATIS',
  },
  'ecommerce': {
    id: 'ecommerce',
    name: 'Vendé Mientras Dormís',
    headline: 'Tu catálogo vende solo, integrado con MercadoPago',
    description: 'Tu catálogo online con pagos reales. Tus clientes reservan, señan o compran directamente desde tu sitio. Integrado con MercadoPago.',
    badge: 'El 35% de las decisiones de compra se hacen después de las 22hs',
    badgeStyle: 'info',
    roi: '35%',
    roiDetail: 'de las compras se deciden fuera del horario laboral',
    icon: ShoppingCart,
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
  },
  'pixel-retargeting': {
    id: 'pixel-retargeting',
    name: 'Recuperación de Ventas',
    headline: 'El 97% se va. Traelos de vuelta automáticamente.',
    description: 'El 97% de los visitantes se van sin contactarte. Este sistema los identifica y los trae de vuelta con publicidad automática en Google y Meta.',
    roi: '97%',
    roiDetail: 'de visitantes abandonan sin contactarte — los recuperamos',
    icon: Target,
    accentColor: 'text-red-400',
    accentBg: 'bg-red-500/10',
    ctaText: 'ACTIVAR RECUPERACIÓN DE VENTAS',
    widgetType: 'pixel-losses',
  },
  'motor-resenias': {
    id: 'motor-resenias',
    name: 'Motor de Reseñas Automático',
    headline: 'Acumulá 5 estrellas en Google sin pedirlo vos',
    description: 'Después de cada venta o visita, tu cliente recibe un mensaje automático pidiendo 5 estrellas en Google. Sin pedirlo vos manualmente nunca más.',
    roi: '34%',
    roiDetail: 'tasa de conversión solicitud → reseña publicada en Google',
    icon: Star,
    accentColor: 'text-yellow-400',
    accentBg: 'bg-yellow-500/10',
    ctaText: 'ACTIVAR MOTOR DE RESEÑAS',
    widgetType: 'review-comparison',
  },
  'mini-crm': {
    id: 'mini-crm',
    name: 'Mini-CRM & Gestión de Leads',
    headline: 'Nunca más pierdas un cliente por falta de seguimiento',
    description: 'Todos tus leads en un solo lugar. Desde que te contactan hasta que cierran la venta. Nunca más pierdas un cliente por falta de seguimiento.',
    badge: 'El 80% de las ventas requieren 5 seguimientos. El 44% se rinde después del primero.',
    badgeStyle: 'warning',
    roi: '80%',
    roiDetail: 'de las ventas requieren al menos 5 seguimientos para cerrar',
    icon: Users,
    accentColor: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10',
  },
  'email-nurturing': {
    id: 'email-nurturing',
    name: 'Email Marketing & Nurturing',
    headline: 'Leads fríos se convierten en clientes solos',
    description: 'Secuencias automáticas que convierten leads fríos en clientes. Alguien pregunta y no compra hoy → en 15 días recibe una oferta personalizada automáticamente.',
    badge: 'ROI promedio del email marketing: $42 por cada $1 invertido',
    badgeStyle: 'info',
    roi: '42:1',
    roiDetail: 'ROI promedio documentado del email marketing',
    icon: Mail,
    accentColor: 'text-violet-400',
    accentBg: 'bg-violet-500/10',
  },
}

interface LockedFeatureViewProps {
  featureId: string
}

export function LockedFeatureView({ featureId }: LockedFeatureViewProps) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  const config = FEATURE_CONFIGS[featureId] ?? {
    id: featureId,
    name: 'Módulo Premium',
    headline: 'Desbloqueá este módulo avanzado',
    description: 'Esta funcionalidad está disponible para clientes que han activado el paquete Premium.',
    roi: '+25%',
    roiDetail: 'impacto promedio en métricas de negocio',
    icon: Star,
    accentColor: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
  }

  const FeatureIcon = config.icon as React.FC<{ size: number; className?: string }>
  const ctaLabel = config.ctaText ?? 'AGENDAR LLAMADA PARA ACTIVAR'
  const badgeStyle = config.badgeStyle ? BADGE_STYLES[config.badgeStyle] : BADGE_STYLES.info

  function handleRequest() {
    if (sent || isPending) return
    startTransition(async () => {
      const result = await requestUpsellAction(config.id, config.name)
      if (result.ok) {
        setSent(true)
        toast.success('¡Solicitud enviada! Te contactamos en menos de 24hs.', {
          description: `Módulo: ${config.name}`,
        })
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden rounded-2xl">
      {/* Blurred mock background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
        <div className="absolute inset-0 grid grid-cols-3 gap-3 p-4 grayscale blur-lg opacity-30">
          {Array.from<void>({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/5 border border-white/10"
              style={{ height: i % 3 === 0 ? '160px' : '100px' }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[#040506]/80 backdrop-blur-lg rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 rounded-2xl" />
      </div>

      {/* Central card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080a0d]/90 backdrop-blur-2xl p-8 shadow-2xl shadow-black/50">
          <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl" />

          {/* Icon + title */}
          <div className="relative z-10 flex items-center gap-4 mb-6">
            <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 ${config.accentBg}`}>
              <FeatureIcon size={24} className={config.accentColor} />
              <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-white/20 shadow">
                <Lock size={10} className="text-zinc-300" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Módulo Premium</p>
              <h2 className="text-lg font-bold text-white tracking-tight leading-snug">{config.name}</h2>
            </div>
          </div>

          <h3 className="relative z-10 text-2xl font-bold text-white leading-tight tracking-tight mb-3">
            {config.headline}
          </h3>

          <p className="relative z-10 text-sm text-zinc-400 leading-relaxed mb-5">
            {config.description}
          </p>

          {/* Badge */}
          {config.badge && (
            <div className={`relative z-10 rounded-xl border px-4 py-3 mb-5 text-sm font-medium leading-snug ${badgeStyle}`}>
              {config.badge}
            </div>
          )}

          {/* Special widget */}
          {config.widgetType && (
            <div className="relative z-10">
              <RandomWidget type={config.widgetType} />
            </div>
          )}

          {/* ROI callout */}
          <div className="relative z-10 flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-4 mb-7">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">ROI Documentado</p>
              <p className="text-sm text-zinc-200 leading-snug">
                <strong className="text-emerald-400 text-base font-bold">{config.roi}</strong>{' '}
                {config.roiDetail}
              </p>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            onClick={handleRequest}
            disabled={isPending || sent}
            whileHover={!isPending && !sent ? { scale: 1.02 } : {}}
            whileTap={!isPending && !sent ? { scale: 0.98 } : {}}
            className="group relative z-10 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-black uppercase tracking-wider shadow-[0_0_24px_rgba(6,182,212,0.35)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_32px_rgba(6,182,212,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                <span>Enviando...</span>
              </>
            ) : sent ? (
              <>
                <span>✓ Solicitud enviada</span>
              </>
            ) : (
              <>
                <span>{ctaLabel}</span>
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </motion.button>

          <p className="relative z-10 mt-3 text-center text-xs text-zinc-600">
            Sin compromiso · Activación en 24 horas
          </p>
        </div>
      </motion.div>
    </div>
  )
}

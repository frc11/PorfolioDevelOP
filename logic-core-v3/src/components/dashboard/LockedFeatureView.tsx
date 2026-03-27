'use client'

import { motion } from 'framer-motion'
import {
  Lock,
  TrendingUp,
  ArrowRight,
  Star,
  MessageCircle,
  Calendar,
  Share2,
  Search,
  ShoppingCart,
  Target,
  Users,
  Mail,
  Zap,
  Shield,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { requestUpsellAction } from '@/lib/actions/upsell'

type WidgetType = 'whatsapp-counter' | 'pixel-losses' | 'review-comparison'

interface FeatureConfig {
  id: string
  name: string
  headline: string
  description: string
  badge?: string
  roi: string
  roiDetail: string
  priceFrom: number
  icon: React.ElementType
  accentColor: string
  accentBg: string
  accentBorder: string
  accentGlow: string
  ctaText?: string
  widgetType?: WidgetType
}

// ─── Special widgets ──────────────────────────────────────────────────────────

function RandomWidget({ type }: { type: WidgetType }) {
  const [value] = useState<number>(() => {
    if (type === 'whatsapp-counter') return Math.floor(Math.random() * 25) + 23
    if (type === 'pixel-losses') return Math.floor(Math.random() * 46) + 89
    return 0
  })

  if (type === 'whatsapp-counter') {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
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
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4">
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

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
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

// ─── Feature config map ───────────────────────────────────────────────────────

const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  'email-automation': {
    id: 'email-automation',
    name: 'Email Automation',
    headline: 'Convierte silencio en ventas automáticas',
    description:
      'Secuencias de nurturing inteligentes que convierten leads fríos en clientes. Sin intervención manual. El sistema trabaja mientras dormís.',
    badge: 'ROI promedio del email marketing: $42 por cada $1 invertido',
    roi: '+40%',
    roiDetail: 'aumento promedio en tasa de conversión de leads',
    priceFrom: 100,
    icon: Zap,
    accentColor: 'text-violet-400',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-violet-500/30',
    accentGlow: 'rgba(139, 92, 246, 0.3)',
  },
  'client-portal': {
    id: 'client-portal',
    name: 'Portal de Clientes',
    headline: 'Tu marca, presente 24/7 para tus clientes',
    description:
      'Portal white-label donde tus clientes acceden a propuestas, contratos, métricas y comunicación. Profesionalismo que justifica precios premium.',
    badge: 'Empresas con portal de clientes retienen 30% más',
    roi: '+30%',
    roiDetail: 'mejora en retención y satisfacción de clientes B2B',
    priceFrom: 120,
    icon: Shield,
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
    accentGlow: 'rgba(245, 158, 11, 0.3)',
  },
  'whatsapp-autopilot': {
    id: 'whatsapp-autopilot',
    name: 'Recepcionista IA & WhatsApp Autopilot',
    headline: 'Tu negocio abierto aunque estés durmiendo',
    description:
      'Un agente de IA responde consultas, califica leads y agenda reuniones por WhatsApp las 24hs. Tu negocio abierto aunque estés durmiendo.',
    badge: 'Ahorrá +15 horas semanales en atención al cliente',
    roi: '+15h',
    roiDetail: 'semanales recuperadas en atención al cliente con IA',
    priceFrom: 150,
    icon: MessageCircle,
    accentColor: 'text-green-400',
    accentBg: 'bg-green-500/10',
    accentBorder: 'border-green-500/30',
    accentGlow: 'rgba(34, 197, 94, 0.3)',
    widgetType: 'whatsapp-counter',
  },
  'agenda-inteligente': {
    id: 'agenda-inteligente',
    name: 'Agenda Inteligente 24/7',
    headline: 'La agenda se gestiona sola',
    description:
      'Tus clientes reservan turnos o test drives solos, en cualquier momento. Sin llamadas, sin idas y vueltas. La agenda se gestiona sola.',
    badge: 'El 60% de las reservas online se hacen fuera del horario laboral',
    roi: '60%',
    roiDetail: 'de las reservas llegan fuera del horario laboral',
    priceFrom: 80,
    icon: Calendar,
    accentColor: 'text-blue-400',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/30',
    accentGlow: 'rgba(59, 130, 246, 0.3)',
  },
  'social-media-hub': {
    id: 'social-media-hub',
    name: 'Social Media & Content Hub',
    headline: 'Aprobá con un click, publicamos nosotros',
    description:
      'Tu agencia crea el contenido, vos lo aprobás con un click desde acá. Publicación automática en todas tus redes. Sin grupos de WhatsApp, sin confusiones.',
    badge: 'Empresas con presencia activa en redes venden 3x más',
    roi: '3x',
    roiDetail: 'más ventas en empresas con presencia activa en redes sociales',
    priceFrom: 200,
    icon: Share2,
    accentColor: 'text-pink-400',
    accentBg: 'bg-pink-500/10',
    accentBorder: 'border-pink-500/30',
    accentGlow: 'rgba(236, 72, 153, 0.3)',
  },
  'seo-avanzado': {
    id: 'seo-avanzado',
    name: 'Dominio de Búsqueda Local',
    headline: 'Aparecé primero cuando buscan tu rubro',
    description:
      'Aparecé primero cuando alguien busca tu rubro en tu ciudad. Auditoría técnica, keywords estratégicas y contenido optimizado cada mes.',
    badge: 'Tu competencia aparece antes que vos en Google ahora mismo',
    roi: 'Top 3',
    roiDetail: 'posicionamiento en búsquedas locales de tu rubro',
    priceFrom: 120,
    icon: Search,
    accentColor: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/30',
    accentGlow: 'rgba(6, 182, 212, 0.3)',
    ctaText: 'VER MI AUDITORÍA GRATIS',
  },
  'ecommerce': {
    id: 'ecommerce',
    name: 'Vendé Mientras Dormís',
    headline: 'Tu catálogo vende solo, integrado con MercadoPago',
    description:
      'Tu catálogo online con pagos reales. Tus clientes reservan, señan o compran directamente desde tu sitio. Integrado con MercadoPago.',
    badge: 'El 35% de las decisiones de compra se hacen después de las 22hs',
    roi: '35%',
    roiDetail: 'de las compras se deciden fuera del horario laboral',
    priceFrom: 300,
    icon: ShoppingCart,
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/30',
    accentGlow: 'rgba(16, 185, 129, 0.3)',
  },
  'pixel-retargeting': {
    id: 'pixel-retargeting',
    name: 'Recuperación de Ventas',
    headline: 'El 97% se va. Traelos de vuelta automáticamente.',
    description:
      'El 97% de los visitantes se van sin contactarte. Este sistema los identifica y los trae de vuelta con publicidad automática en Google y Meta.',
    roi: '97%',
    roiDetail: 'de visitantes abandonan sin contactarte — los recuperamos',
    priceFrom: 100,
    icon: Target,
    accentColor: 'text-red-400',
    accentBg: 'bg-red-500/10',
    accentBorder: 'border-red-500/30',
    accentGlow: 'rgba(239, 68, 68, 0.3)',
    ctaText: 'ACTIVAR RECUPERACIÓN DE VENTAS',
    widgetType: 'pixel-losses',
  },
  'motor-resenias': {
    id: 'motor-resenias',
    name: 'Motor de Reseñas Automático',
    headline: 'Acumulá 5 estrellas en Google sin pedirlo vos',
    description:
      'Después de cada venta o visita, tu cliente recibe un mensaje automático pidiendo 5 estrellas en Google. Sin pedirlo vos manualmente nunca más.',
    roi: '34%',
    roiDetail: 'tasa de conversión solicitud → reseña publicada en Google',
    priceFrom: 60,
    icon: Star,
    accentColor: 'text-yellow-400',
    accentBg: 'bg-yellow-500/10',
    accentBorder: 'border-yellow-500/30',
    accentGlow: 'rgba(234, 179, 8, 0.3)',
    ctaText: 'ACTIVAR MOTOR DE RESEÑAS',
    widgetType: 'review-comparison',
  },
  'mini-crm': {
    id: 'mini-crm',
    name: 'Mini-CRM & Gestión de Leads',
    headline: 'Nunca más pierdas un cliente por falta de seguimiento',
    description:
      'Todos tus leads en un solo lugar. Desde que te contactan hasta que cierran la venta. Nunca más pierdas un cliente por falta de seguimiento.',
    badge: 'El 80% de las ventas requieren 5 seguimientos. El 44% se rinde después del primero.',
    roi: '80%',
    roiDetail: 'de las ventas requieren al menos 5 seguimientos para cerrar',
    priceFrom: 80,
    icon: Users,
    accentColor: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10',
    accentBorder: 'border-indigo-500/30',
    accentGlow: 'rgba(99, 102, 241, 0.3)',
  },
  'email-nurturing': {
    id: 'email-nurturing',
    name: 'Email Marketing & Nurturing',
    headline: 'Leads fríos se convierten en clientes solos',
    description:
      'Secuencias automáticas que convierten leads fríos en clientes. Alguien pregunta y no compra hoy → en 15 días recibe una oferta personalizada automáticamente.',
    badge: 'ROI promedio del email marketing: $42 por cada $1 invertido',
    roi: '42:1',
    roiDetail: 'ROI promedio documentado del email marketing',
    priceFrom: 100,
    icon: Mail,
    accentColor: 'text-violet-400',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-violet-500/30',
    accentGlow: 'rgba(139, 92, 246, 0.3)',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LockedFeatureViewProps {
  featureId: string
}

export function LockedFeatureView({ featureId }: LockedFeatureViewProps) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  const config: FeatureConfig = FEATURE_CONFIGS[featureId] ?? {
    id: featureId,
    name: 'Módulo Premium',
    headline: 'Desbloqueá este módulo avanzado',
    description:
      'Esta funcionalidad está disponible para clientes que han activado el paquete Premium.',
    roi: '+25%',
    roiDetail: 'impacto promedio en métricas de negocio',
    priceFrom: 80,
    icon: Star,
    accentColor: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/30',
    accentGlow: 'rgba(6, 182, 212, 0.3)',
  }

  const FeatureIcon = config.icon as React.FC<{ size: number; className?: string }>
  const ctaLabel = config.ctaText ?? 'AGENDAR LLAMADA PARA ACTIVAR'

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
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        aria-hidden="true"
      >
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
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080a0d]/95 backdrop-blur-2xl p-8 shadow-2xl shadow-black/60">
          {/* Ambient accent glow top-right */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl"
            style={{ background: config.accentGlow, opacity: 0.35 }}
          />
          {/* Violet glow bottom-left */}
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

          {/* ── MÓDULO PREMIUM badge (violet) ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="relative z-10 mb-6 flex justify-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-violet-300">
              <Lock size={9} />
              Módulo Premium
            </span>
          </motion.div>

          {/* ── Large icon with glow ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mb-5 flex justify-center"
          >
            <div
              className={`flex h-[72px] w-[72px] items-center justify-center rounded-3xl ${config.accentBg} border ${config.accentBorder}`}
              style={{
                boxShadow: `0 0 32px ${config.accentGlow}, 0 0 64px ${config.accentGlow.replace('0.3', '0.12')}`,
              }}
            >
              <FeatureIcon size={32} className={config.accentColor} />
            </div>
          </motion.div>

          {/* ── Module name large ── */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="relative z-10 text-[19px] font-black text-white tracking-tight leading-tight text-center mb-1.5"
          >
            {config.name}
          </motion.h2>

          {/* ── Headline ── */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative z-10 text-sm font-semibold text-zinc-400 leading-snug text-center mb-4"
          >
            {config.headline}
          </motion.h3>

          {/* ── Description ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="relative z-10 text-sm text-zinc-300 leading-relaxed text-center mb-5"
          >
            {config.description}
          </motion.p>

          {/* ── PRICE ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.4 }}
            className="relative z-10 text-center mb-5"
          >
            <p className="text-[26px] font-black text-white leading-none tracking-tight">
              desde ${config.priceFrom}{' '}
              <span className="text-base font-semibold text-zinc-300">USD/mes</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-1.5 tracking-wide">
              · Activación en 24 horas · Sin permanencia
            </p>
          </motion.div>

          {/* ── Cyan benefit badge ── */}
          {config.badge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.4 }}
              className="relative z-10 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-3 mb-5 text-[12px] font-medium leading-snug text-cyan-300 text-center"
            >
              {config.badge}
            </motion.div>
          )}

          {/* ── Special widget ── */}
          {config.widgetType && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="relative z-10 mb-5"
            >
              <RandomWidget type={config.widgetType} />
            </motion.div>
          )}

          {/* ── Subtle separator ── */}
          <div className="relative z-10 border-t border-white/[0.05] mb-5" />

          {/* ── ROI callout ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48, duration: 0.4 }}
            className="relative z-10 flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] px-5 py-4 mb-6"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-0.5">
                ROI Documentado
              </p>
              <p className="text-sm text-zinc-200 leading-snug">
                <strong className="text-emerald-400 text-base font-bold">{config.roi}</strong>{' '}
                {config.roiDetail}
              </p>
            </div>
          </motion.div>

          {/* ── CTA gradient button ── */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.4 }}
            onClick={handleRequest}
            disabled={isPending || sent}
            whileHover={!isPending && !sent ? { scale: 1.02 } : {}}
            whileTap={!isPending && !sent ? { scale: 0.98 } : {}}
            className="group relative z-10 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-sm font-black text-black uppercase tracking-wider transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70"
            style={
              sent
                ? {
                    background: 'rgba(16,185,129,0.1)',
                    color: 'rgb(52,211,153)',
                    border: '1px solid rgba(16,185,129,0.25)',
                  }
                : {
                    background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                    boxShadow:
                      '0 0 28px rgba(6,182,212,0.40), 0 0 56px rgba(16,185,129,0.18)',
                  }
            }
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                <span>Enviando...</span>
              </>
            ) : sent ? (
              <span className="font-black">✓ Solicitud enviada</span>
            ) : (
              <>
                <span>{ctaLabel}</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </>
            )}
          </motion.button>

          {/* ── Sub-text under button ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="relative z-10 mt-3 text-center text-[11px] text-zinc-600"
          >
            Sin compromiso · Te contactamos en &lt; 24hs
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

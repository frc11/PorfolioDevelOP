'use client'

import { motion } from 'framer-motion'
import { Lock, TrendingUp, Zap, ArrowRight, Shield, Star } from 'lucide-react'
import Link from 'next/link'

interface FeatureConfig {
  id: string
  name: string
  headline: string
  description: string
  roi: string
  roiDetail: string
  icon: React.ElementType
  accentColor: string
  accentBg: string
  mockScreenshot?: string
}

const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  'email-automation': {
    id: 'email-automation',
    name: 'Email Automation',
    headline: 'Convierte silencio en ventas automáticas',
    description:
      'Secuencias de nurturing inteligentes que convierten leads fríos en clientes. Sin intervención manual. El sistema trabaja mientras dormís.',
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
    description:
      'Portal white-label donde tus clientes acceden a propuestas, contratos, métricas y comunicación. Profesionalismo que justifica precios premium.',
    roi: '+30%',
    roiDetail: 'mejora en retención y satisfacción de clientes B2B',
    icon: Shield,
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
  },
}

interface LockedFeatureViewProps {
  featureId: string
}

export function LockedFeatureView({ featureId }: LockedFeatureViewProps) {
  const config = FEATURE_CONFIGS[featureId] ?? {
    id: featureId,
    name: 'Módulo Premium',
    headline: 'Desbloquea este módulo avanzado',
    description: 'Esta funcionalidad está disponible para clientes que han activado el paquete Premium.',
    roi: '+25%',
    roiDetail: 'impacto promedio en métricas de negocio',
    icon: Star,
    accentColor: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
  }

  const FeatureIcon = config.icon as React.FC<{ size: number; className?: string }>

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden rounded-2xl">
      {/* Blurred mock background */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        aria-hidden="true"
      >
        {/* Simulated dashboard mockup tiles */}
        <div className="absolute inset-0 grid grid-cols-3 gap-3 p-4 grayscale blur-lg opacity-30">
          {Array.from<void>({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/5 border border-white/10"
              style={{ height: i % 3 === 0 ? '160px' : '100px' }}
            />
          ))}
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#040506]/80 backdrop-blur-lg rounded-2xl" />
        {/* Ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 rounded-2xl" />
      </div>

      {/* Central premium card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080a0d]/90 backdrop-blur-2xl p-8 shadow-2xl shadow-black/50">
          {/* Corner glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl" />

          {/* Lock + Icon badge */}
          <div className="relative z-10 flex items-center gap-4 mb-6">
            <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 ${config.accentBg}`}>
              <FeatureIcon size={24} className={config.accentColor} />
              <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-white/20 shadow">
                <Lock size={10} className="text-zinc-300" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-0.5">
                Módulo Premium
              </p>
              <h2 className="text-lg font-bold text-white tracking-tight">{config.name}</h2>
            </div>
          </div>

          {/* Headline */}
          <h3 className="relative z-10 text-2xl font-bold text-white leading-tight tracking-tight mb-3">
            {config.headline}
          </h3>

          <p className="relative z-10 text-sm text-zinc-400 leading-relaxed mb-6">
            {config.description}
          </p>

          {/* ROI callout */}
          <div className="relative z-10 flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-4 mb-7">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">
                ROI Documentado
              </p>
              <p className="text-sm text-zinc-200 leading-snug">
                <strong className="text-emerald-400 text-base font-bold">{config.roi}</strong>{' '}
                {config.roiDetail}
              </p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard/soporte"
            className="group relative z-10 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-black uppercase tracking-wider shadow-[0_0_24px_rgba(6,182,212,0.35)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_32px_rgba(6,182,212,0.5)] active:scale-[0.98]"
          >
            <span>Agendar llamada para activar módulo</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <p className="relative z-10 mt-3 text-center text-xs text-zinc-600">
            Sin compromiso · Activación en 24 horas
          </p>
        </div>
      </motion.div>
    </div>
  )
}

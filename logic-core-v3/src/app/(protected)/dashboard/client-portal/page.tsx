import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import Link from 'next/link'
import {
  Building2,
  FileSignature,
  BarChart3,
  Globe,
  ImageIcon,
  Palette,
  ArrowRight,
  Users,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react'

export const metadata = { title: 'Portal de Clientes | develOP Dashboard' }

// ─── Styles ───────────────────────────────────────────────────────────────────

const GLASS: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(255,255,255,0.02)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONCEPT_CARDS = [
  {
    icon: Building2,
    title: 'Tu marca, tu portal',
    description:
      'Tus clientes acceden con tu logo, tus colores y tu dominio. Una experiencia 100% white-label que refleja tu identidad.',
    color: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    border: '1px solid rgba(6,182,212,0.15)',
    bg: 'rgba(6,182,212,0.03)',
  },
  {
    icon: FileSignature,
    title: 'Propuestas digitales',
    description:
      'Enviá propuestas profesionales que tus clientes pueden revisar y firmar online. Sin PDFs, sin correos perdidos.',
    color: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    border: '1px solid rgba(139,92,246,0.15)',
    bg: 'rgba(139,92,246,0.03)',
  },
  {
    icon: BarChart3,
    title: 'Métricas compartidas',
    description:
      'Mostrá resultados en tiempo real a tus clientes: tráfico, conversiones, ROI. Genera confianza y retención.',
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    border: '1px solid rgba(34,197,94,0.15)',
    bg: 'rgba(34,197,94,0.03)',
  },
]

const CONFIG_ITEMS = [
  {
    icon: Globe,
    label: 'Dominio personalizado',
    example: 'portal.tuempresa.com',
    status: 'pending' as const,
  },
  {
    icon: ImageIcon,
    label: 'Logo',
    example: 'Imagen de tu marca',
    status: 'pending' as const,
  },
  {
    icon: Palette,
    label: 'Color principal',
    example: 'Identidad visual',
    status: 'pending' as const,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientPortalPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('client-portal') ?? false
  if (!isUnlocked) {
    return <LockedFeatureView featureId="client-portal" />
  }

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Header */}
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
            <Building2 size={18} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Portal White-label para tus Clientes</h1>
            <p className="text-sm text-zinc-400">Ofrecé a tus propios clientes una experiencia con tu marca</p>
          </div>
        </div>
      </FadeIn>

      {/* Concept cards */}
      <FadeIn delay={0.1}>
        <div className="grid gap-4 sm:grid-cols-3">
          {CONCEPT_CARDS.map((c) => {
            const Icon = c.icon
            return (
              <div
                key={c.title}
                className="rounded-2xl p-5"
                style={{ border: c.border, background: c.bg }}
              >
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${c.iconBg}`}>
                  <Icon size={16} className={c.color} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-zinc-100">{c.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-500">{c.description}</p>
              </div>
            )
          })}
        </div>
      </FadeIn>

      {/* Config status */}
      <FadeIn delay={0.2}>
        <div className="rounded-2xl" style={GLASS}>
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-medium text-zinc-200">Configuración del portal</h2>
            <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
              <AlertCircle size={10} />
              Sin configurar
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {CONFIG_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04]">
                      <Icon size={14} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-300">{item.label}</p>
                      <p className="text-xs text-zinc-600">{item.example}</p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/messages"
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/[0.06] hover:text-cyan-300"
                  >
                    Configurar
                    <ArrowRight size={11} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </FadeIn>

      {/* Clients with access */}
      <FadeIn delay={0.3}>
        <div className="rounded-2xl" style={GLASS}>
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-medium text-zinc-200">Clientes con acceso</h2>
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Users size={12} />
              <span>0 clientes</span>
            </div>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center gap-4 px-5 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
              <Users size={22} className="text-zinc-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">Sin clientes en el portal</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-zinc-600">
                Aún no tenés clientes en tu portal. Contactanos para configurarlo y
                comenzar a ofrecerles acceso con tu marca.
              </p>
            </div>
            <Link
              href="/dashboard/messages"
              className="mt-1 flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-cyan-400 active:scale-[0.97]"
            >
              <CalendarCheck size={14} />
              Agendar configuración
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}

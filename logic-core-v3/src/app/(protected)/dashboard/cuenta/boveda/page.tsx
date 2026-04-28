import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { AssetType } from '@prisma/client'
import {
  FileText,
  Image as ImageIcon,
  BookOpen,
  Layers,
  KeyRound,
  Archive,
  Lock,
  LockOpen,
  ShieldCheck,
  ShieldAlert,
  User,
  Clock,
  Upload,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/dashboard/StaggerWrapper'
import { VaultRevealButton } from '@/components/dashboard/VaultRevealButton'
import { VaultRequestModal } from '@/components/dashboard/VaultRequestModal'

// ─── Type config ───────────────────────────────────────────────────────────────

interface TypeConfig {
  icon: LucideIcon
  label: string
  color: string
  bg: string
  border: string
  hoverBorder: string
  glowRgb: string
}

const TYPE_CONFIG: Record<AssetType, TypeConfig> = {
  DOCUMENT: {
    icon: FileText,
    label: 'Documento',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    hoverBorder: 'group-hover:border-cyan-500/40',
    glowRgb: '6,182,212',
  },
  IMAGE: {
    icon: ImageIcon,
    label: 'Imagen',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    hoverBorder: 'group-hover:border-emerald-500/40',
    glowRgb: '52,211,153',
  },
  BRANDBOOK: {
    icon: BookOpen,
    label: 'Brandbook',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    hoverBorder: 'group-hover:border-violet-500/40',
    glowRgb: '167,139,250',
  },
  LOGO: {
    icon: Layers,
    label: 'Logo',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    hoverBorder: 'group-hover:border-amber-500/40',
    glowRgb: '251,191,36',
  },
  ACCESS: {
    icon: KeyRound,
    label: 'Acceso',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    hoverBorder: 'group-hover:border-red-500/40',
    glowRgb: '239,68,68',
  },
  OTHER: {
    icon: Archive,
    label: 'Otro',
    color: 'text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/20',
    hoverBorder: 'group-hover:border-zinc-500/30',
    glowRgb: '113,113,122',
  },
}

// ─── Demo activity log ─────────────────────────────────────────────────────────

const ACTIVITY_LOG = [
  { icon: User,   actor: 'Vos',          action: 'accediste a',  resource: 'Credenciales de Dominio', time: 'hace 2 h',    isAdmin: false },
  { icon: Upload, actor: 'Admin develOP', action: 'subió',        resource: 'Guía de Estilo v2 (PDF)', time: 'hace 5 h',    isAdmin: true  },
  { icon: User,   actor: 'Vos',          action: 'descargaste',  resource: 'Logotipo Principal (PNG)', time: 'ayer, 18:45', isAdmin: false },
  { icon: Upload, actor: 'Admin develOP', action: 'actualizó',    resource: 'Brandbook Corporativo',    time: 'hace 3 días', isAdmin: true  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function VaultPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const assets = await prisma.clientAsset.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  })

  const totalCount = assets.length

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <FadeIn delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
          <div className="flex flex-col gap-3">


            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap pl-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                AES-256 Safe
              </span>
              {totalCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                  {totalCount} {totalCount === 1 ? 'activo' : 'activos'} almacenados
                </span>
              )}
            </div>
          </div>

          <VaultRequestModal />
        </div>
      </FadeIn>

      {/* ── EMPTY STATE ─────────────────────────────────────────────────────── */}
      {totalCount === 0 && (
        <FadeIn delay={0.1}>
          <div className="relative flex flex-col items-center gap-6 rounded-[2rem] border border-white/8 bg-[#0a0c0f]/60 backdrop-blur-xl py-20 px-8 text-center overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

            {/* Vault icon with pulse */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 animate-pulse blur-xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] shadow-2xl">
                <ShieldCheck size={34} className="text-zinc-600" />
              </div>
            </div>

            <div className="max-w-sm space-y-2">
              <h2 className="text-base font-black tracking-tight text-white uppercase italic">
                Tu bóveda está vacía
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed">
                El equipo develOP irá agregando tus recursos a medida que avance el proyecto.
              </p>
            </div>

            <VaultRequestModal />
          </div>
        </FadeIn>
      )}

      {/* ── ASSET GRID ─────────────────────────────────────────────────────── */}
      {totalCount > 0 && (
        <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const cfg = TYPE_CONFIG[asset.type]
            const Icon = cfg.icon
            const isAccess = asset.type === 'ACCESS'

            return (
              <StaggerItem key={asset.id}>
                <div
                  className={`group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/8 bg-[#07080a]/60 p-6 backdrop-blur-2xl transition-all duration-400 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,0,0,0.4)] ${cfg.hoverBorder} ${
                    isAccess ? 'border-red-500/15 bg-red-950/10' : ''
                  }`}
                >
                  {/* Dot-grid background */}
                  <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                      backgroundSize: '22px 22px',
                    }}
                  />

                  {/* Ambient corner glow on hover */}
                  <div
                    className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
                    style={{ background: `rgba(${cfg.glowRgb},0.15)` }}
                  />

                  {/* AES badge */}
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/5 bg-black/40 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-600 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    AES-256
                  </div>

                  {/* Icon + title */}
                  <div className="relative z-10 flex items-start gap-4 pr-14">
                    <div
                      className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] transition-all duration-400 group-hover:scale-105 ${cfg.color}`}
                      style={{ boxShadow: `0 0 20px rgba(${cfg.glowRgb},0)`, transition: 'box-shadow 0.4s' }}
                    >
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 blur-md transition-opacity duration-400 group-hover:opacity-100"
                        style={{ background: `rgba(${cfg.glowRgb},0.2)` }}
                      />
                      <Icon size={24} className="relative z-10" />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <h3 className="truncate text-sm font-bold text-white group-hover:text-white transition-colors">
                        {asset.name}
                      </h3>
                      <span
                        className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.border} ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {asset.description && (
                    <p className="relative z-10 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {asset.description}
                    </p>
                  )}

                  {/* Footer: date + access button */}
                  <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">Cargado</span>
                      <span className="text-[10px] font-medium text-zinc-500">
                        {new Date(asset.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {!isAccess && (
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={[
                          'group/btn relative flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-300 transition-all duration-300 backdrop-blur-md',
                          `hover:bg-[rgba(${cfg.glowRgb},0.15)] hover:border-[rgba(${cfg.glowRgb},0.4)] hover:text-white hover:shadow-[0_0_20px_rgba(${cfg.glowRgb},0.25)]`,
                        ].join(' ')}
                      >
                        <span className="relative h-4 w-4">
                          <Lock   size={13} className="absolute inset-0 transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50 group-hover/btn:rotate-12" />
                          <LockOpen size={13} className="absolute inset-0 opacity-0 scale-50 -rotate-12 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:scale-100 group-hover/btn:rotate-0" />
                        </span>
                        Acceder
                      </a>
                    )}

                    {isAccess && (
                      <div className="flex items-center gap-1 text-[10px] text-red-400/60">
                        <ShieldAlert size={11} />
                        <span className="font-semibold">Sensible</span>
                      </div>
                    )}
                  </div>

                  {/* ACCESS reveal section */}
                  {isAccess && (
                    <div className="relative z-10">
                      <VaultRevealButton url={asset.url} />
                    </div>
                  )}

                  {/* Bottom scanline */}
                  <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      )}

      {/* ── ACTIVITY TIMELINE ───────────────────────────────────────────────── */}
      <FadeIn delay={0.18}>
        <div className="rounded-2xl border border-white/8 bg-black/20 p-6 backdrop-blur-md">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-emerald-400">
                <ShieldCheck size={15} />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                Registro de Integridad y Accesos
              </h2>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/8 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-500/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Monitoreo Activo
            </span>
          </div>

          {/* Timeline entries */}
          <div className="relative pl-5">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/30 via-zinc-700/30 to-transparent" />

            <ul className="flex flex-col gap-4">
              {ACTIVITY_LOG.map((entry, i) => {
                const EntryIcon = entry.icon
                return (
                  <li key={i} className="relative group/log flex items-start justify-between gap-4">
                    {/* Timeline dot */}
                    <div className={`absolute -left-5 top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0a0b10] ${entry.isAdmin ? 'bg-cyan-500' : 'bg-zinc-600'}`} />

                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border ${entry.isAdmin ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400' : 'border-white/8 bg-zinc-900 text-zinc-500'}`}>
                        <EntryIcon size={13} />
                      </div>
                      <p className="text-[11px] leading-snug text-zinc-500">
                        <span className={`font-bold ${entry.isAdmin ? 'text-cyan-400' : 'text-zinc-300'}`}>
                          {entry.actor}
                        </span>
                        <span className="mx-1.5 opacity-60">{entry.action}</span>
                        <span className="font-semibold text-zinc-400 group-hover/log:text-zinc-200 transition-colors">
                          {entry.resource}
                        </span>
                      </p>
                    </div>

                    <span className="flex-shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-zinc-700">
                      <Clock size={9} />
                      {entry.time}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="mt-5 text-center text-[9px] font-medium text-zinc-700 italic">
            Los registros de acceso se mantienen por 30 días para tu auditoría personal.
          </p>
        </div>
      </FadeIn>

    </div>
  )
}

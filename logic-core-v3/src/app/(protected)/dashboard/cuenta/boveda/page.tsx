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
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { adminHoverCls } from '@/lib/hover'

// ─── Type config ───────────────────────────────────────────────────────────────
// El color por tipo es un ACENTO PUNTUAL (ícono + pill), no un tema.

interface TypeConfig {
  icon: LucideIcon
  label: string
  color: string
  bg: string
  border: string
}

const TYPE_CONFIG: Record<AssetType, TypeConfig> = {
  DOCUMENT: { icon: FileText, label: 'Documento', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  IMAGE: { icon: ImageIcon, label: 'Imagen', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  BRANDBOOK: { icon: BookOpen, label: 'Brandbook', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  LOGO: { icon: Layers, label: 'Logo', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ACCESS: { icon: KeyRound, label: 'Acceso', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  OTHER: { icon: Archive, label: 'Otro', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
}

// ─── Demo activity log (PLACEHOLDER — data fake; modelo real = schema, parada aparte) ──

const ACTIVITY_LOG = [
  { icon: User, actor: 'Vos', action: 'accediste a', resource: 'Credenciales de Dominio', time: 'hace 2 h', isAdmin: false },
  { icon: Upload, actor: 'Admin develOP', action: 'subió', resource: 'Guía de Estilo v2 (PDF)', time: 'hace 5 h', isAdmin: true },
  { icon: User, actor: 'Vos', action: 'descargaste', resource: 'Logotipo Principal (PNG)', time: 'ayer, 18:45', isAdmin: false },
  { icon: Upload, actor: 'Admin develOP', action: 'actualizó', resource: 'Brandbook Corporativo', time: 'hace 3 días', isAdmin: true },
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
    <div className="flex w-full flex-col gap-6">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <FadeIn delay={0}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              AES-256
            </span>
            {totalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                {totalCount} {totalCount === 1 ? 'activo' : 'activos'} almacenados
              </span>
            )}
          </div>

          <VaultRequestModal />
        </div>
      </FadeIn>

      {/* ── EMPTY STATE ─────────────────────────────────────────────────────── */}
      {totalCount === 0 && (
        <FadeIn delay={0.1}>
          <Card
            variant="dashed"
            padding="none"
            className="flex flex-col items-center gap-5 px-8 py-20 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
              <ShieldCheck size={28} strokeWidth={1.5} className="text-zinc-600" />
            </div>
            <div className="max-w-sm space-y-2">
              <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                Tu bóveda está vacía
              </h2>
              <p className="text-sm leading-relaxed text-zinc-500">
                El equipo develOP irá agregando tus recursos a medida que avance el proyecto.
              </p>
            </div>
            <VaultRequestModal />
          </Card>
        </FadeIn>
      )}

      {/* ── ASSET GRID ─────────────────────────────────────────────────────── */}
      {totalCount > 0 && (
        <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const cfg = TYPE_CONFIG[asset.type]
            const Icon = cfg.icon
            const isAccess = asset.type === 'ACCESS'

            return (
              <StaggerItem key={asset.id}>
                <Card
                  variant="interactive"
                  padding="lg"
                  className={cn(
                    'group flex h-full flex-col gap-5',
                    adminHoverCls,
                    isAccess && 'border-red-500/15',
                  )}
                >
                  {/* AES badge */}
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    AES-256
                  </div>

                  {/* Icon + title */}
                  <div className="flex items-start gap-4 pr-16">
                    <div
                      className={cn(
                        'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] transition-transform duration-200 group-hover:scale-105',
                        cfg.color,
                      )}
                    >
                      <Icon size={24} strokeWidth={1.5} />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <h3 className="truncate text-sm font-semibold text-zinc-100">{asset.name}</h3>
                      <span
                        className={cn(
                          'mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]',
                          cfg.bg,
                          cfg.border,
                          cfg.color,
                        )}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {asset.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
                      {asset.description}
                    </p>
                  )}

                  {/* Footer: date + access button */}
                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                        Cargado
                      </span>
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
                        className="group/btn flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300"
                      >
                        <span className="relative h-4 w-4">
                          <Lock
                            size={13}
                            strokeWidth={1.5}
                            className="absolute inset-0 transition-all duration-300 group-hover/btn:scale-50 group-hover/btn:opacity-0"
                          />
                          <LockOpen
                            size={13}
                            strokeWidth={1.5}
                            className="absolute inset-0 scale-50 opacity-0 transition-all duration-300 group-hover/btn:scale-100 group-hover/btn:opacity-100"
                          />
                        </span>
                        Acceder
                      </a>
                    )}

                    {isAccess && (
                      <div className="flex items-center gap-1 text-[10px] text-red-400/60">
                        <ShieldAlert size={11} strokeWidth={1.5} />
                        <span className="font-medium">Sensible</span>
                      </div>
                    )}
                  </div>

                  {/* ACCESS reveal section */}
                  {isAccess && <VaultRevealButton url={asset.url} />}
                </Card>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      )}

      {/* ── ACTIVITY TIMELINE (placeholder pulido — data fake) ───────────────── */}
      <FadeIn delay={0.18}>
        <Card variant="elevated" padding="lg">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={15} strokeWidth={1.5} />
              </div>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Registro de integridad y accesos
              </h2>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.08] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-emerald-500/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Monitoreo activo
            </span>
          </div>

          {/* Timeline entries */}
          <div className="relative pl-5">
            {/* Vertical line */}
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-emerald-500/30 via-zinc-700/30 to-transparent" />

            <ul className="flex flex-col gap-4">
              {ACTIVITY_LOG.map((entry, i) => {
                const EntryIcon = entry.icon
                return (
                  <li key={i} className="group/log relative flex items-start justify-between gap-4">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        'absolute -left-5 top-1 h-2.5 w-2.5 rounded-full ring-2 ring-zinc-950',
                        entry.isAdmin ? 'bg-cyan-500' : 'bg-zinc-600',
                      )}
                    />

                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border',
                          entry.isAdmin
                            ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400'
                            : 'border-white/10 bg-white/[0.03] text-zinc-500',
                        )}
                      >
                        <EntryIcon size={13} strokeWidth={1.5} />
                      </div>
                      <p className="text-[11px] leading-snug text-zinc-500">
                        <span className={cn('font-semibold', entry.isAdmin ? 'text-cyan-400' : 'text-zinc-300')}>
                          {entry.actor}
                        </span>
                        <span className="mx-1.5 opacity-60">{entry.action}</span>
                        <span className="font-medium text-zinc-400 transition-colors group-hover/log:text-zinc-200">
                          {entry.resource}
                        </span>
                      </p>
                    </div>

                    <span className="flex flex-shrink-0 items-center gap-1 text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-600">
                      <Clock size={9} strokeWidth={1.5} />
                      {entry.time}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="mt-5 text-center text-[9px] text-zinc-600">
            Los registros de acceso se mantienen por 30 días para tu auditoría personal.
          </p>
        </Card>
      </FadeIn>
    </div>
  )
}

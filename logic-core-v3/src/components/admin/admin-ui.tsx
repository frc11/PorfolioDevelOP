import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

type BadgeTone = 'success' | 'info' | 'warning' | 'danger' | 'urgent' | 'muted'

const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
  success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  info: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  warning: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  danger: 'border-red-400/20 bg-red-400/10 text-red-200',
  urgent: 'border-red-400/25 bg-red-500/12 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.14)] animate-admin-alert',
  muted: 'border-white/10 bg-white/[0.04] text-zinc-300',
}

export function getAdminBadgeTone(value: string) {
  const normalized = value.toUpperCase()

  if (['ACTIVE', 'RESOLVED', 'DONE', 'COMPLETED', 'SUCCESS'].includes(normalized)) return 'success'
  if (['IN_PROGRESS', 'OPEN'].includes(normalized)) return 'info'
  if (['PENDING', 'TODO', 'PLANNING', 'REVIEW', 'PAUSED', 'CONTACTADO'].includes(normalized)) return 'warning'
  if (['CANCELLED', 'CANCELED', 'OVERDUE', 'DESCARTADO'].includes(normalized)) return 'danger'
  if (['HIGH', 'URGENT', 'NUEVO'].includes(normalized)) return 'urgent'
  return 'muted'
}

export function AdminStatusBadge({
  label,
  tone,
  className,
}: {
  label: string
  tone?: BadgeTone
  className?: string
}) {
  const resolvedTone = tone ?? getAdminBadgeTone(label)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em]',
        BADGE_TONE_CLASS[resolvedTone],
        className
      )}
    >
      {label}
    </span>
  )
}

export function AdminSurface({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={cn('admin-surface rounded-[28px] p-5 sm:p-6', className)}>{children}</section>
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="admin-label text-cyan-400/75">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {description ? <p className="mt-2 text-sm text-zinc-500">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  icon: LucideIcon
  title: string
  description: string
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <div className="admin-surface flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/8 bg-white/[0.03] text-zinc-600">
        <Icon size={26} />
      </div>
      <div>
        <p className="text-lg font-medium text-zinc-200">{title}</p>
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
        {ctaHref && ctaLabel ? (
          <Link href={ctaHref} className="mt-4 inline-flex text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200">
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </div>
  )
}

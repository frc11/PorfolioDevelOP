'use client'

import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-black/10 px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/20">
        <Icon className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-lg font-medium text-zinc-200">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/40">{description}</p>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

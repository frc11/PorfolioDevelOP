'use client'

import type { ReactNode } from 'react'

type ChartCardProps = {
  title: string
  summary?: string
  children: ReactNode
}

export function ChartCard({ title, summary, children }: ChartCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold tracking-[0.02em] text-white">{title}</h4>
      </div>

      <div className="h-[320px]" role="img" aria-label={summary ?? title}>
        {children}
      </div>
    </article>
  )
}

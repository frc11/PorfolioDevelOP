'use client'

import type { ReactNode } from 'react'

type ChartCardProps = {
  title: string
  summary?: string
  children: ReactNode
}

export function ChartCard({ title, summary, children }: ChartCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform hover:scale-[1.015] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold tracking-[0.02em] text-white">{title}</h4>
      </div>

      <div className="h-[320px]" role="img" aria-label={summary ?? title}>
        {children}
      </div>
    </article>
  )
}

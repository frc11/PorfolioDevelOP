'use client'

import type { ReactNode } from 'react'

type ChartCardProps = {
  title: string
  children: ReactNode
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-[0.02em] text-white">{title}</h3>
      </div>

      <div className="h-[320px]">{children}</div>
    </article>
  )
}

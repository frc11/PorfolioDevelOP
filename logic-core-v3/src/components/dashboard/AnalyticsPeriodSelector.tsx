'use client'

import { useState } from 'react'

const PERIODS = ['7 días', '30 días', '90 días'] as const

export function AnalyticsPeriodSelector() {
  const [selected, setSelected] = useState<string>('30 días')

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1 backdrop-blur-sm">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => setSelected(p)}
          className={`rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
            selected === p
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
              : 'text-zinc-600 hover:text-zinc-400 border border-transparent'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

'use client'

import { useState, type ReactNode } from 'react'

type ClientDetailTab = 'overview' | 'projects' | 'support'

type ClientDetailPanelsProps = {
  overview: ReactNode
  projects: ReactNode
  support: ReactNode
}

const TABS: Array<{ key: ClientDetailTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'projects', label: 'Proyectos' },
  { key: 'support', label: 'Soporte' },
]

export function ClientDetailPanels({
  overview,
  projects,
  support,
}: ClientDetailPanelsProps) {
  const [activeTab, setActiveTab] = useState<ClientDetailTab>('overview')

  return (
    <>
      <div className="xl:hidden">
        <div className="flex items-stretch gap-1.5 rounded-2xl border border-white/10 bg-black/20 p-1 backdrop-blur-xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'flex-1 rounded-xl px-3 py-3 text-xs font-medium uppercase tracking-[0.2em] transition-colors',
                  isActive
                    ? 'border border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200',
                ].join(' ')}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="mt-5">
          {activeTab === 'overview' ? overview : null}
          {activeTab === 'projects' ? projects : null}
          {activeTab === 'support' ? support : null}
        </div>
      </div>

      <div className="hidden items-start gap-5 xl:grid xl:grid-cols-[1.15fr_1fr_0.95fr]">
        <div>{overview}</div>
        <div>{projects}</div>
        <div>{support}</div>
      </div>
    </>
  )
}

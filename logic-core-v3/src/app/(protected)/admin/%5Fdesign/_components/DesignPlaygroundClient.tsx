'use client'

import { useState } from 'react'
import { TokensSection } from './sections/TokensSection'
import { TypographySection } from './sections/TypographySection'
import { ButtonsSection } from './sections/ButtonsSection'
import { CardsSection } from './sections/CardsSection'
import { FormsSection } from './sections/FormsSection'
import { StatsSection } from './sections/StatsSection'
import { ModalsSection } from './sections/ModalsSection'
import { BadgesSection } from './sections/BadgesSection'
import { EmptyStatesSection } from './sections/EmptyStatesSection'
import { PatternsSection } from './sections/PatternsSection'

const SECTIONS = [
  { id: 'tokens', label: 'Tokens', component: TokensSection },
  { id: 'typography', label: 'Typography', component: TypographySection },
  { id: 'buttons', label: 'Buttons', component: ButtonsSection },
  { id: 'cards', label: 'Cards', component: CardsSection },
  { id: 'forms', label: 'Forms', component: FormsSection },
  { id: 'stats', label: 'Stats', component: StatsSection },
  { id: 'modals', label: 'Modals', component: ModalsSection },
  { id: 'badges', label: 'Badges', component: BadgesSection },
  { id: 'empty', label: 'Empty States', component: EmptyStatesSection },
  { id: 'patterns', label: 'Patterns', component: PatternsSection },
] as const

export function DesignPlaygroundClient() {
  const [active, setActive] = useState<(typeof SECTIONS)[number]['id']>('tokens')
  const ActiveSection = SECTIONS.find((section) => section.id === active)!.component

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <nav className="space-y-1 rounded-2xl border border-white/10 bg-white/[0.02] p-2">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActive(section.id)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                active === section.id
                  ? 'bg-cyan-400/15 text-cyan-300'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <main>
        <ActiveSection />
      </main>
    </div>
  )
}

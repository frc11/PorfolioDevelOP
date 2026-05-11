'use client'

import { TodoIncluidoFeatureCard } from './TodoIncluidoFeatureCard'
import { INCLUDED_FEATURES } from './data'

export function TodoIncluido() {
  const firstRow = INCLUDED_FEATURES.slice(0, 3)
  const secondRow = INCLUDED_FEATURES.slice(3)

  return (
    <section className="w-full py-24 md:py-36 px-6 md:px-10 lg:px-16 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 md:mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-4">
            TODO ESTO VIENE INCLUIDO EN TU PLAN
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            5 herramientas premium,{' '}
            <span className="text-zinc-400">sin extras.</span>
          </h2>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl">
            Cuando contratás develOP, te llevás todo el portal. No es un upsell. No es &quot;plan
            básico vs pro&quot;. Es lo que viene cuando trabajás con nosotros.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {firstRow.map((feature, i) => (
              <TodoIncluidoFeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:w-2/3 lg:mx-auto">
            {secondRow.map((feature, i) => (
              <TodoIncluidoFeatureCard key={feature.id} feature={feature} index={i + 3} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

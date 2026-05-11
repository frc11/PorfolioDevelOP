'use client'

import { getActiveModules, getComingSoonModules } from '@/lib/data/premium-modules'
import { ModuloActiveCard } from './ModuloActiveCard'
import { ModuloComingSoonCard } from './ModuloComingSoonCard'

export function ModulosOpcionales() {
  const activeModules = getActiveModules()
  const comingSoonModules = getComingSoonModules()

  return (
    <section className="w-full py-24 md:py-36 px-6 md:px-10 lg:px-16 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 md:mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-4">
            Y CUANDO ESTÉS LISTO
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Sumás módulos según lo que{' '}
            <span className="text-zinc-400">necesite tu negocio.</span>
          </h2>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl">
            No vendemos suites infladas. Empezás con lo esencial y escalás cuando los datos te
            digan que es momento. Cada módulo es opcional, mensual y cancelable.
          </p>
        </div>

        <div className="mb-16">
          <p className="text-[11px] font-bold tracking-[0.18em] text-zinc-500 uppercase mb-6">
            DISPONIBLES AHORA
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeModules.map((mod, i) => (
              <ModuloActiveCard key={mod.slug} module={mod} index={i} />
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.06] mb-16" />

        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-zinc-500 uppercase mb-6">
            PRÓXIMAMENTE Q3 2026
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {comingSoonModules.map((mod, i) => (
              <ModuloComingSoonCard key={mod.slug} module={mod} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

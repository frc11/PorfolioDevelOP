import { Users } from 'lucide-react'
import type { CategorySummary } from '@/modules/chatbot/lib/monthly-analysis'
import { CalibratingBlock } from './CalibratingBlock'

/**
 * P0.2 — "Qué pregunta tu gente". Top de temas de consulta de los últimos
 * 30 días (ventana canónica de tz-ar, la misma de la vista de contactos),
 * con proporciones en lenguaje de dueño ("4 de cada 10 consultas…").
 * Con menos de 10 consultas se degrada honesto: no se muestran proporciones
 * que no significan nada.
 */
export function CategoriesSection({ categories }: { categories: CategorySummary }) {
  const lead = categories.top[0]

  return (
    <section aria-labelledby="categorias-title">
      <h2 id="categorias-title" className="mb-1 text-base font-semibold text-zinc-100">
        Qué pregunta tu gente
      </h2>
      <p className="mb-4 text-xs text-zinc-500">
        Sobre qué consultaron en los últimos 30 días
      </p>

      {!categories.sufficient ? (
        <CalibratingBlock
          icon={Users}
          title="Todavía estamos juntando datos de este mes"
          description="Con unas conversaciones más vas a ver acá los temas que más pregunta tu gente y cuánto pesa cada uno."
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
          {lead && (
            <p className="mb-5 text-sm text-zinc-300">
              <span className="font-semibold text-white">
                {lead.outOf10} de cada 10 consultas
              </span>{' '}
              son {lead.phrase}
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {categories.top.map((entry) => {
              const pct = Math.round(entry.share * 100)
              return (
                <li key={entry.category}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-zinc-300">{entry.label}</span>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-cyan-400/80">
                      {entry.count.toLocaleString('es-AR')}{' '}
                      <span className="font-medium text-zinc-600">· {pct}%</span>
                    </span>
                  </div>
                  <div
                    className="h-1 w-full overflow-hidden rounded-full bg-white/[0.04]"
                    role="img"
                    aria-label={`${entry.label}: ${pct}% de las consultas`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500/80 to-cyan-400"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          <p className="mt-5 text-[11px] text-zinc-600">
            Sobre {categories.total.toLocaleString('es-AR')} consultas con datos de contacto
          </p>
        </div>
      )}
    </section>
  )
}

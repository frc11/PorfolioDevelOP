import { Archive, CalendarCheck2, MessageSquare, Send, type LucideIcon } from 'lucide-react'
import type { ProgresoSemana as ProgresoSemanaData } from '@/lib/leados/progreso'

type Item = { icon: LucideIcon; valor: number; label: string }

/**
 * Señal de avance del setter: acuse SOBRIO de lo que laburó en la ventana — sin
 * metas, sin ranking, sin comparación, sin racha. Solo lectura, no navega ni
 * filtra. Cuidado del bienestar del operador, por diseño:
 *   - se oculta entera cuando no hay nada que mostrar (setter nuevo ⇒ sin ceros
 *     que culpen);
 *   - muestra SOLO las métricas con valor (un "0 reuniones" no naguea: no aparece).
 */
export function ProgresoSemana({ progreso }: { progreso: ProgresoSemanaData }) {
  if (progreso.total === 0) return null

  const items: Item[] = [
    {
      icon: MessageSquare,
      valor: progreso.contactos,
      label: progreso.contactos === 1 ? 'contacto' : 'contactos',
    },
    {
      icon: Send,
      valor: progreso.demos,
      label: progreso.demos === 1 ? 'demo enviada' : 'demos enviadas',
    },
    {
      icon: CalendarCheck2,
      valor: progreso.reuniones,
      label: progreso.reuniones === 1 ? 'reunión agendada' : 'reuniones agendadas',
    },
    {
      // A-09: el descarte/pérdida honesta también es trabajo hecho — antes no
      // sumaba a ningún número de "Tu semana".
      icon: Archive,
      valor: progreso.archivados,
      label: progreso.archivados === 1 ? 'negocio filtrado o cerrado' : 'negocios filtrados o cerrados',
    },
  ].filter((item) => item.valor > 0)

  return (
    <section aria-label={`Tu avance de los últimos ${progreso.dias} días`} className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
        Tu semana
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-emerald-300/70" strokeWidth={1.5} aria-hidden />
              <span className="text-sm font-semibold tabular-nums text-zinc-100">{item.valor}</span>
              <span className="text-xs text-zinc-500">{item.label}</span>
            </div>
          )
        })}
        <span className="ml-auto text-[11px] text-zinc-600">últimos {progreso.dias} días</span>
      </div>
    </section>
  )
}

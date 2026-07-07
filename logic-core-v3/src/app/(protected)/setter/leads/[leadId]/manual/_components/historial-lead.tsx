import { History } from 'lucide-react'
import {
  LeadTimeline,
  type LeadTimelineEvent,
} from '../../_components/lead-timeline'

/**
 * 5.6 — El historial del lead al pie de TODA pantalla del manual (decisión del
 * corte: colapsable, siempre consultable, nunca compite con la instrucción
 * protagonista). Reusa `LeadTimeline` tal cual — la misma memoria del lead que
 * mostraba la página del wizard, con la distinción comercial / sistema intacta
 * (el evento SISTEMA no cuenta como contacto; lo gobierna otra lectura).
 */
export function HistorialDelLead({ events }: { events: LeadTimelineEvent[] }) {
  return (
    <details className="group rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <summary className="flex cursor-pointer items-center gap-2 p-4 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200">
        <History size={14} strokeWidth={1.5} aria-hidden className="shrink-0 text-zinc-500" />
        Ver historial del lead
        <span className="text-zinc-600">
          — {events.length === 0 ? 'sin movimientos' : `${events.length} movimiento${events.length === 1 ? '' : 's'}`}
        </span>
      </summary>
      <div className="px-4 pb-4">
        <LeadTimeline events={events} />
      </div>
    </details>
  )
}
